import { WHITE, type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { Group } from "../group.js";
import { Polygram } from "../geometry/polygon.js";

export type ParametricFunctionOptions = {
  /** t → (x, y[, z]) point in scene coordinates. */
  function: (t: number) => Vec3;
  underlyingFunction?: (t: number) => number;
  /** Scene-space y bounds; samples outside are dropped (curve gets clipped). */
  yMin: number;
  yMax: number;
  /** [t_min, t_max] or [t_min, t_max, t_step]. */
  tRange?: [number, number] | [number, number, number];
  color?: ManimColor;
  strokeWidth?: number;
};

/**
 * Sampled parametric curve. Built as one or more Polygrams chained via the
 * sampled points. Linear sampling only (no LogBase, no discontinuity handling
 * — port-in-progress).
 */
export class ParametricFunction extends Group {
  function: (t: number) => Vec3;
  underlyingFunction?: (t: number) => number;
  tMin: number;
  tMax: number;
  tStep: number;

  constructor(opts: ParametricFunctionOptions) {
    super();
    this.function = opts.function;
    if (opts.underlyingFunction !== undefined) this.underlyingFunction = opts.underlyingFunction;
    const t = opts.tRange ?? [0, 1, 0.01];
    const tRange3: [number, number, number] = t.length === 2 ? [t[0], t[1], 0.01] : [t[0], t[1], t[2]];
    this.tMin = tRange3[0];
    this.tMax = tRange3[1];
    this.tStep = tRange3[2];

    const color = opts.color ?? WHITE;
    const strokeWidth = opts.strokeWidth ?? undefined;

    const ts: number[] = [];
    for (let v = this.tMin; v < this.tMax - 1e-12; v += this.tStep) ts.push(v);
    ts.push(this.tMax);

    const points: Vec3[] = ts.map((t) => this.function(t));
    const { yMin, yMax } = opts;

    const inRange = (p: Vec3): boolean => p[1] >= yMin && p[1] <= yMax;

    // Linear interpolation between two points to land exactly on a horizontal
    // y-boundary. Used to clip cleanly at yMin/yMax instead of including the
    // first out-of-range sample as a segment endpoint (which "ramps" past).
    const boundaryPoint = (a: Vec3, b: Vec3): Vec3 => {
      const yBoundary = b[1] > yMax || a[1] > yMax ? yMax : yMin;
      const dy = b[1] - a[1];
      // Caller guarantees a and b straddle the boundary, so dy ≠ 0.
      const u = (yBoundary - a[1]) / dy;
      return [a[0] + u * (b[0] - a[0]), yBoundary, a[2] + u * (b[2] - a[2])];
    };

    const emit = (segment: Vec3[]): void => {
      if (segment.length <= 1) return;
      const polyOpts: { vertices: Vec3[]; strokeColor: ManimColor; strokeWidth?: number } = { vertices: segment, strokeColor: color };
      if (strokeWidth !== undefined) polyOpts.strokeWidth = strokeWidth;
      this.add(new Polygram(polyOpts));
    };

    let cur: Vec3[] = [];
    let prev: Vec3 | null = null;
    let prevIn = false;
    for (const p of points) {
      const curIn = inRange(p);
      if (prev === null) {
        if (curIn) cur.push(p);
      } else if (prevIn && curIn) {
        cur.push(p);
      } else if (prevIn && !curIn) {
        cur.push(boundaryPoint(prev, p));
        emit(cur);
        cur = [];
      } else if (!prevIn && curIn) {
        cur = [boundaryPoint(prev, p), p];
      }
      // !prevIn && !curIn → both outside; do nothing.
      prev = p;
      prevIn = curIn;
    }
    emit(cur);
  }
}
