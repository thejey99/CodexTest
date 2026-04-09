import type { DialogueChoice, DialogueNode } from "../data/story/types";
import { QuestStateMachine } from "./quest-system";

export class DialogueEngine {
  private readonly nodeMap: Map<string, DialogueNode>;

  constructor(private readonly nodes: DialogueNode[], private readonly quests: QuestStateMachine) {
    this.nodeMap = new Map(nodes.map((node) => [node.id, node]));
  }

  getNode(nodeId: string): DialogueNode | undefined {
    return this.nodeMap.get(nodeId);
  }

  getAvailableChoices(nodeId: string): DialogueChoice[] {
    const node = this.nodeMap.get(nodeId);
    if (!node) {
      return [];
    }

    return node.choices.filter((choice) => {
      if (!choice.requires) {
        return true;
      }

      return choice.requires.every((requirement) => {
        if (requirement.type === "missionComplete") {
          return this.quests.state.completedMissionIds.includes(requirement.missionId);
        }

        if (requirement.type === "missionFailed") {
          return this.quests.state.failedMissionIds.includes(requirement.missionId);
        }

        if (requirement.type === "flag") {
          return (this.quests.state.flags[requirement.key] ?? false) === requirement.equals;
        }

        return (this.quests.state.relationship[requirement.characterId] ?? 0) >= requirement.value;
      });
    });
  }

  applyChoice(nodeId: string, choiceId: string): string | undefined {
    const choice = this.getAvailableChoices(nodeId).find((item) => item.id === choiceId);
    if (!choice) {
      return undefined;
    }

    if (choice.consequence?.setFlags) {
      for (const [key, value] of Object.entries(choice.consequence.setFlags)) {
        this.quests.setFlag(key, value);
      }
    }

    if (choice.consequence?.relationshipDelta) {
      for (const [character, delta] of Object.entries(choice.consequence.relationshipDelta)) {
        this.quests.adjustRelationship(character, delta);
      }
    }

    if (choice.consequence?.branchSelection) {
      this.quests.chooseBranch(choice.consequence.branchSelection.missionId, choice.consequence.branchSelection.branchId);
    }

    if (choice.consequence?.completeMissionId) {
      this.quests.completeMission(choice.consequence.completeMissionId);
    }

    if (choice.consequence?.failMissionId) {
      this.quests.failMission(choice.consequence.failMissionId);
    }

    return choice.nextNodeId;
  }
}
