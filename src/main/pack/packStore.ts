import type { Sticker } from "./sticker";
import { MAX_PACK_STICKERS } from "../validation/withinPackSize";

export interface PackState {
  title: string;
  author: string;
  coverStickerId: string | null;
  stickers: Sticker[];
  workingDir: string;
}

const state: PackState = {
  title: "",
  author: "",
  coverStickerId: null,
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
    if (state.coverStickerId === null && accepted.length > 0) {
      state.coverStickerId = accepted[0].id;
    }
    return accepted.length;
  },

  findSticker(stickerId: string): Sticker | undefined {
    return state.stickers.find((sticker) => sticker.id === stickerId);
  },

  removeSticker(stickerId: string): void {
    state.stickers = state.stickers.filter((sticker) => sticker.id !== stickerId);
    if (state.coverStickerId === stickerId) {
      state.coverStickerId = state.stickers[0]?.id ?? null;
    }
  },

  setPackInfo(title: string, author: string): void {
    state.title = title;
    state.author = author;
  },

  setCoverSticker(stickerId: string | null): void {
    state.coverStickerId = stickerId;
  }
};
