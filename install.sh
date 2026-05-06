#!/bin/bash
# claude-distill installer
# https://github.com/tomacco/claude-distill

set -e

VERSION="0.1.0"
REPO="https://raw.githubusercontent.com/tomacco/claude-distill/main"
CMD_DIR="$HOME/.claude/commands"
DISTILL_DIR="$HOME/.claude/distill"
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
DISTILL_LINE="# Distill Knowledge — read ~/.claude/distill/SPINE.md at session start for persistent learnings from /distill"

echo ""
echo "  ╭──────────────────────────────╮"
echo "  │  installing claude-distill   │"
echo "  │  v${VERSION}                       │"
echo "  ╰──────────────────────────────╯"
echo ""

# Ensure directories exist
mkdir -p "$CMD_DIR"
mkdir -p "$DISTILL_DIR"/{craft,ops,profile,projects,feedback,archive}

# Download the command (dispatcher)
curl -sL "$REPO/distill.md" -o "$CMD_DIR/distill.md"
echo "  ✓ distill.md (dispatcher)"

# Download the full process (used by sub-agent)
curl -sL "$REPO/distill-process.md" -o "$CMD_DIR/distill-process.md"
echo "  ✓ distill-process.md (process)"

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
    echo "  · SPINE.md (already exists, skipped)"
fi

# CLAUDE.md integration (transparent — asks user)
echo ""
if [ -f "$CLAUDE_MD" ]; then
    if grep -q "distill/SPINE.md" "$CLAUDE_MD" 2>/dev/null; then
        echo "  · CLAUDE.md already references distill (skipped)"
    else
        echo "  ┌─────────────────────────────────────────────────────────────────┐"
        echo "  │ To load learnings in future sessions, distill needs one line    │"
        echo "  │ added to your ~/.claude/CLAUDE.md:                              │"
        echo "  │                                                                 │"
        echo "  │   $DISTILL_LINE"
        echo "  │                                                                 │"
        echo "  │ This tells Claude to read your distilled knowledge at startup.  │"
        echo "  └─────────────────────────────────────────────────────────────────┘"
        echo ""
        printf "  Add this line to CLAUDE.md? [Y/n] "
        read -r response
        if [[ "$response" =~ ^[Nn] ]]; then
            echo "  · Skipped. You can add it manually later."
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

echo ""
echo "  ──────────────────────────────────────"
echo "  Installed to:"
echo "    Commands:  $CMD_DIR/"
echo "    Knowledge: $DISTILL_DIR/"
echo "    Version:   $VERSION"
echo ""
echo "  Usage: type /distill in any Claude Code session"
echo ""
echo "  Uninstall:"
echo "    rm $CMD_DIR/distill.md $CMD_DIR/distill-process.md"
echo "    rm -rf $DISTILL_DIR"
echo "    # Remove the distill line from ~/.claude/CLAUDE.md"
echo ""
