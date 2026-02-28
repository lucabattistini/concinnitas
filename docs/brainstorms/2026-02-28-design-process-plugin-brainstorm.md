---
date: 2026-02-28
topic: design-process-plugin
---

# Concinnitas: AI-Guided Design Process Plugin

## What We're Building

A set of OpenCode skill files that implement a structured, 7-phase design process as slash commands. Each phase is a conversational workflow where the AI guides the user through design decisions, producing artifacts that chain into the next phase. The tool outputs structured text files as its backbone, with visual artifacts pushed to Paper.design (via MCP) at the phases where visual output matters.

The name "concinnitas" — Alberti's principle of harmony and elegant arrangement — reflects the philosophy: design is not decoration but structure, system, and intentional expression built in the right order.

## Why This Approach

**Pure OpenCode skills (no code/CLI)** was chosen because:

- **YAGNI** — The design *process* needs validation before building infrastructure around it. Markdown skill files let us iterate on the workflow without touching code.
- **Zero dependencies** — Works immediately after copying skill files. No Node.js, no package manager, no build step.
- **The AI is the runtime** — OpenCode already has file I/O, structured conversation, and Paper.design MCP access. A separate CLI would duplicate capabilities the AI already has.
- **Upgrade path** — A TypeScript CLI for state management can be added later without changing skill files.

Paper.design was chosen as the primary visual canvas over Figma because its MCP server supports both read and write operations, its HTML/CSS-based canvas aligns naturally with web development, and it's purpose-built for agent-driven workflows.

## Architecture

### The 7 Commands

| # | Command | Purpose | Input | Output (Text) | Output (Visual) |
|---|---------|---------|-------|----------------|------------------|
| 1 | `/design:discover` | Understand the problem deeply | User conversation (brief, goals, constraints) | `01-discover.md` — Problem brief, business context, user pain, constraints, success criteria | None |
| 2 | `/design:flows` | Map user journeys and edge cases | `01-discover.md` | `02-flows.md` — Flow maps, happy paths, error states, edge case matrix | None (optional: flow diagrams in Paper) |
| 3 | `/design:structure` | Design hierarchy and layout logic | `01-discover.md` + `02-flows.md` | `03-structure.md` — Information hierarchy, layout logic, interaction patterns | Grayscale wireframes in Paper |
| 4 | `/design:system` | Define design primitives and tokens | `01-discover.md` + `02-flows.md` + `03-structure.md` | `04-system.md` — Spacing scale, type scale, color logic, semantic tokens | Token swatches, type scale specimens in Paper |
| 5 | `/design:expression` | Apply brand and visual identity | `01-discover.md` + `03-structure.md` + `04-system.md` | `05-expression.md` — Brand decisions, color palette rationale, motion values | Branded designs in Paper (layout-accurate, may need manual polish) |
| 6 | `/design:validate` | Check against reality | All previous artifacts | `06-validate.md` — Validation checklist, accessibility audit, metrics to watch | None |
| 7 | `/design:govern` | Define maintenance and evolution rules | All previous artifacts | `07-govern.md` — Governance rules, token evolution policy, deprecation process | None |

Additionally, a utility command `/design:track <name>` manages tracks:
- **No `.concinnitas/` directory exists:** Creates it and the named track. Equivalent to starting fresh.
- **Track already exists:** Switches the active session to that track.
- **Track doesn't exist but `.concinnitas/` does:** Creates a new track subdirectory with a fresh manifest.
- **No arguments:** Lists all tracks and shows which is active.

When `/design:discover` runs with no active track set, it asks for a track name (defaulting to `"main"` for the first track).

### File Structure

```
.concinnitas/
  .active                        # Contains the active track name (e.g., "onboarding")
  <track-name>/                  # e.g., "onboarding", "dashboard-redesign"
    manifest.yaml                # Tracks state: current phase, completion status, timestamps
    01-discover.md
    02-flows.md
    03-structure.md
    04-system.md
    05-expression.md
    06-validate.md
    07-govern.md
```

The `.active` file persists the current track across conversations. When only one track exists, it's always active regardless of this file.

### Manifest Format

```yaml
track: "onboarding"
created: 2026-02-28
current_phase: 3
visual_target: paper  # auto-detected: paper | none (figma reserved for future)
phases:
  1-discover:
    status: completed    # pending | in_progress | completed
    completed_at: 2026-02-28T14:30:00Z
  2-flows:
    status: completed
    completed_at: 2026-02-28T15:45:00Z
  3-structure:
    status: in_progress
    started_at: 2026-02-28T16:00:00Z
  4-system:
    status: pending
  5-expression:
    status: pending
  6-validate:
    status: pending
  7-govern:
    status: pending
```

### Skill File Organization

