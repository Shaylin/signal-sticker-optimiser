import { inject } from "vitest";
import { describe, expect, it } from "vitest";

declare module "vitest" {
  interface ProvidedContext {
    segmentationAssetOrigin: string;
  }
}
import { removeBackground } from "./removeBackground";

const integrationEnabled = (import.meta.env as Record<string, string>).SEGMENTATION_INTEGRATION === "1";

function pngHasAlphaChannel(bytes: Uint8Array): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((byte, index) => bytes[index] === byte)) {
    return false;
  }
  return bytes[25] === 6;
}

describe.runIf(integrationEnabled)("background removal integration (SEGMENTATION_INTEGRATION=1)", () => {
  it("removes the background of webp/29 and returns an alpha png with transparent pixels", async () => {
    const assetBaseUrl = `${inject("segmentationAssetOrigin")}/`;
    const source = await fetch("/examples/webp/29.webp");
    const input = new Blob([await source.arrayBuffer()], { type: "image/webp" });

    const output = await removeBackground(input, { model: "small", assetBaseUrl });

    const bytes = new Uint8Array(await output.arrayBuffer());
    expect(pngHasAlphaChannel(bytes)).toBe(true);
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
    let transparentPixels = 0;
    for (let offset = 3; offset < data.length; offset += 4) {
      if (data[offset] < 128) {
        transparentPixels++;
      }
    }
    expect(transparentPixels).toBeGreaterThan(0);
  }, 300_000);
});
