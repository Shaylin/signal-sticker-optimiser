import type { StickerDto } from "../shared/studioApi";
import { BudgetBadge } from "./BudgetBadge";

export interface StickerTileHeadProps {
  sticker: StickerDto;
}

export function StickerTileHead({ sticker }: StickerTileHeadProps): React.JSX.Element {
  const shownStats = sticker.processedStats ?? sticker.stats;
  return (
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
  );
}
