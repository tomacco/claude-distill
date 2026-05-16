// genie.js — Canvas-based macOS genie minimize effect
// Two-phase animation: bottom narrows first, then top collapses down.
// Uses html2canvas (lazy-loaded) + horizontal strip warping with Bezier clip path.
// Hold Alt before clicking minimize to run at 10x slow motion.

let altHeld = false;
document.addEventListener('keydown', e => { if (e.key === 'Alt') altHeld = true; });
document.addEventListener('keyup', e => { if (e.key === 'Alt') altHeld = false; });

export { altHeld };

export function genieMinimize(element, slow, onComplete) {
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

        const overlay = createOverlay(captured, rect, sectionRect, section);
        const ctx = overlay.getContext('2d');
        const w = captured.width;
        const h = captured.height;

        const targetW = 40 * dpr;
        const STRIPS = 50;
        const DURATION = slow ? 7500 : 750;
        const start = performance.now();

        element.style.visibility = 'hidden';

        requestAnimationFrame(function frame(now) {
            const raw = Math.min((now - start) / DURATION, 1);
            const t = easeInOut(raw);

            drawFrame(ctx, captured, w, h, t, targetW, STRIPS);

            if (raw < 1) {
                requestAnimationFrame(frame);
            } else {
                overlay.remove();
                element.style.visibility = '';
                element.style.display = 'none';
                onComplete();
            }
        });
    });
}

// ── Private: Canvas setup ──

function createOverlay(captured, rect, sectionRect, section) {
    const overlay = document.createElement('canvas');
    overlay.width = captured.width;
    overlay.height = captured.height;
    overlay.style.cssText = `position:absolute;top:${rect.top - sectionRect.top}px;left:${rect.left - sectionRect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:20;pointer-events:none;`;
    section.appendChild(overlay);
    return overlay;
}

// ── Private: Per-frame rendering ──

function drawFrame(ctx, captured, w, h, t, targetW, STRIPS) {
    const p1 = easeOut(Math.min(1, t / 0.55));
    const p2 = easeOut(Math.max(0, Math.min(1, (t - 0.4) / 0.6)));

    const botLeft = (w - (w + (targetW - w) * p1)) / 2;
    const botRight = w - botLeft;
    const topLeft = (w - (w + (targetW - w) * p2)) / 2;
    const topRight = w - topLeft;
    const topY = h * p2;
    const totalH = h - topY;

    const ctrlBias = 0.25;
    const leftCtrl = topLeft + (botLeft - topLeft) * ctrlBias;
    const rightCtrl = topRight + (botRight - topRight) * ctrlBias;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    clipBezierShape(ctx, topLeft, topRight, botLeft, botRight, leftCtrl, rightCtrl, topY, totalH);
    drawStrips(ctx, captured, w, h, STRIPS, topLeft, topRight, botLeft, botRight, leftCtrl, rightCtrl, topY, totalH);
    ctx.restore();
}

// ── Private: Bezier clip path ──

function clipBezierShape(ctx, topLeft, topRight, botLeft, botRight, leftCtrl, rightCtrl, topY, totalH) {
    const CURVE_PTS = 60;
    ctx.beginPath();
    for (let i = 0; i <= CURVE_PTS; i++) {
        const f = i / CURVE_PTS;
        const x = bezierX(f, topRight, rightCtrl, botRight);
        const y = topY + totalH * f;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = CURVE_PTS; i >= 0; i--) {
        const f = i / CURVE_PTS;
        const x = bezierX(f, topLeft, leftCtrl, botLeft);
        const y = topY + totalH * f;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();
}

// ── Private: Strip warping ──

function drawStrips(ctx, captured, w, h, STRIPS, topLeft, topRight, botLeft, botRight, leftCtrl, rightCtrl, topY, totalH) {
    for (let i = 0; i < STRIPS; i++) {
        const frac = (i + 0.5) / STRIPS;
        const srcY = (i / STRIPS) * h;
        const srcH = h / STRIPS;

        const stripLeft = bezierX(frac, topLeft, leftCtrl, botLeft);
        const stripRight = bezierX(frac, topRight, rightCtrl, botRight);
        const stripW = stripRight - stripLeft;

        const drawY = topY + (totalH / STRIPS) * i;
        const drawH = totalH / STRIPS + 0.5;

        ctx.drawImage(captured, 0, srcY, w, srcH, stripLeft, drawY, stripW, drawH);
    }
}

// ── Private: Math utilities ──

function bezierX(t, p0, p1, p2) {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
