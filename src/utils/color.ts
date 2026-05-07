// Minimal color subset. Will expand as needed; matches Python smanim/utils/color.py palette names.
export class ManimColor {
  constructor(public readonly value: string) {}
  toString() {
    return this.value;
  }
}

const c = (hex: string) => new ManimColor(hex);

export const WHITE = c("#FFFFFF");
export const BLACK = c("#000000");
export const RED = c("#FC6255");
export const GREEN = c("#83C167");
export const BLUE = c("#58C4DD");
export const YELLOW = c("#FFFF00");
export const ORANGE = c("#FF862F");
export const PURPLE = c("#9A72AC");
export const PINK = c("#D147BD");
export const GRAY = c("#888888");
export const GREY = GRAY;

// Tone variants — same naming as smanim.utils.color.
export const BLUE_A = c("#C7E9F1");
export const BLUE_B = c("#9CDCEB");
export const BLUE_C = c("#58C4DD");
export const BLUE_D = c("#29ABCA");
export const BLUE_E = c("#236B8E");

// Mirrors smanim's `has_default_colors_set` — used by subclasses (e.g. Polygon) to know
// whether the user passed any color kwarg, so they can apply their own default otherwise.
export type ColorKwargs = {
  color?: ManimColor;
  fillColor?: ManimColor;
  strokeColor?: ManimColor;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
};

export const hasDefaultColorsSet = (kw: ColorKwargs): boolean =>
  kw.color !== undefined ||
  kw.fillColor !== undefined ||
  kw.strokeColor !== undefined ||
  kw.opacity !== undefined ||
  kw.fillOpacity !== undefined ||
  kw.strokeOpacity !== undefined;
