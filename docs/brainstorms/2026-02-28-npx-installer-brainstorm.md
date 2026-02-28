---
date: 2026-02-28
topic: npx-installer
---

# NPX/Bunx Installer for Concinnitas

## What We're Building

A TypeScript CLI published to npm as `@lucabattistini/concinnitas` that lets users install, update, uninstall, and list the concinnitas design process skills for OpenCode with a single command:

```sh
npx @lucabattistini/concinnitas install
```

The CLI copies the 8 skill directories (`design-track`, `design-discover`, `design-flows`, `design-structure`, `design-system`, `design-expression`, `design-validate`, `design-govern`) to `~/.config/opencode/skills/` and verifies the setup is working.

## Why This Approach

**Standalone TypeScript CLI** was chosen over alternatives because:

- **One-liner install** — `npx @lucabattistini/concinnitas install` is the simplest possible UX. No git clone, no manual symlinking, no two-step process.
- **npm distribution** — Discoverable, versioned, works with both npx and bunx out of the box.
- **Zero runtime dependencies** — The CLI uses only Node.js built-ins (fs, path, os). No third-party packages needed.
- **Full control** — The install experience (verification, error handling, output) is entirely ours to design.

The OpenCode Plugin API (`@opencode-ai/plugin`) was considered but rejected — it's designed for programmatic plugins (tools, hooks, auth), not for distributing markdown skill files. It would be a round peg for a square hole.

A git-based approach with setup script was also considered but rejected — it requires two steps (clone + run) and isn't discoverable via npm.

## Architecture

### Package Structure

```
concinnitas/
  package.json           # npm package config with bin field
  tsconfig.json          # TypeScript config
  src/
    cli.ts               # Entry point — argument parsing, command dispatch
    commands/
      install.ts         # Copy skills to OpenCode config
      uninstall.ts       # Remove skills from OpenCode config
      update.ts          # Overwrite skills with latest version
      list.ts            # Show installed skills and their status
    utils/
      paths.ts           # Resolve OpenCode skills directory
      copy.ts            # Recursive directory copy
      verify.ts          # Check OpenCode installation and skill loading
  bin/
    concinnitas.js       # Compiled entry point (git-ignored, built from src/)
  skills/                # Existing skill files (bundled in npm package)
    design-track/
    design-discover/
    ...
  docs/                  # Existing docs (not published to npm)
  README.md
```

### CLI Commands

```
npx @lucabattistini/concinnitas install     # Copy skills to ~/.config/opencode/skills/
npx @lucabattistini/concinnitas uninstall   # Remove concinnitas skills
npx @lucabattistini/concinnitas update      # Overwrite with latest version
npx @lucabattistini/concinnitas list        # Show installed skills and status
npx @lucabattistini/concinnitas --help      # Show usage
npx @lucabattistini/concinnitas --version   # Show version
```

### Install Flow

1. **Verify OpenCode** — Check if `~/.config/opencode/` exists. If not, warn the user ("OpenCode config directory not found. Is OpenCode installed?") and ask whether to proceed anyway (creates the skills directory).
2. **Resolve target** — `~/.config/opencode/skills/`. Create if it doesn't exist.
3. **Copy skills** — For each `design-*` directory in the bundled `skills/`:
   - Copy the entire directory to the target location
   - Report each: `  ✓ design-discover → ~/.config/opencode/skills/design-discover`
4. **Verify setup** — Check that all 8 skill directories exist and each contains a `SKILL.md` with valid YAML frontmatter.
5. **Report** — Show summary with the list of available `/design:*` commands.

### Uninstall Flow

1. **Resolve target** — `~/.config/opencode/skills/`
2. **Remove skills** — For each `design-*` directory that exists in the target:
   - Remove the directory recursively
   - Report each: `  ✓ Removed design-discover`
3. **Report** — "Concinnitas skills removed."

### Update Flow

Same as install — overwrite silently. No backup, no diff, no prompts. Updates are idempotent.

### List Flow

1. **Check target** — `~/.config/opencode/skills/`
2. **For each expected skill** — Check if it exists and if `SKILL.md` is present
3. **Display table** — Show each skill, its version (from package.json), and installed/missing status

## Key Decisions

- **Target: OpenCode only** — No Claude Code support for now. The skill format is compatible, but the install location and plugin system differ. Claude Code support can be added later as a `--target claude` flag.
- **Package name: `@lucabattistini/concinnitas`** — Scoped package, guaranteed available on npm. Users run `npx @lucabattistini/concinnitas install`.
- **TypeScript with build step** — Source in `src/`, compiled to `bin/`. Build with `tsc`. The compiled output is gitignored; npm publish includes it via `prepublishOnly` script.
- **Copy, not symlink** — npx downloads packages to a temporary directory that may be cleaned up. Skills must be copied, not symlinked. This means updates require re-running `npx @lucabattistini/concinnitas update`.
- **Overwrite silently on update** — No backup, no diff, no prompts. The source of truth is the npm package. Local modifications to skill files will be lost on update.
- **Zero dependencies** — The CLI uses only Node.js built-ins. No chalk, no commander, no inquirer. Keeps the install fast and the package tiny.
- **Full setup assistant** — The install command verifies OpenCode is present, creates directories as needed, copies skills, and confirms they're loadable.
- **`files` field in package.json** — Only `bin/` and `skills/` are published to npm. `src/`, `docs/`, and `tests/` are excluded to keep the package small.

## Open Questions

None — all questions resolved during brainstorming.

## Next Steps

→ `/workflows:plan` for implementation details
