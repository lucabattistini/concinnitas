import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { verifyInstallation, checkOpenCodeExists } from "./verify.js";

const VALID_SKILL_MD = `---
name: test-skill
description: A test skill
---

# Test Skill
`;

const INVALID_NO_FRONTMATTER = `# Test Skill

No YAML frontmatter here.
`;

const INVALID_NO_NAME = `---
description: A test skill without a name field
---

# Test Skill
`;

function createSkillMd(dir: string, name: string, content: string): void {
  const skillDir = join(dir, name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), content);
}

describe("verify", () => {
  let tempDir: string;
  let targetDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "concinnitas-verify-test-"));
    targetDir = join(tempDir, "skills");
    mkdirSync(targetDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("verifyInstallation", () => {
    it("classifies skill with valid frontmatter as valid", () => {
      createSkillMd(targetDir, "skill-a", VALID_SKILL_MD);

      const result = verifyInstallation(targetDir, ["skill-a"]);

      expect(result.valid).toEqual(["skill-a"]);
      expect(result.invalid).toEqual([]);
      expect(result.missing).toEqual([]);
    });

    it("classifies skill without --- as invalid", () => {
      createSkillMd(targetDir, "skill-a", INVALID_NO_FRONTMATTER);

      const result = verifyInstallation(targetDir, ["skill-a"]);

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual(["skill-a"]);
      expect(result.missing).toEqual([]);
    });

    it("classifies skill without name: as invalid", () => {
      createSkillMd(targetDir, "skill-a", INVALID_NO_NAME);

      const result = verifyInstallation(targetDir, ["skill-a"]);

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual(["skill-a"]);
      expect(result.missing).toEqual([]);
    });

    it("classifies missing skill directory as missing", () => {
      const result = verifyInstallation(targetDir, ["nonexistent"]);

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
      expect(result.missing).toEqual(["nonexistent"]);
    });

    it("classifies empty SKILL.md as invalid", () => {
      createSkillMd(targetDir, "skill-a", "");

      const result = verifyInstallation(targetDir, ["skill-a"]);

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual(["skill-a"]);
      expect(result.missing).toEqual([]);
    });

    it("handles mix of valid, invalid, and missing skills", () => {
      createSkillMd(targetDir, "good", VALID_SKILL_MD);
      createSkillMd(targetDir, "bad", INVALID_NO_FRONTMATTER);
      // "gone" is not created — it's missing

      const result = verifyInstallation(targetDir, ["good", "bad", "gone"]);

      expect(result.valid).toEqual(["good"]);
      expect(result.invalid).toEqual(["bad"]);
      expect(result.missing).toEqual(["gone"]);
    });

    it("returns empty arrays when no skills checked", () => {
      const result = verifyInstallation(targetDir, []);

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
      expect(result.missing).toEqual([]);
    });
  });

  describe("checkOpenCodeExists", () => {
    let originalXdg: string | undefined;

    beforeEach(() => {
      originalXdg = process.env["XDG_CONFIG_HOME"];
    });

    afterEach(() => {
      if (originalXdg === undefined) {
        delete process.env["XDG_CONFIG_HOME"];
      } else {
        process.env["XDG_CONFIG_HOME"] = originalXdg;
      }
    });

    it("returns true when opencode config dir exists", () => {
      const configHome = join(tempDir, "config");
      mkdirSync(join(configHome, "opencode"), { recursive: true });
      process.env["XDG_CONFIG_HOME"] = configHome;

      expect(checkOpenCodeExists()).toBe(true);
    });

    it("returns false when opencode config dir does not exist", () => {
      process.env["XDG_CONFIG_HOME"] = join(tempDir, "nonexistent-config");

      expect(checkOpenCodeExists()).toBe(false);
    });
  });
});
