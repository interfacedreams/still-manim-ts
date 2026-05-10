---
name: function-transformation
category: examples
summary: Parent y = x² and transformed y = (x − 2)² + 3 on the same axes with an Arrow showing the shift from (0, 0) to (2, 3).
source: ../../examples/function_transformation.ts
tags: [algebra-2, transformation, shift, parabola, parent-function, vertex]
features_used: [NumberPlane, Arrow, Tex, Dot]
---

# function-transformation

## Goal

Make the constants in vertex form *visible*. The parent `y = x²` has its vertex at `(0, 0)`; the transformed `y = (x − 2)² + 3` has its vertex at `(2, 3)`. The constants `+2` (right) and `+3` (up) appear directly in the picture as the components of the shift arrow. Drawing the parent in gray and the transformed curve in blue keeps the comparison readable without requiring a legend.

The canonical "right by 2, up by 3" picture for the transformations unit in algebra 2.

## Features used

- [NumberPlane](../features/number-plane.md) — gridded plane; two `plot(fn)` calls for the parent and transformed curves; `coordsToPoint` for vertex placement.
- [Arrow](../features/arrow.md) — shift arrow from old to new vertex; `buff: 0.15` keeps the arrow ends clear of the dots.
- [Tex](../features/tex.md) — `y = x²` (gray) and `y = (x − 2)² + 3` (blue), color-matched to their curves.
- _Dot_ — vertex markers, color-matched.
