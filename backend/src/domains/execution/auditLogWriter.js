async function writeAuditLog(repository, entry) {
  if (!repository || typeof repository.writeAuditLog !== "function") {
    throw new Error("execution_audit_repository_not_configured");
  }

  return repository.writeAuditLog(entry);
}

module.exports = {
  writeAuditLog,
};
