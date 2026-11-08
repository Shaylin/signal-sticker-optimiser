import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isApng } from "../validation/isApng";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { MAX_STICKER_DIMENSION } from "../validation/withinDimensions";
import { MAX_ANIMATION_SECONDS } from "../validation/withinDuration";
import { fitAnimatedStickerUnderBudget } from "./fitAnimatedStickerUnderBudget";
import { probeStats } from "./probeStats";
import { resolveFfmpegPath } from "./resolveFfmpegPath";

const webmFixtures = join(import.meta.dirname, "../../../examples/webm");

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "webm-corpus-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

async function convertAndAssert(name: string): Promise<number> {
  const result = await fitAnimatedStickerUnderBudget(
    join(webmFixtures, name),
    join(tempDir, `${name}.apng`),
    resolveFfmpegPath()
  );
  const stats = await probeStats(join(tempDir, `${name}.apng`), resolveFfmpegPath());
  const metadata = await sharp(result.bytes).metadata();
  expect(isApng(result.bytes), `${name} is APNG`).toBe(true);
  expect(result.bytes.byteLength, `${name} bytes`).toBeLessThanOrEqual(MAX_STICKER_BYTES);
  expect(metadata.width, `${name} width`).toBeLessThanOrEqual(MAX_STICKER_DIMENSION);
  expect(metadata.width, `${name} square`).toBe(metadata.height);
  expect(stats.durationSeconds, `${name} duration`).toBeLessThanOrEqual(MAX_ANIMATION_SECONDS);
  return result.rungIndex;
}

describe("the whole webm corpus", () => {
  it("converts all 24 fixtures to Signal-compliant APNGs via the budget ladder", async () => {
    const fixtureNames = (await readdir(webmFixtures)).filter((name) => name.endsWith(".webm"));
    expect(fixtureNames.length).toBe(24);
    const rungIndexes: number[] = [];
    const parallelism = 6;
    for (let start = 0; start < fixtureNames.length; start += parallelism) {
      const batch = fixtureNames.slice(start, start + parallelism);
      rungIndexes.push(...(await Promise.all(batch.map(convertAndAssert))));
    }
    const overBudgetAtDefaults = rungIndexes.filter((rung) => rung > 0).length;
    expect(overBudgetAtDefaults).toBeGreaterThan(0);
  }, 150_000);
});
