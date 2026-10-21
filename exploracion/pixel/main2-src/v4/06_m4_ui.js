// ---------- Dibujo de todas las paradas ----------
function draw(now, dt = 16) {
  const dpr = devicePixelRatio || 1, k = S.k * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0e0c12'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.imageSmoothingEnabled = false;
  ctx.setTransform(k, 0, 0, k, -Math.round(S.camX * k), -Math.round(S.camY * k));
  HITS = [];
  const y0 = S.camY - 4, y1 = S.camY + viewH() + 4;
  for (const st of STOPS) {
    if (st.top + st.h < y0 || st.top > y1) continue;
    if (st.kind === 'town') drawTown(st, now); else if (st.kind === 'pilot') drawCheddar(st, now); else if (st.kind === 'district') drawDistrictB(st, now); else drawLocked(st);
    if (SHOWPATHS && st.kind === 'pilot') drawPaths(st, GEO(st));
  }
  drawParticles(now, dt);
  overlays(now);
}
// ---------- Capas HTML encima del lienzo ----------
function paintLabels() { const b = $c('mc-labels'); b.replaceChildren(); STOPS.forEach((st, i) => { if (!i) return; const l = document.createElement('span'); l.className = 'mc-lbl' + (st.kind === 'locked' ? ' lock' : ''); l.textContent = st.kind === 'locked' ? 'BRIE ROCK · LOCKED' : `${TH[st.z].name} ROCK · DEPTH ${DEP[st.z]}`; l.dataset.i = i; b.appendChild(l); }); }
const toCss = (x, y) => [(x - S.camX) * S.k, (y - S.camY) * S.k];
function overlays(now) {
  for (const l of $c('mc-labels').children) { const st = STOPS[+l.dataset.i]; const [, y] = toCss(0, st.top + 1); l.style.transform = `translate(${stg.clientWidth - l.offsetWidth - 8}px, ${Math.round(y)}px)`; l.style.visibility = y < 46 || y > stg.clientHeight - 14 || (+l.dataset.i === S.stop && !$c('mc-nav').hidden) ? 'hidden' : ''; }
  // NEW: solo en exploración, sobre la quesería de Cheddar (y en su casilla del panel).
  const ch = HITS.find((h) => h.k === 'b' && h.st === 'cheesery' && STOPS[h.stop].id === 'cheddar'), nw = $c('mc-new');
  if (ch && !S.focus) { const [x, y] = toCss(ch.x + ch.w - 14, ch.y + 2); nw.hidden = y < 46 || y > stg.clientHeight - 10; nw.style.left = x + 'px'; nw.style.top = y + 'px'; } else nw.hidden = true;
  // Un bocadillo a la vez, sobre el ratón que habla.
  const bb = $c('mc-bub'), b = BUB.who && BR[BUB.who];
  if (b && now < BUB.until && b.px != null) { const [x, y] = toCss(b.px + 11, b.py - 22); bb.textContent = BUB.text; bb.hidden = y < 50 || y > stg.clientHeight - 4 || x < 10 || x > stg.clientWidth - 10; bb.style.left = x + 'px'; bb.style.top = y + 'px'; } else bb.hidden = true;
  const sim = $c('mc-sim'); sim.hidden = SIM.state === 'normal'; if (!sim.hidden) sim.textContent = 'SIMULACIÓN · ' + SIMS[SIM.state];
  if (SHOWHITS) { const hb = $c('mc-hits'); hb.hidden = false; const g = GEO(STOPS[1]); const extra = ALT === 'B' ? [{ x: g.mine[0], y: g.mine[1], w: g.mine[2], h: g.mine[3], k: 'z' }] : []; hb.replaceChildren(...[...HITS, ...extra].map((h) => { const i = document.createElement('i'); if (h.k === 'm') i.className = 'm'; if (h.k === 'z') i.className = 'z'; const [x, y] = toCss(h.x, h.y); Object.assign(i.style, { left: x + 'px', top: y + 'px', width: h.w * S.k + 'px', height: h.h * S.k + 'px' }); return i; })); }
}

