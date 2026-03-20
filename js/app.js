import { G, resetState } from './state.js';
import { buildCourt, doRot, animRot } from './court.js';
import { saveMatch, loadMatches, loadMatch, deleteMatch } from './storage.js';
import { updStats } from './stats.js';

/* ── GLOBALS ON WINDOW ── */
window.G = G;
window.startMatch = startMatch;
window.chooseSide = chooseSide;
window.setSide = setSide;
window.goTab = goTab;
window.cClick = cClick;
window.selT = selT;
window.selP = selP;
window.selSk = selSk;
window.selR = selR;
window.confirmA = confirmA;
window.undoLast = undoLast;
window.expCSV = expCSV;
window.doReset = doReset;
window.closeBanner = closeBanner;
window.delA = delA;
window.setSS = setSS;
window.setTV = setTV;
window.setTS = setTS;
window.invHM = invHM;
window.ptUs = ptUs;
window.ptThem = ptThem;
window.openSubs = openSubs;
window.selSubOut = selSubOut;
window.selSubIn = selSubIn;
window.confirmSub = confirmSub;
window.toggleLibero = toggleLibero;
window.selLibPos = selLibPos;
window.confirmLibero = confirmLibero;

let sSubOut = null, sSubIn = null;
function openSubs() {
  sSubOut = null; sSubIn = null;
  document.getElementById('sub-ov').style.display = 'flex';
  updSubGrids();
}
function updSubGrids() {
  const og = document.getElementById('sub-out-grid');
  og.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    const b = document.createElement('div');
    b.className = 'pbtn' + (sSubOut === i ? ' sel' : '');
    b.textContent = `Z${i} (#${G.pl[i - 1]})`;
    b.onclick = () => selSubOut(i);
    og.appendChild(b);
  }
  const ig = document.getElementById('sub-in-grid');
  ig.innerHTML = '';
  const bench = G.roster.filter(r => !G.pl.includes(r.number) && r.role !== 'Libero');
  bench.forEach(r => {
    const b = document.createElement('div');
    b.className = 'pbtn' + (sSubIn === r.number ? ' sel' : '');
    b.textContent = `#${r.number}`;
    b.onclick = () => selSubIn(r.number);
    ig.appendChild(b);
  });
}
function selSubOut(z) { sSubOut = z; updSubGrids(); }
function selSubIn(num) { sSubIn = num; updSubGrids(); }
function confirmSub() {
  if (sSubOut === null || sSubIn === null) return;
  snap(null);
  G.pl[sSubOut - 1] = sSubIn;
  document.getElementById('sub-ov').style.display = 'none';
  buildCourt(); updAll(); saveMatch();
}

let sLibPos = null, libIn = false;
function toggleLibero() {
  // Check if libero is already in court
  const curLib = G.pl.indexOf(G.libero);
  if (curLib >= 0) {
    // Libero is in, let's take him out
    if (confirm(`Il libero #${G.libero} è in Zona ${curLib+1}. Vuoi farlo uscire?`)) {
      // Find who he replaced? We don't track history of replacements well,
      // so we ask for the number of the player re-entering.
      const num = prompt("Numero del giocatore che rientra:");
      if (num) {
        snap(null);
        G.pl[curLib] = num;
        buildCourt(); updAll(); saveMatch();
      }
    }
  } else {
    sLibPos = null;
    document.getElementById('lib-ov').style.display = 'flex';
    updLibGrid();
  }
}
function updLibGrid() {
  const g = document.getElementById('lib-pos-grid');
  g.innerHTML = '';
  [1, 6, 5].forEach(z => {
    const b = document.createElement('div');
    b.className = 'pbtn' + (sLibPos === z ? ' sel' : '');
    b.textContent = `Z${z} (#${G.pl[z - 1]})`;
    b.onclick = () => selLibPos(z);
    g.appendChild(b);
  });
}
function selLibPos(z) { sLibPos = z; updLibGrid(); }
function confirmLibero() {
  if (sLibPos === null) return;
  snap(null);
  G.pl[sLibPos - 1] = G.libero;
  document.getElementById('lib-ov').style.display = 'none';
  buildCourt(); updAll(); saveMatch();
}

