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
Does the implementation serve the work that follows? Is it no more complicated
than the problem demands?

## 1. Determine what to review

If the user named a target (a PR number, a branch), use that. Otherwise inspect
`git status --short` and pick, in preference order: unstaged work, then staged
work, then commits on this branch that aren't on the target branch
(`git log --oneline <base>..HEAD`). Don't assume the whole branch without first
confirming with the user.

Then identify the ticket the change implements. Check the branch name, commit
messages, and PR body; if none of those name it, ask the user.

## 2. Gather the intent

Read the ticket's acceptance criteria before reading the diff and use those as
the spec to judge the diff against. Find tickets unblocked by this work and read
enough of each to understand what it needs from this work.

## 3. What to look for

### Acceptance criteria

- Is every AC demonstrably satisfied? Flag any that are unmet, partially met,
  or quietly reinterpreted.

### Tests

- Does each AC have a test that would fail if the behavior regressed?
- Are the ticket's edge cases and unhappy paths covered? Judge appropriateness
  against the ACs. Avoid suggesting over-testing, but ACs should be covered.

### Upcoming work

- Does the implementation understand the spirit of the work, and what downstream
  work will need from it? We want to avoid planned work undoing this work.

### Simplicity

- Is anything over-complicated for what the ticket asks?
- Are there meaningful opportunities to simplify — structural ones, not
  stylistic ones?
- Does the new code duplicate existing code? Is a refactor needed?

### Type safety

- Is type safety strictly respected — no unjustified assertions, escapes to
  `any`, or unchecked narrowing?
- Find holes in correctness that could be closed at the type level, states that
  shouldn't be representable, runtime checks a narrower type would make
  unnecessary...

## 4. Report

A flat, numbered list of findings, ordered by file, each tied to a file and
stating what needs to change and which concern it fails (an AC, an unblocked
ticket, a type hole). Keep each finding to a sentence or two.

Findings will be handed back to the implementor. Acting on these findings takes
valuable time. Only report findings that are worth the implementor's time.

If everything is in good shape, say so. A clean report is a valid outcome.

## 5. Applying changes

Be ready to make the edits, but **do not touch anything until the user
explicitly says to.** Offer, then wait.
