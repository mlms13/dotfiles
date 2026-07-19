#!/usr/bin/env bash
# Emit a Catppuccin color *token* (e.g. "#{E:@thm_red}") for the battery pill,
# turning it red when the battery is low and discharging -- mirroring how the
# tmux-cpu plugin's ram_bg_color.sh drives the RAM pill (see ram.conf:
# @ram_high_bg_color = "#{E:@thm_red}"). Emitting a token rather than a resolved
# hex keeps the pill flavor-aware across the light/dark theme toggle, since tmux
# re-expands #() output on the next status refresh.
#
# Usage: battery_color.sh <bg|fg>
#   Below threshold + discharging -> bg: red,   fg: crust (dark text on red)
#   Otherwise (normal)            -> bg: module default, fg: foreground

BATT_DIR="$HOME/.tmux/plugins/tmux-battery/scripts"
source "$BATT_DIR/helpers.sh"

plane="${1:-bg}"
threshold="$(get_tmux_option "@batt_low_threshold" "10")"

percentage="$("$BATT_DIR/battery_percentage.sh" | sed -e 's/%//')"
status="$(battery_status)"

low=0
if [ -n "$percentage" ] && [ "$percentage" -lt "$threshold" ] && [ "$status" = "discharging" ]; then
  low=1
fi

if [ "$low" -eq 1 ]; then
  case "$plane" in
    bg) echo "#{E:@thm_red}" ;;
    fg) echo "#{E:@thm_crust}" ;;
  esac
else
  case "$plane" in
    bg) echo "#{E:@catppuccin_status_module_text_bg}" ;;
    fg) echo "#{E:@thm_fg}" ;;
  esac
fi
