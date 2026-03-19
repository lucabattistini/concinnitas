---
title: "feat: Dual-platform support (OpenCode + Claude Code) with /con:* rename"
type: feat
status: completed
date: 2026-03-19
origin: docs/brainstorms/2026-03-19-claude-code-plugin-and-rename-requirements.md
---

# Dual-Platform Support & Command Rename

## Overview

Extend concinnitas to work as both an OpenCode skill installer (existing) and a Claude Code plugin (new), while renaming all commands from `/design:*` to `/con:*`. The npm package becomes a dual-purpose artifact: a CLI for OpenCode installation and a Claude Code plugin for direct use.

## Problem Statement / Motivation

Concinnitas only targets OpenCode. Claude Code users — a growing audience — cannot use the design skills. The `/design:*` namespace is long and generic. Rebranding to `/con:*` (short, memorable, branded) and supporting both platforms increases reach and usability. (see origin: `docs/brainstorms/2026-03-19-claude-code-plugin-and-rename-requirements.md`)

## Proposed Solution

**Architecture: dual-delivery from single source**

Source skills use short names (`discover`, `flows`, `structure`, etc.) with no platform prefix. Each platform applies the `/con:*` namespace differently:

- **OpenCode**: CLI `install --platform opencode` copies skills to `~/.config/opencode/skills/`, prefixing directories with `con-` (e.g., `con-discover/SKILL.md`). OpenCode maps `con-discover` → `/con:discover`.
- **Claude Code**: The npm package ships a `plugin.json` with `"name": "con"`. Claude Code discovers skills inside the package's `skills/` directory and auto-namespaces them as `/con:discover`, `/con:flows`, etc. No file copying needed — the package IS the plugin.

This means:
- Source SKILL.md files use `name: discover` (short name). Cross-references say `/con:*` (platform-agnostic).
- OpenCode install rewrites `name:` field to `con-discover` and renames the directory during copy.
- Claude Code uses the source files directly — plugin name `con` + skill name `discover` = `/con:discover`.

## Technical Considerations

### Architecture

**Source skill format** (platform-agnostic):
```
skills/
  discover/SKILL.md      # name: discover, refs say /con:*
  flows/SKILL.md
  structure/SKILL.md
  system/SKILL.md
  expression/SKILL.md
  validate/SKILL.md
  govern/SKILL.md
  track/SKILL.md
plugin.json              # { "name": "con" }
```

**OpenCode installed format** (after CLI copy + transform):
```
~/.config/opencode/skills/
  con-discover/SKILL.md  # name: con-discover
  con-flows/SKILL.md
  ...
```

**Claude Code** uses the npm package directly as a plugin. No transformation needed.

### Key technical decisions

1. **`name:` field transformation**: The OpenCode install step must rewrite the SKILL.md frontmatter `name:` field from `discover` to `con-discover` during copy. This is more than a simple `cpSync` — it requires reading, transforming, and writing each SKILL.md. The `description:` field does NOT need transformation — after Phase 1, source descriptions already reference `/con:*` commands, which is correct for both platforms. (see origin: R6)

2. **`plugin.json` coexistence**: The npm package ships both `plugin.json` (for Claude Code) and `dist/cli.js` (for OpenCode CLI). These don't conflict — Claude Code looks for `plugin.json` only in explicitly registered plugins, not in all installed packages.

3. **Meta files per platform**: Separate meta files in each platform's config directory:
   - OpenCode: `~/.config/opencode/.concinnitas-meta.json` (existing location)
   - Claude Code: no meta file needed — plugin version IS the npm package version. The `update` and `list` commands for Claude Code check the installed package version directly.

4. **`--platform` flag scope**: Required on `install` and `uninstall`. For `update` and `list`, also required. No auto-detection. When omitted, CLI prints an error listing valid options. (see origin: R3, R5)

5. **Argument parsing**: Replace manual `process.argv` parsing with `node:util` `parseArgs` (available since Node 18.3, within the existing `>=18.0.0` engine requirement). This gives proper flag handling with validation.

6. **Legacy cleanup order** (R7): Install new `con-*` skills first (atomically), THEN remove legacy `design-*` directories. Never delete before confirming the new install succeeded. Legacy names are an explicit constant list — no glob matching. (see origin: R7)

