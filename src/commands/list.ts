import { existsSync, readFileSync } from "node:fs";
import { getSkillsTargetDir, getMetaFilePath, getInstalledSkillName } from "../utils/paths.js";
import { verifyInstallation } from "../utils/verify.js";
import { info, heading, SYM_OK, SYM_FAIL } from "../utils/output.js";
import { SKILL_NAMES, PACKAGE_VERSION } from "../constants.js";
import type { Platform, MetaFile } from "../constants.js";

export function list(platform: Platform): void {
  if (platform === "claude") {
    listClaude();
  } else {
    listOpenCode();
  }
}

function listOpenCode(): void {
  const targetDir = getSkillsTargetDir("opencode");
  const metaPath = getMetaFilePath();

  // Read meta info
  let versionInfo = "";
  if (existsSync(metaPath)) {
    try {
      const raw = readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(raw) as MetaFile;
      const date = meta.installedAt.split("T")[0];
      versionInfo = ` (v${meta.version}, installed ${date})`;
    } catch {
      // Ignore parse errors
    }
  }

  heading(`Concinnitas Skills — OpenCode${versionInfo}`);

  // Verify installation using installed names (con-*)
  const installedNames = SKILL_NAMES.map(getInstalledSkillName);
  const result = verifyInstallation(targetDir, installedNames);
  const installedSet = new Set([...result.valid, ...result.invalid]);

  // Print table
  const nameWidth = Math.max(...installedNames.map((n) => n.length)) + 2;

  info(`${"Skill".padEnd(nameWidth)}Status`);
  info(`${"\u2500".repeat(nameWidth)}${"\u2500".repeat(16)}`);

  for (const name of installedNames) {
    const status = installedSet.has(name)
      ? `${SYM_OK} installed`
      : `${SYM_FAIL} missing`;
    info(`${name.padEnd(nameWidth)}${status}`);
  }

  // Summary
  const installed = installedSet.size;
  console.log("");
  info(`${installed}/${SKILL_NAMES.length} skills installed.`);
}

function listClaude(): void {
  heading("Concinnitas Skills — Claude Code");

  info(`Package version: v${PACKAGE_VERSION}`);
  info("");
  info("Claude Code skills are served directly from the npm package.");
  info("If the plugin is registered, these commands are available:");
  info("");

  for (const name of SKILL_NAMES) {
    info(`  /con:${name}`);
  }
}
