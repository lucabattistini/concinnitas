---
name: design-flows
description: Phase 2 of the concinnitas design process — map user journeys, edge cases, and failure states. Produces flow documentation covering happy paths, error states, branching paths, and friction points. Use when running /design:flows after discovery is complete.
disable-model-invocation: true
---

# Phase 2: Flows — Map the User Journey

Think in flows, not screens. Imagine the experience from start to finish. What is the user trying to do? Where might they hesitate? What happens if something fails? What happens when they succeed?

## Pre-flight

1. Read `.concinnitas/.active` to find the active track.
2. If no active track exists, tell the user: "No active design track. Run `/design:track <name>` or `/design:discover` first."
3. Read `manifest.yaml` from the active track.
4. **Check prerequisites:** `1-discover` must be `completed`. If not:
   - Tell the user: "Discovery (Phase 1) isn't complete yet. Run `/design:discover` first — we need to understand the problem before mapping flows."
   - Stop here.
5. If `2-flows` status is `completed`:
   - Tell the user: "Flow mapping is already complete for this track."
   - Read and display a summary of `02-flows.md`.
   - Offer: **Proceed to structure (recommended)** or **Review flows for gaps**.
   - Stop here.
6. Update manifest: set `2-flows.status` to `in_progress`, record `started_at`.

## Context

Read `.concinnitas/<track>/01-discover.md` before starting the conversation. Use it to:
- Understand the product and users
- Infer the likely entry points and primary flows
- Reference specific pain points and constraints during the conversation

## Conversation

Ask these questions **one at a time**. Adapt based on the discovery brief context.

### Question 1: Validate the Starting Point
"Based on the discovery brief, the user journey seems to start with [inferred entry point based on 01-discover.md]. The user is trying to [inferred primary goal]. Does that sound right, or should we adjust?"
- Options: That's correct, Needs adjustment
- If adjustment: ask what the actual entry point / goal is

### Question 2: The Primary Goal
"What is the single most important thing the user is trying to accomplish in this experience?"
- Open-ended. Push for clarity: "If they could only do one thing, what would it be?"

### Question 3: The Happy Path
"Walk me through the ideal path — the user comes in, does exactly the right things, and succeeds. What are the key steps?"
- Open-ended. Let the user describe the flow naturally.
- After they describe it, reflect it back as numbered steps for confirmation.

### Question 4: Failure States
For each step in the happy path, ask:
"At step [N] ([step name]), what could go wrong? What does the user see when it fails?"
- Options per step: Network/server error, Invalid input, Permission denied, Timeout, Resource not found, Nothing can go wrong here
- Allow custom answer
- Ask about recovery: "How does the user get back on track?"

### Question 5: Branching Paths
"Are there different user types or conditions that lead to different paths through this experience?"
- Options: Yes — different user roles, Yes — different states (new vs. returning), Yes — A/B or feature flags, No — single path for all users
- If yes: map each branch

### Question 6: Edge Cases
"What are the rare but important scenarios we need to handle?"
- Prompt with examples from the discovery brief constraints
- Examples: "What if the user has no data yet?", "What if they're on a slow connection?", "What if they try to do X and Y at the same time?"

### Question 7: Friction Points
"Where in this flow might the user hesitate, feel confused, or consider leaving?"
- Open-ended. Probe: "Is there a step where we're asking too much? A moment where the user might not know what to do next?"

### Question 8: Post-Success
"What happens after the user completes their goal? Is there a confirmation, a next action, a celebration?"
- Options: Simple confirmation message, Redirect to next task, Summary/receipt, Celebration/reward moment, Nothing — they're done
- Allow custom answer

## Synthesis

1. Draft the flow document using the template below.
2. Present a summary: "Here are the flows I've mapped. Does this cover the full experience?"
3. Allow adjustments.
4. Write to `.concinnitas/<track>/02-flows.md`.

### Artifact Template

```markdown
# User Flows

## Primary Goal
[Clear statement of what the user is trying to accomplish]

## Entry Point
[Where/how the user enters this experience]

## Happy Path
1. **[Step name]** — [What the user does and sees]
2. **[Step name]** — [What the user does and sees]
3. **[Step name]** — [What the user does and sees]
...
N. **[Success state]** — [What success looks and feels like]

## Error States

| Step | Failure | What User Sees | Recovery Path | Severity |
|------|---------|---------------|---------------|----------|
| [step] | [what goes wrong] | [error message/state] | [how to recover] | Critical/High/Medium/Low |

## Branching Paths

### [Branch: condition or user type]
- **When:** [condition that triggers this branch]
- **Differs from happy path at:** Step [N]
- **Path:** [description of alternate flow]

## Edge Cases

| Case | Description | How We Handle It |
|------|-------------|-----------------|
| [empty state] | [user has no data] | [what we show] |
| [concurrent action] | [user does X and Y] | [how we resolve] |

## Friction Points

| Point | Why It's Risky | Mitigation |
|-------|---------------|------------|
| [step/moment] | [why user might hesitate] | [what we do about it] |

## Post-Success Experience
- **Confirmation:** [what the user sees on success]
- **Next action:** [what they can do next]
- **Data persistence:** [what gets saved/remembered]
```

## State Update

1. Update `manifest.yaml`:
   - Set `2-flows.status` to `completed`
   - Set `2-flows.completed_at` to current ISO timestamp
   - Set `current_phase` to `3`
2. Tell the user: "Flows mapped. Run `/design:structure` to design the information hierarchy and layout logic."
