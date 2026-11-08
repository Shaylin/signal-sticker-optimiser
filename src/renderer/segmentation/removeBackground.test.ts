import { describe, expect, it, vi } from "vitest";
import { removeBackground } from "./removeBackground";

vi.mock("@imgly/background-removal", () => ({
  removeBackground: vi.fn(async (_image: unknown, _config: unknown) => new Blob(["segmented"], { type: "image/png" }))
}));

const removeMock = (await import("@imgly/background-removal")).removeBackground as ReturnType<typeof vi.fn>;

describe("removeBackground", () => {
  it("returns the segmented png blob from the library", async () => {
    const result = await removeBackground(new Blob(["input"], { type: "image/webp" }), {
      model: "small",
      assetBaseUrl: "https://localhost/assets/"
    });
    expect(result.type).toBe("image/png");
  });

  it("passes the small model and asset base url to the library", async () => {
    await removeBackground(new Blob(["input"], { type: "image/webp" }), {
      model: "small",
      assetBaseUrl: "https://localhost/assets/"
    });
    const config = removeMock.mock.calls[removeMock.mock.calls.length - 1][1];
    expect(config).toMatchObject({ model: "isnet_quint8", publicPath: "https://localhost/assets/" });
  });

  it("maps the medium model to the fp16 onnx model", async () => {
    await removeBackground(new Blob(["input"]), { model: "medium", assetBaseUrl: "https://localhost/assets/" });
    const config = removeMock.mock.calls[removeMock.mock.calls.length - 1][1];
    expect(config.model).toBe("isnet_fp16");
  });

  it("propagates library failures to the caller", async () => {
    removeMock.mockRejectedValueOnce(new Error("model download failed"));
    await expect(removeBackground(new Blob(["input"]), { model: "small", assetBaseUrl: "x/" })).rejects.toThrow(
      "model download failed"
    );
  });
});
