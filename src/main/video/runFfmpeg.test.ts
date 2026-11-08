import { describe, expect, it } from "vitest";
import { resolveFfmpegPath } from "./resolveFfmpegPath";
import { runFfmpeg } from "./runFfmpeg";

describe("resolveFfmpegPath", () => {
  it("returns the bundled ffmpeg-static path outside a packaged app", () => {
    const ffmpegPath = resolveFfmpegPath();
    expect(ffmpegPath).toContain("ffmpeg");
  });
});

describe("runFfmpeg", () => {
  it("captures stdout for a successful invocation", async () => {
    const result = await runFfmpeg(resolveFfmpegPath(), ["-hide_banner", "-version"]);
    expect(result.stdout).toContain("ffmpeg version");
  });

  it("rejects with the last stderr lines when ffmpeg fails", async () => {
    const badArgs = ["-hide_banner", "-i", "/nonexistent.webm", "-f", "null", "-"];
    await expect(runFfmpeg(resolveFfmpegPath(), badArgs)).rejects.toThrow("ffmpeg exited with an error");
  });
});
