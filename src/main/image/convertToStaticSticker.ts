import { readFile } from "node:fs/promises";
import { encodeStaticSticker } from "./encodeStaticSticker";
import { fitToSquareCanvas } from "./fitToSquareCanvas";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";

export interface StaticConversionResult {
  bytes: Buffer;
  format: "webp" | "png";
}

export async function convertToStaticSticker(sourcePath: string): Promise<StaticConversionResult> {
  const source = await readFile(sourcePath);
  const fitted = await fitToSquareCanvas(source);
  const webp = await encodeStaticSticker(fitted, { format: "webp" });
  if (webp.byteLength <= MAX_STICKER_BYTES) {
    return { bytes: webp, format: "webp" };
  }
  const png = await encodeStaticSticker(fitted, { format: "png" });
  if (png.byteLength < webp.byteLength) {
    return { bytes: png, format: "png" };
  }
  return { bytes: webp, format: "webp" };
}
