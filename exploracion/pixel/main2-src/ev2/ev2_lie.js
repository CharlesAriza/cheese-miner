// ---------- NUEVA POSE (para aprobar aparte): tumbado boca abajo, de perfil ----------
// No toca el sprite oficial: es una plantilla nueva con las mismas letras de paleta (pelo g/G/D, oreja p/q, ojo k, nariz n/N,
// mejilla c, barriga s, patas f/F, cola T/t) y la misma cabeza de perfil, píxel a píxel. Lo nuevo es el cuerpo: en horizontal,
// detrás de la cabeza (como un ratón dormido con la barbilla sobre las patas), con la espalda, la barriga, las patas delanteras
// bajo la barbilla, la pata trasera y la cola. Cada ratón conserva su pelo, su sombrero y su bufanda (mismas reglas que
// mouseCanvas). La mochila se cuelga del pie de la cama.
// Cabeza oficial (filas 0–5 de BODY) con los ojos cerrados (la cara oficial «sleep») o abiertos.
const HEAD_SLEEP = ['.DDD..gggggggG..', 'DppqD.ggggKGGK..', 'DpqqDggggGGKKGGn', 'DpqqDGggGGGGGGGN', '.DDDDGGGGcGGGGD.', '....DDGGGGGGGD..'];
const HEAD_OPEN = ['.DDD..gggggggG..', 'DppqD.ggggGkwG..', 'DpqqDggggGGkkGGn', 'DpqqDGggGGGGGGGN', '.DDDDGGGGcGGGGD.', '....DDGGGGGGGD..'];
const EAR_LOW = ['.....', '.DDD.', 'DppqD', 'DpqqD', 'DDDDD'];
// Cuerpo tumbado (filas 6–11 del lienzo, columnas 0–19; la cabeza empieza en la columna 10). lift: la espalda se hincha 1 px.
const LIE_BODY = (lift) => [
  lift ? '....ggg.............' : '....................',
  '...Dgggg............',
  '..Dgggggggg.........',
  '.DggggGGGGGGG.......',
  'TDgGGGGGGGGGGGGGG...',
  'TDGGGGGGGGGGGGGGGG..',
  '.tDGssssssssGGGGGGG.',
  '..tDffF......DffFF..',
];
function lyingMouse(m, o = {}) {
  const key = 'lie' + m.name + JSON.stringify(o);
  return art(key, () => {
    const W = 27, H = 12, gr = Array.from({ length: H }, () => Array(W).fill(null)), pal = { ...BASE }, h = hashS(m.name);
    const fur = m.rar === 2 ? 'gold' : m.rar === 1 ? (h % 2 ? 'mint' : 'lilac') : COMMON[h % COMMON.length];
    [pal.g, pal.G, pal.D] = FURS[fur]; pal.K = pal.k;
    let hatRows;
    if (m.rar === 2) { hatRows = HATS.crown; Object.assign(pal, { Y: '#fff3a0', H: '#ffc21e', h: '#d9680c', r: '#e2462f' }); }
    else if (m.rank >= 2 && UNI[m.skill]) { const u = UNI[m.skill]; hatRows = HATS[u.hat]; Object.assign(pal, u); }
    else { const oh = OWN_HATS[(h >>> 5) % OWN_HATS.length]; hatRows = HATS[oh[0]]; Object.assign(pal, { Y: oh[1], H: oh[2], h: oh[3] }); }
    if (m.rank >= 3) pal.h = '#ffcf2e';
    const put = (rows, x0, y0) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && y0 + j >= 0 && y0 + j < H && x0 + i < W) gr[y0 + j][x0 + i] = ch; }));
    const HX = 10, HY = 4 + (o.raise || 0);
    put(LIE_BODY(o.lift ? 1 : 0), 0, 4);
    let head = (o.eyes === 'open' ? HEAD_OPEN : HEAD_SLEEP).slice();
    if (o.ear) head = head.map((r, i) => (i < 5 ? EAR_LOW[i] + r.slice(5) : r));
    put(head, HX, HY);
    put(hatRows, HX, HY - 4);
    const draw = [];
    const sc = SCARF[Math.min(3, m.rank)]; if (sc) { for (let x = HX + 3; x < HX + 8; x++) { draw.push([x, HY + 5, sc[0]], [x, HY + 6, sc[1]]); } }
    const c = document.createElement('canvas'); c.width = W + 2; c.height = H + 2; const x2 = c.getContext('2d');
    const filled = (x, y) => (gr[y] && gr[y][x]) || draw.some((d) => d[0] === x && d[1] === y);
    for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) { const ch = gr[y] && gr[y][x]; if (ch) { x2.fillStyle = pal[ch] || '#f0f'; x2.fillRect(x + 1, y + 1, 1, 1); } else if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) { x2.fillStyle = pal.o; x2.fillRect(x + 1, y + 1, 1, 1); } }
    for (const [x, y, cc] of draw) { x2.fillStyle = cc; x2.fillRect(x + 1, y + 1, 1, 1); }
    return c;
  });
}
// Mochila del ratón (sus colores de mochila), colgada del pie de la cama.
function packOf(m) { const h = hashS(m.name); return PACKS[(h >>> 3) % PACKS.length]; }

