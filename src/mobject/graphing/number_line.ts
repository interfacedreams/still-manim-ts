import { CONFIG } from "../../config.js";
import { DOWN, LEFT, PI, RIGHT, UP } from "../../constants.js";
import type { ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { Group } from "../group.js";
import { VMobject } from "../vmobject.js";
import { Arrow } from "../geometry/arrow.js";
import { Line } from "../geometry/line.js";
import { Text } from "../text/text_mobject.js";
import { Tex } from "../text/tex_mobject.js";

export type NumberLineOptions = {
  /** [start, end] inclusive, optionally [start, end, step]. */
  xRange?: [number, number] | [number, number, number];
  length?: number;
  isHorizontal?: boolean;
  includeTicks?: boolean;
  includeOriginTick?: boolean;
  includeNumbers?: boolean;
  /** Font size for number labels (default 16). */
  numbersFontSize?: number;
  tickSize?: number;
  includeArrowTips?: boolean;
  startArrowTip?: Arrow | null;
  endArrowTip?: Arrow | null;
  strokeWidth?: number;
  color?: ManimColor;
  /**
   * Override the default numeric label per tick. Receives the tick value;
   * return a `Tex` / `Text` to use it as the label, or `undefined` to fall
   * back to the default numeric `Text`. Useful for rendering π-multiples,
   * fractions, or any non-numeric labeling.
   */
  customLabel?: (value: number) => Tex | Text | undefined;
};

/** Format a number for axis labels: integers stay clean, others rounded to 2 dp with trailing zeros stripped. */
const formatNumber = (n: number): string => {
  if (Number.isInteger(n)) return String(n);
  const rounded = Number(n.toFixed(2));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

/**
 * Bare number line: a Line, optional tick marks, optional arrow tips.
 * Numeric labels are deliberately omitted (Text isn't ported yet).
 */
export class NumberLine extends Group {
  line: Line;
  xMin: number;
  xMax: number;
  xStep: number;
  includeOriginTick: boolean;
  tickSize: number;
  ticks: Group | null = null;
  labels: Group | null = null;
  startTipArrow: Arrow | null = null;
  endTipArrow: Arrow | null = null;

  constructor(opts: NumberLineOptions = {}) {
    super();
    const {
      xRange = [-2, 2, 1] as [number, number, number],
      length = CONFIG.fw,
      isHorizontal = true,
      includeTicks = true,
      includeOriginTick = true,
      includeNumbers = true,
      numbersFontSize = 16,
      tickSize = 0.1,
      includeArrowTips = true,
      strokeWidth = 2.0,
      color = CONFIG.defaultTextColor,
    } = opts;

    const range3: [number, number, number] = xRange.length === 2
      ? [xRange[0], xRange[1], 1]
      : [xRange[0], xRange[1], xRange[2]];
    const [xMin, xMax, xStep] = range3;
    if (xMax <= xMin) throw new Error("`xMax` must be > `xMin`");

    this.line = new Line({ start: [xMin, 0, 0], end: [xMax, 0, 0] });
    this.add(this.line);
    this.xMin = xMin;
    this.xMax = xMax;
    this.xStep = xStep;
    this.includeOriginTick = includeOriginTick;
    this.tickSize = tickSize;

    let startArrow = opts.startArrowTip ?? null;
    let endArrow = opts.endArrowTip ?? null;
    if (includeArrowTips) {
      if (startArrow === null) startArrow = new Arrow({ start: [-0.5, 0, 0], end: [0.5, 0, 0] });
      if (endArrow === null) endArrow = new Arrow({ start: [-0.5, 0, 0], end: [0.5, 0, 0] });
    }
    this.startTipArrow = startArrow;
    this.endTipArrow = endArrow;

    let justLineLength = length;
    if (this.startTipArrow) justLineLength -= this.startTipArrow.length;
    if (this.endTipArrow) justLineLength -= this.endTipArrow.length;
    this.stretch(justLineLength / this.line.length, 0);

    if (this.startTipArrow) {
      this.startTipArrow.rotate(PI);
      const ls = this.line.start;
      this.startTipArrow.moveTo(ls).alignTo(ls, RIGHT);
      this.add(this.startTipArrow);
    }
    if (this.endTipArrow) {
      const le = this.line.end;
      this.endTipArrow.moveTo(le).alignTo(le, LEFT);
      this.add(this.endTipArrow);
    }
    if (includeTicks) {
      this.ticks = this.generateTicks();
      this.add(this.ticks);
    }
    if (includeNumbers && this.ticks) {
      this.labels = this.generateLabels(numbersFontSize, opts.customLabel);
      this.add(this.labels);
    }
    if (!isHorizontal) this.rotate(PI / 2);
    this.moveToOrigin();

    // Apply consistent style to all VMobject members at the end.
    for (const m of this.getFamily()) m.setColor(color, false);
    for (const m of this.getFamily()) {
      if (m instanceof VMobject) m.setStroke(undefined, strokeWidth);
    }
  }

  get stepSize(): number {
    return this.line.length / (this.xMax - this.xMin);
  }

  get length(): number {
    let l = this.line.length;
    if (this.startTipArrow) l += this.startTipArrow.length;
    if (this.endTipArrow) l += this.endTipArrow.length;
    return l;
  }

  generateTicks(): Group {
    const ticks = new Group();
    for (const x of this.getTickRange()) {
      const tick = new Line({ start: [0, -this.tickSize, 0], end: [0, this.tickSize, 0] });
      tick.moveTo(this.coordToPoint(x));
      ticks.add(tick);
    }
    return ticks;
  }

  generateLabels(fontSize: number, customLabel?: (value: number) => Tex | Text | undefined): Group {
    const labels = new Group();
    if (!this.ticks) return labels;
    const ticksList = this.ticks.submobjects;
    const range = this.getTickRange();
    for (let i = 0; i < range.length && i < ticksList.length; i++) {
      const tick = ticksList[i]!;
      const v = range[i]!;
      // Backing rect so the label stays readable when other geometry (curves,
      // grid, neighboring ticks) crowds it. The default Text path sets bgColor
      // at construction; for custom labels, we apply the same default after
      // the fact unless the caller already set one explicitly.
      const label = customLabel?.(v)
        ?? new Text(formatNumber(v), { fontSize, bgColor: CONFIG.defaultLabelBgColor });
      if (label.bgColor === null) label.bgColor = CONFIG.defaultLabelBgColor;
      label.nextTo(tick, DOWN, undefined, 0);
      labels.add(label);
    }
    return labels;
  }

  getTickRange(): number[] {
    // Anchor ticks to multiples of xStep so they land at clean values (e.g. integer
    // positions when xStep=1) and align with the grid — regardless of where
    // xMin/xMax fall. Diverges from Python smanim, whose tick generator
    // produces asymmetric, off-by-fraction ticks for non-integer ranges.
    const out: number[] = [];
    const start = Math.ceil(this.xMin / this.xStep - 1e-9) * this.xStep;
    for (let v = start; v <= this.xMax + 1e-9; v += this.xStep) {
      if (!this.includeOriginTick && Math.abs(v) < 1e-9) continue;
      out.push(v);
    }
    return out;
  }

  /** Coord on the number line → point in scene. Extrapolates past endpoints. */
  coordToPoint(value: number): Vec3 {
    const start = this.line.start;
    const dir = this.line.direction;
    const u = (value - this.xMin) * this.stepSize;
    return [start[0] + dir[0] * u, start[1] + dir[1] * u, start[2] + dir[2] * u];
  }
}
