// helpers.js — Terminal DOM utilities
// Shared primitives for rendering lines, managing the footer, and cursor state.

export function createHelpers(body, terminalEl) {

    function addLine(html) {
        const el = document.createElement('div');
        el.className = 'term-line visible';
        el.innerHTML = html || '&nbsp;';
        body.appendChild(el);
        body.scrollTop = body.scrollHeight;
        return el;
    }

    function addFadeLine(ld) {
        const div = document.createElement('div');
        div.className = 'term-line';
        switch (ld.type) {
            case 'blank': div.innerHTML = '&nbsp;'; break;
            case 'header': div.innerHTML = `<span class="term-header">${ld.text}</span>`; break;
            case 'dim': div.innerHTML = `<span class="term-dim">${ld.text}</span>`; break;
            case 'separator': div.innerHTML = `<span class="term-separator">${ld.text}</span>`; break;
            case 'signal':
                div.innerHTML = `  <span class="term-signal-type ${ld.badgeClass}">${ld.badge}</span> <span class="term-signal-quote">\u201c${ld.quote}\u201d</span>\n    <span class="term-principle-title">\u2192 ${ld.principle}:</span> <span class="term-principle-desc">${ld.desc}</span>`;
                break;
            case 'file':
                div.innerHTML = `<span class="term-success">${ld.text.substring(0,4)}</span><span class="term-file-path">${ld.text.substring(4)}</span>`;
                break;
            case 'score': div.innerHTML = `<span class="term-score">${ld.text}</span>`; break;
            case 'success': div.innerHTML = `<span class="term-success">${ld.text}</span>`; break;
        }
        body.appendChild(div);
        gsap.to(div, { opacity: 1, duration: 0.15, ease: 'power2.out' });
        body.scrollTop = body.scrollHeight;
    }

    function showFooter(opts) {
        if (document.getElementById('claude-footer')) return;
        const o = opts || {};
        const m = o.model || 'Mythos 7.0', c = o.ctx || '12%', e = o.effort || 'medium';
        const footer = document.createElement('div');
        footer.className = 'claude-footer';
        footer.id = 'claude-footer';
        footer.innerHTML = `
            <div class="claude-footer-input"><div class="claude-footer-input-line">
                <span class="claude-footer-chevron">\u276f</span>
                <span class="claude-footer-typed" id="footer-typed"></span><span class="term-cursor"></span>
            </div></div>
            <div class="claude-footer-status"><div class="claude-footer-row">
                <span class="claude-footer-model">${m}</span>
                <span class="claude-footer-ctx">ctx: [<span class="claude-footer-bar"><span class="claude-footer-bar-fill" style="width:${c}"></span></span>] ${c}/1000k</span>
                <span class="claude-footer-right">\u25D1 ${e} \u00b7 /effort</span>
            </div><div class="claude-footer-row claude-footer-perms">
                <span style="color:#f72585">\u25B8\u25B8</span> bypass permissions on <span style="color:#565f89">(shift+tab to cycle)</span>
            </div></div>`;
        terminalEl.appendChild(footer);
    }

    function removeFooter() {
        const f = document.getElementById('claude-footer');
        if (f) f.remove();
    }

    function footerType(t) {
        const el = document.getElementById('footer-typed');
        if (el) el.textContent = t;
    }

    function footerCursor(v) {
        const c = document.querySelector('#claude-footer .term-cursor');
        if (c) c.style.display = v ? '' : 'none';
    }

    function renderBoot() {
        const boot = document.createElement('div');
        boot.className = 'term-line visible';
        boot.style.whiteSpace = 'pre';
        boot.style.lineHeight = '1.6';
        function pad(content, len) { return '  <s>\u2502</s>' + content + ' '.repeat(42 - len) + '<s>\u2502</s>'; }
        const hr = '\u2500'.repeat(42);
        boot.innerHTML = [
            `  <s>\u256d${hr}\u256e</s>`, pad('',0),
            pad('  <b>Claude Code</b> <d>v2.1.109</d>', 22),
            pad('  <d>Mythos 7.0 (1M context) \u00b7 Claude Max</d>', 38),
            pad('  <d>/Users/visitor/projects/backend</d>', 33),
            pad('',0), `  <s>\u2570${hr}\u256f</s>`,
        ].join('\n')
         .replace(/<s>/g,'<span style="color:#bb9af7">').replace(/<\/s>/g,'</span>')
         .replace(/<b>/g,'<span style="color:#c0caf5;font-weight:bold">').replace(/<\/b>/g,'</span>')
         .replace(/<d>/g,'<span style="color:#565f89">').replace(/<\/d>/g,'</span>');
        body.appendChild(boot);
        body.scrollTop = body.scrollHeight;
    }

    function killCursors() {
        body.querySelectorAll('.term-cursor').forEach(c => c.remove());
        const fc = document.querySelector('#claude-footer .term-cursor');
        if (fc) fc.remove();
    }

    return { addLine, addFadeLine, showFooter, removeFooter, footerType, footerCursor, renderBoot, killCursors };
}
