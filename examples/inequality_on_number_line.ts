/**
 * Inequality x > 2 on a number line: open dot at 2, rightward ray, Tex label.
 * Run: npx tsx examples/inequality_on_number_line.ts
 * Out: /tmp/inequality_on_number_line.svg
 */
import { writeFileSync } from "node:fs";
import {
  CONFIG,
  Canvas,
  NumberLine,
  Circle,
  Arrow,
  Tex,
  RED,
  WHITE,
  UP,
} from "../src/index.js";

CONFIG.setTheme("light");

const canvas = new Canvas();

const nl = new NumberLine({ xRange: [-5, 5, 1], length: 10 });

// Open dot at x = 2: small circle with white fill + colored stroke.
const openDot = new Circle({
  arcCenter: nl.coordToPoint(2),
  radius: 0.12,
  fillColor: WHITE,
  strokeColor: RED,
  strokeWidth: 3,
});

// Ray from x = 2 rightward to the end of the visible range.
const ray = new Arrow({
  start: nl.coordToPoint(2),
  end: nl.coordToPoint(5),
  color: RED,
  strokeWidth: 4,
});

const label = new Tex("x > 2", { color: RED, fontSize: 24 })
  .nextTo(openDot, UP, undefined, 0.25);

canvas.add(nl, ray, openDot, label);

writeFileSync("/tmp/inequality_on_number_line.svg", canvas.toSVG());
console.log("wrote /tmp/inequality_on_number_line.svg");
