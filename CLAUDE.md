# still-manim-ts — agent loop

TypeScript port of /Users/tommyjoseph/tommy11jo/still-manim/smanim/. Use Python as ground truth for geometry; diverge for cosmetic/UX bugs (always document).

## Inner loop after a code change
1. `npx tsc --noEmit` — typecheck.
2. `npm test` — runs Vitest against `still-manim/fixtures/*.json`. Failures here mean numeric drift from Python.
3. `npm run outputs` — re-renders **every** scene in `tests/conformance/scenes.ts` to `outputs/{python,typescript}/<NN>_<name>.svg` and rebuilds `outputs/index.html` (newest scenes first).
4. Open `outputs/index.html` in a browser to eyeball Python vs TS side-by-side. Scenes with no Python equivalent (TS-only composites: ArrayRow, Cross, Highlight, Tex, etc.) show a placeholder on the Python side.

## Adding a new scene
1. Add a TS builder to `SCENES` in `tests/conformance/scenes.ts`. Builder returns `Mobject[]`.
2. (Optional, if you want Python comparison) Add a matching Python builder under the same key in `still-manim/scripts/dump_fixtures.py` — `SCENES` for numeric conformance, `VISUAL_SCENES` for SVG-only — then `cd ../still-manim && source .venv/bin/activate && python scripts/dump_fixtures.py`.
3. `npm run outputs` and refresh the index page.

## Misc
- Scene order in `index.html` = reverse of insertion order in `SCENES` (newest first). Names get a numeric prefix like `01_…` automatically.
- Conformance fixtures with `visual_only: true` are skipped by `npm test` but still rendered to outputs.
- Font files for Text live at the path in `Config.fontDir` (default points at still-manim's bundled fonts). Tex uses MathJax with `fontCache: 'local'` so the SVG is self-contained.
