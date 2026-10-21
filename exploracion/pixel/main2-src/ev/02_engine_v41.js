// ---------- MAIN 2.0 · V4.1 · GAME FEEL, ANIMACIÓN Y PULIDO DE ARTE (exploración, no implementación) ----------
// Consolidación de V4 sobre B (terrazas abiertas, candidata provisional). Solo Cheddar con arte piloto; la superficie y Gouda son
// de V3, como contexto de navegación. Primero la lógica: todo lo que pasa en Cheddar sale de una simulación espejo con las reglas
// reales de MINE, DRILL, REFINE, CHEESE y SELL (cifras de ejemplo, rotuladas). Nada se anima si el juego no lo hace.
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
const SPR = { rockcheddar: 'out/sprites/big_cheddar_c0.png', rockgouda: 'out/sprites/big_gouda_c0.png', swingP: 'out/anims/swing_gold.png', house: 'out/anims/phouse.png', lab: 'out/anims/plab.png', swingM: 'out/anims/swing_miner.png', crate: 'out/sprites/crate_raw.png' };
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
    st: { house: [[o + 19, GR - 55, 38, 46]], lab: [[o + 61, GR - 39, 34, 41]], shop: [[o + 88, GR - 52, 44, 56]], storage: [[o + 12, GR + 14, 84, 24], [o + 42, GR - 9, 13, 10]] },
    who: { idle: [o + 34, GR - 9, 'house'], sci: [o + 66, GR + 5, 'lab'], keeper: [o + 108, GR - 6, 'shop'] },
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
    walk: { miner: [rx + 2, rx + 16], driller: [o + 50, o + 76], refiner: [o + 0, o + 8], cook: [o + 96, o + 124] },
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
let S = { stop: 1, focus: null, station: 'rock', dist: 'rock', camX: 0, camY: 0, k: 7 / 3, camTo: null, combo: 0, lastHit: -1e9, acts: 0, flash: {}, drop: 0, dropStart: 0, dropT0: 0 };
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

// ---- Primitivas ----
const INK = '#1b1220';
const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
function box(x, y, w, h, c, ink = INK) { R(x - 1, y - 1, w + 2, h + 2, ink); R(x, y, w, h, c); }
function sprite(src, fw, f, x, y, w, h, flip) { const i = im(src); if (!i.complete || !i.width) return; const n = Math.max(1, Math.floor(i.width / fw)); const fx = ((f % n) + n) % n; if (flip) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(i, fx * fw, 0, w, h, 0, 0, w, h); ctx.restore(); } else ctx.drawImage(i, fx * fw, 0, w, h, x, y, w, h); }
function mouse(m, x, feet, now, flip, o = {}) { const ph = (m.name.length * 431) % 900, dy = Math.floor((now + ph) / 650) % 2, blink = (now + ph * 3) % 3300 < 110; const c = mF(m, o.legs ? 0 : dy, blink, o); if (flip) { ctx.save(); ctx.translate(x + 22, feet - 20); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore(); } else ctx.drawImage(c, x, feet - 20); }
function disc(cx, cy, r, c, a = 1) { ctx.globalAlpha = a; ctx.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1); } ctx.globalAlpha = 1; }
function glow(cx, cy, c, r = 18) { disc(cx, cy, r, c, 0.05); disc(cx, cy, Math.round(r * 0.66), c, 0.06); disc(cx, cy, Math.round(r * 0.36), c, 0.09); }
function line(x0, y0, x1, y1, c, w = 1) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy; ctx.fillStyle = c; for (let k = 0; k < 999; k++) { ctx.fillRect(x0, y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
const DIG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
function digits(str, x, y, c) { ctx.fillStyle = c; [...String(str)].forEach((ch, i) => { const b = DIG[ch]; if (b) for (let k = 0; k < 15; k++) if (b[k] === '1') ctx.fillRect(x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1); }); }
// Cartel de profundidad (el número del juego): madera en Cheddar, latón en Gouda.
function plaque(x, y, n, th) { const w = 8 + String(n).length * 4 + 1, c = th.masonry ? th.metalD : '#3a2410'; box(x, y, w, 9, th.masonry ? th.metal : th.beam); R(x, y, w, 1, th.masonry ? th.metalL : th.beamL); R(x + 3, y + 2, 1, 3, c); R(x + 2, y + 5, 3, 1, c); R(x + 3, y + 6, 1, 1, c); digits(n, x + 7, y + 2, c); return w; }
function pipeSeg(ax, ay, bx, by) { const x = Math.min(ax, bx), y = Math.min(ay, by), w = Math.abs(bx - ax), h = Math.abs(by - ay); R(x - 2, y - 2, w + 5, h + 5, INK); R(x - 1, y - 1, w + 3, h + 3, '#5a5468'); if (h > w) R(x - 1, y - 1, 1, h + 3, '#8a8496'); else R(x - 1, y - 1, w + 3, 1, '#8a8496'); }
function pipePath(P) { for (let i = 1; i < P.length; i++) pipeSeg(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]); }

// ---- Terreno (se pinta una vez por parada, pantalla y tramo de profundidad, en un lienzo aparte) ----
const BG = {};
function baked(st, painter) {
  const key = OPT + st.id + (st.z ? tierOf(DEP[st.z]) : '') + SC.worldW.toFixed(2) + ':' + SC.ox;
  if (!BG[key]) { const c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.translate(0, -st.top); const was = ctx; ctx = g; try { painter(st); } finally { ctx = was; } BG[key] = c; }
  ctx.drawImage(BG[key], 0, st.top);
}
function rockMass(x0, y0, w, h, th, seed) {
  R(x0, y0, w, h, th.wall);
  for (let k = 0; k < 3; k++) { const sy = y0 + Math.floor(h * (0.2 + k * 0.3)); for (let x = x0; x < x0 + w; x++) { const yy = sy + Math.round(Math.sin((x + seed * 7) * 0.09 + k) * 2); R(x, yy, 1, 2, k % 2 ? th.wallD : th.strata); } }
  for (let y = y0; y < y0 + h; y += 2) for (let x = x0; x < x0 + w; x += 2) { const v = hash(x * 31 + y * 977 + seed); if (v < 0.05) R(x, y, 2, 1, th.speck); else if (v > 0.985) { R(x, y, 3, 2, th.wallL); R(x, y + 2, 3, 1, th.wallD); } }
}
function backWall(x0, y0, w, h, th) {
  R(x0, y0, w, h, th.back);
  if (th.masonry) { for (let y = y0 + 1, r = 0; y < y0 + h; y += 6, r++) { R(x0, y, w, 1, th.backD); for (let x = x0 + (r % 2) * 5; x < x0 + w; x += 10) { R(x, y, 1, 6, th.backD); R(x + 1, y + 1, 8, 1, th.backL); } } }
  else for (let y = y0; y < y0 + h; y += 3) for (let x = x0; x < x0 + w; x += 3) { const v = hash(x * 13 + y * 71); if (v < 0.1) R(x, y, 2, 1, th.backD); else if (v > 0.97) R(x, y, 1, 1, th.backL); }
}
function blendBand(x0, y0, w, h, c2) { for (let y = 0; y < h; y++) for (let x = x0; x < x0 + w; x++) if (hash(x * 97 + (y0 + y) * 13) < y / h) R(x, y0 + y, 1, 1, c2); }
// Bóveda: techo redondeado de una cavidad excavada (alta en el centro, baja hacia los lados).
const vault = (x0, x1, apex, side, seed) => (x) => { const m = (x0 + x1) / 2, h = (x1 - x0) / 2, u = Math.min(1, Math.abs(x + 0.5 - m) / h); return Math.round(apex + (side - apex) * Math.pow(u, 2.6)) + (hash(Math.floor(x / 3) * 31 + seed) < 0.25 ? 1 : 0); };
// Cavidad: se recorta del macizo con su techo (en escalera de píxeles), pared del fondo, luz de sus faroles y canto oscuro.
function cave(x0, x1, ceil, fy, th, lamps = []) {
  let top = 1e9; for (let x = x0; x < x1; x++) top = Math.min(top, ceil(x));
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0, fy); for (let x = x0; x < x1; x++) { const c = ceil(x); ctx.lineTo(x, c); ctx.lineTo(x + 1, c); } ctx.lineTo(x1, fy); ctx.closePath(); ctx.clip();
  backWall(x0, top, x1 - x0, fy - top, th); for (const [lx, ly, r] of lamps) glow(lx, ly, th.lamp, r || 18);
  ctx.restore();
  for (let x = x0; x < x1; x++) { const c = ceil(x); R(x, c - 1, 1, 1, th.wallD); ctx.globalAlpha = 0.32; R(x, c, 1, 3, '#000'); ctx.globalAlpha = 1; }
}
function floorA(x0, x1, fy, th, k = 4) { R(x0, fy, x1 - x0, k, th.floor); R(x0, fy, x1 - x0, 1, th.floorL); R(x0, fy + k, x1 - x0, 1, th.floorD); for (let x = x0 + 3; x < x1; x += th.masonry ? 8 : 11) R(x, fy + 1, 1, k - 1, th.floorD); }
function timber(x, y0, y1, th) { box(x, y0, 3, y1 - y0, th.beam); R(x, y0, 1, y1 - y0, th.beamL); R(x + 2, y0, 1, y1 - y0, th.beamD); }
function hangLamp(x, y, th, len = 5) { R(x + 1, y - len, 1, len, INK); box(x, y, 3, 3, th.lamp); R(x, y + 3, 3, 1, th.beamD); }
function wallLamp(x, y, th) { box(x, y + 2, 4, 1, th.metalD); box(x + 1, y - 1, 2, 3, th.lamp); }
function postLamp(x, base, th, h = 20) { box(x + 1, base - h, 1, h, th.beamD); box(x - 1, base - h - 4, 5, 4, th.lamp); R(x - 1, base - h - 5, 5, 1, th.beamD); }
function drip(x, y, len, c) { for (let i = 0; i < len; i++) R(x + (i > len - 3 ? 1 : 0), y + i, i > len - 3 ? 1 : 2, 1, c); }
function root(x, y, len, seed) { for (let i = 0; i < len; i++) R(x + Math.round(Math.sin(i * 0.8 + seed) * 1.2), y + i, 1, 1, '#4a2e18'); }
function ladder(x, y0, y1, th) { R(x, y0, 1, y1 - y0, th.beam); R(x + 6, y0, 1, y1 - y0, th.beam); for (let y = y0 + 2; y < y1; y += 4) R(x + 1, y, 5, 1, th.beamL); }
// Escalera vista de lado, de (x0, y0) abajo a (x1, y1) arriba, peldaños de 4 px.
function stairs(x0, y0, x1, y1, th, base) { const n = Math.max(1, Math.round((y0 - y1) / 4)), dx = (x1 - x0) / n; for (let i = 0; i < n; i++) { const x = Math.round(x0 + dx * (i + 0.5)), y = y0 - (i + 1) * 4, w = Math.max(4, Math.ceil(Math.abs(dx)) + 2); const xx = x - (w >> 1); R(xx, y, w, (base ?? y0) - y, th.floorD); R(xx, y, w, 2, th.floor); R(xx, y, w, 1, th.floorL); } }
// Plano en perspectiva (B): tres tonos de atrás a delante, juntas que fugan y canto iluminado.
function plane(x0, x1, y, th, FD = 12) { const b = Math.ceil(FD / 3); th.plane.forEach((c, i) => R(x0, y + i * b, x1 - x0, Math.min(b, FD - i * b), c)); for (let x = x0 - FD; x < x1; x += th.masonry ? 9 : 12) for (let k = 0; k < FD; k++) { const xx = x + Math.floor(k * 0.6); if (xx >= x0 && xx < x1) R(xx, y + k, 1, 1, th.seam); } R(x0, y, x1 - x0, 1, th.lip); R(x0, y + FD - 1, x1 - x0, 1, th.lip); }
function sky(st, ya, yb) { const W = Math.ceil(SC.worldW), t = st.top; ['#2f3a58', '#384566', '#425076', '#4c5b82', '#56668c'].forEach((c, i) => { const y0 = Math.max(ya, t - 160 + i * 40), y1 = Math.min(yb, t - 120 + i * 40); if (y1 > y0) R(0, y0, W, y1 - y0, c); }); if (yb > t + 40) R(0, Math.max(ya, t + 40), W, yb - Math.max(ya, t + 40), '#5e6f96'); if (ya < t - 160) R(0, ya, W, t - 160 - ya, '#2f3a58'); for (let i = 0; i < 14; i++) { const x = Math.floor(hash(i * 77) * W), y = t - 150 + Math.floor(hash(i * 13) * 170); if (y >= ya && y < yb) R(x, y, 1, 1, '#d8e0f4'); } }
const SOIL = { wall: '#5a4a3a', wallD: '#463728', wallL: '#6e5a44', strata: '#64503c', speck: '#3a2c20' };
function crates(x, base, n, c, m) { for (let i = 0; i < n; i++) { const y = base - 5 - i * 5, dx = i % 2; box(x + dx, y, 8, 4, c); R(x + dx, y, 8, 1, m); R(x + dx + 3, y + 2, 2, 1, m); } }
const PILES = (x, base) => { crates(x, base, 5, '#c98a2e', '#ffd27a'); crates(x + 12, base, 4, '#e8dcb0', '#fff8e0'); crates(x + 24, base, 3, '#d93a4f', '#ffffff'); };
function storeroom(x, base, th) { box(x, base - 22, 36, 22, th.beam); for (let y = base - 19; y < base; y += 4) R(x, y, 36, 1, th.beamD); R(x, base - 22, 36, 1, th.beamL); box(x - 2, base - 25, 40, 3, th.beamD); R(x + 12, base - 15, 12, 15, INK); R(x + 13, base - 14, 10, 14, '#3a2a1c'); box(x + 3, base - 17, 6, 5, '#e8dcb0'); box(x + 27, base - 17, 6, 5, '#e8dcb0'); }

// ---- Superficie: un pueblo pequeño ----
// La casa en una loma, el laboratorio al pie, la tienda delante, junto al camino que baja a la mina. La despensa (PANTRY)
// es una bodega excavada bajo el pueblo: su puerta está en el frente de la loma. A: la boca de la mina es un castillete a la
// izquierda, sobre el pozo del montacargas; B: una grúa a la derecha, sobre la boca de la caverna.
function paintTown(st) {
  const g = geoT(st), { t, o, GR } = g, W = Math.ceil(SC.worldW), th = TH.cheddar;
  sky(st, t, GR);
  for (let x = 0; x < W; x++) { const h1 = 40 + Math.round(Math.sin(x * 0.035 + 1) * 10 + Math.sin(x * 0.11) * 4); R(x, GR - h1, 1, h1, '#3e4a64'); const h2 = 20 + Math.round(Math.sin(x * 0.06 + 3) * 6 + Math.sin(x * 0.17) * 2); R(x, GR - h2, 1, h2, '#4a5a72'); R(x, GR - h2, 1, 1, '#5c6e88'); }
  // Árbol detrás de la casa y el laboratorio.
  box(o + 54, GR - 30, 3, 30, '#5a3c22'); disc(o + 55, GR - 36, 10, '#2f5a2a'); disc(o + 52, GR - 39, 7, '#3e7034'); disc(o + 58, GR - 33, 5, '#3e7034'); R(o + 50, GR - 43, 3, 1, '#5a8a44');
  rockMass(0, GR + 8, W, t + st.h - GR - 8, SOIL, 7);
  ['#5a7a44', '#66884e'].forEach((c, i) => R(0, GR + i * 4, W, 4, c)); R(0, GR, W, 1, '#8ac25e'); R(0, GR + 8, W, 2, '#3a4a2a');
  // Camino de tierra: de la loma a la tienda y a la boca de la mina.
  const mineX = OPT === 'A' ? o + 6 : o + 138;
  for (let x = Math.min(mineX, o + 58); x < Math.max(mineX, o + 140); x++) { const y = GR + 3 + Math.round(Math.sin(x * 0.08) * 1.5); R(x, y, 1, 3, '#a08a5e'); if (hash(x * 7) < 0.15) R(x, y + 1, 1, 1, '#c8b488'); }
  for (let i = 0; i < 18; i++) { const x = o + Math.floor(hash(i * 41) * 144), y = GR + 1 + Math.floor(hash(i * 17) * 6); R(x, y, 1, 1, ['#ffd27a', '#ff8fb4', '#d8e0f4'][i % 3]); }
  // La loma de la casa, con su puerta de la bodega.
  for (let x = o + 12; x < o + 62; x++) { const u = x < o + 20 ? (x - (o + 12)) / 8 : x > o + 54 ? (o + 62 - x) / 8 : 1, h = Math.round(9 * Math.min(1, u)); if (h > 0) { R(x, GR - h, 1, h, '#4e6a3a'); R(x, GR - h, 1, 1, '#8ac25e'); } }
  R(o + 40, GR - 9, 16, 9, SOIL.wall); box(o + 42, GR - 8, 12, 8, '#6a4a2a'); R(o + 47, GR - 8, 1, 8, '#3e2a16'); R(o + 42, GR - 8, 12, 1, '#8a6438'); R(o + 44, GR - 5, 1, 1, '#ffd27a'); R(o + 50, GR - 5, 1, 1, '#ffd27a');
  // Banco y arbustos.
  box(o + 22, GR - 13, 10, 2, '#8a6438'); R(o + 23, GR - 11, 1, 2, '#5a3c22'); R(o + 30, GR - 11, 1, 2, '#5a3c22');
  for (const [x, y, r] of [[o + 14, GR - 3, 3], [o + 60, GR + 1, 3], [o + 86, GR + 2, 2]]) { disc(x, y, r, '#2f5a2a'); R(x - 1, y - r, 2, 1, '#5a8a44'); }
  postLamp(o + 88, GR + 6, th, 18); glow(o + 89, GR - 14, th.lamp, 10);
  // Bodega: escalera desde la puerta, pilas de cajas y el almacén.
  const cy0 = GR + 14, cfy = GR + 38;
  R(o + 12, cy0, 84, cfy - cy0, '#2c1f14'); for (let y = cy0; y < cfy; y += 3) for (let x = o + 12; x < o + 96; x += 3) if (hash(x * 13 + y * 71) < 0.1) R(x, y, 2, 1, '#22180f');
  ctx.save(); ctx.beginPath(); ctx.rect(o + 12, cy0, 84, cfy - cy0); ctx.clip(); glow(o + 72, cy0 + 6, th.lamp, 18); ctx.restore();
  R(o + 12, cy0, 84, 2, SOIL.wallD); floorA(o + 12, o + 96, cfy, th, 3);
  R(o + 44, GR + 8, 10, cy0 - GR - 8, '#2c1f14'); stairs(o + 56, cfy, o + 46, GR + 10, th, cfy);
  hangLamp(o + 72, cy0 + 5, th, 3);
  PILES(o + 14, cfy); storeroom(o + 58, cfy, th);
  // La boca de la mina.
  if (OPT === 'A') { const lx = o; R(lx, GR + 1, 10, t + st.h - GR - 1, '#14121a'); R(lx + 1, GR, 1, t + st.h - GR, '#5a5468'); R(lx + 8, GR, 1, t + st.h - GR, '#5a5468'); box(lx - 1, GR - 30, 2, 30, '#6a5a4a'); box(lx + 9, GR - 30, 2, 30, '#6a5a4a'); for (let k = 0; k < 4; k++) R(lx, GR - 26 + k * 7, 10, 1, '#6a5a4a'); box(lx - 2, GR - 32, 14, 3, '#8a6a4a'); box(lx + 2, GR - 37, 6, 6, '#c8c2d4'); R(lx + 4, GR - 35, 2, 2, '#5a5a68'); }
  else { const E = o + 132; R(E, GR, W - E, t + st.h - GR, '#241a12'); for (let k = 0; k < t + st.h - GR; k++) R(E - 1 - Math.round(k * 0.08), GR + k, 3, 1, SOIL.wallD); box(E - 6, GR - 34, 3, 36, '#6a5a4a'); box(E - 6, GR - 36, o + 146 - E + 6, 3, '#8a6a4a'); R(o + 135, GR - 33, 1, t + st.h - GR + 33, '#8a8496'); R(o + 142, GR - 33, 1, t + st.h - GR + 33, '#8a8496'); box(o + 136, GR - 39, 6, 4, '#c8c2d4'); }
  blendBand(0, t + st.h - 8, W, 8, OPT === 'A' ? TH.cheddar.wall : TH.cheddar.far);
}

