// ---------- HOUSE SLEEP · tres poses estáticas para aprobar (21-10-2026) ----------
// Reglas del propietario: proporciones de MICE (cuerpo compacto y redondo, cabeza grande, orejas y hocico propios), nada de
// girar, estirar o deformar el sprite de pie; mejor pequeño y acurrucado que estirado; la cama y la manta se adaptan al ratón.
// Cómo están hechas: la cabeza es la oficial (filas 0–5 de BODY) con la cara oficial «sleep», tal cual; el cuerpo se dibuja a
// mano para cada pose con las mismas letras de paleta (pelo g/G/D, barriga w/s, patas f/F, cola T) y el mismo volumen que el
// torso y las patas oficiales, recogido. Sombrero y bufanda salen de las mismas reglas que mouseCanvas; la mochila se quita
// (se cuelga en la cama). Contorno: el de los ratones (pal.o), por fuera de la silueta.
const HEAD_OPEN3 = BODY.slice(0, 6);
// Cara oficial «sleep»: fila 1, x 10 y 13 ojo, x 11–12 pelo; fila 2, x 11–12 ojo (un arco cerrado).
const HEAD_SLEEP3 = HEAD_OPEN3.map((r, i) => (i === 1 ? r.slice(0, 10) + 'kGGk' + r.slice(14) : r));
// Cada pose: lienzo W × H, capas bajo la cabeza (cuerpo), posición de la cabeza (HX, HY), capas encima (patas, cola) y dónde
// va la bufanda. Las filas de cada capa empiezan en su [x, y].
const POSES = {
  // A · Acurrucado: el cuerpo es una bola (el volumen del torso y las patas oficiales, recogido: unos 11 × 9 px) que sube por
  // detrás de la cabeza; la oreja descansa sobre ella, la barbilla sobre las patas delanteras y la cola rodea la bola por abajo.
  A: {
    W: 21, H: 12, head: [5, 5],
    under: [[0, 3, ['...ggggG', '.ggggggggG', 'gggggggggGG', 'ggggggGGGGG', 'gggGGGGGGGG', 'ggGGGGGGGGG', 'DGGGGGGGGGG', 'DDGGGGGGGGD', '.DDDDDDDDD']]],
    over: [[12, 11, ['ffFffF']], [0, 10, ['T']], [1, 11, ['TTTTTTTTTT']]],
    scarf: [[9, 10, 3, 'L'], [10, 11, 2, 'D']],
  },
  // B · De lado, compacto: la misma bola un poco girada hacia nosotros; enseña la barriga clara, las plantas de las patas de
  // atrás abajo y las de delante juntas bajo la barbilla. La cola sube en gancho por detrás.
  B: {
    W: 24, H: 12, head: [8, 5],
    under: [[1, 4, ['...ggggG', '.gggggggggG', 'ggggggggGGGG', 'gggGGGGGGGGG', 'ggGGwwwwwGGG', 'gGGwwwwwwwGG', 'DGwwwwwwwsGG', '.DffFFssssDD']]],
    over: [[14, 11, ['fFfF']], [0, 6, ['T', 'T', 'T', 'T']], [1, 5, ['T']], [2, 4, ['T']], [3, 3, ['TT']]],
    scarf: [[12, 10, 3, 'L'], [13, 11, 1, 'D']],
  },
  // C · Semitumbado: la mitad de arriba del ratón oficial (cabeza, pecho y brazo, filas 0–9 de BODY sin la mochila) con la
  // espalda en la almohada y la cabeza 1 px hacia atrás. De cintura para abajo, las piernas bajo la manta (bedScene); las
  // patas delanteras descansan encima de la manta (capa Cp, se pinta después de ella).
  C: {
    W: 18, H: 13, head: [1, 3],
    under: [[9, 9, ['DGwwwD', 'DGwwsGG', 'DGwwsDD', 'DGwssGG']]],
    over: [],
    scarf: [[6, 8, 8, 'L'], [6, 9, 8, 'D'], [13, 9, 2, 'L'], [14, 10, 1, 'D']],
  },
  Cp: { W: 18, H: 13, head: null, under: [], over: [[13, 11, ['ffFF']]], scarf: [] },
};
// La bufanda de cada rango, con la geometría de la oficial (dos filas de luz y sombra y el nudo) donde la pose deja ver el cuello.
function poseCanvas(m, key, o = {}) {
  const pk = 'pose' + key + m.name + JSON.stringify(o);
  return art(pk, () => {
    const D0 = POSES[key], W = D0.W, H = D0.H, gr = Array.from({ length: H }, () => Array(W).fill(null)), pal = { ...BASE }, h = hashS(m.name);
    const fur = m.rar === 2 ? 'gold' : m.rar === 1 ? (h % 2 ? 'mint' : 'lilac') : COMMON[h % COMMON.length];
    [pal.g, pal.G, pal.D] = FURS[fur];
    let hatRows;
    if (m.rar === 2) { hatRows = HATS.crown; Object.assign(pal, { Y: '#fff3a0', H: '#ffc21e', h: '#d9680c', r: '#e2462f' }); }
    else if (m.rank >= 2 && UNI[m.skill]) { const u = UNI[m.skill]; hatRows = HATS[u.hat]; Object.assign(pal, u); }
    else { const oh = OWN_HATS[(h >>> 5) % OWN_HATS.length]; hatRows = HATS[oh[0]]; Object.assign(pal, { Y: oh[1], H: oh[2], h: oh[3] }); }
    if (m.rank >= 3) pal.h = '#ffcf2e';
    const put = (rows, x0, y0) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && y0 + j >= 0 && y0 + j < H && x0 + i >= 0 && x0 + i < W) gr[y0 + j][x0 + i] = ch; }));
    for (const [x, y, rows] of D0.under) put(rows, x, y);
    if (D0.head) { const [HX, HY] = D0.head; put(o.eyes === 'open' ? HEAD_OPEN3 : HEAD_SLEEP3, HX, HY); put(hatRows, HX, HY - 4); }
    for (const [x, y, rows] of D0.over) put(rows, x, y);
    const draw = [], sc = SCARF[Math.min(3, m.rank)];
    if (sc) for (const [x, y, w, t] of D0.scarf) for (let i = 0; i < Math.max(1, w); i++) draw.push([x + i, y, t === 'L' ? sc[0] : sc[1]]);
    const c = document.createElement('canvas'); c.width = W + 2; c.height = H + 2; const x2 = c.getContext('2d');
    const filled = (x, y) => (gr[y] && gr[y][x]) || draw.some((d) => d[0] === x && d[1] === y);
    for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) { const ch = gr[y] && gr[y][x]; if (ch) { x2.fillStyle = pal[ch] || '#f0f'; x2.fillRect(x + 1, y + 1, 1, 1); } else if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) { x2.fillStyle = pal.o; x2.fillRect(x + 1, y + 1, 1, 1); } }
    for (const [x, y, cc] of draw) { x2.fillStyle = cc; x2.fillRect(x + 1, y + 1, 1, 1); }
    return c;
  });
}

