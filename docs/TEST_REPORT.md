# Test report

Run on 2026-10-11, macOS (Apple Silicon), Node 26.7, Next.js 16.4, Chromium (Playwright 1.64).
All numbers below come from the final runs; nothing is estimated.

| Check | Command | Result |
|---|---|---|
| Lint | `pnpm lint` | 0 errors, 0 warnings |
| Types | `pnpm typecheck` | 0 errors (strict) |
| Unit + integration | `pnpm test` | **101 / 101 passed** (6 files) |
| E2E | `pnpm test:e2e` | **37 / 37 passed** (36 desktop + 1 mobile, 2.5 min) |
| AI evals (demo provider) | `pnpm eval:ai` | **12 / 12 passed** |
| Production build | `pnpm build` | passed; public pages are partial-prerendered |
| Cinematic render | `pnpm --filter remotion render:intro` | `intro.mp4` 1440×810, 9 s, 2.0 MB |

## Coverage map (spec → tests)

| Requirement | Where |
|---|---|
| Tour state machine, queued navigation, stale-arrival guard, panels/dialogue return | `tests/unit/tour-machine.test.ts` |
| Scene graph routes through doorways; every guide bound to a hotspot | same |
| Migrations idempotent, RLS denies anon/authenticated on every private table, catalogue visible | `tests/integration/db.test.ts` |
| Price consistency constraint, contact-required constraint | same |
| One lead + one request, department assignment, idempotent replay, duplicate flagging (no merge) | same + `security-leads.test.ts` + E2E `leads.spec.ts` |
| Slot confirmed once under concurrency; preferred time → pending; no calendar → refused | `db.test.ts`, `security-leads.test.ts`, E2E |
| Status lookup: hash-only codes, single use, attempt cap, no enumeration | `db.test.ts`, E2E `status lookup…` |
| Postgres driver over the real wire protocol (caught a jsonb double-encoding bug) | `tests/integration/postgres-driver.test.ts` |
| Language detection, Hinglish retrieval, per-department filters, unapproved docs excluded | `tests/unit/ai.test.ts` |
| Prompt-injection detection, sensitive-data redaction before the provider, output scanning | `ai.test.ts`, `chat-admin.test.ts` |
| EN/HI/Hinglish evals: no invented prices, no guarantees, out-of-catalogue honesty, AI identity, sample-work honesty | `tests/fixtures/ai-evals.ts` |
| Chat service: stream order, refusals, provider errors, metadata-only storage | `chat-admin.test.ts` |
| Admin auth: scrypt, signed cookie tamper rejection, role permissions | `chat-admin.test.ts`, E2E `security-admin.spec.ts` |
| CSRF origin checks, rate limits, payload validation, health has no secrets | E2E `security-admin.spec.ts` |
| Guided/free/direct modes, captions, keyboard, map, back/forward, deep links, reload | E2E `tour.spec.ts` |
| Chat: Hinglish routing, brief suggestion accept, handoff consent, persistence across departments, network failure + retry, 429 shown, XSS-safe, privacy reset | E2E `chat.spec.ts` |
| Mobile 2D navigator, reduced motion, 3D canvas smoke (WebGL), SSR SEO, sitemap/robots | E2E `tour.spec.ts`, `seo-3d.spec.ts` |
| Published price flows CMS → site; custom never shows an amount | E2E `security-admin.spec.ts` |

## Bugs the tests found (and fixes)

1. **postgres.js double-encoded jsonb parameters** (the PGlite path hid it). Fixed with
   `$n::text::jsonb` casts.
2. **Stream writes after client disconnect** (`ERR_INVALID_STATE`) in `/api/chat`. Fixed by
   tracking cancellation and aborting the model call.
3. **Empty `messages` returned 500** instead of 422. Fixed refinement guards.
4. **Deep links left the camera at the wrong pose** (JUMP before the canvas mounted). Fixed
   by settling to the current state on mount and on JUMP.
5. **GSAP lag smoothing stretched camera rails to minutes on slow GPUs.** Disabled so moves
   finish in wall-clock time.
6. **Dev server reload loop on every DB write** (Turbopack traced the whole project via a
   dynamic `readdir`). Fixed with `turbopackIgnore` on runtime fs paths.
7. **Focus stranded after the intro overlay unmounted.** Focus now moves to the tour region.
8. **No-GPU devices froze in 3D.** Software renderers are detected and default to the 2D
   navigator at low quality.

## Not yet measured / not covered

- Live Anthropic API calls (no key in this environment). The provider is covered by fake
  provider tests and the eval runner is ready for a live run.
- Hosted Supabase (tested against Postgres via the wire protocol instead).
- FPS, GPU memory, draw calls and transfer size on mid-range phones; Lighthouse. See
  `docs/ROADMAP.md`.
- Visual regression baselines (Playwright screenshots exist only for failures).
