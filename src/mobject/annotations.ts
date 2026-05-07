import { CONFIG } from "../config.js";
import { DOWN, LEFT, RIGHT, UP } from "../constants.js";
import { YELLOW, type ManimColor } from "../utils/color.js";
import { angleFromVector } from "../utils/space_ops.js";
import { parseSvgPathToQuads } from "../utils/svg_path.js";
import { sub, normalize, scale as vscale, type Vec3 } from "../utils/vec.js";
import { Group } from "./group.js";
import { Line } from "./geometry/line.js";
import { Arrow } from "./geometry/arrow.js";
import { VMobject, type VMobjectOptions } from "./vmobject.js";
import { Mobject } from "./mobject.js";
import { Text, type TextOptions } from "./text/text_mobject.js";
import { Tex, type TexOptions } from "./text/tex_mobject.js";

// ---------------------------------------------------------------------------
// Brace — manim-style curly bracket alongside a target.
// Path string ported verbatim from still-manim/mobject/svg/brace.py.
// ---------------------------------------------------------------------------

const BRACE_PATH_TEMPLATE = (
  "m0.01216 0c-0.01152 0-0.01216 6.103e-4 -0.01216 0.01311v0.007762c0.06776 " +
  "0.122 0.1799 0.1455 0.2307 0.1455h{0}c0.03046 3.899e-4 0.07964 0.00449 " +
  "0.1246 0.02636 0.0537 0.02695 0.07418 0.05816 0.08648 0.07769 0.001562 " +
  "0.002538 0.004539 0.002563 0.01098 0.002563 0.006444-2e-8 0.009421-2.47e-" +
  "5 0.01098-0.002563 0.0123-0.01953 0.03278-0.05074 0.08648-0.07769 0.04491" +
  "-0.02187 0.09409-0.02597 0.1246-0.02636h{0}c0.05077 0 0.1629-0.02346 " +
  "0.2307-0.1455v-0.007762c-1.78e-6 -0.0125-6.365e-4 -0.01311-0.01216-0.0131" +
  "1-0.006444-3.919e-8 -0.009348 2.448e-5 -0.01091 0.002563-0.0123 0.01953-" +
  "0.03278 0.05074-0.08648 0.07769-0.04491 0.02187-0.09416 0.02597-0.1246 " +
  "0.02636h{1}c-0.04786 0-0.1502 0.02094-0.2185 0.1256-0.06833-0.1046-0.1706" +
  "-0.1256-0.2185-0.1256h{1}c-0.03046-3.899e-4 -0.07972-0.004491-0.1246-0.02" +
  "636-0.0537-0.02695-0.07418-0.05816-0.08648-0.07769-0.001562-0.002538-" +
  "0.004467-0.002563-0.01091-0.002563z"
);
const BRACE_DEFAULT_MIN_WIDTH = 0.90552;

export type BraceOptions = {
  /** Side of `target` the brace sits on. DOWN, UP, LEFT, RIGHT. */
  direction?: Vec3;
  buff?: number;
  /** Higher = sharper notch (linearSection grows). Default 2 (matches manim). */
  sharpness?: number;
  color?: ManimColor;
  strokeWidth?: number;
};

/**
 * Curly bracket along one side of a target, using the manim brace SVG path.
 * Filled (no stroke by default) with WHITE; flips/rotates to face the chosen
 * direction.
 *
 * ```ts
 * const b = new Brace(row, { direction: DOWN });
 * const labeled = Brace.withLabel(row, "the middle pair", DOWN);
 * ```
 */
export class Brace extends VMobject {
  direction: Vec3;
  /** Anchor point at the tip of the brace (a label sits past this). */
  tipAnchor: Vec3;

  constructor(target: Mobject, opts: BraceOptions = {}) {
    const direction = opts.direction ?? DOWN;
    const buff = opts.buff ?? 0.1;
    const sharpness = opts.sharpness ?? 2;
    const color = opts.color ?? CONFIG.defaultTextColor;

    // Brace points "down" by default (target ABOVE). Width spans the
    // perpendicular dimension of target relative to `direction`.
    const isHorizontal = Math.abs(direction[1]) > 0.5; // DOWN/UP brace → horizontal span
    const span = isHorizontal ? target.width : target.height;
    const linearSection = Math.max(0, (span * sharpness - BRACE_DEFAULT_MIN_WIDTH) / 2);
    const dStr = BRACE_PATH_TEMPLATE
      .replace(/\{0\}/g, String(linearSection))
      .replace(/\{1\}/g, String(-linearSection));
    const quads = parseSvgPathToQuads(dStr);
    const points: Vec3[] = [];
    for (const q of quads) points.push(...q);

    const vmoOpts: VMobjectOptions = {
      isClosed: true,
      defaultFillColor: color,
    };
    if (opts.strokeWidth !== undefined) {
      vmoOpts.strokeColor = color;
      vmoOpts.strokeWidth = opts.strokeWidth;
    }
    super(vmoOpts);
    this.setPoints(points);

    // SVG y is down; manim y is up. Flip the path so the notch points DOWN
    // in manim coordinates (which is what we want for a target ABOVE).
    this.stretch(-1, 1);

    // Stretch to fit the target's span exactly.
    this.stretchToFitWidth(span);

    // Default orientation: notch pointing DOWN. Rotate to match `direction`.
    const baseAngle = -Math.PI / 2; // current notch direction
    const targetAngle = angleFromVector(direction);
    const rot = targetAngle - baseAngle;
    if (Math.abs(rot) > 1e-9) this.rotate(rot);

    // Place adjacent to target's edge in the chosen direction.
    const edgePt = target.getCriticalPoint(direction);
    const dirUnit = normalize(direction);
    // The brace's "back" (flat side) should sit next to the target. Move it so
    // the back-edge is at edgePt + buff along direction.
    const opp: Vec3 = [-dirUnit[0], -dirUnit[1], -dirUnit[2]];
    const back = this.getCriticalPoint(opp);
    this.shift([
      edgePt[0] + dirUnit[0] * buff - back[0],
      edgePt[1] + dirUnit[1] * buff - back[1],
      0,
    ]);

    // tipAnchor = critical point on the side opposite the target.
    this.tipAnchor = this.getCriticalPoint(direction);
    this.direction = [direction[0], direction[1], direction[2]];
  }

