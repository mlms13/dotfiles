#!/usr/bin/env node
// PreToolUse (Bash) hook. In turbo monorepos, deny `--filter` when it is used to
// run a package script — steer to the root script instead.
//
// Why: turbo hashes task inputs, so a root-level `pnpm run test` re-runs only the
// packages whose inputs actually changed. Filtering buys no wall clock. It does
// cost correctness: `--filter <pkg>` scopes to that package alone and skips the
// packages that DEPEND on it, so breakage in a dependent goes unreported.
//
// Package management is deliberately untouched — `pnpm add --filter <pkg> <dep>`
// is the correct way to target one workspace package, and still passes. Nothing
// is denied unless we can positively identify a script run and name the root
// script that replaces it.
//
// Inert outside turbo repos (gated on a turbo.json above cwd), so this is safe
// to install globally.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const command = input?.tool_input?.command ?? "";
const cwd = input?.cwd ?? process.cwd();

const pass = () => process.exit(0); // no output → normal permission flow
function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

// --- gate: only meaningful inside a turbo workspace --------------------------
function turboRoot(startDir) {
  let dir = resolve(startDir);
  for (;;) {
    try {
      readFileSync(join(dir, "turbo.json"));
      return dir;
    } catch {}
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

const root = turboRoot(cwd);
if (!root) pass();

let rootScripts = {};
try {
  rootScripts =
    JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts ?? {};
} catch {}

// --- what counts as "running a script" ---------------------------------------
// pnpm's builtin shortcuts that execute a package script without `run`.
const SHORTCUTS = new Set(["test", "start", "stop", "restart"]);
const isScript = (t) =>
  t === "run" ||
  SHORTCUTS.has(t) ||
  Object.prototype.hasOwnProperty.call(rootScripts, t);

const FILTER_FLAG = /^(?:--filter(?:-prod)?|-F)(?:=|$)/;
const RUNNERS = new Set(["pnpm", "turbo"]);

function tokenize(segment) {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  for (let m; (m = re.exec(segment)); ) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

// --- scan each invoked command in the (possibly compound) line ---------------
for (const segment of command.split(/&&|\|\||[;|()]/)) {
  const tokens = tokenize(segment);
  if (!tokens.length || !RUNNERS.has(tokens[0])) continue;

  let hasFilter = false;
  const positional = [];

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (FILTER_FLAG.test(t)) {
      hasFilter = true;
      if (!t.includes("=")) i++; // `--filter <value>` consumes the next token
      continue;
    }
    if (t.startsWith("-")) continue;
    positional.push(t);
  }

  const subcommand = positional[0] ?? null;
  if (!hasFilter || subcommand === null || !isScript(subcommand)) continue;

  // `pnpm run <script>` names the script one slot over; the shortcut forms
  // (`pnpm test`) are the script themselves.
  const script = subcommand === "run" ? (positional[1] ?? "<script>") : subcommand;
  const affected = Object.prototype.hasOwnProperty.call(
    rootScripts,
    "check:affected",
  )
    ? " For a genuinely scoped run there is `pnpm run check:affected`, which " +
      "includes dependents."
    : "";

  deny(
    `Drop \`--filter\` and run the root script: \`pnpm run ${script}\`. ` +
      `Turbo caches per task, so the root run only re-executes packages whose ` +
      `inputs changed — same speed as filtering. \`--filter\` also scopes to that ` +
      `package alone, skipping packages that depend on it, so it hides real ` +
      `breakage.${affected} ` +
      `(\`--filter\` is still fine for dependency work, e.g. \`pnpm add --filter <pkg> <dep>\`.)`,
  );
}

pass();
