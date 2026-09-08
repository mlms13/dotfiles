---
name: review-for-substance
description:
  Review a code change for substance — whether it satisfies its ticket's
  acceptance criteria, tests them appropriately, serves the work it unblocks,
  and holds up on simplicity and type safety. Use when the user says "review
  this for substance", or asks whether a change does what its ticket demands.
---

# Review for substance

Judge whether a change does what it claims. Does the change satisfy its ticket?
Does the implementation support the work that follows? Is it only as complicated
as the problem demands?

## 1. Determine what to review

If the user named a target (a PR number, a branch), use that. Otherwise inspect
`git status --short` and pick, in preference order: unstaged work, then staged
work, then commits on this branch that aren't on the target branch
(`git log --oneline <base>..HEAD`). Don't assume the whole branch without first
confirming with the user.

Then identify the ticket related to the change. Check the branch name, commit
messages, or PR body; if none of those name it, ask the user.

## 2. Gather the intent

Read the ticket's acceptance criteria before reading the diff and use those as
the spec to judge the diff against. Find tickets unblocked by this work and read
enough to understand what each needs from this work.

## 3. What to look for

### Acceptance criteria

- Is every AC demonstrably satisfied? Flag any that are unmet, partially met,
  or quietly reinterpreted.

### Tests

- Does each AC have a test that would fail if the behavior regressed?
- Are the ticket's unhappy paths covered? Don't suggest over-testing relative to
  repo norms, but ACs should usually be covered.

### Upcoming work

- Does the implementation understand the spirit of the work, and what downstream
  work will need from it? We want to avoid future work having to undo this work.

### Simplicity

- Is anything over-complicated, given what the ticket asks?
- Are there meaningful opportunities (structural, not stylistic) to simplify?
- Does the new code duplicate existing code? Is a refactor needed?

### Type safety

- Is type safety strictly respected? No unjustified runtime assertions, escapes
  to `any`, or unchecked narrowing?
- Find holes in correctness that could be closed at the type level, states that
  shouldn't be representable, assertions a narrower type would make unnecessary.

## 4. Report

A flat, numbered list of findings, grouped by file. Each item references a line
or function and states what needs to change and which concern it fails (an AC,
an unblocked ticket, a type hole). Keep each finding to a sentence or two.

Findings will be handed back to the implementor. Acting on these findings takes
valuable time. Only report findings that are worth the implementor's time.

If everything is in good shape, say so. A clean report is a valid outcome.

## 5. Applying changes

Be ready to make the edits, but **do not touch anything until the user
explicitly says to.** Offer, then wait.
