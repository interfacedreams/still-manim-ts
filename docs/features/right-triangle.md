---
name: RightTriangle
category: composites
summary: Right triangle with auto-placed side labels (a, b, c) and a right-angle marker. One-shot constructor for SOHCAHTOA / Pythagorean setups.
tags: [geometry, right-triangle, pythagorean, sohcahtoa, composite, labeled]
related: [Polygon, Tex, Line]
---

# RightTriangle

## Description

A composite `Group` that builds an entire labeled right triangle in one call: the three sides, a small square at the right-angle corner, and Tex labels on each side. The right angle sits at the lower-left; horizontal leg has length `legA`, vertical leg has length `legB`; hypotenuse runs from `(0, legB)` to `(legA, 0)`.

## When to use

- Pythagorean theorem (`a² + b² = c²`).
- SOHCAHTOA / trigonometric ratios.
- Any geometry problem where you need a labeled right triangle as the centerpiece.
- **Use this, not `Polygon` + three `Tex` labels manually** — the composite already handles edge midpoints, label positioning, and the right-angle square. Building from primitives is the most common Gemini-generated mistake here.
- **Use `Triangle` or `Polygon`** when you don't need the right-angle marker or auto labels.

## Constructor

`new RightTriangle(legA: number, legB: number, opts?: RightTriangleOptions)`

**Note**: `legA` and `legB` are *positional* arguments, **not** options. `opts` is the third argument.

There's also a static `RightTriangle.fromLegs(a, b, opts?)` which does exactly the same thing — equivalent and chainable.

### Options

- `legLabel` (`string | null`, default `"a"`) — label for the horizontal leg. Pass `null` to suppress.
- `altLegLabel` (`string | null`, default `"b"`) — label for the vertical leg.
- `hypLabel` (`string | null`, default `"c"`) — label for the hypotenuse.
- `rightAngleMarker` (`boolean`, default `true`) — show the small square at the right angle. Disable for SOHCAHTOA setups where the angle marker would crowd a `θ` label.
- `fontSize` (`number`, default `28`) — Tex font size for the side labels.
- `labelBuff` (`number`, default `0.25`) — distance (scene units) from each side to its label.
- `color` (`ManimColor`, default = text color), `strokeWidth` (`number`, default `4`).

## Properties

- `vertices` — `[corner, right, top]` (lower-left right-angle, lower-right, upper-left).
- `hLeg`, `vLeg`, `hyp` — the three sides as `Line` objects (use their `.midpoint`, `.direction` for custom annotations).
- `outline` — the triangular `Polygon` outline.
- `rightAngleMarker` — the small square `Polygon` (or `null` if disabled).
- `labels` — `{ leg?, altLeg?, hyp? }`, each a `Tex`. Useful if you want to recolor or reposition a specific label after construction.

## Minimal examples

A 3-4-5 triangle with the literal numbers as labels:

```ts
import { canvas, RightTriangle } from "still-manim-ts";

const tri = new RightTriangle(3, 4, {
  legLabel: "3",
  altLegLabel: "4",
  hypLabel: "5",
});
canvas.add(tri);
```

SOHCAHTOA setup — show angle θ at the upper-left, hide the right-angle square:

```ts
import { canvas, RightTriangle, Tex } from "still-manim-ts";

const tri = new RightTriangle(4, 3, {
  legLabel: "\\text{adj}",
  altLegLabel: "\\text{opp}",
  hypLabel: "\\text{hyp}",
});
const theta = new Tex("\\theta", { fontSize: 28 })
  .moveTo([tri.vertices[2][0] + 0.4, tri.vertices[2][1] - 0.3, 0]);
canvas.add(tri, theta);
```

## Common pitfalls

- **`legA`, `legB` are positional, not options.** `new RightTriangle({ legA: 3 })` will fail at compile time — use `new RightTriangle(3, 4)`.
- **The triangle is centered after construction.** The internal `vertices[0]` (the right-angle corner) is *not* at `(0, 0)` after `moveToOrigin()` runs in the constructor. If you want to position the triangle, use `.shift(...)` or `.moveTo(point)` on the whole group; reading `.vertices[0]` afterward gives you the new (shifted) location.
- **Label `null` vs default.** Pass `legLabel: null` to *suppress* a label entirely. Pass `legLabel: ""` and you'll get a Tex error (Tex throws on empty strings).
- **Hypotenuse label position is approximate.** It's placed `(midpoint + (buff, buff))` — works for typical aspect ratios, but for very tall or very wide triangles you may want to grab `tri.labels.hyp` and reposition manually.
