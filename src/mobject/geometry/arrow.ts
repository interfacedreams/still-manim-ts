import { CONFIG } from "../../config.js";
import { DOWN, LEFT, ORIGIN, PI, RIGHT, TINY_BUFF } from "../../constants.js";
import type { Vec3 } from "../../utils/vec.js";
import { Mobject } from "../mobject.js";
import { Line, type LineOptions } from "./line.js";
import {
  ArrowTriangleFilledTip,
  type ArrowTriangleTip,
  type ArrowTipOptions,
  type TipShapeFactory,
} from "./tips.js";

export type ArrowOptions = LineOptions & {
  tipLength?: number;
  tipWidth?: number;
  tipScalar?: number;
  tipShape?: TipShapeFactory;
  atStart?: boolean;
  atEnd?: boolean;
  tipConfig?: ArrowTipOptions;
};

class TipableLine extends Line {
  /** Shrinks the line by tipLength to make room and constructs a tip aligned to the line. */
  createTip(
    tipShape: TipShapeFactory,
    tipLength: number,
    tipWidth: number,
    atStart: boolean,
    extraTipOpts: ArrowTipOptions = {},
  ): ArrowTriangleTip {
    const lineStart = this.start;
    const lineLength = this.length;
    const lineDir = this.direction; // unit vector start→end
    this.scale((lineLength - tipLength) / lineLength, lineStart);
    if (atStart) {
      this.shift([lineDir[0] * tipLength, lineDir[1] * tipLength, lineDir[2] * tipLength]);
    }
    const tip = tipShape({
      length: tipLength,
      width: tipWidth,
      defaultFillColor: this.strokeColor ?? CONFIG.defaultTextColor,
      ...extraTipOpts,
    });
    const rotateScalar = atStart ? 1 : -1;
    tip.rotate(this.angle + rotateScalar * (PI / 2));
    const anchor = atStart ? this.start : this.end;
    const base = tip.base;
    tip.shift([anchor[0] - base[0], anchor[1] - base[1], anchor[2] - base[2]]);
    return tip;
  }
}

export class Arrow extends TipableLine {
  startTip: ArrowTriangleTip | null = null;
  endTip: ArrowTriangleTip | null = null;

  constructor(opts: ArrowOptions = {}) {
    const {
      start = LEFT,
      end = RIGHT,
      color = CONFIG.defaultTextColor,
      opacity = 1.0,
      buff = 0,
      tipLength = 0.2,
      tipWidth = 0.2,
      tipScalar = 1.0,
      tipShape = (o) => new ArrowTriangleFilledTip(o),
      atStart = false,
      atEnd = true,
      tipConfig = {},
      ...rest
    } = opts;
    super({ ...rest, start, end, color, opacity, buff });
    if (atEnd) {
      this.endTip = this.createTip(tipShape, tipLength * tipScalar, tipWidth * tipScalar, false, tipConfig);
      this.add(this.endTip);
    }
    if (atStart) {
      this.startTip = this.createTip(tipShape, tipLength * tipScalar, tipWidth * tipScalar, true, tipConfig);
      this.add(this.startTip);
    }
    this.setColor(color);
    this.setOpacity(opacity);
  }

  override get start(): Vec3 {
    if (this.startTip) return this.startTip.tipPoint;
    return super.start;
  }

  override get end(): Vec3 {
    if (this.endTip) return this.endTip.tipPoint;
    return super.end;
  }

  static pointsAt(
    target: Mobject | Vec3,
    direction: Vec3 = DOWN,
    length = 1.0,
    buff = TINY_BUFF,
    arrowConfig: Omit<ArrowOptions, "start" | "end"> = {},
  ): Arrow {
    const dn = Math.hypot(direction[0], direction[1], direction[2]);
    const dir: Vec3 = [direction[0] / dn, direction[1] / dn, direction[2] / dn];
    let endPt: Vec3;
    if (target instanceof Mobject) {
      const c = target.center;
      const intersection = target.getClosestIntersectingPoint2d([c[0], c[1]], [-dir[0], -dir[1]]);
      endPt = [intersection[0] - buff * dir[0], intersection[1] - buff * dir[1], intersection[2] - buff * dir[2]];
    } else {
      endPt = [target[0] - buff * dir[0], target[1] - buff * dir[1], target[2] - buff * dir[2]];
    }
    const startPt: Vec3 = [endPt[0] - dir[0] * length, endPt[1] - dir[1] * length, endPt[2] - dir[2] * length];
    return new Arrow({ ...arrowConfig, start: startPt, end: endPt });
  }
}

export class Vector extends Arrow {
  constructor(direction: Vec3 = RIGHT, opts: Omit<ArrowOptions, "start" | "end"> = {}) {
    super({ ...opts, start: ORIGIN, end: direction });
  }
}
