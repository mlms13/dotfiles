---
name: dev-update
description: Summarize yesterday's task list into a teammate-facing "Done / Doing" update for posting in #dev-updates. Use when the user asks for a "dev update", "standup summary", "what did I do yesterday", or otherwise wants to share recent work with their engineering manager and teammates.
---

# dev-update

Produce a concise stand-up-style summary of yesterday's work from a `today_<date>.md` task list in the current repo's `.scratch/work/` directory.

## Workflow

1. **Locate yesterday's task list.**
   - List `./.scratch/work/today_*.md` in the current repo (sorted).
   - The target is usually the **second-most-recent** file (today's may already exist as a partially-planned list). If only one file exists, that's the target.
   - Show the user the chosen filename and the date it covers and ask them to confirm before proceeding. Do not skip this confirmation.

2. **Read the file and classify items.** For each top-level task:
   - **Done** — checked off (`- [x]`) at the top level, or with all meaningful subtasks checked.
   - **Doing** — top-level unchecked but has checked subtasks (work-in-progress), or explicitly noted as started.
   - **Not started / skipped** — fully unchecked, no progress. Include as "doing" if this is next

3. **Filter for relevance to the audience (teammates + EM).** Include:
   - Linear tickets opened, updated, or closed
   - PRs opened, reviewed, or merged
   - Project planning / scoping work that touches shared deliverables
   - Cross-team coordination (DMs to PMs, design reviews, etc.)

   Exclude:
   - Personal learning / reading
   - Local dev environment / config tweaks
   - Routine planning of the user's own day
   - One-off chores with no team-visible outcome

4. **Extract links.** From each surviving item, pull out:
   - Linear ticket links (`linear.app/...`) — label as `Linear: <link>`
   - GitHub PR links (`github.com/.../pull/N` or `GH 1234`) — label as `Github: <link>`
   - If multiple of the same type (e.g. several tickets published for a project), list each on its own indented line with a short title.
   - If the document does not include relevant links, find them via `gh` or Linear MCP

5. **Render using the template** below. Keep each bullet to one short line; the audience scans quickly. Use the task's own phrasing where possible — don't editorialize.

6. **Output to stdout only.** Do not write a file unless asked.

## Output template

```text
Done:
  - <short description of completed work>
    - Linear: <ticket link>
    - Github: <PR link>
  - <description of a bundle of related items>
    - <Item 1 title>: <link>
    - <Item 2 title>: <link>

Doing:
  - <short description of in-progress work>
    - Linear: <ticket link>
```

Omit a sub-bullet line if the link doesn't exist (don't print `Linear: none`). Omit the `Doing:` section entirely if nothing is in progress.

## Notes

- "Yesterday" means the previous task list file, not literal calendar yesterday — the user may have skipped a day.
- If the chosen file has a `### Supporting Notes` section, skim it for context (e.g. ticket numbers referenced but not linked in the task) but don't quote it verbatim in the output.
