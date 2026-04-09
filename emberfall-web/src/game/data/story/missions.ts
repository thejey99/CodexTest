import type { MissionDefinition } from "./types";

export const storyMissions: MissionDefinition[] = [
  {
    id: "mission-causeway-recon",
    chapterId: "chapter-sparks",
    title: "Recon the Causeway",
    briefing: "Stabilize memory echoes and recover militia dispatches.",
    failState: "Echo collapse leaves the militia route sealed."
  },
  {
    id: "mission-safehouse-breach",
    chapterId: "chapter-sparks",
    title: "Safehouse Breach",
    briefing: "Choose whether to rescue trapped civilians or preserve tactical supplies.",
    failState: "Too many survivors are lost during the breach.",
    prerequisites: [{ type: "missionComplete", missionId: "mission-causeway-recon" }],
    branches: [
      {
        id: "branch-rescue",
        label: "Rescue Route",
        description: "Prioritize civilian extraction with Mira.",
        excludes: ["branch-armory"],
        setFlags: { rescuedCivilians: true }
      },
      {
        id: "branch-armory",
        label: "Armory Route",
        description: "Secure rare gear with Bolt.",
        excludes: ["branch-rescue"],
        setFlags: { securedArmory: true }
      }
    ]
  },
  {
    id: "mission-hymn-fragment",
    chapterId: "chapter-choir",
    title: "Recover the Hymn Fragment",
    briefing: "Interrogate the Choir Warden's memory and decide what truth reaches the public.",
    failState: "The archive vault burns before testimony can be copied.",
    prerequisites: [{ type: "missionComplete", missionId: "mission-safehouse-breach" }]
  },
  {
    id: "mission-banner-trial",
    chapterId: "chapter-blackwood",
    title: "Black Banner Trial",
    briefing: "Back either Captain Rhel's hardline doctrine or Seradain's burdened truce.",
    failState: "The Black Banner mutiny overtakes the trenches.",
    prerequisites: [{ type: "missionComplete", missionId: "mission-hymn-fragment" }],
    branches: [
      {
        id: "branch-rhel",
        label: "Rhel's Verdict",
        description: "Suppress dissent and fortify the front.",
        excludes: ["branch-seradain"],
        setFlags: { backedRhel: true }
      },
      {
        id: "branch-seradain",
        label: "Seradain's Burden",
        description: "Reveal the covenant and force a truce.",
        excludes: ["branch-rhel"],
        setFlags: { backedSeradain: true }
      }
    ]
  },
  {
    id: "mission-final-oath",
    chapterId: "chapter-crown",
    title: "Final Oath",
    briefing: "Ascend the Rift Crown and determine who bears the abyss seal.",
    failState: "The abyss flood breaches Emberfall's final wards.",
    prerequisites: [{ type: "missionComplete", missionId: "mission-banner-trial" }]
  }
];
