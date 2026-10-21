// ---------- EVOLUCIÓN Y BOOST · tratamiento de píxel corregido ----------
// Qué causaba el «doble relieve» en la primera entrega: cada pieza se dibujaba como una caja con su propio canto de tinta y su
// propio bisel (luz arriba e izquierda, sombra abajo y derecha); al acabar, el contorno exterior se añadía por fuera de esos
// cantos. Resultado: 2 px de tinta en el borde y un marco claro-oscuro alrededor de cada tabla, piedra y ventana.
// Reglas nuevas, las de los ratones: 1 px de tinta solo por fuera de la silueta; dentro, líneas con el tono más oscuro del
// material (jerarquía: tinta > tono 4 > tono 3); el volumen sale de la luz de la masa entera (arriba a la izquierda), no de
// cada pieza; una sola sombra de contacto, en la escena.
const GEM = ['#ffffff', '#9fe6ff', '#5ad1ff', '#2f8fc0', '#1d5f86'], GEMOFF = ['#b8b4ae', '#8e8a84', '#6c6862', '#4a4844', '#2e2c2a'];
const BRS = ['#fff0b0', '#e8c060', '#c09030', '#8a6420', '#4e3612'];
const PNT = ['#fff3a0', '#ffd84a', '#e0a020', '#9a6a10', '#5a3a08'];
// Volumen sin canto de tinta: masa con luz arriba a la izquierda, lado derecho en trama, oclusión abajo.
function vol(c, x, y, w, h, R, { top = 1, side = 2, ao = 2, left = 1, face = 0 } = {}) {
  c.rect(x, y, w, h, R[2]);
  for (let j = 0; j < face; j++) c.hline(x, y + j, w, R[1]);
  if (top) c.hline(x, y, w, R[face ? 0 : 1]);
  for (let i = 0; i < left; i++) c.vline(x + i, y + (top ? 1 : 0), h - (top ? 1 : 0), R[1]);
  for (let k = 0; k < side; k++) { const xx = x + w - 1 - k; for (let yy = y + 1; yy < y + h; yy++) if (k === 0 || DI(xx, yy)) c.px(xx, yy, R[3]); }
  for (let j = 0; j < ao; j++) { const yy = y + h - 1 - j; for (let xx = x; xx < x + w; xx++) if (j === 0 || DI(xx, yy)) c.px(xx, yy, j === 0 ? R[4] : R[3]); }
}
// Tablas sin bisel por tabla: la masa se sombrea entera y las juntas son una línea de tono 3.
function boards(c, x, y, w, h, R, step = 4, dir = 'v', seed = 1) {
  vol(c, x, y, w, h, R, { side: 2, ao: 2 });
  if (dir === 'v') for (let xx = x + step; xx < x + w - 1; xx += step) c.vline(xx, y + 1, h - 2, R[3]);
  else for (let yy = y + step; yy < y + h - 1; yy += step) { c.hline(x + 1, yy, w - 2, R[3]); }
  for (let i = 0; i < (w * h) / 30; i++) { const xx = x + 1 + Math.floor(hh2(i, 3, seed) * (w - 2)), yy = y + 1 + Math.floor(hh2(i, 5, seed) * (h - 3)); if (c.get(xx, yy) === R[2] && c.get(xx, yy + 1) === R[2]) c.px(xx, yy, R[3]); }
}
// Mampostería sin bisel por piedra: juntas de tono 3 y alguna piedra más clara.
function stones2(c, x, y, w, h, R, rowH = 3, seed = 2) {
  vol(c, x, y, w, h, R, { side: 2, ao: 1 });
  for (let r = 0, yy = y + rowH; yy < y + h; r++, yy += rowH) c.hline(x + 1, yy, w - 2, R[3]);
  for (let r = 0, yy = y; yy < y + h; r++, yy += rowH) { let xx = x + 2 + (r % 2 ? 3 : 0); while (xx < x + w - 2) { c.vline(xx, yy + 1, Math.min(rowH - 1, y + h - yy - 1), R[3]); if (hh2(xx, yy, seed) < 0.25) c.hline(xx + 1, yy + 1, 3, R[1]); xx += 5 + Math.floor(hh2(xx, yy, seed + 1) * 3); } }
}
// Gema de refuerzo (la del panel BOOSTS aprobado) en su engaste de latón. Apagada si el puesto no tiene ratón.
const GEM_ROWS2 = ['.HHHHH.', 'HWHLLLD', 'LHLLLDD', '.LLLDD.', '..LDD..', '...D...'];
function gemSocket(c, x, y, on = true) {
  c.ell(x + 4.5, y + 4, 5.2, 4.6, (xx, yy) => (xx + yy < x + y + 7 ? BRS[1] : xx + yy < x + y + 10 ? BRS[2] : BRS[3]));
  const G = on ? GEM : GEMOFF; c.stamp(GEM_ROWS2, { H: G[1], W: G[0], L: G[2], D: G[3] }, x + 1, y + 1);
}
// Destello de la gema (solo si trabaja), en la escena: cruz de 1 px que aparece y se va en pasos.
function gemGlint(g, x, y, t, period = 2300, ph = 0) { const k = ((t + ph) % period) / period; if (k > 0.12) return; const s = k < 0.04 ? 1 : k < 0.08 ? 2 : 1; g.fillStyle = '#ffffff'; g.fillRect(x, y - s, 1, s * 2 + 1); g.fillRect(x - s, y, s * 2 + 1, 1); }
// Diagnóstico: píxeles de tinta que forman un segundo anillo (tinta pegada por dentro a la tinta del borde).
function doubleInk(cv) {
  const w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data, A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 127;
  const ink = (x, y) => A(x, y) && Math.abs(d[(y * w + x) * 4] - 0x1b) < 10 && Math.abs(d[(y * w + x) * 4 + 1] - 0x12) < 10 && Math.abs(d[(y * w + x) * 4 + 2] - 0x20) < 12;
  const edge = (x, y) => { if (!ink(x, y)) return false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !A(x + dx, y + dy)) return true; return false; };
  const bad = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ink(x, y) && !edge(x, y) && (edge(x - 1, y) || edge(x + 1, y) || edge(x, y - 1) || edge(x, y + 1))) bad.push([x, y]);
  let e = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (edge(x, y)) e++;
  return { bad, edge: e };
}
// Huecos de 1 px entre piezas (entre las espiras de un serpentín, entre una pata y el suelo): se cierran con un tono oscuro
// del vecino antes del contorno, para que el contorno no los rellene de tinta (sería una línea interior de tinta).
function closeGaps(c, pass = 0) {
  const add = []; for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) { if (c.get(x, y)) continue; const l = c.get(x - 1, y), r = c.get(x + 1, y), u = c.get(x, y - 1), d = c.get(x, y + 1); const nb = [l, r, u, d].filter(Boolean), ne = c.get(x + 1, y - 1), sw = c.get(x - 1, y + 1), nw = c.get(x - 1, y - 1), se = c.get(x + 1, y + 1), diag = nb.length >= 2 && ((ne && sw) || (nw && se)), n = l && r ? [l, r] : u && d ? [u, d] : nb.length >= 3 || diag ? nb : null; if (n) add.push([x, y, mixc(n[0], '#000000', 0.3)]); }
  for (const [x, y, col] of add) c.px(x, y, col); return add.length && pass < 2 ? closeGaps(c, pass + 1) : c;
}
