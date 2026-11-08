export function webmDecoderArgs(sourcePath: string): string[] {
  return sourcePath.toLowerCase().endsWith(".webm") ? ["-c:v", "libvpx-vp9"] : [];
}