7. **Claude Code install flow**: `install --platform claude` does NOT modify `~/.claude/settings.json`. It prints clear instructions for the user to add the plugin to their Claude Code settings. Modifying another tool's config is too risky. (see origin: R4)

### Performance implications

None — the transformation adds negligible overhead (8 files, simple string replacement in frontmatter).

### Security considerations

- CLI never modifies `~/.claude/settings.json` directly
- Legacy cleanup only removes the exact 8 known directory names, never globs
- No new network calls beyond the existing npm registry check in `update`

## System-Wide Impact

- **Interaction graph**: `install` command gains a platform dispatch layer. All path resolution flows through a platform-aware `getTargetDir(platform)` instead of hardcoded `getSkillsTargetDir()`.
- **Error propagation**: New error case when `--platform` is missing. New error when `~/.claude/` doesn't exist for Claude Code instructions.
- **State lifecycle risks**: Legacy cleanup after new install is safe — if new install fails (atomic staging catches this), legacy skills remain untouched.
- **API surface parity**: Both platforms get identical skill content. The only difference is delivery mechanism.

## Acceptance Criteria

### Functional Requirements

- [ ] `npx @lucabattistini/concinnitas install --platform opencode` installs `con-*` skills to OpenCode config dir
- [ ] `npx @lucabattistini/concinnitas install --platform claude` prints instructions for adding the plugin to Claude Code
- [ ] Running install without `--platform` prints a clear error with valid options
- [ ] `uninstall --platform opencode` removes `con-*` skills and meta file
- [ ] `uninstall --platform claude` prints instructions for removing the plugin
- [ ] `update --platform opencode` checks registry and suggests re-install
- [ ] `update --platform claude` checks registry and suggests `npm update`
- [ ] `list --platform opencode` shows installed skills and version
- [ ] `list --platform claude` shows installed package version and plugin status
- [ ] Upgrading from v1.x removes legacy `design-*` directories after installing `con-*` (OpenCode only)
- [ ] All SKILL.md cross-references say `/con:*` (not `/design:*`)
- [ ] Source skill `name:` fields use short names (`discover`, not `con-discover`)
- [ ] OpenCode installed skills have `name: con-discover` (transformed during copy)
- [ ] `plugin.json` exists at package root with `"name": "con"`
- [ ] Package ships `skills/`, `dist/`, and `plugin.json`

### Non-Functional Requirements

- [ ] No new runtime dependencies
- [ ] Node >= 18.0.0 (unchanged)
- [ ] All existing tests pass after rename (updated fixtures)

### Quality Gates

