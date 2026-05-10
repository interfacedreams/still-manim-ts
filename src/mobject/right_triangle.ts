import { CONFIG } from "../config.js";
import { DOWN, LEFT } from "../constants.js";
import type { ManimColor } from "../utils/color.js";
import type { Vec3 } from "../utils/vec.js";
import { Group } from "./group.js";
import { Line } from "./geometry/line.js";
import { Polygon } from "./geometry/polygon.js";
import { Tex } from "./text/tex_mobject.js";
import { Angle } from "./angle.js";

export type RightTriangleOptions = {
  /** Show the small square at the right angle. */
  rightAngleMarker?: boolean;
  /** Side-length labels (default: 'a', 'b', 'c'). Leave a slot blank to skip. */
  legLabel?: string | null;       // horizontal leg
  altLegLabel?: string | null;    // vertical leg
  hypLabel?: string | null;       // hypotenuse
  fontSize?: number;
  color?: ManimColor;
  strokeWidth?: number;
  /** Distance (manim units) from each side to its label. */
  labelBuff?: number;
};

/**
 * Right triangle with the right angle at the lower-left, horizontal leg
 * length `a` and vertical leg length `b`. Hypotenuse goes from upper-left
 * vertex to lower-right vertex (i.e. (0,b) → (a,0)).
 *
 * `RightTriangle.fromLegs(3, 4)` ≈ a labeled 3-4-5 triangle.
 */
export class RightTriangle extends Group {
  legLength: number;
  altLegLength: number;
  /** Lower-left (right angle), lower-right, upper-left. */
  vertices: [Vec3, Vec3, Vec3];

  hLeg: Line;
  vLeg: Line;
  hyp: Line;
  outline: Polygon;
  rightAngleMarker: Polygon | null = null;
  labels: { leg?: Tex; altLeg?: Tex; hyp?: Tex } = {};

  constructor(legA: number, legB: number, opts: RightTriangleOptions = {}) {
    super();
    this.legLength = legA;
    this.altLegLength = legB;
    const color = opts.color ?? CONFIG.defaultTextColor;
    const sw = opts.strokeWidth ?? 4;

    const corner: Vec3 = [0, 0, 0];
    const right: Vec3 = [legA, 0, 0];
    const top: Vec3 = [0, legB, 0];
    this.vertices = [corner, right, top];

    // Borders. We use both a Polygon for the filled outline-style hit-area AND
    // explicit Lines for each side so labels can attach to specific edges.
    this.outline = new Polygon({ vertices: [corner, right, top], strokeColor: color, strokeWidth: sw, fillOpacity: 0 });
    this.add(this.outline);
    this.hLeg = new Line({ start: corner, end: right, color, strokeWidth: sw });
    this.vLeg = new Line({ start: corner, end: top, color, strokeWidth: sw });
    this.hyp = new Line({ start: right, end: top, color, strokeWidth: sw });
    // Don't add the lines as separate submobs — outline already draws them. We
    // keep them as fields so callers can access midpoints / directions.

    if (opts.rightAngleMarker !== false) this.addRightAngleMarker(color, sw);

    const fontSize = opts.fontSize ?? 28;
    const buff = opts.labelBuff ?? 0.25;
    const legText = opts.legLabel === null ? null : (opts.legLabel ?? "a");
    const altText = opts.altLegLabel === null ? null : (opts.altLegLabel ?? "b");
    const hypText = opts.hypLabel === null ? null : (opts.hypLabel ?? "c");

    if (legText !== null) {
      const t = new Tex(legText, { fontSize, bgColor: CONFIG.defaultLabelBgColor });
      t.nextTo(this.hLeg.midpoint, DOWN, undefined, buff);
      this.labels.leg = t;
      this.add(t);
    }
    if (altText !== null) {
      const t = new Tex(altText, { fontSize, bgColor: CONFIG.defaultLabelBgColor });
      t.nextTo(this.vLeg.midpoint, LEFT, undefined, buff);
      this.labels.altLeg = t;
      this.add(t);
    }
    if (hypText !== null) {
      const t = new Tex(hypText, { fontSize, bgColor: CONFIG.defaultLabelBgColor });
      // Place the hypotenuse label outward (up-and-right) from its midpoint.
      const mid = this.hyp.midpoint;
      t.moveTo([mid[0] + buff, mid[1] + buff, 0]);
      this.labels.hyp = t;
      this.add(t);
    }

    this.moveToOrigin();
  }

  /** Convenience factory matching the brief. Equivalent to `new RightTriangle(a, b)`. */
  static fromLegs(a: number, b: number, opts?: RightTriangleOptions): RightTriangle {
    return new RightTriangle(a, b, opts);
  }

  private addRightAngleMarker(color: ManimColor, strokeWidth: number): void {
    // Size ~12% of the shorter leg, capped to keep it from dominating tiny
    // triangles.
    const size = Math.min(this.legLength, this.altLegLength) * 0.12;
    const sq = Angle.right(this.vertices[0], this.vertices[1], this.vertices[2], {
      size,
      color,
      strokeWidth: Math.max(1, strokeWidth - 2),
    });
    this.rightAngleMarker = sq;
    this.add(sq);
  }
}
