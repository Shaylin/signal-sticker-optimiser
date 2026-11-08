import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PackJson } from "./packJson";
import { readPackJson } from "./readPackJson";

const sample: PackJson = {
  title: "Cat Friends",
  author: "Shaylin",
  cover: "001.webp",
  stickers: [
    { file: "001.webp", emoji: "😺" },
    { file: "002.apng", emoji: "🎉" }
  ]
};

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "pack-json-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

async function readContentsOf(json: string): Promise<PackJson> {
  const filePath = join(tempDir, `pack-${Math.random().toString(36).slice(2)}.json`);
  await writeFile(filePath, json, "utf8");
  return readPackJson(filePath);
}

describe("readPackJson", () => {
  it("reads a valid pack.json", async () => {
    const parsed = await readContentsOf(JSON.stringify(sample));
    expect(parsed).toEqual(sample);
  });

  it("defaults cover to null when absent", async () => {
    const parsed = await readContentsOf(JSON.stringify({ ...sample, cover: undefined }));
    expect(parsed.cover).toBeNull();
  });

  it("rejects invalid JSON", async () => {
    await expect(readContentsOf("{ not json")).rejects.toThrow("not valid JSON");
  });

  it("rejects a missing title", async () => {
    await expect(readContentsOf(JSON.stringify({ ...sample, title: undefined }))).rejects.toThrow("title and author");
  });

  it("rejects a non-array stickers field", async () => {
    await expect(readContentsOf(JSON.stringify({ ...sample, stickers: "nope" }))).rejects.toThrow(
      "stickers array"
    );
  });

  it("rejects a sticker missing its emoji", async () => {
    const broken = { ...sample, stickers: [{ file: "001.webp" }] };
    await expect(readContentsOf(JSON.stringify(broken))).rejects.toThrow("sticker 0");
  });
});
