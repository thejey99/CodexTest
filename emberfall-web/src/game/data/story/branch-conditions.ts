import type { BranchCondition } from "./types";

export const branchConditions: BranchCondition[] = [
  {
    id: "condition-wardens-peace",
    label: "Wardens' Peace",
    description: "Mira's trust and the rescue route keep Emberfall unified.",
    unlocksEndingIds: ["ending-dawn-accord"],
    requirements: [
      { type: "flag", key: "rescuedCivilians", equals: true },
      { type: "relationshipAtLeast", characterId: "mira", value: 2 }
    ]
  },
  {
    id: "condition-iron-regency",
    label: "Iron Regency",
    description: "Rhel's doctrine and armory stockpile centralize power.",
    unlocksEndingIds: ["ending-iron-regency"],
    requirements: [
      { type: "flag", key: "securedArmory", equals: true },
      { type: "flag", key: "backedRhel", equals: true }
    ]
  },
  {
    id: "condition-burden-oath",
    label: "Burden Oath",
    description: "Seradain's truth prevails and Kael takes the covenant willingly.",
    unlocksEndingIds: ["ending-burden-oath"],
    requirements: [{ type: "flag", key: "backedSeradain", equals: true }]
  }
];
