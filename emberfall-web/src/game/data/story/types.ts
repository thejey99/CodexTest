export type StoryAct = {
  id: string;
  title: string;
  summary: string;
  chapterIds: string[];
};

export type StoryChapter = {
  id: string;
  actId: string;
  title: string;
  summary: string;
  missionIds: string[];
};

export type QuestPrerequisite =
  | { type: "missionComplete"; missionId: string }
  | { type: "missionFailed"; missionId: string }
  | { type: "flag"; key: string; equals: boolean }
  | { type: "relationshipAtLeast"; characterId: string; value: number };

export type MissionBranch = {
  id: string;
  label: string;
  description: string;
  excludes?: string[];
  setFlags?: Record<string, boolean>;
};

export type MissionDefinition = {
  id: string;
  chapterId: string;
  title: string;
  briefing: string;
  failState: string;
  prerequisites?: QuestPrerequisite[];
  branches?: MissionBranch[];
};

export type DialogueChoiceConsequence = {
  setFlags?: Record<string, boolean>;
  relationshipDelta?: Record<string, number>;
  completeMissionId?: string;
  failMissionId?: string;
  branchSelection?: {
    missionId: string;
    branchId: string;
  };
};

export type DialogueChoice = {
  id: string;
  text: string;
  requires?: QuestPrerequisite[];
  nextNodeId?: string;
  consequence?: DialogueChoiceConsequence;
};

export type DialogueNode = {
  id: string;
  speaker: string;
  text: string;
  missionId?: string;
  choices: DialogueChoice[];
};

export type BranchCondition = {
  id: string;
  label: string;
  description: string;
  unlocksEndingIds: string[];
  requirements: QuestPrerequisite[];
};

export type StoryEnding = {
  id: string;
  title: string;
  summary: string;
  conditionIds: string[];
};
