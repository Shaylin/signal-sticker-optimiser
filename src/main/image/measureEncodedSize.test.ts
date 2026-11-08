import { describe, expect, it } from "vitest";
import { measureEncodedSize } from "./measureEncodedSize";

describe("measureEncodedSize", () => {
  it("reports the byte length of the buffer", () => {
    expect(measureEncodedSize(Buffer.alloc(307_200))).toBe(307_200);
  });

  it("reports zero for an empty buffer", () => {
    expect(measureEncodedSize(Buffer.alloc(0))).toBe(0);
  });
});
