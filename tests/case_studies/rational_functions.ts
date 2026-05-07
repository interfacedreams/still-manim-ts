/**
 * "Rational functions" case study — 7 panels exploring the function
 * y = 1/(x − 3), interval/set notation, and a factored rational with a hole.
 */
import {
  ArrayRow,
  Arrow,
  Brace,
  Circle,
  DOWN,
  Dot,
  Group,
  Highlight,
  Line,
  NumberLine,
  NumberPlane,
  PI,
  RED,
  RIGHT,
  Tex,
  Text,
  UP,
  YELLOW,
  GREEN,
  BLUE,
  WHITE,
  BLACK,
  type Mobject,
} from "../../src/index.js";

export type Panel = { name: string; title: string; build: () => Mobject[] };

// --- 1. Table of values -----------------------------------------------------
const tableOfValues = (): Mobject[] => {
  // Use strings so 2.999 / 3.001 don't get rounded to "3" by the formatter.
  const xLabels: Array<number | string> = ["x", "2.9", "2.99", "2.999", "3", "3.001", "3.01", "3.1"];
  const yLabels: Array<number | string> = ["y", "−10", "−100", "−1000", "DNE", "1000", "100", "10"];
  // Force uniform cell width so the two rows line up column-for-column.
  const cellWidth = 1.2;
  const cellHeight = 0.7;
  const xRow = new ArrayRow(xLabels, { cellWidth, cellHeight, fontSize: 24 });
  const yRow = new ArrayRow(yLabels, { cellWidth, cellHeight, fontSize: 22 })
    .nextTo(xRow, DOWN, undefined, 0);
  // Highlight x=3 column (index 4 in cell array — "x" header + "3" position).
  const xIdx = xLabels.indexOf("3");
  xRow.highlight([xIdx], YELLOW);
  yRow.highlight([xIdx], YELLOW);

  const formula = new Tex(String.raw`y = \frac{1}{x - 3}`, { fontSize: 36, bgColor: BLACK })
    .nextTo(xRow, UP, undefined, 0.5);

  const note = new Text("y blows up as x → 3", { fontSize: 22, color: YELLOW, bgColor: BLACK })
    .nextTo(yRow, DOWN, undefined, 0.5);

  return [formula, xRow, yRow, note];
};

// --- 1b. Same table but with x and y as vertical columns -------------------
const tableOfValuesVertical = (): Mobject[] => {
  const rows: Array<[string, string]> = [
    ["x", "y"],
    ["2.9", "−10"],
    ["2.99", "−100"],
    ["2.999", "−1000"],
    ["3", "DNE"],
    ["3.001", "1000"],
    ["3.01", "100"],
    ["3.1", "10"],
  ];
  const cellWidth = 1.4;
  const cellHeight = 0.55;
  const rowMobs: ArrayRow[] = [];
  let prev: ArrayRow | null = null;
  for (const [xv, yv] of rows) {
    const r = new ArrayRow([xv, yv], { cellWidth, cellHeight, fontSize: 22 });
    if (prev) r.nextTo(prev, DOWN, undefined, 0);
    rowMobs.push(r);
    prev = r;
  }
  // Highlight the row corresponding to x=3 (index 4 in `rows`).
  rowMobs[4]!.highlight([0, 1], YELLOW);

  const table = new Group();
  table.add(...rowMobs);

  const formula = new Tex(String.raw`y = \frac{1}{x - 3}`, { fontSize: 32, bgColor: BLACK })
    .nextTo(table, RIGHT, undefined, 0.6);

  const note = new Text("y blows up as x → 3", {
    fontSize: 20,
    color: YELLOW,
    bgColor: BLACK,
  }).nextTo(formula, DOWN, undefined, 0.4);

  return [table, formula, note];
};

// --- 2. Graph of y = 1/(x − 3) with asymptote -------------------------------
const graphWithAsymptote = (): Mobject[] => {
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [-2, 8, 1],
    yAxisRange: [-5, 5, 1],
    fillCanvas: true,
  });
  // Plot in two segments to avoid drawing across the singularity at x=3.
  // The endpoint x-values (2.8, 3.2) are chosen so y stays roughly within the
  // [-5, 5] frame: 1/(2.8-3) = -5, 1/(3.2-3) = 5.
  plane.plot((x) => 1 / (x - 3), { xRange: [-2, 2.8, 0.02], color: RED });
  plane.plot((x) => 1 / (x - 3), { xRange: [3.2, 8, 0.02], color: RED });

  // Vertical asymptote at x=3 (dashed white line).
  const top = plane.coordsToPoint(3, 5);
  const bot = plane.coordsToPoint(3, -5);
  const asymptote = new Line({
    start: top,
    end: bot,
    color: WHITE,
    strokeWidth: 1,
    dashed: true,
  });
  const asymLabel = new Tex(String.raw`x = 3`, { fontSize: 22, color: YELLOW, bgColor: BLACK })
    .nextTo(top, UP, undefined, 0.05);

  return [plane, asymptote, asymLabel];
};

