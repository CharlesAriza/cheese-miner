// ---------- BLOQUE 1 · SUPERFICIE (producción, 21-10-2026) ----------
// Reglas de los sprites (las aprobadas en la revisión de contornos): 1 px de tinta solo por fuera de la silueta; dentro, líneas
// con el tono más oscuro de cada material; volumen por masas con luz arriba a la izquierda; closeGaps antes del contorno.
// Regla de VFX (21-10-2026): humo, brillos, chispas, Z y luces van SIN contorno: colores propios, transparencia y tonos.
// Congelados y reutilizados tal cual: HOUSE I (houseStage(1)), HOUSE II–III (houseV3), LAB I–IV (labV2), la cama y su
// secuencia (drawBedFrame). Nuevos aquí: SHOP en los seis aspectos que ya tiene el juego (visualTier de Trading), PANTRY,
// castillete con polea animada, objetos del pueblo, el pueblo con su subsuelo y los VFX de superficie.
const B1C = {};
const b1Art = (k, f) => (B1C[k] ||= f());
const SPL = PAL;
// Colores del toldo por aspecto: los del juego real (scene.js, drawShop).
const SHOP_STRIPE = ['#e2462f', '#e2462f', '#3d6fd1', '#9a5fd0', '#3fa860', '#d9a514'];
const shade = (hex, k) => mixc(hex, k > 0 ? '#ffffff' : '#000000', Math.abs(k));

