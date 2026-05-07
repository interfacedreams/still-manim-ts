/**
 * Registry of all case studies. Both render_outputs.ts and
 * render_case_studies.ts import from here so the list stays in sync.
 */
import { INVERSES_CASE_STUDY } from "./inverses.js";
import { RATIONAL_FUNCTIONS_CASE_STUDY } from "./rational_functions.js";
import { UNIT_CIRCLE_CASE_STUDY } from "./unit_circle.js";

export const CASE_STUDIES = [
  RATIONAL_FUNCTIONS_CASE_STUDY,
  UNIT_CIRCLE_CASE_STUDY,
  INVERSES_CASE_STUDY,
];
