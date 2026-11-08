import type { StickerStats } from "../pack/stickerStats";

export const MAX_STICKER_DIMENSION = 512;

export function withinDimensions(stats: StickerStats): boolean {
  return stats.width <= MAX_STICKER_DIMENSION && stats.height <= MAX_STICKER_DIMENSION;
}
