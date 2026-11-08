import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readImageStats } from "../image/readImageStats";
import { corpusAvailable } from "../testing/corpusAvailable";
import { probeStats } from "../video/probeStats";
import { resolveFfmpegPath } from "../video/resolveFfmpegPath";
import { stickerSegmentationSource } from "./stickerSegmentationSource";
import type { Sticker } from "./sticker";

const fixtures = join(import.meta.dirname, "../../../examples");
const ffmpegPath = resolveFfmpegPath();
const corpusReady = corpusAvailable(fixtures);

let tempDir: string;
let workingDir: string;

async function stickerAt(sourcePath: string): Promise<Sticker> {
  const stats = sourcePath.endsWith(".webm")
    ? await probeStats(sourcePath, ffmpegPath)
    : await readImageStats(sourcePath);
  return {
    id: `st-${stats.width}`,
    sourcePath,
    stats,
    processedPath: null,
    processedStats: null,
    thumbnailDataUrl: ""
  };
}

function startsWith(bytes: ArrayBuffer, signature: number[]): boolean {
  return signature.every((byte, index) => new Uint8Array(bytes)[index] === byte);
}

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "segmentation-source-"));
  workingDir = join(tempDir, "work");
  await mkdir(workingDir, { recursive: true });
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe.skipIf(!corpusReady)("stickerSegmentationSource", () => {
  it("hands a still sticker over unchanged with its mime type", async () => {
    const sticker = await stickerAt(join(fixtures, "webp/29.webp"));
    const source = await stickerSegmentationSource(sticker, workingDir, ffmpegPath);
    expect(source.mimeType).toBe("image/webp");
    expect(startsWith(source.bytes, [0x52, 0x49, 0x46, 0x46])).toBe(true);
  }, 30_000);

  it("hands a single png frame to the segmenter because it cannot decode animated webm", async () => {
    const sticker = await stickerAt(join(fixtures, "webm/0.webm"));
    const source = await stickerSegmentationSource(sticker, workingDir, ffmpegPath);
    expect(source.mimeType).toBe("image/png");
    expect(startsWith(source.bytes, [0x89, 0x50, 0x4e, 0x47])).toBe(true);
  }, 30_000);
});
