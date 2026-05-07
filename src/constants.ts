import type { Vec3 } from "./utils/vec.js";

export const ORIGIN: Vec3 = [0, 0, 0];
export const UP: Vec3 = [0, 1, 0];
export const DOWN: Vec3 = [0, -1, 0];
export const RIGHT: Vec3 = [1, 0, 0];
export const LEFT: Vec3 = [-1, 0, 0];
export const IN: Vec3 = [0, 0, -1];
export const OUT: Vec3 = [0, 0, 1];

export const UL: Vec3 = [-1, 1, 0];
export const UR: Vec3 = [1, 1, 0];
export const DL: Vec3 = [-1, -1, 0];
export const DR: Vec3 = [1, -1, 0];

export const X_AXIS: Vec3 = [1, 0, 0];
export const Y_AXIS: Vec3 = [0, 1, 0];
export const Z_AXIS: Vec3 = [0, 0, 1];

export const PI = Math.PI;
export const TAU = 2 * Math.PI;
export const DEGREES = TAU / 360;
export const RADIANS = 360 / TAU;

// Padding
export const TINY_BUFF = 0.03;
export const SMALL_BUFF = 0.1;
export const MED_SMALL_BUFF = 0.25;
export const MED_LARGE_BUFF = 0.5;
export const LARGE_BUFF = 1;
export const DEFAULT_MOBJECT_TO_EDGE_BUFFER = MED_LARGE_BUFF;
export const DEFAULT_MOBJECT_TO_MOBJECT_BUFFER = SMALL_BUFF;

// Text
export const H1_FONT_SIZE = 40;
export const H2_FONT_SIZE = 30;
export const H3_FONT_SIZE = 24;
export const DEFAULT_FONT_SIZE = 20;

// Layering
export const Z_INDEX_MIN = -2147483648;

// Resolutions (pixels per manim unit)
export const LOW_RES = 72;
export const MEDIUM_RES = 90;
export const HIGH_RES = 120;

// Misc
export const DEFAULT_STROKE_WIDTH = 4.0;
export const DEFAULT_ARROW_TIP_LENGTH = 0.35;
export const DEFAULT_DOT_RADIUS = 0.08;
