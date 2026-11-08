import { useCallback, useEffect, useState } from "react";
import type { PackDto, StudioApi } from "../shared/studioApi";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";
import { useBackgroundRemoval } from "./useBackgroundRemoval";

export interface PackActions {
  pack: PackDto | null;
  busyStickerId: string | null;
  importFiles: () => Promise<void>;
  importFolder: () => Promise<void>;
  optimise: (stickerId: string) => Promise<void>;
  resize: (stickerId: string, canvasSize: number) => Promise<void>;
  remove: (stickerId: string) => Promise<void>;
  setEmoji: (stickerId: string, emoji: string) => Promise<void>;
  setPackInfo: (title: string, author: string) => Promise<void>;
  setCover: (stickerId: string | null) => Promise<void>;
  removeBackground: (stickerId: string, model: SegmentationModel) => Promise<void>;
}

export function usePackActions(): PackActions {
  const studio: StudioApi = window.studio;
  const [pack, setPack] = useState<PackDto | null>(null);
  const [busyStickerId, setBusyStickerId] = useState<string | null>(null);

  useEffect(() => {
    studio.getPack().then(setPack);
  }, [studio]);

  const applyBusy = useCallback(
    async (stickerId: string | null, action: () => Promise<PackDto>): Promise<void> => {
      setBusyStickerId(stickerId);
      try {
        setPack(await action());
      } finally {
        setBusyStickerId(null);
      }
    },
    []
  );

  return {
    pack,
    busyStickerId,
    importFiles: () => applyBusy(null, studio.importViaFilePicker),
    importFolder: () => applyBusy(null, studio.importViaFolderPicker),
    optimise: (stickerId) => applyBusy(stickerId, () => studio.optimiseSticker(stickerId)),
    resize: (stickerId, size) => applyBusy(stickerId, () => studio.resizeSticker(stickerId, size)),
    remove: (stickerId) => applyBusy(stickerId, () => studio.removeSticker(stickerId)),
    setEmoji: (stickerId, emoji) => applyBusy(stickerId, () => studio.setStickerEmoji(stickerId, emoji)),
    setPackInfo: (title, author) => applyBusy(null, () => studio.setPackInfo(title, author)),
    setCover: (stickerId) => applyBusy(null, () => studio.setCoverSticker(stickerId)),
    removeBackground: useBackgroundRemoval(studio, applyBusy)
  };
}
