// ---------- Columna ----------
const COLC = $c('mc-col');
const H2c = (t, p) => { const h = document.createElement('h2'); h.textContent = t; COLC.appendChild(h); if (p) { const q = document.createElement('p'); q.innerHTML = p; COLC.appendChild(q); } return h; };
const pickC = (items, cur, on) => { const w = document.createElement('div'); w.className = 'mc-pk'; const paint = () => w.replaceChildren(...items.map(([k, l]) => { const b = document.createElement('button'); b.textContent = l; b.setAttribute('aria-pressed', String(cur() === k)); b.onclick = () => { on(k); paint(); }; return b; })); paint(); COLC.appendChild(w); return paint; };
const btnsC = (items) => { const w = document.createElement('div'); w.className = 'mc-pk'; for (const [l, f] of items) { const b = document.createElement('button'); b.textContent = l; b.onclick = f; w.appendChild(b); } COLC.appendChild(w); return w; };
const TBc = (head, rows, el) => { const w = el || document.createElement('div'); w.style.overflowX = 'auto'; w.innerHTML = `<table class="mc-tb"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>`; if (!el) COLC.appendChild(w); return w; };
const ULc = (items) => { const u = document.createElement('ul'); u.innerHTML = items.map((x) => `<li>${x}</li>`).join(''); COLC.appendChild(u); };
function relayoutC() { layout(); liveC(); }

H2c('A · MINE: ACCIÓN MANUAL', 'Elige la estación MINE (su casilla, o toca la roca): la cámara se acerca a la corta y el panel enseña su acción. <b>A</b>: un botón MINE protagonista (tocar la roca también pica, con su zona normal). <b>B</b>: la roca es el control (zona amplia, el golpe sale al apoyar el dedo y un arrastre que empieza en ella no mueve la cámara); el botón sigue ahí, más pequeño.');
pickC([['A', 'A · Botón protagonista'], ['B', 'B · Tocar la roca']], () => ALT, (k) => { ALT = k; updateDock(); });
pickC([[true, 'Sonido sí'], [false, 'Sonido no']], () => SOUND, (k) => { SOUND = k; });
H2c('PANTALLA');
pickC(PRESETS.map((p) => [p.k, p.d]), () => PRE.k, (k) => { PRE = PRESETS.find((p) => p.k === k); relayoutC(); });
pickC([[3, 'DPR 3'], [2, 'DPR 2']], () => DPRS, (k) => { DPRS = k; relayoutC(); });
pickC([[true, 'Con objetivo'], [false, 'Sin objetivo']], () => TUT, (k) => { TUT = k; relayoutC(); });
pickC([[false, 'Zonas táctiles ocultas'], [true, 'Zonas táctiles visibles']], () => SHOWHITS, (k) => { SHOWHITS = k; if (!k) $c('mc-hits').hidden = true; });

