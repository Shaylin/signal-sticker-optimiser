import type { PackDto, StickerDto } from "../shared/studioApi";
import type { PackActions } from "./usePackActions";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";
import { StickerTile } from "./StickerTile";
import type { StickerTileActions } from "./StickerTile";

export interface StickerGridProps {
  pack: PackDto | null;
  busyStickerId: string | null;
  segmentationModel: SegmentationModel;
  actions: PackActions;
}

export function StickerGrid(props: StickerGridProps): React.JSX.Element {
  const { pack, busyStickerId, segmentationModel, actions } = props;
  return (
    <section className="grid">
      {(pack?.stickers ?? []).map((sticker) => (
        <StickerTile
          key={sticker.id}
          sticker={sticker}
          busy={busyStickerId === sticker.id}
          actions={tileActionsFor(sticker, segmentationModel, actions)}
        />
      ))}
    </section>
  );
}

function tileActionsFor(
  sticker: StickerDto,
  segmentationModel: SegmentationModel,
  actions: PackActions
): StickerTileActions {
  return {
    optimise: () => actions.optimise(sticker.id),
    resize: (size) => actions.resize(sticker.id, size),
    removeBackground: () => actions.removeBackground(sticker.id, segmentationModel),
    remove: () => actions.remove(sticker.id)
  };
}
