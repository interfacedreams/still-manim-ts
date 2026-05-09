---
name: Tex
category: text
summary: LaTeX math expression rendered to SVG via MathJax. Math mode is the default — wrap words in \text{}.
tags: [text, latex, math, label, tex]
related: [Text, SurroundingRectangle]
---

# Tex

## Description

A LaTeX math expression rendered through MathJax and embedded into the canvas as paths. The default render mode is **inline math** (no `$…$` needed) — the string is interpreted as math directly.

## When to use

- Any equation, formula, fraction, exponent, square root, or Greek letter (`y = mx + b`, `\\frac{1}{2}`, `x^2`, `\\sqrt{a^2 + b^2}`, `\\theta`).
- Labels that mix math and words: wrap the words in `\\text{...}` (e.g. `\\text{slope} = \\frac{2}{4}`).
- Annotations on a graph that should match math typography.
- **Use `Text` instead** for plain prose ("Find x", "Step 1") — Tex's MathJax pass adds latency and italicizes letters as variables.

## Constructor parameters

`new Tex(latex: string, opts?: TexOptions)` — `latex` is required and non-empty.

- `latex` (positional, `string`) — LaTeX source. Remember to escape backslashes in TS strings: `"\\frac{1}{2}"`, not `"\frac{1}{2}"`.
- `fontSize` (`number`, default = `CONFIG.defaultTextFontSize` ≈ 20) — visual scale. Bump to 22–28 for headline equations, drop to 16–18 for inline labels.
- `color` (`ManimColor`, default = `CONFIG.defaultTextColor`) — fill color. In light theme that's `BLACK`; in dark, `WHITE`. Override to color-match a graphed object.
- `display` (`boolean`, default `false`) — `true` switches to LaTeX **display style** (block math): taller fractions, larger operators, full-size limits. Use for centerpiece equations.
- `opacity` (`number`, default `1.0`).
- `bgColor`, `bgOpacity`, `bgPadding`, `bgRadius` — optional rounded backing rect behind the formula. Useful when the label sits on top of a grid or curve and would otherwise be unreadable.
- `position` (`Vec3`, default `UL`) — upper-left anchor in scene coords. Usually you'll position later with `.moveTo()` / `.nextTo()` instead of setting this.
- `startAngle` (`number`, radians) — initial rotation.
- `zIndex` (`number`, default `1`) — Tex defaults to `z=1` so it draws on top of `z=0` geometry.

## Methods

Inherited from `TransformableMobject` / `Mobject`:

- `.moveTo(targetOrPoint)` — recenter on a Mobject or a `Vec3`. Common pattern: `.moveTo(plane.coordsToPoint(x, y))`.
- `.nextTo(target, direction, alignedEdge?, buff?)` — place adjacent to another Mobject. Example: `.nextTo(line, DOWN, undefined, 0.15)` (the `undefined` skips the optional `alignedEdge`).
- `.shift(vec)`, `.scale(factor)`, `.rotate(radians)`.

## Minimal example

```ts
import { canvas, Tex, BLUE_E } from "still-manim-ts";

const eq = new Tex("y = \\tfrac{1}{2}x + 1", { color: BLUE_E, fontSize: 22 });
canvas.add(eq);
```

## Common pitfalls

- **Backslash escaping.** TS string literals consume one `\` — `"\frac"` is broken, `"\\frac"` is correct. Template literals (`` ` ``) have the same rule.
- **Math mode auto-italicizes letters.** `Tex("speed")` renders as `s·p·e·e·d` (each letter a variable). Use `Tex("\\text{speed}")` or switch to `Text`.
- **Whitespace in math is ignored.** Use `\\;`, `\\,`, or `\\quad` to add explicit spacing.
- **Fractions:** `\\frac{a}{b}` is full-size, `\\tfrac{a}{b}` is text-style (smaller, fits inline labels). Prefer `\\tfrac` for short coefficients like `\\tfrac{1}{2}x`.
- **`.nextTo` 3rd argument is `alignedEdge`, not `buff`.** Pass `undefined` for `alignedEdge` if you only want to set `buff`: `.nextTo(target, DOWN, undefined, 0.15)`.
- **Backing rect on busy graphs.** If a Tex label crosses gridlines or a curve, set `bgColor: WHITE` (or theme bg color) with `bgOpacity: 0.65` so the label stays readable.
