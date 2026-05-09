# still-manim-ts — docs index

The agent reads this file first to decide which feature docs and examples to pull into context.
See `README.md` for the format contract.

## Features

### graphing
- [Axes](features/axes.md) — 2D coordinate system with `plot(fn)`; pair with `NumberPlane` for a grid.
- [NumberPlane](features/number-plane.md) — Axes plus a background grid; `fromAxesRanges` is the usual entry point.
- [NumberLine](features/number-line.md) — 1D number line with ticks/labels/arrow tips; standalone for inequalities.
- [ParametricFunction](features/parametric-function.md) — sampled curve t → (x, y); used internally by `plot`, reach for it directly for parametric curves.

### geometry
- [Line](features/line.md) — segment between two points or two Mobjects; stroke-only.
- [Arrow](features/arrow.md) — Line subclass with directional tip(s); also `Vector(direction)` from origin.
- [Circle](features/circle.md) — Circle (filled by default) and Dot (small filled circle); covers open vs filled markers.
- [Polygon](features/polygon.md) — Polygon family: Polygon, Rectangle, Square, RegularPolygon, Triangle, Polygram.
- _(Arc — coming)_

### text
- [Tex](features/tex.md) — LaTeX math via MathJax; math mode default, `\\text{}` for words.
- [Text](features/text.md) — plain (non-math) text; use for titles, prose, callouts.

### tables
- [Table](features/table.md) — rows × cols grid; cells auto-size to content; highlight/cross/dim by (row, col). Mentions ArrayRow.

### annotations
- [Brace](features/brace.md) — curly bracket alongside a target; pair with Tex via `Brace.withTexLabel`.
- [SurroundingRectangle](features/surrounding-rectangle.md) — outline/backdrop wrapping a target; covers Highlight (translucent fill) and Cross (X mark).
- _(Underline, Pointer — coming)_

### composites
- [RightTriangle](features/right-triangle.md) — labeled right triangle with right-angle marker; one-call setup for Pythagorean / SOHCAHTOA.
- [UnitCircle](features/unit-circle.md) — full unit circle with axes and 16 standard angles; toggle angle vs coordinate labels.
- _(FractionBar, BarChart, Graph, WeightedGraph — coming)_

## Examples

### algebra 1
- [linear-graph-with-slope-triangle](examples/linear-graph-with-slope-triangle.md) — `y = ½x + 1` with rise/run triangle and Tex equation label.
- [inequality-on-number-line](examples/inequality-on-number-line.md) — `x > 2` with open dot and rightward ray.
- [function-table](examples/function-table.md) — x/y table for y = x² with (0, 0) column highlighted.

### algebra 2 / precalc
- [parabola-with-vertex](examples/parabola-with-vertex.md) — `y = (x − 1)² − 4` in vertex form with vertex marker and dashed axis of symmetry.
- [unit-circle-with-angle](examples/unit-circle-with-angle.md) — full unit circle with π/3 highlighted and `(½, √3⁄2)` labeled.
- _(sin-cos-overlay, function-transformation — coming)_

### geometry
- [right-triangle-pythagorean](examples/right-triangle-pythagorean.md) — 3-4-5 right triangle with `a² + b² = c²`.
- _(system-of-lines — coming)_

### annotation
- _(quadratic-formula-with-brace — coming)_
