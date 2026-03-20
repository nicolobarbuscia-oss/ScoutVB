import { G } from './state.js';

export function updStats() {
  const acts = fActs(), ua = acts.filter(a => a.team === 'us');
  const atk = ua.filter(a => a.skill === 'Attacco'), srv = ua.filter(a => a.skill === 'Battuta');
  const rec = ua.filter(a => a.skill === 'Ricezione'), def = ua.filter(a => a.skill === 'Difesa');
  const gif = acts.filter(a => a.gift || (a.team === 'us' && a.rating === '=')).length;
  const ap = pp(atk, ['++','+']), sp = pp(srv, ['++','+']), rp = pp(rec, ['++','+']), dp = pp(def, ['++','+']);

  let h = `<div class="ebox"><div><div class="elbl">⚠️ Punti regalati</div><div style="font-family:var(--fb);font-size:10px;color:var(--t3);margin-top:2px">errori diretti concessi</div></div><div class="en">${gif}</div></div><div class="dr"><div class="dc"><div class="dl">ATTACCO</div><div class="dw"><canvas id="da" width="54" height="54"></canvas><div class="dp">${ap}%</div></div></div><div class="dc"><div class="dl">BATTUTA</div><div class="dw"><canvas id="ds" width="54" height="54"></canvas><div class="dp">${sp}%</div></div></div></div><div class="dr"><div class="dc"><div class="dl">RICEZIONE</div><div class="dw"><canvas id="dr" width="54" height="54"></canvas><div class="dp">${rp}%</div></div></div><div class="dc"><div class="dl">DIFESA</div><div class="dw"><canvas id="dd" width="54" height="54"></canvas><div class="dp">${dp}%</div></div></div></div><div class="slbl">📈 EFFICIENZA DETTAGLIO</div>${[{l:'Attacco perfetto (++)',v:atk.length?Math.round(atk.filter(a=>a.rating==='++').length/atk.length*100):0,c:'#1fdb7a'},{l:'Ricezione perfetta (++)',v:rec.length?Math.round(rec.filter(a=>a.rating==='++').length/rec.length*100):0,c:'#38c2f5'},{l:'Ricezione positiva (+)',v:pp(rec,['++','+']),c:'#7de87d'},{l:'Ace battuta (++)',v:srv.length?Math.round(srv.filter(a=>a.rating==='++').length/srv.length*100):0,c:'#f5c518'},{l:'Difesa positiva',v:pp(def,['++','+']),c:'#ff8c47'}].map(({l,v,c})=>`<div class="ms"><span class="msl">${l}</span><div class="msb"><div class="msf" style="width:${v}%;background:${c}"></div></div><span class="msv">${v}%</span></div>`).join('')}<div class="slbl">🔄 REPORT ROTAZIONI</div>${[1,2,3,4,5,6].map(p=>{const ra=acts.filter(a=>a.rot===p);const w=ra.filter(a=>a.rating==='++'&&['Attacco','Battuta','Muro'].includes(a.skill)&&a.team==='us').length;const l=ra.filter(a=>a.rating==='=').length;const tot=w+l;const pct=tot?Math.round(w/tot*100):0;const col=pct>=60?'var(--grn)':pct>=40?'var(--ylw)':'var(--red)';return `<div class="ri"><span class="rpos">P${p}</span><div class="rbrs"><div class="rwb" style="width:${tot?w/tot*100:0}%"></div><div class="rlb" style="width:${tot?l/tot*100:0}%"></div></div><span class="rpct" style="color:${col}">${pct}%</span></div>`;}).join('')}<div class="slbl">👥 STATISTICHE GIOCATORI</div>${G.roster.map((playerObj,idx)=>{const pl = playerObj.number; const pa=ua.filter(a=>a.player===pl);if(!pa.length)return '';return `<div class="plr"><div class="pln">#${pl} <span style="color:var(--t3);font-size:10px;font-weight:400">${playerObj.role || ''}</span></div><div class="chips">${['Battuta','Ricezione','Attacco','Muro','Difesa','Alzata'].map(sk=>{const sa=pa.filter(a=>a.skill===sk);const pos=sa.filter(a=>['++','+'].includes(a.rating)).length;return `<span class="chip ${sa.length?'has':''}">${sk.substring(0,3).toUpperCase()}${sa.length?` ${pos}/${sa.length}`:''}</span>`;}).join('')}</div></div>`;}).join('')}`;
  const sb = document.getElementById('sb');
  if (sb) sb.innerHTML = h;
  requestAnimationFrame(()=>{dnut('da',ap,atk.length,'#1fdb7a');dnut('ds',sp,srv.length,'#f5c518');dnut('dr',rp,rec.length,'#38c2f5');dnut('dd',dp,def.length,'#ff8c47');});
}

function fActs() { return G.sc === 'set' ? G.acts.filter(a => a.set === G.cs) : G.acts; }
function pp(a, pos) { return a.length ? Math.round(a.filter(x => pos.includes(x.rating)).length / a.length * 100) : 0; }

function dnut(id, pct, tot, col) {
  const c = document.getElementById(id); if (!c) return;
  const ctx = c.getContext('2d'); const cx = 27, cy = 27, r = 21;
  ctx.clearRect(0, 0, 54, 54); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 5; ctx.stroke();
  if (!tot) return;
  const a = (pct / 100) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + a); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
}
