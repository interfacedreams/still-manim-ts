import { CONFIG } from "../../config.js";
import { LEFT, ORIGIN, RIGHT } from "../../constants.js";
import type { ManimColor } from "../../utils/color.js";
import { angleFromVector } from "../../utils/space_ops.js";
import type { Vec3 } from "../../utils/vec.js";
import { Mobject } from "../mobject.js";
import { VMobject, type VMobjectOptions } from "../vmobject.js";

export type LineOptions = Omit<VMobjectOptions, "isClosed" | "color" | "opacity" | "fillColor" | "fillOpacity"> & {
  start?: Vec3 | Mobject;
  end?: Vec3 | Mobject;
  buff?: number;
  color?: ManimColor;
  opacity?: number;
};

export class Line extends VMobject {
  protected _startPt: Vec3 = [0, 0, 0];
  protected _endPt: Vec3 = [0, 0, 0];
  buff: number;

  constructor(opts: LineOptions = {}) {
    const {
      start = LEFT,
      end = RIGHT,
      buff = 0.0,
      color = CONFIG.defaultTextColor,
      opacity = 1.0,
      strokeColor,
      strokeOpacity,
      ...rest
    } = opts;
    const finalColor = strokeColor ?? color;
    const finalOpacity = strokeOpacity ?? opacity;
    const [startPt, endPt] = Line.findLineAnchors(start, end);
    const dx = endPt[0] - startPt[0], dy = endPt[1] - startPt[1], dz = endPt[2] - startPt[2];
    const len = Math.hypot(dx, dy, dz);
    if (2 * buff > len) throw new Error("Buff is larger than 2 * line_length");
    const dir: Vec3 = [dx / len, dy / len, dz / len];
    const sp: Vec3 = [startPt[0] + buff * dir[0], startPt[1] + buff * dir[1], startPt[2] + buff * dir[2]];
    const ep: Vec3 = [endPt[0] - buff * dir[0], endPt[1] - buff * dir[1], endPt[2] - buff * dir[2]];

    super({ ...rest, isClosed: false, strokeColor: finalColor, strokeOpacity: finalOpacity });
    this._startPt = sp;
    this._endPt = ep;
    this.buff = buff;
    this.generatePoints();
  }

  override generatePoints(): void {
    if (!this._startPt || !this._endPt) {
      this.setPoints([]);
      return;
    }
    const start = this._startPt, end = this._endPt;
    const dir: Vec3 = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
    const p1: Vec3 = [start[0] + dir[0] / 3, start[1] + dir[1] / 3, start[2] + dir[2] / 3];
    const p2: Vec3 = [start[0] + 2 * dir[0] / 3, start[1] + 2 * dir[1] / 3, start[2] + 2 * dir[2] / 3];
    this.setPoints([start, p1, p2, end]);
  }

  get start(): Vec3 {
    const p = this._points[0]!;
    return [p[0], p[1], p[2]];
  }

  get end(): Vec3 {
    const p = this._points[this._points.length - 1]!;
    return [p[0], p[1], p[2]];
  }

  setStartAndEnd(start: Vec3, end: Vec3): void {
    this._startPt = [start[0], start[1], start[2]];
    this._endPt = [end[0], end[1], end[2]];
    this.generatePoints();
  }

  get direction(): Vec3 {
    const s = this.start, e = this.end;
    const dx = e[0] - s[0], dy = e[1] - s[1], dz = e[2] - s[2];
    const n = Math.hypot(dx, dy, dz);
    return [dx / n, dy / n, dz / n];
  }

  get angle(): number {
    return angleFromVector(this.direction);
  }

  get length(): number {
    const s = this.start, e = this.end;
    return Math.hypot(e[0] - s[0], e[1] - s[1], e[2] - s[2]);
  }

  get midpoint(): Vec3 {
    const s = this.start, e = this.end;
    return [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2, (s[2] + e[2]) / 2];
  }

  override scale(factor: number, aboutPoint: Vec3 | null = ORIGIN): this {
    if (this.strokeWidth !== null) this.strokeWidth *= factor;
    return super.scale(factor, aboutPoint);
  }

  static findLineAnchors(start: Vec3 | Mobject, end: Vec3 | Mobject): [Vec3, Vec3] {
    const roughStart: Vec3 = start instanceof Mobject ? start.center : (start as Vec3);
    const roughEnd: Vec3 = end instanceof Mobject ? end.center : (end as Vec3);
    const dir: Vec3 = [roughEnd[0] - roughStart[0], roughEnd[1] - roughStart[1], 0];

    const startPt: Vec3 = start instanceof Mobject
      ? start.getClosestIntersectingPoint2d([roughStart[0], roughStart[1]], [dir[0], dir[1]])
      : ([start[0], start[1], start[2]] as Vec3);
    const newDir: Vec3 = [roughEnd[0] - startPt[0], roughEnd[1] - startPt[1], 0];
    let endPt: Vec3 = end instanceof Mobject
      ? end.getClosestIntersectingPoint2d([startPt[0], startPt[1]], [newDir[0], newDir[1]])
      : ([end[0], end[1], end[2]] as Vec3);

    if (endPt[0] === startPt[0] && endPt[1] === startPt[1] && endPt[2] === startPt[2]) {
      endPt = [endPt[0] + 0.0001, endPt[1] + 0.0001, endPt[2] + 0.0001];
    }
    return [startPt, endPt];
  }
}
