import { CONFIG } from "../config.js";
import { RIGHT } from "../constants.js";
import { RED, YELLOW, type ManimColor } from "../utils/color.js";
import type { Vec3 } from "../utils/vec.js";
import { Group } from "./group.js";
import { Mobject } from "./mobject.js";
import { Cross } from "./composites.js";
import { Highlight } from "./composites.js";
import { Rectangle } from "./geometry/polygon.js";
import { Text, type TextOptions } from "./text/text_mobject.js";

const formatValue = (v: number | string): string => {
  if (typeof v === "string") return v;
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(2)));
};

/** A single cell: rectangle border + centered text. The cell IS the bbox. */
export class ArrayCell extends Group {
  rect: Rectangle;
  label: Text;
  value: number | string;

  constructor(value: number | string, opts: {
    width: number;
    height: number;
    fontSize: number;
    textColor?: ManimColor;
    strokeColor?: ManimColor;
    textOptions?: Omit<TextOptions, "color" | "fontSize">;
  }) {
    super();
    this.value = value;
    this.rect = new Rectangle({
      width: opts.width,
      height: opts.height,
      strokeColor: opts.strokeColor ?? CONFIG.defaultTextColor,
      strokeWidth: 2,
      fillOpacity: 0,
    });
    const textOpts: TextOptions = { ...(opts.textOptions ?? {}), fontSize: opts.fontSize };
    if (opts.textColor) textOpts.color = opts.textColor;
    this.label = new Text(formatValue(value), textOpts);
    this.label.moveTo(this.rect.center);
    this.add(this.rect, this.label);
  }
}

export type ArrayRowOptions = {
  fontSize?: number;
  /** Manim-unit padding around the text inside each cell. */
  xPadding?: number;
  yPadding?: number;
  /** When given, every cell uses this exact width. Otherwise inferred from the widest text. */
  cellWidth?: number;
  cellHeight?: number;
  textColor?: ManimColor;
  strokeColor?: ManimColor;
  textOptions?: Omit<TextOptions, "color" | "fontSize">;
};

/**
 * Horizontal array of boxed cells (a.k.a. tape diagram / bar model).
 *
 * Every cell is the same width; cell borders touch, so the row reads as one
 * subdivided rectangle. Decorations (cross, highlight, dim) target cells by
 * index and can be undone individually.
 *
 * ```ts
 * const row = new ArrayRow([2, 5, 7, 8]);
 * row.cross([0, 3]);
 * row.highlight([1, 2]);
 * canvas.add(row);
 * ```
 */
export class ArrayRow extends Group {
  items: ArrayCell[] = [];
  values: Array<number | string>;

  private crosses: Map<number, Cross> = new Map();
  private highlights: Map<number, Highlight> = new Map();
  private dimmed: Set<number> = new Set();
  private originalOpacities: Map<number, number> = new Map();

  constructor(values: Array<number | string>, opts: ArrayRowOptions = {}) {
    super();
    this.values = values.slice();
    const fontSize = opts.fontSize ?? 28;
    const xPad = opts.xPadding ?? 0.2;
    const yPad = opts.yPadding ?? 0.15;

    // Pre-measure each value with a throwaway Text so the cell width fits the widest entry.
    let maxTextW = 0;
    let maxTextH = 0;
    for (const v of values) {
      const t = new Text(formatValue(v), { fontSize });
      if (t.width > maxTextW) maxTextW = t.width;
      if (t.height > maxTextH) maxTextH = t.height;
    }
    const cellWidth = opts.cellWidth ?? (maxTextW + 2 * xPad);
    const cellHeight = opts.cellHeight ?? (maxTextH + 2 * yPad);

    let prev: ArrayCell | null = null;
    for (let i = 0; i < values.length; i++) {
      const cellOpts: ConstructorParameters<typeof ArrayCell>[1] = {
        width: cellWidth,
        height: cellHeight,
        fontSize,
      };
      if (opts.textColor) cellOpts.textColor = opts.textColor;
      if (opts.strokeColor) cellOpts.strokeColor = opts.strokeColor;
      if (opts.textOptions) cellOpts.textOptions = opts.textOptions;
      const cell = new ArrayCell(values[i]!, cellOpts);
      // Cells share borders — buff = 0 so right edge of prev = left edge of this.
      if (prev) cell.nextTo(prev, RIGHT, undefined, 0);
      this.items.push(cell);
      this.add(cell);
      prev = cell;
    }
    this.moveToOrigin();
  }

  // ---------------------------------------------------------------------------
  // References
  // ---------------------------------------------------------------------------
  /** i-th cell. Negative `i` wraps from the end. */
  at(i: number): ArrayCell {
    const n = this.items.length;
    if (n === 0) throw new Error("ArrayRow is empty");
    const idx = ((i % n) + n) % n;
    return this.items[idx]!;
  }

  /** Inclusive slice for `.nextTo(row.between(1, 2), DOWN)` use cases. */
  between(start: number, end: number): Mobject[] {
    const a = Math.min(start, end);
    const b = Math.max(start, end);
    return this.items.slice(a, b + 1);
  }

  // ---------------------------------------------------------------------------
  // Cross — X mark on a cell
  // ---------------------------------------------------------------------------
  cross(indices: number[], color: ManimColor = RED): this {
    for (const i of indices) {
      if (this.crosses.has(i)) continue;
      const item = this.at(i);
      const x = new Cross({ target: item, color, strokeWidth: 4 });
      this.crosses.set(i, x);
      this.add(x);
    }
    return this;
  }

  uncross(indices: number[]): this {
    for (const i of indices) {
      const x = this.crosses.get(i);
      if (!x) continue;
      this.remove(x);
      this.crosses.delete(i);
    }
    return this;
  }

  // ---------------------------------------------------------------------------
  // Highlight — translucent overlay on a cell
  // ---------------------------------------------------------------------------
  highlight(indices: number[], color: ManimColor = YELLOW): this {
    for (const i of indices) {
      if (this.highlights.has(i)) continue;
      const item = this.at(i);
      const h = new Highlight({ target: item, color, opacity: 0.35, buff: 0 });
      this.highlights.set(i, h);
      // Insert highlights BEHIND text/border so cell content stays readable.
      this.submobjects.unshift(h);
    }
    return this;
  }

  unhighlight(indices: number[]): this {
    for (const i of indices) {
      const h = this.highlights.get(i);
      if (!h) continue;
      this.remove(h);
      this.highlights.delete(i);
    }
    return this;
  }

  // ---------------------------------------------------------------------------
  // Dim — reduce opacity (for "the rest" while focusing on a few)
  // ---------------------------------------------------------------------------
  dim(indices: number[], opacity = 0.3): this {
    for (const i of indices) {
      if (this.dimmed.has(i)) continue;
      const item = this.at(i);
      this.originalOpacities.set(i, item.label.fillOpacity);
      item.label.setOpacity(opacity);
      this.dimmed.add(i);
    }
    return this;
  }

  undim(indices: number[]): this {
    for (const i of indices) {
      if (!this.dimmed.has(i)) continue;
      const item = this.at(i);
      const orig = this.originalOpacities.get(i) ?? 1;
      item.label.setOpacity(orig);
      this.dimmed.delete(i);
      this.originalOpacities.delete(i);
    }
    return this;
  }

  /** Convenience accessors for label placement. */
  topOf(i: number): Vec3 { return this.at(i).top; }
  bottomOf(i: number): Vec3 { return this.at(i).bottom; }
}
