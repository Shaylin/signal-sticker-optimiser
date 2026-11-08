import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { convertToStaticSticker } from "../image/convertToStaticSticker";
import { makeThumbnailDataUrl } from "../image/makeThumbnailDataUrl";
import { readImageStats } from "../image/readImageStats";
import { applyAlphaMatte } from "../video/applyAlphaMatte";
import { fitAnimatedStickerUnderBudget } from "../video/fitAnimatedStickerUnderBudget";
import { probeStats } from "../video/probeStats";
import { packStore } from "./packStore";
import type { Sticker } from "./sticker";

export async function submitSegmentedStickerImage(
  stickerId: string,
  pngBytes: Buffer,
  ffmpegPath: string
): Promise<void> {
  const sticker = packStore.findSticker(stickerId);
  if (!sticker) {
    throw new Error(`Cannot submit segmented image for unknown sticker ${stickerId}`);
  }
  if (sticker.stats.animated) {
    await cutOutAnimation(sticker, pngBytes, ffmpegPath);
  } else {
    await replaceStickerWithImage(sticker, pngBytes);
  }
}

async function cutOutAnimation(sticker: Sticker, pngBytes: Buffer, ffmpegPath: string): Promise<void> {
  const { workingDir } = packStore.state;
  const mattePath = join(workingDir, `${sticker.id}.matte.png`);
  await writeFile(mattePath, pngBytes);
  const mattedPath = join(workingDir, `${sticker.id}.matted.webm`);
  await applyAlphaMatte(sticker.sourcePath, mattePath, mattedPath, ffmpegPath);
  sticker.sourcePath = mattedPath;
  sticker.stats = await probeStats(mattedPath, ffmpegPath);
  const outputPath = join(workingDir, `${sticker.id}.apng`);
  await fitAnimatedStickerUnderBudget(mattedPath, outputPath, ffmpegPath);
  sticker.processedPath = outputPath;
  sticker.processedStats = await probeStats(outputPath, ffmpegPath);
  sticker.thumbnailDataUrl = await makeThumbnailDataUrl(mattePath);
}

async function replaceStickerWithImage(sticker: Sticker, pngBytes: Buffer): Promise<void> {
  const segmentedPath = join(packStore.state.workingDir, `${sticker.id}.segmented.png`);
  await writeFile(segmentedPath, pngBytes);
  sticker.sourcePath = segmentedPath;
  sticker.stats = await readImageStats(segmentedPath);
  const result = await convertToStaticSticker(segmentedPath);
  const processedPath = join(packStore.state.workingDir, `${sticker.id}.${result.format}`);
  await writeFile(processedPath, result.bytes);
  sticker.processedPath = processedPath;
  sticker.processedStats = await readImageStats(processedPath);
  sticker.thumbnailDataUrl = await makeThumbnailDataUrl(segmentedPath);
}
