/**
 * Function table for y = x², x ∈ {-2, -1, 0, 1, 2}. Tex header for "y = x²";
 * the row showing y at x=0 is highlighted to emphasize the minimum.
 * Run: npx tsx examples/function_table.ts
 * Out: /tmp/function_table.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  Table,
  Tex,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

// Tex content for the header cells so they render as math, not plain text.
const xHeader = new Tex("x", { fontSize: 28 });
const yHeader = new Tex("y = x^2", { fontSize: 28 });

const table = new Table([
  [xHeader, -2, -1, 0, 1, 2],
  [yHeader, 4, 1, 0, 1, 4],
]);

// Highlight the (x, y) = (0, 0) column to mark the parabola's vertex/minimum.
table.highlight([
  [0, 3],
  [1, 3],
]);

canvas.add(table);

writeFileSync("/tmp/function_table.svg", canvas.toSVG());
console.log("wrote /tmp/function_table.svg");
