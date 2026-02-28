import { existsSync, readFileSync } from "node:fs";
import { get } from "node:https";
import { getMetaFilePath } from "../utils/paths.js";
import { success, warn, info, heading } from "../utils/output.js";
import { PACKAGE_VERSION } from "../constants.js";
import type { MetaFile } from "../constants.js";

/**
 * Fetch the latest version of the package from the npm registry.
 * Includes a 10-second timeout and status code check.
 */
function fetchLatestVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = get(
      "https://registry.npmjs.org/@lucabattistini/concinnitas/latest",
      { headers: { Accept: "application/json" } },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`npm registry returned ${res.statusCode}`));
          res.resume();
          return;
        }

        let data = "";
        res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
        res.on("end", () => {
          try {
            const json = JSON.parse(data) as { version?: string };
            if (json.version) {
              resolve(json.version);
            } else {
              reject(new Error("No version field in registry response"));
            }
          } catch {
            reject(new Error("Failed to parse npm registry response"));
          }
        });
        res.on("error", reject);
      },
    );

    req.on("error", reject);
    req.setTimeout(10_000, () => {
      req.destroy(new Error("Request timed out"));
    });
  });
}

export async function update(): Promise<void> {
  heading("concinnitas update");

  // Read installed version from meta file
  const metaPath = getMetaFilePath();
  let installedVersion: string;

  if (existsSync(metaPath)) {
    try {
      const raw = readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(raw) as MetaFile;
      installedVersion = meta.version;
    } catch {
      installedVersion = PACKAGE_VERSION;
    }
  } else {
    info("No concinnitas installation found. Run `install` first.");
    info("");
    info("  npx @lucabattistini/concinnitas install");
    return;
  }

  // Fetch latest version from npm
  info("Checking for updates...");
  let latestVersion: string;

  try {
    latestVersion = await fetchLatestVersion();
  } catch {
    warn("Could not check for updates. Run `install` to force-reinstall.");
    return;
  }

  // Compare versions
  if (installedVersion === latestVersion) {
    success(`Already up to date (v${installedVersion}).`);
  } else {
    info(`Update available: v${installedVersion} \u2192 v${latestVersion}`);
    info("");
    info("Run the following to update:");
    info("  npx @lucabattistini/concinnitas@latest install");
  }
}