// ---- B · Prueba de vida ----
H2c('B · RATONES VIVOS: PRUEBA DE 30 S', 'Pone Cheddar en exploración y deja la colonia sola 30 s (sin tocar nada). Al acabar, cuenta qué hizo cada ratón, si alguno fue a la vez que otro, si alguien pisó fuera de su suelo y qué reacciones hubo. La roca, la veta y los suministros siguen la simulación normal.');
const LF = document.createElement('div'); LF.className = 'mc-life'; LF.innerHTML = '<div class="mc-pk"><button id="mc-life-go">▶ Prueba de vida · 30 s</button></div><div class="bar"><i id="mc-life-bar"></i></div><pre class="mc-livebox" id="mc-life-out">—</pre>'; COLC.appendChild(LF);
const wtc = (ms) => new Promise((r) => setTimeout(() => { tick(); r(); }, ms));
async function lifeTest(ms = 30000) {
  SIM.state = 'normal'; $c('mc-sheet').hidden = true; goStop(1); await wtc(300); exitFocus(); await wtc(300);
  const t0 = performance.now(), marks = Object.fromEntries(Object.entries(BR).map(([k, b]) => [k, b.log.length])), bad = [], seenBubbles = new Set(), veinT = [];
  let lastPhase = M.phase;
  while (performance.now() - t0 < ms) {
    await wtc(200); $c('mc-life-bar').style.width = Math.min(100, ((performance.now() - t0) / ms) * 100) + '%';
    const g = geoC(STOPS[1]); for (const [who, b] of Object.entries(BR)) { const W = g.walk[who]; if (b.x < W[0] - 0.6 || b.x > W[1] + 0.6) bad.push(`${b.m.name} x=${b.x.toFixed(1)}`); }
    if (performance.now() < BUB.until) seenBubbles.add(BUB.text); if (M.phase !== lastPhase) { veinT.push(M.phase); lastPhase = M.phase; }
  }
  const out = [], acts = {}, starts = [];
  for (const [who, b] of Object.entries(BR)) { const L = b.log.slice(marks[who]); const names = L.map((e) => e[0]); acts[who] = names; for (const [n, t] of L) starts.push([who, n, t]); const cnt = {}; for (const n of names) cnt[n] = (cnt[n] || 0) + 1; out.push(`${b.m.name.padEnd(7)} ${Object.keys(cnt).length} cosas distintas · ${Object.entries(cnt).map(([k, v]) => `${k} ×${v}`).join(', ')}`); }
  let sync = 0; starts.sort((a, b) => a[2] - b[2]); for (let i = 1; i < starts.length; i++) if (starts[i][2] - starts[i - 1][2] < 120 && starts[i][1] === starts[i - 1][1] && starts[i][0] !== starts[i - 1][0]) sync++;
  out.push(`A la vez (misma acción, mismo instante, ratones distintos): ${sync}`);
  out.push(`Fuera de su suelo: ${bad.length ? bad.slice(0, 4).join(', ') : 'nadie'}`);
  out.push(`Bocadillos: ${seenBubbles.size ? [...seenBubbles].join(' · ') : 'ninguno'} · Cambios de veta: ${veinT.join(' → ') || 'ninguno'}`);
  const r = { acts, sync, bad: bad.length, bubbles: [...seenBubbles], phases: veinT, out };
  $c('mc-life-out').textContent = out.join('\n'); window.LIFE = r; return r;
}
$c('mc-life-go').onclick = () => lifeTest();

// ---- Estados simulados ----
H2c('ESTADOS SIMULADOS', 'Situaciones que existen en el juego, forzadas para ver cómo reacciona cada ratón. Mientras dura una, el teléfono lleva la chapa <b>SIMULACIÓN</b>.');
pickC(Object.entries(SIMS).map(([k, v]) => [k, v || 'Normal']), () => SIM.state, (k) => { SIM.state = k; if (k === 'novein' && M.phase === 'vein') { M.vein = 0.001; } if (k === 'noraw') M.raw = 0; if (k === 'nobase') M.base = 0; if (k === 'normal') { M.raw = Math.max(M.raw, 5); M.base = Math.max(M.base, 4); } for (const b of Object.values(BR)) b.until = 0; updateDock(); });
btnsC([['Veta descubierta', () => { if (M.phase === 'search') { M.hits = M.need; openVein(); } }], ['Mejora comprada (estación elegida)', () => { const k = S.focus || 'drill'; hint('Bought ' + (UPN[k] || 'an upgrade')); react(WHO[k] || 'driller', 'upgrade'); }], ['Profundidad +10', () => deepen(DEP.cheddar + 10)], ['Profundidad 12', () => deepen(12)]]);

