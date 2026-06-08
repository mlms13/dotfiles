return {
  "folke/flash.nvim",
  opts = function(_, opts)
    local Util = require("flash.util")
    local Char = require("flash.plugins.char")

    -- During the f/t/F/T character prompt, treat <CR> like <Esc>: cancel the
    -- motion instead of searching for a carriage-return (flash's default, which
    -- matches end-of-line and jumps the cursor down a line).
    -- Gated on Char.jumping so flash's other modes (e.g. `s`, where <CR> jumps
    -- to the first match) keep working.
    local get_char = Util.get_char
    Util.get_char = function()
      local ret = get_char()
      if ret == Util.CR and Char.jumping then
        return nil
      end
      return ret
    end

    -- After a jump (e.g. `fx`), flash leaves its highlight active and waits for
    -- continuation keys (f/t/;/,). <CR> isn't one of them, so it would fall
    -- through to a normal-mode <CR> and move the cursor down a line. Instead,
    -- while flash's char highlight is still showing, treat <CR> as "end the
    -- search here": dismiss flash and stay put. Otherwise, do a normal <CR>.
    vim.keymap.set("n", "<CR>", function()
      if Char.visible() then
        vim.schedule(function()
          Char.state:hide()
        end)
        return ""
      end
      return "<CR>"
    end, { expr = true, silent = true, desc = "End flash f/t search (or <CR>)" })

    return opts
  end,
}
