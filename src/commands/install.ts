import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getSkillsTargetDir, getBundledSkillsDir, getMetaFilePath, getInstalledSkillName } from "../utils/paths.js";
import { atomicCopySkills, removeSkills } from "../utils/copy.js";
import type { SkillNameMapping } from "../utils/copy.js";
import { verifyInstallation, checkPlatformExists } from "../utils/verify.js";
import { transformSkillForOpenCode } from "../utils/transform.js";
import { success, warn, error, info, heading } from "../utils/output.js";
import { SKILL_NAMES, LEGACY_SKILL_NAMES, PACKAGE_VERSION } from "../constants.js";
import type { Platform } from "../constants.js";

export function install(platform: Platform): void {
  if (platform === "claude") {
    installClaude();
  } else {
    installOpenCode();
  }
}

function installOpenCode(): void {
  heading("concinnitas install (OpenCode)");

  const targetDir = getSkillsTargetDir("opencode");
  const bundledDir = getBundledSkillsDir();

  // Check if OpenCode config dir exists
  if (!checkPlatformExists("opencode")) {
    warn("OpenCode config directory not found. Creating it anyway.");
  }

  // Ensure target skills dir exists
  mkdirSync(targetDir, { recursive: true });

  // Build name mappings: source "discover" → target "con-discover"
  const mappings: SkillNameMapping[] = SKILL_NAMES.map((name) => ({
    source: name,
    target: getInstalledSkillName(name),
  }));

  // Atomic copy with frontmatter transformation
  info("Copying skills...");
  atomicCopySkills(bundledDir, targetDir, mappings, transformSkillForOpenCode);

  // Verify using installed (target) names
  const installedNames = SKILL_NAMES.map(getInstalledSkillName);
  const result = verifyInstallation(targetDir, installedNames);

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
    platform: "opencode" as const,
    skills: [...installedNames],
  };
  writeFileSync(getMetaFilePath(), JSON.stringify(meta, null, 2) + "\n");

  // Legacy cleanup: remove old design-* directories if they exist
  const legacyRemoved = removeSkills(targetDir, LEGACY_SKILL_NAMES);
  if (legacyRemoved.length > 0) {
    info("");
    info("Cleaned up legacy skills:");
    for (const name of legacyRemoved) {
      success(`Removed ${name}`);
    }
  }

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
  info("  /con:track       Manage design tracks");
  info("  /con:discover    Phase 1: Problem understanding");
  info("  /con:flows       Phase 2: User journey mapping");
  info("  /con:structure   Phase 3: Information hierarchy");
  info("  /con:system      Phase 4: Design tokens");
  info("  /con:expression  Phase 5: Brand expression");
  info("  /con:validate    Phase 6: Validation");
  info("  /con:govern      Phase 7: Governance");
}

function installClaude(): void {
  heading("concinnitas install (Claude Code)");

  // Check if Claude Code config dir exists
  if (!checkPlatformExists("claude")) {
    warn("~/.claude/ directory not found. Install Claude Code first.");
    info("");
    info("  https://claude.ai/code");
    return;
  }

  success("Claude Code detected.");
  info("");
  info("To use concinnitas with Claude Code:");
  info("");
  info("  1. Install the package globally:");
  info("     npm install -g @lucabattistini/concinnitas");
  info("");
  info("  2. Add the plugin to your Claude Code settings (~/.claude/settings.json):");
  info('     { "plugins": ["@lucabattistini/concinnitas"] }');
  info("");
  info("  3. Restart Claude Code. You can now use:");
  info("     /con:discover  /con:flows  /con:structure  /con:system");
  info("     /con:expression  /con:validate  /con:govern  /con:track");
}
