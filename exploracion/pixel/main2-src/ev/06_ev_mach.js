// ---------- EVOLUCIÓN Y BOOST · máquinas de Cheddar (REFINE y DRILL) ----------
// Etapas = los aspectos que el juego ya calcula por los rangos de la rama POWER de su árbol (visualTier: 0, 3, 8, 16, 30 y 50
// rangos), agrupados en tres transformaciones: I (aspectos 0–1), II (2–3) y III (4–5).
// BOOST = refuerzos equipados en el puesto (0, 1 o 2). Sin ratón en el puesto, el refuerzo no hace nada: la gema se ve
// apagada y no hay efectos. En la refinería el refuerzo no acelera: da más Base del mismo Raw.

// ================= REFINE · 68 × 56 =================
function refineBase(stage, boost, on) {
  return evArt(`rf${stage}${boost}${on}`, () => {
    const c = PB(68, 56), P = P2, top = stage >= 3 ? 14 : stage >= 2 ? 18 : 22;
    // Chimenea de hierro.
    cylv(c, 8, stage >= 3 ? 0 : stage >= 2 ? 4 : 8, 6, top - (stage >= 3 ? 0 : stage >= 2 ? 4 : 8) + 2, P.irn, null); c.rect(7, stage >= 3 ? 0 : stage >= 2 ? 4 : 8, 8, 2, P.irn[1]);
    // Fuelle de cuero (etapa III, Hot Furnace).
    if (stage >= 3) { c.poly([[0, 42], [6, 38], [6, 50], [0, 47]], (x, y) => (y < 44 ? P.brn[1] : P.brn[2])); for (const y of [41, 44, 47]) c.hline(1, y, 5, P.brn[3]); c.rect(0, 43, 2, 3, P.woo[2]); }
    // Horno de ladrillo con su boca en arco.
    const fx = 4, fw = 24; vol(c, fx, top, fw, 54 - top, P.bri, { side: 3, ao: 2 });
    for (let y = top + 3; y < 53; y += 3) { c.hline(fx + 1, y, fw - 2, P.bri[3]); for (let x = fx + 2 + ((y / 3) % 2 ? 2 : 0); x < fx + fw - 1; x += 5) c.px(x, y - 1, P.bri[3]).px(x, y - 2, P.bri[3]); }
    vol(c, fx - 1, top - 2, fw + 2, 3, P.stn, { side: 1, ao: 0, face: 1 });
    const ax = fx + 12, ay = 45, inA = (x, y, r) => (y >= ay && Math.abs(x + 0.5 - ax) <= r) || ((x + 0.5 - ax) ** 2 + (y + 0.5 - ay) ** 2 <= r * r && y < ay);
    c.fill((x, y) => inA(x, y, 8) && y < 53, (x, y) => (hh2(x, y, 3) < 0.5 ? P.stw[2] : P.stw[3]), fx, 30, fx + fw, 53);
    c.fill((x, y) => inA(x, y, 6) && y < 53, '#1a0c08', fx, 32, fx + fw, 53);
    if (stage >= 2) { for (const y of [top + 4, top + 9]) { c.hline(fx, y, fw, P.irn[3]); c.hline(fx, y - 1, fw, P.irn[2]); } c.fill((x, y) => inA(x, y, 7) && !inA(x, y, 6) && y < 53, P.irn[2], fx, 30, fx + fw, 53); }
    // Alambique de cobre (más grande en la etapa III, Bigger Vat), cuello, cuello de cisne y serpentín.
    const r = stage >= 3 ? 10 : stage >= 2 ? 9 : 8, cx = 41, cy = 52 - r - 3;
    vol(c, cx - r + 1, 49, r * 2 - 2, 5, P.bri, { side: 1, ao: 1 });
    c.ell(cx, cy, r, r, (x, y) => faceTone(P.cop, x, y, cx - r, cy - r, r * 2, r * 2, 0.04)); c.hline(cx - r + 2, cy + 2, r * 2 - 4, P.cop[3]);
    c.rect(cx - 2, cy - r - 6, 5, 7, P.cop[2]); c.vline(cx - 2, cy - r - 6, 7, P.cop[1]); c.ell(cx + 0.5, cy - r - 6, 3.4, 2, P.cop[1]);
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = Math.round(cx + 1 + t * 12), y = Math.round(cy - r - 7 + Math.sin(t * Math.PI) * -3 + t * 2); c.px(x, y, P.cop[2]).px(x, y + 1, P.cop[3]); }
    const kx = cx + 13; for (let y = cy - r - 3; y < 44; y += 3) { c.hline(kx - 2, y, 7, P.irn[2]); c.hline(kx - 2, y + 1, 7, P.irn[3]); }
    c.vline(kx + 1, 44, 3, P.irn[3]);
    if (stage >= 2) { c.ell(kx + 1, cy - r - 6, 2.6, 2.6, P.irn[3]); c.ell(kx + 1, cy - r - 6, 1.7, 1.7, '#f4f2e8'); c.px(kx + 1, cy - r - 7, P.red[2]); }
    // Bandeja de la Base.
    vol(c, kx - 6, 47, 18, 3, P.irn, { side: 1, ao: 1, face: 1 });
    // BOOST: gema en el frente del horno (y otra en la cúpula del alambique con el segundo refuerzo) y la columna de
    // extracción de vidrio, que saca más Base del mismo Raw. Sin ratón: gemas apagadas, columna vacía.
    if (boost >= 1) {
      gemSocket(c, ax - 5, top + 3, on);
      for (let y = cy - r - 2; y < 46; y++) { c.px(kx - 5, y, P.gla[3]); c.px(kx - 4, y, on ? (y % 3 ? '#5ad1ff' : '#9fe6ff') : P.gla[1]); c.px(kx - 3, y, P.gla[2]); }
      c.rect(kx - 6, cy - r - 3, 5, 2, BRS[2]); c.hline(kx - 6, cy - r - 3, 5, BRS[1]);
    }
    if (boost >= 2) gemSocket(c, cx - 4, cy - r - 12, on);
    closeGaps(c); c.outline();
    return c.canvas();
  });
}
// Lo que se mueve: fuego (con núcleo cian si hay refuerzo activo), humo, goteo, barras de Base en la bandeja y el brillo.
// k = progreso del ciclo (0..1); bars = barras que hay en la bandeja.
const pdisc = (g, cx, cy, r, col, al) => { g.globalAlpha = al; g.fillStyle = col; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); g.fillRect(cx - w, cy + dy, w * 2 + 1, 1); } g.globalAlpha = 1; };
function drawRefine(g, x, y, stage, boost, on, t, k, bars, done) {
  const cv = refineBase(stage, boost, on), act0 = boost && on;
  // Con refuerzo activo, el horno trabaja más caliente: halo en el suelo delante de la boca (detrás del sprite).
  if (act0) { const p = 0.5 + 0.5 * Math.sin(t / 260); pdisc(g, x + 16, y + 50, 13 + boost * 2, '#5ad1ff', 0.07 + 0.03 * p); pdisc(g, x + 16, y + 50, 8, '#9fe6ff', 0.08); }
  g.drawImage(cv, x, y);
  // Juntas del arco al rojo y conductos activados.
  if (act0) { const ax2 = x + 16, top2 = stage >= 3 ? 14 : stage >= 2 ? 18 : 22; for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, px = Math.round(ax2 + Math.cos(a) * 7.5), py = Math.round(y + 45 + Math.sin(a) * 7.5); g.fillStyle = (i + Math.floor(t / 180)) % 3 ? '#ff9a3a' : '#ffd060'; g.fillRect(px, py, 1, 1); }
    const r0 = stage >= 3 ? 10 : stage >= 2 ? 9 : 8, cx0 = x + 41, cy0 = y + 52 - r0 - 3; for (let i = 0; i <= 12; i++) { const tt = i / 12, px = Math.round(cx0 + 1 + tt * 12), py = Math.round(cy0 - r0 - 7 + Math.sin(tt * Math.PI) * -3 + tt * 2); if ((i + Math.floor(t / 90)) % 4 === 0) { g.fillStyle = '#9fe6ff'; g.fillRect(px, py, 1, 1); } }
    for (let i = 0; i < 2 + boost; i++) { const kk = ((t / 900 + i / (2 + boost)) % 1); g.fillStyle = kk < 0.5 ? '#e8fbff' : '#5ad1ff'; g.fillRect(x + 10 + Math.round(Math.sin(kk * 9 + i) * 2), y + (stage >= 3 ? 0 : stage >= 2 ? 4 : 8) - 2 - Math.round(kk * 12), 1, 1); } }
  const ax = x + 16, ay = y + 45, pw = on || !boost ? 0.55 + 0.25 * Math.sin(t / 170) + (k > 0 && k < 0.25 ? 0.25 : 0) : 0.22, act = boost && on;
  for (let i = -5; i <= 5; i++) { const hgt = Math.max(1, Math.round(9 * pw * (0.5 + 0.5 * hh2(i + 9, Math.floor(t / 110), 3)) * (1 - Math.abs(i) / 7))); for (let j = 0; j < hgt; j++) { const f = j / hgt; g.fillStyle = act && j < 2 ? (j === 0 ? '#e8fbff' : '#9fe6ff') : f < 0.3 ? '#fff2b0' : f < 0.6 ? '#ffc040' : f < 0.85 ? '#ff7a1e' : '#c83a10'; g.fillRect(ax + i, ay + 7 - j, 1, 1); } }
  const top = stage >= 3 ? 0 : stage >= 2 ? 4 : 8, sm = (t % 1400) / 1400; g.globalAlpha = 0.45 * (1 - sm); g.fillStyle = '#9a90a6'; const sr = 1 + Math.round(sm * 3); for (let dy = -sr; dy <= sr; dy++) { const w = Math.floor(Math.sqrt(sr * sr - dy * dy)); g.fillRect(x + 11 - w + Math.round(sm * 4), y + top - 3 - Math.round(sm * 10) + dy, w * 2 + 1, 1); } g.globalAlpha = 1;
  const r = stage >= 3 ? 10 : stage >= 2 ? 9 : 8, kx = x + 54; if (Math.floor(t / 300) % 3 === 0) { g.fillStyle = '#efe6c4'; g.fillRect(kx + 1, y + 47 - 1 + (Math.floor(t / 100) % 3), 1, 1); }
  for (let i = 0; i < bars; i++) { const bx = kx - 5 + i * 4, by = y + 44; g.fillStyle = '#8a7a5a'; g.fillRect(bx - 1, by - 1, 5, 4); g.fillStyle = '#efe6c4'; g.fillRect(bx, by, 3, 2); g.fillStyle = '#fffbea'; g.fillRect(bx, by, 3, 1); }
  if (act) { const cy = y + 52 - r - 3; for (let i = 0; i < 3; i++) { const yy = cy - r - 2 + ((t / 70 + i * 6) % (y + 46 - (cy - r - 2))); g.fillStyle = '#ffffff'; g.fillRect(kx - 4, Math.round(yy), 1, 1); } gemGlint(g, ax - 1, y + (stage >= 3 ? 14 : stage >= 2 ? 18 : 22) + 5, t, 2300, 0); if (boost >= 2) gemGlint(g, x + 41, y + 52 - r - 3 - r - 11, t, 2300, 900); }
  if (done && done < 300) { const d = done / 300; g.fillStyle = act ? '#9fe6ff' : '#fffbea'; for (const [dx, dy] of [[-2, -2], [2, -3], [0, -4], [4, -1]]) g.fillRect(kx - 3 + dx + Math.round(dx * d), y + 43 + dy - Math.round(d * 3), 1, 1); }
}

