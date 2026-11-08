import { describe, expect, it } from "vitest";
import { MAX_PACK_STICKERS, withinPackSize } from "./withinPackSize";

describe("withinPackSize", () => {
  it("passes below the maximum", () => {
    expect(withinPackSize(MAX_PACK_STICKERS - 1)).toBe(true);
  });

  it("passes exactly at the maximum", () => {
    expect(withinPackSize(MAX_PACK_STICKERS)).toBe(true);
  });

  it("fails one over the maximum", () => {
    expect(withinPackSize(MAX_PACK_STICKERS + 1)).toBe(false);
  });

  it("passes for an empty pack", () => {
    expect(withinPackSize(0)).toBe(true);
  });
});
