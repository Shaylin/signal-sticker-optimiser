import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { encodeStaticSticker } from "./encodeStaticSticker";

async function checkerboard(): Promise<Buffer> {
  const size = 128;
  const channels = 4;
  const data = Buffer.alloc(size * size * channels);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * channels;
      const on = (x >> 4) % 2 === (y >> 4) % 2;
      data[offset] = on ? 255 : 0;
      data[offset + 1] = on ? 0 : 255;
      data[offset + 2] = 0;
      data[offset + 3] = 255;
    }
  }
  return sharp(data, { raw: { width: size, height: size, channels } })
    .png()
    .toBuffer();
}

describe("encodeStaticSticker", () => {
  it("encodes to webp when asked", async () => {
    const encoded = await encodeStaticSticker(await checkerboard(), { format: "webp" });
    const metadata = await sharp(encoded).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(128);
  });

  it("encodes to png when asked", async () => {
    const encoded = await encodeStaticSticker(await checkerboard(), { format: "png" });
    const metadata = await sharp(encoded).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(128);
  });

  it("produces smaller webp output at lower quality", async () => {
    const source = await checkerboard();
    const high = await encodeStaticSticker(source, { format: "webp", quality: 90 });
    const low = await encodeStaticSticker(source, { format: "webp", quality: 30 });
    expect(low.byteLength).toBeLessThan(high.byteLength);
  });

  it("preserves alpha in webp output", async () => {
    const transparent = await sharp({
      create: { width: 16, height: 16, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .png()
      .toBuffer();
    const encoded = await encodeStaticSticker(transparent, { format: "webp" });
    const { info } = await sharp(encoded).raw().toBuffer({ resolveWithObject: true });
    expect(info.channels).toBe(4);
  });
});
