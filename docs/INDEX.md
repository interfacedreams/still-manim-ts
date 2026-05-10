# still-manim-ts — docs index

The agent reads this file first to decide which feature docs and examples to pull into context.
See `README.md` for the format contract.

## Features

### graphing
- [Axes](features/axes.md) — 2D coordinate system with `plot(fn)`, `coordsToPoint`, `topLabelPoint`.
- [NumberPlane](features/number-plane.md) — Axes plus a background grid; `fromAxesRanges` is the usual entry point.
- [NumberLine](features/number-line.md) — 1D number line with ticks/labels/arrow tips; standalone for inequalities.
- [ParametricFunction](features/parametric-function.md) — sampled curve t → (x, y) with interpolated y-boundary clip; used internally by `plot`.

### geometry
- [Line](features/line.md) — segment between two points or two Mobjects; stroke-only.
- [Arrow](features/arrow.md) — Line subclass with directional tip(s); also `Vector(direction)` from origin.
- [Arc](features/arc.md) — partial circle; angle markers, sectors, construction arcs.
- [Circle](features/circle.md) — Circle (filled by default) and Dot (small filled circle); covers open vs filled markers.
- [Polygon](features/polygon.md) — Polygon family: Polygon, Rectangle, Square, RegularPolygon, Triangle, Polygram.
- [Angle](features/angle.md) — angle marker at a vertex from three points (vertex + two ray endpoints); auto-picks interior sweep; optional Tex label along the bisector. `Angle.right(...)` for right-angle square markers.

### text
- [Tex](features/tex.md) — LaTeX math via MathJax; math mode default, `\\text{}` for words.
- [Text](features/text.md) — plain (non-math) text; use for titles, prose, callouts.

### tables
- [Table](features/table.md) — rows × cols grid; cells auto-size to content; highlight/cross/dim by (row, col). Mentions ArrayRow.

### annotations
- [Brace](features/brace.md) — curly bracket alongside a target; pair with Tex via `Brace.withTexLabel`.
- [SurroundingRectangle](features/surrounding-rectangle.md) — outline/backdrop wrapping a target; covers Highlight (translucent fill) and Cross (X mark).
- [Underline](features/underline.md) — horizontal Line beneath a target; emphasize answers/key terms.
- [Pointer](features/pointer.md) — leader-line arrow pointing at a target; combine with a label at the tail.

### composites
- [RightTriangle](features/right-triangle.md) — labeled right triangle with right-angle marker; one-call setup for Pythagorean / SOHCAHTOA.
- [UnitCircle](features/unit-circle.md) — full unit circle with axes and 16 standard angles; toggle angle vs coordinate labels.

## Examples

### algebra 1
- [linear-graph-with-slope-triangle](examples/linear-graph-with-slope-triangle.md) — `y = ½x + 1` with rise/run triangle and Tex equation label.
- [inequality-on-number-line](examples/inequality-on-number-line.md) — `x > 2` with open dot and rightward ray.
- [function-table](examples/function-table.md) — x/y table for y = x² with (0, 0) column highlighted.
- [quadratic-foil-method](examples/quadratic-foil-method.md) — FOIL on `(x + 2)(x + 3)` with color-coded steps.

### algebra 2 / precalc
- [parabola-with-vertex](examples/parabola-with-vertex.md) — `y = (x − 1)² − 4` in vertex form with vertex marker.
- [function-transformation](examples/function-transformation.md) — parent `y = x²` and shifted `y = (x − 2)² + 3` with red dashed step lines (right 2, up 3).
- [unit-circle-with-angle](examples/unit-circle-with-angle.md) — full unit circle with π/3 highlighted and `(½, √3⁄2)` labeled.
- [sin-cos-overlay](examples/sin-cos-overlay.md) — `sin x` and `cos x` overlaid over `[-π, π]` with color-matched labels.

### geometry
- [right-triangle-pythagorean](examples/right-triangle-pythagorean.md) — 3-4-5 right triangle with `a² + b² = c²`.
- [triangle-centroid](examples/triangle-centroid.md) — triangle with three medians meeting at the centroid; the formula is the arithmetic mean of the vertex coordinates.

### annotation
- [quadratic-formula-with-brace](examples/quadratic-formula-with-brace.md) — quadratic formula with a Brace under the discriminant labeled "discriminant".
