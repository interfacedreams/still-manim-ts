import { describe, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { SCENES } from "./scenes.js";

const FIXTURES_DIR = "/Users/tommyjoseph/tommy11jo/still-manim/fixtures";
const TOL = 1e-9;

type PolygonRecord = {
  class: string;
  vertices?: number[][];
  points: number[][];
  bounding_points: number[][];
  center: number[];
  top: number[];
  bottom: number[];
  left: number[];
  right: number[];
  width: number;
  height: number;
  // Line/Arrow only:
  start?: number[];
  end?: number[];
  length?: number;
  // Arc/Circle only:
  radius?: number;
  angle?: number;
  arc_center?: number[];
};

type Fixture = {
  name: string;
  polygons: PolygonRecord[];
  svg_raw: string;
  svg_viewbox?: number[];
  visual_only?: boolean;
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
  if (rec.vertices) expectPointsClose(poly.vertices, rec.vertices, `${label}.vertices`);
  expectPointsClose(poly.points, rec.points, `${label}.points`);
  expectPointsClose(poly.boundingPoints, rec.bounding_points, `${label}.boundingPoints`);
  expectVec3Close(poly.center, rec.center, `${label}.center`);
  expectVec3Close(poly.top, rec.top, `${label}.top`);
  expectVec3Close(poly.bottom, rec.bottom, `${label}.bottom`);
  expectVec3Close(poly.left, rec.left, `${label}.left`);
  expectVec3Close(poly.right, rec.right, `${label}.right`);
  expect(Math.abs(poly.width - rec.width)).toBeLessThan(TOL);
  expect(Math.abs(poly.height - rec.height)).toBeLessThan(TOL);
  if (rec.start) expectVec3Close(poly.start, rec.start, `${label}.start`);
  if (rec.end) expectVec3Close(poly.end, rec.end, `${label}.end`);
  if (rec.length !== undefined) {
    expect(Math.abs(poly.length - rec.length), `${label}.length`).toBeLessThan(TOL);
  }
  if (rec.radius !== undefined) {
    expect(Math.abs(poly.radius - rec.radius), `${label}.radius`).toBeLessThan(TOL);
  }
  if (rec.angle !== undefined && typeof poly.angle === "number") {
    expect(Math.abs(poly.angle - rec.angle), `${label}.angle`).toBeLessThan(TOL);
  }
  if (rec.arc_center) expectVec3Close(poly.arcCenter, rec.arc_center, `${label}.arcCenter`);
};

const FIXTURE_NAMES = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort();

describe("polygon conformance", () => {
  for (const name of FIXTURE_NAMES) {
    const fix = loadFixture(name);
    if (fix.visual_only) continue;
    test(name, () => {
      const builder = SCENES[name];
      expect(builder, `no TS scene builder for fixture "${name}"`).toBeDefined();
      const polys = builder!();
      expect(polys.length, "polygon count").toBe(fix.polygons.length);
      for (let i = 0; i < polys.length; i++) {
        assertPolygon(polys[i]!, fix.polygons[i]!, `${name}.polys[${i}]`);
      }
    });
  }
});
