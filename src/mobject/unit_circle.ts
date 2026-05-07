import { ORIGIN, PI, TAU } from "../constants.js";
import { BLACK, BLUE, WHITE, type ManimColor } from "../utils/color.js";
import type { Vec3 } from "../utils/vec.js";
import { Group } from "./group.js";
import { Circle } from "./geometry/circle.js";
import { Dot } from "./geometry/circle.js";
import { Line } from "./geometry/line.js";
import { Tex } from "./text/tex_mobject.js";

/** [angle in radians, latex label] for the standard reference points. */
const STANDARD_ANGLES: Array<readonly [number, string]> = [
  [0, "0"],
  [PI / 6, String.raw`\frac{\pi}{6}`],
  [PI / 4, String.raw`\frac{\pi}{4}`],
  [PI / 3, String.raw`\frac{\pi}{3}`],
  [PI / 2, String.raw`\frac{\pi}{2}`],
  [(2 * PI) / 3, String.raw`\frac{2\pi}{3}`],
  [(3 * PI) / 4, String.raw`\frac{3\pi}{4}`],
  [(5 * PI) / 6, String.raw`\frac{5\pi}{6}`],
  [PI, String.raw`\pi`],
  [(7 * PI) / 6, String.raw`\frac{7\pi}{6}`],
  [(5 * PI) / 4, String.raw`\frac{5\pi}{4}`],
  [(4 * PI) / 3, String.raw`\frac{4\pi}{3}`],
  [(3 * PI) / 2, String.raw`\frac{3\pi}{2}`],
  [(5 * PI) / 3, String.raw`\frac{5\pi}{3}`],
  [(7 * PI) / 4, String.raw`\frac{7\pi}{4}`],
  [(11 * PI) / 6, String.raw`\frac{11\pi}{6}`],
];

export type UnitCircleOptions = {
  radius?: number;
  /** Specific angles to mark (in radians). Defaults to the 16 standard angles. */
  angles?: readonly number[];
  /** Show Tex labels at each marked angle. */
  showLabels?: boolean;
  /** Use coordinate (cosθ, sinθ) labels instead of angle-in-radians labels. */
  showCoords?: boolean;
  /** Show the central dot, axes, and arrow tips on the axes. */
  showAxes?: boolean;
  circleColor?: ManimColor;
  axisColor?: ManimColor;
  dotColor?: ManimColor;
  fontSize?: number;
};

const COMMON_COORDS: Record<string, string> = {
  "0": String.raw`(1, 0)`,
  [String(PI / 6)]: String.raw`\left(\tfrac{\sqrt{3}}{2}, \tfrac{1}{2}\right)`,
  [String(PI / 4)]: String.raw`\left(\tfrac{\sqrt{2}}{2}, \tfrac{\sqrt{2}}{2}\right)`,
  [String(PI / 3)]: String.raw`\left(\tfrac{1}{2}, \tfrac{\sqrt{3}}{2}\right)`,
  [String(PI / 2)]: String.raw`(0, 1)`,
  [String(PI)]: String.raw`(-1, 0)`,
  [String((3 * PI) / 2)]: String.raw`(0, -1)`,
};

/**
 * Unit circle figure: circle + perpendicular axes + dots & labels at reference
 * angles. Defaults to the standard 16-angle layout used in pre-calc trig.
 *
 * ```ts
 * const uc = new UnitCircle();
 * canvas.add(uc);
 * ```
 */
export class UnitCircle extends Group {
  radius: number;
  circle: Circle;
  xAxis: Line | null = null;
  yAxis: Line | null = null;
  centerDot: Dot | null = null;
  markers: Array<{ angle: number; dot: Dot; label: Tex | null }> = [];

  constructor(opts: UnitCircleOptions = {}) {
    super();
    const r = opts.radius ?? 2;
    this.radius = r;
    const circleColor = opts.circleColor ?? BLUE;
    const axisColor = opts.axisColor ?? WHITE;
    const dotColor = opts.dotColor ?? WHITE;
    const fontSize = opts.fontSize ?? 18;

    this.circle = new Circle({ radius: r, strokeColor: circleColor, fillOpacity: 0, strokeWidth: 3 });
    this.add(this.circle);

    if (opts.showAxes !== false) {
      const axLen = r * 1.25;
      this.xAxis = new Line({ start: [-axLen, 0, 0], end: [axLen, 0, 0], color: axisColor, strokeWidth: 2 });
      this.yAxis = new Line({ start: [0, -axLen, 0], end: [0, axLen, 0], color: axisColor, strokeWidth: 2 });
      this.add(this.xAxis, this.yAxis);
      this.centerDot = new Dot({ point: ORIGIN, radius: 0.05, color: dotColor });
      this.add(this.centerDot);
    }

    const angles = (opts.angles ?? STANDARD_ANGLES.map(([a]) => a)) as readonly number[];
    const customLabel = (a: number): string | null => {
      const std = STANDARD_ANGLES.find(([sa]) => Math.abs(sa - ((a % TAU) + TAU) % TAU) < 1e-9);
      if (!std) return null;
      if (opts.showCoords) {
        const key = String(std[0]);
        return COMMON_COORDS[key] ?? null;
      }
      return std[1];
    };

    for (const a of angles) {
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      const dot = new Dot({ point: [x, y, 0], radius: 0.06, color: dotColor });
      this.add(dot);
      let label: Tex | null = null;
      if (opts.showLabels !== false) {
        const text = customLabel(a);
        if (text !== null) {
          label = new Tex(text, { fontSize, bgColor: BLACK });
          // Place outward along the radial direction, beyond the circle.
          const buff = 0.4;
          label.moveTo([x + Math.cos(a) * buff, y + Math.sin(a) * buff, 0]);
          this.add(label);
        }
      }
      this.markers.push({ angle: a, dot, label });
    }

    this.moveToOrigin();
  }
}
