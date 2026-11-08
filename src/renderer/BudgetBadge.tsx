import type { StickerStats } from "../main/pack/stickerStats";
import { withinByteBudget } from "../main/validation/withinByteBudget";

export function BudgetBadge({ stats }: { stats: StickerStats }): React.JSX.Element {
  const sizeKb = Math.round(stats.byteSize / 1024);
  const compliant = withinByteBudget(stats);
  return (
    <span className={compliant ? "badge badge-ok" : "badge badge-over"} title={`${stats.byteSize} of 307200 bytes`}>
      {sizeKb} KB
    </span>
  );
}
