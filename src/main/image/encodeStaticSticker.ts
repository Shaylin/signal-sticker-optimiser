import sharp from "sharp";

export type StaticStickerFormat = "webp" | "png";

export interface EncodeStaticStickerOptions {
  format: StaticStickerFormat;
  quality?: number;
}

export async function encodeStaticSticker(input: Buffer, options: EncodeStaticStickerOptions): Promise<Buffer> {
  const image = sharp(input);
  if (options.format === "webp") {
    return image.webp({ quality: options.quality ?? 80 }).toBuffer();
  }
  return image.png().toBuffer();
}
