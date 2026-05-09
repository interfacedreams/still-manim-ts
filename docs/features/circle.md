---
name: Circle
category: geometry
summary: Circle (filled by default) and Dot (small filled circle). Inherits from Arc — pass `angle < TAU` for a partial arc.
tags: [geometry, circle, dot, point, marker]
related: [Arc, Line, Tex]
---

# Circle and Dot

Two closely related classes in the same module. `Dot` is just a small `Circle` defaulting to the text color, intended as a point marker.

## Description

- **`Circle`** — a full circle (`angle = 2π`), filled by default in `BLUE`. Inherits from `Arc`.
- **`Dot`** — a small filled circle (`radius ≈ DEFAULT_DOT_RADIUS`), defaulting to the current theme's text color. Use as a point marker.

## When to use

- **`Dot`** for a solid point marker (intersection of two lines, a labeled vertex, a sample on a curve, the value of a function at a point).
- **`Circle` with `fillColor: WHITE` + colored stroke** for an "open" point — inequalities (`x > 2`), excluded endpoints on intervals.
- **`Circle`** for the perimeter of a unit circle, a circle in a geometry problem, or a halo / highlight around another mobject.
- **Use `UnitCircle` instead** for the precalc unit circle with angle markers — that composite already handles the standard angles.
- **Use `Arc`** for a partial circle (angles, sectors, fan diagrams).

## Constructor parameters

### `new Circle(opts?: CircleOptions)`

- `radius` (`number`, default `1`).
- `arcCenter` (`Vec3`, default `ORIGIN`) — the center point in scene coords.
- `fillColor`, `fillOpacity`, `strokeColor`, `strokeOpacity`, `strokeWidth` — standard `VMobject` style options.
- `dashed` (`boolean`) — useful for "phantom" circles in geometry constructions.

Default style: filled `BLUE` (no stroke). Override `fillColor` and `strokeColor` independently.

### `new Dot(opts?: DotOptions)`

- `point` (`Vec3`, default `ORIGIN`) — center of the dot (Dot's name for `arcCenter`).
- `radius` (`number`, default `DEFAULT_DOT_RADIUS` ≈ 0.08).
- `color` (`ManimColor`) — fill color shortcut; defaults to `CONFIG.defaultTextColor` (theme-aware).

## Minimal examples

```ts
import { canvas, Circle, Dot, RED, WHITE } from "still-manim-ts";

// Filled point marker.
canvas.add(new Dot({ point: [1, 2, 0], color: RED }));

// Open circle (inequality "open" endpoint).
canvas.add(new Circle({
  arcCenter: [2, 0, 0],
  radius: 0.12,
  fillColor: WHITE,
  strokeColor: RED,
  strokeWidth: 3,
}));

// Plain unit circle.
canvas.add(new Circle({ radius: 1, fillOpacity: 0, strokeColor: RED }));
```

## Common pitfalls

- **`Dot.point` vs `Circle.arcCenter`.** Same concept, different option name. `Dot` accepts `point`, `Circle` accepts `arcCenter`. Don't pass `point` to `Circle` — it'll silently sit at the origin.
- **Default `Circle` is filled.** If you want a stroke-only circle (perimeter), set `fillOpacity: 0` *and* `strokeColor: <color>`. Just setting `strokeColor` keeps the blue fill.
- **Open-circle pattern for inequalities.** `fillColor: WHITE` with a colored stroke reads as "open" against a light-themed canvas. On a dark background, use the bg color (typically `BLACK`) for the fill.
- **`radius` vs scene units.** Both classes' radius is in scene units, *not* pixels — a dot of radius `0.08` is the standard size, `0.12` is a chunky open-dot stroke target.
