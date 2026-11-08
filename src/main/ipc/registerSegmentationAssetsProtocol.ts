import { net, protocol } from "electron";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { segmentationScheme } from "./registerSegmentationScheme";

export function registerSegmentationAssetsProtocol(assetsDir: string): void {
  protocol.handle(segmentationScheme, async (request) => {
    const fileName = new URL(request.url).pathname.slice(1);
    try {
      return await net.fetch(pathToFileURL(join(assetsDir, fileName)).toString());
    } catch {
      return new Response("Segmentation asset not found", { status: 404 });
    }
  });
}
