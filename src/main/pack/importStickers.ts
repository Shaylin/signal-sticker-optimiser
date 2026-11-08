import { randomUUID } from "node:crypto";
import { readdir, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { convertToStaticSticker } from "../image/convertToStaticSticker";
import { readImageStats } from "../image/readImageStats";
import { encodeAnimatedSticker } from "../video/encodeAnimatedSticker";
import { probeStats } from "../video/probeStats";
import { packStore } from "./packStore";
import type { Sticker } from "./sticker";
import { thumbnailForSource } from "./thumbnailForSource";

const supportedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".webm", ".gif", ".avif"];

export interface ImportSummary {
  added: number;
  rejectedByPackSize: number;
}

export async function importPaths(paths: string[], ffmpegPath: string): Promise<ImportSummary> {
  const stickers: Sticker[] = [];
  for (const filePath of paths) {
    stickers.push(await createSticker(filePath, ffmpegPath));
  }
  const added = packStore.addStickers(stickers);
  return { added, rejectedByPackSize: stickers.length - added };
}

export async function expandToFilePaths(paths: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const entryPath of paths) {
    if ((await stat(entryPath)).isDirectory()) {
      const entries = await readdir(entryPath);
      files.push(...entries.filter(isSupportedFile).map((name) => join(entryPath, name)));
    } else if (isSupportedFile(entryPath)) {
      files.push(entryPath);
    }
  }
  return files;
}

function isSupportedFile(filePath: string): boolean {
  return supportedExtensions.includes(extname(filePath).toLowerCase());
}

async function createSticker(sourcePath: string, ffmpegPath: string): Promise<Sticker> {
  const animated = sourcePath.endsWith(".webm");
  const stats = animated ? await probeStats(sourcePath, ffmpegPath) : await readImageStats(sourcePath);
  const id = randomUUID();
  const thumbnailDataUrl = await thumbnailForSource(sourcePath, packStore.state.workingDir, ffmpegPath);
  const processedPath = await encodeDefaultPreview(id, sourcePath, animated, ffmpegPath);
  const processedStats = animated ? await probeStats(processedPath, ffmpegPath) : await readImageStats(processedPath);
  return { id, sourcePath, stats, processedPath, processedStats, thumbnailDataUrl };
}

async function encodeDefaultPreview(
  stickerId: string,
  sourcePath: string,
  animated: boolean,
  ffmpegPath: string
): Promise<string> {
  if (animated) {
    const outputPath = join(packStore.state.workingDir, `${stickerId}.apng`);
    await encodeAnimatedSticker(sourcePath, outputPath, ffmpegPath);
    return outputPath;
  }
  const result = await convertToStaticSticker(sourcePath);
  const outputPath = join(packStore.state.workingDir, `${stickerId}.${result.format}`);
  await writeFile(outputPath, result.bytes);
  return outputPath;
}
