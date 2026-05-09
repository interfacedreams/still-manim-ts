---
name: SurroundingRectangle
category: annotations
summary: Stroke-only box wrapping a target's bounding box (or filled, for a backdrop). Plus Highlight (translucent fill) and Cross (X mark).
tags: [annotation, box, highlight, cross, frame, callout]
related: [Brace, Underline, Pointer, Tex]
---

# SurroundingRectangle, Highlight, Cross

Three small composites for marking up an existing Mobject. All three derive their geometry from a `target` Mobject's bounding box.

## When to use which

| Want… | Use |
|---|---|
| Outline a result, an answer, "this is the important part" | `SurroundingRectangle` |
| Translucent color wash over a region (highlighter pen on math) | `Highlight` |
| Strike out a wrong step or an excluded value | `Cross` |
| Curly bracket along one side, with a label past it | [`Brace`](./brace.md) |
| Simple horizontal underline | `Underline` |

## SurroundingRectangle

`new SurroundingRectangle(opts: SurroundingRectangleOptions)` — `target` is required.

- `target` (`Mobject`, required) — the Mobject to wrap.
- `buff` (`number`, default `SMALL_BUFF` = `0.1`) — padding between the target's bbox and the rectangle.
- `strokeColor` (`ManimColor`, default `GRAY`) — outline color when no fill is set.
- `strokeWidth`, `strokeOpacity`.
- `fillColor`, `fillOpacity` — when `fillColor` is set, the rectangle becomes a filled backdrop instead of an outline (default goes from stroke-only to fill-only). Pass both `fillColor` *and* `strokeColor` for filled-with-border.
- `cornerRadius` (`number`, default `0`).

### Properties

- `surrounded` — back-reference to the target.
- `buff`.

### Examples

```ts
import { canvas, SurroundingRectangle, Tex, RED, YELLOW } from "still-manim-ts";

const answer = new Tex("x = 5");
canvas.add(answer);
canvas.add(new SurroundingRectangle({ target: answer, strokeColor: RED, buff: 0.15 }));

// Filled backdrop variant — soft yellow card behind the formula.
canvas.add(new SurroundingRectangle({
  target: answer,
  fillColor: YELLOW,
  fillOpacity: 0.2,
  cornerRadius: 0.1,
}));
```

## Highlight

`new Highlight(opts?: HighlightOptions)`

A translucent rectangle, sized either to wrap a `target` or to a custom `width`/`height`. Default fill is `YELLOW` at 35% opacity — the "highlighter pen" look.

- `target` (`Mobject`, optional) — when given, sizes to the target's bbox + `buff`.
- `width`, `height` — used when `target` is omitted.
- `color` (`ManimColor`, default `YELLOW`).
- `opacity` (`number`, default `0.35`).
- `buff` (`number`, default `0.05`).

```ts
import { Highlight, GREEN } from "still-manim-ts";

canvas.add(new Highlight({ target: someTex, color: GREEN }));
```

`Highlight` is also what `Table.highlight(...)` uses under the hood.

## Cross

`new Cross(opts?: CrossOptions)`

Two crossed line segments forming an "X". Either targets a Mobject (sized to bbox) or stands alone (sized via `size`).

- `target` (`Mobject`, optional) — when given, the X spans the target's bbox.
- `size` (`number`, default `0.5`) — used when no target.
- `color` (`ManimColor`, default `RED`).
- `strokeWidth` (`number`, default `4`).

```ts
import { Cross } from "still-manim-ts";

canvas.add(new Cross({ target: wrongStep }));   // strikes through
canvas.add(new Cross({ size: 0.3 }));            // standalone X at origin
```

`Cross` is what `Table.cross(...)` uses under the hood.

## Common pitfalls

- **All three target the *bounding box*, not the visible shape.** For a Mobject with significant whitespace (a sparse Group, a Tex with descenders), the wrapper looks larger than expected. Tighten the target Group before annotating.
- **`SurroundingRectangle`'s default is stroke-only.** Setting just `fillColor` flips it to fill-only and *drops the stroke*. Set `strokeColor` explicitly if you want both.
- **Highlight z-order.** A standalone `Highlight` draws *over* whatever's below it (translucent, but still visible). `Table.highlight` inserts the highlight at the *back* of the table's submobjects so text stays crisp. If you build a Highlight by hand and it covers your label, move it behind the label by inserting it earlier in the parent group's children list.
- **`Cross` and `Highlight` build geometry at construction time.** If the target moves later, the wrapper does *not* follow. Re-create it after movement (or annotate the final position).
