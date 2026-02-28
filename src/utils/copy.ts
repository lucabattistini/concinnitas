import { cpSync, mkdirSync, rmSync, renameSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Atomically copy skill directories from source to target using a staging directory.
 *
 * Strategy:
 * 1. Create staging dir: targetParent/.concinnitas-staging-{random}/
 * 2. Copy each skill into staging
 * 3. Verify all SKILL.md files exist in staging
 * 4. Move each skill from staging to target (remove existing first)
 * 5. Clean up staging
 * 6. On ANY error: clean up staging, rethrow
 */
export function atomicCopySkills(
  sourceDir: string,
  targetDir: string,
  skillNames: readonly string[],
): void {
  const stagingName = `.concinnitas-staging-${randomBytes(4).toString("hex")}`;
  const stagingDir = resolve(targetDir, "..", stagingName);

  try {
    // Create staging directory
    mkdirSync(stagingDir, { recursive: true });

    // Copy each skill to staging
    for (const name of skillNames) {
      const src = join(sourceDir, name);
      const dest = join(stagingDir, name);

      if (!existsSync(src)) {
        throw new Error(`Bundled skill not found: ${src}`);
      }

      cpSync(src, dest, { recursive: true });
    }

    // Verify all SKILL.md files exist in staging
    for (const name of skillNames) {
      const skillMd = join(stagingDir, name, "SKILL.md");
      if (!existsSync(skillMd)) {
        throw new Error(`SKILL.md missing in staged skill: ${name}`);
      }
    }

    // Ensure target directory exists
    mkdirSync(targetDir, { recursive: true });

    // Move each skill from staging to target
    for (const name of skillNames) {
      const staged = join(stagingDir, name);
      const target = join(targetDir, name);

      // Remove existing skill directory if present
      if (existsSync(target)) {
        rmSync(target, { recursive: true, force: true });
      }

      renameSync(staged, target);
    }

    // Clean up empty staging directory
    cleanupStaging(stagingDir);
  } catch (err) {
    // Clean up staging on any error
    cleanupStaging(stagingDir);
    throw err;
  }
}

/**
 * Remove specific skill directories from the target.
 * Only removes the exact skill names provided — never globs.
 */
export function removeSkills(
  targetDir: string,
  skillNames: readonly string[],
): string[] {
  const removed: string[] = [];

  for (const name of skillNames) {
    const target = join(targetDir, name);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      removed.push(name);
    }
  }

  return removed;
}

function cleanupStaging(stagingDir: string): void {
  try {
    if (existsSync(stagingDir)) {
      rmSync(stagingDir, { recursive: true, force: true });
    }
  } catch {
    // Best-effort cleanup — don't mask the original error
  }
}
