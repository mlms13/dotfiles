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
