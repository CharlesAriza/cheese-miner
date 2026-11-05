// CHEESE DRILLER BETA · LAB: la escena jugable, con el arte y las animaciones aprobados (lab-anim.js y lab/). Aquí no hay economía: lee la partida, se la enseña al
// motor (viewNow) y convierte cada toque en una hoja Pulido+. Quien investiga y lo que gasta lo decide el núcleo, que avanza igual con esta escena a la vista o sin ella.
// Lo único suyo que se guarda es qué obras ha visto ya el jugador (acción `seen` del núcleo): cada una se ve una vez, aunque se haya comprado desde otra pantalla.
// Se recorre como MAIN y con su mismo tamaño de píxel: vista de base al pie del edificio, arrastrar en vertical para recorrer las plantas, tocar una estación para abrirla. Su cámara se conserva al salir y al volver.
// El cielo (drawFar) y la tierra (drawGround) son los comunes de la colonia: este lienzo solo pinta el edificio. Los iconos no reciben toques: todo toque pasa por un único gesto sobre el lienzo y da un único resultado.
window.BetaLabScene = function (o) {
  const $ = (id) => document.getElementById(id);
  const { G, Core, Pg, Lb, REAL, fmt, recipeName, scene } = o;
  const PAD = 140, LW = 320, LH = 430, HUD_SPACE = 66, TOWER_ROWS = 305, BASE_W = 250;
  const SHOWN = { queueNode: 'lab.shown.queue', strainsNode: 'lab.shown.strains', deskNode: 'lab.shown.desk', libraryNode: 'lab.shown.library' };
  const stageSeen = (n) => 'lab.shown.stage' + n;
  const dur = (ms) => { const t = Math.max(1, Math.ceil(ms / 1000)); return t < 60 ? t + 's' : t < 3600 ? Math.ceil(t / 60) + 'm' : Math.floor(t / 3600) + 'h ' + Math.ceil((t % 3600) / 60) + 'm'; };

  let data = null, F = null, atlas = null, loading = false, failed = false; const layers = {};
  let E = null, R = null, el = null, cv = null, gc = null, ui = null, bub = null, stagePlate = null, gesture = null, BUB = null, back = null;
  let W = 0, H = 0, sG = 1, sN = 1, sF = 1, sFit = 1, selCv = null, tag = null, tagAt = 0, selBob = -1, vw = 0, vh = 0, cam = { x: 0, y: 0, w: 0, h: 0 }, last = 0, lastDraw = 0, lastPaint = 0, panelSig = '', sel = null, picked = false, on = false, started = false, home = null, needMsg = '';
  // La cámara: centro y escala de lo que se ve. general · near (explorar) · follow (el investigador).
  const C = { mode: 'general', cx: 0, cy: 0, s: 1, tw: null, zoom: null, vx: 0, vy: 0, dragging: false, lat: null, sig: '' };
  let selUntil = 0, sweepDone = false, entered = false, rawX = 0, rawX0 = 0; const flashes = []; // rawX: el dedo en la pantalla; el viaje mueve esta escena y no puede medirse con ella
  let prev = null; const idleSnap = { noBase: 0, noCoin: 0 }; let idleNow = null;
  const icons = new Map(), mice = new Map(), statics = new Map();

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
      begin(x, y) { cx = x; cy = y; g.imageSmoothingEnabled = false; api.ops = 0; g.clearRect(0, 0, vw, vh); },
      end() {},
      layer(n) { if (n !== 'sky') g.drawImage(layers[n], -cx, -cy); api.ops++; }, // el cielo y la tierra son los comunes
      spr(n, x, y, flip) {
        if (n.charCodeAt(0) === 77) { const c = mouseSprite(n); if (c) { if (flip) { g.save(); g.translate(x - cx + c.width, y - cy); g.scale(-1, 1); g.drawImage(c, 0, 0); g.restore(); } else g.drawImage(c, x - cx, y - cy); api.ops++; return; } }
        if (n.length === 2 && n[0] === 'c') return; // las nubes son las del cielo común
        const f = F[n]; if (x === undefined) { x = f.wx; y = f.wy; }
        if (flip) { g.save(); g.translate(x - cx + f.w, y - cy); g.scale(-1, 1); g.drawImage(atlas, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); g.restore(); } else g.drawImage(atlas, f.x, f.y, f.w, f.h, x - cx, y - cy, f.w, f.h);
        api.ops++;
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
    // El mismo píxel que MAIN (su escala de base): pasar de una escena a otra no cambia el tamaño del dibujo. Cerca y siguiendo, un paso más, como MAIN.
    // La obra se ve entera, con la escala que quepa, porque está aprobada a encuadre completo; el lienzo se dibuja para ese encuadre, el más amplio.
    const dB = Math.max(1, Math.round(scene.baseFor(W) * dpr)), dFit = Math.max(1, Math.min(dB, Math.floor((W * dpr) / BASE_W), Math.floor(((H - HUD_SPACE) * dpr) / TOWER_ROWS)));
    sG = dB / dpr; sN = sF = (dB + 1) / dpr; sFit = dFit / dpr; vw = Math.ceil(W / sFit) + 2; vh = Math.ceil(H / sFit);
    if (cv.width !== vw || cv.height !== vh) { cv.width = vw; cv.height = vh; } cv.style.width = vw * sFit + 'px'; cv.style.height = vh * sFit + 'px';
    C.sig = ''; if (!started) return true; // la primera vez la coloca enter(), con el motor ya en marcha
    // Otro tamaño (girar el móvil, la barra del navegador): cada modo recupera su escala, que depende del ancho.
    C.tw = null; C.vx = C.vy = 0; if (C.mode === 'obra') Object.assign(C, obraFrame()); else { C.s = C.mode === 'general' ? sG : sN; clampCam(); } return true;
  }
  const camNow = () => { cam.x = Math.round(E.camX + BASE_W / 2 - vw / 2); cam.y = LH - vh; cam.w = vw; cam.h = vh; return cam; };
  const toX = (wx) => W / 2 + (wx - C.cx) * C.s, toY = (wy) => H / 2 + (wy - C.cy) * C.s, fromX = (x) => C.cx + (x - W / 2) / C.s, fromY = (y) => C.cy + (y - H / 2) / C.s;
  const generalCx = () => E.camX + BASE_W / 2, generalCy = (s) => LH - H / (2 * s);
  function placeGeneral() { C.s = sG; C.cx = generalCx(); C.cy = generalCy(sG); clampCam(); }
  const obraFrame = () => ({ s: sFit, cx: generalCx(), cy: generalCy(sFit) });
  // Límites, sin rebote, y en horizontal nunca más allá de lo dibujado. De lado, el arrastre solo mueve con el ala de la fase IV (panX);
  // seguir al investigador o enfocar un mueble sí desplaza la cámara, dentro de lo dibujado.
  const panX = () => E.shown.stage >= 4;
  function limits(s) {
    const g = data.geom, c = generalCx(), hv = H / (2 * s), wv = W / (2 * s), top = E.shown.stage >= 3 ? g.S - 96 : E.shown.stage === 2 ? g.F2 - 54 : g.F1 - 54; let cxMin = c, cxMax = c;
    if (s > sFit * 1.001) { camNow(); const x1 = panX() ? g.WING.x1 + 10 : g.X1 + 10; cxMin = Math.min(c, Math.max(cam.x, g.X0 - 10) + wv); cxMax = Math.max(c, Math.min(cam.x + vw, x1) - wv); }
    return { cxMin, cxMax, cyMin: Math.min(top + hv, LH - hv), cyMax: LH - hv };
  }
  function clampCam() { const L = limits(C.s); C.cx = Math.max(L.cxMin, Math.min(L.cxMax, C.cx)); C.cy = Math.max(L.cyMin, Math.min(L.cyMax, C.cy)); }
  const clampTo = (t) => { const L = limits(t.s); return { s: t.s, cx: Math.max(L.cxMin, Math.min(L.cxMax, t.cx)), cy: Math.max(L.cyMin, Math.min(L.cyMax, t.cy)) }; };
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  // Una sola curva para moverse y acercarse, de 0,35 a 0,8 s según la distancia: la de MAIN.
  function flyTo(t, then) {
    C.vx = C.vy = 0; const to = clampTo(t), dist = Math.hypot(to.cx - C.cx, to.cy - C.cy) * C.s + Math.abs(to.s - C.s) * 160;
    if (o.reduced() || dist < 1) { C.cx = to.cx; C.cy = to.cy; C.s = to.s; C.tw = null; if (then) then(); return; }
    C.tw = { f: { cx: C.cx, cy: C.cy, s: C.s }, t: to, t0: performance.now(), ms: Math.max(350, Math.min(800, 300 + dist * 0.9)), then };
  }
  function goGeneral(then) { C.mode = 'general'; sel = null; picked = false; needMsg = ''; panelSig = ''; flyTo({ s: sG, cx: generalCx(), cy: generalCy(sG) }, () => { placeGeneral(); if (then) then(); }); }
  // La obra manda: mientras se construye, la cámara la encuadra entera y no se mueve con el dedo. Al acabar, vuelve a la vista de base.
  function obraTick() {
    const b = !!E.busyObra;
    if (b && C.mode !== 'obra') { C.mode = 'obra'; sel = null; picked = false; needMsg = ''; panelSig = ''; C.dragging = false; if (C.lat) C.lat.mode = 'none'; flyTo(obraFrame()); }
    else if (!b && C.mode === 'obra') goGeneral();
  }
  function camStep(now, dt) {
    if (C.tw) { const T = C.tw; if (C.mode === 'obra') T.t.cx = generalCx(); const k = Math.min(1, (now - T.t0) / T.ms), e = ease(k); C.cx = T.f.cx + (T.t.cx - T.f.cx) * e; C.cy = T.f.cy + (T.t.cy - T.f.cy) * e; C.s = T.f.s * Math.pow(T.t.s / T.f.s, e); if (k >= 1) { C.tw = null; C.s = T.t.s; C.cx = T.t.cx; C.cy = T.t.cy; if (T.then) T.then(); } }
    else if (C.mode === 'obra') Object.assign(C, obraFrame());
    else if (C.mode === 'follow') { const M = E.mouse; if (!M.on) goGeneral(); else { C.cx += (M.x + 11 - C.cx) * Math.min(1, dt / 120); C.cy += (M.y - 26 - C.cy) * Math.min(1, dt / 120); clampCam(); } }
    else if (!C.dragging) {
      if (Math.abs(C.vx) > 0.002 || Math.abs(C.vy) > 0.002) { C.cx += C.vx * dt; C.cy += C.vy * dt; const f = Math.pow(0.9, dt / 16); C.vx *= f; C.vy *= f; } else C.vx = C.vy = 0;
      const px = C.cx, py = C.cy; clampCam(); if (C.cx !== px) C.vx = 0; if (C.cy !== py) C.vy = 0;
    }
    paintCam();
  }
  function paintCam() {
    const dpr = window.devicePixelRatio || 1, k = C.s / sFit, snap = (v) => Math.round(v * dpr) / dpr, tx = snap(W / 2 + (cam.x - C.cx) * C.s), ty = snap(H / 2 + (cam.y - C.cy) * C.s), sig = tx + ':' + ty + ':' + k.toFixed(4);
    if (sig === C.sig) return false; C.sig = sig; cv.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + k + ')'; return true;
  }

  // ---------- Estaciones: cada una es un mueble del arte aprobado, con su icono en un sitio fijo ----------
  const STATIONS = [
    { id: 'recipes', cap: 'l', name: 'RECIPES', ic: 'ic_flask', frames: () => ['bench', 'boiler'], view: 'recipes', on: () => true },
    { id: 'studies', cap: 'r', name: 'STUDIES', ic: 'ic_lot_cheddar', frames: () => ['board'], view: 'studies', on: () => true },
    { id: 'strains', name: 'STRAINS', dish: true, frames: () => [lowBox() ? 'compact' : 'incubator'], view: 'strains', node: 'strains', on: () => E.shown.strainsNode },
    { id: 'queue', cap: 'r', name: 'QUEUE', note: true, frames: () => ['queue3'], view: 'queue', node: 'queue', min: 2, on: () => E.shown.queueNode },
    { id: 'desk', cap: 'r', name: 'PLANS', plan: true, frames: () => ['draft'], view: 'desk', node: 'desk', min: 3, on: () => E.shown.deskNode },
    { id: 'library', cap: 'l', name: 'LIBRARY', jar: true, frames: () => ['archive'], view: 'library', node: 'library', min: 4, on: () => E.shown.libraryNode },
  ];
  const lowBox = () => !(E.shown.stage >= 2 && finishedOf(E.shown));
  const stationBy = (id) => STATIONS.find((x) => x.id === id);
  const capOf = (st) => st.cap || (lowBox() ? 'l' : 'r'); // el nombre, siempre al mismo lado de su mueble
  // Se puede comprar ya: silueta azul e icono verde. Lleva al árbol con la mejora elegida.
  const canBuy = (st) => { const c = G(), L = c.lab; return st.node && !L.nodes[st.node] && Pg.isOpen(c, 'lab.' + st.node) && E.shown.stage >= (st.min || 1); };
  const lockedOf = (st) => st.id === 'studies' && !studiesOn();
  const studiesOn = () => { const c = G(); return E2.PARAMS.strata.some((st) => st.id !== 'cheddar' && Pg.has('study.' + st.id) && Pg.isOpen(c, 'study.' + st.id)); };
  const nextStage = () => { const c = G(), n = c.lab.phase + 1; return n <= 4 && !E.busyObra && E.shown.stage === c.lab.phase && Pg.has('lab.phase' + n) && Pg.isOpen(c, 'lab.phase' + n) ? n : 0; };
  const rectOf = (st) => { const fs = st.frames().map((n) => F[n]).filter(Boolean); return fs[0]; };
  const activeStation = () => { const j = G().lab.job; if (!j) return null; return j.kind === 'recipe' ? 'recipes' : j.kind === 'study' ? 'studies' : j.kind === 'strain' ? 'strains' : null; };
  const stIcon = (st) => { if (st.ic) return o.icon(st.ic); if (st.dish) return ART.dish; if (st.note) return ART.note; if (st.plan) return ART.plan; return ART.jar; };
  function pix(rows, pal) { const w = Math.max(...rows.map((r) => r.length)), h = rows.length, c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2; const g = c.getContext('2d'), at = (x, y) => (rows[y] && rows[y][x] && rows[y][x] !== '.' ? rows[y][x] : null); for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) { const ch = at(x, y); if (ch) g.fillStyle = pal[ch]; else if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) g.fillStyle = '#1b1220'; else continue; g.fillRect(x + 1, y + 1, 1, 1); } return c.toDataURL(); }
  const ART = { dish: pix(['.sssss.', 's.g.v.s', 's.gvv.s', 's.vg..s', '.sssss.'], { s: '#cfe0ec', g: '#7ae08a', v: '#b58cff' }), note: pix(['...DDDD...', '.BBDGGDBB.', 'BPPPPPPPPB', 'BPLLPLLLPB', 'BPPPPPPPPB', 'BPLLPLLLPB', 'BPPPPPPPPB', 'BBBBBBBBBB'], { B: '#a8703a', D: '#6c7a96', G: '#c9d1e0', P: '#f4efe0', L: '#6b5a4a' }), plan: pix(['BBBBBBBBBB', 'BLLLLLLLLB', 'BLBBBBBBLB', 'BLBLLLLBLB', 'BLBLBBBBLB', 'BLLLBBBBLB', 'BBBBBBBBBB'], { B: '#27508c', L: '#dceaf6' }), jar: pix(['.WWWWW.', 'GGGGGGG', 'GYYYYYG', 'GYYYYYG', 'GYYOOYG', 'GOOOOOG', 'GGGGGGG'], { W: '#b67a3e', G: '#9fb8c4', Y: '#ffe08a', O: '#d8a828' }), lock: pix(['..sss..', '.s...s.', '.s...s.', 'yyyyyyy', 'yyykyyy', 'yyykyyy', 'YYYYYYY'], { s: '#c6c4dc', y: '#ffcf2e', Y: '#b88a30', k: '#1b1220' }) };
  function iconFor(st) {
    let b = icons.get(st.id); if (b) return b;
    b = document.createElement('div'); b.className = 'st-ic'; b.setAttribute('role', 'img'); b.setAttribute('aria-label', st.name);
    b.innerHTML = '<i class="st-box"><img class="pix" alt="" src="' + stIcon(st) + '"><img class="pix st-lk" alt="" src="' + ART.lock + '"></i><span class="st-cap">' + st.name + '</span>';
    ui.appendChild(b); icons.set(st.id, b); return b;
  }
  // El icono va siempre en el mismo sitio del mueble y siempre del mismo tamaño: una esquina superior. Solo cambia su estado.
  const ICON = 26, anchorOf = (st) => { const f = rectOf(st); return [f.wx + f.w, f.wy]; };
  function paintIcons() {
    const near = C.s > sG * 0.99, act = activeStation(), top = o.top();
    for (const st of STATIONS) {
      const buy = canBuy(st), onNow = st.on(), vis = (onNow || (buy && !E.busyObra)) && !!rectOf(st);
      let b = icons.get(st.id); if (!vis) { if (b) b.hidden = true; continue; } b = iconFor(st);
      const [ax, ay] = anchorOf(st), x = Math.round(toX(ax) - ICON + 6), y = Math.round(toY(ay) - ICON + 8);
      b.hidden = false; b.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; b.style.opacity = y < top - 6 ? 0 : 1;
      const lock = onNow && lockedOf(st), state = (buy ? 'b' : lock ? 'l' : sel === st.id ? 'a' : '') + (near || buy ? 'n' : '') + (act === st.id ? 'w' : '') + capOf(st);
      if (b.dataset.s !== state) { b.dataset.s = state; b.classList.toggle('build', !!buy); b.classList.toggle('lock', !!lock); b.classList.toggle('on', state[0] === 'a'); b.classList.toggle('named', state.includes('n') && !lock); b.classList.toggle('busy', state.includes('w')); b.classList.toggle('flip', capOf(st) === 'l'); }
    }
    for (const fl of flashes) fl.c.style.transform = 'translate3d(' + toX(fl.f.wx) + 'px,' + toY(fl.f.wy) + 'px,0) scale(' + C.s + ')';
    paintFocus();
    const n = nextStage(); if (stagePlate.hidden === !!n) stagePlate.hidden = !n;
    if (n) { const g = data.geom, sh = E.shown, wy = sh.stage === 1 ? g.F1 - 40 : sh.stage === 2 ? g.F2 - 40 : g.S - 92, t = 'STAGE ' + n; if (stagePlate.firstChild.textContent !== t) stagePlate.firstChild.textContent = t; stagePlate.style.left = Math.round(toX(g.CX) - stagePlate.offsetWidth / 2) + 'px'; stagePlate.style.top = Math.round(Math.max(top, toY(wy))) + 'px'; }
    if (home) { const show = C.mode === 'near' || C.mode === 'follow' || (C.mode === 'general' && C.cy < generalCy(sG) - 8); if (home.hidden === show) home.hidden = !show; }
  }
  // El investigador seguido: las esquinas doradas y la flecha de MAIN, y su etiqueta con nombre, oficio y lo que hace. Tocar la etiqueta abre su ficha.
  function paintFocus() {
    const M = E.mouse, m = inLab(), show = C.mode === 'follow' && picked && M.on && m && !o.covered();
    if (!show) { if (selCv) selCv.hidden = true; if (tag) tag.classList.remove('in'); return; }
    if (!selCv) { selCv = document.createElement('canvas'); selCv.className = 'lab-sel'; selCv.width = 26; selCv.height = 36; ui.appendChild(selCv); tag = document.createElement('button'); tag.className = 'focus-tag lab-tag'; tag.addEventListener('click', () => { const r = inLab(); if (r) o.open('card', r.id); }); ui.appendChild(tag); }
    const bob = Math.floor(performance.now() / 400) % 2;
    if (bob !== selBob) {
      selBob = bob; const q = selCv.getContext('2d'), c = '#ffcf2e', R = (x, y, w, h, col) => { q.fillStyle = col; q.fillRect(x, y, w, h); }; q.clearRect(0, 0, 26, 36);
      const x = 1, y = 11, w = 24, h = 26; for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) { R(Math.min(cx, cx + sx * 3), cy, 4, 1, c); R(cx, Math.min(cy, cy + sy * 3), 1, 4, c); }
      const ay = 5 - bob; R(11, ay, 5, 1, c); R(12, ay + 1, 3, 1, c); R(13, ay + 2, 1, 1, c); R(11, ay - 1, 5, 1, '#1b1220');
    }
    selCv.hidden = false; selCv.style.transform = 'translate3d(' + toX(M.x - 2) + 'px,' + toY(M.y - 34) + 'px,0) scale(' + C.s + ')';
    const now = performance.now(); if (now - tagAt > 300) { tagAt = now; tag.innerHTML = '<b>' + m.name + ' ›</b><small>Researcher</small><small>' + statusNow().replace(m.name + ': ', '').replace(m.name + ' ', '') + '</small>'; }
    tag.style.left = Math.round(toX(M.x + 11)) + 'px'; tag.style.top = Math.round(toY(M.y + 3)) + 'px'; tag.classList.add('in');
  }
  // ---------- Un toque, un resultado: icono y mueble son la misma estación ----------
  const inF = (f, x, y, m = 0) => f && x >= f.wx - m && x < f.wx + f.w + m && y >= f.wy - m && y < f.wy + f.h + m;
  function stationAt(sx, sy) {
    const wx = fromX(sx), wy = fromY(sy);
    for (const st of STATIONS) { const buy = canBuy(st); if (!(st.on() || buy) || !rectOf(st)) continue; const [ax, ay] = anchorOf(st), ix = toX(ax) - ICON + 6, iy = toY(ay) - ICON + 8; if (sx >= ix - 4 && sx <= ix + ICON + 4 && sy >= iy - 4 && sy <= iy + ICON + 4) return st; const b = icons.get(st.id), capW = b && b.classList.contains('named') ? b.lastChild.offsetWidth : 0; if (capW && sy >= iy && sy <= iy + ICON && (capOf(st) === 'l' ? sx >= ix - capW - 4 && sx < ix : sx > ix + ICON && sx <= ix + ICON + capW + 4)) return st; }
    for (const st of STATIONS) { const buy = canBuy(st); if (!(st.on() || buy)) continue; for (const n of st.frames()) if (inF(F[n], wx, wy, 1)) return st; }
    return null;
  }
  function floorAt(wx, wy) {
    const g = data.geom, st = E.shown.stage;
    if (st >= 4 && wx >= g.WING.x0 && wx <= g.WING.x1 + 4 && wy >= g.WING.top && wy <= g.F0) return { cy: g.F0 - 44 };
    if (wx < g.X0 - 6 || wx > g.X1 + 6) return null;
    if (wy >= g.F1 && wy <= g.F0 + 4) return { cy: (g.F1 + g.F0) / 2 };
    if (st >= 2 && wy >= g.F2 && wy < g.F1) return { cy: (g.F2 + g.F1) / 2 };
    if (st >= 3 && wy < g.F2 && wy >= g.S - 70) return { cy: g.F2 - 44 };
    return null;
  }
  function targetAt(x, y) {
    const M = E.mouse, wx = fromX(x), wy = fromY(y), sb = !stagePlate.hidden && stagePlate.getBoundingClientRect(), box = el.getBoundingClientRect();
    if (sb && x >= sb.left - box.left - 6 && x <= sb.right - box.left + 6 && y >= sb.top - box.top - 6 && y <= sb.bottom - box.top + 6) return { stage: nextStage() };
    const mm = 7 / C.s; // unos píxeles de margen: el ratón es pequeño en la vista general
    if (M.on && wx >= M.x + 2 - mm && wx < M.x + 20 + mm && wy >= M.y - 20 - mm && wy <= M.y + 1 + mm) return { mouse: true };
    const st = stationAt(x, y); if (st) return { st };
    return { floor: floorAt(wx, wy) };
  }
  // Respuesta breve de que eso es un mueble: su silueta se aclara un instante. Nada queda brillando.
  function flash(st) {
    for (const n of st.frames()) {
      const f = F[n]; if (!f) continue;
      const c = document.createElement('canvas'), fl = { c, f }; c.width = f.w; c.height = f.h; c.className = 'st-flash'; const q = c.getContext('2d'); q.drawImage(atlas, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#fff'; q.fillRect(0, 0, f.w, f.h);
      c.style.transform = 'translate3d(' + toX(f.wx) + 'px,' + toY(f.wy) + 'px,0) scale(' + C.s + ')'; ui.insertBefore(c, ui.firstChild); flashes.push(fl);
      setTimeout(() => { c.remove(); flashes.splice(flashes.indexOf(fl), 1); }, 280);
    }
  }
  // Al llegar por primera vez, un solo repaso por los muebles que se pueden tocar.
  function sweep() { if (sweepDone || o.reduced()) { sweepDone = true; return; } sweepDone = true; let i = 0; const list = STATIONS.filter((st) => st.on() && rectOf(st)); (function next() { if (!on || i >= list.length || C.mode !== 'general') return; flash(list[i++]); setTimeout(next, 170); })(); }
  // Tocar una estación abre su panel al momento, y detrás la cámara se acerca al mueble. Al cerrar, sigues ahí y deja de estar marcada.
  function focusStation(st, openIt) {
    const f = rectOf(st), buy = canBuy(st), lock = st.on() && lockedOf(st);
    sel = st.id; selUntil = performance.now() + 900; picked = false; needMsg = lock ? 'Needs the next stratum' : ''; panelSig = ''; flash(st); const b = icons.get(st.id); if (b) o.pulse(b.firstChild, 'bump', 320);
    if (C.mode !== 'obra') { C.mode = 'near'; flyTo({ s: sN, cx: f.wx + f.w / 2, cy: f.wy + f.h / 2 + (openIt && !lock ? (H * 0.22) / sN : 0) }); } // con panel, el mueble queda encima de él
    if (!openIt || lock) return;
    if (buy) o.open('treenode', 'lab.' + st.node); else o.open('labview', st.view);
  }
  function onTap(t, x, y) {
    o.ghostAt(x, y);
    if (o.covered()) return;
    if (t.stage) return o.open('treenode', 'lab.phase' + t.stage);
    if (C.mode === 'obra' && !t.st && !t.stage) return;
    if (t.mouse) { const m = inLab(); if (!m) return; if (picked) return o.open('card', m.id); picked = true; sel = null; panelSig = ''; C.mode = 'follow'; flyTo({ s: sF, cx: E.mouse.x + 11, cy: E.mouse.y - 26 }); return; }
    if (t.st) return focusStation(t.st, true);
    if (t.floor) { sel = null; picked = false; panelSig = ''; C.mode = 'near'; return flyTo({ s: sN, cx: C.s >= sN * 0.99 ? C.cx : fromX(x), cy: t.floor.cy }); }
    if (C.mode !== 'general') goGeneral();
  }
  // Arrastrar: el primer movimiento decide el eje y no cambia en todo el gesto. Vertical: recorrer las plantas. Horizontal a la derecha, solo si la cámara ya está en su límite izquierdo al empezar: de vuelta a MAIN.
  // Con el ala de la fase IV, horizontal recorre hasta su borde exacto y ahí se para: pasar a MAIN pide un gesto nuevo. La inercia sale de la velocidad real de los últimos 100 ms del dedo.
  const camStart = (x, y) => { C.lat = { cx0: rawX0, x0: x, y0: y, lx: x, ly: y, pts: [[performance.now(), x, y]], mode: null }; if (C.mode !== 'obra') C.tw = null; C.vx = C.vy = 0; };
  function camMove(dyy, x, y) {
    const L = C.lat; if (!L) return;
    const t = performance.now(); L.pts.push([t, x, y]); while (L.pts.length > 2 && t - L.pts[0][0] > 100) L.pts.shift();
    if (!L.mode) {
      const dx = x - L.x0, dv = y - L.y0;
      if (Math.abs(dx) > Math.abs(dv) * 1.2) {
        const Q = limits(C.s), room = panX() && Q.cxMax - Q.cxMin > 0.5 && C.mode !== 'obra';
        if (dx > 0 && (!room || C.cx <= Q.cxMin + 0.5) && C.mode !== 'follow' && o.pull.start(L.cx0)) L.mode = 'pull';
        else if (room) { L.mode = 'x'; C.dragging = true; picked = false; if (C.mode === 'follow') C.mode = 'near'; }
        else L.mode = 'none';
      } else if (C.mode === 'obra') L.mode = 'none';
      else { L.mode = 'y'; C.dragging = true; picked = false; if (C.mode === 'follow') { C.mode = 'near'; panelSig = ''; } }
    }
    if (L.mode === 'pull') return o.pull.move(rawX);
    if (L.mode === 'none') return;
    if (L.mode === 'x') { C.cx -= (x - L.lx) / C.s; clampCam(); } else { C.cy -= (y - L.ly) / C.s; clampCam(); }
    L.lx = x; L.ly = y;
  }
  function camEnd() {
    const L = C.lat; C.lat = null; C.dragging = false; if (!L) return; if (L.mode === 'pull') return o.pull.end();
    const P = L.pts, a = P[0], b = P[P.length - 1], dt = b[0] - a[0], fresh = performance.now() - b[0] < 80, cap = (v) => Math.max(-2.5, Math.min(2.5, v));
    C.vx = C.vy = 0; if (!fresh || dt < 12) return;
    if (L.mode === 'x') C.vx = cap(-(b[1] - a[1]) / dt / C.s); else if (L.mode === 'y') C.vy = cap(-(b[2] - a[2]) / dt / C.s);
  }

  // ---------- El panel de abajo: el de MAIN, con lo que está pasando aquí ----------
  const JOB = { recipe: 'new recipe', strain: 'new strain', study: 'new cheese', blueprint: 'blueprint' };
  const SPOT_TXT = { bench: 'at the bench', jar: 'checks the jars', dish: 'counts the coins', gauge: 'checks the gauge', board: 'at the board', compact: 'at the culture box', desk: 'at the desk', incub: 'at the culture cabinet', draft: 'at the drawing table', tele: 'at the telescope', archive: 'reads the archive' };
  function statusNow() {
    const c = G(), L = c.lab, m = inLab(), who = m ? m.name : '', j = L.job;
    if (needMsg) return needMsg;
    if (E.busyObra) return 'Building the lab';
    if (j) return (m ? who + ': ' : 'By hand: ') + (j.retried ? 'trying again' : JOB[j.kind] || 'research');
    if (!m) return L.nodes.assistant ? 'No researcher' : 'Research by hand';
    if (idleNow === 'noBase') return who + ': no Cheese Base';
    if (idleNow === 'noCoin') return who + ': no coins';
    if (L.nodes.advanced && !L.dir) return who + ': choose a direction';
    return who + ' ' + (SPOT_TXT[E.mouse.at] || 'in the lab');
  }
  function flowNow() {
    const c = G(), L = c.lab, parts = [];
    if (L.nodes.queue) parts.push('Queue ' + L.queue.length + '/' + Lb.queueCap(c));
    if (L.done.strains) parts.push(L.done.strains + ' strains');
    if (L.job && parts.length < 2) parts.push(dur(left(L.job)) + ' left');
    if (parts.length < 2) parts.unshift(L.known.length + ' recipes');
    return parts.slice(0, 2).join(' · ');
  }
  function paintPanel(force) {
    if (!o.panelMine()) return;
    const c = G(), L = c.lab, st = sel && stationBy(sel), bar = L.job ? progress(L.job) : 0;
    const name = st ? st.name : picked && inLab() ? inLab().name : 'CHEESE LAB', status = statusNow(), flow = flowNow(), sub = st ? 'This station' : 'Tap a station', crew = (inLab() ? 1 : 0) + '/' + (L.nodes.assistant ? 1 : 0);
    $('pn-bar').style.width = Math.round(bar * 100) + '%';
    const sig = [name, status, flow, sub, crew, !!L.job, st && st.id].join('|'); if (!force && sig === panelSig) return; panelSig = sig;
    const icon = st ? stIcon(st) : o.icon('ic_flask'); if ($('pn-ic').getAttribute('src') !== icon) $('pn-ic').src = icon;
    $('pn-name').textContent = name; $('pn-lv').textContent = ''; $('pn-bot').textContent = ''; $('pn-st').dataset.bo = 0; $('pn-st').classList.remove('na'); $('pn-st').setAttribute('aria-label', 'Cheese Lab panel'); $('pn-st').tabIndex = 0;
    $('pn-status').textContent = status; $('pn-status').className = 'pn-status ' + (needMsg ? 'stop' : L.job ? 'good' : idleNow ? 'stop' : ''); $('pn-flow').textContent = flow;
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
      const a = await image('atlas');
      for (const n of ['glass', ...d.backs.filter((b) => b !== 'glass')]) layers[n] = await image(n); // de una en una: que cargar el LAB no le quite fotogramas a MAIN
      atlas = a; F = d.frames; data = d; loading = false;
    }).catch((e) => { console.warn(e); loading = false; failed = true; });
  }

  // ---------- Lo que pide el gestor de escenas ----------
  return {
    keep: true, content: true, preload, baseline,
    farView: () => ({ ground: toY(data.geom.G), shift: 100 + (C.cx - generalCx()) * 0.35, zoom: C.s / sG }),
    mapView: () => ({ cx: C.cx, s: C.s, left: C.cx - W / (2 * C.s), ground: toY(data.geom.G) }), baseLeft: () => 5 + BASE_W / 2 - W / (2 * sG),
    get engine() { return E; }, get gestureLog() { return gesture ? gesture.log : []; }, get ops() { return R ? R.ops : 0; }, get picked() { return picked; }, get selected() { return sel; }, get scale() { return C.s; }, get mode() { return C.mode; }, get camera() { return cam; }, get cam() { return C; }, get view() { return viewNow(); }, paintPanel: () => paintPanel(true),
    ready: () => !!data,
    hits: { targetAt, toX, toY, stationAt, onTap },
    init() {
      el = document.createElement('div'); el.className = 'lab-scene'; el.dataset.scene = 'lab'; o.host.appendChild(el);
      cv = document.createElement('canvas'); cv.className = 'lab-cv'; cv.setAttribute('aria-label', 'Inside the Cheese Lab'); el.appendChild(cv); gc = cv.getContext('2d');
      ui = document.createElement('div'); ui.className = 'lab-ui'; el.appendChild(ui);
      bub = document.createElement('div'); bub.className = 'lab-bub'; el.appendChild(bub);
      stagePlate = document.createElement('div'); stagePlate.className = 'p0-plate build st-stage'; stagePlate.hidden = true; stagePlate.innerHTML = '<span></span><b class="bd">BUILD</b>'; ui.appendChild(stagePlate);
      home = document.createElement('button'); home.className = 'home-btn bx in lab-home'; home.hidden = true; home.setAttribute('aria-label', 'See the whole lab'); home.innerHTML = '<img class="pix hb-ar" alt="" src="' + o.ret + '"><span>LAB</span>'; home.addEventListener('click', () => goGeneral()); ui.appendChild(home);
      back = document.createElement('button'); back.className = 'home-btn bx in lab-back'; back.setAttribute('aria-label', 'Back to MAIN'); back.innerHTML = '<i class="edge-ar"></i><span>MAIN</span>'; back.addEventListener('click', () => o.goMain()); ui.appendChild(back);
      R = backend();
      const kit = scene.bubbleKit();
      BUB = window.BetaBubbles({ host: bub, readMs: kit.readMs, tail: kit.tail, head: () => { const M = E && E.mouse; return M && M.on ? { x: toX(M.x + 11), y: toY(M.y - 19), visible: true } : null; }, bounds: () => ({ left: 6, right: W - 6, top: o.top(), bottom: H - 4 }), obstacles: () => [...ui.querySelectorAll('.st-ic:not([hidden]), .lab-back, .lab-home'), $('goal')].filter(Boolean), canStart: () => !o.covered() });
      E = window.LabAnim(data, R, { seed: (Date.now() % 100000) + 1, reduced: o.reduced(), hold: () => o.covered(), onBuilt: (to) => { remember(to); if (BUB && inLab()) BUB.say({ id: inLab().id }, 'Look at this place!', 1); } });
      gesture = window.BetaGesture({
        resolve: targetAt, slop: () => 10, label: (t) => (t.mouse ? 'researcher' : t.st ? t.st.id : t.floor ? 'floor' : 'nothing'), press: () => false, pressMove() {}, pressAbort() {},
        cameraStart: camStart, cameraMove: camMove, cameraEnd: camEnd, holdMove() {}, holdDrop() {}, holdCancel() {}, tap: onTap,
      });
      const ptr = (e) => { rawX = e.clientX; const b = el.getBoundingClientRect(); return { id: e.pointerId, x: e.clientX - b.left, y: e.clientY - b.top, button: e.button, primary: e.isPrimary, kind: e.pointerType }; };
      cv.addEventListener('pointerdown', (e) => { rawX0 = e.clientX; if (gesture.down(ptr(e))) try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
      window.addEventListener('pointermove', (e) => { if (gesture.active) gesture.move(ptr(e)); }, true);
      window.addEventListener('pointerup', (e) => gesture.up(ptr(e)), true);
      window.addEventListener('pointercancel', (e) => gesture.cancel(ptr(e)), true);
      cv.addEventListener('lostpointercapture', (e) => gesture.cancel(ptr(e), 'lost'));
      cv.addEventListener('contextmenu', (e) => e.preventDefault()); cv.addEventListener('selectstart', (e) => e.preventDefault());
      cv.addEventListener('touchmove', (e) => { if (gesture.active) e.preventDefault(); }, { passive: false });
      cv.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    },
    enter() {
      o.host.hidden = false; el.hidden = false; on = true; W = 0; layout(); last = performance.now();
      const L = G().lab; idleSnap.noBase = L.idleMs.noBase; idleSnap.noCoin = L.idleMs.noCoin; idleSnap.noTarget = L.idleMs.noTarget;
      prev = viewNow();
      if (!started) { E.init(prev, shownSaved()); started = true; } else E.resume(prev);
      C.tw = null; C.vx = C.vy = 0; sel = null; picked = C.mode === 'follow'; needMsg = ''; camNow(); if (C.mode === 'follow' && !E.mouse.on) C.mode = 'near'; if (C.mode === 'obra') Object.assign(C, obraFrame()); else if (!entered) placeGeneral(); else clampCam(); entered = true; obraTick(); if (C.tw) { C.tw = null; Object.assign(C, obraFrame()); } E.render(camNow()); E.clean(); C.sig = ''; paintCam(); paintPanel(true); paintIcons();
    },
    frame(now) {
      if (layout()) E.render(camNow());
      const dt = Math.min(250, now - last); last = now;
      obraTick(); camStep(performance.now(), dt);
      if (E.step(dt)) { const v = viewNow(); speakDiff(prev, v); E.setView(v); prev = v; }
      const covered = o.covered();
      if (sel && !covered && now >= selUntil) { sel = null; needMsg = ''; panelSig = ''; }
      if (!sweepDone && !covered && !C.dragging && C.mode === 'general') sweep();
      if (E.dirty && (!o.sheet() || now - lastDraw >= 66)) { lastDraw = now; E.render(camNow()); E.clean(); }
      paintIcons();
      if (now - lastPaint > 180) { lastPaint = now; paintPanel(false); }
      BUB.tick(now);
    },
    leave() { if (gesture) gesture.reset('scene'); if (BUB) BUB.clear(); picked = false; sel = null; if (el) el.hidden = true; o.host.hidden = true; on = false; },
    panelAct() { const st = (sel && stationBy(sel)) || stationBy('recipes'); focusStation(st, true); },
    panelStation() { o.open('lab'); },
    panelCrew() { const m = inLab(), L = G().lab; if (m) return o.open('card', m.id); if (L.nodes.assistant) return o.open('post', 'research:all'); return o.open('tree', 'lab'); },
    get on() { return on; },
  };
};
