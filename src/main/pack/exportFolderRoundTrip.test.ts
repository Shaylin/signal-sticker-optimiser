import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readImageStats } from "../image/readImageStats";
import { isApng } from "../validation/isApng";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { MAX_STICKER_DIMENSION } from "../validation/withinDimensions";
import { MAX_ANIMATION_SECONDS } from "../validation/withinDuration";
import { probeStats } from "../video/probeStats";
import { resolveFfmpegPath } from "../video/resolveFfmpegPath";
import { exportFolder } from "./exportFolder";
import { importPaths } from "./importStickers";
import { optimiseSticker } from "./optimiseSticker";
import { packStore } from "./packStore";

const ffmpegPath = resolveFfmpegPath();
const webpFixtures = join(import.meta.dirname, "../../../examples/webp");
const webmFixtures = join(import.meta.dirname, "../../../examples/webm");
const expectedFiles = ["001.webp", "002.webp", "003.apng", "004.apng"];

let tempDir: string;
let exportDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "export-round-trip-"));
  exportDir = join(tempDir, "exported-pack");
  packStore.configureWorkingDir(tempDir);
  await importPaths(
    [
      join(webpFixtures, "0.webp"),
      join(webpFixtures, "17.webp"),
      join(webmFixtures, "9.webm"),
      join(webmFixtures, "20.webm")
    ],
    ffmpegPath
  );
}, 120_000);

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("exportFolder with animated stickers at default settings", () => {
  it("refuses the pack until the over-budget fixtures are optimised", async () => {
    await expect(exportFolder(packStore.state, exportDir)).rejects.toThrow(/optimise them first/);
  });
});

describe("exportFolder of an optimised pack", () => {
  beforeAll(async () => {
    for (const sticker of packStore.state.stickers) {
      await optimiseSticker(sticker.id, ffmpegPath);
    }
    await exportFolder(packStore.state, exportDir);
  }, 240_000);

  it("writes exactly one numbered file per sticker", async () => {
    expect(await readdir(exportDir)).toEqual(expectedFiles);
  });

  it("writes files that re-read as Signal-compliant stickers", async () => {
    const fileNames = await readdir(exportDir);
    expect(fileNames).toEqual(expectedFiles);
    for (const fileName of fileNames) {
      await expectToBeSignalCompliant(join(exportDir, fileName));
    }
  }, 120_000);
});

async function expectToBeSignalCompliant(filePath: string): Promise<void> {
  const bytes = await readFile(filePath);
  expect(bytes.byteLength, `${filePath} budget`).toBeLessThanOrEqual(MAX_STICKER_BYTES);
  const metadata = await sharp(bytes).metadata();
  expect(metadata.width, `${filePath} dimensions`).toBeLessThanOrEqual(MAX_STICKER_DIMENSION);
  expect(metadata.width, `${filePath} square`).toBe(metadata.height);
  if (!filePath.endsWith(".apng")) {
    expect(isApng(bytes), `${filePath} is static`).toBe(false);
    expect((await readImageStats(filePath)).animated, `${filePath} is not animated`).toBe(false);
    return;
  }
  expect(isApng(bytes), `${filePath} is APNG`).toBe(true);
  const stats = await probeStats(filePath, ffmpegPath);
  expect(stats.durationSeconds, `${filePath} duration`).toBeLessThanOrEqual(MAX_ANIMATION_SECONDS);
}
