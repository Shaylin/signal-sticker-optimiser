import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { fitStaticStickerUnderBudget } from "../image/fitStaticStickerUnderBudget";
import { readImageStats } from "../image/readImageStats";
import { fitAnimatedStickerUnderBudget } from "../video/fitAnimatedStickerUnderBudget";
import { probeStats } from "../video/probeStats";
import { packStore } from "./packStore";

export async function optimiseSticker(stickerId: string, ffmpegPath: string): Promise<void> {
  const sticker = packStore.findSticker(stickerId);
  if (!sticker) {
    throw new Error(`Cannot optimise unknown sticker ${stickerId}`);
  }
  if (sticker.stats.animated) {
    const outputPath = join(packStore.state.workingDir, `${stickerId}.apng`);
    await fitAnimatedStickerUnderBudget(sticker.sourcePath, outputPath, ffmpegPath);
    sticker.processedPath = outputPath;
    sticker.processedStats = await probeStats(outputPath, ffmpegPath);
  } else {
    const outputPath = join(packStore.state.workingDir, `${stickerId}.webp`);
    await fitStaticStickerUnderBudget(await readFile(sticker.sourcePath), outputPath);
    sticker.processedPath = outputPath;
    sticker.processedStats = await readImageStats(outputPath);
  }
}
