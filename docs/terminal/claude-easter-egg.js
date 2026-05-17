// claude-easter-egg.js — Kernel panic easter egg
// Typing "claude" in the shell launches a fake Claude Code session.
// Any input triggers a comedic context overflow leading to a kernel panic screen.

export function createClaudeEasterEgg({ body, addLine, showFooter, killCursors, removeFooter, footerType, footerCursor, terminalEl, setActive, onPanicRestart }) {
    let inClaude = false, claudeReady = false;

    return { startClaude, handleClaudeInput, isInClaude: () => inClaude, isReady: () => claudeReady };

    // ── Public: Launch Claude Code boot sequence ──

    function startClaude() {
        inClaude = true;
        const bootLines = buildBootLines();
        let i = 0;
        (function showNext() {
            if (i >= bootLines.length) {
                killCursors();
                showFooter({ model: 'Mythos 7.0', ctx: '3%', effort: 'maximum' });
                claudeReady = true;
                body.scrollTop = body.scrollHeight;
                return;
            }
            const item = bootLines[i];
            if (item.pre) {
                appendPreBlock(item.html);
            } else {
                addLine(item.html);
            }
            i++;
            setTimeout(showNext, item.delay);
        })();
    }

    // ── Public: Handle user input in Claude mode ──

    function handleClaudeInput(text) {
        if (!text.trim()) return;
        claudeReady = false;
        footerCursor(false);
        footerType('');
        addLine('<span style="color:#bb9af7"> * </span><span style="color:#565f89">Recombobulating\u2026 (thought for 1s)</span>');
        body.scrollTop = body.scrollHeight;
        setTimeout(() => showContextOverflow(), 2000);
    }

    // ── Private: Boot box construction ──

    function buildBootLines() {
        const W = 38, hr = '\u2500'.repeat(W);
        const s = '<span style="color:#bb9af7">', se = '</span>';
        const boxHtml = [
            `${s}\u256d${hr}\u256e${se}`,
            `${s}\u2502${se}${' '.repeat(W)}${s}\u2502${se}`,
            `${s}\u2502${se}  <span style="color:#c0caf5;font-weight:bold">Claude Code</span> <span style="color:#565f89">v2.1.109</span>${' '.repeat(16)}${s}\u2502${se}`,
            `${s}\u2502${se}  <span style="color:#565f89">Mythos 7.0 (\u221E ctx) \u00b7 Claude Mythos</span>${' '.repeat(2)}${s}\u2502${se}`,
            `${s}\u2502${se}  <span style="color:#565f89">/Users/visitor</span>${' '.repeat(22)}${s}\u2502${se}`,
            `${s}\u2502${se}${' '.repeat(W)}${s}\u2502${se}`,
            `${s}\u2570${hr}\u256f${se}`,
        ].join('\n');
        return [
            { html: '&nbsp;', delay: 200 },
            { html: boxHtml, delay: 50, pre: true },
            { html: '&nbsp;', delay: 300 },
        ];
    }

    function appendPreBlock(html) {
        const el = document.createElement('div');
        el.className = 'term-line visible';
        el.style.whiteSpace = 'pre';
        el.style.lineHeight = '1.6';
        el.innerHTML = html;
        body.appendChild(el);
        body.scrollTop = body.scrollHeight;
    }

    // ── Private: Panic sequence ──

    function showContextOverflow() {
        addLine('<span style="font-size:1.5rem;animation:spin-ball 1s linear infinite;display:inline-block">\ud83c\udf00</span> <span style="color:#ff9e43">Mythos context exceeded\u2026</span>');
        body.scrollTop = body.scrollHeight;
        setTimeout(() => triggerFlashAndPanic(), 1500);
    }

    function triggerFlashAndPanic() {
        setActive(false);
        removeFooter();
        gsap.to(terminalEl, {
            backgroundColor: '#fff', duration: 0.05, yoyo: true, repeat: 3,
            onComplete: () => gsap.set(terminalEl, { backgroundColor: '' })
        });
        setTimeout(() => renderKernelPanic(), 300);
    }

    function renderKernelPanic() {
        body.style.background = '#000';
        body.style.padding = '2rem';
        body.style.overflow = 'hidden';
        body.innerHTML = '';
        const lines = panicLines();
        let i = 0;
        (function go() {
            if (i >= lines.length) {
                showRestartPrompt();
                return;
            }
            const l = document.createElement('div');
            l.className = 'term-line visible';
            l.innerHTML = lines[i] || '&nbsp;';
            l.style.fontSize = '0.68rem';
            l.style.lineHeight = '1.6';
            body.appendChild(l);
            i++;
            setTimeout(go, i < 3 ? 100 : 40);
        })();
    }

    function showRestartPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'term-line visible';
        prompt.style.fontSize = '0.68rem';
        prompt.style.lineHeight = '1.6';
        prompt.style.marginTop = '1rem';
        prompt.innerHTML = '<span style="color:#565f89">Press any key to restart...</span><span class="term-cursor"></span>';
        body.appendChild(prompt);
        body.scrollTop = body.scrollHeight;

        function onRestart(e) {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            e.preventDefault();
            document.removeEventListener('keydown', onRestart);
            resetTerminalAndRestart();
        }
        document.addEventListener('keydown', onRestart);
    }

    function resetTerminalAndRestart() {
        body.style.background = '';
        body.style.padding = '';
        body.style.overflow = '';
        body.innerHTML = '';
        inClaude = false;
        claudeReady = false;
        if (onPanicRestart) onPanicRestart();
    }

    function panicLines() {
        return [
            '<span style="color:#fff;font-weight:bold">*** KERNEL PANIC ***</span>',
            '',
            '<span style="color:#aaa">panic(cpu 4): "Mythos context overflow"</span>',
            '<span style="color:#aaa">Memory ID: 0xdeadbeef</span>',
            '',
            '<span style="color:#888">  claude_mythos_init + 0x420</span>',
            '<span style="color:#888">  context_window_overflow + 0x69</span>',
            '<span style="color:#888">  infinite_recursion_handler + 0x1337</span>',
            '<span style="color:#888">  reality_check_failed + 0xdead</span>',
            '<span style="color:#888">  hal9000_compat_layer + 0x2001</span>',
            '',
            '<span style="color:#fff;font-weight:bold">** don\'t use Mythos next time **</span>',
            '',
            '<span style="color:#666">tip: try claude-distill instead.</span>',
            '<span style="color:#666">curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/install.sh | bash</span>',
        ];
    }
}
