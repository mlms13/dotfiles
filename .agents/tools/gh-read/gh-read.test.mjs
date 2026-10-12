import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { read, request } from "./gh-read.mjs";
import { install } from "./install.mjs";

const repos = ["mlms13/dotfiles"];
const connection = (nodes, cursor = null) => ({ nodes, pageInfo: { hasNextPage: cursor !== null, endCursor: cursor } });
const threads = (nodes, cursor) => ({ data: { repository: { pullRequest: { reviewThreads: connection(nodes, cursor) } } } });

test("rejects unknown repositories, writes, flags, and malformed PR numbers before making requests", () => {
  const bad = [
    ["milestones", "other/repo"],
    ["milestones", "mlms13/dotfiles/../other"],
    ["milestones", "mlms13/dotfiles?state=all"],
    ["milestones", "mlms13/dotfiles", "--method", "POST"],
    ["milestones", "mlms13/dotfiles", "--input", "secret.json"],
    ["milestones", "mlms13/dotfiles", "--hostname", "example.com"],
    ["milestones", "mlms13/dotfiles", "--", "extra"],
    ["graphql", "mlms13/dotfiles"],
    ["delete", "mlms13/dotfiles"],
    ["pr-threads", "mlms13/dotfiles", "1", "-f", "query=mutation{}"],
    ...["0", "-1", "2147483648", "1;echo hacked", "@secret.json", "1\n"].map((id) => ["pr-threads", "mlms13/dotfiles", id]),
  ];
  for (const args of bad) {
    let called = false;
    assert.throws(() => read(args, repos, () => { called = true; }));
    assert.equal(called, false, JSON.stringify(args));
  }
});

test("empty or malformed allowlists fail closed", () => {
  for (const allowed of [[], {}, [42], null]) {
    let called = false;
    assert.throws(() => read(["milestones", repos[0]], allowed, () => { called = true; }));
    assert.equal(called, false);
  }
});

test("repository names match without regard to case", () => {
  assert.deepEqual(read(["milestones", "MLMS13/DOTFILES"], repos, () => []), []);
});

test("REST operations construct fixed GET endpoints", () => {
  for (const [operation, suffix, numbers] of [
    ["milestones", "milestones?per_page=100&page=1&state=all", []],
    ["pr-comments", "issues/42/comments?per_page=100&page=1", ["42"]],
    ["pr-review-comments", "pulls/42/comments?per_page=100&page=1", ["42"]],
  ]) {
    const calls = [];
    assert.deepEqual(read([operation, repos[0], ...numbers], repos, (...args) => { calls.push(args); return []; }), []);
    assert.deepEqual(calls, [["GET", `repos/${repos[0]}/${suffix}`]]);
  }
});

test("REST pagination combines every page into one array", () => {
  const first = Array.from({ length: 100 }, (_, id) => ({ id }));
  const calls = [];
  const result = read(["milestones", repos[0]], repos, (...args) => {
    calls.push(args);
    return calls.length === 1 ? first : [{ id: 100 }];
  });
  assert.deepEqual(result, [...first, { id: 100 }]);
  assert.match(calls[1][1], /page=2&state=all$/);
});

