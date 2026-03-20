import { G } from './state.js';

export function saveMatch() {
  const matches = JSON.parse(localStorage.getItem('vspro_matches') || '[]');
  const idx = matches.findIndex(m => m.mid === G.mid);
  const matchData = {
    mid: G.mid,
    name: G.mName,
    date: G.mDate,
    un: G.un,
    tn: G.tn,
    pl: [...G.pl],
    roster: G.roster,
    libero: G.libero,
    sz: G.sz,
    s0: G.s0,
    cs: G.cs,
    su: G.su,
    st: G.st,
    scu: G.scu,
    sct: G.sct,
    srv: G.srv,
    side: G.side,
    ssc: G.ssc,
    acts: G.acts,
    trajs: G.trajs,
    f5: G.f5
  };
  if (idx >= 0) matches[idx] = matchData;
  else matches.push(matchData);
  localStorage.setItem('vspro_matches', JSON.stringify(matches));
}

export function loadMatches() {
  return JSON.parse(localStorage.getItem('vspro_matches') || '[]');
}

export function loadMatch(mid) {
  const matches = loadMatches();
  const m = matches.find(x => x.mid === mid);
  if (m) {
    Object.assign(G, m);
    return true;
  }
  return false;
}

export function deleteMatch(mid) {
  let matches = loadMatches();
  matches = matches.filter(m => m.mid !== mid);
  localStorage.setItem('vspro_matches', JSON.stringify(matches));
}
