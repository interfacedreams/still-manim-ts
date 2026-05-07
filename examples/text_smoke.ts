import { writeFileSync } from "node:fs";
import { canvas, Text, Square, Circle, DOWN, UP, RIGHT, RED } from "../src/index.js";

const sq = new Square({ sideLength: 2 });
const label = new Text("hello world").nextTo(sq, DOWN);
const ci = new Circle({ radius: 0.6, fillColor: RED }).nextTo(sq, RIGHT);
const above = new Text("CIRCLE").nextTo(ci, UP);

canvas.add(sq, label, ci, above);
writeFileSync("/tmp/ts_text.svg", canvas.toSVG());
console.log("wrote /tmp/ts_text.svg");
console.log("label bbox:", label.boundingPoints);
console.log("label width/height:", label.width, label.height);