// ---------- La cama a la medida del ratón acurrucado (estática) ----------
// 46 × 22: cabecero a la derecha, pie a la izquierda, colchón de 36 px (el ratón de pie mide 16 de ancho; acurrucado, 24–27).
const bed3 = () => art('bed3', () => {
  const c = PB(46, 22), P = PAL;
  vol(c, 41, 0, 5, 22, P.woo, { side: 1, ao: 1 }); c.ell(43.5, 0.5, 3, 2.2, P.woo[1]); c.hline(42, 6, 3, P.woo[3]); c.hline(42, 11, 3, P.woo[3]);
  vol(c, 0, 9, 5, 13, P.woo, { side: 1, ao: 1 }); c.ell(2.5, 9, 2.6, 1.8, P.woo[1]);
  vol(c, 5, 14, 36, 4, P.cre, { side: 1, ao: 1, face: 1 }); vol(c, 5, 18, 36, 2, P.woo, { side: 0, ao: 0 }); c.hline(5, 19, 36, P.woo[4]);
  for (const x of [6, 38]) c.rect(x, 20, 2, 2, P.woo[3]);
  closeGaps(c); c.outline(); return c.canvas();
});
// Almohada alta, apoyada en el cabecero, para recostarse (C).
const pillowUp = () => art('pillowUp', () => { const c = PB(10, 10); c.ell(5, 5, 4.4, 4.6, (x, y) => (x < 4 && y < 5 ? '#fffdf2' : y < 7 ? '#f4ecd6' : '#dccc9e')); c.vline(7, 3, 4, '#dccc9e'); c.outline(); return c.canvas(); });
const pillow3 = () => art('pillow3', () => { const c = PB(12, 6); c.ell(6, 3, 5.6, 2.6, (x, y) => (y < 2 ? '#fffdf2' : y < 4 ? '#f4ecd6' : '#dccc9e')); c.hline(8, 2, 2, '#dccc9e'); c.outline(); return c.canvas(); });
// Manta que sigue la silueta del ratón: en cada columna su borde de arriba va 1 px por encima del contorno del ratón (lo tapa
// sin aplastarlo); fuera del ratón, 1 px sobre el colchón; cuelga 3 px por el lado del colchón. top(x) da esa altura.
// edge(y) es hasta dónde llega en cada fila (un borde en diagonal cae como una tela); skip(x, y) deja fuera lo que va delante
// de la manta (la cabeza del ratón). El embozo blanco sigue el borde. Un solo contorno exterior.
function blanket3(g, x0, top, edge, mat, dir = 1, skip = () => false, fold = true) {
  const B = ['#d8ecff', '#8ab4ec', '#5a84cc', '#3a5aa0', '#243868'], xs = [], pts = [];
  for (let y = mat - 16; y <= mat + 2; y++) { const e = edge(y); for (let x = x0; dir > 0 ? x <= e : x >= e; x += dir) { if (top(x) > y) continue; if (skip(x, y)) continue; pts.push([x, y, e]); xs.push(x); } }
  if (!pts.length) return;
  const ox = Math.min(...xs) - 1, oy = mat - 17, c = PB(Math.max(...xs) - ox + 2, 22);
  for (const [x, y, e] of pts) { let k = y === top(x) ? B[1] : y > mat ? B[3] : B[2]; if (y === mat + 2) k = B[4]; const d = (e - x) * dir; if (fold && d <= 1 && y <= mat) k = d === 0 ? '#dccc9e' : '#fffdf2'; c.px(x - ox, y - oy, k); }
  c.outline(); g.drawImage(c.canvas(), ox, oy);
}
// Píxeles de la cabeza de una pose (en coordenadas del lienzo, que lleva 1 px de margen): lo que nunca tapa la manta.
function headMask(key) { const D0 = POSES[key], set = new Set(); if (!D0.head) return set; const [HX, HY] = D0.head; HEAD_OPEN3.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') set.add(`${HX + i + 1},${HY + j + 1}`); })); return set; }
// Altura del contorno de un lienzo en cada columna (la primera fila opaca), para que la manta se ciña al ratón.
function topsOf(cv, flip) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, w = cv.width, out = []; for (let x = 0; x < w; x++) { const xx = flip ? w - 1 - x : x; let y = 0; while (y < cv.height && d[(y * w + xx) * 4 + 3] < 128) y++; out.push(y); } return out; }
// Escena estática de cada pose en la cama. Capas, de atrás adelante: cama (cabecero, pie, colchón) · almohada · ratón · manta
// (solo la parte que lo tapa) · lo que va encima de la manta (las patas de C) · las Z.
function bedScene(g, bx, by, m, key, o = {}) {
  const mat = by + 14, P = PAL;
  g.drawImage(bed3(), bx, by);
  const pk = packOf(m); g.fillStyle = INK; g.fillRect(bx + 1, by + 10, 6, 7); g.fillStyle = pk[1]; g.fillRect(bx + 2, by + 11, 4, 5); g.fillStyle = pk[0]; g.fillRect(bx + 2, by + 11, 4, 1); g.fillStyle = pk[2]; g.fillRect(bx + 2, by + 14, 4, 1);
  if (key === 'C') g.drawImage(pillowUp(), bx + 31, mat - 9); else g.drawImage(pillow3(), bx + 30, mat - 5);
  const cv = poseCanvas(m, key, o.eyes ? { eyes: o.eyes } : {});
  if (key === 'C') {
    // Mirando hacia el pie de la cama, con la espalda en la almohada: el lienzo se pinta en espejo.
    const sx = bx + 40 - cv.width, sy = mat - cv.height + 1;
    g.save(); g.translate(sx + cv.width, sy); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore();
    if (o.blanket !== false) {
      // Piernas bajo la manta: plana sobre el colchón, con el bulto de los pies al final; sobre el cuerpo, hasta la cintura.
      // El regazo (filas 11 y 12 de la pose) queda bajo la manta; el pecho, el brazo y la cabeza, fuera.
      const lap = sy + 12, body0 = sx + cv.width - 1 - 16, foot = bx + 12;
      blanket3(g, bx + 5, (x) => Math.min(mat - 1, x >= body0 ? lap : x <= foot && x >= foot - 3 ? mat - 4 : x < foot - 3 ? mat - 2 : mat - 3), () => sx + cv.width - 1 - 9, mat);
      const pw = poseCanvas(m, 'Cp'); g.save(); g.translate(sx + cv.width, sy); g.scale(-1, 1); g.drawImage(pw, 0, 0); g.restore();
    }
    return;
  }
  const sx = bx + 39 - cv.width, sy = mat - cv.height + 1, T = topsOf(cv, false);
  g.drawImage(cv, sx, sy);
  if (o.blanket !== false) {
    // Solo la grupa: el borde de la manta cae en diagonal desde la columna 3 de la bola (1 px cada 2 filas) y por detrás baja
    // al colchón en pendiente suave, como una tela, en vez de cortarse en vertical. Lomo, oreja y cabeza quedan a la vista.
    const L = T.findIndex((v) => v < cv.height), e0 = sx + 3, y0 = sy + T[3], H = headMask(key);
    const top = (x) => (x >= sx + L ? (x - sx < T.length ? sy + T[x - sx] : mat - 1) : sy + T[L] + Math.floor((sx + L - x) * 0.6));
    blanket3(g, bx + 5, (x) => Math.min(mat - 1, top(x)), (y) => e0 + Math.max(0, Math.floor((y - y0) / 2)), mat, 1, (x, y) => H.has(`${x - sx},${y - sy}`));
  }
}
function zzz3(g, x, y) { g.drawImage(zGlyph(Z3), x, y); g.drawImage(zGlyph(Z4), x + 4, y - 5); }