// ================= DRILL · 62 × 64 =================
function drillBase(stage, boost, on) {
  return evArt(`dr${stage}${boost}${on}`, () => {
    const c = PB(62, 64), P = P2;
    // Escape (para el refuerzo) detrás.
    if (boost >= 1) { cylv(c, 37, 4, 4, 16, P.irn, null); c.rect(36, 3, 6, 2, P.irn[1]); }
    // Motor: el de serie o el Turbo Motor (etapa III) con radiador y correa al volante.
    if (stage >= 3) { vol(c, 2, 18, 16, 22, P.irn, { side: 2, ao: 2 }); for (let x = 4; x < 16; x += 2) c.vline(x, 21, 15, P.irn[3]); c.ell(10, 20, 3, 3, P.irn[1]); c.px(10, 20, P.irn[3]); }
    else vol(c, 10, 24, 9, 16, P.irn, { side: 2, ao: 2 }), [27, 30, 33, 36].forEach((y) => c.hline(11, y, 7, P.irn[3]));
    // Carcasa amarilla con rejillas y remaches.
    vol(c, 18, 18, 21, 22, PNT, { side: 3, ao: 2 }); for (const y of [22, 25, 28]) c.hline(22, y, 11, PNT[3]); c.rect(21, 32, 14, 5, PNT[3]); for (let x = 22; x < 34; x += 3) c.rect(x, 33, 2, 3, PNT[4]);
    for (const [x, y2] of [[19, 19], [37, 19], [19, 38], [37, 38]]) c.px(x, y2, PNT[0]);
    // Soporte del volante (el volante gira aparte).
    c.rect(27, 15, 4, 4, P.irn[2]); c.hline(27, 15, 4, P.irn[1]);
    // Cuadro de mando.
    vol(c, 42, 24, 11, 16, P.irn, { side: 2, ao: 1 }); c.rect(44, 27, 7, 5, P.irn[4]); c.rect(44, 34, 3, 3, P.irn[4]);
    // Plataforma del pórtico, con su franja de aviso.
    vol(c, 0, 40, 62, 4, P.irn, { side: 1, ao: 0, face: 1 }); for (let x = 0; x < 62; x++) c.px(x, 44, Math.floor(x / 3) % 2 ? PNT[2] : '#2a2a34'); c.hline(0, 45, 62, P.irn[3]);
    for (const x of [4, 54]) { c.rect(x, 46, 4, 8, P.irn[2]); c.vline(x, 46, 8, P.irn[1]); }
    // Barra.
    c.rect(28, 46, 3, 10, P.stn[1]); c.vline(28, 46, 10, P.stn[0]); c.vline(30, 46, 10, P.stn[3]);
    // BOOST: gema en el motor (y otra en el cuadro con el segundo), y la bobina turbo de cobre alrededor de la barra.
    if (boost >= 1) { gemSocket(c, stage >= 3 ? 5 : 10, 30, on); for (let y = 46; y < 52; y += 2) { c.hline(26, y, 7, on ? '#5ad1ff' : P.cop[2]); c.hline(26, y + 1, 7, P.cop[3]); } }
    if (boost >= 2) gemSocket(c, 43, 16, on);
    closeGaps(c); c.outline();
    return c.canvas();
  });
}
// Volante (gira con el ciclo, a la velocidad del puesto), correa del Turbo Motor, broca, luz del cuadro, aguja, escape.
function drawDrill(g, x, y, stage, boost, on, t, run, speed) {
  g.drawImage(drillBase(stage, boost, on), x, y);
  const act = boost && on, ang = run ? (t / 1000) * 6 * speed : 0, fx = x + 29, fy = y + 9, R = 8;
  g.fillStyle = INK; for (let dy = -R - 1; dy <= R + 1; dy++) { const w = Math.floor(Math.sqrt((R + 1) ** 2 - dy * dy)); g.fillRect(fx - w, fy + dy, w * 2 + 1, 1); }
  g.fillStyle = PAL.irn[2]; for (let dy = -R; dy <= R; dy++) { const w = Math.floor(Math.sqrt(R * R - dy * dy)); g.fillRect(fx - w, fy + dy, w * 2 + 1, 1); }
  g.fillStyle = PAL.irn[4]; for (let dy = -R + 2; dy <= R - 2; dy++) { const w = Math.floor(Math.sqrt((R - 2) ** 2 - dy * dy)); g.fillRect(fx - w, fy + dy, w * 2 + 1, 1); }
  for (let s = 0; s < 4; s++) { const a = ang + (s * Math.PI) / 2; for (let rr = 1; rr < R - 1; rr++) { g.fillStyle = PAL.irn[1]; g.fillRect(Math.round(fx + Math.cos(a) * rr), Math.round(fy + Math.sin(a) * rr), 1, 1); } }
  g.fillStyle = PAL.irn[0]; g.fillRect(fx - 1, fy - 1, 2, 2);
  if (run && act) for (let s = 0; s < 3; s++) { const a = ang * 0.9 + s * 2.1; for (let i = 0; i < 3; i++) { g.fillStyle = i ? '#5ad1ff' : '#e8fbff'; g.fillRect(Math.round(fx + Math.cos(a - i * 0.18) * (R + 2)), Math.round(fy + Math.sin(a - i * 0.18) * (R + 2)), 1, 1); } }
  if (stage >= 3) { const off = run ? Math.floor(t / (80 / speed)) % 3 : 0; for (let i = 0; i < 12; i++) { const k = i / 12, px = Math.round(x + 10 + (fx - x - 10) * k), py = Math.round(y + 20 + (fy - y - 20) * k); if ((i + off) % 3 === 0) { g.fillStyle = INK; g.fillRect(px, py - 1, 1, 1); } } }
  // Broca: gira con la barra; chispas al morder (cian con refuerzo activo).
  const bx = x + 29, by = y + 56, wide = stage >= 3 ? 6 : 4, ph = run ? Math.floor(t / (70 / speed)) % 2 : 0;
  for (let j = 0; j < 8; j++) { const w = Math.max(0, Math.round(wide * (1 - j / 8))); g.fillStyle = INK; g.fillRect(bx - w - 1, by + j, w * 2 + 3, 1); g.fillStyle = (j + ph) % 2 ? PAL.stn[1] : PAL.stn[3]; g.fillRect(bx - w, by + j, w * 2 + 1, 1); }
  if (run && Math.floor(t / 90) % 2) { g.fillStyle = act ? '#9fe6ff' : '#fff2b0'; g.fillRect(bx + (Math.floor(t / 90) % 4) - 2, by + 8, 1, 1); g.fillRect(bx - 3, by + 6, 1, 1); }
  // Cuadro: luz (verde trabajando, ámbar parado) y aguja de potencia (zona cian con refuerzo activo).
  g.fillStyle = run ? '#62d36e' : '#ffb347'; g.fillRect(x + 48, y + 35, 2, 1);
  const na = run ? -2.4 + (act ? 1.9 : 1.1) + Math.sin(t / 120) * 0.15 : -2.6; g.fillStyle = act ? '#5ad1ff' : PAL.irn[1]; g.fillRect(x + 44, y + 27, 7, 1); g.fillStyle = '#f4f2e8'; g.fillRect(Math.round(x + 47.5 + Math.cos(na) * 2.5), Math.round(y + 30.5 + Math.sin(na) * 2.5), 1, 1); g.fillRect(x + 47, y + 30, 1, 1);
  if (act && run) { const k = (t % 600) / 600; g.globalAlpha = 0.8 * (1 - k); g.fillStyle = k < 0.4 ? '#e8fbff' : '#9fe6ff'; const rr = 1 + Math.round(k * 3); g.fillRect(x + 39 - rr, y + 2 - Math.round(k * 8), rr * 2, 1); g.fillRect(x + 39 - rr, y + 3 - Math.round(k * 8) + rr, rr * 2, 1); g.globalAlpha = 1; }
  if (act) { gemGlint(g, x + (stage >= 3 ? 9 : 14), y + 33, t, 2300, 400); if (boost >= 2) gemGlint(g, x + 47, y + 19, t, 2300, 1300); }
  // Rejillas de la carcasa encendidas por dentro (el motor reforzado se ve trabajar más) y polvo de roca más vivo.
  if (act && run) { for (const yy of [22, 25, 28]) for (let xx = 22; xx < 33; xx++) if ((xx + yy + Math.floor(t / 70)) % 3 === 0) { g.fillStyle = '#5ad1ff'; g.fillRect(x + xx, y + yy, 1, 1); } for (let i = 0; i < boost; i++) { const kk = ((t / 400) + i * 0.5) % 1; g.fillStyle = '#c8ccd8'; g.fillRect(x + 29 + Math.round((i ? 1 : -1) * kk * 9), y + 63 - Math.round(Math.sin(kk * Math.PI) * 4), 1, 1); } }
}
