import { useState } from "react";
import type { SegmentationModel } from "./segmentation/segmentationModelToOnnx";
import { PackPanel } from "./PackPanel";
import { StickerTile } from "./StickerTile";
import { usePackActions } from "./usePackActions";

export function App(): React.JSX.Element {
  const [segmentationModel, setSegmentationModel] = useState<SegmentationModel>("small");
  const actions = usePackActions();
  const pack = actions.pack;

  return (
    <main>
      <header>
        <h1>Signal Sticker Studio</h1>
        <PackPanel
          pack={pack}
          segmentationModel={segmentationModel}
          onSegmentationModelChange={setSegmentationModel}
          onImportFiles={actions.importFiles}
          onImportFolder={actions.importFolder}
          onPackInfoChange={actions.setPackInfo}
        />
      </header>
      <section className="grid">
        {(pack?.stickers ?? []).map((sticker) => (
          <StickerTile
            key={sticker.id}
            sticker={sticker}
            isCover={pack?.coverStickerId === sticker.id}
            busy={actions.busyStickerId === sticker.id}
            actions={{
              optimise: () => actions.optimise(sticker.id),
              resize: (size) => actions.resize(sticker.id, size),
              removeBackground: () => actions.removeBackground(sticker.id, segmentationModel),
              remove: () => actions.remove(sticker.id),
              setEmoji: (emoji) => actions.setEmoji(sticker.id, emoji),
              toggleCover: () => actions.setCover(pack?.coverStickerId === sticker.id ? null : sticker.id)
            }}
          />
        ))}
      </section>
    </main>
  );
}