// ---- B · colonia abierta en terrazas ----
function rawB(g) { const { o, t, BR } = g; return [[o + 86, BR + 3], [o + 52, BR + 3], [o + 52, t + 12], [o + 39, t + 12], [o + 39, t + 15]]; }
function baseB(g) { const { o, t, TR } = g; return [[o + 49, t + 36], [o + 98, t + 36], [o + 98, TR - 10]]; }
function paintDistrictB(st) {
  const th = TH[st.z], g = geoB(st), { t, o, TL, TR, BR, FF, n, dp } = g, W = Math.ceil(SC.worldW), seed = st.z === 'cheddar' ? 5 : 17, next = STOPS[STOPS.indexOf(st) + 1];
  // La caverna: la pared del fondo, lejos y oscura, con las luces de otras galerías.
  R(0, t, W, st.h, th.far); for (let y = t; y < t + st.h; y += 3) for (let x = 0; x < W; x += 4) if (hash(x * 7 + y * 13 + seed) < 0.08) R(x, y, 3, 1, th.farD);
  for (const [x, y] of [[o + 70, t + 24], [o + 64, t + 92], [o + 80, t + 104], [o + 74, t + 40]]) { R(x, y, 1, 1, th.lamp); ctx.globalAlpha = 0.22; R(x - 1, y - 1, 3, 3, th.lamp); ctx.globalAlpha = 1; }
  // Techo con estalactitas.
  rockMass(0, t, W, 7, th, seed); for (let x = 2; x < W; x += 9) drip(x + (x % 4), t + 7, 3 + jag(x, seed, 4), th.wallD);
  const cliff = (x0, x1, y0, y1, s) => { rockMass(x0, y0, x1 - x0, y1 - y0, th, s); if (th.masonry) for (let y = y0 + 2, r = 0; y < y1; y += 7, r++) { R(x0, y, x1 - x0, 1, th.wallD); for (let x = x0 + (r % 2) * 6; x < x1; x += 12) R(x, y, 1, 7, th.wallD); } else for (let x = x0 + 9; x < x1; x += 17) for (let y = y0 + 4 + (x % 7); y < y1 - 4; y += 2) R(x + (y % 3 ? 0 : 1), y, 1, 2, th.wallD); };
  // Terraza de la refinería (alta, a la izquierda) y de la quesería (más baja, a la derecha), con sus frentes hasta el suelo.
  cliff(0, o + 54, t + 7, TL, seed); plane(0, o + 56, TL, th); cliff(0, o + 54, TL + 12, FF, seed + 9); ctx.globalAlpha = 0.25; R(0, TL + 12, o + 54, FF - TL - 12, '#000'); ctx.globalAlpha = 0.45; R(0, TL + 12, o + 54, 3, '#000'); ctx.globalAlpha = 1;
  cliff(o + 92, W, t + 7, TR, seed + 3); plane(o + 90, W, TR, th); cliff(o + 92, W, TR + 12, FF, seed + 11); ctx.globalAlpha = 0.25; R(o + 92, TR + 12, W - o - 92, FF - TR - 12, '#000'); ctx.globalAlpha = 0.45; R(o + 92, TR + 12, W - o - 92, 3, '#000'); ctx.globalAlpha = 1;
  for (let k = 0; k < FF - TL; k++) R(o + 54 + Math.round(k * 0.05), TL + k, 2, 1, th.wallD);
  for (let k = 0; k < FF - TR; k++) R(o + 91 - Math.round(k * 0.05), TR + k, 2, 1, th.wallD);
  // Escaleras talladas en los frentes de las terrazas.
  for (let i = 0, y = TL + 12; y < FF - 2; i++, y += 6) { const sx = o + 12 + (i % 2 ? 8 : 0); R(sx, y, 14, 2, th.lip); R(sx, y + 2, 14, 3, th.wallD); R(sx, y + 5, 14, 1, INK); }
  for (let i = 0, y = TR + 12; y < FF - 2; i++, y += 6) { const sx = o + 110 + (i % 2 ? 8 : 0); R(sx, y, 14, 2, th.lip); R(sx, y + 2, 14, 3, th.wallD); R(sx, y + 5, 14, 1, INK); }
  // El suelo de la caverna, con la corta: un banco por tramo de profundidad, más estrecho y más oscuro cuanto más hondo.
  const X0 = o + 30, X1 = o + 108;
  rockMass(0, FF + 16, W, t + st.h - FF - 16, th, seed + 21);
  plane(0, W, FF, th, 16); R(0, FF + 16, W, 3, th.wallD); R(0, FF + 16, W, 1, th.wall);
  R(X0, FF + 1, X1 - X0, t + st.h - FF - 1, th.recess);
  for (let k = 0; k < n; k++) { const y = FF + 2 + k * 4, a = X0 + k * 3, b = X1 - k * 3; R(a, y, 3, t + st.h - y, th.layers[k]); R(b - 3, y, 3, t + st.h - y, th.layers[k]); R(a, y, 3, 1, th.lip); R(b - 3, y, 3, 1, th.lip); R(a + 3, y + 3, b - a - 6, 1, th.layers[k]); if (k >= 3) { R(a + 1, y + 2, 1, 2, th.crystal); R(b - 2, y + 1, 1, 2, th.crystal); } }
  const fx0 = X0 + n * 3, fx1 = X1 - n * 3, fy = FF + 4 + dp; plane(fx0, fx1, fy, th, 4); R(fx0, fy + 4, fx1 - fx0, t + st.h - fy - 4, th.layers[Math.min(5, n)]);
  ctx.globalAlpha = 0.07 * n; R(X0, FF + 2, X1 - X0, t + st.h - FF - 2, '#000'); ctx.globalAlpha = 1;
  // Escombrera junto a la corta: crece con la profundidad.
  const hh = 3 + n * 3; for (let k = 0; k < hh; k++) { const w = Math.round(22 * (1 - k / (hh + 2))); R(o + 120 - (w >> 1), FF + 9 - k, w, 1, k % 3 ? th.wall : th.wallL); }
  for (let i = 0; i < n * 3; i++) box(o + 112 + Math.floor(hash(i * 5) * 16), FF + 7 - Math.floor(hash(i * 9) * hh), 2, 1, th.wallL);
  // Puente entre las terrazas (de él cuelga la perforadora) y la escala de la terraza alta.
  R(o + 54, BR, 38, 3, th.beam); R(o + 54, BR, 38, 1, th.beamL); R(o + 54, BR + 3, 38, 1, INK); for (let x = o + 56; x < o + 92; x += 6) R(x, BR, 1, 3, th.beamD);
  R(o + 54, BR - 7, 38, 1, th.beamD); for (const x of [o + 55, o + 72, o + 90]) R(x, BR - 7, 1, 7, th.beamD);
  ladder(o + 52, TL + 12, BR, th);
  // Faroles en poste y cartel de profundidad junto a la corta.
  postLamp(o + 30, TL + 6, th); glow(o + 31, TL - 16, th.lamp, 16); postLamp(o + 126, TR + 6, th); glow(o + 127, TR - 16, th.lamp, 16); postLamp(o + 12, FF + 8, th, 16); glow(o + 13, FF - 10, th.lamp, 16);
  R(o + 22, FF - 6, 1, 14, th.beamD); plaque(o + 16, FF - 14, DEP[st.z], th);
  // Montacargas abierto a la derecha: cables y rellanos.
  R(o + 135, t, 1, st.h, '#8a8496'); R(o + 142, t, 1, st.h, '#8a8496'); for (const fy of [TR, FF]) { R(o + 132, fy + 2, 12, 2, th.metalD); R(o + 132, fy + 2, 12, 1, th.metal); }
  pipePath(rawB(g)); pipePath(baseB(g));
  if (!th.masonry) for (const x of [10, 36, 104, 130]) root(o + x, (x < 60 ? TL : TR) + 15, 4 + (x % 3), x);
  if (next) blendBand(0, t + st.h - 6, W, 6, next.kind === 'district' ? TH[next.z].far : '#1a1820');
  if (st.z === 'gouda') { ctx.globalAlpha = 0.14; R(0, t, W, st.h, '#000'); ctx.globalAlpha = 1; }
}
function paintLocked(st) {
  const W = Math.ceil(SC.worldW), o = SC.ox, t = st.top, chalk = { wall: '#bdb6a6', wallD: '#9a927f', wallL: '#d8d2c2', strata: '#cdc6b4', speck: '#8a826f' };
  if (OPT === 'B') { R(0, t, W, st.h, '#141218'); rockMass(0, t, o + 128, st.h - 10, chalk, 3); } else rockMass(0, t, W, st.h, chalk, 3);
  box(o + 44, t + 12, 44, 30, '#3a3644'); R(o + 46, t + 14, 40, 28, '#141218'); for (let x = o + 46; x < o + 86; x += 7) { R(x, t + 14, 5, 28, '#6a5a4a'); R(x, t + 14, 1, 28, '#8a7a64'); } R(o + 44, t + 22, 44, 3, '#4a4458'); R(o + 44, t + 32, 44, 3, '#4a4458');
  if (OPT === 'A') { R(o, t, 10, st.h, '#14121a'); R(o + 1, t, 1, st.h, '#5a5468'); R(o + 8, t, 1, st.h, '#5a5468'); } else { R(o + 135, t, 1, st.h, '#8a8496'); R(o + 142, t, 1, st.h, '#8a8496'); }
  for (let y = 0; y < st.h; y++) { ctx.globalAlpha = Math.min(0.85, (y / st.h) * 0.9); R(0, t + y, W, 1, '#0e0c12'); } ctx.globalAlpha = 1;
}

// ---- Edificios (bloques a validar, no arte final) ----
// Perforadora de bancada (A): patín, bastidor, motor, brazo y broca clavada en la roca, tolva debajo.
function rig(x, base, now, th) {
  box(x + 4, base - 4, 30, 4, '#3a3a46'); R(x + 4, base - 4, 30, 1, '#6a6a7a'); for (const bx of [6, 31]) R(x + bx, base - 3, 1, 1, '#a8a8ba');
  box(x + 26, base - 30, 3, 26, '#5a5a68'); box(x + 32, base - 30, 3, 26, '#5a5a68'); R(x + 26, base - 30, 1, 26, '#7a7a8a');
  box(x + 19, base - 34, 17, 10, '#e8b830'); R(x + 19, base - 26, 17, 2, '#a07a10'); R(x + 19, base - 34, 17, 1, '#ffe07a'); for (let i = 0; i < 3; i++) R(x + 22 + i * 4, base - 32, 2, 4, '#a07a10');
  box(x + 2, base - 22, 26, 5, '#7a7a8a'); R(x + 2, base - 22, 26, 1, '#a8a8ba'); for (let i = 0; i < 5; i++) R(x + 16 + i * 2, base - 20, 1, 2, i % 2 ? INK : '#e8b830');
  const spin = Math.floor(now / 70) % 3; box(x - 9, base - 21, 11, 3, '#d8dee8'); R(x - 11, base - 20, 2, 1, '#d8dee8'); for (let i = 0; i < 3; i++) R(x - 8 + i * 3 + spin, base - 20, 1, 1, '#5a6070');
  if (Math.floor(now / 140) % 2) { R(x - 13, base - 23, 1, 1, '#ffe6a0'); R(x - 12, base - 17, 1, 1, '#fff'); }
  box(x + 30, base - 18, 5, 7, '#2a2a36'); R(x + 31, base - 16, 2, 1, Math.floor(now / 500) % 2 ? '#62d36e' : '#2f6a34');
  R(x + 20, base - 12, 10, 1, INK); R(x + 21, base - 11, 8, 2, '#8a8496'); R(x + 22, base - 9, 6, 2, '#6a6474'); R(x + 23, base - 7, 4, 3, '#6a6474'); R(x + 21, base - 11, 8, 1, '#c98a2e');
}
// Cabrestante del puente (B): carro con motor sobre el puente; la sarta baja hasta la roca, y su largo es la profundidad.
function hoist(x, deck, tipY, now, th) {
  box(x, deck - 9, 12, 8, '#e8b830'); R(x, deck - 9, 12, 1, '#ffe07a'); R(x, deck - 3, 12, 2, '#a07a10'); for (let i = 0; i < 2; i++) R(x + 3 + i * 4, deck - 7, 2, 3, '#a07a10'); box(x + 9, deck - 13, 3, 4, '#5a5a68');
  const sx = x + 6; R(sx - 1, deck + 3, 3, tipY - deck - 6, INK); R(sx, deck + 3, 1, tipY - deck - 6, '#c8c2d4'); for (let y = deck + 6; y < tipY - 4; y += 6) R(sx - 1, y, 3, 1, '#8a8496');
  const spin = Math.floor(now / 70) % 3; box(sx - 2, tipY - 6, 5, 6, '#d8dee8'); for (let i = 0; i < 2; i++) R(sx - 2 + ((i + spin) % 3) * 2, tipY - 4 + i * 2, 1, 1, '#5a6070');
  if (Math.floor(now / 140) % 2) { R(sx - 4, tipY - 1, 1, 1, '#ffe6a0'); R(sx + 4, tipY - 2, 1, 1, '#fff'); }
}
// Refinería: horno de ladrillo con su boca de fuego y alambique de cobre con embudo (entra el Raw) y caño de la Base.
function still(x, base, now, th, ell) {
  box(x, base - 34, 18, 22, th.metal); R(x + 1, base - 34, 2, 22, th.metalL); R(x + 15, base - 34, 2, 22, th.metalD); R(x, base - 24, 18, 1, th.metalD); for (const ry of [base - 31, base - 17]) for (let i = 0; i < 18; i += 4) R(x + 1 + i, ry, 1, 1, th.metalL);
  if (ell) { box(x, base - 37, 18, 4, th.metalL); R(x + 2, base - 36, 14, 2, '#f4ecd0'); } else { box(x + 2, base - 37, 14, 3, th.metal); R(x + 3, base - 37, 4, 1, th.metalL); }
  R(x + 5, base - 41, 8, 1, INK); R(x + 6, base - 40, 6, 2, th.metalD); R(x + 7, base - 38, 4, 1, th.metalD);
  box(x + 2, base - 12, 14, 12, '#8a3a2a'); for (let i = 0; i < 14; i += 4) R(x + 2 + i, base - 9, 1, 3, '#5a221a'); R(x + 5, base - 7, 8, 6, INK); R(x + 6, base - 6, 6, 5, Math.floor(now / 120) % 2 ? '#ff8a2e' : '#ffd060'); R(x + 7, base - 3, 4, 2, '#fff3a0');
}
function furnace(x, base, w, h, now, th) {
  box(x, base - h, w, h, '#8a3a2a'); for (let y = base - h + 3; y < base; y += 4) { R(x, y, w, 1, '#5a221a'); for (let i = (y >> 2) % 2 ? 0 : 3; i < w; i += 6) R(x + i, y - 3, 1, 3, '#5a221a'); }
  const mw = Math.round(w * 0.45), mx = x + ((w - mw) >> 1); R(mx, base - 11, mw, 11, INK); R(mx + 1, base - 10, mw - 2, 10, Math.floor(now / 120) % 2 ? '#ff8a2e' : '#ffd060'); R(mx + 2, base - 5, mw - 4, 4, '#fff3a0');
}
function racks(x, w, rows, th, wax) { for (const sy of rows) { box(x, sy, w, 2, th.beam); for (let i = 0; i + 6 <= w; i += 7) { const wx = x + 1 + i; box(wx, sy - 4, 6, 4, '#ffcf2e', '#7a4a10'); R(wx, sy - 4, 6, 1, '#fff3a0'); if (wax) R(wx, sy - 2, 6, 1, th.wax); else R(wx + 2, sy - 2, 2, 1, '#c98a08'); } } }
function press(x, base, now, th, wax) { const p = Math.floor(now / 300) % 4 === 2 ? 1 : 0; box(x, base - 9, 18, 9, th.beam); R(x, base - 9, 18, 1, th.beamL); box(x + 4, base - 14 + p, 10, 5, '#ffcf2e', '#7a4a10'); R(x + 4, base - 14 + p, 10, 1, '#fff3a0'); if (wax) R(x + 4, base - 11 + p, 10, 1, th.wax); R(x + 8, base - 21, 2, 7 + p, '#8a8496'); box(x + 5, base - 22, 8, 1, '#5a5a68'); }
function vat(x, base, th) { box(x, base - 9, 10, 9, th.metal); R(x, base - 9, 10, 1, th.metalL); R(x + 2, base - 8, 6, 2, '#f4ecd0'); }
function liftCage(x, top, bottom, now, open) { const span = bottom - top - 12, p = (now / 4200) % 2, up = p < 1, cy = Math.round(bottom - 11 - span * (up ? p : 2 - p)); if (!open) R(x + 5, top, 1, cy - top, '#c8c2d4'); box(x + 2, cy, 6, 10, '#5a5a68'); R(x + 3, cy + 1, 4, 8, '#2a2a36'); R(x + 2, cy, 6, 1, '#8a8496'); if (up) { R(x + 3, cy + 5, 4, 3, '#ffcf2e'); R(x + 3, cy + 5, 4, 1, '#fff3a0'); } }
// Lo que circula: Raw (pepitas naranjas por su tubo), Base (bloques crema por el suyo) y queso (ruedas hacia el montacargas).
function along(P, now, speed, count, draw) { const segs = []; let L = 0; for (let i = 1; i < P.length; i++) { const l = Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); segs.push([P[i - 1], P[i], l]); L += l; } for (let k = 0; k < count; k++) { let d = (now / speed + (k * L) / count) % L; for (const [a, b, l] of segs) { if (d <= l) { const f = l ? d / l : 0; draw(Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f)); break; } d -= l; } } }
const rawDot = (x, y) => { R(x - 1, y - 1, 3, 3, '#e8a030'); R(x - 1, y - 1, 2, 1, '#ffd27a'); };
const baseDot = (x, y) => { R(x - 1, y - 1, 3, 3, '#f4ecd0'); R(x - 1, y + 1, 3, 1, '#b8a878'); };
const wheel = (x, y) => box(x - 2, y - 3, 4, 3, '#ffcf2e', '#7a4a10');

