/**
 * Guard against using npm/yarn in a pnpm workspace.
 * This avoids subtle breakages like esbuild binary version mismatches.
 */

const userAgent = process.env.npm_config_user_agent || "";

// pnpm examples:
// - "pnpm/9.0.0 npm/? node/v20.10.0 darwin arm64"
// - "pnpm/9.0.0 ..."
const isPnpm = /\bpnpm\/\d+/i.test(userAgent);

if (!isPnpm) {
  // Keep the message short and actionable; this prints during install.
  console.error(
    [
      "",
      "This repo uses pnpm (see package.json#packageManager).",
      "Please run:",
      "  corepack enable",
      "  corepack prepare pnpm@9.0.0 --activate",
      "  pnpm install",
      "",
    ].join("\n")
  );
  process.exit(1);
}