/* ── INIT ── */
window.onload = () => {
  const g = document.getElementById('psg');
  if (g) {
    const roles = ['Palleggiatore', 'Schiacciatore 1', 'Schiacciatore 2', 'Centrale 1', 'Centrale 2', 'Opposto', 'Libero', 'Panchina 1', 'Panchina 2', 'Panchina 3', 'Panchina 4', 'Panchina 5', 'Panchina 6', 'Panchina 7'];
    for (let i = 0; i < 14; i++) {
      const d = document.createElement('div');
      d.className = 'psi';
      d.innerHTML = `<label style="width:70px">${roles[i]}</label><input id="r${i}" value="${i+1}" maxlength="3">`;
      g.appendChild(d);
    }
  }
  showMatchList();
};

function showMatchList() {
  const list = loadMatches();
  const ov = document.getElementById('match-list-ov');
  if (!ov) return;
  ov.style.display = 'flex';
  const container = document.getElementById('match-items');
  if (!container) return;
  container.innerHTML = list.length ? '' : '<div class="empty">Nessuna partita salvata</div>';
  list.forEach(m => {
    const d = document.createElement('div');
    d.className = 'match-item';
    d.style.cssText = 'background:var(--navy3);padding:10px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--b1)';
    d.innerHTML = `
      <div>
        <div style="font-family:var(--fc);font-weight:800;font-size:14px">${m.name || 'Senza nome'}</div>
        <div style="font-size:10px;color:var(--t3)">${m.date} - ${m.un} vs ${m.tn}</div>
      </div>
      <div style="display:flex;gap:5px">
        <button class="hbtn" onclick="resumeMatch(${m.mid})">Apri</button>
        <button class="hbtn danger" onclick="removeMatch(${m.mid})">✕</button>
      </div>
    `;
    container.appendChild(d);
  });
}

window.newMatch = () => {
  document.getElementById('match-list-ov').style.display = 'none';
  document.getElementById('sm').style.display = 'flex';
};

window.resumeMatch = (mid) => {
  if (loadMatch(mid)) {
    document.getElementById('match-list-ov').style.display = 'none';
    document.getElementById('sm').style.display = 'none';
    updAll();
    buildCourt();
  }
};

window.removeMatch = (mid) => {
  if (confirm('Eliminare questa partita?')) {
    deleteMatch(mid);
    showMatchList();
  }
};

function startMatch() {
  resetState();
  G.mName = document.getElementById('mName').value.trim() || 'Partita ' + new Date().toLocaleDateString();
  G.un = document.getElementById('su').value.trim() || 'CASA';
  G.tn = document.getElementById('st').value.trim() || 'OSPITI';

  const roles = ['P', 'S1', 'S2', 'C1', 'C2', 'O', 'L', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
  G.roster = [];
  for (let i = 0; i < 14; i++) {
    const num = document.getElementById(`r${i}`).value.trim() || String(i + 1);
    G.roster.push({ number: num, role: roles[i] });
  }

  // Starting 6
  G.pl = G.roster.slice(0, 6).map(r => r.number);
  G.libero = G.roster[6].number;

  G.s0 = parseInt(document.getElementById('sz').value);
  G.sz = G.s0;

  document.getElementById('hun').textContent = G.un;
  document.getElementById('htn').textContent = G.tn;
  document.getElementById('sm').style.display = 'none';
  saveMatch();
  showSide(1);
}

function showSide(n) {
  document.getElementById('sideT').innerHTML = `🏟 <span>${n === 5 ? '5° Set — Lato' : 'Lato campo Set ' + n}</span>`;
  document.getElementById('sideS').textContent = n === 5 ? '5° Set — scegli da che parte inizia la tua squadra' : 'Da che parte inizia la tua squadra?';
  document.getElementById('sideM').style.display = 'flex';
}

function chooseSide(s) {
  G.side = s; G.hmI = false; G.f5 = false;
  document.getElementById('sideM').style.display = 'none';
  updSide(); buildCourt(); updAll();
  saveMatch();
}

function setSide(s) { G.side = s; updSide(); buildCourt(); }
function updSide() {
  document.getElementById('sl').classList.toggle('active', G.side === 'left');
  document.getElementById('sr').classList.toggle('active', G.side === 'right');
}

function goTab(n) {
  G.tab = n;
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === n));
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === n));
  if (n === 2) buildCourt();
  if (n === 3) updStats();
}

function cClick(z) {
  G.sT = 'us'; G.sP = z;
  document.getElementById('tu').classList.add('au');
  document.getElementById('tt').classList.remove('at');
  updPBtns(); updSBtns(); updCHL(); goTab(0);
}

