export type InteractableType = "console" | "shrine" | "door" | "loot";

export type Interactable = {
  id: string;
  type: InteractableType;
  label: string;
  x: number;
  y: number;
  isActive: boolean;
};
