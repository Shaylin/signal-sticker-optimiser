import { useEffect, useState } from "react";
import type { PackDto, StudioApi } from "../shared/studioApi";
import type { Notification } from "./notification";
import { describeFailure } from "./describeFailure";
import { useBackgroundRemoval } from "./useBackgroundRemoval";
import { useNotifications } from "./useNotifications";
import { usePackExport } from "./usePackExport";
import { usePackMutation } from "./usePackMutation";

export interface PackActions {
  pack: PackDto | null;
  busyStickerId: string | null;
  busyLabel: string | null;
  notifications: Notification[];
  dismissNotification: (notificationId: number) => void;
  importFiles: () => Promise<void>;
  importFolder: () => Promise<void>;
  exportPack: () => Promise<void>;
  optimise: (stickerId: string) => Promise<void>;
  resize: (stickerId: string, canvasSize: number) => Promise<void>;
  remove: (stickerId: string) => Promise<void>;
  removeBackground: (stickerId: string) => Promise<void>;
}

export function usePackActions(): PackActions {
  const studio: StudioApi = window.studio;
  const [pack, setPack] = useState<PackDto | null>(null);
  const { notifications, notify, dismiss } = useNotifications();
  const { busyStickerId, busyLabel, applyMutation } = usePackMutation(setPack, notify);
  const { exportPack, isExporting } = usePackExport(studio, notify);

  useEffect(() => {
    studio
      .getPack()
      .then(setPack)
      .catch((error: unknown) => notify("error", describeFailure(error)));
  }, [studio, notify]);

  return {
    pack,
    busyStickerId,
    busyLabel: isExporting ? "Exporting…" : busyLabel,
    notifications,
    dismissNotification: dismiss,
    importFiles: () => applyMutation(null, studio.importViaFilePicker, "Importing…"),
    importFolder: () => applyMutation(null, studio.importViaFolderPicker, "Importing…"),
    exportPack,
    optimise: (stickerId) => applyMutation(stickerId, () => studio.optimiseSticker(stickerId), "Optimising…"),
    resize: (stickerId, size) => applyMutation(stickerId, () => studio.resizeSticker(stickerId, size), "Resizing…"),
    remove: (stickerId) => applyMutation(stickerId, () => studio.removeSticker(stickerId), "Removing…"),
    removeBackground: useBackgroundRemoval(studio, applyMutation)
  };
}
