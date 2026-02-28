---
title: "feat: NPX/Bunx installer CLI for concinnitas skills"
type: feat
status: completed
date: 2026-02-28
origin: docs/brainstorms/2026-02-28-npx-installer-brainstorm.md
---

# NPX/Bunx Installer CLI

## Overview

Add a TypeScript CLI to the concinnitas repo, published to npm as `@lucabattistini/concinnitas`, that lets users install, update, uninstall, and list the design process skills for OpenCode with a single command: `npx @lucabattistini/concinnitas install`.

(See brainstorm: `docs/brainstorms/2026-02-28-npx-installer-brainstorm.md` for approach rationale and rejected alternatives.)

## Acceptance Criteria

- [x] `npx @lucabattistini/concinnitas install` copies all 8 skills to `~/.config/opencode/skills/`
- [x] `npx @lucabattistini/concinnitas uninstall` removes only the 8 concinnitas skills
- [x] `npx @lucabattistini/concinnitas update` checks npm for newer version and advises user
- [x] `npx @lucabattistini/concinnitas list` shows installed/missing status for each skill
- [x] `npx @lucabattistini/concinnitas --help` and `--version` work
- [x] Works with both `npx` and `bunx`
- [x] Zero runtime npm dependencies
- [x] TypeScript source compiles cleanly
- [x] Atomic install — partial failure doesn't leave a broken state
- [x] Non-interactive mode works (CI/piped environments)
- [x] Minimum Node.js 18+

## Architecture

### Package Structure

```
concinnitas/
  package.json              # npm package config with bin field
  tsconfig.json             # TypeScript config (target: ES2022, module: Node16)
  src/
    cli.ts                  # Entry point — argument parsing, command dispatch
    commands/
      install.ts            # Atomic copy skills to OpenCode config
      uninstall.ts          # Remove concinnitas skills
      update.ts             # Check for newer version, then install if available
      list.ts               # Show installed skills and their status
    utils/
      paths.ts              # Resolve OpenCode skills directory (cross-platform)
      copy.ts               # Recursive directory copy with staging
      verify.ts             # Check OpenCode installation and skill loading
      output.ts             # TTY-aware output formatting
  dist/                     # Compiled JS (gitignored, included in npm package)
    cli.js
    ...
  skills/                   # Existing skill files (bundled in npm package)
    design-track/SKILL.md
    design-discover/SKILL.md
    ...
  docs/                     # NOT published to npm
  README.md
  .gitignore
```

### Key Design Decisions

All decisions carried forward from brainstorm:

- **Target: OpenCode only** (see brainstorm: Key Decisions)
- **Package name: `@lucabattistini/concinnitas`** — scoped, guaranteed available on npm
- **TypeScript with build step** — source in `src/`, compiled to `dist/`
- **Copy, not symlink** — npx temp dir may be cleaned up
- **Zero runtime dependencies** — only Node.js built-ins (fs, path, os)
- **`files` field** — only `dist/` and `skills/` published to npm

### Additional decisions (from SpecFlow gap analysis):

- **`install` is idempotent** — behaves the same whether skills exist or not. Overwrites silently. Running `install` twice is safe.
- **`update` checks for newer versions** — `update` queries the npm registry for the latest `@lucabattistini/concinnitas` version, compares it to the currently installed version (from `.concinnitas-meta.json`), and either reports "already up to date" or tells the user to re-run `npx @lucabattistini/concinnitas@latest install`. The CLI doesn't self-update — npx handles fetching the latest package.
- **Atomic install via staging directory** — copy to `.concinnitas-staging/` temp dir first, verify all 8, then move into place. If any step fails, clean up staging and leave existing state untouched.
- **Hardcoded skill list** — uninstall only removes these exact 8 directories, not a `design-*` glob. This prevents accidentally deleting user-created skills.
- **Non-interactive by default** — no stdin prompts. If OpenCode config dir doesn't exist, create it with a warning message. Use `--yes`/`-y` flag convention but since there are no destructive prompts, it's not needed initially.
- **Cross-platform: macOS + Linux** — use `os.homedir()` + `.config/opencode/skills/`. Respect `$XDG_CONFIG_HOME` on Linux. Windows is out of scope (OpenCode primarily targets macOS/Linux). Document this in README.
- **YAML validation is lightweight** — check SKILL.md exists, starts with `---`, contains `name:` field. No full YAML parser needed.
- **Version marker** — write `.concinnitas-meta.json` to `~/.config/opencode/` (not inside `skills/`, to avoid OpenCode trying to load it as a skill) during install. Contains version + install timestamp. `list` and `update` read this.
- **Exit codes** — `0` success, `1` error.
- **Minimum Node.js 18+** — `fs.cpSync` recursive is stable, `engines` field in package.json enforces this.

## Task Breakdown

### Task 1: Initialize npm package and TypeScript config

**Files to create:**
- `package.json`
- `tsconfig.json`
- Update `.gitignore`

