import type { Enemy } from "../entities/enemies";

export const chooseEnemyBehavior = (enemy: Enemy, distanceToPlayer: number) => {
  if (distanceToPlayer < 120) return `${enemy.archetype}:engage`;
  if (distanceToPlayer < 260) return `${enemy.archetype}:stalk`;
  return `${enemy.archetype}:patrol`;
};
