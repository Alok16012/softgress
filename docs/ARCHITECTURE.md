# Softgress Virtual HQ — Architecture Decision Record

> **Superseded in part (2026-10-14):** the 3D virtual-office tour, its HUD, the Remotion
> cinematics and their tests were removed. Sections about the tour, scenes, camera rails and
> the intro clip are historical; the site is now a server-rendered marketing site.

Status: accepted (Phase 1). Last updated: 2026-10-11.

## 1. Context

The repository was empty. Environment found during inspection:

| Tool | Version | Notes |
|---|---|---|
| Node | 26.7 | |
| pnpm | 10.34 | package manager |
| Next.js | 16.4 | App Router, Turbopack, **Cache Components on** |
| Supabase CLI | present | **Docker absent** → no local Supabase stack |
| Anthropic credentials | none for the app | demo mode required |

## 2. Decisions

### ADR-01 — One Next.js app, pnpm workspace with a separate Remotion package
`/` is the Next.js app; `/remotion` is an isolated workspace for authored cinematics. Remotion never runs per visitor — it renders MP4/WebM files into `public/media/` ahead of time.

### ADR-02 — Real-time world: React Three Fiber + Drei, GSAP camera rails
- One persistent `<Canvas>` holds the whole campus. Zones mount and unmount based on the current and adjacent scenes, which keeps draw calls bounded.
- Camera moves are **GSAP-driven progress along a Catmull-Rom rail** through doorway waypoints, so the camera never clips through walls. When the camera is idle, Drei `CameraControls` gives constrained look-around (limited azimuth/polar/dolly).
- Geometry is a **procedural blockout**, labelled as such in the asset manifest. Production GLB assets replace modules zone by zone (`docs/ASSETS.md`).

### ADR-03 — Deterministic tour state machine
`src/lib/tour/machine.ts` is a pure reducer `(state, event) → state`. Phases: `intro | entry | idle | transit | dialogue | panel`. Navigation events received during `transit` replace the pending target rather than starting a second animation. Every UI surface (3D hotspots, 2D nav, keyboard, URL/back-forward) dispatches the same events.

### ADR-04 — Database: SQL-first, two drivers, one repository
- Schema lives in `supabase/migrations/*.sql`. It is Supabase-compatible: RLS, `anon`/`authenticated`/`service_role` roles, safe public views.
- **Demo/local:** embedded **PGlite**, which is real Postgres compiled to WASM, persisted at `.data/pglite`. The same migrations and RLS policies run there, so constraints, transactions and RLS get tested without Docker.
- **Production:** `DATABASE_URL` (the Supabase Postgres connection string) through `postgres.js`, server-only. The browser never talks to the database directly. Anonymous Supabase API keys hit RLS policies that deny every private table.
- A single `Repository` holds all SQL, so both drivers run identical queries.

### ADR-05 — AI staff: provider abstraction, grounded retrieval, model never mutates state
- `AiProvider` interface with two implementations:
  - `AnthropicProvider` (official `@anthropic-ai/sdk`, streaming). Model comes from `AI_MODEL`, defaulting to `claude-opus-5-5`, which is the model selected in the operator's Claude Code session. `/api/health` checks availability live through the Models API rather than assuming it.
  - `DemoProvider`, which is **not an LLM**. It assembles answers from retrieved approved snippets, and the UI labels it as demo mode.
- Retrieval: BM25 over **approved** `knowledge_documents`, filtered per department, plus Hindi/Hinglish synonym normalisation.
- The model can only *suggest* brief fields through a strict `suggest_brief_update` tool. Suggestions are Zod-validated server-side and shown to the visitor, who has to accept them. Leads, bookings and CRM rows are written only by deterministic API routes after explicit consent.
- Guardrails: prompt-injection heuristics, a system prompt with a no-fabrication policy, catalogue-only pricing ("Custom quote required"), per-IP/session rate limits, history/token caps, timeouts, and safe error events.

### ADR-06 — Privacy-first conversations
Chat history lives in the visitor's `sessionStorage`. The server stores only **metadata** (department, counts, timestamps). A transcript is stored only if the visitor ticks "attach my conversation" when submitting. "Reset session" wipes local state and deletes the server draft. Logs never contain message bodies.

### ADR-07 — Bookings are honest
`CalendarAdapter`: `none` (default) → the visitor submits a *preferred time*, saved as `pending_confirmation`. `mock` (development only, visibly badged) → a slot list with transactional reservation (unique slot index + idempotency key). A real provider adapter goes behind the same interface. The UI says "confirmed" only when the adapter returns a committed reservation.