// ---- Paradas ----
let HITS = [];
function pushStations(st, g) { const si = STOPS.indexOf(st); for (const [k, rects] of Object.entries(g.st)) for (const r of rects) HITS.push({ k: 'b', stop: si, st: k, x: r[0], y: r[1], w: r[2], h: r[3] }); }
const pushM = (st, key, who, name, x, feet, extra) => HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: key, who, name, x, y: feet - 20, w: 22, h: 20, ...extra });
function sel(r) { if (NOSEL) return; let [x, y, w, h] = r; const c = '#ffcf2e', a = 4; x -= 2; y -= 2; w += 4; h += 4; for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) { R(Math.min(cx, cx + sx * (a - 1)), cy, a, 1, c); R(cx, Math.min(cy, cy + sy * (a - 1)), 1, a, c); } }
function marks(st, g) { const si = STOPS.indexOf(st); if (STOPS[S.stop] === st) for (const r of g.st[S.station] || []) sel(r); if (S.flash[st.id] && performance.now() - S.flash[st.id].t < 110) for (const r of g.st[S.flash[st.id].k] || []) { ctx.globalAlpha = 0.25; R(r[0], r[1], r[2], r[3], '#fff'); ctx.globalAlpha = 1; } }
// Pasear: ir y volver entre a y b una vez por ciclo (el resto, quieto en a). Devuelve x y hacia dónde mira.
function stroll(now, period, a, b, ph = 0) { const c = (now + ph) % period, go = period * 0.5, ret = period * 0.7, back = period * 0.9; if (c < go) return { x: a, walk: false, right: b < a }; if (c < ret) return { x: Math.round(a + ((b - a) * (c - go)) / (ret - go)), walk: true, right: b > a }; if (c < back) return { x: b, walk: false, right: b > a }; return { x: Math.round(b + ((a - b) * (c - back)) / (period - back)), walk: true, right: a > b }; }
const legs = (now) => ({ legs: Math.floor(now / 120) % 2 ? 'a' : 'b' });
function drawTown(st, now) {
  if (S.camY < st.top) sky(st, Math.floor(S.camY) - 2, st.top);
  baked(st, paintTown);
  const g = geoT(st), { o, GR } = g, f = Math.floor(now / 140);
  sprite(SPR.house, 40, f, o + 18, GR - 9 - 46, 40, 46); sprite(SPR.lab, 36, f, o + 60, GR + 2 - 46, 36, 46); sprite(SPR.shop, 50, f, o + 86, GR + 4 - 54, 50, 54);
  pushStations(st, g); marks(st, g);
  const c = CREW.town;
  mouse(c.idle, o + 34, GR - 9, now, true); pushM(st, 'house', 'idle', c.idle.name, o + 34, GR - 9);
  const gs = stroll(now, 9000, o + 66, o + 74, 1300); mouse(c.sci, gs.x, GR + 5, now, !gs.right, gs.walk ? legs(now) : {}); pushM(st, 'lab', 'sci', c.sci.name, gs.x, GR + 5);
  mouse(c.keeper, o + 104, GR + 7, now, true); pushM(st, 'shop', 'keeper', c.keeper.name, o + 104, GR + 7);
}
function drawDistrictB(st, now) {
  baked(st, paintDistrictB);
  const th = TH[st.z], g = geoB(st), { t, o, TL, TR, BR, FF, rx, rb } = g, z = st.z, wax = !!th.masonry;
  sprite(SPR['rock' + z], 54, 0, rx, rb - 40, 54, 42);
  hoist(o + 82, BR, rb - 22, now, th);
  // Refinería: el horno metido en el acantilado izquierdo y el alambique en la terraza (cara de arriba en perspectiva).
  furnace(o + 2, TL + 2, 24, 30, now, th); R(o + 10, t + 7, 4, TL - 28 - t - 7, '#5a4a4a');
  still(o + 31, TL + 4, now, th, true);
  // Quesería: la boca de una cueva en el acantilado derecho, con baldas dentro, toldo, prensa y cuba en la terraza.
  { const x0 = o + 94, x1 = o + 132, top = t + 18; for (let y = top; y < TR; y++) { const u = Math.min(1, (y - top) / 10), w = Math.round((x1 - x0) * (0.55 + 0.45 * Math.sqrt(u))), xx = x0 + ((x1 - x0 - w) >> 1); R(xx, y, w, 1, th.recess); } racks(o + 100, 28, [TR - 22, TR - 13], th, wax); box(o + 94, TR - 30, 38, 3, wax ? '#c0392b' : th.beam); R(o + 94, TR - 30, 38, 1, wax ? '#e06050' : th.beamL); }
  press(o + 108, TR + 4, now, th, wax); vat(o + 94, TR + 4, th);
  pushStations(st, g); marks(st, g);
  along(rawB(g), now, 26, 3, rawDot); along(baseB(g), now, 30, 2, baseDot); along([[o + 118, TR + 2], [o + 136, TR + 2]], now, 40, 1, wheel);
  liftCage(o + 134, t + 4, FF + 2, now, true);
  const c = CREW[z], mT = now % 1200, mf = mT < 760 ? Math.floor(now / 600) % 2 : mT < 850 ? 2 : mT < 970 ? 3 : mT < 1130 ? 4 : 0;
  sprite(SPR.swingM, 32, mf, rx + 11, rb - 51, 32, 20); pushM(st, 'rock', 'miner', c.miner.name, rx + 13, rb - 31, { crest: true });
  const ds = stroll(now, 8000, o + 62, o + 68, 900); mouse(c.driller, ds.x, BR, now, !ds.right, ds.walk ? legs(now) : {}); pushM(st, 'drill', 'driller', c.driller.name, ds.x, BR);
  mouse(c.refiner, o + 8, TL + 8, now, true, { hold: Math.floor(now / 2400) % 3 === 0 }); pushM(st, 'refinery', 'refiner', c.refiner.name, o + 8, TL + 8);
  const cs = stroll(now, 6500, o + 106, o + 98, 1700); mouse(c.cook, cs.x, TR + 8, now, !cs.right, cs.walk ? legs(now) : {}); pushM(st, 'cheesery', 'cook', c.cook.name, cs.x, TR + 8);
}
function drawLocked(st) { baked(st, paintLocked); }
// Circulación: suelos por donde andan los ratones (verde: libre, para animaciones y encuentros; naranja: ocupado por un puesto
// o un trabajador), escalas y escaleras (puntos), dónde trabaja cada uno (rombo) y el recorrido de la cadena (amarillo).
function freeOf(st, g) {
  const out = [], occ = (f) => { const iv = []; for (const [, [x, feet]] of Object.entries(g.who)) if (Math.abs(feet - f.y) < 3) iv.push([x, x + 22]); if (!f.lane) for (const rs of Object.values(g.st)) for (const r of rs) if (Math.abs(r[1] + r[3] - f.y) < 6) iv.push([r[0], r[0] + r[2]]); return iv.sort((a, b) => a[0] - b[0]); };
  for (const f of g.floors) { let x = f.x0; const segs = []; for (const [a, b] of occ(f)) { if (a > x) segs.push([x, Math.min(a, f.x1)]); x = Math.max(x, b); } if (x < f.x1) segs.push([x, f.x1]); for (const [a, b] of segs) if (b - a > 0) out.push({ x0: a, x1: b, y: f.y, spots: Math.floor((b - a) / 22) }); }
  return out;
}
function drawPaths(st, g) {
  for (const f of g.floors) { R(f.x0, f.y - 1, f.x1 - f.x0, 1, '#ff9a3c'); }
  for (const s of freeOf(st, g)) { R(s.x0, s.y - 1, s.x1 - s.x0, 1, '#62d36e'); for (let k = 0; k < s.spots; k++) { const x = s.x0 + 11 + k * 22; R(x - 1, s.y - 4, 3, 1, '#62d36e'); R(x, s.y - 5, 1, 3, '#62d36e'); } }
  for (const [x0, y0, x1, y1] of g.links) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k += 3) R(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n), 1, 1, '#8ad8ff'); }
  for (const leg of g.legs) for (let i = 1; i < leg.length; i++) { const [a, b] = [leg[i - 1], leg[i]], n = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); for (let k = 0; k <= n; k += 4) R(Math.round(a[0] + ((b[0] - a[0]) * k) / Math.max(1, n)), Math.round(a[1] + ((b[1] - a[1]) * k) / Math.max(1, n)) - 3, 2, 1, '#ffcf2e'); }
  for (const [, [x, feet]] of Object.entries(g.who)) { R(x + 10, feet - 25, 3, 1, '#ff9a3c'); R(x + 11, feet - 26, 1, 3, '#ff9a3c'); }
}

// ---------- ARTE PILOTO · CHEDDAR (V4) ----------
// Todo el arte nuevo sale de un mismo constructor: cada pieza es una máscara con su material; se sombrea sola con la luz de
// arriba a la izquierda (canto claro arriba e izquierda, sombra abajo y a la derecha), se perfila con la tinta de los ratones
// de MICE y luego se le añaden detalles a mano. Así comparte luz, contorno y paleta con los ratones.
// SPRITE: cada pieza es un lienzo de tamaño fijo y se puede sustituir por un PNG del mismo tamaño.
const INK4 = '#1b1220';
// Cinco tonos por material: línea, sombra, base, luz y brillo.
const MAT = {
  wood: ['#2e1a0e', '#5c3519', '#8a5428', '#b67a3e', '#dca266'],
  wood2: ['#24140a', '#45281a', '#6a4024', '#8e5a32', '#b47c48'],
  iron: ['#1c1a26', '#3a3850', '#5e5c78', '#8e8caa', '#c6c4dc'],
  steel: ['#26303c', '#45546a', '#6c809a', '#9cb0c8', '#dceaf6'],
  copper: ['#3e140a', '#7a3418', '#b4602e', '#e2924c', '#ffcc8e'],
  paint: ['#4a2e04', '#9a6a08', '#e0a818', '#f8d040', '#fff4a8'],
  brick: ['#2a0c08', '#5a1e14', '#8a3424', '#b45640', '#da8466'],
  rock: ['#1e140c', '#3e2a1a', '#634428', '#8a643c', '#b08a58'],
  ledge: ['#2a1c10', '#4e3620', '#76552e', '#9c7a46', '#c4a26a'],
  stone: ['#221a16', '#44372e', '#6a5a4a', '#908070', '#bcae98'],
  cheese: ['#6a3c08', '#b87410', '#f0b828', '#ffd860', '#fff6b0'],
  aged: ['#4a2806', '#8a5410', '#c88a20', '#e8b040', '#ffe08a'],
  cream: ['#5e5236', '#9a8a60', '#d4c696', '#efe6c4', '#fffbea'],
  raw: ['#5a2408', '#a44e14', '#e08a2e', '#f8b860', '#ffe0a0'],
  cloth: ['#4a140e', '#8a2a1c', '#c8462e', '#ec7a52', '#ffb08a'],
  canvas: ['#5a4a2a', '#9a8a5a', '#e2d6aa', '#f6eed2', '#ffffff'],
  soot: ['#0c0706', '#140c08', '#1e120c', '#2a1a10', '#3a2416'],
  rope: ['#3a2a14', '#6a5028', '#9a7a44', '#c4a468', '#e8d09a'],
  glass: ['#1e3a44', '#3a6a7a', '#6ab0c0', '#b4e6ee', '#ffffff'],
  flame: ['#7a3a0a', '#c87a10', '#ffc040', '#ffe890', '#fffbe0'],
};
const hash4 = (a, b, c = 0) => { let n = Math.imul(a * 73856093 ^ b * 19349663 ^ c * 83492791, 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 13), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; }
function bres(x0, y0, x1, y1, f) { let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy; for (let k = 0; k < 999; k++) { f(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
function Px(w, h) {
  const N = w * h, L = new Int16Array(N).fill(-1), T = new Int8Array(N).fill(-1), C = new Array(N), layers = [];
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const add = (mat, test, x0, y0, x1, y1, opt = {}) => { const id = layers.length; layers.push({ mat, opt, x0, y0, x1, y1 }); for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) if (test(x, y)) { const i = y * w + x; L[i] = id; T[i] = -1; C[i] = undefined; } return api; };
  const api = {
    w, h,
    rect: (mat, x, y, ww, hh, opt) => add(mat, () => true, x, y, x + ww, y + hh, opt),
    ell: (mat, cx, cy, rx, ry, opt) => add(mat, (X, Y) => ((X + 0.5 - cx) / rx) ** 2 + ((Y + 0.5 - cy) / ry) ** 2 <= 1, cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, opt),
    poly: (mat, P, opt) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); return add(mat, (X, Y) => inPoly(X + 0.5, Y + 0.5, P), Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), opt); },
    fn: (mat, test, x0, y0, x1, y1, opt) => add(mat, test, x0, y0, x1, y1, opt),
    line: (mat, x0, y0, x1, y1, opt) => { const s = new Set(); bres(x0, y0, x1, y1, (x, y) => s.add(y * w + x)); return add(mat, (X, Y) => s.has(Y * w + X), Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1) + 1, Math.max(y0, y1) + 1, opt); },
    tone: (x, y, t) => { if (inb(x, y) && L[y * w + x] >= 0) T[y * w + x] = t; return api; },
    hline: (x, y, n, t) => { for (let i = 0; i < n; i++) api.tone(x + i, y, t); return api; },
    vline: (x, y, n, t) => { for (let i = 0; i < n; i++) api.tone(x, y + i, t); return api; },
    px: (x, y, c) => { if (inb(x, y)) C[y * w + x] = c; return api; },
    rivet: (x, y) => api.tone(x, y, 4).tone(x + 1, y + 1, 1),
    render(outline = true) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h), D = img.data;
      const put = (i, hex) => { const v = parseInt(hex.slice(1), 16); D[i * 4] = v >> 16; D[i * 4 + 1] = (v >> 8) & 255; D[i * 4 + 2] = v & 255; D[i * 4 + 3] = 255; };
      const solid = (x, y) => inb(x, y) && L[y * w + x] >= 0 && !layers[L[y * w + x]].opt.noLine;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, id = L[i];
        if (C[i]) { put(i, C[i]); continue; }
        if (id < 0) { if (outline && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) put(i, INK4); continue; }
        const ly = layers[id], P = MAT[ly.mat]; let t = T[i];
        if (t < 0) {
          const sh = ly.opt.shade || 'box', up = y === 0 || L[i - w] !== id, dn = y === h - 1 || L[i + w] !== id, lf = x === 0 || L[i - 1] !== id, rt = x === w - 1 || L[i + 1] !== id;
          if (sh === 'flat') t = 2;
          else if (sh === 'cyl') { const u = (x + 0.5 - ly.x0) / (ly.x1 - ly.x0); t = u < 0.12 ? 2 : u < 0.3 ? 3 : u < 0.4 ? 4 : u < 0.66 ? 2 : u < 0.88 ? 1 : 0; if (up && t < 3) t++; if (dn) t = Math.min(t, 1); }
          else if (sh === 'top') { t = up ? 4 : y - ly.y0 < 2 ? 3 : 2; if (dn || rt) t = 1; }
          else { t = 2; if (dn || rt) t = 1; if (up || lf) t = 3; if (up && lf) t = 4; if (ly.opt.ao && !dn && y + 2 < h && L[i + 2 * w] !== id) t = Math.min(t, 1); }
          if (ly.opt.noise && !up && !dn) { const r = hash4(x, y, id); if (r < ly.opt.noise) t = Math.max(1, t - 1); else if (r > 1 - ly.opt.noise / 2) t = Math.min(3, t + 1); }
        }
        put(i, P[Math.max(0, Math.min(4, t))]);
      }
      g.putImageData(img, 0, 0); return c;
    },
  };
  return api;
}
const ART = {};
const art = (k, f) => (ART[k] ||= f());

