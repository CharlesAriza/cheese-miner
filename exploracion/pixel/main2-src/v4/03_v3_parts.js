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
function marks(st, g) { const si = STOPS.indexOf(st); if (STOPS[S.stop] === st && S.focus) for (const r of g.st[S.focus] || []) sel(r); if (S.flash[st.id] && performance.now() - S.flash[st.id].t < 110) for (const r of g.st[S.flash[st.id].k] || []) { ctx.globalAlpha = 0.25; R(r[0], r[1], r[2], r[3], '#fff'); ctx.globalAlpha = 1; } }
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
