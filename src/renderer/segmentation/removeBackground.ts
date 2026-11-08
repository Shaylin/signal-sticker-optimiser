import { removeBackground as runImglyRemoval } from "@imgly/background-removal";
import { segmentationModelToOnnx, type SegmentationModel } from "./segmentationModelToOnnx";

export interface RemoveBackgroundOptions {
  model: SegmentationModel;
  assetBaseUrl: string;
}

export async function removeBackground(input: Blob, options: RemoveBackgroundOptions): Promise<Blob> {
  return runImglyRemoval(input, {
    model: segmentationModelToOnnx(options.model),
    publicPath: options.assetBaseUrl,
    proxyToWorker: false,
    output: { format: "image/png", quality: 1 }
  });
}
