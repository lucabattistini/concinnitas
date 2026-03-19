import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Platform } from "../constants.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the skills target directory for the given platform.
 * Only OpenCode uses a target directory — Claude Code serves skills
 * directly from the npm package via plugin.json.
 */
export function getSkillsTargetDir(platform: Platform): string {
  if (platform === "opencode") {
    const configHome = process.env["XDG_CONFIG_HOME"] || resolve(homedir(), ".config");
    return resolve(configHome, "opencode", "skills");
  }
  throw new Error("Claude Code skills are served from the npm package directly");
}

/**
 * Resolve the platform config directory.
 * OpenCode: ~/.config/opencode/
 * Claude Code: ~/.claude/
 */
export function getConfigDir(platform: Platform): string {
  if (platform === "opencode") {
    const configHome = process.env["XDG_CONFIG_HOME"] || resolve(homedir(), ".config");
    return resolve(configHome, "opencode");
  }
  return resolve(homedir(), ".claude");
}

/**
 * Resolve the bundled skills directory shipped with this package.
 * In compiled form: dist/utils/paths.js → ../../skills/
 */
export function getBundledSkillsDir(): string {
  return resolve(__dirname, "..", "..", "skills");
}

/**
 * Path to .concinnitas-meta.json for OpenCode — stored in the OpenCode config dir,
 * not inside skills/, to avoid OpenCode trying to load it as a skill.
 */
export function getMetaFilePath(): string {
  return resolve(getConfigDir("opencode"), ".concinnitas-meta.json");
}

/**
 * Get the installed skill directory name for OpenCode from a source skill name.
 * Source "discover" → installed "con-discover".
 */
export function getInstalledSkillName(sourceName: string): string {
  return `con-${sourceName}`;
}
