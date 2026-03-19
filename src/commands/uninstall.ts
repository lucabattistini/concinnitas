import { existsSync, rmSync } from "node:fs";
import { getSkillsTargetDir, getMetaFilePath, getInstalledSkillName } from "../utils/paths.js";
import { removeSkills } from "../utils/copy.js";
import { success, info, heading } from "../utils/output.js";
import { SKILL_NAMES, LEGACY_SKILL_NAMES } from "../constants.js";
import type { Platform } from "../constants.js";

export function uninstall(platform: Platform): void {
  if (platform === "claude") {
    uninstallClaude();
  } else {
    uninstallOpenCode();
  }
}

function uninstallOpenCode(): void {
  heading("concinnitas uninstall (OpenCode)");

  const targetDir = getSkillsTargetDir("opencode");

  // Remove current con-* skills
  const installedNames = SKILL_NAMES.map(getInstalledSkillName);
  const removed = removeSkills(targetDir, installedNames);

  // Also remove any legacy design-* skills
  const legacyRemoved = removeSkills(targetDir, LEGACY_SKILL_NAMES);

  const totalRemoved = removed.length + legacyRemoved.length;

  if (totalRemoved === 0) {
    info("No concinnitas skills found. Nothing to remove.");
    return;
  }

  // Report each removal
  for (const name of removed) {
    success(`Removed ${name}`);
  }
  for (const name of legacyRemoved) {
    success(`Removed ${name} (legacy)`);
  }

  // Remove meta file if it exists
  const metaPath = getMetaFilePath();
  if (existsSync(metaPath)) {
    rmSync(metaPath);
    success("Removed .concinnitas-meta.json");
  }

  // Summary
  console.log("");
  success(`${totalRemoved} skills removed.`);
}

function uninstallClaude(): void {
  heading("concinnitas uninstall (Claude Code)");

  info("To remove concinnitas from Claude Code:");
  info("");
  info("  1. Remove the plugin from ~/.claude/settings.json:");
  info('     Remove "@lucabattistini/concinnitas" from the "plugins" array');
  info("");
  info("  2. Optionally uninstall the package:");
  info("     npm uninstall -g @lucabattistini/concinnitas");
  info("");
  info("  3. Restart Claude Code.");
}
