/**
 * Linear graph y = ½x + 1 with a rise/run slope triangle and a Tex equation label.
 * Run: npx tsx examples/linear_graph_with_slope_triangle.ts
 * Out: /tmp/linear_graph_with_slope_triangle.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  NumberPlane,
  Line,
  Dot,
  Tex,
  BLUE_E,
  RED,
  DOWN,
  RIGHT,
} from "../src/index.js";

// Theme must be set before any mobject is constructed — Tex/Text read default
// colors at construction time.
CONFIG.setTheme("light");

const canvas = new Canvas();

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-5, 5, 1],
  yAxisRange: [-3, 5, 1],
  fillCanvas: true,
  axisConfig: { includeNumbers: true },
});

const line = plane.plot((x) => 0.5 * x + 1, { color: BLUE_E });

// Slope triangle from (0, 1) to (4, 3): run = 4, rise = 2.
const corner = plane.coordsToPoint(4, 1);
const runLeg = new Line({ start: plane.coordsToPoint(0, 1), end: corner, color: RED });
const riseLeg = new Line({ start: corner, end: plane.coordsToPoint(4, 3), color: RED });
const startDot = new Dot({ point: plane.coordsToPoint(0, 1), color: RED });
const endDot = new Dot({ point: plane.coordsToPoint(4, 3), color: RED });

const runLabel = new Tex("\\text{run} = 4", { color: RED, fontSize: 18 })
  .nextTo(runLeg, DOWN, undefined, 0.15);
const riseLabel = new Tex("\\text{rise} = 2", { color: RED, fontSize: 18 })
  .nextTo(riseLeg, RIGHT, undefined, 0.15);
const eqLabel = new Tex("y = \\tfrac{1}{2}x + 1", { color: BLUE_E, fontSize: 22 })
  .moveTo(plane.coordsToPoint(-2.5, 3.5));

canvas.add(plane, line, runLeg, riseLeg, startDot, endDot, runLabel, riseLabel, eqLabel);

writeFileSync("/tmp/linear_graph_with_slope_triangle.svg", canvas.toSVG());
console.log("wrote /tmp/linear_graph_with_slope_triangle.svg");
