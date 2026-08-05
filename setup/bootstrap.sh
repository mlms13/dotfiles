#!/bin/sh
# Minimal, idempotent pre-runner bootstrap.
#
# Installs only the irreducible tools that must exist BEFORE the Bun runner
# can take over — the things you can't express in the runner because the
# runner needs them to run at all:
#
#   Xcode Command Line Tools (macOS)  ->  Homebrew  ->  Bun
#
# It stops there — it does NOT invoke the runner. Open a new shell (so .zshrc
# puts brew and bun on PATH), then run the runner yourself; see README "Run".
# Safe to re-run: every step checks first.
#
# This lives inside the dotfiles repo, so it assumes the repo is already
# checked out. On a brand-new machine:
#
#   git clone https://github.com/mlms13/dotfiles.git ~/dotfiles-tmp \
#     && ~/dotfiles-tmp/setup/bootstrap.sh
#
# (…or however you establish the home-as-repo; then run ./setup/bootstrap.sh)

set -eu

log() { printf '\033[1m==>\033[0m %s\n' "$1"; }

OS="$(uname -s)"

if [ "$OS" = "Darwin" ]; then
  if ! xcode-select -p >/dev/null 2>&1; then
    log "Installing Xcode Command Line Tools (accept the GUI prompt)…"
    xcode-select --install || true
    printf '    waiting for Command Line Tools to finish installing'
    until xcode-select -p >/dev/null 2>&1; do
      printf '.'
      sleep 5
    done
    printf '\n'
  fi

  if ! command -v brew >/dev/null 2>&1; then
    log "Installing Homebrew…"
    NONINTERACTIVE=1 /bin/bash -c \
      "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  # Make brew available in this shell (Apple Silicon vs Intel prefixes).
  if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
  if [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi

elif [ "$OS" = "Linux" ]; then
  if ! command -v curl >/dev/null 2>&1; then
    log "Installing curl…"
    sudo apt-get update && sudo apt-get install -y curl
  fi
fi

if ! command -v bun >/dev/null 2>&1; then
  log "Installing Bun…"
  curl -fsSL https://bun.sh/install | bash
fi
