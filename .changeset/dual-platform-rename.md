---
"@lucabattistini/concinnitas": major
---

Add Claude Code plugin support and rename commands from /design:* to /con:*

- All slash commands renamed to `/con:*` (branded, short, memorable)
- Package now works as a Claude Code plugin via `plugin.json`
- CLI requires `--platform opencode|claude` flag
- Upgrading from v1.x auto-cleans legacy `design-*` directories
