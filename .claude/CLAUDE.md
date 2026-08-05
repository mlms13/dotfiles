# User-level guidance

## GitHub CLI: prefer dedicated read subcommands over `gh api`

When reading from GitHub, use the purpose-built `gh` subcommand instead of raw
`gh api` whenever one exists.

These are read-only and pre-approved, so they run without a permission prompt.
Reserve `gh api` for endpoints that have **no** dedicated command.
