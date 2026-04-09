export type GameLevel = {
  id: number;
  title: string;
  objective: string;
  atmosphere: string;
  revelation: string;
  bossEcho: string;
};

export type WeaponStyle = {
  id: "greatsword" | "twinBlades" | "halberd" | "hexbow";
  name: string;
  combatIdentity: string;
};

export type LoreFragment = {
  id: string;
  title: string;
  body: string;
};

export const levels: GameLevel[] = [
  {
    id: 1,
    title: "Ashen Causeway",
    objective: "Reach the Emberfall gate and survive memory ambushes.",
    atmosphere: "Rain, burning siege engines, and broken prayer bells.",
    revelation:
      "Kael finds a child he once failed to protect. In the memory, Seradain orders safe passage for civilians.",
    bossEcho: "The Broken Standard — manifestation of Kael's survivor's guilt."
  },
  {
    id: 2,
    title: "Cathedral of Cinders",
    objective: "Defeat the Choir Warden and recover the sealed hymn page.",
    atmosphere: "Ruined stained glass, torch smoke, and cracked hymns.",
    revelation:
      "Records reveal Seradain diverted his own guard to hold back abyss-born creatures while nobles fled.",
    bossEcho: "Choir Warden Iskra — faith twisted into fanaticism."
  },
  {
    id: 3,
    title: "Gravewood Bastion",
    objective: "Cross the blackwood trenches and locate Captain Rhel's journal.",
    atmosphere: "Bone-white trees and whispers that mimic old comrades.",
    revelation:
      "Kael learns the Black Banner was ordered to provoke Seradain, forcing him into the forbidden covenant.",
    bossEcho: "Captain Rhel, Hollowed — Kael's mentor consumed by ambition."
  },
  {
    id: 4,
    title: "The Rift Crown",
    objective: "Climb the shattered spire and face the Dark Lord.",
    atmosphere: "Starless sky, gravity fractures, and abyssal thunder.",
    revelation:
      "Seradain confesses the title 'Dark Lord' was a mask he accepted to keep the abyss sealed. He asks Kael to choose: kill him, or inherit the burden.",
    bossEcho: "Lord Seradain Voss — a guardian mistaken for a tyrant."
  }
];

export const weapons: WeaponStyle[] = [
  {
    id: "greatsword",
    name: "Ruin Edge",
    combatIdentity: "High stagger and armor break. Slow recovery, brutal finishers."
  },
  {
    id: "twinBlades",
    name: "Mournfangs",
    combatIdentity: "Fast chain attacks with bleed pressure and evasive dodges."
  },
  {
    id: "halberd",
    name: "Dawnspike",
    combatIdentity: "Mid-range control, parry routes, and tactical crowd management."
  },
  {
    id: "hexbow",
    name: "Nightglass Bow",
    combatIdentity: "Ranged precision, curse marks, and setup-driven burst windows."
  }
];

export const survivorFragment: LoreFragment = {
  id: "survivor",
  title: "The Survivor",
  body: "Kael remembers the smell of iron and ash. He survived Emberfall, but never escaped it."
};
