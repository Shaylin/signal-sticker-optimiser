import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { convertToStaticSticker } from "../image/convertToStaticSticker";
import { makeThumbnailDataUrl } from "../image/makeThumbnailDataUrl";
import { readImageStats } from "../image/readImageStats";
import { packStore } from "./packStore";

export async function submitSegmentedStickerImage(stickerId: string, pngBytes: Buffer): Promise<void> {
  const sticker = packStore.findSticker(stickerId);
  if (!sticker) {
    throw new Error(`Cannot submit segmented image for unknown sticker ${stickerId}`);
  }
  const segmentedPath = join(packStore.state.workingDir, `${stickerId}.segmented.png`);
  await writeFile(segmentedPath, pngBytes);
  sticker.sourcePath = segmentedPath;
  sticker.stats = await readImageStats(segmentedPath);
  const result = await convertToStaticSticker(segmentedPath);
  const processedPath = join(packStore.state.workingDir, `${stickerId}.${result.format}`);
  await writeFile(processedPath, result.bytes);
  sticker.processedPath = processedPath;
  sticker.processedStats = await readImageStats(processedPath);
  sticker.thumbnailDataUrl = await makeThumbnailDataUrl(segmentedPath);
}
