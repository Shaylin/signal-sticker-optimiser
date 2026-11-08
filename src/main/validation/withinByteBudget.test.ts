import { describe, expect, it } from "vitest";
import type { StickerStats } from "../pack/stickerStats";
import { MAX_STICKER_BYTES, withinByteBudget } from "./withinByteBudget";

function statsWithBytes(byteSize: number): StickerStats {
  return { byteSize, width: 512, height: 512, durationSeconds: 1, animated: false, hasAlpha: false };
}

describe("withinByteBudget", () => {
  it("passes below the budget", () => {
    expect(withinByteBudget(statsWithBytes(MAX_STICKER_BYTES - 1))).toBe(true);
  });

  it("passes exactly at the budget", () => {
    expect(withinByteBudget(statsWithBytes(MAX_STICKER_BYTES))).toBe(true);
  });

  it("fails one byte over the budget", () => {
    expect(withinByteBudget(statsWithBytes(MAX_STICKER_BYTES + 1))).toBe(false);
  });

  it("fails far over the budget", () => {
    expect(withinByteBudget(statsWithBytes(1_000_000))).toBe(false);
  });
});
