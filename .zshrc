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
  path_prepend /opt/homebrew/bin

  # PostgreSQL (MacOS-specific path)
  path_prepend "/opt/homebrew/opt/libpq/bin"
fi

################################################################################
# Tool-Specific
################################################################################

# Node
path_prepend "$HOME/.fnm"
path_prepend "$HOME/.npm-global/bin"

if command -v fnm >/dev/null 2>&1; then
  eval `fnm env`
fi

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

# asdf
path_prepend "${ASDF_DATA_DIR:-$HOME/.asdf}/shims"

# nix
path_prepend "nix/var/nix/profiles/default/bin"

# fzf
if command -v fzf >/dev/null 2>&1; then
  source <(fzf --zsh)
fi

# Rancher Desktop (OSS Docker-like)
path_prepend "/Users/michael/.rd/bin"

################################################################################
# Secrets
################################################################################

source_if_exists "$HOME/.zsh/secrets.zsh"