```
skills/
  design-track/
    SKILL.md             # Track management: create, switch, list
  design-discover/
    SKILL.md             # Full workflow for phase 1
  design-flows/
    SKILL.md
  design-structure/
    SKILL.md
  design-system/
    SKILL.md
  design-expression/
    SKILL.md
  design-validate/
    SKILL.md
  design-govern/
    SKILL.md
```

Each SKILL.md contains:
1. Trigger description (when to load this skill)
2. Pre-conditions (which previous artifacts must exist)
3. Conversational workflow (questions to ask, in what order)
4. Artifact template (what the output file looks like)
5. Paper.design integration instructions (what to render visually, if applicable)
6. Manifest update instructions (how to update state)

### Interaction Model

Each command follows this pattern:

1. **Check state** — Read manifest. Verify prerequisites are met. If previous phase isn't complete, warn and offer to run it first.
2. **Load context** — Read relevant previous artifacts as input.
3. **Guided conversation** — Ask questions one at a time, with suggested options but always allowing free-form answers. Use the AskUserQuestion pattern.
4. **Synthesize** — Once enough information is gathered, produce the text artifact.
5. **Visual output** — If Paper.design MCP is available and this phase has visual output, render to the canvas.
6. **Update state** — Mark phase as completed in manifest.
7. **Handoff** — Suggest the next phase command.

### Paper.design Integration

Visual output is produced at phases 3, 4, and 5 when the Paper MCP is available:

- **Phase 3 (Structure):** Create artboards with grayscale wireframes using `create_artboard` and `write_html`. Focus on layout, hierarchy, spacing — no color, no brand.
- **Phase 4 (System):** Create a design tokens reference sheet — spacing scale visualization, type scale specimens, color swatches with semantic names, using `write_html` and `update_styles`.
- **Phase 5 (Expression):** Apply the design system to the wireframes — color, typography, motion values. Transform grayscale structures into branded designs. Note: v1 visual output will be layout-accurate and token-correct, but may need manual refinement for production polish.

If Paper MCP is not available, the commands still work — they just produce text artifacts and note that visual output was skipped.

## Key Decisions

- **One command per phase (7 total):** Keeps each command focused and allows re-running individual phases. No pipeline command for v1 — the user drives progression manually.
- **Text artifacts as backbone:** Every phase produces a markdown file. This ensures the process works without any visual tool and creates a readable design decision trail.
- **File-based state with manifest:** A `manifest.yaml` tracks progress. The AI reads and writes this file. Simple enough to be reliable, structured enough to prevent confusion.
- **Conversational with flexibility:** The AI guides with multiple-choice questions but always allows custom answers. No rigid forms.
- **Paper.design first, Figma later:** Paper's read-write MCP and HTML/CSS canvas make it the natural first target. Figma support can be added as an alternative visual target.
- **OpenCode first, Claude Code later:** Focus on one platform's skill format. Claude Code custom commands (`.claude/commands/`) can be added as a separate build target.
- **Graceful degradation:** If no visual tool MCP is available, text-only mode works fully. Visual output enriches but never blocks.
- **Both standalone and per-project:** Can be installed globally (standalone design work) or per-project (designing that project's UI).
- **Explicit track switching:** `/design:track <name>` manages tracks — creates new ones, switches between existing ones, lists all tracks. `/design:discover` asks for a track name when no active track is set. Default track name is `"main"`. Active track persists across conversations via `.concinnitas/.active` file.
- **Auto-detected visual target:** The AI checks for Paper MCP availability at the start of visual phases. No manual configuration needed — `visual_target` in the manifest is set automatically.

## Resolved Questions

1. **Phase re-entry:** Re-running a completed phase does NOT overwrite or version. Instead, the AI informs the user the artifact already exists and recommends proceeding to the next phase. It also offers to review the current phase's output for failures or gaps. Recommended action: move forward.
2. **Multiple design tracks:** Subdirectories per track. E.g., `.concinnitas/onboarding/` and `.concinnitas/dashboard/`, each with its own manifest and artifacts. The track name is set when `/design:discover` first runs.
3. **Initialization:** Implicit. `/design:discover` creates the `.concinnitas/<track>/` directory and manifest if they don't exist. No separate init command.
4. **Phase skipping:** Phases 1-3 (Discover, Flows, Structure) are required and strictly sequential. Phases 4-7 (System, Expression, Validate, Govern) can be skipped or run in flexible order, though the AI will warn about missing context from skipped phases.
5. **Track selection:** `/design:track <name>` creates/switches tracks. `/design:discover` asks for track name when none is active. Default is `"main"`. Single-track projects don't need to think about tracks at all.
6. **Visual target auto-detection:** Paper MCP availability is checked automatically at visual phases. No user configuration needed.

## Open Questions

None — all questions resolved during brainstorming.

## Next Steps

-> `/workflows:plan` for implementation details
