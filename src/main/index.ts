import { app, BrowserWindow } from "electron";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { registerIpcHandlers } from "./ipc/registerIpcHandlers";
import { registerSegmentationAssetsProtocol } from "./ipc/registerSegmentationAssetsProtocol";
import { registerSegmentationScheme } from "./ipc/registerSegmentationScheme";
import { packStore } from "./pack/packStore";
import { resolveFfmpegPath } from "./video/resolveFfmpegPath";

registerSegmentationScheme();

sharp.cache(false);

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.mjs"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(import.meta.dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  const workingDir = join(app.getPath("userData"), "sticker-work");
  await mkdir(workingDir, { recursive: true });
  packStore.configureWorkingDir(workingDir);

  const assetsDir = app.isPackaged ? join(process.resourcesPath, "onnx") : join(app.getAppPath(), "resources", "onnx");
  registerSegmentationAssetsProtocol(assetsDir);
  registerIpcHandlers(resolveFfmpegPath());

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
