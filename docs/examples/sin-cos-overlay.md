---
name: sin-cos-overlay
category: examples
summary: sin x and cos x on the same axes over [-π, π]; color-matched curve labels show the phase relationship.
source: ../../examples/sin_cos_overlay.ts
tags: [precalc, trigonometry, sine, cosine, phase, overlay]
features_used: [NumberPlane, Tex]
---

# sin-cos-overlay

## Goal

Show that `cos x` is `sin x` shifted by `π/2`. Plotting both on the same axes makes the phase relationship visible — at every x, the two curves are offset by a quarter-period, and they cross at the four "diagonal" angles (`±π/4`, `±3π/4`).

This is the canonical "introduction to phase" picture in pre-calc.

## Features used

- [NumberPlane](../features/number-plane.md) — symmetric x-range `[-π, π]` with tick step `π/2` so the standard angles fall on tick marks; `plot(fn)` for each curve.
- [Tex](../features/tex.md) — `y = \\sin x` (blue) and `y = \\cos x` (red), each placed in graph space at a clear spot below/above the overlap.
