-- codediff.nvim is pulled in as a dependency of neogit (for the `d`-opens-diff
-- integration), but a dependency only loads when its parent does. Give it its
-- own `cmd` trigger so `:CodeDiff` works without opening Neogit first.
return {
  "esmuellert/codediff.nvim",
  cmd = "CodeDiff",

  -- The following is working around a codediff bug (which may in fact be an
  -- nvim bug). Smooth scrolling was conflicting with codediff's scrolling and
  -- leading to incorrect positional jumps. Eventually we should remove this.
  --
  -- No `setup()` call: the plugin's own plugin/codediff.lua wires up commands
  -- and highlights, so this is only here for the workaround below.
  config = function()
    -- Snacks' smooth scroll animates the scrolling codediff does to keep the two
    -- panes in sync, so ]c/[c hunk navigation jitters (codediff.nvim#519), and
    -- gg/G get stuck short of the buffer ends.
    -- Mute animations while a codediff tab is focused, restore on the way out.
    -- Buffer-local vars can't scope this: the modified pane is the real file
    -- buffer, so muting it would follow the file into other tabs.
    local group = vim.api.nvim_create_augroup("codediff_snacks_animate", { clear = true })
    local diff_tabs = {} ---@type table<integer, true>
    local saved ---@type { value: boolean? }? set only while we are muting

    local function sync_animations()
      if diff_tabs[vim.api.nvim_get_current_tabpage()] then
        -- Wrapped so an unset vim.g (the default, animations on) round-trips as
        -- nil rather than reading as "nothing saved"
        saved = saved or { value = vim.g.snacks_animate }
        vim.g.snacks_animate = false
      elseif saved then
        vim.g.snacks_animate = saved.value
        saved = nil
      end
    end

    vim.api.nvim_create_autocmd("User", {
      group = group,
      pattern = "CodeDiffOpen",
      callback = function(ev)
        diff_tabs[ev.data.tabpage] = true
        sync_animations()
      end,
    })

    vim.api.nvim_create_autocmd("User", {
      group = group,
      pattern = "CodeDiffClose",
      callback = function(ev)
        diff_tabs[ev.data.tabpage] = nil
        -- Fires before the tab is gone, so TabClosed does the actual unmuting
        sync_animations()
      end,
    })

    vim.api.nvim_create_autocmd({ "TabEnter", "TabClosed" }, {
      group = group,
      callback = sync_animations,
    })
  end,
}
