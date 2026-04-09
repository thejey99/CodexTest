import type { DialogueNode } from "./types";

export const dialogueNodes: DialogueNode[] = [
  {
    id: "node-briefing-causeway",
    speaker: "Mira",
    missionId: "mission-causeway-recon",
    text: "If we lock this memory in place, survivors can finally pass the causeway.",
    choices: [
      {
        id: "choice-focus-survivors",
        text: "We'll protect survivors first.",
        nextNodeId: "node-after-causeway",
        consequence: {
          relationshipDelta: { mira: 1 },
          setFlags: { promisedProtection: true }
        }
      },
      {
        id: "choice-focus-threat",
        text: "We neutralize threats before moving anyone.",
        nextNodeId: "node-after-causeway",
        consequence: {
          relationshipDelta: { bolt: 1 }
        }
      }
    ]
  },
  {
    id: "node-after-causeway",
    speaker: "Kael",
    text: "Either way, we move before the echo folds in on itself.",
    choices: [
      {
        id: "choice-complete-recon",
        text: "Signal mission complete.",
        consequence: { completeMissionId: "mission-causeway-recon" }
      }
    ]
  },
  {
    id: "node-safehouse-branch",
    speaker: "Bolt",
    missionId: "mission-safehouse-breach",
    text: "Rescue route or armory route. We only have time for one.",
    choices: [
      {
        id: "choice-branch-rescue",
        text: "Take the rescue route.",
        consequence: {
          branchSelection: { missionId: "mission-safehouse-breach", branchId: "branch-rescue" },
          relationshipDelta: { mira: 1 }
        }
      },
      {
        id: "choice-branch-armory",
        text: "Take the armory route.",
        consequence: {
          branchSelection: { missionId: "mission-safehouse-breach", branchId: "branch-armory" },
          relationshipDelta: { bolt: 1 }
        }
      },
      {
        id: "choice-safehouse-fail",
        text: "Delay until the safehouse collapses.",
        consequence: { failMissionId: "mission-safehouse-breach" }
      }
    ]
  }
];
