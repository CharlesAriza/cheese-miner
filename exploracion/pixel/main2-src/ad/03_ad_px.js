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
