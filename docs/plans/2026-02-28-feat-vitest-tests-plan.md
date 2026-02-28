---
title: "feat: add Vitest tests for CLI utils"
type: feat
status: completed
date: 2026-02-28
origin: docs/brainstorms/2026-02-28-vitest-tests-brainstorm.md
---

# Vitest Tests for CLI Utils

## Overview

Add Vitest unit tests for the three utility modules (`copy.ts`, `verify.ts`, `paths.ts`) to gain confidence before the first `npm publish`. Tests use real filesystem operations with temp directories — no mocked `fs` calls.

(See brainstorm: `docs/brainstorms/2026-02-28-vitest-tests-brainstorm.md` for approach rationale.)

## Acceptance Criteria

- [x] `npm test` runs Vitest and all tests pass
- [x] `copy.ts` tests: atomic copy, overwrite, staging cleanup on failure, removeSkills
- [x] `verify.ts` tests: valid, invalid, and missing SKILL.md scenarios
- [x] `paths.ts` tests: default path, XDG_CONFIG_HOME override, bundled skills resolution
- [x] Test files excluded from `tsc` build output (`dist/` stays clean)
- [x] Test files excluded from npm package (`npm pack --dry-run` unchanged)
- [x] TypeScript compiles cleanly with `npm run build`

## Architecture

### File Layout

Tests live alongside source files:

```
src/utils/
  paths.ts
  paths.test.ts       ← new
  copy.ts
  copy.test.ts         ← new
  verify.ts
  verify.test.ts       ← new
  output.ts            (no test — simple console wrappers)
```

### Config Changes

**`vitest.config.ts`** (new, root):
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
```

**`tsconfig.json`** — add exclude for test files:
```json
{
  "exclude": ["src/**/*.test.ts"]
}
```

**`package.json`** — add test script:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

### Test Strategy

All tests use a shared pattern:
1. Create a temp directory in `beforeEach` via `mkdtempSync`
2. Set up fixture files (fake SKILL.md with frontmatter, skill directories)
3. Run the function under test
4. Assert filesystem state and return values
5. Clean up temp directory in `afterEach` via `rmSync`

No mocks for `fs` — all operations hit the real filesystem.

For `paths.ts`, tests manipulate `process.env.XDG_CONFIG_HOME` and restore it after each test.

## Task Breakdown

### Task 1: Install Vitest and configure

**Files to modify:**
- `package.json` — add vitest dev dependency, test scripts
- `tsconfig.json` — exclude `*.test.ts` from compilation
- Create `vitest.config.ts`

**`vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
```

**Verify after:**
- `npm run build` still compiles cleanly (no test files in `dist/`)
- `npm pack --dry-run` output is unchanged (no test files in package)
- `npx vitest run` exits with "no test files found" (expected — tests not written yet)

---

### Task 2: Create `src/utils/paths.test.ts`

Tests for path resolution functions.

```typescript
// Test cases:
//
// getSkillsTargetDir()
//   - returns ~/.config/opencode/skills by default (no XDG set)
//   - respects XDG_CONFIG_HOME when set
//   - returns absolute path
//
// getOpenCodeConfigDir()
//   - returns ~/.config/opencode by default
//   - respects XDG_CONFIG_HOME
//
// getBundledSkillsDir()
//   - returns a path ending in /skills
//   - returns an absolute path
//
// getMetaFilePath()
//   - returns a path ending in .concinnitas-meta.json
//   - path is inside opencode config dir, not inside skills/
```

**Note:** Tests for `getSkillsTargetDir` and `getOpenCodeConfigDir` must save/restore `process.env.XDG_CONFIG_HOME` in beforeEach/afterEach.

---

### Task 3: Create `src/utils/copy.test.ts`

Tests for atomic copy and remove operations. This is the highest-value test file.

```typescript
// Fixture helper: createSkillFixture(dir, name)
//   Creates dir/name/SKILL.md with valid YAML frontmatter
//
// Test cases:
//
// atomicCopySkills()
//   - copies all skills from source to target
//   - each skill dir contains SKILL.md after copy
//   - overwrites existing skills (idempotent)
//   - creates target directory if it doesn't exist
//   - throws if a source skill is missing
//   - cleans up staging dir on success (no .concinnitas-staging-* left)
//   - cleans up staging dir on failure
//   - throws if SKILL.md is missing in source skill dir
//
// removeSkills()
//   - removes existing skill directories
//   - returns list of removed skill names
//   - returns empty list if no skills exist
//   - ignores skills that don't exist (no error)
```

---

### Task 4: Create `src/utils/verify.test.ts`

Tests for installation verification.

```typescript
// Fixture helper: createSkillMd(dir, name, content)
//   Creates dir/name/SKILL.md with given content
//
// Test cases:
//
// verifyInstallation()
//   - classifies skill with valid frontmatter as "valid"
//   - classifies skill without '---' as "invalid"
//   - classifies skill without 'name:' as "invalid"
//   - classifies missing skill directory as "missing"
//   - classifies empty SKILL.md as "invalid"
//   - handles mix of valid, invalid, and missing skills
//   - returns empty arrays when no skills checked
//
// checkOpenCodeExists()
//   - returns true when opencode config dir exists
//   - returns false when it doesn't
```

**Note:** `checkOpenCodeExists()` depends on `getOpenCodeConfigDir()` which reads `XDG_CONFIG_HOME`. Tests should set `XDG_CONFIG_HOME` to a temp dir to control behavior.

---

### Task 5: Run all tests and verify

- [x] `npm test` — all tests pass (30/30)
- [x] `npm run build` — no test files in `dist/`
- [x] `npm pack --dry-run` — package contents unchanged (20 files, 25.0 kB)
- [x] Run tests with verbose output to confirm coverage of key scenarios

---

## What This Does NOT Do

- Does not test command-level orchestration (`install.ts`, `uninstall.ts`, etc.)
- Does not test CLI argument parsing (`cli.ts`)
- Does not test output formatting (`output.ts`)
- Does not add CI/CD pipeline (can be added later)
- Does not add coverage reporting (can be added later)

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-02-28-vitest-tests-brainstorm.md](docs/brainstorms/2026-02-28-vitest-tests-brainstorm.md)
- Vitest docs: https://vitest.dev/config/
- Node.js `mkdtempSync`: https://nodejs.org/api/fs.html#fsmkdtempsyncprefix-options
