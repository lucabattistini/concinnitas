import { existsSync, rmSync } from "node:fs";
import { getSkillsTargetDir, getMetaFilePath } from "../utils/paths.js";
import { removeSkills } from "../utils/copy.js";
import { success, info, heading } from "../utils/output.js";
import { SKILL_NAMES } from "../constants.js";

export function uninstall(): void {
  heading("concinnitas uninstall");

  const targetDir = getSkillsTargetDir();

  // Remove skills
  const removed = removeSkills(targetDir, SKILL_NAMES);

  if (removed.length === 0) {
    info("No concinnitas skills found. Nothing to remove.");
    return;
  }

  // Report each removal
  for (const name of removed) {
    success(`Removed ${name}`);
  }

  // Remove meta file if it exists
  const metaPath = getMetaFilePath();
  if (existsSync(metaPath)) {
    rmSync(metaPath);
    success("Removed .concinnitas-meta.json");
  }

  // Summary
  console.log("");
  success(`${removed.length} skills removed.`);
}
