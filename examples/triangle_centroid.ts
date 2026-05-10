/**
 * Centroid of a triangle: the intersection of the three medians, equivalently
 * the arithmetic mean of the vertex coordinates. Triangle ABC with
 * A=(0, 0), B=(6, 0), C=(3, 6) has centroid at (3, 2).
 *
 * No coordinate axes — the centroid is a geometric property of the triangle,
 * not a graphed function. Vertex coords appear in the labels and the formula
 * so the algebraic interpretation is still on the page.
 *
 * Run: npx tsx examples/triangle_centroid.ts
 * Out: /tmp/triangle_centroid.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  Polygon,
  Line,
  Dot,
  Tex,
  BLUE_E,
  RED,
  GRAY,
  DOWN,
  UP,
  RIGHT,
} from "../src/index.js";
import type { Vec3 } from "../src/utils/vec.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

// Math-to-scene mapping: center on math (3, 3), scaled down so there's room
// above the triangle's top vertex for the formula label without colliding
// with C's label.
const SCALE = 0.75;
const m2s = (x: number, y: number): Vec3 => [(x - 3) * SCALE, (y - 3) * SCALE, 0];

// Triangle vertices in math coords (chosen so the centroid lands on integers).
const A: [number, number] = [0, 0];
const B: [number, number] = [6, 0];
const C: [number, number] = [3, 6];

const triangle = new Polygon({
  vertices: [m2s(...A), m2s(...B), m2s(...C)],
  fillOpacity: 0,
  strokeColor: BLUE_E,
  strokeWidth: 4,
});

// Midpoints of opposite sides.
const midBC: [number, number] = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2]; // (4.5, 3)
const midAC: [number, number] = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2]; // (1.5, 3)
const midAB: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; // (3, 0)

// Three medians, each from a vertex to the midpoint of the opposite side.
const medianA = new Line({ start: m2s(...A), end: m2s(...midBC), color: GRAY, strokeWidth: 2, dashed: true });
const medianB = new Line({ start: m2s(...B), end: m2s(...midAC), color: GRAY, strokeWidth: 2, dashed: true });
const medianC = new Line({ start: m2s(...C), end: m2s(...midAB), color: GRAY, strokeWidth: 2, dashed: true });

// Centroid = mean of vertex coordinates = (3, 2).
const centroidPt = m2s(3, 2);
const centroidDot = new Dot({ point: centroidPt, color: RED, radius: 0.13 });

// Vertex labels (with coordinates so the formula is verifiable on the page).
const labelA = new Tex("A(0, 0)", { fontSize: 18 }).nextTo(m2s(...A), DOWN, undefined, 0.25);
const labelB = new Tex("B(6, 0)", { fontSize: 18 }).nextTo(m2s(...B), DOWN, undefined, 0.25);
const labelC = new Tex("C(3, 6)", { fontSize: 18 }).nextTo(m2s(...C), UP, undefined, 0.25);
const centroidLabel = new Tex("G = (3,\\, 2)", { color: RED, fontSize: 20 })
  .nextTo(centroidDot, RIGHT, undefined, 0.2);

// Formula above the triangle. Centroid = average of vertex coordinates.
const formula = new Tex(
  "G = \\left(\\tfrac{x_A + x_B + x_C}{3},\\; \\tfrac{y_A + y_B + y_C}{3}\\right)",
  { fontSize: 22 },
).moveTo([0, 3.4, 0]);

canvas.add(
  triangle,
  medianA, medianB, medianC,
  centroidDot,
  labelA, labelB, labelC,
  centroidLabel,
  formula,
);

writeFileSync("/tmp/triangle_centroid.svg", canvas.toSVG());
console.log("wrote /tmp/triangle_centroid.svg");
