import { useCallback } from "react";
import type { StudioApi } from "../shared/studioApi";
import { removeBackground as runSegmentation } from "./segmentation/removeBackground";

import type { PackMutation } from "./usePackMutation";

export function useBackgroundRemoval(
  studio: StudioApi,
  applyMutation: PackMutation
): (stickerId: string) => Promise<void> {
  return useCallback(
    async (stickerId: string): Promise<void> => {
      await applyMutation(
        stickerId,
        async () => {
          const source = await studio.getStickerSource(stickerId);
          const image = new Blob([source.bytes], { type: source.mimeType });
          const output = await runSegmentation(image, { assetBaseUrl: studio.segmentationAssetBaseUrl });
          return studio.submitSegmentedStickerImage(stickerId, await output.arrayBuffer());
        },
        "Removing background…"
      );
    },
    [applyMutation, studio]
  );
}
