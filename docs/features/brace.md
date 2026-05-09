---
name: Brace
category: annotations
summary: Curly bracket alongside a target Mobject, optionally with a Tex/Text label past the tip.
tags: [annotation, brace, label, callout, grouping]
related: [Underline, Pointer, SurroundingRectangle, Tex]
---

# Brace

## Description

A manim-style curly bracket (`{` rendered as a filled SVG path) that sits along one side of a target Mobject. Used to label a span of something — the discriminant inside a quadratic formula, a group of items in a list, the height of a triangle.

Has two static helpers — `Brace.withLabel` (Text label) and `Brace.withTexLabel` (LaTeX label) — which build the brace and the label together as a `Group`. Prefer these over hand-positioning a label with `nextTo`.

## When to use

- Labeling a sub-expression inside a Tex formula (e.g. underbrace the discriminant `b² − 4ac`).
- Marking the span of a row of items, a side of a shape, or a horizontal/vertical extent on a graph.
- Pairing math notation with a verbal explanation ("the slope", "this part is the radius").
- **Use `Underline` instead** for a simple straight underline (single span, no notch).
- **Use `SurroundingRectangle`** when you want to box the entire target rather than label one side.
- **Use `Pointer`** for a leader-line callout pointing at a single feature.

## Constructor parameters

`new Brace(target: Mobject, opts?: BraceOptions)` — `target` is positional and required.

- `direction` (`Vec3`, default `DOWN`) — which side of the target the brace sits on. `DOWN`/`UP` give a horizontal span (notch points down/up); `LEFT`/`RIGHT` give a vertical span (notch points left/right).
- `buff` (`number`, default `0.1`) — gap between the target's edge and the brace's flat back.
- `sharpness` (`number`, default `2`) — higher = longer flat section between the end curls (sharper, more "stretched"). Default matches manim.
- `color` (`ManimColor`, default = text color) — fill color of the brace path.
- `strokeWidth` (`number`) — set to add a stroke; default is fill-only.

## Properties

- `direction` (`Vec3`) — the side the brace sits on (echoes the constructor arg).
- `tipAnchor` (`Vec3`) — point at the brace's notch (the end opposite the target). **Use this to position your own label** if you skip the static helpers: `myLabel.nextTo(brace.tipAnchor, direction)`.

## Static helpers

```ts
Brace.withLabel(target, label: string, direction = DOWN, opts?): Group
Brace.withTexLabel(target, latex: string, direction = DOWN, opts?): Group
```

Both return a `Group` containing the brace and a label placed just past the brace's tip. Extra options:

- `fontSize` — `22` default for Text, `28` default for Tex.
- `textOptions` / `texOptions` — passed through to the label constructor.

## Minimal examples

```ts
import { canvas, Brace, Tex, DOWN } from "still-manim-ts";

const formula = new Tex("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
canvas.add(formula);

// Brace + Tex label under the discriminant in one call.
const labeled = Brace.withTexLabel(formula, "\\text{discriminant}", DOWN);
canvas.add(labeled);
```

Vertical brace on the side of a column:

```ts
const col = new Group();  // assume populated with stacked items
canvas.add(Brace.withLabel(col, "the column", LEFT));
```

## Common pitfalls

- **`target` is positional, not in opts.** `new Brace({ target })` is wrong — `new Brace(target)` is right.
- **Direction matters for which span is used.** `DOWN`/`UP` braces span the target's `width`. `LEFT`/`RIGHT` braces span the `height`. If your brace looks unexpectedly short or long, check the direction matches the side you wanted.
- **The brace targets the bounding box, not the visible shape.** For a target with negative space (e.g. a Group with sparse children), the bbox includes the empty space. Wrap the parts you actually want to span in a tighter `Group` first.
- **Bracing only part of a Tex string isn't supported via this API alone.** `Brace` takes a whole Mobject. To brace a sub-expression, render the sub-expression as its own Tex, position it where it should be, and brace *that*.
