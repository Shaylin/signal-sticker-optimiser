import type { StickerDto } from "../shared/studioApi";
import { needsBackgroundRemoval } from "../main/validation/needsBackgroundRemoval";
import { BudgetBadge } from "./BudgetBadge";
import { EmojiInput } from "./EmojiInput";

export interface StickerTileActions {
  optimise: () => void;
  resize: (canvasSize: number) => void;
  removeBackground: () => void;
  remove: () => void;
  setEmoji: (emoji: string) => void;
  toggleCover: () => void;
}

export interface StickerTileProps {
  sticker: StickerDto;
  isCover: boolean;
  busy: boolean;
  actions: StickerTileActions;
}

export function StickerTile({ sticker, isCover, busy, actions }: StickerTileProps): React.JSX.Element {
  const shownStats = sticker.processedStats ?? sticker.stats;
  return (
    <article className="tile">
      <div className="tile-head">
        <img className="thumb" src={sticker.thumbnailDataUrl} alt={sticker.displayName} />
        <div>
          <p className="name">{sticker.displayName}</p>
          <BudgetBadge stats={shownStats} />{" "}
          <span className="dims">
            {shownStats.width}×{shownStats.height}
            {shownStats.animated ? ` · ${shownStats.durationSeconds.toFixed(1)}s` : ""}
          </span>
        </div>
      </div>
      <div className="tile-controls">
        <EmojiInput emoji={sticker.emoji} onEmojiChange={actions.setEmoji} />
        <button onClick={actions.optimise} disabled={busy}>Optimise</button>
        <select
          aria-label="Resize canvas"
          value=""
          disabled={busy}
          onChange={(event) => actions.resize(Number(event.target.value))}
        >
          <option value="">Resize…</option>
          <option value="512">512</option>
          <option value="320">320</option>
          <option value="256">256</option>
        </select>
        {needsBackgroundRemoval(sticker.stats) && (
          <button onClick={actions.removeBackground} disabled={busy}>Remove BG</button>
        )}
        <button onClick={actions.toggleCover}>{isCover ? "Cover ✓" : "Set cover"}</button>
        <button className="danger" onClick={actions.remove} disabled={busy}>Remove</button>
      </div>
    </article>
  );
}
