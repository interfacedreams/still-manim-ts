import { DOWN, RIGHT } from "../constants.js";
import { RED, WHITE, YELLOW, type ManimColor } from "../utils/color.js";
import { Group } from "./group.js";
import { Mobject } from "./mobject.js";
import { Cross, Highlight } from "./composites.js";
import { Rectangle } from "./geometry/polygon.js";
import { Text, type TextOptions } from "./text/text_mobject.js";

const formatValue = (v: number | string): string => {
  if (typeof v === "string") return v;
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(2)));
};

/** Anything you can drop in a cell: a primitive that we'll wrap in Text, or an existing Mobject. */
export type CellContent = number | string | Mobject;

/**
 * A single table cell — bordered rect containing centered content. The content
 * is either an auto-built Text (when the cell value is a string/number) or any
 * Mobject the caller passes directly.
 */
export class TableCell extends Group {
  rect: Rectangle;
  /** The Text label, if the cell was built from a string/number. */
  label: Text | null = null;
  /** Whatever sits inside the cell (Text or user-supplied Mobject). */
  content: Mobject;
  value: CellContent;

  constructor(value: CellContent, opts: {
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
      strokeColor: opts.strokeColor ?? WHITE,
      strokeWidth: 2,
      fillOpacity: 0,
    });
    if (value instanceof Mobject) {
      this.content = value;
    } else {
      const tOpts: TextOptions = { ...(opts.textOptions ?? {}), fontSize: opts.fontSize };
      if (opts.textColor) tOpts.color = opts.textColor;
      this.label = new Text(formatValue(value), tOpts);
      this.content = this.label;
    }
    this.content.moveTo(this.rect.center);
    this.add(this.rect, this.content);
  }
}

export type TableOptions = {
  fontSize?: number;
  /** Text padding inside each cell (manim units). */
  xPadding?: number;
  yPadding?: number;
  /** Force a uniform cell width across all columns. Otherwise per-column. */
  uniformCellWidth?: number;
  cellHeight?: number;
  textColor?: ManimColor;
  strokeColor?: ManimColor;
  textOptions?: Omit<TextOptions, "color" | "fontSize">;
};

export type CellRef = readonly [row: number, col: number];

/**
 * Rows × cols grid. Each column auto-sizes to its widest cell content.
 * All cells share borders, so the grid reads as one subdivided rectangle.
 *
 * ```ts
 * const t = new Table([
 *   ["x", "2.9", "2.99", "2.999", "3",   "3.001", "3.01", "3.1"],
 *   ["y", "−10", "−100", "−1000", "DNE", "1000",  "100",  "10"],
 * ]);
 * t.highlight([[0, 4], [1, 4]]);
 * ```
 */
export class Table extends Group {
  /** `cells[row][col]` → TableCell. */
  cells: TableCell[][] = [];
  rowCount: number;
  colCount: number;

  private crosses: Map<string, Cross> = new Map();
  private highlights: Map<string, Highlight> = new Map();
  private dimmed: Map<string, number> = new Map(); // key → original opacity

