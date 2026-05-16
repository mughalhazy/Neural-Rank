-- Bring activation_defaults into sync with current runtime defaults.
-- competitor_analysis, optimization_layer, creative_messaging_layer, and
-- unified_workflow_layer were set to false in the original foundation migration
-- but were subsequently activated in the JS runtime catalog.

update app_public.backend_module_activation_defaults
set is_active = true
where module_key in (
  'competitor_analysis',
  'optimization_layer',
  'creative_messaging_layer',
  'unified_workflow_layer'
);
