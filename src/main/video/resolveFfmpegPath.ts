import { existsSync } from "node:fs";
import { join } from "node:path";
import ffmpegStatic from "ffmpeg-static";

export function resolveFfmpegPath(): string {
  if (process.resourcesPath) {
    const bundled = join(process.resourcesPath, "ffmpeg");
    if (existsSync(bundled)) {
      return bundled;
    }
  }
  if (typeof ffmpegStatic === "string") {
    return ffmpegStatic;
  }
  throw new Error("Could not locate an ffmpeg binary");
}
