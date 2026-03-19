# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Concinnitas is an npm package (`@lucabattistini/concinnitas`) that provides AI-guided design skills (slash commands) for [OpenCode](https://opencode.ai) and [Claude Code](https://claude.ai/code). It provides a 7-phase design process (`/con:discover` through `/con:govern`) where each phase is a SKILL.md markdown file the AI follows conversationally, producing artifacts in `.concinnitas/<track>/`.

The package serves dual purposes:
- **OpenCode**: CLI copies skills to `~/.config/opencode/skills/` with `con-*` prefixed directories
- **Claude Code**: The package itself is a plugin (`plugin.json` with `"name": "con"`) — skills are served directly

## Commands

```sh
pnpm run build          # Compile TypeScript (tsc) → dist/
pnpm run test           # Run all tests (vitest)
pnpm run test:watch     # Run tests in watch mode
pnpm vitest run src/utils/copy.test.ts  # Run a single test file
```

Releases use [Changesets](https://github.com/changesets/changesets):
```sh
pnpm changeset          # Create a changeset
pnpm run version        # Apply changesets → bump version + CHANGELOG
pnpm run release        # Publish to GitHub Packages
```

## Architecture

**CLI entry point:** `src/cli.ts` — parses `--platform opencode|claude` flag via `node:util` `parseArgs`, dispatches `install`, `uninstall`, `update`, `list` commands. Compiled to `dist/cli.js` with a shebang, invoked via `npx @lucabattistini/concinnitas <command> --platform <platform>`.

**Dual-platform delivery:**
- **OpenCode**: CLI copies skill directories from `skills/` (short names like `discover/`) to `~/.config/opencode/skills/` as `con-discover/`, `con-flows/`, etc. The `name:` field in SKILL.md frontmatter is transformed from `discover` to `con-discover` during copy.
- **Claude Code**: `plugin.json` at package root declares `"name": "con"`. Claude Code auto-namespaces skills as `/con:discover`, `/con:flows`, etc. No file copying needed.

**Key modules:**
- `src/constants.ts` — skill names list (`SKILL_NAMES`), legacy names for upgrade cleanup (`LEGACY_SKILL_NAMES`), `Platform` type, package version
- `src/utils/paths.ts` — platform-aware path resolution, `getInstalledSkillName()` for `con-*` prefix
- `src/utils/copy.ts` — atomic copy with directory rename and optional SKILL.md transformation
- `src/utils/transform.ts` — frontmatter `name:` field rewriting for OpenCode
- `src/utils/verify.ts` — post-install verification, `checkPlatformExists()`
- `src/utils/output.ts` — colored console output helpers

**Skills:** Each `skills/*/SKILL.md` is a skill definition using short names (e.g., `discover`, `flows`). These are markdown files with YAML frontmatter, not TypeScript. Phases 1-3 are sequential; phases 4-7 are flexible order.

**Publishing:** Published to GitHub Packages (`npm.pkg.github.com`) under the `@lucabattistini` scope. CI/CD via `.github/workflows/` (ci.yml for tests, release.yml for changesets).

## Conventions

- ESM-only (`"type": "module"` in package.json), `.js` extensions in imports
- Tests are colocated: `src/utils/foo.test.ts` next to `src/utils/foo.ts`
- Target: ES2022, module resolution: Node16
- Package manager: pnpm
