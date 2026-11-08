import { describe, expect, it } from "vitest";
import { sourceMimeType } from "./sourceMimeType";

describe("sourceMimeType", () => {
  it("names the image types the sticker importer accepts", () => {
    expect(sourceMimeType("/stickers/cat.png")).toBe("image/png");
    expect(sourceMimeType("/stickers/cat.JPG")).toBe("image/jpeg");
    expect(sourceMimeType("/stickers/dance.webm")).toBe("image/webm");
  });

  it("falls back to a binary type for unknown extensions", () => {
    expect(sourceMimeType("/stickers/dance.mng")).toBe("application/octet-stream");
  });
});
