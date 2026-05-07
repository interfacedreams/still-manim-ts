/**
 * "Inverses: y = 2^x and y = log_2(x)" case study — 5 panels showing how
 * the two functions are inverses, reflected across the line y = x.
 */
import {
  Arrow,
  CONFIG,
  Circle,
  DOWN,
  Dot,
  Group,
  Line,
  NumberLine,
  NumberPlane,
  RED,
  RIGHT,
  Table,
  Tex,
  Text,
  UP,
  YELLOW,
  GREEN,
  BLUE,
  GRAY,
  type CellContent,
  type Mobject,
  type Vec3,
} from "../../src/index.js";

export type Panel = { name: string; title: string; build: () => Mobject[] };

// --- 1. Side-by-side tables: x and y columns flip between the two functions
// Four columns total. The highlighted yellow row pair (1,2) ↔ (2,1) makes
// the (x,y)→(y,x) flip jump out at the eye.
const sideBySideTables = (): Mobject[] => {
  const tex = (s: string, fontSize = 26) => new Tex(s, { fontSize });

  const expData: Array<Array<CellContent>> = [
    [tex("x"),  tex("y")],
    ["−2",      tex(String.raw`\tfrac{1}{4}`)],
    ["−1",      tex(String.raw`\tfrac{1}{2}`)],
    ["0",       "1"],
    ["1",       "2"],
    ["2",       "4"],
    ["3",       "8"],
  ];
  const expT = new Table(expData, { fontSize: 26, cellHeight: 0.7 });
  // Highlight row 4 ((1, 2)) — the yellow pairing.
  expT.highlight([[4, 0], [4, 1]], YELLOW);

  const logData: Array<Array<CellContent>> = [
    [tex("x"),                            tex("y")],
    [tex(String.raw`\tfrac{1}{4}`),       "−2"],
    [tex(String.raw`\tfrac{1}{2}`),       "−1"],
    ["1",                                  "0"],
    ["2",                                  "1"],
    ["4",                                  "2"],
    ["8",                                  "3"],
  ];
  const logT = new Table(logData, { fontSize: 26, cellHeight: 0.7 });
  // Highlight row 4 ((2, 1)) — the partner of (1, 2) on the left.
  logT.highlight([[4, 0], [4, 1]], YELLOW);

  // Place tables side-by-side, mirrored around the vertical center.
  expT.shift([-3.2 - expT.center[0], -0.3 - expT.center[1], 0]);
  logT.shift([3.2 - logT.center[0], -0.3 - logT.center[1], 0]);

  const expLabel = new Tex(String.raw`y = 2^{x}`, {
    fontSize: 32, color: BLUE, bgColor: CONFIG.defaultLabelBgColor,
  }).nextTo(expT, UP, undefined, 0.35);

  const logLabel = new Tex(String.raw`y = \log_{2}(x)`, {
    fontSize: 32, color: RED, bgColor: CONFIG.defaultLabelBgColor,
  }).nextTo(logT, UP, undefined, 0.35);

  const title = new Text(
    "(x, y) on 2^x flips to (y, x) on log_2 — same numbers, columns swap",
    { fontSize: 22, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  title.moveTo([0, 3.55, 0]);

  const caption = new Text(
    "Highlighted rows: (1, 2) on the left ⇄ (2, 1) on the right",
    { fontSize: 20, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  caption.moveTo([0, -3.55, 0]);

  return [title, expT, logT, expLabel, logLabel, caption];
};

// --- 2. The headline graph: y=2^x, y=log_2(x), and y=x dashed --------------
// Square plane (xLength = yLength, xRange = yRange) so the visual reflection
// across y = x actually looks like a 45° mirror, not a stretched skew.
const graphWithYEqualsX = (): Mobject[] => {
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [-4, 4, 1],
    yAxisRange: [-4, 4, 1],
    xLength: 7,
    yLength: 7,
    fillCanvas: false,
  });

  // y = 2^x — clip handled by ParametricFunction's yMin/yMax.
  plane.plot((x) => Math.pow(2, x), {
    xRange: [-4, 4, 0.02],
    color: BLUE,
    strokeWidth: 4,
  });

  // y = log_2(x) — domain x > 0; sample fine near 0 because the curve dives.
  plane.plot((x) => Math.log2(x), {
    xRange: [0.01, 4, 0.01],
    color: RED,
    strokeWidth: 4,
  });

  // y = x as a dashed white line spanning the visible diagonal.
  const yEqX = new Line({
    start: plane.coordsToPoint(-4, -4),
    end: plane.coordsToPoint(4, 4),
    color: CONFIG.defaultTextColor,
    strokeWidth: 1.5,
    dashed: true,
  });

  const expLabel = new Tex(String.raw`y = 2^{x}`, {
    fontSize: 26, color: BLUE, bgColor: CONFIG.defaultLabelBgColor,
  });
  expLabel.moveTo(plane.coordsToPoint(1.4, 3.5));

  const logLabel = new Tex(String.raw`y = \log_{2}(x)`, {
    fontSize: 26, color: RED, bgColor: CONFIG.defaultLabelBgColor,
  });
  logLabel.moveTo(plane.coordsToPoint(3.0, 1.45));

  const yEqXLabel = new Tex(String.raw`y = x`, {
    fontSize: 24, color: CONFIG.defaultTextColor, bgColor: CONFIG.defaultLabelBgColor,
  });
  yEqXLabel.moveTo(plane.coordsToPoint(3.5, 3.0));

  const title = new Text(
    "y = 2^x and y = log_2(x) are reflections across y = x",
    { fontSize: 22, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  title.moveTo([0, 3.7, 0]);

  return [plane, yEqX, expLabel, logLabel, yEqXLabel, title];
};

// --- 3. Drive home the reflection: dashed connectors between paired points
// For inverse functions, every point (a,b) on f has a partner (b,a) on f^-1.
// The segment connecting them is perpendicular to y=x and bisected by y=x.
const reflectionConnectors = (): Mobject[] => {
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [-4, 4, 1],
    yAxisRange: [-4, 4, 1],
    xLength: 7,
    yLength: 7,
    fillCanvas: false,
  });

  plane.plot((x) => Math.pow(2, x), {
    xRange: [-4, 4, 0.02],
    color: BLUE,
    strokeWidth: 4,
  });
  // Sample past x=4 so the right tail visibly continues off the plane edge,
  // mirroring how 2^x runs off the top edge along its asymptote behavior.
  plane.plot((x) => Math.log2(x), {
    xRange: [0.01, 5, 0.01],
    color: RED,
    strokeWidth: 4,
  });
  const yEqX = new Line({
    start: plane.coordsToPoint(-4, -4),
    end: plane.coordsToPoint(4, 4),
    color: CONFIG.defaultTextColor,
    strokeWidth: 1.5,
    dashed: true,
  });

  // Three (a, b) ↔ (b, a) pairs. Skip pairs that would land outside the frame.
  const pairs: Array<[number, number]> = [
    [-1, 0.5],   //  (−1, 1/2) ↔ (1/2, −1)
    [0, 1],      //  (0, 1)    ↔ (1, 0)
    [1, 2],      //  (1, 2)    ↔ (2, 1)
  ];

  const items: Mobject[] = [plane, yEqX];
  for (const [a, b] of pairs) {
    const pExp: Vec3 = plane.coordsToPoint(a, b);
    const pLog: Vec3 = plane.coordsToPoint(b, a);
    items.push(new Dot({ point: pExp, radius: 0.09, color: BLUE }));
    items.push(new Dot({ point: pLog, radius: 0.09, color: RED }));
    // Connector. Slope = -1, midpoint sits exactly on y=x.
    items.push(new Line({
      start: pExp,
      end: pLog,
      color: YELLOW,
      strokeWidth: 1.5,
      dashed: true,
    }));
    // Tiny mark at the midpoint to emphasize y=x bisects the connector.
    const mid: Vec3 = [(pExp[0] + pLog[0]) / 2, (pExp[1] + pLog[1]) / 2, 0];
    items.push(new Dot({ point: mid, radius: 0.05, color: YELLOW }));
  }

  // Label the (1,2) ↔ (2,1) pair concretely.
  const labelA = new Tex(String.raw`(1,\ 2)`, {
    fontSize: 20, color: BLUE, bgColor: CONFIG.defaultLabelBgColor,
  });
  labelA.moveTo([
    plane.coordsToPoint(1, 2)[0] - 0.55,
    plane.coordsToPoint(1, 2)[1] + 0.3,
    0,
  ]);
  const labelB = new Tex(String.raw`(2,\ 1)`, {
    fontSize: 20, color: RED, bgColor: CONFIG.defaultLabelBgColor,
  });
  labelB.moveTo([
    plane.coordsToPoint(2, 1)[0] + 0.55,
    plane.coordsToPoint(2, 1)[1] - 0.3,
    0,
  ]);

  const title = new Text(
    "Each (a, b) on 2^x partners with (b, a) on log_2 — y = x bisects the segment",
    { fontSize: 20, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  title.moveTo([0, 3.7, 0]);

  return [...items, labelA, labelB, title];
};

// --- 4. Domain and range swap (a commonly missed consequence) --------------
// Domain of 2^x is all reals; range is (0, ∞). For log_2, those swap.
const domainRangeSwap = (): Mobject[] => {
  // Top number line: domain of 2^x = ℝ, with the corresponding range below.
  // Extend shade past the labeled endpoints (to ±4.6) so the unbounded sides
  // visually run into the arrow tips — conveys "extends to infinity".
  const dom1 = new NumberLine({ xRange: [-4, 4, 1], length: 9 });
  const dom1Shade = new Arrow({
    start: dom1.coordToPoint(-4.6),
    end: dom1.coordToPoint(4.6),
    color: BLUE,
    strokeWidth: 6,
    atStart: true,
    atEnd: true,
    tipLength: 0.22,
    tipWidth: 0.22,
  });
  const ran1 = new NumberLine({ xRange: [-4, 4, 1], length: 9 });
  // Range = (0, ∞) — open at 0, extends right with a colored arrow tip.
  const ran1Shade = new Arrow({
    start: ran1.coordToPoint(0),
    end: ran1.coordToPoint(4.6),
    color: BLUE,
    strokeWidth: 6,
    tipLength: 0.22,
    tipWidth: 0.22,
  });
  const ran1Hole = new Circle({
    radius: 0.13, strokeColor: BLUE, strokeWidth: 4,
    fillColor: CONFIG.defaultLabelBgColor, fillOpacity: 1,
  }).moveTo(ran1.coordToPoint(0));

  const block1 = new Group();
  block1.add(dom1, dom1Shade, ran1, ran1Shade, ran1Hole);
  // Stack: domain on top, range below.
  ran1.shift([0, -1.0, 0]);
  ran1Shade.shift([0, -1.0, 0]);
  ran1Hole.shift([0, -1.0, 0]);

  const expFormula = new Tex(String.raw`y = 2^{x}`, {
    fontSize: 28, color: BLUE, bgColor: CONFIG.defaultLabelBgColor,
  });
  expFormula.moveTo([-6.0, dom1.center[1] + 0.0, 0]);

  const dom1Label = new Tex(String.raw`\text{domain} = \mathbb{R}`, {
    fontSize: 22, color: BLUE, bgColor: CONFIG.defaultLabelBgColor,
  }).nextTo(dom1, UP, undefined, 0.2);
  const ran1Label = new Tex(String.raw`\text{range} = (0,\ \infty)`, {
    fontSize: 22, color: BLUE, bgColor: CONFIG.defaultLabelBgColor,
  });
  ran1Label.moveTo([ran1.center[0], ran1.center[1] - 0.55, 0]);

  const top = new Group();
  top.add(dom1, dom1Shade, ran1, ran1Shade, ran1Hole, expFormula, dom1Label, ran1Label);
  top.shift([0, 1.4, 0]);

  // Bottom block: log_2(x) — swapped.
  const dom2 = new NumberLine({ xRange: [-4, 4, 1], length: 9 });
  const dom2Shade = new Arrow({
    start: dom2.coordToPoint(0),
    end: dom2.coordToPoint(4.6),
    color: RED,
    strokeWidth: 6,
    tipLength: 0.22,
    tipWidth: 0.22,
  });
  const dom2Hole = new Circle({
    radius: 0.13, strokeColor: RED, strokeWidth: 4,
    fillColor: CONFIG.defaultLabelBgColor, fillOpacity: 1,
  }).moveTo(dom2.coordToPoint(0));

  const ran2 = new NumberLine({ xRange: [-4, 4, 1], length: 9 });
  const ran2Shade = new Arrow({
    start: ran2.coordToPoint(-4.6),
    end: ran2.coordToPoint(4.6),
    color: RED,
    strokeWidth: 6,
    atStart: true,
    atEnd: true,
    tipLength: 0.22,
    tipWidth: 0.22,
  });

  ran2.shift([0, -1.0, 0]);
  ran2Shade.shift([0, -1.0, 0]);

  const logFormula = new Tex(String.raw`y = \log_{2}(x)`, {
    fontSize: 28, color: RED, bgColor: CONFIG.defaultLabelBgColor,
  });
  logFormula.moveTo([-6.0, dom2.center[1] + 0.0, 0]);

  const dom2Label = new Tex(String.raw`\text{domain} = (0,\ \infty)`, {
    fontSize: 22, color: RED, bgColor: CONFIG.defaultLabelBgColor,
  }).nextTo(dom2, UP, undefined, 0.2);
  const ran2Label = new Tex(String.raw`\text{range} = \mathbb{R}`, {
    fontSize: 22, color: RED, bgColor: CONFIG.defaultLabelBgColor,
  });
  ran2Label.moveTo([ran2.center[0], ran2.center[1] - 0.55, 0]);

  const bot = new Group();
  bot.add(dom2, dom2Shade, dom2Hole, ran2, ran2Shade, logFormula, dom2Label, ran2Label);
  bot.shift([0, -2.0, 0]);

  const title = new Text(
    "Inverses swap domain and range — the input set of one is the output set of the other",
    { fontSize: 20, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  title.moveTo([0, 3.7, 0]);

  return [title, top, bot];
};

// --- 5. Composition: the algebraic definition of "inverse" -----------------
// f and g are inverses iff f(g(x)) = x and g(f(x)) = x — show both directions
// concretely with x = 5 traced through both compositions.
const compositionDefinition = (): Mobject[] => {
  const title = new Text(
    "Composing inverses cancels — that's what makes them inverses",
    { fontSize: 22, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  title.moveTo([0, 3.6, 0]);

  // Top identity: log_2(2^x) = x
  const eq1 = new Tex(
    String.raw`\log_{2}\!\left(2^{x}\right) \;=\; x`,
    { fontSize: 40, bgColor: CONFIG.defaultLabelBgColor },
  );
  eq1.moveTo([0, 2.0, 0]);

  // Bottom identity: 2^(log_2 x) = x
  const eq2 = new Tex(
    String.raw`2^{\log_{2}(x)} \;=\; x`,
    { fontSize: 40, bgColor: CONFIG.defaultLabelBgColor },
  );
  eq2.moveTo([0, 0.4, 0]);

  // Worked trace with x = 5.
  const trace1 = new Tex(
    String.raw`x = 5 \;\xrightarrow{2^{x}}\; 32 \;\xrightarrow{\log_{2}}\; 5`,
    { fontSize: 30, color: BLUE, bgColor: CONFIG.defaultLabelBgColor },
  );
  trace1.moveTo([0, -1.1, 0]);

  const trace2 = new Tex(
    String.raw`x = 5 \;\xrightarrow{\log_{2}}\; \log_{2}(5) \;\xrightarrow{2^{x}}\; 5`,
    { fontSize: 30, color: RED, bgColor: CONFIG.defaultLabelBgColor },
  );
  trace2.moveTo([0, -2.4, 0]);

  const caption = new Text(
    "Whatever 2^x does, log_2 undoes — and vice versa. That's the formal test for inverses.",
    { fontSize: 18, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  caption.moveTo([0, -3.55, 0]);

  return [title, eq1, eq2, trace1, trace2, caption];
};

export const INVERSES_PANELS: Panel[] = [
  { name: "tables", title: "Side-by-side tables — x and y columns swap", build: sideBySideTables },
  { name: "graph", title: "y = 2^x and y = log_2(x) with y = x dashed", build: graphWithYEqualsX },
  { name: "reflection", title: "Point pairs reflected across y = x", build: reflectionConnectors },
  { name: "domain_range", title: "Domain and range swap", build: domainRangeSwap },
  { name: "composition", title: "Composition: log_2(2^x) = x and 2^(log_2 x) = x", build: compositionDefinition },
];

export const INVERSES_CASE_STUDY = {
  id: "inverses",
  title: "Inverses: y = 2^x and y = log_2(x)",
  panels: INVERSES_PANELS,
};