function updCHL() {
  for (let z = 1; z <= 6; z++) {
    const el = document.getElementById(`c${z}`);
    if (!el) continue;
    el.className = 'cp' + (G.sz === z ? ' setter' : '');
    if (G.sT === 'us' && G.sP === z) el.classList.add('sel');
  }
}

function updInpState() {
  const parts = [];
  if (G.sT) parts.push(G.sT === 'us' ? 'NOI' : 'OPP');
  if (G.sP !== null) parts.push(G.sT === 'us' ? `#${G.pl[G.sP - 1]}` : `${G.sP}`);
  if (G.sSk) parts.push(G.sSk.toUpperCase().substring(0, 3));
  if (G.sR) parts.push(G.sR);
  document.getElementById('inp-state').textContent = parts.join(' → ') || '—';
}

function selT(t) {
  G.sT = t; G.sP = null; G.sSk = null; G.sR = null;
  document.getElementById('tu').classList.toggle('au', t === 'us');
  document.getElementById('tt').classList.toggle('at', t === 'them');
  updPBtns(); updSBtns(); updRBtns(); updCBtn(); updCHL(); updInpState();
}

function updPBtns() {
  const g = document.getElementById('pg'); g.innerHTML = ''; if (!G.sT) return;
  for (let i = 1; i <= 6; i++) {
    const b = document.createElement('div');
    b.className = 'pbtn' + (G.sP === i ? ' sel' : '');
    b.textContent = G.sT === 'us' ? G.pl[i - 1] : i;
    b.onclick = () => selP(i);
    g.appendChild(b);
  }
}

function selP(p) { G.sP = p; G.sSk = null; G.sR = null; updPBtns(); updSBtns(); updRBtns(); updCBtn(); updCHL(); updInpState(); }

function updSBtns() {
  document.querySelectorAll('.sbtn').forEach(b => {
    const sk = b.dataset.sk; b.classList.remove('sel', 'dis');
    if (G.sSk === sk) b.classList.add('sel');
    if (!G.sP) { b.classList.add('dis'); return; }
    if (G.sT === 'us') {
      if (sk === 'Battuta' && G.sP !== 1) b.classList.add('dis');
      if (sk === 'Muro' && ![2, 3, 4].includes(G.sP)) b.classList.add('dis');
    }
  });
}

function selSk(sk) {
  if (!G.sP) return;
  if (G.sT === 'us') {
    if (sk === 'Battuta' && G.sP !== 1) return;
    if (sk === 'Muro' && ![2, 3, 4].includes(G.sP)) return;
  }
  G.sSk = sk; G.sR = null; updSBtns(); updRBtns(); updCBtn(); updInpState();
}

function updRBtns() {
  document.querySelectorAll('.rbtn').forEach(b => {
    b.classList.remove('sel');
    if (G.sR === b.dataset.r) b.classList.add('sel');
    b.classList.toggle('dis', !G.sSk);
  });
}

function selR(r) { if (!G.sSk) return; G.sR = r; updRBtns(); updCBtn(); updInpState(); }
function updCBtn() { document.getElementById('cfb').disabled = !(G.sT && G.sP && G.sSk && G.sR); }

function confirmA() {
  if (!G.sT || !G.sP || !G.sSk || !G.sR) return;
  const a = { id: Date.now(), mid: G.mid, set: G.cs, scu: G.scu, sct: G.sct, rot: G.sz, team: G.sT, player: G.sT === 'us' ? G.pl[G.sP - 1] : String(G.sP), pZ: G.sP, skill: G.sSk, rating: G.sR };
  snap(a); G.acts.push(a);
  const r = G.sR, sk = G.sSk, t = G.sT;
  if (r === '++' && ['Attacco', 'Battuta', 'Muro'].includes(sk)) { if (t === 'us') ptUs(); else ptThem(); }
  else if (r === '=') { if (t === 'us') ptThem(); else ptUs(); }

  if (r === '++' && ['Attacco', 'Battuta'].includes(sk)) {
    G.pTraj = a; G.pPhase = 'from'; G.pFrom = null;
    const tp = document.getElementById('tp'); tp.style.display = 'block'; tp.textContent = '📍 CLICCA: punto di partenza';
  }

  if (G.cs === 5 && !G.f5 && Math.max(G.scu, G.sct) >= 8) {
    G.f5 = true; G.side = G.side === 'left' ? 'right' : 'left';
    updSide(); animRot(); setTimeout(() => { buildCourt(); updAll(); }, 600);
  }

  G.sP = null; G.sSk = null; G.sR = null;
  updPBtns(); updSBtns(); updRBtns(); updCBtn(); updCHL(); updInpState(); updAll();
  saveMatch();
}

