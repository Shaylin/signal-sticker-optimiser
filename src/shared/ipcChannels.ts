export const IpcChannels = {
  getPack: "studio:get-pack",
  getStickerSourceBytes: "studio:get-sticker-source-bytes",
  importViaFilePicker: "studio:import-via-file-picker",
  importViaFolderPicker: "studio:import-via-folder-picker",
  importPaths: "studio:import-paths",
  removeSticker: "studio:remove-sticker",
  optimiseSticker: "studio:optimise-sticker",
  resizeSticker: "studio:resize-sticker",
  submitSegmentedStickerImage: "studio:submit-segmented-sticker-image",
  exportViaFolderPicker: "studio:export-via-folder-picker"
} as const;

export const segmentationAssetBaseUrl = "segmentation://assets/";
