import { existsSync } from "node:fs";

/**
 * The sticker fixtures under `examples/` are read-only and are not committed, so CI runners do
 * not have them. Corpus-backed suites use this to skip instead of failing on a missing directory.
 */
export function corpusAvailable(fixturePath: string): boolean {
  return existsSync(fixturePath);
}
