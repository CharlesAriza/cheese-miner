// ---------- ART DIRECTION · herramientas de píxel ----------
// Mismo lenguaje que los edificios Pulido+ aprobados (buildings.px.js): rampas de 5 tonos, luz arriba a la izquierda, lado en
// sombra con trama, oclusión abajo, sombras arrojadas en trama y huecos hundidos. Un único contorno para todo: el de los ratones.
// INK ('#1b1220', la tinta de los ratones) ya existe en el código compartido.
const mixc = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const hh2 = (x, y, s = 0) => { let n = Math.imul(x * 374761393 ^ y * 668265263 ^ s * 982451653, 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 13), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
const DI = (x, y) => (x + y) % 2 === 0, SP = (x, y) => x % 2 === 0 && y % 2 === 0;
// Rampas (0 = luz, 4 = sombra profunda).
const PAL = {
  pla: ['#fffaea', '#f4e4bc', '#e2c894', '#b8966a', '#7a5e4c'],
  plb: ['#f4fbff', '#dceaf2', '#b4c8d8', '#8094aa', '#4e5a70'],
  woo: ['#e0a86e', '#b87a44', '#8b5a2b', '#633c22', '#3e2420'],
  wod: ['#b07a50', '#8a5634', '#6a3e24', '#4a2a1a', '#2c1812'],
  stn: ['#d4d8e2', '#a8aec0', '#7c8298', '#565b70', '#363a4a'],
  stw: ['#e8dcc4', '#c8b898', '#a08c6e', '#76644e', '#4c3e32'],
  bri: ['#f0a880', '#d07a58', '#a85a3a', '#7a3a2a', '#4e2428'],
  chz: ['#fff6b8', '#ffd84a', '#f5ab12', '#c97a08', '#7a4606'],
  rnd: ['#f2b860', '#d88a2a', '#a85a14', '#74380e', '#46200a'],
  cop: ['#ffd8a8', '#eba060', '#c06a38', '#844224', '#4e2418'],
  ver: ['#d2f4e6', '#8ad8be', '#4aa88e', '#2c7262', '#18443c'],
  gla: ['#f0fcff', '#c4ecfc', '#86c6ea', '#4e84b2', '#2a4470'],
  red: ['#ffa08c', '#e8523a', '#b8341f', '#7e2018', '#4a1210'],
  cre: ['#fffdf2', '#f6ecd0', '#dcca9e', '#ac9672', '#6e5c48'],
  brn: ['#e88a6a', '#c0543c', '#8e3628', '#5e2420', '#3a1418'],
  sla: ['#9aa8c0', '#6c7a96', '#4a5672', '#323a52', '#1e2236'],
  irn: ['#d0d0dc', '#a0a0b0', '#707080', '#484856', '#2a2a34'],
  lea: ['#c8ea84', '#86c04e', '#549036', '#346028', '#1c3a1a'],
  lead: ['#9ccf6a', '#62a040', '#407a30', '#2a5224', '#16301a'],
  gra: ['#b4dc78', '#7cb44c', '#5a9038', '#3c662a', '#22401c'],
  dir: ['#e4c896', '#c8a470', '#a07e52', '#76583a', '#4a3626'],
  soi: ['#9a7650', '#7a5a3a', '#5e4430', '#463224', '#2e2018'],
  str: ['#fff0a8', '#ecc860', '#c89a3a', '#966c26', '#5e4216'],
  gld: ['#fffbd0', '#ffe070', '#f2c02a', '#b8800a', '#6a4206'],
  win: ['#fffbe0', '#ffe8a0', '#ffc860', '#e0903a', '#9a5a26'],
  chalk: ['#3e4a40', '#2e3a32', '#243028', '#1a221e', '#101612'],
};
// Lienzo de píxeles con helpers. Todo en coordenadas enteras.
function PB(w, h) {
  const d = new Array(w * h).fill(null);
  const o = {
    w, h, d,
    px(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = c; return o; },
    get: (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? d[y * w + x] : null),
    clear(x, y) { if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = null; return o; },
    rect(x, y, ww, hh, c) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) o.px(x + i, y + j, typeof c === 'function' ? c(x + i, y + j) : c); return o; },
    hline: (x, y, n, c) => o.rect(x, y, n, 1, c),
    vline: (x, y, n, c) => o.rect(x, y, 1, n, c),
    fill(test, c, x0 = 0, y0 = 0, x1 = w, y1 = h) { for (let y = Math.max(0, y0); y < Math.min(h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) if (test(x, y)) o.px(x, y, typeof c === 'function' ? c(x, y) : c); return o; },
    ell: (cx, cy, rx, ry, c) => o.fill((x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1, c, Math.floor(cx - rx - 1), Math.floor(cy - ry - 1), Math.ceil(cx + rx + 1), Math.ceil(cy + ry + 1)),
    poly: (P, c) => o.fill((x, y) => inPoly(x + 0.5, y + 0.5, P), c),
    line(x0, y0, x1, y1, c) { bres(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), (x, y) => o.px(x, y, c)); return o; },
    // Contorno exterior: tinta donde un píxel vacío toca uno lleno (4 vecinos).
    outline(ink = INK) { const add = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (d[y * w + x]) continue; if (o.get(x - 1, y) || o.get(x + 1, y) || o.get(x, y - 1) || o.get(x, y + 1)) add.push(y * w + x); } for (const i of add) d[i] = ink; return o; },
    stamp(rows, pal, x0, y0) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && pal[ch]) o.px(x0 + i, y0 + j, pal[ch]); })); return o; },
    // Copia otro lienzo encima (sus píxeles vacíos no tapan).
    put(b, x0, y0) { for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) { const c = b.d[y * b.w + x]; if (c) o.px(x0 + x, y0 + y, c); } return o; },
    canvas() { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h); for (let i = 0; i < d.length; i++) { const v = d[i]; if (!v) continue; const n = parseInt(v.slice(1), 16); img.data[i * 4] = n >> 16; img.data[i * 4 + 1] = (n >> 8) & 255; img.data[i * 4 + 2] = n & 255; img.data[i * 4 + 3] = 255; } g.putImageData(img, 0, 0); return c; },
  };
  return o;
}
// Caja con volumen (la de los edificios aprobados): canto de tinta, cara con luz arriba e izquierda, lado derecho en trama, oclusión abajo.
function vbox(c, x, y, w, h, R, { edge = INK, side = 3, ao = 2, top = 2 } = {}) {
  if (edge) c.rect(x, y, w, h, edge);
  const ix = x + (edge ? 1 : 0), iy = y + (edge ? 1 : 0), iw = w - (edge ? 2 : 0), ih = h - (edge ? 2 : 0);
  c.rect(ix, iy, iw, ih, R[2]); c.rect(ix, iy, iw, Math.min(top, ih), R[1]); c.hline(ix, iy, iw, R[0]); c.vline(ix, iy + 1, ih - 1, R[1]);
  for (let k = 0; k < side; k++) { const xx = ix + iw - 1 - k; for (let yy = iy + 1; yy < iy + ih; yy++) if (k === 0 || (k === 1 && DI(xx, yy)) || (k === 2 && SP(xx, yy))) c.px(xx, yy, R[3]); }
  for (let j = 0; j < ao; j++) { const yy = iy + ih - 1 - j; for (let xx = ix; xx < ix + iw; xx++) if (j === 0 || (j === 1 && DI(xx, yy))) c.px(xx, yy, j === 0 ? R[4] : R[3]); }
}
// Cilindro de pie: brillo a un tercio por la izquierda, sombra a la derecha.
function cylv(c, x, y, w, h, R, edge = INK) { if (edge) c.rect(x, y, w, h, edge); const n = w - 2; for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) : 0, t = f < 0.15 ? 1 : f < 0.4 ? 0 : f < 0.65 ? 2 : f < 0.85 ? 3 : 4; c.vline(x + 1 + i, y + 1, h - 2, R[t]); } }
// Hueco hundido: dentro oscuro, labio con luz abajo y a la derecha.
function recess(c, x, y, w, h, inner, lip) { c.rect(x, y, w, h, inner); c.hline(x, y, w, INK); c.vline(x, y, h, INK); if (lip) { c.hline(x, y + h, w + 1, lip); c.vline(x + w, y, h, lip); } }
// Sombra arrojada en trama (bajo un alero) sobre una pared de rampa R.
function castSh(c, x, y, w, R, rows = 3) { for (let xx = x; xx < x + w; xx++) { c.px(xx, y, R[3]); if (rows > 1 && DI(xx, y + 1)) c.px(xx, y + 1, R[3]); if (rows > 2 && SP(xx, y + 2)) c.px(xx, y + 2, R[3]); } }
// Tablas verticales con juntas y vetas.
function planksV(c, x, y, w, h, R, step = 4, seed = 1) { vbox(c, x, y, w, h, R, { edge: null, side: 2, ao: 2, top: 1 }); for (let xx = x + step; xx < x + w; xx += step) { c.vline(xx, y, h, R[3]); c.vline(xx + 1, y + 1, h - 2, R[1]); } for (let i = 0; i < (w * h) / 22; i++) { const xx = x + Math.floor(hh2(i, 3, seed) * w), yy = y + Math.floor(hh2(i, 5, seed) * (h - 2)); if (c.get(xx, yy) === R[2]) c.px(xx, yy, R[3]).px(xx, yy + 1, R[3]); } }
// Piedras de mampostería (filas, juntas, cada piedra con luz arriba y sombra abajo).
function masonry(c, x, y, w, h, R, rowH = 4, seed = 2) {
  c.rect(x, y, w, h, R[3]);
  for (let r = 0, yy = y; yy < y + h; r++, yy += rowH) { let xx = x - (r % 2 ? 3 : 0); while (xx < x + w) { const sw = 5 + Math.floor(hh2(xx, yy, seed) * 4), a = Math.max(x, xx), b = Math.min(x + w, xx + sw - 1), hh = Math.min(rowH - 1, y + h - yy); if (b > a && hh > 0) { c.rect(a, yy, b - a, hh, R[2]); c.hline(a, yy, b - a, R[1]); c.px(a, yy, R[0]); c.hline(a, yy + hh - 1, b - a, R[3]); } xx += sw; } }
}
// Sombra de contacto en el suelo (se pinta en la escena, no en el sprite).
function groundShadow(g, x, y, w, a = 0.35) { g.globalAlpha = a; g.fillStyle = '#000'; g.fillRect(x + 2, y, w - 4, 1); g.fillRect(x + 5, y + 1, w - 10, 1); g.globalAlpha = 1; }

