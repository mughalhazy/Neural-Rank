-- Expand initial_state check constraint to include 'backend_active'
alter table app_public.backend_module_catalog
  drop constraint if exists backend_module_catalog_initial_state_check;

alter table app_public.backend_module_catalog
  add constraint backend_module_catalog_initial_state_check
  check (initial_state in ('mvp_active', 'built_inactive', 'backend_active'));

-- 10 new SEO OS expansion module record tables

create table if not exists app_public.technical_seo_audit_records (
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

create table if not exists app_public.on_page_seo_records (
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

create table if not exists app_public.backlink_intelligence_records (
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

create table if not exists app_public.eeat_signal_records (
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

create table if not exists app_public.search_intent_records (
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

create table if not exists app_public.serp_feature_records (
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

create table if not exists app_public.topical_authority_records (
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

create table if not exists app_public.site_architecture_records (
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

create table if not exists app_public.analytics_integration_records (
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

create table if not exists app_public.local_seo_records (
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

-- updated_at triggers for all 10 new tables

create trigger set_technical_seo_audit_records_updated_at
before update on app_public.technical_seo_audit_records
for each row execute function app_public.set_updated_at();

create trigger set_on_page_seo_records_updated_at
before update on app_public.on_page_seo_records
for each row execute function app_public.set_updated_at();

create trigger set_backlink_intelligence_records_updated_at
before update on app_public.backlink_intelligence_records
for each row execute function app_public.set_updated_at();

create trigger set_eeat_signal_records_updated_at
before update on app_public.eeat_signal_records
for each row execute function app_public.set_updated_at();

create trigger set_search_intent_records_updated_at
before update on app_public.search_intent_records
for each row execute function app_public.set_updated_at();

create trigger set_serp_feature_records_updated_at
before update on app_public.serp_feature_records
for each row execute function app_public.set_updated_at();

create trigger set_topical_authority_records_updated_at
before update on app_public.topical_authority_records
for each row execute function app_public.set_updated_at();

create trigger set_site_architecture_records_updated_at
before update on app_public.site_architecture_records
for each row execute function app_public.set_updated_at();

create trigger set_analytics_integration_records_updated_at
before update on app_public.analytics_integration_records
for each row execute function app_public.set_updated_at();

create trigger set_local_seo_records_updated_at
before update on app_public.local_seo_records
for each row execute function app_public.set_updated_at();

-- Register all 10 new modules in the catalog

insert into app_public.backend_module_catalog (module_key, display_name, initial_state, is_workflow_module)
values
  ('technical_seo_audit',    'Technical SEO Audit',      'backend_active', false),
  ('on_page_seo_scorer',     'On-Page SEO Scorer',       'backend_active', false),
  ('backlink_intelligence',  'Backlink Intelligence',     'backend_active', false),
  ('eeat_signals',           'E-E-A-T Signals',          'backend_active', false),
  ('search_intent_classifier','Search Intent Classifier', 'backend_active', false),
  ('serp_feature_analyzer',  'SERP Feature Analyzer',    'backend_active', false),
  ('topical_authority',      'Topical Authority',         'backend_active', false),
  ('site_architecture',      'Site Architecture',         'backend_active', false),
  ('analytics_integration',  'Analytics Integration',     'backend_active', false),
  ('local_seo',              'Local SEO',                 'backend_active', false)
on conflict (module_key) do update
set
  display_name   = excluded.display_name,
  initial_state  = excluded.initial_state,
  is_workflow_module = excluded.is_workflow_module;

-- Activation defaults: all active except local_seo (opt-in only)

insert into app_public.backend_module_activation_defaults (module_key, is_active)
values
  ('technical_seo_audit',     true),
  ('on_page_seo_scorer',      true),
  ('backlink_intelligence',   true),
  ('eeat_signals',            true),
  ('search_intent_classifier',true),
  ('serp_feature_analyzer',   true),
  ('topical_authority',       true),
  ('site_architecture',       true),
  ('analytics_integration',   true),
  ('local_seo',               false)
on conflict (module_key) do update
set
  is_active = excluded.is_active;
