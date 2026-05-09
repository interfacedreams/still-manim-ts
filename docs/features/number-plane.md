---
name: NumberPlane
category: graphing
summary: Axes plus background grid lines. Same plotting API as Axes; use it whenever a graph reads better with a grid.
tags: [graphing, number-plane, grid, coordinate-system]
related: [Axes, NumberLine, ParametricFunction]
---

# NumberPlane

## Description

A subclass of `Axes` that adds a background grid. The grid is drawn behind the axes (z-ordered to the back of the group) and uses thin colored lines at a configurable spacing.

For algebra graphs, this is usually what you want — the grid makes coordinate reading possible. Use bare `Axes` only when the grid would be visual noise (e.g. a stylized illustration or a precalc figure where the curve is the focus).

## When to use

- Graphing a line, parabola, or any function where students need to read off coordinates.
- Showing a single point or set of points on the plane.
- Pairing a graph with a function table — the grid lets students draw the connection.
- **Use `Axes` instead** when the grid would crowd the figure (e.g. you're drawing a unit circle, a single curve over a wide range, or an artistic-style diagram).

## Constructor

Two ways to build one:

### `NumberPlane.fromAxesRanges(opts)` — recommended

The static helper. Pass desired x/y ranges directly; lengths default to filling the canvas.

```ts
NumberPlane.fromAxesRanges({
  xAxisRange: [-5, 5, 1],          // [min, max, step]
  yAxisRange: [-3, 5, 1],
  fillCanvas: true,                // stretch to canvas size (default)
  axisConfig: { includeNumbers: true },
  planeOptions: { coordStepSize: 0.5 },
});
```

Arguments:

- `xAxisRange`, `yAxisRange` (`[number, number]` or `[number, number, number]`) — required.
- `fillCanvas` (`boolean`, default `true`) — when `true`, the plane stretches to `CONFIG.fw` / `CONFIG.fh`. When `false`, the plane uses `xLength` / `yLength`.
- `xLength`, `yLength` (`number`, default `4`) — used only when `fillCanvas` is `false`.
- `axisConfig` (`NumberLineOptions`) — passed to *both* axes' `NumberLine` constructors. Useful for `includeNumbers`, `tickSize`, etc.
- `planeOptions` (`Omit<NumberPlaneOptions, "xAxis" | "yAxis">`) — grid configuration (`coordStepSize`, `gridLines`, `gridLineConfig`).

### `new NumberPlane(opts)` — manual

When you've already built bespoke axes:

- `xAxis`, `yAxis` (`NumberLine`) — hand-built axes; without these, defaults to integer ticks across the canvas.
- `coordStepSize` (`number`, default `0.5`) — spacing between grid lines, in graph units.
- `gridLines` (`boolean`, default `true`) — draw the grid. Set `false` to fall back to `Axes` behavior.
- `gridLineConfig` (`LineOptions`) — color/width/opacity. Default: `BLUE_D`, stroke 1, opacity 0.5.

## Methods

Inherits everything from `Axes`:

- `coordsToPoint(x, y): Vec3` — graph coords → scene coords. **Use this for placement.**
- `plot(fn, opts?): ParametricFunction` — sample `y = fn(x)` over the x-axis range.

## Properties

- `xAxis`, `yAxis` (`NumberLine`) — the two axes (you can read `.xMin`, `.xMax`, `.stepSize` etc. off these).
- `gridLines` (`Group | null`) — the grid as a Group of Lines (null when `gridLines: false`).

## Minimal examples

```ts
import { canvas, NumberPlane, RED } from "still-manim-ts";

const plane = NumberPlane.fromAxesRanges({
  xAxisRange: [-5, 5, 1],
  yAxisRange: [-3, 5, 1],
  fillCanvas: true,
});
plane.plot((x) => 0.5 * x + 1, { color: RED });
canvas.add(plane);
```

Sparser grid (every 1 unit instead of every 0.5):

```ts
NumberPlane.fromAxesRanges({
  xAxisRange: [-5, 5, 1],
  yAxisRange: [-5, 5, 1],
  planeOptions: { coordStepSize: 1 },
});
```

## Common pitfalls

- **`fromAxesRanges` is the right entry point 90% of the time.** The bare constructor is for cases where you've pre-built one or both axes (e.g. you want a non-uniform tick spacing on the x-axis only).
- **`coordStepSize` is in *graph units*, not scene units.** A step of `0.5` on a plane that spans `[-5, 5]` produces 21 vertical grid lines.
- **`fillCanvas: true` overrides `xLength` / `yLength`.** If you pass both, the canvas-fill wins.
- **The grid is anchored to 0, not `xMin`.** A grid line lands on the y-axis if 0 is in range — diverges from Python smanim's offset-based grid for non-aligned ranges (`[-π, π]`), which is a deliberate choice for clean visuals.
- **Same plotting gotchas as Axes**: use `coordsToPoint(x, y)` for all placement, not raw Vec3.
