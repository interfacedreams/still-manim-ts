import { CONFIG } from "../../config.js";
import { ORIGIN, OUT, PI, UL } from "../../constants.js";
import { type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { toManimLen, toPixelLen } from "../../utils/space_ops.js";
import { loadFont, measureMetrics, wrapText, fontFileFor } from "../../utils/text_ops.js";
import { TransformableMobject } from "../transformable.js";

export type TextDecoration = "none" | "underline" | "overline" | "line-through";

export type TextOptions = {
  position?: Vec3;
  startAngle?: number;
  color?: ManimColor;
  fontFamily?: string;
  fontSize?: number;
  opacity?: number;
  textDecoration?: TextDecoration;
  bold?: boolean;
  italics?: boolean;
  zIndex?: number;
  /** Wrap-width in manim units. */
  maxWidth?: number;
  xPadding?: number;
  yPadding?: number;
  /** Inter-line spacing as a fraction of line height. */
  leading?: number;
};

/**
 * Non-vector text. Renders as native SVG `<text>`/`<tspan>`. Bounding box is
 * computed from font metrics (via opentype.js) — expect ~1–2px divergence
 * from the Python (PIL) implementation.
 */
export class Text extends TransformableMobject {
  rawText: string;
  protected _heading: number;
  textDecoration: TextDecoration;
  italics: boolean;
  bold: boolean;
  fillOpacity: number;
  fillColor: ManimColor;
  fontFamily: string;
  fontSize: number;
  fontPath: string;
  fontFile: string;

  // Layout (set by setupTextLayout)
  textTokens: string[] = [];
  fontWidths: number[] = [];
  xPadding: number = 0;
  yPadding: number = 0;
  xPaddingInPixels: number = 0;
  yPaddingInPixels: number = 0;
  fontAscentPixels: number = 0;
  fontDescentPixels: number = 0;
  leading: number = 0;
  leadingPixels: number = 0;
  /** Upper-left of the text in scene coordinates, used as the SVG anchor. */
  svgUpperLeft: Vec3 = [0, 0, 0];

  constructor(text: string, opts: TextOptions = {}) {
    if (typeof text !== "string") throw new Error("Text must be a string");
    if (text.length === 0) throw new Error("Text cannot be empty");
    super({ zIndex: opts.zIndex ?? 1 });
    this.rawText = text;
    this._heading = opts.startAngle ?? 0;
    this.textDecoration = opts.textDecoration ?? "none";
    this.italics = opts.italics ?? false;
    this.bold = opts.bold ?? false;
    this.fillOpacity = opts.opacity ?? 1.0;
    this.fillColor = opts.color ?? CONFIG.defaultTextColor;
    this.fontFamily = opts.fontFamily ?? CONFIG.defaultTextFontFamily;
    this.fontSize = opts.fontSize ?? CONFIG.defaultTextFontSize;
    this.fontFile = fontFileFor(this.fontFamily, this.bold, this.italics);
    this.fontPath = `${CONFIG.fontDir}/${this.fontFile}`;

    this.setupTextLayout({
      text,
      position: opts.position ?? UL,
      maxWidth: opts.maxWidth ?? 6.0,
      xPadding: opts.xPadding ?? 0,
      yPadding: opts.yPadding ?? 0,
      leading: opts.leading ?? 0.2,
    });
    this.moveToOrigin();
  }

  protected setupTextLayout(args: {
    text: string;
    position: Vec3;
    maxWidth: number;
    xPadding: number;
    yPadding: number;
    leading: number;
  }): void {
    const { text, position, maxWidth, xPadding, yPadding, leading } = args;
    const font = loadFont(CONFIG.fontDir, this.fontFamily, this.bold, this.italics);

    this.xPadding = xPadding;
    this.yPadding = yPadding;
    this.xPaddingInPixels = toPixelLen(xPadding, CONFIG.pw, CONFIG.fw);
    this.yPaddingInPixels = toPixelLen(yPadding, CONFIG.pw, CONFIG.fw);
    const maxWidthInPixels = toPixelLen(maxWidth, CONFIG.pw, CONFIG.fw);
    this.leading = leading;

    const metrics = measureMetrics(font, this.fontSize);
    this.fontAscentPixels = metrics.ascentPixels;
    this.fontDescentPixels = metrics.descentPixels;
    this.leadingPixels = (metrics.ascentPixels + metrics.descentPixels) * leading;

    const lineHeightMunits = toManimLen(metrics.ascentPixels + metrics.descentPixels, CONFIG.pw, CONFIG.fw);
    const leadingMunits = toManimLen(this.leadingPixels, CONFIG.pw, CONFIG.fw);

    const { lines, dims } = wrapText(text, font, this.fontSize, maxWidthInPixels);
    this.textTokens = lines;
    this.fontWidths = dims.map(([w]) => w + this.xPaddingInPixels * 2);

    const lineWidthMunits = toManimLen(
      lines.length > 1 ? Math.max(...this.fontWidths) : this.fontWidths[0]!,
      CONFIG.pw,
      CONFIG.fw,
    );
    const bboxHeight =
      lineHeightMunits * lines.length +
      leadingMunits * (lines.length - 1) +
      yPadding * 2;

    const ur: Vec3 = [position[0] + lineWidthMunits, position[1], position[2]];
    const ul: Vec3 = [position[0], position[1], position[2]];
    const dl: Vec3 = [ul[0], ul[1] - bboxHeight, ul[2]];
    const dr: Vec3 = [ur[0], ur[1] - bboxHeight, ur[2]];
    this.boundingPoints = [ur, ul, dl, dr];
    this.svgUpperLeft = [ul[0], ul[1], ul[2]];
  }

  get position(): Vec3 {
    return this.boundingPoints[1]!;
  }

  get heading(): number { return this._heading; }
  set heading(value: number) {
    const rot = value - this._heading;
    this._heading = value;
    this.boundingPoints = this.rotatePoints(this.boundingPoints, rot, OUT, null);
  }

  // -- Transforms -------------------------------------------------------------
  override rotate(angle: number = PI / 4, axis: Vec3 = OUT, aboutPoint: Vec3 | null = ORIGIN): this {
    if (aboutPoint === null) {
      // In-place rotation: SVG applies rotate() at draw time around current center.
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
    this.fontWidths = this.fontWidths.map((w) => w * factor);
    this.fontAscentPixels *= factor;
    this.fontDescentPixels *= factor;
    this.leadingPixels *= factor;
    this.leading *= factor;
    for (const m of this.submobjects) m.scale(factor, aboutPoint);
    return this;
  }

  override stretch(factor: number, dim: 0 | 1 | 2): this {
    this.setupTextLayout({
      text: this.rawText,
      position: [this.position[0] * factor, this.position[1] * factor, this.position[2] * factor],
      maxWidth: this.width * factor,
      xPadding: this.xPadding,
      yPadding: this.yPadding,
      leading: this.leading,
    });
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
    if (family) {
      for (const m of this.getFamily().slice(1)) m.setColor(color, true);
    }
    return this;
  }

  override setOpacity(opacity: number, family = false): this {
    this.fillOpacity = opacity;
    if (family) {
      for (const m of this.getFamily().slice(1)) m.setOpacity(opacity, true);
    }
    return this;
  }
}
