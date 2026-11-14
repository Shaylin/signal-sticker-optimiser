import { readFile } from "node:fs/promises";
import sharp from "sharp";
import type { StickerStats } from "../pack/stickerStats";

export async function readImageStats(filePath: string): Promise<StickerStats> {
  const bytes = await readFile(filePath);
  const metadata = await sharp(bytes).metadata();
  const pages = metadata.pages ?? 1;
  return {
    byteSize: bytes.byteLength,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    durationSeconds: 0,
    animated: pages > 1,
    hasAlpha: metadata.hasAlpha ?? false
  };
}