// ================= SHOP · 74 × 58, en seis aspectos (0–5) =================
// 0 puesto con toldo · 1 + cartel con la moneda · 2 + toldo doble · 3 + banderín y farol · 4 + segundo puesto detrás ·
// 5 + mostrador dorado. Dos capas: shopBack (todo menos el mostrador) y shopFront (el mostrador), para que el tendero quede
// detrás del mostrador. Los lotes en venta (hasta 4, como en el juego) se pintan encima con shopLots.
const SHOP_W = 74, SHOP_H = 58;
function shopBack(t) {
  return b1Art('shopB' + t, () => {
    const c = PB(SHOP_W, SHOP_H), P = SPL, S = SHOP_STRIPE[t], ST = [shade(S, 0.35), S, shade(S, -0.22), shade(S, -0.45)];
    // 4 · segundo puesto detrás, a la derecha: tablas, su toldito y dos cajas de queso.
    if (t >= 4) {
      boards(c, 54, 30, 18, 27, P.woo, 4, 'v', 3);
      c.rect(56, 36, 14, 10, P.wod[4]); for (const x of [58, 64]) { c.rect(x, 40, 5, 4, P.chz[2]); c.hline(x, 40, 5, P.chz[1]); c.px(x + 1, 41, P.chz[0]); }
      for (let x = 53; x < 73; x++) { const s = Math.floor((x - 53) / 4) % 2, R = s ? P.cre : ST; for (let y = 26; y < 30; y++) c.px(x, y, y === 26 ? R[0] : y < 29 ? R[1] : R[2]); }
    }
    // Interior en sombra bajo el toldo, con dos baldas.
    c.rect(6, 22, 46, 20, P.wod[3]); for (let y = 22; y < 26; y++) for (let x = 6; x < 52; x++) if (y < 24 || DI(x, y)) c.px(x, y, P.wod[4]);
    for (const sy of [29, 36]) { c.hline(7, sy, 44, P.woo[1]); c.hline(7, sy + 1, 44, P.woo[3]); }
    // Ruedas en la balda de arriba (borde de corteza, sin tinta) y cuñas en la de abajo.
    const wheel = (x, y) => { c.ell(x, y, 3.6, 2.6, P.rnd[3]); c.ell(x, y, 2.9, 1.9, (xx, yy) => (yy + 0.5 < y - 0.6 ? P.chz[0] : yy + 0.5 < y + 0.6 ? P.chz[1] : P.chz[3])); c.hline(x - 2, y, 4, P.rnd[2]); };
    for (const x of [11, 19, 40, 48]) wheel(x, 26);
    for (const x of [10, 17, 41, 47]) { c.poly([[x, 35], [x + 5, 35], [x + 5, 32]], P.rnd[3]); c.poly([[x + 1, 35], [x + 4.6, 35], [x + 4.6, 33]], P.chz[1]); c.px(x + 4, 34, P.chz[0]); }
    // Postes.
    vol(c, 3, 15, 4, 42, P.woo, { side: 1, ao: 0 }); vol(c, 51, 15, 4, 42, P.woo, { side: 1, ao: 0 });
    // Toldo de rayas: cara con luz arriba, festón redondeado abajo; barra de madera encima.
    for (let x = 0; x < 58; x++) { const s = Math.floor(x / 6) % 2, R = s ? P.cre : ST, lx = x % 6; for (let y = 15; y < 22; y++) c.px(x, y, y < 17 ? R[0] : y < 20 ? (lx === 5 ? R[2] : R[1]) : R[2]); const tab = Math.abs(lx - 2.5) <= 2.5 ? Math.round(Math.sqrt(Math.max(0, 6.25 - (lx - 2.5) ** 2)) * 0.9) : 0; for (let y = 22; y < 22 + tab; y++) c.px(x, y, R[3]); }
    c.rect(0, 13, 58, 2, P.woo[2]); c.hline(0, 13, 58, P.woo[1]);
    // 2 · toldo doble: una segunda faldilla encima, con las rayas desplazadas.
    if (t >= 2) for (let x = 2; x < 56; x++) { const s = Math.floor((x + 3) / 6) % 2, R = s ? ST : P.cre, lx = (x + 3) % 6; for (let y = 9; y < 13; y++) c.px(x, y, y < 10 ? R[0] : R[1]); if (Math.abs(lx - 2.5) <= 1.5) c.px(x, 13, R[2]); }
    // 1 · cartel con la moneda y dos cuñas, sobre dos postes cortos.
    if (t >= 1) {
      c.vline(19, 5, 8, P.woo[3]); c.vline(38, 5, 8, P.woo[3]); vol(c, 15, 0, 28, 7, P.woo, { side: 2, ao: 1 });
      c.ell(29, 3.5, 2.8, 2.8, P.gld[3]); c.ell(29, 3.5, 2.1, 2.1, (x, y) => (x + y < 31 ? P.gld[1] : P.gld[2])); c.px(28, 2, P.gld[0]);
      for (const x of [19, 34]) { c.poly([[x, 5], [x + 5, 5], [x + 5, 2]], P.rnd[3]); c.poly([[x + 1, 5], [x + 4.4, 5], [x + 4.4, 3]], P.chz[1]); }
    }
    // 3 · farol colgado del poste derecho (su luz es un VFX aparte) y el asta del banderín en el izquierdo.
    if (t >= 3) { c.vline(4, 2, 13, P.irn[2]); c.px(4, 1, P.gld[1]); c.rect(55, 24, 1, 2, P.irn[2]); c.rect(54, 26, 3, 4, P.irn[3]); c.rect(55, 27, 1, 2, P.win[1]); }
    closeGaps(c); c.outline(); return c.canvas();
  });
}
// El mostrador (capa delantera): tablero claro, frente de tablas y la pizarra de precios. Dorado en el aspecto 5.
function shopFront(t) {
  return b1Art('shopF' + t, () => {
    const c = PB(SHOP_W, SHOP_H), P = SPL, M = t >= 5 ? PNT : P.woo;
    vol(c, 3, 41, 52, 4, M, { side: 1, ao: 1 }); c.hline(4, 42, 50, M[0]);
    boards(c, 5, 45, 48, 12, M, 5, 'v', 3);
    c.rect(9, 46, 11, 8, P.wod[4]); c.rect(10, 47, 9, 6, P.chalk[1]); c.hline(11, 48, 4, '#e8e0c8'); c.hline(11, 50, 6, '#e8e0c8'); c.px(17, 48, P.gld[1]);
    closeGaps(c); c.outline(); return c.canvas();
  });
}
// Lote en venta sobre el mostrador (hasta 4, como el juego): rueda pequeña con su corte rojo.
const lotSprite = () => b1Art('lot', () => { const c = PB(7, 6), P = SPL; c.ell(3.5, 3, 3, 2.4, P.rnd[3]); c.ell(3.5, 3, 2.4, 1.8, (x, y) => (y < 2.5 ? P.chz[0] : P.chz[1])); c.hline(2, 3, 3, P.red[2]); c.outline(); return c.canvas(); });
// Huecos a los lados del mostrador: el centro queda para el tendero.
const LOT_X = [4, 12, 40, 48];
function shopLots(g, x, y, n) { for (let i = 0; i < Math.min(4, n); i++) g.drawImage(lotSprite(), x + LOT_X[i], y + 36); }
// Banderín del aspecto 3: dos fotogramas, sin contorno (es tela al viento, un VFX ligero).
function shopFlag(g, x, y, t, now) { if (t < 3) return; const S = SHOP_STRIPE[t], f = Math.floor(now / 260) % 2; g.fillStyle = S; g.fillRect(x + 1, y + 1, 6, 2 + f); g.fillRect(x + 1, y + 3 + f, 4, 1); g.fillStyle = shade(S, 0.3); g.fillRect(x + 1, y + 1, 6, 1); } // la tela nace en el asta (x) y ondea hacia abajo