function ptUs() { if (G.srv !== 'us') { doRot(); G.srv = 'us'; } G.scu++; chkEnd(); updHdr(); saveMatch(); }
function ptThem() { if (G.srv !== 'them') G.srv = 'them'; G.sct++; chkEnd(); updHdr(); saveMatch(); }

function chkEnd() {
  const u = G.scu, t = G.sct, tgt = G.cs === 5 ? 15 : 25;
  if (Math.max(u, t) >= tgt && Math.abs(u - t) >= 2) {
    const uw = u > t; if (uw) G.su++; else G.st++;
    G.ssc.push({ u, t, w: uw ? 'us' : 'them' });
    showBanner(u, t);
  }
}

function showBanner(u, t) {
  const uw = u > t;
  document.getElementById('bi').textContent = uw ? '🏆' : '😤';
  document.getElementById('bt').textContent = uw ? 'SET VINTO!' : 'SET PERSO';
  document.getElementById('bt').style.color = uw ? 'var(--grn)' : 'var(--red)';
  document.getElementById('bsu').textContent = u; document.getElementById('bst').textContent = t;
  document.getElementById('bs').textContent = `Set: ${G.su} – ${G.st}`;
  const me = G.su >= 3 || G.st >= 3;
  if (me) {
    document.getElementById('bi').textContent = G.su >= 3 ? '🏆' : '💔';
    document.getElementById('bt').textContent = G.su >= 3 ? 'PARTITA VINTA!' : 'PARTITA PERSA';
    document.querySelector('.bb').textContent = 'FINE PARTITA';
    document.querySelector('.bb').onclick = () => document.getElementById('banner').classList.remove('show');
  }
  document.getElementById('banner').classList.add('show');
}

function closeBanner() {
  document.getElementById('banner').classList.remove('show');
  if (G.su >= 3 || G.st >= 3) return;
  const nx = G.cs + 1; if (nx > 5) return;
  G.cs = nx; G.scu = 0; G.sct = 0; G.sz = G.s0; G.srv = 'us';
  if (nx < 5) { G.side = G.side === 'left' ? 'right' : 'left'; updSide(); buildCourt(); updAll(); }
  else showSide(5);
  saveMatch();
}

function snap(a) { G.hist.push({ a: a ? JSON.parse(JSON.stringify(a)) : null, scu: G.scu, sct: G.sct, srv: G.srv, sz: G.sz, pl: [...G.pl], su: G.su, st: G.st, cs: G.cs }); }
function undoLast() {
  if (!G.hist.length) return;
  const s = G.hist.pop();
  if (s.a) { const i = G.acts.findIndex(x => x.id === s.a.id); if (i >= 0) G.acts.splice(i, 1); }
  Object.assign(G, { scu: s.scu, sct: s.sct, srv: s.srv, sz: s.sz, pl: [...s.pl], su: s.su, st: s.st, cs: s.cs });
  buildCourt(); updAll(); saveMatch();
}

function updHdr() {
  document.getElementById('scu').textContent = G.scu;
  document.getElementById('sct').textContent = G.sct;
  document.getElementById('scu').style.color = G.srv === 'us' ? 'var(--org)' : 'var(--t1)';
  document.getElementById('sct').style.color = G.srv === 'them' ? 'var(--sky)' : 'var(--t1)';
  document.getElementById('hset').textContent = `S${G.cs}`;
  document.getElementById('pp').textContent = G.sz;
  document.getElementById('sd').innerHTML = `<span class="serv-dot"></span>${G.srv === 'us' ? G.un : G.tn}`;
  const d = document.getElementById('pips'); d.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const p = document.createElement('div'); p.className = 'pip';
    if (i < G.cs) { const sc = G.ssc[i - 1]; if (sc) { p.classList.add(sc.w === 'us' ? 'wu' : 'wt'); p.textContent = sc.w === 'us' ? 'W' : 'L'; } }
    else if (i === G.cs) { p.classList.add('cu'); p.textContent = G.cs; }
    else p.textContent = i;
    d.appendChild(p);
  }
}

function updAll() { updHdr(); updPBP(); drawTraj(); updStats(); }

