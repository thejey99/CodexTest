import type { StoryChapter } from "./types";

export const storyChapters: StoryChapter[] = [
  {
    id: "chapter-sparks",
    actId: "act-ember-echo",
    title: "Chapter 1 · Sparks in Rain",
    summary: "The first memory rift opens along the Ashen Causeway.",
    missionIds: ["mission-causeway-recon", "mission-safehouse-breach"]
  },
  {
    id: "chapter-choir",
    actId: "act-ember-echo",
    title: "Chapter 2 · Choir in Ash",
    summary: "The cathedral archives reveal Seradain's hidden motives.",
    missionIds: ["mission-hymn-fragment"]
  },
  {
    id: "chapter-blackwood",
    actId: "act-rift-oath",
    title: "Chapter 3 · Blackwood Wounds",
    summary: "A split in the party forces a branch in strategy.",
    missionIds: ["mission-banner-trial"]
  },
  {
    id: "chapter-crown",
    actId: "act-rift-oath",
    title: "Chapter 4 · Crown of the Rift",
    summary: "The final ascent decides Emberfall's legacy.",
    missionIds: ["mission-final-oath"]
  }
];
