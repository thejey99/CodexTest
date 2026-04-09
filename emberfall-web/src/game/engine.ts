import { heroDefinitions } from "./data/character-definitions";
import { localization } from "./data/localization";
import { calculateCameraX } from "./core/camera";
import { isCoinCollected, isWithinPlatformBounds, hazardCollision } from "./core/collision";
import { createLoop } from "./core/loop";
import { applyGravity, applyGroundFriction, clampVelocity } from "./core/physics";
import { clamp, toDelta } from "./core/timing";
import type { HeroDefinition } from "./entities/player";
import type { Coin, GameConstants, GameSnapshot, Hazard, Platform } from "./state";

const constants: GameConstants = {
  trackLength: 5200,
  viewportWidth: 1020,
  baselineY: 420,
  heroWidth: 44,
  heroHeight: 62,
  levelEnd: 5200 - 180
};

const platforms: Platform[] = [
  { id: 1, x: 460, y: 332, width: 130 },
  { id: 2, x: 840, y: 288, width: 150 },
  { id: 3, x: 1290, y: 346, width: 120 },
  { id: 4, x: 1720, y: 292, width: 170 },
  { id: 5, x: 2210, y: 332, width: 136 },
  { id: 6, x: 2670, y: 286, width: 150 },
  { id: 7, x: 3130, y: 340, width: 145 },
  { id: 8, x: 3600, y: 300, width: 168 },
  { id: 9, x: 4070, y: 338, width: 148 }
];

const hazards: Hazard[] = Array.from({ length: 22 }).map((_, index) => ({
  id: index + 1,
  x: 560 + index * 200,
  width: index % 4 === 0 ? 64 : 52,
  lane: index % 3 === 0 ? "high" : "ground"
}));

const seedCoins = (): Coin[] =>
  Array.from({ length: 56 }).map((_, index) => {
    const laneOffset = index % 4 === 0 ? -130 : index % 3 === 0 ? -180 : -80;
    const platform = platforms.find((item) => Math.abs(item.x - (260 + index * 86)) < 44);

    return {
      id: index + 1,
      x: 260 + index * 86,
      y: platform ? platform.y - 38 : constants.baselineY + laneOffset,
      picked: false
    };
  });

type EngineState = GameSnapshot & {
  vx: number;
  vy: number;
  invulnerabilityFrames: number;
};

type GameEngine = {
  getState: () => GameSnapshot;
  subscribe: (listener: () => void) => () => void;
  start: () => () => void;
  restart: () => void;
  selectHero: (hero: HeroDefinition) => void;
  getWorld: () => {
    constants: GameConstants;
    platforms: Platform[];
    hazards: Hazard[];
    heroes: HeroDefinition[];
    strings: typeof localization.en;
  };
};

const createInitialState = (hero = heroDefinitions[0]): EngineState => ({
  selectedHero: hero,
  coins: seedCoins(),
  score: 0,
  lives: 3,
  timer: 250,
  cameraX: 0,
  animation: "idle",
  won: false,
  tick: 0,
  x: 70,
  y: constants.baselineY,
  vx: 0,
  vy: 0,
  facing: 1,
  invulnerabilityFrames: 0,
  collected: 0,
  progress: 1
});

