import { CONFIG, Config } from "./config.js";
import { Z_INDEX_MIN } from "./constants.js";
import { Group } from "./mobject/group.js";
import { Mobject } from "./mobject/mobject.js";
import { VMobject } from "./mobject/vmobject.js";
import { Rectangle } from "./mobject/geometry/polygon.js";
import { round, toPixelCoords, toPixelLen } from "./utils/space_ops.js";
import type { Vec3 } from "./utils/vec.js";
import type { ManimColor } from "./utils/color.js";

let nextMobId = 1;
const mobIds = new WeakMap<object, number>();
const idOf = (m: object) => {
  let id = mobIds.get(m);
  if (id === undefined) {
    id = nextMobId++;
    mobIds.set(m, id);
  }
  return id;
};

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const numStr = (n: number, decimals = 3) => {
  const v = round(n, decimals);
  // Avoid "-0".
  return Object.is(v, -0) ? "0" : String(v);
};

const attrsString = (attrs: Record<string, string | number | null | undefined>) => {
  // Sort keys for deterministic SVG output (helps diffing).
  const keys = Object.keys(attrs).sort();
  const out: string[] = [];
  for (const k of keys) {
    const v = attrs[k];
    if (v === null || v === undefined) continue;
    out.push(`${k}="${escapeXml(String(v))}"`);
  }
  return out.join(" ");
};

export class Canvas {
  config: Config;
  mobjects: Group;

  constructor(config: Config = CONFIG) {
    this.config = config;
    this.mobjects = new Group();
  }

  reset(): void {
    this.mobjects = new Group();
  }

  add(...mobjects: Mobject[]): void {
    for (const m of mobjects) {
      if (!(m instanceof Mobject)) {
        throw new Error("Added item must be of type Mobject");
      }
      if (this.mobjects.submobjects.includes(m)) continue;
      this.mobjects.add(m);
    }
  }

  private getMobjectsToDisplay(): Mobject[] {
    const all: Mobject[] = [];
    for (const top of this.mobjects.submobjects) all.push(...top.getFamily());
    return all.slice().sort((a, b) => a.zIndex - b.zIndex);
  }

  // --- SVG generation -------------------------------------------------------
  toSVG(opts: { ignoreBg?: boolean; decimalPrecision?: number } = {}): string {
    const decimals = opts.decimalPrecision ?? 3;
    const { config } = this;

    const elements: string[] = [];
    let bgRect: Rectangle | null = null;
    if (config.bgColor !== null && !opts.ignoreBg) {
      bgRect = new Rectangle({
        width: config.fw,
        height: config.fh,
        fillColor: config.bgColor!,
        zIndex: Z_INDEX_MIN,
      });
    }

    const mobjectsInOrder: Mobject[] = bgRect
      ? [bgRect, ...this.getMobjectsToDisplay()]
      : this.getMobjectsToDisplay();

    for (const m of mobjectsInOrder) {
      if (m instanceof VMobject) {
        const el = this.vmobjectToPath(m, decimals);
        if (el) elements.push(el);
      } else if (m instanceof Group) {
        const el = this.groupToRect(m, decimals);
        if (el) elements.push(el);
      } else {
        // Generic Mobject: bbox rect (matches Python fallback)
        const el = this.groupToRect(m, decimals);
        if (el) elements.push(el);
      }
    }

    const x = 0, y = 0, w = config.pw, h = config.ph;
    const svg = `<svg id="smanim-canvas" viewBox="${x} ${y} ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${elements.join("")}</svg>`;
    return svg;
  }

  private vmobjectToPath(vm: VMobject, decimals: number): string | null {
    if (vm.points.length === 0) return null;
    const pts = this.toPixelCoords(vm.points as Vec3[], decimals);
    if (pts.length === 0) return null;

    const quads: Array<[[number, number], [number, number], [number, number], [number, number]]> = [];
    for (let i = 0; i < pts.length; i += 4) {
      quads.push([pts[i]!, pts[i + 1]!, pts[i + 2]!, pts[i + 3]!]);
    }

    const dParts: string[] = [];
    const start = quads[0]![0];
    dParts.push(`M ${numStr(start[0], decimals)} ${numStr(start[1], decimals)}`);
    for (const [, p1, p2, p3] of quads) {
      dParts.push(
        `C ${numStr(p1[0], decimals)} ${numStr(p1[1], decimals)} ${numStr(p2[0], decimals)} ${numStr(p2[1], decimals)} ${numStr(p3[0], decimals)} ${numStr(p3[1], decimals)}`,
      );
    }
    if (vm.isClosed) dParts.push("Z");
    const d = dParts.join(" ");

    const attrs: Record<string, string | number | null> = {
      id: `id-${idOf(vm)}`,
      d,
      "stroke-dasharray": vm.strokeDasharray,
      fill: colorToValue(vm.fillColor) ?? "none",
      "fill-opacity": vm.fillOpacity ?? "none",
    };
    if (vm.strokeOpacity && vm.strokeWidth) {
      attrs.stroke = colorToValue(vm.strokeColor) ?? "none";
      attrs["stroke-width"] = vm.strokeWidth;
      attrs["stroke-opacity"] = vm.strokeOpacity;
    }
    return `<path ${attrsString(attrs)}/>`;
  }

  private groupToRect(g: Mobject, decimals: number): string | null {
    const family = g.getFamily();
    const totalPts = family.reduce((acc, m) => acc + m.boundingPoints.length, 0);
    if (totalPts === 0) return null;
    const bboxPts = this.toPixelCoords(g.bbox as Vec3[], decimals);
    const ul = bboxPts[1]!;
    const w = toPixelLen(g.width, this.config.pw, this.config.fw, decimals);
    const h = toPixelLen(g.height, this.config.pw, this.config.fw, decimals);
    const attrs = {
      id: `id-${idOf(g)}`,
      fill: "transparent",
      x: numStr(ul[0], decimals),
      y: numStr(ul[1], decimals),
      width: numStr(w, decimals),
      height: numStr(h, decimals),
    };
    return `<rect ${attrsString(attrs)}/>`;
  }

  private toPixelCoords(points: Vec3[], decimals: number): Array<[number, number]> {
    const { pw, ph, fw, fh, fc } = this.config;
    return toPixelCoords(points, pw, ph, fw, fh, fc, decimals);
  }
}

const colorToValue = (c: ManimColor | null): string | null => (c ? c.value : null);

export const canvas = new Canvas(CONFIG);
