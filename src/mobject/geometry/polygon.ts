import { ORIGIN, OUT, PI } from "../../constants.js";
import { BLUE, GREEN, hasDefaultColorsSet, type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { add, normalize, scale as vscale, sub } from "../../utils/vec.js";
import { regularVertices } from "../../utils/space_ops.js";
import { VMobject, type VMobjectOptions } from "../vmobject.js";

export type PolygramOptions = VMobjectOptions & {
  vertices: Vec3[];
};

/** Open polyline — connects each pair of consecutive vertices. No implicit closure. */
export class Polygram extends VMobject {
  protected _vertices: Vec3[] = [];

  constructor(opts: PolygramOptions) {
    const { vertices, ...rest } = opts;
    const merged: VMobjectOptions = { isClosed: false, ...rest };
    if (!hasDefaultColorsSet(rest)) merged.defaultStrokeColor = GREEN;
    super(merged);
    this._vertices = vertices.map((v) => [v[0], v[1], v[2]] as Vec3);
    this.generatePoints();
  }

  generatePoints(): void {
    const verts = this._vertices ?? [];
    const points: Vec3[] = [];
    for (let i = 0; i < verts.length - 1; i++) {
      points.push(...this.genBezierQuadFromLine(verts[i]!, verts[i + 1]!));
    }
    this.setPoints(points);
  }

  get vertices(): readonly Vec3[] { return this._vertices; }

  /** Vertex i, with `i` taken mod N. Returns a fresh tuple. */
  vertex(i: number): Vec3 {
    const n = this._vertices.length;
    const v = this._vertices[((i % n) + n) % n]!;
    return [v[0], v[1], v[2]];
  }

  /** Edge i: segment from vertex(i) to vertex(i+1). */
  edge(i: number): readonly [Vec3, Vec3] {
    return [this.vertex(i), this.vertex(i + 1)];
  }

  edgeMidpoint(i: number): Vec3 {
    const [a, b] = this.edge(i);
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  }

  /** Outward unit normal of edge i (assumes CCW vertex order). */
  edgeNormal(i: number): Vec3 {
    const [a, b] = this.edge(i);
    const t = sub(b, a);
    return normalize([t[1], -t[0], 0]);
  }

  setVertices(newVertices: Vec3[]): void {
    this._vertices = newVertices.map((v) => [v[0], v[1], v[2]] as Vec3);
    this.generatePoints();
  }

  // Keep vertices and points in lockstep across transforms.
  override rotate(angle = PI / 4, axis: Vec3 = OUT, aboutPoint: Vec3 | null = ORIGIN): this {
    if (this._vertices) this._vertices = this.rotatePoints(this._vertices, angle, axis, aboutPoint);
    return super.rotate(angle, axis, aboutPoint);
  }
  override scale(factor: number, aboutPoint: Vec3 | null = ORIGIN): this {
    if (this._vertices) this._vertices = this.scalePoints(this._vertices, factor, aboutPoint);
    return super.scale(factor, aboutPoint);
  }
  override stretch(factor: number, dim: 0 | 1 | 2): this {
    if (this._vertices) this._vertices = this.stretchPoints(this._vertices, factor, dim);
    return super.stretch(factor, dim);
  }
  override shift(vector: Vec3): this {
    if (this._vertices) this._vertices = this.shiftPoints(this._vertices, vector);
    return super.shift(vector);
  }
}

export type PolygonOptions = PolygramOptions & {
  cornerRadius?: number;
};

/** Closed polygon — connects last vertex back to first. */
export class Polygon extends Polygram {
  cornerRadius: number;
  rounded = false;

  constructor(opts: PolygonOptions) {
    const { cornerRadius = 0, ...rest } = opts;
    const merged: PolygramOptions = { isClosed: true, ...rest };
    if (!hasDefaultColorsSet(rest)) merged.defaultFillColor = BLUE;
    super(merged);
    // super() called Polygram.generatePoints (which dispatched here through
    // virtual call) — already produced closed-loop points via our override below.
    this.cornerRadius = cornerRadius;
    if (cornerRadius > 0) {
      this.roundCorners(cornerRadius);
      this.rounded = true;
    }
  }

  override generatePoints(): void {
    const verts = this._vertices ?? [];
    const points: Vec3[] = [];
    for (let i = 0; i < verts.length; i++) {
      const start = verts[i]!;
      const end = verts[(i + 1) % verts.length]!;
      points.push(...this.genBezierQuadFromLine(start, end));
    }
    this.setPoints(points);
  }

  /**
   * Replaces sharp corners with chord segments of length `radius`. (Convex CCW only.)
   * NOTE: this is a placeholder; the Python version uses true bezier arcs from arc.py.
   * We straight-chord the corner for now since rounded corners aren't a conformance
   * target. Replace once arc.py is ported.
   */
  roundCorners(radius: number): void {
    if (radius === 0) return;
    const quads = this.getPointsInQuads(this._points);
    const newQuads: Vec3[][] = [];
    const chord = (q1: readonly Vec3[], q2: readonly Vec3[]): Vec3[][] =>
      [this.genBezierQuadFromLine(q1[q1.length - 1]!, q2[0]!)];
    for (const quad of quads) {
      const start = quad[0], end = quad[3];
      const dx = end[0] - start[0], dy = end[1] - start[1], dz = end[2] - start[2];
      const lLen = Math.hypot(dx, dy, dz);
      if (2 * radius + 0.001 > lLen) return; // corner radius too big
      const dirNorm: Vec3 = [dx / lLen, dy / lLen, dz / lLen];
      const newStart = add(start, vscale(dirNorm, radius));
      const newEnd = sub(end, vscale(dirNorm, radius));
      const seg = this.genBezierQuadFromLine(newStart, newEnd);
      if (newQuads.length > 0) {
        newQuads.push(...chord(newQuads[newQuads.length - 1]!, seg));
      }
      newQuads.push(seg);
    }
    if (newQuads.length === 0) return;
    newQuads.push(...chord(newQuads[newQuads.length - 1]!, newQuads[0]!));
    const flat: Vec3[] = [];
    for (const q of newQuads) flat.push(...q);
    this.setPoints(flat);
    this.rounded = true;
  }
}

export type RectangleOptions = Omit<PolygonOptions, "vertices"> & {
  width?: number;
  height?: number;
};

export class Rectangle extends Polygon {
  rectWidth: number;
  rectHeight: number;
  constructor(opts: RectangleOptions = {}) {
    const w = opts.width ?? 2;
    const h = opts.height ?? 1;
    const hx = w / 2, hy = h / 2;
    super({
      ...opts,
      vertices: [
        [hx, hy, 0],
        [-hx, hy, 0],
        [-hx, -hy, 0],
        [hx, -hy, 0],
      ],
    });
    this.rectWidth = w;
    this.rectHeight = h;
  }
}

export type SquareOptions = Omit<PolygonOptions, "vertices"> & {
  sideLength?: number;
};

export class Square extends Polygon {
  sideLength: number;
  constructor(opts: SquareOptions = {}) {
    const s = opts.sideLength ?? 2;
    const h = s / 2;
    super({
      ...opts,
      vertices: [
        [h, h, 0],
        [-h, h, 0],
        [-h, -h, 0],
        [h, -h, 0],
      ],
    });
    this.sideLength = s;
  }
}

export type RegularPolygonOptions = Omit<PolygonOptions, "vertices"> & {
  n?: number;
  radius?: number;
  startAngle?: number;
};

export class RegularPolygon extends Polygon {
  n: number;
  radius: number;
  startAngle: number | undefined;
  constructor(opts: RegularPolygonOptions = {}) {
    const n = opts.n ?? 6;
    const radius = opts.radius ?? 1;
    super({ ...opts, vertices: regularVertices(n, radius, opts.startAngle) });
    this.n = n;
    this.radius = radius;
    this.startAngle = opts.startAngle;
  }
}

export type TriangleOptions = Omit<PolygonOptions, "vertices"> & {
  sideLength?: number;
};

export class Triangle extends RegularPolygon {
  constructor(opts: TriangleOptions = {}) {
    const s = opts.sideLength ?? 2;
    super({ ...opts, n: 3, radius: s / 2 });
  }
}