function updPBP() {
  const l = document.getElementById('pbpl'); const rev = [...G.acts].reverse().slice(0, 35);
  document.getElementById('pcnt').textContent = `${G.acts.length} azioni`;
  if (!rev.length) { l.innerHTML = '<div class="empty">Nessuna azione registrata</div>'; return; }
  const rc = { '++': 'rpp', '+': 'rp', '!': 're', '-': 'rm', '=': 'req' };
  l.innerHTML = rev.map(a => `<div class="pi ${rc[a.rating] || ''} ${a.team === 'them' ? 'tt' : ''}"><span class="pi-s">S${a.set}</span><span class="pi-sc">${a.scu}-${a.sct}</span><span class="pi-pl">${a.team === 'us' ? '#' + a.player : 'OPP' + a.player}</span><span class="pi-sk">${a.skill}</span><span class="pi-rt">${a.rating}</span><span class="pi-dl" onclick="delA(${a.id})">✕</span></div>`).join('');
}

function delA(id) {
  const i = G.acts.findIndex(a => a.id === id);
  if (i >= 0) G.acts.splice(i, 1);
  updPBP(); updStats(); saveMatch();
}

function setSS(s) { G.sc = s; document.getElementById('ss-s').classList.toggle('active', s === 'set'); document.getElementById('ss-a').classList.toggle('active', s === 'all'); updStats(); }

const TC = document.getElementById('tc'); const TW = 340, TH = 100;
function setTV(v) { G.tv = v; document.getElementById('tt-t').classList.toggle('active', v === 't'); document.getElementById('tt-h').classList.toggle('active', v === 'h'); document.getElementById('inv').style.display = v === 'h' ? 'inline-block' : 'none'; drawTraj(); }
function setTS(s) { G.ts = s; document.getElementById('ts-s').classList.toggle('active', s === 'set'); document.getElementById('ts-a').classList.toggle('active', s === 'all'); drawTraj(); }
function invHM() { G.hmI = !G.hmI; drawTraj(); }
function fTrajs() { return G.ts === 'set' ? G.trajs.filter(t => t.set === G.cs) : G.trajs; }

if (TC) {
  TC.addEventListener('click', onTC);
  TC.addEventListener('touchend', (e) => { e.preventDefault(); const r = TC.getBoundingClientRect(), t = e.changedTouches[0]; handleTP((t.clientX - r.left) * (TW / r.width), (t.clientY - r.top) * (TH / r.height)); });
}

function onTC(e) { const r = TC.getBoundingClientRect(); handleTP((e.clientX - r.left) * (TW / r.width), (e.clientY - r.top) * (TH / r.height)); }
function handleTP(x, y) {
  if (!G.pTraj) return;
  const tp = document.getElementById('tp');
  if (G.pPhase === 'from') {
    G.pFrom = { x, y }; G.pPhase = 'to'; tp.textContent = '📍 CLICCA: punto di arrivo'; drawTraj();
    const ctx = TC.getContext('2d'); ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(56,194,245,.9)'; ctx.fill();
  } else {
    G.trajs.push({ set: G.pTraj.set, id: G.pTraj.id, skill: G.pTraj.skill, rating: G.pTraj.rating, from: G.pFrom, to: { x, y } });
    G.pTraj = null; G.pPhase = null; G.pFrom = null; tp.style.display = 'none'; drawTraj(); saveMatch();
  }
}

