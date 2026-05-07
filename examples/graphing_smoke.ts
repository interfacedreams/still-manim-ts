import { writeFileSync } from "node:fs";
import {
  canvas,
  NumberPlane,
  RED,
  BLUE,
  YELLOW,
  PI,
} from "../src/index.js";

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-PI, PI, 1],
  yAxisRange: [-2, 2, 1],
  fillCanvas: true,
});

plane.plot((x) => Math.sin(x), { color: RED });
plane.plot((x) => Math.cos(x), { color: YELLOW });

canvas.add(plane);
writeFileSync("/tmp/ts_graphing.svg", canvas.toSVG());
console.log("wrote /tmp/ts_graphing.svg");
