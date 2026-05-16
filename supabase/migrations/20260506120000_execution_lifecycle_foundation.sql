create table if not exists app_public.execution_recommendations (
  id uuid primary key default gen_random_uuid(),
  source_module_key text references app_public.backend_module_catalog(module_key) on delete set null,
  target_id uuid references app_public.product_targets(id) on delete set null,
  title text not null,
  summary text not null default '',
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  current_status text not null default 'recommended'
    check (current_status in ('recommended', 'approved', 'rejected', 'queued')),
  approval_status text not null default 'recommended'
    check (approval_status in ('recommended', 'approved', 'rejected', 'queued')),
  execution_status text
    check (execution_status in ('recommended', 'approved', 'rejected', 'queued', 'executed', 'verified', 'failed', 'rolled_back')),
  verification_status text
    check (verification_status in ('recommended', 'approved', 'rejected', 'queued', 'executed', 'verified', 'failed', 'rolled_back')),
  rollback_metadata jsonb not null default '{}'::jsonb,
  task_id uuid,
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists execution_recommendations_status_idx
  on app_public.execution_recommendations(current_status, approval_status);

create index if not exists execution_recommendations_target_idx
  on app_public.execution_recommendations(target_id);

create table if not exists app_public.execution_tasks (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references app_public.execution_recommendations(id) on delete cascade,
  source_module_key text references app_public.backend_module_catalog(module_key) on delete set null,
  target_id uuid references app_public.product_targets(id) on delete set null,
  title text not null,
  summary text not null default '',
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  current_status text not null default 'queued'
    check (current_status in ('queued', 'executed', 'verified', 'failed', 'rolled_back')),
  approval_status text not null default 'approved'
    check (approval_status in ('recommended', 'approved', 'rejected', 'queued', 'executed', 'verified', 'failed', 'rolled_back')),
  execution_status text not null default 'queued'
    check (execution_status in ('recommended', 'approved', 'rejected', 'queued', 'executed', 'verified', 'failed', 'rolled_back')),
  verification_status text
    check (verification_status in ('recommended', 'approved', 'rejected', 'queued', 'executed', 'verified', 'failed', 'rolled_back')),
  rollback_metadata jsonb not null default '{}'::jsonb,
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists execution_tasks_status_idx
  on app_public.execution_tasks(current_status, execution_status, verification_status);

create index if not exists execution_tasks_recommendation_idx
  on app_public.execution_tasks(recommendation_id);

create index if not exists execution_tasks_target_idx
  on app_public.execution_tasks(target_id);

create table if not exists app_public.execution_task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references app_public.execution_tasks(id) on delete cascade,
  previous_status text,
  next_status text not null
    check (next_status in ('recommended', 'approved', 'rejected', 'queued', 'executed', 'verified', 'failed', 'rolled_back')),
  actor text not null,
  reason text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists execution_task_status_history_task_idx
  on app_public.execution_task_status_history(task_id, created_at, id);

create table if not exists app_public.execution_audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('recommendation', 'task')),
  entity_id uuid not null,
  action text not null,
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists execution_audit_logs_entity_idx
  on app_public.execution_audit_logs(entity_type, entity_id, created_at, id);

create trigger set_execution_recommendations_updated_at
before update on app_public.execution_recommendations
for each row execute function app_public.set_updated_at();

create trigger set_execution_tasks_updated_at
before update on app_public.execution_tasks
for each row execute function app_public.set_updated_at();
