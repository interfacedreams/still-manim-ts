import type { Vec2, Vec3 } from "./vec.js";
import { cross2 } from "./vec.js";
import { RIGHT, TAU, X_AXIS, Y_AXIS, Z_AXIS } from "../constants.js";

// 3x3 matrix as row-major number[9].
export type Mat3 = readonly [number, number, number, number, number, number, number, number, number];

const isAxis = (a: Vec3, b: Vec3) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

// Counter-clockwise rotation matrix around `axis` by `angle` (radians). Mirrors smanim/utils/space_ops.rotation_matrix.
export const rotationMatrix = (angle: number, axis: Vec3 = Z_AXIS): Mat3 => {
  if (!isAxis(axis, X_AXIS) && !isAxis(axis, Y_AXIS) && !isAxis(axis, Z_AXIS)) {
    throw new Error("Axis must be one of (X_AXIS, Y_AXIS, Z_AXIS)");
  }
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  const [x, y, z] = axis;
  return [
    t * x * x + c, t * x * y - z * s, t * x * z + y * s,
    t * x * y + z * s, t * y * y + c, t * y * z - x * s,
    t * x * z - y * s, t * y * z + x * s, t * z * z + c,
  ];
};

// Multiplies a row vector by matrix (row-major), matching numpy `points @ R.T` for points stored as rows.
// Equivalent to `R @ v` for column vectors. Used by both rotateVector and bulk rotatePoints.
export const matVec = (m: Mat3, v: Vec3): Vec3 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];

export const rotateVector = (v: Vec3, angle: number, axis: Vec3 = Z_AXIS): Vec3 =>
  matVec(rotationMatrix(angle, axis), v);

// `compass_directions` — n cardinal vectors evenly spaced TAU/n around the unit circle, starting at `startVect`.
export const compassDirections = (n = 4, startVect: Vec3 = RIGHT): Vec3[] => {
  const angle = TAU / n;
  const out: Vec3[] = [];
  for (let k = 0; k < n; k++) out.push(rotateVector(startVect, k * angle));
  return out;
};

// `regular_vertices` — n CCW vertices around a circle radius r centered at origin.
// Note: when startAngle is undefined, Python uses 0 for n%2==0, TAU/4 for odd n.
export const regularVertices = (n: number, radius = 1, startAngle?: number): Vec3[] => {
  const sa = startAngle ?? (n % 2 === 0 ? 0 : TAU / 4);
  const startVect = rotateVector([radius, 0, 0], sa);
  return compassDirections(n, startVect);
};

export const mirrorVector = (v: Vec3, axis: Vec3): Vec3 => {
  const proj = (v[0] * axis[0] + v[1] * axis[1] + v[2] * axis[2]) /
    (axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
  const px = proj * axis[0], py = proj * axis[1], pz = proj * axis[2];
  // perpendicular = v - projection; mirrored = v - 2*perpendicular
  const perpX = v[0] - px, perpY = v[1] - py, perpZ = v[2] - pz;
  return [v[0] - 2 * perpX, v[1] - 2 * perpY, v[2] - 2 * perpZ];
};

// Returns the angle from a 2D direction vector, in [0, 2*PI).
export const angleFromVector = (v: Vec3): number => {
  let a = Math.atan2(v[1], v[0]);
  if (a < 0) a += TAU;
  return a;
};

export type LineIntersect = { point: Vec2; t: number } | null;

export const lineIntersect = (
  rayOrigin: Vec2,
  rayDir: Vec2,
  segStart: Vec2,
  segEnd: Vec2,
): LineIntersect => {
  const segDir: Vec2 = [segEnd[0] - segStart[0], segEnd[1] - segStart[1]];
  const detA = cross2(rayDir, segDir);
  if (detA === 0) return null;
  const diff: Vec2 = [segStart[0] - rayOrigin[0], segStart[1] - rayOrigin[1]];
  const t = cross2(diff, segDir) / detA;
  const u = cross2(diff, rayDir) / detA;
  if (t >= 0 && u >= 0 && u <= 1) {
    return { point: [rayOrigin[0] + t * rayDir[0], rayOrigin[1] + t * rayDir[1]], t };
  }
  return null;
};

const projectPolygon = (vertices2d: Vec2[], axis: Vec2): [number, number] => {
  let mn = Infinity, mx = -Infinity;
  for (const v of vertices2d) {
    const p = v[0] * axis[0] + v[1] * axis[1];
    if (p < mn) mn = p;
    if (p > mx) mx = p;
  }
  return [mn, mx];
};

// Separating Axis Theorem — convex polygons only.
export const polygonIntersection = (poly1: Vec3[], poly2: Vec3[]): boolean => {
  const p1: Vec2[] = poly1.map((v) => [v[0], v[1]]);
  const p2: Vec2[] = poly2.map((v) => [v[0], v[1]]);
  for (const poly of [p1, p2]) {
    const n = poly.length;
    for (let i = 0; i < n; i++) {
      const cur = poly[i]!;
      const nxt = poly[(i + 1) % n]!;
      const edge: Vec2 = [nxt[0] - cur[0], nxt[1] - cur[1]];
      const axis: Vec2 = [-edge[1], edge[0]];
      const [min1, max1] = projectPolygon(p1, axis);
      const [min2, max2] = projectPolygon(p2, axis);
      if (max1 < min2 || max2 < min1) return false;
    }
  }
  return true;
};

// Pixel-space conversions (only used by Canvas serialization).
export const toPixelLen = (scalar: number, pw: number, fw: number, decimalPrecision?: number): number => {
  const v = scalar * (pw / fw);
  return decimalPrecision !== undefined ? round(v, decimalPrecision) : v;
};

export const toManimLen = (scalar: number, pw: number, fw: number): number => scalar * (fw / pw);

export const round = (x: number, decimals: number): number => {
  const f = Math.pow(10, decimals);
  return Math.round(x * f) / f;
};

// Maps manim coords (y-up, origin centered) to pixel coords (y-down, origin top-left).
// Mirrors smanim/utils/space_ops.to_pixel_coords. `points` z-component is ignored.
export const toPixelCoords = (
  points: Vec3[],
  pw: number,
  ph: number,
  fw: number,
  fh: number,
  fc: Vec3,
  decimalPrecision?: number,
): Array<[number, number]> => {
  if (points.length === 0) return [];
  const sx = pw / fw;
  const sy = -ph / fh;
  const tx = pw / 2 - fc[0] * (pw / fw);
  const ty = ph / 2 + fc[1] * (ph / fh);
  return points.map((p) => {
    let x = p[0] * sx + tx;
    let y = p[1] * sy + ty;
    if (decimalPrecision !== undefined) {
      x = round(x, decimalPrecision);
      y = round(y, decimalPrecision);
    }
    return [x, y];
  });
};
