export interface AnimatedStickerSettings {
  canvasSize: number;
  fps: number;
  maxColors: number;
  dither: boolean;
  colorkey: boolean;
  maxDurationSeconds: number;
}

export const DEFAULT_ANIMATED_SETTINGS: AnimatedStickerSettings = {
  canvasSize: 512,
  fps: 15,
  maxColors: 128,
  dither: true,
  colorkey: true,
  maxDurationSeconds: 3
};
