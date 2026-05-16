// terminal/index.js — Terminal demo orchestrator
// Wires animation -> shell -> easter eggs -> window controls -> classic mac.
// Each module is self-contained; this file only connects them.

import { createHelpers } from './helpers.js';
import { runAnimation } from './animation.js';
import { createShell } from './shell.js';
import { createClaudeEasterEgg } from './claude-easter-egg.js';
import { genieMinimize, altHeld } from './genie.js';
import { buildClassicMac } from './classic-mac.js';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const body = document.getElementById('terminal-body');
const terminalEl = document.getElementById('demo-terminal');
const helpers = createHelpers(body, terminalEl);

let active = false;
let classicInstance = null;

wireWindowButtons();
runAnimation(helpers, () => startInteractiveMode());

function startInteractiveMode() {
    active = true;
    const setActive = (v) => { active = v; };

    const claudeEgg = createClaudeEasterEgg({
        body, terminalEl, setActive,
        ...helpers
    });

    const shell = createShell({
        body,
        addLine: helpers.addLine,
        killCursors: helpers.killCursors,
        startClaude: claudeEgg.startClaude,
    });

    wireKeyboard(claudeEgg, shell);
}

// ── Window button handlers (wired immediately, before animation) ──

function wireWindowButtons() {
    document.getElementById('term-btn-close').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('term-modal-overlay').classList.add('visible');
    });
    document.getElementById('term-modal-cancel').addEventListener('click', () => {
        document.getElementById('term-modal-overlay').classList.remove('visible');
    });
    document.getElementById('term-modal-terminate').addEventListener('click', () => {
        document.getElementById('term-modal-overlay').classList.remove('visible');
        if (classicInstance) return;
        active = false;
        const section = terminalEl.closest('.terminal-section');
        section.style.position = 'relative';
        terminalEl.style.display = 'none';
        classicInstance = buildClassicMac(terminalEl, () => { active = true; classicInstance = null; });
    });

    document.getElementById('term-btn-minimize').addEventListener('click', e => {
        e.stopPropagation();
        if (classicInstance) return;
        active = false;
        const section = terminalEl.closest('.terminal-section');
        section.style.position = 'relative';
        classicInstance = buildClassicMac(terminalEl, () => { active = true; classicInstance = null; });
        terminalEl.style.position = 'absolute';
        terminalEl.style.top = '0';
        terminalEl.style.left = '0';
        terminalEl.style.right = '0';
        terminalEl.style.zIndex = '10';
        genieMinimize(terminalEl, altHeld, () => {
            terminalEl.style.position = '';
            terminalEl.style.top = '';
            terminalEl.style.left = '';
            terminalEl.style.right = '';
            terminalEl.style.zIndex = '';
        });
    });
}

// ── Keyboard routing (wired after animation completes) ──

function wireKeyboard(claudeEgg, shell) {
    let focused = true;
    terminalEl.style.cursor = 'text';
    terminalEl.addEventListener('click', () => {
        focused = true;
        terminalEl.style.outline = '1px solid #3b4261';
    });
    document.addEventListener('click', e => {
        if (!terminalEl.contains(e.target)) {
            focused = false;
            terminalEl.style.outline = '';
        }
    });

    const SEP = '\u2500'.repeat(45);
    document.addEventListener('keydown', e => {
        if (!active || !focused) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            if (claudeEgg.isInClaude() && claudeEgg.isReady()) {
                helpers.addLine(`<span style="color:#3b4261">${SEP}</span>`);
                helpers.addLine(`<span style="color:#9ece6a">\u276f</span> ${shell.getBuffer()}`);
                claudeEgg.handleClaudeInput(shell.getBuffer());
            } else if (!claudeEgg.isInClaude()) {
                const cur = shell.getCurrentLine();
                if (cur) { const c = cur.querySelector('.term-cursor'); if (c) c.remove(); }
                shell.exec(shell.getBuffer());
            }
            shell.setBuffer('');
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            shell.setBuffer(shell.getBuffer().slice(0, -1));
            const t = claudeEgg.isInClaude()
                ? document.getElementById('footer-typed')
                : shell.getCurrentLine()?.querySelector('.term-shell-input');
            if (t) t.textContent = shell.getBuffer();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            shell.setBuffer(shell.getBuffer() + e.key);
            const t = claudeEgg.isInClaude()
                ? document.getElementById('footer-typed')
                : shell.getCurrentLine()?.querySelector('.term-shell-input');
            if (t) t.textContent = shell.getBuffer();
        }
    });
}
