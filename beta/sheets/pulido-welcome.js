// CHEESE DRILLER · BETA · Copia de js/ui/pulido-welcome.js con los edificios y ratones de MAIN 3.0 (solo cambia lo que se dibuja en su escena). // Origen: GENERADO por exploracion/pixel/main2-src/game/build_welcome.py: no editar a mano. WELCOME BACK aprobado: escena, moneda,
// tarjetas y cadena copiadas del mockup (welcome.html). Los datos son los de showOffline; el cálculo, el de offlineRun.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = (s) => { const i = new Image(); i.src = s.startsWith('out/') ? 'assets/main2/' + s : s; return i; };
  const fmtN = (n) => CM.fmt(Math.floor(n));
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

// ---------- WELCOME BACK ----------
// El resumen al volver (showOffline y comeBack de main.js) con sus mismos datos y textos, ordenado por importancia:
// 1. La cifra principal: las monedas ganadas, grandes, contando con la moneda que gira (si no hubo ventas, el queso hecho).
// 2. Lo memorable, en tarjetas: rasgo legendario (oro), cepa nueva, reentreno y cama terminados. Nunca entre cifras.
// 3. La producción como la cadena (Raw, Base, queso, de izquierda a derecha) y lo demás en una línea.
// 4. La colonia: niveles de habilidad en fichas y lo de los ratones en lista.
// La escena es la colonia (quesería y tienda de MAIN). Si la ausencia pasa de 30 minutos, el juego calcula a trozos: aquí es
// de noche, la luna cruza el cielo a la vez que la barra (es el tiempo que se está contando) y los edificios trabajan. Al
// acabar amanece: la noche se levanta, sale el sol del fondo y la misma ventana se convierte en el resumen (en el juego son
// dos ventanas seguidas; al implementar, la segunda sustituye el contenido de la primera). NICE funciona desde que aparece.
// Al cerrar, si llegó un legendario, se celebra con la ceremonia aprobada (y después, el reentreno, del bloque 3).
// fmtN: el formato de números compartido (como CM.fmt).
// Luna creciente (se lee como luna, no como farol).
const MOON = ['..kkkk..', '.kWWWWk.', 'kWWwkk..', 'kWwk....', 'kWwk....', 'kWWwkk..', '.kWWWWk.', '..kkkk..'];
const MOON_PAL = { k: '#3a3c6a', W: '#fff6d0', w: '#d8cfa8' };
// Estrellas fijas; solo se pintan donde hay cielo (por encima de las montañas del fondo). Unas pocas parpadean despacio.
const STARS = [[6, 17, 0], [17, 11, 1], [29, 21, 0], [41, 14, 0], [52, 24, 2], [64, 12, 0], [75, 19, 0], [88, 15, 3], [99, 23, 0], [111, 11, 0], [123, 34, 1], [136, 38, 0], [149, 13, 0], [156, 30, 2], [9, 32, 0], [58, 35, 0], [94, 34, 0]];
// El fondo de MAIN sin sol, para la noche, y dónde acaba el cielo en cada columna (para no poner estrellas en las montañas).
let BG_NIGHT = null, SKY = null;
function sunless() {
  if (BG_NIGHT) return BG_NIGHT; const bg = img('out/sprites/bg_cheddar.png'); if (!bg.complete || !bg.width) return null;
  const c = document.createElement('canvas'); c.width = bg.width; c.height = bg.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(bg, 0, 0);
  SKY = new Array(bg.width).fill(30);
  try { const d = x.getImageData(0, 0, c.width, c.height), p = d.data, w = c.width;
    // El cielo del fondo va por franjas de azul puro (r < 120, b >= 215); el sol y su halo, en un círculo alrededor de (131, 16).
    const blue = (i) => p[i] < 120 && p[i + 2] >= 215, inSun = (xx, y) => (xx - 131) * (xx - 131) + (y - 16) * (y - 16) <= 14 * 14;
    for (let xx = 0; xx < w; xx++) { let y = 0; for (; y < c.height; y++) if (!blue((y * w + xx) * 4) && !inSun(xx, y)) break; SKY[xx] = y; }
    // Sin sol: lo que no es azul dentro del círculo toma el azul de su misma fila (el del cielo más cercano).
    for (let y = 0; y < 31; y++) { let ref = -1; for (const xx of [111, 110, 109, 152, 153, 154, 105, 100]) { const i = (y * w + xx) * 4; if (blue(i)) { ref = i; break; } } if (ref < 0) continue;
      for (let xx = 116; xx <= 146; xx++) { if (!inSun(xx, y)) continue; const i = (y * w + xx) * 4; if (!blue(i)) { p[i] = p[ref]; p[i + 1] = p[ref + 1]; p[i + 2] = p[ref + 2]; } } }
    x.putImageData(d, 0, 0); } catch (e) { /* sin acceso a los píxeles: la noche lleva el sol atenuado y estrellas solo arriba */ }
  return (BG_NIGHT = c);
}
// La escena (lienzo de 88 de alto, anclado abajo). De noche se ve entero (176 px: cielo y colonia). En el resumen (164 px con el marco), las 80 filas
// de abajo (160 px): los edificios enteros, con 6 filas de aire sobre la torre de la quesería. Nunca se recorta un edificio.
// s.night (0 día, 1 noche), s.prog (la luna), s.work (los edificios trabajan).
// Lo que hay ahora en la colonia: casa y tienda con el aspecto de la escena y hasta tres de sus ratones. Se recuerda mientras no cambie.
let LOOK = null;
function welcomeLook() {
  const H2 = window.H, c = H2.G, A = parent.CM.art, stage = Math.max(1, Math.min(4, c.lab.phase)), sig = [stage, c.built.house, c.s.built.sell, c.roster.slice(0, 3).map((m) => m.id + ':' + (m.rank || 0)).join()].join('|');
  if (LOOK && LOOK.sig === sig) return LOOK;
  const back = [];
  if (c.built.house) back.push({ cv: stage >= 2 ? A.houseV3(stage) : A.houseStage(1), at: 0.26 });
  if (c.s.built.sell) { const b = A.shopBack(stage), f = A.shopFront(stage), v = document.createElement('canvas'); v.width = b.width; v.height = b.height; const g2 = v.getContext('2d'); g2.drawImage(b, 0, 0); g2.drawImage(f, 0, 0); back.push({ cv: v, at: 0.78 }); }
  return (LOOK = { sig, back, mice: c.roster.slice(0, 3).map((m) => CM.m2crew(m, '')) });
}
function wbScene(g, W, H, t, s) {
  const gy = H - 9, by = gy - 75, bg = img('out/sprites/bg_cheddar.png'), gr = img('out/sprites/ground.png');
  const tile = (im) => { for (let x = -im.width; x < W; x += im.width) g.drawImage(im, x, by); };
  // Por encima del fondo, el color de su primera fila de cielo (para que no quede una franja oscura).
  if (by > 0) P1(g, 0, 0, W, by, '#3d93e0');
  if (bg.complete && bg.width) {
    if (s.night > 0) { const nb = sunless(); if (nb) tile(nb); if (s.night < 1) { g.globalAlpha = 1 - s.night; tile(bg); g.globalAlpha = 1; } }
    else tile(bg);
  }
  // Noche sobre el fondo; encima, estrellas (solo en el cielo) y la luna, que cruza con la barra y se pone al amanecer.
  if (s.night > 0) {
    // Una sola penumbra para todo el fondo, de arriba abajo (cielo, montañas y colinas): sin franjas ni costuras.
    g.globalAlpha = 0.83 * s.night; P1(g, 0, 0, W, H, '#0b1030'); g.globalAlpha = 1;
    const bw = bg.width || 160;
    for (const [sx, sy, k] of STARS) { if (sx >= W) continue; const col = ((sx % bw) + bw) % bw; if (SKY && sy - by >= SKY[col] - 2) continue; if (!SKY && sy > 8) continue; const dim = k && Math.floor(t / 0.8 + k) % 4 === 0; g.globalAlpha = s.night * (dim ? 0.35 : 0.9); P1(g, sx, sy, 1, 1, '#fff6d0'); }
    g.globalAlpha = 1;
    const m = Math.min(1, s.prog), set = 1 - s.night, mx = 4 + (W - 20) * m + set * 10, my = 30 - Math.round(Math.sin(m * Math.PI) * 15) + Math.round(set * 14);
    g.globalAlpha = s.night; drawRows(g, MOON, Math.round(mx), my, MOON_PAL); g.globalAlpha = 1;
  }
  // Amanecer: una franja cálida sobre las colinas, solo mientras la noche se levanta.
  if (s.night > 0 && s.night < 1) { const a = Math.sin((1 - s.night) * Math.PI) * 0.32; for (let y = 0; y < 24; y++) { g.globalAlpha = a * (y / 24); P1(g, 0, gy - 58 + y, W, 1, '#ffb070'); } g.globalAlpha = 1; }
  // Edificios de MAIN (aspecto 3: una colonia que ya lleva tiempo). Trabajan si hay ratones que trabajen. Van en su propia capa:
  // de noche se oscurecen ellos (y el suelo), un poco menos que el fondo para que se lean, sin tocar el cielo, la luna ni las estrellas.
  const lay = s.lay || (s.lay = document.createElement('canvas')); if (lay.width !== W || lay.height !== H) { lay.width = W; lay.height = H; }
  const lg = lay.getContext('2d'); lg.imageSmoothingEnabled = false; lg.clearRect(0, 0, W, H);
  // Los edificios y los ratones de MAIN 3.0, con los de esta colonia. Solo se dibuja lo que existe en la partida.
  const look = welcomeLook();
  for (const it of look.back) lg.drawImage(it.cv, Math.round(W * it.at - it.cv.width / 2), gy + 3 - it.cv.height);
  look.mice.forEach((c, i) => { const n = look.mice.length, x = Math.round(W * (n === 1 ? 0.42 : 0.3 + (0.3 * i) / (n - 1)) - 11), ph = Math.floor(t * 1.5 + i * 0.7), hop = s.work && ph % 4 === 0 ? 1 : 0; lg.drawImage(CM.m2mouse(c, ph % 2, Math.floor(t / 2.7 + i) % 5 === 0), x, gy + 3 - 20 - hop); });
  if (gr.complete && gr.width) for (let xx = -gr.width; xx < W; xx += gr.width) lg.drawImage(gr, xx, gy);
  if (s.night > 0) { lg.globalCompositeOperation = 'source-atop'; lg.globalAlpha = 0.5 * s.night; lg.fillStyle = '#0b1030'; lg.fillRect(0, 0, W, H); lg.globalAlpha = 1; lg.globalCompositeOperation = 'source-over'; }
  g.drawImage(lay, 0, 0);
}
// La moneda de la cifra principal: gira mientras cuenta (solo sus dos fotogramas de cara: el de canto, a 4×, era una barra
// amarilla suelta); al acabar se queda de frente y brilla una vez sobre su cara (el brillo no sale de la moneda).
function heroCoin() { const c = document.createElement('canvas'); c.width = 9; c.height = 9; c.className = 'pix'; c.style.width = '36px'; c.style.height = '36px'; return c; }
function paintCoin(c, f, glint) { const g = c.getContext('2d'); g.clearRect(0, 0, 9, 9); drawRows(g, COIN_F[f], 1, 2, COIN_PAL); if (glint) { g.globalAlpha = glint; P1(g, 3, 3, 1, 3, '#ffffff'); P1(g, 2, 4, 3, 1, '#ffffff'); g.globalAlpha = 1; } }

