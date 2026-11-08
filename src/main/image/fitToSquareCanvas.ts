import sharp from "sharp";
import { MAX_STICKER_DIMENSION } from "../validation/withinDimensions";

export const MARGIN_PIXELS = 16;

export async function fitToSquareCanvas(input: Buffer, canvasSize: number = MAX_STICKER_DIMENSION): Promise<Buffer> {
  const interiorSize = canvasSize - 2 * MARGIN_PIXELS;
  const contained = await sharp(input)
    .ensureAlpha()
    .resize(interiorSize, interiorSize, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  return sharp(contained)
    .extend({
      top: MARGIN_PIXELS,
      bottom: MARGIN_PIXELS,
      left: MARGIN_PIXELS,
      right: MARGIN_PIXELS,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
}
