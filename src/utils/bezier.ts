import type { Vec3 } from "./vec.js";

export const interpolate = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Mirrors numpy.linspace(0, 1, n) — n samples from 0 to 1 inclusive.
export const linspace01 = (n: number): number[] => {
  if (n === 1) return [0];
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = i / (n - 1);
  return out;
};
