import { CONFIG } from "../config.js";
import { DOWN, RIGHT } from "../constants.js";
import { BLUE, type ManimColor } from "../utils/color.js";
import { Group } from "./group.js";
import { Line } from "./geometry/line.js";
import { Rectangle } from "./geometry/polygon.js";
import { Text } from "./text/text_mobject.js";

export type BarChartOptions = {
  /** Optional category names below each bar. */
  labels?: readonly string[];
  /** Total chart width / max-bar height in manim units. */
  width?: number;
  height?: number;
  /** Manim-unit gap between adjacent bars. */
  gap?: number;
  barColor?: ManimColor | ((i: number) => ManimColor);
  axisColor?: ManimColor;
  fontSize?: number;
  /** Show numeric value above each bar. */
  showValues?: boolean;
};

/**
 * Vertical bar chart. Heights are scaled so the max value reaches `height`.
 * Optional category labels below; optional value labels above each bar.
 *
 * ```ts
 * const chart = new BarChart([4, 7, 3, 8, 2], { labels: ["A","B","C","D","E"] });
 * ```
 */
export class BarChart extends Group {
  values: readonly number[];
  bars: Rectangle[] = [];
  labels: Text[] = [];
  valueLabels: Text[] = [];
  axis: Line;

  constructor(values: readonly number[], opts: BarChartOptions = {}) {
    super();
    this.values = values.slice();
    if (values.length === 0) throw new Error("BarChart needs at least one value");

    const totalW = opts.width ?? 5;
    const maxH = opts.height ?? 3;
    const gap = opts.gap ?? 0.1;
    const fontSize = opts.fontSize ?? 18;
    const max = Math.max(...values, 1e-9);
    const barW = (totalW - gap * (values.length - 1)) / values.length;
    const barColorFn = typeof opts.barColor === "function"
      ? opts.barColor
      : (() => (opts.barColor as ManimColor | undefined) ?? BLUE);

    // Axis (baseline below bars).
    this.axis = new Line({
      start: [-totalW / 2, 0, 0],
      end: [totalW / 2, 0, 0],
      color: opts.axisColor ?? CONFIG.defaultTextColor,
      strokeWidth: 2,
    });
    this.add(this.axis);

    let prev: Rectangle | null = null;
    for (let i = 0; i < values.length; i++) {
      const v = values[i]!;
      const h = (Math.max(v, 0) / max) * maxH;
      const bar = new Rectangle({
        width: barW,
        height: Math.max(h, 1e-3),
        fillColor: barColorFn(i),
        fillOpacity: 1,
        strokeColor: opts.axisColor ?? CONFIG.defaultTextColor,
        strokeWidth: 1,
      });
      // Anchor bottom at y=0.
      const x = -totalW / 2 + barW / 2 + i * (barW + gap);
      bar.setPosition([x, h / 2, 0]);
      this.bars.push(bar);
      this.add(bar);
      prev = bar;

      if (opts.labels && opts.labels[i]) {
        const lbl = new Text(opts.labels[i]!, { fontSize }).nextTo(bar, DOWN, undefined, 0.1);
        this.labels.push(lbl);
        this.add(lbl);
      }
      if (opts.showValues) {
        const num = Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)));
        const vl = new Text(num, { fontSize: fontSize - 2 }).nextTo(bar, [0, 1, 0], undefined, 0.05);
        this.valueLabels.push(vl);
        this.add(vl);
      }
    }

    this.moveToOrigin();
  }
}
