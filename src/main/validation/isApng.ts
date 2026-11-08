const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ACTL_CHUNK_TYPE = Buffer.from("acTL", "ascii");

export function isApng(file: Buffer): boolean {
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return false;
  }
  let offset = 8;
  while (offset + 8 <= file.length) {
    const dataLength = file.readUInt32BE(offset);
    const chunkType = file.subarray(offset + 4, offset + 8);
    if (chunkType.equals(ACTL_CHUNK_TYPE)) {
      return true;
    }
    offset += 12 + dataLength;
  }
  return false;
}
