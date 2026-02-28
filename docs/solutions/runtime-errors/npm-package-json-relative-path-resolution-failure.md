---
title: "npm package crashes with 'Cannot find module package.json' due to wrong relative path after TypeScript compilation"
date: 2026-02-28
category: runtime-errors
tags:
  - typescript
  - npm-packaging
  - relative-paths
  - esm
  - cli
  - createRequire
  - github-packages
severity: critical
component: src/constants.ts
symptom: "Error: Cannot find module '../../package.json' when running npx @lucabattistini/concinnitas install"
root_cause: "require('../../package.json') resolved correctly from src/ in dev but broke from dist/ when installed via npm"
status: solved
---

# npm package crashes with "Cannot find module package.json" after TypeScript compilation

## Problem

When the `@lucabattistini/concinnitas` package was installed and executed via `npx`, the CLI crashed on startup with:

```
node:internal/modules/cjs/loader:1447
  const err = new Error(message);
              ^

Error: Cannot find module '../../package.json'
Require stack:
- /Users/lucabattistini/.npm/_npx/.../node_modules/@lucabattistini/concinnitas/dist/constants.js
```

This occurred any time the `concinnitas` binary was invoked from an installed (npm/npx) context, making the published v1.0.0 package completely non-functional.

## Investigation

Path resolution analysis was performed by tracing the `createRequire(import.meta.url)` call through both execution contexts:

- **Local development:** `dist/constants.js` uses `require("../../package.json")`. From `dist/`, two levels up resolves to the parent of the repo root -- but in practice the local directory layout happened to make this work.
- **Installed via npm/npx:** `node_modules/@lucabattistini/concinnitas/dist/constants.js` uses the same path. From there, `../../package.json` resolves to `node_modules/@lucabattistini/package.json` -- which does not exist. The resolution escapes the package boundary entirely.

The installed package directory structure is:

```
@lucabattistini/concinnitas/
  package.json          <-- target
  dist/
    constants.js        <-- require() originates here
    cli.js
  skills/
```

## Root Cause

The `tsconfig.json` sets `rootDir: "src"` and `outDir: "dist"`, meaning `src/constants.ts` compiles to `dist/constants.js`. The `require()` path is resolved at **runtime** relative to the **compiled** file's location (`dist/`), not the source file's location (`src/`).

The original path `../../package.json` assumed resolution from `src/` depth. The correct path from `dist/constants.js` is `../package.json` -- one level up from `dist/` to the package root.

Key insight: `createRequire(import.meta.url)` resolves paths relative to the **running file** (`dist/constants.js`), not the **source file** (`src/constants.ts`). TypeScript does NOT adjust relative paths in `createRequire` calls during compilation.

## Solution

Changed the relative path in `src/constants.ts`:

**Before:**

```typescript
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string };
```

**After:**

```typescript
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };
```

## Verification

1. **Build:** `pnpm run build` completed without errors.
2. **Path resolution check:** Confirmed `../package.json` from `dist/` resolves to the repo root `package.json`.
3. **Smoke test:** `node dist/cli.js --help` ran successfully, printing the full help output without crashes.

## Similar Patterns in Codebase

`src/utils/paths.ts` uses the same `import.meta.url`-based resolution pattern:

```typescript
const __dirname = dirname(fileURLToPath(import.meta.url));
return resolve(__dirname, "..", "..", "skills");
```

This compiles to `dist/utils/paths.js`, where `../../skills` correctly resolves to the package root's `skills/` directory (two levels up from `dist/utils/`). This path is actually correct for the deeper nesting.

## Prevention Strategies

**Key principle:** In TypeScript projects with `rootDir`/`outDir` separation, all relative paths to non-compiled assets must be reasoned about from the *output* directory, not the source directory.

**Draw the directory tree before writing the path:**

```
package-root/
  package.json        <-- target
  src/
    constants.ts      <-- authoring here: ../../package.json (WRONG at runtime)
  dist/
    constants.js      <-- runs here: ../package.json (CORRECT)
```

### Alternatives to createRequire for reading package.json in ESM

| Approach | Tradeoffs |
|---|---|
| `createRequire(import.meta.url)("../package.json")` | Current approach. Works, but path is fragile. |
| `JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8"))` | No CJS shim needed. Explicit URL resolution. |
| Hardcode `VERSION` constant, update via build script | Zero runtime file reads. Most robust. |

### Pre-publish Checklist

1. `npm run build` -- clean compilation.
2. Inspect `dist/` output -- verify relative paths make sense from `dist/`, not `src/`.
3. `npm pack --dry-run` -- review file list.
4. `npm pack` then install tarball in isolated directory -- run the CLI entry point.
5. Run `--version` or equivalent smoke command.

### Test Cases

```typescript
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

describe("package.json resolution", () => {
  it("constants module exports a valid version from compiled output", async () => {
    const { PACKAGE_VERSION } = await import("../dist/constants.js");
    expect(PACKAGE_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("CLI --version flag prints version without crashing", () => {
    const bin = resolve("dist/cli.js");
    const output = execSync(`node ${bin} --version`, {
      encoding: "utf-8",
    }).trim();
    expect(output).toMatch(/^\d+\.\d+\.\d+/);
  });
});
```

## Related Documentation

- **`docs/brainstorms/2026-02-28-npx-installer-brainstorm.md`** -- describes the CLI architecture
- **`docs/plans/2026-02-28-feat-npx-installer-cli-plan.md`** -- original plan for path resolution
- No prior entries in `docs/solutions/` -- this is the first documented solution

## Cross-References

- [Node.js `module.createRequire()`](https://nodejs.org/api/module.html#modulecreaterequirefilename)
- [Node.js ESM `import.meta.url`](https://nodejs.org/api/esm.html#importmetaurl)
- [Node.js CJS `require()` resolution algorithm](https://nodejs.org/api/modules.html#all-together)