// ================= PANTRY · 64 × 58 (un solo aspecto: el juego no le da niveles) =================
// Almacén de tablas rojas, tejado de pizarra, buhardilla con polea y una caja colgada, portón y cajas por color de recurso.
const pantrySprite2 = () => b1Art('pantry', () => {
  const c = PB(64, 58), P = SPL;
  // Muro de tablas rojas con esquineras.
  boards(c, 4, 22, 56, 28, P.brn, 4, 'v', 6);
  for (const x of [4, 58]) { c.vline(x, 22, 28, P.woo[2]); c.vline(x + 1, 22, 28, P.woo[3]); }
  // Tejado de pizarra: hiladas desplazadas, cumbrera clara, alero de madera.
  c.poly([[0.5, 24], [9, 7], [55, 7], [63.5, 24]], (x, y) => { const row = Math.floor((y - 7) / 3), off = row % 2 ? 2 : 0; if ((y - 7) % 3 === 2 || (x + off) % 6 === 0) return P.sla[3]; return faceTone(P.sla, x, y, 2, 7, 60, 16) === P.sla[0] ? P.sla[1] : P.sla[2]; });
  c.hline(9, 7, 46, P.sla[0]); c.hline(1, 23, 62, P.woo[2]); c.hline(0, 24, 64, P.woo[3]);
  castSh(c, 6, 25, 52, P.brn, 3);
  // Buhardilla del pajar con su puerta, la viga y la polea; la cuerda baja hasta una caja colgada.
  c.poly([[24, 20.5], [32, 3], [40, 20.5]], (x, y) => ((x - 25) % 3 === 0 ? P.brn[3] : x < 30 ? P.brn[1] : P.brn[2]));
  c.rect(29, 12, 6, 8, P.wod[3]); c.rect(30, 13, 4, 7, P.wod[4]); c.rect(31, 0, 3, 5, P.woo[2]); c.vline(31, 0, 5, P.woo[1]);
  c.ell(32.5, 7.5, 2, 2, P.irn[3]); c.px(32, 7, P.irn[1]).px(33, 8, P.irn[2]);
  c.vline(32, 10, 17, '#c8b48a');
  vol(c, 28, 27, 10, 7, P.woo, { side: 1, ao: 1 }); c.hline(29, 30, 8, P.woo[3]); c.rect(31, 28, 4, 2, P.chz[1]);
  // Portón de dos hojas con cruces y herrajes; las juntas son del tono más oscuro de la madera.
  c.rect(19, 35, 26, 15, P.wod[4]);
  for (const x0 of [20, 33]) { c.rect(x0, 36, 11, 14, P.wod[2]); c.hline(x0, 36, 11, P.wod[1]); c.line(x0, 36, x0 + 10, 49, P.woo[1]); c.line(x0 + 10, 36, x0, 49, P.woo[1]); c.hline(x0, 42, 11, P.woo[2]); c.vline(x0 + 10, 37, 13, P.wod[3]); }
  c.rect(31, 41, 2, 3, P.irn[1]);
  // Cajas por color de recurso bajo un tejadillo: Raw (naranja), Base (crema) y queso (amarillo).
  c.rect(5, 31, 13, 2, P.woo[2]); c.hline(5, 31, 13, P.woo[1]);
  const crate = (x, y, lab) => { vol(c, x, y, 7, 6, P.woo, { side: 1, ao: 1 }); c.hline(x, y + 3, 7, P.woo[3]); c.rect(x + 2, y + 2, 3, 2, lab); };
  crate(5, 44, '#e08a2e'); crate(11, 44, '#efe6c4'); crate(8, 38, P.chz[1]);
  // Placa con la rueda (lo que guarda).
  c.ell(52, 38, 4.4, 4.4, P.woo[3]); c.ell(52, 38, 3.6, 3.6, (x, y) => (x + y < 89 ? P.woo[0] : P.woo[2])); c.poly([[50, 40], [55, 40], [55, 35.6]], P.chz[1]); c.px(54, 37, P.chz[0]).px(52, 39, P.chz[3]);
  // Zócalo de piedra.
  stones2(c, 2, 50, 60, 8, P.stn, 3, 11);
  closeGaps(c); c.outline(); return c.canvas();
});

