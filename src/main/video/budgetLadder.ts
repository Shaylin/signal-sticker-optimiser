import { DEFAULT_ANIMATED_SETTINGS, type AnimatedStickerSettings } from "./animatedStickerSettings";

export function budgetLadder(): AnimatedStickerSettings[] {
  const ladder: AnimatedStickerSettings[] = [DEFAULT_ANIMATED_SETTINGS];
  let current = DEFAULT_ANIMATED_SETTINGS;
  for (const maxColors of [64, 32]) {
    current = { ...current, maxColors };
    ladder.push(current);
  }
  current = { ...current, dither: false };
  ladder.push(current);
  for (const canvasSize of [320, 256]) {
    current = { ...current, canvasSize };
    ladder.push(current);
  }
  for (const fps of [10, 8]) {
    current = { ...current, fps };
    ladder.push(current);
  }
  return ladder;
}
