// ---------- REFINE · restauración (A: V4.1 tal cual · B: V4.1 con limpieza selectiva) ----------
// A usa las mismas funciones y posiciones que drawCheddar de V4.1 (artFurnace, artStill, artTray, artBar, fire, glow y la
// chimenea de paintCheddar). B es A píxel a píxel con un único cambio: completa el contorno donde V4.1 lo perdía (ver refBase).
// Geometría, materiales, fuego, junta entre horno y alambique y detalles: iguales.
const RX0 = 6; // margen a la izquierda para el fuelle de la fase III
// ---- A · V4.1 original (lienzo 72 × 56; el horno empieza en x = 6) ----
function refineA(g, x, y, t, o = {}) {
  const was = ctx; ctx = g; const X = x + RX0;
  try {
    R(X + 13, y, 5, 15, INK4); R(X + 14, y, 3, 15, MAT.iron[1]); R(X + 14, y, 1, 15, MAT.iron[2]); R(X + 12, y + 12, 7, 3, MAT.iron[1]);
    ctx.drawImage(artFurnace(), X, y + 14);
    const pw = o.pw ?? 0.72 + 0.18 * Math.sin(t / 170);
    fire(X + 10, y + 33, 10, 12, t, Math.min(1, pw)); glow(X + 15, y + 40, '#ff8a2e', Math.round(10 + 7 * pw));
    ctx.drawImage(artStill(), X + 28, y + 18);
    const a = -2.2 + (o.k || 0) * 2.6; R(X + 41 + Math.round(Math.cos(a) * 1.4), y + 36 + Math.round(Math.sin(a) * 1.4), 1, 1, INK4); R(X + 41, y + 36, 1, 1, INK4);
    ctx.drawImage(artTray(), X + 47, y + 46); for (let i = 0; i < Math.min(3, o.bars ?? 2); i++) ctx.drawImage(artBar(), X + 48 + i * 4, y + 45);
    if (o.run !== false) { const d = Math.floor((t % 1400) / 150); if (t % 1400 < 900) R(X + 54, y + 39 + d, 1, 1, MAT.cream[3]); }
  } finally { ctx = was; }
}
// Base de B: los píxeles de A tal cual, más la tinta que le falta. En V4.1 no hay contornos dobles; lo que hay son tramos sin
// contorno donde una pieza llenaba su lienzo hasta el borde y su tinta se quedaba fuera (las paredes rectas y la base del horno,
// los lados y el fondo del molde, el collarín de la chimenea). Un píxel vacío gana tinta si toca un píxel de A que no es tinta;
// donde A ya tiene su línea (la cúpula del horno, el alambique, la junta entre los dos) no se añade nada, así que no sale
// ninguna línea doble. No cambia ni un píxel de dentro.
const mk72 = (f) => { const c = document.createElement('canvas'); c.width = 72; c.height = 56; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const was = ctx; ctx = g; try { f(g); } finally { ctx = was; } return c; };
const isInk = (d, i) => d[i] === 0x1b && d[i + 1] === 0x12 && d[i + 2] === 0x20;
const refStaticA = () => art('refStaticA', () => mk72((g) => { const X = RX0; R(X + 13, 0, 5, 15, INK4); R(X + 14, 0, 3, 15, MAT.iron[1]); R(X + 14, 0, 1, 15, MAT.iron[2]); R(X + 12, 12, 7, 3, MAT.iron[1]); g.drawImage(artFurnace(), X, 14); g.drawImage(artStill(), X + 28, 18); g.drawImage(artTray(), X + 47, 46); }));
const refBase = () => art('refBase', () => {
  const a = mk72((g) => g.drawImage(refStaticA(), 0, 0)), ga = a.getContext('2d'), im2 = ga.getImageData(0, 0, 72, 56), d = im2.data;
  const at = (x, y) => (x >= 0 && y >= 0 && x < 72 && y < 56 && d[(y * 72 + x) * 4 + 3] > 127 ? (y * 72 + x) * 4 : -1), add = [];
  for (let y = 0; y < 56; y++) for (let x = 0; x < 72; x++) if (at(x, y) < 0 && [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(([u, v]) => { const i = at(u, v); return i >= 0 && !isInk(d, i); })) add.push((y * 72 + x) * 4);
  for (const i of add) { d[i] = 0x1b; d[i + 1] = 0x12; d[i + 2] = 0x20; d[i + 3] = 255; }
  ga.putImageData(im2, 0, 0); a.added = add.length; return a;
});
// Contorno solo alrededor de lo nuevo (fases y refuerzo): un píxel vacío gana tinta si toca una pieza nueva, nunca por tocar
// la base, para que la silueta de V4.1 no engorde.
function outlineNew(c, base) {
  const g = c.getContext('2d'), w = c.width, h = c.height, im2 = g.getImageData(0, 0, w, h), d = im2.data, bd = base.getContext('2d').getImageData(0, 0, w, h).data;
  const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 127, N = (x, y) => A(x, y) && bd[(y * w + x) * 4 + 3] <= 127, add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!A(x, y) && (N(x - 1, y) || N(x + 1, y) || N(x, y - 1) || N(x, y + 1))) add.push(y * w + x);
  for (const i of add) { d[i * 4] = 0x1b; d[i * 4 + 1] = 0x12; d[i * 4 + 2] = 0x20; d[i * 4 + 3] = 255; }
  g.putImageData(im2, 0, 0);
}
// Lienzo B estático por fase y refuerzo. Fase II (Hot Furnace): aros de hierro en el horno y caperuza en la chimenea.
// Fase III (además): fuelle de cuero a la izquierda y cúpula de presión de latón en el alambique.
// BOOST (anclado a las mismas coordenadas en todas las fases): gema en el frente del horno, columna de extracción de vidrio
// junto al serpentín con su segundo caño sobre el molde, y la segunda gema en la tapa de la columna.
function refineB(stage = 1, boost = 0, on = true) {
  return art(`refB${stage}${boost}${on}`, () => {
    const X = RX0, P = PAL, base = refBase();
    // Detrás de la base: el fuelle y la columna de extracción.
    const back = mk72(() => {
      if (stage >= 3) { for (let i = 0; i < 7; i++) { const h = 3 + Math.round(i * 0.9); R(X - 6 + i, 43 - h, 1, h * 2, i % 2 ? P.brn[2] : P.brn[1]); } R(X - 6, 40, 7, 1, P.woo[1]); R(X - 6, 46, 7, 1, P.woo[2]); R(X - 7, 41, 2, 5, P.woo[3]); R(X + 1, 42, 2, 2, P.irn[1]); }
      if (boost >= 1) {
        R(X + 54, 22, 7, 2, BRS[2]); R(X + 54, 22, 7, 1, BRS[1]);
        for (let yy = 24; yy < 45; yy++) { R(X + 58, yy, 1, 1, P.gla[3]); R(X + 59, yy, 2, 1, on ? (yy % 4 ? '#efe6c4' : '#fffbea') : P.gla[1]); R(X + 61, yy, 1, 1, P.gla[2]); }
        for (const yy of [28, 36]) R(X + 57, yy, 6, 1, yy === 28 ? BRS[1] : BRS[2]);
        R(X + 59, 45, 2, 2, BRS[3]);
      }
    });
    // Delante: la caperuza y los aros (fase II) y la cúpula de presión (fase III).
    const front = mk72(() => {
      if (stage >= 2) { R(X + 12, 0, 7, 2, MAT.iron[1]); R(X + 13, 2, 5, 1, MAT.iron[0]); for (const yy of [21, 28]) for (const [x0, w] of [[0, 6], [24, 6]]) { R(X + x0, 14 + yy, w, 1, MAT.iron[0]); R(X + x0, 15 + yy, w, 1, MAT.iron[2]); R(X + x0 + (x0 ? w - 1 : 0), 14 + yy, 1, 2, MAT.iron[3]); } }
      if (stage >= 3) for (let dy = 0; dy < 4; dy++) R(X + 33 + (3 - dy), 18 + 1 + dy, 2 + dy * 2, 1, dy < 2 ? '#ffe070' : '#c09030');
    });
    const c = mk72((g) => { g.drawImage(back, 0, 0); g.drawImage(base, 0, 0); g.drawImage(front, 0, 0); });
    outlineNew(c, base);
    // La gema se monta después del contorno: va engastada delante del horno (su engaste ya tiene su borde de latón).
    const g = c.getContext('2d');
    if (boost >= 1) { const b = PB(11, 9); gemSocket(b, 0, 0, on); g.drawImage(b.canvas(), X + 10, 15); }
    if (boost >= 2) { const b = PB(11, 9); gemSocket(b, 0, 0, on); g.drawImage(b.canvas(), X + 55, 14); }
    return c;
  });
}
// B animado: fuego, brillo, manómetro, barras de Base, goteo, vapor. Con refuerzo activo: la Base sube por la columna, gotean
// dos caños y salen más barras en el MISMO ciclo (la refinería reforzada no va más deprisa: rinde más).
function drawRefineB(g, x, y, stage, boost, on, t, o = {}) {
  const X = x + RX0, run = o.run !== false, k = o.k ?? 0, act = boost && on;
  g.drawImage(refineB(stage, boost, on), x, y);
  const was = ctx; ctx = g;
  try {
    const pw = run ? 0.72 + 0.18 * Math.sin(t / 170) + (k < 0.12 ? 0.2 : 0) : 0.22;
    fire(X + 10, y + 33, 10, 12, t, Math.min(1, pw)); g.save(); g.beginPath(); g.rect(x - 40, y - 10, X + 28 - x + 40, 90); g.clip(); glow(X + 15, y + 40, '#ff8a2e', Math.round(10 + 7 * pw)); g.restore(); // como en V4.1: el alambique tapa el resplandor
    const a = -2.2 + k * 2.6; R(X + 41 + Math.round(Math.cos(a) * 1.4), y + 36 + Math.round(Math.sin(a) * 1.4), 1, 1, INK4); R(X + 41, y + 36, 1, 1, INK4);
    const bars = o.bars ?? 2;
    for (let i = 0; i < bars; i++) { const row = Math.floor(i / 3), col = i % 3; ctx.drawImage(artBar(), X + 48 + col * 4 + row * 2, y + 45 - row * 3); }
    if (run) { const d = Math.floor((t % 1400) / 150); if (t % 1400 < 900) R(X + 54, y + 39 + d, 1, 1, MAT.cream[3]); if (act) { const d2 = Math.floor(((t + 500) % 1400) / 150); if ((t + 500) % 1400 < 900) R(X + 60, y + 47 + Math.min(1, d2 % 3), 1, 1, MAT.cream[3]); } }
    if (act && run) { const lv = 24 + Math.round(20 - ((t / 1600) % 1) * 20); for (let yy = lv; yy < 45; yy++) R(X + 59, y + yy, 2, 1, (yy - lv) < 2 ? '#fffbea' : PAL.cre[2]); }
    if (act) { gemGlint(g, X + 15, y + 18, t, 2300, 0); if (boost >= 2) gemGlint(g, X + 60, y + 17, t, 2300, 1100); }
    if (o.steam && run && k < 0.15) { const kk = k / 0.15; ctx.globalAlpha = 0.5 * (1 - kk); disc(X + 34, y + 16 - Math.round(kk * 6), 2 + Math.round(kk * 3), '#e8e4f0'); ctx.globalAlpha = 1; }
    if (run && t % 1800 < 900) { const kk = (t % 1800) / 900; ctx.globalAlpha = 0.35 * (1 - kk); disc(X + 15 + Math.round(kk * 3), y - 2 - Math.round(kk * 8), 1 + Math.round(kk * 2), '#9a90a6'); ctx.globalAlpha = 1; }
  } finally { ctx = was; }
}

