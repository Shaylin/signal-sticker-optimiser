// @vitest-environment happy-dom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StickerStats } from "../main/pack/stickerStats";
import type { PackDto, StudioApi } from "../shared/studioApi";
import { App } from "./App";

vi.mock("@imgly/background-removal", () => ({ removeBackground: vi.fn() }));

function statsWithBytes(byteSize: number): StickerStats {
  return { byteSize, width: 512, height: 512, durationSeconds: 1, animated: true, hasAlpha: true };
}

function packWithProcessedBytes(processedBytes: number): PackDto {
  return {
    title: "Demo",
    author: "Me",
    coverStickerId: "st-1",
    stickers: [
      {
        id: "st-1",
        sourcePath: "/fixtures/9.webm",
        displayName: "9.webm",
        emoji: "",
        stats: statsWithBytes(256_000),
        processedPath: "/work/st-1.apng",
        processedStats: statsWithBytes(processedBytes),
        thumbnailDataUrl: "data:image/png;base64,"
      }
    ]
  };
}

function installFakeStudio(initial: PackDto): StudioApi {
  let current = initial;
  const api: StudioApi = {
    getPack: async () => current,
    getStickerSourceBytes: async () => new ArrayBuffer(0),
    importViaFilePicker: async () => current,
    importViaFolderPicker: async () => current,
    importPaths: async () => current,
    removeSticker: async () => current,
    setStickerEmoji: async () => current,
    optimiseSticker: vi.fn(async () => {
      current = packWithProcessedBytes(260_000);
      return current;
    }),
    resizeSticker: async () => current,
    submitSegmentedStickerImage: async () => current,
    setPackInfo: async () => current,
    setCoverSticker: async () => current,
    segmentationAssetBaseUrl: "segmentation://assets/"
  };
  window.studio = api;
  return api;
}

describe("App pack grid", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("flags an over-budget sticker and turns the badge green after optimise", async () => {
    const api = installFakeStudio(packWithProcessedBytes(620_000));
    render(<App />);
    await screen.findByText("9.webm");
    expect(screen.getByText("605 KB").className).toBe("badge badge-over");

    await userEvent.click(screen.getByRole("button", { name: "Optimise" }));

    expect(api.optimiseSticker).toHaveBeenCalledWith("st-1");
    await waitFor(() => expect(screen.getByText("254 KB").className).toBe("badge badge-ok"));
  });

  it("offers background removal only for stickers without alpha", async () => {
    const withAlpha = packWithProcessedBytes(200_000);
    installFakeStudio(withAlpha);
    const { unmount } = render(<App />);
    await screen.findByText("9.webm");
    expect(screen.queryByRole("button", { name: "Remove BG" })).toBeNull();
    unmount();

    document.body.innerHTML = "";
    const pack = packWithProcessedBytes(200_000);
    pack.stickers[0].stats = { ...pack.stickers[0].stats, hasAlpha: false };
    installFakeStudio(pack);
    render(<App />);
    await screen.findByText("9.webm");
    expect(screen.queryByRole("button", { name: "Remove BG" })).not.toBeNull();
  });
});
