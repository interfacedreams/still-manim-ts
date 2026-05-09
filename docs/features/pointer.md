---
name: Pointer
category: annotations
summary: Leader-line arrow pointing AT a target from a given direction. Combine with a label at the arrow's tail.
tags: [annotation, arrow, pointer, callout, leader-line, label]
related: [Arrow, Brace, Underline]
---

# Pointer

## Description

A short arrow whose **tip** lands just outside a target along a chosen direction. The opposite end (`.tail`) is where you place the label — the arrow visually says "this is X" by pointing at the target while the label sits clear of it.

Subclass of `Arrow`, so all arrow getters/methods work.

## When to use

- "This is the vertex" / "this is the slope" callouts where a brace would be wrong (single point, not a span).
- Labeling a subcomponent of a busy diagram (one vertex of a graph, one cell of a table, one tick on a number line).
- **Use `Brace` instead** when labeling a *span* (a side of a triangle, a range on the x-axis, a sub-expression in a formula).
- **Use `Arrow.pointsAt(target, dir)`** when you want the same geometry without the `.tail` accessor or the static label helper.

## Constructor

`new Pointer(target: Mobject | Vec3, opts?: PointerOptions)` — `target` is positional and required (Mobject or scene-space point).

- `approachFrom` (`Vec3`, default `DOWN`) — the direction the arrow comes from. `DOWN` ⇒ arrow comes from below and points up at the target (label sits below). Set `RIGHT` for a horizontal pointer coming from the right.
- `length` (`number`, default `0.6`) — arrow length in scene units.
- `buff` (`number`, default `0.05`) — gap between the arrow tip and the target's edge.
- `color` (`ManimColor`, default = text color).
- `strokeWidth` (`number`).

## Properties

- `tail` (`Vec3`) — opposite end of the arrow from the tip. **Place your label here**: `myLabel.nextTo(pointer.tail, dir)`.
- Inherits all `Arrow` properties (`start`, `end`, `length`, `direction`, etc.).

## Static helper

```ts
Pointer.withLabel(target, label: string, opts?): Group
```

Builds a pointer + Text label as a single `Group`. The label sits past `.tail` in the same direction the pointer comes from. Extra options:

- `fontSize` (default `22`).
- `textOptions` — passed through to the `Text` constructor.

## Minimal example

```ts
import { canvas, Pointer, Tex, RED, DOWN } from "still-manim-ts";

const target = new Tex("(1, -4)").moveTo([2, 1, 0]);
canvas.add(target);

// Label below pointing up at the target.
canvas.add(Pointer.withLabel(target, "vertex", { approachFrom: DOWN, color: RED }));
```

Manual placement (Tex label, custom positioning):

```ts
const ptr = new Pointer(target, { approachFrom: DOWN, color: RED });
const lbl = new Tex("(1, -4)", { color: RED }).nextTo(ptr.tail, DOWN, undefined, 0.1);
canvas.add(ptr, lbl);
```

## Common pitfalls

- **`approachFrom` is the direction the *arrow comes from*, not where the arrow points.** `DOWN` means the arrow appears below the target and points up. Easy to flip mentally.
- **Targets must have a non-trivial bounding box.** A `Vec3` target works; a `Dot` target works. A degenerate Mobject (zero-size group) won't.
- **For a span (more than one point), use `Brace`.** Pointer is for "this single thing".
