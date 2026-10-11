---
"name": "review-rules"
"description": "Review a change against repository instructions and file conventions. Use when asked to check compliance with AGENTS.md, CLAUDE.md, or project rules."
---

# Review rules

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Find applicable repository instructions, including scoped AGENTS.md, CLAUDE.md,
contributor guidance, and project rules. Read symlinked or duplicated guidance
once. Apply each rule only within its scope.

- Check the change against those rules, especially requirements not enforced
  by existing linters.
- For new files, check names and placement against explicit guidance and
  comparable siblings.

Always cite documentation or established conventions when reporting a violation.
No personal preferences or invented rules beyond what the repo provide.s

Do not run checks that CI handles (build, lint, format, tests). Assume that your
responsibility is more nuanced than what a linter can handle.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
