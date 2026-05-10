/**
 * sin x and cos x overlaid on the same axes over [-π, π]. The x-axis ticks
 * are labeled with π-multiples (-π, -π/2, π/2, π) instead of decimals.
 * Run: npx tsx examples/sin_cos_overlay.ts
 * Out: /tmp/sin_cos_overlay.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  NumberPlane,
  Tex,
  BLUE_E,
  RED,
  PI,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

// Tick values that match a π-multiple → render as Tex; everything else falls
// back to the default numeric label. Reused on both axes (no-op on the y-axis,
// whose ticks are integers and will all fall back).
const piLabel = (v: number): Tex | undefined => {
  const eps = 1e-9;
  if (Math.abs(v - PI) < eps) return new Tex("\\pi", { fontSize: 18 });
  if (Math.abs(v + PI) < eps) return new Tex("-\\pi", { fontSize: 18 });
  if (Math.abs(v - PI / 2) < eps) return new Tex("\\tfrac{\\pi}{2}", { fontSize: 18 });
  if (Math.abs(v + PI / 2) < eps) return new Tex("-\\tfrac{\\pi}{2}", { fontSize: 18 });
  return undefined;
};

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-PI, PI, PI / 2],
  yAxisRange: [-1.5, 1.5, 1],
  fillCanvas: true,
  axisConfig: { customLabel: piLabel },
});

plane.plot((x) => Math.sin(x), { color: BLUE_E, strokeWidth: 4 });
plane.plot((x) => Math.cos(x), { color: RED, strokeWidth: 4 });

const sinLabel = new Tex("y = \\sin x", { color: BLUE_E, fontSize: 22 })
  .moveTo(plane.coordsToPoint(-PI / 2, -1.25));
const cosLabel = new Tex("y = \\cos x", { color: RED, fontSize: 22 })
  .moveTo(plane.coordsToPoint(-0.3, 1.25));

canvas.add(plane, sinLabel, cosLabel);

writeFileSync("/tmp/sin_cos_overlay.svg", canvas.toSVG());
console.log("wrote /tmp/sin_cos_overlay.svg");
