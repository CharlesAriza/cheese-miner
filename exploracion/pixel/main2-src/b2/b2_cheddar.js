// ---------- BLOQUE 2 · CHEDDAR (producción, 21-10-2026) ----------
// El capítulo es el de V4.1 (su composición, su simulación espejo y sus ratones), con las máquinas aprobadas y lo que faltaba:
// · REFINE: la versión B aprobada (drawRefineB), con sus fases I–III y su refuerzo (más Base del mismo Raw).
// · DRILL: el dibujo de V4.1 aprobado, tal cual; encima, sus fases II–III y su refuerzo (potencia mecánica).
// · CHEESE: el taller de V4.1 compuesto en un sprite con el contorno completado donde se perdía (la regla de REFINE B), con
//   fases II–III y su refuerzo (fabricación reforzada).
// · MINE: refuerzo en el andamio (gema) y más trozos en cada golpe.
// Las fases siguen los aspectos reales del juego (visualTier: 0–1 → I, 2–3 → II, 4–5 → III). VFX sin contorno.
// Arreglo de composición: en V4.1 el horno quedaba cortado por el borde izquierdo (SC.ox = 8 lo ponía en x = −6). Con 17 el
// horno entra entero y el pozo del montacargas sigue dentro de la pantalla (x 152–159 de 161).
SC.ox = 17;
// Las dos cajas con una cuña que el fondo de V4.1 ponía en el suelo de cada capítulo no son nada del juego: fuera.
SPR.crate = (() => { const c = document.createElement('canvas'); c.width = c.height = 1; return c.toDataURL(); })();
// En las demostraciones el jugador pica solo: un toque cada 1,1 s, con la misma regla que un toque de verdad (SIM41.hit).
setInterval(() => { if (B2.autoTap && SIM41.mineStatus() === 'ready') SIM41.hit('manual'); }, 1100);
const B2 = { autoTap: true, ref: { stage: 1, boost: 0, on: true }, drill: { stage: 1, boost: 0, on: true }, cheese: { stage: 1, boost: 0, on: true }, mine: { boost: 0, on: true, gold: 0 } };
const TIER_STAGE = [1, 1, 2, 2, 3, 3];
const mkc = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const was = ctx; ctx = g; try { f(g); } finally { ctx = was; } return c; };
// Contorno completado: un píxel vacío gana tinta si toca un píxel que no es tinta (la misma regla que REFINE B).
function completeOutline(c) {
  const g = c.getContext('2d'), w = c.width, h = c.height, im2 = g.getImageData(0, 0, w, h), d = im2.data;
  const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 127 ? (y * w + x) * 4 : -1), add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (at(x, y) < 0 && [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(([u, v]) => { const i = at(u, v); return i >= 0 && !isInk(d, i); })) add.push((y * w + x) * 4);
  for (const i of add) { d[i] = 0x1b; d[i + 1] = 0x12; d[i + 2] = 0x20; d[i + 3] = 255; }
  g.putImageData(im2, 0, 0); c.added = add.length; return c;
}

// ================= REFINE · refuerzo dentro del capítulo =================
// En el capítulo, a la derecha del serpentín pasa el elevador de cangilones (sube el Raw a la tolva), así que la columna de
// extracción de la refinería suelta se chocaba con él. Aquí el propio serpentín hace de columna: una mirilla de vidrio por la
// que sube la Base, un segundo caño sobre el molde y las gemas (la del horno y otra en el serpentín). Misma idea aprobada:
// más Base del mismo Raw, sin acelerar; salen más barras en el mismo ciclo. (x, y) = origen del lienzo de REFINE B.
function refineSceneBoost(g, x, y, now, boost, on, run) {
  if (!boost) return; const X = x + RX0, act = on, R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
  R2(X + 53, y + 30, 3, 12, INK4); for (let yy = y + 31; yy < y + 41; yy++) R2(X + 54, yy, 1, 1, act ? (yy % 3 ? '#efe6c4' : '#fffbea') : PAL.gla[1]);
  if (act && run) { const lv = y + 31 + Math.round(((now / 1600) % 1) * 9); R2(X + 54, lv, 1, 1, '#ffffff'); }
  R2(X + 57, y + 43, 2, 2, BRS[2]); R2(X + 57, y + 43, 1, 1, BRS[1]); if (act && run) { const d2 = Math.floor(((now + 500) % 1400) / 150); if ((now + 500) % 1400 < 900) R2(X + 57, y + 45 + Math.min(1, d2 % 3), 1, 1, MAT.cream[3]); }
  const b = PB(11, 9); gemSocket(b, 0, 0, on); g.drawImage(b.canvas(), X + 10, y + 15); if (act) gemGlint(g, X + 15, y + 18, now, 2300, 0);
  if (boost >= 2) { g.drawImage(b.canvas(), X + 46, y + 26); if (act) gemGlint(g, X + 51, y + 29, now, 2300, 900); }
}

