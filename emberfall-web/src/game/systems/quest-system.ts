import type { MissionDefinition, QuestPrerequisite } from "../data/story/types";

export type QuestMissionStatus = "locked" | "available" | "active" | "completed" | "failed";

export type QuestProgressState = {
  activeMissionIds: string[];
  completedMissionIds: string[];
  failedMissionIds: string[];
  selectedBranches: Record<string, string>;
  flags: Record<string, boolean>;
  relationship: Record<string, number>;
};

const includes = (items: string[], value: string) => items.includes(value);

export class QuestStateMachine {
  private readonly missionMap: Map<string, MissionDefinition>;

  constructor(private readonly missions: MissionDefinition[], public readonly state: QuestProgressState) {
    this.missionMap = new Map(missions.map((mission) => [mission.id, mission]));
  }

  getMissionStatus(missionId: string): QuestMissionStatus {
    if (includes(this.state.completedMissionIds, missionId)) {
      return "completed";
    }

    if (includes(this.state.failedMissionIds, missionId)) {
      return "failed";
    }

    if (includes(this.state.activeMissionIds, missionId)) {
      return "active";
    }

    if (this.isMissionAvailable(missionId)) {
      return "available";
    }

    return "locked";
  }

  isMissionAvailable(missionId: string): boolean {
    const mission = this.missionMap.get(missionId);
    if (!mission || includes(this.state.completedMissionIds, missionId) || includes(this.state.failedMissionIds, missionId)) {
      return false;
    }

    const requirements = mission.prerequisites ?? [];
    return requirements.every((requirement) => this.meetsPrerequisite(requirement));
  }

  startMission(missionId: string): boolean {
    if (!this.isMissionAvailable(missionId) || includes(this.state.activeMissionIds, missionId)) {
      return false;
    }

    this.state.activeMissionIds = [...this.state.activeMissionIds, missionId];
    return true;
  }

  completeMission(missionId: string): boolean {
    if (!this.missionMap.has(missionId) || includes(this.state.completedMissionIds, missionId)) {
      return false;
    }

    this.state.activeMissionIds = this.state.activeMissionIds.filter((id) => id !== missionId);
    this.state.failedMissionIds = this.state.failedMissionIds.filter((id) => id !== missionId);
    this.state.completedMissionIds = [...this.state.completedMissionIds, missionId];
    return true;
  }

  failMission(missionId: string): boolean {
    if (!this.missionMap.has(missionId) || includes(this.state.failedMissionIds, missionId)) {
      return false;
    }

    this.state.activeMissionIds = this.state.activeMissionIds.filter((id) => id !== missionId);
    this.state.completedMissionIds = this.state.completedMissionIds.filter((id) => id !== missionId);
    this.state.failedMissionIds = [...this.state.failedMissionIds, missionId];
    return true;
  }

  chooseBranch(missionId: string, branchId: string): boolean {
    const mission = this.missionMap.get(missionId);
    if (!mission?.branches) {
      return false;
    }

    const branch = mission.branches.find((item) => item.id === branchId);
    if (!branch) {
      return false;
    }

    const existingBranch = this.state.selectedBranches[missionId];
    if (existingBranch && existingBranch !== branchId) {
      const existing = mission.branches.find((item) => item.id === existingBranch);
      const blocksNew = existing?.excludes?.includes(branchId);
      const blockedByNew = branch.excludes?.includes(existingBranch);
      if (blocksNew || blockedByNew) {
        return false;
      }
    }

    this.state.selectedBranches[missionId] = branchId;

    if (branch.setFlags) {
      this.state.flags = { ...this.state.flags, ...branch.setFlags };
    }

    return true;
  }

  setFlag(key: string, value: boolean): void {
    this.state.flags[key] = value;
  }

  adjustRelationship(characterId: string, delta: number): void {
    this.state.relationship[characterId] = (this.state.relationship[characterId] ?? 0) + delta;
  }

  meetsPrerequisite(requirement: QuestPrerequisite): boolean {
    if (requirement.type === "missionComplete") {
      return includes(this.state.completedMissionIds, requirement.missionId);
    }

    if (requirement.type === "missionFailed") {
      return includes(this.state.failedMissionIds, requirement.missionId);
    }

    if (requirement.type === "flag") {
      return (this.state.flags[requirement.key] ?? false) === requirement.equals;
    }

    return (this.state.relationship[requirement.characterId] ?? 0) >= requirement.value;
  }

  meetsAll(requirements: QuestPrerequisite[]): boolean {
    return requirements.every((requirement) => this.meetsPrerequisite(requirement));
  }
}

export const createDefaultQuestProgress = (): QuestProgressState => ({
  activeMissionIds: [],
  completedMissionIds: [],
  failedMissionIds: [],
  selectedBranches: {},
  flags: {},
  relationship: { mira: 0, bolt: 0, nova: 0 }
});
