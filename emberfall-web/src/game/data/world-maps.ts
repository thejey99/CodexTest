export type WorldMap = {
  id: string;
  name: string;
  biome: string;
  trackLength: number;
};

export const worldMaps: WorldMap[] = [
  { id: "star-dash-ridge", name: "Star Dash Ridge", biome: "Alpine Neon", trackLength: 5200 }
];
