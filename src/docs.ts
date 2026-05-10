import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Absolute path to the bundled `docs/` directory.
 *
 * Resolves to `<package>/docs/`, which contains:
 *   - `INDEX.md` — top-level index of features and examples
 *   - `features/*.md` — one doc per feature (Tex, Polygon, Angle, etc.)
 *   - `examples/*.md` — one doc per worked example
 *
 * Use it from a consuming TypeScript app to load doc text at runtime:
 *
 * ```ts
 * import { docsPath } from "still-manim-ts";
 * import { readFileSync } from "node:fs";
 * import { join } from "node:path";
 *
 * const index = readFileSync(join(docsPath, "INDEX.md"), "utf8");
 * const angle = readFileSync(join(docsPath, "features/angle.md"), "utf8");
 * ```
 *
 * Node-only — `import.meta.url` and `node:fs` are not available in the browser.
 */
export const docsPath: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "docs",
);

/**
 * Absolute path to the bundled `examples/` directory of `.ts` source files.
 *
 * Example docs (`docs/examples/<name>.md`) reference these via their `source:`
 * frontmatter field. Use both together when building a generation prompt: the
 * `.md` carries Goal + planner metadata, the `.ts` carries the actual code.
 */
export const examplesPath: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "examples",
);
