import { CONFIG } from "../../config.js";
import { ORIGIN, OUT, PI, UL } from "../../constants.js";
import { type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { toManimLen } from "../../utils/space_ops.js";
import { exToPx, renderTex, type RenderedTex } from "../../utils/tex_ops.js";
import { TransformableMobject } from "../transformable.js";

export type TexOptions = {
  position?: Vec3;
  startAngle?: number;
  color?: ManimColor;
  /** Pixel font size — controls overall Tex glyph scale via 1ex = fontSize * 0.43. */
  fontSize?: number;
  opacity?: number;
  zIndex?: number;
  /** Render in display style (block math) instead of inline. */
  display?: boolean;
};

/**
 * LaTeX math expression rendered to SVG via MathJax. The rendered glyph paths
 * are kept verbatim and embedded as a nested `<svg>` at draw time. Bounding
 * box is sized from MathJax's reported width/height, scaled by `fontSize`.
 */
export class Tex extends TransformableMobject {
  rawTex: string;
  rendered: RenderedTex;
  fontSize: number;
  fillColor: ManimColor;
  fillOpacity: number;
  protected _heading: number;

  /** Pixel-space dimensions at the current font size. */
  widthPx: number;
  heightPx: number;
  vAlignPx: number;

  /** Upper-left of the Tex box in scene coords (anchor for SVG <g> placement). */
  svgUpperLeft: Vec3 = [0, 0, 0];

  constructor(latex: string, opts: TexOptions = {}) {
    if (typeof latex !== "string") throw new Error("Tex must be a string");
    if (latex.length === 0) throw new Error("Tex cannot be empty");
    super({ zIndex: opts.zIndex ?? 1 });
    this.rawTex = latex;
    this._heading = opts.startAngle ?? 0;
    this.fontSize = opts.fontSize ?? CONFIG.defaultTextFontSize;
    this.fillColor = opts.color ?? CONFIG.defaultTextColor;
    this.fillOpacity = opts.opacity ?? 1.0;
    this.rendered = renderTex(latex, opts.display ?? false);

    const onePx = exToPx(this.fontSize);
    this.widthPx = this.rendered.exWidth * onePx;
    this.heightPx = this.rendered.exHeight * onePx;
    this.vAlignPx = this.rendered.exVAlign * onePx;

    const widthMunits = toManimLen(this.widthPx, CONFIG.pw, CONFIG.fw);
    const heightMunits = toManimLen(this.heightPx, CONFIG.pw, CONFIG.fw);

    const position = opts.position ?? UL;
    const ul: Vec3 = [position[0], position[1], position[2]];
    const ur: Vec3 = [ul[0] + widthMunits, ul[1], 0];
    const dl: Vec3 = [ul[0], ul[1] - heightMunits, 0];
    const dr: Vec3 = [ur[0], dl[1], 0];
    this.boundingPoints = [ur, ul, dl, dr];
    this.svgUpperLeft = [ul[0], ul[1], ul[2]];

    this.moveToOrigin();
  }

  get heading(): number { return this._heading; }
  set heading(value: number) {
    const rot = value - this._heading;
    this._heading = value;
    this.boundingPoints = this.rotatePoints(this.boundingPoints, rot, OUT, null);
  }

  // -- Transforms (mirrors Text) ----------------------------------------------
  override rotate(angle: number = PI / 4, axis: Vec3 = OUT, aboutPoint: Vec3 | null = ORIGIN): this {
    if (aboutPoint === null) {
      this.heading = this._heading + angle;
      for (const m of this.submobjects) m.rotate(angle, axis, aboutPoint);
      return this;
    }
    const oldCenter = this.center;
    const newCenter = this.rotatePoints([oldCenter], angle, axis, aboutPoint)[0]!;
    this.moveTo(newCenter);
    return this;
  }

  override scale(factor: number, aboutPoint: Vec3 | null = null): this {
    this.boundingPoints = this.scalePoints(this.boundingPoints, factor, aboutPoint);
    this.svgUpperLeft = this.scalePoints([this.svgUpperLeft], factor, aboutPoint)[0]!;
    this.fontSize *= factor;
    this.widthPx *= factor;
    this.heightPx *= factor;
    this.vAlignPx *= factor;
    for (const m of this.submobjects) m.scale(factor, aboutPoint);
    return this;
  }

  override stretch(factor: number, dim: 0 | 1 | 2): this {
    this.boundingPoints = this.stretchPoints(this.boundingPoints, factor, dim);
    this.svgUpperLeft = this.stretchPoints([this.svgUpperLeft], factor, dim)[0]!;
    if (dim === 0) this.widthPx *= factor;
    if (dim === 1) this.heightPx *= factor;
    for (const m of this.submobjects) m.stretch(factor, dim);
    return this;
  }

  override shift(vector: Vec3): this {
    this.boundingPoints = this.shiftPoints(this.boundingPoints, vector);
    this.svgUpperLeft = this.shiftPoints([this.svgUpperLeft], vector)[0]!;
    for (const m of this.submobjects) m.shift(vector);
    return this;
  }

  override setColor(color: ManimColor, family = false): this {
    this.fillColor = color;
    if (family) for (const m of this.getFamily().slice(1)) m.setColor(color, true);
    return this;
  }

  override setOpacity(opacity: number, family = false): this {
    this.fillOpacity = opacity;
    if (family) for (const m of this.getFamily().slice(1)) m.setOpacity(opacity, true);
    return this;
  }
}
