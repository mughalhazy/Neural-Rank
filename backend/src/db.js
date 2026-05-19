let pool = null;

// Lazy-load pg so the server starts without it when DATABASE_URL is absent.
function createPool() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { Pool } = require("pg");
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  } catch {
    return null;
  }
}

async function initDb() {
  pool = createPool();
  if (!pool) {
    console.log(JSON.stringify({ kind: "db_skipped", reason: "DATABASE_URL not set — using in-memory repositories" }));
    return null;
  }

  try {
    await pool.query("SELECT 1");
    const host = new URL(process.env.DATABASE_URL).hostname;
    console.log(JSON.stringify({ kind: "db_connected", host }));
    return pool;
  } catch (err) {
    console.log(JSON.stringify({ kind: "db_connect_failed", reason: String(err), note: "Continuing with in-memory repositories" }));
    pool = null;
    return null;
  }
}

async function probeDb() {
  if (!pool) return { status: "not_configured" };
  try {
    await pool.query("SELECT 1");
    return { status: "pass" };
  } catch (err) {
    return { status: "fail", reason: String(err) };
  }
}

function getQuery() {
  if (!pool) return null;
  return (sql, params) => pool.query(sql, params);
}

module.exports = { initDb, probeDb, getQuery };
