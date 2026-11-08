export interface PackActionsBarProps {
  stickerCount: number;
  onImportFiles: () => void;
  onImportFolder: () => void;
  onExportPack: () => void;
}

export function PackActionsBar(props: PackActionsBarProps): React.JSX.Element {
  const { stickerCount, onImportFiles, onImportFolder, onExportPack } = props;
  return (
    <div className="actions">
      <button onClick={onImportFiles}>Import files…</button>
      <button onClick={onImportFolder}>Import folder…</button>
      <button onClick={onExportPack} disabled={stickerCount === 0}>
        Export pack…
      </button>
    </div>
  );
}
