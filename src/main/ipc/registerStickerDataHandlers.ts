import { readFile } from "node:fs/promises";
import { ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import { packStore } from "../pack/packStore";
import { packToDto } from "../pack/packToDto";

export function registerStickerDataHandlers(): void {
  ipcMain.handle(IpcChannels.getPack, () => packToDto(packStore.state));
  ipcMain.handle(IpcChannels.getStickerSourceBytes, async (_event, stickerId: string) => {
    const sticker = packStore.findSticker(stickerId);
    if (!sticker) {
      throw new Error(`Unknown sticker ${stickerId}`);
    }
    const bytes = await readFile(sticker.sourcePath);
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  });
}
