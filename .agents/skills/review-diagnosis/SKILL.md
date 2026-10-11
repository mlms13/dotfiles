---
"name": "review-diagnosis"
"description": "Adversarially verify a bug report's diagnosis and proposed fix, especially for agent-written reports and patches. Use when asked to challenge a diagnosis; this is not a routine review step."
---

# Review diagnosis

## Scope

If told what to review, use that.

Otherwise, inspect `git status --short`; prefer unstaged changes, or staged if
no unstaged exist. If all work is committed and the branch holds a single unique
commit, use that. Stop and ask before reviewing an entire multi-commit branch.

## Instructions

Beyond the diff itself, your objective is to review the reasoning behind the
change (the diagnosis that led to this specific diff). This includes any
diagnosis you can infer from the change itself, as well as any explicit
explanation available to you as either a PR description or bug report.

Don't assume a reasonable-looking code change is actually fixing the right
problem. Don't assume that passing CI makes the diff "safe."

Consider that the diagnosis and proposed fix could be fundamentally wrong. A
misdiagnosis might lead to fixing a symptom rather than the root cause, hiding
the true problem and making it harder to identify later.

- Separate observed symptoms from claims about cause. Identify each causal
  claim, including assumptions behind the proposed fix.
- Consider competing diagnoses that explain the same symptoms. What evidence
  would distinguish them?
- Verify each claim where possible by tracing the code, reproducing the
  behavior, or running a focused experiment. Reuse supplied evidence and check
  results.

Consider yourself the last line of defense against an incorrect fix that no
human has asked for, and no human has reviewed as thoroughly as you. Claims that
you are not able to verify empirically should be reported as unverified rather
than assumed to be correct.

## Reporting Findings

Separate each claim into verified, unverified, and refuted. Prioritize the most
consequential refutations and uncertainties.

- For refuted claims, explain the refutation and cite the evidence.
- For unverified claims, describe the risk if the claim is wrong and identify
  who might have more context or what could verify it. Keep this to a sentence
  or two per claim.
- For verified claims, summarize the supporting evidence and any limits on
  what it establishes.

Offer fixes, but edit only when explicitly authorized.