// --- 3. Domain in interval notation -----------------------------------------
const intervalNotationDomain = (): Mobject[] => {
  // A number line with a hole at x=3, plus interval-notation Tex.
  const nl = new NumberLine({ xRange: [-2, 8, 1], length: 10 });
  const hole = new Circle({ radius: 0.12, strokeColor: WHITE, strokeWidth: 3, fillColor: BLACK })
    .moveTo(nl.coordToPoint(3));

  const formula = new Tex(String.raw`(-\infty, 3)\ \cup\ (3, \infty)`, {
    fontSize: 36,
    bgColor: BLACK,
  }).nextTo(nl, UP, undefined, 0.6);

  const caption = new Text(
    "domain of y = 1/(x − 3): all reals except 3",
    { fontSize: 22, bgColor: BLACK },
  ).nextTo(nl, DOWN, undefined, 0.7);

  return [nl, hole, formula, caption];
};

// --- 4. Set-builder notation with hole --------------------------------------
const setNotationWithHoles = (): Mobject[] => {
  const nl = new NumberLine({ xRange: [-2, 8, 1], length: 10 });
  const hole = new Circle({ radius: 0.12, strokeColor: WHITE, strokeWidth: 3, fillColor: BLACK })
    .moveTo(nl.coordToPoint(3));

  const formula = new Tex(String.raw`\{\, x \in \mathbb{R} : x \neq 3 \,\}`, {
    fontSize: 36,
    bgColor: BLACK,
  }).nextTo(nl, UP, undefined, 0.6);

  const caption = new Text("set-builder notation — exclude x = 3", {
    fontSize: 22,
    bgColor: BLACK,
  }).nextTo(nl, DOWN, undefined, 0.7);

  // Pointer arrow from formula to the hole.
  const arrow = new Arrow({
    start: [formula.bottom[0] - 0.5, formula.bottom[1] - 0.1, 0],
    end: [hole.top[0], hole.top[1] + 0.05, 0],
    color: YELLOW,
    strokeWidth: 2,
    tipLength: 0.15,
    tipWidth: 0.15,
  });

  return [nl, hole, formula, caption, arrow];
};

// --- 5. Open hole vs closed hole on a number line ---------------------------
const openVsClosedHole = (): Mobject[] => {
  // Two stacked number lines with the same range, one with an open circle
  // (excluded endpoint) and one with a filled circle (included endpoint).
  const opt = { xRange: [-1, 5, 1] as [number, number, number], length: 6 };

  const top = new NumberLine(opt);
  const topShade = new Line({
    start: top.coordToPoint(2),
    end: top.coordToPoint(5),
    color: BLUE,
    strokeWidth: 6,
  });
  const openHole = new Circle({
    radius: 0.14,
    strokeColor: BLUE,
    strokeWidth: 4,
    fillColor: BLACK,
    fillOpacity: 1,
  }).moveTo(top.coordToPoint(2));
  const topLabel = new Tex(String.raw`(2, 5]\ \text{— open at 2}`, {
    fontSize: 26,
    color: BLUE,
    bgColor: BLACK,
  }).nextTo(top, DOWN, undefined, 0.5);
  const topG = new Group();
  topG.add(top, topShade, openHole, topLabel);

  const bot = new NumberLine(opt);
  const botShade = new Line({
    start: bot.coordToPoint(2),
    end: bot.coordToPoint(5),
    color: GREEN,
    strokeWidth: 6,
  });
  const closedHole = new Dot({ point: bot.coordToPoint(2), radius: 0.14, color: GREEN });
  const botLabel = new Tex(String.raw`[2, 5]\ \text{— closed at 2}`, {
    fontSize: 26,
    color: GREEN,
    bgColor: BLACK,
  }).nextTo(bot, DOWN, undefined, 0.5);
  const botG = new Group();
  botG.add(bot, botShade, closedHole, botLabel);

  botG.nextTo(topG, DOWN, undefined, 1.2);
  return [topG, botG];
};

