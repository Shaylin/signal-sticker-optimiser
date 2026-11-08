import { describe, expect, it } from "vitest";
import type { StickerStats } from "../pack/stickerStats";
import { MAX_STICKER_DIMENSION, withinDimensions } from "./withinDimensions";

function statsWithDimensions(width: number, height: number): StickerStats {
  return { byteSize: 1000, width, height, durationSeconds: 1, animated: false };
}

describe("withinDimensions", () => {
  it("passes below the maximum", () => {
    expect(withinDimensions(statsWithDimensions(511, 511))).toBe(true);
  });

  it("passes exactly at the maximum on both axes", () => {
    expect(withinDimensions(statsWithDimensions(MAX_STICKER_DIMENSION, MAX_STICKER_DIMENSION))).toBe(true);
  });

  it("fails when the width exceeds the maximum", () => {
    expect(withinDimensions(statsWithDimensions(513, 512))).toBe(false);
  });

  it("fails when the height exceeds the maximum", () => {
    expect(withinDimensions(statsWithDimensions(512, 513))).toBe(false);
  });
});