// ---------- DRILL · la perforadora original de V4.1 con el módulo BOOST encima ----------
// La máquina es la de V4.1, con sus mismas piezas y posiciones (pórtico, carcasa, volante, eje, cuadro, barra y broca). El
// refuerzo no cambia ni un píxel de la máquina: se le atornillan piezas. La potencia de DRILL es mecánica: gema en la
// carcasa, bobina de cobre en la barra, escape que tose el doble, volante a la velocidad del refuerzo (×1,5 / ×2,25) con
// estela de acero, y la broca arrancando trozos más grandes. El cian solo está en la gema y en las juntas de la bobina.
function drillV41(g, x, y, t, o = {}) {
  const was = ctx; ctx = g; const run = o.run !== false, sp = o.speed || 1, boost = o.boost || 0, on = o.on !== false, act = boost && on;
  try {
    ctx.drawImage(artGantry(52), x, y + 44);
    const fly = run ? (t / 1000) * 6 * sp : 0, jit = run && Math.floor(t / (60 / sp)) % 2 ? 1 : 0;
    ctx.drawImage(artDrill(), x + 10, y + 15 + jit); R(x + 24, y + 10 + jit, 1, 6, INK4); ctx.drawImage(artWheel(Math.floor(fly) % 3), x + 18, y + jit); ctx.drawImage(artPanel(), x + 50, y + 32);
    R(x + 52, y + 36, 2, 2, run ? '#62d36e' : '#ffb347');
    const sx = x + 25, tip = y + 66;
    R(sx - 2, y + 48, 5, tip - y - 48, INK4); R(sx - 1, y + 48, 3, tip - y - 48, MAT.steel[2]); R(sx - 1, y + 48, 1, tip - y - 48, MAT.steel[3]);
    for (let yy = y + 49 + (run ? Math.floor(t / (50 / sp)) % 4 : 0); yy < tip - 1; yy += 4) R(sx - 1, yy, 3, 1, MAT.steel[1]);
    ctx.drawImage(artBit(run ? Math.floor(t / (70 / sp)) % 2 : 0), sx - 4, tip - 2);
    if (run) { const p = 600 / (act ? 2 : 1); if (t % p < 260) { const k = (t % p) / 260; g.globalAlpha = 0.5 * (1 - k); disc(x + 34 + Math.round(k * 2), y + 12 - Math.round(k * 7), 1 + Math.round(k * 2), act ? '#d8dce8' : '#9a90a6'); g.globalAlpha = 1; } }
    if (run && Math.floor(t / 90) % 3 === 0) { R(sx + (Math.floor(t / 90) % 2 ? -3 : 3), tip + 5, 1, 1, '#fff2b0'); }
    if (act) {
      // Bobina de cobre en la barra, con sus juntas encendidas mientras gira.
      for (let yy = y + 49; yy < y + 56; yy += 2) { R(sx - 4, yy, 9, 1, PAL.cop[1]); R(sx - 4, yy + 1, 9, 1, PAL.cop[3]); if (run && (Math.floor(t / 80) + yy) % 3 === 0) { R(sx - 4, yy, 1, 1, '#9fe6ff'); R(sx + 4, yy, 1, 1, '#9fe6ff'); } }
      R(sx - 5, y + 48, 11, 1, INK4); R(sx - 5, y + 56, 11, 1, INK4);
      // Estela de acero del volante (más vueltas, no más luz).
      if (run) for (let s = 0; s < 3; s++) { const a = fly * 1.05 + s * 2.1; for (let i = 0; i < 3 + boost; i++) R(Math.round(x + 24 + Math.cos(a - i * 0.2) * 8), Math.round(y + 7 + Math.sin(a - i * 0.2) * 8), 1, 1, i ? '#c8ccd8' : '#ffffff'); }
      // Trozos más grandes que salta la broca.
      if (run) for (let i = 0; i < 2 + boost; i++) { const kk = ((t / 380) + i / (2 + boost)) % 1, dir = i % 2 ? 1 : -1; R(sx + Math.round(dir * kk * 10), tip + 6 - Math.round(Math.sin(kk * Math.PI) * 6), 2, 2, i % 2 ? '#9aa0b4' : '#e08a2e'); }
      R(x + 52, y + 39, 2, 1, '#5ad1ff');
    }
  } finally { ctx = was; }
  if (boost >= 1) { const b = PB(11, 9); gemSocket(b, 0, 0, on); g.drawImage(b.canvas(), x + 9, y + 31); if (act) gemGlint(g, x + 14, y + 34, t, 2300, 300); }
  if (boost >= 2) { const b = PB(11, 9); gemSocket(b, 0, 0, on); g.drawImage(b.canvas(), x + 36, y + 45); if (act) gemGlint(g, x + 41, y + 48, t, 2300, 1200); }
}
