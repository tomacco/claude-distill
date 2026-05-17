// ═══ TERMINAL ENGINE — aura-distill landing page ═══
// Data-driven animation + interactive shell + easter eggs
gsap.registerPlugin(ScrollTrigger, TextPlugin);

(function() {
const body = document.getElementById('terminal-body');
const terminalEl = document.getElementById('demo-terminal');
const SEP = '\u2500'.repeat(45);

// ═══ SHARED HELPERS ═══
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

// ═══ FOOTER (Claude Code status bar + input) ═══
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

function removeFooter() { const f = document.getElementById('claude-footer'); if (f) f.remove(); }
function footerType(t) { const el = document.getElementById('footer-typed'); if (el) el.textContent = t; }
function footerCursor(v) { const c = document.querySelector('#claude-footer .term-cursor'); if (c) c.style.display = v ? '' : 'none'; }

// ═══ BOOT BOX ═══
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
    body.appendChild(boot); body.scrollTop = body.scrollHeight;
}

// ═══ ANIMATION SCRIPT ═══
const distillLines = [
    { type:'blank' }, { type:'header', text:'  \u27e1 Retrospective Distillation' },
    { type:'dim', text:'  Scanning session: 85 messages \u00b7 2h 14m' }, { type:'blank' },
    { type:'separator', text:'  '+'\u2500'.repeat(46) }, { type:'blank' },
    { type:'header', text:'  SIGNALS DETECTED' }, { type:'blank' },
    { type:'signal', badge:'correction', badgeClass:'term-type-correction', quote:'I want this behavior only with this topic/consumer', principle:'Blast radius awareness', desc:'Never modify shared infrastructure for one consumer.' },
    { type:'blank' },
    { type:'signal', badge:'confusion', badgeClass:'term-type-confusion', quote:'Help me because I am super confused', principle:'Debugging approach', desc:'Needs full semantic chain before accepting a fix.' },
    { type:'blank' },
    { type:'signal', badge:'preference', badgeClass:'term-type-preference', quote:'Apply Primera Plana \u2014 newspaper style', principle:'Code architecture', desc:'Public methods first, implementation at the bottom.' },
    { type:'blank' },
    { type:'signal', badge:'escalation', badgeClass:'term-type-escalation', quote:'A 404 is permanent. Why are we retrying?', principle:'Permanent vs transient failures', desc:'Detect permanent failures early, skip retry.' },
    { type:'blank' }, { type:'separator', text:'  '+'\u2500'.repeat(46) }, { type:'blank' },
    { type:'header', text:'  ENCODED TO' }, { type:'blank' },
    { type:'file', text:'  \u2713 ~/.claude/distill/craft/kafka-patterns.md' },
    { type:'file', text:'  \u2713 ~/.claude/distill/profile/working-style.md' },
    { type:'file', text:'  \u2713 ~/.claude/distill/ops/delivery-flow.md' },
    { type:'blank' }, { type:'score', text:'  Memory pressure: 7/10 \u2192 2/10' },
    { type:'success', text:'  \u2713 4 principles encoded \u00b7 3 files updated' },
    { type:'blank' }, { type:'dim', text:'  Next session inherits these learnings automatically.' },
];

const steps = [
    { act:'boot' }, { act:'footer' }, { act:'wait', t:0.5 },
    { act:'line', html:'&nbsp;' }, { act:'line', html:'<span style="color:#565f89">  ...</span>' }, { act:'wait', t:0.3 },
    { act:'line', html:'<span style="color:#7aa2f7">Claude</span>  <span style="color:#565f89">I apologize for applying the error handler to the shared factory again. You\'re right \u2014 that would affect all consumers. Let me revert and create a dedicated one.</span>' },
    { act:'wait', t:1.2 },
    { act:'type', text:'/distill', t:1.2 }, { act:'wait', t:0.3 },
    { act:'submit', text:'/distill' },
    { act:'spinner', text:'Harvesting signals...', t:1.5 },
    { act:'output', lines:distillLines },
    { act:'wait', t:0.6 }, { act:'footerReset' }, { act:'wait', t:0.8 },
    { act:'type', text:'/exit', t:0.8 }, { act:'wait', t:0.3 },
    { act:'submit', text:'/exit' }, { act:'wait', t:0.2 },
    { act:'exit' },
];

const tl = gsap.timeline({ scrollTrigger:{ trigger:'#demo-terminal', start:'bottom bottom', once:true }});

steps.forEach(s => {
    switch(s.act) {
        case 'boot': tl.call(renderBoot); tl.to({},{duration:0.3}); break;
        case 'footer': tl.call(()=>showFooter()); break;
        case 'wait': tl.to({},{duration:s.t}); break;
        case 'line': tl.call(()=>addLine(s.html)); tl.to({},{duration:0.05}); break;
        case 'type':
            (function(text, dur){
                const chars = text.split('');
                const perChar = dur / chars.length;
                chars.forEach((ch, idx) => {
                    tl.call(() => {
                        const el = document.getElementById('footer-typed');
                        if (el) el.textContent += ch;
                    });
                    tl.to({}, { duration: perChar });
                });
            })(s.text, s.t);
            break;
        case 'submit':
            tl.call(()=>{ addLine(`<span style="color:#3b4261">${SEP}</span>`); addLine(`<span style="color:#9ece6a">\u276f</span> ${s.text}`); footerType(''); footerCursor(false); });
            break;
        case 'spinner':
            tl.call(()=>{
                const sl=document.createElement('div'); sl.className='term-line visible'; sl.id='demo-spinner';
                sl.innerHTML=`<span class="term-spinner">  \u280b </span><span class="term-dim">${s.text}</span>`;
                body.appendChild(sl); body.scrollTop=body.scrollHeight;
                const fr=['\u280b','\u2819','\u2839','\u2838','\u283c','\u2834','\u2826','\u2827','\u2807','\u280f']; let i=0;
                sl._int=setInterval(()=>{const sp=sl.querySelector('.term-spinner');if(sp)sp.textContent='  '+fr[i++%fr.length]+' ';},80);
            });
            tl.to({},{duration:s.t});
            tl.call(()=>{const sl=document.getElementById('demo-spinner');if(sl){clearInterval(sl._int);sl.remove();}});
            break;
        case 'output':
            s.lines.forEach(ld=>{
                tl.call(()=>addFadeLine(ld));
                tl.to({},{duration:ld.type==='signal'?0.25:ld.type==='blank'?0.04:0.1});
            });
            break;
        case 'footerReset': tl.call(()=>footerCursor(true)); break;
        case 'exit':
            tl.call(()=>{
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
            tl.to({},{duration:1.5});
            tl.call(()=>initShell());
            break;
    }
});

// ═══ CANVAS GENIE EFFECT ═══
// Two-phase genie matching macOS behavior:
//   Phase 1 (0–55%): Bottom edge narrows to target width and slides to target X.
//                     Top edge stays fixed. Sides curve between them.
//   Phase 2 (40–100%): Top collapses down into the narrow channel.
// Hold Alt before clicking minimize to run at 10× slow motion.
let altHeld = false;
document.addEventListener('keydown', e => { if (e.key === 'Alt') altHeld = true; });
document.addEventListener('keyup', e => { if (e.key === 'Alt') altHeld = false; });

function genieMinimize(element, slow, onComplete) {
    const loadLib = typeof html2canvas !== 'undefined'
        ? Promise.resolve()
        : new Promise((resolve) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            s.onload = resolve;
            s.onerror = () => { element.style.display = 'none'; onComplete(); };
            document.head.appendChild(s);
        });

    const dpr = window.devicePixelRatio || 1;

    loadLib.then(() => html2canvas(element, {
        backgroundColor: null, scale: dpr, logging: false
    })).then(captured => {
        const rect = element.getBoundingClientRect();
        const section = element.closest('.terminal-section');
        const sectionRect = section.getBoundingClientRect();

        // Overlay canvas sized to element (not section) to avoid alignment issues
        const overlay = document.createElement('canvas');
        const cw = captured.width;   // device pixels, exact match to capture
        const ch = captured.height;
        overlay.width = cw;
        overlay.height = ch;
        // Position overlay exactly on top of the element
        overlay.style.cssText = `position:absolute;top:${rect.top - sectionRect.top}px;left:${rect.left - sectionRect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:20;pointer-events:none;`;
        section.appendChild(overlay);

        const ctx = overlay.getContext('2d');
        // Work entirely in device pixels — no ctx.scale
        const w = cw;  // device pixels
        const h = ch;

        // Target: bottom-center, ~40px CSS → device pixels
        const targetW = 40 * dpr;
        const targetCX = w / 2;
        const targetBottom = h;

        const STRIPS = 50;
        const DURATION = slow ? 7500 : 750;
        const start = performance.now();

        element.style.visibility = 'hidden';

        function easeOut(x) { return 1 - Math.pow(1-x, 3); }
        function easeInOut(x) { return x<0.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2; }

        // Compute left/right edge X at a given Y fraction (0=top, 1=bottom)
        // using quadratic Bézier: P0=top edge, P1=control (bulge), P2=bottom edge
        function bezierX(t, p0, p1, p2) {
            const mt = 1-t;
            return mt*mt*p0 + 2*mt*t*p1 + t*t*p2;
        }

        function frame(now) {
            const raw = Math.min((now - start) / DURATION, 1);
            const t = easeInOut(raw);

            // Phase 1: bottom narrows (0→1 over first 55% of t)
            const p1 = easeOut(Math.min(1, t / 0.55));
            // Phase 2: top collapses down (0→1 from 40% of t onward)
            const p2 = easeOut(Math.max(0, Math.min(1, (t - 0.4) / 0.6)));

            // Bottom edge: narrows to targetW, pinned at bottom
            const botLeft = (w - (w + (targetW - w) * p1)) / 2;
            const botRight = w - botLeft;

            // Top edge: fixed during phase 1, collapses in phase 2
            const topLeft = (w - (w + (targetW - w) * p2)) / 2;
            const topRight = w - topLeft;
            const topY = h * p2;

            const totalH = h - topY;

            // Control points for side curves — bulge outward (stay wide longer)
            // Control Y is at 30% from top: keeps top wide, curves late
            const ctrlBias = 0.25;
            const leftCtrl = topLeft + (botLeft - topLeft) * ctrlBias;
            const rightCtrl = topRight + (botRight - topRight) * ctrlBias;

            // Build smooth clip path using Bézier edges
            const CURVE_PTS = 60;
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.beginPath();
            // Right edge: top to bottom
            for (let i = 0; i <= CURVE_PTS; i++) {
                const f = i / CURVE_PTS;
                const x = bezierX(f, topRight, rightCtrl, botRight);
                const y = topY + totalH * f;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            // Left edge: bottom to top
            for (let i = CURVE_PTS; i >= 0; i--) {
                const f = i / CURVE_PTS;
                const x = bezierX(f, topLeft, leftCtrl, botLeft);
                const y = topY + totalH * f;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.clip();

            // Draw strips within the clip — each strip warped to its Bézier width
            for (let i = 0; i < STRIPS; i++) {
                const frac = (i + 0.5) / STRIPS; // sample at strip center
                const srcY = (i / STRIPS) * h;
                const srcH = h / STRIPS;

                // This strip's width/position from the Bézier curves
                const stripLeft = bezierX(frac, topLeft, leftCtrl, botLeft);
                const stripRight = bezierX(frac, topRight, rightCtrl, botRight);
                const stripW = stripRight - stripLeft;

                const drawY = topY + (totalH / STRIPS) * i;
                const drawH = totalH / STRIPS + 0.5;

                ctx.drawImage(captured, 0, srcY, w, srcH, stripLeft, drawY, stripW, drawH);
            }
            ctx.restore();

            if (raw < 1) {
                requestAnimationFrame(frame);
            } else {
                overlay.remove();
                element.style.visibility = '';
                element.style.display = 'none';
                onComplete();
            }
        }
        requestAnimationFrame(frame);
    });
}

// ═══ INTERACTIVE SHELL ═══
function initShell() {
    let buf='', active=true, inClaude=false, claudeReady=false;

    function killCursors(){ body.querySelectorAll('.term-cursor').forEach(c=>c.remove()); const fc=document.querySelector('#claude-footer .term-cursor'); if(fc)fc.remove(); }

    function prompt(){
        killCursors();
        const l=document.createElement('div'); l.className='term-line visible';
        l.innerHTML='<span class="term-prompt">$ </span><span class="term-shell-input"></span><span class="term-cursor"></span>';
        body.appendChild(l); body.scrollTop=body.scrollHeight; return l;
    }

    let cur = prompt();

    const cmds={
        ls:(a)=>{const fs={'~':['projects','.claude','Documents'],'~/.claude':['CLAUDE.md','distill','commands','rules'],'~/.claude/distill':['SPINE.md','craft','ops','profile']};return(fs[a]||fs['~']).map(f=>f.includes('.')?f:`<span style="color:#7aa2f7">${f}/</span>`).join('  ');},
        pwd:()=>'/Users/visitor/projects/backend', whoami:()=>'visitor', echo:(a)=>a||'',
        cat:(a)=>{if(a&&a.includes('SPINE'))return'<span style="color:#565f89"># Distill Knowledge Index</span>\n- [Kafka patterns](craft/kafka-patterns.md)\n- [Code style](craft/code-style.md)\n- [Working style](profile/working-style.md)';if(a&&a.includes('.zshrc'))return'<span style="color:#565f89"># lol nice try</span>';return`<span style="color:#f72585">cat: ${a||''}: No such file</span>`;},
        clear:()=>'__CLEAR__',
        help:()=>'<span style="color:#565f89">ls, pwd, cat, echo, clear, whoami, neofetch, sudo, vim, claude</span>',
        sudo:()=>'<span style="color:#f72585">visitor is not in the sudoers file. This incident will be reported.</span>',
        vim:()=>'<span style="color:#565f89">Why would you do that to yourself?</span>',
        rm:(a)=>(a&&a.includes('-rf'))?'<span style="color:#f72585">rm: nice try, but no.</span>':'',
        neofetch:()=>'<span style="color:#bb9af7">  .---.  </span>visitor@distill\n<span style="color:#bb9af7"> / O O \\ </span>OS: macOS 15.4 | Memory: \u221E (distilled)',
        exit:()=>'<span style="color:#565f89">logout\n[Process completed]</span>',
    };

    function exec(cmd){
        const t=cmd.trim(); if(!t)return;
        const[c,...r]=t.split(/\s+/);
        if(c==='claude'){startClaude();return;}
        if(cmds[c]){const o=cmds[c](r.join(' '));if(o==='__CLEAR__'){body.innerHTML='';cur=prompt();return;}if(o){const el=document.createElement('div');el.className='term-line visible';el.style.whiteSpace='pre-wrap';el.innerHTML=o;body.appendChild(el);}}
        else{addLine(`<span style="color:#f72585">zsh: command not found: ${c}</span>`);}
        cur=prompt();
    }

    // ═══ CLAUDE EASTER EGG ═══
    function startClaude(){
        inClaude=true;
        const W=38, hr='\u2500'.repeat(W), s='<span style="color:#bb9af7">', se='</span>';
        const boxHtml=[
            `${s}\u256d${hr}\u256e${se}`,
            `${s}\u2502${se}${' '.repeat(W)}${s}\u2502${se}`,
            `${s}\u2502${se}  <span style="color:#c0caf5;font-weight:bold">Claude Code</span> <span style="color:#565f89">v2.1.109</span>${' '.repeat(16)}${s}\u2502${se}`,
            `${s}\u2502${se}  <span style="color:#565f89">Mythos 7.0 (\u221E ctx) \u00b7 Claude Mythos</span>${' '.repeat(2)}${s}\u2502${se}`,
            `${s}\u2502${se}  <span style="color:#565f89">/Users/visitor</span>${' '.repeat(22)}${s}\u2502${se}`,
            `${s}\u2502${se}${' '.repeat(W)}${s}\u2502${se}`,
            `${s}\u2570${hr}\u256f${se}`,
        ].join('\n');
        const bootLines = [
            { html:'&nbsp;', delay:200 },
            { html:boxHtml, delay:50, pre:true },
            { html:'&nbsp;', delay:300 },
        ];
        let i=0;
        (function showNext(){
            if(i>=bootLines.length){
                killCursors();
                showFooter({model:'Mythos 7.0',ctx:'3%',effort:'maximum'});
                claudeReady=true;
                body.scrollTop=body.scrollHeight;
                return;
            }
            const item=bootLines[i];
            if(item.pre){
                const el=document.createElement('div');
                el.className='term-line visible';
                el.style.whiteSpace='pre';
                el.style.lineHeight='1.6';
                el.innerHTML=item.html;
                body.appendChild(el);
                body.scrollTop=body.scrollHeight;
            } else {
                addLine(item.html);
            }
            i++;
            setTimeout(showNext, item.delay);
        })();
    }

    function handleClaudeInput(text){
        if(!text.trim())return; claudeReady=false; footerCursor(false); footerType('');
        addLine('<span style="color:#bb9af7"> * </span><span style="color:#565f89">Recombobulating\u2026 (thought for 1s)</span>');
        body.scrollTop=body.scrollHeight;
        setTimeout(()=>{
            addLine('<span style="font-size:1.5rem;animation:spin-ball 1s linear infinite;display:inline-block">\ud83c\udf00</span> <span style="color:#ff9e43">Mythos context exceeded\u2026</span>');
            body.scrollTop=body.scrollHeight;
            setTimeout(()=>{
                active=false; removeFooter();
                gsap.to(terminalEl,{backgroundColor:'#fff',duration:0.05,yoyo:true,repeat:3,onComplete:()=>gsap.set(terminalEl,{backgroundColor:''})});
                setTimeout(()=>{
                    body.style.background='#000';body.style.padding='2rem';body.style.overflow='hidden';body.innerHTML='';
                    const p=['<span style="color:#fff;font-weight:bold">*** KERNEL PANIC ***</span>','','<span style="color:#aaa">panic(cpu 4): "Mythos context overflow"</span>','<span style="color:#aaa">Memory ID: 0xdeadbeef</span>','','<span style="color:#888">  claude_mythos_init + 0x420</span>','<span style="color:#888">  context_window_overflow + 0x69</span>','<span style="color:#888">  infinite_recursion_handler + 0x1337</span>','<span style="color:#888">  reality_check_failed + 0xdead</span>','<span style="color:#888">  hal9000_compat_layer + 0x2001</span>','','<span style="color:#fff;font-weight:bold">** don\'t use Mythos next time **</span>','','<span style="color:#666">tip: try aura-distill instead.</span>','<span style="color:#666">curl -sL https://raw.githubusercontent.com/tomacco/aura-distill/main/install.sh | bash</span>'];
                    let i=0;(function go(){if(i>=p.length)return;const l=document.createElement('div');l.className='term-line visible';l.innerHTML=p[i]||'&nbsp;';l.style.fontSize='0.68rem';l.style.lineHeight='1.6';body.appendChild(l);i++;setTimeout(go,i<3?100:40);})();
                },300);
            },1500);
        },2000);
    }

    // ═══ CLOSE BUTTON — terminate → Classic Mac (no genie) ═══
    document.getElementById('term-btn-close').addEventListener('click',e=>{e.stopPropagation();document.getElementById('term-modal-overlay').classList.add('visible');});
    document.getElementById('term-modal-cancel').addEventListener('click',()=>document.getElementById('term-modal-overlay').classList.remove('visible'));
    document.getElementById('term-modal-terminate').addEventListener('click',()=>{
        document.getElementById('term-modal-overlay').classList.remove('visible');
        active=false;
        const section=terminalEl.closest('.terminal-section');
        section.style.position='relative';
        terminalEl.style.display='none';
        buildClassicMac(terminalEl);
    });

    // ═══ MINIMIZE BUTTON — canvas genie → Classic Mac ═══
    document.getElementById('term-btn-minimize').addEventListener('click',e=>{
        e.stopPropagation();
        active=false;
        const section=terminalEl.closest('.terminal-section');
        section.style.position='relative';
        buildClassicMac(terminalEl);
        // Genie on top: terminal absolute-positioned, canvas warp reveals classic beneath
        terminalEl.style.position='absolute';
        terminalEl.style.top='0';
        terminalEl.style.left='0';
        terminalEl.style.right='0';
        terminalEl.style.zIndex='10';
        genieMinimize(terminalEl, altHeld, ()=>{
            // Genie done — terminal is display:none, clear the absolute positioning
            // but keep section relative so classic Mac layout works
            terminalEl.style.position='';
            terminalEl.style.top='';
            terminalEl.style.left='';
            terminalEl.style.right='';
            terminalEl.style.zIndex='';
        });
    });

    // ═══ CLASSIC MAC BUILDER ═══
    function buildClassicMac(termRef){
        const section=termRef.closest('.terminal-section');
        const classic=document.createElement('div');
        classic.className='classic-mac';

        // Menu definitions
        const menus={
            file:[
                {label:'New Folder',key:'\u2318N'},
                {label:'Open',key:'\u2318O'},
                {label:'Close',key:'\u2318W'},
                {sep:true},
                {label:'Get Info',key:'\u2318I'},
                {sep:true},
                {label:'Restart',action:'restart'},
            ],
            edit:[
                {label:'Undo',key:'\u2318Z',disabled:true},
                {sep:true},
                {label:'Cut',key:'\u2318X',disabled:true},
                {label:'Copy',key:'\u2318C',disabled:true},
                {label:'Paste',key:'\u2318V',disabled:true},
                {label:'Clear',disabled:true},
            ],
            view:[
                {label:'by Icon',checked:true},
                {label:'by Name'},
                {label:'by Date'},
                {label:'by Size'},
            ],
            special:[
                {label:'Clean Up'},
                {label:'Empty Trash'},
                {sep:true},
                {label:'Restart',action:'restart'},
                {label:'Shut Down',action:'shutdown'},
            ],
        };

        function buildDropdown(items){
            return items.map(it=>{
                if(it.sep) return '<div class="classic-menu-sep"></div>';
                const dis=it.disabled?' disabled':'';
                const check=it.checked?'\u2713 ':'';
                const key=it.key?`<span class="classic-menu-shortcut">${it.key}</span>`:'';
                const act=it.action?` data-action="${it.action}"`:'';
                return `<div class="classic-menu-dropdown-item${dis}"${act}>${check}${it.label}${key}</div>`;
            }).join('');
        }

        // File icons (CSS-drawn shapes)
        const folders=['Knowledge','Research','Archive'];
        const docs=['SPINE.md','distill.md'];

        const folderIcons=folders.map(f=>`
            <div class="classic-file-icon">
                <div class="classic-folder"></div>
                <div class="classic-file-name">${f}</div>
            </div>`).join('');

        const docIcons=docs.map(f=>`
            <div class="classic-file-icon">
                <div class="classic-doc"></div>
                <div class="classic-file-name">${f}</div>
            </div>`).join('');

        const fileIcons=folderIcons+docIcons;
        const totalItems=folders.length+docs.length;

        classic.innerHTML=`
            <div class="classic-menubar">
                <div class="classic-menu-item classic-menu-brain" data-menu="brain">\ud83e\udde0
                    <div class="classic-menu-dropdown">
                        <div class="classic-menu-dropdown-item disabled">About This Computer</div>
                        <div class="classic-menu-sep"></div>
                        <div class="classic-menu-dropdown-item disabled">aura-distill v0.7</div>
                        <div class="classic-menu-dropdown-item disabled">\u201cI distilled knowledge</div>
                        <div class="classic-menu-dropdown-item disabled">&nbsp;before it was cool.\u201d</div>
                        <div class="classic-menu-dropdown-item disabled">&nbsp;\u2014 HyperCard, 1987</div>
                    </div>
                </div>
                <div class="classic-menu-item" data-menu="file">File
                    <div class="classic-menu-dropdown">${buildDropdown(menus.file)}</div>
                </div>
                <div class="classic-menu-item" data-menu="edit">Edit
                    <div class="classic-menu-dropdown">${buildDropdown(menus.edit)}</div>
                </div>
                <div class="classic-menu-item" data-menu="view">View
                    <div class="classic-menu-dropdown">${buildDropdown(menus.view)}</div>
                </div>
                <div class="classic-menu-item" data-menu="special">Special
                    <div class="classic-menu-dropdown">${buildDropdown(menus.special)}</div>
                </div>
            </div>

            <div class="classic-desktop" id="classic-desktop">
                <div class="classic-window" id="classic-finder-window">
                    <div class="classic-titlebar">
                        <div class="classic-close-box" id="classic-close-box"></div>
                        <div class="classic-titlebar-stripes"></div>
                        <div class="classic-window-title">aura-distill</div>
                    </div>
                    <div class="classic-infobar">
                        <span>${totalItems} items</span>
                        <span>420K in disk</span>
                        <span>1,337K available</span>
                    </div>
                    <div class="classic-content-wrap">
                        <div class="classic-content">${fileIcons}</div>
                        <div class="classic-scrollbar">
                            <div class="classic-scroll-arrow">\u25b2</div>
                            <div class="classic-scroll-thumb"></div>
                            <div class="classic-scroll-arrow">\u25bc</div>
                        </div>
                    </div>
                    <div class="classic-bottombar">
                        <div class="classic-bottombar-left">\u25c1</div>
                        <div class="classic-bottombar-track"></div>
                        <div class="classic-bottombar-right">\u25b7</div>
                    </div>
                </div>

                <div class="classic-file-icon classic-app-icon classic-desktop-icon" id="classic-distill-app">
                    <div class="classic-neural-icon"><canvas id="classic-neural-canvas" width="32" height="32"></canvas></div>
                    <div class="classic-file-name">aura-distill</div>
                </div>
            </div>

            <div class="classic-shutdown-screen" id="classic-shutdown-screen">
                <div class="classic-shutdown-dialog">
                    <div class="classic-shutdown-top">
                        <div class="classic-shutdown-computer">
                            <div class="classic-shutdown-monitor"><div class="classic-shutdown-screen-inner"></div></div>
                            <div class="classic-shutdown-base"></div>
                        </div>
                        <div class="classic-shutdown-text">You may now switch off<br>your computer safely.</div>
                    </div>
                    <button class="classic-shutdown-restart" id="classic-shutdown-restart">Restart</button>
                </div>
            </div>`;
        section.appendChild(classic);

        // ── Menu interactions ──
        let openMenu=null;
        classic.querySelectorAll('.classic-menu-item').forEach(mi=>{
            mi.addEventListener('mousedown',e=>{
                if(e.target.closest('.classic-menu-dropdown')) return;
                e.stopPropagation();
                if(mi.classList.contains('open')){mi.classList.remove('open');openMenu=null;}
                else{if(openMenu)openMenu.classList.remove('open');mi.classList.add('open');openMenu=mi;}
            });
            mi.addEventListener('mouseenter',()=>{
                if(openMenu&&openMenu!==mi){openMenu.classList.remove('open');mi.classList.add('open');openMenu=mi;}
            });
        });
        document.addEventListener('mousedown',e=>{if(openMenu&&!openMenu.contains(e.target)){openMenu.classList.remove('open');openMenu=null;}});

        // ── Menu actions ──
        classic.querySelectorAll('[data-action]').forEach(item=>{
            item.addEventListener('click',()=>{
                const act=item.dataset.action;
                if(openMenu){openMenu.classList.remove('open');openMenu=null;}
                if(act==='restart'){restoreTerminal();}
                else if(act==='shutdown'){showShutdown();}
            });
        });

        // ── File icon selection ──
        classic.querySelectorAll('.classic-file-icon').forEach(fi=>{
            fi.addEventListener('click',e=>{
                e.stopPropagation();
                classic.querySelectorAll('.classic-file-icon.selected').forEach(s=>s.classList.remove('selected'));
                fi.classList.add('selected');
            });
        });
        document.getElementById('classic-desktop').addEventListener('click',e=>{
            if(e.target.id==='classic-desktop')
                classic.querySelectorAll('.classic-file-icon.selected').forEach(s=>s.classList.remove('selected'));
        });

        // ── Close box — closes just the Finder window ──
        document.getElementById('classic-close-box').addEventListener('click',()=>{
            const win=document.getElementById('classic-finder-window');
            if(win) win.remove();
        });

        // ── Animated distill icon (canvas) ──
        const neuralCanvas=document.getElementById('classic-neural-canvas');
        const nCtx=neuralCanvas.getContext('2d');
        let nt=0, neuralRaf;
        const GW=16,GH=16;
        const cellW=32/GW, cellH=32/GH;
        function miniNeural(){
            nCtx.fillStyle='#fff';
            nCtx.fillRect(0,0,32,32);
            for(let y=0;y<GH;y++){
                for(let x=0;x<GW;x++){
                    const cx=(x-GW/2)/(GW/2), cy=(y-GH/2)/(GH/2);
                    const r=Math.sqrt(cx*cx+cy*cy);
                    const wave=Math.sin(r*6-nt*0.08)*Math.cos(nt*0.03+Math.atan2(cy,cx)*2);
                    const flicker=Math.sin(x*0.9+nt*0.05)*Math.cos(y*1.4-nt*0.04);
                    const v=wave*0.6+flicker*0.4;
                    if(v>0.15){
                        const a=Math.min(1,(v-0.15)/0.6);
                        nCtx.fillStyle=`rgba(0,0,0,${a})`;
                        nCtx.fillRect(x*cellW,y*cellH,cellW-0.5,cellH-0.5);
                    }
                }
            }
            nt+=1.5;
            neuralRaf=requestAnimationFrame(miniNeural);
        }
        miniNeural();

        // ── Double-click distill app → restart demo ──
        document.getElementById('classic-distill-app').addEventListener('dblclick',e=>{
            e.stopPropagation();
            restoreTerminal();
        });

        // ── Shutdown ──
        function showShutdown(){
            document.getElementById('classic-shutdown-screen').classList.add('visible');
        }

        document.getElementById('classic-shutdown-restart').addEventListener('click',()=>{
            classic.style.transition='opacity 0.8s ease';
            classic.style.opacity='0';
            setTimeout(()=>restoreTerminal(),900);
        });

        // ── Cleanup & restore ──
        function cleanup(){ if(neuralRaf) cancelAnimationFrame(neuralRaf); }

        function restoreTerminal(){
            cleanup();
            if(classic.parentNode) classic.remove();
            termRef.style.cssText=''; // clear ALL inline styles at once
            section.style.position='';
            active=true;
        }

        return classic;
    }

    // ═══ KEYBOARD ═══
    let focused=true;
    terminalEl.style.cursor='text';
    terminalEl.addEventListener('click',()=>{focused=true;terminalEl.style.outline='1px solid #3b4261';});
    document.addEventListener('click',e=>{if(!terminalEl.contains(e.target)){focused=false;terminalEl.style.outline='';}});

    document.addEventListener('keydown',e=>{
        if(!active||!focused)return;
        if(e.key==='Enter'){
            e.preventDefault();
            if(inClaude&&claudeReady){addLine(`<span style="color:#3b4261">${SEP}</span>`);addLine(`<span style="color:#9ece6a">\u276f</span> ${buf}`);handleClaudeInput(buf);}
            else if(!inClaude){if(cur){const c=cur.querySelector('.term-cursor');if(c)c.remove();}exec(buf);}
            buf='';
        } else if(e.key==='Backspace'){
            e.preventDefault();buf=buf.slice(0,-1);
            const t=inClaude?document.getElementById('footer-typed'):cur&&cur.querySelector('.term-shell-input');
            if(t)t.textContent=buf;
        } else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){
            e.preventDefault();buf+=e.key;
            const t=inClaude?document.getElementById('footer-typed'):cur&&cur.querySelector('.term-shell-input');
            if(t)t.textContent=buf;
        }
    });
}
})();