// ---------- ART DIRECTION · edificios de la superficie (propuesta, no aprobados) ----------
// Cuatro siluetas que no se confunden: HOUSE es ancha y baja bajo un tejado de cuña de queso; LAB es una torre con cúpula
// y telescopio; SHOP es un puesto abierto con toldo; PANTRY es un almacén con montacargas de carga en la buhardilla.
// Escala: el ratón oficial mide 22 × 20; una puerta, unos 15 de alto. El suelo es la última fila de cada lienzo.
const ADC = {};
const adArt = (k, f) => (ADC[k] ||= f());
// Cara de un tejado o de una cuña: tono por posición (luz arriba a la izquierda) con un poco de ruido.
const faceTone = (R, x, y, x0, y0, w, h, n = 0.08) => { const d = ((x - x0) / w) * 0.45 + ((y - y0) / h) * 0.7 + (hh2(x, y, 9) - 0.5) * n; return R[d < 0.3 ? 0 : d < 0.55 ? 1 : d < 0.85 ? 2 : 3]; };
const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy))); return Math.hypot(px - (ax + vx * t), py - (ay + vy * t)); };

// ---- HOUSE · 62 × 54: casita bajo un tejado de cuña de queso, puerta redonda, ventana redonda con luz cálida ----
const houseSprite = () => adArt('house', () => {
  const c = PB(62, 54), P = PAL;
  // Chimenea (detrás del tejado).
  vbox(c, 44, 7, 7, 18, P.stn, { side: 2, ao: 0 }); c.rect(43, 6, 9, 2, INK); c.hline(44, 6, 7, P.stn[1]); for (let y = 10; y < 22; y += 3) c.hline(45, y, 5, P.stn[3]);
  // Muros: revoco con entramado de madera.
  vbox(c, 8, 27, 46, 21, P.pla, { side: 3, ao: 2 });
  for (const x of [9, 31, 52]) { c.vline(x, 28, 19, P.woo[2]); c.vline(x + 1, 28, 19, P.woo[3]); c.px(x, 28, P.woo[1]); }
  c.hline(9, 28, 44, P.woo[2]); c.hline(9, 29, 44, P.woo[3]); c.hline(9, 45, 44, P.woo[2]); c.hline(9, 46, 44, P.woo[3]);
  for (let i = 0; i < 40; i++) { const x = 11 + Math.floor(hh2(i, 1) * 40), y = 31 + Math.floor(hh2(i, 2) * 13); if (c.get(x, y) === P.pla[2]) c.px(x, y, P.pla[3]); }
  // Zócalo de piedra.
  c.rect(6, 46, 50, 8, INK); masonry(c, 7, 47, 48, 7, P.stn, 3, 4);
  // Puerta redonda: arco de piedra, tablas, dos herrajes y el pomo.
  const dc = 20, dtop = 31;
  c.fill((x, y) => (y >= 37 && x >= dc - 8 && x <= dc + 8) || ((x - dc) ** 2 + (y - 37) ** 2 <= 8.4 ** 2 && y < 37), (x, y) => (hh2(x, y, 7) < 0.5 ? P.stw[1] : P.stw[2]), dc - 9, dtop - 6, dc + 10, 47);
  c.fill((x, y) => (y >= 37 && x >= dc - 6 && x <= dc + 6) || ((x - dc) ** 2 + (y - 37) ** 2 <= 6.4 ** 2 && y < 37), (x, y) => ((x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 3 ? P.wod[1] : P.wod[2]), dc - 7, dtop - 4, dc + 8, 47);
  for (let y = 31; y < 47; y++) for (let x = dc - 7; x <= dc + 7; x++) { const inD = (y >= 37 && x >= dc - 6 && x <= dc + 6) || ((x - dc) ** 2 + (y - 37) ** 2 <= 6.4 ** 2 && y < 37); const nb = (xx, yy) => (yy >= 37 && xx >= dc - 6 && xx <= dc + 6) || ((xx - dc) ** 2 + (yy - 37) ** 2 <= 6.4 ** 2 && yy < 37); if (inD && (!nb(x - 1, y) || !nb(x, y - 1))) c.px(x, y, INK); }
  for (const y of [36, 42]) { c.hline(dc - 5, y, 11, P.irn[3]); c.px(dc - 4, y, P.irn[1]).px(dc + 4, y, P.irn[1]); }
  c.rect(dc + 3, 39, 2, 2, P.gld[2]); c.px(dc + 3, 39, P.gld[0]);
  c.rect(dc - 9, 46, 19, 2, P.stn[1]); c.hline(dc - 9, 46, 19, P.stn[0]);
  // Farol junto a la puerta.
  c.rect(28, 31, 1, 2, INK); c.rect(27, 33, 4, 5, INK); c.rect(28, 34, 2, 3, P.win[1]); c.px(28, 34, P.win[0]);
  // Ventana redonda con marco de madera, cruz y luz cálida; jardinera con flores debajo.
  const wx = 42, wy = 35;
  c.ell(wx, wy, 6.2, 6.2, INK); c.ell(wx, wy, 5.3, 5.3, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3]));
  c.vline(wx - 1, wy - 3, 7, P.wod[2]); c.hline(wx - 4, wy, 7, P.wod[2]); c.px(wx - 3, wy - 2, P.win[0]).px(wx - 2, wy - 3, P.win[0]);
  vbox(c, 35, 41, 15, 4, P.woo, { side: 1, ao: 1, top: 1 });
  for (let i = 0; i < 7; i++) { const x = 36 + i * 2, col = [P.red[1], P.gld[1], '#ff9ab5', P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]; c.px(x, 39, P.lea[2]).px(x + 1, 40, P.lea[3]).px(x, 38, col).px(x + 1, 39, P.lea[1]); }
  // Tejado: una cuña de queso. Cara con ojos, corteza en los cantos y el corte de abajo; sombra sobre el muro.
  const A = [2, 29], B = [19, 3], C = [60, 29];
  c.poly([A, B, C, [60, 31], [2, 31]], INK);
  c.poly([[3, 29], [19, 4.5], [58.6, 29]], (x, y) => { const e1 = segDist(x + 0.5, y + 0.5, 3, 29, 19, 4.5), e2 = segDist(x + 0.5, y + 0.5, 19, 4.5, 58.6, 29); if (e1 < 2.6) return e1 < 1.2 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.6) return e2 < 1.2 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, 3, 4, 56, 25); });
  for (const [hx, hy, rx, ry] of [[22, 15, 3.2, 2.2], [34, 21, 2.6, 2], [13, 22, 2.2, 1.6], [46, 25, 2.2, 1.4], [28, 25.5, 1.6, 1.1], [20, 10, 1.4, 1], [40, 17, 1.4, 1]]) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1]));
  c.hline(3, 29, 57, P.chz[3]); c.hline(3, 30, 57, P.rnd[3]); c.px(3, 29, P.chz[2]);
  castSh(c, 9, 31, 44, P.pla, 3);
  c.outline();
  return c;
});
// Humo de la chimenea (cada 160 ms; tres bocanadas que suben y se abren).
function houseSmoke(g, x, y, now) { for (let i = 0; i < 3; i++) { const t = ((now / 2400 + i / 3) % 1), r = 1 + Math.round(t * 3), xx = Math.round(x + Math.sin(t * 5 + i) * 2 + t * 6), yy = Math.round(y - t * 22); g.globalAlpha = 0.55 * (1 - t); g.fillStyle = i % 2 ? '#d8d4e4' : '#c4c0d2'; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); g.fillRect(xx - w, yy + dy, w * 2 + 1, 1); } } g.globalAlpha = 1; }