test("threads paginate both replies and threads with fixed GraphQL queries", () => {
  const responses = [
    threads([{ id: "thread1", isResolved: false, comments: connection([{ id: "a" }], "replies2") }], "threads2"),
    { data: { node: { comments: connection([{ id: "b", replyTo: { id: "a" } }]) } } },
    threads([{ id: "thread2", comments: connection([]) }]),
  ];
  const calls = [];
  const result = read(["pr-threads", repos[0], "42"], repos, (...args) => {
    calls.push(args);
    return responses.shift();
  });
  assert.deepEqual(result.map((thread) => thread.id), ["thread1", "thread2"]);
  assert.deepEqual(result[0].comments, [{ id: "a" }, { id: "b", replyTo: { id: "a" } }]);
  for (const [method, endpoint, payload] of calls) {
    assert.equal(method, "POST");
    assert.equal(endpoint, "graphql");
    assert.match(payload.query, /^\s*query\(/);
  }
  assert.deepEqual(calls[0][2].variables, { owner: "mlms13", name: "dotfiles", number: 42, cursor: null });
  assert.deepEqual(calls[1][2].variables, { id: "thread1", cursor: "replies2" });
  assert.equal(calls[2][2].variables.cursor, "threads2");
});

test("missing PRs and broken pagination fail", () => {
  assert.throws(() => read(["pr-threads", repos[0], "42"], repos, () => ({ data: { repository: null } })), /not found/);
  assert.throws(() => read(["pr-threads", repos[0], "42"], repos, () => threads([], "same")), /repeated pagination/);
  assert.throws(() => read(["milestones", repos[0]], repos, () => ({})), /list response/);
});

test("transport pins gh and hostname and does not forward ambient environment", () => {
  let call;
  request("GET", "repos/mlms13/dotfiles/milestones", undefined, (...args) => {
    call = args;
    return { status: 0, stdout: "[]" };
  });
  assert.deepEqual(call.slice(0, 2), ["/opt/homebrew/bin/gh", ["api", "--hostname", "github.com", "--method", "GET", "--", "repos/mlms13/dotfiles/milestones"]]);
  assert.deepEqual(Object.keys(call[2].env).sort(), ["GH_CONFIG_DIR", "GH_PAGER", "GH_PROMPT_DISABLED", "HOME", "NO_COLOR", "PATH"].sort());
});

test("GraphQL payload is JSON on stdin, not CLI fields", () => {
  const payload = { query: "query { viewer { login } }", variables: { name: "@file" } };
  request("POST", "graphql", payload, (binary, args, options) => {
    assert.deepEqual(args.slice(-4), ["--input", "-", "--", "graphql"]);
    assert.deepEqual(JSON.parse(options.input), payload);
    return { status: 0, stdout: '{"data":{}}' };
  });
});

test("transport fails on HTTP errors, GraphQL errors, invalid JSON, or timeout", () => {
  for (const result of [
    { status: 1, stderr: "denied" },
    { status: 0, stdout: '{"data":{},"errors":[{"message":"denied"}]}' },
    { status: 0, stdout: "not json" },
    { error: new Error("timeout") },
  ]) assert.throws(() => request("GET", "unused", undefined, () => result));
});

test("installer preserves local repos/settings, migrates the old allowlist, and is idempotent", (t) => {
  const home = mkdtempSync(join(tmpdir(), "gh-read-install-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  mkdirSync(join(home, ".codex/gh-read"), { recursive: true });
  writeFileSync(join(home, ".codex/gh-read/repos.json"), '["private/repo"]');
  mkdirSync(join(home, ".claude"));
  writeFileSync(join(home, ".claude/settings.json"), '{"model":"existing","permissions":{"allow":["Bash(git status *)"]}}');
  install(home);
  install(home);
  assert.deepEqual(JSON.parse(readFileSync(join(home, ".agents/gh-read-repos.json"))), ["private/repo"]);
  const settings = JSON.parse(readFileSync(join(home, ".claude/settings.json")));
  assert.equal(settings.model, "existing");
  assert.deepEqual(settings.permissions.allow, ["Bash(git status *)", "Bash(~/.agents/bin/gh-read *)"]);
  assert.equal(settings.permissions.ask.length, 3);
  const rules = readFileSync(join(home, ".codex/rules/gh-read.rules"), "utf8");
  assert.ok(rules.includes(join(home, ".agents/bin/gh-read")));
  writeFileSync(join(home, ".agents/gh-read-repos.json"), '["updated/repo"]');
  install(home);
  assert.deepEqual(JSON.parse(readFileSync(join(home, ".agents/gh-read-repos.json"))), ["updated/repo"]);
});

test("launcher handles spaces/quotes and clears Node preload and PATH overrides", (t) => {
  const home = mkdtempSync(join(tmpdir(), "gh-read quoted' home "));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const launcher = install(home, process.execPath, ["codex"]);
  const result = spawnSync(launcher, ["--help"], {
    encoding: "utf8",
    env: { PATH: "/nonexistent", NODE_OPTIONS: "--require=/nonexistent/evil.cjs", HOME: "/nonexistent" },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Usage: gh-read/);
});
