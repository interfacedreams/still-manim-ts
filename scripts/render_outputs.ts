/**
 * Render every scene in tests/conformance/scenes.ts to outputs/typescript/<name>.svg,
 * extract the matching Python SVG from the JSON fixtures into outputs/python/<name>.svg,
 * and emit outputs/index.html for visual side-by-side review.
 *
 * Run:  npx tsx scripts/render_outputs.ts
 * Open: outputs/index.html
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Canvas, type Mobject } from "../src/index.js";
import { SCENES } from "../tests/conformance/scenes.js";
import { CASE_STUDIES } from "../tests/case_studies/index.js";

const REPO = "/Users/tommyjoseph/tommy11jo/still-manim-ts";
const FIXTURES_DIR = "/Users/tommyjoseph/tommy11jo/still-manim/fixtures";
const OUT_ROOT = join(REPO, "outputs");
const TS_DIR = join(OUT_ROOT, "typescript");
const PY_DIR = join(OUT_ROOT, "python");

// Clear previous renders so old / renamed scenes don't linger.
rmSync(TS_DIR, { recursive: true, force: true });
rmSync(PY_DIR, { recursive: true, force: true });
mkdirSync(TS_DIR, { recursive: true });
mkdirSync(PY_DIR, { recursive: true });

const renderTs = (name: string, build: () => Mobject[]): string => {
  const c = new Canvas();
  for (const m of build()) c.add(m);
  return c.toSVG();
};

type Fixture = { svg_raw?: string };

const writePy = (name: string, outName: string): boolean => {
  const fixturePath = join(FIXTURES_DIR, `${name}.json`);
  if (!existsSync(fixturePath)) return false;
  try {
    const data: Fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    if (!data.svg_raw) return false;
    writeFileSync(join(PY_DIR, `${outName}.svg`), data.svg_raw);
    return true;
  } catch {
    return false;
  }
};

const pad = (n: number, w: number) => String(n).padStart(w, "0");

// Show newest scenes first. Object.keys preserves insertion order in JS, and
// the SCENES registry in scenes.ts is already ordered oldest → newest, so
// reversing here puts the most recent additions at the top of the page.
const sceneNames = Object.keys(SCENES).reverse();
let written = 0;
let pyCount = 0;
let tsOnlyCount = 0;
const entries: Array<{ outName: string; sceneName: string; pyExists: boolean }> = [];
for (let i = 0; i < sceneNames.length; i++) {
  const sceneName = sceneNames[i]!;
  const build = SCENES[sceneName];
  if (!build) continue;
  // Number from the top so #01 is the newest.
  const outName = `${pad(i + 1, 2)}_${sceneName}`;
  writeFileSync(join(TS_DIR, `${outName}.svg`), renderTs(sceneName, build));
  const pyExists = writePy(sceneName, outName);
  entries.push({ outName, sceneName, pyExists });
  written++;
  if (pyExists) pyCount++;
  else tsOnlyCount++;
}

const rows = entries.map(({ outName, pyExists }) => {
  const pyPane = pyExists
    ? `<object type="image/svg+xml" data="python/${outName}.svg"></object>`
    : `<div class="missing">TS-only composite — no Python equivalent</div>`;
  return `
    <section>
      <h3>${outName.replace(/_/g, " · ")}</h3>
      <div class="pair">
        <figure><figcaption>Python (still-manim)</figcaption>${pyPane}</figure>
        <figure><figcaption>TypeScript (smanim-ts)</figcaption><object type="image/svg+xml" data="typescript/${outName}.svg"></object></figure>
      </div>
    </section>`;
}).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>still-manim-ts conformance outputs</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; margin: 24px; background: #1a1a1a; color: #eee; }
    h1 { font-weight: 500; }
    section { margin: 32px 0; padding-bottom: 24px; border-bottom: 1px solid #333; }
    h3 { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 14px; color: #aaa; margin: 0 0 12px; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    figure { margin: 0; background: #000; border: 1px solid #333; border-radius: 4px; overflow: hidden; }
    figcaption { padding: 6px 10px; font-size: 12px; color: #888; background: #111; border-bottom: 1px solid #333; }
    object { width: 100%; height: 320px; display: block; background: #000; }
    .missing { width: 100%; height: 320px; display: flex; align-items: center; justify-content: center; background: #000; color: #555; font-size: 12px; font-style: italic; }
    nav.case-studies { background: #111; border: 1px solid #333; border-radius: 4px; padding: 14px 18px; margin: 16px 0 32px; }
    nav.case-studies h2 { margin: 0 0 8px; font-size: 14px; font-weight: 500; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
    nav.case-studies ul { margin: 0; padding-left: 20px; }
    nav.case-studies li { margin: 4px 0; color: #ccc; }
    nav.case-studies a { color: #9bd; text-decoration: none; }
    nav.case-studies a:hover { text-decoration: underline; }
    nav.case-studies .meta { color: #666; font-size: 12px; margin-left: 4px; }
  </style>
</head>
<body>
  <h1>still-manim-ts — conformance outputs (${written} scenes)</h1>
  <p style="color:#888; max-width:60ch;">Side-by-side render of each scene. Python (left) and TypeScript port (right) should look identical. Path numbers match within 1e-9; only cosmetic SVG-string differences (number formatting, attribute order) remain. Newest scenes are at the top. ${pyCount} Python ↔ TS comparisons + ${tsOnlyCount} TS-only composites.</p>
  <nav class="case-studies">
    <h2>Case studies</h2>
    <ul>
      ${CASE_STUDIES.map((cs) => `<li><a href="case-studies/${cs.id}/index.html">${cs.title}</a><span class="meta"> · ${cs.panels.length} panels</span></li>`).join("\n      ")}
    </ul>
  </nav>
  ${rows}
</body>
</html>
`;

writeFileSync(join(OUT_ROOT, "index.html"), html);
console.log(`wrote ${written} scenes to ${OUT_ROOT}`);
console.log(`open: ${join(OUT_ROOT, "index.html")}`);
