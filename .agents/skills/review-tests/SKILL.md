---
"name": "review-tests"
"description": "Review tests against the repo's testing conventions, scope, and redundancy. Use when asked to review test quality or trim excessive tests."
---

# Review tests

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Read testing guidance and comparable tests. Understand repo-specific
expectations: total coverage or happy paths, customary exception cases, and
differences between unit and integration tests.

Prefer repo norms over your own expectations or a "total coverage" policy.

Beyond this, look especially for:

- Over-testing e.g. assertions outside a tests's primary scope
- Redundant tests or tests of paths that cannot realistically be reached
- Opportunities to simplify or combine test cases
- However, be cautious of over-merging. Tests with "and" or "or" in the name
  might signal a single test that is doing too much

Look for ways to factor out common helpers, fixtures, and factories. But be
mindful of the balance between "real code" under test vs test helpers (as the
helpers themselves can obscure what real code is actually being tested).

You may run targeted, specific tests to resolve uncertainty, but avoid running
the full suite (or linting, or formatting). Your job is not to replicate CI.

Similarly, your job is not to compare tests to their underlying AC. Trust that
other review steps will check for substance and accurace.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
