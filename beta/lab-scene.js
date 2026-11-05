// CHEESE DRILLER BETA · LAB: la escena jugable, con el arte y las animaciones aprobados (lab-anim.js y lab/). Aquí no hay economía: lee la partida, se la enseña al
// motor (viewNow) y convierte cada toque en una hoja Pulido+. Quien investiga y lo que gasta lo decide el núcleo, que avanza igual con esta escena a la vista o sin ella.
// Lo único suyo que se guarda es qué obras ha visto ya el jugador (acción `seen` del núcleo): cada una se ve una vez, aunque se haya comprado desde otra pantalla.
window.BetaLabScene = function (o) {
  const $ = (id) => document.getElementById(id);
  const { G, Core, Pg, Lb, REAL, fmt, recipeName, scene } = o;
  const PAD = 140, LW = 320, LH = 430, HUD_SPACE = 66, TOWER_ROWS = 305, BASE_W = 250;
  // El cielo del día es el aprobado; con el resto de horas se va hacia el de MAIN, para que entrar en LAB no cambie la hora.
  const DAY = ['#6db3e6', '#7cbcea', '#8cc5ee', '#9dcff2', '#aed8f5', '#bfe1f7', '#cee8f9', '#dbeefa', '#e6f3fb'];
  const SHOWN = { queueNode: 'lab.shown.queue', strainsNode: 'lab.shown.strains', deskNode: 'lab.shown.desk', libraryNode: 'lab.shown.library' };
  const stageSeen = (n) => 'lab.shown.stage' + n;
  const pad2 = (n) => n.toString(16).padStart(2, '0');
  const mix = (a, b, k) => { const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return '#' + [0, 1, 2].map((i) => pad2(Math.round(p(a, i) + (p(b, i) - p(a, i)) * k))).join(''); };
  const dur = (ms) => { const t = Math.max(1, Math.ceil(ms / 1000)); return t < 60 ? t + 's' : t < 3600 ? Math.ceil(t / 60) + 'm' : Math.floor(t / 3600) + 'h ' + Math.ceil((t % 3600) / 60) + 'm'; };

  let data = null, F = null, atlas = null, land = null, loading = false, failed = false; const layers = {};
  let E = null, R = null, el = null, cv = null, gc = null, ui = null, bub = null, tag = null, gesture = null, BUB = null, back = null;
  let W = 0, H = 0, s = 1, vw = 0, vh = 0, cam = { x: 0, y: 0, w: 0, h: 0 }, last = 0, lastDraw = 0, lastPaint = 0, panelSig = '', plateSig = '', floor = null, picked = false, on = false, started = false;
  let prev = null; const idleSnap = { noBase: 0, noCoin: 0 }; let idleNow = null;
  const plates = new Map(), mice = new Map(), statics = new Map();

  // ---------- Lo que ya se ha enseñado ----------
  function shownSaved() {
    const seen = G().seen; let stage = 1; for (const n of [2, 3, 4]) if (seen[stageSeen(n)] != null) stage = n;
    const out = { stage }; for (const k of Object.keys(SHOWN)) out[k] = seen[SHOWN[k]] != null;
    return out;
  }
  const seen = (id) => Core.act(G(), 'seen', { id });
  function remember(to) {
    if (to.stage) seen(stageSeen(to.stage));
    for (const k of Object.keys(SHOWN)) if (to[k]) seen(SHOWN[k]);
    o.saved();
  }
  // Una partida de antes de esta escena no repite obras que ya tenía; una nueva empieza en la fase I y verá todas.
  function baseline() {
    const c = G(), L = c.lab;
    if (c.seen['lab.shown'] != null) return;
    seen('lab.shown');
    for (let n = 2; n <= Math.min(4, L.phase); n++) seen(stageSeen(n));
    if (L.nodes.queue) seen(SHOWN.queueNode); if (L.nodes.strains) seen(SHOWN.strainsNode); if (L.nodes.desk) seen(SHOWN.deskNode); if (L.nodes.library) seen(SHOWN.libraryNode);
  }

  // ---------- Quién hay dentro y qué hace: siempre leído de la partida ----------
  const inLab = () => { const c = G(), id = c.lab.workers[0]; if (!id) return null; const w = Core.whereIs(c, id); return w && w.scene === 'lab' ? c.roster.find((m) => m.id === id) || null : null; };
  // El laboratorio avanza por tramos de 20 s: la barra se reparte el tramo para no ir a saltos.
  const progress = (j) => { const frac = G().s.t % Core.GRID; return Math.max(0, Math.min(1, 1 - Math.max(0, j.remaining - frac) / j.total)); };
  const left = (j) => Math.max(0, j.remaining - G().s.t % Core.GRID);
  const finishedOf = (sh) => sh.stage >= 3 || sh.queueNode;
  function announceNow() {
    const c = G(), L = c.lab, sh = E ? E.shown : { stage: L.phase }, open = (id, n) => !L.nodes[n] && Pg.isOpen(c, id);
    if (open('lab.queue', 'queue') && sh.stage >= 2) return 'queue3';
    if (open('lab.strains', 'strains')) return sh.stage >= 2 && finishedOf(sh) ? 'incubator' : 'compact';
    if (open('lab.desk', 'desk') && sh.stage >= 3) return 'draft';
    if (open('lab.library', 'library') && sh.stage >= 4) return 'archive';
    return null;
  }
  function viewNow() {
    const c = G(), L = c.lab, m = inLab(), styles = Object.keys(L.styles).length, ids = E2.PARAMS.strata.map((x) => x.id), jars = ids.map((st) => { let n = 0; for (const k of Object.keys(L.strainsOf || {})) if (k.startsWith(st + '+')) n += L.strainsOf[k].length; return Math.min(3, n); });
    if (L.job) idleNow = null;
    else { if (L.idleMs.noBase > idleSnap.noBase) idleNow = 'noBase'; else if (L.idleMs.noCoin > idleSnap.noCoin) idleNow = 'noCoin'; else if (L.idleMs.noTarget > (idleSnap.noTarget || 0)) idleNow = null; }
    idleSnap.noBase = L.idleMs.noBase; idleSnap.noCoin = L.idleMs.noCoin; idleSnap.noTarget = L.idleMs.noTarget;
    return {
      phase: Math.max(1, Math.min(4, L.phase)), queueNode: !!L.nodes.queue, strainsNode: !!L.nodes.strains, deskNode: !!L.nodes.desk, libraryNode: !!L.nodes.library,
      worker: !!m, job: L.job ? { kind: L.job.kind, key: L.job.key || L.job.style || L.job.id, p: progress(L.job), retried: !!L.job.retried } : null, bp: L.bpJob ? { p: progress(L.bpJob) } : null,
      queue: L.queue.length, idle: idleNow, known: L.known.length, books: Math.min(14, 2 + Math.floor(L.known.length / 5)), marks: Math.min(6, styles), samples: Math.min(6, 1 + Math.floor((L.nodes.samples || 0) / 2)),
      dishes: Math.min(6, L.done.strains || 0), jars, rolls: Math.min(3, L.done.blueprints || 0), announce: announceNow(),
    };
  }

  // ---------- Dibujo: un lienzo a la resolución del mundo, ampliado por un número entero de píxeles del móvil ----------
  let skyKey = '', skyCv = null, nightNow = 0;
  function skyLayer() {
    const S = scene.skyNow(), k = Math.min(1, S.light[1] / 0.24), key = S.sky.join() + S.light.join() + Math.round((S.stars || 0) * 20);
    nightNow = S.night || 0;
    if (key === skyKey) return skyCv;
    skyKey = key; if (!skyCv) { skyCv = document.createElement('canvas'); skyCv.width = LW + PAD * 2; skyCv.height = LH; }
    const q = skyCv.getContext('2d'); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
    const bh = Math.ceil(data.geom.G / 9), bands = DAY.map((c, i) => (k > 0 ? mix(c, S.sky[i], k) : c)); bands.forEach((c, i) => { q.fillStyle = c; q.fillRect(0, i * bh, skyCv.width, bh + 1); });
    q.drawImage(land, 0, 0);
    if (S.light[1] > 0.01) { q.globalCompositeOperation = 'multiply'; q.globalAlpha = S.light[1]; q.fillStyle = S.light[0]; q.fillRect(0, 0, skyCv.width, LH); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; }
    if ((S.stars || 0) > 0.02) { q.fillStyle = '#ffffff'; let z = 7; for (let i = 0; i < 70; i++) { z = (z * 1664525 + 1013904223) >>> 0; const x = z % skyCv.width; z = (z * 1664525 + 1013904223) >>> 0; q.globalAlpha = S.stars * (0.4 + (z % 6) / 10); q.fillRect(x, z % 240, 1, 1); } q.globalAlpha = 1; }
    bandTop = bands[0];
    return skyCv;
  }
  let bandTop = DAY[0];
  function mouseSprite(name) {
    const m = inLab(); if (!m) return null;
    const key = m.id + ':' + (m.rank || 0) + ':' + name; let c = mice.get(key); if (c) return c;
    const w = /^M(.+)([01])([01])$/.exec(name); if (!w || !data.poses[w[1]]) return null;
    c = CM.art.mouseCanvas(scene.crewLook(m, 'research'), +w[2], w[3] === '1', data.poses[w[1]]);
    if (mice.size > 90) mice.clear(); mice.set(key, c); return c;
  }
  function backend() {
    let g = gc, cx = 0, cy = 0;
    const api = {
      ops: 0,
      begin(x, y) { cx = x; cy = y; g.imageSmoothingEnabled = false; api.ops = 0; if (y < 0) { g.fillStyle = bandTop; g.fillRect(0, 0, vw, vh); } },
      end() {},
      layer(n) { if (n === 'sky') g.drawImage(skyLayer(), -PAD - cx, -cy); else g.drawImage(layers[n], -cx, -cy); api.ops++; },
      spr(n, x, y, flip) {
        if (n.charCodeAt(0) === 77) { const c = mouseSprite(n); if (c) { if (flip) { g.save(); g.translate(x - cx + c.width, y - cy); g.scale(-1, 1); g.drawImage(c, 0, 0); g.restore(); } else g.drawImage(c, x - cx, y - cy); api.ops++; return; } }
        const f = F[n]; if (x === undefined) { x = f.wx; y = f.wy; }
        const cloud = n.length === 2 && n[0] === 'c' && nightNow > 0.01; if (cloud) g.globalAlpha = 1 - 0.75 * nightNow;
        if (flip) { g.save(); g.translate(x - cx + f.w, y - cy); g.scale(-1, 1); g.drawImage(atlas, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); g.restore(); } else g.drawImage(atlas, f.x, f.y, f.w, f.h, x - cx, y - cy, f.w, f.h);
        if (cloud) g.globalAlpha = 1; api.ops++;
      },
      rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x - cx, y - cy, w, h); api.ops++; },
      clip(x, y, w, h) { g.save(); g.beginPath(); g.rect(x - cx, y - cy, w, h); g.clip(); },
      unclip() { g.restore(); },
      cached(key, fn) {
        let c = statics.get(key);
        if (!c) {
          c = document.createElement('canvas'); c.width = LW; c.height = LH;
          const sg = g, sx = cx, sy = cy; g = c.getContext('2d'); g.imageSmoothingEnabled = false; cx = 0; cy = 0; fn(); g = sg; cx = sx; cy = sy;
          statics.set(key, c); if (statics.size > 12) statics.delete(statics.keys().next().value);
        }
        g.drawImage(c, -cx, -cy); api.ops++;
      },
    };
    return api;
  }
  function layout() {
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return false;
    const dpr = window.devicePixelRatio || 1;
    if (w === W && h === H && dpr === layout.dpr) return false;
    W = w; H = h; layout.dpr = dpr;
    // Igual que MAIN: un número entero de píxeles del móvil por píxel del dibujo. Caben los 250 de ancho y, en pantallas bajas, la torre entera bajo el marcador.
    const d = Math.max(1, Math.min(Math.floor((W * dpr) / BASE_W), Math.floor(((H - HUD_SPACE) * dpr) / TOWER_ROWS)));
    s = d / dpr; vw = Math.ceil(W / s); vh = Math.ceil(H / s);
    cv.width = vw; cv.height = vh; cv.style.width = vw * s + 'px'; cv.style.height = vh * s + 'px';
    plateSig = ''; return true;
  }
  const camNow = () => { cam.x = Math.round(E.camX + BASE_W / 2 - vw / 2); cam.y = LH - vh; cam.w = vw; cam.h = vh; return cam; };
  const toX = (wx) => (wx - cam.x) * s, toY = (wy) => H - (LH - wy) * s;

  // ---------- Plantas y lo que hay en cada una ----------
  // Posiciones en píxeles del dibujo, sobre pared libre: las de la revisión aprobada.
  const SPOTS = { research: [157, 329], workroom: [147, 248], dome: [42, 168], library: [220, 292], recipes: [157, 329], studies: [106, 306], strainsLow: [56, 322], queue: [62, 241], strains: [150, 247], blueprints: [52, 172] };
  const NAME = { research: 'RESEARCH', workroom: 'WORKROOM', dome: 'DOME', library: 'LIBRARY' };
  const studiesOn = () => { const c = G(); return E2.PARAMS.strata.some((st) => st.id !== 'cheddar' && Pg.has('study.' + st.id) && Pg.isOpen(c, 'study.' + st.id)); };
  function itemsOf(fl) {
    const c = G(), L = c.lab, sh = E.shown, out = [], node = (n, id) => (L.nodes[n] ? 1 : Pg.isOpen(c, id) ? 2 : 0), low = !(sh.stage >= 2 && finishedOf(sh));
    if (fl === 'research') {
      out.push({ id: 'recipes', label: 'RECIPES', spot: SPOTS.recipes });
      if (studiesOn()) out.push({ id: 'studies', label: 'STUDIES', spot: SPOTS.studies });
      if (low) { const n = node('strains', 'lab.strains'); if (n) out.push({ id: 'strains', label: 'STRAINS', spot: SPOTS.strainsLow, build: n === 2 }); }
    }
    if (fl === 'workroom') {
      const q = node('queue', 'lab.queue'); if (q) out.push({ id: 'queue', label: 'QUEUE', spot: SPOTS.queue, build: q === 2 });
      if (!low) { const n = node('strains', 'lab.strains'); if (n) out.push({ id: 'strains', label: 'STRAINS', spot: SPOTS.strains, build: n === 2 }); }
    }
    if (fl === 'dome') { const n = node('desk', 'lab.desk'); if (n) out.push({ id: 'desk', label: 'BLUEPRINTS', spot: SPOTS.blueprints, build: n === 2 }); }
    if (fl === 'library') { const n = node('library', 'lab.library'); if (n) out.push({ id: 'library', label: 'LIBRARY', spot: SPOTS.library, build: n === 2 }); }
    return out;
  }
  const floorsNow = () => { const st = E.shown.stage, out = ['research']; if (st >= 2) out.push('workroom'); if (st >= 3) out.push('dome'); if (st >= 4) out.push('library'); return out; };
  // Lo que se puede construir ya: se anuncia y lo activa el jugador. Una etapa nueva lleva placa propia sobre el tejado.
  const nextStage = () => { const c = G(), n = c.lab.phase + 1; return n <= 4 && Pg.has('lab.phase' + n) && Pg.isOpen(c, 'lab.phase' + n) ? n : 0; };
  const NODE = { strains: 'lab.strains', queue: 'lab.queue', desk: 'lab.desk', library: 'lab.library' };
  function openItem(id, build) {
    if (build) return o.open('treenode', NODE[id]);
    if (id === 'recipes') return o.open('labrecipes');
    if (id === 'studies') return o.open('labview', 'studies');
    if (id === 'strains') return o.open('labstrains');
    if (id === 'queue') return o.open('labview', 'queue');
    if (id === 'desk') return o.open('labview', 'desk');
    if (id === 'library') return o.open('labview', 'library');
    return o.open('lab');
  }
  function tapFloor(fl) {
    const items = itemsOf(fl);
    if (items.length === 1 && !items[0].build) { pickFloor(null); return openItem(items[0].id); }
    pickFloor(floor === fl ? null : fl);
  }
  function pickFloor(fl) { if (floor === fl) return; floor = fl; picked = false; panelSig = ''; plateSig = ''; }
  function plateFor(key, label, build, sel, fn) {
    let b = plates.get(key);
    if (!b) { b = document.createElement('button'); b.className = 'p0-plate lab-plate'; b.innerHTML = '<span></span><b class="bd">BUILD</b>'; b.addEventListener('click', () => b.__go()); ui.appendChild(b); plates.set(key, b); }
    if (b.firstChild.textContent !== label) b.firstChild.textContent = label;
    b.classList.toggle('build', !!build); b.classList.toggle('on', !!sel); b.__go = fn;
    return b;
  }
  function paintPlates() {
    const sh = E.shown, list = [], c = G();
    const add = (key, label, spot, build, sel, fn) => list.push({ b: plateFor(key, label, build, sel, fn), spot });
    for (const fl of floorsNow()) {
      if (floor === fl) { for (const it of itemsOf(fl)) add('i:' + fl + ':' + it.id, it.label, it.spot, it.build, true, () => openItem(it.id, it.build)); if (!itemsOf(fl).length) add('f:' + fl, NAME[fl], SPOTS[fl], false, true, () => tapFloor(fl)); continue; }
      if (fl === 'library') { const it = itemsOf(fl)[0]; if (it) add('i:library', it.label, it.spot, it.build, false, () => openItem(it.id, it.build)); continue; }
      if (fl === 'research' && floorsNow().length === 1 && itemsOf(fl).length === 1) { add('f:research', 'RESEARCH', SPOTS.research, false, false, () => openItem('recipes')); continue; }
      const pending = itemsOf(fl).some((it) => it.build);
      add('f:' + fl, NAME[fl], SPOTS[fl], pending, false, () => tapFloor(fl));
    }
    const n = nextStage(); if (n && !E.busyObra) add('stage', 'STAGE ' + n, [Math.round(data.geom.CX - 34), sh.stage === 1 ? data.geom.F1 - 34 : sh.stage === 2 ? data.geom.F2 - 34 : data.geom.S - 80], true, false, () => o.open('treenode', 'lab.phase' + n));
    const live = new Set(list.map((p) => p.b)); for (const b of plates.values()) if (!live.has(b) && !b.hidden) b.hidden = true;
    const top = o.top(), sig = [Math.round(cam.x), W, H, top, list.map((p) => p.spot.join()).join('|')].join(':');
    for (const p of list) { const b = p.b; if (b.hidden) b.hidden = false; if (sig !== plateSig || !b.__placed) { const w = b.offsetWidth, x = Math.round(Math.max(6, Math.min(W - w - 6, toX(p.spot[0])))), y = Math.round(Math.max(top, toY(p.spot[1]))); b.style.left = x + 'px'; b.style.top = y + 'px'; b.__placed = true; } }
    plateSig = sig;
  }

  // ---------- Toques ----------
  const inRect = (f, x, y, m = 0) => f && x >= f.wx - m && x < f.wx + f.w + m && y >= f.wy - m && y < f.wy + f.h + m;
  function furnitureAt(wx, wy) {
    const sh = E.shown, L = G().lab, low = !(sh.stage >= 2 && finishedOf(sh));
    if (sh.stage >= 4 && L.nodes.library && sh.libraryNode && inRect(F.archive, wx, wy)) return { id: 'library', f: F.archive };
    if (sh.stage >= 3 && L.nodes.desk && sh.deskNode && inRect(F.draft, wx, wy)) return { id: 'desk', f: F.draft };
    if (!low && L.nodes.strains && sh.strainsNode && inRect(F.incubator, wx, wy)) return { id: 'strains', f: F.incubator };
    if (sh.stage >= 2 && L.nodes.queue && sh.queueNode && inRect(F.queue3, wx, wy)) return { id: 'queue', f: F.queue3 };
    if (low && L.nodes.strains && sh.strainsNode && inRect(F.compact, wx, wy)) return { id: 'strains', f: F.compact };
    if (inRect(F.board, wx, wy)) return { id: studiesOn() ? 'studies' : 'recipes', f: F.board };
    if (inRect(F.bench, wx, wy)) return { id: 'recipes', f: F.bench };
    if (inRect(F.boiler, wx, wy)) return { id: 'recipes', f: F.boiler };
    return null;
  }
  function floorAt(wx, wy) {
    const g = data.geom, st = E.shown.stage;
    if (st >= 4 && wx >= g.WING.x0 && wy >= g.WING.top && wy <= g.F0) return 'library';
    if (wx < g.X0 - 6 || wx > g.X1 + 6) return null;
    if (wy >= g.F1 && wy <= g.F0 + 4) return 'research';
    if (st >= 2 && wy >= g.F2 && wy < g.F1) return 'workroom';
    if (st >= 3 && wy < g.F2 && wy >= g.S - 70) return 'dome';
    return null;
  }
  function targetAt(x, y) {
    const wx = cam.x + x / s, wy = LH - (H - y) / s, M = E.mouse;
    if (M.on && wx >= M.x && wx < M.x + 22 && wy >= M.y - 22 && wy <= M.y + 1) return { mouse: true };
    const it = furnitureAt(wx, wy); if (it) return { item: it };
    return { floor: floorAt(wx, wy) };
  }
  function press(f) {
    const p = document.createElement('i'); p.className = 'bd-press'; p.style.left = toX(f.wx) + 'px'; p.style.top = toY(f.wy) + 'px'; p.style.width = f.w * s + 'px'; p.style.height = f.h * s + 'px'; ui.appendChild(p); setTimeout(() => p.remove(), 300);
  }
  function onTap(t, x, y) {
    o.ghostAt(x, y);
    if (o.covered()) return;
    if (t.mouse) { const m = inLab(); if (!m) return; if (picked) return o.open('card', m.id); picked = true; panelSig = ''; paintTag(); return; }
    picked = false; paintTag();
    if (t.item) { press(t.item.f); return openItem(t.item.id); }
    if (t.floor) return tapFloor(t.floor);
    pickFloor(null);
  }
  function paintTag() {
    const m = picked && inLab();
    if (!m) { tag.classList.remove('in'); return; }
    const M = E.mouse, x = Math.max(70, Math.min(W - 70, toX(M.x + 11))), y = Math.max(o.top(), toY(M.y) + 4);
    tag.style.left = Math.round(x) + 'px'; tag.style.top = Math.round(y) + 'px'; tag.classList.add('in');
    const t = '<b>' + m.name + ' ›</b><small>' + (statusNow(true) || 'Researcher') + '</small>'; if (tag.dataset.t !== t) { tag.dataset.t = t; tag.innerHTML = t; }
  }

  // ---------- El panel de abajo: el de MAIN, con lo que está pasando aquí ----------
  const JOB = { recipe: 'new recipe', strain: 'new strain', study: 'new cheese', blueprint: 'blueprint' };
  const SPOT_TXT = { bench: 'at the bench', jar: 'checks the jars', dish: 'counts the coins', gauge: 'checks the gauge', board: 'at the board', compact: 'at the culture box', desk: 'at the desk', incub: 'at the culture cabinet', draft: 'at the drawing table', tele: 'at the telescope', archive: 'reads the archive' };
  function statusNow(forTag) {
    const c = G(), L = c.lab, m = inLab(), who = m ? m.name : '', j = L.job;
    if (!forTag && E.busyObra) return 'Building the lab';
    if (j) return (m ? who + ': ' : 'By hand: ') + (j.retried ? 'trying again' : JOB[j.kind] || 'research');
    if (!m) return L.nodes.assistant ? 'No researcher' : forTag ? '' : 'Research by hand';
    if (idleNow === 'noBase') return who + ': no Cheese Base';
    if (idleNow === 'noCoin') return who + ': no coins';
    if (L.nodes.advanced && !L.dir) return who + ': choose a direction';
    return who + ' ' + (SPOT_TXT[E.mouse.at] || 'in the lab');
  }
  function flowNow() {
    const c = G(), L = c.lab, parts = [];
    if (floor) {
      const items = itemsOf(floor), id = floor === 'workroom' ? 'lab.queue' : floor === 'dome' ? 'lab.desk' : floor === 'library' ? 'lab.library' : null;
      if (!items.length && id) { const q = Pg.status(c, id).requires.find((r) => !r.ok); if (q) return 'Needs: ' + q.text; }
    }
    if (L.nodes.queue) parts.push('Queue ' + L.queue.length + '/' + Lb.queueCap(c));
    if (L.done.strains) parts.push(L.done.strains + ' strains');
    if (L.job && parts.length < 2) parts.push(dur(left(L.job)) + ' left');
    if (parts.length < 2) parts.unshift(L.known.length + ' recipes');
    return parts.slice(0, 2).join(' · ');
  }
  function paintPanel(force) {
    const c = G(), L = c.lab, items = floor ? itemsOf(floor) : [], bar = L.job ? progress(L.job) : 0;
    const name = floor ? NAME[floor] : 'CHEESE LAB', status = statusNow(), flow = flowNow(), sub = floor ? (items.length ? 'Choose' : 'Upgrades') : floorsNow().length > 1 ? 'Tap a floor' : 'Research', crew = (inLab() ? 1 : 0) + '/' + (L.nodes.assistant ? 1 : 0);
    $('pn-bar').style.width = Math.round(bar * 100) + '%';
    const sig = [name, status, flow, sub, crew, !!L.job].join('|'); if (!force && sig === panelSig) return; panelSig = sig;
    const icon = o.icon('ic_flask'); if ($('pn-ic').getAttribute('src') !== icon) $('pn-ic').src = icon;
    $('pn-name').textContent = name; $('pn-lv').textContent = ''; $('pn-bot').textContent = ''; $('pn-st').dataset.bo = 0; $('pn-st').classList.remove('na'); $('pn-st').setAttribute('aria-label', 'Cheese Lab panel'); $('pn-st').tabIndex = 0;
    $('pn-status').textContent = status; $('pn-status').className = 'pn-status ' + (L.job ? 'good' : idleNow ? 'stop' : ''); $('pn-flow').textContent = flow;
    $('pn-crewn').textContent = crew; $('pn-actb').textContent = 'OPEN'; $('pn-acts').textContent = sub;
    const a = $('pn-act'); a.classList.remove('dig', 'off', 'manual', 'rush'); a.style.setProperty('--q', '0'); $('pn-bar').parentElement.classList.remove('rush');
  }
  // ---------- Bocadillos: solo lo que acaba de pasar de verdad ----------
  function speakDiff(a, b) {
    if (!BUB || !b.worker) return;
    const m = inLab(), say = (t, pri = 1) => BUB.say({ id: m.id }, t, pri);
    if (b.known > a.known) say('New recipe!');
    else if (b.dishes > a.dishes) say('A new strain!');
    else if (b.marks > a.marks) say('New cheese studied!');
    else if (b.rolls > a.rolls) say('Blueprint ready.');
    else if (b.job && a.job && !a.job.retried && b.job.retried) say('Inconclusive. Once more.');
    else if (b.idle === 'noBase' && a.idle !== 'noBase') say('Out of Cheese Base.');
    else if (b.idle === 'noCoin' && a.idle !== 'noCoin') say('Out of coins.');
  }

  // ---------- Carga ----------
  function preload() {
    if (data || loading || failed) return;
    loading = true;
    const v = '?v=' + (window.BETA_BUILD || 'dev'), image = (n) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('lab/' + n)); i.src = 'lab/' + n + '.png' + v; });
    fetch('lab/data.json' + v).then((r) => { if (!r.ok) throw new Error('lab/data.json'); return r.json(); }).then(async (d) => {
      const [a, l] = await Promise.all([image('atlas'), image('land')]);
      for (const n of ['glass', ...d.backs.filter((b) => b !== 'glass')]) layers[n] = await image(n); // de una en una: que cargar el LAB no le quite fotogramas a MAIN
      atlas = a; land = l; F = d.frames; data = d; loading = false;
    }).catch((e) => { console.warn(e); loading = false; failed = true; });
  }

  // ---------- Lo que pide el gestor de escenas ----------
  return {
    keep: true, content: true, preload, baseline,
    get engine() { return E; }, get ops() { return R ? R.ops : 0; }, get floor() { return floor; }, get picked() { return picked; }, get scale() { return s; }, get camera() { return cam; }, get view() { return viewNow(); },
    ready: () => !!data,
    hits: { targetAt, toX, toY, itemsOf, pickFloor },
    init() {
      el = document.createElement('div'); el.className = 'lab-scene'; el.dataset.scene = 'lab'; o.host.appendChild(el);
      cv = document.createElement('canvas'); cv.className = 'lab-cv'; cv.setAttribute('aria-label', 'Inside the Cheese Lab'); el.appendChild(cv); gc = cv.getContext('2d');
      ui = document.createElement('div'); ui.className = 'lab-ui'; el.appendChild(ui);
      bub = document.createElement('div'); bub.className = 'lab-bub'; el.appendChild(bub);
      tag = document.createElement('button'); tag.className = 'focus-tag'; ui.appendChild(tag); tag.addEventListener('click', () => { const m = inLab(); if (m) o.open('card', m.id); });
      back = document.createElement('button'); back.className = 'home-btn bx in lab-back'; back.setAttribute('aria-label', 'Back to MAIN'); back.innerHTML = '<span>← MAIN</span>'; back.addEventListener('click', () => o.goMain()); ui.appendChild(back);
      R = backend();
      const kit = scene.bubbleKit();
      BUB = window.BetaBubbles({ host: bub, readMs: kit.readMs, tail: kit.tail, head: () => { const M = E && E.mouse; return M && M.on ? { x: toX(M.x + 11), y: toY(M.y - 19), visible: true } : null; }, bounds: () => ({ left: 6, right: W - 6, top: o.top(), bottom: H - 4 }), obstacles: () => [...ui.querySelectorAll('.p0-plate:not([hidden]), .lab-back'), $('goal')].filter(Boolean), canStart: () => !o.covered() });
      E = window.LabAnim(data, R, { seed: (Date.now() % 100000) + 1, reduced: o.reduced(), hold: () => o.covered(), onBuilt: (to) => { remember(to); plateSig = ''; if (BUB && inLab()) BUB.say({ id: inLab().id }, 'Look at this place!', 1); } });
      gesture = window.BetaGesture({
        resolve: targetAt, slop: () => 12, label: (t) => (t.mouse ? 'researcher' : t.item ? t.item.id : t.floor || 'nothing'), press: () => false, pressMove() {}, pressAbort() {},
        cameraStart() {}, cameraMove() {}, cameraEnd() {}, holdMove() {}, holdDrop() {}, holdCancel() {}, tap: onTap,
      });
      const ptr = (e) => { const b = el.getBoundingClientRect(); return { id: e.pointerId, x: e.clientX - b.left, y: e.clientY - b.top, button: e.button, primary: e.isPrimary, kind: e.pointerType }; };
      cv.addEventListener('pointerdown', (e) => { if (gesture.down(ptr(e))) try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
      window.addEventListener('pointermove', (e) => { if (gesture.active) gesture.move(ptr(e)); }, true);
      window.addEventListener('pointerup', (e) => gesture.up(ptr(e)), true);
      window.addEventListener('pointercancel', (e) => gesture.cancel(ptr(e)), true);
      cv.addEventListener('lostpointercapture', (e) => gesture.cancel(ptr(e), 'lost'));
      cv.addEventListener('contextmenu', (e) => e.preventDefault()); cv.addEventListener('selectstart', (e) => e.preventDefault());
      cv.addEventListener('touchmove', (e) => { if (gesture.active) e.preventDefault(); }, { passive: false });
      cv.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    },
    enter() {
      o.host.hidden = false; el.hidden = false; on = true; o.panel(true); W = 0; layout(); last = performance.now();
      const L = G().lab; idleSnap.noBase = L.idleMs.noBase; idleSnap.noCoin = L.idleMs.noCoin; idleSnap.noTarget = L.idleMs.noTarget;
      prev = viewNow();
      if (!started) { E.init(prev, shownSaved()); started = true; } else E.resume(prev);
      E.render(camNow()); E.clean(); paintPanel(true); paintPlates();
    },
    frame(now) {
      if (layout()) { E.render(camNow()); paintPlates(); }
      const dt = Math.min(250, now - last); last = now;
      if (E.step(dt)) { const v = viewNow(); speakDiff(prev, v); E.setView(v); prev = v; }
      const covered = o.covered();
      if (E.dirty && (!covered || now - lastDraw >= 66)) { lastDraw = now; E.render(camNow()); E.clean(); }
      if (now - lastPaint > 180) { lastPaint = now; paintPanel(false); if (!covered) { paintPlates(); paintTag(); } }
      BUB.tick(now);
    },
    leave() { if (gesture) gesture.reset('scene'); if (BUB) BUB.clear(); picked = false; floor = null; if (tag) tag.classList.remove('in'); if (el) el.hidden = true; o.host.hidden = true; on = false; o.panel(false); },
    panelAct() { if (floor) { const it = itemsOf(floor); if (it.length === 1) return openItem(it[0].id, it[0].build); if (!it.length) return o.open('tree', 'lab'); for (const b of plates.values()) if (!b.hidden && b.classList.contains('on')) o.pulse(b, 'bump', 320); return; } return o.open('labrecipes'); },
    panelStation() { o.open('lab'); },
    panelCrew() { const m = inLab(), L = G().lab; if (m) return o.open('card', m.id); if (L.nodes.assistant) return o.open('post', 'research:all'); return o.open('tree', 'lab'); },
    get on() { return on; },
  };
};
