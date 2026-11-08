import { readFile } from "node:fs/promises";
import type { PackJson } from "./packJson";

export async function readPackJson(filePath: string): Promise<PackJson> {
  const contents = await readFile(filePath, "utf8");
  return parsePackJson(contents);
}

function parsePackJson(contents: string): PackJson {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error("pack.json is not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("pack.json must be an object");
  }
  const record = parsed as Record<string, unknown>;
  if (typeof record.title !== "string" || typeof record.author !== "string") {
    throw new Error("pack.json requires string title and author");
  }
  if (record.cover !== undefined && record.cover !== null && typeof record.cover !== "string") {
    throw new Error("pack.json cover must be a string or null");
  }
  if (!Array.isArray(record.stickers)) {
    throw new Error("pack.json requires a stickers array");
  }
  const stickers = record.stickers.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`pack.json sticker ${index} must be an object`);
    }
    const { file, emoji } = entry as Record<string, unknown>;
    if (typeof file !== "string" || typeof emoji !== "string") {
      throw new Error(`pack.json sticker ${index} requires string file and emoji`);
    }
    return { file, emoji };
  });
  return {
    title: record.title,
    author: record.author,
    cover: typeof record.cover === "string" ? record.cover : null,
    stickers
  };
}
