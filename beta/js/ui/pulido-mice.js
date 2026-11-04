// GENERADO por exploracion/pixel/main2-src/game/build_mice.py: no editar a mano. MICE aprobado (COLONY, SELECTOR DE PUESTO y
// RECLUTAR): iconos y animador del retrato copiados del mockup; el ratón es la plantilla oficial de MAIN 2.0 (CM.m2mouse) con el
// aspecto real de cada ratón (CM.m2crew). Aquí solo se montan: panels.js pinta el marcado y mount() le da vida tras cada repintado.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouseCanvas = (...a) => CM.m2mouse(...a);
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
IC.heartE = () => icon(['.rR.rr.', 'r..r..R', 'r.....R', '.r...R.', '..r.R..', '...R...'], { r: '#5b546d', R: '#4a4260' });
IC.arrowR = () => icon(['..l....', '..gl...', 'lggggl.', 'gggggGl', 'GGGGGG.', '..GG...', '..G....'], { l: '#c8ffc0', g: '#62d36e', G: '#2f8f44' });
IC.back = () => icon(['..w', '.wS', 'wS.', '.wS', '..w'], { w: '#d6d0e6', S: '#9f97b8' });
IC.move = () => icon(['..y..', '.yyy.', 'y.y.y', 'yyyyy', 'y.y.y', '.yyy.', '..y..'], { y: '#fff3a0' });
IC.house = () => icon(['..r..', '.rrr.', 'rrrrr', '.wdw.', '.wdw.'], { r: '#8a7fb0', w: '#d6d0e6', d: '#5c3a24' });
IC.spk = () => icon(['..g..', '.gWg.', 'gWWWg', '.gWg.', '..g..'], { g: '#62d36e', W: '#e8ffe8' }, '#0f2a14');
IC.ck = () => { const c = icon(['....k', '...k.', 'k.k..', '.k...'], { k: '#2a1d0a' }); const x = c.getContext('2d'); x.clearRect(0, 3, 1, 1); x.clearRect(6, 1, 1, 1); return c; };
IC.album = () => icon(['rrrrrrrrr.', 'rYYYYYYYrR', 'rYwwYwwYrR', 'rYwwYwwYrR', 'rYYYYYYYrR', 'rYwwYwwYrR', 'rYwwYwwYrR', 'rYYYYYYYrR', 'rrrrrrrrrR', '.RRRRRRRRR'], { r: '#c0502e', R: '#7a2a1c', Y: '#ffcf2e', w: '#fffbe0' });
IC.clip = () => icon(['.yyy.', 'kWWWk', 'kWsWk', 'kWWWk', 'kWsWk', 'kkkkk'], { y: '#ffcf2e', k: '#1b1622', W: '#f4f4f4', s: '#9aa3b8' });
function whiteOf(src) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fffbe8'; x.fillRect(0, 0, c.width, c.height); return c;
}
// Píxeles de efecto: cuadrados que saltan y caen (confeti, polvo, astillas). Duran lo que duran y se borran solos.
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
function floatText(layer, x, y, html, cls = 'mx-fc-bang', dur = 900, rise = 14) {
  const t = document.createElement('span'); t.className = cls; t.style.left = x + 'px'; t.style.top = y + 'px'; t.innerHTML = html; layer.appendChild(t);
  t.animate([{ transform: 'translateY(4px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.15 }, { transform: 'translateY(0)', opacity: 1, offset: 0.7 }, { transform: `translateY(-${rise}px)`, opacity: 0 }], { duration: dur, easing: 'steps(6)' });
  setTimeout(() => t.remove(), dur); return t;
}
function toast(html, cls = '') {
  const sh = document.querySelector('.sheet'); const t = document.createElement('div'); t.className = 'fc-toast ' + cls; t.innerHTML = html; sh.appendChild(t);
  t.animate([{ opacity: 0, transform: 'translate(-50%, -6px)' }, { opacity: 1, transform: 'translate(-50%, 0)', offset: 0.12 }, { opacity: 1, transform: 'translate(-50%, 0)', offset: 0.85 }, { opacity: 0, transform: 'translate(-50%, -6px)' }], { duration: 1900, easing: 'steps(6)' });
  setTimeout(() => t.remove(), 1900);
}

// ---------- El retrato: su propio animador ----------
// Capas: base (respira, parpadeo al azar con doble parpadeo a veces), micro (oreja, cola), acto (gesto de su
// carácter o de su estado, o una reacción) y estado (cama, entrenamiento, sin puesto, ascenso pendiente).
// Píxel a píxel: el lienzo va a ×5 y cada desplazamiento es un múltiplo de 5 px.
const S5 = 5;
function makeHero(m, canvas, niche, nfx, hfx) {
  const H = { m, c: canvas, niche, nfx, hfx, state: '', act: null, cache: {}, off: Math.random() * 2000 };
  H.kind = m.kind || 'look';
  H.tempo = 640; H.nextBlink = 0; H.blinkEnd = 0; H.nextMicro = 0; H.micro = null; H.nextAct = performance.now() + 2200;
  H.get = (dy, blink, o) => { const k = dy + (blink ? 'b' : '') + JSON.stringify(o); return (H.cache[k] ||= mouseCanvas(H.m, dy, blink, o)); };
  H.setMouse = (m2) => { H.m = m2; H.cache = {}; H.key = ''; };
  H.play = (name, extra = {}) => { const A = ACTS[name]; if (!A) return; H.act = { name, t0: performance.now(), dur: A.dur, ...extra }; if (A.start) A.start(H); };
  H.update = (t) => {
    // Siguiente gesto cuando no hay ninguno en marcha.
    if (H.act && t - H.act.t0 > H.act.dur) H.act = null;
    if (!H.act && t > H.nextAct && !H.hold) {
      const st = H.state;
      const pick = H.m.gm && !st && Math.random() < 0.3 ? 'pride' : st === 'due' ? (Math.random() < 0.55 ? 'cheer' : H.kind) : st === 'train' ? (Math.random() < 0.7 ? 'page' : 'aha') : st === 'free' ? (Math.random() < 0.6 ? 'tap' : 'look') : st === 'bed' ? 'dream' : Math.random() < 0.7 ? H.kind : 'look';
      H.play(pick);
      H.nextAct = t + (st === 'train' ? 2400 : 4200) + Math.random() * 4000;
    }
    const ph = t + H.off;
    let dy = Math.floor(ph / H.tempo) % 2, blink = false;
    if (t > H.nextBlink) { H.blinkEnd = t + 110; H.double = Math.random() < 0.25; H.nextBlink = t + 1800 + Math.random() * 3200; }
    if (t < H.blinkEnd || (H.double && t > H.blinkEnd + 120 && t < H.blinkEnd + 220)) blink = true;
    if (t > H.nextMicro) { H.micro = { k: Math.random() < 0.5 ? 'ear' : 'tail', until: t + (Math.random() < 0.5 ? 170 : 420) }; H.nextMicro = t + 2000 + Math.random() * 5000; }
    const o = {}; let tx = 0, ty = 0, flip = false, white = false, face = '';
    if (H.micro && t < H.micro.until) { if (H.micro.k === 'ear') o.ear = 1; else if (Math.floor((H.micro.until - t) / 140) % 2) o.tail = 1; }
    // Estado de fondo.
    if (H.state === 'bed') { dy = Math.floor(ph / 1500) % 2; face = 'sleep'; delete o.tail; }
    if (H.state === 'train') { o.book = 1; face = 'down'; }
    // Acto en marcha.
    const F = { dy, blink, o, tx, ty, flip, white, face };
    if (H.act) ACTS[H.act.name].frame(t - H.act.t0, F, H);
    if (F.face) F.o.face = F.face;
    if (!F.o.ear) delete F.o.ear;
    const key = F.dy + '|' + F.blink + '|' + JSON.stringify(F.o) + '|' + F.white + '|' + (H.m.rank) + H.m.name;
    if (key !== H.key) {
      H.key = key; let fr = H.get(F.dy, F.blink, F.o); if (F.white) fr = whiteOf(fr);
      const x = H.c.getContext('2d'); x.clearRect(0, 0, 22, 20); x.drawImage(fr, 0, 0);
    }
    const tr = `translate(${F.tx * S5}px, ${F.ty * S5}px)` + (F.flip ? ' scaleX(-1)' : '') + (F.sq ? ` scale(${F.sq[0]}, ${F.sq[1]})` : '');
    if (tr !== H.tr) { H.tr = tr; H.c.style.transform = tr; H.c.style.transformOrigin = '50% 100%'; }
  };
  return H;
}
const at = (e, a, b) => e >= a && e < b;
const HEAD = { x: 63, y: 6 }; // encima de la cabeza, en el nicho
const ACTS = {
  // Carácter.
  fidget: { dur: 1000, frame(e, F) { F.face = 'grump'; if (e < 420) F.tx = Math.floor(e / 70) % 2 ? 1 : -1; else F.o.legs = Math.floor(e / 120) % 2 ? 'tap' : 'stand'; } },
  hop: { dur: 640, frame(e, F) { F.face = 'happy'; F.ty = [0, -2, -3, -2, 0, -1, 0, 0][Math.min(7, Math.floor(e / 80))]; } },
  doze: { dur: 1700, frame(e, F) { if (e < 520) { F.face = 'wow'; F.dy = 0; } else { F.face = 'sleep'; F.dy = Math.floor(e / 260) % 2; } } },
  nibble: { dur: 1300, start(H) { if (reduced) return; for (let i = 0; i < 4; i++) setTimeout(() => burst(H.nfx, 84, 66, 2, ['#ffcf2e', '#e0960e'], { spread: 10, up: 4, size: 3, dur: 420, fall: 22 }), 200 + i * 260); },
    frame(e, F) { F.face = 'happy'; F.dy = Math.floor(e / 130) % 2; } },
  look: { dur: 1100, frame(e, F) { F.flip = at(e, 200, 760); if (at(e, 320, 560)) F.face = 'wow'; } },
  // Estado.
  cheer: { dur: 900, start(H) { burst(H.nfx, HEAD.x, HEAD.y + 8, 6, ['#fff3a0', '#ffcf2e'], { spread: 18, up: 10, size: 3, dur: 520, fall: 4 }); },
    frame(e, F) { F.face = 'happy'; F.ty = [0, -2, -3, -2, 0, -2, -3, -2, 0][Math.min(8, Math.floor(e / 100))]; F.o.spark = Math.floor(e / 150) % 2 ? 1 : undefined; if (!F.o.spark) delete F.o.spark; } },
  page: { dur: 320, frame(e, F) { F.o.book = 2; } },
  aha: { dur: 900, start(H) { floatText(H.nfx, HEAD.x + 8, HEAD.y - 2, '!', 'mx-fc-bang', 900, 6); }, frame(e, F) { F.face = 'wow'; F.ty = e < 300 ? -1 : 0; } },
  tap: { dur: 1200, frame(e, F) { F.o.legs = Math.floor(e / 140) % 2 ? 'tap' : 'stand'; F.face = e > 600 ? 'grump' : ''; } },
  dream: { dur: 1400, frame(e, F) { F.face = 'happy'; F.blink = false; F.o.ear = Math.floor(e / 350) % 2 ? 1 : undefined; if (!F.o.ear) delete F.o.ear; } },
  // Reacciones.
  pet: { dur: 760, start(H) { const h = document.createElement('span'); h.style.cssText = `position:absolute;left:${HEAD.x + 10}px;top:${HEAD.y + 4}px`; h.appendChild(toImg(IC.heart(), 2)); H.nfx.appendChild(h);
      h.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-14px)', opacity: 0 }], { duration: 760, easing: 'steps(6)' }); setTimeout(() => h.remove(), 760); },
    frame(e, F) { F.face = 'happy'; F.ty = [0, -2, -3, -1, 0, 0][Math.min(5, Math.floor(e / 90))]; } },
  enter: { dur: 640, start(H) { setTimeout(() => burst(H.nfx, 66, 108, 8, ['#8b5a2b', '#5c3a24', '#c8a070'], { spread: 30, up: 2, size: 3, dur: 380, fall: 2 }), 260); },
    frame(e, F) { F.ty = [-14, -10, -6, -2, 0, 0, 0][Math.min(6, Math.floor(e / 45))]; if (at(e, 270, 360)) F.sq = [1.08, 0.9]; if (e > 380) F.face = 'happy'; } },
  stretch: { dur: 900, frame(e, F) { if (e < 420) { F.face = 'wow'; F.ty = -1; F.dy = 0; } else F.face = 'happy'; } },
  walkOut: { dur: 420, frame(e, F) { F.o.legs = Math.floor(e / 90) % 2 ? 'a' : 'b'; F.tx = Math.floor(e / 42); } },
  walkIn: { dur: 420, frame(e, F) { F.o.legs = Math.floor(e / 90) % 2 ? 'a' : 'b'; F.tx = -10 + Math.floor(e / 42); if (e > 400) F.tx = 0; } },
  love: { dur: 1000, start(H) { for (let i = 0; i < 3; i++) setTimeout(() => { const h = document.createElement('span'); h.style.cssText = `position:absolute;left:${HEAD.x - 6 + i * 12}px;top:${HEAD.y + 6}px`; h.appendChild(toImg(IC.heart(), 2)); H.nfx.appendChild(h);
      h.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-16px)', opacity: 0 }], { duration: 700, easing: 'steps(6)' }); setTimeout(() => h.remove(), 700); }, i * 150); },
    frame(e, F) { F.face = 'happy'; F.ty = [0, -2, 0, -2, 0][Math.min(4, Math.floor(e / 120))]; } },
  // Ascenso: sube con el haz, parpadea en blanco, gira dos veces (a mitad cambia la ropa) y aterriza.
  promote: { dur: 1700, frame(e, F, H) {
      if (e < 380) { F.ty = -Math.min(2, Math.floor(e / 120)); F.white = Math.floor(e / 70) % 2 === 1; }
      else if (e < 780) { F.ty = -3; F.white = true; F.flip = Math.floor((e - 380) / 100) % 2 === 1; if (e > 580 && !H.act.swapped) { H.act.swapped = true; H.setMouse(H.act.to); } }
      else if (e < 900) { F.ty = [-2, -1, 0][Math.floor((e - 780) / 40)] || 0; F.sq = e > 860 ? [1.08, 0.9] : null; }
      else { F.face = 'happy'; F.ty = [0, -2, -3, -2, 0, -1, 0, 0][Math.min(7, Math.floor((e - 900) / 90))]; } } },
};
const RW = 116, RH = 58, FLOOR = 47; // el suelo: los pies del ratón en y 47
function paintBedRoom(x, t, o) {
  const P = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  // Pared con papel de rayas y zócalo; suelo de tablas con su borde de luz.
  P(0, 0, RW, FLOOR, '#3a2236'); for (let i = 3; i < RW; i += 7) P(i, 0, 2, 40, '#41283d');
  P(0, 40, RW, 7, '#2c1a28'); P(0, 40, RW, 1, '#4a3044');
  P(0, FLOOR, RW, RH - FLOOR, '#5c3a24'); P(0, FLOOR, RW, 1, '#8b5a2b'); for (let i = 9; i < RW; i += 17) P(i, FLOOR + 2, 1, 9, '#4a2e1c');
  P(0, FLOOR + 6, RW, 1, '#4a2e1c');
  // Ventana de noche: marco, cristal, cruz, luna y estrellas que parpadean.
  P(10, 6, 28, 24, '#7a5a4a'); P(12, 8, 24, 20, '#1c2448'); P(12, 18, 24, 10, '#253060'); P(23, 8, 2, 20, '#7a5a4a'); P(12, 17, 24, 2, '#7a5a4a');
  P(9, 29, 30, 2, '#9a7a6a'); P(15, 10, 4, 4, '#fffbe0'); P(16, 10, 3, 1, '#ffffff'); P(18, 13, 1, 1, '#e8e0c0');
  for (const [sx, sy, ph] of [[28, 11, 0], [32, 14, 1], [27, 22, 2], [14, 24, 1], [33, 25, 0]]) if (Math.floor(t / 600 + ph) % 3) P(sx, sy, 1, 1, '#fff3a0');
  // Luz de la luna en el suelo.
  x.globalAlpha = 0.12; P(14, FLOOR + 1, 26, 4, '#fffbe0'); x.globalAlpha = 1;
  // Cama: cabecero, colchón, patas, almohada; la manta se pinta después del ratón.
  P(50, 24, 5, 23, '#9a6a5a'); P(50, 24, 5, 1, '#c09080'); P(51, 25, 1, 21, '#b0806e'); P(54, 24, 1, 23, '#6a4438');
  P(100, 31, 4, 16, '#9a6a5a'); P(100, 31, 4, 1, '#c09080'); P(103, 31, 1, 16, '#6a4438');
  P(55, 38, 45, 5, '#f4eef4'); P(55, 42, 45, 1, '#cfc4d6'); P(56, 43, 2, 4, '#4a2e24'); P(97, 43, 2, 4, '#4a2e24');
  P(55, 30, 10, 8, '#ffffff'); P(55, 36, 10, 2, '#e0d6e6'); P(56, 31, 3, 1, '#f8f4fa');
}
function paintBlanket(x, top) {
  const P = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  P(60, top, 40, 44 - top, '#ff8fb4'); P(60, top, 40, 2, '#ffd0e0'); P(60, 43, 40, 1, '#c9557f');
  for (let i = 64; i < 100; i += 6) for (let j = top + 4; j < 43; j += 4) P(i + ((j / 4) % 2) * 3, j, 1, 1, '#e8709a');
  P(99, top, 1, 44 - top, '#c9557f');
}
function paintTrainRoom(x, t, o) {
  const P = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  P(0, 0, RW, FLOOR, '#2a2244'); for (let i = 3; i < RW; i += 7) P(i, 0, 2, 40, '#30284c');
  P(0, 40, RW, 7, '#201a36'); P(0, 40, RW, 1, '#3a3060');
  P(0, FLOOR, RW, RH - FLOOR, '#5c3a24'); P(0, FLOOR, RW, 1, '#8b5a2b'); for (let i = 9; i < RW; i += 17) P(i, FLOOR + 2, 1, 9, '#4a2e1c'); P(0, FLOOR + 6, RW, 1, '#4a2e1c');
  // Pizarra: el progreso del reentreno se escribe con tiza, renglón a renglón.
  P(8, 5, 40, 26, '#7a5a4a'); P(10, 7, 36, 22, '#1f3a2c'); P(10, 7, 36, 1, '#2c4a38'); P(9, 31, 38, 2, '#9a7a6a'); P(30, 30, 3, 1, '#e8f4e8');
  const lines = Math.round((o.prog || 0) * 12);
  const ROWS = [[13, 10, 20], [13, 14, 26], [13, 18, 14], [30, 18, 12], [13, 22, 22], [13, 26, 16]];
  let n = lines;
  for (const [lx, ly, lw] of ROWS) { if (n <= 0) break; const w = Math.min(lw, Math.ceil(lw * Math.min(1, n / 2))); for (let i = 0; i < w; i += 2) P(lx + i, ly + ((i / 2) % 3 === 1 ? 1 : 0), 2, 1, '#cfe8d0'); n -= 2; }
  if (o.check) { P(36, 20, 2, 2, '#9df5a8'); P(38, 22, 2, 2, '#9df5a8'); P(40, 18, 2, 2, '#9df5a8'); P(42, 14, 2, 4, '#9df5a8'); P(40, 20, 2, 2, '#9df5a8'); }
  // Mesa con su pila de libros.
  P(58, 33, 50, 3, '#c08a50'); P(58, 33, 50, 1, '#e0aa6a'); P(58, 36, 50, 2, '#6a4428'); P(60, 38, 3, 9, '#5a3a20'); P(103, 38, 3, 9, '#5a3a20');
  for (const [by, bw, c, c2] of [[29, 12, '#7a52c8', '#4a2f8a'], [26, 10, '#2f5aa8', '#1a2f60'], [23, 11, '#c0502e', '#7a2a1c']]) { P(92, by, bw, 3, c); P(92, by + 2, bw, 1, c2); P(92, by, 1, 3, '#fffbe0'); }
}
// Una sala viva: modo (free, busy, done, waits), el ratón y sus fases (entrar, salir), dibujada en cada fotograma.
function makeRoom(kind, wrap) {
  const R = { kind, mode: 'free', m: null, ph: null, t0: 0, prog: 0.2, cache: {}, nextAct: 0, act: null };
  let c, fx; R.bind = (w) => { wrap = w; c = w.querySelector('canvas'); fx = w.querySelector('.mx-fx'); R.el = w; R.fx = fx; R.x = c.getContext('2d'); R.x.imageSmoothingEnabled = false; }; R.bind(wrap);
  R.frame = (dy, blink, o) => { const k = R.m.name + R.m.rank + dy + (blink ? 'b' : '') + JSON.stringify(o); return (R.cache[k] ||= mouseCanvas(R.m, dy, blink, o)); };
  R.set = (mode, m) => { R.mode = mode; if (m) R.m = m; R.ph = null; R.act = null; };
  const zz = (on) => { R.el.querySelectorAll('.mx-zz').forEach((z) => (z.style.visibility = on ? '' : 'hidden')); };
  R.play = (ph) => { R.ph = ph; R.t0 = performance.now(); if (ph === 'in' || ph === 'out') zz(false); };
  // Posiciones (esquina superior izquierda del ratón de 22 × 20): de pie en el suelo y metido en la cama.
  const STAND = (x0) => [x0, FLOOR - 19];
  const INBED = [52, 21];
  R.draw = (t) => {
    const x = R.x, e = t - R.t0, m = R.m;
    x.clearRect(0, 0, RW, RH);
    const paint = kind === 'bed' ? paintBedRoom : paintTrainRoom;
    paint(x, t, { prog: R.prog, check: R.check });
    let pos = null, dy = Math.floor((t + 300) / 650) % 2, blink = (t % 3100) < 110, o = {}, flip = false, blanket = 44, ghost = false;
    if (kind === 'bed') {
      if (R.mode === 'busy' && !R.ph) { pos = INBED; dy = Math.floor(t / 1500) % 2; o.face = 'sleep'; blanket = 33 + dy; if (Math.floor(t / 4000) % 5 === 4) o.face = 'happy'; }
      if (R.ph === 'in') {
        // Sin salir de su puesto: aparece ya en la cama a destellos (0–450), se tapa y se duerme (450–800).
        pos = INBED; dy = 0; o.face = e < 450 ? 'happy' : 'sleep'; ghost = e < 450 && Math.floor(e / 70) % 2 === 0;
        blanket = e < 450 ? 44 : Math.round(44 - 11 * Math.min(1, (e - 450) / 350));
        if (!R.sp) { R.sp = 1; burst(fx, 200, 80, 14, ['#ffd0e0', '#ff8fb4', '#ffffff'], { spread: 50, up: 16, size: 4, dur: 600, fall: 0 }); }
        if (e > 800) { R.ph = null; R.sp = 0; R.mode = 'busy'; zz(true); }
      }
      if (R.ph === 'out') {
        // 0–350 despierta · 350–550 aparta la manta · 550–900 salta al suelo · luego, contento.
        if (e < 550) { pos = INBED; o.face = e < 120 ? 'sleep' : 'wow'; blanket = e < 350 ? 33 : Math.round(33 + ((e - 350) / 200) * 9); dy = 0; if (e < 350) o.ear = Math.floor(e / 120) % 2 ? 1 : undefined; if (!o.ear) delete o.ear; }
        else if (e < 900) { const k = (e - 550) / 350; pos = [Math.round(INBED[0] + (24 - INBED[0]) * k), Math.round(INBED[1] + (STAND(0)[1] - INBED[1]) * k - Math.sin(k * Math.PI) * 12)]; flip = true; blanket = 42; o.face = 'happy'; }
        else { R.ph = null; R.mode = 'done'; burst(fx, 102, 60, 14, ['#ffd0e0', '#fff3a0', '#ffffff'], { spread: 50, up: 20, size: 4, dur: 700, fall: 20 }); }
      }
      if (R.mode === 'done' && !R.ph) { pos = STAND(24); o.face = Math.floor(t / 2600) % 3 === 0 ? 'happy' : ''; if (!o.face) delete o.face; blanket = 42; if (Math.floor(t / 2600) % 3 === 0) dy = Math.floor(t / 130) % 2 ? 0 : -1; }
      if (R.mode === 'free' || R.mode === 'waits') blanket = 36;
    } else {
      const DESK = STAND(66);
      if (R.mode === 'busy' && !R.ph) { pos = DESK; o.book = Math.floor(t / 2400) % 1 === 0 && (t % 2400) < 300 ? 2 : 1; o.face = 'down'; if ((t % 8000) < 700) { o.face = 'wow'; } }
      if (R.ph === 'in') {
        // Aparece ya junto a la mesa a destellos; a los 450 ms, un soplo y el libro en las patas.
        pos = DESK; dy = 0; ghost = e < 450 && Math.floor(e / 70) % 2 === 0; o.face = 'happy';
        if (!R.sp) { R.sp = 1; burst(fx, 228, 96, 12, ['#efe6ff', '#b58cff', '#ffffff'], { spread: 44, up: 16, size: 4, dur: 600, fall: 0 }); }
        if (e >= 450) { o.book = 1; o.face = 'wow'; if (!R.poof) { R.poof = 1; burst(fx, 252, 84, 10, ['#ffffff', '#efe6ff', '#b58cff'], { spread: 30, up: 8, size: 3, dur: 420, fall: 0 }); } }
        if (e > 900) { R.ph = null; R.poof = 0; R.sp = 0; R.mode = 'busy'; }
      }
      if (R.ph === 'out') {
        pos = DESK;
        if (e < 700) { o.face = 'wow'; o.book = 1; if (!R.bang) { R.bang = 1; R.check = 1; floatText(fx, 246, 6, '!', 'mx-fc-bang', 900, 6); burst(fx, 230, 20, 12, ['#a8ccff', '#5a9cf0', '#ffffff'], { spread: 40, up: 12, size: 4, dur: 600, fall: 6 }); } }
        else { o.face = 'happy'; dy = Math.floor(e / 120) % 2 ? 0 : -1; if (e > 1300) { R.ph = null; R.bang = 0; R.mode = 'done'; } }
      }
      if (R.mode === 'done' && !R.ph) { pos = DESK; if (Math.floor(t / 2600) % 3 === 0) { o.face = 'happy'; dy = Math.floor(t / 130) % 2 ? 0 : -1; } }
    }
    if (pos && m) {
      let fr = R.frame(Math.max(0, dy), blink && !o.face, o); if (ghost) fr = whiteOf(fr);
      const py = pos[1] + (dy < 0 ? -1 : 0);
      if (flip) { x.save(); x.scale(-1, 1); x.drawImage(fr, -pos[0] - 22, py); x.restore(); } else x.drawImage(fr, pos[0], py);
    }
    if (kind === 'bed') paintBlanket(x, blanket);
  };
  return R;
}

  // ---- Montaje en el juego ----
  // Iconos como <img> (los paneles se repintan con innerHTML): url y tamaño en caché.
  const ICU = {};
  function ic(k, scale = 2, cls = '') {
    const u = ICU[k] || (ICU[k] = (() => { const c = IC[k](); return [c.toDataURL(), c.width, c.height]; })());
    return '<img class="pix' + (cls ? ' ' + cls : '') + '" alt="" src="' + u[0] + '" style="width:' + Math.round(u[1] * scale) + 'px;height:' + Math.round(u[2] * scale) + 'px;flex:none">';
  }
  const hashS = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  // El ratón que pide un lienzo: «m:id:oficio», «c:índice» (candidato) o «ghost».
  function crewOf(key) {
    const s = CM.ui && CM.ui.state(); if (!s) return null;
    const [k, a, b] = key.split(':');
    if (k === 'ghost') return { name: 'ghost', rank: 0, rar: 0, skill: '' };
    if (k === 'p') { const c = CM.m2part(a, +b); if (key.endsWith(':miss')) c.name = 'ghost:' + c.name; return c; }
    let m = null;
    if (k === 'm') m = CM.mice.byId(s, a);
    if (k === 'c' && s.candidates[+a]) m = CM.mice.normalize(Object.assign({ xp: 0, rank: 0 }, s.candidates[+a]));
    if (!m) return null;
    const rk = key.split(':')[3];
    if (rk !== undefined && rk !== '') m = Object.assign({}, m, { rank: +rk });
    const c = CM.m2crew(m, b || (m.post ? m.post.split(':')[0] : ''));
    if (m.id && m.id === (s.master && s.nodes['cheesemaking.master'] ? s.master : '')) c.gm = 1;
    return c;
  }
  const ghostOf = (src) => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#9690b4'; x.fillRect(0, 0, c.width, c.height); return c; };
  // Ratones pequeños (nichos, caras, filas): respiran y parpadean con el reloj de todos, así un repintado no los reinicia.
  const FR = {};
  const framesOf = (c) => FR[c.name] || (FR[c.name] = c.name.startsWith('ghost') ? [ghostOf(mouseCanvas(c, 0))] : [mouseCanvas(c, 0), mouseCanvas(c, 1), mouseCanvas(c, 0, true)]);
  let small = [];
  const HEROES = {};
  let live = [];
  // Iconos del mockup en sus lienzos (data-ic, data-k la escala): dibujados una vez por lienzo nuevo.
  const ICC = {};
  function mount(root) {
    for (const cv of root.querySelectorAll('canvas[data-ic]')) {
      const k = cv.dataset.ic; if (!IC[k]) continue;
      const src = ICC[k] || (ICC[k] = IC[k]()), sc = +cv.dataset.k || 2;
      cv.width = src.width; cv.height = src.height; cv.style.width = Math.round(src.width * sc) + 'px'; cv.style.height = Math.round(src.height * sc) + 'px'; cv.style.flex = 'none';
      cv.getContext('2d').drawImage(src, 0, 0);
    }
    small = [];
    for (const cv of root.querySelectorAll('canvas[data-crew]')) {
      const c = crewOf(cv.dataset.crew); if (!c) continue;
      let fr; try { fr = framesOf(c); } catch (e) { continue; } // un ratón que no se pueda dibujar no deja sin pintar a los demás
      const a = { cv, fr, off: hashS(cv.dataset.crew) % 3000, f: -1 };
      // Se pinta ya, con el fotograma que toca: el lienzo nuevo de un repintado no se queda un instante en blanco.
      const t = performance.now(), m = (t + a.off) % 3000; a.f = fr.length < 3 ? 0 : m < 100 ? 2 : Math.floor((t + a.off) / 700) % 2;
      cv.getContext('2d').drawImage(fr[a.f], 0, 0);
      small.push(a);
    }
    live = [];
    for (const nn of root.querySelectorAll('[data-hero]')) {
      const cv = nn.querySelector('canvas.mx-m'), nfx = nn.querySelector('.mx-fc-nfx') || nn;
      const c = crewOf(nn.dataset.heroCrew || 'ghost'); if (!cv || !c) continue;
      let H = HEROES[nn.dataset.hero];
      if (!H) { H = HEROES[nn.dataset.hero] = makeHero(c, cv, nn, nfx, nfx); if (nn.dataset.enter !== undefined) H.play('enter'); }
      else {
        H.c = cv; H.niche = nn; H.nfx = nfx; H.key = ''; H.tr = '';
        const inPromo = H.act && H.act.to && H.act.to.name === c.name;
        if (H.m.name !== c.name && !inPromo) {
          // La ficha: si es el mismo ratón con un rango más, su ceremonia (mockup FICHA V2); si no, entra el nuevo.
          if (nn.dataset.cer !== undefined && H.m.id === c.id && c.rank > H.m.rank) ceremony(H, c);
          else { H.setMouse(c); if (nn.dataset.enter !== undefined) H.play('enter'); }
        }
      }
      H.hfx = (nn.closest('.mx-fc-hero') || nn).querySelector('.mx-fc-hfx') || nfx;
      // Cambios de estado: a la cama se duerme, al salir se estira; al entrenar, «¡ajá!» con su libro.
      const st = nn.dataset.st || '', was = H.state;
      if (H.seen && was !== st && !H.hold) {
        if (st === 'bed') H.play('doze');
        else if (was === 'bed') { H.play('stretch'); burst(H.nfx, HEAD.x, HEAD.y + 10, 8, ['#ffd0d8', '#ffffff'], { spread: 24, up: 8, size: 3, dur: 520, fall: 6 }); }
        else if (st === 'train' || was === 'train') { H.play('aha'); if (st === 'train') burst(H.nfx, 90, 58, 10, ['#ffffff', '#efe6ff', '#b58cff'], { spread: 18, up: 6, size: 3, dur: 420, fall: 0 }); }
      }
      // Sube de nivel: salta y «LV UP».
      const lv = +nn.dataset.lv || 0;
      if (H.seen && lv > (H.lv || 0) && H.lv && !H.hold) { H.play('hop'); floatText(H.hfx, 186, 72, 'LV UP', 'mx-fc-up', 900, 12); burst(H.hfx, 250, 108, 10, ['#a8ccff', '#5a9cf0', '#ffffff'], { spread: 50, up: 8, size: 3, dur: 520, fall: 6 }); }
      H.lv = lv; H.state = st; H.seen = true;
      try { H.update(performance.now()); } catch (e) {}
      live.push(H);
    }
    for (const r of root.querySelectorAll('.mx-pb-row[data-rite]')) rite(r);
    // Salas de HOUSE (mockup): la misma sala viva entre repintados; entrar en la cama o en la mesa, y salir, se ven.
    for (const w of root.querySelectorAll('.mx-hs-room[data-room]')) {
      const kind = w.dataset.room, mode = w.dataset.mode, c = crewOf(w.dataset.crew || 'ghost');
      let R = ROOMS[kind];
      if (!R) { R = ROOMS[kind] = makeRoom(kind, w); R.set(mode, c); R.seen = false; }
      else R.bind(w);
      R.prog = +w.dataset.prog || 0; R.check = mode === 'done' && kind === 'train' ? 1 : 0;
      if (c && (!R.m || R.m.name !== c.name)) R.m = c;
      if (R.seen && R.mode !== mode && R.ph !== 'out') { const was = R.mode; R.set(mode, c); if (mode === 'busy' && was !== 'busy') R.play('in'); else if (was === 'busy' && (mode === 'done' || mode === 'free')) { R.set('busy', c); R.play('out'); } }
      R.seen = true;
      if (!R.ph) R.set(mode, c);
      R.draw(performance.now());
    }
    for (const r of root.querySelectorAll('.mx-mrow')) fitTags(r);
    if (root.querySelector('.mx-rc-cards[data-reveal]')) reveal(root);
  }
  // Ascenso en la ficha (mockup FICHA V2): haz de luz, silueta blanca, giro con la ropa nueva, aterrizaje con confeti,
  // insignia y cinta con el rango. El juego ya ha cobrado y ascendido: esto es lo que se ve.
  const RANKN = ['Apprentice', 'Journeyman', 'Master', 'Manager'];
  function ceremony(H, to) {
    const nn = H.niche;
    if (reduced) { H.setMouse(to); return; }
    const beam = document.createElement('i'); beam.className = 'mx-fc-beam'; nn.insertBefore(beam, nn.querySelector('canvas'));
    beam.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1150, easing: 'steps(6)' }); setTimeout(() => beam.remove(), 1150);
    H.hold = true; H.play('promote', { to });
    for (let i = 0; i < 6; i++) setTimeout(() => burst(H.nfx, 40 + Math.random() * 56, 100, 1, ['#fff3a0'], { spread: 2, up: 0, size: 3, dur: 500, fall: -60 }), 120 + i * 110);
    setTimeout(() => {
      const n2 = H.niche, hfx = H.hfx;
      n2.classList.add('mx-flash'); setTimeout(() => n2.classList.remove('mx-flash'), 90);
      const ring = document.createElement('i'); ring.className = 'mx-fc-ring'; ring.style.cssText = 'left:58px;top:92px'; H.nfx.appendChild(ring);
      ring.animate([{ transform: 'scale(1,.3)', opacity: 1 }, { transform: 'scale(5,1.2)', opacity: 0 }], { duration: 420, easing: 'steps(5)' }); setTimeout(() => ring.remove(), 420);
      burst(hfx, 76, 40, 26, ['#ffcf2e', '#fff3a0', '#62d36e', '#ffffff', '#e0a020'], { spread: 70, up: 30, size: 4, dur: 900, fall: 30 });
      const rk = Math.min(3, to.rank);
      if (rk) { const ins = document.createElement('span'); ins.style.cssText = 'position:absolute;left:58px;top:4px'; ins.appendChild(toImg(IC['rank' + rk](), 3)); H.nfx.appendChild(ins);
        ins.animate([{ transform: 'translateY(10px) scale(.4)', opacity: 0 }, { transform: 'translateY(-2px) scale(1.2)', opacity: 1, offset: 0.25 }, { transform: 'translateY(0) scale(1)', opacity: 1, offset: 0.4 }, { transform: 'translateY(0)', opacity: 1, offset: 0.8 }, { transform: 'translateY(-8px)', opacity: 0 }], { duration: 1500, easing: 'steps(10)' });
        setTimeout(() => ins.remove(), 1500); }
      const rib = document.createElement('span'); rib.className = 'mx-fc-ribbon'; rib.style.cssText = 'left:150px;top:46px'; if (rk) rib.append(toImg(IC['rank' + rk](), 1.5)); rib.append(RANKN[rk].toUpperCase()); hfx.appendChild(rib);
      rib.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1.1)', offset: 0.12 }, { transform: 'scaleX(1)', opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], { duration: 1700, easing: 'steps(8)' });
      setTimeout(() => rib.remove(), 1700);
      setTimeout(() => (H.hold = false), 900);
    }, 800);
  }
  // Ascenso en bloque (mockup ASCENSOS): cada fila elegida hace, una tras otra, el rito corto en su propio nicho.
  const RITES = {};
  function rite(r) {
    const key = r.dataset.rite; if (RITES[key]) return; RITES[key] = performance.now();
    const cv = r.querySelector('.mx-pt.mx-now canvas[data-crew]'); if (!cv) return;
    const a = small.find((x) => x.cv === cv); const [id, from, to] = key.split(':'); const s = CM.ui.state(); const m = CM.mice.byId(s, id); if (!m) return;
    const sk = m.post ? m.post.split(':')[0] : '';
    const old = mouseCanvas(CM.m2crew(Object.assign({}, m, { rank: +from }), sk)), nx = mouseCanvas(CM.m2crew(m, sk), 0, false, { face: 'happy' });
    const x = cv.getContext('2d'), put = (c) => { x.clearRect(0, 0, 22, 20); x.drawImage(c, 0, 0); };
    const D = (+r.dataset.i || 0) * 220;
    if (a) a.hold = true;
    if (reduced) { put(nx); if (a) a.hold = false; return; }
    put(old);
    for (const [c, t] of [[whiteOf(old), 200], [old, 260], [whiteOf(old), 320], [whiteOf(nx), 400], [nx, 500]]) setTimeout(() => cv.isConnected && put(c), D + t);
    cv.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }, { transform: 'scaleX(1)' }, { transform: 'translateY(-4px)' }, { transform: 'none' }], { duration: 320, delay: D + 320, easing: 'steps(6)' });
    setTimeout(() => {
      if (!r.isConnected) return;
      const lay = document.createElement('div'); lay.className = 'mx-fc-hfx'; r.appendChild(lay);
      burst(lay, 53, 24, 12, ['#ffcf2e', '#fff3a0', '#62d36e', '#ffffff'], { spread: 40, up: 16, size: 3, dur: 600, fall: 14 });
      if (+to) { const ins = toImg(IC['rank' + Math.min(3, +to)](), 2); ins.style.cssText += ';position:absolute;left:47px;top:2px'; lay.appendChild(ins);
        ins.animate([{ transform: 'translateY(6px) scale(.5)', opacity: 0 }, { transform: 'translateY(-2px) scale(1.2)', opacity: 1, offset: 0.4 }, { transform: 'none', opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 900, easing: 'steps(8)', fill: 'forwards' }); }
      if (a) a.hold = false;
    }, D + 730);
  }
  // ROSTER, línea 3 sin cortar nada (mockup): si no cabe, los rasgos sobrantes pasan a «+N»; si ni uno cabe, la afinidad
  // se queda en oficio y corazones antes de esconder el último. Ningún rasgo se corta a medias.
  function fitTags(el) {
    const l3 = el.querySelector('.mx-l3'); if (!l3 || !l3.clientWidth) return;
    const over = () => l3.scrollWidth > l3.clientWidth + 1 || [...l3.querySelectorAll('.mx-tag')].some((t) => !t.hidden && t.scrollWidth > t.clientWidth + 1);
    const tags = [...l3.querySelectorAll('.mx-tag:not(.mx-more)')], more = l3.querySelector('.mx-tag.mx-more'), lw = l3.querySelector('.mx-lw'), ntr = +el.dataset.ntr || tags.length;
    let shown = tags.length;
    const setMore = () => { if (!more) return; const n = ntr - shown; more.hidden = n <= 0; more.textContent = '+' + n; };
    while (over() && shown > 1) { tags[--shown].hidden = true; setMore(); }
    if (over() && lw) lw.hidden = true;
    if (over() && shown === 1 && more) more.hidden = true;
    if (over()) setMore();
    while (over() && shown > 0) { tags[--shown].hidden = true; setMore(); }
  }
  // TREAT: la cama vuela del botón al nicho (mockup FICHA V2); la acción la hace el juego.
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#sheet-body .mx-fc-btn.mx-bed[data-act^="care:"]'); if (!b || reduced) return;
    const nn = document.querySelector('#sheet-body .mx-fc-niche[data-hero]'); if (!nn) return;
    const L = sfxL(), [x0, y0] = ptOf(b), [x1, y1] = ptOf(nn, 0, -10), c = document.createElement('img');
    c.src = IC.bed().toDataURL(); c.className = 'mx-fc-coin'; c.style.cssText += 'left:' + (x0 - 12) + 'px;top:' + (y0 - 12) + 'px;width:24px;height:24px'; L.appendChild(c);
    c.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + (x1 - x0) / 2 + 'px,' + ((y1 - y0) / 2 - 30) + 'px)', offset: 0.5 }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px)', opacity: 1, offset: 0.9 }, { opacity: 0 }], { duration: 420, easing: 'steps(10)' });
    setTimeout(() => c.remove(), 420);
  }, true);
  // Tocar el nicho grande: el ratón responde.
  document.addEventListener('click', (e) => { const nn = e.target.closest && e.target.closest('#sheet-body [data-hero]'); if (!nn) return; const H = HEROES[nn.dataset.hero]; if (H && (!H.act || ['fidget', 'look', 'hop', 'tap', 'cheer', 'dream', 'nibble', 'doze', 'page'].includes(H.act.name))) H.play(H.state === 'bed' ? 'dream' : 'pet'); });
  // Capa de efectos de la hoja (fuera del cuerpo que se repinta).
  const sfxL = () => { const p = document.querySelector('#sheet .panel'); let l = p.querySelector('.mx-fc-sfx'); if (!l) { l = document.createElement('div'); l.className = 'mx-fc-sfx'; p.appendChild(l); } return l; };
  const ptOf = (el, dx = 0, dy = 0) => { const s = sfxL().getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - s.left + r.width / 2 + dx, r.top - s.top + r.height / 2 + dy]; };
  // Llegan los tres candidatos (al pagar): puertas «?» que se abren una tras otra con el efecto de su rareza (mockup RECLUTAR).
  const revealed = {};
  function reveal(root) {
    const box = root.querySelector('.mx-rc-cards[data-reveal]'), sig = box.dataset.reveal;
    if (revealed[sig] || reduced) return; revealed[sig] = 1;
    const cards = [...box.children], hero = root.querySelector('.mx-rc-hero');
    cards.forEach((d) => d.classList.add('mx-closed'));
    if (hero) hero.style.visibility = 'hidden';
    cards.forEach((d, i) => setTimeout(() => {
      if (!d.isConnected) return;
      d.classList.remove('mx-closed');
      const rar = +d.dataset.rar, st = d.querySelector('.mx-st'), cv = st.querySelector('canvas');
      cv.animate([{ filter: 'brightness(4)', transform: 'scale(.6)' }, { filter: 'brightness(1)', transform: 'scale(1.1)', offset: 0.6 }, { filter: 'none', transform: 'none' }], { duration: 300, easing: 'steps(6)' });
      const [x, y] = ptOf(st);
      if (rar === 0) burst(sfxL(), x, y + 12, 8, ['#c8a070', '#8b5a2b', '#e8dcc0'], { spread: 26, up: 4, size: 3, dur: 380, fall: 2 });
      if (rar === 1) burst(sfxL(), x, y, 12, ['#a8ccff', '#5a9cf0', '#ffffff'], { spread: 40, up: 10, size: 3, dur: 520, fall: 4 });
      if (rar === 2) { burst(sfxL(), x, y, 22, ['#ffcf2e', '#fff3a0', '#ffffff', '#e0a020'], { spread: 70, up: 24, size: 4, dur: 800, fall: 16 }); d.animate([{ transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(-1px)' }, { transform: 'none' }], { duration: 240, easing: 'steps(4)' }); const ray = document.createElement('i'); ray.className = 'mx-rc-rays'; d.appendChild(ray); setTimeout(() => ray.remove(), 1100); }
    }, 250 + i * 330));
    setTimeout(() => { const h = document.querySelector('#sheet-body .mx-rc-hero'); if (!h) return; h.style.visibility = ''; h.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'steps(3)' }); const nn = h.querySelector('[data-hero]'); const H = nn && HEROES[nn.dataset.hero]; if (H) H.play('enter'); }, 250 + 3 * 330 + 150);
  }
  const ROOMS = {};
  // Un bucle mientras el panel está abierto.
  (function tick(t) {
    requestAnimationFrame(tick);
    if (document.getElementById('sheet').hidden) return;
    for (const a of small) {
      if (!a.cv.isConnected || a.hold) continue;
      const m = (t + a.off) % 3000, f = a.fr.length < 3 ? 0 : m < 100 ? 2 : Math.floor((t + a.off) / 700) % 2;
      if (a.f !== f) { a.f = f; const x = a.cv.getContext('2d'); x.clearRect(0, 0, 22, 20); x.drawImage(a.fr[f], 0, 0); }
    }
    for (const H of live) if (H.c.isConnected) H.update(t);
    for (const k of Object.keys(ROOMS)) { const R = ROOMS[k]; if (R.el && R.el.isConnected) R.draw(t); }
  })(performance.now());
  // ---- GRAND MASTER: piezas del mockup (FICHA y GRAND MASTER) ----
IC.bigStar = () => icon([
  '......y......',
  '.....yWy.....',
  '.....yWy.....',
  '....yWYYy....',
  'yyyyyWYYyyyyy',
  '.yWWWYYYYYYO.',
  '..yYYYYYYYO..',
  '...yYYYYYO...',
  '...yYYOYYO...',
  '..yYYO.OYYO..',
  '..yYO...OYO..',
  '.yOO.....OOO.'], { y: '#ffcf2e', Y: '#ffe55c', W: '#fffbe0', O: '#c98a08' }, '#3a2408');
IC.wheel = () => icon(['..yyyy..', '.yYWYYy.', 'yYYYYYYy', 'y!!!!!!O', '.!!?!!O.', '..OOOO..'], { y: '#ffcf2e', Y: '#ffe55c', W: '#fffbe0', '!': '#e0a020', '?': '#c98a08', O: '#8a5a0a' }, '#2a1d0a');
const FURS = {
  white: ['#fdf9fa', '#ebe2e6', '#bdaeb8'], grey: ['#cdc8d1', '#aaa4b0', '#7f7987'], brown: ['#dcae74', '#c08a50', '#8e6234'], dark: ['#77717f', '#55505c', '#38333f'],
  cream: ['#fff6dc', '#f3e3b6', '#d9c38a'], peach: ['#ffe8d8', '#ffd9c2', '#eab59a'], blue: ['#dce9fa', '#a8c4e8', '#7f9cc4'],
  mint: ['#d8f8e6', '#a8e8c8', '#7fc4a0'], lilac: ['#f0e2fc', '#d8b8f0', '#b08fd0'], gold: ['#fff8dc', '#f8e08a', '#d4a84a'],
};
const COMMON = ['white', 'grey', 'brown', 'dark', 'cream', 'peach', 'blue'];
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
function gmRays() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; c.className = 'mx-fgm-rays';
  let a = 0; const x = c.getContext('2d');
  const draw = () => {
    x.clearRect(0, 0, 64, 64);
    for (let yy = 0; yy < 64; yy++) for (let xx = 0; xx < 64; xx++) {
      const dx = xx - 31.5, dy = yy - 31.5, r = Math.hypot(dx, dy); if (r > 31) continue;
      const ang = (Math.atan2(dy, dx) / (Math.PI * 2) + 1 + a) % 1;
      if (Math.floor(ang * 16) % 2 === 0) { x.fillStyle = r < 12 ? '#fff3a0' : r < 22 ? '#ffcf2e' : '#c98a08'; x.globalAlpha = r < 12 ? 0.5 : r < 22 ? 0.32 : 0.18; x.fillRect(xx, yy, 1, 1); }
    }
    x.globalAlpha = 1;
  };
  draw();
  c._iv = setInterval(() => { if (!c.isConnected) return clearInterval(c._iv); a = (a + 1 / 64) % 1; draw(); }, 110);
  return c;
}
function riseLoop(layer, w, y0, until) {
  if (reduced) return;
  const iv = setInterval(() => {
    if (performance.now() > until || !layer.isConnected) return clearInterval(iv);
    const p = document.createElement('i'); p.className = 'mx-fc-px'; const s = Math.random() < 0.3 ? 4 : 3;
    p.style.cssText = `left:${Math.round(Math.random() * w / 2) * 2}px;top:${y0}px;width:${s}px;height:${s}px;background:${['#fff3a0', '#ffcf2e', '#ffffff'][Math.floor(Math.random() * 3)]}`;
    layer.appendChild(p);
    const dist = 60 + Math.random() * 90;
    p.animate([{ transform: 'translateY(0)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translateY(-${Math.round(dist / 2) * 2}px)`, opacity: 0 }], { duration: 1100 + Math.random() * 500, easing: 'steps(10)' });
    setTimeout(() => p.remove(), 1700);
  }, 70);
}
  // Ceremonia al nombrarlo (mockup FICHA): la escena se para, el ratón sube al centro con luz dorada, baja la estrella, el
  // título aparece letra a letra y alza la rueda. Al cerrar, la estrella vuela a su nombre y en el nicho lo celebra. El juego
  // ya le ha dado el título (nameMaster): esto es lo que se ve.
  const ROMAN2 = ['', 'I', 'II', 'III'];
  function gmNamed(gm, fromName) {
    const host = document.querySelector('#sheet .panel'); if (!host || host.querySelector('.mx-fgm')) return;
    const c = crewOf('m:' + gm.id + ':' + (gm.post ? gm.post.split(':')[0] : '')); if (!c) return;
    const esc2 = (t) => String(t).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);
    const ov = document.createElement('div'); ov.className = 'mx-fgm';
    ov.innerHTML = '<div class="mx-fgm-dim"></div><div class="mx-fgm-stage"><i class="mx-fgm-cone mx-l"></i><i class="mx-fgm-cone mx-r"></i><div class="mx-fgm-plinth"></div><canvas class="mx-fgm-m" width="26" height="26"></canvas><div class="mx-fgm-fx"></div></div>' +
      '<div class="mx-fgm-title"><b></b><span class="mx-fgm-name">' + esc2(gm.name.toUpperCase()) + '</span></div>' +
      '<p class="mx-fgm-desc">The cheese it cooks is worth more, the more it has cooked in its life.' + (fromName ? '<br><span>From ' + esc2(fromName) + ', who keeps its experience.</span>' : '') + '</p><span class="mx-fgm-tap">TAP TO CONTINUE</span>';
    host.appendChild(ov);
    const st = ov.querySelector('.mx-fgm-stage'), fx = ov.querySelector('.mx-fgm-fx'), cv = ov.querySelector('.mx-fgm-m'), cx = cv.getContext('2d');
    st.prepend(gmRays());
    const title = ov.querySelector('.mx-fgm-title b');
    [...'GRAND MASTER'].forEach((ch, i) => { const sp = document.createElement('span'); sp.textContent = ch; sp.style.animationDelay = (reduced ? 0 : 1.65 + i * 0.045) + 's'; title.appendChild(sp); });
    const t0 = performance.now(); let done = false, star;
    const T = (ms) => (reduced ? 0 : ms);
    const put = (cc, white) => { cx.clearRect(0, 0, 26, 26); cx.drawImage(white ? whiteOf(cc) : cc, 0, cc.height === 20 ? 6 : 0); };
    const iv = setInterval(() => {
      if (done || !cv.isConnected) return clearInterval(iv);
      const e = reduced ? 9999 : performance.now() - t0;
      cv.style.opacity = e < 380 ? Math.min(1, e / 300) : 1;
      if (e < 380) put(mouseCanvas(c, 0), Math.floor(e / 80) % 2 === 0);
      else if (e < 1250) put(mouseCanvas(c, Math.floor(e / 400) % 2, false, { face: e > 600 ? 'wow' : '' }));
      else if (e < 1700) put(mouseCanvas(c, 0, false, { face: 'happy', spark: Math.floor(e / 120) % 2 ? 1 : undefined }));
      else if (e < 1900) put(trophyCanvas(c, 0, 0));
      else put(trophyCanvas(c, Math.floor((e - 1900) / 520) % 2, 1));
      const hop = e > 1900 && e < 2400 ? [0, -10, -15, -10, 0][Math.min(4, Math.floor((e - 1900) / 100))] : 0;
      cv.style.transform = 'translateY(' + hop + 'px)';
    }, 33);
    ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T(220), easing: 'steps(4)', fill: 'forwards' });
    riseLoop(fx, 260, 196, t0 + 6000);
    setTimeout(() => {
      star = toImg(IC.bigStar(), 4); star.classList.add('mx-fgm-star'); st.appendChild(star);
      if (!reduced) star.animate([{ transform: 'translate(-50%, -90px) scaleX(1)' }, { transform: 'translate(-50%, -60px) scaleX(-1)' }, { transform: 'translate(-50%, -30px) scaleX(1)' }, { transform: 'translate(-50%, -6px) scaleX(-1)' }, { transform: 'translate(-50%, 0) scaleX(1)' }], { duration: 420, easing: 'steps(8)', fill: 'forwards' });
    }, T(1000));
    setTimeout(() => {
      st.classList.add('mx-flash'); setTimeout(() => st.classList.remove('mx-flash'), 100);
      burst(fx, 130, 40, 28, ['#ffcf2e', '#fff3a0', '#ffffff', '#e0a020'], { spread: 110, up: 30, size: 4, dur: 1000, fall: 40 });
      const ring = document.createElement('i'); ring.className = 'mx-fc-ring'; ring.style.cssText = 'left:120px;top:30px;border-color:#fff3a0'; fx.appendChild(ring);
      if (!reduced) ring.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(9)', opacity: 0 }], { duration: 520, easing: 'steps(6)' }); setTimeout(() => ring.remove(), 520);
      if (star && !reduced) star.animate([{ transform: 'translate(-50%, 0) scale(1)' }, { transform: 'translate(-50%, 0) scale(1.25)' }, { transform: 'translate(-50%, 0) scale(1)' }], { duration: 260, easing: 'steps(4)' });
    }, T(1440));
    setTimeout(() => { for (let i = 0; i < 3; i++) setTimeout(() => burst(fx, 132, 70, 6, ['#ffe55c', '#e0a020', '#fffbe0'], { spread: 60, up: 40, size: 4, dur: 900, fall: 60 }), i * 160); }, T(1950));
    setTimeout(() => ov.classList.add('mx-ready'), T(2400));
    const close = () => {
      if (done) return; done = true;
      ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T(220), easing: 'steps(4)', fill: 'forwards' }); setTimeout(() => ov.remove(), T(230));
      const nameB = document.querySelector('#sheet-body .mx-fc-name b');
      if (star && nameB && !reduced) {
        const [sx, sy] = ptOf(star), [nx, ny] = ptOf(nameB);
        const f = toImg(IC.bigStar(), 2); f.style.cssText += ';position:absolute;left:' + (sx - 13) + 'px;top:' + (sy - 12) + 'px'; sfxL().appendChild(f);
        f.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + ((nx - sx) / 2 + 40) + 'px, ' + ((ny - sy) / 2 - 20) + 'px)', offset: 0.5 }, { transform: 'translate(' + (nx - sx + 70) + 'px, ' + (ny - sy) + 'px) scale(.7)' }], { duration: 420, easing: 'steps(10)' });
        setTimeout(() => f.remove(), 430);
      }
      setTimeout(() => {
        const box = document.querySelector('#sheet-body .mx-fc-gm');
        if (box && !reduced) { box.animate([{ boxShadow: 'inset 0 0 0 2px #ffcf2e', transform: 'scale(1.02)' }, { boxShadow: 'none', transform: 'none' }], { duration: 520, easing: 'steps(5)' }); const [bx, by] = ptOf(box); burst(sfxL(), bx, by, 10, ['#ffcf2e', '#fff3a0'], { spread: 40, up: 6, size: 3, dur: 520, fall: 6 }); }
        const H = HEROES['card:' + gm.id]; if (H && H.c && H.c.isConnected) H.play('pride');
        if (CM.ui && CM.ui.toast) CM.ui.toast(gm.name + ' is Grand Master', true);
      }, T(430));
    };
    ov.onclick = () => { if (ov.classList.contains('mx-ready') || reduced) close(); };
    setTimeout(close, T(6000));
  }
  // Subida de grado (sin pantalla aparte, mockup FICHA): en la caja del título el número nuevo cae como un sello con polvo
  // dorado; en el nicho, anillo, cuñas de queso y la pose de la rueda; «+10% CHEESE» sube. El texto ya es el del juego.
  function gmUp(id) {
    setTimeout(() => {
      const box = document.querySelector('#sheet-body .mx-fc-gm.mx-on'), H = HEROES['card:' + id];
      if (box && !reduced) {
        box.animate([{ transform: 'scale(1.03)', filter: 'brightness(1.3)' }, { transform: 'none', filter: 'none' }], { duration: 240, easing: 'steps(5)' });
        const [bx, by] = ptOf(box); burst(sfxL(), bx, by, 12, ['#ffcf2e', '#fff3a0', '#c98a08'], { spread: 50, up: 4, size: 3, dur: 520, fall: 8 });
      }
      if (H && H.c && H.c.isConnected) {
        const ring = document.createElement('i'); ring.className = 'mx-fc-ring'; ring.style.cssText = 'left:58px;top:92px;border-color:#ffcf2e'; H.nfx.appendChild(ring);
        if (!reduced) ring.animate([{ transform: 'scale(1,.3)', opacity: 1 }, { transform: 'scale(5,1.2)', opacity: 0 }], { duration: 420, easing: 'steps(5)' }); setTimeout(() => ring.remove(), 420);
        for (let i = 0; i < 2; i++) setTimeout(() => burst(H.nfx, 70, 40, 6, ['#ffe55c', '#e0a020', '#fffbe0'], { spread: 40, up: 26, size: 4, dur: 700, fall: 40 }), i * 180);
        H.play('pride');
        floatText(H.nfx, 18, 8, '+10% CHEESE', 'mx-fc-up mx-fgm-plus', 1100, 12);
      }
    }, 80);
  }

  CM.pmice = { ic, mount, burst, sfxL, ptOf, heroes: HEROES, rooms: ROOMS, crew: crewOf, gmNamed, gmUp };
})();
