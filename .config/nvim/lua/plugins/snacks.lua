return {
  "folke/snacks.nvim",
  opts = {
    picker = {
      sources = {
        -- Show hidden files in the sidebar explorer, but exclude macOS noise
        explorer = {
          hidden = true,
          ignored = true,
          exclude = {
            ".DS_Store",
            ".localized",
            ".Spotlight-V100",
            ".Trashes",
            ".fseventsd",
            ".TemporaryItems",
            "__MACOSX",
          },
        },
        -- Show hidden files in <leader>ff / find files, but exclude macOS noise
        files = {
          hidden = true,
          ignored = true,
          exclude = {
            ".DS_Store",
            ".localized",
            ".Spotlight-V100",
            ".Trashes",
            ".fseventsd",
            ".TemporaryItems",
            "__MACOSX",
          },
        },
        -- Show hidden files in grep (<leader>sg etc.), but exclude macOS noise
        grep = {
          hidden = true,
          ignored = true,
          exclude = {
            ".DS_Store",
            ".localized",
            ".Spotlight-V100",
            ".Trashes",
            ".fseventsd",
            ".TemporaryItems",
            "__MACOSX",
          },
        },
      },
    },
  },
}
