---
name: quadratic-foil-method
category: examples
summary: FOIL method on (x + 2)(x + 3) — each step color-coded, with a brief caption and the combined result.
source: ../../examples/quadratic_foil_method.ts
tags: [algebra-1, foil, binomial, multiplication, expansion, quadratic]
features_used: [Tex, Text]
---

# quadratic-foil-method

## Goal

Walk through FOIL — the standard method for multiplying two binomials — on the canonical example `(x + 2)(x + 3)`. Each step is color-coded so a student can match the letter to the operation it stands for: First (red), Outer (blue), Inner (green), Last (orange). The two intermediate `x`-terms (`3x` and `2x`) are explicitly written before being combined into `5x`, so the "combine like terms" step is visible rather than implicit.

This is the foundational picture for expanding binomials in algebra 1 — the prerequisite for factoring, completing the square, and the quadratic formula.

## Features used

- [Tex](../features/tex.md) — every math expression: the original product, each FOIL line, the sum, and the simplified result. Color-matched to the FOIL step it represents.
- [Text](../features/text.md) — one prose caption explaining what FOIL stands for, since "F: …" alone might not parse for a first-time reader.
