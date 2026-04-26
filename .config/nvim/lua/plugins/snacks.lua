return {
  "folke/snacks.nvim",
  opts = {
    picker = {
      sources = {
        -- Show hidden files in the sidebar explorer
        explorer = {
          hidden = true,
        },
        -- Show hidden files in <leader>ff / find files
        files = {
          hidden = true,
        },
        -- Show hidden files in grep (<leader>sg etc.)
        grep = {
          hidden = true,
        },
      },
    },
  },
}
