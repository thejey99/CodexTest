import type { Coin, Hazard, Platform } from "../state";

export const isWithinPlatformBounds = (x: number, width: number, platform: Platform) =>
  x + width > platform.x && x < platform.x + platform.width;

export const isCoinCollected = (coin: Coin, playerCenterX: number, y: number) =>
  Math.abs(coin.x - playerCenterX) < 22 && Math.abs(coin.y - y) < 42;

export const hazardCollision = (hazard: Hazard, x: number, y: number, width: number, baselineY: number) => {
  const hazardY = hazard.lane === "ground" ? baselineY : baselineY - 112;
  const overlapX = x + width > hazard.x && x < hazard.x + hazard.width;
  const overlapY = Math.abs(y - hazardY) < 48;

  return overlapX && overlapY;
};