// ================= CHEESE · el taller (42 × 46, origen en el alero) =================
// Piezas de V4.1 en sus posiciones de V4.1 (alero, marco, rótulo, balda, cuba con paleta, prensa y moldes), en un solo sprite.
// Fase II (Cheesemaking 2–3): la balda pasa a quesos curados y se añade una balda corta con dos ruedas sobre la prensa.
// Fase III (4–5): aros de latón en la cuba, placa dorada en el rótulo y un farol colgado del alero (su luz es VFX).
// Refuerzo: segundo husillo de latón en la prensa, la gema en el alero, la paleta remueve más deprisa y cada hornada suelta
// un golpe de vapor de la prensa.
const CHZ_W = 42, CHZ_H = 46;
const cheeseBase = () => art('chzBase', () => completeOutline(mkc(CHZ_W, CHZ_H, (g) => { g.drawImage(artShelfN(0), 9, 12); g.drawImage(artVat(), 8, 26); g.drawImage(artPaddle(0), 13, 21); g.drawImage(artFrame(36), 2, 6); g.drawImage(artEave(40), 0, 0); g.drawImage(artCheeseSign(), 3, 9); g.drawImage(artPress(0), 22, 23); g.drawImage(artMolds(), 1, 36); })));
function cheeseStatic(stage, boost, on) {
  return art(`chz${stage}${boost}${on}`, () => {
    const base = cheeseBase(), P = PAL;
    const extra = mkc(CHZ_W, CHZ_H, (g) => {
      if (stage >= 2) { g.drawImage(artShelfN(1), 9, 12); const b = PB(12, 6); b.rect(0, 4, 12, 2, P.woo[2]); b.hline(0, 4, 12, P.woo[1]); for (const x of [3, 8]) { b.ell(x, 2, 2.6, 2, P.rnd[3]); b.ell(x, 2, 2, 1.4, (xx, yy) => (yy < 2 ? P.rnd[1] : P.rnd[2])); } g.drawImage(b.canvas(), 25, 15); }
      if (stage >= 3) { for (const yy of [32, 37]) { g.fillStyle = BRS[1]; g.fillRect(9, yy, 16, 1); g.fillStyle = BRS[0]; g.fillRect(9, yy, 4, 1); } g.fillStyle = PNT[2]; g.fillRect(4, 12, 12, 1); g.fillRect(4, 17, 12, 1); g.fillStyle = PNT[1]; g.fillRect(4, 12, 4, 1); g.fillStyle = P.irn[3]; g.fillRect(34, 7, 1, 3); g.fillRect(33, 10, 3, 3); g.fillStyle = P.win[1]; g.fillRect(34, 11, 1, 1); }
      if (boost >= 1) { g.fillStyle = BRS[2]; g.fillRect(34, 26, 2, 8); g.fillStyle = BRS[0]; g.fillRect(34, 26, 1, 8); g.fillStyle = BRS[3]; for (let yy = 27; yy < 34; yy += 2) g.fillRect(35, yy, 1, 1); }
    });
    const c = mkc(CHZ_W, CHZ_H, (g) => { g.drawImage(base, 0, 0); g.drawImage(extra, 0, 0); });
    if (boost >= 1) { const b = PB(11, 9); gemSocket(b, 0, 0, on); c.getContext('2d').drawImage(b.canvas(), 15, 0); }
    return c;
  });
}
function cheeseB2(g, x, y, now) {
  const C = B2.cheese, act = C.boost && C.on, busy = pressing(), stir = busy && BR.cook && BR.cook.act === 'stir' && BR.cook.on;
  g.drawImage(cheeseStatic(C.stage, C.boost, C.on), x, y);
  g.drawImage(artPaddle(stir ? Math.floor(now / (act ? 150 : 260)) % 2 : 0), x + 13, y + 21);
  const pf = busy ? Math.floor(prog(Z41.cookJob) * (act ? 9 : 6)) % 2 : 0; g.drawImage(artPress(pf), x + 22, y + 23);
  if (C.boost >= 1) { g.fillStyle = BRS[2]; g.fillRect(x + 34, y + 26, 2, 8); g.fillStyle = BRS[0]; g.fillRect(x + 34, y + 26, 1, 8); }
  if (C.stage >= 3) vfxGlow(g, x + 34, y + 12, 7, now);
  // Golpe de vapor de la prensa en cada bajada con el refuerzo (sin contorno).
  if (act && busy && pf) { const k = (now % 400) / 400; g.globalAlpha = 0.45 * (1 - k); g.fillStyle = '#efeaf6'; g.fillRect(x + 24 - Math.round(k * 3), y + 22 - Math.round(k * 4), 3 + Math.round(k * 2), 2); g.fillRect(x + 33 + Math.round(k * 3), y + 22 - Math.round(k * 4), 3 + Math.round(k * 2), 2); g.globalAlpha = 1; }
  if (act) gemGlint(g, x + 20, y + 3, now, 2300, 700);
}

