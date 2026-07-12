-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua

vim.opt.colorcolumn = "80,120"

-- Emit a terminal title so tmux's pane border shows the file, not the hostname
vim.opt.title = true
vim.opt.titlestring = "%t" -- just the filename; use "%f" for the relative path

-- Only format with prettier in projects that define a prettier config
-- (checked via `prettier --find-config-path`, so package.json fields count);
-- elsewhere the formatting.prettier extra stays inert and LSP formatting wins
vim.g.lazyvim_prettier_needs_config = true
