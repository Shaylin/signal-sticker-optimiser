import type { StickerStats } from "../pack/stickerStats";

export function needsBackgroundRemoval(stats: StickerStats): boolean {
  return !stats.hasAlpha;
}