// ================= DRILL · fases y refuerzo encima del dibujo aprobado de V4.1 =================
// (x, y) = el origen de drillV41: el pórtico en y + 44, la perforadora en (x + 10, y + 15), el volante en (x + 18, y).
// Fase II (Drilling 2–3): planchas de acero remachadas a los lados de la perforadora y un piloto ámbar encima.
// Fase III (4–5): aro de latón alrededor del volante y un manómetro de latón en el cuadro.
function drillModules(g, x, y, now, run, jit) {
  const D = B2.drill, act = D.boost && D.on, P = PAL, R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
  if (D.stage >= 2) { for (const px of [x + 11, x + 32]) { R2(px, y + 21 + jit, 3, 12, P.irn[2]); R2(px, y + 21 + jit, 1, 12, P.irn[1]); R2(px + 1, y + 23 + jit, 1, 1, P.irn[0]); R2(px + 1, y + 30 + jit, 1, 1, P.irn[0]); } R2(x + 22, y + 13 + jit, 3, 2, '#7a4a10'); R2(x + 23, y + 13 + jit, 1, 1, run && Math.floor(now / 300) % 2 ? '#ffd860' : '#c98a12'); if (run) vfxGlow(g, x + 23, y + 13 + jit, 5, now, '#ffb347'); }
  if (D.stage >= 3) { const cx = x + 24, cy = y + 6 + jit; for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; R2(Math.round(cx + Math.cos(t) * 7.5), Math.round(cy + Math.sin(t) * 7.5), 1, 1, a < 24 ? BRS[1] : BRS[2]); } R2(x + 56, y + 29, 3, 1, BRS[2]); R2(x + 55, y + 30, 5, 3, BRS[2]); R2(x + 56, y + 33, 3, 1, BRS[3]); R2(x + 56, y + 30, 3, 3, '#fffbea'); R2(x + 57, y + 31, 1, 1, INK4); R2(x + 58, y + 30, 1, 1, '#e8523a'); R2(x + 57, y + 34, 1, 1, BRS[3]); } // manómetro redondo apoyado en el cuadro
  if (!D.boost) return;
  if (act && run) { const fly = (now / 1000) * 6 * 1.5; for (let s = 0; s < 3; s++) { const a = fly * 1.05 + s * 2.1; for (let i = 0; i < 3 + D.boost; i++) R2(Math.round(x + 24 + Math.cos(a - i * 0.2) * 8), Math.round(y + 7 + jit + Math.sin(a - i * 0.2) * 8), 1, 1, i ? '#c8ccd8' : '#ffffff'); } const p = 300; if (now % p < 260) { const k = (now % p) / 260; g.globalAlpha = 0.5 * (1 - k); disc(x + 34 + Math.round(k * 2), y + 12 - Math.round(k * 7), 1 + Math.round(k * 2), '#d8dce8'); g.globalAlpha = 1; } R2(x + 52, y + 39, 2, 1, '#5ad1ff'); }
  const b = PB(11, 9); gemSocket(b, 0, 0, D.on); g.drawImage(b.canvas(), x + 9, y + 31); if (act) gemGlint(g, x + 14, y + 34, now, 2300, 300);
  if (D.boost >= 2) { g.drawImage(b.canvas(), x + 36, y + 45); if (act) gemGlint(g, x + 41, y + 48, now, 2300, 1200); }
}
// La bobina de cobre en la barra (refuerzo) y los trozos grandes que salta la broca.
function drillBarBoost(g, sx, DK, tipY, now, run) {
  const D = B2.drill, act = D.boost && D.on, R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); }; if (!D.boost) return;
  for (let yy = DK + 5; yy < DK + 12; yy += 2) { R2(sx - 4, yy, 9, 1, PAL.cop[1]); R2(sx - 4, yy + 1, 9, 1, PAL.cop[3]); if (act && run && (Math.floor(now / 80) + yy) % 3 === 0) { R2(sx - 4, yy, 1, 1, '#9fe6ff'); R2(sx + 4, yy, 1, 1, '#9fe6ff'); } }
  R2(sx - 5, DK + 4, 11, 1, INK4); R2(sx - 5, DK + 12, 11, 1, INK4);
  if (act && run && V.ext > 0.95) for (let i = 0; i < 2 + D.boost; i++) { const kk = ((now / 380) + i / (2 + D.boost)) % 1, dir = i % 2 ? 1 : -1; R2(sx + Math.round(dir * kk * 10), tipY + 6 - Math.round(Math.sin(kk * Math.PI) * 6), 2, 2, i % 2 ? '#9aa0b4' : '#e08a2e'); }
}

