import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { extractPosterFrame } from "./extractPosterFrame";
import { probeStats } from "./probeStats";
import { resolveFfmpegPath } from "./resolveFfmpegPath";
import { applyAlphaMatte } from "./applyAlphaMatte";

const webmFixtures = join(import.meta.dirname, "../../../examples/webm");
const ffmpegPath = resolveFfmpegPath();
const webmReady = corpusAvailable(webmFixtures);

let tempDir: string;

async function halfTransparentMatte(width: number, height: number, path: string): Promise<void> {
  const pixels = Buffer.alloc(width * height * 4, 128);
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      pixels[(row * width + column) * 4 + 3] = row < height / 2 ? 255 : 0;
    }
  }
  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path);
}

async function alphaOfPoster(path: string, row: number, column: number): Promise<number> {
  const framePath = join(tempDir, `poster-${row}.png`);
  await extractPosterFrame(path, framePath, ffmpegPath);
  const { info, data } = await sharp(await readFile(framePath))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data[(row * info.width + column) * 4 + 3];
}

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "alpha-matte-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe.skipIf(!webmReady)("applyAlphaMatte", () => {
  it("drives the animated webm's alpha from the png mask's alpha", async () => {
    const sourcePath = join(webmFixtures, "0.webm");
    const source = await probeStats(sourcePath, ffmpegPath);
    const mattePath = join(tempDir, "matte.png");
    const outputPath = join(tempDir, "matted.webm");
    await halfTransparentMatte(source.width, source.height, mattePath);

    await applyAlphaMatte(sourcePath, mattePath, outputPath, ffmpegPath);

    const stats = await probeStats(outputPath, ffmpegPath);
    expect(stats.hasAlpha).toBe(true);
    expect(stats.animated).toBe(true);
    expect(await alphaOfPoster(outputPath, 10, 256)).toBeGreaterThan(128);
    expect(await alphaOfPoster(outputPath, source.height - 10, 256)).toBeLessThan(128);
  }, 90_000);

  it("fails loudly when the mask does not match the source frame size", async () => {
    const mattePath = join(tempDir, "wrong-size.png");
    await halfTransparentMatte(64, 64, mattePath);
    await expect(
      applyAlphaMatte(join(webmFixtures, "0.webm"), mattePath, join(tempDir, "broken.webm"), ffmpegPath)
    ).rejects.toThrow(/ffmpeg exited with an error/);
  }, 60_000);
});
