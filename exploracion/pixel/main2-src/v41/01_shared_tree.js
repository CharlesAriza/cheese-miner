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
  const fur = m.rar === 2 ? 'gold' : m.rar === 1 ? (h % 2 ? 'mint' : 'lilac') : COMMON[h % COMMON.length];
  [pal.g, pal.G, pal.D] = FURS[fur];
  const pack = PACKS[(h >>> 3) % PACKS.length];
  [pal.b, pal.B, pal.O] = pack;
  let hatRows;
  if (m.rar === 2) { hatRows = HATS.crown; Object.assign(pal, { Y: '#fff3a0', H: '#ffc21e', h: '#d9680c', r: '#e2462f' }); }
  else if (m.rank >= 2 && UNI[m.skill]) { const u = UNI[m.skill]; hatRows = HATS[u.hat]; Object.assign(pal, u); }
  else { const o = OWN_HATS[(h >>> 5) % OWN_HATS.length]; hatRows = HATS[o[0]]; Object.assign(pal, { Y: o[1], H: o[2], h: o[3] }); }
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
const phoneK = () => document.getElementById('phone').getBoundingClientRect().width / PRE.w;

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
