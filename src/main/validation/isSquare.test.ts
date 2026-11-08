import { describe, expect, it } from "vitest";
import type { StickerStats } from "../pack/stickerStats";
import { isSquare } from "./isSquare";

function statsWithDimensions(width: number, height: number): StickerStats {
  return { byteSize: 1000, width, height, durationSeconds: 1, animated: false, hasAlpha: false };
}

describe("isSquare", () => {
  it("passes for equal dimensions", () => {
    expect(isSquare(statsWithDimensions(512, 512))).toBe(true);
  });

  it("fails when wider than tall", () => {
    expect(isSquare(statsWithDimensions(512, 443))).toBe(false);
  });

  it("fails when taller than wide", () => {
    expect(isSquare(statsWithDimensions(443, 512))).toBe(false);
  });
});