// ---- LAB · 48 × 70: torre de tablas claras con cúpula de cobre verde, telescopio, ojo de buey con el experimento y serpentín ----
const labSprite = () => adArt('lab', () => {
  const c = PB(48, 70), P = PAL;
  // Antena con su bombilla (la luz se pinta aparte).
  c.vline(24, 1, 10, INK); c.vline(25, 2, 9, P.irn[2]); c.rect(23, 0, 4, 3, INK);
  // Telescopio (detrás de la cúpula, saliendo por la ranura).
  c.line(29, 19, 42, 9, INK); c.line(29, 18, 41, 8, INK); c.line(30, 20, 43, 10, INK); c.line(29, 17, 40, 8, INK);
  c.line(30, 18, 41, 9, P.cop[1]); c.line(30, 19, 42, 10, P.cop[2]); c.rect(41, 6, 4, 5, INK); c.rect(42, 7, 2, 3, P.gla[1]);
  // Cúpula: cobre verdoso, nervios y la ranura.
  c.fill((x, y) => ((x + 0.5 - 24) / 17.5) ** 2 + ((y + 0.5 - 26) / 16) ** 2 <= 1 && y < 26, (x, y) => faceTone(P.ver, x, y, 7, 10, 34, 16, 0.06), 5, 9, 43, 26);
  for (const x of [12, 18, 30, 36]) c.fill((xx, yy) => xx === x && ((xx + 0.5 - 24) / 17.5) ** 2 + ((yy + 0.5 - 26) / 16) ** 2 <= 1 && yy < 26 && yy > 11, P.ver[3]);
  c.fill((x, y) => x >= 26 && x <= 29 && y >= 13 && y < 26, (x, y) => (x === 26 ? P.ver[4] : '#0e1a1e'));
  c.hline(14, 12, 4, P.ver[0]); c.hline(11, 14, 3, P.ver[0]);
  // Cornisa.
  vbox(c, 5, 25, 38, 4, P.stn, { side: 2, ao: 1, top: 1 });
  // Torre: tablas horizontales (tingladillo) en blanco frío.
  vbox(c, 7, 28, 34, 33, P.plb, { side: 3, ao: 2 });
  for (let y = 31; y < 60; y += 3) { c.hline(8, y, 32, P.plb[3]); c.hline(8, y + 1, 32, P.plb[1]); }
  // Ojo de buey de latón con el experimento dentro (el líquido se ilumina aparte).
  const ox = 24, oy = 39;
  c.ell(ox, oy, 8.4, 8.4, INK); c.ell(ox, oy, 7.4, 7.4, (x, y) => (x + y < ox + oy - 3 ? P.cop[0] : x + y < ox + oy + 4 ? P.cop[1] : P.cop[2])); c.ell(ox, oy, 5.4, 5.4, INK); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#1e3a3c' : '#16302e'));
  for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0], [4, -4], [4, 4], [-4, 4], [-4, -4]]) c.px(ox + dx, oy + dy, P.cop[3]);
  c.rect(ox - 1, oy - 4, 2, 3, P.gla[2]); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#8af0a0' : '#4ac070'));
  c.px(ox - 2, oy - 3, '#e8fff0');
  // Puerta con ventanuco y un escalón.
  vbox(c, 10, 47, 11, 14, P.wod, { side: 2, ao: 1 }); c.rect(13, 50, 5, 4, INK); c.rect(14, 51, 3, 2, P.gla[2]); c.px(14, 51, P.gla[0]); c.rect(18, 55, 2, 1, P.gld[2]);
  c.hline(11, 48, 9, P.wod[1]);
  // Zócalo de piedra.
  c.rect(4, 60, 40, 10, INK); masonry(c, 5, 61, 38, 9, P.stn, 3, 8);
  c.rect(9, 60, 13, 2, P.stn[1]); c.hline(9, 60, 13, P.stn[0]);
  // Serpentín de cristal por fuera y el matraz al pie.
  for (let y = 30; y < 58; y++) { const x = 42 + Math.round(Math.sin(y * 0.55) * 1.6); c.px(x - 1, y, INK).px(x + 2, y, INK).px(x, y, P.gla[1]).px(x + 1, y, y % 4 < 2 ? '#7ae08a' : P.gla[2]); }
  c.rect(40, 28, 5, 2, INK);
  c.ell(43, 64, 4.6, 4.8, INK); c.ell(43, 64, 3.6, 3.8, (x, y) => (y < 63 ? P.gla[1] : y < 66 ? '#7ae08a' : '#4ac070')); c.rect(42, 58, 3, 3, INK); c.px(43, 59, P.gla[1]); c.px(41, 62, '#ffffff');
  // Pizarra con fórmulas, apoyada junto a la puerta.
  c.line(1, 69, 3, 56, INK); c.line(7, 69, 5, 56, INK); vbox(c, 0, 56, 9, 9, P.chalk, { side: 0, ao: 0, top: 0 });
  c.rect(0, 56, 9, 9, INK); c.rect(1, 57, 7, 7, P.chalk[1]); c.hline(2, 58, 4, '#d8e0d8'); c.hline(2, 60, 2, '#d8e0d8'); c.px(5, 60, '#d8e0d8'); c.hline(3, 62, 4, '#d8e0d8');
  c.outline();
  return c;
});

// ---- SHOP · 58 × 52: puesto con toldo a rayas, rótulo con la moneda, estantería de ruedas, mostrador y pizarra de precios ----
const shopSprite = () => adArt('shop2', () => {
  const c = PB(58, 52), P = PAL;
  // Interior en sombra (bajo el toldo) con la estantería.
  c.rect(6, 17, 46, 20, P.wod[3]); for (let y = 17; y < 21; y++) for (let x = 6; x < 52; x++) if (y < 19 || DI(x, y)) c.px(x, y, P.wod[4]);
  for (const sy of [24, 31]) { c.hline(7, sy, 44, P.woo[1]); c.hline(7, sy + 1, 44, P.woo[3]); }
  const wheel = (x, y, w = 7, h = 5) => { c.ell(x, y, w / 2 + 0.7, h / 2 + 0.7, INK); c.ell(x, y, w / 2, h / 2, (xx, yy) => (yy + 0.5 < y - h / 4 ? P.chz[0] : yy + 0.5 < y + h / 5 ? P.chz[1] : P.chz[3])); c.hline(Math.round(x - w / 2 + 1), Math.round(y), Math.max(1, w - 2), P.rnd[2]); };
  for (const x of [11, 19, 40, 48]) wheel(x, 21);
  for (const x of [10, 17, 42, 48]) { c.poly([[x, 30], [x + 5, 30], [x + 5, 27]], INK); c.poly([[x + 1, 30], [x + 4.6, 30], [x + 4.6, 28]], P.chz[1]); }
  // Postes.
  for (const x of [3, 52]) vbox(c, x, 11, 4, 41, P.woo, { side: 1, ao: 0, top: 0 });
  // Toldo: rayas rojas y crema, cara inclinada con luz arriba y festón redondeado.
  for (let x = 0; x < 58; x++) { const s = Math.floor(x / 6) % 2, R = s ? P.cre : P.red, lx = x % 6; for (let y = 10; y < 17; y++) c.px(x, y, y < 12 ? R[0] : y < 15 ? (lx === 5 ? R[2] : R[1]) : R[2]); const tab = Math.abs(lx - 2.5) <= 2.5 ? Math.round(Math.sqrt(Math.max(0, 6.25 - (lx - 2.5) ** 2)) * 0.9) : 0; for (let y = 17; y < 17 + tab; y++) c.px(x, y, R[3]); }
  c.rect(0, 8, 58, 2, P.woo[2]); c.hline(0, 8, 58, P.woo[1]);
  // Rótulo encima: tabla con la moneda y dos cuñas.
  c.vline(19, 3, 5, P.woo[3]); c.vline(38, 3, 5, P.woo[3]); vbox(c, 15, 0, 28, 7, P.woo, { side: 2, ao: 1, top: 1 });
  c.ell(29, 3.5, 3.2, 3.2, INK); c.ell(29, 3.5, 2.4, 2.4, (x, y) => (x + y < 31 ? P.gld[1] : P.gld[2])); c.px(28, 2, P.gld[0]);
  for (const x of [19, 34]) { c.poly([[x, 5], [x + 5, 5], [x + 5, 2]], INK); c.poly([[x + 1, 5], [x + 4.4, 5], [x + 4.4, 3]], P.chz[1]); }
  // Mostrador: tablero claro, frente de tablas con un panel, pizarra de precios colgada.
  vbox(c, 3, 36, 52, 4, P.woo, { side: 1, ao: 1, top: 1 }); c.hline(4, 37, 50, P.woo[0]);
  c.rect(5, 39, 48, 13, INK); planksV(c, 6, 40, 46, 11, P.woo, 5, 3);
  c.rect(9, 41, 11, 8, INK); c.rect(10, 42, 9, 6, P.chalk[1]); c.hline(11, 43, 4, '#e8e0c8'); c.hline(11, 45, 6, '#e8e0c8'); c.px(17, 43, P.gld[1]);
  // Rueda abierta a la venta (con la cuña cortada) y caja de cuñas.
  c.ell(12, 32, 6.2, 4.6, INK); c.ell(12, 32, 5.3, 3.7, (x, y) => (y < 30 ? P.chz[0] : y < 33 ? P.chz[1] : P.chz[3])); c.poly([[12, 32], [18, 29], [18, 34]], P.chz[2]); c.line(12, 32, 17, 29, INK);
  vbox(c, 41, 30, 11, 6, P.woo, { side: 1, ao: 1, top: 1 }); for (const x of [43, 46, 49]) { c.poly([[x - 1, 30], [x + 2, 30], [x + 0.5, 27]], INK); c.px(x, 29, P.chz[1]).px(x + 1, 29, P.chz[2]).px(x, 28, P.chz[0]); }
  c.outline();
  return c;
});

