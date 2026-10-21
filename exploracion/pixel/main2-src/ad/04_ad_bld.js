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
