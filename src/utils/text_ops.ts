import { readFileSync } from "node:fs";

import opentype from "opentype.js";

export type FontStyle = readonly [bold: boolean, italic: boolean];

const CM_FONTS: Record<string, string> = {
  "false,false": "computer-modern/cmunrm.ttf",
  "true,false": "computer-modern/cmunbx.ttf",
  "false,true": "computer-modern/cmunti.ttf",
  "true,true": "computer-modern/cmunbi.ttf",
};

const ROBOTO_FONTS: Record<string, string> = {
  "false,false": "Roboto/Roboto-Regular.ttf",
  "true,false": "Roboto/Roboto-Bold.ttf",
  "false,true": "Roboto/Roboto-Italic.ttf",
  "true,true": "Roboto/Roboto-BoldItalic.ttf",
};

const FONT_FILES: Record<string, Record<string, string>> = {
  "computer-modern": CM_FONTS,
  Roboto: ROBOTO_FONTS,
};

const fontCache = new Map<string, opentype.Font>();

export const fontFileFor = (family: string, bold: boolean, italic: boolean): string => {
  const map = FONT_FILES[family];
  if (!map) throw new Error(`Unknown font family: ${family}`);
  const key = `${bold},${italic}`;
  const file = map[key];
  if (!file) throw new Error(`No font file for ${family} (bold=${bold}, italic=${italic})`);
  return file;
};

export const loadFont = (fontDir: string, family: string, bold: boolean, italic: boolean): opentype.Font => {
  const file = fontFileFor(family, bold, italic);
  const cacheKey = `${fontDir}/${file}`;
  let font = fontCache.get(cacheKey);
  if (!font) {
    const buf = readFileSync(cacheKey);
    // opentype expects an ArrayBuffer; Node Buffer.buffer can be a slice of a larger one.
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    font = opentype.parse(ab);
    fontCache.set(cacheKey, font);
  }
  return font;
};

export type FontMetrics = {
  ascentPixels: number;
  descentPixels: number;
};

/**
 * Mirrors PIL's `font.getbbox("aGg")` / `getbbox("aG")` calculation. Uses
 * opentype.js getPath bbox per glyph string. Note that the metrics will not
 * exactly match PIL — expect ~1–2px divergence per the brief.
 */
export const measureMetrics = (font: opentype.Font, fontSize: number): FontMetrics => {
  const bboxAGG = font.getPath("aGg", 0, 0, fontSize).getBoundingBox();
  const bboxAG = font.getPath("aG", 0, 0, fontSize).getBoundingBox();
  const aggH = bboxAGG.y2 - bboxAGG.y1;
  const agH = bboxAG.y2 - bboxAG.y1;
  return {
    ascentPixels: agH,
    descentPixels: aggH - agH,
  };
};

export const measureWidth = (font: opentype.Font, text: string, fontSize: number): number => {
  return font.getAdvanceWidth(text, fontSize);
};

export const measureBbox = (font: opentype.Font, text: string, fontSize: number): { width: number; height: number } => {
  const bbox = font.getPath(text, 0, 0, fontSize).getBoundingBox();
  return { width: bbox.x2 - bbox.x1, height: bbox.y2 - bbox.y1 };
};

/**
 * Wraps text into lines that fit within `maxWidthInPixels`. Returns the line
 * strings and a (width, height) per line. Logic mirrors smanim's wrap_text.
 */
export const wrapText = (
  text: string,
  font: opentype.Font,
  fontSize: number,
  maxWidthInPixels: number,
): { lines: string[]; dims: Array<readonly [number, number]> } => {
  const words = text.split(" ");
  const lines: string[] = [];
  const dims: Array<readonly [number, number]> = [];
  const xSize = font.getAdvanceWidth("x", fontSize) || 1;
  let approxNumChars = Math.floor(maxWidthInPixels / xSize);
  if (approxNumChars === 0) approxNumChars = 1;

  const dim = (s: string): [number, number] => {
    const b = font.getPath(s, 0, 0, fontSize).getBoundingBox();
    return [b.x2 - b.x1, b.y2 - b.y1];
  };

  let wordInd = 0;
  while (wordInd < words.length) {
    const remaining = words.slice(wordInd);
    const joined = remaining.join(" ");
    const [w0, h0] = dim(joined);
    if (remaining.length === 1 || w0 < maxWidthInPixels) {
      lines.push(joined);
      dims.push([w0, h0]);
      break;
    }
    let curInd = wordInd;
    let curText = remaining[0]!;
    curInd += 1;
    for (let k = 1; k < remaining.length; k++) {
      if ((curText + remaining[k]!).length <= approxNumChars) {
        curText += " " + remaining[k]!;
        curInd += 1;
      } else break;
    }
    let [w, h] = dim(curText);
    if (w < maxWidthInPixels) {
      while (w < maxWidthInPixels) {
        curInd += 1;
        if (curInd > words.length) break;
        curText = words.slice(wordInd, curInd).join(" ");
        [w, h] = dim(curText);
      }
      curInd -= 1;
      let oneBack = words.slice(wordInd, curInd).join(" ");
      if (curInd !== words.length) oneBack += " ";
      const [bw, bh] = dim(oneBack);
      lines.push(oneBack);
      dims.push([bw, bh]);
      wordInd = curInd;
    } else {
      while (w > maxWidthInPixels) {
        curInd -= 1;
        curText = words.slice(wordInd, curInd).join(" ") + " ";
        [w, h] = dim(curText);
        if (curInd === wordInd) {
          curInd = wordInd + 1;
          break;
        }
      }
      const [w2, h2] = dim(curText);
      lines.push(curText);
      dims.push([w2, h2]);
      wordInd = curInd;
    }
  }
  return { lines, dims };
};
