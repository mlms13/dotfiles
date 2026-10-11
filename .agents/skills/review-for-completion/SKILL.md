---
"name": "review-for-completion"
"description": "Review whether a change satisfies its claimed acceptance criteria and tests their behavior. Use when asked whether a ticket or scoped PR is complete."
---

# Review for completion

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Identify the ticket from supplied context, branch, commits, or PR body. Read
its acceptance criteria before the diff. Establish which ACs the change claims;
do not demand deferred ACs from an explicitly partial change. If the
ticket or claimed ACs cannot be established, report that limitation instead of
inventing requirements.

- Map each claimed AC to implementation evidence. Flag unmet, partial, or
  quietly reinterpreted criteria.
- Does each claimed AC have a test that would fail on regression? Check the
  ticket's edge cases and unhappy paths. Check for repo norms before requiring a
  test for every edge case.

Reuse supplied context and check results. Run a focused test only to resolve
an AC uncertainty; report results and unverified claims. Leave routine build,
lint, format, and full test suites to CI.

For each finding, identify the claimed AC, the gap, and the proposed change.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
