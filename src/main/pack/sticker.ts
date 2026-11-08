import type { StickerStats } from "./stickerStats";

export interface Sticker {
  id: string;
  sourcePath: string;
  emoji: string;
  stats: StickerStats;
  processedPath: string | null;
  processedStats: StickerStats | null;
  thumbnailDataUrl: string;
}
