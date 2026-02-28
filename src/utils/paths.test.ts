import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { homedir } from "node:os";
import { resolve, sep, isAbsolute } from "node:path";
import {
  getSkillsTargetDir,
  getOpenCodeConfigDir,
  getBundledSkillsDir,
  getMetaFilePath,
} from "./paths.js";

describe("paths", () => {
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

  describe("getSkillsTargetDir", () => {
    it("returns ~/.config/opencode/skills by default", () => {
      delete process.env["XDG_CONFIG_HOME"];
      const expected = resolve(homedir(), ".config", "opencode", "skills");
      expect(getSkillsTargetDir()).toBe(expected);
    });

    it("respects XDG_CONFIG_HOME when set", () => {
      process.env["XDG_CONFIG_HOME"] = "/tmp/custom-config";
      expect(getSkillsTargetDir()).toBe(
        resolve("/tmp/custom-config", "opencode", "skills"),
      );
    });

    it("returns an absolute path", () => {
      expect(isAbsolute(getSkillsTargetDir())).toBe(true);
    });
  });

  describe("getOpenCodeConfigDir", () => {
    it("returns ~/.config/opencode by default", () => {
      delete process.env["XDG_CONFIG_HOME"];
      const expected = resolve(homedir(), ".config", "opencode");
      expect(getOpenCodeConfigDir()).toBe(expected);
    });

    it("respects XDG_CONFIG_HOME when set", () => {
      process.env["XDG_CONFIG_HOME"] = "/tmp/custom-config";
      expect(getOpenCodeConfigDir()).toBe(
        resolve("/tmp/custom-config", "opencode"),
      );
    });
  });

  describe("getBundledSkillsDir", () => {
    it("returns a path ending in /skills", () => {
      const result = getBundledSkillsDir();
      expect(result.endsWith(`${sep}skills`)).toBe(true);
    });

    it("returns an absolute path", () => {
      expect(isAbsolute(getBundledSkillsDir())).toBe(true);
    });
  });

  describe("getMetaFilePath", () => {
    it("returns a path ending in .concinnitas-meta.json", () => {
      const result = getMetaFilePath();
      expect(result.endsWith(".concinnitas-meta.json")).toBe(true);
    });

    it("path is inside opencode config dir, not inside skills/", () => {
      const metaPath = getMetaFilePath();
      const configDir = getOpenCodeConfigDir();
      const skillsDir = getSkillsTargetDir();

      // Meta file should be directly in the config dir
      expect(metaPath.startsWith(configDir)).toBe(true);
      // Meta file should NOT be inside the skills dir
      expect(metaPath.startsWith(skillsDir)).toBe(false);
    });
  });
});
