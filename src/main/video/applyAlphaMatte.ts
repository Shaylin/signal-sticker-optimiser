import { runFfmpeg } from "./runFfmpeg";
import { webmDecoderArgs } from "./webmDecoderArgs";

export async function applyAlphaMatte(
  sourcePath: string,
  mattePngPath: string,
  outputWebmPath: string,
  ffmpegPath: string
): Promise<void> {
  await runFfmpeg(ffmpegPath, [
    "-hide_banner",
    "-y",
    ...webmDecoderArgs(sourcePath),
    "-i",
    sourcePath,
    "-i",
    mattePngPath,
    "-filter_complex",
    "[0:v]format=yuva420p[base];[1:v]alphaextract[matte];[base][matte]alphamerge[out]",
    "-map",
    "[out]",
    "-c:v",
    "libvpx-vp9",
    "-pix_fmt",
    "yuva420p",
    "-auto-alt-ref",
    "0",
    outputWebmPath
  ]);
}
