import { describe, it, expect } from "vitest";
import { transformSkillForOpenCode } from "./transform.js";

describe("transformSkillForOpenCode", () => {
  it("rewrites the name field in frontmatter", () => {
    const input = `---
name: discover
description: Phase 1 of the concinnitas design process
---

# Phase 1: Discover
`;

    const result = transformSkillForOpenCode(input, "discover");

    expect(result).toContain("name: con-discover");
    expect(result).not.toContain("name: discover\n");
  });

  it("does not modify body content", () => {
    const input = `---
name: discover
description: Use when running /con:discover
---

# Phase 1

Run /con:flows to continue.
`;

    const result = transformSkillForOpenCode(input, "discover");

    expect(result).toContain("Run /con:flows to continue.");
    expect(result).toContain("Use when running /con:discover");
  });

  it("handles the track skill with argument-hint", () => {
    const input = `---
name: track
description: Manage design tracks
argument-hint: "[track-name]"
---

# Track Management
`;

    const result = transformSkillForOpenCode(input, "track");

    expect(result).toContain("name: con-track");
    expect(result).toContain('argument-hint: "[track-name]"');
  });

  it("handles name field with extra whitespace", () => {
    const input = `---
name:   flows
description: Phase 2
---
`;

    const result = transformSkillForOpenCode(input, "flows");

    expect(result).toContain("name:   con-flows");
  });
});
