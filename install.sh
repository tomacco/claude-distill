#!/bin/bash
# claude-distill installer
# https://github.com/tomacco/claude-distill

set -e

REPO="https://raw.githubusercontent.com/tomacco/claude-distill/main"
CMD_DIR="$HOME/.claude/commands"

echo ""
echo "  ╭──────────────────────────────╮"
echo "  │  installing claude-distill   │"
echo "  ╰──────────────────────────────╯"
echo ""

# Ensure commands directory exists
mkdir -p "$CMD_DIR"

# Download the command
curl -sL "$REPO/distill.md" -o "$CMD_DIR/distill.md"

echo "  ✓ Installed to $CMD_DIR/distill.md"
echo ""
echo "  Usage: type /distill in any Claude Code session"
echo ""
