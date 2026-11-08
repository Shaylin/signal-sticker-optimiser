import { NotificationList } from "./NotificationList";
import { PackActionsBar } from "./PackActionsBar";
import { StickerGrid } from "./StickerGrid";
import { usePackActions } from "./usePackActions";

export function App(): React.JSX.Element {
  const actions = usePackActions();

  return (
    <main>
      <header>
        <h1>Signal Sticker Optimiser</h1>
        <PackActionsBar
          stickerCount={actions.pack?.stickers.length ?? 0}
          busyLabel={actions.busyLabel}
          onImportFiles={actions.importFiles}
          onImportFolder={actions.importFolder}
          onExportPack={actions.exportPack}
        />
      </header>
      <StickerGrid pack={actions.pack} busyStickerId={actions.busyStickerId} actions={actions} />
      <NotificationList notifications={actions.notifications} onDismiss={actions.dismissNotification} />
    </main>
  );
}
