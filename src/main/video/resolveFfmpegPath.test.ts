import { existsSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => false) }));

const originalResourcesPath = process.resourcesPath;

function setResourcesPath(value: string | undefined): void {
  Object.defineProperty(process, "resourcesPath", { value, configurable: true });
}

async function loadResolver(staticPath: string | null): Promise<() => string> {
  vi.doMock("ffmpeg-static", () => ({ default: staticPath }));
  vi.resetModules();
  const module = await import("./resolveFfmpegPath");
  return module.resolveFfmpegPath;
}

beforeEach(() => {
  setResourcesPath(undefined);
  vi.mocked(existsSync).mockReturnValue(false);
});

afterEach(() => {
  setResourcesPath(originalResourcesPath);
  vi.resetModules();
});

describe("resolveFfmpegPath", () => {
  it("prefers the binary bundled into the packaged app's resources", async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    setResourcesPath("/app/resources");
    const resolveFfmpegPath = await loadResolver("/dev/ffmpeg-static");
    expect(resolveFfmpegPath()).toBe("/app/resources/ffmpeg");
  });

  it("falls back to the ffmpeg-static binary when unpacked", async () => {
    const resolveFfmpegPath = await loadResolver("/dev/ffmpeg-static");
    expect(resolveFfmpegPath()).toBe("/dev/ffmpeg-static");
  });

  it("throws when no binary can be located", async () => {
    const resolveFfmpegPath = await loadResolver(null);
    expect(() => resolveFfmpegPath()).toThrow(/Could not locate an ffmpeg binary/);
  });
});
