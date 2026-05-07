/**
 * "Unit circle → cosine graph" case study — 4 panels showing how cos comes
 * out of the unit circle, the landmark points, and reference-angle reflection.
 *
 * Color scheme (light-mode rule): BLUE_E primary, RED secondary, GREEN_D
 * tertiary, BLACK for written labels. ORANGE/PURPLE/PINK/etc. only appear
 * where we need to distinguish 4+ items in a single panel.
 */
import {
  Arc,
  Arrow,
  CONFIG,
  DOWN,
  Dot,
  Line,
  NumberPlane,
  ORIGIN,
  PI,
  Table,
  type CellContent,
  Tex,
  Text,
  UnitCircle,
  RED,
  GREEN_D,
  BLUE_D,
  BLUE_E,
  YELLOW,
  ORANGE,
  PURPLE,
  PINK,
  GRAY,
  type ManimColor,
  type Mobject,
  type Vec3,
} from "../../src/index.js";

export type Panel = { name: string; title: string; build: () => Mobject[] };

// --- 1. Cosine is the x-coordinate of the point on the unit circle ----------
const cosineIsXCoordinate = (): Mobject[] => {
  const r = 2.2;
  const theta = PI / 3;
  const px = r * Math.cos(theta);
  const py = r * Math.sin(theta);

  const uc = new UnitCircle({ radius: r, angles: [], showLabels: false, circleColor: BLUE_E });

  const point = new Dot({ point: [px, py, 0], radius: 0.1, color: CONFIG.defaultTextColor });
  const radial = new Line({
    start: ORIGIN,
    end: [px, py, 0],
    color: CONFIG.defaultTextColor,
    strokeWidth: 2,
  });

  // Dashed projections onto each axis — neutral grey so they don't compete
  // with the colored cos/sin segments.
  const vert = new Line({
    start: [px, py, 0],
    end: [px, 0, 0],
    color: GRAY,
    strokeWidth: 2,
    dashed: true,
  });
  const horiz = new Line({
    start: [px, py, 0],
    end: [0, py, 0],
    color: GRAY,
    strokeWidth: 2,
    dashed: true,
  });
  // cos = x-segment (primary, the focus of this panel) → BLUE_E
  const cosSeg = new Line({
    start: ORIGIN,
    end: [px, 0, 0],
    color: BLUE_E,
    strokeWidth: 6,
  });
  // sin = y-segment (secondary) → RED
  const sinSeg = new Line({
    start: ORIGIN,
    end: [0, py, 0],
    color: RED,
    strokeWidth: 6,
  });

  // Angle arc (tertiary visual) → GREEN_D.
  const angleArc = new Arc({
    radius: 0.5,
    startAngle: 0,
    angle: theta,
    defaultStrokeColor: GREEN_D,
  });
  const thetaLabel = new Tex(String.raw`\theta`, { fontSize: 28, bgColor: CONFIG.defaultLabelBgColor });
  thetaLabel.moveTo([0.75 * Math.cos(theta / 2), 0.75 * Math.sin(theta / 2), 0]);

  // cosLabel and sinLabel match their respective segment colors so the eye
  // pairs label ↔ segment.
  const cosLabel = new Tex(String.raw`\cos\theta = \tfrac{1}{2}`, {
    fontSize: 28,
    color: BLUE_E,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  cosLabel.moveTo([px / 2, -0.45, 0]);

  const sinLabel = new Tex(String.raw`\sin\theta = \tfrac{\sqrt{3}}{2}`, {
    fontSize: 22,
    color: RED,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  sinLabel.moveTo([-1.3, py / 2, 0]);

  const pLabel = new Tex(String.raw`(\cos\theta,\ \sin\theta)`, {
    fontSize: 22,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  pLabel.moveTo([px + 1.6, py + 0.3, 0]);
  const pArrow = new Arrow({
    start: [pLabel.left[0] - 0.1, pLabel.left[1], 0],
    end: [px + 0.12, py + 0.05, 0],
    color: CONFIG.defaultTextColor,
    strokeWidth: 1.5,
    tipLength: 0.12,
    tipWidth: 0.12,
  });

  const title = new Text("cos θ is the x-coordinate · sin θ is the y-coordinate", {
    fontSize: 22,
    bgColor: CONFIG.defaultLabelBgColor,
    maxWidth: 13,
  });
  title.moveTo([0, 3.5, 0]);

  return [uc, sinSeg, cosSeg, vert, horiz, radial, angleArc, thetaLabel, point, cosLabel, sinLabel, pLabel, pArrow, title];
};

// --- 2. Unwrap the unit circle into the cosine graph ------------------------
const unwrapToCosineGraph = (): Mobject[] => {
  // Layout: unit circle on the left, cosine graph on the right.
  const r = 1.5;
  const ucCx = -5.0;
  const ucCy = -0.3;

  const uc = new UnitCircle({ radius: r, angles: [], showLabels: false, circleColor: BLUE_E });
  uc.shift([ucCx, ucCy, 0]);

  // Cos curve = primary subject → BLUE_E.
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [0, 2 * PI, PI / 2],
    yAxisRange: [-1.4, 1.4, 1],
    xLength: 8,
    yLength: 3.6,
    fillCanvas: false,
    axisConfig: { includeNumbers: false },
    planeOptions: { gridLines: false },
  });
  plane.shift([2.5, ucCy, 0]);
  plane.plot((x) => Math.cos(x), { xRange: [0, 2 * PI, 0.02], color: BLUE_E });

  // 6 evenly-spaced sample angles. Six distinct dot colors so each angle on
  // the unit circle pairs visually with its dot on the cos graph. BLUE_E is
  // taken by the curve, so samples cycle through RED → GREEN_D → ORANGE →
  // PURPLE → PINK → BLUE_D (medium teal, visually distinct from BLUE_E).
  // ORANGE appears here only because we need a 4th non-RGB hue to keep all
  // six samples distinguishable.
  const samples: Array<{ angle: number; color: ManimColor }> = [
    { angle: 0,             color: RED },
    { angle: PI / 3,        color: GREEN_D },
    { angle: (2 * PI) / 3,  color: ORANGE },
    { angle: PI,            color: PURPLE },
    { angle: (4 * PI) / 3,  color: PINK },
    { angle: (5 * PI) / 3,  color: BLUE_D },
  ];

  const dots: Mobject[] = [];
  const projections: Mobject[] = [];
  for (const { angle, color } of samples) {
    const ucDot = new Dot({
      point: [ucCx + r * Math.cos(angle), ucCy + r * Math.sin(angle), 0],
      radius: 0.08,
      color,
    });
    const cosVal = Math.cos(angle);
    const graphPt = plane.coordsToPoint(angle, cosVal);
    const graphDot = new Dot({ point: graphPt, radius: 0.08, color });
    dots.push(ucDot, graphDot);

    // Light dashed connector from circle point down to its x-projection on
    // the horizontal diameter — shows "x-coord on circle = height on graph".
    const ucProjection: Vec3 = [ucCx + r * Math.cos(angle), ucCy, 0];
    projections.push(
      new Line({
        start: [ucCx + r * Math.cos(angle), ucCy + r * Math.sin(angle), 0],
        end: ucProjection,
        color,
        strokeWidth: 1,
        dashed: true,
      }),
    );
  }

  const title = new Text(
    "As you sweep around the unit circle, the x-coordinate traces y = cos θ",
    { fontSize: 20, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  title.moveTo([0, 3.4, 0]);

  // Axis labels.
  const thetaAxisLabel = new Tex(String.raw`\theta`, { fontSize: 22, bgColor: CONFIG.defaultLabelBgColor });
  thetaAxisLabel.moveTo([plane.coordsToPoint(2 * PI, 0)[0] + 0.35, ucCy - 0.1, 0]);
  const yAxisLabel = new Tex(String.raw`\cos\theta`, { fontSize: 22, color: BLUE_E, bgColor: CONFIG.defaultLabelBgColor });
  yAxisLabel.moveTo([plane.coordsToPoint(0, 0)[0] - 0.7, plane.coordsToPoint(0, 1.4)[1], 0]);

  // π / 2π tick labels under the x-axis.
  const xTickLabels: Array<[number, string]> = [
    [PI / 2, String.raw`\tfrac{\pi}{2}`],
    [PI, String.raw`\pi`],
    [(3 * PI) / 2, String.raw`\tfrac{3\pi}{2}`],
    [2 * PI, String.raw`2\pi`],
  ];
  const tickTex: Mobject[] = xTickLabels.map(([x, latex]) => {
    const t = new Tex(latex, { fontSize: 18, bgColor: CONFIG.defaultLabelBgColor });
    t.moveTo([plane.coordsToPoint(x, 0)[0], ucCy - 0.35, 0]);
    return t;
  });

  return [uc, plane, ...projections, ...dots, title, thetaAxisLabel, yAxisLabel, ...tickTex];
};

// --- 3. The 5 landmark points on y = cos θ ---------------------------------
const landmarkPoints = (): Mobject[] => {
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [-0.5, 2 * PI + 0.5, PI / 2],
    yAxisRange: [-1.6, 1.6, 1],
    fillCanvas: true,
    axisConfig: { includeNumbers: false },
    planeOptions: { gridLines: false },
  });
  plane.plot((x) => Math.cos(x), { xRange: [0, 2 * PI, 0.02], color: BLUE_E });

  // Two states only: known landmarks (cos = ±1) and easy-to-miss zeros
  // (cos = 0 at π/2, 3π/2). RED for the missed ones (warning), GREEN_D for
  // the easy ones.
  const landmarks: Array<{ x: number; y: number; label: string; missed: boolean; offset: Vec3 }> = [
    { x: 0, y: 1, label: String.raw`(0,\ 1)`, missed: false, offset: [0.55, 0.5, 0] },
    { x: PI / 2, y: 0, label: String.raw`\left(\tfrac{\pi}{2},\ 0\right)`, missed: true, offset: [0, 0.7, 0] },
    { x: PI, y: -1, label: String.raw`(\pi,\ -1)`, missed: false, offset: [0, -0.6, 0] },
    { x: (3 * PI) / 2, y: 0, label: String.raw`\left(\tfrac{3\pi}{2},\ 0\right)`, missed: true, offset: [0, 0.7, 0] },
    { x: 2 * PI, y: 1, label: String.raw`(2\pi,\ 1)`, missed: false, offset: [-0.5, 0.5, 0] },
  ];

  const dotsAndLabels: Mobject[] = [];
  for (const { x, y, label, missed, offset } of landmarks) {
    const color = missed ? RED : GREEN_D;
    const dot = new Dot({ point: plane.coordsToPoint(x, y), radius: 0.11, color });
    const tex = new Tex(label, { fontSize: 22, color, bgColor: CONFIG.defaultLabelBgColor });
    tex.moveTo([
      plane.coordsToPoint(x, y)[0] + offset[0],
      plane.coordsToPoint(x, y)[1] + offset[1],
      0,
    ]);
    dotsAndLabels.push(dot, tex);
  }

  const title = new Text("5 landmark points — students often miss cos(π/2) = 0", {
    fontSize: 22,
    bgColor: CONFIG.defaultLabelBgColor,
    maxWidth: 13,
  });
  title.moveTo([0, 3.5, 0]);

  const caption = new Text(
    "cosine starts at 1, drops to 0 at π/2, hits −1 at π, climbs back through 0 at 3π/2, returns to 1 at 2π",
    { fontSize: 18, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13 },
  );
  caption.moveTo([0, -3.55, 0]);

  return [plane, ...dotsAndLabels, title, caption];
};

// --- 3.5 Table of cos values at landmark angles (mixed-content table) ------
const landmarkTable = (): Mobject[] => {
  // Mix Tex math, plain numbers, and a tiny visual marker in cells. Marker
  // colors mirror panel 3: GREEN_D for the easy landmarks, RED for the
  // easy-to-miss zeros. The YELLOW row highlight is just a low-opacity tint.
  const easyDot = (): Mobject => new Dot({ radius: 0.08, color: GREEN_D });
  const missedDot = (): Mobject => new Dot({ radius: 0.08, color: RED });

  const headerTheta = new Tex(String.raw`\theta`, { fontSize: 32 });
  const headerCos = new Tex(String.raw`\cos\theta`, { fontSize: 32 });
  const zero = new Tex("0", { fontSize: 32 });
  const piHalf = new Tex(String.raw`\tfrac{\pi}{2}`, { fontSize: 32 });
  const pi = new Tex(String.raw`\pi`, { fontSize: 32 });
  const threePiHalf = new Tex(String.raw`\tfrac{3\pi}{2}`, { fontSize: 32 });
  const twoPi = new Tex(String.raw`2\pi`, { fontSize: 32 });

  const data: Array<Array<CellContent>> = [
    [headerTheta, headerCos, "marker"],
    [zero,        "1",       easyDot()],
    [piHalf,      "0",       missedDot()],
    [pi,          "−1",      easyDot()],
    [threePiHalf, "0",       missedDot()],
    [twoPi,       "1",       easyDot()],
  ];
  data[0]![2] = new Text("on graph", { fontSize: 22 });

  const t = new Table(data, { fontSize: 28, cellHeight: 0.85 });
  t.highlight([[2, 0], [2, 1], [2, 2], [4, 0], [4, 1], [4, 2]], YELLOW);

  const title = new Text("Five landmark cos values — highlighted rows are the easy-to-miss zeros", {
    fontSize: 22, bgColor: CONFIG.defaultLabelBgColor, maxWidth: 13,
  });
  title.moveTo([0, 3.5, 0]);

  return [title, t];
};

// --- 4. Reference angles: why cos(2π/3) = -cos(π/3) ------------------------
const referenceAngles = (): Mobject[] => {
  // Two angles share the same reference angle of π/3:
  //   a1 = π/3 in Q1 (positive cos = 1/2)   → GREEN_D
  //   a2 = 2π/3 in Q2 (negative cos = −1/2) → RED (warning, sign flipped)
  // cos curve on the right uses BLUE_E.
  const r = 1.6;
  const ucCx = -4.6;
  const ucCy = 0;
  const a1 = PI / 3;
  const a2 = (2 * PI) / 3;

  const uc = new UnitCircle({ radius: r, angles: [], showLabels: false, circleColor: BLUE_E });
  uc.shift([ucCx, ucCy, 0]);

  const p1: Vec3 = [ucCx + r * Math.cos(a1), ucCy + r * Math.sin(a1), 0];
  const p2: Vec3 = [ucCx + r * Math.cos(a2), ucCy + r * Math.sin(a2), 0];

  // Radii — colored by their angle's role.
  const rad1 = new Line({ start: [ucCx, ucCy, 0], end: p1, color: GREEN_D, strokeWidth: 2 });
  const rad2 = new Line({ start: [ucCx, ucCy, 0], end: p2, color: RED, strokeWidth: 2 });

  // Verticals down to the x-axis (these segments visualize |cos|).
  const v1 = new Line({
    start: p1,
    end: [p1[0], ucCy, 0],
    color: GREEN_D,
    strokeWidth: 2,
    dashed: true,
  });
  const v2 = new Line({
    start: p2,
    end: [p2[0], ucCy, 0],
    color: RED,
    strokeWidth: 2,
    dashed: true,
  });

  // Reference-angle arc for a2 — drawn at the negative-x side, marking the
  // angle from neg-x axis up to p2. Colored RED to bind it to a2.
  const refArc = new Arc({
    radius: 0.45,
    startAngle: a2,
    angle: PI - a2,
    arcCenter: [ucCx, ucCy, 0],
    defaultStrokeColor: RED,
  });
  const refLabel = new Tex(String.raw`\tfrac{\pi}{3}`, {
    fontSize: 20,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  refLabel.moveTo([ucCx + 0.7 * Math.cos((a2 + PI) / 2), ucCy + 0.7 * Math.sin((a2 + PI) / 2), 0]);

  // The original π/3 arc in Q1 — colored GREEN_D to bind it to a1.
  const a1Arc = new Arc({
    radius: 0.45,
    startAngle: 0,
    angle: a1,
    arcCenter: [ucCx, ucCy, 0],
    defaultStrokeColor: GREEN_D,
  });
  const a1Label = new Tex(String.raw`\tfrac{\pi}{3}`, {
    fontSize: 20,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  a1Label.moveTo([ucCx + 0.7 * Math.cos(a1 / 2), ucCy + 0.7 * Math.sin(a1 / 2), 0]);

  // Dots.
  const d1 = new Dot({ point: p1, radius: 0.09, color: GREEN_D });
  const d2 = new Dot({ point: p2, radius: 0.09, color: RED });

  // x-coordinates 1/2 and -1/2 marked under the projections.
  const x1Label = new Tex(String.raw`\tfrac{1}{2}`, { fontSize: 18, color: GREEN_D, bgColor: CONFIG.defaultLabelBgColor });
  x1Label.moveTo([p1[0], ucCy - 0.35, 0]);
  const x2Label = new Tex(String.raw`-\tfrac{1}{2}`, { fontSize: 18, color: RED, bgColor: CONFIG.defaultLabelBgColor });
  x2Label.moveTo([p2[0], ucCy - 0.35, 0]);

  // The cos graph on the right.
  const plane = NumberPlane.fromAxesRanges({
    xAxisRange: [0, PI + 0.2, PI / 2],
    yAxisRange: [-1.3, 1.3, 1],
    xLength: 6.5,
    yLength: 3.6,
    fillCanvas: false,
    axisConfig: { includeNumbers: false },
    planeOptions: { gridLines: false },
  });
  plane.shift([3.0, ucCy, 0]);
  plane.plot((x) => Math.cos(x), { xRange: [0, PI, 0.02], color: BLUE_E });

  const g1 = new Dot({ point: plane.coordsToPoint(a1, 0.5), radius: 0.1, color: GREEN_D });
  const g2 = new Dot({ point: plane.coordsToPoint(a2, -0.5), radius: 0.1, color: RED });
  const g1Tex = new Tex(String.raw`\left(\tfrac{\pi}{3},\ \tfrac{1}{2}\right)`, {
    fontSize: 18,
    color: GREEN_D,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  g1Tex.moveTo([plane.coordsToPoint(a1, 0.5)[0] - 0.1, plane.coordsToPoint(a1, 0.5)[1] + 0.5, 0]);
  const g2Tex = new Tex(String.raw`\left(\tfrac{2\pi}{3},\ -\tfrac{1}{2}\right)`, {
    fontSize: 18,
    color: RED,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  g2Tex.moveTo([plane.coordsToPoint(a2, -0.5)[0] + 0.1, plane.coordsToPoint(a2, -0.5)[1] - 0.5, 0]);

  const thetaAxisLabel = new Tex(String.raw`\theta`, { fontSize: 18, bgColor: CONFIG.defaultLabelBgColor });
  thetaAxisLabel.moveTo([plane.coordsToPoint(PI, 0)[0] + 0.4, ucCy - 0.1, 0]);
  const planeTicks: Mobject[] = [thetaAxisLabel];

  const title = new Text("Q2 angles use the same reference angle as Q1 — flip the sign of cos", {
    fontSize: 20,
    bgColor: CONFIG.defaultLabelBgColor,
    maxWidth: 13,
  });
  title.moveTo([0, 3.6, 0]);

  const formula = new Tex(String.raw`\cos\!\left(\tfrac{2\pi}{3}\right) = -\cos\!\left(\tfrac{\pi}{3}\right) = -\tfrac{1}{2}`, {
    fontSize: 24,
    bgColor: CONFIG.defaultLabelBgColor,
  });
  formula.moveTo([0, -3.5, 0]);

  return [
    uc,
    rad1, rad2, v1, v2,
    a1Arc, a1Label, refArc, refLabel,
    d1, d2, x1Label, x2Label,
    plane, g1, g2, g1Tex, g2Tex,
    ...planeTicks,
    title, formula,
  ];
};

export const UNIT_CIRCLE_PANELS: Panel[] = [
  { name: "cos_is_x", title: "Cosine is the x-coordinate on the unit circle", build: cosineIsXCoordinate },
  { name: "unwrap", title: "Unwrap the unit circle into y = cos θ", build: unwrapToCosineGraph },
  { name: "landmark_table", title: "Cosine values at the 5 landmark angles", build: landmarkTable },
  { name: "reference", title: "Reference angles & sign flips between quadrants", build: referenceAngles },
];

export const UNIT_CIRCLE_CASE_STUDY = {
  id: "unit-circle",
  title: "Unit circle → cosine graph",
  theme: "light" as const,
  panels: UNIT_CIRCLE_PANELS,
};
