---
name: parabola-with-vertex
category: examples
summary: Parabola y = (x − 1)² − 4 in vertex form with the vertex marked, axis of symmetry as a dashed line, and equation labeled.
source: ../../examples/parabola_with_vertex.ts
tags: [algebra-1, algebra-2, parabola, vertex, vertex-form, axis-of-symmetry, quadratic]
features_used: [NumberPlane, Line, Tex]
---

# parabola-with-vertex

## Goal

Anchor the meaning of vertex form. The curve `y = (x − 1)² − 4` has its vertex at `(1, −4)`; the constants in the formula are visible directly in the picture — `+1` shifts the vertex right, `−4` shifts it down. The dashed axis of symmetry at `x = 1` makes the parabola's mirror symmetry obvious.

This is the bridge picture between "I can solve a quadratic" (algebra 1) and "I can graph a quadratic and read its features off the formula" (algebra 2).

## Features used

- [NumberPlane](../features/number-plane.md) — gridded plane over `x ∈ [-3, 5]`, `y ∈ [-5, 4]`; `plane.plot(fn)` renders the parabola; `coordsToPoint` places the vertex dot, the dashed axis, and the equation label in graph space.
- [Line](../features/line.md) — `dashed: true` for the axis of symmetry. Color-matched to the vertex marker.
- [Tex](../features/tex.md) — vertex coordinate label `(1, -4)` and the equation `y = (x - 1)^2 - 4`.
