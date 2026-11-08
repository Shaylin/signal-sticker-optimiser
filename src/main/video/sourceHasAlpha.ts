import { probeStats } from "./probeStats";

const hasAlphaByPath = new Map<string, boolean>();

export async function sourceHasAlpha(sourcePath: string, ffmpegPath: string): Promise<boolean> {
  const cached = hasAlphaByPath.get(sourcePath);
  if (cached !== undefined) {
    return cached;
  }
  const { hasAlpha } = await probeStats(sourcePath, ffmpegPath);
  hasAlphaByPath.set(sourcePath, hasAlpha);
  return hasAlpha;
}
