import { DEFAULT_ANIMATED_SETTINGS, type AnimatedStickerSettings } from "./animatedStickerSettings";
import { runFfmpeg } from "./runFfmpeg";

export async function encodeAnimatedSticker(
  sourcePath: string,
  outputPath: string,
  ffmpegPath: string,
  settings: AnimatedStickerSettings = DEFAULT_ANIMATED_SETTINGS
): Promise<void> {
  await runFfmpeg(ffmpegPath, [
    "-hide_banner",
    "-y",
    "-i",
    sourcePath,
    "-filter_complex",
    buildPresetFilterGraph(settings),
    "-plays",
    "0",
    "-compression_level",
    "9",
    outputPath
  ]);
}

function buildPresetFilterGraph(settings: AnimatedStickerSettings): string {
  const { canvasSize, fps, maxColors, dither, colorkey, maxDurationSeconds } = settings;
  const stages = [
    `trim=duration=${maxDurationSeconds}`,
    "setpts=PTS-STARTPTS",
    `scale=${canvasSize}:${canvasSize}:force_original_aspect_ratio=decrease:flags=gauss`,
    `pad=${canvasSize}:${canvasSize}:(ow-iw)/2:(oh-ih)/2:color=#00000000`,
    "unsharp=3:3:0.3:3:3:0.05",
    `fps=${fps}`
  ];
  if (colorkey) {
    stages.push("colorkey=#000000:0.04:0.04");
  }
  stages.push("format=rgba");
  const ditherMode = dither ? "floyd_steinberg" : "none";
  return [
    `[0:v]${stages.join(",")}[main]`,
    "[main]split[pal_input][use_input]",
    `[pal_input]palettegen=max_colors=${maxColors}:stats_mode=diff[pal]`,
    `[use_input][pal]paletteuse=dither=${ditherMode}:diff_mode=rectangle`
  ].join(";");
}
