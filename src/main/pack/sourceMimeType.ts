import { extname } from "node:path";

const mimeTypesByExtension: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".webm": "image/webm",
  ".gif": "image/gif",
  ".avif": "image/avif"
};

export function sourceMimeType(filePath: string): string {
  return mimeTypesByExtension[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}
