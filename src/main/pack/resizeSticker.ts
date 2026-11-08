import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { encodeStaticSticker } from "../image/encodeStaticSticker";
import { fitToSquareCanvas } from "../image/fitToSquareCanvas";
import { readImageStats } from "../image/readImageStats";
import { encodeAnimatedSticker } from "../video/encodeAnimatedSticker";
import { DEFAULT_ANIMATED_SETTINGS } from "../video/animatedStickerSettings";
import { probeStats } from "../video/probeStats";
import { packStore } from "./packStore";

export async function resizeSticker(stickerId: string, canvasSize: number, ffmpegPath: string): Promise<void> {
  const sticker = packStore.findSticker(stickerId);
  if (!sticker) {
    throw new Error(`Cannot resize unknown sticker ${stickerId}`);
  }
  if (sticker.stats.animated) {
    const outputPath = join(packStore.state.workingDir, `${stickerId}.apng`);
    await encodeAnimatedSticker(sticker.sourcePath, outputPath, ffmpegPath, {
      ...DEFAULT_ANIMATED_SETTINGS,
      canvasSize
    });
    sticker.processedPath = outputPath;
    sticker.processedStats = await probeStats(outputPath, ffmpegPath);
  } else {
    const fitted = await fitToSquareCanvas(await readFile(sticker.sourcePath), canvasSize);
    const webp = await encodeStaticSticker(fitted, { format: "webp" });
    const outputPath = join(packStore.state.workingDir, `${stickerId}.webp`);
    await writeFile(outputPath, webp);
    sticker.processedPath = outputPath;
    sticker.processedStats = await readImageStats(outputPath);
  }
}
