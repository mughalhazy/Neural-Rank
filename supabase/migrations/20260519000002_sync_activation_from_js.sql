-- T2-19: Single source of truth for module activation state
-- JS catalog (core/activation.js + core/moduleCatalog.js) is now authoritative.
-- The is_active column in backend_module_activation_defaults was a second source
-- that diverged and required a manual patch (20260516130000_fix_activation_defaults.sql).
-- Drop it so only the JS-defined state drives runtime behaviour.

ALTER TABLE IF EXISTS app_public.backend_module_activation_defaults
  DROP COLUMN IF EXISTS is_active;
