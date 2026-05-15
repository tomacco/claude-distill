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

# Relative time function using SQLite
relative_time_sql() {
    cat << 'EOF'
    CASE
        WHEN (strftime('%s','now') - strftime('%s', timestamp)) < 10 THEN 'just now'
        WHEN (strftime('%s','now') - strftime('%s', timestamp)) < 60 THEN (strftime('%s','now') - strftime('%s', timestamp)) || 's ago'
        WHEN (strftime('%s','now') - strftime('%s', timestamp)) < 3600 THEN ((strftime('%s','now') - strftime('%s', timestamp)) / 60) || 'm ago'
        WHEN (strftime('%s','now') - strftime('%s', timestamp)) < 86400 THEN ((strftime('%s','now') - strftime('%s', timestamp)) / 3600) || 'h ago'
        WHEN (strftime('%s','now') - strftime('%s', timestamp)) < 172800 THEN 'yesterday'
        ELSE strftime('%m/%d', timestamp)
    END
EOF
}

relative_time_started() {
    cat << 'EOF'
    CASE
        WHEN (strftime('%s','now') - strftime('%s', started_at)) < 60 THEN 'just now'
        WHEN (strftime('%s','now') - strftime('%s', started_at)) < 3600 THEN ((strftime('%s','now') - strftime('%s', started_at)) / 60) || 'm ago'
        WHEN (strftime('%s','now') - strftime('%s', started_at)) < 86400 THEN ((strftime('%s','now') - strftime('%s', started_at)) / 3600) || 'h ago'
        WHEN (strftime('%s','now') - strftime('%s', started_at)) < 172800 THEN 'yesterday'
        ELSE strftime('%m/%d', started_at)
    END
EOF
}

while true; do
    clear

    # Header
    printf "${PURPLE}${BOLD}  ◆ distill dashboard${RESET}  ${DIM}$(date +%H:%M:%S)${RESET}\n"
    printf "  ${DIM}────────────────────────────────────────────────────────${RESET}\n"
    echo ""

    # Active sessions
    printf "  ${BOLD}Sessions${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            substr(id, 1, 8),
            $(relative_time_started),
            recalls_fired,
            recalls_useful,
            CASE WHEN recalls_fired > 0
                THEN round(recalls_useful * 100.0 / recalls_fired) || '%'
                ELSE '-'
            END
        FROM sessions
        ORDER BY started_at DESC
        LIMIT 5;
    " 2>/dev/null | while IFS='|' read -r session started recalls useful accuracy; do
        printf "  ${DIM}%s${RESET}  %-10s  recalls: %s  useful: %s  accuracy: %s\n" "$session" "$started" "$recalls" "$useful" "$accuracy"
    done
    echo ""

    # Recent recalls
    printf "  ${BOLD}Recent Recalls${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            $(relative_time_sql),
            action_type,
            substr(query, 1, 45),
            CASE WHEN confidence >= 0.6 THEN '✓' ELSE '?' END
        FROM access_log
        ORDER BY timestamp DESC
        LIMIT 10;
    " 2>/dev/null | while IFS='|' read -r ago type query conf; do
        if [ "$conf" = "✓" ]; then
            icon="${GREEN}✓${RESET}"
        else
            icon="${YELLOW}?${RESET}"
        fi
        printf "  %s ${DIM}%-10s${RESET} %-12s %s\n" "$icon" "$ago" "$type" "$query"
    done
    echo ""

    # Most used knowledge
    printf "  ${BOLD}Knowledge Usage${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            json_each.value,
            COUNT(*)
        FROM usage_log, json_each(usage_log.files_used)
        GROUP BY json_each.value
        ORDER BY COUNT(*) DESC
        LIMIT 5;
    " 2>/dev/null | while IFS='|' read -r file count; do
        bar=""
        for ((i=0; i<count && i<20; i++)); do bar+="█"; done
        printf "  ${CYAN}%-35s${RESET} %s ${DIM}(%s)${RESET}\n" "$file" "$bar" "$count"
    done
    echo ""

    # Recent decisions
    printf "  ${BOLD}Decisions${RESET}\n"
    sqlite3 "$DB" "
        SELECT
            $(relative_time_sql),
            substr(decision, 1, 55)
        FROM usage_log
        WHERE decision IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 5;
    " 2>/dev/null | while IFS='|' read -r ago decision; do
        printf "  ${DIM}%-10s${RESET}  %s\n" "$ago" "$decision"
    done
    echo ""

    # Footer
    printf "  ${DIM}────────────────────────────────────────────────────────${RESET}\n"
    printf "  ${DIM}refreshing every 2s · ctrl+c to exit${RESET}\n"

    sleep 2
done
