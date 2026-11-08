import { describe, expect, it } from "vitest";
import { segmentationModelToOnnx } from "./segmentationModelToOnnx";

describe("segmentationModelToOnnx", () => {
  it("maps the small model to the quantized isnet", () => {
    expect(segmentationModelToOnnx("small")).toBe("isnet_quint8");
  });

  it("maps the medium model to the fp16 isnet", () => {
    expect(segmentationModelToOnnx("medium")).toBe("isnet_fp16");
  });
});
