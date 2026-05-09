# still-manim-ts docs

Markdown reference written for **agents that generate diagrams**, not for a website.
Two folders, plus an index.

```
docs/
  INDEX.md           — table of contents (one line per entry, planner reads this first)
  features/          — one markdown per class / module (Axes, NumberLine, Tex, Table, …)
  examples/          — canonical algebra / geometry diagrams
                       each .md points at a real .ts file under ../examples/
```

## Format contract

Every doc has YAML frontmatter so a planner can decide what to load without reading the body:

```yaml
---
name: Axes               # class or example name
category: graphing       # one of: graphing | geometry | text | tables | annotations | composites | examples
summary: 2D axes that plot y=f(x); pair with NumberPlane for a gridded version.
tags: [graphing, axes, plot, function]
related: [NumberLine, NumberPlane, ParametricFunction]
---
```

### Feature docs (`features/<name>.md`)

Sections, in order:

1. **Description** — 1–2 sentences, what it is.
2. **When to use** — explicit cases ("use this for …, not raw `Polygon`"). The most important section for the agent.
3. **Constructor parameters** — typed bullet list. Mark defaults.
4. **Methods** — only the ones an example would actually call.
5. **Minimal example** — smallest snippet that compiles and renders.
6. **Common pitfalls** *(optional)* — bullet list.

No `<img>` tags. No marketing prose. Skip sections that have nothing to say.

### Example docs (`examples/<name>.md`)

Frontmatter must include a `source:` field — relative path to the `.ts` file. The harness loads the `.md` (for the Goal + planner metadata) and the `.ts` (for the actual code) together.

Sections, in order:

1. **Goal** — the math idea the diagram conveys (e.g. "show slope as rise/run on a line"). One short paragraph.
2. **Features used** — bulleted list of feature doc names; the planner loads these as context.

That's it. **No walkthrough, no inline source.** If a step needs explaining, write the explanation as a comment in the `.ts` file — that's where the reader will be looking when the question comes up. Keep `.ts` comments sparse: file header, and short notes for non-obvious choices only.

## How the harness consumes this

1. Agent gets a request ("draw a quadratic with vertex marked").
2. **Planner pass**: reads `INDEX.md` + frontmatter. Picks 2–4 features and 1–2 examples to load.
3. **Generation pass**: receives the picked feature docs + example `.ts` files + the user's request. Outputs new `.ts` code.

The format is optimized for that two-pass flow. Anything that doesn't help the planner pick or doesn't help the generator write code is noise — leave it out.
