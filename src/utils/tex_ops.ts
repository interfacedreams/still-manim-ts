import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

let docSingleton: ReturnType<typeof mathjax.document> | null = null;
let adaptorSingleton: ReturnType<typeof liteAdaptor> | null = null;

const getDoc = () => {
  if (!docSingleton) {
    adaptorSingleton = liteAdaptor();
    RegisterHTMLHandler(adaptorSingleton);
    const tex = new TeX({ packages: AllPackages });
    // fontCache:'local' inlines glyph paths in the SVG, so the result is
    // self-contained (no external font deps at render time).
    const svg = new SVG({ fontCache: "local" });
    docSingleton = mathjax.document("", { InputJax: tex, OutputJax: svg });
  }
  return { doc: docSingleton, adaptor: adaptorSingleton! };
};

const cache = new Map<string, RenderedTex>();

export type RenderedTex = {
  /** Inner <svg>...</svg> string (no <mjx-container> wrapper). */
  svg: string;
  /** width / height attributes parsed from the SVG, in `ex` units. */
  exWidth: number;
  exHeight: number;
  /** vertical-align style in ex (negative = baseline below box bottom). */
  exVAlign: number;
  /** Internal MathJax viewBox: [minX, minY, w, h]. */
  viewBox: [number, number, number, number];
};

const parseExFloat = (s: string): number => {
  const m = s.match(/(-?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]!) : 0;
};

/** Render a LaTeX string to a self-contained SVG fragment. */
export const renderTex = (latex: string, display = false): RenderedTex => {
  const cacheKey = `${display ? "D:" : ""}${latex}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const { doc, adaptor } = getDoc();
  const node = doc.convert(latex, { display });
  // node is the <mjx-container>; its first child is the <svg>.
  const html = adaptor.outerHTML(node);
  // Extract inner <svg>...</svg>
  const svgMatch = html.match(/<svg[^>]*>[\s\S]*<\/svg>/);
  if (!svgMatch) throw new Error(`MathJax produced no SVG for: ${latex}`);
  const svg = svgMatch[0];

  const widthMatch = svg.match(/width="([\d.]+)ex"/);
  const heightMatch = svg.match(/height="([\d.]+)ex"/);
  const vAlignMatch = svg.match(/vertical-align:\s*(-?[\d.]+)ex/);
  const viewBoxMatch = svg.match(/viewBox="(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)"/);
  if (!widthMatch || !heightMatch || !viewBoxMatch) {
    throw new Error(`Could not parse MathJax SVG metadata for: ${latex}`);
  }

  const result: RenderedTex = {
    svg,
    exWidth: parseFloat(widthMatch[1]!),
    exHeight: parseFloat(heightMatch[1]!),
    exVAlign: vAlignMatch ? parseFloat(vAlignMatch[1]!) : 0,
    viewBox: [
      parseFloat(viewBoxMatch[1]!),
      parseFloat(viewBoxMatch[2]!),
      parseFloat(viewBoxMatch[3]!),
      parseFloat(viewBoxMatch[4]!),
    ],
  };
  cache.set(cacheKey, result);
  return result;
};

/** MathJax's "1ex" is ~0.430555 em; for a given font-size in px, returns 1ex in px. */
export const exToPx = (fontSizePx: number): number => fontSizePx * 0.430555;
