"use client";

import { useEffect, useSyncExternalStore } from "react";
import { gameEngine } from "../game/engine";

const { constants, platforms, hazards, heroes, strings } = gameEngine.getWorld();

export default function EmberfallGame() {
  const state = useSyncExternalStore(gameEngine.subscribe, gameEngine.getState, gameEngine.getState);

  useEffect(() => {
    const stop = gameEngine.start();
    return () => stop();
  }, []);

  return (
    <main className="retro-shell">
      <header className="retro-title">
        <h1>{strings.gameTitle}</h1>
        <p>{strings.gameSubtitle}</p>
      </header>

      <section className="hero-select" aria-label="Character select">
        {heroes.map((hero) => (
          <button
            key={hero.id}
            type="button"
            className={state.selectedHero.id === hero.id ? "active" : ""}
            onClick={() => gameEngine.selectHero(hero)}
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
        <span>Hero: {state.selectedHero.name}</span>
        <span>Score: {state.score}</span>
        <span>
          Coins: {state.collected}/{state.coins.length}
        </span>
        <span>Lives: {state.lives}</span>
        <span>Time: {state.timer}</span>
        <span>Progress: {state.progress}%</span>
      </section>

      <section className="game-frame" role="application" aria-label="Platformer game area">
        <div className="sky-layer" />
        <div className="mountains" />

        <div className="world" style={{ transform: `translateX(${-state.cameraX}px)` }}>
          {platforms.map((platform) => (
            <div key={platform.id} className="platform" style={{ left: platform.x, top: platform.y, width: platform.width }} />
          ))}

          {hazards.map((hazard) => (
            <div
              key={hazard.id}
              className={`hazard ${hazard.lane}`}
              style={{ left: hazard.x, top: hazard.lane === "ground" ? constants.baselineY + 48 : constants.baselineY - 64, width: hazard.width }}
            />
          ))}

          {state.coins.map((coin) =>
            coin.picked ? null : <div key={coin.id} className="coin" style={{ left: coin.x, top: coin.y }} aria-hidden="true" />
          )}

          <article
            className={`hero hero-${state.animation}`}
            style={{
              left: state.x,
              top: state.y - constants.heroHeight,
              borderColor: state.selectedHero.color,
              transform: `scaleX(${state.facing})`
            }}
            aria-label={`${state.selectedHero.name} ${state.animation}`}
          >
            <span>{state.selectedHero.glyph}</span>
            <small>{state.animation.toUpperCase()}</small>
          </article>

          <div className="finish-flag" style={{ left: constants.levelEnd + 70, top: constants.baselineY - 130 }}>
            🏁
          </div>

          <div className="ground" />
        </div>
      </section>

      <section className="status-panel">
        <p>
          {strings.controls}
        </p>
        <div className="status-actions">
          <button type="button" onClick={() => gameEngine.restart()}>
            Restart Run
          </button>
          {state.won ? <strong className="win-banner">You cleared Star Dash Ridge!</strong> : null}
          {!state.won && state.lives <= 0 ? <strong className="lose-banner">Out of lives — restart to try again.</strong> : null}
          <small>Engine Tick: {state.tick}</small>
        </div>
      </section>
    </main>
  );
}
