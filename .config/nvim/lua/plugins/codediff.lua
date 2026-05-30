-- codediff.nvim is pulled in as a dependency of neogit (for the `d`-opens-diff
-- integration), but a dependency only loads when its parent does. Give it its
-- own `cmd` trigger so `:CodeDiff` works without opening Neogit first.
return {
  "esmuellert/codediff.nvim",
  cmd = "CodeDiff",
}
