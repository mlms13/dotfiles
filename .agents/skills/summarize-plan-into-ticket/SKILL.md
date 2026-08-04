---
name: summarize-plan-into-ticket
description: >-
  Reconcile a verbose local plan markdown file against a remote (Linear or
  Github) ticket, then rewrite the ticket to read like the version we
  wish we'd started with. Use when the user wants to clean up local plan files.
---

# Summarize Plan Into Ticket

## Purpose

Local plan files (PLAN*.md or*-PLAN.md) accumulate when work needs to be
further planned locally (e.g. if the original ticket didn't provide specific
enough detail).

Once the work ships, those plans become orphaned context that we don't need to
keep around, but they may contain decisions and context worth preserving.

This skill allows us to rewrite the original ticket so the local markdown files
can be deleted. The goal is **not** to dump all the technical details to the
original ticket. Instead we summarize the plan and make the original ticket
read like the well-scoped, well-explained version we wish we'd had up front.

## When to apply

Triggers:

- User mentions cleaning up local planfiles
- User asks to "summarize this plan into the ticket" or "update the ticket from
the plan"
- User wants to know if a local plan is safe to delete

## Workflow

Work through a single plan at a time.

### 1. Pair the plan file to the remote ticket

Filename may encode the ID (e.g. `PRO-137-PLAN.md` → PRO-137). If not, read the
plan's first lines — they typically link the ticket. If still ambiguous, ask.

### 2. Check ticket status FIRST — bail early if not complete

If it's not clear whether we're dealing with Linear or Github, ask the user.
Then, fetch the remote ticket and ensure the status is complete.

- **Done / completed** → proceed
- **Reviewed** (PR approved, awaiting merge/deploy) → user judgment call.
Surface the status, confirm whether to treat as close-enough-to-done.
- **In Progress / Backlog / anything else** → **stop**. No point summarizing a
plan whose work isn't shipped; the plan may still be the source of truth. Tell
the user, suggest skipping.

This early check saves the rest of the work. Always do it before reading the
plan in depth.

### 3. Read the ticket AND the plan

Capture:

- ACs as originally written (often missing or informal)
- Original questions, if any (these often matter — see template)
- Attached PR titles (gives a clue about what actually shipped)
- Rejected alternatives the plan discusses
- Out-of-scope / follow-up items
- Cross-references to other tickets

If multiple plan files exist for one ticket , read all of them and fold the
followups content into the "Out of scope" section.

### 4. Reconcile: AC vs. plan

Explicitly ask: *Does the plan contradict the original ACs? If so, which
actually got implemented?* Find relevant PRs, commits, or search the code to
determine what got implemented.

Surface contradictions to the user — don't paper over them. Common shapes:

- Plan narrowed scope from the AC
- Plan picked one of several alternatives the AC presented as open
- Plan added scope the AC didn't mention (e.g. an empty-state design)

### 5. Draft the rewritten description

- Use the template below
- Do not use past tense; we're not doing a retrospective. Write as if we were
creating a ticket for future work (but knowing what we know now)
- Do not include code blocks or overly-technical notes. Those may have been
helpful during technical planning, but once they're reflected in the code, we
don't need to repeat them in the ticket.
- **Length target:** ~30-50 lines of markdown for the description body. If you're writing more, you're probably restating the plan instead of summarizing it.

Iterate with the user until the update is approved.

### 6. On approval

- Push the update
- Delete the local plan file(s)

## Template

Adapt freely. Sections to include depend on what the original ticket had and
what the plan contributed.

```markdown
## Problem
<!-- Or "Acceptance criteria" if the original ticket had real ACs. Keep the AC list intact, just tighten wording. If the ticket described a bug or felt exploratory, lead with Problem instead. -->

[Concrete description of the gap or required behavior, present tense, no "we built X" framing.]

## Approach
<!-- Only include if the plan made a non-obvious choice between alternatives. Skip for simple "just do the thing" tickets. -->

[The chosen approach, briefly.]

Rejected alternative: [name]. [One-line why-not — blast radius, complexity, no concrete need, etc.]

## Scope

<!-- Numbered list, grouped by area (Backend / Frontend / etc.) when relevant.
Each item is the WHAT and the load-bearing WHY, not file-by-file instructions. -->

1. ...
2. ...

## Out of scope

<!-- Followups + explicitly-rejected work. One bullet each. -->

- ...
- ...

## Open questions, resolved
<!-- Only if the original ticket had a numbered questions section. -->

- *Original question?* Resolution.
- *Original question?* Resolution.
```
