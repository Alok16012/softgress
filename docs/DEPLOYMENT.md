# Deployment: Vercel + Supabase (+ asset CDN)

## 1. Supabase

1. Create a project. Copy the **transaction pooler** connection string (port 6543) from
   *Project Settings → Database*.
2. Apply the schema from your machine:
   ```bash
   DATABASE_URL="postgres://…:6543/postgres" pnpm db:migrate
   ```
   This applies `supabase/migrations/*.sql` (tracked in `public._migrations`) and inserts the
   demo catalogue **only where rows are missing**. Review and replace seed content in `/admin`
   (Knowledge → every "demo seed" document; Services → pricing).
   Alternatively use the Supabase CLI: `supabase db push` (the SQL is CLI-compatible).
3. Security model: the app connects as the database owner from server code only. RLS is
   enabled on every table; `anon`/`authenticated` can read only active services, departments,
   staff, published projects and approved public knowledge. Never expose the service-role key
   or `DATABASE_URL` to the browser (nothing in this codebase does).
4. Retention: schedule `select public.purge_stale_sessions(30);` daily (pg_cron or an external
   cron) to drop abandoned anonymous session metadata.

## 2. Vercel

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooler URL |
| `SESSION_SECRET` | `openssl rand -base64 48` |
| `SITE_URL` | `https://your-domain` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_ROLE` | from `pnpm admin:hash` |
| `ANTHROPIC_API_KEY` | optional; without it guides stay in labelled demo mode |
| `AI_MODEL` | defaults to `claude-opus-5-5`; verify with `/api/health?model=1` |
| `CONTACT_EMAIL`, `WHATSAPP_NUMBER` | optional; CTAs appear only when set |
| `CALENDAR_PROVIDER` | `none` until a real calendar adapter is added |
| `NOTIFY_PROVIDER` | `none` until a real email/SMS adapter is added |

Build command `pnpm build`; output is standard Next.js. Route handlers run on the Node.js
runtime (needed for `postgres` and `node:crypto`).

**Production guards already in code:** PGlite refuses to run without
`ALLOW_PGLITE_IN_PRODUCTION`; the mock calendar and dev outbox are disabled; plaintext admin
passwords are ignored; `SESSION_SECRET` is required.

## 3. Scaling notes

- **Rate limiting** is in-memory per instance (`src/lib/security/rate-limit.ts`). On
  multi-instance/serverless deployments swap the store for Redis/Upstash behind the same
  `rateLimit(key, limit, windowMs)` function.
- **Catalogue cache** is per instance (30 s TTL, invalidated on admin edits in that instance).
- **Notifications & calendar:** implement `Notifier` (`src/lib/notify/adapter.ts`) and
  `CalendarAdapter` (`src/lib/calendar/adapter.ts`). A real calendar must reserve the slot with
  the provider *and* commit the DB row (unique index `consultations_confirmed_slot_uniq`)
  before the UI may say "confirmed".

## 4. Post-deploy checklist

- `GET /api/health` → `database.status: ok`, expected `ai.mode`, calendar/notify as intended.
- Submit a test request, check it in `/admin`, then delete or mark it lost.
- Confirm `/robots.txt` and `/sitemap.xml` use the production `SITE_URL`.
- Re-run `pnpm eval:ai` with the production key before enabling live AI.
