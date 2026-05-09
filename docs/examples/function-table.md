---
name: function-table
category: examples
summary: Two-row function table for y = x², with the (0, 0) column highlighted to mark the vertex.
source: ../../examples/function_table.ts
tags: [algebra-1, function-table, parabola, table, x-y-table, vertex]
features_used: [Table, Tex]
---

# function-table

## Goal

Walk through `y = x²` as a discrete x → y mapping. The header cells use Tex so `y = x²` renders as proper math (with the exponent), and the data rows show the symmetry around `x = 0`: equal-magnitude inputs produce the same output. The highlight on the (0, 0) column draws attention to the minimum — a typical pre-stop on the way to graphing the parabola.

This is the picture students see in CPM and Big Ideas right before plotting the parabola.

## Features used

- [Table](../features/table.md) — two-row layout; cells auto-size to content; `highlight([[0, 3], [1, 3]])` colors the (x, y) = (0, 0) column.
- [Tex](../features/tex.md) — `x` and `y = x^2` as the row headers; integers in the data cells use the auto `Text` rendering.
