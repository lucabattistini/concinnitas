---
name: design-govern
description: Phase 7 of the concinnitas design process — define governance rules for design system maintenance, token evolution, component deprecation, and change management. Produces a governance document. Use when running /design:govern after validation.
disable-model-invocation: true
---

# Phase 7: Govern — Protect the Integrity

Without governance, entropy wins. Always. Define how changes happen. How tokens evolve. How components get deprecated.

## Pre-flight

1. Read `.concinnitas/.active` to find the active track.
2. If no active track: "No active design track. Run `/design:track <name>` first."
3. Read `manifest.yaml`.
4. **Check prerequisites:** At minimum, `4-system` must be `completed`. This phase defines governance for the design system — it needs a system to govern. Warn about missing phases but allow running if at least the system phase is done.
5. If `7-govern` is `completed`:
   - Inform user, show summary.
   - Offer: **Review governance document** or **Done — design process complete**.
   - Stop here.
6. Update manifest: set `7-govern.status` to `in_progress`.

## Context

Read ALL existing artifacts for the active track, especially:
- `.concinnitas/<track>/04-system.md` — the token system that needs governance
- `.concinnitas/<track>/05-expression.md` — brand rules that need protection (if exists)
- `.concinnitas/<track>/06-validate.md` — validation results that inform governance priorities (if exists)

## Conversation

### Question 1: Change Process
"How should changes to design tokens be proposed and approved?"
- Options: Pull request / code review process, Design team review and approval, Written RFC with discussion period, Informal — whoever needs to change it documents it, No formal process yet — help me define one
- Allow custom answer
- Follow up: "Who has the authority to approve a token change?"

### Question 2: Component Lifecycle
"When should a component be deprecated versus updated?"
- Walk through the decision framework:
  - "If a component's API changes but purpose stays the same → update"
  - "If a component is replaced by a fundamentally different pattern → deprecate"
  - "If a component is no longer needed → deprecate with migration guide"
- Ask: "Does this framework work for your team?"

### Question 3: One-Off Variations
"How do you handle requests for one-off design variations that don't fit the system?"
- Options:
  - **Never** — find a token or component that works, or extend the system formally
  - **Allow with review** — one-offs can exist if documented and reviewed
  - **Create variant tokens** — extend the token system to accommodate
  - **Case by case** — evaluate each request individually
- Allow custom answer

### Question 4: Ownership
"Who owns the design system?"
- Options: Design team, Engineering team, Shared ownership (design + engineering), Dedicated design system team, Single person (design system lead)
- Allow custom answer
- Follow up: "Who can propose changes? Who can approve them?"

### Question 5: Audit Cadence
"How often should the design system be audited for consistency?"
- Options: Quarterly — formal review of token usage and component health, Bi-annually — comprehensive audit every 6 months, Continuously — automated linting in CI/CD, Ad-hoc — when issues are noticed
- Allow custom answer

### Question 6: Design-Code Sync
"How do we ensure naming in design matches naming in code?"
- Open-ended. Probe: "Who is responsible for keeping token names aligned between Figma/Paper and the codebase?"
- Suggest: "One approach is to generate design tokens from a single source of truth (e.g., a YAML/JSON token file) that both design tools and code consume."

### Question 7: New Component Process
"What's the process for adding a new component to the system?"
- Open-ended. Suggest a framework:
  1. Proposal (why this component is needed)
  2. Audit existing components (can an existing one be extended?)
  3. Design with tokens (use existing primitives)
  4. Review (design + engineering)
  5. Build (implement with tokens)
  6. Document (usage guidelines, do/don't)
  7. Ship
- Ask: "Does this process work, or should we simplify?"

## Synthesis

1. Compile the governance document.
2. Present summary.
3. Write to `.concinnitas/<track>/07-govern.md`.

### Artifact Template

```markdown
# Design System Governance

## Change Process

### Token Changes
- **Who can propose:** [roles]
- **Review process:** [PR / RFC / team review]
- **Approval authority:** [who signs off]
- **Communication:** [how changes are announced to consumers]

### Component Changes
- **Minor updates (non-breaking):** [process]
- **Major changes (breaking):** [process]
- **Emergency fixes:** [expedited process]

## Ownership

| Role | Person/Team | Responsibilities |
|------|------------|-----------------|
| Owner | [who] | Final approval, strategic direction |
| Contributors | [who] | Propose changes, build components |
| Consumers | [who] | Use the system, report issues |

## Rules

### One-Off Variations
- **Policy:** [never/with review/case by case]
- **Process if allowed:** [how to request and document]
- **Expiration:** [do one-offs get formalized or removed?]

### Deprecation
- **Criteria:** [when to deprecate vs. update]
- **Process:**
  1. Mark as deprecated with migration guide
  2. Announce to all consumers
  3. Grace period: [timeframe]
  4. Remove
- **Migration support:** [who helps consumers migrate]

### Naming Convention Enforcement
- **Source of truth:** [where token names are defined — YAML file, Figma, code]
- **Sync mechanism:** [how design ↔ code stays aligned]
- **Enforcement:** [manual review / automated linting / both]

## New Component Process

1. **Proposal:** [what's needed]
2. **Audit:** [check if existing components can be extended]
3. **Design:** [create with existing tokens]
4. **Review:** [design + engineering approval]
5. **Build:** [implement with token system]
6. **Document:** [usage guidelines, examples, do/don't]
7. **Ship:** [release and announce]

## Audit Schedule

| Audit Type | Frequency | Scope | Owner |
|-----------|-----------|-------|-------|
| Token consistency | [frequency] | All token definitions | [who] |
| Component health | [frequency] | All components, usage metrics | [who] |
| Accessibility | [frequency] | WCAG compliance | [who] |
| Design-code drift | [frequency] | Token naming, value accuracy | [who] |

## Token Evolution

### Versioning
- **Strategy:** [semantic versioning / date-based / feature-based]
- **Breaking changes:** [how they're communicated and handled]

### Migration
- **Process:** [how consumers update when tokens change]
- **Tooling:** [codemods, migration scripts, deprecation warnings]
- **Support:** [who helps with migration issues]

### Communication
- **Changelog:** [where changes are documented]
- **Announcements:** [channel — Slack, email, standup]
- **Documentation:** [where the latest system docs live]
```

## State Update

1. Update `manifest.yaml`:
   - Set `7-govern.status` to `completed`
   - Set `7-govern.completed_at` to current ISO timestamp
   - `current_phase` stays at `7` — all phases complete

2. Display completion message:

```
Design process complete!

Track: [track-name]
Phases completed: 7/7

Artifacts:
  .concinnitas/<track>/01-discover.md  — Problem brief
  .concinnitas/<track>/02-flows.md     — User journeys
  .concinnitas/<track>/03-structure.md — Information hierarchy
  .concinnitas/<track>/04-system.md    — Design tokens
  .concinnitas/<track>/05-expression.md — Brand expression
  .concinnitas/<track>/06-validate.md  — Validation report
  .concinnitas/<track>/07-govern.md    — Governance rules

The design process for this track is complete. You can:
- Review any phase's output by re-running its command
- Start a new track with /design:track <new-name>
- Begin implementation using the artifacts as specification
```
