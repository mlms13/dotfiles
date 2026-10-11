---
"name": "review-for-correctness"
"description": "Review a change for bugs, prioritizing its riskiest or most complex behavior. Use when asked to verify correctness or assess failure modes."
---

# Review for correctness

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Review the diff for correctness. Identify high-risk and complex portions of the
change; prioritize those. For each of the highest risk areas, what is the most
severe plausible failure mode? The worst thing that could happen if this change
ships today? Does the change itself adequately handle those cases?

Where possible, empirically verify potential bugs you identify or unexpected
potential failures that the change itself doesn't account for. Use the smallest
experiment or focused test needed to verify the issue. Only report issues that
you are confident about, including evidence and remaining uncertainty.

Leave routine build, lint, format, and full test suites to CI.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
