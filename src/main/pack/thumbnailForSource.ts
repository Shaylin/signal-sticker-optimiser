import { basename, join } from "node:path";
import { makeThumbnailDataUrl } from "../image/makeThumbnailDataUrl";
import { extractPosterFrame } from "../video/extractPosterFrame";

export async function thumbnailForSource(sourcePath: string, workingDir: string, ffmpegPath: string): Promise<string> {
  if (sourcePath.endsWith(".webm")) {
    const posterPath = join(workingDir, `${basename(sourcePath)}.poster.png`);
    await extractPosterFrame(sourcePath, posterPath, ffmpegPath);
    return makeThumbnailDataUrl(posterPath);
  }
  return makeThumbnailDataUrl(sourcePath);
}
