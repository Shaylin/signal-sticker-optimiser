import { contextBridge, ipcRenderer } from "electron";
import { IpcChannels, segmentationAssetBaseUrl } from "../shared/ipcChannels";
import type { PackDto, StudioApi } from "../shared/studioApi";

const studioApi: StudioApi = {
  getPack: () => ipcRenderer.invoke(IpcChannels.getPack),
  getStickerSourceBytes: (stickerId) => ipcRenderer.invoke(IpcChannels.getStickerSourceBytes, stickerId),
  importViaFilePicker: () => ipcRenderer.invoke(IpcChannels.importViaFilePicker),
  importViaFolderPicker: () => ipcRenderer.invoke(IpcChannels.importViaFolderPicker),
  importPaths: (paths) => ipcRenderer.invoke(IpcChannels.importPaths, paths),
  removeSticker: (stickerId) => ipcRenderer.invoke(IpcChannels.removeSticker, stickerId),
  optimiseSticker: (stickerId) => ipcRenderer.invoke(IpcChannels.optimiseSticker, stickerId),
  resizeSticker: (stickerId, canvasSize) => ipcRenderer.invoke(IpcChannels.resizeSticker, stickerId, canvasSize),
  submitSegmentedStickerImage: (stickerId, pngBytes) =>
    ipcRenderer.invoke(IpcChannels.submitSegmentedStickerImage, stickerId, pngBytes),
  exportViaFolderPicker: () => ipcRenderer.invoke(IpcChannels.exportViaFolderPicker),
  segmentationAssetBaseUrl
};

contextBridge.exposeInMainWorld("studio", studioApi satisfies StudioApi);

export type { PackDto, StudioApi };
