import { stat } from "node:fs/promises";
import sharp from "sharp";
import type { StickerStats } from "../pack/stickerStats";

export async function readImageStats(filePath: string): Promise<StickerStats> {
  const [fileStat, metadata] = await Promise.all([stat(filePath), sharp(filePath).metadata()]);
  const pages = metadata.pages ?? 1;
  return {
    byteSize: fileStat.size,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    durationSeconds: 0,
    animated: pages > 1,
    hasAlpha: metadata.hasAlpha ?? false
  };
}
