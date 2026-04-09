export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const toDelta = (time: number, lastTime: number) => clamp((time - lastTime) / 16.667, 0.65, 1.7);
