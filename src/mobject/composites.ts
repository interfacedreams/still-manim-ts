import { GRAY, RED, type ManimColor, YELLOW } from "../utils/color.js";
import { SMALL_BUFF } from "../constants.js";
import type { Vec3 } from "../utils/vec.js";
import { Group } from "./group.js";
import { Mobject } from "./mobject.js";
import { Line } from "./geometry/line.js";
import { Rectangle } from "./geometry/polygon.js";

export type CrossOptions = {
  /** When given, the cross is sized to span the target's bbox. */
  target?: Mobject;
  size?: number;
  color?: ManimColor;
  strokeWidth?: number;
};

/** "X" mark — two crossed line segments. Maps to "cross off" instructions. */
export class Cross extends Group {
  constructor(opts: CrossOptions = {}) {
    super();
    const { target, size = 0.5, color = RED, strokeWidth = 4 } = opts;
    let halfW: number;
    let halfH: number;
    let center: Vec3;
    if (target) {
      halfW = target.width / 2;
      halfH = target.height / 2;
      center = target.center;
    } else {
      halfW = size / 2;
      halfH = size / 2;
      center = [0, 0, 0];
    }
    const ul: Vec3 = [center[0] - halfW, center[1] + halfH, 0];
    const ur: Vec3 = [center[0] + halfW, center[1] + halfH, 0];
    const dl: Vec3 = [center[0] - halfW, center[1] - halfH, 0];
    const dr: Vec3 = [center[0] + halfW, center[1] - halfH, 0];
    this.add(
      new Line({ start: ul, end: dr, color, strokeWidth }),
      new Line({ start: dl, end: ur, color, strokeWidth }),
    );
  }
}

export type HighlightOptions = {
  target?: Mobject;
  width?: number;
  height?: number;
  color?: ManimColor;
  opacity?: number;
  buff?: number;
};

/** Translucent box overlaid on (or sized to) a target. Maps to "highlight" instructions. */
export class Highlight extends Rectangle {
  constructor(opts: HighlightOptions = {}) {
    const { target, color = YELLOW, opacity = 0.35, buff = 0.05 } = opts;
    let width: number;
    let height: number;
    let center: Vec3;
    if (target) {
      width = target.width + 2 * buff;
      height = target.height + 2 * buff;
      center = target.center;
    } else {
      width = opts.width ?? 1;
      height = opts.height ?? 1;
      center = [0, 0, 0];
    }
    super({ width, height, fillColor: color, fillOpacity: opacity });
    if (center[0] !== 0 || center[1] !== 0 || center[2] !== 0) this.moveTo(center);
  }
}

export type SurroundingRectangleOptions = {
  /** Mobject the rectangle wraps. Required. */
  target: Mobject;
  /** Stroke color (default GRAY when no fillColor is set). */
  strokeColor?: ManimColor;
  strokeWidth?: number;
  strokeOpacity?: number;
  /** Set to make the rectangle a filled backdrop instead of an outline. */
  fillColor?: ManimColor;
  fillOpacity?: number;
  /** Padding between target bbox and rectangle edges. Default SMALL_BUFF. */
  buff?: number;
  cornerRadius?: number;
};

/**
 * Stroke-only rectangle wrapping a target's bounding box, plus optional padding.
 * Mirrors smanim.mobject.geometry.shape_matchers.SurroundingRectangle.
 */
export class SurroundingRectangle extends Rectangle {
  buff: number;
  surrounded: Mobject;
  constructor(opts: SurroundingRectangleOptions) {
    const { target, buff = SMALL_BUFF, cornerRadius = 0 } = opts;
    const rectOpts: ConstructorParameters<typeof Rectangle>[0] = {
      width: target.width + 2 * buff,
      height: target.height + 2 * buff,
      cornerRadius,
    };
    // Mirror Python: outline by default, filled-only if caller passes fillColor and no stroke.
    if (opts.fillColor !== undefined) rectOpts.fillColor = opts.fillColor;
    if (opts.fillOpacity !== undefined) rectOpts.fillOpacity = opts.fillOpacity;
    if (opts.strokeColor !== undefined) rectOpts.strokeColor = opts.strokeColor;
    else if (opts.fillColor === undefined) rectOpts.defaultStrokeColor = GRAY;
    if (opts.strokeWidth !== undefined) rectOpts.strokeWidth = opts.strokeWidth;
    if (opts.strokeOpacity !== undefined) rectOpts.strokeOpacity = opts.strokeOpacity;
    super(rectOpts);
    this.buff = buff;
    this.surrounded = target;
    this.moveTo(target.center);
  }
}
