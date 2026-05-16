const { execSync } = require("child_process");
const { readdirSync, statSync } = require("fs");
const path = require("path");

function getAllJs(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...getAllJs(full));
    } else if (entry.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

const root = path.join(__dirname, "..");
const files = getAllJs(path.join(root, "backend", "src"));
let failed = 0;

for (const file of files) {
  try {
    execSync(`node --check "${file}"`, { stdio: "pipe" });
  } catch (err) {
    console.error(`Syntax error: ${path.relative(root, file)}`);
    console.error(err.stderr?.toString().trim() || err.message);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} file(s) failed syntax check.`);
  process.exit(1);
}

console.log(`Syntax OK — ${files.length} files checked.`);
