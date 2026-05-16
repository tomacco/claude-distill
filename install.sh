#!/bin/bash
# claude-distill installer
# https://github.com/tomacco/claude-distill

set -e

VERSION="0.7.10"
BUILD="20260516-01"
REPO="https://raw.githubusercontent.com/tomacco/claude-distill/main"
CMD_DIR="$HOME/.claude/commands"
DISTILL_DIR="$HOME/.claude/distill"
RULES_DIR="$HOME/.claude/rules"
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
DISTILL_LINE='# Distill — knowledge system (github.com/tomacco/claude-distill)

GATE: If ~/.claude/distill/.needs-migration exists, tell the user: "Run /distill to migrate existing memories." Do NOT proceed until addressed or declined.'

# ═══ COLORS & FORMATTING ═══
CYAN=$(printf '\033[0;36m')
PURPLE=$(printf '\033[0;35m')
GREEN=$(printf '\033[0;32m')
DIM=$(printf '\033[2m')
BOLD=$(printf '\033[1m')
RESET=$(printf '\033[0m')
RED=$(printf '\033[0;31m')
YELLOW=$(printf '\033[0;33m')

# ═══ ANIMATION HELPERS ═══

spinner() {
  local pid=$1
  local msg=$2
  local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
  local i=0
  tput civis 2>/dev/null  # hide cursor
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  %s %s   " "${frames[$i]}" "$msg"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.1
  done
  wait "$pid"
  local exit_code=$?
  printf "\r                                                              \r"
  tput cnorm 2>/dev/null  # show cursor
  return $exit_code
}

done_msg() {
  echo "  ${GREEN}✓${RESET} $1"
}

skip_msg() {
  echo "  ${DIM}·${RESET} $1"
}

warn_msg() {
  echo "  ${YELLOW}⚠${RESET} $1"
}

fail_msg() {
  echo "  ${RED}✗${RESET} $1"
}

info_msg() {
  echo "  ${CYAN}ℹ${RESET} $1"
}

# ═══ HEADER ANIMATION ═══

show_header() {
  clear
  echo ""
  printf "${PURPLE}"
  echo "        ╭──────────────────────────────────────╮"
  echo "        │                                      │"
  echo "        │      ░█▀▀░█░░░█▀█░█░█░█▀▄░█▀▀        │"
  echo "        │      ░█░░░█░░░█▀█░█░█░█░█░█▀▀        │"
  echo "        │      ░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀░░▀▀▀        │"
  echo "        │                                      │"
  echo "        │      ░█▀▄░▀█▀░█▀▀░▀█▀░▀█▀░█░░░█░░    │"
  echo "        │      ░█░█░░█░░▀▀█░░█░░░█░░█░░░█░░    │"
  echo "        │      ░▀▀░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀    │"
  echo "        │                                      │"
  echo "        ╰──────────────────────────────────────╯"
  printf "${RESET}"
  echo ""
  printf "  ${DIM}every session makes all sessions better${RESET}\n"
  printf "  ${DIM}say what matters. it's listening.${RESET}\n"
  echo ""
  printf "  ${DIM}v${VERSION} (build ${BUILD})${RESET}\n"
  echo ""
}

show_section() {
  echo ""
  printf "  ${PURPLE}━━${RESET} ${BOLD}%s${RESET}\n" "$1"
  echo ""
}


# ═══ MAIN INSTALLATION ═══

show_header

# Detect existing installation
EXISTING_VERSION=""
if [ -f "$DISTILL_DIR/.version" ]; then
    EXISTING_VERSION=$(cat "$DISTILL_DIR/.version")
    info_msg "Existing installation: v${EXISTING_VERSION} → v${VERSION}"
    echo ""
fi


show_section "Core files"

# Ensure directories exist
mkdir -p "$CMD_DIR"
mkdir -p "$DISTILL_DIR"/{craft,ops,profile,projects,feedback,archive}

# Download core files

curl -sL "$REPO/distill.md" -o "$CMD_DIR/distill.md"
done_msg "distill.md ${DIM}(command)${RESET}"


curl -sL "$REPO/distill-process.md" -o "$DISTILL_DIR/distill-process.md"
done_msg "distill-process.md ${DIM}(process engine)${RESET}"


curl -sL "$REPO/distill-monitor.md" -o "$DISTILL_DIR/distill-monitor.md"
done_msg "distill-monitor.md ${DIM}(session monitor)${RESET}"

# Version
echo "$VERSION" > "$DISTILL_DIR/.version"

# Spine
if [ ! -f "$DISTILL_DIR/SPINE.md" ]; then
    echo "# Distill Knowledge Index" > "$DISTILL_DIR/SPINE.md"
    echo "" >> "$DISTILL_DIR/SPINE.md"
    echo "<!-- This file is managed by claude-distill. Max 80 lines. -->" >> "$DISTILL_DIR/SPINE.md"
    echo "<!-- Each entry: - [Title](path.md) — when to read this -->" >> "$DISTILL_DIR/SPINE.md"
    done_msg "SPINE.md ${DIM}(knowledge index)${RESET}"
