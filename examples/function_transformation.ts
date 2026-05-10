/**
 * Parent function y = x² and the transformed y = (x − 2)² + 3 on the same axes.
 * Red dashed step-lines along the axes show the shift in two parts: right 2,
 * then up 3. Each leg is labeled with its magnitude.
 * Run: npx tsx examples/function_transformation.ts
 * Out: /tmp/function_transformation.svg
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
  GRAY,
  DOWN,
  RIGHT,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-3, 6, 1],
  yAxisRange: [-1, 7, 1],
  fillCanvas: true,
  axisConfig: { includeNumbers: true },
});

// Parent y = x², drawn lighter to recede.
plane.plot((x) => x ** 2, { color: GRAY, strokeWidth: 3 });

// Transformed y = (x − 2)² + 3.
plane.plot((x) => (x - 2) ** 2 + 3, { color: BLUE_E, strokeWidth: 4 });

// Vertex markers.
const oldVertex = plane.coordsToPoint(0, 0);
const cornerVertex = plane.coordsToPoint(2, 0);
const newVertex = plane.coordsToPoint(2, 3);
const oldDot = new Dot({ point: oldVertex, color: GRAY, radius: 0.1 });
const newDot = new Dot({ point: newVertex, color: BLUE_E, radius: 0.1 });

// Step lines: right 2 along x-axis, then up 3 to the new vertex.
const horizontalShift = new Line({
  start: oldVertex,
  end: cornerVertex,
  color: RED,
  strokeWidth: 3,
  dashed: true,
});
const verticalShift = new Line({
  start: cornerVertex,
  end: newVertex,
  color: RED,
  strokeWidth: 3,
  dashed: true,
});
const horizLabel = new Tex("2", { color: RED, fontSize: 22 })
  .nextTo(horizontalShift, DOWN, undefined, 0.2);
const vertLabel = new Tex("3", { color: RED, fontSize: 22 })
  .nextTo(verticalShift, RIGHT, undefined, 0.2);

// Parent label sits in the bottom-left, shifted right of the parent curve.
const parentLabel = new Tex("y = x^2", { color: GRAY, fontSize: 20 })
  .moveTo(plane.coordsToPoint(-1.2, 5));

// Transformed equation in the canonical top-of-plot spot.
const newLabel = new Tex("y = (x - 2)^2 + 3", { color: BLUE_E, fontSize: 22 })
  .moveTo(plane.topLabelPoint(2.5));

canvas.add(
  plane,
  oldDot, newDot,
  horizontalShift, verticalShift,
  horizLabel, vertLabel,
  parentLabel, newLabel,
);

writeFileSync("/tmp/function_transformation.svg", canvas.toSVG());
console.log("wrote /tmp/function_transformation.svg");
