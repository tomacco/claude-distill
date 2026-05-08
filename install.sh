#!/bin/bash
# claude-distill installer
# https://github.com/tomacco/claude-distill

set -e

VERSION="0.4.0"
BUILD="20260508-9"
REPO="https://raw.githubusercontent.com/tomacco/claude-distill/feat/mcp-server"
CMD_DIR="$HOME/.claude/commands"
DISTILL_DIR="$HOME/.claude/distill"
SERVER_DIR="$DISTILL_DIR/server"
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
DISTILL_LINE='# Distill — read ~/.claude/distill/distill-monitor.md and follow its instructions

IMPORTANT: Distill OVERRIDES the auto-memory system for knowledge management. Do NOT save learnings, corrections, preferences, or user observations to memory/ files. Instead, note them as signals for /distill which has anti-sycophancy checks, frustration escalation, and proper tiered storage. The built-in memory system is disabled for these purposes when distill is installed.'

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

# ═══ MCP SERVER ═══

show_section "MCP Server"

MCP_INSTALLED=false

if ! command -v node &> /dev/null; then
    warn_msg "Node.js not found"
    echo ""
    printf "  ${BOLD}The MCP server requires Node.js 18+.${RESET}\n"
    printf "  ${DIM}Without it, distill works but without smart retrieval or observability.${RESET}\n"
    echo ""
    printf "  ${DIM}Install Node.js now? Options:${RESET}\n"
    printf "    ${CYAN}1${RESET}) brew install node ${DIM}(recommended on macOS)${RESET}\n"
    printf "    ${CYAN}2${RESET}) I'll install it myself later\n"
    echo ""
    printf "  ${BOLD}Choice [1/2]:${RESET} "
    read -r node_choice < /dev/tty
    if [[ "$node_choice" == "1" ]]; then
        if command -v brew &> /dev/null; then
            echo ""
            (brew install node 2>&1 | tail -3) &
            spinner $! "Installing Node.js via Homebrew..."
            if command -v node &> /dev/null; then
                done_msg "Node.js installed ($(node -v))"
            else
                fail_msg "Homebrew install didn't add node to PATH"
                warn_msg "Continuing without MCP server (fallback mode)"
            fi
        else
            fail_msg "Homebrew not found"
            info_msg "Install from: https://nodejs.org/en/download"
            warn_msg "Continuing without MCP server (fallback mode)"
        fi
    else
        skip_msg "Skipping Node.js — MCP server disabled"
        info_msg "Install Node 18+ and re-run to enable smart retrieval"
    fi
else
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        warn_msg "Node.js v${NODE_VERSION} found, need 18+ — skipping MCP server"
    else
        # Download server
        mkdir -p "$SERVER_DIR/src"
        
        curl -sL "$REPO/server/package.json" -o "$SERVER_DIR/package.json"
        curl -sL "$REPO/server/tsconfig.json" -o "$SERVER_DIR/tsconfig.json"
        curl -sL "$REPO/server/src/index.ts" -o "$SERVER_DIR/src/index.ts"
        curl -sL "$REPO/server/src/db.ts" -o "$SERVER_DIR/src/db.ts"
        curl -sL "$REPO/server/src/retrieval.ts" -o "$SERVER_DIR/src/retrieval.ts"
        done_msg "Server source downloaded"

        # Install deps (with spinner)
        (cd "$SERVER_DIR" && npm install --registry https://registry.npmjs.org --silent 2>&1 > /dev/null) &
        spinner $! "Installing dependencies..."
        if [ $? -eq 0 ]; then
            done_msg "Dependencies installed"
        else
            fail_msg "npm install failed"
            warn_msg "MCP server won't be available (fallback mode active)"
            MCP_INSTALLED=false
        fi

        # Build (with spinner)
        if [ "$MCP_INSTALLED" != "false" ]; then
            (cd "$SERVER_DIR" && npx tsc 2>&1 > /dev/null) &
            spinner $! "Building server..."
            if [ $? -eq 0 ]; then
                done_msg "Server built"
            else
                fail_msg "Build failed"
                warn_msg "MCP server won't be available (fallback mode active)"
                MCP_INSTALLED=false
            fi
        fi

        # Register MCP (only if build succeeded)
        if [ "$MCP_INSTALLED" != "false" ]; then
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
fi

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
