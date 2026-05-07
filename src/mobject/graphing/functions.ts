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

    let cur: Vec3[] = [];
    for (const p of points) {
      if (p[1] >= opts.yMin && p[1] <= opts.yMax) {
        cur.push(p);
      } else {
        cur.push(p);
        if (cur.length > 1) {
          const polyOpts: { vertices: Vec3[]; strokeColor: ManimColor; strokeWidth?: number } = { vertices: cur, strokeColor: color };
          if (strokeWidth !== undefined) polyOpts.strokeWidth = strokeWidth;
          this.add(new Polygram(polyOpts));
        }
        cur = [];
      }
    }
    if (cur.length > 1) {
      const polyOpts: { vertices: Vec3[]; strokeColor: ManimColor; strokeWidth?: number } = { vertices: cur, strokeColor: color };
      if (strokeWidth !== undefined) polyOpts.strokeWidth = strokeWidth;
      this.add(new Polygram(polyOpts));
    }
  }
}
