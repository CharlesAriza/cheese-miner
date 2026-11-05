// GENERADO por exploracion/pixel/main2-src/game/build_beta.py (a partir de proto3/art3.js, build_p0.py) (motor de build.py): no editar a mano (se sobrescribe). Las fuentes son las de las
// maquetas aprobadas de MAIN 2.0 más los parches de integración y el adaptador scene2.js.
(function () {
  if (!window.CM) return;
  // El motor de las maquetas busca unos elementos de su página; aquí existen ocultos y no se usan.
  const host = document.createElement('div'); host.hidden = true; host.setAttribute('aria-hidden', 'true');
  host.innerHTML = '<div id="fit"><div id="phone"></div></div><div id="mc-stage"><canvas id="mc-cv"></canvas></div><div id="mc-goal"></div><div id="mc-nav"></div>';
  document.body.appendChild(host);
  const M2_BASE = 'assets/main2/';
  let BUILT = { drill: true, refinery: true, cheesery: true };
// ==== ad/01_shared_tree.js ====
// ---------- Ajuste del teléfono ----------
const fit = document.getElementById('fit'), phone = document.getElementById('phone');
function rescale() { const k = Math.min(1, fit.clientWidth / 375); phone.style.transform = k < 1 ? `scale(${k})` : ''; fit.style.height = 812 * k + 'px'; }
addEventListener('resize', rescale); rescale();

// ---------- Ratones: plantilla Pulido + paleta, como el juego (makeSprite) ----------
const BODY = ['.DDD..gggggggG......', 'DppqD.ggggGkwG......', 'DpqqDggggGGkkGGn....', 'DpqqDGggGGGGGGGN....', '.DDDDGGGGcGGGGD.....', '....DDGGGGGGGD......',
  '...bBBBDGwwwD.......', 'T..bBBODGwwsGG......', 'T..BBBODGwwsDD......', 'T..BBBODGwss........', '.T..BOODGGGGD.......', '..TtDGGD..GGGD......', '....ffFF..ffFFF.....'];
const HATS = {
  helmet: ['......YHHHHH........', '.....YHHHHHHHlL.....', '....YHHHHHHHHLLL....', '....hhhhhhhhhhhhh...'],
  cap: ['....................', '......YYHHHHH.......', '.....YHHHHHHHH......', '.....hhhhhhhhhhhhh..'],
  beanie: ['........ww..........', '......YYHHHH........', '.....YHHHHHHh.......', '.....hhhhhhhh.......'],
  tophat: ['......YHHHHh........', '......YHHHHh........', '......rrrrrr........', '....hHHHHHHHHh......'],
  crown: ['.....Y.H.H.H........', '.....YHHHHHh........', '.....HrHHHrh........', '.....hhhhhhh........'],
  toque: ['.....YHHHHH.........', '....YHHHHHHH........', '.....HHHHHH.........', '.....hhhhhh.........'],
};
const BASE = { o: '#2a1d2e', k: '#1b1622', w: '#ffffff', p: '#ff9ab5', q: '#d9607f', n: '#ff7a9c', N: '#c94767', c: '#ffc2d1', s: '#e4dbe1', t: '#ff9ab5', T: '#d9607f', f: '#ffb3c6', F: '#d9607f', l: '#e8ffff', L: '#8ff3ff', r: '#e2462f' };
const FURS = {
  white: ['#fdf9fa', '#ebe2e6', '#bdaeb8'], grey: ['#cdc8d1', '#aaa4b0', '#7f7987'], brown: ['#dcae74', '#c08a50', '#8e6234'], dark: ['#77717f', '#55505c', '#38333f'],
  cream: ['#fff6dc', '#f3e3b6', '#d9c38a'], peach: ['#ffe8d8', '#ffd9c2', '#eab59a'], blue: ['#dce9fa', '#a8c4e8', '#7f9cc4'],
  mint: ['#d8f8e6', '#a8e8c8', '#7fc4a0'], lilac: ['#f0e2fc', '#d8b8f0', '#b08fd0'], gold: ['#fff8dc', '#f8e08a', '#d4a84a'],
};
const COMMON = ['white', 'grey', 'brown', 'dark', 'cream', 'peach', 'blue'];
// El lazo del juego (gorro 4) en la plantilla oficial, al tamaño de los demás gorros: dos lazadas con su luz y su sombra y el
// nudo en medio, encima de la cabeza (el de scene.js eran 4 píxeles y en la escena el ratón parecía no llevar nada).
HATS.bow = ['....YHH...YHH.......', '...YHHHh.YHHHh......', '...hHHHhhhHHHh......', '....hhh.h..hhh......'];
const PACKS = [['#b07a40', '#8b5a2b', '#5c3a1b'], ['#5f9a72', '#3f7a52', '#24503a'], ['#9a5f8a', '#7a3f6a', '#4e2444'], ['#5f7aab', '#3f5a8b', '#24385a'], ['#c9703f', '#a8502a', '#6e3018']];
// Uniformes de oficio desde Master (Y luz, H base, h ala, L/l lámpara, r cinta).
const UNI = {
  mining: { hat: 'helmet', Y: '#ffd08a', H: '#ff9a1f', h: '#b35c00' },
  drilling: { hat: 'helmet', Y: '#fff6b0', H: '#ffe55c', h: '#3a2a14', L: '#ff5a5a', l: '#ffc0c0' },
  refining: { hat: 'cap', Y: '#a8ccff', H: '#4a8fe8', h: '#2b5cab' },
  cheesemaking: { hat: 'toque', Y: '#ffffff', H: '#f4f1f6', h: '#cfc6d8' },
  trading: { hat: 'tophat', Y: '#6a5a8a', H: '#3a2a5a', h: '#241838', r: '#ffcf2e' },
  research: { hat: 'cap', Y: '#a8f0b0', H: '#5fcf6a', h: '#2f8a3a' },
};
const OWN_HATS = [['helmet', '#fff0a0', '#ffcf2e', '#c9860c'], ['cap', '#ff9a6e', '#e2562a', '#8f2a12'], ['beanie', '#a8ccff', '#4a8fe8', '#24509c'], ['tophat', '#6a7090', '#3a3f52', '#1f2330']];
const SCARF = [null, ['#4a8fe8', '#2b5cab'], ['#e2462f', '#9c2a1c'], ['#9a5fd0', '#5f3590']];
const hashS = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

// Variantes de la misma plantilla para los gestos: oreja que se pliega, cola que se agita y patas.
const EAR_DOWN = ['.....', '.DDD.', 'DppqD', 'DpqqD', 'DDDDD'];
const TAIL_UP = [[4, 'T..'], [5, 'T..'], [6, 'T..'], [7, 'T..'], [8, '.T.'], [9, '.T.'], [10, '..T']];
const LEGS = {
  stand: [BODY[11], BODY[12]],
  a: ['..TtDGGD...GGGD.....', '...ffFF.....ffFFF...'],
  b: ['...TDGGDGGGD........', '.....ffFFfFF........'],
  tap: [BODY[11], '....ffFF..ffFF......'],
};
// Devuelve un lienzo de 22 × 20 (cuerpo 20 × 18 + contorno). dy: respira; blink: ojo cerrado.
// o: ear (oreja plegada), tail (cola arriba), legs (stand/a/b/tap), book (1 abierto, 2 pasa página),
//    glass (lupa), spark (destello de ascenso).
function mouseCanvas(m, dy = 0, blink = false, o = {}) {
  const W = 20, H = 18;
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const pal = { ...BASE };
  const h = hashS(m.name);
  const fur = m.fur || (m.rar === 2 ? 'gold' : m.rar === 1 ? (h % 2 ? 'mint' : 'lilac') : COMMON[h % COMMON.length]);
  [pal.g, pal.G, pal.D] = FURS[fur];
  const pack = PACKS[m.pack != null ? m.pack : (h >>> 3) % PACKS.length];
  [pal.b, pal.B, pal.O] = pack;
  let hatRows;
  if (m.rar === 2) { hatRows = HATS.crown; Object.assign(pal, { Y: '#fff3a0', H: '#ffc21e', h: '#d9680c', r: '#e2462f' }); }
  else if (m.rank >= 2 && UNI[m.skill]) { const u = UNI[m.skill]; hatRows = HATS[u.hat]; Object.assign(pal, u); }
  else { const o = m.hat || OWN_HATS[(h >>> 5) % OWN_HATS.length]; hatRows = HATS[o[0]]; Object.assign(pal, { Y: o[1], H: o[2], h: o[3] }); }
  if (m.rar !== 2) { const lum = (c) => { const v = parseInt(c.slice(1), 16); return 0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255); }, mix = (a, b, k) => '#' + [16, 8, 0].map((sh) => Math.round(((parseInt(a.slice(1), 16) >> sh) & 255) * (1 - k) + ((parseInt(b.slice(1), 16) >> sh) & 255) * k).toString(16).padStart(2, '0')).join('');
    if (Math.abs(lum(pal.H) - lum(pal.g)) < 48) { if (lum(pal.g) > 120) { pal.h = mix(pal.H, '#2a1d2e', 0.55); pal.Y = pal.H; pal.H = mix(pal.H, '#2a1d2e', 0.18); } else { pal.Y = mix(pal.H, '#ffffff', 0.6); pal.H = mix(pal.H, '#ffffff', 0.3); } } }
  if (m.rank >= 3) pal.h = '#ffcf2e';
  const put = (rows, x0, y0, from = 0, to = rows.length) => { for (let r = from; r < to; r++) for (let x = 0; x < rows[r].length; x++) { const ch = rows[r][x]; if (ch !== '.' && y0 + r - from >= 0 && y0 + r - from < H) g[y0 + r - from][x0 + x] = ch; } };
  let body = BODY.slice(0, 11);
  if (o.ear) body = body.map((r, i) => (i < 5 ? EAR_DOWN[i] + r.slice(5) : r));
  if (o.tail) { body = body.map((r) => r.replace(/^.{3}/, (s) => s.replace(/T/g, '.'))); for (const [i, s] of TAIL_UP) body[i] = s + body[i].slice(3); }
  put(hatRows, 0, 1 + dy);
  put(body, 0, 5 + dy);
  put(LEGS[o.legs] || LEGS.stand, 0, 16);
  const col = (x, y) => g[y] && g[y][x];
  const draw = []; // [x, y, color] encima de la plantilla
  const px = (x, y, w, hh, c) => { for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) draw.push([x + i, y + j + 1 + dy, c]); };
  if (blink) { draw.push([11, 6 + dy, pal.G], [12, 6 + dy, pal.G]); }
  if (m.acc) { const Y = 5 + dy, K = pal.k, at = (x, r, cc) => draw.push([x, Y + r, cc]);
    if (m.acc === 'glasses') { for (const [x, r] of [[10, 1], [10, 2], [13, 1], [13, 2], [11, 0], [12, 0], [11, 3], [12, 3], [9, 1]]) at(x, r, K); }
    if (m.acc === 'patch') { for (const [x, r] of [[11, 1], [12, 1], [11, 2], [12, 2], [10, 0], [9, 0], [13, 0], [14, -1]]) at(x, r, '#1b1622'); }
    if (m.acc === 'moustache') { for (const x of [13, 14, 15, 16]) at(x, 4, '#5a3a2a'); at(12, 5, '#5a3a2a'); at(16, 5, '#5a3a2a'); }
    if (m.acc === 'blush') { at(9, 3, '#ff7a9c'); at(10, 3, '#ff7a9c'); } }
  const sc = SCARF[Math.min(3, m.rank)];
  // Bufanda: rodea el cuello (luz y sombra) y se anuda delante; nada cae por la espalda.
  if (sc) { px(5, 9, 8, 1, sc[0]); px(5, 10, 8, 1, sc[1]); px(12, 10, 2, 1, sc[0]); px(13, 11, 1, 2, sc[1]); }
  // Master: medalla con su cinta y un brillo.
  if (m.rank === 2) { px(9, 11, 2, 1, '#e2462f'); px(9, 12, 2, 2, '#e0a020'); px(9, 12, 1, 1, '#fff3a0'); }
  // Manager: chaleco con corbata y una tablilla pequeña sujeta por la pata.
  if (m.rank >= 3) {
    px(9, 11, 3, 3, '#2b2f4a'); px(10, 11, 1, 3, '#ffcf2e');
    if (!o.book && !o.glass && !o.wheel && !o.hold) { px(13, 10, 4, 5, '#1b1622'); px(14, 11, 2, 3, '#f4f4f4'); px(14, 12, 2, 1, '#9aa3b8'); px(14, 10, 2, 1, '#ffcf2e'); px(13, 12, 1, 1, pal.G); }
  }
  // Libro de entrenamiento en las patas: tapas violeta, páginas claras y una que se levanta al pasarla.
  if (o.book) {
    // Tapas de cuero rojizo (no se confunden con la bufanda violeta) y páginas crema abiertas en V.
    const B = { r: '#c0502e', R: '#7a2a1c', W: '#fff6dc', w: '#d9c38a' };
    const rows = o.book === 2 ? ['...W...', 'W..W..W', 'WWwRwWW', 'rWWRWWr', '.rrRrr.'] : ['.......', 'W.....W', 'WWwRwWW', 'rWWRWWr', '.rrRrr.'];
    rows.forEach((r, j) => [...r].forEach((ch, i) => ch !== '.' && px(13 + i, 7 + j, 1, 1, B[ch])));
    px(12, 10, 1, 1, pal.G); px(13, 11, 1, 1, pal.G);
  }
  // Rueda dorada en el pecho (Grand Master): queso con brillo, sostenida con las dos patas.
  if (o.wheel) {
    const C = { y: '#ffcf2e', Y: '#ffe55c', W: '#fffbe0', '!': '#e0a020', O: '#8a5a0a' };
    ['..yyy..', '.yYWYy.', 'yYYYYYy', 'y!!!!!O', '.!!!!O.'].forEach((r, j) => [...r].forEach((ch, i) => ch !== '.' && px(13 + i, 7 + j, 1, 1, C[ch])));
    px(12, 10, 1, 1, pal.G); px(13, 11, 1, 1, pal.G);
  }
  // Lupa (lista vacía): aro de latón, cristal con brillo y mango hasta la pata.
  if (o.glass) {
    const R = '#c98a12', r = '#ffd84a', L = '#cfeefa', l = '#ffffff';
    px(16, 7, 2, 1, r); px(15, 8, 1, 2, r); px(18, 8, 1, 2, R); px(16, 10, 2, 1, R); px(16, 8, 1, 1, l); px(17, 8, 1, 2, L); px(16, 9, 1, 1, L);
    px(15, 11, 1, 1, '#8e6234'); px(14, 12, 1, 1, '#8e6234'); px(13, 12, 1, 1, pal.G);
  }
  // Ascenso: destello dorado encima de la cabeza.
  if (o.spark) for (const [x, y, cc] of [[17, 0, '#ffcf2e'], [16, 1, '#ffcf2e'], [17, 1, '#ffffff'], [18, 1, '#ffcf2e'], [17, 2, '#ffcf2e']]) draw.push([x, y, cc]);
  // Expresiones: solo ojos, boca y mejillas (fila r del cuerpo = 5 + dy + r).
  if (o.face) {
    const Y = 5 + dy, K = pal.k, G = pal.G, W = '#ffffff', at = (x, r, cc) => draw.push([x, Y + r, cc]);
    if (o.face === 'happy') { at(11, 1, K); at(12, 1, K); at(10, 2, K); at(13, 2, K); at(11, 2, G); at(12, 2, G); at(9, 4, '#ff9ab5'); at(10, 4, '#ff9ab5'); }
    if (o.face === 'grump') { at(10, 0, K); at(11, 1, K); at(12, 1, K); }
    if (o.face === 'wow') { at(11, 0, K); at(12, 0, K); at(11, 1, K); at(12, 1, W); at(14, 4, '#5a1a2a'); }
    if (o.face === 'sleep') { at(11, 1, G); at(12, 1, G); at(10, 1, K); at(13, 1, K); at(11, 2, K); at(12, 2, K); }
    if (o.face === 'down') { at(11, 1, G); at(12, 1, G); at(11, 2, K); at(12, 2, W); }
  }
  const c = document.createElement('canvas'); c.width = W + 2; c.height = H + 2;
  const x2 = c.getContext('2d');
  const filled = (x, y) => !!col(x, y) || draw.some((d) => d[0] === x && d[1] === y);
  for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) {
    if (col(x, y)) { x2.fillStyle = pal[col(x, y)] || '#f0f'; x2.fillRect(x + 1, y + 1, 1, 1); }
    else if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) { x2.fillStyle = pal.o; x2.fillRect(x + 1, y + 1, 1, 1); }
  }
  for (const [x, y, cc] of draw) { x2.fillStyle = cc; x2.fillRect(x + 1, y + 1, 1, 1); }
  return c;
}
// Silueta (puesto vacío): la misma plantilla, en un solo tono.
function ghostCanvas() {
  const c = mouseCanvas({ name: 'ghost', rank: 0, rar: 0, skill: '' });
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3]) { d.data[i] = 150; d.data[i + 1] = 140; d.data[i + 2] = 180; }
  x.putImageData(d, 0, 0); return c;
}

// ---------- Iconos pequeños de la pantalla (contorno automático) ----------
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

// ---------- Datos (colonia de prueba avanzada) y estados de ejemplo ----------
const RANKS = ['Apprentice', 'Journeyman', 'Master', 'Manager'];
const RANK_I = { Apprentice: 0, Journeyman: 1, Master: 2, Manager: 3 };
const JOB = { mining: ['MINE', 'ic_pick'], drilling: ['DRILL', 'ic_raw_cheddar'], refining: ['REFINE', 'ic_base'], cheesemaking: ['CHEESE', 'ic_lot'], trading: ['SELL', 'ic_coin'], research: ['LAB', 'ic_flask'] };
const ZONES = [
  ['cheddar', 'Cheddar', 80, 8, ['#3a3022', '#5a4a30', '#241c14'], '#30291f', [['mining', 'Biscuit', 30, 'Master', 0, 0, 5.7, { due: 1 }], ['drilling', 'Muenster', 49, 'Manager', 0, 2, 14.3], ['refining', 'Monty', 51, 'Manager', 0, 0, 7.4, { bed: 29 }], ['cheesemaking', 'Tilly', 51, 'Manager', 0, 0, 12.4, { gm: 1 }]], [0, 2]],
  ['gouda', 'Gouda', 65, 5, ['#3a2a20', '#5a3e2a', '#24180f'], '#33251c', [['mining', 'Curd', 31, 'Master', 0, 1, 6.5, { due: 1 }], ['drilling', 'Paneer', 49, 'Manager', 0, 0, 4.3], ['refining', 'Feta', 49, 'Manager', 0, 1, 3.8, { train: 12 }], ['cheesemaking', 'Pepper', 49, 'Manager', 2, 0, 13.5]], []],
  ['brie', 'Brie', 58, 2, ['#34322c', '#504c42', '#201e1a'], '#2e2c27', [['mining', 'Fondue', 30, 'Master', 0, 1, 4.1], ['drilling', 'Roque', 49, 'Manager', 0, 1, 4.5], ['refining', null], ['cheesemaking', 'Pip', 52, 'Manager', 0, 1, 16.2]], []],
  ['emmental', 'Emmental', 56, 6, ['#30331f', '#4a4f2e', '#1e2012'], '#2b2e1d', [['mining', 'Rind', 33, 'Master', 0, 2, 7.2], ['drilling', 'Nacho', 50, 'Manager', 1, 1, 10.3], ['refining', 'Mozza', 49, 'Manager', 0, 1, 8.8], ['cheesemaking', 'Rye', 50, 'Manager', 0, 1, 12]], []],
  ['parmesan', 'Parmesan', 47, 6, ['#3a2e22', '#56442f', '#241a12'], '#32281e', [['mining', 'Sage', 28, 'Master', 0, 0, 5.1], ['drilling', 'Ricotta', 50, 'Manager', 0, 0, 8.5], ['refining', 'Squeak', 50, 'Manager', 0, 0, 8.1], ['cheesemaking', 'Truffle', 52, 'Manager', 0, 0, 6.7]], [0, 1, 2], true],
  ['blue', 'Blue', 39, 6, ['#262c3a', '#3a4458', '#161a24'], '#232836', [['mining', 'Hazel', 26, 'Master', 2, 0, 16.3], ['drilling', 'Colby', 53, 'Manager', 0, 1, 6.2], ['refining', 'Nibbles', 49, 'Manager', 0, 0, 10], ['cheesemaking', 'Jack', 49, 'Manager', 1, 0, 10.7]], [0, 2], true],
];
// Combos reales de cada roca. sets: los cuatro de la roca (condición, efecto); pairs: entre vecinos.
const CMB = {
  cheddar: { sets: [['Old Guard', 'Four Masters or better', '+30% faster'], ['Specialists', 'All four have their job speciality', '+25% more']],
    pairs: [['Night Crew', '+50% faster away', 'Biscuit', 'Muenster'], ['Muscle', '+20% more', 'Biscuit', 'Muenster'], ['Dinner Table', '+25% more', 'Biscuit', 'Muenster'],
      ['Good Cop, Bad Cop', '+20% faster', 'Monty', 'Tilly'], ['Lucky Streak', '+10% double', 'Tilly', 'Swiss'], ['Muscle', '+20% more', 'Tilly', 'Swiss'],
      ['Good Cop, Bad Cop', '+20% faster', 'Tilly', 'Gus'], ['Assembly Line', '+15% faster', 'Monty', 'Gus']], gain: ['+30% faster', '+25% more'], n: 8, np: 6 },
  gouda: { sets: [['Old Guard', 'Four Masters or better', '+30% faster'], ['Under the Crown', 'A legendary mouse leads this rock', '+10% faster'], ['Specialists', 'All four have their job speciality', '+25% more']],
    pairs: [['Lucky Streak', '+10% double', 'Pepper', 'Swiss'], ['Night Crew', '+50% faster away', 'Feta', 'Gus']], gain: ['+40% faster', '+25% more'], n: 5, np: 2 },
  brie: { sets: [], pairs: [['Lucky Streak', '+10% double', 'Pip', 'Swiss'], ['Assembly Line', '+15% faster', 'Pip', 'Gus']], gain: [], n: 2, np: 2 },
  emmental: { sets: [['Dream Team', 'Everyone likes their job', '+20% faster'], ['Old Guard', 'Four Masters or better', '+30% faster'], ['Under the Crown', 'A legendary mouse leads this rock', '+10% faster'], ['Specialists', 'All four have their job speciality', '+25% more']],
    pairs: [['Night Crew', '+50% faster away', 'Rye', 'Swiss'], ['Night Crew', '+50% faster away', 'Rye', 'Gus'], ['Assembly Line', '+15% faster', 'Mozza', 'Gus']], gain: ['+60% faster', '+25% more'], n: 6, np: 2 },
  parmesan: { sets: [['Old Guard', 'Four Masters or better', '+30% faster'], ['Specialists', 'All four have their job speciality', '+25% more']],
    pairs: [['Dinner Table', '+25% more', 'Sage', 'Ricotta'], ['Assembly Line', '+15% faster', 'Ricotta', 'Squeak'], ['Master and Apprentice', '+15% faster', 'Squeak', 'Truffle'], ['Gossip', '+20% faster away', 'Truffle', 'Swiss']], gain: ['+30% faster', '+25% more'], n: 6, np: 4 },
  blue: { sets: [['Old Guard', 'Four Masters or better', '+30% faster'], ['Under the Crown', 'A legendary mouse leads this rock', '+10% faster'], ['Specialists', 'All four have their job speciality', '+25% more']],
    pairs: [['Lucky Streak', '+10% double', 'Hazel', 'Colby'], ['Good Cop, Bad Cop', '+20% faster', 'Nibbles', 'Jack'], ['Assembly Line', '+15% faster', 'Jack', 'Gus']], gain: ['+40% faster', '+25% more'], n: 6, np: 3 },
};
const COMBOS = { cheddar: 'Night Crew · Muscle · Dinner Table +5', gouda: 'Early Shift · Sweet Tooth · Mentors +2', brie: 'Quiet Floor · Lucky Line +1', emmental: 'Muscle · Holey Gang +2', parmesan: 'Old Hands · Cellar Kings', blue: 'Moonlight · Deep Crew +1' };
const mk = (row) => row[1] ? { skill: row[0], name: row[1], lv: row[2], rankName: row[3], rank: RANK_I[row[3]], rar: row[4], aff: row[5], mult: row[6], st: row[7] || {} } : { skill: row[0], empty: true };

// ---------- Componentes ----------
const anims = []; // [canvas visible, ratón] para respirar y parpadear
function mouseEl(m, cls = '') {
  const frames = [mouseCanvas(m, 0), mouseCanvas(m, 1), mouseCanvas(m, 0, true)];
  const c = document.createElement('canvas'); c.width = 22; c.height = 20; c.className = cls;
  c.getContext('2d').drawImage(frames[0], 0, 0);
  // Fotogramas de gesto bajo demanda, guardados por clave: cada variante se dibuja una sola vez.
  const cache = {};
  const get = (dy, blink, o) => { const k = dy + (blink ? 'b' : '') + JSON.stringify(o); return (cache[k] ||= mouseCanvas(m, dy, blink, o)); };
  anims.push({ c, m, frames, get, off: Math.random() * 3000 });
  return c;
}
const fmtX = (n) => 'x' + (n >= 10 ? Math.round(n) : (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, ''));

// ---------- FICHA DEL RATÓN · V2 ----------
// Mismos bloques que cardView del juego (panels.js). Solo arte y animación: ninguna cifra ni regla cambia.
IC.heartE = () => icon(['.rR.rr.', 'r..r..R', 'r.....R', '.r...R.', '..r.R..', '...R...'], { r: '#5b546d', R: '#4a4260' });
IC.arrowR = () => icon(['..l....', '..gl...', 'lggggl.', 'gggggGl', 'GGGGGG.', '..GG...', '..G....'], { l: '#c8ffc0', g: '#62d36e', G: '#2f8f44' });
IC.back = () => icon(['..w', '.wS', 'wS.', '.wS', '..w'], { w: '#d6d0e6', S: '#9f97b8' });
const coinSrc = 'out/sprites/ic_coin.png';
const coin = (w = 14) => `<img class="pix" src="${coinSrc}" alt="" style="width:${w}px;height:${w}px">`;
const JOBS6 = ['mining', 'drilling', 'refining', 'cheesemaking', 'trading', 'research'];
const JNAME = { mining: 'Mining', drilling: 'Drilling', refining: 'Refining', cheesemaking: 'Cheesemaking', trading: 'Trading', research: 'Research' };
const jobIc = (k, zone) => (k === 'drilling' ? 'ic_raw_' + (zone && zone !== 'all' ? zone : 'cheddar') : k === 'cheesemaking' || k === 'refining' ? (k === 'refining' ? 'ic_base_' : 'ic_lot_') + (zone && zone !== 'all' ? zone : 'cheddar') : JOB[k][1]);
const hearts = (n, max = 2) => { const w = document.createElement('span'); w.className = 'hh'; for (let i = 0; i < max; i++) w.appendChild(toImg(i < n ? IC.heart() : IC.heartE(), 1)); return w; };
const ROMAN2 = ['', 'I', 'II', 'III'];
const ZWALL = { cheddar: '#30291f', gouda: '#33251c', brie: '#2e2c27', emmental: '#2b2e1d', parmesan: '#32281e', blue: '#232836', all: '#2a2433' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const phoneK = () => document.getElementById('phone').getBoundingClientRect().width / 375;

// Silueta blanca (transformación del ascenso).
function whiteOf(src) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fffbe8'; x.fillRect(0, 0, c.width, c.height); return c;
}
// Píxeles de efecto: cuadrados que saltan y caen (confeti, polvo, astillas). Duran lo que duran y se borran solos.
function burst(layer, x, y, n, colors, { spread = 34, up = 30, size = 4, dur = 700, fall = 18 } = {}) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'fc-px'; p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
    layer.appendChild(p);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = spread * (0.6 + Math.random() * 0.5);
    const dx = Math.round(Math.cos(a) * r / 2) * 2, dy = Math.round((Math.sin(a) * r - up * Math.random()) / 2) * 2;
    p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 1, offset: 0.55 }, { transform: `translate(${dx}px,${dy + fall}px)`, opacity: 0 }], { duration: dur + Math.random() * 200, easing: 'steps(8)' });
    setTimeout(() => p.remove(), dur + 260);
  }
}
function floatText(layer, x, y, html, cls = 'fc-bang', dur = 900, rise = 14) {
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
  aha: { dur: 900, start(H) { floatText(H.nfx, HEAD.x + 8, HEAD.y - 2, '!', 'fc-bang', 900, 6); }, frame(e, F) { F.face = 'wow'; F.ty = e < 300 ? -1 : 0; } },
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

// ---------- Datos: Biscuit, el que ROSTER marca con PROMOTE ----------
const BIS0 = { name: 'Biscuit', lv: 41, rank: 2, rar: 0, skill: 'mining', zone: 'cheddar', mult: 5.7, xp: [1910, 3220], kind: 'fidget',
  aff: { mining: 0, drilling: 2, refining: 0, cheesemaking: 1, trading: 0, research: 0 },
  rate: 'a x1.7 swing every 1.1 s',
  traits: [
    { k: 'g', nm: 'Heavy Hands', d: 'Makes 35% more', bad: 'works 10% slower' },
    { k: 'q', nm: 'Picky', d: 'Makes 15% less', but: 'works 5% faster' },
    { k: 'g', nm: 'Strong', d: 'Makes 20% more each time' },
    { k: 'g', nm: 'Veteran', d: '3% faster for every 10 levels of the skill it works' },
    { k: 'g', nm: 'Nocturnal', d: '50% faster while you are away' },
  ],
  specs: [
    { job: 'mining', nm: 'Pick Master', grade: 2, d: 'Swings faster', nums: ['+10%', '+17.5%', '+25%'], unit: 'speed', jobs: 6480, next: 20000, from: 2000 },
    { job: 'drilling', jobs: 140, next: 200, from: 0 },
  ],
  combos: [
    { nm: 'Night Crew', d: 'Both work 50% faster while you are away', who: 'Muenster', how: 'With Muenster · side by side' },
    { nm: 'Muscle', d: 'Both make 20% more', who: 'Muenster', how: 'With Muenster · side by side' },
    { nm: 'Dinner Table', d: 'Both make 25% more', who: 'Muenster', how: 'With Muenster · side by side' },
    { nm: 'Old Guard', d: 'All four work 30% faster', rock: 'cheddar', how: 'The four of Cheddar · same rock' },
    { nm: 'Specialists', d: 'All four make 25% more', rock: 'cheddar', how: 'The four of Cheddar · same rock' },
  ],
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const RAWS = { Muenster: [49, 3, 0], Tilly: [52, 3, 0], Hazel: [27, 2, 2] };
const byName = (n) => ({ name: n, lv: RAWS[n][0], rank: RAWS[n][1], rar: RAWS[n][2], skill: 'mining' });

// ---------- Bloques ----------
function heroEl(m, st = '', live = false) {
  const el = document.createElement('div'); el.className = 'box fc-hero';
  const nn = document.createElement('div'); nn.className = 'fc-niche' + (m.rar ? ' r' + m.rar : '') + (st ? ' ' + st : '');
  nn.style.setProperty('--zw2', m.zone ? ZWALL[m.zone] : '#2a2433');
  nn.innerHTML = '<i class="bricks"></i><i class="shadow"></i>';
  const c = document.createElement('canvas'); c.width = 22; c.height = 20; c.className = 'm'; nn.appendChild(c);
  const nfx = document.createElement('div'); nfx.className = 'fc-nfx'; nn.appendChild(nfx);
  if (st === 'bed') nn.insertAdjacentHTML('beforeend', '<span class="zz" style="left:66%;top:14px">Z</span><span class="zz" style="left:78%;top:26px;animation-delay:1s">z</span>');
  if (m.rar === 2) for (let i = 0; i < 3; i++) { const sp = document.createElement('i'); sp.className = 'spark'; sp.style.left = [12, 84, 70][i] + '%'; sp.style.top = [24, 36, 12][i] + '%'; sp.style.animationDelay = i * 0.5 + 's'; nn.appendChild(sp); }
  const id = document.createElement('div'); id.className = 'fc-id';
  const pct = Math.round((m.xp[0] / m.xp[1]) * 100);
  id.innerHTML = `<span class="fc-name"><b>${m.name}</b></span>` +
    `<span class="fc-who"><span class="rk"></span><span class="rn">${RANKS[m.rank]}</span><span class="rar r${m.rar}">· ${['Common', 'Rare', 'Legendary'][m.rar]}</span></span>` +
    `<span class="fc-lv"><b><small>LV</small><span class="lvn">${m.lv}</span></b><span class="xpn">${m.xp[0].toLocaleString('en')} / ${m.xp[1].toLocaleString('en')} XP</span></span>` +
    `<span class="fc-xp"><i style="width:${pct}%"></i></span>`;
  if (m.rank) id.querySelector('.rk').appendChild(toImg(IC['rank' + m.rank](), 2));
  if (m.gm) id.querySelector('.fc-name').appendChild(toImg(IC.star(), 2));
  const hfx = document.createElement('div'); hfx.className = 'fc-hfx';
  el.append(nn, id, hfx);
  const H = makeHero(m, c, nn, nfx, hfx); H.state = st; HEROES.push(H);
  nn.onclick = () => { if (!H.act || ['fidget', 'look', 'hop', 'tap', 'cheer', 'dream', 'nibble', 'doze', 'page'].includes(H.act.name)) H.play(H.state === 'bed' ? 'dream' : 'pet'); };
  el._hero = H;
  return el;
}
const HEROES = [];
function jobEl(m) {
  const el = document.createElement('div');
  if (m.free) {
    el.className = 'box fc-job none';
    el.innerHTML = `<span class="t"><span class="k">UNASSIGNED</span><span class="p">In the Mouse House</span><span class="r">It only works and levels up on a post</span></span><span class="act go">ASSIGN</span>`;
    return el;
  }
  el.className = 'box fc-job';
  el.innerHTML = jobInner(m);
  return el;
}
function jobInner(m) {
  const where = (m.zone === 'all' ? 'Colony' : m.zone[0].toUpperCase() + m.zone.slice(1)) + ' · ' + JOB[m.skill][0][0] + JOB[m.skill][0].slice(1).toLowerCase();
  return `<span class="t"><span class="k">WORKS AT</span><span class="p"><img class="pix" src="out/sprites/${jobIc(m.skill, m.zone)}.png" alt="">${where}<span class="x">${fmtX(m.mult)}</span></span><span class="r">${m.rate}</span></span><span class="act">MOVE</span>`;
}
function affEl(m) {
  const w = document.createElement('div'); w.className = 'fc-aff';
  for (const k of JOBS6) {
    const n = m.aff[k] || 0;
    const i = document.createElement('i'); i.className = 'a' + n + (k === m.skill && !m.free ? ' here' : ''); i.dataset.job = k;
    i.innerHTML = `<img class="pix" src="out/sprites/${jobIc(k, m.zone)}.png" alt=""><em>${JOB[k][0]}</em>`;
    i.appendChild(hearts(n)); w.appendChild(i);
  }
  return w;
}
function legendEl() {
  const d = document.createElement('div'); d.className = 'fc-legend';
  const one = document.createElement('span'); one.append(hearts(1, 1), document.createTextNode('Likes +7%'));
  const two = document.createElement('span'); two.append(hearts(2, 2), document.createTextNode('Loves +15% faster'));
  d.append(one, two); return d;
}
// Ascenso compacto: los dos nichos juntos (antes → después), lo que gana al lado y el botón.
function promoEl(m, kind = 'ready', onGo) {
  const el = document.createElement('div'); el.className = 'box fc-promo ' + kind;
  const nextR = Math.min(3, m.rank + 1), next = { ...m, rank: nextR };
  if (kind === 'wait') {
    el.innerHTML = `<div class="fc-ph"><b>${RANKS[nextR].toUpperCase()} AT LV 40</b><small>Rank ${nextR + 1} of 4</small></div>` +
      `<div class="fc-wait"><span class="bar"><i style="width:80%"></i></span><small>3 levels to go, then ${coin(10)} 20M</small></div>`;
    return el;
  }
  el.innerHTML = `<div class="fc-ph"><b></b><small>Rank ${nextR + 1} of 4</small></div>` +
    `<div class="fc-pbody"><div class="fc-pstage"><figure class="fc-pfig now"><span class="st"></span></figure><figure class="fc-pfig to"><span class="st"></span></figure><span class="fc-parrow"></span></div>` +
    `<ul class="fc-gains"><li>Works 13% faster here</li><li><span><b>AUTO-UPGRADES:</b> buys its job's cheapest upgrades</span></li><li>New look: suit, gold tie, clipboard</li></ul></div>` +
    `<div class="fc-go${kind === 'short' ? ' off' : ''}">PROMOTE TO ${RANKS[nextR].toUpperCase()}<span>${coin()}20M${kind === 'short' ? ' · 4.1M short' : ''}</span></div>`;
  const hb = el.querySelector('.fc-ph b');
  if (kind === 'ready') hb.appendChild(toImg(IC.up(), 2)); hb.append(kind === 'ready' ? 'PROMOTION READY' : 'PROMOTION · SAVE UP');
  const [a, b] = el.querySelectorAll('.fc-pfig .st');
  const ca = mouseEl(m), cb = mouseEl(next); a.appendChild(ca); b.appendChild(cb);
  a.appendChild(Object.assign(toImg(IC['rank' + m.rank](), 2), { className: 'pix ins' }));
  b.appendChild(Object.assign(toImg(IC['rank' + nextR](), 2), { className: 'pix ins' }));
  if (kind === 'ready') for (let i = 0; i < 3; i++) { const tw = document.createElement('i'); tw.className = 'tw'; tw.style.left = [10, 58, 40][i] + 'px'; tw.style.top = [14, 22, 6][i] + 'px'; tw.style.animationDelay = i * 0.6 + 's'; b.appendChild(tw); }
  el.querySelector('.fc-parrow').appendChild(toImg(IC.arrowR(), 2));
  if (onGo && kind === 'ready') el.querySelector('.fc-go').onclick = onGo;
  return el;
}
function careEl(m, kind) {
  const el = document.createElement('div'); el.className = 'box fc-care ' + kind;
  if (kind === 'bed') el.innerHTML = `<div class="h"><b>THE BED</b><small class="left">29:59 left</small></div><p>Treating <span style="color:#ff8a96;font-weight:800">▼ Picky</span>. It keeps working at Cheddar · Mine.</p><span class="bar"><i style="width:1%"></i></span>`;
  else el.innerHTML = `<div class="h"><b>TRAINING ROOM</b><small class="left">29:59 left</small></div><p>Retraining <b style="color:#9cc0f4">Pick Master II</b> → <span class="q">? II</span> random among the other 4, keeps grade II.</p><span class="bar"><i style="width:1%"></i></span>`;
  el.querySelector('.h b').prepend(toImg(kind === 'bed' ? IC.bed() : IC.book(), 2));
  return el;
}
function gmEl(kind = 'other') {
  const el = document.createElement('div'); el.className = 'box fc-gm' + (kind !== 'other' ? ' on' : '');
  if (kind === 'mine') el.innerHTML = `<span class="t"><b>GRAND MASTER</b><small>No grade yet. Next grade at 20K batches cooked (now 0).</small><small class="warn">The title only counts while it cooks: put it on a Cheesemaking post.</small></span>`;
  else if (kind === 'other') el.innerHTML = `<span class="t"><b>GRAND MASTER</b><small>Tilly holds the title. This one: no grade yet (0 of 20K batches cooked).</small></span><span class="act">GIVE IT<br>THE TITLE</span>`;
  else el.innerHTML = `<span class="t"><b>GRAND MASTER II</b><small>The cheese it cooks is worth +20%. Next grade at 80K batches cooked (now 52K).</small>${kind === 'idle' ? '<small class="warn">The title only counts while it cooks: put it on a Cheesemaking post.</small>' : ''}</span>`;
  el.querySelector('b').prepend(toImg(IC.star(), 2));
  return el;
}
function secEl(title, count, body, open, sub = '') {
  const el = document.createElement('div'); el.className = 'box fc-sec' + (open ? ' open' : '');
  el.innerHTML = `<div class="fc-sh"><span class="t"><b>${title}</b>${count !== '' ? `<i>${count}</i>` : ''}${sub ? `<span class="sub">${sub}</span>` : ''}</span><span class="act"></span></div><div class="fc-sb"><div><div></div></div></div>`;
  const act = el.querySelector('.act');
  el.paint = () => { const o = el.classList.contains('open'); act.textContent = o ? 'HIDE' : 'SHOW'; act.appendChild(toImg(o ? IC.chevU() : IC.chevD(), 2)); };
  el.open = () => { if (!el.classList.contains('open')) { el.classList.add('open'); el.paint(); } };
  el.querySelector('.fc-sh').onclick = () => { el.classList.toggle('open'); el.paint(); };
  el.paint();
  el.querySelector('.fc-sb > div > div').append(...body);
  el.body = el.querySelector('.fc-sb > div > div');
  return el;
}
function btnEl(cls, label, small) { const b = document.createElement('span'); b.className = 'fc-btn ' + cls; b.innerHTML = `<b>${label}</b>${small ? `<small>${small}</small>` : ''}`; return b; }
const treatBtn = (st) => st === 'on' ? btnEl('bed on', 'RESTING', '29:59 left') : st === 'busy' ? btnEl('busy', 'HOUSE BUSY', '11:40') : btnEl('bed' + (st === 'short' ? ' short' : ''), 'TREAT', coin(10) + '54K');
const retrainBtn = (st) => st === 'on' ? btnEl('train on', 'TRAINING', '29:59 left') : st === 'busy' ? btnEl('busy', 'HOUSE BUSY', '24:10') : btnEl('train' + (st === 'short' ? ' short' : ''), 'RETRAIN', coin(10) + '135K');
function traitRow(m, t, treat = 'can') {
  const r = document.createElement('div'); r.className = 'fc-tr ' + t.k; r.dataset.nm = t.nm;
  const mark = t.k === 'q' ? '▼ ' : t.k === 'l' ? '★ ' : '';
  const desc = t.k === 'q' ? `<span class="bad">${t.d}</span>${t.but ? ', but ' + t.but : ''}` : t.d + (t.bad ? `, but <span class="bad">${t.bad}</span>` : '');
  r.innerHTML = `<span class="t"><b>${mark}${t.nm}${t.isNew ? '<span class="fc-new">NEW</span>' : ''}</b><span>${desc}</span></span>`;
  if (t.isNew) r.querySelector('.fc-new').prepend(toImg(IC.spk(), 1));
  if (t.k === 'q') r.appendChild(treatBtn(treat));
  return r;
}
// Las especialidades viven solo en SPECIALITIES (el juego tampoco las lista en TRAITS): aquí una línea que remite.
function traitsBody(m, treat = 'can') {
  const out = m.traits.map((t) => traitRow(m, t, treat));
  const h = document.createElement('p'); h.className = 'fc-hint';
  h.textContent = 'Next trait at LV 50, shaped by its jobs. A quirk can be treated in the bed: 30 min, and it keeps working.';
  out.push(h); return out;
}
function specRow(m, s, retrain = 'can') {
  const el = document.createElement('div'); el.className = 'fc-sp' + (s.nm ? '' : ' none'); el.dataset.job = s.job;
  const pct = Math.round(Math.min(1, (s.jobs - s.from) / (s.next - s.from)) * 100);
  el.innerHTML = `<div class="h"><b><img class="pix" src="out/sprites/${jobIc(s.job, m.zone)}.png" alt="">${JNAME[s.job]}<span class="hs"></span></b>${s.nm ? `<span class="gr">GRADE ${ROMAN2[s.grade]}</span>` : ''}</div>` +
    (s.nm ? `<span class="n">${s.nm}</span><span class="d">${s.d}: ${s.nums.map((n, i) => (i + 1 === s.grade ? `<u>${n}</u>` : n)).join(' / ')} ${s.unit}</span>` : '<span class="d">No speciality yet.</span>') +
    `<span class="bar"><i style="width:${pct}%"></i></span>` +
    `<div class="foot"><small>${s.jobs.toLocaleString('en')} / ${s.next >= 1000 ? s.next / 1000 + 'K' : s.next} jobs to ${s.nm ? 'grade ' + ROMAN2[s.grade + 1] : 'a speciality'}${s.nm ? '<br>Retrain: random among the other 4, keeps grade ' + ROMAN2[s.grade] + '.' : ''}</small></div>`;
  el.querySelector('.hs').appendChild(hearts(m.aff[s.job] || 0));
  if (s.nm) el.querySelector('.foot').appendChild(retrainBtn(retrain));
  return el;
}
const specsBody = (m, retrain) => m.specs.map((s) => specRow(m, s, retrain));
function combosBody(m) {
  return m.combos.map((c) => {
    const el = document.createElement('div'); el.className = 'fc-cb';
    el.innerHTML = `<span class="who"></span><span class="t"><b>${c.nm}</b><span>${c.d}</span><span>${c.how}</span></span><span class="chip">+${c.d.match(/\d+%/)[0]}</span>`;
    const w = el.querySelector('.who');
    if (c.who) { const f = document.createElement('i'); f.className = 'mini'; f.appendChild(mouseEl(byName(c.who))); w.appendChild(f); }
    else w.innerHTML = `<img class="pix" src="out/sprites/ic_raw_${c.rock}.png" alt="" style="width:21px">`;
    return el;
  });
}
function rankBody(m) {
  const w = document.createElement('div'); w.className = 'fc-rank';
  const g = document.createElement('div'); g.className = 'fc-rk';
  [['Apprentice', 'LV 1'], ['Journeyman', 'LV 10'], ['Master', 'LV 25'], ['Manager', 'LV 40']].forEach(([n, l], i) => {
    const c = document.createElement('i'); c.className = i < m.rank ? 'done' : i === m.rank ? 'now' : i === m.rank + 1 ? 'next' : '';
    if (i) c.appendChild(toImg(IC['rank' + i](), 2)); else c.insertAdjacentHTML('beforeend', '<span style="height:12px"></span>');
    c.insertAdjacentHTML('beforeend', `<em>${n}</em><small>${l}</small>`); g.appendChild(c);
  });
  const p = document.createElement('p'); p.className = 'fc-hint'; p.textContent = 'Each rank makes it faster for good. A Manager buys its job\'s cheapest upgrades on its own.';
  w.append(g, p); return w;
}



// ---------- UPGRADES TREE · TODOS LOS ÁRBOLES ----------
// Igual que treePanel del juego, para los siete árboles: cabecera (nivel y xp; el laboratorio, su vuelta al lab; la
// colonia, sus rocas), BUY EVERYTHING de ese árbol, la nota de qué compra cada cosa, el objetivo del siguiente hito
// (Cheesemaking) y las ramas con cada mejora: rango, qué hace, «Now / Next» y su botón con el precio, o el motivo del
// bloqueo, o MAX / DONE. Costes, topes y requisitos de balance.js; los valores de «Now / Next» y el estado (rangos,
// monedas) son de ejemplo. Solo arte y animación.
const sheetEl = () => document.querySelector('.sheet');
function ptOf(el, dx = 0, dy = 0) { const k = phoneK(), s = sheetEl().getBoundingClientRect(), r = el.getBoundingClientRect(); return [(r.left - s.left + r.width / 2) / k + dx, (r.top - s.top + r.height / 2) / k + dy]; }
const sfxL = () => { let l = document.querySelector('.fc-sfx'); if (!l) { l = document.createElement('div'); l.className = 'fc-sfx'; sheetEl().appendChild(l); } return l; };
const fmtN = (n) => { const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']; let i = 0; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10) + u[i]; };
const coinI = (w = 11) => `<img class="pix" src="out/sprites/ic_coin.png" alt="" style="width:${w}px;height:${w}px">`;
const r1 = (n) => (Math.round(n * 10) / 10).toString();

// ---------- Avisos y efectos con medida (los aprobados) ----------
// Avisos: en cola, uno a la vez (el siguiente entra cuando el anterior se ha ido), sin repetir. Los importantes nunca se
// pierden; si la cola pasa de 4, los menores se juntan en «N updates: …». Partículas: tope global en pantalla.
const TQ = []; let tBusy = false, tEl = null;
const plain = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
function toast(html, cls = '', important = false) {
  if (TQ.some((q) => q.html === html) || (tBusy && tEl && tEl._html === html)) return;
  TQ.push({ html, cls, important, items: [plain(html)] });
  if (TQ.length > 4) { const minor = TQ.filter((q) => !q.important); if (minor.length >= 2) { const items = minor.flatMap((q) => q.items); for (const q of minor) TQ.splice(TQ.indexOf(q), 1); TQ.push({ html: `<b>${items.length} updates:</b> ${items.join(' · ')}`, cls: '', important: false, items }); } }
  if (!tBusy) nextToast();
}
function nextToast() {
  if (tEl) { const old = tEl; tEl = null; if (!reduced) old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'steps(3)', fill: 'forwards' }); setTimeout(() => { old.remove(); nextToast(); }, reduced ? 0 : 150); return; }
  const q = TQ.shift(); if (!q) { tBusy = false; return; }
  tBusy = true; const t = document.createElement('div'); t.className = 'fc-toast ' + q.cls; t.innerHTML = q.html; t._html = q.html; sheetEl().appendChild(t); tEl = t;
  if (!reduced) t.animate([{ opacity: 0, transform: 'translate(-50%, -6px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 140, easing: 'steps(3)' });
  setTimeout(nextToast, TQ.length ? 1300 : 2000);
}
const _burst = burst;
burst = (layer, x, y, n, ...rest) => { const live = document.querySelectorAll('.fc-px').length; if (live > 70) return; return _burst(layer, x, y, Math.min(n, 70 - live), ...rest); };

const IMG = (src) => { const i = new Image(); i.src = src; return i; };

// ==== ad/02_engine_v41.js ====
// ---------- MAIN 2.0 · V4.1 · GAME FEEL, ANIMACIÓN Y PULIDO DE ARTE (exploración, no implementación) ----------
// Consolidación de V4 sobre B (terrazas abiertas, candidata provisional). Solo Cheddar con arte piloto; la superficie y Gouda son
// de V3, como contexto de navegación. Primero la lógica: todo lo que pasa en Cheddar sale de una simulación espejo con las reglas
// reales de MINE, DRILL, REFINE, CHEESE y SELL (cifras de ejemplo, rotuladas). Nada se anima si el juego no lo hace.
const $c = (i) => document.getElementById(i);
const PRESETS = [
  { k: 'a', w: 375, h: 812, d: '375 × 812 · pantalla completa' },
  { k: 'b', w: 375, h: 635, d: '375 × 635 · iPhone en Safari, con barras (aprox.)' },
  { k: 'c', w: 360, h: 640, d: '360 × 640 · Android en Chrome, con barras (aprox.)' },
  { k: 'd', w: 320, h: 568, d: '320 × 568 · iPhone SE (1.ª gen.)' },
  { k: 'e', w: 320, h: 460, d: '320 × 460 · iPhone SE en Safari (aprox.)' },
];
let PRE = PRESETS[1], OPT = 'B', ALT = 'A', BIG = false, DPRS = 3, TUT = true, SOUND = true, SHOWHITS = false, SHOWPATHS = false, NOSEL = false;
const CW = 144;
const IMC = {};
const im = (src) => (IMC[src] ||= Object.assign(new Image(), { src: src.startsWith('out/') ? M2_BASE + src : src }));
const SPR = { rockcheddar: 'out/sprites/big_cheddar_c0.png', rockgouda: 'out/sprites/big_gouda_c0.png', swingP: 'out/anims/swing_gold.png', house: 'out/anims/phouse.png', lab: 'out/anims/plab.png', swingM: 'out/anims/swing_miner.png', crate: 'out/sprites/crate_raw.png' };
const ROCKC = [0, 1, 2, 3, 4].map((i) => `out/sprites/big_cheddar_c${i}.png`), ROCKV = [1, 2, 3, 4, 5].map((i) => `out/sprites/big_cheddar_v${i}.png`);
[...Object.values(SPR), ...ROCKC, ...ROCKV, 'out/sprites/ic_pick.png'].forEach(im);
['raw', 'base', 'lot'].forEach((k) => ['cheddar', 'gouda', 'brie'].forEach((z) => im(`out/sprites/ic_${k}_${z}.png`)));
const CREW = {
  cheddar: { miner: { name: 'Colby', lv: 53, rank: 2, rar: 0, skill: 'mining' }, driller: { name: 'Paneer', lv: 49, rank: 1, rar: 0, skill: 'drilling' }, refiner: { name: 'Monty', lv: 52, rank: 2, rar: 0, skill: 'refining' }, cook: { name: 'Tilly', lv: 52, rank: 3, rar: 0, skill: 'cheesemaking' } },
  gouda: { miner: { name: 'Curd', lv: 47, rank: 1, rar: 0, skill: 'mining' }, driller: { name: 'Roque', lv: 49, rank: 3, rar: 0, skill: 'drilling' }, refiner: { name: 'Feta', lv: 49, rank: 1, rar: 1, skill: 'refining' }, cook: { name: 'Pepper', lv: 49, rank: 3, rar: 2, skill: 'cheesemaking' } },
  town: { keeper: { name: 'Swiss', lv: 52, rank: 3, rar: 1, skill: 'trading' }, sci: { name: 'Gus', lv: 52, rank: 2, rar: 0, skill: 'research' }, idle: { name: 'Poppy', lv: 49, rank: 1, rar: 0, skill: 'mining' } },
};
const MC = {};
const mF = (m, dy, blink, o = {}) => { const k = m.name + dy + (blink ? 'b' : '') + JSON.stringify(o); return (MC[k] ||= mouseCanvas(m, dy, blink, o)); };
const TH = {
  cheddar: { wall: '#7a5534', wallD: '#5a3c24', wallL: '#93693f', strata: '#86603a', speck: '#4a3020', back: '#3a2a1c', backD: '#2c1f14', backL: '#4a3624', beam: '#a06a38', beamL: '#c08a50', beamD: '#6a4220', lamp: '#ffd27a', floor: '#6a4a2a', floorL: '#8a6438', floorD: '#3e2a16', metal: '#c0663a', metalL: '#e08a5a', metalD: '#7a3a1c', recess: '#1e150d', plane: ['#6e4e2c', '#7c5a34', '#8a663c'], seam: '#4a321c', lip: '#a07a48', far: '#241a12', farD: '#1a120c', light: '#ffe0a0', layers: ['#8a6a44', '#7a5a38', '#6c4e30', '#5e4228', '#503820', '#432e1a'], crystal: '#ffcf5a', name: 'CHEDDAR' },
  gouda: { wall: '#5a626c', wallD: '#40464e', wallL: '#77818c', strata: '#666e78', speck: '#2e3238', back: '#2a3036', backD: '#1e2328', backL: '#343b42', beam: '#b08a3a', beamL: '#d0aa5a', beamD: '#6a5220', lamp: '#8ff3d0', floor: '#4e565e', floorL: '#6a747e', floorD: '#2a3036', metal: '#c8a040', metalL: '#f0d070', metalD: '#7a5a18', recess: '#14181c', plane: ['#565e68', '#626c76', '#6e7882'], seam: '#353b42', lip: '#8a949e', far: '#161a1f', farD: '#101317', light: '#bff0ff', layers: ['#727a84', '#666e77', '#5a626b', '#4f565e', '#444a51', '#3a3f45'], crystal: '#7ff0d0', masonry: true, wax: '#c0392b', name: 'GOUDA' },
};
const hash = (n) => { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
const jag = (x, seed, amp) => Math.floor(hash(Math.floor(x / 3) * 7919 + seed * 104729) * (amp + 1));
const DEP = { cheddar: 81, gouda: 23 };
const TIERS = [10, 25, 45, 70, 100];
const tierOf = (d) => TIERS.filter((x) => d >= x).length;

// ---- Paradas y geometría ----
const HGT = { A: { town: 126, district: 166 }, B: { town: 126, district: 150 } };
let STOPS = [];
function buildStops() {
  let y = 0;
  STOPS = [{ id: 'town', kind: 'town', h: 126 }, { id: 'cheddar', kind: 'pilot', z: 'cheddar', h: 160 }, { id: 'gouda', kind: 'district', z: 'gouda', h: 150 }, { id: 'brie', kind: 'locked', h: 60 }];
  for (const s of STOPS) { s.top = y; y += s.h; }
}
function geoT(st) {
  const t = st.top, o = SC.ox, GR = t + 78;
  return { t, o, GR, vis: [t + 20, t + st.h], zones: { up: [t + 20, GR + 10], down: [GR - 12, t + st.h] },
    st: { house: [[o + 19, GR - 55, 38, 46]], lab: [[o + 61, GR - 39, 34, 41]], shop: [[o + 88, GR - 52, 44, 56]], storage: [[o + 12, GR + 14, 84, 24], [o + 42, GR - 9, 13, 10]] },
    who: { idle: [o + 34, GR - 9, 'house'], sci: [o + 66, GR + 5, 'lab'], keeper: [o + 108, GR - 6, 'shop'] },
    floors: [], links: [], legs: [] };
}
function geoB(st) {
  const t = st.top, o = SC.ox, n = tierOf(DEP[st.z]), dp = n * 4;
  const TL = t + 46, TR = t + 58, BR = t + 64, FF = t + 118, rx = o + 40, rb = FF + 4 + dp;
  return { t, o, n, dp, TL, TR, BR, FF, rx, rb, vis: [t + 6, t + st.h - 2], zones: { up: [t + 6, t + 76], down: [t + 40, t + st.h - 2] },
    st: { rock: [[rx + 4, rb - 37, 48, 39]], drill: [[o + 56, BR - 24, 40, 28]], refinery: [[o + 2, t + 12, 50, TL + 8 - t - 12]], cheesery: [[o + 92, t + 16, 42, TR + 8 - t - 16]] },
    who: { driller: [o + 60, BR, 'drill'], refiner: [o + 8, TL + 8, 'refinery'], cook: [o + 106, TR + 8, 'cheesery'] },
    floors: [], links: [], legs: [] };
}
// Cheddar piloto. Coordenadas en píxeles de arte; x desde SC.ox, y desde lo alto de la parada.
function geoC(st) {
  const t = st.top, o = SC.ox, n = tierOf(DEP.cheddar), dp = n * 4;
  const TL = t + 48, TR = t + 60, DK = t + 56, FF = t + 128, rx = o + 40, rb = FF + 4 + dp + Math.round(S.drop || 0);
  return { t, o, n, dp, TL, TR, DK, FF, rx, rb, X0: o + 26, X1: o + 108, vis: [t + 6, t + st.h - 2], zones: { up: [t + 6, t + 80], down: [t + 50, t + st.h - 2] },
    st: { rock: [[rx + 2, rb - 38, 52, 40]], drill: [[o + 50, DK - 44, 58, 56]], refinery: [[o + 0, t + 18, 48, TL + 14 - t - 18]], cheesery: [[o + 98, t + 20, 36, TR + 14 - t - 20]] },
    mine: [o + 30, rb - 56, 88, 60],
    focus: { rock: [o + 22, t + 66, 92, rb + 8 - t - 66], drill: [o + 40, t + 8, 68, 92], refinery: [o - 2, t + 10, 58, TL + 18 - t - 10], cheesery: [o + 90, t + 16, 54, TR + 18 - t - 16] },
    who: { miner: [rx + 12, rb - 36, 'rock'], driller: [o + 76, DK + 3, 'drill'], refiner: [o + 4, TL + 11, 'refinery'], cook: [o + 100, TR + 11, 'cheesery'] },
    walk: { miner: [rx + 2, rx + 16], driller: [o + 50, o + 76], refiner: [o + 0, o + 8], cook: [o + 96, o + 124] },
    floors: [{ x0: o + 0, x1: o + 46, y: TL + 11, lane: true }, { x0: o + 48, x1: o + 98, y: DK + 3, lane: true }, { x0: o + 98, x1: o + 134, y: TR + 11, lane: true }, { x0: o + 0, x1: o + 26, y: FF + 10, lane: true }, { x0: o + 108, x1: o + 134, y: FF + 10, lane: true }],
    links: [[o + 8, TL + 14, o + 8, FF + 10], [o + 111, FF + 10, o + 111, TR + 11], [o + 139, TR + 11, o + 139, FF + 10]],
    legs: [[[o + 50, rb - 36], [o + 66, rb - 36], [o + 108, FF + 10], [o + 111, FF + 10], [o + 111, TR + 11], [o + 98, TR + 11], [o + 76, DK + 3]], [[o + 76, DK + 3], [o + 48, DK + 3], [o + 14, TL + 11]], [[o + 14, TL + 11], [o + 48, TL + 11], [o + 98, DK + 3], [o + 110, TR + 11]], [[o + 110, TR + 11], [o + 136, TR + 11]]] };
}
const GEO = (st) => (st.kind === 'town' ? geoT(st) : st.kind === 'pilot' ? geoC(st) : st.kind === 'district' ? geoB(st) : { t: st.top, o: SC.ox, vis: [st.top, st.top + st.h], zones: {}, st: {}, who: {}, floors: [], links: [], legs: [] });
const UPPER = { refinery: 1, cheesery: 1 };
const STATIONS = { town: ['shop', 'lab', 'house', 'storage'], pilot: ['rock', 'drill', 'refinery', 'cheesery'], district: ['rock', 'drill', 'refinery', 'cheesery'], locked: [] };

// ---- Escala, cámara y los dos modos (exploración / estación) ----
// Exploración: la parada entera, a la escala base. Estación: la cámara se acerca a la estación elegida, a la mayor escala nítida
// que la deja entera (como mucho 3,5 px CSS por píxel de arte). El alto del panel no cambia nunca.
let SC = { d: 7, s: 7 / 3, LW: 160, ox: 8, worldW: 160 };
const cv = $c('mc-cv'), stg = $c('mc-stage');
let ctx = cv.getContext('2d');
let S = { stop: 1, focus: null, station: 'rock', dist: 'rock', camX: 0, camY: 0, k: 7 / 3, camTo: null, combo: 0, lastHit: -1e9, acts: 0, flash: {}, drop: 0, dropStart: 0, dropT0: 0 };
const comboOn = () => S.combo >= 3 && performance.now() - S.lastHit <= 650;
function layout() {
  document.documentElement.style.setProperty('--pw', PRE.w + 'px'); document.documentElement.style.setProperty('--ph', PRE.h + 'px');
  $c('mc-goal').hidden = !TUT;
  const dC = Math.max(1, Math.floor((PRE.w * DPRS) / CW)), d = BIG ? Math.max(dC + 1, Math.round(3 * DPRS)) : dC;
  const s = d / DPRS, LW = PRE.w / s, ox = Math.max(0, Math.floor((LW - CW) / 2));
  SC = { d, s, LW, ox, worldW: Math.max(LW, ox + CW) };
  buildStops();
  const dpr = devicePixelRatio || 1, W = stg.clientWidth, H = stg.clientHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  fitPhone(); const t = camTarget(S.stop); S.camX = t.x; S.camY = t.y; S.k = t.k; S.camTo = null; paintLabels(); updateDock();
}
function fitPhone() { const f = $c('fit'), k = Math.min(1, f.parentElement.clientWidth / PRE.w); $c('phone').style.transform = k < 1 ? `scale(${k})` : ''; f.style.height = PRE.h * k + 'px'; }
addEventListener('resize', fitPhone);
const viewH = () => stg.clientHeight / S.k, viewW = () => stg.clientWidth / S.k;
const NAVR = () => ($c('mc-nav').offsetHeight || 36) + 10;
function camTarget(i, key = S.focus) {
  const st = STOPS[i], g = GEO(st), W = stg.clientWidth, H = stg.clientHeight, top = NAVR(), last = STOPS[STOPS.length - 1], end = last.top + last.h + 8;
  if (key) {
    const r = (g.focus && g.focus[key]) || (() => { const q = (g.st[key] || [[SC.ox, st.top, CW, st.h]])[0]; return [q[0] - 10, q[1] - 12, q[2] + 20, q[3] + 22]; })();
    const kmax = Math.floor(Math.min(W / r[2], (H - top - 6) / r[3]) * DPRS) / DPRS, k = Math.max(SC.s, Math.min(3.5, kmax));
    const vw = W / k, vh = H / k; let x = r[0] + r[2] / 2 - vw / 2, y = r[1] + r[3] / 2 - (vh + top / k) / 2;
    x = SC.worldW >= vw ? Math.max(0, Math.min(SC.worldW - vw, x)) : (SC.worldW - vw) / 2;
    if (r[3] * k > H - top) y = r[1] - top / k;
    y = Math.max(y, st.top - top / k);
    return { x, y: Math.min(y, end - vh), k };
  }
  const k = SC.s, vh = H / k, vw = W / k, room = vh - top / k, fit = (a, b) => (b - a <= room ? a - top / k - (room - (b - a)) / 2 : null);
  let y = fit(...g.vis);
  if (y === null) { const zk = st.kind === 'town' ? (S.station === 'storage' ? 'down' : 'up') : UPPER[S.station] ? 'up' : 'down', z = g.zones[zk] || g.vis; y = fit(...z); if (y === null) y = zk === 'up' ? z[0] - top / k : z[1] - vh; }
  return { x: SC.worldW > vw + 0.5 ? (SC.worldW - vw) / 2 : 0, y: Math.round(Math.min(y, end - vh)), k };
}
function moveCam(t, ms = 240) { S.camTo = { fx: S.camX, fy: S.camY, fk: S.k, tx: t.x, ty: t.y, tk: t.k, t0: performance.now(), ms }; }

// ---- Primitivas ----
const INK = '#1b1220';
const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
function box(x, y, w, h, c, ink = INK) { R(x - 1, y - 1, w + 2, h + 2, ink); R(x, y, w, h, c); }
function sprite(src, fw, f, x, y, w, h, flip) { const i = im(src); if (!i.complete || !i.width) return; const n = Math.max(1, Math.floor(i.width / fw)); const fx = ((f % n) + n) % n; if (flip) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(i, fx * fw, 0, w, h, 0, 0, w, h); ctx.restore(); } else ctx.drawImage(i, fx * fw, 0, w, h, x, y, w, h); }
function mouse(m, x, feet, now, flip, o = {}) { const ph = (m.name.length * 431) % 900, dy = Math.floor((now + ph) / 650) % 2, blink = (now + ph * 3) % 3300 < 110; const c = mF(m, o.legs ? 0 : dy, blink, o); if (flip) { ctx.save(); ctx.translate(x + 22, feet - 20); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore(); } else ctx.drawImage(c, x, feet - 20); }
function disc(cx, cy, r, c, a = 1) { ctx.globalAlpha = a; ctx.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1); } ctx.globalAlpha = 1; }
function glow(cx, cy, c, r = 18) { disc(cx, cy, r, c, 0.05); disc(cx, cy, Math.round(r * 0.66), c, 0.06); disc(cx, cy, Math.round(r * 0.36), c, 0.09); }
function line(x0, y0, x1, y1, c, w = 1) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy; ctx.fillStyle = c; for (let k = 0; k < 999; k++) { ctx.fillRect(x0, y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
const DIG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
function digits(str, x, y, c) { ctx.fillStyle = c; [...String(str)].forEach((ch, i) => { const b = DIG[ch]; if (b) for (let k = 0; k < 15; k++) if (b[k] === '1') ctx.fillRect(x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1); }); }
// Cartel de profundidad (el número del juego): madera en Cheddar, latón en Gouda.
function plaque(x, y, n, th) { const w = 8 + String(n).length * 4 + 1, c = th.masonry ? th.metalD : '#3a2410'; box(x, y, w, 9, th.masonry ? th.metal : th.beam); R(x, y, w, 1, th.masonry ? th.metalL : th.beamL); R(x + 3, y + 2, 1, 3, c); R(x + 2, y + 5, 3, 1, c); R(x + 3, y + 6, 1, 1, c); digits(n, x + 7, y + 2, c); return w; }
function pipeSeg(ax, ay, bx, by) { const x = Math.min(ax, bx), y = Math.min(ay, by), w = Math.abs(bx - ax), h = Math.abs(by - ay); R(x - 2, y - 2, w + 5, h + 5, INK); R(x - 1, y - 1, w + 3, h + 3, '#5a5468'); if (h > w) R(x - 1, y - 1, 1, h + 3, '#8a8496'); else R(x - 1, y - 1, w + 3, 1, '#8a8496'); }
function pipePath(P) { for (let i = 1; i < P.length; i++) pipeSeg(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]); }

// ---- Terreno (se pinta una vez por parada, pantalla y tramo de profundidad, en un lienzo aparte) ----
const BG = {};
function baked(st, painter) {
  const key = OPT + st.id + (st.z ? tierOf(DEP[st.z]) : '') + SC.worldW.toFixed(2) + ':' + SC.ox;
  if (!BG[key]) { const c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.translate(0, -st.top); const was = ctx; ctx = g; try { painter(st); } finally { ctx = was; } BG[key] = c; }
  ctx.drawImage(BG[key], 0, st.top);
}
function rockMass(x0, y0, w, h, th, seed) {
  R(x0, y0, w, h, th.wall);
  for (let k = 0; k < 3; k++) { const sy = y0 + Math.floor(h * (0.2 + k * 0.3)); for (let x = x0; x < x0 + w; x++) { const yy = sy + Math.round(Math.sin((x + seed * 7) * 0.09 + k) * 2); R(x, yy, 1, 2, k % 2 ? th.wallD : th.strata); } }
  for (let y = y0; y < y0 + h; y += 2) for (let x = x0; x < x0 + w; x += 2) { const v = hash(x * 31 + y * 977 + seed); if (v < 0.05) R(x, y, 2, 1, th.speck); else if (v > 0.985) { R(x, y, 3, 2, th.wallL); R(x, y + 2, 3, 1, th.wallD); } }
}
function backWall(x0, y0, w, h, th) {
  R(x0, y0, w, h, th.back);
  if (th.masonry) { for (let y = y0 + 1, r = 0; y < y0 + h; y += 6, r++) { R(x0, y, w, 1, th.backD); for (let x = x0 + (r % 2) * 5; x < x0 + w; x += 10) { R(x, y, 1, 6, th.backD); R(x + 1, y + 1, 8, 1, th.backL); } } }
  else for (let y = y0; y < y0 + h; y += 3) for (let x = x0; x < x0 + w; x += 3) { const v = hash(x * 13 + y * 71); if (v < 0.1) R(x, y, 2, 1, th.backD); else if (v > 0.97) R(x, y, 1, 1, th.backL); }
}
function blendBand(x0, y0, w, h, c2) { for (let y = 0; y < h; y++) for (let x = x0; x < x0 + w; x++) if (hash(x * 97 + (y0 + y) * 13) < y / h) R(x, y0 + y, 1, 1, c2); }
// Bóveda: techo redondeado de una cavidad excavada (alta en el centro, baja hacia los lados).
const vault = (x0, x1, apex, side, seed) => (x) => { const m = (x0 + x1) / 2, h = (x1 - x0) / 2, u = Math.min(1, Math.abs(x + 0.5 - m) / h); return Math.round(apex + (side - apex) * Math.pow(u, 2.6)) + (hash(Math.floor(x / 3) * 31 + seed) < 0.25 ? 1 : 0); };
// Cavidad: se recorta del macizo con su techo (en escalera de píxeles), pared del fondo, luz de sus faroles y canto oscuro.
function cave(x0, x1, ceil, fy, th, lamps = []) {
  let top = 1e9; for (let x = x0; x < x1; x++) top = Math.min(top, ceil(x));
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0, fy); for (let x = x0; x < x1; x++) { const c = ceil(x); ctx.lineTo(x, c); ctx.lineTo(x + 1, c); } ctx.lineTo(x1, fy); ctx.closePath(); ctx.clip();
  backWall(x0, top, x1 - x0, fy - top, th); for (const [lx, ly, r] of lamps) glow(lx, ly, th.lamp, r || 18);
  ctx.restore();
  for (let x = x0; x < x1; x++) { const c = ceil(x); R(x, c - 1, 1, 1, th.wallD); ctx.globalAlpha = 0.32; R(x, c, 1, 3, '#000'); ctx.globalAlpha = 1; }
}
function floorA(x0, x1, fy, th, k = 4) { R(x0, fy, x1 - x0, k, th.floor); R(x0, fy, x1 - x0, 1, th.floorL); R(x0, fy + k, x1 - x0, 1, th.floorD); for (let x = x0 + 3; x < x1; x += th.masonry ? 8 : 11) R(x, fy + 1, 1, k - 1, th.floorD); }
function timber(x, y0, y1, th) { box(x, y0, 3, y1 - y0, th.beam); R(x, y0, 1, y1 - y0, th.beamL); R(x + 2, y0, 1, y1 - y0, th.beamD); }
function hangLamp(x, y, th, len = 5) { R(x + 1, y - len, 1, len, INK); box(x, y, 3, 3, th.lamp); R(x, y + 3, 3, 1, th.beamD); }
function wallLamp(x, y, th) { box(x, y + 2, 4, 1, th.metalD); box(x + 1, y - 1, 2, 3, th.lamp); }
function postLamp(x, base, th, h = 20) { box(x + 1, base - h, 1, h, th.beamD); box(x - 1, base - h - 4, 5, 4, th.lamp); R(x - 1, base - h - 5, 5, 1, th.beamD); }
function drip(x, y, len, c) { for (let i = 0; i < len; i++) R(x + (i > len - 3 ? 1 : 0), y + i, i > len - 3 ? 1 : 2, 1, c); }
function root(x, y, len, seed) { for (let i = 0; i < len; i++) R(x + Math.round(Math.sin(i * 0.8 + seed) * 1.2), y + i, 1, 1, '#4a2e18'); }
function ladder(x, y0, y1, th) { R(x, y0, 1, y1 - y0, th.beam); R(x + 6, y0, 1, y1 - y0, th.beam); for (let y = y0 + 2; y < y1; y += 4) R(x + 1, y, 5, 1, th.beamL); }
// Escalera vista de lado, de (x0, y0) abajo a (x1, y1) arriba, peldaños de 4 px.
function stairs(x0, y0, x1, y1, th, base) { const n = Math.max(1, Math.round((y0 - y1) / 4)), dx = (x1 - x0) / n; for (let i = 0; i < n; i++) { const x = Math.round(x0 + dx * (i + 0.5)), y = y0 - (i + 1) * 4, w = Math.max(4, Math.ceil(Math.abs(dx)) + 2); const xx = x - (w >> 1); R(xx, y, w, (base ?? y0) - y, th.floorD); R(xx, y, w, 2, th.floor); R(xx, y, w, 1, th.floorL); } }
// Plano en perspectiva (B): tres tonos de atrás a delante, juntas que fugan y canto iluminado.
function plane(x0, x1, y, th, FD = 12) { const b = Math.ceil(FD / 3); th.plane.forEach((c, i) => R(x0, y + i * b, x1 - x0, Math.min(b, FD - i * b), c)); for (let x = x0 - FD; x < x1; x += th.masonry ? 9 : 12) for (let k = 0; k < FD; k++) { const xx = x + Math.floor(k * 0.6); if (xx >= x0 && xx < x1) R(xx, y + k, 1, 1, th.seam); } R(x0, y, x1 - x0, 1, th.lip); R(x0, y + FD - 1, x1 - x0, 1, th.lip); }
function sky(st, ya, yb) { const W = Math.ceil(SC.worldW), t = st.top; ['#2f3a58', '#384566', '#425076', '#4c5b82', '#56668c'].forEach((c, i) => { const y0 = Math.max(ya, t - 160 + i * 40), y1 = Math.min(yb, t - 120 + i * 40); if (y1 > y0) R(0, y0, W, y1 - y0, c); }); if (yb > t + 40) R(0, Math.max(ya, t + 40), W, yb - Math.max(ya, t + 40), '#5e6f96'); if (ya < t - 160) R(0, ya, W, t - 160 - ya, '#2f3a58'); for (let i = 0; i < 14; i++) { const x = Math.floor(hash(i * 77) * W), y = t - 150 + Math.floor(hash(i * 13) * 170); if (y >= ya && y < yb) R(x, y, 1, 1, '#d8e0f4'); } }
const SOIL = { wall: '#5a4a3a', wallD: '#463728', wallL: '#6e5a44', strata: '#64503c', speck: '#3a2c20' };
function crates(x, base, n, c, m) { for (let i = 0; i < n; i++) { const y = base - 5 - i * 5, dx = i % 2; box(x + dx, y, 8, 4, c); R(x + dx, y, 8, 1, m); R(x + dx + 3, y + 2, 2, 1, m); } }
const PILES = (x, base) => { crates(x, base, 5, '#c98a2e', '#ffd27a'); crates(x + 12, base, 4, '#e8dcb0', '#fff8e0'); crates(x + 24, base, 3, '#d93a4f', '#ffffff'); };
function storeroom(x, base, th) { box(x, base - 22, 36, 22, th.beam); for (let y = base - 19; y < base; y += 4) R(x, y, 36, 1, th.beamD); R(x, base - 22, 36, 1, th.beamL); box(x - 2, base - 25, 40, 3, th.beamD); R(x + 12, base - 15, 12, 15, INK); R(x + 13, base - 14, 10, 14, '#3a2a1c'); box(x + 3, base - 17, 6, 5, '#e8dcb0'); box(x + 27, base - 17, 6, 5, '#e8dcb0'); }

// ---- Superficie: un pueblo pequeño ----
// La casa en una loma, el laboratorio al pie, la tienda delante, junto al camino que baja a la mina. La despensa (PANTRY)
// es una bodega excavada bajo el pueblo: su puerta está en el frente de la loma. A: la boca de la mina es un castillete a la
// izquierda, sobre el pozo del montacargas; B: una grúa a la derecha, sobre la boca de la caverna.
function paintTown(st) {
  const g = geoT(st), { t, o, GR } = g, W = Math.ceil(SC.worldW), th = TH.cheddar;
  sky(st, t, GR);
  for (let x = 0; x < W; x++) { const h1 = 40 + Math.round(Math.sin(x * 0.035 + 1) * 10 + Math.sin(x * 0.11) * 4); R(x, GR - h1, 1, h1, '#3e4a64'); const h2 = 20 + Math.round(Math.sin(x * 0.06 + 3) * 6 + Math.sin(x * 0.17) * 2); R(x, GR - h2, 1, h2, '#4a5a72'); R(x, GR - h2, 1, 1, '#5c6e88'); }
  // Árbol detrás de la casa y el laboratorio.
  box(o + 54, GR - 30, 3, 30, '#5a3c22'); disc(o + 55, GR - 36, 10, '#2f5a2a'); disc(o + 52, GR - 39, 7, '#3e7034'); disc(o + 58, GR - 33, 5, '#3e7034'); R(o + 50, GR - 43, 3, 1, '#5a8a44');
  rockMass(0, GR + 8, W, t + st.h - GR - 8, SOIL, 7);
  ['#5a7a44', '#66884e'].forEach((c, i) => R(0, GR + i * 4, W, 4, c)); R(0, GR, W, 1, '#8ac25e'); R(0, GR + 8, W, 2, '#3a4a2a');
  // Camino de tierra: de la loma a la tienda y a la boca de la mina.
  const mineX = OPT === 'A' ? o + 6 : o + 138;
  for (let x = Math.min(mineX, o + 58); x < Math.max(mineX, o + 140); x++) { const y = GR + 3 + Math.round(Math.sin(x * 0.08) * 1.5); R(x, y, 1, 3, '#a08a5e'); if (hash(x * 7) < 0.15) R(x, y + 1, 1, 1, '#c8b488'); }
  for (let i = 0; i < 18; i++) { const x = o + Math.floor(hash(i * 41) * 144), y = GR + 1 + Math.floor(hash(i * 17) * 6); R(x, y, 1, 1, ['#ffd27a', '#ff8fb4', '#d8e0f4'][i % 3]); }
  // La loma de la casa, con su puerta de la bodega.
  for (let x = o + 12; x < o + 62; x++) { const u = x < o + 20 ? (x - (o + 12)) / 8 : x > o + 54 ? (o + 62 - x) / 8 : 1, h = Math.round(9 * Math.min(1, u)); if (h > 0) { R(x, GR - h, 1, h, '#4e6a3a'); R(x, GR - h, 1, 1, '#8ac25e'); } }
  R(o + 40, GR - 9, 16, 9, SOIL.wall); box(o + 42, GR - 8, 12, 8, '#6a4a2a'); R(o + 47, GR - 8, 1, 8, '#3e2a16'); R(o + 42, GR - 8, 12, 1, '#8a6438'); R(o + 44, GR - 5, 1, 1, '#ffd27a'); R(o + 50, GR - 5, 1, 1, '#ffd27a');
  // Banco y arbustos.
  box(o + 22, GR - 13, 10, 2, '#8a6438'); R(o + 23, GR - 11, 1, 2, '#5a3c22'); R(o + 30, GR - 11, 1, 2, '#5a3c22');
  for (const [x, y, r] of [[o + 14, GR - 3, 3], [o + 60, GR + 1, 3], [o + 86, GR + 2, 2]]) { disc(x, y, r, '#2f5a2a'); R(x - 1, y - r, 2, 1, '#5a8a44'); }
  postLamp(o + 88, GR + 6, th, 18); glow(o + 89, GR - 14, th.lamp, 10);
  // Bodega: escalera desde la puerta, pilas de cajas y el almacén.
  const cy0 = GR + 14, cfy = GR + 38;
  R(o + 12, cy0, 84, cfy - cy0, '#2c1f14'); for (let y = cy0; y < cfy; y += 3) for (let x = o + 12; x < o + 96; x += 3) if (hash(x * 13 + y * 71) < 0.1) R(x, y, 2, 1, '#22180f');
  ctx.save(); ctx.beginPath(); ctx.rect(o + 12, cy0, 84, cfy - cy0); ctx.clip(); glow(o + 72, cy0 + 6, th.lamp, 18); ctx.restore();
  R(o + 12, cy0, 84, 2, SOIL.wallD); floorA(o + 12, o + 96, cfy, th, 3);
  R(o + 44, GR + 8, 10, cy0 - GR - 8, '#2c1f14'); stairs(o + 56, cfy, o + 46, GR + 10, th, cfy);
  hangLamp(o + 72, cy0 + 5, th, 3);
  PILES(o + 14, cfy); storeroom(o + 58, cfy, th);
  // La boca de la mina.
  if (OPT === 'A') { const lx = o; R(lx, GR + 1, 10, t + st.h - GR - 1, '#14121a'); R(lx + 1, GR, 1, t + st.h - GR, '#5a5468'); R(lx + 8, GR, 1, t + st.h - GR, '#5a5468'); box(lx - 1, GR - 30, 2, 30, '#6a5a4a'); box(lx + 9, GR - 30, 2, 30, '#6a5a4a'); for (let k = 0; k < 4; k++) R(lx, GR - 26 + k * 7, 10, 1, '#6a5a4a'); box(lx - 2, GR - 32, 14, 3, '#8a6a4a'); box(lx + 2, GR - 37, 6, 6, '#c8c2d4'); R(lx + 4, GR - 35, 2, 2, '#5a5a68'); }
  else { const E = o + 132; R(E, GR, W - E, t + st.h - GR, '#241a12'); for (let k = 0; k < t + st.h - GR; k++) R(E - 1 - Math.round(k * 0.08), GR + k, 3, 1, SOIL.wallD); box(E - 6, GR - 34, 3, 36, '#6a5a4a'); box(E - 6, GR - 36, o + 146 - E + 6, 3, '#8a6a4a'); R(o + 135, GR - 33, 1, t + st.h - GR + 33, '#8a8496'); R(o + 142, GR - 33, 1, t + st.h - GR + 33, '#8a8496'); box(o + 136, GR - 39, 6, 4, '#c8c2d4'); }
  blendBand(0, t + st.h - 8, W, 8, OPT === 'A' ? TH.cheddar.wall : TH.cheddar.far);
}

// ---- B · colonia abierta en terrazas ----
function rawB(g) { const { o, t, BR } = g; return [[o + 86, BR + 3], [o + 52, BR + 3], [o + 52, t + 12], [o + 39, t + 12], [o + 39, t + 15]]; }
function baseB(g) { const { o, t, TR } = g; return [[o + 49, t + 36], [o + 98, t + 36], [o + 98, TR - 10]]; }
function paintDistrictB(st) {
  const th = TH[st.z], g = geoB(st), { t, o, TL, TR, BR, FF, n, dp } = g, W = Math.ceil(SC.worldW), seed = st.z === 'cheddar' ? 5 : 17, next = STOPS[STOPS.indexOf(st) + 1];
  // La caverna: la pared del fondo, lejos y oscura, con las luces de otras galerías.
  R(0, t, W, st.h, th.far); for (let y = t; y < t + st.h; y += 3) for (let x = 0; x < W; x += 4) if (hash(x * 7 + y * 13 + seed) < 0.08) R(x, y, 3, 1, th.farD);
  for (const [x, y] of [[o + 70, t + 24], [o + 64, t + 92], [o + 80, t + 104], [o + 74, t + 40]]) { R(x, y, 1, 1, th.lamp); ctx.globalAlpha = 0.22; R(x - 1, y - 1, 3, 3, th.lamp); ctx.globalAlpha = 1; }
  // Techo con estalactitas.
  rockMass(0, t, W, 7, th, seed); for (let x = 2; x < W; x += 9) drip(x + (x % 4), t + 7, 3 + jag(x, seed, 4), th.wallD);
  const cliff = (x0, x1, y0, y1, s) => { rockMass(x0, y0, x1 - x0, y1 - y0, th, s); if (th.masonry) for (let y = y0 + 2, r = 0; y < y1; y += 7, r++) { R(x0, y, x1 - x0, 1, th.wallD); for (let x = x0 + (r % 2) * 6; x < x1; x += 12) R(x, y, 1, 7, th.wallD); } else for (let x = x0 + 9; x < x1; x += 17) for (let y = y0 + 4 + (x % 7); y < y1 - 4; y += 2) R(x + (y % 3 ? 0 : 1), y, 1, 2, th.wallD); };
  // Terraza de la refinería (alta, a la izquierda) y de la quesería (más baja, a la derecha), con sus frentes hasta el suelo.
  cliff(0, o + 54, t + 7, TL, seed); plane(0, o + 56, TL, th); cliff(0, o + 54, TL + 12, FF, seed + 9); ctx.globalAlpha = 0.25; R(0, TL + 12, o + 54, FF - TL - 12, '#000'); ctx.globalAlpha = 0.45; R(0, TL + 12, o + 54, 3, '#000'); ctx.globalAlpha = 1;
  cliff(o + 92, W, t + 7, TR, seed + 3); plane(o + 90, W, TR, th); cliff(o + 92, W, TR + 12, FF, seed + 11); ctx.globalAlpha = 0.25; R(o + 92, TR + 12, W - o - 92, FF - TR - 12, '#000'); ctx.globalAlpha = 0.45; R(o + 92, TR + 12, W - o - 92, 3, '#000'); ctx.globalAlpha = 1;
  for (let k = 0; k < FF - TL; k++) R(o + 54 + Math.round(k * 0.05), TL + k, 2, 1, th.wallD);
  for (let k = 0; k < FF - TR; k++) R(o + 91 - Math.round(k * 0.05), TR + k, 2, 1, th.wallD);
  // Escaleras talladas en los frentes de las terrazas.
  for (let i = 0, y = TL + 12; y < FF - 2; i++, y += 6) { const sx = o + 12 + (i % 2 ? 8 : 0); R(sx, y, 14, 2, th.lip); R(sx, y + 2, 14, 3, th.wallD); R(sx, y + 5, 14, 1, INK); }
  for (let i = 0, y = TR + 12; y < FF - 2; i++, y += 6) { const sx = o + 110 + (i % 2 ? 8 : 0); R(sx, y, 14, 2, th.lip); R(sx, y + 2, 14, 3, th.wallD); R(sx, y + 5, 14, 1, INK); }
  // El suelo de la caverna, con la corta: un banco por tramo de profundidad, más estrecho y más oscuro cuanto más hondo.
  const X0 = o + 30, X1 = o + 108;
  rockMass(0, FF + 16, W, t + st.h - FF - 16, th, seed + 21);
  plane(0, W, FF, th, 16); R(0, FF + 16, W, 3, th.wallD); R(0, FF + 16, W, 1, th.wall);
  R(X0, FF + 1, X1 - X0, t + st.h - FF - 1, th.recess);
  for (let k = 0; k < n; k++) { const y = FF + 2 + k * 4, a = X0 + k * 3, b = X1 - k * 3; R(a, y, 3, t + st.h - y, th.layers[k]); R(b - 3, y, 3, t + st.h - y, th.layers[k]); R(a, y, 3, 1, th.lip); R(b - 3, y, 3, 1, th.lip); R(a + 3, y + 3, b - a - 6, 1, th.layers[k]); if (k >= 3) { R(a + 1, y + 2, 1, 2, th.crystal); R(b - 2, y + 1, 1, 2, th.crystal); } }
  const fx0 = X0 + n * 3, fx1 = X1 - n * 3, fy = FF + 4 + dp; plane(fx0, fx1, fy, th, 4); R(fx0, fy + 4, fx1 - fx0, t + st.h - fy - 4, th.layers[Math.min(5, n)]);
  ctx.globalAlpha = 0.07 * n; R(X0, FF + 2, X1 - X0, t + st.h - FF - 2, '#000'); ctx.globalAlpha = 1;
  // Escombrera junto a la corta: crece con la profundidad.
  const hh = 3 + n * 3; for (let k = 0; k < hh; k++) { const w = Math.round(22 * (1 - k / (hh + 2))); R(o + 120 - (w >> 1), FF + 9 - k, w, 1, k % 3 ? th.wall : th.wallL); }
  for (let i = 0; i < n * 3; i++) box(o + 112 + Math.floor(hash(i * 5) * 16), FF + 7 - Math.floor(hash(i * 9) * hh), 2, 1, th.wallL);
  // Puente entre las terrazas (de él cuelga la perforadora) y la escala de la terraza alta.
  R(o + 54, BR, 38, 3, th.beam); R(o + 54, BR, 38, 1, th.beamL); R(o + 54, BR + 3, 38, 1, INK); for (let x = o + 56; x < o + 92; x += 6) R(x, BR, 1, 3, th.beamD);
  R(o + 54, BR - 7, 38, 1, th.beamD); for (const x of [o + 55, o + 72, o + 90]) R(x, BR - 7, 1, 7, th.beamD);
  ladder(o + 52, TL + 12, BR, th);
  // Faroles en poste y cartel de profundidad junto a la corta.
  postLamp(o + 30, TL + 6, th); glow(o + 31, TL - 16, th.lamp, 16); postLamp(o + 126, TR + 6, th); glow(o + 127, TR - 16, th.lamp, 16); postLamp(o + 12, FF + 8, th, 16); glow(o + 13, FF - 10, th.lamp, 16);
  R(o + 22, FF - 6, 1, 14, th.beamD); plaque(o + 16, FF - 14, DEP[st.z], th);
  // Montacargas abierto a la derecha: cables y rellanos.
  R(o + 135, t, 1, st.h, '#8a8496'); R(o + 142, t, 1, st.h, '#8a8496'); for (const fy of [TR, FF]) { R(o + 132, fy + 2, 12, 2, th.metalD); R(o + 132, fy + 2, 12, 1, th.metal); }
  pipePath(rawB(g)); pipePath(baseB(g));
  if (!th.masonry) for (const x of [10, 36, 104, 130]) root(o + x, (x < 60 ? TL : TR) + 15, 4 + (x % 3), x);
  if (next) blendBand(0, t + st.h - 6, W, 6, next.kind === 'district' ? TH[next.z].far : '#1a1820');
  if (st.z === 'gouda') { ctx.globalAlpha = 0.14; R(0, t, W, st.h, '#000'); ctx.globalAlpha = 1; }
}
function paintLocked(st) {
  const W = Math.ceil(SC.worldW), o = SC.ox, t = st.top, chalk = { wall: '#bdb6a6', wallD: '#9a927f', wallL: '#d8d2c2', strata: '#cdc6b4', speck: '#8a826f' };
  if (OPT === 'B') { R(0, t, W, st.h, '#141218'); rockMass(0, t, o + 128, st.h - 10, chalk, 3); } else rockMass(0, t, W, st.h, chalk, 3);
  box(o + 44, t + 12, 44, 30, '#3a3644'); R(o + 46, t + 14, 40, 28, '#141218'); for (let x = o + 46; x < o + 86; x += 7) { R(x, t + 14, 5, 28, '#6a5a4a'); R(x, t + 14, 1, 28, '#8a7a64'); } R(o + 44, t + 22, 44, 3, '#4a4458'); R(o + 44, t + 32, 44, 3, '#4a4458');
  if (OPT === 'A') { R(o, t, 10, st.h, '#14121a'); R(o + 1, t, 1, st.h, '#5a5468'); R(o + 8, t, 1, st.h, '#5a5468'); } else { R(o + 135, t, 1, st.h, '#8a8496'); R(o + 142, t, 1, st.h, '#8a8496'); }
  for (let y = 0; y < st.h; y++) { ctx.globalAlpha = Math.min(0.85, (y / st.h) * 0.9); R(0, t + y, W, 1, '#0e0c12'); } ctx.globalAlpha = 1;
}

// ---- Edificios (bloques a validar, no arte final) ----
// Perforadora de bancada (A): patín, bastidor, motor, brazo y broca clavada en la roca, tolva debajo.
function rig(x, base, now, th) {
  box(x + 4, base - 4, 30, 4, '#3a3a46'); R(x + 4, base - 4, 30, 1, '#6a6a7a'); for (const bx of [6, 31]) R(x + bx, base - 3, 1, 1, '#a8a8ba');
  box(x + 26, base - 30, 3, 26, '#5a5a68'); box(x + 32, base - 30, 3, 26, '#5a5a68'); R(x + 26, base - 30, 1, 26, '#7a7a8a');
  box(x + 19, base - 34, 17, 10, '#e8b830'); R(x + 19, base - 26, 17, 2, '#a07a10'); R(x + 19, base - 34, 17, 1, '#ffe07a'); for (let i = 0; i < 3; i++) R(x + 22 + i * 4, base - 32, 2, 4, '#a07a10');
  box(x + 2, base - 22, 26, 5, '#7a7a8a'); R(x + 2, base - 22, 26, 1, '#a8a8ba'); for (let i = 0; i < 5; i++) R(x + 16 + i * 2, base - 20, 1, 2, i % 2 ? INK : '#e8b830');
  const spin = Math.floor(now / 70) % 3; box(x - 9, base - 21, 11, 3, '#d8dee8'); R(x - 11, base - 20, 2, 1, '#d8dee8'); for (let i = 0; i < 3; i++) R(x - 8 + i * 3 + spin, base - 20, 1, 1, '#5a6070');
  if (Math.floor(now / 140) % 2) { R(x - 13, base - 23, 1, 1, '#ffe6a0'); R(x - 12, base - 17, 1, 1, '#fff'); }
  box(x + 30, base - 18, 5, 7, '#2a2a36'); R(x + 31, base - 16, 2, 1, Math.floor(now / 500) % 2 ? '#62d36e' : '#2f6a34');
  R(x + 20, base - 12, 10, 1, INK); R(x + 21, base - 11, 8, 2, '#8a8496'); R(x + 22, base - 9, 6, 2, '#6a6474'); R(x + 23, base - 7, 4, 3, '#6a6474'); R(x + 21, base - 11, 8, 1, '#c98a2e');
}
// Cabrestante del puente (B): carro con motor sobre el puente; la sarta baja hasta la roca, y su largo es la profundidad.
function hoist(x, deck, tipY, now, th) {
  box(x, deck - 9, 12, 8, '#e8b830'); R(x, deck - 9, 12, 1, '#ffe07a'); R(x, deck - 3, 12, 2, '#a07a10'); for (let i = 0; i < 2; i++) R(x + 3 + i * 4, deck - 7, 2, 3, '#a07a10'); box(x + 9, deck - 13, 3, 4, '#5a5a68');
  const sx = x + 6; R(sx - 1, deck + 3, 3, tipY - deck - 6, INK); R(sx, deck + 3, 1, tipY - deck - 6, '#c8c2d4'); for (let y = deck + 6; y < tipY - 4; y += 6) R(sx - 1, y, 3, 1, '#8a8496');
  const spin = Math.floor(now / 70) % 3; box(sx - 2, tipY - 6, 5, 6, '#d8dee8'); for (let i = 0; i < 2; i++) R(sx - 2 + ((i + spin) % 3) * 2, tipY - 4 + i * 2, 1, 1, '#5a6070');
  if (Math.floor(now / 140) % 2) { R(sx - 4, tipY - 1, 1, 1, '#ffe6a0'); R(sx + 4, tipY - 2, 1, 1, '#fff'); }
}
// Refinería: horno de ladrillo con su boca de fuego y alambique de cobre con embudo (entra el Raw) y caño de la Base.
function still(x, base, now, th, ell) {
  box(x, base - 34, 18, 22, th.metal); R(x + 1, base - 34, 2, 22, th.metalL); R(x + 15, base - 34, 2, 22, th.metalD); R(x, base - 24, 18, 1, th.metalD); for (const ry of [base - 31, base - 17]) for (let i = 0; i < 18; i += 4) R(x + 1 + i, ry, 1, 1, th.metalL);
  if (ell) { box(x, base - 37, 18, 4, th.metalL); R(x + 2, base - 36, 14, 2, '#f4ecd0'); } else { box(x + 2, base - 37, 14, 3, th.metal); R(x + 3, base - 37, 4, 1, th.metalL); }
  R(x + 5, base - 41, 8, 1, INK); R(x + 6, base - 40, 6, 2, th.metalD); R(x + 7, base - 38, 4, 1, th.metalD);
  box(x + 2, base - 12, 14, 12, '#8a3a2a'); for (let i = 0; i < 14; i += 4) R(x + 2 + i, base - 9, 1, 3, '#5a221a'); R(x + 5, base - 7, 8, 6, INK); R(x + 6, base - 6, 6, 5, Math.floor(now / 120) % 2 ? '#ff8a2e' : '#ffd060'); R(x + 7, base - 3, 4, 2, '#fff3a0');
}
function furnace(x, base, w, h, now, th) {
  box(x, base - h, w, h, '#8a3a2a'); for (let y = base - h + 3; y < base; y += 4) { R(x, y, w, 1, '#5a221a'); for (let i = (y >> 2) % 2 ? 0 : 3; i < w; i += 6) R(x + i, y - 3, 1, 3, '#5a221a'); }
  const mw = Math.round(w * 0.45), mx = x + ((w - mw) >> 1); R(mx, base - 11, mw, 11, INK); R(mx + 1, base - 10, mw - 2, 10, Math.floor(now / 120) % 2 ? '#ff8a2e' : '#ffd060'); R(mx + 2, base - 5, mw - 4, 4, '#fff3a0');
}
function racks(x, w, rows, th, wax) { for (const sy of rows) { box(x, sy, w, 2, th.beam); for (let i = 0; i + 6 <= w; i += 7) { const wx = x + 1 + i; box(wx, sy - 4, 6, 4, '#ffcf2e', '#7a4a10'); R(wx, sy - 4, 6, 1, '#fff3a0'); if (wax) R(wx, sy - 2, 6, 1, th.wax); else R(wx + 2, sy - 2, 2, 1, '#c98a08'); } } }
function press(x, base, now, th, wax) { const p = Math.floor(now / 300) % 4 === 2 ? 1 : 0; box(x, base - 9, 18, 9, th.beam); R(x, base - 9, 18, 1, th.beamL); box(x + 4, base - 14 + p, 10, 5, '#ffcf2e', '#7a4a10'); R(x + 4, base - 14 + p, 10, 1, '#fff3a0'); if (wax) R(x + 4, base - 11 + p, 10, 1, th.wax); R(x + 8, base - 21, 2, 7 + p, '#8a8496'); box(x + 5, base - 22, 8, 1, '#5a5a68'); }
function vat(x, base, th) { box(x, base - 9, 10, 9, th.metal); R(x, base - 9, 10, 1, th.metalL); R(x + 2, base - 8, 6, 2, '#f4ecd0'); }
function liftCage(x, top, bottom, now, open) { const span = bottom - top - 12, p = (now / 4200) % 2, up = p < 1, cy = Math.round(bottom - 11 - span * (up ? p : 2 - p)); if (!open) R(x + 5, top, 1, cy - top, '#c8c2d4'); box(x + 2, cy, 6, 10, '#5a5a68'); R(x + 3, cy + 1, 4, 8, '#2a2a36'); R(x + 2, cy, 6, 1, '#8a8496'); if (up) { R(x + 3, cy + 5, 4, 3, '#ffcf2e'); R(x + 3, cy + 5, 4, 1, '#fff3a0'); } }
// Lo que circula: Raw (pepitas naranjas por su tubo), Base (bloques crema por el suyo) y queso (ruedas hacia el montacargas).
function along(P, now, speed, count, draw) { const segs = []; let L = 0; for (let i = 1; i < P.length; i++) { const l = Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); segs.push([P[i - 1], P[i], l]); L += l; } for (let k = 0; k < count; k++) { let d = (now / speed + (k * L) / count) % L; for (const [a, b, l] of segs) { if (d <= l) { const f = l ? d / l : 0; draw(Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f)); break; } d -= l; } } }
const rawDot = (x, y) => { R(x - 1, y - 1, 3, 3, '#e8a030'); R(x - 1, y - 1, 2, 1, '#ffd27a'); };
const baseDot = (x, y) => { R(x - 1, y - 1, 3, 3, '#f4ecd0'); R(x - 1, y + 1, 3, 1, '#b8a878'); };
const wheel = (x, y) => box(x - 2, y - 3, 4, 3, '#ffcf2e', '#7a4a10');

// ---- Paradas ----
let HITS = [];
function pushStations(st, g) { const si = STOPS.indexOf(st); for (const [k, rects] of Object.entries(g.st)) for (const r of rects) HITS.push({ k: 'b', stop: si, st: k, x: r[0], y: r[1], w: r[2], h: r[3] }); }
const pushM = (st, key, who, name, x, feet, extra) => HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: key, who, name, x, y: feet - 20, w: 22, h: 20, ...extra });
function sel(r) { if (NOSEL) return; let [x, y, w, h] = r; const c = '#ffcf2e', a = 4; x -= 2; y -= 2; w += 4; h += 4; for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) { R(Math.min(cx, cx + sx * (a - 1)), cy, a, 1, c); R(cx, Math.min(cy, cy + sy * (a - 1)), 1, a, c); } }
function marks(st, g) { const si = STOPS.indexOf(st); if (STOPS[S.stop] === st) for (const r of g.st[S.station] || []) sel(r); if (S.flash[st.id] && performance.now() - S.flash[st.id].t < 110) for (const r of g.st[S.flash[st.id].k] || []) { ctx.globalAlpha = 0.25; R(r[0], r[1], r[2], r[3], '#fff'); ctx.globalAlpha = 1; } }
// Pasear: ir y volver entre a y b una vez por ciclo (el resto, quieto en a). Devuelve x y hacia dónde mira.
function stroll(now, period, a, b, ph = 0) { const c = (now + ph) % period, go = period * 0.5, ret = period * 0.7, back = period * 0.9; if (c < go) return { x: a, walk: false, right: b < a }; if (c < ret) return { x: Math.round(a + ((b - a) * (c - go)) / (ret - go)), walk: true, right: b > a }; if (c < back) return { x: b, walk: false, right: b > a }; return { x: Math.round(b + ((a - b) * (c - back)) / (period - back)), walk: true, right: a > b }; }
const legs = (now) => ({ legs: Math.floor(now / 120) % 2 ? 'a' : 'b' });
function drawTown(st, now) {
  if (S.camY < st.top) sky(st, Math.floor(S.camY) - 2, st.top);
  baked(st, paintTown);
  const g = geoT(st), { o, GR } = g, f = Math.floor(now / 140);
  sprite(SPR.house, 40, f, o + 18, GR - 9 - 46, 40, 46); sprite(SPR.lab, 36, f, o + 60, GR + 2 - 46, 36, 46); sprite(SPR.shop, 50, f, o + 86, GR + 4 - 54, 50, 54);
  pushStations(st, g); marks(st, g);
  const c = CREW.town;
  mouse(c.idle, o + 34, GR - 9, now, true); pushM(st, 'house', 'idle', c.idle.name, o + 34, GR - 9);
  const gs = stroll(now, 9000, o + 66, o + 74, 1300); mouse(c.sci, gs.x, GR + 5, now, !gs.right, gs.walk ? legs(now) : {}); pushM(st, 'lab', 'sci', c.sci.name, gs.x, GR + 5);
  mouse(c.keeper, o + 104, GR + 7, now, true); pushM(st, 'shop', 'keeper', c.keeper.name, o + 104, GR + 7);
}
function drawDistrictB(st, now) {
  baked(st, paintDistrictB);
  const th = TH[st.z], g = geoB(st), { t, o, TL, TR, BR, FF, rx, rb } = g, z = st.z, wax = !!th.masonry;
  sprite(SPR['rock' + z], 54, 0, rx, rb - 40, 54, 42);
  hoist(o + 82, BR, rb - 22, now, th);
  // Refinería: el horno metido en el acantilado izquierdo y el alambique en la terraza (cara de arriba en perspectiva).
  furnace(o + 2, TL + 2, 24, 30, now, th); R(o + 10, t + 7, 4, TL - 28 - t - 7, '#5a4a4a');
  still(o + 31, TL + 4, now, th, true);
  // Quesería: la boca de una cueva en el acantilado derecho, con baldas dentro, toldo, prensa y cuba en la terraza.
  { const x0 = o + 94, x1 = o + 132, top = t + 18; for (let y = top; y < TR; y++) { const u = Math.min(1, (y - top) / 10), w = Math.round((x1 - x0) * (0.55 + 0.45 * Math.sqrt(u))), xx = x0 + ((x1 - x0 - w) >> 1); R(xx, y, w, 1, th.recess); } racks(o + 100, 28, [TR - 22, TR - 13], th, wax); box(o + 94, TR - 30, 38, 3, wax ? '#c0392b' : th.beam); R(o + 94, TR - 30, 38, 1, wax ? '#e06050' : th.beamL); }
  press(o + 108, TR + 4, now, th, wax); vat(o + 94, TR + 4, th);
  pushStations(st, g); marks(st, g);
  along(rawB(g), now, 26, 3, rawDot); along(baseB(g), now, 30, 2, baseDot); along([[o + 118, TR + 2], [o + 136, TR + 2]], now, 40, 1, wheel);
  liftCage(o + 134, t + 4, FF + 2, now, true);
  const c = CREW[z], mT = now % 1200, mf = mT < 760 ? Math.floor(now / 600) % 2 : mT < 850 ? 2 : mT < 970 ? 3 : mT < 1130 ? 4 : 0;
  sprite(SPR.swingM, 32, mf, rx + 11, rb - 51, 32, 20); pushM(st, 'rock', 'miner', c.miner.name, rx + 13, rb - 31, { crest: true });
  const ds = stroll(now, 8000, o + 62, o + 68, 900); mouse(c.driller, ds.x, BR, now, !ds.right, ds.walk ? legs(now) : {}); pushM(st, 'drill', 'driller', c.driller.name, ds.x, BR);
  mouse(c.refiner, o + 8, TL + 8, now, true, { hold: Math.floor(now / 2400) % 3 === 0 }); pushM(st, 'refinery', 'refiner', c.refiner.name, o + 8, TL + 8);
  const cs = stroll(now, 6500, o + 106, o + 98, 1700); mouse(c.cook, cs.x, TR + 8, now, !cs.right, cs.walk ? legs(now) : {}); pushM(st, 'cheesery', 'cook', c.cook.name, cs.x, TR + 8);
}
function drawLocked(st) { baked(st, paintLocked); }
// Circulación: suelos por donde andan los ratones (verde: libre, para animaciones y encuentros; naranja: ocupado por un puesto
// o un trabajador), escalas y escaleras (puntos), dónde trabaja cada uno (rombo) y el recorrido de la cadena (amarillo).
function freeOf(st, g) {
  const out = [], occ = (f) => { const iv = []; for (const [, [x, feet]] of Object.entries(g.who)) if (Math.abs(feet - f.y) < 3) iv.push([x, x + 22]); if (!f.lane) for (const rs of Object.values(g.st)) for (const r of rs) if (Math.abs(r[1] + r[3] - f.y) < 6) iv.push([r[0], r[0] + r[2]]); return iv.sort((a, b) => a[0] - b[0]); };
  for (const f of g.floors) { let x = f.x0; const segs = []; for (const [a, b] of occ(f)) { if (a > x) segs.push([x, Math.min(a, f.x1)]); x = Math.max(x, b); } if (x < f.x1) segs.push([x, f.x1]); for (const [a, b] of segs) if (b - a > 0) out.push({ x0: a, x1: b, y: f.y, spots: Math.floor((b - a) / 22) }); }
  return out;
}
function drawPaths(st, g) {
  for (const f of g.floors) { R(f.x0, f.y - 1, f.x1 - f.x0, 1, '#ff9a3c'); }
  for (const s of freeOf(st, g)) { R(s.x0, s.y - 1, s.x1 - s.x0, 1, '#62d36e'); for (let k = 0; k < s.spots; k++) { const x = s.x0 + 11 + k * 22; R(x - 1, s.y - 4, 3, 1, '#62d36e'); R(x, s.y - 5, 1, 3, '#62d36e'); } }
  for (const [x0, y0, x1, y1] of g.links) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k += 3) R(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n), 1, 1, '#8ad8ff'); }
  for (const leg of g.legs) for (let i = 1; i < leg.length; i++) { const [a, b] = [leg[i - 1], leg[i]], n = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); for (let k = 0; k <= n; k += 4) R(Math.round(a[0] + ((b[0] - a[0]) * k) / Math.max(1, n)), Math.round(a[1] + ((b[1] - a[1]) * k) / Math.max(1, n)) - 3, 2, 1, '#ffcf2e'); }
  for (const [, [x, feet]] of Object.entries(g.who)) { R(x + 10, feet - 25, 3, 1, '#ff9a3c'); R(x + 11, feet - 26, 1, 3, '#ff9a3c'); }
}

// ---------- ARTE PILOTO · CHEDDAR (V4) ----------
// Todo el arte nuevo sale de un mismo constructor: cada pieza es una máscara con su material; se sombrea sola con la luz de
// arriba a la izquierda (canto claro arriba e izquierda, sombra abajo y a la derecha), se perfila con la tinta de los ratones
// de MICE y luego se le añaden detalles a mano. Así comparte luz, contorno y paleta con los ratones.
// SPRITE: cada pieza es un lienzo de tamaño fijo y se puede sustituir por un PNG del mismo tamaño.
const INK4 = '#1b1220';
// Cinco tonos por material: línea, sombra, base, luz y brillo.
const MAT = {
  wood: ['#2e1a0e', '#5c3519', '#8a5428', '#b67a3e', '#dca266'],
  wood2: ['#24140a', '#45281a', '#6a4024', '#8e5a32', '#b47c48'],
  iron: ['#1c1a26', '#3a3850', '#5e5c78', '#8e8caa', '#c6c4dc'],
  steel: ['#26303c', '#45546a', '#6c809a', '#9cb0c8', '#dceaf6'],
  copper: ['#3e140a', '#7a3418', '#b4602e', '#e2924c', '#ffcc8e'],
  paint: ['#4a2e04', '#9a6a08', '#e0a818', '#f8d040', '#fff4a8'],
  brick: ['#2a0c08', '#5a1e14', '#8a3424', '#b45640', '#da8466'],
  rock: ['#1e140c', '#3e2a1a', '#634428', '#8a643c', '#b08a58'],
  ledge: ['#2a1c10', '#4e3620', '#76552e', '#9c7a46', '#c4a26a'],
  stone: ['#221a16', '#44372e', '#6a5a4a', '#908070', '#bcae98'],
  cheese: ['#6a3c08', '#b87410', '#f0b828', '#ffd860', '#fff6b0'],
  aged: ['#4a2806', '#8a5410', '#c88a20', '#e8b040', '#ffe08a'],
  cream: ['#5e5236', '#9a8a60', '#d4c696', '#efe6c4', '#fffbea'],
  raw: ['#5a2408', '#a44e14', '#e08a2e', '#f8b860', '#ffe0a0'],
  cloth: ['#4a140e', '#8a2a1c', '#c8462e', '#ec7a52', '#ffb08a'],
  canvas: ['#5a4a2a', '#9a8a5a', '#e2d6aa', '#f6eed2', '#ffffff'],
  soot: ['#0c0706', '#140c08', '#1e120c', '#2a1a10', '#3a2416'],
  rope: ['#3a2a14', '#6a5028', '#9a7a44', '#c4a468', '#e8d09a'],
  glass: ['#1e3a44', '#3a6a7a', '#6ab0c0', '#b4e6ee', '#ffffff'],
  flame: ['#7a3a0a', '#c87a10', '#ffc040', '#ffe890', '#fffbe0'],
};
const hash4 = (a, b, c = 0) => { let n = Math.imul(a * 73856093 ^ b * 19349663 ^ c * 83492791, 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 13), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; }
function bres(x0, y0, x1, y1, f) { let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy; for (let k = 0; k < 999; k++) { f(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
function Px(w, h) {
  const N = w * h, L = new Int16Array(N).fill(-1), T = new Int8Array(N).fill(-1), C = new Array(N), layers = [];
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const add = (mat, test, x0, y0, x1, y1, opt = {}) => { const id = layers.length; layers.push({ mat, opt, x0, y0, x1, y1 }); for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) if (test(x, y)) { const i = y * w + x; L[i] = id; T[i] = -1; C[i] = undefined; } return api; };
  const api = {
    w, h,
    rect: (mat, x, y, ww, hh, opt) => add(mat, () => true, x, y, x + ww, y + hh, opt),
    ell: (mat, cx, cy, rx, ry, opt) => add(mat, (X, Y) => ((X + 0.5 - cx) / rx) ** 2 + ((Y + 0.5 - cy) / ry) ** 2 <= 1, cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, opt),
    poly: (mat, P, opt) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); return add(mat, (X, Y) => inPoly(X + 0.5, Y + 0.5, P), Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), opt); },
    fn: (mat, test, x0, y0, x1, y1, opt) => add(mat, test, x0, y0, x1, y1, opt),
    line: (mat, x0, y0, x1, y1, opt) => { const s = new Set(); bres(x0, y0, x1, y1, (x, y) => s.add(y * w + x)); return add(mat, (X, Y) => s.has(Y * w + X), Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1) + 1, Math.max(y0, y1) + 1, opt); },
    tone: (x, y, t) => { if (inb(x, y) && L[y * w + x] >= 0) T[y * w + x] = t; return api; },
    hline: (x, y, n, t) => { for (let i = 0; i < n; i++) api.tone(x + i, y, t); return api; },
    vline: (x, y, n, t) => { for (let i = 0; i < n; i++) api.tone(x, y + i, t); return api; },
    px: (x, y, c) => { if (inb(x, y)) C[y * w + x] = c; return api; },
    rivet: (x, y) => api.tone(x, y, 4).tone(x + 1, y + 1, 1),
    render(outline = true) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h), D = img.data;
      const put = (i, hex) => { const v = parseInt(hex.slice(1), 16); D[i * 4] = v >> 16; D[i * 4 + 1] = (v >> 8) & 255; D[i * 4 + 2] = v & 255; D[i * 4 + 3] = 255; };
      const solid = (x, y) => inb(x, y) && L[y * w + x] >= 0 && !layers[L[y * w + x]].opt.noLine;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, id = L[i];
        if (C[i]) { put(i, C[i]); continue; }
        if (id < 0) { if (outline && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) put(i, INK4); continue; }
        const ly = layers[id], P = MAT[ly.mat]; let t = T[i];
        if (t < 0) {
          const sh = ly.opt.shade || 'box', up = y === 0 || L[i - w] !== id, dn = y === h - 1 || L[i + w] !== id, lf = x === 0 || L[i - 1] !== id, rt = x === w - 1 || L[i + 1] !== id;
          if (sh === 'flat') t = 2;
          else if (sh === 'cyl') { const u = (x + 0.5 - ly.x0) / (ly.x1 - ly.x0); t = u < 0.12 ? 2 : u < 0.3 ? 3 : u < 0.4 ? 4 : u < 0.66 ? 2 : u < 0.88 ? 1 : 0; if (up && t < 3) t++; if (dn) t = Math.min(t, 1); }
          else if (sh === 'top') { t = up ? 4 : y - ly.y0 < 2 ? 3 : 2; if (dn || rt) t = 1; }
          else { t = 2; if (dn || rt) t = 1; if (up || lf) t = 3; if (up && lf) t = 4; if (ly.opt.ao && !dn && y + 2 < h && L[i + 2 * w] !== id) t = Math.min(t, 1); }
          if (ly.opt.noise && !up && !dn) { const r = hash4(x, y, id); if (r < ly.opt.noise) t = Math.max(1, t - 1); else if (r > 1 - ly.opt.noise / 2) t = Math.min(3, t + 1); }
        }
        put(i, P[Math.max(0, Math.min(4, t))]);
      }
      g.putImageData(img, 0, 0); return c;
    },
  };
  return api;
}
const ART = {};
const art = (k, f) => (ART[k] ||= f());

// ---- Horno de ladrillo, metido en la pared (30 × 34): arco, boca de fuego con dintel de hierro y clave de piedra.
const artFurnace = () => art('furnace', () => {
  const p = Px(30, 34);
  p.fn('brick', (x, y) => y >= 10 || ((x + 0.5 - 15) / 15) ** 2 + ((y + 0.5 - 11) / 11) ** 2 <= 1, 0, 0, 30, 34, { noise: 0.06 });
  for (let r = 0, y = 2; y < 34; y += 3, r++) { p.hline(0, y, 30, 1); for (let x = (r % 2) * 3; x < 30; x += 6) p.vline(x, y + 1, 2, 1); for (let x = 1; x < 30; x += 6) p.tone(x + (r % 2) * 3, y + 1, 3); }
  p.fn('soot', (x, y) => (x >= 9 && x < 21 && y >= 22) || ((x + 0.5 - 15) / 6) ** 2 + ((y + 0.5 - 22) / 6) ** 2 <= 1, 8, 15, 22, 34, { shade: 'flat' });
  p.fn('iron', (x, y) => { const d = ((x + 0.5 - 15) / 8) ** 2 + ((y + 0.5 - 22) / 8) ** 2; return d <= 1 && d >= 0.62 && y < 26; }, 6, 13, 24, 26, { shade: 'top' });
  p.rect('stone', 13, 12, 4, 4); p.rect('iron', 6, 25, 3, 9, { shade: 'cyl' }); p.rect('iron', 21, 25, 3, 9, { shade: 'cyl' });
  for (const y of [27, 31]) { p.rivet(7, y); p.rivet(22, y); }
  return p.render();
});
// ---- Alambique de cobre (32 × 32): cuerpo, cúpula, aros con remaches, manómetro, volante de la válvula, tolva del Raw arriba,
// cuello de cisne hacia el serpentín y el caño por donde sale la Base.
const artStill = () => art('still', () => {
  const p = Px(32, 32);
  p.rect('iron', 2, 27, 3, 5, { shade: 'cyl' }); p.rect('iron', 15, 27, 3, 5, { shade: 'cyl' }); p.rect('iron', 0, 25, 20, 3, { shade: 'top' });
  p.fn('copper', (x, y) => (y >= 11 && y < 25 && x >= 2 && x < 18) || ((x + 0.5 - 10) / 8) ** 2 + ((y + 0.5 - 12) / 7) ** 2 <= 1, 2, 4, 18, 25, { shade: 'cyl' });
  for (const y of [14, 22]) { p.hline(2, y, 16, 1); for (let x = 3; x < 18; x += 3) p.tone(x, y - 1, 4); }
  p.ell('cream', 13.5, 18, 2.5, 2.5, { shade: 'flat' }); p.tone(13, 17, 3).tone(14, 17, 3);
  p.ell('iron', 5.5, 19.5, 2.6, 2.6, { shade: 'top' }); p.tone(5, 19, 0).tone(4, 20, 0).tone(6, 18, 0);
  p.poly('iron', [[6, 0], [15, 0], [12, 5], [9, 5]], { shade: 'top' }); p.hline(7, 0, 7, 4);
  p.rect('copper', 16, 7, 9, 2, { shade: 'top' }); p.rect('copper', 24, 7, 2, 5, { shade: 'cyl' });
  // Serpentín (enfría y condensa) y caño.
  p.rect('copper', 22, 11, 8, 14, { shade: 'cyl' }); for (let y = 12; y < 25; y += 3) { p.hline(22, y, 8, 0); p.tone(23, y + 1, 4); }
  p.rect('iron', 25, 25, 2, 4, { shade: 'cyl' });
  return p.render();
});
// ---- Molde de la Base (14 × 6): bandeja de hierro donde cuaja la Base.
const artTray = () => art('tray', () => { const p = Px(14, 6); p.rect('iron', 0, 2, 14, 4, { shade: 'top' }); p.hline(1, 3, 12, 0); return p.render(); });
const artBar = () => art('bar', () => { const p = Px(4, 3); p.rect('cream', 0, 0, 4, 3); return p.render(); });
// ---- Pórtico de la perforadora (ancho variable): tablero de rejilla, frente con franjas de aviso y celosía remachada debajo.
const artGantry = (W) => art('gantry' + W, () => {
  const p = Px(W, 14);
  p.rect('iron', 0, 0, W, 4, { shade: 'top' }); for (let x = 2; x < W; x += 4) p.vline(x, 1, 3, 1);
  p.rect('paint', 0, 4, W, 3, { shade: 'flat' }); for (let x = -3; x < W; x += 6) for (let k = 0; k < 3; k++) { p.tone(x + k, 4 + k, 0); p.tone(x + k + 1, 4 + k, 0); }
  p.rect('iron', 0, 7, W, 2, { shade: 'top' }); p.rect('iron', 0, 12, W, 2, { shade: 'top' });
  for (let x = 0; x + 10 <= W; x += 10) { p.line('iron', x, 9, x + 9, 11); p.line('iron', x + 9, 9, x, 11); p.rect('iron', x, 9, 1, 3); }
  for (let x = 1; x < W; x += 5) { p.rivet(x, 7); p.rivet(x + 2, 12); }
  return p.render();
});
// ---- Perforadora (28 × 24): bancada, carcasa amarilla con rejilla y franja de aviso, escape, tolva del Raw a la izquierda y
// mesa giratoria por donde baja la barra. El volante se dibuja aparte (gira).
const artDrill = () => art('drill2', () => {
  const p = Px(30, 32);
  p.rect('iron', 0, 26, 30, 6, { shade: 'top' }); for (let x = 2; x < 30; x += 6) p.rivet(x, 28);
  p.fn('paint', (x, y) => x >= 5 && x < 25 && y >= 6 && y < 26 && !((x === 5 || x === 24) && y === 6), 5, 6, 25, 26, { noise: 0.04 });
  p.rect('paint', 8, 2, 14, 5, { shade: 'top' }); p.hline(9, 3, 12, 0);
  for (let y = 10; y < 18; y += 2) p.hline(8, y, 13, 0); p.hline(8, 20, 13, 1);
  for (let x = 5; x < 25; x += 4) { p.tone(x, 23, 0); p.tone(x + 1, 23, 0); p.tone(x + 1, 22, 0); }
  p.rect('iron', 23, 0, 3, 7, { shade: 'cyl' }); p.rect('iron', 22, 0, 5, 1);
  p.poly('iron', [[0, 12], [6, 12], [6, 19], [2, 19]], { shade: 'top' });
  p.rect('steel', 11, 26, 8, 6, { shade: 'top' }); p.rect('iron', 13, 30, 4, 2);
  p.ell('iron', 15, 1.5, 2.5, 1.6); p.line('iron', 15, 3, 15, 5);
  return p.render();
});
// Volante de la perforadora (11 × 11), tres posiciones para que gire.
const artWheel = (f) => art('wheel' + f, () => {
  const p = Px(11, 11); p.ell('iron', 5.5, 5.5, 5.4, 5.4, { shade: 'top' }); p.ell('steel', 5.5, 5.5, 3.6, 3.6, { shade: 'flat' }); p.ell('iron', 5.5, 5.5, 1.3, 1.3);
  const a = (f * Math.PI) / 3; for (let k = 0; k < 3; k++) { const b = a + (k * 2 * Math.PI) / 3; bres(5, 5, Math.round(5 + Math.cos(b) * 4), Math.round(5 + Math.sin(b) * 4), (x, y) => p.tone(x, y, 0)); }
  return p.render();
});
// Broca (9 × 9): cono de acero con dientes, dos posiciones.
const artBit = (f) => art('bit' + f, () => { const p = Px(9, 9); p.poly('steel', [[0, 0], [9, 0], [5.5, 9], [3.5, 9]], { shade: 'cyl' }); for (let y = 1; y < 8; y += 2) p.tone(1 + ((y + f) % 3) * 2 + (y > 4 ? 1 : 0), y, 4); p.hline(0, 0, 9, 3); return p.render(); });
// Cuadro de mando (10 × 15): armario, manómetro, piloto y palanca.
const artPanel = () => art('panel', () => { const p = Px(10, 15); p.rect('iron', 0, 3, 10, 12); p.rect('soot', 2, 5, 6, 5, { shade: 'flat' }); p.ell('cream', 4.5, 7.5, 2, 2, { shade: 'flat' }); p.line('iron', 8, 0, 8, 4); p.ell('cloth', 8.5, 0.5, 1.5, 1.3); p.rivet(1, 12); p.rivet(7, 12); return p.render(); });
// ---- Quesería: marco de vigas con letrero, toldo a rayas, baldas de curado, cuba de cuajar, prensa de husillo, moldes y carro.
const artFrame = (W = 36) => art('frame' + W, () => {
  const p = Px(W, 34), c = W >> 1;
  p.rect('wood2', 0, 3, 4, 31, { noise: 0.08 }); p.rect('wood2', W - 4, 3, 4, 31, { noise: 0.08 }); p.rect('wood', 0, 0, W, 5, { noise: 0.06 });
  for (let x = 3; x < W; x += 7) p.tone(x, 2, 1); p.rivet(2, 2); p.rivet(W - 3, 2);
  p.line('wood2', 4, 9, 9, 4); p.line('wood2', W - 5, 9, W - 10, 4);
  p.rect('wood', c - 7, 5, 14, 8); p.rect('rope', c - 5, 4, 1, 2); p.rect('rope', c + 4, 4, 1, 2);
  p.poly('cheese', [[c - 4, 11], [c + 4, 11], [c + 4, 7], [c - 4, 9]]); p.tone(c - 2, 9, 1).tone(c + 1, 9, 1);
  return p.render();
});
const artAwning = (W = 40) => art('awning' + W, () => { const p = Px(W, 9); for (let x = 0; x < W; x += 5) p.poly(Math.floor(x / 5) % 2 ? 'canvas' : 'cloth', [[x, 0], [x + 5, 0], [x + 5, 6], [x + 2.5, 8.5], [x, 6]], { shade: 'top' }); return p.render(); });
const artShelf = (aged) => art('shelf' + aged, () => { const p = Px(36, 8); p.rect('wood', 0, 6, 36, 2, { shade: 'top' }); for (let i = 0; i < 5; i++) { const m = (i + aged) % 3 === 0 ? 'aged' : 'cheese'; p.ell(m, 3.5 + i * 7, 3.5, 3.4, 2.6); p.hline(1 + i * 7, 4, 6, 1); } return p.render(); });
const artVat = () => art('vat', () => {
  const p = Px(18, 14);
  p.rect('wood', 1, 4, 16, 10, { shade: 'cyl' }); for (let x = 3; x < 17; x += 3) p.vline(x, 5, 9, 1); p.rect('iron', 1, 6, 16, 1, { shade: 'flat' }); p.rect('iron', 1, 11, 16, 1, { shade: 'flat' });
  p.ell('wood', 9, 4, 8.4, 3.2, { shade: 'top' }); p.ell('cream', 9, 4.2, 6.6, 2.1, { shade: 'flat' }); p.tone(7, 3, 3).tone(10, 4, 4);
  p.line('wood2', 13, 0, 10, 5);
  return p.render();
});
// Prensa (16 × 22): dos postes, travesaño, husillo de hierro con su barra y el queso en el molde. Dos posiciones.
const artPress = (f) => art('press' + f, () => {
  const p = Px(16, 22), d = f ? 1 : 0;
  p.rect('wood2', 0, 2, 3, 20); p.rect('wood2', 13, 2, 3, 20); p.rect('wood', 0, 0, 16, 3, { shade: 'top' });
  p.rect('iron', 7, 3, 2, 9 + d, { shade: 'cyl' }); for (let y = 4; y < 11 + d; y += 2) p.tone(7, y, 4);
  p.rect('iron', f ? 4 : 2, 5, f ? 8 : 12, 1, { shade: 'flat' });
  p.rect('wood', 3, 12 + d, 10, 2, { shade: 'top' }); p.rect('wood2', 3, 15, 10, 5); p.ell('cheese', 8, 16.5 + d / 2, 4.6, 1.6, { shade: 'flat' }); p.rect('wood', 0, 20, 16, 2, { shade: 'top' });
  return p.render();
});
const artCart = () => art('cart', () => { const p = Px(16, 12); p.rect('wood', 1, 5, 14, 3, { shade: 'top' }); p.line('wood2', 14, 5, 16, 1); p.ell('iron', 4, 9.5, 2.4, 2.4, { shade: 'top' }); p.ell('iron', 12, 9.5, 2.4, 2.4, { shade: 'top' }); p.ell('cheese', 5, 3, 3.4, 2.4); p.ell('cheese', 11, 3, 3.4, 2.4); p.hline(2, 3, 6, 1); p.hline(8, 3, 6, 1); return p.render(); });
// ---- Faroles, cajas y piezas sueltas.
const artLantern = () => art('lantern', () => { const p = Px(7, 10); p.rect('iron', 2, 0, 3, 1); p.rect('iron', 1, 1, 5, 2, { shade: 'top' }); p.rect('flame', 1, 3, 5, 5, { shade: 'flat' }); p.vline(1, 3, 5, 1).vline(5, 3, 5, 1); p.tone(3, 4, 4).tone(3, 5, 4).tone(3, 6, 3); p.rect('iron', 1, 8, 5, 2, { shade: 'top' }); return p.render(); });
const artBarrel = () => art('barrel', () => { const p = Px(10, 12); p.fn('wood', (x, y) => ((x + 0.5 - 5) / 5) ** 2 * 0.6 + ((y + 0.5 - 6) / 6.5) ** 2 <= 1, 0, 0, 10, 12, { shade: 'cyl' }); p.hline(0, 3, 10, 0); p.hline(0, 8, 10, 0); return p.render(); });
// ---- PENDIENTE DE APROBACIÓN: pico del minero, una pieza aparte que se pinta delante del ratón oficial (el ratón no cambia).
// Tres posiciones: levantado, a medio golpe y en el golpe.
const artPick = (f) => art('pick' + f, () => {
  const p = Px(18, 18), a = [-2.05, -1.0, 0.42][f], hx = 6, hy = 12, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], L = 9;
  const E = [hx + d[0] * L, hy + d[1] * L], at = (b, u, v) => [b[0] + d[0] * u + n[0] * v, b[1] + d[1] * u + n[1] * v];
  p.poly('wood', [at([hx, hy], -1, -1), at([hx, hy], -1, 1), at(E, 0, 1), at(E, 0, -1)], { shade: 'flat' });
  p.poly('steel', [at(E, -0.5, -5), at(E, 1.6, -2), at(E, 2.4, 0), at(E, 1.6, 2), at(E, -0.5, 5), at(E, 0.6, 0)], { shade: 'top' });
  return p.render();
});
// PENDIENTE: lo que llevan en la pata el refinador (un trozo de Raw) y el quesero (una rueda), también piezas aparte.
const artCarry = (k) => art('carry' + k, () => { const p = Px(8, 7); if (k === 'raw') { p.poly('raw', [[1, 2], [5, 0], [7, 3], [5, 6], [1, 5]]); p.tone(3, 2, 4); } else { p.ell('cheese', 4, 3.5, 3.6, 2.8); p.hline(1, 4, 6, 1); } return p.render(); });

// ---------- ARTE V4.1: separar identidades ----------
// REFINE = industria (ladrillo, hierro, cobre, fuego, vapor, chimenea; nada de madera ni toldo).
// CHEESE = taller artesano (madera, alero de tablas, cuba, prensa de husillo, moldes, mesa, baldas de curado; sin toldo).
// SELL = comercio (puesto con toldo a rayas, mostrador con el queso a la vista, rótulo con la moneda, balanza, pizarra).
MAT.wood3 = ['#2a1a10', '#5a3a20', '#8a5e34', '#b48450', '#d8aa70'];
MAT.slate = ['#14161c', '#242832', '#363c4a', '#4c5466', '#6a7488'];
MAT.coin = ['#6a4206', '#b8800a', '#f2c02a', '#ffe070', '#fffbd0'];
MAT.green = ['#123a1c', '#1e5e2c', '#2e8a40', '#52b85e', '#98e8a0'];
// Alero de tablas de la quesería (en vez del toldo): tablas en perspectiva con su canto y un farol colgado.
const artEave = (W = 40) => art('eave' + W, () => { const p = Px(W, 8); p.poly('wood3', [[0, 2], [W, 2], [W - 2, 7], [2, 7]], { shade: 'top' }); for (let x = 3; x < W - 2; x += 5) p.vline(x, 3, 4, 1); p.rect('wood2', 0, 0, W, 2, { shade: 'top' }); return p.render(); });
// Rótulo de la quesería: tabla colgada con una cuña de queso (no la moneda de la tienda).
const artCheeseSign = () => art('csign', () => { const p = Px(14, 10); p.rect('wood', 0, 2, 14, 8); p.rect('rope', 3, 0, 1, 2); p.rect('rope', 10, 0, 1, 2); p.poly('cheese', [[3, 8], [11, 8], [11, 4], [3, 6]]); p.tone(5, 6, 1).tone(8, 6, 1); return p.render(); });
// Mesa de trabajo con un cuchillo y media rueda.
const artTable = () => art('table', () => { const p = Px(16, 10); p.rect('wood', 0, 3, 16, 2, { shade: 'top' }); p.rect('wood2', 1, 5, 2, 5); p.rect('wood2', 13, 5, 2, 5); p.ell('cheese', 6, 2.6, 3.4, 2); p.rect('steel', 10, 1, 4, 1, { shade: 'flat' }); p.rect('wood2', 13, 1, 2, 1); return p.render(); });
const artMolds = () => art('molds', () => { const p = Px(10, 9); for (let i = 0; i < 3; i++) { p.rect('wood', 1 + (i % 2), 6 - i * 3, 8, 3, { shade: 'cyl' }); p.hline(1 + (i % 2), 7 - i * 3, 8, 1); } return p.render(); });
// Paleta de remover (se mueve aparte, dentro de la cuba).
const artPaddle = (f) => art('paddle' + f, () => { const p = Px(8, 10); p.line('wood', f ? 6 : 2, 0, f ? 3 : 5, 8, { shade: 'flat' }); p.rect('wood', f ? 2 : 4, 7, 3, 2); return p.render(); });
// ---- SELL: el puesto de la tienda (superficie). 44 × 46, cabe entre el laboratorio y el pozo del montacargas ----
const artShop = () => art('shop', () => {
  const p = Px(44, 46);
  p.rect('wood3', 2, 12, 3, 34); p.rect('wood3', 39, 12, 3, 34);
  for (let x = 0; x < 44; x += 6) { const x1 = Math.min(44, x + 6); p.poly(Math.floor(x / 6) % 2 ? 'canvas' : 'cloth', [[x, 4], [x1, 4], [x1, 12], [(x + x1) / 2, 15], [x, 12]], { shade: 'top' }); }
  p.rect('wood2', 0, 2, 44, 3, { shade: 'top' });
  p.rect('wood', 4, 32, 36, 4, { shade: 'top' }); p.rect('wood3', 4, 36, 36, 10); for (let x = 7; x < 40; x += 6) p.vline(x, 37, 9, 1);
  // El queso a la venta va a la izquierda del mostrador, bajo la pizarra de precios; el tendero, detrás, a la derecha.
  p.rect('slate', 8, 17, 10, 8); p.hline(10, 19, 6, 3).hline(10, 21, 4, 3); p.rect('rope', 12, 15, 1, 2);
  return p.render();
});
// Rótulo de la tienda: una moneda colgada.
const artCoinSign = () => art('coinsign', () => { const p = Px(12, 13); p.rect('rope', 3, 0, 1, 3); p.rect('rope', 8, 0, 1, 3); p.ell('coin', 6, 8, 5.4, 5.4, { shade: 'top' }); p.ell('coin', 6, 8, 3.2, 3.2, { shade: 'flat' }); p.vline(6, 6, 5, 1); return p.render(); });

// ---------- PROPUESTA: una roca distinta por capítulo ----------
// Siluetas y materiales distintos, con lo que todas deben conservar: una cresta plana para el minero (línea verde), la cara
// de la veta donde muerde la broca (punto rojo) y su zona táctil (rectángulo). Dos estados: entera y con la veta abierta.
const ROCKS6 = [
  { id: 'cheddar', name: 'Cheddar', note: 'Canto rodado redondo: la roca aprobada de hoy (c0 y v5).', w: 54, h: 42, real: true, crest: [16, 36] },
  { id: 'gouda', name: 'Gouda', note: 'Losas apiladas, ancha y baja, con vetas de cera roja entre losa y losa.', w: 60, h: 34, mat: ['#2a3038', '#4e5866', '#76808e', '#a2acb8', '#d8dee6'], shape: (x, y, w, h) => { const band = Math.floor(y / 9); const inset = [8, 4, 1, 0][Math.min(3, band)]; return x >= inset && x < w - inset - (band === 0 ? 4 : 0); }, crest: [12, 44], cheese: 'cheese', seams: '#c0392b' },
  { id: 'brie', name: 'Brie', note: 'Montículo blando y achatado, con costra de moho blanco que se desborda un poco.', w: 56, h: 36, mat: ['#4a4438', '#8a8270', '#c8c0a8', '#e8e2d0', '#ffffff'], shape: (x, y, w, h) => { const t = Math.abs((x + 0.5 - w / 2) / (w / 2)), u = Math.max(0, t - 0.4) / 0.6; return y >= h * (0.16 + 0.8 * u * u); }, crest: [17, 39], cheese: 'cream', rind: true },
  { id: 'emmental', name: 'Emmental', note: 'Roca de lomo ancho con ojos (cavidades); la veta se abre en el centro.', w: 56, h: 42, mat: ['#4a4020', '#8a7a40', '#c8b060', '#e8d48a', '#fff4c0'], shape: (x, y, w, h) => ((x + 0.5 - w / 2) / (w / 2)) ** 4 + ((y + 0.5 - h) / h) ** 2 <= 1, crest: [17, 39], cheese: 'cheese', holes: [[11, 20, 4.2], [44, 30, 3.4], [16, 35, 2.4]] },
  { id: 'parmesan', name: 'Parmesano', note: 'Bloque facetado y granuloso, más alto, con brillos de cristal y una meseta arriba.', w: 50, h: 46, mat: ['#3e3020', '#7a6040', '#b8986a', '#dcc094', '#fff0c8'], shape: (x, y, w, h) => inPoly(x + 0.5, y + 0.5, [[3, h], [0, 26], [7, 9], [15, 2], [35, 2], [44, 11], [50, 28], [w, h]]), crest: [16, 34], cheese: 'aged', grain: true },
  { id: 'blue', name: 'Blue', note: 'Pizarra oscura con vetas minerales azules; los costados en sierra y la cresta llana.', w: 54, h: 44, mat: ['#14182a', '#262c46', '#3a4466', '#56648c', '#8a9ac0'], shape: (x, y, w, h) => { const c = x >= 17 && x <= 37, top = c ? 8 : 9 + Math.abs(((x * 7) % 14) - 7) * 0.7 + ((x + 0.5 - w / 2) / (w / 2)) ** 2 * 22; return y >= top; }, crest: [17, 37], cheese: 'cheese', veins: '#5ab0ff' },
];
// Luz de arriba a la izquierda, como la roca aprobada: tono por posición y canto superior iluminado.
function rockProposal(r, open) {
  if (r.real) return im(open ? ROCKV[4] : ROCKC[0]);
  return art('rp' + r.id + open, () => {
    MAT['rp' + r.id] = r.mat; const p = Px(r.w, r.h), inS = (x, y) => x >= 0 && y >= 0 && x < r.w && y < r.h && r.shape(x, y, r.w, r.h);
    p.fn('rp' + r.id, (x, y) => inS(x, y), 0, 0, r.w, r.h, { shade: 'flat' });
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { if (!inS(x, y)) continue; const d = (x / r.w) * 0.55 + (y / r.h) * 0.75 + (hash4(x, y, 7) - 0.5) * 0.1; p.tone(x, y, !inS(x, y - 1) ? 4 : d < 0.38 ? 3 : d < 0.82 ? 2 : 1); if (!inS(x + 1, y) || !inS(x, y + 1)) p.tone(x, y, 1); }
    for (let i = 0; i < 6; i++) { const x = 6 + Math.floor(hash4(i, r.w) * (r.w - 12)), y = 8 + Math.floor(hash4(i, r.h) * (r.h - 12)); bres(x, y, x + 3 - (i % 3) * 2, y + 5, (a, b) => inS(a, b) && inS(a, b - 2) && p.tone(a, b, 0)); }
    if (r.seams) for (let y = 9; y < r.h; y += 9) for (let x = 0; x < r.w; x++) if (inS(x, y)) p.px(x, y, r.seams);
    if (r.rind) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (inS(x, y) && (!inS(x, y - 1) || (!inS(x, y - 2) && hash4(x, y, 3) < 0.6))) p.px(x, y, '#ffffff');
    if (r.grain) for (let i = 0; i < 46; i++) { const x = Math.floor(hash4(i, 9) * r.w), y = Math.floor(hash4(i, 11) * r.h); if (inS(x, y) && inS(x, y - 1)) p.px(x, y, hash4(i, 5) < 0.3 ? '#fffbe8' : '#8a6c48'); }
    if (r.veins) for (let i = 0; i < 4; i++) bres(8 + i * 11, r.h - 3, 14 + i * 9, 16 + (i % 2) * 6, (a, b) => { if (inS(a, b) && inS(a, b - 1)) p.px(a, b, r.veins); });
    if (r.holes) for (const [cx, cy, rr] of r.holes) for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const q = (x * x + y * y) / (rr * rr); if (q < 1 && inS(cx + x, cy + y)) p.px(cx + x, cy + y, y > rr * 0.4 ? '#7a6a30' : '#2a2010'); else if (q < 1.45 && y < 0 && inS(cx + x, cy + y)) p.px(cx + x, cy + y, MAT['rp' + r.id][1]); }
    if (open) { const cx = Math.round(r.w / 2), cy = r.h - 14; for (let y = -7; y <= 7; y++) for (let x = -11; x <= 11; x++) if ((x / 11) ** 2 + (y / 7) ** 2 <= 1) { const inner = (x / 9) ** 2 + ((y - 1) / 5.5) ** 2 <= 1; p.px(cx + x, cy + y, inner ? (y < -2 ? '#2a1a10' : MAT[r.cheese][y > 2 ? 2 : 3]) : '#1b1220'); } }
    return p.render();
  });
}

// ---------- SIMULACIÓN ESPEJO (V4.1) ----------
// Copia, para Cheddar, de las reglas reales de js/game/systems/production.js y js/game/simulation.js. Lo que cambia son las
// cifras: son de ejemplo (rotuladas en la columna) para que el ciclo entero se vea en menos de un minuto. No toca el juego.
//  · MINE: solo se pica sin veta a la vista (status 'ready'); con veta, picar falla ('vein-exposed').
//  · Golpe a mano: combo si llega antes de 650 ms; crítico cada 5 del combo. Con un minero en la roca, cada toque hace al menos
//    el 4 % de la búsqueda (12 % si es crítico). Sin minero, la fuerza del pico (x3 en crítico).
//  · El minero da un golpe cada «intervalo» solo mientras la roca está 'ready'; con veta a la vista, su acumulador vuelve a 0.
//  · Al completar la búsqueda: la veta se abre con toda su capacidad y el combo vuelve a 0.
//  · DRILL: solo arranca con veta y sin ciclo en marcha; al arrancar reserva su Raw de la veta y lo entrega al acabar. Tocar con
//    un ciclo en marcha lo acelera 250 ms. Con perforador, encadena ciclos mientras haya veta.
//  · Veta vacía al acabar un ciclo: la veta se cierra, la búsqueda vuelve a 0 y la roca baja un nivel de profundidad.
//  · REFINE, CHEESE y SELL: arrancan si tienen material (lo gastan al arrancar) y entregan al acabar; tocar acelera.
const RULE = { help: 0.04, helpCrit: 0.12, critEvery: 5, critMult: 3, comboMs: 650, drillBoostMs: 250, refBoostMs: 250, cookBoostMs: 250, sellBoostMs: 300 };
// Cifras de ejemplo (no son las del juego): búsqueda en unidades, ritmos en ms.
const EX = { need: 60, pick: 2, minerPower: 4, minerMs: 1400, capacity: 32, drillYield: 4, drillMs: 2000, rawPerBase: 2, refBatch: 2, refMs: 3000, cookBase: 1, cookMs: 3500, sellLots: 1, sellMs: 2600 };
const P41 = { miner: true, driller: true, refiner: true, cook: true, keeper: true };
let Z41, EVL = [];
function simReset(o = {}) {
  Z41 = { depth: DEP.cheddar, discover: 0, veinRevealed: false, veinRemaining: 0, drillJob: null, refJob: null, cookJob: null, sellJob: null, minerAcc: 0, combo: 0, lastHitAt: -1e9, raw: 4, base: 3, lots: 2, coins: 0, hits: 0, ...o };
}
simReset();
const emit41 = (type, d = {}) => { const e = { type, t: performance.now(), ...d }; EVL.push(e); if (EVL.length > 400) EVL.shift(); for (const f of EVH) f(e); };
const EVH = [];
const on41 = (f) => EVH.push(f);
const fail41 = (reason) => ({ ok: false, reason });
const veinNeed = () => EX.need;
const SIM41 = {
  mineStatus: () => (Z41.veinRevealed ? 'vein-exposed' : 'ready'),
  // Golpe: 'manual' (el jugador) o 'worker' (el minero). Misma regla que CM.mining.hit.
  hit(source) {
    if (this.mineStatus() !== 'ready') return fail41('vein-exposed');
    const need = veinNeed(), now = performance.now(); let crit = false;
    if (source === 'manual') { Z41.combo = now - Z41.lastHitAt <= RULE.comboMs ? Z41.combo + 1 : 1; Z41.lastHitAt = now; crit = Z41.combo % RULE.critEvery === 0; }
    let power = source === 'manual' ? EX.pick * (crit ? RULE.critMult : 1) : EX.minerPower;
    if (source === 'manual' && P41.miner) power = Math.max(power, need * (crit ? RULE.helpCrit : RULE.help));
    const amount = Math.min(need - Z41.discover, power); Z41.discover += amount; Z41.hits++;
    emit41('hit', { source, crit, amount, combo: source === 'manual' ? Z41.combo : 0 });
    if (Z41.discover >= need - 1e-6) { Z41.discover = need; Z41.veinRevealed = true; Z41.veinRemaining = EX.capacity; Z41.combo = 0; emit41('reveal', { capacity: Z41.veinRemaining }); }
    return { ok: true, crit };
  },
  drillStatus: () => (Z41.drillJob ? 'running' : !Z41.veinRevealed || Z41.veinRemaining <= 0 ? 'no-vein' : 'ready'),
  drillStart(source) { if (this.drillStatus() !== 'ready') return fail41(this.drillStatus()); const amount = Math.max(1, Math.min(EX.drillYield, Z41.veinRemaining)); Z41.veinRemaining -= amount; Z41.drillJob = { remaining: EX.drillMs, total: EX.drillMs, amount, source }; emit41('drillStart', { source, amount }); return { ok: true }; },
  drillTap() { if (!Z41.drillJob) return this.drillStart('manual'); Z41.drillJob.remaining = Math.max(0, Z41.drillJob.remaining - RULE.drillBoostMs); emit41('drillBoost'); return { ok: true, boosted: true }; },
  drillComplete() { const j = Z41.drillJob; Z41.drillJob = null; Z41.raw += j.amount; emit41('drillDone', { amount: j.amount, source: j.source }); if (Z41.veinRevealed && Z41.veinRemaining <= 0) { Z41.veinRevealed = false; Z41.veinRemaining = 0; Z41.discover = 0; Z41.depth += 1; emit41('deeper', { depth: Z41.depth }); } },
  refStatus: () => (Z41.refJob ? 'running' : Math.floor(Z41.raw / EX.rawPerBase) < 1 ? 'no-raw' : 'ready'),
  refStart(source) { if (this.refStatus() !== 'ready') return fail41(this.refStatus()); const batches = Math.min(EX.refBatch, Math.floor(Z41.raw / EX.rawPerBase)); const used = batches * EX.rawPerBase; Z41.raw -= used; Z41.refJob = { remaining: EX.refMs, total: EX.refMs, amount: batches, used, source }; emit41('refineStart', { used }); return { ok: true }; },
  refTap() { if (!Z41.refJob) return this.refStart('manual'); Z41.refJob.remaining = Math.max(0, Z41.refJob.remaining - RULE.refBoostMs); emit41('refineBoost'); return { ok: true, boosted: true }; },
  refComplete() { const j = Z41.refJob; Z41.refJob = null; Z41.base += j.amount; emit41('refineDone', { amount: j.amount, source: j.source }); },
  cookStatus: () => (Z41.cookJob ? 'running' : Z41.base < EX.cookBase ? 'no-base' : 'ready'),
  cookStart(source) { if (this.cookStatus() !== 'ready') return fail41(this.cookStatus()); Z41.base -= EX.cookBase; Z41.cookJob = { remaining: EX.cookMs, total: EX.cookMs, amount: 1, source }; emit41('cookStart'); return { ok: true }; },
  cookTap() { if (!Z41.cookJob) return this.cookStart('manual'); Z41.cookJob.remaining = Math.max(0, Z41.cookJob.remaining - RULE.cookBoostMs); emit41('cookBoost'); return { ok: true, boosted: true }; },
  cookComplete() { const j = Z41.cookJob; Z41.cookJob = null; Z41.lots += j.amount; emit41('cookDone', { amount: j.amount, source: j.source }); },
  sellStatus: () => (Z41.sellJob ? 'running' : Z41.lots < EX.sellLots ? 'no-stock' : 'ready'),
  sellStart(source) { if (this.sellStatus() !== 'ready') return fail41(this.sellStatus()); Z41.lots -= EX.sellLots; Z41.sellJob = { remaining: EX.sellMs, total: EX.sellMs, amount: EX.sellLots, source }; emit41('sellStart'); return { ok: true }; },
  sellTap() { if (!Z41.sellJob) return this.sellStart('manual'); Z41.sellJob.remaining = Math.max(0, Z41.sellJob.remaining - RULE.sellBoostMs); emit41('sellBoost'); return { ok: true, boosted: true }; },
  sellComplete() { const j = Z41.sellJob; Z41.sellJob = null; Z41.coins += j.amount * 120; emit41('sellDone', { amount: j.amount, source: j.source }); },
};
// Igual que runJob y runMiner de simulation.js.
function runJob41(dt, get, auto, start, complete) { let left = dt; for (let g = 0; g < 50; g++) { let job = get(); if (!job) { if (!auto || !start().ok) return; job = get(); } const used = Math.min(left, job.remaining); job.remaining -= used; left -= used; if (job.remaining > 0) return; complete(); } }
function runMiner41(dt) { if (!P41.miner || SIM41.mineStatus() !== 'ready') { Z41.minerAcc = 0; return; } Z41.minerAcc += dt; while (Z41.minerAcc >= EX.minerMs) { Z41.minerAcc -= EX.minerMs; if (!SIM41.hit('worker').ok) { Z41.minerAcc = 0; break; } } }
// Estados forzados (rotulados SIMULACIÓN): solo quitan material o puestos; nunca permiten acciones que el juego no permite.
const FORCE = { state: 'normal' };
function step41(dt) {
  runMiner41(dt);
  runJob41(dt, () => Z41.drillJob, P41.driller, () => SIM41.drillStart('worker'), () => SIM41.drillComplete());
  runJob41(dt, () => Z41.refJob, P41.refiner, () => SIM41.refStart('worker'), () => SIM41.refComplete());
  runJob41(dt, () => Z41.cookJob, P41.cook, () => SIM41.cookStart('worker'), () => SIM41.cookComplete());
  runJob41(dt, () => Z41.sellJob, P41.keeper, () => SIM41.sellStart('worker'), () => SIM41.sellComplete());
}

// ---------- CHEDDAR V4.1: terreno, máquinas, recursos, montacargas, ratones y jugador ----------
// Todo lo que se mueve responde a un estado o un evento de la simulación espejo (m41_sim): golpe, veta, ciclos de perforadora,
// refinería, quesería y tienda, y bajada de nivel. Nada se anima «porque sí».
const RK = MAT.rock, LG = MAT.ledge;
// ---- Terreno ----
function stones(x0, y0, w, h, seed, P) { for (let i = 0; i < (w * h) / 34; i++) { const x = x0 + Math.floor(hash4(i, seed, 1) * w), y = y0 + Math.floor(hash4(i, seed, 2) * h), r = 1 + Math.floor(hash4(i, seed, 3) * 3), q = hash4(i, seed, 5); if (r === 1) { R(x, y, q < 0.5 ? 2 : 1, 1, P[q < 0.3 ? 0 : 2]); continue; } for (let k = -r; k <= r; k++) { const ww = Math.round(Math.sqrt(r * r - k * k) * (0.95 + q * 0.35)); R(x - ww, y + k, ww * 2 + 1, 1, P[1]); } R(x - r, y - r + 1, r + 1, 1, P[2]); R(x - r - 1, y, 1, 1, P[2]); R(x + 1, y + r, r + 1, 1, P[0]); R(x + r + 1, y + 1, 1, r - 1 || 1, P[0]); } }
function patches(x0, y0, w, h, seed) { for (let y = y0; y < y0 + h; y += 6) for (let x = x0; x < x0 + w; x += 6) { const v = hash4(Math.floor(x / 6), Math.floor(y / 6), seed + 50); if (v < 0.25) { ctx.globalAlpha = 0.12; R(x, y, 6, 6, '#000'); ctx.globalAlpha = 1; } else if (v > 0.85) { ctx.globalAlpha = 0.06; R(x, y, 6, 6, '#ffe0b0'); ctx.globalAlpha = 1; } } }
function cracks(x0, y0, w, h, seed, c) { for (let i = 0; i < (w * h) / 900; i++) { let x = x0 + Math.floor(hash4(i, seed, 7) * w), y = y0 + Math.floor(hash4(i, seed, 8) * h); const L = 5 + Math.floor(hash4(i, seed, 9) * 9); for (let k = 0; k < L && y < y0 + h; k++) { R(x, y, 1, 1, c); y++; if (hash4(i, k, seed) < 0.4) x += hash4(k, i, seed) < 0.5 ? -1 : 1; } } }
function cliff(x0, x1, y0, y1, seed) { R(x0, y0, x1 - x0, y1 - y0, RK[2]); patches(x0, y0, x1 - x0, y1 - y0, seed); stones(x0, y0, x1 - x0, y1 - y0, seed, [RK[1], RK[2], RK[3]]); cracks(x0, y0, x1 - x0, y1 - y0, seed, RK[0]); }
// Suelo en perspectiva con canto de madera (plataformas) y el camino de tierra más claro en el carril delantero.
function ledgeTop(x0, x1, y, D, seed, path = true) { const rows = [LG[3], LG[3], LG[2], LG[2], LG[2], LG[1]]; for (let k = 0; k < D; k++) R(x0, y + k, x1 - x0, 1, rows[Math.min(5, Math.floor((k / D) * 6))]); stones(x0, y + 1, x1 - x0, D - 5, seed, [LG[1], LG[2], LG[3]]); if (path) { ctx.globalAlpha = 0.18; R(x0, y + D - 7, x1 - x0, 3, '#ffe8c0'); ctx.globalAlpha = 1; } R(x0, y, x1 - x0, 1, LG[4]); R(x0, y + D - 3, x1 - x0, 2, MAT.wood[2]); R(x0, y + D - 3, x1 - x0, 1, MAT.wood[3]); R(x0, y + D - 1, x1 - x0, 1, MAT.wood[1]); for (let x = x0 + 3; x < x1; x += 9) R(x, y + D - 2, 1, 1, MAT.iron[3]); }
function faceDown(x0, x1, y0, y1, seed) { cliff(x0, x1, y0, y1, seed); ctx.globalAlpha = 0.18; R(x0, y0, x1 - x0, y1 - y0, '#000'); ctx.globalAlpha = 0.5; R(x0, y0, x1 - x0, 2, '#000'); ctx.globalAlpha = 0.25; R(x0, y0 + 2, x1 - x0, 3, '#000'); ctx.globalAlpha = 1; }
function post(x, y0, y1) { R(x - 1, y0, 4, y1 - y0, INK4); R(x, y0, 2, y1 - y0, MAT.wood2[2]); R(x, y0, 1, y1 - y0, MAT.wood2[3]); }
function brace(x0, y0, x1, y1) { bres(x0, y0, x1, y1, (x, y) => { R(x, y - 1, 1, 3, INK4); }); bres(x0, y0, x1, y1, (x, y) => R(x, y, 1, 1, MAT.wood2[2])); }
function lanternPost(x, base, h, glowR = 18) { glow(x + 3, base - h - 4, '#ffcf7a', glowR); post(x + 2, base - h, base); ctx.drawImage(artLantern(), x, base - h - 9); }
function paintCheddar(st) {
  const g = geoC(st), { t, o, TL, TR, DK, FF, n, X0, X1 } = g, W = Math.ceil(SC.worldW), H = st.h;
  // Fondo de la caverna: el plano más lejano, el más oscuro y frío.
  R(0, t, W, H, '#261a12'); patches(0, t, W, H, 9); stones(0, t, W, H, 7, ['#1c130c', '#2e2016', '#3a2a1c']); cracks(0, t, W, H, 9, '#140d08');
  for (let i = 0; i < 10; i++) { const x = Math.floor(hash4(i, 3) * W), y = t + 16 + Math.floor(hash4(i, 5) * (FF - t - 26)); for (let k = 0; k < 7; k++) R(x + k, y + Math.round(Math.sin(k * 0.9 + i)), 1, 1, MAT.cheese[k % 3 ? 1 : 2]); R(x + 3, y, 1, 1, MAT.cheese[4]); }
  for (let x = 0; x < W; x++) { const h = 6 + jag(x, 11, 3); R(x, t, 1, h, RK[2]); R(x, t + h, 1, 1, RK[0]); if (hash4(x, 1) < 0.3) R(x, t + 1, 1, 1, RK[3]); }
  for (let x = 4; x < W; x += 11) { const L = 4 + Math.floor(hash4(x, 9) * 6); for (let i = 0; i < L; i++) { const w = i < L - 2 ? 2 : 1; R(x - 1, t + 7 + i, w + 2, 1, INK4); R(x, t + 7 + i, w, 1, i < L - 3 ? RK[2] : RK[3]); } }
  for (const x of [o + 60, o + 84, o + 122]) for (let i = 0; i < 9; i++) R(x + Math.round(Math.sin(i * 0.7 + x) * 1.2), t + 8 + i, 1, 1, MAT.wood2[1]);
  // Terrazas (plano medio, más claro y cálido) con sus frentes en sombra y el entibado que las sostiene.
  cliff(0, o + 48, t + 8, TL, 3); ledgeTop(0, o + 48, TL, 14, 4); faceDown(0, o + 46, TL + 14, FF, 5);
  for (const x of [o + 22, o + 40]) post(x, TL + 14, FF); brace(o + 24, TL + 16, o + 39, TL + 30);
  cliff(o + 98, W, t + 8, TR, 13); ledgeTop(o + 98, W, TR, 14, 14); faceDown(o + 100, W, TR + 14, FF, 15);
  post(o + 101, TR + 14, FF); brace(o + 103, TR + 16, o + 116, TR + 28);
  // La cueva de la quesería.
  for (let y = t + 28; y < TR; y++) { const u = Math.min(1, (y - t - 28) / 9), w = Math.round(32 * (0.5 + 0.5 * Math.sqrt(u))), xx = o + 102 + ((32 - w) >> 1); R(xx - 1, y, w + 2, 1, INK4); R(xx, y, w, 1, MAT.soot[2]); }
  ctx.save(); ctx.beginPath(); ctx.rect(o + 102, t + 28, 32, TR - t - 28); ctx.clip(); glow(o + 118, t + 38, '#ffcf7a', 16); ctx.restore();
  // Escalera de madera con cuerda (terraza alta → suelo) y escala (corta → terraza de la quesería).
  for (let i = 0, y = TL + 16; y < FF - 2; i++, y += 6) { const sx = o + 2 + (i % 2 ? 6 : 0); R(sx - 1, y - 1, 14, 5, INK4); R(sx, y, 12, 2, MAT.wood[3]); R(sx, y + 2, 12, 2, MAT.wood[1]); }
  for (let y = TL + 14; y < FF; y += 2) R(o + 1, y, 1, 1, MAT.rope[2]);
  // Suelo de la caverna.
  ledgeTop(0, W, FF, 16, 21); R(0, FF + 16, W, H - (FF - t) - 16, RK[1]); stones(0, FF + 16, W, H - (FF - t) - 16, 22, [RK[0], RK[1], RK[2]]); R(0, FF + 16, W, 1, RK[3]);
  // La corta: un banco por tramo de profundidad.
  const SL = ['#7a5a3a', '#6a4c30', '#5c4028', '#4e3622', '#402c1c', '#34241a'];
  if (n) R(X0, FF + 1, X1 - X0, H - (FF - t) - 1, MAT.soot[2]);
  for (let k = 0; k < n; k++) {
    const y = FF + 2 + k * 4, a = X0 + k * 3, b = X1 - k * 3;
    R(a, y, b - a, 4, MAT.soot[3]); R(a, y, 3, H - (y - t), SL[k]); R(b - 3, y, 3, H - (y - t), SL[k]); R(a, y, 3, 1, LG[3]); R(b - 3, y, 3, 1, LG[3]); R(a + 3, y + 3, b - a - 6, 1, SL[k]);
    if (k >= 1) { R(a + 1, y + 1, 1, 3, MAT.wood2[2]); R(b - 2, y + 1, 1, 3, MAT.wood2[2]); }
    if (k >= 2) for (let x = a + 6; x < b - 6; x += 9) R(x, y + 3, 3, 1, MAT.cheese[1]);
    if (k >= 3) for (const x of [a + 1, b - 2]) { R(x, y + 1, 1, 2, MAT.cheese[4]); glow(x, y + 2, '#ffcf5a', 4); }
  }
  const fx0 = X0 + n * 3, fx1 = X1 - n * 3, fy = FF + 4 + n * 4;
  if (n) { for (let k = 0; k < 4; k++) R(fx0, fy + k, fx1 - fx0, 1, [LG[2], LG[2], LG[1], LG[1]][k]); R(fx0, fy + 4, fx1 - fx0, H - (fy - t) - 4, SL[Math.min(5, n)]); ctx.globalAlpha = 0.06 * n; R(X0, FF + 2, X1 - X0, H - (FF - t) - 2, '#000'); ctx.globalAlpha = 1; }
  else { ctx.globalAlpha = 0.25; R(X0 + 8, FF + 5, X1 - X0 - 16, 6, '#000'); ctx.globalAlpha = 1; }
  for (let y = TR + 14; y < FF + 10; y += 4) R(o + 109, y, 6, 1, MAT.wood[3]); R(o + 108, TR + 14, 1, FF + 10 - TR - 14, MAT.wood[1]); R(o + 115, TR + 14, 1, FF + 10 - TR - 14, MAT.wood[1]);
  // Escombrera (crece con la profundidad), a la izquierda; cajas a la derecha.
  const hh = 2 + n * 3; for (let k = 0; k < hh; k++) { const w = Math.round(18 * (1 - k / (hh + 2))); R(o + 8 - (w >> 1), FF + 7 - k, w, 1, k % 3 ? RK[2] : RK[3]); }
  for (const [x, y] of [[o + 118, FF + 1], [o + 121, FF - 6]]) ctx.drawImage(im(SPR.crate), x, y);
  // Elevador de cangilones (fijo): carriles, polea y canaleta a la tolva del alambique.
  for (const x of [o + 43, o + 49]) { R(x - 1, t + 12, 3, DK + 6 - t - 12, INK4); R(x, t + 12, 1, DK + 6 - t - 12, MAT.iron[2]); }
  for (let i = 0; i < 16; i++) { const x = o + 42 - i, y = t + 15 + Math.round(i * 0.45); R(x, y, 1, 3, INK4); R(x, y + 1, 1, 1, MAT.iron[3]); }
  // Chimenea de hierro del horno, hasta el techo.
  R(o - 1, t + 7, 5, TL - 26 - t - 7, INK4); R(o, t + 7, 3, TL - 26 - t - 7, MAT.iron[1]); R(o, t + 7, 1, TL - 26 - t - 7, MAT.iron[2]); R(o - 2, TL - 30, 7, 3, MAT.iron[1]);
  // Canaleta abierta de la Base: de los moldes, bajo el pórtico, hasta la cuba (se ve lo que baja).
  trough(BASEP(g));
  lanternPost(o + 0, FF + 10, 14);
  // Pozo del montacargas: cables y rellanos (la jaula se dibuja aparte, una sola para todo el pozo).
  R(o + 135, t, 1, H, '#8a8496'); R(o + 142, t, 1, H, '#8a8496'); for (const fy2 of [TR, FF]) { R(o + 132, fy2 + 2, 12, 2, MAT.iron[1]); R(o + 132, fy2 + 2, 12, 1, MAT.iron[3]); }
  blendBand(0, t + H - 6, W, 6, TH.gouda.far);
}
function trough(P) { for (let i = 1; i < P.length; i++) { const [a, b] = [P[i - 1], P[i]], x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]); R(x - 2, y - 2, w + 5, h + 5, INK4); R(x - 1, y - 1, w + 3, h + 3, MAT.iron[1]); if (h > w) R(x - 1, y - 1, 1, h + 3, MAT.iron[3]); else { R(x - 1, y + 1, w + 3, 1, MAT.iron[3]); R(x - 1, y - 1, w + 3, 1, MAT.iron[0]); } } }
const BASEP = (g) => [[g.o + 40, g.TL + 8], [g.o + 40, g.DK + 12], [g.o + 106, g.DK + 12], [g.o + 106, g.TR - 4]];
const RAWP = (g) => [[g.o + 58, g.DK - 11], [g.o + 46, g.DK - 11], [g.o + 46, g.t + 14], [g.o + 41, g.t + 15], [g.o + 27, g.t + 21]];

// ---- Estado visual, alimentado por los eventos ----
const V = { ext: 0, extT: 0, fly: 0, flyT: 0, flash: 0, jolt: null, tray: 0, tokens: [], strikes: 0, workerStrikes: 0, puffs: 0 };
const WHITE = {};
function whiteOf4(src) { if (WHITE[src]) return WHITE[src]; const i = im(src); if (!i.complete || !i.width) return null; const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); return (WHITE[src] = c); }
// La roca: grietas por búsqueda (c0-c4) y, con veta, cuánto queda (v5 llena → v1), contando el Raw del ciclo en marcha.
function rockSrc() {
  if (Z41.veinRevealed) { const left = Z41.veinRemaining + (Z41.drillJob ? Z41.drillJob.amount : 0), depl = Math.max(1, Math.ceil((6 * left) / EX.capacity)); return ROCKV[Math.max(0, Math.min(4, depl - 2))]; }
  return ROCKC[Math.min(4, Math.floor((5 * Z41.discover) / EX.need))];
}
const TOPS = {};
function rockTop(src, col) { if (!TOPS[src]) { const i = im(src); if (!i.complete || !i.width) return 3; const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data, tops = []; for (let x = 0; x < c.width; x++) { let y = 0; while (y < c.height && d[(y * c.width + x) * 4 + 3] < 128) y++; tops.push(y); } TOPS[src] = tops; } const T = TOPS[src]; return T[Math.max(0, Math.min(T.length - 1, col))]; }
// Dónde pisa el minero: la mediana de la superficie bajo sus pies (no el punto más alto, para no quedar colgado).
function minerFeet(g, x) { const src = rockSrc(), v = []; for (let c = x - g.rx + 7; c <= x - g.rx + 14; c++) v.push(rockTop(src, c)); v.sort((a, b) => a - b); return g.rb - 40 + v[v.length >> 1] + 1; }
function fire(x, y, w, h, now, power) { const f = Math.floor(now / 110) % 3; for (let i = 0; i < w; i++) { const hh = Math.max(1, Math.round(h * power * (0.45 + 0.55 * hash4(i, f, 3)))); for (let k = 0; k < hh; k++) R(x + i, y + h - 1 - k, 1, 1, MAT.fire[Math.min(4, Math.floor(((hh - k) / hh) * 3.2) + (power > 0.8 ? 1 : 0))]); } }
MAT.fire = ['#7a1a08', '#c83a10', '#ff7a1e', '#ffc040', '#fff2b0'];
const prog = (j) => (j ? 1 - j.remaining / j.total : 0);
// ---- Recursos que viajan (representación: no retrasan nada; la producción ya está hecha) ----
// Raw: pepita naranja angulosa. Base: bloque crema. Queso: rueda amarilla. Formas y colores distintos.
const rawTok = (x, y) => { R(x - 2, y - 1, 4, 3, INK4); R(x - 1, y - 2, 2, 1, INK4); R(x - 1, y - 1, 2, 2, '#e08a2e'); R(x - 1, y - 1, 1, 1, '#ffd890'); R(x, y, 1, 1, '#a44e14'); };
const baseTok = (x, y) => { R(x - 2, y - 2, 5, 4, INK4); R(x - 1, y - 1, 3, 2, '#efe6c4'); R(x - 1, y - 1, 3, 1, '#fffbea'); };
const coinTok = (x, y) => { R(x - 1, y - 2, 3, 1, INK4); R(x - 2, y - 1, 5, 3, INK4); R(x - 1, y + 2, 3, 1, INK4); R(x - 1, y - 1, 3, 3, '#f2c02a'); R(x - 1, y - 1, 1, 1, '#fffbd0'); R(x + 1, y + 1, 1, 1, '#b8800a'); };
const wheelTok = (x, y) => { R(x - 3, y - 2, 6, 4, INK4); R(x - 2, y - 2, 4, 1, INK4); R(x - 2, y - 1, 4, 2, '#f0b828'); R(x - 2, y - 1, 4, 1, '#fff6b0'); R(x - 1, y, 2, 1, '#b87410'); };
function pathAt(P, f) { const segs = []; let L = 0; for (let i = 1; i < P.length; i++) { const l = Math.abs(P[i][0] - P[i - 1][0]) + Math.abs(P[i][1] - P[i - 1][1]); segs.push([P[i - 1], P[i], l]); L += l; } let d = f * L; for (const [a, b, l] of segs) { if (d <= l) { const k = l ? d / l : 0; return [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k)]; } d -= l; } return P[P.length - 1]; }
function spawnTokens(kind, n, ms, stagger) { const now = performance.now(); for (let i = 0; i < n; i++) V.tokens.push({ kind, t0: now + i * stagger, ms, born: now }); }
// ---- Montacargas: una sola jaula para todo el pozo. Sube el queso de Cheddar a la tienda de la superficie. ----
const LIFT = { y: null, state: 'wait', t0: 0, load: 0, queue: 0, shop: 3, trips: 0, from: 0, to: 0 };
function liftYs() { const c = STOPS[1], g = geoC(c), tw = geoT(STOPS[0]); return { cheddar: g.TR - 9, town: tw.GR - 6 }; }
function liftTick(now) {
  const Y = liftYs(); if (LIFT.y === null) LIFT.y = Y.cheddar;
  const go = (to, ms, st) => Object.assign(LIFT, { state: st, t0: now, from: LIFT.y, to, ms });
  if (LIFT.state === 'wait' && LIFT.queue > 0) { LIFT.state = 'load'; LIFT.t0 = now; }
  else if (LIFT.state === 'load' && now - LIFT.t0 > 500) { LIFT.load = LIFT.queue; LIFT.queue = 0; go(Y.town, 3200, 'up'); emit41('liftUp', { load: LIFT.load }); }
  else if (LIFT.state === 'up' || LIFT.state === 'down') { const k = Math.min(1, (now - LIFT.t0) / LIFT.ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; LIFT.y = LIFT.from + (LIFT.to - LIFT.from) * e; if (k >= 1) { if (LIFT.state === 'up') { LIFT.state = 'unload'; LIFT.t0 = now; } else { LIFT.state = 'wait'; } } }
  else if (LIFT.state === 'unload' && now - LIFT.t0 > 700) { LIFT.shop = Math.min(6, LIFT.shop + LIFT.load); LIFT.trips++; emit41('liftArrive', { load: LIFT.load }); LIFT.load = 0; go(Y.cheddar, 2600, 'down'); }
}
function drawLift(now) {
  const o = SC.ox, y = Math.round(LIFT.y ?? liftYs().cheddar), x = o + 133;
  R(x + 4, -40, 1, y + 40, '#c8c2d4');
  box(x, y, 10, 11, '#5a5a68'); R(x + 1, y + 1, 8, 9, '#2a2a36'); R(x, y, 10, 1, '#8a8496'); R(x, y + 5, 10, 1, '#4a4a58');
  const n = LIFT.state === 'up' || LIFT.state === 'unload' ? LIFT.load : LIFT.state === 'load' ? LIFT.queue : 0;
  for (let i = 0; i < Math.min(2, n); i++) wheelTok(x + 3 + i * 4, y + 8 - (i % 2) * 2);
  if (LIFT.state === 'up' && Math.floor(now / 250) % 2) R(x + 4, y - 3, 2, 2, '#ffcf2e');
}
// ---- Lo que hacen las máquinas según su estado ----
on41((e) => {
  const st = STOPS[1]; if (!st) return; const g = geoC(st), now = e.t;
  if (e.type === 'hit') {
    if (e.source === 'manual') { V.jolt = { t0: now, d: e.crit ? [2, 1] : [1, 1] }; V.flash = now; V.strikes++; AV.swing = now; const p = [g.rx + 7, g.rb - 20]; spark(p[0], p[1], 'chip', e.crit ? 7 : 4); spark(p[0], p[1] + 2, 'dust', 1); if (e.crit) { spark(p[0], p[1] - 2, 'spark', 5); spark(p[0], p[1] - 4, 'glint', 2); } thunk(0.9 + Math.random() * 0.25, e.crit); }
    else { V.jolt = { t0: now, d: [1, 0] }; V.workerStrikes++; const p = [g.rx + 30, g.rb - 34]; spark(p[0], p[1], 'chip', 2); if (STOPS[S.stop] === st && S.focus === 'rock') thunk(0.8, false, true); }
    V.tap = null;
  }
  if (e.type === 'reveal') { for (let i = 0; i < 6; i++) spark(g.rx + 14 + i * 5, g.rb - 22 - (i % 3) * 3, 'glint', 1); chime(); }
  if (e.type === 'drillStart') { spark(g.o + 66, g.DK - 30, 'smoke'); }
  if (e.type === 'drillBoost') { V.flyT = now; spark(g.o + 72, g.rb - 22, 'spark', 2); }
  if (e.type === 'drillDone') { spawnTokens('raw', Math.min(4, e.amount), 2600, 160); }
  if (e.type === 'deeper') { DEP.cheddar = e.depth; const was = tierOf(e.depth - 1), now2 = tierOf(e.depth); if (now2 !== was) { S.drop = -(now2 - was) * 4; S.dropStart = S.drop; S.dropT0 = performance.now(); for (let i = 0; i < 8; i++) spark(g.X0 + 6 + i * 10, g.FF + 4, 'dust', 1); thunk(0.5, false); } paintLabels(); }
  if (e.type === 'refineStart') { V.steam = now; }
  if (e.type === 'refineDone') { V.tray = Math.min(3, V.tray + e.amount); spawnTokens('base', Math.min(3, e.amount), 1800, 220); setTimeout(() => (V.tray = Math.max(0, V.tray - e.amount)), 600); }
  if (e.type === 'cookDone') { const b = BR.cook; if (b) b.newWheel = (b.newWheel || 0) + 1; else LIFT.queue++; }
  if (e.type === 'sellDone') { LIFT.shop = Math.max(0, LIFT.shop - 1); V.sellT = now; }
});
const running = () => !!Z41.drillJob;
const refining = () => !!Z41.refJob;
const pressing = () => !!Z41.cookJob;
// ---- El jugador: su ratón (el de MAIN, swing_gold: pico dorado desde 16 rangos de Sharper Pick) trabaja en un andamio
// junto a la roca y da los golpes a mano: el pico llega a la roca en el fotograma del golpe. Los golpes del minero contratado
// son suyos y van a su ritmo; nunca golpea por el jugador. Con la veta abierta no pica (el juego no deja): baja el pico.
// El andamio baja con la roca (pisa siempre el fondo de la corta), así que el ratón nunca queda colgado.
const AV = { swing: -1e9 };
const PLAYER = (g) => ({ x: g.rx - 21, feet: g.rb - 13 });
function scaffold(g) {
  const { rx, rb } = g, y = rb - 12;
  for (const x of [rx - 20, rx - 4]) { R(x - 1, y + 1, 4, rb + 1 - y - 1, INK4); R(x, y + 1, 2, rb + 1 - y - 1, MAT.wood2[2]); R(x, y + 1, 1, rb + 1 - y - 1, MAT.wood2[3]); }
  brace(rx - 18, y + 3, rx - 5, rb - 1);
  R(rx - 23, y - 1, 26, 5, INK4); R(rx - 22, y, 24, 2, MAT.wood[3]); R(rx - 22, y + 2, 24, 1, MAT.wood[1]); R(rx - 22, y, 24, 1, MAT.wood[4]); for (let x = rx - 19; x < rx + 2; x += 7) R(x, y + 1, 1, 1, MAT.iron[3]);
}
function drawPlayer(g, now) {
  const dt = now - AV.swing, f = Z41.veinRevealed ? 0 : dt < 70 ? 3 : dt < 170 ? 4 : Math.floor(now / 600) % 2, p = PLAYER(g);
  sprite(SPR.swingP, 32, f, p.x, p.feet + 1 - 20, 32, 20);
  HITS.push({ k: 'm', stop: 1, st: 'rock', who: 'player', name: 'You', x: p.x + 1, y: p.feet - 19, w: 22, h: 20, player: true });
}
function drawCheddar(st, now) {
  baked(st, paintCheddar);
  const g = geoC(st), { t, o, TL, TR, DK, FF, rx, rb } = g;
  // REFINE: el fuego sube mientras refina y cuando el refinador lo aviva; el manómetro marca el ciclo; la válvula suelta vapor al
  // arrancar; la chimenea humea mientras trabaja.
  const stoke = BR.refiner && BR.refiner.act === 'stoke' && BR.refiner.on && Math.floor((now - BR.refiner.ta) / 300) % 2 ? 0.25 : 0;
  const pw = refining() ? 0.72 + 0.18 * Math.sin(now / 170) + stoke : 0.22;
  ctx.drawImage(artFurnace(), o - 14, TL - 28); fire(o - 4, TL - 9, 10, 12, now, Math.min(1, pw)); glow(o + 1, TL - 2, '#ff8a2e', Math.round(10 + 7 * pw));
  if (refining() && now % 700 < 30) spark(o + 1, t + 9, 'smoke');
  ctx.drawImage(artStill(), o + 14, TL - 24);
  { const a = -2.2 + prog(Z41.refJob) * 2.6; R(o + 27 + Math.round(Math.cos(a) * 1.4), TL - 6 + Math.round(Math.sin(a) * 1.4), 1, 1, INK4); R(o + 27, TL - 6, 1, 1, INK4); }
  if (V.steam && now - V.steam < 500) { const k = (now - V.steam) / 500; ctx.globalAlpha = 0.5 * (1 - k); disc(o + 20, TL - 26 - Math.round(k * 6), 2 + Math.round(k * 3), '#e8e4f0'); ctx.globalAlpha = 1; }
  ctx.drawImage(artTray(), o + 33, TL + 4); for (let i = 0; i < Math.min(3, V.tray); i++) ctx.drawImage(artBar(), o + 34 + i * 4, TL + 3);
  if (refining()) { const d = Math.floor((now % 1400) / 150); if (now % 1400 < 900) R(o + 40, TL - 3 + d, 1, 1, MAT.cream[3]); }
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
  // CHEESE: taller sin toldo (el toldo es de la tienda): alero de tablas, rótulo con la cuña, baldas de curado, cuba con su
  // paleta, prensa de husillo (se mueve con cada hornada) y moldes.
  ctx.drawImage(artShelfN(0), o + 105, TR - 27); ctx.drawImage(artVat(), o + 104, TR - 13);
  if (pressing() && BR.cook && BR.cook.act === 'stir' && BR.cook.on) ctx.drawImage(artPaddle(Math.floor(now / 260) % 2), o + 109, TR - 18); else ctx.drawImage(artPaddle(0), o + 109, TR - 18);
  ctx.drawImage(artFrame(36), o + 98, TR - 33); ctx.drawImage(artEave(40), o + 96, TR - 39); ctx.drawImage(artCheeseSign(), o + 99, TR - 30);
  ctx.drawImage(artPress(pressing() ? Math.floor(prog(Z41.cookJob) * 6) % 2 : 0), o + 118, TR - 16); ctx.drawImage(artMolds(), o + 97, TR - 3);
  for (let i = 0; i < Math.min(3, LIFT.queue); i++) wheelTok(o + 130 - (i % 2) * 3, TR + 1 - Math.floor(i / 2) * 3);
  // El andamio del jugador y la roca.
  scaffold(g);
  ctx.globalAlpha = 0.45; R(rx + 6, rb, 44, 2, '#000'); R(rx + 10, rb + 2, 36, 1, '#000'); ctx.globalAlpha = 1;
  const j = V.jolt && now - V.jolt.t0 < 90 ? (now - V.jolt.t0 < 45 ? V.jolt.d : [-V.jolt.d[0], 0]) : [0, 0];
  const src = rockSrc(); sprite(src, 54, 0, rx + j[0], rb - 40 + j[1], 54, 42);
  if (V.flash && now - V.flash < 60) { const w = whiteOf4(src); if (w) { ctx.globalAlpha = 0.55; ctx.drawImage(w, rx + j[0], rb - 40 + j[1]); ctx.globalAlpha = 1; } }
  if (Z41.veinRevealed && Math.floor(now / 260) % 4 === 0) R(rx + 20 + Math.floor(hash4(Math.floor(now / 260), 1) * 14), rb - 18 + Math.floor(hash4(Math.floor(now / 260), 2) * 6), 1, 1, '#fff6b0');
  // La barra baja por delante de la roca hasta la veta y gira solo durante el ciclo.
  R(sx - 2, DK + 4, 5, tipY - DK - 4, INK4); R(sx - 1, DK + 4, 3, tipY - DK - 4, MAT.steel[2]); R(sx - 1, DK + 4, 1, tipY - DK - 4, MAT.steel[3]);
  for (let y = DK + 5 + (run ? Math.floor(now / 50) % 4 : 0); y < tipY - 1; y += 4) R(sx - 1, y, 3, 1, MAT.steel[1]);
  ctx.drawImage(artBit(run ? Math.floor(now / 70) % 2 : 0), sx - 4, tipY - 2);
  if (run && V.ext > 0.95) { if (Math.floor(now / 90) % 3 === 0) spark(sx + (Math.random() < 0.5 ? -3 : 3), tipY + 5, 'spark'); const k = prog(Z41.drillJob); rawTok(sx, Math.round(tipY - k * (tipY - DK - 6))); }
  // Recursos de camino: Raw (elevador → tolva), Base (canaleta → cuba).
  for (let i = V.tokens.length - 1; i >= 0; i--) { const k = V.tokens[i], f = (now - k.t0) / k.ms; if (f < 0) continue; if (f >= 1) { V.tokens.splice(i, 1); continue; } const [x, y] = pathAt(k.kind === 'raw' ? RAWP(g) : BASEP(g), f); (k.kind === 'raw' ? rawTok : baseTok)(x, y); }
  pushStations(st, g);
  if (S.focus && STOPS[S.stop] === st) for (const r of g.st[S.focus] || []) sel(r);
  drawWorkers(st, g, now);
  drawPlayer(g, now);
  plaque(o + 2, FF - 30, DEP.cheddar, TH.cheddar);
}
const artShelfN = (aged) => art('shelfN' + aged, () => { const p = Px(28, 8); p.rect('wood', 0, 6, 28, 2, { shade: 'top' }); for (let i = 0; i < 4; i++) { const m = (i + aged) % 3 === 0 ? 'aged' : 'cheese'; p.ell(m, 3.5 + i * 7, 3.5, 3.4, 2.6); p.hline(1 + i * 7, 4, 6, 1); } return p.render(); });

// ---- Partículas (con tope) ----
const PT4 = [];
function spark(x, y, kind, n = 1) { for (let i = 0; i < n && PT4.length < 70; i++) { const a = Math.random() * Math.PI * 2, v = kind === 'chip' ? 0.04 + Math.random() * 0.05 : kind === 'dust' ? 0.008 : kind === 'smoke' ? 0.006 : 0.05; PT4.push({ x, y, vx: Math.cos(a) * v, vy: kind === 'chip' ? -0.06 - Math.random() * 0.05 : kind === 'smoke' ? -0.012 : Math.sin(a) * v, kind, t0: performance.now(), life: kind === 'chip' ? 650 : kind === 'dust' ? 520 : kind === 'smoke' ? 1500 : kind === 'glint' ? 700 : 220, c: kind === 'chip' ? (Z41.veinRevealed ? ['#9aa0b4', '#ffcf2e', '#c8ccd8'] : ['#9aa0b4', '#6a7088', '#c8ccd8'])[i % 3] : null, floor: y + 6 + Math.random() * 4 }); } }
function drawParticles(now, dt) {
  for (let i = PT4.length - 1; i >= 0; i--) {
    const p = PT4[i], a = (now - p.t0) / p.life; if (a >= 1) { PT4.splice(i, 1); continue; }
    if (p.kind === 'chip') { p.vy += 0.00028 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > p.floor) { p.y = p.floor; p.vy *= -0.35; p.vx *= 0.6; } R(p.x, p.y, a < 0.7 ? 2 : 1, a < 0.7 ? 2 : 1, p.c); }
    else if (p.kind === 'dust') { const r = Math.round(1 + a * 3); disc(Math.round(p.x + p.vx * (now - p.t0)), Math.round(p.y - a * 4), r, '#d8ccb4', 0.35 * (1 - a)); }
    else if (p.kind === 'smoke') { p.x += 0.004 * dt; p.y += p.vy * dt; disc(Math.round(p.x), Math.round(p.y), Math.round(1 + a * 3), '#8a8090', 0.3 * (1 - a)); }
    else if (p.kind === 'glint') { R(p.x, p.y, 1, 1, '#fff6b0'); if (a < 0.5) { R(p.x - 1, p.y, 3, 1, '#ffd860'); R(p.x, p.y - 1, 1, 3, '#ffd860'); } }
    else { p.x += p.vx * dt; p.y += p.vy * dt; R(p.x, p.y, 1, 1, a < 0.5 ? '#fff2b0' : '#ff9a2e'); }
  }
}
// ---- Sonido (sintetizado; tras el primer toque; con interruptor) ----
let AC = null, NB = null;
function audio() { if (!SOUND_NEW) return null; try { AC ||= new (window.AudioContext || window.webkitAudioContext)(); if (!NB) { NB = AC.createBuffer(1, AC.sampleRate * 0.2, AC.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return AC; } catch (e) { return null; } }
function thunk(pitch = 1, crit = false, soft = false) {
  const a = audio(); if (!a) return; const t = a.currentTime, vol = soft ? 0.1 : 0.32;
  const n = a.createBufferSource(); n.buffer = NB; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100 * pitch; const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08); n.connect(f).connect(g).connect(a.destination); n.start(t); n.stop(t + 0.09);
  const o = a.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(150 * pitch, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.09); const g2 = a.createGain(); g2.gain.setValueAtTime(vol * 0.9, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1); o.connect(g2).connect(a.destination); o.start(t); o.stop(t + 0.11);
  if (crit) { const o2 = a.createOscillator(); o2.type = 'square'; o2.frequency.setValueAtTime(1320, t); o2.frequency.exponentialRampToValueAtTime(990, t + 0.12); const g3 = a.createGain(); g3.gain.setValueAtTime(0.06, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o2.connect(g3).connect(a.destination); o2.start(t); o2.stop(t + 0.15); }
}
function chime() { const a = audio(); if (!a) return; const t = a.currentTime; [784, 988, 1319].forEach((fq, i) => { const o = a.createOscillator(); o.type = 'triangle'; o.frequency.value = fq; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.07 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.25); o.connect(g).connect(a.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.3); }); }
function denied() { const a = audio(); if (!a) return; const t = a.currentTime, o = a.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.12); const g = a.createGain(); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.15); }

// ---------- RATONES VIVOS V4.1 ----------
// Cada oficio hace lo que su máquina pide en ese momento (los estados reales de la simulación espejo):
//  · Minero: con la roca buscando, pica a su ritmo real (el impacto es el golpe del juego: el pico sube cuando su contador va a
//    llegar y cae justo en el golpe). Con la veta abierta deja de picar (el juego no le deja) y mira cómo trabaja la perforadora.
//  · Perforador: con un ciclo en marcha, maneja el cuadro (tira de la palanca al arrancar y al acelerar) y a veces mira la broca;
//    sin veta, espera y se asoma a ver cómo va el minero.
//  · Refinador: con un ciclo en marcha, aviva el horno, gira la válvula y mira el manómetro; sin Raw, espera mirando la tolva.
//  · Quesera: con una hornada en marcha, aprieta la prensa, remueve la cuba o consulta el recetario; al acabar una hornada lleva la
//    rueda al montacargas; sin Base, espera junto a la cuba.
// Transiciones: anticipación antes de reaccionar, un instante quieto antes de darse la vuelta, andar que acelera y frena, y las
// reacciones pausan el trabajo (no lo reinician). Solo poses aprobadas de MICE; el pico y la rueda en la pata son piezas aparte
// (pendientes de aprobación).
const BR = {};
const seedOf = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
function rnd(b) { b.seed = (Math.imul(b.seed, 1664525) + 1013904223) >>> 0; return b.seed / 4294967296; }
const between = (b, a, c) => a + rnd(b) * (c - a);
function wpick(b, list) { const tot = list.reduce((s, x) => s + x[1], 0); let r = rnd(b) * tot; for (const [k, w] of list) { if ((r -= w) <= 0) return k; } return list[0][0]; }
function brainsReset() { for (const k of Object.keys(BR)) delete BR[k]; }
let MINERX = null;
// El sitio del minero: la parte más llana de la cresta, para que pise de verdad (se mide en el sprite).
function minerSpot(g) { if (MINERX !== null) return g.rx + MINERX; const src = ROCKC[0]; if (!TOPS[src] && !im(src).complete) return g.rx + 8; let best = g.rx + 8, bs = 99; for (let x = g.rx + 2; x <= g.rx + 12; x++) { const v = []; for (let c = x - g.rx + 7; c <= x - g.rx + 14; c++) v.push(rockTop(src, c)); const sl = Math.max(...v) - Math.min(...v) + Math.min(...v) * 0.2; if (sl < bs) { bs = sl; best = x; } } MINERX = best - g.rx; return best; }
function brain(who, g) {
  if (!BR[who]) { const c = CREW.cheddar[who]; BR[who] = { who, m: c, seed: seedOf(c.name), x: who === 'miner' ? minerSpot(g) : g.who[who][0], v: 0, tx: null, flip: who === 'refiner', want: null, turnAt: 0, act: 'idle', on: true, ta: 0, until: 0, react: null, log: [], blinkAt: 0, pulseAt: -1e9, said: {}, newWheel: 0, hitAt: -1e9, gap: 0, o: g.o }; }
  return BR[who];
}
function react(who, kind, delay = 0) { const b = BR[who]; if (!b) return; const now = performance.now() + delay; if (b.react && now - b.react.t0 < 500) return; b.react = { kind, t0: now }; b.log.push(['react:' + kind, now]); if (b.on && b.until !== Infinity) b.until += 1000; }
// Qué toca hacer ahora, según el estado real de su puesto.
function planOf(b, g) {
  const o = g.o, last = b.act;
  const pick = (L) => wpick(b, L.filter(([k]) => k !== last || k === 'work' || k === 'operate' || k === 'press' || k === 'wait'));
  if (b.who === 'miner') { if (!Z41.veinRevealed) return { act: 'work', tx: minerSpot(g), face: false, dur: Infinity }; const a = pick([['watch', 3], ['inspect', 2]]); return { act: a, tx: minerSpot(g), face: false, dur: between(b, 1800, 3000) }; }
  if (b.who === 'driller') {
    if (running() || Z41.veinRevealed) { const a = pick([['operate', 5], ['check', 1.4]]); return a === 'check' ? { act: a, tx: o + 52, face: false, dur: between(b, 1300, 1900) } : { act: a, tx: o + 70, face: false, dur: between(b, 2600, 4200) }; }
    const a = pick([['wait', 4], ['peek', 2]]); return a === 'peek' ? { act: a, tx: o + 50, face: true, dur: between(b, 1300, 1900) } : { act: a, tx: o + 66 + Math.round(rnd(b) * 4), face: false, dur: between(b, 1600, 2600) };
  }
  if (b.who === 'refiner') {
    if (!refining() && SIM41.refStatus() === 'no-raw') return { act: 'wait', tx: o + 8, face: false, dur: between(b, 1800, 2600) };
    const a = pick([['stoke', 4], ['gauge', 2], ['valve', 1.5]]), T = { stoke: [o + 4, true], gauge: [o + 6, false], valve: [o + 2, false] }[a]; return { act: a, tx: T[0], face: T[1], dur: between(b, 1400, 2400) };
  }
  if (b.newWheel > 0) return { act: 'carry', tx: o + 122, face: false, dur: 500 };
  if (!pressing() && SIM41.cookStatus() === 'no-base') return { act: 'wait', tx: o + 100, face: false, dur: between(b, 1800, 2600) };
  const a = pick([['press', 4], ['stir', 2], ['book', 1], ['inspect', 1.2]]); return { act: a, tx: { press: o + 97, stir: o + 100, book: o + 99, inspect: o + 106 }[a], face: false, dur: between(b, 1500, 2600) };
}
// ¿Sigue teniendo sentido lo que hace? Si no, acaba (con su pausa de transición), sin cortar un golpe a medias.
function stillValid(b, now) {
  if (b.who === 'miner') return b.act === 'work' ? !Z41.veinRevealed : Z41.veinRevealed || now - b.ta < 300;
  if (b.who === 'driller') return (b.act === 'wait' || b.act === 'peek') ? !Z41.veinRevealed : true;
  if (b.who === 'refiner') return b.act === 'wait' ? !refining() && SIM41.refStatus() === 'no-raw' : refining() || SIM41.refStatus() !== 'no-raw';
  if (b.who === 'cook') return b.act === 'carry' ? true : b.act === 'wait' ? !pressing() && SIM41.cookStatus() === 'no-base' && !b.newWheel : !b.newWheel && (pressing() || SIM41.cookStatus() !== 'no-base');
  return true;
}
// Los eventos que les llegan: reaccionan o marcan el pulso de la palanca.
on41((e) => {
  const now = e.t;
  if (e.type === 'hit' && e.source === 'worker' && BR.miner) BR.miner.hitAt = now;
  if (e.type === 'reveal') { react('miner', 'vein', 180); if (BR.driller) { react('driller', 'vein'); BR.driller.hurry = true; BR.driller.until = Math.min(BR.driller.until, now + 1000); } }
  if (e.type === 'deeper' && BR.miner) { react('miner', 'deeper'); }
  if ((e.type === 'drillStart' || e.type === 'drillBoost') && BR.driller) BR.driller.pulseAt = now;
  if (e.type === 'drillDone' && BR.driller && BR.driller.act === 'operate') BR.driller.glanceAt = now;
  if (e.type === 'refineStart' && BR.refiner) BR.refiner.pulseAt = now;
});
function poseOf(b, now, dt, g) {
  // Reacción en curso: anticipación, salto, aterrizaje y la cara; el trabajo queda en pausa.
  if (b.react && now >= b.react.t0) { const r = now - b.react.t0, k = b.react.kind; if (r < 1000) { const dy = r < 80 ? 1 : r < 200 ? -2 : r < 300 ? -1 : r < 380 ? 1 : 0, face = k === 'stop' ? 'down' : k === 'vein' ? (r < 550 ? 'wow' : 'happy') : k === 'deeper' ? 'wow' : 'happy'; return { x: b.x, flip: k === 'greet' ? false : b.flip, o: { face, tail: k !== 'stop', spark: k === 'upgrade' && r > 200 && r < 900 }, dy: k === 'deeper' ? (r < 120 ? 1 : 0) : dy, pick: b.who === 'miner' && !Z41.veinRevealed ? 1 : undefined }; } b.react = null; }
  // Andar: acelera, frena al llegar y las patas van con la distancia recorrida.
  if (b.tx != null && Math.abs(b.x - b.tx) > 0.4) {
    const d = b.tx - b.x, s = Math.sign(d), vmax = b.hurry ? 0.034 : 0.018; b.v = Math.min(vmax, b.v + 0.00012 * dt); const v = Math.min(b.v, Math.max(0.006, Math.abs(d) * 0.01));
    if (s < 0 !== b.flip && now - b.turnAt > 90) { b.turnAt = now; b.flip = s < 0; return { x: b.x, flip: b.flip, o: {}, dy: 0 }; }
    b.x += s * Math.min(v * dt, Math.abs(d)); b.walked = (b.walked || 0) + v * dt;
    return { x: b.x, flip: b.flip, o: { legs: Math.floor(b.walked / 3) % 2 ? 'a' : 'b' }, dy: 0, pick: b.who === 'miner' && b.act === 'work' ? 1 : undefined, carry: b.act === 'carry' && b.newWheel ? 'w' : null };
  }
  b.v = 0;
  if (!b.on) { b.on = true; b.hurry = false; b.ta = now; b.until = now + b.dur; }
  // Darse la vuelta: un instante quieto y de frente a lo que va a hacer.
  if (b.face !== null && b.face !== undefined && b.face !== b.flip) { if (!b.turnAt || now - b.turnAt > 120) { b.turnAt = now; return { x: b.x, flip: b.flip, o: {}, dy: 0 }; } b.flip = b.face; }
  const lt = now - b.ta, k = b.act, flip = b.flip;
  if (k === 'work') {
    // El pico sube cuando el contador del minero va a llegar y cae en el golpe real.
    const left = EX.minerMs - Z41.minerAcc, since = now - b.hitAt;
    if (since < 170) return { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 };
    if (left < 380 && !Z41.veinRevealed) return { x: b.x, flip: false, o: {}, dy: left < 120 ? -1 : 0, pick: 0 };
    return { x: b.x, flip: false, o: {}, dy: 0, pick: 1 };
  }
  if (k === 'watch') return { x: b.x, flip: false, o: { face: lt < 1200 ? 'happy' : undefined, tail: lt < 1200 }, dy: 0 };
  if (k === 'inspect' || k === 'check' || k === 'gauge') return { x: b.x, flip, o: { glass: true }, dy: 0 };
  if (k === 'peek') return { x: b.x, flip: true, o: { glass: true }, dy: 0 };
  if (k === 'operate') { const pulse = now - b.pulseAt < 140 ? 1 : 0, glance = b.glanceAt && now - b.glanceAt < 300; return { x: b.x, flip: glance ? true : false, o: {}, dy: pulse }; }
  if (k === 'wait') {
    const say = { driller: ['No vein yet', 4000], refiner: ['Need Raw!', 2000], cook: ['Need Base!', 2000] }[b.who];
    if (say && now - (b.waitFrom || now) > say[1] && !b.said[b.episode]) { b.said[b.episode] = true; sayB(b, say[0], now); }
    return { x: b.x, flip, o: b.who === 'driller' ? { legs: lt % 1400 < 700 ? 'tap' : undefined, face: lt < 900 ? 'grump' : undefined } : { face: 'down', ear: b.who === 'refiner', legs: lt % 1600 < 800 ? 'tap' : undefined }, dy: 0 };
  }
  if (k === 'stoke' || k === 'valve') { const p = now - b.pulseAt < 140 ? 1 : Math.floor(lt / 300) % 2; return { x: b.x, flip, o: k === 'stoke' ? { ear: true } : {}, dy: p }; }
  if (k === 'press') return { x: b.x, flip: false, o: {}, dy: Math.floor(prog(Z41.cookJob) * 12) % 2 };
  if (k === 'stir') return { x: b.x, flip: false, o: {}, dy: Math.floor(lt / 260) % 2 };
  if (k === 'book') return { x: b.x, flip: false, o: { book: Math.floor(lt / 700) % 2 ? 2 : 1 }, dy: 0 };
  if (k === 'carry') { if (b.newWheel) { b.newWheel--; LIFT.queue++; b.log.push(['place', now]); } return { x: b.x, flip: false, o: { tail: true }, dy: lt < 160 ? -1 : 0 }; }
  return { x: b.x, flip, o: {}, dy: 0 };
}
// Un bocadillo a la vez para toda la colonia, y como mucho uno cada 5 s.
const BUB = { who: null, text: '', t0: -1e9, until: 0 };
function sayB(b, text, now) { if (now - BUB.t0 < 5000) return; Object.assign(BUB, { who: b.who, text, t0: now, until: now + 2200 }); }
let LASTT = 0;
function drawWorkers(st, g, now) {
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
    if (p.pick !== undefined && p.pick >= 0) ctx.drawImage(artPick(p.pick), x + 9, feet - 21 + p.dy);
    if (p.carry) ctx.drawImage(artCarry(p.carry), p.flip ? x - 1 : x + 15, feet - 13 + p.dy);
    b.px = x; b.py = feet; b.pose = p;
    HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: g.who[who][2], who, name: b.m.name, x, y: feet - 20, w: 22, h: 20, crest: who === 'miner' });
  }
}

// ==== ad/03_ad_px.js ====
// ---------- ART DIRECTION · herramientas de píxel ----------
// Mismo lenguaje que los edificios Pulido+ aprobados (buildings.px.js): rampas de 5 tonos, luz arriba a la izquierda, lado en
// sombra con trama, oclusión abajo, sombras arrojadas en trama y huecos hundidos. Un único contorno para todo: el de los ratones.
// INK ('#1b1220', la tinta de los ratones) ya existe en el código compartido.
const mixc = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const hh2 = (x, y, s = 0) => { let n = Math.imul(x * 374761393 ^ y * 668265263 ^ s * 982451653, 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 13), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
const DI = (x, y) => (x + y) % 2 === 0, SP = (x, y) => x % 2 === 0 && y % 2 === 0;
// Rampas (0 = luz, 4 = sombra profunda).
const PAL = {
  pla: ['#fffaea', '#f4e4bc', '#e2c894', '#b8966a', '#7a5e4c'],
  plb: ['#f4fbff', '#dceaf2', '#b4c8d8', '#8094aa', '#4e5a70'],
  woo: ['#e0a86e', '#b87a44', '#8b5a2b', '#633c22', '#3e2420'],
  wod: ['#b07a50', '#8a5634', '#6a3e24', '#4a2a1a', '#2c1812'],
  stn: ['#d4d8e2', '#a8aec0', '#7c8298', '#565b70', '#363a4a'],
  stw: ['#e8dcc4', '#c8b898', '#a08c6e', '#76644e', '#4c3e32'],
  bri: ['#f0a880', '#d07a58', '#a85a3a', '#7a3a2a', '#4e2428'],
  chz: ['#fff6b8', '#ffd84a', '#f5ab12', '#c97a08', '#7a4606'],
  rnd: ['#f2b860', '#d88a2a', '#a85a14', '#74380e', '#46200a'],
  cop: ['#ffd8a8', '#eba060', '#c06a38', '#844224', '#4e2418'],
  ver: ['#d2f4e6', '#8ad8be', '#4aa88e', '#2c7262', '#18443c'],
  gla: ['#f0fcff', '#c4ecfc', '#86c6ea', '#4e84b2', '#2a4470'],
  red: ['#ffa08c', '#e8523a', '#b8341f', '#7e2018', '#4a1210'],
  cre: ['#fffdf2', '#f6ecd0', '#dcca9e', '#ac9672', '#6e5c48'],
  brn: ['#e88a6a', '#c0543c', '#8e3628', '#5e2420', '#3a1418'],
  sla: ['#9aa8c0', '#6c7a96', '#4a5672', '#323a52', '#1e2236'],
  irn: ['#d0d0dc', '#a0a0b0', '#707080', '#484856', '#2a2a34'],
  lea: ['#c8ea84', '#86c04e', '#549036', '#346028', '#1c3a1a'],
  lead: ['#9ccf6a', '#62a040', '#407a30', '#2a5224', '#16301a'],
  gra: ['#b4dc78', '#7cb44c', '#5a9038', '#3c662a', '#22401c'],
  dir: ['#e4c896', '#c8a470', '#a07e52', '#76583a', '#4a3626'],
  soi: ['#9a7650', '#7a5a3a', '#5e4430', '#463224', '#2e2018'],
  str: ['#fff0a8', '#ecc860', '#c89a3a', '#966c26', '#5e4216'],
  gld: ['#fffbd0', '#ffe070', '#f2c02a', '#b8800a', '#6a4206'],
  win: ['#fffbe0', '#ffe8a0', '#ffc860', '#e0903a', '#9a5a26'],
  chalk: ['#3e4a40', '#2e3a32', '#243028', '#1a221e', '#101612'],
};
// Lienzo de píxeles con helpers. Todo en coordenadas enteras.
function PB(w, h) {
  const d = new Array(w * h).fill(null);
  const o = {
    w, h, d,
    px(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = c; return o; },
    get: (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? d[y * w + x] : null),
    clear(x, y) { if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = null; return o; },
    rect(x, y, ww, hh, c) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) o.px(x + i, y + j, typeof c === 'function' ? c(x + i, y + j) : c); return o; },
    hline: (x, y, n, c) => o.rect(x, y, n, 1, c),
    vline: (x, y, n, c) => o.rect(x, y, 1, n, c),
    fill(test, c, x0 = 0, y0 = 0, x1 = w, y1 = h) { for (let y = Math.max(0, y0); y < Math.min(h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) if (test(x, y)) o.px(x, y, typeof c === 'function' ? c(x, y) : c); return o; },
    ell: (cx, cy, rx, ry, c) => o.fill((x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1, c, Math.floor(cx - rx - 1), Math.floor(cy - ry - 1), Math.ceil(cx + rx + 1), Math.ceil(cy + ry + 1)),
    poly: (P, c) => o.fill((x, y) => inPoly(x + 0.5, y + 0.5, P), c),
    line(x0, y0, x1, y1, c) { bres(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), (x, y) => o.px(x, y, c)); return o; },
    // Contorno exterior: tinta donde un píxel vacío toca uno lleno (4 vecinos).
    outline(ink = INK) { const add = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (d[y * w + x]) continue; if (o.get(x - 1, y) || o.get(x + 1, y) || o.get(x, y - 1) || o.get(x, y + 1)) add.push(y * w + x); } for (const i of add) d[i] = ink; return o; },
    stamp(rows, pal, x0, y0) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && pal[ch]) o.px(x0 + i, y0 + j, pal[ch]); })); return o; },
    // Copia otro lienzo encima (sus píxeles vacíos no tapan).
    put(b, x0, y0) { for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) { const c = b.d[y * b.w + x]; if (c) o.px(x0 + x, y0 + y, c); } return o; },
    canvas() { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h); for (let i = 0; i < d.length; i++) { const v = d[i]; if (!v) continue; const n = parseInt(v.slice(1), 16); img.data[i * 4] = n >> 16; img.data[i * 4 + 1] = (n >> 8) & 255; img.data[i * 4 + 2] = n & 255; img.data[i * 4 + 3] = 255; } g.putImageData(img, 0, 0); return c; },
  };
  return o;
}
// Caja con volumen (la de los edificios aprobados): canto de tinta, cara con luz arriba e izquierda, lado derecho en trama, oclusión abajo.
function vbox(c, x, y, w, h, R, { edge = INK, side = 3, ao = 2, top = 2 } = {}) {
  if (edge) c.rect(x, y, w, h, edge);
  const ix = x + (edge ? 1 : 0), iy = y + (edge ? 1 : 0), iw = w - (edge ? 2 : 0), ih = h - (edge ? 2 : 0);
  c.rect(ix, iy, iw, ih, R[2]); c.rect(ix, iy, iw, Math.min(top, ih), R[1]); c.hline(ix, iy, iw, R[0]); c.vline(ix, iy + 1, ih - 1, R[1]);
  for (let k = 0; k < side; k++) { const xx = ix + iw - 1 - k; for (let yy = iy + 1; yy < iy + ih; yy++) if (k === 0 || (k === 1 && DI(xx, yy)) || (k === 2 && SP(xx, yy))) c.px(xx, yy, R[3]); }
  for (let j = 0; j < ao; j++) { const yy = iy + ih - 1 - j; for (let xx = ix; xx < ix + iw; xx++) if (j === 0 || (j === 1 && DI(xx, yy))) c.px(xx, yy, j === 0 ? R[4] : R[3]); }
}
// Cilindro de pie: brillo a un tercio por la izquierda, sombra a la derecha.
function cylv(c, x, y, w, h, R, edge = INK) { if (edge) c.rect(x, y, w, h, edge); const n = w - 2; for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) : 0, t = f < 0.15 ? 1 : f < 0.4 ? 0 : f < 0.65 ? 2 : f < 0.85 ? 3 : 4; c.vline(x + 1 + i, y + 1, h - 2, R[t]); } }
// Hueco hundido: dentro oscuro, labio con luz abajo y a la derecha.
function recess(c, x, y, w, h, inner, lip) { c.rect(x, y, w, h, inner); c.hline(x, y, w, INK); c.vline(x, y, h, INK); if (lip) { c.hline(x, y + h, w + 1, lip); c.vline(x + w, y, h, lip); } }
// Sombra arrojada en trama (bajo un alero) sobre una pared de rampa R.
function castSh(c, x, y, w, R, rows = 3) { for (let xx = x; xx < x + w; xx++) { c.px(xx, y, R[3]); if (rows > 1 && DI(xx, y + 1)) c.px(xx, y + 1, R[3]); if (rows > 2 && SP(xx, y + 2)) c.px(xx, y + 2, R[3]); } }
// Tablas verticales con juntas y vetas.
function planksV(c, x, y, w, h, R, step = 4, seed = 1) { vbox(c, x, y, w, h, R, { edge: null, side: 2, ao: 2, top: 1 }); for (let xx = x + step; xx < x + w; xx += step) { c.vline(xx, y, h, R[3]); c.vline(xx + 1, y + 1, h - 2, R[1]); } for (let i = 0; i < (w * h) / 22; i++) { const xx = x + Math.floor(hh2(i, 3, seed) * w), yy = y + Math.floor(hh2(i, 5, seed) * (h - 2)); if (c.get(xx, yy) === R[2]) c.px(xx, yy, R[3]).px(xx, yy + 1, R[3]); } }
// Piedras de mampostería (filas, juntas, cada piedra con luz arriba y sombra abajo).
function masonry(c, x, y, w, h, R, rowH = 4, seed = 2) {
  c.rect(x, y, w, h, R[3]);
  for (let r = 0, yy = y; yy < y + h; r++, yy += rowH) { let xx = x - (r % 2 ? 3 : 0); while (xx < x + w) { const sw = 5 + Math.floor(hh2(xx, yy, seed) * 4), a = Math.max(x, xx), b = Math.min(x + w, xx + sw - 1), hh = Math.min(rowH - 1, y + h - yy); if (b > a && hh > 0) { c.rect(a, yy, b - a, hh, R[2]); c.hline(a, yy, b - a, R[1]); c.px(a, yy, R[0]); c.hline(a, yy + hh - 1, b - a, R[3]); } xx += sw; } }
}
// Sombra de contacto en el suelo (se pinta en la escena, no en el sprite).
function groundShadow(g, x, y, w, a = 0.35) { g.globalAlpha = a; g.fillStyle = '#000'; g.fillRect(x + 2, y, w - 4, 1); g.fillRect(x + 5, y + 1, w - 10, 1); g.globalAlpha = 1; }

// ==== ad/04_ad_bld.js ====
// ---------- ART DIRECTION · edificios de la superficie (propuesta, no aprobados) ----------
// Cuatro siluetas que no se confunden: HOUSE es ancha y baja bajo un tejado de cuña de queso; LAB es una torre con cúpula
// y telescopio; SHOP es un puesto abierto con toldo; PANTRY es un almacén con montacargas de carga en la buhardilla.
// Escala: el ratón oficial mide 22 × 20; una puerta, unos 15 de alto. El suelo es la última fila de cada lienzo.
const ADC = {};
const adArt = (k, f) => (ADC[k] ||= f());
// Cara de un tejado o de una cuña: tono por posición (luz arriba a la izquierda) con un poco de ruido.
const faceTone = (R, x, y, x0, y0, w, h, n = 0.08) => { const d = ((x - x0) / w) * 0.45 + ((y - y0) / h) * 0.7 + (hh2(x, y, 9) - 0.5) * n; return R[d < 0.3 ? 0 : d < 0.55 ? 1 : d < 0.85 ? 2 : 3]; };
const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy))); return Math.hypot(px - (ax + vx * t), py - (ay + vy * t)); };

// ---- HOUSE · 62 × 54: casita bajo un tejado de cuña de queso, puerta redonda, ventana redonda con luz cálida ----
const houseSprite = () => adArt('house', () => {
  const c = PB(62, 54), P = PAL;
  // Chimenea (detrás del tejado).
  vbox(c, 44, 7, 7, 18, P.stn, { side: 2, ao: 0 }); c.rect(43, 6, 9, 2, INK); c.hline(44, 6, 7, P.stn[1]); for (let y = 10; y < 22; y += 3) c.hline(45, y, 5, P.stn[3]);
  // Muros: revoco con entramado de madera.
  vbox(c, 8, 27, 46, 21, P.pla, { side: 3, ao: 2 });
  for (const x of [9, 31, 52]) { c.vline(x, 28, 19, P.woo[2]); c.vline(x + 1, 28, 19, P.woo[3]); c.px(x, 28, P.woo[1]); }
  c.hline(9, 28, 44, P.woo[2]); c.hline(9, 29, 44, P.woo[3]); c.hline(9, 45, 44, P.woo[2]); c.hline(9, 46, 44, P.woo[3]);
  for (let i = 0; i < 40; i++) { const x = 11 + Math.floor(hh2(i, 1) * 40), y = 31 + Math.floor(hh2(i, 2) * 13); if (c.get(x, y) === P.pla[2]) c.px(x, y, P.pla[3]); }
  // Zócalo de piedra.
  c.rect(6, 46, 50, 8, INK); masonry(c, 7, 47, 48, 7, P.stn, 3, 4);
  // Puerta redonda: arco de piedra, tablas, dos herrajes y el pomo.
  const dc = 20, dtop = 31;
  c.fill((x, y) => (y >= 37 && x >= dc - 8 && x <= dc + 8) || ((x - dc) ** 2 + (y - 37) ** 2 <= 8.4 ** 2 && y < 37), (x, y) => (hh2(x, y, 7) < 0.5 ? P.stw[1] : P.stw[2]), dc - 9, dtop - 6, dc + 10, 47);
  c.fill((x, y) => (y >= 37 && x >= dc - 6 && x <= dc + 6) || ((x - dc) ** 2 + (y - 37) ** 2 <= 6.4 ** 2 && y < 37), (x, y) => ((x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 3 ? P.wod[1] : P.wod[2]), dc - 7, dtop - 4, dc + 8, 47);
  for (let y = 31; y < 47; y++) for (let x = dc - 7; x <= dc + 7; x++) { const inD = (y >= 37 && x >= dc - 6 && x <= dc + 6) || ((x - dc) ** 2 + (y - 37) ** 2 <= 6.4 ** 2 && y < 37); const nb = (xx, yy) => (yy >= 37 && xx >= dc - 6 && xx <= dc + 6) || ((xx - dc) ** 2 + (yy - 37) ** 2 <= 6.4 ** 2 && yy < 37); if (inD && (!nb(x - 1, y) || !nb(x, y - 1))) c.px(x, y, INK); }
  for (const y of [36, 42]) { c.hline(dc - 5, y, 11, P.irn[3]); c.px(dc - 4, y, P.irn[1]).px(dc + 4, y, P.irn[1]); }
  c.rect(dc + 3, 39, 2, 2, P.gld[2]); c.px(dc + 3, 39, P.gld[0]);
  c.rect(dc - 9, 46, 19, 2, P.stn[1]); c.hline(dc - 9, 46, 19, P.stn[0]);
  // Farol junto a la puerta.
  c.rect(28, 31, 1, 2, INK); c.rect(27, 33, 4, 5, INK); c.rect(28, 34, 2, 3, P.win[1]); c.px(28, 34, P.win[0]);
  // Ventana redonda con marco de madera, cruz y luz cálida; jardinera con flores debajo.
  const wx = 42, wy = 35;
  c.ell(wx, wy, 6.2, 6.2, INK); c.ell(wx, wy, 5.3, 5.3, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3]));
  c.vline(wx - 1, wy - 3, 7, P.wod[2]); c.hline(wx - 4, wy, 7, P.wod[2]); c.px(wx - 3, wy - 2, P.win[0]).px(wx - 2, wy - 3, P.win[0]);
  vbox(c, 35, 41, 15, 4, P.woo, { side: 1, ao: 1, top: 1 });
  for (let i = 0; i < 7; i++) { const x = 36 + i * 2, col = [P.red[1], P.gld[1], '#ff9ab5', P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]; c.px(x, 39, P.lea[2]).px(x + 1, 40, P.lea[3]).px(x, 38, col).px(x + 1, 39, P.lea[1]); }
  // Tejado: una cuña de queso. Cara con ojos, corteza en los cantos y el corte de abajo; sombra sobre el muro.
  const A = [2, 29], B = [19, 3], C = [60, 29];
  c.poly([A, B, C, [60, 31], [2, 31]], INK);
  c.poly([[3, 29], [19, 4.5], [58.6, 29]], (x, y) => { const e1 = segDist(x + 0.5, y + 0.5, 3, 29, 19, 4.5), e2 = segDist(x + 0.5, y + 0.5, 19, 4.5, 58.6, 29); if (e1 < 2.6) return e1 < 1.2 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.6) return e2 < 1.2 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, 3, 4, 56, 25); });
  for (const [hx, hy, rx, ry] of [[22, 15, 3.2, 2.2], [34, 21, 2.6, 2], [13, 22, 2.2, 1.6], [46, 25, 2.2, 1.4], [28, 25.5, 1.6, 1.1], [20, 10, 1.4, 1], [40, 17, 1.4, 1]]) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1]));
  c.hline(3, 29, 57, P.chz[3]); c.hline(3, 30, 57, P.rnd[3]); c.px(3, 29, P.chz[2]);
  castSh(c, 9, 31, 44, P.pla, 3);
  c.outline();
  return c;
});
// Humo de la chimenea (cada 160 ms; tres bocanadas que suben y se abren).
function houseSmoke(g, x, y, now) { for (let i = 0; i < 3; i++) { const t = ((now / 2400 + i / 3) % 1), r = 1 + Math.round(t * 3), xx = Math.round(x + Math.sin(t * 5 + i) * 2 + t * 6), yy = Math.round(y - t * 22); g.globalAlpha = 0.55 * (1 - t); g.fillStyle = i % 2 ? '#d8d4e4' : '#c4c0d2'; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); g.fillRect(xx - w, yy + dy, w * 2 + 1, 1); } } g.globalAlpha = 1; }

// ---- LAB · 48 × 70: torre de tablas claras con cúpula de cobre verde, telescopio, ojo de buey con el experimento y serpentín ----
const labSprite = () => adArt('lab', () => {
  const c = PB(48, 70), P = PAL;
  // Antena con su bombilla (la luz se pinta aparte).
  c.vline(24, 1, 10, INK); c.vline(25, 2, 9, P.irn[2]); c.rect(23, 0, 4, 3, INK);
  // Telescopio (detrás de la cúpula, saliendo por la ranura).
  c.line(29, 19, 42, 9, INK); c.line(29, 18, 41, 8, INK); c.line(30, 20, 43, 10, INK); c.line(29, 17, 40, 8, INK);
  c.line(30, 18, 41, 9, P.cop[1]); c.line(30, 19, 42, 10, P.cop[2]); c.rect(41, 6, 4, 5, INK); c.rect(42, 7, 2, 3, P.gla[1]);
  // Cúpula: cobre verdoso, nervios y la ranura.
  c.fill((x, y) => ((x + 0.5 - 24) / 17.5) ** 2 + ((y + 0.5 - 26) / 16) ** 2 <= 1 && y < 26, (x, y) => faceTone(P.ver, x, y, 7, 10, 34, 16, 0.06), 5, 9, 43, 26);
  for (const x of [12, 18, 30, 36]) c.fill((xx, yy) => xx === x && ((xx + 0.5 - 24) / 17.5) ** 2 + ((yy + 0.5 - 26) / 16) ** 2 <= 1 && yy < 26 && yy > 11, P.ver[3]);
  c.fill((x, y) => x >= 26 && x <= 29 && y >= 13 && y < 26, (x, y) => (x === 26 ? P.ver[4] : '#0e1a1e'));
  c.hline(14, 12, 4, P.ver[0]); c.hline(11, 14, 3, P.ver[0]);
  // Cornisa.
  vbox(c, 5, 25, 38, 4, P.stn, { side: 2, ao: 1, top: 1 });
  // Torre: tablas horizontales (tingladillo) en blanco frío.
  vbox(c, 7, 28, 34, 33, P.plb, { side: 3, ao: 2 });
  for (let y = 31; y < 60; y += 3) { c.hline(8, y, 32, P.plb[3]); c.hline(8, y + 1, 32, P.plb[1]); }
  // Ojo de buey de latón con el experimento dentro (el líquido se ilumina aparte).
  const ox = 24, oy = 39;
  c.ell(ox, oy, 8.4, 8.4, INK); c.ell(ox, oy, 7.4, 7.4, (x, y) => (x + y < ox + oy - 3 ? P.cop[0] : x + y < ox + oy + 4 ? P.cop[1] : P.cop[2])); c.ell(ox, oy, 5.4, 5.4, INK); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#1e3a3c' : '#16302e'));
  for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0], [4, -4], [4, 4], [-4, 4], [-4, -4]]) c.px(ox + dx, oy + dy, P.cop[3]);
  c.rect(ox - 1, oy - 4, 2, 3, P.gla[2]); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#8af0a0' : '#4ac070'));
  c.px(ox - 2, oy - 3, '#e8fff0');
  // Puerta con ventanuco y un escalón.
  vbox(c, 10, 47, 11, 14, P.wod, { side: 2, ao: 1 }); c.rect(13, 50, 5, 4, INK); c.rect(14, 51, 3, 2, P.gla[2]); c.px(14, 51, P.gla[0]); c.rect(18, 55, 2, 1, P.gld[2]);
  c.hline(11, 48, 9, P.wod[1]);
  // Zócalo de piedra.
  c.rect(4, 60, 40, 10, INK); masonry(c, 5, 61, 38, 9, P.stn, 3, 8);
  c.rect(9, 60, 13, 2, P.stn[1]); c.hline(9, 60, 13, P.stn[0]);
  // Serpentín de cristal por fuera y el matraz al pie.
  for (let y = 30; y < 58; y++) { const x = 42 + Math.round(Math.sin(y * 0.55) * 1.6); c.px(x - 1, y, INK).px(x + 2, y, INK).px(x, y, P.gla[1]).px(x + 1, y, y % 4 < 2 ? '#7ae08a' : P.gla[2]); }
  c.rect(40, 28, 5, 2, INK);
  c.ell(43, 64, 4.6, 4.8, INK); c.ell(43, 64, 3.6, 3.8, (x, y) => (y < 63 ? P.gla[1] : y < 66 ? '#7ae08a' : '#4ac070')); c.rect(42, 58, 3, 3, INK); c.px(43, 59, P.gla[1]); c.px(41, 62, '#ffffff');
  // Pizarra con fórmulas, apoyada junto a la puerta.
  c.line(1, 69, 3, 56, INK); c.line(7, 69, 5, 56, INK); vbox(c, 0, 56, 9, 9, P.chalk, { side: 0, ao: 0, top: 0 });
  c.rect(0, 56, 9, 9, INK); c.rect(1, 57, 7, 7, P.chalk[1]); c.hline(2, 58, 4, '#d8e0d8'); c.hline(2, 60, 2, '#d8e0d8'); c.px(5, 60, '#d8e0d8'); c.hline(3, 62, 4, '#d8e0d8');
  c.outline();
  return c;
});

// ---- SHOP · 58 × 52: puesto con toldo a rayas, rótulo con la moneda, estantería de ruedas, mostrador y pizarra de precios ----
const shopSprite = () => adArt('shop2', () => {
  const c = PB(58, 52), P = PAL;
  // Interior en sombra (bajo el toldo) con la estantería.
  c.rect(6, 17, 46, 20, P.wod[3]); for (let y = 17; y < 21; y++) for (let x = 6; x < 52; x++) if (y < 19 || DI(x, y)) c.px(x, y, P.wod[4]);
  for (const sy of [24, 31]) { c.hline(7, sy, 44, P.woo[1]); c.hline(7, sy + 1, 44, P.woo[3]); }
  const wheel = (x, y, w = 7, h = 5) => { c.ell(x, y, w / 2 + 0.7, h / 2 + 0.7, INK); c.ell(x, y, w / 2, h / 2, (xx, yy) => (yy + 0.5 < y - h / 4 ? P.chz[0] : yy + 0.5 < y + h / 5 ? P.chz[1] : P.chz[3])); c.hline(Math.round(x - w / 2 + 1), Math.round(y), Math.max(1, w - 2), P.rnd[2]); };
  for (const x of [11, 19, 40, 48]) wheel(x, 21);
  for (const x of [10, 17, 42, 48]) { c.poly([[x, 30], [x + 5, 30], [x + 5, 27]], INK); c.poly([[x + 1, 30], [x + 4.6, 30], [x + 4.6, 28]], P.chz[1]); }
  // Postes.
  for (const x of [3, 52]) vbox(c, x, 11, 4, 41, P.woo, { side: 1, ao: 0, top: 0 });
  // Toldo: rayas rojas y crema, cara inclinada con luz arriba y festón redondeado.
  for (let x = 0; x < 58; x++) { const s = Math.floor(x / 6) % 2, R = s ? P.cre : P.red, lx = x % 6; for (let y = 10; y < 17; y++) c.px(x, y, y < 12 ? R[0] : y < 15 ? (lx === 5 ? R[2] : R[1]) : R[2]); const tab = Math.abs(lx - 2.5) <= 2.5 ? Math.round(Math.sqrt(Math.max(0, 6.25 - (lx - 2.5) ** 2)) * 0.9) : 0; for (let y = 17; y < 17 + tab; y++) c.px(x, y, R[3]); }
  c.rect(0, 8, 58, 2, P.woo[2]); c.hline(0, 8, 58, P.woo[1]);
  // Rótulo encima: tabla con la moneda y dos cuñas.
  c.vline(19, 3, 5, P.woo[3]); c.vline(38, 3, 5, P.woo[3]); vbox(c, 15, 0, 28, 7, P.woo, { side: 2, ao: 1, top: 1 });
  c.ell(29, 3.5, 3.2, 3.2, INK); c.ell(29, 3.5, 2.4, 2.4, (x, y) => (x + y < 31 ? P.gld[1] : P.gld[2])); c.px(28, 2, P.gld[0]);
  for (const x of [19, 34]) { c.poly([[x, 5], [x + 5, 5], [x + 5, 2]], INK); c.poly([[x + 1, 5], [x + 4.4, 5], [x + 4.4, 3]], P.chz[1]); }
  // Mostrador: tablero claro, frente de tablas con un panel, pizarra de precios colgada.
  vbox(c, 3, 36, 52, 4, P.woo, { side: 1, ao: 1, top: 1 }); c.hline(4, 37, 50, P.woo[0]);
  c.rect(5, 39, 48, 13, INK); planksV(c, 6, 40, 46, 11, P.woo, 5, 3);
  c.rect(9, 41, 11, 8, INK); c.rect(10, 42, 9, 6, P.chalk[1]); c.hline(11, 43, 4, '#e8e0c8'); c.hline(11, 45, 6, '#e8e0c8'); c.px(17, 43, P.gld[1]);
  // Rueda abierta a la venta (con la cuña cortada) y caja de cuñas.
  c.ell(12, 32, 6.2, 4.6, INK); c.ell(12, 32, 5.3, 3.7, (x, y) => (y < 30 ? P.chz[0] : y < 33 ? P.chz[1] : P.chz[3])); c.poly([[12, 32], [18, 29], [18, 34]], P.chz[2]); c.line(12, 32, 17, 29, INK);
  vbox(c, 41, 30, 11, 6, P.woo, { side: 1, ao: 1, top: 1 }); for (const x of [43, 46, 49]) { c.poly([[x - 1, 30], [x + 2, 30], [x + 0.5, 27]], INK); c.px(x, 29, P.chz[1]).px(x + 1, 29, P.chz[2]).px(x, 28, P.chz[0]); }
  c.outline();
  return c;
});

// ---- PANTRY · 64 × 56: almacén de tablas rojas, tejado de pizarra, buhardilla con polea y una caja colgada, portón y cajas por color ----
const pantrySprite = () => adArt('pantry', () => {
  const c = PB(64, 56), P = PAL;
  // Muro de tablas.
  c.rect(4, 22, 56, 27, INK); planksV(c, 5, 23, 54, 25, P.brn, 4, 6);
  for (const x of [5, 57]) { c.vline(x, 23, 25, P.woo[2]); c.vline(x + 1, 23, 25, P.woo[3]); }
  // Tejado de pizarra (los faldones miran al frente): hiladas desplazadas, cumbrera y alero.
  c.poly([[0, 24], [9, 7], [55, 7], [64, 24]], INK);
  c.poly([[1.5, 23], [9.8, 8], [54.2, 8], [62.5, 23]], (x, y) => { const row = Math.floor((y - 8) / 3), off = row % 2 ? 2 : 0, t = (x + off) % 5 === 0 ? 3 : (y - 8) % 3 === 2 ? 3 : faceTone(P.sla, x, y, 2, 8, 60, 15) === P.sla[0] ? 1 : 2; return P.sla[t]; });
  c.hline(9, 7, 46, P.sla[0]); c.hline(1, 23, 62, P.woo[2]); c.hline(0, 24, 64, P.woo[3]);
  castSh(c, 7, 25, 50, P.brn, 3);
  // Buhardilla con la puerta del pajar, la viga y la polea; la cuerda baja hasta una caja colgada.
  c.poly([[24, 20], [32, 3], [40, 20]], INK); c.poly([[25.5, 19.5], [32, 5], [38.5, 19.5]], (x, y) => ((x - 25) % 3 === 0 ? P.brn[3] : x < 30 ? P.brn[1] : P.brn[2]));
  c.rect(29, 12, 6, 8, INK); c.rect(30, 13, 4, 7, '#1a0e0c'); c.rect(31, 1, 3, 4, INK); c.rect(32, 2, 1, 2, P.woo[1]);
  c.ell(32.5, 7.5, 2.2, 2.2, INK); c.px(32, 7, P.irn[1]).px(33, 8, P.irn[2]);
  c.vline(32, 10, 18, '#c8b48a');
  vbox(c, 28, 27, 10, 7, P.woo, { side: 1, ao: 1, top: 1 }); c.hline(29, 30, 8, P.woo[3]); c.rect(31, 28, 4, 2, P.chz[1]);
  // Portón de dos hojas con cruces y herrajes.
  c.rect(19, 34, 26, 15, INK); for (const x0 of [20, 33]) { c.rect(x0, 35, 11, 13, P.wod[2]); c.hline(x0, 35, 11, P.wod[1]); c.line(x0, 35, x0 + 10, 47, P.woo[1]); c.line(x0 + 10, 35, x0, 47, P.woo[1]); c.hline(x0, 41, 11, P.woo[2]); c.vline(x0 + 10, 36, 12, P.wod[3]); }
  c.rect(31, 40, 2, 3, P.irn[1]);
  // Cajas por color de recurso bajo un tejadillo: Raw (naranja), Base (crema) y queso (amarillo).
  c.rect(5, 30, 13, 2, INK); c.hline(6, 30, 11, P.woo[1]);
  const crate = (x, y, lab) => { vbox(c, x, y, 7, 6, P.woo, { side: 1, ao: 1, top: 1 }); c.rect(x + 2, y + 2, 3, 2, lab); };
  crate(5, 43, '#e08a2e'); crate(11, 43, '#efe6c4'); crate(8, 37, P.chz[1]);
  // Placa con la rueda (qué guarda) y farol.
  c.ell(52, 37, 4.6, 4.6, INK); c.ell(52, 37, 3.7, 3.7, (x, y) => (x + y < 88 ? P.woo[0] : P.woo[2])); c.poly([[49, 39.5], [55.5, 39.5], [55.5, 34.5]], INK); c.poly([[50, 39], [55, 39], [55, 35.6]], P.chz[1]); c.px(54, 36, P.chz[0]).px(52, 38, P.chz[3]);
  c.rect(48, 44, 1, 2, INK);
  // Zócalo de piedra.
  c.rect(2, 48, 60, 8, INK); masonry(c, 3, 49, 58, 7, P.stn, 3, 11);
  c.outline();
  return c;
});

// ---- Castillete de la mina · 26 × 72: patas de madera, travesaños, polea y la boca del pozo ----
const headframeSprite = () => adArt('headframe', () => {
  const c = PB(28, 72), P = PAL;
  for (const [a, b] of [[[3, 70], [11, 9]], [[24, 70], [16, 9]]]) c.fill((x, y) => segDist(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]) < 1.7, (x, y) => { const s = (x + 0.5 - (a[0] + (b[0] - a[0]) * ((y - a[1]) / (b[1] - a[1])))); return s < -0.5 ? P.woo[1] : s < 0.6 ? P.woo[2] : P.woo[3]; }, 0, 8, 28, 71);
  for (const [y, x0, x1] of [[34, 7, 21], [52, 5, 23]]) { c.rect(x0 - 1, y - 1, x1 - x0 + 3, 4, INK); c.hline(x0, y, x1 - x0 + 1, P.woo[1]); c.hline(x0, y + 1, x1 - x0 + 1, P.woo[3]); }
  c.ell(14, 10, 6.4, 6.4, INK); c.ell(14, 10, 5.4, 5.4, P.irn[2]); c.ell(14, 10, 4, 4, INK); c.ell(14, 10, 3.2, 3.2, '#2a2a34'); c.px(14, 10, P.irn[1]); c.line(14, 6, 14, 14, P.irn[2]); c.line(10, 10, 18, 10, P.irn[2]); c.px(12, 6, P.irn[0]).px(10, 8, P.irn[0]);
  c.poly([[5, 4], [14, 0], [23, 4], [23, 6], [5, 6]], INK); c.poly([[6.2, 4.6], [14, 1.2], [21.8, 4.6], [21.8, 5.4], [6.2, 5.4]], (x, y) => (y < 4 ? P.sla[1] : P.sla[2]));
  c.rect(3, 62, 22, 10, INK); c.rect(4, 63, 20, 2, P.woo[1]); c.rect(4, 65, 20, 7, '#120c0a'); c.rect(4, 65, 2, 7, P.woo[3]); c.rect(22, 65, 2, 7, P.woo[3]); c.hline(6, 65, 16, '#2a1c14');
  c.outline();
  return c;
});

// ==== ad/05_ad_world.js ====
// ---------- ART DIRECTION · el motor de V4.1 para las demostraciones (sin su interfaz) ----------
// La escala de un 375 × 635 con DPR 3: 7/3 px CSS por píxel de arte en la colonia.
SC = { d: 7, s: 7 / 3, LW: 375 / (7 / 3), ox: 8, worldW: 375 / (7 / 3) }; buildStops();
function paintLabels() {}
// Dibuja una parada entera en un lienzo propio (mismo motor, otro destino).
function renderStopTo(i, now, cvs) { const st = STOPS[i]; cvs.width = Math.ceil(SC.worldW); cvs.height = st.h; const g = cvs.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, -st.top); const was = ctx, hs = HITS; ctx = g; HITS = []; try { if (st.kind === 'pilot') drawCheddar(st, now); else if (st.kind === 'district') drawDistrictB(st, now); } finally { ctx = was; HITS = hs; } return cvs; }

// ---------- C · EL PUEBLO (propuesta de composición) ----------
// Más ancho que la pantalla (346 × 152 píxeles de arte; la pantalla ve 160 de ancho): a la derecha, el mercado (tienda,
// almacén y castillete de la mina, justo encima del pozo de Cheddar); en medio, el laboratorio en un altozano; a la
// izquierda, la casa en la colina. Debajo, el corte del terreno: la bodega del almacén, el pozo y la madriguera de la casa.
const VW = 346, VH = 152, GR = 96, GH = 78, GL = 88;
const VPOS = { house: [10, GH], lab: [106, GL], shop: [186, GR], pantry: [252, GR], head: [317, GR] };
// Suelo: altura de la hierba en cada x (colina → altozano → mercado, con taludes).
const groundY = (x) => (x < 84 ? GH : x < 98 ? GH + ((x - 84) / 14) * (GL - GH) : x < 158 ? GL : x < 172 ? GL + ((x - 158) / 14) * (GR - GL) : GR);
const tree = (big) => adArt('tree' + big, () => { const W = big ? 34 : 22, H = big ? 46 : 30, c = PB(W, H), P = PAL, cx = W / 2; c.rect(Math.round(cx) - 2, H - (big ? 18 : 11), 4, big ? 18 : 11, (x, y) => (x < cx - 1 ? P.wod[1] : x < cx + 1 ? P.wod[2] : P.wod[3])); const blobs = big ? [[cx, 13, 13, 11], [cx - 8, 19, 8, 7], [cx + 8, 18, 9, 7], [cx - 2, 7, 9, 6]] : [[cx, 9, 9, 8], [cx - 5, 13, 6, 5], [cx + 5, 12, 6, 5]]; for (const [bx, by, rx, ry] of blobs) c.ell(bx, by, rx, ry, (x, y) => faceTone(P.lea, x, y, bx - rx, by - ry, rx * 2, ry * 2, 0.25)); for (let i = 0; i < (big ? 30 : 14); i++) { const x = Math.floor(hh2(i, 1, big) * W), y = Math.floor(hh2(i, 2, big) * (H - 10)); if (c.get(x, y)) c.px(x, y, hh2(i, 3) < 0.5 ? P.lea[0] : P.lea[3]); } c.outline(); return c; });
const bush = (s) => adArt('bush' + s, () => { const c = PB(14, 8), P = PAL; c.ell(7, 5, 6.4, 3.6, (x, y) => faceTone(P.lead, x, y, 0, 1, 14, 7, 0.3)); if (s) for (const [x, y] of [[4, 3], [9, 4], [6, 5]]) c.px(x, y, s === 1 ? '#ff9ab5' : '#fff6b8'); c.outline(); return c; });
const fence = (n) => adArt('fence' + n, () => { const c = PB(n * 6 + 2, 9), P = PAL; for (let i = 0; i <= n; i++) c.rect(i * 6, 1, 2, 8, (x) => (x === i * 6 ? P.woo[1] : P.woo[3])); c.hline(0, 3, n * 6 + 2, P.woo[2]); c.hline(0, 6, n * 6 + 2, P.woo[2]); c.outline(); return c; });
const bench = () => adArt('bench', () => { const c = PB(16, 8), P = PAL; c.rect(0, 3, 16, 2, P.woo[1]); c.hline(0, 3, 16, P.woo[0]); c.rect(0, 0, 16, 2, P.woo[2]); c.rect(1, 5, 2, 3, P.woo[3]); c.rect(13, 5, 2, 3, P.woo[3]); c.outline(); return c; });
const lampPost = () => adArt('lamp', () => { const c = PB(7, 24), P = PAL; c.rect(3, 6, 1, 18, P.irn[2]); c.rect(2, 22, 3, 2, P.irn[3]); c.rect(1, 1, 5, 6, P.irn[3]); c.rect(2, 2, 3, 4, P.win[1]); c.px(2, 2, P.win[0]); c.rect(2, 0, 3, 1, P.irn[2]); c.outline(); return c; });
const signPost = () => adArt('sign', () => { const c = PB(16, 18), P = PAL; c.rect(6, 4, 2, 14, P.woo[2]); c.poly([[0, 2], [12, 2], [15, 5], [12, 8], [0, 8]], P.woo[1]); c.hline(1, 2, 11, P.woo[0]); c.hline(2, 5, 7, P.woo[3]); c.poly([[6, 9], [13, 9], [13, 14], [6, 14]], P.woo[2]); c.vline(9, 10, 3, INK); c.px(8, 11, INK).px(10, 11, INK); c.outline(); return c; });
function paintVillage(g) {
  const P = PAL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // Cielo de media tarde, nubes y dos líneas de colinas lejanas (sin contorno, veladas hacia el cielo).
  const SKY = ['#4c5f98', '#5a6ea6', '#6a80b4', '#7c92c0', '#94a8cc', '#b4c0d4', '#d8cdb8'];
  SKY.forEach((c, i) => R2(0, i * 12, VW, 12, c)); R2(0, 84, VW, 20, '#e2d0b0');
  // Transición en trama entre bandas del cielo (sin degradados).
  [...SKY, '#e2d0b0'].forEach((c, i) => { if (!i) return; const y = i * 12; for (let x = 0; x < VW; x++) { if ((x + y) % 2 === 0) R2(x, y, 1, 1, SKY[i - 1]); if (x % 2 === 0 && y % 4 === 0) R2(x, y + 1, 1, 1, SKY[i - 1]); } });
  for (const [cx, cy, w] of [[40, 16, 26], [150, 10, 34], [262, 20, 22], [318, 8, 18]]) { R2(cx, cy, w, 4, '#f4f2fa'); R2(cx + 4, cy - 3, w - 10, 3, '#f4f2fa'); R2(cx + 2, cy + 4, w - 2, 2, '#c8cce4'); }
  for (let x = 0; x < VW; x++) { const h1 = 22 + Math.round(Math.sin(x * 0.03 + 1) * 7 + Math.sin(x * 0.09) * 3); R2(x, GR - 6 - h1, 1, h1 + 6, '#8a9cbc'); }
  for (let x = 0; x < VW; x++) { const h2 = 12 + Math.round(Math.sin(x * 0.05 + 3) * 5 + Math.sin(x * 0.13) * 2); R2(x, GR - 4 - h2, 1, h2 + 4, '#7a9a8e'); if (hh2(x, 7) < 0.08) R2(x, GR - 6 - h2, 1, 2, '#6a8a7e'); }
  // Terreno: hierba con su borde, taludes y el corte del suelo con estratos.
  for (let x = 0; x < VW; x++) { const y = Math.round(groundY(x)); R2(x, y, 1, VH - y, P.soi[1]); R2(x, y, 1, 4, P.gra[1]); R2(x, y, 1, 1, P.gra[0]); R2(x, y + 4, 1, 2, P.gra[3]); if (hh2(x, 1) < 0.3) R2(x, y - 1, 1, 1, P.gra[1]); if (hh2(x, 2) < 0.12) R2(x, y - 2, 1, 1, P.gra[2]); }
  for (let y = 104; y < VH; y += 9) for (let x = 0; x < VW; x++) { const yy = y + Math.round(Math.sin(x * 0.07 + y) * 1.5); if (yy > groundY(x) + 8) R2(x, yy, 1, 1, P.soi[3]); }
  for (let i = 0; i < 160; i++) { const x = Math.floor(hh2(i, 11) * VW), y = 104 + Math.floor(hh2(i, 12) * 46); if (y > groundY(x) + 8) { R2(x, y, 2, 1, P.soi[0]); R2(x, y + 1, 2, 1, P.soi[3]); } }
  for (let i = 0; i < 14; i++) { let x = 20 + Math.floor(hh2(i, 21) * 300), y = Math.round(groundY(x)) + 6; for (let k = 0; k < 9; k++) { R2(x, y + k, 1, 1, '#4a3424'); x += hh2(i, k) < 0.5 ? -1 : 1; } }
  // Camino de tierra con taludes y escalones.
  for (let x = 4; x < 346; x++) { const y = Math.round(groundY(x)); if (x > 72 && x < 104 || x > 150 && x < 186) R2(x, y + 1, 1, 2, P.dir[1]); else R2(x, y + 1, 1, 2, P.dir[0]); if (hh2(x, 33) < 0.2) R2(x, y + 2, 1, 1, P.dir[2]); }
  for (const [x0, x1] of [[84, 98], [158, 172]]) for (let x = x0; x < x1; x += 4) { const y = Math.round(groundY(x)); R2(x, y, 4, 1, P.stw[1]); R2(x, y + 1, 4, 1, P.stw[3]); }
  // Corte del subsuelo: la madriguera bajo la casa (dormitorio), la bodega bajo el almacén y el pozo.
  const room = (x, y, w, h, back) => { R2(x - 1, y - 1, w + 2, h + 2, INK); R2(x, y, w, h, back); R2(x, y, w, 2, '#00000040'); };
  room(16, 86, 54, 22, '#3a2a1e'); for (let x = 16; x < 70; x += 3) R2(x, 86 + (x % 2), 1, 1, '#2a1c12'); R2(16, 106, 54, 2, P.woo[3]);
  for (const bx of [22, 44]) { R2(bx, 99, 18, 5, P.woo[2]); R2(bx, 99, 18, 1, P.woo[1]); R2(bx + 1, 97, 16, 3, '#6a7ac8'); R2(bx + 1, 97, 16, 1, '#9aa8e8'); R2(bx + 1, 96, 5, 2, P.cre[1]); R2(bx, 95, 2, 9, P.woo[3]); }
  R2(39, 88, 1, 4, INK); R2(38, 92, 3, 3, P.win[1]);
  // Escalera de la casa a la madriguera.
  R2(60, GH + 1, 7, 86 - GH, '#2a1c12'); for (let y = GH + 3; y < 86; y += 3) R2(61, y, 5, 1, P.woo[1]); R2(60, GH + 1, 1, 86 - GH, P.woo[3]); R2(66, GH + 1, 1, 86 - GH, P.woo[3]);
  room(258, 104, 52, 30, '#2e2218'); for (const sy of [114, 124]) { R2(260, sy, 48, 2, P.woo[2]); R2(260, sy, 48, 1, P.woo[1]); }
  for (let i = 0; i < 6; i++) { const x = 262 + i * 8, cc = ['#e08a2e', '#efe6c4', P.chz[1]][i % 3]; R2(x - 1, 107, 8, 7, INK); R2(x, 108, 6, 6, P.woo[1]); R2(x + 1, 110, 4, 2, cc); }
  for (let i = 0; i < 5; i++) { const x = 266 + i * 9; R2(x - 1, 117, 8, 7, INK); R2(x, 118, 6, 6, P.chz[2]); R2(x, 118, 6, 2, P.chz[0]); }
  R2(252, 97, 6, 37, P.woo[3]); for (let y = 99; y < 134; y += 4) R2(253, y, 4, 1, P.woo[1]);
  R2(326, GR, 12, VH - GR, '#120c0a'); R2(326, GR, 2, VH - GR, P.woo[3]); R2(336, GR, 2, VH - GR, P.woo[3]); for (let y = GR + 6; y < VH; y += 10) R2(326, y, 12, 1, P.woo[2]);
  // Fondo medio: árboles grandes detrás.
  for (const [x, big] of [[72, 1], [158, 0], [0, 0]]) { const tr = tree(big).canvas(); g.drawImage(tr, x, Math.round(groundY(x + tr.width / 2)) - tr.height + 1); }
}
// Lo que va delante del fondo: edificios (con su sombra de contacto), objetos y la vida. Por orden de profundidad.
function drawVillage(g, now, opt = {}) {
  const P = PAL, at = (k) => VPOS[k], spr = (cv, x, base) => { groundShadow(g, x, base, cv.width); g.drawImage(cv, x, base - cv.height); };
  spr(houseSprite().canvas(), ...at('house')); houseSmoke(g, VPOS.house[0] + 47, VPOS.house[1] - 54 + 6, now);
  g.drawImage(fence(3).canvas(), 72, GH - 8); g.drawImage(bench().canvas(), 74, GH - 8); g.drawImage(bush(1).canvas(), 0, GH - 7);
  spr(labSprite().canvas(), ...at('lab')); const blink = Math.floor(now / 700) % 2; g.fillStyle = blink ? '#ff6a5a' : '#7a2a24'; g.fillRect(VPOS.lab[0] + 24, VPOS.lab[1] - 70, 2, 2);
  if (Math.floor(now / 380) % 3 === 0) { g.fillStyle = '#e8fff0'; g.fillRect(VPOS.lab[0] + 43, VPOS.lab[1] - 8 - (Math.floor(now / 380) % 2), 1, 1); }
  g.drawImage(bush(2).canvas(), 96, GL - 7); g.drawImage(signPost().canvas(), 168, GR - 17);
  spr(shopSprite().canvas(), ...at('shop'));
  g.drawImage(lampPost().canvas(), 245, GR - 23); g.globalAlpha = 0.12; g.fillStyle = '#ffe08a'; g.fillRect(241, GR - 26, 15, 12); g.globalAlpha = 1;
  spr(pantrySprite().canvas(), ...at('pantry'));
  spr(headframeSprite().canvas(), ...at('head'));
  g.drawImage(bush(0).canvas(), 238, GR - 7);
  // Ratones: el tendero detrás del mostrador (se redibuja el frente encima), el investigador en la puerta del laboratorio,
  // uno sin puesto leyendo en el banco y otro durmiendo en la madriguera. Solo poses aprobadas.
  const T = CREW.town, mk = (m, x, feet, o = {}, flip = false) => { const cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, (now + m.name.length * 997) % 3300 < 110, o); if (flip) { g.save(); g.translate(x + 22, feet - 20); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20); return [x, feet]; };
  const shop = shopSprite().canvas(); MPOS.keeper = mk(T.keeper, VPOS.shop[0] + 24, GR - 13, opt.keeper || {}); g.drawImage(shop, 0, 36, 58, 16, VPOS.shop[0], GR - 52 + 36, 58, 16);
  MPOS.sci = mk(T.sci, VPOS.lab[0] + 18, GL, opt.sci || { book: Math.floor(now / 900) % 2 ? 2 : 1 }, true);
  // Sin puesto: descansa en la madriguera, metido en la cama (la manta se pinta por encima).
  MPOS.idle = mk(T.idle, 20, 100, opt.idle || { face: 'sleep' }); g.fillStyle = '#6a7ac8'; g.fillRect(23, 96, 16, 4); g.fillStyle = '#9aa8e8'; g.fillRect(23, 96, 16, 1); g.fillStyle = INK; g.fillRect(22, 96, 1, 4);
  if (!opt.noZ) { const z = Math.floor(now / 500) % 3; g.fillStyle = '#bfe8fd'; for (let i = 0; i <= z; i++) g.fillRect(36 + i * 3, 84 - i * 3, 2, 1); }
}
const MPOS = {};

// ---------- Bucle común: una simulación espejo para todas las demostraciones; cada teléfono dibuja su encuadre ----------
let SOUND_NEW = false; SOUND = false; // esta página no suena: ningún sonido nuevo está aprobado
const WORLD = { ched: document.createElement('canvas'), vill: document.createElement('canvas'), villBG: null, t: 0, hooks: [] };
function villageBG() { if (!WORLD.villBG) { const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintVillage(g); WORLD.villBG = c; } return WORLD.villBG; }
function renderVillage(now, opt) { const c = WORLD.vill; c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(villageBG(), 0, 0); drawVillage(g, now, opt); return c; }
function worldTick(dt) { const now = performance.now(); dt = dt ?? Math.min(64, now - (WORLD.t || now)); WORLD.t = now; step41(dt); renderStopTo(1, now, WORLD.ched); renderVillage(now); for (const h of WORLD.hooks) h(now, dt); for (const P of PHONES) { if (P.tick) P.tick(now, dt); if (P.vis && P.live) P.render(now); } }
// Una imagen con su lienzo propio llamando a una función de dibujo del motor (que pinta en el ctx global).
function viaCtx(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const was = ctx; ctx = g; try { fn(g); } finally { ctx = was; } return c; }
const frameOf = (src, fw, f = 0, fh) => { const i = im(src), c = document.createElement('canvas'); c.width = fw; c.height = fh || i.height; c.getContext('2d').drawImage(i, f * fw, 0, fw, c.height, 0, 0, fw, c.height); return c; };
// La página se monta cuando están cargadas todas las imágenes que usa (si no, salen miniaturas vacías).
function adReady(fn) { ['out/anims/swing_player.png', 'out/anims/swing_gold.png', 'out/anims/swing_miner.png', 'out/anims/phouse.png', 'out/anims/plab.png', 'out/anims/pdrill_3.png', 'out/sprites/big_gouda_c0.png', 'out/sprites/ic_coin.png', 'out/sprites/ic_pick.png', 'out/sprites/ic_flask.png', 'out/sprites/ic_raw_cheddar.png', 'out/sprites/ic_base_cheddar.png', 'out/sprites/ic_lot_cheddar.png'].forEach(im); Promise.all(Object.values(IMC).map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); })))).then(fn); }

// ==== ad/06_ad_sys.js ====
// ---------- ART DIRECTION · teléfono, bocadillos, avisos, recursos y montacargas (propuestas) ----------
const KPX = 7 / 3; // px CSS por píxel de arte en la colonia (375, DPR 3)
const ICON = { raw: 'out/sprites/ic_raw_cheddar.png', base: 'out/sprites/ic_base_cheddar.png', lot: 'out/sprites/ic_lot_cheddar.png', coin: 'out/sprites/ic_coin.png' };
const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(Math.round(n)));
// ---- Teléfono: HUD, escena y panel, a tamaño real (375 × 635, iPhone en Safari con barras) y escalado para la página ----
const PHONES = [];
function adPhone(parent, { s = 0.8, dock = 'colony', cap = '', res = true, w = 375, h = 635 } = {}) {
  const fig = document.createElement('figure'); fig.className = 'ad-fig';
  const box = document.createElement('div'); box.className = 'ad-phbox'; box.style.width = w * s + 'px'; box.style.height = h * s + 'px';
  const ph = document.createElement('div'); ph.className = 'ad-ph'; ph.style.cssText = `width:${w}px;height:${h}px;transform:scale(${s})`;
  const chip = (k, v) => `<span class="ad-chip" data-k="${k}"><img class="pix" src="${ICON[k]}" alt=""><b>${v}</b></span>`;
  ph.innerHTML = `<div class="ad-hud"><span class="ad-coins" data-k="coin"><img class="pix" src="${ICON.coin}" alt=""><span><b>3.9Qa</b><small>+1.2Qa/s</small></span></span>${res ? chip('raw', '1.2K') + chip('base', '860') + chip('lot', '396K') : '<span class="ad-chip wide"><img class="pix" src="' + ICON.lot + '" alt=""><b>396K</b></span>'}<span class="ad-alert">!</span></div>` +
    `<div class="ad-stage"><canvas></canvas><div class="ad-ov"></div><div class="ad-nav"><i class="up">▲</i><span class="ad-navl"></span><i class="dn">▼</i></div></div>` +
    `<div class="ad-dock"><div class="ad-strip"></div><div class="ad-glob"><i>MICE</i><i>BOOSTS</i><i>LAB</i><i>COLONY</i><i>MENU</i></div></div>`;
  box.appendChild(ph); fig.appendChild(box); if (cap) { const c = document.createElement('figcaption'); c.innerHTML = cap; fig.appendChild(c); } parent.appendChild(fig);
  const P = { fig, ph, s, stage: ph.querySelector('.ad-stage'), cv: ph.querySelector('canvas'), ov: ph.querySelector('.ad-ov'), nav: ph.querySelector('.ad-nav'), camX: 0, camY: 0, k: KPX, vals: { coin: 3.9e15, raw: 1240, base: 860, lot: 396000 }, live: true, draw: null, vis: true };
  P.chip = (k) => ph.querySelector(`[data-k="${k}"]`);
  const tiles = { colony: [['ic_pick', 'MINE', '62%'], ['ic_raw_cheddar', 'DRILL', 'AUTO'], ['ic_base_cheddar', 'REFINE', 'AUTO'], ['ic_lot_cheddar', 'CHEESE', 'AUTO']], town: [['ic_coin', 'SELL', 'AUTO'], ['ic_flask', 'LAB', '3:20'], ['ic_lot_cheddar', 'HOUSE', '1 IDLE'], ['ic_raw_cheddar', 'PANTRY', '8h']] }[dock] || [];
  ph.querySelector('.ad-strip').innerHTML = tiles.map(([ic, n, st]) => `<span class="ad-tile" data-n="${n}"><img class="pix" src="out/sprites/${ic}.png" alt=""><b>${n}</b><small>${st}</small></span>`).join('') + (tiles.length ? '<span class="ad-tile up"><b>UPGRADES</b><small>trees</small></span>' : '');
  P.fit = () => { const r = P.stage.getBoundingClientRect(), dpr = devicePixelRatio || 1, W = P.stage.clientWidth, H = P.stage.clientHeight; P.cv.width = Math.round(W * dpr); P.cv.height = Math.round(H * dpr); P.cv.style.width = W + 'px'; P.cv.style.height = H + 'px'; P.W = W; P.H = H; P.vw = W / P.k; P.vh = H / P.k; };
  P.fit();
  P.toPh = (x, y) => [(x - P.camX) * P.k, (y - P.camY) * P.k];
  P.render = (now) => { if (!P.draw) return; const g = P.cv.getContext('2d'), dpr = devicePixelRatio || 1, k = P.k * dpr; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0e0c12'; g.fillRect(0, 0, P.cv.width, P.cv.height); g.imageSmoothingEnabled = false; g.setTransform(k, 0, 0, k, -Math.round(P.camX * k), -Math.round(P.camY * k)); P.draw(g, now); };
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => (P.vis = e[0].isIntersecting)).observe(box);
  PHONES.push(P); return P;
}
// ---- D · Bocadillos (diálogo del ratón) y avisos (estado de una máquina): dos piezas que no se parecen ----
// Diálogo: globo crema con contorno de tinta, esquinas de píxel y una punta escalonada que señala la cabeza de quien habla.
// Al hablar, el ratón reacciona (salto pequeño y su cara, poses aprobadas). Uno a la vez; tiempo de lectura según el texto.
// Aviso: placa oscura con borde ámbar y el icono del recurso que falta, colgada de la máquina, en mayúsculas. Sin punta.
const TAILSVG = (dir) => { const R = dir === 'down' ? [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]] : [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]]; let s = ''; R.forEach(([y, w], i) => { for (let x = i; x < i + w; x++) s += `<rect x="${x * 2}" y="${y === 0 ? 0 : i * 2}" width="2" height="2" fill="${x === i || x === i + w - 1 ? '#1b1220' : '#fffdf2'}"/>`; }); return `<svg class="ad-tail" width="10" height="10" viewBox="0 0 10 10" shape-rendering="crispEdges">${s}<rect x="0" y="0" width="10" height="2" fill="#fffdf2"/><rect x="0" y="0" width="2" height="2" fill="#1b1220"/><rect x="8" y="0" width="2" height="2" fill="#1b1220"/></svg>`; };
const readMs = (t) => Math.max(2400, Math.min(6500, 1800 + t.length * 75));
function bubble(P, head, text, { tone = 'say', avoid = [] } = {}) {
  const b = document.createElement('div'); b.className = 'ad-bub'; b.innerHTML = `<span>${text}</span>${TAILSVG('down')}`; P.ov.appendChild(b);
  const w = b.offsetWidth, h = b.offsetHeight, [hx, hy] = P.toPh(head[0], head[1]), top0 = 48, m = 6;
  // Arriba de la cabeza, centrado; si choca con el borde, se corre (la punta sigue señalando la cabeza); si no cabe arriba, a un lado.
  let left = Math.round(hx - w / 2), top = Math.round(hy - h - 10), side = 0;
  left = Math.max(m, Math.min(P.W - w - m, left));
  const hits = (l, t) => avoid.some((r) => !(l + w <= r[0] || r[0] + r[2] <= l || t + h <= r[1] || r[1] + r[3] <= t));
  if (top < top0 || hits(left, top)) { for (const dx of [-30, 30, -60, 60]) { const l = Math.max(m, Math.min(P.W - w - m, left + dx)); if (!hits(l, top) && top >= top0) { left = l; break; } } }
  if (top < top0) { side = hx > P.W / 2 ? -1 : 1; top = Math.max(top0, Math.round(hy - h / 2 - 6)); left = side < 0 ? Math.round(hx - w - 16) : Math.round(hx + 16); b.classList.add(side < 0 ? 'side-r' : 'side-l'); }
  b.style.left = left + 'px'; b.style.top = top + 'px';
  const tail = b.querySelector('.ad-tail'); if (!side) tail.style.left = Math.max(6, Math.min(w - 16, Math.round(hx - left - 5))) + 'px'; else tail.style.top = Math.max(4, Math.min(h - 14, Math.round(hy - top - 8))) + 'px';
  b.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 150, easing: 'steps(3)' });
  b._rect = [left, top, w, h];
  b.bye = () => { const a = b.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.85)', opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); };
  return b;
}
function plate(P, anchor, icon, text) {
  const b = document.createElement('div'); b.className = 'ad-warn'; b.innerHTML = `<img class="pix" src="${ICON[icon] || icon}" alt=""><b>${text}</b>`; P.ov.appendChild(b);
  const [x, y] = P.toPh(anchor[0], anchor[1]), w = b.offsetWidth; b.style.left = Math.max(6, Math.min(P.W - w - 6, Math.round(x - w / 2))) + 'px'; b.style.top = Math.max(48, Math.round(y - b.offsetHeight - 8)) + 'px';
  const ch = document.createElement('i'); ch.className = 'ad-chain'; ch.style.left = Math.round(x - parseFloat(b.style.left)) - 1 + 'px'; b.appendChild(ch);
  b.animate([{ transform: 'translateY(-4px)', opacity: 0 }, { transform: 'translateY(1px)', opacity: 1, offset: 0.66 }, { transform: 'none', opacity: 1 }], { duration: 180, easing: 'steps(3)' });
  b.bye = () => { const a = b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); };
  return b;
}
// Cola de diálogo: uno a la vez, como mucho dos esperando, 600 ms entre uno y otro; el ratón reacciona al empezar.
function talker(P) {
  const T = { cur: null, q: [], until: 0, gapUntil: 0 };
  T.say = (who, text, headFn, react) => { if (T.q.length >= 2) T.q.shift(); T.q.push({ who, text, headFn, react }); };
  T.tick = (now) => { if (T.cur && now > T.until) { T.cur.el.bye(); T.cur = null; T.gapUntil = now + 600; } if (!T.cur && T.q.length && now > T.gapUntil) { const s = T.q.shift(); if (s.react) s.react(); const el = bubble(P, s.headFn(), s.text, { avoid: T.avoid ? T.avoid() : [] }); T.cur = { ...s, el }; T.until = now + readMs(s.text); } if (T.cur && T.cur.el.isConnected) { /* sigue a la cabeza si la cámara se mueve */ } };
  return T;
}
// ---- E · Recompensa inmediata: el recurso sale de su máquina, flota «+N» y vuela a su contador, que salta y sube ----
// Las reglas de MAIN (main.js): lo del dedo sale siempre; lo de los ratones, de la roca que se mira y como mucho una vez por
// etapa cada 1,2 s con el total juntado. Topes: 8 números y 10 iconos a la vez.
function fxOf(P) {
  const F = { paced: {}, floats: 0, flyers: 0 };
  F.pace = (key, n, manual) => { const p = F.paced[key] || (F.paced[key] = { at: -1e9, sum: 0 }), now = performance.now(); p.sum += n; if (!manual && now - p.at < 1200) return 0; const t = p.sum; p.sum = 0; p.at = now; return t; };
  F.bump = (k) => { const c = P.chip(k); if (!c) return; c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(-1px)' }, { transform: 'none' }], { duration: 240, easing: 'steps(1, end)' }); };
  F.count = (k, add) => { const c = P.chip(k); if (!c) return; const b = c.querySelector('b'), from = P.vals[k], to = from + add, t0 = performance.now(); P.vals[k] = to; const step = () => { const e = Math.min(1, (performance.now() - t0) / 300); b.textContent = k === 'coin' ? fmtCoin(from + (to - from) * e) : fmtK(from + (to - from) * e); if (e < 1) requestAnimationFrame(step); }; step(); };
  F.emit = (k, at, n, manual = false) => {
    const m = F.pace(k, n, manual); if (!m) return;
    const [x, y] = P.toPh(at[0], at[1]);
    if (F.floats < 8) { F.floats++; const f = document.createElement('div'); f.className = 'ad-float'; f.innerHTML = `<img class="pix" src="${ICON[k]}" alt=""><b>+${k === 'coin' ? fmtCoin(m) : fmtK(m)}</b>`; f.style.left = Math.round(x) + 'px'; f.style.top = Math.round(y - 6) + 'px'; P.ov.appendChild(f); const a = f.animate([{ transform: 'translate(-50%, 0)', opacity: 0 }, { transform: 'translate(-50%, -6px)', opacity: 1, offset: 0.2 }, { transform: 'translate(-50%, -12px)', opacity: 1, offset: 0.75 }, { transform: 'translate(-50%, -14px)', opacity: 0 }], { duration: 900, easing: 'steps(9)' }); a.onfinish = () => { f.remove(); F.floats--; }; }
    const chip = P.chip(k); if (!chip) return;
    const ci = chip.querySelector('img').getBoundingClientRect(), pr = P.ph.getBoundingClientRect(), sr = P.stage.getBoundingClientRect(), tx = (ci.left + ci.width / 2 - pr.left) / P.s, ty = (ci.top + ci.height / 2 - pr.top) / P.s, ox = (sr.left - pr.left) / P.s, oy = (sr.top - pr.top) / P.s;
    const nIc = Math.min(2, m, 10 - F.flyers); for (let i = 0; i < nIc; i++) { F.flyers++; const im2 = document.createElement('img'); im2.className = 'pix ad-fly'; im2.src = ICON[k]; const sx = ox + x + (i ? 6 : -4), sy = oy + y - 4; im2.style.left = sx + 'px'; im2.style.top = sy + 'px'; P.ph.appendChild(im2); const dx = tx - sx, dy = ty - sy; const a = im2.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { transform: `translate(-50%,-50%) translate(${i ? 4 : -4}px, -14px) scale(1.25)`, opacity: 1, offset: 0.22 }, { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(.6)`, opacity: 0.4 }], { duration: 640, delay: i * 70, easing: 'cubic-bezier(.5,0,.7,.4)', fill: 'backwards' }); a.onfinish = () => { im2.remove(); F.flyers--; if (i === nIc - 1) { F.bump(k); F.count(k, m); } }; }
    if (!nIc) F.count(k, m);
  };
  return F;
}
const fmtCoin = (n) => { const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']; let i = 0; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10) + u[i]; };

// ---- Montacargas: una secuencia conectada (propuesta) ----
// 1 La prensa acaba una hornada: la rueda sale y el contador CHEESE sube en el acto (la recompensa no espera al viaje).
// 2 La rueda baja por una rampa corta hasta el rellano (la mueve la máquina, no un ratón).
// 3 La jaula espera abierta y la rueda entra. 4 Sale cuando lleva 3 ruedas o cuando pasan 1,5 s sin que llegue otra; la puerta
// se cierra antes de moverse. 5 Sube con arranque y frenada. 6 Arriba se abre, las ruedas ruedan a su hueco del mostrador y
// la jaula baja vacía. La venta saca una rueda del mostrador y las monedas vuelan al contador. Nada de esto cambia la simulación:
// el queso ya está hecho; la jaula cuenta cómo llega.
function lift2(geo) {
  const L = { y: geo.down, st: 'open', t0: 0, cargo: 0, lastIn: -1e9, ramp: [], landing: 0, out: [], shop: 2, gate: 1, log: [] };
  L.addWheel = (now) => L.ramp.push({ t0: now });
  L.tick = (now) => {
    for (let i = L.ramp.length - 1; i >= 0; i--) if (now - L.ramp[i].t0 > 600) { L.ramp.splice(i, 1); if (L.st === 'open' && L.cargo < 3) { L.cargo++; L.lastIn = now; L.log.push(['in', now]); } else L.landing++; }
    if (L.st === 'open' && L.cargo < 3 && L.landing > 0 && now - L.lastIn > 250) { L.landing--; L.cargo++; L.lastIn = now; }
    const go = (st) => { L.st = st; L.t0 = now; L.log.push([st, now]); };
    if (L.st === 'open' && L.cargo > 0 && (L.cargo >= 3 || now - L.lastIn > 1500)) go('closing');
    else if (L.st === 'closing') { L.gate = Math.max(0, 1 - (now - L.t0) / 160); if (now - L.t0 > 160) go('up'); }
    else if (L.st === 'up' || L.st === 'down') { const ms = L.st === 'up' ? 2600 : 2200, k = Math.min(1, (now - L.t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, a = L.st === 'up' ? geo.down : geo.up, b = L.st === 'up' ? geo.up : geo.down; L.y = a + (b - a) * e; if (k >= 1) { if (L.st === 'up') { go('unload'); L.gate = 1; } else { go('open'); L.gate = 1; } } }
    else if (L.st === 'unload') { const n = L.cargo; if (n && now - L.t0 > 220) { L.cargo--; L.out.push({ t0: now, slot: L.shop + L.out.length }); L.t0 = now; } if (!L.cargo && !L.out.length) go('down'); }
    for (let i = L.out.length - 1; i >= 0; i--) if (now - L.out[i].t0 > 420) { L.out.splice(i, 1); L.shop = Math.min(5, L.shop + 1); L.log.push(['shop', now]); }
  };
  return L;
}

// El pico aprobado: se recorta de la animación de minería aprobada (swing_player, 5 fotogramas) por sus colores (mango y
// cabeza de acero), se le pone el contorno de tinta y se apoya en la pata del ratón oficial. Es el mismo dibujo, no uno nuevo.
const PICKC = { '#dcaa6a': 1, '#3e2418': 1, '#4e2c1c': 1, '#b9c1d1': 1, '#f2f5fa': 1, '#6c7488': 1, '#454a5a': 1, '#fffbe0': 1, '#ffe55c': 1 };
const PICKF = [];
function approvedPick(f) {
  if (PICKF[f]) return PICKF[f]; const i = im('out/anims/swing_player.png'); if (!i.complete || !i.width) return null;
  const c = document.createElement('canvas'); c.width = 160; c.height = 20; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, 160, 20).data, b = PB(32, 20);
  for (let y = 0; y < 20; y++) for (let x = 12; x < 32; x++) { const k = (y * 160 + f * 32 + x) * 4; if (d[k + 3] < 128) continue; const h = '#' + [d[k], d[k + 1], d[k + 2]].map((v) => v.toString(16).padStart(2, '0')).join(''); if (PICKC[h]) b.px(x, y, h); }
  b.outline(); return (PICKF[f] = b.canvas());
}
let PICKDX = -3, PICKDY = 2; // la pata del ratón oficial queda 3 px más atrás y 2 más abajo que la del trabajador genérico

// ==== ev2/ev_px.js ====
// ---------- EVOLUCIÓN Y BOOST · tratamiento de píxel corregido ----------
// Qué causaba el «doble relieve» en la primera entrega: cada pieza se dibujaba como una caja con su propio canto de tinta y su
// propio bisel (luz arriba e izquierda, sombra abajo y derecha); al acabar, el contorno exterior se añadía por fuera de esos
// cantos. Resultado: 2 px de tinta en el borde y un marco claro-oscuro alrededor de cada tabla, piedra y ventana.
// Reglas nuevas, las de los ratones: 1 px de tinta solo por fuera de la silueta; dentro, líneas con el tono más oscuro del
// material (jerarquía: tinta > tono 4 > tono 3); el volumen sale de la luz de la masa entera (arriba a la izquierda), no de
// cada pieza; una sola sombra de contacto, en la escena.
const GEM = ['#ffffff', '#9fe6ff', '#5ad1ff', '#2f8fc0', '#1d5f86'], GEMOFF = ['#b8b4ae', '#8e8a84', '#6c6862', '#4a4844', '#2e2c2a'];
const BRS = ['#fff0b0', '#e8c060', '#c09030', '#8a6420', '#4e3612'];
const PNT = ['#fff3a0', '#ffd84a', '#e0a020', '#9a6a10', '#5a3a08'];
// Volumen sin canto de tinta: masa con luz arriba a la izquierda, lado derecho en trama, oclusión abajo.
function vol(c, x, y, w, h, R, { top = 1, side = 2, ao = 2, left = 1, face = 0 } = {}) {
  c.rect(x, y, w, h, R[2]);
  for (let j = 0; j < face; j++) c.hline(x, y + j, w, R[1]);
  if (top) c.hline(x, y, w, R[face ? 0 : 1]);
  for (let i = 0; i < left; i++) c.vline(x + i, y + (top ? 1 : 0), h - (top ? 1 : 0), R[1]);
  for (let k = 0; k < side; k++) { const xx = x + w - 1 - k; for (let yy = y + 1; yy < y + h; yy++) if (k === 0 || DI(xx, yy)) c.px(xx, yy, R[3]); }
  for (let j = 0; j < ao; j++) { const yy = y + h - 1 - j; for (let xx = x; xx < x + w; xx++) if (j === 0 || DI(xx, yy)) c.px(xx, yy, j === 0 ? R[4] : R[3]); }
}
// Tablas sin bisel por tabla: la masa se sombrea entera y las juntas son una línea de tono 3.
function boards(c, x, y, w, h, R, step = 4, dir = 'v', seed = 1) {
  vol(c, x, y, w, h, R, { side: 2, ao: 2 });
  if (dir === 'v') for (let xx = x + step; xx < x + w - 1; xx += step) c.vline(xx, y + 1, h - 2, R[3]);
  else for (let yy = y + step; yy < y + h - 1; yy += step) { c.hline(x + 1, yy, w - 2, R[3]); }
  for (let i = 0; i < (w * h) / 30; i++) { const xx = x + 1 + Math.floor(hh2(i, 3, seed) * (w - 2)), yy = y + 1 + Math.floor(hh2(i, 5, seed) * (h - 3)); if (c.get(xx, yy) === R[2] && c.get(xx, yy + 1) === R[2]) c.px(xx, yy, R[3]); }
}
// Mampostería sin bisel por piedra: juntas de tono 3 y alguna piedra más clara.
function stones2(c, x, y, w, h, R, rowH = 3, seed = 2) {
  vol(c, x, y, w, h, R, { side: 2, ao: 1 });
  for (let r = 0, yy = y + rowH; yy < y + h; r++, yy += rowH) c.hline(x + 1, yy, w - 2, R[3]);
  for (let r = 0, yy = y; yy < y + h; r++, yy += rowH) { let xx = x + 2 + (r % 2 ? 3 : 0); while (xx < x + w - 2) { c.vline(xx, yy + 1, Math.min(rowH - 1, y + h - yy - 1), R[3]); if (hh2(xx, yy, seed) < 0.25) c.hline(xx + 1, yy + 1, 3, R[1]); xx += 5 + Math.floor(hh2(xx, yy, seed + 1) * 3); } }
}
// Gema de refuerzo (la del panel BOOSTS aprobado) en su engaste de latón. Apagada si el puesto no tiene ratón.
const GEM_ROWS2 = ['.HHHHH.', 'HWHLLLD', 'LHLLLDD', '.LLLDD.', '..LDD..', '...D...'];
function gemSocket(c, x, y, on = true) {
  c.ell(x + 4.5, y + 4, 5.2, 4.6, (xx, yy) => (xx + yy < x + y + 7 ? BRS[1] : xx + yy < x + y + 10 ? BRS[2] : BRS[3]));
  const G = on ? GEM : GEMOFF; c.stamp(GEM_ROWS2, { H: G[1], W: G[0], L: G[2], D: G[3] }, x + 1, y + 1);
}
// Destello de la gema (solo si trabaja), en la escena: cruz de 1 px que aparece y se va en pasos.
function gemGlint(g, x, y, t, period = 2300, ph = 0) { const k = ((t + ph) % period) / period; if (k > 0.12) return; const s = k < 0.04 ? 1 : k < 0.08 ? 2 : 1; g.fillStyle = '#ffffff'; g.fillRect(x, y - s, 1, s * 2 + 1); g.fillRect(x - s, y, s * 2 + 1, 1); }
// Diagnóstico: píxeles de tinta que forman un segundo anillo (tinta pegada por dentro a la tinta del borde).
function doubleInk(cv) {
  const w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data, A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 127;
  const ink = (x, y) => A(x, y) && Math.abs(d[(y * w + x) * 4] - 0x1b) < 10 && Math.abs(d[(y * w + x) * 4 + 1] - 0x12) < 10 && Math.abs(d[(y * w + x) * 4 + 2] - 0x20) < 12;
  const edge = (x, y) => { if (!ink(x, y)) return false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !A(x + dx, y + dy)) return true; return false; };
  const bad = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ink(x, y) && !edge(x, y) && (edge(x - 1, y) || edge(x + 1, y) || edge(x, y - 1) || edge(x, y + 1))) bad.push([x, y]);
  let e = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (edge(x, y)) e++;
  return { bad, edge: e };
}
// Huecos de 1 px entre piezas (entre las espiras de un serpentín, entre una pata y el suelo): se cierran con un tono oscuro
// del vecino antes del contorno, para que el contorno no los rellene de tinta (sería una línea interior de tinta).
function closeGaps(c, pass = 0) {
  const add = []; for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) { if (c.get(x, y)) continue; const l = c.get(x - 1, y), r = c.get(x + 1, y), u = c.get(x, y - 1), d = c.get(x, y + 1); const nb = [l, r, u, d].filter(Boolean), ne = c.get(x + 1, y - 1), sw = c.get(x - 1, y + 1), nw = c.get(x - 1, y - 1), se = c.get(x + 1, y + 1), diag = nb.length >= 2 && ((ne && sw) || (nw && se)), n = l && r ? [l, r] : u && d ? [u, d] : nb.length >= 3 || diag ? nb : null; if (n) add.push([x, y, mixc(n[0], '#000000', 0.3)]); }
  for (const [x, y, col] of add) c.px(x, y, col); return add.length && pass < 2 ? closeGaps(c, pass + 1) : c;
}

// ==== ev2/ev_art.js ====
// ---------- EVOLUCIÓN Y BOOST · edificios con el tratamiento corregido (propuesta, no aprobados) ----------
// Cada edificio se monta por piezas: una base y módulos que se añaden con el progreso real; el BOOST es otra capa con su propio
// módulo, su luz y su ritmo, y se ancla a la etapa que haya. Así un edificio evolucionado no pierde nada al potenciarse.
const EVC = {};
const evArt = (k, f) => (EVC[k] ||= f());
const P2 = PAL;

// ================= HOUSE · 98 × 58 (etapa I usa 64 de ancho) =================
// I · la casa: la cama (THE BED) y reclutar. II · TRAINING ROOM a la vista (el cobertizo con el muñeco de entrenar).
// III · tablón de reclutas junto a la puerta y buhardilla con luz (más ratones en la colonia).
function houseStage(stage, boost = false) {
  return evArt('h' + stage + boost, () => {
    const W = stage >= 3 ? 100 : stage >= 2 ? 88 : 64, c = PB(W, 58), P = P2, G = 57;
    // Chimenea.
    vol(c, 44, 8, 7, 18, P.stn, { side: 2, ao: 0 }); c.rect(43, 6, 9, 2, P.stn[1]); c.hline(43, 7, 9, P.stn[3]); for (let y = 11; y < 24; y += 3) c.hline(45, y, 5, P.stn[3]);
    // Anexo TRAINING ROOM (etapa II): cobertizo de tablas con el frente abierto y el muñeco de paja.
    if (stage >= 2) {
      boards(c, 54, 34, 32, 16, P.woo, 4, 'v', 7);
      c.rect(60, 38, 20, 10, P.wod[4]); c.hline(60, 38, 20, '#120a08'); for (let y = 39; y < 48; y++) if (DI(60, y)) c.px(60, y, P.wod[3]);
      c.rect(69, 40, 2, 8, P.woo[3]); c.ell(70, 42, 3.2, 3.6, (x, y) => (y < 42 ? P.str[1] : P.str[2])); c.hline(67, 42, 7, P.str[3]); c.px(70, 41, P.red[1]);
      c.rect(75, 44, 4, 4, P.irn[2]); c.hline(75, 44, 4, P.irn[1]);
      // Tejado de una sola agua, de tablas.
      c.poly([[52, 34], [86, 37], [86, 39], [52, 36]], P.woo[3]); c.poly([[52, 31], [87, 35], [87, 37], [52, 33]], (x, y) => (y < 33 ? P.woo[1] : P.woo[2])); c.line(52, 31, 87, 35, P.woo[0]);
      stones2(c, 54, 50, 34, 7, P.stn, 3, 5);
    }
    // Muros con entramado.
    vol(c, 8, 28, 46, 21, P.pla, { side: 3, ao: 2 });
    for (const x of [8, 31, 52]) { c.vline(x, 28, 21, P.woo[2]); c.vline(x + 1, 28, 21, P.woo[3]); }
    c.hline(8, 28, 46, P.woo[2]); c.hline(8, 29, 46, P.woo[3]); c.hline(8, 46, 46, P.woo[2]); c.hline(8, 47, 46, P.woo[3]);
    for (let i = 0; i < 34; i++) { const x = 11 + Math.floor(hh2(i, 1) * 40), y = 31 + Math.floor(hh2(i, 2) * 13); if (c.get(x, y) === P.pla[2]) c.px(x, y, P.pla[3]); }
    // Zócalo.
    stones2(c, 6, 49, 50, 8, P.stn, 3, 4);
    // Puerta redonda: arco de piedra, tablas, herrajes, pomo; las líneas de dentro son del tono más oscuro de la madera.
    const dc = 20, inArch = (x, y, r) => (y >= 38 && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - 38) ** 2 <= r * r && y < 38);
    c.fill((x, y) => inArch(x, y, 8.4) && y < 48, (x, y) => (hh2(x, y, 7) < 0.5 ? P.stw[1] : P.stw[2]), dc - 9, 26, dc + 10, 48);
    c.fill((x, y) => inArch(x, y, 6.4) && y < 48, (x, y) => (!inArch(x - 1, y, 6.4) || !inArch(x, y - 1, 6.4) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 7, 28, dc + 8, 48);
    for (const y of [37, 43]) { c.hline(dc - 5, y, 11, P.irn[3]); c.px(dc - 4, y, P.irn[1]).px(dc + 4, y, P.irn[1]); }
    c.rect(dc + 3, 40, 2, 2, P.gld[2]); c.px(dc + 3, 40, P.gld[0]);
    c.rect(dc - 9, 47, 19, 2, P.stn[1]); c.hline(dc - 9, 47, 19, P.stn[0]);
    // Farol y ventana redonda con la luz de dentro; jardinera.
    c.vline(28, 31, 2, P.irn[3]); c.rect(27, 33, 4, 5, P.irn[3]); c.rect(28, 34, 2, 3, P.win[1]); c.px(28, 34, P.win[0]);
    const wx = 42, wy = 36;
    c.ell(wx, wy, 5.6, 5.6, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3]));
    c.vline(wx - 1, wy - 3, 7, P.wod[3]); c.hline(wx - 4, wy, 7, P.wod[3]); c.px(wx - 3, wy - 2, P.win[0]).px(wx - 2, wy - 3, P.win[0]);
    vol(c, 35, 42, 15, 4, P.woo, { side: 1, ao: 1 });
    for (let i = 0; i < 7; i++) { const x = 36 + i * 2, col = [P.red[1], P.gld[1], '#ff9ab5', P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]; c.px(x, 40, P.lea[2]).px(x + 1, 41, P.lea[3]).px(x, 39, col).px(x + 1, 40, P.lea[1]); }
    // Tejado: cuña de queso. Cara con ojos, corteza en los cantos, el corte de abajo y la sombra sobre el muro.
    const face = (x, y) => inPoly(x + 0.5, y + 0.5, [[2, 30], [19, 3.5], [60, 30]]);
    c.fill((x, y) => face(x, y) || (y >= 30 && y < 32 && x >= 2 && x < 60), (x, y) => { if (y >= 30) return y === 30 ? P.chz[3] : P.rnd[4]; const e1 = segDist(x + 0.5, y + 0.5, 2, 30, 19, 3.5), e2 = segDist(x + 0.5, y + 0.5, 19, 3.5, 60, 30); if (e1 < 2.4) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.4) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, 3, 4, 56, 25); }, 0, 0, 62, 32);
    for (const [hx, hy, rx, ry] of [[22, 15, 3.2, 2.2], [34, 21, 2.6, 2], [13, 22, 2.2, 1.6], [46, 25, 2.2, 1.4], [28, 25.5, 1.6, 1.1], [20, 10, 1.4, 1], [40, 17, 1.4, 1]]) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1]));
    castSh(c, 10, 32, 42, P.pla, 3);
    // Etapa III: buhardilla con luz en el tejado y el tablón de reclutas.
    if (stage >= 3) {
      c.rect(28, 17, 11, 9, P.pla[2]); c.vline(28, 17, 9, P.pla[1]); c.vline(38, 17, 9, P.pla[3]); c.rect(30, 19, 7, 6, P.wod[4]); c.rect(31, 20, 5, 5, P.win[1]); c.vline(33, 20, 5, P.wod[3]); c.hline(31, 22, 5, P.wod[3]); c.px(31, 20, P.win[0]);
      c.poly([[25.5, 18], [33.5, 10], [41.5, 18], [41.5, 19], [25.5, 19]], (x, y) => (y >= 18 ? P.rnd[3] : x < 33 ? P.rnd[1] : P.rnd[2])); c.line(26, 18, 33, 11, P.rnd[0]);
      c.rect(89, 38, 2, 19, P.woo[3]); c.rect(97, 38, 2, 19, P.woo[3]); vol(c, 87, 32, 13, 12, P.woo, { side: 1, ao: 1 });
      for (const [x, y, col] of [[89, 34, '#fffbea'], [93, 35, '#f4e4bc'], [90, 39, '#ffe8a0'], [95, 39, '#fffbea']]) { c.rect(x, y, 3, 4, col); c.px(x + 1, y, P.red[1]); }
    }
    // BOOST (concepto, no implementado): hogar encendido. Todas las ventanas con luz, una gema en el dintel y la chimenea
    // con un brillo cálido. Sigue siendo una casa.
    if (boost) { gemSocket(c, 15, 22, true); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy ? '#fffbe0' : '#ffe8a0')); c.vline(wx - 1, wy - 3, 7, P.win[3]); c.hline(wx - 4, wy, 7, P.win[3]); c.rect(28, 34, 2, 3, '#fffbe0'); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}

// ================= LAB · 66 × 80 =================
// I · laboratorio modesto (se construye con 3 recetas): una planta, el ojo de buey con el experimento, chimenea de ventilación.
// II · Research Assistant: segunda planta con la mesa del investigador y el serpentín de su experimento.
// III · Advanced Research: la cúpula con el telescopio (elegir dirección de investigación) y la antena.
// IV · Strain Research: el invernadero de cepas con sus cultivos.
// Hueco reservado (sin dibujar): el anexo de FORBIDDEN GENETICS (fusión, mutaciones y linajes; entrega C de ratones, pendiente).
function labStage(stage, boost = false) {
  return evArt('l' + stage + boost, () => {
    const c = PB(68, 80), P = P2;
    // Etapa IV: invernadero de cepas a la derecha.
    if (stage >= 4) {
      vol(c, 47, 54, 19, 17, P.gla, { side: 1, ao: 0 }); for (let x = 51; x < 66; x += 5) c.vline(x, 54, 17, P.irn[2]); c.hline(47, 54, 19, P.irn[2]); c.hline(47, 62, 19, P.irn[2]);
      for (const [x, col] of [[49, ['#c8ffb0', '#7ae08a', '#3a9a50']], [57, ['#f0d0ff', '#b58cff', '#6a3ab0']]]) { c.rect(x, 63, 6, 7, col[2]); c.rect(x + 1, 64, 4, 3, col[1]); c.px(x + 1, 64, col[0]); c.rect(x, 62, 6, 1, P.irn[1]); }
      c.poly([[46, 54], [56, 48], [67, 54]], P.irn[2]); c.line(46, 54, 56, 48, P.irn[1]);
      stones2(c, 46, 70, 21, 9, P.stn, 3, 12);
    }
    // Planta baja (todas las etapas).
    boards(c, 7, 48, 36, 21, P.plb, 3, 'h', 3);
    const ox = 21, oy = 57;
    c.ell(ox, oy, 7.4, 7.4, (x, y) => (x + y < ox + oy - 3 ? P.cop[0] : x + y < ox + oy + 4 ? P.cop[1] : P.cop[2])); c.ell(ox, oy, 5.4, 5.4, P.cop[4]); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#1e3a3c' : '#16302e'));
    for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0]]) c.px(ox + dx, oy + dy, P.cop[3]);
    c.rect(ox - 1, oy - 4, 2, 3, P.gla[2]); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#8af0a0' : '#4ac070')); c.px(ox - 2, oy - 3, '#e8fff0');
    vol(c, 31, 55, 10, 14, P.wod, { side: 2, ao: 1 }); c.rect(33, 57, 5, 4, P.gla[2]); c.px(33, 57, P.gla[0]); c.hline(33, 61, 5, P.wod[4]); c.rect(38, 63, 2, 1, P.gld[2]);
    stones2(c, 5, 69, 40, 10, P.stn, 3, 8); c.rect(30, 69, 12, 2, P.stn[1]); c.hline(30, 69, 12, P.stn[0]);
    // Pizarra con fórmulas (todas las etapas).
    c.line(1, 79, 3, 66, P.woo[3]); c.line(7, 79, 5, 66, P.woo[3]); c.rect(0, 66, 9, 9, P.woo[3]); c.rect(1, 67, 7, 7, P.chalk[1]); c.hline(2, 68, 4, '#d8e0d8'); c.hline(2, 70, 2, '#d8e0d8'); c.px(5, 70, '#d8e0d8'); c.hline(3, 72, 4, '#d8e0d8');
    if (stage === 1) {
      // Azotea con pretil y chimenea de ventilación.
      vol(c, 5, 44, 40, 4, P.stn, { side: 2, ao: 1, face: 1 }); cylv(c, 34, 33, 4, 11, P.irn, null); c.rect(33, 32, 6, 2, P.irn[1]);
    } else {
      // Segunda planta: la mesa del investigador tras la ventana y el serpentín por fuera.
      vol(c, 5, 45, 40, 3, P.stn, { side: 2, ao: 1, face: 1 });
      boards(c, 8, 25, 34, 20, P.plb, 3, 'h', 5);
      c.rect(13, 29, 17, 11, '#2a2232'); c.rect(14, 30, 15, 9, '#3e3446'); c.rect(15, 35, 13, 2, P.woo[2]); c.rect(17, 33, 3, 2, '#fffbea'); c.rect(24, 31, 2, 4, P.irn[2]); c.rect(23, 31, 4, 1, P.win[1]); c.px(24, 32, P.win[0]); for (let y = 31; y < 39; y++) if (DI(14, y)) c.px(14, y, '#2a2232');
      c.hline(13, 40, 17, P.woo[1]); c.rect(12, 29, 1, 12, P.woo[3]); c.rect(30, 29, 1, 12, P.woo[3]); c.hline(12, 28, 19, P.woo[3]);
      for (let y = 27; y < 69; y++) { const x = 44 + Math.round(Math.sin(y * 0.55) * 1.5); c.px(x, y, P.gla[1]).px(x + 1, y, y % 4 < 2 ? '#7ae08a' : P.gla[2]); c.px(x - 1, y, P.gla[3]); }
      if (stage < 4) { c.ell(45, 74, 4.4, 4.6, (x, y) => (y < 73 ? P.gla[1] : y < 76 ? '#7ae08a' : '#4ac070')); c.rect(44, 68, 3, 3, P.gla[3]); c.px(43, 72, '#ffffff'); }
      vol(c, 6, 22, 38, 3, P.stn, { side: 2, ao: 1, face: 1 });
      if (stage === 2) { cylv(c, 34, 11, 4, 11, P.irn, null); c.rect(33, 10, 6, 2, P.irn[1]); }
    }
    if (stage >= 3) {
      // Telescopio (detrás), cúpula con nervios y ranura, antena.
      c.fill((x, y) => segDist(x + 0.5, y + 0.5, 30, 18, 42, 8) < 1.6, (x, y) => (y + x < 48 ? P.cop[1] : P.cop[2]), 28, 6, 45, 21); c.rect(41, 5, 4, 5, P.cop[3]); c.rect(42, 6, 2, 3, P.gla[1]);
      c.fill((x, y) => ((x + 0.5 - 25) / 17) ** 2 + ((y + 0.5 - 22) / 15) ** 2 <= 1 && y < 22, (x, y) => faceTone(P.ver, x, y, 8, 7, 34, 15, 0.06), 7, 6, 43, 22);
      for (const x of [13, 19, 31, 37]) c.fill((xx, yy) => xx === x && ((xx + 0.5 - 25) / 17) ** 2 + ((yy + 0.5 - 22) / 15) ** 2 <= 1 && yy < 22 && yy > 9, P.ver[3]);
      c.fill((x, y) => x >= 27 && x <= 30 && y >= 10 && y < 22, (x) => (x === 27 ? P.ver[4] : '#0e1a1e')); c.hline(15, 9, 4, P.ver[0]); c.hline(12, 11, 3, P.ver[0]);
      c.vline(25, 0, 8, P.irn[3]); c.vline(26, 1, 7, P.irn[1]); c.rect(24, 0, 3, 2, P.irn[2]);
    }
    // BOOST (concepto, no implementado): resonador de gema en la antena, arcos de energía hacia la cúpula, el experimento
    // del ojo de buey a pleno y el serpentín más rápido. La animación de los arcos va aparte.
    if (boost && stage >= 3) { gemSocket(c, 21, 0, true); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#2a6a6a' : '#1e5a56')); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#c8fff0' : '#5ad1ff')); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}

// ==== ev2/ev_bed.js ====
// ---------- HOUSE · la cama (THE BED), corregida ----------
// El ratón sigue siendo el sprite oficial, sin tocar: se ve su cabeza (con la cara oficial de dormir) apoyada en la almohada,
// a la altura del colchón, y el resto queda bajo la manta. La manta es un bulto largo (el cuerpo estirado hasta los pies),
// con el embozo blanco doblado bajo la barbilla, su sombra y su caída por el lado; respira: el bulto sube 1 px cada 2,4 s.
// Las Z son de píxel con contorno, de tres tamaños, salen de la cabeza en diagonal y se van por pasos (sin transparencias).
// Despertar: abre los ojos (cara oficial de sorpresa) y la oreja se mueve; aparta la manta en tres pasos; se pone de pie
// junto a la cama con un saltito y se va andando. Una cama: una plaza (THE BED y TRAINING ROOM la comparten).
const Z5 = ['#####', '...#.', '..#..', '.#...', '#####'], Z4 = ['####', '..#.', '.#..', '####'], Z3 = ['###', '.#.', '###'];
const zGlyph = (rows) => evArt('z' + rows.length, () => { const b = PB(rows[0].length + 2, rows.length + 2); b.stamp(rows, { '#': '#e8f6ff' }, 1, 1); b.outline(); return b.canvas(); });
// La cabeza: las 11 filas de arriba del sprite oficial (sombrero, oreja, cara). El cuerpo no se dibuja: está bajo la manta.
const headOf2 = (m, o) => evArt('hd' + m.name + JSON.stringify(o), () => { const src = mouseCanvas(m, 0, false, o), c = document.createElement('canvas'); c.width = 20; c.height = 11; c.getContext('2d').drawImage(src, 0, 0, 20, 11, 0, 0, 20, 11); return c; });
// La cama, 52 × 24: cabecero alto a la izquierda, colchón, pie de cama bajo a la derecha.
const bedSprite = () => evArt('bed2', () => {
  const c = PB(54, 24), P = P2;
  vol(c, 0, 1, 5, 23, P.woo, { side: 1, ao: 1 }); c.ell(2.5, 1.5, 3, 2.2, P.woo[1]); c.hline(1, 7, 3, P.woo[3]); c.hline(1, 12, 3, P.woo[3]);
  vol(c, 49, 11, 5, 13, P.woo, { side: 1, ao: 1 }); c.ell(51.5, 11, 2.6, 1.8, P.woo[1]);
  vol(c, 5, 16, 44, 4, P.cre, { side: 1, ao: 1, face: 1 }); vol(c, 5, 20, 44, 2, P.woo, { side: 0, ao: 0 }); c.hline(5, 21, 44, P.woo[4]);
  for (const x of [7, 46]) c.rect(x, 22, 2, 2, P.woo[3]);
  closeGaps(c); c.outline(); return c.canvas();
});
const PILLOW = () => evArt('pillow', () => { const c = PB(14, 7); c.ell(7, 3.5, 6.6, 3.2, (x, y) => (y < 2 ? '#fffdf2' : y < 5 ? '#f4ecd6' : '#dccc9e')); c.hline(2, 3, 2, '#dccc9e'); closeGaps(c); c.outline(); return c.canvas(); });
// Manta: bulto largo desde la barbilla (x0) hasta el pie de la cama (x1). lift = respiración (0/1).
function blanket2(g, x0, x1, base, lift) {
  const R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); }, G = ['#d8ecff', '#8ab4ec', '#5a84cc', '#3a5aa0', '#243868'];
  for (let xx = x0; xx < x1; xx++) { const u = (xx - x0) / Math.max(1, x1 - x0), h = Math.round((u < 0.45 ? 6 : 6 - (u - 0.45) * 5) + (u < 0.5 ? lift : 0)); R2(xx, base - h, 1, h + 3, G[2]); R2(xx, base - h + 1, 1, 1, G[1]); if (u > 0.55) R2(xx, base - h + 2, 1, 1, G[3]); R2(xx, base - h, 1, 1, INK); if ((xx - x0) % 7 === 3) R2(xx, base - h + 3, 1, h, G[3]); }
  R2(x1, base - 3, 1, 7, INK); R2(x1 - 1, base + 1, 2, 3, G[3]);
  const eh = 7 + lift; R2(x0 - 1, base - eh, 6, eh + 3, INK); R2(x0, base - eh + 1, 4, eh + 1, '#fffdf2'); R2(x0 + 3, base - eh + 1, 1, eh + 1, '#dccc9e'); R2(x0, base - eh + 1, 4, 1, '#ffffff');
  R2(x0, base + 3, x1 - x0, 1, G[4]);
}
// t en ms dentro del bucle de 10 s: 0–6,5 s duerme; 6,5–7,1 s abre los ojos; 7,1–7,7 s aparta la manta (3 pasos); se levanta y se va.
function drawBed(g, x, y, m, t, opt = {}) {
  const phase = opt.sleepOnly ? 'sleep' : t < 6500 ? 'sleep' : t < 7100 ? 'eyes' : t < 7700 ? 'out' : 'gone', base = y + 17;
  g.drawImage(bedSprite(), x, y); g.drawImage(PILLOW(), x + 4, y + 9);
  const lift = phase === 'sleep' && t % 2400 > 1500 ? 1 : 0, step = phase === 'out' ? 1 + Math.min(2, Math.floor(((t - 7100) / 600) * 3)) : phase === 'gone' ? 3 : 0;
  if (phase === 'sleep' || phase === 'eyes' || (phase === 'out' && step < 3)) g.drawImage(headOf2(m, phase === 'sleep' ? { face: 'sleep' } : { face: 'wow', ear: t % 300 < 150 }), x + 4, y + 5 - (phase === 'eyes' && t < 6650 ? 1 : 0));
  // La manta se aparta hacia los pies a pasos (queda doblada al final de la cama).
  blanket2(g, x + 22 + step * 6, x + 49, base, step ? 0 : lift);
  if (phase === 'sleep') { const z = (t % 2700) / 2700; [[Z3, 0], [Z4, 0.33], [Z5, 0.66]].forEach(([rows, d], i) => { const k = (z + 1 - d) % 1; if (k > 0.78) return; g.drawImage(zGlyph(rows), x + 18 + i * 5 + Math.round(k * 4), y - 2 - i * 5 - Math.round(k * 7)); }); }
  if (phase === 'out' && step >= 3) g.drawImage(mF(m, 0, false, { face: 'happy' }), x + 52, y + 1);
  if (phase === 'gone') { const k = Math.min(1, (t - 7700) / 2300), walk = Math.round(k * 38), hop = k < 0.04 ? 2 : k < 0.08 ? 1 : 0; g.drawImage(mF(m, 0, false, k < 0.1 ? { face: 'happy' } : { legs: Math.floor(t / 120) % 2 ? 'a' : 'b' }), x + 52 + walk, y + 2 - hop); }
}
// La plaza de la cama con un ratón que tiene puesto: en el juego sigue trabajando mientras le tratan, así que no puede estar
// también en la cama. Se ve la cama abierta y su retrato en el cabecero (propuesta).
function drawBedOccupied(g, x, y, m, t) {
  g.drawImage(bedSprite(), x, y); g.drawImage(PILLOW(), x + 4, y + 9); blanket2(g, x + 34, x + 49, y + 17, 0);
  g.fillStyle = '#1b1220'; g.fillRect(x - 1, y - 4, 12, 11); g.fillStyle = BRS[2]; g.fillRect(x, y - 3, 10, 9); g.fillStyle = '#3a2a40'; g.fillRect(x + 1, y - 2, 8, 7);
  const face = mouseCanvas(m, 0, false, {}); g.drawImage(face, 4, 1, 14, 10, x + 1, y - 2, 8, 6);
}
// Pose descartada (A): el sprite oficial entero girado 90°. Es casi cuadrado, así que tumbado sigue pareciendo un bloque.
const lyingOf = (m, face) => evArt('ly2' + m.name + face, () => { const src = mouseCanvas(m, 0, false, { face }), c = document.createElement('canvas'); c.width = src.height; c.height = src.width; const g = c.getContext('2d'); g.translate(0, src.width); g.rotate(-Math.PI / 2); g.drawImage(src, 0, 0); return c; });
function bedRotated(g, x, y, m) { g.drawImage(bedSprite(), x, y); g.drawImage(PILLOW(), x + 4, y + 9); g.drawImage(lyingOf(m, 'sleep'), x + 6, y + 2); blanket2(g, x + 18, x + 49, y + 17, 0); g.drawImage(bedSprite(), 5, 16, 44, 6, x + 5, y + 16, 44, 6); }

// ==== ev2/ev2_refine.js ====
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

// ==== ev2/ev2_lie.js ====
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

// ==== ev2/ev2_house.js ====
// ---------- HOUSE · evolución V2 (propuesta) ----------
// I · La casa (se construye con la primera mejora): la casita de la cuña de queso.
// II · Casa de la colonia: la cuña crece en dos pisos (buhardilla con su ventana), zócalo de piedra labrada, puerta con aro
//      de latón, chimenea de ladrillo y un porche con banco y faroles. Disparador propuesto: reclutas de toda la partida.
// III · Gran madriguera: un torreón con tejado cónico de corteza y una gran vidriera redonda (la galería del álbum), una
//      pasarela y el patio con el muñeco de entrenar (TRAINING ROOM). Disparador propuesto: piezas del álbum.
// Los dos disparadores son contadores permanentes del juego que solo suben (no retroceden al despedir ni al cambiar de puesto).
function houseV2(stage) {
  return art('houseV2' + stage, () => {
    const off = stage >= 3 ? 24 : 0, W = stage >= 3 ? 110 : 80, c = PB(W, 76), P = PAL, G = 75, X = off;
    // ---- Torreón del álbum (III) ----
    if (stage >= 3) {
      cylv(c, 3, 34, 22, 34, P.stw, null);
      for (let y = 38; y < 66; y += 4) for (let x = 4; x < 24; x++) if (c.get(x, y)) c.px(x, y, mixc(c.get(x, y), '#000000', 0.18));
      c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [[0, 36], [14, 8], [28, 36]]), (x, y) => { const e = segDist(x + 0.5, y + 0.5, 0, 36, 14, 8); return e < 2.2 ? P.rnd[0] : x < 14 ? P.rnd[1] : P.rnd[2]; }, 0, 6, 29, 37);
      for (let y = 14; y < 36; y += 5) c.fill((x, yy) => yy === y && inPoly(x + 0.5, yy + 0.5, [[0, 36], [14, 8], [28, 36]]), P.rnd[3]);
      c.rect(13, 3, 2, 6, BRS[2]); c.ell(14, 3, 2.2, 2.2, BRS[1]);
      // Vidriera del álbum: plomos oscuros y vidrios de colores, con luz.
      const vx = 14, vy = 47; c.ell(vx, vy, 7.6, 7.6, P.stw[3]); c.ell(vx, vy, 6.4, 6.4, (x, y) => { const a = Math.atan2(y + 0.5 - vy, x + 0.5 - vx), s = ((a + Math.PI) / (Math.PI * 2)) * 6 | 0; return ['#ffd84a', '#e8523a', '#5a9cf0', '#62d36e', '#b58cff', '#ffa040'][s]; });
      c.ell(vx, vy, 2.4, 2.4, '#fff6b8'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 - Math.PI; c.line(vx + Math.cos(a) * 2.5, vy + Math.sin(a) * 2.5, vx + Math.cos(a) * 6, vy + Math.sin(a) * 6, P.stw[4]); }
      c.rect(9, 60, 10, 8, P.wod[2]); c.hline(9, 60, 10, P.wod[1]); c.vline(14, 61, 7, P.wod[4]);
      // Pasarela al primer piso de la casa.
      c.rect(24, 44, X + 8 - 24, 2, P.woo[1]); c.hline(24, 46, X + 8 - 24, P.woo[3]); for (let x = 26; x < X + 8; x += 4) c.vline(x, 40, 4, P.woo[2]); c.hline(24, 40, X + 8 - 24, P.woo[2]);
    }
    // ---- Chimenea de ladrillo ----
    vol(c, X + 54, 12, 7, 26, P.bri, { side: 2, ao: 0 }); for (let y = 15; y < 36; y += 3) c.hline(X + 55, y, 5, P.bri[3]); c.rect(X + 53, 10, 9, 2, P.stn[1]); c.hline(X + 53, 11, 9, P.stn[3]);
    // ---- Planta baja: piedra labrada abajo, revoco con entramado arriba ----
    stones2(c, X + 6, 52, 58, 16, P.stw, 4, 21);
    vol(c, X + 6, 40, 58, 12, P.pla, { side: 3, ao: 0 });
    for (const x of [X + 6, X + 33, X + 62]) { c.vline(x, 40, 12, P.woo[2]); c.vline(x + 1, 40, 12, P.woo[3]); }
    c.hline(X + 6, 40, 58, P.woo[2]); c.hline(X + 6, 51, 58, P.woo[3]);
    // Puerta redonda con aro de latón.
    const dc = X + 22, inA = (x, y, r) => (y >= 56 && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - 56) ** 2 <= r * r && y < 56);
    c.fill((x, y) => inA(x, y, 8) && y < 68, (x, y) => (x + y < dc + 52 ? BRS[1] : BRS[2]), dc - 9, 46, dc + 10, 68);
    c.fill((x, y) => inA(x, y, 6.4) && y < 68, (x, y) => (!inA(x - 1, y, 6.4) || !inA(x, y - 1, 6.4) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 7, 48, dc + 8, 68);
    c.rect(dc + 3, 58, 2, 2, P.gld[1]); c.rect(dc - 8, 67, 17, 2, P.stn[1]); c.hline(dc - 8, 67, 17, P.stn[0]);
    // Ventanas: redonda con luz y una alargada de cuarterones.
    const wx = X + 46, wy = 46;
    c.ell(wx, wy, 5.6, 5.6, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3])); c.vline(wx - 1, wy - 3, 7, P.wod[3]); c.hline(wx - 4, wy, 7, P.wod[3]); c.px(wx - 3, wy - 2, P.win[0]);
    c.rect(X + 36, 55, 8, 9, P.wod[3]); c.rect(X + 37, 56, 6, 7, P.win[2]); c.rect(X + 37, 56, 6, 3, P.win[1]); c.vline(X + 40, 56, 7, P.wod[3]); c.hline(X + 37, 59, 6, P.wod[3]); vol(c, X + 35, 64, 10, 2, P.woo, { side: 0, ao: 0 });
    for (let i = 0; i < 4; i++) c.px(X + 36 + i * 2, 63, [P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]);
    // ---- Tejado: la cuña de abajo y la buhardilla (otra cuña más pequeña encima) ----
    const wedge = (A, B, C2, holes) => { c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [A, B, C2]), (x, y) => { const e1 = segDist(x + 0.5, y + 0.5, A[0], A[1], B[0], B[1]), e2 = segDist(x + 0.5, y + 0.5, B[0], B[1], C2[0], C2[1]); if (e1 < 2.3) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.3) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, A[0], B[1], C2[0] - A[0], A[1] - B[1]); }, Math.min(A[0], B[0]), B[1], C2[0] + 1, A[1] + 1); for (const [hx, hy, rx, ry] of holes) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1])); };
    wedge([X + 1, 41], [X + 22, 18], [X + 69, 41], [[X + 13, 35, 2.4, 1.6], [X + 50, 36, 2.6, 1.8], [X + 40, 30, 1.8, 1.2], [X + 58, 38, 1.6, 1.1]]);
    c.hline(X + 1, 41, 69, P.rnd[3]); c.hline(X + 2, 42, 67, P.rnd[4]);
    castSh(c, X + 8, 43, 54, P.pla, 3);
    // Buhardilla: su cuña, su ventana redonda con luz y su alero.
    wedge([X + 14, 28], [X + 30, 4], [X + 50, 28], [[X + 26, 13, 1.6, 1.1]]);
    c.hline(X + 14, 28, 37, P.rnd[3]);
    const ax = X + 33, ay = 20; c.ell(ax, ay, 4.4, 4.4, P.woo[2]); c.ell(ax, ay, 3, 3, (x, y) => (y < ay ? P.win[0] : P.win[2])); c.vline(ax, ay - 2, 5, P.wod[3]); c.hline(ax - 2, ay, 5, P.wod[3]);
    // ---- Porche con banco y faroles (descanso) ----
    vol(c, X + 64, 54, 14, 14, P.woo, { side: 1, ao: 1 }); for (let y = 57; y < 68; y += 3) c.hline(X + 65, y, 12, P.woo[3]);
    c.rect(X + 64, 44, 15, 3, P.woo[2]); c.hline(X + 64, 44, 15, P.woo[1]); c.vline(X + 77, 47, 7, P.woo[3]);
    c.rect(X + 66, 59, 10, 2, P.woo[1]); c.rect(X + 67, 61, 1, 3, P.woo[4]); c.rect(X + 74, 61, 1, 3, P.woo[4]);
    for (const lx of [X + 65, X + 76]) { c.rect(lx, 47, 2, 3, P.irn[3]); c.rect(lx, 48, 2, 2, P.win[1]); }
    // ---- Patio de entrenamiento (III): el muñeco de paja de la TRAINING ROOM ----
    if (stage >= 3) { const tx = X + 80; c.rect(tx + 2, 56, 2, 12, P.woo[3]); c.ell(tx + 3, 57, 3.4, 3.8, (x, y) => (y < 57 ? P.str[1] : P.str[2])); c.hline(tx - 1, 58, 9, P.str[3]); c.px(tx + 3, 56, P.red[1]); vol(c, tx - 2, 67, 10, 2, P.stw, { side: 0, ao: 0 }); }
    stones2(c, X + 4, 68, stage >= 3 ? 88 : 76, 8, P.stn, 3, 9);
    closeGaps(c); c.outline();
    return c.canvas();
  });
}

// ==== ev2/ev2_lab.js ====
// ---------- LAB · evolución V2: la fase IV (Strain Research) cambia de verdad ----------
function labV2(stage, boost = false) {
  return evArt('l2' + stage + boost, () => {
    const c = PB(86, 80), P = P2;
    // Etapa IV · Strain Research: el ala de cultivos. Un biorreactor alto de vidrio (columna con las cepas por capas), unido a la
    // torre por dos tuberías, y un invernadero bajo con las bandejas de cultivo. Vidrio, tuberías húmedas y luz verde y violeta:
    // la cúpula mira hacia fuera (direcciones); el ala de cultivos hace crecer algo.
    if (stage >= 4) {
      vol(c, 47, 58, 37, 12, P.gla, { side: 1, ao: 0 }); c.poly([[46, 58], [66, 50], [85, 58]], (x, y) => (y < 54 ? P.gla[0] : P.gla[1])); for (let x = 52; x < 84; x += 6) c.vline(x, 54, 16, P.irn[2]); c.hline(46, 58, 39, P.irn[2]);
      for (const [x, col] of [[49, ['#c8ffb0', '#7ae08a', '#3a9a50']], [56, ['#f0d0ff', '#b58cff', '#6a3ab0']], [63, ['#fff0b0', '#ffd84a', '#c09030']]]) { c.rect(x, 64, 5, 5, col[2]); c.rect(x, 64, 5, 2, col[1]); c.px(x + 1, 64, col[0]); c.hline(x - 1, 69, 7, P.irn[3]); }
      cylv(c, 70, 16, 12, 42, P.gla, null); for (let y = 18; y < 56; y++) { const band = Math.floor((y - 18) / 9); const col = ['#c8ffb0', '#b58cff', '#7ae08a', '#ffd84a', '#8af0d0'][band % 5]; c.rect(72, y, 8, 1, mixc(col, '#000000', y % 9 === 0 ? 0.35 : 0.12)); }
      c.rect(69, 14, 14, 3, P.irn[2]); c.hline(69, 14, 14, P.irn[1]); c.rect(74, 9, 4, 5, P.irn[3]); c.rect(68, 56, 16, 3, P.irn[2]); c.hline(68, 56, 16, P.irn[1]);
      for (const y of [30, 44]) { c.rect(44, y, 26, 2, P.cop[2]); c.hline(44, y, 26, P.cop[1]); c.rect(68, y - 1, 2, 4, BRS[2]); }
      stones2(c, 46, 70, 39, 9, P.stn, 3, 12);
    }
    // Planta baja (todas las etapas).
    boards(c, 7, 48, 36, 21, P.plb, 3, 'h', 3);
    const ox = 21, oy = 57;
    c.ell(ox, oy, 7.4, 7.4, (x, y) => (x + y < ox + oy - 3 ? P.cop[0] : x + y < ox + oy + 4 ? P.cop[1] : P.cop[2])); c.ell(ox, oy, 5.4, 5.4, P.cop[4]); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#1e3a3c' : '#16302e'));
    for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0]]) c.px(ox + dx, oy + dy, P.cop[3]);
    c.rect(ox - 1, oy - 4, 2, 3, P.gla[2]); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#8af0a0' : '#4ac070')); c.px(ox - 2, oy - 3, '#e8fff0');
    vol(c, 31, 55, 10, 14, P.wod, { side: 2, ao: 1 }); c.rect(33, 57, 5, 4, P.gla[2]); c.px(33, 57, P.gla[0]); c.hline(33, 61, 5, P.wod[4]); c.rect(38, 63, 2, 1, P.gld[2]);
    stones2(c, 5, 69, 40, 10, P.stn, 3, 8); c.rect(30, 69, 12, 2, P.stn[1]); c.hline(30, 69, 12, P.stn[0]);
    // Pizarra con fórmulas (todas las etapas).
    c.line(1, 79, 3, 66, P.woo[3]); c.line(7, 79, 5, 66, P.woo[3]); c.rect(0, 66, 9, 9, P.woo[3]); c.rect(1, 67, 7, 7, P.chalk[1]); c.hline(2, 68, 4, '#d8e0d8'); c.hline(2, 70, 2, '#d8e0d8'); c.px(5, 70, '#d8e0d8'); c.hline(3, 72, 4, '#d8e0d8');
    if (stage === 1) {
      // Azotea con pretil y chimenea de ventilación.
      vol(c, 5, 44, 40, 4, P.stn, { side: 2, ao: 1, face: 1 }); cylv(c, 34, 33, 4, 11, P.irn, null); c.rect(33, 32, 6, 2, P.irn[1]);
    } else {
      // Segunda planta: la mesa del investigador tras la ventana y el serpentín por fuera.
      vol(c, 5, 45, 40, 3, P.stn, { side: 2, ao: 1, face: 1 });
      boards(c, 8, 25, 34, 20, P.plb, 3, 'h', 5);
      c.rect(13, 29, 17, 11, '#2a2232'); c.rect(14, 30, 15, 9, '#3e3446'); c.rect(15, 35, 13, 2, P.woo[2]); c.rect(17, 33, 3, 2, '#fffbea'); c.rect(24, 31, 2, 4, P.irn[2]); c.rect(23, 31, 4, 1, P.win[1]); c.px(24, 32, P.win[0]); for (let y = 31; y < 39; y++) if (DI(14, y)) c.px(14, y, '#2a2232');
      c.hline(13, 40, 17, P.woo[1]); c.rect(12, 29, 1, 12, P.woo[3]); c.rect(30, 29, 1, 12, P.woo[3]); c.hline(12, 28, 19, P.woo[3]);
      for (let y = 27; y < 69; y++) { const x = 44 + Math.round(Math.sin(y * 0.55) * 1.5); c.px(x, y, P.gla[1]).px(x + 1, y, y % 4 < 2 ? '#7ae08a' : P.gla[2]); c.px(x - 1, y, P.gla[3]); }
      if (stage < 4) { c.ell(45, 74, 4.4, 4.6, (x, y) => (y < 73 ? P.gla[1] : y < 76 ? '#7ae08a' : '#4ac070')); c.rect(44, 68, 3, 3, P.gla[3]); c.px(43, 72, '#ffffff'); }
      vol(c, 6, 22, 38, 3, P.stn, { side: 2, ao: 1, face: 1 });
      if (stage === 2) { cylv(c, 34, 11, 4, 11, P.irn, null); c.rect(33, 10, 6, 2, P.irn[1]); }
    }
    if (stage >= 3) {
      // Telescopio (detrás), cúpula con nervios y ranura, antena.
      c.fill((x, y) => segDist(x + 0.5, y + 0.5, 30, 18, 42, 8) < 1.6, (x, y) => (y + x < 48 ? P.cop[1] : P.cop[2]), 28, 6, 45, 21); c.rect(41, 5, 4, 5, P.cop[3]); c.rect(42, 6, 2, 3, P.gla[1]);
      c.fill((x, y) => ((x + 0.5 - 25) / 17) ** 2 + ((y + 0.5 - 22) / 15) ** 2 <= 1 && y < 22, (x, y) => faceTone(P.ver, x, y, 8, 7, 34, 15, 0.06), 7, 6, 43, 22);
      for (const x of [13, 19, 31, 37]) c.fill((xx, yy) => xx === x && ((xx + 0.5 - 25) / 17) ** 2 + ((yy + 0.5 - 22) / 15) ** 2 <= 1 && yy < 22 && yy > 9, P.ver[3]);
      c.fill((x, y) => x >= 27 && x <= 30 && y >= 10 && y < 22, (x) => (x === 27 ? P.ver[4] : '#0e1a1e')); c.hline(15, 9, 4, P.ver[0]); c.hline(12, 11, 3, P.ver[0]);
      c.vline(25, 0, 8, P.irn[3]); c.vline(26, 1, 7, P.irn[1]); c.rect(24, 0, 3, 2, P.irn[2]);
    }
    // BOOST (concepto, no implementado): resonador de gema en la antena, arcos de energía hacia la cúpula, el experimento
    // del ojo de buey a pleno y el serpentín más rápido. La animación de los arcos va aparte.
    if (boost && stage >= 3) { gemSocket(c, 21, 0, true); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#2a6a6a' : '#1e5a56')); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#c8fff0' : '#5ad1ff')); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}

// ==== ev3/ev3_house.js ====
// ---------- HOUSE · evolución V2 con los ajustes de composición (21-10-2026) ----------
// Mismo edificio que houseV2 (ev2_house.js, dirección aprobada) con cuatro arreglos:
// 1. La buhardilla es un volumen simétrico, con la cumbrera en su centro, y su ventana redonda va centrada debajo de la
//    cumbrera. Antes el triángulo era asimétrico (cumbrera en x 30 sobre una base de 14 a 50) y la ventana caía en x 33.
// 2. La torre del álbum se apoya en el mismo zócalo de piedra que la casa (antes el zócalo empezaba en x 28 y la torre
//    acababa 8 px por encima del suelo), con una hilada de piedra más ancha al pie y un escalón en su puerta.
// 3. La pasarela suelta se cambia por un cuerpo de unión: un muro de piedra del zócalo al alero, entre la torre y la casa.
// 4. Sombras de contacto: el pie de la torre y del cuerpo de unión se oscurece donde toca el zócalo, el alero arroja sombra
//    sobre el muro de unión y la ventana redonda de la planta baja se ve entera bajo el alero (antes el alero la cortaba).
function houseV3(stage) {
  return art('houseV3' + stage, () => {
    const off = stage >= 3 ? 24 : 0, W = stage >= 3 ? 110 : 80, c = PB(W, 76), P = PAL, X = off;
    const dark = (x0, y0, w, h, k) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (c.get(x, y)) c.px(x, y, mixc(c.get(x, y), '#000000', k)); };
    if (stage >= 3) {
      // ---- Cuerpo de unión (detrás de la torre y de la casa): muro de piedra del suelo al alero ----
      stones2(c, 19, 42, 14, 26, P.stw, 4, 23);
      castSh(c, 22, 43, 10, P.stw, 2);
      // ---- Torre del álbum ----
      cylv(c, 3, 34, 22, 34, P.stw, null);
      for (let y = 38; y < 62; y += 4) for (let x = 4; x < 24; x++) if (c.get(x, y)) c.px(x, y, mixc(c.get(x, y), '#000000', 0.18));
      c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [[0, 36], [14, 8], [28, 36]]), (x, y) => { const e = segDist(x + 0.5, y + 0.5, 0, 36, 14, 8); return e < 2.2 ? P.rnd[0] : x < 14 ? P.rnd[1] : P.rnd[2]; }, 0, 6, 29, 37);
      for (let y = 14; y < 36; y += 5) c.fill((x, yy) => yy === y && inPoly(x + 0.5, yy + 0.5, [[0, 36], [14, 8], [28, 36]]), P.rnd[3]);
      c.rect(13, 3, 2, 6, BRS[2]); c.ell(14, 3, 2.2, 2.2, BRS[1]);
      castSh(c, 4, 37, 20, P.stw, 2);
      // Hilada de piedra al pie, 1 px más ancha a cada lado: la torre pesa y se planta en el zócalo.
      c.rect(2, 62, 24, 6, P.stn[2]); c.hline(2, 62, 24, P.stn[1]); c.hline(2, 67, 24, P.stn[3]);
      for (let x = 5; x < 25; x += 5) c.vline(x, 63, 4, P.stn[3]); c.hline(3, 65, 22, P.stn[3]);
      // Vidriera del álbum.
      const vx = 14, vy = 47; c.ell(vx, vy, 7.6, 7.6, P.stw[3]); c.ell(vx, vy, 6.4, 6.4, (x, y) => { const a = Math.atan2(y + 0.5 - vy, x + 0.5 - vx), s = ((a + Math.PI) / (Math.PI * 2)) * 6 | 0; return ['#ffd84a', '#e8523a', '#5a9cf0', '#62d36e', '#b58cff', '#ffa040'][s]; });
      c.ell(vx, vy, 2.4, 2.4, '#fff6b8'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 - Math.PI; c.line(vx + Math.cos(a) * 2.5, vy + Math.sin(a) * 2.5, vx + Math.cos(a) * 6, vy + Math.sin(a) * 6, P.stw[4]); }
      // Puerta de la torre con su escalón (el hueco corta la hilada).
      c.rect(9, 58, 10, 10, P.wod[2]); c.hline(9, 58, 10, P.wod[1]); c.vline(14, 59, 9, P.wod[4]); c.rect(8, 67, 12, 1, P.stn[1]);
    }
    // ---- Chimenea de ladrillo ----
    vol(c, X + 54, 12, 7, 26, P.bri, { side: 2, ao: 0 }); for (let y = 15; y < 36; y += 3) c.hline(X + 55, y, 5, P.bri[3]); c.rect(X + 53, 10, 9, 2, P.stn[1]); c.hline(X + 53, 11, 9, P.stn[3]);
    // ---- Planta baja ----
    stones2(c, X + 6, 52, 58, 16, P.stw, 4, 21);
    vol(c, X + 6, 40, 58, 12, P.pla, { side: 3, ao: 0 });
    for (const x of [X + 6, X + 33, X + 62]) { c.vline(x, 40, 12, P.woo[2]); c.vline(x + 1, 40, 12, P.woo[3]); }
    c.hline(X + 6, 40, 58, P.woo[2]); c.hline(X + 6, 51, 58, P.woo[3]);
    const dc = X + 22, inA = (x, y, r) => (y >= 56 && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - 56) ** 2 <= r * r && y < 56);
    c.fill((x, y) => inA(x, y, 8) && y < 68, (x, y) => (x + y < dc + 52 ? BRS[1] : BRS[2]), dc - 9, 46, dc + 10, 68);
    c.fill((x, y) => inA(x, y, 6.4) && y < 68, (x, y) => (!inA(x - 1, y, 6.4) || !inA(x, y - 1, 6.4) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 7, 48, dc + 8, 68);
    c.rect(dc + 3, 58, 2, 2, P.gld[1]); c.rect(dc - 8, 67, 17, 2, P.stn[1]); c.hline(dc - 8, 67, 17, P.stn[0]);
    // Ventana redonda entera entre las vigas (antes el alero tapaba su parte de arriba).
    const wx = X + 47, wy = 47;
    c.ell(wx, wy, 3.9, 3.9, (x, y) => (x + y < wx + wy - 1 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 2.6, 2.6, (x, y) => (y < wy ? P.win[1] : P.win[2])); c.vline(wx, wy - 2, 5, P.wod[3]); c.hline(wx - 2, wy, 5, P.wod[3]);
    c.rect(X + 36, 55, 8, 9, P.wod[3]); c.rect(X + 37, 56, 6, 7, P.win[2]); c.rect(X + 37, 56, 6, 3, P.win[1]); c.vline(X + 40, 56, 7, P.wod[3]); c.hline(X + 37, 59, 6, P.wod[3]); vol(c, X + 35, 64, 10, 2, P.woo, { side: 0, ao: 0 });
    for (let i = 0; i < 4; i++) c.px(X + 36 + i * 2, 63, [P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]);
    // ---- Tejado: la cuña grande y la buhardilla simétrica ----
    const wedge = (A, B, C2, holes) => { c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [A, B, C2]), (x, y) => { const e1 = segDist(x + 0.5, y + 0.5, A[0], A[1], B[0], B[1]), e2 = segDist(x + 0.5, y + 0.5, B[0], B[1], C2[0], C2[1]); if (e1 < 2.3) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.3) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, A[0], B[1], C2[0] - A[0], A[1] - B[1]); }, Math.min(A[0], B[0]), B[1], C2[0] + 1, A[1] + 1); for (const [hx, hy, rx, ry] of holes) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1])); };
    wedge([X + 1, 41], [X + 22, 18], [X + 69, 41], [[X + 13, 35, 2.4, 1.6], [X + 52, 36, 2.6, 1.8], [X + 58, 38, 1.6, 1.1]]);
    c.hline(X + 1, 41, 69, P.rnd[3]); c.hline(X + 2, 42, 67, P.rnd[4]);
    castSh(c, X + 8, 43, 54, P.pla, 3);
    // Buhardilla: base de X+14 a X+46, cumbrera en X+30 (el centro); tapa la punta de la cuña grande.
    const ax = X + 30;
    wedge([ax - 16, 28], [ax, 4], [ax + 16, 28], [[ax - 7, 23, 1.6, 1.1]]);
    c.hline(ax - 16, 28, 33, P.rnd[3]); castSh(c, ax - 14, 29, 29, P.chz, 1);
    const ay = 18; c.ell(ax, ay, 4.4, 4.4, P.woo[2]); c.ell(ax, ay, 3, 3, (x, y) => (y < ay ? P.win[0] : P.win[2])); c.vline(ax, ay - 2, 5, P.wod[3]); c.hline(ax - 2, ay, 5, P.wod[3]);
    // ---- Porche con banco y faroles ----
    vol(c, X + 64, 54, 14, 14, P.woo, { side: 1, ao: 1 }); for (let y = 57; y < 68; y += 3) c.hline(X + 65, y, 12, P.woo[3]);
    c.rect(X + 64, 44, 15, 3, P.woo[2]); c.hline(X + 64, 44, 15, P.woo[1]); c.vline(X + 77, 47, 7, P.woo[3]);
    c.rect(X + 66, 59, 10, 2, P.woo[1]); c.rect(X + 67, 61, 1, 3, P.woo[4]); c.rect(X + 74, 61, 1, 3, P.woo[4]);
    for (const lx of [X + 65, X + 76]) { c.rect(lx, 47, 2, 3, P.irn[3]); c.rect(lx, 48, 2, 2, P.win[1]); }
    if (stage >= 3) { const tx = X + 80; c.rect(tx + 2, 56, 2, 12, P.woo[3]); c.ell(tx + 3, 57, 3.4, 3.8, (x, y) => (y < 57 ? P.str[1] : P.str[2])); c.hline(tx - 1, 58, 9, P.str[3]); c.px(tx + 3, 56, P.red[1]); vol(c, tx - 2, 67, 10, 2, P.stw, { side: 0, ao: 0 }); }
    // ---- Zócalo común: en la fase III corre bajo la torre, el cuerpo de unión y la casa ----
    if (stage >= 3) stones2(c, 1, 68, 107, 8, P.stn, 3, 9); else stones2(c, X + 4, 68, 76, 8, P.stn, 3, 9);
    // Contacto: la última fila de cada muro, más oscura donde se apoya en el zócalo.
    if (stage >= 3) { dark(2, 66, 6, 1, 0.22); dark(20, 66, 6, 1, 0.22); dark(26, 65, 6, 2, 0.18); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}

// ==== ev3/ev3_sleep.js ====
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

// ==== ev4/ev4_bedanim.js ====
// ---------- HOUSE SLEEP · la secuencia completa (21-10-2026) ----------
// Pose aprobada: el ratón acurrucado (poseCanvas 'A'), tapado con la manta hasta la cabeza o destapado. De pie, el sprite
// oficial (andar con las patas a/b, quieto con su respiración y su parpadeo) y, en la cama, el mismo sprite oficial sin la
// mochila: se la cuelga en el pie de la cama al llegar y la recoge al irse. No hay ninguna otra pose.
// Capas, de atrás adelante: cama · almohada · manta en reposo (doblada a los pies) · ratón en la cama · manta que lo tapa ·
// mochila colgada (por fuera del pie) · ratón en el suelo · mochila en la mano · Z. La manta solo cambia de capa en un fotograma en que no toca al ratón.

// El sprite oficial sin la mochila: se borran sus tres colores y se rehace el contorno (el de mouseCanvas: pal.o por fuera de
// la silueta). Nada más cambia.
function noPackCanvas(m, dy = 0, blink = false, o = {}) {
  const key = 'np' + m.name + dy + (blink ? 'b' : '') + JSON.stringify(o);
  return art(key, () => {
    const src = mouseCanvas(m, dy, blink, o), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0); const im = x.getImageData(0, 0, c.width, c.height), d = im.data, W = c.width, H = c.height;
    const hex = (i) => '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    const pack = new Set(PACKS[(hashS(m.name) >>> 3) % PACKS.length]), OUT = BASE.o;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] && (pack.has(hex(i)) || hex(i) === OUT)) d[i + 3] = 0;
    const body = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && d[(yy * W + xx) * 4 + 3] > 0, add = [];
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (!body(xx, yy) && (body(xx - 1, yy) || body(xx + 1, yy) || body(xx, yy - 1) || body(xx, yy + 1))) add.push((yy * W + xx) * 4);
    for (const i of add) { d[i] = 0x2a; d[i + 1] = 0x1d; d[i + 2] = 0x2e; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); return c;
  });
}
// La mochila como objeto, con los colores de mochila de cada ratón (los mismos tres de su sprite oficial): solapa con
// hebilla, bolsillo delantero y dos correas. Colgada del pie de la cama, las correas abrazan el poste.
const PACK_ROWS = ['..SS.SS..', '.DMMMMMD.', 'DMLLLLLMD', 'DMMMBMMMD', 'DDDDDDDDD', 'DMMMMMMMD', 'DMLLLLMMD', 'DMLLLLMMD', '.DDDDDDD.'];
const packSprite = (m) => art('pack' + m.name, () => { const pk = packOf(m), c = PB(11, 11), C = { L: pk[0], M: pk[1], D: pk[2], S: mixc(pk[2], '#000000', 0.25), B: '#f2c02a' }; PACK_ROWS.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') c.px(i + 1, j + 1, C[ch]); })); c.outline(); return c.canvas(); });
function packOnPost(g, bx, by, m) { g.drawImage(packSprite(m), bx - 6, by + 7); } // por fuera del poste, sin pisar el colchón
function packHeld(g, x, y, m) { g.drawImage(packSprite(m), x - 2, y - 2); }

// Guion (ms). El bucle dura 12,2 s; dormir es la parte larga.
const BT = { walkIn: 1100, hang: 1400, hopUp: 1900, walkBed: 2400, turnL: 2600, turnR: 2800, curl: 3000, blanketUp: 3900, sleep: 7900, wake: 8400, blanketDown: 9300, stand: 9500, walkFoot: 10000, takePack: 10300, hopDown: 10800, walkOut: 11900, end: 12200 };
const PH_NAMES = [['walkIn', 'Entra andando'], ['hang', 'Cuelga la mochila en el pie de la cama'], ['hopUp', 'Sube de un salto por encima del pie'], ['walkBed', 'Anda por el colchón'], ['turnL', 'Da la vuelta (mira atrás)'], ['turnR', '… y vuelve a mirar a la almohada'], ['curl', 'Se acurruca'], ['blanketUp', 'La manta sube en tres pasos'], ['sleep', 'Duerme: respira y salen las Z'], ['wake', 'Abre los ojos'], ['blanketDown', 'La manta vuelve a los pies en tres pasos'], ['stand', 'Se levanta, entero y a la vista'], ['walkFoot', 'Anda hasta el pie de la cama'], ['takePack', 'Recoge la mochila'], ['hopDown', 'Baja de un salto por delante del pie'], ['walkOut', 'Se va'], ['end', 'Pausa y vuelve a empezar']];
const phaseAt = (t) => PH_NAMES.findIndex(([k]) => t < BT[k]);
// Posiciones (relativas al pie de la cama bx). Sobre el colchón el ratón empieza en bx + 6 para no pisar el pie.
// hop: altura del salto; 13 px es lo mínimo para pasar por encima del pie sin tocarlo (medido con checkBedLoop); 15 deja margen.
const BP = { start: -48, door: -19, bedFoot: 6, bedMid: 18, out: -24, gone: -62, hop: 15 };

// Describe un fotograma: qué sprite, dónde, la manta (cuánto tapa y en qué capa), la mochila y las Z.
// opt.door (x relativa al pie de la cama): si la habitación tiene una puerta en la pared del fondo, el ratón aparece dentro
// de su hueco saliendo de la oscuridad, y al irse vuelve al hueco y se funde con ella (f.fade: 0 visible, 1 a oscuras).
function bedFrame(t, m, bx, by, opt = {}) {
  const mat = by + 14, floor = by + 22, ph = phaseAt(t), P = PH_NAMES[ph][0], f = {};
  const A = poseCanvas(m, 'A'), csx = bx + SLEEP_X - A.width, csy = mat - A.height + 1;
  const breath = Math.floor((t + m.name.length * 431) / 650) % 2, blink = (t + m.name.length * 997) % 3300 < 110, legs = { legs: Math.floor(t / 120) % 2 ? 'a' : 'b' };
  const span = (a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const stand = (x, feet, flip, pack, o = {}, still = false) => { const dy = still ? breath : 0; f.mouse = { key: pack ? 'oficial' : 'oficial sin mochila', cv: pack ? mF(m, o.legs ? 0 : dy, blink, o) : noPackCanvas(m, o.legs ? 0 : dy, blink, o), x, y: feet - 20, flip }; };
  // Salto: primero sube y luego avanza, para pasar por encima del pie de la cama sin atravesarlo.
  const hop = (k, x0, f0, x1, f1, up) => { const e = up ? Math.min(1, Math.max(0, (k - 0.3) / 0.55)) : Math.min(1, Math.max(0, (k - 0.15) / 0.55)); return [Math.round(x0 + (x1 - x0) * e), Math.round(f0 + (f1 - f0) * k - BP.hop * Math.sin(Math.PI * k))]; };
  f.pack = 'back'; f.blanket = { cover: 0, layer: 'below', lift: 0 }; f.z = false; f.phase = ph;
  const S0 = opt.door ?? BP.start, G0 = opt.door ?? BP.gone; f.fade = 0;
  if (P === 'walkIn') { const k = opt.door != null ? span(400, BT.walkIn) : span(0, BT.walkIn); stand(Math.round(bx + S0 + (BP.door - S0) * k), floor, false, true, k > 0 ? legs : {}); if (opt.door != null) f.fade = Math.max(0, 1 - t / 400); }
  else if (P === 'hang') { const held = t < BT.walkIn + 150; stand(bx + BP.door, floor, false, false, {}, true); f.pack = held ? 'held' : 'post'; f.held = [bx + BP.door + 15, floor - 13]; }
  else if (P === 'hopUp') { const [x, feet] = hop(span(BT.hang, BT.hopUp), bx + BP.door, floor, bx + BP.bedFoot, mat, true); stand(x, feet, false, false); f.pack = 'post'; f.air = true; }
  else if (P === 'walkBed') { stand(Math.round(bx + BP.bedFoot + (BP.bedMid - BP.bedFoot) * span(BT.hopUp, BT.walkBed)), mat, false, false, legs); f.pack = 'post'; }
  else if (P === 'turnL') { stand(bx + BP.bedMid, mat - (t - BT.walkBed < 80 ? 1 : 0), true, false); f.pack = 'post'; f.air = t - BT.walkBed < 80; }
  else if (P === 'turnR') { stand(bx + BP.bedMid, mat - (t - BT.turnL < 80 ? 1 : 0), false, false); f.pack = 'post'; f.air = t - BT.turnL < 80; }
  else {
    f.pack = 'post';
    const curled = (eyes, settle = 0) => { f.mouse = { key: eyes === 'open' ? 'acurrucado (ojos abiertos)' : 'acurrucado', cv: poseCanvas(m, 'A', eyes === 'open' ? { eyes: 'open' } : {}), x: csx, y: csy - settle, flip: false }; };
    if (P === 'curl') curled(t < BT.turnR + 120 ? 'open' : 'sleep', t < BT.turnR + 90 ? 1 : 0);
    else if (P === 'blanketUp') { curled('sleep'); const s = Math.min(3, 1 + Math.floor(span(BT.curl, BT.blanketUp - 300) * 3)); f.blanket = { cover: s / 3, layer: 'above', lift: 0 }; }
    else if (P === 'sleep') { curled('sleep'); f.blanket = { cover: 1, layer: 'above', lift: (t - BT.blanketUp) % 2400 > 1600 ? 1 : 0 }; f.z = true; }
    else if (P === 'wake') { curled(t < BT.sleep + 120 ? 'sleep' : 'open'); f.blanket = { cover: 1, layer: 'above', lift: 0 }; }
    else if (P === 'blanketDown') { curled('open'); const s = Math.min(3, 1 + Math.floor(span(BT.wake, BT.blanketDown - 300) * 3)), c = (3 - s) / 3; f.blanket = { cover: c, layer: c > 0 ? 'above' : 'below', lift: 0 }; }
    else if (P === 'stand') { stand(bx + BP.bedMid, mat - (t - BT.blanketDown < 90 ? 1 : 0), true, false, {}, true); f.air = t - BT.blanketDown < 90; }
    else if (P === 'walkFoot') stand(Math.round(bx + BP.bedMid + (BP.bedFoot - BP.bedMid) * span(BT.stand, BT.walkFoot)), mat, true, false, legs);
    else if (P === 'takePack') { const held = t < BT.walkFoot + 150; stand(bx + BP.bedFoot, mat, true, !held, {}, true); f.pack = held ? 'held' : 'back'; f.held = [bx + BP.bedFoot + 1, mat - 13]; }
    else if (P === 'hopDown') { const [x, feet] = hop(span(BT.takePack, BT.hopDown), bx + BP.bedFoot, mat, bx + BP.out, floor, false); stand(x, feet, true, true); f.pack = 'back'; f.air = true; }
    else if (P === 'walkOut') { const end = opt.door != null ? BT.walkOut - 450 : BT.walkOut, k = span(BT.hopDown, end); stand(Math.round(bx + BP.out + (G0 - BP.out) * k), floor, true, true, k < 1 ? legs : {}); f.pack = 'back'; if (opt.door != null) f.fade = Math.min(1, Math.max(0, (t - end) / 400)); }
    else { f.mouse = null; f.pack = 'back'; }
  }
  f.csx = csx; f.csy = csy; return f;
}
// Manta: doblada a los pies (cover 0) o extendida desde el pie hasta la cara del ratón acurrucado (cover 1), por pasos.
function drawBlanketB(g, bx, by, b, csx, csy, m) {
  const mat = by + 14;
  if (b.cover <= 0) { blanketFolded(g, bx, mat); return; }
  const A = poseCanvas(m, 'A'), T = topsOf(A, false), x1 = Math.round(bx + 5 + (csx + 10 - bx - 5) * b.cover);
  blanket3(g, bx + 5, (x) => Math.min(mat - 2, x >= csx && x - csx < T.length ? csy + T[x - csx] - (b.lift && x >= csx + 2 && x <= csx + 9 ? 1 : 0) : mat - 2), () => x1, mat, 1, () => false, false);
}
function drawMouseB(g, mo) { if (!mo) return; if (mo.flip) { g.save(); g.translate(mo.x + mo.cv.width, mo.y); g.scale(-1, 1); g.drawImage(mo.cv, 0, 0); g.restore(); } else g.drawImage(mo.cv, mo.x, mo.y); }
function drawBedFrame(g, t, m, bx, by, opt = {}) {
  const f = bedFrame(t, m, bx, by, opt), mat = by + 14;
  g.drawImage(bed3(), bx, by); g.drawImage(pillow3(), bx + 30, mat - 5);
  // La mochila cuelga por fuera del pie: delante de la manta; el ratón, cuando está en el suelo, delante de la mochila.
  const onFloor = ['walkIn', 'hang', 'hopUp', 'hopDown', 'walkOut'].includes(PH_NAMES[f.phase][0]);
  if (f.blanket.layer === 'below') drawBlanketB(g, bx, by, f.blanket, f.csx, f.csy, m);
  if (!onFloor) drawMouseB(g, f.mouse);
  if (f.blanket.layer === 'above') drawBlanketB(g, bx, by, f.blanket, f.csx, f.csy, m);
  if (f.pack === 'post') packOnPost(g, bx, by, m);
  if (onFloor) drawMouseB(g, f.mouse);
  if (f.pack === 'held') packHeld(g, f.held[0], f.held[1], m);
  if (f.z) zzz(g, f.csx + 14, f.csy - 3, t);
  return f;
}

// ---------- Comprobación de todo el bucle, fotograma a fotograma (cada 16 ms) ----------
// Pinta por separado el ratón, la manta, el pie y el cabecero, y cuenta: manta encima del ratón sin estar tapándolo; ratón
// encima de la manta mientras lo tapa; cambios de capa con la manta tocando al ratón; ratón dentro del pie o del cabecero;
// ratón en el aire fuera de los saltos y de los saltitos; sprites que no son los aprobados o no van a escala 1; y el mayor
// salto entre dos fotogramas seguidos.
function checkBedLoop(m, bx, by, W, H) {
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingEnabled = false; return [c, x]; };
  const mask = (draw) => { const [c, x] = mk(); draw(x); const d = x.getImageData(0, 0, W, H).data, out = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) out[i] = d[i * 4 + 3] > 127 ? 1 : 0; return out; };
  const and = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] && b[i]) n++; return n; };
  const bedOnly = mask((x) => x.drawImage(bed3(), bx, by)), foot = new Uint8Array(W * H), head = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!bedOnly[i]) continue; if (x <= bx + 4 && y < by + 14) foot[i] = 1; if (x >= bx + 41 && y < by + 14) head[i] = 1; } // la madera del pie y del cabecero, sin su contorno
  const APPROVED = new Set(['oficial', 'oficial sin mochila', 'acurrucado', 'acurrucado (ojos abiertos)']);
  const r = { frames: 0, overBlanketWrong: 0, underBlanketWrong: 0, layerSwitchTouching: 0, footHits: 0, headHits: 0, floating: 0, notApproved: 0, maxJump: 0, maxJumpAt: 0, switches: [] };
  let prev = null, prevLayer = null, prevAnchor = null;
  for (let t = 0; t < BT.end; t += 16) {
    const f = bedFrame(t, m, bx, by); r.frames++;
    if (!f.mouse) { prevAnchor = null; prevLayer = f.blanket.layer; continue; }
    if (!APPROVED.has(f.mouse.key) || !(f.mouse.cv.width === 22 || f.mouse.cv.width === poseCanvas(m, 'A').width)) r.notApproved++;
    const mm = mask((x) => drawMouseB(x, f.mouse)), bm = mask((x) => drawBlanketB(x, bx, by, f.blanket, f.csx, f.csy, m)), ov = and(mm, bm);
    const covering = f.blanket.cover > 0;
    if (f.blanket.layer === 'above' && ov && !covering) r.overBlanketWrong++;
    if (f.blanket.layer === 'below' && ov && covering) r.underBlanketWrong++;
    if (prevLayer && prevLayer !== f.blanket.layer) { r.switches.push(t); if (ov) r.layerSwitchTouching++; }
    prevLayer = f.blanket.layer;
    if (and(mm, foot)) r.footHits++; if (and(mm, head)) r.headHits++;
    // Apoyo: la fila más baja del ratón toca el colchón (o se hunde 1 px, acurrucado) o el suelo, salvo en los saltos.
    let bottom = -1, minx = W, maxx = 0; for (let i = 0; i < mm.length; i++) if (mm[i]) { const y = (i / W) | 0, x = i % W; bottom = Math.max(bottom, y); minx = Math.min(minx, x); maxx = Math.max(maxx, x); }
    const onBed = minx > bx + 4 && maxx < bx + 41, surf = onBed ? by + 14 : by + 22;
    if (!f.air && !(bottom === surf - 1 || bottom === surf)) r.floating++;
    const anchor = [(minx + maxx) / 2, bottom];
    if (prevAnchor) { const j = Math.hypot(anchor[0] - prevAnchor[0], anchor[1] - prevAnchor[1]); if (j > r.maxJump) { r.maxJump = j; r.maxJumpAt = t; } }
    prevAnchor = anchor;
  }
  return r;
}

// ==== b1/b1_surface.js ====
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
  for (const x of [ROOM.x + 4, ROOM.x + 100]) if (x >= x0 && x < x1) { R2(x, ry + 3, 4, 2, P.woo[2]); R2(x + 1, ry + 5, 2, 1, P.woo[3]); }
  R2(x0, F - 10, x1 - x0, 10, P.woo[2]); R2(x0, F - 10, x1 - x0, 1, P.woo[1]); R2(x0, F - 9, x1 - x0, 1, P.woo[3]); for (let x = x0 + 2; x < x1; x += 4) R2(x, F - 8, 1, 8, P.woo[3]);
}
// Puerta de la madriguera en la pared del fondo: arco de madera con su clave (por fuera de x+12 a x+39) y un hueco de 24 px a
// oscuras (de x+14 a x+37), donde cabe el ratón entero. El marco va siempre detrás del ratón: el ratón entra y sale
// fundiéndose con la oscuridad del hueco, nunca pasa por detrás del marco.
const DOOR = { x0: 14, x1: 37 };
function doorHole(g, rx, by, F, col) { g.fillStyle = col; g.fillRect(rx + 14, by + 1, 24, F - by - 1); g.fillRect(rx + 16, by, 20, 1); g.fillRect(rx + 18, by - 1, 16, 1); g.fillRect(rx + 21, by - 2, 10, 1); }
function roomDoor(g, rx, by, F) {
  const P = SPL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  doorHole(g, rx, by, F, '#1a100a');
  R2(rx + 12, by + 1, 2, F - by - 1, P.woo[2]); R2(rx + 12, by + 1, 1, F - by - 1, P.woo[1]); R2(rx + 38, by + 1, 2, F - by - 1, P.woo[2]); R2(rx + 39, by + 1, 1, F - by - 1, P.woo[3]);
  R2(rx + 14, by, 2, 1, P.woo[2]); R2(rx + 36, by, 2, 1, P.woo[2]); R2(rx + 16, by - 1, 2, 1, P.woo[2]); R2(rx + 34, by - 1, 2, 1, P.woo[2]); R2(rx + 18, by - 2, 3, 1, P.woo[2]); R2(rx + 31, by - 2, 3, 1, P.woo[2]); R2(rx + 21, by - 3, 10, 1, P.woo[1]);
  R2(rx + 24, by - 5, 4, 3, P.woo[1]); R2(rx + 25, by - 5, 2, 1, P.woo[0]);
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
  roomWall(g, rx, rx + rw);
  const F = BED1.by + 22, bx = BED1.bx, by = BED1.by;
  roomDoor(g, rx, by, F);
  // Suelo de tablas y alfombra roja con remates dorados delante de la cama.
  R2(rx, F, rw, ry + rh - F, P.woo[3]); R2(rx, F, rw, 1, P.woo[1]); for (let x = rx + 3; x < rx + rw; x += 7) R2(x, F + 1, 1, ry + rh - F - 1, P.woo[4]);
  R2(rx + 40, F, 22, 2, P.red[2]); R2(rx + 40, F, 22, 1, P.red[1]); for (let x = rx + 42; x < rx + 60; x += 4) R2(x, F + 1, 2, 1, P.red[3]); R2(rx + 39, F, 1, 2, P.gld[2]); R2(rx + 62, F, 1, 2, P.gld[2]);
  // Cuadro con una cuña de queso, entre la puerta y la cama.
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
  if (!hs) {} else if (hs === 1) { const cv = houseStage(1); put(cv, SPOS.house + 22, GH1 + 2); vfxSmoke(g, SPOS.house + 22 + 47, GH1 + 2 - 58 + 6, now); }
  else { const cv = houseV3(hs), x = SPOS.house + (hs >= 3 ? 0 : 24); put(cv, x, GH1 + 2); vfxSmoke(g, SPOS.house + 24 + 57, GH1 + 2 - 76 + 10, now); }
  g.drawImage(bush(1).canvas(), 112, GH1 - 7);
  // LAB (a su izquierda queda el hueco reservado de FORBIDDEN GENETICS).
  if (ls) { const lab = labV2(ls); put(lab, SPOS.lab, GL1); if (o.labBusy !== false) vfxBubbles(g, SPOS.lab + 26, GL1 - 30, now); }
  const blink = Math.floor(now / 700) % 2; if (ls) g.fillStyle = blink ? '#ff6a5a' : '#7a2a24'; if (ls) g.fillRect(SPOS.lab + 20, GL1 - 79, 1, 1);
  g.drawImage(signPost2(), 230, GL1 - 17);
  // SHOP con el tendero detrás del mostrador y los lotes encima.
  const sx = SPOS.shop, sy = GR1 - SHOP_H + 1; if (o.shopBuilt !== false) { groundShadow(g, sx, GR1, 58);
  g.drawImage(shopBack(ts), sx, sy); shopFlag(g, sx + 4, sy + 1, ts, now);
  if (o.keeper !== null) { const m = o.keeper || CREW.town.keeper, cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, (now + m.name.length * 997) % 3300 < 110, {}); g.drawImage(cv, sx + 19, sy + 48 - 20); } // de pie tras el mostrador: asoman sombrero, cara y hombros
  g.drawImage(shopFront(ts), sx, sy); shopLots(g, sx, sy, o.lots ?? 3);
  if (ts >= 3) vfxGlow(g, sx + 55, sy + 28, 8, now); }
  put(pantrySprite2(), SPOS.pantry, GR1 + 1);
  // Castillete con su polea (gira solo con el montacargas en marcha).
  put(headframe2(), SPOS.head, GR1 + 1); g.drawImage(pulleySprite(o.lift ? Math.floor(now / 120) % 3 : 0), SPOS.head + 9, GR1 + 1 - 74 + 8);
  g.drawImage(bush(0).canvas(), 384, GR1 - 7); g.drawImage(fence(3).canvas(), 96, GH1 - 8); g.drawImage(bench().canvas(), 196, GL1 - 8); g.drawImage(lampPost().canvas(), 214, GL1 - 23); vfxGlow(g, 217, GL1 - 20, 9, now);
  // El investigador en la puerta del laboratorio (pose aprobada del libro).
  if (o.sci !== null && ls) { const m = o.sci || CREW.town.sci, cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, false, { book: Math.floor(now / 900) % 2 ? 2 : 1 }); g.save(); g.translate(SPOS.lab + 10 + 22, GL1 - 20); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); }
  // Madriguera: la cama y su secuencia aprobada; la pared de la izquierda tapa la boca del túnel por delante.
  if (o.sleeper !== null) {
    // La puerta: el ratón aparece en su hueco y se va por él fundiéndose con la oscuridad (solo se oscurece el hueco).
    const fr = drawBedFrame(g, now % BT.end, o.sleeper || CREW.town.idle, BED1.bx, BED1.by, { door: ROOM.x + DOOR.x0 - BED1.bx });
    if (fr.fade > 0) { g.globalAlpha = fr.fade; doorHole(g, ROOM.x, BED1.by, BED1.by + 22, '#1a100a'); g.globalAlpha = 1; }
    vfxGlow(g, ROOM.x + 64, ROOM.y + 11, 11, now, '#ffd890');
  }
}

// ==== b2/b2_cheddar.js ====
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
  if (BUILT.refinery) { const R2 = B2.ref, cap = R2.boost >= 2 ? 5 : R2.boost ? 4 : 3; drawRefineB(ctx, o - 20, TL - 42, R2.stage, 0, true, now, { k: prog(Z41.refJob), bars: Math.min(cap, V.tray), run: refining(), steam: true }); refineSceneBoost(ctx, o - 20, TL - 42, now, R2.boost, R2.on, refining()); if (refining() && now % 700 < 30) spark(o + 1, t + 9, 'smoke'); }
  // Elevador: los cangilones solo se mueven cuando llevan Raw (tras un ciclo de perforadora).
  if (BUILT.refinery) { const busy = V.tokens.some((k) => k.kind === 'raw' && now >= k.t0 && now - k.t0 < k.ms); V.elev = (V.elev || 0) + (busy ? 1 : 0); for (let k = 0; k < 5; k++) { const y = Math.round(DK + 2 - ((V.elev / 2.5 + k * 9) % (DK - t - 12))); R(o + 44, y, 5, 3, INK4); R(o + 45, y, 3, 2, MAT.iron[2]); }
  ctx.drawImage(artWheel(Math.floor(V.elev / 6) % 3), o + 41, t + 8); }
  // DRILL: pórtico, máquina, volante (gira solo con un ciclo en marcha), cuadro con su piloto (verde: trabaja; ámbar: veta sin
  // ciclo; rojo intermitente: sin veta) y la barra, abajo solo mientras hay veta.
  if (BUILT.drill) ctx.drawImage(artGantry(52), o + 48, DK);
  const run = running(), jit = run && Math.floor(now / 60) % 2 ? 1 : 0;
  V.ext = Math.max(0, Math.min(1, V.ext + (Z41.veinRevealed ? 1 : -1) * Math.min(64, now - (V.extT || now)) / 700)); V.extT = now;
  const sx = o + 73, rest = DK + 18, tipY = Math.round(rest + (rb - 22 - rest) * (V.ext * V.ext * (3 - 2 * V.ext)));
  if (run) V.fly += (now - V.flyT < 300 ? 2.4 : 1) * 0.06; if (BUILT.drill) { ctx.drawImage(artDrill(), o + 58, DK - 29 + jit); R(o + 72, DK - 34 + jit, 1, 6, INK4); ctx.drawImage(artWheel(Math.floor(V.fly) % 3), o + 66, DK - 44 + jit); ctx.drawImage(artPanel(), o + 98, DK - 12); }
  if (run && now % 600 < 20) spark(o + 82, DK - 30, 'smoke');
  if (BUILT.drill) R(o + 100, DK - 8, 2, 2, run ? '#62d36e' : Z41.veinRevealed ? '#ffb347' : now % 900 < 450 ? '#ff5a3c' : '#5a1a10');
  if (BUILT.drill) { const a = run ? -2.2 + prog(Z41.drillJob) * 2.6 : 1.4; R(o + 102 + Math.round(Math.cos(a) * 1.5), DK - 4 + Math.round(Math.sin(a) * 1.5), 1, 1, INK4); }
  if (BUILT.drill) drillModules(ctx, o + 48, DK - 44, now, run, jit);
  // CHEESE: taller sin toldo (el toldo es de la tienda): alero de tablas, rótulo con la cuña, baldas de curado, cuba con su
  // paleta, prensa de husillo (se mueve con cada hornada) y moldes.
  if (BUILT.cheesery) cheeseB2(ctx, o + 96, TR - 39, now);
  for (let i = 0; i < Math.min(3, LIFT.queue); i++) wheelTok(o + 130 - (i % 2) * 3, TR + 1 - Math.floor(i / 2) * 3);
  // El andamio del jugador y la roca.
  scaffold(g); mineBoost(ctx, g, now);
  ctx.globalAlpha = 0.45; R(rx + 6, rb, 44, 2, '#000'); R(rx + 10, rb + 2, 36, 1, '#000'); ctx.globalAlpha = 1;
  const j = V.jolt && now - V.jolt.t0 < 90 ? (now - V.jolt.t0 < 45 ? V.jolt.d : [-V.jolt.d[0], 0]) : [0, 0];
  const src = rockSrc(); sprite(src, 54, 0, rx + j[0], rb - 40 + j[1], 54, 42);
  if (V.flash && now - V.flash < 60) { const w = whiteOf4(src); if (w) { ctx.globalAlpha = 0.55; ctx.drawImage(w, rx + j[0], rb - 40 + j[1]); ctx.globalAlpha = 1; } }
  if (Z41.veinRevealed && Math.floor(now / 260) % 4 === 0) R(rx + 20 + Math.floor(hash4(Math.floor(now / 260), 1) * 14), rb - 18 + Math.floor(hash4(Math.floor(now / 260), 2) * 6), 1, 1, '#fff6b0');
  // La barra baja por delante de la roca hasta la veta y gira solo durante el ciclo.
  if (BUILT.drill) { R(sx - 2, DK + 4, 5, tipY - DK - 4, INK4); R(sx - 1, DK + 4, 3, tipY - DK - 4, MAT.steel[2]); R(sx - 1, DK + 4, 1, tipY - DK - 4, MAT.steel[3]);
  for (let y = DK + 5 + (run ? Math.floor(now / 50) % 4 : 0); y < tipY - 1; y += 4) R(sx - 1, y, 3, 1, MAT.steel[1]);
  ctx.drawImage(artBit(run ? Math.floor(now / 70) % 2 : 0), sx - 4, tipY - 2);
  drillBarBoost(ctx, sx, DK, tipY, now, run); }
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

// ==== b3/b3_gouda.js ====
// ---------- BLOQUE 3 · GOUDA (producción, 21-10-2026) ----------
// Gouda reutiliza el capítulo de Cheddar entero (composición, máquinas aprobadas con sus fases y refuerzos, ratones y pico) y
// cambia lo que le da identidad:
// · la roca: los estados aprobados de Gouda (big_gouda_c0–c4 y v1–v5), del mismo generador que los de Cheddar;
// · la cueva: de tierra marrón a piedra gris, con el entibado de latón (la paleta TH.gouda que ya tiene el juego);
// · la cuadrilla: los ratones de Gouda (CREW.gouda);
// · el cartel de profundidad: el de latón, que ya existe para Gouda;
// · los quesos curados de la quesería: cera roja, la del Gouda.
// La simulación es la misma (la de Cheddar): sirve para ver el capítulo en marcha, no para medir nada.
const GOUDA_GREY = [[0.10, '#1e2328'], [0.13, '#2a3036'], [0.17, '#343b42'], [0.21, '#40464e'], [0.25, '#4e565e'], [0.29, '#5a626c'], [0.35, '#666e78'], [0.42, '#6a747e'], [9, '#77818c']];
const GOUDA_BRASS = [[0.30, '#6a5220'], [0.45, '#b08a3a'], [9, '#d0aa5a']];
const GOUDA_WAX = { '#4a2806': '#4a1210', '#8a5410': '#7e2018', '#c88a20': '#b8341f', '#e8b040': '#e8523a', '#ffe08a': '#ffa08c' };
function hslOf(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn); let h = 0; if (mx !== mn) { h = mx === r ? (g - b) / (mx - mn) + (g < b ? 6 : 0) : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h *= 60; } return [h, s, l]; }
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// Cueva de Cheddar → Gouda: los marrones de tierra y roca pasan a la escala de piedra gris por su luz; la madera (marrones
// más saturados) pasa a latón. La tinta, los quesos de las vetas, el hierro y las luces no se tocan.
function recolorGouda(c) {
  const g = c.getContext('2d'), im2 = g.getImageData(0, 0, c.width, c.height), d = im2.data, memo = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    if (!(k in memo)) { const [h, s, l] = hslOf(d[i], d[i + 1], d[i + 2]); let out = null; if (h >= 15 && h <= 40 && s > 0.2) out = (s >= 0.47 || (l >= 0.45 && s >= 0.45) ? GOUDA_BRASS : GOUDA_GREY).find(([t]) => l <= t)[1]; memo[k] = out ? hexRGB(out) : null; }
    const o = memo[k]; if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
  }
  g.putImageData(im2, 0, 0); return c;
}
function recolorMap(src, map) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); const im2 = g.getImageData(0, 0, c.width, c.height), d = im2.data, M = {}; for (const [a, b] of Object.entries(map)) M[hexRGB(a).join()] = hexRGB(b); for (let i = 0; i < d.length; i += 4) { const o = M[d[i] + ',' + d[i + 1] + ',' + d[i + 2]]; if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; } } g.putImageData(im2, 0, 0); return c; }
const GOUDA_ROCK = { c: [0, 1, 2, 3, 4].map((i) => `out/sprites/big_gouda_c${i}.png`), v: [1, 2, 3, 4, 5].map((i) => `out/sprites/big_gouda_v${i}.png`) };
[...GOUDA_ROCK.c, ...GOUDA_ROCK.v].forEach(im);
// El fondo de Gouda: el de Cheddar pintado con la profundidad de Gouda (su corta es menos honda) y pasado a piedra y latón.
const goudaBG = (st) => art('goudaBG' + SC.ox + ':' + tierOf(DEP.gouda), () => { const c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.translate(0, -st.top); const was = ctx; ctx = g; try { paintCheddar(st); } finally { ctx = was; } return recolorGouda(c); });
const cheeseStaticCheddar = cheeseStatic;
const cheeseStaticGouda = (s, b, o) => art(`gchz${s}${b}${o}`, () => recolorMap(cheeseStaticCheddar(s, b, o), GOUDA_WAX));
// Pinta el capítulo de Gouda: cambia lo que da identidad, pinta con el mismo drawCheddar y lo deja todo como estaba.
function renderGouda(now, cvs) {
  const keep = { c: ROCKC.slice(), v: ROCKV.slice(), dep: DEP.cheddar, th: TH.cheddar, baked, cheese: cheeseStatic, m: {} };
  for (const w of Object.keys(BR)) { keep.m[w] = BR[w].m; if (CREW.gouda[w]) BR[w].m = CREW.gouda[w]; }
  GOUDA_ROCK.c.forEach((p, i) => (ROCKC[i] = p)); GOUDA_ROCK.v.forEach((p, i) => (ROCKV[i] = p));
  DEP.cheddar = DEP.gouda; TH.cheddar = TH.gouda; cheeseStatic = cheeseStaticGouda;
  baked = (st) => { ctx.drawImage(goudaBG(st), 0, st.top); };
  try { renderStopTo(1, now, cvs); } finally {
    keep.c.forEach((p, i) => (ROCKC[i] = p)); keep.v.forEach((p, i) => (ROCKV[i] = p));
    DEP.cheddar = keep.dep; TH.cheddar = keep.th; baked = keep.baked; cheeseStatic = keep.cheese;
    for (const w of Object.keys(keep.m)) BR[w].m = keep.m[w];
  }
  return cvs;
}

// ==== b4/b4_brie.js ====
// ---------- BLOQUE 4 · BRIE (producción, 21-10-2026) ----------
// El mismo método que Gouda: el capítulo común (composición, máquinas aprobadas con fases y refuerzos, ratones y pico) con la
// identidad de Brie. Brie es un queso de cueva de caliza, de corteza blanca enmohecida:
// · la roca: los estados aprobados de Brie (big_brie_c0–c4 y v1–v5), del mismo generador;
// · la cueva: caliza cálida en tono medio (la roca blanca destaca), con el entibado de roble oscuro (contrasta con el gris de Gouda y el marrón de Cheddar);
// · el cartel de profundidad: de cobre;
// · los quesos curados de la quesería: la corteza blanca del Brie;
// · la cuadrilla: Fondue (minero) y Pip (quesero) salen de los datos del prototipo de MICE; el refinador y el perforador son
//   nuevos (en esos datos el puesto de refinador de Brie está vacío y su perforador es Roque, que ya trabaja en Gouda).
// Dos tonos por debajo de la caliza clara: la roca de Brie es blanca y con la caliza clara se fundía con la pared.
const BRIE_STONE = [[0.10, '#221e19'], [0.13, '#2e2a23'], [0.17, '#3c372e'], [0.21, '#4c463b'], [0.25, '#5c5548'], [0.29, '#6c6455'], [0.35, '#7c7362'], [0.42, '#8c826f'], [9, '#9c917c']];
const BRIE_OAK = [[0.30, '#2e1c12'], [0.45, '#4e3220'], [9, '#704a30']];
const BRIE_RIND = { '#4a2806': '#6e5c48', '#8a5410': '#ac9672', '#c88a20': '#dcca9e', '#e8b040': '#f6ecd0', '#ffe08a': '#fffdf2' };
const CREW_BRIE = { miner: { name: 'Fondue', lv: 30, rank: 2, rar: 0, skill: 'mining' }, driller: { name: 'Comte', lv: 44, rank: 1, rar: 0, skill: 'drilling' }, refiner: { name: 'Brioche', lv: 38, rank: 1, rar: 1, skill: 'refining' }, cook: { name: 'Pip', lv: 52, rank: 3, rar: 0, skill: 'cheesemaking' } };
const TH_BRIE = Object.assign({}, TH.gouda, { metal: '#b8693a', metalL: '#e8a070', metalD: '#5e2e14' });
const DEP_BRIE = 9;
const BRIE_ROCK = { c: [0, 1, 2, 3, 4].map((i) => `out/sprites/big_brie_c${i}.png`), v: [1, 2, 3, 4, 5].map((i) => `out/sprites/big_brie_v${i}.png`) };
[...BRIE_ROCK.c, ...BRIE_ROCK.v].forEach(im);
// La misma conversión que Gouda, con la caliza y el roble: la tierra pasa a caliza por su luz, la madera a roble oscuro.
function recolorBrie(c) {
  const g = c.getContext('2d'), im2 = g.getImageData(0, 0, c.width, c.height), d = im2.data, memo = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    if (!(k in memo)) { const [h, s, l] = hslOf(d[i], d[i + 1], d[i + 2]); let out = null; if (h >= 15 && h <= 40 && s > 0.2) out = (s >= 0.47 || (l >= 0.45 && s >= 0.45) ? BRIE_OAK : BRIE_STONE).find(([t]) => l <= t)[1]; memo[k] = out ? hexRGB(out) : null; }
    const o = memo[k]; if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
  }
  g.putImageData(im2, 0, 0); return c;
}
const brieBG = (st) => art('brieBG' + SC.ox + ':' + tierOf(DEP.brie ?? DEP_BRIE), () => { const keep = DEP.cheddar; DEP.cheddar = DEP.brie ?? DEP_BRIE; const c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.translate(0, -st.top); const was = ctx; ctx = g; try { paintCheddar(st); } finally { ctx = was; DEP.cheddar = keep; } return recolorBrie(c); });
const cheeseStaticBrie = (s, b, o) => art(`bchz${s}${b}${o}`, () => recolorMap(cheeseStaticCheddar(s, b, o), BRIE_RIND));
function renderBrie(now, cvs) {
  const keep = { c: ROCKC.slice(), v: ROCKV.slice(), dep: DEP.cheddar, th: TH.cheddar, baked, cheese: cheeseStatic, m: {} };
  for (const w of Object.keys(BR)) { keep.m[w] = BR[w].m; if (CREW_BRIE[w]) BR[w].m = CREW_BRIE[w]; }
  BRIE_ROCK.c.forEach((p, i) => (ROCKC[i] = p)); BRIE_ROCK.v.forEach((p, i) => (ROCKV[i] = p));
  DEP.cheddar = DEP.brie ?? DEP_BRIE; TH.cheddar = TH_BRIE; cheeseStatic = cheeseStaticBrie;
  baked = (st) => { ctx.drawImage(brieBG(st), 0, st.top); };
  try { renderStopTo(1, now, cvs); } finally {
    keep.c.forEach((p, i) => (ROCKC[i] = p)); keep.v.forEach((p, i) => (ROCKV[i] = p));
    DEP.cheddar = keep.dep; TH.cheddar = keep.th; baked = keep.baked; cheeseStatic = keep.cheese;
    for (const w of Object.keys(keep.m)) BR[w].m = keep.m[w];
  }
  return cvs;
}

// ==== b5/b5_shared.js ====
// ---------- BLOQUE 5 · SISTEMAS COMPARTIDOS (producción, 21-10-2026) ----------
// 1 · La columna vertical del MVP: superficie, Cheddar, Gouda y Brie, una debajo de otra, unidas por un solo pozo. El capítulo
//     (161 px) se coloca bajo el mercado del pueblo, desde x = 254: así el centro de la polea del castillete (x 409,5 del
//     pueblo) cae justo entre los dos cables del pozo de cada capítulo (x 152 y 159, centro 155,5).
// 2 · El montacargas: una sola jaula para todo el pozo. Baja hasta Brie y sube recogiendo en el rellano de cada quesería la
//     rueda de su queso (blanca en Brie, de cera roja en Gouda, ámbar en Cheddar); arriba la descarga y las ruedas entran en
//     la despensa. La polea del castillete gira solo mientras la jaula se mueve.
// 3 · Bocadillos y placas en pixel art, en 9 cortes, para la interfaz del juego (la dirección aprobada de la revisión de arte).
const STACK = { x0: 254, w: Math.ceil(SC.worldW), surfH: SH1, chH: STOPS[1].h };
STACK.y = { surface: 0, cheddar: STACK.surfH, gouda: STACK.surfH + STACK.chH, brie: STACK.surfH + 2 * STACK.chH };
STACK.h = STACK.surfH + 3 * STACK.chH;
// Dónde para la jaula: el suelo del mercado arriba; en cada capítulo, el rellano de la quesería (TR + 2 en su sistema).
const LANDING = { surface: GR1 + 1, cheddar: STACK.y.cheddar + 62, gouda: STACK.y.gouda + 62, brie: STACK.y.brie + 62 };
const CAGE_X = 150; // como en V4.1 (o + 133 con o = 17)
const WHEEL_COL = { cheddar: ['#c97a08', '#f5ab12', '#ffd84a'], gouda: ['#7e2018', '#e8523a', '#ffd84a'], brie: ['#ac9672', '#f6ecd0', '#fffdf2'] };
// Guion del montacargas (ms): baja a Brie, sube parando en Gouda y Cheddar, descarga arriba y vuelve a empezar.
const LIFT_T = [['down', 'surface', 'brie', 2600], ['load', 'brie', 'brie', 1100], ['up', 'brie', 'gouda', 1000], ['load', 'gouda', 'gouda', 1100], ['up', 'gouda', 'cheddar', 1000], ['load', 'cheddar', 'cheddar', 1100], ['up', 'cheddar', 'surface', 1300], ['unload', 'surface', 'surface', 1500]];
const LIFT_LOOP = LIFT_T.reduce((s, x) => s + x[3], 0);
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
function liftAt(t) {
  t %= LIFT_LOOP; let acc = 0, cargo = [];
  for (let i = 0; i < LIFT_T.length; i++) {
    const [kind, a, b, ms] = LIFT_T[i];
    if (t < acc + ms) {
      const k = (t - acc) / ms, y = kind === 'up' || kind === 'down' ? LANDING[a] + (LANDING[b] - LANDING[a]) * ease(k) : LANDING[a];
      if (kind === 'load' && k > 0.45) cargo.push(a); if (kind === 'unload') cargo = k < 0.3 ? ['brie', 'gouda', 'cheddar'] : k < 0.55 ? ['gouda', 'cheddar'] : k < 0.8 ? ['cheddar'] : [];
      return { kind, at: a, to: b, k, y: Math.round(y), cargo, moving: kind === 'up' || kind === 'down', loading: kind === 'load' ? a : null, waiting: ['brie', 'gouda', 'cheddar'].filter((z) => !cargo.includes(z) && kind !== 'unload' && !(kind === 'down')) };
    }
    if (kind === 'load') cargo.push(a);
    acc += ms;
  }
}
// La jaula (12 × 15): marco de hierro, techo con su argolla, suelo de tablas y barrotes delante; el farol va en el techo.
const cageBack = () => art('cageB', () => { const c = PB(12, 15), P = PAL; c.rect(0, 2, 12, 13, P.irn[3]); c.rect(1, 3, 10, 11, '#24222c'); c.rect(0, 2, 12, 2, P.irn[2]); c.hline(0, 2, 12, P.irn[1]); c.rect(1, 12, 10, 3, P.woo[2]); c.hline(1, 12, 10, P.woo[1]); c.rect(5, 0, 2, 2, P.irn[2]); c.outline(); return c.canvas(); });
const cageFront = () => art('cageF', () => { const c = PB(12, 15), P = PAL; for (const x of [0, 3, 6, 9, 11]) c.vline(x, 4, 8, x === 0 ? P.irn[1] : P.irn[2]); c.hline(0, 7, 12, P.irn[3]); return c.canvas(); });
function wheelSmall(g, x, y, zone) { const [d, m, l] = WHEEL_COL[zone]; g.fillStyle = INK; g.fillRect(x - 1, y, 6, 3); g.fillRect(x, y - 1, 4, 5); g.fillStyle = m; g.fillRect(x, y, 4, 3); g.fillStyle = l; g.fillRect(x, y, 4, 1); g.fillStyle = d; g.fillRect(x, y + 2, 4, 1); }
// Pinta la jaula, su cable, las ruedas que esperan en cada rellano y las que entran en la despensa. (g ya en coordenadas de la
// columna; la superficie empieza en x = 0 de la columna, que es x = 254 del pueblo.)
function drawLift5(g, t) {
  const L = liftAt(t), x = CAGE_X, y = L.y - 15;
  // Las ruedas que esperan en cada rellano las pinta el capítulo (la cola de V4.1, por detrás de los ratones); aquí solo el
  // último saltito de la rueda al entrar en la jaula, desde su borde, para no pasar por delante del quesero.
  if (L.loading) { const k = Math.min(1, L.k / 0.45); if (k < 1) wheelSmall(g, Math.round(x - 1 + k * 4), LANDING[L.loading] - 3 - Math.round(Math.sin(k * Math.PI) * 3), L.loading); }
  // Cable desde la polea del castillete hasta la argolla de la jaula.
  g.fillStyle = '#c8c2d4'; g.fillRect(x + 5, 46, 1, Math.max(0, y - 46)); g.fillStyle = '#8a8496'; g.fillRect(x + 6, 46, 1, Math.max(0, y - 46));
  g.drawImage(cageBack(), x, y);
  L.cargo.forEach((z, i) => wheelSmall(g, x + 2 + (i % 2) * 4, y + 9 - Math.floor(i / 2) * 3, z));
  g.drawImage(cageFront(), x, y);
  g.fillStyle = L.moving && Math.floor(t / 250) % 2 ? '#ffcf2e' : '#a86a10'; g.fillRect(x + 5, y + 1, 2, 1); if (L.moving) vfxGlow(g, x + 6, y + 1, 4, t, '#ffd860');
  // Descarga: las ruedas saltan del montacargas a la puerta de la despensa (x 102 de la columna).
  if (L.kind === 'unload') for (const [z, a] of [['brie', 0], ['gouda', 0.25], ['cheddar', 0.5]]) { const k = (L.k - a) / 0.3; if (k > 0 && k < 1) wheelSmall(g, Math.round(x - 2 - k * 46), LANDING.surface - 4 - Math.round(Math.sin(k * Math.PI) * 8), z); }
  return L;
}
// La columna entera en un lienzo (STACK.w × STACK.h): la superficie recortada desde x = 254, los tres capítulos y el montacargas.
const surfBG = () => art('stackSurfBG', () => { const c = document.createElement('canvas'); c.width = SW1; c.height = SH1; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintSurface(g); return c; });
function drawStack(g, now, cv3) {
  const surf = cv3.surf; { const sg = surf.getContext('2d'); sg.imageSmoothingEnabled = false; sg.drawImage(surfBG(), 0, 0); const L = liftAt(now); drawSurface(sg, now, { lift: L.moving }); }
  g.drawImage(surf, STACK.x0, 0, STACK.w, STACK.surfH, 0, 0, STACK.w, STACK.surfH);
  renderStopTo(1, now, cv3.ched); g.drawImage(cv3.ched, 0, STACK.y.cheddar);
  renderGouda(now, cv3.gouda); g.drawImage(cv3.gouda, 0, STACK.y.gouda);
  renderBrie(now, cv3.brie); g.drawImage(cv3.brie, 0, STACK.y.brie);
  return drawLift5(g, now);
}

// ================= BOCADILLOS Y PLACAS (9 cortes) =================
// Bocadillo: crema con 1 px de tinta y esquinas de 2 px recortadas, una sombra clara dentro abajo; la punta va aparte (abajo o
// a un lado). Placa de máquina: chapa ámbar remachada, colgada de una cadena; la roja es para «parada». Insignia: el estado
// pequeño sobre un puesto (aviso ámbar, parado rojo, listo verde). Todo a 1:1; el juego los estira con border-image.
const BUBC = { bg: '#fffdf2', shade: '#e2d4ac' };
const bubble9 = () => art('bub9', () => { const c = PB(9, 9); c.rect(1, 1, 7, 7, BUBC.bg); c.rect(2, 0, 5, 1, BUBC.bg); c.rect(2, 8, 5, 1, BUBC.bg); c.rect(0, 2, 1, 5, BUBC.bg); c.rect(8, 2, 1, 5, BUBC.bg); c.hline(1, 7, 7, BUBC.shade); c.outline(); return c.canvas(); });
const bubbleTail = () => art('bubT', () => { const c = PB(7, 6); c.rect(0, 0, 7, 1, BUBC.bg); c.rect(1, 1, 5, 1, BUBC.bg); c.rect(2, 2, 3, 1, BUBC.bg); c.px(3, 3, BUBC.bg); c.outline(); return c.canvas(); });
const plate9 = (red) => art('plate9' + red, () => { const c = PB(11, 11), M = red ? ['#ffb0a0', '#e8523a', '#b8341f', '#7e2018', '#4a1210'] : PNT; c.rect(0, 0, 11, 11, M[2]); c.hline(0, 0, 11, M[1]); c.vline(0, 0, 11, M[1]); c.hline(0, 10, 11, M[3]); c.vline(10, 0, 11, M[3]); for (const [x, y] of [[2, 2], [8, 2], [2, 8], [8, 8]]) { c.px(x, y, M[0]); c.px(x + 1, y + 1, M[4]); } c.outline(); return c.canvas(); });
const chainSprite = () => art('chain', () => { const c = PB(3, 8); for (let y = 0; y < 8; y += 3) { c.px(1, y, PAL.irn[1]); c.px(0, y + 1, PAL.irn[2]); c.px(2, y + 1, PAL.irn[2]); c.px(1, y + 2, PAL.irn[3]); } return c.canvas(); });
const badge = (kind) => art('badge' + kind, () => { const c = PB(9, 9), M = { warn: PNT, stop: ['#ffb0a0', '#e8523a', '#b8341f', '#7e2018', '#4a1210'], ok: ['#c8f0b0', '#62d36e', '#3aa048', '#26702e', '#164a1a'] }[kind]; c.ell(4.5, 4.5, 4.2, 4.2, (x, y) => (x + y < 7 ? M[0] : x + y < 10 ? M[1] : M[2])); if (kind === 'warn') { c.vline(4, 2, 3, M[4]); c.px(4, 6, M[4]); } else if (kind === 'stop') { c.rect(3, 3, 3, 3, '#fffdf2'); } else { c.px(2, 4, '#fffdf2').px(3, 5, '#fffdf2').px(4, 6, '#fffdf2').px(5, 5, '#fffdf2').px(6, 4, '#fffdf2').px(7, 3, '#fffdf2'); } c.outline(); return c.canvas(); });

// ==== b5/b5_ui.js ====
// ---------- BLOQUE 5 · BOCADILLOS, PLACAS E INSIGNIAS: la dirección validada y su colocación (21-10-2026) ----------
// Vuelve a lo aprobado en la revisión de arte (main2-ad): el bocadillo .ad-bub (crema, 2 px de tinta, esquinas recortadas,
// letra Press Start 2P y la punta escalonada TAILSVG) y la placa .ad-warn (chapa oscura con borde ámbar, el icono del recurso
// aprobado y la cadena hasta la máquina). La versión roja de la placa usa los colores del aviso rojo del juego. Las insignias
// son los iconos de aviso que el juego ya usa y están aprobados (icons.js: alert, alertr y done), a 1:1 o ×2.
// Reglas de colocación (una capa por escena, recalculada en cada fotograma):
// 1 · Jerarquía: placa roja (máquina parada) > bocadillo > placa ámbar (aviso de máquina). Lo crítico va siempre; después, lo
//     que dura poco (un ratón hablando, unos segundos) antes que lo que dura mucho (un aviso, que mientras tanto puede quedarse
//     en insignia y vuelve a su placa en cuanto hay sitio). Lo de más prioridad se coloca primero; lo demás se adapta.
// 2 · Cada pieza prueba sus posiciones en orden (la placa: encima de la máquina con la cadena más o menos larga y corrida a
//     los lados sin dejar de colgar de su punto; el bocadillo: encima de la cabeza, corrido, o a un lado) y se queda con la
//     primera que no pisa nada ni se sale de la vista. Si la que tenía sigue valiendo, no cambia (no salta de un sitio a otro).
// 3 · Límites: un bocadillo a la vez (los demás esperan su turno) y como mucho 3 placas con texto; las demás, y las que no
//     caben, pasan a placa pequeña (la misma placa con solo su icono). Si tampoco cabe, no se pinta (el aviso sigue activo).
// 4 · Ninguna placa tapa a un ratón, y ningún bocadillo tapa a otro ratón que no sea el que habla.
// 5 · Si un bocadillo no cabe con su ancho, se estrecha (más líneas) antes de rendirse.
// 6 · El bocadillo va anclado al ratón que habla: sigue su cabeza en cada fotograma y su punta lo señala. Si el ratón sale de
//     la vista o no hay sitio durante más de 0,4 s, el bocadillo se cierra; nunca se queda flotando.
const GAME_ICON = {
  alert: [['......K......', '.....KLK.....', '.....KYK.....', '....KYYYK....', '....KYKYK....', '...KYYKYYK...', '...KYYKYYK...', '..KYYYKYYYK..', '..KYYYYYYYK..', '.KYYYYKYYYYK.', '.KDDDDDDDDDK.', 'KKKKKKKKKKKKK'], { Y: '#ffd43a', L: '#fff3a0', D: '#d9a514', K: '#1b1622' }],
  alertr: [['......K......', '.....KLK.....', '.....KYK.....', '....KYYYK....', '....KYKYK....', '...KYYKYYK...', '...KYYKYYK...', '..KYYYKYYYK..', '..KYYYYYYYK..', '.KYYYYKYYYYK.', '.KDDDDDDDDDK.', 'KKKKKKKKKKKKK'], { Y: '#ff5a7a', L: '#ffc2cc', D: '#c43a58', K: '#1b1622' }],
  done: [['.......KK', '......KGK', 'K....KGK.', 'KGK.KGK..', '.KGKGK...', '..KGK....', '...K.....'], { G: '#3fa860', K: '#1b1622' }],
};
// Icono de máquina parada (Pulido+): octógono rojo de 9 × 9 con contorno de tinta, luz arriba a la izquierda, sombra abajo a
// la derecha, un brillo en la esquina y la barra blanca de «parar» con su sombra debajo. Se pinta a ×2 exacto (18 px), nunca a una escala que no sea entera.
GAME_ICON.stop = [['..KKKKK..', '.KHLLLRK.', 'KLLRRRRDK', 'KLWWWWWDK', 'KLWWWWWDK', 'KRSSSSSDK', 'KRRRRRDDK', '.KRDDDDK.', '..KKKKK..'], { K: '#1b1622', H: '#ffd0da', L: '#ff8aa0', R: '#e8364e', D: '#9e1c32', S: '#b82640', W: '#fff4f4' }];
// Aviso (Pulido+): el triángulo de 13 × 12 del juego con volumen. Luz en la punta y el lado izquierdo, sombra en el derecho y
// una franja de sombra en la base; la exclamación en la parte ancha, en un tono oscuro del propio material (no en tinta), con su punto aparte.
// La versión roja (alertr, roca parada) es el mismo dibujo con la paleta del icono de parada y el signo en blanco.
const ALERT_ROWS = ['......K......', '.....KHK.....', '.....KLK.....', '....KLYDK....', '....KLYDK....', '...KLYGYDK...', '...KLYGYDK...', '..KLYYGYYDK..', '..KLYYYYYDK..', '.KLYYYGYYYDK.', '.KDDDDDDDDEK.', 'KKKKKKKKKKKKK'];
GAME_ICON.alert = [ALERT_ROWS, { K: '#1b1622', H: '#fffbe0', L: '#ffe98a', Y: '#ffcf2e', D: '#d99a14', E: '#9a6a08', G: '#3a2008' }];
GAME_ICON.alertr = [ALERT_ROWS, { K: '#1b1622', H: '#ffd0da', L: '#ff8aa0', Y: '#e8364e', D: '#9e1c32', E: '#6e1022', G: '#fff4f4' }];
// Hecho (Pulido+): chapa redonda verde de 9 × 9, de la familia del icono de parada (misma luz y sombra), con la marca blanca
// gruesa (2 px en el codo) y su sombra debajo. Es 9 × 9 en vez de los 9 × 7 del icono plano: el hueco de la franja del objetivo pasa a 9 × 9.
GAME_ICON.done = [['..KKKKK..', '.KHLLLGK.', 'KLGGGGWDK', 'KLGGGWWDK', 'KLWGWWSDK', 'KGWWWSGDK', 'KGSWSGDDK', '.KGSDDDK.', '..KKKKK..'], { K: '#1b1622', H: '#d8ffd8', L: '#8ee89a', G: '#3fa860', D: '#1f6a3a', S: '#1d5a32', W: '#ffffff' }];
const gameIcon = (name) => art('gi' + name, () => { const [rows, pal] = GAME_ICON[name], c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length; const g = c.getContext('2d'); rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); } })); return c; });
const PLATE_MAX = 3, PRIO = { red: 3, say: 2, amber: 1 };
// host: un div posicionado del tamaño de la escena; k: px de pantalla por px de arte; view(): [x, y, w, h] visible en px del
// host; keepOut(): rectángulos prohibidos (la interfaz); mice(): los ratones de la escena [quién, x, y, w, h] en px de arte,
// que ninguna placa puede tapar (el bocadillo tampoco tapa a otro ratón que no sea el que habla).
function labelLayer(host, { k, view, keepOut = () => [], mice = () => [] }) {
  const L = { plates: new Map(), q: [], cur: null, gapUntil: 0, stats: { bubble: 0, plates: 0, badges: 0, hidden: 0, overlaps: 0, closed: 0 } };
  // La placa roja lleva el icono de parada (no un icono de recurso) y el texto en blanco. La versión pequeña es la
  // misma placa con solo su icono y su cadena: se lee igual que la grande y está a la escala de la escena.
  const mkPlate = (it) => { const red = it.tone === 'red', ic = red ? gameIcon('stop').toDataURL() : it.icon, el = document.createElement('div'); el.className = 'ad-warn' + (red ? ' lb-red' : ''); el.innerHTML = `<img class="pix" src="${ic}" alt=""><b>${it.text}</b><i class="ad-chain"></i>`; host.appendChild(el); const bd = document.createElement('div'); bd.className = 'ad-warn lb-mini' + (red ? ' lb-red' : ''); bd.innerHTML = `<img class="pix" src="${ic}" alt=""><i class="ad-chain"></i>`; host.appendChild(bd); it.el = el; it.bd = bd; it.w = el.offsetWidth; it.h = el.offsetHeight; it.bw = bd.offsetWidth; it.bh = bd.offsetHeight; it.ci = -1; it.t = performance.now(); };
  L.warn = (id, o) => { const old = L.plates.get(id); if (old && old.text === o.text && old.tone === o.tone) { old.anchor = o.anchor; return; } if (old) L.unwarn(id); const it = { id, kind: o.tone, ...o }; mkPlate(it); L.plates.set(id, it); };
  L.unwarn = (id) => { const it = L.plates.get(id); if (!it) return; it.el.remove(); it.bd.remove(); L.plates.delete(id); };
  L.say = (who, text, head) => { if (L.cur && L.cur.who === who) return; if (L.q.some((s) => s.who === who)) return; if (L.q.length >= 2) L.q.shift(); L.q.push({ who, text, head }); };
  const startBubble = (s) => { const b = document.createElement('div'); b.className = 'ad-bub'; b.innerHTML = `<span>${s.text}</span>${TAILSVG('down')}`; host.appendChild(b); b.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 150, easing: 'steps(3)' }); L.cur = { ...s, kind: 'say', el: b, w: b.offsetWidth, h: b.offsetHeight, ci: -1, until: performance.now() + readMs(s.text), lostAt: 0, t: performance.now() }; };
  const closeBubble = (now, why) => { const b = L.cur.el; b.classList.remove('side-l', 'side-r'); const a = b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); if (why) L.stats.closed++; L.cur = null; L.gapUntil = now + 600; };
  const hit = (r, list) => list.some((o) => !(r[0] + r[2] <= o[0] || o[0] + o[2] <= r[0] || r[1] + r[3] <= o[1] || o[1] + o[3] <= r[1]));
  const inside = (r, V) => r[0] >= V[0] + 2 && r[1] >= V[1] + 2 && r[0] + r[2] <= V[0] + V[2] - 2 && r[1] + r[3] <= V[1] + V[3] - 2;
  // Posiciones posibles de una placa: colgando de su punto, con la cadena de 8, 20 o 32 px, centrada o corrida a un lado.
  // Cada posición reserva la chapa (r) y su cadena (rc, 3 px de ancho) por separado: reservar la caja entera hasta el punto
  // dejaba sin texto la placa roja a escala 2 (móviles de 320 a 375 px) por rozar la cabeza del ratón que trabaja debajo.
  // Si es roja y no cabe encima, cuelga por debajo de su punto (la cadena sube): lo crítico no se queda sin texto.
  const plateCands = (it) => { const [ax, ay] = [it.anchor[0] * k, it.anchor[1] * k], out = []; for (const ch of it.mini ? [8, 20, 32, 48, 64] : [8, 20, 32]) for (const dx of [0.5, 0.82, 0.18]) { const left = Math.round(ax - it.w * dx), top = Math.round(ay - ch - it.h); out.push({ r: [left, top, it.w, it.h], rc: [Math.round(ax) - 1, top + it.h, 3, ch], left, top, ch, ax }); } if (it.tone === 'red') for (const ch of [8, 20]) for (const dx of [0.5, 0.82, 0.18]) { const left = Math.round(ax - it.w * dx), top = Math.round(ay + ch); out.push({ r: [left, top, it.w, it.h], rc: [Math.round(ax) - 1, Math.round(ay), 3, ch], left, top, ch, ax, below: true }); } return out; };
  // Posiciones posibles de un bocadillo: encima de la cabeza (centrado o corrido, la punta siempre bajo el bocadillo), o a un lado.
  const bubCands = (it, hx, hy) => { const out = [], top = Math.round(hy - it.h - 10); for (const dx of [0.5, 0.75, 0.25, 0.9, 0.1, 0.97, 0.03]) { const left = Math.round(hx - it.w * dx); out.push({ r: [left, top, it.w, it.h + 10], left, top, side: 0, hx, hy }); } const st = Math.round(hy - it.h / 2 - 6); out.push({ r: [Math.round(hx - it.w - 16), st, it.w + 10, it.h], left: Math.round(hx - it.w - 16), top: st, side: -1, hx, hy }); out.push({ r: [Math.round(hx + 6), st, it.w + 10, it.h], left: Math.round(hx + 16), top: st, side: 1, hx, hy }); return out; };
  L.tick = (now) => {
    if (L.cur && now > L.cur.until) closeBubble(now, false);
    if (!L.cur && L.q.length && now > L.gapUntil) startBubble(L.q.shift());
    const V = view(), M = mice().map(([w, x, y, ww, hh]) => [w, [x * k, y * k, ww * k, hh * k]]), placed = [...keepOut(), ...M.map((m) => m[1])], st = { bubble: 0, plates: 0, badges: 0, hidden: 0, overlaps: 0, closed: L.stats.closed };
    const items = [...L.plates.values()]; if (L.cur) items.push(L.cur);
    items.sort((a, b) => PRIO[b.kind] - PRIO[a.kind] || a.t - b.t);
    // Punto de cada aviso (donde nace su cadena): una pieza intenta no taparle el sitio a otro aviso; si no le queda otra,
    // vale cualquier posición sin solapes, como antes.
    const pts = new Map([...L.plates.values()].map((p) => [p, [Math.round(p.anchor[0] * k) - 4, Math.round(p.anchor[1] * k) - 14, 8, 14]]));
    const free = (c, self) => { const o = [...pts].filter(([p]) => p !== self).map(([, r]) => r); return !hit(c.r, o) && !(c.rc && hit(c.rc, o)); };
    for (const it of items) {
      if (it.kind === 'say') {
        const h = it.head(); if (!h) { closeBubble(now, true); continue; }
        const [hx, hy] = [h[0] * k, h[1] * k]; if (hx < V[0] || hx > V[0] + V[2] || hy < V[1] || hy > V[1] + V[3]) { closeBubble(now, true); continue; }
        // Si no cabe con su ancho (150 px), prueba a estrecharse (110 y 90 px, el texto en más líneas) antes de rendirse.
        const own = M.find((m) => m[0] === it.who), others = placed.filter((r) => !own || r !== own[1]), ok = (c) => inside(c.r, V) && !hit(c.r, others); let cs = null, ci = -1;
        for (const mw of [150, 110, 90]) { if (it.mw !== mw) { it.el.style.maxWidth = mw + 'px'; it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; if (it.mw != null) it.ci = -1; it.mw = mw; } cs = bubCands(it, hx, hy); const good = (c) => ok(c) && free(c, null); ci = it.ci >= 0 && good(cs[it.ci]) ? it.ci : cs.findIndex(good); if (ci < 0) ci = it.ci >= 0 && ok(cs[it.ci]) ? it.ci : cs.findIndex(ok); if (ci >= 0) break; }
        if (ci < 0) { it.el.style.visibility = 'hidden'; it.lostAt ||= now; if (now - it.lostAt > 400) closeBubble(now, true); st.hidden++; continue; }
        it.lostAt = 0; it.ci = ci; const c = cs[ci], b = it.el, tail = b.querySelector('.ad-tail'); b.style.visibility = ''; b.style.left = c.left + 'px'; b.style.top = c.top + 'px';
        b.classList.toggle('side-r', c.side < 0); b.classList.toggle('side-l', c.side > 0);
        if (!c.side) { tail.style.top = ''; tail.style.left = Math.max(4, Math.min(it.w - 14, Math.round(hx - c.left - 5))) + 'px'; } else { tail.style.left = ''; tail.style.top = Math.max(4, Math.min(it.h - 14, Math.round(hy - c.top - 8))) + 'px'; }
        placed.push(c.r); st.bubble++; continue;
      }
      // Placa: con texto si quedan huecos (como mucho PLATE_MAX); si no, su insignia; si tampoco cabe, nada.
      const cs = plateCands(it), ok = (c) => inside(c.r, V) && !hit(c.r, placed) && !hit(c.rc, placed); const good = (c) => ok(c) && free(c, it); let ci = st.plates < PLATE_MAX ? (it.ci >= 0 && good(cs[it.ci]) ? it.ci : cs.findIndex(good)) : -1; if (ci < 0 && st.plates < PLATE_MAX) ci = it.ci >= 0 && ok(cs[it.ci]) ? it.ci : cs.findIndex(ok);
      if (ci >= 0) { it.ci = ci; const c = cs[ci]; Object.assign(it.el.style, { visibility: '', left: c.left + 'px', top: c.top + 'px' }); const ch = it.el.querySelector('.ad-chain'); ch.style.left = Math.round(c.ax - c.left - 1) + 'px'; ch.style.height = c.ch + 'px'; if (c.below) { ch.style.bottom = ''; ch.style.top = -c.ch - 2 + 'px'; } else { ch.style.top = ''; ch.style.bottom = -c.ch - 2 + 'px'; } it.bd.style.visibility = 'hidden'; placed.push(c.r, c.rc); st.plates++; continue; }
      // Placa pequeña (solo el icono): colgando de su punto como la grande; su cadena puede alargarse hasta 64 px para pasar
      // por encima de un ratón que esté debajo.
      it.ci = -1; it.el.style.visibility = 'hidden'; const mini = { ...it, w: it.bw, h: it.bh, tone: 'amber', mini: true }, mcs = plateCands(mini), okm = (c) => inside(c.r, V) && !hit(c.r, placed) && !hit(c.rc, placed), mc = mcs.find((c) => okm(c) && free(c, it)) || mcs.find(okm);
      if (mc) { Object.assign(it.bd.style, { visibility: '', left: mc.left + 'px', top: mc.top + 'px' }); const ch = it.bd.querySelector('.ad-chain'); ch.style.left = Math.round(mc.ax - mc.left - 1) + 'px'; ch.style.height = mc.ch + 'px'; ch.style.top = ''; ch.style.bottom = -mc.ch - 2 + 'px'; placed.push(mc.r, mc.rc); st.badges++; } else { it.bd.style.visibility = 'hidden'; st.hidden++; }
    }
    // Comprobación: ninguna pieza visible pisa a otra.
    const vis = [...host.children].filter((e) => e.style.visibility !== 'hidden' && (e.classList.contains('ad-bub') || e.classList.contains('ad-warn')) && e.style.left).map((e) => [parseFloat(e.style.left), parseFloat(e.style.top), e.offsetWidth, e.offsetHeight]);
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) if (hit(vis[i], [vis[j]])) st.overlaps++;
    // Y las cadenas: ninguna cruza otra pieza visible ni a un ratón (la suya cuelga de su propia chapa).
    const hb = host.getBoundingClientRect(), pieces = [...host.children].filter((e) => e.style.visibility !== 'hidden' && (e.classList.contains('ad-bub') || e.classList.contains('ad-warn')) && e.style.left);
    for (const e of pieces) { const ch = e.querySelector('.ad-chain'); if (!ch || !ch.offsetHeight) continue; const q = ch.getBoundingClientRect(), r = [q.left - hb.left, q.top - hb.top, q.width, q.height]; for (const o of pieces) if (o !== e && hit(r, [[parseFloat(o.style.left), parseFloat(o.style.top), o.offsetWidth, o.offsetHeight]])) st.overlaps++; if (hit(r, M.map((m) => m[1]))) st.overlaps++; }
    L.stats = st; return st;
  };
  return L;
}
// La cabeza de un ratón del capítulo, en px de arte del capítulo (su posición de este fotograma).
const headOfB = (who) => () => { const b = BR[who]; return b && b.px != null ? [b.px + 11, b.py - 18] : null; };

// ==== game/sceneP1.js ====
// ---------- CHEESE DRILLER 3.0 · P1: la colonia vertical B, pulida (prototipo aislado, 28-10-2026) ----------
// El propietario eligió la composición B de P0. Esta escena la rehace con el mockup como guía de color y maquetación
// (piedra pizarra fría, madera cálida, faroles, niveles llenos) y con un trabajo de equipo legible.
// Segunda ronda (feedback del propietario):
//   · MÁQUINAS QUE CRECEN (propuesta): cada estación tiene tres fases (I, II y III). Con más obreros la máquina se amplía con
//     módulos (cuba grande con agitador de manivela, prensa doble, mesa de sellado, segundo alambique, bomba con correa…)
//     hasta llenar el nivel y parecer una gran producción. La fase se elige en la herramienta del prototipo; por defecto, III.
//   · LÍNEAS DE PRODUCCIÓN: el producto pasa de obrero en obrero (de pata a pata o a través de la máquina) hasta el palé del
//     montacargas. La materia prima entra por un polipasto que corre bajo el techo desde el rellano hasta la cuba o la tolva,
//     así nadie cruza la línea. Si el montacargas no trae nada, el polipasto coge de la despensa del nivel (la balda del rellano).
//   · ÁRBOL DE COMPORTAMIENTO sencillo por ratón: 1) reaccionar a lo que pasa (veta, estrato, hornada), 2) su trabajo,
//     3) relacionarse con un vecino libre (saludo, charla cara a cara, mirar cómo trabaja el otro), 4) gestos sueltos
//     (estirarse, secarse la frente, mirar atrás). El trabajo encadenado también es interacción: el fogonero aviva el fuego,
//     el de la válvula la abre y el del manómetro lo comprueba, en ese orden, en cada hornada.
//   · GLOBOS ESTABLES: capa propia (la de MAIN 2.0 cambiaba de sitio al pasar otro ratón y se estrechaba): un globo cada vez,
//     su sitio se decide al nacer y luego solo sigue a la cabeza, suavizado; ancho fijo; quien habla se para y mira al otro.
//   · El remover de la cuba estaba roto (dos palas superpuestas): la cuba se dibuja sin la pala fija y la pala se anima sola.
// Mismo motor y piezas aprobadas que MAIN 2.0; lo nuevo es PROVISIONAL y va en el registro PH (modo PH del prototipo).
CM.art = { mouseCanvas, ghostCanvas, labelLayer, houseV3, houseStage, labV2, shopBack, shopFront };
CM.createColonyScene = function (canvas, host, sim, hooks) {
  const g = canvas.getContext('2d');
  // ---- Geometría (píxeles de arte) ----
  const WW = 246, PAD = 52; // mundo dibujado 0–246 y un margen de tierra a cada lado para pantallas más anchas
  const E0 = 8, E1 = 238; // tramo que decide la escala: el interior (8–210) y el pozo (210–238)
  const SX0 = 210, SX1 = 238; // pozo del montacargas: postes 210–212 y 236–238; la jaula va de 212 a 236
  const G = 96; // suelo de la superficie
  const LH = 106, BEAM = 7; // cada nivel: viga de 7 px y 99 px de interior
  const ORDER = ['cheese', 'refine', 'drill', 'mine'];
  const LV = {};
  ORDER.forEach((k, i) => { const top = G + 6 + i * LH; LV[k] = { id: k, top, y0: top + BEAM, F: top + LH }; });
  // LA GRAN ROCA (exploración): bajo la colonia hay una roca enorme (su cúpula se sale de la pantalla). MINE es una cámara
  // excavada al fondo de un pozo que atraviesa la roca; con cada nivel de profundidad el pozo se alarga PITK px y la cámara
  // baja. La roca no se mueve: sus capas y carteles están quietos y es la cámara de excavación la que los va pasando.
  // Todo lo de MINE se dibuja en sus coordenadas de siempre y se desplaza MO px (lo que mide el pozo).
  const DEEP = 156, PITK = 5, PIT0 = 40, PITMAX = 360;
  const pitFor = (dd) => Math.min(PITMAX, PIT0 + Math.max(0, dd - 30) * PITK);
  let MO = pitFor(sim.depth);
  const Hw = () => LV.mine.F + MO + DEEP, baseBottom = () => LV.mine.F + MO + 24;
  const DPX = PITK, D0 = 0, D1 = 140; // la roca: PITK px por nivel, de la profundidad 0 a la 140
  const ROCK_TOP = () => LV.drill.F + BEAM; // donde acaba la tierra de la colonia
  const PX0 = 16, PX1 = 98; // boca del pozo (contiene la barra del taladro, x 48)
  const crestY = (x) => ROCK_TOP() + 6 + Math.round(((x - 105) / 150) ** 2 * 24);
  const LAND = { drill: LV.drill.F, refine: LV.refine.F, cheese: LV.cheese.F, surface: G };
  const CAGE = { x: 212, w: 24, h: 27 };
  const PALLET = { x: 196 }; // palé del rellano (196–208), junto al poste del pozo
  const BELLX = 193; // FACTORY+: campana del rellano colgada del techo, con su cuerda hasta la altura de las patas
  const LANDX = PALLET.x - 22; // donde se pone quien deja algo en el palé
  // MINE: el frente a la izquierda, la perforadora encima (su barra baja por un barreno hasta la veta).
  const FACE = { x0: 8, y0: LV.mine.y0, y1: LV.mine.F, vy: LV.mine.F - 50 };
  // Perfil del frente: arriba se curva hacia dentro y se funde con el techo (no hay arista), en medio ondula y abajo se abre
  // en un talud. Donde trabajan el picador (abajo) y el del andamio (a media altura) queda en x ≈ 74–76.
  const edgeX = (y) => {
    const r = y - LV.mine.y0, base = 74 + Math.round(Math.sin(r * 0.21) * 1.5 + Math.sin(r * 0.07 + 1) * 1.5 + hash4(Math.floor(r / 3) + 200, 9) * 2);
    if (r < 24) { const k = Math.max(0, r) / 24, sm = k * k * (3 - 2 * k); return Math.round(56 + (base - 56) * sm); }
    if (r > 90) return base + Math.round((r - 90) * 0.45);
    return base;
  };
  const DCX = 48; // eje de la perforadora y del barreno
  const SCAF = { x0: 74, x1: 102, y: LV.mine.F - 36 };
  const PILE = { x: 100 };
  const CART = { home: 144, dump: 170 };
  const CHUTE = { x0: 170, x1: 190 };
  const DR = { crateX: 68, readyX: 108, spoutX: 73 };
  const RF = { x: 28 }; // refinería B aprobada: horno 34–64, alambique 62–94, bandeja 81–95
  const RX = RF.x + RX0;
  // El lienzo aprobado de REFINE B traía 4–6 px de aire bajo el horno y el alambique (en MAIN 2.0 se apoyaba en un saliente):
  // aquí va 4 px más abajo, con zócalo de ladrillo bajo el horno y zapatas de hierro bajo las patas del alambique.
  const REFY = LV.refine.F - 52;
  const STILL2 = { x: 102 }; // segundo alambique (fase III) y su bandeja
  const TRAY = [{ x: RX + 47, take: 98 }, { x: STILL2.x + 19, take: 136 }];
  const HOPPER = [RX + 39, STILL2.x + 11]; // centro de la tolva de cada alambique
  // Despensa de cada nivel de entrada: una balda en la pared del rellano (las existencias de la simulación).
  const SHELF = { x: 182, w: 26 };
  // Raíl del polipasto: por debajo de los altillos (no cruza a nadie) y por encima de las cabezas del suelo.
  const railY = (st) => LV[st].F - 50;
  const STGS = { mine: 3, drill: 3, refine: 3, cheese: 3 }; let tier = 'cheddar';
  // EXPLORACIÓN «FACTORY+» (rama proto/driller3-anim): más relación de los ratones con el escenario y entre ellos — el fogonero
  // echa carbón, la campana del rellano llama al montacargas, chocan las patas al pasarse algo, giran la cabeza cuando suena
  // una máquina, arreglan un farol que parpadea, se comparten una miga y empujan juntos el carro. Se apaga para comparar.
  let XTRA = true;
  // ACCIÓN ACTIVA (28-10-2026): mientras el jugador acelera una estación (tocar o mantener el botón de acción), su ritmo sube
  // de 1 a 2 con arranque (~0,25 s) y baja con inercia (~0,6 s). Ese ritmo mueve a la vez TODO lo de la estación: el reloj de
  // su máquina (vclk), el tiempo de las tareas de sus ratones (caminan y trabajan más deprisa) y los efectos de esfuerzo
  // (chispas, brasas, vapor, salpicaduras, sudor), que nacen de la máquina y crecen con el ritmo hasta un tope. Va al mismo
  // ritmo que la producción simulada (×2): lo que se ve es lo que pasa. Nada se crea por cada toque.
  const spd = { mine: 1, drill: 1, refine: 1, cheese: 1, sell: 1, lift: 1, lab: 1 }, vclk = {}, rushAt = {}, wasRush = {}, acc = {};
  const heat = (st) => Math.max(0, Math.min(1, (spd[st] || 1) - 1));
  const vnow = (st, now) => (vclk[st] != null ? vclk[st] : now);
  // Refuerzos (permanentes, sim.boosted[st] = 0..2): ×1,5 de ritmo cada uno, como en el juego (B.boosts.speed). Se suman al
  // acelerón (×2, temporal): el ritmo de una estación es pace = acelerón × refuerzos. El calor (heat) es solo del acelerón.
  const bN = (st) => Math.max(0, Math.min(2, (sim.boosted && sim.boosted[st]) | 0));
  const bMul = (st) => (st === 'refine' ? 1 : Math.pow(1.5, bN(st))); // la refinería reforzada rinde más Base, no va más deprisa
  const pace = (st) => (spd[st] || 1) * bMul(st);
  // Cuántos salen de un efecto a un ritmo dado (por segundo), con acumulador: no depende de los fotogramas.
  const every = (key, perSec, dt) => { acc[key] = (acc[key] || 0) + (perSec * dt) / 1000; const n = Math.floor(acc[key]); acc[key] -= n; return Math.min(4, n); };

  // ---- Fases de cada máquina: puestos [papel, x del sprite, superficie (F suelo, G altillo, S andamio), mira] ----
  const POSTS = {
    mine: [
      [['picker', 76, 'F', -1], ['collector', 120, 'F', -1]],
      [['picker', 76, 'F', -1], ['climber', 76, 'S', -1], ['collector', 120, 'F', -1]],
      [['picker', 76, 'F', -1], ['climber', 76, 'S', -1], ['collector', 120, 'F', -1], ['hauler', 162, 'F', -1]],
    ],
    drill: [
      [['operator', 6, 'F', 1], ['filler', 84, 'F', -1]],
      [['operator', 6, 'F', 1], ['filler', 84, 'F', -1], ['greaser', 34, 'G', -1], ['runner', 172, 'F', -1]],
      [['operator', 6, 'F', 1], ['filler', 84, 'F', -1], ['greaser', 34, 'G', -1], ['checker', 94, 'G', -1], ['runner', 172, 'F', -1]],
    ],
    refine: [
      [['stoker', 8, 'F', 1], ['molder', 98, 'F', -1]],
      [['stoker', 8, 'F', 1], ['valve', 54, 'G', 1], ['molder', 98, 'F', -1], ['runner', 172, 'F', -1]],
      [['stoker', 8, 'F', 1], ['gauge', 12, 'G', 1], ['valve', 54, 'G', 1], ['molder', 136, 'F', -1], ['runner', 172, 'F', -1]],
    ],
    cheese: [
      [['mixer', 12, 'F', 1], ['carrier', 74, 'F', -1]],
      [['mixer', 46, 'F', -1], ['presser', 88, 'F', -1], ['packer', 112, 'F', -1], ['turner', 12, 'G', 1]],
      [['mixer', 46, 'F', -1], ['presser', 104, 'F', -1], ['packer', 128, 'F', -1], ['stacker', 172, 'F', -1], ['turner', 12, 'G', 1], ['taster', 40, 'G', 1]],
    ],
  };
  // Superficie (no cambia de fase): torno y ascensorista del montacargas, tendero y mozo, investigador y ayudante.
  const SURF = [['lift', 'winch', 178, G - 34, 1], ['lift', 'liftman', CAGE.x + 1, LAND.drill, -1], ['sell', 'keeper', 0, G, 1, true], ['sell', 'porter', 170, G, 1], ['lab', 'researcher', 0, G, 1, true], ['lab', 'assistant', 96, G, -1]];
  const GALS = { drill: [null, [8, 102], [8, 122]], refine: [null, [8, 100], [8, 140]], cheese: [null, [8, 98], [8, 98]] };
  const GALY = { drill: LV.drill.F - 58, refine: LV.refine.F - 60, cheese: LV.cheese.F - 58 };
  const gal = (st) => (GALS[st] ? GALS[st][STGS[st] - 1] : null);
  // CHEESE: la cuba y las prensas cambian de sitio con la fase.
  const CZ = () => (STGS.cheese === 1 ? { station: 34, vatC: 47 } : { vat: 8, vatC: 26, press: [70].concat(STGS.cheese === 3 ? [87] : []), table: STGS.cheese === 3 ? 152 : 136 });
  const SKILL = { mine: 'mining', drill: 'drilling', refine: 'refining', cheese: 'cheesemaking', sell: 'trading', lift: 'mining', lab: 'research' };
  const SKILL_OF = { porter: 'refining', assistant: 'drilling' };
  const WALK = 0.024, WALK_LOADED = 0.019;

  // ---- Ratones con su aspecto real (las mismas tablas que el juego) ----
  const HATC = [['#ffcf2e', '#d99a12'], ['#e2562a', '#9c2f14'], ['#4a8fe8', '#2b5cab'], ['#5fcf6a', '#2f8f44'], ['#9a5fd0', '#5f3590'], ['#ff7aa8', '#c44a78'], ['#f4f4f4', '#b9c0cf'], ['#3a3f52', '#1f2330']];
  const HATN = ['helmet', 'cap', 'beanie', 'tophat', 'bow'], FURN = ['white', 'grey', 'brown', 'cream', 'dark', 'peach', 'blue', 'mint', 'lilac', 'gold'], ACCN = ['', 'glasses', 'patch', 'moustache', 'blush'];
  const light = (hex, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) + (255 - parseInt(hex.slice(i, i + 2), 16)) * k).toString(16).padStart(2, '0')).join('');
  const lookOf = (m) => { const n = (m.look || 0) >>> 0, r = m.rarity || 0; return { fur: r === 2 ? 9 : r === 1 ? 7 + (n % 2) : n % 7, hat: r === 2 ? 5 : (n >> 3) % 5, hc: (n >> 6) % 8, acc: (n >> 9) % 5, pack: (n >> 12) % 5 }; };
  function crewOf(m, skill) {
    const p = lookOf(m), hc = HATC[p.hc] || HATC[0];
    return { name: m.id + ':' + (m.look >>> 0) + ':' + Math.min(3, m.rank || 0) + ':' + skill, id: m.id, lv: 1, rank: Math.min(3, m.rank || 0), rar: m.rarity || 0, skill, fur: FURN[p.fur] || 'white', pack: p.pack, hat: p.hat === 5 ? null : [HATN[p.hat] || 'cap', light(hc[0], 0.45), hc[0], hc[1]], acc: ACCN[p.acc] || '' };
  }

  // ================= ARTE PROVISIONAL NUEVO (registro PH) =================
  const STONE = ['#13161e', '#1b1f2a', '#232937', '#2c3344', '#373f52', '#454f66'];
  const STONEW = ['#1d1817', '#292120', '#362b29', '#453732', '#58463d', '#6f594b'];
  const W5 = MAT.wood;
  const EARTH = ['#1f150e', '#2c1e14', '#3a281b', '#4a3423', '#5c432e', '#73563b'];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const dith = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
  const LAMPS = { cheese: [54, 132, 180], refine: [30, 120, 180], drill: [80, 128, 178], mine: [106, 150, 196] };
  function lampLight(k, x, y) { const lv = LV[k]; let l = 0; for (const lx of LAMPS[k]) { const d = Math.hypot(x - lx, (y - (lv.y0 + 12)) * 1.15); l = Math.max(l, 1 - d / 34); } return Math.max(0, l); }
  function cobble(k, x0, y0, w, h, seed) {
    for (let r = 0, y = y0; y < y0 + h; r++, y += 7) {
      let x = x0 - (r % 2 ? 6 : 0) - Math.floor(hash4(r, seed, 1) * 4);
      while (x < x0 + w) {
        const sw = 9 + Math.floor(hash4(x, r, seed) * 6), sh = 6, base = 2 + (hash4(x, r, seed + 3) < 0.28 ? 1 : 0) - (hash4(x, r, seed + 5) > 0.86 ? 1 : 0);
        for (let j = 0; j <= sh; j++) for (let i = 0; i < sw; i++) {
          const px = x + i, py = y + j; if (px < x0 || px >= x0 + w || py < y0 || py >= y0 + h) continue;
          let t;
          if (j === sh || i === sw - 1) t = 0;
          else if ((i === 0 || i === sw - 2) && (j === 0 || j === sh - 1)) t = 0;
          else { t = base; if (j === 0) t += 2; else if (j === 1) t += 1; if (i === 0) t += 1; if (j === sh - 1) t -= 1; if (i === sw - 2) t -= 1; if (hash4(px, py, seed) < 0.05) t -= 1; }
          const dy = py - y0, db = y0 + h - 1 - py; if (dy < 4) t -= dy < 2 ? 2 : 1; if (db < 2) t -= 1;
          t = Math.max(0, Math.min(5, t));
          const l = lampLight(k, px, py), warm = l > dith(px, py) * 0.9;
          R(px, py, 1, 1, warm ? STONEW[Math.min(5, t + (l > 0.55 && t > 0 ? 1 : 0))] : STONE[t]);
        }
        x += sw;
      }
    }
  }
  function earth(x0, y0, w, h, seed) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) R(x, y, 1, 1, EARTH[hash4(x >> 1, y >> 1, seed) < 0.18 ? 1 : 2]);
    for (let i = 0; i < (w * h) / 40; i++) {
      const cx = x0 + Math.floor(hash4(i, seed, 1) * w), cy = y0 + Math.floor(hash4(i, seed, 2) * h), rx = 2 + Math.floor(hash4(i, seed, 3) * 3), ry = rx - 1 + Math.floor(hash4(i, seed, 4) * 2);
      for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { if ((xx * xx) / (rx * rx) + (yy * yy) / (ry * ry) > 1) continue; const px = cx + xx, py = cy + yy; if (px < x0 || px >= x0 + w || py < y0 || py >= y0 + h) continue; const t = xx + yy < -rx + 1 ? 5 : xx + yy > rx - 1 ? 3 : 4; R(px, py, 1, 1, EARTH[t]); }
      if (cy + ry + 1 < y0 + h) R(cx - rx + 1, cy + ry + 1, rx * 2 - 1, 1, EARTH[0]);
    }
  }
  function beamH(x0, x1, y, h, seed = 1) {
    R(x0, y, x1 - x0, h, W5[2]); R(x0, y, x1 - x0, 1, W5[4]); R(x0, y + 1, x1 - x0, 1, W5[3]); R(x0, y + h - 2, x1 - x0, 1, W5[1]); R(x0, y + h - 1, x1 - x0, 1, W5[0]);
    for (let x = x0; x < x1; x++) { if (hash4(x, y, seed) < 0.14) R(x, y + 2 + Math.floor(hash4(x, y, seed + 1) * Math.max(1, h - 4)), 2 + Math.floor(hash4(x, y, seed + 2) * 3), 1, W5[1]); }
    for (let x = x0 + 30 + Math.floor(hash4(seed, y, 2) * 14); x < x1 - 4; x += 44 + Math.floor(hash4(x, seed, 3) * 18)) { R(x, y + 1, 1, h - 2, W5[0]); R(x + 1, y + 1, 1, h - 2, W5[3]); }
  }
  function postV(x, y0, y1, w = 5) {
    R(x, y0, w, y1 - y0, W5[2]); R(x, y0, 1, y1 - y0, W5[3]); R(x + w - 1, y0, 1, y1 - y0, W5[1]); R(x + w, y0, 1, y1 - y0, W5[0]);
    for (let y = y0; y < y1; y++) if (hash4(x, y, 7) < 0.1) R(x + 1 + Math.floor(hash4(x, y, 8) * (w - 2)), y, 1, 2, W5[1]);
  }
  function braceD(x0, y0, x1, y1) { bres(x0, y0, x1, y1, (x, y) => { R(x, y, 1, 3, W5[2]); R(x, y, 1, 1, W5[3]); R(x, y + 2, 1, 1, W5[1]); }); }
  function plateBolt(x, y) { R(x, y, 5, 5, MAT.iron[1]); R(x, y, 5, 1, MAT.iron[3]); R(x + 1, y + 1, 1, 1, MAT.iron[4]); R(x + 3, y + 3, 1, 1, MAT.iron[4]); }
  function gallery(x0, x1, y, floorY) {
    R(x0, y - 11, x1 - x0, 1, W5[3]); R(x0, y - 10, x1 - x0, 1, W5[1]); for (let x = x0 + 3; x < x1; x += 7) { R(x, y - 10, 1, 10, W5[1]); R(x + 1, y - 10, 1, 10, W5[0]); }
    R(x0, y, x1 - x0, 4, W5[2]); R(x0, y, x1 - x0, 1, W5[4]); R(x0, y + 1, x1 - x0, 1, W5[3]); R(x0, y + 3, x1 - x0, 1, W5[1]); R(x0, y + 4, x1 - x0, 1, INK4);
    for (let x = x0 + 9; x < x1 - 2; x += 11) R(x, y + 1, 1, 2, W5[1]);
    for (const px of [x0 + 2, x1 - 6]) postV(px, y + 5, floorY, 4);
    braceD(x0 + 6, y + 5, x0 + 14, y + 13); braceD(x1 - 7, y + 5, x1 - 15, y + 13);
  }
  function ladder(x, y0, y1) { for (const xx of [x, x + 6]) { R(xx, y0, 1, y1 - y0, W5[1]); R(xx + 1, y0, 1, y1 - y0, W5[0]); } for (let y = y0 + 3; y < y1; y += 5) { R(x + 1, y, 5, 1, W5[3]); R(x + 1, y + 1, 5, 1, W5[1]); } }
  function lampBody(x, y) { R(x + 1, y - 7, 1, 7, '#2a2230'); R(x - 1, y, 5, 1, MAT.iron[1]); R(x - 1, y + 1, 5, 4, '#ffcf6a'); R(x, y + 1, 1, 3, '#fff2b0'); R(x - 1, y + 5, 5, 1, MAT.iron[1]); R(x - 2, y + 1, 1, 4, INK4); R(x + 4, y + 1, 1, 4, INK4); }
  function pipeBg(x0, y0, x1, y1, th = 3) { const x = Math.min(x0, x1), y = Math.min(y0, y1), w = Math.abs(x1 - x0) || th, h = Math.abs(y1 - y0) || th; R(x, y, w, h, '#3c3f52'); if (w >= h) { R(x, y, w, 1, '#5a5e74'); R(x, y + h - 1, w, 1, '#262836'); for (let xx = x + 10; xx < x + w; xx += 22) R(xx, y - 1, 2, h + 2, '#4a4e62'); } else { R(x, y, 1, h, '#5a5e74'); R(x + w - 1, y, 1, h, '#262836'); for (let yy = y + 8; yy < y + h; yy += 20) R(x - 1, yy, w + 2, 2, '#4a4e62'); } }
  function barrelBg(x, base) { for (let y = 0; y < 12; y++) { const w = 8 + (y > 1 && y < 10 ? 2 : 0); R(x + 5 - w / 2, base - 12 + y, w, 1, y === 3 || y === 8 ? '#3a2416' : y < 2 ? '#7a5434' : '#5e3f27'); } R(x + 1, base - 11, 2, 9, '#7a5434'); }
  function crateBg(x, base, w = 10, h = 8) { R(x, base - h, w, h, '#5a3e26'); R(x, base - h, w, 1, '#7a5636'); R(x, base - 1, w, 1, '#3a2616'); R(x + 1, base - h + 3, w - 2, 1, '#3a2616'); R(x + Math.floor(w / 2), base - h + 1, 1, h - 2, '#4a3220'); }
  function sackBg(x, base) { for (let y = 0; y < 8; y++) { const w = 7 + (y > 2 ? 2 : 0) - (y === 7 ? 2 : 0); R(x + 4 - Math.floor(w / 2), base - 8 + y, w, 1, y < 2 ? '#a08a64' : '#7e6a4a'); } R(x + 3, base - 9, 2, 1, '#5a4a32'); }
  function shelfBg(x, y, w, items) { R(x, y, w, 2, '#6a4a2a'); R(x, y, w, 1, '#8a6438'); R(x + 1, y + 2, 1, 3, '#4a3220'); R(x + w - 2, y + 2, 1, 3, '#4a3220'); items(x, y); }
  function wheelBg(x, base, aged) { const c = aged ? ['#7a5a22', '#a07a2c', '#c4a050'] : ['#8a6a1a', '#c09a2a', '#e8c454']; R(x + 1, base - 5, 6, 5, c[1]); R(x, base - 4, 8, 3, c[1]); R(x + 1, base - 5, 6, 1, c[2]); R(x, base - 2, 8, 1, c[0]); }
  function toolRack(x, y) { R(x, y, 18, 2, '#5e3f27'); R(x, y, 18, 1, '#7a5434'); for (const [dx, kind] of [[2, 'pick'], [8, 'shovel'], [14, 'pick']]) { R(x + dx + 1, y + 2, 1, 14, '#6e4a2c'); if (kind === 'pick') { R(x + dx - 2, y + 3, 7, 1, '#7c8396'); R(x + dx - 2, y + 4, 1, 1, '#5a6070'); R(x + dx + 4, y + 4, 1, 1, '#5a6070'); } else { R(x + dx, y + 13, 3, 4, '#7c8396'); R(x + dx, y + 16, 3, 1, '#5a6070'); } } }
  function coalPile(x, base) { for (let k = 0; k < 6; k++) { const w = 18 - k * 3; R(x + 9 - w / 2, base - k, w, 1, k % 2 ? '#1c1a20' : '#28252e'); } R(x + 6, base - 4, 1, 1, '#4a4656'); R(x + 11, base - 3, 1, 1, '#4a4656'); }
  function timberStack(x, base) { for (let k = 0; k < 3; k++) { R(x + (k % 2), base - 3 - k * 3, 20, 3, k % 2 ? '#6a4a2c' : '#5a3e24'); R(x + (k % 2), base - 3 - k * 3, 20, 1, '#8a6438'); R(x + (k % 2) + 19, base - 3 - k * 3, 1, 3, '#3a2616'); } }
  function noticeBoard(x, y) { R(x, y, 16, 11, '#5e3f27'); R(x + 1, y + 1, 14, 9, '#7a5434'); R(x + 2, y + 2, 5, 4, '#d8cfb4'); R(x + 8, y + 3, 6, 5, '#c8bfa0'); R(x + 3, y + 7, 4, 2, '#e0d8c0'); R(x + 4, y + 3, 1, 1, '#a03a2a'); R(x + 10, y + 4, 1, 1, '#3a6aa0'); }
  // Cartel de profundidad APROBADO (revisión de arte, «I · indicador de profundidad»): el de V4.1 se leía como una cruz; este
  // lleva una flecha hacia abajo inequívoca (asta de 3 px y punta de 7) y el número con los dígitos del juego.
  const ARROW_I = ['..###..', '..###..', '..###..', '..###..', '#######', '.#####.', '..###..', '...#...'];
  const PLATE_MAT = { cheddar: { face: TH.cheddar.beam, light: TH.cheddar.beamL, ink: '#3a2410' }, gouda: { face: TH.gouda.metal, light: TH.gouda.metalL, ink: TH.gouda.metalD }, brie: { face: MAT.copper[2], light: MAT.copper[3], ink: MAT.copper[0] }, emmental: { face: TH.cheddar.beam, light: TH.cheddar.beamL, ink: '#3a2410' }, parmesan: { face: TH.gouda.metal, light: TH.gouda.metalL, ink: TH.gouda.metalD }, blue: { face: MAT.copper[2], light: MAT.copper[3], ink: MAT.copper[0] } };
  function depthPlate(x, y, n, m) {
    const w = 12 + String(n).length * 4 + 3;
    box(x, y, w, 11, m.face); R(x, y, w, 1, m.light);
    ARROW_I.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') R(x + 2 + i, y + 1 + j, 1, 1, m.ink); }));
    digits(n, x + 12, y + 3, m.ink); return w;
  }
  // Raíl del polipasto: viga en I con escuadras a la pared, del rellano a la máquina.
  function rail(k, x0, x1) { const y = railY(k); R(x0, y, x1 - x0, 2, MAT.iron[2]); R(x0, y, x1 - x0, 1, MAT.iron[3]); R(x0, y + 2, x1 - x0, 1, INK4); for (let x = x0 + 6; x < x1; x += 24) { R(x, y - 4, 1, 4, MAT.iron[1]); R(x - 2, y - 4, 5, 1, MAT.iron[1]); } R(x0 - 1, y - 1, 3, 4, MAT.iron[1]); R(x1 - 2, y - 1, 3, 4, MAT.iron[1]); }
  // Balda de la despensa del rellano (las cajas o barras que tiene la simulación se pintan encima cada fotograma).
  function storeShelf(k) { const y = LV[k].F - 38; R(SHELF.x, y, SHELF.w, 2, W5[2]); R(SHELF.x, y, SHELF.w, 1, W5[4]); R(SHELF.x, y + 2, SHELF.w, 1, W5[0]); for (const x of [SHELF.x + 2, SHELF.x + SHELF.w - 4]) braceD(x, y + 3, x + 3, y + 8); }

  // ---- Piezas con contorno (se juegan: las tocan los ratones) ----
  const crateC = (n) => art('p1crate' + n, () => { const p = Px(10, 9); p.rect('wood', 0, 3, 10, 6, { shade: 'top' }); p.hline(0, 5, 10, 1); p.vline(4, 4, 5, 1); p.rivet(1, 4); p.rivet(8, 4); for (let i = 0; i < n; i++) p.ell('raw', 2 + i * 3, 3, 1.9, 1.7); return p.render(); });
  const barsC = () => art('p1bars', () => { const p = Px(7, 5); p.rect('cream', 0, 2, 7, 3); p.rect('cream', 1, 0, 5, 2); p.hline(0, 2, 7, 1); return p.render(); });
  const wheelC = () => artCarry('w');
  // Rueda sellada (lista para vender): la misma con su faja roja.
  const wheelLC = () => art('p1wheelL', () => { const c = document.createElement('canvas'); c.width = 8; c.height = 7; const x = c.getContext('2d'); x.drawImage(wheelC(), 0, 0); x.fillStyle = '#c8462e'; x.fillRect(1, 3, 6, 1); x.fillStyle = '#ff7a52'; x.fillRect(2, 3, 2, 1); return c; });
  // Molde con cuajada (lo que el quesero saca de la cuba y mete en la prensa).
  const curdC = () => art('p1curd', () => { const p = Px(8, 6); p.rect('wood', 0, 1, 8, 5, { shade: 'cyl' }); p.ell('cream', 4, 1.6, 3.4, 1.4, { shade: 'flat' }); p.hline(0, 4, 8, 1); return p.render(); });
  const chunkC = () => art('p1chunk' + tier, () => { const P = rockOf(), b = PB(7, 6); b.ell(3.5, 3, 3.3, 2.6, (x, y) => (x + y < 4 ? P[4] : x + y > 6 ? P[2] : P[3])); b.px(2, 1, P[5]); b.outline(INK4); return b.canvas(); });
  // Paletada de carbón y miga de queso (provisionales, FACTORY+).
  const coalC = () => art('p1coal', () => { const b = PB(4, 3); b.rect(0, 0, 4, 3, '#1c1a20'); b.px(1, 0, '#4a4656'); b.px(3, 2, '#0e0c10'); b.outline(INK4); return b.canvas(); });
  const crumbC = () => art('p1crumb', () => { const b = PB(3, 3); b.rect(0, 0, 3, 3, '#f0b828'); b.px(0, 0, '#fff6b0'); b.px(2, 2, '#b87410'); b.outline(INK4); return b.canvas(); });
  const ITEM = { crate: () => crateC(3), bars: barsC, wheel: wheelC, wheelL: wheelLC, curd: curdC, chunk: chunkC, coal: coalC, crumb: crumbC };
  const cageBackC = () => art('p1cageB', () => { const p = Px(24, 27); p.rect('iron', 0, 4, 24, 23); p.rect('soot', 2, 6, 20, 17, { shade: 'flat' }); for (let x = 4; x < 22; x += 4) p.vline(x, 6, 17, 2); for (let y = 9; y < 23; y += 4) p.hline(2, y, 20, 2); p.rect('wood', 1, 23, 22, 4, { shade: 'top' }); p.rect('iron', 0, 2, 24, 3, { shade: 'top' }); p.rect('iron', 10, 0, 4, 2); return p.render(); });
  const cageFrontC = () => art('p1cageF', () => { const p = Px(24, 27); for (const x of [0, 6, 12, 18, 23]) p.rect('iron', x, 5, 1, 18, { shade: 'flat' }); p.rect('iron', 0, 13, 24, 1, { shade: 'flat' }); p.rect('iron', 0, 2, 24, 3, { shade: 'top' }); for (const x of [1, 22]) p.rivet(x, 3); return p.render(false); });
  const cartC = () => art('p1cart', () => { const p = Px(18, 12); p.rect('wood', 1, 3, 16, 5, { shade: 'top' }); p.hline(1, 5, 16, 1); p.vline(6, 3, 5, 1); p.vline(11, 3, 5, 1); p.rect('iron', 0, 3, 18, 1, { shade: 'flat' }); p.ell('iron', 4.5, 9.5, 2.4, 2.4, { shade: 'top' }); p.ell('iron', 13.5, 9.5, 2.4, 2.4, { shade: 'top' }); return p.render(); });
  const gaugeC = () => art('p1gauge', () => { const p = Px(9, 9); p.ell('iron', 4.5, 4.5, 4.4, 4.4, { shade: 'top' }); p.ell('cream', 4.5, 4.5, 3.1, 3.1, { shade: 'flat' }); return p.render(); });
  const valveC = (f) => art('p1valve' + f, () => { const p = Px(9, 9); p.ell('cloth', 4.5, 4.5, 4.3, 4.3, { shade: 'top' }); p.ell('soot', 4.5, 4.5, 2.6, 2.6, { shade: 'flat' }); p.ell('cloth', 4.5, 4.5, 1.2, 1.2); const a = (f * Math.PI) / 4; for (let k = 0; k < 4; k++) { const b = a + (k * Math.PI) / 2; bres(4, 4, Math.round(4 + Math.cos(b) * 3), Math.round(4 + Math.sin(b) * 3), (x, y) => p.tone(x, y, 1)); } return p.render(); });
  const gearC = (f) => art('p1gear' + f, () => { const p = Px(12, 12); p.rect('iron', 0, 0, 12, 12, { shade: 'top' }); p.ell('steel', 6, 6, 4.4, 4.4, { shade: 'flat' }); const a = (f * Math.PI) / 6; for (let k = 0; k < 6; k++) { const b = a + (k * Math.PI) / 3; p.tone(Math.round(6 + Math.cos(b) * 3.6), Math.round(6 + Math.sin(b) * 3.6), 1); } p.ell('iron', 6, 6, 1.3, 1.3); p.rivet(1, 1); p.rivet(9, 9); return p.render(); });
  // Cuba pequeña aprobada SIN su palo fijo (el palo y la pala superpuestos eran el remover roto) y cuba grande (fase II–III)
  // con agitador de manivela: puente de hierro, caja de engranajes, eje que entra en la cuajada y manivela al costado.
  const vatC = () => art('p1vat', () => { const p = Px(18, 14); p.rect('wood', 1, 4, 16, 10, { shade: 'cyl' }); for (let x = 3; x < 17; x += 3) p.vline(x, 5, 9, 1); p.rect('iron', 1, 6, 16, 1, { shade: 'flat' }); p.rect('iron', 1, 11, 16, 1, { shade: 'flat' }); p.ell('wood', 9, 4, 8.4, 3.2, { shade: 'top' }); p.ell('cream', 9, 4.2, 6.6, 2.1, { shade: 'flat' }); p.tone(7, 3, 3).tone(10, 4, 4); return p.render(); });
  const bigVatC = () => art('p1bigvat', () => {
    const p = Px(38, 24);
    p.fn('wood', (x, y) => y >= 7 && y < 22 && x >= 1 + (y > 19 ? 1 : 0) && x < 37 - (y > 19 ? 1 : 0), 0, 7, 38, 22, { shade: 'cyl' });
    for (let x = 4; x < 36; x += 4) p.vline(x, 9, 12, 1);
    p.rect('iron', 1, 11, 36, 1, { shade: 'flat' }); p.rect('iron', 1, 18, 36, 1, { shade: 'flat' }); for (const x of [3, 34]) { p.rivet(x, 11); p.rivet(x, 18); }
    p.ell('wood', 19, 7.5, 18.4, 3.4, { shade: 'top' }); p.ell('cream', 19, 7.8, 16, 2.2, { shade: 'flat' });
    p.rect('wood2', 3, 22, 5, 2); p.rect('wood2', 30, 22, 5, 2);
    p.rect('iron', 4, 1, 30, 2, { shade: 'top' }); p.rect('iron', 4, 3, 2, 5); p.rect('iron', 32, 3, 2, 5); p.rect('iron', 16, 0, 6, 4, { shade: 'top' }); p.rivet(17, 1);
    return p.render();
  });
  // Manivela del agitador (9 × 9, cuatro posiciones) y bomba de la perforadora (fase III, 30 × 20).
  const crankC = (f0) => { const f = ((f0 % 4) + 4) % 4; return art('p1crank' + f, () => { const p = Px(9, 9); p.ell('iron', 4.5, 4.5, 3.4, 3.4, { shade: 'top' }); p.ell('iron', 4.5, 4.5, 1.2, 1.2); const H2 = [[1, -1], [1, 1], [-1, 1], [-1, -1]][f]; bres(4, 4, 4 + H2[0] * 3, 4 + H2[1] * 3, (x, y) => p.tone(x, y, 4)); return p.render(); }); };
  const pumpC = () => art('p1pump', () => { const p = Px(30, 20); p.rect('iron', 0, 16, 30, 4, { shade: 'top' }); for (let x = 2; x < 30; x += 7) p.rivet(x, 17); p.rect('paint', 8, 4, 18, 12, { noise: 0.04 }); p.hline(9, 7, 16, 1); p.hline(9, 10, 16, 1); p.rect('iron', 20, 0, 3, 5, { shade: 'cyl' }); p.rect('iron', 19, 0, 5, 1); p.rect('iron', 0, 6, 9, 9, { shade: 'top' }); return p.render(); });
  const stampTable = () => art('p1stamp', () => { const p = Px(16, 10); p.rect('wood', 0, 3, 16, 2, { shade: 'top' }); p.rect('wood2', 1, 5, 2, 5); p.rect('wood2', 13, 5, 2, 5); p.rect('cloth', 11, 0, 2, 3); p.rect('wood2', 10, 0, 4, 1); return p.render(); });
  // Estación pequeña de queso (fase I): las piezas aprobadas de la quesería compuestas igual, pero con la cuba sin palo.
  const cheeseSmallC = () => art('p1chzS', () => completeOutline(mkc(CHZ_W, CHZ_H, (cg) => { cg.drawImage(artShelfN(0), 9, 12); cg.drawImage(vatC(), 8, 26); cg.drawImage(artFrame(36), 2, 6); cg.drawImage(artEave(40), 0, 0); cg.drawImage(artCheeseSign(), 3, 9); cg.drawImage(artMolds(), 1, 36); })));

  // ---- Estado visual (no es la economía: lo que se ve y su orden) ----
  const vis = {
    rubble: 0, strikes: 0, cart: { x: CART.home, load: 0, tilt: 0 }, falls: [], tosses: [], passes: [],
    crate: 1, crateOn: true, ready: 1, spill: 0, drip: [], drillCycle: 0,
    trays: [2, 1], hopper: [2, 2], vat: 2, curd: 0, press: [null, null], wheelOut: 0, table: 1,
    pallet: { drill: { in: [], out: [] }, refine: { in: [], out: ['bars'] }, cheese: { in: ['bars'], out: [] }, surface: { in: ['wheelL'], out: [] } },
    trolley: { refine: { x: 200, s: 'home', item: null, rope: 6, t0: 0, tx: 0, slot: 0 }, cheese: { x: 200, s: 'home', item: null, rope: 6, t0: 0, tx: 0, slot: 0 } },
    bell: {}, flick: null, flickNext: performance.now() + 9000,
    shopLots: 2, coin: -1e9, jolt: 0, flash: 0, ext: 0, extT: 0, fly: 0, flare: 0, lever: 0, oil: -1e9, valveAt: -1e9, gaugeAt: -1e9, stamp: -1e9, turnAt: -1e9, splash: -1e9,
    prevRef: 0, prevCook: 0, refStart: -1e9, cookStart: -1e9, stir: 0,
    dShown: sim.depth, dTarget: sim.depth, desc: null, motes: [], tipY: 0, marks: [], hitGlow: null, reveal: null,
  };
  const lift = { y: LAND.drill, at: 'drill', state: 'dock', from: 0, to: 0, t0: 0, ms: 1, cargo: [], dockAt: 0, busyUntil: 0 };
  let nodes = [], mice = [], selected = 'mine', ph = false, focus = null, selMouse = null, selAt = -1e9, mouseAt0 = -1e9;
  const taps = []; // toques en la escena (un aro que se abre en el punto tocado)
  const N = (st, role) => nodes.find((n) => n.st === st && n.role === role && n.crew);
  const has = (st, role) => !!N(st, role);
  function populate() {
    const bySkill = {};
    for (const m of mice) { const sk = (m.post || '').split(':')[0] || 'mining'; (bySkill[sk] ||= []).push(m); }
    const used = {}, take = (sk) => { const list = bySkill[sk] || [], k = used[sk] || 0; used[sk] = k + 1; return list[k] || null; };
    const SURFY = (st, surf) => (surf === 'F' ? LV[st].F : surf === 'G' ? GALY[st] : SCAF.y);
    const spots = [];
    for (const st of ['mine', 'drill', 'refine', 'cheese']) for (const [role, x, surf, face] of POSTS[st][STGS[st] - 1]) spots.push([st, role, x, SURFY(st, surf), face, false, surf]);
    for (const sp of SURF) spots.push([...sp.slice(0, 5), !!sp[5], 'F']);
    const main = spots.filter((sp) => !SKILL_OF[sp[1]] && sp[0] !== 'lift'), extra = spots.filter((sp) => SKILL_OF[sp[1]] || sp[0] === 'lift');
    const out = [];
    [...main, ...extra].forEach((sp, idx) => {
      const [st, role, x, feet, face, inside, surf] = sp, sk = SKILL_OF[role] || SKILL[st], m = hooks.crewAt ? hooks.crewAt(st, role) : take(sk);
      const kept = nodes.find((q) => q.m && q.m === m && q.st === st && q.role === role && q.hx === x && q.hs === feet);
      if (kept) { out.push(kept); return; }
      out.push({ key: st + ':' + role, st, role, surf, hx: x, hs: feet, hf: face, inside, m, crew: m ? crewOf(m, sk) : null, x, feet, face, q: [], item: null, react: null, walked: 0, seed: (idx + 1) * 977 + x, blinkAt: 0, px: null, py: null, act: null, inter: null, waitTag: null, socialAt: performance.now() + 4000 + idx * 600 });
    });
    nodes = out; nodes.resting = mice.filter((m) => !out.some((n) => n.m === m));
  }

  // ================= FONDO COCIDO =================
  const TIER_ROCK = {
    cheddar: ['#2b2f3a', '#3d414e', '#656a7b', '#8a90a3', '#b4bacb', '#d2d6e0'], gouda: ['#2b2f3a', '#463e3a', '#77634f', '#a08a76', '#cdb7a0', '#e1d4c6'],
    brie: ['#2b2f3a', '#4a4847', '#80786b', '#aea596', '#d9d2c4', '#e8e4dc'], emmental: ['#2b2f3a', '#41453d', '#6d7256', '#989d7c', '#c4c9a8', '#dcdfcb'],
    parmesan: ['#2b2f3a', '#483f39', '#7c644c', '#a88c70', '#d4b89a', '#e5d4c2'], blue: ['#2b2f3a', '#384053', '#5a6686', '#7f8cb0', '#aab7d6', '#ccd4e6'],
  };
  const rockOf = () => TIER_ROCK[tier] || TIER_ROCK.cheddar;
  function bake() {
    return art('p1bg:' + tier + ':' + STGS.mine + STGS.drill + STGS.refine + STGS.cheese + ':' + SURFK + (TOWN ? 'n' : 'o') + (builtSt('house') ? 'h' : '') + (builtSt('lab') ? 'l' : '') + (builtSt('sell') ? 's' : ''), () => {
      const c = document.createElement('canvas'); c.width = WW + PAD * 2; c.height = LV.mine.top + 64; const bg = c.getContext('2d'); bg.imageSmoothingEnabled = false; bg.translate(PAD, 0);
      const was = ctx; ctx = bg;
      try { paintSurfaceBG(bg); for (const k of ORDER) paintLevel(k); paintShaft(); paintEarth(); paintCrest(); }
      finally { ctx = was; }
      return c;
    });
  }
  function paintSky(x0 = -PAD, x1 = WW + PAD) {
    // El cielo y las nubes no se cuecen: los pinta vivos el MUNDO VIVO (drawSky) según la hora. Aquí, montañas y matorral.
    for (let x = x0; x < x1; x++) {
      const h1 = 34 + Math.round(Math.sin(x * 0.035 + 0.6) * 10 + Math.sin(x * 0.11 + 2) * 3), y1 = G - 16 - h1;
      R(x, y1, 1, G - y1, '#8ea6c8'); if (h1 > 40 && (G - 16 - y1) < 4 + (x % 3)) R(x, y1, 1, 2, '#e8f0f8');
      const h2 = 20 + Math.round(Math.sin(x * 0.05 + 3) * 7 + Math.sin(x * 0.17) * 2), y2 = G - 10 - h2; R(x, y2, 1, G - y2, '#6f8db2');
    }
    for (let x = x0; x < x1; x += 5) { const h = 12 + Math.floor(hash4(x, 3) * 10), cx = x + 2; for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round((k / h) * 4)); R(cx - w, G - 4 - h + k, w * 2 + 1, 1, hash4(x, k >> 2) < 0.5 ? '#2c6a3e' : '#2f7444'); } }
    for (let x = x0; x < x1; x += 7) { const h = 8 + Math.floor(hash4(x, 5) * 7), cx = x + 3; for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round((k / h) * 5)); R(cx - w, G - 1 - h + k, w * 2 + 1, 1, k < 2 ? '#3d8a4c' : '#235a32'); } }
  }
  // ================= PUEBLO COMPACTO (prueba, 28-10-2026) =================
  // La superficie de P1 tiene unos 212 px de dibujo entre el borde y el pozo. Los edificios aprobados de la revisión de arte
  // (casa 64→100, laboratorio 86, tienda 74) no caben con sus evoluciones. Aquí cada edificio tiene un SOLAR fijo y sus etapas
  // crecen hacia arriba, nunca a los lados. Se conserva su identidad aprobada (tejado de cuña de queso, entramado, puerta
  // redonda; torre de tablas con ojo de buey de cobre, cúpula de verdín y telescopio; biorreactor de cepas) redibujada más
  // estrecha. La tienda se queda tal cual: su lienzo ya es fijo (74 px) en sus seis aspectos. Un tono común (gradeCv) acerca
  // los tres al valor de la mina. OLD TOWN en las herramientas enseña el pueblo anterior con las mismas etapas.
  const LOT = { house: [0, 58], lab: [62, 50], shop: [118, SHOP_W] }; // x y ancho de cada solar (dibujo)
  let SURFK = 2, TOWN = true; // etapa de prueba del pueblo (1–4) y pueblo nuevo / anterior
  const surfStages = () => ({ house: Math.min(3, SURFK), lab: SURFK, shop: [0, 2, 4, 5][SURFK - 1] });
  function townHouse(k) {
    return art('tHouse' + k, () => {
      const c = PB(58, 66), P = P2, base = k >= 2 ? 28 : 42; // base = alero del tejado
      // Chimenea (detrás del tejado).
      const chY = k >= 2 ? 6 : 20, chH = 16;
      vol(c, 40, chY, 7, chH, P.stn, { side: 2, ao: 0 }); c.rect(39, chY - 2, 9, 2, P.stn[1]); c.hline(39, chY - 1, 9, P.stn[3]); for (let y = chY + 3; y < chY + chH; y += 3) c.hline(41, y, 5, P.stn[3]);
      // II · TRAINING ROOM: el piso de arriba, de tablas, con el muñeco de paja tras la ventana. Sube; no se ensancha.
      if (k >= 2) {
        boards(c, 7, 27, 44, 14, P.woo, 4, 'v', 7);
        c.rect(23, 31, 17, 7, P.wod[4]); c.hline(23, 31, 17, '#120a08'); for (let y = 32; y < 38; y++) if (DI(23, y)) c.px(23, y, P.wod[3]);
        c.rect(31, 33, 2, 5, P.woo[3]); c.ell(32, 34, 2.6, 2.8, (x, y) => (y < 34 ? P.str[1] : P.str[2])); c.hline(30, 34, 5, P.str[3]); c.px(32, 33, P.red[1]);
        c.rect(36, 35, 3, 3, P.irn[2]); c.hline(36, 35, 3, P.irn[1]); c.hline(22, 38, 19, P.woo[1]);
      }
      // III · el tablón de reclutas, clavado en el piso de arriba.
      if (k >= 3) { c.rect(42, 30, 8, 8, P.woo[3]); for (const [x, y, col] of [[43, 31, '#fffbea'], [46, 32, '#f4e4bc'], [44, 34, '#ffe8a0']]) { c.rect(x, y, 3, 3, col); c.px(x + 1, y, P.red[1]); } }
      // Planta baja: muros con entramado.
      vol(c, 6, 40, 46, 18, P.pla, { side: 3, ao: 2 });
      for (const x of [6, 27, 50]) { c.vline(x, 40, 18, P.woo[2]); c.vline(x + 1, 40, 18, P.woo[3]); }
      c.hline(6, 40, 46, P.woo[2]); c.hline(6, 41, 46, P.woo[3]); c.hline(6, 55, 46, P.woo[2]); c.hline(6, 56, 46, P.woo[3]);
      for (let i = 0; i < 26; i++) { const x = 9 + Math.floor(hh2(i, 1) * 40), y = 43 + Math.floor(hh2(i, 2) * 11); if (c.get(x, y) === P.pla[2]) c.px(x, y, P.pla[3]); }
      stones2(c, 4, 58, 50, 7, P.stn, 3, 4);
      // Puerta redonda (la aprobada, a escala).
      const dc = 16, ay = 50, inArch = (x, y, r) => (y >= ay && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - ay) ** 2 <= r * r && y < ay);
      c.fill((x, y) => inArch(x, y, 7.4) && y < 58, (x, y) => (hh2(x, y, 7) < 0.5 ? P.stw[1] : P.stw[2]), dc - 8, 40, dc + 9, 58);
      c.fill((x, y) => inArch(x, y, 5.5) && y < 58, (x, y) => (!inArch(x - 1, y, 5.5) || !inArch(x, y - 1, 5.5) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 6, 42, dc + 7, 58);
      for (const y of [50, 55]) { c.hline(dc - 4, y, 9, P.irn[3]); c.px(dc - 3, y, P.irn[1]).px(dc + 3, y, P.irn[1]); }
      c.rect(dc + 2, 52, 2, 2, P.gld[2]); c.px(dc + 2, 52, P.gld[0]);
      c.rect(dc - 8, 57, 17, 2, P.stn[1]); c.hline(dc - 8, 57, 17, P.stn[0]);
      // Farol, ventana redonda con luz cálida (la de las lámparas de abajo) y jardinera.
      c.vline(30, 43, 2, P.irn[3]); c.rect(29, 45, 4, 5, P.irn[3]); c.rect(30, 46, 2, 3, P.win[1]); c.px(30, 46, P.win[0]);
      const wx = 41, wy = 47;
      c.ell(wx, wy, 5, 5, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.3, 3.3, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3]));
      c.vline(wx - 1, wy - 3, 6, P.wod[3]); c.hline(wx - 3, wy, 6, P.wod[3]); c.px(wx - 2, wy - 2, P.win[0]);
      vol(c, 35, 52, 13, 3, P.woo, { side: 1, ao: 1 });
      for (let i = 0; i < 6; i++) { const x = 36 + i * 2, col = [P.red[1], P.gld[1], '#ff9ab5'][i % 3]; c.px(x, 51, P.lea[2]).px(x, 50, col).px(x + 1, 51, P.lea[1]); }
      // Tejado: la cuña de queso aprobada, más estrecha (de 58 a 58 px y con la cumbre a la izquierda, como el original).
      const ax = 17, ay2 = base - 26, face = (x, y) => inPoly(x + 0.5, y + 0.5, [[0, base], [ax, ay2], [57, base]]);
      c.fill((x, y) => face(x, y) || (y >= base && y < base + 2 && x >= 0 && x < 57), (x, y) => { if (y >= base) return y === base ? P.chz[3] : P.rnd[4]; const e1 = segDist(x + 0.5, y + 0.5, 0, base, ax, ay2), e2 = segDist(x + 0.5, y + 0.5, ax, ay2, 57, base); if (e1 < 2.2) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.2) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, 1, ay2 + 1, 54, 25); }, 0, 0, 58, base + 2);
      for (const [hx, hy, rx, ry] of [[19, 12, 2.8, 2], [30, 18, 2.4, 1.8], [11, 19, 2, 1.5], [42, 22, 2, 1.3], [25, 22.5, 1.5, 1], [18, 7, 1.3, 1]]) { const yy = hy + base - 28; c.ell(hx, yy, rx, ry, (x, y) => (y + 0.5 < yy - ry * 0.2 ? P.chz[4] : y + 0.5 < yy + ry * 0.45 ? P.chz[3] : P.chz[1])); }
      castSh(c, 8, base + 2, 42, k >= 2 ? P.woo : P.pla, 3);
      // III · buhardilla con luz, en el faldón derecho.
      if (k >= 3) {
        c.rect(27, 13, 11, 9, P.pla[2]); c.vline(27, 13, 9, P.pla[1]); c.vline(37, 13, 9, P.pla[3]); c.rect(29, 15, 7, 6, P.wod[4]); c.rect(30, 16, 5, 5, P.win[1]); c.vline(32, 16, 5, P.wod[3]); c.hline(30, 18, 5, P.wod[3]); c.px(30, 16, P.win[0]);
        c.poly([[24.5, 14], [32.5, 6], [40.5, 14], [40.5, 15], [24.5, 15]], (x, y) => (y >= 14 ? P.rnd[3] : x < 32 ? P.rnd[1] : P.rnd[2])); c.line(25, 14, 32, 7, P.rnd[0]);
      }
      closeGaps(c); c.outline();
      return c.canvas();
    });
  }
  function townLab(k) {
    return art('tLab' + k, () => {
      const c = PB(50, 82), P = P2;
      // IV · Strain Library: el archivo, un anexo bajo con faldón apoyado en la torre (dentro del solar).
      if (k >= 4) {
        boards(c, 34, 59, 13, 16, P.plb, 3, 'h', 6);
        for (let x = 33; x <= 49; x++) { const y = 54 + Math.floor((x - 33) / 4); c.px(x, y, P.woo[1]); c.px(x, y + 1, P.woo[2]); c.px(x, y + 2, P.woo[2]); c.px(x, y + 3, P.woo[3]); if ((x - 33) % 5 === 0) c.px(x, y + 1, P.woo[3]); }
        c.rect(36, 62, 9, 9, '#2a2232'); c.rect(37, 63, 7, 7, '#3e3446');
        c.hline(37, 66, 7, P.woo[2]); for (const [x, y, col] of [[38, 64, '#ffe08a'], [40, 64, '#ffc070'], [42, 64, '#f4eedc'], [38, 67, '#fff0a0'], [40, 67, '#bcd0f4']]) { c.rect(x, y, 1, 2, col); }
        c.hline(35, 71, 11, P.woo[1]); c.vline(35, 61, 11, P.woo[3]); c.vline(45, 61, 11, P.woo[3]); c.hline(35, 61, 11, P.woo[3]);
        stones2(c, 34, 75, 16, 6, P.stn, 3, 12);
      }
      // Planta baja: tablas claras, puerta a la izquierda (ahí se pone el investigador) y el ojo de buey de cobre.
      boards(c, 4, 54, 30, 21, P.plb, 3, 'h', 3);
      vol(c, 6, 61, 9, 14, P.wod, { side: 2, ao: 1 }); c.rect(8, 63, 5, 4, P.gla[2]); c.px(8, 63, P.gla[0]); c.hline(8, 67, 5, P.wod[4]); c.rect(12, 69, 2, 1, P.gld[2]);
      const ox = 27, oy = 63;
      c.ell(ox, oy, 6.4, 6.4, (x, y) => (x + y < ox + oy - 3 ? P.cop[0] : x + y < ox + oy + 4 ? P.cop[1] : P.cop[2])); c.ell(ox, oy, 4.7, 4.7, P.cop[4]); c.ell(ox, oy, 3.9, 3.9, (x, y) => (y < oy - 1 ? '#1e3a3c' : '#16302e'));
      for (const [dx, dy] of [[0, -5], [5, 0], [0, 5], [-5, 0]]) c.px(ox + dx, oy + dy, P.cop[3]);
      c.fill((x, y) => ((x + 0.5 - ox) / 2.6) ** 2 + ((y + 0.5 - oy - 1.2) / 2) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#8af0a0' : '#4ac070')); c.px(ox - 2, oy - 2, '#e8fff0');
      stones2(c, 2, 75, 34, 6, P.stn, 3, 8); c.rect(4, 75, 13, 2, P.stn[1]); c.hline(4, 75, 13, P.stn[0]);
      if (k === 1) {
        vol(c, 3, 50, 32, 4, P.stn, { side: 2, ao: 1, face: 1 }); cylv(c, 26, 39, 4, 11, P.irn, null); c.rect(25, 38, 6, 2, P.irn[1]);
      } else {
        // II · Research Assistant: segunda planta con la mesa del investigador; el serpentín baja a un matraz en el pretil.
        vol(c, 3, 51, 32, 3, P.stn, { side: 2, ao: 1, face: 1 });
        boards(c, 5, 33, 28, 18, P.plb, 3, 'h', 5);
        c.rect(9, 36, 16, 11, '#2a2232'); c.rect(10, 37, 14, 9, '#3e3446'); c.rect(11, 42, 12, 2, P.woo[2]); c.rect(12, 40, 3, 2, '#fffbea'); c.rect(19, 38, 2, 4, P.irn[2]); c.rect(18, 38, 4, 1, P.win[1]); c.px(19, 39, P.win[0]);
        c.hline(9, 47, 16, P.woo[1]); c.vline(8, 36, 12, P.woo[3]); c.vline(25, 36, 12, P.woo[3]); c.hline(8, 35, 18, P.woo[3]);
        if (k < 4) { for (let y = 34; y < 46; y++) { const x = 33 + Math.round(Math.sin(y * 0.55) * 1.2); c.px(x, y, P.gla[1]).px(x + 1, y, y % 4 < 2 ? '#7ae08a' : P.gla[2]); c.px(x - 1, y, P.gla[3]); } c.ell(34, 48.5, 3.2, 3, (x, y) => (y < 48 ? P.gla[1] : '#7ae08a')); c.px(33, 47, '#ffffff'); }
        vol(c, 3, 30, 32, 3, P.stn, { side: 2, ao: 1, face: 1 });
        if (k === 2) { cylv(c, 26, 19, 4, 11, P.irn, null); c.rect(25, 18, 6, 2, P.irn[1]); }
      }
      // III · Advanced Research: cúpula de cristal, telescopio dentro y ventana abierta (sube sobre la torre).
      if (k >= 3) {
        const inD = (x, y) => ((x + 0.5 - 19) / 14) ** 2 + ((y + 0.5 - 30) / 13) ** 2 <= 1 && y < 30;
        const inI = (x, y) => ((x + 0.5 - 19) / 12.6) ** 2 + ((y + 0.5 - 30) / 11.6) ** 2 <= 1 && y < 30;
        const open = (x, y) => x >= 25 && y < 23 && y >= 17 && inD(x, y);
        c.fill((x, y) => inI(x, y) && !open(x, y), (x, y) => { const t = y < 23 ? 0 : y < 27 ? 1 : 2, g = x < 14 ? 0 : x < 24 ? 1 : 2; return [['#6fa8b0', '#5a949e', '#4a8590'], ['#5a949e', '#4a8590', '#3f7581'], ['#3f7581', '#356874', '#2f5f6c']][t][g]; }, 4, 16, 34, 30);
        c.fill((x, y) => inD(x, y) && !inI(x, y) && !open(x, y), (x, y) => (x < 13 && y < 26 ? P.ver[0] : x < 24 ? P.ver[1] : P.ver[2]), 4, 16, 34, 30);
        for (const k2 of [-0.55, 0, 0.55]) for (let y = 18; y < 30; y++) { const b2 = (y + 0.5 - 30) / 11.6, xx = Math.round(19 + k2 * 12.6 * Math.sqrt(Math.max(0, 1 - b2 * b2)) - 0.5); if (inI(xx, y) && !open(xx, y)) c.px(xx, y, P.ver[3]); }
        for (const y of [23, 27]) c.fill((x, yy) => yy === y && inI(x, yy) && !open(x, yy), P.ver[3], 4, y, 34, y + 1);
        c.hline(10, 20, 3, '#d8f0ee'); c.hline(9, 21, 2, '#d8f0ee');
        c.fill((x, y) => segDist(x + 0.5, y + 0.5, 20, 28, 28, 20) < 1.5, (x, y) => (y + x < 48 ? BRS[1] : BRS[2]), 18, 16, 34, 30); c.rect(27, 19, 3, 3, P.irn[2]);
        for (let i = 0; i <= 6; i++) { c.px(25 + i, 16 - i, P.ver[1]); c.px(26 + i, 16 - i, '#6fa8b0'); c.px(27 + i, 16 - i, P.ver[2]); }
        c.vline(19, 8, 10, P.irn[3]); c.vline(20, 9, 8, P.irn[1]); c.rect(18, 8, 3, 2, P.irn[2]);
      }
      closeGaps(c); c.outline();
      return c.canvas();
    });
  }
  // Tono común del pueblo: cada color se acerca un poco al gris violáceo de la mina para que los edificios de arriba no salten
  // por encima del valor de los de abajo. La tinta del contorno no se toca.
  const GRADE = new WeakMap();
  function gradeCv(cv, t = 0.14, to = [86, 72, 92]) {
    if (!TOWN) return cv;
    let o = GRADE.get(cv); if (o) return o;
    o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height; const g = o.getContext('2d'); g.drawImage(cv, 0, 0);
    const im = g.getImageData(0, 0, o.width, o.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3] || (d[i] === 0x1b && d[i + 1] === 0x12 && d[i + 2] === 0x20)) continue; for (let j = 0; j < 3; j++) d[i + j] = Math.round(d[i + j] + (to[j] - d[i + j]) * t); }
    g.putImageData(im, 0, 0); GRADE.set(cv, o); return o;
  }
  // Cimiento común: un andén de piedra que recorre los tres solares y llega al castillete, con el canto de la viga de la mina.
  function townFooting(bg) {
    const x0 = -PAD, x1 = SX0 - 2;
    for (let x = x0; x < x1; x++) { R(x, G, 1, 1, P2.stn[1]); R(x, G + 1, 1, 3, P2.stn[2]); R(x, G + 4, 1, 1, P2.stn[3]); R(x, G + 5, 1, 1, INK4); }
    for (let x = x0 + ((G >> 1) % 7); x < x1; x += 7 + Math.floor(hash4(x, 11) * 4)) { R(x, G + 1, 1, 3, P2.stn[3]); if (hash4(x, 12) < 0.3) R(x + 1, G + 1, 3, 1, P2.stn[1]); }
    for (let x = x0; x < x1; x++) if (hash4(x, 13) < 0.22) R(x, G - 1, 1, 1, hash4(x, 14) < 0.5 ? '#3d8a4c' : '#2f7444'); // hierba que asoma por el borde
  }
  // ================= MUNDO VIVO (28-10-2026) =================
  // El exterior sigue la hora del jugador: mañana, día, tarde dorada, anochecer y noche, con el amanecer y el ocaso de su zona
  // y de la estación del año (sale de la zona horaria del móvil; si no se reconoce, Europa). De noche hay estrellas y luna y
  // se encienden las ventanas; las nubes pasan despacio. La mina no tiene cielo: sus lámparas respiran, cada una a su ritmo, y
  // alguna parpadea un instante. Todo es lento y nada se acelera con el acelerón. Se configura en MENU (automático o una hora
  // fija) y no toca la partida.
  const SKY_KEYS = {
    day: ['#3f8ddc', '#4796e0', '#509fe4', '#5aa8e8', '#66b2ec', '#74bcef', '#84c6f1', '#96cff2', '#a8d8f2'],
    dawn: ['#2c3a6e', '#4a4f86', '#76609a', '#a8709e', '#d8869a', '#f0a08e', '#f8bc8a', '#fbd29a', '#fde2b0'],
    golden: ['#3a6ec0', '#5a86c8', '#7e9ccc', '#a8b0c4', '#d0b8a8', '#ecbc8c', '#f6c47e', '#fbd08a', '#fde0a8'],
    dusk: ['#1c1f4a', '#2c2a5e', '#46356e', '#6a3f78', '#94487a', '#c05a72', '#e07a6a', '#f0a070', '#f6c088'],
    night: ['#070a1c', '#0a0f26', '#0e1530', '#121b3a', '#162144', '#1a284e', '#1f2f58', '#243660', '#2a3d66'],
  };
  // Luz sobre el exterior (se multiplica sobre edificios, ratones y montañas): [color, intensidad].
  const SKY_LIGHT = { day: ['#ffffff', 0], dawn: ['#d8a0b8', 0.28], golden: ['#ffd6a0', 0.24], dusk: ['#8a72b0', 0.36], night: ['#4a5aa4', 0.46] }; // noche azul pero legible
  // Zonas horarias conocidas → [latitud, longitud]. Lo demás se estima por el continente; si no hay nada, Madrid (Europa).
  const TZ = { 'Europe/Madrid': [40.4, -3.7], 'Atlantic/Canary': [28.1, -15.4], 'Europe/Lisbon': [38.7, -9.1], 'Europe/London': [51.5, -0.1], 'Europe/Dublin': [53.3, -6.3], 'Europe/Paris': [48.9, 2.35], 'Europe/Brussels': [50.8, 4.35], 'Europe/Amsterdam': [52.4, 4.9], 'Europe/Berlin': [52.5, 13.4], 'Europe/Zurich': [47.4, 8.5], 'Europe/Rome': [41.9, 12.5], 'Europe/Vienna': [48.2, 16.4], 'Europe/Warsaw': [52.2, 21], 'Europe/Prague': [50.1, 14.4], 'Europe/Stockholm': [59.3, 18.1], 'Europe/Oslo': [59.9, 10.8], 'Europe/Copenhagen': [55.7, 12.6], 'Europe/Helsinki': [60.2, 24.9], 'Europe/Athens': [38, 23.7], 'Europe/Istanbul': [41, 29], 'Europe/Kyiv': [50.5, 30.5], 'Europe/Moscow': [55.8, 37.6], 'America/New_York': [40.7, -74], 'America/Chicago': [41.9, -87.6], 'America/Denver': [39.7, -105], 'America/Los_Angeles': [34, -118.2], 'America/Mexico_City': [19.4, -99.1], 'America/Bogota': [4.7, -74.1], 'America/Lima': [-12, -77], 'America/Santiago': [-33.4, -70.6], 'America/Sao_Paulo': [-23.5, -46.6], 'America/Argentina/Buenos_Aires': [-34.6, -58.4], 'Asia/Tokyo': [35.7, 139.7], 'Asia/Seoul': [37.6, 127], 'Asia/Shanghai': [31.2, 121.5], 'Asia/Kolkata': [22.6, 88.4], 'Asia/Dubai': [25.2, 55.3], 'Asia/Singapore': [1.35, 103.8], 'Australia/Sydney': [-33.9, 151.2], 'Australia/Perth': [-31.95, 115.9], 'Pacific/Auckland': [-36.8, 174.8], 'Africa/Johannesburg': [-26.2, 28], 'Africa/Cairo': [30, 31.2], 'Africa/Lagos': [6.5, 3.4] };
  const LAT_BY = { Europe: 48, Atlantic: 35, America: 35, Asia: 30, Africa: 5, Australia: -30, Pacific: -15, Indian: -10, Antarctica: -75 };
  let SKYCFG = { mode: 'auto', hour: 12 };
  try { const c = JSON.parse(localStorage.getItem('p1-sky') || 'null'); if (c && c.mode) SKYCFG = c; } catch (e) {}
  function region() {
    let tz = 'Europe/Madrid'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch (e) {}
    if (TZ[tz]) return { tz, lat: TZ[tz][0], lon: TZ[tz][1], known: true };
    const std = -Math.max(new Date(2026, 0, 1).getTimezoneOffset(), new Date(2026, 6, 1).getTimezoneOffset()) / 60; // hora estándar (sin verano)
    const cont = tz.split('/')[0]; if (LAT_BY[cont] == null) return { tz: 'Europe/Madrid', lat: 40.4, lon: -3.7, known: false };
    return { tz, lat: LAT_BY[cont], lon: std * 15, known: false };
  }
  let REG = region();
  // Salida y puesta del sol (hora del reloj del móvil) para la latitud y el día del año: declinación solar y ángulo horario.
  function sunTimes(d = new Date()) {
    const N = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), dec = (23.44 * Math.PI / 180) * Math.sin((2 * Math.PI * (284 + N)) / 365), la = REG.lat * Math.PI / 180;
    const c = Math.max(-1, Math.min(1, -Math.tan(la) * Math.tan(dec))), day = (2 * Math.acos(c) * 180) / Math.PI / 15;
    const noon = 12 + -d.getTimezoneOffset() / 60 - REG.lon / 15;
    return { rise: noon - day / 2, set: noon + day / 2, noon };
  }
  const clockHour = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; };
  // Claves del día alrededor de la salida y la puesta; entre clave y clave, mezcla lineal.
  let skyMemo = { t: -1e9 };
  function skyState(now) {
    if (now - skyMemo.t < (SKYCFG.mode === 'fast' ? 60 : 1000) && skyMemo.cfg === SKYCFG) return skyMemo;
    const st = sunTimes(), h = SKYCFG.mode === 'auto' ? clockHour() : SKYCFG.mode === 'fast' ? (SKYCFG.hour + (performance.now() - SKYCFG.t0) / 2000) % 24 : SKYCFG.hour, r = st.rise, ss = st.set;
    const K = [[r - 1.2, 'night'], [r - 0.3, 'dawn'], [r + 0.9, 'day'], [ss - 1.6, 'day'], [ss - 0.4, 'golden'], [ss + 0.35, 'dusk'], [ss + 1.2, 'night']];
    let hh = h; while (hh < K[0][0]) hh += 24; while (hh >= K[0][0] + 24) hh -= 24;
    let a = K[K.length - 1], b = K[0], k = 0;
    for (let i = 0; i < K.length - 1; i++) if (hh >= K[i][0] && hh < K[i + 1][0]) { a = K[i]; b = K[i + 1]; k = (hh - a[0]) / (b[0] - a[0]); }
    if (hh >= K[K.length - 1][0]) { a = K[K.length - 1]; b = [K[0][0] + 24, 'night']; k = 0; }
    const mix = (A, B) => A.map((c, i) => mixc(c, B[i], k)), w = {}; for (const n of Object.keys(SKY_KEYS)) w[n] = 0; w[a[1]] += 1 - k; w[b[1]] += k;
    const la = SKY_LIGHT[a[1]], lb = SKY_LIGHT[b[1]];
    skyMemo = { t: now, cfg: SKYCFG, h, rise: r, set: ss, sky: mix(SKY_KEYS[a[1]], SKY_KEYS[b[1]]), light: [mixc(la[0], lb[0], k), la[1] + (lb[1] - la[1]) * k], night: Math.min(1, w.night + 0.65 * w.dusk + 0.35 * w.dawn), stars: Math.min(1, w.night + 0.35 * w.dusk), phase: (1 - k) >= k ? a[1] : b[1] };
    return skyMemo;
  }
  // Nubes en dos capas: las de atrás, finas y lentas; las de delante, más grandes y algo más rápidas (px por segundo).
  const CLOUDS = [[20, 22, 18, 2.2, 0], [150, 16, 22, 1.8, 0], [-40, 26, 16, 2.6, 0], [90, 10, 30, 4.6, 1], [230, 14, 26, 5.4, 1], [-10, 6, 34, 4.2, 1]];
  // Lo que se ve del cielo queda bajo el marcador (y < 5) y entre los tejados (y < 16, el punto más alto de los edificios).
  const SKY_SAFE = 16;
  const CLOUDS_ALL = [0, 1, 2].flatMap((k) => CLOUDS.map(([x, y, w, sp, f]) => [x + k * 470, y - [0, 90, 190][k], w, sp, f]));
  function drawSky(now) {
    const S = skyState(now), top = G - 400, bh = Math.ceil((G - top) / 9);
    S.sky.forEach((col, i) => R(-1200, top + i * bh, 3600, bh + 1, col));
    // Estrellas bajas (cerca del horizonte, detrás de los edificios): más tenues, la luz de la noche las apaga un poco.
    if (S.stars > 0.02) for (let i = 0; i < 160; i++) { const x = -PAD + Math.floor(hash4(i, 1, 34) * 1400), y = SKY_SAFE + Math.floor(hash4(i, 2, 34) * 34), tw = 0.6 + 0.4 * Math.sin(now / (1100 + (i % 5) * 300) + i); ctx.globalAlpha = S.stars * tw; R(x, y, 1, 1, '#ffffff'); }
    ctx.globalAlpha = 1;
    const span = 1400, cn = 0.75 * S.night;
    for (const [cx0, cy, w, sp, front] of CLOUDS_ALL) {
      const c1 = mixc(front ? '#ffffff' : '#eef6fc', S.sky[4], cn), c0 = mixc(front ? '#e4f2fb' : '#dceaf6', S.sky[3], cn), c2 = mixc('#cfe6f6', S.sky[2], cn);
      const cx = ((cx0 + PAD + 45 + (now / 1000) * sp) % span) - PAD - 45;
      if (!front) { R(Math.round(cx - w / 2), cy, w, 2, c0); R(Math.round(cx - w / 2 + 3), cy - 1, w - 8, 1, c1); continue; }
      for (let k = 0; k < 3; k++) { const ww = w - k * 6, xx = Math.round(cx - ww / 2 + k * 2); R(xx, cy - k * 2, ww, 3, k ? c1 : c0); } R(Math.round(cx - w / 2 + 2), cy + 3, w - 4, 1, c2);
    }
  }
  // La luz del momento sobre todo el exterior, cielo incluido (sus colores ya cuentan con ella), multiplicada: de noche, azul
  // y oscuro; al atardecer, dorado.
  // La luz del momento solo sobre lo pintado: el cielo ya no está en este lienzo.
  let lightC = null;
  function skyLight(now) {
    const S = skyState(now); if (S.light[1] <= 0.01) return;
    if (!lightC) lightC = document.createElement('canvas'); if (lightC.width !== canvas.width || lightC.height !== canvas.height) { lightC.width = canvas.width; lightC.height = canvas.height; }
    const q = lightC.getContext('2d'), yMax = (G + 6 - cam.y) * s * dpr; q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, lightC.width, lightC.height); q.fillStyle = S.light[0]; q.fillRect(0, 0, lightC.width, Math.max(0, yMax)); q.globalCompositeOperation = 'destination-in'; q.drawImage(canvas, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = S.light[1]; ctx.drawImage(lightC, 0, 0); ctx.restore();
  }
  // El fondo de la colonia, en su propio lienzo. Cada escena dice dónde tiene su suelo y por dónde va en la calle (shift); el fondo se mueve más despacio que ellas.
  let farC = null;
  function farStrip() { if (farC) return farC; const c = document.createElement('canvas'); c.width = 2600; c.height = 90; const q = c.getContext('2d'), was = ctx; q.translate(1000, 80 - G); ctx = q; try { paintSky(-1000, 1600); } finally { ctx = was; } farC = c; return c; }
  function drawFar(fc, o) {
    const dprNow = window.devicePixelRatio || 1, w = Math.round(Wc * dprNow), h = Math.round(Hc * dprNow); if (fc.width !== w || fc.height !== h) { fc.width = w; fc.height = h; }
    const q = fc.getContext('2d'), S = skyState(o.now), kd = d0 * (o.zoom || 1), cx = (E0 + E1) / 2 - w / (2 * kd) + o.shift, cy = G - (o.ground * dprNow) / kd;
    q.setTransform(1, 0, 0, 1, 0, 0); q.imageSmoothingEnabled = false; q.fillStyle = S.sky[0]; q.fillRect(0, 0, w, h); q.setTransform(kd, 0, 0, kd, Math.round(-cx * kd), Math.round(-cy * kd));
    const was = ctx; ctx = q; try { drawSky(o.now); q.fillStyle = '#235a32'; q.fillRect(-1200, G - 1, 3600, 2000); q.drawImage(farStrip(), -1000, G - 80);  if (S.light[1] > 0.01) { q.save(); q.globalCompositeOperation = 'multiply'; q.globalAlpha = S.light[1]; q.fillStyle = S.light[0]; q.fillRect(cx - 2, cy - 2, w / kd + 4, h / kd + 4); q.restore(); } nightSky(o.now); } finally { ctx = was; }
  }
  // La tierra de la colonia más allá del borde derecho de MAIN, con sus mismos dibujos: superficie, tierra, vigas que acaban en la tierra y roca.
  // Hasta el borde (GX0..E) es copia exacta de MAIN; desde ahí, sus pinceles siguen (la tierra y la hierba son continuas en x) y la roca es su textura reflejada.
  const GX0 = WW + PAD - 56, GX1 = WW + PAD + 820;
  let gStrip = null, gTint = null;
  function earthInto(D, w, ox, oy, x0, y0, ww, hh, seed) {
    const P = EARTH.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]), put = (x, y, t) => { const q = ((y - oy) * w + (x - ox)) * 4, c = P[t]; D[q] = c[0]; D[q + 1] = c[1]; D[q + 2] = c[2]; D[q + 3] = 255; };
    for (let y = y0; y < y0 + hh; y++) for (let x = x0; x < x0 + ww; x++) put(x, y, hash4(x >> 1, y >> 1, seed) < 0.18 ? 1 : 2);
    for (let i = 0; i < (ww * hh) / 40; i++) {
      const cx = x0 + Math.floor(hash4(i, seed, 1) * ww), cy = y0 + Math.floor(hash4(i, seed, 2) * hh), rx = 2 + Math.floor(hash4(i, seed, 3) * 3), ry = rx - 1 + Math.floor(hash4(i, seed, 4) * 2);
      for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { if ((xx * xx) / (rx * rx) + (yy * yy) / (ry * ry) > 1) continue; const px = cx + xx, py = cy + yy; if (px < x0 || px >= x0 + ww || py < y0 || py >= y0 + hh) continue; put(px, py, xx + yy < -rx + 1 ? 5 : xx + yy > rx - 1 ? 3 : 4); }
      if (cy + ry + 1 < y0 + hh) for (let x = cx - rx + 1; x < cx + rx; x++) if (x >= x0 && x < x0 + ww) put(x, cy + ry + 1, 0);
    }
  }
  function groundStrip() {
    const bk = bake(), top = ROCK_TOP(), H = Hw(), s0 = texYAt(top), key = tier + ':' + s0 + ':' + H + ':' + MO;
    if (gStrip && gStrip.bk === bk && gStrip.key === key) return gStrip;
    const y0 = G - 90, E = WW + PAD, w = GX1 - GX0, h = H - y0, c = document.createElement('canvas'); c.width = w; c.height = h;
    const q = c.getContext('2d'); q.imageSmoothingEnabled = false; q.translate(-GX0, -y0);
    const was = ctx; ctx = q;
    try {
      const tex = strataTex(), TW = WW + PAD * 2, F = LV.mine.F + MO;
      q.drawImage(tex, GX0 + PAD, s0, E - GX0, H - top, GX0, top, E - GX0, H - top);
      for (let x = E, k = 0; x < GX1; x += TW, k++) { q.save(); if (k % 2 === 0) { q.translate(x + TW, top); q.scale(-1, 1); } else q.translate(x, top); q.drawImage(tex, 0, s0, TW, H - top, 0, 0, TW, H - top); q.restore(); }
      for (let k = 0; k < 10; k++) { ctx.globalAlpha = 0.11 * (1 - k / 10); R(GX0, top + k * 8, w, 8, '#ffe0b0'); }
      for (let y = top; y < H; y += 4) { const a1 = Math.min(1, (y - top) / Math.max(80, F - top)) * 0.4, a2 = y > F ? Math.pow((y - F) / (H - F), 1.2) * 0.56 : 0; ctx.globalAlpha = Math.min(0.95, a1 + a2); R(GX0, y, w, 4, '#06050a'); }
      ctx.globalAlpha = 1;
      // La tierra de los tres niveles y la cresta sobre la roca, en un solo paso de píxeles.
      const ex = E, ew = GX1 - E, ey = G + 6, eh = top - ey, et = document.createElement('canvas'); et.width = ew; et.height = eh + 40; const eg = et.getContext('2d'), im = eg.createImageData(ew, eh + 40);
      for (const k of ['cheese', 'refine', 'drill']) { const lv = LV[k]; earthInto(im.data, ew, ex, ey, ex, lv.top, ew, LH, 13 + lv.y0); }
      earthInto(im.data, ew, ex, ey, ex, LV.mine.top, ew, BEAM, 13 + LV.mine.top);
      const cyEnd = crestY(E - 1); eg.putImageData(im, 0, 0); q.drawImage(et, ex, ey);
      for (let x = ex; x < GX1; x++) { const cy = cyEnd - (hash4(x >> 3, 31) < 0.35 ? 1 : 0) - (hash4(x >> 4, 32) < 0.2 ? 1 : 0), P = TIER_ROCK.cheddar; for (let y = top; y < cy; y++) R(x, y, 1, 1, EARTH[hash4(x >> 1, y >> 1, 41) < 0.2 ? 1 : 2]); R(x, cy - 1, 1, 1, EARTH[0]); R(x, cy, 1, 1, INK4); R(x, cy + 1, 1, 1, P[5]); R(x, cy + 2, 1, 1, P[4]); R(x, cy + 3, 1, 1, hash4(x, 33) < 0.5 ? P[4] : P[3]); }
      // Las vigas de los niveles entran en la tierra y acaban.
      for (const k of ORDER) { const lv = LV[k]; beamH(E - 8, E + 7, lv.top, BEAM, lv.top); R(E + 7, lv.top, 1, BEAM, W5[0]); R(E + 6, lv.top + 1, 1, BEAM - 2, W5[1]); }
      for (let x = E; x < GX1; x++) { R(x, G, 1, 6, EARTH[2]); R(x, G, 1, 3, '#3f9a3a'); R(x, G, 1, 1, '#6cc44e'); if (hash4(x, 2) < 0.3) R(x, G - 1, 1, 1, '#4fae40'); R(x, G + 3, 1, 1, '#2a6a2a'); }
      q.drawImage(bk, GX0 + PAD, y0, E - GX0, bk.height - y0, GX0, y0, E - GX0, bk.height - y0);
    } finally { ctx = was; }
    gStrip = { c, bk, key, x0: GX0, y0 }; gTint = null; return gStrip;
  }
  // segs: tramos de la pantalla, cada uno con su correspondencia: kd = píxeles del móvil por píxel del dibujo, gx = x del mundo en el borde izquierdo, gy = y en pantalla (px del móvil) del suelo.
  function drawGround(gc, o) {
    const dprNow = window.devicePixelRatio || 1, w = Math.round(Wc * dprNow), h = Math.round(Hc * dprNow); if (gc.width !== w || gc.height !== h) { gc.width = w; gc.height = h; }
    const S = groundStrip(), L = skyState(o.now), q = gc.getContext('2d'); let img = S.c;
    if (L.light[1] > 0.01) {
      const lk = L.light.join(); if (!gTint || gTint.key !== lk) { const t = document.createElement('canvas'); t.width = S.c.width; t.height = 96; const tq = t.getContext('2d'); tq.drawImage(S.c, 0, 0); tq.globalCompositeOperation = 'multiply'; tq.globalAlpha = L.light[1]; tq.fillStyle = L.light[0]; tq.fillRect(0, 0, t.width, 96); tq.globalAlpha = 1; tq.globalCompositeOperation = 'destination-in'; tq.drawImage(S.c, 0, 0); gTint = { key: lk, c: t }; }
    }
    q.setTransform(1, 0, 0, 1, 0, 0); q.imageSmoothingEnabled = false; q.clearRect(0, 0, w, h);
    for (const sg of o.segs) {
      if (sg.x1 <= sg.x0) continue;
      q.save(); q.beginPath(); q.rect(Math.round(sg.x0), 0, Math.round(sg.x1 - sg.x0), h); q.clip();
      q.setTransform(sg.kd, 0, 0, sg.kd, Math.round(-sg.gx * sg.kd), Math.round(sg.gy - G * sg.kd)); q.drawImage(S.c, S.x0, S.y0);
      if (L.light[1] > 0.01 && gTint) q.drawImage(gTint.c, S.x0, S.y0);
      q.restore();
    }
  }
  // La luna con su fase real (la de hoy en el mundo; luna nueva de referencia: 6-1-2000 18:14 UTC) y las estrellas altas.
  // Se pintan después de la luz de la noche, para que brillen, y solo en la franja alta del cielo, donde no hay edificios.
  const moonPhase = (d = Date.now()) => ((((d - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) / 29.530588853) % 1 + 1) % 1;
  function nightSky(now) {
    const S = skyState(now); if (S.stars < 0.02) return;
    for (let i = 0; i < 240; i++) { const x = -PAD + Math.floor(hash4(i, 1, 33) * 1400), y = -320 + Math.floor(hash4(i, 2, 33) * (SKY_SAFE + 320)), tw = 0.5 + 0.5 * Math.sin(now / (900 + (i % 7) * 260) + i); ctx.globalAlpha = S.stars * tw; R(x, y, 1, 1, i % 9 === 0 ? '#fff2c8' : '#e8ecff'); if (i % 8 === 0 && tw > 0.9) { ctx.globalAlpha *= 0.6; R(x - 1, y, 3, 1, '#c8d0ff'); R(x, y - 1, 1, 3, '#c8d0ff'); } }
    ctx.globalAlpha = 1;
    // Estrella fugaz, muy de vez en cuando: un trazo que cruza y se apaga.
    if (LIFE.star && now - LIFE.star.t0 < 700) { const k = (now - LIFE.star.t0) / 700, x = LIFE.star.x + k * 60, y = LIFE.star.y + k * 16; for (let q = 0; q < 10; q++) { ctx.globalAlpha = S.stars * (1 - k) * (1 - q / 10); R(Math.round(x - q * 2), Math.round(y - q * 0.55), 1, 1, q ? '#c8d0ff' : '#ffffff'); } ctx.globalAlpha = 1; }
    // La luna: cruza la franja alta del cielo a lo largo de la noche. 11 px de diámetro, con dos cráteres y su fase.
    const nl = 24 - (S.set - S.rise), kk = ((S.h - S.set + 24) % 24) / Math.max(1, nl); if (kk < 0 || kk > 1) return;
    const mx = Math.round(4 + kk * 186), my = Math.round(8 + Math.pow(kk * 2 - 1, 2) * 3), r = 5, ph = moonPhase(), kc = Math.cos(2 * Math.PI * ph), wax = ph < 0.5;
    glowH(mx, my, 9, '#cdd6ff', 0.16 * S.stars);
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r + 1) continue; const w = Math.sqrt(Math.max(0, r * r - y * y)), lit = wax ? x > kc * w - 0.5 : x < -kc * w + 0.5;
      ctx.globalAlpha = S.stars * (lit ? 1 : 0.22);
      R(mx + x, my + y, 1, 1, !lit ? '#3a4470' : (x - 1) * (x - 1) + (y + 1) * (y + 1) <= 2 || (x + 2) * (x + 2) + (y - 2) * (y - 2) <= 1 ? '#d6d0b4' : x + y > 3 ? '#e4dec4' : '#f6f2dc');
    }
    ctx.globalAlpha = 1;
  }
  // De noche se encienden las ventanas y los faroles: el cristal con su luz y un halo pequeño, uno por edificio (no se pisan).
  // Van después de la luz de la noche y antes de los ratones de fuera, que pasan por delante.
  function townLights(now) {
    const S = skyState(now), n = S.night; if (n < 0.05 || !TOWN) return;
    const H = LOT.house[0], HY = G - 65, Lx = LOT.lab[0], LY = G - 81, k = surfStages(), fl = (i) => 0.88 + 0.12 * Math.sin(now / (520 + i * 90) + i * 1.7);
    const win = (x, y, w, h, i, col = '#ffd890') => { ctx.globalAlpha = n * 0.9 * fl(i); R(x, y, w, h, col); R(x, y, w, 1, '#fff2c0'); ctx.globalAlpha = 1; };
    if (builtSt('house')) { glowH(H + 36, HY + 46, 10, '#ffb860', 0.22 * n * fl(1)); win(H + 39, HY + 45, 5, 5, 1); win(H + 30, HY + 46, 2, 3, 2, '#fff2b0'); }
    if (builtSt('house')) { if (k.house >= 2) win(H + 24, HY + 32, 15, 5, 3, '#ffcf7a'); }
    if (builtSt('house')) { if (k.house >= 3) win(H + 30, HY + 16, 5, 5, 4); }
    if (builtSt('lab')) { glowH(Lx + 17, LY + 41, 9, '#ffc880', 0.18 * n * fl(6)); if (k.lab >= 2) win(Lx + 10, LY + 37, 14, 3, 6, '#ffe0a0'); }
    if (builtSt('sell')) { glowH(LOT.shop[0] + 40, G - 28, 11, '#ffc070', 0.24 * n * fl(7)); }
    // Dos farolillos colgados de los extremos del toldo del puesto.
    if (builtSt('sell')) { for (const ox of [5, 67]) { const lx = LOT.shop[0] + ox, ly = G - 36; R(lx + 1, ly - 3, 1, 3, '#2a2230'); R(lx, ly, 3, 4, INK4); ctx.globalAlpha = 0.45 + 0.55 * n; R(lx + 1, ly + 1, 1, 2, '#ffd860'); ctx.globalAlpha = 1; glowH(lx + 1, ly + 2, 6, '#ffd890', 0.32 * n * fl(9 + ox)); } }
    // Farol colgado del castillete, con su luz.
    const fx = 205, fy = G - 47; R(fx + 1, fy - 3, 1, 3, '#2a2230'); R(fx, fy, 3, 4, INK4); ctx.globalAlpha = 0.4 + 0.6 * n; R(fx + 1, fy + 1, 1, 2, '#ffd860'); ctx.globalAlpha = 1; glowH(fx + 1, fy + 2, 7, '#ffd890', 0.3 * n * fl(8));
  }
  // Charcos de luz cálida al pie de faroles y puertas (encima de todo lo de fuera, aclarando): quien pasa por ahí se ve.
  function lightPools(now) {
    const S = skyState(now), n = S.night; if (n < 0.05 || !TOWN) return;
    // [x, suelo, radio]: elipses macizas en el suelo (fila a fila, sin huecos), con tres anillos de luz.
    const pools = [...(builtSt('house') ? [[LOT.house[0] + 30, G, 20]] : []), ...(builtSt('lab') ? [[LOT.lab[0] + 12, G, 14]] : []), ...(builtSt('sell') ? [[LOT.shop[0] + 6, G, 15], [LOT.shop[0] + 68, G, 15]] : []), [206, G - 34, 12]];
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = '#ffa850';
    pools.forEach(([x, y, r], i) => { const f = 0.9 + 0.1 * Math.sin(now / (600 + i * 110) + i); for (const [rx, a] of [[r, 0.1], [Math.round(r * 0.66), 0.12], [Math.round(r * 0.36), 0.14]]) { const ry = Math.max(2, Math.round(rx * 0.35)); ctx.globalAlpha = a * n * f; for (let dy = -ry; dy <= 1; dy++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry)))); ctx.fillRect(x - w, y + dy, w * 2 + 1, 1); } } });
    ctx.restore();
  }
  // Los ratones de fuera, con la luz del momento (se pintan después de las ventanas, que quedan detrás de ellos).
  const NIGHTC = new WeakMap();
  function litSprite(src) {
    const L0 = skyState(performance.now()).light, L = [L0[0], L0[1] * 0.7]; if (L[1] <= 0.01) return src; // los ratones, algo más claros: se leen
    const q = (h) => '#' + [1, 3, 5].map((i) => (Math.round(parseInt(h.slice(i, i + 2), 16) / 24) * 24).toString(16).padStart(2, '0').slice(-2)).join(''), key = q(L[0]) + Math.round(L[1] * 20);
    let m = NIGHTC.get(src); if (!m) NIGHTC.set(src, (m = {})); if (m[key]) return m[key];
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = Math.round(L[1] * 20) / 20; x.fillStyle = q(L[0]); x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.globalAlpha = 1; x.drawImage(src, 0, 0);
    return (m[key] = c);
  }
  const isOutside = (n) => n.st === 'sell' || n.st === 'lab' || n.role === 'winch';
  // VIDA DE FUERA (sin abrumar, con tope): de día, una bandada de 2–3 pájaros cruza de vez en cuando y una mariposa ronda el
  // matorral; al anochecer salen luciérnagas sobre la hierba; de noche, dos polillas rondan el farol del puesto y, muy de
  // vez en cuando, cae una estrella fugaz. Todo pequeño, lento y sin contorno.
  const LIFE = { birds: null, nextBirds: performance.now() + 9000, star: null, nextStar: performance.now() + 30000, fireflies: [] };
  function lifeTick(now) {
    const S = skyState(now), day = 1 - S.night;
    if (!LIFE.birds && now > LIFE.nextBirds && day > 0.6) { const dir = Math.random() < 0.5 ? 1 : -1, n = 2 + (Math.random() < 0.5 ? 1 : 0); LIFE.birds = { t0: now, dir, y: 4 + Math.random() * 10, n, ms: 9000 + Math.random() * 4000 }; }
    if (LIFE.birds && now - LIFE.birds.t0 > LIFE.birds.ms) { LIFE.birds = null; LIFE.nextBirds = now + 40000 + Math.random() * 50000; }
    if (S.stars > 0.7 && now > LIFE.nextStar) { LIFE.star = { t0: now, x: -20 + Math.random() * 160, y: -24 + Math.random() * 10 }; LIFE.nextStar = now + 50000 + Math.random() * 70000; }
    const want = S.night > 0.35 ? 6 : 0;
    while (LIFE.fireflies.length < want) LIFE.fireflies.push({ x: -10 + Math.random() * 215, y: G - 4 - Math.random() * 12, ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 0.6 });
    if (LIFE.fireflies.length > want) LIFE.fireflies.length = want;
  }
  function drawLife(now) {
    const S = skyState(now), day = 1 - S.night;
    if (LIFE.birds) { const B = LIFE.birds, k = (now - B.t0) / B.ms, span = WW + PAD * 2 + 40, x0 = B.dir > 0 ? -PAD - 20 + k * span : WW + PAD + 20 - k * span;
      for (let i = 0; i < B.n; i++) { const x = Math.round(x0 - B.dir * i * 9), y = Math.round(B.y + (i % 2) * 4 + Math.sin(now / 600 + i) * 1.5), up = Math.floor((now + i * 130) / 160) % 2; ctx.globalAlpha = Math.min(1, day * 1.3); R(x - 2, y + (up ? 0 : 1), 2, 1, '#2f3448'); R(x, y + 1, 1, 1, '#2f3448'); R(x + 1, y + (up ? 0 : 1), 2, 1, '#2f3448'); ctx.globalAlpha = 1; } }
    // Mariposa: de día, revolotea sobre el matorral entre la casa y el laboratorio.
    if (day > 0.6) { const t = now / 1000, x = Math.round(54 + Math.sin(t * 0.7) * 14 + Math.sin(t * 2.3) * 3), y = Math.round(G - 14 + Math.sin(t * 1.9) * 4), f = Math.floor(now / 140) % 2; ctx.globalAlpha = day; R(x, y, 1, 1, '#4a3a2a'); R(x - 1, y - (f ? 1 : 0), 1, f ? 2 : 1, '#ffd84a'); R(x + 1, y - (f ? 1 : 0), 1, f ? 2 : 1, '#ffb347'); ctx.globalAlpha = 1; }
    // Luciérnagas: se encienden y se apagan despacio, cada una a su ritmo, sobre la hierba.
    for (const f of LIFE.fireflies) { const t = now / 1000 * f.sp, x = Math.round(f.x + Math.sin(t + f.ph) * 8), y = Math.round(f.y + Math.sin(t * 1.3 + f.ph * 2) * 3), b = Math.max(0, Math.sin(t * 2 + f.ph)); if (b < 0.15) continue; glowH(x, y, 3, '#d8ff7a', 0.5 * S.night * b); ctx.globalAlpha = S.night * b; R(x, y, 1, 1, '#f0ffb0'); ctx.globalAlpha = 1; }
    // Polillas en el farol del puesto.
    if (S.night > 0.5 && TOWN && builtSt('sell')) for (let i = 0; i < 2; i++) { const t = now / 1000 * (1.6 + i * 0.5) + i * 2, x = Math.round(LOT.shop[0] + 40 + Math.cos(t) * (5 + i * 2)), y = Math.round(G - 30 + Math.sin(t * 1.7) * 3); ctx.globalAlpha = S.night * 0.8; R(x, y, 1, 1, '#e8e0d0'); ctx.globalAlpha = 1; }
  }
  // Lámparas (todas: las de cada nivel, las de la cámara de MINE y las del pozo): un halo pequeño en el farol y un cono de luz
  // que cae hacia el suelo, los dos respirando despacio, cada lámpara a su ritmo; de vez en cuando una parpadea un instante.
  const LAMPFL = {};
  function lampGlow(key, lx, by, now, cone = 26) {
    let f = LAMPFL[key]; if (!f) f = LAMPFL[key] = { next: now + 6000 + hash4(lx, by) * 30000, t: -1e9 };
    if (now > f.next || (LIFE.flick && LIFE.flick > f.t && now - LIFE.flick < 50)) { f.t = now; f.next = now + 18000 + Math.random() * 26000; }
    const ft = now - f.t, dip = ft < 420 ? (Math.floor(ft / 70) % 2 ? 0.3 : 0.9) : 1;
    const br = (0.85 + 0.15 * Math.sin(now / (1500 + (Math.abs(lx) % 7) * 260) + lx * 0.7)) * dip, cx = lx + 1, cy = by + 3;
    // cono: filas cada vez más anchas y más tenues
    for (let r = 4; r < cone; r += 2) { const w = 3 + Math.round(r * 0.55); ctx.globalAlpha = 0.1 * br * (1 - r / cone); R(cx - w, cy + r, w * 2 + 1, 2, '#ffd890'); }
    ctx.globalAlpha = 1;
    glowH(cx, cy, 8 + Math.round(2 * br), '#ffd890', 0.3 * br);
    if (dip < 0.5) R(lx - 1, by + 1, 5, 4, '#8a7650'); // la bombilla se apaga en el parpadeo
  }
  function paintSurfaceBG(bg) {
    for (const [x, big] of [[-24, 1], [-40, 0], [244, 1], [262, 0]]) { const tr = tree(big).canvas(); bg.drawImage(tr, x, G - tr.height + 2); }
    const put = (cv, x, base) => { groundShadow(bg, x, base, cv.width); bg.drawImage(cv, x, base - cv.height + 1); };
    const S = surfStages();
    if (TOWN) { if (builtSt('house')) put(gradeCv(townHouse(S.house)), LOT.house[0], G); if (builtSt('sell')) bg.drawImage(gradeCv(shopBack(S.shop)), LOT.shop[0], G - SHOP_H + 1); }
    else { put(labV2(S.lab), 52, G - 1); put(houseStage(S.house), -6, G + 1); bg.drawImage(bush(1).canvas(), 78, G - 7); bg.drawImage(shopBack(S.shop), 118, G - SHOP_H + 1); }
    for (let x = -PAD; x < WW + PAD; x++) { R(x, G, 1, 6, EARTH[2]); R(x, G, 1, 3, '#3f9a3a'); R(x, G, 1, 1, '#6cc44e'); if (hash4(x, 2) < 0.3) R(x, G - 1, 1, 1, '#4fae40'); R(x, G + 3, 1, 1, '#2a6a2a'); }
    if (TOWN) townFooting(bg);
    const L0 = SX0 - 2, L1 = SX1 - 3, top = G - 66;
    for (const x of [L0, L1]) postV(x, top, G, 4);
    for (let y = top + 8; y < G - 8; y += 20) { braceD(L0 + 4, y, L1, y + 18); braceD(L1, y, L0 + 4, y + 18); }
    beamH(L0 - 2, L1 + 6, top - 4, 5, 9);
    gallery(176, SX0, G - 34, G);
    ladder(168, G - 34, G);
  }
  function paintLevel(k) {
    const lv = LV[k], y0 = lv.y0, F = lv.F;
    // MINE: aquí solo la viga del suelo de DRILL; la cámara de excavación va en su propio lienzo (mineBake).
    if (k === 'mine') { beamH(-PAD, WW + PAD, lv.top, BEAM, lv.top); for (const px of [E0 - 1, 103]) plateBolt(px, lv.top + 1); return; }
    cobble(k, E0, y0, SX0 - E0, F - y0, 17 + y0);
    beamH(-PAD, WW + PAD, lv.top, BEAM, lv.top);
    for (const px of [E0, 104]) { postV(px, y0, F); braceD(px + 5, y0 + 12, px + 15, y0); }
    braceD(SX0 - 6, y0 + 12, SX0 - 16, y0);
    for (const px of [E0 - 1, 103]) plateBolt(px, lv.top + 1);
    for (const lx of LAMPS[k]) lampBody(lx, y0 + 6);
    if (k === 'mine') paintMineBG(lv);
    if (k === 'drill') paintDrillBG(lv);
    if (k === 'refine') paintRefineBG(lv);
    if (k === 'cheese') paintCheeseBG(lv);
  }
  function paintMineBG(lv) {
    const F = lv.F;
    toolRack(118, F - 70); noticeBoard(132, F - 60);
    pipeBg(104, lv.y0 + 16, 210, lv.y0 + 16, 3);
    if (STGS.mine >= 3) { timberStack(186, F); for (let x = CART.home - 4; x < SX0 - 2; x += 5) R(x, F - 1, 3, 1, '#4a3220'); R(CART.home - 4, F - 2, SX0 - CART.home + 2, 1, MAT.iron[3]); R(CART.home - 4, F - 1, SX0 - CART.home + 2, 1, MAT.iron[1]); }
    else { timberStack(186, F); crateBg(124, F, 12, 9); }
    if (STGS.mine >= 2) {
      const S = SCAF; for (const x of [S.x0 + 4, S.x1 - 4]) { R(x, S.y + 4, 2, F - S.y - 4, W5[1]); R(x, S.y + 4, 1, F - S.y - 4, W5[2]); }
      bres(S.x0 + 6, S.y + 6, S.x1 - 5, F - 6, (x, y) => R(x, y, 1, 1, W5[1])); bres(S.x1 - 5, S.y + 6, S.x0 + 6, F - 6, (x, y) => R(x, y, 1, 1, W5[1]));
      R(S.x0, S.y, S.x1 - S.x0, 4, W5[2]); R(S.x0, S.y, S.x1 - S.x0, 1, W5[4]); R(S.x0, S.y + 3, S.x1 - S.x0, 1, W5[1]); R(S.x0, S.y + 4, S.x1 - S.x0, 1, INK4);
    }
    // Suelo de la galería: un canto de roca apisonada; debajo, la roca que queda (columna de estratos, se pinta aparte).
    for (let x = -PAD; x < WW + PAD; x++) { R(x, F, 1, 3, '#2a2420'); R(x, F, 1, 1, '#5a4c40'); R(x, F + 1, 1, 1, '#3e342c'); }
    // Pozo de escombro: baja por la roca (un coladero entibado) y se pierde en la oscuridad.
    for (let y = F - 1; y < F + 70; y++) { const a = Math.min(1, (y - F) / 70); R(CHUTE.x0, y, CHUTE.x1 - CHUTE.x0, 1, '#0b080c'); if (a < 0.85) { R(CHUTE.x0 - 2, y, 2, 1, (y - F) % 9 === 0 ? MAT.wood[2] : MAT.wood[1]); R(CHUTE.x1, y, 2, 1, (y - F) % 9 === 0 ? MAT.wood[2] : MAT.wood[1]); } }
    R(CHUTE.x0 - 3, F - 2, CHUTE.x1 - CHUTE.x0 + 6, 2, MAT.wood[3]); R(CHUTE.x0 - 3, F - 2, CHUTE.x1 - CHUTE.x0 + 6, 1, MAT.wood[4]);
    for (let x = CHUTE.x0 + 2; x < CHUTE.x1; x += 4) R(x, F + 1, 1, 3, MAT.iron[1]);
  }
  function paintDrillBG(lv) {
    const F = lv.F, Gy = GALY.drill, ga = gal('drill');
    pipeBg(108, lv.y0 + 14, 210, lv.y0 + 14, 3); pipeBg(150, lv.y0 + 14, 150, F - 30, 3);
    barrelBg(140, F); barrelBg(152, F); crateBg(124, F, 12, 9); crateBg(126, F - 9, 9, 7);
    shelfBg(160, F - 52, 26, (x, y) => { for (let i = 0; i < 3; i++) { R(x + 3 + i * 8, y - 6, 3, 6, '#7c8396'); R(x + 4 + i * 8, y - 6, 1, 6, '#9aa2b4'); } });
    noticeBoard(184, F - 70);
    if (ga) {
      for (const x of [DCX - 20, DCX + 17]) postV(x, lv.y0, F, 4);
      beamH(DCX - 20, DCX + 21, lv.y0 + 4, 4, 3); R(DCX - 4, lv.y0 + 8, 9, 6, MAT.iron[1]); R(DCX - 4, lv.y0 + 8, 9, 1, MAT.iron[3]); R(DCX - 1, lv.y0 + 9, 3, 3, MAT.iron[0]);
      for (let y = lv.y0 + 14; y < F - 46; y += 2) { R(DCX, y, 1, 1, '#8a8496'); R(DCX + 1, y + 1, 1, 1, '#5a5468'); }
      gallery(ga[0], ga[1], Gy, F); ladder(ga[1], Gy, F);
    }
    crateBg(98, F, 9, 7); crateBg(99, F - 7, 8, 6);
  }
  function paintRefineBG(lv) {
    const F = lv.F, Gy = GALY.refine, ga = gal('refine');
    pipeBg(104, lv.y0 + 18, 210, lv.y0 + 18, 3);
    coalPile(2, F); barrelBg(176, F); sackBg(166, F);
    shelfBg(150, F - 58, 28, (x, y) => { for (let i = 0; i < 4; i++) { R(x + 2 + i * 6, y - 4, 4, 4, '#cfc4a0'); R(x + 2 + i * 6, y - 4, 4, 1, '#efe6c4'); } });
    R(RX + 13, lv.y0, 5, REFY - lv.y0, INK4); R(RX + 14, lv.y0, 3, REFY - lv.y0, MAT.iron[1]); R(RX + 14, lv.y0, 1, REFY - lv.y0, MAT.iron[2]); for (let y = lv.y0 + 6; y < REFY; y += 12) R(RX + 12, y, 7, 2, MAT.iron[2]);
    if (ga) { gallery(ga[0], ga[1], Gy, F); ladder(ga[1], Gy, F); pipeSeg(RX + 46, REFY + 14, RX + 46, Gy - 8); pipeSeg(RX + 46, Gy - 8, RX + 58, Gy - 8); }
    if (STGS.refine >= 3) pipeSeg(RX + 30, REFY + 40, STILL2.x + 2, REFY + 40);
    rail('refine', HOPPER[0] - 4, SX0 - 4); storeShelf('refine');
  }
  function paintCheeseBG(lv) {
    const F = lv.F, Gy = GALY.cheese, ga = gal('cheese');
    pipeBg(104, lv.y0 + 12, 210, lv.y0 + 12, 3);
    const racks = ga ? [[12, 96, lv.y0 + 10, 3], [118, 178, F - 66, 2]] : [[118, 178, F - 66, 2]];
    for (const [x0, x1, y0, rows] of racks) {
      for (let r = 0; r < rows; r++) { const y = y0 + 4 + r * 10; R(x0, y + 6, x1 - x0, 2, '#6a4a2a'); R(x0, y + 6, x1 - x0, 1, '#8a6438'); for (let x = x0 + 2; x < x1 - 8; x += 9) if (hash4(x, r, 5) < 0.8) wheelBg(x, y + 6, hash4(x, r, 9) < 0.4); }
      R(x0 - 1, y0 + 4, 2, rows * 10 + 4, '#4a3220'); R(x1 - 1, y0 + 4, 2, rows * 10 + 4, '#4a3220');
    }
    sackBg(186, F);
    if (ga) { gallery(ga[0], ga[1], Gy, F); ladder(ga[1], Gy, F); }
    rail('cheese', CZ().vatC - 4, SX0 - 4); storeShelf('cheese');
  }
  function paintShaft() {
    const top = G + 6, bot = LV.drill.F + BEAM;
    R(SX0 + 2, top, SX1 - SX0 - 4, bot - top, '#0e0b12');
    for (let y = top; y < bot; y += 9) R(SX0 + 2, y, SX1 - SX0 - 4, 1, '#16121c');
    for (const x of [SX0 + 3, SX1 - 4]) R(x, top, 1, bot - top, MAT.iron[2]);
    postV(SX0 - 1, G - 2, bot, 3); postV(SX1 - 3, G - 2, bot, 3);
    for (const k of ['drill', 'refine', 'cheese']) { const y = LV[k].F; R(SX0 - 14, y, 16, 3, MAT.iron[2]); R(SX0 - 14, y, 16, 1, MAT.iron[3]); R(SX0 - 14, y + 3, 16, 1, INK4); }
    for (const k of ['drill', 'refine', 'cheese']) { const y = LV[k].F; R(PALLET.x, y - 2, 13, 2, W5[2]); R(PALLET.x, y - 2, 13, 1, W5[3]); R(PALLET.x + 1, y - 1, 2, 1, W5[0]); R(PALLET.x + 10, y - 1, 2, 1, W5[0]); }
    R(196, G - 2, 13, 2, W5[2]); R(196, G - 2, 13, 1, W5[3]);
  }
  // La cúpula de la gran roca bajo la colonia: tierra hasta su lomo, canto con brillo y bultos, y la boca del pozo abierta.
  function paintCrest() {
    const P = TIER_ROCK.cheddar, top = ROCK_TOP();
    for (let x = -PAD; x < WW + PAD; x++) {
      if (x >= PX0 - 1 && x <= PX1 + 1) continue;
      const cy = crestY(x) - (hash4(x >> 3, 31) < 0.35 ? 1 : 0) - (hash4(x >> 4, 32) < 0.2 ? 1 : 0);
      for (let y = top; y < cy; y++) R(x, y, 1, 1, EARTH[hash4(x >> 1, y >> 1, 41) < 0.2 ? 1 : 2]);
      R(x, cy - 1, 1, 1, EARTH[0]); R(x, cy, 1, 1, INK4); R(x, cy + 1, 1, 1, P[5]); R(x, cy + 2, 1, 1, P[4]); R(x, cy + 3, 1, 1, hash4(x, 33) < 0.5 ? P[4] : P[3]);
    }
  }
  // La cámara de excavación (coordenadas de MINE de siempre; se dibuja desplazada MO px): techo de roca con la boca del pozo,
  // paredes, entibado, faroles y lo de antes (frente, andamio, raíles, pozo de escombro).
  function mineBake() {
    return art('p1mine:' + STGS.mine, () => {
      const lv = LV.mine, y0 = lv.y0, F = lv.F, top = lv.top - 4, c = document.createElement('canvas'); c.width = WW + PAD * 2; c.height = F + 80 - top; const mg = c.getContext('2d'); mg.imageSmoothingEnabled = false; mg.translate(PAD, -top);
      const was = ctx; ctx = mg;
      try {
        const P = TIER_ROCK.cheddar;
        // Techo de roca irregular (menos sobre la boca del pozo) y paredes de la cámara.
        for (let x = PX1; x < SX0; x++) { const cy = y0 + (hash4(x >> 2, 51) < 0.4 ? 1 : 0) + (hash4(x >> 3, 52) < 0.25 ? 1 : 0); R(x, cy, 1, 1, INK4); R(x, cy + 1, 1, 1, P[1]); }
        for (let y = y0; y < F; y++) { R(SX0, y, 1, 1, INK4); R(SX0 - 1, y, 1, 1, P[2]); }
        for (const px of [E0, 104]) { postV(px, y0 + 2, F); R(px - 3, y0 + 1, 11, 3, W5[2]); R(px - 3, y0 + 1, 11, 1, W5[3]); R(px - 3, y0 + 4, 11, 1, INK4); }
        braceD(104 + 5, y0 + 14, 104 + 15, y0 + 4);
        for (const lx of LAMPS.mine) lampBody(lx, y0 + 6);
        paintMineBG(lv);
      } finally { ctx = was; }
      c.top = top; return c;
    });
  }
  function paintEarth() { for (const k of ORDER) { if (k === 'mine') continue; const lv = LV[k]; earth(-PAD, lv.y0, PAD + E0, lv.F - lv.y0, 11 + lv.y0); earth(SX1, lv.y0, PAD + WW - SX1, lv.F - lv.y0, 13 + lv.y0); R(E0 - 1, lv.y0, 1, lv.F - lv.y0, EARTH[0]); } }

  // ================= MINE: el frente, la veta, el barreno =================
  // Textura del frente: bloques de piedra (celdas) con luz arriba a la izquierda y grietas, con la paleta de la roca aprobada
  // de la zona. Se repite cada FH px en vertical: al profundizar, el frente se desplaza hacia arriba (DPX px por nivel).
  const FH = 120, FW = 140, FX = -PAD; // el frente empieza en el margen izquierdo y se funde con la roca de alrededor
  function faceTex() {
    return art('p1faceT:' + tier, () => {
      const c = document.createElement('canvas'); c.width = FW; c.height = FH; const fg = c.getContext('2d'), im = fg.createImageData(FW, FH), D = im.data, P = rockOf().map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      const seeds = []; for (let gy = 0; gy < FH / 10; gy++) for (let gx = -1; gx < FW / 13 + 1; gx++) seeds.push([gx * 13 + 4 + hash4(gx, gy, 11) * 9 + (gy % 2) * 6, gy * 10 + 3 + hash4(gx, gy, 12) * 6, hash4(gx, gy, 13)]);
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
        let d1 = 1e9, d2 = 1e9, best = null;
        for (const sd of seeds) { const dx = x - sd[0]; let dyy = y - sd[1]; if (dyy > FH / 2) dyy -= FH; if (dyy < -FH / 2) dyy += FH; const dy = dyy * 1.3, dd = dx * dx + dy * dy; if (dd < d1) { d2 = d1; d1 = dd; best = [sd, dyy]; } else if (dd < d2) d2 = dd; }
        const edge = Math.sqrt(d2) - Math.sqrt(d1);
        let t;
        if (edge < 1.1) t = 0;
        else { const lx = x - best[0][0], ly = best[1]; t = 3; if (lx + ly * 1.3 < -4) t = 4; if (lx + ly * 1.3 < -8 && edge > 2.5) t = 5; if (lx + ly * 1.3 > 5) t = 2; if (edge < 2.1 && lx + ly > 0) t = 1; if (best[0][2] < 0.25 && t > 2) t--; }
        const i = (y * FW + x) * 4, col = P[t]; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
      }
      fg.putImageData(im, 0, 0); return c;
    });
  }
  // Canto del frente y sombra bajo la viga (no se desplazan).
  // Luz y canto del frente (fijos): el canto expuesto con brillo y tinta; hacia la izquierda y hacia el techo la roca se
  // apaga en trama hasta parecerse a la de alrededor (la luz de la zona de trabajo es la que la hace distinta); el lomo que
  // queda bajo el pozo lleva un reborde irregular iluminado por los faroles del pozo.
  const faceEdgeC = () => art('p1faceE:' + tier, () => mkc(FW + 4, FACE.y1 - FACE.y0 + 2, () => {
    const P = rockOf(), Hh = FACE.y1 - FACE.y0 + 1;
    for (let y = 0; y < Hh; y++) {
      const ex = edgeX(FACE.y0 + y) - FX;
      for (let x = 0; x < ex - 1; x++) {
        const wx = x + FX, side = Math.min(0.8, Math.max(0, (ex - 24 - x) / 70)), underPit = wx > PX0 + 2 && wx < PX1, top = underPit ? 0 : Math.min(0.7, Math.max(0, (10 - y) / 10) * 0.7), dsh = Math.round(Math.max(side, top) * 6) / 6;
        if (dsh > 0) { ctx.globalAlpha = dsh; R(x, y, 1, 1, '#0c0b10'); ctx.globalAlpha = 1; }
      }
      R(ex - 1, y, 1, 1, P[hash4(y, 4) < 0.5 ? 4 : 3]); R(ex, y, 1, 1, INK4);
    }
    // Lomo bajo el pozo: unos px de roca suelta con reborde claro, en vez de una línea recta.
    for (let wx = PX0 + 2; wx < Math.min(PX1, edgeX(FACE.y0) + 1); wx++) { const x = wx - FX, bump = Math.round(hash4(wx >> 1, 61) * 2 + Math.sin(wx * 0.4) * 0.8); for (let k = 0; k < bump; k++) R(x, k, 1, 1, '#0d0a10'); R(x, bump, 1, 1, P[5]); R(x, bump + 1, 1, 1, P[4]); }
  }));
  // Profundidad que se ve (se anima al bajar) y temblor de la bajada.
  const shownDepth = () => vis.dShown;
  const quake = (now) => ((vis.desc && now - vis.desc.t0 < 800) || (vis.reveal && now - vis.reveal.t0 < 420) ? (Math.floor(now / 45) % 2 ? 1 : -1) : 0);
  function drawFace(now) {
    const j = now - vis.jolt < 90 ? (now - vis.jolt < 45 ? 1 : -1) : 0, P = rockOf(), tex = faceTex();
    const off = ((Math.round(MO) % FH) + FH) % FH;
    for (let y = FACE.y0; y <= FACE.y1; y++) { const ex = edgeX(y) - FX, sy = (y - FACE.y0 + off) % FH; ctx.drawImage(tex, 0, sy, Math.min(FW, ex), 1, FX + j, y, Math.min(FW, ex), 1); }
    ctx.drawImage(faceEdgeC(), FX + j, FACE.y0);
    const k = sim.vein ? 1 : Math.min(1, sim.hits / sim.need);
    // MARCAS DE PICO (28-10-2026; sustituyen a las grietas al azar, que no se leían naturales): cada golpe deja una muesca
    // justo donde da el pico, en el borde de la pared. Donde trabajan los picadores la pared se va gastando y mellando; el
    // golpe a mano la deja más honda. Recién hecha, la muesca lleva polvo claro. Con la pared nueva (al bajar) no queda ninguna.
    for (const m of vis.marks) {
      // Sombra y luz transparentes: valen para la piedra de cualquier estrato (la pared no usa la paleta de la roca de fondo).
      const w = 3 + m.r * 2, hh = 1 + m.r, x = m.x - w + 2 + j, y = m.y, age = now - m.t;
      ctx.globalAlpha = 0.5; R(x, y, w, hh, INK4); ctx.globalAlpha = 0.35; R(x + 1, y, w - 2, hh - 1, INK4);
      ctx.globalAlpha = 0.32; R(x, y - 1, w - 1, 1, '#fff6e0'); R(x + 1, y + hh, w - 1, 1, '#fff6e0'); ctx.globalAlpha = 1;
      if (age < 260) { ctx.globalAlpha = 0.8 * (1 - age / 260); R(x - 1, y - 1, w + 1, 1, '#ece4d4'); R(x - 1, y + hh, w + 1, 1, '#d8ccb4'); ctx.globalAlpha = 1; }
    }
    const vy = FACE.vy;
    // Al acercarse a la veta, su luz se filtra por la piedra: un resplandor dorado que crece con la cuenta.
    if (!sim.vein && k > 0.45) glowH(DCX + 6 + j, vy + 2, 6 + Math.round(12 * (k - 0.45)), '#ffcf2e', 0.42 * (k - 0.45));
    if (sim.vein) {
      const left = Math.max(0, sim.left / sim.cap), half = Math.round(6 + 26 * left);
      for (let x = Math.max(FACE.x0 + 1, DCX - half); x <= Math.min(edgeX(vy) - 3, DCX + half); x++) { const t = Math.round(Math.sin(x * 0.3) * 1.2), th = 5; R(x + j, vy + t - 2, 1, th + 4, '#33241a'); R(x + j, vy + t - 1, 1, th + 2, '#1c1410'); R(x + j, vy + t, 1, th, '#f5ab12'); R(x + j, vy + t, 1, 1, '#ffcf2e'); R(x + j, vy + t + th - 1, 1, 1, '#c97a08'); if (hash4(x, 5) < 0.18) R(x + j, vy + t + 2, 1, 1, '#c97a08'); }
      if (Math.floor(now / 260) % 3 === 0) R(DCX - half + Math.floor(hash4(Math.floor(now / 260), 1) * half * 2) + j, vy, 1, 1, '#fffbe0');
    } else if (k > 0.5) { for (let i = 0; i < Math.floor((k - 0.5) * 24); i++) R(FACE.x0 + 6 + Math.floor(hash4(i, 2) * 58) + j, vy + Math.floor(hash4(i, 6) * 4), 1, 1, hash4(i, 7) < 0.5 ? '#c97a08' : '#f5ab12'); }
    revealFX(now, j, vy);
    if (vis.hitGlow && now - vis.hitGlow.t < 160) { const a = 1 - (now - vis.hitGlow.t) / 160; glowH(vis.hitGlow.x + j, vis.hitGlow.y, 7, '#fff6d8', 0.9 * a); } // fogonazo del golpe a mano, solo donde da
    // Barreno: solo existe mientras la broca baja o está dentro; se abre al ritmo de la broca y se cierra tras ella al salir.
    const tip = vis.tipY || FACE.y0;
    if (tip > FACE.y0 + 1) {
      const b = Math.min(vy + 2, tip);
      R(DCX - 4 + j, FACE.y0, 9, b - FACE.y0, INK4); R(DCX - 3 + j, FACE.y0, 7, b - FACE.y0, '#120d10'); R(DCX - 3 + j, FACE.y0, 1, b - FACE.y0, P[1]); R(DCX + 3 + j, FACE.y0, 1, b - FACE.y0, P[2]);
      for (let y = FACE.y0 + 3; y < b; y += 5) { R(DCX - 4 + j, y, 1, 1, P[3]); R(DCX + 4 + j, y + 2, 1, 1, P[2]); }
    }
  }
  // ¡VETA! (28-10-2026): abrir la veta es el hito del bucle activo y tiene su momento, 1,8 s, todo saliendo de la veta:
  // 1) la pared tiembla y se abre una raja de luz a lo largo de la veta (0–0,3 s); 2) estallido: fogonazo dorado, una onda
  // que se expande, pepitas de queso que saltan y caen al suelo, esquirlas y destellos (0,25 s); 3) rayos de luz y un
  // resplandor que late hasta calmarse (hasta 1,8 s). Sin contorno, como todos los VFX. En coordenadas de MINE.
  function revealFX(now, j, vy) {
    const R0 = vis.reveal; if (!R0) return; const t = now - R0.t0; if (t > 1800) { vis.reveal = null; return; }
    const cx = DCX + 6, full = Math.round(6 + 26 * Math.max(0, sim.left / sim.cap)), x0 = Math.max(FACE.x0 + 1, DCX - full), x1 = Math.min(edgeX(vy) - 3, DCX + full);
    // 1) la raja de luz crece desde el centro hacia los lados
    if (t < 900) { const k = Math.min(1, t / 300), a = t < 300 ? 1 : 1 - (t - 300) / 600, hx = Math.round((x1 - x0) / 2 * k), mx = Math.round((x0 + x1) / 2); ctx.globalAlpha = a; R(mx - hx + j, vy + 1, hx * 2 + 1, 3, '#fffbe0'); R(mx - hx + j, vy + 2, hx * 2 + 1, 1, '#ffffff'); ctx.globalAlpha = 1; }
    // 2) estallido
    if (t >= 250 && !R0.burst) {
      R0.burst = true;
      for (let i = 0; i < 18; i++) { const x = x0 + rnd() * (x1 - x0); rfx('drop', x, vy + MO + 1, { vx: (rnd() - 0.5) * 0.12, vy: -0.07 - rnd() * 0.09, life: 1300, floor: LV.mine.F + MO - 2, c: [rnd() < 0.5 ? '#ffd84a' : '#f5ab12', '#c97a08'], big: true, delay: rnd() * 120 }); }
      for (let i = 0; i < 10; i++) rfx('drop', x0 + rnd() * (x1 - x0), vy + MO, { vx: (rnd() - 0.5) * 0.14, vy: -0.05 - rnd() * 0.08, life: 900, floor: LV.mine.F + MO - 2, c: [rockOf()[3], rockOf()[1]] });
      for (let i = 0; i < 14; i++) rfx('glint', x0 - 6 + rnd() * (x1 - x0 + 12), vy + MO - 14 + rnd() * 30, { life: 420, delay: 80 + rnd() * 900 });
      for (let i = 0; i < 12; i++) vis.motes.push({ x: E0 + 4 + rnd() * 120, y: LV.mine.y0 + MO + 1, vy: 0.004 + rnd() * 0.01, t0: now + i * 50, life: 900, big: i % 4 === 0 });
    }
    if (t >= 250) {
      const k = (t - 250) / 1550;
      // fogonazo dorado sobre la pared y resplandor que late hasta calmarse
      if (t < 450) glowH(cx + j, vy + 2, 44, '#ffd860', 0.95 * (1 - (t - 250) / 200));
      glowH(cx + j, vy + 2, 14 + Math.round(10 * (1 - k)), '#ffcf2e', (0.7 + 0.15 * Math.sin(t / 70)) * (1 - k));
      // la onda: un anillo de puntos dorados que se abre y se apaga
      if (t < 750) { const kr = (t - 250) / 500, r = 6 + kr * 44; ctx.globalAlpha = 1 - kr; for (let i = 0; i < 40; i++) { const an = (i / 40) * Math.PI * 2; R(Math.round(cx + Math.cos(an) * r) + j, Math.round(vy + 2 + Math.sin(an) * r * 0.55), 1, 1, i % 2 ? '#ffe070' : '#fff6c8'); } ctx.globalAlpha = 1; }
      // rayos de luz que salen de la veta
      if (t < 1500) { const a = 0.5 * (1 - (t - 250) / 1250); ctx.globalAlpha = a; for (const [dx, dy, len] of [[-0.8, -1, 22], [-0.3, -1, 30], [0.25, -1, 26], [0.7, -1, 20], [-1, -0.25, 16], [1, -0.3, 14]]) { const n = Math.hypot(dx, dy); for (let s2 = 4; s2 < len; s2++) { if ((s2 + Math.floor(t / 60)) % 3 === 0) continue; R(Math.round(cx + (dx / n) * s2) + j, Math.round(vy + 1 + (dy / n) * s2), 1, 1, '#fff2b0'); } } ctx.globalAlpha = 1; }
    }
  }
  // Columna de estratos: la roca de la pared de MINE y la que queda por debajo. Cada nivel de profundidad son DPX px; cada
  // cinco niveles cambia la piedra (las paletas de las rocas aprobadas, oscurecidas porque es fondo) y hay un cartel clavado
  // con la profundidad. Al bajar, toda la columna sube: se ve pasar la roca y acercarse la siguiente capa.
  const TIERS6 = ['cheddar', 'gouda', 'brie', 'emmental', 'parmesan', 'blue'];
  const tierAt = (dd) => TIERS6[Math.max(0, Math.min(5, Math.floor((dd - 30) / 5)))];
  function strataTex() {
    return art('p1strata', () => {
      const W = WW + PAD * 2, Ht = (D1 - D0) * DPX, c = document.createElement('canvas'); c.width = W; c.height = Ht; const sg = c.getContext('2d'), im = sg.createImageData(W, Ht), D = im.data;
      const dark = (h, k) => [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - k) + 12 * k));
      const PALS = {}; for (const t of TIERS6) PALS[t] = TIER_ROCK[t].map((h) => dark(h, 0.34));
      for (let y = 0; y < Ht; y++) {
        const dd = D0 + y / DPX, P = PALS[tierAt(dd)];
        for (let x = 0; x < W; x++) {
          const v = y + Math.round(Math.sin(x * 0.045 + y * 0.01) * 3 + Math.sin(x * 0.13) * 1.2), band = Math.floor(v / 7);
          let t = band % 3 === 0 ? 2 : band % 3 === 1 ? 3 : 2; if (v % 7 === 0) t = 1; if (hash4(x >> 1, y >> 1, 5) < 0.07) t = Math.max(1, t - 1); if (hash4(x, y, 6) < 0.012) t = 4;
          const i = (y * W + x) * 4, col = P[t]; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
        }
      }
      sg.putImageData(im, 0, 0);
      const was = ctx; ctx = sg;
      try {
        // Piedras sueltas con su luz, vetas de queso dormidas y, en cada cambio de capa, una línea de contacto y su cartel.
        for (let i = 0; i < (W * Ht) / 260; i++) { const cx = Math.floor(hash4(i, 1, 77) * W), cy = Math.floor(hash4(i, 2, 77) * Ht), r = 1 + Math.floor(hash4(i, 3, 77) * 3), P = PALS[tierAt(D0 + cy / DPX)].map((q) => '#' + q.map((v) => v.toString(16).padStart(2, '0')).join('')); for (let yy = -r; yy <= r; yy++) for (let xx = -r - 1; xx <= r + 1; xx++) if ((xx * xx) / ((r + 1) * (r + 1)) + (yy * yy) / (r * r) <= 1) R(cx + xx, cy + yy, 1, 1, xx + yy < -r ? P[4] : xx + yy > r - 1 ? P[1] : P[3]); }
        for (let i = 0; i < 26; i++) { const cx = Math.floor(hash4(i, 1, 79) * W), cy = Math.floor(hash4(i, 2, 79) * Ht), r = 5 + Math.floor(hash4(i, 3, 79) * 6), P = PALS[tierAt(D0 + cy / DPX)].map((q) => '#' + q.map((v) => v.toString(16).padStart(2, '0')).join('')); for (let yy = -r; yy <= r; yy++) for (let xx = -r - 2; xx <= r + 2; xx++) { const dd2 = (xx * xx) / ((r + 2) * (r + 2)) + (yy * yy) / (r * r); if (dd2 > 1) continue; R(cx + xx, cy + yy, 1, 1, dd2 > 0.86 ? P[0] : xx + yy < -r * 0.7 ? P[4] : xx + yy > r * 0.6 ? P[1] : P[3]); } }
        for (let i = 0; i < (W * Ht) / 1400; i++) { const cx = Math.floor(hash4(i, 4, 78) * W), cy = Math.floor(hash4(i, 5, 78) * Ht); for (let k = 0; k < 4 + (i % 4); k++) R(cx + k, cy + Math.round(Math.sin(k) * 1), 1, 1, k % 3 ? '#7a4a10' : '#a8680e'); }
        // Grietas largas que atraviesan la roca (dan escala: es una sola masa enorme, no ladrillos).
        for (let i = 0; i < 14; i++) { let x = Math.floor(hash4(i, 1, 91) * W), y = Math.floor(hash4(i, 2, 91) * Ht); const len = 40 + Math.floor(hash4(i, 3, 91) * 70), dir = hash4(i, 4, 91) < 0.5 ? -1 : 1; for (let k = 0; k < len; k++) { R(x, y, 1, 1, '#08070a'); if (k % 3 === 0) R(x + 1, y, 1, 1, '#2a2622'); y += 1; if (hash4(i, k, 92) < 0.55) x += dir; if (hash4(k, i, 93) < 0.12) x -= dir * 2; } }
        for (let dd = 35; dd < D1; dd += 5) {
          const y = (dd - D0) * DPX;
          for (let x = 0; x < W; x++) { const yy = y + Math.round(Math.sin(x * 0.08 + dd) * 2); R(x, yy, 1, 1, '#0a0809'); R(x, yy + 1, 1, 1, '#3a2e26'); }
          { const px = PAD + ((dd / 5) % 2 ? 132 : 30); R(px + 6, y + 1, 2, 12, MAT.wood[1]); R(px + 6, y + 1, 1, 12, MAT.wood[2]); depthPlate(px, y - 13, dd, PLATE_MAT[tierAt(dd)]); }
        }
      } finally { ctx = was; }
      return c;
    });
  }
  // La roca está quieta en el mundo: cada fila de la columna corresponde a una profundidad fija.
  const texYAt = (y) => Math.round((30 - D0) * DPX + (y - (LV.mine.F + PIT0)));
  // El pozo de la gran roca: de la viga de DRILL a la cámara. Oscuro por dentro, paredes talladas, anillos de entibado cada
  // 26 px, escalera, faroles y la luz que entra por la boca. Mide MO px: crece con la profundidad.
  function drawPit(now) {
    const top = ROCK_TOP(), bot = LV.mine.y0 + MO + 2, P = TIER_ROCK.cheddar; if (bot <= top + 2) return;
    ctx.globalAlpha = 0.55; R(PX0, top, PX1 - PX0, bot - top, '#07060b'); ctx.globalAlpha = 1;
    for (let k = 0; k < 7; k++) { ctx.globalAlpha = (0.07 * (7 - k)) / 7; R(PX0 + 2, top + k * 7, PX1 - PX0 - 4, 7, '#ffd890'); } ctx.globalAlpha = 1;
    for (let y = top; y < bot; y++) { const wl = PX0 + Math.round(hash4(y >> 2, 3) * 2), wr = PX1 - Math.round(hash4(y >> 2, 4) * 2); R(wl - 1, y, 1, 1, INK4); R(wl, y, 1, 1, P[4]); R(wl + 1, y, 1, 1, P[3]); R(wr, y, 1, 1, INK4); R(wr - 1, y, 1, 1, P[2]); }
    ladder(PX1 - 11, top, bot);
    let i = 0;
    for (let y = top + 16; y < bot - 6; y += 26, i++) {
      R(PX0 + 1, y, PX1 - PX0 - 2, 3, W5[2]); R(PX0 + 1, y, PX1 - PX0 - 2, 1, W5[3]); R(PX0 + 1, y + 3, PX1 - PX0 - 2, 1, INK4);
      for (const px of [PX0 + 1, PX1 - 5]) { R(px, y - 6, 4, 6, W5[1]); R(px, y - 6, 1, 6, W5[2]); }
      if (i % 2 === 0) { lampBody(PX0 + 12, y + 10); lampGlow('pit' + i, PX0 + 12, y + 10, now, 16); }
    }
  }
  function drawStrata(now) {
    const tex = strataTex(), y0 = LV.mine.y0 + MO, F = LV.mine.F + MO, top = ROCK_TOP(), H = Hw();
    const s0 = texYAt(top); ctx.drawImage(tex, 0, s0, WW + PAD * 2, H - top, -PAD, top, WW + PAD * 2, H - top);
    // La roca se ilumina desde la colonia (arriba) y se oscurece al bajar: volumen y hondura.
    for (let k = 0; k < 10; k++) { ctx.globalAlpha = 0.11 * (1 - k / 10); R(-PAD, top + k * 8, WW + PAD * 2, 8, '#ffe0b0'); }
    // Una sola caída de luz de la cúpula al fondo: hasta el suelo de MINE oscurece poco a poco; por debajo, hasta casi negro.
    for (let y = top; y < H; y += 4) { const a1 = Math.min(1, (y - top) / Math.max(80, F - top)) * 0.4, a2 = y > F ? Math.pow((y - F) / (H - F), 1.2) * 0.56 : 0; ctx.globalAlpha = Math.min(0.95, a1 + a2); R(-PAD, y, WW + PAD * 2, 4, '#06050a'); }
    ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.42; R(E0, y0, SX0 - E0, F - y0, '#07060b'); ctx.globalAlpha = 1;
    for (const lx of LAMPS.mine) lampGlow('mine' + lx, lx, y0 + 6, now, 34);
    // Motas de polvo y piedrecitas que caen del techo al bajar.
    for (let i = vis.motes.length - 1; i >= 0; i--) { const m = vis.motes[i], t = now - m.t0; if (t < 0) continue; if (t > m.life) { vis.motes.splice(i, 1); continue; } const yy = m.y + 0.00012 * t * t + m.vy * t; ctx.globalAlpha = 1 - t / m.life; R(Math.round(m.x), Math.round(yy), m.big ? 2 : 1, m.big ? 2 : 1, m.big ? rockOf()[3] : '#b8aa98'); } ctx.globalAlpha = 1;
  }
  // Al profundizar: la roca sube DPX px en 1,1 s con temblor, cae polvo del techo y los de MINE se agarran.
  function descendTick(now) {
    if (vis.dTarget !== sim.depth) {
      vis.desc = { t0: now, from: vis.dShown, to: sim.depth }; vis.dTarget = sim.depth;
      vis.moFrom = MO; vis.moTo = pitFor(sim.depth);
      for (let i = 0; i < 18; i++) vis.motes.push({ x: E0 + 4 + hash4(i, sim.depth) * (SX0 - E0 - 8), y: LV.mine.y0 + vis.moTo + 1, vy: 0.004 + hash4(i, 2) * 0.01, t0: now + i * 40, life: 900 + hash4(i, 3) * 500, big: i % 5 === 0 });
      for (const n of nodes) if (n.st === 'mine') react(n, 'wow', ((n.hx >> 3) % 3) * 90);
    }
    if (vis.desc) { const k = Math.min(1, (now - vis.desc.t0) / 1100); vis.dShown = vis.desc.from + (vis.desc.to - vis.desc.from) * ease(k); MO = vis.moFrom + (vis.moTo - vis.moFrom) * ease(k); if (k >= 1) { vis.dShown = vis.desc.to; if (now - vis.desc.t0 > 1500) vis.desc = null; } }
  }
  const WM = new WeakMap();
  function whiteMask(src) { if (WM.has(src)) return WM.get(src); const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); WM.set(src, c); return c; }
  function drawPile() { const P = rockOf(), F = LV.mine.F, n = Math.min(4, vis.rubble); for (let i = 0; i < n; i++) ctx.drawImage(chunkC(), PILE.x + 1 + (i % 2) * 5, F - 5 - Math.floor(i / 2) * 3); if (n) R(PILE.x + 1, F, 11, 1, P[0]); }
  function drawCart() {
    if (STGS.mine < 3) return;
    const F = LV.mine.F, x = Math.round(vis.cart.x), tilt = vis.cart.tilt;
    if (tilt) { ctx.save(); ctx.translate(x + 9, F - 12); ctx.rotate(0.35 * tilt); ctx.drawImage(cartC(), -9, 0); ctx.restore(); }
    else { ctx.drawImage(cartC(), x, F - 12); for (let i = 0; i < vis.cart.load; i++) ctx.drawImage(chunkC(), x + 2 + i * 5, F - 15 - (i % 2)); }
  }

  // ================= ESTACIONES POR CONSTRUIR (28-10-2026) =================
  // La simulación dice qué está construido (sim.built) y qué se puede construir ya (sim.ready), con los desbloqueos reales
  // del juego. Sin construir, la estación no tiene máquina ni ratones: si ya se puede, se ve la silueta de la máquina
  // latiendo (lista para construir); si no, el nivel queda apagado. Al construirla, la máquina aparece con un destello,
  // sale polvo de obra y llegan sus ratones.
  const stateSt = (st) => (st === 'lab' ? 'none' : !sim.built || sim.built[st] !== false ? 'on' : sim.ready && sim.ready[st] ? 'build' : 'locked');
  const builtSt = (st) => stateSt(st) === 'on';
  const wasBuilt = {};
  function buildTick(now) {
    for (const st of ['drill', 'refine', 'cheese']) {
      const b = builtSt(st);
      if (b && wasBuilt[st] === false) {
        MFL[st] = { t: now, ms: 420, a: 0.95 };
        const r = stRect(st); for (let i = 0; i < 10; i++) rfx('puff', r[0] + 20 + rnd() * (r[2] - 40), LV[st].F - 4, { vx: (rnd() - 0.5) * 0.02, vy: -0.012 - rnd() * 0.01, life: 900 + rnd() * 400, c: '#c8bca8', delay: i * 40 });
        for (let i = 0; i < 8; i++) rfx('glint', r[0] + 20 + rnd() * (r[2] - 40), LV[st].F - 10 - rnd() * 30, { life: 420, delay: 150 + i * 60 });
        nodes.filter((n) => n.st === st && n.crew).forEach((n, i) => { n.x = n.hx; n.q = []; react(n, 'wow', 200 + i * 90); });
      }
      wasBuilt[st] = b;
    }
    for (const [st, x, w] of [['house', LOT.house[0], LOT.house[1]], ['sell', LOT.shop[0], LOT.shop[1]]]) {
      const b = builtSt(st);
      if (b && wasBuilt[st] === false) { for (let i = 0; i < 10; i++) rfx('puff', x + 6 + rnd() * (w - 12), G - 4, { vx: (rnd() - 0.5) * 0.02, vy: -0.012 - rnd() * 0.01, life: 900 + rnd() * 400, c: '#c8bca8', delay: i * 40 }); for (let i = 0; i < 8; i++) rfx('glint', x + 6 + rnd() * (w - 12), G - 10 - rnd() * 30, { life: 420, delay: 150 + i * 60 }); }
      wasBuilt[st] = b;
    }
  }
  // Silueta de la máquina por construir: la máquina real, recortada y en un azul de plano que late.
  function ghostOf(st, now) {
    const F = LV[st].F, a = 0.3 + 0.1 * Math.sin(now / 420), z = CZ();
    const put = (src, x, y) => { ctx.globalAlpha = a; ctx.drawImage(tintC(src, '#9fd8ff'), x, y); ctx.globalAlpha = 1; };
    if (st === 'drill') { put(artDrill(), DCX - 15, F + 1 - 31); put(artWheel(0), DCX - 7, F + 1 - 46); }
    if (st === 'refine') { put(refineB(2, 0, true), RF.x, REFY); if (STGS.refine >= 3) put(artStill(), STILL2.x, REFY + 18); }
    if (st === 'cheese') { if (STGS.cheese === 1) put(cheeseSmallC(), z.station, F - 46); else { put(bigVatC(), z.vat, F - 24); z.press.forEach((x) => put(artPress(0), x, F - 22)); } }
  }
  function drawStation(st, now, dt) {
    const k = stateSt(st);
    if (k === 'on') { if (st === 'drill') drawDrill(now, dt); else if (st === 'refine') drawRefine(now, dt); else drawCheese(now, dt); return; }
    if (k === 'build') ghostOf(st, now);
    else { const r = stRect(st); ctx.globalAlpha = 0.5; ctx.fillStyle = '#07050c'; ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.globalAlpha = 1; } // bloqueada: apagada
  }

  // ================= ACCIÓN ACTIVA: ritmo y efectos de esfuerzo =================
  // Partículas propias del acelerón (sin contorno, como todos los VFX): brasas que suben del horno, gotas de suero que saltan
  // de la cuba, vapor y humo, chispas de la broca, sudor de los ratones, monedas que saltan del mostrador, destellos y la
  // estrella del golpe de pico. Con tope; cada una vive menos de 1,2 s.
  const RFX = [];
  function rfx(kind, x, y, o = {}) { if (RFX.length >= 140) return; RFX.push({ kind, x, y, vx: o.vx || 0, vy: o.vy || 0, t0: performance.now() + (o.delay || 0), life: o.life || 600, c: o.c, floor: o.floor, x1: o.x1, y1: o.y1, h: o.h, big: o.big }); }
  const rnd = () => Math.random();
  function drawRFX(now, dt) {
    for (let i = RFX.length - 1; i >= 0; i--) {
      const p = RFX[i], t = now - p.t0; if (t < 0) continue; const a = t / p.life; if (a >= 1) { RFX.splice(i, 1); continue; }
      if (p.kind === 'ember') { p.x += p.vx * dt + Math.sin((t + i * 97) / 90) * 0.04; p.y += p.vy * dt; if (Math.floor(t / 60 + i) % 5 === 0) continue; R(Math.round(p.x), Math.round(p.y), 1, 1, a < 0.25 ? '#fff2b0' : a < 0.55 ? '#ffcf2e' : a < 0.8 ? '#ff8a2e' : '#c8462e'); }
      else if (p.kind === 'drop') { p.vy += 0.00032 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.floor != null && p.y >= p.floor) { R(Math.round(p.x) - 1, p.floor, 3, 1, p.c[1]); RFX.splice(i, 1); continue; } R(Math.round(p.x), Math.round(p.y), p.big && a < 0.5 ? 2 : 1, a < 0.4 ? 2 : 1, p.c[0]); }
      else if (p.kind === 'steam' || p.kind === 'puff') { p.x += p.vx * dt; p.y += p.vy * dt; const r = Math.round((p.kind === 'puff' ? 2 : 1) + a * (p.kind === 'puff' ? 3 : 3)); disc(Math.round(p.x), Math.round(p.y), r, p.c || (p.kind === 'puff' ? '#6e6676' : '#f2eef8'), (p.kind === 'puff' ? 0.45 : 0.4) * (1 - a)); }
      else if (p.kind === 'spark') { p.vy += 0.0003 * dt; p.x += p.vx * dt; p.y += p.vy * dt; const x = Math.round(p.x), y = Math.round(p.y), tx = Math.round(p.x - p.vx * 30), ty = Math.round(p.y - p.vy * 30); bres(tx, ty, x, y, (xx, yy) => R(xx, yy, 1, 1, a < 0.4 ? '#ffd860' : '#ff9a2e')); R(x, y, 1, 1, '#fff6c8'); }
      else if (p.kind === 'zap') { p.x += p.vx * dt; p.y += p.vy * dt; const x = Math.round(p.x), y = Math.round(p.y); R(x, y, 1, 1, a < 0.45 ? '#ffffff' : '#9fe6ff'); if (a < 0.5) R(x - Math.sign(p.vx || 1), y, 1, 1, '#5ad1ff'); }
      else if (p.kind === 'sweat') { p.vy += 0.00022 * dt; p.x += p.vx * dt; p.y += p.vy * dt; const x = Math.round(p.x), y = Math.round(p.y); R(x, y, 2, 2, '#7cc4f4'); R(x, y - 1, 1, 1, '#bfe6ff'); R(x, y, 1, 1, '#ffffff'); }
      else if (p.kind === 'coin') { const k = a, x = Math.round(p.x + (p.x1 - p.x) * k), y = Math.round(p.y + (p.y1 - p.y) * k - Math.sin(k * Math.PI) * p.h); coinTok(x, y); if (k > 0.85) { R(x + 1, y - 3, 1, 3, '#fff6b0'); R(x, y - 2, 3, 1, '#fff6b0'); } }
      else if (p.kind === 'glint') { const x = Math.round(p.x), y = Math.round(p.y); R(x, y, 1, 1, '#fffbe0'); if (a < 0.6) { R(x - 1, y, 3, 1, '#ffd860'); R(x, y - 1, 1, 3, '#ffd860'); } if (a < 0.3) { R(x - 2, y, 1, 1, '#ffd860'); R(x + 2, y, 1, 1, '#ffd860'); R(x, y - 2, 1, 1, '#ffd860'); R(x, y + 2, 1, 1, '#ffd860'); } }
      else if (p.kind === 'star') { const x = Math.round(p.x), y = Math.round(p.y), r = a < 0.35 ? 3 : a < 0.7 ? 2 : 1; R(x - r, y, r * 2 + 1, 1, a < 0.35 ? '#ffffff' : '#fff2b0'); R(x, y - r, 1, r * 2 + 1, a < 0.35 ? '#ffffff' : '#fff2b0'); if (r > 1) { R(x - 1, y - 1, 1, 1, '#ffd860'); R(x + 1, y + 1, 1, 1, '#ffd860'); R(x + 1, y - 1, 1, 1, '#ffd860'); R(x - 1, y + 1, 1, 1, '#ffd860'); } }
    }
  }
  // Resplandor con intensidad (vfxGlow tiene la suya fija).
  function glowH(x, y, r, col, a) { if (a <= 0.01) return; for (const [rr, k] of [[r, 0.35], [Math.round(r * 0.6), 0.45], [Math.round(r * 0.3), 0.6]]) { ctx.globalAlpha = Math.min(1, a * k); ctx.fillStyle = col; for (let dy = -rr; dy <= rr; dy++) { const w = Math.floor(Math.sqrt(rr * rr - dy * dy)); ctx.fillRect(x - w, y + dy, w * 2 + 1, 1); } } ctx.globalAlpha = 1; }
  // Tinte de una silueta (calor al rojo, destello blanco): la máquina entera, recortada por su propio contorno.
  const TINT = new WeakMap();
  function tintC(src, col) { let m = TINT.get(src); if (!m) TINT.set(src, (m = {})); if (m[col]) return m[col]; const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return (m[col] = c); }
  // Destello de impacto: al arrancar el acelerón (fuerte) y en cada toque (suave), la máquina se pone blanca un instante.
  const MFL = {};
  function hitFlash(st, src, x, y, now) { const f = MFL[st]; if (!f) return; const k = (now - f.t) / f.ms; if (k < 0 || k >= 1) return; ctx.globalAlpha = f.a * (1 - k); ctx.drawImage(tintC(src, '#ffffff'), x, y); ctx.globalAlpha = 1; }
  // Calor: la máquina acelerada se pone al rojo, con un latido.
  function heatTint(st, src, x, y, now, col = '#ff6a2a', a = 0.24) { const h = heat(st); if (h <= 0.02) return; ctx.globalAlpha = h * a * (0.8 + 0.2 * Math.sin(now / 90)); ctx.drawImage(tintC(src, col), x, y); ctx.globalAlpha = 1; }
  function rushTap(st) { const now = performance.now(); if (!MFL[st] || now - MFL[st].t > 120) MFL[st] = { t: now, ms: 110, a: 0.35 }; }
  function rushTick(now, dt) {
    for (const st of Object.keys(spd)) {
      const on = !!(sim.boost && sim.boost[st]), tgt = on ? 2 : 1, k = 1 - Math.exp(-dt / (tgt > spd[st] ? 110 : 280));
      spd[st] += (tgt - spd[st]) * k; if (Math.abs(tgt - spd[st]) < 0.01) spd[st] = tgt;
      vclk[st] = (vclk[st] != null ? vclk[st] : now) + dt * pace(st);
      if (on && !wasRush[st]) rushKick(st, now);
      wasRush[st] = on;
    }
  }
  // El arranque: un golpe corto que se ve en la máquina, y los ratones de la estación se ponen manos a la obra.
  function rushKick(st, now) {
    rushAt[st] = now; MFL[st] = { t: now, ms: 200, a: 0.7 };
    nodes.filter((n) => n.st === st && n.crew && !n.inside).forEach((n, i) => react(n, 'go', i * 70));
    if (st === 'drill') { vis.lever = now; const tip = vis.tipY + MO; if (sim.vein && vis.ext > 0.5) for (let i = 0; i < 8; i++) rfx('spark', DCX + (i % 2 ? 3 : -3), tip + 4, { vx: (i % 2 ? 1 : -1) * (0.04 + rnd() * 0.06), vy: -0.05 - rnd() * 0.06, life: 260 + rnd() * 160 }); for (let i = 0; i < 3; i++) rfx('puff', DCX + 9, LV.drill.F - 33, { vx: 0.006, vy: -0.022, life: 900, delay: i * 90 }); }
    if (st === 'refine') { vis.flare = now; for (let i = 0; i < 12; i++) rfx('ember', RX + 11 + rnd() * 8, REFY + 34, { vx: (rnd() - 0.5) * 0.03, vy: -0.03 - rnd() * 0.03, life: 700 + rnd() * 500, delay: i * 25 }); for (let i = 0; i < 3; i++) rfx('puff', RX + 15, REFY - 4, { vx: 0.004, vy: -0.02, life: 1000, delay: i * 120 }); }
    if (st === 'cheese') { vis.splash = now; const c = cheeseVat(); for (let i = 0; i < 9; i++) rfx('drop', c.x + (rnd() - 0.5) * c.w, c.y, { vx: (rnd() - 0.5) * 0.07, vy: -0.06 - rnd() * 0.05, life: 900, floor: c.floor, c: ['#fffbea', '#e8dcb4'], delay: i * 20 }); }
    if (st === 'sell') { vis.coin = now; for (let i = 0; i < 4; i++) rfx('glint', 132 + rnd() * 46, G - 40 + rnd() * 18, { life: 380, delay: i * 80 }); }
  }
  // Boca de la cuba que se ve (para las gotas): la grande (fases II y III) o la de la estación pequeña (fase I).
  const cheeseVat = () => (STGS.cheese === 1 ? { x: CZ().station + 21, y: LV.cheese.F - 46 + 28, w: 10, floor: LV.cheese.F - 1 } : { x: CZ().vat + 19, y: LV.cheese.F - 24 + 6, w: 26, floor: LV.cheese.F - 1 });
  // El sudor: quien trabaja en una estación muy acelerada suelta una gota de la frente de vez en cuando.
  function sweat(n, now, dt) {
    if (heat(n.st) < 0.55 || !running[n.st] || !running[n.st]() || isIdle(n)) return;
    if (every('sw' + n.key, 0.9 + (n.seed % 5) * 0.08, dt)) { const dir = n.face > 0 ? -1 : 1, x = n.x + (n.face > 0 ? 9 : 12), y = n.feet - 19 + (n.st === 'mine' ? MO : 0); rfx('sweat', x, y, { vx: dir * (0.012 + rnd() * 0.01), vy: -0.035, life: 480 }); }
  }

  // ================= DRILL =================
  // ================= REFUERZOS EN DRILL · ARTE PROVISIONAL (feedback PM 2, 28-10-2026; pendiente de aprobación) =========
  // SPRITE: PROVISIONAL (por código, sustituible). Un refuerzo es una modificación física y de energía de la máquina, no una
  // gema suelta: una célula de energía cian encapsulada en un marco de cobre atornillado a la carcasa, un conducto con la
  // costura encendida que baja a la mesa giratoria (un anillo cian) y pulsos que bajan por la barra hasta la broca, uno por
  // vuelta del volante: van con el ciclo de la máquina. Con DOS no hay dos piedras: la misma pieza crece (cámara mayor con
  // anillo de acero y aletas, conducto doble, dos anillos en la mesa, un cable al eje que enciende el aro del volante) y
  // late con más fuerza: dos pulsos por vuelta. Parada (sin veta), el núcleo respira despacio y no hay pulsos. El ×2 del
  // jugador (dorado, temporal) va por debajo: el módulo se pinta después del calor y del destello y nunca queda tapado.
  // Superposición sobre artDrill(): no toca el sprite aprobado ni las fases I–III (la correa de la fase III llega al volante).
  const EN = ['#0b2433', '#1c5f86', '#2f8fc0', '#5ad1ff', '#9fe6ff', '#cff4ff', '#ffffff']; // la paleta del refuerzo del juego
  const enc = (k) => EN[Math.max(0, Math.min(6, Math.round(k)))];
  const BP = []; // pulsos en camino
  let RIM = null; // los píxeles del aro del volante (11 × 11)
  // ---- ACTIVACIÓN (feedback PM 3, 29-10-2026; PROVISIONAL, solo DRILL) ----
  // Lo que se ve al poner un refuerzo: ANTES → ACTIVACIÓN → DESPUÉS, en un segundo, sin parar nada ni mover la cámara. La
  // simulación ya va con el refuerzo desde el toque: esto solo lo cuenta (BA.shown es lo que se ve; sim.boosted, lo que hay).
  //   1.º  la carcasa cae en su sitio y se atornilla (los tornillos brillan) → el núcleo arranca a parpadeos, como un tubo →
  //        la carga baja por la costura y enciende el anillo de la mesa → un pulso grande baja por la barra hasta la broca (o,
  //        parada, el anillo chisporrotea) → la máquina responde: un golpe seco, el volante da vuelta y media de más, el
  //        escape tose y el equipo lo celebra → el núcleo baja a su brillo de siempre.
  //   2.º  la misma pieza evoluciona: se desbloquea (traqueteo), crece en dos golpes con su anillo de acero, salen las aletas,
  //        las espiras del núcleo se encienden de abajo arriba, dos fogonazos de sobrecarga, la carga baja por el conducto
  //        doble y sube por el cable hasta que el aro del volante se enciende entero → dos pulsos seguidos a la broca, golpe más
  //        fuerte, tres vueltas de volante, chispas contenidas en las aletas → se asienta.
  //   Quitarlo: el núcleo se apaga parpadeando y la pieza vuelve atrás (más corto, sin celebración).
  // Si se pide otro cambio mientras se ve uno, se guarda solo el último y se ve al acabar: nada se acumula.
  const BA = { shown: 0, act: null, queue: null };
  const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const easeOut3 = (k) => 1 - Math.pow(1 - k, 3);
  function boostTo(n, animate) {
    n = Math.max(0, Math.min(2, n | 0));
    if (!animate) { BA.shown = n; BA.act = null; BA.queue = null; return; }
    if (BA.act) { BA.queue = n; return; }
    if (n === 2 && BA.shown === 0) { startAct(1); BA.queue = 2; return; }
    if (n !== BA.shown) startAct(n);
  }
  function startAct(n) { const up = n > BA.shown; BA.act = { from: BA.shown, to: n, t0: performance.now(), dur: up ? (n === 2 ? 1250 : 1000) : 380, fired: {} }; }
  function actTick(now) {
    const A = BA.act; if (!A || now - A.t0 < A.dur) return; BA.shown = A.to; BA.act = null; const q = BA.queue; BA.queue = null;
    if (q != null && q !== BA.shown) { if (q === 2 && BA.shown === 0) { startAct(1); BA.queue = 2; } else startAct(q); return; }
    if (A.to > A.from) { BUBS.gapUntil = Math.max(BUBS.gapUntil, now + 450); speak(N('drill', 'operator') || N('drill', 'filler'), A.to === 2 ? 'Full power!' : 'Hear it hum!', true); } // después del efecto y de la cifra, nunca encima
  }
  const once = (A, key, t, at, fn) => { if (!A.fired[key] && t >= at) { A.fired[key] = 1; fn(); } };
  // Respuesta mecánica: un golpe (la máquina salta y vuelve) y vueltas de más en el volante, con frenada.
  function boostKick(now) { const k = vis.bKick; if (!k) return 0; const t = now - k.t0; if (t >= k.ms) { vis.bKick = null; return 0; } return -Math.round(k.amp * Math.sin((Math.PI * t) / k.ms)); }
  function boostSpin(now) { const sp = vis.bSpin; if (!sp) return; const k = Math.min(1, (now - sp.t0) / sp.ms), v = sp.add * easeOut3(k); vis.fly += v - sp.done; sp.done = v; if (k >= 1) vis.bSpin = null; }
  // Mientras se ve una activación, los globos esperan y el que tape la máquina se va antes (no la tapan).
  const boostBusy = () => !!BA.act || !!SA.act || !!(typeof ACT !== 'undefined' && (ACT.refine.act || ACT.cheese.act || ACT.mine.act));
  function drawBoost(now, dt, ox, oy, run, F, tipY, bitF) {
    actTick(now);
    const A = BA.act, t = A ? now - A.t0 : 0, up = A && A.to > A.from, lvl = A ? Math.max(A.from, A.to) : BA.shown;
    if (!lvl) { BP.length = 0; vis.bRev = null; return; }
    const h = heat('drill'), cu = MAT.copper, cx = ox + 15, working = run && vis.ext > 0.95;
    // Cómo es la pieza en este fotograma (lo normal, y lo que cambia durante la activación).
    let grow = lvl === 2 ? 2 : 0, fins = lvl === 2 ? 3 : 0, hdy = 0, hdx = 0, conduit = true, fill = [1, 1], ringK = [1, 1], cable = 1, rimK = 1, coil = 99, glass = 0, riv = 0, Iov = null;
    const rev = Math.floor(vis.fly / (lvl === 2 ? 1.5 : 3));
    if (!A && working && vis.bRev != null && rev !== vis.bRev && BP.length < 6) { BP.push({ t0: now }); vis.bFire = now; }
    vis.bRev = working && !A ? rev : null;
    const fire = Math.max(0, 1 - (now - (vis.bFire || -1e9)) / 260);
    const In = working ? Math.min(1, 0.6 + 0.3 * fire + 0.3 * h) : 0.3 + 0.2 * (0.5 + 0.5 * Math.sin(now / 520)); // brillo de siempre
    const crew = () => nodes.filter((q) => q.st === 'drill' && q.crew && !q.inside);
    const respond = (amp, turns, ms, puffs) => { vis.bLeak = { t0: now, ms: amp > 2 ? 420 : 300 }; vis.bKick = { t0: now, ms: 150 + amp * 30, amp }; vis.bSpin = { t0: now, ms, add: turns * 3, done: 0 }; for (let i = 0; i < puffs; i++) rfx('puff', ox + 24, oy - 3, { vx: 0.006 + rnd() * 0.008, vy: -0.03 - rnd() * 0.012, life: 800 + rnd() * 300, delay: i * 70 }); crew().forEach((q, i) => react(q, 'wow', i * 70)); if (hooks.boostLabel) hooks.boostLabel('drill', A.to, (cx - cam.x) * s, (oy + 4 - cam.y) * s); };
    if (A && up && A.to === 1) {
      hdy = t < 120 ? Math.round(-8 * (1 - Math.pow(t / 120, 2))) : t < 150 ? -1 : 0; conduit = t >= 120; riv = t >= 120 && t < 190 ? 1 : 0; // cae, rebota un píxel y se atornilla
      Iov = t < 140 ? 0 : t < 330 ? [1, 0, 0.8, 0, 0.5, 1][Math.min(5, Math.floor((t - 140) / 32))] : t < 760 ? 1 : 1 + (In - 1) * seg(t, 760, 1000);
      fill[0] = seg(t, 330, 520); ringK[0] = seg(t, 470, 560);
      once(A, 'land', t, 120, () => { vis.bKick = { t0: now, ms: 90, amp: 1 }; for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1; rfx('drop', cx + sd * 5, oy + 9 + (i >> 1) * 6, { vx: sd * (0.02 + rnd() * 0.02), vy: -0.03 - rnd() * 0.02, life: 360, floor: oy + 26, c: ['#d8cfc0', '#9a8a70'] }); } }); // virutas del atornillado
      once(A, 'shot', t, 560, () => { if (working) BP.push({ t0: now - 120, fast: 1, big: 1 }); else for (let i = 0; i < 6; i++) rfx('zap', cx + (i % 2 ? 4 : -4), oy + 28, { vx: (i % 2 ? 1 : -1) * (0.03 + rnd() * 0.04), vy: -0.02 - rnd() * 0.04, life: 200 + rnd() * 120 }); });
      once(A, 'resp', t, 600, () => respond(2, 1.5, 520, 2));
    } else if (A && up && A.to === 2) {
      grow = t < 140 ? 0 : t < 190 ? 1 : 2; hdx = t < 90 && Math.floor(t / 30) % 2 ? 1 : 0; riv = (t < 90 && Math.floor(t / 45) % 2) || (t >= 190 && t < 240) ? 1 : 0;
      fins = t < 190 ? 0 : Math.min(3, 1 + Math.floor((t - 190) / 35));
      coil = Math.floor(seg(t, 230, 420) * 6) - 1; // espiras encendidas (de abajo arriba)
      Iov = t < 230 ? In : t < 900 ? 1 : 1 + (In - 1) * seg(t, 900, 1250);
      glass = (t >= 360 && t < 380) || (t >= 400 && t < 420) ? 1 : 0; // dos fogonazos de sobrecarga
      fill[1] = seg(t, 420, 560); ringK[1] = seg(t, 470, 560); cable = seg(t, 420, 500); rimK = seg(t, 500, 640);
      once(A, 'clack', t, 190, () => (vis.bKick = { t0: now, ms: 80, amp: 1 }));
      once(A, 'shot1', t, 640, () => { if (working) BP.push({ t0: now - 120, fast: 1, big: 1 }); });
      once(A, 'shot2', t, 740, () => { if (working) BP.push({ t0: now - 120, fast: 1, big: 1 }); });
      once(A, 'resp', t, 660, () => { respond(3, 3, 760, 3); for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1; rfx('zap', cx + sd * 9, oy + 9 + (i >> 1) * 3, { vx: sd * (0.03 + rnd() * 0.03), vy: (rnd() - 0.5) * 0.02, life: 160 + rnd() * 100, delay: i * 25 }); } });
    } else if (A) { // quitar
      Iov = t < 200 ? [0.8, 0.1, 0.6, 0.05][Math.floor(t / 50)] : 0.05; fill = [0, 0]; ringK = [0, 0]; cable = 0; rimK = 0;
      if (A.from === 2) { fins = t < 120 ? 3 : Math.max(0, 3 - Math.floor((t - 120) / 33)); grow = t < 220 ? 2 : t < 300 ? 1 : 0; }
      if (A.to === 0) hdy = t < 250 ? 0 : -Math.round(4 * seg(t, 250, 380));
      once(A, 'down', t, 0, () => rfx('zap', cx, oy + 13, { vx: 0.02, vy: -0.03, life: 200 }));
    }
    const two = grow === 2, I = Iov == null ? In : Iov;
    const lk = vis.bLeak && now - vis.bLeak.t0 < vis.bLeak.ms ? 1 - (now - vis.bLeak.t0) / vis.bLeak.ms : 0;
    if (lk > 0) { ctx.globalAlpha = Math.min(1, 1.2 * lk); for (const y of [10, 12, 14, 16]) R(ox + 8, oy + y, 13, 1, lk > 0.5 ? EN[5] : EN[3]); R(ox + 8, oy + 20, 13, 1, EN[3]); ctx.globalAlpha = 1; glowH(cx, oy + 14, 12, '#9fe6ff', 0.2 * lk); } else if (vis.bLeak) vis.bLeak = null;
    glowH(cx, oy + 13, two ? 12 : 8, '#5ad1ff', (two ? 0.3 : 0.22) * (0.25 + 0.75 * I) * (A && up ? 1.3 : 1));
    // Conducto de cobre de la célula a la mesa giratoria (doble con dos), con la costura encendida (se llena de arriba abajo).
    const cy0 = oy + 19 + (two ? 1 : 0), cy1 = oy + 26, hw = grow ? 3 : 2, seams = grow ? [cx - 1, cx + 1] : [cx];
    if (conduit) {
      R(cx - hw, cy0, hw * 2 + 1, cy1 - cy0, INK4); R(cx - hw + 1, cy0, hw * 2 - 1, cy1 - cy0, cu[2]); R(cx - hw + 1, cy0, 1, cy1 - cy0, cu[3]); R(cx + hw - 1, cy0, 1, cy1 - cy0, cu[1]);
      seams.forEach((sx, k) => { const f = fill[k] == null ? 1 : fill[k], fy = cy0 + Math.round((cy1 - cy0) * f); R(sx, cy0, 1, cy1 - cy0, EN[1]); if (fy > cy0) R(sx, cy0, 1, fy - cy0, A && up && f < 1 ? EN[5] : enc(1 + 2.5 * I)); if (A && up && f > 0 && f < 1) R(sx, fy - 1, 1, 1, EN[6]); });
      for (const y of [cy0 + 1, cy1 - 2]) { R(cx - hw - 1, y, hw * 2 + 3, 1, INK4); R(cx - hw, y, hw * 2 + 1, 1, cu[4]); }
    }
    // La mesa giratoria: el anillo se enciende del centro hacia fuera (dos con dos refuerzos).
    (two ? [oy + 27, oy + 29] : [oy + 28]).forEach((y, k) => { const rk = ringK[k] == null ? 1 : ringK[k], half = Math.round(4 * rk); if (half <= 0) return; R(cx - half, y, half * 2, 1, enc(1.5 + 2 * I)); R(cx - 1, y, 3, 1, enc(2.5 + 2.5 * I)); if (A && up && rk < 1) { R(cx - half, y, 1, 1, EN[6]); R(cx + half - 1, y, 1, 1, EN[6]); } });
    // La célula: contorno, marco de cobre (con dos, además un anillo de acero), cristal oscuro y el núcleo.
    const w = 9 + grow * 2, hh = 11 + grow, x0 = ox + 11 - grow + hdx, y0 = oy + 8 - (grow ? 1 : 0) + hdy;
    if (fins) for (let y = y0 + 2; y < y0 + hh - 2; y += 3) for (const side of [-1, 1]) { const fx = side < 0 ? x0 - fins : x0 + w; R(fx, y - 1, fins, 3, INK4); R(fx, y, fins, 1, MAT.steel[3]); R(side < 0 ? fx : fx + fins - 1, y, 1, 1, enc(1 + 2 * I)); }
    R(x0, y0, w, hh, INK4); R(x0 + 1, y0 + 1, w - 2, hh - 2, cu[2]); R(x0 + 1, y0 + 1, w - 2, 1, cu[3]); R(x0 + 1, y0 + 1, 1, hh - 2, cu[3]); R(x0 + 1, y0 + hh - 2, w - 2, 1, cu[1]); R(x0 + w - 2, y0 + 1, 1, hh - 2, cu[1]);
    if (two) { R(x0 + 2, y0 + 2, w - 4, hh - 4, MAT.steel[3]); R(x0 + 2, y0 + hh - 3, w - 4, 1, MAT.steel[1]); R(x0 + w - 3, y0 + 2, 1, hh - 4, MAT.steel[1]); }
    const G = two ? 1 : 0, gx = x0 + 2 + G, gy = y0 + 2 + G, gw = w - 4 - G * 2, gh = hh - 4 - G * 2; // el cristal
    R(gx, gy, gw, gh, glass ? EN[4] : EN[0]);
    const kx = gx + 1, ky = gy + 1, kw = gw - 2, kh = gh - 2; // el núcleo
    if (!glass && I > 0.02) { R(kx, ky, kw, kh, enc(1.5 + 1.5 * I)); R(kx + 1, ky, kw - 2, kh, enc(2.5 + 2 * I)); R(cx + hdx, ky + 1, 1, kh - 2, enc(3.5 + 2.5 * I)); if (A && up && I >= 1) R(cx + hdx, ky + 2, 1, Math.max(1, kh - 4), EN[6]); }
    if (two) { let i = 0; for (let y = ky + kh - 1; y >= ky; y -= 2, i++) { const c = coil === 99 ? cu[3] : i <= coil ? (i === coil ? EN[6] : EN[4]) : cu[1]; R(kx, y, 1, 1, c); R(kx + kw - 1, y, 1, 1, c); } } // espiras: un núcleo bobinado
    R(gx, gy, 1, 2, '#cfe8f0'); // brillo del cristal
    for (const [rx, ry] of [[x0 + 1, y0 + 1], [x0 + w - 2, y0 + 1], [x0 + 1, y0 + hh - 2], [x0 + w - 2, y0 + hh - 2]]) R(rx, ry, 1, 1, riv ? '#ffffff' : cu[4]); // tornillos
    if (two && cable > 0) {
      // El cable al eje del volante (se llena de abajo arriba) y el aro, que se enciende dando la vuelta.
      const cl = y0 - oy - 1, cf = Math.round(cl * cable); R(ox + 17, oy + 1, 2, cl, INK4); R(ox + 17, oy + 1, 1, cl, EN[1]); if (cf > 0) R(ox + 17, oy + 1 + cl - cf, 1, cf, A && up && cable < 1 ? EN[5] : enc(1.5 + 2 * I));
      if (cable >= 1) R(ox + 14, oy - 5, 1, 6, enc(2 + 2 * I));
      if (rimK > 0) {
        if (!RIM) { RIM = []; for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) { const d = Math.hypot(x - 5, y - 5); if (d >= 4.4 && d < 5.4) RIM.push([x, y, Math.atan2(y - 5, x - 5)]); } }
        const wx = ox + 8, wy = oy - 15, arc = vis.fly * 2.1, lim = rimK * 2 * Math.PI;
        for (const [x, y, a] of RIM) { const from = ((a + Math.PI / 2) + 2 * Math.PI) % (2 * Math.PI); if (from > lim) continue; const da = Math.abs(((a - arc) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); R(wx + x, wy + y, 1, 1, A && up && rimK < 1 && lim - from < 0.6 ? EN[6] : da < 0.5 && working ? EN[5] : enc(1 + 1.5 * I)); }
      }
    }
    // Pulsos: bajan por el conducto (120 ms) y por la barra hasta la broca; al llegar, la broca se enciende y salta un
    // chisporroteo. Los de la activación son más rápidos y más gordos.
    const len = Math.max(1, tipY - F), cMs = 120;
    for (let i = BP.length - 1; i >= 0; i--) {
      const P = BP[i], tt = now - P.t0, big = P.big, rMs = len / (P.fast ? 0.55 : 0.3);
      if (tt < cMs) { const y = Math.round(oy + 13 + (cy1 + 2 - oy - 13) * (tt / cMs)); for (const sx of seams) { R(sx, y - 2, 1, 3, EN[5]); R(sx, y, 1, 1, EN[6]); } continue; }
      const k = (tt - cMs) / rMs;
      if (k >= 1) { BP.splice(i, 1); vis.bHit = now; vis.bHitBig = big ? now : vis.bHitBig; for (let j = 0; j < (big ? 10 : two ? 6 : 4); j++) rfx('zap', DCX + (j % 2 ? 3 : -3), tipY + 4, { vx: (j % 2 ? 1 : -1) * (0.03 + rnd() * (big ? 0.08 : 0.05)), vy: -0.02 - rnd() * (big ? 0.08 : 0.05), life: 160 + rnd() * 140 }); continue; }
      const y = Math.round(F + len * k); if (y >= F && y < F + BEAM) continue; // dentro del suelo no se ve
      glowH(DCX, y - 2, big ? 6 : two ? 4 : 3, '#5ad1ff', big ? 0.5 : 0.35);
      R(DCX - 1, y - 3, 3, 4, EN[3]); R(DCX, y - (two || big ? 7 : 5), 1, two || big ? 7 : 5, EN[5]); R(DCX, y, 1, 1, EN[6]); R(DCX, y - (two || big ? 11 : 8), 1, 3, EN[2]);
      if (big) { R(DCX - 2, y - 2, 1, 2, EN[4]); R(DCX + 2, y - 2, 1, 2, EN[4]); }
    }
    // Broca: borde cian-blanco trabajando, más fuerte al llegar cada pulso (y más con el de la activación).
    if (working) {
      const kh2 = Math.max(0, 1 - (now - (vis.bHit || -1e9)) / 240), kb = Math.max(0, 1 - (now - (vis.bHitBig || -1e9)) / 420), bit = artBit(bitF), rim = tintC(bit, kh2 > 0.4 || kb > 0.3 ? EN[5] : EN[3]);
      if (kh2 > 0 || kb > 0) glowH(DCX, tipY + 3, kb > 0 ? 9 : 6, '#5ad1ff', Math.max(0.4 * kh2, 0.55 * kb));
      ctx.globalAlpha = Math.min(1, 0.55 + 0.45 * Math.max(kh2, kb)); for (const [dx, dy] of [[-1, 0], [1, 0], [0, 1]]) ctx.drawImage(rim, DCX - 4 + dx, tipY - 2 + dy); ctx.globalAlpha = 1;
      ctx.drawImage(bit, DCX - 4, tipY - 2);
    }
  }
  // ================= REFUERZOS EN REFINE, CHEESE Y MINE · EXPLORACIÓN (feedback PM 3, 29-10-2026) =================
  // PROVISIONAL, sin activación (la de DRILL se valida primero). Mismo lenguaje que DRILL (cobre y remaches, cian del juego,
  // energía que va a una pieza real y late con su ciclo, el segundo refuerzo hace crecer la misma instalación), pero cada
  // máquina con su propia expresión. Ninguna repite un módulo por cada pieza repetida.
  //   REFINE · temperatura y presión. Rinde más Base (no va más deprisa). Una célula de presión atornillada al tiro del horno
  //     (la única fuente de calor) manda frío por UNA línea al serpentín de cada alambique: en la fase III la misma línea
  //     sigue hasta el segundo. La llama gana un núcleo azul. Al acabar cada hornada, un pulso recorre la línea, los aros del
  //     serpentín se encienden y gotea una gota de más. Con dos: la célula crece (esfera de presión con aguja), la línea es
  //     doble, todos los aros del serpentín llevan frío y la llama azul es mayor; la válvula de alivio suelta vaho en cada hornada.
  //   CHEESE · la maquinaria de elaborar. Un motor de bobina sobre el eje del agitador (el mecanismo principal de la cuba):
  //     la pala barre más deprisa y cada vuelta baja una chispa por el eje a la cuajada. Con dos: el mismo motor crece y
  //     mueve una transmisión común, un eje por encima con un engranaje sobre cada prensa (una en la fase II, dos en la III).
  //   MINE · el frente activo. No hay máquina: hay golpes. Una caja de carga cuelga de la viga y su arnés baja al frente,
  //     con varillas clavadas donde pica el picador; cada golpe se propaga en grietas cian desde las varillas. Con dos: la
  //     caja crece y el arnés sube hasta donde pica el del andamio, y las grietas llegan más lejos.
  // Tubería de cobre con la costura encendida: 4 px con una (borde, luz, costura, borde), 6 px con dos.
  function pipeH(x0, x1, y, seams, I) { const two = seams.length > 1, h = two ? 6 : 4, t = y - 1; R(x0, t, x1 - x0, h, INK4); R(x0, t + 1, x1 - x0, h - 2, MAT.copper[2]); R(x0, t + 1, x1 - x0, 1, MAT.copper[3]); R(x0, t + 2, x1 - x0, 1, enc(1 + 2.5 * I)); if (two) R(x0, t + 4, x1 - x0, 1, enc(1 + 2.5 * I)); }
  function pipeV(x, y0, y1, seams, I) { const two = seams.length > 1, w = two ? 6 : 4, l = x - 1; R(l, y0, w, y1 - y0, INK4); R(l + 1, y0, w - 2, y1 - y0, MAT.copper[2]); R(l + 1, y0, 1, y1 - y0, MAT.copper[3]); R(l + 2, y0, 1, y1 - y0, enc(1 + 2.5 * I)); if (two) R(l + 4, y0, 1, y1 - y0, enc(1 + 2.5 * I)); }
  const breath = (now) => 0.3 + 0.2 * (0.5 + 0.5 * Math.sin(now / 520));
  // ---- ACTIVACIÓN DE REFINE, CHEESE Y MINE (feedback PM 4, 29-10-2026) ----
  // La misma estructura que DRILL y SHOP: lo que se ve (shown) va detrás de lo que hay (sim.boosted); una activación a la vez
  // por estación, con cola del último cambio; la cámara no se mueve y la economía no se toca (nada de golpes ni hornadas de
  // más: la activación solo lo cuenta). Cada estación con su propia expresión (ver cada función).
  const OUT_MS = 520;
  const ACT = { refine: { shown: 0, act: null, queue: null, d: [900, 1050] }, cheese: { shown: 0, act: null, queue: null, d: [900, 1100] }, mine: { shown: 0, act: null, queue: null, d: [900, 1050] } };
  function stStart(st, n) { const S = ACT[st], up = n > S.shown; S.act = { from: S.shown, to: n, t0: performance.now(), dur: up ? S.d[n === 2 ? 1 : 0] : OUT_MS, fired: {} }; }
  function stTo(st, n, animate) {
    const S = ACT[st]; n = Math.max(0, Math.min(2, n | 0));
    if (!animate) { S.shown = n; S.act = null; S.queue = null; return; }
    if (S.act) { S.queue = n; return; }
    if (n === 2 && S.shown === 0) { stStart(st, 1); S.queue = 2; return; }
    if (n !== S.shown) stStart(st, n);
  }
  function stLook(st, now) {
    const S = ACT[st];
    if (S.act && now - S.act.t0 >= S.act.dur) { S.shown = S.act.to; S.act = null; const q = S.queue; S.queue = null; if (q != null && q !== S.shown) { if (q === 2 && S.shown === 0) { stStart(st, 1); S.queue = 2; } else stStart(st, q); } }
    const A = S.act, t = A ? now - A.t0 : 0, up = !!A && A.to > A.from;
    return { lvl: A ? Math.max(A.from, A.to) : S.shown, A, t, up, in1: up && A.to === 1, in2: up && A.to === 2, down: !!A && !up, dk: A && !up ? 1 - seg(t, 0, OUT_MS - 40) : 1, lift: A && !up && A.to === 0 ? seg(t, OUT_MS - 170, OUT_MS) : 0 };
  }
  // Clímax común: el equipo de la estación lo celebra y sube la cifra (BASE en la refinería, SPEED en las demás).
  const stClimax = (st, L, at, wx, wy) => once(L.A, 'cheer', L.t, at, () => { nodes.filter((q) => q.st === st && q.crew && !q.inside).forEach((q, i) => react(q, 'wow', i * 60)); if (hooks.boostLabel) hooks.boostLabel(st, L.A.to, (wx - cam.x) * s, (wy - cam.y) * s); });
  const dropIn = (t, ms = 120, h = 4) => (t < ms ? -Math.round(h * (1 - Math.pow(t / ms, 2))) : t < ms + 25 ? -1 : 0); // cae, rebota un píxel y se asienta

  // REFINE · más capacidad, no más ritmo. Activar: la célula cae y se abraza al tiro, se llena de refrigerante, un frente de
  // frío recorre la línea común (en la fase III llega a la vez a los dos serpentines), los aros se escarchan de abajo arriba
  // y la llama gana su núcleo azul; el clímax es una gota gorda que cae a la vez de cada caño (rinde más). Con dos: la célula
  // crece, la aguja del manómetro sube con un rebote, la válvula de alivio suelta vaho y se carga la segunda costura.
  function drawBoostRefine(now, run) {
    const L = stLook('refine', now), n = L.lvl; if (!n) return;
    const two = n === 2, cu = MAT.copper, vn = vnow('refine', now), fire = Math.max(0, 1 - (now - (vis.rFire || -1e9)) / 420), t = L.t;
    let I = run ? Math.min(1, 0.55 + 0.2 * (0.5 + 0.5 * Math.sin(vn / 260)) + 0.35 * fire) : breath(now);
    // Cómo está cada pieza en este fotograma (1 = como siempre).
    let grow = two ? 2 : 0, dy = 0, fillK = 1, line1 = 1, line2 = two ? 1 : 0, rings1 = 1, rings2 = two ? 1 : 0, blue = 1, needle = 1, frost = 0, climax = 0;
    if (L.in1) { dy = dropIn(t); fillK = seg(t, 60, 260); line1 = seg(t, 200, 480); rings1 = seg(t, 420, 620); blue = t < 520 ? 0 : t < 560 ? 1 : t < 600 ? 0 : 1; frost = t > 420 && t < 760 ? 1 - seg(t, 600, 760) : 0; climax = t > 640 ? 1 - seg(t, 640, 900) : 0; I = Math.max(I, 0.8 * fillK); }
    if (L.in2) { grow = t < 80 ? 0 : t < 160 ? 1 : 2; needle = seg(t, 160, 520); line2 = seg(t, 250, 550); rings2 = seg(t, 450, 650); frost = t > 450 && t < 820 ? 1 - seg(t, 650, 820) : 0; climax = t > 700 ? 1 - seg(t, 700, 1000) : 0; I = 1; }
    if (L.down) { I *= L.dk; if (L.A.from === 2) { line2 = L.dk; rings2 = L.dk; needle = L.dk; grow = t > OUT_MS - 120 ? (L.A.to === 0 ? 0 : 1) : 2; } if (L.A.to === 0) { fillK = L.dk; line1 = L.dk; rings1 = L.dk; blue = L.dk > 0.5 ? 1 : 0; dy = -Math.round(4 * L.lift); } }
    const bigTwo = grow === 2;
    // Llama con núcleo azul (más temperatura) en la base del fuego.
    if (run && blue > 0) { const fl = Math.floor(vn / 90) % 3; R(RX + 11 - (bigTwo ? 1 : 0), REFY + 45, 8 + (bigTwo ? 2 : 0), 1, fl ? '#2f8fc0' : '#5ad1ff'); R(RX + 13, REFY + 44, 4, 1, bigTwo ? '#cff4ff' : '#9fe6ff'); if (bigTwo) R(RX + 12, REFY + 43, 6, 1, fl === 1 ? '#5ad1ff' : '#2f8fc0'); }
    const ly = REFY + 7, seams = line2 > 0 ? [-1, 1] : [0], dropX = RX + 56, stills = [dropX].concat(STGS.refine >= 3 ? [STILL2.x + 28] : []), lineEnd = stills[stills.length - 1];
    const cx0 = RX + 19, cw = bigTwo ? 17 : grow === 1 ? 15 : 13, chh = bigTwo ? 13 : grow === 1 ? 11 : 10, cy0 = REFY + 1 + dy;
    const hx0 = cx0 + cw - 1, hx1 = lineEnd + 3, frontAt = (k) => Math.round(hx0 + (hx1 - hx0) * Math.min(1, k * 1.25));
    pipeH(hx0, hx1, ly, seams, I);
    // El frente de frío: lo que aún no ha alcanzado queda con la costura apagada.
    const darkFrom = (k, row) => { if (k >= 1) return; const fx = frontAt(k); if (fx < hx1) R(fx, ly + row, hx1 - fx, 1, EN[1]); if (k > 0) R(fx - 1, ly + row, 2, 1, EN[6]); };
    darkFrom(line1, 1); if (line2 > 0 && line2 < 1) darkFrom(line2, 3);
    for (const x of stills) {
      const xf = (x - hx0) / Math.max(1, hx1 - hx0), dk = Math.max(0, Math.min(1, (line1 * 1.25 - xf) * 4)); // el frente baja por cada bajante al pasar por encima
      pipeV(x, ly + (seams.length > 1 ? 5 : 3), REFY + 29, seams, I); R(x - 2, REFY + 27, seams.length > 1 ? 8 : 6, 2, INK4); R(x - 1, REFY + 27, seams.length > 1 ? 6 : 4, 1, MAT.copper[4]);
      if (dk < 1) { const y0 = ly + 3 + Math.round((REFY + 29 - ly - 3) * dk); R(x + 1, y0, 1, REFY + 29 - y0, EN[1]); if (dk > 0) R(x + 1, y0 - 1, 1, 2, EN[6]); }
    }
    // Los aros del serpentín (uno de cada dos con uno; todos con dos): se encienden de abajo arriba; al activarlo, escarcha.
    for (const x of stills) { const tx = x - 6; [12, 15, 18, 21, 24].forEach((ry, i) => { const odd = i % 2 === 1, k = odd ? rings1 : rings2; if (k <= 0) return; if ((4 - i) / 5 >= k + 0.001 && k < 1) return; R(tx, REFY + 18 + ry, 8, 1, fire > 0.3 || (k < 1 && k > 0) ? EN[5] : enc(1 + 2 * I)); if (frost > 0 && (i + Math.floor(now / 80)) % 3 === 0) R(tx + 1 + ((i * 3) % 6), REFY + 17 + ry, 1, 1, '#ffffff'); }); }
    // Gota de más en cada caño mientras trabaja; en el clímax, una gota gorda a la vez en todos (rinde más, no va más deprisa).
    if (run && !L.up) for (const x of stills) { const ph2 = ((vn + 350) % 1400) / 1400; if (ph2 < 0.5) { const yy = REFY + 47 + Math.floor(ph2 * 8); R(x - 1, yy, 1, 1, EN[5]); R(x - 1, yy - 1, 1, 1, '#efe6c4'); } }
    if (climax > 0) for (const x of stills) { const k = 1 - climax, yy = REFY + 46 + Math.round(Math.min(1, k * 2) * 4); if (k < 0.5) { R(x - 2, yy, 2, 2, '#efe6c4'); R(x - 2, yy, 1, 1, EN[6]); if (two || L.in2) { R(x + 1, yy - 1, 2, 2, '#efe6c4'); } } else { R(x - 4, REFY + 50, 6, 1, '#efe6c4'); R(x - 3, REFY + 49, 1, 1, EN[5]); R(x + 1, REFY + 49, 1, 1, EN[5]); } }
    if (fire > 0 && !L.up) { const k = 1 - fire, px = Math.round(hx0 + 1 + (lineEnd - hx0) * Math.min(1, k * 1.6)); R(px - 2, ly + 1, 5, 1, EN[5]); R(px, ly + 1, 1, 1, EN[6]); if (seams.length > 1) { R(px - 2, ly + 3, 5, 1, EN[5]); } }
    // La célula abrazada al tiro: marco de cobre, cristal con el refrigerante (se llena al activarla) y, con dos, la esfera.
    R(cx0 - 2, cy0 + 2, 3, chh - 4, INK4); R(cx0 - 1, cy0 + 3, 1, chh - 6, (L.in1 && t < 160 && t > 110) ? '#ffffff' : MAT.iron[3]);
    R(cx0, cy0, cw, chh, INK4); R(cx0 + 1, cy0 + 1, cw - 2, chh - 2, cu[2]); R(cx0 + 1, cy0 + 1, cw - 2, 1, cu[3]); R(cx0 + 1, cy0 + chh - 2, cw - 2, 1, cu[1]);
    const gw = bigTwo ? 8 : 7, gx = cx0 + 2, gy = cy0 + 2, gh = chh - 4; R(gx, gy, gw, gh, EN[0]);
    const lvl = Math.round(gh * (0.45 + 0.4 * I) * fillK); if (lvl > 0) { R(gx, gy + gh - lvl, gw, lvl, enc(1.5 + 2 * I)); R(gx, gy + gh - lvl, gw, 1, enc(3 + 2.5 * I)); }
    for (let b = 0; b < (bigTwo ? 3 : 2) && lvl > 1; b++) { const k = ((now / (L.up ? 400 : 900)) + b / (bigTwo ? 3 : 2)) % 1, by = gy + gh - 1 - Math.floor(k * (lvl - 1)); if (by >= gy + gh - lvl) R(gx + 1 + ((b * 3) % (gw - 2)), by, 1, 1, EN[6]); }
    R(gx, gy, 1, 1, '#cfe8f0');
    if (bigTwo) { const dx = cx0 + cw - 7, ddy = cy0 + 3; R(dx, ddy, 5, 5, INK4); R(dx + 1, ddy + 1, 3, 3, '#efe6c4'); R(dx, ddy, 5, 1, enc(2 + 2 * I)); const over = L.in2 && needle < 1 ? Math.sin(needle * Math.PI) * 0.5 : 0, a = -2.4 + (1.6 * I + 0.4 * fire) * needle + over; R(dx + 2 + Math.round(Math.cos(a) * 1.4), ddy + 2 + Math.round(Math.sin(a) * 1.4), 1, 1, INK4); R(dx + 2, ddy + 2, 1, 1, INK4);
      R(cx0 + 5, cy0 - 3, 3, 3, INK4); R(cx0 + 6, cy0 - 2, 1, 2, cu[3]); const vent = L.in2 ? Math.max(0, 1 - Math.abs(t - 330) / 140) : fire > 0.5 ? fire - 0.5 : 0; if (vent > 0) { ctx.globalAlpha = Math.min(1, vent * 1.4); disc(cx0 + 6, cy0 - 5 - Math.round((1 - vent) * 6), 2, '#e6faff'); ctx.globalAlpha = 1; } }
    for (const [rx, ry] of [[cx0 + 1, cy0 + 1], [cx0 + cw - 2, cy0 + 1], [cx0 + 1, cy0 + chh - 2], [cx0 + cw - 2, cy0 + chh - 2]]) R(rx, ry, 1, 1, L.in1 && t > 110 && t < 180 ? '#ffffff' : cu[4]);
    if (L.up) stClimax('refine', L, L.in1 ? 640 : 700, RX + 50, REFY + 4);
  }
  // CHEESE · la maquinaria de elaborar. Activar: el motor cae sobre el eje del agitador, su bobina se enciende espira a espira,
  // arranca (la pala da un barrido de más y una chispa baja a la cuajada, que borbotea). Con dos: el eje común se tiende hasta
  // las prensas, cada engranaje aparece al llegar, la chispa recorre la transmisión y cada prensa responde por turno.
  function drawBoostCheese(now, run) {
    const L = stLook('cheese', now), n = L.lvl; if (!n) return;
    const two = n === 2, cu = MAT.copper, vn = vnow('cheese', now), F = LV.cheese.F, z = CZ(), t = L.t;
    let I = run ? 0.6 + 0.3 * (0.5 + 0.5 * Math.sin(vn / 180)) : breath(now);
    let grow = two ? 1 : 0, dy = 0, coilK = 1, shaftK = two ? 1 : 0, spinFast = false;
    if (L.in1) { dy = dropIn(t); coilK = seg(t, 100, 300); spinFast = t > 250 && t < 650; I = Math.max(I, coilK);
      once(L.A, 'spin', t, 300, () => (vis.stirBurst = { t0: now, ms: 500, add: 1.5, done: 0 }));
      if (STGS.cheese > 1 && t > 400 && t < 680) { const vx = z.vat, vy = F - 24; for (let i = 0; i < 4; i++) { const k = ((t - 400) / 70 + i * 0.37) % 1; R(vx + 8 + i * 7, vy + 7 - Math.round(Math.sin(k * Math.PI) * 3), 1, 1, i % 2 ? '#fffbea' : '#efe6c4'); } }
      once(L.A, 'steam', t, 450, () => { const vx = STGS.cheese > 1 ? z.vat + 19 : z.station + 21, vy = STGS.cheese > 1 ? F - 24 : F - 22; for (let i = 0; i < 3; i++) rfx('steam', vx + (i - 1) * 6, vy, { vx: (i - 1) * 0.004, vy: -0.022, life: 900, c: '#fbf6e8', delay: i * 60 }); }); }
    if (L.in2) { grow = t < 150 ? 0 : 1; shaftK = seg(t, 150, 420); spinFast = t > 420 && t < 900; I = 1; }
    if (L.down) { I *= L.dk; if (L.A.from === 2) { shaftK = L.dk; grow = t > OUT_MS - 120 ? 0 : 1; } if (L.A.to === 0) { coilK = L.dk; dy = -Math.round(4 * L.lift); } }
    // El barrido de más de la pala al arrancar (solo lo que se ve).
    const sb = vis.stirBurst; if (sb) { const k = Math.min(1, (now - sb.t0) / sb.ms), v = sb.add * (1 - Math.pow(1 - k, 3)); vis.stir += v - sb.done; sb.done = v; if (k >= 1) vis.stirBurst = null; }
    const ax = STGS.cheese === 1 ? z.station + 21 : z.vat + 19, ay = STGS.cheese === 1 ? F - 46 : F - 24;
    const mw = grow ? 15 : 11, mh = grow ? 9 : 8, mx = ax - (mw >> 1), my = ay - mh - 3 + dy;
    R(ax - 1, my + mh, 3, ay - my - mh + 1, INK4); R(ax, my + mh, 1, ay - my - mh + 1, MAT.steel[3]);
    const stirK = (vis.stir % 1 + 1) % 1; if ((run || L.in1) && stirK < 0.35) { const yy = my + mh + Math.round((ay - my - mh) * (stirK / 0.35)); R(ax, yy, 1, 2, EN[5]); }
    if ((run || L.in1) && stirK > 0.35 && stirK < 0.5 && STGS.cheese > 1) { const vx = z.vat, vy = F - 24; for (let i = 0; i < 3; i++) R(vx + 19 + Math.round(Math.sin(vn / 70 + i * 2.1) * 9), vy + 8 - (i % 2), 1, 1, EN[4]); }
    // Con dos: la transmisión común hacia las prensas.
    if (shaftK > 0 && STGS.cheese > 1) {
      const sy = my + 3, xs = z.press.map((x) => x + 8), x1 = xs[xs.length - 1], xe = Math.round(mx + mw + (x1 + 2 - mx - mw) * shaftK);
      R(mx + mw, sy - 1, xe - mx - mw, 3, INK4); R(mx + mw, sy, xe - mx - mw, 1, MAT.steel[3]);
      const tooth = Math.floor(vn / (spinFast ? 30 : 60)) % 4; if (!L.in2 || t > 420) for (let x = mx + mw + tooth; x < xe; x += 4) R(x, sy, 1, 1, enc(1.5 + 2 * I));
      xs.forEach((px, i) => {
        if (px > xe) return; const dk = L.in2 ? seg(t, 200 + i * 90, 360 + i * 90) : 1, yb = sy + 3 + Math.round((F - 22 - sy - 2) * dk);
        R(px - 2, sy - 2, 5, 5, INK4); R(px - 1, sy - 1, 3, 3, MAT.iron[3]); R(px, sy, 1, 1, enc(2 + 2.5 * I)); if (yb > sy + 3) { R(px - 1, sy + 3, 3, yb - sy - 3, INK4); R(px, sy + 3, 1, yb - sy - 3, MAT.steel[3]); }
        // La chispa recorre la transmisión y cada prensa responde por turno (destello en su husillo y un soplo en la base).
        if (L.in2) { const hit = 520 + i * 110; if (t > hit - 120 && t < hit) { const k = (t - hit + 120) / 120; R(Math.round(mx + mw + (px - mx - mw) * k), sy, 2, 1, EN[6]); } if (t >= hit && t < hit + 160) R(px - 1, F - 24, 3, 2, EN[5]); once(L.A, 'press' + i, t, hit, () => rfx('puff', px, F - 2, { vx: 0, vy: -0.012, life: 500, c: '#e8dcb4' })); }
        else if (run && Math.floor((vn + px * 13) / 120) % 4 === 0) R(px, F - 24, 1, 1, EN[5]);
      });
    }
    if (shaftK > 0 && STGS.cheese === 1) { const px = mx + mw + 5, sy = my + 3; R(mx + mw, sy - 1, 7, 3, INK4); R(mx + mw, sy, 7, 1, MAT.steel[3]); R(px - 2, sy - 2, 5, 5, INK4); R(px - 1, sy - 1, 3, 3, MAT.iron[3]); R(px + (Math.floor(vn / (spinFast ? 40 : 90)) % 2 ? 0 : -1), sy, 1, 1, enc(2 + 2.5 * I)); }
    // El motor: la bobina se enciende espira a espira al montarlo; las espiras corren con el giro (más deprisa al arrancar).
    R(mx, my, mw, mh, INK4); R(mx + 1, my + 1, mw - 2, mh - 2, cu[2]); R(mx + 1, my + 1, mw - 2, 1, cu[3]); R(mx + 1, my + mh - 2, mw - 2, 1, cu[1]);
    const wx = mx + 3, ww = mw - 6, wy = my + 2, wh = mh - 4; R(wx, wy, ww, wh, EN[0]); const off = run || spinFast ? Math.floor(vn / (spinFast ? 35 : 70)) % 2 : 0;
    for (let x = 0; x < ww; x++) { if (x >= Math.round(ww * coilK)) break; R(wx + x, wy, 1, wh, (x + off) % 2 ? enc(1 + 1.5 * I) : enc(2.5 + 2.5 * I)); }
    for (const ex of [mx - 2, mx + mw]) { R(ex, my + 2, 2, mh - 4, INK4); R(ex, my + 3, 2, mh - 6, MAT.iron[3]); }
    if (grow) { R(mx + 2, my - 2, mw - 4, 2, INK4); R(mx + 3, my - 1, mw - 6, 1, cu[3]); for (let x = mx + 4; x < mx + mw - 4; x += 2) R(x, my - 1, 1, 1, enc(1 + 2 * I)); }
    for (const [rx, ry] of [[mx + 1, my + 1], [mx + mw - 2, my + 1]]) R(rx, ry, 1, 1, L.in1 && t > 110 && t < 180 ? '#ffffff' : cu[4]);
    if (L.up) stClimax('cheese', L, L.in1 ? 600 : 760, ax, my - 6);
  }
  // MINE · las operaciones de excavación. Activar: el acumulador baja por su cadena, el cable se desenrolla hacia el frente,
  // las varillas se clavan una a una (con polvo), las barras se cargan y sale una primera descarga: grietas cian por todo el
  // frente y polvillo que cae; los mineros lo miran. Con dos: crece, el arnés trepa hasta el andamio con sus varillas y la
  // descarga cubre el frente entero. Sin golpes de más: la economía no cambia.
  function drawBoostMine(now) {
    const L = stLook('mine', now), n = L.lvl; if (!n) return;
    const two = n === 2, cu = MAT.copper, F = LV.mine.F, y0 = LV.mine.y0, digging = !sim.vein, t = L.t;
    const hit = vis.mHit && now - vis.mHit.t < (two ? 380 : 280) ? vis.mHit : null, hk = hit ? 1 - (now - hit.t) / (two ? 380 : 280) : 0;
    let I = digging ? Math.min(1, 0.55 + 0.45 * hk) : breath(now);
    const since = vis.mHit ? now - vis.mHit.t : 1e9;
    let charge = digging ? Math.min(1, 0.35 + since / 900) : 0.5 + 0.1 * Math.sin(now / 520);
    let grow = two ? 1 : 0, lower = 0, swing = 0, cableK = 1, rodsShown = 99, upK = two ? 1 : 0, blast = 0;
    if (L.in1) { lower = 1 - seg(t, 0, 180); swing = t > 180 && t < 340 ? (Math.floor(t / 50) % 2 ? 1 : -1) : 0; cableK = seg(t, 150, 360); rodsShown = t < 300 ? 0 : Math.floor((t - 300) / 50) + 1; charge = seg(t, 420, 560); blast = t > 560 ? 1 - seg(t, 560, 820) : 0; I = Math.max(I, charge); }
    if (L.in2) { grow = t < 150 ? 0 : 1; upK = seg(t, 150, 400); rodsShown = t < 350 ? 3 : 3 + Math.floor((t - 350) / 50) + 1; charge = Math.max(0.3, seg(t, 380, 540)); blast = t > 550 ? 1 - seg(t, 550, 850) : 0; I = 1; }
    if (L.down) { I *= L.dk; charge *= L.dk; if (L.A.from === 2) { upK = L.dk; grow = t > OUT_MS - 120 ? 0 : 1; } if (L.A.to === 0) { cableK = L.dk; rodsShown = Math.ceil(L.dk * 3); lower = L.lift; } }
    const big = grow === 1, bx = 86 + swing, by = y0 + 26 - Math.round(8 * lower * lower), bw = big ? 13 : 10, bh = big ? 12 : 10;
    for (let y = y0 + 14; y < by; y++) R(bx + (bw >> 1), y, 1, 1, y % 2 ? MAT.iron[3] : INK4);
    const low = [F - 16, F - 12, F - 8], high = [F - 50, F - 45, F - 40], ex = (y) => edgeX(y) - 1;
    const highTop = Math.round(F - 16 - (F - 16 - (F - 50)) * upK), spikes = low.concat(upK > 0 ? high.filter((y) => y >= highTop) : []);
    const top = Math.min(...spikes);
    // Cable: del acumulador al frente (se desenrolla al montarlo) y por el borde del frente hasta la última varilla.
    const ax = ex(top) + 3, ay = top; let lx = bx + 1, ly0 = by + bh - 2; const segN = Math.round(16 * cableK);
    for (let i = 1; i <= segN; i++) { const k = i / 16, x = Math.round(bx + 1 + (ax - bx - 1) * k), y = Math.round(ly0 + (ay - ly0) * k + Math.sin(k * Math.PI) * 6); bres(lx, ly0, x, y, (xx, yy) => { R(xx, yy, 2, 2, INK4); R(xx, yy, 1, 1, cu[2]); }); lx = x; ly0 = y; }
    if (cableK >= 1) for (let y = top; y <= F - 7; y++) { const x = ex(y) + 3; R(x, y, 2, 1, INK4); R(x, y, 1, 1, (y + Math.floor(now / 90)) % 4 ? cu[2] : enc(1 + 2.5 * I)); }
    if (hit && !L.up) for (let i = 0; i < 3; i++) { const k = Math.min(1, (1 - hk) * 2 + i * 0.12), y = Math.round(top + (hit.y - top) * k); R(ex(y) + 3, y, 1, 1, EN[6]); }
    // Varillas: al montarlas se clavan una a una, cada una con su polvo.
    const order = low.concat(high);
    spikes.forEach((y) => { const idx = order.indexOf(y); if (idx >= rodsShown) return; const x = ex(y); R(x - 2, y - 1, 6, 3, INK4); R(x - 1, y, 4, 1, cu[3]); R(x - 2, y, 1, 1, enc(2 + 3 * I)); });
    if (L.up) order.forEach((y, idx) => { if (y < highTop && idx >= 3) return; const at = (L.in1 ? 300 : 350) + (L.in1 ? idx : idx - 3) * 50; if (L.in2 && idx < 3) return; once(L.A, 'rod' + idx, t, at, () => { for (let k = 0; k < 3; k++) rfx('drop', ex(y) - 1, y + MO, { vx: -0.02 - rnd() * 0.03, vy: -0.03 - rnd() * 0.03, life: 420, floor: F + MO, c: ['#b8aa98', '#8a7a68'] }); }); });
    // Grietas: las de cada golpe y, al activarlo, una descarga desde todas las varillas a la vez (más larga con dos).
    const crack = (sy, len, hk2, seed, nb) => { const sx = ex(sy) - 2; for (let b = 0; b < nb; b++) { const dir = [-0.5, 0.2, 0.9, -1.2, 0.5][b], sd = seed + b * 7; let x = sx, y = sy; for (let i = 0; i < len; i++) { x -= 1; if (hash4(sd, i) < 0.45) y += Math.sign(dir) || 1; if (x < FACE.x0 + 2) break; R(x, y, 1, 1, i < len * hk2 ? EN[5] : EN[2]); } } };
    if (hit && !L.up) { let best = spikes[0]; for (const y of spikes) if (Math.abs(y - hit.y) < Math.abs(best - hit.y)) best = y; crack(best, Math.round((two ? 15 : 10) * (1 - hk * 0.3)), hk, Math.floor(hit.t), two ? 4 : 3); }
    if (blast > 0) { for (const y of spikes) crack(y, Math.round((L.in2 ? 22 : 16) * (1 - blast * 0.25)), blast, 911 + y, L.in2 ? 5 : 4); once(L.A, 'dust', t, L.in1 ? 600 : 590, () => { for (let k = 0; k < (L.in2 ? 10 : 6); k++) { const yy = F - 60 + rnd() * 52; rfx('drop', ex(Math.round(yy)) - 2 - rnd() * 14, yy + MO, { vx: -0.01 + rnd() * 0.02, vy: 0.01, life: 700, floor: F + MO, c: ['#9a8a78', '#6a5a4a'] }); } }); }
    // El acumulador: barras de carga (al montarlo se llenan; luego bajan con cada golpe y vuelven a subir).
    R(bx, by, bw, bh, INK4); R(bx + 1, by + 1, bw - 2, bh - 2, cu[2]); R(bx + 1, by + 1, bw - 2, 1, cu[3]); R(bx + 1, by + bh - 2, bw - 2, 1, cu[1]);
    const gx = bx + 2, gy = by + 2, gw = bw - 4, gh = bh - 4; R(gx, gy, gw, gh, EN[0]);
    for (let x = 0; x < gw; x += 2) { const hh = Math.round(gh * charge * (0.85 + 0.15 * ((x * 7) % 3) / 2)); if (hh > 0) { R(gx + x, gy + gh - hh, 1, hh, enc(2 + 3 * I)); R(gx + x, gy + gh - hh, 1, 1, EN[6]); } }
    R(bx + (bw >> 1) - 1, by - 2, 3, 2, INK4); R(bx + (bw >> 1), by - 2, 1, 1, cu[4]);
    if (big) { for (const sx of [bx - 2, bx + bw]) { R(sx, by + 3, 2, bh - 6, INK4); R(sx + (sx < bx ? 1 : 0), by + 4, 1, bh - 8, MAT.iron[3]); } R(bx + 2, by - 4, bw - 4, 2, INK4); R(bx + 3, by - 3, bw - 6, 1, enc(1.5 + 2 * I)); }
    R(bx + 1, by + 1, 1, 1, cu[4]); R(bx + bw - 2, by + 1, 1, 1, cu[4]);
    if (L.up) stClimax('mine', L, L.in1 ? 620 : 640, bx + 6, by - 10 + MO);
  }
  // ================= REFUERZO DE LA TIENDA · TRES ENFOQUES (feedback 29-10-2026; PROVISIONAL, a elegir) =================
  // Lo que hace en el juego: la tienda es UN puesto para toda la colonia; cada refuerzo acelera su ciclo de venta ×1,5 (dos
  // como mucho), solo con tendero; una tienda más rápida guarda más y manda menos al mayorista. No cambia sus seis aspectos.
  // La fantasía no es «más energía»: es VENTA POTENCIADA (más movimiento, más atractivo, más salida de producto). Por eso
  // aquí el refuerzo es LUZ CÁLIDA y comercio, integrada en el puesto (no piezas pegadas, no gemas, no neón):
  //   A · MARQUEE   rótulo de feria: bombillas cálidas en el borde del toldo; con dos, también enmarcando el cartel (sin
  //                 cartel, una segunda fila en la barra del toldo). Cada venta lanza una ola de luz por las bombillas.
  //   B · SHOWCASE  vitrina: el frente del mostrador se abre en una vitrina iluminada con quesos; con dos, peana giratoria y
  //                 un remate de latón con luz bajo el tablero. En cada venta una pieza brilla y sale, y entra otra.
  //   C · LANTERNS  farolillos: una guirnalda de farolillos de papel entre los postes; con dos, más farolillos y banderines
  //                 de los colores del toldo. Cada venta hace rebotar la guirnalda y aviva los farolillos.
  // Activar (≈1 s, 1,2 s el segundo): cada enfoque se monta y se enciende a su manera, con un clímax común (la luz baña el
  // puesto, el producto brilla, el tendero lo celebra y sube la cifra). De noche, el puesto reforzado es el punto cálido de
  // la colonia (halos y un charco de luz en el suelo). El ×2 sigue siendo suyo: monedas doradas que vuelan; el refuerzo es luz
  // quieta que late con las ventas.
  // Aprobada (29-10-2026): C, farolillos con su fuente cian. A (rótulo) y B (vitrina) quedaron en el historial (e712d8c).
  const SA = { shown: 0, act: null, queue: null };
  function shopBoostTo(n, animate) {
    n = Math.max(0, Math.min(2, n | 0));
    if (!animate) { SA.shown = n; SA.act = null; SA.queue = null; return; }
    if (SA.act) { SA.queue = n; return; }
    if (n === 2 && SA.shown === 0) { shopStart(1); SA.queue = 2; return; }
    if (n !== SA.shown) shopStart(n);
  }
  const SHOPT = { lanterns: [600, 850, 600, 900] }; // [clímax 1.º, duración 1.º, clímax 2.º, duración 2.º] · farolillos: respuesta desde el primer fotograma (antes tardaba ~0,9 s en verse algo grande)
  function shopStart(n) { const up = n > SA.shown, T = SHOPT.lanterns; SA.act = { from: SA.shown, to: n, t0: performance.now(), dur: up ? (n === 2 ? T[3] : T[1]) : 350, fired: {} }; }
  function shopActTick(now) {
    const A = SA.act; if (!A || now - A.t0 < A.dur) return; SA.shown = A.to; SA.act = null; const q = SA.queue; SA.queue = null;
    if (q != null && q !== SA.shown) { if (q === 2 && SA.shown === 0) { shopStart(1); SA.queue = 2; } else shopStart(q); }
  }
  const WARM = ['#4a2408', '#8a4a10', '#d07a20', '#ffb347', '#ffd860', '#fff2b0', '#ffffff'];
  // Cómo está el refuerzo en este fotograma: nivel que se pinta, avance de montaje (0–1) por pieza, clímax y pulso de venta.
  function shopLook(now) {
    shopActTick(now);
    const A = SA.act, t = A ? now - A.t0 : 0, up = A && A.to > A.from, lvl = A ? Math.max(A.from, A.to) : SA.shown;
    const L = { lvl, A, t, up, b1: 1, b2: lvl === 2 ? 1 : 0, climax: 0, sale: now >= (vis.coin || -1e9) ? now - (vis.coin || -1e9) : 1e9 }; // una venta «futura» (reloj que vuelve atrás) no cuenta
    if (A && up) { const T = SHOPT.lanterns, cx = A.to === 1 ? T[0] : T[2], s0 = A.to === 1 ? 'b1' : 'b2'; L[s0] = seg(t, 80, cx - 10); L.climax = t > cx - 10 ? Math.max(0, 1 - (t - cx) / 380) : 0;
      once(A, 'cheer', t, cx, () => { vis.shopCheer = now; for (let i = 0; i < 6; i++) rfx('glint', 118 + 6 + rnd() * 46, G - 58 + 24 + rnd() * 16, { life: 420, delay: i * 50 }); if (hooks.boostLabel) hooks.boostLabel('sell', A.to, (118 + 29 - cam.x) * s, (G - 58 + 14 - cam.y) * s); }); }
    else if (A) { const k = 1 - seg(t, 0, 330); if (A.to === 0) L.b1 = k; L.b2 = A.from === 2 ? k : 0; }
    return L;
  }
  // Bombilla de 2 × 2 con su casquillo encima: apagada, cristal oscuro; encendida, luz cálida con un punto de brillo.
  // C · LANTERNS con su fuente (feedback 29-10-2026): los farolillos siguen siendo ámbar (la luz comercial que se genera) y
  // el refuerzo se reconoce por UNA célula cian (su energía) incrustada en un herraje de latón del travesaño del toldo, donde
  // se une al poste izquierdo. Un conducto fino de cobre baja por el borde del poste hasta el enganche de la guirnalda. En
  // cada venta, un pulso cian sale de la célula, baja y recorre el cordel; cada farolillo, al recibirlo, se aviva en ámbar.
  // Con dos, el mismo herraje crece hacia dentro (manguito con abrazaderas, célula mayor) y el pulso es doble. Bajo el toldo
  // no se añade nada más que el enganche.
  const BRASS = ['#3a2408', '#7a5210', '#c0901e', '#ecc040', '#fff0a0'];
  function shopLanterns(L, now, sx, sy) {
    if (L.b1 <= 0) return;
    const S = SHOP_STRIPE ? SHOP_STRIPE[surfStages().shop] : '#e2462f', x0 = sx + 6, x1 = sx + 52, A = L.A, t = L.t, in1 = L.up && A.to === 1, in2 = L.up && A.to === 2, two = L.lvl === 2;
    const bounce = L.sale < 600 ? Math.sin((L.sale / 600) * Math.PI * 3) * (1 - L.sale / 600) * 1.6 : 0;
    // Enganches en sy+21 y comba de 2 px: el farolillo central acaba en sy+29, justo encima del sombrero del tendero (sy+30).
    const sagAt = (x) => { const k = Math.max(0, Math.min(1, (x - x0) / (x1 - x0))); return sy + 21 + Math.round((2 + bounce) * Math.sin(k * Math.PI)); };
    // El herraje: con uno, 8 × 5 sobre el extremo del travesaño; con dos, un manguito de 12 × 6 que avanza hacia dentro.
    const grow = !two ? 0 : in2 ? (t < 60 ? 0 : t < 120 ? 1 : 2) : 2, hw = 8 + grow * 2, hh = 5 + (grow ? 1 : 0), hx = sx + 1;
    const hy = sy + 11 - (grow ? 1 : 0) + (in1 ? (t < 90 ? -Math.round(4 * (1 - Math.pow(t / 90, 2))) : t < 115 ? -1 : 0) : 0);
    const conduitTop = hy + hh, anchorY = sy + 21, dC = anchorY - conduitTop + 1, v = 0.12; // px/ms
    // Intensidad de la célula: arranca a parpadeos al montarla; luego respira y destella al salir cada pulso.
    const flash = L.sale < 140 ? 1 - L.sale / 140 : 0;
    const Ic = in1 ? (t < 60 ? 1 : t < 180 ? [0.2, 0.9, 0.3, 1][Math.min(3, Math.floor((t - 60) / 30))] : 1) : in2 && t > 120 && t < 280 ? (Math.floor(t / 40) % 2 ? 1 : 0.7) : Math.min(1, 0.55 + 0.2 * Math.sin(now / 520) + 0.6 * flash + (two ? 0.15 : 0));
    if (L.up && t < 160) glowH(sx + 5, sy + 13, 7, '#5ad1ff', 0.45 * (1 - t / 160)); // el toque se ve en el acto: destello cian en el herraje
    // El conducto, por el borde del poste (por delante del toldo, 1 px; la costura se enciende con el pulso).
    R(sx + 4, conduitTop, 1, anchorY - conduitTop + 1, MAT.copper[1]);
    // Pulsos: los de cada venta (uno; dos con dos refuerzos) y los de la activación (el que tiende el cordel y el que enciende).
    const pulses = []; // { e: ms desde que salió, v: px/ms }
    if (!L.A || !L.up) { pulses.push({ e: L.sale, v }); if (two) pulses.push({ e: L.sale - 110, v }); }
    if (in1) pulses.push({ e: t - 120, v: 0.3 }, { e: t - 380, v: 0.5, light: 1 }); // el que tiende el cordel · el que enciende los farolillos
    if (in2) pulses.push({ e: t - 140, v: 0.3 }, { e: t - 220, v: 0.3 }, { e: t - 380, v: 0.5, light: 1 });
    // Hasta dónde está tendido el cordel (al montarlo, lo tiende el primer pulso).
    const cordEnd = in1 ? (t < 120 ? x0 - 1 : Math.min(x1, Math.round(x0 + (t - 120) * 0.3 - dC))) : x1;
    for (let x = x0; x <= cordEnd; x++) R(x, sagAt(x), 1, 1, '#3a2a20');
    // Enganche de latón en el poste, con un punto cian (por aquí entra la energía), y el del otro poste, de hierro.
    R(x0 - 2, anchorY - 1, 3, 3, INK4); R(x0 - 1, anchorY, 1, 1, Ic > 0.4 ? EN[4] : EN[2]); if (cordEnd >= x1) R(x1, anchorY, 2, 2, INK4);
    if (L.b2 > 0) { const k2 = in2 ? seg(t, 200, 420) : 1; for (let x = x0 + 3; x < x1 - 2; x += 5) { if ((x - x0) / (x1 - x0) > k2) break; const y = sagAt(x) + 1; R(x, y, 3, 1, S); R(x + 1, y + 1, 1, 1, S); } } // banderines
    // Cuándo le llega a cada punto del cordel cada pulso (para que el farolillo se avive al recibirlo).
    const reach = (x) => dC + (x - x0);
    const xs = L.b2 > 0 ? [0.14, 0.32, 0.5, 0.68, 0.86] : [0.25, 0.5, 0.75], drop = in1 ? seg(t, 260, 420) : 1;
    xs.forEach((k, i) => {
      const extra = L.b2 > 0 && i % 2 === 0, d = extra && in2 ? seg(t, 200 + i * 30, 380 + i * 30) : drop; if (d <= 0) return;
      const x = Math.round(x0 + (x1 - x0) * k) - 1, sw = Math.round(Math.sin(now / 420 + i) * (L.sale < 600 ? 1 : 0.4)), y = sagAt(x + 1) + 1 - Math.round((1 - d) * 4);
      let kick = 0; for (const P of pulses) { const dt2 = P.e - reach(x + 1) / P.v; if (dt2 >= 0 && dt2 < 280) kick = Math.max(kick, 1 - dt2 / 280); }
      const on = in1 ? t - 380 >= reach(x + 1) / 0.5 : in2 && extra ? t - 380 >= reach(x + 1) / 0.5 : true, lit = on ? 1 + 0.6 * kick * (two ? 1.3 : 1) : 0;
      R(x + sw, y, 3, 1, '#3a2a20'); R(x + sw - 1, y + 1, 5, 4, INK4); R(x + sw, y + 1, 3, 4, lit ? '#e0602e' : '#7a3018');
      if (lit) { R(x + sw + 1, y + 2, 1, 2, lit > 1.3 ? WARM[6] : WARM[5]); R(x + sw, y + 2, 1, 2, WARM[3]); if (lit > 1.3) R(x + sw + 2, y + 2, 1, 2, WARM[4]); }
      R(x + sw, y + 5, 3, 1, '#3a2a20');
      if (lit) glowH(x + sw + 1, y + 3, 4 + Math.round(2 * kick), '#ffb860', 0.12 * lit + 0.2 * L.climax);
    });
    // Las cabezas de los pulsos: bajan por el conducto y corren por el cordel (cian, con su estela).
    for (const P of pulses) { if (P.e < 0) continue; const dd = P.e * P.v; if (dd > reach(x1) + 2) continue;
      let px, py; if (dd < dC) { px = sx + 4; py = conduitTop + Math.round(dd); } else { px = Math.round(x0 + dd - dC); py = sagAt(px); }
      R(px, py, 1, 1, EN[6]); if (dd < dC) R(px, py - 1, 1, 1, EN[4]); else { R(px - 1, py, 1, 1, EN[4]); R(px - 2, sagAt(px - 2), 1, 1, EN[2]); }
      glowH(px, py, 3, '#5ad1ff', 0.3); }
    // El herraje con su célula (lo último: va delante del toldo y del conducto).
    R(hx, hy, hw, hh, INK4); R(hx + 1, hy + 1, hw - 2, hh - 2, BRASS[2]); R(hx + 1, hy + 1, hw - 2, 1, BRASS[3]); R(hx + 1, hy + hh - 2, hw - 2, 1, BRASS[1]);
    const ww = grow ? 6 : 4, wx = hx + 2, wy = hy + 2, wh = hh - 4; R(wx, wy, ww, wh, EN[0]);
    if (Ic > 0.02) { R(wx, wy, ww, wh, enc(1.5 + 2 * Ic)); R(wx + 1, wy, ww - 2, wh, enc(2.5 + 2.5 * Ic)); if (flash > 0.3 || (L.up && Ic >= 1)) R(wx + 1, wy, ww - 2, 1, EN[6]); }
    for (let k = 0; k < grow; k++) { const bx = hx + 8 + k * 2; R(bx, hy + 1, 1, hh - 2, BRASS[1]); R(bx, hy, 1, 1, BRASS[4]); } // abrazaderas del manguito
    R(hx + 1, hy + 1, 1, 1, BRASS[4]); R(hx + hw - 2, hy + 1, 1, 1, BRASS[4]);
    if (Ic > 0.1) glowH(wx + (ww >> 1), wy, two ? 5 : 4, '#5ad1ff', (0.16 + 0.2 * flash) * Ic);
  }
  function drawBoostShop(now, layer) {
    if (layer !== 'front') return;
    const L = shopLook(now); if (!L.lvl) return;
    const sx = 118, sy = G - SHOP_H + 1;
    shopLanterns(L, now, sx, sy);
  }
  // De noche, después de la luz del cielo: lo que es luz vuelve a brillar entero, con halos y un charco cálido en el suelo.
  function shopBoostNight(now) {
    const S = skyState(now), n = S.night; if (n < 0.05 || !TOWN) return;
    const L = shopLook(now); if (!L.lvl) return;
    const sx = 118, sy = G - SHOP_H + 1, f = 0.9 + 0.1 * Math.sin(now / 470), k = n * f * Math.min(1, L.b1 + L.b2 * 0.5);
    { ctx.globalAlpha = n; shopLanterns(L, now, sx, sy); ctx.globalAlpha = 1; glowH(sx + 29, sy + 28, 24, '#ffb860', (0.14 + 0.08 * L.b2) * k); glowH(sx + 4, sy + 12, 5 + 2 * L.b2, '#5ad1ff', 0.22 * n); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = '#ffa850'; // charco de luz delante del puesto
    for (const [rx, a] of [[30, 0.08], [20, 0.1], [11, 0.12]]) { const ry = Math.max(2, Math.round(rx * 0.3)); ctx.globalAlpha = a * k * (1 + 0.4 * L.b2); for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))); ctx.fillRect(sx + 29 - w, G + 1 + y, w * 2, 1); } }
    ctx.restore();
  }
  function drawDrill(now, dt) {
    const vn = vnow('drill', now), h = heat('drill'), F = LV.drill.F, run = !!sim.drillJob, jit = (run && Math.floor(vn / 60) % 2 ? 1 : 0) + boostKick(now), xj = run && h > 0.3 && Math.floor(vn / 45) % 2 ? 1 : 0, base = F + 1;
    vis.ext = Math.max(0, Math.min(1, vis.ext + (run ? 1 : -1) * Math.min(64, now - (vis.extT || now)) / 800)); vis.extT = now;
    // Recogida, la barra queda dentro del suelo de DRILL: en MINE no se ve ni barra ni agujero hasta que baja a por la veta.
    const top = F - 2, rest = F + BEAM - 1, tipY = Math.round(rest + (FACE.vy + MO - 3 - rest) * (vis.ext * vis.ext * (3 - 2 * vis.ext)));
    vis.tipY = tipY - MO;
    if (vis.ext > 0.04 && vis.ext < 0.96 && tipY > FACE.y0 && Math.floor(now / 70) % 2 === 0) { spark(DCX + (Math.random() < 0.5 ? -4 : 4), tipY + 3, 'chip', 1); if (Math.random() < 0.3) spark(DCX, tipY - 4, 'dust', 1); }
    R(DCX - 2, top, 5, tipY - top, INK4); R(DCX - 1, top, 3, tipY - top, MAT.steel[2]); R(DCX - 1, top, 1, tipY - top, MAT.steel[3]);
    for (let y = top + (run ? Math.floor(vn / 50) % 4 : 0); y < tipY - 1; y += 4) R(DCX - 1, y, 3, 1, MAT.steel[1]);
    // La sarta: un collarín cada 12 px (cada tramo de barra que se ha ido añadiendo al bajar).
    for (let y = F + 12; y < tipY - 4; y += 12) { R(DCX - 3, y, 7, 2, INK4); R(DCX - 2, y, 5, 1, MAT.steel[3]); }
    // Acelerada, la broca se pone al rojo y escupe chispas y trozos de piedra que rebotan en el fondo del barreno.
    if (run && vis.ext > 0.95 && h > 0) {
      glowH(DCX, tipY + 3, 5 + Math.round(4 * h), '#ffb347', 0.55 * h);
      for (let i = every('dsp', 16 * h, dt); i > 0; i--) rfx('spark', DCX + (rnd() < 0.5 ? -3 : 3), tipY + 4, { vx: (rnd() < 0.5 ? -1 : 1) * (0.03 + rnd() * 0.06), vy: -0.04 - rnd() * 0.07, life: 220 + rnd() * 180 });
      const P = rockOf(); for (let i = every('dch', 7 * h, dt); i > 0; i--) rfx('drop', DCX + (rnd() - 0.5) * 6, tipY + 3, { vx: (rnd() - 0.5) * 0.08, vy: -0.05 - rnd() * 0.04, life: 700, floor: FACE.vy + MO + 4, c: [rnd() < 0.3 ? '#e08a2e' : P[3], P[1]] });
    }
    ctx.drawImage(artBit(run ? Math.floor(vn / 70) % 2 : 0), DCX - 4, tipY - 2);
    if (run && vis.ext > 0.95 && Math.floor(vn / 90) % 3 === 0) spark(DCX + (Math.random() < 0.5 ? -3 : 3), tipY + 5, 'spark');
    R(DCX - 4, F, 9, BEAM, '#0d0a0e'); R(DCX - 5, F, 1, BEAM, INK4); R(DCX + 5, F, 1, BEAM, INK4);
    if (run) vis.fly += 0.06 * (dt / 16) * pace('drill');
    boostSpin(now);
    // El motor se calienta: resplandor naranja detrás de la carcasa y el escape tose más deprisa y más oscuro.
    if (run && h > 0) {
      glowH(DCX, base - 20, 22 + Math.round(16 * h), '#ff7a2a', 0.5 * h);
      for (let i = every('dpu', 2 + 6 * h, dt); i > 0; i--) rfx('puff', DCX + 9 + xj, base - 34, { vx: 0.004 + rnd() * 0.008, vy: -0.026 - rnd() * 0.014, life: 900 + rnd() * 400, c: h > 0.6 ? '#4e4856' : '#6e6676' });
      // Donde la barra atraviesa el suelo, el collarín roza: chispas a los lados y polvo (se ve desde la planta de DRILL).
      for (let i = every('dco', 26 * h, dt); i > 0; i--) { const sd = rnd() < 0.5 ? -1 : 1; rfx('spark', DCX + sd * 5, F - 1, { vx: sd * (0.04 + rnd() * 0.07), vy: -0.04 - rnd() * 0.06, life: 220 + rnd() * 200 }); }
      for (let i = every('dcd', 4 * h, dt); i > 0; i--) rfx('steam', DCX + (rnd() - 0.5) * 10, F - 2, { vx: (rnd() - 0.5) * 0.02, vy: -0.01, life: 700, c: '#b8aa98' });
    }
    ctx.drawImage(artDrill(), DCX - 15 + xj, base - 31 + jit); heatTint('drill', artDrill(), DCX - 15 + xj, base - 31 + jit, now); hitFlash('drill', artDrill(), DCX - 15 + xj, base - 31 + jit, now); R(DCX - 1 + xj, base - 36 + jit, 1, 6, INK4); ctx.drawImage(artWheel(Math.floor(vis.fly) % 3), DCX - 7 + xj, base - 46 + jit);
    // Estela del volante: más vueltas de las que el ojo cuenta (acero, sin luz añadida).
    if (run && h > 0.2) { const cxw = DCX + xj, cyw = base - 39 + jit; for (let k = 0; k < 3; k++) { const a0 = vis.fly * 2.1 + k * 2.09; for (let i = 0; i < 2 + Math.round(3 * h); i++) R(Math.round(cxw + Math.cos(a0 - i * 0.22) * 7), Math.round(cyw + Math.sin(a0 - i * 0.22) * 7), 1, 1, i ? '#b8bccb' : '#ffffff'); } }
    drawBoost(now, dt, DCX - 15 + xj, base - 31 + jit, run, F, tipY, run ? Math.floor(vn / 70) % 2 : 0);
    ctx.drawImage(artPanel(), DCX - 24, F - 15); R(DCX - 22, F - 11, 2, 2, run ? '#62d36e' : now % 900 < 450 ? '#ff5a3c' : '#5a1a10');
    if (now - vis.lever < 400) R(DCX - 16, F - 15 - (now - vis.lever < 200 ? 3 : 1), 1, 3, '#e8523a');
    if (run && now % 600 < 20) spark(DCX + 9, base - 33, 'smoke');
    pipeSeg(DCX + 13, F - 22, DR.spoutX + 1, F - 22); pipeSeg(DR.spoutX + 1, F - 22, DR.spoutX + 1, F - 15);
    R(DR.spoutX - 1, F - 14, 5, 2, MAT.iron[1]); R(DR.spoutX - 2, F - 14, 7, 1, INK4);
    if (STGS.drill >= 2) ctx.drawImage(gearC(run ? Math.floor(vn / 140) % 6 : 0), DCX - 30, GALY.drill - 16);
    if (STGS.drill >= 3) {
      // Bomba del altillo con su volante y la correa que baja al volante de la perforadora.
      const px = 62, py = GALY.drill - 20, fw = [px + 4, py + 10];
      ctx.drawImage(pumpC(), px, py);
      ctx.drawImage(artWheel(Math.floor(vis.fly * 1.6) % 3), px - 1, py + 5);
      const wx = DCX - 2, wy = F - 41, off = run ? Math.floor(vn / 70) % 4 : 0;
      bres(fw[0] - 3, fw[1], wx - 4, wy, (x, y) => R(x, y, 1, 1, '#2a2230')); bres(fw[0] + 3, fw[1] + 2, wx + 4, wy + 1, (x, y) => R(x, y, 1, 1, '#2a2230'));
      let i = 0; bres(fw[0] - 3, fw[1], wx - 4, wy, (x, y) => { if ((i++ + off) % 4 === 0) R(x, y, 1, 1, '#6a5a4a'); });
      ctx.drawImage(gaugeC(), px + 21, py - 7); needle(px + 25, py - 3, run ? 0.6 + 0.15 * Math.sin(vn / 280) + 0.3 * h + (h > 0.5 ? 0.05 * Math.sin(now / 37) : 0) : 0.1);
      if (run && now % 900 < 40) spark(px + 21, py - 2, 'smoke');
    } else if (STGS.drill >= 2) { ctx.drawImage(gaugeC(), 92, GALY.drill - 22); needle(96, GALY.drill - 18, run ? 0.65 + 0.12 * Math.sin(vn / 300) + 0.28 * h : 0.12); }
    if (vis.crateOn) ctx.drawImage(crateC(Math.min(3, vis.crate)), DR.crateX, F - 9);
    if (STGS.drill >= 2) for (let i = 0; i < Math.min(2, vis.ready); i++) ctx.drawImage(crateC(3), DR.readyX, F - 9 - i * 7);
  }
  function needle(cx, cy, k) { const a = -2.4 + k * 3.0; R(cx + Math.round(Math.cos(a) * 2), cy + Math.round(Math.sin(a) * 2), 1, 1, '#c8462e'); R(cx + Math.round(Math.cos(a) * 1), cy + Math.round(Math.sin(a) * 1), 1, 1, '#c8462e'); R(cx, cy, 1, 1, INK4); }
  function drawRawFlow(now) {
    for (let i = vis.drip.length - 1; i >= 0; i--) {
      const dr = vis.drip[i], t = now - dr.t0; if (t < 0) continue;
      const F = LV.drill.F;
      if (t < 900) { const k = t / 900, vy = FACE.vy + MO; rawTok(DCX, Math.round(vy - 4 - k * (vy - 4 - (F - 4)))); }
      else if (t < 1200) { const k = (t - 900) / 300; rawTok(Math.round(DCX + 13 + k * (DR.spoutX - DCX - 12)), F - 22); }
      else if (t < 1400) { const k = (t - 1200) / 200; rawTok(DR.spoutX + 1, Math.round(F - 14 + k * 6)); }
      else { vis.drip.splice(i, 1); if (vis.crateOn) vis.crate = Math.min(3, vis.crate + 1); else vis.spill++; }
    }
  }
  function drawOil(now) { const t = now - vis.oil; if (t < 520) { const y = GALY.drill - 6 + Math.round((t / 520) * (t / 520) * 10); R(DCX - 25, y, 1, 2, '#2a2016'); R(DCX - 25, y, 1, 1, '#6a5a3a'); } }

  // ================= REFINE =================
  function drawRefine(now, dt) {
    const vn = vnow('refine', now), h = heat('refine'), F = LV.refine.F, r = { x: RF.x, y: REFY }, run = !!sim.refJob, flare = now - vis.flare < 260;
    // Acelerada, el horno se aviva: el calor ilumina el suelo y la pared, las llamas salen por la boca y suben brasas.
    if (run && h > 0) glowH(RX + 15, REFY + 36, 30 + Math.round(26 * h), '#ff6a20', 0.55 * h);
    const rj = run && h > 0.3 && Math.floor(vn / 50) % 2 ? 1 : 0; r.x += rj;
    // Zócalo del horno y zapatas del alambique (hasta el suelo).
    R(RX - 1, REFY + 48, 32, 4, INK4); R(RX, REFY + 48, 30, 3, MAT.brick[1]); for (let x = RX + 2; x < RX + 30; x += 6) R(x, REFY + 49, 1, 2, MAT.brick[0]); R(RX, REFY + 48, 30, 1, MAT.brick[2]);
    const feet = (sx) => { for (const fx of [2, 15]) { R(sx + fx - 1, F - 2, 5, 2, INK4); R(sx + fx, F - 2, 3, 1, MAT.iron[2]); } };
    feet(RX + 28);
    drawRefineB(ctx, r.x, r.y, 2, 0, true, vn, { k: sim.refJob ? 1 - sim.refJob / 3000 : 0, bars: Math.min(3, vis.trays[0]), run, steam: true });
    heatTint('refine', refineB(2, 0, true), r.x, r.y, now); hitFlash('refine', refineB(2, 0, true), r.x, r.y, now);
    if (flare) { ctx.globalAlpha = 0.5; fire(RX + 10, r.y + 30, 10, 14, vn, 1); ctx.globalAlpha = 1; }
    if (run && h > 0.1) {
      // Llamas que salen por la boca del horno y lamen el frente; a tope, también asoman por la chimenea.
      const ex = Math.round(14 * h); ctx.globalAlpha = 0.45 + 0.5 * h; fire(RX + 9 + rj, r.y + 33 - ex, 12, 12 + ex, vn, 1); ctx.globalAlpha = 1;
      if (h > 0.6) { ctx.globalAlpha = (h - 0.6) * 2.2; fire(RX + 13 + rj, REFY - 4 - Math.round(4 * h), 5, 3 + Math.round(5 * h), vn + 300, 1); ctx.globalAlpha = 1; }
      for (let i = every('rem', 26 * h, dt); i > 0; i--) rfx('ember', RX + 10 + rnd() * 10 + rj, REFY + 30, { vx: (rnd() - 0.5) * 0.03, vy: -0.03 - rnd() * 0.035, life: 700 + rnd() * 600 });
      for (let i = every('rec', 6 * h, dt); i > 0; i--) rfx('ember', RX + 13 + rnd() * 4, REFY - 5, { vx: (rnd() - 0.5) * 0.02, vy: -0.03 - rnd() * 0.03, life: 700 + rnd() * 400 });
      for (let i = every('rpu', 1 + 5 * h, dt); i > 0; i--) rfx('puff', RX + 15 + rj, REFY - 6, { vx: 0.006 + rnd() * 0.006, vy: -0.026 - rnd() * 0.014, life: 1100 + rnd() * 400, c: h > 0.6 ? '#4e4856' : '#6e6676' });
      for (let i = every('rst', 3.2 * h, dt); i > 0; i--) rfx('steam', RX + 34 + (rnd() - 0.5) * 3, REFY + 15, { vx: (rnd() - 0.5) * 0.01, vy: -0.028 - rnd() * 0.012, life: 700 + rnd() * 300 });
      if (STGS.refine >= 3) for (let i = every('rs2', 2.6 * h, dt); i > 0; i--) rfx('steam', STILL2.x + 13 + (rnd() - 0.5) * 3, REFY + 17, { vx: (rnd() - 0.5) * 0.01, vy: -0.026 - rnd() * 0.012, life: 650 + rnd() * 300 });
    }
    if (STGS.refine >= 3) {
      feet(STILL2.x); ctx.drawImage(artStill(), STILL2.x + rj, REFY + 18); heatTint('refine', artStill(), STILL2.x + rj, REFY + 18, now); hitFlash('refine', artStill(), STILL2.x + rj, REFY + 18, now); ctx.drawImage(artTray(), STILL2.x + 19, REFY + 46);
      for (let i = 0; i < Math.min(3, vis.trays[1]); i++) ctx.drawImage(artBar(), STILL2.x + 20 + i * 4, REFY + 45);
      if (run) { const dd = Math.floor(((vn + 700) % 1400) / 150); if ((vn + 700) % 1400 < 900) R(STILL2.x + 26, REFY + 39 + dd, 1, 1, MAT.cream[3]); }
      R(STILL2.x + 13, REFY + 36, 1, 1, INK4);
    }
    drawBoostRefine(now, run);
    if (run && now % 700 < 30) spark(RX + 15, REFY - 4, 'smoke');
    if (gal('refine')) {
      const vt = now - vis.valveAt;
      ctx.drawImage(valveC(vt < 900 || (run && h > 0.3) ? Math.floor((vt < 900 ? vt : vn) / 110) % 2 : 0), RX + 42, GALY.refine - 18);
      ctx.drawImage(gaugeC(), RX + 1, GALY.refine - 22); needle(RX + 5, GALY.refine - 18, run ? 0.5 + 0.2 * Math.sin(vn / 410) + (vt < 1200 ? 0.15 : 0) + 0.3 * h + (h > 0.5 ? 0.05 * Math.sin(now / 41) : 0) : 0.1);
      if (run && h > 0.4) for (let i = every('rvs', 2.4 * h, dt); i > 0; i--) rfx('steam', RX + 52, GALY.refine - 12, { vx: 0.03 + rnd() * 0.02, vy: -0.012, life: 420 });
      if (run && vt < 600 && vt % 200 < 30) spark(RX + 52, GALY.refine - 12, 'smoke');
    }
  }

  // ================= CHEESE =================
  function drawCheese(now, dt) {
    const vn = vnow('cheese', now), h = heat('cheese'), F = LV.cheese.F, run = !!sim.cookJob, z = CZ();
    // Acelerada, la cuba hierve de trabajo: salta suero por el borde y sube vaho de leche caliente.
    const cj = run && h > 0.3 && Math.floor(vn / 55) % 2 ? 1 : 0;
    if (run && h > 0) {
      const c = cheeseVat(); glowH(c.x, c.y + 4, 26 + Math.round(18 * h), '#ffe6a0', 0.4 * h);
      for (let i = every('cdr', 22 * h, dt); i > 0; i--) rfx('drop', c.x + (rnd() - 0.5) * c.w, c.y, { vx: (rnd() - 0.5) * 0.08, vy: -0.08 - rnd() * 0.07, life: 1100, floor: c.floor, c: [rnd() < 0.5 ? '#fffbea' : '#f2e6be', '#e8dcb4'], big: true });
      for (let i = every('cst', 5 * h, dt); i > 0; i--) rfx('steam', c.x + (rnd() - 0.5) * c.w, c.y - 2, { vx: (rnd() - 0.5) * 0.01, vy: -0.02 - rnd() * 0.012, life: 1200, c: '#fbf6e8' });
    }
    if (STGS.cheese === 1) {
      const sx = z.station, sy = F - 46;
      ctx.drawImage(cheeseSmallC(), sx + cj, sy); heatTint('cheese', cheeseSmallC(), sx + cj, sy, now, '#fff2c0', 0.3); hitFlash('cheese', cheeseSmallC(), sx + cj, sy, now);
      // La pala aprobada (dos posiciones) remueve dentro de la cuba al ritmo del quesero; la cuajada ondula.
      const f = run ? Math.floor(vn / 300) % 2 : 0;
      ctx.drawImage(artPaddle(f), sx + 13, sy + 21);
      if (run) R(sx + 14 + (f ? 4 : 1), sy + 30, 2, 1, '#fffbea');
      ctx.drawImage(artPress(run ? Math.floor(vn / 420) % 2 : 0), sx + 22, sy + 23);
      for (let i = 0; i < Math.min(2, vis.wheelOut); i++) ctx.drawImage(wheelC(), sx + 37 + i * 2, F - 7 - i * 4);
      drawBoostCheese(now, run);
      return;
    }
    // Cuba grande con agitador: la manivela la mueve el quesero; dentro, la pala del eje barre la cuajada.
    const vx = z.vat, vy = F - 24, cr = vis.stir;
    ctx.drawImage(bigVatC(), vx + cj, vy); heatTint('cheese', bigVatC(), vx + cj, vy, now, '#fff2c0', 0.3); hitFlash('cheese', bigVatC(), vx + cj, vy, now);
    const sweep = [-6, -2, 3, 7, 3, -2][((Math.floor(cr) % 6) + 6) % 6], cx = vx + 19;
    R(cx, vy + 4, 1, 4, MAT.iron[1]); bres(cx, vy + 7, cx + sweep, vy + 9, (x, y) => R(x, y, 1, 1, MAT.wood[1]));
    R(cx + sweep - 1, vy + 8, 3, 1, '#fffbea'); if (run) R(cx - sweep, vy + 8, 1, 1, '#efe6c4');
    if (run && h > 0.2) for (let i = 0; i < 2 + Math.round(3 * h); i++) R(cx + Math.round(Math.sin(vn / 70 + i * 2.3) * 12), vy + 8 - (i % 2), 1, 1, i % 2 ? '#fffbea' : '#efe6c4'); // la cuajada se agita
    for (let i = 0; i < Math.min(4, vis.vat); i++) R(vx + 6 + i * 7, vy + 9, 4, 1, '#d4c696');
    if (now - vis.splash < 300) { ctx.globalAlpha = 0.7; R(cx - 3, vy + 4 - Math.round((now - vis.splash) / 60), 2, 1, '#fffbea'); R(cx + 3, vy + 3 - Math.round((now - vis.splash) / 80), 1, 1, '#fffbea'); ctx.globalAlpha = 1; }
    ctx.drawImage(crankC(Math.floor(cr)), vx + 35, vy + 9);
    z.press.forEach((x, i) => { const st = vis.press[i], f = st && st.crank ? Math.floor(vn / 110) % 2 : 0; ctx.drawImage(artPress(f), x, F - 22); if (st && st.curd && !st.crank) R(x + 5, F - 7, 6, 1, '#fffbea'); });
    for (let i = 0; i < Math.min(2, vis.wheelOut); i++) ctx.drawImage(wheelC(), z.press[z.press.length - 1] + 12 + i * 2, F - 7 - i * 4);
    ctx.drawImage(stampTable(), z.table, F - 10);
    for (let i = 0; i < Math.min(3, vis.table); i++) ctx.drawImage(wheelLC(), z.table + 1 + (i % 2) * 5, F - 14 - Math.floor(i / 2) * 5);
    if (now - vis.stamp < 260) R(z.table + 11, F - 14, 2, 2, '#c8462e');
    drawBoostCheese(now, run);
    if (gal('cheese') && now - vis.turnAt < 500) { const k = (now - vis.turnAt) / 500, y = LV.cheese.y0 + 20 - Math.round(Math.sin(k * Math.PI) * 3); ctx.drawImage(k < 0.5 ? wheelC() : wheelLC(), 34, y); }
  }
  const storeN = (st) => (st === 'refine' ? Math.min(3, Math.ceil(sim.raw / 25)) : st === 'cheese' ? Math.min(3, Math.ceil(sim.base / 30)) : 0);
  function drawStores() { for (const st of ['refine', 'cheese']) { const n = storeN(st), y = LV[st].F - 38, it = st === 'refine' ? crateC(3) : barsC(); for (let i = 0; i < n; i++) ctx.drawImage(it, SHELF.x + 2 + i * (it.width + 1), y - it.height); } }
  function drawPallets() {
    for (const k of ['drill', 'refine', 'cheese']) { let y = LV[k].F - 2; const P = vis.pallet[k]; for (const it of [...P.in, ...P.out].slice(0, 3)) { const im = ITEM[it](); ctx.drawImage(im, PALLET.x + 1 + ((12 - im.width) >> 1), y - im.height); y -= im.height - 1; } }
    const P = vis.pallet.surface; P.in.slice(0, 4).forEach((it, i) => ctx.drawImage(ITEM[it](), 196 + (i % 2) * 6, G - 2 - 7 - Math.floor(i / 2) * 5));
  }

  // ================= POLIPASTO: la materia prima entra por el techo =================
  // Sale del rellano con lo que dejó el montacargas (o, si no llegó nada y la máquina lo necesita, con lo de la despensa),
  // corre por el raíl hasta la cuba o la tolva, baja la cuerda, vuelca y vuelve.
  const needIn = (st) => (st === 'refine' ? Math.min(vis.hopper[0], STGS.refine >= 3 ? vis.hopper[1] : 9) < 2 : vis.vat < 2);
  const targetOf = (st) => (st === 'refine' ? (STGS.refine >= 3 && vis.hopper[1] < vis.hopper[0] ? 1 : 0) : 0);
  function launch(T2, st, now) { T2.s = 'out'; T2.t0 = now; T2.slot = targetOf(st); T2.tx = st === 'refine' ? HOPPER[T2.slot] : CZ().vatC; T2.sx = T2.x; T2.rope = 6; }
  function trolleyStep(st, now) {
    const T2 = vis.trolley[st], P = vis.pallet[st], rY = railY(st), F = LV[st].F, home = 200, k = now - T2.t0;
    const dropY = Math.max(2, (st === 'refine' ? REFY + 14 : F - 24) - rY - 8);
    if (T2.s === 'home') {
      T2.rope = 6;
      if (!T2.item && needIn(st)) {
        if (P.in.length) { T2.item = P.in.shift(); T2.s = 'hook'; T2.t0 = now; T2.from = F - 8; }
        else if (storeN(st) > 0 && now - (T2.idleAt || 0) > 2500) { T2.item = st === 'refine' ? 'crate' : 'bars'; T2.s = 'hook'; T2.t0 = now; T2.from = F - 44; }
      }
      return;
    }
    if (T2.s === 'hook') { const kk = Math.min(1, k / 700); T2.rope = Math.round(6 + (1 - Math.abs(kk * 2 - 1)) * Math.max(0, T2.from - rY - 14)); if (kk >= 1) launch(T2, st, now); return; }
    if (T2.s === 'out') { const dist = Math.abs(T2.sx - T2.tx), kk = Math.min(1, k / Math.max(1, dist / 0.045)); T2.x = T2.sx + (T2.tx - T2.sx) * ease(kk); if (kk >= 1) { T2.s = 'drop'; T2.t0 = now; } return; }
    if (T2.s === 'drop') {
      const kk = Math.min(1, k / 900);
      T2.rope = Math.round(6 + Math.min(1, kk * 2) * dropY);
      if (kk >= 0.5 && T2.item) {
        T2.item = null; const hy = rY + 3 + T2.rope;
        if (st === 'refine') { const slot = T2.slot; for (let i = 0; i < 3; i++) toss('raw', T2.x - 1 + i, hy, T2.x - 1 + i, REFY + 18, 200 + i * 70, i === 2 ? () => (vis.hopper[slot] = Math.min(4, vis.hopper[slot] + 3)) : null, 0); }
        else toss('base', T2.x, hy, T2.x, F - 17, 220, () => { vis.vat = Math.min(4, vis.vat + 2); vis.splash = performance.now(); }, 0);
      }
      if (kk >= 1) { T2.s = 'back'; T2.t0 = now; T2.sx = T2.x; }
      return;
    }
    if (T2.s === 'back') { const k0 = Math.min(1, k / 500); T2.rope = Math.round(6 + (1 - k0) * dropY); if (k0 < 1) return; const dist = Math.abs(home - T2.sx), kk = Math.min(1, (k - 500) / Math.max(1, dist / 0.05)); T2.x = T2.sx + (home - T2.sx) * ease(kk); if (kk >= 1) { T2.s = 'home'; T2.x = home; T2.idleAt = now; } }
  }
  function drawTrolley(st) {
    const T2 = vis.trolley[st], x = Math.round(T2.x), y = railY(st) + 2;
    R(x - 4, y - 3, 9, 4, INK4); R(x - 3, y - 2, 7, 2, MAT.iron[2]); R(x - 3, y - 2, 7, 1, MAT.iron[3]); R(x - 3, y - 4, 2, 2, MAT.iron[1]); R(x + 2, y - 4, 2, 2, MAT.iron[1]);
    R(x, y + 1, 1, T2.rope, '#c8b48a'); const hy = y + 1 + T2.rope; R(x - 1, hy, 3, 1, MAT.iron[1]); R(x - 1, hy + 1, 1, 1, MAT.iron[1]); R(x + 1, hy + 1, 1, 1, MAT.iron[1]);
    if (T2.item) { const im = ITEM[T2.item](); ctx.drawImage(im, x - (im.width >> 1), hy + 2); }
  }

  // ================= SUPERFICIE =================
  function townGhosts(now) {
    if (!TOWN) return;
    const S = surfStages(), a = (st) => (stateSt(st) === 'build' ? 0.62 + 0.2 * Math.sin(now / 420) : 0.2);
    // El azul claro de las máquinas está pensado para los muros oscuros: sobre el cielo no se veía. Aquí, un azul de plano más oscuro.
    const put = (st, src, x, y) => { ctx.globalAlpha = a(st); ctx.drawImage(tintC(src, '#2f6fb4'), x, y); ctx.globalAlpha = 1; };
    if (!builtSt('house')) { const c = townHouse(S.house); put('house', c, LOT.house[0], G - c.height + 1); }
    if (!builtSt('sell')) { const y = G - SHOP_H + 1; put('sell', shopBack(S.shop), LOT.shop[0], y); put('sell', shopFront(S.shop), LOT.shop[0], y); }
  }
  function drawSurface(now, dt) {
    const sx = 118, sy = G - SHOP_H + 1;
    const vs = vnow('sell', now), hs = heat('sell'), kp = N('sell', 'keeper'); if (kp) { ctx.drawImage(mF(kp.crew, Math.floor((vs + 431) / (650 - 300 * hs)) % 2, (now + 997) % 3300 < 110, now - vis.coin < 700 || now - (vis.shopCheer || -1e9) < 900 ? { face: 'happy', tail: hs > 0.3 } : hs > 0.3 ? { face: 'grump' } : {}), sx + 19, sy + 28 - (hs > 0.3 && Math.floor(vs / 140) % 2 ? 1 : 0) - (now - (vis.shopCheer || -1e9) < 600 && Math.floor((now - vis.shopCheer) / 120) % 2 ? 1 : 0)); kp.px = sx + 19; kp.py = sy + 48; }
    if (hs > 0) {
      glowH(sx + 40, sy + 30, 18 + Math.round(14 * hs), '#ffd860', 0.45 * hs);
      for (let i = every('sgl', 5 * hs, dt); i > 0; i--) rfx('glint', sx + 20 + rnd() * 40, sy + 12 + rnd() * 22, { life: 360 });
      // Las monedas saltan del mostrador en arco y caen en la caja (al ritmo del acelerón).
      for (let i = every('sco', 4 * hs, dt); i > 0; i--) { const tx = sx + 26 + rnd() * 26; rfx('coin', sx + 40, sy + 30, { x1: tx, y1: sy + 34, h: 10 + rnd() * 8, life: 520 }); }
    }
    townGhosts(now);
    const S = surfStages(); if (builtSt('sell')) { ctx.drawImage(gradeCv(shopFront(S.shop)), sx, sy); heatTint('sell', gradeCv(shopFront(S.shop)), sx, sy, now, '#ffe070', 0.22); hitFlash('sell', gradeCv(shopFront(S.shop)), sx, sy, now); shopLots(ctx, sx, sy, Math.min(4, vis.shopLots)); drawBoostShop(now, 'front'); }
    if (now - vis.coin < 600) { const k = (now - vis.coin) / 600; coinTok(sx + 40, Math.round(sy + 30 - k * 14)); }
    if (TOWN) { if (builtSt('house')) vfxSmoke(ctx, LOT.house[0] + 43, G - 65 + (S.house >= 2 ? 4 : 18), now); } else vfxSmoke(ctx, 41, G + 1 - 52, now);
    const mv = lift.state === 'move';
    ctx.drawImage(pulleySprite(mv ? Math.floor(now / 110) % 3 : 0), 218, G - 78);
    const wx = 201, wy = G - 44; R(wx, wy, 9, 9, INK4); R(wx + 1, wy + 1, 7, 7, MAT.iron[2]); R(wx + 1, wy + 1, 7, 1, MAT.iron[3]); R(wx + 3, wy + 3, 3, 3, MAT.wood[2]);
    const a = mv ? Math.floor(now / 120) % 4 : 0, hh = [[-4, 0], [0, -4], [4, 0], [0, 4]][a]; bres(wx + 4, wy + 4, wx + 4 + hh[0], wy + 4 + hh[1], (x, y) => R(x, y, 1, 1, MAT.iron[1])); R(wx + 4 + hh[0], wy + 4 + hh[1], 1, 1, MAT.wood[4]);
    bres(wx + 8, wy + 2, 222, G - 72, (x, y) => R(x, y, 1, 1, '#8a8496'));
  }

  // El investigador lee a la puerta del laboratorio (se pinta con los ratones de fuera, con la luz del momento).
  function drawResearcher(now) {
    if (TOWN && hooks.labBusy && hooks.labBusy()) vfxBubbles(ctx, LOT.lab[0] + 27, G - 27, now);
    const rs = N('lab', 'researcher'); if (!rs) return;
    if (hooks.labInside && hooks.labInside()) { rs.px = null; rs.py = null; return; }
    const lx = TOWN ? LOT.lab[0] - 16 : 52, cv = litSprite(mF(rs.crew, Math.floor((now + 431) / 650) % 2, false, { book: Math.floor(now / 900) % 2 ? 2 : 1 }));
    ctx.save(); ctx.translate(lx + 14 + 22, G - 4 - 20); ctx.scale(-1, 1); ctx.drawImage(cv, 0, 0); ctx.restore();
    rs.px = lx + 14; rs.py = G - 4;
  }
  // ================= MONTACARGAS: jaula con su ascensorista =================
  const STOPS = ['drill', 'refine', 'cheese', 'surface'];
  const DEST = { crate: 'refine', bars: 'cheese', wheelL: 'surface', wheel: 'surface' };
  const needsStop = (k) => lift.cargo.some((c) => DEST[c] === k) || (k !== 'surface' && vis.pallet[k].out.length > 0 && lift.cargo.length < 3);
  function liftStep(now) {
    if (lift.state === 'move') { const k = Math.min(1, (now - lift.t0) / lift.ms); lift.y = lift.from + (lift.to - lift.from) * ease(k); if (k >= 1) { lift.state = 'dock'; lift.dockAt = now; lift.y = lift.to; onDock(lift.at); } return; }
    if (now < lift.busyUntil) return;
    const at = lift.at, man = N('lift', 'liftman'), P = vis.pallet[at];
    const idx = lift.cargo.findIndex((c) => DEST[c] === at);
    if (idx >= 0) {
      const it = lift.cargo.splice(idx, 1)[0], T2 = vis.trolley[at], hook = T2 && T2.s === 'home' && !T2.item && needIn(at);
      // Lo que entra en REFINE o CHEESE va directo al gancho del polipasto si está libre y hace falta; si no, al palé.
      toss(it, CAGE.x + 8, lift.y - 30, hook ? 200 : at === 'surface' ? 199 : PALLET.x + 3, hook ? railY(at) + 12 : LAND[at] - 6, 420, () => { if (hook && T2.s === 'home' && !T2.item) { T2.item = it; launch(T2, at, performance.now()); } else P.in.push(it); });
      if (man) man.act = { kind: 'lean', t0: now, ms: 420 }; lift.busyUntil = now + 460; return;
    }
    if (at !== 'surface' && P.out.length && lift.cargo.length < 3) { const it = P.out.shift(); toss(it, PALLET.x + 3, LAND[at] - 6, CAGE.x + 8, lift.y - 30, 420, () => lift.cargo.push(it)); if (man) man.act = { kind: 'lean', t0: now, ms: 420 }; lift.busyUntil = now + 460; return; }
    if (now - lift.dockAt < 900) return;
    const i = STOPS.indexOf(at); let next = null;
    for (let j = i + 1; j < STOPS.length && !next; j++) if (needsStop(STOPS[j])) next = STOPS[j];
    for (let j = i - 1; j >= 0 && !next; j--) if (needsStop(STOPS[j])) next = STOPS[j];
    if (!next) return;
    lift.from = lift.y; lift.to = LAND[next]; lift.at = next; lift.t0 = now; lift.ms = 600 + Math.abs(lift.to - lift.from) * 11; lift.state = 'move';
  }
  // Al llegar a un rellano, quien trabaja junto al palé saluda al ascensorista y este le responde.
  function onDock(at) {
    const man = N('lift', 'liftman'); if (!man) return;
    if (at === 'surface') { const p = N('sell', 'porter'); if (p && isIdle(p)) { p.q = [T.face(1), T.act('greet', 520), T.idle(300)]; react(man, 'greet', 300); } return; }
    noise(at, 210, 90);
    const near = nodes.find((n) => n.crew && n.st === at && n.surf === 'F' && Math.abs(n.x - LANDX) < 30 && isIdle(n));
    if (near) { near.q = [T.face(1), T.act('greet', 520), T.idle(300)]; react(man, 'greet', 300); }
  }
  function drawLift(now) {
    const x = CAGE.x, y = Math.round(lift.y) - CAGE.h, mv = lift.state === 'move';
    R(x + 11, G - 72, 1, Math.max(0, y - (G - 72)), '#c8c2d4'); R(x + 12, G - 72, 1, Math.max(0, y - (G - 72)), '#8a8496');
    ctx.drawImage(cageBackC(), x, y);
    const man = N('lift', 'liftman');
    if (man) { man.feet = Math.round(lift.y) - 4; man.x = x + 1; drawMouse(man, now, true); }
    ctx.drawImage(cageFrontC(), x, y);
    lift.cargo.forEach((c, i) => { const it = ITEM[c](); ctx.drawImage(it, x + 1 + i * 8, y + 2 - it.height); });
    R(x + 11, y + 3, 2, 1, mv && Math.floor(now / 250) % 2 ? '#ffcf2e' : '#a86a10');
    if (mv) vfxGlow(ctx, x + 12, y + 3, 5, now, '#ffd860');
  }

  // ================= RATONES =================
  // Tareas: ir a x, mirar a un lado, esperar (las de reposo van marcadas: ahí puede empezar una interacción), esperar a que
  // algo se cumpla, agacharse (coger o dejar: el cambio ocurre en el punto más bajo), gestos con pose y acciones sueltas.
  const T = {
    walk: (x) => ({ k: 'walk', x: Math.round(x) }), face: (f) => ({ k: 'face', f }), wait: (ms) => ({ k: 'wait', ms }), idle: (ms, pose) => ({ k: 'wait', ms, idle: true, pose }),
    until: (fn, pose) => ({ k: 'until', fn, pose }), crouch: (fn, ms = 320) => ({ k: 'crouch', fn, ms }), act: (pose, ms) => ({ k: 'act', pose, ms }), do: (fn) => ({ k: 'do', fn }),
  };
  function stepWalk(n, x, dt) {
    const dd = x - n.x; if (Math.abs(dd) < 0.5) { n.x = x; return false; }
    const sg = Math.sign(dd), v = (n.item ? WALK_LOADED : WALK) * dt; n.face = sg; n.x += sg * Math.min(v, Math.abs(dd)); n.walked += Math.min(v, Math.abs(dd)); return true;
  }
  let curNode = null; // el ratón cuya tarea se está ejecutando (para saber si un lanzamiento es de MINE)
  function runTasks(n, now, dt) {
    curNode = n;
    const sdt = dt * pace(n.st); // con la estación acelerada o reforzada, sus ratones van al mismo ritmo que la máquina
    for (let guard = 0; guard < 8; guard++) {
      const t = n.q[0]; if (!t) return;
      if (t.t0 == null) { t.t0 = now; t.el = 0; } else if (guard === 0) t.el += sdt;
      let done = true;
      if (t.k === 'walk') done = !stepWalk(n, t.x, sdt);
      else if (t.k === 'face') n.face = t.f;
      else if (t.k === 'wait' || t.k === 'act') done = t.el >= t.ms;
      else if (t.k === 'until') done = !!t.fn(now);
      else if (t.k === 'crouch') { if (!t.did && t.el >= t.ms * 0.5) { t.did = true; t.fn && t.fn(now); } done = t.el >= t.ms; }
      else if (t.k === 'do') t.fn(now);
      if (!done) return;
      const at = n.q.indexOf(t); if (at >= 0) n.q.splice(at, 1);
      if (t.k === 'walk' || t.k === 'wait' || t.k === 'act' || t.k === 'crouch') return;
    }
  }
  const isIdle = (n) => !!n && !n.inter && !passOf(n) && !n.item && (!n.q.length || (n.q[0].idle && Math.abs(n.x - n.hx) < 0.5));
  // Pases de pata a pata: los dos se miran, el que da se inclina, el objeto salta y el que recibe agradece.
  function pass(a, b, now) { const P = { a, b, ia: a.item, ib: b.item, t0: now, ms: 720 }; a.item = null; b.item = null; vis.passes.push(P); return P; }
  const passOf = (n) => vis.passes.find((p) => p.a === n || p.b === n);
  function passStep(now) {
    for (let i = vis.passes.length - 1; i >= 0; i--) {
      const P = vis.passes[i], t = now - P.t0;
      if (t >= 480 && !P.swapped) { P.swapped = true; P.a.item = P.ib; P.b.item = P.ia; if (P.onSwap) P.onSwap(); }
      if (t >= P.ms) { vis.passes.splice(i, 1); if (P.onDone) P.onDone(); }
    }
  }
  function drawPasses(now) {
    for (const P of vis.passes) {
      const t = now - P.t0, hand = (n) => [n.x + (n.face > 0 ? 15 : -1), n.feet - 11 + (n.st === 'mine' ? MO : 0)];
      if (XTRA && t >= 500 && t < 640) { const [ax, ay] = hand(P.a), [bx, by] = hand(P.b), mx = Math.round((ax + bx) / 2), my = Math.round((ay + by) / 2) - 8, c = t < 570 ? '#ffffff' : '#fff6c8'; R(mx, my - 2, 1, 5, c); R(mx - 2, my, 5, 1, c); }
      if (t < 160 || t >= 480) continue; const k = (t - 160) / 320;
      for (const [it, from, to] of [[P.ia, P.a, P.b], [P.ib, P.b, P.a]]) { if (!it) continue; const [x0, y0] = hand(from), [x1, y1] = hand(to), im = ITEM[it](); ctx.drawImage(im, Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 6 - im.height / 2 + 3)); }
    }
  }
  function toss(it, x0, y0, x1, y1, ms, onDone, h = 8) { if (curNode) ms /= pace(curNode.st); vis.tosses.push({ it, x0, y0, x1, y1, ms, onDone, t0: performance.now(), h, mine: !!(curNode && curNode.st === 'mine') }); }
  function drawTosses(now) {
    for (let i = vis.tosses.length - 1; i >= 0; i--) {
      const T2 = vis.tosses[i], k = (now - T2.t0) / T2.ms;
      if (k >= 1) { vis.tosses.splice(i, 1); T2.onDone && T2.onDone(); continue; }
      if (k < 0) continue;
      const im = ITEM[T2.it] ? ITEM[T2.it]() : null, x = Math.round(T2.x0 + (T2.x1 - T2.x0) * k), y = Math.round(T2.y0 + (T2.y1 - T2.y0) * k - Math.sin(k * Math.PI) * T2.h + (T2.mine ? MO : 0));
      if (T2.it === 'raw') rawTok(x, y); else if (T2.it === 'base') baseTok(x, y); else if (im) ctx.drawImage(im, x - (im.width >> 1), y - (im.height >> 1));
    }
  }
  function drawFalls(now, dt) {
    for (let i = vis.falls.length - 1; i >= 0; i--) {
      const f = vis.falls[i]; f.vy += 0.0006 * dt; f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.y >= LV.mine.F - 6) { f.y = LV.mine.F - 6; if (Math.abs(f.vy) > 0.05) { f.vy *= -0.3; f.vx = 0.03; } else { f.vy = 0; f.vx = 0.04; } }
      if (f.x >= PILE.x + 2 && f.y >= LV.mine.F - 7) { vis.falls.splice(i, 1); vis.rubble = Math.min(4, vis.rubble + 1); continue; }
      ctx.drawImage(chunkC(), Math.round(f.x), Math.round(f.y));
    }
  }

  // ---- 1) Trabajo: lo que hace cada papel cuando le toca (null = nada ahora; entonces pasa a relacionarse o a un gesto) ----
  const running = { mine: () => !sim.vein, drill: () => !!sim.drillJob, refine: () => !!sim.refJob, cheese: () => !!sim.cookJob, sell: () => !!sim.sellJob, lift: () => lift.state === 'move', lab: () => true };
  const BEAT = 1300;
  const toPallet = (n, st) => [T.walk(LANDX), T.face(1), T.crouch(() => { if (n.item) vis.pallet[st].out.push(n.item); n.item = null; }), T.do((t) => {
    // FACTORY+: si el montacargas no está en este rellano, tira de la cuerda de la campana; el ascensorista le contesta.
    if (XTRA && !(lift.state === 'dock' && lift.at === st) && t - (vis.bell[st] || -1e9) > 5000) n.q.unshift(T.act('ring', 640), T.do(() => { vis.bell[st] = performance.now(); const man = N('lift', 'liftman'); if (man) react(man, 'greet', 380); noise(st, BELLX, 80); }));
  })];
  const waitingFor = (n, tag) => !!n && n.waitTag === tag && n.q[0] && n.q[0].k === 'until' && !passOf(n);
  // Pase en mano: si el otro ya espera, se la da; si no, ejecuta «otherwise».
  function handTo(n, other, tag, otherwise) {
    return T.do((t) => {
      if (waitingFor(other, tag)) { const P = pass(n, other, t); P.onDone = () => { other.waitTag = null; }; n.q.unshift(T.until(() => !passOf(n))); }
      else if (otherwise) n.q.unshift(...otherwise);
    });
  }
  const BRAIN = {
    picker(n, now) { return strikerPlan(n, now, 0); },
    climber(n, now) { return strikerPlan(n, now, BEAT / 2); },
    collector(n) {
      if (!n.item && vis.rubble > 0) return [T.walk(PILE.x + 6), T.face(-1), T.crouch(() => { vis.rubble = Math.max(0, vis.rubble - 1); n.item = 'chunk'; }, 380), T.face(1), T.walk(n.hx)];
      if (n.item && STGS.mine < 3) return [T.walk(CHUTE.x0 - 20), T.face(1), T.act('toss', 260), T.do(() => { const it = n.item; n.item = null; toss(it, n.x + 18, n.feet - 12, CHUTE.x0 + 9, LV.mine.F + 10, 360, () => msp(CHUTE.x0 + 9, LV.mine.F - 3, 'dust', 2), 6); }), T.wait(200), T.walk(n.hx), T.face(-1)];
      if (n.item) {
        const hauler = N('mine', 'hauler');
        if (vis.cart.x === CART.home && vis.cart.load < 3 && !(hauler && hauler.trip)) return [T.face(1), T.act('toss', 260), T.do(() => { const it = n.item; n.item = null; toss(it, n.x + 18, n.feet - 12, CART.home + 4 + vis.cart.load * 5, LV.mine.F - 14, 320, () => { vis.cart.load = Math.min(3, vis.cart.load + 1); if (vis.cart.load === 3 && hauler) { react(hauler, 'nod'); react(n, 'nod', 200); } }, 7); }), T.wait(200), T.face(-1)];
        return [T.face(1), T.until(() => vis.cart.x === CART.home && vis.cart.load < 3, 'hold')];
      }
      return null;
    },
    hauler(n) {
      const col = N('mine', 'collector'), full = vis.cart.load >= 3 || (vis.cart.load > 0 && sim.vein && vis.rubble === 0 && !(col && col.item));
      if (!full) return null;
      n.trip = true;
      // FACTORY+: si el recolector está libre, viene a empujar el carro por detrás y van juntos hasta el pozo.
      const helper = XTRA && STGS.mine >= 3 && col && !col.item && !passOf(col) && !col.inter && !col.push ? col : null;
      if (helper) helper.q = [T.walk(vis.cart.x - 20), T.face(1), T.do(() => (helper.push = true)), T.until(() => !n.trip, 'push'), T.do(() => (helper.push = false)), T.walk(helper.hx), T.face(-1)];
      return [T.face(1), ...(helper ? [T.until(() => helper.push || !!helper.item, 'wait')] : []), T.do(() => (n.pull = true)), T.walk(CART.dump + 18), T.do(() => (n.pull = false)), T.act('dump', 620), T.do(() => { vis.cart.tilt = 0; for (let i = 0; i < vis.cart.load; i++) toss('chunk', CART.dump + 6 + i * 3, LV.mine.F - 14, CHUTE.x0 + 6 + i * 3, LV.mine.F + 12, 380 + i * 90, null, 2); for (let i = 0; i < 5; i++) msp(CHUTE.x0 + 4 + i * 3, LV.mine.F - 3, 'dust', 1); vis.cart.load = 0; noise('mine', CHUTE.x0 + 10, 90); if (col && col.push) react(col, 'greet', 120); }), T.face(-1), T.do(() => (n.pull = true)), T.walk(n.hx), T.do(() => { n.pull = false; n.trip = false; }), T.face(-1)];
    },
    // DRILL: el operario tira de la palanca en cada hornada; el del manómetro lo comprueba justo después.
    operator(n) { if (!running.drill() || n.lastCycle === vis.drillCycle) return null; n.lastCycle = vis.drillCycle; return [T.face(1), T.act('lever', 420), T.do(() => { vis.lever = performance.now(); noise('drill', DCX, 60); })]; },
    greaser(n, now) { if (!running.drill() || now - (n.lastGrease || 0) < (2600 + (n.seed % 900)) / pace('drill')) return null; n.lastGrease = now; return [T.face(-1), T.act('grease', 640), T.do(() => (vis.oil = performance.now()))]; },
    checker(n) { if (!running.drill() || n.lastCycle === vis.drillCycle) return null; n.lastCycle = vis.drillCycle; return [T.face(-1), T.wait(500), T.act('read', 900)]; },
    filler(n) {
      if (!(vis.crateOn && vis.crate >= 3)) return null;
      const run = N('drill', 'runner');
      const lift3 = T.crouch(() => { vis.crateOn = false; n.item = 'crate'; vis.crate = 0; });
      const refill = [T.wait(160), T.crouch(() => (n.item = 'empty'), 260), T.face(-1), T.crouch(() => { n.item = null; vis.crateOn = true; vis.crate = Math.min(3, vis.spill); vis.spill = 0; })];
      // Fase I: él mismo lleva la caja al palé. Con corredor: se la da en mano si le espera; si no, a la pila de listas.
      if (!run) return [T.face(-1), lift3, ...toPallet(n, 'drill'), T.walk(n.hx), T.face(-1), T.crouch(() => { vis.crateOn = true; vis.crate = Math.min(3, vis.spill); vis.spill = 0; })];
      if (vis.ready >= 2 && !waitingFor(run, 'crate')) return [T.face(-1), T.until(() => vis.ready < 2 || waitingFor(run, 'crate'), 'wait')];
      return [T.face(-1), lift3, T.face(1), handTo(n, run, 'crate', [T.crouch(() => { n.item = null; vis.ready++; })]), ...refill];
    },
    // REFINE: en cada hornada, el fogonero aviva el fuego, el de la válvula la abre y el del manómetro lo comprueba.
    stoker(n, now) {
      if (!running.refine()) return null;
      if (n.lastStart === vis.refStart && now - (n.lastStoke || 0) < (2600 + (n.seed % 700)) / pace('refine')) return null;
      n.lastStart = vis.refStart; n.lastStoke = now;
      if (!XTRA) return [T.face(1), T.crouch(() => (vis.flare = performance.now()), 360)];
      // FACTORY+: coge una paletada del montón de carbón (a su espalda) y la echa a la boca del horno, que se aviva.
      return [T.face(-1), T.crouch(() => (n.item = 'coal'), 380), T.face(1), T.act('toss', 240), T.do(() => { n.item = null; toss('coal', n.x + 18, n.feet - 12, RX + 15, REFY + 38, 320, () => { vis.flare = performance.now(); noise('refine', RX + 15, 70); }, 6); })];
    },
    valve(n, now) { if (!running.refine() || n.lastStart === vis.refStart || now - vis.refStart < 600) return null; n.lastStart = vis.refStart; return [T.face(1), T.do(() => (vis.valveAt = performance.now())), T.act('valve', 900)]; },
    gauge(n, now) { if (!running.refine() || n.lastStart === vis.refStart || now - vis.refStart < 1300) return null; n.lastStart = vis.refStart; return [T.face(1), T.do(() => (vis.gaugeAt = performance.now())), T.act('read', 1000), T.act('cheer', 420)]; },
    molder(n) {
      const t = STGS.refine >= 3 && vis.trays[1] > 0 ? 1 : vis.trays[0] > 0 ? 0 : -1;
      if (!n.item && t >= 0) return [T.walk(TRAY[t].take), T.face(-1), T.crouch(() => { if (vis.trays[t] > 0) { vis.trays[t]--; n.item = 'bars'; } }), T.walk(n.hx)];
      if (n.item) {
        const run = N('refine', 'runner');
        if (!run) return [...toPallet(n, 'refine'), T.walk(n.hx), T.face(-1)];
        return [T.face(1), T.until(() => waitingFor(run, 'bars'), 'hold'), handTo(n, run, 'bars'), T.face(-1)];
      }
      return null;
    },
    // Corredores (DRILL y REFINE): esperan junto a quien les da el producto y lo llevan al palé del montacargas.
    runner(n) {
      const st = n.st, giver = st === 'drill' ? N('drill', 'filler') : N('refine', 'molder');
      const spot = st === 'drill' ? DR.readyX + 12 : giver ? giver.hx + 24 : LANDX;
      if (n.item) return [...toPallet(n, st), T.walk(n.hx), T.face(-1)];
      if (st === 'drill' && vis.ready > 0) return [T.walk(spot), T.face(-1), T.crouch(() => { if (vis.ready > 0) { vis.ready--; n.item = 'crate'; } })];
      const soon = st === 'drill' ? vis.crateOn && vis.crate >= 2 : (giver && giver.item) || vis.trays[0] + vis.trays[1] > 0;
      if (soon) return [T.walk(spot), T.face(-1), T.do(() => (n.waitTag = st === 'drill' ? 'crate' : 'bars')), T.until(() => !!n.item || !n.waitTag || (st === 'drill' && vis.ready > 0), 'wait'), T.do(() => (n.waitTag = null))];
      return null;
    },
    // CHEESE.
    mixer(n) {
      if (STGS.cheese === 1 || !vis.curd || n.item) return null;
      const free = vis.press.findIndex((p, i) => !p && i < CZ().press.length);
      if (free < 0) return null;
      const px = CZ().press[free];
      return [T.face(-1), T.crouch(() => { vis.curd = Math.max(0, vis.curd - 1); n.item = 'curd'; vis.press[free] = { curd: false }; }, 420), T.face(1), T.act('toss', 240), T.do(() => { const it = n.item; n.item = null; toss(it, n.x + 16, n.feet - 12, px + 8, LV.cheese.F - 10, 300, () => { vis.press[free] = { curd: true }; }, 5); }), T.wait(200), T.face(-1)];
    },
    presser(n) {
      const z = CZ(), pk = N('cheese', 'packer'), i = vis.press.findIndex((p) => p && p.curd && !p.crank);
      if (n.item === 'wheel') return [T.walk(n.hx), T.face(1), T.until(() => waitingFor(pk, 'wheel'), 'hold'), handTo(n, pk, 'wheel'), T.face(-1)];
      if (i < 0) return null;
      const px = z.press[i];
      return [T.walk(px + 18), T.face(-1), T.do(() => (vis.press[i].crank = true)), T.act('crank', 900), T.do(() => { vis.press[i] = null; vis.wheelOut++; noise('cheese', px + 8, 70); }), T.crouch(() => { vis.wheelOut = Math.max(0, vis.wheelOut - 1); n.item = 'wheel'; })];
    },
    packer(n) {
      const z = CZ(), stk = N('cheese', 'stacker'), pr = N('cheese', 'presser');
      if (n.item === 'wheel') {
        // Sella la rueda en la mesa; en la fase III la deja allí para el estibador, en la II la lleva él al palé.
        if (stk) return [T.face(1), T.act('stamp', 520), T.do(() => { vis.stamp = performance.now(); n.item = null; vis.table++; }), T.face(-1)];
        return [T.walk(z.table - 20), T.face(1), T.act('stamp', 520), T.do(() => { vis.stamp = performance.now(); n.item = 'wheelL'; }), ...toPallet(n, 'cheese'), T.walk(n.hx), T.face(-1)];
      }
      if (n.item) return [...toPallet(n, 'cheese'), T.walk(n.hx), T.face(-1)];
      if (pr && (pr.item === 'wheel' || vis.press.some((p) => p && p.curd))) return [T.walk(n.hx), T.face(-1), T.do(() => (n.waitTag = 'wheel')), T.until(() => n.item === 'wheel' || !n.waitTag, 'wait'), T.do(() => (n.waitTag = null))];
      return null;
    },
    stacker(n) {
      if (n.item) return [...toPallet(n, 'cheese'), T.walk(n.hx), T.face(-1)];
      if (vis.table > 0) return [T.face(-1), T.crouch(() => { if (vis.table > 0) { vis.table--; n.item = 'wheelL'; } })];
      return null;
    },
    carrier(n) {
      if (n.item) return [...toPallet(n, 'cheese'), T.walk(n.hx), T.face(-1)];
      if (vis.wheelOut > 0) return [T.face(-1), T.crouch(() => { if (vis.wheelOut > 0) { vis.wheelOut--; n.item = 'wheelL'; } })];
      return null;
    },
    turner(n, now) { if (!running.cheese() || now - (n.lastTurn || 0) < (3000 + (n.seed % 800)) / pace('cheese')) return null; n.lastTurn = now; const ta = N('cheese', 'taster'); if (ta && isIdle(ta)) ta.q = [T.face(-1), T.wait(500), T.act('read', 900), T.face(1), T.act('cheer', 420)]; return [T.face(1), T.crouch(() => (vis.turnAt = performance.now()), 460)]; },
    porter(n) {
      const P = vis.pallet.surface;
      if (!n.item && P.in.length) return [T.walk(176), T.face(1), T.crouch(() => { n.item = P.in.shift() || null; }), T.face(-1), T.walk(150), T.crouch(() => { if (n.item) vis.shopLots = Math.min(4, vis.shopLots + 1); n.item = null; }), T.walk(n.hx), T.face(1)];
      return null;
    },
  };
  function strikerPlan(n, now, phase) {
    if (sim.vein) return null;
    const solo = !has('mine', 'climber'), P = solo ? BEAT * 0.8 : BEAT, next = (Math.floor((now - phase) / P) + 1) * P + phase;
    return [T.face(-1), T.until((t) => t >= next - 260), T.act('windup', 260), T.do((t) => strike(n, t, 'worker'))];
  }
  // Chispas y polvo de MINE: sus coordenadas son las de MINE, las partículas van en el mundo.
  const msp = (x, y, kind, n) => spark(x, y + MO, kind, n);
  function strike(n, now, source) {
    const x = edgeX(n.feet - 10) - 1, y = n.feet - 10 - Math.floor(hash4(Math.floor(now / 97), n.hx) * 4);
    vis.marks.push({ x, y: y + 1, r: source === 'manual' ? 2 : 1, t: now }); if (vis.marks.length > 42) vis.marks.shift();
    msp(x, y, 'chip', source === 'manual' ? 4 : 2); if (source === 'manual') { msp(x, y + 2, 'dust', 2); vis.hitGlow = { x, y, t: now }; rfx('star', x, y + MO, { life: 170 }); for (let i = 0; i < 3; i++) rfx('drop', x - 1, y + MO, { vx: -0.03 - rnd() * 0.05, vy: -0.05 - rnd() * 0.05, life: 600, floor: LV.mine.F + MO - 2, c: [rockOf()[3], rockOf()[1]] }); }
    vis.jolt = now; vis.strikes++; n.hitAt = now; n.lastImpact = { x, y, t: now }; vis.mHit = { x, y, t: now };
    if (vis.strikes % 3 === 0 && vis.rubble + vis.falls.length < 4) vis.falls.push({ x: x + 1, y: y - 2, vx: 0.035, vy: -0.05 });
    if (hooks.hit) hooks.hit(source);
  }
  const react = (n, kind, delay = 0) => { if (n && n.crew) n.react = { kind, t0: performance.now() + delay }; };
  // FACTORY+: cuando algo suena (prensa, palanca, carbón, campana, montacargas), los que están libres cerca giran la cabeza.
  function noise(st, x, r = 60) { if (!XTRA) return; const now = performance.now(); for (const n of nodes) if (n.st === st && n.crew && !n.inside && Math.abs(n.x + 11 - x) < r && isIdle(n)) n.glance = { x, until: now + 650 + (n.seed % 350) }; }

  // ---- 3) Relacionarse: con un vecino libre del mismo nivel — saludo, charla cara a cara o mirarle trabajar ----
  const CHAT = {
    'climber|picker': [['This one is stubborn.', 'Then we hit it together.'], ['Mind my tail!', 'Mind my pick!']],
    'collector|hauler': [['Cart full yet?', 'One more and I go.'], ['Heavy stone today.', 'Good stone, though.']],
    'collector|picker': [['Keep them coming!', 'Catch!']],
    'filler|operator': [['Raw coming up!', 'Crate is filling.']],
    'checker|greaser': [['Pressure is steady.', 'Gears are happy.']],
    'filler|runner': [['Crate ready!', 'On my way!']],
    'stoker|valve': [['More fire?', 'Not yet. Hold it.']],
    'gauge|valve': [['Pressure rising!', 'Opening the valve.']],
    'molder|runner': [['Bars are still warm.', 'I like them warm.']],
    'mixer|presser': [['Curd is ready!', 'Press is waiting.'], ['Taste this.', 'Later. Press first.']],
    'packer|presser': [['Another one!', 'Stamped and shining.']],
    'packer|stacker': [['Careful, it is fresh.', 'I have got it.']],
    'taster|turner': [['Turned the old ones.', 'They smell perfect.']],
    'carrier|mixer': [['Smells great today.', 'Best batch yet.']],
  };
  const GENERIC = [['Nice work.', 'You too!'], ['Break soon?', 'After this batch.'], ['How is it going?', 'Busy, busy!']];
  const SOC = { at: 0 };
  function socialPlan(n, now) {
    if (now < n.socialAt || now < SOC.at) return null;
    const cands = nodes.filter((b) => b !== n && b.crew && !b.inside && b.st === n.st && b.role !== 'liftman' && Math.abs(b.x - n.x) <= 46 && Math.abs(b.feet - n.feet) <= 60 && isIdle(b) && now >= b.socialAt);
    if (!cands.length) { n.socialAt = now + 3000; return null; }
    const b = cands.sort((p, q) => Math.abs(p.x - n.x) - Math.abs(q.x - n.x))[0];
    const key = [n.role, b.role].sort().join('|'), lines = CHAT[key], r = hash4(n.seed, Math.floor(now / 997));
    n.socialAt = now + 15000 + r * 9000; b.socialAt = now + 12000; SOC.at = now + 2600;
    const fa = Math.sign(b.x - n.x) || n.hf, fb = -fa;
    const end = (m) => [T.do(() => (m.inter = null)), T.idle(200), T.face(m.hf)];
    n.inter = b.inter = { with: true };
    const canTalk = !BUBS.cur && !BUBS.q.length && visible(n) && visible(b) && performance.now() >= (BUBS.okAt || 0);
    if (canTalk && r < 0.7 && (lines || r < 0.35)) {
      const pool = lines || GENERIC, [la, lb] = pool[Math.floor(r * 97) % pool.length], ms = readMs(la), ms2 = readMs(lb);
      b.q = [T.face(fb), T.act('listen', ms + 380), T.act('talk', ms2), ...end(b)];
      return [T.face(fa), T.do(() => { speak(n, la, 0); speak(b, lb, 0); }), T.act('talk', ms), T.act('listen', ms2 + 380), ...end(n)];
    }
    if (XTRA && r >= 0.7 && r < 0.8) {
      // FACTORY+: le ofrece una miga de queso; el otro la coge de su pata, se la come y se alegran los dos.
      b.q = [T.face(fb), T.until(() => b.item === 'crumb', 'wait'), T.act('eat', 1000), T.do(() => { b.item = null; spark(b.x + (fb > 0 ? 16 : 4), b.feet - 12, 'dust', 1); }), T.act('cheer', 420), ...end(b)];
      return [T.face(fa), T.do(() => (n.item = 'crumb')), T.act('offer', 320), T.do((t) => { pass(n, b, t); }), T.until(() => !passOf(n)), T.act('cheer', 420), ...end(n)];
    }
    if (r < 0.9) { b.q = [T.face(fb), T.idle(260), T.act('greet', 520), ...end(b)]; return [T.face(fa), T.act('greet', 520), T.idle(380), ...end(n)]; }
    b.inter = null; return [T.face(fa), T.act('watch', 1800), T.act('cheer', 420), T.do(() => (n.inter = null)), T.face(n.hf)];
  }
  // ---- 4) Gestos sueltos cuando no hay nada que hacer ----
  function flavorPlan(n, now) {
    if (Math.abs(n.x - n.hx) > 0.5) return [T.walk(n.hx), T.face(n.hf)];
    const r = hash4(n.seed, Math.floor(now / 1300));
    if (r < 0.8) return [T.face(n.hf), T.idle(900 + r * 1100)];
    if (r < 0.9) return [T.face(-n.hf), T.idle(600, 'look'), T.face(n.hf), T.idle(300)];
    if (r < 0.96) return [T.act('stretch', 900), T.idle(500)];
    return [T.act('wipe', 760), T.idle(500)];
  }
  // El árbol: reaccionar (lo pinta la pose) → trabajo → relacionarse → gestos.
  function think(n, now) {
    if (n.role === 'liftman' || n.role === 'winch' || n.role === 'assistant') return [T.face(n.hf), T.idle(600)];
    const duty = BRAIN[n.role] ? BRAIN[n.role](n, now) : null;
    if (duty && duty.length) return duty;
    if (n.item) return [T.wait(300)];
    return socialPlan(n, now) || flavorPlan(n, now);
  }

  // ---- Pose de cada fotograma: sale de la reacción, del pase, de la tarea en curso y del papel ----
  function poseOf(n, now) {
    if (n.react && now >= n.react.t0 && now - n.react.t0 < 1000) {
      const r = now - n.react.t0, k = n.react.kind, dy = r < 80 ? 1 : r < 200 ? -2 : r < 300 ? -1 : r < 380 ? 1 : 0;
      return { dy, o: { face: k === 'go' ? 'grump' : k === 'vein' || k === 'wow' ? (r < 550 ? 'wow' : 'happy') : 'happy', tail: k !== 'go' }, pick: n.role === 'picker' || n.role === 'climber' ? 0 : undefined };
    }
    const P = passOf(n);
    if (P) {
      const t = now - P.t0, giver = (P.a === n && P.ia) || (P.b === n && P.ib);
      // FACTORY+: al cambiar de pata, los dos dan el mismo saltito (chocan las patas).
      if (XTRA && t >= 480) return { dy: t < 540 ? -1 : t < 620 ? -2 : 0, o: { face: 'happy', tail: true } };
      return { dy: giver && t < 300 ? -1 : t > 520 && t < 620 ? -1 : 0, o: t > 480 ? { face: 'happy' } : {} };
    }
    if (n.push) return { dy: 0, o: now - (n.movingAt || 0) < 90 ? { legs: Math.floor(n.walked / 3) % 2 ? 'a' : 'b', face: 'grump' } : {} };
    if (n.act && now - n.act.t0 < n.act.ms) return { dy: Math.floor((now - n.act.t0) / 140) % 2 ? 0 : -1, o: {} };
    const t = n.q[0], run = running[n.st]();
    if (t && t.k === 'walk' && Math.abs(t.x - n.x) > 0.5) return { dy: 0, o: { legs: Math.floor(n.walked / 3) % 2 ? 'a' : 'b' } };
    if (t && t.k === 'crouch') { const k = (t.el || 0) / t.ms; return { dy: k > 0.2 && k < 0.8 ? 2 : k > 0.1 && k < 0.9 ? 1 : 0, o: { face: 'down' } }; }
    if (t && t.k === 'act') {
      const e = t.el || 0;
      switch (t.pose) {
        case 'windup': return { dy: 0, o: {}, pick: 2 };
        case 'toss': return { dy: e < 120 ? 1 : -1, o: { face: 'happy' } };
        case 'lever': return { dy: e < 200 ? -1 : 1, o: { face: 'grump' } };
        case 'grease': return { dy: Math.floor(e / 160) % 2, o: { ear: true } };
        case 'valve': return { dy: Math.floor(e / 150) % 2 ? -1 : 0, o: { face: 'grump' } };
        case 'crank': return { dy: Math.floor(e / 110) % 2 ? -1 : 0, o: { face: 'grump' } };
        case 'stamp': return { dy: e % 260 < 90 ? 1 : 0, o: {} };
        case 'dump': return { dy: Math.floor(e / 130) % 2, o: { face: 'grump' }, tilt: Math.min(1, e / 260) };
        case 'read': return { dy: 0, o: { glass: true } };
        case 'greet': return { dy: e < 100 ? 1 : e < 260 ? -2 : e < 360 ? -1 : 0, o: { face: 'happy', tail: e < 400 } };
        case 'cheer': return { dy: e < 140 ? -2 : e < 260 ? -1 : 0, o: { face: 'happy', tail: true } };
        case 'talk': return { dy: Math.floor(e / 180) % 3 === 0 ? -1 : 0, o: e > t.ms - 300 ? { face: 'happy' } : {} };
        case 'listen': return { dy: 0, o: e > t.ms - 500 ? { face: 'happy' } : {} };
        case 'watch': return { dy: 0, o: e > 1200 ? { face: 'wow' } : e < 600 ? { ear: true } : {} };
        case 'stretch': return { dy: e < 300 ? -1 : e < 600 ? 0 : -1, o: e > 500 ? { tail: true, ear: true, face: 'sleep' } : { tail: true } };
        case 'wipe': return { dy: e < 260 ? 0 : 1, o: { face: e < 400 ? 'grump' : 'happy' } };
        case 'ring': return { dy: e % 220 < 110 ? -2 : -1, o: { face: 'happy', ear: true } };
        case 'reach': return { dy: e % 340 < 170 ? -3 : -1, o: { ear: true } };
        case 'offer': return { dy: -1, o: { face: 'happy' } };
        case 'eat': return { dy: Math.floor(e / 160) % 2, o: { face: 'happy', tail: e > 600 } };
      }
    }
    if (t && t.k === 'until' && (t.pose === 'hold' || t.pose === 'wait')) return { dy: 0, o: Math.floor(now / (t.pose === 'hold' ? 420 : 520)) % 2 ? { legs: 'tap' } : {} };
    const sad = { dy: 0, o: Math.floor(now / 800) % 2 ? { face: 'down', legs: 'tap' } : { face: 'down' } };
    const vn = vnow(n.st, now), hot = heat(n.st) > 0.3;
    if (hot && run && ['operator', 'stoker', 'valve', 'checker', 'gauge', 'greaser', 'taster', 'keeper'].includes(n.role)) return { dy: Math.floor((vn + n.seed) / 130) % 2 ? -1 : 0, o: { face: 'grump' } };
    switch (n.role) {
      case 'picker': case 'climber': {
        if (sim.vein) return { dy: 0, o: Math.floor((now + n.seed) / 2400) % 3 === 0 ? { face: 'happy' } : {}, pick: 0 };
        const since = now - (n.hitAt || -1e9); return { dy: since < 170 ? 1 : 0, o: since < 170 ? { face: 'grump' } : {}, pick: swingFrame(since < 300 ? since : -1, false) };
      }
      case 'checker': case 'gauge': case 'taster': return run ? { dy: 0, o: { glass: true } } : sad;
      case 'assistant': return { dy: 0, o: { book: Math.floor((now + n.seed) / 1100) % 2 ? 2 : 1 } };
      case 'winch': return run ? { dy: Math.floor(now / 240) % 2, o: { face: 'grump' } } : { dy: 0, o: {} };
      case 'mixer': return run && !n.item ? { dy: STGS.cheese === 1 ? Math.floor(vn / 300) % 2 : Math.floor(vis.stir) % 2, o: hot ? { face: 'grump' } : {} } : run ? { dy: 0, o: {} } : sad;
      case 'operator': case 'stoker': case 'valve': return run ? { dy: 0, o: {} } : sad;
      case 'liftman': return n.act && now - n.act.t0 < n.act.ms ? { dy: -1, o: {} } : { dy: 0, o: {} };
      default: return { dy: 0, o: t && t.pose === 'look' ? { ear: true } : {} };
    }
  }
  function drawMouse(n, now, inCage, lit) {
    if (!n.crew || n.inside) return;
    let face = n.face; if (n.glance && now < n.glance.until && isIdle(n)) face = n.glance.x < n.x + 11 ? -1 : 1;
    const p = poseOf(n, now), x = Math.round(n.x), feet = Math.round(n.feet), flip = face < 0;
    if (!n.blinkAt || now > n.blinkAt + 120) n.blinkAt = now + 2200 + hash4(n.seed, Math.floor(now / 5000)) * 2400;
    const blink = now > n.blinkAt && now < n.blinkAt + 110, breath = Math.floor((now + (n.seed % 1300)) / (620 + (n.seed % 200))) % 2;
    const c0 = mF(n.crew, p.o.legs ? 0 : breath, blink, p.o), c = lit ? litSprite(c0) : c0, y = feet - 20 + p.dy;
    if (!inCage) groundShadow(ctx, x + 1, feet, 20, 0.28);
    ctx.save(); if (flip) { ctx.translate(x + 22, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    ctx.drawImage(c, x, y);
    if (p.pick !== undefined) { const pk = approvedPick(p.pick); if (pk) ctx.drawImage(pk, x + PICK_OX, feet - 20 + PICK_OY + p.dy); }
    if (n.item && n.item !== 'empty') { const im = ITEM[n.item](); ctx.drawImage(im, x + 13, feet - 8 - im.height + p.dy); }
    if (n.item === 'empty') ctx.drawImage(crateC(0), x + 13, feet - 17 + p.dy);
    ctx.restore();
    if (n.lastImpact && now - n.lastImpact.t < 260) vfxImpact(ctx, n.lastImpact.x, n.lastImpact.y, now - n.lastImpact.t, false);
    if (!inCage) sweat(n, now, frameDt);
    if (p.tilt) vis.cart.tilt = p.tilt;
    n.px = x; n.py = feet + (n.st === 'mine' ? MO : 0);
  }

  // ================= GLOBOS (capa propia, estable) =================
  // Un globo cada vez (los aprobados: .ad-bub con su punta). Se mide una vez con su ancho final; su lado (encima o al costado)
  // se decide al nacer y no cambia; después solo sigue a la cabeza, suavizado, dentro de la escena y por debajo del marcador.
  const bubHost = document.createElement('div'); bubHost.className = 'lb-host'; host.appendChild(bubHost);
  const hudBottom = () => { const e = document.querySelector('.hud'), hb = host.getBoundingClientRect(); return e ? e.getBoundingClientRect().bottom - hb.top + 4 : 8; };
  const BUBS = window.BetaBubbles({
    host: bubHost, readMs, tail: TAILSVG('down'),
    // Se habla por ratón, no por sitio: si lo cogen o cambia de puesto, su globo no se queda colgado donde estaba.
    head: (w) => { const q = nodes.find((x) => x.crew && x.m && x.m.id === w.id); if (!q || q.px == null) return null; return { x: (q.px + 11 - cam.x) * s, y: (q.py - 19 - cam.y) * s, visible: visible(q) }; },
    bounds: () => ({ left: 6, right: Wc - 6, top: hudBottom(), bottom: Hc - insetB - 4 }),
    obstacles: () => obstacles(), canStart: () => !boostBusy(), hush: (c) => boostBusy() && overBoost(c),
  });
  function speak(n, text, pri) { if (!n || !n.m) return false; return BUBS.say({ id: n.m.id }, text, pri === true ? 2 : pri == null ? 1 : pri); }
  function bubbleTick(now) { BUBS.tick(now); }
  // ¿Tapa el globo la máquina que se está activando? (rectángulo del taladro y su módulo, en pantalla)
  function overBoost(c) { if (c.x == null) return false; const x0 = (DCX - 18 - cam.x) * s, x1 = (DCX + 18 - cam.x) * s, y0 = (LV.drill.F - 50 - cam.y) * s, y1 = (LV.drill.F + 4 - cam.y) * s; return !(c.x > x1 || c.x + c.w < x0 || c.y > y1 || c.y + c.h < y0); }
  // Lo que un globo no tapa: los carteles de estación, el objetivo y el botón de volver a la mina (si están a la vista).
  function obstacles() { return [...document.querySelectorAll('#plates > *, #goal, #home-btn, .focus-tag.in')].filter((el) => el.style.visibility !== 'hidden' && !el.hidden && (el.id !== 'home-btn' || el.classList.contains('in'))); }
  function say2(a, la, b, lb) { if (!a || !b) return; speak(a, la); speak(b, lb); }
  const visible = (n) => !!n && n.px != null && n.py - 20 >= cam.y + 18 && n.py <= cam.y + (Hc - insetB) / s && n.px >= cam.x - 4 && n.px <= cam.x + Wc / s;
  function onEvent(type) {
    const now = performance.now();
    if (type === 'reveal') { vis.reveal = { t0: now, burst: false }; vis.drillCycle++; for (const n of nodes) if (n.st === 'mine' || n.st === 'drill') react(n, 'vein', ((n.hx >> 3) % 4) * 90); say2(N('mine', 'picker'), 'Vein! Look at that!', N('drill', 'operator'), 'Bar going down!'); }
    if (type === 'deeper') { vis.marks.length = 0; const p = N('mine', 'climber') || N('mine', 'picker'); if (p) speak(p, 'Empty. Dig deeper!'); }
    if (type === 'stratum') { for (const n of nodes) react(n, 'wow', ((n.hx >> 3) % 5) * 80); const p = N('mine', 'collector'); if (p) speak(p, 'New stone down here!', true); }
    if (type === 'refineDone') vis.rFire = now;
    if (type === 'drillDone') { vis.drip.push({ t0: now }); vis.drillCycle++; }
    if (type === 'refineDone') { const t = STGS.refine >= 3 && vis.trays[1] < vis.trays[0] ? 1 : 0; vis.trays[t] = Math.min(3, vis.trays[t] + 1); }
    if (type === 'cookDone') { if (STGS.cheese === 1) vis.wheelOut = Math.min(2, vis.wheelOut + 1); else vis.curd = Math.min(2, vis.curd + 1); }
    if (type === 'sale') { vis.shopLots = Math.max(0, vis.shopLots - 1); vis.coin = now; if (heat('sell') > 0.3) for (let i = 0; i < 3; i++) rfx('coin', 158, G - 28, { x1: 146 + i * 12, y1: G - 30 + (i % 2) * 3, h: 10 + i * 3, life: 520, delay: i * 70 }); }
    if (type === 'tap') { const p = N('mine', 'picker'); if (p && !sim.vein) strike(p, now, 'manual'); else vis.jolt = now; }
  }
  // Lo que la máquina gasta se ve: cada hornada que empieza baja una marca de la tolva o de la cuba; el agitador gira mientras
  // se cuaja (la manivela la mueve el quesero).
  function feedTick(now, dt) {
    if (sim.refJob && !vis.prevRef) { vis.refStart = now; const t = STGS.refine >= 3 && vis.hopper[1] > vis.hopper[0] ? 1 : 0; vis.hopper[t] = Math.max(0, vis.hopper[t] - 1); } vis.prevRef = sim.refJob;
    if (sim.cookJob && !vis.prevCook) { vis.cookStart = now; vis.vat = Math.max(0, vis.vat - 1); } vis.prevCook = sim.cookJob;
    const mx = N('cheese', 'mixer'); if (sim.cookJob && mx && !mx.item && !mx.inter) vis.stir += (dt * pace('cheese')) / 220;
  }

  // ================= CÁMARA, ESCALA Y DIBUJO =================
  // Tres modos: libre (el jugador arrastra, con inercia), estación (centrada, las demás apagadas y su marco) y ratón (la
  // cámara le sigue y se acerca un punto de escala entera, como un pequeño zoom). Arrastrar suelta cualquier enfoque: el velo
  // y el marco se van y la cámara queda libre.
  let s = 1.5, dpr = 1, Wc = 1, Hc = 1, d0 = 3, dz = 3;
  const cam = { x: 0, y: 0, tx: 0, ty: 0, vy: 0 };
  let mode = 'free', focusSt = null, focusAmt = 0, focusOut = null;
  function resize() {
    const box = canvas.parentElement.getBoundingClientRect(); if (!box.width) return;
    dpr = window.devicePixelRatio || 1; Wc = box.width; Hc = box.height;
    d0 = Math.max(1, Math.floor((Wc * dpr) / (E1 - E0))); dz = mode === 'mouse' ? d0 + 1 : d0; s = dz / dpr;
    canvas.width = Math.round(Wc * dpr); canvas.height = Math.round(Hc * dpr);
    cam.tx = cam.x = centerX();
    if (!resize.done) { cam.ty = cam.y = clampY(baseBottom() - vH()); resize.done = true; } else cam.ty = clampY(cam.ty);
  }
  // Alto visible del mundo; si algo tapa la parte de abajo (la tira de obreros), la cámara puede bajar más para que el
  // fondo del mundo quede por encima.
  let insetB = 0;
  const vH = () => (Hc - insetB) / s, vW = () => Wc / s;
  const STREET = 30, streetY = (vh) => Math.min(-26, G + STREET - vh); // filas del dibujo bajo el suelo, las mismas que en LAB
  const clampY = (y) => Math.max(Math.min(streetY(vH()), Hw() - vH()), Math.min(Hw() - vH(), y));
  const centerX = () => Math.round((E0 + E1) / 2 - vW() / 2);
  const clampX = (x) => Math.max(-PAD + 2, Math.min(WW + PAD - 2 - vW(), x));
  // TRANSICIONES DE CÁMARA (28-10-2026): entrar en un ratón, pasar de uno a otro, centrar una estación o soltar el zoom son
  // una sola curva con aceleración y frenada (ease in-out), de 0,35 a 0,9 s según la distancia, y el zoom va con la misma
  // curva. El destino se recalcula en cada fotograma (el ratón sigue andando): la cámara llega a donde está, no a donde
  // estaba, y solo al llegar se engancha a él. Antes la perseguía con un suavizado muy rápido y se notaba a tirón.
  let tw = null; // { fx, fy, fz, t0, ms }
  const easeIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const vWz = (z) => (Wc * dpr) / z, vHz = (z) => ((Hc - insetB) * dpr) / z;
  const clampXz = (x, z) => Math.max(-PAD + 2, Math.min(WW + PAD - 2 - vWz(z), x));
  const clampYz = (y, z) => Math.max(Math.min(mode === 'mouse' ? -26 : streetY(vHz(z)), Hw() - vHz(z)), Math.min(Hw() - vHz(z), y));
  const centerXz = (z) => Math.round((E0 + E1) / 2 - vWz(z) / 2);
  // pan: la curva lleva también la altura con la cámara libre (recentrar al elegir un ratón que no se ve).
  function startTween(pan) { tw = { fx: cam.x, fy: cam.y, fz: dz, t0: null, ms: 0, pan: !!pan }; camLocked = false; } // empieza en el siguiente fotograma, con el reloj de la escena
  function camTick(dt, now) {
    const tz = mode === 'mouse' ? d0 + 1 : d0;
    let tx, ty;
    if (mode === 'mouse') {
      const n = nodes.find((q) => q.m && q.m.id === selMouse);
      if (!n || n.px == null) { release(); return camTick(dt, now); }
      // Pegada a la rejilla del dibujo una vez enganchada: el ratón queda quieto en pantalla y pasa el fondo.
      tx = clampXz(n.px + 11 - Math.round(vWz(tz) / 2), tz); ty = clampYz(n.py - 12 - Math.round(vHz(tz) * 0.45), tz);
    } else if (mode === 'station') {
      tx = centerXz(tz); if (focusSt === 'mine') cam.ty = clampYz(stRect('mine')[1] + stRect('mine')[3] / 2 - vHz(tz) / 2 - 8, tz); ty = cam.ty;
    } else {
      tx = centerXz(tz);
      if (anchored && !dragging) cam.ty = clampYz(baseBottom() - vHz(tz), tz);
      if (Math.abs(cam.vy) > 0.002) { cam.ty = clampY(cam.ty + cam.vy * dt); cam.vy *= Math.pow(0.9, dt / 16); if (cam.ty === clampY(-1e9) || cam.ty === clampY(1e9)) cam.vy = 0; } else cam.vy = 0;
      ty = cam.ty;
    }
    if (tw) {
      if (tw.t0 == null) tw.t0 = now;
      if (!tw.ms) tw.ms = Math.max(350, Math.min(900, 330 + Math.hypot(tx - tw.fx, ty - tw.fy) * 2.2 + Math.abs(tz - tw.fz) * 120));
      const k = Math.min(1, (now - tw.t0) / tw.ms), e = exitFinger != null ? 1 - Math.pow(1 - k, 3) : easeIO(k), wyF = exitFinger != null ? cam.y + exitFinger / s : 0;
      dz = tw.fz + (tz - tw.fz) * e; s = dz / dpr;
      if (exitFinger != null) { ty = clampYz(wyF - exitFinger / s, dz); cam.ty = ty; if (k >= 1) exitFinger = null; }
      cam.x = tw.fx + (tx - tw.fx) * e;
      // Libre (al soltar o al arrastrar): la altura la lleva el dedo o el ancla; la curva solo mueve el zoom y el centrado.
      const ly = mode !== 'free' || (tw.pan && !dragging);
      if (ly) cam.y = tw.fy + (ty - tw.fy) * e; else cam.y += (ty - cam.y) * (dragging ? 1 : 0.25);
      if (k >= 1) { tw = null; dz = tz; s = dz / dpr; cam.x = tx; if (ly) cam.y = ty; if (mode === 'mouse') camLocked = true; }
    } else {
      if (dz !== tz) { dz = tz; s = dz / dpr; }
      cam.x = tx;
      if (mode === 'mouse') { cam.y = ty; camLocked = true; }
      else if (mode === 'station') cam.y += (ty - cam.y) * Math.min(1, dt / 90);
      else cam.y += (ty - cam.y) * (dragging ? 1 : 0.25);
      if (Math.abs(ty - cam.y) < 0.2) cam.y = ty;
    }
    if (exitX) {
      if (mode !== 'free') exitX = null;
      else {
        const centerNow = (E0 + E1) / 2 - vWz(dz) / 2 + (centerXz(d0) - ((E0 + E1) / 2 - vWz(d0) / 2)), off = exitX.wx - exitX.fx / s - centerNow;
        if (exitX.lifted && exitX.auto == null) { exitX.auto = now; exitX.q0 = exitX.q; exitX.ms = Math.max(240, Math.min(560, Math.abs(off * exitX.q) * s * 6)); }
        if (exitX.auto != null) { const a = Math.min(1, (now - exitX.auto) / exitX.ms); exitX.q = exitX.q0 * (1 - a * a * (3 - 2 * a)); }
        else { const p = Math.min(1, exitX.travel / exitX.dist); exitX.q = 1 - p * p * (3 - 2 * p); }
        cam.x = clampXz(centerNow + off * exitX.q, dz); tx = cam.x;
        if (exitX.q <= 0 && !tw) { exitX = null; cam.x = centerXz(tz); tx = cam.x; }
      }
    }
    cam.tx = tx;
    // Velo y marco: entran al enfocar y se van al soltar.
    const want = mode === 'free' ? 0 : 1; focusAmt += (want - focusAmt) * Math.min(1, dt / 90); if (Math.abs(want - focusAmt) < 0.01) focusAmt = want;
  }
  let camLocked = false; // el seguimiento ya llegó al ratón: desde ahí va pegado a él
  let exitFinger = null, exitX = null;
  let dragging = false, anchored = true; // anclada: la cámara libre sigue al fondo de MINE (como al empezar)
  function release() { if (mode !== 'free') { focusOut = { st: mode === 'station' ? focusSt : null }; if (mode === 'mouse') { startTween(); cam.ty = cam.y + vHz(dz) / 2 - vHz(d0) / 2; } } mode = 'free'; selMouse = null; }
  function focusStation(st) {
    if (!(mode === 'station' && focusSt === st)) startTween();
    anchored = false; mode = 'station'; focusSt = st; selMouse = null; selAt = performance.now(); cam.vy = 0;
    const r = stRect(st); if (r) cam.ty = clampYz(st === 'sell' ? -26 : r[1] + r[3] / 2 - vHz(d0) / 2 - 8, d0);
  }
  function focusMouse(id) {
    const n = nodes.find((q) => q.m && q.m.id === id); if (!n) return;
    if (id !== selMouse) { mouseAt0 = performance.now(); if (isIdle(n)) react(n, 'greet'); }
    // FOLLOW sobre el ratón ya elegido (el caso normal: tocarlo y luego FOLLOW) también entra con la curva; antes solo había
    // curva si cambiaba de ratón, y la cámara saltaba de golpe al zoom de seguir.
    if (id !== selMouse || mode !== 'mouse') startTween();
    mode = 'mouse'; selMouse = id; focusSt = n.st; cam.vy = 0; anchored = false;
  }
  // ELEGIR UN RATÓN (feedback PM 2, 28-10-2026): un toque lo elige (marco, flecha y su placa) y la cámara no le sigue: se
  // queda donde está y solo se mueve, con la misma curva suave, si el ratón no se ve o lo tapa la interfaz (top: alto del
  // marcador y el objetivo en px de pantalla; abajo, lo que diga setInsetBottom). Si estaba enfocada otra estación, el
  // velo se va sin mover la cámara. Seguirle es otra decisión (FOLLOW: focusMouse).
  function pickMouse(id, top = 0) {
    const n = nodes.find((q) => q.m && q.m.id === id); if (!n || n.px == null) return false;
    if (id !== selMouse) { mouseAt0 = performance.now(); if (isIdle(n)) react(n, 'greet'); }
    if (mode === 'mouse' && id === selMouse) return true; // ya se le sigue: sigue igual
    if (mode === 'mouse') { startTween(); cam.ty = cam.y + vHz(dz) / 2 - vHz(d0) / 2; mode = 'free'; anchored = false; }
    else if (mode === 'station' && focusSt !== n.st) { focusOut = { st: focusSt }; mode = 'free'; cam.ty = cam.y; anchored = false; }
    selMouse = id;
    const s0 = d0 / dpr, y0 = (n.py - 26 - cam.ty) * s0, y1 = (n.py + 2 - cam.ty) * s0 + 38, bot = Hc - insetB; // con su placa debajo
    if (y0 < top || y1 > bot) {
      if (mode === 'station') { focusOut = { st: focusSt }; mode = 'free'; }
      if (!tw) startTween(true); else tw.pan = true;
      anchored = false; cam.vy = 0; cam.ty = clampYz(n.py - 10 - (top + bot) / 2 / s0, d0);
    }
    return true;
  }
  const here = (n) => !['drill', 'refine', 'cheese'].includes(n.st) || builtSt(n.st); // sin construir, sus ratones no están
  let lastT = 0, frameDt = 16;
  function draw(now) {
    const gapA = lastT ? now - lastT : 0; if (gapA > 64) for (const S of [BA, SA, ACT.refine, ACT.cheese, ACT.mine]) if (S.act) S.act.t0 += gapA - 64;
    const dt = Math.max(0, Math.min(64, lastT ? now - lastT : 16)); lastT = Math.max(lastT, now); frameDt = dt;
    { const b = canvas.parentElement.getBoundingClientRect(); if (Math.abs(b.width - Wc) > 0.5 || Math.abs(b.height - Hc) > 0.5 || (window.devicePixelRatio || 1) !== dpr) resize(); }
    // Primero se mueven los ratones y después la cámara: así la cámara enganchada usa la posición de este fotograma y no la
    // del anterior (ese fotograma de retraso hacía que el ratón seguido diera saltitos de un píxel).
    rushTick(now, dt);
    for (const n of nodes) { if (!n.crew || n.inside || !here(n)) continue; if (!n.q.length) n.q = think(n, now) || [T.idle(300)]; runTasks(n, now, dt); }
    curNode = null;
    // La vagoneta: tira el acarreador y empuja quien le ayuda (antes se calculaba al pintar, después de la cámara).
    for (const n of nodes) if (n.crew && !n.inside && n.role === 'hauler' && n.pull) vis.cart.x = Math.round(n.x - 18);
    for (const n of nodes) if (n.crew && !n.inside && n.push) { const nx = vis.cart.x - 20; if (Math.abs(nx - n.x) > 0.1) { n.walked += Math.abs(nx - n.x); n.face = nx > n.x ? 1 : -1; n.movingAt = now; } n.x = nx; }
    for (const n of nodes) { if (!n.crew || n.inside) continue; if (n.st !== 'lift' && n.role !== 'keeper' && n.role !== 'researcher') { n.px = Math.round(n.x); n.py = Math.round(n.feet) + (n.st === 'mine' ? MO : 0); } }
    camTick(dt, now);
    // Con un ratón enganchado, la cámara se pinta en píxeles enteros de dibujo (como él); si no, en píxeles de pantalla.
    const kd = s * dpr, grid = mode === 'mouse' && camLocked ? 1 : 1 / kd, cy = Math.round(cam.y / grid) * grid, cx = Math.round(cam.x / grid) * grid;
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(kd, 0, 0, kd, -cx * kd, -cy * kd);
    const was = ctx; ctx = g;
    try {
      descendTick(now); drawStrata(now);
      g.drawImage(bake(), -PAD, 0); R(-PAD, Hw(), WW + PAD * 2, 400, '#050407');
      drawPit(now);
      const mb = mineBake(); g.drawImage(mb, -PAD, mb.top + MO);
      feedTick(now, dt); liftStep(now); passStep(now); if (builtSt('refine')) trolleyStep('refine', now); if (builtSt('cheese')) trolleyStep('cheese', now);
      // El árbol de cada ratón: con la cola vacía decide qué hace (el ascensorista también, aunque se pinte dentro de la jaula).
      drawSurface(now, dt);
      const q0 = quake(now); ctx.save(); ctx.translate(q0, MO); drawFace(now); drawBoostMine(now); drawPile(); drawCart(); plaqueDepth(); ctx.restore();
      buildTick(now); drawStation('refine', now, dt); drawStation('cheese', now, dt); drawStation('drill', now, dt); drawRawFlow(now); drawOil(now);
      drawStores(); drawPallets();
      flickTick(now);
      for (const k of ORDER) for (const lx of LAMPS[k]) { const fl = vis.flick && vis.flick.st === k && vis.flick.lx === lx && Math.floor(now / 90) % 3 === 0; if (k === 'mine') continue; if (fl) R(lx - 1, LV[k].y0 + 7, 5, 4, '#5a4a32'); else lampGlow(k + lx, lx, LV[k].y0 + 6, now); }
      for (const st of ['drill', 'refine', 'cheese']) { const hh = heat(st); if (hh > 0.02) for (const lx of LAMPS[st]) glowH(lx + 1, LV[st].y0 + 9, 18 + Math.round(6 * hh), '#ffd890', 0.28 * hh); }
      if (XTRA) for (const st of ['drill', 'refine', 'cheese']) drawBell(st, now);
      const order = nodes.filter((n) => n.crew && !n.inside && here(n) && n.role !== 'liftman' && n.st !== 'mine' && !isOutside(n)).sort((a, b) => a.feet - b.feet);
      for (const n of order) drawMouse(n, now, false);
      ctx.save(); ctx.translate(0, MO); for (const n of nodes.filter((q) => q.crew && q.st === 'mine').sort((a, b) => a.feet - b.feet)) drawMouse(n, now, false); drawFalls(now, dt); ctx.restore();
      if (builtSt('refine')) drawTrolley('refine'); if (builtSt('cheese')) drawTrolley('cheese');
      drawPasses(now); drawTosses(now); drawRFX(now, dt);
      drawLift(now);
      skyLight(now); townLights(now); shopBoostNight(now);
      drawResearcher(now); for (const n of nodes.filter((q) => q.crew && !q.inside && isOutside(q)).sort((a, b) => a.feet - b.feet)) drawMouse(n, now, false, true);
      lightPools(now);
      lifeTick(now); drawLife(now);
      drawSelection(now);
      const fm = selMouse && nodes.find((q) => q.m && q.m.id === selMouse); if (fm && fm.px != null) mouseFrame(fm, now);
      drawTaps(now);
      drawParticles(now, dt);
    } finally { ctx = was; }
    bubbleTick(now);
    if (ph) drawPH();
  }
  // La estación elegida: las demás estaciones se apagan (un velo oscuro que entra en 220 ms) y la elegida lleva un marco
  // dorado de 1 px con esquinas de 2 px que entra encajando desde 6 px más grande, con un destello al llegar.
  // Rectángulo de una estación en el mundo (MINE baja con el pozo).
  const stRect = (st) => (st === 'sell' ? [L.buildings.shop[0] + 2, L.buildings.shop[1] - 2, L.buildings.shop[2] - 18, L.buildings.shop[3] + 4] : st === 'mine' ? [L.st.mine[0], L.st.mine[1] + MO, L.st.mine[2], L.st.mine[3]] : L.st[st]);
  function drawSelection(now) {
    const fst = focusSt || (focusOut && focusOut.st);
    if (focusAmt <= 0.001 || !fst) return;
    const e = focusAmt;
    ctx.globalAlpha = 0.24 * e; ctx.fillStyle = '#07050c';
    for (const st of ['cheese', 'refine', 'drill', 'mine']) if (st !== fst) { const q = stRect(st); ctx.fillRect(q[0], q[1] - BEAM, q[2], q[3] + BEAM); }
    ctx.globalAlpha = 1;
    if (mode === 'mouse' || (mode === 'free' && !(focusOut && focusOut.st))) return;
    const r = stRect(fst); if (!r) return;
    // El marco entero entra encajando y marca la estación; a los 0,7 s se apaga y quedan solo las esquinas.
    const k0 = Math.min(1, (now - selAt) / 220), e0 = 1 - Math.pow(1 - k0, 3), gr = Math.round((1 - e0) * 6), x = r[0] + 1 - gr, y = r[1] + 1 - gr, w = r[2] - 2 + gr * 2, h = r[3] - 2 + gr * 2, flash = now - selAt < 260 && now - selAt > 180;
    const c = flash ? '#fff6c8' : '#ffcf2e', cd = '#b8800a', lines = e * (1 - Math.min(1, Math.max(0, (now - selAt - 700) / 300)));
    if (lines > 0.01) { ctx.globalAlpha = lines; R(x, y, w, 1, c); R(x, y + h - 1, w, 1, c); R(x, y, 1, h, c); R(x + w - 1, y, 1, h, c); R(x + 1, y + 1, w - 2, 1, cd); R(x + 1, y + 1, 1, h - 2, cd); }
    ctx.globalAlpha = e;
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) { R(Math.min(cx, cx + sx * 6), cy - (sy < 0 ? 1 : 0), 7, 2, c); R(cx - (sx < 0 ? 1 : 0), Math.min(cy, cy + sy * 6), 2, 7, c); }
    ctx.globalAlpha = 1;
  }
  // El ratón elegido: esquinas doradas que respiran y una flecha que baja sobre su cabeza al elegirlo.
  function mouseFrame(n, now) {
    const t = now - mouseAt0, bob = Math.floor(now / 400) % 2, x = n.px, y = n.py - 21;
    sel([x + 1, y, 20, 22]);
    const ay = y - 7 - (t < 300 ? Math.round((1 - t / 300) * 6) : bob);
    R(x + 9, ay, 5, 1, '#ffcf2e'); R(x + 10, ay + 1, 3, 1, '#ffcf2e'); R(x + 11, ay + 2, 1, 1, '#ffcf2e'); R(x + 9, ay - 1, 5, 1, INK4);
  }
  function drawTaps(now) {
    for (let i = taps.length - 1; i >= 0; i--) {
      const t = (now - taps[i].t0) / 300; if (t >= 1) { taps.splice(i, 1); continue; }
      const r = Math.round(2 + t * 7), cx = taps[i].x, cy = taps[i].y; ctx.globalAlpha = 1 - t;
      for (let a = 0; a < 16; a++) { const an = (a / 16) * Math.PI * 2; R(Math.round(cx + Math.cos(an) * r), Math.round(cy + Math.sin(an) * r), 1, 1, a % 2 ? '#ffcf2e' : '#fff6c8'); }
      ctx.globalAlpha = 1;
    }
  }
  // FACTORY+: campana del rellano (colgada del techo) y su cuerda; al tirar, la cuerda baja, la campana se balancea y suena.
  function drawBell(st, now) {
    const by = LV[st].y0 + 8, t = now - (vis.bell[st] || -1e9), sw = t < 720 ? [0, 1, 0, -1][Math.floor(t / 90) % 4] : 0, pull = t < 260 ? 2 : 0, bx = BELLX - 2;
    R(bx + 2, by - 8, 1, 8, MAT.iron[1]);
    R(bx - 1 + sw, by, 7, 1, INK4); R(bx - 2 + sw, by + 1, 9, 5, INK4); R(bx - 1 + sw, by + 1, 7, 4, '#e0ac3a'); R(bx - 1 + sw, by + 1, 3, 1, '#fff0b0'); R(bx + 3 + sw, by + 3, 3, 2, '#a8781a'); R(bx + 2 - sw, by + 6, 1, 1, INK4);
    const ry0 = by + 7, ry1 = LV[st].F - 18 + pull; R(bx + 2, ry0, 1, ry1 - ry0, '#c8b48a'); R(bx + 1, ry1, 3, 2, '#8a6a3a');
    if (t < 620) { const k = t / 620; ctx.globalAlpha = 1 - k; for (const rr of [5 + Math.round(k * 4), 8 + Math.round(k * 6)]) { R(bx - rr, by + 2, 1, 3, '#fff6c8'); R(bx + 4 + rr, by + 2, 1, 3, '#fff6c8'); } ctx.globalAlpha = 1; }
  }
  // FACTORY+: de vez en cuando un farol de un altillo parpadea y el ratón del altillo que tiene más cerca salta a arreglarlo.
  const FLICK = { cheese: 54, refine: 30, drill: 80 };
  function flickTick(now) {
    if (!XTRA) { vis.flick = null; return; }
    if (vis.flick && now - vis.flick.t0 > 4200) vis.flick = null;
    if (vis.flick || now < vis.flickNext || STGS.mine < 2) return;
    vis.flickNext = now + 24000 + Math.random() * 18000;
    const st = ['cheese', 'refine', 'drill'][Math.floor(Math.random() * 3)], lx = FLICK[st];
    const fixer = nodes.filter((n) => n.st === st && n.surf === 'G' && n.crew && isIdle(n) && Math.abs(n.x + 11 - lx) < 44).sort((a, b) => Math.abs(a.x + 11 - lx) - Math.abs(b.x + 11 - lx))[0];
    vis.flick = { st, lx, t0: now };
    if (!fixer) return;
    const f = lx < fixer.x + 11 ? -1 : 1;
    fixer.inter = { with: 'lamp' };
    fixer.q = [T.wait(700), T.face(f), T.act('reach', 760), T.do(() => { vis.flick = null; noise(st, lx, 70); }), T.act('cheer', 420), T.do(() => (fixer.inter = null)), T.face(fixer.hf)];
  }
  function plaqueDepth() {
    const y = LV.mine.F - 46, w = depthPlate(182, y, sim.depth, PLATE_MAT[tier] || PLATE_MAT.cheddar);
    if (vis.desc && performance.now() - vis.desc.t0 < 1200 && Math.floor(performance.now() / 120) % 2) { const c = '#ffcf2e'; R(180, y - 2, w + 4, 1, c); R(180, y + 12, w + 4, 1, c); R(180, y - 2, 1, 15, c); R(183 + w, y - 2, 1, 15, c); }
  }

  // ---- Geometría pública y registro PH ----
  const L = {
    st: { cheese: [E0, LV.cheese.y0, SX0 - E0, LV.cheese.F - LV.cheese.y0], refine: [E0, LV.refine.y0, SX0 - E0, LV.refine.F - LV.refine.y0], drill: [E0, LV.drill.y0, SX0 - E0, LV.drill.F - LV.drill.y0], mine: [E0, LV.mine.y0, SX0 - E0, LV.mine.F - LV.mine.y0] },
    plates: [['cheese', LV.cheese.y0 + 3, LV.cheese.F], ['refine', LV.refine.y0 + 3, LV.refine.F], ['drill', LV.drill.y0 + 3, LV.drill.F], ['mine', LV.mine.y0 + 3, LV.mine.F]],
    get buildings() { return TOWN ? { house: [LOT.house[0], G - 65, LOT.house[1], 66], shop: [LOT.shop[0], G - SHOP_H + 1, SHOP_W, SHOP_H] } : { house: [-6, G - 57, 64, 58], lab: [52, G - 80, 86, 80], shop: [118, G - SHOP_H + 1, SHOP_W, SHOP_H] }; },
  };
  function phList() {
    return [
      ['WALLS · BEAMS · LAMPS', 'new', [E0, LV.cheese.top, SX0 - E0, LV.mine.F - LV.cheese.top]],
      ['MINE FACE · BORE', 'new', [FACE.x0, FACE.y0, 62, FACE.y1 - FACE.y0]],
      ['TROLLEY · STORE SHELF', 'new', [HOPPER[0] - 4, railY('refine') - 6, SX0 - HOPPER[0], 16]],
      ['TROLLEY · STORE SHELF', 'new', [CZ().vatC - 4, railY('cheese') - 6, SX0 - CZ().vatC, 16]],
      ['CAGE · SHAFT · HEADFRAME · WINCH', 'new', [176, G - 82, SX1 - 176, 90]],
      ['DRILL (MAIN 2.0)', 'reused', [DCX - 26, LV.drill.F - 46, 56, 47]],
      ['REFINE B (MAIN 2.0)', 'reused', [RF.x, REFY, 72, 52]],
      ['HOUSE · LAB · SHOP', TOWN ? 'new' : 'ok', TOWN ? [0, G - 81, LOT.shop[0] + SHOP_W, 82] : [-6, G - 80, 198, 81]],
      ...(STGS.drill >= 2 ? [['SCAFFOLD', 'new', [SCAF.x0, SCAF.y, SCAF.x1 - SCAF.x0, LV.mine.F - SCAF.y]], ['DERRICK · GALLERY · GEARS', 'new', [8, LV.drill.y0, 114, 46]], ['GALLERY · VALVE · GAUGE', 'new', [8, LV.refine.y0 + 10, gal('refine')[1], 30]], ['BIG VAT · PRESS · STAMP TABLE', 'new', [8, LV.cheese.F - 30, 162, 30]]] : [['CHEESE (MAIN 2.0, no fixed paddle)', 'reused', [34, LV.cheese.F - 46, 42, 46]]]),
      ...(STGS.refine >= 3 ? [['PUMP · BELT', 'new', [58, GALY.drill - 28, 42, 30]], ['2nd STILL (MAIN 2.0)', 'reused', [STILL2.x, REFY + 18, 34, 34]], ['CART · RAILS', 'new', [CART.home - 4, LV.mine.F - 16, SX0 - CART.home, 20]]] : []),
    ];
  }
  function overlaps() {
    const list = nodes.filter((n) => n.crew && !n.inside && n.px != null && n.role !== 'liftman'), out = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i], b = list[j]; if (Math.abs(a.py - b.py) < 18 && Math.abs(a.px - b.px) < 20) out.push([a.key, b.key]); }
    return out;
  }
  function drawPH() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.lineWidth = Math.max(1, dpr); g.setLineDash([4 * dpr, 3 * dpr]); g.font = (9 * dpr) + 'px system-ui, sans-serif';
    const K = { ok: '#62d36e', reused: '#ffb347', new: '#ff4fd8' }, S2 = (x, y) => [(x - cam.x) * s * dpr, (y - cam.y) * s * dpr];
    for (const [id, kind, r] of phList()) { const [x, y] = S2(r[0], r[1]); g.strokeStyle = K[kind]; g.strokeRect(x, y, r[2] * s * dpr, r[3] * s * dpr); g.fillStyle = K[kind]; g.fillText(id, x + 2 * dpr, y + 10 * dpr); }
    g.setLineDash([]);
    for (const n of nodes) { if (n.inside) continue; const [x, y] = S2(n.hx + 11, n.hs); g.strokeStyle = n.crew ? '#ffffff' : '#ff5a7a'; g.strokeRect(x - 3 * dpr, y - 3 * dpr, 6 * dpr, 6 * dpr); }
  }

  // ---- Toques ----
  function worldAt(sx, sy) { return [cam.x + sx / s, cam.y + sy / s]; }
  const toMine = (wy) => wy - MO; // de mundo a las coordenadas propias de MINE
  function hit(sx, sy) {
    const [wx, wy] = worldAt(sx, sy);
    if (wy < G + 6) { for (const [id, r] of Object.entries(L.buildings)) if (wx >= r[0] && wx <= r[0] + r[2] && wy >= r[1] && wy <= r[1] + r[3]) return { type: 'building', id }; return null; }
    const my = toMine(wy);
    if (wx >= FACE.x0 && wx <= edgeX(my) + 2 && my >= FACE.y0 && my <= FACE.y1) return { type: 'face' };
    for (const id of Object.keys(L.st)) { const r = stRect(id); if (wx >= r[0] && wx <= r[0] + r[2] && wy >= r[1] - BEAM && wy <= r[1] + r[3]) return { type: 'station', id }; }
    return null;
  }
  // Qué ratón hay bajo el dedo, por capas (feedback PM 2): lo que tapa la interfaz (carteles, placa, marcador) ya lo recoge
  // su botón antes de llegar aquí. En la escena gana el CUERPO de un ratón (está pintado delante de su máquina); después,
  // un margen de unos 8 px de pantalla para que un dedo los acierte, y entre varios gana el más cercano al dedo. El margen
  // nunca invade el frente de MINE (tocar la roca es picar, aunque haya picadores al lado) y del tendero solo se ve la
  // cabeza por encima del mostrador: solo ahí se le toca, sin margen.
  function mouseHit(sx, sy) {
    const [wx, wy] = worldAt(sx, sy), pad = Math.max(2, Math.round(8 / s)), my = toMine(wy);
    const onFace = wx >= FACE.x0 && wx <= edgeX(my) + 2 && my >= FACE.y0 && my <= FACE.y1;
    const onBld = wy < G + 6 && Object.values(L.buildings).some((r) => wx >= r[0] && wx <= r[0] + r[2] && wy >= r[1] && wy <= r[1] + r[3]);
    let best = null, bd = 1e9;
    for (const n of nodes) {
      if (!n.crew || n.px == null || !here(n)) continue;
      const keeper = n.role === 'keeper', top = n.py - 20, bot = keeper ? n.py - 9 : n.py + 1;
      const body = wx >= n.px + 3 && wx <= n.px + 19 && wy >= top && wy <= bot;
      const p = keeper || onFace || onBld ? 0 : pad;
      if (!body && (wx < n.px + 3 - p || wx > n.px + 19 + p || wy < top - p || wy > bot + p)) continue;
      const d = Math.hypot(wx - (n.px + 11), wy - (n.py - 9)) + (body ? 0 : 1000); if (d < bd) { bd = d; best = n; }
    }
    return best ? { m: best.m, body: bd < 1000 } : null;
  }
  const mouseAt = (sx, sy) => { const h = mouseHit(sx, sy); return h ? h.m : null; };
  // Qué está haciendo un ratón (para la lista de obreros).
  const ITEMNAME = { crate: 'a crate of RAW', bars: 'BASE bars', wheel: 'a fresh wheel', wheelL: 'a sealed wheel', curd: 'a curd mould', chunk: 'rubble', empty: 'an empty crate' };
  const WORK_POSES = ['windup', 'toss', 'lever', 'grease', 'valve', 'crank', 'stamp', 'dump', 'read'];
  function stateOf(n) {
    if (!n || !n.crew) return '';
    if (n.inter) return 'Chatting with a teammate';
    if (passOf(n)) return 'Passing it on';
    if (n.item) return 'Carrying ' + (ITEMNAME[n.item] || n.item);
    const t = n.q[0];
    if (t && t.k === 'until' && (t.pose === 'wait' || t.pose === 'hold')) return 'Waiting for the next piece';
    if (t && (t.k === 'crouch' || (t.k === 'act' && WORK_POSES.includes(t.pose)))) return 'Working';
    if (n.st === 'mine' && (n.role === 'picker' || n.role === 'climber')) return sim.vein ? 'Resting: the vein is open' : 'Digging';
    return running[n.st] && running[n.st]() ? 'On shift' : 'Idle: the machine is stopped';
  }
  function setStage(k) { for (const st of Object.keys(STGS)) STGS[st] = Math.max(1, Math.min(3, k)); vis.press = [null, null]; vis.curd = 0; vis.passes.length = 0; vis.tosses.length = 0; vis.wheelOut = 0; vis.cart.x = CART.home; vis.cart.load = 0; vis.cart.tilt = 0; populate(); }
  function setStageOf(st, k) { if (!(st in STGS) || STGS[st] === k) return; STGS[st] = Math.max(1, Math.min(3, k)); if (st === 'cheese') { vis.press = [null, null]; vis.curd = 0; vis.wheelOut = 0; } if (st === 'mine') { vis.cart.x = CART.home; vis.cart.load = 0; vis.cart.tilt = 0; } vis.passes.length = 0; vis.tosses.length = 0; populate(); }
  return {
    resize, draw, onEvent, hit, mouseAt, mouseHit, layout: () => L, get comp() { return 'B'; }, setComp() {},
    setMice(list) { mice = list; populate(); },
    // Puestos de la escena con su sitio en el mundo. El tendero va tras el mostrador y el del montacargas, con la jaula.
    posts: () => nodes.filter((n) => n.st !== 'lab').map((n) => ({ st: n.st, role: n.role, m: n.m, face: n.hf, x: n.role === 'keeper' ? LOT.shop[0] + 19 : n.role === 'liftman' ? CAGE.x + 1 : n.hx, feet: n.role === 'keeper' ? G - SHOP_H + 1 + 48 : n.role === 'liftman' ? Math.round(lift.y) - 4 : n.hs + (n.st === 'mine' ? MO : 0) })),
    restMouse(m, ms) { const n = nodes.find((q) => q.m && q.m.id === m.id); if (n) n.q = [T.idle(ms)]; },
    setTier(t) { tier = t; },
    setStage, setStageOf, get stage() { return STGS.mine; }, stageOf: (st) => STGS[st],
    rushTap,
    // Refuerzos: lo que se ve (con o sin activación) y si una estación está a la vista (sin forzar la cámara).
    boostTo(st, n, animate) { if (st === 'drill') boostTo(n, animate); else if (st === 'sell') shopBoostTo(n, animate); else if (ACT[st]) stTo(st, n, animate); },
    get shopBoostShown() { return SA.shown; }, get boostShown() { return BA.shown; }, get boostBusy() { return boostBusy(); },
    // A la vista: al menos la mitad de su alto queda entre lo que tapa arriba (marcador) y abajo (hoja o tira).
    stationInView(st, top = 0, bottomInset = 0) { const r = stRect(st); if (!r) return false; const y0 = (r[1] - cam.y) * s, y1 = (r[1] + r[3] - cam.y) * s, vis = Math.min(y1, Hc - bottomInset) - Math.max(y0, top); return vis >= (y1 - y0) * 0.5; },
    setSky(cfg, keep = true) { SKYCFG = { ...SKYCFG, ...cfg }; if (SKYCFG.mode === 'fast' && cfg.mode === 'fast') SKYCFG.t0 = performance.now(); skyMemo = { t: -1e9 }; if (keep && SKYCFG.mode !== 'fast') try { localStorage.setItem('p1-sky', JSON.stringify(SKYCFG)); } catch (e) {} },
    lifeTest(kind) { const now = performance.now(); if (kind === 'birds') LIFE.nextBirds = now; if (kind === 'star') LIFE.nextStar = now; if (kind === 'flicker') LIFE.flick = now; },
    skyInfo() { const S = skyState(performance.now()); return { mode: SKYCFG.mode, hour: S.h, rise: S.rise, set: S.set, phase: S.phase, tz: REG.tz, known: REG.known, lat: REG.lat }; },
    stationState: (st) => stateSt(st),
    buildingRect: (id) => L.buildings[id],
    stationRect: (st) => stRect(st),
    boostState: (st) => { const S = st === 'drill' ? BA : st === 'sell' ? SA : ACT[st]; return S ? { shown: S.shown, act: S.act ? { from: S.act.from, to: S.act.to } : null, queue: S.queue } : null; },
    get focusedStation() { return mode === 'station' ? focusSt : null; }, heat: (st) => heat(st),
    setSurface(k) { SURFK = Math.max(1, Math.min(4, k)); }, get surface() { return SURFK; }, setTown(b) { TOWN = !!b; }, get town() { return TOWN; },
    townLots: () => ({ ...LOT }), townSizes: () => { const S = surfStages(); return { house: townHouse(S.house).width, lab: townLab(S.lab).width, labH: townLab(S.lab).height, houseH: townHouse(S.house).height }; },
    setExtras(b) { XTRA = !!b; if (!XTRA) { for (const n of nodes) { n.push = false; n.glance = null; } } }, get extras() { return XTRA; },
    setInsetBottom(px) { insetB = Math.max(0, px || 0); cam.ty = clampY(cam.ty); },
    select(st) { selected = st; },
    // Enfoques: estación (centrada, las demás apagadas) y ratón (la cámara le sigue con un pequeño zoom); soltar los quita.
    focusStation, focusMouse, pickMouse, release, get mode() { return mode; }, get selectedMouse() { return selMouse; },
    get following() { return mode === 'mouse'; },
    // Quitar la elección del ratón (tocar fuera, tocar una estación) sin mover la cámara; si se le seguía, deja de seguirle.
    unpick() { if (mode === 'mouse') release(); else selMouse = null; },
    unfollow() { if (mode === 'mouse') { const k = selMouse; release(); selMouse = k; } },
    selectMouse(id) { if (id) focusMouse(id); else if (mode === 'mouse') release(); },
    // Arrastre con el dedo (1:1) y lanzamiento al soltar (inercia).
    dragStart(fy, fx) { const was = mode === 'mouse', keep = selMouse, wx = cam.x + (fx || 0) / s; release(); selMouse = keep; dragging = true; anchored = false; cam.vy = 0; if (was && fy != null) { exitFinger = fy; if (tw) tw.ms = 420; const s0 = d0 / dpr, rest = wx - fx / s0 - centerXz(d0); exitX = { wx, fx, lx: fx, ly: fy, travel: 0, q: 1, dist: Math.max(90, Math.min(360, Math.abs(rest) * s0 * 1.5)), lifted: false, auto: null }; } }, // arrastrar no quita la elección
    dragBy(dy, fy, fx) { if (exitFinger != null && fy != null) exitFinger = fy; if (exitX && fy != null) { exitX.travel += Math.hypot(fx - exitX.lx, fy - exitX.ly); exitX.lx = fx; exitX.ly = fy; } cam.ty = clampY(cam.ty - dy / s); cam.y = cam.ty; },
    dragEnd(vy) { dragging = false; if (exitX) exitX.lifted = true; cam.vy = Math.max(-2.5, Math.min(2.5, -vy / s)); },
    // Dónde está en pantalla el ratón enfocado (para su placa con nombre y lo que hace).
    focusTag() { const n = selMouse && nodes.find((q) => q.m && q.m.id === selMouse); return n && n.px != null && here(n) ? { x: (n.px + 11 - cam.x) * s, y: (n.py + 2 - cam.y) * s, n } : null; },
    // Lo lejos que está la cámara de su sitio de partida (el fondo de MINE), en pantallas; y volver allí.
    get awayFromHome() { return mode === 'mouse' ? 1 : anchored ? 0 : Math.abs(cam.ty - clampY(baseBottom() - vH())) * s / Math.max(1, Hc); },
    home() { if (mode !== 'free') release(); startTween(true); cam.vy = 0; anchored = true; cam.ty = clampY(baseBottom() - vH()); },
    // Respuesta a un toque en la escena: un aro dorado que se abre donde se ha tocado.
    toScreen(wx, wy) { return [(wx - cam.x) * s, (wy - cam.y) * s]; }, // pruebas: de mundo a pantalla
    tapAt(sx, sy) { const [wx, wy] = worldAt(sx, sy); taps.push({ x: Math.round(wx), y: Math.round(wy), t0: performance.now() }); if (taps.length > 4) taps.shift(); },
    setPH(b) { ph = b; },
    nodes: () => nodes, resting: () => nodes.resting || [], stateOf,
    overlaps,
    // clear: la cabeza más alta de los ratones de ese nivel (en pantalla). Un cartel que se queda fijo bajo el marcador no
    // baja de ahí: nunca tapa a un ratón (antes tapaba a los de la pasarela de REFINE en las fases II y III).
    plates: () => L.plates.map(([id, y, bot]) => {
      const o = id === 'mine' ? MO : 0; let head = 1e9;
      for (const n of nodes) if (n.crew && n.st === id && n.px != null && !n.inside && here(n)) head = Math.min(head, n.py - 21);
      return { id, x: (Math.max(cam.x + 4, E0 + 2) - cam.x) * s, y: (y + o - cam.y) * s, bottom: (bot + o - 20 - cam.y) * s, clear: head < 1e9 ? (head - cam.y) * s : 1e9 };
    }),
    panBy(dy) { release(); cam.ty = clampY(cam.ty + dy / s); cam.y = cam.ty; },
    show(st) { focusStation(st); },
    drawFar, farView: () => ({ ground: (G - cam.y) * s, zoom: (s * dpr) / d0, shift: cam.x + vW() / 2 - (E0 + E1) / 2 }), stopCam() { cam.vy = 0; tw = null; cam.ty = cam.y; },
    setGround(y) { if (mode !== 'free') release(); anchored = false; cam.vy = 0; cam.ty = cam.y = Math.min(Hw() - vH(), G - y / s); },
    mapView: () => ({ camX: cam.x, s, ground: (G - cam.y) * s, free: centerXz(d0) }), drawGround,
    baseFor: (w) => { const r = window.devicePixelRatio || 1; return Math.max(1, Math.floor((w * r) / (E1 - E0))) / r; }, freeFor(w) { return (E0 + E1) / 2 - w / (2 * this.baseFor(w)); },
    goLevel(k) { release(); anchored = false; cam.vy = 0; startTween(true); cam.ty = k === 'street' ? clampY(-1e9) : k === 'mid' ? clampY(G - vH() * 0.45) : k === 'deep' ? clampY(1e9) : clampY(baseBottom() - vH()); },
    camInfo: () => ({ y: Math.round(cam.y - G), z: +(s).toFixed(2), mode }),
    earthTones: () => EARTH, camBase: () => d0 / dpr,
    groundY: () => (G - cam.y) * s,
    showSurface() { release(); anchored = false; cam.vy = 0; cam.ty = clampY(-26); },
    atSurface: () => cam.ty <= clampY(-26) + 4,
    recenter() { if (mode === 'free') { cam.vy = 0; anchored = true; cam.ty = clampY(baseBottom() - vH()); } },
    locate(id) { focusMouse(id); return nodes.find((q) => q.m && q.m.id === id); },
    get scale() { return s; },
    bubbles: () => BUBS,
    skyNow: () => skyState(performance.now()),
    crewLook: (m, st) => crewOf(m, SKILL[st] || st),
    bubbleKit: () => ({ readMs, tail: TAILSVG('down') }),
    bubbleLines: () => [...Object.values(CHAT).flat(2), ...GENERIC.flat(), 'Vein! Look at that!', 'Bar going down!', 'Empty. Dig deeper!', 'New stone down here!', 'Full power!', 'Hear it hum!'],
    portrait(m, st) { return mouseCanvas(crewOf(m, SKILL[st] || st || 'mining'), 0, false, {}).toDataURL(); },
  };
};

})();
