import { describe, expect, it } from "vitest";
import { webmDecoderArgs } from "./webmDecoderArgs";

describe("webmDecoderArgs", () => {
  it("forces the libvpx decoder for webm because ffmpeg's built-in vp9 decoder drops the alpha layer", () => {
    expect(webmDecoderArgs("/stickers/9.webm")).toEqual(["-c:v", "libvpx-vp9"]);
  });

  it("ignores the decoder choice for other extensions", () => {
    expect(webmDecoderArgs("/stickers/dance.gif")).toEqual([]);
  });

  it("matches the extension case insensitively", () => {
    expect(webmDecoderArgs("/stickers/CLIP.WEBM")).toEqual(["-c:v", "libvpx-vp9"]);
  });
});
