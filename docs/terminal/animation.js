// animation.js — GSAP scroll-triggered timeline + distill demo data
// Plays the terminal boot sequence and distill demonstration on scroll.
// Calls onComplete when the exit sequence finishes to hand off to interactive mode.

export function runAnimation(helpers, onComplete) {
    const { addLine, addFadeLine, showFooter, removeFooter, renderBoot, footerType, footerCursor } = helpers;
    const SEP = '\u2500'.repeat(45);

    const tl = gsap.timeline({
        scrollTrigger: { trigger: '#demo-terminal', start: 'bottom bottom', once: true }
    });

    buildTimeline(tl);

    // ── Private: Demo data ──

    function distillLines() {
        return [
            { type: 'blank' },
            { type: 'header', text: '  \u27e1 Retrospective Distillation' },
            { type: 'dim', text: '  Scanning session: 85 messages \u00b7 2h 14m' },
            { type: 'blank' },
            { type: 'separator', text: '  ' + '\u2500'.repeat(46) },
            { type: 'blank' },
            { type: 'header', text: '  SIGNALS DETECTED' },
            { type: 'blank' },
            { type: 'signal', badge: 'correction', badgeClass: 'term-type-correction', quote: 'I want this behavior only with this topic/consumer', principle: 'Blast radius awareness', desc: 'Never modify shared infrastructure for one consumer.' },
            { type: 'blank' },
            { type: 'signal', badge: 'confusion', badgeClass: 'term-type-confusion', quote: 'Help me because I am super confused', principle: 'Debugging approach', desc: 'Needs full semantic chain before accepting a fix.' },
            { type: 'blank' },
            { type: 'signal', badge: 'preference', badgeClass: 'term-type-preference', quote: 'Apply Primera Plana \u2014 newspaper style', principle: 'Code architecture', desc: 'Public methods first, implementation at the bottom.' },
            { type: 'blank' },
            { type: 'signal', badge: 'escalation', badgeClass: 'term-type-escalation', quote: 'A 404 is permanent. Why are we retrying?', principle: 'Permanent vs transient failures', desc: 'Detect permanent failures early, skip retry.' },
            { type: 'blank' },
            { type: 'separator', text: '  ' + '\u2500'.repeat(46) },
            { type: 'blank' },
            { type: 'header', text: '  ENCODED TO' },
            { type: 'blank' },
            { type: 'file', text: '  \u2713 ~/.claude/distill/craft/kafka-patterns.md' },
            { type: 'file', text: '  \u2713 ~/.claude/distill/profile/working-style.md' },
            { type: 'file', text: '  \u2713 ~/.claude/distill/ops/delivery-flow.md' },
            { type: 'blank' },
            { type: 'score', text: '  Memory pressure: 7/10 \u2192 2/10' },
            { type: 'success', text: '  \u2713 4 principles encoded \u00b7 3 files updated' },
            { type: 'blank' },
            { type: 'dim', text: '  Next session inherits these learnings automatically.' },
        ];
    }

    function steps() {
        return [
            { act: 'boot' }, { act: 'footer' }, { act: 'wait', t: 0.5 },
            { act: 'line', html: '&nbsp;' },
            { act: 'line', html: '<span style="color:#565f89">  ...</span>' },
            { act: 'wait', t: 0.3 },
            { act: 'line', html: '<span style="color:#7aa2f7">Claude</span>  <span style="color:#565f89">I apologize for applying the error handler to the shared factory again. You\'re right \u2014 that would affect all consumers. Let me revert and create a dedicated one.</span>' },
            { act: 'wait', t: 1.2 },
            { act: 'type', text: '/distill', t: 1.2 }, { act: 'wait', t: 0.3 },
            { act: 'submit', text: '/distill' },
            { act: 'spinner', text: 'Harvesting signals...', t: 1.5 },
            { act: 'output', lines: distillLines() },
            { act: 'wait', t: 0.6 }, { act: 'footerReset' }, { act: 'wait', t: 0.8 },
            { act: 'type', text: '/exit', t: 0.8 }, { act: 'wait', t: 0.3 },
            { act: 'submit', text: '/exit' }, { act: 'wait', t: 0.2 },
            { act: 'exit' },
        ];
    }

    // ── Private: Timeline construction ──

    function buildTimeline(tl) {
        steps().forEach(s => {
            switch (s.act) {
                case 'boot': tl.call(renderBoot); tl.to({}, { duration: 0.3 }); break;
                case 'footer': tl.call(() => showFooter()); break;
                case 'wait': tl.to({}, { duration: s.t }); break;
                case 'line': tl.call(() => addLine(s.html)); tl.to({}, { duration: 0.05 }); break;
                case 'type': addTypeStep(tl, s.text, s.t); break;
                case 'submit': addSubmitStep(tl, s.text); break;
                case 'spinner': addSpinnerStep(tl, s.text, s.t); break;
                case 'output': addOutputStep(tl, s.lines); break;
                case 'footerReset': tl.call(() => footerCursor(true)); break;
                case 'exit': addExitStep(tl); break;
            }
        });
    }

    function addTypeStep(tl, text, dur) {
        const chars = text.split('');
        const perChar = dur / chars.length;
        chars.forEach(ch => {
            tl.call(() => {
                const el = document.getElementById('footer-typed');
                if (el) el.textContent += ch;
            });
            tl.to({}, { duration: perChar });
        });
    }

    function addSubmitStep(tl, text) {
        tl.call(() => {
            addLine(`<span style="color:#3b4261">${SEP}</span>`);
            addLine(`<span style="color:#9ece6a">\u276f</span> ${text}`);
            footerType('');
            footerCursor(false);
        });
    }

    function addSpinnerStep(tl, text, duration) {
        tl.call(() => {
            const sl = document.createElement('div');
            sl.className = 'term-line visible';
            sl.id = 'demo-spinner';
            sl.innerHTML = `<span class="term-spinner">  \u280b </span><span class="term-dim">${text}</span>`;
            const body = document.getElementById('terminal-body');
            body.appendChild(sl);
            body.scrollTop = body.scrollHeight;
            const fr = ['\u280b', '\u2819', '\u2839', '\u2838', '\u283c', '\u2834', '\u2826', '\u2827', '\u2807', '\u280f'];
            let i = 0;
            sl._int = setInterval(() => {
                const sp = sl.querySelector('.term-spinner');
                if (sp) sp.textContent = '  ' + fr[i++ % fr.length] + ' ';
            }, 80);
        });
        tl.to({}, { duration });
        tl.call(() => {
            const sl = document.getElementById('demo-spinner');
            if (sl) { clearInterval(sl._int); sl.remove(); }
        });
    }

    function addOutputStep(tl, lines) {
        lines.forEach(ld => {
            tl.call(() => addFadeLine(ld));
            tl.to({}, { duration: ld.type === 'signal' ? 0.25 : ld.type === 'blank' ? 0.04 : 0.1 });
        });
    }

    function addExitStep(tl) {
        tl.call(() => {
            removeFooter();
            addLine('&nbsp;');
            addLine('<span style="color:#565f89">/exit                 Exit the REPL</span>');
            addLine('<span style="color:#565f89">/context              Visualize context usage</span>');
            addLine('<span style="color:#565f89">/memory               Edit Claude memory files</span>');
            addLine('<span style="color:#565f89">/distill              Consolidate session learnings</span>');
            addLine('&nbsp;');
            addLine('<span style="color:#565f89">Resume this session with:</span>');
            addLine('<span style="color:#565f89">claude --resume a1b2c3d4-e5f6-7890-abcd-ef1234567890</span>');
            addLine('<span style="color:#c0caf5">visitor@mac ~ % </span><span class="term-cursor"></span>');
        });
        tl.to({}, { duration: 1.5 });
        tl.call(() => onComplete());
    }
}
