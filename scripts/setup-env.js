#!/usr/bin/env node

/**
 * Setup environment symlinks for monorepo packages
 *
 * This script creates symlinks from package directories to the root .env files,
 * ensuring all packages can access the same environment variables.
 *
 * Run automatically via `pnpm install` (postinstall hook)
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

// Packages that need .env symlinks
const PACKAGES_NEEDING_ENV = [
  "apps/web",
  // "packages/db",
  "packages/ai",
  "packages/geo",
  "packages/mcp-domain",
  "packages/mcp-market-data",
  "packages/mcp-realestate",
  "packages/mcp-shared",
  "packages/workflow",
  "packages/shared",
  "packages/convex",
];

// Environment files to symlink
const ENV_FILES = [".env", ".env.local"];

function createSymlink(target, linkPath) {
  try {
    // Remove existing symlink or file
    if (fs.existsSync(linkPath)) {
      const stat = fs.lstatSync(linkPath);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(linkPath);
      } else {
        // Don't overwrite real files
        console.log(`  ⚠ Skipping ${linkPath} (real file exists)`);
        return;
      }
    }

    // Check if target exists
    if (!fs.existsSync(target)) {
      return; // Skip if root env file doesn't exist
    }

    // Create symlink
    fs.symlinkSync(target, linkPath);
    console.log(`  ✓ ${linkPath} -> ${target}`);
  } catch (error) {
    console.error(`  ✗ Failed to create symlink: ${linkPath}`, error.message);
  }
}

function main() {
  console.log("Setting up environment symlinks...\n");

  for (const pkg of PACKAGES_NEEDING_ENV) {
    const pkgDir = path.join(ROOT_DIR, pkg);

    if (!fs.existsSync(pkgDir)) {
      continue;
    }

    console.log(`📦 ${pkg}`);

    for (const envFile of ENV_FILES) {
      const rootEnvPath = path.join(ROOT_DIR, envFile);
      const pkgEnvPath = path.join(pkgDir, envFile);

      // Calculate relative path from package to root
      const relativePath = path.relative(pkgDir, rootEnvPath);

      createSymlink(relativePath, pkgEnvPath);
    }
  }

  console.log("\n✅ Environment setup complete");
}

main();
