// ═══ TERMINAL ENGINE — claude-distill landing page ═══
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
        // Build box — W=38 inner width
        // Line 1: "  Claude Code v2.1.109" (22) -> pad 16
        // Line 2: "  Mythos 7.0 (∞ ctx) · Claude Mythos" (36) -> pad 2
        // Line 3: "  /Users/visitor" (16) -> pad 22
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
            const delay=item.delay;
            i++;
            setTimeout(showNext, delay);
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
                    const p=['<span style="color:#fff;font-weight:bold">*** KERNEL PANIC ***</span>','','<span style="color:#aaa">panic(cpu 4): "Mythos context overflow"</span>','<span style="color:#aaa">Memory ID: 0xdeadbeef</span>','','<span style="color:#888">  claude_mythos_init + 0x420</span>','<span style="color:#888">  context_window_overflow + 0x69</span>','<span style="color:#888">  infinite_recursion_handler + 0x1337</span>','<span style="color:#888">  reality_check_failed + 0xdead</span>','<span style="color:#888">  hal9000_compat_layer + 0x2001</span>','','<span style="color:#fff;font-weight:bold">** don\'t use Mythos next time **</span>','','<span style="color:#666">tip: try claude-distill instead.</span>','<span style="color:#666">curl -sL https://raw.githubusercontent.com/tomacco/claude-distill/main/install.sh | bash</span>'];
                    let i=0;(function go(){if(i>=p.length)return;const l=document.createElement('div');l.className='term-line visible';l.innerHTML=p[i]||'&nbsp;';l.style.fontSize='0.68rem';l.style.lineHeight='1.6';body.appendChild(l);i++;setTimeout(go,i<3?100:40);})();
                },300);
            },1500);
        },2000);
    }

    // ═══ CLOSE BUTTON ═══
    document.getElementById('term-btn-close').addEventListener('click',e=>{e.stopPropagation();document.getElementById('term-modal-overlay').classList.add('visible');});
    document.getElementById('term-modal-cancel').addEventListener('click',()=>document.getElementById('term-modal-overlay').classList.remove('visible'));
    document.getElementById('term-modal-terminate').addEventListener('click',()=>{document.getElementById('term-modal-overlay').classList.remove('visible');gsap.to(terminalEl,{scale:0.95,opacity:0,duration:0.3,ease:'power2.in',onComplete:()=>gsap.to(terminalEl,{scale:1,opacity:1,duration:0.5,delay:1.5,ease:'power2.out'})});});

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
