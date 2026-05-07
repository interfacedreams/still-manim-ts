/**
 * Render each case study to its own HTML page with sticky tabs and a
 * horizontal scroll-snap panel container.
 *
 * Run:  npx tsx scripts/render_case_studies.ts
 * Open: outputs/case-studies/<id>/index.html
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CONFIG, Canvas, type ThemeName } from "../src/index.js";
import { CASE_STUDIES } from "../tests/case_studies/index.js";

const REPO = "/Users/tommyjoseph/tommy11jo/still-manim-ts";
const OUT_ROOT = join(REPO, "outputs", "case-studies");

rmSync(OUT_ROOT, { recursive: true, force: true });
mkdirSync(OUT_ROOT, { recursive: true });

type CaseStudy = (typeof CASE_STUDIES)[number] & { theme?: ThemeName };

const PALETTES = {
  dark:  { bodyBg: "#1a1a1a", text: "#eee", headerBg: "#111", border: "#333", muted: "#888", subtle: "#aaa", panelBg: "#000" },
  light: { bodyBg: "#fafafa", text: "#222", headerBg: "#fff", border: "#ddd", muted: "#666", subtle: "#555", panelBg: "#fff" },
} as const;

const renderOne = (cs: CaseStudy): void => {
  const theme: ThemeName = cs.theme ?? "dark";
  // Apply theme BEFORE building any panel — Tex/Text/UnitCircle/etc. read
  // CONFIG.defaultTextColor and CONFIG.defaultLabelBgColor at construction
  // time, and Canvas reads CONFIG.bgColor at toSVG() time.
  CONFIG.setTheme(theme);
  const palette = PALETTES[theme];

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
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; background: ${palette.bodyBg}; color: ${palette.text}; }
    header.site-nav { position: sticky; top: 0; z-index: 10; background: ${palette.headerBg}; border-bottom: 1px solid ${palette.border}; padding: 10px 24px; display: flex; gap: 12px; align-items: center; }
    header.site-nav a { color: #4a90c2; text-decoration: none; font-size: 14px; }
    header.site-nav a:hover { text-decoration: underline; }
    header.site-nav .crumb { color: ${palette.muted}; font-size: 14px; }
    header.site-nav .here { color: ${palette.text}; font-size: 14px; }
    header.page { padding: 14px 24px; background: ${palette.headerBg}; border-bottom: 1px solid ${palette.border}; }
    header.page h1 { margin: 0; font-weight: 500; font-size: 18px; }
    header.page p { margin: 4px 0 0; color: ${palette.muted}; font-size: 13px; }
    main {
      display: flex; flex-direction: column; gap: 24px;
      padding: 24px; max-width: 1400px; margin: 0 auto;
    }
    section { display: flex; flex-direction: column; }
    section h2 {
      margin: 0 0 8px; font-weight: 500; font-size: 14px; color: ${palette.subtle};
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
    }
    section object {
      width: 100%; height: 600px; display: block;
      background: ${palette.panelBg}; border: 1px solid ${palette.border}; border-radius: 4px;
    }
  </style>
</head>
<body>
  <header class="site-nav">
    <a href="../../index.html">Home</a>
    <span class="crumb">·</span>
    <a href="../index.html">Case studies</a>
    <span class="crumb">·</span>
    <span class="here">${escapeHtml(cs.title)}</span>
  </header>
  <header class="page">
    <h1>${escapeHtml(cs.title)}</h1>
    <p>${cs.panels.length} panels &middot; scroll vertically &middot; ${theme} mode.</p>
  </header>
  <main>${sections.join("")}</main>
</body>
</html>
`;
  writeFileSync(join(dir, "index.html"), html);
  console.log(`wrote ${cs.panels.length} panels (${theme}) → ${dir}/index.html`);
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const indexRows = CASE_STUDIES.map(
  (cs) => `<li><a href="${cs.id}/index.html">${escapeHtml(cs.title)}</a> — ${cs.panels.length} panels</li>`,
).join("");
writeFileSync(
  join(OUT_ROOT, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Case studies — still-manim-ts</title>
  <style>
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; background: #1a1a1a; color: #eee; }
    main { padding: 24px; max-width: 1000px; margin: 0 auto; }
    h1 { font-weight: 500; }
    a { color: #9bd; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { padding-left: 20px; }
    li { margin: 6px 0; }
    header.site-nav { position: sticky; top: 0; z-index: 10; background: #111; border-bottom: 1px solid #333; padding: 10px 24px; display: flex; gap: 12px; align-items: center; }
    header.site-nav a { color: #9bd; font-size: 14px; }
    header.site-nav .crumb { color: #666; font-size: 14px; }
    header.site-nav .here { color: #eee; font-size: 14px; }
  </style>
</head>
<body>
  <header class="site-nav">
    <a href="../index.html">Home</a>
    <span class="crumb">·</span>
    <span class="here">Case studies</span>
  </header>
  <main>
    <h1>Case studies</h1>
    <ul>${indexRows}</ul>
  </main>
</body>
</html>`,
);

for (const cs of CASE_STUDIES) renderOne(cs);
console.log(`\nindex: ${OUT_ROOT}/index.html`);
