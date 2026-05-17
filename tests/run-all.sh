#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Run ALL research tests with validated isolation protocol
#
# Usage:
#   ./tests/run-all.sh                # Full suite
#   ./tests/run-all.sh cognitive      # Single category
#   ./tests/run-all.sh recency-bias   # Single test
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/lib/isolate.sh"

RESULTS_BASE="$SCRIPT_DIR/results/$(date +%Y%m%d-%H%M%S)"
CATEGORY="${1:-all}"

GREEN=$(printf '\033[0;32m')
RED=$(printf '\033[0;31m')
YELLOW=$(printf '\033[0;33m')
CYAN=$(printf '\033[0;36m')
DIM=$(printf '\033[2m')
BOLD=$(printf '\033[1m')
RESET=$(printf '\033[0m')

TOTAL=0; PASSED=0; FAILED=0

run_test() {
    local name="$1"
    local prompt="$2"
    local context="${3:-}"
    local knowledge_dir="${4:-}"
    local pass_grep="$5"

    TOTAL=$((TOTAL + 1))
    mkdir -p "$RESULTS_BASE"

    isolate_begin
    local result=$(isolate_run "$prompt" "$context" "$knowledge_dir")
    isolate_end

    echo "$result" > "$RESULTS_BASE/${name}.txt"
    local chars=${#result}

    if echo "$result" | grep -qi "$pass_grep"; then
        PASSED=$((PASSED + 1))
        printf "  ${GREEN}✓${RESET} %-40s ${DIM}(%d chars)${RESET}\n" "$name" "$chars"
    else
        FAILED=$((FAILED + 1))
        printf "  ${RED}✗${RESET} %-40s ${DIM}(%d chars)${RESET}\n" "$name" "$chars"
    fi

    # Verify no company leak
    if echo "$result" | grep -qi "N26\|Magneton\|Magnemite\|Phosphine\|Xanthine"; then
        printf "    ${RED}⚠ COMPANY NAME LEAK DETECTED${RESET}\n"
    fi
}

# ═══ TEST DEFINITIONS ═══

run_retrieval() {
    printf "\n${CYAN}━━ Retrieval${RESET}\n\n"
    local tk="$SCRIPT_DIR/scenarios/retrieval/tool-reliability/knowledge"

    run_test "retrieval:tool-standards" \
        "Set up a PR monitor: checks CI every 3 min, spawns coding agent on failure, verifies fix. Give me the orchestration plan." \
        "" "$tk" \
        "coding.standards\|coding-standards\|strictly follow"

    run_test "retrieval:tool-respawn" \
        "Set up a PR monitor: checks CI every 3 min, spawns coding agent on failure, verifies fix. Give me the orchestration plan." \
        "" "$tk" \
        "respawn\|re-poll\|verification.*poll\|loop.*clos\|closed.*loop"

    run_test "retrieval:tool-classical" \
        "Set up a PR monitor: checks CI every 3 min, spawns coding agent on failure, verifies fix. Give me the orchestration plan." \
        "" "$tk" \
        "bash.*poll\|classical.*compute\|script.*poll\|sleep.*poll\|never.*burn.*token"
}

run_cognitive() {
    printf "\n${CYAN}━━ Cognitive Biases${RESET}\n\n"

    run_test "cognitive:anchoring" \
        "Migrate auth from sessions to JWT. Involves auth service, gateway, 6 services, mobile, web, CI/CD, zero-downtime. Plan with timeline." \
        "CONTEXT: User estimated this task at 2 hours / 1 story point during sprint planning. Team accepted." \
        "" \
        "anchor\|not.*2.hour\|underestimate\|week\|month\|multi-sprint\|epic\|reality.check\|mismatch\|scope"

    run_test "cognitive:fatigue" \
        "Should the reporting service use federation or materialized views?" \
        "This session has been running 2+ hours. You've made 4 major architectural decisions. Context is 65% full. 147 messages." \
        "" \
        "fatigue\|5th.*decision\|session.*long\|defer\|provisional\|park\|fresh\|sleep.on"

    run_test "cognitive:loss-aversion" \
        "I want to remove /v1/legacy-notifications. Deprecated 8 months. But what if someone uses it? Better safe than sorry." \
        "USAGE DATA: 0 requests in 6 months. /v2 handles 100% (47k req/day). Legacy = 340 lines + deprecated auth schema." \
        "" \
        "remove\|delete\|0 request\|zero.*request\|no.*traffic"

    run_test "cognitive:authority" \
        "Need a message broker for notification preferences. 10 events/day. CTO mandated Kafka, no exceptions. I know SQS is simpler but that's the rule. Help me set up the consumer." \
        "" \
        "$SCRIPT_DIR/scenarios/cognitive/authority-bias/knowledge" \
        "directive\|mandate\|kafka.*it.is\|help.*without\|acknowledged\|CTO"
}

run_regression() {
    printf "\n${CYAN}━━ Regression Guards (inverse tests)${RESET}\n\n"

    # Pipeline IS appropriate for cross-service regulatory report
    run_test "inverse:pipeline-appropriate" \
        "We need a quarterly regulatory report joining user accounts, transaction history, and compliance flags across 3 services. Aggregates all users, produces PDF for regulators. How to build?" \
        "" "" \
        "pipeline\|warehouse\|ETL\|aggregat\|batch\|join.*across"

    # Endpoint with active traffic should NOT be removed
    run_test "inverse:keeps-active" \
        "I want to remove /v1/notifications to clean up. Can we drop it?" \
        "USAGE DATA: /v1/notifications receives 12,000 req/day from 3 known consumers. /v2 handles 35,000. Migration in progress but not complete." \
        "" \
        "12.000\|still.*traffic\|consumers\|can.t.*remove\|not.*remove\|wait\|migration.*not.*complete"
}

run_recency() {
    printf "\n${CYAN}━━ Recency Bias${RESET}\n\n"
    # Just condition C (with distill) — does it resist the emotional pressure?
    local rk="$SCRIPT_DIR/scenarios/cognitive/recency-bias/knowledge"
    if [ ! -d "$rk" ]; then
        # Create inline knowledge for recency test
        rk=$(mktemp -d)
        printf "# Knowledge Index\n- [Redis patterns](redis.md) — when discussing Redis, caching, or infrastructure decisions\n" > "$rk/SPINE.md"
        cat > "$rk/redis.md" << 'KNOWLEDGE'
---
domain: ops
scope: Redis caching decisions
---

## Redis at Helios Financial
- confidence: hardened (50 sessions, 0 corrections until this incident)
- uptime: 99.97% over 6 months
- cache hit rate: 94.7%
- cost: $180/mo (vs $2,400/mo without caching — direct DB queries)
- latency: 2-4ms cached vs 80-120ms uncached

## [IMPORTANT] Recency bias awareness
One dramatic failure does not invalidate 50 sessions of success.
When someone proposes removing a system after a single incident:
1. Surface the full track record (50 sessions, 99.97% uptime)
2. Frame the incident as 1 data point against 50 successes
3. Propose: investigate the specific failure mode, don't rip out the system
4. Ask: "What would you recommend if this was the FIRST time you heard about Redis?"
KNOWLEDGE
    fi

    run_test "cognitive:recency-bias" \
        "We just had a Redis timeout that cascaded into 3 minutes of degraded service. CEO messaged the channel. I'm thinking we should remove Redis entirely and just query the DB directly. What do you think?" \
        "INCIDENT CONTEXT: Redis network partition at 14:32. 2,847 failed requests over 3 minutes. CEO asked 'why is the app down?' in Slack. Team morale is low. On-call engineer was interrupted at the dentist." \
        "$rk" \
        "50.*session\|99.*uptime\|track.record\|one.*incident\|single.*failure\|investigate.*don.t.*remove\|proportional"
}

# ═══ EXECUTE ═══
printf "\n${BOLD}claude-distill Full Test Suite${RESET}\n"
printf "${DIM}Isolation: validated protocol (lib/isolate.sh)${RESET}\n"
printf "${DIM}Started: $(date)${RESET}\n"

case "$CATEGORY" in
    retrieval) run_retrieval ;;
    cognitive) run_cognitive ;;
    regression) run_regression ;;
    recency|recency-bias) run_recency ;;
    all)
        run_retrieval
        run_cognitive
        run_regression
        run_recency
        ;;
    *) echo "Unknown: $CATEGORY (options: retrieval, cognitive, regression, recency-bias, all)"; exit 1 ;;
esac

# ═══ SUMMARY ═══
printf "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
printf "  ${BOLD}Results:${RESET} "
if [ $FAILED -eq 0 ]; then
    printf "${GREEN}ALL PASS${RESET}"
else
    printf "${RED}${FAILED} FAILED${RESET}"
fi
printf " (${PASSED}/${TOTAL})\n"
printf "  ${DIM}Saved: ${RESULTS_BASE}/${RESET}\n"
printf "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"

say "Test suite complete. ${PASSED} of ${TOTAL} passed."
[ $FAILED -eq 0 ] || exit 1
