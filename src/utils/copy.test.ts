import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { atomicCopySkills, removeSkills } from "./copy.js";

const VALID_SKILL_MD = `---
name: test-skill
description: A test skill
---

# Test Skill

This is a test skill.
`;

function createSkillFixture(dir: string, name: string): void {
  const skillDir = join(dir, name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), VALID_SKILL_MD);
}

describe("copy", () => {
  let tempDir: string;
  let sourceDir: string;
  let targetDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "concinnitas-test-"));
    sourceDir = join(tempDir, "source");
    targetDir = join(tempDir, "target", "skills");
    mkdirSync(sourceDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("atomicCopySkills", () => {
    it("copies all skills from source to target", () => {
      const skills = ["skill-a", "skill-b"];
      for (const name of skills) {
        createSkillFixture(sourceDir, name);
      }

      atomicCopySkills(sourceDir, targetDir, skills);

      for (const name of skills) {
        expect(existsSync(join(targetDir, name, "SKILL.md"))).toBe(true);
      }
    });

    it("preserves SKILL.md content after copy", () => {
      createSkillFixture(sourceDir, "skill-a");

      atomicCopySkills(sourceDir, targetDir, ["skill-a"]);

      const content = readFileSync(
        join(targetDir, "skill-a", "SKILL.md"),
        "utf-8",
      );
      expect(content).toBe(VALID_SKILL_MD);
    });

    it("overwrites existing skills (idempotent)", () => {
      createSkillFixture(sourceDir, "skill-a");

      // First install
      atomicCopySkills(sourceDir, targetDir, ["skill-a"]);

      // Modify the installed file
      writeFileSync(join(targetDir, "skill-a", "SKILL.md"), "modified");

      // Second install should overwrite
      atomicCopySkills(sourceDir, targetDir, ["skill-a"]);

      const content = readFileSync(
        join(targetDir, "skill-a", "SKILL.md"),
        "utf-8",
      );
      expect(content).toBe(VALID_SKILL_MD);
    });

    it("creates target directory if it doesn't exist", () => {
      createSkillFixture(sourceDir, "skill-a");

      expect(existsSync(targetDir)).toBe(false);
      atomicCopySkills(sourceDir, targetDir, ["skill-a"]);
      expect(existsSync(targetDir)).toBe(true);
    });

    it("throws if a source skill is missing", () => {
      expect(() => {
        atomicCopySkills(sourceDir, targetDir, ["nonexistent"]);
      }).toThrow("Bundled skill not found");
    });

    it("cleans up staging dir on success", () => {
      createSkillFixture(sourceDir, "skill-a");

      atomicCopySkills(sourceDir, targetDir, ["skill-a"]);

      // Check parent of targetDir for staging remnants
      const parentDir = join(targetDir, "..");
      const entries = readdirSync(parentDir);
      const stagingDirs = entries.filter((e) =>
        e.startsWith(".concinnitas-staging-"),
      );
      expect(stagingDirs).toHaveLength(0);
    });

    it("cleans up staging dir on failure", () => {
      // Create one valid skill but request two (second missing)
      createSkillFixture(sourceDir, "skill-a");

      expect(() => {
        atomicCopySkills(sourceDir, targetDir, ["skill-a", "nonexistent"]);
      }).toThrow();

      // Ensure parent exists to check
      mkdirSync(join(targetDir, ".."), { recursive: true });
      const parentDir = join(targetDir, "..");
      const entries = readdirSync(parentDir);
      const stagingDirs = entries.filter((e) =>
        e.startsWith(".concinnitas-staging-"),
      );
      expect(stagingDirs).toHaveLength(0);
    });

    it("throws if SKILL.md is missing in source skill dir", () => {
      // Create directory without SKILL.md
      mkdirSync(join(sourceDir, "skill-a"), { recursive: true });
      writeFileSync(join(sourceDir, "skill-a", "other.md"), "not a skill");

      expect(() => {
        atomicCopySkills(sourceDir, targetDir, ["skill-a"]);
      }).toThrow("SKILL.md missing in staged skill");
    });
  });

  describe("removeSkills", () => {
    it("removes existing skill directories", () => {
      createSkillFixture(targetDir, "skill-a");
      createSkillFixture(targetDir, "skill-b");

      removeSkills(targetDir, ["skill-a", "skill-b"]);

      expect(existsSync(join(targetDir, "skill-a"))).toBe(false);
      expect(existsSync(join(targetDir, "skill-b"))).toBe(false);
    });

    it("returns list of removed skill names", () => {
      createSkillFixture(targetDir, "skill-a");
      createSkillFixture(targetDir, "skill-b");

      const removed = removeSkills(targetDir, ["skill-a", "skill-b"]);

      expect(removed).toEqual(["skill-a", "skill-b"]);
    });

    it("returns empty list if no skills exist", () => {
      mkdirSync(targetDir, { recursive: true });

      const removed = removeSkills(targetDir, ["skill-a", "skill-b"]);

      expect(removed).toEqual([]);
    });

    it("ignores skills that don't exist (no error)", () => {
      createSkillFixture(targetDir, "skill-a");

      const removed = removeSkills(targetDir, ["skill-a", "nonexistent"]);

      expect(removed).toEqual(["skill-a"]);
    });
  });
});
