// ---------- MAIN 2.0 · V4 · LA COLONIA VIVA (exploración, no implementación) ----------
// Candidata provisional: B, colonia abierta en terrazas. Solo Cheddar con arte piloto; la superficie y Gouda son los de V3,
// como contexto de navegación. Tres pilares: picar que se siente, ratones vivos y una muestra de arte nueva.
// Cheddar: la roca está en una corta en el suelo de la caverna; la perforadora va en un pórtico que cruza la caverna y baja su
// barra hasta la veta; a la izquierda, la refinería (horno metido en la pared y alambique) en una terraza alta; a la derecha,
// la quesería (cueva con baldas, cuba y prensa) en una terraza más baja, junto al montacargas.
// Lo simulado (golpes por veta, vaciado de la veta, falta de Raw o de Base) es una simulación de presentación, rotulada como tal:
// no toca la economía del juego.
const $c = (i) => document.getElementById(i);
const PRESETS = [
  { k: 'a', w: 375, h: 812, d: '375 × 812 · pantalla completa' },
  { k: 'b', w: 375, h: 635, d: '375 × 635 · iPhone en Safari, con barras (aprox.)' },
  { k: 'c', w: 360, h: 640, d: '360 × 640 · Android en Chrome, con barras (aprox.)' },
  { k: 'd', w: 320, h: 568, d: '320 × 568 · iPhone SE (1.ª gen.)' },
  { k: 'e', w: 320, h: 460, d: '320 × 460 · iPhone SE en Safari (aprox.)' },
];
let PRE = PRESETS[1], OPT = 'B', ALT = 'A', BIG = false, DPRS = 3, TUT = true, SOUND = true, SHOWHITS = false, SHOWPATHS = false, NOSEL = false;
const CW = 144;
const IMC = {};
const im = (src) => (IMC[src] ||= Object.assign(new Image(), { src }));
const SPR = { rockcheddar: 'out/sprites/big_cheddar_c0.png', rockgouda: 'out/sprites/big_gouda_c0.png', shop: 'out/anims/pshop_0.png', house: 'out/anims/phouse.png', lab: 'out/anims/plab.png', swingM: 'out/anims/swing_miner.png', crate: 'out/sprites/crate_raw.png' };
const ROCKC = [0, 1, 2, 3, 4].map((i) => `out/sprites/big_cheddar_c${i}.png`), ROCKV = [1, 2, 3, 4, 5].map((i) => `out/sprites/big_cheddar_v${i}.png`);
[...Object.values(SPR), ...ROCKC, ...ROCKV, 'out/sprites/ic_pick.png'].forEach(im);
['raw', 'base', 'lot'].forEach((k) => ['cheddar', 'gouda', 'brie'].forEach((z) => im(`out/sprites/ic_${k}_${z}.png`)));
const CREW = {
  cheddar: { miner: { name: 'Colby', lv: 53, rank: 2, rar: 0, skill: 'mining' }, driller: { name: 'Paneer', lv: 49, rank: 1, rar: 0, skill: 'drilling' }, refiner: { name: 'Monty', lv: 52, rank: 2, rar: 0, skill: 'refining' }, cook: { name: 'Tilly', lv: 52, rank: 3, rar: 0, skill: 'cheesemaking' } },
  gouda: { miner: { name: 'Curd', lv: 47, rank: 1, rar: 0, skill: 'mining' }, driller: { name: 'Roque', lv: 49, rank: 3, rar: 0, skill: 'drilling' }, refiner: { name: 'Feta', lv: 49, rank: 1, rar: 1, skill: 'refining' }, cook: { name: 'Pepper', lv: 49, rank: 3, rar: 2, skill: 'cheesemaking' } },
  town: { keeper: { name: 'Swiss', lv: 52, rank: 3, rar: 1, skill: 'trading' }, sci: { name: 'Gus', lv: 52, rank: 2, rar: 0, skill: 'research' }, idle: { name: 'Poppy', lv: 49, rank: 1, rar: 0, skill: 'mining' } },
};
const MC = {};
const mF = (m, dy, blink, o = {}) => { const k = m.name + dy + (blink ? 'b' : '') + JSON.stringify(o); return (MC[k] ||= mouseCanvas(m, dy, blink, o)); };
const TH = {
  cheddar: { wall: '#7a5534', wallD: '#5a3c24', wallL: '#93693f', strata: '#86603a', speck: '#4a3020', back: '#3a2a1c', backD: '#2c1f14', backL: '#4a3624', beam: '#a06a38', beamL: '#c08a50', beamD: '#6a4220', lamp: '#ffd27a', floor: '#6a4a2a', floorL: '#8a6438', floorD: '#3e2a16', metal: '#c0663a', metalL: '#e08a5a', metalD: '#7a3a1c', recess: '#1e150d', plane: ['#6e4e2c', '#7c5a34', '#8a663c'], seam: '#4a321c', lip: '#a07a48', far: '#241a12', farD: '#1a120c', light: '#ffe0a0', layers: ['#8a6a44', '#7a5a38', '#6c4e30', '#5e4228', '#503820', '#432e1a'], crystal: '#ffcf5a', name: 'CHEDDAR' },
  gouda: { wall: '#5a626c', wallD: '#40464e', wallL: '#77818c', strata: '#666e78', speck: '#2e3238', back: '#2a3036', backD: '#1e2328', backL: '#343b42', beam: '#b08a3a', beamL: '#d0aa5a', beamD: '#6a5220', lamp: '#8ff3d0', floor: '#4e565e', floorL: '#6a747e', floorD: '#2a3036', metal: '#c8a040', metalL: '#f0d070', metalD: '#7a5a18', recess: '#14181c', plane: ['#565e68', '#626c76', '#6e7882'], seam: '#353b42', lip: '#8a949e', far: '#161a1f', farD: '#101317', light: '#bff0ff', layers: ['#727a84', '#666e77', '#5a626b', '#4f565e', '#444a51', '#3a3f45'], crystal: '#7ff0d0', masonry: true, wax: '#c0392b', name: 'GOUDA' },
};
const hash = (n) => { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
const jag = (x, seed, amp) => Math.floor(hash(Math.floor(x / 3) * 7919 + seed * 104729) * (amp + 1));
const DEP = { cheddar: 81, gouda: 23 };
const TIERS = [10, 25, 45, 70, 100];
const tierOf = (d) => TIERS.filter((x) => d >= x).length;

// ---- Paradas y geometría ----
const HGT = { A: { town: 126, district: 166 }, B: { town: 126, district: 150 } };
let STOPS = [];
function buildStops() {
  let y = 0;
  STOPS = [{ id: 'town', kind: 'town', h: 126 }, { id: 'cheddar', kind: 'pilot', z: 'cheddar', h: 160 }, { id: 'gouda', kind: 'district', z: 'gouda', h: 150 }, { id: 'brie', kind: 'locked', h: 60 }];
  for (const s of STOPS) { s.top = y; y += s.h; }
}
function geoT(st) {
  const t = st.top, o = SC.ox, GR = t + 78;
  return { t, o, GR, vis: [t + 20, t + st.h], zones: { up: [t + 20, GR + 10], down: [GR - 12, t + st.h] },
    st: { house: [[o + 19, GR - 55, 38, 46]], lab: [[o + 61, GR - 39, 34, 41]], shop: [[o + 92, GR - 31, 38, 35]], storage: [[o + 12, GR + 14, 84, 24], [o + 42, GR - 9, 13, 10]] },
    who: { idle: [o + 34, GR - 9, 'house'], sci: [o + 66, GR + 5, 'lab'], keeper: [o + 104, GR + 7, 'shop'] },
    floors: [], links: [], legs: [] };
}
function geoB(st) {
  const t = st.top, o = SC.ox, n = tierOf(DEP[st.z]), dp = n * 4;
  const TL = t + 46, TR = t + 58, BR = t + 64, FF = t + 118, rx = o + 40, rb = FF + 4 + dp;
  return { t, o, n, dp, TL, TR, BR, FF, rx, rb, vis: [t + 6, t + st.h - 2], zones: { up: [t + 6, t + 76], down: [t + 40, t + st.h - 2] },
    st: { rock: [[rx + 4, rb - 37, 48, 39]], drill: [[o + 56, BR - 24, 40, 28]], refinery: [[o + 2, t + 12, 50, TL + 8 - t - 12]], cheesery: [[o + 92, t + 16, 42, TR + 8 - t - 16]] },
    who: { driller: [o + 60, BR, 'drill'], refiner: [o + 8, TL + 8, 'refinery'], cook: [o + 106, TR + 8, 'cheesery'] },
    floors: [], links: [], legs: [] };
}
// Cheddar piloto. Coordenadas en píxeles de arte; x desde SC.ox, y desde lo alto de la parada.
function geoC(st) {
  const t = st.top, o = SC.ox, n = tierOf(DEP.cheddar), dp = n * 4;
  const TL = t + 48, TR = t + 60, DK = t + 56, FF = t + 128, rx = o + 40, rb = FF + 4 + dp + Math.round(S.drop || 0);
  return { t, o, n, dp, TL, TR, DK, FF, rx, rb, X0: o + 26, X1: o + 108, vis: [t + 6, t + st.h - 2], zones: { up: [t + 6, t + 80], down: [t + 50, t + st.h - 2] },
    st: { rock: [[rx + 2, rb - 38, 52, 40]], drill: [[o + 50, DK - 44, 58, 56]], refinery: [[o + 0, t + 18, 48, TL + 14 - t - 18]], cheesery: [[o + 98, t + 20, 36, TR + 14 - t - 20]] },
    mine: [o + 30, rb - 56, 88, 60],
    focus: { rock: [o + 22, t + 66, 92, rb + 8 - t - 66], drill: [o + 40, t + 8, 68, 92], refinery: [o - 2, t + 10, 58, TL + 18 - t - 10], cheesery: [o + 90, t + 16, 54, TR + 18 - t - 16] },
    who: { miner: [rx + 12, rb - 36, 'rock'], driller: [o + 76, DK + 3, 'drill'], refiner: [o + 4, TL + 11, 'refinery'], cook: [o + 100, TR + 11, 'cheesery'] },
    walk: { miner: [rx + 2, rx + 16], driller: [o + 50, o + 76], refiner: [o + 0, o + 8], cook: [o + 96, o + 112] },
    floors: [{ x0: o + 0, x1: o + 46, y: TL + 11, lane: true }, { x0: o + 48, x1: o + 98, y: DK + 3, lane: true }, { x0: o + 98, x1: o + 134, y: TR + 11, lane: true }, { x0: o + 0, x1: o + 26, y: FF + 10, lane: true }, { x0: o + 108, x1: o + 134, y: FF + 10, lane: true }],
    links: [[o + 8, TL + 14, o + 8, FF + 10], [o + 111, FF + 10, o + 111, TR + 11], [o + 139, TR + 11, o + 139, FF + 10]],
    legs: [[[o + 50, rb - 36], [o + 66, rb - 36], [o + 108, FF + 10], [o + 111, FF + 10], [o + 111, TR + 11], [o + 98, TR + 11], [o + 76, DK + 3]], [[o + 76, DK + 3], [o + 48, DK + 3], [o + 14, TL + 11]], [[o + 14, TL + 11], [o + 48, TL + 11], [o + 98, DK + 3], [o + 110, TR + 11]], [[o + 110, TR + 11], [o + 136, TR + 11]]] };
}
const GEO = (st) => (st.kind === 'town' ? geoT(st) : st.kind === 'pilot' ? geoC(st) : st.kind === 'district' ? geoB(st) : { t: st.top, o: SC.ox, vis: [st.top, st.top + st.h], zones: {}, st: {}, who: {}, floors: [], links: [], legs: [] });
const UPPER = { refinery: 1, cheesery: 1 };
const STATIONS = { town: ['shop', 'lab', 'house', 'storage'], pilot: ['rock', 'drill', 'refinery', 'cheesery'], district: ['rock', 'drill', 'refinery', 'cheesery'], locked: [] };

// ---- Escala, cámara y los dos modos (exploración / estación) ----
// Exploración: la parada entera, a la escala base. Estación: la cámara se acerca a la estación elegida, a la mayor escala nítida
// que la deja entera (como mucho 3,5 px CSS por píxel de arte). El alto del panel no cambia nunca.
let SC = { d: 7, s: 7 / 3, LW: 160, ox: 8, worldW: 160 };
const cv = $c('mc-cv'), stg = $c('mc-stage');
let ctx = cv.getContext('2d');
let S = { stop: 1, focus: null, station: 'rock', dist: 'rock', camX: 0, camY: 0, k: 7 / 3, camTo: null, combo: 0, lastHit: -1e9, acts: 0, flash: {}, drop: 0 };
const comboOn = () => S.combo >= 3 && performance.now() - S.lastHit <= 650;
function layout() {
  document.documentElement.style.setProperty('--pw', PRE.w + 'px'); document.documentElement.style.setProperty('--ph', PRE.h + 'px');
  $c('mc-goal').hidden = !TUT;
  const dC = Math.max(1, Math.floor((PRE.w * DPRS) / CW)), d = BIG ? Math.max(dC + 1, Math.round(3 * DPRS)) : dC;
  const s = d / DPRS, LW = PRE.w / s, ox = Math.max(0, Math.floor((LW - CW) / 2));
  SC = { d, s, LW, ox, worldW: Math.max(LW, ox + CW) };
  buildStops();
  const dpr = devicePixelRatio || 1, W = stg.clientWidth, H = stg.clientHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  fitPhone(); const t = camTarget(S.stop); S.camX = t.x; S.camY = t.y; S.k = t.k; S.camTo = null; paintLabels(); updateDock();
}
function fitPhone() { const f = $c('fit'), k = Math.min(1, f.parentElement.clientWidth / PRE.w); $c('phone').style.transform = k < 1 ? `scale(${k})` : ''; f.style.height = PRE.h * k + 'px'; }
addEventListener('resize', fitPhone);
const viewH = () => stg.clientHeight / S.k, viewW = () => stg.clientWidth / S.k;
const NAVR = () => ($c('mc-nav').offsetHeight || 36) + 10;
function camTarget(i, key = S.focus) {
  const st = STOPS[i], g = GEO(st), W = stg.clientWidth, H = stg.clientHeight, top = NAVR(), last = STOPS[STOPS.length - 1], end = last.top + last.h + 8;
  if (key) {
    const r = (g.focus && g.focus[key]) || (() => { const q = (g.st[key] || [[SC.ox, st.top, CW, st.h]])[0]; return [q[0] - 10, q[1] - 12, q[2] + 20, q[3] + 22]; })();
    const kmax = Math.floor(Math.min(W / r[2], (H - top - 6) / r[3]) * DPRS) / DPRS, k = Math.max(SC.s, Math.min(3.5, kmax));
    const vw = W / k, vh = H / k; let x = r[0] + r[2] / 2 - vw / 2, y = r[1] + r[3] / 2 - (vh + top / k) / 2;
    x = SC.worldW >= vw ? Math.max(0, Math.min(SC.worldW - vw, x)) : (SC.worldW - vw) / 2;
    if (r[3] * k > H - top) y = r[1] - top / k;
    y = Math.max(y, st.top - top / k);
    return { x, y: Math.min(y, end - vh), k };
  }
  const k = SC.s, vh = H / k, vw = W / k, room = vh - top / k, fit = (a, b) => (b - a <= room ? a - top / k - (room - (b - a)) / 2 : null);
  let y = fit(...g.vis);
  if (y === null) { const zk = st.kind === 'town' ? (S.station === 'storage' ? 'down' : 'up') : UPPER[S.station] ? 'up' : 'down', z = g.zones[zk] || g.vis; y = fit(...z); if (y === null) y = zk === 'up' ? z[0] - top / k : z[1] - vh; }
  return { x: SC.worldW > vw + 0.5 ? (SC.worldW - vw) / 2 : 0, y: Math.round(Math.min(y, end - vh)), k };
}
function moveCam(t, ms = 240) { S.camTo = { fx: S.camX, fy: S.camY, fk: S.k, tx: t.x, ty: t.y, tk: t.k, t0: performance.now(), ms }; }
