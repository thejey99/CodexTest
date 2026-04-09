export const resolveDamage = (baseDamage: number, mitigation: number) => Math.max(1, Math.round(baseDamage * (1 - mitigation)));
