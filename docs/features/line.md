---
name: Line
category: geometry
summary: A line segment between two points or two Mobjects. Stroke-only — Lines cannot be filled.
tags: [geometry, line, segment, stroke]
related: [Arrow, Vector, NumberLine]
---

# Line

## Description

A 2D line segment. `start` and `end` accept either `Vec3` points or `Mobject`s — when an endpoint is a Mobject, the line auto-anchors to where it intersects that Mobject's bounding box (so the line stops at the shape's edge, not its center).

## When to use

- Connecting two points or two shapes (e.g. legs of a slope triangle, sides of a custom polygon).
- Drawing a chord on a circle, an axis of symmetry on a parabola (use `dashed: true`), a midsegment.
- A custom axis when `NumberLine` is overkill.
- **Use `Arrow` instead** when direction matters (vectors, edges of a directed graph, "this points to that").
- **Use `Polygon` / `Rectangle`** when you have ≥3 vertices and want a closed shape that can be filled.

## Constructor parameters

`new Line(opts?: LineOptions)` — all optional.

- `start` (`Vec3 | Mobject`, default `LEFT` = `[-1, 0, 0]`) — starting point or starting Mobject. If a Mobject, the line begins at the Mobject's edge along the line's direction (not its center).
- `end` (`Vec3 | Mobject`, default `RIGHT` = `[1, 0, 0]`).
- `buff` (`number`, default `0`) — inset from each endpoint, in scene units. Useful when connecting two Mobjects: `buff: 0.1` creates a small gap so the line doesn't touch the shapes.
- `color` (`ManimColor`, default = text color) — stroke color (Lines have no fill).
- `opacity` (`number`, default `1.0`) — stroke opacity.
- `strokeWidth` (`number`, inherited from `VMobjectOptions`).
- `dashed` (`boolean`, inherited) — for axes of symmetry, "imagined" / construction lines, etc.

## Methods / properties

- `start`, `end` (getters, `Vec3`) — current endpoint positions.
- `setStartAndEnd(start: Vec3, end: Vec3)` — reposition both endpoints in place.
- `direction` (getter, `Vec3`) — unit vector from start to end.
- `length` (getter, `number`) — Euclidean distance.
- `angle` (getter, `number`) — angle of the line in radians.
- `midpoint` (getter, `Vec3`).

Plus everything inherited from `VMobject` / `Mobject`.

## Minimal example

```ts
import { canvas, Line, RED } from "still-manim-ts";

const seg = new Line({ start: [0, 0, 0], end: [3, 2, 0], color: RED });
canvas.add(seg);
```

Connecting two shapes (auto-anchors to bounding box edges):

```ts
const connector = new Line({ start: circleA, end: squareB, buff: 0.1 });
```

## Common pitfalls

- **`buff` is per-endpoint, not total.** `buff: 0.1` shrinks the line by `0.1` on each side (`0.2` total). Throws if `2 * buff > length`.
- **Mobject endpoints anchor to the bounding box, not the geometry.** For a `Circle`, the bbox is the square that bounds the circle, so `start: circle` anchors to the *square's* edge — usually fine, but for non-axis-aligned approaches the anchor may sit slightly outside the visual circle.
- **Lines can't be filled.** `fillColor` / `fillOpacity` are stripped from `LineOptions`. If you want a thick filled stripe, use a thin `Rectangle`.
- **For directional indication, use `Arrow`.** Don't fake it by drawing a line plus a separate triangle — `Arrow` handles tip alignment correctly when the line is rotated or scaled.
