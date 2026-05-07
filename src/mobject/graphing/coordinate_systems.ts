import { CONFIG } from "../../config.js";
import { RIGHT, UP } from "../../constants.js";
import { BLUE_D, type ManimColor } from "../../utils/color.js";
import type { Vec3 } from "../../utils/vec.js";
import { Group } from "../group.js";
import { Line, type LineOptions } from "../geometry/line.js";
import { NumberLine, type NumberLineOptions } from "./number_line.js";
import { ParametricFunction, type ParametricFunctionOptions } from "./functions.js";

export type AxesOptions = {
  xAxis?: NumberLine;
  yAxis?: NumberLine;
  numSampledGraphPointsPerTick?: number;
};

export class Axes extends Group {
  xAxis: NumberLine;
  yAxis: NumberLine;
  numSampledGraphPointsPerTick: number;

  constructor(opts: AxesOptions = {}) {
    super();
    let { xAxis, yAxis } = opts;
    if (!xAxis) {
      const halfW = Math.floor(CONFIG.fw / 2);
      xAxis = new NumberLine({ xRange: [-halfW, halfW, 1], includeOriginTick: false });
    }
    if (!yAxis) {
      const halfH = Math.floor(CONFIG.fh / 2);
      yAxis = new NumberLine({ xRange: [-halfH, halfH, 1], includeOriginTick: false, isHorizontal: false });
    }
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.numSampledGraphPointsPerTick = opts.numSampledGraphPointsPerTick ?? 8;

    // Move y_axis so its origin lands on the x_axis's origin point.
    const destPoint = xAxis.coordToPoint(0);
    const startPoint = yAxis.coordToPoint(0);
    const yc = yAxis.center;
    const toCenter: Vec3 = [yc[0] - startPoint[0], yc[1] - startPoint[1], yc[2] - startPoint[2]];
    yAxis.shift([
      toCenter[0] + (destPoint[0] - yc[0]),
      toCenter[1] + (destPoint[1] - yc[1]),
      toCenter[2] + (destPoint[2] - yc[2]),
    ]);

    this.add(xAxis, yAxis);
    this.moveToOrigin();
  }

  /** Coordinate (x, y) on the graph → point in scene. */
  coordsToPoint(x: number, y: number): Vec3 {
    const xp = this.xAxis.coordToPoint(x);
    const yp = this.yAxis.coordToPoint(y);
    return [xp[0], yp[1], 0];
  }

  /** Plot y = f(x) over the x-axis range (or a custom xRange). */
  plot(
    fn: (x: number) => number,
    opts: { xRange?: [number, number] | [number, number, number] } & Partial<Omit<ParametricFunctionOptions, "function" | "underlyingFunction" | "yMin" | "yMax" | "tRange">> = {},
  ): ParametricFunction {
    let xRange: [number, number, number];
    if (opts.xRange) {
      xRange = opts.xRange.length === 2 ? [opts.xRange[0], opts.xRange[1], 0.01] : opts.xRange;
    } else {
      const sampleRate = this.xAxis.stepSize / this.numSampledGraphPointsPerTick;
      xRange = [this.xAxis.xMin, this.xAxis.xMax, sampleRate];
    }
    const yMinPt = this.yAxis.coordToPoint(this.yAxis.xMin);
    const yMaxPt = this.yAxis.coordToPoint(this.yAxis.xMax);
    const graph = new ParametricFunction({
      function: (t: number) => this.coordsToPoint(t, fn(t)),
      underlyingFunction: fn,
      yMin: yMinPt[1] < yMaxPt[1] ? yMinPt[1] : yMaxPt[1],
      yMax: yMinPt[1] < yMaxPt[1] ? yMaxPt[1] : yMinPt[1],
      tRange: xRange,
      ...opts,
    });
    this.add(graph);
    return graph;
  }
}

export type NumberPlaneOptions = AxesOptions & {
  coordStepSize?: number;
  gridLines?: boolean;
  gridLineConfig?: LineOptions;
};

