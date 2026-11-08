import { stat } from "node:fs/promises";
import type { StickerStats } from "../pack/stickerStats";
import { runFfmpeg } from "./runFfmpeg";

export async function probeStats(filePath: string, ffmpegPath: string): Promise<StickerStats> {
  const [fileStat, result] = await Promise.all([
    stat(filePath),
    runFfmpeg(ffmpegPath, ["-hide_banner", "-i", filePath, "-map", "0:v:0", "-f", "null", "-"])
  ]);
  const frames = parseFrameCount(result.stderr);
  return {
    byteSize: fileStat.size,
    ...parseVideoStream(result.stderr),
    durationSeconds: parseDuration(result.stderr) ?? parseFinalTime(result.stderr),
    animated: frames > 1
  };
}

function parseVideoStream(stderr: string): { width: number; height: number } {
  const match = /Video:[^\n]*?(\d{2,5})x(\d{2,5})/.exec(stderr);
  if (!match) {
    throw new Error(`Could not read a video stream from ffmpeg output: ${stderr}`);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function toSeconds(hours: string, minutes: string, seconds: string): number {
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function parseDuration(stderr: string): number | null {
  const match = /Duration:\s*(\d+):(\d{2}):(\d{2}\.\d+)/.exec(stderr);
  if (!match) {
    return null;
  }
  return toSeconds(match[1], match[2], match[3]);
}

function parseFinalTime(stderr: string): number {
  const times = [...stderr.matchAll(/time=\s*(\d+):(\d{2}):(\d{2})\.(\d{1,3})/g)];
  if (times.length === 0) {
    throw new Error(`Could not read a duration from ffmpeg output: ${stderr}`);
  }
  const last = times[times.length - 1];
  return toSeconds(last[1], last[2], `${last[3]}.${last[4]}`);
}

function parseFrameCount(stderr: string): number {
  const frames = [...stderr.matchAll(/frame=\s*(\d+)/g)];
  if (frames.length === 0) {
    throw new Error(`Could not read a frame count from ffmpeg output: ${stderr}`);
  }
  return Number(frames[frames.length - 1][1]);
}
