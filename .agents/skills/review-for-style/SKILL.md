---
name: review-for-style
description: Review a code change for signal-to-noise before opening a PR — trimming needless comments, redundant or over-asserting tests, and misplaced files. Use when the user says "review this for style", "review this code/branch/PR for style", or otherwise asks to tighten up a change before review.
---

# Review for style

Trim a change before it becomes a PR. The goal is signal-to-noise: cut anything
that makes the diff harder to review or the code harder to skim. Every line
should earn its place.

## 1. Determine what to review

If the user named a target (a PR number, a branch), use that. Otherwise inspect
`git status --short` and pick:

- **Unstaged work is present** → review it first. When you've reported those
  findings, check for staged work and ask whether to continue with staged.
- **Only staged** → review it.
- **Everything committed** → find commits on this branch that aren't on the
  target branch (`git log --oneline <base>..HEAD`). Tell the user what you
  found and offer to review that range; don't assume the whole branch.

## 2. Calibrate to the codebase

Before judging anything, determine what this repo expects. Check relevant docs
and guidelines, and (more reliably) a couple of comparable existing files.
You're looking for the local norm, not your own preference. If you can't
determine a norm, or if there are conflicting patterns to follow, raise this
with the user before continuing.

## 3. What to look for

### Comments

- For public, doc-style comments, a good comment is very terse and explains only
  what a public consumer needs to know to use the function.
- Public-facing comments never reference ADRs, tickets, or local plans.
- For internal comments...
  - The best comment is none at all. Comments that restate code are noise.
  - Comments that explain unclear code signal that the code should be more clear
  - Comments that explain rationale that can't be inferred from the code
    survive, but they should be brief.

### Tests

First determine the repo's testing expectation: total coverage, or happy path
only? Are one or two exception cases customary? Is the unit-testing strategy
different from the integration strategy? Then check the change's tests against
that norm, watching for:

- Over-testing relative to the repo's conventions.
- Tests asserting things outside their primary scope.
- Tests that could be simplified or merged.
- Redundant tests, or tests covering code paths that can't realistically be
  reached.

### File naming and structure

For new files: does the placement match the rest of the codebase? Is there
explicit guidance on where things go, and was it followed? Do the names match
sibling conventions?

## 4. Report

A flat, numbered list of findings, each tied to a file and proposing a change:

```
1. In schema.ts, a new comment restates the code and should be removed
2. The third test in service.test.ts re-asserts behavior already covered in
   tests 2 and 4. The whole test is redundant and should be removed.
```

Order by file. Keep each finding to a sentence or two — the fix should be
obvious from the line. If a finding is a judgment call against an unclear
convention, say that instead of asserting it.

Finding nothing is a real outcome. If the change is already tight, say so and
stop; don't manufacture findings to fill the list.

## 5. Applying changes

Be ready to make the edits, but **do not touch anything until the user
explicitly says to.** Offer, then wait.
