export type QuestProgress = {
  missionId: string;
  completedObjectives: string[];
};

export const isMissionComplete = (progress: QuestProgress, requiredObjectives: string[]) =>
  requiredObjectives.every((objective) => progress.completedObjectives.includes(objective));
