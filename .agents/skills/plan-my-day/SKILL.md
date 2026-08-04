---
name: plan-my-day
description: Turn a rough list of personal tasks into a concrete, ordered, nested checklist of tiny next-actions through thorough Q&A. Use when the user says a phrase like "plan my day" or otherwise hands over a grab-bag of unrelated to-dos and wants help structuring them. Do NOT use this for designing the implementation of a single feature or PR.
---

# Plan My Day

## What this skill is

A conversational planning session covering a **mixed bag of unrelated tasks** the
user wants to get done today. Output is a nested markdown checklist of small
subtasks (≈5 min each) that covers each task end-to-end.

**This skill produces a task list. It does not execute the tasks.** Even if a
subtask could be resolved trivially with available tools (a quick grep, a
Linear lookup), do not do it during this skill. Capture a subtask and move on.

## Distinguish from other planners

- "Plan my day" / "what should I work on today" → **this skill**
- "Plan the implementation of X"  → plan mode or the `Plan` agent

If the user gives you one cohesive piece of work, stop and ask whether they
want day-planning or implementation-planning before using this skill.

## Tone

- Interactive. This is a back-and-forth conversation.
- Terse and thorough. This is a working session.
- Never guess intent. When in doubt, ask.

## Workflow

Plans are stored (from the project root) inside `.scratch/work`

### Gather Requirements

1. **Fetch today's calendar.** Use the Google Calendar MCP (or ask the user, if
   the MCP server is not configured). Collect accepted and tentative events for
   today; ignore declined events. Events render at the top (see template).

1. **Find carryovers.** `ls -rt .scratch/work` If the most recent task list
   includes incomplete tasks, ask the user which ones to bring in to "today."

1. **Capture additional input.** If the user did not invoke the skill with a
   list of tasks, ask them to dump every task they're considering.

### Refine Tasks

1. **Work through each task with the user, one at a time.** Be thorough — never
   guess the user's intent. Clarifying questions are encouraged. For each task:
   - **Pull context proactively** before asking the user. Use whatever is available:
     - Code in the current repo (read files; `git status`, `log`, `branch`)
     - Linear MCP — ticket status, comments, linked PRs
     - GitHub (`gh` CLI) — open PRs, review comments, CI state
     - Slack MCP if available — recent threads
     - Memory files for ongoing-project context
   - **Ask the user** what context can't answer: scope, intent, urgency, what
     "done" looks like, who needs to be looped in. Use `AskUserQuestion` for
     2–4 discrete options; ask open-ended otherwise.
   - **Break it down into tiny subtasks** — each one ≈5 minutes, a single
     verb + concrete object (file, URL, person). Nest freely; mid-level
     groupings are fine.
   - **Note urgency for ordering** (don't write it into the task). Capture
     blockers as their own subtasks ("ping Alice about X").
   - **Follow the template (below)** and write changes frequently.

1. **Order the tasks.** Use urgency the user gave you. Default tiebreak:
   quick-unblocks first (send pings so others can start), then high-leverage
   focused work, then admin. Confirm the order before finalizing.

1. **Present the final checklist** as plain markdown. Nested checkboxes, one
   line each, no commentary inside the list.

1. **Then highlight expansion opportunities.** After listing tasks, identify
   subtasks you could resolve right now that would make the list itself more
   complete (e.g. "I can look up that test ID, find Alice's PR feedback, or pull
Bob's thread — want me to do any of those so we can expand those branches?").

## Output template

Line lengths should be under 80 characters. If a task needs more context than
that, split into subtasks or move extra notes into the "Supporting Notes" below.

```markdown
# Jul 12, 2025

## Today's schedule

- **9:30–10:00 MT** — Sync with Design · [Meet](https://meet.google.com/xxx)
- **12:00–1:00 MT** — Outage Postmortem · [Meet](https://meet.google.com/yyy)

## Tasks

- [ ] Get the work for Feature ABC merged
  - [ ] Collect all the feedback from Alice on the backend PR (link)
  - [ ] Finish the frontend work
    - [ ] Add the save button to the form
    - [ ] Find a valid item ID to test against
    - [ ] Seed any necessary data
    - [ ] Test the workflow in the browser using seeded data
    - [ ] Commit, push, PR, assign to reviewers
    - [ ] Merge it
  - [ ] Send a release message in Slack when the final deploy completes

- [ ] Respond to Bob's question about how Feature XYZ works
  - [ ] Research that weird interaction between Foo and Bar first
  - [ ] Write a minimal example
  - [ ] Put the findings into Bob's thread in the #dev channel

## Supporting Notes

-- empty initially, unless copied from a previous day
```
