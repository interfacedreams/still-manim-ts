import { ORIGIN, OUT, PI } from "../constants.js";
import type { Vec3 } from "../utils/vec.js";
import { Mobject } from "./mobject.js";

/** Plain Group — pass-through transforms, no points of its own. */
export class Group extends Mobject {
  constructor(...mobjects: Mobject[]) {
    super();
    this.add(...mobjects);
  }

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
}
