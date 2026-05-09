---
name: Axes
category: graphing
summary: 2D coordinate system built from two NumberLines; provides `plot(fn)` and `coordsToPoint(x, y)`.
tags: [graphing, axes, plot, function]
related: [NumberLine, NumberPlane, ParametricFunction]
---

# Axes

## Description

A 2D coordinate system: an x-axis `NumberLine` and a y-axis `NumberLine`, joined at the origin. Use it as the host for a function plot or for placing labeled points in graph coordinates.

Inherits from `Group`, so it composes like any other Mobject (`shift`, `scale`, `nextTo`, `add`).

## When to use

- Showing a graphed function (`y = mx + b`, parabolas, sinusoids).
- Placing a labeled point at a logical coordinate — call `axes.coordsToPoint(x, y)` to convert math coords to scene coords, then position a `Dot` or `Tex` there.
- **Use `NumberPlane` instead** when you want background grid lines as well (algebra graphs typically read better with a grid).
- **Use `NumberLine` directly** when you need only one axis (inequalities, intervals).
- **Don't** build axes from raw `Line` + `Arrow` — you'll lose `coordToPoint` and `plot`.

## Constructor parameters

`new Axes(opts?: AxesOptions)` — all optional; sensible defaults fill the canvas.

- `xAxis` (`NumberLine`) — pre-built x-axis. Default: integer ticks across the canvas width.
- `yAxis` (`NumberLine`) — pre-built y-axis. Default: integer ticks across the canvas height.
- `numSampledGraphPointsPerTick` (`number`, default `8`) — sampling density for `plot()`. Higher = smoother curve, more points.

For `NumberPlane` (subclass), additional options:

- `coordStepSize` (`number`, default `0.5`) — spacing between grid lines, in graph units.
- `gridLines` (`boolean`, default `true`) — draw the grid.
- `gridLineConfig` (`LineOptions`) — color/width/opacity for grid lines. Default: `BLUE_D`, stroke 1, opacity 0.5.

When you want explicit ranges (most algebra examples), prefer the static helper:

```ts
NumberPlane.fromAxesRanges({
  xAxisRange: [-5, 5, 1],     // [min, max, step]
  yAxisRange: [-3, 5, 1],
  fillCanvas: true,            // stretch to canvas size; pass false + xLength/yLength for a fixed size
  axisConfig: { includeNumbers: true },
})
```

## Methods

- `coordsToPoint(x: number, y: number): Vec3` — graph-space `(x, y)` to scene-space point. Use this for **all** placement of dots / labels / annotations on the plot.
- `plot(fn, opts?): ParametricFunction` — sample `y = fn(x)` over the x-axis range. `opts.xRange` (`[min, max]` or `[min, max, step]`) overrides the default range. Other `opts` pass through to `ParametricFunction` (`color`, `strokeWidth`).

## Minimal example

```ts
import { canvas, NumberPlane, RED } from "still-manim-ts";

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-5, 5, 1],
  yAxisRange: [-3, 5, 1],
  fillCanvas: true,
});
plane.plot((x) => 0.5 * x + 1, { color: RED });

canvas.add(plane);
canvas.toSVG();
```

## Common pitfalls

- **`coordsToPoint`, not raw coords.** A `Dot` at `[2, 3, 0]` lands at scene position (2, 3) — *not* at graph-space (2, 3). Always go through `axes.coordsToPoint(2, 3)`.
- **Plot range vs. axis range.** `plot()` defaults to the x-axis range, but the *curve* can still draw outside the y-axis range — points with `y` outside `[yMin, yMax]` get clipped at sample time. Set a tighter `opts.xRange` if you want the curve to start/stop at specific x values.
- **`fillCanvas: true` ignores `xLength`/`yLength`.** Pass `fillCanvas: false` if you want a fixed-size plot inside a larger composition.
- **Sample density.** Default `numSampledGraphPointsPerTick: 8` is fine for smooth curves. For sharp features (e.g. cusps) bump it, or pass an explicit `xRange` step.
