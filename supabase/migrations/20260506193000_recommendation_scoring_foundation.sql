alter table app_public.execution_recommendations
add column if not exists score_payload jsonb not null default '{}'::jsonb;

alter table app_public.execution_tasks
add column if not exists score_payload jsonb not null default '{}'::jsonb;