// ---- PANTRY · 64 × 56: almacén de tablas rojas, tejado de pizarra, buhardilla con polea y una caja colgada, portón y cajas por color ----
const pantrySprite = () => adArt('pantry', () => {
  const c = PB(64, 56), P = PAL;
  // Muro de tablas.
  c.rect(4, 22, 56, 27, INK); planksV(c, 5, 23, 54, 25, P.brn, 4, 6);
  for (const x of [5, 57]) { c.vline(x, 23, 25, P.woo[2]); c.vline(x + 1, 23, 25, P.woo[3]); }
  // Tejado de pizarra (los faldones miran al frente): hiladas desplazadas, cumbrera y alero.
  c.poly([[0, 24], [9, 7], [55, 7], [64, 24]], INK);
  c.poly([[1.5, 23], [9.8, 8], [54.2, 8], [62.5, 23]], (x, y) => { const row = Math.floor((y - 8) / 3), off = row % 2 ? 2 : 0, t = (x + off) % 5 === 0 ? 3 : (y - 8) % 3 === 2 ? 3 : faceTone(P.sla, x, y, 2, 8, 60, 15) === P.sla[0] ? 1 : 2; return P.sla[t]; });
  c.hline(9, 7, 46, P.sla[0]); c.hline(1, 23, 62, P.woo[2]); c.hline(0, 24, 64, P.woo[3]);
  castSh(c, 7, 25, 50, P.brn, 3);
  // Buhardilla con la puerta del pajar, la viga y la polea; la cuerda baja hasta una caja colgada.
  c.poly([[24, 20], [32, 3], [40, 20]], INK); c.poly([[25.5, 19.5], [32, 5], [38.5, 19.5]], (x, y) => ((x - 25) % 3 === 0 ? P.brn[3] : x < 30 ? P.brn[1] : P.brn[2]));
  c.rect(29, 12, 6, 8, INK); c.rect(30, 13, 4, 7, '#1a0e0c'); c.rect(31, 1, 3, 4, INK); c.rect(32, 2, 1, 2, P.woo[1]);
  c.ell(32.5, 7.5, 2.2, 2.2, INK); c.px(32, 7, P.irn[1]).px(33, 8, P.irn[2]);
  c.vline(32, 10, 18, '#c8b48a');
  vbox(c, 28, 27, 10, 7, P.woo, { side: 1, ao: 1, top: 1 }); c.hline(29, 30, 8, P.woo[3]); c.rect(31, 28, 4, 2, P.chz[1]);
  // Portón de dos hojas con cruces y herrajes.
  c.rect(19, 34, 26, 15, INK); for (const x0 of [20, 33]) { c.rect(x0, 35, 11, 13, P.wod[2]); c.hline(x0, 35, 11, P.wod[1]); c.line(x0, 35, x0 + 10, 47, P.woo[1]); c.line(x0 + 10, 35, x0, 47, P.woo[1]); c.hline(x0, 41, 11, P.woo[2]); c.vline(x0 + 10, 36, 12, P.wod[3]); }
  c.rect(31, 40, 2, 3, P.irn[1]);
  // Cajas por color de recurso bajo un tejadillo: Raw (naranja), Base (crema) y queso (amarillo).
  c.rect(5, 30, 13, 2, INK); c.hline(6, 30, 11, P.woo[1]);
  const crate = (x, y, lab) => { vbox(c, x, y, 7, 6, P.woo, { side: 1, ao: 1, top: 1 }); c.rect(x + 2, y + 2, 3, 2, lab); };
  crate(5, 43, '#e08a2e'); crate(11, 43, '#efe6c4'); crate(8, 37, P.chz[1]);
  // Placa con la rueda (qué guarda) y farol.
  c.ell(52, 37, 4.6, 4.6, INK); c.ell(52, 37, 3.7, 3.7, (x, y) => (x + y < 88 ? P.woo[0] : P.woo[2])); c.poly([[49, 39.5], [55.5, 39.5], [55.5, 34.5]], INK); c.poly([[50, 39], [55, 39], [55, 35.6]], P.chz[1]); c.px(54, 36, P.chz[0]).px(52, 38, P.chz[3]);
  c.rect(48, 44, 1, 2, INK);
  // Zócalo de piedra.
  c.rect(2, 48, 60, 8, INK); masonry(c, 3, 49, 58, 7, P.stn, 3, 11);
  c.outline();
  return c;
});

// ---- Castillete de la mina · 26 × 72: patas de madera, travesaños, polea y la boca del pozo ----
const headframeSprite = () => adArt('headframe', () => {
  const c = PB(28, 72), P = PAL;
  for (const [a, b] of [[[3, 70], [11, 9]], [[24, 70], [16, 9]]]) c.fill((x, y) => segDist(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]) < 1.7, (x, y) => { const s = (x + 0.5 - (a[0] + (b[0] - a[0]) * ((y - a[1]) / (b[1] - a[1])))); return s < -0.5 ? P.woo[1] : s < 0.6 ? P.woo[2] : P.woo[3]; }, 0, 8, 28, 71);
  for (const [y, x0, x1] of [[34, 7, 21], [52, 5, 23]]) { c.rect(x0 - 1, y - 1, x1 - x0 + 3, 4, INK); c.hline(x0, y, x1 - x0 + 1, P.woo[1]); c.hline(x0, y + 1, x1 - x0 + 1, P.woo[3]); }
  c.ell(14, 10, 6.4, 6.4, INK); c.ell(14, 10, 5.4, 5.4, P.irn[2]); c.ell(14, 10, 4, 4, INK); c.ell(14, 10, 3.2, 3.2, '#2a2a34'); c.px(14, 10, P.irn[1]); c.line(14, 6, 14, 14, P.irn[2]); c.line(10, 10, 18, 10, P.irn[2]); c.px(12, 6, P.irn[0]).px(10, 8, P.irn[0]);
  c.poly([[5, 4], [14, 0], [23, 4], [23, 6], [5, 6]], INK); c.poly([[6.2, 4.6], [14, 1.2], [21.8, 4.6], [21.8, 5.4], [6.2, 5.4]], (x, y) => (y < 4 ? P.sla[1] : P.sla[2]));
  c.rect(3, 62, 22, 10, INK); c.rect(4, 63, 20, 2, P.woo[1]); c.rect(4, 65, 20, 7, '#120c0a'); c.rect(4, 65, 2, 7, P.woo[3]); c.rect(22, 65, 2, 7, P.woo[3]); c.hline(6, 65, 16, '#2a1c14');
  c.outline();
  return c;
});

// ---------- ART DIRECTION · el motor de V4.1 para las demostraciones (sin su interfaz) ----------
// La escala de un 375 × 635 con DPR 3: 7/3 px CSS por píxel de arte en la colonia.
SC = { d: 7, s: 7 / 3, LW: 375 / (7 / 3), ox: 8, worldW: 375 / (7 / 3) }; buildStops();
function paintLabels() {}
// Dibuja una parada entera en un lienzo propio (mismo motor, otro destino).
function renderStopTo(i, now, cvs) { const st = STOPS[i]; cvs.width = Math.ceil(SC.worldW); cvs.height = st.h; const g = cvs.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, -st.top); const was = ctx, hs = HITS; ctx = g; HITS = []; try { if (st.kind === 'pilot') drawCheddar(st, now); else if (st.kind === 'district') drawDistrictB(st, now); } finally { ctx = was; HITS = hs; } return cvs; }

