---
name: design-system
description: Phase 4 of the concinnitas design process — define design primitives, tokens, spacing scales, typography, color logic, and semantic naming. Produces a complete design token specification. Use when running /design:system after structure is designed.
disable-model-invocation: true
---

# Phase 4: System — Design the Primitives

Instead of designing one screen, design decisions. Define spacing rules, typography scales, color logic. Define primitives first: how many steps in the spacing scale, what contrast ratios we guarantee, what motion durations feel coherent. These are not visual choices — they're constraints that create consistency.

From those primitives, create meaning. Background colors aren't just blue or gray — they become `background-primary` or `surface-elevated`. Text isn't black — it's `text-default` or `text-muted`. The system stops being visual and starts being semantic.

## Pre-flight

1. Read `.concinnitas/.active` to find the active track.
2. If no active track: "No active design track. Run `/design:track <name>` first."
3. Read `manifest.yaml`.
4. **Check prerequisites:** Phases 1-3 (`1-discover`, `2-flows`, `3-structure`) must be `completed`. If any are missing:
   - Tell the user which phases are incomplete.
   - Stop here.
5. If `4-system` is `completed`:
   - Inform user, show summary of `04-system.md`.
   - Offer: **Proceed to expression (recommended)** or **Review system tokens**.
   - Stop here.
6. Update manifest: set `4-system.status` to `in_progress`.

## Context

Read these artifacts:
- `.concinnitas/<track>/01-discover.md` — for brand constraints and user context
- `.concinnitas/<track>/02-flows.md` — for states and variations that tokens need to support
- `.concinnitas/<track>/03-structure.md` — for the layout decisions that tokens must serve

## Conversation

### Question 1: Spacing Scale
"Let's define the spacing foundation. How many steps should the spacing scale have?"
- Options:
  - **4-step minimal** (4, 8, 16, 32) — for simple, focused interfaces
  - **8-step standard** (2, 4, 8, 12, 16, 24, 32, 48) — most products
  - **12-step comprehensive** (2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64) — complex dashboards
- Allow custom answer
- Follow up: "What base unit? 4px or 8px?"

### Question 2: Typography Scale
"How many text sizes do we need? Consider the views from the structure phase."
- Options:
  - **5 sizes** (xs, sm, base, lg, xl) — simple interfaces
  - **7 sizes** (xs, sm, base, lg, xl, 2xl, 3xl) — most products
  - **10 sizes** (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, display) — content-heavy or marketing
- Allow custom answer

### Question 3: Type Scale Ratio
"What mathematical ratio should the type scale follow?"
- Options:
  - **1.125 (Minor Second)** — subtle, dense UIs
  - **1.200 (Minor Third)** — balanced, most UIs
  - **1.250 (Major Third)** — clear hierarchy, marketing
  - **1.333 (Perfect Fourth)** — bold hierarchy, editorial
- Allow custom answer
- Show calculated sizes for each option based on a 16px base

### Question 4: Color Hues
"How many primary hues does this product need?"
- Options:
  - **1 (Monochrome)** — single brand color + neutrals
  - **2-3 (Standard)** — primary + secondary + accent
  - **4+ (Complex)** — multi-brand, data visualization, categorization
- Allow custom answer
- Follow up: "Do you have specific brand colors in mind, or should I propose a palette?"

### Question 5: Color Scale Depth
"For each hue, how many shade steps?"
- Options:
  - **5 steps** (100, 300, 500, 700, 900) — simple
  - **10 steps** (50, 100, 200, 300, 400, 500, 600, 700, 800, 900) — standard
  - **13 steps** (50-950 in 50/100 increments) — comprehensive
- Default recommendation: 10 steps

### Question 6: Contrast Requirements
"What contrast ratio minimum should we guarantee?"
- Options:
  - **AA (4.5:1)** — standard web compliance
  - **AAA (7:1)** — maximum accessibility
- Allow custom answer

### Question 7: Motion Tokens
"Does this product need motion/animation tokens?"
- Options:
  - **Yes, minimal** — fast (150ms), normal (300ms), slow (500ms)
  - **Yes, comprehensive** — full duration + easing system
  - **No** — static interface, no animations
- Allow custom answer

### Question 8: Semantic Naming Convention
"I recommend this naming pattern for semantic tokens: `[category]-[variant]`. For example:

- Colors: `background-primary`, `text-muted`, `border-subtle`, `surface-elevated`
- Spacing: `space-1` through `space-N`
- Typography: `text-xs` through `text-display`
- Radius: `radius-sm`, `radius-md`, `radius-lg`

Does this convention work, or do you prefer a different pattern?"
- Options: This convention works, I prefer a different pattern
- If different: ask them to describe their preferred convention

## Synthesis

