class AuraDistill < Formula
  desc "Retrospective knowledge distillation for Claude Code"
  homepage "https://github.com/tomacco/aura-distill"
  url "https://github.com/tomacco/aura-distill/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "f8436dec1f2c1a5cfbfe5ee26ea6396e3b6f1cdee82dff02fa1c21d405e68e5d"
  license "MIT"

  head "https://github.com/tomacco/aura-distill.git", branch: "main"

  def install
    # Only install files needed by the installer — skip docs, tests, server, etc.
    libexec.install "install.sh", "VERSION", "LICENSE",
                    "distill.md", "distill-process.md", "distill-monitor.md",
                    "banner.txt"
    (libexec/"rules").install "rules/distill.md"

    # Create the `aura-distill` wrapper that runs the installer
    (bin/"aura-distill").write <<~SH
      #!/bin/bash
      # aura-distill — installed via Homebrew
      set -e

      LIBEXEC="#{libexec}"

      case "${1:-install}" in
        install)
          shift 2>/dev/null || true
          exec bash "$LIBEXEC/install.sh" "$@"
          ;;
        uninstall)
          PROFILE="${HOME}/.claude"
          if [ -n "$2" ]; then
            PROFILE="${HOME}/.claude-${2}"
          fi
          rm -f "$PROFILE/commands/distill.md"
          rm -f "$PROFILE/rules/distill.md"
          rm -f "$PROFILE/distill/distill-process.md"
          rm -f "$PROFILE/distill/distill-monitor.md"
          rm -f "$PROFILE/distill/.version"
          echo "Uninstalled from $PROFILE (knowledge files preserved)"
          ;;
        version)
          cat "$LIBEXEC/VERSION"
          ;;
        *)
          echo "Usage: aura-distill [install|uninstall|version] [--profile <name>]"
          echo ""
          echo "Commands:"
          echo "  install    Install distill files to your Claude profile (default)"
          echo "  uninstall  Remove distill files (keeps your knowledge)"
          echo "  version    Show installed version"
          ;;
      esac
    SH
  end

  def caveats
    <<~EOS
      To complete setup, run:
        aura-distill install

      This copies the distill files to your Claude Code profile (~/.claude/).

      For a specific profile:
        aura-distill install --profile personal

      To upgrade after `brew upgrade`:
        aura-distill install
    EOS
  end

  test do
    assert_match "1.0.0", shell_output("#{bin}/aura-distill version").strip
  end
end
