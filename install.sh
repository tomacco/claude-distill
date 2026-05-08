#!/bin/bash
# claude-distill installer
# https://github.com/tomacco/claude-distill

set -e

VERSION="0.4.0"
REPO="https://raw.githubusercontent.com/tomacco/claude-distill/main"
CMD_DIR="$HOME/.claude/commands"
DISTILL_DIR="$HOME/.claude/distill"
SERVER_DIR="$DISTILL_DIR/server"
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
DISTILL_LINE="# Distill — read ~/.claude/distill/distill-monitor.md and follow its instructions"

# ═══ COLORS & FORMATTING ═══
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'
RED='\033[0;31m'
YELLOW='\033[0;33m'

# ═══ ANIMATION HELPERS ═══

spinner() {
  local pid=$1
  local msg=$2
  local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${CYAN}${frames[$i]}${RESET} ${DIM}%s${RESET}" "$msg"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.1
  done
  wait "$pid"
  local exit_code=$?
  printf "\r"
  return $exit_code
}

done_msg() {
  printf "  ${GREEN}✓${RESET} %s\n" "$1"
}

skip_msg() {
  printf "  ${DIM}·${RESET} %s\n" "$1"
}

warn_msg() {
  printf "  ${YELLOW}⚠${RESET} %s\n" "$1"
}

fail_msg() {
  printf "  ${RED}✗${RESET} %s\n" "$1"
}

info_msg() {
  printf "  ${CYAN}ℹ${RESET} %s\n" "$1"
}

# ═══ HEADER ANIMATION ═══

show_header() {
  clear
  echo ""
  printf "${PURPLE}"
  cat << 'BANNER'
        ╭─────────────────────────────────────────╮
        │                                         │
        │      ░█▀▀░█░░░█▀█░█░█░█▀▄░█▀▀          │
        │      ░█░░░█░░░█▀█░█░█░█░█░█▀▀          │
        │      ░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀░░▀▀▀          │
        │                                         │
        │      ░█▀▄░▀█▀░█▀▀░▀█▀░▀█▀░█░░░█░░      │
        │      ░█░█░░█░░▀▀█░░█░░░█░░█░░░█░░      │
        │      ░▀▀░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀      │
        │                                         │
        ╰─────────────────────────────────────────╯
BANNER
  printf "${RESET}"
  echo ""
  printf "       ${DIM}every session makes all sessions better${RESET}\n"
  printf "       ${DIM}say what matters. it's listening.${RESET}\n"
  echo ""
  printf "       ${DIM}v${VERSION}${RESET}\n"
  echo ""
  sleep 0.5
}

show_section() {
  echo ""
  printf "  ${PURPLE}━━${RESET} ${BOLD}%s${RESET}\n" "$1"
  echo ""
}

# ═══ PROGRESS BAR ═══

