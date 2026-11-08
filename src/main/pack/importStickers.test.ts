import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { resolveFfmpegPath } from "../video/resolveFfmpegPath";
import { importPaths } from "./importStickers";
import { optimiseSticker } from "./optimiseSticker";
import { packStore } from "./packStore";

const webpFixtures = join(import.meta.dirname, "../../../examples/webp");
const webmFixtures = join(import.meta.dirname, "../../../examples/webm");
const webpReady = corpusAvailable(webpFixtures);
const webmReady = corpusAvailable(webmFixtures);

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "pack-import-"));
  packStore.configureWorkingDir(tempDir);
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe.skipIf(!webpReady)("import + optimise flow (static)", () => {
  it("imports a webp sticker already under budget after the default encode", async () => {
    const { added } = await importPaths([join(webpFixtures, "0.webp")], resolveFfmpegPath());
    expect(added).toBe(1);
    const sticker = packStore.state.stickers.find((entry) => entry.sourcePath.endsWith("0.webp"));
    expect(sticker?.thumbnailDataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(sticker?.processedStats?.byteSize).toBeLessThanOrEqual(MAX_STICKER_BYTES);
  }, 30_000);
});

describe.skipIf(!webmReady)("import + optimise flow (animated)", () => {
  it("flags a webm over budget at default settings and turns green after optimise", async () => {
    const { added } = await importPaths([join(webmFixtures, "9.webm")], resolveFfmpegPath());
    expect(added).toBe(1);
    const sticker = packStore.state.stickers.find((entry) => entry.sourcePath.endsWith("9.webm"));
    if (!sticker || !sticker.processedStats) {
      throw new Error("webm sticker was not imported with processed stats");
    }
    expect(sticker.processedStats.byteSize).toBeGreaterThan(MAX_STICKER_BYTES);
    await optimiseSticker(sticker.id, resolveFfmpegPath());
    expect(sticker.processedStats.byteSize).toBeLessThanOrEqual(MAX_STICKER_BYTES);
  }, 120_000);
});
