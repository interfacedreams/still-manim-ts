import { canvas, Square, Triangle, RIGHT, RED } from "../src/index.js";

const sq = new Square({ sideLength: 2 });
const tri = new Triangle({ sideLength: 1.5, fillColor: RED }).nextTo(sq, RIGHT);

canvas.add(sq, tri);

console.log("square center:", sq.center);
console.log("square right:", sq.right);
console.log("triangle vertices:", tri.vertices);
console.log("triangle center:", tri.center);
console.log("triangle left:", tri.left);
console.log();
console.log(canvas.toSVG());
