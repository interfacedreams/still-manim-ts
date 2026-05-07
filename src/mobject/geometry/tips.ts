import { CONFIG } from "../../config.js";
import { DEFAULT_ARROW_TIP_LENGTH } from "../../constants.js";
import { hasDefaultColorsSet, type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { Triangle, type TriangleOptions } from "./polygon.js";

export type ArrowTipOptions = TriangleOptions & {
  length?: number;
  width?: number;
};

/**
 * Triangular arrow tip. Extends Triangle (rather than introducing a separate
 * ArrowTip mixin) so transforms and bbox math come for free. The tip points
 * along the +x axis after construction; Arrow rotates it into place.
 */
export class ArrowTriangleTip extends Triangle {
  constructor(opts: ArrowTipOptions = {}) {
    const length = opts.length ?? DEFAULT_ARROW_TIP_LENGTH;
    const width = opts.width ?? DEFAULT_ARROW_TIP_LENGTH;
    super(opts);
    this.stretchToFitWidth(width);
    this.stretchToFitHeight(length);
  }

  /** Tip apex — first vertex of the underlying Triangle. */
  get tipPoint(): Vec3 {
    const v = this._vertices[0]!;
    return [v[0], v[1], v[2]];
  }

  /** Midpoint of the back edge (between vertices 1 and 2). */
  get base(): Vec3 {
    const v1 = this._vertices[1]!, v2 = this._vertices[2]!;
    return [(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2, (v1[2] + v2[2]) / 2];
  }

  get vector(): Vec3 {
    const t = this.tipPoint, b = this.base;
    return [t[0] - b[0], t[1] - b[1], t[2] - b[2]];
  }

  get tipAngle(): number {
    const v = this.vector;
    return Math.atan2(v[1], v[0]);
  }
}

export class ArrowTriangleFilledTip extends ArrowTriangleTip {
  constructor(opts: ArrowTipOptions & { color?: ManimColor } = {}) {
    const { color, ...rest } = opts;
    if (!hasDefaultColorsSet(rest)) {
      (rest as ArrowTipOptions).defaultFillColor = color ?? CONFIG.defaultTextColor;
    }
    super(rest);
  }
}

export type TipShapeFactory = (opts: ArrowTipOptions) => ArrowTriangleTip;
