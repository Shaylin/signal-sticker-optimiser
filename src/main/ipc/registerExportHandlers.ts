import { BrowserWindow, dialog, ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import type { ExportedPackDto } from "../../shared/studioApi";
import { exportFolder } from "../pack/exportFolder";
import { packStore } from "../pack/packStore";

export function registerExportHandlers(): void {
  ipcMain.handle(IpcChannels.exportViaFolderPicker, async (event): Promise<ExportedPackDto | null> => {
    const options = {
      title: "Choose where to export the sticker pack",
      buttonLabel: "Export",
      properties: ["openDirectory", "createDirectory"] as ("openDirectory" | "createDirectory")[]
    };
    const window = BrowserWindow.fromWebContents(event.sender);
    const choice = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options);
    if (choice.canceled) {
      return null;
    }
    const exported = await exportFolder(packStore.state, choice.filePaths[0]);
    return { directory: exported.directory, files: exported.files };
  });
}
