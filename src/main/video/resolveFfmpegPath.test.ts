import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => false) }));

const originalResourcesPath = process.resourcesPath;
const originalPlatform = process.platform;

function setResourcesPath(value: string | undefined): void {
  Object.defineProperty(process, "resourcesPath", { value, configurable: true });
}

function setPlatform(value: NodeJS.Platform): void {
  Object.defineProperty(process, "platform", { value, configurable: true });
}

async function loadResolver(staticPath: string | null): Promise<() => string> {
  vi.doMock("ffmpeg-static", () => ({ default: staticPath }));
  vi.resetModules();
  const module = await import("./resolveFfmpegPath");
  return module.resolveFfmpegPath;
}

beforeEach(() => {
  setResourcesPath(undefined);
  setPlatform(originalPlatform);
  vi.mocked(existsSync).mockReturnValue(false);
});

afterEach(() => {
  setResourcesPath(originalResourcesPath);
  setPlatform(originalPlatform);
  vi.resetModules();
});

describe("resolveFfmpegPath", () => {
  it("prefers the binary bundled into the packaged app's resources", async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    setResourcesPath("/app/resources");
    setPlatform("linux");
    const resolveFfmpegPath = await loadResolver("/dev/ffmpeg-static");
    expect(resolveFfmpegPath()).toBe(join("/app/resources", "ffmpeg"));
  });

  it("appends .exe to the bundled binary name on Windows", async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    setResourcesPath("/app/resources");
    setPlatform("win32");
    const resolveFfmpegPath = await loadResolver("/dev/ffmpeg-static");
    expect(resolveFfmpegPath()).toBe(join("/app/resources", "ffmpeg.exe"));
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
