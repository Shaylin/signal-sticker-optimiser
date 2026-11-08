import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const assetRoot = join(import.meta.dirname, "..", "resources", "onnx");

const contentTypes = {
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm"
};

let server;

export default async function startSegmentationAssetServer(options) {
  server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const fileName = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    try {
      const body = await readFile(join(assetRoot, fileName));
      response.writeHead(200, {
        "content-type": contentTypes[extname(fileName)] ?? "application/octet-stream",
        "access-control-allow-origin": "*"
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  options.provide("segmentationAssetOrigin", `http://127.0.0.1:${server.address().port}`);
}

startSegmentationAssetServer.teardown = async () => {
  server?.closeAllConnections();
  server?.close();
};
