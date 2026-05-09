---
name: Polygon
category: geometry
summary: Closed polygon from arbitrary vertices, plus shape-specific subclasses (Rectangle, Square, RegularPolygon, Triangle).
tags: [geometry, polygon, rectangle, square, triangle, shape]
related: [Polygram, Line, RightTriangle, Circle]
---

# Polygon family

One general `Polygon` plus four specialized subclasses. Use a subclass when one fits — they're shorter to write and self-documenting.

## When to use which

| Want… | Use |
|---|---|
| Triangle with three given vertices, a quadrilateral with arbitrary corners, a custom shape | `Polygon` (pass `vertices`) |
| Axis-aligned rectangle (e.g. a backing box, a panel, a domain region) | `Rectangle` (`width`, `height`) |
| Equal-sided box | `Square` (`sideLength`) |
| Pentagon / hexagon / octagon — anything regular | `RegularPolygon` (`n`, `radius`) |
| Equilateral triangle | `Triangle` (`sideLength`) — convenience for `RegularPolygon(n=3)` |
| Open polyline (zigzag, broken segments, no closing edge) | `Polygram` (parent of `Polygon`) |

For specifically a **right triangle with labeled sides**, use the [`RightTriangle`](./right-triangle.md) composite — it's already labeled and includes the right-angle marker.

## Common pitfalls

- **Vertex order is CCW for `cornerRadius` to work** (and it's the convention throughout the lib for normals). The `roundCorners` algorithm assumes counter-clockwise convex shapes.
- **Default style differs between Polygram and Polygon.** `Polygon` is filled `BLUE`. `Polygram` (open polyline) is stroke `GREEN`. Surprising; if you want a stroke-only polygon set `fillOpacity: 0` and `strokeColor: <color>`.

## Polygon

`new Polygon({ vertices: Vec3[], cornerRadius?: number, ...style })`

- `vertices` — list of `Vec3` points, in counter-clockwise order. The shape closes automatically (last vertex connects back to first).
- `cornerRadius` (default `0`) — round each corner. Currently chord-style approximation, not true bezier arcs.

Properties:

- `vertices` (readonly array), `vertex(i)`, `edge(i)` (returns `[Vec3, Vec3]`), `edgeMidpoint(i)`, `edgeNormal(i)` — useful for attaching labels to specific sides.
- `setVertices(newVerts)` — reposition all vertices in place.

Minimal:

```ts
new Polygon({
  vertices: [[0, 0, 0], [3, 0, 0], [3, 2, 0], [0, 2, 0]],  // a 3×2 rectangle, CCW
  fillOpacity: 0,
  strokeColor: BLUE_E,
});
```

## Rectangle

`new Rectangle({ width = 2, height = 1, ...style })` — centered at the origin. Use `.shift()` or `.moveTo()` to position.

## Square

`new Square({ sideLength = 2, ...style })` — centered at origin.

## RegularPolygon

`new RegularPolygon({ n = 6, radius = 1, startAngle?, ...style })` — `n`-gon inscribed in a circle of given `radius`. `startAngle` rotates the first vertex.

```ts
new RegularPolygon({ n: 8, radius: 1, startAngle: PI / 8 });  // octagon, flat side up
```

## Triangle

`new Triangle({ sideLength = 2, ...style })` — equilateral triangle with point up. Inherits from `RegularPolygon(n=3, radius=sideLength/2)`.

For a right triangle with labels, use [`RightTriangle`](./right-triangle.md) instead.

## Polygram

`new Polygram({ vertices: Vec3[], ...style })` — open polyline. Connects consecutive vertices but does *not* close the shape. Useful for zigzags, paths, broken-line plots. Default style is **stroke** `GREEN` (unlike `Polygon`, which is filled).

## Edge / vertex helpers (inherited from Polygram)

```ts
const tri = new Polygon({ vertices: [a, b, c] });
tri.vertex(0);          // → a (mod-N indexed: vertex(3) === vertex(0))
tri.edge(1);             // → [b, c]
tri.edgeMidpoint(2);     // midpoint of edge from c back to a
tri.edgeNormal(0);       // outward unit normal of edge a→b
```

These are the right tools for placing a label "on side AB" — call `edgeMidpoint(0)` and `edgeNormal(0)`, then offset the label along the normal.