// ================= CASTILLETE DE LA MINA · 30 × 74 (+ polea animada) =================
// Patas de madera en A, dos travesaños, tejadillo de pizarra y la boca del pozo. La polea va aparte (3 fotogramas) para que
// gire solo cuando se mueve el montacargas.
const headframe2 = () => b1Art('headframe', () => {
  const c = PB(30, 74), P = SPL;
  for (const [a, b] of [[[4, 72], [12, 10]], [[25, 72], [17, 10]]]) c.fill((x, y) => segDist(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]) < 1.7, (x, y) => { const s = x + 0.5 - (a[0] + (b[0] - a[0]) * ((y - a[1]) / (b[1] - a[1]))); return s < -0.5 ? P.woo[1] : s < 0.6 ? P.woo[2] : P.woo[3]; }, 0, 9, 30, 73);
  for (const [y, x0, x1] of [[34, 8, 22], [52, 6, 24]]) { c.hline(x0 - 1, y, x1 - x0 + 3, P.woo[1]); c.hline(x0 - 1, y + 1, x1 - x0 + 3, P.woo[2]); c.hline(x0 - 1, y + 2, x1 - x0 + 3, P.woo[3]); }
  // Diagonales de refuerzo entre los travesaños.
  c.line(9, 37, 20, 51, P.woo[3]); c.line(21, 37, 10, 51, P.woo[3]);
  // Eje de la polea y tejadillo.
  c.rect(14, 13, 3, 3, P.irn[3]);
  c.poly([[5, 5], [15, 0.5], [25, 5], [25, 7], [5, 7]], (x, y) => (y < 4 ? P.sla[1] : y < 6 ? P.sla[2] : P.sla[3]));
  // Boca del pozo: marco de madera y el hueco oscuro.
  c.rect(4, 63, 22, 11, P.woo[2]); c.hline(4, 63, 22, P.woo[1]); c.hline(4, 64, 22, P.woo[3]); c.rect(6, 65, 18, 9, '#120c0a'); c.vline(6, 65, 9, P.woo[3]); c.vline(23, 65, 9, P.woo[3]); c.hline(7, 65, 16, '#2a1c14');
  closeGaps(c); c.outline(); return c.canvas();
});
const pulleySprite = (f) => b1Art('pulley' + f, () => {
  const c = PB(13, 13), P = SPL, a0 = (f / 3) * (Math.PI / 2);
  c.ell(6.5, 6.5, 5.6, 5.6, P.irn[2]); c.ell(6.5, 6.5, 4.4, 4.4, P.irn[3]); c.ell(6.5, 6.5, 3.4, 3.4, '#2a2a34');
  for (let i = 0; i < 4; i++) { const a = a0 + (i * Math.PI) / 2; c.line(6.5, 6.5, 6.5 + Math.cos(a) * 4.2, 6.5 + Math.sin(a) * 4.2, P.irn[1]); }
  c.ell(6.5, 6.5, 1.2, 1.2, P.irn[0]); c.px(4, 2, P.irn[0]).px(3, 3, P.irn[0]);
  c.outline(); return c.canvas();
});

// ================= OBJETOS DEL PUEBLO =================
// Árboles, matas, valla, banco y farola salen tal cual de la revisión aprobada (tree, bush, fence, bench, lampPost): ya
// llevan un solo contorno y volumen por masas. El poste indicador se rehace sin las marcas de tinta de dentro.
const signPost2 = () => b1Art('sign', () => { const c = PB(16, 18), P = SPL; c.rect(6, 4, 2, 14, P.woo[2]); c.vline(6, 4, 14, P.woo[1]); c.poly([[0, 2], [12, 2], [15, 5], [12, 8], [0, 8]], (x, y) => (y < 4 ? P.woo[0] : y < 7 ? P.woo[1] : P.woo[2])); c.hline(2, 5, 7, P.woo[3]); c.poly([[6, 9], [13, 9], [13, 14], [6, 14]], P.woo[2]); c.vline(9, 10, 3, P.wod[4]); c.px(8, 11, P.wod[4]).px(10, 11, P.wod[4]); c.outline(); return c.canvas(); });
// Cajas de la bodega (sin tinta dentro) y su balda.
const crateSprite = (lab) => b1Art('crate' + lab, () => { const c = PB(8, 7), P = SPL; vol(c, 0, 0, 8, 7, P.woo, { side: 1, ao: 1 }); c.hline(0, 3, 8, P.woo[3]); c.rect(2, 2, 4, 2, lab); c.outline(); return c.canvas(); });

// ================= VFX DE SUPERFICIE (sin contorno) =================
// Humo de chimenea: tres bocanadas que suben, crecen y se desvanecen, en dos grises lila.
function vfxSmoke(g, x, y, now, k = 1) { for (let i = 0; i < 3; i++) { const t = ((now / 2400 + i / 3) % 1), r = 1 + Math.round(t * 3 * k), xx = Math.round(x + Math.sin(t * 5 + i) * 2 + t * 6), yy = Math.round(y - t * 22 * k); g.globalAlpha = 0.55 * (1 - t); g.fillStyle = i % 2 ? '#e2deea' : '#cbc6d8'; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); g.fillRect(xx - w, yy + dy, w * 2 + 1, 1); } g.globalAlpha = 0.35 * (1 - t); g.fillStyle = '#ffffff'; g.fillRect(xx - Math.max(0, r - 1), yy - r, 1, 1); } g.globalAlpha = 1; }
// Halo de luz cálida (farolas, farol de la tienda, ventanas de noche): discos con transparencia, sin borde.
function vfxGlow(g, x, y, r, now, col = '#ffe08a') { const p = 0.85 + 0.15 * Math.sin(now / 420 + x); for (const [rr, a] of [[r, 0.08], [Math.round(r * 0.6), 0.1], [Math.round(r * 0.3), 0.14]]) { g.globalAlpha = a * p; g.fillStyle = col; for (let dy = -rr; dy <= rr; dy++) { const w = Math.floor(Math.sqrt(rr * rr - dy * dy)); g.fillRect(x - w, y + dy, w * 2 + 1, 1); } } g.globalAlpha = 1; }
// Burbujas del experimento del laboratorio: suben 6 px y se apagan.
function vfxBubbles(g, x, y, now) { for (let i = 0; i < 3; i++) { const t = ((now / 1300 + i / 3) % 1), yy = Math.round(y - t * 6), xx = x + Math.round(Math.sin(t * 6 + i * 2)); g.globalAlpha = 0.8 * (1 - t); g.fillStyle = i % 2 ? '#c8ffd8' : '#8af0b0'; g.fillRect(xx, yy, 1, 1); if (t < 0.4) { g.fillStyle = '#ffffff'; g.fillRect(xx, yy - 1, 1, 1); } } g.globalAlpha = 1; }
// Z de dormir sin contorno: la letra en azul muy claro con una sombra de tono medio debajo, y se desvanece al subir.
const ZS3 = ['###', '.#.', '###'], ZS4 = ['####', '..#.', '.#..', '####'];
function zSoft(g, x, y, rows, a) { g.globalAlpha = a; rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '#') return; g.fillStyle = '#7a9cc8'; g.fillRect(x + i + 1, y + j + 1, 1, 1); })); rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '#') return; g.fillStyle = '#e8f6ff'; g.fillRect(x + i, y + j, 1, 1); })); g.globalAlpha = 1; }
function vfxZzz(g, x, y, t) { const z = (t % 2700) / 2700; [[ZS3, 0], [ZS4, 0.5]].forEach(([rows, d], i) => { const k = (z + 1 - d) % 1; if (k > 0.7) return; zSoft(g, x + i * 4 + Math.round(k * 3), y - i * 4 - Math.round(k * 6), rows, k < 0.5 ? 1 : 1 - (k - 0.5) / 0.2); }); }
// La secuencia aprobada de la cama usa estas Z (la regla de VFX sustituye a las Z con contorno).
zzz = vfxZzz;

