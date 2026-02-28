---
name: design-expression
description: Phase 5 of the concinnitas design process — apply brand expression, visual identity, typography, color, and motion to the structural foundation using design tokens. Produces branded design specifications and visual designs in Paper.design. Use when running /design:expression after the system is defined.
disable-model-invocation: true
---

# Phase 5: Expression — Apply Brand Identity

Now color feels intentional because it's tied to tokens. Typography feels cohesive because it follows a scale. Motion feels consistent because it uses shared timing values. Polish becomes refinement, not rescue.

## Pre-flight

1. Read `.concinnitas/.active` to find the active track.
2. If no active track: "No active design track. Run `/design:track <name>` first."
3. Read `manifest.yaml`.
4. **Check prerequisites:** `1-discover` and `3-structure` and `4-system` must be `completed`.
   - If `3-structure` is missing: "Structure (Phase 3) is required. Run `/design:structure` first."
   - If `4-system` is missing: "Design system (Phase 4) is required. Run `/design:system` first."
   - Note: Phase 5 can run without Phase 2 (flows), though the AI should note the gap.
5. If `5-expression` is `completed`:
   - Inform user, show summary.
   - Offer: **Proceed to validate (recommended)** or **Review expression**.
   - Stop here.
6. Update manifest: set `5-expression.status` to `in_progress`.

## Context

Read these artifacts:
- `.concinnitas/<track>/01-discover.md` — for brand constraints and audience
- `.concinnitas/<track>/03-structure.md` — for the views and hierarchy to apply expression to
- `.concinnitas/<track>/04-system.md` — for the token system to use

## Conversation

### Question 1: Brand Personality
"What adjectives best describe the brand personality? Select all that apply."
- Options (multiple select): Professional / trustworthy, Playful / friendly, Bold / edgy, Minimal / clean, Warm / approachable, Technical / precise, Luxurious / premium, Energetic / dynamic
- Allow custom answer

### Question 2: Existing Brand Assets
"Do you have existing brand assets we should work with?"
- Options: Full brand guide (colors, fonts, imagery guidelines), Logo and primary colors only, Rough color preferences but nothing formal, Starting from scratch
- If they have assets: ask them to describe or share the key elements (primary color, font preferences)

### Question 3: Primary Typeface
"Based on the brand personality and the type scale from Phase 4, what typeface direction?"
- Options: Geometric sans-serif (clean, modern — e.g., Inter, Geist, DM Sans), Humanist sans-serif (warm, friendly — e.g., Source Sans, Nunito, Open Sans), Serif (editorial, traditional — e.g., Merriweather, Lora, Playfair), Monospace (technical, developer-focused — e.g., JetBrains Mono, Fira Code), Display / Decorative (bold, distinctive — provide specific suggestions based on personality)
- Allow specific font name
- Follow up: "And for a complementary secondary typeface?"

### Question 4: Color Application
"Looking at the color tokens from Phase 4, how should brand color map to the semantic system?"
- Reference the specific colors from `04-system.md`
- Ask: "Which semantic tokens should carry the strongest brand presence?"
- Options: Primary buttons and interactive elements, Navigation and headers, Accent highlights and badges, Background tinting, All of the above in varying intensity

### Question 5: Imagery and Iconography
"What style of imagery and icons will this product use?"
- Options: Photography (realistic, human), Custom illustration, Icon-only (line icons), Icon-only (filled/solid icons), Abstract / geometric shapes, No imagery — text and color only
- Allow custom answer
- Follow up: "Where in the interface do images/icons appear most?"

### Question 6: Motion Feel
"Based on the motion tokens from Phase 4, how should animation feel when used?"
- Options: Snappy and efficient — quick transitions, no delays, Smooth and elegant — ease-in-out, slightly longer, Playful and bouncy — spring physics, overshoot, Minimal and subtle — barely noticeable, functional only
- Allow custom answer

### Question 7: Visual Signature
"What's the one visual element that should make this product instantly recognizable? The thing someone remembers after seeing it once."
- Open-ended. Probe: "Think about what separates this from competitors visually."

## Synthesis

1. Draft the expression document mapping all brand decisions to the existing token system.
2. Show how each structural view transforms from grayscale to branded.
3. Present summary for confirmation.
4. Write to `.concinnitas/<track>/05-expression.md`.