// ---------- C · EL PUEBLO (propuesta de composición) ----------
// Más ancho que la pantalla (346 × 152 píxeles de arte; la pantalla ve 160 de ancho): a la derecha, el mercado (tienda,
// almacén y castillete de la mina, justo encima del pozo de Cheddar); en medio, el laboratorio en un altozano; a la
// izquierda, la casa en la colina. Debajo, el corte del terreno: la bodega del almacén, el pozo y la madriguera de la casa.
const VW = 346, VH = 152, GR = 96, GH = 78, GL = 88;
const VPOS = { house: [10, GH], lab: [106, GL], shop: [186, GR], pantry: [252, GR], head: [317, GR] };
// Suelo: altura de la hierba en cada x (colina → altozano → mercado, con taludes).
const groundY = (x) => (x < 84 ? GH : x < 98 ? GH + ((x - 84) / 14) * (GL - GH) : x < 158 ? GL : x < 172 ? GL + ((x - 158) / 14) * (GR - GL) : GR);
const tree = (big) => adArt('tree' + big, () => { const W = big ? 34 : 22, H = big ? 46 : 30, c = PB(W, H), P = PAL, cx = W / 2; c.rect(Math.round(cx) - 2, H - (big ? 18 : 11), 4, big ? 18 : 11, (x, y) => (x < cx - 1 ? P.wod[1] : x < cx + 1 ? P.wod[2] : P.wod[3])); const blobs = big ? [[cx, 13, 13, 11], [cx - 8, 19, 8, 7], [cx + 8, 18, 9, 7], [cx - 2, 7, 9, 6]] : [[cx, 9, 9, 8], [cx - 5, 13, 6, 5], [cx + 5, 12, 6, 5]]; for (const [bx, by, rx, ry] of blobs) c.ell(bx, by, rx, ry, (x, y) => faceTone(P.lea, x, y, bx - rx, by - ry, rx * 2, ry * 2, 0.25)); for (let i = 0; i < (big ? 30 : 14); i++) { const x = Math.floor(hh2(i, 1, big) * W), y = Math.floor(hh2(i, 2, big) * (H - 10)); if (c.get(x, y)) c.px(x, y, hh2(i, 3) < 0.5 ? P.lea[0] : P.lea[3]); } c.outline(); return c; });
const bush = (s) => adArt('bush' + s, () => { const c = PB(14, 8), P = PAL; c.ell(7, 5, 6.4, 3.6, (x, y) => faceTone(P.lead, x, y, 0, 1, 14, 7, 0.3)); if (s) for (const [x, y] of [[4, 3], [9, 4], [6, 5]]) c.px(x, y, s === 1 ? '#ff9ab5' : '#fff6b8'); c.outline(); return c; });
const fence = (n) => adArt('fence' + n, () => { const c = PB(n * 6 + 2, 9), P = PAL; for (let i = 0; i <= n; i++) c.rect(i * 6, 1, 2, 8, (x) => (x === i * 6 ? P.woo[1] : P.woo[3])); c.hline(0, 3, n * 6 + 2, P.woo[2]); c.hline(0, 6, n * 6 + 2, P.woo[2]); c.outline(); return c; });
const bench = () => adArt('bench', () => { const c = PB(16, 8), P = PAL; c.rect(0, 3, 16, 2, P.woo[1]); c.hline(0, 3, 16, P.woo[0]); c.rect(0, 0, 16, 2, P.woo[2]); c.rect(1, 5, 2, 3, P.woo[3]); c.rect(13, 5, 2, 3, P.woo[3]); c.outline(); return c; });
const lampPost = () => adArt('lamp', () => { const c = PB(7, 24), P = PAL; c.rect(3, 6, 1, 18, P.irn[2]); c.rect(2, 22, 3, 2, P.irn[3]); c.rect(1, 1, 5, 6, P.irn[3]); c.rect(2, 2, 3, 4, P.win[1]); c.px(2, 2, P.win[0]); c.rect(2, 0, 3, 1, P.irn[2]); c.outline(); return c; });
const signPost = () => adArt('sign', () => { const c = PB(16, 18), P = PAL; c.rect(6, 4, 2, 14, P.woo[2]); c.poly([[0, 2], [12, 2], [15, 5], [12, 8], [0, 8]], P.woo[1]); c.hline(1, 2, 11, P.woo[0]); c.hline(2, 5, 7, P.woo[3]); c.poly([[6, 9], [13, 9], [13, 14], [6, 14]], P.woo[2]); c.vline(9, 10, 3, INK); c.px(8, 11, INK).px(10, 11, INK); c.outline(); return c; });
function paintVillage(g) {
  const P = PAL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // Cielo de media tarde, nubes y dos líneas de colinas lejanas (sin contorno, veladas hacia el cielo).
  const SKY = ['#4c5f98', '#5a6ea6', '#6a80b4', '#7c92c0', '#94a8cc', '#b4c0d4', '#d8cdb8'];
  SKY.forEach((c, i) => R2(0, i * 12, VW, 12, c)); R2(0, 84, VW, 20, '#e2d0b0');
  // Transición en trama entre bandas del cielo (sin degradados).
  [...SKY, '#e2d0b0'].forEach((c, i) => { if (!i) return; const y = i * 12; for (let x = 0; x < VW; x++) { if ((x + y) % 2 === 0) R2(x, y, 1, 1, SKY[i - 1]); if (x % 2 === 0 && y % 4 === 0) R2(x, y + 1, 1, 1, SKY[i - 1]); } });
  for (const [cx, cy, w] of [[40, 16, 26], [150, 10, 34], [262, 20, 22], [318, 8, 18]]) { R2(cx, cy, w, 4, '#f4f2fa'); R2(cx + 4, cy - 3, w - 10, 3, '#f4f2fa'); R2(cx + 2, cy + 4, w - 2, 2, '#c8cce4'); }
  for (let x = 0; x < VW; x++) { const h1 = 22 + Math.round(Math.sin(x * 0.03 + 1) * 7 + Math.sin(x * 0.09) * 3); R2(x, GR - 6 - h1, 1, h1 + 6, '#8a9cbc'); }
  for (let x = 0; x < VW; x++) { const h2 = 12 + Math.round(Math.sin(x * 0.05 + 3) * 5 + Math.sin(x * 0.13) * 2); R2(x, GR - 4 - h2, 1, h2 + 4, '#7a9a8e'); if (hh2(x, 7) < 0.08) R2(x, GR - 6 - h2, 1, 2, '#6a8a7e'); }
  // Terreno: hierba con su borde, taludes y el corte del suelo con estratos.
  for (let x = 0; x < VW; x++) { const y = Math.round(groundY(x)); R2(x, y, 1, VH - y, P.soi[1]); R2(x, y, 1, 4, P.gra[1]); R2(x, y, 1, 1, P.gra[0]); R2(x, y + 4, 1, 2, P.gra[3]); if (hh2(x, 1) < 0.3) R2(x, y - 1, 1, 1, P.gra[1]); if (hh2(x, 2) < 0.12) R2(x, y - 2, 1, 1, P.gra[2]); }
  for (let y = 104; y < VH; y += 9) for (let x = 0; x < VW; x++) { const yy = y + Math.round(Math.sin(x * 0.07 + y) * 1.5); if (yy > groundY(x) + 8) R2(x, yy, 1, 1, P.soi[3]); }
  for (let i = 0; i < 160; i++) { const x = Math.floor(hh2(i, 11) * VW), y = 104 + Math.floor(hh2(i, 12) * 46); if (y > groundY(x) + 8) { R2(x, y, 2, 1, P.soi[0]); R2(x, y + 1, 2, 1, P.soi[3]); } }
  for (let i = 0; i < 14; i++) { let x = 20 + Math.floor(hh2(i, 21) * 300), y = Math.round(groundY(x)) + 6; for (let k = 0; k < 9; k++) { R2(x, y + k, 1, 1, '#4a3424'); x += hh2(i, k) < 0.5 ? -1 : 1; } }
  // Camino de tierra con taludes y escalones.
  for (let x = 4; x < 346; x++) { const y = Math.round(groundY(x)); if (x > 72 && x < 104 || x > 150 && x < 186) R2(x, y + 1, 1, 2, P.dir[1]); else R2(x, y + 1, 1, 2, P.dir[0]); if (hh2(x, 33) < 0.2) R2(x, y + 2, 1, 1, P.dir[2]); }
  for (const [x0, x1] of [[84, 98], [158, 172]]) for (let x = x0; x < x1; x += 4) { const y = Math.round(groundY(x)); R2(x, y, 4, 1, P.stw[1]); R2(x, y + 1, 4, 1, P.stw[3]); }
  // Corte del subsuelo: la madriguera bajo la casa (dormitorio), la bodega bajo el almacén y el pozo.
  const room = (x, y, w, h, back) => { R2(x - 1, y - 1, w + 2, h + 2, INK); R2(x, y, w, h, back); R2(x, y, w, 2, '#00000040'); };
  room(16, 86, 54, 22, '#3a2a1e'); for (let x = 16; x < 70; x += 3) R2(x, 86 + (x % 2), 1, 1, '#2a1c12'); R2(16, 106, 54, 2, P.woo[3]);
  for (const bx of [22, 44]) { R2(bx, 99, 18, 5, P.woo[2]); R2(bx, 99, 18, 1, P.woo[1]); R2(bx + 1, 97, 16, 3, '#6a7ac8'); R2(bx + 1, 97, 16, 1, '#9aa8e8'); R2(bx + 1, 96, 5, 2, P.cre[1]); R2(bx, 95, 2, 9, P.woo[3]); }
  R2(39, 88, 1, 4, INK); R2(38, 92, 3, 3, P.win[1]);
  // Escalera de la casa a la madriguera.
  R2(60, GH + 1, 7, 86 - GH, '#2a1c12'); for (let y = GH + 3; y < 86; y += 3) R2(61, y, 5, 1, P.woo[1]); R2(60, GH + 1, 1, 86 - GH, P.woo[3]); R2(66, GH + 1, 1, 86 - GH, P.woo[3]);
  room(258, 104, 52, 30, '#2e2218'); for (const sy of [114, 124]) { R2(260, sy, 48, 2, P.woo[2]); R2(260, sy, 48, 1, P.woo[1]); }
  for (let i = 0; i < 6; i++) { const x = 262 + i * 8, cc = ['#e08a2e', '#efe6c4', P.chz[1]][i % 3]; R2(x - 1, 107, 8, 7, INK); R2(x, 108, 6, 6, P.woo[1]); R2(x + 1, 110, 4, 2, cc); }
  for (let i = 0; i < 5; i++) { const x = 266 + i * 9; R2(x - 1, 117, 8, 7, INK); R2(x, 118, 6, 6, P.chz[2]); R2(x, 118, 6, 2, P.chz[0]); }
  R2(252, 97, 6, 37, P.woo[3]); for (let y = 99; y < 134; y += 4) R2(253, y, 4, 1, P.woo[1]);
  R2(326, GR, 12, VH - GR, '#120c0a'); R2(326, GR, 2, VH - GR, P.woo[3]); R2(336, GR, 2, VH - GR, P.woo[3]); for (let y = GR + 6; y < VH; y += 10) R2(326, y, 12, 1, P.woo[2]);
  // Fondo medio: árboles grandes detrás.
  for (const [x, big] of [[72, 1], [158, 0], [0, 0]]) { const tr = tree(big).canvas(); g.drawImage(tr, x, Math.round(groundY(x + tr.width / 2)) - tr.height + 1); }
}
// Lo que va delante del fondo: edificios (con su sombra de contacto), objetos y la vida. Por orden de profundidad.
function drawVillage(g, now, opt = {}) {
  const P = PAL, at = (k) => VPOS[k], spr = (cv, x, base) => { groundShadow(g, x, base, cv.width); g.drawImage(cv, x, base - cv.height); };
  spr(houseSprite().canvas(), ...at('house')); houseSmoke(g, VPOS.house[0] + 47, VPOS.house[1] - 54 + 6, now);
  g.drawImage(fence(3).canvas(), 72, GH - 8); g.drawImage(bench().canvas(), 74, GH - 8); g.drawImage(bush(1).canvas(), 0, GH - 7);
  spr(labSprite().canvas(), ...at('lab')); const blink = Math.floor(now / 700) % 2; g.fillStyle = blink ? '#ff6a5a' : '#7a2a24'; g.fillRect(VPOS.lab[0] + 24, VPOS.lab[1] - 70, 2, 2);
  if (Math.floor(now / 380) % 3 === 0) { g.fillStyle = '#e8fff0'; g.fillRect(VPOS.lab[0] + 43, VPOS.lab[1] - 8 - (Math.floor(now / 380) % 2), 1, 1); }
  g.drawImage(bush(2).canvas(), 96, GL - 7); g.drawImage(signPost().canvas(), 168, GR - 17);
  spr(shopSprite().canvas(), ...at('shop'));
  g.drawImage(lampPost().canvas(), 245, GR - 23); g.globalAlpha = 0.12; g.fillStyle = '#ffe08a'; g.fillRect(241, GR - 26, 15, 12); g.globalAlpha = 1;
  spr(pantrySprite().canvas(), ...at('pantry'));
  spr(headframeSprite().canvas(), ...at('head'));
  g.drawImage(bush(0).canvas(), 238, GR - 7);
  // Ratones: el tendero detrás del mostrador (se redibuja el frente encima), el investigador en la puerta del laboratorio,
  // uno sin puesto leyendo en el banco y otro durmiendo en la madriguera. Solo poses aprobadas.
  const T = CREW.town, mk = (m, x, feet, o = {}, flip = false) => { const cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, (now + m.name.length * 997) % 3300 < 110, o); if (flip) { g.save(); g.translate(x + 22, feet - 20); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20); return [x, feet]; };
  const shop = shopSprite().canvas(); MPOS.keeper = mk(T.keeper, VPOS.shop[0] + 24, GR - 13, opt.keeper || {}); g.drawImage(shop, 0, 36, 58, 16, VPOS.shop[0], GR - 52 + 36, 58, 16);
  MPOS.sci = mk(T.sci, VPOS.lab[0] + 18, GL, opt.sci || { book: Math.floor(now / 900) % 2 ? 2 : 1 }, true);
  // Sin puesto: descansa en la madriguera, metido en la cama (la manta se pinta por encima).
  MPOS.idle = mk(T.idle, 20, 100, opt.idle || { face: 'sleep' }); g.fillStyle = '#6a7ac8'; g.fillRect(23, 96, 16, 4); g.fillStyle = '#9aa8e8'; g.fillRect(23, 96, 16, 1); g.fillStyle = INK; g.fillRect(22, 96, 1, 4);
  if (!opt.noZ) { const z = Math.floor(now / 500) % 3; g.fillStyle = '#bfe8fd'; for (let i = 0; i <= z; i++) g.fillRect(36 + i * 3, 84 - i * 3, 2, 1); }
}
const MPOS = {};