// ---------- C · Controles: exploración (casillas de las estaciones) y estación (su acción, en grande) ----------
const STN = {
  rock: { n: 'MINE', a: 'MINE', s: 'tap', hold: false, lv: 62, ic: 'ic_pick' },
  drill: { n: 'DRILL', a: 'DRILL', s: 'hold to boost', hold: true, lv: 91, ic: 'ic_raw_cheddar' },
  refinery: { n: 'REFINE', a: 'REFINE', s: 'hold to boost', hold: true, lv: 85, ic: 'ic_base_cheddar' },
  cheesery: { n: 'CHEESE', a: 'SPEED', s: 'UP · hold', hold: true, lv: 93, ic: 'ic_lot_cheddar' },
  shop: { n: 'SELL', a: 'SELL', s: 'hold to boost', hold: true, lv: 86, ic: 'ic_coin' },
  lab: { n: 'LAB', a: 'OPEN', s: 'the lab', hold: false, lv: 52, ic: 'ic_flask' },
  house: { n: 'HOUSE', a: 'OPEN', s: 'MICE', hold: false, lv: '—', ic: 'ic_coin' },
  storage: { n: 'PANTRY', a: 'OPEN', s: 'pantry', hold: false, ic: 'ic_lot_cheddar' },
};
// Lo que dice cada estación de Cheddar sale de la simulación (Gouda, de los textos de V3).
function status(key, z) {
  if (z === 'cheddar') {
    if (key === 'rock') return M.phase === 'vein' ? ['VEIN', 'Vein open', ''] : [`${M.hits}/${M.need}`, 'Searching', ''];
    if (key === 'drill') return running() ? ['AUTO', 'Drilling', ''] : ['STOP', 'No vein', 'warn'];
    if (key === 'refinery') return refining() ? ['AUTO', 'Refining', ''] : ['NO RAW', 'No Raw', 'warn'];
    if (key === 'cheesery') return pressing() ? ['NEW', 'Pressing', 'new'] : ['NO BASE', 'No Base', 'warn'];
  }
  const G = { rock: ['AUTO', 'Vein open · 2.1M Raw'], drill: ['STOP', 'Stopped: no vein', 'warn'], refinery: ['NO RAW', 'Waiting for Raw', 'warn'], cheesery: ['AUTO', 'Smoked Gouda 1.1/s'], shop: ['AUTO', '4.8K/min · all rocks'], lab: ['3:20', 'Research 3:20 left'], house: ['1 IDLE', '1 mouse unassigned'], storage: ['8h', 'No limit · 3 stocks'] };
  return G[key] || ['', ''];
}
const UPN = { rock: 'Blasting Charges', drill: 'Faster Bit', refinery: 'Bigger Vats', cheesery: 'More Moulds', shop: 'Better Shelves', lab: 'the cheapest LAB upgrade' };
function curKey() { const st = STOPS[S.stop]; if (st.kind === 'locked') return null; return S.focus || null; }
function workerOf(key, st = STOPS[S.stop]) { if (st.kind === 'pilot' || st.kind === 'district') { const c = CREW[st.z]; return { rock: c.miner, drill: c.driller, refinery: c.refiner, cheesery: c.cook }[key]; } return { shop: CREW.town.keeper, lab: CREW.town.sci, house: CREW.town.idle }[key] || null; }
const WHO = { rock: 'miner', drill: 'driller', refinery: 'refiner', cheesery: 'cook' };
function updateDock() {
  const st = STOPS[S.stop], key = curKey(), bot = $c('mc-bot');
  $c('mc-pick-t').textContent = st.kind === 'pilot' || st.kind === 'district' ? `${TH[st.z].name} · ${DEP[st.z]}` : st.kind === 'town' ? 'SURFACE' : 'BRIE · LOCKED';
  $c('mc-up').disabled = S.stop === 0; $c('mc-down').disabled = S.stop === STOPS.length - 1;
  $c('mc-down').querySelector('i')?.remove(); if (S.stop < 2) $c('mc-down').insertAdjacentHTML('beforeend', '<i></i>');
  bot.classList.toggle('focus', !!key); bot.classList.toggle('explore', !key);
  // Exploración: una casilla por estación de la parada y BUY ALL.
  const tiles = STATIONS[st.kind] || [];
  $c('mc-strip').replaceChildren(...tiles.map((k) => { const s = status(k, st.z), b = document.createElement('button'); b.className = 'mc-tile'; b.dataset.k = k; b.innerHTML = `<img src="out/sprites/${STN[k].ic}.png" alt=""><b>${STN[k].n}</b><small class="${s[2] || ''}">${s[0]}</small>`; b.onclick = () => focusOn(k); return b; }), (() => { const b = document.createElement('button'); b.className = 'mc-tile all'; b.innerHTML = '<b>BUY ALL</b><small>10.3Qa</small>'; b.onclick = () => { LOG.push('up:all'); hint('BUY ALL: the cheapest of every tree'); }; return b; })());
  if (!tiles.length) $c('mc-strip').replaceChildren((() => { const d = document.createElement('div'); d.className = 'mc-tile lockt'; d.innerHTML = '<b>BRIE ROCK</b><small>Open it in the COLONY tree</small>'; return d; })());
  if (!key) return;
  const d = STN[key], s = status(key, st.z), big = key === 'rock' && ALT === 'A' && st.kind === 'pilot';
  $c('mc-ctl').classList.toggle('big', big);
  $c('mc-act-b').textContent = d.a; $c('mc-act-s').textContent = key === 'rock' ? (ALT === 'B' && st.kind === 'pilot' ? 'or tap the rock' : M.phase === 'vein' && st.kind === 'pilot' ? 'vein open' : `${M.hits}/${M.need}`) : d.s; $c('mc-act-i').src = `out/sprites/${d.ic}.png`;
  $c('mc-st').textContent = d.n; $c('mc-st').hidden = big;
  const l2 = $c('mc-l2'); l2.textContent = big ? `LV ${d.lv}` : d.l2 || `LV ${d.lv} · ` + (s[2] === 'new' ? 'NEW' : 'AUTO'); l2.className = s[2] === 'new' ? 'new' : 'auto';
  const l3 = $c('mc-l3'); l3.textContent = big ? (s[2] === 'new' ? 'NEW' : 'AUTO') : s[1]; l3.className = big ? 'auto' : s[2] === 'warn' ? 'warn' : '';
  // Por debajo de 360 px la cara del ratón sale del panel (su ficha sigue a mano: manteniéndolo en la escena, donde ya es grande).
  $c('mc-info').classList.toggle('noface', PRE.w < 360);
  const w = workerOf(key), wk = $c('mc-wk'); wk.replaceChildren(); if (w) { const c = mF(w, 0, false), i = new Image(); i.src = c.toDataURL(); i.style.cssText = 'width:22px;height:20px;image-rendering:pixelated'; wk.appendChild(i); }
}
// Refresco ligero del panel (sin rehacer las casillas si no cambia nada).
let DOCKSIG = ''; function dockTick() { const sig = [S.stop, S.focus, ALT, M.phase, M.hits, running(), refining(), pressing(), SIM.state, DEP.cheddar].join('|'); if (sig !== DOCKSIG) { DOCKSIG = sig; updateDock(); } }
function sheet(t, p) { const sh = $c('mc-sheet'); $c('mc-sheet-t').textContent = t; $c('mc-sheet-p').textContent = p || ''; sh.style.top = stg.offsetTop + 'px'; sh.hidden = false; $c('mc-pop').hidden = true; LOG.push('sheet:' + t); }
$c('mc-sheet-x').onclick = () => ($c('mc-sheet').hidden = true);
let hT = 0; function hint(t) { const h = $c('mc-hint'); h.textContent = t; h.hidden = false; clearTimeout(hT); hT = setTimeout(() => (h.hidden = true), 1100); }
const LOG = [];
function focusOn(k) {
  const st = STOPS[S.stop]; if (!st) return;
  if (k === 'lab' || k === 'house' || k === 'storage') { S.station = k; updateDock(); return act('scene', k); }
  S.focus = k; S.station = k; if (st.kind !== 'town') S.dist = k; moveCam(camTarget(S.stop, k)); updateDock(); LOG.push('focus:' + k);
  if (st.kind === 'pilot' && WHO[k]) react(WHO[k], 'greet');
  if (k === 'rock' && ALT === 'B' && st.kind === 'pilot') hint('Tap the rock to mine');
}
function exitFocus() { if (!S.focus) return; S.focus = null; moveCam(camTarget(S.stop, null)); updateDock(); LOG.push('explore'); }
function goStop(i) {
  if (i < 0 || i >= STOPS.length) return; S.focus = null;
  S.stop = i; const st = STOPS[i]; if (st.kind === 'town' && !['shop', 'lab', 'house', 'storage'].includes(S.station)) S.station = 'shop'; else if (st.kind !== 'town') S.station = S.dist;
  moveCam(camTarget(i, null)); updateDock(); $c('mc-list').hidden = true; LOG.push('stop:' + st.id);
}
// Acción manual de la estación. En Cheddar cada una tiene su respuesta: chispas en la broca, llamarada en el horno, apretón de
// la prensa. Ninguna cambia la economía: es la acción que ya existe.
function act(src, k = curKey()) {
  const st = STOPS[S.stop]; if (!k) return;
  if (k === 'lab') return sheet('CHEESE LAB', 'El panel aprobado de LAB.');
  if (k === 'house') return sheet('MICE · HOUSE', 'El panel aprobado de MICE, en HOUSE.');
  if (k === 'storage') return sheet('PANTRY', 'El panel aprobado de PANTRY (la despensa sin tope).');
  if (k === 'rock') { if (st.kind === 'pilot') { S.via = src; return mineHit('player'); } }
  S.acts++; S.flash[st.id] = { k, t: performance.now() }; LOG.push('act:' + k + ':' + src);
  if (st.kind === 'pilot') { const g = geoC(st); if (k === 'drill') spark(g.o + 72, g.DK + 10, 'spark', 3); if (k === 'refinery') { spark(g.o + 1, g.TL - 10, 'spark', 2); } if (k === 'cheesery') spark(g.o + 126, g.TR - 4, 'glint', 1); thunk(1.6, false, true); }
}
let holdIv = 0; const actB = $c('mc-act');
actB.addEventListener('pointerdown', (e) => { e.preventDefault(); const k = curKey(); act('button', k); actB.classList.add('hit'); setTimeout(() => actB.classList.remove('hit'), 90); clearInterval(holdIv); if (k && STN[k].hold) holdIv = setInterval(() => act('hold', k), 160); });
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) actB.addEventListener(ev, () => clearInterval(holdIv));
$c('mc-back').onclick = () => exitFocus();
$c('mc-wk').onclick = () => { const w = workerOf(curKey()); if (w) sheet('MICE · ' + w.name, 'La ficha aprobada del ratón del puesto.'); };
$c('mc-upg').onclick = () => { const k = curKey(); LOG.push('up:quick'); if (k === 'storage') return sheet('UPGRADES · COLONY', 'Night Lamp: la compra el jugador.'); hint('Bought ' + (UPN[k] || 'the cheapest upgrade')); if (STOPS[S.stop].kind === 'pilot' && WHO[k]) react(WHO[k], 'upgrade'); };
$c('mc-more').onclick = () => {
  const p = $c('mc-pop'); if (!p.hidden) { p.hidden = true; return; }
  p.innerHTML = `<button data-k="all">BUY ALL<small>10.3Qa</small></button><button data-k="tree">Upgrade tree<small>${(STN[curKey()] || { n: '' }).n}</small></button><button data-k="stats">Production<small>this line</small></button>`;
  p.style.bottom = $c('mc-bot').offsetHeight + 4 + 'px'; p.hidden = false;
  p.querySelectorAll('button').forEach((b) => (b.onclick = () => { p.hidden = true; if (b.dataset.k === 'all') { LOG.push('up:all'); hint('BUY ALL: the cheapest of every tree'); } else if (b.dataset.k === 'tree') sheet('UPGRADES · ' + (STN[curKey()] || { n: '' }).n, 'El árbol aprobado de esta habilidad.'); else sheet('PRODUCTION', 'Ritmos y cuellos de botella de la línea.'); }));
};
document.querySelectorAll('.mc-glob button').forEach((b) => (b.onclick = () => sheet(b.textContent, 'Panel aprobado.')));
$c('mc-alert').onclick = () => sheet('ALERTS', 'Alertas de la colonia; tocar una lleva a su estación.');
$c('mc-up').onclick = () => goStop(S.stop - 1); $c('mc-down').onclick = () => goStop(S.stop + 1);
$c('mc-pick').onclick = () => {
  const l = $c('mc-list'); if (!l.hidden) { l.hidden = true; return; }
  const rows = [['town', 'Surface', 'shop · lab · house', 'ic_coin', false, null], ['town', 'Pantry', 'under the village', 'ic_lot_cheddar', false, 'storage'], ['cheddar', 'Cheddar Rock', 'depth ' + DEP.cheddar, 'ic_raw_cheddar', false], ['gouda', 'Gouda Rock', 'depth ' + DEP.gouda, 'ic_raw_gouda', true], ['brie', 'Brie Rock', 'locked', 'ic_raw_brie', false]];
  l.replaceChildren(...rows.map(([id, n, sub, ic, alert, stn]) => { const b = document.createElement('button'); const si = STOPS.findIndex((s) => s.id === id); b.className = si === S.stop ? 'on' : ''; b.disabled = id === 'brie'; b.innerHTML = `<img src="out/sprites/${ic}.png" alt=""><span>${n}<br><small>${sub}</small></span>${alert ? '<i class="dot"></i>' : '<span></span>'}`; b.onclick = () => { goStop(si); if (stn) { S.station = stn; moveCam(camTarget(si, null)); updateDock(); } }; return b; }));
  l.hidden = false;
};
// ---------- Gestos en la escena ----------
// Tocar un puesto (o a su trabajador) lo elige y la cámara se acerca; tocar fuera, vuelve a la colonia. Mantener 450 ms sobre
// un ratón: su ficha. Deslizar en vertical cambia de parada. Durante un combo no se arrastra nada.
// Picar: A, el botón MINE protagonista (tocar la roca también pica, con su zona normal y al soltar). B, la roca es el control:
// zona amplia alrededor de la roca, el golpe sale al apoyar el dedo (sin esperar a soltar) y un arrastre que empieza en esa zona
// no mueve la cámara.
let PT = null;
const toArt = (e) => { const r = stg.getBoundingClientRect(), k = r.width / stg.clientWidth; return [((e.clientX - r.left) / k) / S.k + S.camX, ((e.clientY - r.top) / k) / S.k + S.camY, k]; };
function hitAt(ax, ay) { const u = HITS.filter((h) => ax >= h.x && ax < h.x + h.w && ay >= h.y && ay < h.y + h.h); return { m: u.filter((h) => h.k === 'm').pop(), b: u.filter((h) => h.k === 'b').pop() }; }
const inMine = (ax, ay) => { const st = STOPS[S.stop]; if (st.kind !== 'pilot') return false; const z = geoC(st).mine; return ax >= z[0] && ax < z[0] + z[2] && ay >= z[1] && ay < z[1] + z[3]; };
stg.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.mc-nav, .mc-list')) return;
  const [ax, ay, k] = toArt(e);
  if (ALT === 'B' && inMine(ax, ay) && (S.focus === 'rock' || !S.focus)) { if (S.focus !== 'rock') focusOn('rock'); S.via = 'rock'; mineHit('player', Math.round(ax), Math.round(Math.min(ay, geoC(STOPS[S.stop]).rb - 10))); PT = { mine: true, id: e.pointerId }; return; }
  PT = { x: e.clientX, y: e.clientY, k, t: performance.now(), cx: S.camX, cy: S.camY, ax, ay, axis: null, id: e.pointerId };
  try { stg.setPointerCapture(e.pointerId); } catch (er) {}
  PT.lp = setTimeout(() => { if (!PT || PT.axis || PT.mine) return; const h = hitAt(PT.ax, PT.ay); if (h.m) { PT.done = true; sheet('MICE · ' + h.m.name, 'Ficha aprobada (mantener pulsado).'); if (BR[h.m.who]) react(h.m.who, 'greet'); } }, 450);
});
stg.addEventListener('pointermove', (e) => {
  if (!PT || PT.mine) return; const dx = (e.clientX - PT.x) / PT.k, dy = (e.clientY - PT.y) / PT.k;
  if (!PT.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 14) {
    if (comboOn()) { if (!PT.warned) { PT.warned = true; hint('Combo: the camera waits'); LOG.push('blocked'); } return; }
    PT.axis = Math.abs(dy) >= Math.abs(dx) ? 'y' : SC.worldW > viewW() ? 'x' : 'y'; clearTimeout(PT.lp);
  }
  if (PT.axis === 'y') { S.camTo = null; S.camY = PT.cy - dy / S.k; }
  if (PT.axis === 'x') { S.camTo = null; S.camX = Math.max(Math.min(0, (SC.worldW - viewW()) / 2), Math.min(Math.max(SC.worldW - viewW(), 0), PT.cx - dx / S.k)); }
});
stg.addEventListener('pointerup', (e) => {
  if (!PT) return; const p = PT; PT = null; if (p.mine) return; clearTimeout(p.lp); if (p.done) return;
  if (p.axis === 'y') { const dy = (e.clientY - p.y) / p.k, v = dy / Math.max(1, performance.now() - p.t); let i = S.stop; if (dy < -48 || v < -0.5) i = Math.min(STOPS.length - 1, S.stop + 1); else if (dy > 48 || v > 0.5) i = Math.max(0, S.stop - 1); if (i === S.stop) moveCam(camTarget(i)); else goStop(i); return; }
  if (p.axis === 'x') return;
  if (performance.now() - p.t > 450) return;
  const h = hitAt(p.ax, p.ay), tgt = h.m || h.b;
  if (!tgt) return exitFocus();
  if (tgt.stop !== S.stop) goStop(tgt.stop);
  const k = tgt.st;
  if (S.focus === k) { if (k === 'rock' && STOPS[S.stop].kind === 'pilot') { S.via = 'rock'; return mineHit('player', Math.round(p.ax), Math.round(p.ay)); } if (h.m && WHO[k]) return react(h.m.who, 'greet'); return act('scene', k); }
  focusOn(k); if (h.m && BR[h.m.who]) react(h.m.who, 'greet');
});
stg.addEventListener('pointercancel', () => { if (PT) clearTimeout(PT.lp); PT = null; });
stg.addEventListener('contextmenu', (e) => e.preventDefault());
function paintCombo() { const on = comboOn(); $c('mc-combo').hidden = !on; $c('mc-nav').hidden = on; if (on) { $c('mc-list').hidden = true; $c('mc-combo-n').textContent = S.combo; $c('mc-combo-t').textContent = S.combo % 5 === 4 ? 'CRIT NEXT' : S.combo % 5 === 0 ? 'CRIT!' : 'COMBO'; } }
// ---------- Bucle ----------
let TPREV = 0, FRAMES = [];
function tick() {
  const now = performance.now(), dt = Math.min(64, now - (TPREV || now)); TPREV = now;
  if (S.camTo) { const c = S.camTo, k = Math.min(1, (now - c.t0) / c.ms), e = 1 - Math.pow(1 - k, 3); S.k = c.fk + (c.tk - c.fk) * e; S.camX = c.fx + (c.tx - c.fx) * e; S.camY = c.fy + (c.ty - c.fy) * e; if (k >= 1) { S.camTo = null; S.k = c.tk; S.camX = c.tx; S.camY = Math.round(c.ty); } }
  if (S.dropStart) { const a = Math.min(1, (now - S.dropT0) / 700); S.drop = S.dropStart * (1 - a * a * (3 - 2 * a)); if (a >= 1) { S.drop = 0; S.dropStart = 0; } }
  simStep(dt, now);
  if (!comboOn() && !$c('mc-combo').hidden) paintCombo();
  const t0 = performance.now(); draw(now, dt); FRAMES.push(performance.now() - t0); if (FRAMES.length > 240) FRAMES.shift();
  dockTick();
}
setInterval(tick, 16);
