import type { Vec3 } from "./vec.js";

/**
 * Minimal SVG-path parser → list of cubic bezier quads (start, c1, c2, end).
 * Supports M/m, L/l, H/h, V/v, C/c, Z/z. Lineto / horizontal / vertical
 * commands are emitted as straight bezier quads (linearly interpolated handles).
 *
 * This is enough to render the manim brace path; expand as needed for other
 * SVG-sourced shapes.
 */
export const parseSvgPathToQuads = (d: string): Vec3[][] => {
  // Tokenize commands and numeric args. Numbers can be like ".5", "-1.2e-4", etc.
  const tokenRe = /([MmLlHhVvCcZz])|(-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)/g;
  type Token = { cmd?: string; num?: number };
  const tokens: Token[] = [];
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(d)) !== null) {
    if (m[1]) tokens.push({ cmd: m[1] });
    else if (m[2]) tokens.push({ num: parseFloat(m[2]) });
  }

  const quads: Vec3[][] = [];
  let cx = 0, cy = 0;        // current point
  let sx = 0, sy = 0;        // last move start (subpath start)
  let i = 0;
  let prevCmd = "";

  const next = () => {
    const t = tokens[i++];
    if (!t || t.num === undefined) throw new Error(`Expected number at token ${i}`);
    return t.num;
  };

  const lineToQuad = (x: number, y: number) => {
    const start: Vec3 = [cx, cy, 0];
    const end: Vec3 = [x, y, 0];
    const dx = (x - cx) / 3, dy = (y - cy) / 3;
    quads.push([
      start,
      [cx + dx, cy + dy, 0],
      [cx + 2 * dx, cy + 2 * dy, 0],
      end,
    ]);
    cx = x; cy = y;
  };

  while (i < tokens.length) {
    const tok = tokens[i]!;
    let cmd: string;
    if (tok.cmd) {
      cmd = tok.cmd;
      i++;
    } else {
      // Implicit command: same as previous, except after M → L, after m → l.
      cmd = prevCmd === "M" ? "L" : prevCmd === "m" ? "l" : prevCmd;
      if (!cmd) throw new Error("Path data starts without a command");
    }
    prevCmd = cmd;

    switch (cmd) {
      case "M": cx = next(); cy = next(); sx = cx; sy = cy; break;
      case "m": cx += next(); cy += next(); sx = cx; sy = cy; break;
      case "L": { const x = next(), y = next(); lineToQuad(x, y); break; }
      case "l": { const x = cx + next(), y = cy + next(); lineToQuad(x, y); break; }
      case "H": { const x = next(); lineToQuad(x, cy); break; }
      case "h": { const x = cx + next(); lineToQuad(x, cy); break; }
      case "V": { const y = next(); lineToQuad(cx, y); break; }
      case "v": { const y = cy + next(); lineToQuad(cx, y); break; }
      case "C": {
        const x1 = next(), y1 = next(), x2 = next(), y2 = next(), x = next(), y = next();
        quads.push([[cx, cy, 0], [x1, y1, 0], [x2, y2, 0], [x, y, 0]]);
        cx = x; cy = y;
        break;
      }
      case "c": {
        const x1 = cx + next(), y1 = cy + next();
        const x2 = cx + next(), y2 = cy + next();
        const x = cx + next(), y = cy + next();
        quads.push([[cx, cy, 0], [x1, y1, 0], [x2, y2, 0], [x, y, 0]]);
        cx = x; cy = y;
        break;
      }
      case "Z":
      case "z":
        if (cx !== sx || cy !== sy) lineToQuad(sx, sy);
        cx = sx; cy = sy;
        break;
      default:
        throw new Error(`Unsupported SVG path command: ${cmd}`);
    }
  }
  return quads;
};
