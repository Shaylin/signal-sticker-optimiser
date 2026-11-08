import type { PackDto, StickerDto } from "../../shared/studioApi";
import type { PackState } from "./packStore";
import type { Sticker } from "./sticker";
import { basename } from "node:path";

export function packToDto(state: PackState): PackDto {
  return {
    stickers: state.stickers.map(stickerToDto)
  };
}

function stickerToDto(sticker: Sticker): StickerDto {
  return {
    id: sticker.id,
    sourcePath: sticker.sourcePath,
    displayName: basename(sticker.sourcePath),
    stats: sticker.stats,
    processedPath: sticker.processedPath,
    processedStats: sticker.processedStats,
    thumbnailDataUrl: sticker.thumbnailDataUrl
  };
}
