import type { StickerStats } from "../main/pack/stickerStats";

export interface StickerDto {
  id: string;
  sourcePath: string;
  displayName: string;
  emoji: string;
  stats: StickerStats;
  processedPath: string | null;
  processedStats: StickerStats | null;
  thumbnailDataUrl: string;
}

export interface PackDto {
  title: string;
  author: string;
  coverStickerId: string | null;
  stickers: StickerDto[];
}

export interface StudioApi {
  getPack(): Promise<PackDto>;
  importViaFilePicker(): Promise<PackDto>;
  importViaFolderPicker(): Promise<PackDto>;
  importPaths(paths: string[]): Promise<PackDto>;
  removeSticker(stickerId: string): Promise<PackDto>;
  setStickerEmoji(stickerId: string, emoji: string): Promise<PackDto>;
  optimiseSticker(stickerId: string): Promise<PackDto>;
  resizeSticker(stickerId: string, canvasSize: number): Promise<PackDto>;
  submitSegmentedStickerImage(stickerId: string, pngBytes: ArrayBuffer): Promise<PackDto>;
  getStickerSourceBytes(stickerId: string): Promise<ArrayBuffer>;
  setPackInfo(title: string, author: string): Promise<PackDto>;
  setCoverSticker(stickerId: string | null): Promise<PackDto>;
  segmentationAssetBaseUrl: string;
}

declare global {
  interface Window {
    studio: StudioApi;
  }
}