// ---- C · Arte piloto ----
H2c('C · ARTE PILOTO · CHEDDAR', 'Cada pieza nueva a 4×, junto a un ratón oficial a la misma escala. Todo sale del mismo constructor (misma luz, el contorno de los ratones y una paleta común) y se puede sustituir por un PNG del mismo tamaño.');
const SA = document.createElement('canvas'); SA.className = 'mc-sheetart'; COLC.appendChild(SA);
function artSheet() {
  const k = 4, items = [['Ratón oficial (MICE)', mouseCanvas(CREW.cheddar.cook, 0, false, {})], ['Horno', artFurnace()], ['Alambique', artStill()], ['Perforadora', artDrill()], ['Volante', artWheel(0)], ['Cuadro', artPanel()], ['Broca', artBit(0)], ['Pórtico', artGantry(52)], ['Marco quesería', artFrame(36)], ['Toldo', artAwning(40)], ['Baldas', artShelfN(0)], ['Cuba', artVat()], ['Prensa', artPress(0)], ['Farol', artLantern()], ['Pico, arriba · PENDIENTE', artPick(0)], ['Pico, golpe · PENDIENTE', artPick(2)], ['Raw · PENDIENTE', artCarry('raw')], ['Rueda · PENDIENTE', artCarry('w')]];
  const W = 1000, g = SA.getContext('2d'); g.font = '600 13px system-ui, sans-serif'; let x = 8, y = 22, rh = 0; const pos = [];
  for (const [n, c] of items) { const w = Math.max(c.width * k, g.measureText(n).width + 4), h = c.height * k; if (x + w > W - 8) { x = 8; y += rh + 28; rh = 0; } pos.push([n, c, x, y]); x += w + 18; rh = Math.max(rh, h); }
  SA.width = W; SA.height = y + rh + 12; g.imageSmoothingEnabled = false; g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, SA.width, SA.height); g.font = '600 13px system-ui, sans-serif';
  for (const [n, c, x0, y0] of pos) { g.fillStyle = /PENDIENTE/.test(n) ? '#ffb347' : '#f4ead8'; g.fillText(n, x0, y0 - 7); g.drawImage(c, x0, y0, c.width * k, c.height * k); }
}
addEventListener('load', artSheet);

// ---- D · Medidas ----
H2c('D · MEDIDAS EN DIRECTO');
const LVc = document.createElement('div'); LVc.className = 'mc-livebox'; COLC.appendChild(LVc);
function liveC() {
  const st = STOPS[1], g = geoC(st), f = camTarget(1, 'rock'), r = g.st.rock[0], mz = g.mine, act = $c('mc-act').getBoundingClientRect(), phone = $c('phone').getBoundingClientRect(), sc = phone.width / PRE.w;
  const avg = FRAMES.length ? FRAMES.reduce((a, b) => a + b, 0) / FRAMES.length : 0, max = FRAMES.length ? Math.max(...FRAMES) : 0;
  LVc.textContent = `${PRE.d} · DPR ${DPRS} · HUD ${$c('mc-top').offsetHeight} px · panel ${$c('mc-bot').offsetHeight} px · escena ${stg.clientHeight} px\n` +
    `Colonia: ${SC.s.toFixed(2)} px CSS por píxel de arte (ratón ${Math.round(20 * SC.s)} px) · Estación MINE: ${f.k.toFixed(2)} (ratón ${Math.round(20 * f.k)} px)\n` +
    `Roca en MINE: ${Math.round(r[2] * f.k)}×${Math.round(r[3] * f.k)} px · zona de la roca en B: ${Math.round(mz[2] * f.k)}×${Math.round(mz[3] * f.k)} px\n` +
    `Botón MINE (A, en pantalla): ${act.width ? Math.round(act.width / sc) + '×' + Math.round(act.height / sc) + ' px' : '— (elige MINE)'}\n` +
    `Dibujo por fotograma: media ${avg.toFixed(2)} ms · máx. ${max.toFixed(2)} ms (${FRAMES.length} fotogramas, este ordenador) · partículas vivas ${PT4.length}`;
}
setInterval(liveC, 1000);

