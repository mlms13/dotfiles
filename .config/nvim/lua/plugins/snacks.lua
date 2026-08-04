-- macOS filesystem noise we never want to see anywhere
local macos = {
  ".DS_Store",
  ".localized",
  ".Spotlight-V100",
  ".Trashes",
  ".fseventsd",
  ".TemporaryItems",
  "__MACOSX",
}

-- Claude Code worktrees: each one is a full checkout of the same repo, so each
-- file shows up once per worktree in the picker.
local worktrees = {
  "**/.claude/worktrees",
}

-- Heavy/generated dirs: still visible in the explorer tree, but not worth
-- indexing or grepping through in the picker
local heavy = {
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  ".venv",
  "venv",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache",
}

-- when opening vim in ~ (e.g. to edit config files), ignore heavy dirs with
-- nothing worth editing
local home = {
  "Library/Caches",
  "Library/Containers",
  "Library/Developer",
  "Library/pnpm",
  ".asdf",
  ".rustup",
  ".npm",
}

-- Never worth showing anywhere, explorer included.
local function always_exclude()
  local out = vim.list_extend({}, macos)
  vim.list_extend(out, worktrees)
  return out
end

-- Everything the files/grep pickers should never walk: the always-hidden set +
-- heavy project dirs + heavy home dirs.
local function picker_exclude()
  local out = always_exclude()
  vim.list_extend(out, heavy)
  vim.list_extend(out, home)
  return out
end

-- Move focus out of a floating picker window toward `tmux_flag` (e.g. "-L").
-- vim-tmux-navigator relies on `wincmd`, which misbehaves from a float, so we
-- talk to tmux directly.
local function nav_out(tmux_flag, wincmd)
  if vim.env.TMUX then
    vim.fn.system({ "tmux", "select-pane", "-t", vim.env.TMUX_PANE, tmux_flag })
  else
    vim.cmd("wincmd " .. wincmd)
  end
end

return {
  "folke/snacks.nvim",
  opts = {
    picker = {
      sources = {
        -- Explorer shows everything (incl. gitignored node_modules, .env),
        -- minus macOS noise and worktree copies of the repo
        explorer = {
          hidden = true,
          ignored = true,
          exclude = always_exclude(),

          -- Allow <c-hjkl> to pass through to tmux (like they do in normal
          -- splits). The catch: the explorer focuses a *floating* picker popup,
          -- not a split. So we need special handling to emulate the behavior of
          -- vim-tmux-navigator.
          --
          -- Note: this assumes the explorer is on the left (so <c-h> leaves vim
          -- entirely, and <c-l> moves back to the main vim split).
          win = {
            list = {
              keys = {
                ["<c-h>"] = function()
                  nav_out("-L", "h")
                end,
                ["<c-j>"] = function()
                  nav_out("-D", "j")
                end,
                ["<c-k>"] = function()
                  nav_out("-U", "k")
                end,
                ["<c-l>"] = function()
                  vim.cmd("wincmd l")
                end,
              },
            },
          },
        },
        -- <leader>ff: index hidden + gitignored files (so .env is findable),
        -- but prune heavy dirs like node_modules so they're never walked
        files = {
          hidden = true,
          ignored = true,
          exclude = picker_exclude(),
        },
        -- grep (<leader>sg etc.): same idea — search hidden/gitignored files,
        -- but never grep into node_modules and friends
        grep = {
          hidden = true,
          ignored = true,
          exclude = picker_exclude(),
        },
      },
    },
  },
}
