import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isApng } from "../validation/isApng";
import { DEFAULT_ANIMATED_SETTINGS } from "./animatedStickerSettings";
import { encodeAnimatedSticker } from "./encodeAnimatedSticker";
import { probeStats } from "./probeStats";
import { resolveFfmpegPath } from "./resolveFfmpegPath";

const webmFixtures = join(import.meta.dirname, "../../../examples/webm");

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "encode-animated-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("encodeAnimatedSticker", () => {
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
    const { data, info } = await sharp(await readFile(outputPath))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const cornerAlpha = data[3];
    expect(cornerAlpha).toBe(0);
    expect(info.channels).toBeGreaterThanOrEqual(3);
  }, 30_000);
});

describe("encodeAnimatedSticker budget behaviour", () => {
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
