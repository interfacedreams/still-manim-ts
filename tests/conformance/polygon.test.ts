import { describe, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  canvas,
  Canvas,
  Polygon,
  Rectangle,
  RegularPolygon,
  Square,
  Triangle,
  RIGHT,
  UP,
  UR,
  RED,
  GREEN,
  PI,
  type Vec3,
  type Mobject,
} from "../../src/index.js";

const FIXTURES_DIR = "/Users/tommyjoseph/tommy11jo/still-manim/fixtures";
const TOL = 1e-9;

type PolygonRecord = {
  class: string;
  vertices: number[][];
  points: number[][];
  bounding_points: number[][];
  center: number[];
  top: number[];
  bottom: number[];
  left: number[];
  right: number[];
  width: number;
  height: number;
};

type Fixture = {
  name: string;
  polygons: PolygonRecord[];
  svg_raw: string;
  svg_viewbox: number[];
};

const loadFixture = (name: string): Fixture =>
  JSON.parse(readFileSync(join(FIXTURES_DIR, `${name}.json`), "utf8")) as Fixture;

const expectVec3Close = (actual: readonly number[], expected: readonly number[], label: string) => {
  expect(actual.length, `${label}: dim`).toBe(expected.length);
  for (let i = 0; i < actual.length; i++) {
    expect(Math.abs(actual[i]! - expected[i]!), `${label}[${i}] (got ${actual[i]} expected ${expected[i]})`).toBeLessThan(TOL);
  }
};

const expectPointsClose = (actual: readonly (readonly number[])[], expected: number[][], label: string) => {
  expect(actual.length, `${label}: count`).toBe(expected.length);
  for (let i = 0; i < actual.length; i++) {
    expectVec3Close(actual[i]!, expected[i]!, `${label}[${i}]`);
  }
};

const assertPolygon = (poly: any, rec: PolygonRecord, label: string) => {
  expectPointsClose(poly.vertices, rec.vertices, `${label}.vertices`);
  expectPointsClose(poly.points, rec.points, `${label}.points`);
  expectPointsClose(poly.boundingPoints, rec.bounding_points, `${label}.boundingPoints`);
  expectVec3Close(poly.center, rec.center, `${label}.center`);
  expectVec3Close(poly.top, rec.top, `${label}.top`);
  expectVec3Close(poly.bottom, rec.bottom, `${label}.bottom`);
  expectVec3Close(poly.left, rec.left, `${label}.left`);
  expectVec3Close(poly.right, rec.right, `${label}.right`);
  expect(Math.abs(poly.width - rec.width)).toBeLessThan(TOL);
  expect(Math.abs(poly.height - rec.height)).toBeLessThan(TOL);
};

// Builders for each scene. Must match the Python registry in still-manim/scripts/dump_fixtures.py.
const SCENES: Record<string, () => Mobject[]> = {
  square_default: () => [new Square({ sideLength: 2 })],
  square_3: () => [new Square({ sideLength: 3 })],
  rectangle_4_2: () => [new Rectangle({ width: 4, height: 2 })],
  triangle_default: () => [new Triangle()],
  triangle_1_5: () => [new Triangle({ sideLength: 1.5 })],
  regular_pentagon: () => [new RegularPolygon({ n: 5, radius: 1 })],
  regular_hexagon: () => [new RegularPolygon({ n: 6, radius: 1 })],
  polygon_custom_diamond: () => [
    new Polygon({ vertices: [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]] }),
  ],
  next_to_right: () => {
    const sq = new Square({ sideLength: 2 });
    const tri = new Triangle({ sideLength: 1.5, fillColor: RED }).nextTo(sq, RIGHT);
    return [sq, tri];
  },
  next_to_up: () => {
    const sq = new Square({ sideLength: 2 });
    const tri = new Triangle({ sideLength: 1.5, fillColor: RED }).nextTo(sq, UP);
    return [sq, tri];
  },
  next_to_corner_ur: () => {
    const sq = new Square({ sideLength: 2 });
    const tri = new Triangle({ sideLength: 1, fillColor: GREEN }).nextTo(sq, UR);
    return [sq, tri];
  },
  shifted_square: () => [new Square({ sideLength: 2 }).shift([1.5, -0.5, 0])],
  scaled_triangle: () => [new Triangle({ sideLength: 2 }).scale(0.5)],
  rotated_square: () => [new Square({ sideLength: 2 }).rotate(PI / 6)],
  three_squares_row: () => {
    const a = new Square({ sideLength: 1 });
    const b = new Square({ sideLength: 1, fillColor: RED }).nextTo(a, RIGHT);
    const c = new Square({ sideLength: 1, fillColor: GREEN }).nextTo(b, RIGHT);
    return [a, b, c];
  },
};

const FIXTURE_NAMES = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort();

describe("polygon conformance", () => {
  for (const name of FIXTURE_NAMES) {
    test(name, () => {
      const builder = SCENES[name];
      expect(builder, `no TS scene builder for fixture "${name}"`).toBeDefined();
      const polys = builder!();
      const fix = loadFixture(name);
      expect(polys.length, "polygon count").toBe(fix.polygons.length);
      for (let i = 0; i < polys.length; i++) {
        assertPolygon(polys[i]!, fix.polygons[i]!, `${name}.polys[${i}]`);
      }
    });
  }
});
