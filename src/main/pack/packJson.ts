export interface PackJson {
  title: string;
  author: string;
  cover: string | null;
  stickers: Array<{ file: string; emoji: string }>;
}
