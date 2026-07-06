#!/usr/bin/env node
// PreToolUse (Bash) hook. Steer READ-only `gh api <endpoint>` calls toward the
// native `gh` subcommand that does the same read (which is allow-listed, so no
// prompt). Writes (POST/PUT/PATCH/DELETE or -f/--field flags) are left alone to
// fall through to a normal permission prompt. Endpoints with no native
// equivalent (e.g. inline PR review comments, graphql) also fall through.
// Advisory nudge, not a security boundary.

import { readFileSync } from "node:fs";

const command = JSON.parse(readFileSync(0, "utf8"))?.tool_input?.command ?? "";

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

// Isolate the `gh api` invocation (up to the next shell separator).
const m = command.match(/(?:^|[;&|(]|&&|\|\|)\s*gh\s+api\s+([^;&|]*)/);
if (!m) pass();
const apiArgs = m[1];

// --- write detection: leave writes for the normal prompt ---------------------
const methodMatch = apiArgs.match(/(?:^|\s)(?:-X|--method)\s+(\w+)/i);
const method = methodMatch ? methodMatch[1].toUpperCase() : null;
const hasFields = /(?:^|\s)(?:-f|-F|--field|--raw-field|--input)\b/.test(apiArgs);
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const isWrite = method ? MUTATING.has(method) : hasFields; // explicit method wins
if (isWrite) pass();

// --- find the endpoint token (skip flags and their values) -------------------
const tokens = apiArgs.match(/'[^']*'|"[^"]*"|\S+/g) || [];
const VALUE_FLAGS = new Set([
  "-X", "--method", "-f", "-F", "--field", "--raw-field", "--input",
  "-H", "--header", "--hostname", "-q", "--jq", "-t", "--template", "--cache",
]);
let endpoint = null;
for (let i = 0; i < tokens.length; i++) {
  const t = tokens[i];
  if (VALUE_FLAGS.has(t)) { i++; continue; } // skip flag + its value
  if (t.startsWith("-")) continue;           // standalone flag
  if (t.includes("=")) continue;             // field like key=value
  endpoint = t.replace(/^['"]|['"]$/g, "");
  break;
}
if (!endpoint) pass();

// --- map read endpoint -> native command -------------------------------------
function suggest(ep) {
  const parts = ep.replace(/^\//, "").split("?")[0].split("/");
  if (parts[0] === "graphql") return null;
  if (parts[0] !== "repos" || parts.length < 3) return null;
  const [owner, repo] = [parts[1], parts[2]];
  const [kind, id, sub] = parts.slice(3);
  if (!kind) return owner.startsWith(":") ? "gh repo view" : `gh repo view ${owner}/${repo}`;
  if (kind === "pulls") {
    if (!id) return "gh pr list";
    if (!sub) return `gh pr view ${id}`;
    if (sub === "files") return `gh pr diff ${id}`;
    if (sub === "reviews") return `gh pr view ${id} --json reviews,latestReviews`;
    return null; // comments (inline) etc. — no native equivalent
  }
  if (kind === "issues") {
    if (!id) return "gh issue list";
    if (!sub) return `gh issue view ${id}`;
    if (sub === "comments") return `gh issue view ${id} --comments`;
    return null;
  }
  if (kind === "actions" && id === "runs" && sub) return `gh run view ${sub}`;
  return null;
}

const native = suggest(endpoint);
if (!native) pass();

deny(
  `Use \`${native}\` instead of \`gh api ${endpoint}\`. The native command is read-only ` +
  "and allow-listed (no prompt); add `--json <fields>` / `--jq` for specific data. " +
  "If it genuinely can't return what you need, do NOT retry — tell the user and let them run the gh api call.",
);