// --- 6. Intersection of two sets on a number line ---------------------------
const intersectionOnNumberLine = (): Mobject[] => {
  const nl = new NumberLine({ xRange: [-2, 8, 1], length: 10 });
  // A = [0, 5], B = [2, 7]. A ∩ B = [2, 5].
  const A = new Line({
    start: nl.coordToPoint(0),
    end: nl.coordToPoint(5),
    color: BLUE,
    strokeWidth: 8,
  });
  const B = new Line({
    start: nl.coordToPoint(2),
    end: nl.coordToPoint(7),
    color: GREEN,
    strokeWidth: 8,
  });
  // shift A and B vertically so they're visible separately above the line
  A.shift([0, 0.4, 0]);
  B.shift([0, 0.7, 0]);

  // Intersection [2,5] highlighted on the number line itself.
  const inter = new Line({
    start: nl.coordToPoint(2),
    end: nl.coordToPoint(5),
    color: YELLOW,
    strokeWidth: 8,
  });

  const labelA = new Tex(String.raw`A = [0, 5]`, { fontSize: 24, color: BLUE, bgColor: BLACK })
    .nextTo(A, RIGHT, undefined, 0.3);
  const labelB = new Tex(String.raw`B = [2, 7]`, { fontSize: 24, color: GREEN, bgColor: BLACK })
    .nextTo(B, RIGHT, undefined, 0.3);
  const labelInter = new Tex(String.raw`A \cap B = [2, 5]`, {
    fontSize: 28,
    color: YELLOW,
    bgColor: BLACK,
  }).nextTo(nl, DOWN, undefined, 0.6);

  return [nl, A, B, inter, labelA, labelB, labelInter];
};

// --- 7. Hole at x = 1 from a cancellable (x-1) factor -----------------------
const holeFromCancellation = (): Mobject[] => {
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [-3, 5, 1],
    yAxisRange: [-2, 6, 1],
    fillCanvas: true,
  });
  // f(x) = (x-1)(x+2) / (x-1) = x+2, except f(1) is undefined → hole at (1, 3).
  plane.plot((x) => x + 2, { color: RED });
  // Hole marker at (1, 3) — open circle.
  const hole = new Circle({
    radius: 0.15,
    strokeColor: RED,
    strokeWidth: 4,
    fillColor: BLACK,
    fillOpacity: 1,
  }).moveTo(plane.coordsToPoint(1, 3));

  const formula = new Tex(
    String.raw`f(x) = \frac{(x-1)(x+2)}{(x-1)}`,
    { fontSize: 32, bgColor: BLACK },
  );
  formula.moveTo(plane.coordsToPoint(-1.8, 4.5));

  const cancel = new Tex(
    String.raw`= x + 2,\quad x \neq 1`,
    { fontSize: 28, color: YELLOW, bgColor: BLACK },
  ).nextTo(formula, DOWN, undefined, 0.2);

  const arrow = new Arrow({
    start: [cancel.right[0] + 0.3, cancel.right[1], 0],
    end: [hole.left[0] - 0.05, hole.left[1], 0],
    color: YELLOW,
    strokeWidth: 2,
    tipLength: 0.15,
    tipWidth: 0.15,
  });

  const note = new Text(
    "(x − 1) cancels in numerator and denominator — leaves a hole at x = 1",
    { fontSize: 18, color: YELLOW, bgColor: BLACK, maxWidth: 8 },
  );
  note.moveTo(plane.coordsToPoint(1.8, -1.2));

  return [plane, hole, formula, cancel, arrow, note];
};

export const RATIONAL_FUNCTIONS_PANELS: Panel[] = [
  { name: "table", title: "Table of values for y = 1/(x − 3)", build: tableOfValues },
  { name: "table_variant", title: "Table variant — x and y as columns", build: tableOfValuesVertical },
  { name: "graph", title: "Graph with vertical asymptote at x = 3", build: graphWithAsymptote },
  { name: "interval", title: "Domain in interval notation", build: intervalNotationDomain },
  { name: "set", title: "Set-builder notation with a hole", build: setNotationWithHoles },
  { name: "open_vs_closed", title: "Open hole vs closed hole", build: openVsClosedHole },
  { name: "intersection", title: "Intersection of two sets", build: intersectionOnNumberLine },
  { name: "hole_factor", title: "Hole from a cancellable factor", build: holeFromCancellation },
];

export const RATIONAL_FUNCTIONS_CASE_STUDY = {
  id: "rational-functions",
  title: "Rational functions",
  panels: RATIONAL_FUNCTIONS_PANELS,
};
