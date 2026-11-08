import { describe, expect, it, vi } from "vitest";
import { removeBackground } from "./removeBackground";

vi.mock("@imgly/background-removal", () => ({
  removeBackground: vi.fn(async (_image: unknown, _config: unknown) => new Blob(["segmented"], { type: "image/png" }))
}));

const removeMock = (await import("@imgly/background-removal")).removeBackground as ReturnType<typeof vi.fn>;

function lastConfig(): { model: string; publicPath: string } {
  return removeMock.mock.calls[removeMock.mock.calls.length - 1][1];
}

describe("removeBackground", () => {
  it("returns the segmented png blob from the library", async () => {
    const result = await removeBackground(new Blob(["input"], { type: "image/webp" }), {
      assetBaseUrl: "https://localhost/assets/"
    });
    expect(result.type).toBe("image/png");
  });

  it("uses the quantized isnet model served from the local asset url", async () => {
    await removeBackground(new Blob(["input"]), { assetBaseUrl: "https://localhost/assets/" });
    expect(lastConfig()).toMatchObject({ model: "isnet_quint8", publicPath: "https://localhost/assets/" });
  });

  it("propagates library failures to the caller", async () => {
    removeMock.mockRejectedValueOnce(new Error("model download failed"));
    await expect(removeBackground(new Blob(["input"]), { assetBaseUrl: "x/" })).rejects.toThrow(
      "model download failed"
    );
  });
});
