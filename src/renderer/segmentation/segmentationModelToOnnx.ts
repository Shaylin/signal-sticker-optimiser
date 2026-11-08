export type SegmentationModel = "small" | "medium";

export function segmentationModelToOnnx(model: SegmentationModel): "isnet_quint8" | "isnet_fp16" {
  return model === "small" ? "isnet_quint8" : "isnet_fp16";
}
