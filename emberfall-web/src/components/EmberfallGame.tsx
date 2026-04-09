"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Fighter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  facing: 1 | -1;
  attackCooldown: number;
  hitStun: number;
};

const arena = {
  width: 720,
  height: 300,
  floorY: 230,
  gravity: 0.65,
  moveSpeed: 3.2,
  jumpVelocity: -11.4,
  attackRange: 62,
  attackDamage: 8,
  attackFrames: 18,
  maxHp: 100,
  enemySpeed: 2.15,
  enemyAttackRange: 58,
  enemyAttackFrames: 26,
  enemyDamage: 7,
  spawnX: 120,
  enemySpawnX: 580,
  fighterWidth: 32,
  fighterHeight: 42
};

const initialPlayer = (): Fighter => ({
  x: arena.spawnX,
  y: arena.floorY,
  vx: 0,
  vy: 0,
  hp: arena.maxHp,
  facing: 1,
  attackCooldown: 0,
  hitStun: 0
});

const initialEnemy = (): Fighter => ({
  x: arena.enemySpawnX,
  y: arena.floorY,
  vx: 0,
  vy: 0,
  hp: arena.maxHp,
  facing: -1,
  attackCooldown: 0,
  hitStun: 0
});

export default function EmberfallGame() {
  const [player, setPlayer] = useState<Fighter>(() => initialPlayer());
  const [enemy, setEnemy] = useState<Fighter>(() => initialEnemy());
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState("Move with A/D, jump with W/Space, punch with J.");
  const [wins, setWins] = useState({ player: 0, enemy: 0 });
  const [timeLeft, setTimeLeft] = useState(60);

  const pressedRef = useRef<Record<string, boolean>>({});
  const timerRef = useRef<number | null>(null);

  const distance = useMemo(() => Math.abs(player.x - enemy.x), [player.x, enemy.x]);
  const playerGrounded = player.y >= arena.floorY;

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const resetRound = (winner: "player" | "enemy" | "draw") => {
    if (winner === "player") {
      setWins((prev) => ({ ...prev, player: prev.player + 1 }));
      setMessage("Round won. Enemy respawning tougher.");
    } else if (winner === "enemy") {
      setWins((prev) => ({ ...prev, enemy: prev.enemy + 1 }));
      setMessage("Enemy takes the round. Run it back.");
    } else {
      setMessage("Time out. Next round now.");
    }

    setRound((prev) => prev + 1);
    setPlayer(initialPlayer());
    setEnemy(initialEnemy());
    setTimeLeft(60);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedRef.current[key] = true;

      if (key === " " || key === "w") {
        setPlayer((current) => {
          if (current.y < arena.floorY) {
            return current;
          }
          return { ...current, vy: arena.jumpVelocity };
        });
      }

      if (key === "j") {
        setPlayer((current) => {
          if (current.attackCooldown > 0 || current.hitStun > 0) {
            return current;
          }

          const next = { ...current, attackCooldown: arena.attackFrames };
          setEnemy((foe) => {
            if (foe.hitStun > 0) {
              return foe;
            }

            const hitDistance = Math.abs(current.x - foe.x);
            const facingTarget = current.facing === 1 ? foe.x >= current.x : foe.x <= current.x;
            if (hitDistance <= arena.attackRange && facingTarget) {
              setMessage("Direct hit.");
              return {
                ...foe,
                hp: Math.max(0, foe.hp - arena.attackDamage),
                hitStun: 10,
                vx: current.facing * 4
              };
            }

            setMessage("Whiff.");
            return foe;
          });

          return next;
        });
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      pressedRef.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [round]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (player.hp === enemy.hp) {
        resetRound("draw");
      } else {
        resetRound(player.hp > enemy.hp ? "player" : "enemy");
      }
    }
  }, [timeLeft, player.hp, enemy.hp]);

  useEffect(() => {
    if (player.hp <= 0) {
      resetRound("enemy");
      return;
    }

    if (enemy.hp <= 0) {
      resetRound("player");
    }
  }, [player.hp, enemy.hp]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setPlayer((current) => {
        let vx = 0;
        if (current.hitStun <= 0) {
          if (pressedRef.current.a) {
            vx = -arena.moveSpeed;
          }
          if (pressedRef.current.d) {
            vx = arena.moveSpeed;
          }
        }

        const nextVy = current.vy + arena.gravity;
        const nextX = clamp(current.x + vx, 20, arena.width - 20);
        const nextY = Math.min(arena.floorY, current.y + nextVy);

        return {
          ...current,
          x: nextX,
          y: nextY,
          vx,
          vy: nextY >= arena.floorY ? 0 : nextVy,
          facing: vx < 0 ? -1 : vx > 0 ? 1 : current.facing,
          attackCooldown: Math.max(0, current.attackCooldown - 1),
          hitStun: Math.max(0, current.hitStun - 1)
        };
      });

      setEnemy((current) => {
        if (current.hp <= 0) {
          return current;
        }

        return {
          ...current,
          attackCooldown: Math.max(0, current.attackCooldown - 1),
          hitStun: Math.max(0, current.hitStun - 1)
        };
      });
    }, 16);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    setEnemy((foe) => {
      if (foe.hitStun > 0 || foe.hp <= 0) {
        return foe;
      }

      const direction = player.x > foe.x ? 1 : -1;
      const nextFacing: 1 | -1 = direction === 1 ? 1 : -1;
      const canAttack = distance <= arena.enemyAttackRange && foe.attackCooldown <= 0;

      if (canAttack) {
        setPlayer((hero) => {
          if (hero.hitStun > 0) {
            return hero;
          }
          return {
            ...hero,
            hp: Math.max(0, hero.hp - arena.enemyDamage),
            hitStun: 8,
            vx: direction * -3
          };
        });

        return {
          ...foe,
          facing: nextFacing,
          attackCooldown: arena.enemyAttackFrames
        };
      }

      const desiredVx = distance > arena.enemyAttackRange - 8 ? direction * arena.enemySpeed : 0;
      const nextX = clamp(foe.x + desiredVx, 20, arena.width - 20);
      const nextVy = foe.vy + arena.gravity;
      const nextY = Math.min(arena.floorY, foe.y + nextVy);

      return {
        ...foe,
        x: nextX,
        y: nextY,
        vx: desiredVx,
        vy: nextY >= arena.floorY ? 0 : nextVy,
        facing: nextFacing
      };
    });
  }, [player.x, distance]);

  const hpToPercent = (hp: number) => `${Math.max(0, hp)}%`;

  return (
    <main className="shell arena-shell">
      <h1>EMBERFALL BRAWLER // TOTAL REBUILD</h1>
      <section className="card">
        <div className="hud-row">
          <div>
            <p className="muted">Round {round}</p>
            <p>Player Wins: {wins.player}</p>
          </div>
          <div>
            <p className="muted">Timer</p>
            <p>{timeLeft}s</p>
          </div>
          <div>
            <p className="muted">Enemy Wins</p>
            <p>{wins.enemy}</p>
          </div>
        </div>

        <div className="hp-panel">
          <div>
            <p>Player</p>
            <div className="hp-track">
              <div className="hp-fill player" style={{ width: hpToPercent(player.hp) }} />
            </div>
          </div>
          <div>
            <p>Enemy</p>
            <div className="hp-track">
              <div className="hp-fill enemy" style={{ width: hpToPercent(enemy.hp) }} />
            </div>
          </div>
        </div>

        <div className="arena" role="img" aria-label="2D combat arena">
          <div className="ground" />
          <div
            className={`fighter player ${player.attackCooldown > arena.attackFrames - 5 ? "attack" : ""}`}
            style={{ left: player.x, top: player.y, transform: `translate(-50%, -100%) scaleX(${player.facing})` }}
          >
            🥊
          </div>
          <div
            className={`fighter enemy ${enemy.attackCooldown > arena.enemyAttackFrames - 5 ? "attack" : ""}`}
            style={{ left: enemy.x, top: enemy.y, transform: `translate(-50%, -100%) scaleX(${enemy.facing})` }}
          >
            🤖
          </div>
        </div>

        <p className="combat-log">{message}</p>

        <div className="controls">
          <span>A/D = Move</span>
          <span>W or Space = Jump</span>
          <span>J = Attack</span>
          <button
            type="button"
            onClick={() => {
              setPlayer(initialPlayer());
              setEnemy(initialEnemy());
              setRound(1);
              setWins({ player: 0, enemy: 0 });
              setTimeLeft(60);
              setMessage("Fresh match started.");
            }}
          >
            Reset Match
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Gameplay Notes</h2>
        <ul className="notes">
          <li>Single-stage 2D arena with free left/right movement.</li>
          <li>Real-time collision checks and attack range validation.</li>
          <li>AI chases, attacks, and trades blows instantly.</li>
        </ul>
        <p className="muted">No storybook scroller. This is pure movement + combat loop.</p>
        <p className="muted">Player grounded: {playerGrounded ? "yes" : "airborne"} · Spacing: {Math.round(distance)} px</p>
      </section>
    </main>
  );
}
