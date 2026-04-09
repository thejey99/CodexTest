"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { levels, survivorFragment, weapons } from "@/components/game-data";

type HeroClass = "skyKnight" | "wildblade" | "runeMachinist";

type HeroModel = {
  id: HeroClass;
  name: string;
  title: string;
  emblem: string;
  combatRole: string;
  special: string;
};

type CombatMove = {
  id: "light" | "heavy" | "special";
  label: string;
  damage: number;
  cooldown: number;
  flavor: string;
};

type EnemyState = {
  hp: number;
  stamina: number;
  mood: "hunting" | "staggered" | "enraged";
};

const MAX_HP = 100;
const MAX_STAMINA = 100;

const heroModels: HeroModel[] = [
  {
    id: "skyKnight",
    name: "Kael",
    title: "Sky Knight",
    emblem: "🛡️",
    combatRole: "Balanced vanguard with aerial gap-closing combos.",
    special: "Aether Crest: leap strike that breaks enemy guard."
  },
  {
    id: "wildblade",
    name: "Mira",
    title: "Wildblade",
    emblem: "🗡️",
    combatRole: "Fast pressure duelist with spinning slash finishers.",
    special: "Bloom Dash: invulnerable dash into dual-cut barrage."
  },
  {
    id: "runeMachinist",
    name: "Orin",
    title: "Rune Machinist",
    emblem: "⚙️",
    combatRole: "Mid-range tactician using gadgets and rune traps.",
    special: "Prism Cannon: charged beam with armor shred."
  }
];

const combatMoves: CombatMove[] = [
  {
    id: "light",
    label: "Quick Slash (J)",
    damage: 9,
    cooldown: 480,
    flavor: "A rapid strike for juggle starters and safe pressure."
  },
  {
    id: "heavy",
    label: "Guardian Smash (K)",
    damage: 16,
    cooldown: 920,
    flavor: "Slow but crushing blow that causes major stagger."
  },
  {
    id: "special",
    label: "Relic Art (L)",
    damage: 24,
    cooldown: 1800,
    flavor: "Signature move fueled by stamina and story relic power."
  }
];

const stageNames = [
  "Starcap Plains",
  "Clockroot Bridge",
  "Lumen Cavern",
  "Riftspire Gate",
  "Moonpetal Keep"
];

const enemyTitles = ["Goblin Ace", "Void Knight", "Iron Wisp", "Relic Drake", "Abyss Herald"];

