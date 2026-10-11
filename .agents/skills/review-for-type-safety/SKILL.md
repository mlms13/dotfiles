---
"name": "review-for-type-safety"
"description": "Review a change for type holes and errors preventable at compile time. Use when asked whether stricter types could improve correctness."
---

# Review for type safety

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Read relevant types, callers, and boundary validation to establish what values
can reach the code in this change. Identify the types of (future, potential)
errors that could be prevented by stronger types. Identify cases where code is
overly verbose or complex in ways that could have been simplified if better
types were used, or the types were verified elsewhere (e.g. at the boundary).

- Flag unjustified assertions or escapes to `any`, particularly those that could
  be avoided with better types.
- Be suspicious of narrowing, guards, and runtime typechecking, particularly if
  it's happening anywhere other than a boundary (e.g. over the network, reading
  from the file system, or dealing with user input). Validating untrusted input
  is good, but doing so should happen once, at the edge.
- Are there potential holes in correctness? Does the data model permit values
  that would yield invalid states? Be particularly wary of booleans and
  particularly combinations of booleans.

You may run focused checks when performing experiments needed to verify your
claims, but don't run routine build, lint, typecheck, etc scripts; trust that
the CI has those covered.

## Reporting Findings

List each finding, clearly identifying the file name, line number, and a
description of the rule that was violated + a proposed change if relevant. No
more than one or two sentences for each finding.

Be courteous of the implementor's time. Each finding is a request for them to
switch context and consider your feedback. No valuable, actionable findings is a
valid outcome.

Offer fixes, but edit only when explicitly authorized.