### Artifact Template

```markdown
# Design Expression

## Brand Foundation
- **Personality:** [adjectives]
- **Visual signature:** [the memorable element]
- **Voice:** [how the brand communicates — confident, casual, precise, etc.]

## Typography Application

| Role | Typeface | Mapped Tokens | Usage |
|------|----------|--------------|-------|
| Primary / Headings | [font name] | `text-lg` through `text-display` | Headlines, section titles |
| Body / UI | [font name] | `text-xs` through `text-base` | Body copy, labels, inputs |
| Accent / Code | [font name] | [specific tokens] | [specific usage] |

### Font Loading
- **Hosting:** [Google Fonts / self-hosted / system fonts]
- **Weights needed:** [list]
- **Fallback stack:** [CSS font stack]

## Color Application

| Semantic Token | Token Value | Brand Intent |
|---------------|------------|--------------|
| `interactive-primary` | [hex from system] | [brand meaning — e.g., "trust, action"] |
| `background-primary` | [hex] | [meaning] |
| `text-default` | [hex] | [meaning] |
...

### Color Usage Rules
- **Primary brand color appears in:** [where — buttons, links, headers, etc.]
- **Secondary color is used for:** [where]
- **Neutral palette handles:** [where]
- **Status colors are strictly functional** — not used for brand expression

## Imagery & Iconography

| Element | Style | Source | Rules |
|---------|-------|--------|-------|
| Icons | [line/filled/custom] | [icon set name] | [size: 20px/24px, stroke: 1.5px, etc.] |
| Images | [photo/illustration] | [source] | [aspect ratios, treatments] |

## Motion Language

| Interaction | Token | Feel |
|-------------|-------|------|
| Button press | `duration-fast` | [snappy confirmation] |
| Page transition | `duration-normal` | [smooth slide] |
| Modal open | `duration-normal` | [scale + fade] |
| Loading state | `duration-slow` | [gentle pulse] |

### Easing Curves
- **Enter:** [curve] — elements appearing
- **Exit:** [curve] — elements leaving
- **Move:** [curve] — elements repositioning

## Applied Views

### [View Name] (from structure)
- **How it transforms:** [description of grayscale → branded]
- **Key brand moments:** [where the brand is most visible in this view]
- **Token mapping:** [which tokens are most important here]

### [Next View...]
...
```

## Visual Output — Paper.design

**Check for Paper MCP availability.**

### If Paper MCP is available:

This is the richest visual output phase. Transform the grayscale wireframes from Phase 3 into branded designs.

1. **Read structure artboards:** Call `get_children` on the root to find the "Structure — [View]" artboards from Phase 3. For each, call `get_jsx` to get the structural HTML.

2. **Create expression artboards:** For each structured view, call `create_artboard`:
   - Name: `"Expression — [View Name]"`
   - Same dimensions as the structure artboard

3. **Write branded HTML:** Call `write_html` with the structural HTML transformed to use the design system:
   - Replace grayscale colors with semantic token values as CSS custom properties
   - Apply the chosen typefaces via `font-family`
   - Apply the spacing scale tokens
   - Apply border-radius tokens
   - Add subtle shadows using shadow tokens
   - Use the real brand colors, not the grayscale palette
   - Include hover states and interactive styling via CSS

4. **Refine styling:** Call `update_styles` to fine-tune after the initial write:
   - Adjust spacing that doesn't feel right
   - Ensure text is legible at all sizes
   - Verify color contrast in context

5. **Show progress:** Use `start_working_on_nodes` / `finish_working_on_nodes`.

**Quality bar:** The output should look like a designed product, not a wireframe with colors. The layout accuracy comes from Phase 3's structure. The visual refinement comes from the token system. Together, they produce something that represents the design intent — though manual polish in Paper may be needed for production-readiness.

### If Paper MCP is not available:

Note: "Visual designs were not generated (Paper.design not connected). The expression specification above contains all brand application rules. Connect Paper.design MCP to generate branded visual designs."

## State Update

1. Update `manifest.yaml`:
   - Set `5-expression.status` to `completed`
   - Set `5-expression.completed_at` to current ISO timestamp
   - Set `current_phase` to `6`
2. Tell the user: "Brand expression applied. Run `/design:validate` to check the design against reality."
