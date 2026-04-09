export const shouldTriggerDialogue = (distanceToNpc: number, interactionPressed: boolean) =>
  interactionPressed && distanceToNpc < 64;