export class NumberPlane extends Axes {
  gridLines: Group | null = null;

  constructor(opts: NumberPlaneOptions = {}) {
    super(opts);
    const {
      coordStepSize = 0.5,
      gridLines = true,
      gridLineConfig = {},
    } = opts;
    if (!gridLines) return;
    const cfg: LineOptions = {
      color: BLUE_D,
      strokeWidth: 1,
      opacity: 0.5,
      ...gridLineConfig,
    };
    this.gridLines = this.createGridLines(coordStepSize, cfg);
    this.add(this.gridLines);
    // Bring grid behind axes.
    this.submobjects = [this.gridLines, ...this.submobjects.filter((s) => s !== this.gridLines)];
  }

  static fromAxesRanges(opts: {
    xAxisRange: [number, number] | [number, number, number];
    yAxisRange: [number, number] | [number, number, number];
    xLength?: number;
    yLength?: number;
    fillCanvas?: boolean;
    axisConfig?: NumberLineOptions;
    planeOptions?: Omit<NumberPlaneOptions, "xAxis" | "yAxis">;
  }): NumberPlane {
    const fillCanvas = opts.fillCanvas ?? true;
    const xLength = fillCanvas ? CONFIG.fw : (opts.xLength ?? 4);
    const yLength = fillCanvas ? CONFIG.fh : (opts.yLength ?? 4);
    const axisCfg: NumberLineOptions = { includeOriginTick: false, ...opts.axisConfig };
    const xAxis = new NumberLine({ ...axisCfg, xRange: opts.xAxisRange, length: xLength });
    const yAxis = new NumberLine({ ...axisCfg, xRange: opts.yAxisRange, length: yLength, isHorizontal: false });
    return new NumberPlane({ ...opts.planeOptions, xAxis, yAxis });
  }

  private createGridLines(coordStepSize: number, lineConfig: LineOptions): Group {
    const verticalLines = new Group();
    const horizontalLines = new Group();
    const { xMin, xMax } = this.xAxis;
    const { xMin: yMin, xMax: yMax } = this.yAxis;

    const xLeft = this.xAxis.coordToPoint(xMin)[0];
    const xRight = this.xAxis.coordToPoint(xMax)[0];
    const yUp = this.yAxis.coordToPoint(yMax)[1];
    const yDown = this.yAxis.coordToPoint(yMin)[1];

    // Anchor grid to 0 (not xMin) so a grid line lands on the y-axis when
    // 0 is in range. Diverges from Python smanim (whose grid is offset for
    // non-aligned ranges like [-π, π]) but it's the intuitive behavior.
    const startX = Math.ceil(xMin / coordStepSize - 1e-9) * coordStepSize;
    for (let x = startX; x <= xMax + 1e-9; x += coordStepSize) {
      const xp = this.xAxis.coordToPoint(x);
      const xComp: Vec3 = [xp[0] * RIGHT[0], xp[0] * RIGHT[1], xp[0] * RIGHT[2]];
      verticalLines.add(new Line({
        ...lineConfig,
        start: [xComp[0] + UP[0] * yUp, xComp[1] + UP[1] * yUp, 0],
        end: [xComp[0] + UP[0] * yDown, xComp[1] + UP[1] * yDown, 0],
      }));
    }
    const startY = Math.ceil(yMin / coordStepSize - 1e-9) * coordStepSize;
    for (let y = startY; y <= yMax + 1e-9; y += coordStepSize) {
      const yp = this.yAxis.coordToPoint(y);
      const yComp: Vec3 = [yp[1] * UP[0], yp[1] * UP[1], yp[1] * UP[2]];
      horizontalLines.add(new Line({
        ...lineConfig,
        start: [yComp[0] + RIGHT[0] * xLeft, yComp[1] + RIGHT[1] * xLeft, 0],
        end: [yComp[0] + RIGHT[0] * xRight, yComp[1] + RIGHT[1] * xRight, 0],
      }));
    }
    return new Group(verticalLines, horizontalLines);
  }
}
