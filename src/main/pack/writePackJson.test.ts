import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PackJson } from "./packJson";
import { readPackJson } from "./readPackJson";
import { writePackJson } from "./writePackJson";

const sample: PackJson = {
  title: "Cat Friends",
  author: "Shaylin",
  cover: null,
  stickers: [{ file: "001.png", emoji: "😺" }]
};

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "write-pack-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("writePackJson", () => {
  it("writes a file that readPackJson parses back identically", async () => {
    const filePath = join(tempDir, "round-trip.json");
    await writePackJson(filePath, sample);
    const parsed = await readPackJson(filePath);
    expect(parsed).toEqual(sample);
  });

  it("writes human-readable JSON with two-space indentation", async () => {
    const filePath = join(tempDir, "indented.json");
    await writePackJson(filePath, sample);
    const contents = await readFile(filePath, "utf8");
    expect(contents).toContain("  \"title\": \"Cat Friends\"");
    expect(contents.endsWith("\n")).toBe(true);
  });
});