// ---------- La versión elegida por el propietario (21-10-2026) ----------
// Tapado: el ratón acurrucado (pose A) con la manta hasta la cabeza; la manta sigue la bola por arriba y acaba en vertical
// donde empieza la cara, sin embozo blanco. Destapado: el mismo ratón acurrucado, con la manta doblada a los pies.
// Capas: cama · almohada · manta en reposo (destapado) · ratón · manta que lo tapa (tapado) · Z.
const SLEEP_X = 41; // el lienzo del ratón acaba a 41 px del pie de la cama: la cara queda sobre la almohada
function blanketFolded(g, bx, mat) {
  const B = ['#d8ecff', '#8ab4ec', '#5a84cc', '#3a5aa0', '#243868'];
  const c = art('blkFold', () => { const p = PB(9, 8); for (let x = 1; x < 8; x++) { p.px(x, 1, B[1]); p.px(x, 2, B[2]); p.px(x, 3, B[1]); for (let y = 4; y <= 6; y++) p.px(x, y, y === 6 ? B[4] : B[3]); } p.outline(); return p.canvas(); });
  g.drawImage(c, bx + 4, mat - 4);
}
function sleepBed(g, bx, by, m, state = 'covered', o = {}) {
  const mat = by + 14;
  g.drawImage(bed3(), bx, by);
  const pk = packOf(m); g.fillStyle = INK; g.fillRect(bx + 1, by + 10, 6, 7); g.fillStyle = pk[1]; g.fillRect(bx + 2, by + 11, 4, 5); g.fillStyle = pk[0]; g.fillRect(bx + 2, by + 11, 4, 1); g.fillStyle = pk[2]; g.fillRect(bx + 2, by + 14, 4, 1);
  g.drawImage(pillow3(), bx + 30, mat - 5);
  if (state !== 'covered') blanketFolded(g, bx, mat);
  const cv = poseCanvas(m, 'A', o.eyes ? { eyes: o.eyes } : {}), sx = bx + SLEEP_X - cv.width, sy = mat - cv.height + 1, T = topsOf(cv, false);
  g.drawImage(cv, sx, sy);
  if (state === 'covered') blanket3(g, bx + 5, (x) => Math.min(mat - 2, x >= sx && x - sx < T.length ? sy + T[x - sx] : mat - 2), () => sx + 10, mat, 1, () => false, false);
}
