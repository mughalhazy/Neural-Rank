create schema if not exists app_public;

create extension if not exists pgcrypto with schema public;

create or replace function app_public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists app_public.backend_module_catalog (
  module_key text primary key,
  display_name text not null,
  initial_state text not null check (initial_state in ('mvp_active', 'built_inactive')),
  is_workflow_module boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app_public.backend_module_activation_defaults (
  module_key text primary key references app_public.backend_module_catalog(module_key) on delete cascade,
  is_active boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists app_public.product_targets (
  id uuid primary key default gen_random_uuid(),
  target_kind text not null check (target_kind in ('website', 'app')),
  canonical_ref text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_targets_kind_ref_idx
  on app_public.product_targets(target_kind, canonical_ref);

create table if not exists app_public.review_analysis_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.content_listing_insight_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.keyword_analysis_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.rank_tracking_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.competitor_analysis_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.optimization_layer_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.creative_messaging_layer_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_public.unified_workflow_layer_records (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  integration_state text not null default 'internal_only',
  input_payload jsonb not null default '{}'::jsonb,
  analysis_payload jsonb not null default '{}'::jsonb,
  insights_payload jsonb not null default '[]'::jsonb,
  priority_payload jsonb not null default '[]'::jsonb,
  actions_payload jsonb not null default '[]'::jsonb,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_product_targets_updated_at
before update on app_public.product_targets
for each row execute function app_public.set_updated_at();

create trigger set_review_analysis_records_updated_at
before update on app_public.review_analysis_records
for each row execute function app_public.set_updated_at();

create trigger set_content_listing_insight_records_updated_at
before update on app_public.content_listing_insight_records
for each row execute function app_public.set_updated_at();

create trigger set_keyword_analysis_records_updated_at
before update on app_public.keyword_analysis_records
for each row execute function app_public.set_updated_at();

create trigger set_rank_tracking_records_updated_at
before update on app_public.rank_tracking_records
for each row execute function app_public.set_updated_at();

create trigger set_competitor_analysis_records_updated_at
before update on app_public.competitor_analysis_records
for each row execute function app_public.set_updated_at();

create trigger set_optimization_layer_records_updated_at
before update on app_public.optimization_layer_records
for each row execute function app_public.set_updated_at();

create trigger set_creative_messaging_layer_records_updated_at
before update on app_public.creative_messaging_layer_records
for each row execute function app_public.set_updated_at();

create trigger set_unified_workflow_layer_records_updated_at
before update on app_public.unified_workflow_layer_records
for each row execute function app_public.set_updated_at();

insert into app_public.backend_module_catalog (module_key, display_name, initial_state, is_workflow_module)
values
  ('review_analysis', 'Review Analysis', 'mvp_active', false),
  ('content_listing_insights', 'Content / Listing Insights', 'mvp_active', false),
  ('keyword_analysis', 'Keyword Analysis', 'mvp_active', false),
  ('rank_tracking', 'Rank Tracking', 'mvp_active', false),
  ('competitor_analysis', 'Competitor Analysis', 'built_inactive', false),
  ('optimization_layer', 'Optimization Layer', 'built_inactive', false),
  ('creative_messaging_layer', 'Creative / Messaging Layer', 'built_inactive', false),
  ('unified_workflow_layer', 'Unified Workflow Layer', 'built_inactive', true)
on conflict (module_key) do update
set
  display_name = excluded.display_name,
  initial_state = excluded.initial_state,
  is_workflow_module = excluded.is_workflow_module;

insert into app_public.backend_module_activation_defaults (module_key, is_active)
values
  ('review_analysis', true),
  ('content_listing_insights', true),
  ('keyword_analysis', true),
  ('rank_tracking', true),
  ('competitor_analysis', false),
  ('optimization_layer', false),
  ('creative_messaging_layer', false),
  ('unified_workflow_layer', false)
on conflict (module_key) do update
set
  is_active = excluded.is_active;
