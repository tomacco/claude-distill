# claude-distill

A Claude Code slash command that turns session friction into durable knowledge — and builds a better mental model of who you are over time.

## What it does

After a work session — coding, writing, designing, researching, managing — run `/distill` to:

1. **Extract learnings** from friction, failures, and surprises
2. **Evolve the user model** — understand your expertise, communication style, thinking patterns, and growth edges
3. **Route knowledge** to the right layer in YOUR file structure (discovered at runtime, not prescribed)
4. **Maintain honesty** — never encodes comfort as truth or softens findings to avoid discomfort

## Why this exists

LLMs start every conversation blind. They don't know if you're a senior architect or a first-year student. They don't know if "make it work" means "I trust you, just ship it" or "I'm stuck and need guidance."

`claude-distill` solves this by building a persistent, evolving understanding of:
- **What you know** (so future sessions calibrate explanations correctly)
- **How you communicate** (so interactions match your style, not a generic one)
- **Where you're growing** (so support lands where it's actually useful)
- **What went wrong** (so mistakes aren't repeated)

## Anti-sycophancy by design

Most AI memory systems have a failure mode: they optimize for making the user feel good rather than making them more capable. This produces distorted feedback loops where bad habits get reinforced because they were never challenged.

`claude-distill` has **integrity principles baked into the process** that cannot be overridden:

- Frustration is treated as diagnostic data, not as a signal to soften findings
- Preferences are encoded alongside their consequences (good and bad)
- Every learning is checked against: "Does this make the user more capable, or just more comfortable?"
- Tensions between honesty and comfort are flagged explicitly in the output

The goal is an **honest ally** — one that respects you enough to tell you what you need to hear.

## Installation

```bash
curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/install.sh | bash
```

This installs two files:
- `distill.md` — the dispatcher (harvests signals, spawns sub-agent)
- `distill-process.md` — the full process (executed by the sub-agent in isolation)

Then invoke it in any Claude Code session:

```
/distill
```

## How it works

### Self-discovering structure

Unlike rigid templates that assume a specific profession or file layout, `claude-distill` **discovers your knowledge structure at runtime**. It reads your workspace to find:

- Standards/conventions files (whatever your craft calls them)
- Procedures/workflow files
- Memory directories with indexes
- User profile files

This means it works whether you're a software engineer with `coding-standards.md`, a designer with `design-principles.md`, a PM with `decision-frameworks.md`, or a researcher with `methodology-notes.md`.

### The five layers

| Layer | What it captures |
|---|---|
| Craft standards | How to practice your discipline well |
| Operational procedures | How to get things done (workflows, processes) |
| Project context | Domain-specific knowledge |
| User profile | Who you are, how you think, what you know |
| Preferences | How you like to collaborate with AI |

### The distillation loop

```
harvest signals (main context) → spawn agent → trace to principles → encode → verify → report back
```

Distillation runs in a **spawned sub-agent** so your main conversation context stays intact. The dispatcher harvests all signals from the conversation (it can see the full history), packs them into a self-contained prompt, then hands off to an isolated agent that does the heavy lifting — reading files, writing knowledge, running compaction.

### Memory pressure (the sleep debt analogy)

The human brain accumulates adenosine during wakefulness — a chemical "sleep pressure" that degrades cognition until sleep consolidates memories and resets the system. LLM sessions work the same way:

- Unconsolidated learnings pile up in context
- Signal-to-noise ratio degrades
- Hallucination risk increases (the LLM equivalent of a sleep-deprived person confabulating)
- Eventually the session ends and everything not consolidated is lost forever

`claude-distill` tracks a **memory pressure score (0-10)** throughout the session. When pressure reaches 7+, it recommends a mid-session consolidation — like a power nap that resets cognitive load without stopping work.

This isn't about stopping. It's about consolidating so the REMAINING work is sharper.

## Isolation guarantee

Distill operates in its own directory (`~/.claude/distill/`) and **never touches your manually maintained files**. Not your `CLAUDE.md`, not your `memory/` directory, not your project configs.

If distill's knowledge conflicts with your existing files, it flags the conflict in the report and asks you to reconcile. It never overwrites.

```
~/.claude/
├── CLAUDE.md              ← yours. never touched.
├── commands/
│   ├── distill.md         ← installed by us (dispatcher)
│   └── distill-process.md ← installed by us (process)
└── distill/               ← all distill output lives here
    ├── SPINE.md           ← tier 1 index
    ├── craft/             ← tier 2
    ├── ops/               ← tier 2
    ├── profile/           ← tier 2
    ├── projects/          ← tier 2
    ├── feedback/          ← tier 2
    └── archive/           ← tier 3
```

## Uninstall

```bash
rm ~/.claude/commands/distill.md ~/.claude/commands/distill-process.md
rm -rf ~/.claude/distill/
```

No traces. No config to revert. No side effects.

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI

## Philosophy

**Struggling is a signal, not a virtue.** When something was unexpectedly hard, that's information worth capturing before it fades.

**Your AI should know you better over time.** Not to manipulate or flatter — to collaborate more effectively. A good colleague remembers how you think and what you care about.

**Honesty compounds.** A system that tells you what you want to hear feels good today and costs you tomorrow. A system that tells you what's true feels uncomfortable sometimes and makes you excellent over time.

## License

MIT
