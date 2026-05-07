# Styles

Light-mode case studies (`theme: "light"`, palette in `src/utils/color.ts`):

- **Colors**: `BLUE_E` (`#1F77B4`, vibrant darker chart blue) primary → `RED` secondary → `GREEN_D` tertiary. Pick the lowest-rank color that fits; reach for `ORANGE`/`YELLOW`/`PURPLE`/`PINK` only when a single panel needs 4+ distinct items.
- **Labels**: written text/Tex defaults to BLACK (`CONFIG.defaultTextColor`); colored only when matched to a colored object. Backing rect is a rounded white box at 65% opacity (`CONFIG.defaultLabelBgOpacity`) so curves/grid peek through.
- **Dark mode** is unchanged — keeps manim's `BLUE`/`RED`/`GREEN`/`YELLOW` palette and 0.2-opacity black label backings.
- **Indices**: `Table.highlight([[row, col]])` is 0-indexed *including the header row* — when matching a logical pair (e.g. `(1,2) ↔ (2,1)`), pick the data row by its swapped key, not by "the row containing that number," and add 1 for the header. Verify against the rendered SVG, not by counting in your head.
