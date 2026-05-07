import { DEFAULT_DOT_RADIUS, ORIGIN, TAU } from "../../constants.js";
import { BLUE, WHITE, hasDefaultColorsSet, type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { Arc, type ArcOptions } from "./arc.js";

export type CircleOptions = Omit<ArcOptions, "startAngle" | "angle"> & {
  radius?: number;
};

export class Circle extends Arc {
  constructor(opts: CircleOptions = {}) {
    const merged: ArcOptions = { ...opts, startAngle: 0, angle: TAU };
    if (!hasDefaultColorsSet(opts)) merged.defaultFillColor = BLUE;
    super(merged);
  }
}

export type DotOptions = Omit<CircleOptions, "arcCenter"> & {
  point?: Vec3;
  color?: ManimColor;
};

export class Dot extends Circle {
  constructor(opts: DotOptions = {}) {
    const { point = ORIGIN, radius = DEFAULT_DOT_RADIUS, color, ...rest } = opts;
    const merged: CircleOptions = { ...rest, radius, arcCenter: point };
    if (!hasDefaultColorsSet(rest)) merged.defaultFillColor = color ?? WHITE;
    super(merged);
  }
}
