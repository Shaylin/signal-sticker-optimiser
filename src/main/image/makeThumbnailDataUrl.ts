import { readFile } from "node:fs/promises";
import sharp from "sharp";

export async function makeThumbnailDataUrl(sourcePath: string, size = 128): Promise<string> {
  const png = await sharp(await readFile(sourcePath), { pages: 1 })
    .resize(size, size, { fit: "inside" })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}
