import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const baseDir = path.resolve("D:/Neural Rank/frontend/inspiration-library");
const dataPath = path.join(baseDir, "library-data.js");
const capturesDir = path.join(baseDir, "captures");
const manifestPath = path.join(baseDir, "capture-manifest.js");
const targetArchetype = process.argv[2] || null;

const dataSource = await fs.readFile(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox);

const library = sandbox.window.LIBRARY_DATA;
let manifest = {};

try {
  const manifestSource = await fs.readFile(manifestPath, "utf8");
  const manifestSandbox = { window: {} };
  vm.createContext(manifestSandbox);
  vm.runInContext(manifestSource, manifestSandbox);
  manifest = manifestSandbox.window.CAPTURE_MANIFEST || {};
} catch {}

if (targetArchetype) {
  await fs.rm(path.join(capturesDir, targetArchetype), { recursive: true, force: true });
  for (const key of Object.keys(manifest)) {
    if (key.startsWith(`${targetArchetype}/`)) {
      delete manifest[key];
    }
  }
} else {
  await fs.rm(capturesDir, { recursive: true, force: true });
  manifest = {};
}

await fs.mkdir(capturesDir, { recursive: true });

function extensionFromContentType(contentType) {
  if (!contentType) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

function buildCaptureUrls(sourceUrl) {
  const encoded = encodeURIComponent(sourceUrl);
  return [
    `https://image.thum.io/get/width/1400/noanimate/${sourceUrl}`,
    `https://s.wordpress.com/mshots/v1/${encoded}?w=1400`
  ];
}

for (const [archetype, buckets] of Object.entries(library.buckets)) {
  if (targetArchetype && archetype !== targetArchetype) {
    continue;
  }
  for (const [bucket, items] of Object.entries(buckets)) {
    if (!items.length) continue;

    const targetDir = path.join(capturesDir, archetype);
    await fs.mkdir(targetDir, { recursive: true });

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const key = `${archetype}/${bucket}/${index}`;
      let response = null;

      for (const previewUrl of buildCaptureUrls(item.source)) {
        const candidate = await fetch(previewUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        if (candidate.ok) {
          response = candidate;
          break;
        }
      }

      if (!response) {
        throw new Error(`Failed capture for ${key}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const ext = extensionFromContentType(contentType);
      const filename = `${bucket}-${String(index + 1).padStart(2, "0")}${ext}`;
      const absoluteFile = path.join(targetDir, filename);
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(absoluteFile, buffer);
      manifest[key] = `../captures/${archetype}/${filename}`;
    }
  }
}

const manifestJs = `window.CAPTURE_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`;
await fs.writeFile(manifestPath, manifestJs, "utf8");
console.log(`Saved ${Object.keys(manifest).length} static captures.`);