// ================= MINE · refuerzo (reacción de la excavación) =================
// La gema en el andamio, y cada golpe del minero suelta el doble de trozos (envuelve a spark: mismos golpes, más reacción).
function mineBoost(g, gm, now) { const M = B2.mine; if (!M.boost) return; const b = PB(11, 9); gemSocket(b, 0, 0, M.on); g.drawImage(b.canvas(), gm.rx - 22, gm.rb - 9); if (M.on) gemGlint(g, gm.rx - 17, gm.rb - 6, now, 2300, 500); if (M.boost >= 2) g.drawImage(b.canvas(), gm.rx - 10, gm.rb - 9); }
const sparkV41 = spark;
spark = function (x, y, kind, n = 1) { const M = B2.mine; return sparkV41(x, y, kind, kind === 'chip' && M.boost && M.on ? n * (1 + M.boost) : n); };

// ================= SELL · refuerzo de la tienda (actividad comercial) =================
// Una guirnalda de farolillos bajo la barra del toldo (su luz es VFX), la gema en el poste izquierdo y monedas que saltan del
// mostrador más a menudo. Se pinta encima de la tienda del bloque 1, en cualquiera de sus seis aspectos.
function shopBoost(g, sx, sy, t, boost, on, now) {
  if (!boost) return; const P = PAL;
  for (let i = 0; i < 6; i++) { const x = sx + 6 + i * 9, y = sy + 14 + (i % 2); g.fillStyle = P.irn[3]; g.fillRect(x + 1, y, 1, 1); g.fillStyle = on ? [P.win[1], '#ffa0a0', '#a0e0ff'][i % 3] : '#8a8478'; g.fillRect(x, y + 1, 3, 2); if (on) vfxGlow(g, x + 1, y + 2, 3, now + i * 200, '#ffe8a0'); }
  const b = PB(11, 9); gemSocket(b, 0, 0, on); g.drawImage(b.canvas(), sx, sy + 30); if (boost >= 2) g.drawImage(b.canvas(), sx + 47, sy + 30);
  if (on) { gemGlint(g, sx + 5, sy + 33, now, 2300, 900); const p = 900 / boost, k = (now % p) / p; if (k < 0.5) { const kk = k / 0.5; g.globalAlpha = 1 - kk; g.fillStyle = P.gld[1]; g.fillRect(sx + 29 + Math.round(Math.sin(kk * 3) * 4), sy + 38 - Math.round(kk * 10), 2, 2); g.fillStyle = P.gld[0]; g.fillRect(sx + 29 + Math.round(Math.sin(kk * 3) * 4), sy + 38 - Math.round(kk * 10), 1, 1); g.globalAlpha = 1; } }
}

