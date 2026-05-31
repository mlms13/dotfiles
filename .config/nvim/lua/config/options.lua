-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua

vim.opt.colorcolumn = "80,120"

-- Emit a terminal title so tmux's pane border shows the file, not the hostname
vim.opt.title = true
vim.opt.titlestring = "%t" -- just the filename; use "%f" for the relative path
