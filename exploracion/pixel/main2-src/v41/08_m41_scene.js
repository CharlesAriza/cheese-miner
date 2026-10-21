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
