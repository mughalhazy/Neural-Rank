const { readdirSync, readFileSync, statSync } = require("fs");
const path = require("path");

// Patterns that indicate a committed secret
const SECRET_PATTERNS = [
  { name: "JWT token",        regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/ },
  { name: "Supabase anon key", regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{80,}/ },
  { name: "API key assignment", regex: /[Aa][Pp][Ii][-_][Kk][Ee][Yy]\s*[:=]\s*\S{16,}/ },
  { name: "Password assignment", regex: /password\s*[:=]\s*['"]?\S{8,}['"]?/i },
  { name: "Bearer token value", regex: /Bearer\s+eyJ[A-Za-z0-9_-]{20,}/ },
  { name: "DATABASE_URL with credentials", regex: /postgresql:\/\/[^:]+:[^@]{6,}@/ },
];

// Paths to skip entirely
const SKIP_DIRS = new Set(["node_modules", ".git", "coverage", "design", "build"]);
const SKIP_FILES = new Set([".env.example", "check-secrets.js"]);
const SKIP_EXTENSIONS = new Set([".dill", ".png", ".jpg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".otf"]);

// Known false-positive patterns (allowlist)
const ALLOWLIST_PATTERNS = [
  /eyJ.*testToken/,
  /eyJ.*fixture/,
  /eyJ.*mock/i,
  /eyJ.*fake/i,
  /eyJ.*example/i,
  /eyJ.*placeholder/i,
  /<[^>]+>/,                       // Placeholder format: <password>, <api-key>, etc.
  /\[REDACTED/i,                   // Explicitly redacted entries
  /\[PASSWORD\]/i,                 // Placeholder marker
  /password\s*[:=]\s*['"]?(?:password|newPassword|visiblePassword|TextInputType|IconData|AutofillHints)/i,
];

function getAllTextFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        results.push(...getAllTextFiles(full));
      } else if (!SKIP_FILES.has(entry) && !SKIP_EXTENSIONS.has(path.extname(entry))) {
        results.push(full);
      }
    } catch {
      // skip unreadable entries
    }
  }
  return results;
}

const root = path.join(__dirname, "..");
const files = getAllTextFiles(root);
let found = 0;

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { name, regex } of SECRET_PATTERNS) {
      if (!regex.test(line)) continue;
      if (ALLOWLIST_PATTERNS.some((p) => p.test(line))) continue;
      console.error(`SECRET DETECTED [${name}] in ${path.relative(root, file)}:${i + 1}`);
      console.error(`  ${line.trim().slice(0, 120)}`);
      found++;
    }
  }
}

if (found > 0) {
  console.error(`\n${found} potential secret(s) found. Remove them before committing.`);
  process.exit(1);
}

console.log(`Secrets check OK — ${files.length} files scanned.`);
