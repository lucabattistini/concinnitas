# Concinnitas

AI-guided design process for [OpenCode](https://opencode.ai) and [Claude Code](https://claude.ai/code). Seven phases, each a conversational slash command that produces a text artifact feeding the next. Optional visual output to [Paper.design](https://paper.design) via MCP.

The name comes from Leon Battista Alberti's principle of *concinnitas* — harmony and elegant arrangement. Design is not decoration but structure, system, and intentional expression built in the right order.

## The 7 Phases

| # | Command | Purpose | Output |
|---|---------|---------|--------|
| 1 | `/con:discover` | Understand the problem | `01-discover.md` — business context, user pain, constraints, success criteria |
| 2 | `/con:flows` | Map user journeys | `02-flows.md` — flow maps, happy paths, error states, edge cases |
| 3 | `/con:structure` | Design hierarchy and layout | `03-structure.md` — information hierarchy, layout logic, interaction patterns |
| 4 | `/con:system` | Define design tokens | `04-system.md` — spacing, type scale, color logic, semantic tokens |
| 5 | `/con:expression` | Apply brand identity | `05-expression.md` — brand decisions, color palette, motion values |
| 6 | `/con:validate` | Check against reality | `06-validate.md` — accessibility audit, validation checklist |
| 7 | `/con:govern` | Define maintenance rules | `07-govern.md` — governance rules, token evolution, deprecation process |

Plus `/con:track [name]` for managing multiple design tracks in one project.

## How It Works

Each phase is a skill — a markdown file with instructions the AI follows conversationally. The AI asks you questions one at a time, with suggested options but always accepting free-form answers. When a phase completes, it writes a markdown artifact to `.concinnitas/<track>/` and updates the manifest.

Phases 1-3 are strictly sequential. Phases 4-7 are flexible — you can skip them (with a warning) or run them in any order.

Re-running a completed phase does not overwrite. It shows you the existing artifact, recommends the next phase, and offers to review for gaps.

### Paper.design Integration

Phases 3-5 can push visual output to Paper.design when the MCP server is available:
- **Structure** → grayscale wireframes
- **System** → token swatches, type scale specimens
- **Expression** → branded designs

If Paper MCP is unavailable, everything works in text-only mode.

## Install

First, configure npm/pnpm to use GitHub Packages for the `@lucabattistini` scope:

```sh
echo "@lucabattistini:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

### OpenCode

```sh
npx @lucabattistini/concinnitas install --platform opencode
```

Restart OpenCode. The `/con:*` commands appear in your skill list.

### Claude Code

```sh
npm install -g @lucabattistini/concinnitas
```

Add the plugin to `~/.claude/settings.json`:

```json
{
  "plugins": ["@lucabattistini/concinnitas"]
}
```

Restart Claude Code. The `/con:*` commands are available.

### Upgrading from v1.x

If you previously used `/design:*` commands, install the new version:

```sh
npx @lucabattistini/concinnitas@latest install --platform opencode
```

The old `design-*` skill directories are cleaned up automatically.

## Other Commands

### Update

```sh
npx @lucabattistini/concinnitas update --platform opencode
npx @lucabattistini/concinnitas update --platform claude
```

### Uninstall

```sh
npx @lucabattistini/concinnitas uninstall --platform opencode
npx @lucabattistini/concinnitas uninstall --platform claude
```

### List

```sh
npx @lucabattistini/concinnitas list --platform opencode
npx @lucabattistini/concinnitas list --platform claude
```

## Project Structure

```
skills/
  track/          Track management (create, switch, list)
  discover/       Phase 1: Problem understanding
  flows/          Phase 2: User journey mapping
  structure/      Phase 3: Information hierarchy + wireframes
  system/         Phase 4: Design tokens
  expression/     Phase 5: Brand expression
  validate/       Phase 6: Validation
  govern/         Phase 7: Governance
plugin.json       Claude Code plugin manifest
docs/
  brainstorms/    Design decisions
  plans/          Implementation details
```

Runtime artifacts are created per-project in `.concinnitas/` (gitignored).

## Requirements

- [Node.js](https://nodejs.org) 18+ (for npx installer)
- [OpenCode](https://opencode.ai) and/or [Claude Code](https://claude.ai/code)
- [Paper.design](https://paper.design) MCP server (optional, for visual output)
- macOS or Linux (Windows is not supported)
