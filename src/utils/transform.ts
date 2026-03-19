/**
 * Transform a SKILL.md's frontmatter name field for OpenCode installation.
 * Source skills use short names (e.g., "discover"). OpenCode needs "con-discover".
 * Body content is left unchanged — cross-references already say /con:*.
 */
export function transformSkillForOpenCode(
  content: string,
  sourceName: string,
): string {
  return content.replace(
    /^(name:\s*)(.+)$/m,
    `$1con-${sourceName}`,
  );
}
