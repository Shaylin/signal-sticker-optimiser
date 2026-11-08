import { describe, expect, it } from "vitest";
import type { StickerStats } from "../pack/stickerStats";
import { needsBackgroundRemoval } from "./needsBackgroundRemoval";

function statsWithAlpha(hasAlpha: boolean): StickerStats {
  return { byteSize: 1000, width: 512, height: 512, durationSeconds: 0, animated: false, hasAlpha };
}

describe("needsBackgroundRemoval", () => {
  it("is true when the source has no alpha channel", () => {
    expect(needsBackgroundRemoval(statsWithAlpha(false))).toBe(true);
  });

  it("is false when the source already has an alpha channel", () => {
    expect(needsBackgroundRemoval(statsWithAlpha(true))).toBe(false);
  });

  it("treats animated sources the same as static ones", () => {
    expect(needsBackgroundRemoval({ ...statsWithAlpha(false), animated: true, durationSeconds: 1 })).toBe(true);
    expect(needsBackgroundRemoval({ ...statsWithAlpha(true), animated: true, durationSeconds: 1 })).toBe(false);
  });
});
