# Softgress Virtual HQ

An interactive, cinematic virtual tour of the Softgress headquarters (digital marketing &
software development agency). Visitors walk from the access road into reception, through
Software, Marketing, Creative, AI & Automation and the Strategy boardroom up to a sunset
rooftop. Along the way they chat with **AI guides** (clearly labelled as AI), build an editable
project brief, and submit quote, consultation, callback or brief requests that land in a
secure CRM.

> **What's real vs placeholder.** The 3D world is a **procedural blockout** (no licensed
> models yet); see [docs/ASSETS.md](docs/ASSETS.md). Without an `ANTHROPIC_API_KEY` the
> guides run in a **demo mode** that is labelled in the UI. Seed knowledge, services and
> "work" are **demo seed content** to review before launch. Sample projects are always labelled
> "Sample concept".

## Quick start (local demo, no accounts needed)

```bash
pnpm install
cp .env.example .env.local   # optional: everything has a safe default
pnpm dev                     # http://localhost:3000
```

The first request creates an embedded Postgres (PGlite) at `.data/pglite`, applies
`supabase/migrations/*.sql` and seeds the demo catalogue.

Useful local settings in `.env.local`:

```
CALENDAR_PROVIDER=mock        # development slot picker (badged "development only")
NOTIFY_PROVIDER=console       # codes/confirmations appear at /dev/outbox
ADMIN_EMAIL=admin@softgress.local
ADMIN_PASSWORD=...            # dev only; production needs ADMIN_PASSWORD_HASH
```

Then sign in at `/admin`. To use live Claude replies, set `ANTHROPIC_API_KEY` (the model
defaults to `claude-opus-5-5`; check `/api/health?model=1`).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js 16 (Turbopack) |
| `pnpm lint` · `pnpm typecheck` | ESLint · TypeScript strict |
| `pnpm test` | Vitest: unit + integration (PGlite, Postgres wire driver, RLS) |
| `pnpm test:e2e` | Playwright against an isolated dev server on :3100 |
| `pnpm eval:ai` | EN/HI/Hinglish AI evals (live Claude if a key is set, else demo) |
| `pnpm db:migrate` | Apply migrations + seed to `DATABASE_URL` |
| `pnpm admin:hash` | Create an scrypt hash for `ADMIN_PASSWORD_HASH` |
| `pnpm --filter remotion studio` | Open the cinematic compositions |
| `pnpm media:render` | Render the intro clip and publish it to `public/media` |

## How it fits together

- **Tour:** React Three Fiber + Drei world (`src/components/tour`), GSAP camera rails through
  doorway waypoints, and a pure state machine (`src/lib/tour/machine.ts`) shared by 3D
  hotspots, the 2D navigator, keyboard shortcuts and browser back/forward.
- **AI guides:** `src/lib/ai`. Retrieval over approved knowledge + catalogue, guardrails,
  Anthropic streaming provider, labelled demo provider. Models can only *suggest* brief
  fields or a department; visitors accept, and only deterministic API routes write data.
- **Requests & CRM:** `src/lib/leads`, `src/app/api/*`, `src/app/admin`. Zod validation,
  honeypot + time trap, rate limits, idempotency keys, reference codes, verified status
  lookup, consultation booking that is confirmed only by a connected calendar.
- **Data:** `supabase/migrations` (RLS: anonymous clients can read only the active catalogue).
  PGlite locally, Postgres/Supabase via `DATABASE_URL` in production.
- **Accessibility & SEO:** every service/department is server-rendered HTML; a 2D navigator
  replaces WebGL on weak devices; captions, reduced motion, keyboard-only operation.

More: [Architecture](docs/ARCHITECTURE.md) · [Storyboard](docs/STORYBOARD.md) ·
[Assets](docs/ASSETS.md) · [Deployment](docs/DEPLOYMENT.md) · [Test report](docs/TEST_REPORT.md) ·
[Assumptions](docs/ASSUMPTIONS.md) · [Limitations & roadmap](docs/ROADMAP.md)
