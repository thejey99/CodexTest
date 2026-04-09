"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { branchConditions, dialogueNodes, storyActs, storyChapters, storyEndings, storyMissions } from "@/game/data/story";
import { DialogueEngine } from "@/game/systems/dialogue-system";
import { QuestStateMachine, createDefaultQuestProgress, type QuestProgressState } from "@/game/systems/quest-system";
import { clearStorySave, loadStorySave, persistStorySave } from "@/game/systems/story-save";

type HeroAnim = "idle" | "run" | "jump" | "slide" | "hurt";

type Hero = {
  id: "nova" | "bolt" | "mira";
  name: string;
  color: string;
  glyph: string;
  speed: number;
  jumpPower: number;
};

type Coin = {
  id: number;
  x: number;
  y: number;
  picked: boolean;
};

type Hazard = {
  id: number;
  x: number;
  width: number;
  lane: "ground" | "high";
};

type Platform = {
  id: number;
  x: number;
  y: number;
  width: number;
};

type StoryTab = "codex" | "active" | "completed" | "affinity";

const TRACK_LENGTH = 5200;
const VIEWPORT_WIDTH = 1020;
const BASELINE_Y = 420;
const HERO_WIDTH = 44;
const HERO_HEIGHT = 62;
const GRAVITY = 0.82;
const LEVEL_END = TRACK_LENGTH - 180;

const heroes: Hero[] = [
  { id: "nova", name: "Nova Fox", color: "#ff8756", glyph: "🦊", speed: 6.2, jumpPower: 14.4 },
  { id: "bolt", name: "Bolt Rabbit", color: "#72d7ff", glyph: "🐇", speed: 7, jumpPower: 13.5 },
  { id: "mira", name: "Mira Cat", color: "#d38cff", glyph: "🐈", speed: 5.9, jumpPower: 15.8 }
];

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

const seedCoins = (): Coin[] =>
  Array.from({ length: 56 }).map((_, index) => {
    const laneOffset = index % 4 === 0 ? -130 : index % 3 === 0 ? -180 : -80;
    const platform = platforms.find((item) => Math.abs(item.x - (260 + index * 86)) < 44);

    return {
      id: index + 1,
      x: 260 + index * 86,
      y: platform ? platform.y - 38 : BASELINE_Y + laneOffset,
      picked: false
    };
  });

const hazards: Hazard[] = Array.from({ length: 22 }).map((_, index) => ({
  id: index + 1,
  x: 560 + index * 200,
  width: index % 4 === 0 ? 64 : 52,
  lane: index % 3 === 0 ? "high" : "ground"
}));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const cloneQuestState = (state: QuestProgressState): QuestProgressState => ({
  activeMissionIds: [...state.activeMissionIds],
  completedMissionIds: [...state.completedMissionIds],
  failedMissionIds: [...state.failedMissionIds],
  selectedBranches: { ...state.selectedBranches },
  flags: { ...state.flags },
  relationship: { ...state.relationship }
});

