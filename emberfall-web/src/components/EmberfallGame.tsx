"use client";

import { useMemo, useState } from "react";
import { levels, survivorFragment, weapons } from "./game-data";

export default function EmberfallGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(weapons[0].id);
  const [unlockedFragments, setUnlockedFragments] = useState([survivorFragment]);

  const currentLevel = levels[currentLevelIndex];
  const canAdvance = currentLevelIndex < levels.length - 1;

  const selectedWeaponData = useMemo(
    () => weapons.find((weapon) => weapon.id === selectedWeapon) ?? weapons[0],
    [selectedWeapon]
  );

  const clearCurrentLevel = () => {
    setUnlockedFragments((prev) => [
      ...prev,
      {
        id: `${currentLevel.id}-${Date.now()}`,
        title: currentLevel.title,
        body: currentLevel.revelation
      }
    ]);

    if (canAdvance) {
      setCurrentLevelIndex((prev) => prev + 1);
    }
  };

  const restartCampaign = () => {
    setCurrentLevelIndex(0);
    setUnlockedFragments([survivorFragment]);
  };

  return (
    <main className="shell">
      <h1>EMBERFALL: ASH OF THE OATH</h1>

      <section className="card">
        <h2>Current Level</h2>
        <h3>{currentLevel.title}</h3>
        <p>{currentLevel.objective}</p>
        <p className="muted">Atmosphere: {currentLevel.atmosphere}</p>
        <p className="accent">Boss: {currentLevel.bossEcho}</p>
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
        <button type="button" className="primary" onClick={clearCurrentLevel}>
          Clear Level
        </button>
        <button type="button" onClick={restartCampaign}>
          Restart
        </button>
      </section>
    </main>
  );
}
