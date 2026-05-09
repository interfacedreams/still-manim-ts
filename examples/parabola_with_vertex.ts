/**
 * Parabola y = (x − 1)² − 4 with the vertex marked. Vertex form makes the
 * (1, −4) coordinates obvious.
 * Run: npx tsx examples/parabola_with_vertex.ts
 * Out: /tmp/parabola_with_vertex.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  NumberPlane,
  Dot,
  Tex,
  BLUE_E,
  RED,
  DOWN,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-3, 5, 1],
  yAxisRange: [-5, 4, 1],
  fillCanvas: true,
  axisConfig: { includeNumbers: true },
});

plane.plot((x) => (x - 1) ** 2 - 4, { color: BLUE_E });

// Vertex marker.
const vertex = plane.coordsToPoint(1, -4);
const vertexDot = new Dot({ point: vertex, color: RED, radius: 0.1 });
const vertexLabel = new Tex("(1,\\, -4)", { color: RED, fontSize: 20 })
  .nextTo(vertexDot, DOWN, undefined, 0.2);

// Equation in the canonical "above the top grid line" position, centered on x = 1.
const eqLabel = new Tex("y = (x - 1)^2 - 4", { color: BLUE_E, fontSize: 22 })
  .moveTo(plane.topLabelPoint(1));

canvas.add(plane, vertexDot, vertexLabel, eqLabel);

writeFileSync("/tmp/parabola_with_vertex.svg", canvas.toSVG());
console.log("wrote /tmp/parabola_with_vertex.svg");
