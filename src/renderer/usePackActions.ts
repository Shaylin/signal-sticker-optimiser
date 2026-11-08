import { useEffect, useState } from "react";
import type { PackDto, StudioApi } from "../shared/studioApi";
import type { Notification } from "./notification";
import { describeFailure } from "./describeFailure";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";
import { useBackgroundRemoval } from "./useBackgroundRemoval";
import { useNotifications } from "./useNotifications";
import { usePackExport } from "./usePackExport";
import { usePackMutation } from "./usePackMutation";

export interface PackActions {
  pack: PackDto | null;
  busyStickerId: string | null;
  notifications: Notification[];
  dismissNotification: (notificationId: number) => void;
  importFiles: () => Promise<void>;
  importFolder: () => Promise<void>;
  exportPack: () => Promise<void>;
  optimise: (stickerId: string) => Promise<void>;
  resize: (stickerId: string, canvasSize: number) => Promise<void>;
  remove: (stickerId: string) => Promise<void>;
  removeBackground: (stickerId: string, model: SegmentationModel) => Promise<void>;
}

export function usePackActions(): PackActions {
  const studio: StudioApi = window.studio;
  const [pack, setPack] = useState<PackDto | null>(null);
  const { notifications, notify, dismiss } = useNotifications();
  const { busyStickerId, applyMutation } = usePackMutation(setPack, notify);
  const exportPack = usePackExport(studio, notify);

  useEffect(() => {
    studio
      .getPack()
      .then(setPack)
      .catch((error: unknown) => notify("error", describeFailure(error)));
  }, [studio, notify]);

  return {
    pack,
    busyStickerId,
    notifications,
    dismissNotification: dismiss,
    importFiles: () => applyMutation(null, studio.importViaFilePicker),
    importFolder: () => applyMutation(null, studio.importViaFolderPicker),
    exportPack,
    optimise: (stickerId) => applyMutation(stickerId, () => studio.optimiseSticker(stickerId)),
    resize: (stickerId, size) => applyMutation(stickerId, () => studio.resizeSticker(stickerId, size)),
    remove: (stickerId) => applyMutation(stickerId, () => studio.removeSticker(stickerId)),
    removeBackground: useBackgroundRemoval(studio, applyMutation)
  };
}
