/**
 * FOIL method for multiplying two binomials, demonstrated on (x + 2)(x + 3).
 * Each FOIL step (First, Outer, Inner, Last) is color-coded; the four products
 * sum to the expanded quadratic.
 * Run: npx tsx examples/quadratic_foil_method.ts
 * Out: /tmp/quadratic_foil_method.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  Tex,
  Text,
  Group,
  RED,
  BLUE_E,
  GREEN_D,
  ORANGE,
  DOWN,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

const product = new Tex("(x + 2)(x + 3)", { fontSize: 40 });

const caption = new Text(
  "FOIL: multiply First, Outer, Inner, Last terms",
  { fontSize: 18 },
).nextTo(product, DOWN, undefined, 0.5);

// Each FOIL step: which terms × which, color-coded.
const stepF = new Tex("\\text{F: } x \\cdot x = x^2", { fontSize: 26, color: RED })
  .nextTo(caption, DOWN, undefined, 0.5);
const stepO = new Tex("\\text{O: } x \\cdot 3 = 3x", { fontSize: 26, color: BLUE_E })
  .nextTo(stepF, DOWN, undefined, 0.2);
const stepI = new Tex("\\text{I: } 2 \\cdot x = 2x", { fontSize: 26, color: GREEN_D })
  .nextTo(stepO, DOWN, undefined, 0.2);
const stepL = new Tex("\\text{L: } 2 \\cdot 3 = 6", { fontSize: 26, color: ORANGE })
  .nextTo(stepI, DOWN, undefined, 0.2);

// Sum and combine.
const sum = new Tex("x^2 + 3x + 2x + 6", { fontSize: 30 })
  .nextTo(stepL, DOWN, undefined, 0.5);
const result = new Tex("= x^2 + 5x + 6", { fontSize: 32 })
  .nextTo(sum, DOWN, undefined, 0.25);

const group = new Group();
group.add(product, caption, stepF, stepO, stepI, stepL, sum, result);
group.moveToOrigin();

canvas.add(group);

writeFileSync("/tmp/quadratic_foil_method.svg", canvas.toSVG());
console.log("wrote /tmp/quadratic_foil_method.svg");
