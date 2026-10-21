// ---------- CHEDDAR PILOTO: terreno, máquinas, roca, partículas, sonido y ratones vivos ----------
const RK = MAT.rock, LG = MAT.ledge;
// Simulación de presentación (rotulada en pantalla cuando se fuerza un estado): una veta se abre tras unos golpes, la
// perforadora la vacía, el Raw sube a la refinería y la Base pasa a la quesería. No es la economía del juego.
const M = { phase: 'search', hits: 0, need: 12, vein: 0, veinMs: 10000, raw: 6, base: 4, tray: 2, refT: 0, chT: 0, rawT: 0, cycles: 0 };
const SIM = { state: 'normal', label: '' };
const SIMS = { normal: '', novein: 'DRILL sin veta', noraw: 'REFINE sin Raw', nobase: 'CHEESE sin Base' };
// ---- Terreno de Cheddar (se pinta una vez por pantalla y tramo de profundidad) ----
// Piedras: manchas irregulares con canto claro arriba y sombra abajo (se lee como roca, no como tablones).
function stones(x0, y0, w, h, seed, P) { for (let i = 0; i < (w * h) / 34; i++) { const x = x0 + Math.floor(hash4(i, seed, 1) * w), y = y0 + Math.floor(hash4(i, seed, 2) * h), r = 1 + Math.floor(hash4(i, seed, 3) * 3), q = hash4(i, seed, 5); if (r === 1) { R(x, y, q < 0.5 ? 2 : 1, 1, P[q < 0.3 ? 0 : 2]); continue; } for (let k = -r; k <= r; k++) { const ww = Math.round(Math.sqrt(r * r - k * k) * (0.95 + q * 0.35)); R(x - ww, y + k, ww * 2 + 1, 1, P[1]); } R(x - r, y - r + 1, r + 1, 1, P[2]); R(x - r - 1, y, 1, 1, P[2]); R(x + 1, y + r, r + 1, 1, P[0]); R(x + r + 1, y + 1, 1, r - 1 || 1, P[0]); } }
function texture(x0, y0, w, h, P, seed, dens = 0.08) { for (let y = y0; y < y0 + h; y += 2) for (let x = x0; x < x0 + w; x += 2) { const v = hash4(x, y, seed); if (v < dens) R(x, y, 2, 1, P[0]); else if (v > 1 - dens / 3) { R(x, y, 2, 1, P[3]); R(x, y + 1, 2, 1, P[1]); } } }
function cliff(x0, x1, y0, y1, seed) { R(x0, y0, x1 - x0, y1 - y0, RK[2]); patches(x0, y0, x1 - x0, y1 - y0, seed); stones(x0, y0, x1 - x0, y1 - y0, seed, [RK[1], RK[2], RK[3]]); cracks(x0, y0, x1 - x0, y1 - y0, seed, RK[0]); }
// Manchas grandes de luz y sombra (la roca no es de un solo tono) y grietas que bajan en zigzag.
function patches(x0, y0, w, h, seed) { for (let y = y0; y < y0 + h; y += 6) for (let x = x0; x < x0 + w; x += 6) { const v = hash4(Math.floor(x / 6), Math.floor(y / 6), seed + 50); if (v < 0.25) { ctx.globalAlpha = 0.12; R(x, y, 6, 6, '#000'); ctx.globalAlpha = 1; } else if (v > 0.85) { ctx.globalAlpha = 0.06; R(x, y, 6, 6, '#ffe0b0'); ctx.globalAlpha = 1; } } }
function cracks(x0, y0, w, h, seed, c) { for (let i = 0; i < (w * h) / 900; i++) { let x = x0 + Math.floor(hash4(i, seed, 7) * w), y = y0 + Math.floor(hash4(i, seed, 8) * h); const L = 5 + Math.floor(hash4(i, seed, 9) * 9); for (let k = 0; k < L && y < y0 + h; k++) { R(x, y, 1, 1, c); y++; if (hash4(i, k, seed) < 0.4) x += hash4(k, i, seed) < 0.5 ? -1 : 1; } } }
function ledgeTop(x0, x1, y, D, seed) { const rows = [LG[3], LG[3], LG[2], LG[2], LG[2], LG[1]]; for (let k = 0; k < D; k++) R(x0, y + k, x1 - x0, 1, rows[Math.min(5, Math.floor((k / D) * 6))]); texture(x0, y + 1, x1 - x0, D - 4, LG, seed, 0.06); R(x0, y, x1 - x0, 1, LG[4]); R(x0, y + D - 3, x1 - x0, 2, MAT.wood[2]); R(x0, y + D - 3, x1 - x0, 1, MAT.wood[3]); R(x0, y + D - 1, x1 - x0, 1, MAT.wood[1]); for (let x = x0 + 3; x < x1; x += 9) R(x, y + D - 2, 1, 1, MAT.iron[3]); }
function faceDown(x0, x1, y0, y1, seed) { cliff(x0, x1, y0, y1, seed); ctx.globalAlpha = 0.5; R(x0, y0, x1 - x0, 2, '#000'); ctx.globalAlpha = 0.25; R(x0, y0 + 2, x1 - x0, 3, '#000'); ctx.globalAlpha = 1; }
function post(x, y0, y1) { R(x - 1, y0, 4, y1 - y0, INK4); R(x, y0, 2, y1 - y0, MAT.wood2[2]); R(x, y0, 1, y1 - y0, MAT.wood2[3]); }
function lanternPost(x, base, h, glowR = 18) { glow(x + 3, base - h - 4, '#ffcf7a', glowR); post(x + 2, base - h, base); ctx.drawImage(artLantern(), x, base - h - 9); }
function paintCheddar(st) {
  const g = geoC(st), { t, o, TL, TR, DK, FF, n, X0, X1 } = g, W = Math.ceil(SC.worldW), H = st.h;
  // Pared del fondo de la caverna: roca oscura con estratos y vetas de queso.
  R(0, t, W, H, '#2e2016'); stones(0, t, W, H, 7, ['#24180f', '#382819', '#463220']);
  patches(0, t, W, H, 9); cracks(0, t, W, H, 9, '#1a110a');
  for (let i = 0; i < 10; i++) { const x = Math.floor(hash4(i, 3) * W), y = t + 16 + Math.floor(hash4(i, 5) * (FF - t - 26)); for (let k = 0; k < 7; k++) R(x + k, y + Math.round(Math.sin(k * 0.9 + i)), 1, 1, MAT.cheese[k % 3 ? 1 : 2]); R(x + 3, y, 1, 1, MAT.cheese[4]); }
  // Techo con estalactitas y raíces.
  for (let x = 0; x < W; x++) { const h = 6 + jag(x, 11, 3); R(x, t, 1, h, RK[2]); R(x, t + h, 1, 1, RK[0]); if (hash4(x, 1) < 0.3) R(x, t + 1, 1, 1, RK[3]); }
  for (let x = 4; x < W; x += 11) { const L = 4 + Math.floor(hash4(x, 9) * 6); for (let i = 0; i < L; i++) { const w = i < L - 2 ? 2 : 1; R(x - 1, t + 7 + i, w + 2, 1, INK4); R(x, t + 7 + i, w, 1, i < L - 3 ? RK[2] : RK[3]); } }
  for (const x of [o + 60, o + 84, o + 122]) for (let i = 0; i < 9; i++) R(x + Math.round(Math.sin(i * 0.7 + x) * 1.2), t + 8 + i, 1, 1, MAT.wood2[1]);
  // Terraza de la refinería (alta, izquierda) y de la quesería (más baja, derecha), con sus frentes y entibado.
  cliff(0, o + 48, t + 8, TL, 3); ledgeTop(0, o + 48, TL, 14, 4); faceDown(0, o + 46, TL + 14, FF, 5);
  for (const x of [o + 20, o + 40]) { post(x, TL + 14, FF); } for (let k = 0; k < 12; k++) R(o + 21 + k + 2, TL + 15 + k, 1, 1, MAT.wood2[1]);
  cliff(o + 98, W, t + 8, TR, 13); ledgeTop(o + 98, W, TR, 14, 14); faceDown(o + 100, W, TR + 14, FF, 15);
  // Boca de la cueva de la quesería.
  for (let y = t + 28; y < TR; y++) { const u = Math.min(1, (y - t - 28) / 9), w = Math.round(32 * (0.5 + 0.5 * Math.sqrt(u))), xx = o + 102 + ((32 - w) >> 1); R(xx - 1, y, w + 2, 1, INK4); R(xx, y, w, 1, MAT.soot[2]); }
  ctx.save(); ctx.beginPath(); ctx.rect(o + 102, t + 28, 32, TR - t - 28); ctx.clip(); glow(o + 118, t + 38, '#ffcf7a', 16); ctx.restore();
  // Escalera de la terraza alta al suelo (peldaños de madera y cuerda) y escala de la corta a la terraza de la quesería.
  for (let i = 0, y = TL + 16; y < FF - 2; i++, y += 6) { const sx = o + 2 + (i % 2 ? 6 : 0); R(sx - 1, y - 1, 14, 5, INK4); R(sx, y, 12, 2, MAT.wood[3]); R(sx, y + 2, 12, 2, MAT.wood[1]); }
  for (let y = TL + 14; y < FF; y += 2) R(o + 1 + (Math.floor((y - TL) / 12) % 2 ? 0 : 0), y, 1, 1, MAT.rope[2]);
  // Suelo de la caverna (tierra apisonada en perspectiva) y su frente.
  ledgeTop(0, W, FF, 16, 21); R(0, FF + 16, W, H - (FF - t) - 16, RK[1]); texture(0, FF + 16, W, H - (FF - t) - 16, RK, 22); R(0, FF + 16, W, 1, RK[3]);
  // La corta: un banco por tramo de profundidad; cada uno, más estrecho, más oscuro y con más veta; cristales desde el tramo 3.
  const SL = ['#7a5a3a', '#6a4c30', '#5c4028', '#4e3622', '#402c1c', '#34241a'];
  if (n) R(X0, FF + 1, X1 - X0, H - (FF - t) - 1, MAT.soot[2]);
  for (let k = 0; k < n; k++) {
    const y = FF + 2 + k * 4, a = X0 + k * 3, b = X1 - k * 3;
    R(a, y, b - a, 4, MAT.soot[3]); R(a, y, 3, H - (y - t), SL[k]); R(b - 3, y, 3, H - (y - t), SL[k]); R(a, y, 3, 1, LG[3]); R(b - 3, y, 3, 1, LG[3]);
    R(a + 3, y + 3, b - a - 6, 1, SL[k]);
    if (k >= 1) { R(a + 1, y + 1, 1, 3, MAT.wood2[2]); R(b - 2, y + 1, 1, 3, MAT.wood2[2]); }
    if (k >= 2) for (let x = a + 6; x < b - 6; x += 9) R(x, y + 3, 3, 1, MAT.cheese[1]);
    if (k >= 3) for (const x of [a + 1, b - 2]) { R(x, y + 1, 1, 2, MAT.cheese[4]); glow(x, y + 2, '#ffcf5a', 4); }
  }
  const fx0 = X0 + n * 3, fx1 = X1 - n * 3, fy = FF + 4 + n * 4; if (n) for (let k = 0; k < 4; k++) R(fx0, fy + k, fx1 - fx0, 1, [LG[2], LG[2], LG[1], LG[1]][k]); if (n) R(fx0, fy + 4, fx1 - fx0, H - (fy - t) - 4, SL[Math.min(5, n)]); else { ctx.globalAlpha = 0.25; R(X0 + 8, FF + 5, X1 - X0 - 16, 6, '#000'); ctx.globalAlpha = 1; }
  ctx.globalAlpha = 0.06 * n; R(X0, FF + 2, X1 - X0, H - (FF - t) - 2, '#000'); ctx.globalAlpha = 1;
  for (let i = 0; i < 10; i++) { const x = X0 - 4 + Math.floor(hash4(i, 41) * (X1 - X0 + 8)); if (x > X0 + 2 && x < X1 - 2) continue; R(x, FF + 3 + (i % 3), 2, 1, RK[3]); R(x, FF + 4 + (i % 3), 2, 1, RK[0]); }
  // Escala de la corta a la terraza de la quesería.
  for (let y = TR + 14; y < FF + 10; y += 4) R(o + 109, y, 6, 1, MAT.wood[3]); R(o + 108, TR + 14, 1, FF + 10 - TR - 14, MAT.wood[1]); R(o + 115, TR + 14, 1, FF + 10 - TR - 14, MAT.wood[1]);
  // Escombrera: crece con la profundidad.
  const hh = 2 + n * 3; for (let k = 0; k < hh; k++) { const w = Math.round(22 * (1 - k / (hh + 2))); R(o + 124 - (w >> 1), FF + 7 - k, w, 1, k % 3 ? RK[2] : RK[3]); }
  // Elevador de cangilones (fijo): carriles, polea de arriba y canaleta hasta la tolva del alambique.
  for (const x of [o + 43, o + 49]) { R(x - 1, t + 12, 3, DK + 6 - t - 12, INK4); R(x, t + 12, 1, DK + 6 - t - 12, MAT.iron[2]); }
  ctx.drawImage(artWheel(0), o + 41, t + 8);
  for (let i = 0; i < 16; i++) { const x = o + 42 - i, y = t + 15 + Math.round(i * 0.45); R(x, y, 1, 3, INK4); R(x, y + 1, 1, 1, MAT.iron[3]); }
  // Chimenea del horno hasta el techo.
  R(o - 1, t + 7, 5, TL - 26 - t - 7, INK4); R(o, t + 7, 3, TL - 26 - t - 7, MAT.iron[1]); R(o, t + 7, 1, TL - 26 - t - 7, MAT.iron[2]);
  // Tubo de la Base: de la bandeja, por debajo del pórtico, hasta la cuba.
  pipePath(BASEP(g));
  // Faroles, cajas de Raw y barriles.
  lanternPost(o + 0, FF + 10, 14);
  for (const [x, y] of [[o + 15, FF + 1], [o + 18, FF - 6]]) ctx.drawImage(im(SPR.crate), x, y);
  // Farol colgado del pórtico, sobre la corta.
  R(o + 93, DK + 14, 1, 6, INK4); glow(o + 94, DK + 26, '#ffcf7a', 18); ctx.drawImage(artLantern(), o + 91, DK + 20);
  // Montacargas: cables y rellanos.
  R(o + 135, t, 1, H, '#8a8496'); R(o + 142, t, 1, H, '#8a8496'); for (const fy2 of [TR, FF]) { R(o + 132, fy2 + 2, 12, 2, MAT.iron[1]); R(o + 132, fy2 + 2, 12, 1, MAT.iron[3]); }
  blendBand(0, t + H - 6, W, 6, TH.gouda.far);
}
// ---- Lo que se mueve en Cheddar ----
const WHITE = {};
function whiteOf4(src) { if (WHITE[src]) return WHITE[src]; const i = im(src); if (!i.complete || !i.width) return null; const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); return (WHITE[src] = c); }
function rockSrc() { if (M.phase === 'vein') return ROCKV[Math.max(0, Math.min(4, Math.ceil(M.vein * 5) - 1))]; return ROCKC[Math.min(4, Math.floor((M.hits / M.need) * 5))]; }
function fire(x, y, w, h, now, power) { const f = Math.floor(now / 110) % 3; for (let i = 0; i < w; i++) { const hh = Math.max(1, Math.round(h * power * (0.45 + 0.55 * hash4(i, f, 3)))); for (let k = 0; k < hh; k++) R(x + i, y + h - 1 - k, 1, 1, MAT.fire[Math.min(4, Math.floor(((hh - k) / hh) * 3.2) + (power > 0.8 ? 1 : 0))]); } }
MAT.fire = ['#7a1a08', '#c83a10', '#ff7a1e', '#ffc040', '#fff2b0'];
const running = () => M.phase === 'vein' && SIM.state !== 'novein';
const refining = () => M.raw > 0 && SIM.state !== 'noraw';
const pressing = () => M.base > 0 && SIM.state !== 'nobase';
function drawCheddar(st, now) {
  baked(st, paintCheddar);
  const g = geoC(st), { t, o, TL, TR, DK, FF, rx, rb } = g;
  // Refinería.
  const pw = refining() ? 0.75 + 0.25 * Math.sin(now / 160) + (BR.refiner && BR.refiner.act === 'stoke' && BR.refiner.arrived ? 0.3 : 0) : 0.25;
  ctx.drawImage(artFurnace(), o - 14, TL - 28); fire(o - 4, TL - 9, 10, 12, now, Math.min(1, pw)); glow(o + 1, TL - 2, '#ff8a2e', Math.round(10 + 6 * pw));
  ctx.drawImage(artStill(), o + 14, TL - 24);
  { const a = (refining() ? -0.6 + Math.sin(now / 700) * 0.5 : 1.2); R(o + 27 + Math.round(Math.cos(a) * 1.4), TL - 6 + Math.round(Math.sin(a) * 1.4), 1, 1, INK4); R(o + 27, TL - 6, 1, 1, INK4); }
  ctx.drawImage(artTray(), o + 33, TL + 4); for (let i = 0; i < Math.min(3, M.tray); i++) ctx.drawImage(artBar(), o + 34 + i * 4, TL + 3);
  if (refining() && now % 1400 < 900) { const d = Math.floor((now % 1400) / 150); R(o + 40, TL + 5 - 8 + d, 1, 1, MAT.cream[3]); }
  // Elevador: cangilones que suben; llevan Raw mientras la perforadora trabaja.
  for (let k = 0; k < 5; k++) { const y = Math.round(DK + 2 - (((now / 40) + k * 9) % (DK - t - 12))); R(o + 44, y, 5, 3, INK4); R(o + 45, y, 3, 2, MAT.iron[2]); if (running() && k % 2 === 0) R(o + 45, y - 1, 3, 1, MAT.raw[2]); }
  // Perforadora: pórtico, máquina, volante, cuadro de mando y barra hasta la veta.
  ctx.drawImage(artGantry(52), o + 48, DK);
  const run = running(), jit = run && Math.floor(now / 60) % 2 ? 1 : 0;
  S.ext = Math.max(0, Math.min(1, (S.ext || 0) + (run ? 1 : -1) * Math.min(64, now - (S.extT || now)) / 600)); S.extT = now;
  const sx = o + 73, rest = DK + 18, tipY = Math.round(rest + (rb - 22 - rest) * (S.ext * S.ext * (3 - 2 * S.ext)));
  ctx.drawImage(artDrill(), o + 58, DK - 29 + jit); R(o + 72, DK - 34 + jit, 1, 6, INK4); ctx.drawImage(artWheel(run ? Math.floor(now / 80) % 3 : 0), o + 66, DK - 44 + jit); ctx.drawImage(artPanel(), o + 98, DK - 12);
  if (run && now % 900 < 60) spark(o + 82, DK - 30, 'smoke');
  R(o + 100, DK - 8, 2, 2, run ? '#62d36e' : now % 900 < 450 ? '#ff5a3c' : '#5a1a10');
  { const a = run ? -0.4 + Math.sin(now / 300) * 0.6 : 1.4; R(o + 102 + Math.round(Math.cos(a) * 1.5), DK - 4 + Math.round(Math.sin(a) * 1.5), 1, 1, INK4); }
  // Quesería: toldo, marco con letrero, baldas en la cueva, cuba y prensa.
  ctx.drawImage(artShelfN(0), o + 105, TR - 27); ctx.drawImage(artVat(), o + 104, TR - 13);
  ctx.drawImage(artFrame(36), o + 98, TR - 33); ctx.drawImage(artAwning(40), o + 96, TR - 40);
  ctx.drawImage(artPress(pressing() && BR.cook && BR.cook.act === 'press' && BR.cook.arrived ? Math.floor(now / 300) % 2 : 0), o + 118, TR - 16);
  // La roca: sombra de contacto, golpe (sacudida y destello) y su estado (grietas o veta).
  ctx.globalAlpha = 0.45; R(rx + 6, rb, 44, 2, '#000'); R(rx + 10, rb + 2, 36, 1, '#000'); ctx.globalAlpha = 1;
  const j = S.jolt && now - S.jolt.t0 < 90 ? (now - S.jolt.t0 < 45 ? S.jolt.d : [-S.jolt.d[0], 0]) : [0, 0];
  const src = rockSrc(); sprite(src, 54, 0, rx + j[0], rb - 40 + j[1], 54, 42);
  if (S.flashT && now - S.flashT < 60) { const w = whiteOf4(src); if (w) { ctx.globalAlpha = 0.55; ctx.drawImage(w, rx + j[0], rb - 40 + j[1]); ctx.globalAlpha = 1; } }
  // La barra baja por delante de la roca hasta la veta (en su cara) y vuelve a subir cuando se vacía.
  R(sx - 2, DK + 4, 5, tipY - DK - 4, INK4); R(sx - 1, DK + 4, 3, tipY - DK - 4, MAT.steel[2]); R(sx - 1, DK + 4, 1, tipY - DK - 4, MAT.steel[3]);
  for (let y = DK + 5 + (run ? Math.floor(now / 50) % 4 : 0); y < tipY - 1; y += 4) R(sx - 1, y, 3, 1, MAT.steel[1]);
  ctx.drawImage(artBit(run ? Math.floor(now / 70) % 2 : 0), sx - 4, tipY - 2);
  if (run && S.ext > 0.95 && Math.floor(now / 90) % 3 === 0) spark(sx + (Math.random() < 0.5 ? -3 : 3), tipY + 5, 'spark');
  if (run && S.ext > 0.95) along([[sx, tipY], [sx, DK + 4]], now, 26, 2, rawDot);
  // Lo que circula: Raw por la canaleta, Base por el tubo, ruedas al montacargas.
  if (run) along([[o + 58, DK - 11], [o + 47, DK - 11]], now, 30, 1, rawDot);
  if (run) along([[o + 41, t + 15], [o + 27, t + 21]], now, 30, 1, rawDot);
  if (M.tray > 0 && refining()) along(BASEP(g), now, 30, 2, baseDot);
  if (pressing()) along([[o + 120, TR - 20], [o + 134, TR - 20]], now, 45, 1, wheel);
  liftCage(o + 134, t + 4, FF + 2, now, true);
  pushStations(st, g);
  if (S.focus && STOPS[S.stop] === st) for (const r of g.st[S.focus] || []) sel(r);
  drawWorkers(st, g, now);
  { const w = plaque(o + 8, FF - 13, DEP.cheddar, TH.cheddar); R(o + 13, FF - 4, 1, 12, MAT.wood2[2]); }
}
const artShelfN = (aged) => art('shelfN' + aged, () => { const p = Px(28, 8); p.rect('wood', 0, 6, 28, 2, { shade: 'top' }); for (let i = 0; i < 4; i++) { const m = (i + aged) % 3 === 0 ? 'aged' : 'cheese'; p.ell(m, 3.5 + i * 7, 3.5, 3.4, 2.6); p.hline(1 + i * 7, 4, 6, 1); } return p.render(); });