  constructor(data: Array<Array<CellContent>>, opts: TableOptions = {}) {
    super();
    if (data.length === 0) throw new Error("Table needs at least one row");
    const cols = data[0]!.length;
    if (data.some((r) => r.length !== cols)) {
      throw new Error("Table rows must all have the same number of columns");
    }
    this.rowCount = data.length;
    this.colCount = cols;
    const fontSize = opts.fontSize ?? 24;
    const xPad = opts.xPadding ?? 0.2;
    const yPad = opts.yPadding ?? 0.15;

    // Per-column width: widest cell content in the column (Mobject's own width
    // for mobjects, measured Text width for strings/numbers).
    const colWidths: number[] = new Array(cols).fill(0);
    let maxContentH = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < data.length; r++) {
        const v = data[r]![c]!;
        let w = 0, h = 0;
        if (v instanceof Mobject) {
          w = v.width; h = v.height;
        } else {
          const t = new Text(formatValue(v), { fontSize });
          w = t.width; h = t.height;
        }
        if (w > colWidths[c]!) colWidths[c] = w;
        if (h > maxContentH) maxContentH = h;
      }
    }
    const cellHeight = opts.cellHeight ?? (maxContentH + 2 * yPad);
    const cellWidths = opts.uniformCellWidth !== undefined
      ? new Array(cols).fill(opts.uniformCellWidth)
      : colWidths.map((w) => w + 2 * xPad);

    // Build cells. Lay out left→right within a row, then stack rows top→down.
    let prevRow: TableCell | null = null;
    for (let r = 0; r < data.length; r++) {
      const rowCells: TableCell[] = [];
      let prevCell: TableCell | null = null;
      for (let c = 0; c < cols; c++) {
        const cellOpts: ConstructorParameters<typeof TableCell>[1] = {
          width: cellWidths[c]!,
          height: cellHeight,
          fontSize,
        };
        if (opts.textColor) cellOpts.textColor = opts.textColor;
        if (opts.strokeColor) cellOpts.strokeColor = opts.strokeColor;
        if (opts.textOptions) cellOpts.textOptions = opts.textOptions;
        const cell = new TableCell(data[r]![c]!, cellOpts);
        if (prevCell) cell.nextTo(prevCell, RIGHT, undefined, 0);
        if (c === 0 && prevRow) cell.nextTo(prevRow, DOWN, undefined, 0);
        rowCells.push(cell);
        this.add(cell);
        prevCell = cell;
      }
      this.cells.push(rowCells);
      prevRow = rowCells[0]!;
    }

    this.moveToOrigin();
  }

  // ---------------------------------------------------------------------------
  // References
  // ---------------------------------------------------------------------------
  /** Cell at (row, col). Negative indices wrap from the end. */
  at(row: number, col: number): TableCell {
    const r = ((row % this.rowCount) + this.rowCount) % this.rowCount;
    const c = ((col % this.colCount) + this.colCount) % this.colCount;
    return this.cells[r]![c]!;
  }

  /** All cells in row `i`. */
  row(i: number): TableCell[] {
    const r = ((i % this.rowCount) + this.rowCount) % this.rowCount;
    return [...this.cells[r]!];
  }

  /** All cells in column `j`. */
  col(j: number): TableCell[] {
    const c = ((j % this.colCount) + this.colCount) % this.colCount;
    return this.cells.map((row) => row[c]!);
  }

  // ---------------------------------------------------------------------------
  // Decorations
  // ---------------------------------------------------------------------------
  cross(refs: CellRef[], color: ManimColor = RED): this {
    for (const [r, c] of refs) {
      const key = `${r},${c}`;
      if (this.crosses.has(key)) continue;
      const cell = this.at(r, c);
      const x = new Cross({ target: cell, color, strokeWidth: 4 });
      this.crosses.set(key, x);
      this.add(x);
    }
    return this;
  }

  uncross(refs: CellRef[]): this {
    for (const [r, c] of refs) {
      const key = `${r},${c}`;
      const x = this.crosses.get(key);
      if (!x) continue;
      this.remove(x);
      this.crosses.delete(key);
    }
    return this;
  }

  highlight(refs: CellRef[], color: ManimColor = YELLOW): this {
    for (const [r, c] of refs) {
      const key = `${r},${c}`;
      if (this.highlights.has(key)) continue;
      const cell = this.at(r, c);
      const h = new Highlight({ target: cell, color, opacity: 0.35, buff: 0 });
      this.highlights.set(key, h);
      // Insert behind text/border so cell content stays readable.
      this.submobjects.unshift(h);
    }
    return this;
  }

  unhighlight(refs: CellRef[]): this {
    for (const [r, c] of refs) {
      const key = `${r},${c}`;
      const h = this.highlights.get(key);
      if (!h) continue;
      this.remove(h);
      this.highlights.delete(key);
    }
    return this;
  }

  dim(refs: CellRef[], opacity = 0.3): this {
    for (const [r, c] of refs) {
      const key = `${r},${c}`;
      if (this.dimmed.has(key)) continue;
      const cell = this.at(r, c);
      const target = cell.label ?? cell.content;
      // Save original opacity for non-Text content too (best effort: try fillOpacity).
      const orig = (target as { fillOpacity?: number }).fillOpacity ?? 1;
      this.dimmed.set(key, orig);
      target.setOpacity(opacity);
    }
    return this;
  }

  undim(refs: CellRef[]): this {
    for (const [r, c] of refs) {
      const key = `${r},${c}`;
      const orig = this.dimmed.get(key);
      if (orig === undefined) continue;
      const cell = this.at(r, c);
      (cell.label ?? cell.content).setOpacity(orig);
      this.dimmed.delete(key);
    }
    return this;
  }
}
