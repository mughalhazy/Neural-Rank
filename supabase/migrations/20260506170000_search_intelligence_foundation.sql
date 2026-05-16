create table if not exists app_public.search_intelligence_queries (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  normalized_query text not null,
  location text,
  language text,
  created_at timestamptz not null default now()
);

create index if not exists search_intelligence_queries_normalized_idx
  on app_public.search_intelligence_queries(normalized_query);

create table if not exists app_public.search_intelligence_intents (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references app_public.search_intelligence_queries(id) on delete cascade,
  intent_type text not null check (intent_type in ('informational', 'navigational', 'commercial', 'transactional', 'local', 'comparison', 'investigative')),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  rationale text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists app_public.search_intelligence_serp_observations (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references app_public.search_intelligence_queries(id) on delete cascade,
  provider_key text not null,
  availability_status text not null check (availability_status in ('available', 'provider_unavailable')),
  ai_overview_detected boolean,
  featured_snippet_detected boolean,
  local_intent_detected boolean,
  raw_payload jsonb,
  observed_at timestamptz not null default now()
);

create table if not exists app_public.search_intelligence_opportunity_scores (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references app_public.search_intelligence_queries(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  factors jsonb not null default '[]'::jsonb,
  rationale text not null default '',
  created_at timestamptz not null default now()
);
