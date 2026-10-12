################################################################################
# Common Helpers
################################################################################

source_if_exists() {
  [[ -f "$1" ]] && source "$1"
}

path_prepend() {
  [[ -d "$1" ]] && path=("$1" $path)
}

################################################################################
# Plugin Management (antigen and omz config)
################################################################################

source $HOME/.zsh/antigen.zsh

antigen use oh-my-zsh
antigen bundle git
antigen bundle command-not-found
antigen bundle common-aliases
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle zsh-users/zsh-syntax-highlighting

# optionally change the suggestion strategy
# export ZSH_AUTOSUGGEST_STRATEGY=(completion history)

antigen apply

################################################################################
# Prompt and Shell Config
################################################################################

# Use starship if it exists
if command -v starship >/dev/null 2>&1; then
  eval "$(starship init zsh)"
else
  echo "Warning: starship not found"
fi

# Use vi-mode (with jk as esc)
bindkey -v
bindkey -M viins 'jk' vi-cmd-mode
bindkey -M viins 'kj' vi-cmd-mode

################################################################################
# Common Aliases and Exports
################################################################################

alias vim="nvim"
alias vi="nvim"
alias vimdiff='nvim -d'
alias codex='codex --profile shared'

export EDITOR="nvim"
export VISUAL="nvim"

################################################################################
# Path Config
################################################################################

typeset -U path
path_prepend "$HOME/.local/bin"
path_prepend "$HOME/bin"

################################################################################
# OS-Specific
################################################################################

if [[ "$OSTYPE" == "linux"* ]]; then
  alias open="xdg-open"
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  path_prepend /usr/local/bin
  path_prepend /opt/homebrew/bin

  # Homebrew keeps the unversioned Python commands here.
  path_prepend /usr/local/opt/python/libexec/bin
  path_prepend /opt/homebrew/opt/python/libexec/bin

  # PostgreSQL (MacOS-specific path)
  path_prepend "/opt/homebrew/opt/libpq/bin"
fi

################################################################################
# Tool-Specific
################################################################################

# Bun
export BUN_INSTALL="$HOME/.bun"
path_prepend "$BUN_INSTALL/bin"

# Keep the marker comment on the next line verbatim: `bun upgrade` will append
# its own block to .zshrc unless it finds that comment
# bun completions
source_if_exists "$BUN_INSTALL/_bun"

# OCaml
if command -v opam >/dev/null 2>&1; then
  eval $(opam env)
fi

source_if_exists "$HOME/.opam/opam-init/init.zsh"

# Haskell
source_if_exists "$HOME/.ghcup/env"

# Rust
source_if_exists "$HOME/.cargo/env"

# Python
if command -v direnv >/dev/null 2>&1; then
  eval "$(direnv hook zsh)"
else
  echo "direnv not found!"
fi

# pyenv
export PYENV_ROOT="$HOME/.pyenv"
path_prepend "$PYENV_ROOT/bin"

if command -v pyenv >/dev/null 2>&1; then
  eval "$(pyenv init -)"
  eval "$(pyenv virtualenv-init -)"
fi

# nix
path_prepend "/nix/var/nix/profiles/default/bin"

# Runtime precedence: later prepends win. Keep these after other tool managers.
# Node and pnpm
# pnpm (asdf project pins take precedence below)
if [[ "$OSTYPE" == "darwin"* ]]; then
  export PNPM_HOME="${PNPM_HOME:-$HOME/Library/pnpm}"
else
  export PNPM_HOME="${PNPM_HOME:-${XDG_DATA_HOME:-$HOME/.local/share}/pnpm}"
fi
path_prepend "$PNPM_HOME"
path_prepend "$PNPM_HOME/bin"

# fnm owns the default Node; asdf project pins take precedence below.
path_prepend "$HOME/.fnm"
path_prepend "$HOME/.local/share/fnm"
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env --use-on-cd --shell zsh --version-file-strategy=recursive --resolve-engines=false)"
fi

# asdf resolves project pins on each invocation, including inside scripts.
# The work setup bundle supplies machine-local `system` defaults at home.
if command -v asdf >/dev/null 2>&1; then
  path_prepend "${ASDF_DATA_DIR:-$HOME/.asdf}/shims"
fi

# Keep the standalone CLI ahead of npm-generated asdf shims.
path_prepend "$HOME/.codex/packages/standalone/current/bin"

# fzf
if command -v fzf >/dev/null 2>&1; then
  source <(fzf --zsh)
fi

### MANAGED BY RANCHER DESKTOP START (DO NOT EDIT)
export PATH="/Users/michael/.rd/bin:$PATH"
### MANAGED BY RANCHER DESKTOP END (DO NOT EDIT)

################################################################################
# Secrets
################################################################################

source_if_exists "$HOME/.zsh/secrets.zsh"
