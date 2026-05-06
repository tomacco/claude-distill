#!/bin/bash
# claude-distill installer
# https://github.com/tomacco/claude-distill

set -e

REPO="https://raw.githubusercontent.com/tomacco/claude-distill/main"
CMD_DIR="$HOME/.claude/commands"
DISTILL_DIR="$HOME/.claude/distill"

echo ""
echo "  ╭──────────────────────────────╮"
echo "  │  installing claude-distill   │"
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

echo ""
echo "  Installed to:"
echo "    Commands: $CMD_DIR/"
echo "    Knowledge: $DISTILL_DIR/"
echo ""
echo "  Usage: type /distill in any Claude Code session"
echo ""
echo "  Uninstall:"
echo "    rm $CMD_DIR/distill.md $CMD_DIR/distill-process.md"
echo "    rm -rf $DISTILL_DIR"
echo ""
