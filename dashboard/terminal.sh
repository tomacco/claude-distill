#!/bin/bash
# Distill Terminal Dashboard — real-time TUI
# Reads from SQLite, refreshes every 2 seconds

DB="$HOME/.claude/distill/distill.db"
CYAN=$(printf '\033[0;36m')
PURPLE=$(printf '\033[0;35m')
GREEN=$(printf '\033[0;32m')
YELLOW=$(printf '\033[0;33m')
RED=$(printf '\033[0;31m')
DIM=$(printf '\033[2m')
BOLD=$(printf '\033[1m')
RESET=$(printf '\033[0m')

if [ ! -f "$DB" ]; then
    echo "No distill.db found. Run a session with the MCP server first."
    exit 1
fi

while true; do
    clear

    # Header
    printf "${PURPLE}${BOLD}  ◆ distill dashboard${RESET}  ${DIM}$(date +%H:%M:%S)${RESET}\n"
    printf "  ${DIM}────────────────────────────────────────────────────────${RESET}\n"
    echo ""

    # Active sessions
    printf "  ${BOLD}Sessions${RESET}\n"
    sqlite3 -header -column "$DB" "
        SELECT
            substr(id, 1, 8) as session,
            started_at as started,
            recalls_fired as recalls,
            recalls_useful as useful,
            CASE WHEN recalls_fired > 0
                THEN round(recalls_useful * 100.0 / recalls_fired) || '%'
                ELSE '-'
            END as accuracy
        FROM sessions
        ORDER BY started_at DESC
        LIMIT 5;
    " 2>/dev/null | while IFS= read -r line; do
        printf "  ${DIM}%s${RESET}\n" "$line"
    done
    echo ""

    # Recent recalls
    printf "  ${BOLD}Recent Recalls${RESET}  ${DIM}(last 10)${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            substr(timestamp, 12, 5) as time,
            action_type as type,
            substr(query, 1, 40) as query,
            CASE WHEN confidence >= 0.6 THEN '✓' ELSE '?' END as conf,
            files_returned
        FROM access_log
        ORDER BY timestamp DESC
        LIMIT 10;
    " 2>/dev/null | while IFS='|' read -r time type query conf files; do
        if [ "$conf" = "✓" ]; then
            icon="${GREEN}✓${RESET}"
        else
            icon="${YELLOW}?${RESET}"
        fi
        printf "  %s %s ${DIM}%-10s${RESET} %s\n" "$icon" "$time" "$type" "$query"
    done
    echo ""

    # Most used knowledge
    printf "  ${BOLD}Knowledge Usage${RESET}  ${DIM}(top files)${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            json_each.value as file,
            COUNT(*) as times
        FROM usage_log, json_each(usage_log.files_used)
        GROUP BY json_each.value
        ORDER BY times DESC
        LIMIT 5;
    " 2>/dev/null | while IFS='|' read -r file count; do
        bar=""
        for ((i=0; i<count && i<20; i++)); do bar+="█"; done
        printf "  ${CYAN}%-35s${RESET} %s ${DIM}(%s)${RESET}\n" "$file" "$bar" "$count"
    done
    echo ""

    # Recent decisions
    printf "  ${BOLD}Decisions${RESET}  ${DIM}(what Claude did with the knowledge)${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            substr(timestamp, 12, 5) as time,
            substr(decision, 1, 60) as decision
        FROM usage_log
        WHERE decision IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 5;
    " 2>/dev/null | while IFS='|' read -r time decision; do
        printf "  ${DIM}%s${RESET}  %s\n" "$time" "$decision"
    done
    echo ""

    # Footer
    printf "  ${DIM}────────────────────────────────────────────────────────${RESET}\n"
    printf "  ${DIM}refreshing every 2s · ctrl+c to exit${RESET}\n"

    sleep 2
done
