import type { HeroAnim, HeroDefinition } from "./entities/player";

export type Coin = {
  id: number;
  x: number;
  y: number;
  picked: boolean;
};

export type Hazard = {
  id: number;
  x: number;
  width: number;
  lane: "ground" | "high";
};

export type Platform = {
  id: number;
  x: number;
  y: number;
  width: number;
};

export type GameSnapshot = {
  selectedHero: HeroDefinition;
  coins: Coin[];
  score: number;
  lives: number;
  timer: number;
  cameraX: number;
  animation: HeroAnim;
  won: boolean;
  tick: number;
  x: number;
  y: number;
  facing: 1 | -1;
  collected: number;
  progress: number;
};

export type GameConstants = {
  trackLength: number;
  viewportWidth: number;
  baselineY: number;
  heroWidth: number;
  heroHeight: number;
  levelEnd: number;
};
