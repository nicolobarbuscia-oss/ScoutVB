import { G } from './state.js';
import { saveMatch } from './storage.js';

/* ── CONSTANTS ── */
const CW = 200, CH = 310, NET = CH / 2, THRE = 52;

/* ── ROTATION ── */
export function doRot() {
  const t = G.pl[0];
  for (let i = 0; i < 5; i++) G.pl[i] = G.pl[i + 1];
  G.pl[5] = t;
  const rm = { 1: 6, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
  G.sz = rm[G.sz];
  animRot();
  setTimeout(buildCourt, 560);
  saveMatch();
}

export function animRot() {
  for (let z = 1; z <= 6; z++) {
    const el = document.getElementById(`c${z}`);
    if (el) {
      el.classList.add('rotating');
      setTimeout(() => el.classList.remove('rotating'), 560);
    }
  }
}

/* ── COURT BUILDING ── */
export function zP(z) {
  const rH = CH / 4, cW = CW / 3;
  const L = { 1: { c: 2, r: 1 }, 2: { c: 2, r: 0 }, 3: { c: 1, r: 0 }, 4: { c: 0, r: 0 }, 5: { c: 0, r: 1 }, 6: { c: 1, r: 1 } };
  const { c, r } = L[z];
  let x, y;
  if (G.side === 'left') {
    y = r === 0 ? NET - rH / 2 : NET - rH - rH / 2;
    x = c * cW + cW / 2;
  } else {
    y = r === 0 ? NET + rH / 2 : NET + rH + rH / 2;
    x = (2 - c) * cW + cW / 2;
  }
  return { x, y };
}

export function buildCourt() {
  const wrap = document.getElementById('cw');
  if (!wrap) return;
  const csw = document.createElement('div');
  csw.id = 'csw';
  csw.style.cssText = `position:relative;width:${CW}px;height:${CH}px`;
  const cL = CW / 3;
  const oSY = G.side === 'left' ? 0 : NET, oEY = G.side === 'left' ? NET : CH;
  const tY = G.side === 'left' ? NET - THRE : NET + THRE;
  const oppTopY = G.side === 'left' ? NET : 0, oppH = NET;
  csw.innerHTML = `<svg width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" style="border-radius:8px;display:block"><defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0d2a0d"/><stop offset="100%" stop-color="#081a08"/></linearGradient><linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#060e06"/><stop offset="100%" stop-color="#040a04"/></linearGradient></defs><rect x="0" y="${oSY}" width="${CW}" height="${NET}" fill="url(#cg1)"/><rect x="0" y="${oppTopY}" width="${CW}" height="${oppH}" fill="url(#cg2)"/><rect x="1" y="1" width="${CW-2}" height="${CH-2}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1.5" rx="7"/><rect x="0" y="${NET-2}" width="${CW}" height="4" fill="#ff6b1a" opacity=".9"/><line x1="4" y1="${tY}" x2="${CW-4}" y2="${tY}" stroke="rgba(255,255,255,.25)" stroke-width="1" stroke-dasharray="6,4"/><line x1="${cL}" y1="${oSY}" x2="${cL}" y2="${oEY}" stroke="rgba(255,255,255,.08)" stroke-width="1"/><line x1="${cL*2}" y1="${oSY}" x2="${cL*2}" y2="${oEY}" stroke="rgba(255,255,255,.08)" stroke-width="1"/><text x="${CW/2}" y="${G.side==='left'?NET+NET/2:NET/2}" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,.06)" font-size="10" font-family="Barlow Condensed" font-weight="700" letter-spacing="3">AVVERSARIO</text></svg>`;
  for (let z = 1; z <= 6; z++) {
    const { x, y } = zP(z);
    const d = document.createElement('div');
    d.className = 'cp' + (G.sz === z ? ' setter' : '');
    if (G.pl[z-1] === G.libero) d.classList.add('libero');
    d.id = `c${z}`;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.dataset.z = z;
    d.textContent = G.pl[z - 1];
    d.addEventListener('click', () => window.cClick(z));
    d.addEventListener('touchend', (e) => { e.preventDefault(); window.cClick(z); });
    csw.appendChild(d);
  }
  wrap.innerHTML = '';
  wrap.appendChild(csw);
}
