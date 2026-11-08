import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { MAX_ANIMATION_SECONDS } from "../validation/withinDuration";
import { probeStats } from "../video/probeStats";
import { resolveFfmpegPath } from "../video/resolveFfmpegPath";
import { packStore } from "./packStore";
import { submitSegmentedStickerImage } from "./submitSegmentedStickerImage";
import type { StickerStats } from "./stickerStats";

const ffmpegPath = resolveFfmpegPath();
const sourcePath = join(import.meta.dirname, "../../../examples/webm/0.webm");
const corpusReady = corpusAvailable(sourcePath);
let sourceStats: StickerStats;

beforeAll(async () => {
  if (!corpusReady) {
    return;
  }
  sourceStats = await probeStats(sourcePath, ffmpegPath);
});

async function halfTransparentMatte(): Promise<Buffer> {
  const { width, height } = sourceStats;
  const pixels = Buffer.alloc(width * height * 4, 0);
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const offset = (row * width + column) * 4;
      pixels[offset] = 128;
      pixels[offset + 1] = 128;
      pixels[offset + 2] = 128;
      pixels[offset + 3] = row < height / 2 ? 255 : 0;
    }
  }
  return sharp(pixels, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

async function alphaAt(path: string, row: number, column: number): Promise<number> {
  const { info, data } = await sharp(await readFile(path))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data[(row * info.width + column) * 4 + 3];
}

beforeEach(async () => {
  packStore.configureWorkingDir(await mkdtemp(join(tmpdir(), "segment-submit-")));
  packStore.addStickers([
    {
      id: "st-1",
      sourcePath,
      stats: sourceStats,
      processedPath: null,
      processedStats: null,
      thumbnailDataUrl: ""
    }
  ]);
});

afterEach(async () => {
  await rm(packStore.state.workingDir, { recursive: true, force: true });
  packStore.removeSticker("st-1");
});

describe.skipIf(!corpusReady)("submitSegmentedStickerImage for an animated sticker", () => {
  it("keeps the animation running while its frames take the matte alpha", async () => {
    await submitSegmentedStickerImage("st-1", await halfTransparentMatte(), ffmpegPath);

    const sticker = packStore.findSticker("st-1");
    expect(sticker?.stats.animated, "the sticker is still animated").toBe(true);
    expect(sticker?.stats.hasAlpha, "the source now carries the matte").toBe(true);
    expect(sticker?.processedPath?.endsWith(".apng")).toBe(true);
    expect(sticker?.processedStats?.byteSize).toBeLessThanOrEqual(MAX_STICKER_BYTES);
    expect(sticker?.processedStats?.durationSeconds).toBeLessThanOrEqual(MAX_ANIMATION_SECONDS);
    expect(sticker?.thumbnailDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  }, 120_000);

  it("cuts the frame rather than only the letterbox padding", async () => {
    await submitSegmentedStickerImage("st-1", await halfTransparentMatte(), ffmpegPath);

    const processedPath = packStore.findSticker("st-1")?.processedPath;
    const letterbox = Math.floor((512 - sourceStats.height) / 2);
    expect(await alphaAt(processedPath ?? "", 60 + letterbox, 256)).toBeGreaterThan(128);
    expect(await alphaAt(processedPath ?? "", sourceStats.height - 60 + letterbox, 256)).toBeLessThan(128);
  }, 120_000);

  it("refuses an unknown sticker id", async () => {
    await expect(submitSegmentedStickerImage("nope", Buffer.from("png"), ffmpegPath)).rejects.toThrow(
      /unknown sticker/
    );
  });
});
