import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { convertToStaticSticker } from "./convertToStaticSticker";

const webpFixtures = join(import.meta.dirname, "../../../examples/webp");

describe("convertToStaticSticker over the whole webp corpus", () => {
  it("converts all 40 fixtures into budget-compliant 512x512 stickers", async () => {
    const fixtureNames = (await readdir(webpFixtures)).filter((name) => name.endsWith(".webp")).sort();
    expect(fixtureNames.length).toBe(40);
    for (const name of fixtureNames) {
      const result = await convertToStaticSticker(join(webpFixtures, name));
      const metadata = await sharp(result.bytes).metadata();
      expect(result.bytes.byteLength, `${name} bytes`).toBeLessThanOrEqual(MAX_STICKER_BYTES);
      expect(metadata.width, `${name} width`).toBe(512);
      expect(metadata.height, `${name} height`).toBe(512);
    }
  }, 120_000);
});
