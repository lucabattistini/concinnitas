---
name: design-track
description: Manage concinnitas design tracks — create, switch, and list design process tracks. Use when running /design:track, managing multiple design processes in one project, or switching between design tracks.
disable-model-invocation: true
argument-hint: [track-name]
---

# Design Track Management

Manage design process tracks within the `.concinnitas/` directory. Each track is an independent design process with its own manifest and artifacts.

## Workflow

### Step 1: Parse Arguments

- If `$ARGUMENTS` is empty → **List mode**
- If `$ARGUMENTS` is provided → **Create/Switch mode** with track name = `$ARGUMENTS`

### Step 2: List Mode (no arguments)

1. Check if `.concinnitas/` directory exists
2. If it doesn't exist:
   - Tell the user: "No design tracks found. Run `/design:track <name>` to create one, or `/design:discover` to start a new design process."
   - Stop here.
3. If it exists, list all subdirectories (excluding `.active`)
4. Read `.concinnitas/.active` to find the current active track
5. Display tracks in a table:

```
Design Tracks:
  * onboarding (active) — Phase 3/7: structure [in_progress]
    dashboard-redesign — Phase 1/7: discover [completed]
```

For each track, read its `manifest.yaml` to show current phase and status.

### Step 3: Create/Switch Mode (with argument)

Track name = `$ARGUMENTS`. Sanitize: lowercase, replace spaces with hyphens, remove special characters.

1. Check if `.concinnitas/` directory exists. Create it if not.

2. Check if `.concinnitas/<track-name>/` exists:

   **If track exists → Switch:**
   - Write the track name to `.concinnitas/.active`
   - Read the track's `manifest.yaml`
   - Display: "Switched to track '<track-name>'. Current phase: [phase] ([status])."
   - Suggest the appropriate next command based on manifest state.

   **If track doesn't exist → Create:**
   - Create `.concinnitas/<track-name>/` directory
   - Write the track name to `.concinnitas/.active`
   - Create `manifest.yaml` with this content:

```yaml
track: "<track-name>"
created: <current ISO date>
current_phase: 1
visual_target: none
phases:
  1-discover:
    status: pending
  2-flows:
    status: pending
  3-structure:
    status: pending
  4-system:
    status: pending
  5-expression:
    status: pending
  6-validate:
    status: pending
  7-govern:
    status: pending
```

   - Display: "Created track '<track-name>'. Run `/design:discover` to begin the design process."
