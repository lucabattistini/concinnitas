---
date: 2026-03-19
topic: claude-code-plugin-and-rename
---

# Claude Code Plugin Support & Command Renaming

## Problem Frame

Concinnitas currently only targets OpenCode. Users of Claude Code — a growing and significant audience — cannot use the design skills at all. Additionally, the current `/design:*` command namespace is long, generic, and not branded. Making concinnitas available on both platforms with a memorable, branded command scheme increases reach and usability.

## Requirements

- R1. Rename all commands from `/design:*` to `/con:*` — the full list becomes: `/con:discover`, `/con:flows`, `/con:structure`, `/con:system`, `/con:expression`, `/con:validate`, `/con:govern`, `/con:track`
- R2. The CLI supports a dual-format build: same source skills produce platform-specific output for OpenCode (`SKILL.md` in `~/.config/opencode/skills/`) and Claude Code (markdown in `~/.claude/commands/`)
- R3. The CLI requires a `--platform opencode|claude` flag on the `install` command — no default, explicit choice required
- R4. Claude Code skills install globally to `~/.claude/commands/`, mirroring the existing OpenCode global install behavior
- R5. The `uninstall`, `update`, and `list` commands work for both platforms (respecting which platform is installed)
- R6. Skill directory names and cross-references between skills update to match the new `/con:*` naming — this includes directory names in the source repo, installed output, and all "Run `/design:*`" references within skill markdown files
- R7. Upgrading from a previous version cleans up old `design-*` skill directories so users don't end up with duplicate commands under both `/design:*` and `/con:*`

## Success Criteria

- A Claude Code user can run `npx @lucabattistini/concinnitas install --platform claude` and immediately use all `/con:*` commands (`discover`, `flows`, `structure`, `system`, `expression`, `validate`, `govern`, `track`)
- An OpenCode user can run `npx @lucabattistini/concinnitas install --platform opencode` and get the same skills under the `/con:*` namespace
- Existing OpenCode users upgrading from `/design:*` get the new names with no manual cleanup needed
- Both platforms share a single source of skill content — no duplicated markdown

## Scope Boundaries

- No per-project install for Claude Code (global only, like OpenCode)
- No auto-detection of which platform is installed (explicit `--platform` flag)
- No changes to the skill workflow content itself (phases, questions, artifacts) — this is purely a delivery and naming change
- No Figma or other visual tool changes
- Paper.design MCP integration remains unchanged

## Key Decisions

- **`/con:*` prefix**: Short, branded, memorable. Derived from "concinnitas." Phase names stay the same (`discover`, `flows`, `structure`, etc.) since they're already clear.
- **Dual-format build with explicit flag**: The CLI compiles/copies source skills into the correct format per platform. No auto-detection — the user specifies `--platform`. This keeps the logic simple and predictable.
- **Global-only for Claude Code**: Matches the OpenCode install pattern. Per-project install can be added later if there's demand.

## Dependencies / Assumptions

- Claude Code custom commands use markdown files in `~/.claude/commands/` with their own frontmatter format (different from OpenCode's `SKILL.md`)
- The source skill content (workflow, questions, artifact templates) is platform-agnostic — only the frontmatter and file naming conventions differ between platforms

## Outstanding Questions

### Deferred to Planning

- [Affects R2][Needs research] Exact Claude Code custom command frontmatter format and any constraints (naming, description fields, argument handling)
- [Affects R2][Technical] How to structure the source skills so a single markdown body can be wrapped with platform-specific frontmatter at build/install time
- [Affects R6][Technical] Whether skill directory names should change from `design-*` to `con-*` in the source repo, or only in the installed output
- [Affects R1][Technical] Whether the `.concinnitas-meta.json` needs a platform field, or if separate meta files per platform are cleaner
- [Affects R5][Technical] How `update` and `uninstall` discover which platform(s) are currently installed — does `--platform` apply to all commands, or do non-install commands infer from meta file?

## Next Steps

→ `/ce:plan` for structured implementation planning
