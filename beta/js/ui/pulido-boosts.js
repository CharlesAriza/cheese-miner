// GENERADO por exploracion/pixel/main2-src/game/build_boosts.py: no editar a mano. BOOSTS aprobado: la gema, su engaste y el
// movimiento vienen copiados del mockup (boosts.html). El estado es siempre el del juego (CM.boosts) y cambia con sus acciones.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = '#1b1220';
  const P1 = (x2, x, y, w, h, c) => { x2.fillStyle = c; x2.fillRect(x, y, w, h); };
  const GLY = {};
  const glyph = (k, rows, pal, ol) => (GLY[k] ||= icon(rows, pal, ol));
  const EASE = 'cubic-bezier(.22,.8,.3,1)', EASE_IN = 'cubic-bezier(.55,0,.8,.35)', SPRING = 'cubic-bezier(.3,1.45,.5,1)';
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
const GEM_ROWS = ['.HHHHH.', 'HWHLLLD', 'LHLLLDD', '.LLLDD.', '..LDD..', '...D...'];
const gemIc = () => glyph('gem', GEM_ROWS, { H: '#9fe6ff', W: '#ffffff', L: '#5ad1ff', D: '#2f8fc0' });
const gemOff = () => glyph('gemoff', GEM_ROWS, { H: '#8aa0b4', W: '#a8b8c8', L: '#6a8098', D: '#46586c' });
const socketIc = () => glyph('socket', ['...ooooo...', '.ooOOOOOoo.', 'oOOkkkkkOOo', 'oOkkssskkOo', 'oOkkssskkOo', 'oOkkkkkkkOo', 'oOOkkkkkOOo', '.ooOOOOOoo.', '...ooooo...'], { o: '#e0b860', O: '#8e6a2a', k: '#1b1626', s: '#2a2338' });
// Vacío, el engaste es latón apagado: así destacan las gemas puestas y la rejilla no se llena de dorado.
const socketDim = () => glyph('socketd', ['...ooooo...', '.ooOOOOOoo.', 'oOOkkkkkOOo', 'oOkkssskkOo', 'oOkkssskkOo', 'oOkkkkkkkOo', 'oOOkkkkkOOo', '.ooOOOOOoo.', '...ooooo...'], { o: '#7a6a4e', O: '#4a3e2a', k: '#17131f', s: '#221c2e' });
// La gema en bruto que se va formando (NEXT BOOST): silueta que se llena desde abajo con el progreso.
function gemGhost(c, k) {
  const g = c.getContext('2d'), rows = GEM_ROWS, H = rows.length, Wd = rows[0].length;
  c.width = Wd + 2; c.height = H + 2; g.clearRect(0, 0, c.width, c.height);
  const filled = Math.round(k * H);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '.') return; const on = y >= H - filled; P1(g, x + 1, y + 1, 1, 1, on ? { H: '#9fe6ff', W: '#ffffff', L: '#5ad1ff', D: '#2f8fc0' }[ch] : '#2a3a4a'); }));
  for (let y = 0; y < H + 2; y++) for (let x = 0; x < Wd + 2; x++) { const inside = (yy, xx) => rows[yy - 1] && rows[yy - 1][xx - 1] && rows[yy - 1][xx - 1] !== '.'; if (!inside(y, x) && (inside(y - 1, x) || inside(y + 1, x) || inside(y, x - 1) || inside(y, x + 1))) P1(g, x, y, 1, 1, K); }
}

  // ---- Montaje en el juego ----
  const B = CM.BALANCE, BO = CM.boosts;
  const st = () => CM.ui.state(), us = () => CM.ui.uiState();
  const ICS = { gem: gemIc, gemoff: gemOff, socket: socketIc, socketd: socketDim };
  function paintIc(c) { const g = ICS[c.dataset.boic](), k = +c.dataset.k || 2; c.width = g.width; c.height = g.height; c.style.width = g.width * k + 'px'; c.style.height = g.height * k + 'px'; c.getContext('2d').drawImage(g, 0, 0); }
  const icC = (name, k = 2) => { const c = document.createElement('canvas'); c.className = 'pix'; c.dataset.boic = name; c.dataset.k = k; paintIc(c); return c; };
  function press(e) { if (!e || reduced) return; if (e._pa) e._pa.cancel(); e._pa = e.animate([{ transform: 'translateY(2px)' }, { transform: 'none' }], { duration: 160, easing: EASE }); }
  function nope(e) { if (!e || reduced) return; if (e._pa) e._pa.cancel(); e._pa = e.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 260, easing: 'ease-in-out' }); }
  const span = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm'; };
  const sheet = () => document.getElementById('sheet');
  const sfxL = () => { let l = sheet().querySelector('.mx-bo-sfx'); if (!l) { l = document.createElement('div'); l.className = 'mx-bo-sfx'; sheet().appendChild(l); } return l; };
  function ptOf(e, dx = 0, dy = 0) { const s = sheet().getBoundingClientRect(), r = e.getBoundingClientRect(); return [r.left - s.left + r.width / 2 + dx, r.top - s.top + r.height / 2 + dy]; }
  const E = { cells: {} };
  const occOf = (key) => { const [sk, z] = key.split(':'), n = BO.at(st(), sk, z), m = us().boSlot || {}; return n >= 2 ? [true, true] : n <= 0 ? [false, false] : (m[key] || 0) === 1 ? [false, true] : [true, false]; };
  const staffed = (key) => { const [sk, z] = key.split(':'); return !!CM.mice.at(st(), sk, z); };

  // Un hueco: engaste de latón con su gema (encendida o apagada) o vacío. Se cambia en su sitio.
  function setGem(s, on, off) {
    s.classList.toggle('mx-on', on); s.classList.toggle('mx-off', !!off);
    const sk = on ? 'socket' : 'socketd', base = s.querySelector(':scope > canvas');
    if (base.dataset.boic !== sk) base.replaceWith(icC(sk));
    let g = s.querySelector('.mx-bo-g');
    if (on && !g) { g = document.createElement('i'); g.className = 'mx-bo-g'; g.style.setProperty('--d', (Math.random() * 4).toFixed(2) + 's'); s.appendChild(g); }
    if (!on && g) { g.remove(); return null; }
    if (g) { const k = off ? 'gemoff' : 'gem', c = g.querySelector('canvas'); if (!c || c.dataset.boic !== k) g.replaceChildren(icC(k)); g.dataset.k = off ? 'off' : 'on'; }
    return g;
  }
  // La cifra de la placa: la anterior sube y se va, la nueva entra desde abajo con un pequeño rebote.
  function swapText(u, t) {
    if ((u._tm ? u._t : u.textContent) === t) return;
    if (u._a) u._a.cancel(); clearTimeout(u._tm); u._tm = 0;
    if (reduced || !u.textContent) { u.textContent = t; if (t && !reduced) u._a = u.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: SPRING }); return; }
    u._a = u.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-5px)' }], { duration: 130, easing: EASE_IN, fill: 'forwards' });
    u._t = t;
    u._tm = setTimeout(() => { u._tm = 0; if (u._a) u._a.cancel(); u.textContent = u._t; u._a = u._t ? u.animate([{ opacity: 0, transform: 'translateY(5px) scale(1.15)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: SPRING }) : null; }, 130);
  }
  function updateCell(key) {
    const c = E.cells[key]; if (!c || !c.isConnected) return;
    const [sk, z] = key.split(':'), n = BO.at(st(), sk, z), on = staffed(key), o = occOf(key), shop = c.classList.contains('mx-bo-shop');
    c.classList.toggle('mx-n1', n === 1); c.classList.toggle('mx-n2', n === 2); c.classList.toggle('mx-off', !on);
    swapText(c.querySelector('u'), n ? (shop ? BO.label(sk, n) : BO.label(sk, n).split(' ')[0]) : '');
    c.querySelectorAll('.mx-bo-slot').forEach((s, i) => setGem(s, o[i], !on));
  }
  // La reserva: un engaste por refuerzo, con gema los libres; FREE y PLACED saltan al cambiar.
  function updateHead(popCount, shown) {
    const tray = E.tray; if (!tray || !tray.isConnected) return;
    const s = st(), owned = BO.owned(s), free = shown === undefined ? BO.free(s) : shown;
    const none = tray.querySelector('.mx-bo-none'); if (none) none.remove();
    while (tray.children.length < owned) { const sl = document.createElement('span'); sl.className = 'mx-bo-slot'; sl.dataset.w = 'tray'; sl.appendChild(icC('socketd')); tray.appendChild(sl); }
    [...tray.children].forEach((sl, i) => setGem(sl, i < free, false));
    E.head.querySelector('.mx-bo-tray').classList.toggle('mx-has', free > 0);
    const [fb, pb] = E.head.querySelectorAll('.mx-bo-cnt b');
    const pop = (b, v) => { if (b.textContent === String(v)) return; b.textContent = v; if (popCount && !reduced) b.animate([{ transform: 'scale(1.4)' }, { transform: 'none' }], { duration: 300, easing: SPRING }); };
    pop(fb, free); pop(pb, owned - free);
    balanceTray();
    if (E.back) E.back.hidden = owned - free <= 0;
  }
  // La reserva se reparte en filas iguales (8 caben 7 + 1: se ponen 4 + 4), con el mismo engaste y el mismo hueco.
  function balanceTray() {
    const t = E.tray; if (!t || !t.isConnected) return;
    const n = t.querySelectorAll('.mx-bo-slot').length; if (!n) return;
    t.style.display = ''; t.style.gridTemplateColumns = '';
    const per = Math.max(1, Math.floor((t.clientWidth + 4) / 30)), rows = Math.ceil(n / per), cols = Math.ceil(n / rows);
    if (rows > 1) { t.style.display = 'grid'; t.style.gridTemplateColumns = 'repeat(' + cols + ', 26px)'; }
  }
  const seat = (g, from = 'translateY(-4px) scale(1.12)') => { if (!g || reduced) return; g.animate([{ transform: from }, { transform: 'translateY(1px) scale(.94)', offset: 0.62 }, { transform: 'none' }], { duration: 300, easing: EASE }); };
  const FLY = [];
  const easeIO = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
  function flyGem(from, to, o, done) {
    if (reduced || !from || !to || !from.isConnected || !to.isConnected) return done();
    const [x0, y0] = ptOf(from, 0, o.fromDy || 0), [x1, y1] = ptOf(to, 0, o.toDy || 0);
    const g = icC('gem'); g.className = 'pix mx-bo-fly'; g.style.left = x0 - 9 + 'px'; g.style.top = y0 - 8 + 'px'; sfxL().appendChild(g);
    const dx = x1 - x0, dy = y1 - y0, lift = Math.min(54, 22 + Math.hypot(dx, dy) * 0.12), kf = [], N = 14, s0 = o.s0 || 1.12, s1 = o.s1 || 1.12;
    for (let i = 0; i <= N; i++) { const k = i / N, e = easeIO(k), sc = s0 + (s1 - s0) * k + 0.12 * Math.sin(Math.PI * k); kf.push({ transform: `translate(${(dx * e).toFixed(1)}px,${(dy * e - lift * 4 * e * (1 - e)).toFixed(1)}px) rotate(${(o.out ? 8 : -10) * (1 - k)}deg) scale(${sc.toFixed(3)})` }); }
    const ms = o.ms || 460, a = g.animate(kf, { duration: ms, easing: 'linear', fill: 'forwards' });
    FLY.push(a);
    // El final lo marca un temporizador, no la animación (si la página no se pinta, el estado no se queda a medias).
    setTimeout(() => { g.remove(); FLY.splice(FLY.indexOf(a), 1); done(); }, ms);
  }
  // Tocar un engaste: el estado cambia en el mismo toque con la acción del juego (nunca se reparte un refuerzo dos veces) y
  // la animación va detrás. PEND cuenta las gemas en movimiento: como mucho tres.
  let PEND = 0;
  function tapSlot(key, i, slot) {
    if (slot.dataset.busy || PEND >= 3) return nope(slot);
    const [sk, z] = key.split(':'), o = occOf(key), s = st(), free0 = BO.free(s);
    if (!o[i] && free0 <= 0) {
      CM.ui.quiet('boslot', sk, z, i); // el juego dice por qué (No free boost: take one off another post first)
      nope(slot);
      if (E.tray && !reduced) E.tray.parentElement.animate([{ boxShadow: 'inset 0 0 0 2px #ff6a5a' }, { boxShadow: 'inset 0 0 0 2px #ff6a5a00' }], { duration: 700, easing: EASE });
      return;
    }
    const r = CM.ui.quiet('boslot', sk, z, i);
    if (!r || r.ok === false) return nope(slot);
    if (o[i]) {
      // Quitar ESTE: se levanta de su engaste y vuelve a la reserva.
      const to = free0; slot.dataset.busy = 1; PEND++;
      const gem = slot.querySelector('.mx-bo-g');
      if (gem && !reduced) gem.animate([{ transform: 'none' }, { transform: 'translateY(-6px) scale(1.12)' }], { duration: 160, easing: EASE, fill: 'forwards' });
      setTimeout(() => {
        flyGem(slot, E.tray && E.tray.children[to], { fromDy: -6, toDy: -3, out: true, ms: 420, s0: 1.12, s1: 1.1 }, () => {
          PEND--; updateHead(true);
          const t = E.tray && E.tray.children[to]; seat(t && t.querySelector('.mx-bo-g'), 'translateY(-3px) scale(1.1)');
        });
        updateCell(key);
        if (!reduced && E.cells[key]) E.cells[key].animate([{ transform: 'translateY(-1px)' }, { transform: 'none' }], { duration: 240, easing: EASE });
        delete slot.dataset.busy;
      }, reduced ? 0 : 160);
      return;
    }
    // Poner: la última gema libre se levanta de la reserva, vuela, baja sobre el engaste, aprieta y asienta.
    const src = E.tray && E.tray.children[free0 - 1], sg = src && src.querySelector('.mx-bo-g');
    slot.dataset.busy = 1; PEND++;
    if (sg && !reduced) sg.animate([{ transform: 'none' }, { transform: 'translateY(-3px) scale(1.12)' }], { duration: 120, easing: EASE, fill: 'forwards' });
    setTimeout(() => {
      updateHead(true);
      flyGem(src, slot, { fromDy: -3, toDy: -4, ms: 460 }, () => {
        PEND--; updateCell(key); delete slot.dataset.busy;
        const c = E.cells[key]; if (!c || !c.isConnected) return;
        const s2 = c.querySelectorAll('.mx-bo-slot')[i], g = s2 && s2.querySelector('.mx-bo-g');
        seat(g);
        if (reduced || !s2) return;
        s2.querySelector(':scope > canvas').animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2.1)', offset: 0.45 }, { filter: 'brightness(1)' }], { duration: 420, easing: EASE });
        c.animate([{ transform: 'none' }, { transform: 'translateY(1px)', offset: 0.5 }, { transform: 'none' }], { duration: 300, easing: EASE });
        // Dos en el mismo puesto: además, un brillo recorre la placa (una vez) mientras el marco pasa a doble.
        if (BO.at(st(), sk, z) === 2 && staffed(key)) setTimeout(() => { const sw = document.createElement('i'); sw.className = 'mx-bo-sweep'; c.appendChild(sw); setTimeout(() => sw.remove(), 800); }, 140);
      });
    }, reduced ? 0 : 120);
  }
  // TAKE ALL BOOSTS BACK: todas vuelven a la reserva una tras otra (como mucho ocho en vuelo, escalonadas).
  function takeAll(btn) {
    press(btn);
    if (PEND || FLY.length || !st().boosts.length) return;
    const root = btn.closest('#sheet-body'), slots = [...root.querySelectorAll('.mx-bo-slot[data-w="post"].mx-on')].slice(0, 8), f0 = BO.free(st());
    const keys = Object.keys(E.cells);
    CM.ui.quiet('boostclear');
    if (reduced || !slots.length) { keys.forEach(updateCell); return updateHead(false); }
    updateHead(false, f0);
    slots.forEach((s, k) => setTimeout(() => {
      const g = s.querySelector('.mx-bo-g');
      if (g) g.animate([{ transform: 'none' }, { transform: 'translateY(-6px) scale(1.12)' }], { duration: 140, easing: EASE, fill: 'forwards' });
      setTimeout(() => {
        const tray = E.tray && E.tray.children[f0 + k];
        flyGem(s, tray, { fromDy: -6, toDy: -3, out: true, ms: 420 }, () => { if (tray && tray.isConnected) { const tg = setGem(tray, true, false); seat(tg, 'translateY(-3px) scale(1.1)'); } });
        setGem(s, false, false);
        const c = s.closest('[data-key]'); if (c) { const u = c.querySelector('u'); if (u) swapText(u, ''); c.classList.remove('mx-n1', 'mx-n2'); }
      }, 140);
    }, k * 90));
    setTimeout(() => { keys.forEach(updateCell); updateHead(true); }, slots.length * 90 + 640);
  }
  // Una gema nueva (se ganó mientras la pantalla estaba cerrada, o con ella abierta): aparece su engaste en la reserva y la
  // gema se forma dentro (un anillo de luz que se cierra); FREE salta.
  function earned(n) {
    if (!E.tray || reduced) return;
    const free = BO.free(st());
    for (let j = 0; j < n; j++) {
      const t = E.tray.children[free - 1 - j], g = t && t.querySelector('.mx-bo-g');
      if (!g) continue;
      t.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: j * 120, easing: SPRING, fill: 'backwards' });
      g.animate([{ transform: 'scale(0) rotate(-30deg)', filter: 'brightness(3)' }, { transform: 'scale(1.2)', filter: 'brightness(1.6)', offset: 0.6 }, { transform: 'none', filter: 'none' }], { duration: 640, delay: 200 + j * 120, easing: EASE, fill: 'backwards' });
      const ring = document.createElement('i'); ring.className = 'mx-bo-ring'; t.appendChild(ring); setTimeout(() => ring.remove(), 900 + j * 120);
    }
    const fb = E.head.querySelector('.mx-bo-cnt b'); if (fb) fb.animate([{ transform: 'scale(1.4)' }, { transform: 'none' }], { duration: 300, delay: 200, easing: SPRING });
  }
  // NEXT BOOST: la gema en bruto se llena con lo cocinado; la cifra, la barra y el tiempo siguen al juego sin repintar.
  function paintNext() {
    const n = E.next; if (!n || !n.isConnected || n.dataset.nx !== 'goal') return;
    const nx = BO.next(st()); if (!nx || nx.kind !== 'goal') return;
    const k = Math.max(0, Math.min(1, nx.cur / nx.need)), rows = Math.round(k * GEM_ROWS.length);
    if (n._rows !== rows) { n._rows = rows; const g = n.querySelector('.mx-bo-ghost'); gemGhost(g, k); g.style.width = g.width * 3 + 'px'; g.style.height = g.height * 3 + 'px'; }
    n.querySelector('.mx-bo-nv').textContent = CM.fmt(nx.cur) + ' / ' + CM.fmt(nx.need) + ' cheese cooked';
    n.querySelector('.mx-bo-bar i').style.width = (k * 100).toFixed(1) + '%';
    n.querySelector('.mx-bo-eta').textContent = (nx.etaMs ? 'About ' + span(nx.etaMs) + ' at your pace. ' : '') + 'It counts while you are away too.';
  }
  let lastOwned = null;
  function mount(root) {
    for (const c of document.querySelectorAll('#sheet-title canvas[data-boic]')) paintIc(c);
    const head = root.querySelector('.mx-bo-head');
    if (!head) return;
    for (const c of root.querySelectorAll('canvas[data-boic]')) paintIc(c);
    E.head = head; E.tray = head.querySelector('.mx-bo-sock'); E.back = root.querySelector('.mx-bo-back'); E.next = root.querySelector('.mx-bo-next'); E.cells = {};
    for (const c of root.querySelectorAll('[data-key]')) {
      E.cells[c.dataset.key] = c;
      c.querySelectorAll('.mx-bo-slot[data-w="post"]').forEach((s) => (s.onclick = () => tapSlot(c.dataset.key, +s.dataset.i, s)));
    }
    if (E.back) E.back.onclick = () => takeAll(E.back);
    const g = E.next && E.next.querySelector('.mx-bo-ghost');
    if (g && E.next.dataset.nx === 'rock') { gemGhost(g, 0); g.style.width = g.width * 3 + 'px'; g.style.height = g.height * 3 + 'px'; }
    balanceTray();
    paintNext();
    const owned = BO.owned(st());
    if (lastOwned !== null && owned > lastOwned) earned(owned - lastOwned);
    lastOwned = owned;
  }
  setInterval(() => { if (!sheet().hidden && E.next && E.next.isConnected) paintNext(); }, 500);
  window.addEventListener('resize', balanceTray);
  CM.pboosts = { mount, gem: (on, k) => icC(on ? 'gem' : 'gemoff', k || 1) }; // la gema aprobada, también para la pestaña del botón grande
})();
