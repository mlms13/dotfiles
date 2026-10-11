---
"name": "review-for-spirit"
"description": "Review whether a change serves its larger goal and the work it unblocks. Use when asked to check downstream expectations or alignment beyond ACs."
---

# Review for spirit

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Identify the ticket from supplied context, branch, commits, or PR body. Before
the diff, read the ticket's intent and acceptance criteria, then tickets it
unblocks and relevant upcoming work. Use supplied bodies; retrieve only missing
context. If unavailable, state the limitation instead of inventing needs.

Determine the larger goal and what downstream work expects from this change.
Flag mismatched contracts or decisions that would force planned work to undo
this implementation, even if its ACs pass. Tie each finding to a concrete
downstream requirement; avoid speculative future-proofing.

Do not run build, lint, format, or test suites for this review.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
