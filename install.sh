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

echo ""
echo "  ╭──────────────────────────────╮"
echo "  │  installing claude-distill   │"
echo "  │  v${VERSION}                       │"
echo "  ╰──────────────────────────────╯"
echo ""

# Detect existing installation
EXISTING_VERSION=""
if [ -f "$DISTILL_DIR/.version" ]; then
    EXISTING_VERSION=$(cat "$DISTILL_DIR/.version")
    echo "  ℹ Existing installation detected: v${EXISTING_VERSION}"
    echo "  ℹ Upgrading to: v${VERSION}"
    echo ""
fi

# ═══ CORE FILES ═══

# Ensure directories exist
mkdir -p "$CMD_DIR"
mkdir -p "$DISTILL_DIR"/{craft,ops,profile,projects,feedback,archive}

# Download the command (dispatcher)
curl -sL "$REPO/distill.md" -o "$CMD_DIR/distill.md"
echo "  ✓ distill.md (dispatcher)"

# Download the full process (read by sub-agent from disk, NOT a command)
curl -sL "$REPO/distill-process.md" -o "$DISTILL_DIR/distill-process.md"
echo "  ✓ distill-process.md (process)"

# Download the session monitor (loaded every session via CLAUDE.md)
curl -sL "$REPO/distill-monitor.md" -o "$DISTILL_DIR/distill-monitor.md"
echo "  ✓ distill-monitor.md (session monitor)"

# Save version file for update checking
echo "$VERSION" > "$DISTILL_DIR/.version"
echo "  ✓ version $VERSION"

# Create spine if it doesn't exist
if [ ! -f "$DISTILL_DIR/SPINE.md" ]; then
    echo "# Distill Knowledge Index" > "$DISTILL_DIR/SPINE.md"
    echo "" >> "$DISTILL_DIR/SPINE.md"
    echo "<!-- This file is managed by claude-distill. Max 80 lines. -->" >> "$DISTILL_DIR/SPINE.md"
    echo "<!-- Each entry: - [Title](path.md) — when to read this -->" >> "$DISTILL_DIR/SPINE.md"
    echo "  ✓ SPINE.md (created)"
else
    echo "  · SPINE.md (already exists, preserved)"
fi

# ═══ MCP SERVER ═══

echo ""
echo "  ── MCP Server (smart retrieval) ──"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "  ⚠ Node.js not found. Skipping MCP server installation."
    echo "    Distill will still work (fallback mode: reads SPINE directly)"
    echo "    Install Node.js 18+ to enable smart retrieval."
    MCP_INSTALLED=false
