# Concinnitas

AI-guided design process for [OpenCode](https://opencode.ai). Seven phases, each a conversational slash command that produces a text artifact feeding the next. Optional visual output to [Paper.design](https://paper.design) via MCP.

The name comes from Leon Battista Alberti's principle of *concinnitas* — harmony and elegant arrangement. Design is not decoration but structure, system, and intentional expression built in the right order.

## The 7 Phases

| # | Command | Purpose | Output |
|---|---------|---------|--------|
| 1 | `/design:discover` | Understand the problem | `01-discover.md` — business context, user pain, constraints, success criteria |
| 2 | `/design:flows` | Map user journeys | `02-flows.md` — flow maps, happy paths, error states, edge cases |
| 3 | `/design:structure` | Design hierarchy and layout | `03-structure.md` — information hierarchy, layout logic, interaction patterns |
| 4 | `/design:system` | Define design tokens | `04-system.md` — spacing, type scale, color logic, semantic tokens |
| 5 | `/design:expression` | Apply brand identity | `05-expression.md` — brand decisions, color palette, motion values |
| 6 | `/design:validate` | Check against reality | `06-validate.md` — accessibility audit, validation checklist |
| 7 | `/design:govern` | Define maintenance rules | `07-govern.md` — governance rules, token evolution, deprecation process |

Plus `/design:track [name]` for managing multiple design tracks in one project.

## How It Works

Each phase is an OpenCode skill — a markdown file with instructions the AI follows conversationally. The AI asks you questions one at a time, with suggested options but always accepting free-form answers. When a phase completes, it writes a markdown artifact to `.concinnitas/<track>/` and updates the manifest.

Phases 1-3 are strictly sequential. Phases 4-7 are flexible — you can skip them (with a warning) or run them in any order.

Re-running a completed phase does not overwrite. It shows you the existing artifact, recommends the next phase, and offers to review for gaps.

### Paper.design Integration

Phases 3-5 can push visual output to Paper.design when the MCP server is available:
- **Structure** → grayscale wireframes
- **System** → token swatches, type scale specimens
- **Expression** → branded designs

If Paper MCP is unavailable, everything works in text-only mode.

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

Clone and symlink the skills into your OpenCode config:

```sh
git clone https://github.com/lucabattistini/concinnitas.git
cd concinnitas

for skill in skills/design-*; do
  ln -s "$(pwd)/$skill" ~/.config/opencode/skills/$(basename "$skill")
done
```

## Project Structure

```
skills/
  design-track/        Track management (create, switch, list)
  design-discover/     Phase 1: Problem understanding
  design-flows/        Phase 2: User journey mapping
  design-structure/    Phase 3: Information hierarchy + wireframes
  design-system/       Phase 4: Design tokens
  design-expression/   Phase 5: Brand expression
  design-validate/     Phase 6: Validation
  design-govern/       Phase 7: Governance
docs/
  brainstorms/         Design decisions
  plans/               Implementation details
```

Runtime artifacts are created per-project in `.concinnitas/` (gitignored).

## Requirements

- [Node.js](https://nodejs.org) 18+ (for npx installer)
- [OpenCode](https://opencode.ai)
- [Paper.design](https://paper.design) MCP server (optional, for visual output)
- macOS or Linux (Windows is not supported)
