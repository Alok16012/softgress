# Softgress

Marketing website for Softgress, a digital marketing & software development agency, styled
after apexon.com (dark navy + white sections, pale-blue pill buttons, Arial/Roboto). Visitors
browse the Software, Marketing, Creative, AI & Automation and Strategy departments and every
service, then submit quote, consultation, callback or brief requests that land in a secure CRM.

> **What's real vs placeholder.** Card artwork is generated in code (night sky + mountains +
> icon) until real photography is supplied (`src/components/site/Art.tsx`). Seed knowledge,
> services and "work" are **demo seed content** to review before launch. Sample projects are
> always labelled "Sample concept". The original 3D virtual-office tour was removed; it is in
> git history (commit `b0a3b08`) if it is ever needed again.

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

Then sign in at `/admin`.

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

## How it fits together

- **Site:** server-rendered pages in `src/app` with shared chrome in `src/components/site`
  (header, footer, page hero, card art). Theme tokens live in `src/app/globals.css`.
- **AI backend (no UI at the moment):** `src/lib/ai` and `/api/chat` remain from the tour's AI
  guides. Retrieval over approved knowledge + catalogue, guardrails, Anthropic and demo
  providers. Set `ANTHROPIC_API_KEY` for live replies (`/api/health?model=1`).
- **Requests & CRM:** `src/lib/leads`, `src/app/api/*`, `src/app/admin`. Zod validation,
  honeypot + time trap, rate limits, idempotency keys, reference codes, verified status
  lookup, consultation booking that is confirmed only by a connected calendar.
- **Data:** `supabase/migrations` (RLS: anonymous clients can read only the active catalogue).
  PGlite locally, Postgres/Supabase via `DATABASE_URL` in production.
- **Accessibility & SEO:** every service/department is server-rendered HTML with JSON-LD,
  a skip link, visible focus rings and reduced-motion support.

More: [Architecture](docs/ARCHITECTURE.md) · [Deployment](docs/DEPLOYMENT.md) · [Test report](docs/TEST_REPORT.md) ·
[Assumptions](docs/ASSUMPTIONS.md) · [Limitations & roadmap](docs/ROADMAP.md)
