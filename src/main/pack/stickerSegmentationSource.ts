import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { StickerSourceDto } from "../../shared/studioApi";
import { extractPosterFrame } from "../video/extractPosterFrame";
import { sourceMimeType } from "./sourceMimeType";
import type { Sticker } from "./sticker";

export async function stickerSegmentationSource(
  sticker: Sticker,
  workingDir: string,
  ffmpegPath: string
): Promise<StickerSourceDto> {
  const sourcePath = sticker.stats.animated ? await posterFrameOf(sticker, workingDir, ffmpegPath) : sticker.sourcePath;
  return { mimeType: sourceMimeType(sourcePath), bytes: toArrayBuffer(await readFile(sourcePath)) };
}

async function posterFrameOf(sticker: Sticker, workingDir: string, ffmpegPath: string): Promise<string> {
  const framePath = join(workingDir, `${sticker.id}.segmentation-frame.png`);
  await extractPosterFrame(sticker.sourcePath, framePath, ffmpegPath);
  return framePath;
}

function toArrayBuffer(bytes: Buffer): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}
