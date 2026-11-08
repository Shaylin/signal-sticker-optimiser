import { BrowserWindow, dialog, ipcMain } from "electron";
import { IpcChannels } from "../../shared/ipcChannels";
import { expandToFilePaths, importPaths } from "../pack/importStickers";
import { packStore } from "../pack/packStore";
import { packToDto } from "../pack/packToDto";

const imageFilters = [{ name: "Sticker images", extensions: ["png", "jpg", "jpeg", "webp", "webm", "gif", "avif"] }];

export function registerImportHandlers(ffmpegPath: string): void {
  ipcMain.handle(IpcChannels.importViaFilePicker, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const properties: ("openFile" | "multiSelections")[] = ["openFile", "multiSelections"];
    const options = { properties, filters: imageFilters };
    const result = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options);
    return result.canceled ? packToDto(packStore.state) : importAndRespond(result.filePaths, ffmpegPath);
  });

  ipcMain.handle(IpcChannels.importViaFolderPicker, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const options = { properties: ["openDirectory"] as "openDirectory"[] };
    const result = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options);
    return result.canceled ? packToDto(packStore.state) : importAndRespond(result.filePaths, ffmpegPath);
  });

  ipcMain.handle(IpcChannels.importPaths, async (_event, paths: string[]) => {
    return importAndRespond(paths, ffmpegPath);
  });
}

async function importAndRespond(paths: string[], ffmpegPath: string) {
  const files = await expandToFilePaths(paths);
  await importPaths(files, ffmpegPath);
  return packToDto(packStore.state);
}
