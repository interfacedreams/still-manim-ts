import { LOW_RES, ORIGIN, DEFAULT_FONT_SIZE } from "./constants.js";
import { BLACK, WHITE, type ManimColor } from "./utils/color.js";
import type { Vec3 } from "./utils/vec.js";

export type ConfigOptions = {
  density?: number;
  frameWidth?: number;
  frameHeight?: number;
  frameCenter?: Vec3;
  bgColor?: ManimColor | null;
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
  defaultTextColor: ManimColor = WHITE;
  defaultTextFontSize: number = DEFAULT_FONT_SIZE;
  defaultTextFontFamily: string = "computer-modern";

  constructor(opts: ConfigOptions = {}) {
    this.density = opts.density ?? DEFAULT_DENSITY;
    this.fw = opts.frameWidth ?? DEFAULT_FRAME_WIDTH;
    this.fh = opts.frameHeight ?? DEFAULT_FRAME_HEIGHT;
    this.fc = opts.frameCenter ?? ORIGIN;
    this.bgColor = opts.bgColor === undefined ? BLACK : opts.bgColor;
    this.pw = Math.floor(this.fw * this.density);
    this.ph = Math.floor(this.fh * this.density);
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
