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

    -- vimade's default blocklist already excludes floats, Pmenu, and prompt
    -- buffers. Rules merge by name with the defaults (user wins), so this only
    -- ADDS a rule to also keep terminal buffers at full brightness.
    blocklist = {
      terminal = { buf_opts = { buftype = { "terminal" } } },
    },
  },
}
