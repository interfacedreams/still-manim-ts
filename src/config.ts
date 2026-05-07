import { LOW_RES, ORIGIN, DEFAULT_FONT_SIZE } from "./constants.js";
import { BLACK, THEMES, WHITE, type ManimColor, type ThemeName } from "./utils/color.js";
import type { Vec3 } from "./utils/vec.js";

export type ConfigOptions = {
  density?: number;
  frameWidth?: number;
  frameHeight?: number;
  frameCenter?: Vec3;
  bgColor?: ManimColor | null;
  theme?: ThemeName;
};

const DEFAULT_DENSITY = LOW_RES;
const DEFAULT_FRAME_HEIGHT = 8;
const DEFAULT_FRAME_WIDTH = 14.222;

export class Config {
  density: number;
  fw: number;
  fh: number;
  fc: Vec3;
  bgColor: ManimColor | null;
  pw: number;
  ph: number;
  theme: ThemeName = "dark";
  defaultTextColor: ManimColor = WHITE;
  /** Backing-rect color used by mobjects that auto-add Tex/Text labels. */
  defaultLabelBgColor: ManimColor = BLACK;
  /** Backing-rect opacity (0 = invisible, 1 = fully opaque). Light theme uses 1.0. */
  defaultLabelBgOpacity: number = 0.2;
  /** Backing-rect corner radius in manim units. */
  defaultLabelBgRadius: number = 0.08;
  defaultTextFontSize: number = DEFAULT_FONT_SIZE;
  defaultTextFontFamily: string = "computer-modern";
  // Where bundled .ttf font files live. For now, points at still-manim's fonts dir.
  // Override per-instance with `setFontDir(path)` to ship custom fonts.
  fontDir: string = "/Users/tommyjoseph/tommy11jo/still-manim/smanim/mobject/text/fonts";

  constructor(opts: ConfigOptions = {}) {
    this.density = opts.density ?? DEFAULT_DENSITY;
    this.fw = opts.frameWidth ?? DEFAULT_FRAME_WIDTH;
    this.fh = opts.frameHeight ?? DEFAULT_FRAME_HEIGHT;
    this.fc = opts.frameCenter ?? ORIGIN;
    this.bgColor = opts.bgColor === undefined ? BLACK : opts.bgColor;
    this.pw = Math.floor(this.fw * this.density);
    this.ph = Math.floor(this.fh * this.density);
    if (opts.theme) this.setTheme(opts.theme);
  }

  /**
   * Switch all theme-derived defaults (canvas bg, default text color, default
   * label backing color) to the named theme. Mutates in place — call this
   * before constructing any Tex/Text/UnitCircle/etc. so they pick up the new
   * defaults at construction time.
   */
  setTheme(theme: ThemeName): this {
    const t = THEMES[theme];
    this.theme = theme;
    this.bgColor = t.bg;
    this.defaultTextColor = t.fg;
    this.defaultLabelBgColor = t.labelBg;
    this.defaultLabelBgOpacity = t.labelBgOpacity;
    return this;
  }

  setDimensions(width: number, height: number): this {
    this.fw = width;
    this.fh = height;
    this.pw = Math.floor(width * this.density);
    this.ph = Math.floor(height * this.density);
    return this;
  }
}

export const CONFIG = new Config();
