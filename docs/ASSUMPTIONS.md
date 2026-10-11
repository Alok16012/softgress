# Documented assumptions

The brief didn't include these details, so the build makes the following assumptions. Each
one is easy to change.

| Topic | Assumption | Where to change |
|---|---|---|
| Market | India-first: INR budget buckets (₹1 lakh… ₹25 lakh+), `Asia/Kolkata` calendar time zone, Hindi/Hinglish support | `src/lib/types.ts` (`BUDGET_LABELS`), `CALENDAR_TIMEZONE` |
| Brand copy | Tagline "Ideas engineered. Growth accelerated." plus department/service descriptions written for this build | `src/content/*` → seeded to DB → edit in `/admin` |
| Prices | **None published.** Every service is "Custom quote required" until an owner publishes a price | `/admin/services` |
| Company facts | Founding year, team size, address, certifications, awards and clients are **not stated anywhere**; guides say they don't have that information | `/admin/knowledge` |
| Portfolio | Four **sample concepts**, always labelled; no client names or results | `projects` table |
| AI guides | Six synthetic characters (Aanya, Kabir, Meera, Rohan, Ira, Dev), always labelled "AI guide" | `src/content/staff.ts` |
| Contact channels | No email/WhatsApp shown until `CONTACT_EMAIL` / `WHATSAPP_NUMBER` are set; the request form is the primary channel | `.env` |
| Calendar | No real calendar. Production saves preferred times as *pending confirmation* | `CalendarAdapter` |
| Email/SMS | No provider. Development uses the `/dev/outbox` | `Notifier` |
| AI model | `claude-opus-5-5` (the model selected for this session), configurable and checked live via `/api/health?model=1` | `AI_MODEL` |
| Multi-tenancy | Single tenant; no `tenant_id` columns yet | migration roadmap |
| Legal | Privacy notice is a template for counsel to review | `/privacy` |
