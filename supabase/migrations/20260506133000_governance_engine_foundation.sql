alter table app_public.execution_recommendations
add column if not exists governance_result jsonb not null default '{}'::jsonb;

alter table app_public.execution_tasks
add column if not exists governance_result jsonb not null default '{}'::jsonb;
