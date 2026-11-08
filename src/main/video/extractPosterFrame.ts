import { runFfmpeg } from "./runFfmpeg";

export async function extractPosterFrame(sourcePath: string, outputPngPath: string, ffmpegPath: string): Promise<void> {
  await runFfmpeg(ffmpegPath, ["-hide_banner", "-y", "-i", sourcePath, "-frames:v", "1", outputPngPath]);
}