// ================= EL PUEBLO · 432 × 164 =================
// Arquitectura vertical: la superficie queda encima de Cheddar; el pozo del castillete baja por el borde inferior hacia la
// primera roca. Más ancho que la pantalla (el móvil ve unos 160 px de arte): a la izquierda la casa en su colina, en medio el
// laboratorio (con su hueco reservado a la izquierda), a la derecha el mercado (tienda, despensa y castillete). Debajo: la
// madriguera de la casa (con la cama y su secuencia), la bodega de la despensa y el pozo.
const SW1 = 432, SH1 = 164, GH1 = 84, GL1 = 92, GR1 = 100;
const SPOS = { house: 4, lab: 146, shop: 246, pantry: 324, head: 394 };
const groundY1 = (x) => (x < 118 ? GH1 : x < 132 ? GH1 + ((x - 118) / 14) * (GL1 - GH1) : x < 236 ? GL1 : x < 250 ? GL1 + ((x - 236) / 14) * (GR1 - GL1) : GR1);
const ROOM = { x: 8, y: GH1 + 10, w: 110, h: 44 }; // madriguera: la cama a la derecha, la entrada del túnel a la izquierda
const BED1 = { bx: ROOM.x + 62, by: ROOM.y + 18 };
// Pared de la madriguera: revoco cálido con su trama, sombra bajo las vigas, zócalo de tablas y viga del techo con ménsulas.
function roomWall(g, x0, x1) {
  const P = SPL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); }, { y: ry } = ROOM, F = BED1.by + 22;
  R2(x0, ry, x1 - x0, F - ry, P.pla[3]);
  for (let y = ry + 3; y < F - 10; y++) for (let x = x0; x < x1; x++) if (hh2(x, y, 5) < 0.035) R2(x, y, 1, 1, P.pla[2]); else if (hh2(x, y, 6) < 0.015) R2(x, y, 1, 1, P.pla[4]);
  for (let x = x0; x < x1; x++) { R2(x, ry + 3, 1, 1, P.pla[4]); if (x % 2) R2(x, ry + 4, 1, 1, P.pla[4]); }
  R2(x0, ry, x1 - x0, 3, P.woo[2]); R2(x0, ry, x1 - x0, 1, P.woo[1]); R2(x0, ry + 2, x1 - x0, 1, P.woo[3]);
  for (const x of [ROOM.x + 40, ROOM.x + 100]) if (x >= x0 && x < x1) { R2(x, ry + 3, 4, 2, P.woo[2]); R2(x + 1, ry + 5, 2, 1, P.woo[3]); }
  R2(x0, F - 10, x1 - x0, 10, P.woo[2]); R2(x0, F - 10, x1 - x0, 1, P.woo[1]); R2(x0, F - 9, x1 - x0, 1, P.woo[3]); for (let x = x0 + 2; x < x1; x += 4) R2(x, F - 8, 1, 8, P.woo[3]);
}
// Túnel de salida, en corte, en el extremo izquierdo de la madriguera (de x a x+35): tierra encima, el pasillo a oscuras y su
// suelo de tablas; la viga del dintel marca dónde acaba la habitación. En una vista lateral el ratón sale andando por el
// extremo de la habitación: nunca pasa por delante de un marco.
const TUN = 36;
function roomTunnel(g, rx, ry, by, F) {
  const P = SPL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  R2(rx, ry, TUN, by - 2 - ry, P.soi[2]); for (let i = 0; i < 26; i++) { const x = rx + Math.floor(hh2(i, 41) * TUN), y = ry + Math.floor(hh2(i, 42) * (by - 3 - ry)); R2(x, y, 2, 1, i % 3 ? P.soi[3] : P.soi[1]); }
  R2(rx, by - 2, TUN, F - by + 2, '#1a100a'); for (let x = rx + TUN - 8; x < rx + TUN; x++) R2(x, by - 2, 1, F - by + 2, mixc('#1a100a', '#3a2a1e', (x - rx - TUN + 8) / 10));
  R2(rx, F, TUN, 1, P.woo[3]); for (let x = rx + 2; x < rx + TUN; x += 7) R2(x, F, 1, 1, P.woo[4]);
  for (const x of [rx + 8, rx + 22]) { R2(x, by - 3, 3, 2, P.woo[3]); R2(x, by - 3, 3, 1, P.woo[2]); }
  R2(rx + TUN - 3, by - 5, 7, 3, P.woo[2]); R2(rx + TUN - 3, by - 5, 7, 1, P.woo[1]); R2(rx + TUN - 3, by - 3, 7, 1, P.woo[3]);
}
// Delante del ratón, solo dentro del túnel: oscuridad que crece hacia el fondo; al empezar y al acabar el bucle, el túnel
// entero se oscurece y aclara para que el ratón no aparezca ni desaparezca de golpe.
function tunnelVeil(g, rx, by, F, t) {
  const fade = t < 400 ? 1 - t / 400 : t > BT.walkOut - 400 ? Math.min(1, (t - BT.walkOut + 400) / 400) : 0;
  for (let x = rx; x < rx + TUN; x++) { const a = Math.max(fade, 0.97 - ((x - rx) / TUN) * 0.85); g.globalAlpha = a; g.fillStyle = '#1a100a'; g.fillRect(x, by - 2, 1, F - by + 2); }
  g.globalAlpha = 1;
}
function paintSurface(g) {
  const P = SPL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // Cielo en bandas con trama entre ellas, nubes y dos líneas de colinas lejanas veladas (sin contorno).
  const SKY = ['#4c5f98', '#5a6ea6', '#6a80b4', '#7c92c0', '#94a8cc', '#b4c0d4', '#d8cdb8'];
  SKY.forEach((c, i) => R2(0, i * 12, SW1, 12, c)); R2(0, 84, SW1, 20, '#e2d0b0');
  [...SKY, '#e2d0b0'].forEach((c, i) => { if (!i) return; const y = i * 12; for (let x = 0; x < SW1; x++) { if ((x + y) % 2 === 0) R2(x, y, 1, 1, SKY[i - 1]); if (x % 2 === 0 && y % 4 === 0) R2(x, y + 1, 1, 1, SKY[i - 1]); } });
  for (const [cx, cy, w] of [[44, 16, 26], [160, 10, 34], [276, 20, 22], [360, 8, 18]]) { R2(cx, cy, w, 4, '#f4f2fa'); R2(cx + 4, cy - 3, w - 10, 3, '#f4f2fa'); R2(cx + 2, cy + 4, w - 2, 2, '#c8cce4'); }
  for (let x = 0; x < SW1; x++) { const h1 = 22 + Math.round(Math.sin(x * 0.03 + 1) * 7 + Math.sin(x * 0.09) * 3); R2(x, GR1 - 6 - h1, 1, h1 + 6, '#8a9cbc'); }
  for (let x = 0; x < SW1; x++) { const h2 = 12 + Math.round(Math.sin(x * 0.05 + 3) * 5 + Math.sin(x * 0.13) * 2); R2(x, GR1 - 4 - h2, 1, h2 + 4, '#7a9a8e'); if (hh2(x, 7) < 0.08) R2(x, GR1 - 6 - h2, 1, 2, '#6a8a7e'); }
  // Terreno: hierba con su borde, taludes, estratos del corte y raíces.
  for (let x = 0; x < SW1; x++) { const y = Math.round(groundY1(x)); R2(x, y, 1, SH1 - y, P.soi[1]); R2(x, y, 1, 4, P.gra[1]); R2(x, y, 1, 1, P.gra[0]); R2(x, y + 4, 1, 2, P.gra[3]); if (hh2(x, 1) < 0.3) R2(x, y - 1, 1, 1, P.gra[1]); if (hh2(x, 2) < 0.12) R2(x, y - 2, 1, 1, P.gra[2]); }
  for (let y = 110; y < SH1; y += 9) for (let x = 0; x < SW1; x++) { const yy = y + Math.round(Math.sin(x * 0.07 + y) * 1.5); if (yy > groundY1(x) + 8) R2(x, yy, 1, 1, P.soi[3]); }
  for (let i = 0; i < 190; i++) { const x = Math.floor(hh2(i, 11) * SW1), y = 108 + Math.floor(hh2(i, 12) * 54); if (y > groundY1(x) + 8) { R2(x, y, 2, 1, P.soi[0]); R2(x, y + 1, 2, 1, P.soi[3]); } }
  for (let i = 0; i < 16; i++) { let x = 130 + Math.floor(hh2(i, 21) * 290), y = Math.round(groundY1(x)) + 6; for (let k = 0; k < 9; k++) { R2(x, y + k, 1, 1, '#4a3424'); x += hh2(i, k) < 0.5 ? -1 : 1; } }
  // Camino de tierra con escalones de piedra en los taludes.
  for (let x = 0; x < SW1; x++) { const y = Math.round(groundY1(x)); R2(x, y + 1, 1, 2, (x > 106 && x < 140) || (x > 228 && x < 258) ? P.dir[1] : P.dir[0]); if (hh2(x, 33) < 0.2) R2(x, y + 2, 1, 1, P.dir[2]); }
  for (const [x0, x1] of [[118, 132], [236, 250]]) for (let x = x0; x < x1; x += 4) { const y = Math.round(groundY1(x)); R2(x, y, 4, 1, P.stw[1]); R2(x, y + 1, 4, 1, P.stw[3]); }
  // Madriguera bajo la casa: pared de tierra apisonada con vigas, suelo de tablas y la boca del túnel a la izquierda.
  const { x: rx, y: ry, w: rw, h: rh } = ROOM;
  R2(rx - 1, ry - 1, rw + 2, rh + 2, P.soi[4]);
  roomWall(g, rx + TUN, rx + rw);
  const F = BED1.by + 22, bx = BED1.bx, by = BED1.by;
  roomTunnel(g, rx, ry, by, F);
  // Suelo de tablas y alfombra roja con remates dorados delante de la cama.
  R2(rx + TUN, F, rw - TUN, ry + rh - F, P.woo[3]); R2(rx + TUN, F, rw - TUN, 1, P.woo[1]); R2(rx, F + 1, TUN, ry + rh - F - 1, P.woo[4]); for (let x = rx + TUN + 3; x < rx + rw; x += 7) R2(x, F + 1, 1, ry + rh - F - 1, P.woo[4]);
  R2(rx + 40, F, 22, 2, P.red[2]); R2(rx + 40, F, 22, 1, P.red[1]); for (let x = rx + 42; x < rx + 60; x += 4) R2(x, F + 1, 2, 1, P.red[3]); R2(rx + 39, F, 1, 2, P.gld[2]); R2(rx + 62, F, 1, 2, P.gld[2]);
  // Cuadro con una cuña de queso, entre el túnel y la cama.
  R2(rx + 43, ry + 9, 11, 9, P.woo[1]); R2(rx + 44, ry + 10, 9, 7, '#5a7ab8'); R2(rx + 44, ry + 14, 9, 3, '#6a9a58'); g.fillStyle = P.chz[1]; g.beginPath(); g.moveTo(rx + 45, ry + 16); g.lineTo(rx + 52, ry + 16); g.lineTo(rx + 52, ry + 12); g.fill(); R2(rx + 51, ry + 13, 1, 1, P.chz[3]); R2(rx + 43, ry + 17, 11, 1, P.woo[3]);
  // Balda con libros y un tarro, encima de la cama.
  R2(bx + 12, by - 4, 20, 1, P.woo[1]); R2(bx + 12, by - 3, 20, 1, P.woo[3]); R2(bx + 14, by - 2, 1, 2, P.woo[3]); R2(bx + 29, by - 2, 1, 2, P.woo[3]);
  [[13, P.red[2], 5], [15, '#3f5a8b', 6], [17, P.lea[2], 5], [19, P.gld[2], 4]].forEach(([dx, col, h]) => { R2(bx + dx, by - 4 - h, 2, h, col); R2(bx + dx, by - 4 - h, 2, 1, mixc(col, '#ffffff', 0.3)); });
  R2(bx + 25, by - 8, 4, 4, P.gla[2]); R2(bx + 25, by - 9, 4, 1, P.woo[2]); R2(bx + 26, by - 7, 2, 2, P.chz[1]);
  // Aplique de pared (su luz es un VFX: vfxGlow en drawSurface).
  R2(rx + 64, ry + 13, 1, 3, P.irn[3]); R2(rx + 63, ry + 9, 3, 4, P.irn[3]); R2(rx + 64, ry + 10, 1, 2, P.win[0]);
  // Bodega bajo la despensa: dos baldas con cajas por color y la escalera.
  const bx0 = SPOS.pantry + 6, by0 = GR1 + 12; R2(bx0 - 1, by0 - 1, 54, 32, P.soi[4]); R2(bx0, by0, 52, 30, '#2e2218');
  for (const sy of [by0 + 10, by0 + 20]) { R2(bx0 + 2, sy, 48, 2, P.woo[2]); R2(bx0 + 2, sy, 48, 1, P.woo[1]); }
  for (let i = 0; i < 6; i++) g.drawImage(crateSprite(['#e08a2e', '#efe6c4', P.chz[1]][i % 3]), bx0 + 3 + i * 8, by0 + 2);
  for (let i = 0; i < 5; i++) g.drawImage(crateSprite(P.chz[1]), bx0 + 7 + i * 9, by0 + 12);
  R2(SPOS.pantry, GR1, 6, by0 + 30 - GR1, P.woo[3]); for (let y = GR1 + 2; y < by0 + 30; y += 4) R2(SPOS.pantry + 1, y, 4, 1, P.woo[1]);
  // Pozo bajo el castillete: baja hasta el borde inferior, hacia Cheddar.
  const hx = SPOS.head + 6; R2(hx, GR1, 18, SH1 - GR1, '#120c0a'); R2(hx, GR1, 2, SH1 - GR1, P.woo[3]); R2(hx + 16, GR1, 2, SH1 - GR1, P.woo[3]); for (let y = GR1 + 6; y < SH1; y += 10) R2(hx, y, 18, 1, P.woo[2]);
  // Fondo medio: árboles grandes detrás de los edificios.
  for (const [x, big] of [[122, 1], [222, 0], [-6, 0], [300, 0]]) { const tr = tree(big).canvas(); g.drawImage(tr, x, Math.round(groundY1(x + tr.width / 2)) - tr.height + 3); } // en llano, con el tronco 2 px dentro de la hierba
}
// Lo que va delante del fondo, por profundidad. o: house (1–3), lab (1–4), shop (0–5), keeper, sci, sleeper (ratones o null).
function drawSurface(g, now, o = {}) {
  const P = SPL, hs = o.house ?? 3, ls = o.lab ?? 4, ts = o.shop ?? 5, put = (cv, x, base) => { groundShadow(g, x, base, cv.width); g.drawImage(cv, x, base - cv.height + 1); };
  // HOUSE: I (houseStage) o II–III (houseV3), con el cuerpo de la casa siempre en el mismo sitio al evolucionar.
  if (hs === 1) { const cv = houseStage(1); put(cv, SPOS.house + 22, GH1 + 2); vfxSmoke(g, SPOS.house + 22 + 47, GH1 + 2 - 58 + 6, now); }
  else { const cv = houseV3(hs), x = SPOS.house + (hs >= 3 ? 0 : 24); put(cv, x, GH1 + 2); vfxSmoke(g, SPOS.house + 24 + 57, GH1 + 2 - 76 + 10, now); }
  g.drawImage(bush(1).canvas(), 112, GH1 - 7);
  // LAB (a su izquierda queda el hueco reservado de FORBIDDEN GENETICS).
  const lab = labV2(ls); put(lab, SPOS.lab, GL1); vfxBubbles(g, SPOS.lab + 26, GL1 - 30, now);
  const blink = Math.floor(now / 700) % 2; g.fillStyle = blink ? '#ff6a5a' : '#7a2a24'; g.fillRect(SPOS.lab + 20, GL1 - 79, 1, 1);
  g.drawImage(signPost2(), 230, GL1 - 17);
  // SHOP con el tendero detrás del mostrador y los lotes encima.
  const sx = SPOS.shop, sy = GR1 - SHOP_H + 1; groundShadow(g, sx, GR1, 58);
  g.drawImage(shopBack(ts), sx, sy); shopFlag(g, sx + 4, sy + 1, ts, now);
  if (o.keeper !== null) { const m = o.keeper || CREW.town.keeper, cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, (now + m.name.length * 997) % 3300 < 110, {}); g.drawImage(cv, sx + 19, sy + 48 - 20); } // de pie tras el mostrador: asoman sombrero, cara y hombros
  g.drawImage(shopFront(ts), sx, sy); shopLots(g, sx, sy, o.lots ?? 3);
  if (ts >= 3) vfxGlow(g, sx + 55, sy + 28, 8, now);
  put(pantrySprite2(), SPOS.pantry, GR1 + 1);
  // Castillete con su polea (gira solo con el montacargas en marcha).
  put(headframe2(), SPOS.head, GR1 + 1); g.drawImage(pulleySprite(o.lift ? Math.floor(now / 120) % 3 : 0), SPOS.head + 9, GR1 + 1 - 74 + 8);
  g.drawImage(bush(0).canvas(), 384, GR1 - 7); g.drawImage(fence(3).canvas(), 96, GH1 - 8); g.drawImage(bench().canvas(), 196, GL1 - 8); g.drawImage(lampPost().canvas(), 214, GL1 - 23); vfxGlow(g, 217, GL1 - 20, 9, now);
  // El investigador en la puerta del laboratorio (pose aprobada del libro).
  if (o.sci !== null) { const m = o.sci || CREW.town.sci, cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, false, { book: Math.floor(now / 900) % 2 ? 2 : 1 }); g.save(); g.translate(SPOS.lab + 10 + 22, GL1 - 20); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); }
  // Madriguera: la cama y su secuencia aprobada; la pared de la izquierda tapa la boca del túnel por delante.
  if (o.sleeper !== null) {
    drawBedFrame(g, now % BT.end, o.sleeper || CREW.town.idle, BED1.bx, BED1.by);
    tunnelVeil(g, ROOM.x, BED1.by, BED1.by + 22, now % BT.end);
    vfxGlow(g, ROOM.x + 64, ROOM.y + 11, 11, now, '#ffd890');
  }
}
