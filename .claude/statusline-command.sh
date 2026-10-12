#!/bin/bash
# Claude Code status line: model, effort, cwd, git branch, context %, weekly limit %

input=$(cat)

model=$(echo "$input" | jq -r '.model.display_name // "unknown"')
effort=$(echo "$input" | jq -r '.effort.level // empty')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')
dir_name=$(basename "$cwd" 2>/dev/null)
context_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
week_pct=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')

branch=$(git -C "$cwd" --no-optional-locks branch --show-current 2>/dev/null)

RESET='\033[0m'
DIM='\033[2m'
CYAN='\033[36m'
MAGENTA='\033[35m'
BLUE='\033[34m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'

line=$(printf "${CYAN}%s${RESET}" "$model")

if [ -n "$effort" ]; then
  line+=$(printf " ${DIM}|${RESET} ${MAGENTA}%s${RESET}" "$effort")
fi

line+=$(printf " ${DIM}|${RESET} ${BLUE}%s${RESET}" "$dir_name")

if [ -n "$branch" ]; then
  line+=$(printf " ${DIM}|${RESET} ${GREEN}%s${RESET}" "$branch")
fi

if [ -n "$context_pct" ]; then
  line+=$(printf " ${DIM}|${RESET} ${YELLOW}context: %.0f%%${RESET}" "$context_pct")
fi

if [ -n "$week_pct" ]; then
  line+=$(printf " ${DIM}|${RESET} ${RED}week: %.0f%% used${RESET}" "$week_pct")
fi

printf "%b\n" "$line"
