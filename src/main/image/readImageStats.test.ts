import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { readImageStats } from "./readImageStats";

const webpFixtures = join(import.meta.dirname, "../../../examples/webp");
const webpReady = corpusAvailable(webpFixtures);

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "image-stats-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function squareWebp(size: number): Promise<Buffer> {
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 1 } }
  })
    .webp()
    .toBuffer();
}

function generatedPng(): Promise<Buffer> {
  return sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 1, g: 2, b: 3, alpha: 1 } }
  })
    .png()
    .toBuffer();
}

describe("readImageStats", () => {
  it.skipIf(!webpReady)("matches the recorded expectations for the webp corpus (512x443 single-frame)", async () => {
    const stats = await readImageStats(join(webpFixtures, "0.webp"));
    expect(stats.width).toBe(512);
    expect(stats.height).toBe(443);
    expect(stats.animated).toBe(false);
    expect(stats.durationSeconds).toBe(0);
    expect(stats.byteSize).toBeGreaterThanOrEqual(17_000);
    expect(stats.byteSize).toBeLessThanOrEqual(74_000);
  });

  it("reports dimensions and byte size for a generated square png", async () => {
    const filePath = join(tempDir, "square.png");
    const png = await generatedPng();
    await writeFile(filePath, png);
    const stats = await readImageStats(filePath);
    expect(stats.width).toBe(512);
    expect(stats.height).toBe(512);
    expect(stats.byteSize).toBe(png.byteLength);
  });

  it("reports fresh stats after the same webp path is rewritten", async () => {
    const filePath = join(tempDir, "rewrite.webp");
    await writeFile(filePath, await squareWebp(64));
    expect((await readImageStats(filePath)).width).toBe(64);

    const rewritten = await squareWebp(128);
    await writeFile(filePath, rewritten);
    const stats = await readImageStats(filePath);

    expect({ width: stats.width, height: stats.height, byteSize: stats.byteSize }).toEqual({
      width: 128,
      height: 128,
      byteSize: rewritten.byteLength
    });
  });
});
