// CHEESE DRILLER · BETA · Copia de js/ui/pulido-econ.js (PANTRY, SHOP y COINS aprobados) adaptada a una colonia y una cadena: el arte,
// las animaciones y la composición son los mismos; cambia de dónde salen los datos y lo que era «por roca» es «por queso». Iconos,
// indicadores, estantería y tabla de monedas copiados del mockup (paneles.html), con los datos del juego. El panel pone la
// raíz (.mx-pn-root); aquí se montan las piezas y se mantienen al día en su sitio, sin volver a montarlas.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const B = CM.BALANCE;
  const K = '#1b1220';
  const P1 = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const GLY = {};
  const glyph = (k, rows, pal) => (GLY[k] ||= icon(rows, pal));
  const copyC = (g, k = 2) => { const c = document.createElement('canvas'); c.width = g.width; c.height = g.height; c.getContext('2d').drawImage(g, 0, 0); return toImg(c, k); };
  const IMGC = {};
  const img = (s) => (IMGC[s] ||= Object.assign(new Image(), { src: s }));
  const px = (t) => (t === 'pix' || t.startsWith('mx-') ? t : 'mx-' + t);
  const cls = (c) => String(c || '').split(' ').filter(Boolean).map(px).join(' ');
  const el = (tag, c, html) => { const e = document.createElement(tag); if (c) e.className = cls(c); if (html !== undefined) e.innerHTML = html; return e; };
  const pimg = (s, w, h, c = '') => { const i = new Image(); i.src = s; i.className = 'pix ' + cls(c); i.alt = ''; i.style.width = w + 'px'; i.style.height = h + 'px'; return i; };
  const EASE = 'cubic-bezier(.22,.8,.3,1)', SPRING = 'cubic-bezier(.3,1.45,.5,1)';
  const easeOut = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  function press(e) { if (!e || reduced) return; if (e._pa) e._pa.cancel(); e._pa = e.animate([{ transform: 'translateY(2px)' }, { transform: 'none' }], { duration: 160, easing: EASE }); }
  // Cifras como las del juego (CM.fmt).
  const fmt = (n) => CM.fmt(Math.floor(n));
  const perMin = (n) => fmt(Math.round(n)) + '/min';
  const pct = (p) => (p <= 0 ? '0' : p >= 10 ? Math.round(p) : p.toFixed(1)) + '%';
  const coinI = (w = 11) => '<img class="pix" src="assets/main2/out/sprites/ic_coin.png" alt="" style="width:' + w + 'px;height:' + w + 'px">';
  const ZN = B.zones.map((z) => z.base);
  const BN = (b) => B.bases[b].name, BV = (b) => B.bases[b].value;
  const src = (k, b) => 'assets/main2/out/sprites/ic_' + k + '_' + b + '.png';

  // ---- Lo que el mockup llama Wd: el estado real, en su forma ----
  let Wd = null, body = null, GEN = 0; // SHELF lo declara la estantería copiada del mockup
  const E = {};
  function world() {
    const s = CM.ui.state(), C = CM.cheesery, H = window.H;
    const rocks = C.unlockedBases(s).slice().sort((a, b) => ZN.indexOf(a) - ZN.indexOf(b));
    const r = CM.telemetry.rates(s, 180000), cap = H.shopCapacity();
    const recs = s.recipes.map((x) => ({ id: x.id, name: x.name, b: C.parseKey(x.key).base, rec: x }));
    const lots = {}, lotsB = {};
    for (const x of recs) { const n = s.lots[x.id] || 0; lots[x.id] = n; lotsB[x.b] = (lotsB[x.b] || 0) + n; }
    const sold = {}, whole = {}, coins = {}; let fromRocks = 0;
    for (const b of rocks) {
      const rb = r.bases[b] || { c: 0, w: 0, n: 0, wn: 0 };
      sold[b] = rb.n; whole[b] = rb.wn; coins[b] = [rb.c, rb.w]; fromRocks += rb.c + rb.w;
    }
    return { s, rocks, shop: !!s.built.shop, span: r.span, inv: { raw: H.G.s.inv.raw, base: H.G.s.inv.base, tier: H.tier() }, recs, lots, lotsB, shelf: cap.shelf, can: cap.perMin, sold, whole, coins, other: Math.max(0, r.coins - fromRocks) };
  }
  const known = () => Wd.recs.slice();
  const price = (r) => (r.p !== undefined ? r.p : (r.p = CM.shop.price(Wd.s, r.rec)));
  const lotsOf = (b) => Wd.lotsB[b] || 0;
  const stock = () => Object.values(Wd.lots).reduce((a, v) => a + v, 0);
  const isFull = () => Wd.shelf > 0 && stock() >= Wd.shelf * 0.97;
  const measuring = () => Wd.span < 0.2;
  const sum = (o) => Object.values(o).reduce((a, v) => a + v, 0);
  const SPAN = () => (Wd.span >= 1.5 ? Math.round(Wd.span) + ' min' : Math.round(Wd.span * 60) + ' s');

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
// ---------- SPRITES ----------
// SPRITE: icono de PANTRY (una caja de listones con un queso encima), de SHOP (el puesto con su toldo amarillo y blanco,
// como la tienda de MAIN) y de COINS (una pila de monedas). Los tres, a 2× en el título, como CHEESERY, LAB y BOOSTS.
const WOOD = { L: '#d89a58', M: '#a8693a', D: '#6a4222', k: K };
const icPantry = () => glyph('pantry', ['..hhhhhhh..', '..YYYYYYd..', 'kkkkkkkkkkk', 'LLLLLLLLLLL', 'MkMMMMMMMkM', 'DDDDDDDDDDD', 'LLLLLLLLLLL', 'MkMMMMMMMkM', 'DDDDDDDDDDD'], { ...WOOD, h: '#fff0a0', Y: '#ffcf2e', d: '#c9860c' });
const icShop = () => glyph('shop', ['YWYWYWYWYWY', 'YWYWYWYWYWY', 'yWyWyWyWyWy', '.y.W.y.W.y.', '.P.......P.', '.P.hYd...P.', 'kkkkkkkkkkk', 'LLLLLLLLLLL', 'DDDDDDDDDDD'], { ...WOOD, Y: '#ffcf2e', y: '#c9860c', W: '#fff3d6', P: '#9a6232', h: '#fff0a0', d: '#c9860c' });
const icCoins = () => glyph('coins', ['.HWHHHHH.', 'GGGGGGGGG', 'DDDDDDDDD', 'kkkkkkkkk', 'HHHHHHHHH', 'GGGGGGGGG', 'DDDDDDDDD', 'kkkkkkkkk', 'HHHHHHHHH', 'GGGGGGGGG', 'DDDDDDDDD'], { H: '#fff0a0', W: '#ffffff', G: '#ffcf2e', D: '#b8860b', k: '#5a3a0a' });
// SPRITE: insignia de la roca que más gana. Versión final: 'disc' (la medalla redonda). La estrella suelta queda como
// variante descartada (MEDAL):
// · 'star': estrella suelta de cinco puntas, dibujada a mano para que se lea a 22 px: punta de arriba alta y afilada,
//   brazos que se estrechan hasta un píxel y puntas de abajo que se abren en cuña (no «piernas»). Silueta simétrica;
//   luz arriba a la izquierda (mitad izquierda de cada punta clara, derecha en sombra) y un brillo blanco en la punta.
// · 'disc': medalla redonda de oro con canto (luz arriba a la izquierda, sombra abajo a la derecha), una estrella clara en
//   relieve en el centro y dos cintas rojas cortas debajo, con el final en cola de golondrina.
let MEDAL = 'disc'; // aprobada como versión final (18-10-2026)
const MEDAL_STAR = ['......W......', '......H......', '.....HHG.....', '.....HHG.....', '....HHHGG....', 'HHHHHHHGGGGGG', '.GGGGGHGGGGM.', '..GGGGGGGGM..', '...GGGGGMM...', '...GGGMMMD...', '..GGGM.MMDD..', '..GGM...MDD..', '.GM.......DD.', '.M.........D.'];
const MEDAL_DISC = ['....HHHHH....', '..HHLLGGGHH..', '.HLLLGGGGGGD.', '.HLLGGsGGGGD.', 'HLLGGGsGGGGGD', 'HLGsssssssGGD', 'HGGGsssssGGMD', 'HGGGGsssGGMMD', 'HGGGssGssMMMD', '.HGGsGGGsMMD.', '.HGGGGGMMMMD.', '..DDGGMMMDD..', '....DDDDD....', '...RRr.rRR...', '...RRr.rRR...', '...R.r.r.R...'];
const icMedal = (v = MEDAL) => v === 'disc'
  ? glyph('medalD', MEDAL_DISC, { H: '#fff0a0', L: '#ffd84a', G: '#f2b81e', M: '#d99a12', D: '#9a6a08', s: '#fff8d6', R: '#e0485e', r: '#8e2236' })
  : glyph('medalS', MEDAL_STAR, { W: '#ffffff', H: '#fff0a0', G: '#ffcf2e', M: '#e0a820', D: '#b8860b' });
// SPRITE: la placa del mayorista (lila, con la moneda partida: media entera y media solo en contorno).
const icHalf = () => GLY.half || (GLY.half = (() => { const c = document.createElement('canvas'); c.width = 11; c.height = 11; const g = c.getContext('2d');
  P1(g, 0, 0, 11, 11, K); P1(g, 1, 1, 9, 9, '#c3b4ff'); P1(g, 1, 9, 9, 1, '#9580e6');
  halfCoin(g, 2, 2, true);
  return c; })());
