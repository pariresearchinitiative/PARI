-- PARI V1 schema. Safe to re-run on a fresh project.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table if not exists papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors jsonb default '[]'::jsonb,
  abstract text,
  doi text unique,
  source_url text,
  publication_date date,
  field text,
  keywords text[] default '{}',
  raw_text text,
  venue text,
  openalex_id text unique,
  status text not null default 'discovered',
  importance_score numeric,
  ai_confidence numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references papers(id) on delete cascade,
  research_question text,
  methodology text,
  findings jsonb default '[]'::jsonb,
  key_findings jsonb default '[]'::jsonb,
  limitations jsonb default '[]'::jsonb,
  evidence jsonb default '[]'::jsonb,
  evidence_notes jsonb default '[]'::jsonb,
  why_it_matters text,
  novelty_score numeric,
  importance_score numeric,
  confidence_score numeric,
  confidence numeric,
  verifier_status text default 'pending',
  verifier_notes jsonb default '[]'::jsonb,
  citation_status text default 'unchecked',
  created_at timestamptz not null default now()
);

create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references papers(id) on delete cascade,
  title text,
  slug text unique,
  summary text,
  content jsonb,
  category text,
  read_time integer,
  seo jsonb default '{}'::jsonb,
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists review_queue (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references papers(id) on delete cascade,
  brief_id uuid references briefs(id) on delete cascade,
  state text not null default 'pending',
  reviewer_note text,
  change_request text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'viewer',
  created_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  status text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Later-ready (unused in V1 UI, reserved so the model can grow)
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists researchers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  orcid text,
  affiliation text,
  created_at timestamptz not null default now()
);

create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ror_id text,
  country text,
  created_at timestamptz not null default now()
);

create table if not exists citations (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references papers(id) on delete cascade,
  cited_doi text,
  cited_title text,
  created_at timestamptz not null default now()
);

create table if not exists related_papers (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references papers(id) on delete cascade,
  related_paper_id uuid references papers(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  brief_id uuid references briefs(id) on delete set null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists saved_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  brief_id uuid references briefs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, brief_id)
);

-- Additive columns for existing installs
alter table papers add column if not exists venue text;
alter table papers add column if not exists openalex_id text;
alter table analyses add column if not exists findings jsonb default '[]'::jsonb;
alter table analyses add column if not exists evidence jsonb default '[]'::jsonb;
alter table analyses add column if not exists novelty_score numeric;
alter table analyses add column if not exists confidence_score numeric;
alter table analyses add column if not exists citation_status text default 'unchecked';
alter table briefs add column if not exists seo_title text;
alter table briefs add column if not exists seo_description text;
alter table review_queue add column if not exists change_request text;

create unique index if not exists papers_openalex_id_key on papers(openalex_id) where openalex_id is not null;
create index if not exists briefs_status_idx on briefs(status);
create index if not exists briefs_category_idx on briefs(category);
create index if not exists review_queue_state_idx on review_queue(state);
create index if not exists papers_status_idx on papers(status);

-- ---------------------------------------------------------------------------
-- Auth helper: keep public.users in sync with auth.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Service role (server/cron/admin APIs) bypasses RLS.
-- Anon/authenticated clients only see published briefs and can subscribe.
-- ---------------------------------------------------------------------------
alter table papers enable row level security;
alter table analyses enable row level security;
alter table briefs enable row level security;
alter table review_queue enable row level security;
alter table users enable row level security;
alter table newsletter_subscribers enable row level security;
alter table pipeline_runs enable row level security;
alter table topics enable row level security;
alter table researchers enable row level security;
alter table institutions enable row level security;
alter table citations enable row level security;
alter table related_papers enable row level security;
alter table analytics_events enable row level security;
alter table saved_research enable row level security;

drop policy if exists "published briefs public" on briefs;
create policy "published briefs public" on briefs
  for select using (status = 'published');

drop policy if exists "published papers public" on papers;
create policy "published papers public" on papers
  for select using (
    exists (
      select 1 from briefs b
      where b.paper_id = papers.id and b.status = 'published'
    )
  );

drop policy if exists "published analyses public" on analyses;
create policy "published analyses public" on analyses
  for select using (
    exists (
      select 1 from briefs b
      where b.paper_id = analyses.paper_id and b.status = 'published'
    )
  );

drop policy if exists "newsletter insert" on newsletter_subscribers;
create policy "newsletter insert" on newsletter_subscribers
  for insert with check (true);

drop policy if exists "users read self" on users;
create policy "users read self" on users
  for select using (auth.uid() = id);

drop policy if exists "topics public" on topics;
create policy "topics public" on topics
  for select using (true);
