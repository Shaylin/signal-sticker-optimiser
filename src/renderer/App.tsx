import { useState } from "react";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";
import { NotificationList } from "./NotificationList";
import { PackPanel } from "./PackPanel";
import { StickerGrid } from "./StickerGrid";
import { usePackActions } from "./usePackActions";

export function App(): React.JSX.Element {
  const [segmentationModel, setSegmentationModel] = useState<SegmentationModel>("small");
  const actions = usePackActions();

  return (
    <main>
      <header>
        <h1>Signal Sticker Studio</h1>
        <PackPanel
          pack={actions.pack}
          segmentationModel={segmentationModel}
          onSegmentationModelChange={setSegmentationModel}
          onImportFiles={actions.importFiles}
          onImportFolder={actions.importFolder}
          onExportPack={actions.exportPack}
        />
      </header>
      <StickerGrid
        pack={actions.pack}
        busyStickerId={actions.busyStickerId}
        segmentationModel={segmentationModel}
        actions={actions}
      />
      <NotificationList notifications={actions.notifications} onDismiss={actions.dismissNotification} />
    </main>
  );
}
