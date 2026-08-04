---
name: taskify
description: Create and live-maintain an ultra-narrow markdown task checklist,
kept in sync as work progresses. Use when the user types /taskify or asks for a
glanceable live task list / checklist to watch while you work.
---

# taskify

Write a terse markdown checklist of work about to be done, then keep it current.
Brevity and readability beat completeness. Optimize for "at a glance."

## When invoked

1. **Build from session context.** You should have enough context to start work
   (a plan was discussed, a ticket was read, etc.) when this skill is invoked.
   Turn that into the checklist directly — do **not** run a Q&A session.
2. **No context? Ask.** If you genuinely don't know the task yet, ask the user
   for the goal and the rough steps, then proceed.

## File location

- Write to `.scratch/<slug>.md` at the repo root (create `.scratch/` if absent).
- `<slug>`: the Linear/ticket id if known (from the branch name or context),
  lowercased. Otherwise a short kebab slug from the goal.
- After writing, give the user the file path

## Format rules (strict)

- **Every line ≤ 50 chars** including markdown syntax. Aim for ~40.
- **Titles only.** No descriptions, no rationale, no file paths on item lines.
- **Telegraphic style.** Drop articles. Abbreviate. `Add X helper`, not
  `Add a new helper function for X in the foo module`.
- **Minimal code formatting.** Avoid backticks; only use inline code when it's
  the shortest way to communicate.
- Include verification steps when relevant (e.g. "Run typechecking")
- **Dropped/deferred:** strike through and give a short why

## Keep it live

- Check `- [x]` the **moment** an item is done (edit as you go, not in batches)
- Add items as new scope emerges
- Abandoning an item → strike it through, don't remove it.

## Templates

Flat (when < 7 items):

```markdown
# abc-123 — scaffold settings tab

- [x] Add flag to client flag enum
- [x] Add flag to local features config
- [x] Codegen with flag
- [ ] Wire flag in flag-config repo
```

Sectioned (for longer task lists):

```markdown
# abc-124 — chip opens override dropdown

## Chip plumbing

- [x] Add pass-through button props
- [x] Forward ref to button
- [x] Spread props onto root button

## Rule card

- [x] Pill = DropdownMenuTrigger
- [ ] Remove sibling pill render

## Verify

- [x] Typecheck + lint touched files
- [ ] Keyboard: open via Enter/Space

## Deferred

- ~~Disabled chip state~~ — no Figma variant
```
