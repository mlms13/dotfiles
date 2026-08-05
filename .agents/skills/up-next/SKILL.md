---
name: up-next
description: Maintain a terse running checklist of current and upcoming work in .scratch/up-next.md, kept in sync with git status, recent history, and project docs. Use when the user asks what to work on next, what's in progress, or to review the up-next list.
---

# Up next

A running scratch checklist of what we're working on now and what's next. It is
not a PRD, epic, or issue tracker — it's a glance-able list for jumping between
concurrent personal projects. Source of truth lives at `.scratch/up-next.md`.

## Setup (every time, in order)

1. Check for a `.scratch/` directory in the project root.
   - If missing, ask the user before creating it. On yes: create `.scratch/`
     and add `.scratch/` to `.gitignore` (create `.gitignore` if absent; skip
     the line if already ignored).
2. Check for `.scratch/up-next.md`. If missing, create it empty (just `# Up next`).

## Then branch on the file's contents

**If `up-next.md` already has items** → verify and refresh it:
- Read it, then check `git status` and recent `git log` to confirm items are
  still accurate (mark finished work `[x]`, drop stale items per the rules below).
- If you're mid-session and already have working context, fold that in too —
  reflect what we just finished and what we're actively doing.

**If `up-next.md` is empty (or new)** → propose a list:
- Gather signal from everything available: `git status`, recent `git log`,
  project docs (plan/TODO/design files, `CONTEXT.md`, `docs/`), and any linked
  issue tracker (gh CLI, etc.) if one is configured.
- Prioritize finishing in-progress work (including reviewing uncommitted work)
- Draft a short list of what makes the most sense to pick up next, then confirm
  with the user before writing it.

## Format rules (strict)

- Every item is a markdown task-list line: queued uses `[ ]`, done uses `[x]`.
  Mark the active item by keeping its `[ ]` checkbox and appending a ` 🚧`
  suffix — do NOT use `[~]` or other non-standard checkbox chars, since glow
  (goldmark) only renders `[ ]`/`[x]` and falls back to a plain bullet otherwise.
- Terse: **≤ 60 chars per line, no wrapping, no sub-bullets, no descriptions.**
- Order: the active (🚧) and queued items at the top; a `---` separator; then
  completed items below it.
- Keep **at most 3 completed** items — delete the oldest beyond that freely.
- Keep **at most 7** active/queued items. Don't exceed unless the user
  explicitly says to.
- Never delete an incomplete (`[ ]`) item without confirming with the user.

## Example

```md
# Up next

- [ ] Write an npm publish script for the @foo/bar sub-package 🚧
- [ ] Wire up CI cache for pnpm
- [ ] Add e2e smoke test for login

---

- [x] Update TypeScript to v6
- [x] Drop Node 18 from the CI matrix
```

## After updating

Show the user the current list (or just the changed lines) so they can see at a
glance what's now and what's next.
