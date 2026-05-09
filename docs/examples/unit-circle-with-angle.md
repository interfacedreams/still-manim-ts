---
name: unit-circle-with-angle
category: examples
summary: Default unit circle with the angle π/3 highlighted in red — radial line, marker dot, and (cosθ, sinθ) coordinate label.
source: ../../examples/unit_circle_with_angle.ts
tags: [precalc, trigonometry, unit-circle, reference-angle, radians, sin-cos]
features_used: [UnitCircle, Line, Tex]
---

# unit-circle-with-angle

## Goal

Show how a single reference angle on the unit circle maps to a `(cos θ, sin θ)` coordinate. The full 16-angle layout sits in the background as visual context — the same picture students memorize — while the red radial line and dot focus attention on `θ = π/3`. The coordinate `(½, √3⁄2)` reads off the highlighted point and connects the angle to the trig values.

This is the canonical "where do `sin` and `cos` come from?" picture in algebra-2 / precalc.

## Features used

- [UnitCircle](../features/unit-circle.md) — default composite with axes and 16 standard angles already drawn; we reach into `markers` to recolor the π/3 dot.
- [Line](../features/line.md) — radial line from origin to the highlighted point.
- [Tex](../features/tex.md) — the coordinate label `(½, √3⁄2)` placed beyond the circle along the radial direction.
