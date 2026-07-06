import { existsSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Load the repo-root .env in local dev (Vercel injects env vars directly).
const rootEnv = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(rootEnv)) {
  try {
    process.loadEnvFile(rootEnv);
  } catch {
    /* ignore malformed .env */
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship TypeScript source; Next transpiles them.
  transpilePackages: ["@repo/sticker-engine", "@repo/types", "@repo/validation"],
};

export default nextConfig;
