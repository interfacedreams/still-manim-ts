import { DEFAULT_STROKE_WIDTH, ORIGIN, OUT, PI } from "../constants.js";
import { WHITE, type ManimColor } from "../utils/color.js";
import type { Vec3 } from "../utils/vec.js";
import { interpolate, linspace01 } from "../utils/bezier.js";
import { TransformableMobject } from "./transformable.js";

export const POINTS_PER_CURVE = 4;

export type VMobjectOptions = {
  zIndex?: number;
  color?: ManimColor;
  opacity?: number;
  strokeColor?: ManimColor;
  strokeOpacity?: number;
  strokeWidth?: number;
  fillColor?: ManimColor;
  fillOpacity?: number;
  dashed?: boolean;
  // Subclass defaults (mirror Python's default_stroke_color/default_fill_color)
  defaultStrokeColor?: ManimColor;
  defaultFillColor?: ManimColor;
  isClosed?: boolean;
};

export abstract class VMobject extends TransformableMobject {
  /** Bezier control points, 4-per-curve. Length always divisible by 4. */
  protected _points: Vec3[] = [];

  isClosed: boolean;

  strokeColor: ManimColor | null;
  strokeOpacity: number | null;
  strokeWidth: number | null;

  fillColor: ManimColor | null;
  fillOpacity: number | null;

  strokeDasharray: string;

  constructor(opts: VMobjectOptions = {}) {
    super({ zIndex: opts.zIndex ?? 0 });
    this.isClosed = opts.isClosed ?? true;
    // Subclasses MUST call generatePoints() themselves after they finish setting
    // up their own state (vertex lists, radius, etc). We don't auto-call it from
    // here because TS forbids touching subclass fields before super() returns.

    let { fillColor, strokeColor, fillOpacity, strokeOpacity, strokeWidth, color, opacity } = opts;
    const { defaultFillColor, defaultStrokeColor } = opts;
    if (fillColor === undefined && strokeColor === undefined) {
      if (color !== undefined) {
        fillColor = color;
        if (fillOpacity === undefined) fillOpacity = opacity ?? 1.0;
      } else if (defaultFillColor === undefined && defaultStrokeColor !== undefined) {
        strokeColor = defaultStrokeColor;
        if (strokeOpacity === undefined) strokeOpacity = opacity ?? 1.0;
        if (strokeWidth === undefined) strokeWidth = 4.0;
      } else {
        fillColor = defaultFillColor ?? WHITE;
        if (fillOpacity === undefined) fillOpacity = 1.0;
      }
    } else {
      if (color !== undefined) {
        throw new Error("`color` cannot be set when `fillColor` or `strokeColor` is set.");
      }
      if (strokeColor !== undefined) {
        strokeOpacity = strokeOpacity ?? 1.0;
        strokeWidth = strokeWidth ?? DEFAULT_STROKE_WIDTH;
      }
      if (fillColor !== undefined) {
        fillOpacity = fillOpacity ?? 1.0;
      }
    }

    this.strokeColor = strokeColor ?? null;
    this.strokeOpacity = strokeOpacity ?? null;
    this.strokeWidth = strokeWidth ?? null;
    this.fillColor = fillColor ?? null;
    this.fillOpacity = fillOpacity ?? null;
    this.strokeDasharray = opts.dashed ? "8 8" : "none";
  }

  abstract generatePoints(): void;

  // -- Points access (with bounding-points invariant) --------------------------
  get points(): readonly Vec3[] { return this._points; }
  setPoints(newPoints: Vec3[]): void {
    if (newPoints.length % POINTS_PER_CURVE !== 0) {
      throw new Error(`points length must be divisible by ${POINTS_PER_CURVE}`);
    }
    this._points = newPoints;
    // Bounding points = start anchors; if open, append the final end anchor.
    const starts = this.getStartAnchors();
    if (!this.isClosed && this._points.length > 0) {
      starts.push(this.getEndAnchors().at(-1)!);
    }
    this.boundingPoints = starts;
  }

