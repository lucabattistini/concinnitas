---
name: design-structure
description: Phase 3 of the concinnitas design process — design information hierarchy, layout logic, and interaction patterns. Produces structural specifications and optional grayscale wireframes in Paper.design. Use when running /design:structure after flows are mapped.
disable-model-invocation: true
---

# Phase 3: Structure — Design Hierarchy and Layout

Still no colors. No brand vibes. Just hierarchy and logic. If this interface were grayscale and ugly, would it still make sense? Is the information ordered properly? Is the interaction predictable? Is the cognitive load reasonable?

## Pre-flight

1. Read `.concinnitas/.active` to find the active track.
2. If no active track: "No active design track. Run `/design:track <name>` or `/design:discover` first."
3. Read `manifest.yaml`.
4. **Check prerequisites:** Both `1-discover` and `2-flows` must be `completed`. If not:
   - Tell the user which phases are missing and suggest running them first.
   - Stop here.
5. If `3-structure` is `completed`:
   - Inform user, show summary of `03-structure.md`.
   - Offer: **Proceed to system (recommended)** or **Review structure**.
   - Stop here.
6. Update manifest: set `3-structure.status` to `in_progress`.

## Context

Read these artifacts before starting:
- `.concinnitas/<track>/01-discover.md` — for constraints and user context
- `.concinnitas/<track>/02-flows.md` — for the flows that need structural support

## Conversation

### Question 1: Identify the Views
"Based on the flows, the key views/screens seem to be: [inferred list from 02-flows.md]. Each major step in the happy path likely needs its own view or section. Does this match, or should we add/remove any?"
- Present as a checklist. Allow additions and removals.

### Question 2: Primary Element per View
For each identified view, ask:
"On the [view name] view, what's the single most important element? What should the user's eye land on first?"
- Open-ended per view.

### Question 3: Information Hierarchy
For each view with multiple elements:
"Rank these elements by importance for the [view name] view:"
- Present the elements inferred from flows (form fields, status indicators, action buttons, data displays, navigation)
- Let the user drag/rank or number them

### Question 4: Navigation Pattern
"How does the user move between these views?"
- Options: Tab bar (horizontal), Sidebar navigation, Breadcrumb trail, Step-by-step wizard, Modal/overlay flow, Back/forward linear flow
- Allow custom answer

### Question 5: Interface Density
"Is this a dense information interface (dashboard, admin panel) or a focused single-task interface (checkout, onboarding wizard)?"
- Options: Dense — lots of information visible at once, Focused — one task at a time with minimal distraction, Mixed — some views are dense others are focused
- Allow custom answer
- Follow up: "What's the maximum number of actions visible at once on the densest view?"

### Question 6: Interaction Patterns
"What interaction patterns will the user encounter? Select all that apply."
- Options (multiple select): Forms and inputs, Data tables / lists, Cards / grid layout, Drag and drop, Inline editing, Search and filter, Modals / dialogs, Toast notifications, Expandable / collapsible sections
- Allow custom answer

### Question 7: The Grayscale Test
"Imagine this interface is rendered in pure grayscale — no colors, no brand, just boxes and text. Would the structure still make sense? What would be confusing?"
- Open-ended. This is the critical structural validation question.
- If the user identifies confusion: "How should we restructure to fix that?"

## Synthesis

1. Draft the structure document.
2. Present summary for confirmation.
3. Write to `.concinnitas/<track>/03-structure.md`.

### Artifact Template

```markdown
# Information Structure

## Views Overview

| View | Purpose | Primary Element | Density |
|------|---------|----------------|---------|
| [name] | [what it does] | [most important thing] | [dense/focused] |

## Detailed View Specifications

### [View Name]
**Purpose:** [what this view accomplishes]

**Information Hierarchy:**
1. [highest priority element] — [why it's first]
2. [next element] — [why it's here]
3. [next element] — [why it's here]

**Interaction Patterns:** [forms, tables, cards, etc.]

**User Actions:** [what the user can do on this view]

**Connects To:** [which views link to/from this one]

### [Next View...]
...

## Navigation Model
- **Pattern:** [tabs/sidebar/wizard/etc.]
- **Primary flow:** [view A → view B → view C]
- **Shortcuts:** [any direct jumps between non-adjacent views]

## Layout Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| [e.g., sidebar vs. top nav] | [choice] | [why] |
| [e.g., single column vs. two-column] | [choice] | [why] |

## Structural Validation
- [ ] Each flow step from Phase 2 has a corresponding view or section
- [ ] Information hierarchy makes sense without visual styling
- [ ] Navigation flow matches the user journey
- [ ] Cognitive load is reasonable per view
- [ ] Error states from Phase 2 have a place in the structure
- [ ] Edge cases are accommodated
```

## Visual Output — Paper.design

**Check for Paper MCP availability** by attempting to call `get_basic_info`. If it responds, Paper is available.

### If Paper MCP is available:

For each view in the structure:

1. **Find placement:** Call `find_placement` to get coordinates that avoid overlapping existing artboards.

2. **Create artboard:** Call `create_artboard` with:
   - Name: `"Structure — [View Name]"`
   - Width: `1440` (desktop) or appropriate width for the view type
   - Height: calculated based on content

3. **Write wireframe HTML:** Call `write_html` with grayscale wireframe markup.

   **Grayscale rules — strictly enforced:**
   - Colors: ONLY `#000`, `#333`, `#666`, `#999`, `#ccc`, `#e5e5e5`, `#f5f5f5`, `#fff`
   - Typography: system font stack only (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
   - No brand colors, no custom fonts, no decorative elements
   - Use `1px solid #ccc` borders for containers
   - Use background shades to show hierarchy (primary areas in `#fff`, secondary in `#f5f5f5`, tertiary in `#e5e5e5`)
   - Text sizes should reflect the information hierarchy (larger = more important)
   - Use placeholder text that describes the content, not lorem ipsum (e.g., "Product Title", "Price: $XX.XX")

   **Structural elements to include:**
   - Layout containers with proper flex/grid
   - Navigation regions
   - Content hierarchy with sized headings
   - Action buttons (as gray rectangles with labels)
   - Form inputs (as bordered rectangles)
   - Data display areas (tables, lists, cards)

4. **Show progress:** Call `start_working_on_nodes` before writing, `finish_working_on_nodes` after.

### If Paper MCP is not available:

Note in the output: "Visual wireframes were not generated (Paper.design not connected). The structural specification above fully describes the layout. Connect Paper.design MCP to generate visual wireframes."

## State Update

1. Update `manifest.yaml`:
   - Set `3-structure.status` to `completed`
   - Set `3-structure.completed_at` to current ISO timestamp
   - Set `current_phase` to `4`
   - Set `visual_target` to `paper` if Paper MCP was used, `none` if not
2. Tell the user: "Structure defined. Run `/design:system` to define design primitives and tokens."
