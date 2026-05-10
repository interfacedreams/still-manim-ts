/**
 * Quadratic formula above; the discriminant b² − 4ac called out below as its
 * own Tex with a Brace + "discriminant" label. Pure Tex + annotation — no axes.
 * Run: npx tsx examples/quadratic_formula_with_brace.ts
 * Out: /tmp/quadratic_formula_with_brace.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  Tex,
  Brace,
  Group,
  RED,
  DOWN,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

const formula = new Tex("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", {
  display: true,
  fontSize: 40,
});

// Discriminant called out as a standalone definition below the formula.
const discriminant = new Tex("b^2 - 4ac", { fontSize: 32, color: RED })
  .nextTo(formula, DOWN, undefined, 0.8);

const labeledBrace = Brace.withTexLabel(
  discriminant,
  "\\text{discriminant}",
  DOWN,
  { color: RED, fontSize: 24 },
);

const group = new Group();
group.add(formula, discriminant, labeledBrace);
group.moveToOrigin();

canvas.add(group);

writeFileSync("/tmp/quadratic_formula_with_brace.svg", canvas.toSVG());
console.log("wrote /tmp/quadratic_formula_with_brace.svg");
