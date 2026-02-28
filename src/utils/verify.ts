import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getOpenCodeConfigDir } from "./paths.js";

export interface VerifyResult {
  valid: string[];
  invalid: string[];
  missing: string[];
}

/**
 * Verify that skills are properly installed.
 * For each skill name, checks:
 * 1. The directory exists
 * 2. SKILL.md exists inside it
 * 3. SKILL.md starts with '---' and contains 'name:'
 */
export function verifyInstallation(
  targetDir: string,
  skillNames: readonly string[],
): VerifyResult {
  const valid: string[] = [];
  const invalid: string[] = [];
  const missing: string[] = [];

  for (const name of skillNames) {
    const skillMdPath = join(targetDir, name, "SKILL.md");

    if (!existsSync(skillMdPath)) {
      missing.push(name);
      continue;
    }

    try {
      const content = readFileSync(skillMdPath, "utf-8");
      const lines = content.split("\n").slice(0, 10);
      const header = lines.join("\n");

      if (header.startsWith("---") && header.includes("name:")) {
        valid.push(name);
      } else {
        invalid.push(name);
      }
    } catch {
      invalid.push(name);
    }
  }

  return { valid, invalid, missing };
}

/**
 * Check if the OpenCode config directory exists.
 */
export function checkOpenCodeExists(): boolean {
  return existsSync(getOpenCodeConfigDir());
}
