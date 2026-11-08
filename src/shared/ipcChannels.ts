export const IpcChannels = {
  getPack: "studio:get-pack",
  getStickerSourceBytes: "studio:get-sticker-source-bytes",
  importViaFilePicker: "studio:import-via-file-picker",
  importViaFolderPicker: "studio:import-via-folder-picker",
  importPaths: "studio:import-paths",
  removeSticker: "studio:remove-sticker",
  setStickerEmoji: "studio:set-sticker-emoji",
  optimiseSticker: "studio:optimise-sticker",
  resizeSticker: "studio:resize-sticker",
  submitSegmentedStickerImage: "studio:submit-segmented-sticker-image",
  setPackInfo: "studio:set-pack-info",
  setCoverSticker: "studio:set-cover-sticker"
} as const;

export const segmentationAssetBaseUrl = "segmentation://assets/";
