import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { MAX_ANIMATION_SECONDS } from "../validation/withinDuration";
import { exportFolder } from "./exportFolder";
import { packStore } from "./packStore";
import type { StickerStats } from "./stickerStats";

function staticStats(byteSize = 1000): StickerStats {
  return { byteSize, width: 512, height: 512, durationSeconds: 0, animated: false, hasAlpha: true };
}

function animatedStats(byteSize = 1000, durationSeconds = 1): StickerStats {
  return { byteSize, width: 512, height: 512, durationSeconds, animated: true, hasAlpha: true };
}

async function makeSticker(id: string, extension: string, stats: StickerStats | null) {
  const processedPath = stats === null ? null : join(packStore.state.workingDir, `${id}-processed${extension}`);
  if (processedPath) {
    await writeFile(processedPath, `${id} bytes`);
  }
  return {
    id,
    sourcePath: `/source/${id}.webm`,
    stats: stats ?? staticStats(),
    processedPath,
    processedStats: stats,
    thumbnailDataUrl: ""
  };
}

async function packOf(stickers: Awaited<ReturnType<typeof makeSticker>>[]) {
  return { stickers };
}

function exportTarget(): string {
  return join(packStore.state.workingDir, "out");
}

beforeEach(async () => {
  packStore.configureWorkingDir(await mkdtemp(join(tmpdir(), "export-folder-")));
});

describe("exportFolder sticker files", () => {
  it("names sticker files by pack order and copies the processed bytes", async () => {
    const pack = await packOf([
      await makeSticker("a", ".webp", staticStats()),
      await makeSticker("b", ".apng", animatedStats()),
      await makeSticker("c", ".png", staticStats())
    ]);
    const exported = await exportFolder(pack, exportTarget());
    expect(exported.files).toEqual(["001.webp", "002.apng", "003.png"]);
    expect(await readFile(join(exported.directory, "002.apng"), "utf8")).toBe("b bytes");
  });

  it("writes one file per sticker and nothing else", async () => {
    const pack = await packOf([await makeSticker("a", ".webp", staticStats())]);
    const exported = await exportFolder(pack, exportTarget());
    expect(await readdir(exported.directory)).toEqual(["001.webp"]);
  });

  it("exports an empty pack as an empty folder", async () => {
    const exported = await exportFolder({ stickers: [] }, exportTarget());
    expect(exported.files).toEqual([]);
    expect(await readdir(exported.directory)).toEqual([]);
  });
});

describe("exportFolder Signal limit guards", () => {
  it("refuses a sticker one byte over budget", async () => {
    const pack = await packOf([await makeSticker("fat", ".webp", staticStats(MAX_STICKER_BYTES + 1))]);
    await expect(exportFolder(pack, exportTarget())).rejects.toThrow(/fat\.webm/);
  });

  it("refuses an animation a second over the duration limit", async () => {
    const long = await makeSticker("long", ".apng", animatedStats(1000, MAX_ANIMATION_SECONDS + 1));
    await expect(exportFolder(await packOf([long]), exportTarget())).rejects.toThrow(/long\.webm/);
  });

  it("refuses a sticker without a processed file", async () => {
    const pack = await packOf([await makeSticker("raw", ".webp", null)]);
    await expect(exportFolder(pack, exportTarget())).rejects.toThrow(/raw\.webm/);
  });
});
