return {
  "TaDaa/vimade",
  event = "VeryLazy",
  opts = {
    -- Fade ALL inactive windows (matches the old tint.nvim behavior).
    -- 'buffers' would keep splits showing the same buffer bright; 'focus' is on-demand.
    ncmode = "windows",

    -- Fade the WHOLE editor when the terminal pane loses focus, and unfade on
    -- regain. Native replacement for the FocusLost/FocusGained autocmds we had
    -- to hand-roll for tint.nvim. (Relies on `set -g focus-events on` in tmux.)
    enablefocusfading = true,

    -- How much to fade inactive windows: 0.0 = fully faded, 1.0 = no fade.
    -- Kept subtle to match the gentle tint we'd dialed in; lower it for more contrast.
    fadelevel = 0.6,

    -- Smooth animated fades (tint.nvim switched instantly; vimade can tween).
    recipe = { "default", { animate = true } },

    -- Pull window backgrounds DARKER when the whole editor loses focus, to match
    -- the tmux pane darkening (window-style -> mantle). vimade sets the global
    -- `vimade_fade_active` flag during focus-loss fading, so we only apply the bg
    -- tint then; ordinary inactive splits keep just the fadelevel fade above.
    -- tint-as-a-function is re-resolved every tick and cache-keyed on the colors
    -- it returns, so reading vim.g here recomputes correctly (no `id` needed).
    -- rgb is catppuccin mocha 'crust' (#11111b, the darkest base); use {24,24,37}
    -- (mantle) to match tmux exactly, or raise intensity (0..1) for a darker pull.
    tint = function()
      if vim.g.vimade_fade_active == 1 then
        -- Pull backgrounds toward the dim target. In dark mode that's near-black
        -- (mocha crust); in LIGHT mode pulling toward black looked way too dark,
        -- so pull toward a light grey instead and ease off the intensity -- the
        -- analog of tmux's mantle dim, which only nudges the bg a shade.
        if vim.o.background == "light" then
          -- {230,233,239} = catppuccin latte 'mantle' (#e6e9ef); gentle so it
          -- still reads as "inactive" without going muddy on a light background.
          return { bg = { rgb = { 230, 233, 239 }, intensity = 0.25 } }
        end
        return { bg = { rgb = { 17, 17, 27 }, intensity = 0.5 } }
      end
      return {}
    end,

    -- When CodeDiff has focus, treat all as a single group. A window counts as
    -- CodeDiff's if EITHER condition holds:
    --   * buf_name contains "codediff" (catches sidebar and git codediff:///)
    --   * window carries `codediff_restore` flag (catches "Additions" pane)
    link = {
      codediff = function(win, active)
        local function is_codediff(w)
          return (w.buf_name and string.find(string.lower(w.buf_name), "codediff") ~= nil)
            or w.win_vars.codediff_restore ~= nil
        end
        return is_codediff(win) and is_codediff(active)
      end,
    },

    -- vimade's default blocklist already excludes floats, Pmenu, and prompt
    -- buffers. Rules merge by name with the defaults (user wins), so this only
    -- ADDS a rule to also keep terminal buffers at full brightness.
    blocklist = {
      terminal = { buf_opts = { buftype = { "terminal" } } },

      -- Snacks explorer is a floating window, and by default we don't fade
      -- floating windows, but we we do want to fade the exlporer (but only when
      -- all of vim loses focus, not just the explorer)
      block_inactive_floats = function(win, active)
        if win.win_config.relative == "" then
          return false -- not a float; nothing for this rule to block
        end
        local ft = win.buf_opts.filetype
        if vim.g.vimade_fade_active == 1 and ft and ft:match("^snacks_picker") then
          return false -- vim lost focus: allow the explorer to dim with the editor
        end
        -- Stock behavior: block inactive floats (and terminal floats).
        return (win ~= active or win.buf_opts.buftype == "terminal") and true or false
      end,
    },
  },
}
