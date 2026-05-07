import { readFileSync } from "node:fs";

import { CONFIG, Config } from "./config.js";
import { RADIANS, Z_INDEX_MIN } from "./constants.js";
import { Group } from "./mobject/group.js";
import { Mobject } from "./mobject/mobject.js";
import { VMobject } from "./mobject/vmobject.js";
import { Rectangle } from "./mobject/geometry/polygon.js";
import { Text } from "./mobject/text/text_mobject.js";
import { Tex } from "./mobject/text/tex_mobject.js";
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

const fontDataCache = new Map<string, string>();
const fontAsBase64 = (path: string): string => {
  let data = fontDataCache.get(path);
  if (!data) {
    data = readFileSync(path).toString("base64");
    fontDataCache.set(path, data);
  }
  return data;
};

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
  /** Track which (family, italic, bold) tuples we've already inlined as @font-face. */
  private loadedFonts: Set<string> = new Set();

  constructor(config: Config = CONFIG) {
    this.config = config;
    this.mobjects = new Group();
  }

  reset(): void {
    this.mobjects = new Group();
    this.loadedFonts = new Set();
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
      } else if (m instanceof Tex) {
        const el = this.texToSvg(m, decimals);
        if (el) elements.push(el);
      } else if (m instanceof Text) {
        elements.push(...this.textToSvg(m, decimals));
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
    const svg = `<svg id="smanim-canvas" viewBox="${x} ${y} ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${elements.join("")}</svg>`;
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

  private textToSvg(text: Text, decimals: number): string[] {
    const startPt = this.toPixelCoords([text.svgUpperLeft], decimals)[0]!;

    let bgRect = "";
    if (text.bgColor) {
      // Compute bbox in pixel space from boundingPoints — UR/UL/DL/DR.
      const bboxPx = this.toPixelCoords(text.boundingPoints as Vec3[], decimals);
      const xs = bboxPx.map((p) => p[0]);
      const ys = bboxPx.map((p) => p[1]);
      const xMin = Math.min(...xs), xMax = Math.max(...xs);
      const yMin = Math.min(...ys), yMax = Math.max(...ys);
      const padPx = toPixelLen(text.bgPadding, this.config.pw, this.config.fw, decimals);
      const rPx = text.bgRadius > 0 ? toPixelLen(text.bgRadius, this.config.pw, this.config.fw, decimals) : 0;
      const rAttr = rPx > 0 ? ` rx="${numStr(rPx, decimals)}" ry="${numStr(rPx, decimals)}"` : "";
      bgRect = `<rect x="${numStr(xMin - padPx, decimals)}" y="${numStr(yMin - padPx, decimals)}" width="${numStr(xMax - xMin + 2 * padPx, decimals)}" height="${numStr(yMax - yMin + 2 * padPx, decimals)}"${rAttr} fill="${text.bgColor.value}" fill-opacity="${text.bgOpacity}"/>`;
    }

    const familyKey = `${text.fontFamily}${text.italics ? "italics" : ""}${text.bold ? "bold" : ""}`;
    const objId = `id-${idOf(text)}`;
    const styleClass = `styleClass-${objId}`;
    const cssLines = [
      `.${styleClass} {`,
      `    text-decoration: ${text.textDecoration};`,
      `    fill: ${text.fillColor.value};`,
      `    font-size: ${text.fontSize}px;`,
      `    fill-opacity: ${text.fillOpacity};`,
      `    font-family: ${familyKey};`,
      `}`,
    ];
    const fontFaceKey = `${familyKey}|${text.fontPath}`;
    if (!this.loadedFonts.has(fontFaceKey)) {
      const base64 = fontAsBase64(text.fontPath);
      cssLines.push(
        `@font-face { font-family: ${familyKey}; src: url(data:font/otf;base64,${base64}) format('opentype'); }`,
      );
      this.loadedFonts.add(fontFaceKey);
    }
    const styleEl = `<style>${cssLines.join("\n")}</style>`;

    const lineHeight = text.fontAscentPixels + text.fontDescentPixels + text.leadingPixels;
    const tspans: string[] = [];
    for (let i = 0; i < text.textTokens.length; i++) {
      let dy = lineHeight;
      if (i === 0) {
        dy -= text.leadingPixels;
        dy -= text.fontDescentPixels;
        dy += text.yPaddingInPixels;
      }
      const escaped = escapeXml(text.textTokens[i]!);
      tspans.push(
        `<tspan x="${numStr(startPt[0], decimals)}" dx="${numStr(text.xPaddingInPixels, decimals)}" dy="${numStr(dy, decimals)}">${escaped}</tspan>`,
      );
    }

    const center = this.toPixelCoords([text.center], decimals)[0]!;
    // SVG rotate is clockwise, manim is CCW — negate.
    const rotateDeg = -text.heading * RADIANS;
    const transform = `rotate(${numStr(rotateDeg, decimals)} ${numStr(center[0], decimals)} ${numStr(center[1], decimals)})`;

    const textEl = `<text class="${styleClass}" id="${objId}" transform="${transform}" x="${numStr(startPt[0], decimals)}" y="${numStr(startPt[1], decimals)}">${tspans.join("")}</text>`;
    return bgRect ? [bgRect, styleEl, textEl] : [styleEl, textEl];
  }

  private texToSvg(tex: Tex, decimals: number): string | null {
    const ulPx = this.toPixelCoords([tex.svgUpperLeft], decimals)[0]!;
    const w = tex.widthPx;
    const h = tex.heightPx;
    const [vbX, vbY, vbW, vbH] = tex.rendered.viewBox;

    // Optional backing rect (so labels stay readable over busy backgrounds).
    let bgRect = "";
    if (tex.bgColor) {
      const padPx = toPixelLen(tex.bgPadding, this.config.pw, this.config.fw, decimals);
      const rPx = tex.bgRadius > 0 ? toPixelLen(tex.bgRadius, this.config.pw, this.config.fw, decimals) : 0;
      const rAttr = rPx > 0 ? ` rx="${numStr(rPx, decimals)}" ry="${numStr(rPx, decimals)}"` : "";
      bgRect = `<rect x="${numStr(ulPx[0] - padPx, decimals)}" y="${numStr(ulPx[1] - padPx, decimals)}" width="${numStr(w + 2 * padPx, decimals)}" height="${numStr(h + 2 * padPx, decimals)}"${rAttr} fill="${tex.bgColor.value}" fill-opacity="${tex.bgOpacity}"/>`;
    }

    // Inner glyph content — drop MathJax's outer <svg> and replace currentColor
    // with the actual fill (avoids CSS-inheritance pitfalls in librsvg/magick).
    const fill = tex.fillColor.value;
    const inner = tex.rendered.svg
      .replace(/^<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/currentColor/g, fill);
    const objId = `id-${idOf(tex)}`;

    // Place via a nested <g> transform = translate(ulPx) * scale(w/vbW, h/vbH) * translate(-vbX, -vbY).
    // This avoids nested <svg> positioning, which librsvg/some renderers
    // mishandle.
    const scaleX = w / vbW;
    const scaleY = h / vbH;
    const tx = ulPx[0] - vbX * scaleX;
    const ty = ulPx[1] - vbY * scaleY;
    let transform = `translate(${numStr(tx, decimals)} ${numStr(ty, decimals)}) scale(${numStr(scaleX, decimals)} ${numStr(scaleY, decimals)})`;

    // SVG transform is clockwise; manim heading is CCW — negate.
    const headingDeg = -tex.heading * (180 / Math.PI);
    if (headingDeg !== 0) {
      const centerPx = this.toPixelCoords([tex.center], decimals)[0]!;
      transform = `rotate(${numStr(headingDeg, decimals)} ${numStr(centerPx[0], decimals)} ${numStr(centerPx[1], decimals)}) ${transform}`;
    }

    const glyphG = `<g id="${objId}" fill-opacity="${tex.fillOpacity}" transform="${transform}">${inner}</g>`;
    return bgRect + glyphG;
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
