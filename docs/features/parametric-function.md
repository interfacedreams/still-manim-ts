---
name: ParametricFunction
category: graphing
summary: Sampled curve t → (x, y). Used internally by Axes.plot; reach for it directly for parametric curves (circles, spirals, Lissajous).
tags: [graphing, parametric, curve, function, sampling]
related: [Axes, NumberPlane, Line]
---

# ParametricFunction

## Description

A curve sampled as a parametric function `t → Vec3`. Sampled at uniform `t` steps; segments where the y-coordinate falls outside `[yMin, yMax]` are dropped (the curve clips at the canvas edge).

In most cases you don't construct this directly — `Axes.plot(fn)` and `NumberPlane.plot(fn)` build one for you. Use `ParametricFunction` directly when:

- The curve is genuinely parametric (circle traced as `(cos t, sin t)`, spiral, ellipse, Lissajous).
- You need a curve that isn't a function of x (vertical lines, sideways parabolas).
- You want fine-grained control over sampling that `plot()` doesn't expose.

## When to use

- **Use `Axes.plot(fn)` / `NumberPlane.plot(fn)`** for `y = f(x)` over the visible x-range. They wrap `ParametricFunction` and convert the function's output via `coordsToPoint`.
- **Use `ParametricFunction` directly** for parametric curves, sideways graphs (`x = f(y)`), or when sampling needs custom step/range.

## Constructor parameters

`new ParametricFunction(opts: ParametricFunctionOptions)` — all options required where listed.

- `function` (`(t: number) => Vec3`, required) — t to a scene-space point. The output goes straight into the SVG (no further coordinate conversion).
- `underlyingFunction` (`(t: number) => number`, optional) — held for inspection/debugging.
- `yMin`, `yMax` (`number`, both required) — scene-space y-bounds. Sampled points outside this range are dropped, breaking the curve into segments at the boundaries.
- `tRange` (`[number, number]` or `[number, number, number]`, default `[0, 1, 0.01]`) — `[t_min, t_max]` or `[t_min, t_max, t_step]`. The step controls sampling density; default `0.01` gives smooth curves at typical scales.
- `color` (`ManimColor`, default `WHITE`).
- `strokeWidth` (`number`, optional) — defaults to the inherited stroke width.

## Properties

- `function` — the original t→Vec3 callback.
- `underlyingFunction` — optional debug callback.
- `tMin`, `tMax`, `tStep` — sampling configuration.

## Minimal examples

A circle traced parametrically:

```ts
import { canvas, ParametricFunction, RED, TAU } from "still-manim-ts";

const circle = new ParametricFunction({
  function: (t) => [Math.cos(t), Math.sin(t), 0],
  yMin: -1.5, yMax: 1.5,
  tRange: [0, TAU, 0.05],
  color: RED,
});
canvas.add(circle);
```

A sideways parabola `x = y²`:

```ts
new ParametricFunction({
  function: (t) => [t * t, t, 0],
  yMin: -3, yMax: 3,
  tRange: [-3, 3, 0.05],
});
```

Plotting onto an existing `Axes` (going through `coordsToPoint`):

```ts
import { Axes } from "still-manim-ts";

const axes = new Axes({ /* … */ });
canvas.add(new ParametricFunction({
  function: (t) => axes.coordsToPoint(Math.cos(t), Math.sin(t)),
  yMin: axes.coordsToPoint(0, -1)[1],
  yMax: axes.coordsToPoint(0,  1)[1],
  tRange: [0, TAU, 0.05],
}));
```

## Common pitfalls

- **`yMin` / `yMax` are scene-space, not graph-space.** When using a ParametricFunction with an `Axes`, convert your graph y-bounds via `axes.coordsToPoint(0, y)[1]` first. (Inside `Axes.plot`, this is handled automatically.)
- **Discontinuities aren't handled.** The sampler steps uniformly through `t`; functions with vertical asymptotes (`tan`) or jumps will draw connecting segments across the discontinuity. Either restrict `tRange` to one branch or split into multiple ParametricFunctions.
- **Default color is WHITE**, not the theme's text color. Set `color` explicitly for light themes (otherwise the curve disappears on a white background).

The y-boundary clip is **interpolated**: the curve ends exactly on `y = yMin` / `y = yMax` regardless of `tStep`. You don't need a tiny step to avoid asymmetric "ramps" at the boundary.
