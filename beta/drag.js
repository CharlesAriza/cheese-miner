// CHEESE DRILLER BETA · Arrastrar un ratón a otro puesto (arte aprobado en exploracion/pixel/drag-hand.html). Una pulsación larga lo coge con
// la mano, se lleva con el dedo y al soltar se confirma de una sola vez. La partida no cambia hasta ese momento: mientras se sostiene, el
// ratón sigue trabajando en su puesto y aquí solo se decide qué se ve. Se dibuja en una capa propia, a la misma escala de píxeles.
window.BetaDrag = function (o) {
  const { scene, box, targets, confirm, onGrab, onEnd, reduced } = o;
  const LONG_MS = 300; // cuánto hay que mantener el dedo (ajustable tras probarlo en móviles reales)
  const HAND_AT = 90; // antes de esto no se enseña nada, para que un toque normal no haga aparecer la mano
  const LIFT_MS = 110, DROP_MS = 640, SWAP_MS = 760, CANCEL_MS = 800, ABORT_MS = 170, REST_MS = 700;
  const LAND = { drop: 0.3, swap: 0.3, cancel: 0.45 }, OTHER_LANDS = 0.7;
  const EDGE = 64, SCROLL_MAX = 420; // zona de los bordes (px) y velocidad máxima de la cámara al acercarse (px/s)
  const GRIP_X = 22, GRIP_Y = 21; // del dedo al lienzo del ratón (px de dibujo): la muñeca queda sobre el dedo y el ratón, arriba a la izquierda

  // SPRITE: la mano es un puntero, de abierta a cerrada, según la referencia del propietario. Se pinta tal cual, con su contorno.
  const HAND_PAL = { K: '#0c0910', W: '#ffffff', G: '#cccccc', M: '#909090' };
  const WRIST = ['.KGWWWWWWWKWWK..', '..KGWWWWKWWKWK..', '..KKGWWWWKWWWK..', '..KMMGWWWWWWWKK.', '..KMGGWWWWWWKWWK', '...KGGWWWWWWWWWK', '....KGGGGGKWWGK.', '.....KKKKKGWGK..', '........KMGGK...', '........KMMK....', '.........KK.....'];
  const HAND_ROWS = [
    ['......KK........', '...KKKWWKK......', '.KKWWKKWWKK.....', 'KWWKWWWKGWWK....', 'KWWWKKGWKGWWK...', 'KGWWWWKGWWWWK...', ...WRIST],
    ['...KK...........', '.KKWWKK.KKK.....', 'KWWKWWWKGWWK....', 'KWWWKKGWKGWWK...', 'KGWWWWKGWWWWK...', ...WRIST],
    ['.KK.....KKK.....', 'KWWK..KKGWWK....', 'KWWWKKGWKGWWK...', 'KGWWWWKGWWWWK...', ...WRIST],
    ['........KKK.....', '..KK..KKGWWK....', '.KWWKKGWKGWWK...', '.KWWWWKGWWWWK...', ...WRIST],
    ['........KKK.....', '......KKGWWK....', '....KKGWKGWWK...', '..KKWWKGWWWWK...', ...WRIST],
  ];
  const CLOSED = HAND_ROWS.length - 1, HX = 11, HY = 3, HH = 15; // dónde va sobre el ratón, que al sostenerse mira a la izquierda
  const paint = (rows, pal, outline) => {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length, b = outline ? 1 : 0, c = document.createElement('canvas'); c.width = w + 2 * b; c.height = h + 2 * b; const g = c.getContext('2d');
    const at = (x, y) => (rows[y] && rows[y][x] && rows[y][x] !== '.' ? rows[y][x] : null);
    for (let y = -b; y < h + b; y++) for (let x = -b; x < w + b; x++) { const ch = at(x, y); if (ch) g.fillStyle = pal[ch]; else if (b && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) g.fillStyle = HAND_PAL.K; else continue; g.fillRect(x + b, y + b, 1, 1); }
    return c;
  };
  const HANDS = HAND_ROWS.map((r) => paint(r, HAND_PAL));
  // SPRITE: flecha que señala cada sitio donde se puede colocar: verde si está vacío, blanca si hay que intercambiar.
  const ARROW = ['...LYD...', '...LYD...', '...LYD...', 'LLLLYYYYD', '.LLYYYYD.', '..LYYYD..', '...LYD...', '....Y....'];
  const ARROW_NEW = paint(ARROW, { L: '#b6f0bc', Y: '#62d36e', D: '#2f8a3a' }, true), ARROW_SWAP = paint(ARROW, { L: '#ffffff', Y: '#e6e0ec', D: '#9f97b8' }, true);
  const SWAP_IC = paint(['..Y......', '.YY......', 'YYYYYYYY.', '.YY......', '..Y...Y..', '......YY.', '.YYYYYYYY', '......YY.', '......Y..'], { Y: '#ffcf2e' }, true);
  // Puesto vacío: la silueta oficial, hueca: se lee como «aquí cabe un ratón» y no tapa el decorado.
  function hollow(src, col) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'), d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data, on = (i, j) => i >= 0 && j >= 0 && i < src.width && j < src.height && d[(j * src.width + i) * 4 + 3] > 0; x.fillStyle = col; for (let j = 0; j < src.height; j++) for (let i = 0; i < src.width; i++) if (on(i, j) && !(on(i - 1, j) && on(i + 1, j) && on(i, j - 1) && on(i, j + 1))) x.fillRect(i, j, 1, 1); return c; }
  const ghostFill = CM.art.ghostCanvas(), ghost = hollow(ghostFill, '#62d36e'), ghostGold = hollow(ghostFill, '#ffcf2e');

  const ov = document.createElement('canvas'); ov.className = 'dh-ov'; box.appendChild(ov);
  const g = ov.getContext('2d');
  const tag = document.createElement('div'); tag.className = 'dh-tag'; tag.hidden = true; tag.innerHTML = '<b></b><small></small>'; box.appendChild(tag);
  const sprites = new Map();
  const nodeOf = (m) => scene.nodes().find((q) => q.m && q.m.id === m.id);
  const spr = (m) => { let c = sprites.get(m.id); if (!c) { const n = nodeOf(m); if (!n || !n.crew) return null; c = CM.art.mouseCanvas(n.crew, 0, false, {}); sprites.set(m.id, c); } return c; };

  const hidden = new Set(); // ratones (por id) que dibuja esta capa y no la escena
  let st = null, lastNow = 0, hiddenSig = '';
  const hide = (m) => { hidden.add(m.id); hiddenSig = [...hidden].join(); };
  const show = (m) => { hidden.delete(m.id); hiddenSig = [...hidden].join(); };

  let dpr = 1, d = 1;
  function size() { dpr = devicePixelRatio || 1; const w = Math.round(box.clientWidth * dpr), h = Math.round(box.clientHeight * dpr); if (ov.width !== w || ov.height !== h) { ov.width = w; ov.height = h; } d = Math.max(1, Math.round(scene.scale * dpr)); g.imageSmoothingEnabled = false; }
  const dev = (x, y) => { const [a, b] = scene.toScreen(x, y); return [Math.round(a * dpr), Math.round(b * dpr)]; };
  const toWorld = (sx, sy) => { const [ax, ay] = scene.toScreen(0, 0); return [(sx - ax) / scene.scale, (sy - ay) / scene.scale]; };
  function blit(img, x, y, flip, alpha, fine) {
    const [X, Y] = fine ? dev(x, y) : dev(Math.round(x), Math.round(y)); g.save(); if (alpha != null) g.globalAlpha = alpha;
    if (flip) { g.translate(X + img.width * d, Y); g.scale(-1, 1); g.drawImage(img, 0, 0, img.width * d, img.height * d); } else g.drawImage(img, X, Y, img.width * d, img.height * d);
    g.restore();
  }
  function px(x, y, w, h, col) { const [X, Y] = dev(Math.round(x), Math.round(y)); g.fillStyle = col; g.fillRect(X, Y, w * d, h * d); }
  // Esquinas: las de la selección de la escena, en el color de cada estado.
  function corners(x, y, w, h, col) { x -= 2; y -= 2; w += 4; h += 4; const a = 4; for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) { px(sx > 0 ? cx : cx - a + 1, cy, a, 1, col); px(cx, sy > 0 ? cy : cy - a + 1, 1, a, col); } }
  const smooth = (t) => t * t * (3 - 2 * t), ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // La mano sobre el ratón, alineada por la muñeca. Entra y se va por donde está el dedo, con un fundido continuo y por píxeles de pantalla:
  // es lo único que se sale de la rejilla, y solo durante la transición.
  function hand(i, x, y, alpha, fine) { const h = HANDS[i]; blit(h, x + HX, y + HY + HH - h.height, false, alpha, fine); }
  const handIn = (x, y, t) => { const e = smooth(t); hand(0, x + (1 - e) * 6, y + (1 - e) * 6, e, true); };
  const handOut = (x, y, t) => { if (t < 1) { const e = smooth(t); hand(0, x + e * 6, y + e * 6, 1 - e, true); } };
  const handRelease = (x, y, t) => { if (t < 0.25) hand(Math.max(0, CLOSED - Math.floor((t / 0.25) * (CLOSED + 1))), x, y); else handOut(x, y, (t - 0.25) / 0.75); };

  // Dónde caería: lo decide la posición de los pies del ratón que se ve, no la del dedo.
  function findTarget(list, x, my) { const fx = x + 11, fy = my + 20; let best = null, bd = 1e9; for (const p of list) { const dx = Math.abs(p.x + 11 - fx), dy = p.feet - fy; if (dx > 24 || dy < -6 || dy > 30) continue; const v = dx + Math.abs(dy) * 0.4; if (v < bd) { bd = v; best = p; } } return best; }
  function marks(now, list, tgt) {
    const pulse = 0.42 + 0.16 * Math.sin(now / 300), bob = reduced() ? 1 : [0, 1, 2, 3, 2, 1][Math.floor(now / 110) % 6];
    for (const p of list) {
      const x = p.x, y = p.feet - 21, isT = tgt && tgt.key === p.key;
      if (p.source) { const c = spr(st.m); if (c) blit(c, x, p.feet - 20, p.face < 0, 0.28); corners(x + 1, y, 20, 22, isT ? '#ffcf2e' : '#9f97b8'); continue; }
      if (p.occ) { corners(x + 1, y, 20, 22, isT ? '#ffcf2e' : '#d6d0e6'); if (isT) blit(SWAP_IC, x + 24, p.feet - 15 - (Math.floor(now / 400) % 2), false); else blit(ARROW_SWAP, x + 6, y - 13 + bob, false); continue; }
      if (isT) { blit(ghostGold, x, p.feet - 20, p.face < 0, 0.9); corners(x + 1, y, 20, 22, '#ffcf2e'); } else { blit(ghostFill, x, p.feet - 20, p.face < 0, 0.22); blit(ghost, x, p.feet - 20, p.face < 0, pulse + 0.42); corners(x + 1, y, 20, 22, '#62d36e'); blit(ARROW_NEW, x + 6, y - 13 + bob, false); }
    }
  }
  function placeTag(tgt, src, mx, my) {
    let t1, t2, cls;
    if (!tgt) { t1 = 'NOT A POST'; t2 = 'Goes back to ' + src.label; cls = 'back'; }
    else if (tgt.source) { t1 = tgt.label; t2 = 'Stays here'; cls = 'back'; }
    else { t1 = tgt.label; if (tgt.occ) { t2 = 'Occupied by ' + tgt.occ.name + ' · swap'; cls = 'swap'; } else { t2 = 'Empty'; cls = 'ok'; } }
    const b = tag.firstChild, s = tag.lastChild;
    if (b.textContent !== t1) b.textContent = t1;
    if (s.textContent !== t2) { s.textContent = t2; s.className = cls; tag.classList.toggle('back', cls === 'back'); }
    tag.hidden = false;
    // Siempre por encima: lo de debajo y a la derecha lo tapa el dedo.
    const W = box.clientWidth, H = box.clientHeight, w = tag.offsetWidth, h = tag.offsetHeight, top = o.topInset(), [ax, ht] = scene.toScreen(mx + 14, my - 1);
    tag.style.left = Math.round(clamp(ax - w / 2, 6, W - w - 6)) + 'px'; tag.style.top = Math.round(clamp(ht - h - 4, top, H - h - 4)) + 'px';
  }

  // ---- Gesto ----
  const api = {
    get holding() { return !!st && st.k === 'hold'; },
    get pressing() { return !!st && st.k === 'press'; },
    get busy() { return !!st; },
    get sig() { return hiddenSig; },
    get target() { return st && st.k === 'hold' ? st.tgt : null; },
    isHidden: (m) => hidden.has(m.id),
    GRIP_X, GRIP_Y, LONG_MS,
    press(m, sx, sy, now) { if (st) return false; const n = nodeOf(m); if (!n || n.px == null) return false; sprites.clear(); st = { k: 'press', m, t0: now, fx: sx, fy: sy }; return true; },
    move(sx, sy) { if (st && (st.k === 'press' || st.k === 'hold')) { st.fx = sx; st.fy = sy; } },
    // Se suelta antes de tiempo o el dedo se mueve: era un toque o un arrastre de cámara. La mano, si ya asomaba, se va.
    abort(now) { if (!st || st.k !== 'press') return; const n = nodeOf(st.m), seen = now - st.t0 > HAND_AT; st = seen && n && n.px != null ? { k: 'abort', t0: now, x: n.px, my: n.py - 20 } : null; },
    release(now) {
      if (!st || st.k !== 'hold') return;
      const h = st, tgt = h.tgt, base = { m: h.m, t0: now, from: { x: h.x, my: h.my }, src: h.src };
      tag.hidden = true; onEnd();
      if (tgt && !tgt.source) {
        const other = tgt.occ || null; if (other) { spr(other); hide(other); } // antes de confirmar: la escena se rehace con la partida ya cambiada
        if (confirm(h.m, tgt)) { st = Object.assign(base, { k: other ? 'swap' : 'drop', d: other ? SWAP_MS : DROP_MS, post: tgt, other }); return; }
        if (other) show(other);
      }
      st = Object.assign(base, { k: 'cancel', d: CANCEL_MS });
    },
    // Cualquier interrupción (segundo dedo, el sistema, cambiar de app): vuelve a su sitio sin haber cambiado nada.
    cancel(now) { if (!st) return; if (st.k === 'press') return api.abort(now); if (st.k !== 'hold') return; const h = st; tag.hidden = true; onEnd(); st = { k: 'cancel', d: CANCEL_MS, m: h.m, t0: now, from: { x: h.x, my: h.my }, src: h.src }; },
    // Antes de dibujar la escena: si no, al acabar una transición habría un fotograma sin ratón.
    step(now) {
      if (!st) return;
      if (st.k === 'press' && now - st.t0 >= LONG_MS) {
        const n = nodeOf(st.m), list = targets(st.m), src = list.find((p) => p.source);
        if (!n || n.px == null || !src) { st = null; return; }
        st = { k: 'hold', m: st.m, t0: now, fx: st.fx, fy: st.fy, x: n.px, my: n.py - 20, x0: n.px, my0: n.py - 20, src, tgt: null };
        spr(st.m); hide(st.m); onGrab();
      }
      if (st.k === 'hold') {
        // La cámara se desplaza sola cerca de los bordes, más deprisa cuanto más cerca.
        const dt = Math.min(50, Math.max(0, now - lastNow)), H = box.clientHeight, top = o.topInset(), up = clamp((top + EDGE - st.fy) / EDGE, 0, 1), down = clamp((st.fy - (H - EDGE)) / EDGE, 0, 1), v = (up - down) * SCROLL_MAX * (dt / 1000);
        if (v) scene.dragBy(v);
        const [wx, wy] = toWorld(st.fx, st.fy), tx = wx - GRIP_X, ty = wy - GRIP_Y, l = smooth(clamp((now - st.t0) / LIFT_MS, 0, 1));
        st.x = st.x0 + (tx - st.x0) * l; st.my = st.my0 + (ty - st.my0) * l;
      }
      if (st.k === 'drop' || st.k === 'swap' || st.k === 'cancel') {
        const q = clamp((now - st.t0) / st.d, 0, 1);
        if (!st.landed && q >= LAND[st.k]) { st.landed = true; show(st.m); st.rest = st.m; }
        if (st.k === 'swap' && !st.settled && q >= OTHER_LANDS) { st.settled = true; show(st.other); st.rest2 = st.other; }
        if (q >= 1) st = null;
      } else if (st.k === 'abort' && now - st.t0 >= ABORT_MS) st = null;
      lastNow = now;
    },
    // Después de sincronizar la escena: el recién colocado espera a que la mano se haya ido antes de ponerse a trabajar.
    settle() { if (!st) return; if (st.rest) { scene.restMouse(st.rest, REST_MS); st.rest = null; } if (st.rest2) { scene.restMouse(st.rest2, REST_MS); st.rest2 = null; } },
    render(now) {
      size(); g.clearRect(0, 0, ov.width, ov.height);
      if (!st) { lastNow = now; return; }
      if (st.k === 'press') {
        const n = nodeOf(st.m), t = now - st.t0; if (!n || n.px == null || t < HAND_AT) return;
        const x = n.px, y = n.py - 20, q = (t - HAND_AT) / (LONG_MS - HAND_AT);
        if (q < 0.35) handIn(x, y, q / 0.35); else hand(Math.min(CLOSED, Math.floor(((q - 0.35) / 0.65) * (CLOSED + 1))), x, y);
      } else if (st.k === 'abort') handOut(st.x, st.my, (now - st.t0) / ABORT_MS);
      else if (st.k === 'hold') {
        const list = targets(st.m); st.src = list.find((p) => p.source) || st.src;
        const tgt = findTarget(list, st.x, st.my), c = spr(st.m); st.tgt = tgt;
        marks(now, list, tgt);
        if (c) blit(c, st.x, st.my, true); hand(CLOSED, st.x, st.my);
        placeTag(tgt, st.src, st.x, st.my);
      } else {
        const q = clamp((now - st.t0) / st.d, 0, 1), src = st.src, c = spr(st.m);
        if (st.k === 'cancel') {
          if (q < LAND.cancel) { const e = ease(q / LAND.cancel), x = st.from.x + (src.x - st.from.x) * e, y = st.from.my + (src.feet - 20 - st.from.my) * e; if (c) blit(c, x, y, true); hand(CLOSED, x, y); } else handRelease(src.x, src.feet - 20, (q - LAND.cancel) / (1 - LAND.cancel));
        } else {
          const p = st.post, f = clamp(q / LAND.drop, 0, 1), x = st.from.x + (p.x - st.from.x) * f, y = st.from.my + (p.feet - 20 - st.from.my) * f * f;
          if (st.k === 'swap' && q < OTHER_LANDS) { const e = ease(q / OTHER_LANDS), oc = spr(st.other); if (oc) blit(oc, p.x + (src.x - p.x) * e, p.feet - 20 + (src.feet - p.feet) * e, e > 0.5 ? src.face < 0 : p.face < 0); }
          if (q < LAND.drop && c) blit(c, x, y, true);
          handRelease(st.from.x, st.from.my, q);
        }
      }
      lastNow = now;
    },
  };
  return api;
};
