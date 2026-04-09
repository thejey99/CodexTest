"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EnemyType = "crawler" | "turret" | "brute";
type HeroAnim = "idle" | "run" | "jump" | "attack" | "dash" | "hurt";

type Enemy = {
  id: number;
  type: EnemyType;
  level: number;
  x: number;
  y: number;
  vx: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  aggroRange: number;
  attackCooldown: number;
  alive: boolean;
};

type Spark = {
  id: number;
  x: number;
  y: number;
  vx: number;
  life: number;
  team: "hero" | "enemy";
  damage: number;
};

type StoryBeat = {
  x: number;
  title: string;
  body: string;
};

const WORLD_WIDTH = 7600;
const GROUND_Y = 448;
const GRAVITY = 0.86;
const CAMERA_WIDTH = 1020;
const HERO_WIDTH = 42;
const MAX_HP = 170;

const storyBeats: StoryBeat[] = [
  {
    x: 180,
    title: "Starpipe Village",
    body: "Princess Nova is trapped beyond the Rift Fortress. Recover three Cosmic Cores to open the gate."
  },
  {
    x: 1750,
    title: "Mossfall Frontier",
    body: "A ranger warns you: enemies now use coordinated formations and ranged fire."
  },
  {
    x: 3420,
    title: "Sunken Gearworks",
    body: "Ancient machines wake up. Brutes can charge and break your momentum."
  },
  {
    x: 5200,
    title: "Voidvine Expanse",
    body: "Dark vines mutate into elite hunters. Their levels spike hard here."
  },
  {
    x: 7060,
    title: "Rift Fortress",
    body: "Final zone unlocked. Defeat the Warden Legion and rescue Nova."
  }
];

const biomeBands = [
  { id: "starfield", start: 0, end: 1580, label: "Starpipe Grasslands", sky: "var(--sky-one)" },
  { id: "moss", start: 1580, end: 3120, label: "Mossfall Frontier", sky: "var(--sky-two)" },
  { id: "gear", start: 3120, end: 4900, label: "Sunken Gearworks", sky: "var(--sky-three)" },
  { id: "void", start: 4900, end: WORLD_WIDTH, label: "Voidvine Expanse", sky: "var(--sky-four)" }
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const zoneForX = (x: number) => biomeBands.find((band) => x >= band.start && x < band.end) ?? biomeBands[0];

const spawnEnemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  let id = 1;

  for (let i = 0; i < 30; i += 1) {
    const zoneBias = i < 9 ? 1 : i < 18 ? 2 : i < 24 ? 3 : 4;
    const type: EnemyType = i % 5 === 0 ? "brute" : i % 3 === 0 ? "turret" : "crawler";

    const level = zoneBias + Math.floor(i / 5);
    const maxHp = type === "brute" ? 120 + level * 24 : type === "turret" ? 85 + level * 14 : 72 + level * 16;

    enemies.push({
      id,
      type,
      level,
      x: 340 + i * 236,
      y: GROUND_Y,
      vx: i % 2 === 0 ? 1 : -1,
      hp: maxHp,
      maxHp,
      damage: type === "brute" ? 16 + level * 2 : 8 + level * 2,
      speed: type === "brute" ? 1.05 + level * 0.05 : type === "turret" ? 0.6 : 1.7 + level * 0.09,
      aggroRange: type === "turret" ? 520 : 340,
      attackCooldown: 0,
      alive: true
    });

    id += 1;
  }

  return enemies;
};

