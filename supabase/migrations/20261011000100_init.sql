-- Softgress Virtual HQ — initial schema
-- Supabase-compatible: relies on the standard roles anon / authenticated / service_role.
-- All private data is accessed only by trusted server code (service role or the
-- database owner via DATABASE_URL). Anonymous clients can read only safe catalogue views.

-- gen_random_uuid() is built into Postgres 13+ (Supabase runs 15+); no extension needed.

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Catalogue / content
-- ─────────────────────────────────────────────────────────────
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  short_name text not null,
  description text not null default '',
  scene_id text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  summary text not null default '',
  description text not null default '',
  deliverables jsonb not null default '[]'::jsonb,
  process jsonb not null default '[]'::jsonb,
  what_we_need jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  pricing_type text not null default 'custom' check (pricing_type in ('custom', 'starting_at', 'fixed')),
  starting_price numeric(12, 2),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A price may only exist when it is explicitly published; "custom" never carries one.
  constraint services_price_consistency check (
    (pricing_type = 'custom' and starting_price is null)
    or (pricing_type <> 'custom' and starting_price is not null and starting_price > 0)
  )
);
create index services_department_idx on public.services(department_id);

create table public.virtual_staff (
  id text primary key,
  department_id uuid not null references public.departments(id) on delete restrict,
  display_name text not null,
  role_title text not null,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_documents (
  id text primary key,
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  body text not null,
  visibility text not null default 'public' check (visibility in ('public', 'internal')),
  approved_at timestamptz,
  approved_by uuid,
  version integer not null default 1 check (version > 0),
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index knowledge_department_idx on public.knowledge_documents(department_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  summary text not null default '',
  body text not null default '',
  industry text not null default '',
  service_slugs text[] not null default '{}',
  is_sample boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'demo_url')),
  url text not null,
  alt text not null default '',
  license_note text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.asset_manifest (
  id text primary key,
  zone text not null,
  name text not null,
  kind text not null,
  status text not null check (status in ('procedural_placeholder', 'licensed', 'original', 'pending')),
  source text not null default '',
  license text not null default '',
  url text,
  triangle_budget integer,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Visitors, conversations (metadata-first)
-- ─────────────────────────────────────────────────────────────
create table public.visitor_sessions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  consent_state jsonb not null default '{}'::jsonb,
  locale text
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.visitor_sessions(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  staff_id text,
  status text not null default 'open' check (status in ('open', 'closed', 'attached')),
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, staff_id)
);

-- Message bodies are stored ONLY when a visitor attaches the transcript to a request.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 4000),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

create table public.lead_drafts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.visitor_sessions(id) on delete cascade,
  requirements_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Leads & requests
-- ─────────────────────────────────────────────────────────────
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or phone ~ '^\+?[0-9]{7,15}$'),
  preferred_channel text not null default 'email' check (preferred_channel in ('email', 'phone', 'whatsapp')),
  company text,
  source text not null default 'virtual_tour',
  status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'proposal', 'won', 'lost')),
  department_id uuid references public.departments(id) on delete set null,
  session_id uuid references public.visitor_sessions(id) on delete set null,
  possible_duplicate_of uuid references public.leads(id) on delete set null,
  locale text,
  contact_consent_at timestamptz not null,
  marketing_consent_at timestamptz,
  ai_summary text,
  ai_next_action text,
  ai_summary_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_contact_required check (email is not null or phone is not null)
);
create index leads_status_idx on public.leads(status, created_at desc);
create index leads_email_idx on public.leads(lower(email));
create index leads_phone_idx on public.leads(phone);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  kind text not null check (kind in ('quote', 'consultation', 'callback', 'brief')),
  brief_json jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'proposal_sent', 'closed')),
  reference_code text not null unique check (reference_code ~ '^SG-[0-9A-Z]{4}-[0-9A-Z]{4}$'),
  idempotency_key text not null unique check (char_length(idempotency_key) between 16 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_requests_lead_idx on public.service_requests(lead_id);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  start_at timestamptz,
  end_at timestamptz,
  timezone text not null,
  preferred_window jsonb,
  status text not null check (status in ('pending_confirmation', 'confirmed', 'cancelled', 'completed')),
  provider text not null default 'none',
  provider_event_id text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultations_confirmed_has_slot check (
    status <> 'confirmed' or (start_at is not null and end_at is not null and end_at > start_at)
  )
);
-- One consultation room/calendar: a slot can be confirmed only once (concurrency guard).
create unique index consultations_confirmed_slot_uniq
  on public.consultations(provider, start_at) where status = 'confirmed';

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null check (type in ('created', 'status_changed', 'note', 'task', 'task_done', 'brief_edited', 'summary_generated', 'consultation_updated', 'notification')),
  metadata_json jsonb not null default '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz not null default now()
);
create index lead_events_lead_idx on public.lead_events(lead_id, created_at desc);

-- One-time codes for visitor status lookup (hash only, short expiry, attempt cap).
create table public.contact_verifications (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  channel text not null check (channel in ('email', 'phone')),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index contact_verifications_request_idx on public.contact_verifications(service_request_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Admin & audit
-- ─────────────────────────────────────────────────────────────
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('owner', 'manager', 'viewer')),
  display_name text not null default '',
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['departments','services','virtual_staff','knowledge_documents','projects',
                           'conversations','leads','service_requests','consultations']
  loop
    execute format('create trigger %I_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['departments','services','virtual_staff','knowledge_documents','projects',
                           'project_media','site_settings','asset_manifest','visitor_sessions',
                           'conversations','messages','lead_drafts','leads','service_requests',
                           'consultations','lead_events','contact_verifications','admin_users','audit_logs']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Public catalogue: read-only, active/published rows only.
grant select on public.departments, public.services, public.projects, public.project_media,
                public.virtual_staff, public.knowledge_documents to anon, authenticated;

create policy departments_public_read on public.departments
  for select to anon, authenticated using (active);
create policy services_public_read on public.services
  for select to anon, authenticated using (active);
create policy staff_public_read on public.virtual_staff
  for select to anon, authenticated using (active);
create policy projects_public_read on public.projects
  for select to anon, authenticated using (published);
create policy project_media_public_read on public.project_media
  for select to anon, authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and p.published)
  );
create policy knowledge_public_read on public.knowledge_documents
  for select to anon, authenticated using (visibility = 'public' and approved_at is not null);

-- No policies exist for leads, service_requests, consultations, messages, conversations,
-- lead_drafts, visitor_sessions, lead_events, contact_verifications, admin_users,
-- audit_logs, site_settings or asset_manifest: with RLS enabled and privileges revoked,
-- anon/authenticated can neither read nor write them. Only service_role (bypassrls)
-- and the owner connection used by trusted server routes can.

-- Safe public view (security_invoker so the caller's RLS applies).
create view public.public_services with (security_invoker = true) as
  select s.slug, s.title, s.summary, s.description, s.deliverables, s.process, s.what_we_need,
         s.pricing_type, s.starting_price, s.currency, d.slug as department_slug
  from public.services s join public.departments d on d.id = s.department_id
  where s.active and d.active;
grant select on public.public_services to anon, authenticated;

-- Retention helper: purge abandoned anonymous sessions (and their drafts/conversation
-- metadata via cascade) older than N days. Schedule with pg_cron or an external job.
create or replace function public.purge_stale_sessions(max_age_days integer default 30)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.visitor_sessions s
  where s.last_seen_at < now() - make_interval(days => max_age_days)
    and not exists (select 1 from public.leads l where l.session_id = s.id);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.purge_stale_sessions(integer) from public, anon, authenticated;
