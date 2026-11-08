import { protocol } from "electron";

export const segmentationScheme = "segmentation";

export function registerSegmentationScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: segmentationScheme,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        // Without corsEnabled the renderer's cross-origin fetch() of the model assets is
        // blocked by Chromium, and background removal fails with "Failed to fetch".
        corsEnabled: true
      }
    }
  ]);
}
