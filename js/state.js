/* ── STATE ── */
export const G = {
  mid: Date.now(),
  mName: '',
  mDate: new Date().toLocaleDateString(),
  un: 'CASA',
  tn: 'OSPITI',
  // Active players in positions 1-6
  pl: ['1', '2', '3', '4', '5', '6'],
  // Full roster: { number: string, role: string }
  roster: [],
  libero: null,
  sz: 1,
  s0: 1,
  cs: 1,
  su: 0,
  st: 0,
  scu: 0,
  sct: 0,
  srv: 'us',
  side: 'left',
  ssc: [],
  acts: [],
  trajs: [],
  sT: null,
  sP: null,
  sSk: null,
  sR: null,
  pTraj: null,
  pPhase: null,
  pFrom: null,
  hist: [],
  sc: 'set',
  tv: 't',
  ts: 'set',
  hmI: false,
  f5: false,
  tab: 0
};

export function resetState() {
  G.mid = Date.now();
  G.scu = 0;
  G.sct = 0;
  G.su = 0;
  G.st = 0;
  G.cs = 1;
  G.acts = [];
  G.trajs = [];
  G.hist = [];
  G.ssc = [];
}
