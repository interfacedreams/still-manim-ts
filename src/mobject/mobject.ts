import {
  DEFAULT_MOBJECT_TO_EDGE_BUFFER,
  DEFAULT_MOBJECT_TO_MOBJECT_BUFFER,
  DL,
  DOWN,
  DR,
  LEFT,
  ORIGIN,
  RIGHT,
  UL,
  UP,
  UR,
} from "../constants.js";
import { CONFIG } from "../config.js";
import type { ManimColor } from "../utils/color.js";
import type { Vec2, Vec3 } from "../utils/vec.js";
import { add, equals, scale as vscale, sub } from "../utils/vec.js";
import { lineIntersect } from "../utils/space_ops.js";

const BBOX_DIRS: Vec3[] = [UP, DOWN, LEFT, RIGHT, UL, UR, DL, DR];
const CORNERS: Vec3[] = [UL, UR, DL, DR];
const EDGES_4: Vec3[] = [UP, DOWN, LEFT, RIGHT];
const ALIGN_EDGES: Vec3[] = [UP, DOWN, LEFT, RIGHT, ORIGIN];

export type MobjectOptions = {
  zIndex?: number;
  boundingPoints?: Vec3[];
};

const isAnyOf = (v: Vec3, set: Vec3[]) => set.some((s) => equals(v, s));

export abstract class Mobject {
  /** Bounding polygon points (do NOT include submobjects). Subclasses must set these. */
  boundingPoints: Vec3[];
  zIndex: number;
  submobjects: Mobject[] = [];

  constructor(opts: MobjectOptions = {}) {
    this.boundingPoints = opts.boundingPoints ?? [];
    this.zIndex = opts.zIndex ?? 0;
  }

  // -- Grouping ----------------------------------------------------------------
  add(...mobjects: Mobject[]): this {
    for (const m of mobjects) {
      if (m === this) throw new Error("Cannot add mobject to itself");
      if (this.submobjects.includes(m)) continue;
      this.submobjects.push(m);
    }
    return this;
  }

  remove(...mobjects: Mobject[]): this {
    for (const m of mobjects) {
      const idx = this.submobjects.indexOf(m);
      if (idx >= 0) this.submobjects.splice(idx, 1);
    }
    return this;
  }

  getFamily(): Mobject[] {
    const fam: Mobject[] = [this];
    for (const s of this.submobjects) fam.push(...s.getFamily());
    return fam;
  }

  // -- Bounding box ops --------------------------------------------------------
  /**
   * 9-point bbox lookup. `direction` components must each be -1, 0, or 1.
   * Includes all submobjects' bounding points.
   */
  getCriticalPoint(direction: Vec3): Vec3 {
    const dx = Math.trunc(direction[0]);
    const dy = Math.trunc(direction[1]);
    if (dx < -1 || dx > 1 || dy < -1 || dy > 1) {
      throw new Error(
        `Direction is ${direction} but must be [x, y, _] with each in {-1, 0, 1}.`,
      );
    }
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    for (const m of this.getFamily()) {
      for (const p of m.boundingPoints) {
        if (p[0] < xMin) xMin = p[0];
        if (p[0] > xMax) xMax = p[0];
        if (p[1] < yMin) yMin = p[1];
        if (p[1] > yMax) yMax = p[1];
      }
    }
    const xMid = xMin + (xMax - xMin) / 2;
    const yMid = yMin + (yMax - yMin) / 2;
    const xs = [xMin, xMid, xMax];
    const ys = [yMin, yMid, yMax];
    return [xs[dx + 1]!, ys[dy + 1]!, 0];
  }

  get top(): Vec3 { return this.getCriticalPoint(UP); }
  get bottom(): Vec3 { return this.getCriticalPoint(DOWN); }
  get left(): Vec3 { return this.getCriticalPoint(LEFT); }
  get right(): Vec3 { return this.getCriticalPoint(RIGHT); }
  get center(): Vec3 { return this.getCriticalPoint(ORIGIN); }

  getCorner(direction: Vec3): Vec3 {
    if (!isAnyOf(direction, CORNERS)) throw new Error("`direction` must be a corner");
    return this.getCriticalPoint(direction);
  }

  get bbox(): Vec3[] {
    return [UR, UL, DL, DR].map((d) => this.getCorner(d));
  }

  get width(): number {
    return this.right[0] - this.left[0];
  }

  get height(): number {
    return this.top[1] - this.bottom[1];
  }

  // -- Ray vs bounding polygon intersection ------------------------------------
  /**
   * Find the closest point where a 2D ray hits this mobject's bounding polygon.
   * Handles rays from inside or outside. Falls back to `center` if no intersection.
   * Used by Line/Arrow to snap endpoints to mobject boundaries.
   */
  getClosestIntersectingPoint2d(rayOrigin: Vec2, rayDir: Vec2): Vec3 {
    return getClosestIntersectingPoint2dHelper(this.boundingPoints, rayOrigin, rayDir, this.center);
  }

  // -- Absolute positioning ----------------------------------------------------
  setPosition(coord: Vec3 | readonly [number, number]): this {
    const c: Vec3 = coord.length === 2 ? [coord[0], coord[1] as number, 0] : coord as Vec3;
    return this.shift(sub(c, this.center));
  }

  setX(x: number): this {
    const c = this.center;
    return this.setPosition([x, c[1], 0]);
  }

  setY(y: number): this {
    const c = this.center;
    return this.setPosition([c[0], y, 0]);
  }

