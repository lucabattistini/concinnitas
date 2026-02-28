import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the OpenCode skills target directory.
 * Respects $XDG_CONFIG_HOME on Linux, falls back to ~/.config.
 */
export function getSkillsTargetDir(): string {
  const configHome = process.env["XDG_CONFIG_HOME"] || resolve(homedir(), ".config");
  return resolve(configHome, "opencode", "skills");
}

/**
 * Resolve the OpenCode config directory (parent of skills/).
 */
export function getOpenCodeConfigDir(): string {
  const configHome = process.env["XDG_CONFIG_HOME"] || resolve(homedir(), ".config");
  return resolve(configHome, "opencode");
}

/**
 * Resolve the bundled skills directory shipped with this package.
 * In compiled form: dist/utils/paths.js → ../../skills/
 */
export function getBundledSkillsDir(): string {
  return resolve(__dirname, "..", "..", "skills");
}

/**
 * Path to .concinnitas-meta.json — stored in the OpenCode config dir,
 * not inside skills/, to avoid OpenCode trying to load it as a skill.
 */
export function getMetaFilePath(): string {
  return resolve(getOpenCodeConfigDir(), ".concinnitas-meta.json");
}