export default function EmberfallGame() {
  const heroX = useRef(80);
  const heroY = useRef(GROUND_Y);
  const heroVx = useRef(0);
  const heroVy = useRef(0);
  const facing = useRef<1 | -1>(1);

  const [heroHp, setHeroHp] = useState(MAX_HP);
  const [heroAnim, setHeroAnim] = useState<HeroAnim>("idle");
  const [cameraX, setCameraX] = useState(0);
  const [worldTick, setWorldTick] = useState(0);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [heroLevel, setHeroLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [story, setStory] = useState(storyBeats[0]);
  const [questProgress, setQuestProgress] = useState(0);

  const [enemies, setEnemies] = useState<Enemy[]>(spawnEnemies);
  const [sparks, setSparks] = useState<Spark[]>([]);

  const keys = useRef<Record<string, boolean>>({});
  const combatCooldown = useRef(0);
  const dashCooldown = useRef(0);
  const hurtCooldown = useRef(0);
  const storyIndexRef = useRef(0);

  const aliveEnemies = useMemo(() => enemies.filter((enemy) => enemy.alive), [enemies]);
  const zone = zoneForX(heroX.current);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keys.current[event.key.toLowerCase()] = true;
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = clamp((time - lastTime) / 16.667, 0.6, 1.8);
      lastTime = time;

      if (heroHp <= 0) {
        setHeroAnim("hurt");
        raf = requestAnimationFrame(loop);
        return;
      }

      combatCooldown.current = Math.max(0, combatCooldown.current - delta);
      dashCooldown.current = Math.max(0, dashCooldown.current - delta);
      hurtCooldown.current = Math.max(0, hurtCooldown.current - delta);

      const left = keys.current["a"] || keys.current["arrowleft"];
      const right = keys.current["d"] || keys.current["arrowright"];
      const jump = keys.current["w"] || keys.current[" "];
      const attack = keys.current["j"];
      const special = keys.current["k"];
      const dash = keys.current["shift"];

      if (left) {
        heroVx.current -= 0.72 * delta;
        facing.current = -1;
      }

      if (right) {
        heroVx.current += 0.72 * delta;
        facing.current = 1;
      }

      if (!left && !right) {
        heroVx.current *= 0.85;
      }

      heroVx.current = clamp(heroVx.current, -6.4, 6.4);

      const onGround = heroY.current >= GROUND_Y;
      if (jump && onGround) {
        heroVy.current = -14.9;
      }

      if (dash && dashCooldown.current <= 0 && Math.abs(heroVx.current) > 0.6) {
        heroVx.current += 8.5 * facing.current;
        dashCooldown.current = 42;
        setHeroAnim("dash");
      }

      if ((attack || special) && combatCooldown.current <= 0) {
        const strikeRange = special ? 180 : 110;
        const strikeDamage = special ? 48 + heroLevel * 5 : 22 + heroLevel * 3;
        const strikeX = heroX.current + (facing.current === 1 ? strikeRange : -strikeRange);

        setEnemies((current) => {
          let comboGain = 0;
          const next = current.map((enemy) => {
            if (!enemy.alive) {
              return enemy;
            }

            const withinX = Math.abs(enemy.x - strikeX) < (special ? 100 : 72);
            const withinY = Math.abs(enemy.y - heroY.current) < 70;
            if (!withinX || !withinY) {
              return enemy;
            }

            const hp = enemy.hp - strikeDamage;
            comboGain += 1;

            if (hp <= 0) {
              setCoins((value) => value + 6 + enemy.level * 2);
              setXp((value) => value + 14 + enemy.level * 4);
              return { ...enemy, hp: 0, alive: false };
            }

            return { ...enemy, hp, x: enemy.x + 22 * facing.current };
          });

          if (comboGain > 0) {
            setCombo((value) => value + comboGain);
          }

          return next;
        });

        if (special) {
          setSparks((current) => [
            ...current,
            {
              id: Date.now(),
              x: heroX.current + 16,
              y: heroY.current - 20,
              vx: facing.current * 11,
              life: 24,
              team: "hero",
              damage: 34 + heroLevel * 4
            }
          ]);
        }

        combatCooldown.current = special ? 34 : 16;
        setHeroAnim("attack");
      }

      heroVy.current += GRAVITY * delta;
      heroY.current += heroVy.current * delta;
      heroX.current += heroVx.current * delta;

      if (heroY.current >= GROUND_Y) {
        heroY.current = GROUND_Y;
        heroVy.current = 0;
      }

      heroX.current = clamp(heroX.current, 0, WORLD_WIDTH - HERO_WIDTH);

      setEnemies((current) =>
        current.map((enemy) => {
          if (!enemy.alive) {
            return enemy;
          }

          const dx = heroX.current - enemy.x;
          const distance = Math.abs(dx);
          let nextX = enemy.x;
          let nextVx = enemy.vx;
          let nextCooldown = Math.max(0, enemy.attackCooldown - delta);

          if (distance < enemy.aggroRange) {
            if (enemy.type !== "turret") {
              nextVx = Math.sign(dx || 1) * enemy.speed;
              nextX += nextVx * delta;
            }

            if (distance < 60 && nextCooldown <= 0) {
              nextCooldown = enemy.type === "brute" ? 44 : 32;
              if (hurtCooldown.current <= 0) {
                const incoming = enemy.damage;
                setHeroHp((value) => Math.max(0, value - incoming));
                hurtCooldown.current = 22;
                setCombo(0);
                setHeroAnim("hurt");
              }
            }

            if (enemy.type === "turret" && distance < 360 && nextCooldown <= 0) {
              nextCooldown = 72;
              setSparks((currentSparks) => [
                ...currentSparks,
                {
                  id: Date.now() + enemy.id,
                  x: enemy.x,
                  y: enemy.y - 28,
                  vx: Math.sign(dx || 1) * 6.2,
                  life: 80,
                  team: "enemy",
                  damage: 9 + enemy.level * 2
                }
              ]);
            }
          } else {
            if (enemy.type !== "turret") {
              nextX += nextVx * delta;
              const roamMin = enemy.id * 200;
              const roamMax = roamMin + 170;
              if (nextX < roamMin || nextX > roamMax) {
                nextVx *= -1;
              }
            }
          }

          return {
            ...enemy,
            x: clamp(nextX, 0, WORLD_WIDTH - 40),
            vx: nextVx,
            attackCooldown: nextCooldown
          };
        })
      );

      setSparks((current) => {
        const moved = current
          .map((spark) => ({ ...spark, x: spark.x + spark.vx * delta, life: spark.life - delta }))
          .filter((spark) => spark.life > 0);

        return moved.filter((spark) => {
          if (spark.team === "hero") {
            let collided = false;
            setEnemies((currentEnemies) =>
              currentEnemies.map((enemy) => {
                if (!enemy.alive || collided) {
                  return enemy;
                }
                const hit = Math.abs(enemy.x - spark.x) < 34 && Math.abs(enemy.y - spark.y) < 66;
                if (!hit) {
                  return enemy;
                }
                collided = true;
                const hp = enemy.hp - spark.damage;
                if (hp <= 0) {
                  setCoins((value) => value + 4 + enemy.level * 2);
                  setXp((value) => value + 10 + enemy.level * 3);
                  return { ...enemy, hp: 0, alive: false };
                }
                return { ...enemy, hp };
              })
            );
            return !collided;
          }

          const hitHero = Math.abs(heroX.current - spark.x) < 34 && Math.abs(heroY.current - spark.y) < 62;
          if (hitHero && hurtCooldown.current <= 0) {
            setHeroHp((value) => Math.max(0, value - spark.damage));
            hurtCooldown.current = 18;
            setCombo(0);
            return false;
          }
          return true;
        });
      });

      const nextStoryIndex = storyIndexRef.current + 1;
      if (nextStoryIndex < storyBeats.length && heroX.current >= storyBeats[nextStoryIndex].x) {
        storyIndexRef.current = nextStoryIndex;
        setStory(storyBeats[nextStoryIndex]);
        setQuestProgress(nextStoryIndex);
      }

      const leveled = 1 + Math.floor(xp / 120);
      if (leveled !== heroLevel) {
        setHeroLevel(leveled);
      }

      const camera = clamp(heroX.current - CAMERA_WIDTH / 2, 0, WORLD_WIDTH - CAMERA_WIDTH);
      setCameraX(camera);

      if (heroY.current < GROUND_Y - 5) {
        setHeroAnim("jump");
      } else if (Math.abs(heroVx.current) > 1.3) {
        setHeroAnim("run");
      } else if (combatCooldown.current > 0 && heroAnim !== "dash") {
        setHeroAnim("attack");
      } else if (hurtCooldown.current > 0) {
        setHeroAnim("hurt");
      } else if (dashCooldown.current > 32) {
        setHeroAnim("dash");
      } else {
        setHeroAnim("idle");
      }

      setWorldTick((value) => value + 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [heroHp, heroLevel, xp, heroAnim]);

  const resetWorld = () => {
    heroX.current = 80;
    heroY.current = GROUND_Y;
    heroVx.current = 0;
    heroVy.current = 0;
    facing.current = 1;
    setHeroHp(MAX_HP);
    setEnemies(spawnEnemies());
    setSparks([]);
    setCoins(0);
    setXp(0);
    setHeroLevel(1);
    setCombo(0);
    storyIndexRef.current = 0;
    setStory(storyBeats[0]);
    setQuestProgress(0);
    setCameraX(0);
  };

  return (
    <main className="mega-shell">
      <header className="title-card">
        <h1>EMBERFALL: STARBREAKER ODYSSEY</h1>
        <p>
          Massive side-scrolling open world with movement tech, combat combos, ranged enemies, scaling levels, and
          story milestones.
        </p>
      </header>

      <section className="hud-panel">
        <div>
          <p className="label">Hero</p>
          <h2>Kael the Rift Runner · Lv {heroLevel}</h2>
          <p className="sub">Biome: {zone.label}</p>
        </div>
        <div className="stats-row">
          <span>HP {heroHp}/{MAX_HP}</span>
          <span>XP {xp}</span>
          <span>Coins {coins}</span>
          <span>Combo x{combo}</span>
          <span>{aliveEnemies.length} foes alive</span>
        </div>
      </section>

      <section className="game-frame" role="application" aria-label="Open world platform combat arena">
        <div className="sky" style={{ background: zone.sky }} />

        <div className="world" style={{ transform: `translateX(${-cameraX}px)` }}>
          {biomeBands.map((band) => (
            <div
              key={band.id}
              className="biome-band"
              style={{ left: band.start, width: band.end - band.start }}
              data-biome={band.id}
            >
              <span>{band.label}</span>
            </div>
          ))}

          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`platform-${index}`}
              className="floating-platform"
              style={{
                left: 180 + index * 94,
                bottom: index % 4 === 0 ? 190 : index % 3 === 0 ? 230 : 128,
                width: 82 + (index % 3) * 36
              }}
            />
          ))}

          {enemies.map((enemy) =>
            enemy.alive ? (
              <article
                key={enemy.id}
                className={`enemy enemy-${enemy.type}`}
                style={{ left: enemy.x, bottom: 80 + (GROUND_Y - enemy.y) }}
              >
                <span className="enemy-core">{enemy.type === "brute" ? "🦍" : enemy.type === "turret" ? "🛰️" : "👾"}</span>
                <small>Lv {enemy.level}</small>
                <div className="enemy-hp-bar">
                  <i style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
              </article>
            ) : null
          )}

          {sparks.map((spark) => (
            <span
              key={spark.id}
              className={`spark ${spark.team}`}
              style={{ left: spark.x, bottom: 96 + (GROUND_Y - spark.y) }}
            />
          ))}

          <article
            className={`hero hero-${heroAnim}`}
            style={{ left: heroX.current, bottom: 80 + (GROUND_Y - heroY.current), transform: `scaleX(${facing.current})` }}
          >
            <span className="hero-glyph">⚔️</span>
            <small>{heroAnim.toUpperCase()}</small>
          </article>

          <div className="ground" />
        </div>
      </section>

      <section className="story-panel">
        <div>
          <p className="label">Story Beat {questProgress + 1}/{storyBeats.length}</p>
          <h3>{story.title}</h3>
          <p>{story.body}</p>
        </div>
        <div className="controls">
          <p>Controls: A/D move · W/Space jump · Shift dash · J slash · K special shot.</p>
          <button type="button" onClick={resetWorld}>Rebuild World</button>
        </div>
      </section>

      <section className="mini-map">
        <div className="map-track">
          <span className="map-hero" style={{ left: `${(heroX.current / WORLD_WIDTH) * 100}%` }} />
          {aliveEnemies.slice(0, 45).map((enemy) => (
            <i key={`dot-${enemy.id}`} style={{ left: `${(enemy.x / WORLD_WIDTH) * 100}%` }} />
          ))}
        </div>
        <p>World distance: {Math.round(heroX.current)} / {WORLD_WIDTH}</p>
        <p>Engine tick: {worldTick}</p>
      </section>
    </main>
  );
}
