export const MAX_PACK_STICKERS = 200;

export function withinPackSize(stickerCount: number): boolean {
  return stickerCount <= MAX_PACK_STICKERS;
}
