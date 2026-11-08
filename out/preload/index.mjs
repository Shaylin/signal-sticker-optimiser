import { contextBridge } from "electron";
// src/preload/index.ts
contextBridge.exposeInMainWorld("studio", {});
export {};
