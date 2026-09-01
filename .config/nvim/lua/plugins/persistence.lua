-- persistence.nvim (LazyVim default) saves a session per cwd+branch on exit
-- but never loads one back. Restore it when nvim starts with nothing to edit,
-- so a plain `nvim` -- including panes relaunched by tmux-resurrect -- comes
-- back where it left off. Skipped when files or stdin are given, or when
-- running inside another nvim's terminal.
--
-- Lives in the plugin's `init` (which runs during startup) because
-- config/autocmds.lua loads on VeryLazy, after VimEnter has already fired.
-- The snacks dashboard decides whether to open on UIEnter, after this runs,
-- and skips itself when the session has filled the window.
return {
  {
    "folke/persistence.nvim",
    init = function()
      local group = vim.api.nvim_create_augroup("persistence_autoload", { clear = true })
      local started_with_stdin = false
      vim.api.nvim_create_autocmd("StdinReadPre", {
        group = group,
        once = true,
        callback = function()
          started_with_stdin = true
        end,
      })
      vim.api.nvim_create_autocmd("VimEnter", {
        group = group,
        once = true,
        nested = true,
        callback = function()
          if vim.fn.argc(-1) == 0 and not started_with_stdin and vim.env.NVIM == nil then
            require("persistence").load()
          end
        end,
      })
    end,
  },
}
