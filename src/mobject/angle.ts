import { CONFIG } from "../config.js";
import { TAU } from "../constants.js";
import type { ManimColor } from "../utils/color.js";
import { angleFromVector } from "../utils/space_ops.js";
import { sub, normalize, type Vec3 } from "../utils/vec.js";
import { Group } from "./group.js";
import { Arc } from "./geometry/arc.js";
import { Polygon } from "./geometry/polygon.js";
import { Tex } from "./text/tex_mobject.js";

export type AngleOptions = {
  /** Arc radius. Default 0.4. */
  radius?: number;
  /**
   * Optional Tex label, placed along the bisector just past the arc. Pass a
   * raw LaTeX string (e.g. `"30^\\circ"` or `"\\theta"`).
   */
  label?: string | null;
  /** Distance from the outer edge of the arc to the label. Default 0.2. */
  labelBuff?: number;
  /**
   * Which sweep to draw between the two rays.
   *   - "minor" (default): the smaller (interior) sweep — the usual case
   *   - "major": the larger (reflex) sweep
   */
  arcType?: "minor" | "major";
  color?: ManimColor;
  strokeWidth?: number;
  fontSize?: number;
};

/**
 * Angle marker at a vertex defined by three points: the vertex itself plus
 * one endpoint along each of the two rays. Picks the smaller (interior)
 * sweep automatically — pass `arcType: "major"` to flip to the reflex side.
 *
 * ```ts
 * const ang = new Angle(B, A, C, { label: "30^\\circ", color: RED });
 * canvas.add(ang);
 * ```
 *
 * For a square right-angle marker (instead of a curved arc), use the static
 * helper `Angle.right(vertex, ray1End, ray2End)`.
 */
export class Angle extends Group {
  arc: Arc;
  label: Tex | null = null;
  /** Vertex this angle marker is anchored at. */
  vertex: Vec3;
  /** Direction (radians) of the bisector — useful for placing custom labels. */
  bisector: number;
  /** Sweep size in radians (always positive). */
  sweep: number;

  constructor(vertex: Vec3, ray1End: Vec3, ray2End: Vec3, opts: AngleOptions = {}) {
    super();
    const radius = opts.radius ?? 0.4;
    const color = opts.color ?? CONFIG.defaultTextColor;
    const sw = opts.strokeWidth ?? 3;

    const a1 = angleFromVector(sub(ray1End, vertex));
    const a2 = angleFromVector(sub(ray2End, vertex));

    // CCW sweep from a1 to a2, normalized to [0, TAU).
    let delta = a2 - a1;
    while (delta < 0) delta += TAU;
    while (delta >= TAU) delta -= TAU;

    // Default to the minor (interior) sweep.
    let startAngle: number;
    let sweep: number;
    if (delta <= Math.PI) {
      startAngle = a1;
      sweep = delta;
    } else {
      startAngle = a2;
      sweep = TAU - delta;
    }
    if (opts.arcType === "major") {
      startAngle = startAngle + sweep;
      sweep = TAU - sweep;
    }

    this.vertex = [vertex[0], vertex[1], vertex[2]];
    this.sweep = sweep;
    this.bisector = startAngle + sweep / 2;

    // Default zIndex: -1 so an angle marker sits *under* the polygon it's
    // marking — the polygon's strokes visually clip the arc at the rays. Pass
    // an explicit `zIndex` in opts to override.
    this.arc = new Arc({
      arcCenter: vertex,
      radius,
      startAngle,
      angle: sweep,
      strokeColor: color,
      strokeWidth: sw,
      fillOpacity: 0,
      zIndex: -1,
    });
    this.add(this.arc);

    if (opts.label) {
      const fontSize = opts.fontSize ?? 22;
      const labelBuff = opts.labelBuff ?? 0.2;
      this.label = new Tex(opts.label, { color, fontSize });
      this.label.moveTo(this.bisectorPoint(radius + labelBuff));
      this.add(this.label);
    }
  }

  /** Point at the given distance from the vertex along the bisector. */
  bisectorPoint(distance: number): Vec3 {
    return [
      this.vertex[0] + distance * Math.cos(this.bisector),
      this.vertex[1] + distance * Math.sin(this.bisector),
      0,
    ];
  }

  /**
   * Right-angle square marker at a corner defined by three points (vertex +
   * two ray endpoints). Side aligns with each ray. Returns a `Polygon`.
   *
   * The two rays should be perpendicular for the result to actually be a
   * square — for a generic angle, use `new Angle(...)` (the curved arc).
   */
  static right(
    vertex: Vec3,
    ray1End: Vec3,
    ray2End: Vec3,
    opts: { size?: number; color?: ManimColor; strokeWidth?: number } = {},
  ): Polygon {
    const size = opts.size ?? 0.18;
    const color = opts.color ?? CONFIG.defaultTextColor;
    const sw = opts.strokeWidth ?? 2;
    const u1 = normalize(sub(ray1End, vertex));
    const u2 = normalize(sub(ray2End, vertex));
    return new Polygon({
      vertices: [
        [vertex[0], vertex[1], 0],
        [vertex[0] + size * u1[0], vertex[1] + size * u1[1], 0],
        [vertex[0] + size * (u1[0] + u2[0]), vertex[1] + size * (u1[1] + u2[1]), 0],
        [vertex[0] + size * u2[0], vertex[1] + size * u2[1], 0],
      ],
      strokeColor: color,
      strokeWidth: sw,
      fillOpacity: 0,
      zIndex: -1,
    });
  }
}
