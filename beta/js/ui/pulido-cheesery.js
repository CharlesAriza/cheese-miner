// GENERADO por exploracion/pixel/main2-src/game/build_cheesery.py: no editar a mano. CHEESERY aprobado (PRODUCTION): el arte de
// cada línea viene copiado del mockup (cheesery.html); el ratón es la plantilla oficial de MAIN 2.0 con el aspecto real del
// quesero. Solo pinta: lo que pasa (lotes, SPEED UP, paradas) lo decide el juego y aquí se ve.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mouseCanvas = (...a) => CM.m2mouse(...a);
  const IMGC = {};
  const img = (src) => IMGC[src] || (IMGC[src] = Object.assign(new Image(), { src }));
  // Paredes de cada roca (las de MICE: luz, base, sombra).
  const ZW = { cheddar: ['#3a3022', '#5a4a30', '#241c14'], gouda: ['#3a2a20', '#5a3e2a', '#24180f'], brie: ['#34322c', '#504c42', '#201e1a'], emmental: ['#30331f', '#4a4f2e', '#1e2012'], parmesan: ['#3a2e22', '#56442f', '#241a12'], blue: ['#262c3a', '#3a4458', '#161a24'] };
function icon(rows, pal, outline = '#1b1220') {
  const H = rows.length, W = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas'); c.width = W + 2; c.height = H + 2; const x = c.getContext('2d');
  const at = (i, j) => rows[j] && rows[j][i] && rows[j][i] !== '.';
  for (let j = -1; j <= H; j++) for (let i = -1; i <= W; i++) {
    if (at(i, j)) { x.fillStyle = pal[rows[j][i]]; x.fillRect(i + 1, j + 1, 1, 1); }
    else if (at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1)) { x.fillStyle = outline; x.fillRect(i + 1, j + 1, 1, 1); }
  }
  return c;
}
const IC = {
  up: () => icon(['..l..', '.lgg.', 'lgggG', '.gGG.', '.gGG.'], { l: '#c8ffc0', g: '#62d36e', G: '#2f8f44' }),
  heart: () => icon(['.rR.rr.', 'rWrrrrR', 'rrrrrrR', '.rrrrR.', '..rrR..', '...R...'], { r: '#ff5a6a', R: '#b8263a', W: '#ffd0d8' }),
  star: () => icon(['...y...', '..yYy..', 'yyYWyyy', '.yyyyO.', '..yyO..', '.yO.yO.'], { y: '#ffcf2e', Y: '#fff3a0', W: '#ffffff', O: '#c98a08' }),
  chain: () => icon(['.lyy....lyy.', 'l..Yd..l..Yd', 'y..lyyyy..Yd', 'Y..dYYYd..dd', '.ddd....ddd.'], { l: '#fff3a0', y: '#ffcf2e', Y: '#e0a020', d: '#a8700a' }),
  bed: () => icon(['P.......', 'PWW.....', 'PWWbbbbb', 'Pbbbbbbb', 'P......P'], { P: '#9a6a5a', W: '#ffffff', b: '#ff8fb4' }),
  book: () => icon(['vvv.vvv', 'vWWvWWv', 'vWWvWWv', 'vvvvvvv'], { v: '#b58cff', W: '#efe6ff' }),
  // Cabeza de ratón (MICE, contratar, sin asignar): cinco tonos de pelaje, luz arriba a la izquierda,
  // orejas con fondo rosa, ojos con brillo, nariz con sombra y mejillas.
  head: () => icon([
    '.gGD.....gGD.',
    'gqpGD...gqpGD',
    'gppPGgggGppPD',
    '.gPGAAgggGPD.',
    '..gAAggggGGD.',
    '.gggkwggkwGGD',
    '.gggkkggkkGGD',
    '.ggcggnnggcGD',
    '..gGgNNggGGD.',
    '...GGGGGGDD..',
    '....DDDDD....'],
    { A: '#ffffff', g: '#f3ecf2', G: '#dccfdc', D: '#a897b2', q: '#ffc4d6', p: '#f58fb0', P: '#c9557f', k: '#1b1622', w: '#ffffff', n: '#ff7a9c', N: '#b8406a', c: '#ffb3c6' }, '#2a1d2e'),
  rank1: () => icon(['b...b', 'bb.bb', '.bbb.', '..b..'], { b: '#5a9cf0' }),
  rank2: () => icon(['.rr.', '.rr.', 'yyyy', 'yYyy', '.yy.'], { r: '#e2462f', y: '#ffcf2e', Y: '#fff3a0' }),
  rank3: () => icon(['.yyy.', 'kWWWk', 'kWsWk', 'kWWWk', 'kWsWk', 'kkkkk'], { y: '#ffcf2e', k: '#1b1622', W: '#f4f4f4', s: '#9aa3b8' }),
  chevU: () => icon(['..w..', '.wSw.', 'wS.Sw'], { w: '#d6d0e6', S: '#9f97b8' }),
  chevD: () => icon(['wS.Sw', '.wSw.', '..w..'], { w: '#d6d0e6', S: '#9f97b8' }),
  go: () => icon(['w..', 'Sw.', '.Sw', 'Sw.', 'w..'], { w: '#d6d0e6', S: '#9f97b8' }),
};
const toImg = (c, scale = 2) => { c.classList.add('pix'); c.style.width = Math.round(c.width * scale) + 'px'; c.style.height = Math.round(c.height * scale) + 'px'; c.style.flex = 'none'; return c; };
const CZ = {
  cheddar: { name: 'Cheddar', c: ['#fff09a', '#ffcf2e', '#f5ab12'] },
  gouda: { name: 'Gouda', c: ['#ffd08a', '#ff9f3a', '#e87a1c'] },
  brie: { name: 'Brie', c: ['#ffffff', '#fbf3d6', '#e3d3a0'] },
  emmental: { name: 'Emmental', c: ['#fff6b0', '#f7de6a', '#dcb93a'] },
  parmesan: { name: 'Parmesan', c: ['#f6e2b0', '#e3bf78', '#bf9550'] },
  blue: { name: 'Blue', c: ['#ffffff', '#e9e6cf', '#c2be9f'], vein: '#5a7ab8' },
};
const K = '#1b1220';
const WHEEL_EVERY = 600000, WHEEL_WORTH = 120000, BOOST_MS = 300;
// ---------- Arte: estación pequeña (40 × 26) y cocina a lo ancho (164 × 44) ----------
// SPRITE: tina, fuego, pala, prensa, cinta y puerta de la despensa; todo por código y sustituible.
const GEO = {
  small: { W: 40, H: 26, floor: 21, mx: 0, vx: 22, vy: 11, vw: 16, vh: 8, rows: 2 },
  wide: { W: 110, H: 30, floor: 26, mx: 1, vx: 25, vy: 14, vw: 18, vh: 9, rows: 2, press: true },
};
const P1 = (x2, x, y, w, h, c) => { x2.fillStyle = c; x2.fillRect(x, y, w, h); };
function lineP(x2, x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (;;) { P1(x2, x0, y0, 1, 1, c); if ((x0 === x1 && y0 === y1) || n++ > 200) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
const GLY = {};
const glyph = (k, rows, pal, ol) => (GLY[k] ||= icon(rows, pal, ol));
const miniWheel = (z) => { const c = CZ[z].c; return glyph('w' + z, ['.MMMMM.', 'MLLLLLM', 'MMMMMMM', 'DDDDDDD', '.DDDDD.'], { L: c[0], M: c[1], D: c[2] }); };
const goldWheel = () => glyph('gw', ['..YYYYYYY..', '.YWWYYYYYY.', 'YYYYYYYYYYO', 'yyyyyyyyyyO', 'yyyyyyyyyyO', '.yyyyyyyyO.', '..OOOOOOO..'], { Y: '#ffe55c', W: '#fffbe0', y: '#ffcf2e', O: '#c98a08' });
const miniBase = (z) => { const c = CZ[z].c; return glyph('b' + z, ['.LLLLL.', 'LMMMMML', 'MMMMMMD', 'DDDDDDD'], { L: c[0], M: c[1], D: c[2] }); };
const miniCoin = () => glyph('coin', ['.yyy.', 'yYyyO', 'yyyyO', 'yyyyO', '.OOO.'], { y: '#ffcf2e', Y: '#fff3a0', O: '#c98a08' });
const miniQ = () => glyph('q', ['wwwwwww', 'w.kkk.w', 'w...k.w', 'w..kk.w', 'w.....w', 'w..k..w', 'wwwwwww'], { w: '#f3e3b6', k: '#5a3a24' });
const miniArrow = () => glyph('arr', ['yyyyy', '.yyy.', '..y..'], { y: '#ffcf2e' });
const LAMP = { cook: '#62d36e', base: '#ffb02e', coins: '#e2462f', none: '#e2462f', ready: '#b58cff', off: '#3a3d4a' };

// Cara de esfuerzo para SPEED UP: el ceño de «grump» más las mejillas encendidas.
const _mouseCanvasBase = mouseCanvas;
mouseCanvas = function (m, dy = 0, blink = false, o = {}) {
  if (o.face !== 'effort') return _mouseCanvasBase(m, dy, blink, o);
  const c = _mouseCanvasBase(m, dy, false, { ...o, face: 'grump' }), x2 = c.getContext('2d');
  const at = (x, r, col) => { x2.fillStyle = col; x2.fillRect(x + 1, 6 + dy + r, 1, 1); };
  at(9, 4, '#ff5a7a'); at(10, 4, '#ff5a7a');
  return c;
};
// Golpe de pala de SPEED UP: levanta (0-70 ms), hunde y salpica (70-140) y recupera (140-210). Un golpe por toque;
// si se toca más deprisa, como mucho dos golpes en cola, para que la pala vaya siempre con el dedo.
const STROKE = 210;
function strokeOf(V, now) {
  if (!V.stroke) return -1;
  let e = now - V.stroke;
  if (e >= STROKE) { if (V.queue > 0) { V.queue--; V.stroke = now - (e - STROKE); V.hit = false; e = now - V.stroke; } else { V.stroke = 0; return -1; } }
  return e;
}
// El golpe llega a la tina: salpicadura, la tina tiembla, el fuego aviva, la prensa da un golpe y la cinta avanza a tirones.
function strokeHit(L, V, G, now) {
  V.hit = true; V.vshake = now + 90; V.flare = now + 160; V.kick = now + 160; V.jolt = (V.jolt || 0) + 2;
  if (G.press) for (let k = 0; k < 2; k++) V.steam.push({ x: 56 + k * 6, y: 15, t0: now, life: 520 });
  const c = CZ[L.z].c;
  for (let k = 0; k < 5; k++) V.drops.push({ x: G.vx + 6 + Math.random() * 4, y: G.vy + 1, vx: (Math.random() - 0.45) * 2.6, vy: -1.6 - Math.random() * 1.4, c: k % 3 === 0 ? '#ffffff' : c[k % 2], t0: now, life: 460 });
  for (let k = 0; k < 2; k++) V.steam.push({ x: G.vx + 4 + k * 8, y: G.vy, t0: now, life: 700 });
}
// Estado visual de cada estación (no toca la línea): curd, fuego, vapor, gestos de un momento.
function stOf(L) {
  return (L.vis ||= { fill: L.st === 'cook' ? 1 : L.st === 'ready' ? 0.5 : 0, fire: L.st === 'cook' ? 1 : 0, steam: [], drops: [], wheels: [], fast: 0, hop: 0, face: null, faceUntil: 0, star: 0, press: 0, flowT: 0, cache: {}, paddle: 0, enter: 0 });
}
function mouseFrame(V, m, dy, blink, o) {
  const k = m.name + m.rank + m.rar + dy + (blink ? 'b' : '') + JSON.stringify(o);
  return (V.cache[k] ||= mouseCanvas(m, dy, blink, o));
}
function drawStation(L, x2, G, now) {
  const V = stOf(L), z = L.z, cu = CZ[z].c, wall = ZW[z];
  // Reloj de la animación: con SPEED UP corre hasta 3,5 veces más deprisa (pala, prensa, cinta, fuego y vapor) y vuelve
  // a su ritmo en algo más de medio segundo. Solo es aspecto: el lote termina cuando termina.
  const dtA = Math.min(120, now - (V.lastDraw || now)); V.lastDraw = now;
  V.boost = Math.max(0, (V.boost || 0) - dtA / 900);
  V.t = (V.t || now) + dtA * (1 + 2 * V.boost);
  if (L.barI) { const bar = L.barI.parentElement, hot = V.boost > (bar.classList.contains('mx-hot') ? 0.08 : 0.2); if (bar.classList.contains('mx-hot') !== hot) bar.classList.toggle('mx-hot', hot); }
  const cooking = L.st === 'cook';
  // Hacia dónde van el curd y el fuego (se acercan solos: arrancar y parar se ven).
  const tFill = cooking ? 1 : L.st === 'ready' ? 0.5 : 0, tFire = cooking ? 1 : 0;
  V.fill += (tFill - V.fill) * 0.25; V.fire += (tFire - V.fire) * 0.3;
  // Pared y suelo.
  P1(x2, 0, 0, G.W, G.floor, wall[1]);
  for (let y = 4, r = 0; y < G.floor; y += 5, r++) { P1(x2, 0, y, G.W, 1, wall[0]); for (let x = (r % 2) * 4; x < G.W; x += 8) P1(x2, x, y - 4, 1, 4, wall[0]); }
  P1(x2, 0, G.floor - 2, G.W, 2, wall[0]);
  P1(x2, 0, G.floor, G.W, G.H - G.floor, '#2a1f1a'); P1(x2, 0, G.floor, G.W, 1, '#4a3a2a');
  for (let x = 5; x < G.W; x += 9) P1(x2, x, G.floor + 1, 1, G.H - G.floor - 1, '#1e1612');
  const { vy, vw, vh } = G, vx = G.vx + (V.vshake > now ? (Math.floor(now / 30) % 2 ? 1 : -1) : 0);
  // Fuego bajo la tina, entre las patas.
  const legY = vy + vh, legH = G.floor - legY;
  if (V.fire > 0.08) {
    const f = Math.floor(V.t / 90);
    for (let x = vx + 3; x < vx + vw - 3; x++) {
      const h = Math.min(legH, Math.max(1, Math.round(legH * V.fire * (0.5 + 0.4 * V.boost + (V.flare > now ? 0.5 : 0) + ((x * 7 + f * 3) % 5) / 8))));
      P1(x2, x, G.floor - h, 1, h, (x + f) % 3 ? '#ff8a2e' : '#ffcf2e');
      if (h > 1) P1(x2, x, G.floor - 1, 1, 1, '#e2462f');
    }
  } else P1(x2, vx + 3, G.floor - 1, vw - 6, 1, '#3a2a24');
  // Patas y tina.
  P1(x2, vx + 1, legY, 2, legH, '#3a3d4a'); P1(x2, vx + vw - 3, legY, 2, legH, '#3a3d4a');
  P1(x2, vx, vy, vw, 1, K); P1(x2, vx, vy + 1, vw, 1, '#d8dce8'); P1(x2, vx, vy + 1, 1, vh - 1, K); P1(x2, vx + vw - 1, vy + 1, 1, vh - 1, K);
  const cav = G.rows, curRows = Math.round(V.fill * cav);
  for (let r = 0; r < cav; r++) {
    const y = vy + 2 + r, filled = r >= cav - curRows;
    P1(x2, vx + 1, y, vw - 2, 1, filled ? (r === cav - curRows ? cu[0] : cu[1]) : '#2a2433');
  }
  if (CZ[z].vein && curRows) for (let x = vx + 3; x < vx + vw - 3; x += 4) P1(x2, x + ((x >> 2) % 2), vy + 1 + cav, 1, 1, CZ[z].vein);
  for (let y = vy + 2 + cav; y < vy + vh - 1; y++) { P1(x2, vx + 1, y, vw - 2, 1, '#9aa3b8'); P1(x2, vx + 1, y, 1, 1, '#cfd6e6'); P1(x2, vx + vw - 2, y, 1, 1, '#6a7088'); }
  P1(x2, vx + 1, vy + 3 + cav, vw - 2, 1, '#6a7088');
  P1(x2, vx, vy + vh - 1, vw, 1, K);
  // Burbujas en la superficie y vapor.
  if (cooking && curRows) {
    const f = Math.floor(V.t / 160);
    for (let k = 0; k < 3; k++) { const bx = vx + 2 + ((f * 5 + k * 7) % (vw - 4)); if ((f + k) % 3 === 0) P1(x2, bx, vy + 2 + cav - curRows - (k === 1 ? 1 : 0), 1, 1, cu[0]); }
    if (now - (V.lastSteam || 0) > 220 / (1 + 2 * V.boost)) { V.lastSteam = now; V.steam.push({ x: vx + 2 + Math.floor(Math.random() * (vw - 4)), y: vy, t0: now, life: 900 + Math.random() * 500 }); }
  }
  V.steam = V.steam.filter((p) => now - p.t0 < p.life);
  for (const p of V.steam) { const a = (now - p.t0) / p.life, y = Math.round(p.y - a * 11), x = p.x + Math.round(Math.sin((now - p.t0) / 200 + p.x) * 1); P1(x2, x, y, 1, 1, a < 0.5 ? '#e8e4f0' : '#a8a4b8'); if (G.press && a < 0.3) P1(x2, x + 1, y, 1, 1, '#e8e4f0'); }
  // Gotas (al acelerar) y humo (al apagarse).
  V.drops = V.drops.filter((p) => now - p.t0 < p.life);
  for (const p of V.drops) { const t = (now - p.t0) / 60; P1(x2, Math.round(p.x + p.vx * t), Math.round(p.y + p.vy * t + 0.12 * t * t), 1, 1, p.c); }
  // Piloto de la tina: verde trabajando, ámbar esperando, rojo parada, lila lista para hacerlo a mano.
  const lamp = cooking ? 'cook' : L.st;
  const blinkOn = cooking ? Math.floor(now / 500) % 2 === 0 : L.st === 'ready' ? true : Math.floor(now / 350) % 2 === 0;
  P1(x2, vx + vw - 5, vy + 2 + cav + 1, 2, 2, blinkOn ? LAMP[lamp] : '#3a3d4a');
  // Prensa, tubería, cinta y puerta (solo a lo ancho).
  if (G.press) drawPress(L, V, x2, G, now, cu);
  // Lo que falta, encima de la tina (parpadea).
  const pulse = Math.floor(now / 420) % 2 === 0;
  const over = (g, dx = 0, dy = 0) => { const gx = vx + Math.round((vw - g.width) / 2) + dx, gy = vy - g.height - 1 + dy; x2.globalAlpha = pulse ? 1 : 0.45; x2.drawImage(g, gx, gy); x2.globalAlpha = 1; return [gx, gy, g.width, g.height]; };
  if (L.st === 'ready' && !L.m) { const b = Math.floor(now / 260) % 2; x2.drawImage(miniArrow(), vx + Math.round(vw / 2) - 3, vy - 6 + b); }
  // El cocinero (solo si hay ratón contratado) o el taburete vacío de la línea a mano.
  drawCook(L, V, x2, G, now);
  if (L.gm && L.m && G.W > 0) { const tw = Math.floor(now / 300) % 4; const s = IC._star ||= IC.star(); x2.globalAlpha = tw === 3 ? 0.5 : 1; x2.drawImage(s, 1, 1); x2.globalAlpha = 1; }
}
function drawCook(L, V, x2, G, now) {
  const { vx, vy } = G, my = G.floor - 19;
  const paddleTip = (off) => [vx + 3 + off, vy + 2];
  if (!L.m) {
    // A mano: taburete vacío y la pala apoyada en la tina; se mueve solo cuando el jugador toca (SPEED UP / MAKE).
    const sx = G.mx + 8, sy = G.floor - 5;
    P1(x2, sx, sy, 8, 2, '#b07a40'); P1(x2, sx, sy, 8, 1, '#dcae74'); P1(x2, sx + 1, sy + 2, 1, 3, '#5c3a1b'); P1(x2, sx + 6, sy + 2, 1, 3, '#5c3a1b');
    const e = strokeOf(V, now);
    if (e >= 70 && !V.hit && L.st === 'cook') strokeHit(L, V, G, now);
    const [tx, ty] = e < 0 ? paddleTip(2) : e < 70 ? [vx + 1, vy - 5] : e < 140 ? [vx + 7, vy + 3] : [vx + 10, vy + 1];
    lineP(x2, e < 0 ? vx - 2 : e < 70 ? vx - 4 : vx - 1, vy - 8, tx, ty, '#8e6234'); P1(x2, tx - 1, ty, 2, e >= 70 && e < 140 ? 3 : 2, '#c9a070');
    return;
  }
  const m = L.m, cooking = L.st === 'cook';
  // Entrada (PUT A MOUSE): llega andando desde la izquierda.
  let ex = 0, legs = 'stand';
  if (V.enter && now < V.enter) { const a = (V.enter - now) / 700; ex = -Math.round(a * 24 / 2) * 2; legs = Math.floor(now / 110) % 2 ? 'a' : 'b'; }
  const ph = Math.floor((V.t + L.z.length * 97) / 170);
  let dy = 0, face = '', o = { hold: 1 }, blink = false;
  // Gestos de carácter: mientras cocina, a ratos prueba el queso o se asoma a la tina; si la espera se alarga, da
  // una cabezada. Nunca mientras hay un gesto de reacción (salto, sorpresa) en marcha.
  if (!V.nextAct) V.nextAct = now + 2500 + Math.random() * 4000;
  if (cooking) V.waitSince = 0; else if (!V.waitSince) V.waitSince = now;
  if (!V.act && now > V.nextAct && !(V.faceUntil > now) && !(V.fast > now) && !(V.enter > now)) {
    V.act = cooking ? { k: Math.random() < 0.5 ? 'taste' : 'peek', t0: now, dur: cooking ? 900 : 1600 } : L.st === 'base' && now - V.waitSince > 5000 ? { k: 'doze', t0: now, dur: 1800 } : null;
    V.nextAct = now + 4500 + Math.random() * 5000;
  }
  if (V.act && (now - V.act.t0 > V.act.dur || (V.act.k !== 'doze') !== cooking)) V.act = null;
  let act = V.act && V.act.k;
  const e = cooking && !(V.enter > now) ? strokeOf(V, now) : -1;
  let lean = 0;
  // Un golpe interrumpe cualquier gesto (probar, asomarse): el dedo manda.
  if (e >= 0) { V.act = null; act = null; if (e >= 70 && !V.hit) strokeHit(L, V, G, now); }
  if (cooking && !(V.enter > now)) { dy = act ? 0 : ph % 4 === 1 || ph % 4 === 2 ? 1 : 0; }
  else dy = Math.floor(now / 700) % 2;
  // Esfuerzo: estirarse para levantar la pala, agacharse al hundirla.
  if (e >= 0) { dy = e < 70 ? -1 : e < 140 ? 1 : 0; lean = e < 70 ? -1 : e < 140 ? 1 : 0; }
  if (!cooking) {
    if (L.st === 'base') { face = act === 'doze' ? 'sleep' : 'down'; legs = act === 'doze' ? 'stand' : Math.floor(now / 300) % 2 ? 'tap' : 'stand'; }
    else if (L.st === 'coins') face = 'grump';
    else if (L.st === 'none') { face = Math.floor(now / 1600) % 3 === 2 ? '' : 'down'; }
  }
  if (e >= 0) { face = 'effort'; if (e >= 70 && e < 140) o.ear = 1; if (e >= 0 && e < 70) o.tail = 1; }
  if (act === 'taste') face = now - V.act.t0 > 300 ? 'happy' : '';
  if (act === 'peek') face = 'wow';
  if (V.face && now < V.faceUntil) face = V.face;
  if (V.hop > now) { const a = (V.hop - now) / 360; dy = a > 0.5 ? -2 : -1; }
  if (!V.nextBlink || now > V.nextBlink) { V.blinkEnd = now + 110; V.nextBlink = now + 1800 + Math.random() * 3000; }
  if (now < V.blinkEnd && face !== 'sleep' && face !== 'effort') blink = true;
  if (face) o.face = face;
  if (V.star > now) o.spark = 1;
  o.legs = legs;
  const fr = mouseFrame(V, m, Math.max(0, dy), blink, o);
  const mx = G.mx + ex + lean;
  x2.drawImage(fr, mx, my + Math.min(0, dy));
  // Pala: en las patas mientras cocina; apoyada en la tina cuando espera.
  if (cooking && act === 'taste') {
    // Prueba: la pala sube hasta el hocico y, al gustarle, un corazón pequeño.
    const tx = mx + 18, ty = my + 9;
    lineP(x2, mx + 15, my + 13, tx, ty, '#8e6234'); P1(x2, tx, ty - 1, 2, 2, CZ[L.z].c[1]);
    if (now - V.act.t0 > 400) { const hy = my - 1 - Math.floor((now - V.act.t0 - 400) / 200); x2.drawImage(IC._hrt ||= icon(['r.r', 'rrr', '.r.'], { r: '#ff5a6a' }), mx + 17, hy); }
  } else if (cooking && e >= 0) {
    // Golpe: la pala sube por encima de la tina, se hunde en el curd y sale.
    const [tx, ty] = e < 70 ? [vx + 1, vy - 6] : e < 140 ? [vx + 7, vy + 3] : [vx + 10, vy + 1];
    // Las patas acompañan: arriba al cargar el golpe, abajo al hundirlo.
    const [ax, ay] = e < 70 ? [mx + 14, my + 9] : e < 140 ? [mx + 16, my + 14] : [mx + 15, my + 12];
    lineP(x2, ax, ay, tx, ty, '#8e6234'); P1(x2, tx - 1, ty, 2, e >= 70 && e < 140 ? 3 : 2, '#c9a070');
    P1(x2, ax - 1, ay, 2, 2, m.rar === 2 ? '#f8e08a' : '#ffb3c6');
    if (e >= 70 && e < 140) { P1(x2, tx - 2, vy + 2, 5, 1, CZ[L.z].c[0]); P1(x2, tx - 1, vy + 1, 3, 1, CZ[L.z].c[0]); }
  } else if (cooking && !(V.enter > now)) {
    const stir = act === 'peek' ? 3 : [0, 2, 4, 6, 4, 2][ph % 6];
    const [tx, ty] = paddleTip(Math.min(stir, G.vw - 8));
    lineP(x2, mx + 15, my + 13 + Math.min(0, dy) + (dy > 0 ? 1 : 0), tx, ty, '#8e6234'); P1(x2, tx - 1, ty, 2, 2, '#c9a070');
  } else if (!(V.enter > now)) {
    lineP(x2, vx - 1, vy - 6, vx + 2, vy + 2, '#8e6234'); P1(x2, vx + 1, vy + 2, 2, 1, '#c9a070');
  }
  // Cabezada: zetas que suben.
  if (act === 'doze') { const k = Math.floor((now - V.act.t0) / 300) % 3; for (let i = 0; i <= k; i++) x2.drawImage(IC._z ||= icon(['wwww', '..w.', '.w..', 'wwww'], { w: '#d6d0e6' }, 'transparent'), mx + 17 + i * 4, my - i * 4 + 1); }
}
function drawPress(L, V, x2, G, now, cu) {
  const cooking = L.st === 'cook', fl = G.floor;
  // Tubería de la tina al molde, con el curd que corre por dentro.
  const py = G.vy + 4, px0 = G.vx + G.vw, px1 = 53;
  P1(x2, px0, py, px1 - px0, 3, K); P1(x2, px0, py + 1, px1 - px0, 1, '#9aa3b8');
  if (cooking) { const f = Math.floor(V.t / 70); P1(x2, px0 + (f % (px1 - px0)), py + 1, 2, 1, cu[1]); }
  // Prensa de tornillo: baja y sube mientras se cocina; arriba y quieta si para.
  const cyc = cooking ? (V.t % 1200) / 1200 : 0;
  const down = cooking ? (cyc < 0.45 ? cyc / 0.45 : cyc < 0.6 ? 1 : 1 - (cyc - 0.6) / 0.4) : 0;
  const plateY = Math.min(14, 9 + Math.round(down * 5) + (V.kick > now ? 4 : 0));
  const wood = ['#dcae74', '#b07a40', '#8e6234', '#5c3a1b'];
  P1(x2, 50, 3, 3, fl - 3, K); P1(x2, 51, 4, 1, fl - 4, wood[1]);
  P1(x2, 67, 3, 3, fl - 3, K); P1(x2, 68, 4, 1, fl - 4, wood[2]);
  P1(x2, 50, 2, 19, 4, K); P1(x2, 51, 3, 17, 2, wood[1]); P1(x2, 51, 3, 17, 1, wood[0]);
  P1(x2, 58, 6, 3, plateY - 6, K); P1(x2, 59, 6, 1, plateY - 6, '#cfd6e6');
  if (cooking) for (let y = 7 + (Math.floor(V.t / 80) % 2); y < plateY; y += 2) P1(x2, 58, y, 1, 1, '#6a7088');
  P1(x2, 53, plateY, 14, 3, K); P1(x2, 54, plateY + 1, 12, 1, '#9aa3b8');
  // Molde con el queso que se prensa.
  P1(x2, 54, 17, 12, fl - 17, K); P1(x2, 55, 18, 10, fl - 19, wood[2]);
  const fillH = cooking ? Math.max(1, 2 + Math.round((1 - down) * 2) - (V.kick > now ? 1 : 0)) : 0;
  if (fillH) { P1(x2, 56, fl - 2 - fillH, 8, fillH, V.pop > now ? '#fffbe0' : cu[1]); P1(x2, 56, fl - 2 - fillH, 8, 1, V.pop > now ? '#ffffff' : cu[0]); }
  // Cinta hasta la despensa.
  const by = fl - 3;
  P1(x2, 70, by, 26, 3, K); P1(x2, 70, by, 26, 1, '#4a4e5e');
  const off = cooking ? (Math.floor(V.t / 70) + (V.jolt || 0)) % 3 : 0;
  for (let x = 71 + off; x < 95; x += 3) P1(x2, x, by + 1, 1, 1, '#9aa3b8');
  // Puerta de la despensa, con su rueda en el cartel.
  P1(x2, 96, 7, 14, fl - 7, K); P1(x2, 97, 8, 13, fl - 8, '#5c3a1b'); P1(x2, 99, 10, 11, fl - 10, '#0c0910'); P1(x2, 97, 8, 13, 1, '#8e6234');
  P1(x2, 97, 0, 13, 7, K); P1(x2, 98, 0, 11, 6, '#8e6234'); P1(x2, 98, 0, 11, 1, '#b07a40'); x2.drawImage(miniWheel(L.z), 99, 0);
  // Ruedas: saltan del molde, van por la cinta y entran por la puerta.
  V.wheels = V.wheels.filter((w) => now - w.t0 < w.life);
  for (const w of V.wheels) {
    const t = now - w.t0, gw = w.gold ? goldWheel() : miniWheel(L.z);
    let x, y;
    if (t < 260) { x = 57 - (w.gold ? 2 : 0); y = 17 - gw.height + 4 - Math.round(Math.sin((t / 260) * Math.PI) * 8); }
    else { const k = (t - 260) / (w.life - 260); x = Math.round(62 + k * 40); y = by - gw.height + 1 + (w.gold && k < 0.25 ? -Math.round(Math.abs(Math.sin(k * 24)) * 3) : 0); }
    // La rueda pasa por delante del marco de la puerta y se funde en lo negro de la despensa.
    const fade = Math.max(0, Math.min(1, 1 - (x - 97) / 7)); if (fade <= 0) continue;
    x2.globalAlpha = fade; x2.drawImage(gw, x, y); x2.globalAlpha = 1;
    if (!w.gold && t < 260 && Math.floor(t / 80) % 2 === 0) { P1(x2, x + 1, y - 2, 1, 1, '#ffffff'); P1(x2, x + gw.width - 2, y - 1, 1, 1, '#fff3a0'); }
    if (w.gold && Math.floor(t / 120) % 2 === 0 && x < 92) { P1(x2, x + 2, y - 2, 1, 1, '#ffffff'); P1(x2, x + gw.width - 2, y + 1, 1, 1, '#fff3a0'); }
  }

}
// Indicador de la Grand Wheel: una rueda que se va llenando en sentido horario.
function wheelGauge(c, frac) {
  const n = Math.min(16, Math.floor(frac * 16));
  if (c._n === n) return; c._n = n;
  const x2 = c.getContext('2d'), R = c.width / 2; x2.clearRect(0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const dx = x + 0.5 - R, dy = y + 0.5 - R, d = Math.hypot(dx, dy);
    if (d > R) continue;
    if (d > R - 1.2) { P1(x2, x, y, 1, 1, K); continue; }
    let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI * 2;
    const on = a / (Math.PI * 2) < n / 16;
    P1(x2, x, y, 1, 1, on ? (d < R * 0.35 ? '#fff3a0' : (x + y) % 5 === 0 ? '#e0a020' : '#ffcf2e') : d < R * 0.35 ? '#4a3a20' : '#3a3022');
  }
}

// Cola de avisos: la aprobada (uno a la vez, los menores se agrupan). Si aun así pasa de 4, los del mismo tipo se
// juntan en uno, también los importantes: ninguno se pierde y la cola nunca se queda atrasada.
const _toastQ = toast;
toast = function (html, cls = '', important = false) {
  _toastQ(html, cls, important);
  if (TQ.length <= 4) return;
  const by = {}; for (const q of TQ) (by[q.cls] ||= []).push(q);
  for (const [c, qs] of Object.entries(by)) {
    if (qs.length < 2 || TQ.length <= 4) continue;
    const items = qs.flatMap((q) => q.items); for (const q of qs) TQ.splice(TQ.indexOf(q), 1);
    TQ.push({ html: `<b>${items.length} updates:</b> ${items.slice(0, 3).join(' · ')}${items.length > 3 ? ' · +' + (items.length - 3) + ' more' : ''}`, cls: c, important: qs.some((q) => q.important), items });
  }
};

function drawFlask(c, now) {
  const x2 = c.getContext('2d'), fl = img('assets/main2/out/sprites/ic_flask.png'); x2.clearRect(0, 0, 13, 14); if (fl.complete) x2.drawImage(fl, 0, 0);
  const f = Math.floor(now / 260) % 6; if (f < 4) P1(x2, 5 + (f % 2), 7 - f, 1, 1, '#c8ffc0');
}
const PART_IC = {
  herbs: () => icon(['..g.g..', '.gGgGg.', '..gGg..', '.gGgGg.', '..gGg..', '...b...', '...b...'], { g: '#62d36e', G: '#2f8f44', b: '#8e6234' }),
  pepper: () => icon(['.....g.', '....gg.', '...rr..', '..rRr..', '.rRr...', 'rRr....', 'r......'], { g: '#62d36e', r: '#e2462f', R: '#ff8a6a' }),
  honey: () => icon(['...y...', '...y...', '..yYy..', '.yWyyy.', '.yyyyY.', '.yyyYY.', '..YYY..'], { y: '#ffcf2e', Y: '#e0a020', W: '#fffbe0' }),
  truffle: () => icon(['..bbb..', '.bBbbb.', 'bbBbbbb', 'bbbbbBb', 'bbBbbbb', '.bbbBb.', '..bbb..'], { b: '#6a4a3a', B: '#a87a5a' }),
  washed: () => icon(['...u...', '..uu...', '..uWu..', '.uWuuu.', '.uuuuU.', '.uuuUU.', '..UUU..'], { u: '#5a9cf0', U: '#2b5cab', W: '#cfeefa' }),
  smoked: () => icon(['..ss...', '.s..s..', '....s..', '...s...', '..s....', '..s..s.', '...ss..'], { s: '#b9c1d1' }),
  brined: () => icon(['...w...', '..wWw..', '.wWwww.', 'wWwwwuw', '.wwwuw.', '..wuw..', '...w...'], { w: '#eef4fa', W: '#ffffff', u: '#9ab8d8' }),
  fresh: () => icon(['...w...', '...w...', '.w.W.w.', 'wwWWWww', '.w.W.w.', '...w...', '...w...'], { w: '#cfeefa', W: '#ffffff' }),
  aged: () => icon(['bbbbbbb', '.yyyyy.', '..yyy..', '...y...', '..y.y..', '.yyyyy.', 'bbbbbbb'], { b: '#8e6234', y: '#ffcf2e' }),
  vintage: () => icon(['..vvv..', '.vVvvv.', 'vVvvvvv', 'vvvWvvv', 'vvvvvVv', '.vvvvv.', '..v.v..'], { v: '#9a5fd0', V: '#c8a0f0', W: '#fff3a0' }),
};
function sealCanvas(gold, crack = 0) {
  const c = document.createElement('canvas'); c.width = 15; c.height = 15; c.className = 'seal'; const x2 = c.getContext('2d');
  const [Lc, M, D, I] = gold ? ['#fff3a0', '#ffcf2e', '#c98a08', '#7a4a06'] : ['#ff8a6a', '#c8402e', '#7a1a14', '#f3e3b6'];
  for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) {
    const d = Math.hypot(x - 7, y - 7) + ((x * 3 + y * 5) % 7 === 0 ? 0.5 : 0);
    if (d > 7.3) continue;
    P1(x2, x, y, 1, 1, d > 6.4 ? K : d > 5.4 ? D : x + y < 12 ? Lc : M);
  }
  const g = gold ? ['..k..', '..k..', 'kkkkk', '.kkk.', '.k.k.'] : ['.kkk.', 'k...k', '...k.', '..k..', '.....', '..k..'];
  g.forEach((r, j) => [...r].forEach((ch, i) => ch === 'k' && P1(x2, 5 + i, (gold ? 5 : 4) + j, 1, 1, I)));
  const CR = [[[7, 1], [7, 2], [8, 3]], [[1, 8], [2, 8], [3, 9]], [[13, 6], [12, 7], [12, 8]], [[8, 13], [7, 12], [6, 12]]];
  for (let k = 0; k < crack; k++) for (const [x, y] of CR[k]) P1(x2, x, y, 1, 1, '#ffffff');
  return c;
}
// ---------- GRAND WHEEL ----------
// Como en el juego: cada lote terminado suma su tiempo de cocinado; a los 10 minutos, ese lote sale con una rueda que
// vale 2 minutos de la línea (sin Base ni monedas). Aquí solo cambia cómo se ve:
// · Línea abierta: la prensa da un golpe dorado, sale la Grand Wheel (grande, con su estrella grabada), bota en la cinta,
//   rueda con un brillo y entra en la despensa, que se ilumina un momento. El ratón se sorprende y lo celebra. Una sola cifra.
// · Línea cerrada: su versión pequeña (la rueda salta de la tina y sale de la estación) y el contador hace «ding».
// · Un solo aviso dorado; si salen varias en el mismo segundo, uno solo con todas.
// Todo lo de la escena se dibuja en su lienzo (barato); por rueda, como mucho un elemento flotante.
// SPRITE: Grand Wheel (16 × 12): volumen en cinco tonos (cara superior clara con brillo, borde marcado, canto iluminado a
// la izquierda y en sombra a la derecha, base oscura) y una estrella grabada en la cara: la marca de gran reserva.
const GRAND_ROWS = [
  '.....AAAAAA.....',
  '...AAWWAAAAAY...',
  '..AWWAAAsAAYYY..',
  '.AWAAAAsssAYYYB.',
  'AAAAAAsssssYYYYB',
  'AYYYYYYsssYYYYBB',
  'BBYYYYsYYsYYYYBC',
  'CBBBYYYYYYYYBBBC',
  'CCCCBBBBBBBBCCCD',
  'CWCCCCCCCCCCCCDD',
  'CCCCCCCCCCCCCDDD',
  '.DCDCDDDDDDDDDE.',
  '..EEEEEEEEEEEE..'];
const grandGlyph = () => glyph('grand3', GRAND_ROWS, { W: '#fffbe0', A: '#fff09a', Y: '#ffe55c', B: '#ffcf2e', s: '#efb21c', C: '#f5ab12', D: '#d9830c', E: '#a85c0a' }, '#3a2008');
let GRAND_URL = '';
const grandURL = () => (GRAND_URL ||= grandGlyph().toDataURL());

// La prensa normal sin las ruedas doradas; luego, la Grand Wheel con su secuencia.
const _drawPressBase = drawPress;
drawPress = function (L, V, x2, G, now, cu) {
  const gold = V.wheels.filter((w) => w.gold); V.wheels = V.wheels.filter((w) => !w.gold);
  // Mientras sale la Grand Wheel, la placa de la prensa se queda arriba (la prensa «se abre»).
  const opening = gold.some((w) => now - w.t0 > 300 && now - w.t0 < 760);
  const kick = V.kick; if (opening) V.kick = 0;
  _drawPressBase(L, V, x2, G, now, cu);
  V.kick = kick;
  const live = gold.filter((w) => now - w.t0 < w.life); V.wheels.push(...live);
  for (const w of live) drawGrand(V, x2, G, now, w);
};
function drawGrand(V, x2, G, now, w) {
  const t = now - w.t0, gw = grandGlyph(), fl = G.floor, yb = fl - 3 - gw.height + 1;
  // 1) El molde brilla en oro mientras la prensa da su golpe.
  if (t < 320) { const on = Math.floor(t / 80) % 2 === 0; P1(x2, 56, fl - 6, 8, 4, on ? '#fff3a0' : '#ffcf2e'); P1(x2, 55, 17, 1, 1, '#fffbe0'); P1(x2, 64, 17, 1, 1, '#fffbe0'); return; }
  let x, y, a = 1;
  if (t < 470) {
    // 2) Sube dentro de la prensa (por debajo de la viga)...
    const k = (t - 320) / 150; x = 53; y = Math.round(15 - k * 9);
  } else if (t < 700) {
    // ...salta por encima del poste hasta el principio de la cinta...
    const k = (t - 470) / 230; x = Math.round(53 + k * 18); y = Math.round(6 - Math.sin(k * Math.PI) * 4 + k * (yb - 6));
  } else if (t < 820) {
    // ...y bota al caer.
    x = 71; y = yb - Math.round(Math.sin(((t - 700) / 120) * Math.PI) * 2);
  } else if (t < 2000) {
    // 3) Rueda por la cinta, con su brillo.
    const k = (t - 820) / 1180; x = Math.round(71 + k * 25); y = yb;
  } else {
    // 4) Entra en la despensa: la puerta se ilumina y la rueda se funde en lo oscuro.
    const k = Math.min(1, (t - 2000) / 400); x = Math.round(96 + k * 8); y = yb; a = 1 - k;
    x2.globalAlpha = 0.55 * (1 - k); P1(x2, 99, 10, 11, fl - 10, '#5a3a0a'); x2.globalAlpha = 1;
  }
  if (a <= 0) return;
  x2.globalAlpha = a; x2.drawImage(gw, x, y); x2.globalAlpha = 1;
  // Destellos que van y vienen sobre la rueda (dos como mucho).
  if (t > 320 && a > 0.4) { const f = Math.floor(t / 160); const sx = x + 3 + ((f * 5) % 9), sy = y + 1 + ((f * 3) % 3); P1(x2, sx, sy, 1, 1, '#ffffff'); if (f % 2) { P1(x2, sx - 1, sy, 3, 1, '#fffbe0'); P1(x2, sx, sy - 1, 1, 3, '#fffbe0'); } }
}
// Estación pequeña (línea cerrada): la rueda salta de la tina y sale por la derecha.
const _drawStationBase = drawStation;
drawStation = function (L, x2, G, now) {
  _drawStationBase(L, x2, G, now);
  const V = stOf(L);
  if (G.press || !V.gsmall || now - V.gsmall > 1000) return;
  const t = now - V.gsmall, gw = goldWheel();
  const x = t < 300 ? G.vx + 2 : Math.round(G.vx + 2 + ((t - 300) / 700) * 24), y = t < 300 ? Math.round(G.vy - 2 - Math.sin((t / 300) * Math.PI) * 7) : G.vy - 2;
  x2.drawImage(gw, x, y);
  if (Math.floor(t / 120) % 2 === 0) P1(x2, x + 3, y, 1, 1, '#ffffff');
};
// Aviso de Grand Wheel: un pequeño acontecimiento. Una cinta dorada se despliega, la rueda cae con sus rayos detrás, el
// título se estampa y la cifra cuenta hasta su valor; dura unos 2,5 s y se cierra sola (o con un toque). Si salen varias
// en el mismo momento: un solo aviso «big win», con la pila de ruedas, una fila por línea y un único golpe de confeti.
// Va por la misma cola que los demás avisos (nunca se monta con otro) y es siempre el mismo elemento.
const GWQ = []; let gwTimer = 0, gwFirst = 0, gwAt = 0;
function gwAnnounce(z, lots, wait = 450) {
  const now = performance.now(); if (!GWQ.length) { gwFirst = now; gwAt = 0; }
  GWQ.push([z, lots]); clearTimeout(gwTimer);
  gwAt = Math.max(gwAt, now + wait);
  if (now - gwFirst > 3000) flushGW(); else gwTimer = setTimeout(flushGW, gwAt - now);
}
function flushGW() { clearTimeout(gwTimer); if (!GWQ.length) return; GWS.push(GWQ.splice(0)); runGW(); }
const GWS = []; let gwShowing = false, gwEl = null, gwHide = 0;
function gwStack(n) {
  // Pila de ruedas: una, o dos abajo y una arriba (las de «varias a la vez»).
  const g = grandGlyph(), c = document.createElement('canvas'), many = n > 1;
  c.width = many ? g.width * 2 - 2 : g.width; c.height = many ? g.height * 2 - 5 : g.height;
  const x2 = c.getContext('2d');
  if (many) { x2.drawImage(g, 0, c.height - g.height); x2.drawImage(g, g.width - 2, c.height - g.height); x2.drawImage(g, Math.round((c.width - g.width) / 2), 0); }
  else x2.drawImage(g, 0, 0);
  return c;
}
function gwCard(items, still) {
  const one = items.length === 1, el = document.createElement('div');
  el.className = 'mx-gwx ' + (one ? 'mx-one' : 'mx-many') + (still ? ' mx-still' : '');
  const name = (z) => CZ[z].name;
  el.innerHTML = `<span class="mx-gwx-art"><span class="mx-gwx-rays"></span></span><span class="mx-gwx-rib"><b class="mx-gwx-t">${one ? 'GRAND WHEEL!' : items.length + ' GRAND WHEELS!'}</b>${one
    ? `<span class="mx-gwx-v"><em>+${fmtN(items[0][1])}</em> <i>${name(items[0][0]).toUpperCase()}</i></span><small>2 min of this line, at no cost</small>`
    : `<span class="mx-gwx-list">${items.map(([z, l]) => `<span><img class="pix" src="assets/main2/out/sprites/ic_lot_${z}.png" alt=""><em>+${fmtN(l)}</em> ${name(z)}</span>`).join('')}</span>`}</span>`;
  const rays = raysCanvas(); rays.className = 'pix'; el.querySelector('.mx-gwx-rays').appendChild(rays);
  const st = gwStack(items.length); st.className = 'pix mx-gwx-wheel'; st.style.width = st.width * (one ? 3 : 2) + 'px'; st.style.height = st.height * (one ? 3 : 2) + 'px';
  el.querySelector('.mx-gwx-art').appendChild(st);
  return el;
}
function runGW() {
  if (gwShowing) return;
  const items = GWS.shift(); if (!items) return;
  gwShowing = true;
  const one = items.length === 1, el = gwEl = gwCard(items); gwHost().appendChild(el);
  const hold = one ? 2500 : 3200, end = () => {
    if (!gwShowing || gwEl !== el) return; clearTimeout(gwHide);
    const out = () => { el.remove(); gwShowing = false; gwEl = null; if (GWS.length) runGW(); };
    if (reduced) out(); else { el.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-14px)', opacity: 0 }], { duration: 180, easing: 'steps(4)', fill: 'forwards' }); setTimeout(out, 180); }
  };
  el.onclick = end; gwHide = setTimeout(end, hold);
  if (reduced) return;
  // Entrada: la cinta se despliega, la rueda (o la pila) cae con un destello, los rayos se encienden, el título se estampa.
  el.querySelector('.mx-gwx-rib').animate([{ transform: 'scaleX(.15)', opacity: 0 }, { transform: 'scaleX(1.04)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 200, easing: 'steps(5)' });
  const wh = el.querySelector('.mx-gwx-wheel');
  wh.animate([{ transform: 'translateY(-46px) scale(.7)', filter: 'brightness(2)', opacity: 0 }, { transform: 'translateY(4px) scale(1.12)', filter: 'brightness(1.6)', opacity: 1, offset: 0.55 }, { transform: 'translateY(-3px) scale(.98)', filter: 'none', offset: 0.8 }, { transform: 'none' }], { duration: 420, delay: 60, easing: 'steps(8)', fill: 'backwards' });
  const ry = el.querySelector('.mx-gwx-rays');
  ry.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.08)', offset: 0.6 }, { opacity: 0.85, transform: 'none' }], { duration: 420, delay: 120, easing: 'steps(6)', fill: 'backwards' });
  el.querySelector('.mx-gwx-t').animate([{ transform: 'scale(1.7)', opacity: 0 }, { transform: 'scale(.95)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 220, delay: 220, easing: 'steps(5)', fill: 'backwards' });
  if (one) {
    // La cifra cuenta hasta su valor (rápido, ~10 pasos).
    const v = el.querySelector('.mx-gwx-v em'), total = items[0][1]; let k = 0;
    v.textContent = '+0'; const iv = setInterval(() => { k++; v.textContent = '+' + fmtN(Math.round(total * Math.min(1, k / 10))); if (k >= 10) clearInterval(iv); }, 36);
    el.querySelector('.mx-gwx-v').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: 300, easing: 'steps(2)', fill: 'backwards' });
  } else {
    el.querySelectorAll('.mx-gwx-list > span').forEach((r, i) => r.animate([{ transform: 'translateX(-10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 160, delay: 300 + i * 80, easing: 'steps(4)', fill: 'backwards' }));
    setTimeout(() => { if (gwEl !== el) return; const [x, y] = CM.pmice.ptOf(wh); burst(CM.pmice.sfxL(), x, y, 14, ['#ffcf2e', '#fff3a0', '#ffffff', '#f5ab12'], { spread: 70, up: 30, size: 4, dur: 700 }); }, 420);
  }
}
function raysCanvas() {
  const N = 123, R = 61, c = document.createElement('canvas'); c.width = N; c.height = N; c.className = 'rv-rays'; const x2 = c.getContext('2d');
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x - R, dy = y - R, d = Math.hypot(dx, dy); if (d > R || d < 14) continue;
    const a = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2) * 12, f = a - Math.floor(a);
    const w = 0.22 * (1 - d / R) + 0.06; // rayos que se afinan hacia fuera
    if (Math.abs(f - 0.5) > w) continue;
    P1(x2, x, y, 1, 1, d < 30 ? '#ffe55c' : d < 46 ? '#e0a020' : '#8a5a0a');
  }
  return c;
}
function burst(layer, x, y, n, colors, { spread = 34, up = 30, size = 4, dur = 700, fall = 18 } = {}) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'mx-fc-px'; p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
    layer.appendChild(p);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = spread * (0.6 + Math.random() * 0.5);
    const dx = Math.round(Math.cos(a) * r / 2) * 2, dy = Math.round((Math.sin(a) * r - up * Math.random()) / 2) * 2;
    p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 1, offset: 0.55 }, { transform: `translate(${dx}px,${dy + fall}px)`, opacity: 0 }], { duration: dur + Math.random() * 200, easing: 'steps(8)' });
    setTimeout(() => p.remove(), dur + 260);
  }
}
const hasGM = (L) => !!(L.m && L.gm);
IC.wheel ||= () => icon(['..yyyy..', '.yYWYYy.', 'yYYYYYYy', 'y!!!!!!O', '.!!?!!O.', '..OOOO..'], { y: '#ffcf2e', Y: '#ffe55c', W: '#fffbe0', '!': '#e0a020', '?': '#c98a08', O: '#8a5a0a' }, '#2a1d0a');
const FURS = {
  white: ['#fdf9fa', '#ebe2e6', '#bdaeb8'], grey: ['#cdc8d1', '#aaa4b0', '#7f7987'], brown: ['#dcae74', '#c08a50', '#8e6234'], dark: ['#77717f', '#55505c', '#38333f'],
  cream: ['#fff6dc', '#f3e3b6', '#d9c38a'], peach: ['#ffe8d8', '#ffd9c2', '#eab59a'], blue: ['#dce9fa', '#a8c4e8', '#7f9cc4'],
  mint: ['#d8f8e6', '#a8e8c8', '#7fc4a0'], lilac: ['#f0e2fc', '#d8b8f0', '#b08fd0'], gold: ['#fff8dc', '#f8e08a', '#d4a84a'],
};
const COMMON = ['white', 'grey', 'brown', 'dark', 'cream', 'peach', 'blue'];
const hashS = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
function trophyCanvas(m, dy = 0, up = 1) {
  // Lienzo 26 × 26: el ratón a la izquierda y sitio a la derecha para el brazo alzado.
  const c = document.createElement('canvas'); c.width = 26; c.height = 26; const x = c.getContext('2d');
  // Paso intermedio: la rueda sujeta al pecho (la misma pose del nicho).
  if (!up) { x.drawImage(mouseCanvas(m, dy, false, { face: 'happy', wheel: 1 }), 0, 6); return c; }
  x.drawImage(mouseCanvas(m, dy, false, { face: 'happy', hold: 1 }), 0, 6);
  // Pelaje del ratón (sus tres tonos) y la pata en rosa, como los pies.
  const h = hashS(m.name), fur = m.fur || (m.rar === 2 ? 'gold' : m.rar === 1 ? (h % 2 ? 'mint' : 'lilac') : COMMON[h % COMMON.length]);
  const [g, G, D] = FURS[fur], P = '#ffb3c6', Q = '#d9607f', ink = '#2a1d2e';
  const Y = dy;
  // El brazo que colgaba se quita (y su contorno): ahora sale del hombro hacia delante.
  x.clearRect(14, 19 + Y, 3, 3); x.fillStyle = D; x.fillRect(13, 20 + Y, 1, 1);
  // Brazo corto en diagonal: del hombro hacia arriba y adelante, sin codo marcado (a esta escala, un brazo de ratón es
  // un trazo de 2 px). Luz arriba-izquierda (g), sombra abajo-derecha (D); la pata, rosa como los pies, bajo la rueda.
  const arm = [
    [14, 19, G], [15, 19, D],
    [15, 18, g], [16, 18, D],
    [16, 17, g], [17, 17, D],
    [17, 16, g], [18, 16, D],
    [17, 15, g], [18, 15, D],
    [18, 14, g], [19, 14, D],
    [18, 13, g], [19, 13, D],
    [18, 12, P], [19, 12, Q],
    [18, 11, P], [19, 11, P],
  ];
  const on = new Set(arm.map(([ax, ay]) => ax + ',' + ay));
  const img = x.getImageData(0, 0, 26, 26).data, empty = (ax, ay) => ax < 0 || ay < 0 || ax > 25 || ay > 25 || img[(ay * 26 + ax) * 4 + 3] === 0;
  x.fillStyle = ink;
  for (const [ax, ay] of arm) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = ax + ox, ny = ay + oy; if (!on.has(nx + ',' + ny) && empty(nx, ny + Y)) x.fillRect(nx, ny + Y, 1, 1); }
  for (const [ax, ay, cc] of arm) { x.fillStyle = cc; x.fillRect(ax, ay + Y, 1, 1); }
  // La rueda, justo encima de la pata y del frente del gorro; los dedos asoman por delante de su borde.
  x.drawImage(IC.wheel(), 14, 2 + Y);
  x.fillStyle = P; x.fillRect(18, 10 + Y, 1, 1); x.fillStyle = Q; x.fillRect(19, 10 + Y, 1, 1);
  return c;
}
const gmMedal = () => glyph('gmmedal', ['r...r', 'rr.rr', '.rRr.', '.yyy.', 'yYWyy', 'yyyyO', '.yyO.'], { r: '#e2462f', R: '#9c2a1c', y: '#ffcf2e', Y: '#fff3a0', W: '#ffffff', O: '#c98a08' }, '#2a1408');
const _drawStationGM = drawStation;
drawStation = function (L, x2, G, now) {
  const gm = L.gm; L.gm = 0; _drawStationGM(L, x2, G, now); L.gm = gm;
  if (!hasGM(L)) return;
  // En la escena abierta, arriba a la izquierda sobre el puesto (la posición elegida por el propietario, un píxel más abajo
  // para que se vea entera); en la estación pequeña, junto al ratón.
  const V = stOf(L), m = gmMedal(), mx = G.press ? 2 : 17, my = 0;
  x2.drawImage(m, mx, my + (V.gmUp > now ? (Math.floor(now / 90) % 2) : 0));
  if (Math.floor(now / 2600) % 3 === 0 && Math.floor(now / 160) % 2 === 0) P1(x2, mx + 2, my + 5, 1, 1, '#ffffff');
};
const _drawCookGM = drawCook;
drawCook = function (L, V, x2, G, now) {
  if (G.press && L.m && V.gmUp > now && L.st === 'cook') {
    const t = 1100 - (V.gmUp - now), my = G.floor - 19, dy = t > 200 && t < 700 ? Math.floor(t / 120) % 2 : 0;
    const k = 'tro' + dy + (t < 160 ? 'a' : 'b'); V.cache[k] ||= trophyCanvas(L.m, 0, t < 160 ? 0 : 1);
    x2.drawImage(V.cache[k], G.mx, my - 6 - dy);
    return;
  }
  _drawCookGM(L, V, x2, G, now);
};
const boardIcon = () => glyph('board', [
  '...LLy..............',
  '..LLLLLy............',
  '.LLLLLLLLy..........',
  '.YYYYYYYYYy....ww...',
  '.YoYYYYoYYy...wWWw..',
  '.YYYYoYYYYy...wWWw..',
  '.yyyyyyyyyy....ww...',
  'bbbbbbbbbbbbbbbbbbbb',
  'BBBBBBBBBBBBBBBBBBBB'], { L: '#ffe98a', Y: '#ffcf2e', y: '#e0a020', o: '#b07818', w: '#fbf3d6', W: '#ead9a0', b: '#c9884a', B: '#8e5a2a' });

  // ---- Montaje en el juego ----
  // Una línea por roca, viva entre repintados: su estado visual (V, en stOf) no se pierde aunque el panel se rehaga.
  const LINES = {};
  const BOOST_GAME = (CM.BALANCE.cheesery || {}).boostMs || BOOST_MS; // el del juego, no el del mockup
  const secs = (ms) => (ms < 10000 ? Math.round(ms / 100) / 10 + 's' : ms < 60000 ? Math.round(ms / 1000) + 's' : Math.floor(ms / 60000) + 'm ' + Math.round((ms % 60000) / 1000) + 's');
  const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function crew(key) {
    const s = CM.ui && CM.ui.state(); if (!s || !key) return null;
    const m = CM.mice.byId(s, key); return m ? CM.m2crew(m, 'cheesemaking') : null;
  }
  let flasks = [];
  function mount(root) {
    const now = performance.now();
    for (const el of root.querySelectorAll('.mx-ch-line[data-line]')) {
      const id = el.dataset.line;
      const L = LINES[id] || (LINES[id] = { id, z: el.dataset.base, st: el.dataset.st, mk: '' });
      const was = L.st;
      L.el = el; L.z = el.dataset.base; L.st = el.dataset.st; L.gm = +el.dataset.gm || 0;
      if (L.mk !== el.dataset.cook) { L.mk = el.dataset.cook || ''; L.m = crew(L.mk); }
      L.cs = el.querySelector('.mx-ch-st canvas'); L.cw = el.querySelector('.mx-ch-scene canvas');
      L.barI = el.querySelector('.mx-ch-bar i'); L.open = el.classList.contains('mx-on');
      for (const c of [L.cs, L.cw]) if (c) c.getContext('2d').imageSmoothingEnabled = false;
      // Arrancar y parar se ven (como en el mockup): fuego, vapor, cara y un destello en la tarjeta.
      if (was && was !== L.st && L.seen) { if (L.st === 'cook') resumeFx(L); else if (was === 'cook') stopFx(L); }
      L.seen = true;
      paint(L, now);
    }
    for (const c of root.querySelectorAll('canvas[data-part]')) { const src = PART_IC[c.dataset.part] && PART_IC[c.dataset.part](); if (!src) continue; c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); }
    for (const c of root.querySelectorAll('canvas[data-seal]')) { const src = sealCanvas(false); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); }
    flasks = [...root.querySelectorAll('canvas[data-flask]')];
    for (const c of flasks) c.getContext('2d').imageSmoothingEnabled = false;
  }
  function paint(L, now) {
    if (L.open && L.cw) drawStation(L, L.cw.getContext('2d'), GEO.wide, now);
    else if (L.cs) drawStation(L, L.cs.getContext('2d'), GEO.small, now);
  }
  const sfx = () => CM.pmice && CM.pmice.sfxL();
  function floatText(layer, x, y, html, cls, dur, rise) {
    const t = document.createElement('span'); t.className = cls; t.style.left = x + 'px'; t.style.top = y + 'px'; t.innerHTML = html; layer.appendChild(t);
    t.style.left = Math.round(x - t.offsetWidth / 2) + 'px'; // centrada en su punto, no empezando en él
    t.animate([{ transform: 'translateY(4px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.15 }, { transform: 'translateY(0)', opacity: 1, offset: 0.7 }, { transform: 'translateY(-' + rise + 'px)', opacity: 0 }], { duration: dur, easing: 'steps(6)' });
    setTimeout(() => t.remove(), dur);
  }
  const visible = (el) => { const b = document.getElementById('sheet-body'); if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(), S = b.getBoundingClientRect(); const y = (r.top + r.bottom) / 2; return r.width > 0 && y > S.top + 22 && y < S.bottom - 10; };
  function stopFx(L) {
    const V = stOf(L), now = performance.now(), G = L.open ? GEO.wide : GEO.small;
    for (let k = 0; k < 5; k++) V.steam.push({ x: G.vx + 3 + k * 3, y: G.floor - 2, t0: now - k * 60, life: 700 });
    V.face = L.m ? 'down' : null; V.faceUntil = now + 900;
    L.el.classList.remove('mx-ch-dim', 'mx-ch-flash'); void L.el.offsetWidth; L.el.classList.add('mx-ch-dim');
  }
  function resumeFx(L) {
    const V = stOf(L), now = performance.now(), G = L.open ? GEO.wide : GEO.small;
    V.hop = now + 360; V.face = 'happy'; V.faceUntil = now + 1100; V.fill = Math.min(V.fill, 0.2);
    for (let k = 0; k < 6; k++) V.drops.push({ x: G.vx + 3 + Math.random() * (G.vw - 6), y: G.floor - 2, vx: (Math.random() - 0.5) * 1.2, vy: -1.4 - Math.random(), c: k % 2 ? '#ffcf2e' : '#ff8a2e', t0: now, life: 380 });
    L.el.classList.remove('mx-ch-dim', 'mx-ch-flash'); void L.el.offsetWidth; L.el.classList.add('mx-ch-flash');
  }
  // Fin de lote (lo dice el juego: el lote en marcha se acaba o empieza otro): la rueda sale del molde y cruza la cinta, y
  // con medida (uno cada 1,2 s por línea) sube «+N» con lo cocinado.
  function batchDone(L, per, now) {
    const V = stOf(L);
    L.acc = (L.acc || 0) + per;
    if (L.open) { V.pop = now + 140; if (V.wheels.filter((w) => !w.gold && now - w.t0 < w.life - 300).length < 4) V.wheels.push({ t0: now, life: 1700 }); }
    if (now - (L.lastFx || 0) < 1200) return;
    L.lastFx = now; const amount = L.acc; L.acc = 0;
    const host = L.open ? L.el.querySelector('.mx-ch-scene') : L.el.querySelector('.mx-ch-st');
    const layer = sfx(); if (!layer || !visible(host) || document.querySelectorAll('.mx-ch-plus').length > 7) return;
    // La cifra se centra sobre la estación (la de una línea plegada no pisa el nombre de la receta).
    const [x, y] = CM.pmice.ptOf(host, L.open ? 4 : 0, L.open ? -6 : -10);
    floatText(layer, x, y, '+' + CM.fmt(amount), 'mx-ch-plus mx-out', 900, 12);
  }
  // Grand Wheel: la rueda en la cabecera y en la fila de la línea abierta, y lo que falta.
  function wheels(s) {
    for (const c of document.querySelectorAll('#sheet-body canvas[data-gw]')) {
      const z = s.zones[c.dataset.gw]; if (!z) continue; const every = CM.BALANCE.milestones.wheel.everyMs;
      wheelGauge(c, (z.wheelMs || 0) / every);
      const t = c.parentElement.querySelector('[data-gwt]'); if (t) t.textContent = mmss(every - (z.wheelMs || 0));
    }
  }
  // SPEED UP: cada toque, un golpe de pala con su respuesta en la máquina y su «-0.3s» sobre la tina. El tiempo lo
  // descuenta el juego (cheeseTap); esto es lo que se ve.
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#sheet-body .mx-ch-btn.mx-speed'); if (!b) return;
    const el = b.closest('.mx-ch-line'), L = el && LINES[el.dataset.line]; if (!L) return;
    const V = stOf(L), now = performance.now();
    V.fast = now + 420; V.boost = Math.min(0.8, (V.boost || 0) + 0.3);
    if (!V.stroke || now - V.stroke >= STROKE) { V.stroke = now; V.hit = false; } else V.queue = Math.min(2, (V.queue || 0) + 1);
    const sc = el.querySelector('.mx-ch-scene');
    if (sc && !reduced) {
      if (!sc._pool) { sc._pool = []; sc._pi = 0; for (let i = 0; i < 3; i++) { const n = document.createElement('span'); n.className = 'mx-ch-num'; sc.appendChild(n); sc._pool.push(n); } }
      const i = sc._pi++ % sc._pool.length, n = sc._pool[i];
      n.textContent = '-' + secs(BOOST_GAME); n.style.left = (32 + Math.random() * 3).toFixed(1) + '%'; n.style.top = (14 + i * 13).toFixed(1) + '%';
      if (n._a) n._a.cancel();
      n._a = n.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1, offset: 0.2 }, { transform: 'translate(-50%,-80%) scale(1)', opacity: 1, offset: 0.6 }, { transform: 'translate(-50%,-120%) scale(1)', opacity: 0 }], { duration: 520, easing: 'steps(7)', fill: 'forwards' });
      b.animate([{ transform: 'translateY(2px)', filter: 'brightness(.85)' }, { transform: 'none', filter: 'none' }], { duration: 130, easing: 'steps(2)' });
    }
  }, true);
  // Pintado: la escena abierta a 25 fps; las pequeñas, a 12 (como en el mockup).
  let tick = 0;
  setInterval(() => {
    if (document.getElementById('sheet').hidden) return;
    const s = CM.ui && CM.ui.state(); if (!s) return;
    const now = performance.now(); tick++;
    for (const id of Object.keys(LINES)) {
      const L = LINES[id]; if (!L.el || !L.el.isConnected) continue;
      const job = s.zones[id] && s.zones[id].cookJob;
      if (L.job && (job !== L.job || (job && job.remaining > L.rem + 1))) batchDone(L, L.job.per || 1, now);
      L.job = job; L.rem = job ? job.remaining : 0;
      if (L.open || tick % 2 === 0) paint(L, now);
    }
    if (tick % 5 === 0) wheels(s);
    for (const c of flasks) if (c.isConnected) drawFlask(c, now);
  }, 40);
  // ---- GRAND WHEEL con el juego ----
  // El juego saca la rueda (evento grandWheel). Línea abierta: la prensa da su golpe dorado y sale la rueda grande, que rueda
  // a la despensa, y el quesero se sorprende y lo celebra; cerrada: su versión pequeña. El contador hace «ding» y sale el
  // aviso dorado (varias a la vez, uno solo). Con la hoja cerrada, el aviso de siempre (main.js).
  const fmtN = (n) => CM.fmt(Math.floor(n));
  const gwHost = () => document.querySelector('#sheet .panel');
  function grand(ev) {
    const L = LINES[ev.zone]; if (!L || !L.el || !L.el.isConnected || document.getElementById('sheet').hidden) return false;
    const V = stOf(L), now = performance.now();
    if (!reduced) for (const c of L.el.querySelectorAll('canvas[data-gw]')) { const g = c.closest('.mx-gw, .mx-ch-gwrow'); if (g) { g.classList.remove('mx-gw-ding'); void g.offsetWidth; g.classList.add('mx-gw-ding'); } }
    if (L.open) {
      V.wheels.push({ t0: now, life: 2400, gold: true }); V.kick = now + 280; V.flare = now + 300;
      V.face = 'wow'; V.faceUntil = now + 380; setTimeout(() => { const t = performance.now(); V.face = 'happy'; V.faceUntil = t + 800; V.hop = t + 360; }, 380);
    } else V.gsmall = now;
    if (!reduced && visible(L.el)) { const sw = document.createElement('div'); sw.className = 'mx-ch-sweep'; sw.style.setProperty('--sw', '#ffcf2e66'); L.el.appendChild(sw); setTimeout(() => sw.remove(), 520); }
    gwAnnounce(ev.zone, ev.lots, L.open ? 2300 : 450);
    return true;
  }
  // El contador: «a punto» en el último minuto de cocinado (late suave); en pausa si la línea no cocina.
  function gwStates(s) {
    const every = CM.BALANCE.milestones.wheel.everyMs;
    for (const c of document.querySelectorAll('#sheet-body canvas[data-gw]')) {
      const z = s.zones[c.dataset.gw], el = c.closest('.mx-gw, .mx-ch-gwrow'); if (!z || !el) continue;
      const cooking = !!z.cookJob, soon = cooking && every - (z.wheelMs || 0) < 60000;
      if (el.classList.contains('mx-soon') !== soon) el.classList.toggle('mx-soon', soon);
      if (el.classList.contains('mx-paused') !== !cooking) el.classList.toggle('mx-paused', !cooking);
    }
  }
  setInterval(() => { if (document.getElementById('sheet').hidden) return; const s = CM.ui && CM.ui.state(); if (s) gwStates(s); }, 250);
  // ---- GRAND MASTER con el juego ----
  // Sube de grado (masterUp): en la línea abierta el quesero alza la rueda dorada un momento (en las demás, salta), la
  // etiqueta se estampa y la cifra de precio destella. Nombrar a otro (masterNamed) con la hoja abierta: la etiqueta vuela
  // de la línea que la pierde a la que la recibe.
  const lineOf = (id) => Object.values(LINES).find((L) => L.mk === id && L.el && L.el.isConnected);
  function gmUp(id) {
    const L = lineOf(id); if (!L) return;
    const V = stOf(L), now = performance.now();
    if (L.open) V.gmUp = now + 1100; else { V.hop = now + 360; V.face = 'happy'; V.faceUntil = now + 900; }
    setTimeout(() => {
      if (reduced || !L.el || !L.el.isConnected) return;
      const g = L.el.querySelector('.mx-ch-k .mx-gm');
      if (g && visible(g)) { g.animate([{ transform: 'scale(1.3)', opacity: 0 }, { transform: 'scale(.94)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 280, easing: 'steps(6)' }); const [x, y] = CM.pmice.ptOf(g); burst(CM.pmice.sfxL(), x, y, 6, ['#ffcf2e', '#fff3a0'], { spread: 16, up: 8, size: 2, dur: 420 }); }
      const f = L.el.querySelector('.mx-ch-fact.mx-gm'); if (f) f.animate([{ boxShadow: 'inset 0 0 0 2px #ffcf2e', background: '#3a2a08' }, { boxShadow: 'none' }], { duration: 600, easing: 'steps(4)' });
    }, 80);
  }
  function gmTransfer(fromId, toId, grade) {
    const from = fromId && lineOf(fromId), to = lineOf(toId); if (!to) return;
    const g = from && from.el.querySelector('.mx-ch-k .mx-gm'), from0 = g && visible(g) ? CM.pmice.ptOf(g) : null;
    const tg = to.el.querySelector('.mx-ch-k'), to0 = tg && visible(tg) ? CM.pmice.ptOf(tg, 40) : null;
    const land = () => { const g2 = to.el && to.el.querySelector('.mx-ch-k .mx-gm'); if (g2 && !reduced) g2.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(.95)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 240, easing: 'steps(5)' }); };
    if (from0 && to0 && !reduced) {
      const fly = document.createElement('span'); fly.className = 'mx-gm-fly'; fly.textContent = 'GM ' + ((g, r = '') => { for (const [v, t] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (g >= v) { r += t; g -= v; } return r; })(grade); fly.style.left = from0[0] + 'px'; fly.style.top = from0[1] + 'px'; CM.pmice.sfxL().appendChild(fly);
      const dx = to0[0] - from0[0], dy = to0[1] - from0[1];
      fly.animate([{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(calc(-50% + ' + dx / 2 + 'px), calc(-50% + ' + (dy / 2 - 30) + 'px))', offset: 0.5 }, { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))' }], { duration: 420, easing: 'steps(9)' });
      setTimeout(() => { fly.remove(); land(); }, 420);
    } else setTimeout(land, 60);
  }
  // ---- CHEESE BOARD con el juego (aparcado: solo partidas que ya lo compraron) ----
  // Cuenta como el juego (boardFamilies, board.mult). Se pinta en su sitio: el multiplicador solo reacciona si cambia de
  // verdad (0,02 o más) y como mucho una vez cada 3 s; los tramos de las barras se reutilizan y solo cambian de ancho.
  const BD_COL = ['#ffcf2e', '#5a9cf0', '#b58cff', '#62d36e'];
  const BD_T = { ingredient: 'ingredients', treatment: 'treatments', maturation: 'maturations' };
  let BD_SHOWN = 0, BD_LASTFX = 0, BD_EL = null;
  function paintBoard(first) {
    const el = BD_EL, s = CM.ui && CM.ui.state(); if (!el || !el.isConnected || !s || !s.board) return;
    const m = s.board.mult || 1, em = el.querySelector('.mx-bd-m em'), now = performance.now();
    em.textContent = 'x' + m.toFixed(2);
    if (!first && Math.abs(m - BD_SHOWN) >= 0.02 && now - BD_LASTFX > 3000 && !reduced) {
      BD_LASTFX = now; const up = m > BD_SHOWN;
      el.querySelector('.mx-bd-m').animate([{ transform: 'scale(1.18)', filter: up ? 'brightness(1.5)' : 'brightness(.8)' }, { transform: 'none', filter: 'none' }], { duration: 320, easing: 'steps(4)' });
      const sw = document.createElement('div'); sw.className = 'mx-ch-sweep'; sw.style.setProperty('--sw', up ? '#ffcf2e55' : '#9f97b844'); el.appendChild(sw); setTimeout(() => sw.remove(), 520);
    }
    if (first || Math.abs(m - BD_SHOWN) >= 0.005) BD_SHOWN = m;
    const fams = CM.milestones.boardFamilies(s), per = CM.BALANCE.milestones.board.per;
    for (const f of el.querySelectorAll('.mx-bd-fam')) {
      const k = f.dataset.k, F = fams[k]; if (!F) continue;
      const T = CM.BALANCE[BD_T[k]], parts = F.shares.filter((x) => x.share >= 0.005).sort((a, b) => b.share - a.share);
      f.querySelector('small').textContent = parts.length ? parts.map((x) => T[x.id].name + ' ' + Math.round(x.share * 100) + '%').join(' · ') : 'No sales yet';
      f.querySelector('u').textContent = '+' + Math.round((F.eff - 1) * per * 100) + '%';
      const bar = f.querySelector('.mx-bd-bar'), have = [...bar.children];
      parts.forEach((x, i) => { let sg = have[i]; if (!sg) { sg = document.createElement('i'); bar.appendChild(sg); } sg.style.width = (x.share * 100).toFixed(1) + '%'; sg.style.setProperty('--c', BD_COL[i % 4]); });
      have.slice(parts.length).forEach((sg) => sg.remove());
    }
  }
  function mountBoard(root) {
    const el = root.querySelector('[data-board]'); if (!el) return;
    const c = el.querySelector('canvas[data-bdic]'); if (c && !c.dataset.on) { c.dataset.on = '1'; const g = boardIcon(); c.width = g.width; c.height = g.height; c.style.width = g.width * 2 + 'px'; c.style.height = g.height * 2 + 'px'; c.getContext('2d').drawImage(g, 0, 0); }
    const fresh = el !== BD_EL; BD_EL = el; paintBoard(fresh && !BD_SHOWN);
  }
  setInterval(() => { if (!document.getElementById('sheet').hidden && BD_EL && BD_EL.isConnected) paintBoard(false); }, 500);
  CM.pcheese = { mount: (root) => { mount(root); mountBoard(root); }, lines: LINES, grand, gmUp, gmTransfer };
})();