// Kicker, título y detalle de cada tarjeta (los textos de showOffline, repartidos).
function newsCard(n) {
  const icon = { leg: () => copyC(IC.star(), 3), strain: () => { const i = new Image(); i.src = 'assets/main2/out/sprites/ic_flask.png'; i.className = 'pix'; i.alt = ''; i.style.width = '26px'; i.style.height = '28px'; return i; }, spec: () => copyC(IC.book(), 2), bed: () => copyC(IC.bed(), 2) }[n.k];
  const txt = { leg: ['LEGENDARY TRAIT', `${n.name} · <i>${n.trait}</i>`, n.desc], strain: ['NEW STRAIN', `New strain found: <i>${n.name}</i>`, 'Compare it in LAB'], spec: ['TRAINING ROOM', `${n.name} finished retraining`, 'Close this to see the result. The house is free'], bed: ['MOUSE HOUSE BED', `${n.name} is over <i>${n.what}</i>`, 'The house is free'] }[n.k];
  const c = el('div', 'wb-n' + (n.k === 'leg' ? ' leg' : '')); const ic = el('div', 'wb-ni'); ic.appendChild(icon()); c.appendChild(ic);
  c.appendChild(el('span', '', `<small>${txt[0]}</small><b>${txt[1]}</b><em>${txt[2]}</em>`)); return c;
}

  // ---- La ventana en el juego ----
  // Se abre con la escena: de noche si el juego va a calcular a trozos (la barra y el porcentaje son los de offlineRun,
  // #catch-fill y #catch-num), de día si no. summary(v) la convierte en el resumen: con cálculo, amanece y después se
  // desenrolla; sin él, al momento. NICE lleva data-m="ok": cierra con el manejador de showOffline.
  let WB = null;
  function open(root, o) {
    const win = root.querySelector('.wb-win'); if (!win) return;
    const s = { night: o.catch ? 1 : 0, prog: 0, work: true };
    const top = el('div', 'vw-top', '<span class="vw-kind">' + (o.catch ? 'CATCHING UP' : 'AWAY') + '</span>');
    const title = el('div', 'vw-title', 'WELCOME BACK');
    const scroll = el('div', 'wb-scroll');
    const stage = el('div', 'vw-stage wb-stage' + (o.catch ? ' tall' : ''));
    win.append(top, title, scroll); scroll.appendChild(stage);
    const catchEl = el('div', 'wb-catch', '<p class="wb-lead">Your mice kept working for <b>' + o.hoursText + '</b>.</p><div class="wb-bar"><i id="catch-fill"></i></div><div class="wb-barl"><span>Catching up on everything they did...</span><b id="catch-num">0%</b></div>');
    catchEl.hidden = !o.catch; scroll.appendChild(catchEl);
    const fade = el('div', 'wb-fade'); scroll.appendChild(fade);
    const more = () => { fade.hidden = !(scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight > 2); };
    scroll.addEventListener('scroll', more);
    const bts = el('div', 'vw-bts', '<button class="act vw-go" data-m="ok">NICE</button>'); bts.hidden = true; win.appendChild(bts);
    const cv = document.createElement('canvas'); stage.appendChild(cv);
    const W = Math.floor(stage.clientWidth / 2) || 150, H = 88; cv.width = W; cv.height = H; cv.style.width = W * 2 + 'px'; cv.style.height = H * 2 + 'px'; cv.className = 'pix';
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const t0 = performance.now();
    const bar = catchEl.querySelector('.wb-bar'), fill = bar.querySelector('i'), hint = catchEl.querySelector('.wb-barl span');
    WB = { win, s, top, scroll, stage, catchEl, fade, more, bts, catch: o.catch, v: null, revealed: false, dawnAt: 0 };
    const me = WB;
    const iv = setInterval(() => {
      if (!cv.isConnected) { if (WB === me) WB = null; return clearInterval(iv); }
      const t = (performance.now() - t0) / 1000;
      if (me.catch && !me.revealed) {
        s.prog = Math.min(1, (parseFloat(fill.style.width) || 0) / 100);
        if (me.v && !me.dawnAt) { fill.style.width = '100%'; bar.classList.add('done'); hint.textContent = 'All caught up.'; me.dawnAt = reduced ? t - 9 : t + 0.2; }
        if (me.dawnAt && t >= me.dawnAt + 0.65) reveal(me, false);
      }
      if (me.catch) s.night = me.dawnAt ? 1 - easeInOut(seg(t, me.dawnAt, me.dawnAt + 0.8)) : 1;
      g.clearRect(0, 0, W, H); wbScene(g, W, H, t, s);
    }, 16);
    if (!o.catch && o.v) summary(o.v);
  }
  function summary(v) {
    const me = WB; if (!me || me.v) return false;
    me.v = v; me.s.work = !v.nothing;
    me.parts = parts(v, me);
    me.parts.list.forEach((p) => { p.hidden = true; me.scroll.insertBefore(p, me.fade); });
    if (!me.catch) setTimeout(() => reveal(me, false), reduced ? 0 : 140);
    return true;
  }
  const isOpen = () => !!(WB && WB.win.isConnected && !WB.v);
  // Las piezas del resumen, en orden: tope de horas, la cifra, lo memorable, la producción y la colonia.
  function parts(v, me) {
    const list = [];
    if (v.capped) { const cap = el('div', 'wb-cap'); cap.append(copyC(glyph('lamp', ['.h.', 'hhh', 'yYy', 'yYy', 'yyy', 'hhh'], { h: '#8a86a8', y: '#ffcf2e', Y: '#fff3a0' }), 2), el('span', '', 'Your mice work up to <b>' + v.capped + ' h</b> alone; the <b>Night Lamp</b> in COLONY extends it.')); list.push(cap); }
    let fig = null, coinC = null, heroVal = 0;
    if (v.nothing) list.push(el('p', 'wb-none', 'Your mice had nothing they could do. Check what is stopped.'));
    else {
      const hero = el('div', 'wb-hero'), ico = el('div', 'wb-ico');
      if (v.coins > 0) { coinC = heroCoin(); paintCoin(coinC, 0); ico.appendChild(coinC); heroVal = v.coins; }
      else { const i = IMG(S_('lot', v.zone || 'cheddar')); i.className = 'pix'; i.alt = ''; i.style.cssText = 'width:30px;height:26px;top:5px;left:3px'; ico.appendChild(i); heroVal = v.lots; }
      hero.appendChild(ico); const f = el('div', 'wb-fig', '<small>' + (v.coins > 0 ? 'COINS EARNED' : 'CHEESE MADE') + '</small><b>+' + fmtN(heroVal) + '</b>'); hero.appendChild(f); fig = f.querySelector('b');
      list.push(hero);
    }
    if (v.news.length) {
      const sec = el('div', 'vw-sec wb-news'); sec.appendChild(el('small', '', 'WHILE YOU WERE AWAY'));
      for (const n of v.news) sec.appendChild(n.k === 'legmore' ? el('p', 'wb-more', '...and ' + n.n + ' more legendary traits. Find them in MICE: ROSTER, show Legendary') : newsCard(n));
      list.push(sec);
    }
    const tiles = [];
    if (!v.nothing && (v.raw || v.base || v.lots)) {
      const sec = el('div', 'vw-sec wb-prod'); sec.appendChild(el('small', '', 'PRODUCTION'));
      const ch = el('div', 'wb-chain');
      [['raw', v.raw, 'RAW'], ['base', v.base, 'BASE'], ['lot', v.lots, 'CHEESE']].forEach(([k, n, l], i) => {
        if (i) { const c2 = copyC(glyph('chvy', ['m..', 'mm.', 'm..'], { m: '#9f97b8' }), 2); c2.classList.add('wb-chev'); ch.appendChild(c2); }
        const t = el('div', 'wb-t', '<img class="pix" alt="" src="assets/main2/' + S_(k, v.zone || 'cheddar') + '"><b>+' + fmtN(n || 0) + '</b><small>' + l + '</small>'); ch.appendChild(t); tiles.push(t);
      });
      sec.appendChild(ch);
      const extra = [];
      if (v.lots) extra.push('<b>' + fmtN(v.sold || 0) + '</b> sold');
      if (v.wheels) extra.push('<b>' + v.wheels + '</b> Grand Wheels (+' + fmtN(v.wheelLots) + ' cheese)');
      if (v.veins) extra.push('<b>' + v.veins + '</b> veins found');
      if (extra.length) sec.appendChild(el('p', 'wb-line', extra.join(' · ')));
      list.push(sec);
    }
    const items = (v.legacy || []).slice();
    for (const [nm, ts] of v.grew.slice(0, 4)) items.push(nm + ' developed ' + ts.map((t) => '<b class="tok">' + t + '</b>').join(', '));
    if (v.grew.length > 4) items.push('...and ' + (v.grew.length - 4) + ' more mice developed traits. They are all in MICE, under HOUSE');
    if (v.ups.n === 1) items.push(v.ups.name + ': LV ' + v.ups.from + ' > ' + v.ups.to); else if (v.ups.n > 1) items.push(v.ups.n + ' mice levelled up, ' + v.ups.top + ' the most');
    if (v.grades) items.push(v.grades + (v.grades === 1 ? ' speciality went up a grade' : ' specialities went up a grade'));
    if (v.skills.length || items.length) {
      const sec = el('div', 'vw-sec wb-col'); sec.appendChild(el('small', '', 'YOUR COLONY'));
      if (v.skills.length) { const sk = el('div', 'wb-skills'); for (const [n, a, b] of v.skills) sk.appendChild(el('span', 'wb-sk', n.toUpperCase() + ' <u>' + a + '</u><u>&gt;</u><s>' + b + '</s>')); sec.appendChild(sk); }
      if (items.length) { const ul = el('ul'); for (const t of items) { const li = el('li'); li.append(copyC(bullet(), 1.5), el('span', '', t)); ul.appendChild(li); } sec.appendChild(ul); }
      list.push(sec);
    }
    return { list, fig, coinC, heroVal, tiles };
  }
  // El resumen: el bloque de la barra se recoge y entran, en orden, la cifra, lo memorable, la producción y la colonia.
  function reveal(me, instant) {
    if (me.revealed || !me.win.isConnected) return; me.revealed = true;
    const v = me.v, P = me.parts, win = me.win, stage = me.stage, scroll = me.scroll;
    if (reduced || instant || !me.dawnAt) me.dawnAt = -9;
    me.top.querySelector('.vw-kind').textContent = 'AWAY ' + v.away.toUpperCase();
    const h0 = win.getBoundingClientRect().height, s0 = stage.getBoundingClientRect().height;
    me.catchEl.hidden = true; P.list.forEach((p) => (p.hidden = false)); me.bts.hidden = false; stage.classList.remove('tall'); scroll.scrollTop = 0;
    me.fade.style.background = 'linear-gradient(transparent, ' + getComputedStyle(document.getElementById('modal-body')).backgroundColor + ')';
    const h1 = win.getBoundingClientRect().height, s1 = stage.getBoundingClientRect().height;
    const quick = reduced || instant, UN = 520;
    if (!quick) { if (Math.abs(h1 - h0) > 1) win.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: UN, easing: EASE }); if (Math.abs(s1 - s0) > 1) stage.animate([{ height: s0 + 'px' }, { height: s1 + 'px' }], { duration: UN, easing: EASE }); }
    const total = Math.max(1, scroll.scrollHeight);
    setTimeout(() => me.more(), quick ? 0 : UN + 20);
    let fig = P.fig; const coinC = P.coinC, heroVal = P.heroVal;
    if (fig) {
      fig.style.minWidth = fig.getBoundingClientRect().width + 'px';
      const start = performance.now() + (quick ? 0 : 240), dur = quick ? 0 : 900;
      let cid = 0; const tick = () => {
        if (!fig.isConnected) return clearInterval(cid);
        const k = dur ? clamp01((performance.now() - start) / dur) : 1, e = easeOut(k);
        fig.textContent = '+' + fmtN(Math.max(0, heroVal * e));
        if (coinC) { const after = (performance.now() - start - dur) / 1000; paintCoin(coinC, k < 1 && k > 0 ? Math.floor((performance.now() - start) / 90) % 2 : 0, after > 0 && after < 0.35 ? (after < 0.17 ? after / 0.17 : (0.35 - after) / 0.18) : 0); }
        if (!(k < 1 || (coinC && performance.now() - start - dur < 360))) { clearInterval(cid); if (coinC) paintCoin(coinC, 0); const n = fig.cloneNode(true); fig.replaceWith(n); fig = n; }
      };
      if (quick) { fig.textContent = '+' + fmtN(heroVal); if (coinC) paintCoin(coinC, 0); } else { fig.textContent = '+0'; cid = setInterval(tick, 16); }
    }
    const prod = P.list.find((p) => p.classList.contains('wb-prod')), pd = prod ? 60 + Math.min(1, prod.offsetTop / total) * (UN - 120) + 200 : 0;
    P.tiles.forEach((t, i) => { if (quick) t.classList.add('on'); else setTimeout(() => t.classList.add('on'), pd + i * 130); });
  }
  // Lo que pinta showModal: una ventana vacía con una referencia a lo que tiene que montar (de noche, calculando; o el
  // resumen con sus datos). mount la arranca cuando la ventana se ve de verdad (si estaba en la cola, al llegarle el turno).
  const REG = {}; let regN = 0;
  function markup(o) { const id = ++regN; REG[id] = o; return '<div class="vw-win wb-win" data-wb="' + id + '"></div>'; }
  function mount(root) {
    const w = root.querySelector('.wb-win[data-wb]'); if (!w || w.dataset.on) return; w.dataset.on = '1';
    const o = REG[w.dataset.wb]; delete REG[w.dataset.wb]; if (!o) return;
    open(root, o.catch ? { catch: true, hoursText: o.hoursText } : { catch: false, v: o.v });
  }
  CM.pwb = { markup, mount, summary, isOpen };
})();