// ================= El capítulo: drawCheddar de V4.1 con las máquinas aprobadas =================
function drawCheddar(st, now) {
  baked(st, paintCheddar);
  const g = geoC(st), { t, o, TL, TR, DK, FF, rx, rb } = g;
  // REFINE: la versión B aprobada (V4.1 con su contorno completado), con su fase y su refuerzo. Mismas posiciones que V4.1:
  // el horno en (o − 14, TL − 28). Las barras de Base salen del molde de la simulación (V.tray), hasta 3, o 5 con dos refuerzos.
  { const R2 = B2.ref, cap = R2.boost >= 2 ? 5 : R2.boost ? 4 : 3; drawRefineB(ctx, o - 20, TL - 42, R2.stage, 0, true, now, { k: prog(Z41.refJob), bars: Math.min(cap, V.tray), run: refining(), steam: true }); refineSceneBoost(ctx, o - 20, TL - 42, now, R2.boost, R2.on, refining()); if (refining() && now % 700 < 30) spark(o + 1, t + 9, 'smoke'); }
  // Elevador: los cangilones solo se mueven cuando llevan Raw (tras un ciclo de perforadora).
  const busy = V.tokens.some((k) => k.kind === 'raw' && now >= k.t0 && now - k.t0 < k.ms); V.elev = (V.elev || 0) + (busy ? 1 : 0); for (let k = 0; k < 5; k++) { const y = Math.round(DK + 2 - ((V.elev / 2.5 + k * 9) % (DK - t - 12))); R(o + 44, y, 5, 3, INK4); R(o + 45, y, 3, 2, MAT.iron[2]); }
  ctx.drawImage(artWheel(Math.floor(V.elev / 6) % 3), o + 41, t + 8);
  // DRILL: pórtico, máquina, volante (gira solo con un ciclo en marcha), cuadro con su piloto (verde: trabaja; ámbar: veta sin
  // ciclo; rojo intermitente: sin veta) y la barra, abajo solo mientras hay veta.
  ctx.drawImage(artGantry(52), o + 48, DK);
  const run = running(), jit = run && Math.floor(now / 60) % 2 ? 1 : 0;
  V.ext = Math.max(0, Math.min(1, V.ext + (Z41.veinRevealed ? 1 : -1) * Math.min(64, now - (V.extT || now)) / 700)); V.extT = now;
  const sx = o + 73, rest = DK + 18, tipY = Math.round(rest + (rb - 22 - rest) * (V.ext * V.ext * (3 - 2 * V.ext)));
  if (run) V.fly += (now - V.flyT < 300 ? 2.4 : 1) * 0.06; ctx.drawImage(artDrill(), o + 58, DK - 29 + jit); R(o + 72, DK - 34 + jit, 1, 6, INK4); ctx.drawImage(artWheel(Math.floor(V.fly) % 3), o + 66, DK - 44 + jit); ctx.drawImage(artPanel(), o + 98, DK - 12);
  if (run && now % 600 < 20) spark(o + 82, DK - 30, 'smoke');
  R(o + 100, DK - 8, 2, 2, run ? '#62d36e' : Z41.veinRevealed ? '#ffb347' : now % 900 < 450 ? '#ff5a3c' : '#5a1a10');
  { const a = run ? -2.2 + prog(Z41.drillJob) * 2.6 : 1.4; R(o + 102 + Math.round(Math.cos(a) * 1.5), DK - 4 + Math.round(Math.sin(a) * 1.5), 1, 1, INK4); }
  drillModules(ctx, o + 48, DK - 44, now, run, jit);
  // CHEESE: taller sin toldo (el toldo es de la tienda): alero de tablas, rótulo con la cuña, baldas de curado, cuba con su
  // paleta, prensa de husillo (se mueve con cada hornada) y moldes.
  cheeseB2(ctx, o + 96, TR - 39, now);
  for (let i = 0; i < Math.min(3, LIFT.queue); i++) wheelTok(o + 130 - (i % 2) * 3, TR + 1 - Math.floor(i / 2) * 3);
  // El andamio del jugador y la roca.
  scaffold(g); mineBoost(ctx, g, now);
  ctx.globalAlpha = 0.45; R(rx + 6, rb, 44, 2, '#000'); R(rx + 10, rb + 2, 36, 1, '#000'); ctx.globalAlpha = 1;
  const j = V.jolt && now - V.jolt.t0 < 90 ? (now - V.jolt.t0 < 45 ? V.jolt.d : [-V.jolt.d[0], 0]) : [0, 0];
  const src = rockSrc(); sprite(src, 54, 0, rx + j[0], rb - 40 + j[1], 54, 42);
  if (V.flash && now - V.flash < 60) { const w = whiteOf4(src); if (w) { ctx.globalAlpha = 0.55; ctx.drawImage(w, rx + j[0], rb - 40 + j[1]); ctx.globalAlpha = 1; } }
  if (Z41.veinRevealed && Math.floor(now / 260) % 4 === 0) R(rx + 20 + Math.floor(hash4(Math.floor(now / 260), 1) * 14), rb - 18 + Math.floor(hash4(Math.floor(now / 260), 2) * 6), 1, 1, '#fff6b0');
  // La barra baja por delante de la roca hasta la veta y gira solo durante el ciclo.
  R(sx - 2, DK + 4, 5, tipY - DK - 4, INK4); R(sx - 1, DK + 4, 3, tipY - DK - 4, MAT.steel[2]); R(sx - 1, DK + 4, 1, tipY - DK - 4, MAT.steel[3]);
  for (let y = DK + 5 + (run ? Math.floor(now / 50) % 4 : 0); y < tipY - 1; y += 4) R(sx - 1, y, 3, 1, MAT.steel[1]);
  ctx.drawImage(artBit(run ? Math.floor(now / 70) % 2 : 0), sx - 4, tipY - 2);
  drillBarBoost(ctx, sx, DK, tipY, now, run);
  if (run && V.ext > 0.95) { if (Math.floor(now / 90) % 3 === 0) spark(sx + (Math.random() < 0.5 ? -3 : 3), tipY + 5, 'spark'); const k = prog(Z41.drillJob); rawTok(sx, Math.round(tipY - k * (tipY - DK - 6))); }
  // Recursos de camino: Raw (elevador → tolva), Base (canaleta → cuba).
  for (let i = V.tokens.length - 1; i >= 0; i--) { const k = V.tokens[i], f = (now - k.t0) / k.ms; if (f < 0) continue; if (f >= 1) { V.tokens.splice(i, 1); continue; } const [x, y] = pathAt(k.kind === 'raw' ? RAWP(g) : BASEP(g), f); (k.kind === 'raw' ? rawTok : baseTok)(x, y); }
  pushStations(st, g);
  if (S.focus && STOPS[S.stop] === st) for (const r of g.st[S.focus] || []) sel(r);
  drawWorkers(st, g, now);
  drawPlayer(g, now);
  vfxImpact(ctx, g.rx + 6, g.rb - 21, now - AV.swing, Z41.combo % RULE.critEvery === 0); if (BR.miner) vfxImpact(ctx, g.rx + 30, g.rb - 34, now - BR.miner.hitAt, false);
  plaque(o + 2, FF - 30, DEP.cheddar, TH.cheddar);
}

