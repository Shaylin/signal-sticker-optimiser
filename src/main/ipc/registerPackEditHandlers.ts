import { ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import { packStore } from "../pack/packStore";
import { packToDto } from "../pack/packToDto";

export function registerPackEditHandlers(): void {
  ipcMain.handle(IpcChannels.removeSticker, (_event, stickerId: string) => {
    packStore.removeSticker(stickerId);
    return packToDto(packStore.state);
  });
}
