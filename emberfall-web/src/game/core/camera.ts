import { clamp } from "./timing";

export const calculateCameraX = (x: number, viewportWidth: number, trackLength: number) =>
  clamp(x - viewportWidth / 2, 0, trackLength - viewportWidth);
