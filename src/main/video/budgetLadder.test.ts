import { describe, expect, it } from "vitest";
import { budgetLadder } from "./budgetLadder";
import { DEFAULT_ANIMATED_SETTINGS } from "./animatedStickerSettings";

describe("budgetLadder", () => {
  it("starts at the default settings", () => {
    expect(budgetLadder()[0]).toEqual(DEFAULT_ANIMATED_SETTINGS);
  });

  it("steps max_colors 128 -> 64 -> 32 before anything else", () => {
    const ladder = budgetLadder();
    expect(ladder.map((settings) => settings.maxColors)).toEqual([128, 64, 32, 32, 32, 32, 32, 32]);
  });

  it("disables dithering before shrinking the canvas", () => {
    const ladder = budgetLadder();
    expect(ladder.map((settings) => settings.dither)).toEqual([true, true, true, false, false, false, false, false]);
  });

  it("shrinks the canvas 512 -> 320 -> 256 before dropping fps", () => {
    const ladder = budgetLadder();
    expect(ladder.map((settings) => settings.canvasSize)).toEqual([512, 512, 512, 512, 320, 256, 256, 256]);
  });

  it("drops fps 15 -> 10 -> 8 as the final rungs", () => {
    const ladder = budgetLadder();
    expect(ladder.map((settings) => settings.fps)).toEqual([15, 15, 15, 15, 15, 15, 10, 8]);
  });

  it("trims to three seconds on every rung", () => {
    for (const settings of budgetLadder()) {
      expect(settings.maxDurationSeconds).toBe(3);
    }
  });
});
