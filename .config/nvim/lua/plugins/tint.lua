return {
  "levouh/tint.nvim",
  event = "VeryLazy",
  config = function()
    local tint = require("tint")
    tint.setup({
      tint = -15, -- how much to darken inactive windows (negative = darker)
      saturation = 0.5, -- desaturate inactive windows a bit
      tint_background_colors = true,
      highlight_ignore_patterns = { "WinSeparator", "Status.*" },
      window_ignore_function = function(winid)
        -- keep floats (pickers, neogit, LSP hovers) and terminals at full brightness
        local bufid = vim.api.nvim_win_get_buf(winid)
        local buftype = vim.api.nvim_get_option_value("buftype", { buf = bufid })
        local floating = vim.api.nvim_win_get_config(winid).relative ~= ""
        return buftype == "terminal" or floating
      end,
    })

    -- Dim ALL splits when nvim (the whole terminal pane) loses focus...
    vim.api.nvim_create_autocmd("FocusLost", {
      callback = function()
        for _, win in ipairs(vim.api.nvim_tabpage_list_wins(0)) do
          tint.tint(win)
        end
      end,
    })
    -- ...and restore normal active/inactive tinting when it regains focus.
    -- Set each window's state explicitly (untint current, tint the rest) rather
    -- than relying on refresh(), which doesn't reliably untint the window we
    -- force-tinted on FocusLost.
    vim.api.nvim_create_autocmd("FocusGained", {
      callback = function()
        local cur = vim.api.nvim_get_current_win()
        for _, win in ipairs(vim.api.nvim_tabpage_list_wins(0)) do
          if win == cur then
            tint.untint(win)
          else
            tint.tint(win)
          end
        end
      end,
    })
  end,
}
