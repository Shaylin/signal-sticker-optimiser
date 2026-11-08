import { protocol } from "electron";
import { describe, expect, it, vi } from "vitest";
import { registerSegmentationScheme } from "./registerSegmentationScheme";

vi.mock("electron", () => ({ protocol: { registerSchemesAsPrivileged: vi.fn() } }));

describe("registerSegmentationScheme", () => {
  it("registers the segmentation scheme used by the asset base url", () => {
    registerSegmentationScheme();
    const [registrations] = vi.mocked(protocol.registerSchemesAsPrivileged).mock.calls[0];
    expect(registrations[0].scheme).toBe("segmentation");
  });

  it("enables fetch and cors so the renderer can load model assets cross-origin", () => {
    registerSegmentationScheme();
    const [registrations] = vi.mocked(protocol.registerSchemesAsPrivileged).mock.calls[0];
    expect(registrations[0].privileges).toMatchObject({ supportFetchAPI: true, corsEnabled: true });
  });
});
