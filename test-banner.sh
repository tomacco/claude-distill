#!/bin/bash
# Edit banner.txt, save, and it re-renders every second. Ctrl+C to stop.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BANNER_FILE="$SCRIPT_DIR/banner.txt"

# Create banner file if it doesn't exist
if [ ! -f "$BANNER_FILE" ]; then
cat > "$BANNER_FILE" << 'EOF'
        ╭────────────────────────────────────────────────────╮
        │                                                    │
        │      ░█▀▀░█░░░█▀█░█░█░█▀▄░█▀▀                    │
        │      ░█░░░█░░░█▀█░█░█░█░█░█▀▀                    │
        │      ░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀░░▀▀▀                    │
        │                                                    │
        │      ░█▀▄░▀█▀░█▀▀░▀█▀░▀█▀░█░░░█░░                │
        │      ░█░█░░█░░▀▀█░░█░░░█░░█░░░█░░                │
        │      ░▀▀░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀                │
        │                                                    │
        ╰────────────────────────────────────────────────────╯
EOF
fi

PURPLE=$(printf '\033[0;35m')
RESET=$(printf '\033[0m')
DIM=$(printf '\033[2m')

echo "Watching $BANNER_FILE — edit it and save. Ctrl+C to stop."
sleep 1

while true; do
  clear
  echo ""
  printf "${PURPLE}"
  cat "$BANNER_FILE"
  printf "${RESET}"
  echo ""
  printf "  ${DIM}every session makes all sessions better${RESET}\n"
  printf "  ${DIM}say what matters. it's listening.${RESET}\n"
  echo ""
  printf "  ${DIM}v0.4.0${RESET}\n"
  echo ""
  sleep 1
done
