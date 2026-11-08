import type { Sticker } from "./sticker";
import { MAX_PACK_STICKERS } from "../validation/withinPackSize";

export interface PackState {
  stickers: Sticker[];
  workingDir: string;
}

const state: PackState = {
  stickers: [],
  workingDir: ""
};

export const packStore = {
  state,

  configureWorkingDir(workingDir: string): void {
    state.workingDir = workingDir;
  },

  addStickers(stickers: Sticker[]): number {
    const freeSlots = MAX_PACK_STICKERS - state.stickers.length;
    const accepted = stickers.slice(0, Math.max(freeSlots, 0));
    state.stickers.push(...accepted);
    return accepted.length;
  },

  findSticker(stickerId: string): Sticker | undefined {
    return state.stickers.find((sticker) => sticker.id === stickerId);
  },

  removeSticker(stickerId: string): void {
    state.stickers = state.stickers.filter((sticker) => sticker.id !== stickerId);
  }
};