1. Calculate all token values based on the chosen scales and ratios.
2. Draft the system document with concrete values (not placeholders).
3. Verify contrast ratios for all text/background combinations.
4. Present summary for confirmation.
5. Write to `.concinnitas/<track>/04-system.md`.

### Artifact Template

```markdown
# Design System Primitives

## Foundation

- **Base unit:** [4px/8px]
- **Type base size:** [16px]
- **Type scale ratio:** [ratio]
- **Contrast minimum:** [AA/AAA]

## Spacing Scale

| Token | Value | Rem | Usage |
|-------|-------|-----|-------|
| `space-1` | [px] | [rem] | Tight internal padding |
| `space-2` | [px] | [rem] | Default internal padding |
| `space-3` | [px] | [rem] | Related element gaps |
...

## Typography Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | [px/rem] | [value] | [weight] | Captions, labels |
| `text-sm` | [px/rem] | [value] | [weight] | Secondary text |
| `text-base` | [px/rem] | [value] | [weight] | Body text |
...

## Color Primitives

### [Hue Name] (e.g., Blue)
| Step | Hex | Usage |
|------|-----|-------|
| 50 | [hex] | Lightest background |
| 100 | [hex] | Hover backgrounds |
...
| 900 | [hex] | Darkest text/accent |

### Neutral
| Step | Hex | Usage |
|------|-----|-------|
| 50 | [hex] | Page background |
...

## Semantic Color Tokens

| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `background-primary` | [hex] | [hex] | Main page background |
| `background-secondary` | [hex] | [hex] | Card/section backgrounds |
| `surface-elevated` | [hex] | [hex] | Modals, popovers |
| `text-default` | [hex] | [hex] | Primary text |
| `text-muted` | [hex] | [hex] | Secondary/helper text |
| `text-inverse` | [hex] | [hex] | Text on dark backgrounds |
| `border-default` | [hex] | [hex] | Standard borders |
| `border-subtle` | [hex] | [hex] | Soft dividers |
| `interactive-primary` | [hex] | [hex] | Buttons, links |
| `interactive-hover` | [hex] | [hex] | Hover state |
| `status-success` | [hex] | [hex] | Success indicators |
| `status-warning` | [hex] | [hex] | Warning indicators |
| `status-error` | [hex] | [hex] | Error indicators |
| `status-info` | [hex] | [hex] | Informational |

## Contrast Verification

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| `text-default` on `background-primary` | [ratio] | [AA/AAA] |
| `text-muted` on `background-primary` | [ratio] | [AA/AAA] |
| `text-inverse` on `interactive-primary` | [ratio] | [AA/AAA] |
...

## Motion Tokens (if applicable)

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `duration-fast` | [ms] | [curve] | Micro-interactions, toggles |
| `duration-normal` | [ms] | [curve] | Standard transitions |
| `duration-slow` | [ms] | [curve] | Page transitions, complex animations |

## Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | [px] | Inputs, small cards |
| `radius-md` | [px] | Cards, containers |
| `radius-lg` | [px] | Modals, large surfaces |
| `radius-full` | 9999px | Avatars, pills |

## Shadow / Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | [CSS shadow] | Subtle lift, cards |
| `shadow-md` | [CSS shadow] | Popovers, dropdowns |
| `shadow-lg` | [CSS shadow] | Modals, dialogs |
```

## Visual Output — Paper.design

**Check for Paper MCP availability.**

### If Paper MCP is available:

Create a design tokens reference sheet:

1. **Spacing artboard:** Call `create_artboard` ("Tokens — Spacing"). Use `write_html` to render boxes at each spacing value, labeled with token name and pixel value. Visual representation of the scale.

2. **Typography artboard:** Call `create_artboard` ("Tokens — Typography"). Render each text size as a specimen line:
   ```
   text-xs (12px/1.5) — The quick brown fox jumps over the lazy dog
   text-sm (14px/1.5) — The quick brown fox jumps over the lazy dog
   ...
   ```

3. **Color artboard:** Call `create_artboard` ("Tokens — Color"). Render:
   - Hue ramps as horizontal strips of colored squares
   - Semantic token pairs (light + dark value) with labels
   - Contrast ratio indicators (checkmarks for passing, X for failing)

4. **Use actual CSS custom properties** in the HTML so the token values are embedded in the design file.

### If Paper MCP is not available:

Note: "Token reference sheets were not generated visually (Paper.design not connected). The specification above contains all token values. Connect Paper.design MCP to generate visual token sheets."

## State Update

1. Update `manifest.yaml`:
   - Set `4-system.status` to `completed`
   - Set `4-system.completed_at` to current ISO timestamp
   - Set `current_phase` to `5`
2. Tell the user: "Design system primitives defined. Run `/design:expression` to apply brand and visual identity."
