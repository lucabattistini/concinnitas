---
date: 2026-02-28
topic: design-process-plugin
brainstorm: docs/brainstorms/2026-02-28-design-process-plugin-brainstorm.md
---

# Implementation Plan: Concinnitas Design Process Plugin

## Overview

Create 8 OpenCode skill files that implement concinnitas — a structured, 7-phase design process run as slash commands in the AI chat. Each phase guides the user through design decisions conversationally, producing text artifacts (and optional Paper.design visual output) that chain into the next phase.

## Implementation Order

Skills are built in dependency order. The track utility comes first (all phases depend on it), then phases 1-7 sequentially (each phase's skill needs to reference the artifact templates of earlier phases to validate inputs).

## Task Breakdown

### Task 1: `design-track` — Track Management Utility

**File:** `skills/design-track/SKILL.md`

**Purpose:** Create, switch, and list design tracks. Manages `.concinnitas/` directory and `.active` file.

**Behavior:**
- `/design:track` (no args) → List all tracks, highlight active one
- `/design:track <name>` → If track exists, switch to it. If not, create it with fresh manifest.
- Creates `.concinnitas/` directory if it doesn't exist
- Writes/updates `.concinnitas/.active` file
- Creates `<track>/manifest.yaml` with all phases set to `pending`

**Key details:**
- `disable-model-invocation: true` — manual workflow
- `argument-hint: [track-name]`
- Must handle: no `.concinnitas/` dir, empty `.concinnitas/`, single track, multiple tracks

---

### Task 2: `design-discover` — Phase 1: Understand the Problem

**File:** `skills/design-discover/SKILL.md`

**Purpose:** Deep problem understanding through guided conversation. Outputs a problem brief.

**Pre-conditions:** None (this is the entry point). Creates track if needed.

**Conversational workflow (questions the AI asks, one at a time):**
1. What is the product/feature you're designing? (open-ended)
2. Who are the primary users? What's their context? (options: internal team, consumers, enterprise, developers, or custom)
3. What's broken or frustrating today? What's the specific pain? (open-ended)
4. What business pressure is driving this? (options: growth, retention, efficiency, new market, technical debt, or custom)
5. What constraints are we operating in? (options: timeline, budget, tech stack, team size, legacy systems, or custom — multiple select)
6. What does success look like? How will we know this worked? (open-ended)
7. Who are the stakeholders? What are their conflicting priorities? (open-ended)
8. Is there anything you've already tried or ruled out? (open-ended)

**Artifact template:** `01-discover.md`
```markdown
# Discovery Brief

## Problem Statement
[1-2 sentence sharp articulation of the core problem]

## Business Context
- **Driver:** [what's driving this]
- **Impact:** [what happens if we don't solve it]
- **Timeline:** [urgency level]

## Users
- **Primary:** [who they are, what they need]
- **Context:** [when/where/how they encounter this]
- **Current pain:** [specific frustrations]

## Constraints
- [constraint 1]
- [constraint 2]

## Success Criteria
- [measurable outcome 1]
- [measurable outcome 2]

## Stakeholder Alignment
- [stakeholder 1]: [their priority]
- [stakeholder 2]: [their priority]

## What's Been Tried / Ruled Out
- [approach]: [why it didn't work/was rejected]
```

**Re-entry behavior:** If `01-discover.md` exists, inform user it's already complete. Recommend `/design:flows`. Offer to review the discovery brief for gaps.

**Manifest update:** Set `1-discover.status` to `completed`, record `completed_at`.

---

### Task 3: `design-flows` — Phase 2: Map User Journeys

**File:** `skills/design-flows/SKILL.md`

**Pre-conditions:** `01-discover.md` must exist.

**Context loading:** Read `01-discover.md` before starting conversation.

**Conversational workflow:**
1. Based on the discovery brief, I see [summary]. The core user journey starts with [inferred entry point]. Does that sound right? (confirm/adjust)
2. What is the user's primary goal — the one thing they're trying to accomplish? (open-ended)
3. Walk me through the happy path: what are the key steps from start to success? (open-ended)
4. What happens when things go wrong? Let's map the failure states. (guided: for each step, ask "what could fail here?")
5. Are there branching paths? Different user types who take different routes? (open-ended)
6. What are the edge cases — rare but important scenarios? (open-ended)
7. Where might the user hesitate, get confused, or abandon the flow? (open-ended)
8. What happens after success? Is there a follow-up action or confirmation? (open-ended)

**Artifact template:** `02-flows.md`
```markdown
# User Flows

## Primary Goal
[What the user is ultimately trying to achieve]

## Happy Path
1. **[Step name]** — [description]
2. **[Step name]** — [description]
...

## Error States
| Step | Failure | Recovery | Impact |
|------|---------|----------|--------|
| [step] | [what goes wrong] | [how we handle it] | [severity] |

## Branching Paths
### [User type / condition]
- [how their path differs]

## Edge Cases
- **[case]:** [description and how we handle it]

## Friction Points
- **[point]:** [why user might hesitate, and mitigation]

## Post-Success
- [what happens after the user succeeds]
```

**Manifest update:** Set `2-flows.status` to `completed`.

---

### Task 4: `design-structure` — Phase 3: Design Hierarchy and Layout

**File:** `skills/design-structure/SKILL.md`

**Pre-conditions:** `01-discover.md` and `02-flows.md` must exist.

**Context loading:** Read both previous artifacts.

**Conversational workflow:**
1. Based on the flows, the key screens/views seem to be: [inferred list]. Does that match? (confirm/adjust)
2. For [screen 1]: what's the most important thing on this screen? What should the user see first? (open-ended)
3. What's the information hierarchy? Rank these elements by importance: [list inferred elements] (ranking exercise)
4. How does the user navigate between views? (options: tabs, sidebar, breadcrumbs, modal, wizard/stepper, or custom)
5. Is this a dense interface (dashboard, admin) or a focused one (single-task, wizard)? (options with descriptions)
6. What interaction patterns make sense? (options: forms, drag-and-drop, inline editing, cards, lists, tables, or custom — multiple select)
7. If this interface were grayscale and ugly, would the structure still make sense? What would break? (open-ended — this is the key structural test)

**Artifact template:** `03-structure.md`
```markdown
# Information Structure

## Views / Screens
### [View name]
- **Purpose:** [what this view does]
- **Primary element:** [most important thing]
- **Information hierarchy:**
  1. [highest priority]
  2. [next]
  3. [next]
- **Interaction patterns:** [how user interacts]

## Navigation Model
- **Pattern:** [tabs/sidebar/breadcrumbs/etc.]
- **Flow:** [how views connect]

## Layout Logic
- **Density:** [dense/focused/mixed]
- **Key structural decisions:**
  - [decision 1]: [rationale]
  - [decision 2]: [rationale]

## Structural Validation
- [ ] Information hierarchy is correct without visual styling
- [ ] Navigation flow matches user journey
- [ ] Cognitive load is reasonable
- [ ] Edge case flows are accommodated
```

**Paper.design integration:**
If Paper MCP is available:
1. Call `find_placement` to find open canvas space
2. Call `create_artboard` for each view (name: "Structure — [View name]", width: 1440, height: auto)
3. Call `write_html` with grayscale wireframe HTML — only `#000`, `#333`, `#666`, `#999`, `#ccc`, `#f5f5f5`, `#fff`. No brand colors. System fonts only. Focus on layout blocks, text hierarchy, and spatial relationships.
4. Call `start_working_on_nodes` / `finish_working_on_nodes` to show progress

**Manifest update:** Set `3-structure.status` to `completed`.

---

### Task 5: `design-system` — Phase 4: Design Primitives and Tokens

**File:** `skills/design-system/SKILL.md`

**Pre-conditions:** `01-discover.md`, `02-flows.md`, `03-structure.md` must exist.

**Context loading:** Read all three previous artifacts.

**Conversational workflow:**
1. Looking at the structure, I need to define the foundational design primitives. Let's start with spacing. How many steps should the spacing scale have? (options: 4-step minimal, 8-step standard, 12-step comprehensive, or custom)
2. What base unit for spacing? (options: 4px, 8px, or custom)
3. Typography: how many text sizes do we need? (options: 5 minimal, 7 standard, 10 comprehensive — with examples)
4. What type scale ratio? (options: 1.125 minor second, 1.200 minor third, 1.250 major third, 1.333 perfect fourth, or custom)
5. Color: how many primary hues does this product need? (options: 1 monochrome, 2-3 standard, 4+ complex)
6. What contrast ratio minimum? (options: AA 4.5:1, AAA 7:1)
7. Do we need motion/animation tokens? (options: yes minimal, yes comprehensive, no)
8. Let me propose the semantic naming convention. Colors will follow `[category]-[property]-[variant]` (e.g., `background-primary`, `text-muted`, `border-subtle`). Does this naming convention work? (confirm/adjust)

**Artifact template:** `04-system.md`
```markdown
# Design System Primitives

## Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | [value] | [when to use] |
| `space-2` | [value] | [when to use] |
...

## Typography Scale
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | [size] | [weight] | [lh] | [usage] |
...

## Color Primitives
### Palette
| Hue | Scale | Values |
|-----|-------|--------|
| [hue] | 50-950 | [hex values] |
...

### Semantic Tokens
| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `background-primary` | [value] | [value] | [usage] |
| `text-default` | [value] | [value] | [usage] |
...

## Contrast Ratios
- Minimum: [AA/AAA]
- `text-default` on `background-primary`: [ratio] ✓/✗
...

## Motion Tokens (if applicable)
| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `duration-fast` | [ms] | [curve] | [usage] |
...

## Border & Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | [value] | [usage] |
...
```

**Paper.design integration:**
If Paper MCP is available:
1. Create artboard "Design Tokens — Spacing" with visual spacing scale (boxes at each size)
2. Create artboard "Design Tokens — Typography" with type specimens at each scale step
3. Create artboard "Design Tokens — Color" with palette swatches and semantic color mappings
4. Use `write_html` with actual token values as CSS custom properties

**Manifest update:** Set `4-system.status` to `completed`.

---

### Task 6: `design-expression` — Phase 5: Brand and Visual Identity

**File:** `skills/design-expression/SKILL.md`

**Pre-conditions:** `01-discover.md`, `03-structure.md`, `04-system.md` must exist.

**Context loading:** Read discovery, structure, and system artifacts.

**Conversational workflow:**
1. Now we layer brand expression onto the structural foundation. What adjectives describe the brand personality? (options: professional/trustworthy, playful/friendly, bold/edgy, minimal/clean, warm/approachable, technical/precise, or custom — multiple select)
2. Do you have existing brand assets? (options: full brand guide, logo + colors only, nothing yet, or custom)
3. Primary typeface preference? (options: geometric sans, humanist sans, serif, monospace, display/decorative, or provide specific font name)
4. Color mood: which direction? (based on system tokens — show the palette and ask how to apply brand feeling)
5. Imagery and iconography style? (options: photography, illustration, icons only, abstract/geometric, none, or custom)
6. How should motion feel? (options: snappy/efficient, smooth/elegant, playful/bouncy, minimal/subtle, or custom)
7. What's the one visual element that should make this instantly recognizable? (open-ended)

**Artifact template:** `05-expression.md`
```markdown
# Design Expression

## Brand Personality
- **Adjectives:** [list]
- **Voice:** [how the brand speaks]
- **Visual signature:** [the one recognizable element]

## Typography Application
- **Primary font:** [font] — used for [where]
- **Secondary font:** [font] — used for [where]
- **Application to scale:** [how the type scale maps to brand fonts]

## Color Application
- **Brand primary:** [token mapping] → [emotional intent]
- **Brand secondary:** [token mapping] → [emotional intent]
- **Accent usage rules:** [when/where accents appear]

## Imagery & Iconography
- **Style:** [description]
- **Rules:** [guidelines for consistency]

## Motion Language
- **Feel:** [description]
- **Key transitions:** [where motion matters most]
- **Token application:** [which motion tokens for which interactions]

## Applied Examples
### [View/screen from structure]
- [How tokens, typography, and color come together in this view]
```

**Paper.design integration:**
If Paper MCP is available:
1. Read existing structure artboards via `get_children` and `get_jsx`
2. Create new artboards "Expression — [View name]" for each structured view
3. Apply the design system tokens via `write_html` with full CSS custom properties — colors, typography, spacing all using the defined tokens
4. Use `update_styles` to refine styling after initial HTML write
5. This is the most visually rich output — the result should look like a designed product, not a wireframe

**Manifest update:** Set `5-expression.status` to `completed`.

---

### Task 7: `design-validate` — Phase 6: Validate Against Reality

**File:** `skills/design-validate/SKILL.md`

**Pre-conditions:** At minimum, `01-discover.md` and `03-structure.md` must exist. Warns if other artifacts are missing.

**Context loading:** Read all existing artifacts.

**Conversational workflow:**
1. Let's validate the design against reality. Starting with the discovery brief — does the design still solve the original problem? (guided review)
2. Accessibility check: based on the system tokens, are contrast ratios met? Are touch targets adequate? Is keyboard navigation considered? (systematic check)
3. Let's walk through each flow from phase 2. For each step, does the structure support it? (guided walkthrough)
4. Performance considerations: are there heavy patterns (large images, complex animations, many components on screen)? (open-ended)
5. Edge cases from phase 2: does the design handle each one? (checklist review)
6. Engineering feasibility: are there design decisions that would be difficult or expensive to implement? (open-ended)
7. What metrics should we track to validate this design post-launch? (options: task completion rate, time on task, error rate, NPS, conversion rate, or custom — multiple select)

**Artifact template:** `06-validate.md`
```markdown
# Design Validation

## Problem Alignment
- **Original problem:** [from discovery]
- **Design addresses it:** ✓/✗ [explanation]

## Accessibility Audit
| Check | Status | Notes |
|-------|--------|-------|
| Color contrast (AA/AAA) | ✓/✗ | [details] |
| Touch target sizes (44px min) | ✓/✗ | [details] |
| Keyboard navigation | ✓/✗ | [details] |
| Screen reader compatibility | ✓/✗ | [details] |
| Motion sensitivity (prefers-reduced-motion) | ✓/✗ | [details] |

## Flow Validation
| Flow | Steps Covered | Gaps |
|------|--------------|------|
| [happy path] | ✓/✗ | [missing] |
| [error flow] | ✓/✗ | [missing] |

## Edge Case Coverage
| Edge Case | Handled | How |
|-----------|---------|-----|
| [case] | ✓/✗ | [approach] |

## Engineering Feasibility
- **Straightforward:** [list of easy-to-build elements]
- **Challenging:** [list of complex elements and why]
- **Recommendations:** [simplifications if needed]

## Post-Launch Metrics
| Metric | Target | How to Measure |
|--------|--------|---------------|
| [metric] | [target] | [method] |
```

**Manifest update:** Set `6-validate.status` to `completed`.

---

### Task 8: `design-govern` — Phase 7: Protect the System

**File:** `skills/design-govern/SKILL.md`

**Pre-conditions:** At minimum, `04-system.md` must exist. Most useful when all phases are complete.

**Context loading:** Read all existing artifacts, especially `04-system.md`.

**Conversational workflow:**
1. The design system is defined. Now we protect it. How should token changes be proposed? (options: PR/review process, design team approval, documented RFC, or custom)
2. When should a component be deprecated vs. updated? (guided discussion)
3. How do we handle requests for one-off variations? (options: never — find a token, allow with review, create variant tokens, or custom)
4. Who owns the design system? (options: design team, engineering team, shared ownership, dedicated DS team, or custom)
5. How often should the system be audited for consistency? (options: quarterly, bi-annually, continuously via linting, or custom)
6. How do we ensure naming in design matches naming in code? (open-ended)
7. What's the process for adding a new component to the system? (open-ended)

**Artifact template:** `07-govern.md`
```markdown
# Design System Governance

## Change Process
- **Token changes:** [process]
- **Component changes:** [process]
- **Breaking changes:** [process]

## Ownership
- **Owner:** [who]
- **Contributors:** [who can propose changes]
- **Approvers:** [who signs off]

## Rules
- **One-off variations:** [policy]
- **Deprecation criteria:** [when to deprecate vs. update]
- **Naming convention enforcement:** [how design ↔ code naming stays in sync]

## New Component Process
1. [step 1]
2. [step 2]
...

## Audit Schedule
- **Frequency:** [how often]
- **Scope:** [what gets audited]
- **Tooling:** [any automated checks]

## Token Evolution
- **Versioning:** [how tokens are versioned]
- **Migration:** [how consumers update when tokens change]
- **Communication:** [how changes are announced]
```

**Manifest update:** Set `7-govern.status` to `completed`.

---

## Shared Patterns Across All Skills

Each SKILL.md follows this structure:

```markdown
---
name: design-[phase]
description: [what + when trigger]
disable-model-invocation: true
argument-hint: [if applicable]
---

# Phase [N]: [Title]

## Pre-flight
1. Read `.concinnitas/.active` to find active track
2. If no active track and only one exists, use it
3. If no active track and multiple exist, ask user to run `/design:track <name>`
4. Read `manifest.yaml` from the active track
5. Check prerequisites (previous phase artifacts exist)
6. If this phase is already completed, inform user and offer: proceed to next phase (recommended) or review current output

## Context
Read the following artifacts as input:
- [list of required artifacts]

## Conversation
[Phase-specific questions, one at a time, with suggested options + custom input]

## Synthesis
When enough information is gathered:
1. Draft the artifact text
2. Present a summary to the user for confirmation
3. Write the artifact file to `.concinnitas/<track>/[NN]-[phase].md`

## Visual Output (phases 3, 4, 5 only)
If Paper MCP is available:
[Phase-specific Paper.design instructions]

If Paper MCP is not available:
Note that visual output was skipped. Text artifact is complete.

## State Update
1. Update `manifest.yaml`: set phase status to `completed`, record `completed_at`
2. Suggest the next phase: "Run `/design:[next-phase]` to continue"
```

## Verification

After all skills are written:
1. Verify each skill file has valid YAML frontmatter
2. Verify each skill references the correct prerequisite artifacts
3. Verify the artifact templates are consistent (all use markdown, all have clear section headers)
4. Verify Paper.design MCP tool references match the actual Paper MCP API (tools: `find_placement`, `create_artboard`, `write_html`, `update_styles`, `get_children`, `get_jsx`, `start_working_on_nodes`, `finish_working_on_nodes`)
5. Test by running `/design:track main` followed by `/design:discover` in a real OpenCode session
