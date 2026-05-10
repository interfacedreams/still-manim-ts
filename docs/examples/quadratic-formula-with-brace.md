---
name: quadratic-formula-with-brace
category: examples
summary: The quadratic formula with a curly Brace under the b² - 4ac sub-expression labeled "discriminant".
source: ../../examples/quadratic_formula_with_brace.ts
tags: [algebra-1, algebra-2, quadratic-formula, discriminant, annotation, brace, latex]
features_used: [Tex, Brace]
---

# quadratic-formula-with-brace

## Goal

Anchor the meaning of the discriminant inside the quadratic formula. The whole formula renders as one Tex; a transparent copy of `b² − 4ac` is positioned where it appears in the formula and used as the brace target. The brace + "discriminant" label sit just below, visually pulling the sub-expression out without rewriting the formula.

This is the canonical "what does the discriminant tell you?" picture in algebra-1 / algebra-2.

## Features used

- [Tex](../features/tex.md) — full formula in `display: true` for taller, prominent typography; a transparent positional anchor for the discriminant sub-expression.
- [Brace](../features/brace.md) — `Brace.withTexLabel(target, "\\text{discriminant}", DOWN)` builds the brace and label together; color-matched in red.
