# Sourch antigen and use it to load plugins

source $HOME/.antigen.zsh

antigen use oh-my-zsh
antigen bundle command-not-found
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle zsh-users/zsh-syntax-highlighting

antigen apply


# User configuration

# eval all the relevant things
eval "$(starship init zsh)"
