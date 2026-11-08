import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { isApng } from "../validation/isApng";
import { DEFAULT_ANIMATED_SETTINGS } from "./animatedStickerSettings";
import { applyAlphaMatte } from "./applyAlphaMatte";
import { encodeAnimatedSticker } from "./encodeAnimatedSticker";
import { probeStats } from "./probeStats";
import { resolveFfmpegPath } from "./resolveFfmpegPath";
import { runFfmpeg } from "./runFfmpeg";

const webmFixtures = join(import.meta.dirname, "../../../examples/webm");
const webmReady = corpusAvailable(webmFixtures);

let tempDir: string;

function countTransparentPixels(rgba: Buffer): number {
  let transparent = 0;
  for (let offset = 3; offset < rgba.length; offset += 4) {
    if (rgba[offset] < 128) {
      transparent++;
    }
  }
  return transparent;
}

async function rawFrameOf(path: string): Promise<{ data: Buffer; width: number; channels: number }> {
  const { data, info } = await sharp(await readFile(path))
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, channels: info.channels };
}

function countOpaquePixels(rgba: Buffer): number {
  let opaque = 0;
  for (let offset = 3; offset < rgba.length; offset += 4) {
    if (rgba[offset] >= 128) {
      opaque++;
    }
  }
  return opaque;
}

async function solidAlphaMatteWebm(): Promise<string> {
  const mattePath = join(tempDir, "solid-matte.png");
  const outputWebm = join(tempDir, "solid-alpha.webm");
  const width = 512;
  const height = 387;
  await sharp(Buffer.alloc(width * height * 4, 255), { raw: { width, height, channels: 4 } })
    .png()
    .toFile(mattePath);
  await applyAlphaMatte(join(webmFixtures, "0.webm"), mattePath, outputWebm, resolveFfmpegPath());
  return outputWebm;
}

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "encode-animated-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe.skipIf(!webmReady)("encodeAnimatedSticker", () => {
  it("converts a webm sticker into a square APNG with the default preset", async () => {
    const outputPath = join(tempDir, "default.apng");
    await encodeAnimatedSticker(join(webmFixtures, "0.webm"), outputPath, resolveFfmpegPath());
    const bytes = await readFile(outputPath);
    expect(isApng(bytes)).toBe(true);
    const metadata = await sharp(bytes).metadata();
    expect(metadata.width).toBe(512);
    expect(metadata.height).toBe(512);
  }, 30_000);

  it("trims the output to three seconds and keeps it animated", async () => {
    const outputPath = join(tempDir, "trimmed.apng");
    await encodeAnimatedSticker(join(webmFixtures, "2.webm"), outputPath, resolveFfmpegPath());
    const stats = await probeStats(outputPath, resolveFfmpegPath());
    expect(stats.durationSeconds).toBeLessThanOrEqual(3);
    expect(stats.animated).toBe(true);
  }, 30_000);

  it("produces a transparent padded canvas for black-backed webm sources", async () => {
    const outputPath = join(tempDir, "padded.apng");
    await encodeAnimatedSticker(join(webmFixtures, "0.webm"), outputPath, resolveFfmpegPath());
    const frame = await rawFrameOf(outputPath);
    expect(frame.data[3], "the corner of the padded canvas is transparent").toBe(0);
    expect(frame.channels).toBeGreaterThanOrEqual(3);
  }, 30_000);
});

describe.skipIf(!webmReady)("encodeAnimatedSticker transparency", () => {
  it("keeps the transparency of the webm content rather than flattening the frame", async () => {
    const sourcePath = join(webmFixtures, "20.webm");
    const outputPath = join(tempDir, "alpha.apng");
    await encodeAnimatedSticker(sourcePath, outputPath, resolveFfmpegPath());
    const source = await probeStats(sourcePath, resolveFfmpegPath());
    const frame = await rawFrameOf(outputPath);
    const letterboxOnly = 512 * (512 - source.height);
    expect(source.hasAlpha, "the source webm carries an alpha layer").toBe(true);
    expect(countTransparentPixels(frame.data)).toBeGreaterThan(letterboxOnly);
  }, 30_000);
});

describe("encodeAnimatedSticker black background knockout", () => {
  it("keys out the black background of an opaque webm", async () => {
    const sourcePath = join(tempDir, "black.webm");
    await runFfmpeg(resolveFfmpegPath(), [
      "-hide_banner",
      "-y",
      "-f",
      "lavfi",
      "-i",
      "color=c=black:size=128x128:duration=1:rate=10",
      sourcePath
    ]);
    const outputPath = join(tempDir, "black.apng");
    await encodeAnimatedSticker(sourcePath, outputPath, resolveFfmpegPath());
    expect(countOpaquePixels((await rawFrameOf(outputPath)).data)).toBe(0);
  }, 60_000);

  it.skipIf(!webmReady)(
    "keeps dark artwork opaque when the source already has transparency",
    async () => {
      const outputPath = join(tempDir, "kept.apng");
      await encodeAnimatedSticker(await solidAlphaMatteWebm(), outputPath, resolveFfmpegPath());
      expect(countOpaquePixels((await rawFrameOf(outputPath)).data)).toBeGreaterThanOrEqual(512 * (387 - 16));
    },
    90_000
  );
});

describe.skipIf(!webmReady)("encodeAnimatedSticker budget behaviour", () => {
  it("shrinks output when the color budget drops", async () => {
    const highPath = join(tempDir, "colors128.apng");
    const lowPath = join(tempDir, "colors32.apng");
    await encodeAnimatedSticker(join(webmFixtures, "9.webm"), highPath, resolveFfmpegPath(), DEFAULT_ANIMATED_SETTINGS);
    await encodeAnimatedSticker(join(webmFixtures, "9.webm"), lowPath, resolveFfmpegPath(), {
      ...DEFAULT_ANIMATED_SETTINGS,
      maxColors: 32,
      dither: false
    });
    expect((await stat(lowPath)).size).toBeLessThan((await stat(highPath)).size);
  }, 60_000);
});