// ---- QA ----
H2c('QA · INTERACCIONES', 'Eventos sintéticos en la pantalla elegida: confirman la lógica, no sustituyen a Chrome Android ni a Safari iOS.');
const QWc = document.createElement('div'); QWc.className = 'mc-qa'; COLC.appendChild(QWc);
const QBc = document.createElement('button'); QBc.textContent = '▶ Ejecutar'; QWc.appendChild(QBc); const QPc = document.createElement('pre'); QWc.appendChild(QPc);
function ptrC(type, ax, ay, id = 7) { const r = stg.getBoundingClientRect(), k = r.width / stg.clientWidth; const x = r.left + (ax - S.camX) * S.k * k, y = r.top + (ay - S.camY) * S.k * k; stg.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: true })); }
async function tapC(ax, ay, hold = 0) { ptrC('pointerdown', ax, ay); await wtc(hold || 40); ptrC('pointerup', ax, ay); await wtc(60); }
async function dragFrom(ax, ay, dy) { ptrC('pointerdown', ax, ay); for (let i = 1; i <= 6; i++) { ptrC('pointermove', ax, ay + (dy * i) / 6 / S.k); await wtc(16); } ptrC('pointerup', ax, ay + dy / S.k); await wtc(420); }
const ctrC = (h) => [h.x + h.w / 2, h.y + h.h / 2];
const rectOf = (id) => $c(id).getBoundingClientRect();
const overlap = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
const cssR = (r) => { const sr = stg.getBoundingClientRect(), k = sr.width / stg.clientWidth; return { left: sr.left + (r[0] - S.camX) * S.k * k, top: sr.top + (r[1] - S.camY) * S.k * k, right: sr.left + (r[0] + r[2] - S.camX) * S.k * k, bottom: sr.top + (r[1] + r[3] - S.camY) * S.k * k }; };
const inStage = (rr) => { const s = stg.getBoundingClientRect(), n = rectOf('mc-nav'); return rr.left >= s.left - 1 && rr.right <= s.right + 1 && rr.top >= n.bottom - 1 && rr.bottom <= s.bottom + 1; };
async function qaRun() {
  const out = [], ok = (c, t) => out.push((c ? '✔ ' : '✘ ') + t), botH = $c('mc-bot').offsetHeight;
  $c('mc-sheet').hidden = true; SIM.state = 'normal'; S.combo = 0; S.lastHit = -1e9; paintCombo(); goStop(1); await wtc(400); exitFocus(); await wtc(400);
  ok(!S.focus && $c('mc-bot').classList.contains('explore') && $c('mc-strip').children.length === 5, 'exploración: una casilla por estación y BUY ALL');
  // MINE: la cámara se acerca y la roca queda entera y a la vista.
  [...$c('mc-strip').children][0].click(); await wtc(420); const g = geoC(STOPS[1]);
  if (S.k > SC.s) ok(S.focus === 'rock', `MINE: la cámara se acerca (${SC.s.toFixed(2)} → ${S.k.toFixed(2)})`); else out.push(`· MINE: en esta pantalla no cabe una escala mayor (${SC.s.toFixed(2)}); la roca ya llena la escena`); ok(inStage(cssR(g.st.rock[0])), 'la roca se ve entera, debajo del selector y encima del panel');
  ok($c('mc-bot').offsetHeight === botH, `el panel no cambia de alto al cambiar de modo (${botH} px)`);
  // A · botón protagonista: 20 toques rápidos.
  ALT = 'A'; updateDock(); await wtc(60); let a0 = S.acts, cam = [S.camX, S.camY, S.k], stp = S.stop;
  for (let i = 0; i < 20; i++) { actB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9 })); await wtc(25); actB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 9 })); await wtc(25); }
  ok(S.acts - a0 === 20, `A: 20 toques rápidos al botón = ${S.acts - a0} golpes`); ok(S.stop === stp && Math.abs(S.camY - cam[1]) < 0.5 && S.k === cam[2], 'A: la cámara no se mueve');
  const ab = rectOf('mc-act'), sc = rectOf('phone').width / PRE.w; ok(ab.width / sc >= 96 && ab.height / sc >= 56, `A: botón MINE de ${Math.round(ab.width / sc)}×${Math.round(ab.height / sc)} px`);
  await wtc(700); a0 = S.acts; const rr = g.st.rock[0]; await tapC(rr[0] + rr[2] / 2, rr[1] + rr[3] / 2); ok(S.acts === a0 + 1, 'A: tocar la roca también pica');
  // B · la roca es el control.
  await wtc(700); ALT = 'B'; updateDock(); a0 = S.acts; cam = [S.camX, S.camY, S.k];
  for (let i = 0; i < 20; i++) { const jx = (i % 3) - 1, jy = (i % 2) * 2; ptrC('pointerdown', rr[0] + rr[2] / 2 + jx * 3, rr[1] + 10 + jy, 20 + (i % 2)); await wtc(25); ptrC('pointerup', rr[0] + rr[2] / 2 + jx * 3, rr[1] + 10 + jy, 20 + (i % 2)); await wtc(25); }
  ok(S.acts - a0 === 20, `B: 20 toques rápidos a la roca (con temblor y dos dedos) = ${S.acts - a0} golpes`); ok(Math.abs(S.camY - cam[1]) < 0.5, 'B: la cámara no se mueve');
  await wtc(700); a0 = S.acts; await dragFrom(rr[0] + rr[2] / 2, rr[1] + 12, -90); ok(S.stop === 1 && Math.abs(S.camY - cam[1]) < 0.5, 'B: un arrastre que empieza en la roca no mueve la cámara (cuenta como un golpe)');
  const mz = g.mine; ok(mz[2] * S.k >= 150 && mz[3] * S.k >= 100, `B: zona de la roca de ${Math.round(mz[2] * S.k)}×${Math.round(mz[3] * S.k)} px`);
  a0 = S.acts; actB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9 })); await wtc(30); actB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 9 })); ok(S.acts === a0 + 1, 'B: el botón MINE sigue picando');
  await wtc(700); ALT = 'A'; updateDock();
  // Otras estaciones, ratones y navegación.
  $c('mc-back').click(); await wtc(400); ok(!S.focus, '◂ vuelve a la colonia');
  [...$c('mc-strip').children][1].click(); await wtc(400); a0 = S.acts; actB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 8 })); await wtc(820); actB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 8 })); ok(S.acts - a0 >= 5, `DRILL: mantener repite (${S.acts - a0} en 0,8 s)`);
  exitFocus(); await wtc(400); let m = HITS.find((h) => h.k === 'm' && h.who === 'refiner'); await tapC(m.x + 11, m.y + 10); ok(S.focus === 'refinery' && BR.refiner.react && BR.refiner.react.kind === 'greet', 'tocar al refinador: elige la refinería y el ratón responde');
  m = HITS.find((h) => h.k === 'm' && h.who === 'cook'); if (m) { await tapC(m.x + 11, m.y + 10, 520); ok(!$c('mc-sheet').hidden && /Tilly/.test($c('mc-sheet-t').textContent), 'mantener a la quesera abre su ficha'); $c('mc-sheet').hidden = true; }
  const fr = geoC(STOPS[1]).st.refinery[0]; await tapC(S.camX + 4, S.camY + viewH() - 4); ok(!S.focus, 'tocar fuera de las estaciones vuelve a la colonia');
  const cy0 = S.camY; await dragFrom(S.camX + viewW() / 2, S.camY + viewH() / 2, -90); ok(STOPS[S.stop].id === 'gouda', 'deslizar en exploración: Gouda'); $c('mc-up').click(); await wtc(400); ok(STOPS[S.stop].id === 'cheddar', '▲: Cheddar');
  // Panel de estación: tamaños y BUY ALL.
  [...$c('mc-strip').children][2].click(); await wtc(400); const sizes = ['mc-back', 'mc-act', 'mc-upg', 'mc-more'].map((id) => { const r = rectOf(id); return [id, Math.round(r.width / sc), Math.round(r.height / sc)]; });
  ok(sizes.every(([, w, h]) => w >= 36 && h >= 56), 'panel de estación: ' + sizes.map(([id, w, h]) => `${id.slice(3)} ${w}×${h}`).join(' · '));
  let lg = LOG.length; $c('mc-more').click(); await wtc(30); [...$c('mc-pop').children][0].click(); ok(LOG[lg] === 'up:all', 'BUY ALL: 2 toques (⋯ → BUY ALL)'); exitFocus(); await wtc(400);
  lg = LOG.length; [...$c('mc-strip').children][4].click(); ok(LOG[lg] === 'up:all', 'BUY ALL: 1 toque en exploración');
  // Solapes.
  for (const k of ['rock', 'drill', 'refinery', 'cheesery']) { focusOn(k); await wtc(400); const r = cssR(geoC(STOPS[1]).st[k][0]); ok(!overlap(r, rectOf('mc-nav')) && inStage(r), `${k}: la estación se ve entera y el selector no la tapa`); }
  exitFocus(); await wtc(400);
  const nw = $c('mc-new'), bb = $c('mc-bub'); ok(nw.hidden || bb.hidden || !overlap(nw.getBoundingClientRect(), bb.getBoundingClientRect()), 'NEW y el bocadillo no se pisan');
  ok(Math.round(20 * SC.s) >= 40, `ratón en exploración: ${Math.round(22 * SC.s)}×${Math.round(20 * SC.s)} px`);
  out.unshift(`${PRE.d} · DPR ${DPRS}`); return out;
}

