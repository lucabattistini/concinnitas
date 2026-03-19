import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { homedir } from "node:os";
import { resolve, sep, isAbsolute } from "node:path";
import {
  getSkillsTargetDir,
  getConfigDir,
  getBundledSkillsDir,
  getMetaFilePath,
  getInstalledSkillName,
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
    it("returns ~/.config/opencode/skills for opencode platform", () => {
      delete process.env["XDG_CONFIG_HOME"];
      const expected = resolve(homedir(), ".config", "opencode", "skills");
      expect(getSkillsTargetDir("opencode")).toBe(expected);
    });

    it("respects XDG_CONFIG_HOME for opencode", () => {
      process.env["XDG_CONFIG_HOME"] = "/tmp/custom-config";
      expect(getSkillsTargetDir("opencode")).toBe(
        resolve("/tmp/custom-config", "opencode", "skills"),
      );
    });

    it("returns an absolute path for opencode", () => {
      expect(isAbsolute(getSkillsTargetDir("opencode"))).toBe(true);
    });

    it("throws for claude platform", () => {
      expect(() => getSkillsTargetDir("claude")).toThrow(
        "Claude Code skills are served from the npm package directly",
      );
    });
  });

  describe("getConfigDir", () => {
    it("returns ~/.config/opencode for opencode platform", () => {
      delete process.env["XDG_CONFIG_HOME"];
      const expected = resolve(homedir(), ".config", "opencode");
      expect(getConfigDir("opencode")).toBe(expected);
    });

    it("respects XDG_CONFIG_HOME for opencode", () => {
      process.env["XDG_CONFIG_HOME"] = "/tmp/custom-config";
      expect(getConfigDir("opencode")).toBe(
        resolve("/tmp/custom-config", "opencode"),
      );
    });

    it("returns ~/.claude for claude platform", () => {
      const expected = resolve(homedir(), ".claude");
      expect(getConfigDir("claude")).toBe(expected);
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
      const configDir = getConfigDir("opencode");
      const skillsDir = getSkillsTargetDir("opencode");

      // Meta file should be directly in the config dir
      expect(metaPath.startsWith(configDir)).toBe(true);
      // Meta file should NOT be inside the skills dir
      expect(metaPath.startsWith(skillsDir)).toBe(false);
    });
  });

  describe("getInstalledSkillName", () => {
    it("prefixes source name with con-", () => {
      expect(getInstalledSkillName("discover")).toBe("con-discover");
    });

    it("works for all skill names", () => {
      expect(getInstalledSkillName("track")).toBe("con-track");
      expect(getInstalledSkillName("flows")).toBe("con-flows");
      expect(getInstalledSkillName("system")).toBe("con-system");
    });
  });
});
