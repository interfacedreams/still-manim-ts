---
name: right-triangle-pythagorean
category: examples
summary: A 3-4-5 right triangle with the Pythagorean equation a² + b² = c² below it.
source: ../../examples/right_triangle_pythagorean.ts
tags: [geometry, right-triangle, pythagorean, labeled-sides]
features_used: [RightTriangle, Tex]
---

# right-triangle-pythagorean

## Goal

Anchor the Pythagorean theorem in a concrete labeled triangle. The 3-4-5 triple is the canonical first example: legs of length 3 and 4 produce a hypotenuse of exactly 5, so the equation `a² + b² = c²` resolves to `9 + 16 = 25`. Sides are labeled with their numeric lengths rather than the abstract `a`, `b`, `c` so the connection to the equation is one step away — the formula sits right below.

## Features used

- [RightTriangle](../features/right-triangle.md) — single-call composite that draws the triangle, the right-angle marker, and the three side labels in one go.
- [Tex](../features/tex.md) — `a^2 + b^2 = c^2` rendered in the same color as the triangle.