export default function EmberfallGame() {
  const [selectedHero, setSelectedHero] = useState<Hero>(heroes[0]);
  const [coins, setCoins] = useState<Coin[]>(seedCoins);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(250);
  const [cameraX, setCameraX] = useState(0);
  const [anim, setAnim] = useState<HeroAnim>("idle");
  const [won, setWon] = useState(false);
  const [tick, setTick] = useState(0);
  const [questState, setQuestState] = useState<QuestProgressState>(createDefaultQuestProgress);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [storyTab, setStoryTab] = useState<StoryTab>("codex");
  const [dialogueNodeId, setDialogueNodeId] = useState(dialogueNodes[0]?.id ?? "");

  const x = useRef(70);
  const y = useRef(BASELINE_Y);
  const vx = useRef(0);
  const vy = useRef(0);
  const facing = useRef<1 | -1>(1);
  const invuln = useRef(0);
  const keys = useRef<Record<string, boolean>>({});

  const collected = useMemo(() => coins.filter((coin) => coin.picked).length, [coins]);
  const progress = Math.round((x.current / LEVEL_END) * 100);
  const questMachine = useMemo(() => new QuestStateMachine(storyMissions, questState), [questState]);
  const dialogueEngine = useMemo(() => new DialogueEngine(dialogueNodes, questMachine), [questMachine]);

  const runQuestMutation = (mutation: (machine: QuestStateMachine) => void) => {
    setQuestState((current) => {
      const nextState = cloneQuestState(current);
      const machine = new QuestStateMachine(storyMissions, nextState);
      mutation(machine);
      return nextState;
    });
  };

  const activeMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "active");
  const completedMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "completed");
  const failedMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "failed");
  const availableMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "available");

  const completedArcs = storyActs.filter((act) => {
    const chapters = storyChapters.filter((chapter) => chapter.actId === act.id);
    const missionIds = chapters.flatMap((chapter) => chapter.missionIds);
    return missionIds.every((missionId) => questState.completedMissionIds.includes(missionId));
  });

  const unlockedConditionIds = branchConditions
    .filter((condition) => questMachine.meetsAll(condition.requirements))
    .map((condition) => condition.id);

  const unlockedEndings = storyEndings.filter((ending) => ending.conditionIds.some((conditionId) => unlockedConditionIds.includes(conditionId)));

  useEffect(() => {
    const save = loadStorySave();
    setQuestState(save.quest);
    setStoryLoaded(true);
  }, []);

  useEffect(() => {
    if (!storyLoaded) {
      return;
    }

    persistStorySave(questState);
  }, [questState, storyLoaded]);

  useEffect(() => {
    if (!storyLoaded) {
      return;
    }

    if (questState.activeMissionIds.length === 0 && questState.completedMissionIds.length === 0) {
      const firstMission = storyMissions[0];
      runQuestMutation((machine) => {
        machine.startMission(firstMission.id);
      });
    }
  }, [storyLoaded, questState.activeMissionIds.length, questState.completedMissionIds.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keys.current[event.key.toLowerCase()] = true;
      if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(event.key.toLowerCase())) {
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
    if (won || lives <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [won, lives]);

  useEffect(() => {
    if (timer > 0 || won || lives <= 0) {
      return;
    }

    setLives((current) => Math.max(0, current - 1));
    x.current = 70;
    y.current = BASELINE_Y;
    vx.current = 0;
    vy.current = 0;
    setTimer(250);
  }, [timer, won, lives]);

  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = clamp((time - lastTime) / 16.667, 0.65, 1.7);
      lastTime = time;

      if (won || lives <= 0) {
        setTick((value) => value + 1);
        raf = requestAnimationFrame(loop);
        return;
      }

      invuln.current = Math.max(0, invuln.current - dt);

      const moveLeft = keys.current.a || keys.current.arrowleft;
      const moveRight = keys.current.d || keys.current.arrowright;
      const crouch = keys.current.s || keys.current.arrowdown;
      const jumpPressed = keys.current.w || keys.current[" "] || keys.current.arrowup;

      if (moveLeft) {
        vx.current -= 0.8 * dt;
        facing.current = -1;
      }

      if (moveRight) {
        vx.current += 0.8 * dt;
        facing.current = 1;
      }

      if (!moveLeft && !moveRight) {
        vx.current *= 0.8;
      }

      vx.current = clamp(vx.current, -selectedHero.speed, selectedHero.speed);

      const standingOnPlatform = platforms.find(
        (platform) =>
          x.current + HERO_WIDTH > platform.x &&
          x.current < platform.x + platform.width &&
          Math.abs(y.current - platform.y) < 4 &&
          vy.current >= 0
      );

      const onGround = y.current >= BASELINE_Y || Boolean(standingOnPlatform);

      if (jumpPressed && onGround) {
        vy.current = -selectedHero.jumpPower;
      }

      vy.current += GRAVITY * dt;
      x.current += vx.current * dt;
      y.current += vy.current * dt;

      let landed = false;

      for (const platform of platforms) {
        const wasAbove = y.current - vy.current <= platform.y;
        const withinX = x.current + HERO_WIDTH > platform.x && x.current < platform.x + platform.width;
        const crossedTop = y.current >= platform.y && y.current <= platform.y + 15;

        if (withinX && wasAbove && crossedTop && vy.current >= 0) {
          y.current = platform.y;
          vy.current = 0;
          landed = true;
          break;
        }
      }

      if (y.current >= BASELINE_Y) {
        y.current = BASELINE_Y;
        vy.current = 0;
        landed = true;
      }

      x.current = clamp(x.current, 0, TRACK_LENGTH - HERO_WIDTH);

      setCoins((current) =>
        current.map((coin) => {
          if (coin.picked) {
            return coin;
          }

          const hit = Math.abs(coin.x - (x.current + HERO_WIDTH / 2)) < 22 && Math.abs(coin.y - y.current) < 42;
          if (!hit) {
            return coin;
          }

          setScore((value) => value + 100);
          return { ...coin, picked: true };
        })
      );

      for (const hazard of hazards) {
        const hazardY = hazard.lane === "ground" ? BASELINE_Y : BASELINE_Y - 112;
        const overlapX = x.current + HERO_WIDTH > hazard.x && x.current < hazard.x + hazard.width;
        const overlapY = Math.abs(y.current - hazardY) < 48;

        if (overlapX && overlapY && invuln.current <= 0) {
          invuln.current = 95;
          setLives((current) => Math.max(0, current - 1));
          setScore((current) => Math.max(0, current - 120));
          x.current = Math.max(60, x.current - 120);
          break;
        }
      }

      if (x.current >= LEVEL_END && collected >= 42) {
        setWon(true);
      }

      const cam = clamp(x.current - VIEWPORT_WIDTH / 2, 0, TRACK_LENGTH - VIEWPORT_WIDTH);
      setCameraX(cam);

      if (invuln.current > 0) {
        setAnim("hurt");
      } else if (!landed) {
        setAnim("jump");
      } else if (crouch) {
        setAnim("slide");
      } else if (Math.abs(vx.current) > 1.3) {
        setAnim("run");
      } else {
        setAnim("idle");
      }

      setTick((value) => value + 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [selectedHero, won, lives, collected]);

  const restart = () => {
    x.current = 70;
    y.current = BASELINE_Y;
    vx.current = 0;
    vy.current = 0;
    setCoins(seedCoins());
    setScore(0);
    setLives(3);
    setTimer(250);
    setWon(false);
    setAnim("idle");
    setCameraX(0);
  };

  const currentDialogueNode = dialogueEngine.getNode(dialogueNodeId);
  const dialogueChoices = currentDialogueNode ? dialogueEngine.getAvailableChoices(dialogueNodeId) : [];

  return (
    <main className="retro-shell">
      <header className="retro-title">
        <h1>STAR DASH RIDERS</h1>
        <p>
          Total rewrite: same side-scrolling platform system, brand new cast, and full animation states for run, jump,
          slide, and damage.
        </p>
      </header>

      <section className="hero-select" aria-label="Character select">
        {heroes.map((hero) => (
          <button
            key={hero.id}
            type="button"
            className={selectedHero.id === hero.id ? "active" : ""}
            onClick={() => {
              setSelectedHero(hero);
              restart();
            }}
          >
            <span>{hero.glyph}</span>
            <strong>{hero.name}</strong>
            <small>
              SPD {hero.speed.toFixed(1)} · JMP {hero.jumpPower.toFixed(1)}
            </small>
          </button>
        ))}
      </section>

      <section className="hud-strip">
        <span>Hero: {selectedHero.name}</span>
        <span>Score: {score}</span>
        <span>
          Coins: {collected}/{coins.length}
        </span>
        <span>Lives: {lives}</span>
        <span>Time: {timer}</span>
        <span>Progress: {Math.min(100, progress)}%</span>
      </section>

      <section className="game-frame" role="application" aria-label="Platformer game area">
        <div className="sky-layer" />
        <div className="mountains" />

        <div className="world" style={{ transform: `translateX(${-cameraX}px)` }}>
          {platforms.map((platform) => (
            <div key={platform.id} className="platform" style={{ left: platform.x, top: platform.y, width: platform.width }} />
          ))}

          {hazards.map((hazard) => (
            <div
              key={hazard.id}
              className={`hazard ${hazard.lane}`}
              style={{ left: hazard.x, top: hazard.lane === "ground" ? BASELINE_Y + 48 : BASELINE_Y - 64, width: hazard.width }}
            />
          ))}

          {coins.map((coin) =>
            coin.picked ? null : <div key={coin.id} className="coin" style={{ left: coin.x, top: coin.y }} aria-hidden="true" />
          )}

          <article
            className={`hero hero-${anim}`}
            style={{ left: x.current, top: y.current - HERO_HEIGHT, borderColor: selectedHero.color, transform: `scaleX(${facing.current})` }}
            aria-label={`${selectedHero.name} ${anim}`}
          >
            <span>{selectedHero.glyph}</span>
            <small>{anim.toUpperCase()}</small>
          </article>

          <div className="finish-flag" style={{ left: LEVEL_END + 70, top: BASELINE_Y - 130 }}>
            🏁
          </div>

          <div className="ground" />
        </div>
      </section>

      <section className="status-panel">
        <p>
          Controls: <strong>A / D</strong> move, <strong>W or Space</strong> jump, <strong>S</strong> slide. Collect at
          least 42 coins before the finish flag.
        </p>
        <div className="status-actions">
          <button type="button" onClick={restart}>
            Restart Run
          </button>
          {won ? <strong className="win-banner">You cleared Star Dash Ridge!</strong> : null}
          {!won && lives <= 0 ? <strong className="lose-banner">Out of lives — restart to try again.</strong> : null}
          <small>Engine Tick: {tick}</small>
        </div>
      </section>

      <section className="story-hub">
        <header>
          <h2>Story Operations</h2>
          <p>Quest state machine + branching dialogue are now integrated with versioned local save progress.</p>
        </header>

        <div className="story-tabs">
          {([
            ["codex", "Codex"],
            ["active", "Active Missions"],
            ["completed", "Completed Arcs"],
            ["affinity", "Character Affinity"]
          ] as const).map(([id, label]) => (
            <button key={id} type="button" className={storyTab === id ? "active" : ""} onClick={() => setStoryTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {storyTab === "codex" ? (
          <div className="story-panel-grid">
            {storyActs.map((act) => (
              <article key={act.id} className="story-card">
                <h3>{act.title}</h3>
                <p>{act.summary}</p>
              </article>
            ))}
          </div>
        ) : null}

        {storyTab === "active" ? (
          <div className="story-panel-grid">
            {activeMissions.length === 0 ? <p className="story-empty">No active missions yet.</p> : null}
            {activeMissions.map((mission) => (
              <article key={mission.id} className="story-card">
                <h3>{mission.title}</h3>
                <p>{mission.briefing}</p>
                <div className="story-actions-row">
                  <button type="button" onClick={() => runQuestMutation((machine) => machine.completeMission(mission.id))}>
                    Mark Complete
                  </button>
                  <button type="button" onClick={() => runQuestMutation((machine) => machine.failMission(mission.id))}>
                    Trigger Fail State
                  </button>
                </div>
                <small>Fail state: {mission.failState}</small>
              </article>
            ))}

            {availableMissions.map((mission) => (
              <article key={mission.id} className="story-card muted">
                <h3>{mission.title}</h3>
                <p>{mission.briefing}</p>
                <button type="button" onClick={() => runQuestMutation((machine) => machine.startMission(mission.id))}>
                  Start Mission
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {storyTab === "completed" ? (
          <div className="story-panel-grid">
            {completedArcs.map((arc) => (
              <article key={arc.id} className="story-card">
                <h3>{arc.title}</h3>
                <p>{arc.summary}</p>
              </article>
            ))}
            {completedMissions.map((mission) => (
              <article key={mission.id} className="story-card muted">
                <h3>{mission.title}</h3>
                <p>Completed mission record.</p>
              </article>
            ))}
            {failedMissions.map((mission) => (
              <article key={mission.id} className="story-card warning">
                <h3>{mission.title}</h3>
                <p>Failed: {mission.failState}</p>
              </article>
            ))}
            {unlockedEndings.map((ending) => (
              <article key={ending.id} className="story-card ending">
                <h3>{ending.title}</h3>
                <p>{ending.summary}</p>
              </article>
            ))}
          </div>
        ) : null}

        {storyTab === "affinity" ? (
          <div className="story-panel-grid affinity-grid">
            {Object.entries(questState.relationship).map(([name, value]) => (
              <article key={name} className="story-card">
                <h3>{name.toUpperCase()}</h3>
                <p>Affinity: {value}</p>
              </article>
            ))}
          </div>
        ) : null}

        <section className="dialogue-console">
          <h3>Dialogue Console</h3>
          {currentDialogueNode ? (
            <>
              <p>
                <strong>{currentDialogueNode.speaker}:</strong> {currentDialogueNode.text}
              </p>
              <div className="story-panel-grid">
                {dialogueChoices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className="choice-button"
                    onClick={() => {
                      runQuestMutation((machine) => {
                        const engine = new DialogueEngine(dialogueNodes, machine);
                        const nextNode = engine.applyChoice(dialogueNodeId, choice.id);
                        if (nextNode) {
                          setDialogueNodeId(nextNode);
                        }
                      });
                    }}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="story-empty">No dialogue node selected.</p>
          )}
        </section>

        <div className="story-actions-row">
          <button
            type="button"
            onClick={() => {
              clearStorySave();
              setQuestState(createDefaultQuestProgress());
            }}
          >
            Reset Story Save
          </button>
        </div>
      </section>
    </main>
  );
}
