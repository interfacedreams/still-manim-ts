---
name: Angle
category: geometry
summary: Angle marker at a vertex defined by three points (vertex + two ray endpoints). Picks the interior sweep automatically and optionally renders a Tex label along the bisector.
tags: [geometry, angle, arc, marker, three-points]
related: [Arc, Polygon, Tex, RightTriangle]
---

# Angle

## Description

A composite `Group` for "the angle at this vertex." You give it three points — the vertex and one endpoint along each ray — and it produces a small `Arc` marker inside the wedge, plus an optional Tex label along the angle's bisector. By default it picks the **minor** (interior) sweep, so the most common usage is one line.

Order of the two ray endpoints is irrelevant — `new Angle(v, A, B)` and `new Angle(v, B, A)` produce the same marker.

## When to use

- Any time you want to mark the angle between two rays, segments, or sides of a polygon — instead of computing `atan2` for each ray and reasoning about which sweep is interior.
- Pair with `Polygon.vertex(i)` / `.edge(i)` to mark the angle at vertex *i* of a polygon: `new Angle(poly.vertex(1), poly.vertex(0), poly.vertex(2))`.
- **Use `Angle.right(...)`** for a square right-angle marker (a tiny square nestled into a 90° corner) instead of a curved arc — the convention for right angles.
- **Use `Arc` directly** only when you need fine control over `startAngle` and `angle` — for sectors, fan-out diagrams, or partial circles that aren't tied to two specific rays.

## Constructor

`new Angle(vertex: Vec3, ray1End: Vec3, ray2End: Vec3, opts?: AngleOptions)`

Positional, **not** options-bag — the three points are the meaningful inputs.

### Options

- `radius` (`number`, default `0.4`) — arc radius in scene units.
- `label` (`string | null`) — optional LaTeX label (e.g. `"30^\\circ"`, `"\\theta"`). Placed along the bisector, just past the arc. Pass `null` / omit for no label.
- `labelBuff` (`number`, default `0.2`) — distance from outer edge of arc to label.
- `arcType` (`"minor" | "major"`, default `"minor"`) — which sweep to draw. `"major"` flips to the reflex side; useful for inscribed-angle diagrams where you want the central angle on the *same* arc the inscribed angle subtends.
- `color` (`ManimColor`, default = text color), `strokeWidth` (default `3`), `fontSize` (default `22`).

## Properties

- `arc` — the underlying `Arc`. Recolor or move via `.arc.setFill(...)` / restyle.
- `label` (`Tex | null`) — the optional label, or `null` if none was given. Reposition manually if the auto-placement collides with something.
- `vertex` — the vertex point.
- `bisector` (radians) — direction of the angle bisector. Use `.bisectorPoint(distance)` to get a point along it.
- `sweep` (radians) — the actual swept angle (always positive).

## Layering (`zIndex`)

The arc renders at `zIndex: -1` by default — *under* the geometry it's marking. This is so the triangle / polygon's strokes visually clip the arc at the rays, and the arc never appears to leak past an edge. The label (Tex, `zIndex: 1`) still renders on top of everything as usual.

Override by calling `angle.setZIndex(...)` (sets the whole family) or by reaching into `angle.arc.zIndex = 0` if you want the arc on top for some reason.

## Methods

- `bisectorPoint(distance: number): Vec3` — point at `distance` from the vertex along the bisector. Useful for placing custom labels: `myTex.moveTo(angle.bisectorPoint(0.7))`.

## Static helpers

```ts
Angle.right(vertex: Vec3, ray1End: Vec3, ray2End: Vec3, opts?: { size?: number; color?: ManimColor; strokeWidth?: number }): Polygon
```

Right-angle square marker — the small square nestled into a 90° corner. Returns a `Polygon` (not an `Angle`). The two rays should be perpendicular for the result to actually be square.

## Minimal examples

Mark the 30° angle at vertex `B` of a triangle, with a label:

```ts
import { canvas, Polygon, Angle, RED } from "still-manim-ts";

const tri = new Polygon({ vertices: [A, B, C], fillOpacity: 0 });
const ang = new Angle(B, A, C, { label: "30^\\circ", color: RED });
canvas.add(tri, ang);
```

Right-angle square at the right-angle corner of a triangle:

```ts
const sq = Angle.right(A, B, C);
canvas.add(sq);
```

Reflex / major angle (e.g. central angle subtending the *far* side of a circle):

```ts
const central = new Angle(O, A, C, {
  label: "2\\theta",
  arcType: "major",
});
```

Custom label position via bisector:

```ts
const ang = new Angle(B, A, C, { color: RED });
const lab = new Tex("\\theta", { color: RED }).moveTo(ang.bisectorPoint(0.7));
canvas.add(ang, lab);
```

## Common pitfalls

- **`vertex` is positional, first.** `new Angle({ vertex: B, ... })` will fail to compile — the API is positional `(vertex, ray1End, ray2End, opts)`.
- **The two ray endpoints just need to lie along the rays — they don't have to be at any specific distance.** `new Angle(B, A, C)` works whether `A` and `C` are 0.1 or 100 units away from `B`.
- **Right angles use `Angle.right(...)`, not `new Angle(...)` with a 90° sweep.** The right-angle square is the standard convention; the curved arc is for non-right angles.
- **Label auto-placement is along the bisector at `radius + labelBuff`.** For very narrow angles (say <15°) the auto-placement may visually crowd the rays — bump `labelBuff`, or grab `.label` and reposition manually.
- **`arcType: "major"` is for reflex angles** (inscribed-angle theorems where the central angle subtends the major arc). For typical interior angles in triangles / polygons, the default `"minor"` is what you want.
- **The arc renders below geometry by default (`zIndex: -1`).** This is intentional — it prevents the arc from poking past the triangle/polygon edges where the rays end. If you've placed an angle in front of nothing and want it on the default layer, set `angle.arc.zIndex = 0` after construction.
