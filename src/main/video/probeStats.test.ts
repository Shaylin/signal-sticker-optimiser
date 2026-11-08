import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { corpusAvailable } from "../testing/corpusAvailable";
import { probeStats } from "./probeStats";
import { resolveFfmpegPath } from "./resolveFfmpegPath";

const webmFixtures = join(import.meta.dirname, "../../../examples/webm");

describe.skipIf(!corpusAvailable(webmFixtures))("probeStats", () => {
  it("reports the recorded expectations for the webm corpus (512x387, ~1s animated)", async () => {
    const stats = await probeStats(join(webmFixtures, "0.webm"), resolveFfmpegPath());
    expect(stats.width).toBe(512);
    expect(stats.height).toBe(387);
    expect(stats.animated).toBe(true);
    expect(stats.durationSeconds).toBeGreaterThan(0.5);
    expect(stats.durationSeconds).toBeLessThan(1.5);
    expect(stats.byteSize).toBeGreaterThan(0);
  }, 30_000);

  it("sees the webm alpha layer that ffmpeg's built-in vp9 decoder hides", async () => {
    const stats = await probeStats(join(webmFixtures, "20.webm"), resolveFfmpegPath());
    expect(stats.hasAlpha).toBe(true);
  }, 30_000);
});