### ADR-08 — Admin auth
Signed (HMAC-SHA256) httpOnly session cookie with `owner | manager | viewer` roles. Credentials come from env vars (scrypt hash in production; a plaintext demo password is allowed only outside production). Every admin mutation writes `audit_logs`.

### ADR-09 — Accessibility & SEO parity
Every page is server-rendered semantic HTML: services, departments, work, contact, status. The 3D tour is an enhancement mounted on the home page. Below it the full directory renders as normal HTML, and a 2D navigator replaces WebGL on weak or unsupported devices or when the visitor chooses it.

## 3. Sitemap

```
/                         Tour (3D) + semantic company overview
/services                 Service catalogue (SSR)
/services/[slug]          Service detail + Request quote
/departments/[slug]       Department page (staff guide, services)
/work                     Case studies (explicitly labelled samples until real ones are approved)
/contact                  Project brief + quote / consultation / callback (2D)
/status                   Request status with one-time code
/privacy                  Privacy notice
/admin                    CRM (login, inbox, kanban, lead detail, services, knowledge, audit)
/api/chat                 SSE streaming staff chat
/api/leads                Submit request (quote/consultation/callback/brief)
/api/consultations/slots  Availability (only from configured calendar)
/api/status/*             request-code / verify
/api/session              DELETE → privacy reset
/api/health               Mode / config report (no secrets)
```

## 4. Scene graph

```
Canvas
├─ Environment (sky, sun, lightformers, fog)         time-of-day: day | sunset
├─ Campus (always mounted, LOD-reduced when inside)
│  ├─ Road + traffic loop (instanced cars)  · Sidewalk + walkers
│  ├─ Landscaping (instanced trees, hedges, lamps)  · Parking
│  └─ HQ Building shell (glass curtain wall, concrete, signage, sliding doors)
├─ Zone: reception      (desk, seating, directory, AI receptionist)
├─ Zone: software       (desk clusters, code monitors, design review, AI consultant)
├─ Zone: marketing      (command wall, analyst desks, AI strategist)
├─ Zone: creative       (photo set, lights, editing bays, brand wall, AI creative lead)
├─ Zone: automation     (workflow wall, lab benches, AI automation consultant)
├─ Zone: strategy       (boardroom, gallery screen, AI project strategist)
└─ Zone: rooftop        (terrace, planters, sunset, finale CTA)
CameraRig (GSAP rail ↔ CameraControls)   Hotspots (staff, screens, doors, signs)
```

Floor plan (metres, +z toward the road, building entrance at z = 0):

```
            z=0  ┌──────── entrance ────────┐
 marketing  │    │        reception          │   software
 x -30..-10 │    │       x -10..10           │   x 10..30
 z -20..0   │    │       z -14..0            │   z -20..0
            ├────┴──── corridor z -26..-14 ──┴────┤
 creative   │        strategy boardroom       │ automation
 z -40..-20 │        x -10..10, z -40..-26    │ z -40..-20
            └─────────────────────────────────┘   rooftop terrace y = 9
```

## 5. File structure

```
src/app/…                 routes (see sitemap)
src/components/tour/      Canvas, zones, CameraRig, Hotspot, Character, textures
src/components/ui/        Entry modal, nav, mini-map, chat drawer, brief editor, forms…
src/components/admin/     CRM components
src/content/              Seed content (departments, services, staff, knowledge, sample work)
src/lib/tour/             scenes.ts (graph + camera poses), machine.ts (reducer)
src/lib/ai/               provider interface, anthropic, demo, retrieval, prompts, guardrails
src/lib/db/               driver (pglite | postgres), repository, migrate, seed
src/lib/leads/            schemas, submission service, reference codes
src/lib/calendar/         adapters (none | mock)
src/lib/notify/           adapters (console outbox | none)
src/lib/security/         rate limit, origin check, sanitize, admin session, hashing
src/stores/               zustand stores (tour, chat, brief, prefs)
supabase/migrations/      SQL schema + RLS
remotion/                 compositions + render scripts
tests/unit · tests/integration · tests/e2e
docs/                     this file, STORYBOARD, ASSETS, DEPLOYMENT, TEST_REPORT, ROADMAP
```

## 6. Risks

| Risk | Mitigation |
|---|---|
| Procedural blockout reads as "game-like" | Physically based materials, AO, soft shadows, real proportions; GLB swap path documented |
| Low-end GPUs | Quality presets, adaptive DPR (`PerformanceMonitor`), zone culling, 2D navigator fallback |
| LLM hallucinating prices or clients | Catalogue-only pricing, approved-docs-only retrieval, refusal policy, eval fixtures |
| PGlite is single-process | Local/demo only; refused in production unless explicitly allowed |
| No real calendar or email provider | Honest pending states, dev outbox, adapters documented |
