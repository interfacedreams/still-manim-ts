/**
 * Unit circle with the angle π/3 highlighted: red radial line + dot, plus the
 * (cosθ, sinθ) coordinate label at that point.
 * Run: npx tsx examples/unit_circle_with_angle.ts
 * Out: /tmp/unit_circle_with_angle.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  UnitCircle,
  Line,
  Tex,
  RED,
  PI,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

// Default UnitCircle: 16 standard angles, axes, center dot.
const uc = new UnitCircle();

// Pick out the π/3 marker and recolor its dot.
const focus = uc.markers.find((m) => Math.abs(m.angle - PI / 3) < 1e-9)!;
focus.dot.setColor(RED);

// Radial line from origin out to the point on the circle.
const radial = new Line({
  start: [0, 0, 0],
  end: focus.dot.center,
  color: RED,
  strokeWidth: 4,
});

// (cos π/3, sin π/3) = (1/2, √3/2). Place it just outside the circle along the radial direction.
const r = uc.radius;
const labelBuff = 1.0;
const coordLabel = new Tex(
  "\\left(\\tfrac{1}{2},\\, \\tfrac{\\sqrt{3}}{2}\\right)",
  { color: RED, fontSize: 22 },
).moveTo([
  Math.cos(PI / 3) * (r + labelBuff),
  Math.sin(PI / 3) * (r + labelBuff),
  0,
]);

canvas.add(uc, radial, coordLabel);

writeFileSync("/tmp/unit_circle_with_angle.svg", canvas.toSVG());
console.log("wrote /tmp/unit_circle_with_angle.svg");