// ---------- Bucle común: una simulación espejo para todas las demostraciones; cada teléfono dibuja su encuadre ----------
let SOUND_NEW = false; SOUND = false; // esta página no suena: ningún sonido nuevo está aprobado
const WORLD = { ched: document.createElement('canvas'), vill: document.createElement('canvas'), villBG: null, t: 0, hooks: [] };
function villageBG() { if (!WORLD.villBG) { const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintVillage(g); WORLD.villBG = c; } return WORLD.villBG; }
function renderVillage(now, opt) { const c = WORLD.vill; c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(villageBG(), 0, 0); drawVillage(g, now, opt); return c; }
function worldTick(dt) { const now = performance.now(); dt = dt ?? Math.min(64, now - (WORLD.t || now)); WORLD.t = now; step41(dt); renderStopTo(1, now, WORLD.ched); renderVillage(now); for (const h of WORLD.hooks) h(now, dt); for (const P of PHONES) { if (P.tick) P.tick(now, dt); if (P.vis && P.live) P.render(now); } }
// Una imagen con su lienzo propio llamando a una función de dibujo del motor (que pinta en el ctx global).
function viaCtx(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const was = ctx; ctx = g; try { fn(g); } finally { ctx = was; } return c; }
const frameOf = (src, fw, f = 0, fh) => { const i = im(src), c = document.createElement('canvas'); c.width = fw; c.height = fh || i.height; c.getContext('2d').drawImage(i, f * fw, 0, fw, c.height, 0, 0, fw, c.height); return c; };
// La página se monta cuando están cargadas todas las imágenes que usa (si no, salen miniaturas vacías).
function adReady(fn) { ['out/anims/swing_player.png', 'out/anims/swing_gold.png', 'out/anims/swing_miner.png', 'out/anims/phouse.png', 'out/anims/plab.png', 'out/anims/pdrill_3.png', 'out/sprites/big_gouda_c0.png', 'out/sprites/ic_coin.png', 'out/sprites/ic_pick.png', 'out/sprites/ic_flask.png', 'out/sprites/ic_raw_cheddar.png', 'out/sprites/ic_base_cheddar.png', 'out/sprites/ic_lot_cheddar.png'].forEach(im); Promise.all(Object.values(IMC).map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); })))).then(fn); }

