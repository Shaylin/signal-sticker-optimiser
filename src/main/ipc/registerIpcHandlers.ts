import { registerImportHandlers } from "./registerImportHandlers";
import { registerExportHandlers } from "./registerExportHandlers";
import { registerPackEditHandlers } from "./registerPackEditHandlers";
import { registerStickerDataHandlers } from "./registerStickerDataHandlers";
import { registerStickerProcessingHandlers } from "./registerStickerProcessingHandlers";

export function registerIpcHandlers(ffmpegPath: string): void {
  registerStickerDataHandlers();
  registerImportHandlers(ffmpegPath);
  registerPackEditHandlers();
  registerStickerProcessingHandlers(ffmpegPath);
  registerExportHandlers();
}
