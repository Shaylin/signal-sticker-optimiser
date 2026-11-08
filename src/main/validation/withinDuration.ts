import type { StickerStats } from "../pack/stickerStats";

export const MAX_ANIMATION_SECONDS = 3;

export function withinDuration(stats: StickerStats): boolean {
  return stats.durationSeconds <= MAX_ANIMATION_SECONDS;
}
