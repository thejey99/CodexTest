"use client";

import { useMemo, useState } from "react";
import { levels, survivorFragment, weapons } from "./game-data";

const maxPlayerHearts = 6;

export default function EmberfallGame() {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(weapons[0].id);
  const [unlockedFragments, setUnlockedFragments] = useState([survivorFragment]);
  const [clearedLevelIds, setClearedLevelIds] = useState<number[]>([]);
  const [enemyHp, setEnemyHp] = useState(12);
  const [playerHearts, setPlayerHearts] = useState(maxPlayerHearts);
  const [combatLog, setCombatLog] = useState("A memory shade stalks the grass. Strike first.");

  const selectedWeaponData = useMemo(
    () => weapons.find((weapon) => weapon.id === selectedWeapon) ?? weapons[0],
    [selectedWeapon]
  );

  const currentLevel = levels[playerIndex];
  const hasNext = playerIndex < levels.length - 1;
  const hasPrev = playerIndex > 0;
  const levelIsCleared = clearedLevelIds.includes(currentLevel.id);

  const rollDamage = () => {
    const baseDamage =
      selectedWeapon === "greatsword" ? 4 : selectedWeapon === "twinBlades" ? 3 : selectedWeapon === "halberd" ? 3 : 2;

    return baseDamage + Math.floor(Math.random() * 3);
  };

  const moveToLevel = (nextIndex: number) => {
    setPlayerIndex(nextIndex);
    setEnemyHp(12);
    setPlayerHearts(maxPlayerHearts);
    setCombatLog("A new echo forms ahead. Sprint, jump, and strike through the lane.");
  };

  const moveRight = () => {
    if (hasNext) {
      moveToLevel(playerIndex + 1);
    }
  };

  const moveLeft = () => {
    if (hasPrev) {
      moveToLevel(playerIndex - 1);
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

  const slashEnemy = () => {
    if (levelIsCleared) {
      setCombatLog("Zone already pacified. Run to the next checkpoint.");
      return;
    }

    if (playerHearts <= 0) {
      setCombatLog("Kael is down. Drink an ember tonic to continue.");
      return;
    }

    const playerDamage = rollDamage();
    const enemyDamage = 1 + Math.floor(Math.random() * 3);

    const nextEnemyHp = Math.max(enemyHp - playerDamage, 0);

    if (nextEnemyHp <= 0) {
      setEnemyHp(0);
      setCombatLog(`Blade combo hits for ${playerDamage}. Echo shattered! Recover the lore shard.`);
      clearCurrentLevel();
      return;
    }

    const nextPlayerHearts = Math.max(playerHearts - enemyDamage, 0);
    setEnemyHp(nextEnemyHp);
    setPlayerHearts(nextPlayerHearts);

    if (nextPlayerHearts <= 0) {
      setCombatLog(`You dealt ${playerDamage}, but took ${enemyDamage}. Kael falls to the echo.`);
      return;
    }

    setCombatLog(`You deal ${playerDamage} and take ${enemyDamage}. Keep momentum and stay aggressive.`);
  };

  const healPlayer = () => {
    if (playerHearts === maxPlayerHearts) {
      setCombatLog("Hearts already full.");
      return;
    }

    if (levelIsCleared) {
      setCombatLog("Campfire restores your hearts between battles.");
    } else {
      setCombatLog("Quick potion sip! One heart restored.");
    }

    setPlayerHearts((prev) => Math.min(prev + 1, maxPlayerHearts));
  };

  const restartCampaign = () => {
    setPlayerIndex(0);
    setClearedLevelIds([]);
    setUnlockedFragments([survivorFragment]);
    setEnemyHp(12);
    setPlayerHearts(maxPlayerHearts);
    setCombatLog("The oath restarts at Ashen Causeway.");
  };

  return (
    <main className="shell">
      <h1>EMBERFALL: ASH OF THE OATH</h1>

      <section className="card">
        <h2>2D Side-Scroller Route</h2>
        <p className="muted">Linear left-to-right progression with lane-based melee and heart-based health.</p>
        <div className="overworld" role="region" aria-label="2D side-scrolling route">
          {levels.map((level, index) => {
            const isCurrent = index === playerIndex;
            const isCleared = clearedLevelIds.includes(level.id);

            return (
              <article key={level.id} className={`lane-node ${isCurrent ? "current" : ""}`}>
                <p className="node-index">Area {level.id}</p>
                <h3>{level.title}</h3>
                <p>{isCleared ? "Echo Cleared" : "Echo Active"}</p>
              </article>
            );
          })}
        </div>
        <div className="actions movement">
          <button type="button" onClick={moveLeft} disabled={!hasPrev} aria-label="Run to previous checkpoint">
            ◀ Run Left
          </button>
          <button type="button" onClick={moveRight} disabled={!hasNext} aria-label="Run to next checkpoint">
            Run Right ▶
          </button>
        </div>
      </section>

      <section className="card combat-card">
        <h2>Live Combat Arena</h2>
        <h3>{currentLevel.title}</h3>
        <p>{currentLevel.objective}</p>
        <p className="muted">Atmosphere: {currentLevel.atmosphere}</p>
        <div className="hud">
          <p>Kael Hearts: {"❤️".repeat(playerHearts)}{"🖤".repeat(maxPlayerHearts - playerHearts)}</p>
          <p>Echo Vitality: {enemyHp}/12</p>
        </div>
        <div className="combat-actions">
          <button type="button" className="primary" onClick={slashEnemy}>
            ⚔ Slash
          </button>
          <button type="button" onClick={healPlayer}>
            🧪 Potion
          </button>
        </div>
        <p className="combat-log">{combatLog}</p>
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
        <button type="button" onClick={restartCampaign}>
          Restart Campaign
        </button>
      </section>
    </main>
  );
}