**`package.json`:**
```json
{
  "name": "@lucabattistini/concinnitas",
  "version": "1.0.0",
  "type": "module",
  "description": "AI-guided 7-phase design process for OpenCode",
  "bin": {
    "concinnitas": "./dist/cli.js"
  },
  "files": [
    "dist/",
    "skills/"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["opencode", "design", "design-system", "ai", "skills"],
  "author": "Luca Battistini",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/lucabattistini/concinnitas.git"
  }
}
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "declaration": false,
    "sourceMap": false
  },
  "include": ["src/**/*"]
}
```

**`.gitignore` additions:**
```
dist/
node_modules/
```

---

### Task 2: Create `src/utils/paths.ts` — Path resolution

Resolves the OpenCode skills directory cross-platform.

```typescript
// Key logic:
// 1. Check $XDG_CONFIG_HOME (Linux override)
// 2. Fall back to os.homedir() + '.config'
// 3. Append 'opencode/skills/'
// 4. Return resolved absolute path

// Also: resolve bundled skills path relative to compiled CLI
// Since this is ESM ("type": "module"), use import.meta.url:
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// path.resolve(__dirname, '..', 'skills')
```

**Exports:**
- `getSkillsTargetDir(): string` — where skills should be installed
- `getBundledSkillsDir(): string` — where bundled skills live in the package
- `getMetaFilePath(): string` — path to `.concinnitas-meta.json`

---

### Task 3: Create `src/utils/output.ts` — TTY-aware output

Simple output helpers. No chalk, no colors — just checkmarks and clean formatting.

**Exports:**
- `success(msg: string): void` — prints `  ✓ {msg}`
- `warn(msg: string): void` — prints `  ⚠ {msg}`
- `error(msg: string): void` — prints `  ✗ {msg}`
- `info(msg: string): void` — prints `  {msg}`
- `heading(msg: string): void` — prints `\n{msg}\n`

Use plain ASCII fallbacks (`[OK]`, `[!]`, `[X]`) if `process.stdout` is not a TTY or if the locale suggests non-UTF-8.

---

### Task 4: Create `src/utils/copy.ts` — Atomic directory copy

Implements the staging-based atomic copy strategy.

```typescript
// Key logic:
// 1. Create staging dir: targetParent/.concinnitas-staging-{random}/
// 2. For each skill dir: fs.cpSync(source, staging/skillName, { recursive: true })
// 3. Verify all 8 SKILL.md files exist in staging
// 4. For each skill: fs.renameSync(staging/skillName, target/skillName)
//    - If target/skillName exists, fs.rmSync it first
// 5. Clean up staging dir
// 6. On ANY error: clean up staging dir, throw with context
```

**Exports:**
- `atomicCopySkills(sourceDir: string, targetDir: string, skillNames: string[]): void`
- `removeSkills(targetDir: string, skillNames: string[]): void`

---

### Task 5: Create `src/utils/verify.ts` — Installation verification

Checks that skills are properly installed.

```typescript
// Key logic:
// 1. For each expected skill name:
//    - Check targetDir/skillName/SKILL.md exists
//    - Read first 10 lines, check starts with '---' and contains 'name:'
// 2. Return { valid: string[], invalid: string[], missing: string[] }
```

**Exports:**
- `verifyInstallation(targetDir: string, skillNames: string[]): VerifyResult`
- `checkOpenCodeExists(): boolean` — check if `~/.config/opencode/` or equivalent exists

---

### Task 6: Create `src/commands/install.ts`

The install command. Copies bundled skills to the OpenCode config directory.

```typescript
// Flow:
// 1. Check if OpenCode config dir exists
//    - If not: warn("OpenCode config directory not found. Creating it anyway.")
// 2. Ensure target skills dir exists (fs.mkdirSync recursive)
// 3. Call atomicCopySkills(bundledDir, targetDir, SKILL_NAMES)
// 4. Call verifyInstallation(targetDir, SKILL_NAMES)
// 5. Write .concinnitas-meta.json with { version, installedAt, skills: [...] }
// 6. Print results:
//    - Each skill: "✓ design-discover → ~/.config/opencode/skills/design-discover"
//    - Summary: "8 skills installed. Restart OpenCode to load them."
//    - Available commands list
```

**Constants:**
```typescript
const SKILL_NAMES = [
  'design-track',
  'design-discover',
  'design-flows',
  'design-structure',
  'design-system',
  'design-expression',
  'design-validate',
  'design-govern',
] as const;
```

---

### Task 7: Create `src/commands/uninstall.ts`

```typescript
// Flow:
// 1. Resolve target dir
// 2. Check which of the 8 known skill names exist
// 3. If none exist: info("No concinnitas skills found. Nothing to remove.")
// 4. Remove each existing skill directory
// 5. Remove .concinnitas-meta.json if it exists
// 6. Print results: "✓ Removed design-discover" for each
// 7. Summary: "N skills removed."
```

Note: no confirmation prompt (non-interactive by default). The operation only removes the 8 hardcoded skill names — never globs.

---

### Task 8: Create `src/commands/update.ts`

