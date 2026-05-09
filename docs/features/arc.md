---
name: Arc
category: geometry
summary: Partial circle defined by startAngle and angle. Parent of Circle. Use for angle markers, sector diagrams, fan-outs.
tags: [geometry, arc, angle, sector, partial-circle]
related: [Circle, Dot, Tex, UnitCircle]
---

# Arc

## Description

A circular arc parameterized by a center, radius, starting angle, and sweep angle. Inherits from `VMobject`. `Circle` is just an `Arc` with `angle = 2π`.

## When to use

- **Angle markers** in a triangle or two intersecting lines (small arc near the vertex showing the angle's measure).
- **Sectors** of a circle (pie-chart wedges, "shaded region" in geometry problems).
- **Construction arcs** (geometry compass-and-straightedge style — the `Arc.fromPoints` static helper builds an arc through two given endpoints).
- **Use `Circle` instead** for a full circle (`angle = 2π`).
- **Use `UnitCircle`** for the precalc unit-circle figure with standard angles already drawn.

## Constructor parameters

`new Arc(opts?: ArcOptions)` — all optional.

- `radius` (`number`, default `1`).
- `startAngle` (`number`, radians, default `0`) — angle of the starting point measured CCW from the positive x-axis.
- `angle` (`number`, radians, default `π/2`) — sweep angle (how far the arc extends from `startAngle`). Must be `≤ 2π`.
- `arcCenter` (`Vec3`, default `ORIGIN`).
- `numComponents` (`number`, default `30`) — Bezier sample density. Higher = smoother arc, more SVG points. The default is fine for typical sizes; bump up for very large arcs.
- Style: `strokeColor`, `strokeWidth`, `strokeOpacity`, `fillColor`, `fillOpacity`, `dashed`. Default style: stroke `BLUE`, no fill.

## Static helper

```ts
Arc.fromPoints(start: Vec3, end: Vec3, opts?: ArcOptions & { angle?: number }): Arc
```

Builds an arc whose endpoints are `start` and `end`, with the specified sweep `angle` (default computed from radius and chord). Pass `radius` *or* `angle` (giving both is over-constrained). Returns an `Arc` positioned and oriented correctly.

## Properties

- `radius`, `arcCenter`, `startAngle`, `angle`, `numComponents` — all readable, set at construction.

## Minimal examples

Quarter-circle arc at the origin (default angle `π/2`):

```ts
import { canvas, Arc, RED } from "still-manim-ts";

canvas.add(new Arc({ radius: 1, color: RED }));
```

Angle marker at the vertex of a right triangle (small arc inside the corner):

```ts
import { Arc, PI } from "still-manim-ts";

const angleMarker = new Arc({
  arcCenter: [0, 0, 0],     // place at the vertex of the angle
  radius: 0.3,              // small
  startAngle: 0,            // ray going right
  angle: PI / 2,            // 90° sweep up to the ray going up
});
```

Sector / pie wedge (filled):

```ts
new Arc({
  radius: 1,
  startAngle: 0,
  angle: PI / 3,            // 60° wedge
  fillColor: RED,
  fillOpacity: 0.3,
});
```

## Common pitfalls

- **`angle` is the sweep, not the end angle.** An arc from `π/4` to `3π/4` has `startAngle: PI/4` and `angle: PI/2` (sweep), *not* `endAngle: 3*PI/4`.
- **Default style is stroke-only.** Setting `fillColor` adds fill but does *not* drop the stroke. Use `strokeOpacity: 0` to remove the outline if you want fill-only.
- **Filled arcs aren't auto-closed to the center.** If you want a pie wedge with the two radial edges drawn, build the wedge as a `Polygon` plus the arc, or post-process the arc's points to include the center.
- **Default `BLUE` stroke** means an arc is visible against a light background out-of-the-box, but use `color`/`strokeColor` for color-matching.
