/**
 * TTY-aware output formatting.
 * Uses Unicode symbols when stdout is a TTY with UTF-8, ASCII fallbacks otherwise.
 */

export const isUnicode = (() => {
  if (!process.stdout.isTTY) return false;
  const lang = (process.env["LANG"] || process.env["LC_ALL"] || "").toLowerCase();
  return lang.includes("utf") || process.platform === "darwin";
})();

export const SYM_OK = isUnicode ? "\u2713" : "[OK]";
export const SYM_WARN = isUnicode ? "\u26A0" : "[!]";
export const SYM_FAIL = isUnicode ? "\u2717" : "[X]";

export function success(msg: string): void {
  console.log(`  ${SYM_OK} ${msg}`);
}

export function warn(msg: string): void {
  console.log(`  ${SYM_WARN} ${msg}`);
}

export function error(msg: string): void {
  console.error(`  ${SYM_FAIL} ${msg}`);
}

export function info(msg: string): void {
  console.log(`  ${msg}`);
}

export function heading(msg: string): void {
  console.log(`\n${msg}\n`);
}