// ================= El pico aprobado (el de la revisión de arte) =================
// El pico se recorta de la animación aprobada swing_player (approvedPick, 5 fotogramas) y va por delante del ratón oficial.
// Sustituye al pico de V4.1 del minero contratado (descartado) y al trabajador genérico del jugador. Fotogramas: 0–1 en
// reposo, 2 levanta, 3 golpe, 4 recoge. drawWorkers es el de V4.1 con solo la línea del pico cambiada.
const PLAYER_MOUSE = { name: 'Player', lv: 1, rank: 0, rar: 0, skill: 'mining' };
// El recorte del pico deja fuera las chispas amarillas que la animación aprobada trae pintadas en el golpe: al recortarlas
// les tocaba contorno de tinta y la regla de VFX lo prohíbe. El impacto lo hacen ahora los VFX del golpe (sin contorno).
delete PICKC['#fffbe0']; delete PICKC['#ffe55c']; PICKF.length = 0;
// Fotogramas del golpe (los 5 aprobados), con el tiempo desde el impacto: 3 golpe (0–70 ms), 4 acompaña (70–190), 2 vuelve a
// subir a media altura (190–300, la recuperación) y 0 en reposo; antes del golpe, 2 (preparación).
const swingFrame = (since, windup) => (since >= 0 && since < 70 ? 3 : since >= 0 && since < 190 ? 4 : since >= 0 && since < 300 ? 1 : windup ? 2 : 0);
// Impacto sin contorno: un destello en el punto del golpe (60 ms), un aro de polvo que se abre y se apaga y unas motas de roca.
function vfxImpact(g, x, y, since, big) {
  if (since < 0 || since > 260) return; const R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
  if (since < 60) { R2(x - 1, y - 1, 3, 3, '#fffbe8'); R2(x - 3, y, 7, 1, '#ffe9a8'); R2(x, y - 3, 1, 7, '#ffe9a8'); if (big) { R2(x - 4, y - 4, 1, 1, '#fff6c8'); R2(x + 4, y - 4, 1, 1, '#fff6c8'); R2(x - 4, y + 4, 1, 1, '#fff6c8'); R2(x + 4, y + 4, 1, 1, '#fff6c8'); } }
  const k = Math.min(1, since / 260), r = Math.round(2 + k * (big ? 6 : 4)); g.globalAlpha = 0.55 * (1 - k); g.fillStyle = '#e8dcc4';
  for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(t) * r), Math.round(y + Math.sin(t) * r * 0.7), 1, 1); }
  g.globalAlpha = 1;
}
// Dónde va el pico sobre el ratón oficial: su cabeza es más ancha que la del trabajador genérico de la animación, así que el
// pico se coloca 3 px más adelante y 2 más abajo que en la revisión de arte (PICKDX/PICKDY). El mango nace en la pata, a la
// altura del pecho, y la cabeza del pico queda delante del hocico: la cara se ve entera en los 5 fotogramas.
const PICK_OX = PICKDX + 3, PICK_OY = PICKDY + 2;
function drawWorkers(st, g, now) { // V4.1, con el pico aprobado
  const dt = Math.min(64, now - (LASTT || now)); LASTT = now;
  for (const who of ['refiner', 'cook', 'driller', 'miner']) {
    if (!P41[who]) continue;
    const b = brain(who, g);
    // Si cambia la geometría (otro ancho de pantalla u otra densidad), el ratón se queda en el mismo sitio de su suelo.
    if (b.o !== g.o) { const d = g.o - b.o; b.x += d; if (b.tx != null) b.tx += d; b.o = g.o; }
    if (now >= b.until || (b.on && !stillValid(b, now))) {
      if (!b.gap) b.gap = now + 140;
      if (now >= b.gap) { b.gap = 0; const p = planOf(b, g), W = g.walk[who]; if (p.act === 'wait' && b.act !== 'wait') { b.episode = (b.episode || 0) + 1; b.waitFrom = now; } Object.assign(b, { act: p.act, tx: Math.max(W[0], Math.min(W[1], p.tx)), face: p.face, dur: p.dur, on: false, until: Infinity }); b.log.push([p.act, now]); }
    }
    const strike = who === 'miner' && now - b.hitAt < 170, p = strike ? { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 } : b.gap ? { x: b.x, flip: b.flip, o: {}, dy: 0, pick: who === 'miner' && !Z41.veinRevealed ? 1 : undefined } : poseOf(b, now, dt, g);
    const x = Math.round(p.x), feet = who === 'miner' ? minerFeet(g, x) : g.who[who][1];
    if (!b.blinkAt || now > b.blinkAt + 120) b.blinkAt = now + 2200 + rnd(b) * 2400;
    const blink = now > b.blinkAt && now < b.blinkAt + 110, breath = Math.floor((now + (b.seed % 1300)) / (620 + (b.seed % 200))) % 2;
    const c = mF(b.m, p.o.legs ? 0 : breath, blink, p.o);
    if (p.flip) { ctx.save(); ctx.translate(x + 22, feet - 20 + p.dy); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore(); } else ctx.drawImage(c, x, feet - 20 + p.dy);
    if (p.pick !== undefined && p.pick >= 0) { const since = now - b.hitAt, left = EX.minerMs - Z41.minerAcc, pk = approvedPick(swingFrame(since < 300 ? since : -1, left < 200 && !Z41.veinRevealed)); if (pk) ctx.drawImage(pk, x + PICK_OX, feet - 20 + PICK_OY + p.dy); }
    if (p.carry) ctx.drawImage(artCarry(p.carry), p.flip ? x : x + 14, feet - 10 + p.dy); // la rueda en las patas, a la altura de la barriga (antes tapaba el hocico)
    b.px = x; b.py = feet; b.pose = p;
    HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: g.who[who][2], who, name: b.m.name, x, y: feet - 20, w: 22, h: 20, crest: who === 'miner' });
  }
}
// Pico de oro del jugador (en el juego, con Mining en visualTier 3 o más): el mismo pico aprobado, píxel a píxel, con los cuatro
// tonos del acero cambiados por los del oro de swing_gold. No se recorta de swing_gold porque allí el brillo del oro tiene el
// color de las chispas que se quitaron.
const GOLDPICK = { '#b9c1d1': '#ffd84a', '#f2f5fa': '#fffbe0', '#6c7488': '#c98a12', '#454a5a': '#8a5a0a' }, PICKG = [];
function approvedPickGold(f) {
  if (PICKG[f]) return PICKG[f]; const s = approvedPick(f); if (!s) return null;
  const c = document.createElement('canvas'); c.width = s.width; c.height = s.height; const g = c.getContext('2d'); g.drawImage(s, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const h = '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join(''), to = GOLDPICK[h]; if (to) { d[i] = parseInt(to.slice(1, 3), 16); d[i + 1] = parseInt(to.slice(3, 5), 16); d[i + 2] = parseInt(to.slice(5, 7), 16); } }
  g.putImageData(im, 0, 0); return (PICKG[f] = c);
}
function drawPlayer(g, now) {
  const dt = now - AV.swing, f = Z41.veinRevealed ? 0 : swingFrame(dt < 300 ? dt : -1, false), p = PLAYER(g), y = p.feet + 1 - 20;
  const mc = mF(PLAYER_MOUSE, f === 0 ? Math.floor(now / 650) % 2 : 0, false, f === 3 || f === 4 ? { face: 'grump' } : {}), pk = B2.mine.gold ? approvedPickGold(f) : approvedPick(f); ctx.drawImage(mc, p.x, y); if (pk) ctx.drawImage(pk, p.x + PICK_OX, y + PICK_OY);
  HITS.push({ k: 'm', stop: 1, st: 'rock', who: 'player', name: 'You', x: p.x + 1, y: p.feet - 19, w: 22, h: 20, player: true });
}
