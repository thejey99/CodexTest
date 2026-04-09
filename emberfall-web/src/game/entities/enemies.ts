export type EnemyTier = "common" | "elite" | "champion";

export type Enemy = {
  id: string;
  name: string;
  tier: EnemyTier;
  archetype: string;
  health: number;
};
