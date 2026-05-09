/**
 * 3-4-5 right triangle with the Pythagorean equation a² + b² = c².
 * Run: npx tsx examples/right_triangle_pythagorean.ts
 * Out: /tmp/right_triangle_pythagorean.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  RightTriangle,
  Tex,
  BLUE_E,
  DOWN,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

// Sides labeled with the actual numbers; right-angle marker on by default.
const tri = new RightTriangle(3, 4, {
  legLabel: "3",
  altLegLabel: "4",
  hypLabel: "5",
  color: BLUE_E,
  fontSize: 32,
});

// Pythagorean equation below the triangle.
const eq = new Tex("a^2 + b^2 = c^2", { color: BLUE_E, fontSize: 28 })
  .nextTo(tri, DOWN, undefined, 0.5);

canvas.add(tri, eq);

writeFileSync("/tmp/right_triangle_pythagorean.svg", canvas.toSVG());
console.log("wrote /tmp/right_triangle_pythagorean.svg");
