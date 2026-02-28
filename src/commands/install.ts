import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getSkillsTargetDir, getBundledSkillsDir, getMetaFilePath } from "../utils/paths.js";
import { atomicCopySkills } from "../utils/copy.js";
import { verifyInstallation, checkOpenCodeExists } from "../utils/verify.js";
import { success, warn, error, info, heading } from "../utils/output.js";
import { SKILL_NAMES, PACKAGE_VERSION } from "../constants.js";

export function install(): void {
  heading("concinnitas install");

  const targetDir = getSkillsTargetDir();
  const bundledDir = getBundledSkillsDir();

  // Check if OpenCode config dir exists
  if (!checkOpenCodeExists()) {
    warn("OpenCode config directory not found. Creating it anyway.");
  }

  // Ensure target skills dir exists
  mkdirSync(targetDir, { recursive: true });

  // Atomic copy
  info("Copying skills...");
  atomicCopySkills(bundledDir, targetDir, SKILL_NAMES);

  // Verify
  const result = verifyInstallation(targetDir, SKILL_NAMES);

  // Report each skill
  for (const name of result.valid) {
    success(`${name} \u2192 ${join(targetDir, name)}`);
  }
  for (const name of result.invalid) {
    warn(`${name} \u2014 installed but SKILL.md validation failed`);
  }
  for (const name of result.missing) {
    error(`${name} \u2014 missing after install`);
  }

  // Write meta file
  const meta = {
    version: PACKAGE_VERSION,
    installedAt: new Date().toISOString(),
    skills: [...SKILL_NAMES],
  };
  writeFileSync(getMetaFilePath(), JSON.stringify(meta, null, 2) + "\n");

  // Summary
  const totalInstalled = result.valid.length + result.invalid.length;
  console.log("");

  if (result.missing.length === 0 && result.invalid.length === 0) {
    success(`${totalInstalled} skills installed. Restart OpenCode to load them.`);
  } else {
    warn(`${totalInstalled}/${SKILL_NAMES.length} skills installed. Check warnings above.`);
  }

  // Available commands
  info("");
  info("Available commands after restart:");
  info("  /design:track       Manage design tracks");
  info("  /design:discover    Phase 1: Problem understanding");
  info("  /design:flows       Phase 2: User journey mapping");
  info("  /design:structure   Phase 3: Information hierarchy");
  info("  /design:system      Phase 4: Design tokens");
  info("  /design:expression  Phase 5: Brand expression");
  info("  /design:validate    Phase 6: Validation");
  info("  /design:govern      Phase 7: Governance");
}
