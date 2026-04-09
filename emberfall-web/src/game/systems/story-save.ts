import type { QuestProgressState } from "./quest-system";
import { createDefaultQuestProgress } from "./quest-system";

const SAVE_KEY = "emberfall.story.save";
const CURRENT_VERSION = 2;

type StorySaveV1 = {
  version: 1;
  completedMissionIds: string[];
  flags: Record<string, boolean>;
};

export type StorySaveV2 = {
  version: 2;
  quest: QuestProgressState;
};

const isV1 = (value: unknown): value is StorySaveV1 => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const cast = value as Partial<StorySaveV1>;
  return cast.version === 1 && Array.isArray(cast.completedMissionIds);
};

const isQuestState = (value: unknown): value is QuestProgressState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const cast = value as Partial<QuestProgressState>;
  return (
    Array.isArray(cast.activeMissionIds) &&
    Array.isArray(cast.completedMissionIds) &&
    Array.isArray(cast.failedMissionIds) &&
    typeof cast.selectedBranches === "object" &&
    typeof cast.flags === "object" &&
    typeof cast.relationship === "object"
  );
};

const isV2 = (value: unknown): value is StorySaveV2 => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const cast = value as Partial<StorySaveV2>;
  return cast.version === 2 && isQuestState(cast.quest);
};

const migrateToLatest = (raw: unknown): StorySaveV2 => {
  if (isV2(raw)) {
    return raw;
  }

  if (isV1(raw)) {
    return {
      version: CURRENT_VERSION,
      quest: {
        ...createDefaultQuestProgress(),
        completedMissionIds: raw.completedMissionIds,
        flags: raw.flags
      }
    };
  }

  return {
    version: CURRENT_VERSION,
    quest: createDefaultQuestProgress()
  };
};

const parseSave = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const loadStorySave = (): StorySaveV2 => {
  if (typeof window === "undefined") {
    return { version: CURRENT_VERSION, quest: createDefaultQuestProgress() };
  }

  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return { version: CURRENT_VERSION, quest: createDefaultQuestProgress() };
  }

  const parsed = parseSave(raw);
  return migrateToLatest(parsed);
};

export const persistStorySave = (quest: QuestProgressState): void => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StorySaveV2 = {
    version: CURRENT_VERSION,
    quest
  };

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
};

export const clearStorySave = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SAVE_KEY);
};