// ---------- Informe ----------
H2c('A · MINE: QUÉ CAMBIA', 'Medido en este prototipo; nada de esto toca la economía.');
ULc([
  '<b>La cámara se acerca a la corta</b> al elegir MINE: de 2,33 a 3,5 px por píxel de arte en 375 (ratones de 47 a 70 px). En 320×568 llega a 3,33. En 320×460 con DPR 2 no cabe una escala mayor: la roca ya llena la escena.',
  '<b>Cada golpe se nota:</b>\n<ul>\n<li>la roca se sacude 1 px (2 en el crítico) y destella 60 ms;</li>\n<li>saltan de 2 a 7 trozos que caen y rebotan, con algo de polvo, y suena un golpe seco;</li>\n<li>cada 5 golpes seguidos hay un crítico con chispas y un «tink».</li>\n</ul>',
  'El minero golpea a la vez que el dedo.',
  '<b>Grietas y veta aprobadas:</b> las grietas son los estados aprobados de la roca (c0–c4). Al abrirse la veta (v5) suena un acorde y la barra de la perforadora baja hasta ella; mientras la veta se vacía (v5 → v1), el Raw sube por la barra.',
  '<b>A · botón protagonista:</b> 131×60 px en 375, 122 en 360 y 98 en 320 (en V3, 62×60). Al pulsarlo se hunde y el pico se inclina. Tocar la roca también pica, con su zona normal y al soltar.',
  '<b>B · tocar la roca:</b> la zona mide 308×210 px en 375 y 176×120 en el peor caso. El golpe sale al apoyar el dedo y vale con dos dedos alternos. Un arrastre que empieza en la roca no mueve la cámara. El botón sigue picando.',
  '<b>QA:</b> 20 toques rápidos dan 20 golpes en A y en B, sin mover la cámara ni la parada.',
  '<b>Mi lectura:</b> B se siente más directo (el golpe cae donde está el dedo) y A es más predecible y accesible. Propongo combinarlas: el botón protagonista de A y la roca como en B, solo mientras MINE está elegida. Antes de decidir, hay que probar en un móvil si el bloqueo del arrastre molesta.',
]);
H2c('B · RATONES VIVOS: CÓMO SE COMPORTAN', 'Cada uno tiene su repertorio, con duraciones y ritmo propios (semilla por nombre) y solo se mueve por su suelo. Todo con las poses aprobadas de MICE; lo que no existe va aparte y está marcado como pendiente.');
TBc(['RATÓN', 'TRABAJA', 'PAUSA', 'REACCIONA', 'PIEZA PENDIENTE'], [
  ['Colby, minero', 'Pica en la cresta; se aparta cuando baja la barra', 'Mira alrededor, revisa la roca con la lupa, cambia de sitio', 'Veta: sorpresa y salto. Elegido: mira al frente y se alegra.', 'Pico (pieza aparte)'],
  ['Paneer, perforador', 'Maneja el cuadro; va a mirar la broca', 'Mira alrededor', 'Sin veta: golpea el pie, mira al minero desde el borde y dice «No vein yet». Veta: corre al cuadro.', '—'],
  ['Monty, refinador', 'Aviva el horno (el fuego crece), gira la válvula, mira el manómetro', 'Mira alrededor', 'Sin Raw: oreja caída, golpea el pie y dice «Need Raw!». El fuego baja.', 'Trozo de Raw en la pata'],
  ['Tilly, quesera', 'Aprieta la prensa (se mueve), remueve la cuba, lleva la rueda a la balda', 'Lee el recetario (pose del libro), mira las ruedas con la lupa', 'Sin Base: cara triste y dice «Need Base!».', 'Rueda en la pata'],
]);
ULc([
  '<b>Prueba de 30 s</b> sin tocar nada:\n<ul>\n<li>actividades distintas: 5 Monty, 5 Tilly, 6 Paneer y 6 Colby;</li>\n<li>1 coincidencia de misma acción en el mismo instante;</li>\n<li>nadie pisó fuera de su suelo;</li>\n<li>dos bocadillos espontáneos («No vein yet», «Need Raw!») y una veta completa (abrir, vaciar, volver a buscar).</li>\n</ul>',
  '<b>Reutilizado con otro sentido (a confirmar):</b> el libro de entrenamiento como recetario y la lupa para revisar.',
  '<b>No se toca ningún sprite oficial.</b> La pose de la rueda dorada del Grand Master no se usa para acarrear queso, para no confundirla con el título.',
]);
H2c('C · ARTE PILOTO: DE DÓNDE SALE CADA COSA');
TBc(['', 'QUÉ'], [
  ['<span class="ok">Reutilizado</span>', 'Ratones de MICE; estados de la roca (big_cheddar c0–c4 y v1–v5); cajas de Raw; iconos; superficie y Gouda de V3 (solo contexto).'],
  ['<span class="mid">Adaptado</span>', 'La corta de V3: bancos por tramo, con entibado, vetas y cristales; la roca se hunde un banco cuando cambia de tramo.'],
  ['<span class="mid">Nuevo (piloto)</span>', 'Horno, alambique con serpentín, molde de la Base, perforadora (carcasa, volante, cuadro, broca), pórtico, marco y toldo de la quesería, baldas, cuba, prensa, farol, barril; el terreno (pared de la caverna, terrazas con canto de madera, escalera, escala, estalactitas, raíces, luces).'],
  ['<span class="no">Pendiente</span>', 'Pico del minero y lo que llevan en la pata; están dibujados aparte, sin tocar el ratón.'],
]);
ULc([
  '<b>Cómo está hecho:</b> todo sale del mismo constructor de píxeles, con la luz de arriba a la izquierda, el contorno de los ratones y una paleta común. Por eso encaja mucho mejor con ellos que los bloques de V3.',
  '<b>Mi valoración honesta:</b> es un salto claro, pero <b>todavía no llega a la calidad de los ratones</b>.\n<ul>\n<li>A las máquinas les falta encanto y detalle fino.</li>\n<li>La escena es muy marrón: los planos se separan poco por valor.</li>\n<li>La textura de la pared sigue siendo genérica.</li>\n<li>En una terraza de 36 px la quesería queda apretada.</li>\n</ul>\nPropongo otra iteración de arte (mejor, con piezas dibujadas a mano) antes de extenderlo a otras rocas.',
]);
H2c('D · UX Y VIABILIDAD');
TBc(['', 'MEDIDO'], [
  ['Panel', '120 px fijos en los dos modos (exploración y estación): cambiar de modo no mueve la escena.'],
  ['Exploración', 'Una casilla por estación con su estado y BUY ALL a 1 toque; el resto de la pantalla es la colonia.'],
  ['Estación', '◂ 36×60, acción (76×60, o 131×60 la de MINE en A), su ratón y dos renglones, UP 56×60 y ⋯ 36×60 (BUY ALL a 2 toques). Por debajo de 360 px la cara del ratón sale del panel para que no se corten los textos: su ficha se abre manteniéndolo en la escena, donde mide 60-70 px. Ningún texto se corta en las cinco pantallas, con A, con B ni en ningún estado simulado.'],
  ['Ratones', 'Colonia: 47 px en 375 y 40 en 320. Estación: 70 en 375 y 67 en 320×568.'],
  ['Selector', 'Nunca tapa la estación elegida: verificado en las cuatro estaciones y en las cinco pantallas.'],
  ['Rendimiento (este Mac, no un móvil)', 'Dibujo: media 0,20 ms y máximo 0,60 ms por fotograma, con ráfagas de golpes. El terreno se pinta una vez por tramo y las partículas tienen tope (70).'],
  ['Web', 'Eventos de puntero, sonido sintetizado tras el primer toque (como exige iOS), sin instalación ni service worker.'],
]);
H2c('EVALUACIÓN CRÍTICA');
ULc([
  '<b>¿Se siente mejor el minado?</b> Sí, frente a V3: acercamiento, respuesta física, sonido, minero sincronizado y el ciclo real de grietas → veta → perforadora. Falta notarlo en la mano: latencia, tacto y volumen en un móvil.',
  '<b>¿La colonia parece más viva?</b> Sí. Cada ratón tiene su oficio, pausas propias y reacciones a estados que existen en el juego. El límite son las pocas poses aprobadas: con horas de juego se notará la repetición. Las animaciones propias (golpe de pico, acarrear) están pendientes de aprobación.',
  '<b>¿Los edificios alcanzan Pulido+?</b> Todavía no. Son coherentes y se reconocen, pero quedan por debajo de los ratones.',
  '<b>¿Legibilidad y comodidad móvil?</b> Sí en 360 y 375; 320×460 va al límite (sin acercamiento con DPR 2).',
]);
H2c('RIESGOS QUE QUEDAN');
ULc([
  '<b>Sin probar en móviles reales.</b> Ni Chrome Android ni Safari iOS: tacto, latencia, sonido y rendimiento sin medir allí. El QA es sintético.',
  '<b>B (tocar la roca)</b> bloquea el arrastre que empieza en ella: hay que comprobar que no frustra a quien quiere desplazarse.',
  '<b>Piezas pendientes</b> (pico y lo que llevan en la pata): necesitan aprobación o dibujo final.',
  '<b>La simulación</b> (12 golpes por veta, 10 s por veta, suministros) es de presentación; en el juego, los tiempos reales decidirán cuánto se ve cada estado.',
  '<b>El arte piloto</b> no está a la altura de MICE: no conviene extenderlo a seis rocas todavía.',
]);
QBc.onclick = async () => { QPc.textContent = '…'; const o = await qaRun(); QPc.textContent = o.join('\n'); window.MC_QA = o; };
relayoutC();

</script>
