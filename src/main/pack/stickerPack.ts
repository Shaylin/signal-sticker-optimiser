import type { Sticker } from "./sticker";

export interface StickerPack {
  title: string;
  author: string;
  coverStickerId: string | null;
  stickers: Sticker[];
}
