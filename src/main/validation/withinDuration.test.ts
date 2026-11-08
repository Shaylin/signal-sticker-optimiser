import { describe, expect, it } from "vitest";
import type { StickerStats } from "../pack/stickerStats";
import { MAX_ANIMATION_SECONDS, withinDuration } from "./withinDuration";

function statsWithDuration(durationSeconds: number): StickerStats {
  return { byteSize: 1000, width: 512, height: 512, durationSeconds, animated: true };
}

describe("withinDuration", () => {
  it("passes below the maximum", () => {
    expect(withinDuration(statsWithDuration(2.999))).toBe(true);
  });

  it("passes exactly at the maximum", () => {
    expect(withinDuration(statsWithDuration(MAX_ANIMATION_SECONDS))).toBe(true);
  });

  it("fails just over the maximum", () => {
    expect(withinDuration(statsWithDuration(3.001))).toBe(false);
  });

  it("passes for static stickers (zero duration)", () => {
    expect(withinDuration(statsWithDuration(0))).toBe(true);
  });
});
