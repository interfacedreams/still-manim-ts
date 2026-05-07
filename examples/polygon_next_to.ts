/**
 * Renders the same scene as still-manim/scripts/dump_fixtures.py:_square_next_to_right
 * to SVG and writes it next to the Python output for visual comparison.
 *
 *   npx tsx examples/polygon_next_to.ts        # writes /tmp/ts_next_to_right.svg
 *   open /tmp/ts_next_to_right.svg
 *   open /Users/tommyjoseph/tommy11jo/still-manim/media/test0.svg  # python
 */
import { writeFileSync } from "node:fs";
import { canvas, Square, Triangle, RIGHT, RED } from "../src/index.js";

const sq = new Square({ sideLength: 2 });
const tri = new Triangle({ sideLength: 1.5, fillColor: RED }).nextTo(sq, RIGHT);
canvas.add(sq, tri);

const svg = canvas.toSVG();
const path = "/tmp/ts_next_to_right.svg";
writeFileSync(path, svg);
console.log(`wrote ${path}`);
