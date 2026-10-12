# gh-read

A shared GitHub reader for Codex, Claude Code, and the terminal. Requires Node
24+ and GitHub CLI at `/opt/homebrew/bin/gh` on this Mac. No npm dependencies or
build step. Uses your existing GitHub CLI login and prints one JSON array after
fetching all pages.

```sh
~/.agents/bin/gh-read milestones mlms13/dotfiles
~/.agents/bin/gh-read pr-comments mlms13/dotfiles 123
~/.agents/bin/gh-read pr-review-comments mlms13/dotfiles 123
~/.agents/bin/gh-read pr-threads mlms13/dotfiles 123
```

- `milestones`: open and closed milestones.
- `pr-comments`: conversation comments. GitHub's issue-comments endpoint also
  accepts issue numbers.
- `pr-review-comments`: flat inline review comments, including reply IDs.
- `pr-threads`: structured review threads with resolution state, file locations,
  and all comments/replies. Paginates both threads and nested comments.

Prefer dedicated `gh` subcommands when they provide the data you need.

## Install

Source lives in `~/.agents/tools/gh-read`. The installer copies the executable
code into `~/.agents/lib/gh-read` and creates `~/.agents/bin/gh-read`. These are
installed copies, so editing the source does not change an approved executable.

```sh
node --test ~/.agents/tools/gh-read/gh-read.test.mjs
node ~/.agents/tools/gh-read/install.mjs         # both agents
node ~/.agents/tools/gh-read/install.mjs codex   # Codex only
node ~/.agents/tools/gh-read/install.mjs claude  # Claude only
```

Codex gets a rule in `~/.codex/rules/gh-read.rules` for the launcher's absolute
path. Claude gets the equivalent Bash allowance merged into its user-level
`~/.claude/settings.json`, plus ask rules for edits to the installed wrapper
and allowlist. Existing settings are preserved. Restart the selected agents to
reload permission changes. Agents should invoke the launcher as
`~/.agents/bin/gh-read`, so it stays portable across machines), not `node` on
the source file.

Install and update through the agent's normal approval mechanism. The installer
pins the current Node executable, so rerun it after replacing that Node version.
It is deliberately not itself allowlisted.

## Repositories and public dotfiles

The active allowlist is `~/.agents/gh-read-repos.json`. It stays local and is
read on each invocation. Edit that file to change repositories; no reinstall is
needed. Installation preserves it. On first installation, the installer migrates
the earlier `~/.codex/gh-read/repos.json` if present; otherwise it copies
`repos.example.json`. Repository names are matched case-insensitively.

Track the source, tests, installer, and example allowlist. Keep the actual
allowlist, installed copies, and generated Codex rule ignored: these contain
local repository choices or machine-specific paths. No credentials are copied.

## Scope of the allowance

The wrapper accepts only the four operations above, an allowlisted repository,
and (where needed) a positive PR number. It forwards no arbitrary endpoints,
methods, headers, flags, input files, or query text. REST uses GET; GraphQL uses
POST with two fixed read queries and JSON variables.

The small shell launcher clears the environment before starting its pinned
Node runtime, including `NODE_OPTIONS`. The reader pins GitHub CLI and
`github.com`, and uses the normal `~/.config/gh` login directory. Caller-provided
host, token, proxy, and configuration overrides are not forwarded.

An agent's command allowance trusts the installed launcher, script, allowlist,
and runtimes; it does not verify their contents. Keep them protected from
unapproved edits. Codex's filesystem policy in this environment protects
`~/.agents`. Claude's Edit ask rules cover file tools, but do not provide OS-level
protection from arbitrary shell programs; use sandbox filesystem restrictions
when that stronger boundary is needed. Ordinary `gh api` permissions are unchanged.

References: [GitHub CLI](https://cli.github.com/manual/gh_api),
[GraphQL](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql),
[Codex rules](https://learn.chatgpt.com/docs/agent-configuration/rules),
[Claude permissions](https://code.claude.com/docs/en/permissions).
