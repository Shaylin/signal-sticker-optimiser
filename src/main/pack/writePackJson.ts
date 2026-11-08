import { writeFile } from "node:fs/promises";
import type { PackJson } from "./packJson";

export async function writePackJson(filePath: string, pack: PackJson): Promise<void> {
  const contents = `${JSON.stringify(pack, null, 2)}\n`;
  await writeFile(filePath, contents, "utf8");
}
