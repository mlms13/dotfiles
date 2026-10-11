---
"name": "review-prose"
"description": "Review comments, READMEs, docs, plans, and other non-code text for clarity, brevity, and duplication. Use when asked to review prose or comment style."
---

# Review prose

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Review any prose in the reviewable scope that is written with a human or agent
audience in mind. This may include code comments, READMEs, docs, plan files, and
agent-specific guidelines. Don't worry about the code itself other than to
confirm the accuracy of the comments you are reviewing.

The primary goal is clarity. We want to boost signals and cut noise. Assuming
the prose was written by an agent, less is often more. Language and sentence
structure should be plain and clear, and every line should earn its place.

If the repo has specific guides for written prose (e.g. comment style, markdown
guides), make sure those were followed. If not, fall back to repo norms. Beyond
that, consider the following:

- Public doc comments: Focus on what the code does, not specifics of how it's
  used. Highlight what a consumer needs to know, tersely. No ticket IDs, plan
  file references, or ADRs cited in public comments.
- Internal comments: Never restate the code. Clarifying confusing code is often
  a signal that the code itself should be less confusing. The best case (rare)
  is to provide brief rationale and clarifying context that the code itself
  cannot convey.
- Other prose: Avoid duplication; prefer a single authoritative home. Avoid
  putting text that is likely to churn (e.g. as features change) in longer-term
  docs (like READMEs, AGENTS files)

Trust that CI will catch the obvious (build, lint, formatting, tests), and don't
run those checks for this review.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
