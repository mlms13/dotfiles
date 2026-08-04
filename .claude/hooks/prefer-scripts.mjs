#!/usr/bin/env node
// PreToolUse (Bash) hook. Two nudges toward defined package.json scripts:
//   1. Discourage ad-hoc `npx` / `pnpm exec` / `pnpm dlx` (with a small allowlist).
//   2. Steer bare `pnpm <script>` -> explicit `pnpm run <script>`, but only when
//      <script> is a real script in the nearest package.json — so nothing is
//      denied unless we can point to a concrete `pnpm run` alternative.
// Neither is a hard security boundary; both just shape the default path.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const command = input?.tool_input?.command ?? "";
const cwd = input?.cwd ?? process.cwd();

// Invoked-command boundary: line start or after a shell separator (not a substring).
const boundary = String.raw`(?:^|[;&|(]|&&|\|\|)\s*`;

const pass = () => process.exit(0); // no output → normal permission flow
function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

// --- 1. discourage npx / pnpm exec / dlx -------------------------------------
const DISCOURAGED = new RegExp(boundary + String.raw`(?:npx|pnpx|pnpm\s+exec|pnpm\s+dlx|yarn\s+dlx)(?:\s|$)`);
const ALLOWED = [
  new RegExp(boundary + String.raw`pnpm\s+exec\s+prettier(?:\s|$)`), // format single files
  // ctx7 (find-docs skill), any version — deliberately NOT in permissions.allow,
  // so every run still goes through the permission prompt for human review.
  new RegExp(boundary + String.raw`pnpm\s+dlx\s+ctx7(?:@\S+)?(?:\s|$)`),
];
if (DISCOURAGED.test(command) && !ALLOWED.some((re) => re.test(command))) {
  deny(
    'Avoid npx / pnpm exec / dlx. Check the nearest package.json "scripts" and run the ' +
    "matching one via `pnpm run <script>` (lint, lint:fix, typecheck, format, test, build). " +
    "If no script covers this, do NOT retry — tell the user which tool you need and let them run it.",
  );
}

// --- 2. bare `pnpm <script>` -> `pnpm run <script>` --------------------------
// pnpm subcommands (incl. builtin script shortcuts) that are never user scripts.
const RESERVED = new Set([
  "run", "exec", "dlx", "add", "remove", "rm", "install", "i", "update", "up",
  "upgrade", "why", "list", "ls", "ll", "outdated", "audit", "publish", "pack",
  "link", "ln", "unlink", "import", "rebuild", "prune", "store", "config",
  "init", "create", "patch", "patch-commit", "patch-remove", "dedupe", "fetch",
  "deploy", "env", "licenses", "setup", "server", "root", "bin", "doctor",
  "approve-builds", "test", "start", "stop", "restart",
]);

// Effective dir for locating package.json, honoring a single leading `cd <dir> &&`.
function effectiveDir() {
  const m = command.match(/^\s*cd\s+(?:"([^"]+)"|'([^']+)'|(\S+))\s*(?:&&|;)/);
  const target = m && (m[1] ?? m[2] ?? m[3]);
  return target ? resolve(cwd, target) : cwd;
}

function nearestScripts(startDir) {
  let dir = startDir;
  for (; ;) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      if (pkg.scripts) return pkg.scripts;
    } catch { }
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

const bareRe = new RegExp(boundary + String.raw`pnpm\s+([\w@./:-]+)`, "g");
for (let m; (m = bareRe.exec(command));) {
  const token = m[1];
  if (token.startsWith("-") || RESERVED.has(token)) continue;
  const scripts = nearestScripts(effectiveDir());
  if (scripts && Object.prototype.hasOwnProperty.call(scripts, token)) {
    deny(
      `Use the explicit \`pnpm run ${token}\` form instead of bare \`pnpm ${token}\`. `
    );
  }
}

pass();
