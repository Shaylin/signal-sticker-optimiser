import { writeFile } from "node:fs/promises";
import { encodeStaticSticker } from "./encodeStaticSticker";
import { fitToSquareCanvas } from "./fitToSquareCanvas";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import type { StaticStickerFormat } from "./encodeStaticSticker";

export interface StaticFitResult {
  format: StaticStickerFormat;
  canvasSize: number;
  quality: number;
}

const canvasLadder = [512, 320, 256];
const qualityLadder = [80, 60, 40];

export async function fitStaticStickerUnderBudget(sourceBuffer: Buffer, outputPath: string): Promise<StaticFitResult> {
  for (const canvasSize of canvasLadder) {
    const fitted = await fitToSquareCanvas(sourceBuffer, canvasSize);
    for (const quality of qualityLadder) {
      const webp = await encodeStaticSticker(fitted, { format: "webp", quality });
      if (webp.byteLength <= MAX_STICKER_BYTES) {
        await writeFile(outputPath, webp);
        return { format: "webp", canvasSize, quality };
      }
    }
    const png = await encodeStaticSticker(fitted, { format: "png" });
    if (png.byteLength <= MAX_STICKER_BYTES) {
      await writeFile(outputPath, png);
      return { format: "png", canvasSize, quality: qualityLadder[0] };
    }
  }
  throw new Error(`No static ladder rung produced a file under ${MAX_STICKER_BYTES} bytes`);
}
