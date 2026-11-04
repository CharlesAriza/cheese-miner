// GENERADO por exploracion/pixel/main2-src/game/build_celebrate.py: no editar a mano. Celebraciones aprobadas
// (celebraciones.html): la ceremonia legendaria de nivel 3 y la ventana RETRAINED. Solo se ven; lo que pasa lo decide el juego.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = (s) => { const i = new Image(); i.src = s.startsWith('out/') ? 'assets/main2/' + s : s; return i; };
  const mouseCanvas = (...a) => CM.m2mouse(...a);
  // La caja de la ceremonia (una sola, sobre todo el juego).
  function l3Box() { let b = document.getElementById('vw-l3'); if (!b) { b = document.createElement('div'); b.id = 'vw-l3'; b.className = 'vw-l3'; b.hidden = true; document.getElementById('app').appendChild(b); } return b; }
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
function whiteOf(src) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fffbe8'; x.fillRect(0, 0, c.width, c.height); return c;
}
const IMGC = {};
const img = (src) => (IMGC[src] ||= IMG(src));
const K = '#1b1220';
const P1 = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const GLY = {};
const glyph = (k, rows, pal) => (GLY[k] ||= icon(rows, pal));
const copyC = (g, k = 2) => { const c = document.createElement('canvas'); c.width = g.width; c.height = g.height; c.getContext('2d').drawImage(g, 0, 0); return toImg(c, k); };
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const EASE = 'cubic-bezier(.22,.8,.3,1)', EASE_IN = 'cubic-bezier(.55,0,.8,.35)';
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const easeIn = (t) => Math.pow(clamp01(t), 2);
const easeInOut = (t) => { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const seg = (t, a, b) => clamp01((t - a) / (b - a));
function press(e) { if (!e || reduced) return; if (e._pa) e._pa.cancel(); e._pa = e.animate([{ transform: 'translateY(2px)' }, { transform: 'none' }], { duration: 160, easing: EASE }); }
const $id = (i) => document.getElementById(i);
const S_ = (k, z) => `out/sprites/ic_${k}_${z}.png`;
const ZN = { cheddar: 'Cheddar', gouda: 'Gouda', brie: 'Brie', emmental: 'Emmental', parmesan: 'Parmesan', blue: 'Blue' };
const VAL = { cheddar: 10, gouda: 24, brie: 60, emmental: 150, parmesan: 380, blue: 950 };
// Moneda que gira (la de la venta aprobada en SHOP).
const COIN_F = [['..kkk..', '.kHHGk.', 'kHWGGDk', 'kHGGGDk', 'kGGGDDk', '.kGDDk.', '..kkk..'], ['..kkk..', '..kHGk.', '.kHGGDk', '.kHGGDk', '.kGGDDk', '..kGDk.', '..kkk..'], ['...k...', '..kGk..', '..kGk..', '..kGk..', '..kDk..', '..kDk..', '...k...']];
const COIN_PAL = { k: K, H: '#fff0a0', W: '#ffffff', G: '#ffcf2e', D: '#b8860b' };
function drawRows(g, rows, x, y, pal) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '.') return; g.fillStyle = pal[ch]; g.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); })); }
const bullet = () => glyph('bul', ['m..', 'mm.', 'mmm', 'mm.', 'm..'], { m: '#9f97b8' });
// Polvo: nubecillas de 3 × 2 en tonos de tierra que se abren y se apagan (no píxeles sueltos).
function puff(g, x, y, k, dir) { if (k <= 0 || k >= 1) return; const a = 1 - k, dx = dir * Math.round(easeOut(k) * 9), dy = -Math.round(easeOut(k) * 3); g.globalAlpha = a; P1(g, x + dx, y + dy, 3, 2, '#d8ccb0'); P1(g, x + dx + dir * 2, y + dy - 1, 2, 1, '#efe4c8'); P1(g, x + dx - dir, y + dy + 1, 2, 1, '#b8a888'); g.globalAlpha = 1; }
// Fondo de la colonia (el de MAIN): cielo y colinas; el suelo, a la altura de la escena. Con desplazamiento de cámara.
function colonyBg(g, W, H, cam = 0) { const bg = img('out/sprites/bg_cheddar.png'), gr = img('out/sprites/ground.png'); const gy = H - 9;
  if (bg.complete && bg.width) { const o = -Math.round(cam * 0.5) % bg.width; for (let x = o - bg.width; x < W; x += bg.width) g.drawImage(bg, x, gy - 75); }
  if (gr.complete && gr.width) { const o = -Math.round(cam) % gr.width; for (let x = o - gr.width; x < W; x += gr.width) g.drawImage(gr, x, gy); } }
