import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveBuildToken() {
  try {
    const gitSha = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    if (gitSha) {
      return gitSha;
    }
  } catch {
    // Fall through to env or random fallback when git metadata is unavailable.
  }

  const envToken =
    process.env.BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA;

  if (envToken) {
    return envToken.slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10);
}

const buildId = `${resolveBuildToken()}-${Date.now()}`;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const swPath = path.resolve(scriptDir, "../public/sw.js");
const source = readFileSync(swPath, "utf8");
const nextSource = source.replace(
  /const CACHE_VERSION = ".*?"; \/\/ replace at build time, or bump manually/,
  `const CACHE_VERSION = "${buildId}"; // replace at build time, or bump manually`,
);

writeFileSync(swPath, nextSource);
