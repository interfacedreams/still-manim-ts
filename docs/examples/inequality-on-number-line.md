---
name: inequality-on-number-line
category: examples
summary: Show x > 2 on a number line with an open dot at 2 and a rightward ray.
source: ../../examples/inequality_on_number_line.ts
tags: [algebra-1, inequality, number-line, open-dot, ray]
features_used: [NumberLine, Line, Tex]
---

# inequality-on-number-line

## Goal

Visualize the solution set of `x > 2` on the real line. The open circle at `2` signals "2 is *not* included"; the rightward arrow signals the solution extends without bound. Switching to `≥` would just swap the open circle for a filled `Dot`. This is the canonical algebra-1 inequality picture.

## Features used

- [NumberLine](../features/number-line.md) — the axis with ticks and labels; `coordToPoint(2)` and `coordToPoint(5)` give the scene-space endpoints for the dot and the ray.
- [Line](../features/line.md) — used here as `Arrow` (a `Line` subclass) for the rightward ray, since direction matters.
- [Tex](../features/tex.md) — the inequality label `x > 2`, color-matched to the ray.
