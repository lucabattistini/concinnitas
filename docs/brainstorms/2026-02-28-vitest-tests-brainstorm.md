---
date: 2026-02-28
topic: vitest-tests
---

# Add Vitest Tests for CLI Utils

## What We're Building

Unit tests for the CLI's utility modules (`copy.ts`, `verify.ts`, `paths.ts`) using Vitest. The goal is confidence that the core logic works correctly before the first `npm publish`. Tests use real filesystem operations via temp directories — no mocks for fs calls.

Scope is deliberately limited to utils only. Command-level integration tests and CLI arg parsing tests are out of scope for v1.

## Why This Approach

**Vitest** was chosen over Node.js built-in `node:test` because:

- **Native ESM + TypeScript** — the project uses `"type": "module"` and strict TypeScript. Vitest handles this with zero config. The built-in runner requires compiling tests to JS first.
- **DX** — watch mode, rich assertions, clear error messages, IDE integration. The built-in runner is bare-bones.
- **Dev dependency, not runtime** — the "zero deps" principle applies to the published package. Vitest is dev-only and never ships to users.
- **Standard** — Vitest is the dominant test runner for ESM + TypeScript in 2026.

The built-in `node:test` was rejected because it adds friction (compile step, verbose syntax, no watch) for no real benefit beyond "zero dev deps" purity, which isn't a project goal.

## Key Decisions

- **Test scope: utils only** — `copy.ts`, `verify.ts`, `paths.ts`. These contain the real logic. `output.ts` is simple console wrappers (low value). Commands and CLI entry are orchestration (integration-test territory, out of scope).
- **Real filesystem, not mocks** — tests create temp directories with actual files to verify copy, staging, rollback, and verification behavior. This is standard for CLI tools and gives higher confidence than mocking `fs`.
- **Tests live alongside source** — `src/utils/copy.test.ts` next to `src/utils/copy.ts`. Vitest discovers them by convention. Alternative (`tests/` dir) adds indirection without benefit. Note: `tsconfig.json` must exclude `*.test.ts` from compilation so test files don't end up in `dist/` or the npm package.
- **Priority test targets:**
  1. `copy.ts` — `atomicCopySkills()` (staging, rollback on failure, overwrite) and `removeSkills()`
  2. `verify.ts` — `verifyInstallation()` (valid, invalid, missing SKILL.md scenarios)
  3. `paths.ts` — `getSkillsTargetDir()` with/without `XDG_CONFIG_HOME`, `getBundledSkillsDir()` resolution

## Next Steps

→ `/workflows:plan` for implementation details (vitest config, test file structure, specific test cases)