// SPRITE: caja del mayorista con su banda lila («a mitad de precio»), para la explicación de la tienda.
const icCrate = () => glyph('crate', ['LLLLLLLLL', 'MkMMMMMkM', 'DDDDDDDDD', 'vvvvvvvvv', 'VVVVVVVVV', 'LLLLLLLLL', 'MkMMMMMkM', 'DDDDDDDDD'], { ...WOOD, v: '#c3b4ff', V: '#9580e6' });
// La gema de refuerzo aprobada en BOOSTS (para «un refuerzo en la tienda»).
const icGem = () => glyph('gem', ['.HHHHH.', 'HWHLLLD', 'LHLLLDD', '.LLLDD.', '..LDD..', '...D...'], { H: '#9fe6ff', W: '#ffffff', L: '#5ad1ff', D: '#2f8fc0' });
const chevR = (c = '#9f97b8') => glyph('chev' + c, ['m..', 'mm.', 'mmm', 'mm.', 'm..'], { m: c });

const ROLL = new Set();
function rollTo(e, v, f = fmt) { if (e._v === undefined || reduced) { e._v = v; e._t = v; e.textContent = f(v); return; } e._t = v; e._f = f; ROLL.add(e); }
setInterval(() => { for (const e of ROLL) { if (!e.isConnected) { ROLL.delete(e); continue; } const d = e._t - e._v; e._v = Math.abs(d) < Math.max(1, Math.abs(e._t) * 0.004) ? e._t : e._v + d * 0.25; e.textContent = e._f(e._v); if (e._v === e._t) ROLL.delete(e); } }, 60);
// ---------- PANTRY ----------
// SPRITE: cada mercancía es su icono aprobado y, a su lado, un indicador de nivel: tres casillas enmarcadas en tinta que se
// llenan, de abajo arriba, con el color de ese material. Una casilla: unidades; dos: miles; tres: millones o más. A cero,
// las tres vacías y el icono apagado. La cifra dice lo exacto; el indicador, el orden de magnitud de un vistazo.
// Movimiento: al subir de orden, la casilla nueva se llena de abajo arriba (300 ms) y destella una vez; al bajar, la de
// arriba se vacía. Una subida o bajada notable (2 % o más) hace que la casilla de arriba brille o se apague un instante,
// como mucho una vez cada 1,4 s por casilla: con cifras que cambian deprisa, el indicador no parpadea.
function tierOf(n) { return n <= 0 ? 0 : n < 1000 ? 1 : n < 1e6 ? 2 : 3; }
const PALC = {};
function palOf(im) {
  if (PALC[im.src]) return PALC[im.src];
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, px = [];
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; if (l < 70) continue; px.push([l, d[i], d[i + 1], d[i + 2]]); }
  px.sort((a, b) => a[0] - b[0]);
  const pick = (q, k = 1) => { const p = px[Math.min(px.length - 1, Math.floor(q * px.length))] || [0, 200, 160, 60]; return `rgb(${Math.round(p[1] * k)},${Math.round(p[2] * k)},${Math.round(p[3] * k)})`; };
  return (PALC[im.src] = { H: pick(0.9), M: pick(0.55), D: pick(0.2), h: pick(0.9, 0.72), m: pick(0.55, 0.72), d: pick(0.2, 0.7) });
}
const HEAP_W = 21, HEAP_H = 15;
const LIVE = new Set();
// Casillas llenas por orden de magnitud.
const LEVEL = [0, 1, 2, 3];
function Heap(kind, b, n) {
  const c = document.createElement('canvas'); c.width = HEAP_W; c.height = HEAP_H; toImg(c, 1.5);
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const icon = img(src(kind, b)), pim = img(src('raw', b));
  const H = { c, tier: tierOf(n), sq: 0, cur: LEVEL[tierOf(n)], from: LEVEL[tierOf(n)], to: LEVEL[tierOf(n)], at: 0, dur: 1, flash: null, done: 0 };
  // El indicador: 5 × 13 a la derecha del icono. Marco de tinta, tres casillas de 3 × 3 separadas por una línea; vacía, un
  // fondo oscuro con su luz arriba; llena, el color del material con luz a la izquierda y sombra abajo a la derecha.
  const GX = 15, GY = 2;
  function cell(pal, i, fill, glow) {
    const y0 = GY + 1 + (2 - i) * 4;
    P1(g, GX + 1, y0, 3, 3, '#141020'); P1(g, GX + 1, y0, 3, 1, '#2a2338');
    const rows = Math.round(3 * fill); if (!rows) return;
    const L = [[pal.H, pal.M, pal.M], [pal.M, pal.M, pal.D], [pal.M, pal.D, pal.D]];
    for (let r = 0; r < rows; r++) { const yy = y0 + 2 - r, row = L[2 - r]; for (let x = 0; x < 3; x++) P1(g, GX + 1 + x, yy, 1, 1, glow > 0 ? '#ffffff' : row[x]); }
    if (glow < 0) { g.globalAlpha = 0.55; P1(g, GX + 1, y0 + 3 - rows, 3, rows, '#141020'); g.globalAlpha = 1; }
  }
  function draw(now) {
    g.clearRect(0, 0, HEAP_W, HEAP_H);
    if (!icon.complete || !icon.width) return true;
    const pal = palOf(kind === 'base' ? icon : pim.complete && pim.width ? pim : icon);
    const q = Math.min(1, Math.max(0, (now - H.at) / H.dur)); let busy = q < 1;
    H.cur = H.from + (H.to - H.from) * easeOut(q);
    if (!busy && H.landPending) { H.landPending = 0; H.sq = now; H.flash = { t0: now, up: true, cell: H.to - 1 }; }
    const sq = now - H.sq < 90 ? 1 : 0; if (sq) busy = true;
    const iw = icon.width, ih = icon.height;
    if (sq) g.drawImage(icon, 0, 0, iw, ih, 0, HEAP_H - ih + 1, iw, ih - 1); else g.drawImage(icon, 0, HEAP_H - ih);
    P1(g, GX, GY, 5, 13, K);
    const fl = H.flash && now - H.flash.t0 < 140 ? H.flash : null; if (fl) busy = true;
    for (let i = 0; i < 3; i++) cell(pal, i, Math.min(1, Math.max(0, H.cur - i)), fl && fl.cell === i ? (fl.up ? 1 : -1) : 0);
    return busy;
  }
  H.draw = draw;
  // Cambio de orden de magnitud: la casilla nueva se llena (o la de arriba se vacía) en 300 ms; al llenarse, destella.
  H.setTier = (t) => { const now = performance.now(); H.from = H.cur; H.to = LEVEL[t]; H.at = now; H.dur = t > H.tier ? 320 : 280; H.landPending = t > H.tier && t >= 1; H.tier = t; wake(H); };
  H.bump = (down) => { H.flash = { t0: performance.now(), up: !down, cell: Math.max(0, H.to - 1) }; wake(H); };
  const go = () => wake(H); if (icon.complete) go(); else icon.addEventListener('load', go, { once: true }); pim.addEventListener('load', go, { once: true });
  return H;
}
function wake(H) { LIVE.add(H); }
setInterval(() => { const now = performance.now(); for (const H of LIVE) { if (!H.c.isConnected && H.c._was) { LIVE.delete(H); continue; } H.c._was = 1; if (!H.draw(now)) LIVE.delete(H); } }, 33);
function rackCell(kind, b, n) {
  const c = el('div', 'pt-c' + (n > 0 ? '' : ' z')); const H = Heap(kind, b, n); const v = el('b', 'pn-roll');
  c.append(H.c, v); rollTo(v, n);
  let last = n, lastAt = 0;
  c._set = (m) => {
    const now = performance.now(), t = tierOf(m);
    rollTo(v, m);
    if (t !== H.tier) {
      // A cero, el icono se apaga cuando se ha vaciado la última casilla; al salir de cero, se enciende antes de llenarse.
      if (t > 0) c.classList.remove('mx-z'); else setTimeout(() => c.classList.toggle('mx-z', tierOf(last) === 0), 260);
      H.setTier(t); last = m; lastAt = now; return;
    }
    if (t > 0 && Math.abs(m - last) / Math.max(1, last) >= 0.02 && now - lastAt > 1400) { H.bump(m < last); last = m; lastAt = now; }
  };
  return c;
}
function renderPantry() {
  body.appendChild(el('p', 'pn-hint', 'What the chain has waiting for its next stage. Nothing has a limit except the shop shelves.'));
  const racks = el('div', 'box pt-racks');
  const head = el('div', 'pt-g pt-head'); head.innerHTML = '<span></span><span>RAW</span><span class="mx-pt-arr"></span><span>BASE</span><span class="mx-pt-arr"></span><span>CHEESE</span>'; racks.appendChild(head);
  E.cells = {};
  for (const b of Wd.rocks) {
    const r = el('div', 'pt-g pt-rack'); r.appendChild(el('span', 'pt-rock', BN(b)));
    const [raw, base] = Wd.inv[b];
    const cs = [rackCell('raw', b, raw), rackCell('base', b, base), rackCell('lot', b, lotsOf(b))];
    r.append(cs[0], arrowEl(), cs[1], arrowEl(), cs[2]); E.cells[b] = cs; racks.appendChild(r);
  }
  body.appendChild(racks);
  // El queso: lo que hay, por precio (como hoy); lo que está a cero, plegado con su cantidad.
  const list = known().sort((a, b) => price(b) - price(a));
  const inStock = list.filter((r) => (Wd.lots[r.name] || 0) > 0), zero = list.filter((r) => !(Wd.lots[r.name] > 0));
  const worth = inStock.reduce((a, r) => a + Wd.lots[r.name] * price(r), 0);
  const h = el('div', 'pn-h'); h.innerHTML = `<b>CHEESE IN STOCK</b><small>${worth ? `worth ${coinI(11)} <span class="mx-pn-roll" style="color:var(--gold);font-weight:800">${fmt(worth)}</span>` : 'from the Cheesery, sold in the Shop'}</small>`;
  E.worth = h.querySelector('.mx-pn-roll'); if (E.worth) E.worth._v = worth;
  body.appendChild(h);
  const box = el('div', 'pt-list'); E.list = box; body.appendChild(box);
  if (!list.length) { const e = el('div', 'box pt-empty'); e.append(pimg(src('lot', 'cheddar'), 22, 19), el('span', '', 'No recipes yet.')); box.appendChild(e); return; }
  if (!inStock.length) { const e = el('div', 'box pt-empty'); e.append(pimg(src('lot', Wd.rocks[0]), 22, 19), el('span', '', 'No cheese waiting: the shop sells it as soon as it is made.')); box.appendChild(e); }
  for (const r of inStock) box.appendChild(stockRow(r));
  if (zero.length) {
    const z = el('div', 'box pt-zero'); z.innerHTML = '<span class="mx-pt-chev-w"></span><span class="mx-t"><b>NO CHEESE IN STOCK</b><small>Known recipes, none waiting now</small></span><em><span class="mx-n mx-pn-roll">' + zero.length + '</span> RECIPES</em>';
    z.querySelector('.mx-pt-chev-w').appendChild(Object.assign(copyC(chevR(), 2), { className: 'pix mx-pt-chev' }));
    const wrap = el('div', 'pt-zl'), inner = el('div'); wrap.appendChild(inner);
    E.zero = z; E.zeroN = z.querySelector('.mx-n'); E.zeroN._v = zero.length; E.zl = inner; E.zlw = wrap;
    z.onclick = () => toggleZero();
    body.append(z, wrap);
  }
  if (inStock.length) body.appendChild(el('p', 'pn-hint', 'Sorted by price, dearest first: the shop sells them in that order.'));
}
function arrowEl() { const a = el('span', 'pt-arr'); a.appendChild(copyC(chevR('#5a5270'), 1)); return a; }
function stockRow(r) {
  const row = el('div', 'box pt-row'); row.dataset.name = r.name;
  row.innerHTML = `<img class="pix" src="${src('lot', r.b)}" alt="" style="width:22px;height:19px"><span class="mx-t"><b>${r.name}</b><small>sells for ${coinI(10)}<u>${fmt(price(r))}</u> each</small></span><span class="mx-q mx-pn-roll"></span>`;
  rollTo(row.querySelector('.mx-q'), Wd.lots[r.name]);
  return row;
}
function zeroRows() {
  const list = known().filter((r) => !(Wd.lots[r.name] > 0)).sort((a, b) => BV(b.b) - BV(a.b) || price(b) - price(a));
  E.zl.replaceChildren();
  // Agrupadas por queso, de la roca más cara a la más barata; una línea por receta.
  let last = '';
  for (const r of list) {
    if (r.b !== last) { last = r.b; E.zl.appendChild(el('div', 'pt-zcap', BN(r.b).toUpperCase())); }
    const z = el('div', 'pt-zr'); z.innerHTML = `<img class="pix" src="${src('lot', r.b)}" alt="" style="width:15px;height:13px"><span>${r.name}</span><small>${coinI(9)}${fmt(price(r))}</small>`; E.zl.appendChild(z);
  }
}
function toggleZero(force) {
  const open = force !== undefined ? force : !E.zero.classList.contains('mx-open');
  if (open && !E.zl.children.length) zeroRows();
  E.zero.classList.toggle('mx-open', open); E.zlw.classList.toggle('mx-open', open);
  press(E.zero);
  if (open && !reduced) [...E.zl.children].slice(0, 14).forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateX(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: 60 + i * 22, easing: EASE, fill: 'backwards' }));
}
// Un queso se agota: su fila se recoge y el contador de los que están a cero sube.
function sellOut(name) {
  const row = E.list && E.list.querySelector(`[data-name="${name}"]`); if (!row) return;
  const r = CATALOG.find((x) => x.name === name); Wd.lots[name] = 0;
  const gen = GEN, done = () => { if (gen !== GEN) return; row.remove(); bumpZero(+1); E.cells[r.b][2]._set(lotsOf(r.b)); if (E.zl && E.zl.children.length) zeroRows(); };
  if (reduced) return done();
  rollTo(row.querySelector('.mx-q'), 0);
  setTimeout(() => { const h = row.offsetHeight; row.style.overflow = 'hidden'; row.animate([{ opacity: 1, height: h + 'px' }, { opacity: 0, height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '-4px' }], { duration: 300, easing: EASE, fill: 'forwards' }).onfinish = null; setTimeout(done, 310); }, 520);
}
// Un queso vuelve a tener existencias: su fila entra en su sitio (por precio) y el contador baja.
function restock(name, n) {
  const r = CATALOG.find((x) => x.name === name); Wd.lots[name] = n;
  const rows = [...E.list.querySelectorAll('.mx-pt-row')]; const row = stockRow(r);
  const after = rows.find((x) => price(CATALOG.find((c) => c.name === x.dataset.name)) < price(r));
  const emp = E.list.querySelector('.mx-pt-empty'); if (emp) emp.remove();
  E.list.insertBefore(row, after || null);
  bumpZero(-1); E.cells[r.b][2]._set(lotsOf(r.b)); if (E.zl && E.zl.children.length) zeroRows();
  if (!reduced) { row.animate([{ opacity: 0, transform: 'translateY(-6px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: SPRING }); row.animate([{ boxShadow: 'inset 0 0 0 2px #ffffff66' }, { boxShadow: 'inset 0 0 0 2px #ffffff00' }], { duration: 700, easing: EASE }); }
}
function bumpZero(d) { if (!E.zeroN) return; const v = E.zeroN._t !== undefined ? E.zeroN._t : E.zeroN._v; rollTo(E.zeroN, v + d); if (!reduced) E.zeroN.parentElement.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 300, easing: SPRING }); }

// ---------- SHOP ----------
// SPRITE: la estantería de la tienda, a 2×: dos postes, tres baldas con veta y clavos y, al lado, la salida del mayorista:
// una caja de liquidación sobre un palé, con la banda lila, una pegatina de oferta «-50%» en su frente y el rótulo
// WHOLESALE debajo. La estantería se reparte en secciones, una por queso que haya en los estantes, del más caro
// (izquierda) al más barato: cada queso presente se ve, aunque sea poco. Lo lleno de la estantería es lo lleno de los
// estantes del juego.
// Movimiento: un gesto cada vez, en cola, nunca dos a la vez:
// · Llega queso: entra rodando por detrás de los demás desde el poste y se asienta en su hueco (la balda cede un píxel).
// · Venta: el queso más caro se levanta y sale; en su sitio, una moneda de oro sube girando.
// · Mayorista (con los estantes llenos): un queso barato cae sobre la estantería (no cabe), rueda hasta el borde y cae en la
//   caja de liquidación; su etiqueta «-50%» se estampa y sube una moneda con «-50%»: vendido con descuento.
let SHELF = null;
const COIN_F = [
  ['..kkk..', '.kHHGk.', 'kHWGGDk', 'kHGGGDk', 'kGGGDDk', '.kGDDk.', '..kkk..'],
  ['..kkk..', '..kHGk.', '.kHGGDk', '.kHGGDk', '.kGGDDk', '..kGDk.', '..kkk..'],
  ['...k...', '..kGk..', '..kGk..', '..kGk..', '..kDk..', '..kDk..', '...k...'],
];
const COIN_PAL = { k: K, H: '#fff0a0', W: '#ffffff', G: '#ffcf2e', D: '#b8860b' };
function drawRows(g, rows, x, y, pal, cols) {
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '.' || (cols && !cols(i))) return; g.fillStyle = pal[ch] || ch; g.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); }));
}
// La placa del mayorista: moneda de 7 × 7 partida por una ranura; la mitad izquierda de oro, la derecha un fantasma lila
// («a mitad de precio»: se cobra media moneda).
function halfCoin(g, x, y, on) {
  HALF_COIN.forEach((r, j) => [...r].forEach((ch, i) => {
    if (ch === '.' || i === 3) return;
    if (i < 3) P1(g, x + i, y + j, 1, 1, on ? COIN_PAL[ch] : { k: K, H: '#a8a0b8', G: '#8a83a0', D: '#6f6886' }[ch]);
    else P1(g, x + i, y + j, 1, 1, ch === 'k' ? (on ? '#4e3f8a' : '#3a3450') : on ? '#a594ee' : '#5a5270');
  }));
}
const HALF_COIN = ['..kkk..', '.kHHGk.', 'kHHGGDk', 'kHGGGDk', 'kGGGDDk', '.kGDDk.', '..kkk..'];
function Shelf(holder) {
  const c = document.createElement('canvas'); c.className = 'pix'; holder.appendChild(c);
  const g = c.getContext('2d');
  // T: hueco encima de la balda de arriba (ahí se apoya el cartel FULL y rueda lo que sobra).
  const T = 14, LW = Math.floor(holder.clientWidth / 2), H = 52 + T, CW = 34, UW = LW - CW;
  c.width = LW; c.height = H; c.style.width = LW * 2 + 'px'; c.style.height = H * 2 + 'px';
  const per = Math.max(1, Math.floor((UW - 8) / 15)), N = per * 3;
  const x0 = 4 + Math.floor((UW - 8 - per * 15) / 2);
  const sx = (col) => x0 + col * 15, sy = (row) => T + 3 + 16 * (2 - row);
  const crate = { x: UW + 4, y: H - 3 - 14, w: CW - 6, h: 14 };
  const S = { grid: [], full: false, lit: false, dim: !Wd.shop, alive: true, fx: [], rolls: [], dips: {}, queue: [], busy: 0, crateBump: 0, nextAuto: performance.now() + 1200, auto: true, UW, crate, per, N };
  const order = ZN.slice().sort((a, b) => BV(b) - BV(a));
  function target() { const st = stock(); return !Wd.shelf || st <= 0 ? 0 : Math.max(1, Math.round(Math.min(1, st / Wd.shelf) * N)); }
  // Secciones: columnas por queso, proporcionales a lo que hay y al menos una por queso presente.
  function layout(now, stagger = true) {
    const st = stock(), n = target(), types = order.filter((b) => lotsOf(b) > 0);
    S.grid = Array.from({ length: per }, () => [null, null, null]); S.sec = [];
    if (!types.length) return;
    const k = Math.min(types.length, per), ty = types.slice(0, k);
    const cols = ty.map((b) => [b, 1, (lotsOf(b) / st) * (per - k)]);
    let left = per - k; for (const x of cols) { const f = Math.floor(x[2]); x[1] += f; left -= f; x[2] -= f; }
    cols.slice().sort((a, b) => b[2] - a[2]).forEach((x) => { if (left > 0) { x[1]++; left--; } });
    let c0 = 0; for (const [b, cn] of cols) { S.sec.push({ b, c0, cn }); c0 += cn; }
    const w = S.sec.map((s) => Math.min(3 * s.cn, Math.max(1, Math.round((lotsOf(s.b) / st) * n))));
    let tot = w.reduce((a, v) => a + v, 0);
    while (tot > n) { const i = w.indexOf(Math.max(...w)); if (w[i] <= 1) break; w[i]--; tot--; }
    const bySh = S.sec.map((s, i) => i).sort((a, b) => lotsOf(S.sec[b].b) - lotsOf(S.sec[a].b));
    for (const i of bySh) while (tot < n && w[i] < 3 * S.sec[i].cn) { w[i]++; tot++; }
    let idx = 0;
    S.sec.forEach((s, i) => { for (let q = 0; q < w[i]; q++) { const r = Math.floor(q / s.cn), col = s.c0 + (q % s.cn); S.grid[col][r] = { b: s.b, t0: now + (stagger && !reduced ? idx++ * 22 : -999), land: !stagger || reduced }; } });
  }
  const secOf = (b) => S.sec.find((s) => s.b === b);
  const filledIn = (s) => { let n = 0; for (let col = s.c0; col < s.c0 + s.cn; col++) for (let r = 0; r < 3; r++) if (S.grid[col][r]) n++; return n; };
  const nextFree = (s) => { for (let r = 0; r < 3; r++) for (let col = s.c0; col < s.c0 + s.cn; col++) if (!S.grid[col][r]) return [col, r]; return null; };
  const lastIn = (s) => { for (let r = 2; r >= 0; r--) for (let col = s.c0 + s.cn - 1; col >= s.c0; col--) { const w = S.grid[col][r]; if (w && !w.out && !w.rolling) return [col, r]; } return null; };
  // ---- Gestos ----
  function doSale(now) {
    const s = S.sec.find((x) => lastIn(x)); if (!s) return 0;
    const [col, r] = lastIn(s), w = S.grid[col][r]; w.out = now;
    S.fx.push({ kind: 'coin', x: sx(col) + 4, y: sy(r) - 3, t0: now + 160 });
    S.lastSold = s.b;
    setTimeout(() => { if (S.grid[col] && S.grid[col][r] === w) S.grid[col][r] = null; }, 280);
    return 900;
  }
  function doRestock(now, b) {
    const own = b && b !== 'any' && secOf(b), s = own && nextFree(own) ? own : S.sec.find((x) => nextFree(x)); if (!s) return 0;
    const f = nextFree(s);
    const [col, r] = f, w = { b: s.b, rolling: true, t0: now, from: -16, land: false };
    S.grid[col][r] = w;
    const dist = sx(col) + 16; w.dur = Math.max(260, Math.min(700, dist * 5));
    return w.dur + 200;
  }
  function doOverflow(now) {
    const cheap = order.slice().reverse().find((z) => (Wd.whole[z] || 0) > 0) || 'cheddar';
    S.rolls.push({ b: cheap, t0: now });
    return 2100;
  }
  S.enqueue = (kind, arg, gap = 380) => S.queue.push([kind, arg, gap]);
  function run(now) {
    if (!S.alive || reduced) return;
    if (now < S.busy) return;
    let it = S.queue.shift();
    if (!it && S.auto && Wd.shop && now >= S.nextAuto && sum(Wd.sold) > 0 && stock() > 0) {
      // Un ciclo: venta, reposición del mismo queso y, con los estantes llenos, lo que sobra al mayorista.
      S.enqueue('sale'); S.enqueue('restock', null);
      if (S.full && sum(Wd.whole) > 0) S.enqueue('over');
      S.nextAuto = Infinity; it = S.queue.shift();
    }
    if (!it) { if (S.nextAuto === Infinity) S.nextAuto = now + 1600; return; }
    const [kind, arg, gap] = it;
    const d = kind === 'sale' ? doSale(now) : kind === 'restock' ? doRestock(now, arg || S.lastSold) : doOverflow(now);
    S.busy = now + d + gap;
  }
  // ---- Dibujo ----
  function wheel(b, x, y, a = 1, squash = 0) { const im = img(src('lot', b)); if (!im.complete || !im.width) return; g.globalAlpha = a; if (squash) g.drawImage(im, 0, 0, im.width, im.height, Math.round(x), Math.round(y) + 1, im.width, im.height - 1); else g.drawImage(im, Math.round(x), Math.round(y)); g.globalAlpha = 1; }
  function board(x, y, w, dipCol) {
    P1(g, x - 1, y - 1, w + 2, 5, K); P1(g, x, y, w, 1, WOOD.L); P1(g, x, y + 1, w, 1, WOOD.M); P1(g, x, y + 2, w, 1, WOOD.D);
    for (let i = x + 5; i < x + w - 3; i += 9) P1(g, i, y + 1, 2, 1, '#8a5530');
    P1(g, x + 1, y + 1, 1, 1, '#3a2414'); P1(g, x + w - 2, y + 1, 1, 1, '#3a2414');
    if (dipCol !== undefined) { const dx = sx(dipCol); P1(g, dx, y - 1, 15, 1, '#2a1f1b'); P1(g, dx, y, 15, 1, K); P1(g, dx, y + 1, 15, 1, WOOD.L); P1(g, dx, y + 2, 15, 1, WOOD.M); P1(g, dx, y + 3, 15, 1, WOOD.D); }
  }
  function post(x) { P1(g, x - 1, T, 5, H - T, K); P1(g, x, T, 1, H - T - 1, WOOD.L); P1(g, x + 1, T, 1, H - T - 1, WOOD.M); P1(g, x + 2, T, 1, H - T - 1, WOOD.D); }
  function drawBin(now) {
    const { x, w, h } = crate, bump = now - S.crateBump < 160 ? 1 : 0, y = crate.y + bump, on = S.lit;
    g.globalAlpha = on ? 1 : 0.4;
    if (on) { wheel('cheddar', x + 2, y - 7); wheel(Wd.whole.gouda > 0 ? 'gouda' : 'cheddar', x + 12, y - 6); }
    // Palé: tablero y tres tacos.
    P1(g, x - 2, H - 4, w + 4, 4, K); P1(g, x - 1, H - 3, w + 2, 1, WOOD.L); for (const tx of [x - 2, x + w / 2 - 2, x + w - 2]) P1(g, tx, H - 2, 4, 1, WOOD.D);
    // Caja: listones, esquineras y la banda lila.
    P1(g, x - 1, y - 1, w + 2, h + 2, K);
    for (let yy = 0; yy < h; yy += 4) { P1(g, x, y + yy, w, 1, WOOD.L); P1(g, x, y + yy + 1, w, 1, WOOD.M); P1(g, x, y + yy + 2, w, 1, WOOD.D); P1(g, x, y + yy + 3, w, 1, '#3a2414'); }
    P1(g, x, y, 2, h, '#5c3a1b'); P1(g, x + w - 2, y, 2, h, '#5c3a1b');
    P1(g, x, y + 5, w, 3, on ? '#9580e6' : '#5a5270'); P1(g, x, y + 5, w, 1, on ? '#c3b4ff' : '#6f6886');
    g.globalAlpha = 1;
  }
  function draw() {
    const now = performance.now();
    run(now);
    g.clearRect(0, 0, LW, H);
    g.globalAlpha = S.dim ? 0.35 : 1;
    // Fondo: tablones verticales con algún nudo.
    P1(g, 3, T + 2, UW - 6, H - T - 4, '#2a1f1b'); for (let x = 14; x < UW - 4; x += 12) { P1(g, x, T + 2, 1, H - T - 4, '#221816'); P1(g, x - 6, T + 9 + (x % 3) * 9, 1, 1, '#1d1412'); }
    for (let r = 0; r < 3; r++) P1(g, 3, T + 16 + 16 * r - 1, UW - 6, 1, '#1a1210');
    // Lo que entra rodando va por detrás de lo que ya está.
    for (let col = 0; col < per; col++) for (let r = 0; r < 3; r++) {
      const w = S.grid[col][r]; if (!w || !w.rolling) continue;
      const q = Math.min(1, (now - w.t0) / w.dur), x = w.from + (sx(col) - w.from) * easeOut(q), y = sy(r) - (Math.floor(x / 4) % 2);
      if (q >= 1) { w.rolling = false; w.land = true; w.t0 = now - 999; S.dips[col + ':' + r] = now; S.fx.push({ kind: 'dust', x: sx(col) + 7, y: sy(r) + 12, t0: now }); }
      else wheel(w.b, x, y, 0.92);
    }
    for (let col = 0; col < per; col++) for (let r = 0; r < 3; r++) {
      const w = S.grid[col][r]; if (!w || w.rolling) continue; const x = sx(col), y = sy(r);
      const dip = now - (S.dips[col + ':' + r] || 0) < 110 ? 1 : 0;
      if (w.out) { const q = Math.min(1, (now - w.out) / 260); wheel(w.b, x, y - 2 - 5 * easeOut(q), 1 - q); continue; }
      if (now < w.t0) continue;
      const q = Math.min(1, (now - w.t0) / 200); if (q < 1) { wheel(w.b, x, y - 4 * (1 - q * q), Math.min(1, q * 3)); continue; }
      P1(g, x + 1, y + 13, 13, 1, '#1a1210');
      wheel(w.b, x, y + dip, 1, dip);
    }
    board(0, T, UW);
    for (let r = 0; r < 3; r++) { let dc; for (const k in S.dips) { const [cc, rr] = k.split(':').map(Number); if (rr === r && now - S.dips[k] < 110) dc = cc; } board(3, T + 16 + 16 * (2 - r), UW - 6, dc); }
    post(0); post(UW - 3);
    g.globalAlpha = 1;
    drawBin(now);
    // Al mayorista: cae sobre la estantería, rueda hasta el borde, cae en la caja y suelta su moneda partida.
    for (const o of S.rolls) {
      const t = (now - o.t0) / 1000, top = T - 13, sx0 = UW - 48;
      let x, y, a = 1, sq = 0;
      if (t < 0.22) { x = sx0; y = top - 10 * (1 - (t / 0.22) ** 2); a = Math.min(1, t / 0.08); }
      else if (t < 0.4) { x = sx0; y = top; sq = t < 0.3 ? 1 : 0; if (!o.l1) { o.l1 = 1; S.fx.push({ kind: 'dust', x: sx0 + 7, y: T - 1, t0: now }); } }
      else if (t < 0.85) { const u = (t - 0.4) / 0.45; x = sx0 + (UW - 6 - sx0) * u; y = top - (Math.floor(x / 4) % 2); }
      else if (t < 1.15) { const u = (t - 0.85) / 0.3; x = UW - 6 + (crate.x + 6 - (UW - 6)) * u; y = top + (crate.y - 10 - top) * u * u; }
      else if (!o.in) { o.in = 1; S.crateBump = now; if (S.onWholesale) S.onWholesale(); }
      if (t < 1.15) wheel(o.b, x, y, a, sq);
    }
    S.rolls = S.rolls.filter((o) => now - o.t0 < 1200);
    // Monedas: la venta suelta una de oro que sube girando; la del mayorista se parte y solo media sube.
    for (const f of S.fx) {
      if (now < f.t0) continue; const k = (now - f.t0) / (f.kind === 'dust' ? 240 : 760); if (k > 1) continue;
      if (f.kind === 'dust') { g.globalAlpha = 0.8 * (1 - k); P1(g, f.x - 6 - 3 * k, f.y - k, 1, 1, '#d8ccb0'); P1(g, f.x + 6 + 3 * k, f.y - k, 1, 1, '#d8ccb0'); g.globalAlpha = 1; continue; }
      const a = 1 - Math.max(0, (k - 0.7) / 0.3);
      if (f.kind === 'coin') {
        const y = f.y - 14 * easeOut(k), fr = [0, 1, 2, 1][Math.floor((now - f.t0) / 80) % 4];
        g.globalAlpha = a; drawRows(g, COIN_F[fr], f.x, y, COIN_PAL); g.globalAlpha = 1;
        if (k > 0.45 && k < 0.6) { P1(g, f.x + 7, y - 1, 1, 1, '#ffffff'); P1(g, f.x + 8, y - 2, 1, 1, '#fff0a0'); }
        continue;
      }
      // split: entera hasta el 35 %; después, las dos mitades se separan.
      const y = f.y - 8 * easeOut(Math.min(1, k / 0.35));
      if (k < 0.35) { drawRows(g, COIN_F[0], f.x, y, COIN_PAL); continue; }
      const u = (k - 0.35) / 0.65;
      g.globalAlpha = a; drawRows(g, COIN_F[0], f.x - 2 * u, y - 10 * easeOut(u), COIN_PAL, (i) => i < 4); g.globalAlpha = 1;
      g.globalAlpha = (1 - u) * 0.8; drawRows(g, COIN_F[0], f.x + 1 + 2 * u, y + 6 * u * u, { k: '#4e3f8a', H: '#c3b4ff', W: '#c3b4ff', G: '#a594ee', D: '#8a76d8' }, (i) => i >= 4); g.globalAlpha = 1;
    }
    S.fx = S.fx.filter((f) => now < f.t0 || now - f.t0 < (f.kind === 'dust' ? 240 : 760));
  }
  const iv = setInterval(() => { if (!c.isConnected) return S.stop(); draw(); }, 33);
  S.stop = () => { S.alive = false; clearInterval(iv); };
  S.layout = layout; S.target = target; S.filled = () => S.grid.flat().filter(Boolean).length;
  layout(performance.now());
  return S;
}
function renderShop() {
  const st = stock(), full = isFull(), m = measuring();
  const top = el('div', 'box sp-top');
  top.innerHTML = `<div class="mx-sp-num"><span class="mx-l"><small class="mx-k">CHEESE ON THE SHELVES</small><span class="mx-v"><b class="mx-pn-roll"></b><span>of ${fmt(Wd.shelf)}<em class="mx-pc">${Wd.shelf ? ' · ' + Math.min(100, Math.round((st / Wd.shelf) * 100)) + '%' : ''}</em></span></span></span></div><div class="mx-sp-shelf"></div><p class="mx-sp-sub">${Wd.shop ? 'Shelves hold about ' + B.shop.shelfMinutes + ' minutes of sales: ' + fmt(Wd.shelf) + ' cheese.' : 'Shelves hold about 3 minutes of sales: 0 cheese.'}</p>`;
  body.appendChild(top);
  rollTo(top.querySelector('.mx-v b'), st); E.stock = top.querySelector('.mx-v b'); E.pc = top.querySelector('.mx-pc');
  const holder = top.querySelector('.mx-sp-shelf');
  SHELF = Shelf(holder);
  // Cartel FULL de pie sobre la estantería y el rótulo del mayorista bajo su caja (fuera del lienzo: texto nítido).
  const sign = el('span', 'sp-full', '<b>FULL</b><i></i>'); sign.style.left = '44px'; sign.style.top = '2px'; sign.hidden = true; holder.appendChild(sign); E.sign = sign;
  const ws = el('span', 'sp-wsl off', 'WHOLESALE'); ws.style.left = (SHELF.crate.x * 2 - 4) + 'px'; ws.style.width = (SHELF.crate.w * 2 + 8) + 'px'; holder.appendChild(ws); E.wsl = ws;
  // La etiqueta de rebaja, colgada de la caja: el mensaje es el descuento, no «media unidad».
  const off = el('span', 'sp-off off', '-50%'); off.style.left = (SHELF.crate.x * 2 + SHELF.crate.w - 32) + 'px'; off.style.top = (SHELF.crate.y * 2 + 2) + 'px'; holder.appendChild(off); E.off = off;
  // Cada sobrante que entra: la etiqueta se estampa y sube una moneda con «-50%» (vendido con descuento).
  SHELF.onWholesale = () => {
    if (reduced) return;
    off.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', filter: 'brightness(1.3)', offset: 0.35 }, { transform: 'scale(.96)', offset: 0.7 }, { transform: 'none' }], { duration: 380, easing: EASE });
    const f = el('span', 'sp-offf', coinI(12) + '<b>-50%</b>'); f.style.left = (SHELF.crate.x * 2 + 6) + 'px'; f.style.top = (SHELF.crate.y * 2 - 18) + 'px'; holder.appendChild(f);
    f.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none', offset: 0.2 }, { opacity: 1, transform: 'translateY(-14px)', offset: 0.75 }, { opacity: 0, transform: 'translateY(-20px)' }], { duration: 1100, easing: 'ease-out' }).onfinish = () => f.remove();
    setTimeout(() => f.remove(), 1300);
  };
  setFull(full, false);
  const stats = el('div', 'sp-stats');
  const sold = sum(Wd.sold), whole = sum(Wd.whole);
  const stat = (k, v, cls = '') => `<div class="mx-box mx-sp-st ${cls ? 'mx-' + cls : ''}"><small>${k}</small>${m && k !== 'CAN SELL' ? '<b class="mx-pn-dots"></b><span>measuring</span>' : `<b>${fmt(Math.round(v))}</b><span>${k === 'WHOLESALE' && v > 0.5 ? 'per minute, 50% off' : 'per minute'}</span>`}</div>`;
  stats.innerHTML = stat('CAN SELL', Wd.can, Wd.can ? '' : 'zero') + stat('SOLD', sold, sold || m ? '' : 'zero') + stat('WHOLESALE', whole, whole > 0.5 && !m ? 'w' : m ? '' : 'zero');
  body.appendChild(stats); E.stats = stats;
  body.appendChild(el('p', 'sp-when', m ? 'Measuring: open it again in a moment for real numbers.' : 'Real sales in the last ' + SPAN() + '.'));
  const h = el('div', 'pn-h'); h.innerHTML = '<b>BY CHEESE</b><small>share of the shelves</small>'; body.appendChild(h);
  const rows = el('div', 'pt-list');
  for (const b of Wd.rocks) {
    const n = lotsOf(b), sn = Wd.sold[b] || 0, wn = Wd.whole[b] || 0;
    const r = el('div', 'box sp-row' + (n > 0 ? '' : ' z'));
    const sub = m ? '<span class="mx-pn-dots">measuring</span>' : 'sells ' + perMin(sn) + (wn > 0.5 ? ' · <span class="mx-pn-ws">wholesale ' + perMin(wn) + '</span>' : '');
    r.innerHTML = `<img class="pix" src="${src('lot', b)}" alt="" style="width:22px;height:19px"><span class="mx-t"><b>${BN(b)}</b><i class="mx-pn-bar"><i class="mx-c" style="width:0%"></i></i><small>${sub}</small></span><span class="mx-r"><b>${fmt(n)}</b><small>on the shelves</small></span>`;
    rows.appendChild(r);
    const bar = r.querySelector('.mx-pn-bar i'); setTimeout(() => (bar.style.width = (st ? Math.round((n / st) * 100) : 0) + '%'), reduced ? 0 : 120);
  }
  body.appendChild(rows);
  const how = el('div', 'box sp-how');
  const line = (ic, t) => { const p = el('p'); p.appendChild(ic); p.appendChild(el('span', '', t)); return p; };
  how.append(line(pimg('assets/main2/out/sprites/ic_coin.png', 14, 14), 'The shop sells <b>the dearest cheese first</b>.'),
    line(el('span', 'sp-off sm', '-50%'), 'When the shelves are full, <b class="mx-pn-ws">the wholesaler takes the extra at half price</b>, cheapest first: nothing is lost and nothing piles up for ever.'),
    line(copyC(icGem(), 1.5), 'A faster trader (or a boost on the shop) <b>sells more at full price</b>.'));
  body.appendChild(how);
  const btn = el('div', 'act pn-btn'); btn.append(copyC(icPantry(), 1), el('span', '', 'FULL PANTRY')); btn.onclick = () => { press(btn); setTimeout(() => CM.ui.openPanel('stock'), 160); };
  body.appendChild(btn);
}
// FULL: el cartel sale de detrás de la balda de arriba; la caja del mayorista y su rótulo se encienden.
function setFull(on, anim = true) {
  if (!SHELF) return;
  SHELF.full = on; SHELF.lit = on && sum(Wd.whole) > 0;
  E.sign.hidden = !on; E.wsl.classList.toggle('mx-off', !SHELF.lit); E.off.classList.toggle('mx-off', !SHELF.lit);
  if (on && anim && !reduced) {
    E.sign.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(22px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'translateY(-3px)', offset: 0.6 }, { transform: 'translateY(1px)', offset: 0.8 }, { transform: 'none' }], { duration: 620, easing: EASE });
    E.wsl.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 300, easing: EASE, fill: 'backwards' });
    E.off.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1.2)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 420, delay: 420, easing: SPRING, fill: 'backwards' });
  }
}
// ---------- COINS ----------
function renderCoins() {
  const m = measuring();
  const rows = Wd.rocks.map((b) => { const [c, w] = Wd.coins[b] || [0, 0]; return { b, c, w, t: c + w }; });
  const fromRocks = rows.reduce((a, x) => a + x.t, 0), coinsMin = fromRocks + (Wd.other || 0), total = Math.max(coinsMin, fromRocks);
  const shelves = rows.reduce((a, x) => a + x.c, 0), whole = rows.reduce((a, x) => a + x.w, 0);
  const top = el('div', 'box cn-top');
  top.innerHTML = `<small class="mx-k">COINS PER MINUTE</small><div class="mx-cn-big"><img class="pix" src="assets/main2/out/sprites/ic_coin.png" alt="" style="width:32px;height:32px"><b class="mx-pn-roll${coinsMin || m ? '' : ' mx-off'}"></b></div>` +
    `<div class="mx-cn-split"><i class="mx-pn-bar"><i class="mx-g" style="width:0%"></i><i class="mx-w" style="width:0%"></i></i><div class="mx-k"><span class="mx-pn-key"><i></i>shelves ${m ? '…' : pct(total ? (shelves / total) * 100 : 0)}</span><span class="mx-pn-key mx-w"><i></i>wholesale, half price ${m ? '…' : pct(total ? (whole / total) * 100 : 0)}</span></div></div>` +
    `<p class="mx-cn-when">${m ? 'Measuring: open it again in a moment for real numbers.' : 'Real sales in the last ' + SPAN() + '.'}</p>`;
  body.appendChild(top);
  const big = top.querySelector('.mx-cn-big b'); E.big = big;
  if (m) { big.classList.add('mx-pn-dots'); big.style.color = 'var(--muted)'; big.style.textShadow = 'none'; } else { big._v = 0; rollTo(big, coinsMin, (v) => fmt(v)); }
  const sb = top.querySelectorAll('.mx-cn-split i i'), keys = top.querySelectorAll('.mx-cn-split .mx-k span');
  E.split = (rs, tot) => { const sh = rs.reduce((a2, x) => a2 + x.c, 0), wh = rs.reduce((a2, x) => a2 + x.w, 0); sb[0].style.width = (sh / tot) * 100 + '%'; sb[1].style.left = (sh / tot) * 100 + '%'; sb[1].style.width = (wh / tot) * 100 + '%'; keys[0].lastChild.textContent = 'shelves ' + pct((sh / tot) * 100); keys[1].lastChild.textContent = 'wholesale, half price ' + pct((wh / tot) * 100); rollTo(big, sh + wh + (Wd.other || 0)); };
  setTimeout(() => { if (m || !total) return; sb[0].style.width = (shelves / total) * 100 + '%'; sb[1].style.left = (shelves / total) * 100 + '%'; sb[1].style.width = (whole / total) * 100 + '%'; }, reduced ? 0 : 100);
  const h = el('div', 'pn-h'); h.innerHTML = '<b>BY CHEESE</b><small>coins per minute · share</small>'; body.appendChild(h);
  const list = el('div', 'cn-list'); E.clist = list; body.appendChild(list);
  E.crows = {};
  for (const x of rows) { const r = el('div', 'box cn-row'); r.dataset.b = x.b; list.appendChild(r); E.crows[x.b] = r; }
  paintCoins(true);
  if (Wd.other > total * 0.01) { const o = el('p', 'cn-other', `${coinI(12)}<span>Another ${perMin(Wd.other)} came from elsewhere (rewards, lab samples).</span>`); body.appendChild(o); }
  body.appendChild(el('p', 'pn-hint', 'These are coins really paid by customers, after every bonus. A cheese that does not sell earns nothing here, however much you make.'));
}
// Pinta (o repinta) las filas y las ordena por ingresos; si cambia el orden, cada fila se desliza a su nuevo sitio.
function paintCoins(first = false) {
  const m = measuring();
  const rows = Wd.rocks.map((b) => { const [c, w] = Wd.coins[b] || [0, 0]; return { b, c, w, t: c + w }; });
  const total = Math.max(rows.reduce((a, x) => a + x.t, 0) + (Wd.other || 0), 1e-9);
  rows.sort((a, b) => b.t - a.t);
  const before = {}; if (!first && !reduced) for (const x of rows) before[x.b] = E.crows[x.b].getBoundingClientRect().top;
  const oldTop = E.clist.firstElementChild && E.clist.firstElementChild.dataset.b;
  rows.forEach((x, i) => {
    const r = E.crows[x.b], top = i === 0 && x.t > 0 && !m, z = x.t <= 0 && !m;
    r.className = 'mx-box mx-cn-row' + (top ? ' mx-top' : '') + (z ? ' mx-z' : '');
    const p = (x.t / total) * 100;
    if (!r.firstChild) r.innerHTML = `<span class="mx-rk"></span><img class="pix" src="${src('lot', x.b)}" alt="" style="width:22px;height:19px"><span class="mx-t"><b>${BN(x.b)}</b><i class="mx-pn-bar"><i class="mx-g" style="width:0%"></i><i class="mx-w" style="width:0%"></i></i><small></small></span><span class="mx-r"><b class="mx-pn-roll"></b><small></small></span>`;
    const rk = r.querySelector('.mx-rk'); rk.replaceChildren();
    // La medalla, a 1,5× (la escala de los iconos de queso de la fila), centrada en el hueco del puesto.
    if (top) rk.appendChild(copyC(icMedal(), 1.5)); else rk.textContent = m || z ? '' : String(i + 1);
    const [bg, bw] = r.querySelectorAll('.mx-pn-bar i');
    setTimeout(() => { bg.style.width = (m ? 0 : (x.c / total) * 100) + '%'; bw.style.left = (m ? 0 : (x.c / total) * 100) + '%'; bw.style.width = (m ? 0 : (x.w / total) * 100) + '%'; }, first && !reduced ? 140 + i * 50 : 0);
    r.querySelector('.mx-t small').innerHTML = m ? '<span class="mx-pn-dots">measuring</span>' : z ? 'nothing sold' : x.w > 0.5 ? 'shelves ' + perMin(x.c) + ' · <span class="mx-pn-ws">wholesale ' + perMin(x.w) + '</span>' : 'all at full price';
    const rv = r.querySelector('.mx-r b'), rp = r.querySelector('.mx-r small');
    if (m) { rv.textContent = '…'; rp.textContent = ''; } else if (z) { rv.textContent = '—'; rp.textContent = ''; } else { if (first) rv._v = 0; rollTo(rv, x.t); rp.textContent = pct(p); }
    E.clist.appendChild(r);
  });
  // Cambio de puesto: cada fila se desliza a su sitio (520 ms); la que sube va por encima y algo más clara; los números
  // de puesto aparecen al llegar. La medalla baja a la nueva primera y destella una sola vez.
  if (!first && !reduced) for (const x of rows) {
    const r = E.crows[x.b], d = before[x.b] - r.getBoundingClientRect().top; if (!d) continue;
    r.style.position = 'relative'; r.style.zIndex = d > 0 ? 2 : 1;
    r.animate([{ transform: `translateY(${d}px)`, filter: d > 0 ? 'brightness(1.15)' : 'none' }, { transform: 'none', filter: 'none' }], { duration: 520, easing: EASE }).onfinish = () => (r.style.zIndex = '');
    const rk = r.querySelector('.mx-rk'); rk.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 640 });
  }
  const nt = E.clist.firstElementChild.dataset.b;
  if (!first && oldTop && nt !== oldTop && !reduced) { const md = E.crows[nt].querySelector('.mx-rk canvas'); if (md) md.animate([{ transform: 'translateY(-8px)', opacity: 0, filter: 'none' }, { transform: 'translateY(-8px)', opacity: 0, offset: 0.55 }, { transform: 'translateY(1px)', opacity: 1, filter: 'brightness(1.9)', offset: 0.82 }, { transform: 'none', opacity: 1, filter: 'none' }], { duration: 760, easing: EASE }); }
  // Cambio de ingresos: la barra se alarga o se acorta con el borde iluminado un momento; la cifra rueda.
  if (!first) for (const x of rows) { const r = E.crows[x.b]; if (r._t !== undefined && Math.abs(r._t - x.t) > 0.01 * Math.max(r._t, x.t)) { r.classList.add('mx-chg'); clearTimeout(r._ct); r._ct = setTimeout(() => r.classList.remove('mx-chg'), 900); } r._t = x.t; }
  else for (const x of rows) E.crows[x.b]._t = x.t;
  if (!first && E.split) E.split(rows, total);
}


  // ---- PANTRY con el juego: las recetas por id (los nombres se pueden cambiar) ----
  function paintMats() {
    const H = window.H, list = H.Inv.list(H.G).materials, bps = Object.keys(H.G.lab.blueprints || {}).filter((k) => H.G.lab.blueprints[k]);
    const key = list.map((m) => m.id + ':' + Math.floor(m.n)).join() + '|' + bps.join();
    if (E.mats._k === key) return; E.mats._k = key;
    E.mats.replaceChildren();
    if (!list.length && !bps.length) { const e = el('div', 'box pt-empty'); e.append(pimg(src('raw', Wd.inv.tier), 22, 19), el('span', '', 'None yet: every vein you open gives one of its stone.')); E.mats.appendChild(e); return; }
    for (const m of list) {
      const row = el('div', 'box pt-row pt-mat'); row.dataset.act = 'item:' + m.id; row.setAttribute('role', 'button');
      row.innerHTML = '<img class="pix" src="' + src('raw', m.id) + '" alt="" style="width:22px;height:19px"><span class="mx-t"><b></b><small>found in its veins</small></span><span class="mx-q">' + fmt(m.n) + '</span>';
      row.querySelector('b').textContent = m.name; E.mats.appendChild(row);
    }
    for (const id of bps) {
      const row = el('div', 'box pt-row'); row.innerHTML = '<img class="pix" src="assets/main2/out/sprites/ic_flask.png" alt="" style="width:18px;height:20px"><span class="mx-t"><b></b><small>blueprint, drawn in the lab</small></span><span class="mx-q">1</span>';
      row.querySelector('b').textContent = H.pretty(id); E.mats.appendChild(row);
    }
  }
  function renderPantry() {
    body.appendChild(el('p', 'pn-hint', 'What the chain has waiting for its next stage. Nothing has a limit except the shop shelves.'));
    const racks = el('div', 'box pt-racks');
    const head = el('div', 'pt-g pt-head'); head.innerHTML = '<span></span><span>RAW</span><span class="mx-pt-arr"></span><span>BASE</span><span class="mx-pt-arr"></span><span>CHEESE</span>'; racks.appendChild(head);
    E.cells = {};
    {
      const t = Wd.inv.tier, r = el('div', 'pt-g pt-rack'); r.appendChild(el('span', 'pt-rock', BN(t)));
      const cs = [rackCell('raw', t, Wd.inv.raw), rackCell('base', t, Wd.inv.base), rackCell('lot', t, stock())];
      r.append(cs[0], arrowEl(), cs[1], arrowEl(), cs[2]); E.cells = cs; racks.appendChild(r);
    }
    body.appendChild(racks);
    // Materiales y planos: de dónde vienen y para qué sirven, en su ficha (un toque).
    E.mats = el('div', 'pt-list'); const mh = el('div', 'pn-h'); mh.innerHTML = '<b>MATERIALS</b><small>tap one to see where it comes from</small>'; E.matH = mh;
    body.append(mh, E.mats); paintMats();
    const list = known().sort((a, b) => price(b) - price(a));
    const inStock = list.filter((r) => Wd.lots[r.id] > 0), zero = list.filter((r) => !(Wd.lots[r.id] > 0));
    const worth = inStock.reduce((a, r) => a + Wd.lots[r.id] * price(r), 0);
    const h = el('div', 'pn-h'); h.innerHTML = '<b>CHEESE IN STOCK</b><small>' + (worth ? 'worth ' + coinI(11) + ' <span class="mx-pn-roll" style="color:var(--gold);font-weight:800"></span>' : 'from the Cheesery, sold in the Shop') + '</small>';
    E.worth = h.querySelector('.mx-pn-roll'); if (E.worth) rollTo(E.worth, worth);
    body.appendChild(h); E.worthH = h;
    const box = el('div', 'pt-list'); E.list = box; body.appendChild(box);
    if (!list.length) { const e = el('div', 'box pt-empty'); e.append(pimg(src('lot', 'cheddar'), 22, 19), el('span', '', 'No recipes yet.')); box.appendChild(e); return; }
    if (!inStock.length) { const e = el('div', 'box pt-empty'); e.append(pimg(src('lot', Wd.rocks[0]), 22, 19), el('span', '', 'No cheese waiting: the shop sells it as soon as it is made.')); box.appendChild(e); }
    for (const r of inStock) box.appendChild(stockRow(r));
    const z = el('div', 'box pt-zero'); z.innerHTML = '<span class="mx-pt-chev-w"></span><span class="mx-t"><b>NO CHEESE IN STOCK</b><small>Known recipes, none waiting now</small></span><em><span class="mx-n mx-pn-roll">' + zero.length + '</span> RECIPES</em>';
    z.querySelector('.mx-pt-chev-w').appendChild(Object.assign(copyC(chevR(), 2), { className: 'pix mx-pt-chev' }));
    const wrap = el('div', 'pt-zl'), inner = el('div'); wrap.appendChild(inner);
    E.zero = z; E.zeroN = z.querySelector('.mx-n'); E.zeroN._v = zero.length; E.zl = inner; E.zlw = wrap;
    z.onclick = () => { zeroOpen = !E.zero.classList.contains('mx-open'); toggleZero(zeroOpen); };
    z.hidden = wrap.hidden = !zero.length;
    body.append(z, wrap);
    if (zeroOpen && zero.length) { zeroRows(); E.zero.classList.add('mx-open'); E.zlw.classList.add('mx-open'); }
    E.sorted = el('p', 'pn-hint', 'Sorted by price, dearest first: the shop sells them in that order.'); E.sorted.hidden = !inStock.length;
    body.appendChild(E.sorted);
  }
  let zeroOpen = false;
  function stockRow(r) {
    const row = el('div', 'box pt-row'); row.dataset.id = r.id;
    row.innerHTML = '<img class="pix" src="' + src('lot', r.b) + '" alt="" style="width:22px;height:19px"><span class="mx-t"><b></b><small>sells for ' + coinI(10) + '<u>' + fmt(price(r)) + '</u> each</small></span><span class="mx-q mx-pn-roll"></span>';
    row.querySelector('b').textContent = r.name;
    rollTo(row.querySelector('.mx-q'), Wd.lots[r.id]);
    return row;
  }
  function zeroRows() {
    const list = known().filter((r) => !(Wd.lots[r.id] > 0)).sort((a, b) => BV(b.b) - BV(a.b) || price(b) - price(a));
    E.zl.replaceChildren();
    let last = '';
    for (const r of list) {
      if (r.b !== last) { last = r.b; E.zl.appendChild(el('div', 'pt-zcap', BN(r.b).toUpperCase())); }
      const z = el('div', 'pt-zr'); z.innerHTML = '<img class="pix" src="' + src('lot', r.b) + '" alt="" style="width:15px;height:13px"><span></span><small>' + coinI(9) + fmt(price(r)) + '</small>'; z.querySelector('span').textContent = r.name; E.zl.appendChild(z);
    }
  }
  // Un queso se agota: su fila se recoge y el contador de los que están a cero sube.
  function sellOut(id) {
    const row = E.list && E.list.querySelector('[data-id="' + id + '"]'); if (!row || row._going) return;
    row._going = 1;
    const gen = GEN, done = () => { if (gen !== GEN) return; row.remove(); bumpZero(+1); if (E.zl && E.zl.children.length) zeroRows(); fixEmpty(); };
    if (reduced) return done();
    rollTo(row.querySelector('.mx-q'), 0);
    setTimeout(() => { const h = row.offsetHeight; row.style.overflow = 'hidden'; row.animate([{ opacity: 1, height: h + 'px' }, { opacity: 0, height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '-4px' }], { duration: 300, easing: EASE, fill: 'forwards' }); setTimeout(done, 310); }, 520);
  }
  // Un queso vuelve a tener existencias: su fila entra en su sitio (por precio) y el contador baja.
  function restock(r) {
    const rows = [...E.list.querySelectorAll('.mx-pt-row')], row = stockRow(r);
    const after = rows.find((x) => { const o = Wd.recs.find((c) => String(c.id) === x.dataset.id); return o && price(o) < price(r); });
    const emp = E.list.querySelector('.mx-pt-empty'); if (emp) emp.remove();
    E.list.insertBefore(row, after || null);
    bumpZero(-1); if (E.zl && E.zl.children.length) zeroRows(); fixEmpty();
    if (!reduced) { row.animate([{ opacity: 0, transform: 'translateY(-6px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: SPRING }); row.animate([{ boxShadow: 'inset 0 0 0 2px #ffffff66' }, { boxShadow: 'inset 0 0 0 2px #ffffff00' }], { duration: 700, easing: EASE }); }
  }
  function fixEmpty() {
    const any = E.list.querySelector('.mx-pt-row:not([style*="overflow"])');
    if (E.sorted) E.sorted.hidden = !any;
    if (E.zero) { const n = E.zeroN._t !== undefined ? E.zeroN._t : E.zeroN._v; E.zero.hidden = E.zlw.hidden = !n; }
  }
  function livePantry() {
    const prev = Wd; Wd = world();
    if (E.cells) { E.cells[0]._set(Wd.inv.raw); E.cells[1]._set(Wd.inv.base); E.cells[2]._set(stock()); }
    if (E.mats) paintMats();
    if (!E.list) return;
    for (const r of Wd.recs) {
      const was = prev.lots[r.id] || 0, n = Wd.lots[r.id] || 0;
      if (was > 0 && n <= 0) sellOut(r.id);
      else if (was <= 0 && n > 0) restock(r);
      else if (n > 0) { const q = E.list.querySelector('[data-id="' + r.id + '"] .mx-q'); if (q) rollTo(q, n); }
    }
    if (E.worth) rollTo(E.worth, Wd.recs.reduce((a, r) => a + (Wd.lots[r.id] > 0 ? Wd.lots[r.id] * price(r) : 0), 0));
  }

  // ---- SHOP con el juego: la estantería sigue a lo que hay de verdad (sin ciclo de demostración) ----
  let lastOver = 0, lastTypes = '';
  const typesKey = () => ZN.filter((b) => lotsOf(b) > 0).join(',');
  function statsHtml() {
    const m = measuring(), sold = sum(Wd.sold), whole = sum(Wd.whole);
    const stat = (k, v, c = '') => '<div class="mx-box mx-sp-st ' + (c ? 'mx-' + c : '') + '"><small>' + k + '</small>' + (m && k !== 'CAN SELL' ? '<b class="mx-pn-dots"></b><span>measuring</span>' : '<b>' + fmt(Math.round(v)) + '</b><span>' + (k === 'WHOLESALE' && v > 0.5 ? 'per minute, 50% off' : 'per minute') + '</span>') + '</div>';
    return stat('CAN SELL', Wd.can, Wd.can ? '' : 'zero') + stat('SOLD', sold, sold || m ? '' : 'zero') + stat('WHOLESALE', whole, whole > 0.5 && !m ? 'w' : m ? '' : 'zero');
  }
  function liveShop() {
    Wd = world();
    if (!E.stock || !E.stock.isConnected || !SHELF) return;
    const st = stock(), now = performance.now();
    rollTo(E.stock, st); E.pc.textContent = Wd.shelf ? ' · ' + Math.min(100, Math.round((st / Wd.shelf) * 100)) + '%' : '';
    const tk = typesKey();
    if (tk !== lastTypes) { lastTypes = tk; SHELF.layout(now, false); }
    else if (!SHELF.queue.length && now >= SHELF.busy) {
      const d = SHELF.target() - SHELF.filled();
      if (d > 0) for (let i = 0; i < Math.min(2, d); i++) SHELF.enqueue('restock', 'any', 120);
      else if (d < 0) for (let i = 0; i < Math.min(2, -d); i++) SHELF.enqueue('sale', null, 120);
    }
    const full = isFull();
    if (full !== SHELF.full || (full && SHELF.lit !== sum(Wd.whole) > 0)) setFull(full, full && !SHELF.full);
    if (SHELF.full && SHELF.lit && !SHELF.queue.length && now - lastOver > 4000) { lastOver = now; SHELF.enqueue('over'); }
    const sh = statsHtml(); if (E.stats._h !== sh) { E.stats._h = sh; E.stats.innerHTML = sh; }
    for (const b of Wd.rocks) {
      const r = E.srow && E.srow[b]; if (!r) continue;
      const n = lotsOf(b), sn = Wd.sold[b] || 0, wn = Wd.whole[b] || 0, m = measuring();
      r.classList.toggle('mx-z', !(n > 0));
      r.querySelector('.mx-pn-bar i').style.width = (st ? Math.round((n / st) * 100) : 0) + '%';
      const sub = m ? '<span class="mx-pn-dots">measuring</span>' : 'sells ' + perMin(sn) + (wn > 0.5 ? ' · <span class="mx-pn-ws">wholesale ' + perMin(wn) + '</span>' : '');
      const sm = r.querySelector('.mx-t small'); if (sm._h !== sub) { sm._h = sub; sm.innerHTML = sub; }
      r.querySelector('.mx-r b').textContent = fmt(n);
    }
  }
  function liveCoins() { Wd = world(); if (E.clist && E.clist.isConnected && !measuring()) paintCoins(); }

  // ---- Montaje ----
  const TITLE = { pantry: () => icPantry(), shop: () => icShop(), coins: () => icCoins() };
  function mount(root) {
    for (const c of document.querySelectorAll('#sheet-title canvas[data-pnic]')) { const g = TITLE[c.dataset.pnic](); c.width = g.width; c.height = g.height; c.style.width = g.width * 2 + 'px'; c.style.height = g.height * 2 + 'px'; c.getContext('2d').drawImage(g, 0, 0); }
    const host = root.querySelector('.mx-pn-root'); if (!host) return;
    GEN++; if (SHELF) SHELF.stop(); SHELF = null;
    for (const k in E) delete E[k];
    body = host; Wd = world(); lastTypes = typesKey();
    host.classList.toggle('mx-narrow', document.getElementById('sheet').offsetWidth < 370);
    const scr = host.dataset.pn;
    ({ pantry: renderPantry, shop: renderShop, coins: renderCoins })[scr]();
    if (SHELF) SHELF.auto = false;
    if (scr === 'shop') { E.srow = {}; [...host.querySelectorAll('.mx-sp-row')].forEach((r, i) => (E.srow[Wd.rocks[i]] = r)); E.stats._h = E.stats.innerHTML; }
    // Abrir: las piezas entran de arriba abajo, escalonadas y cortas (solo la primera vez que se abre la hoja).
    const fresh = !mount.last || mount.last !== scr || performance.now() - mount.at > 1500;
    if (fresh && !reduced) [...host.children].slice(0, 9).forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: i * 35, easing: EASE, fill: 'backwards' }));
    mount.last = scr; mount.at = performance.now();
  }
  setInterval(() => {
    const sh = document.getElementById('sheet');
    if (sh.hidden || !body || !body.isConnected) return;
    mount.at = performance.now();
    const scr = body.dataset.pn;
    if (scr === 'pantry') livePantry();
  }, 400);
  setInterval(() => {
    if (document.getElementById('sheet').hidden || !body || !body.isConnected) return;
    if (body.dataset.pn === 'shop') liveShop(); else if (body.dataset.pn === 'coins') liveCoins();
  }, 1000);
  CM.pecon = { mount };
})();
