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
  SurroundingRectangle,
  Text,
  Tex,
  ArrayRow,
  Table,
  type CellContent,
  RightTriangle,
  UnitCircle,
  FractionBar,
  BarChart,
  Graph,
  WeightedGraph,
  arrowEdgeFactory,
  Brace,
  Underline,
  Pointer,
  Group,
  BLUE,
  RIGHT,
  LEFT,
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
  surrounding_rect_on_text: () => {
    const t = new Text("important");
    const r = new SurroundingRectangle({ target: t, buff: 0.15, cornerRadius: 0.1 });
    return [t, r];
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

  // ---- Table (rows × cols, mixed string/number/Mobject cells) ----
  table_basic: () => [
    new Table([
      ["x", "2.9", "2.99", "2.999", "3",   "3.001", "3.01", "3.1"],
      ["y", "−10", "−100", "−1000", "DNE", "1000",  "100",  "10"],
    ]),
  ],
  table_vertical: () => [
    new Table([
      ["name", "score", "grade"],
      ["Alice", "92",   "A"],
      ["Bob",   "85",   "B"],
      ["Carol", "78",   "C"],
      ["Dan",   "94",   "A"],
    ]),
  ],
  table_highlighted: () => {
    const t = new Table([
      ["x", "2.9", "2.99", "2.999", "3",   "3.001", "3.01", "3.1"],
      ["y", "−10", "−100", "−1000", "DNE", "1000",  "100",  "10"],
    ]);
    t.highlight([[0, 4], [1, 4]], YELLOW);
    return [t];
  },
  table_with_crosses: () => {
    const t = new Table([
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
    ], { fontSize: 24 });
    t.cross([[0, 0], [1, 2], [2, 4]]);
    return [t];
  },
  table_mixed_content: () => {
    // Tex math + plain text + actual Mobjects in cells.
    const data: CellContent[][] = [
      [new Tex(String.raw`\theta`, { fontSize: 28 }), new Tex(String.raw`\cos\theta`, { fontSize: 28 }), new Text("color", { fontSize: 22 })],
      [new Tex("0", { fontSize: 28 }),                "1",                                              new Dot({ radius: 0.1, color: GREEN })],
      [new Tex(String.raw`\tfrac{\pi}{2}`, { fontSize: 28 }), "0",                                      new Dot({ radius: 0.1, color: YELLOW })],
      [new Tex(String.raw`\pi`, { fontSize: 28 }),    "−1",                                             new Dot({ radius: 0.1, color: GREEN })],
      [new Tex(String.raw`\tfrac{3\pi}{2}`, { fontSize: 28 }), "0",                                     new Dot({ radius: 0.1, color: YELLOW })],
      [new Tex(String.raw`2\pi`, { fontSize: 28 }),   "1",                                              new Dot({ radius: 0.1, color: GREEN })],
    ];
    return [new Table(data, { cellHeight: 0.8 })];
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

  // Six values (decimals, fractions, mixed numbers) on one number line,
  // with a student-misconception inequality marked wrong below it.
  decimal_misconception_on_number_line: () => {
    const nl = new NumberLine({
      xRange: [9, 10, 0.1],
      length: 10,
      includeNumbers: false,
    });
    // Two scale anchors at the endpoints — enough to imply the tick step (0.1)
    // without crowding the line with eleven decimal labels.
    const tick9 = new Dot({ point: nl.coordToPoint(9) });
    const tick10 = new Dot({ point: nl.coordToPoint(10) });
    const scale9 = new Tex("9", { fontSize: 24 }).nextTo(tick9, DOWN);
    const scale10 = new Tex("10", { fontSize: 24 }).nextTo(tick10, DOWN);

    // Above-line labels for most values; 49/5 goes below since it'd otherwise
    // collide with the wider 9 3/4 label sitting next to it.
    const above: Array<[string, number]> = [
      ["9.25", 9.25],
      [String.raw`9\tfrac{1}{2}`, 9.5],
      ["9.61", 9.61],
      [String.raw`9\tfrac{3}{4}`, 9.75],
      ["9.9", 9.9],
    ];
    const markers: Mobject[] = [];
    for (const [tex, val] of above) {
      const dot = new Dot({ point: nl.coordToPoint(val), color: YELLOW });
      const label = new Tex(tex, { fontSize: 28 }).nextTo(dot, UP);
      markers.push(dot, label);
    }
    const dot49 = new Dot({ point: nl.coordToPoint(9.8), color: YELLOW });
    const label49 = new Tex(String.raw`\frac{49}{5}`, { fontSize: 28 }).nextTo(dot49, DOWN);
    markers.push(dot49, label49);

    // Misconception inequality sits below everything, centered under the line.
    const claim = new Tex(String.raw`9.61 < 9.5`, { fontSize: 36, color: RED })
      .nextTo(nl, DOWN);
    claim.shift([0, -0.7, 0]);
    const wrong = new Cross({ size: 0.5, color: RED }).nextTo(claim, LEFT);
    return [nl, scale9, scale10, ...markers, claim, wrong];
  },

  // Same number line, no misconception — instead, demonstrates a "callout"
  // technique: 9 7/8 sits between 9 3/4 and 9.9 (too tight for the normal
  // above-the-dot slot), so the label floats high and an arrow points down
  // to the value on the line.
  decimal_with_callout_on_number_line: () => {
    const nl = new NumberLine({
      xRange: [9, 10, 0.1],
      length: 10,
      includeNumbers: false,
    });
    const tick9 = new Dot({ point: nl.coordToPoint(9) });
    const tick10 = new Dot({ point: nl.coordToPoint(10) });
    const scale9 = new Tex("9", { fontSize: 24 }).nextTo(tick9, DOWN);
    const scale10 = new Tex("10", { fontSize: 24 }).nextTo(tick10, DOWN);

    const above: Array<[string, number]> = [
      ["9.25", 9.25],
      [String.raw`9\tfrac{1}{2}`, 9.5],
      ["9.61", 9.61],
      [String.raw`9\tfrac{3}{4}`, 9.75],
      ["9.9", 9.9],
    ];
    const markers: Mobject[] = [];
    for (const [tex, val] of above) {
      const dot = new Dot({ point: nl.coordToPoint(val), color: YELLOW });
      const label = new Tex(tex, { fontSize: 28 }).nextTo(dot, UP);
      markers.push(dot, label);
    }
    const dot49 = new Dot({ point: nl.coordToPoint(9.8), color: YELLOW });
    const label49 = new Tex(String.raw`\frac{49}{5}`, { fontSize: 28 }).nextTo(dot49, DOWN);
    markers.push(dot49, label49);

    const calloutDot = new Dot({ point: nl.coordToPoint(9.875), color: YELLOW });
    const calloutAt = nl.coordToPoint(9.875);
    const calloutLabel = new Tex(String.raw`9\tfrac{7}{8}`, { fontSize: 28 })
      .shift([calloutAt[0], 1.6, 0]);
    const calloutArrow = new Arrow({ start: calloutLabel, end: calloutDot });

    return [nl, scale9, scale10, ...markers, calloutDot, calloutArrow, calloutLabel];
  },

  // ---- RightTriangle ----
  right_triangle_default: () => [RightTriangle.fromLegs(3, 2)],
  right_triangle_3_4_5: () => [
    RightTriangle.fromLegs(3, 4, { legLabel: "3", altLegLabel: "4", hypLabel: "5" }),
  ],
  right_triangle_pythagorean: () => {
    const tri = RightTriangle.fromLegs(3, 4);
    const eq = new Tex(String.raw`a^2 + b^2 = c^2`, { fontSize: 32, color: YELLOW })
      .nextTo(tri, DOWN);
    return [tri, eq];
  },
  right_triangle_trig: () => {
    const tri = RightTriangle.fromLegs(
      4,
      3,
      { legLabel: String.raw`\text{adj}`, altLegLabel: String.raw`\text{opp}`, hypLabel: String.raw`\text{hyp}` },
    );
    return [tri];
  },

  // ---- UnitCircle ----
  unit_circle_default: () => [new UnitCircle()],
  unit_circle_quadrants: () => [
    new UnitCircle({ angles: [0, PI / 2, PI, (3 * PI) / 2] }),
  ],
  unit_circle_coords: () => [new UnitCircle({ showCoords: true, fontSize: 14 })],

  // ---- FractionBar ----
  fraction_bar_3_5: () => [new FractionBar(3, 5)],
  fraction_bar_1_2: () => [new FractionBar(1, 2)],
  fraction_bar_7_8: () => [new FractionBar(7, 8, { shadeColor: GREEN })],

  // ---- BarChart ----
  bar_chart_basic: () => [new BarChart([4, 7, 3, 8, 2])],
  bar_chart_labeled: () => [
    new BarChart([4, 7, 3, 8, 2], {
      labels: ["A", "B", "C", "D", "E"],
      showValues: true,
    }),
  ],
  bar_chart_colorful: () => [
    new BarChart([4, 7, 3, 8, 2, 6], {
      barColor: (i) => [RED, YELLOW, GREEN, RED, YELLOW, GREEN][i]!,
    }),
  ],

  // ---- Annotations: Brace, Underline, Pointer ----
  brace_under_row: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    const brace = Brace.withLabel(row, "the array", DOWN);
    return [row, brace];
  },
  brace_under_pair: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    row.highlight([1, 2]);
    const inner = new Group();
    inner.add(row.at(1), row.at(2));
    const brace = Brace.withTexLabel(inner, String.raw`\text{middle pair}`, DOWN);
    return [row, brace];
  },
  brace_left_of_circle: () => {
    const c = new Circle({ radius: 0.7 });
    const brace = Brace.withLabel(c, "circle", LEFT);
    return [c, brace];
  },
  underline_text: () => {
    const t = new Text("important", { fontSize: 36 });
    const u = new Underline(t, { color: YELLOW });
    return [t, u];
  },
  underline_cell: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    const u = new Underline(row.at(2), { color: RED, strokeWidth: 4 });
    return [row, u];
  },
  pointer_at_circle: () => {
    const c = new Circle({ radius: 0.6, fillColor: BLUE });
    const labeled = Pointer.withLabel(c, "this is a circle", { approachFrom: DOWN });
    return [c, labeled];
  },
  pointer_at_array_cell: () => {
    const row = new ArrayRow([2, 5, 7, 8]);
    const labeled = Pointer.withLabel(row.at(2), "median candidate", { approachFrom: UP });
    return [row, labeled];
  },

  // Graph scenes (TS-only).
  graph_triangle_default: () => [new Graph()],
  graph_circular_5: () => [
    new Graph({
      vertices: [0, 1, 2, 3, 4],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
      layout: "circular",
      includeVertexLabels: true,
    }),
  ],
  graph_spring_petersen: () => {
    // Petersen graph — a classic 10-vertex 3-regular graph that exercises
    // d3-force enough to be a real layout test.
    const outer: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
    const spokes: Array<[number, number]> = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];
    const inner: Array<[number, number]> = [[5, 7], [7, 9], [9, 6], [6, 8], [8, 5]];
    return [
      new Graph({
        vertices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        edges: [...outer, ...spokes, ...inner],
        layout: "spring",
        layoutConfig: { seed: 42 },
        includeVertexLabels: true,
      }),
    ];
  },
  graph_tree_layout: () => [
    new Graph({
      vertices: ["a", "b", "c", "d", "e", "f", "g"],
      edges: [
        ["a", "b"],
        ["a", "c"],
        ["b", "d"],
        ["b", "e"],
        ["c", "f"],
        ["c", "g"],
      ],
      layout: "tree",
      rootVertex: "a",
      includeVertexLabels: true,
    }),
  ],
  graph_directed_arrows: () => [
    new Graph({
      vertices: [0, 1, 2, 3],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
      layout: "circular",
      edgeFactory: arrowEdgeFactory,
      includeVertexLabels: true,
    }),
  ],
  weighted_graph_4: () => [
    new WeightedGraph({
      vertices: [0, 1, 2, 3],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
      layout: "circular",
      includeVertexLabels: true,
      edgeLabels: [
        [[0, 1], 5],
        [[1, 2], 3],
        [[2, 3], 7],
        [[3, 0], 2],
        [[0, 2], 4],
      ],
    }),
  ],
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
