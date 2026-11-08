import { MAX_PACK_STICKERS } from "../main/validation/withinPackSize";

export interface PackActionsBarProps {
  stickerCount: number;
  busyLabel: string | null;
  onImportFiles: () => void;
  onImportFolder: () => void;
  onExportPack: () => void;
}

export function PackActionsBar(props: PackActionsBarProps): React.JSX.Element {
  const { stickerCount, busyLabel, onImportFiles, onImportFolder, onExportPack } = props;
  return (
    <div className="actions">
      <button onClick={onImportFiles} disabled={busyLabel !== null}>
        Import files…
      </button>
      <button onClick={onImportFolder} disabled={busyLabel !== null}>
        Import folder…
      </button>
      <button onClick={onExportPack} disabled={stickerCount === 0 || busyLabel !== null}>
        Export pack…
      </button>
      {busyLabel !== null && (
        <span className="busy" role="status">
          <span className="spinner" aria-hidden="true" />
          {busyLabel}
        </span>
      )}
      <span className="pack-count">
        {stickerCount} / {MAX_PACK_STICKERS}
      </span>
    </div>
  );
}
