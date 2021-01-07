###############################################################################
# Main config
###############################################################################
export ZSH="/home/michael/.oh-my-zsh"

ZSH_THEME=""

export EDITOR="vi"
export VISUAL="vi"

# Use vi-mode (with jk as esc)
bindkey -v
bindkey -M viins 'jk' vi-cmd-mode
bindkey -M viins 'kj' vi-cmd-mode

###############################################################################
# Plugins and plugin config
###############################################################################

# Load plugins from ~/.oh-my-zsh/plugins
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
)

# optionally change the suggestion strategy
# export ZSH_AUTOSUGGEST_STRATEGY=(completion history)

source $ZSH/oh-my-zsh.sh

fpath=( "$HOME/.zsh/functions" $fpath )
fpath+=('/home/michael/.npm-global/lib/node_modules/pure-prompt/functions')

autoload -U promptinit; promptinit
prompt pure
prompt_newline='%666v'
PROMPT=" $PROMPT"

###############################################################################
# Personal aliases and environment
###############################################################################

alias open="xdg-open"

export PATH=./node_modules/.bin:$PATH

# fnm and npm
export PATH=/home/michael/.fnm:/home/michael/.npm-global/bin:$PATH
eval "`fnm env --multi`"