// Un fotograma de una tira de animación aprobada (edificios de MAIN).
function frameOf(g, src, fw, fh, f, x, y) { const im = img(src); if (!im.complete || !im.width) return; const n = Math.max(1, Math.floor(im.width / fw)); g.drawImage(im, (f % n) * fw, 0, fw, fh, Math.round(x), Math.round(y), fw, fh); }

const SX = 53, SY = 20;
let L3 = null;
function showL3(opt = {}) {
  const box = l3Box(); clearInterval(L3 && L3.iv); box.getAnimations().forEach((a) => a.cancel()); box.replaceChildren(); box.hidden = false;
  const born = !!opt.born;
  // El recluta legendario es de rareza legendaria (pelo dorado y corona) y llega sin puesto; el otro es una quesera de la colonia.
  const m = opt.m;
  const word = el('div', 'vw-lgw', 'LEGENDARY');
  const stage = el('div', 'vw-lgs'); const cv = document.createElement('canvas'); cv.width = 120; cv.height = 118; cv.className = 'pix vw-lgbg'; stage.appendChild(cv);
  const hero = document.createElement('canvas'); hero.width = 22; hero.height = 20; hero.className = 'pix vw-lgm'; stage.appendChild(hero);
  const star = copyC(IC.star(), 6); star.classList.add('vw-lgstar'); stage.appendChild(star);
  const bang = el('span', 'vw-lgbang', '!'); stage.appendChild(bang);
  const card = el('div', 'vw-lgc', `<small>${opt.who.toUpperCase()} ${born ? 'JOINED YOUR COLONY' : 'DEVELOPED A LEGENDARY TRAIT'}</small><b>${opt.trait}</b><p>${opt.desc}</p>` + (born || !opt.before ? '' : `<div class="vw-lgd"><span><small>${opt.at}</small><s>${opt.before}</s></span><i></i><span><small>NOW</small><u>${opt.after}</u></span></div>`) + (opt.where ? `<div class="vw-lgwhere${opt.where.free ? ' free' : ''}">${opt.where.html}</div>` : '') + '<em>tap to continue</em>');
  box.append(word, stage, card);
  const g = cv.getContext('2d'), hg = hero.getContext('2d'); g.imageSmoothingEnabled = false; hg.imageSmoothingEnabled = false;
  const tint = (c, col) => { const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; const x = k.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, k.width, k.height); return k; };
  const cache = {}; const fr = (dy, blink, o, tone) => { const k = dy + (blink ? 'b' : '') + JSON.stringify(o) + tone; if (!cache[k]) { let c = mouseCanvas(m, dy, blink, o); if (tone === 'white') c = whiteOf(c); if (tone === 'gold') c = tint(c, '#ffe55c'); cache[k] = c; } return cache[k]; };
  // Tiempos. Desarrollado: «!» a 0,35. Recluta: entra andando (0,6 s) y se presenta. Los dos se cargan 0,6 s y estallan a 1,45.
  const WALK = born ? 0.6 : 0, NOTICE = born ? 0.6 : 0.35, CHARGE = 0.85, CLIMAX = 1.45, RES = 2.25;
  const FY = 107, CX = 60; // suelo y centro, en píxeles del fondo
  const t0 = performance.now();
  L3 = { t0, skip: 0, iv: 0, after: opt.then || null };
  const motes = [[-26, 0.0], [22, 0.07], [-14, 0.14], [30, 0.21], [-32, 0.28], [10, 0.35], [-6, 0.42], [18, 0.49]];
  const flags = { bang: false, climax: false, card: false };
  box.onclick = () => { const t = (performance.now() - L3.t0) / 1000 + L3.skip; if (t < RES) { L3.skip += RES + 0.05 - t; return; } if (t > RES + 0.6) closeL3(); };
  const ellipse = (cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) * rx); P1(g, cx - hw, cy + y, hw * 2, 1, col); } };
  function tick() {
    if (box.hidden || !cv.isConnected) return clearInterval(L3.iv);
    const t = reduced ? 9 : (performance.now() - t0) / 1000 + L3.skip;
    g.clearRect(0, 0, 120, 118);
    const ch = seg(t, CHARGE, CLIMAX), after = t >= CLIMAX;
    // Aura detrás del ratón: crece de golpe en el clímax (más intensa 0,4 s) y se queda latiendo despacio.
    if (after) { const e = t - CLIMAX, k = easeOut(seg(t, CLIMAX, CLIMAX + 0.12)), boost = e < 0.4 ? 1 - e / 0.4 : 0, p = Math.floor(e / 0.8) % 2;
      g.globalAlpha = (0.13 + 0.14 * boost) * k; ellipse(CX, 70, 44 + p + Math.round(boost * 4), 34 + Math.round(boost * 2), '#ffcf2e');
      g.globalAlpha = (0.15 + 0.16 * boost) * k; ellipse(CX, 74, 32, 28, '#ffcf2e'); g.globalAlpha = 1; }
    // Suelo de luz bajo el ratón: tenue al principio; crece con la carga; dorado tras el clímax.
    const floorW = Math.round(20 + ch * 16);
    g.globalAlpha = 0.35 + 0.4 * ch; P1(g, CX - floorW, FY, floorW * 2, 1, after ? '#ffcf2e' : '#8a7a50'); P1(g, CX - floorW + 5, FY + 1, floorW * 2 - 10, 1, after ? '#b8860b' : '#4a4030'); g.globalAlpha = 1;
    // Carga: motas doradas suben del suelo y se recogen en el ratón; un resplandor crece a sus pies.
    if (t >= CHARGE && t < CLIMAX + 0.05) {
      for (const [dx, s] of motes) { const k = (t - CHARGE - s) / 0.5; if (k <= 0 || k >= 1) continue; const e = easeIn(k); g.globalAlpha = 1 - k * 0.5; P1(g, CX + Math.round(dx * (1 - e)), FY - Math.round(e * 40), 1, 1, '#fff3a0'); g.globalAlpha = 1; }
      g.globalAlpha = 0.1 + 0.14 * ch; for (let y = 0; y < 12; y++) { const hw = Math.round(Math.sqrt(1 - Math.pow((y - 11) / 12, 2)) * (14 + ch * 10)); P1(g, CX - hw, FY - 11 + y, hw * 2, 1, '#ffcf2e'); } g.globalAlpha = 1;
    }
    // Clímax: anillo dorado que se abre desde los pies y se apaga.
    if (t >= CLIMAX && t < CLIMAX + 0.45) { const k = (t - CLIMAX) / 0.45, rx = Math.round(10 + easeOut(k) * 48), ry = Math.round(3 + easeOut(k) * 6); g.globalAlpha = 1 - k; for (let a = 0; a < 96; a++) { const an = (a / 96) * Math.PI * 2; P1(g, CX + Math.cos(an) * rx, FY + Math.sin(an) * ry, 1, 1, k < 0.5 ? '#fff3a0' : '#ffcf2e'); } g.globalAlpha = 1; }
    // Destello de la estrella: ocho rayos finos que salen de su borde (no de su centro, para no taparla) y se recogen.
    if (t >= CLIMAX && t < CLIMAX + 0.4) { const k = (t - CLIMAX) / 0.4, sx = SX, sy = SY; g.globalAlpha = 1 - easeIn(k);
      for (let a = 0; a < 8; a++) { const an = (a / 8) * Math.PI * 2 - Math.PI / 2, long = a % 2 === 0, r0 = 15 + Math.round(easeOut(k) * 2), len = Math.round((long ? 4 : 2) * (1 - k * 0.5)); for (let r = r0; r < r0 + len; r++) P1(g, sx + Math.round(Math.cos(an) * r), sy + Math.round(Math.sin(an) * r), 1, 1, long ? '#fff3a0' : '#ffcf2e'); }
      g.globalAlpha = 1; }
    // Chispas de la celebración: tres, pequeñas, a los lados del ratón y por debajo de la estrella, lejos de ella.
    if (t >= CLIMAX + 0.08 && t < CLIMAX + 0.9) for (const [x, y, k] of [[14, 61, 0], [106, 55, 1], [100, 87, 2]]) if ((Math.floor((t - CLIMAX) / 0.12) + k) % 3) P1(g, x, y, 1, 1, k === 1 ? '#ffffff' : '#ffcf2e');
    // El ratón.
    let o = {}, face = '', tone = '', tx = 0, ty = 0, jy = 0, sq = null, dy = Math.floor(t / 0.64) % 2, blink = (t * 1000 + 500) % 3400 < 120;
    if (born && t < WALK) { const k = t / WALK; tx = -Math.round((1 - easeOut(k)) * 24); o.legs = Math.floor(t / 0.09) % 2 ? 'a' : 'b'; dy = 0; blink = false; }
    else if (born && t < CHARGE) { face = 'happy'; o.tail = true; dy = 0; blink = false; ty = t < WALK + 0.12 ? -1 : 0; }
    else if (t < NOTICE) { /* reposo */ }
    else if (t < CHARGE) { face = 'wow'; dy = 0; blink = false; ty = t < NOTICE + 0.1 ? -1 : 0; }
    else if (t < CLIMAX) { const e = t - CHARGE; face = 'wow'; dy = 0; blink = false;
      ty = -Math.round(easeOut(seg(t, CHARGE, CLIMAX - 0.2)) * 1);
      if (!born && ((e > 0.25 && e < 0.31) || (e > 0.42 && e < 0.48))) tone = 'white';
      if (t > CLIMAX - 0.12) { ty = 0; sq = [1.1, 0.88]; } } // se agacha para el salto
    else if (t < CLIMAX + 0.9) { const e = t - CLIMAX; face = 'happy'; o.tail = true; blink = false;
      // Salto grande y uno pequeño; estira al despegar y se aplasta al caer.
      // En píxeles de pantalla (el sprite se mueve entero): como mucho 12, para que el sombrero no toque la estrella.
      jy = [-7, -11, -12, -11, -6, 0, -5, -5, 0, 0, 0][Math.min(10, Math.floor(e / 0.08))];
      if (e < 0.08) sq = [0.96, 1.04]; else if (e >= 0.4 && e < 0.48) sq = [1.1, 0.9]; else if (e >= 0.64 && e < 0.7) sq = [1.05, 0.95];
      if (e < 0.07) tone = 'gold'; }
    else { if ((t % 5) < 0.9) face = 'happy'; }
    if (face) o.face = face;
    hg.clearRect(0, 0, 22, 20); hg.drawImage(fr(dy, blink && !face, o, tone), 0, 0);
    hero.style.transform = `translate(${tx * 7}px, ${ty * 7 + jy}px)` + (sq ? ` scale(${sq[0]}, ${sq[1]})` : '');
    // «!» de la anticipación (solo el desarrollado): salta junto a la cabeza y se va antes de la carga.
    if (!born && t >= NOTICE && !flags.bang) { flags.bang = true; bang.style.visibility = 'visible'; if (!reduced) bang.animate([{ transform: 'translateY(4px)', opacity: 0 }, { transform: 'translateY(-2px)', opacity: 1, offset: 0.4 }, { transform: 'none', opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 480, easing: EASE, fill: 'forwards' }); }
    // Clímax: todo en el mismo instante (golpe de pantalla, estrella estampada sobre la cabeza y LEGENDARY).
    if (t >= CLIMAX && !flags.climax) { flags.climax = true; star.style.visibility = 'visible'; word.style.visibility = 'visible';
      if (!reduced) { document.getElementById('app').animate([{ transform: 'translateY(3px)' }, { transform: 'translateY(-1px)' }, { transform: 'none' }], { duration: 150, easing: 'steps(3)' });
        star.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(.86)', opacity: 1, offset: 0.55 }, { transform: 'scale(1.06)', offset: 0.8 }, { transform: 'none' }], { duration: 260, easing: 'steps(6)' });
        word.animate([{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(.94)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 260, easing: 'steps(5)' }); } }
    if (t >= RES && !flags.card) { flags.card = true; card.style.visibility = 'visible'; if (!reduced) card.animate([{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 240, easing: EASE }); }
    card.querySelector('em').style.visibility = t > RES + 0.6 ? 'visible' : 'hidden';
  }
  star.style.visibility = 'hidden'; word.style.visibility = 'hidden'; card.style.visibility = 'hidden'; bang.style.visibility = 'hidden';
  if (!reduced) box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
  L3.iv = setInterval(tick, 16); tick();
}
function closeL3() { const box = l3Box(); if (box.hidden) return; clearInterval(L3 && L3.iv); const mine = L3; const done = () => { if (L3 !== mine) return; box.getAnimations().forEach((a) => a.cancel()); box.hidden = true; box.replaceChildren(); if (mine && mine.after) { const f = mine.after; mine.after = null; f(); } }; if (reduced) return done(); box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }); setTimeout(done, 170); }
const RW = 116, RH = 58, FLOOR = 47;
function paintTrainRoom(x, t, o) {
  const P = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  P(0, 0, RW, FLOOR, '#2a2244'); for (let i = 3; i < RW; i += 7) P(i, 0, 2, 40, '#30284c');
  P(0, 40, RW, 7, '#201a36'); P(0, 40, RW, 1, '#3a3060');
  P(0, FLOOR, RW, RH - FLOOR, '#5c3a24'); P(0, FLOOR, RW, 1, '#8b5a2b'); for (let i = 9; i < RW; i += 17) P(i, FLOOR + 2, 1, 9, '#4a2e1c'); P(0, FLOOR + 6, RW, 1, '#4a2e1c');
  P(8, 5, 40, 26, '#7a5a4a'); P(10, 7, 36, 22, '#1f3a2c'); P(10, 7, 36, 1, '#2c4a38'); P(9, 31, 38, 2, '#9a7a6a'); P(30, 30, 3, 1, '#e8f4e8');
  const lines = Math.round((o.prog || 0) * 12);
  const ROWS = [[13, 10, 20], [13, 14, 26], [13, 18, 14], [30, 18, 12], [13, 22, 22], [13, 26, 16]];
  let n = lines;
  for (const [lx, ly, lw] of ROWS) { if (n <= 0) break; const w = Math.min(lw, Math.ceil(lw * Math.min(1, n / 2))); for (let i = 0; i < w; i += 2) P(lx + i, ly + ((i / 2) % 3 === 1 ? 1 : 0), 2, 1, '#cfe8d0'); n -= 2; }
  if (o.check) { P(36, 20, 2, 2, '#9df5a8'); P(38, 22, 2, 2, '#9df5a8'); P(40, 18, 2, 2, '#9df5a8'); P(42, 14, 2, 4, '#9df5a8'); P(40, 20, 2, 2, '#9df5a8'); }
  P(58, 33, 50, 3, '#c08a50'); P(58, 33, 50, 1, '#e0aa6a'); P(58, 36, 50, 2, '#6a4428'); P(60, 38, 3, 9, '#5a3a20'); P(103, 38, 3, 9, '#5a3a20');
  for (const [by, bw, c, c2] of [[29, 12, '#7a52c8', '#4a2f8a'], [26, 10, '#2f5aa8', '#1a2f60'], [23, 11, '#c0502e', '#7a2a1c']]) { P(92, by, bw, 3, c); P(92, by + 2, bw, 1, c2); P(92, by, 1, 3, '#fffbe0'); }
}
// La pared y el suelo siguen a los lados con el mismo dibujo y la misma fase (sin costuras).
function paintWalls(x, W, ox) {
  const P = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  P(0, 0, W, FLOOR, '#2a2244'); for (let i = ox + 3 - 7 * Math.ceil((ox + 3) / 7); i < W; i += 7) P(i, 0, 2, 40, '#30284c');
  P(0, 40, W, 7, '#201a36'); P(0, 40, W, 1, '#3a3060');
  P(0, FLOOR, W, RH - FLOOR, '#5c3a24'); P(0, FLOOR, W, 1, '#8b5a2b'); for (let i = ox + 9 - 17 * Math.ceil((ox + 9) / 17); i < W; i += 17) P(i, FLOOR + 2, 1, 9, '#4a2e1c'); P(0, FLOOR + 6, W, 1, '#4a2e1c');
}

