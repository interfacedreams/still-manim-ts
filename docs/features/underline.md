---
name: Underline
category: annotations
summary: Horizontal Line drawn beneath a target Mobject. Subclass of Line.
tags: [annotation, underline, emphasize, label]
related: [Line, Brace, SurroundingRectangle]
---

# Underline

## Description

A `Line` positioned just below the bottom edge of a target Mobject, extending slightly past its left and right edges. Subclass of `Line` (so all `Line` getters/methods work).

## When to use

- Underlining a final answer or a key term ("solution", "result").
- Marking a step in a multi-step solution as "current" or "in progress".
- **Use `Brace` instead** when you want a curly bracket and a labeled span.
- **Use `SurroundingRectangle`** when you want to outline the entire target.

## Constructor

`new Underline(target: Mobject, opts?: UnderlineOptions)` — `target` is positional and required.

- `buff` (`number`, default `0.05`) — extension past the target's left/right edges, in scene units.
- `yOffset` (`number`, default `0.05`) — vertical offset below the target's bottom edge. Larger value = more gap.
- `color` (`ManimColor`, default `YELLOW`).
- `strokeWidth` (`number`, default `3`).

## Minimal example

```ts
import { canvas, Underline, Tex } from "still-manim-ts";

const ans = new Tex("x = 5");
canvas.add(ans, new Underline(ans));
```

## Common pitfalls

- **Default color is `YELLOW`.** Override `color` to match the surrounding palette (e.g. `RED` for "wrong", `GREEN` for "right").
- **`yOffset` is *additive* below the target.** Larger value = the underline drops further below the text.
- **Underline doesn't move with the target.** Geometry is computed at construction. If the target shifts, rebuild the underline.