function drawTraj() { const ctx = TC.getContext('2d'); if (!ctx) return; ctx.clearRect(0, 0, TW, TH); if (G.tv === 't') drawTrajM(ctx); else drawHeatM(ctx); }
function drawCH(ctx, W, H) {
  const grd = ctx.createLinearGradient(0, 0, W, 0); grd.addColorStop(0, '#0a1f0a'); grd.addColorStop(1, '#081508');
  ctx.fillStyle = grd; ctx.roundRect(0, 0, W, H, 8); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#ff6b1a'; ctx.fillRect(W / 2 - 1.5, 0, 3, H);
  const tm = W / 2 * (3 / 9); const lx = G.side === 'left' ? W / 2 - tm : W / 2 + tm;
  ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx, 2); ctx.lineTo(lx, H - 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1, H / 3); ctx.lineTo(W - 1, H / 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1, H * 2 / 3); ctx.lineTo(W - 1, H * 2 / 3); ctx.stroke();
}
function drawTrajM(ctx) { drawCH(ctx, TW, TH); fTrajs().forEach(t => { const col = t.skill === 'Attacco' ? 'rgba(31,219,122,.9)' : 'rgba(56,194,245,.9)'; drawArrow(ctx, t.from.x, t.from.y, t.to.x, t.to.y, col); }); }
function drawArrow(ctx, x1, y1, x2, y2, col) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - .4), y2 - s * Math.sin(a - .4)); ctx.lineTo(x2 - s * Math.cos(a + .4), y2 - s * Math.sin(a + .4)); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(x1, y1, 3.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(x2, y2, 3.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
}
function drawHeatM(ctx) {
  const W = TW, H = TH; const grd = ctx.createLinearGradient(0, 0, W, 0); grd.addColorStop(0, '#0a1f0a'); grd.addColorStop(1, '#081508');
  ctx.fillStyle = grd; ctx.roundRect(0, 0, W, H, 8); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.stroke();
  const bOR = G.side === 'left'; const sR = G.hmI ? !bOR : bOR; const oL = sR ? W / 2 : 0; const oR = sR ? W : W / 2;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(oL, 0, oR - oL, H); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.strokeRect(oL + .5, .5, oR - oL - 1, H - 1);
  ctx.fillStyle = '#ff6b1a'; ctx.fillRect(W / 2 - 1.5, 0, 3, H);
  const tm = W / 2 * (3 / 9); const tmX = sR ? W / 2 + tm : W / 2 - tm;
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(tmX, 2); ctx.lineTo(tmX, H - 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(oL, H / 3); ctx.lineTo(oR, H / 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(oL, H * 2 / 3); ctx.lineTo(oR, H * 2 / 3); ctx.stroke();
  ctx.font = '7px Barlow Condensed'; ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.textAlign = 'center'; ctx.fillText('ZONA AVVERSARIA', (oL + oR) / 2, H / 2 + 3);
  const trajs = fTrajs(); if (!trajs.length) return;
  const hW = W / 2; const gW = 6, gH = 3; const cW = hW / gW, cH = H / gH; const grid = Array.from({ length: gH }, () => new Array(gW).fill(0));
  trajs.forEach(t => {
    let rx = t.to.x, ry = t.to.y; let rel = sR ? (rx - W / 2) : (W / 2 - rx); if (rel < 0) rel = -rel; rx = sR ? W / 2 + rel : W / 2 - rel;
    if (rx < oL || rx > oR) return;
    const gx = Math.min(Math.floor((rx - oL) / cW), gW - 1); const gy = Math.min(Math.floor(ry / cH), gH - 1);
    if (gx >= 0 && gx < gW && gy >= 0 && gy < gH) grid[gy][gx]++;
  });
  const mx = Math.max(...grid.flat(), 1);
  for (let gy = 0; gy < gH; gy++) for (let gx = 0; gx < gW; gx++) {
    const v = grid[gy][gx]; if (!v) continue;
    const I = v / mx; const cx = oL + (gx + .5) * cW, cy = (gy + .5) * cH;
    let rv, gv, bv; if (I < .5) { rv = Math.round(I * 2 * 255); gv = 255; bv = 0; } else { rv = 255; gv = Math.round((1 - (I - .5) * 2) * 255); bv = 0; }
    const rad = 8 + I * 16; const grd2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grd2.addColorStop(0, `rgba(${rv},${gv},${bv},${.5 + I * .45})`); grd2.addColorStop(1, `rgba(${rv},${gv},${bv},0)`);
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fillStyle = grd2; ctx.fill();
    ctx.font = `bold ${8 + I * 3}px Barlow Condensed`; ctx.fillStyle = `rgba(255,255,255,${.7 + I * .3})`; ctx.textAlign = 'center'; ctx.fillText(v, cx, cy + 3);
  }
}

function expCSV() {
  const h = 'ID,Set,ScoreUs,ScoreThem,Rot,Team,Player,Skill,Rating';
  const rows = G.acts.map(a => [a.id, a.set, a.scu, a.sct, a.rot, a.team, a.player, a.skill, a.rating].join(','));
  const csv = [h, ...rows].join('\n'); const b = new Blob([csv], { type: 'text/csv' });
  const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `volleyscout_${G.mid}.csv`; a.click(); URL.revokeObjectURL(u);
}

function doReset() { if (confirm('Resettare tutta la partita?')) { resetState(); location.reload(); } }