else
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "  ⚠ Node.js $NODE_VERSION found but 18+ required. Skipping MCP server."
        MCP_INSTALLED=false
    else
        # Download server files
        mkdir -p "$SERVER_DIR/src"
        curl -sL "$REPO/server/package.json" -o "$SERVER_DIR/package.json"
        curl -sL "$REPO/server/tsconfig.json" -o "$SERVER_DIR/tsconfig.json"
        curl -sL "$REPO/server/src/index.ts" -o "$SERVER_DIR/src/index.ts"
        curl -sL "$REPO/server/src/db.ts" -o "$SERVER_DIR/src/db.ts"
        curl -sL "$REPO/server/src/retrieval.ts" -o "$SERVER_DIR/src/retrieval.ts"
        echo "  ✓ Server source downloaded"

        # Install dependencies and build
        echo "  ⏳ Installing dependencies..."
        (cd "$SERVER_DIR" && npm install --registry https://registry.npmjs.org --silent 2>/dev/null)
        echo "  ✓ Dependencies installed"

        echo "  ⏳ Building..."
        (cd "$SERVER_DIR" && npx tsc --silent 2>/dev/null)
        echo "  ✓ Server built"

        # Register MCP server globally
        if command -v claude &> /dev/null; then
            # Remove existing registration if present (idempotent)
            claude mcp remove distill 2>/dev/null || true
            claude mcp add --scope user --transport stdio distill -- node "$SERVER_DIR/dist/index.js"
            echo "  ✓ MCP server registered globally (user scope)"
            MCP_INSTALLED=true
        else
            echo "  ⚠ 'claude' CLI not found in PATH. Server built but not registered."
            echo "    Register manually: claude mcp add --scope user --transport stdio distill -- node $SERVER_DIR/dist/index.js"
            MCP_INSTALLED=true  # built, just not registered
        fi
    fi
fi

# ═══ CLAUDE.md INTEGRATION ═══

echo ""
if [ -f "$CLAUDE_MD" ]; then
    # Check for current reference (distill-monitor.md)
    if grep -q "distill-monitor.md" "$CLAUDE_MD" 2>/dev/null; then
        echo "  · CLAUDE.md already references distill-monitor (up to date)"

    # Check for old-style reference (SPINE.md only) — offer upgrade
    elif grep -q "distill/SPINE.md" "$CLAUDE_MD" 2>/dev/null; then
        echo "  ℹ CLAUDE.md has an older distill reference (SPINE.md only)."
        echo "    The new version uses a session monitor with smart retrieval"
        echo "    and automatic pressure tracking."
        echo ""
        printf "  Replace old line with new one? [Y/n] "
        read -r response < /dev/tty
        if [[ "$response" =~ ^[Nn] ]]; then
            echo "  · Kept old reference. You can update manually later."
        else
            sed -i.bak '/distill\/SPINE.md/d' "$CLAUDE_MD"
            rm -f "$CLAUDE_MD.bak"
            echo "" >> "$CLAUDE_MD"
            echo "$DISTILL_LINE" >> "$CLAUDE_MD"
            echo "  ✓ Upgraded CLAUDE.md reference"
        fi

    # No distill reference at all — offer to add
    else
        echo "  ┌─────────────────────────────────────────────────────────────────────┐"
        echo "  │ For distill to work across sessions, it needs one line in your      │"
        echo "  │ ~/.claude/CLAUDE.md that tells Claude to read the session monitor:  │"
        echo "  │                                                                     │"
        echo "  │   $DISTILL_LINE"
        echo "  │                                                                     │"
        echo "  │ This enables:                                                       │"
        echo "  │   • Smart knowledge retrieval before major actions                  │"
        echo "  │   • Tracking memory pressure and suggesting /distill when needed    │"
        echo "  │   • Observable: see what memories Claude uses and why               │"
        echo "  └─────────────────────────────────────────────────────────────────────┘"
        echo ""
        printf "  Add this line to CLAUDE.md? [Y/n] "
        read -r response < /dev/tty
        if [[ "$response" =~ ^[Nn] ]]; then
            echo ""
            echo "  ✗ Installation cancelled."
            echo ""
            echo "    This line is required — without it, sessions can't load"
            echo "    prior knowledge or evolve globally. The tool won't work"
            echo "    as intended without it."
            echo ""
            echo "    Run the installer again when you're ready."
            rm -f "$CMD_DIR/distill.md"
            rm -f "$DISTILL_DIR/distill-process.md"
            rm -f "$DISTILL_DIR/distill-monitor.md"
            rm -f "$DISTILL_DIR/.version"
            exit 1
        else
            echo "" >> "$CLAUDE_MD"
            echo "$DISTILL_LINE" >> "$CLAUDE_MD"
            echo "  ✓ Added distill reference to CLAUDE.md"
        fi
    fi
else
    echo "  ⚠ No ~/.claude/CLAUDE.md found. Creating one with distill reference."
    echo "$DISTILL_LINE" > "$CLAUDE_MD"
    echo "  ✓ Created CLAUDE.md with distill reference"
fi

# ═══ SUMMARY ═══

echo ""
echo "  ══════════════════════════════════════"
echo "  Installed to:"
echo "    Commands:  $CMD_DIR/"
echo "    Knowledge: $DISTILL_DIR/"
echo "    Server:    $SERVER_DIR/"
echo "    Version:   $VERSION"
echo ""
if [ "$MCP_INSTALLED" = true ]; then
    echo "  Mode: MCP server (smart retrieval + observability)"
else
    echo "  Mode: Fallback (reads SPINE directly, no observability)"
    echo "    → Install Node.js 18+ to enable the MCP server"
fi
echo ""
echo "  Usage: type /distill in any Claude Code session"
echo ""
if [ -n "$EXISTING_VERSION" ]; then
    echo "  Upgraded from v${EXISTING_VERSION} → v${VERSION}"
else
    echo "  Fresh install complete."
fi
echo ""
echo "  Uninstall:"
echo "    claude mcp remove distill 2>/dev/null"
echo "    rm $CMD_DIR/distill.md"
echo "    rm -rf $DISTILL_DIR"
echo "    # Remove the 'Distill' line from ~/.claude/CLAUDE.md"
echo ""
