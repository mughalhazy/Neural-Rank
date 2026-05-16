create table if not exists app_public.business_intelligence_profiles (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references app_public.product_targets(id) on delete set null,
  business_objective text,
  target_page text,
  funnel_stage text check (funnel_stage in ('awareness', 'consideration', 'decision', 'retention')),
  lead_revenue_relevance numeric check (lead_revenue_relevance is null or (lead_revenue_relevance >= 0 and lead_revenue_relevance <= 100)),
  conversion_risk numeric check (conversion_risk is null or (conversion_risk >= 0 and conversion_risk <= 100)),
  content_roi_score numeric check (content_roi_score is null or (content_roi_score >= 0 and content_roi_score <= 100)),
  target_page_value numeric check (target_page_value is null or (target_page_value >= 0 and target_page_value <= 100)),
  high_value_keywords jsonb not null default '[]'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists business_intelligence_profiles_target_idx
  on app_public.business_intelligence_profiles(target_id, created_at);
