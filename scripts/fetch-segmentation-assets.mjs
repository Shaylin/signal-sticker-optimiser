import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const outputDir = join(projectRoot, "resources", "onnx");

const packageJsonPath = join(projectRoot, "node_modules/@imgly/background-removal/package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const dataBaseUrl = `https://staticimgly.com/@imgly/background-removal-data/${packageJson.version}/dist/`;

const onnxModelName = "isnet_quint8";

await mkdir(outputDir, { recursive: true });
const manifest = JSON.parse(await downloadText(`${dataBaseUrl}resources.json`));
await writeFile(join(outputDir, "resources.json"), JSON.stringify(manifest, null, 2));
console.log(`Fetched manifest with ${Object.keys(manifest).length} resources`);

function keysToFetch() {
  const modelKey = `/models/${onnxModelName}`;
  const wasmKeys = Object.keys(manifest).filter((key) => key.startsWith("/onnxruntime-web/"));
  const missing = [modelKey, ...wasmKeys].filter((key) => !(key in manifest));
  if (missing.length > 0) {
    console.error(`Manifest is missing expected resources: ${missing.join(", ")}`);
    process.exit(1);
  }
  return [modelKey, ...wasmKeys];
}

async function downloadText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }
  return response.text();
}

async function downloadBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function fetchChunk(resourceKey, chunk) {
  const target = join(outputDir, chunk.name);
  try {
    const existing = await readFile(target);
    if (sha256(existing) === chunk.hash) {
      return false;
    }
  } catch {
    // the chunk is missing locally and needs to be downloaded
  }
  const bytes = await downloadBinary(new URL(chunk.name, dataBaseUrl).toString());
  const actual = sha256(bytes);
  if (actual !== chunk.hash) {
    throw new Error(`Chunk ${chunk.name} for ${resourceKey} has sha256 ${actual}, expected ${chunk.hash}`);
  }
  await writeFile(target, bytes);
  return true;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

let fetched = 0;
let total = 0;
for (const key of keysToFetch()) {
  const chunks = manifest[key].chunks;
  total += chunks.length;
  for (const chunk of chunks) {
    if (await fetchChunk(key, chunk)) {
      fetched++;
    }
    console.log(`  ${key} ${Math.round((chunk.offsets[1] / manifest[key].size) * 100)}%`);
  }
}
const summary = `Segmentation assets ready in ${outputDir} (${fetched} of ${total} chunks, model: ${onnxModelName})`;
console.log(summary);