  generatePoints(): void {
    // Subclass sets points explicitly after super().
  }

  /** Convenience: brace + Text label sitting just past the tip. */
  static withLabel(
    target: Mobject,
    label: string,
    direction: Vec3 = DOWN,
    opts: BraceOptions & { fontSize?: number; textOptions?: TextOptions } = {},
  ): Group {
    const brace = new Brace(target, { ...opts, direction });
    const tOpts: TextOptions = { bgColor: CONFIG.defaultLabelBgColor, ...(opts.textOptions ?? {}), fontSize: opts.fontSize ?? 22 };
    const t = new Text(label, tOpts);
    t.nextTo(brace.tipAnchor, direction, undefined, 0.1);
    const g = new Group();
    g.add(brace, t);
    return g;
  }

  /** Convenience: brace + Tex label. */
  static withTexLabel(
    target: Mobject,
    latex: string,
    direction: Vec3 = DOWN,
    opts: BraceOptions & { fontSize?: number; texOptions?: TexOptions } = {},
  ): Group {
    const brace = new Brace(target, { ...opts, direction });
    const tOpts: TexOptions = { bgColor: CONFIG.defaultLabelBgColor, ...(opts.texOptions ?? {}), fontSize: opts.fontSize ?? 28 };
    const t = new Tex(latex, tOpts);
    t.nextTo(brace.tipAnchor, direction, undefined, 0.1);
    const g = new Group();
    g.add(brace, t);
    return g;
  }
}

// ---------------------------------------------------------------------------
// Underline — horizontal line beneath a target.
// ---------------------------------------------------------------------------

export type UnderlineOptions = {
  /** Extension past target's left/right edges. */
  buff?: number;
  /** Vertical offset below target.bottom. */
  yOffset?: number;
  color?: ManimColor;
  strokeWidth?: number;
};

export class Underline extends Line {
  constructor(target: Mobject, opts: UnderlineOptions = {}) {
    const buff = opts.buff ?? 0.05;
    const yOffset = opts.yOffset ?? 0.05;
    const color = opts.color ?? YELLOW;
    const strokeWidth = opts.strokeWidth ?? 3;
    const left = target.left;
    const right = target.right;
    const y = target.bottom[1] - yOffset;
    super({
      start: [left[0] - buff, y, 0],
      end: [right[0] + buff, y, 0],
      color,
      strokeWidth,
    });
  }
}

// ---------------------------------------------------------------------------
// Pointer — leader-line arrow from a label to a target.
// ---------------------------------------------------------------------------

export type PointerOptions = {
  /** Direction the arrow points FROM, relative to the target. Default DOWN
   *  means the label sits below the target and the arrow points up at it. */
  approachFrom?: Vec3;
  length?: number;
  buff?: number;
  color?: ManimColor;
  strokeWidth?: number;
};

/**
 * Arrow pointing at a target mobject from a given direction. Useful for
 * "this is X" annotations. Combine with a Text/Tex placed at the arrow tail
 * to label the call-out.
 *
 * ```ts
 * const arr = new Pointer(target, { approachFrom: DOWN });
 * const lbl = new Text("middle", { bgColor: BLACK }).nextTo(arr.tail, DOWN);
 * ```
 */
export class Pointer extends Arrow {
  /** Tail end (opposite the tip — where you'd place a label). */
  tail: Vec3;

  constructor(target: Mobject | Vec3, opts: PointerOptions = {}) {
    const approachFrom = opts.approachFrom ?? DOWN;
    const length = opts.length ?? 0.6;
    const buff = opts.buff ?? 0.05;
    const dir = normalize(approachFrom);
    let endPt: Vec3;
    if (target instanceof Mobject) {
      const c = target.center;
      // Find where the ray from `approachFrom` hits target's bbox edge.
      const hit = target.getClosestIntersectingPoint2d([c[0], c[1]], [-dir[0], -dir[1]]);
      endPt = sub(hit, vscale(dir, buff));
    } else {
      endPt = sub(target as Vec3, vscale(dir, buff));
    }
    const startPt: Vec3 = sub(endPt, vscale(dir, length));
    const arrowOpts: ConstructorParameters<typeof Arrow>[0] = { start: startPt, end: endPt };
    if (opts.color !== undefined) arrowOpts.color = opts.color;
    if (opts.strokeWidth !== undefined) arrowOpts.strokeWidth = opts.strokeWidth;
    super(arrowOpts);
    this.tail = startPt;
  }

  /** Convenience: pointer + label sitting at the tail. */
  static withLabel(
    target: Mobject | Vec3,
    label: string,
    opts: PointerOptions & { fontSize?: number; textOptions?: TextOptions } = {},
  ): Group {
    const p = new Pointer(target, opts);
    const tOpts: TextOptions = { bgColor: CONFIG.defaultLabelBgColor, ...(opts.textOptions ?? {}), fontSize: opts.fontSize ?? 22 };
    const t = new Text(label, tOpts);
    const dir = normalize(opts.approachFrom ?? DOWN);
    // Place the label past the tail in the same direction the pointer comes from.
    t.nextTo(p.tail, [-dir[0], -dir[1], 0], undefined, 0.05);
    const g = new Group();
    g.add(p, t);
    return g;
  }
}
