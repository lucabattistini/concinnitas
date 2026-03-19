import { cpSync, mkdirSync, rmSync, renameSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { randomBytes } from "node:crypto";

export interface SkillNameMapping {
  source: string;
  target: string;
}

/**
 * Atomically copy skill directories from source to target using a staging directory.
 * Supports renaming directories and transforming SKILL.md content during copy.
 *
 * Strategy:
 * 1. Create staging dir: targetParent/.concinnitas-staging-{random}/
 * 2. Copy each skill into staging (with optional rename)
 * 3. Verify all SKILL.md files exist in staging
 * 4. Optionally transform SKILL.md content
 * 5. Move each skill from staging to target (remove existing first)
 * 6. Clean up staging
 * 7. On ANY error: clean up staging, rethrow
 */
export function atomicCopySkills(
  sourceDir: string,
  targetDir: string,
  skillNames: readonly string[] | readonly SkillNameMapping[],
  transform?: (content: string, sourceName: string) => string,
): void {
  const mappings = normalizeMappings(skillNames);
  const stagingName = `.concinnitas-staging-${randomBytes(4).toString("hex")}`;
  const stagingDir = resolve(targetDir, "..", stagingName);

  try {
    // Create staging directory
    mkdirSync(stagingDir, { recursive: true });

    // Copy each skill to staging (using target name for the staged directory)
    for (const { source, target } of mappings) {
      const src = join(sourceDir, source);
      const dest = join(stagingDir, target);

      if (!existsSync(src)) {
        throw new Error(`Bundled skill not found: ${src}`);
      }

      cpSync(src, dest, { recursive: true });
    }

    // Verify all SKILL.md files exist in staging
    for (const { target } of mappings) {
      const skillMd = join(stagingDir, target, "SKILL.md");
      if (!existsSync(skillMd)) {
        throw new Error(`SKILL.md missing in staged skill: ${target}`);
      }
    }

    // Apply transform if provided
    if (transform) {
      for (const { source, target } of mappings) {
        const skillMdPath = join(stagingDir, target, "SKILL.md");
        const content = readFileSync(skillMdPath, "utf-8");
        const transformed = transform(content, source);
        writeFileSync(skillMdPath, transformed);
      }
    }

    // Ensure target directory exists
    mkdirSync(targetDir, { recursive: true });

    // Move each skill from staging to target
    for (const { target } of mappings) {
      const staged = join(stagingDir, target);
      const dest = join(targetDir, target);

      // Remove existing skill directory if present
      if (existsSync(dest)) {
        rmSync(dest, { recursive: true, force: true });
      }

      renameSync(staged, dest);
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

function normalizeMappings(
  skillNames: readonly string[] | readonly SkillNameMapping[],
): SkillNameMapping[] {
  if (skillNames.length === 0) return [];
  if (typeof skillNames[0] === "string") {
    return (skillNames as readonly string[]).map((name) => ({
      source: name,
      target: name,
    }));
  }
  return [...(skillNames as readonly SkillNameMapping[])];
}
