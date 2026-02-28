import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string };

export const SKILL_NAMES = [
  "design-track",
  "design-discover",
  "design-flows",
  "design-structure",
  "design-system",
  "design-expression",
  "design-validate",
  "design-govern",
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

/**
 * Package version. Updated manually to match package.json.
 * Read at runtime to avoid needing to load package.json via fs.
 */
export const PACKAGE_VERSION = pkg.version;

/**
 * Shape of the .concinnitas-meta.json file.
 */
export interface MetaFile {
  version: string;
  installedAt: string;
  skills: string[];
}
