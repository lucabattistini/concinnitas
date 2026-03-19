# @lucabattistini/concinnitas

## 2.0.0

### Major Changes

- e940502: Add Claude Code plugin support and rename commands from /design:_ to /con:_

  - All slash commands renamed to `/con:*` (branded, short, memorable)
  - Package now works as a Claude Code plugin via `plugin.json`
  - CLI requires `--platform opencode|claude` flag
  - Upgrading from v1.x auto-cleans legacy `design-*` directories

## 1.0.1

### Patch Changes

- be08f00: Fix runtime crash when installed via npm/npx: corrected relative path to package.json in compiled output

## 1.0.0

### Major Changes

- v1.0.0
