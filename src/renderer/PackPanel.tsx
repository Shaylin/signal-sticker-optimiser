import type { PackDto } from "../shared/studioApi";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";
import { PackActionsBar } from "./PackActionsBar";
import { PackSettings } from "./PackSettings";

export interface PackPanelProps {
  pack: PackDto | null;
  segmentationModel: SegmentationModel;
  onSegmentationModelChange: (model: SegmentationModel) => void;
  onImportFiles: () => void;
  onImportFolder: () => void;
  onExportPack: () => void;
}

export function PackPanel(props: PackPanelProps): React.JSX.Element {
  return (
    <>
      <PackSettings
        pack={props.pack}
        segmentationModel={props.segmentationModel}
        onSegmentationModelChange={props.onSegmentationModelChange}
      />
      <PackActionsBar
        stickerCount={props.pack?.stickers.length ?? 0}
        onImportFiles={props.onImportFiles}
        onImportFolder={props.onImportFolder}
        onExportPack={props.onExportPack}
      />
    </>
  );
}
