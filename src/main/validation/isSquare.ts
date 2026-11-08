import type { StickerStats } from "../pack/stickerStats";

export function isSquare(stats: StickerStats): boolean {
  return stats.width === stats.height;
}
