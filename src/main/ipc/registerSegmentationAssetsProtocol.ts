import { net, protocol } from "electron";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function registerSegmentationAssetsProtocol(assetsDir: string): void {
  protocol.handle("segmentation", (request) => {
    const fileName = new URL(request.url).pathname.slice(1);
    return net.fetch(pathToFileURL(join(assetsDir, fileName)).toString());
  });
}
