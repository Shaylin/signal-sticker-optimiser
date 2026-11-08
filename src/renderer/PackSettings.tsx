import { MAX_PACK_STICKERS } from "../main/validation/withinPackSize";
import type { PackDto } from "../shared/studioApi";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";

export interface PackSettingsProps {
  pack: PackDto | null;
  segmentationModel: SegmentationModel;
  onSegmentationModelChange: (model: SegmentationModel) => void;
}

export function PackSettings(props: PackSettingsProps): React.JSX.Element {
  const { pack, segmentationModel, onSegmentationModelChange } = props;
  return (
    <div className="pack-panel">
      <select
        aria-label="Segmentation model"
        value={segmentationModel}
        onChange={(event) => onSegmentationModelChange(event.target.value as SegmentationModel)}
      >
        <option value="small">bg model: small</option>
        <option value="medium">bg model: medium</option>
      </select>
      <span className="pack-count">
        {pack?.stickers.length ?? 0} / {MAX_PACK_STICKERS}
      </span>
    </div>
  );
}
