-- T2-21: Audit log immutability
-- Adds monotonic sequence column and triggers preventing UPDATE/DELETE on audit_logs.
-- Append-only enforcement supports SOC 2 / GDPR audit requirements.

-- Monotonic sequence — gaps indicate deleted rows (should never occur after this migration).
ALTER TABLE app_public.audit_logs
  ADD COLUMN IF NOT EXISTS seq BIGSERIAL NOT NULL;

-- Trigger function: raises exception on any mutation attempt.
CREATE OR REPLACE FUNCTION app_public.prevent_audit_log_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log_rows_are_immutable';
END;
$$;

-- Block UPDATE on audit_logs.
DROP TRIGGER IF EXISTS audit_log_no_update ON app_public.audit_logs;
CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON app_public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION app_public.prevent_audit_log_mutation();

-- Block DELETE on audit_logs.
DROP TRIGGER IF EXISTS audit_log_no_delete ON app_public.audit_logs;
CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON app_public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION app_public.prevent_audit_log_mutation();
