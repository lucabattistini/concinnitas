#!/usr/bin/env node

import { install } from "./commands/install.js";
import { uninstall } from "./commands/uninstall.js";
import { update } from "./commands/update.js";
import { list } from "./commands/list.js";
import { error } from "./utils/output.js";
import { PACKAGE_VERSION } from "./constants.js";

const HELP_TEXT = `concinnitas — AI-guided design process for OpenCode

Usage:
  concinnitas <command>

Commands:
  install     Install skills to OpenCode
  update      Check for newer version on npm
  uninstall   Remove skills from OpenCode
  list        Show installed skills

Options:
  --help, -h      Show this help message
  --version, -v   Show version

Examples:
  npx @lucabattistini/concinnitas install
  npx @lucabattistini/concinnitas list
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // Flags
  if (!command || command === "--help" || command === "-h") {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (command === "--version" || command === "-v") {
    console.log(PACKAGE_VERSION);
    process.exit(0);
  }

  // Dispatch commands
  switch (command) {
    case "install":
      install();
      break;
    case "uninstall":
      uninstall();
      break;
    case "update":
      await update();
      break;
    case "list":
      list();
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
