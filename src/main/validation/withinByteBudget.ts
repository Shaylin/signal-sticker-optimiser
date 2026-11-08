import type { StickerStats } from "../pack/stickerStats";

export const MAX_STICKER_BYTES = 307200;

export function withinByteBudget(stats: StickerStats): boolean {
  return stats.byteSize <= MAX_STICKER_BYTES;
}
