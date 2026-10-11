---
"name": "review-for-simplicity"
"description": "Review a change for unnecessary complexity and duplicated logic. Use when asked whether an implementation could be structurally simpler."
---

# Review for simplicity

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Establish the intended behavior from supplied context and relevant contracts.
Read comparable implementations and nearby abstractions; retrieve ticket
details only when needed to understand scope.

- Is the implementation more complicated than the requirement demands?
- Find meaningful structural simplifications that preserve behavior; avoid
  stylistic rewrites or abstractions without a concrete benefit.
- Check for duplicated existing logic, opportunities to reuse it, and whether
  a refactor would remove the duplication.

### Simplify Acceptance Criteria

In extremely rare cases, a single, poorly-worded AC from the ticket itself might
lead to a more complex implementation than would otherwise be necessary. If you
have access to the ACs themselves, check to see if most of the effort is coming
from one AC, and whether that AC could be worded differently to still produce a
valid outcome with much less code.

Again, this shouldn't happen often, and the cost of flagging it is exceptionally
high (as it involves the human needing to re-scope and approve the ticket
itself), but catching a rogue AC that forces a needlessly heavy implementation
can also be very valuable.

### Scripts

Do not run build, lint, format, or test suites for this review.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
