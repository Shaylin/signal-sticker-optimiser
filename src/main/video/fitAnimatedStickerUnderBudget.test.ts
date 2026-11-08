import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { DEFAULT_ANIMATED_SETTINGS } from "./animatedStickerSettings";
import { fitAnimatedStickerUnderBudget } from "./fitAnimatedStickerUnderBudget";
import { runFfmpeg } from "./runFfmpeg";
import { resolveFfmpegPath } from "./resolveFfmpegPath";

const webmFixtures = join(import.meta.dirname, "../../../examples/webm");
const webmReady = corpusAvailable(webmFixtures);

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "fit-budget-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

async function tinyWebm(): Promise<string> {
  const sourcePath = join(tempDir, "tiny.webm");
  await runFfmpeg(resolveFfmpegPath(), [
    "-hide_banner",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=pink:size=128x128:duration=1:rate=10",
    sourcePath
  ]);
  return sourcePath;
}

describe("fitAnimatedStickerUnderBudget", () => {
  it("returns the default settings immediately when already under budget", async () => {
    const result = await fitAnimatedStickerUnderBudget(
      await tinyWebm(),
      join(tempDir, "tiny.apng"),
      resolveFfmpegPath()
    );
    expect(result.rungIndex).toBe(0);
    expect(result.settings).toEqual(DEFAULT_ANIMATED_SETTINGS);
    expect(result.bytes.byteLength).toBeLessThanOrEqual(MAX_STICKER_BYTES);
  }, 30_000);

  it.skipIf(!webmReady)(
    "descends the ladder for the largest fixture (webm/9, far over budget at defaults)",
    async () => {
      const result = await fitAnimatedStickerUnderBudget(
        join(webmFixtures, "9.webm"),
        join(tempDir, "9.apng"),
        resolveFfmpegPath()
      );
      expect(result.rungIndex).toBeGreaterThan(0);
      expect(result.bytes.byteLength).toBeLessThanOrEqual(MAX_STICKER_BYTES);
    },
    120_000
  );
});
