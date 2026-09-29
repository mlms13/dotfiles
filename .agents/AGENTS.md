# User-level guidance

## Taking Notes

`.scratch/` is globally ignored. Keep planning docs and task lists here when
asked by the user.

## GitHub CLI: prefer dedicated subcommands

When reading from GitHub, use the purpose-built `gh` subcommand instead of raw
`gh api` whenever one exists. These are pre-approved and will run without a
permission prompt.

For milestones and PR comments/review threads, a `~/.agents/bin/gh-read` wrapper
is available. Usage is in `~/.agents/tools/gh-read/README.md`.

The tool will allow reading from allowed repos, specified in the allowlist:
`~/.agents/gh-read-repos.json`

## Git Behavior

I manage git. Unless explicitly asked, don't stage, commit, or push anything.
