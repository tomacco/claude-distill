// classic-mac.js — Mac OS System 7 Finder UI
// Builds a fully interactive Classic Mac desktop with Finder window,
// dropdown menus, CSS-drawn file icons, animated app icon, and shutdown screen.

export function buildClassicMac(terminalEl, onRestore) {
    const section = terminalEl.closest('.terminal-section');

    // ── Data (must be before buildUI which reads menus) ──

    const menus = {
        file: [
            { label: 'New Folder', key: '\u2318N' },
            { label: 'Open', key: '\u2318O' },
            { label: 'Close', key: '\u2318W' },
            { sep: true },
            { label: 'Get Info', key: '\u2318I' },
            { sep: true },
            { label: 'Restart', action: 'restart' },
        ],
        edit: [
            { label: 'Undo', key: '\u2318Z', disabled: true },
            { sep: true },
            { label: 'Cut', key: '\u2318X', disabled: true },
            { label: 'Copy', key: '\u2318C', disabled: true },
            { label: 'Paste', key: '\u2318V', disabled: true },
            { label: 'Clear', disabled: true },
        ],
        view: [
            { label: 'by Icon', checked: true },
            { label: 'by Name' },
            { label: 'by Date' },
            { label: 'by Size' },
        ],
        special: [
            { label: 'Clean Up' },
            { label: 'Empty Trash' },
            { sep: true },
            { label: 'Restart', action: 'restart' },
            { label: 'Shut Down', action: 'shutdown' },
        ],
    };

    // ── Mutable state (must be before headline — avoids TDZ) ──
    let neuralRaf;

    // ── Headline: build, wire, return ──

    const classic = buildUI();
    section.appendChild(classic);
    wireMenus();
    wireFileIcons();
    wireWindowControls();
    startNeuralAnimation();
    wireShutdown();
    wireAppIcon();
    return classic;

    // ── Private: UI construction ──

    function buildUI() {
        const el = document.createElement('div');
        el.className = 'classic-mac';

        const folders = ['Knowledge', 'Research', 'Archive'];
        const docs = ['SPINE.md', 'distill.md'];
        const fileIcons = buildFolderIcons(folders) + buildDocIcons(docs);
        const totalItems = folders.length + docs.length;

        el.innerHTML = `
            ${buildMenuBar()}
            <div class="classic-desktop" id="classic-desktop">
                ${buildFinderWindow(fileIcons, totalItems)}
                ${buildDesktopIcon()}
            </div>
            ${buildShutdownScreen()}`;
        return el;
    }

    function buildMenuBar() {
        return `
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
            </div>`;
    }

    function buildFinderWindow(fileIcons, totalItems) {
        return `
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
            </div>`;
    }

    function buildDesktopIcon() {
        return `
            <div class="classic-file-icon classic-app-icon classic-desktop-icon" id="classic-distill-app">
                <div class="classic-neural-icon"><canvas id="classic-neural-canvas" width="32" height="32"></canvas></div>
                <div class="classic-file-name">aura-distill</div>
            </div>`;
    }

    function buildShutdownScreen() {
        return `
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
    }

    function buildDropdown(items) {
        return items.map(it => {
            if (it.sep) return '<div class="classic-menu-sep"></div>';
            const dis = it.disabled ? ' disabled' : '';
            const check = it.checked ? '\u2713 ' : '';
            const key = it.key ? `<span class="classic-menu-shortcut">${it.key}</span>` : '';
            const act = it.action ? ` data-action="${it.action}"` : '';
            return `<div class="classic-menu-dropdown-item${dis}"${act}>${check}${it.label}${key}</div>`;
        }).join('');
    }

    function buildFolderIcons(folders) {
        return folders.map(f => `
            <div class="classic-file-icon">
                <div class="classic-folder"></div>
                <div class="classic-file-name">${f}</div>
            </div>`).join('');
    }

    function buildDocIcons(docs) {
        return docs.map(f => `
            <div class="classic-file-icon">
                <div class="classic-doc"></div>
                <div class="classic-file-name">${f}</div>
            </div>`).join('');
    }

    // ── Private: Event wiring ──

    function wireMenus() {
        let openMenu = null;
        classic.querySelectorAll('.classic-menu-item').forEach(mi => {
            mi.addEventListener('mousedown', e => {
                if (e.target.closest('.classic-menu-dropdown')) return;
                e.stopPropagation();
                if (mi.classList.contains('open')) {
                    mi.classList.remove('open');
                    openMenu = null;
                } else {
                    if (openMenu) openMenu.classList.remove('open');
                    mi.classList.add('open');
                    openMenu = mi;
                }
            });
            mi.addEventListener('mouseenter', () => {
                if (openMenu && openMenu !== mi) {
                    openMenu.classList.remove('open');
                    mi.classList.add('open');
                    openMenu = mi;
                }
            });
        });
        document.addEventListener('mousedown', e => {
            if (openMenu && !openMenu.contains(e.target)) {
                openMenu.classList.remove('open');
                openMenu = null;
            }
        });

        classic.querySelectorAll('[data-action]').forEach(item => {
            item.addEventListener('click', () => {
                const act = item.dataset.action;
                if (openMenu) { openMenu.classList.remove('open'); openMenu = null; }
                if (act === 'restart') { restoreTerminal(); }
                else if (act === 'shutdown') { showShutdown(); }
            });
        });
    }

    function wireFileIcons() {
        classic.querySelectorAll('.classic-file-icon').forEach(fi => {
            fi.addEventListener('click', e => {
                e.stopPropagation();
                classic.querySelectorAll('.classic-file-icon.selected').forEach(s => s.classList.remove('selected'));
                fi.classList.add('selected');
            });
        });
        document.getElementById('classic-desktop').addEventListener('click', e => {
            if (e.target.id === 'classic-desktop')
                classic.querySelectorAll('.classic-file-icon.selected').forEach(s => s.classList.remove('selected'));
        });
    }

    function wireWindowControls() {
        document.getElementById('classic-close-box').addEventListener('click', () => {
            const win = document.getElementById('classic-finder-window');
            if (win) win.remove();
        });
    }

    function wireShutdown() {
        document.getElementById('classic-shutdown-restart').addEventListener('click', () => {
            classic.style.transition = 'opacity 0.8s ease';
            classic.style.opacity = '0';
            setTimeout(() => restoreTerminal(), 900);
        });
    }

    function wireAppIcon() {
        document.getElementById('classic-distill-app').addEventListener('dblclick', e => {
            e.stopPropagation();
            restoreTerminal();
        });
    }

    // ── Private: Neural animation ──


    function startNeuralAnimation() {
        const neuralCanvas = document.getElementById('classic-neural-canvas');
        const nCtx = neuralCanvas.getContext('2d');
        let nt = 0;
        const GW = 16, GH = 16;
        const cellW = 32 / GW, cellH = 32 / GH;

        function miniNeural() {
            nCtx.fillStyle = '#fff';
            nCtx.fillRect(0, 0, 32, 32);
            for (let y = 0; y < GH; y++) {
                for (let x = 0; x < GW; x++) {
                    const cx = (x - GW / 2) / (GW / 2), cy = (y - GH / 2) / (GH / 2);
                    const r = Math.sqrt(cx * cx + cy * cy);
                    const wave = Math.sin(r * 6 - nt * 0.08) * Math.cos(nt * 0.03 + Math.atan2(cy, cx) * 2);
                    const flicker = Math.sin(x * 0.9 + nt * 0.05) * Math.cos(y * 1.4 - nt * 0.04);
                    const v = wave * 0.6 + flicker * 0.4;
                    if (v > 0.15) {
                        const a = Math.min(1, (v - 0.15) / 0.6);
                        nCtx.fillStyle = `rgba(0,0,0,${a})`;
                        nCtx.fillRect(x * cellW, y * cellH, cellW - 0.5, cellH - 0.5);
                    }
                }
            }
            nt += 1.5;
            neuralRaf = requestAnimationFrame(miniNeural);
        }
        miniNeural();
    }

    // ── Private: Shutdown screen ──

    function showShutdown() {
        document.getElementById('classic-shutdown-screen').classList.add('visible');
    }

    // ── Private: Lifecycle ──

    function restoreTerminal() {
        cleanup();
        classic.remove();
        terminalEl.style.cssText = '';
        section.style.position = '';
        if (onRestore) onRestore();
    }

    function cleanup() {
        if (neuralRaf) cancelAnimationFrame(neuralRaf);
    }
}
