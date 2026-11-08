import { readFile } from "node:fs/promises";
import { MAX_STICKER_BYTES } from "../validation/withinByteBudget";
import { budgetLadder } from "./budgetLadder";
import { encodeAnimatedSticker } from "./encodeAnimatedSticker";
import type { AnimatedStickerSettings } from "./animatedStickerSettings";

export interface BudgetFitResult {
  settings: AnimatedStickerSettings;
  rungIndex: number;
  bytes: Buffer;
}

export async function fitAnimatedStickerUnderBudget(
  sourcePath: string,
  outputPath: string,
  ffmpegPath: string
): Promise<BudgetFitResult> {
  const ladder = budgetLadder();
  for (let rungIndex = 0; rungIndex < ladder.length; rungIndex++) {
    const settings = ladder[rungIndex];
    await encodeAnimatedSticker(sourcePath, outputPath, ffmpegPath, settings);
    const bytes = await readFile(outputPath);
    if (bytes.byteLength <= MAX_STICKER_BYTES) {
      return { settings, rungIndex, bytes };
    }
  }
  throw new Error(`No budget ladder rung produced a file under ${MAX_STICKER_BYTES} bytes for ${sourcePath}`);
}
