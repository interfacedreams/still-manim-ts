import { writeFileSync } from "node:fs";
import { canvas, Square, Circle, Arrow, RIGHT, RED } from "../src/index.js";

const sq = new Square({ sideLength: 2 });
const ci = new Circle({ radius: 0.6, fillColor: RED }).nextTo(sq, RIGHT);
const ar = new Arrow({ start: sq, end: ci });
canvas.add(sq, ci, ar);
writeFileSync("/tmp/ts_arrow.svg", canvas.toSVG());
console.log("wrote /tmp/ts_arrow.svg");
