import { useCallback, useState } from "react";
import type { StudioApi } from "../shared/studioApi";
import { describeFailure } from "./describeFailure";
import type { NotificationKind } from "./notification";

export interface PackExportState {
  exportPack: () => Promise<void>;
  isExporting: boolean;
}

export function usePackExport(
  studio: StudioApi,
  notify: (kind: NotificationKind, message: string) => void
): PackExportState {
  const [isExporting, setIsExporting] = useState(false);

  const exportPack = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    try {
      const exported = await studio.exportViaFolderPicker();
      const count = exported?.files.length ?? 0;
      const message = exported ? `Exported ${count} stickers to ${exported.directory}` : "Export cancelled";
      notify("info", message);
    } catch (error) {
      notify("error", describeFailure(error));
    } finally {
      setIsExporting(false);
    }
  }, [studio, notify]);

  return { exportPack, isExporting };
}
