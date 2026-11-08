import type { StickerStats } from "../main/pack/stickerStats";

export interface StickerDto {
  id: string;
  sourcePath: string;
  displayName: string;
  stats: StickerStats;
  processedPath: string | null;
  processedStats: StickerStats | null;
  thumbnailDataUrl: string;
}

export interface PackDto {
  stickers: StickerDto[];
}

export interface ExportedPackDto {
  directory: string;
  files: string[];
}

export interface StudioApi {
  getPack(): Promise<PackDto>;
  importViaFilePicker(): Promise<PackDto>;
  importViaFolderPicker(): Promise<PackDto>;
  importPaths(paths: string[]): Promise<PackDto>;
  removeSticker(stickerId: string): Promise<PackDto>;
  optimiseSticker(stickerId: string): Promise<PackDto>;
  resizeSticker(stickerId: string, canvasSize: number): Promise<PackDto>;
  submitSegmentedStickerImage(stickerId: string, pngBytes: ArrayBuffer): Promise<PackDto>;
  getStickerSourceBytes(stickerId: string): Promise<ArrayBuffer>;
  exportViaFolderPicker(): Promise<ExportedPackDto | null>;
  segmentationAssetBaseUrl: string;
}

declare global {
  interface Window {
    studio: StudioApi;
  }
}