```typescript
// Flow:
// 1. Read .concinnitas-meta.json for currently installed version
//    - If not found: info("No concinnitas installation found. Run `install` first."), exit
// 2. Fetch latest version from npm registry:
//    https.get('https://registry.npmjs.org/@lucabattistini/concinnitas/latest')
//    - Parse response JSON for `version` field
//    - On network error: warn("Could not check for updates. Run `install` to force-reinstall."), exit
// 3. Compare installed version vs. latest
//    - If same: info("Already up to date (v{version})."), exit
//    - If different: info("Update available: v{installed} → v{latest}")
// 4. Tell user: "Run `npx @lucabattistini/concinnitas@latest install` to update."
//    - The CLI itself doesn't self-update — it tells the user to re-run npx with @latest
//    - npx always fetches the latest version by default, so `npx @lucabattistini/concinnitas install`
//      already gets the newest skills. `update` is primarily a version-check command.
```

Note: `update` uses Node.js built-in `https` module (or `node:https`) to query the npm registry. This is the only network call in the CLI. No dependencies needed.

---

### Task 9: Create `src/commands/list.ts`

```typescript
// Flow:
// 1. Resolve target dir
// 2. Read .concinnitas-meta.json for version info (if exists)
// 3. For each of the 8 skill names:
//    - Check if targetDir/skillName/SKILL.md exists
//    - Mark as installed or missing
// 4. Print table:
//    Concinnitas Skills (v1.0.0, installed 2026-02-28)
//
//    Skill                Status
//    design-track         ✓ installed
//    design-discover      ✓ installed
//    design-flows         ✗ missing
//    ...
//
//    7/8 skills installed.
```

---

### Task 10: Create `src/cli.ts` — Entry point

```typescript
#!/usr/bin/env node

// Parse process.argv:
// [0] = node, [1] = script, [2] = command, [3...] = flags

// Commands: install, update, uninstall, list
// Flags: --help, -h, --version, -v

// If no command or --help: show usage text
// If --version: show package version (read from package.json or hardcode)
// If unknown command: error("Unknown command: {cmd}. Run --help for usage.")
// Otherwise: dispatch to command handler

// Wrap in try/catch:
// - On error: output.error(err.message), process.exit(1)
// - On success: process.exit(0)
```

**Help text:**
```
concinnitas — AI-guided design process for OpenCode

Usage:
  concinnitas <command>

Commands:
  install     Install skills to OpenCode
  update      Check for newer version on npm
  uninstall   Remove skills from OpenCode
  list        Show installed skills

Options:
  --help, -h      Show this help message
  --version, -v   Show version

Examples:
  npx @lucabattistini/concinnitas install
  npx @lucabattistini/concinnitas list
```

---

### Task 11: Build, test locally, and verify

- [x] Run `npm run build` — ensure `tsc` compiles without errors
- [x] Run `node dist/cli.js --help` — verify help output
- [x] Run `node dist/cli.js --version` — verify version output
- [x] Run `node dist/cli.js install` — verify skills are copied
- [x] Run `node dist/cli.js list` — verify status table
- [x] Run `node dist/cli.js uninstall` — verify removal
- [x] Run `node dist/cli.js install` again — verify idempotent re-install
- [x] Run `node dist/cli.js update` — verify version check against npm registry
- [x] Test partial failure: make a skill dir read-only, run install, verify staging is cleaned up
- [x] Test `npx .` from repo root — verify local npx execution works
- [x] Test `bunx .` from repo root — verify bunx works (verified via `bun dist/cli.js`; `bunx` resolves package names from npm, not local paths)

---

### Task 12: Update README.md

Update the install section to show the new method prominently:

```markdown
## Install

```sh
npx @lucabattistini/concinnitas install
```

Restart OpenCode. The `/design:*` commands appear in your skill list.

### Update

```sh
npx @lucabattistini/concinnitas update
```

### Uninstall

```sh
npx @lucabattistini/concinnitas uninstall
```

### Manual install (alternative)

```sh
git clone ...
```
```

---

### Task 13: Publish to npm

- [ ] Verify `npm whoami` works (logged in as `lucabattistini`)
- [x] Run `npm pack --dry-run` — verify only `dist/`, `skills/`, `package.json`, `README.md` are included
- [ ] Run `npm publish --access public`
- [ ] Verify: `npx @lucabattistini/concinnitas --version` works from a clean environment
- [ ] Verify: `npx @lucabattistini/concinnitas install` works end-to-end

## What This Does NOT Do

- Does not modify OpenCode configuration files
- Does not verify OpenCode is running
- Does not back up existing skills before overwrite
- Does not preserve local modifications to skill files
- Does not support Windows (macOS + Linux only)
- Does not register skills with OpenCode — just copies files; OpenCode auto-discovers them on restart

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-02-28-npx-installer-brainstorm.md](docs/brainstorms/2026-02-28-npx-installer-brainstorm.md) — approach selection, key decisions, architecture, CLI commands
- npm `bin` field docs: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
- Node.js `fs.cpSync`: https://nodejs.org/api/fs.html#fscpsyncsrc-dest-options
