---
name: Text
category: text
summary: Plain (non-math) text rendered as native SVG text. Use for prose, titles, callouts; use Tex for math.
tags: [text, label, prose, title, callout]
related: [Tex, Brace, SurroundingRectangle]
---

# Text

## Description

Plain text rendered as native SVG `<text>` / `<tspan>` elements (not vectorized). Bounding-box dimensions come from font metrics via `opentype.js`. Default style is set by the active theme — color is `CONFIG.defaultTextColor`, font is `CONFIG.defaultTextFontFamily`.

## When to use

- Prose: titles, instructions, plain-English labels ("Step 1", "Find x", "Solution").
- Multi-word callouts where math typography would be wrong (`Tex("speed")` would italicize each letter as a variable).
- Cell content in `Table` (auto-built when you pass a string/number).
- **Use `Tex` instead** for *anything* that's actually math: equations, single variables, fractions, exponents, Greek letters, square roots.
- **Use a regular Text inside `Brace.withLabel`** for short prose annotations on a brace ("the discriminant").

## Constructor parameters

`new Text(text: string, opts?: TextOptions)` — `text` is positional, required, and non-empty.

- `text` (`string`) — the content. Multi-line is fine; line breaks come from `\n` and from auto-wrap when `maxWidth` is set.
- `fontSize` (`number`, default = `CONFIG.defaultTextFontSize` ≈ 20).
- `color` (`ManimColor`, default = `CONFIG.defaultTextColor`) — fill color.
- `opacity` (`number`, default `1.0`).
- `bold` (`boolean`, default `false`).
- `italics` (`boolean`, default `false`).
- `fontFamily` (`string`, default = `CONFIG.defaultTextFontFamily`).
- `textDecoration` (`"none" | "underline" | "overline" | "line-through"`, default `"none"`).
- `maxWidth` (`number`, default `6.0`) — wrap width in scene units. Long strings break onto multiple lines.
- `leading` (`number`) — inter-line spacing as a fraction of line height.
- `xPadding`, `yPadding` (default `0`).
- `bgColor`, `bgOpacity`, `bgPadding`, `bgRadius` — optional rounded backing rect (same as `Tex`). Useful when text sits over a grid or curve.
- `position` (`Vec3`, default `UL`) — upper-left anchor in scene coords. Usually you'll position later with `.moveTo` / `.nextTo`.
- `startAngle` (`number`, radians) — initial rotation.
- `zIndex` (`number`, default `1`) — Text defaults to `z=1` so it draws on top of `z=0` geometry.

## Methods

Inherited from `TransformableMobject` / `Mobject`:

- `.moveTo(target)`, `.nextTo(target, direction, alignedEdge?, buff?)`, `.shift(vec)`, `.scale(factor)`, `.rotate(radians)`.

## Minimal examples

```ts
import { canvas, Text, RED, BLACK } from "still-manim-ts";

// Title at the top of a panel.
const title = new Text("Find the slope", { fontSize: 28, bold: true });
canvas.add(title);

// Short callout with a backing rect so it stays readable on a grid.
const note = new Text("vertex", { color: RED, bgColor: BLACK, bgOpacity: 0.4 });
canvas.add(note);
```

## Common pitfalls

- **Don't use Text for math.** A single `x` looks wrong upright; an equation in `Text` won't render fractions / superscripts. Use `Tex`.
- **Multi-line wrapping uses `maxWidth`.** Default is 6 scene units. If a long string isn't wrapping the way you want, set `maxWidth` explicitly.
- **No glyph outlines.** Text is *not* a `VMobject` — you can't apply gradients, dashed strokes, or per-character styling beyond what the font supports. For per-glyph styling, use `Tex` (which renders to paths).
- **Font metrics may differ ~1–2px from Python smanim.** Bounding boxes come from `opentype.js`. If you're aligning Text precisely against geometry, eyeball the SVG rather than trusting pixel-perfect parity.
- **`.nextTo` 3rd argument is `alignedEdge`, not `buff`.** Same gotcha as Tex: `.nextTo(target, DOWN, undefined, 0.15)`.