progress_bar() {
  local current=$1
  local total=$2
  local width=30
  local pct=$((current * 100 / total))
  local filled=$((current * width / total))
  local empty=$((width - filled))

  printf "\r  ${DIM}[${RESET}"
  printf "${CYAN}%0.s█${RESET}" $(seq 1 $filled 2>/dev/null) || true
  printf "${DIM}%0.s░${RESET}" $(seq 1 $empty 2>/dev/null) || true
  printf "${DIM}]${RESET} ${DIM}%d%%${RESET}" "$pct"
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

TOTAL_STEPS=7
STEP=0

show_section "Core files"

# Ensure directories exist
mkdir -p "$CMD_DIR"
mkdir -p "$DISTILL_DIR"/{craft,ops,profile,projects,feedback,archive}

# Download core files
STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS
curl -sL "$REPO/distill.md" -o "$CMD_DIR/distill.md"
done_msg "distill.md ${DIM}(command)${RESET}"

STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS
curl -sL "$REPO/distill-process.md" -o "$DISTILL_DIR/distill-process.md"
done_msg "distill-process.md ${DIM}(process engine)${RESET}"

STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS
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

# ═══ MCP SERVER ═══

show_section "MCP Server"

MCP_INSTALLED=false

if ! command -v node &> /dev/null; then
    warn_msg "Node.js not found — skipping MCP server"
    skip_msg "Smart retrieval disabled (fallback: reads SPINE directly)"
    info_msg "Install Node.js 18+ later to enable"
else
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        warn_msg "Node.js v${NODE_VERSION} found, need 18+ — skipping MCP server"
    else
        # Download server
        mkdir -p "$SERVER_DIR/src"
        STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS
        curl -sL "$REPO/server/package.json" -o "$SERVER_DIR/package.json"
        curl -sL "$REPO/server/tsconfig.json" -o "$SERVER_DIR/tsconfig.json"
        curl -sL "$REPO/server/src/index.ts" -o "$SERVER_DIR/src/index.ts"
        curl -sL "$REPO/server/src/db.ts" -o "$SERVER_DIR/src/db.ts"
        curl -sL "$REPO/server/src/retrieval.ts" -o "$SERVER_DIR/src/retrieval.ts"
        done_msg "Server source downloaded"

        # Install deps (with spinner)
        STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS
        (cd "$SERVER_DIR" && npm install --registry https://registry.npmjs.org --silent 2>/dev/null) &
        spinner $! "Installing dependencies..."
        done_msg "Dependencies installed"

        # Build (with spinner)
        STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS
        (cd "$SERVER_DIR" && npx tsc 2>/dev/null) &
        spinner $! "Building server..."
        done_msg "Server built"

        # Register MCP
        if command -v claude &> /dev/null; then
            claude mcp remove distill 2>/dev/null || true
            claude mcp add --scope user --transport stdio distill -- node "$SERVER_DIR/dist/index.js" 2>/dev/null
            done_msg "Registered globally ${DIM}(user scope)${RESET}"
            MCP_INSTALLED=true
        else
            warn_msg "'claude' CLI not in PATH — server built but not registered"
            info_msg "Run: claude mcp add --scope user --transport stdio distill -- node $SERVER_DIR/dist/index.js"
            MCP_INSTALLED=true
        fi
    fi
fi

# ═══ CLAUDE.md INTEGRATION ═══

show_section "Session integration"

STEP=$((STEP + 1)); progress_bar $STEP $TOTAL_STEPS

if [ -f "$CLAUDE_MD" ]; then
    if grep -q "distill-monitor.md" "$CLAUDE_MD" 2>/dev/null; then
        done_msg "CLAUDE.md ${DIM}(already configured)${RESET}"

    elif grep -q "distill/SPINE.md" "$CLAUDE_MD" 2>/dev/null; then
        echo ""
        info_msg "Older distill reference found in CLAUDE.md"
        info_msg "New version adds smart retrieval + pressure tracking"
        echo ""
        printf "  ${BOLD}Replace old line?${RESET} ${DIM}[Y/n]${RESET} "
        read -r response < /dev/tty
        if [[ "$response" =~ ^[Nn] ]]; then
            skip_msg "Kept old reference"
        else
            sed -i.bak '/distill\/SPINE.md/d' "$CLAUDE_MD"
            rm -f "$CLAUDE_MD.bak"
            echo "" >> "$CLAUDE_MD"
            echo "$DISTILL_LINE" >> "$CLAUDE_MD"
            done_msg "CLAUDE.md upgraded"
        fi
    else
        echo ""
        printf "  ${BOLD}To work across sessions, distill adds one line to CLAUDE.md:${RESET}\n"
        echo ""
        printf "    ${CYAN}%s${RESET}\n" "$DISTILL_LINE"
        echo ""
        printf "  ${DIM}This enables:${RESET}\n"
        printf "    ${DIM}• Smart knowledge retrieval before writing code${RESET}\n"
        printf "    ${DIM}• Memory pressure tracking + automatic suggestions${RESET}\n"
        printf "    ${DIM}• Observable: see what memories Claude accesses${RESET}\n"
        echo ""
        printf "  ${BOLD}Add this line?${RESET} ${DIM}[Y/n]${RESET} "
        read -r response < /dev/tty
        if [[ "$response" =~ ^[Nn] ]]; then
            echo ""
            fail_msg "Installation cancelled."
            echo ""
            printf "    ${DIM}This line is required. Without it, sessions can't${RESET}\n"
            printf "    ${DIM}load knowledge or evolve globally.${RESET}\n"
            echo ""
            printf "    ${DIM}Run the installer again when ready.${RESET}\n"
            rm -f "$CMD_DIR/distill.md"
            rm -f "$DISTILL_DIR/distill-process.md"
            rm -f "$DISTILL_DIR/distill-monitor.md"
            rm -f "$DISTILL_DIR/.version"
            echo ""
            exit 1
        else
            echo "" >> "$CLAUDE_MD"
            echo "$DISTILL_LINE" >> "$CLAUDE_MD"
            done_msg "CLAUDE.md configured"
        fi
    fi
else
    echo "$DISTILL_LINE" > "$CLAUDE_MD"
    done_msg "Created CLAUDE.md with distill reference"
fi

# ═══ COMPLETE ═══

progress_bar $TOTAL_STEPS $TOTAL_STEPS
echo ""
echo ""
printf "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
echo ""
if [ "$MCP_INSTALLED" = true ]; then
    printf "  ${GREEN}${BOLD}Installed with MCP server${RESET}\n"
    printf "  ${DIM}Smart retrieval + observability enabled${RESET}\n"
else
    printf "  ${GREEN}${BOLD}Installed (fallback mode)${RESET}\n"
    printf "  ${DIM}Reads SPINE directly — install Node 18+ for smart retrieval${RESET}\n"
fi
echo ""
printf "  ${DIM}Version:  ${RESET}v${VERSION}\n"
printf "  ${DIM}Command:  ${RESET}/distill\n"
printf "  ${DIM}Knowledge:${RESET} ~/.claude/distill/\n"
echo ""
if [ -n "$EXISTING_VERSION" ]; then
    printf "  ${CYAN}Upgraded${RESET} v${EXISTING_VERSION} → v${VERSION}\n"
fi
echo ""
printf "  ${DIM}Uninstall: claude mcp remove distill && rm ~/.claude/commands/distill.md && rm -rf ~/.claude/distill/${RESET}\n"
echo ""
printf "  ${PURPLE}say what matters. it's listening.${RESET}\n"
echo ""
