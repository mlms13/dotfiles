return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        pyright = {},
        vtsls = {
          settings = {
            -- LazyVim defaults this to true, which makes vtsls drive the
            -- workspace's TypeScript. vtsls 0.3.0 ships a 5.9-era host that
            -- can't drive tsserver 6.x
            vtsls = { autoUseWorkspaceTsdk = false },
          },
        },
      },
    },
  },
}
