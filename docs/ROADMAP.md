# Known limitations & roadmap

## Honest status

| Area | Status |
|---|---|
| AI backend | No visitor-facing UI since the 3D tour was removed. Was verified end-to-end in **demo mode**. The live Anthropic path is implemented and unit-tested with a fake provider, but **has not been exercised against the real API here** (no key in this environment). Run `pnpm eval:ai` with a key before launch. |
| Leads, CRM, status lookup | Working and tested on PGlite and on Postgres over the wire protocol. Not yet run against a hosted Supabase project. |
| Calendar | Only `none` (pending confirmation) and a dev-only `mock`. No Google/Microsoft calendar adapter yet. |
| Notifications | Dev outbox only. No email/SMS/WhatsApp provider. |
| Rate limiting | In-memory per instance; needs Redis/Upstash for multi-instance production. |
| Payments | Out of scope (phase 2). No card data is ever collected. |

## Next steps (in priority order)

1. **Live AI validation:** add the key, run `pnpm eval:ai`, review transcripts for tone and
   grounding in all three languages, tune `AI_EFFORT`.
2. **Real content:** replace demo seed knowledge, publish prices where appropriate, add
   approved case studies with licensed media (`project_media`).
3. **Real calendar + email adapters** (Google Calendar / Cal.com, Resend/Postmark), keeping the
   "confirmed only after provider commit" rule.
4. **Real photography** for the department and work cards (replace `DeptArt`).
5. **Performance pass:** shader pre-compilation (`gl.compileAsync`), merge static geometry per
   zone, measure on a mid-range Android, set CI budgets (Lighthouse + custom FPS probe).
6. **Status-link by email** (signed one-time URL) once a mail provider exists.
7. **Distributed rate limiting** and an abuse dashboard; token-spend alerts.
8. **Multi-tenant** (`tenant_id` + RLS) if Softgress wants to white-label the HQ for clients.
9. Optional voice (TTS/STT) only as a later, consented enhancement; V1 is text-only by design.