// ---- Horno de ladrillo, metido en la pared (30 × 34): arco, boca de fuego con dintel de hierro y clave de piedra.
const artFurnace = () => art('furnace', () => {
  const p = Px(30, 34);
  p.fn('brick', (x, y) => y >= 10 || ((x + 0.5 - 15) / 15) ** 2 + ((y + 0.5 - 11) / 11) ** 2 <= 1, 0, 0, 30, 34, { noise: 0.06 });
  for (let r = 0, y = 2; y < 34; y += 3, r++) { p.hline(0, y, 30, 1); for (let x = (r % 2) * 3; x < 30; x += 6) p.vline(x, y + 1, 2, 1); for (let x = 1; x < 30; x += 6) p.tone(x + (r % 2) * 3, y + 1, 3); }
  p.fn('soot', (x, y) => (x >= 9 && x < 21 && y >= 22) || ((x + 0.5 - 15) / 6) ** 2 + ((y + 0.5 - 22) / 6) ** 2 <= 1, 8, 15, 22, 34, { shade: 'flat' });
  p.fn('iron', (x, y) => { const d = ((x + 0.5 - 15) / 8) ** 2 + ((y + 0.5 - 22) / 8) ** 2; return d <= 1 && d >= 0.62 && y < 26; }, 6, 13, 24, 26, { shade: 'top' });
  p.rect('stone', 13, 12, 4, 4); p.rect('iron', 6, 25, 3, 9, { shade: 'cyl' }); p.rect('iron', 21, 25, 3, 9, { shade: 'cyl' });
  for (const y of [27, 31]) { p.rivet(7, y); p.rivet(22, y); }
  return p.render();
});
// ---- Alambique de cobre (32 × 32): cuerpo, cúpula, aros con remaches, manómetro, volante de la válvula, tolva del Raw arriba,
// cuello de cisne hacia el serpentín y el caño por donde sale la Base.
const artStill = () => art('still', () => {
  const p = Px(32, 32);
  p.rect('iron', 2, 27, 3, 5, { shade: 'cyl' }); p.rect('iron', 15, 27, 3, 5, { shade: 'cyl' }); p.rect('iron', 0, 25, 20, 3, { shade: 'top' });
  p.fn('copper', (x, y) => (y >= 11 && y < 25 && x >= 2 && x < 18) || ((x + 0.5 - 10) / 8) ** 2 + ((y + 0.5 - 12) / 7) ** 2 <= 1, 2, 4, 18, 25, { shade: 'cyl' });
  for (const y of [14, 22]) { p.hline(2, y, 16, 1); for (let x = 3; x < 18; x += 3) p.tone(x, y - 1, 4); }
  p.ell('cream', 13.5, 18, 2.5, 2.5, { shade: 'flat' }); p.tone(13, 17, 3).tone(14, 17, 3);
  p.ell('iron', 5.5, 19.5, 2.6, 2.6, { shade: 'top' }); p.tone(5, 19, 0).tone(4, 20, 0).tone(6, 18, 0);
  p.poly('iron', [[6, 0], [15, 0], [12, 5], [9, 5]], { shade: 'top' }); p.hline(7, 0, 7, 4);
  p.rect('copper', 16, 7, 9, 2, { shade: 'top' }); p.rect('copper', 24, 7, 2, 5, { shade: 'cyl' });
  // Serpentín (enfría y condensa) y caño.
  p.rect('copper', 22, 11, 8, 14, { shade: 'cyl' }); for (let y = 12; y < 25; y += 3) { p.hline(22, y, 8, 0); p.tone(23, y + 1, 4); }
  p.rect('iron', 25, 25, 2, 4, { shade: 'cyl' });
  return p.render();
});
// ---- Molde de la Base (14 × 6): bandeja de hierro donde cuaja la Base.
const artTray = () => art('tray', () => { const p = Px(14, 6); p.rect('iron', 0, 2, 14, 4, { shade: 'top' }); p.hline(1, 3, 12, 0); return p.render(); });
const artBar = () => art('bar', () => { const p = Px(4, 3); p.rect('cream', 0, 0, 4, 3); return p.render(); });
// ---- Pórtico de la perforadora (ancho variable): tablero de rejilla, frente con franjas de aviso y celosía remachada debajo.
const artGantry = (W) => art('gantry' + W, () => {
  const p = Px(W, 14);
  p.rect('iron', 0, 0, W, 4, { shade: 'top' }); for (let x = 2; x < W; x += 4) p.vline(x, 1, 3, 1);
  p.rect('paint', 0, 4, W, 3, { shade: 'flat' }); for (let x = -3; x < W; x += 6) for (let k = 0; k < 3; k++) { p.tone(x + k, 4 + k, 0); p.tone(x + k + 1, 4 + k, 0); }
  p.rect('iron', 0, 7, W, 2, { shade: 'top' }); p.rect('iron', 0, 12, W, 2, { shade: 'top' });
  for (let x = 0; x + 10 <= W; x += 10) { p.line('iron', x, 9, x + 9, 11); p.line('iron', x + 9, 9, x, 11); p.rect('iron', x, 9, 1, 3); }
  for (let x = 1; x < W; x += 5) { p.rivet(x, 7); p.rivet(x + 2, 12); }
  return p.render();
});
// ---- Perforadora (28 × 24): bancada, carcasa amarilla con rejilla y franja de aviso, escape, tolva del Raw a la izquierda y
// mesa giratoria por donde baja la barra. El volante se dibuja aparte (gira).
const artDrill = () => art('drill2', () => {
  const p = Px(30, 32);
  p.rect('iron', 0, 26, 30, 6, { shade: 'top' }); for (let x = 2; x < 30; x += 6) p.rivet(x, 28);
  p.fn('paint', (x, y) => x >= 5 && x < 25 && y >= 6 && y < 26 && !((x === 5 || x === 24) && y === 6), 5, 6, 25, 26, { noise: 0.04 });
  p.rect('paint', 8, 2, 14, 5, { shade: 'top' }); p.hline(9, 3, 12, 0);
  for (let y = 10; y < 18; y += 2) p.hline(8, y, 13, 0); p.hline(8, 20, 13, 1);
  for (let x = 5; x < 25; x += 4) { p.tone(x, 23, 0); p.tone(x + 1, 23, 0); p.tone(x + 1, 22, 0); }
  p.rect('iron', 23, 0, 3, 7, { shade: 'cyl' }); p.rect('iron', 22, 0, 5, 1);
  p.poly('iron', [[0, 12], [6, 12], [6, 19], [2, 19]], { shade: 'top' });
  p.rect('steel', 11, 26, 8, 6, { shade: 'top' }); p.rect('iron', 13, 30, 4, 2);
  p.ell('iron', 15, 1.5, 2.5, 1.6); p.line('iron', 15, 3, 15, 5);
  return p.render();
});
// Volante de la perforadora (11 × 11), tres posiciones para que gire.
const artWheel = (f) => art('wheel' + f, () => {
  const p = Px(11, 11); p.ell('iron', 5.5, 5.5, 5.4, 5.4, { shade: 'top' }); p.ell('steel', 5.5, 5.5, 3.6, 3.6, { shade: 'flat' }); p.ell('iron', 5.5, 5.5, 1.3, 1.3);
  const a = (f * Math.PI) / 3; for (let k = 0; k < 3; k++) { const b = a + (k * 2 * Math.PI) / 3; bres(5, 5, Math.round(5 + Math.cos(b) * 4), Math.round(5 + Math.sin(b) * 4), (x, y) => p.tone(x, y, 0)); }
  return p.render();
});
// Broca (9 × 9): cono de acero con dientes, dos posiciones.
const artBit = (f) => art('bit' + f, () => { const p = Px(9, 9); p.poly('steel', [[0, 0], [9, 0], [5.5, 9], [3.5, 9]], { shade: 'cyl' }); for (let y = 1; y < 8; y += 2) p.tone(1 + ((y + f) % 3) * 2 + (y > 4 ? 1 : 0), y, 4); p.hline(0, 0, 9, 3); return p.render(); });
// Cuadro de mando (10 × 15): armario, manómetro, piloto y palanca.
const artPanel = () => art('panel', () => { const p = Px(10, 15); p.rect('iron', 0, 3, 10, 12); p.rect('soot', 2, 5, 6, 5, { shade: 'flat' }); p.ell('cream', 4.5, 7.5, 2, 2, { shade: 'flat' }); p.line('iron', 8, 0, 8, 4); p.ell('cloth', 8.5, 0.5, 1.5, 1.3); p.rivet(1, 12); p.rivet(7, 12); return p.render(); });
// ---- Quesería: marco de vigas con letrero, toldo a rayas, baldas de curado, cuba de cuajar, prensa de husillo, moldes y carro.
const artFrame = (W = 36) => art('frame' + W, () => {
  const p = Px(W, 34), c = W >> 1;
  p.rect('wood2', 0, 3, 4, 31, { noise: 0.08 }); p.rect('wood2', W - 4, 3, 4, 31, { noise: 0.08 }); p.rect('wood', 0, 0, W, 5, { noise: 0.06 });
  for (let x = 3; x < W; x += 7) p.tone(x, 2, 1); p.rivet(2, 2); p.rivet(W - 3, 2);
  p.line('wood2', 4, 9, 9, 4); p.line('wood2', W - 5, 9, W - 10, 4);
  p.rect('wood', c - 7, 5, 14, 8); p.rect('rope', c - 5, 4, 1, 2); p.rect('rope', c + 4, 4, 1, 2);
  p.poly('cheese', [[c - 4, 11], [c + 4, 11], [c + 4, 7], [c - 4, 9]]); p.tone(c - 2, 9, 1).tone(c + 1, 9, 1);
  return p.render();
});
const artAwning = (W = 40) => art('awning' + W, () => { const p = Px(W, 9); for (let x = 0; x < W; x += 5) p.poly(Math.floor(x / 5) % 2 ? 'canvas' : 'cloth', [[x, 0], [x + 5, 0], [x + 5, 6], [x + 2.5, 8.5], [x, 6]], { shade: 'top' }); return p.render(); });
const artShelf = (aged) => art('shelf' + aged, () => { const p = Px(36, 8); p.rect('wood', 0, 6, 36, 2, { shade: 'top' }); for (let i = 0; i < 5; i++) { const m = (i + aged) % 3 === 0 ? 'aged' : 'cheese'; p.ell(m, 3.5 + i * 7, 3.5, 3.4, 2.6); p.hline(1 + i * 7, 4, 6, 1); } return p.render(); });
const artVat = () => art('vat', () => {
  const p = Px(18, 14);
  p.rect('wood', 1, 4, 16, 10, { shade: 'cyl' }); for (let x = 3; x < 17; x += 3) p.vline(x, 5, 9, 1); p.rect('iron', 1, 6, 16, 1, { shade: 'flat' }); p.rect('iron', 1, 11, 16, 1, { shade: 'flat' });
  p.ell('wood', 9, 4, 8.4, 3.2, { shade: 'top' }); p.ell('cream', 9, 4.2, 6.6, 2.1, { shade: 'flat' }); p.tone(7, 3, 3).tone(10, 4, 4);
  p.line('wood2', 13, 0, 10, 5);
  return p.render();
});
// Prensa (16 × 22): dos postes, travesaño, husillo de hierro con su barra y el queso en el molde. Dos posiciones.
const artPress = (f) => art('press' + f, () => {
  const p = Px(16, 22), d = f ? 1 : 0;
  p.rect('wood2', 0, 2, 3, 20); p.rect('wood2', 13, 2, 3, 20); p.rect('wood', 0, 0, 16, 3, { shade: 'top' });
  p.rect('iron', 7, 3, 2, 9 + d, { shade: 'cyl' }); for (let y = 4; y < 11 + d; y += 2) p.tone(7, y, 4);
  p.rect('iron', f ? 4 : 2, 5, f ? 8 : 12, 1, { shade: 'flat' });
  p.rect('wood', 3, 12 + d, 10, 2, { shade: 'top' }); p.rect('wood2', 3, 15, 10, 5); p.ell('cheese', 8, 16.5 + d / 2, 4.6, 1.6, { shade: 'flat' }); p.rect('wood', 0, 20, 16, 2, { shade: 'top' });
  return p.render();
});
const artCart = () => art('cart', () => { const p = Px(16, 12); p.rect('wood', 1, 5, 14, 3, { shade: 'top' }); p.line('wood2', 14, 5, 16, 1); p.ell('iron', 4, 9.5, 2.4, 2.4, { shade: 'top' }); p.ell('iron', 12, 9.5, 2.4, 2.4, { shade: 'top' }); p.ell('cheese', 5, 3, 3.4, 2.4); p.ell('cheese', 11, 3, 3.4, 2.4); p.hline(2, 3, 6, 1); p.hline(8, 3, 6, 1); return p.render(); });
// ---- Faroles, cajas y piezas sueltas.
const artLantern = () => art('lantern', () => { const p = Px(7, 10); p.rect('iron', 2, 0, 3, 1); p.rect('iron', 1, 1, 5, 2, { shade: 'top' }); p.rect('flame', 1, 3, 5, 5, { shade: 'flat' }); p.vline(1, 3, 5, 1).vline(5, 3, 5, 1); p.tone(3, 4, 4).tone(3, 5, 4).tone(3, 6, 3); p.rect('iron', 1, 8, 5, 2, { shade: 'top' }); return p.render(); });
const artBarrel = () => art('barrel', () => { const p = Px(10, 12); p.fn('wood', (x, y) => ((x + 0.5 - 5) / 5) ** 2 * 0.6 + ((y + 0.5 - 6) / 6.5) ** 2 <= 1, 0, 0, 10, 12, { shade: 'cyl' }); p.hline(0, 3, 10, 0); p.hline(0, 8, 10, 0); return p.render(); });
// ---- PENDIENTE DE APROBACIÓN: pico del minero, una pieza aparte que se pinta delante del ratón oficial (el ratón no cambia).
// Tres posiciones: levantado, a medio golpe y en el golpe.
const artPick = (f) => art('pick' + f, () => {
  const p = Px(18, 18), a = [-2.05, -1.0, 0.42][f], hx = 6, hy = 12, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], L = 9;
  const E = [hx + d[0] * L, hy + d[1] * L], at = (b, u, v) => [b[0] + d[0] * u + n[0] * v, b[1] + d[1] * u + n[1] * v];
  p.poly('wood', [at([hx, hy], -1, -1), at([hx, hy], -1, 1), at(E, 0, 1), at(E, 0, -1)], { shade: 'flat' });
  p.poly('steel', [at(E, -0.5, -5), at(E, 1.6, -2), at(E, 2.4, 0), at(E, 1.6, 2), at(E, -0.5, 5), at(E, 0.6, 0)], { shade: 'top' });
  return p.render();
});
// PENDIENTE: lo que llevan en la pata el refinador (un trozo de Raw) y el quesero (una rueda), también piezas aparte.
const artCarry = (k) => art('carry' + k, () => { const p = Px(8, 7); if (k === 'raw') { p.poly('raw', [[1, 2], [5, 0], [7, 3], [5, 6], [1, 5]]); p.tone(3, 2, 4); } else { p.ell('cheese', 4, 3.5, 3.6, 2.8); p.hline(1, 4, 6, 1); } return p.render(); });

// ---------- ARTE V4.1: separar identidades ----------
// REFINE = industria (ladrillo, hierro, cobre, fuego, vapor, chimenea; nada de madera ni toldo).
// CHEESE = taller artesano (madera, alero de tablas, cuba, prensa de husillo, moldes, mesa, baldas de curado; sin toldo).
// SELL = comercio (puesto con toldo a rayas, mostrador con el queso a la vista, rótulo con la moneda, balanza, pizarra).
MAT.wood3 = ['#2a1a10', '#5a3a20', '#8a5e34', '#b48450', '#d8aa70'];
MAT.slate = ['#14161c', '#242832', '#363c4a', '#4c5466', '#6a7488'];
MAT.coin = ['#6a4206', '#b8800a', '#f2c02a', '#ffe070', '#fffbd0'];
MAT.green = ['#123a1c', '#1e5e2c', '#2e8a40', '#52b85e', '#98e8a0'];
// Alero de tablas de la quesería (en vez del toldo): tablas en perspectiva con su canto y un farol colgado.
const artEave = (W = 40) => art('eave' + W, () => { const p = Px(W, 8); p.poly('wood3', [[0, 2], [W, 2], [W - 2, 7], [2, 7]], { shade: 'top' }); for (let x = 3; x < W - 2; x += 5) p.vline(x, 3, 4, 1); p.rect('wood2', 0, 0, W, 2, { shade: 'top' }); return p.render(); });
// Rótulo de la quesería: tabla colgada con una cuña de queso (no la moneda de la tienda).
const artCheeseSign = () => art('csign', () => { const p = Px(14, 10); p.rect('wood', 0, 2, 14, 8); p.rect('rope', 3, 0, 1, 2); p.rect('rope', 10, 0, 1, 2); p.poly('cheese', [[3, 8], [11, 8], [11, 4], [3, 6]]); p.tone(5, 6, 1).tone(8, 6, 1); return p.render(); });
// Mesa de trabajo con un cuchillo y media rueda.
const artTable = () => art('table', () => { const p = Px(16, 10); p.rect('wood', 0, 3, 16, 2, { shade: 'top' }); p.rect('wood2', 1, 5, 2, 5); p.rect('wood2', 13, 5, 2, 5); p.ell('cheese', 6, 2.6, 3.4, 2); p.rect('steel', 10, 1, 4, 1, { shade: 'flat' }); p.rect('wood2', 13, 1, 2, 1); return p.render(); });
const artMolds = () => art('molds', () => { const p = Px(10, 9); for (let i = 0; i < 3; i++) { p.rect('wood', 1 + (i % 2), 6 - i * 3, 8, 3, { shade: 'cyl' }); p.hline(1 + (i % 2), 7 - i * 3, 8, 1); } return p.render(); });
// Paleta de remover (se mueve aparte, dentro de la cuba).
const artPaddle = (f) => art('paddle' + f, () => { const p = Px(8, 10); p.line('wood', f ? 6 : 2, 0, f ? 3 : 5, 8, { shade: 'flat' }); p.rect('wood', f ? 2 : 4, 7, 3, 2); return p.render(); });
// ---- SELL: el puesto de la tienda (superficie). 44 × 46, cabe entre el laboratorio y el pozo del montacargas ----
const artShop = () => art('shop', () => {
  const p = Px(44, 46);
  p.rect('wood3', 2, 12, 3, 34); p.rect('wood3', 39, 12, 3, 34);
  for (let x = 0; x < 44; x += 6) { const x1 = Math.min(44, x + 6); p.poly(Math.floor(x / 6) % 2 ? 'canvas' : 'cloth', [[x, 4], [x1, 4], [x1, 12], [(x + x1) / 2, 15], [x, 12]], { shade: 'top' }); }
  p.rect('wood2', 0, 2, 44, 3, { shade: 'top' });
  p.rect('wood', 4, 32, 36, 4, { shade: 'top' }); p.rect('wood3', 4, 36, 36, 10); for (let x = 7; x < 40; x += 6) p.vline(x, 37, 9, 1);
  // El queso a la venta va a la izquierda del mostrador, bajo la pizarra de precios; el tendero, detrás, a la derecha.
  p.rect('slate', 8, 17, 10, 8); p.hline(10, 19, 6, 3).hline(10, 21, 4, 3); p.rect('rope', 12, 15, 1, 2);
  return p.render();
});
// Rótulo de la tienda: una moneda colgada.
const artCoinSign = () => art('coinsign', () => { const p = Px(12, 13); p.rect('rope', 3, 0, 1, 3); p.rect('rope', 8, 0, 1, 3); p.ell('coin', 6, 8, 5.4, 5.4, { shade: 'top' }); p.ell('coin', 6, 8, 3.2, 3.2, { shade: 'flat' }); p.vline(6, 6, 5, 1); return p.render(); });

