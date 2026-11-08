import { BrowserWindow, app } from "electron";
import { join } from "node:path";
// src/main/index.ts
function createWindow() {
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
	if (process.env.ELECTRON_RENDERER_URL) mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	else mainWindow.loadFile(join(import.meta.dirname, "../renderer/index.html"));
}
app.whenReady().then(() => {
	createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
export {};
