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

-- Heavy/generated dirs: still visible in the explorer tree, but not worth
-- indexing or grepping through in the picker
local heavy = {
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
}

-- macos + heavy, without mutating either list
local function macos_and_heavy()
  return vim.list_extend(vim.list_extend({}, macos), heavy)
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
        -- minus pure macOS noise
        explorer = {
          hidden = true,
          ignored = true,
          exclude = macos,

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
          exclude = macos_and_heavy(),
        },
        -- grep (<leader>sg etc.): same idea — search hidden/gitignored files,
        -- but never grep into node_modules and friends
        grep = {
          hidden = true,
          ignored = true,
          exclude = macos_and_heavy(),
        },
      },
    },
  },
}
