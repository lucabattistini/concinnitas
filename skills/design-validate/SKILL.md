---
name: design-validate
description: Phase 6 of the concinnitas design process — validate the design against the original problem, accessibility standards, flow coverage, and engineering feasibility. Produces a validation report. Use when running /design:validate after expression is applied.
disable-model-invocation: true
---

# Phase 6: Validate — Check Against Reality

After release, the process doesn't end. Watch behavior. Look at drop-offs. Listen to confusion. Check whether the system made building faster or slower. A design system that doesn't improve velocity is just a style guide with ambition.

## Pre-flight

1. Read `.concinnitas/.active` to find the active track.
2. If no active track:
   - Check how many track subdirectories exist in `.concinnitas/` (exclude `.active`).
   - If exactly one track exists, auto-select it as the active track (write its name to `.concinnitas/.active`). Inform the user: "Auto-selected track '[name]'."
   - If multiple tracks exist: "Multiple tracks found. Run `/design:track <name>` to select one."
   - If no tracks exist: "No active design track. Run `/design:track <name>` first."
3. Read `manifest.yaml`.
4. **Check prerequisites:** At minimum, `1-discover` and `3-structure` must be `completed`. This phase is most useful when all 5 previous phases are done. Warn about any missing phases but don't block.
5. If `6-validate` is `completed`:
   - Inform user, show summary.
   - Offer: **Proceed to govern (recommended)** or **Review validation**.
   - Stop here.
6. Update manifest: set `6-validate.status` to `in_progress`.

## Context

Read ALL existing artifacts for the active track:
- `01-discover.md` — the original problem and success criteria
- `02-flows.md` — the user journeys and edge cases (if exists)
- `03-structure.md` — the information architecture (if exists)
- `04-system.md` — the token system (if exists)
- `05-expression.md` — the brand application (if exists)

The validation checks adapt based on which artifacts exist.

## Conversation

### Question 1: Problem Alignment
"Let me check the design against the original discovery brief. The problem was: [quote from 01-discover.md]. Looking at what we've designed, does the solution directly address this? Is anything missing?"
- Options: Yes, it addresses the problem fully, Partially — some aspects are missing, No — we've drifted from the original problem
- If partial or no: discuss what needs to change

### Question 2: Accessibility Audit
"Let me run through the accessibility checklist based on the system tokens."
- Walk through each check systematically:
  - **Color contrast:** Reference specific token combinations from `04-system.md` and their calculated ratios
  - **Touch targets:** Are interactive elements at least 44x44px?
  - **Keyboard navigation:** Can every action be reached without a mouse?
  - **Screen reader compatibility:** Are there proper heading hierarchies, alt text considerations, ARIA labels?
  - **Motion sensitivity:** Does the motion system respect `prefers-reduced-motion`?
- For each check, ask: "Does this pass? Any concerns?"

### Question 3: Flow Coverage
If `02-flows.md` exists:
"Let me walk through each flow from Phase 2 and verify the structure supports it."
- For each flow (happy path, error states, edge cases), ask:
  - "The flow says [step]. Is this handled in the structure at [view]?"
  - Present as a checklist the user confirms

### Question 4: Performance Considerations
"Are there any performance concerns with the design?"
- Options: Heavy imagery that could slow loading, Complex animations on low-end devices, Large number of components rendering simultaneously, Data-heavy views that could stall, No concerns
- Allow custom answer
- For each concern: discuss mitigation

### Question 5: Edge Case Review
If `02-flows.md` exists:
"Let's verify each edge case from Phase 2 is handled."
- Present edge cases as a checklist
- For each: "How does the design handle [edge case]?"

### Question 6: Engineering Feasibility
"Are there design decisions that would be difficult or expensive to implement?"
- Open-ended. Probe: "Is there anything an engineer would push back on? Anything that doesn't map to standard components?"
- Follow up: "What simplifications could we make without sacrificing the experience?"

### Question 7: Success Metrics
"What metrics should we track post-launch to validate this design works?"
- Options (multiple select): Task completion rate, Time on task, Error rate / support tickets, Net Promoter Score (NPS), Conversion rate, User retention / churn, Page load performance, Accessibility compliance score
- Allow custom answer
- For each selected metric: "What's the target? What's the current baseline?"

## Synthesis

1. Compile the validation report.
2. Flag any critical issues that must be addressed before shipping.
3. Present summary — highlight failures and recommendations.
4. Write to `.concinnitas/<track>/06-validate.md`.

### Artifact Template

```markdown
# Design Validation Report

## Summary
- **Overall:** [Pass / Pass with warnings / Needs revision]
- **Critical issues:** [count]
- **Warnings:** [count]

## Problem Alignment
- **Original problem:** [quoted from discovery]
- **Design addresses it:** Yes / Partially / No
- **Gaps:** [any aspects not addressed]
- **Drift:** [any ways the design has evolved away from the original goal]

## Accessibility Audit

| Check | Status | Details |
|-------|--------|---------|
| Color contrast (text on backgrounds) | Pass/Fail | [specific failing combinations] |
| Touch target sizes (44px minimum) | Pass/Fail | [which elements are too small] |
| Keyboard navigation | Pass/Fail | [which flows aren't keyboard-accessible] |
| Screen reader compatibility | Pass/Fail | [heading hierarchy issues, missing labels] |
| Motion sensitivity (`prefers-reduced-motion`) | Pass/Fail | [which animations need alternatives] |

## Flow Coverage

| Flow | Covered | Gaps |
|------|---------|------|
| [Happy path] | Full/Partial/Missing | [what's missing] |
| [Error: specific failure] | Full/Partial/Missing | [what's missing] |
| [Edge case: specific case] | Full/Partial/Missing | [what's missing] |

## Performance Assessment
- **Concerns:** [list]
- **Mitigations:** [recommended solutions]

## Engineering Feasibility

| Design Decision | Feasibility | Complexity | Recommendation |
|----------------|-------------|------------|----------------|
| [decision] | Easy/Medium/Hard | [why] | [simplify?] |

## Post-Launch Metrics

| Metric | Current Baseline | Target | Measurement Method |
|--------|-----------------|--------|-------------------|
| [metric] | [current value or "unknown"] | [target] | [how to measure] |

## Action Items
1. **[Critical]** [issue that must be fixed]
2. **[Warning]** [issue to address if possible]
3. **[Note]** [consideration for post-launch]
```

## State Update

1. Update `manifest.yaml`:
   - Set `6-validate.status` to `completed`
   - Set `6-validate.completed_at` to current ISO timestamp
   - Set `current_phase` to `7`
2. Tell the user: "Validation complete. Run `/design:govern` to define how the design system is maintained and evolved."
