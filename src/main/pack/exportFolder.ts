import { copyFile, mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { withinByteBudget } from "../validation/withinByteBudget";
import { withinDuration } from "../validation/withinDuration";
import type { Sticker } from "./sticker";
import type { StickerPack } from "./stickerPack";

export interface ExportedFolder {
  directory: string;
  files: string[];
}

type ReadySticker = Sticker & { processedPath: string; processedStats: NonNullable<Sticker["processedStats"]> };

export async function exportFolder(pack: StickerPack, directory: string): Promise<ExportedFolder> {
  const ready = pack.stickers.filter(isReadyForExport);
  assertAllStickersReady(pack, ready);
  await mkdir(directory, { recursive: true });
  const files = ready.map((sticker, index) => exportNameFor(sticker, index));
  await Promise.all(ready.map((sticker, index) => copyFile(sticker.processedPath, join(directory, files[index]))));
  return { directory, files };
}

function exportNameFor(sticker: ReadySticker, index: number): string {
  return `${String(index + 1).padStart(3, "0")}${extname(sticker.processedPath)}`;
}

function assertAllStickersReady(pack: StickerPack, ready: ReadySticker[]): void {
  if (ready.length === pack.stickers.length) {
    return;
  }
  const offenders = pack.stickers.filter((sticker) => !isReadyForExport(sticker));
  const names = offenders.map((sticker) => basename(sticker.sourcePath)).join(", ");
  throw new Error(`Stickers are not within Signal limits, optimise them first: ${names}`);
}

function isReadyForExport(sticker: Sticker): sticker is ReadySticker {
  const stats = sticker.processedStats;
  return sticker.processedPath !== null && stats !== null && withinByteBudget(stats) && withinDuration(stats);
}
