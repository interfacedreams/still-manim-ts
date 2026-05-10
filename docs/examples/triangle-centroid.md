---
name: triangle-centroid
category: examples
summary: Triangle with three dashed medians intersecting at the centroid, plus the formula that computes it.
source: ../../examples/triangle_centroid.ts
tags: [geometry, triangle, centroid, median, special-points, mean]
features_used: [NumberPlane, Polygon, Line, Tex, Dot, Axes]
---

# triangle-centroid

## Goal

Show that the **centroid** of a triangle — the point where the three medians meet — is just the arithmetic mean of the vertex coordinates. Triangle ABC with `A(0, 0)`, `B(6, 0)`, `C(3, 6)` has centroid

`G = ((0 + 6 + 3) / 3, (0 + 0 + 6) / 3) = (3, 2)`.

A median is the segment from a vertex to the midpoint of the opposite side; drawing all three reveals they meet at one point, and that point is the centroid. The centroid is also the triangle's "balance point" — if the triangle were a uniform thin sheet, it would balance perfectly on a pin placed at G.

This is the most accessible of the triangle "special points" (centroid, circumcenter, incenter, orthocenter) — all the others need bisectors or perpendiculars; the centroid only needs averages.

No coordinate axes are drawn — the centroid is a geometric property of the triangle, not a graphed function. Vertex coords appear directly in the labels (`A(0, 0)`, `B(6, 0)`, `C(3, 6)`) so the formula's right-hand side can still be verified on the page without needing a grid to read off.

## Features used

- [Polygon](../features/polygon.md) — triangle outline, stroke-only blue.
- [Line](../features/line.md) — three medians as dashed gray segments.
- [Tex](../features/tex.md) — vertex labels with coords, centroid label, and the formula above the triangle. The default backing rect keeps labels readable when they sit near the medians.
- _Dot_ — centroid marker.
