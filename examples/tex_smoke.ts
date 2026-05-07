import { writeFileSync } from "node:fs";
import { canvas, Tex, Text, ArrayRow, DOWN, RED, YELLOW } from "../src/index.js";

const row = new ArrayRow([2, 5, 7, 8]);
row.cross([0, 3]);
row.highlight([1, 2]);
const formula = new Tex(String.raw`\frac{5+7}{2} = 6`).nextTo(
  row.between(1, 2),
  DOWN,
);
canvas.add(row, formula);
writeFileSync("/tmp/ts_tex.svg", canvas.toSVG());
console.log("wrote /tmp/ts_tex.svg");
console.log("formula bbox:", formula.boundingPoints);
console.log("formula widthPx, heightPx:", formula.widthPx, formula.heightPx);
