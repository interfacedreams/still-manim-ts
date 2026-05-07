import { DOWN, RIGHT } from "../constants.js";
import { BLUE, WHITE, type ManimColor } from "../utils/color.js";
import { Group } from "./group.js";
import { Rectangle } from "./geometry/polygon.js";
import { Tex } from "./text/tex_mobject.js";

export type FractionBarOptions = {
  width?: number;
  height?: number;
  shadeColor?: ManimColor;
  emptyColor?: ManimColor;
  borderColor?: ManimColor;
  /** Show "p/q" Tex label below the bar. */
  showLabel?: boolean;
  fontSize?: number;
};

/**
 * Visualizes a fraction p/q as a horizontal bar split into `q` equal cells,
 * with the first `p` filled. Optional Tex caption "\frac{p}{q}" below.
 */
export class FractionBar extends Group {
  numerator: number;
  denominator: number;
  cells: Rectangle[] = [];
  label: Tex | null = null;

  constructor(p: number, q: number, opts: FractionBarOptions = {}) {
    super();
    if (q <= 0) throw new Error("FractionBar denominator must be > 0");
    if (p < 0 || p > q) throw new Error("FractionBar numerator must be in [0, q]");
    this.numerator = p;
    this.denominator = q;

    const totalW = opts.width ?? 4;
    const h = opts.height ?? 0.6;
    const cellW = totalW / q;
    const shade = opts.shadeColor ?? BLUE;
    const empty = opts.emptyColor ?? null;
    const border = opts.borderColor ?? WHITE;

    let prev: Rectangle | null = null;
    for (let i = 0; i < q; i++) {
      const cell = new Rectangle({
        width: cellW,
        height: h,
        strokeColor: border,
        strokeWidth: 2,
        fillColor: i < p ? shade : (empty ?? WHITE),
        fillOpacity: i < p ? 1 : 0,
      });
      if (prev) cell.nextTo(prev, RIGHT, undefined, 0);
      this.cells.push(cell);
      this.add(cell);
      prev = cell;
    }

    if (opts.showLabel !== false) {
      this.label = new Tex(String.raw`\frac{${p}}{${q}}`, { fontSize: opts.fontSize ?? 32 })
        .nextTo(this, DOWN);
      this.add(this.label);
    }

    this.moveToOrigin();
  }
}
