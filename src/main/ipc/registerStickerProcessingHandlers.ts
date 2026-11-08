import { ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import { optimiseSticker } from "../pack/optimiseSticker";
import { packToDto } from "../pack/packToDto";
import { packStore } from "../pack/packStore";
import { resizeSticker } from "../pack/resizeSticker";
import { submitSegmentedStickerImage } from "../pack/submitSegmentedStickerImage";

export function registerStickerProcessingHandlers(ffmpegPath: string): void {
  ipcMain.handle(IpcChannels.optimiseSticker, async (_event, stickerId: string) => {
    await optimiseSticker(stickerId, ffmpegPath);
    return packToDto(packStore.state);
  });

  ipcMain.handle(IpcChannels.resizeSticker, async (_event, stickerId: string, canvasSize: number) => {
    await resizeSticker(stickerId, canvasSize, ffmpegPath);
    return packToDto(packStore.state);
  });

  ipcMain.handle(IpcChannels.submitSegmentedStickerImage, async (_event, stickerId: string, pngBytes: ArrayBuffer) => {
    await submitSegmentedStickerImage(stickerId, Buffer.from(pngBytes), ffmpegPath);
    return packToDto(packStore.state);
  });
}
