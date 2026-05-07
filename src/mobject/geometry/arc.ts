import { ORIGIN, TAU } from "../../constants.js";
import { BLUE, hasDefaultColorsSet } from "../../utils/color.js";
import { angleFromVector } from "../../utils/space_ops.js";
import type { Vec3 } from "../../utils/vec.js";
import { sub } from "../../utils/vec.js";
import { VMobject, type VMobjectOptions } from "../vmobject.js";

export type ArcOptions = VMobjectOptions & {
  radius?: number;
  startAngle?: number;
  angle?: number;
  numComponents?: number;
  arcCenter?: Vec3;
};

export class Arc extends VMobject {
  radius: number;
  arcCenter: Vec3;
  startAngle: number;
  angle: number;
  numComponents: number;

  constructor(opts: ArcOptions = {}) {
    const {
      radius = 1.0,
      startAngle = 0.0,
      angle = TAU / 4,
      numComponents = 30,
      arcCenter = ORIGIN,
      ...rest
    } = opts;
    if (angle > TAU) throw new Error("Arc angle must be <= 2*PI");
    const merged: VMobjectOptions = { isClosed: angle === TAU, ...rest };
    if (!hasDefaultColorsSet(rest)) merged.defaultStrokeColor = BLUE;
    super(merged);
    this.radius = radius;
    this.arcCenter = [arcCenter[0], arcCenter[1], arcCenter[2]];
    this.startAngle = startAngle;
    this.angle = angle;
    this.numComponents = numComponents;
    this.generatePoints();
  }

  override generatePoints(): void {
    const startAngle = this.startAngle ?? 0;
    const angle = this.angle ?? TAU / 4;
    const numComponents = this.numComponents ?? 30;
    const radius = this.radius ?? 1;
    const arcCenter = this.arcCenter ?? [0, 0, 0];

    const N = numComponents;
    const anchors: Vec3[] = new Array(N);
    for (let i = 0; i < N; i++) {
      const a = startAngle + (angle * i) / (N - 1);
      anchors[i] = [Math.cos(a), Math.sin(a), 0];
    }
    const dTheta = angle / (N - 1);
    // Tangent vectors: rotate 90° via (x, y) -> (-y, x). Same as Python.
    const tangents: Vec3[] = anchors.map((a) => [-a[1], a[0], 0]);

    const newPoints: Vec3[] = [];
    for (let i = 0; i < N - 1; i++) {
      const a1 = anchors[i]!, a2 = anchors[i + 1]!;
      const t1 = tangents[i]!, t2 = tangents[i + 1]!;
      const h1: Vec3 = [a1[0] + (dTheta / 3) * t1[0], a1[1] + (dTheta / 3) * t1[1], 0];
      const h2: Vec3 = [a2[0] - (dTheta / 3) * t2[0], a2[1] - (dTheta / 3) * t2[1], 0];
      newPoints.push(a1, h1, h2, a2);
    }
    this.setPoints(newPoints);
    // Apply radius and center via the existing scale/shift transforms (which
    // walk submobjects too). Polygon overrides re-shape vertices; here we have
    // none to worry about.
    this.scale(radius);
    this.shift(arcCenter);
  }

  static fromPoints(start: Vec3, end: Vec3, opts: ArcOptions & { angle?: number } = {}): Arc {
    const chord = sub(end, start);
    const chordLen = Math.hypot(chord[0], chord[1], chord[2]);
    const chordUnit: Vec3 = [chord[0] / chordLen, chord[1] / chordLen, chord[2] / chordLen];
    let angle = opts.angle;
    const radiusOpt = opts.radius ?? 1.0;
    if (!angle) angle = 2 * Math.asin(chordLen / (2 * radiusOpt));
    const midpoint: Vec3 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];
    const chordToCenterLen = (chordLen / 2) / Math.tan(angle / 2);
    const toCenterUnit: Vec3 = [-chordUnit[1], chordUnit[0], 0];
    const arcCenter: Vec3 = [
      midpoint[0] + toCenterUnit[0] * chordToCenterLen,
      midpoint[1] + toCenterUnit[1] * chordToCenterLen,
      midpoint[2] + toCenterUnit[2] * chordToCenterLen,
    ];
    const radius = chordLen / (2 * Math.sin(angle / 2));
    const centerToStart: Vec3 = [start[0] - arcCenter[0], start[1] - arcCenter[1], start[2] - arcCenter[2]];
    const startAngle = angleFromVector(centerToStart);
    return new Arc({ ...opts, radius, startAngle, angle, arcCenter });
  }
}
