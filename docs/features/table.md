---
name: Table
category: tables
summary: Rows × cols grid built from data; cells auto-size to content. Highlight, cross out, or dim cells by (row, col).
tags: [table, grid, function-table, comparison, data, highlight]
related: [ArrayRow, Highlight, Cross, Tex, Text]
---

# Table

## Description

A `rows × cols` grid where each cell is a `TableCell` (a bordered rectangle plus its content). Columns auto-size to their widest cell; all cells share borders so the grid reads as one subdivided rectangle.

Cell content can be any of:

- `string` — wrapped in `Text` automatically.
- `number` — formatted (integers stay clean, floats rounded to 2 dp) and wrapped in `Text`.
- `Mobject` — placed verbatim. Use this to put `Tex` (formulas), nested groups, or shapes inside cells.

## When to use

- Function tables (x → y, x → f(x)).
- Comparing two relationships side-by-side (e.g. linear vs exponential growth, two recipes, two strategies).
- Step-by-step sorting / algorithm visualizations (cross/highlight cells to show progress).
- Header + data layouts where shared borders matter visually.
- **Use `ArrayRow` instead** for a single row of items (e.g. one-dimensional sequence).
- **Use a plain `Group` of `Tex`** when you need column alignment but no borders or shared cell boxes.

## Constructor parameters

`new Table(data: CellContent[][], opts?: TableOptions)` — `data` is positional and required.

- `data` — a non-empty `rows × cols` rectangular array. All rows must have the same length (throws otherwise). Each entry is `string | number | Mobject`.
- `fontSize` (`number`, default `24`) — used for auto-built `Text` cells (ignored for `Mobject` content).
- `xPadding`, `yPadding` (default `0.2`, `0.15`) — interior padding inside each cell, scene units.
- `cellHeight` (`number`) — force a uniform cell height. Default = tallest content + `2 * yPadding`.
- `uniformCellWidth` (`number`) — force the same width on every column. Default = per-column auto-sizing.
- `textColor` (`ManimColor`) — overrides the default text color for auto-built cells.
- `strokeColor` (`ManimColor`) — cell border color (default = text color).
- `textOptions` — extra `TextOptions` for auto-built cells (excluding `color` and `fontSize`, which are already controlled).

## Indexing

All accessors use **0-indexed** `(row, col)`. The header (if you have one) is row 0.

- `at(row, col): TableCell` — single cell. Negative indices wrap from the end.
- `row(i): TableCell[]` — entire row.
- `col(j): TableCell[]` — entire column.

## Decorations

All four return `this` for chaining and are reversible.

- `highlight(refs: CellRef[], color = YELLOW): this` — translucent fill behind the cell content. Inserted at the back so text stays readable.
- `unhighlight(refs)`.
- `cross(refs: CellRef[], color = RED): this` — draws a red "X" over each cell.
- `uncross(refs)`.
- `dim(refs, opacity = 0.3): this` — fades cell content (the text/Mobject inside, not the border). Useful for "earlier rows are no longer relevant".
- `undim(refs)`.

`CellRef` is `[row, col]` — a tuple of two numbers.

## Minimal examples

Plain function table:

```ts
import { canvas, Table } from "still-manim-ts";

const t = new Table([
  ["x", -2, -1, 0, 1, 2],
  ["y", 4, 1, 0, 1, 4],
]);
canvas.add(t);
```

Tex header (formula in a cell):

```ts
import { Tex } from "still-manim-ts";

const yHeader = new Tex("y = x^2");
const t = new Table([
  ["x", -2, -1, 0, 1, 2],
  [yHeader, 4, 1, 0, 1, 4],
]);
canvas.add(t);
```

Highlighting and crossing:

```ts
t.highlight([[0, 3]]);            // x = 0 column header cell
t.cross([[1, 1]]);                // strike out (-2, 4) entry
```

## Common pitfalls

- **`data` is positional.** `new Table({ data: [...] })` won't compile.
- **Indexing is 0-indexed *including the header row*.** A 5-data-row table with a header has 6 rows (0 through 5). Easy to be off-by-one when picking cells to highlight.
- **Mixed Mobject + primitive in the same column is fine, but column width comes from the widest item.** A long Tex header may make every cell in that column wide. If that looks bad, set `uniformCellWidth` explicitly.
- **`unhighlight` only removes highlights you added with `highlight`.** Manually-added overlays are untracked.
- **Default cell border color follows the theme** (text color). On a light background the borders are black; on dark, white. Override with `strokeColor` if you want a contrasting grid (e.g. light gray dividers on a white canvas).

## ArrayRow (sibling)

A 1D version: a single row of bordered cells. Same content rules and decoration API. Use it for sequences (sort step visualizations, indexed lists). Same module: `ArrayRow`, `ArrayCell`.
