import { ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import { packStore } from "../pack/packStore";
import { packToDto } from "../pack/packToDto";

export function registerPackEditHandlers(): void {
  ipcMain.handle(IpcChannels.removeSticker, (_event, stickerId: string) => {
    packStore.removeSticker(stickerId);
    return packToDto(packStore.state);
  });

  ipcMain.handle(IpcChannels.setStickerEmoji, (_event, stickerId: string, emoji: string) => {
    const sticker = packStore.findSticker(stickerId);
    if (sticker) {
      sticker.emoji = emoji;
    }
    return packToDto(packStore.state);
  });

  ipcMain.handle(IpcChannels.setPackInfo, (_event, title: string, author: string) => {
    packStore.setPackInfo(title, author);
    return packToDto(packStore.state);
  });

  ipcMain.handle(IpcChannels.setCoverSticker, (_event, stickerId: string | null) => {
    packStore.setCoverSticker(stickerId);
    return packToDto(packStore.state);
  });
}