const verdict = (r) => (r.pct === null ? 'other' : r.pct > 0.05 ? 'better' : r.pct < -0.05 ? 'worse' : 'same');
function deltaHTML(r) {
  if (r.pct === null) return `It works as ${r.job} elsewhere: the change shows when it does that job.`;
  const v = verdict(r);
  return `At ${r.post}, on its own, while you play: <b class="${v === 'better' ? 'tok' : v === 'worse' ? 'tbad' : ''}">${v === 'better' ? '+' + r.pct + '%' : v === 'worse' ? r.pct + '%' : 'same output'}</b>`;
}
function sparks(host, x, y, n, colors, spread = 26) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'cb-spk'; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = colors[i % colors.length]; host.appendChild(s);
    const a = (i / n) * Math.PI * 2 + 0.4, d = spread * (0.6 + 0.4 * ((i * 7) % 5) / 4);
    s.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.round(Math.cos(a) * d / 2) * 2}px, ${Math.round(Math.sin(a) * d / 2) * 2 - 6}px)`, opacity: 0 }], { duration: 520, easing: 'steps(6)', fill: 'forwards' }); setTimeout(() => s.remove(), 540);
  }
}
function sparksOut(host, x, y, dir) {
  if (reduced) return; const cols = ['#a8ccff', '#5a9cf0', '#ffffff'];
  for (let i = 0; i < 5; i++) { const s = document.createElement('i'); s.className = 'cb-spk'; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = cols[i % 3]; host.appendChild(s);
    const a = (i - 2) * 0.45, d = 14 + (i % 2) * 6; s.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dir * Math.round(Math.cos(a) * d / 2) * 2}px, ${Math.round(Math.sin(a) * d / 2) * 2}px)`, opacity: 0 }], { duration: 480, easing: 'steps(6)', fill: 'forwards' }); setTimeout(() => s.remove(), 540); }
}
const T_CHECK = 0.45, T_CLOSE = 0.72, T_FLIP = 0.95, T_SWAP = 1.17, T_REVEAL = 1.39, T_CALM = 2.8;
const FLIP_W = [1, 0.7, 0.36, 0.08, 0.36, 0.7, 1], FLIP_AT = [0, 0.2, 0.36, 0.47, 0.55, 0.72, 1];
// Un salto en arco, en píxeles enteros: agachado 1 px antes de despegar y al caer.
const hop = (e, a, d, h) => (e >= a - 0.06 && e < a ? { yy: 0, dy: 1 } : e >= a && e < a + d ? { yy: -Math.round(Math.sin(((e - a) / d) * Math.PI) * h), dy: 0 } : e >= a + d && e < a + d + 0.06 ? { yy: 0, dy: 1 } : null);
let CB = null; // estado de la ventana abierta (para el QA)
function cbBuild(win, c, r, hooks) {
  const v = verdict(r);
  win.append(el('div', 'vw-top', '<span class="vw-kind">TRAINING ROOM</span>'), el('div', 'vw-title', 'RETRAINED'));
  const stage = el('div', 'vw-stage cb-stage'); win.appendChild(stage);
  const fx = el('div', 'cb-fx'); stage.appendChild(fx);
  // La carta: quién y de qué oficio; la anterior, la flecha y la «?» de la Ficha, que gira y se revela.
  const card = el('div', 'cb-card');
  card.innerHTML = `<div class="cb-who"><b>${r.who}</b><span>· ${r.job}</span></div>
    <div class="cb-swap"><span class="cb-old">${r.from[0]} ${r.g}</span><i class="cb-arr"></i><span class="cb-q"><span>? ${r.g}</span></span></div>
    <div class="cb-info"><small>GRADE ${r.g} KEPT</small><p class="cb-was"><s>${r.from[0]} ${r.g}</s>: ${r.from[1]}</p><p class="cb-now">${r.to[1]}</p><p class="cb-delta ${v}">${deltaHTML(r)}</p></div>`;
  card.querySelector('.cb-arr').appendChild(copyC(glyph('chvy', ['m..', 'mm.', 'm..'], { m: '#9f97b8' }), 2));
  win.appendChild(card);
  const info = card.querySelector('.cb-info'), q = card.querySelector('.cb-q'), qs = q.querySelector('span');
  info.hidden = true;
  const bts = el('div', 'vw-bts'); const go = el('button', 'act vw-go', 'GOT IT'); go.dataset.m = 'ok'; bts.appendChild(go); win.appendChild(bts);
  // Lienzo de la sala, a ×3: el encuadre (start) deja dentro la pizarra con su visto bueno, el ratón y la mesa.
  const cv = document.createElement('canvas'); stage.insertBefore(cv, fx);
  const SC3 = 3, W = Math.floor((stage.clientWidth - 4) / SC3), V = Math.min(RW, W);
  const start = W >= RW ? 0 : Math.min(34, Math.max(110 - V, Math.round(59 - V / 2))), ox = W >= RW ? Math.floor((W - RW) / 2) : -start;
  cv.width = W; cv.height = RH; cv.style.width = W * SC3 + 'px'; cv.style.height = RH * SC3 + 'px'; cv.className = 'pix';
  stage.style.setProperty('--cbx', Math.floor((stage.clientWidth - 4 - W * SC3) / 2) + 'px');
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const room = document.createElement('canvas'); room.width = RW; room.height = RH; const rg = room.getContext('2d'); rg.imageSmoothingEnabled = false;
  const cache = {}; const fr = (dy, blink, o) => { const k = dy + (blink ? 'b' : '') + JSON.stringify(o); return (cache[k] ||= mouseCanvas(r.m, dy, blink, o)); };
  const DESK = [66, FLOOR - 19];
  const t0 = performance.now(); let skip = 0, revealed = false, bangDone = false, burstDone = false, reacted = false;
  CB = { r, v, phase: 'read', revealedAt: 0, skipTo: () => skipTo() };
  const tNow = () => (reduced ? 99 : (performance.now() - t0) / 1000 + skip);
  function skipTo() { const t = tNow(); if (t < T_REVEAL) skip += T_REVEAL - t; }
  go.onclick = () => { press(go); if (!revealed) skipTo(); };
  // La revelación (una vez): la «?» gira como en la Ficha y aparece la especialidad nueva, sólida y azul.
  // El cambio de la carta (una vez), en lo más estrecho de la vuelta.
  let swapped = false;
  function swap() { if (swapped) return; swapped = true; qs.textContent = `${r.to[0]} ${r.g}`.toUpperCase(); q.classList.add('on'); }
  function reveal(instant) {
    if (revealed) return; revealed = true; CB.phase = 'revealed'; CB.revealedAt = tNow();
    if (hooks.onReveal) hooks.onReveal();
    swap();
    const qr = q.getBoundingClientRect(), cr = card.getBoundingClientRect();
    // Chispas azules (las de la Ficha) desde los dos extremos de la carta hacia fuera: nunca encima del nombre.
    if (!instant) for (const side of [-1, 1]) sparksOut(card, qr.left - cr.left + (side > 0 ? qr.width + 2 : -2), qr.top - cr.top + qr.height / 2, side);
    // El detalle entra y la ventana crece hasta su alto (sin caja vacía antes de la revelación).
    const h0 = win.getBoundingClientRect().height; info.hidden = false; const h1 = win.getBoundingClientRect().height;
    // La ventana crece con la revelación (frenando al final) y el detalle aparece mientras crece, de arriba abajo.
    if (!instant && !reduced) { if (h1 - h0 > 1) win.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 340, easing: 'cubic-bezier(.25,.8,.35,1)' }); [...info.children].forEach((e, i) => e.animate([{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 40 + i * 60, easing: 'cubic-bezier(.25,.8,.35,1)', fill: 'backwards' })); }
  }
  const iv = setInterval(() => {
    if (!cv.isConnected) return clearInterval(iv);
    const t = tNow();
    // La carta empieza a girar en T_FLIP; se revela al acabar el giro (o en el acto si se adelanta).
    if (t >= T_FLIP && !q.dataset.spun && !reduced && t < T_SWAP) { q.dataset.spun = 1; q.animate(FLIP_W.map((w, i) => ({ transform: `scaleX(${w})`, offset: FLIP_AT[i], easing: 'steps(1, end)' })), { duration: (T_REVEAL - T_FLIP) * 1000 }); }
    if (t >= T_SWAP) swap();
    if (t >= T_REVEAL && !revealed) reveal(t > T_REVEAL + 0.1);
    // La escena.
    g.clearRect(0, 0, W, RH); paintWalls(g, W, ox);
    rg.clearRect(0, 0, RW, RH); paintTrainRoom(rg, t * 1000, { prog: Math.min(1, 0.82 + 0.18 * seg(t, 0, T_CHECK)), check: t >= T_CHECK });
    // El ratón junto a la mesa. Gestos de MICE: cara, orejas, cola, libro, lupa y pequeños saltos.
    let o = {}, dy = Math.floor((t * 1000 + 300) / 650) % 2, blink = (t * 1000) % 3100 < 110, yy = 0;
    // Lee (pasa una página) · visto bueno: levanta la vista con el libro · lo cierra (el gesto de pasar página) · mira la carta.
    if (t < T_CHECK) { o.book = (t % 2.4) < 0.3 ? 2 : 1; o.face = 'down'; }
    else if (t < T_CLOSE) { o.book = 1; o.face = t < T_CHECK + 0.06 ? 'down' : 'wow'; dy = 0; blink = false; }
    else if (t < T_REVEAL) { if (t < T_CLOSE + 0.1) o.book = 2; o.face = 'wow'; dy = 0; blink = false; }
    else if (t < T_CALM) {
      const e = t - T_REVEAL; blink = false; dy = 0;
      // Contento: dos saltos en arco (el segundo, menor), con cola arriba desde el principio.
      if (v === 'better') { o.face = 'happy'; o.tail = true; const h = hop(e, 0.08, 0.34, 4) || hop(e, 0.56, 0.26, 2); if (h) { yy = h.yy; dy = h.dy; } }
      // Igual: deja de sorprenderse y asiente dos veces, despacio; luego parpadea.
      else if (v === 'same') { o.face = e < 0.3 ? 'wow' : ''; yy = (e > 0.4 && e < 0.54) || (e > 0.68 && e < 0.82) ? 1 : 0; blink = e > 0.95 && e < 1.07; }
      // Decepción por pasos: sorpresa, un instante quieto, caen las orejas, la cara y, por último, el cuerpo.
      else if (v === 'worse') { o.face = e < 0.2 ? 'wow' : e < 0.42 ? '' : 'down'; if (e >= 0.32) o.ear = 1; yy = e >= 0.55 ? 1 : 0; }
      // Otro oficio: se sorprende, saca la lupa un instante después y la estudia.
      else { if (e >= 0.18) o.glass = true; o.face = e < 0.6 ? 'wow' : ''; }
      if (!o.face) delete o.face;
    } else {
      // En calma, el gesto de su resultado de vez en cuando (como las salas de HOUSE).
      const k = (t - T_CALM) % 4.2;
      if (v === 'better' && k < 0.5) { o.face = 'happy'; o.tail = true; const h = hop(k, 0.08, 0.26, 1); if (h) { yy = h.yy; dy = h.dy; } }
      else if (v === 'worse') { o.ear = 1; o.face = k < 1.6 ? 'down' : ''; if (!o.face) delete o.face; yy = 1; dy = Math.floor((t * 1000) / 1100) % 2; }
      else if (v === 'other' && k < 1.4) { o.glass = true; }
      else if (v === 'same' && k < 0.35) { yy = Math.floor(k / 0.17) % 2 ? 0 : 1; }
    }
    rg.drawImage(fr(Math.max(0, dy), blink && !o.face, o), DESK[0], DESK[1] + yy);
    g.drawImage(room, ox, 0);
    // «!» y chispas del visto bueno (los de HOUSE), sobre la cabeza.
    if (t >= T_CHECK && !bangDone) { bangDone = true; if (!reduced) { const b = el('span', 'cb-bang', '!'); b.style.left = (ox + DESK[0] + 15) * SC3 + 'px'; b.style.top = (DESK[1] - 8) * SC3 + 'px'; fx.appendChild(b); b.animate([{ transform: 'translateY(4px)', opacity: 0 }, { transform: 'translateY(-2px)', opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 700, easing: EASE, fill: 'forwards' }); setTimeout(() => b.remove(), 720); sparks(fx, (ox + 40) * SC3, 20 * SC3, 8, ['#a8ccff', '#5a9cf0', '#ffffff'], 30); } }
    // Contento: unas chispas azules al saltar (una vez). Las otras reacciones no llevan efectos.
    if (v === 'better' && t >= T_REVEAL + 0.05 && !burstDone) { burstDone = true; sparks(fx, (ox + DESK[0] + 11) * SC3, (DESK[1] + 4) * SC3, 10, ['#a8ccff', '#5a9cf0', '#ffffff'], 40); }
    if (t >= T_REVEAL && !reacted) { reacted = true; CB.phase = 'reaction'; }
  }, 16);
}


  // ---- RETRAINED en la ventana común del juego ----
  // showModal pinta una ventana vacía con su referencia; mount la monta cuando se ve (si estaba en la cola, a su turno).
  const REG = {}; let regN = 0;
  function markup(r) { const id = ++regN; REG[id] = r; return '<div class="vw-win cb-win" data-cb="' + id + '"></div>'; }
  function mount(root) {
    const w = root.querySelector('.cb-win[data-cb]'); if (!w || w.dataset.on) return; w.dataset.on = '1';
    const r = REG[w.dataset.cb]; delete REG[w.dataset.cb]; if (!r) return;
    cbBuild(w, null, r, {});
  }
  // Nunca se cierra sin verla: GOT IT antes de la revelación la adelanta.
  const canClose = () => !CB || CB.phase !== 'read';
  const l3 = (opt) => showL3(opt);
  CM.pcb = { markup, mount, canClose, l3 };
})();
