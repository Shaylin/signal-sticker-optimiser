import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface FfmpegResult {
  stdout: string;
  stderr: string;
}

export async function runFfmpeg(ffmpegPath: string, args: string[]): Promise<FfmpegResult> {
  try {
    return await execFileAsync(ffmpegPath, args, { maxBuffer: 32 * 1024 * 1024 });
  } catch (error) {
    const stderr = error instanceof Error && "stderr" in error ? String((error as { stderr?: string }).stderr) : "";
    const summary = stderr.split("\n").filter(Boolean).slice(-4).join(" | ");
    throw new Error(`ffmpeg exited with an error: ${summary}`, { cause: error });
  }
}
