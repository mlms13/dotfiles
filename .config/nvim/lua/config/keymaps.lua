-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
vim.keymap.set("i", "jk", "<ESC>", { silent = true })
vim.keymap.set("i", "kj", "<ESC>", { silent = true })

-- Unbind LazyVim's default <leader>gg (LazyGit) and hand it to Neogit
pcall(vim.keymap.del, "n", "<leader>gg")
vim.keymap.set("n", "<leader>gg", "<cmd>Neogit<cr>", { desc = "Show Neogit UI" })

-- Take over <leader>gd (Snacks git-diff hunk picker) for CodeDiff
pcall(vim.keymap.del, "n", "<leader>gd")
vim.keymap.set("n", "<leader>gd", "<cmd>CodeDiff<cr>", { desc = "CodeDiff (changed files)" })
