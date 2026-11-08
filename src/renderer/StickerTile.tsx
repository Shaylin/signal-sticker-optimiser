import type { StickerDto } from "../shared/studioApi";
import { needsBackgroundRemoval } from "../main/validation/needsBackgroundRemoval";
import { StickerTileHead } from "./StickerTileHead";

export interface StickerTileActions {
  optimise: () => void;
  resize: (canvasSize: number) => void;
  removeBackground: () => void;
  remove: () => void;
}

export interface StickerTileProps {
  sticker: StickerDto;
  busy: boolean;
  actions: StickerTileActions;
}

export function StickerTile({ sticker, busy, actions }: StickerTileProps): React.JSX.Element {
  return (
    <article className="tile">
      <StickerTileHead sticker={sticker} />
      <div className="tile-controls">
        <button onClick={actions.optimise} disabled={busy}>
          Optimise
        </button>
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
          <button onClick={actions.removeBackground} disabled={busy}>
            Remove BG
          </button>
        )}
        <button className="danger" onClick={actions.remove} disabled={busy}>
          Remove
        </button>
      </div>
    </article>
  );
}
