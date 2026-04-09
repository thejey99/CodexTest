"use client";

import { useMemo, useState } from "react";
import { levels, survivorFragment, weapons } from "./game-data";

export default function EmberfallGame() {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(weapons[0].id);
  const [unlockedFragments, setUnlockedFragments] = useState([survivorFragment]);
  const [clearedLevelIds, setClearedLevelIds] = useState<number[]>([]);

  const selectedWeaponData = useMemo(
    () => weapons.find((weapon) => weapon.id === selectedWeapon) ?? weapons[0],
    [selectedWeapon]
  );

  const currentLevel = levels[playerIndex];
  const hasNext = playerIndex < levels.length - 1;
  const hasPrev = playerIndex > 0;
  const levelIsCleared = clearedLevelIds.includes(currentLevel.id);

  const moveRight = () => {
    if (hasNext) {
      setPlayerIndex((prev) => prev + 1);
    }
  };

  const moveLeft = () => {
    if (hasPrev) {
      setPlayerIndex((prev) => prev - 1);
    }
  };

  const clearCurrentLevel = () => {
    if (levelIsCleared) {
      return;
    }

    setClearedLevelIds((prev) => [...prev, currentLevel.id]);
    setUnlockedFragments((prev) => [
      ...prev,
      {
        id: `${currentLevel.id}-${Date.now()}`,
        title: currentLevel.title,
        body: currentLevel.revelation
      }
    ]);
  };

  const restartCampaign = () => {
    setPlayerIndex(0);
    setClearedLevelIds([]);
    setUnlockedFragments([survivorFragment]);
  };

  return (
    <main className="shell">
      <h1>EMBERFALL: ASH OF THE OATH</h1>

      <section className="card">
        <h2>Scroller Route</h2>
        <p className="muted">
          Move like a side scroller: travel left/right through zones, clear each encounter, and recover the lore.
        </p>
        <div className="scroller" role="region" aria-label="Side-scroller route">
          {levels.map((level, index) => {
            const isCurrent = index === playerIndex;
            const isCleared = clearedLevelIds.includes(level.id);

            return (
              <article key={level.id} className={`lane-node ${isCurrent ? "current" : ""}`}>
                <p className="node-index">Zone {level.id}</p>
                <h3>{level.title}</h3>
                <p>{isCleared ? "Cleared" : "Uncleared"}</p>
              </article>
            );
          })}
        </div>
        <div className="actions movement">
          <button type="button" onClick={moveLeft} disabled={!hasPrev}>
            ◀ Move Left
          </button>
          <button type="button" onClick={moveRight} disabled={!hasNext}>
            Move Right ▶
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Current Encounter</h2>
        <h3>{currentLevel.title}</h3>
        <p>{currentLevel.objective}</p>
        <p className="muted">Atmosphere: {currentLevel.atmosphere}</p>
        <p className="accent">Boss Echo: {currentLevel.bossEcho}</p>
      </section>

      <section className="card">
        <h2>Weapon Style</h2>
        <div className="segmented" role="radiogroup" aria-label="Weapon style selector">
          {weapons.map((weapon) => (
            <button
              key={weapon.id}
              type="button"
              className={weapon.id === selectedWeapon ? "active" : ""}
              onClick={() => setSelectedWeapon(weapon.id)}
            >
              {weapon.name}
            </button>
          ))}
        </div>
        <p>{selectedWeaponData.combatIdentity}</p>
      </section>

      <section className="card">
        <h2>Recovered Lore</h2>
        <div className="lore-list">
          {[...unlockedFragments].reverse().map((fragment) => (
            <article key={fragment.id}>
              <h3>{fragment.title}</h3>
              <p>{fragment.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="actions">
        <button type="button" className="primary" onClick={clearCurrentLevel} disabled={levelIsCleared}>
          {levelIsCleared ? "Lore Recovered" : "Clear Encounter"}
        </button>
        <button type="button" onClick={restartCampaign}>
          Restart
        </button>
      </section>
    </main>
  );
}