- [ ] Tests cover: platform flag parsing, frontmatter transformation, legacy cleanup, directory rename during copy
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run test` passes

## Success Metrics

- Claude Code user can `/con:discover` after adding the plugin (see origin: success criteria)
- OpenCode user can `/con:discover` after CLI install
- Upgrading user has no leftover `design-*` commands

## Dependencies & Prerequisites

- Claude Code plugin format uses `plugin.json` with a `name` field that becomes the command namespace prefix (researched and confirmed)
- Claude Code SKILL.md format is identical to OpenCode's (same frontmatter fields: `name`, `description`, `disable-model-invocation`, `argument-hint`)
- OpenCode maps hyphenated skill directory names to colon-separated slash commands (observed: `design-discover` → `/design:discover`, therefore `con-discover` → `/con:discover`). If this mapping is not reliable, OpenCode skills would need a different naming strategy.
- `node:util` `parseArgs` is available in Node 18+ (confirmed)

## Implementation Phases

### Phase 1: Rename Source Skills

**Files changed:** `skills/design-*/` (all 8 directories), `src/constants.ts`

1. Rename source directories:
   - `skills/design-discover/` → `skills/discover/`
   - `skills/design-flows/` → `skills/flows/`
   - `skills/design-structure/` → `skills/structure/`
   - `skills/design-system/` → `skills/system/`
   - `skills/design-expression/` → `skills/expression/`
   - `skills/design-validate/` → `skills/validate/`
   - `skills/design-govern/` → `skills/govern/`
   - `skills/design-track/` → `skills/track/`

2. Update every SKILL.md:
   - `name:` field: `design-discover` → `discover` (etc.)
   - `description:` field: `/design:discover` → `/con:discover` (etc.)
   - All body cross-references: `/design:*` → `/con:*` (~30 occurrences across 8 files)

3. Update `src/constants.ts`:
   ```typescript
   export const SKILL_NAMES = [
     "track",
     "discover",
     "flows",
     "structure",
     "system",
     "expression",
     "validate",
     "govern",
   ] as const;

   // Legacy names for upgrade cleanup (R7)
   export const LEGACY_SKILL_NAMES = [
     "design-track",
     "design-discover",
     "design-flows",
     "design-structure",
     "design-system",
     "design-expression",
     "design-validate",
     "design-govern",
   ] as const;

   export type Platform = "opencode" | "claude";
   ```

### Phase 2: Add Claude Code Plugin Manifest

**Files changed:** `plugin.json` (new), `package.json`

1. Create `plugin.json` at package root:
   ```json
   {
     "name": "con",
     "description": "AI-guided 7-phase design process — from discovery to governance",
     "skills": "skills"
   }
   ```

2. Update `package.json`:
   - Add `"plugin.json"` to `files` array
   - Update `description` to be platform-neutral: "AI-guided 7-phase design process for OpenCode and Claude Code"

### Phase 3: Platform-Aware Path Resolution

**Files changed:** `src/utils/paths.ts`, `src/utils/verify.ts`

1. Update `paths.ts` — add platform parameter to path functions:
   ```typescript
   export function getSkillsTargetDir(platform: Platform): string {
     if (platform === "opencode") {
       // existing: ~/.config/opencode/skills/
     }
     // Claude Code doesn't need a target dir (plugin is used directly)
     throw new Error("Claude Code skills are served from the npm package directly");
   }

   export function getConfigDir(platform: Platform): string { ... }
   export function getMetaFilePath(platform: Platform): string { ... }
   ```

2. Add a helper to get the installed OpenCode skill name from source name:
   ```typescript
   export function getInstalledSkillName(sourceName: string): string {
     return `con-${sourceName}`;
   }
   ```

3. Update `verify.ts`:
   - Rename `checkOpenCodeExists()` → `checkPlatformExists(platform: Platform)`
   - For `opencode`: check `~/.config/opencode/` exists
   - For `claude`: check `~/.claude/` exists

### Phase 4: Frontmatter Transformation

**Files changed:** `src/utils/copy.ts` (or new `src/utils/transform.ts`)

Add a function that transforms SKILL.md during copy for OpenCode:

```typescript
export function transformSkillForOpenCode(
  content: string,
  sourceName: string,
): string {
  // Replace `name: discover` with `name: con-discover` in frontmatter
  // Leave body content unchanged (cross-references already say /con:*)
  return content.replace(
    /^(name:\s*)(.+)$/m,
    `$1con-${sourceName}`,
  );
}
```

Update `atomicCopySkills` to accept an optional transform function. During OpenCode install:
1. Copy source directory to staging with renamed directory name (`con-*`)
2. Read SKILL.md, apply transform, write back
3. Atomic rename into place (existing pattern)

### Phase 5: CLI Flag Parsing

**Files changed:** `src/cli.ts`

Replace manual `process.argv` handling with `node:util` `parseArgs`:

```typescript
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    platform: { type: "string", short: "p" },
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  },
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];
const platform = values.platform as Platform | undefined;
```

Validate `--platform` is present and valid for commands that require it. Print a clear error otherwise:

```
Error: --platform is required. Use --platform opencode or --platform claude
```

### Phase 6: Update Commands

**Files changed:** `src/commands/install.ts`, `src/commands/uninstall.ts`, `src/commands/update.ts`, `src/commands/list.ts`

**install.ts:**
- Accept `platform` parameter
- OpenCode flow: copy + transform skills, write meta file, run legacy cleanup, print `/con:*` commands
- Claude Code flow: check `~/.claude/` exists, print plugin setup instructions:
  ```
  To use concinnitas with Claude Code:

  1. Install the package globally:
     npm install -g @lucabattistini/concinnitas

  2. Add the plugin to your Claude Code settings (~/.claude/settings.json):
     {
       "plugins": ["@lucabattistini/concinnitas"]
     }

  3. Restart Claude Code. You can now use:
     /con:discover  /con:flows  /con:structure  /con:system
     /con:expression  /con:validate  /con:govern  /con:track
  ```
- Legacy cleanup: after successful OpenCode install, check for and remove `LEGACY_SKILL_NAMES` directories

**uninstall.ts:**
- Accept `platform` parameter
- OpenCode: remove `con-*` dirs (using `getInstalledSkillName()`) + meta file (existing pattern)
- Claude Code: print instructions to remove the plugin from settings

**update.ts:**
- Accept `platform` parameter
- OpenCode: existing flow (check registry, suggest re-install with `--platform opencode`)
- Claude Code: check registry, suggest `npm update -g @lucabattistini/concinnitas`
- Fix existing bug: query correct registry (`npm.pkg.github.com`) instead of `registry.npmjs.org`

**list.ts:**
- Accept `platform` parameter
- OpenCode: existing flow with updated skill names
- Claude Code: check if package is installed globally, print version

### Phase 7: Update Tests

**Files changed:** `src/utils/copy.test.ts`, `src/utils/paths.test.ts`, `src/utils/verify.test.ts`, new test files

1. Update `copy.test.ts`:
   - Fixtures use short names (`discover` instead of `design-discover`)
   - Add tests for frontmatter transformation
   - Add tests for directory rename during copy (`discover/` → `con-discover/`)

2. Update `paths.test.ts`:
   - Test platform-aware path resolution
   - Test `getInstalledSkillName()` mapping

3. Update `verify.test.ts`:
   - Test `checkPlatformExists()` for both platforms

4. Add `src/utils/transform.test.ts`:
   - Test frontmatter `name:` rewriting
   - Test that body content (cross-references) is NOT modified by transform

5. Update any test fixtures referencing `design-*` names

### Phase 8: Documentation & Package Updates

**Files changed:** `README.md`, `CLAUDE.md`, `package.json`

1. Update `README.md`:
   - New command examples with `--platform` flag
   - Claude Code plugin setup instructions
   - OpenCode install instructions
   - Upgrade guide for existing users

2. Update `CLAUDE.md`:
   - Reflect new skill names and architecture
   - Document dual-platform delivery

3. Update `package.json`:
   - Platform-neutral description
   - `plugin.json` in `files` array

## Alternative Approaches Considered

1. **Copy skills to `~/.claude/commands/`** (from original brainstorm) — Rejected because standalone Claude Code commands don't support colon namespacing. Only plugins get the `plugin-name:skill-name` format. Would result in `/con-discover` (hyphen) instead of `/con:discover` (colon). (see origin: key decisions)

2. **Keep `design-*` source names, transform at install time for both platforms** — Rejected as unnecessarily complex. Renaming source to short names is simpler and makes the plugin work without transformation.

3. **Auto-detect platform instead of `--platform` flag** — Rejected per brainstorm decision. Explicit flag keeps behavior predictable. (see origin: key decisions, scope boundaries)

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-03-19-claude-code-plugin-and-rename-requirements.md](docs/brainstorms/2026-03-19-claude-code-plugin-and-rename-requirements.md) — Key decisions carried forward: `/con:*` prefix, dual-format build with explicit `--platform` flag, global-only for Claude Code, upgrade cleanup of legacy `design-*` directories.

### Internal References

- CLI entry point: `src/cli.ts`
- Skill names constant: `src/constants.ts:3-12`
- Path resolution: `src/utils/paths.ts`
- Atomic copy: `src/utils/copy.ts`
- Verification: `src/utils/verify.ts`
- Install command: `src/commands/install.ts`
- Existing plan: `docs/plans/2026-02-28-feat-npx-installer-cli-plan.md`
- Critical learning — path resolution bug: `docs/solutions/runtime-errors/npm-package-json-relative-path-resolution-failure.md`

### External References

- Claude Code plugins reference: https://code.claude.com/docs/en/plugins-reference
- Claude Code skills docs: https://code.claude.com/docs/en/skills
- Claude Code slash commands: https://code.claude.com/docs/en/slash-commands
- Node.js `parseArgs`: https://nodejs.org/api/util.html#utilparseargsconfig
