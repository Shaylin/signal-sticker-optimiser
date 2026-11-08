import { net, protocol } from "electron";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { registerSegmentationAssetsProtocol } from "./registerSegmentationAssetsProtocol";

vi.mock("electron", () => ({ net: { fetch: vi.fn() }, protocol: { handle: vi.fn() } }));

type AssetRequestHandler = (request: { url: string }) => Promise<Response>;

function registeredHandler(): AssetRequestHandler {
  return vi.mocked(protocol.handle).mock.calls[0][1] as unknown as AssetRequestHandler;
}

describe("registerSegmentationAssetsProtocol", () => {
  it("serves asset files from the configured directory", async () => {
    vi.mocked(net.fetch).mockResolvedValue(new Response("model bytes"));
    registerSegmentationAssetsProtocol("/app/resources/onnx");
    const response = await registeredHandler()({ url: "segmentation://assets/abc123" });
    expect(net.fetch).toHaveBeenCalledWith(pathToFileURL("/app/resources/onnx/abc123").toString());
    expect(await response.text()).toBe("model bytes");
  });

  it("answers a missing asset with 404 instead of failing the fetch", async () => {
    vi.mocked(net.fetch).mockRejectedValue(new Error("ERR_FILE_NOT_FOUND"));
    registerSegmentationAssetsProtocol("/app/resources/onnx");
    const response = await registeredHandler()({ url: "segmentation://assets/nope" });
    expect(response.status).toBe(404);
  });
});
