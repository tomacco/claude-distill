<p align="center">
  <img src="docs/header.svg" alt="claude-distill" width="800"/>
</p>

<p align="center">
  <strong>Every session makes all sessions better.</strong><br>
  <em>Global, persistent memory consolidation for Claude Code.</em>
</p>

<p align="center">
  <a href="https://tomacco.github.io/claude-distill/">Website</a> ·
  <a href="#installation">Install</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#uninstall">Uninstall</a>
</p>

---

## The problem

Every Claude session starts from zero. It doesn't know what you know. It doesn't remember what failed last week. It can't tell a senior architect from a first-time coder.

**You repeat yourself. It repeats its mistakes. Session ends. Knowledge gone.**

## The fix

```bash
curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/install.sh | bash
```

Type `/distill` after any session. Learnings persist **globally** — any project, any repo, any Claude Code workspace on your machine benefits from every past session.

---

## How it works

```
you type /distill
    → dispatcher harvests signals from the conversation
    → spawns an isolated sub-agent (your context stays clean)
    → sub-agent traces friction to first principles
    → encodes knowledge in ~/.claude/distill/
    → every future session inherits the learnings
```

### What it captures

| Layer | What it learns |
|---|---|
| **Craft** | How to practice your discipline better |
| **Operations** | Workflows, processes, tool-specific knowledge |
| **User profile** | Your expertise, communication style, thinking patterns |
| **Projects** | Domain context that's hard to re-derive |
| **Preferences** | How you like to collaborate with AI |

### Memory pressure

The system tracks unconsolidated learnings like sleep debt. When pressure is high, it suggests consolidation — you don't need to remember to type `/distill`.

### Anti-sycophancy

Five integrity principles are baked in. The system **never** encodes comfort as truth, flattens standards to reduce friction, or softens findings because you're frustrated. The goal is an honest ally, not a yes-machine.

---

## Installation

```bash
curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/install.sh | bash
```

This installs:

| File | Location | Purpose |
|------|----------|---------|
| `distill.md` | `~/.claude/commands/` | The `/distill` command |
| `distill-process.md` | `~/.claude/distill/` | Full process (read by sub-agent) |
| `distill-monitor.md` | `~/.claude/distill/` | Session monitor (pressure tracking) |
| `SPINE.md` | `~/.claude/distill/` | Knowledge index |

The installer asks permission to add one line to `~/.claude/CLAUDE.md` — this is required for cross-session knowledge loading and automatic suggestions.

---

## Architecture

```
~/.claude/
├── CLAUDE.md                        ← yours (one distill reference line added)
├── commands/
│   └── distill.md                   ← the /distill command
└── distill/                         ← all distill-managed knowledge
    ├── SPINE.md                     ← tier 1: index (max 80 lines, auto-loaded)
    ├── distill-process.md           ← the full process
    ├── distill-monitor.md           ← session monitor
    ├── .version                     ← installed version
    ├── craft/                       ← tier 2: discipline knowledge
    ├── ops/                         ← tier 2: operational knowledge
    ├── profile/                     ← tier 2: user model
    ├── projects/                    ← tier 2: project context
    ├── feedback/                    ← tier 2: preferences
    └── archive/                     ← tier 3: compressed history
```

**Three tiers** keep context lean:
- **Tier 1 (Spine):** Always loaded. Max 80 lines. Just pointers.
- **Tier 2 (Active):** Read on demand. Max 60 lines per file.
- **Tier 3 (Archive):** Compressed, rarely read. Never deleted.

---

## Updates

Checks for new versions once per session:

```
claude-distill update available: v0.1.0 → v0.3.1
Run the install command to update, or say 'auto-update' and I'll do it now.
```

Or just re-run the install one-liner.

## Uninstall

```bash
rm ~/.claude/commands/distill.md
rm -rf ~/.claude/distill/
# Remove the 'Distill' line from ~/.claude/CLAUDE.md
```

Clean. Total. No traces.

---

## Say what matters. It's listening.

Distill captures what you express. The more intentional you are, the sharper Claude becomes:

- **Say what's important** — "Use newspaper style. Non-negotiable."
- **Express frustration** — "I told you this already. Don't mock the database."
- **Correct with authority** — "No. Always go through staging. Always."

When you repeat a frustration, the system treats it as a critical failure in itself — it elevates priority, strengthens the encoding, and cross-references it so it's harder to miss next time.

**You shouldn't have to say things twice.** When you do, distill notices.

---

## Philosophy

**Being understood is a core human need.** Distill exists because your AI should feel like a colleague who remembers — not a stranger you brief from scratch.

**Struggling is a signal, not a virtue.** When something was hard, that's information worth capturing.

**Honesty compounds.** What's true today makes you excellent tomorrow. What's comfortable today costs you tomorrow.

---

<p align="center">
  <sub>v0.3.1 · MIT · Built for <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a></sub>
</p>