// ---- Partículas (con tope): trozos de roca, polvo, chispas, humo y brillos ----
const PT4 = [];
function spark(x, y, kind, n = 1) { for (let i = 0; i < n && PT4.length < 70; i++) { const a = Math.random() * Math.PI * 2, v = kind === 'chip' ? 0.04 + Math.random() * 0.05 : kind === 'dust' ? 0.008 : kind === 'smoke' ? 0.006 : 0.05; PT4.push({ x, y, vx: Math.cos(a) * v * (kind === 'chip' ? 1 : 1), vy: kind === 'chip' ? -0.06 - Math.random() * 0.05 : kind === 'smoke' ? -0.012 : Math.sin(a) * v, kind, t0: performance.now(), life: kind === 'chip' ? 650 : kind === 'dust' ? 520 : kind === 'smoke' ? 1500 : kind === 'glint' ? 700 : 220, c: kind === 'chip' ? (S.chipC || ['#9aa0b4', '#6a7088', '#c8ccd8'])[i % 3] : null, floor: y + 6 + Math.random() * 4 }); } }
function drawParticles(now, dt) {
  for (let i = PT4.length - 1; i >= 0; i--) {
    const p = PT4[i], a = (now - p.t0) / p.life; if (a >= 1) { PT4.splice(i, 1); continue; }
    if (p.kind === 'chip') { p.vy += 0.00028 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > p.floor) { p.y = p.floor; p.vy *= -0.35; p.vx *= 0.6; } R(p.x, p.y, a < 0.7 ? 2 : 1, a < 0.7 ? 2 : 1, p.c); }
    else if (p.kind === 'dust') { const r = Math.round(2 + a * 4); ctx.globalAlpha = 0.35 * (1 - a); disc(Math.round(p.x + p.vx * (now - p.t0)), Math.round(p.y - a * 4), r, '#d8ccb4'); ctx.globalAlpha = 1; }
    else if (p.kind === 'smoke') { p.x += 0.004 * dt; p.y += p.vy * dt; ctx.globalAlpha = 0.3 * (1 - a); disc(Math.round(p.x), Math.round(p.y), Math.round(1 + a * 3), '#8a8090'); ctx.globalAlpha = 1; }
    else if (p.kind === 'glint') { const s = a < 0.5 ? 1 : 0; R(p.x, p.y, 1, 1, '#fff6b0'); if (s) { R(p.x - 1, p.y, 3, 1, '#ffd860'); R(p.x, p.y - 1, 1, 3, '#ffd860'); } }
    else { p.x += p.vx * dt; p.y += p.vy * dt; R(p.x, p.y, 1, 1, a < 0.5 ? '#fff2b0' : '#ff9a2e'); }
  }
}
// ---- Sonido (sintetizado; solo tras el primer toque, y con interruptor) ----
let AC = null, NB = null;
function audio() { if (!SOUND) return null; try { AC ||= new (window.AudioContext || window.webkitAudioContext)(); if (!NB) { NB = AC.createBuffer(1, AC.sampleRate * 0.2, AC.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return AC; } catch (e) { return null; } }
function thunk(pitch = 1, crit = false, soft = false) {
  const a = audio(); if (!a) return; const t = a.currentTime, vol = soft ? 0.12 : 0.32;
  const n = a.createBufferSource(); n.buffer = NB; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100 * pitch; const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08); n.connect(f).connect(g).connect(a.destination); n.start(t); n.stop(t + 0.09);
  const o = a.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(150 * pitch, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.09); const g2 = a.createGain(); g2.gain.setValueAtTime(vol * 0.9, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1); o.connect(g2).connect(a.destination); o.start(t); o.stop(t + 0.11);
  if (crit) { const o2 = a.createOscillator(); o2.type = 'square'; o2.frequency.setValueAtTime(1320, t); o2.frequency.exponentialRampToValueAtTime(990, t + 0.12); const g3 = a.createGain(); g3.gain.setValueAtTime(0.06, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o2.connect(g3).connect(a.destination); o2.start(t); o2.stop(t + 0.15); }
}
function chime() { const a = audio(); if (!a) return; const t = a.currentTime; [784, 988, 1319].forEach((fq, i) => { const o = a.createOscillator(); o.type = 'triangle'; o.frequency.value = fq; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.07 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.25); o.connect(g).connect(a.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.3); }); }
// ---- Picar ----
// Un golpe: la roca se sacude 1 px y destella, saltan 3-5 trozos y una nube de polvo, suena un golpe seco; cada cinco golpes
// seguidos, un golpe crítico (más trozos, chispa y un «tink»). Con la veta abierta saltan además brillos de queso.
function mineHit(src, ax, ay) {
  const st = STOPS[1], g = geoC(st), now = performance.now();
  const x = ax ?? g.rx + 31, y = ay ?? g.rb - 30;
  let crit = false;
  if (src === 'player') { S.combo = now - S.lastHit <= 650 ? S.combo + 1 : 1; S.lastHit = now; crit = S.combo % 5 === 0; paintCombo(); S.acts++; LOG.push('act:rock:' + (S.via || 'button')); BR.miner && (BR.miner.strike = now); }
  S.jolt = { t0: now, d: crit ? [2, 1] : [1, 1] }; S.flashT = now;
  S.chipC = M.phase === 'vein' ? ['#9aa0b4', '#ffcf2e', '#c8ccd8'] : ['#9aa0b4', '#6a7088', '#c8ccd8'];
  spark(x, y, 'chip', crit ? 7 : src === 'player' ? 4 : 2); spark(x, y + 2, 'dust', src === 'player' ? 1 : 0);
  if (crit) { spark(x, y - 2, 'spark', 5); spark(x, y - 4, 'glint', 2); }
  if (M.phase === 'vein') spark(x + 2, y - 3, 'glint', 1);
  if (src === 'player') thunk(0.9 + Math.random() * 0.25, crit); else if (STOPS[S.stop].id === 'cheddar' && S.focus === 'rock') thunk(0.8, false, true);
  if (M.phase === 'search') { M.hits = Math.min(M.need, M.hits + (crit ? 2 : 1)); if (SIM.state === 'novein') M.hits = Math.min(M.hits, M.need - 1); if (M.hits >= M.need) openVein(); }
  updateDock();
}
function openVein() { const g = geoC(STOPS[1]), now = performance.now(); M.phase = 'vein'; M.vein = 1; M.hits = 0; for (let i = 0; i < 6; i++) spark(g.rx + 14 + i * 5, g.rb - 22 - (i % 3) * 3, 'glint', 1); chime(); react('miner', 'vein'); react('driller', 'vein'); updateDock(); LOG.push('vein'); }
// La simulación avanza con el tiempo (paso fijo dentro de cada fotograma).
function simStep(dt, now) {
  if (M.phase === 'vein' && running()) { M.vein -= dt / M.veinMs; M.rawT += dt; if (M.rawT > 900) { M.rawT = 0; if (SIM.state !== 'noraw') M.raw = Math.min(9, M.raw + 1); } if (M.vein <= 0) { M.phase = 'search'; M.vein = 0; M.cycles++; deepen(DEP.cheddar + 1); updateDock(); } }
  if (refining()) { M.refT += dt; if (M.refT > 2000) { M.refT = 0; M.raw--; M.tray = Math.min(3, M.tray + 1); if (M.tray >= 2) { M.tray--; if (SIM.state !== 'nobase') M.base = Math.min(8, M.base + 1); } } }
  if (SIM.state === 'noraw') M.raw = 0; if (SIM.state === 'nobase') M.base = 0;
  if (pressing() && BR.cook && BR.cook.act === 'press' && BR.cook.arrived) { M.chT += dt; if (M.chT > 2600) { M.chT = 0; M.base--; } }
}
// Profundidad: cuando cambia de tramo, la corta se hunde un banco: la roca baja despacio, sale polvo y suena un retumbo.
function deepen(d) {
  const was = tierOf(DEP.cheddar); DEP.cheddar = d; const now = tierOf(d);
  if (now !== was) { S.drop = -(now - was) * 4; S.dropStart = S.drop; S.dropT0 = performance.now(); const g = geoC(STOPS[1]); for (let i = 0; i < 8; i++) spark(g.X0 + 6 + i * 10, g.FF + 4, 'dust', 1); thunk(0.5, false); LOG.push('tier:' + now); }
  paintLabels(); updateDock();
}

// ---- Ratones vivos ----
// Cada trabajador tiene su propio repertorio, con duraciones al azar (semilla por nombre) para que no vayan a la vez. Se mueven
// solo por su suelo (su carril de terraza, el tablero del pórtico, la cresta de la roca) y siempre hacia algo: el horno, el
// manómetro, la prensa, el borde desde donde se ve la broca. Usan las poses aprobadas de MICE (andar, golpear el pie, oreja
// plegada, cola arriba, caras, lupa, libro, destello). Lo que no existe (el pico, lo que llevan en la pata) es una pieza aparte,
// pendiente de aprobación.
const BR = {};
const seedOf = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
function rnd(b) { b.seed = (Math.imul(b.seed, 1664525) + 1013904223) >>> 0; return b.seed / 4294967296; }
const between = (b, a, c) => a + rnd(b) * (c - a);
function wpick(b, list) { const tot = list.reduce((s, x) => s + x[1], 0); let r = rnd(b) * tot; for (const [k, w] of list) { if ((r -= w) <= 0) return k; } return list[0][0]; }
function brainsReset() { for (const k of Object.keys(BR)) delete BR[k]; }
function brain(who, g) { if (!BR[who]) { const c = CREW.cheddar[who]; BR[who] = { who, m: c, seed: seedOf(c.name), x: g.who[who][0], tx: null, flip: who === 'refiner', act: 'idle', t0: 0, until: 0, arrived: true, log: [], react: null, hurry: false, tempo: 760 + (seedOf(c.name) % 220) }; } return BR[who]; }
function react(who, kind) { const b = BR[who]; if (!b) return; b.react = { kind, t0: performance.now() }; if (kind === 'vein' && who === 'miner') b.until = performance.now() + 1300; if (kind === 'vein' && who === 'driller') { b.until = 0; b.hurry = true; } b.log.push(['react:' + kind, performance.now()]); }
function startAct(b, act, now, g, ctx2) {
  const W = g.walk[b.who], cl = (x) => Math.max(W[0], Math.min(W[1], Math.round(x)));
  b.act = act; b.t0 = now; b.arrived = false; b.log.push([act, now]); let d = 1500, tx = b.x, face = null;
  const o = g.o;
  switch (b.who + ':' + act) {
    // Con la veta cerrada pica en la cresta; con la veta abierta se aparta a la izquierda para dejar bajar la barra.
    case 'miner:swing': d = b.tempo * Math.round(between(b, 3, 6)); tx = cl(Math.max(b.x, W[0] + 8)); break;
    case 'miner:inspect': d = between(b, 1500, 2400); tx = M.phase === 'vein' ? cl(W[0] + rnd(b) * 4) : b.x; break;
    case 'miner:shift': tx = M.phase === 'vein' ? cl(W[0] + rnd(b) * 4) : cl(W[0] + 8 + rnd(b) * 6); d = 400; break;
    case 'miner:look': d = between(b, 1000, 1500); tx = M.phase === 'vein' ? cl(Math.min(b.x, W[0] + 4)) : b.x; break;
    case 'miner:wait': d = between(b, 1400, 2200); tx = cl(W[0] + rnd(b) * 4); break;
    case 'driller:operate': tx = o + 76; face = false; d = between(b, 2200, 3600); break;
    case 'driller:check': tx = o + 52; face = false; d = between(b, 1300, 1900); break;
    case 'driller:wait': tx = cl(b.x + (rnd(b) - 0.5) * 6); d = between(b, 1500, 2400); break;
    case 'driller:peek': tx = o + 50; face = true; d = between(b, 1300, 1800); break;
    case 'driller:look': d = between(b, 900, 1400); break;
    case 'refiner:stoke': tx = o + 6; face = true; d = between(b, 1500, 2300); break;
    case 'refiner:gauge': tx = o + 4; face = false; d = between(b, 1200, 1700); break;
    case 'refiner:valve': tx = o + 0; face = false; d = between(b, 1100, 1500); break;
    case 'refiner:wait': tx = o + 2; face = false; d = between(b, 1600, 2400); break;
    case 'refiner:look': d = between(b, 900, 1300); break;
    case 'cook:press': tx = o + 97; face = false; d = between(b, 2200, 3200); break;
    case 'cook:carry': tx = o + 110; face = false; d = between(b, 900, 1300); b.carry = 1; break;
    case 'cook:stir': tx = o + 100; face = false; d = between(b, 1300, 1900); break;
    case 'cook:inspect': tx = o + 106; face = false; d = between(b, 1200, 1700); break;
    case 'cook:book': d = between(b, 1500, 2000); break;
    case 'cook:wait': tx = o + 98; face = true; d = between(b, 1600, 2400); break;
    case 'cook:look': d = between(b, 900, 1300); break;
  }
  b.tx = tx; b.dur = d; b.face = face; b.until = Infinity;
}
function nextAct(b, now, g) {
  const st = M.phase, prev = b.act;
  const T = {
    miner: st === 'search' ? [['swing', 6], ['inspect', 1.6], ['shift', 1.6], ['look', 1.2]] : [['wait', 2], ['inspect', 2], ['look', 1.5], ['shift', 1]],
    driller: running() ? [['operate', 5], ['check', 2], ['look', 1]] : [['wait', 4], ['peek', 2], ['look', 1.2]],
    refiner: refining() ? [['stoke', 4], ['gauge', 2], ['valve', 1.6], ['look', 1]] : [['wait', 5], ['look', 1]],
    cook: pressing() ? [['press', 4], ['carry', 2.4], ['stir', 2], ['inspect', 1.4], ['book', 1]] : [['wait', 5], ['look', 1]],
  }[b.who].filter(([k]) => k !== prev || k === 'swing' || k === 'operate' || k === 'press' || k === 'wait');
  startAct(b, wpick(b, T), now, g);
}
// Pose del ratón en este fotograma: posición, hacia dónde mira, opciones de MICE, salto y pieza en la pata.
function poseOf(b, now, dt, g) {
  const speed = (b.hurry ? 0.032 : 0.017) * dt;
  if (b.tx != null && Math.abs(b.x - b.tx) > 0.5) { const s = Math.sign(b.tx - b.x); b.x += s * Math.min(speed, Math.abs(b.tx - b.x)); return { x: b.x, flip: s < 0, o: { legs: Math.floor(now / 120) % 2 ? 'a' : 'b' }, dy: 0 }; }
  if (!b.arrived) { b.arrived = true; b.hurry = false; b.until = now + b.dur; b.ta = now; }
  const lt = now - (b.ta || now), flip = b.face ?? b.flip; b.flip = flip;
  const r = b.react && now - b.react.t0 < 1300 ? b.react : null;
  if (r) { const hop = now - r.t0 < 260 ? -2 : now - r.t0 < 420 ? -1 : 0, face = r.kind === 'upgrade' || r.kind === 'greet' ? 'happy' : r.kind === 'vein' ? (now - r.t0 < 600 ? 'wow' : 'happy') : 'down'; return { x: b.x, flip: r.kind === 'greet' ? false : flip, o: { face, tail: r.kind !== 'stop', spark: r.kind === 'upgrade' && now - r.t0 < 900 }, dy: hop }; }
  const k = b.who + ':' + b.act;
  if (k === 'miner:swing') { const ph = (lt % b.tempo) / b.tempo, f = ph < 0.42 ? 0 : ph < 0.56 ? 1 : 2; if (f === 2 && !b.hitDone) { b.hitDone = true; if (!S.lastHit || now - S.lastHit > 300) mineHit('auto'); } if (f !== 2) b.hitDone = false; return { x: b.x, flip: false, o: f === 2 ? { face: 'grump' } : {}, dy: f === 2 ? 1 : 0, pick: f }; }
  if (b.strike && now - b.strike < 140) return { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 };
  if (k === 'miner:inspect' || k === 'driller:check' || k === 'driller:peek' || k === 'cook:inspect' || k === 'refiner:gauge') return { x: b.x, flip, o: { glass: true }, dy: 0, pick: b.who === 'miner' ? -1 : undefined };
  if (k === 'miner:look' || k === 'driller:look' || k === 'refiner:look' || k === 'cook:look') return { x: b.x, flip: lt % 900 < 450 ? flip : !flip, o: {}, dy: 0, pick: b.who === 'miner' ? -1 : undefined };
  if (k === 'miner:wait') return { x: b.x, flip: true, o: { legs: 'tap', face: lt % 2000 < 1000 ? 'happy' : undefined }, dy: 0, pick: -1 };
  if (k === 'driller:operate' || k === 'refiner:valve') return { x: b.x, flip, o: {}, dy: Math.floor(lt / 380) % 2 };
  if (k === 'driller:wait') { if (lt > 300 && !b.said) { b.said = true; say(b, 'No vein yet', now); } return { x: b.x, flip, o: { legs: 'tap', face: 'grump' }, dy: 0 }; }
  if (k === 'refiner:stoke') return { x: b.x, flip: true, o: { ear: true }, dy: Math.floor(lt / 300) % 2, carry: lt < 500 ? 'raw' : null };
  if (k === 'refiner:wait') { if (lt > 300 && !b.said) { b.said = true; say(b, 'Need Raw!', now); } return { x: b.x, flip, o: { face: 'down', ear: true, legs: lt % 1600 < 800 ? 'tap' : undefined }, dy: 0 }; }
  if (k === 'cook:press') return { x: b.x, flip: false, o: { face: lt % 2600 < 400 ? 'happy' : undefined }, dy: Math.floor(lt / 300) % 2 };
  if (k === 'cook:carry') { const hold = lt < b.dur - 300; if (!hold && b.carry) b.carry = 0; return { x: b.x, flip: false, o: { tail: true }, dy: hold ? 0 : -1, carry: hold ? 'w' : null }; }
  if (k === 'cook:stir') return { x: b.x, flip: false, o: {}, dy: Math.floor(lt / 250) % 2 };
  if (k === 'cook:book') return { x: b.x, flip: false, o: { book: Math.floor(lt / 600) % 2 ? 2 : 1 }, dy: 0 };
  if (k === 'cook:wait') { if (lt > 300 && !b.said) { b.said = true; say(b, 'Need Base!', now); } return { x: b.x, flip, o: { face: 'down', legs: lt % 1800 < 900 ? 'tap' : undefined }, dy: 0 }; }
  return { x: b.x, flip, o: {}, dy: 0 };
}
// Un bocadillo a la vez para toda la colonia, y como mucho uno cada 5 s.
const BUB = { who: null, text: '', t0: -1e9, until: 0 };
function say(b, text, now) { if (now - BUB.t0 < 5000) return; Object.assign(BUB, { who: b.who, text, t0: now, until: now + 2200 }); }
let LASTT = 0;
function drawWorkers(st, g, now) {
  const dt = Math.min(64, now - (LASTT || now)); LASTT = now;
  for (const who of ['refiner', 'cook', 'driller', 'miner']) {
    const b = brain(who, g); if (now >= b.until) { b.said = false; nextAct(b, now, g); }
    const p = poseOf(b, now, dt, g), m = b.m, x = Math.round(p.x);
    let feet = g.who[who][1]; if (who === 'miner') { const src = rockSrc(); let top = 99; for (let c = x - g.rx + 6; c <= x - g.rx + 15; c++) top = Math.min(top, rockTop(src, c)); feet = g.rb - 40 + top + 1; }
    const breath = Math.floor((now + (b.seed % 900)) / 650) % 2, blink = (now + (b.seed % 3000)) % 3300 < 110;
    const c = mF(m, p.o.legs ? 0 : breath, blink, p.o);
    if (p.pick !== undefined && p.pick >= 0 && !p.flip) { /* el pico va delante */ }
    if (p.flip) { ctx.save(); ctx.translate(x + 22, feet - 20 + p.dy); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore(); } else ctx.drawImage(c, x, feet - 20 + p.dy);
    if (p.pick !== undefined && p.pick >= 0) ctx.drawImage(artPick(p.pick), x + 9, feet - 20 + p.dy - 1);
    if (p.carry) { const cc = artCarry(p.carry); ctx.drawImage(cc, p.flip ? x - 1 : x + 15, feet - 13 + p.dy); }
    b.px = x; b.py = feet; b.pose = p;
    HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: g.who[who][2], who, name: m.name, x, y: feet - 20, w: 22, h: 20, crest: who === 'miner' });
  }
}
const FF_BASE = (g) => g.FF + 4 + g.dp;
const TOPS = {};
function rockTop(src, col) { if (!TOPS[src]) { const i = im(src); if (!i.complete || !i.width) return 3; const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data, tops = []; for (let x = 0; x < c.width; x++) { let y = 0; while (y < c.height && d[(y * c.width + x) * 4 + 3] < 128) y++; tops.push(y); } TOPS[src] = tops; } const T = TOPS[src]; return T[Math.max(0, Math.min(T.length - 1, col))]; }
const BASEP = (g) => [[g.o + 40, g.TL + 8], [g.o + 40, g.DK + 12], [g.o + 106, g.DK + 12], [g.o + 106, g.TR - 4]];
