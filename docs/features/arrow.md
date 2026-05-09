---
name: Arrow
category: geometry
summary: Directional line with one or two triangle tips. Subclass of Line. Use Vector for arrows from the origin.
tags: [geometry, arrow, vector, direction, pointer]
related: [Line, Pointer, NumberLine]
---

# Arrow and Vector

## Description

`Arrow` is a `Line` with a triangle tip. By default the tip is at the **end** point only, but you can enable a tip at the start, both, or replace the tip shape entirely.

`Vector` is a thin convenience wrapper: an `Arrow` from `ORIGIN` to a given direction vector — the canonical "vector drawn from the origin" picture.

## When to use

- Anything that *means direction*: vectors, edges of a directed graph, "this points to that", solution rays of an inequality, slope hints.
- Pointing at a feature from a label (use `Pointer` for the labeled-callout pattern, or `Arrow.pointsAt(target)`).
- **Use `Line` instead** when direction doesn't matter (sides of a polygon, axes of symmetry, segments).
- **Use `Vector(direction)`** when you want an arrow from the origin — saves you typing `start: ORIGIN, end: dir`.

## Constructor parameters

`new Arrow(opts?: ArrowOptions)` — extends `LineOptions`, so all `Line` options (start, end, buff, color, opacity, strokeWidth, dashed) work too.

- `start` (`Vec3 | Mobject`, default `LEFT`), `end` (`Vec3 | Mobject`, default `RIGHT`).
- `tipLength` (`number`, default `0.2`) — length of the tip along the line direction.
- `tipWidth` (`number`, default `0.2`) — base width of the tip perpendicular to the line.
- `tipScalar` (`number`, default `1.0`) — multiplies both tipLength and tipWidth. Easiest knob for "make the tip bigger / smaller".
- `tipShape` (`TipShapeFactory`, default = `ArrowTriangleFilledTip`) — pass `ArrowTriangleTip` for a stroke-only (open) tip.
- `atEnd` (`boolean`, default `true`) — tip at the end point.
- `atStart` (`boolean`, default `false`) — tip at the start point. Set both true for a double-headed arrow (axes, intervals).
- `tipConfig` (`ArrowTipOptions`) — extra style for the tips themselves.

`new Vector(direction: Vec3 = RIGHT, opts?: ArrowOptions)` — same options but `start` and `end` are managed internally.

## Static helper

```ts
Arrow.pointsAt(target, direction = DOWN, length = 1.0, buff = TINY_BUFF, opts?)
```

Builds an arrow whose **tip** lands just outside `target` along the given `direction`. Use for "look at this thing" callouts. `target` can be a Mobject (auto-anchors to the bounding box) or a `Vec3` point.

## Methods / properties

- `start`, `end` (getters) — return the actual tip points (not the underlying line endpoints; the line is shrunk to make room for the tip).
- Inherits `length`, `direction`, `angle`, `midpoint`, `setStartAndEnd`, etc., from `Line`.

## Minimal examples

```ts
import { canvas, Arrow, Vector, Pointer, RED, RIGHT, UP } from "still-manim-ts";

// Plain rightward arrow.
canvas.add(new Arrow({ start: [0, 0, 0], end: [3, 0, 0], color: RED }));

// Double-headed (e.g. an interval indicator).
canvas.add(new Arrow({ start: [-2, 0, 0], end: [2, 0, 0], atStart: true, atEnd: true }));

// Vector from origin.
canvas.add(new Vector([2, 1, 0], { color: RED }));

// "Look at this point" call-out.
canvas.add(Arrow.pointsAt([3, 2, 0], UP, 0.8));
```

## Common pitfalls

- **Tip eats into the line.** When you set `start` / `end`, the visible line is automatically shrunk by `tipLength` to make room for the tip. The `start` / `end` *getters* on the Arrow return the *tip* coordinates, so chained code stays consistent — but if you read the `Line`'s underlying points directly you'll see the shortened version.
- **Default tip is filled.** It inherits the line's stroke color as its fill color. To change the tip color independently, pass `tipConfig: { defaultFillColor: <color> }`.
- **`atEnd: false, atStart: false`** is just a `Line`. Don't use Arrow with no tips — use Line directly.
- **Mobject endpoints anchor to bounding boxes.** Same gotcha as `Line`: `start: someCircle` anchors to the *square bounding box* of the circle, which is slightly outside the visual circle.
