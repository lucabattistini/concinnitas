#!/usr/bin/env node

import { parseArgs } from "node:util";
import { install } from "./commands/install.js";
import { uninstall } from "./commands/uninstall.js";
import { update } from "./commands/update.js";
import { list } from "./commands/list.js";
import { error } from "./utils/output.js";
import { PACKAGE_VERSION } from "./constants.js";
import type { Platform } from "./constants.js";

const VALID_PLATFORMS: Platform[] = ["opencode", "claude"];

const HELP_TEXT = `concinnitas — AI-guided design process for OpenCode and Claude Code

Usage:
  concinnitas <command> --platform <opencode|claude>

Commands:
  install     Install skills (OpenCode) or show setup instructions (Claude Code)
  update      Check for newer version on npm
  uninstall   Remove skills (OpenCode) or show removal instructions (Claude Code)
  list        Show installed skills

Options:
  --platform, -p  Target platform: opencode or claude (required)
  --help, -h      Show this help message
  --version, -v   Show version

Examples:
  npx @lucabattistini/concinnitas install --platform opencode
  npx @lucabattistini/concinnitas install --platform claude
  npx @lucabattistini/concinnitas list --platform opencode
`;

function parsePlatform(value: string | undefined): Platform {
  if (!value) {
    error("--platform is required. Use --platform opencode or --platform claude");
    process.exit(1);
  }
  if (!VALID_PLATFORMS.includes(value as Platform)) {
    error(`Invalid platform: "${value}". Use --platform opencode or --platform claude`);
    process.exit(1);
  }
  return value as Platform;
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      platform: { type: "string", short: "p" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    allowPositionals: true,
    strict: false,
  });

  const command = positionals[0];

  // Flags
  if (!command || values.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (values.version) {
    console.log(PACKAGE_VERSION);
    process.exit(0);
  }

  // All commands require --platform
  const platform = parsePlatform(values.platform as string | undefined);

  // Dispatch commands
  switch (command) {
    case "install":
      install(platform);
      break;
    case "uninstall":
      uninstall(platform);
      break;
    case "update":
      await update(platform);
      break;
    case "list":
      list(platform);
      break;
    default:
      error(`Unknown command: ${command}. Run --help for usage.`);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  error(message);
  process.exit(1);
});
