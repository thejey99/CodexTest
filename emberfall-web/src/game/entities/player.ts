export type HeroAnim = "idle" | "run" | "jump" | "slide" | "hurt";

export type HeroId = "nova" | "bolt" | "mira";

export type HeroDefinition = {
  id: HeroId;
  name: string;
  color: string;
  glyph: string;
  speed: number;
  jumpPower: number;
};

export type PlayerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  invulnerabilityFrames: number;
  animation: HeroAnim;
};
