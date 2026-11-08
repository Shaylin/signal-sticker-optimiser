import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { fitToSquareCanvas, MARGIN_PIXELS } from "./fitToSquareCanvas";

async function opaqueRect(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } }
  })
    .png()
    .toBuffer();
}

async function alphaAt(image: Buffer, x: number, y: number): Promise<number> {
  const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
  return data[(y * info.width + x) * info.channels + 3];
}

describe("fitToSquareCanvas", () => {
  it("produces a 512x512 square from a wide source", async () => {
    const output = await fitToSquareCanvas(await opaqueRect(100, 60));
    const metadata = await sharp(output).metadata();
    expect(metadata.width).toBe(512);
    expect(metadata.height).toBe(512);
  });

  it("leaves a fully transparent 16px margin", async () => {
    const output = await fitToSquareCanvas(await opaqueRect(100, 60));
    expect(await alphaAt(output, 0, 0)).toBe(0);
    expect(await alphaAt(output, MARGIN_PIXELS - 1, 256)).toBe(0);
    expect(await alphaAt(output, 511, 511)).toBe(0);
  });

  it("contains the source inside the canvas, centred", async () => {
    const output = await fitToSquareCanvas(await opaqueRect(100, 60));
    const centre = 256;
    const subjectTop = (512 - Math.round((60 / 100) * (512 - 2 * MARGIN_PIXELS))) / 2;
    expect(await alphaAt(output, centre, centre)).toBe(255);
    expect(await alphaAt(output, MARGIN_PIXELS, centre)).toBe(255);
    expect(await alphaAt(output, centre, subjectTop - 1)).toBe(0);
    expect(await alphaAt(output, centre, subjectTop)).toBe(255);
  });

  it("preserves existing transparency", async () => {
    const transparent = await sharp({
      create: { width: 50, height: 50, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .png()
      .toBuffer();
    const output = await fitToSquareCanvas(transparent);
    expect(await alphaAt(output, 256, 256)).toBe(0);
    expect(await alphaAt(output, 0, 0)).toBe(0);
  });
});

describe("fitToSquareCanvas with a custom canvas size", () => {
  it("honours a smaller canvas size", async () => {
    const output = await fitToSquareCanvas(await opaqueRect(100, 60), 320);
    const metadata = await sharp(output).metadata();
    expect(metadata.width).toBe(320);
    expect(metadata.height).toBe(320);
  });
});
