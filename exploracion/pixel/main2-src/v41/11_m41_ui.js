// ---------- Dibujo ----------
function draw(now, dt = 16) {
  const dpr = devicePixelRatio || 1, k = S.k * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0e0c12'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.imageSmoothingEnabled = false;
  ctx.setTransform(k, 0, 0, k, -Math.round(S.camX * k), -Math.round(S.camY * k));
  HITS = [];
  const y0 = S.camY - 4, y1 = S.camY + viewH() + 4;
  for (const st of STOPS) { if (st.top + st.h < y0 || st.top > y1) continue; if (st.kind === 'town') drawTown41(st, now); else if (st.kind === 'pilot') drawCheddar(st, now); else if (st.kind === 'district') drawDistrictB(st, now); else drawLocked(st); }
  drawLift(now);
  drawParticles(now, dt);
  overlays(now);
}
// La superficie de V3 con la tienda piloto (SELL) y la llegada del montacargas.
function drawTown41(st, now) {
  if (S.camY < st.top) sky(st, Math.floor(S.camY) - 2, st.top);
  baked(st, paintTown);
  const g = geoT(st), { o, GR } = g, f = Math.floor(now / 140);
  sprite(SPR.house, 40, f, o + 18, GR - 9 - 46, 40, 46); sprite(SPR.lab, 36, f, o + 60, GR + 2 - 46, 36, 46);
  // SELL: el puesto con toldo, el tendero detrás del mostrador (se redibuja el frente encima) y el queso terminado a la vista.
  const sx0 = o + 88, sy0 = GR + 4 - 46, c = CREW.town, happy = V.sellT && now - V.sellT < 600;
  ctx.drawImage(artShop(), sx0, sy0); ctx.drawImage(artCoinSign(), o + 104, GR - 53);
  mouse(c.keeper, o + 108, GR - 6, now, true, happy ? { face: 'happy' } : {}); pushM(st, 'shop', 'keeper', c.keeper.name, o + 108, GR - 6);
  ctx.drawImage(artShop(), 0, 30, 44, 16, sx0, sy0 + 30, 44, 16);
  // Queso a la venta: hasta cinco ruedas en su hueco del mostrador. La jaula descarga cada rueda en el hueco que le toca.
  const slot = (i) => [o + 96 + (i % 3) * 5 + (i >= 3 ? 2 : 0), GR - 12 - (i >= 3 ? 3 : 0)];
  for (let i = 0; i < Math.min(5, LIFT.shop); i++) wheelTok(...slot(i));
  if (LIFT.state === 'unload') { const k = Math.min(1, (now - LIFT.t0) / 700), e = k * k * (3 - 2 * k); for (let i = 0; i < Math.min(2, LIFT.load); i++) { const [tx, ty] = slot(Math.min(4, LIFT.shop + i)), x0 = o + 137 - i * 3, y0 = GR - 4; wheelTok(Math.round(x0 + (tx - x0) * e), Math.round(y0 + (ty - y0) * e - Math.sin(e * Math.PI) * 6)); } }
  // Venta: dos monedas pequeñas saltan del mostrador (nítidas, sin transparencias).
  if (V.sellT && now - V.sellT < 600) { const k = (now - V.sellT) / 600; for (let i = 0; i < 2; i++) { const q = Math.max(0, k - i * 0.2) / (1 - i * 0.2); if (q > 0 && q < 1) coinTok(o + 112 + i * 5, Math.round(GR - 13 - Math.sin(q * Math.PI) * 9 - q * 3)); } }
  pushStations(st, g); if (STOPS[S.stop] === st && S.focus) for (const r of g.st[S.focus] || []) sel(r);
  mouse(c.idle, o + 34, GR - 9, now, true); pushM(st, 'house', 'idle', c.idle.name, o + 34, GR - 9);
  const gs = stroll(now, 9000, o + 66, o + 74, 1300); mouse(c.sci, gs.x, GR + 5, now, !gs.right, gs.walk ? legs(now) : {}); pushM(st, 'lab', 'sci', c.sci.name, gs.x, GR + 5);
}
// ---------- Capas HTML ----------
function paintLabels() { const b = $c('mc-labels'); b.replaceChildren(); STOPS.forEach((st, i) => { if (!i) return; const l = document.createElement('span'); l.className = 'mc-lbl' + (st.kind === 'locked' ? ' lock' : ''); l.textContent = st.kind === 'locked' ? 'BRIE ROCK · LOCKED' : `${TH[st.z].name} ROCK · DEPTH ${DEP[st.z]}`; l.dataset.i = i; b.appendChild(l); }); }
const toCss = (x, y) => [(x - S.camX) * S.k, (y - S.camY) * S.k];
function overlays(now) {
  for (const l of $c('mc-labels').children) { const st = STOPS[+l.dataset.i]; const [, y] = toCss(0, st.top + 1); l.style.transform = `translate(${stg.clientWidth - l.offsetWidth - 8}px, ${Math.round(y)}px)`; l.style.visibility = y < 46 || y > stg.clientHeight - 14 || (+l.dataset.i === S.stop && !$c('mc-nav').hidden) ? 'hidden' : ''; }
  $c('mc-new').hidden = true;
  const bb = $c('mc-bub'), b = BUB.who && BR[BUB.who];
  if (b && now < BUB.until && b.px != null) { const [x, y] = toCss(b.px + 11, b.py - 22); bb.textContent = BUB.text; bb.hidden = y < 50 || y > stg.clientHeight - 4 || x < 10 || x > stg.clientWidth - 10; bb.style.left = x + 'px'; bb.style.top = y + 'px'; } else bb.hidden = true;
  const sim = $c('mc-sim'); sim.hidden = FORCE.state === 'normal'; if (!sim.hidden) sim.textContent = 'SIMULACIÓN · ' + FORCES[FORCE.state];
  if (SHOWHITS) { const hb = $c('mc-hits'); hb.hidden = false; const g = GEO(STOPS[1]); const extra = ALT === 'B' ? [{ x: g.mine[0], y: g.mine[1], w: g.mine[2], h: g.mine[3], k: 'z' }] : []; hb.replaceChildren(...[...HITS, ...extra].map((h) => { const i = document.createElement('i'); if (h.k === 'm') i.className = 'm'; if (h.k === 'z') i.className = 'z'; const [x, y] = toCss(h.x, h.y); Object.assign(i.style, { left: x + 'px', top: y + 'px', width: h.w * S.k + 'px', height: h.h * S.k + 'px' }); return i; })); }
}
// ---------- Panel: exploración (estaciones y UPGRADES) y estación (acción, información, UP y TREE) ----------
const STN = {
  rock: { n: 'MINE', a: 'MINE', s: 'tap', hold: false, lv: 62, ic: 'ic_pick', tree: 'mining' },
  drill: { n: 'DRILL', a: 'DRILL', s: 'hold to boost', hold: true, lv: 91, ic: 'ic_raw_cheddar', tree: 'drilling' },
  refinery: { n: 'REFINE', a: 'REFINE', s: 'hold to boost', hold: true, lv: 85, ic: 'ic_base_cheddar', tree: 'refining' },
  cheesery: { n: 'CHEESE', a: 'SPEED', s: 'UP · hold', hold: true, lv: 93, ic: 'ic_lot_cheddar', tree: 'cheesemaking' },
  shop: { n: 'SELL', a: 'SELL', s: 'hold to boost', hold: true, lv: 86, ic: 'ic_coin', tree: 'trading' },
  lab: { n: 'LAB', a: 'OPEN', s: 'the lab', hold: false, lv: 52, ic: 'ic_flask', tree: 'lab' },
  house: { n: 'HOUSE', a: 'OPEN', s: 'MICE', hold: false, lv: '—', ic: 'ic_coin', tree: null },
  storage: { n: 'PANTRY', a: 'OPEN', s: 'pantry', hold: false, ic: 'ic_lot_cheddar', tree: null },
};
// El estado de cada estación de Cheddar sale de la simulación espejo; el de Gouda, de los textos de V3.
function status(key, z) {
  if (z === 'cheddar') {
    if (key === 'rock') return Z41.veinRevealed ? ['VEIN', 'Vein open', 'new'] : [`${Math.round((100 * Z41.discover) / EX.need)}%`, 'Searching', ''];
    if (key === 'drill') return running() ? [P41.driller ? 'AUTO' : 'RUN', 'Drilling', ''] : Z41.veinRevealed ? ['READY', 'Tap to drill', 'new'] : ['STOP', 'No vein', 'warn'];
    if (key === 'refinery') return refining() ? [P41.refiner ? 'AUTO' : 'RUN', 'Refining', ''] : SIM41.refStatus() === 'ready' ? ['READY', 'Tap to refine', 'new'] : ['NO RAW', 'No Raw', 'warn'];
    if (key === 'cheesery') return pressing() ? [P41.cook ? 'AUTO' : 'RUN', 'Pressing', ''] : SIM41.cookStatus() === 'ready' ? ['READY', 'Tap to press', 'new'] : ['NO BASE', 'No Base', 'warn'];
  }
  const G = { rock: ['AUTO', 'Searching'], drill: ['STOP', 'No vein', 'warn'], refinery: ['NO RAW', 'No Raw', 'warn'], cheesery: ['AUTO', 'Pressing'], shop: [Z41.sellJob ? 'AUTO' : 'NO STOCK', Z41.sellJob ? 'Selling' : 'No cheese', Z41.sellJob ? '' : 'warn'], lab: ['3:20', 'Research 3:20'], house: ['1 IDLE', '1 unassigned'], storage: ['8h', 'No limit'] };
  return G[key] || ['', ''];
}
const UPN = { rock: 'Blasting Charges', drill: 'Turbo Motor', refinery: 'Bigger Vat', cheesery: 'More Moulds', shop: 'Better Prices', lab: 'Faster Research' };
function curKey() { const st = STOPS[S.stop]; if (st.kind === 'locked') return null; return S.focus || null; }
function workerOf(key, st = STOPS[S.stop]) { if (st.kind === 'pilot' || st.kind === 'district') { const c = CREW[st.z]; return { rock: c.miner, drill: c.driller, refinery: c.refiner, cheesery: c.cook }[key]; } return { shop: CREW.town.keeper, lab: CREW.town.sci, house: CREW.town.idle }[key] || null; }
const WHO = { rock: 'miner', drill: 'driller', refinery: 'refiner', cheesery: 'cook' };
// La acción principal de una estación, igual que en MAIN: en la roca, con la veta abierta, el botón es DRILL.
function mainKind(key) { const st = STOPS[S.stop]; if (key === 'rock' && st.kind === 'pilot' && Z41.veinRevealed) return 'drill'; return key; }
// ¿Se puede hacer ahora la acción? Lo decide la regla real (el estado de la simulación espejo), no el dibujo.
function blockedOf(kind) {
  const st = STOPS[S.stop]; if (st.kind !== 'pilot' && !(st.kind === 'town' && kind === 'shop')) return '';
  const r = kind === 'drill' ? SIM41.drillStatus() : kind === 'refinery' ? SIM41.refStatus() : kind === 'cheesery' ? SIM41.cookStatus() : kind === 'shop' ? SIM41.sellStatus() : 'ready';
  return r === 'ready' || r === 'running' ? '' : r;
}
const WHYS = { 'no-vein': 'No vein yet', 'no-raw': 'No Raw', 'no-base': 'No Base', 'no-stock': 'No cheese' };
function updateDock() {
  const st = STOPS[S.stop], key = curKey(), bot = $c('mc-bot');
  $c('mc-pick-t').textContent = st.kind === 'pilot' || st.kind === 'district' ? `${TH[st.z].name} · ${DEP[st.z]}` : st.kind === 'town' ? 'SURFACE' : 'BRIE · LOCKED';
  $c('mc-up').disabled = S.stop === 0; $c('mc-down').disabled = S.stop === STOPS.length - 1;
  bot.classList.toggle('focus', !!key); bot.classList.toggle('explore', !key);
  const tiles = STATIONS[st.kind] || [];
  $c('mc-strip').replaceChildren(...tiles.map((k) => { const s = status(k, st.z), b = document.createElement('button'); b.className = 'mc-tile'; b.dataset.k = k; b.innerHTML = `<img src="out/sprites/${STN[k].ic}.png" alt=""><b>${STN[k].n}</b><small class="${s[2] || ''}">${s[0]}</small>`; b.onclick = () => focusOn(k); return b; }), ...(tiles.length ? [(() => { const b = document.createElement('button'); b.className = 'mc-tile trees'; const ts = treesOf(st); b.innerHTML = `<span class="ti n${ts.length}"></span><b>UPGRADES</b><small>${ts.length} trees</small>`; b.querySelector('.ti').append(...ts.map((t) => TREEUI.treeIcon(t, 1))); b.onclick = () => openTrees(); return b; })()] : []));
  if (!tiles.length) $c('mc-strip').replaceChildren((() => { const d = document.createElement('div'); d.className = 'mc-tile lockt'; d.innerHTML = '<b>BRIE ROCK</b><small>Open it in the COLONY tree</small>'; return d; })());
  if (!key) return;
  const kind = mainKind(key), d = STN[kind], s = status(key, st.z), big = key === 'rock' && ALT === 'A' && st.kind === 'pilot';
  $c('mc-ctl').classList.toggle('big', big);
  $c('mc-act-b').textContent = d.a; $c('mc-act-i').src = `out/sprites/${d.ic}.png`;
  const why = blockedOf(kind); $c('mc-act').classList.toggle('dis', !!why);
  $c('mc-act-s').textContent = why ? WHYS[why] : key === 'rock' && st.kind === 'pilot' ? (Z41.veinRevealed ? (running() ? 'hold to boost' : 'tap to drill') : ALT === 'B' ? 'or tap the rock' : `${Math.round((100 * Z41.discover) / EX.need)}%`) : d.s;
  $c('mc-st').textContent = STN[key].n; $c('mc-st').hidden = big;
  const auto = st.kind !== 'pilot' || !WHO[key] || P41[WHO[key]], l2 = $c('mc-l2'); l2.textContent = big || !auto ? `LV ${STN[key].lv}` : `LV ${STN[key].lv} · AUTO`; l2.className = auto ? 'auto' : '';
  const l3 = $c('mc-l3'); l3.textContent = s[1]; l3.className = s[2] === 'warn' ? 'warn' : s[2] === 'new' ? 'new' : '';
  $c('mc-info').classList.toggle('noface', PRE.w < 360 || big);
  const w = st.kind === 'pilot' && WHO[key] && !P41[WHO[key]] ? null : workerOf(key), wk = $c('mc-wk'); wk.replaceChildren(); if (w) { const c = mF(w, 0, false), i = new Image(); i.src = c.toDataURL(); i.style.cssText = 'width:22px;height:20px;image-rendering:pixelated'; wk.appendChild(i); } else wk.textContent = '+';
  const tb = $c('mc-tree'); tb.hidden = !STN[key].tree; tb.querySelector('.ti').replaceChildren(...(STN[key].tree ? [TREEUI.treeIcon(STN[key].tree)] : []));
}
const treesOf = (st) => (STATIONS[st.kind] || []).map((k) => STN[k].tree).filter(Boolean);
let DOCKSIG = ''; function dockTick() { const sig = [S.stop, S.focus, ALT, Z41.veinRevealed, Math.round((100 * Z41.discover) / EX.need), running(), refining(), pressing(), !!Z41.sellJob, SIM41.refStatus(), SIM41.cookStatus(), SIM41.sellStatus(), FORCE.state, DEP.cheddar].join('|'); if (sig !== DOCKSIG) { DOCKSIG = sig; updateDock(); } }
function sheet(t, p) { const sh = $c('mc-sheet'); sh.classList.remove('list'); $c('mc-sheet-t').textContent = t; $c('mc-sheet-p').innerHTML = p || ''; sh.style.top = stg.offsetTop + 'px'; sh.hidden = false; $c('mc-pop').hidden = true; LOG.push('sheet:' + t); return sh; }
$c('mc-sheet-x').onclick = () => ($c('mc-sheet').hidden = true);
let hT = 0; function hint(t) { const h = $c('mc-hint'); h.textContent = t; h.hidden = false; clearTimeout(hT); hT = setTimeout(() => (h.hidden = true), 1100); }
const LOG = [];
// ---- TREE: el árbol aprobado (el mismo panel de tree.html, sin cambios) ----
function openTree(tree) { if (!tree) return; TREEUI.build(tree, 'late'); const ov = $c('tr-ov'); ov.style.setProperty('--trtop', $c('mc-top').offsetHeight + 'px'); ov.hidden = false; LOG.push('tree:' + tree); }
function closeTree() { $c('tr-ov').hidden = true; }
document.querySelector('#tr-ov .shead .close').onclick = closeTree;
$c('tr-ov').querySelector('.dim').onclick = closeTree;
// UPGRADES en exploración: no hay estación elegida, así que no se adivina; se elige el árbol de esta parada.
function openTrees() {
  const st = STOPS[S.stop], keys = (STATIONS[st.kind] || []).filter((k) => STN[k].tree);
  const sh = sheet('UPGRADES', ''), p = $c('mc-sheet-p'); p.innerHTML = ''; sh.classList.add('list');
  const list = document.createElement('div'); list.className = 'mc-trees';
  for (const k of keys) { const t = STN[k].tree, b = document.createElement('button'); b.innerHTML = `<span class="ti"></span><span><b>${TREEUI.TREES[t].name.toUpperCase()}</b><small>${STN[k].n} · LV ${STN[k].lv}</small></span><em>OPEN</em>`; b.querySelector('.ti').appendChild(TREEUI.treeIcon(t)); b.onclick = () => { sh.hidden = true; openTree(t); }; list.appendChild(b); }
  if (st.kind === 'town') { const b = document.createElement('div'); b.className = 'mc-tnote'; b.textContent = 'HOUSE and PANTRY have no tree. The COLONY tree is under COLONY, below.'; list.appendChild(b); }
  p.appendChild(list);
}
$c('mc-tree').onclick = () => openTree(STN[curKey()] && STN[curKey()].tree);
function focusOn(k) {
  const st = STOPS[S.stop]; if (!st) return;
  if (k === 'lab' || k === 'house' || k === 'storage') { S.station = k; updateDock(); return act('scene', k); }
  if (S.focus === k) return;
  S.focus = k; S.station = k; if (st.kind !== 'town') S.dist = k; moveCam(camTarget(S.stop, k), 320); updateDock(); LOG.push('focus:' + k);
  if (k === 'rock' && ALT === 'B' && st.kind === 'pilot' && !Z41.veinRevealed) hint('Tap the rock to mine');
}
function exitFocus() { if (!S.focus) return; S.focus = null; moveCam(camTarget(S.stop, null), 320); updateDock(); LOG.push('explore'); }
function goStop(i) {
  if (i < 0 || i >= STOPS.length) return; S.focus = null;
  S.stop = i; const st = STOPS[i]; if (st.kind === 'town' && !['shop', 'lab', 'house', 'storage'].includes(S.station)) S.station = 'shop'; else if (st.kind !== 'town') S.station = S.dist;
  moveCam(camTarget(i, null), 340); updateDock(); $c('mc-list').hidden = true; LOG.push('stop:' + st.id);
}
// Acción manual: la del juego, con su regla. En Cheddar pasa por la simulación espejo (y falla donde el juego falla).
function act(src, k = curKey()) {
  const st = STOPS[S.stop]; if (!k) return;
  if (k === 'lab') return sheet('CHEESE LAB', 'El panel aprobado de LAB.');
  if (k === 'house') return sheet('MICE · HOUSE', 'El panel aprobado de MICE, en HOUSE.');
  if (k === 'storage') return sheet('PANTRY', 'El panel aprobado de PANTRY (la despensa sin tope).');
  S.acts++; LOG.push('act:' + k + ':' + src);
  if (st.kind === 'pilot' || (st.kind === 'town' && k === 'shop')) {
    const kind = mainKind(k), r = kind === 'rock' ? SIM41.hit('manual') : kind === 'drill' ? SIM41.drillTap() : kind === 'refinery' ? SIM41.refTap() : kind === 'cheesery' ? SIM41.cookTap() : SIM41.sellTap();
    if (!r.ok) { deniedSnd(); hint({ 'vein-exposed': 'The vein is open: the drill works it', 'no-vein': 'No vein yet: mine the rock', 'no-raw': 'No Raw to refine', 'no-base': 'No Base for a batch', 'no-stock': 'No cheese to sell' }[r.reason] || 'Not possible right now'); LOG.push('fail:' + r.reason); }
    if (kind === 'rock' && r.ok) { const now = performance.now(); S.combo = Z41.combo; S.lastHit = now; paintCombo(); }
    if (kind === 'drill' && r.ok) thunk(1.7, false, true);
    updateDock(); return r;
  }
  return { ok: true };
}
let holdIv = 0; const actB = $c('mc-act');
actB.addEventListener('pointerdown', (e) => { e.preventDefault(); const k = curKey(); act('button', k); actB.classList.add('hit'); setTimeout(() => actB.classList.remove('hit'), 90); clearInterval(holdIv); const kind = k && mainKind(k); if (kind && STN[kind].hold) holdIv = setInterval(() => act('hold', k), 160); });
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) actB.addEventListener(ev, () => clearInterval(holdIv));
$c('mc-back').onclick = () => exitFocus();
$c('mc-wk').onclick = () => { const k = curKey(), w = STOPS[S.stop].kind === 'pilot' && WHO[k] && !P41[WHO[k]] ? null : workerOf(k); sheet(w ? 'MICE · ' + w.name : 'MICE · EMPTY POST', w ? 'La ficha aprobada del ratón del puesto.' : 'El selector aprobado del puesto: elegir un ratón para él.'); };
$c('mc-upg').onclick = () => { const k = curKey(); LOG.push('up:quick'); hint('Bought ' + (UPN[k] || 'the cheapest upgrade')); if (STOPS[S.stop].kind === 'pilot' && WHO[k]) react(WHO[k], 'upgrade'); };
document.querySelectorAll('.mc-glob button').forEach((b) => (b.onclick = () => (b.textContent === 'COLONY' ? openTree('colony') : sheet(b.textContent, 'Panel aprobado.'))));
$c('mc-alert').onclick = () => sheet('ALERTS', 'Alertas de la colonia; tocar una lleva a su estación.');
$c('mc-up').onclick = () => goStop(S.stop - 1); $c('mc-down').onclick = () => goStop(S.stop + 1);
$c('mc-pick').onclick = () => {
  const l = $c('mc-list'); if (!l.hidden) { l.hidden = true; return; }
  const rows = [['town', 'Surface', 'shop · lab · house', 'ic_coin', false, null], ['town', 'Pantry', 'under the village', 'ic_lot_cheddar', false, 'storage'], ['cheddar', 'Cheddar Rock', 'depth ' + DEP.cheddar, 'ic_raw_cheddar', false], ['gouda', 'Gouda Rock', 'depth ' + DEP.gouda, 'ic_raw_gouda', true], ['brie', 'Brie Rock', 'locked', 'ic_raw_brie', false]];
  l.replaceChildren(...rows.map(([id, n, sub, ic, alert, stn]) => { const b = document.createElement('button'); const si = STOPS.findIndex((s) => s.id === id); b.className = si === S.stop ? 'on' : ''; b.disabled = id === 'brie'; b.innerHTML = `<img src="out/sprites/${ic}.png" alt=""><span>${n}<br><small>${sub}</small></span>${alert ? '<i class="dot"></i>' : '<span></span>'}`; b.onclick = () => { goStop(si); if (stn) { S.station = stn; moveCam(camTarget(si, null)); updateDock(); } }; return b; }));
  l.hidden = false;
};
// ---------- Gestos ----------
// Tocar un puesto (o a su ratón) lo elige y la cámara se acerca; volver a tocarlo hace su acción (la del juego). Tocar fuera:
// la colonia. Mantener un ratón: su ficha. Deslizar en vertical: otra parada. En la roca, la acción es la del juego en ese
// momento: picar sin veta; con la veta abierta, la perforadora (como el botón de MAIN).
// A: el botón protagonista; la roca pica al soltar, con su zona normal. B: la roca es el control (zona amplia, al apoyar el dedo,
// y un arrastre que empieza en ella no mueve la cámara).
let PT = null;
const toArt = (e) => { const r = stg.getBoundingClientRect(), k = r.width / stg.clientWidth; return [((e.clientX - r.left) / k) / S.k + S.camX, ((e.clientY - r.top) / k) / S.k + S.camY, k]; };
function hitAt(ax, ay) { const u = HITS.filter((h) => ax >= h.x && ax < h.x + h.w && ay >= h.y && ay < h.y + h.h); return { m: u.filter((h) => h.k === 'm').pop(), b: u.filter((h) => h.k === 'b').pop() }; }
const inMine = (ax, ay) => { const st = STOPS[S.stop]; if (st.kind !== 'pilot') return false; const z = geoC(st).mine; return ax >= z[0] && ax < z[0] + z[2] && ay >= z[1] && ay < z[1] + z[3]; };
function rockAct(ax, ay) { const g = geoC(STOPS[S.stop]); V.tap = [Math.round(Math.max(g.rx + 6, Math.min(g.rx + 48, ax))), Math.round(Math.max(g.rb - 34, Math.min(g.rb - 6, ay)))]; return act('rock', 'rock'); }
stg.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.mc-nav, .mc-list')) return;
  const [ax, ay, k] = toArt(e);
  if (ALT === 'B' && inMine(ax, ay) && (S.focus === 'rock' || !S.focus)) { if (S.focus !== 'rock') focusOn('rock'); rockAct(ax, ay); PT = { mine: true, id: e.pointerId }; return; }
  PT = { x: e.clientX, y: e.clientY, k, t: performance.now(), cx: S.camX, cy: S.camY, ax, ay, axis: null, id: e.pointerId };
  try { stg.setPointerCapture(e.pointerId); } catch (er) {}
  PT.lp = setTimeout(() => longPress(PT), 450);
});
// Mantener un ratón: su ficha. Sale a los 450 ms, o al soltar si el temporizador llegó tarde (pestaña en segundo plano).
function longPress(p) { if (!p || p.axis || p.mine || p.done) return; const h = hitAt(p.ax, p.ay); if (h.m && !h.m.player) { p.done = true; sheet('MICE · ' + h.m.name, 'Ficha aprobada (mantener pulsado).'); if (BR[h.m.who]) react(h.m.who, 'greet'); } }
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
  if (p.axis === 'y') { const dy = (e.clientY - p.y) / p.k, v = dy / Math.max(1, performance.now() - p.t); let i = S.stop; if (dy < -48 || v < -0.5) i = Math.min(STOPS.length - 1, S.stop + 1); else if (dy > 48 || v > 0.5) i = Math.max(0, S.stop - 1); if (i === S.stop) moveCam(camTarget(i), 260); else goStop(i); return; }
  if (p.axis === 'x') return;
  if (performance.now() - p.t > 450) return longPress(p);
  const h = hitAt(p.ax, p.ay), tgt = h.m || h.b;
  if (!tgt) return exitFocus();
  if (tgt.stop !== S.stop) goStop(tgt.stop);
  const k = tgt.st;
  if (S.focus === k) { if (k === 'rock' && STOPS[S.stop].kind === 'pilot') return rockAct(p.ax, p.ay); if (h.m && BR[h.m.who]) return react(h.m.who, 'greet'); return act('scene', k); }
  focusOn(k); if (h.m && BR[h.m.who]) react(h.m.who, 'greet');
});
stg.addEventListener('pointercancel', () => { if (PT) clearTimeout(PT.lp); PT = null; });
stg.addEventListener('contextmenu', (e) => e.preventDefault());
// Combo: el de la regla real (se reinicia al abrirse la veta). El medidor solo se ve buscando.
function paintCombo() { const on = !Z41.veinRevealed && Z41.combo >= 3 && performance.now() - Z41.lastHitAt <= RULE.comboMs; $c('mc-combo').hidden = !on; $c('mc-nav').hidden = on; if (on) { $c('mc-list').hidden = true; $c('mc-combo-n').textContent = Z41.combo; $c('mc-combo-t').textContent = Z41.combo % 5 === 4 ? 'CRIT NEXT' : Z41.combo % 5 === 0 ? 'CRIT!' : 'COMBO'; } }
// ---------- Bucle ----------
let TPREV = 0, FRAMES = [];
function tick() {
  const now = performance.now(), dt = Math.min(64, now - (TPREV || now)); TPREV = now;
  if (S.camTo) { const c = S.camTo, k = Math.min(1, (now - c.t0) / c.ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; S.k = c.fk + (c.tk - c.fk) * e; S.camX = c.fx + (c.tx - c.fx) * e; S.camY = c.fy + (c.ty - c.fy) * e; if (k >= 1) { S.camTo = null; S.k = c.tk; S.camX = c.tx; S.camY = Math.round(c.ty); } }
  if (S.dropStart) { const a = Math.min(1, (now - S.dropT0) / 700); S.drop = S.dropStart * (1 - a * a * (3 - 2 * a)); if (a >= 1) { S.drop = 0; S.dropStart = 0; if (S.focus && STOPS[S.stop].kind === 'pilot' && !S.camTo) moveCam(camTarget(S.stop, S.focus), 420); } }
  step41(dt); liftTick(now);
  if (!$c('mc-combo').hidden || Z41.combo >= 3) paintCombo();
  const t0 = performance.now(); draw(now, dt); FRAMES.push(performance.now() - t0); if (FRAMES.length > 240) FRAMES.shift();
  dockTick();
}
setInterval(tick, 16);