// ---------- PROPUESTA: una roca distinta por capítulo ----------
// Siluetas y materiales distintos, con lo que todas deben conservar: una cresta plana para el minero (línea verde), la cara
// de la veta donde muerde la broca (punto rojo) y su zona táctil (rectángulo). Dos estados: entera y con la veta abierta.
const ROCKS6 = [
  { id: 'cheddar', name: 'Cheddar', note: 'Canto rodado redondo: la roca aprobada de hoy (c0 y v5).', w: 54, h: 42, real: true, crest: [16, 36] },
  { id: 'gouda', name: 'Gouda', note: 'Losas apiladas, ancha y baja, con vetas de cera roja entre losa y losa.', w: 60, h: 34, mat: ['#2a3038', '#4e5866', '#76808e', '#a2acb8', '#d8dee6'], shape: (x, y, w, h) => { const band = Math.floor(y / 9); const inset = [8, 4, 1, 0][Math.min(3, band)]; return x >= inset && x < w - inset - (band === 0 ? 4 : 0); }, crest: [12, 44], cheese: 'cheese', seams: '#c0392b' },
  { id: 'brie', name: 'Brie', note: 'Montículo blando y achatado, con costra de moho blanco que se desborda un poco.', w: 56, h: 36, mat: ['#4a4438', '#8a8270', '#c8c0a8', '#e8e2d0', '#ffffff'], shape: (x, y, w, h) => { const t = Math.abs((x + 0.5 - w / 2) / (w / 2)), u = Math.max(0, t - 0.4) / 0.6; return y >= h * (0.16 + 0.8 * u * u); }, crest: [17, 39], cheese: 'cream', rind: true },
  { id: 'emmental', name: 'Emmental', note: 'Roca de lomo ancho con ojos (cavidades); la veta se abre en el centro.', w: 56, h: 42, mat: ['#4a4020', '#8a7a40', '#c8b060', '#e8d48a', '#fff4c0'], shape: (x, y, w, h) => ((x + 0.5 - w / 2) / (w / 2)) ** 4 + ((y + 0.5 - h) / h) ** 2 <= 1, crest: [17, 39], cheese: 'cheese', holes: [[11, 20, 4.2], [44, 30, 3.4], [16, 35, 2.4]] },
  { id: 'parmesan', name: 'Parmesano', note: 'Bloque facetado y granuloso, más alto, con brillos de cristal y una meseta arriba.', w: 50, h: 46, mat: ['#3e3020', '#7a6040', '#b8986a', '#dcc094', '#fff0c8'], shape: (x, y, w, h) => inPoly(x + 0.5, y + 0.5, [[3, h], [0, 26], [7, 9], [15, 2], [35, 2], [44, 11], [50, 28], [w, h]]), crest: [16, 34], cheese: 'aged', grain: true },
  { id: 'blue', name: 'Blue', note: 'Pizarra oscura con vetas minerales azules; los costados en sierra y la cresta llana.', w: 54, h: 44, mat: ['#14182a', '#262c46', '#3a4466', '#56648c', '#8a9ac0'], shape: (x, y, w, h) => { const c = x >= 17 && x <= 37, top = c ? 8 : 9 + Math.abs(((x * 7) % 14) - 7) * 0.7 + ((x + 0.5 - w / 2) / (w / 2)) ** 2 * 22; return y >= top; }, crest: [17, 37], cheese: 'cheese', veins: '#5ab0ff' },
];
// Luz de arriba a la izquierda, como la roca aprobada: tono por posición y canto superior iluminado.
function rockProposal(r, open) {
  if (r.real) return im(open ? ROCKV[4] : ROCKC[0]);
  return art('rp' + r.id + open, () => {
    MAT['rp' + r.id] = r.mat; const p = Px(r.w, r.h), inS = (x, y) => x >= 0 && y >= 0 && x < r.w && y < r.h && r.shape(x, y, r.w, r.h);
    p.fn('rp' + r.id, (x, y) => inS(x, y), 0, 0, r.w, r.h, { shade: 'flat' });
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { if (!inS(x, y)) continue; const d = (x / r.w) * 0.55 + (y / r.h) * 0.75 + (hash4(x, y, 7) - 0.5) * 0.1; p.tone(x, y, !inS(x, y - 1) ? 4 : d < 0.38 ? 3 : d < 0.82 ? 2 : 1); if (!inS(x + 1, y) || !inS(x, y + 1)) p.tone(x, y, 1); }
    for (let i = 0; i < 6; i++) { const x = 6 + Math.floor(hash4(i, r.w) * (r.w - 12)), y = 8 + Math.floor(hash4(i, r.h) * (r.h - 12)); bres(x, y, x + 3 - (i % 3) * 2, y + 5, (a, b) => inS(a, b) && inS(a, b - 2) && p.tone(a, b, 0)); }
    if (r.seams) for (let y = 9; y < r.h; y += 9) for (let x = 0; x < r.w; x++) if (inS(x, y)) p.px(x, y, r.seams);
    if (r.rind) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (inS(x, y) && (!inS(x, y - 1) || (!inS(x, y - 2) && hash4(x, y, 3) < 0.6))) p.px(x, y, '#ffffff');
    if (r.grain) for (let i = 0; i < 46; i++) { const x = Math.floor(hash4(i, 9) * r.w), y = Math.floor(hash4(i, 11) * r.h); if (inS(x, y) && inS(x, y - 1)) p.px(x, y, hash4(i, 5) < 0.3 ? '#fffbe8' : '#8a6c48'); }
    if (r.veins) for (let i = 0; i < 4; i++) bres(8 + i * 11, r.h - 3, 14 + i * 9, 16 + (i % 2) * 6, (a, b) => { if (inS(a, b) && inS(a, b - 1)) p.px(a, b, r.veins); });
    if (r.holes) for (const [cx, cy, rr] of r.holes) for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const q = (x * x + y * y) / (rr * rr); if (q < 1 && inS(cx + x, cy + y)) p.px(cx + x, cy + y, y > rr * 0.4 ? '#7a6a30' : '#2a2010'); else if (q < 1.45 && y < 0 && inS(cx + x, cy + y)) p.px(cx + x, cy + y, MAT['rp' + r.id][1]); }
    if (open) { const cx = Math.round(r.w / 2), cy = r.h - 14; for (let y = -7; y <= 7; y++) for (let x = -11; x <= 11; x++) if ((x / 11) ** 2 + (y / 7) ** 2 <= 1) { const inner = (x / 9) ** 2 + ((y - 1) / 5.5) ** 2 <= 1; p.px(cx + x, cy + y, inner ? (y < -2 ? '#2a1a10' : MAT[r.cheese][y > 2 ? 2 : 3]) : '#1b1220'); } }
    return p.render();
  });
}

// ---------- SIMULACIÓN ESPEJO (V4.1) ----------
// Copia, para Cheddar, de las reglas reales de js/game/systems/production.js y js/game/simulation.js. Lo que cambia son las
// cifras: son de ejemplo (rotuladas en la columna) para que el ciclo entero se vea en menos de un minuto. No toca el juego.
//  · MINE: solo se pica sin veta a la vista (status 'ready'); con veta, picar falla ('vein-exposed').
//  · Golpe a mano: combo si llega antes de 650 ms; crítico cada 5 del combo. Con un minero en la roca, cada toque hace al menos
//    el 4 % de la búsqueda (12 % si es crítico). Sin minero, la fuerza del pico (x3 en crítico).
//  · El minero da un golpe cada «intervalo» solo mientras la roca está 'ready'; con veta a la vista, su acumulador vuelve a 0.
//  · Al completar la búsqueda: la veta se abre con toda su capacidad y el combo vuelve a 0.
//  · DRILL: solo arranca con veta y sin ciclo en marcha; al arrancar reserva su Raw de la veta y lo entrega al acabar. Tocar con
//    un ciclo en marcha lo acelera 250 ms. Con perforador, encadena ciclos mientras haya veta.
//  · Veta vacía al acabar un ciclo: la veta se cierra, la búsqueda vuelve a 0 y la roca baja un nivel de profundidad.
//  · REFINE, CHEESE y SELL: arrancan si tienen material (lo gastan al arrancar) y entregan al acabar; tocar acelera.
const RULE = { help: 0.04, helpCrit: 0.12, critEvery: 5, critMult: 3, comboMs: 650, drillBoostMs: 250, refBoostMs: 250, cookBoostMs: 250, sellBoostMs: 300 };
// Cifras de ejemplo (no son las del juego): búsqueda en unidades, ritmos en ms.
const EX = { need: 60, pick: 2, minerPower: 4, minerMs: 1400, capacity: 32, drillYield: 4, drillMs: 2000, rawPerBase: 2, refBatch: 2, refMs: 3000, cookBase: 1, cookMs: 3500, sellLots: 1, sellMs: 2600 };
const P41 = { miner: true, driller: true, refiner: true, cook: true, keeper: true };
let Z41, EVL = [];
function simReset(o = {}) {
  Z41 = { depth: DEP.cheddar, discover: 0, veinRevealed: false, veinRemaining: 0, drillJob: null, refJob: null, cookJob: null, sellJob: null, minerAcc: 0, combo: 0, lastHitAt: -1e9, raw: 4, base: 3, lots: 2, coins: 0, hits: 0, ...o };
}
simReset();
const emit41 = (type, d = {}) => { const e = { type, t: performance.now(), ...d }; EVL.push(e); if (EVL.length > 400) EVL.shift(); for (const f of EVH) f(e); };
const EVH = [];
const on41 = (f) => EVH.push(f);
const fail41 = (reason) => ({ ok: false, reason });
const veinNeed = () => EX.need;
const SIM41 = {
  mineStatus: () => (Z41.veinRevealed ? 'vein-exposed' : 'ready'),
  // Golpe: 'manual' (el jugador) o 'worker' (el minero). Misma regla que CM.mining.hit.
  hit(source) {
    if (this.mineStatus() !== 'ready') return fail41('vein-exposed');
    const need = veinNeed(), now = performance.now(); let crit = false;
    if (source === 'manual') { Z41.combo = now - Z41.lastHitAt <= RULE.comboMs ? Z41.combo + 1 : 1; Z41.lastHitAt = now; crit = Z41.combo % RULE.critEvery === 0; }
    let power = source === 'manual' ? EX.pick * (crit ? RULE.critMult : 1) : EX.minerPower;
    if (source === 'manual' && P41.miner) power = Math.max(power, need * (crit ? RULE.helpCrit : RULE.help));
    const amount = Math.min(need - Z41.discover, power); Z41.discover += amount; Z41.hits++;
    emit41('hit', { source, crit, amount, combo: source === 'manual' ? Z41.combo : 0 });
    if (Z41.discover >= need - 1e-6) { Z41.discover = need; Z41.veinRevealed = true; Z41.veinRemaining = EX.capacity; Z41.combo = 0; emit41('reveal', { capacity: Z41.veinRemaining }); }
    return { ok: true, crit };
  },
  drillStatus: () => (Z41.drillJob ? 'running' : !Z41.veinRevealed || Z41.veinRemaining <= 0 ? 'no-vein' : 'ready'),
  drillStart(source) { if (this.drillStatus() !== 'ready') return fail41(this.drillStatus()); const amount = Math.max(1, Math.min(EX.drillYield, Z41.veinRemaining)); Z41.veinRemaining -= amount; Z41.drillJob = { remaining: EX.drillMs, total: EX.drillMs, amount, source }; emit41('drillStart', { source, amount }); return { ok: true }; },
  drillTap() { if (!Z41.drillJob) return this.drillStart('manual'); Z41.drillJob.remaining = Math.max(0, Z41.drillJob.remaining - RULE.drillBoostMs); emit41('drillBoost'); return { ok: true, boosted: true }; },
  drillComplete() { const j = Z41.drillJob; Z41.drillJob = null; Z41.raw += j.amount; emit41('drillDone', { amount: j.amount, source: j.source }); if (Z41.veinRevealed && Z41.veinRemaining <= 0) { Z41.veinRevealed = false; Z41.veinRemaining = 0; Z41.discover = 0; Z41.depth += 1; emit41('deeper', { depth: Z41.depth }); } },
  refStatus: () => (Z41.refJob ? 'running' : Math.floor(Z41.raw / EX.rawPerBase) < 1 ? 'no-raw' : 'ready'),
  refStart(source) { if (this.refStatus() !== 'ready') return fail41(this.refStatus()); const batches = Math.min(EX.refBatch, Math.floor(Z41.raw / EX.rawPerBase)); const used = batches * EX.rawPerBase; Z41.raw -= used; Z41.refJob = { remaining: EX.refMs, total: EX.refMs, amount: batches, used, source }; emit41('refineStart', { used }); return { ok: true }; },
  refTap() { if (!Z41.refJob) return this.refStart('manual'); Z41.refJob.remaining = Math.max(0, Z41.refJob.remaining - RULE.refBoostMs); emit41('refineBoost'); return { ok: true, boosted: true }; },
  refComplete() { const j = Z41.refJob; Z41.refJob = null; Z41.base += j.amount; emit41('refineDone', { amount: j.amount, source: j.source }); },
  cookStatus: () => (Z41.cookJob ? 'running' : Z41.base < EX.cookBase ? 'no-base' : 'ready'),
  cookStart(source) { if (this.cookStatus() !== 'ready') return fail41(this.cookStatus()); Z41.base -= EX.cookBase; Z41.cookJob = { remaining: EX.cookMs, total: EX.cookMs, amount: 1, source }; emit41('cookStart'); return { ok: true }; },
  cookTap() { if (!Z41.cookJob) return this.cookStart('manual'); Z41.cookJob.remaining = Math.max(0, Z41.cookJob.remaining - RULE.cookBoostMs); emit41('cookBoost'); return { ok: true, boosted: true }; },
  cookComplete() { const j = Z41.cookJob; Z41.cookJob = null; Z41.lots += j.amount; emit41('cookDone', { amount: j.amount, source: j.source }); },
  sellStatus: () => (Z41.sellJob ? 'running' : Z41.lots < EX.sellLots ? 'no-stock' : 'ready'),
  sellStart(source) { if (this.sellStatus() !== 'ready') return fail41(this.sellStatus()); Z41.lots -= EX.sellLots; Z41.sellJob = { remaining: EX.sellMs, total: EX.sellMs, amount: EX.sellLots, source }; emit41('sellStart'); return { ok: true }; },
  sellTap() { if (!Z41.sellJob) return this.sellStart('manual'); Z41.sellJob.remaining = Math.max(0, Z41.sellJob.remaining - RULE.sellBoostMs); emit41('sellBoost'); return { ok: true, boosted: true }; },
  sellComplete() { const j = Z41.sellJob; Z41.sellJob = null; Z41.coins += j.amount * 120; emit41('sellDone', { amount: j.amount, source: j.source }); },
};
// Igual que runJob y runMiner de simulation.js.
function runJob41(dt, get, auto, start, complete) { let left = dt; for (let g = 0; g < 50; g++) { let job = get(); if (!job) { if (!auto || !start().ok) return; job = get(); } const used = Math.min(left, job.remaining); job.remaining -= used; left -= used; if (job.remaining > 0) return; complete(); } }
function runMiner41(dt) { if (!P41.miner || SIM41.mineStatus() !== 'ready') { Z41.minerAcc = 0; return; } Z41.minerAcc += dt; while (Z41.minerAcc >= EX.minerMs) { Z41.minerAcc -= EX.minerMs; if (!SIM41.hit('worker').ok) { Z41.minerAcc = 0; break; } } }
// Estados forzados (rotulados SIMULACIÓN): solo quitan material o puestos; nunca permiten acciones que el juego no permite.
const FORCE = { state: 'normal' };
function step41(dt) {
  runMiner41(dt);
  runJob41(dt, () => Z41.drillJob, P41.driller, () => SIM41.drillStart('worker'), () => SIM41.drillComplete());
  runJob41(dt, () => Z41.refJob, P41.refiner, () => SIM41.refStart('worker'), () => SIM41.refComplete());
  runJob41(dt, () => Z41.cookJob, P41.cook, () => SIM41.cookStart('worker'), () => SIM41.cookComplete());
  runJob41(dt, () => Z41.sellJob, P41.keeper, () => SIM41.sellStart('worker'), () => SIM41.sellComplete());
}

