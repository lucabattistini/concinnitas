import { existsSync, readFileSync } from "node:fs";
import { getSkillsTargetDir, getMetaFilePath } from "../utils/paths.js";
import { verifyInstallation } from "../utils/verify.js";
import { info, heading, SYM_OK, SYM_FAIL } from "../utils/output.js";
import { SKILL_NAMES } from "../constants.js";
import type { MetaFile } from "../constants.js";

export function list(): void {
  const targetDir = getSkillsTargetDir();
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

  heading(`Concinnitas Skills${versionInfo}`);

  // Verify installation
  const result = verifyInstallation(targetDir, SKILL_NAMES);
  const installedSet = new Set([...result.valid, ...result.invalid]);

  // Print table
  const nameWidth = Math.max(...SKILL_NAMES.map((n) => n.length)) + 2;

  info(`${"Skill".padEnd(nameWidth)}Status`);
  info(`${"\u2500".repeat(nameWidth)}${"\u2500".repeat(16)}`);

  for (const name of SKILL_NAMES) {
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
