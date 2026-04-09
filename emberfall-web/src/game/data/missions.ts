export type Mission = {
  id: string;
  title: string;
  objective: string;
};

export const missions: Mission[] = [
  {
    id: "star-dash-001",
    title: "Ridge Run",
    objective: "Reach the finish flag after collecting at least 42 coins."
  }
];
