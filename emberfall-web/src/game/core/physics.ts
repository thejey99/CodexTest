import { clamp } from "./timing";

export const GRAVITY = 0.82;

export const applyGravity = (vy: number, dt: number) => vy + GRAVITY * dt;

export const applyGroundFriction = (vx: number, grounded: boolean) => (grounded ? vx * 0.8 : vx);

export const clampVelocity = (vx: number, maxSpeed: number) => clamp(vx, -maxSpeed, maxSpeed);
