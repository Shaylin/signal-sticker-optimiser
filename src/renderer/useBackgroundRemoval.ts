import { useCallback } from "react";
import type { PackDto, StudioApi } from "../shared/studioApi";
import { removeBackground as runSegmentation } from "./segmentation/removeBackground";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";

export function useBackgroundRemoval(
  studio: StudioApi,
  applyBusy: (stickerId: string | null, action: () => Promise<PackDto>) => Promise<void>
): (stickerId: string, model: SegmentationModel) => Promise<void> {
  return useCallback(
    async (stickerId: string, model: SegmentationModel): Promise<void> => {
      await applyBusy(stickerId, async () => {
        const bytes = await studio.getStickerSourceBytes(stickerId);
        const output = await runSegmentation(new Blob([bytes]), {
          model,
          assetBaseUrl: studio.segmentationAssetBaseUrl
        });
        return studio.submitSegmentedStickerImage(stickerId, await output.arrayBuffer());
      });
    },
    [applyBusy, studio]
  );
}
