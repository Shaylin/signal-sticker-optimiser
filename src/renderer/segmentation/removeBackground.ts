import { removeBackground as runImglyRemoval } from "@imgly/background-removal";

const onnxModel = "isnet_quint8";

export interface RemoveBackgroundOptions {
  assetBaseUrl: string;
}

export async function removeBackground(input: Blob, options: RemoveBackgroundOptions): Promise<Blob> {
  return runImglyRemoval(input, {
    model: onnxModel,
    publicPath: options.assetBaseUrl,
    proxyToWorker: false,
    output: { format: "image/png", quality: 1 }
  });
}
