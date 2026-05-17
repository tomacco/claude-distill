# homebrew-aura-distill

Homebrew tap for [aura-distill](https://github.com/tomacco/aura-distill) — retrospective knowledge distillation for Claude Code.

## Install

```bash
brew tap tomacco/aura-distill
brew install aura-distill
aura-distill install
```

## Upgrade

```bash
brew upgrade aura-distill
aura-distill install
```

## Multi-profile

```bash
aura-distill install --profile personal
aura-distill install --profile work
```

## Uninstall

```bash
# Remove from Claude profile (keeps your knowledge)
aura-distill uninstall

# Remove the formula
brew uninstall aura-distill
brew untap tomacco/aura-distill
```
