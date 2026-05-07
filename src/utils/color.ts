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
export const GREEN_D = c("#5B9947");
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
// Diverges from manim's BLUE_E (#236B8E, muted teal) — chosen for a vibrant
// darker chart blue that pops on white. BLUE_E in Python is unused.
export const BLUE_E = c("#1F77B4");

export type ThemeName = "dark" | "light";

export type Theme = {
  bg: ManimColor;
  fg: ManimColor;
  /** Default backing-rect color for Tex/Text labels placed over a busy scene. */
  labelBg: ManimColor;
  /** Default backing-rect opacity. Light mode runs fully opaque so the white
   *  pad cleanly hides anything behind a label; dark mode keeps a hint of
   *  see-through so the canvas's gridlines/curves stay legible. */
  labelBgOpacity: number;
};

export const THEMES: Record<ThemeName, Theme> = {
  dark: { bg: BLACK, fg: WHITE, labelBg: BLACK, labelBgOpacity: 0.2 },
  light: { bg: WHITE, fg: BLACK, labelBg: WHITE, labelBgOpacity: 0.65 },
};

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
