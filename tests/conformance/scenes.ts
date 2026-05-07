/**
 * Shared scene registry for conformance tests + outputs/ rendering.
 *
 * Each entry must have a matching builder in
 * still-manim/scripts/dump_fixtures.py:SCENES (same key).
 */
import {
  Polygon,
  Rectangle,
  RegularPolygon,
  Square,
  Triangle,
  Arc,
  Circle,
  Dot,
  Line,
  Arrow,
  NumberLine,
  Axes,
  NumberPlane,
  Cross,
  Highlight,
  Text,
  Tex,
  ArrayRow,
  RIGHT,
  DOWN,
  UP,
  UR,
  RED,
  GREEN,
  YELLOW,
  PI,
  type Mobject,
} from "../../src/index.js";

export const SCENES: Record<string, () => Mobject[]> = {
  square_default: () => [new Square({ sideLength: 2 })],
  square_3: () => [new Square({ sideLength: 3 })],
  rectangle_4_2: () => [new Rectangle({ width: 4, height: 2 })],
  triangle_default: () => [new Triangle()],
  triangle_1_5: () => [new Triangle({ sideLength: 1.5 })],
  regular_pentagon: () => [new RegularPolygon({ n: 5, radius: 1 })],
  regular_hexagon: () => [new RegularPolygon({ n: 6, radius: 1 })],
  polygon_custom_diamond: () => [
    new Polygon({ vertices: [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]] }),
  ],
  next_to_right: () => {
    const sq = new Square({ sideLength: 2 });
    const tri = new Triangle({ sideLength: 1.5, fillColor: RED }).nextTo(sq, RIGHT);
    return [sq, tri];
  },
  next_to_up: () => {
    const sq = new Square({ sideLength: 2 });
    const tri = new Triangle({ sideLength: 1.5, fillColor: RED }).nextTo(sq, UP);
    return [sq, tri];
  },
  next_to_corner_ur: () => {
    const sq = new Square({ sideLength: 2 });
    const tri = new Triangle({ sideLength: 1, fillColor: GREEN }).nextTo(sq, UR);
    return [sq, tri];
  },
  shifted_square: () => [new Square({ sideLength: 2 }).shift([1.5, -0.5, 0])],
  scaled_triangle: () => [new Triangle({ sideLength: 2 }).scale(0.5)],
  rotated_square: () => [new Square({ sideLength: 2 }).rotate(PI / 6)],
  three_squares_row: () => {
    const a = new Square({ sideLength: 1 });
    const b = new Square({ sideLength: 1, fillColor: RED }).nextTo(a, RIGHT);
    const c = new Square({ sideLength: 1, fillColor: GREEN }).nextTo(b, RIGHT);
    return [a, b, c];
  },
  circle_default: () => [new Circle()],
  circle_radius_2: () => [new Circle({ radius: 2 })],
  dot_origin: () => [new Dot()],
  dot_at_point: () => [new Dot({ point: [1, -0.5, 0] })],
  arc_quarter: () => [new Arc()],
  arc_half: () => [new Arc({ angle: PI })],
  arc_offset: () => [new Arc({ radius: 1.5, startAngle: PI / 4, angle: PI / 2, arcCenter: [1, 0, 0] })],
  line_default: () => [new Line()],
  line_diagonal: () => [new Line({ start: [-1, -1, 0], end: [1, 1, 0] })],
  line_to_mobject: () => {
    const sq = new Square({ sideLength: 1 });
    const line = new Line({ start: sq, end: [3, 0, 0] });
    return [sq, line];
  },
  arrow_default: () => [new Arrow()],
  arrow_diagonal: () => [new Arrow({ start: [-1, -1, 0], end: [2, 1, 0] })],
  circle_next_to_square: () => {
    const sq = new Square({ sideLength: 2 });
    const c = new Circle({ radius: 0.6, fillColor: RED }).nextTo(sq, RIGHT);
    return [sq, c];
  },

  // Visual-only scenes (Groups built from already-tested primitives).
  number_line: () => [new NumberLine({ xRange: [-3, 3, 1] })],
  axes: () => [new Axes()],
  number_plane: () => [
    NumberPlane.fromAxesRanges({
      xAxisRange: [-5, 5, 1],
      yAxisRange: [-3, 3, 1],
      fillCanvas: true,
    }),
  ],
  plot_sine: () => {
    // Integer x-range — sin's period is ~6.28 so [-4, 4] shows >1 full period
    // and keeps tick math clean. (No need for π in NumberLine.)
    const plane = NumberPlane.fromAxesRanges({
      xAxisRange: [-4, 4, 1],
      yAxisRange: [-2, 2, 1],
      fillCanvas: true,
    });
    plane.plot((x) => Math.sin(x), { color: RED });
    return [plane];
  },
  plot_sine_cosine: () => {
    const plane = NumberPlane.fromAxesRanges({
      xAxisRange: [-4, 4, 1],
      yAxisRange: [-2, 2, 1],
      fillCanvas: true,
    });
    plane.plot((x) => Math.sin(x), { color: RED });
    plane.plot((x) => Math.cos(x), { color: YELLOW });
    return [plane];
  },
  plot_parabola: () => {
    const plane = NumberPlane.fromAxesRanges({
      xAxisRange: [-2, 2, 1],
      yAxisRange: [-1, 5, 1],
      fillCanvas: true,
    });
    plane.plot((x) => x * x, { color: GREEN });
    return [plane];
  },

  // Composite instruction primitives (purely TS — no Python equivalent fixture yet).
  cross_on_square: () => {
    const sq = new Square({ sideLength: 1.5 });
    const x = new Cross({ target: sq });
    return [sq, x];
  },
  highlight_on_circle: () => {
    const c = new Circle({ radius: 0.7 });
    const h = new Highlight({ target: c });
    return [c, h];
  },

  // Text scenes.
  text_hello: () => [new Text("Hello, world!")],
  text_below_square: () => {
    const sq = new Square({ sideLength: 2 });
    const label = new Text("a square").nextTo(sq, DOWN);
    return [sq, label];
  },
  text_labeled_circle: () => {
    const ci = new Circle({ radius: 0.7, fillColor: RED });
    const label = new Text("CIRCLE").nextTo(ci, UP);
    return [ci, label];
  },
  text_multiline: () => [
    new Text("This is a longer line of text that should wrap onto multiple lines.", { maxWidth: 4.0 }),
  ],
  text_three_in_row: () => {
    const a = new Text("alpha");
    const b = new Text("beta").nextTo(a, RIGHT);
    const c = new Text("gamma").nextTo(b, RIGHT);
    return [a, b, c];
  },

  // ---- ArrayRow scenes (boxed cells / tape diagrams) ----
  array_row_basic: () => [new ArrayRow([2, 5, 7, 8])],
  array_row_letters: () => [new ArrayRow(["a", "b", "c", "d", "e"])],
  array_row_crossed: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    row.cross([0, 3]);
    return [row];
  },
  array_row_highlighted: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    row.highlight([1, 2]);
    return [row];
  },
  // The user's canonical "median of even-length list" lesson.
  median_lesson: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    row.cross([0, 3]);
    row.highlight([1, 2]);
    const note = new Text("median = (5+7)/2 = 6", { color: RED }).nextTo(
      row.between(1, 2),
      DOWN,
    );
    return [row, note];
  },

  // ---- Tex (LaTeX math via MathJax) ----
  tex_fraction: () => [new Tex(String.raw`\frac{a + b}{2}`, { fontSize: 48 })],
  tex_pythagorean: () => [new Tex(String.raw`a^2 + b^2 = c^2`, { fontSize: 48 })],
  tex_quadratic: () => [
    new Tex(String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, { fontSize: 40 }),
  ],
  tex_sum: () => [
    new Tex(String.raw`\sum_{i=1}^{n} i = \frac{n(n+1)}{2}`, { fontSize: 48, display: true }),
  ],
  // The median lesson again — but with a real fraction label this time.
  median_lesson_tex: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    row.cross([0, 3]);
    row.highlight([1, 2]);
    const formula = new Tex(String.raw`\frac{5 + 7}{2} = 6`, { fontSize: 32 }).nextTo(
      row.between(1, 2),
      DOWN,
    );
    return [row, formula];
  },
};

export const SCENE_NAMES = Object.keys(SCENES).sort();

/** A curated subset for visual review — one representative of each primitive. */
export const SHOWCASE: string[] = [
  "next_to_right",
  "three_squares_row",
  "polygon_custom_diamond",
  "circle_default",
  "arc_quarter",
  "arrow_diagonal",
  "number_line",
  "number_plane",
  "plot_sine_cosine",
  "plot_parabola",
  "cross_on_square",
  "highlight_on_circle",
];