export const createGameEngine = (): GameEngine => {
  let state = createInitialState();
  let lastTime = performance.now();
  let timerAccumulator = 0;
  let mountedCount = 0;
  const keys: Record<string, boolean> = {};
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (next: Partial<EngineState>) => {
    state = { ...state, ...next };
    emit();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    keys[event.key.toLowerCase()] = true;
    if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    keys[event.key.toLowerCase()] = false;
  };

  const update = (time: number) => {
    const frameMs = time - lastTime;
    const dt = toDelta(time, lastTime);
    lastTime = time;

    if (!state.won && state.lives > 0) {
      timerAccumulator += frameMs;
      if (timerAccumulator >= 1000) {
        const timerDrops = Math.floor(timerAccumulator / 1000);
        timerAccumulator -= timerDrops * 1000;
        state.timer = Math.max(0, state.timer - timerDrops);
      }

      if (state.timer <= 0) {
        state.lives = Math.max(0, state.lives - 1);
        state.x = 70;
        state.y = constants.baselineY;
        state.vx = 0;
        state.vy = 0;
        state.timer = 250;
      }

      state.invulnerabilityFrames = Math.max(0, state.invulnerabilityFrames - dt);

      const moveLeft = keys.a || keys.arrowleft;
      const moveRight = keys.d || keys.arrowright;
      const crouch = keys.s || keys.arrowdown;
      const jumpPressed = keys.w || keys[" "] || keys.arrowup;

      if (moveLeft) {
        state.vx -= 0.8 * dt;
        state.facing = -1;
      }

      if (moveRight) {
        state.vx += 0.8 * dt;
        state.facing = 1;
      }

      state.vx = applyGroundFriction(state.vx, !moveLeft && !moveRight);
      state.vx = clampVelocity(state.vx, state.selectedHero.speed);

      const standingOnPlatform = platforms.find(
        (platform) =>
          isWithinPlatformBounds(state.x, constants.heroWidth, platform) &&
          Math.abs(state.y - platform.y) < 4 &&
          state.vy >= 0
      );
      const onGround = state.y >= constants.baselineY || Boolean(standingOnPlatform);

      if (jumpPressed && onGround) {
        state.vy = -state.selectedHero.jumpPower;
      }

      state.vy = applyGravity(state.vy, dt);
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      let landed = false;
      for (const platform of platforms) {
        const wasAbove = state.y - state.vy <= platform.y;
        const withinX = isWithinPlatformBounds(state.x, constants.heroWidth, platform);
        const crossedTop = state.y >= platform.y && state.y <= platform.y + 15;

        if (withinX && wasAbove && crossedTop && state.vy >= 0) {
          state.y = platform.y;
          state.vy = 0;
          landed = true;
          break;
        }
      }

      if (state.y >= constants.baselineY) {
        state.y = constants.baselineY;
        state.vy = 0;
        landed = true;
      }

      state.x = clamp(state.x, 0, constants.trackLength - constants.heroWidth);

      state.coins = state.coins.map((coin) => {
        if (coin.picked) return coin;
        if (!isCoinCollected(coin, state.x + constants.heroWidth / 2, state.y)) return coin;

        state.score += 100;
        return { ...coin, picked: true };
      });

      for (const hazard of hazards) {
        const hit = hazardCollision(hazard, state.x, state.y, constants.heroWidth, constants.baselineY);
        if (!hit || state.invulnerabilityFrames > 0) continue;

        state.invulnerabilityFrames = 95;
        state.lives = Math.max(0, state.lives - 1);
        state.score = Math.max(0, state.score - 120);
        state.x = Math.max(60, state.x - 120);
        break;
      }

      state.collected = state.coins.filter((coin) => coin.picked).length;
      if (state.x >= constants.levelEnd && state.collected >= 42) {
        state.won = true;
      }

      state.cameraX = calculateCameraX(state.x, constants.viewportWidth, constants.trackLength);
      if (state.invulnerabilityFrames > 0) state.animation = "hurt";
      else if (!landed) state.animation = "jump";
      else if (crouch) state.animation = "slide";
      else if (Math.abs(state.vx) > 1.3) state.animation = "run";
      else state.animation = "idle";

      state.progress = Math.min(100, Math.round((state.x / constants.levelEnd) * 100));
    }

    state.tick += 1;
    emit();
  };

  const loop = createLoop(update);

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      mountedCount += 1;
      if (mountedCount === 1) {
        lastTime = performance.now();
        window.addEventListener("keydown", onKeyDown, { passive: false });
        window.addEventListener("keyup", onKeyUp);
        loop.start();
      }

      return () => {
        mountedCount = Math.max(0, mountedCount - 1);
        if (mountedCount === 0) {
          loop.stop();
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
        }
      };
    },
    restart() {
      const next = createInitialState(state.selectedHero);
      setState(next);
    },
    selectHero(hero) {
      setState(createInitialState(hero));
    },
    getWorld() {
      return {
        constants,
        platforms,
        hazards,
        heroes: heroDefinitions,
        strings: localization.en
      };
    }
  };
};

export const gameEngine = createGameEngine();
