import { runFfmpeg } from "./runFfmpeg";
import { webmDecoderArgs } from "./webmDecoderArgs";

export async function extractPosterFrame(sourcePath: string, outputPngPath: string, ffmpegPath: string): Promise<void> {
  await runFfmpeg(ffmpegPath, [
    "-hide_banner",
    "-y",
    ...webmDecoderArgs(sourcePath),
    "-i",
    sourcePath,
    "-frames:v",
    "1",
    outputPngPath
  ]);
}
