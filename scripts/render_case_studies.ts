/**
 * Render each case study to its own HTML page with sticky tabs and a
 * horizontal scroll-snap panel container.
 *
 * Run:  npx tsx scripts/render_case_studies.ts
 * Open: outputs/case-studies/<id>/index.html
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Canvas } from "../src/index.js";
import { CASE_STUDIES } from "../tests/case_studies/index.js";

const REPO = "/Users/tommyjoseph/tommy11jo/still-manim-ts";
const OUT_ROOT = join(REPO, "outputs", "case-studies");

rmSync(OUT_ROOT, { recursive: true, force: true });
mkdirSync(OUT_ROOT, { recursive: true });

const renderOne = (cs: (typeof CASE_STUDIES)[number]): void => {
  const dir = join(OUT_ROOT, cs.id);
  mkdirSync(dir, { recursive: true });

  const sections: string[] = [];

  for (let i = 0; i < cs.panels.length; i++) {
    const panel = cs.panels[i]!;
    const c = new Canvas();
    for (const m of panel.build()) c.add(m);
    const filename = `${String(i + 1).padStart(2, "0")}_${panel.name}.svg`;
    writeFileSync(join(dir, filename), c.toSVG());

    sections.push(`
      <section>
        <h2>${i + 1}. ${escapeHtml(panel.title)}</h2>
        <object type="image/svg+xml" data="${filename}"></object>
      </section>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(cs.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; background: #1a1a1a; color: #eee; }
    header { padding: 14px 24px; background: #111; border-bottom: 1px solid #333; }
    header h1 { margin: 0; font-weight: 500; font-size: 18px; }
    header p { margin: 4px 0 0; color: #888; font-size: 13px; }
    main {
      display: flex; flex-direction: column; gap: 24px;
      padding: 24px; max-width: 1400px; margin: 0 auto;
    }
    section { display: flex; flex-direction: column; }
    section h2 {
      margin: 0 0 8px; font-weight: 500; font-size: 14px; color: #aaa;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
    }
    section object {
      width: 100%; height: 600px; display: block;
      background: #000; border: 1px solid #333; border-radius: 4px;
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(cs.title)}</h1>
    <p>${cs.panels.length} panels &middot; scroll vertically.</p>
  </header>
  <main>${sections.join("")}</main>
</body>
</html>
`;
  writeFileSync(join(dir, "index.html"), html);
  console.log(`wrote ${cs.panels.length} panels → ${dir}/index.html`);
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const indexRows = CASE_STUDIES.map(
  (cs) => `<li><a href="${cs.id}/index.html">${escapeHtml(cs.title)}</a> — ${cs.panels.length} panels</li>`,
).join("");
writeFileSync(
  join(OUT_ROOT, "index.html"),
  `<!doctype html>
<html><head><meta charset="utf-8"><title>Case studies</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#eee;padding:24px;}a{color:#9bd;}</style>
</head><body><h1>Case studies</h1><ul>${indexRows}</ul></body></html>`,
);

for (const cs of CASE_STUDIES) renderOne(cs);
console.log(`\nindex: ${OUT_ROOT}/index.html`);
