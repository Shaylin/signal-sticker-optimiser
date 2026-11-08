import { describe, expect, it } from "vitest";
import { isApng } from "./isApng";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const chunk = Buffer.concat([length, Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  return Buffer.concat([chunk, crc]);
}

describe("isApng", () => {
  it("rejects buffers without the png signature", () => {
    expect(isApng(Buffer.from("RIFF....WEBP"))).toBe(false);
  });

  it("rejects a plain png (no acTL chunk)", async () => {
    const sharp = (await import("sharp")).default;
    const png = await sharp({
      create: { width: 4, height: 4, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
    })
      .png()
      .toBuffer();
    expect(isApng(png)).toBe(false);
  });

  it("accepts a png containing an acTL chunk", () => {
    const actl = Buffer.alloc(8);
    actl.writeUInt32BE(2, 0);
    const synthetic = Buffer.concat([PNG_SIGNATURE, pngChunk("acTL", actl), pngChunk("IEND", Buffer.alloc(0))]);
    expect(isApng(synthetic)).toBe(true);
  });

  it("walks past leading chunks before finding acTL", () => {
    const synthetic = Buffer.concat([
      PNG_SIGNATURE,
      pngChunk("tEXt", Buffer.from("keywords", "ascii")),
      pngChunk("acTL", Buffer.alloc(8)),
      pngChunk("IEND", Buffer.alloc(0))
    ]);
    expect(isApng(synthetic)).toBe(true);
  });
});

describe("isApng on malformed input", () => {
  it("rejects a truncated png mid-chunk", () => {
    const synthetic = Buffer.concat([PNG_SIGNATURE, Buffer.from([0x00, 0x00, 0xff])]);
    expect(isApng(synthetic)).toBe(false);
  });
});
