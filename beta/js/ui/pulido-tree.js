// GENERADO por exploracion/pixel/main2-src/game/build_tree.py: no editar a mano. Iconos del árbol de mejoras aprobado
// (mockup Árbol, tree.html), copiados del mockup; aquí solo se entregan como imágenes para los paneles del juego.
(function () {
  if (!window.CM) return;
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
// ---------- Iconos de las mejoras (pixel, contorno automático; un tamaño por contexto) ----------
const P = { k: '#3a3d4a', s: '#b9c1d1', S: '#8a92a4', W: '#fffbe0', y: '#ffe55c', Y: '#e0a020', o: '#ff8a2e', O: '#c9561c', r: '#e2462f', R: '#8c2235', b: '#9a6a40', B: '#5a3a24', g: '#62d36e', G: '#2f8f44', u: '#5a9cf0', U: '#2b5cab', w: '#ffffff', v: '#b58cff', V: '#5a3aa8', p: '#ff9ab5' };
const ic = (rows, pal = P) => () => icon(rows, pal);
const IMG = (src) => { const i = new Image(); i.src = src.startsWith('out/') ? 'assets/main2/' + src : src; return i; };
const PICK_IMG = IMG('out/sprites/ic_pick.png');
IC.u_pick = () => { const c = document.createElement('canvas'); c.width = 14; c.height = 14; const d = () => c.getContext('2d').drawImage(PICK_IMG, 0, 0); if (PICK_IMG.complete) d(); else PICK_IMG.addEventListener('load', d); return c; };
IC.u_pickG = ic(['..yyy....', '.y...y...', 'y..B..y..', '...B.....', '...B.....', '...B.....', '...b.....']);
IC.u_swing = ic(['....y....', 'y..yWy..y', '.y.yWy.y.', '..yWWWy..', 'yyWWWWWyy', '..yWWWy..', '.y.yWy.y.', 'y..yWy..y', '....y....'], { y: '#ffcf2e', W: '#fffbe0' });
IC.u_charge = ic(['......y.', '.....y..', '..RRRk..', '.RrrrR..', '.RrrrR..', '.RrrrR..', '.RrrrR..', '..RRR...']);
IC.u_paws = ic(['.p.p.p..', 'pp.p.pp.', '........', '.ppppp..', 'pppppppp', 'pppppppp', '.pppppp.']);
IC.u_sense = ic(['...yy...', '..yWWy..', '.yWyyWy.', 'yWy..yWy', '.yWyyWy.', '..yWWy..', '...yy...']);
IC.u_deep = ic(['..u..', '.uWu.', 'uWWWu', 'UuuuU', '.UuU.', '..U..', 'UUUUU'], { u: '#5a9cf0', U: '#2b5cab', W: '#cfeefa' });
IC.u_bit = ic(['ssssss', '.sSSs.', '.sSSs.', '..ss..', '..sS..', '...s..']);
IC.u_motor = ic(['..k.k..', '.kkkkk.', 'kksSskk', '.ksWsk.', 'kksSskk', '.kkkkk.', '..k.k..']);
IC.u_shift = ic(['..yyy..', '.yy....', 'yy.....', 'yy.....', 'yy.....', '.yy....', '..yyy..'], { y: '#cfeefa' });
// Raw + un «+» limpio de 3 × 3, separado del queso por su contorno.
IC.u_rich = ic(['..yyy.....', '.yWyyy....', 'yyyyyyY...', 'yyyYyyY.g.', '.yyyyY.ggg', '..YYY...g.']);
IC.u_vat = ic(['k......k', 'kssssssk', 'ksyyyysk', 'ksyyyysk', 'kssssssk', '.kkkkkk.', '.k....k.']);
IC.u_furnace = ic(['...o...', '..ooo..', '.oyyyo.', 'oyWWyyo', 'oyyyyyo', '.OOOOO.']);
IC.u_twin = ic(['.o...o.', 'ooo.ooo', 'oyo.oyo', 'oyy.oyy', 'OOO.OOO']);
IC.u_press = ic(['kkkkkkk', '...k...', '...k...', '.kkkkk.', '.yyyyy.', 'yyyyyyy', 'kkkkkkk']);
IC.u_prices = ic(['....yyy', '...yWyY', '..yyyyY', '.yyyyY.', 'yyyyY..', 'yyyY...', '.YY....']);
IC.u_counter = ic(['yyyyyyyy', 'bbbbbbbb', 'b.b..b.b', 'bBbBBbBb', 'bBbBBbBb', 'BBBBBBBB']);
IC.u_quick = ic(['kkkkk', '.yyy.', '..y..', '.y.y.', 'yyyyy', 'kkkkk']);
IC.u_sign = ic(['..k..', 'rrrrr', 'rWWWr', 'rrrrr', '..k..', '..k..']);
IC.u_assist = ic(['..ss..', '..ss..', '.sggs.', 'sggggs', 'sgWggs', '.ssss.']);
IC.u_adv = ic(['...r...', '..rrr..', '.rWWWr.', 'rrWrWrr', '.rWWWr.', '..rrr..', '...r...']);
IC.u_strain = ic(['.sssss.', 's.g.v.s', 's.gvv.s', 's.vg..s', '.sssss.']);
IC.u_bunsen = ic(['..u..', '.uWu.', '.uuu.', '..k..', '..k..', '.kkk.']);
IC.u_samples = ic(['s.s.s', 's.s.s', 'y.g.v', 'y.g.v', 'sss.s']);
IC.u_lamp = ic(['..kkk..', '.kyyyk.', 'kyWWWyk', 'kyWWWyk', '.kyyyk.', '..kkk..', '...k...', '..kkk..']);
IC.u_mould = ic(['.kkkkkkk.', 'kWyyyyyYk', 'kyyyyyyYk', 'ksssssssk', 'kSSSSSSSk', '.kkkkkkk.']);
IC.u_curds = ic(['..ww.w...', '.wwwwww..', 'wwbwwbwww', 'BbbbbbbbB', '.BbbbbbB.', '..BBBBB..'], { w: '#ffffff', b: '#9ab8d8', B: '#5a7aa8' });
IC.u_cellar = ic(['.BBBBBBB.', 'Bbbbbbbbb', 'kkkkkkkkk', 'Bbbbbbbbb', 'Bbbbbbbbb', 'kkkkkkkkk', '.BBBBBBB.']);
IC.wheel = () => icon(['..yyyy..', '.yYWYYy.', 'yYYYYYYy', 'y!!!!!!O', '.!!?!!O.', '..OOOO..'], { y: '#ffcf2e', Y: '#ffe55c', W: '#fffbe0', '!': '#e0a020', '?': '#c98a08', O: '#8a5a0a' }, '#2a1d0a');
IC.lock = () => icon(['.ggg.', 'g...g', 'g...g', 'LLLLL', 'LLkLL', 'LLkLL', 'LLLLL'], { g: '#9aa3b8', L: '#d6c070', k: '#3a2a10' });
IC.spk = () => icon(['..g..', '.gWg.', 'gWWWg', '.gWg.', '..gW.'].map((r, i) => (i === 4 ? '..g..' : r)), { g: '#62d36e', W: '#e8ffe8' }, '#0f2a14');

// ---------- Iconos de los árboles (aprobados en Pulido+, 16-10-2026) ----------
// Cada árbol lleva el símbolo de su oficio en el título, en lugar del ratón genérico: pico, perforadora compacta, crisol,
// queso, puesto, matraz y estandarte. Todos caben en el mismo hueco (30 × 32 px a ×2) y se ven a escala entera.
const MET = { W: '#ffffff', L: '#dfe4ee', s: '#b9c1d1', S: '#8a92a4', D: '#5a6070' };
// SPRITE: crisol al fuego (Refining): el Raw se funde en Base dorada; asas, borde de hierro y llamas.
const CRUCIBLE = () => icon([
  '.............',
  '..W.W..W.....',
  'S.SSSSSSSSS.S',
  'SLyyyWyyyyySS',
  '.LyYyyyyYyyS.',
  '.LsssssssssS.',
  '.LssSssssSsS.',
  '..SSSSSSSSS..',
  '...D.....D...',
  '..o.oy.yo.o..',
  '.oyo.oYo.oyo.',
  '..OoOoOoOoO..'], { ...MET, y: '#ffcf2e', Y: '#f5ab12', o: '#ff8a2e', O: '#e2462f' });
function gridP(w, h) { const g = Array.from({ length: h }, () => Array(w).fill('.')); g.set = (x, y, c) => { if (y >= 0 && y < h && x >= 0 && x < w) g[y][x] = c; }; g.rows = () => g.map((r) => r.join('')); return g; }
const STEEL = { W: '#ffffff', L: '#e4e8f0', s: '#b9c1d1', S: '#8a92a4', D: '#5a6070', y: '#ffcf2e', Y: '#e0a020', c: '#ffcf2e', C: '#f5ab12' };
// SPRITE: C2 · perforadora compacta: la máquina de MAIN reducida a lo esencial (cuerpo, chimenea, orugas y el cono).
const DRILL_C2 = () => {
  const g = gridP(13, 11);
  g.set(1, 0, 'r'); g.set(1, 1, 'R'); g.set(1, 2, 'R');
  for (let x = 0; x <= 5; x++) for (let y = 3; y <= 6; y++) g.set(x, y, y === 3 ? 'P' : y === 6 ? 'Q' : x === 0 ? 'P' : x === 5 ? 'Q' : 'p');
  g.set(3, 4, 'k'); g.set(4, 4, 'W');
  for (let x = 6; x <= 12; x++) { const hh = Math.round(3 * (1 - (x - 6) / 6)); for (let y = 5 - hh; y <= 5 + hh; y++) { const k = (x + y + 60) % 3; g.set(x, y, y === 5 - hh ? 'W' : k === 0 ? 'D' : k === 1 ? 's' : 'L'); } }
  for (let x = 0; x <= 6; x++) { g.set(x, 7, 'D'); g.set(x, 8, x % 2 ? 's' : 'D'); g.set(x, 9, 'D'); }
  return icon(g.rows(), { ...STEEL, P: '#9c94e8', p: '#6a62c8', Q: '#443c90', r: '#ff8a5a', R: '#c9502a', k: '#24204a', D: '#3a3d4a' });
};
// SPRITE: COLONY afinada: estandarte de la colonia (cola de golondrina, rueda de queso bordada) con remate dorado, sobre la roca.
const FLAG2 = () => icon([
  '.y...........',
  'yYy..........',
  '.krrrrrrrrr..',
  '.krRyyyrrrr..',
  '.krryWyyrr...',
  '.krryyyYrr...',
  '.krrrYYrrrr..',
  '.krrrrrrrrrr.',
  '.k...........',
  '.k...........',
  '.kLs.........',
  'Lssyss.......',
  'ssyysSS......',
  'sssSSSSS.....'], { k: '#8e6234', y: '#ffcf2e', Y: '#e0a020', W: '#fffbe0', r: '#e2462f', R: '#ff7a5a', L: '#c8c8d4', s: '#9a9aa8', S: '#6a6a78' });
// SPRITE: TRADING simplificado: toldo de tres franjas anchas, borde festoneado y una sola rueda de queso en el mostrador.
const STALL2 = () => icon([
  'rrrWWWrrrWWWr',
  'rrrWWWrrrWWWr',
  'rr.WW.rr.WW.r',
  '.b.........b.',
  '.b.ccc.....b.',
  '.bcWccC..y.b.',
  '.bcccCC.yYyb.',
  'BBBBBBBBBBBBB',
  'bbbbbbbbbbbbb',
  'BBBBBBBBBBBBB'], { r: '#e2462f', W: '#fffbe0', b: '#b07a40', B: '#5c3a1b', c: '#ffcf2e', C: '#f5ab12', y: '#ffe55c', Y: '#c98a08' });
const TPNG = (n) => { const i = new Image(); i.src = 'assets/main2/out/sprites/' + n + '.png'; i.className = 'pix'; return i; };
const TREE_IC = { mining: () => TPNG('ic_pick'), drilling: DRILL_C2, refining: CRUCIBLE, cheesemaking: () => TPNG('ic_lot_cheddar'), trading: STALL2, lab: () => TPNG('ic_flask'), colony: FLAG2 };
  // Icono de cada mejora del juego (habilidad.nudo), el mismo que en el mockup.
  const NODE_IC = {
    'mining.pick': 'u_pick', 'mining.swing': 'u_swing', 'mining.charge': 'u_charge', 'mining.paws': 'u_paws', 'mining.sense': 'u_sense', 'mining.deep': 'u_deep',
    'drilling.bit': 'u_bit', 'drilling.motor': 'u_motor', 'drilling.shift': 'u_shift', 'drilling.rich': 'u_rich',
    'refining.vat': 'u_vat', 'refining.furnace': 'u_furnace', 'refining.burners': 'u_twin', 'refining.press': 'u_press',
    'cheesemaking.wheel': 'wheel', 'cheesemaking.master': 'star', 'cheesemaking.board': 'star', 'cheesemaking.moulds': 'u_mould', 'cheesemaking.curds': 'u_curds', 'cheesemaking.cellar': 'u_cellar',
    'trading.prices': 'u_prices', 'trading.counter': 'u_counter', 'trading.quick': 'u_quick', 'trading.sign': 'u_sign',
    'lab.assistant': 'u_assist', 'lab.advanced': 'u_adv', 'lab.strains': 'u_strain', 'lab.burners': 'u_bunsen', 'lab.samples': 'u_samples',
    'colony.lamp': 'u_lamp',
  };
  const URL = {};
  // data URL de un lienzo (o de una imagen ya cargada); si aún no ha cargado, vacío y se reintenta en el repintado.
  const urlOf = (key, make) => {
    if (URL[key]) return URL[key];
    const c = make(); if (!c) return '';
    if (c.tagName === 'IMG') { if (!c.complete || !c.naturalWidth) { c.addEventListener('load', () => (URL[key] = c.src)); return ''; } return (URL[key] = c.src); }
    if (key === 'u_pick' && !(PICK_IMG.complete && PICK_IMG.naturalWidth)) return '';
    return (URL[key] = c.toDataURL());
  };
  const sizeOf = {};
  CM.ptree = {
    // [url, ancho, alto] a la escala del mockup (×2 los grandes, ×3 los pequeños).
    node(skill, id) {
      const k = NODE_IC[skill + '.' + id] || 'u_mould'; const f = IC[k]; if (!f) return ['', 0, 0];
      const url = urlOf(k, f); if (!sizeOf[k]) { const c = f(); sizeOf[k] = [c.width, c.height]; }
      const [w, h] = sizeOf[k], s = w > 11 ? 2 : 3; return [url, w * s, h * s];
    },
    lock() { const url = urlOf('lock', IC.lock); return [url, 7 * 2, 9 * 2]; },
    tree(skill) {
      const f = TREE_IC[skill]; if (!f) return ['', 0, 0];
      const url = urlOf('tree.' + skill, f); const c = f();
      const w = c.tagName === 'IMG' ? c.naturalWidth : c.width, h = c.tagName === 'IMG' ? c.naturalHeight : c.height;
      return [url, w * 2, h * 2];
    },
  };
})();
