---
name: linear-graph-with-slope-triangle
category: examples
summary: Plot y = ½x + 1 on a NumberPlane and overlay a rise/run slope triangle with Tex labels.
source: ../../examples/linear_graph_with_slope_triangle.ts
tags: [algebra-1, linear-function, slope, graphing, slope-triangle]
features_used: [Axes, Tex, Line, Dot]
---

# linear-graph-with-slope-triangle

## Goal

Show the slope of a line as a concrete rise/run triangle on a coordinate plane. From `(0, 1)` go right 4 (run) and up 2 (rise) to land back on the line, so slope = 2/4 = ½. The diagram pairs the symbolic equation `y = ½x + 1` with the visual — the standard CPM / Big Ideas way of introducing slope.

## Features used

- [Axes](../features/axes.md) — `NumberPlane.fromAxesRanges` for the gridded plane; `plane.plot(fn)` for the line; `plane.coordsToPoint(x, y)` to place dots and labels at graph coordinates.
- _Line_ — the two legs of the slope triangle.
- _Dot_ — endpoints of the triangle, sitting on the graphed line.
- _Tex_ — `\\text{run} = 4`, `\\text{rise} = 2`, and the equation label.