else
    skip_msg "SPINE.md ${DIM}(preserved)${RESET}"
fi

# ═══ KNOWLEDGE RETRIEVAL (rules file) ═══

show_section "Knowledge retrieval"

mkdir -p "$RULES_DIR"
curl -sL "$REPO/rules/distill.md" -o "$RULES_DIR/distill.md"
done_msg "rules/distill.md ${DIM}(auto-loads every session)${RESET}"

# ═══ CLAUDE.md INTEGRATION ═══

show_section "Session integration"

# Disable auto-memory (distill owns knowledge management)
SETTINGS_JSON="$HOME/.claude/settings.json"
if [ -f "$SETTINGS_JSON" ]; then
    if grep -q '"autoMemoryEnabled"' "$SETTINGS_JSON" 2>/dev/null; then
        skip_msg "Auto-memory already configured in settings.json"
    else
        # Add autoMemoryEnabled: false after the opening brace
        sed -i.bak 's/^{$/{\n  "autoMemoryEnabled": false,/' "$SETTINGS_JSON"
        rm -f "$SETTINGS_JSON.bak"
        done_msg "Disabled auto-memory ${DIM}(distill owns knowledge)${RESET}"
    fi
else
    echo '{ "autoMemoryEnabled": false }' > "$SETTINGS_JSON"
    done_msg "Created settings.json with auto-memory disabled"
fi

if [ -f "$CLAUDE_MD" ]; then
    if grep -q "claude-distill" "$CLAUDE_MD" 2>/dev/null; then
        done_msg "CLAUDE.md ${DIM}(already configured)${RESET}"
    elif grep -q "distill" "$CLAUDE_MD" 2>/dev/null; then
        # Older version reference — replace it
        sed -i.bak '/distill/d' "$CLAUDE_MD"
        rm -f "$CLAUDE_MD.bak"
        echo "" >> "$CLAUDE_MD"
        echo "$DISTILL_LINE" >> "$CLAUDE_MD"
        done_msg "CLAUDE.md ${DIM}(upgraded)${RESET}"
    else
        echo "" >> "$CLAUDE_MD"
        echo "$DISTILL_LINE" >> "$CLAUDE_MD"
        done_msg "CLAUDE.md configured"
    fi
else
    echo "$DISTILL_LINE" > "$CLAUDE_MD"
    done_msg "Created CLAUDE.md"
fi

# ═══ MEMORY MIGRATION CHECK ═══

# Detect existing memory files that should be ingested
MEMORY_FILES=$(find "$HOME/.claude" -path "*/memory/*.md" -not -path "*/distill/*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$MEMORY_FILES" -gt 0 ] && [ ! -f "$DISTILL_DIR/.migrated" ]; then
    echo ""
    printf "  ${CYAN}━━${RESET} ${BOLD}Existing memories detected${RESET}\n"
    echo ""
    printf "  Found ${BOLD}${MEMORY_FILES}${RESET} memory files from Claude's built-in system.\n"
    printf "  Since distill now owns knowledge management, these won't be\n"
    printf "  read by the auto-memory system anymore.\n"
    echo ""
    printf "  ${BOLD}On your next session, run ${CYAN}/distill${RESET}${BOLD} — it will:${RESET}\n"
    printf "    • Read your existing memories\n"
    printf "    • Ingest them into distill's tiered system\n"
    printf "    • Apply quality checks and proper categorization\n"
    printf "    • Your old files stay untouched (as backup)\n"
    echo ""
    # Flag so we only show this once
    touch "$DISTILL_DIR/.needs-migration"
fi

# ═══ COMPLETE ═══

echo ""
echo ""
printf "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
echo ""
printf "  ${GREEN}${BOLD}Installed${RESET}\n"
printf "  ${DIM}Zero dependencies. Just files.${RESET}\n"
echo ""
printf "  ${DIM}Version:  ${RESET}v${VERSION}\n"
printf "  ${DIM}Command:  ${RESET}/distill\n"
printf "  ${DIM}Knowledge:${RESET} ~/.claude/distill/\n"
echo ""
if [ -n "$EXISTING_VERSION" ]; then
    printf "  ${CYAN}Upgraded${RESET} v${EXISTING_VERSION} → v${VERSION}\n"
    echo ""
fi
printf "  ${DIM}Uninstall (keeps your learnings):${RESET}\n"
printf "    ${DIM}rm -rf ~/.claude/distill ~/.claude/commands/distill.md ~/.claude/rules/distill.md${RESET}\n"
echo ""
printf "  ${PURPLE}say what matters. it's listening.${RESET}\n"
echo ""
