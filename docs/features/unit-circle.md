---
name: UnitCircle
category: composites
summary: One-call unit circle with axes and the standard 16 reference angles. Switch labels between angles (π/6, π/4…) and coordinates ((cos, sin)).
tags: [composites, unit-circle, trigonometry, precalc, angles, sin-cos]
related: [Circle, Tex, Dot, Line]
---

# UnitCircle

## Description

A composite `Group` that builds the canonical unit-circle figure in one call: the circle, perpendicular x/y axes, a center dot, and a `Dot` + `Tex` label at each of the 16 standard angles (`0`, `π/6`, `π/4`, `π/3`, `π/2`, … `11π/6`). The default radius is `2` (scene units) for legibility, not literally 1.

## When to use

- Any precalc / trig context where the reference angles are the point: degrees-vs-radians, evaluating `sin(π/3)`, the symmetry of trig identities, reference angles.
- Switch `showCoords: true` to label the points by their `(cos θ, sin θ)` coordinates instead of the angle name.
- Pass a custom `angles` array to focus on a subset (e.g. just the four quadrantal angles).
- **Use this, not a hand-built `Circle` + 16 dots + 16 Tex labels** — the composite handles the angle math, label placement, and the standard set of `\frac{π}{n}` LaTeX strings. Hand-rolling is the most common Gemini-generated mistake here.

## Constructor parameters

`new UnitCircle(opts?: UnitCircleOptions)` — all optional.

- `radius` (`number`, default `2`) — physical radius in scene units.
- `angles` (`readonly number[]`, default = the 16 standard angles) — radians. Pass a subset to mark only specific angles, or a custom set for non-standard problems.
- `showLabels` (`boolean`, default `true`) — Tex labels at each marked angle. Labels only appear for angles that match a standard angle (otherwise the dot is drawn without a label).
- `showCoords` (`boolean`, default `false`) — replace angle labels (`\frac{π}{6}`) with coordinate labels (`(\frac{\sqrt{3}}{2}, \frac{1}{2})`). Coordinate labels are only available for the seven "common" angles (`0`, `π/6`, `π/4`, `π/3`, `π/2`, `π`, `3π/2`).
- `showAxes` (`boolean`, default `true`) — draw the perpendicular axes and the center dot. Disable for a "naked" circle with just the angle dots.
- `circleColor` (`ManimColor`, default `BLUE`).
- `axisColor`, `dotColor` (`ManimColor`, default = text color).
- `fontSize` (`number`, default `18`).

## Properties

- `circle` (`Circle`) — the perimeter; useful if you want to recolor or animate it.
- `xAxis`, `yAxis` (`Line | null`) — the axes (null if `showAxes: false`).
- `centerDot` (`Dot | null`).
- `markers` (`Array<{ angle, dot, label }>`) — one entry per angle. Use this to recolor, reposition, or add overlays (e.g. a radial line to one specific angle).

## Minimal examples

Default unit circle:

```ts
import { canvas, UnitCircle } from "still-manim-ts";

canvas.add(new UnitCircle());
```

Coordinate-labeled circle (just the seven common angles):

```ts
canvas.add(new UnitCircle({
  angles: [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI, 3*Math.PI/2],
  showCoords: true,
}));
```

Highlight a single angle on top of the default figure:

```ts
import { Line, RED } from "still-manim-ts";

const uc = new UnitCircle();
const focus = uc.markers.find(m => Math.abs(m.angle - Math.PI/3) < 1e-9)!;
focus.dot.setColor(RED);
const radial = new Line({ start: [0, 0, 0], end: focus.dot.center, color: RED, strokeWidth: 3 });
canvas.add(uc, radial);
```

## Common pitfalls

- **Default radius is `2`, not `1`.** "Unit" means *conceptually* unit (cos/sin map to coordinates relative to it); the scene-space size is bumped up to leave room for labels. If you compose a UnitCircle with other geometry that uses real radius-1 math, account for the scale factor.
- **Custom angles without standard labels render dots only.** If you pass `angles: [0.5, 1.2]`, those dots show up but with no Tex labels (the lib won't synthesize a label for arbitrary radians). Add labels yourself if you need them.
- **`showCoords` is sparse.** Only seven angles have coordinate labels; the rest of the standard 16 angles get a dot but no label when `showCoords: true` is set. Pass `angles:` explicitly to the seven common ones if you want every dot labeled.
- **Composing inside `Axes`.** UnitCircle has its own internal axes; if you place it on top of a `NumberPlane` you'll have two sets of axes. Pass `showAxes: false` to drop the internal pair.
