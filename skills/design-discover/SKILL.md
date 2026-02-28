---
name: design-discover
description: Phase 1 of the concinnitas design process — deeply understand the problem through guided conversation. Produces a discovery brief covering business context, user pain, constraints, and success criteria. Use when starting a new design process or running /design:discover.
disable-model-invocation: true
---

# Phase 1: Discover — Understand the Problem

Design begins with clarity. If you don't deeply understand the problem — the business pressure, the user frustration, the constraints — then everything that follows is decoration.

## Pre-flight

1. Read `.concinnitas/.active` to find the active track name.
2. If `.concinnitas/` doesn't exist OR no `.active` file exists:
   - First, check if `.concinnitas/` exists and contains track subdirectories.
   - If exactly one track exists, auto-select it as the active track (write its name to `.concinnitas/.active`). Inform the user: "Auto-selected track '[name]'." Continue to step 3.
   - If multiple tracks exist, ask the user: "Multiple tracks found. Run `/design:track <name>` to select one." Stop here.
   - If no tracks exist, ask the user: "No active design track. What should we call this design track?" Suggest `"main"` as the default.
     - Create `.concinnitas/<track-name>/` directory.
     - Create `manifest.yaml` with all phases set to `pending`.
     - Write track name to `.concinnitas/.active`.
3. If `.concinnitas/.active` exists, read it and verify the track directory exists.
4. Read `manifest.yaml` from the active track.
5. If `1-discover` status is `completed`:
   - Tell the user: "Discovery is already complete for this track."
   - Read and display a summary of `01-discover.md`.
   - Offer two options:
     - **Proceed to flows (recommended):** "Run `/design:flows` to map user journeys."
     - **Review discovery brief:** "I can review the discovery brief for gaps, inconsistencies, or unstated assumptions."
   - If user chooses review: read `01-discover.md`, analyze it critically, suggest improvements. Do NOT overwrite — present suggestions for the user to accept/reject.
   - Stop here.
6. Update manifest: set `1-discover.status` to `in_progress`, record `started_at`.

## Conversation

Ask these questions **one at a time**. Wait for the user's answer before asking the next. Always provide suggested options but allow custom answers.

**IMPORTANT:** Use the AskUserQuestion tool (multiple choice with custom input enabled) for each question. Adapt follow-up questions based on answers. Skip questions that have already been answered in previous responses.

### Question 1: The Product
"What are we designing? Describe the product, feature, or experience."
- This is open-ended. Let the user describe in their own words.

### Question 2: The Users
"Who are the primary users? What's their context when they encounter this?"
- Options: Internal team members, Consumers (B2C), Enterprise users (B2B), Developers/technical users
- Allow custom answer

### Question 3: The Pain
"What's broken or frustrating today? What's the specific pain point?"
- This is open-ended. Push for specifics: "Can you give me a concrete example of when this pain happens?"

### Question 4: The Business Driver
"What business pressure is driving this work?"
- Options: User growth / acquisition, Retention / reducing churn, Operational efficiency, Entering a new market, Reducing technical debt, Competitive pressure
- Allow custom answer

### Question 5: The Constraints
"What constraints are we operating within? Select all that apply."
- Options (multiple select): Tight timeline, Limited budget, Existing tech stack limitations, Small team, Legacy system dependencies, Brand guidelines to follow, Regulatory/compliance requirements
- Allow custom answer

### Question 6: Success Criteria
"What does success look like? How will we know this design worked?"
- This is open-ended. Push for measurable outcomes: "Can we put a number on that? What metric would move?"

### Question 7: Stakeholders
"Who are the key stakeholders, and what are their priorities? Are there conflicting interests?"
- This is open-ended. Probe for tension: "Is there disagreement about what matters most?"

### Question 8: Prior Attempts
"Has anything been tried before? What's been ruled out and why?"
- Options: Yes, previous attempts exist, No, this is greenfield, Not sure
- If yes: ask for details about what was tried and why it didn't work

## Synthesis

Once all questions are answered:

1. Draft the discovery brief using the template below.
2. Present a summary to the user: "Here's the discovery brief I've drafted. Does this accurately capture the problem?"
3. Allow the user to adjust before finalizing.
4. Write the artifact to `.concinnitas/<track>/01-discover.md`.

### Artifact Template

```markdown
# Discovery Brief

## Problem Statement
[1-2 sentence sharp articulation of the core problem. No jargon. A stranger should understand this.]

## Business Context
- **Driver:** [primary business motivation]
- **Impact:** [what happens if we don't solve this]
- **Timeline:** [urgency and time constraints]

## Users
- **Primary audience:** [who they are]
- **Context:** [when, where, and how they encounter this problem]
- **Current pain:** [specific frustrations, with concrete examples]

## Constraints
- [constraint 1]
- [constraint 2]
- [constraint 3]

## Success Criteria
- [measurable outcome 1]
- [measurable outcome 2]
- [measurable outcome 3]

## Stakeholder Alignment
| Stakeholder | Priority | Potential Conflict |
|-------------|----------|-------------------|
| [name/role] | [what they care about] | [how it might conflict] |

## Prior Attempts
- [approach tried]: [outcome and why it didn't work]
- (or "Greenfield — no prior attempts")
```

## State Update

1. Update `manifest.yaml`:
   - Set `1-discover.status` to `completed`
   - Set `1-discover.completed_at` to current ISO timestamp
   - Set `current_phase` to `2`
2. Tell the user: "Discovery complete. Run `/design:flows` to map user journeys and edge cases."
