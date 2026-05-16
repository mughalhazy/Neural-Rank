create table if not exists app_public.measurement_metric_sources (
  metric_id text primary key,
  display_name text not null,
  source_status text not null check (source_status in ('registered', 'placeholder')),
  supports_numeric_value boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app_public.measurement_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_kind text not null check (snapshot_kind in ('baseline', 'post_change')),
  metric_id text not null references app_public.measurement_metric_sources(metric_id) on delete restrict,
  target_id uuid references app_public.product_targets(id) on delete set null,
  recommendation_id uuid references app_public.execution_recommendations(id) on delete set null,
  task_id uuid references app_public.execution_tasks(id) on delete set null,
  change_id text,
  metric_value numeric,
  raw_value jsonb,
  value_status text not null check (value_status in ('known', 'unknown')),
  observed_at timestamptz not null,
  source_ref text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists measurement_snapshots_metric_idx
  on app_public.measurement_snapshots(metric_id, observed_at);

create index if not exists measurement_snapshots_link_idx
  on app_public.measurement_snapshots(recommendation_id, task_id, change_id);

create table if not exists app_public.measurement_attribution_links (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references app_public.execution_recommendations(id) on delete set null,
  task_id uuid references app_public.execution_tasks(id) on delete set null,
  change_id text,
  metric_id text not null references app_public.measurement_metric_sources(metric_id) on delete restrict,
  baseline_snapshot_id uuid references app_public.measurement_snapshots(id) on delete set null,
  post_change_snapshot_id uuid references app_public.measurement_snapshots(id) on delete set null,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  impact_classification text not null check (impact_classification in ('unknown', 'observed_correlation', 'confirmed_impact')),
  rationale text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists measurement_attribution_metric_idx
  on app_public.measurement_attribution_links(metric_id, created_at);

create index if not exists measurement_attribution_link_idx
  on app_public.measurement_attribution_links(recommendation_id, task_id, change_id);
