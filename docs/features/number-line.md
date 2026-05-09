---
name: NumberLine
category: graphing
summary: A 1D number line with ticks, labels, and arrow tips. Use standalone for inequalities/intervals, or pass into Axes.
tags: [graphing, number-line, inequality, interval, 1d]
related: [Axes, NumberPlane, Tex, Dot]
---

# NumberLine

## Description

A horizontal (or vertical) line with evenly-spaced ticks, optional numeric labels, and arrow tips at both ends. Inherits from `Group`.

## When to use

- Inequalities (`x > 2`, `−1 ≤ x < 3`) — number line + open/closed dot + ray/segment.
- Intervals on the real line.
- A single axis when you don't need a 2D plane (e.g. teaching ordering of integers, fractions, or absolute value).
- As an x- or y-axis inside `Axes` / `NumberPlane` (constructor accepts a pre-built `NumberLine`).
- **Use `Axes` / `NumberPlane` instead** when you need 2D plotting.
- **Don't** build it from raw `Line` + `Arrow` — you'll lose `coordToPoint` and the auto-generated ticks/labels.

## Constructor parameters

`new NumberLine(opts?: NumberLineOptions)` — all optional.

- `xRange` (`[number, number]` or `[number, number, number]`, default `[-2, 2, 1]`) — `[min, max]` or `[min, max, step]`. The step controls tick spacing. Throws if `max ≤ min`.
- `length` (`number`, default = full canvas width `CONFIG.fw`) — physical length in scene units. Set explicitly when embedding inside a layout.
- `isHorizontal` (`boolean`, default `true`) — `false` rotates 90° into a vertical number line.
- `includeTicks` (`boolean`, default `true`).
- `includeOriginTick` (`boolean`, default `true`) — set `false` to suppress the tick at 0 (e.g. when ticks would crowd the axis label).
- `includeNumbers` (`boolean`, default `true`) — numeric labels under each tick.
- `numbersFontSize` (`number`, default `16`).
- `tickSize` (`number`, default `0.1`) — half-height of each tick mark in scene units.
- `includeArrowTips` (`boolean`, default `true`) — arrow tips at both ends signaling "this continues".
- `startArrowTip`, `endArrowTip` (`Arrow | null`) — supply a pre-built arrow to override either tip; pass `null` to drop one.
- `strokeWidth` (`number`, default `2.0`), `color` (`ManimColor`, default = text color).

## Methods

- `coordToPoint(value: number): Vec3` — number-line coordinate → scene-space point. **Use this for placing dots, labels, and rays.** Extrapolates past `xMin`/`xMax`.
- `stepSize` (getter) — scene-space distance per unit on the line.
- `length` (getter) — total length including arrow tips.
- `getTickRange(): number[]` — the numeric values where ticks are drawn (anchored to multiples of `xStep`).

Plus everything inherited from `Group` (`.shift`, `.moveTo`, `.scale`, `.rotate`, `.nextTo`).

## Minimal example

```ts
import { canvas, NumberLine } from "still-manim-ts";

const nl = new NumberLine({ xRange: [-5, 5, 1], length: 8 });
canvas.add(nl);
```

## Common pitfalls

- **`coordToPoint`, not raw `Vec3`.** A `Dot` at `[2, 0, 0]` lands at scene position 2 — *not* at number-line value 2 (unless the line happens to be centered at the origin with stepSize = 1). Always go through `numberLine.coordToPoint(2)`.
- **Default length fills the canvas.** If you want a smaller line (e.g. for a panel), set `length` explicitly.
- **Vertical lines.** Setting `isHorizontal: false` rotates the whole group; tick labels still render below (now to the *left*) of each tick. The math still works — `coordToPoint(2)` returns the right scene point — but verify visually.
- **Crowded labels for non-integer steps.** If you set `xRange: [0, 1, 0.1]` you'll get 11 labels, which usually overlap. Either widen `length`, or pass `includeNumbers: false` and add a sparser set of labels manually.
