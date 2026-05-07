import { ORIGIN, OUT, PI } from "../constants.js";
import type { Vec3 } from "../utils/vec.js";
import { matVec, rotationMatrix } from "../utils/space_ops.js";
import { Mobject } from "./mobject.js";

export abstract class TransformableMobject extends Mobject {
  override rotate(angle: number = PI / 4, axis: Vec3 = OUT, aboutPoint: Vec3 | null = ORIGIN): this {
    for (const m of this.submobjects) m.rotate(angle, axis, aboutPoint);
    return this;
  }

  override scale(factor: number, aboutPoint: Vec3 | null = ORIGIN): this {
    for (const m of this.submobjects) m.scale(factor, aboutPoint);
    return this;
  }

  override stretch(factor: number, dim: 0 | 1 | 2): this {
    for (const m of this.submobjects) m.stretch(factor, dim);
    return this;
  }

  override shift(vector: Vec3): this {
    for (const m of this.submobjects) m.shift(vector);
    return this;
  }

  // -- Helpers that operate on point arrays -----------------------------------
  protected rotatePoints(points: Vec3[], angle: number, axis: Vec3, aboutPoint: Vec3 | null): Vec3[] {
    const ap = aboutPoint ?? this.getCriticalPoint(ORIGIN);
    const R = rotationMatrix(angle, axis);
    return points.map((p) => {
      const shifted: Vec3 = [p[0] - ap[0], p[1] - ap[1], p[2] - ap[2]];
      const rot = matVec(R, shifted);
      return [rot[0] + ap[0], rot[1] + ap[1], rot[2] + ap[2]];
    });
  }

  protected scalePoints(points: Vec3[], factor: number, aboutPoint: Vec3 | null): Vec3[] {
    const ap = aboutPoint ?? this.center;
    if (ap[0] === 0 && ap[1] === 0 && ap[2] === 0) {
      return points.map((p) => [p[0] * factor, p[1] * factor, p[2] * factor]);
    }
    return points.map((p) => [
      (p[0] - ap[0]) * factor + ap[0],
      (p[1] - ap[1]) * factor + ap[1],
      (p[2] - ap[2]) * factor + ap[2],
    ]);
  }

  protected stretchPoints(points: Vec3[], factor: number, dim: 0 | 1 | 2): Vec3[] {
    return points.map((p) => {
      const out: [number, number, number] = [p[0], p[1], p[2]];
      out[dim] *= factor;
      return out;
    });
  }

  protected shiftPoints(points: Vec3[], v: Vec3): Vec3[] {
    return points.map((p) => [p[0] + v[0], p[1] + v[1], p[2] + v[2]]);
  }

  // -- Convenience ------------------------------------------------------------
  stretchToFitWidth(width: number): this {
    if (this.width === 0) return this;
    return this.stretch(width / this.width, 0);
  }
  stretchToFitHeight(height: number): this {
    if (this.height === 0) return this;
    return this.stretch(height / this.height, 1);
  }
  scaleToFitWidth(width: number): this {
    if (this.width === 0) return this;
    return this.scale(width / this.width);
  }
  scaleToFitHeight(height: number): this {
    if (this.height === 0) return this;
    return this.scale(height / this.height);
  }
}