// ---------- La escena: cama con cabecero a la derecha (la cabeza va hacia él), almohada, manta y mochila colgada ----------
const bedLie = () => art('bedLie', () => {
  const c = PB(52, 22), P = PAL;
  vol(c, 47, 0, 5, 22, P.woo, { side: 1, ao: 1 }); c.ell(49.5, 0.5, 3, 2.2, P.woo[1]); c.hline(48, 6, 3, P.woo[3]); c.hline(48, 11, 3, P.woo[3]);
  vol(c, 0, 9, 5, 13, P.woo, { side: 1, ao: 1 }); c.ell(2.5, 9, 2.6, 1.8, P.woo[1]);
  vol(c, 5, 14, 42, 4, P.cre, { side: 1, ao: 1, face: 1 }); vol(c, 5, 18, 42, 2, P.woo, { side: 0, ao: 0 }); c.hline(5, 19, 42, P.woo[4]);
  for (const x of [6, 44]) c.rect(x, 20, 2, 2, P.woo[3]);
  closeGaps(c); c.outline(); return c.canvas();
});
const pillowLie = () => art('pillowLie', () => { const c = PB(14, 6); c.ell(7, 3, 6.6, 2.8, (x, y) => (y < 2 ? '#fffdf2' : y < 4 ? '#f4ecd6' : '#dccc9e')); c.hline(10, 2, 2, '#dccc9e'); c.outline(); return c.canvas(); });
// Manta: sigue el perfil del cuerpo (1 px por encima de su contorno) desde los pies de la cama y cae en diagonal sobre las
// patas de atrás (columna 2 del cuerpo arriba, 5–6 sobre el colchón), con el embozo blanco a lo largo del borde. Deja a la vista la
// espalda, el pecho, las patas delanteras y la cabeza. cover: 0 = doblada a los pies, 1 = tapado. lift: respira con la espalda.
const LIE_TOP = (lift) => { const rows = LIE_BODY(lift); return Array.from({ length: 20 }, (_, c) => rows.findIndex((r) => r[c] !== '.')); };
function blanketLie(g, bx, mat, LX, cover, lift) {
  const x0 = bx + 5, x1 = LX + 1 + 2, xe = Math.round(x0 + (x1 - x0) * cover), ox = bx + 3, oy = mat - 12;
  const cv = art('blk' + (xe - bx) + '_' + (LX - bx) + '_' + lift, () => {
    const B = ['#d8ecff', '#8ab4ec', '#5a84cc', '#3a5aa0', '#243868'], top = LIE_TOP(lift), c = PB(x1 - ox + 10, 18);
    const P = (x, y, col) => c.px(x - ox, y - oy, col), tt = (x) => { const col = x - LX - 1; return col < 0 ? mat - 2 : Math.min(mat - 2, mat - 8 + top[Math.min(19, col)]); };
    if (xe - x0 < 4) { // doblada a los pies: un rollo de cuatro capas
      for (let x = x0; x < x0 + 6; x++) { P(x, mat - 3, B[1]); P(x, mat - 2, B[2]); P(x, mat - 1, '#fffdf2'); for (let y = mat; y <= mat + 2; y++) P(x, y, y === mat + 2 ? B[4] : B[3]); }
      c.outline(); return c.canvas();
    }
    const te = tt(xe);
    for (let x = x0; x <= xe + 6; x++) for (let y = tt(x); y <= mat + 2; y++) {
      const edge = xe + Math.max(0, Math.floor((y - te) / 2)); if (x > edge) continue;
      let k = y === tt(x) ? B[1] : y > mat ? B[3] : B[2];
      if (y === mat + 2) k = B[4];
      if (x >= edge - 1 && y <= mat) k = x === edge ? '#dccc9e' : '#fffdf2';
      P(x, y, k);
    }
    c.outline(); return c.canvas();
  });
  g.drawImage(cv, ox, oy);
}
// Bucle de 12 s. La cama en (bx, by); el suelo en by + 22.
const LIE_T = [1400, 1800, 2300, 3200, 8000, 8700, 9500, 9800, 10200, 12000];
function sceneLie(g, bx, by, m, t, o = {}) {
  const floor = by + 22, mat = by + 14, P = PAL, ph = LIE_T.findIndex((v) => t < v);
  g.drawImage(bedLie(), bx, by);
  // Mochila colgada del pie de la cama (se ve mientras duerme).
  const pk = packOf(m); if (ph >= 2 && ph <= 7) { g.fillStyle = INK; g.fillRect(bx + 1, by + 10, 6, 7); g.fillStyle = pk[1]; g.fillRect(bx + 2, by + 11, 4, 5); g.fillStyle = pk[0]; g.fillRect(bx + 2, by + 11, 4, 1); g.fillStyle = pk[2]; g.fillRect(bx + 2, by + 14, 4, 1); }
  g.drawImage(pillowLie(), bx + 33, mat - 4);
  const LX = bx + 12, LY = mat - 12; // dónde queda el ratón tumbado (la barbilla sobre la almohada)
  const stand = (x, feet, flip, oo = {}) => { const cv = mF(m, 0, false, oo); if (flip) { g.save(); g.translate(x + 22, feet - 20); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20); };
  const legs = { legs: Math.floor(t / 120) % 2 ? 'a' : 'b' }, BL = (cov, lift = 0) => blanketLie(g, bx, mat, LX, cov, lift);
  if (o.sleepOnly) { const lift = t % 2400 > 1600 ? 1 : 0; g.drawImage(lyingMouse(m, { lift }), LX, LY); BL(1, lift); zzz(g, LX + 22, LY - 2, t); return; }
  if (ph === 0) { const k = t / 1400; stand(Math.round(bx - 40 + k * 26), floor, false, legs); }
  else if (ph === 1) { const k = (t - 1400) / 400, x = Math.round(bx - 14 + k * 16), hop = Math.round(Math.sin(k * Math.PI) * 6); stand(x, Math.round(floor + (mat - floor) * Math.min(1, k * 1.3)) - hop, false); }
  else if (ph === 2) { if (t < 1950) stand(bx + 2, mat, false, {}); else { const r = t < 2100 ? -3 : t < 2200 ? -1 : 0; g.drawImage(lyingMouse(m, { eyes: 'open' }), LX, LY + r); BL(0); } }
  else if (ph === 3) { const step = Math.min(3, 1 + Math.floor(((t - 2300) / 900) * 3)); g.drawImage(lyingMouse(m, { eyes: step < 3 ? 'open' : 'sleep' }), LX, LY); BL(step / 3); }
  else if (ph === 4) { const lift = t % 2400 > 1600 ? 1 : 0; g.drawImage(lyingMouse(m, { lift }), LX, LY); BL(1, lift); zzz(g, LX + 22, LY - 2, t); }
  else if (ph === 5) { const tw = t - 8000; g.drawImage(lyingMouse(m, { eyes: 'open', ear: tw > 200 && tw < 350, raise: tw > 400 ? -1 : 0 }), LX, LY); BL(1); }
  else if (ph === 6) { const step = Math.min(3, 1 + Math.floor(((t - 8700) / 800) * 3)); g.drawImage(lyingMouse(m, { eyes: 'open', raise: -1 }), LX, LY); BL((3 - step) / 3); }
  else if (ph === 7) { if (t < 9600) { g.drawImage(lyingMouse(m, { eyes: 'open', raise: -2 }), LX, LY); BL(0); } else { stand(bx + 14, mat - 1, true, { face: 'happy' }); BL(0); } }
  else if (ph === 8) { const k = (t - 9800) / 400, hop = Math.round(Math.sin(k * Math.PI) * 6); stand(Math.round(bx + 14 - k * 24), Math.round(mat + (floor - mat) * k) - hop, true); BL(0); }
  else { const k = (t - 10200) / 1800; stand(Math.round(bx - 10 - k * 40), floor, true, legs); BL(0); }
}
// Z pequeñas (3 y 4 px), con contorno, subiendo en diagonal y desapareciendo por pasos.
function zzz(g, x, y, t) { const z = (t % 2700) / 2700; [[Z3, 0], [Z4, 0.5]].forEach(([rows, d], i) => { const k = (z + 1 - d) % 1; if (k > 0.7) return; g.drawImage(zGlyph(rows), x + i * 4 + Math.round(k * 3), y - i * 4 - Math.round(k * 6)); }); }