  getStartAnchors(): Vec3[] {
    const out: Vec3[] = [];
    for (let i = 0; i < this._points.length; i += POINTS_PER_CURVE) out.push(this._points[i]!);
    return out;
  }

  getEndAnchors(): Vec3[] {
    const out: Vec3[] = [];
    for (let i = POINTS_PER_CURVE - 1; i < this._points.length; i += POINTS_PER_CURVE) {
      out.push(this._points[i]!);
    }
    return out;
  }

  getPointsInQuads(points: readonly Vec3[]): Array<readonly [Vec3, Vec3, Vec3, Vec3]> {
    if (points.length % 4 !== 0) throw new Error("Points must be divisible by 4");
    const quads: Array<readonly [Vec3, Vec3, Vec3, Vec3]> = [];
    for (let i = 0; i < points.length; i += 4) {
      quads.push([points[i]!, points[i + 1]!, points[i + 2]!, points[i + 3]!]);
    }
    return quads;
  }

  // -- Curve helpers -----------------------------------------------------------
  genBezierQuadFromLine(start: Vec3, end: Vec3): Vec3[] {
    return linspace01(POINTS_PER_CURVE).map((a) => interpolate(start, end, a));
  }

  // -- Style ops ---------------------------------------------------------------
  setFill(color?: ManimColor, opacity?: number, family = false): this {
    if (color !== undefined) this.fillColor = color;
    if (opacity !== undefined) this.fillOpacity = opacity;
    if (family) {
      for (const m of this.getFamily().slice(1)) {
        if (m instanceof VMobject) m.setFill(color, opacity, true);
      }
    }
    return this;
  }

  setStroke(color?: ManimColor, width?: number, opacity?: number, family = false): this {
    if (color !== undefined) this.strokeColor = color;
    if (width !== undefined) this.strokeWidth = width;
    if (opacity !== undefined) this.strokeOpacity = opacity;
    if (family) {
      for (const m of this.getFamily().slice(1)) {
        if (m instanceof VMobject) m.setStroke(color, width, opacity, true);
      }
    }
    return this;
  }

  hasStroke(): boolean {
    if (this.strokeColor) return true;
    if (this.fillColor) return false;
    return true;
  }

  hasFill(): boolean {
    return this.fillColor !== null;
  }

  override setColor(color: ManimColor, family = true): this {
    if (this.hasStroke()) this.strokeColor = color;
    if (this.hasFill()) this.fillColor = color;
    if (family) {
      for (const m of this.getFamily().slice(1)) m.setColor(color, true);
    }
    return this;
  }

  override setOpacity(opacity: number, family = true): this {
    if (this.strokeColor) this.strokeOpacity = opacity;
    else if (this.fillColor) this.fillOpacity = opacity;
    if (family) {
      for (const m of this.getFamily().slice(1)) m.setOpacity(opacity, true);
    }
    return this;
  }

  // -- Core transforms (override to apply to own points + recurse) ------------
  override rotate(angle = PI / 4, axis: Vec3 = OUT, aboutPoint: Vec3 | null = ORIGIN): this {
    this.setPoints(this.rotatePoints(this._points, angle, axis, aboutPoint));
    for (const m of this.submobjects) m.rotate(angle, axis, aboutPoint);
    return this;
  }

  override scale(factor: number, aboutPoint: Vec3 | null = ORIGIN): this {
    this.setPoints(this.scalePoints(this._points, factor, aboutPoint));
    for (const m of this.submobjects) m.scale(factor, aboutPoint);
    return this;
  }

  override stretch(factor: number, dim: 0 | 1 | 2): this {
    this.setPoints(this.stretchPoints(this._points, factor, dim));
    for (const m of this.submobjects) m.stretch(factor, dim);
    return this;
  }

  override shift(vector: Vec3): this {
    this.setPoints(this.shiftPoints(this._points, vector));
    for (const m of this.submobjects) m.shift(vector);
    return this;
  }
}