// ---------- CHEDDAR V4.1: terreno, máquinas, recursos, montacargas, ratones y jugador ----------
// Todo lo que se mueve responde a un estado o un evento de la simulación espejo (m41_sim): golpe, veta, ciclos de perforadora,
// refinería, quesería y tienda, y bajada de nivel. Nada se anima «porque sí».
const RK = MAT.rock, LG = MAT.ledge;
// ---- Terreno ----
function stones(x0, y0, w, h, seed, P) { for (let i = 0; i < (w * h) / 34; i++) { const x = x0 + Math.floor(hash4(i, seed, 1) * w), y = y0 + Math.floor(hash4(i, seed, 2) * h), r = 1 + Math.floor(hash4(i, seed, 3) * 3), q = hash4(i, seed, 5); if (r === 1) { R(x, y, q < 0.5 ? 2 : 1, 1, P[q < 0.3 ? 0 : 2]); continue; } for (let k = -r; k <= r; k++) { const ww = Math.round(Math.sqrt(r * r - k * k) * (0.95 + q * 0.35)); R(x - ww, y + k, ww * 2 + 1, 1, P[1]); } R(x - r, y - r + 1, r + 1, 1, P[2]); R(x - r - 1, y, 1, 1, P[2]); R(x + 1, y + r, r + 1, 1, P[0]); R(x + r + 1, y + 1, 1, r - 1 || 1, P[0]); } }
function patches(x0, y0, w, h, seed) { for (let y = y0; y < y0 + h; y += 6) for (let x = x0; x < x0 + w; x += 6) { const v = hash4(Math.floor(x / 6), Math.floor(y / 6), seed + 50); if (v < 0.25) { ctx.globalAlpha = 0.12; R(x, y, 6, 6, '#000'); ctx.globalAlpha = 1; } else if (v > 0.85) { ctx.globalAlpha = 0.06; R(x, y, 6, 6, '#ffe0b0'); ctx.globalAlpha = 1; } } }
function cracks(x0, y0, w, h, seed, c) { for (let i = 0; i < (w * h) / 900; i++) { let x = x0 + Math.floor(hash4(i, seed, 7) * w), y = y0 + Math.floor(hash4(i, seed, 8) * h); const L = 5 + Math.floor(hash4(i, seed, 9) * 9); for (let k = 0; k < L && y < y0 + h; k++) { R(x, y, 1, 1, c); y++; if (hash4(i, k, seed) < 0.4) x += hash4(k, i, seed) < 0.5 ? -1 : 1; } } }
function cliff(x0, x1, y0, y1, seed) { R(x0, y0, x1 - x0, y1 - y0, RK[2]); patches(x0, y0, x1 - x0, y1 - y0, seed); stones(x0, y0, x1 - x0, y1 - y0, seed, [RK[1], RK[2], RK[3]]); cracks(x0, y0, x1 - x0, y1 - y0, seed, RK[0]); }
// Suelo en perspectiva con canto de madera (plataformas) y el camino de tierra más claro en el carril delantero.
function ledgeTop(x0, x1, y, D, seed, path = true) { const rows = [LG[3], LG[3], LG[2], LG[2], LG[2], LG[1]]; for (let k = 0; k < D; k++) R(x0, y + k, x1 - x0, 1, rows[Math.min(5, Math.floor((k / D) * 6))]); stones(x0, y + 1, x1 - x0, D - 5, seed, [LG[1], LG[2], LG[3]]); if (path) { ctx.globalAlpha = 0.18; R(x0, y + D - 7, x1 - x0, 3, '#ffe8c0'); ctx.globalAlpha = 1; } R(x0, y, x1 - x0, 1, LG[4]); R(x0, y + D - 3, x1 - x0, 2, MAT.wood[2]); R(x0, y + D - 3, x1 - x0, 1, MAT.wood[3]); R(x0, y + D - 1, x1 - x0, 1, MAT.wood[1]); for (let x = x0 + 3; x < x1; x += 9) R(x, y + D - 2, 1, 1, MAT.iron[3]); }
function faceDown(x0, x1, y0, y1, seed) { cliff(x0, x1, y0, y1, seed); ctx.globalAlpha = 0.18; R(x0, y0, x1 - x0, y1 - y0, '#000'); ctx.globalAlpha = 0.5; R(x0, y0, x1 - x0, 2, '#000'); ctx.globalAlpha = 0.25; R(x0, y0 + 2, x1 - x0, 3, '#000'); ctx.globalAlpha = 1; }
function post(x, y0, y1) { R(x - 1, y0, 4, y1 - y0, INK4); R(x, y0, 2, y1 - y0, MAT.wood2[2]); R(x, y0, 1, y1 - y0, MAT.wood2[3]); }
function brace(x0, y0, x1, y1) { bres(x0, y0, x1, y1, (x, y) => { R(x, y - 1, 1, 3, INK4); }); bres(x0, y0, x1, y1, (x, y) => R(x, y, 1, 1, MAT.wood2[2])); }
function lanternPost(x, base, h, glowR = 18) { glow(x + 3, base - h - 4, '#ffcf7a', glowR); post(x + 2, base - h, base); ctx.drawImage(artLantern(), x, base - h - 9); }
function paintCheddar(st) {
  const g = geoC(st), { t, o, TL, TR, DK, FF, n, X0, X1 } = g, W = Math.ceil(SC.worldW), H = st.h;
  // Fondo de la caverna: el plano más lejano, el más oscuro y frío.
  R(0, t, W, H, '#261a12'); patches(0, t, W, H, 9); stones(0, t, W, H, 7, ['#1c130c', '#2e2016', '#3a2a1c']); cracks(0, t, W, H, 9, '#140d08');
  for (let i = 0; i < 10; i++) { const x = Math.floor(hash4(i, 3) * W), y = t + 16 + Math.floor(hash4(i, 5) * (FF - t - 26)); for (let k = 0; k < 7; k++) R(x + k, y + Math.round(Math.sin(k * 0.9 + i)), 1, 1, MAT.cheese[k % 3 ? 1 : 2]); R(x + 3, y, 1, 1, MAT.cheese[4]); }
  for (let x = 0; x < W; x++) { const h = 6 + jag(x, 11, 3); R(x, t, 1, h, RK[2]); R(x, t + h, 1, 1, RK[0]); if (hash4(x, 1) < 0.3) R(x, t + 1, 1, 1, RK[3]); }
  for (let x = 4; x < W; x += 11) { const L = 4 + Math.floor(hash4(x, 9) * 6); for (let i = 0; i < L; i++) { const w = i < L - 2 ? 2 : 1; R(x - 1, t + 7 + i, w + 2, 1, INK4); R(x, t + 7 + i, w, 1, i < L - 3 ? RK[2] : RK[3]); } }
  for (const x of [o + 60, o + 84, o + 122]) for (let i = 0; i < 9; i++) R(x + Math.round(Math.sin(i * 0.7 + x) * 1.2), t + 8 + i, 1, 1, MAT.wood2[1]);
  // Terrazas (plano medio, más claro y cálido) con sus frentes en sombra y el entibado que las sostiene.
  cliff(0, o + 48, t + 8, TL, 3); ledgeTop(0, o + 48, TL, 14, 4); faceDown(0, o + 46, TL + 14, FF, 5);
  for (const x of [o + 22, o + 40]) post(x, TL + 14, FF); brace(o + 24, TL + 16, o + 39, TL + 30);
  cliff(o + 98, W, t + 8, TR, 13); ledgeTop(o + 98, W, TR, 14, 14); faceDown(o + 100, W, TR + 14, FF, 15);
  post(o + 101, TR + 14, FF); brace(o + 103, TR + 16, o + 116, TR + 28);
  // La cueva de la quesería.
  for (let y = t + 28; y < TR; y++) { const u = Math.min(1, (y - t - 28) / 9), w = Math.round(32 * (0.5 + 0.5 * Math.sqrt(u))), xx = o + 102 + ((32 - w) >> 1); R(xx - 1, y, w + 2, 1, INK4); R(xx, y, w, 1, MAT.soot[2]); }
  ctx.save(); ctx.beginPath(); ctx.rect(o + 102, t + 28, 32, TR - t - 28); ctx.clip(); glow(o + 118, t + 38, '#ffcf7a', 16); ctx.restore();
  // Escalera de madera con cuerda (terraza alta → suelo) y escala (corta → terraza de la quesería).
  for (let i = 0, y = TL + 16; y < FF - 2; i++, y += 6) { const sx = o + 2 + (i % 2 ? 6 : 0); R(sx - 1, y - 1, 14, 5, INK4); R(sx, y, 12, 2, MAT.wood[3]); R(sx, y + 2, 12, 2, MAT.wood[1]); }
  for (let y = TL + 14; y < FF; y += 2) R(o + 1, y, 1, 1, MAT.rope[2]);
  // Suelo de la caverna.
  ledgeTop(0, W, FF, 16, 21); R(0, FF + 16, W, H - (FF - t) - 16, RK[1]); stones(0, FF + 16, W, H - (FF - t) - 16, 22, [RK[0], RK[1], RK[2]]); R(0, FF + 16, W, 1, RK[3]);
  // La corta: un banco por tramo de profundidad.
  const SL = ['#7a5a3a', '#6a4c30', '#5c4028', '#4e3622', '#402c1c', '#34241a'];
  if (n) R(X0, FF + 1, X1 - X0, H - (FF - t) - 1, MAT.soot[2]);
  for (let k = 0; k < n; k++) {
    const y = FF + 2 + k * 4, a = X0 + k * 3, b = X1 - k * 3;
    R(a, y, b - a, 4, MAT.soot[3]); R(a, y, 3, H - (y - t), SL[k]); R(b - 3, y, 3, H - (y - t), SL[k]); R(a, y, 3, 1, LG[3]); R(b - 3, y, 3, 1, LG[3]); R(a + 3, y + 3, b - a - 6, 1, SL[k]);
    if (k >= 1) { R(a + 1, y + 1, 1, 3, MAT.wood2[2]); R(b - 2, y + 1, 1, 3, MAT.wood2[2]); }
    if (k >= 2) for (let x = a + 6; x < b - 6; x += 9) R(x, y + 3, 3, 1, MAT.cheese[1]);
    if (k >= 3) for (const x of [a + 1, b - 2]) { R(x, y + 1, 1, 2, MAT.cheese[4]); glow(x, y + 2, '#ffcf5a', 4); }
  }
  const fx0 = X0 + n * 3, fx1 = X1 - n * 3, fy = FF + 4 + n * 4;
  if (n) { for (let k = 0; k < 4; k++) R(fx0, fy + k, fx1 - fx0, 1, [LG[2], LG[2], LG[1], LG[1]][k]); R(fx0, fy + 4, fx1 - fx0, H - (fy - t) - 4, SL[Math.min(5, n)]); ctx.globalAlpha = 0.06 * n; R(X0, FF + 2, X1 - X0, H - (FF - t) - 2, '#000'); ctx.globalAlpha = 1; }
  else { ctx.globalAlpha = 0.25; R(X0 + 8, FF + 5, X1 - X0 - 16, 6, '#000'); ctx.globalAlpha = 1; }
  for (let y = TR + 14; y < FF + 10; y += 4) R(o + 109, y, 6, 1, MAT.wood[3]); R(o + 108, TR + 14, 1, FF + 10 - TR - 14, MAT.wood[1]); R(o + 115, TR + 14, 1, FF + 10 - TR - 14, MAT.wood[1]);
  // Escombrera (crece con la profundidad), a la izquierda; cajas a la derecha.
  const hh = 2 + n * 3; for (let k = 0; k < hh; k++) { const w = Math.round(18 * (1 - k / (hh + 2))); R(o + 8 - (w >> 1), FF + 7 - k, w, 1, k % 3 ? RK[2] : RK[3]); }
  for (const [x, y] of [[o + 118, FF + 1], [o + 121, FF - 6]]) ctx.drawImage(im(SPR.crate), x, y);
  // Elevador de cangilones (fijo): carriles, polea y canaleta a la tolva del alambique.
  for (const x of [o + 43, o + 49]) { R(x - 1, t + 12, 3, DK + 6 - t - 12, INK4); R(x, t + 12, 1, DK + 6 - t - 12, MAT.iron[2]); }
  for (let i = 0; i < 16; i++) { const x = o + 42 - i, y = t + 15 + Math.round(i * 0.45); R(x, y, 1, 3, INK4); R(x, y + 1, 1, 1, MAT.iron[3]); }
  // Chimenea de hierro del horno, hasta el techo.
  R(o - 1, t + 7, 5, TL - 26 - t - 7, INK4); R(o, t + 7, 3, TL - 26 - t - 7, MAT.iron[1]); R(o, t + 7, 1, TL - 26 - t - 7, MAT.iron[2]); R(o - 2, TL - 30, 7, 3, MAT.iron[1]);
  // Canaleta abierta de la Base: de los moldes, bajo el pórtico, hasta la cuba (se ve lo que baja).
  trough(BASEP(g));
  lanternPost(o + 0, FF + 10, 14);
  // Pozo del montacargas: cables y rellanos (la jaula se dibuja aparte, una sola para todo el pozo).
  R(o + 135, t, 1, H, '#8a8496'); R(o + 142, t, 1, H, '#8a8496'); for (const fy2 of [TR, FF]) { R(o + 132, fy2 + 2, 12, 2, MAT.iron[1]); R(o + 132, fy2 + 2, 12, 1, MAT.iron[3]); }
  blendBand(0, t + H - 6, W, 6, TH.gouda.far);
}
function trough(P) { for (let i = 1; i < P.length; i++) { const [a, b] = [P[i - 1], P[i]], x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]); R(x - 2, y - 2, w + 5, h + 5, INK4); R(x - 1, y - 1, w + 3, h + 3, MAT.iron[1]); if (h > w) R(x - 1, y - 1, 1, h + 3, MAT.iron[3]); else { R(x - 1, y + 1, w + 3, 1, MAT.iron[3]); R(x - 1, y - 1, w + 3, 1, MAT.iron[0]); } } }
const BASEP = (g) => [[g.o + 40, g.TL + 8], [g.o + 40, g.DK + 12], [g.o + 106, g.DK + 12], [g.o + 106, g.TR - 4]];
const RAWP = (g) => [[g.o + 58, g.DK - 11], [g.o + 46, g.DK - 11], [g.o + 46, g.t + 14], [g.o + 41, g.t + 15], [g.o + 27, g.t + 21]];