export default function EmberfallGame() {
  const [heroId, setHeroId] = useState<HeroClass>("skyKnight");
  const [stageIndex, setStageIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyLine, setStoryLine] = useState(
    "Dawn over Starcap Plains. The relic bell rings and the quest begins."
  );

  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [enemy, setEnemy] = useState<EnemyState>({ hp: MAX_HP, stamina: MAX_STAMINA, mood: "hunting" });

  const [combo, setCombo] = useState(0);
  const [comboPeak, setComboPeak] = useState(0);
  const [relicMeter, setRelicMeter] = useState(40);
  const [roundClock, setRoundClock] = useState(90);
  const [encounter, setEncounter] = useState(1);

  const cooldownsRef = useRef<Record<CombatMove["id"], number>>({ light: 0, heavy: 0, special: 0 });

  const selectedHero = useMemo(() => heroModels.find((model) => model.id === heroId) ?? heroModels[0], [heroId]);
  const activeStage = stageNames[stageIndex % stageNames.length];
  const activeEnemyTitle = enemyTitles[stageIndex % enemyTitles.length];
  const activeLevel = levels[stageIndex % levels.length];
  const activeWeapon = weapons[stageIndex % weapons.length];

  const hpToPercent = (value: number) => `${Math.max(0, Math.min(100, value))}%`;

  const advanceStory = useCallback(() => {
    const nextStory = (storyIndex + 1) % levels.length;
    const nextStage = (stageIndex + 1) % stageNames.length;

    setStoryIndex(nextStory);
    setStageIndex(nextStage);
    setEncounter((value) => value + 1);
    setRoundClock(90);
    setEnemy({ hp: MAX_HP, stamina: MAX_STAMINA, mood: "hunting" });
    setPlayerHp((value) => Math.min(MAX_HP, value + 12));
    setRelicMeter((value) => Math.min(100, value + 25));
    setCombo(0);

    const chapter = levels[nextStory];
    setStoryLine(`Chapter ${chapter.id}: ${chapter.title}. ${chapter.revelation}`);
  }, [storyIndex, stageIndex]);

  const runEnemyTurn = useCallback(() => {
    const baseDamage = enemy.mood === "enraged" ? 12 : enemy.mood === "staggered" ? 4 : 8;
    const reducedByRelic = relicMeter >= 25 ? 3 : 0;
    const incoming = Math.max(2, baseDamage - reducedByRelic);

    setPlayerHp((value) => Math.max(0, value - incoming));
    setRelicMeter((value) => Math.max(0, value - 6));

    setStoryLine(
      `${activeEnemyTitle} retaliates for ${incoming} damage. ${
        reducedByRelic > 0 ? "Relic guard absorbed part of the impact." : ""
      }`
    );
  }, [enemy.mood, relicMeter, activeEnemyTitle]);

  const triggerMove = useCallback((moveId: CombatMove["id"]) => {
    const move = combatMoves.find((entry) => entry.id === moveId);
    if (!move) {
      return;
    }

    if (cooldownsRef.current[move.id] > 0) {
      setStoryLine(`${move.label} is recharging.`);
      return;
    }

    const staminaCost = move.id === "special" ? 28 : move.id === "heavy" ? 16 : 8;
    if (enemy.stamina < 5 && move.id !== "special") {
      setStoryLine(`Enemy guard is cracked. Use Relic Art (L) to finish.`);
    }

    if (move.id === "special" && relicMeter < 20) {
      setStoryLine("Relic meter too low. Land more hits to charge it.");
      return;
    }

    cooldownsRef.current[move.id] = move.cooldown;
    setCombo((value) => {
      const next = value + 1;
      setComboPeak((peak) => Math.max(peak, next));
      return next;
    });

    setRelicMeter((value) => {
      const gain = move.id === "special" ? -20 : 9;
      return Math.max(0, Math.min(100, value + gain));
    });

    setEnemy((current) => {
      const nextHp = Math.max(0, current.hp - move.damage);
      const nextStamina = Math.max(0, current.stamina - staminaCost);

      const mood: EnemyState["mood"] =
        nextHp <= 30 ? "enraged" : nextStamina <= 25 ? "staggered" : "hunting";

      return { hp: nextHp, stamina: nextStamina, mood };
    });

    setStoryLine(`${selectedHero.name} uses ${move.label}. ${move.flavor}`);
  }, [enemy.stamina, relicMeter, selectedHero.name]);

  const resetRun = () => {
    cooldownsRef.current = { light: 0, heavy: 0, special: 0 };
    setStageIndex(0);
    setStoryIndex(0);
    setEncounter(1);
    setPlayerHp(MAX_HP);
    setEnemy({ hp: MAX_HP, stamina: MAX_STAMINA, mood: "hunting" });
    setCombo(0);
    setComboPeak(0);
    setRelicMeter(40);
    setRoundClock(90);
    setStoryLine("Run reset. The caravan rolls out from Emberfall again.");
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoundClock((value) => Math.max(0, value - 1));

      for (const key of Object.keys(cooldownsRef.current) as CombatMove["id"][]) {
        cooldownsRef.current[key] = Math.max(0, cooldownsRef.current[key] - 100);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (roundClock === 0) {
      runEnemyTurn();
      setRoundClock(90);
      setCombo(0);
    }
  }, [roundClock, runEnemyTurn]);

  useEffect(() => {
    if (enemy.hp <= 0) {
      setStoryLine(
        `${activeEnemyTitle} falls. ${activeLevel.bossEcho} fades into starlight as you march onward.`
      );
      advanceStory();
    }
  }, [enemy.hp, activeEnemyTitle, activeLevel.bossEcho, advanceStory]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "j") triggerMove("light");
      if (key === "k") triggerMove("heavy");
      if (key === "l") triggerMove("special");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [triggerMove]);

  return (
    <main className="shell scroller-shell">
      <h1>EMBERFALL // 3D STORY SCROLLER REBUILD</h1>

      <section className="card horizon-card">
        <div className="horizon-header">
          <div>
            <p className="muted">Encounter {encounter}</p>
            <h2>{activeStage}</h2>
          </div>
          <div className="clock-chip">{roundClock}s</div>
        </div>

        <div className="scroller-3d" role="img" aria-label="3D fantasy scroller scene">
          <div className="parallax layer-back" />
          <div className="parallax layer-mid" />
          <div className="parallax layer-front" />

          <div className="character hero-model">
            <span className="glyph">{selectedHero.emblem}</span>
            <span>{selectedHero.title}</span>
          </div>

          <div className="character rival-model">
            <span className="glyph">👹</span>
            <span>{activeEnemyTitle}</span>
          </div>
        </div>

        <p className="combat-log">{storyLine}</p>
      </section>

      <section className="card">
        <h3>Character Models</h3>
        <div className="model-grid">
          {heroModels.map((model) => (
            <button
              key={model.id}
              type="button"
              className={`model-button ${model.id === heroId ? "active" : ""}`}
              onClick={() => {
                setHeroId(model.id);
                setStoryLine(`${model.name} joins the quest. ${model.special}`);
              }}
            >
              <strong>
                {model.emblem} {model.name}
              </strong>
              <span>{model.combatRole}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card combat-card">
        <h3>Updated Combat UI</h3>
        <div className="meter-grid">
          <div>
            <p>Hero HP</p>
            <div className="hp-track">
              <div className="hp-fill player" style={{ width: hpToPercent(playerHp) }} />
            </div>
          </div>
          <div>
            <p>{activeEnemyTitle} HP</p>
            <div className="hp-track">
              <div className="hp-fill enemy" style={{ width: hpToPercent(enemy.hp) }} />
            </div>
          </div>
          <div>
            <p>Enemy Guard</p>
            <div className="hp-track">
              <div className="hp-fill guard" style={{ width: hpToPercent(enemy.stamina) }} />
            </div>
          </div>
          <div>
            <p>Relic Meter</p>
            <div className="hp-track">
              <div className="hp-fill relic" style={{ width: hpToPercent(relicMeter) }} />
            </div>
          </div>
        </div>

        <div className="combat-actions">
          {combatMoves.map((move) => {
            const cooldown = cooldownsRef.current[move.id];
            return (
              <button
                key={move.id}
                type="button"
                onClick={() => triggerMove(move.id)}
                disabled={cooldown > 0}
                className="action-button"
              >
                <strong>{move.label}</strong>
                <span>{move.damage} DMG</span>
                <span>{cooldown > 0 ? `${(cooldown / 1000).toFixed(1)}s CD` : "Ready"}</span>
              </button>
            );
          })}
        </div>

        <div className="hud-row compact">
          <p>Combo: x{combo}</p>
          <p>Best Combo: x{comboPeak}</p>
          <p>Mood: {enemy.mood}</p>
        </div>

        <div className="controls controls-compact">
          <span>J = Quick Slash</span>
          <span>K = Guardian Smash</span>
          <span>L = Relic Art</span>
          <button type="button" onClick={resetRun}>
            Restart Adventure
          </button>
        </div>
      </section>

      <section className="card">
        <h3>Adventure Chronicle</h3>
        <p>
          {survivorFragment.body} This run riffs on heroic platform quests and mythic dungeon epics while keeping
          Emberfall&apos;s dark tone.
        </p>
        <ul className="notes">
          <li>
            <strong>Current Chapter:</strong> {activeLevel.title} — {activeLevel.objective}
          </li>
          <li>
            <strong>Atmosphere:</strong> {activeLevel.atmosphere}
          </li>
          <li>
            <strong>Legendary Gear:</strong> {activeWeapon.name} — {activeWeapon.combatIdentity}
          </li>
        </ul>
      </section>
    </main>
  );
}
