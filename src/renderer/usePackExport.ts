import { useCallback } from "react";
import type { StudioApi } from "../shared/studioApi";
import { describeFailure } from "./describeFailure";
import type { NotificationKind } from "./notification";

export function usePackExport(
  studio: StudioApi,
  notify: (kind: NotificationKind, message: string) => void
): () => Promise<void> {
  return useCallback(async (): Promise<void> => {
    try {
      const exported = await studio.exportViaFolderPicker();
      const count = exported?.files.length ?? 0;
      const message = exported ? `Exported ${count} stickers to ${exported.directory}` : "Export cancelled";
      notify("info", message);
    } catch (error) {
      notify("error", describeFailure(error));
    }
  }, [studio, notify]);
}