// ---- Estado visual, alimentado por los eventos ----
const V = { ext: 0, extT: 0, fly: 0, flyT: 0, flash: 0, jolt: null, tray: 0, tokens: [], strikes: 0, workerStrikes: 0, puffs: 0 };
const WHITE = {};
function whiteOf4(src) { if (WHITE[src]) return WHITE[src]; const i = im(src); if (!i.complete || !i.width) return null; const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); return (WHITE[src] = c); }
// La roca: grietas por búsqueda (c0-c4) y, con veta, cuánto queda (v5 llena → v1), contando el Raw del ciclo en marcha.
function rockSrc() {
  if (Z41.veinRevealed) { const left = Z41.veinRemaining + (Z41.drillJob ? Z41.drillJob.amount : 0), depl = Math.max(1, Math.ceil((6 * left) / EX.capacity)); return ROCKV[Math.max(0, Math.min(4, depl - 2))]; }
  return ROCKC[Math.min(4, Math.floor((5 * Z41.discover) / EX.need))];
}
const TOPS = {};
function rockTop(src, col) { if (!TOPS[src]) { const i = im(src); if (!i.complete || !i.width) return 3; const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data, tops = []; for (let x = 0; x < c.width; x++) { let y = 0; while (y < c.height && d[(y * c.width + x) * 4 + 3] < 128) y++; tops.push(y); } TOPS[src] = tops; } const T = TOPS[src]; return T[Math.max(0, Math.min(T.length - 1, col))]; }
// Dónde pisa el minero: la mediana de la superficie bajo sus pies (no el punto más alto, para no quedar colgado).
function minerFeet(g, x) { const src = rockSrc(), v = []; for (let c = x - g.rx + 7; c <= x - g.rx + 14; c++) v.push(rockTop(src, c)); v.sort((a, b) => a - b); return g.rb - 40 + v[v.length >> 1] + 1; }
function fire(x, y, w, h, now, power) { const f = Math.floor(now / 110) % 3; for (let i = 0; i < w; i++) { const hh = Math.max(1, Math.round(h * power * (0.45 + 0.55 * hash4(i, f, 3)))); for (let k = 0; k < hh; k++) R(x + i, y + h - 1 - k, 1, 1, MAT.fire[Math.min(4, Math.floor(((hh - k) / hh) * 3.2) + (power > 0.8 ? 1 : 0))]); } }
MAT.fire = ['#7a1a08', '#c83a10', '#ff7a1e', '#ffc040', '#fff2b0'];
const prog = (j) => (j ? 1 - j.remaining / j.total : 0);
// ---- Recursos que viajan (representación: no retrasan nada; la producción ya está hecha) ----
// Raw: pepita naranja angulosa. Base: bloque crema. Queso: rueda amarilla. Formas y colores distintos.
const rawTok = (x, y) => { R(x - 2, y - 1, 4, 3, INK4); R(x - 1, y - 2, 2, 1, INK4); R(x - 1, y - 1, 2, 2, '#e08a2e'); R(x - 1, y - 1, 1, 1, '#ffd890'); R(x, y, 1, 1, '#a44e14'); };
const baseTok = (x, y) => { R(x - 2, y - 2, 5, 4, INK4); R(x - 1, y - 1, 3, 2, '#efe6c4'); R(x - 1, y - 1, 3, 1, '#fffbea'); };
const coinTok = (x, y) => { R(x - 1, y - 2, 3, 1, INK4); R(x - 2, y - 1, 5, 3, INK4); R(x - 1, y + 2, 3, 1, INK4); R(x - 1, y - 1, 3, 3, '#f2c02a'); R(x - 1, y - 1, 1, 1, '#fffbd0'); R(x + 1, y + 1, 1, 1, '#b8800a'); };
const wheelTok = (x, y) => { R(x - 3, y - 2, 6, 4, INK4); R(x - 2, y - 2, 4, 1, INK4); R(x - 2, y - 1, 4, 2, '#f0b828'); R(x - 2, y - 1, 4, 1, '#fff6b0'); R(x - 1, y, 2, 1, '#b87410'); };
function pathAt(P, f) { const segs = []; let L = 0; for (let i = 1; i < P.length; i++) { const l = Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); segs.push([P[i - 1], P[i], l]); L += l; } let d = f * L; for (const [a, b, l] of segs) { if (d <= l) { const k = l ? d / l : 0; return [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k)]; } d -= l; } return P[P.length - 1]; }
function spawnTokens(kind, n, ms, stagger) { const now = performance.now(); for (let i = 0; i < n; i++) V.tokens.push({ kind, t0: now + i * stagger, ms, born: now }); }
// ---- Montacargas: una sola jaula para todo el pozo. Sube el queso de Cheddar a la tienda de la superficie. ----
const LIFT = { y: null, state: 'wait', t0: 0, load: 0, queue: 0, shop: 3, trips: 0, from: 0, to: 0 };
function liftYs() { const c = STOPS[1], g = geoC(c), tw = geoT(STOPS[0]); return { cheddar: g.TR - 9, town: tw.GR - 6 }; }
function liftTick(now) {
  const Y = liftYs(); if (LIFT.y === null) LIFT.y = Y.cheddar;
  const go = (to, ms, st) => Object.assign(LIFT, { state: st, t0: now, from: LIFT.y, to, ms });
  if (LIFT.state === 'wait' && LIFT.queue > 0) { LIFT.state = 'load'; LIFT.t0 = now; }
  else if (LIFT.state === 'load' && now - LIFT.t0 > 500) { LIFT.load = LIFT.queue; LIFT.queue = 0; go(Y.town, 3200, 'up'); emit41('liftUp', { load: LIFT.load }); }
  else if (LIFT.state === 'up' || LIFT.state === 'down') { const k = Math.min(1, (now - LIFT.t0) / LIFT.ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; LIFT.y = LIFT.from + (LIFT.to - LIFT.from) * e; if (k >= 1) { if (LIFT.state === 'up') { LIFT.state = 'unload'; LIFT.t0 = now; } else { LIFT.state = 'wait'; } } }
  else if (LIFT.state === 'unload' && now - LIFT.t0 > 700) { LIFT.shop = Math.min(6, LIFT.shop + LIFT.load); LIFT.trips++; emit41('liftArrive', { load: LIFT.load }); LIFT.load = 0; go(Y.cheddar, 2600, 'down'); }
}
function drawLift(now) {
  const o = SC.ox, y = Math.round(LIFT.y ?? liftYs().cheddar), x = o + 133;
  R(x + 4, -40, 1, y + 40, '#c8c2d4');
  box(x, y, 10, 11, '#5a5a68'); R(x + 1, y + 1, 8, 9, '#2a2a36'); R(x, y, 10, 1, '#8a8496'); R(x, y + 5, 10, 1, '#4a4a58');
  const n = LIFT.state === 'up' || LIFT.state === 'unload' ? LIFT.load : LIFT.state === 'load' ? LIFT.queue : 0;
  for (let i = 0; i < Math.min(2, n); i++) wheelTok(x + 3 + i * 4, y + 8 - (i % 2) * 2);
  if (LIFT.state === 'up' && Math.floor(now / 250) % 2) R(x + 4, y - 3, 2, 2, '#ffcf2e');
}
// ---- Lo que hacen las máquinas según su estado ----
on41((e) => {
  const st = STOPS[1]; if (!st) return; const g = geoC(st), now = e.t;
  if (e.type === 'hit') {
    if (e.source === 'manual') { V.jolt = { t0: now, d: e.crit ? [2, 1] : [1, 1] }; V.flash = now; V.strikes++; AV.swing = now; const p = [g.rx + 7, g.rb - 20]; spark(p[0], p[1], 'chip', e.crit ? 7 : 4); spark(p[0], p[1] + 2, 'dust', 1); if (e.crit) { spark(p[0], p[1] - 2, 'spark', 5); spark(p[0], p[1] - 4, 'glint', 2); } thunk(0.9 + Math.random() * 0.25, e.crit); }
    else { V.jolt = { t0: now, d: [1, 0] }; V.workerStrikes++; const p = [g.rx + 30, g.rb - 34]; spark(p[0], p[1], 'chip', 2); if (STOPS[S.stop] === st && S.focus === 'rock') thunk(0.8, false, true); }
    V.tap = null;
  }
  if (e.type === 'reveal') { for (let i = 0; i < 6; i++) spark(g.rx + 14 + i * 5, g.rb - 22 - (i % 3) * 3, 'glint', 1); chime(); }
  if (e.type === 'drillStart') { spark(g.o + 66, g.DK - 30, 'smoke'); }
  if (e.type === 'drillBoost') { V.flyT = now; spark(g.o + 72, g.rb - 22, 'spark', 2); }
  if (e.type === 'drillDone') { spawnTokens('raw', Math.min(4, e.amount), 2600, 160); }
  if (e.type === 'deeper') { DEP.cheddar = e.depth; const was = tierOf(e.depth - 1), now2 = tierOf(e.depth); if (now2 !== was) { S.drop = -(now2 - was) * 4; S.dropStart = S.drop; S.dropT0 = performance.now(); for (let i = 0; i < 8; i++) spark(g.X0 + 6 + i * 10, g.FF + 4, 'dust', 1); thunk(0.5, false); } paintLabels(); }
  if (e.type === 'refineStart') { V.steam = now; }
  if (e.type === 'refineDone') { V.tray = Math.min(3, V.tray + e.amount); spawnTokens('base', Math.min(3, e.amount), 1800, 220); setTimeout(() => (V.tray = Math.max(0, V.tray - e.amount)), 600); }
  if (e.type === 'cookDone') { const b = BR.cook; if (b) b.newWheel = (b.newWheel || 0) + 1; else LIFT.queue++; }
  if (e.type === 'sellDone') { LIFT.shop = Math.max(0, LIFT.shop - 1); V.sellT = now; }
});
const running = () => !!Z41.drillJob;
const refining = () => !!Z41.refJob;
const pressing = () => !!Z41.cookJob;
// ---- El jugador: su ratón (el de MAIN, swing_gold: pico dorado desde 16 rangos de Sharper Pick) trabaja en un andamio
// junto a la roca y da los golpes a mano: el pico llega a la roca en el fotograma del golpe. Los golpes del minero contratado
// son suyos y van a su ritmo; nunca golpea por el jugador. Con la veta abierta no pica (el juego no deja): baja el pico.
// El andamio baja con la roca (pisa siempre el fondo de la corta), así que el ratón nunca queda colgado.
const AV = { swing: -1e9 };
const PLAYER = (g) => ({ x: g.rx - 21, feet: g.rb - 13 });
function scaffold(g) {
  const { rx, rb } = g, y = rb - 12;
  for (const x of [rx - 20, rx - 4]) { R(x - 1, y + 1, 4, rb + 1 - y - 1, INK4); R(x, y + 1, 2, rb + 1 - y - 1, MAT.wood2[2]); R(x, y + 1, 1, rb + 1 - y - 1, MAT.wood2[3]); }
  brace(rx - 18, y + 3, rx - 5, rb - 1);
  R(rx - 23, y - 1, 26, 5, INK4); R(rx - 22, y, 24, 2, MAT.wood[3]); R(rx - 22, y + 2, 24, 1, MAT.wood[1]); R(rx - 22, y, 24, 1, MAT.wood[4]); for (let x = rx - 19; x < rx + 2; x += 7) R(x, y + 1, 1, 1, MAT.iron[3]);
}
function drawPlayer(g, now) {
  const dt = now - AV.swing, f = Z41.veinRevealed ? 0 : dt < 70 ? 3 : dt < 170 ? 4 : Math.floor(now / 600) % 2, p = PLAYER(g);
  sprite(SPR.swingP, 32, f, p.x, p.feet + 1 - 20, 32, 20);
  HITS.push({ k: 'm', stop: 1, st: 'rock', who: 'player', name: 'You', x: p.x + 1, y: p.feet - 19, w: 22, h: 20, player: true });
}
function drawCheddar(st, now) {
  baked(st, paintCheddar);
  const g = geoC(st), { t, o, TL, TR, DK, FF, rx, rb } = g;
  // REFINE: el fuego sube mientras refina y cuando el refinador lo aviva; el manómetro marca el ciclo; la válvula suelta vapor al
  // arrancar; la chimenea humea mientras trabaja.
  const stoke = BR.refiner && BR.refiner.act === 'stoke' && BR.refiner.on && Math.floor((now - BR.refiner.ta) / 300) % 2 ? 0.25 : 0;
  const pw = refining() ? 0.72 + 0.18 * Math.sin(now / 170) + stoke : 0.22;
  ctx.drawImage(artFurnace(), o - 14, TL - 28); fire(o - 4, TL - 9, 10, 12, now, Math.min(1, pw)); glow(o + 1, TL - 2, '#ff8a2e', Math.round(10 + 7 * pw));
  if (refining() && now % 700 < 30) spark(o + 1, t + 9, 'smoke');
  ctx.drawImage(artStill(), o + 14, TL - 24);
  { const a = -2.2 + prog(Z41.refJob) * 2.6; R(o + 27 + Math.round(Math.cos(a) * 1.4), TL - 6 + Math.round(Math.sin(a) * 1.4), 1, 1, INK4); R(o + 27, TL - 6, 1, 1, INK4); }
  if (V.steam && now - V.steam < 500) { const k = (now - V.steam) / 500; ctx.globalAlpha = 0.5 * (1 - k); disc(o + 20, TL - 26 - Math.round(k * 6), 2 + Math.round(k * 3), '#e8e4f0'); ctx.globalAlpha = 1; }
  ctx.drawImage(artTray(), o + 33, TL + 4); for (let i = 0; i < Math.min(3, V.tray); i++) ctx.drawImage(artBar(), o + 34 + i * 4, TL + 3);
  if (refining()) { const d = Math.floor((now % 1400) / 150); if (now % 1400 < 900) R(o + 40, TL - 3 + d, 1, 1, MAT.cream[3]); }
  // Elevador: los cangilones solo se mueven cuando llevan Raw (tras un ciclo de perforadora).
  const busy = V.tokens.some((k) => k.kind === 'raw' && now >= k.t0 && now - k.t0 < k.ms); V.elev = (V.elev || 0) + (busy ? 1 : 0); for (let k = 0; k < 5; k++) { const y = Math.round(DK + 2 - ((V.elev / 2.5 + k * 9) % (DK - t - 12))); R(o + 44, y, 5, 3, INK4); R(o + 45, y, 3, 2, MAT.iron[2]); }
  ctx.drawImage(artWheel(Math.floor(V.elev / 6) % 3), o + 41, t + 8);
  // DRILL: pórtico, máquina, volante (gira solo con un ciclo en marcha), cuadro con su piloto (verde: trabaja; ámbar: veta sin
  // ciclo; rojo intermitente: sin veta) y la barra, abajo solo mientras hay veta.
  ctx.drawImage(artGantry(52), o + 48, DK);
  const run = running(), jit = run && Math.floor(now / 60) % 2 ? 1 : 0;
  V.ext = Math.max(0, Math.min(1, V.ext + (Z41.veinRevealed ? 1 : -1) * Math.min(64, now - (V.extT || now)) / 700)); V.extT = now;
  const sx = o + 73, rest = DK + 18, tipY = Math.round(rest + (rb - 22 - rest) * (V.ext * V.ext * (3 - 2 * V.ext)));
  if (run) V.fly += (now - V.flyT < 300 ? 2.4 : 1) * 0.06; ctx.drawImage(artDrill(), o + 58, DK - 29 + jit); R(o + 72, DK - 34 + jit, 1, 6, INK4); ctx.drawImage(artWheel(Math.floor(V.fly) % 3), o + 66, DK - 44 + jit); ctx.drawImage(artPanel(), o + 98, DK - 12);
  if (run && now % 600 < 20) spark(o + 82, DK - 30, 'smoke');
  R(o + 100, DK - 8, 2, 2, run ? '#62d36e' : Z41.veinRevealed ? '#ffb347' : now % 900 < 450 ? '#ff5a3c' : '#5a1a10');
  { const a = run ? -2.2 + prog(Z41.drillJob) * 2.6 : 1.4; R(o + 102 + Math.round(Math.cos(a) * 1.5), DK - 4 + Math.round(Math.sin(a) * 1.5), 1, 1, INK4); }
  // CHEESE: taller sin toldo (el toldo es de la tienda): alero de tablas, rótulo con la cuña, baldas de curado, cuba con su
  // paleta, prensa de husillo (se mueve con cada hornada) y moldes.
  ctx.drawImage(artShelfN(0), o + 105, TR - 27); ctx.drawImage(artVat(), o + 104, TR - 13);
  if (pressing() && BR.cook && BR.cook.act === 'stir' && BR.cook.on) ctx.drawImage(artPaddle(Math.floor(now / 260) % 2), o + 109, TR - 18); else ctx.drawImage(artPaddle(0), o + 109, TR - 18);
  ctx.drawImage(artFrame(36), o + 98, TR - 33); ctx.drawImage(artEave(40), o + 96, TR - 39); ctx.drawImage(artCheeseSign(), o + 99, TR - 30);
  ctx.drawImage(artPress(pressing() ? Math.floor(prog(Z41.cookJob) * 6) % 2 : 0), o + 118, TR - 16); ctx.drawImage(artMolds(), o + 97, TR - 3);
  for (let i = 0; i < Math.min(3, LIFT.queue); i++) wheelTok(o + 130 - (i % 2) * 3, TR + 1 - Math.floor(i / 2) * 3);
  // El andamio del jugador y la roca.
  scaffold(g);
  ctx.globalAlpha = 0.45; R(rx + 6, rb, 44, 2, '#000'); R(rx + 10, rb + 2, 36, 1, '#000'); ctx.globalAlpha = 1;
  const j = V.jolt && now - V.jolt.t0 < 90 ? (now - V.jolt.t0 < 45 ? V.jolt.d : [-V.jolt.d[0], 0]) : [0, 0];
  const src = rockSrc(); sprite(src, 54, 0, rx + j[0], rb - 40 + j[1], 54, 42);
  if (V.flash && now - V.flash < 60) { const w = whiteOf4(src); if (w) { ctx.globalAlpha = 0.55; ctx.drawImage(w, rx + j[0], rb - 40 + j[1]); ctx.globalAlpha = 1; } }
  if (Z41.veinRevealed && Math.floor(now / 260) % 4 === 0) R(rx + 20 + Math.floor(hash4(Math.floor(now / 260), 1) * 14), rb - 18 + Math.floor(hash4(Math.floor(now / 260), 2) * 6), 1, 1, '#fff6b0');
  // La barra baja por delante de la roca hasta la veta y gira solo durante el ciclo.
  R(sx - 2, DK + 4, 5, tipY - DK - 4, INK4); R(sx - 1, DK + 4, 3, tipY - DK - 4, MAT.steel[2]); R(sx - 1, DK + 4, 1, tipY - DK - 4, MAT.steel[3]);
  for (let y = DK + 5 + (run ? Math.floor(now / 50) % 4 : 0); y < tipY - 1; y += 4) R(sx - 1, y, 3, 1, MAT.steel[1]);
  ctx.drawImage(artBit(run ? Math.floor(now / 70) % 2 : 0), sx - 4, tipY - 2);
  if (run && V.ext > 0.95) { if (Math.floor(now / 90) % 3 === 0) spark(sx + (Math.random() < 0.5 ? -3 : 3), tipY + 5, 'spark'); const k = prog(Z41.drillJob); rawTok(sx, Math.round(tipY - k * (tipY - DK - 6))); }
  // Recursos de camino: Raw (elevador → tolva), Base (canaleta → cuba).
  for (let i = V.tokens.length - 1; i >= 0; i--) { const k = V.tokens[i], f = (now - k.t0) / k.ms; if (f < 0) continue; if (f >= 1) { V.tokens.splice(i, 1); continue; } const [x, y] = pathAt(k.kind === 'raw' ? RAWP(g) : BASEP(g), f); (k.kind === 'raw' ? rawTok : baseTok)(x, y); }
  pushStations(st, g);
  if (S.focus && STOPS[S.stop] === st) for (const r of g.st[S.focus] || []) sel(r);
  drawWorkers(st, g, now);
  drawPlayer(g, now);
  plaque(o + 2, FF - 30, DEP.cheddar, TH.cheddar);
}
const artShelfN = (aged) => art('shelfN' + aged, () => { const p = Px(28, 8); p.rect('wood', 0, 6, 28, 2, { shade: 'top' }); for (let i = 0; i < 4; i++) { const m = (i + aged) % 3 === 0 ? 'aged' : 'cheese'; p.ell(m, 3.5 + i * 7, 3.5, 3.4, 2.6); p.hline(1 + i * 7, 4, 6, 1); } return p.render(); });

// ---- Partículas (con tope) ----
const PT4 = [];
function spark(x, y, kind, n = 1) { for (let i = 0; i < n && PT4.length < 70; i++) { const a = Math.random() * Math.PI * 2, v = kind === 'chip' ? 0.04 + Math.random() * 0.05 : kind === 'dust' ? 0.008 : kind === 'smoke' ? 0.006 : 0.05; PT4.push({ x, y, vx: Math.cos(a) * v, vy: kind === 'chip' ? -0.06 - Math.random() * 0.05 : kind === 'smoke' ? -0.012 : Math.sin(a) * v, kind, t0: performance.now(), life: kind === 'chip' ? 650 : kind === 'dust' ? 520 : kind === 'smoke' ? 1500 : kind === 'glint' ? 700 : 220, c: kind === 'chip' ? (Z41.veinRevealed ? ['#9aa0b4', '#ffcf2e', '#c8ccd8'] : ['#9aa0b4', '#6a7088', '#c8ccd8'])[i % 3] : null, floor: y + 6 + Math.random() * 4 }); } }
function drawParticles(now, dt) {
  for (let i = PT4.length - 1; i >= 0; i--) {
    const p = PT4[i], a = (now - p.t0) / p.life; if (a >= 1) { PT4.splice(i, 1); continue; }
    if (p.kind === 'chip') { p.vy += 0.00028 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > p.floor) { p.y = p.floor; p.vy *= -0.35; p.vx *= 0.6; } R(p.x, p.y, a < 0.7 ? 2 : 1, a < 0.7 ? 2 : 1, p.c); }
    else if (p.kind === 'dust') { const r = Math.round(1 + a * 3); ctx.globalAlpha = 0.35 * (1 - a); disc(Math.round(p.x + p.vx * (now - p.t0)), Math.round(p.y - a * 4), r, '#d8ccb4'); ctx.globalAlpha = 1; }
    else if (p.kind === 'smoke') { p.x += 0.004 * dt; p.y += p.vy * dt; ctx.globalAlpha = 0.3 * (1 - a); disc(Math.round(p.x), Math.round(p.y), Math.round(1 + a * 3), '#8a8090'); ctx.globalAlpha = 1; }
    else if (p.kind === 'glint') { R(p.x, p.y, 1, 1, '#fff6b0'); if (a < 0.5) { R(p.x - 1, p.y, 3, 1, '#ffd860'); R(p.x, p.y - 1, 1, 3, '#ffd860'); } }
    else { p.x += p.vx * dt; p.y += p.vy * dt; R(p.x, p.y, 1, 1, a < 0.5 ? '#fff2b0' : '#ff9a2e'); }
  }
}
// ---- Sonido (sintetizado; tras el primer toque; con interruptor) ----
let AC = null, NB = null;
function audio() { if (!SOUND_NEW) return null; try { AC ||= new (window.AudioContext || window.webkitAudioContext)(); if (!NB) { NB = AC.createBuffer(1, AC.sampleRate * 0.2, AC.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return AC; } catch (e) { return null; } }
function thunk(pitch = 1, crit = false, soft = false) {
  const a = audio(); if (!a) return; const t = a.currentTime, vol = soft ? 0.1 : 0.32;
  const n = a.createBufferSource(); n.buffer = NB; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100 * pitch; const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08); n.connect(f).connect(g).connect(a.destination); n.start(t); n.stop(t + 0.09);
  const o = a.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(150 * pitch, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.09); const g2 = a.createGain(); g2.gain.setValueAtTime(vol * 0.9, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1); o.connect(g2).connect(a.destination); o.start(t); o.stop(t + 0.11);
  if (crit) { const o2 = a.createOscillator(); o2.type = 'square'; o2.frequency.setValueAtTime(1320, t); o2.frequency.exponentialRampToValueAtTime(990, t + 0.12); const g3 = a.createGain(); g3.gain.setValueAtTime(0.06, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o2.connect(g3).connect(a.destination); o2.start(t); o2.stop(t + 0.15); }
}
function chime() { const a = audio(); if (!a) return; const t = a.currentTime; [784, 988, 1319].forEach((fq, i) => { const o = a.createOscillator(); o.type = 'triangle'; o.frequency.value = fq; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.07 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.25); o.connect(g).connect(a.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.3); }); }
function denied() { const a = audio(); if (!a) return; const t = a.currentTime, o = a.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.12); const g = a.createGain(); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.15); }

