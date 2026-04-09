import type { StoryEnding } from "./types";

export const storyEndings: StoryEnding[] = [
  {
    id: "ending-dawn-accord",
    title: "Dawn Accord",
    summary: "Kael rebuilds Emberfall with survivors and dismantles the Black Banner's secrecy.",
    conditionIds: ["condition-wardens-peace"]
  },
  {
    id: "ending-iron-regency",
    title: "Iron Regency",
    summary: "The city survives under strict military law and memory censorship.",
    conditionIds: ["condition-iron-regency"]
  },
  {
    id: "ending-burden-oath",
    title: "Burden Oath",
    summary: "Kael accepts the title of Dark Lord to hold the abyss seal in solitude.",
    conditionIds: ["condition-burden-oath"]
  }
];
