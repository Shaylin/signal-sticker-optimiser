import { MAX_PACK_STICKERS } from "../main/validation/withinPackSize";
import type { PackDto } from "../shared/studioApi";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";

export interface PackPanelProps {
  pack: PackDto | null;
  segmentationModel: SegmentationModel;
  onSegmentationModelChange: (model: SegmentationModel) => void;
  onImportFiles: () => void;
  onImportFolder: () => void;
  onPackInfoChange: (title: string, author: string) => void;
}

export function PackPanel(props: PackPanelProps): React.JSX.Element {
  const { pack, segmentationModel, onSegmentationModelChange } = props;
  const { onImportFiles, onImportFolder, onPackInfoChange } = props;
  return (
    <>
      <div className="pack-panel">
        <input
          aria-label="Pack title"
          placeholder="Pack title"
          defaultValue={pack?.title ?? ""}
          key={`title-${pack?.title ?? ""}`}
          onBlur={(event) => onPackInfoChange(event.target.value, pack?.author ?? "")}
        />
        <input
          aria-label="Pack author"
          placeholder="Author"
          defaultValue={pack?.author ?? ""}
          key={`author-${pack?.author ?? ""}`}
          onBlur={(event) => onPackInfoChange(pack?.title ?? "", event.target.value)}
        />
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
      <div className="actions">
        <button onClick={onImportFiles}>Import files…</button>
        <button onClick={onImportFolder}>Import folder…</button>
      </div>
    </>
  );
}
