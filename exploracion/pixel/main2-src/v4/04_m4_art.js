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
