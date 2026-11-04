// GENERADO por exploracion/pixel/main2-src/game/build_lab.py: no editar a mano. CHEESE LAB aprobado: el banco vivo y los iconos
// vienen copiados del mockup (lab-strains.html); el investigador es la plantilla oficial de MAIN 2.0 con su aspecto real. Solo
// pinta: el banco lee el laboratorio de verdad (investigación, espera, receta elegida a mano, encargo siguiente).
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
const IMGC = {};
const img = (src) => (IMGC[src] ||= Object.assign(new Image(), { src: src.startsWith('out/') ? 'assets/main2/' + src : src }));
const lotSrc = (z) => `out/sprites/ic_lot_${z}.png`;
const baseSrc = (z) => `out/sprites/ic_base_${z}.png`;
const pimg = (src, w, h, cls = '') => { const i = new Image(); i.src = 'assets/main2/' + src; i.className = 'pix ' + cls; i.alt = ''; i.style.width = w + 'px'; i.style.height = h + 'px'; return i; };
const K = '#1b1220';
const P1 = (x2, x, y, w, h, c) => { x2.fillStyle = c; x2.fillRect(x, y, w, h); };
function lineP(x2, x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (;;) { P1(x2, x0, y0, 1, 1, c); if ((x0 === x1 && y0 === y1) || n++ > 200) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
const GLY = {};
const glyph = (k, rows, pal, ol) => (GLY[k] ||= icon(rows, pal, ol));
// Copia de un glifo guardado (cada sitio de la interfaz lleva su propio lienzo).
const copyC = (g, k = 2) => { const c = document.createElement('canvas'); c.width = g.width; c.height = g.height; c.getContext('2d').drawImage(g, 0, 0); return toImg(c, k); };
const CZ = {
  cheddar: { name: 'Cheddar', c: ['#fff09a', '#ffcf2e', '#f5ab12'] },
  gouda: { name: 'Gouda', c: ['#ffd08a', '#ff9f3a', '#e87a1c'] },
  brie: { name: 'Brie', c: ['#ffffff', '#fbf3d6', '#e3d3a0'] },
  emmental: { name: 'Emmental', c: ['#fff6b0', '#f7de6a', '#dcb93a'] },
  parmesan: { name: 'Parmesan', c: ['#f6e2b0', '#e3bf78', '#bf9550'] },
  blue: { name: 'Blue', c: ['#ffffff', '#e9e6cf', '#c2be9f'] },
};
// Duraciones legibles (corrección de UX aprobada): 8.5s · 45s · 15m 44s · 1h 31m. Solo formato; los tiempos no cambian.
const dur = (ms) => { if (ms < 10000) return Math.round(ms / 100) / 10 + 's'; const s = Math.round(ms / 1000); if (s < 60) return s + 's'; if (s < 3600) return Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's'; return Math.floor(s / 3600) + 'h ' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + 'm'; };

// ---------- Componentes (balance.js) ----------
const BASES = { cheddar: { name: 'Cheddar', value: 10 }, gouda: { name: 'Gouda', value: 24 }, brie: { name: 'Brie', value: 60 }, emmental: { name: 'Emmental', value: 150 }, parmesan: { name: 'Parmesan', value: 380 }, blue: { name: 'Blue', value: 950 } };
const ING = { herbs: { name: 'Herbs', adj: 'Herb', mult: 1, coin: 0, lv: 1 }, pepper: { name: 'Pepper', adj: 'Pepper', mult: 1.3, coin: 2, lv: 4 }, honey: { name: 'Honey', adj: 'Honey', mult: 1.7, coin: 10, lv: 12 }, truffle: { name: 'Truffle', adj: 'Truffle', mult: 2.6, coin: 60, lv: 25 } };
const TRE = { washed: { name: 'Washed', adj: 'Washed', mult: 1, t: 0, lv: 1 }, smoked: { name: 'Smoked', adj: 'Smoked', mult: 1.35, t: 500, lv: 3 }, brined: { name: 'Brined', adj: 'Brined', mult: 1.8, t: 1000, lv: 16 } };
const MAT = { fresh: { name: 'Fresh', adj: '', mult: 1, t: 0, lv: 1 }, aged: { name: 'Aged', adj: 'Aged', mult: 1.6, t: 1000, lv: 8 }, vintage: { name: 'Vintage', adj: 'Vintage', mult: 2.8, t: 2000, lv: 30 } };
const TABLE = { base: BASES, ingredient: ING, treatment: TRE, maturation: MAT };
const PARTS = ['base', 'ingredient', 'treatment', 'maturation'];
const SYN = [
  { when: { base: 'cheddar', treatment: 'smoked' }, mult: 1.2 }, { when: { base: 'gouda', ingredient: 'honey' }, mult: 1.25 }, { when: { base: 'brie', ingredient: 'truffle' }, mult: 1.25 },
  { when: { base: 'emmental', maturation: 'aged' }, mult: 1.25 }, { when: { base: 'parmesan', maturation: 'vintage' }, mult: 1.3 }, { when: { base: 'blue', treatment: 'brined' }, mult: 1.3 },
  { when: { ingredient: 'pepper', treatment: 'smoked' }, mult: 1.15 }, { when: { ingredient: 'truffle', maturation: 'vintage' }, mult: 1.4 },
];
const nameOf = (c) => [MAT[c.maturation].adj, TRE[c.treatment].adj, ING[c.ingredient].adj, BASES[c.base].name].filter(Boolean).join(' ');
const synOf = (c) => SYN.filter((s) => Object.entries(s.when).every(([k, v]) => c[k] === v));
const valueOf = (c) => BASES[c.base].value * ING[c.ingredient].mult * TRE[c.treatment].mult * MAT[c.maturation].mult * synOf(c).reduce((a, s) => a * s.mult, 1);
const cookMs = (c) => 6000 + TRE[c.treatment].t + MAT[c.maturation].t;
const tierOf = (c) => { const r = valueOf(c) / BASES[c.base].value; return r < 1.5 ? 'Common' : r < 3 ? 'Fine' : r < 5 ? 'Rare' : r < 9 ? 'Epic' : 'Legendary'; };
const DIR_NAME = (dir) => { const [k, id] = String(dir || '').split(':'); return k === 'value' ? 'the most valuable recipe' : k === 'fast' ? 'the quickest recipe to cook' : k === 'strain' ? 'strains' : k === 'base' ? BASES[id].name + ' recipes' : k === 'ingredient' ? 'recipes with ' + ING[id].name : k === 'treatment' ? TRE[id].name + ' recipes' : k === 'maturation' ? MAT[id].name + ' recipes' : ''; };
const DIR_LABEL = (dir) => { const [k, id] = String(dir || '').split(':'); return k === 'value' ? 'Highest value' : k === 'fast' ? 'Quickest to cook' : k === 'strain' ? 'Strains' : k === 'base' ? BASES[id].name + ' recipes' : k === 'ingredient' ? 'With ' + ING[id].name : k === 'treatment' ? TRE[id].name : k === 'maturation' ? MAT[id].name : 'No direction'; };
const DIR_CATS = [['goal', 'GOAL'], ['base', 'CHEESE'], ['ingredient', 'INGREDIENT'], ['treatment', 'TREATMENT'], ['maturation', 'AGING']];

// SPRITE: iconos de los componentes, los aprobados de RECIPE BOOK (7 × 7, contorno automático).
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
// Color de cada componente en su tubo de ensayo (el mismo que su icono).
const TUBE = { herbs: '#62d36e', pepper: '#e2462f', honey: '#ffcf2e', truffle: '#7a5a3a', washed: '#5a9cf0', smoked: '#b9c1d1', brined: '#eef4fa', fresh: '#cfeefa', aged: '#e0a020', vintage: '#9a5fd0' };
for (const z in CZ) TUBE[z] = CZ[z].c[1];
// Líquido del matraz: el color del ingrediente; las burbujas, el del tratamiento.
const LIQ = { herbs: ['#a8f0b0', '#62d36e', '#2f8f44'], pepper: ['#ff8a6a', '#e2462f', '#9c2a1c'], honey: ['#fff3a0', '#ffcf2e', '#c98a08'], truffle: ['#a87a5a', '#6a4a3a', '#3a2a20'] };
const MURK = ['#8a9a7a', '#5a6a4a', '#3a4430'];
const BUB = { washed: '#cfeefa', smoked: '#e8e4f0', brined: '#ffffff' };

// SPRITE: los tres modos de investigar (9 × 9): engranaje (automática), brújula (dirigida) y mano (a mano).
const MODE_IC = {
  auto: () => glyph('m-auto', ['...ggg...', '.g.gGg.g.', '..gGGGg..', 'ggG...Ggg', 'gGG...GGg', 'ggG...Ggg', '..gGGGg..', '.g.gGg.g.', '...ggg...'], { g: '#5fcf6a', G: '#2f8a3a' }),
  dir: () => glyph('m-dir', ['...ccc...', '.cc...cc.', '.c....rc.', 'c....rr.c', 'c...w...c', 'c.bb....c', '.cb....c.', '.cc...cc.', '...ccc...'], { c: '#9ab8d8', r: '#e2462f', w: '#ffffff', b: '#5a9cf0' }),
  hand: () => glyph('m-hand2', ['...wW....', '...wW....', '...wW....', '...wWwWw.', '.wwwWwWwW', '.wWwwwwwW', '..wwwwwwW', '..wwwwwW.', '...wwwwW.', '...cccc..', '...CCCC..'], { w: '#ffffff', W: '#b9c1d1', c: '#ff8a2e', C: '#c9581f' }),
};
const MODE_TXT = { auto: 'AUTO', dir: 'DIRECTED', hand: 'BY HAND' };
// SPRITE: el libro de recetas (cuero rojo como el del ratón que estudia, etiqueta dorada, páginas).
const bookIc = () => glyph('book', ['.bbbbbbb.', 'bRRRRRRRb', 'bRYYYYYRb', 'bRRRRRRRb', 'bRRRRRRRb', 'bRRRRRRRb', 'bWWWWWWWb', '.bbbbbbb.'], { b: '#7a2a1c', R: '#c0502e', Y: '#ffcf2e', W: '#fff6dc' });
// SPRITE: moneda del banco, la aprobada de Pulido+ en pequeño (9 × 9, de frente): canto claro arriba a la izquierda y oscuro
// abajo a la derecha, anillo grabado y un relieve con brillo en el centro. Paleta de ic_coin.png.
const COINP = { b: '#fff09a', c: '#ffd84a', d: '#f2b01e', e: '#fffbe6', g: '#d4860c', h: '#94520a' };
const miniCoin = () => glyph('coin9', ['...bbc...', '..bcccd..', '.bcdddcg.', 'bcdccedcg', 'bcdcebdgh', 'ccdcbgdgh', '.gcdddgh.', '..gghhh..', '...hhh...'], COINP);

// ---------- Arte: el banco del laboratorio (110 × 36) ----------
// SPRITE: pared de azulejos, estante con los libros de recetas (uno más cada 16 recetas), mesa, mechero con piloto, matraz,
// gradilla con los cuatro tubos de la receta (base, ingrediente, tratamiento, maduración), tarro de Cheese Base, plato de
// monedas, nota del encargo siguiente y el investigador (o su taburete vacío). Todo por código y sustituible.
const FX = 35, MX = 4, MY = 13, FLOOR = 32, TUBES = [45, 49, 53, 57];
const LAMP = { busy: '#62d36e', wait: '#ffb02e', bad: '#e2462f', idle: '#3a3d4a', gold: '#3a3d4a' };
// Los tubos enseñan la receta en marcha (o la que se espera); con el laboratorio libre, lo que se está eligiendo a mano.
const rackCombo = () => (W.job ? W.job.c : W.wait ? W.wait.c : W.combo);
const popIn = (now, delay) => { if (!V.built) return 0; const k = (now - V.built - delay) / 160; return k < 0 ? -1 : k >= 1 ? 0 : -Math.round(4 * (1 - k)); };
function drawBench(x2, now) {
  const dt = Math.min(120, now - (V.last || now)); V.last = now; V.t += dt;
  const j = W.job, w = W.wait, working = j && !j.finished && !j.strain;
  const starting = V.start && now - V.start < 700;
  const tLiq = working && !starting ? 1 : 0, tFire = working && !starting ? 1 : 0;
  V.liq += (tLiq - V.liq) * (tLiq > V.liq ? 0.18 : 0.08); V.fire += (tFire - V.fire) * 0.3; V.murk = Math.max(0, V.murk - dt / 2600);
  if (j && j.finished) V.liq = Math.max(0, V.liq - dt / 500);
  const tone = E.head ? E.head.dataset.tone : 'idle';
  // Pared y suelo.
  P1(x2, 0, 0, 110, FLOOR, '#1d2a33');
  for (let y = 4, r = 0; y < FLOOR; y += 5, r++) { P1(x2, 0, y, 110, 1, '#25353f'); for (let x = (r % 2) * 4; x < 110; x += 8) P1(x2, x, y - 4, 1, 4, '#25353f'); }
  P1(x2, 0, FLOOR, 110, 4, '#2a1f1a'); P1(x2, 0, FLOOR, 110, 1, '#4a3a2a');
  for (let x = 5; x < 110; x += 9) P1(x2, x, FLOOR + 1, 1, 3, '#1e1612');
  // Estante con los libros de recetas.
  const o0 = popIn(now, 0); if (o0 > -1 || !V.built) {
    P1(x2, 76, 10 + o0, 33, 1, '#c9884a'); P1(x2, 76, 11 + o0, 33, 1, '#8e5a2a'); P1(x2, 78, 12 + o0, 1, 2, '#5a3a24'); P1(x2, 106, 12 + o0, 1, 2, '#5a3a24');
    const n = Math.min(14, Math.ceil(W.recipes / 16));
    if (n > V.books) { V.books = n; V.bookT = now; }
    const COL = ['#c0502e', '#5a9cf0', '#62d36e', '#b58cff', '#ffcf2e', '#e2462f', '#9ab8d8'], HG = [6, 5, 7, 6, 5, 6, 7, 5, 6, 6, 7, 5, 6, 7];
    for (let i = 0; i < n; i++) {
      const fall = i === n - 1 && now - V.bookT < 300 ? -Math.round(6 * (1 - (now - V.bookT) / 300)) : 0;
      const h = HG[i], x = 78 + i * 2, y = 10 - h + o0 + fall;
      P1(x2, x, y, 2, h, COL[i % COL.length]); P1(x2, x, y, 2, 1, '#ffffff55'); P1(x2, x + 1, y + 1, 1, h - 1, '#00000033');
    }
  }
  // Nota del encargo siguiente (a mano), clavada en la pared encima de la gradilla.
  const noteOn = W.next || (V.noteFall && now - V.noteFall < 500) || (V.unpin && now - V.unpin < 400);
  if (noteOn) {
    let ny = 3, a = 1;
    if (!W.next && V.noteFall) { const k = (now - V.noteFall) / 500; ny += Math.round(k * k * 22); a = 1 - k; }
    if (V.unpin && !W.next) { const k = (now - V.unpin) / 400; ny += Math.round(k * 6); a = 1 - k; }
    const pop = V.pin && now - V.pin < 200 ? -1 : 0;
    x2.globalAlpha = Math.max(0, a);
    P1(x2, 46, ny + pop, 8, 7, '#f3e3b6'); P1(x2, 46, ny + 6 + pop, 8, 1, '#d9c38a'); P1(x2, 47, ny + 3 + pop, 6, 1, '#8e6234'); P1(x2, 47, ny + 5 + pop, 4, 1, '#8e6234'); P1(x2, 49, ny + pop, 2, 2, '#e2462f');
    x2.globalAlpha = 1;
  }
  // Mesa.
  const ob = popIn(now, 60); if (ob > -1 || !V.built) {
    P1(x2, 27, 27 + ob, 83, 1, '#e0a060'); P1(x2, 27, 28 + ob, 83, 1, '#8e5a2a'); P1(x2, 28, 29 + ob, 82, 3, '#5a3a24'); P1(x2, 27, 27 + ob, 1, 5, K);
    for (let x = 41; x < 110; x += 17) { P1(x2, x, 29 + ob, 1, 3, '#3a2414'); P1(x2, x - 3, 30 + ob, 1, 1, '#c9884a'); }
  }
  // Mechero, trípode y matraz.
  const of = popIn(now, 180); if (of > -1 || !V.built) drawFlask(x2, now, of, tone);
  // Gradilla con los cuatro tubos.
  const orr = popIn(now, 300); if (orr > -1 || !V.built) drawRack(x2, now, orr);
  // Tarro de Cheese Base.
  const oj = popIn(now, 420); if (oj > -1 || !V.built) drawJar(x2, now, oj);
  // Plato de monedas (el ingrediente que se paga): una moneda de pie, si las hay. Si faltan, lo mismo que el tarro de Base: el
  // plato marca la falta con su borde en ámbar (fijo) y la moneda del juego late en su sitio (entera y al 40 %).
  const od = popIn(now, 540); if (od > -1 || !V.built) {
    const poor = w && !(w.have < w.need) && w.coin > W.coins;
    P1(x2, 79, 25 + od, 9, 1, '#cfd6e6'); P1(x2, 78, 26 + od, 11, 1, poor ? '#e0a020' : '#6a7088');
    const need = (j || w) && ING[(j || w).c.ingredient].coin > 0;
    if (poor) { x2.globalAlpha = Math.floor(now / 350) % 2 === 0 ? 1 : 0.4; x2.drawImage(miniCoin(), 78, 14 + od); x2.globalAlpha = 1; }
    else if (need) x2.drawImage(miniCoin(), 78, 14 + od);
  }
  drawParticles(x2, now);
  drawMouse(x2, now);
}
function drawFlask(x2, now, oy, tone) {
  const j = W.job, sh = V.fail && now - V.fail < 450 ? (Math.floor((now - V.fail) / 45) % 2 ? 1 : -1) : 0, fx = FX + sh;
  // Trípode y mechero.
  lineP(x2, 30, 21 + oy, 29, 26 + oy, '#6a7088'); lineP(x2, 40, 21 + oy, 41, 26 + oy, '#6a7088');
  P1(x2, 34, 23 + oy, 3, 2, '#9aa3b8'); P1(x2, 34, 23 + oy, 1, 2, '#cfd6e6');
  P1(x2, 32, 25 + oy, 7, 2, '#4a5068'); P1(x2, 32, 25 + oy, 7, 1, '#6a7088');
  P1(x2, 37, 25 + oy, 1, 1, Math.floor(now / 500) % 2 || tone !== 'busy' ? LAMP[tone] || LAMP.idle : '#2f8a3a');
  // Llama: azul por dentro, naranja fuera. Chisporrotea al fallar.
  const sput = V.fail && now - V.fail < 520 && Math.floor((now - V.fail) / 70) % 2 === 0;
  if (V.fire > 0.1 && !sput) {
    const f = Math.floor(V.t / 90), big = V.done && now - V.done < 400;
    P1(x2, 34, 22 + oy, 3, 1, '#5a9cf0'); P1(x2, 33, 22 + oy, 1, 1, '#ff8a2e'); P1(x2, 37, 22 + oy, 1, 1, '#ff8a2e');
    if (V.fire > 0.5) { P1(x2, 34 + (f % 3), 21 + oy, 1, 1, f % 2 ? '#ffcf2e' : '#ff8a2e'); P1(x2, 35, 21 + oy, 1, 1, '#ffcf2e'); }
    if (big) P1(x2, 33, 21 + oy, 5, 1, '#ffcf2e');
  }
  // Matraz: contorno de tinta por fuera, canto de cristal claro por dentro, líquido por filas (claro arriba, oscuro abajo)
  // y un brillo a la izquierda.
  const pal = V.murk > 0.35 ? MURK : j ? LIQ[j.c.ingredient] || LIQ.herbs : LIQ.herbs;
  const flash = V.done && now - V.done < 140;
  const rows = Math.round(V.liq * 5), surf = 20 - rows;
  const glow = j && !j.finished && V.disp > 0.9 && Math.floor(now / 200) % 2 === 0;
  const GE = '#8fb0c4', GI = '#34495a';
  for (let y = 12; y <= 19; y++) {
    const hw = 2 + Math.floor(((y - 12) * 4) / 7);
    P1(x2, fx - hw - 1, y + oy, 1, 1, K); P1(x2, fx + hw + 1, y + oy, 1, 1, K);
    P1(x2, fx - hw, y + oy, 1, 1, GE); P1(x2, fx + hw, y + oy, 1, 1, GE);
    const liq = y >= surf;
    P1(x2, fx - hw + 1, y + oy, hw * 2 - 1, 1, flash ? '#ffffff' : liq ? (y === surf ? (glow ? '#ffffff' : pal[0]) : y === 19 ? pal[2] : pal[1]) : GI);
    if (!liq && y > 12 && y < 18) P1(x2, fx - hw + 1, y + oy, 1, 1, '#7fa6bb');
  }
  if (rows < 4) P1(x2, fx + 3, 16 + oy, 1, 2, '#cfe0ec');
  P1(x2, fx - 7, 20 + oy, 15, 1, K); P1(x2, fx - 6, 20 + oy, 13, 1, GE);
  for (let y = 9; y <= 11; y++) { P1(x2, fx - 3, y + oy, 1, 1, K); P1(x2, fx + 3, y + oy, 1, 1, K); P1(x2, fx - 2, y + oy, 1, 1, GE); P1(x2, fx + 2, y + oy, 1, 1, GE); P1(x2, fx - 1, y + oy, 3, 1, GI); }
  P1(x2, fx - 1, 9 + oy, 1, 1, '#7fa6bb');
  P1(x2, fx - 4, 7 + oy, 3, 1, K); P1(x2, fx + 2, 7 + oy, 3, 1, K); P1(x2, fx - 4, 8 + oy, 1, 1, K); P1(x2, fx + 4, 8 + oy, 1, 1, K);
  P1(x2, fx - 3, 8 + oy, 2, 1, '#cfe0ec'); P1(x2, fx + 2, 8 + oy, 2, 1, '#cfe0ec'); P1(x2, fx - 1, 8 + oy, 3, 1, GI);
  // Burbujas: suben dentro del líquido, del color del tratamiento; más deprisa cuanto más cerca del final.
  if (j && !j.finished && !j.strain && rows > 1) {
    const every = 320 - 200 * Math.min(1, V.disp);
    if (now - V.lastBub > every) { V.lastBub = now; V.bub.push({ x: fx - 3 + Math.floor(Math.random() * 7), y: 19, t0: now }); }
    if (now - V.lastVap > every * 1.6) { V.lastVap = now; V.p.push({ x: fx - 1 + Math.floor(Math.random() * 3), y: 7, vx: (Math.random() - 0.5) * 0.008, vy: -0.011, g: 0, c: '#d6dce6', t0: now, life: 900 + Math.random() * 400, s: 1, vap: true }); }
  }
  const bc = j ? BUB[j.c.treatment] || '#ffffff' : '#ffffff';
  V.bub = V.bub.filter((b) => { const y = b.y - Math.floor((now - b.t0) / 110); if (y < surf) return false; P1(x2, b.x + sh, y + oy, 1, 1, bc); return true; });
}
function drawRack(x2, now, oy) {
  const c = rackCombo();
  PARTS.forEach((part, i) => {
    const id = c[part];
    if (V.tube[i] !== id) { V.tubeT[i] = V.tube[i] === undefined ? 0 : now; V.tube[i] = id; }
    const tx = TUBES[i], k = V.tubeT[i] ? Math.min(1, (now - V.tubeT[i]) / 220) : 1, fill = Math.max(1, Math.round(5 * k));
    P1(x2, tx, 16 + oy, 4, 1, '#cfd6e6');
    P1(x2, tx, 17 + oy, 1, 9, K); P1(x2, tx + 3, 17 + oy, 1, 9, K); P1(x2, tx + 1, 26 + oy, 2, 1, K);
    P1(x2, tx + 1, 17 + oy, 2, 9, '#34495a'); P1(x2, tx + 1, 17 + oy, 1, 4, '#7fa6bb');
    P1(x2, tx + 1, 26 - fill + oy, 2, fill, TUBE[id]); P1(x2, tx + 1, 26 - fill + oy, 1, fill, '#ffffff33');
    if (k < 1) P1(x2, tx + 1, 25 - fill + oy, 2, 1, '#ffffff');
  });
  P1(x2, 44, 20 + oy, 18, 1, '#c9884a'); P1(x2, 44, 21 + oy, 18, 1, '#8e5a2a'); P1(x2, 44, 22 + oy, 1, 5, '#5a3a24'); P1(x2, 61, 22 + oy, 1, 5, '#5a3a24');
}
function drawJar(x2, now, oy) {
  const j = W.job, w = W.wait, base = rackCombo().base, cz = CZ[base].c;
  // Nivel: lo que hay frente a lo que pide (esperando: la marca del nivel necesario queda arriba) o el tarro con su reserva.
  const short = w && w.have < w.need;
  const lvl = w ? Math.min(1, w.have / w.need) : j ? 0.7 : 0.8;
  V.jar = V.jar === undefined ? lvl : V.jar + (lvl - V.jar) * 0.2;
  const top = short ? 1 : 0, rows = Math.round(V.jar * (10 - top));
  P1(x2, 65, 14 + oy, 9, 1, '#c9884a'); P1(x2, 65, 15 + oy, 9, 1, '#8e5a2a');
  P1(x2, 64, 16 + oy, 1, 10, K); P1(x2, 74, 16 + oy, 1, 10, K); P1(x2, 64, 26 + oy, 11, 1, K);
  for (let r = 0; r < 10; r++) {
    const y = 16 + r + oy, full = r >= 10 - rows;
    // Esperando Base, lo que falta hasta la marca va rayado (vacío que hay que llenar).
    for (let x = 65; x <= 73; x++) P1(x2, x, y, 1, 1, full ? (r === 10 - rows ? cz[0] : (x + r) % 3 === 0 ? cz[2] : cz[1]) : x === 65 ? '#7fa6bb' : short && r > 0 && (x + r) % 3 === 0 ? '#4a6274' : '#34495a');
  }
  // Esperando Base: una línea ámbar continua marca hasta dónde tiene que llegar y, justo encima de la tapa, late el icono de
  // Cheese Base del juego (ic_base): dice qué recurso es; el tarro rayado, que no llega. Todo dentro del tarro o sobre su tapa.
  if (short) {
    P1(x2, 65, 16 + oy, 9, 1, '#e0a020');
    const g = img(baseSrc(base)); if (g.complete && g.naturalWidth) { x2.globalAlpha = Math.floor(now / 350) % 2 === 0 ? 1 : 0.4; x2.drawImage(g, 62, 1 + oy); x2.globalAlpha = 1; }
  }
}
function drawParticles(x2, now) {
  if (V.p.length > 48) V.p.splice(0, V.p.length - 48);
  V.p = V.p.filter((q) => now - q.t0 < q.life);
  for (const q of V.p) {
    const t = now - q.t0; if (t < 0) continue;
    const a = t / q.life;
    x2.globalAlpha = q.vap ? (a < 0.6 ? 0.85 : 0.4) : a < 0.7 ? 1 : 0.5;
    const x = Math.round(q.x + q.vx * t + (q.vap ? Math.sin(t / 220 + q.x) : 0)), y = Math.round(q.y + q.vy * t + q.g * t * t);
    P1(x2, x, y, q.s, q.s, q.c);
  }
  x2.globalAlpha = 1;
  // Base que entra al empezar: tres cubos del tarro al matraz.
  if (V.start) {
    const cz = CZ[rackCombo().base].c;
    for (let i = 0; i < 3; i++) {
      const t = (now - V.start - i * 140) / 420; if (t < 0 || t > 1) continue;
      const x = Math.round(69 + (35 - 69) * t), y = Math.round(13 + (7 - 13) * t - 9 * Math.sin(Math.PI * t));
      P1(x2, x, y, 2, 2, cz[1]); P1(x2, x, y, 1, 1, cz[0]);
    }
  }
  // Esperando Base: cubos que caen al tarro mientras llega (solo si sube).
  if (W.wait && V.jarIn && now - V.jarIn < 500) { const t = (now - V.jarIn) / 500, cz = CZ[W.wait.c.base].c; P1(x2, 68, Math.round(6 + t * 9), 2, 2, cz[1]); }
  // Gotas de la pipeta.
  if (V.drops) V.drops = V.drops.filter((d) => { const t = now - d.t0, y = Math.round(8 + t * t * 0.0004 + t * 0.01); if (y > 20 - Math.round(V.liq * 5)) return false; P1(x2, 34, y, 1, 1, d.c); return true; });
  // Destello del hallazgo, sobre la boca del matraz.
  if (V.done && now - V.done < 320) { const s = now - V.done < 160 ? 2 : 1; for (const [dx, dy] of [[0, -s - 1], [0, s + 1], [-s - 1, 0], [s + 1, 0]]) P1(x2, 35 + dx, 4 + dy, 1, 1, '#fff3a0'); P1(x2, 35, 4, 1, 1, '#ffffff'); }
}
function cachedMouse(m, dy, blink, o) { const k = dy + (blink ? 'b' : '') + JSON.stringify(o); return (V.cache[k] ||= mouseCanvas(m, dy, blink, o)); }
// El investigador: solo si hay uno contratado. Investigando alterna gestos (añadir reactivo con la pipeta, mirar con la
// lupa, apuntar en su libro); reacciona a lo que pasa en el matraz. Esperando, golpea el suelo con el pie; sin trabajo, lee.
function drawMouse(x2, now) {
  const m = W.worker;
  if (!m) { P1(x2, 8, 25, 11, 1, '#c9884a'); P1(x2, 8, 26, 11, 1, '#8e5a2a'); P1(x2, 9, 27, 1, 5, '#5a3a24'); P1(x2, 17, 27, 1, 5, '#5a3a24'); P1(x2, 9, 29, 9, 1, '#5a3a24'); return; }
  const j = W.job, w = W.wait, working = j && !j.finished && !j.strain;
  if (working && !(V.start && now - V.start < 800)) {
    if (!V.act || now > V.act.end) {
      const opts = ['pipette', 'peer', 'note'].filter((k) => !V.act || k !== V.act.k);
      const k = V.disp > 0.88 ? 'peer' : opts[Math.floor(Math.random() * opts.length)];
      V.act = { k, t0: now, end: now + 1700 + Math.random() * 900 };
    }
  } else V.act = null;
  const a = V.act ? V.act.k : '';
  let o = {}, face = null, legs = 'stand', dx = 0, hop = 0, dy = Math.floor((V.t + 300) / 700) % 2;
  if (a === 'pipette') o.hold = true;
  if (a === 'peer') { o.glass = true; dx = 1; if (V.disp > 0.88 || Math.floor((now - V.act.t0) / 600) % 3 === 2) face = 'wow'; }
  if (a === 'note') o.book = Math.floor((now - V.act.t0) / 450) % 3 === 2 ? 2 : 1;
  if (j && j.strain) { o.hold = true; if (Math.floor(now / 1400) % 3 === 0) face = 'wow'; }
  if (!j && w) { legs = Math.floor(now / 300) % 2 ? 'tap' : 'stand'; face = w.have < w.need || w.coin > W.coins ? 'down' : 'happy'; }
  if (!j && !w) { o.book = Math.floor(V.t / 2400) % 4 === 3 ? 2 : 1; if (W.recipes >= 216 && Math.floor(V.t / 3000) % 3 === 0) face = 'happy'; if (!W.dir && W.advanced && W.recipes < 216) face = 'down'; }
  // Reacciones (por encima del gesto): hallazgo, resultado no concluyente, asentir al cambiar de dirección, empezar.
  if (V.done && now - V.done < 1100) { const e = now - V.done; o = { tail: true, hold: true }; face = 'happy'; hop = e < 240 ? -2 : V.big && e > 320 && e < 560 ? -3 : 0; }
  if (V.fail && now - V.fail < 1500) { o = { ear: true, hold: true }; face = 'grump'; }
  if (V.nod && now - V.nod < 520) { face = 'happy'; dy = Math.floor((now - V.nod) / 130) % 2; }
  if (V.start && now - V.start < 800 && !(V.done && now - V.done < 1100)) { o = { tail: true, hold: true }; face = 'happy'; }
  if (face) o.face = face;
  o.legs = legs;
  const blink = !face && (now + 900) % 3700 < 130;
  x2.drawImage(cachedMouse(m, dy, blink, o), MX + dx - 1, MY - 1 + hop);
  // Legendaria: unas chispas doradas alrededor del ratón mientras celebra (pocas y quietas, que parpadean).
  if (V.big && V.done && now - V.done < 1100) for (const [x, y, k] of [[MX + 1, MY + 1, 0], [MX + 19, MY - 1, 1], [MX + 21, MY + 7, 2], [MX - 1, MY + 9, 1]]) if ((Math.floor((now - V.done) / 120) + k) % 3) P1(x2, x, y + hop, 1, 1, k === 1 ? '#ffffff' : '#ffcf2e');
  // Pipeta: de la pata a la boca del matraz; suelta una gota cada medio segundo, del color del tratamiento.
  if (a === 'pipette' && !(V.done && now - V.done < 1100) && !(V.fail && now - V.fail < 1500)) {
    const px = MX + 14, py = MY + 11 + dy;
    lineP(x2, px + 1, py - 1, 34, 6, '#cfeefa'); P1(x2, px, py - 1, 2, 2, '#e2462f');
    if (now - V.lastDrop > 520 && now - V.act.t0 > 300) { V.lastDrop = now; (V.drops ||= []).push({ t0: now, c: BUB[j.c.treatment] || '#ffffff' }); }
  }
  // Placa de cultivo en las patas (cultivando una cepa): las colonias crecen con la investigación. (STRAINS dibuja la suya.)
  if (j && j.strain && !window.LB_OWN_PETRI) {
    const px = MX + 13, py = MY + 9 + dy;
    P1(x2, px, py + 2, 8, 1, '#cfeefa'); P1(x2, px + 1, py + 1, 6, 1, '#f3e3b6'); P1(x2, px + 1, py, 6, 1, '#ffffff55');
    const n = 1 + Math.floor(V.disp * 5);
    for (let k = 0; k < n; k++) P1(x2, px + 1 + ((k * 3) % 6), py + 1, 1, 1, k % 2 ? '#62d36e' : '#2f8f44');
  }
}

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
const STR = {
  quick: { name: 'Quick-set', time: 0.5, value: 0.8, col: ['#f0ff8a', '#c8e040', '#7a9a10'], note: 'A restless culture: the curd sets before it has time to mature.' },
  dense: { name: 'Dense', base: 3, value: 2.2, col: ['#ffc46a', '#e0802a', '#8a4210'], note: 'Pressed until there is nothing left to press. Heavy, rich and hungry.' },
  teaching: { name: 'Teaching', teach: 3, value: 0.6, col: ['#dfe8ff', '#7a9cf0', '#3a5ab0'], note: 'Slow and fussy. Every wheel is a lesson for whoever makes it.' },
};
const STR_IDS = Object.keys(STR);
// Movimiento de STRAINS: curvas suaves, sin saltos de fotograma.
const EASE = 'cubic-bezier(.22,.8,.3,1)', EASE_IN = 'cubic-bezier(.55,0,.8,.35)', SPRING = 'cubic-bezier(.3,1.45,.5,1)';
const SNAME = (id) => (id ? STR[id].name : 'Plain');
// ---------- Arte: placas de Petri (28 × 18, vista oblicua) ----------
// SPRITE: placa de cristal (canto claro arriba, sombra abajo), agar crema y el cultivo de cada cepa, por código:
// Quick-set, rayos en zigzag de un verde eléctrico por los que corre una chispa con su estela (inquieta, ágil).
// Dense, una masa ámbar espesa que ocupa casi toda la placa y respira despacio (pesada, rica, hambrienta).
// Teaching, colonias en filas ordenadas por las que pasa una onda de luz suave, como quien lee (lenta, metódica).
// Sin descubrir (y cultivándose): un organismo perlado de tres lóbulos con su núcleo, que respira y por dentro del que
// circula una chispa de vida, con dos hebras finas; bajo una tapa limpia con la condensación justa. Es la misma forma en la
// placa sellada, en el cultivo y en la revelación, donde se transforma en la cepa. No dice cuál de las tres será.
// Movimiento sin saltos: todo varía de forma continua (senos y curvas) y los bordes que crecen o respiran avanzan con un
// tramado ordenado, píxel a píxel, en vez de cambiar de golpe.
const DW = 28, DH = 18, DCX = 14, DCY = 8.5, DRX = 12.5, DRY = 7;
const ell = (x, y, cy = DCY, rx = DRX, ry = DRY) => ((x + 0.5 - DCX) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
const hsh = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) / 4294967296; };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const dith = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { const A = hx(a), Bc = hx(b); return '#' + A.map((v, i) => Math.round(v + (Bc[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const easeOut = (k) => 1 - (1 - k) ** 3;
const easeInOut = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
// El organismo desconocido: cuatro lóbulos (uno grande y tres pequeños) unidos; s es su escala (crece o respira).
const LOBES = [[0, 0, 4.6, 2.7], [-3.7, 1.1, 2.6, 1.6], [3.5, -0.9, 2.5, 1.5], [0.6, 2.1, 2.1, 1.1]];
const orgF = (x, y, s) => { let m = 9; for (const [ox, oy, rx, ry] of LOBES) { const d = ((x + 0.5 - DCX - ox * s) / (rx * s)) ** 2 + ((y + 0.5 - DCY - oy * s) / (ry * s)) ** 2; if (d < m) m = d; } return m; };
function drawOrganism(x2, s, t, a = 1) {
  if (s <= 0.05) return;
  x2.globalAlpha = a;
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    if (ell(x, y) > 0.66) continue;
    const f = orgF(x, y, s), th = 1 + (dith(x, y) - 0.5) * 0.3;
    // Sombra suave en el agar, un píxel por debajo del borde.
    if (f > th) { if (orgF(x, y - 1, s) <= 1) P1(x2, x, y, 1, 1, '#d2bd8a'); continue; }
    P1(x2, x, y, 1, 1, f > 0.68 ? '#6f6684' : f > 0.4 ? '#b8afcc' : f > 0.15 ? '#d4cce3' : '#958aae');
  }
  // Brillo en el lóbulo grande y una chispa de vida que circula despacio por dentro.
  if (s > 0.6) {
    P1(x2, Math.round(DCX - 2.4 * s), Math.round(DCY - 1.6 * s), 2, 1, '#f4f0fb');
    const ang = (t / 2600) * Math.PI * 2, px = Math.round(DCX - 0.5 + Math.cos(ang) * 2.6 * s), py = Math.round(DCY - 0.5 + Math.sin(ang) * 1.1 * s);
    x2.globalAlpha = a * (0.55 + 0.45 * Math.sin(t / 700)); P1(x2, px, py, 1, 1, '#ffffff'); x2.globalAlpha = a;
    // Dos hebras finas que se estiran y recogen.
    [[-0.5, -5.4, 0.6], [0.4, 6.2, -0.4]].forEach(([dy, ox, slope], k) => {
      const len = 1.5 + 1.5 * (0.5 + 0.5 * Math.sin(t / 1900 + k * 2.1));
      for (let i = 0; i < Math.ceil(len); i++) { const x = Math.round(DCX - 0.5 + ox * s + Math.sign(ox) * i), y = Math.round(DCY - 0.5 + dy * s + slope * i); if (ell(x, y) < 0.66) { x2.globalAlpha = a * Math.min(1, len - i); P1(x2, x, y, 1, 1, '#9d94b2'); } }
    });
  }
  x2.globalAlpha = 1;
}
// Tapa: cristal limpio, el canto con luz y la condensación justa (unas gotas junto al borde de arriba). a = opacidad.
function drawLid(x2, t, a = 1) {
  x2.globalAlpha = a;
  for (let x = 6; x < DW - 6; x++) { const y = Math.ceil(DCY - DRY * 0.9 * Math.sqrt(Math.max(0, 1 - ((x + 0.5 - DCX) / (DRX * 0.9)) ** 2))); P1(x2, x, y, 1, 1, '#ffffff'); }
  for (const [x, y] of [[9, 3], [18, 3], [21, 5]]) { P1(x2, x, y, 1, 1, '#ffffff'); P1(x2, x, y + 1, 1, 1, '#b8d4e8'); }
  // Un reflejo diagonal suave que vela un poco el interior.
  x2.globalAlpha = a * 0.28; for (let i = 0; i < 6; i++) P1(x2, 8 + i, 9 - i, 1, 1, '#ffffff');
  x2.globalAlpha = 1;
}
function drawDish(x2, kind, t, o = {}) {
  x2.clearRect(0, 0, DW, DH);
  const grow = o.grow === undefined ? 1 : o.grow;
  // Sombra, pared (dos píxeles de canto por debajo) y contorno.
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    const d = ell(x, y), dl = ell(x, y - 2);
    if (d > 1 && dl <= 1) P1(x2, x, y, 1, 1, dl > 0.82 ? K : y > DCY + 5 ? '#4a6274' : '#7fa6bb');
    else if (d > 1 && (ell(x - 1, y) <= 1 || ell(x + 1, y) <= 1 || ell(x, y - 1) <= 1 || ell(x, y + 1) <= 1 || dl <= 1.12)) P1(x2, x, y, 1, 1, K);
  }
  // Agar y canto de cristal.
  const agar = o.agar || ['#f6e8bc', '#e9d6a0', '#d9c08a'];
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    const d = ell(x, y); if (d > 1) continue;
    if (d > 0.8) P1(x2, x, y, 1, 1, y < DCY - 1 && x < DCX + 2 ? '#e8f6ff' : y < DCY ? '#cfeefa' : '#9ab8d8');
    else P1(x2, x, y, 1, 1, d > 0.62 ? agar[2] : (x + y * 3) % 7 === 0 ? agar[1] : agar[0]);
  }
  // Dentro de la zona que ha crecido (con el borde tramado, para que crezca píxel a píxel).
  const inside = (x, y, k = 0.62) => ell(x, y) < k * grow * grow + (grow < 1 ? (dith(x, y) - 0.5) * 0.08 : 0);
  if (kind === 'quick') {
    // Rayos en zigzag con su sombra (para que el verde se lea sobre el agar) y una chispa con estela que recorre un rayo
    // cada vez; las puntas laten suave.
    const c = STR.quick.col, px = [], ray = Math.floor(t / 640) % 6, head = ((t % 640) / 640) * 9;
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2 + 0.3, tip = 0.5 + 0.5 * Math.sin(t / 420 + a * 1.7);
      for (let st = 1; st <= 7; st++) {
        const zig = st % 2 ? 0.8 : -0.8, x = Math.round(DCX - 0.5 + Math.cos(ang) * st * 1.35 - Math.sin(ang) * zig), y = Math.round(DCY - 0.5 + Math.sin(ang) * st * 0.75 + Math.cos(ang) * zig * 0.5);
        if (!inside(x, y)) break;
        let col = st > 5 ? mix(c[1], c[0], tip) : c[1];
        if (a === ray) { const dd = head - st; if (dd >= 0 && dd < 3) col = mix('#ffffff', c[0], dd / 3); }
        px.push([x, y, col]);
      }
    }
    for (const [x, y] of px) if (inside(x, y + 1)) P1(x2, x, y + 1, 1, 1, c[2]);
    for (const [x, y, col] of px) P1(x2, x, y, 1, 1, col);
    P1(x2, DCX - 2, Math.floor(DCY) - 1, 3, 2, c[2]); P1(x2, DCX - 1, Math.floor(DCY) - 1, 1, 1, c[0]);
  } else if (kind === 'dense') {
    // Respira despacio: el borde avanza y retrocede de forma continua (tramado) y el brillo se desliza un poco.
    const c = STR.dense.col, br = 0.5 + 0.045 * Math.sin(t / 1300);
    for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
      const d = ell(x, y), n = hsh(x, y) * 0.12, edge = br + n + (dith(x, y) - 0.5) * 0.06;
      if (!inside(x, y) || d > edge) continue;
      P1(x2, x, y, 1, 1, d < 0.12 ? c[2] : d > edge - 0.12 ? c[0] : (x * 3 + y) % 5 === 0 ? c[2] : c[1]);
    }
    if (grow > 0.8) { const gx = Math.round(DCX - 4.5 + Math.sin(t / 1300) * 0.6); P1(x2, gx, Math.floor(DCY) - 2, 2, 1, '#fff3c0'); P1(x2, gx - 1, Math.floor(DCY) - 1, 1, 1, '#fff3c0'); }
  } else if (kind === 'teaching') {
    // Una onda de luz recorre las filas en orden, encendiendo cada colonia y apagándola poco a poco.
    const c = STR.teaching.col, dots = [];
    for (let y = 3; y < DH - 3; y += 2) for (let x = 5 + (y % 4 === 3 ? 1 : 0); x < DW - 5; x += 3) if (inside(x, y, 0.5)) dots.push([x, y]);
    const f = (t / 240) % (dots.length + 6);
    dots.forEach(([x, y], i) => { const k = Math.max(0, 1 - Math.abs(i - f) / 2.2); P1(x2, x, y, 2, 1, k > 0 ? mix(c[1], '#ffffff', k) : c[1]); });
  } else if (kind === 'stage') {
    // Cultivo en marcha, por fases según el progreso: MUESTRA (el trozo de Cheddar cae al agar con un rebote suave),
    // REACCIÓN (ondas que se abren despacio y burbujas que suben; la tapa entra fundiéndose) y CRECIMIENTO (el organismo
    // crece desde la muestra, píxel a píxel, mientras la muestra se va consumiendo). Sin color: no se sabe qué cepa será.
    const p = o.p || 0, cx = DCX - 1, cy = Math.floor(DCY);
    let drop = 0; if (p < 0.1) { const k = p / 0.1; drop = k < 0.75 ? -7 * (1 - easeOut(k / 0.75)) : -Math.sin(((k - 0.75) / 0.25) * Math.PI) * 1; }
    if (p >= 0.1 && p < 0.42) { const fade = Math.min(1, (p - 0.1) / 0.04) * Math.min(1, (0.42 - p) / 0.05); for (let r = 0; r < 2; r++) { const w = ((t / 1400) + r * 0.5) % 1, rx = 2 + w * 9, ry = rx * 0.55; x2.globalAlpha = fade * (1 - w); for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) { const d = ((x + 0.5 - DCX) / rx) ** 2 + ((y + 0.5 - DCY) / ry) ** 2; if (d > 0.82 && d < 1.12 && ell(x, y) < 0.7) P1(x2, x, y, 1, 1, '#c8b884'); } } x2.globalAlpha = 1; }
    const g = p < 0.35 ? 0 : 1 - (1 - Math.min(1, (p - 0.35) / 0.6)) ** 2;
    drawOrganism(x2, 0.12 + 0.88 * g, t, Math.min(1, g * 4));
    const left = p < 0.35 ? 1 : Math.max(0, 1 - (p - 0.35) * 1.5);
    if (left > 0) {
      x2.globalAlpha = Math.min(1, left * 1.6);
      const wedge = left > 0.5 ? ['..yY.', '.yYYy', 'yYYYy', 'ooooo'] : ['.yY.', 'yYYy', 'oooo'];
      wedge.forEach((row, j) => [...row].forEach((ch, i) => ch !== '.' && P1(x2, cx - 2 + i, Math.round(cy - wedge.length + 2 + j + drop), 1, 1, ch === 'y' ? '#ffcf2e' : ch === 'Y' ? '#fff09a' : '#c98a08')));
      x2.globalAlpha = 1;
    }
    if (p >= 0.1 && p < 0.45) for (let k = 0; k < 3; k++) { const ph = ((t / 900) + k * 0.33) % 1; x2.globalAlpha = 1 - ph; P1(x2, cx - 2 + k * 2, Math.round(cy - 2 - ph * 4), 1, 1, '#ffffff'); x2.globalAlpha = 1; }
    if (p >= 0.28) drawLid(x2, t, Math.min(1, (p - 0.28) / 0.08));
  }
  // Sin descubrir: el organismo, que respira despacio, bajo su tapa.
  if (o.lid && kind !== 'stage') { drawOrganism(x2, 0.96 + 0.04 * Math.sin(t / 1500), t); drawLid(x2, t); }
  // Brillo del cristal (siempre arriba a la izquierda).
  P1(x2, 6, 3, 3, 1, '#ffffff'); P1(x2, 5, 4, 1, 1, '#ffffff');
}
// Lienzo de placa vivo: se repinta en el bucle solo si se ve.
const DISHES = [];
function dishEl(kind, k = 2, o = {}) {
  const c = document.createElement('canvas'); c.width = DW; c.height = DH; c.className = 'pix st-dish'; c.style.width = DW * k + 'px'; c.style.height = DH * k + 'px';
  c._kind = kind; c._o = o; c._live = o.live !== false; drawDish(c.getContext('2d'), kind, 0, o);
  DISHES.push(c); return c;
}
// SPRITE: iconos pequeños de cada cepa (rayo, masa, colonias en fila) y de lo que se compara (reloj, estrella de maestría).
const STR_IC = {
  quick: () => glyph('s-quick', ['....yY.', '...yY..', '..yYyy.', '.yyyY..', '...yY..', '..yY...', '.yY....'], { y: '#c8e040', Y: '#f0ff8a' }),
  dense: () => glyph('s-dense', ['..ooo..', '.oOOOo.', 'oOddOOo', 'oOdddOo', 'oOOdOOo', '.oOOOo.', '..ooo..'], { o: '#ffc46a', O: '#e0802a', d: '#8a4210' }),
  teaching: () => glyph('s-teach', ['b.b.b', '.....', 'b.W.b', '.....', 'b.b.b'], { b: '#7a9cf0', W: '#ffffff' }),
};
const clockIc = () => glyph('clock', ['..www..', '.w...w.', 'w..k..w', 'w..kk.w', 'w.....w', '.w...w.', '..www..'], { w: '#d6d0e6', k: '#ffcf2e' });
const upIc = () => glyph('up', ['..g..', '.ggg.', 'ggggg', '.ggg.', '.ggg.'], { g: '#62d36e' });
const downIc = () => glyph('down', ['.rrr.', '.rrr.', 'rrrrr', '.rrr.', '..r..'], { r: '#ff6a5a' });
const sIcon = (id, k = 2) => (id ? copyC(STR_IC[id](), k) : pimg(lotSrc('cheddar'), 14 * k / 2, 12 * k / 2));

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
window.LB_OWN_PETRI = true;
const _drawMouse = drawMouse;
drawMouse = function (x2, now) {
  _drawMouse(x2, now);
  const j = W.job;
  if (!W.worker || !j || !j.strain) return;
  const px = MX + 12, py = MY + 10 + (Math.floor((V.t + 300) / 700) % 2); // a la altura de las patas, sin tapar el hocico
  P1(x2, px, py + 3, 10, 1, K); P1(x2, px, py, 1, 3, K); P1(x2, px + 9, py, 1, 3, K);
  P1(x2, px + 1, py, 8, 1, '#cfeefa'); P1(x2, px + 1, py + 1, 8, 2, '#f6e8bc'); P1(x2, px + 1, py + 2, 8, 1, '#9ab8d8');
  const p = V.disp;
  if (p < 0.4) { P1(x2, px + 3, py, 3, 1, '#fff09a'); P1(x2, px + 3, py + 1, 3, 1, '#ffcf2e'); }
  const n = p < 0.35 ? 0 : 1 + Math.floor((p - 0.35) * 10);
  for (let k = 0; k < n; k++) P1(x2, px + 1 + ((k * 3) % 8), py + 1 + (k % 2), 1, 1, k === n - 1 && Math.floor(now / 300) % 2 ? '#ffffff' : '#7a7090');
  if (V.done && now - V.done < 900) { const c = (STR[V.foundS] || STR.quick).col[0]; P1(x2, px + 1, py + 1, 8, 2, Math.floor(now / 90) % 2 ? c : '#ffffff'); }
};

  // ---- Montaje en el juego ----
  // W y V son lo que el mockup llama así: el laboratorio (leído del juego) y el estado visual del banco (persiste).
  const B = CM.BALANCE, C = CM.cheesery;
  // Lo que paga cada ingrediente, del juego (el mockup traía una copia).
  for (const k of Object.keys(B.ingredients)) if (ING[k]) ING[k].coin = B.ingredients[k].coinCost || 0;
  let W = null, V = null;
  const E = {};
  function readW() {
    const s = CM.ui && CM.ui.state(), ui = CM.ui && CM.ui.uiState ? CM.ui.uiState() : {}; if (!s) return null;
    const job = s.lab.job, w = C.labWorker(s), wait = C.labWaiting(s);
    const combo = (ui && ui.combo) || (W && W.combo) || { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' };
    let wc = null;
    if (wait) {
      if (s.lab.next && C.parseKey(s.lab.next)) wc = C.parseKey(s.lab.next);
      else if (C.labDir(s) === 'strain') { const t = C.strainsOpen(s) ? C.strainTarget(s) : null; wc = t ? C.parseKey(t.key) : null; }
      else wc = C.labPick(s, false);
    }
    return {
      recipes: s.recipes.length, coins: s.coins, combo, dir: s.lab.dir, advanced: C.labHas(s, 'advanced'),
      worker: w ? CM.m2crew(w, 'research') : null,
      job: job ? { c: C.parseKey(job.key), strain: !!job.strain, retried: job.retried, p: 1 - job.remaining / job.total, finished: false, source: job.source } : null,
      wait: wait && wc ? { c: wc, have: wait.have, need: wait.need, coin: wait.coin, queued: wait.queued } : null,
      next: s.lab.next ? C.parseKey(s.lab.next) : null,
      key: (job ? job.key + ':' + !!job.strain : '') + '|' + s.recipes.length + '|' + (job && job.retried),
    };
  }
  function newV() { return { t: 0, last: 0, liq: 0, fire: 0, murk: 0, disp: 0, p: [], bub: [], act: null, cache: {}, tube: [], tubeT: [], books: 0, bookT: 0, lastBub: 0, lastVap: 0, lastDrop: 0, lock: 0, recipes: 0 }; }
  let flasks = [];
  // Iconos pequeños de STRAINS (cepa, reloj, flechas, estrella) y de RECIPES (modos, componentes, libro, sello).
  const LBIC = { mode: (id) => MODE_IC[id](), part: (id) => PART_IC[id] && PART_IC[id](), book: () => bookIc(), seal: () => sealCanvas(false), s: (id) => STR_IC[id] && STR_IC[id](), clock: () => clockIc(), up: () => upIc(), down: () => downIc(), star: () => IC.star() };
  // Lo que se veía equipado en la receta en estudio: si cambia entre dos montajes, se estampa el sello de la tarjeta.
  let shownWant = null;
  function mount(root) {
    for (const c of root.querySelectorAll('canvas[data-lbic]')) {
      const [k, id] = c.dataset.lbic.split(':'), sc = +c.dataset.k || 2;
      const src = LBIC[k] && LBIC[k](id);
      if (!src) continue;
      c.width = src.width; c.height = src.height; c.style.width = Math.round(src.width * sc) + 'px'; c.style.height = Math.round(src.height * sc) + 'px'; c.style.flex = 'none';
      c.getContext('2d').drawImage(src, 0, 0);
    }
    // Placas de Petri: se pintan en el acto (con la hora global, así que repintar no las reinicia) y las vivas siguen en el bucle.
    for (let i = DISHES.length - 1; i >= 0; i--) if (!DISHES[i].isConnected) DISHES.splice(i, 1);
    const s = CM.ui && CM.ui.state(), now = performance.now();
    for (const c of root.querySelectorAll('canvas[data-dish]')) {
      const k = +c.dataset.k || 2, f = (c.dataset.o || '').split(' ');
      c.width = DW; c.height = DH; c.style.width = DW * k + 'px'; c.style.height = DH * k + 'px';
      c._kind = c.dataset.dish; c._o = { lid: f.includes('lid'), live: !f.includes('still') }; c._live = c._o.live;
      if (c._kind === 'stage') c._o.p = s && s.lab.job ? 1 - s.lab.job.remaining / s.lab.job.total : 0;
      drawDish(c.getContext('2d'), c._kind, now, c._o);
      DISHES.push(c);
    }
    const hero = root.querySelector('.mx-st-hero');
    if (hero) {
      const w = { rid: hero.dataset.rid, want: hero.dataset.want };
      if (shownWant && shownWant.rid === w.rid && shownWant.want !== w.want && !reduced) {
        const em = root.querySelector('.mx-st-card.mx-on em');
        if (em) em.animate([{ transform: 'scale(1.5)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: SPRING });
        hero.animate([{ boxShadow: 'inset 0 0 0 3px #ffcf2e' }, { boxShadow: 'inset 0 0 0 0 #ffcf2e00' }], { duration: 700, easing: EASE });
      }
      shownWant = w;
    }
    E.station = root.querySelector('.mx-st-station');
    E.scene = root.querySelector('.mx-lb-scene canvas'); E.head = root.querySelector('.mx-lb-head');
    if (E.scene) { E.scene.getContext('2d').imageSmoothingEnabled = false; if (!V) V = newV(); W = readW() || W; if (W) { if (!V.key) { V.key = W.key; V.recipes = W.recipes; V.books = Math.min(14, Math.ceil(W.recipes / 16)); } drawBench(E.scene.getContext('2d'), performance.now()); } }
    flasks = [...root.querySelectorAll('canvas.mx-lb-fl')];
    // Recién construido (antes había cabecera sin banco): las piezas del banco aparecen una a una, como en el mockup,
    // cuando el jugador cierra el aviso de CHEESE LAB BUILT!; hasta entonces el banco espera vacío.
    if (E.head) { if (E.scene && wasPre) V.built = 1e15; wasPre = E.head.classList.contains('mx-pre'); }
    E.stTab = root.querySelectorAll('.mx-lb-tab')[1] || null;
    if (E.arrive) { const a = E.arrive; E.arrive = null; arrive(root, a); }
  }
  let wasPre = false;
  // Lo que pasa en el laboratorio (lo decide el juego), visto en el banco: empieza, acaba con hallazgo o sale no concluyente.
  function events(now) {
    if (!W || !V) return;
    if (W.key !== V.key) {
      const was = V.key; V.key = W.key;
      if (W.recipes > V.recipes) { V.done = now; V.big = false; }
      else if (W.job && W.job.retried && !(was || '').endsWith('|true')) V.fail = now;
      if (W.job && (!was || was.split('|')[0] !== W.key.split('|')[0])) V.start = now;
      V.recipes = W.recipes;
    }
    if (W.dir !== V.dir) { if (V.dir !== undefined) V.nod = now; V.dir = W.dir; }
    if (W.job) V.disp = W.job.p;
  }

  // ---- Una cepa nueva: su revelación (mockup) ----
  // El juego la encuentra (strainFound); se revela cuando el jugador mira el laboratorio, sin ventanas encima. Si salieron dos,
  // la segunda tiene la suya («LUCKY FIND»). Al cerrar, la placa vuela a la pestaña STRAINS, donde esperan las tarjetas.
  const FXQ = []; let RV = null;
  function found(ev) {
    const now = performance.now();
    if (V) { V.done = now; V.big = true; V.foundS = ev.strain; }
    FXQ.push([ev.strain, ev.recipeId, false]);
    if (ev.extra) FXQ.push([ev.extra, ev.recipeId, true]);
  }
  const labOpen = () => { const sh = document.getElementById('sheet'); return !sh.hidden && sh.dataset.panel === 'lab' && document.getElementById('modal').hidden; };
  function ptIn(layer, e) { const a = layer.getBoundingClientRect(), r = e.getBoundingClientRect(); return [r.left - a.left + r.width / 2, r.top - a.top + r.height / 2]; }
  function finishReveal(R) {
    if (R.done) return;
    R.fast = true; for (const t of R.timers) clearTimeout(t);
    for (const st of R.steps) if (!st.ran) { st.ran = true; st.fn(); }
    for (const f of R.ends) f();
    for (const a of R.root.getAnimations({ subtree: true })) { try { if (isFinite(a.effect.getComputedTiming().endTime)) a.finish(); } catch (e) { /* las de bucle siguen */ } }
  }
  function strainReveal(id, rid, second) {
    const s = CM.ui.state(), r = C.recipe(s, rid);
    if (!r || !STR[id]) return;
    const sheet = document.getElementById('sheet');
    const root = document.createElement('div'); root.className = 'mx-ch-rv mx-st-rv';
    root.innerHTML = '<div class="mx-dim"></div><div class="mx-stage"><div class="mx-ttl"></div><div class="mx-slot"></div><div class="mx-tap">tap to continue</div></div><div class="mx-flash"></div>';
    sheet.appendChild(root);
    const R = RV = { root, steps: [], timers: [], ends: [], fast: false, done: false, second, id };
    root.onclick = () => (R.done ? closeStrain(R) : finishReveal(R));
    const slot = root.querySelector('.mx-slot'), ttl = root.querySelector('.mx-ttl'), dim = root.querySelector('.mx-dim'), tap = root.querySelector('.mx-tap');
    const A = (e, kf, op) => (R.fast || reduced ? null : e.animate(kf, op));
    const at = (ms, fn) => R.steps.push({ ms, fn });
    const card = document.createElement('div'); card.className = 'mx-st-rcard'; card.dataset.s = id;
    card.innerHTML = '<div class="mx-plate"><span class="mx-d1"></span></div><b class="mx-nm"></b><span class="mx-of"></span><p class="mx-nt"></p>';
    card.querySelector('.mx-of').textContent = (second ? 'A second new strain of ' : 'A new strain of ') + r.name;
    const big = document.createElement('canvas'); big.width = DW; big.height = DH; big.className = 'pix'; big.style.width = DW * 4 + 'px'; big.style.height = DH * 4 + 'px';
    card.querySelector('.mx-d1').appendChild(big);
    slot.appendChild(card); R.card = card;
    const g = { v: 0, open: false, t0: performance.now() };
    const paint = () => {
      const t = performance.now() - g.t0, x = big.getContext('2d');
      if (!g.open) { drawDish(x, second ? '' : 'stage', t, second ? { lid: true } : { p: 1 }); return; }
      const v = easeOut(g.v);
      drawDish(x, id, t, { grow: Math.max(0.05, v) });
      drawOrganism(x, 1 + 0.18 * v, t, (1 - v) ** 1.4);
      drawLid(x, t, Math.max(0, 1 - g.v * 2.5));
    };
    R.iv = setInterval(paint, 33); R.ends.push(() => { g.v = 1; g.open = true; paint(); }); paint();
    at(0, () => { dim.style.opacity = 0.7; ttl.textContent = second ? 'LUCKY FIND' : 'NEW STRAIN'; A(dim, [{ opacity: 0 }, { opacity: 0.7 }], { duration: 360, easing: EASE }); A(card, [{ transform: 'translateY(260px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: EASE }); A(ttl, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE }); });
    at(560, () => A(big, [{ transform: 'none' }, { transform: 'rotate(-1.5deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'none' }], { duration: 520, easing: 'ease-in-out' }));
    at(1080, () => {
      g.open = true;
      const fl = root.querySelector('.mx-flash'); fl.style.background = STR[id].col[0]; A(fl, [{ opacity: 0.22 }, { opacity: 0 }], { duration: 520, easing: EASE });
      A(big, [{ transform: 'scale(1)' }, { transform: 'scale(1.05)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 700, easing: EASE });
      const t0 = performance.now(), gi = setInterval(() => { g.v = Math.min(1, (performance.now() - t0) / 950); if (g.v >= 1) clearInterval(gi); }, 33); R.ends.push(() => clearInterval(gi));
      if (!(R.fast || reduced)) { const [x, y] = ptIn(root, big); burst(root, x, y, 8, STR[id].col.slice(0, 2).concat('#ffffff'), { spread: 80, up: 18, size: 3, dur: 1100, fall: 8 }); }
    });
    at(1700, () => { const nm = card.querySelector('.mx-nm'); nm.textContent = STR[id].name.toUpperCase(); A(nm, [{ transform: 'scale(1.35)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: SPRING }); });
    at(1850, () => { const nt = card.querySelector('.mx-nt'); nt.textContent = STR[id].note; A(nt, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: EASE }); });
    at(2200, () => { R.done = true; tap.style.opacity = 1; A(tap, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: EASE }); R.auto = setTimeout(() => closeStrain(R), 3200); });
    for (const st of R.steps) R.timers.push(setTimeout(() => { if (!st.ran) { st.ran = true; st.fn(); } }, reduced ? 0 : st.ms));
  }
  function closeStrain(R) {
    if (R.closed) return; R.closed = true; clearTimeout(R.auto); clearInterval(R.iv); for (const t of R.timers) clearTimeout(t); for (const f of R.ends) f();
    const tab = (E.stTab && E.stTab.isConnected && E.stTab) || (E.head && E.head.isConnected && E.head), card = R.card.querySelector('.mx-d1');
    if (!reduced && tab) {
      const [x0, y0] = ptIn(R.root, card), [x1, y1] = ptIn(R.root, tab);
      card.animate([{ transform: 'none' }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px) scale(.12)', opacity: 0.6 }], { duration: 460, easing: EASE_IN, fill: 'forwards' });
      R.root.querySelector('.mx-dim').animate([{ opacity: 0.7 }, { opacity: 0 }], { duration: 460, easing: EASE, fill: 'forwards' });
      for (const e of R.root.querySelectorAll('.mx-ttl, .mx-tap, .mx-nm, .mx-of, .mx-nt')) e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: EASE, fill: 'forwards' });
    }
    setTimeout(() => {
      R.root.remove(); if (RV === R) RV = null;
      // A STRAINS, donde esperan las tarjetas del hallazgo: la pestaña late y las tarjetas entran con sus filas una a una.
      E.arrive = R.second ? 'last' : 'all';
      if (CM.ui.uiState().labTab === 'strains' && labOpen()) CM.ui.openPanel('lab'); else CM.ui.act('labtab', 'strains');
    }, reduced ? 0 : 470);
  }
  function arrive(root, which) {
    if (reduced) return;
    if (E.stTab) E.stTab.animate([{ transform: 'scale(1.08)' }, { transform: 'none' }], { duration: 420, easing: SPRING });
    const cards = [...root.querySelectorAll('.mx-st-new')];
    for (const nc of which === 'last' ? cards.slice(-1) : cards) {
      nc.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE });
      nc.querySelectorAll('.mx-rw').forEach((rw, k) => rw.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 260 + k * 140, easing: EASE, fill: 'backwards' }));
    }
  }
  // Una placa viva se repinta solo si se ve dentro del panel.
  function seen(c) { const r = c.getBoundingClientRect(), b = document.getElementById('sheet-body').getBoundingClientRect(); return r.bottom > b.top && r.top < b.bottom && r.width > 0; }

  let tick = 0;
  setInterval(() => {
    const now = performance.now();
    if (FXQ.length && !RV && labOpen()) { const [a, b, c] = FXQ.shift(); strainReveal(a, b, c); }
    if (document.getElementById('sheet').hidden) return;
    tick++;
    if (E.scene && E.scene.isConnected) {
      if (tick % 5 === 0 || !W) W = readW() || W;
      events(now);
      if (V.built === 1e15 && document.getElementById('modal').hidden) V.built = now;
      drawBench(E.scene.getContext('2d'), now);
    }
    for (const c of flasks) {
      if (!c.isConnected) continue;
      const x2 = c.getContext('2d'), fl = img('out/sprites/ic_flask.png'); x2.clearRect(0, 0, 13, 14); if (fl.complete) x2.drawImage(fl, 0, 0);
      const s = CM.ui && CM.ui.state(); if (s && s.lab.job) { const f = Math.floor(now / 260) % 6; if (f < 4) P1(x2, 5 + (f % 2), 7 - f, 1, 1, '#c8ffc0'); }
    }
    // Cultivo en marcha: la barra y los pasos (SAMPLE, REACTION, GROWTH) siguen al juego sin repintar el panel.
    const s = CM.ui && CM.ui.state(), job = s && s.lab.job, p = job && job.strain ? 1 - job.remaining / job.total : 0;
    if (E.station && E.station.isConnected && job && job.strain) {
      const k = p < 0.1 ? 0 : p < 0.35 ? 1 : 2, bar = E.station.querySelector('.mx-st-bar i');
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
      E.station.querySelectorAll('.mx-st-steps span').forEach((sp) => { const i = +sp.dataset.k; sp.className = i < k ? 'mx-done' : i === k ? 'mx-on' : ''; });
    }
    for (const c of DISHES) if (c._live && c.isConnected && seen(c)) drawDish(c.getContext('2d'), c._kind, now, c._kind === 'stage' ? { ...c._o, p } : c._o);
  }, 40);
  CM.plab = { mount, dur, found };
})();