  // -- Relative positioning ----------------------------------------------------
  protected requireBboxDir(direction: Vec3): void {
    if (!isAnyOf(direction, BBOX_DIRS)) {
      throw new Error("`direction` must be a bbox point, such as UP or LEFT");
    }
  }

  /**
   * Move so this mobject's `-direction`-side critical point sits adjacent to
   * `target`'s `direction`-side critical point, plus a buffer in `direction`.
   *
   * `target` accepts a Mobject, a Vec3 point, or an array of Mobjects (in
   * which case the joint bbox of the array is used — useful for placing
   * a label "between" two items, e.g. `.nextTo([row.at(1), row.at(2)], DOWN)`).
   */
  nextTo(
    target: Mobject | Vec3 | Mobject[],
    direction: Vec3 = RIGHT,
    alignedEdge?: Vec3,
    buff: number = DEFAULT_MOBJECT_TO_MOBJECT_BUFFER,
  ): this {
    this.requireBboxDir(direction);
    let destPt: Vec3;
    if (target instanceof Mobject) {
      destPt = target.getCriticalPoint(direction);
    } else if (Array.isArray(target) && target.length > 0 && target[0] instanceof Mobject) {
      destPt = jointCriticalPoint(target as Mobject[], direction);
    } else {
      destPt = target as Vec3;
    }
    const curPt = this.getCriticalPoint([-direction[0], -direction[1], -direction[2]]);
    const toShift = add(sub(destPt, curPt), vscale(direction, buff));
    this.shift(toShift);
    if (alignedEdge !== undefined && !(Array.isArray(target) && target[0] instanceof Mobject)) {
      this.alignTo(target as Mobject | Vec3, alignedEdge);
    }
    return this;
  }

  alignTo(target: Mobject | Vec3, edge: Vec3 = UP, buff = 0): this {
    if (!isAnyOf(edge, ALIGN_EDGES)) {
      throw new Error("Edge must be one of (UP, DOWN, LEFT, RIGHT, ORIGIN)");
    }
    const destPt = target instanceof Mobject ? target.getCriticalPoint(edge) : target;
    const cur = this.getCriticalPoint(edge);
    if (equals(edge, UP) || equals(edge, DOWN)) {
      this.shift([0, destPt[1] - cur[1] - edge[1] * buff, 0]);
    } else if (equals(edge, LEFT) || equals(edge, RIGHT)) {
      this.shift([destPt[0] - cur[0] - edge[0] * buff, 0, 0]);
    }
    return this;
  }

  moveTo(target: Mobject | Vec3): this {
    const destPt = target instanceof Mobject ? target.getCriticalPoint(ORIGIN) : target;
    return this.shift(sub(destPt, this.center));
  }

  moveToOrigin(): this {
    return this.shift([-this.center[0], -this.center[1], -this.center[2]]);
  }

  toEdge(edge: Vec3 = LEFT, buff: number = DEFAULT_MOBJECT_TO_EDGE_BUFFER): this {
    if (!isAnyOf(edge, EDGES_4)) throw new Error("Edge must be one of (UP, DOWN, LEFT, RIGHT)");
    const xR = CONFIG.fw / 2;
    const yR = CONFIG.fh / 2;
    return this.alignTo([edge[0] * xR, edge[1] * yR, 0], edge, buff);
  }

  // -- Core transformations (subclasses override; defaults walk submobjects) --
  abstract rotate(angle: number, axis?: Vec3, aboutPoint?: Vec3 | null): this;
  abstract scale(factor: number, aboutPoint?: Vec3 | null): this;
  abstract stretch(factor: number, dim: 0 | 1 | 2): this;
  abstract shift(vector: Vec3): this;

  // -- Layering ---------------------------------------------------------------
  setZIndex(value: number): this {
    for (const m of this.getFamily()) m.zIndex = value;
    return this;
  }

  // -- Style hooks (subclasses override) --------------------------------------
  setColor(_color: ManimColor, _family = false): this { return this; }
  setOpacity(_opacity: number, _family = false): this { return this; }
}

/** Joint 9-point bbox lookup across a list of mobjects. */
const jointCriticalPoint = (mobjects: Mobject[], direction: Vec3): Vec3 => {
  let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
  for (const m of mobjects) {
    for (const fam of m.getFamily()) {
      for (const p of fam.boundingPoints) {
        if (p[0] < xMin) xMin = p[0];
        if (p[0] > xMax) xMax = p[0];
        if (p[1] < yMin) yMin = p[1];
        if (p[1] > yMax) yMax = p[1];
      }
    }
  }
  const xMid = xMin + (xMax - xMin) / 2;
  const yMid = yMin + (yMax - yMin) / 2;
  const dx = Math.trunc(direction[0]);
  const dy = Math.trunc(direction[1]);
  const xs = [xMin, xMid, xMax];
  const ys = [yMin, yMid, yMax];
  return [xs[dx + 1]!, ys[dy + 1]!, 0];
};

const getClosestIntersectingPoint2dHelper = (
  bounding: Vec3[],
  rayOrigin: Vec2,
  rayDir: Vec2,
  fallback: Vec3,
): Vec3 => {
  let bestT = Infinity;
  let bestPt: Vec3 | null = null;
  const n = bounding.length;
  for (let i = 0; i < n; i++) {
    const p1 = bounding[i]!;
    const p2 = bounding[(i + 1) % n]!;
    const hit = lineIntersect(rayOrigin, rayDir, [p1[0], p1[1]], [p2[0], p2[1]]);
    if (hit && hit.t < bestT) {
      bestT = hit.t;
      bestPt = [hit.point[0], hit.point[1], 0];
    }
  }
  return bestPt ?? fallback;
};