// ---------- ART DIRECTION · teléfono, bocadillos, avisos, recursos y montacargas (propuestas) ----------
const KPX = 7 / 3; // px CSS por píxel de arte en la colonia (375, DPR 3)
const ICON = { raw: 'out/sprites/ic_raw_cheddar.png', base: 'out/sprites/ic_base_cheddar.png', lot: 'out/sprites/ic_lot_cheddar.png', coin: 'out/sprites/ic_coin.png' };
const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(Math.round(n)));
// ---- Teléfono: HUD, escena y panel, a tamaño real (375 × 635, iPhone en Safari con barras) y escalado para la página ----
const PHONES = [];
function adPhone(parent, { s = 0.8, dock = 'colony', cap = '', res = true, w = 375, h = 635 } = {}) {
  const fig = document.createElement('figure'); fig.className = 'ad-fig';
  const box = document.createElement('div'); box.className = 'ad-phbox'; box.style.width = w * s + 'px'; box.style.height = h * s + 'px';
  const ph = document.createElement('div'); ph.className = 'ad-ph'; ph.style.cssText = `width:${w}px;height:${h}px;transform:scale(${s})`;
  const chip = (k, v) => `<span class="ad-chip" data-k="${k}"><img class="pix" src="${ICON[k]}" alt=""><b>${v}</b></span>`;
  ph.innerHTML = `<div class="ad-hud"><span class="ad-coins" data-k="coin"><img class="pix" src="${ICON.coin}" alt=""><span><b>3.9Qa</b><small>+1.2Qa/s</small></span></span>${res ? chip('raw', '1.2K') + chip('base', '860') + chip('lot', '396K') : '<span class="ad-chip wide"><img class="pix" src="' + ICON.lot + '" alt=""><b>396K</b></span>'}<span class="ad-alert">!</span></div>` +
    `<div class="ad-stage"><canvas></canvas><div class="ad-ov"></div><div class="ad-nav"><i class="up">▲</i><span class="ad-navl"></span><i class="dn">▼</i></div></div>` +
    `<div class="ad-dock"><div class="ad-strip"></div><div class="ad-glob"><i>MICE</i><i>BOOSTS</i><i>LAB</i><i>COLONY</i><i>MENU</i></div></div>`;
  box.appendChild(ph); fig.appendChild(box); if (cap) { const c = document.createElement('figcaption'); c.innerHTML = cap; fig.appendChild(c); } parent.appendChild(fig);
  const P = { fig, ph, s, stage: ph.querySelector('.ad-stage'), cv: ph.querySelector('canvas'), ov: ph.querySelector('.ad-ov'), nav: ph.querySelector('.ad-nav'), camX: 0, camY: 0, k: KPX, vals: { coin: 3.9e15, raw: 1240, base: 860, lot: 396000 }, live: true, draw: null, vis: true };
  P.chip = (k) => ph.querySelector(`[data-k="${k}"]`);
  const tiles = { colony: [['ic_pick', 'MINE', '62%'], ['ic_raw_cheddar', 'DRILL', 'AUTO'], ['ic_base_cheddar', 'REFINE', 'AUTO'], ['ic_lot_cheddar', 'CHEESE', 'AUTO']], town: [['ic_coin', 'SELL', 'AUTO'], ['ic_flask', 'LAB', '3:20'], ['ic_lot_cheddar', 'HOUSE', '1 IDLE'], ['ic_raw_cheddar', 'PANTRY', '8h']] }[dock] || [];
  ph.querySelector('.ad-strip').innerHTML = tiles.map(([ic, n, st]) => `<span class="ad-tile" data-n="${n}"><img class="pix" src="out/sprites/${ic}.png" alt=""><b>${n}</b><small>${st}</small></span>`).join('') + (tiles.length ? '<span class="ad-tile up"><b>UPGRADES</b><small>trees</small></span>' : '');
  P.fit = () => { const r = P.stage.getBoundingClientRect(), dpr = devicePixelRatio || 1, W = P.stage.clientWidth, H = P.stage.clientHeight; P.cv.width = Math.round(W * dpr); P.cv.height = Math.round(H * dpr); P.cv.style.width = W + 'px'; P.cv.style.height = H + 'px'; P.W = W; P.H = H; P.vw = W / P.k; P.vh = H / P.k; };
  P.fit();
  P.toPh = (x, y) => [(x - P.camX) * P.k, (y - P.camY) * P.k];
  P.render = (now) => { if (!P.draw) return; const g = P.cv.getContext('2d'), dpr = devicePixelRatio || 1, k = P.k * dpr; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0e0c12'; g.fillRect(0, 0, P.cv.width, P.cv.height); g.imageSmoothingEnabled = false; g.setTransform(k, 0, 0, k, -Math.round(P.camX * k), -Math.round(P.camY * k)); P.draw(g, now); };
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => (P.vis = e[0].isIntersecting)).observe(box);
  PHONES.push(P); return P;
}
// ---- D · Bocadillos (diálogo del ratón) y avisos (estado de una máquina): dos piezas que no se parecen ----
// Diálogo: globo crema con contorno de tinta, esquinas de píxel y una punta escalonada que señala la cabeza de quien habla.
// Al hablar, el ratón reacciona (salto pequeño y su cara, poses aprobadas). Uno a la vez; tiempo de lectura según el texto.
// Aviso: placa oscura con borde ámbar y el icono del recurso que falta, colgada de la máquina, en mayúsculas. Sin punta.
const TAILSVG = (dir) => { const R = dir === 'down' ? [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]] : [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]]; let s = ''; R.forEach(([y, w], i) => { for (let x = i; x < i + w; x++) s += `<rect x="${x * 2}" y="${y === 0 ? 0 : i * 2}" width="2" height="2" fill="${x === i || x === i + w - 1 ? '#1b1220' : '#fffdf2'}"/>`; }); return `<svg class="ad-tail" width="10" height="10" viewBox="0 0 10 10" shape-rendering="crispEdges">${s}<rect x="0" y="0" width="10" height="2" fill="#fffdf2"/><rect x="0" y="0" width="2" height="2" fill="#1b1220"/><rect x="8" y="0" width="2" height="2" fill="#1b1220"/></svg>`; };
const readMs = (t) => Math.max(2200, Math.min(4500, 1600 + t.length * 60));
function bubble(P, head, text, { tone = 'say', avoid = [] } = {}) {
  const b = document.createElement('div'); b.className = 'ad-bub'; b.innerHTML = `<span>${text}</span>${TAILSVG('down')}`; P.ov.appendChild(b);
  const w = b.offsetWidth, h = b.offsetHeight, [hx, hy] = P.toPh(head[0], head[1]), top0 = 48, m = 6;
  // Arriba de la cabeza, centrado; si choca con el borde, se corre (la punta sigue señalando la cabeza); si no cabe arriba, a un lado.
  let left = Math.round(hx - w / 2), top = Math.round(hy - h - 10), side = 0;
  left = Math.max(m, Math.min(P.W - w - m, left));
  const hits = (l, t) => avoid.some((r) => !(l + w <= r[0] || r[0] + r[2] <= l || t + h <= r[1] || r[1] + r[3] <= t));
  if (top < top0 || hits(left, top)) { for (const dx of [-30, 30, -60, 60]) { const l = Math.max(m, Math.min(P.W - w - m, left + dx)); if (!hits(l, top) && top >= top0) { left = l; break; } } }
  if (top < top0) { side = hx > P.W / 2 ? -1 : 1; top = Math.max(top0, Math.round(hy - h / 2 - 6)); left = side < 0 ? Math.round(hx - w - 16) : Math.round(hx + 16); b.classList.add(side < 0 ? 'side-r' : 'side-l'); }
  b.style.left = left + 'px'; b.style.top = top + 'px';
  const tail = b.querySelector('.ad-tail'); if (!side) tail.style.left = Math.max(6, Math.min(w - 16, Math.round(hx - left - 5))) + 'px'; else tail.style.top = Math.max(4, Math.min(h - 14, Math.round(hy - top - 8))) + 'px';
  b.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 150, easing: 'steps(3)' });
  b._rect = [left, top, w, h];
  b.bye = () => { const a = b.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.85)', opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); };
  return b;
}
function plate(P, anchor, icon, text) {
  const b = document.createElement('div'); b.className = 'ad-warn'; b.innerHTML = `<img class="pix" src="${ICON[icon] || icon}" alt=""><b>${text}</b>`; P.ov.appendChild(b);
  const [x, y] = P.toPh(anchor[0], anchor[1]), w = b.offsetWidth; b.style.left = Math.max(6, Math.min(P.W - w - 6, Math.round(x - w / 2))) + 'px'; b.style.top = Math.max(48, Math.round(y - b.offsetHeight - 8)) + 'px';
  const ch = document.createElement('i'); ch.className = 'ad-chain'; ch.style.left = Math.round(x - parseFloat(b.style.left)) - 1 + 'px'; b.appendChild(ch);
  b.animate([{ transform: 'translateY(-4px)', opacity: 0 }, { transform: 'translateY(1px)', opacity: 1, offset: 0.66 }, { transform: 'none', opacity: 1 }], { duration: 180, easing: 'steps(3)' });
  b.bye = () => { const a = b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); };
  return b;
}
// Cola de diálogo: uno a la vez, como mucho dos esperando, 600 ms entre uno y otro; el ratón reacciona al empezar.
function talker(P) {
  const T = { cur: null, q: [], until: 0, gapUntil: 0 };
  T.say = (who, text, headFn, react) => { if (T.q.length >= 2) T.q.shift(); T.q.push({ who, text, headFn, react }); };
  T.tick = (now) => { if (T.cur && now > T.until) { T.cur.el.bye(); T.cur = null; T.gapUntil = now + 600; } if (!T.cur && T.q.length && now > T.gapUntil) { const s = T.q.shift(); if (s.react) s.react(); const el = bubble(P, s.headFn(), s.text, { avoid: T.avoid ? T.avoid() : [] }); T.cur = { ...s, el }; T.until = now + readMs(s.text); } if (T.cur && T.cur.el.isConnected) { /* sigue a la cabeza si la cámara se mueve */ } };
  return T;
}
// ---- E · Recompensa inmediata: el recurso sale de su máquina, flota «+N» y vuela a su contador, que salta y sube ----
// Las reglas de MAIN (main.js): lo del dedo sale siempre; lo de los ratones, de la roca que se mira y como mucho una vez por
// etapa cada 1,2 s con el total juntado. Topes: 8 números y 10 iconos a la vez.
function fxOf(P) {
  const F = { paced: {}, floats: 0, flyers: 0 };
  F.pace = (key, n, manual) => { const p = F.paced[key] || (F.paced[key] = { at: -1e9, sum: 0 }), now = performance.now(); p.sum += n; if (!manual && now - p.at < 1200) return 0; const t = p.sum; p.sum = 0; p.at = now; return t; };
  F.bump = (k) => { const c = P.chip(k); if (!c) return; c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(-1px)' }, { transform: 'none' }], { duration: 240, easing: 'steps(1, end)' }); };
  F.count = (k, add) => { const c = P.chip(k); if (!c) return; const b = c.querySelector('b'), from = P.vals[k], to = from + add, t0 = performance.now(); P.vals[k] = to; const step = () => { const e = Math.min(1, (performance.now() - t0) / 300); b.textContent = k === 'coin' ? fmtCoin(from + (to - from) * e) : fmtK(from + (to - from) * e); if (e < 1) requestAnimationFrame(step); }; step(); };
  F.emit = (k, at, n, manual = false) => {
    const m = F.pace(k, n, manual); if (!m) return;
    const [x, y] = P.toPh(at[0], at[1]);
    if (F.floats < 8) { F.floats++; const f = document.createElement('div'); f.className = 'ad-float'; f.innerHTML = `<img class="pix" src="${ICON[k]}" alt=""><b>+${k === 'coin' ? fmtCoin(m) : fmtK(m)}</b>`; f.style.left = Math.round(x) + 'px'; f.style.top = Math.round(y - 6) + 'px'; P.ov.appendChild(f); const a = f.animate([{ transform: 'translate(-50%, 0)', opacity: 0 }, { transform: 'translate(-50%, -6px)', opacity: 1, offset: 0.2 }, { transform: 'translate(-50%, -12px)', opacity: 1, offset: 0.75 }, { transform: 'translate(-50%, -14px)', opacity: 0 }], { duration: 900, easing: 'steps(9)' }); a.onfinish = () => { f.remove(); F.floats--; }; }
    const chip = P.chip(k); if (!chip) return;
    const ci = chip.querySelector('img').getBoundingClientRect(), pr = P.ph.getBoundingClientRect(), sr = P.stage.getBoundingClientRect(), tx = (ci.left + ci.width / 2 - pr.left) / P.s, ty = (ci.top + ci.height / 2 - pr.top) / P.s, ox = (sr.left - pr.left) / P.s, oy = (sr.top - pr.top) / P.s;
    const nIc = Math.min(2, m, 10 - F.flyers); for (let i = 0; i < nIc; i++) { F.flyers++; const im2 = document.createElement('img'); im2.className = 'pix ad-fly'; im2.src = ICON[k]; const sx = ox + x + (i ? 6 : -4), sy = oy + y - 4; im2.style.left = sx + 'px'; im2.style.top = sy + 'px'; P.ph.appendChild(im2); const dx = tx - sx, dy = ty - sy; const a = im2.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { transform: `translate(-50%,-50%) translate(${i ? 4 : -4}px, -14px) scale(1.25)`, opacity: 1, offset: 0.22 }, { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(.6)`, opacity: 0.4 }], { duration: 640, delay: i * 70, easing: 'cubic-bezier(.5,0,.7,.4)', fill: 'backwards' }); a.onfinish = () => { im2.remove(); F.flyers--; if (i === nIc - 1) { F.bump(k); F.count(k, m); } }; }
    if (!nIc) F.count(k, m);
  };
  return F;
}
const fmtCoin = (n) => { const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']; let i = 0; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10) + u[i]; };

// ---- Montacargas: una secuencia conectada (propuesta) ----
// 1 La prensa acaba una hornada: la rueda sale y el contador CHEESE sube en el acto (la recompensa no espera al viaje).
// 2 La rueda baja por una rampa corta hasta el rellano (la mueve la máquina, no un ratón).
// 3 La jaula espera abierta y la rueda entra. 4 Sale cuando lleva 3 ruedas o cuando pasan 1,5 s sin que llegue otra; la puerta
// se cierra antes de moverse. 5 Sube con arranque y frenada. 6 Arriba se abre, las ruedas ruedan a su hueco del mostrador y
// la jaula baja vacía. La venta saca una rueda del mostrador y las monedas vuelan al contador. Nada de esto cambia la simulación:
// el queso ya está hecho; la jaula cuenta cómo llega.
function lift2(geo) {
  const L = { y: geo.down, st: 'open', t0: 0, cargo: 0, lastIn: -1e9, ramp: [], landing: 0, out: [], shop: 2, gate: 1, log: [] };
  L.addWheel = (now) => L.ramp.push({ t0: now });
  L.tick = (now) => {
    for (let i = L.ramp.length - 1; i >= 0; i--) if (now - L.ramp[i].t0 > 600) { L.ramp.splice(i, 1); if (L.st === 'open' && L.cargo < 3) { L.cargo++; L.lastIn = now; L.log.push(['in', now]); } else L.landing++; }
    if (L.st === 'open' && L.cargo < 3 && L.landing > 0 && now - L.lastIn > 250) { L.landing--; L.cargo++; L.lastIn = now; }
    const go = (st) => { L.st = st; L.t0 = now; L.log.push([st, now]); };
    if (L.st === 'open' && L.cargo > 0 && (L.cargo >= 3 || now - L.lastIn > 1500)) go('closing');
    else if (L.st === 'closing') { L.gate = Math.max(0, 1 - (now - L.t0) / 160); if (now - L.t0 > 160) go('up'); }
    else if (L.st === 'up' || L.st === 'down') { const ms = L.st === 'up' ? 2600 : 2200, k = Math.min(1, (now - L.t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, a = L.st === 'up' ? geo.down : geo.up, b = L.st === 'up' ? geo.up : geo.down; L.y = a + (b - a) * e; if (k >= 1) { if (L.st === 'up') { go('unload'); L.gate = 1; } else { go('open'); L.gate = 1; } } }
    else if (L.st === 'unload') { const n = L.cargo; if (n && now - L.t0 > 220) { L.cargo--; L.out.push({ t0: now, slot: L.shop + L.out.length }); L.t0 = now; } if (!L.cargo && !L.out.length) go('down'); }
    for (let i = L.out.length - 1; i >= 0; i--) if (now - L.out[i].t0 > 420) { L.out.splice(i, 1); L.shop = Math.min(5, L.shop + 1); L.log.push(['shop', now]); }
  };
  return L;
}

// El pico aprobado: se recorta de la animación de minería aprobada (swing_player, 5 fotogramas) por sus colores (mango y
// cabeza de acero), se le pone el contorno de tinta y se apoya en la pata del ratón oficial. Es el mismo dibujo, no uno nuevo.
const PICKC = { '#dcaa6a': 1, '#3e2418': 1, '#4e2c1c': 1, '#b9c1d1': 1, '#f2f5fa': 1, '#6c7488': 1, '#454a5a': 1, '#fffbe0': 1, '#ffe55c': 1 };
const PICKF = [];
function approvedPick(f) {
  if (PICKF[f]) return PICKF[f]; const i = im('out/anims/swing_player.png'); if (!i.complete || !i.width) return null;
  const c = document.createElement('canvas'); c.width = 160; c.height = 20; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, 160, 20).data, b = PB(32, 20);
  for (let y = 0; y < 20; y++) for (let x = 12; x < 32; x++) { const k = (y * 160 + f * 32 + x) * 4; if (d[k + 3] < 128) continue; const h = '#' + [d[k], d[k + 1], d[k + 2]].map((v) => v.toString(16).padStart(2, '0')).join(''); if (PICKC[h]) b.px(x, y, h); }
  b.outline(); return (PICKF[f] = b.canvas());
}
let PICKDX = -3, PICKDY = 2; // la pata del ratón oficial queda 3 px más atrás y 2 más abajo que la del trabajador genérico
