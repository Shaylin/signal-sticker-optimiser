import { ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import { packStore } from "../pack/packStore";
import { packToDto } from "../pack/packToDto";
import { stickerSegmentationSource } from "../pack/stickerSegmentationSource";

export function registerStickerDataHandlers(ffmpegPath: string): void {
  ipcMain.handle(IpcChannels.getPack, () => packToDto(packStore.state));

  ipcMain.handle(IpcChannels.getStickerSource, async (_event, stickerId: string) => {
    const sticker = packStore.findSticker(stickerId);
    if (!sticker) {
      throw new Error(`Unknown sticker ${stickerId}`);
    }
    return stickerSegmentationSource(sticker, packStore.state.workingDir, ffmpegPath);
  });
}