// ---------- RATONES VIVOS V4.1 ----------
// Cada oficio hace lo que su máquina pide en ese momento (los estados reales de la simulación espejo):
//  · Minero: con la roca buscando, pica a su ritmo real (el impacto es el golpe del juego: el pico sube cuando su contador va a
//    llegar y cae justo en el golpe). Con la veta abierta deja de picar (el juego no le deja) y mira cómo trabaja la perforadora.
//  · Perforador: con un ciclo en marcha, maneja el cuadro (tira de la palanca al arrancar y al acelerar) y a veces mira la broca;
//    sin veta, espera y se asoma a ver cómo va el minero.
//  · Refinador: con un ciclo en marcha, aviva el horno, gira la válvula y mira el manómetro; sin Raw, espera mirando la tolva.
//  · Quesera: con una hornada en marcha, aprieta la prensa, remueve la cuba o consulta el recetario; al acabar una hornada lleva la
//    rueda al montacargas; sin Base, espera junto a la cuba.
// Transiciones: anticipación antes de reaccionar, un instante quieto antes de darse la vuelta, andar que acelera y frena, y las
// reacciones pausan el trabajo (no lo reinician). Solo poses aprobadas de MICE; el pico y la rueda en la pata son piezas aparte
// (pendientes de aprobación).
const BR = {};
const seedOf = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
function rnd(b) { b.seed = (Math.imul(b.seed, 1664525) + 1013904223) >>> 0; return b.seed / 4294967296; }
const between = (b, a, c) => a + rnd(b) * (c - a);
function wpick(b, list) { const tot = list.reduce((s, x) => s + x[1], 0); let r = rnd(b) * tot; for (const [k, w] of list) { if ((r -= w) <= 0) return k; } return list[0][0]; }
function brainsReset() { for (const k of Object.keys(BR)) delete BR[k]; }
let MINERX = null;
// El sitio del minero: la parte más llana de la cresta, para que pise de verdad (se mide en el sprite).
function minerSpot(g) { if (MINERX !== null) return g.rx + MINERX; const src = ROCKC[0]; if (!TOPS[src] && !im(src).complete) return g.rx + 8; let best = g.rx + 8, bs = 99; for (let x = g.rx + 2; x <= g.rx + 12; x++) { const v = []; for (let c = x - g.rx + 7; c <= x - g.rx + 14; c++) v.push(rockTop(src, c)); const sl = Math.max(...v) - Math.min(...v) + Math.min(...v) * 0.2; if (sl < bs) { bs = sl; best = x; } } MINERX = best - g.rx; return best; }
function brain(who, g) {
  if (!BR[who]) { const c = CREW.cheddar[who]; BR[who] = { who, m: c, seed: seedOf(c.name), x: who === 'miner' ? minerSpot(g) : g.who[who][0], v: 0, tx: null, flip: who === 'refiner', want: null, turnAt: 0, act: 'idle', on: true, ta: 0, until: 0, react: null, log: [], blinkAt: 0, pulseAt: -1e9, said: {}, newWheel: 0, hitAt: -1e9, gap: 0, o: g.o }; }
  return BR[who];
}
function react(who, kind, delay = 0) { const b = BR[who]; if (!b) return; const now = performance.now() + delay; if (b.react && now - b.react.t0 < 500) return; b.react = { kind, t0: now }; b.log.push(['react:' + kind, now]); if (b.on && b.until !== Infinity) b.until += 1000; }
// Qué toca hacer ahora, según el estado real de su puesto.
function planOf(b, g) {
  const o = g.o, last = b.act;
  const pick = (L) => wpick(b, L.filter(([k]) => k !== last || k === 'work' || k === 'operate' || k === 'press' || k === 'wait'));
  if (b.who === 'miner') { if (!Z41.veinRevealed) return { act: 'work', tx: minerSpot(g), face: false, dur: Infinity }; const a = pick([['watch', 3], ['inspect', 2]]); return { act: a, tx: minerSpot(g), face: false, dur: between(b, 1800, 3000) }; }
  if (b.who === 'driller') {
    if (running() || Z41.veinRevealed) { const a = pick([['operate', 5], ['check', 1.4]]); return a === 'check' ? { act: a, tx: o + 52, face: false, dur: between(b, 1300, 1900) } : { act: a, tx: o + 70, face: false, dur: between(b, 2600, 4200) }; }
    const a = pick([['wait', 4], ['peek', 2]]); return a === 'peek' ? { act: a, tx: o + 50, face: true, dur: between(b, 1300, 1900) } : { act: a, tx: o + 66 + Math.round(rnd(b) * 4), face: false, dur: between(b, 1600, 2600) };
  }
  if (b.who === 'refiner') {
    if (!refining() && SIM41.refStatus() === 'no-raw') return { act: 'wait', tx: o + 8, face: false, dur: between(b, 1800, 2600) };
    const a = pick([['stoke', 4], ['gauge', 2], ['valve', 1.5]]), T = { stoke: [o + 4, true], gauge: [o + 6, false], valve: [o + 2, false] }[a]; return { act: a, tx: T[0], face: T[1], dur: between(b, 1400, 2400) };
  }
  if (b.newWheel > 0) return { act: 'carry', tx: o + 122, face: false, dur: 500 };
  if (!pressing() && SIM41.cookStatus() === 'no-base') return { act: 'wait', tx: o + 100, face: false, dur: between(b, 1800, 2600) };
  const a = pick([['press', 4], ['stir', 2], ['book', 1], ['inspect', 1.2]]); return { act: a, tx: { press: o + 97, stir: o + 100, book: o + 99, inspect: o + 106 }[a], face: false, dur: between(b, 1500, 2600) };
}
// ¿Sigue teniendo sentido lo que hace? Si no, acaba (con su pausa de transición), sin cortar un golpe a medias.
function stillValid(b, now) {
  if (b.who === 'miner') return b.act === 'work' ? !Z41.veinRevealed : Z41.veinRevealed || now - b.ta < 300;
  if (b.who === 'driller') return (b.act === 'wait' || b.act === 'peek') ? !Z41.veinRevealed : true;
  if (b.who === 'refiner') return b.act === 'wait' ? !refining() && SIM41.refStatus() === 'no-raw' : refining() || SIM41.refStatus() !== 'no-raw';
  if (b.who === 'cook') return b.act === 'carry' ? true : b.act === 'wait' ? !pressing() && SIM41.cookStatus() === 'no-base' && !b.newWheel : !b.newWheel && (pressing() || SIM41.cookStatus() !== 'no-base');
  return true;
}
// Los eventos que les llegan: reaccionan o marcan el pulso de la palanca.
on41((e) => {
  const now = e.t;
  if (e.type === 'hit' && e.source === 'worker' && BR.miner) BR.miner.hitAt = now;
  if (e.type === 'reveal') { react('miner', 'vein', 180); if (BR.driller) { react('driller', 'vein'); BR.driller.hurry = true; BR.driller.until = Math.min(BR.driller.until, now + 1000); } }
  if (e.type === 'deeper' && BR.miner) { react('miner', 'deeper'); }
  if ((e.type === 'drillStart' || e.type === 'drillBoost') && BR.driller) BR.driller.pulseAt = now;
  if (e.type === 'drillDone' && BR.driller && BR.driller.act === 'operate') BR.driller.glanceAt = now;
  if (e.type === 'refineStart' && BR.refiner) BR.refiner.pulseAt = now;
});
function poseOf(b, now, dt, g) {
  // Reacción en curso: anticipación, salto, aterrizaje y la cara; el trabajo queda en pausa.
  if (b.react && now >= b.react.t0) { const r = now - b.react.t0, k = b.react.kind; if (r < 1000) { const dy = r < 80 ? 1 : r < 200 ? -2 : r < 300 ? -1 : r < 380 ? 1 : 0, face = k === 'stop' ? 'down' : k === 'vein' ? (r < 550 ? 'wow' : 'happy') : k === 'deeper' ? 'wow' : 'happy'; return { x: b.x, flip: k === 'greet' ? false : b.flip, o: { face, tail: k !== 'stop', spark: k === 'upgrade' && r > 200 && r < 900 }, dy: k === 'deeper' ? (r < 120 ? 1 : 0) : dy, pick: b.who === 'miner' && !Z41.veinRevealed ? 1 : undefined }; } b.react = null; }
  // Andar: acelera, frena al llegar y las patas van con la distancia recorrida.
  if (b.tx != null && Math.abs(b.x - b.tx) > 0.4) {
    const d = b.tx - b.x, s = Math.sign(d), vmax = b.hurry ? 0.034 : 0.018; b.v = Math.min(vmax, b.v + 0.00012 * dt); const v = Math.min(b.v, Math.max(0.006, Math.abs(d) * 0.01));
    if (s < 0 !== b.flip && now - b.turnAt > 90) { b.turnAt = now; b.flip = s < 0; return { x: b.x, flip: b.flip, o: {}, dy: 0 }; }
    b.x += s * Math.min(v * dt, Math.abs(d)); b.walked = (b.walked || 0) + v * dt;
    return { x: b.x, flip: b.flip, o: { legs: Math.floor(b.walked / 3) % 2 ? 'a' : 'b' }, dy: 0, pick: b.who === 'miner' && b.act === 'work' ? 1 : undefined, carry: b.act === 'carry' && b.newWheel ? 'w' : null };
  }
  b.v = 0;
  if (!b.on) { b.on = true; b.hurry = false; b.ta = now; b.until = now + b.dur; }
  // Darse la vuelta: un instante quieto y de frente a lo que va a hacer.
  if (b.face !== null && b.face !== undefined && b.face !== b.flip) { if (!b.turnAt || now - b.turnAt > 120) { b.turnAt = now; return { x: b.x, flip: b.flip, o: {}, dy: 0 }; } b.flip = b.face; }
  const lt = now - b.ta, k = b.act, flip = b.flip;
  if (k === 'work') {
    // El pico sube cuando el contador del minero va a llegar y cae en el golpe real.
    const left = EX.minerMs - Z41.minerAcc, since = now - b.hitAt;
    if (since < 170) return { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 };
    if (left < 380 && !Z41.veinRevealed) return { x: b.x, flip: false, o: {}, dy: left < 120 ? -1 : 0, pick: 0 };
    return { x: b.x, flip: false, o: {}, dy: 0, pick: 1 };
  }
  if (k === 'watch') return { x: b.x, flip: false, o: { face: lt < 1200 ? 'happy' : undefined, tail: lt < 1200 }, dy: 0 };
  if (k === 'inspect' || k === 'check' || k === 'gauge') return { x: b.x, flip, o: { glass: true }, dy: 0 };
  if (k === 'peek') return { x: b.x, flip: true, o: { glass: true }, dy: 0 };
  if (k === 'operate') { const pulse = now - b.pulseAt < 140 ? 1 : 0, glance = b.glanceAt && now - b.glanceAt < 300; return { x: b.x, flip: glance ? true : false, o: {}, dy: pulse }; }
  if (k === 'wait') {
    const say = { driller: ['No vein yet', 4000], refiner: ['Need Raw!', 2000], cook: ['Need Base!', 2000] }[b.who];
    if (say && now - (b.waitFrom || now) > say[1] && !b.said[b.episode]) { b.said[b.episode] = true; sayB(b, say[0], now); }
    return { x: b.x, flip, o: b.who === 'driller' ? { legs: lt % 1400 < 700 ? 'tap' : undefined, face: lt < 900 ? 'grump' : undefined } : { face: 'down', ear: b.who === 'refiner', legs: lt % 1600 < 800 ? 'tap' : undefined }, dy: 0 };
  }
  if (k === 'stoke' || k === 'valve') { const p = now - b.pulseAt < 140 ? 1 : Math.floor(lt / 300) % 2; return { x: b.x, flip, o: k === 'stoke' ? { ear: true } : {}, dy: p }; }
  if (k === 'press') return { x: b.x, flip: false, o: {}, dy: Math.floor(prog(Z41.cookJob) * 12) % 2 };
  if (k === 'stir') return { x: b.x, flip: false, o: {}, dy: Math.floor(lt / 260) % 2 };
  if (k === 'book') return { x: b.x, flip: false, o: { book: Math.floor(lt / 700) % 2 ? 2 : 1 }, dy: 0 };
  if (k === 'carry') { if (b.newWheel) { b.newWheel--; LIFT.queue++; b.log.push(['place', now]); } return { x: b.x, flip: false, o: { tail: true }, dy: lt < 160 ? -1 : 0 }; }
  return { x: b.x, flip, o: {}, dy: 0 };
}
// Un bocadillo a la vez para toda la colonia, y como mucho uno cada 5 s.
const BUB = { who: null, text: '', t0: -1e9, until: 0 };
function sayB(b, text, now) { if (now - BUB.t0 < 5000) return; Object.assign(BUB, { who: b.who, text, t0: now, until: now + 2200 }); }
let LASTT = 0;
function drawWorkers(st, g, now) {
  const dt = Math.min(64, now - (LASTT || now)); LASTT = now;
  for (const who of ['refiner', 'cook', 'driller', 'miner']) {
    if (!P41[who]) continue;
    const b = brain(who, g);
    // Si cambia la geometría (otro ancho de pantalla u otra densidad), el ratón se queda en el mismo sitio de su suelo.
    if (b.o !== g.o) { const d = g.o - b.o; b.x += d; if (b.tx != null) b.tx += d; b.o = g.o; }
    if (now >= b.until || (b.on && !stillValid(b, now))) {
      if (!b.gap) b.gap = now + 140;
      if (now >= b.gap) { b.gap = 0; const p = planOf(b, g), W = g.walk[who]; if (p.act === 'wait' && b.act !== 'wait') { b.episode = (b.episode || 0) + 1; b.waitFrom = now; } Object.assign(b, { act: p.act, tx: Math.max(W[0], Math.min(W[1], p.tx)), face: p.face, dur: p.dur, on: false, until: Infinity }); b.log.push([p.act, now]); }
    }
    const strike = who === 'miner' && now - b.hitAt < 170, p = strike ? { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 } : b.gap ? { x: b.x, flip: b.flip, o: {}, dy: 0, pick: who === 'miner' && !Z41.veinRevealed ? 1 : undefined } : poseOf(b, now, dt, g);
    const x = Math.round(p.x), feet = who === 'miner' ? minerFeet(g, x) : g.who[who][1];
    if (!b.blinkAt || now > b.blinkAt + 120) b.blinkAt = now + 2200 + rnd(b) * 2400;
    const blink = now > b.blinkAt && now < b.blinkAt + 110, breath = Math.floor((now + (b.seed % 1300)) / (620 + (b.seed % 200))) % 2;
    const c = mF(b.m, p.o.legs ? 0 : breath, blink, p.o);
    if (p.flip) { ctx.save(); ctx.translate(x + 22, feet - 20 + p.dy); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore(); } else ctx.drawImage(c, x, feet - 20 + p.dy);
    if (p.pick !== undefined && p.pick >= 0) ctx.drawImage(artPick(p.pick), x + 9, feet - 21 + p.dy);
    if (p.carry) ctx.drawImage(artCarry(p.carry), p.flip ? x - 1 : x + 15, feet - 13 + p.dy);
    b.px = x; b.py = feet; b.pose = p;
    HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: g.who[who][2], who, name: b.m.name, x, y: feet - 20, w: 22, h: 20, crest: who === 'miner' });
  }
}
