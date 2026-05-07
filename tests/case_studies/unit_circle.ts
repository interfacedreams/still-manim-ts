/**
 * "Unit circle → cosine graph" case study — 4 panels showing how cos comes
 * out of the unit circle, the landmark points, and reference-angle reflection.
 */
import {
  Arc,
  Arrow,
  Circle,
  DOWN,
  Dot,
  Group,
  Line,
  NumberPlane,
  ORIGIN,
  PI,
  RIGHT,
  TAU,
  Table,
  type CellContent,
  Tex,
  Text,
  UP,
  UnitCircle,
  RED,
  GREEN,
  BLUE,
  YELLOW,
  ORANGE,
  PURPLE,
  PINK,
  WHITE,
  BLACK,
  GRAY,
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

  const uc = new UnitCircle({ radius: r, angles: [], showLabels: false });

  const point = new Dot({ point: [px, py, 0], radius: 0.1, color: WHITE });
  const radial = new Line({
    start: ORIGIN,
    end: [px, py, 0],
    color: WHITE,
    strokeWidth: 2,
  });

  // Vertical projection from P down to x-axis = cos(θ) segment.
  const vert = new Line({
    start: [px, py, 0],
    end: [px, 0, 0],
    color: GRAY,
    strokeWidth: 2,
    dashed: true,
  });
  // Horizontal projection from P to y-axis = sin(θ) segment.
  const horiz = new Line({
    start: [px, py, 0],
    end: [0, py, 0],
    color: GRAY,
    strokeWidth: 2,
    dashed: true,
  });
  // Highlighted segments: x-axis chunk (cos) in green, y-axis chunk (sin) faint orange.
  const cosSeg = new Line({
    start: ORIGIN,
    end: [px, 0, 0],
    color: GREEN,
    strokeWidth: 6,
  });
  const sinSeg = new Line({
    start: ORIGIN,
    end: [0, py, 0],
    color: ORANGE,
    strokeWidth: 6,
  });

  // Angle arc.
  const angleArc = new Arc({
    radius: 0.5,
    startAngle: 0,
    angle: theta,
    defaultStrokeColor: YELLOW,
  });
  const thetaLabel = new Tex(String.raw`\theta`, { fontSize: 28, color: YELLOW, bgColor: BLACK });
  thetaLabel.moveTo([0.75 * Math.cos(theta / 2), 0.75 * Math.sin(theta / 2), 0]);

  // Label the cos segment ("cos θ = 1/2") below the x-axis.
  const cosLabel = new Tex(String.raw`\cos\theta = \tfrac{1}{2}`, {
    fontSize: 28,
    color: GREEN,
    bgColor: BLACK,
  });
  cosLabel.moveTo([px / 2, -0.45, 0]);

  // Label the sin segment ("sin θ = √3/2") to the left of the y-axis.
  const sinLabel = new Tex(String.raw`\sin\theta = \tfrac{\sqrt{3}}{2}`, {
    fontSize: 22,
    color: ORANGE,
    bgColor: BLACK,
  });
  sinLabel.moveTo([-1.3, py / 2, 0]);

  // Point label (cos θ, sin θ).
  const pLabel = new Tex(String.raw`(\cos\theta,\ \sin\theta)`, {
    fontSize: 22,
    bgColor: BLACK,
  });
  pLabel.moveTo([px + 1.6, py + 0.3, 0]);
  const pArrow = new Arrow({
    start: [pLabel.left[0] - 0.1, pLabel.left[1], 0],
    end: [px + 0.12, py + 0.05, 0],
    color: WHITE,
    strokeWidth: 1.5,
    tipLength: 0.12,
    tipWidth: 0.12,
  });

  const title = new Text("cos θ is the x-coordinate · sin θ is the y-coordinate", {
    fontSize: 22,
    color: YELLOW,
    bgColor: BLACK,
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

  const uc = new UnitCircle({ radius: r, angles: [], showLabels: false });
  uc.shift([ucCx, ucCy, 0]);

  // Cosine graph: spans θ ∈ [0, 2π], y ∈ [-1.4, 1.4].
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
  plane.plot((x) => Math.cos(x), { xRange: [0, 2 * PI, 0.02], color: BLUE });

  // Pick a handful of angles to mark on both sides with matching colors.
  const samples: Array<{ angle: number; color: ReturnType<typeof Object> }> = [
    { angle: 0, color: RED },
    { angle: PI / 3, color: ORANGE },
    { angle: PI / 2, color: YELLOW },
    { angle: (2 * PI) / 3, color: GREEN },
    { angle: PI, color: BLUE },
    { angle: (4 * PI) / 3, color: PURPLE },
    { angle: (3 * PI) / 2, color: PINK },
    { angle: (5 * PI) / 3, color: ORANGE },
  ];

  const dots: Mobject[] = [];
  const projections: Mobject[] = [];
  for (const { angle, color } of samples) {
    const ucDot = new Dot({
      point: [ucCx + r * Math.cos(angle), ucCy + r * Math.sin(angle), 0],
      radius: 0.08,
      color: color as never,
    });
    const cosVal = Math.cos(angle);
    const graphPt = plane.coordsToPoint(angle, cosVal);
    const graphDot = new Dot({ point: graphPt, radius: 0.08, color: color as never });
    dots.push(ucDot, graphDot);

    // Light dashed connector showing "the x-coord on the circle becomes the
    // height on the graph" — drop from circle point to its x-projection on the
    // circle's horizontal diameter, then carry that height across to the graph.
    const ucProjection: Vec3 = [ucCx + r * Math.cos(angle), ucCy, 0];
    projections.push(
      new Line({
        start: [ucCx + r * Math.cos(angle), ucCy + r * Math.sin(angle), 0],
        end: ucProjection,
        color: color as never,
        strokeWidth: 1,
        dashed: true,
      }),
    );
  }

  const title = new Text(
    "As you sweep around the unit circle, the x-coordinate traces y = cos θ",
    { fontSize: 20, color: YELLOW, bgColor: BLACK, maxWidth: 13 },
  );
  title.moveTo([0, 3.4, 0]);

  // Axis labels on the graph.
  const thetaAxisLabel = new Tex(String.raw`\theta`, { fontSize: 22, bgColor: BLACK });
  thetaAxisLabel.moveTo([plane.coordsToPoint(2 * PI, 0)[0] + 0.35, ucCy - 0.1, 0]);
  const yAxisLabel = new Tex(String.raw`\cos\theta`, { fontSize: 22, color: BLUE, bgColor: BLACK });
  yAxisLabel.moveTo([plane.coordsToPoint(0, 0)[0] - 0.7, plane.coordsToPoint(0, 1.4)[1], 0]);

  // π / 2π tick labels under the x-axis.
  const xTickLabels: Array<[number, string]> = [
    [PI / 2, String.raw`\tfrac{\pi}{2}`],
    [PI, String.raw`\pi`],
    [(3 * PI) / 2, String.raw`\tfrac{3\pi}{2}`],
    [2 * PI, String.raw`2\pi`],
  ];
  const tickTex: Mobject[] = xTickLabels.map(([x, latex]) => {
    const t = new Tex(latex, { fontSize: 18, bgColor: BLACK });
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
  plane.plot((x) => Math.cos(x), { xRange: [0, 2 * PI, 0.02], color: BLUE });

  // The 5 quadrant landmarks: (0,1), (π/2,0), (π,−1), (3π/2,0), (2π,1).
  const landmarks: Array<{ x: number; y: number; label: string; missed: boolean; offset: Vec3 }> = [
    { x: 0, y: 1, label: String.raw`(0,\ 1)`, missed: false, offset: [0.55, 0.5, 0] },
    { x: PI / 2, y: 0, label: String.raw`\left(\tfrac{\pi}{2},\ 0\right)`, missed: true, offset: [0, 0.7, 0] },
    { x: PI, y: -1, label: String.raw`(\pi,\ -1)`, missed: false, offset: [0, -0.6, 0] },
    { x: (3 * PI) / 2, y: 0, label: String.raw`\left(\tfrac{3\pi}{2},\ 0\right)`, missed: true, offset: [0, 0.7, 0] },
    { x: 2 * PI, y: 1, label: String.raw`(2\pi,\ 1)`, missed: false, offset: [-0.5, 0.5, 0] },
  ];

  const dotsAndLabels: Mobject[] = [];
  for (const { x, y, label, missed, offset } of landmarks) {
    const color = missed ? YELLOW : RED;
    const dot = new Dot({ point: plane.coordsToPoint(x, y), radius: 0.11, color });
    const tex = new Tex(label, { fontSize: 22, color, bgColor: BLACK });
    tex.moveTo([
      plane.coordsToPoint(x, y)[0] + offset[0],
      plane.coordsToPoint(x, y)[1] + offset[1],
      0,
    ]);
    dotsAndLabels.push(dot, tex);
  }

  const title = new Text("5 landmark points — students often miss cos(π/2) = 0", {
    fontSize: 22,
    color: YELLOW,
    bgColor: BLACK,
    maxWidth: 13,
  });
  title.moveTo([0, 3.5, 0]);

  // Caption explaining what to memorize.
  const caption = new Text(
    "cosine starts at 1, drops to 0 at π/2, hits −1 at π, climbs back through 0 at 3π/2, returns to 1 at 2π",
    { fontSize: 18, bgColor: BLACK, maxWidth: 13 },
  );
  caption.moveTo([0, -3.55, 0]);

  return [plane, ...dotsAndLabels, title, caption];
};

// --- 3.5 Table of cos values at landmark angles (mixed-content table) ------
const landmarkTable = (): Mobject[] => {
  // Mix Tex math, plain numbers, and a tiny visual marker in cells — Table
  // accepts any Mobject as a cell, not just strings.
  const greenDot = (): Mobject => new Dot({ radius: 0.08, color: GREEN });
  const yellowDot = (): Mobject => new Dot({ radius: 0.08, color: YELLOW });

  const headerTheta = new Tex(String.raw`\theta`, { fontSize: 32 });
  const headerCos = new Tex(String.raw`\cos\theta`, { fontSize: 32 });
  const zero = new Tex("0", { fontSize: 32 });
  const piHalf = new Tex(String.raw`\tfrac{\pi}{2}`, { fontSize: 32 });
  const pi = new Tex(String.raw`\pi`, { fontSize: 32 });
  const threePiHalf = new Tex(String.raw`\tfrac{3\pi}{2}`, { fontSize: 32 });
  const twoPi = new Tex(String.raw`2\pi`, { fontSize: 32 });

  const data: Array<Array<CellContent>> = [
    [headerTheta, headerCos, "marker"],
    [zero,        "1",       greenDot()],
    [piHalf,      "0",       yellowDot()],
    [pi,          "−1",      greenDot()],
    [threePiHalf, "0",       yellowDot()],
    [twoPi,       "1",       greenDot()],
  ];
  // The third column header is just a placeholder string — replace with text.
  data[0]![2] = new Text("on graph", { fontSize: 22 });

  const t = new Table(data, { fontSize: 28, cellHeight: 0.85 });
  // Highlight the rows where students often miss cos = 0.
  t.highlight([[2, 0], [2, 1], [2, 2], [4, 0], [4, 1], [4, 2]], YELLOW);

  const title = new Text("Five landmark cos values — yellow rows are the easy-to-miss zeros", {
    fontSize: 22, color: YELLOW, bgColor: BLACK, maxWidth: 13,
  });
  title.moveTo([0, 3.5, 0]);

  return [title, t];
};

// --- 4. Reference angles: why cos(2π/3) = -cos(π/3) ------------------------
const referenceAngles = (): Mobject[] => {
  // Unit circle on the left showing two angles that share a reference angle of
  // π/3, plus the cos graph on the right with both points marked symmetrically
  // above/below the θ-axis.
  const r = 1.6;
  const ucCx = -4.6;
  const ucCy = 0;
  const a1 = PI / 3;
  const a2 = (2 * PI) / 3;

  const uc = new UnitCircle({ radius: r, angles: [], showLabels: false });
  uc.shift([ucCx, ucCy, 0]);

  const p1: Vec3 = [ucCx + r * Math.cos(a1), ucCy + r * Math.sin(a1), 0];
  const p2: Vec3 = [ucCx + r * Math.cos(a2), ucCy + r * Math.sin(a2), 0];

  // Radii.
  const rad1 = new Line({ start: [ucCx, ucCy, 0], end: p1, color: GREEN, strokeWidth: 2 });
  const rad2 = new Line({ start: [ucCx, ucCy, 0], end: p2, color: RED, strokeWidth: 2 });

  // Verticals from each point down to x-axis (these segments are the |cos|).
  const v1 = new Line({
    start: p1,
    end: [p1[0], ucCy, 0],
    color: GREEN,
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

  // Reference angle for a2: angle from the negative x-axis up to p2 = π - 2π/3 = π/3.
  // Draw a small arc at the unit circle center between the negative x-axis and the radius to p2.
  const refArc = new Arc({
    radius: 0.45,
    startAngle: a2,
    angle: PI - a2,
    arcCenter: [ucCx, ucCy, 0],
    defaultStrokeColor: YELLOW,
  });
  const refLabel = new Tex(String.raw`\tfrac{\pi}{3}`, {
    fontSize: 20,
    color: YELLOW,
    bgColor: BLACK,
  });
  refLabel.moveTo([ucCx + 0.7 * Math.cos((a2 + PI) / 2), ucCy + 0.7 * Math.sin((a2 + PI) / 2), 0]);

  // The original π/3 arc in Q1.
  const a1Arc = new Arc({
    radius: 0.45,
    startAngle: 0,
    angle: a1,
    arcCenter: [ucCx, ucCy, 0],
    defaultStrokeColor: YELLOW,
  });
  const a1Label = new Tex(String.raw`\tfrac{\pi}{3}`, {
    fontSize: 20,
    color: YELLOW,
    bgColor: BLACK,
  });
  a1Label.moveTo([ucCx + 0.7 * Math.cos(a1 / 2), ucCy + 0.7 * Math.sin(a1 / 2), 0]);

  // Dots.
  const d1 = new Dot({ point: p1, radius: 0.09, color: GREEN });
  const d2 = new Dot({ point: p2, radius: 0.09, color: RED });

  // Annotation: x-coordinates 1/2 and -1/2 on the x-axis below the projections.
  const x1Label = new Tex(String.raw`\tfrac{1}{2}`, { fontSize: 18, color: GREEN, bgColor: BLACK });
  x1Label.moveTo([p1[0], ucCy - 0.35, 0]);
  const x2Label = new Tex(String.raw`-\tfrac{1}{2}`, { fontSize: 18, color: RED, bgColor: BLACK });
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
  plane.plot((x) => Math.cos(x), { xRange: [0, PI, 0.02], color: BLUE });

  const g1 = new Dot({ point: plane.coordsToPoint(a1, 0.5), radius: 0.1, color: GREEN });
  const g2 = new Dot({ point: plane.coordsToPoint(a2, -0.5), radius: 0.1, color: RED });
  const g1Tex = new Tex(String.raw`\left(\tfrac{\pi}{3},\ \tfrac{1}{2}\right)`, {
    fontSize: 18,
    color: GREEN,
    bgColor: BLACK,
  });
  g1Tex.moveTo([plane.coordsToPoint(a1, 0.5)[0] - 0.1, plane.coordsToPoint(a1, 0.5)[1] + 0.5, 0]);
  const g2Tex = new Tex(String.raw`\left(\tfrac{2\pi}{3},\ -\tfrac{1}{2}\right)`, {
    fontSize: 18,
    color: RED,
    bgColor: BLACK,
  });
  g2Tex.moveTo([plane.coordsToPoint(a2, -0.5)[0] + 0.1, plane.coordsToPoint(a2, -0.5)[1] - 0.5, 0]);

  // θ label on the right end of the x-axis (dots themselves show π/3 and 2π/3).
  const thetaAxisLabel = new Tex(String.raw`\theta`, { fontSize: 18, bgColor: BLACK });
  thetaAxisLabel.moveTo([plane.coordsToPoint(PI, 0)[0] + 0.4, ucCy - 0.1, 0]);
  const planeTicks: Mobject[] = [thetaAxisLabel];

  const title = new Text("Q2 angles use the same reference angle as Q1 — flip the sign of cos", {
    fontSize: 20,
    color: YELLOW,
    bgColor: BLACK,
    maxWidth: 13,
  });
  title.moveTo([0, 3.6, 0]);

  const formula = new Tex(String.raw`\cos\!\left(\tfrac{2\pi}{3}\right) = -\cos\!\left(\tfrac{\pi}{3}\right) = -\tfrac{1}{2}`, {
    fontSize: 24,
    bgColor: BLACK,
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
  panels: UNIT_CIRCLE_PANELS,
};
