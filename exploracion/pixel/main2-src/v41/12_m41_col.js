// ---------- Columna ----------
const COLC = $c('mc-col');
const H2c = (t, p) => { const h = document.createElement('h2'); h.textContent = t; COLC.appendChild(h); if (p) { const q = document.createElement('p'); q.innerHTML = p; COLC.appendChild(q); } return h; };
const pickC = (items, cur, on) => { const w = document.createElement('div'); w.className = 'mc-pk'; const paint = () => w.replaceChildren(...items.map(([k, l]) => { const b = document.createElement('button'); b.textContent = l; b.setAttribute('aria-pressed', String(cur() === k)); b.onclick = () => { on(k); paint(); }; return b; })); paint(); COLC.appendChild(w); return paint; };
const btnsC = (items) => { const w = document.createElement('div'); w.className = 'mc-pk'; for (const [l, f] of items) { const b = document.createElement('button'); b.textContent = l; b.onclick = f; w.appendChild(b); } COLC.appendChild(w); return w; };
const TBc = (head, rows, el) => { const w = el || document.createElement('div'); w.style.overflowX = 'auto'; w.innerHTML = `<table class="mc-tb"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>`; if (!el) COLC.appendChild(w); return w; };
const ULc = (items) => { const u = document.createElement('ul'); u.innerHTML = items.map((x) => `<li>${x}</li>`).join(''); COLC.appendChild(u); };
const BOXc = () => { const d = document.createElement('pre'); d.className = 'mc-livebox'; d.textContent = '—'; COLC.appendChild(d); return d; };
function relayoutC() { layout(); liveC(); }

H2c('PROBAR', 'Toca una estación (o su casilla) para acercarte. En MINE, pica con el botón o tocando la roca; con la veta abierta, la acción pasa a ser DRILL, como en MAIN. TREE abre el árbol de la estación; en la colonia, UPGRADES deja elegir entre los árboles de esa parada. Todo Cheddar sigue la simulación espejo, con cifras de ejemplo para que un ciclo entero quepa en unos 40 s.');
pickC([['A', 'A · Botón protagonista'], ['B', 'B · Tocar la roca']], () => ALT, (k) => { ALT = k; updateDock(); });
pickC([[true, 'Sonidos del juego: sí'], [false, 'Sonidos del juego: no']], () => SOUND, (k) => { SOUND = k; });
pickC([[false, 'Sonidos nuevos de MAIN 2.0: no'], [true, 'Sonidos nuevos de MAIN 2.0: sí (sin aprobar)']], () => SOUND_NEW, (k) => { SOUND_NEW = k; });
pickC(PRESETS.map((p) => [p.k, p.d]), () => PRE.k, (k) => { PRE = PRESETS.find((p) => p.k === k); relayoutC(); });
pickC([[3, 'DPR 3'], [2, 'DPR 2']], () => DPRS, (k) => { DPRS = k; relayoutC(); });
pickC([[true, 'Con objetivo'], [false, 'Sin objetivo']], () => TUT, (k) => { TUT = k; relayoutC(); });
pickC([[false, 'Zonas táctiles ocultas'], [true, 'Zonas táctiles visibles']], () => SHOWHITS, (k) => { SHOWHITS = k; if (!k) $c('mc-hits').hidden = true; });

// ---- Estados ----
// Solo quitan un ratón o un material, cosas que pasan en el juego. Nunca permiten una acción que el juego no permite.
const FORCES = { normal: 'Normal', nominer: 'sin minero', nodriller: 'sin perforador', noraw: 'refinería sin Raw', nobase: 'quesería sin Base' };
function force(k) {
  FORCE.state = k; Object.assign(P41, { miner: true, driller: true, refiner: true, cook: true, keeper: true });
  if (k === 'nominer') P41.miner = false;
  if (k === 'nodriller') P41.driller = false;
  if (k === 'noraw') { P41.driller = false; Z41.raw = 0; }
  if (k === 'nobase') { P41.refiner = false; Z41.base = 0; }
  if (k === 'normal') { Z41.raw = Math.max(Z41.raw, 4); Z41.base = Math.max(Z41.base, 3); }
  for (const w of ['miner', 'driller', 'refiner', 'cook']) if (!P41[w]) delete BR[w]; else if (BR[w]) BR[w].until = 0;
  updateDock();
}
H2c('ESTADOS', 'Situaciones que existen en el juego. Mientras dura una, el teléfono lleva la chapa <b>SIMULACIÓN</b>. Sin un ratón en su puesto, ese ratón no aparece y su etapa espera a que la toques (como en el juego).');
const paintForce = pickC(Object.entries(FORCES), () => FORCE.state, (k) => force(k));
// Abrir la veta con golpes legales (los mismos que daría el jugador), no saltándose la búsqueda.
function legalReveal() { let n = 0; while (!Z41.veinRevealed && n < 400) { Z41.lastHitAt = -1e9; if (SIM41.hit('manual').ok) n++; else break; } hint(`Vein open after ${n} legal hits`); return n; }
btnsC([['Veta descubierta (golpes legales)', () => legalReveal()], ['Mejora comprada (estación elegida)', () => { const k = S.focus || 'drill'; hint('Bought ' + (UPN[k] || 'an upgrade')); if (WHO[k]) react(WHO[k], 'upgrade'); }], ['Seguir el queso hasta la tienda', () => followCheese()], ['Reiniciar Cheddar', () => { simReset(); force('normal'); paintForce(); V.tokens.length = 0; }]]);
// Seguir el queso: la cámara acompaña a la jaula, de la quesería a la tienda, y se queda en la superficie.
let FOLLOW = 0;
function followCheese() { exitFocus(); FOLLOW = performance.now(); if (LIFT.state === 'wait' && !LIFT.queue) LIFT.queue = 1; }
function followTick() {
  if (!FOLLOW) return; const now = performance.now();
  if (now - FOLLOW > 14000 || (LIFT.state === 'down' && now - LIFT.t0 > 600)) { FOLLOW = 0; goStop(0); return; }
  const want = Math.round((LIFT.y ?? 0) - viewH() * 0.55), lo = -NAVR() / S.k; S.camTo = null; S.camY += (Math.max(lo, want) - S.camY) * 0.12;
  const i = LIFT.y < STOPS[1].top - 8 ? 0 : 1; if (i !== S.stop) { S.stop = i; S.focus = null; if (i === 0) S.station = 'shop'; updateDock(); }
}
setInterval(followTick, 16);

// ---- Monitor de la lógica: lo que se ve frente a lo que pasa ----
const MON = {};
function monReset() { Object.assign(MON, { t0: performance.now(), frames: 0, hitsW: 0, hitsM: 0, strikes: 0, strikeVein: 0, impossible: 0, stemBad: 0, flyBad: 0, rawBad: 0, raw: 0, baseBad: 0, base: 0, drillDone: 0, refDone: 0, deeper: 0, deeperBad: 0, footBad: 0, footMax: 0, walkBad: 0, liftJump: 0, lastFly: V.fly, lastLift: LIFT.y, lastPick: null, revealT: -1e9, deeperT: -1e9, lastDone: -1, lastRef: -1, doneTimes: new Set(), refTimes: new Set(), seen: new WeakSet(), trips0: LIFT.trips, playerBad: 0 }); }
monReset();
on41((e) => {
  if (e.type === 'hit') { if (Z41.veinRevealed) MON.impossible++; if (e.source === 'worker') MON.hitsW++; else MON.hitsM++; }
  if (e.type === 'reveal') MON.revealT = e.t;
  if (e.type === 'drillDone') { MON.drillDone++; MON.lastDone = e.t; MON.doneTimes.add(e.t); }
  if (e.type === 'refineDone') { MON.refDone++; MON.refTimes.add(e.t); }
  if (e.type === 'deeper') { MON.deeper++; if (MON.lastDone !== e.t) MON.deeperBad++; MON.deeperT = e.t; }
});
// Cada fotograma (con Cheddar a la vista): el minero solo golpea en un golpe real y nunca con la veta abierta; la barra baja
// solo con veta; el volante gira solo con un ciclo; cada Raw o Base que viaja nace de un ciclo acabado; los pies del minero
// pisan la roca; nadie sale de su suelo; la jaula no salta.
function monCheck() {
  const now = performance.now(), st = STOPS[1], g = geoC(st); MON.frames++;
  const vis = st.top < S.camY + viewH() && st.top + st.h > S.camY;
  const b = BR.miner;
  if (vis && b && b.pose) { const pk = b.pose.pick; if (pk === 2 && MON.lastPick !== 2) MON.strikes++; if (pk === 2 && Z41.veinRevealed && now - MON.revealT > 200) MON.strikeVein++; MON.lastPick = pk;
    const src = rockSrc(), row = b.py - (g.rb - 40); let sup = 0, bur = 0; for (let c = Math.round(b.px) - g.rx + 7; c <= Math.round(b.px) - g.rx + 14; c++) { const tp = rockTop(src, c); if (tp <= row) sup++; if (tp < row - 2) bur++; } if (sup < 3 || bur > 3) MON.footBad++; }
  if (vis) { if (V.ext > 0.02 && !Z41.veinRevealed && now - MON.deeperT > 760) MON.stemBad++; if (Z41.veinRevealed && V.ext < 0.98 && now - MON.revealT > 760) MON.stemBad++; if (V.fly !== MON.lastFly && !Z41.drillJob) MON.flyBad++; }
  MON.lastFly = V.fly;
  for (const k of V.tokens) if (!MON.seen.has(k)) { MON.seen.add(k); if (k.kind === 'raw') { MON.raw++; if (!MON.doneTimes.has(k.born)) MON.rawBad++; } if (k.kind === 'base') { MON.base++; if (!MON.refTimes.has(k.born)) MON.baseBad++; } }
  for (const [who, bb] of Object.entries(BR)) { const W = g.walk[who]; if (W && (bb.x < W[0] - 0.6 || bb.x > W[1] + 0.6)) MON.walkBad++; }
  if (MON.lastLift != null && LIFT.y != null && Math.abs(LIFT.y - MON.lastLift) > 3) MON.liftJump++; MON.lastLift = LIFT.y;
}
const MONIV = setInterval(() => { if (!window.VTON) monCheck(); }, 16);
// Tiempo: en una pestaña visible, real; en la batería de pruebas con reloj virtual, se avanza fotograma a fotograma.
const wtc = (ms) => (window.VTON ? (stepV(ms), Promise.resolve()) : new Promise((r) => setTimeout(r, ms)));
function stepV(ms) { const n = Math.round(ms / 16); for (let i = 0; i < n; i++) { window.VT += 16; tick(); followTick(); monCheck(); } }

// ---- Medidas ----
H2c('MEDIDAS EN DIRECTO');
const LVc = BOXc();
function liveC() {
  const st = STOPS[1], g = geoC(st), f = camTarget(1, 'rock'), r = g.st.rock[0], mz = g.mine, act = $c('mc-act').getBoundingClientRect(), phone = $c('phone').getBoundingClientRect(), sc = phone.width / PRE.w;
  const avg = FRAMES.length ? FRAMES.reduce((a, b) => a + b, 0) / FRAMES.length : 0, max = FRAMES.length ? Math.max(...FRAMES) : 0;
  LVc.textContent = `${PRE.d} · DPR ${DPRS} · HUD ${$c('mc-top').offsetHeight} px · panel ${$c('mc-bot').offsetHeight} px · escena ${stg.clientHeight} px\n` +
    `Colonia: ${SC.s.toFixed(2)} px CSS por píxel de arte · MINE: ${f.k.toFixed(2)} · roca en MINE ${Math.round(r[2] * f.k)}×${Math.round(r[3] * f.k)} px · zona B ${Math.round(mz[2] * f.k)}×${Math.round(mz[3] * f.k)} px\n` +
    `Botón de acción: ${act.width ? Math.round(act.width / sc) + '×' + Math.round(act.height / sc) + ' px' : '—'}\n` +
    `Cheddar (ejemplo): ${Z41.veinRevealed ? `veta abierta, ${Z41.veinRemaining} Raw en la veta${Z41.drillJob ? ` + ${Z41.drillJob.amount} en el ciclo` : ''}` : `buscando ${Math.round((100 * Z41.discover) / EX.need)} %`} · profundidad ${Z41.depth} · Raw ${Z41.raw} · Base ${Z41.base} · queso ${Z41.lots} · en la tienda ${LIFT.shop}\n` +
    `Monitor desde el último reinicio: golpes del minero ${MON.hitsW}, golpes dibujados ${MON.strikes} · golpes imposibles ${MON.impossible} · barra fuera de regla ${MON.stemBad} · volante sin ciclo ${MON.flyBad} · Raw sin ciclo ${MON.rawBad}/${MON.raw} · pies sin roca ${MON.footBad}\n` +
    `Dibujo por fotograma: media ${avg.toFixed(2)} ms · máx. ${max.toFixed(2)} ms (${FRAMES.length} fotogramas, este ordenador) · partículas ${PT4.length}`;
}
setInterval(liveC, 1000);

// ================= A · AUDITORÍA DE LÓGICA =================
H2c('A · AUDITORÍA DE LÓGICA: LAS REGLAS REALES', 'Leídas en el código del juego (production.js, simulation.js, state.js, balance.js y main.js). Son las que sigue ahora el prototipo; solo cambian las cifras, que son de ejemplo.');
TBc(['ESTADO / ACCIÓN', 'QUÉ HACE EL JUEGO', 'DÓNDE'], [
  ['<b>MINE · buscando</b> (ready)', 'Se puede picar. A mano: combo si el golpe llega antes de 650 ms; crítico cada 5 golpes de combo (x3, +0,5 por rango de Heavy Swing). Mantener no repite: un toque, un golpe.', 'CM.mining.hit · main.js (ON_PRESS)'],
  ['<b>Ayuda al minero</b>', 'Con un minero en esa roca, cada toque hace al menos el 4 % de la búsqueda (12 % el crítico), a cualquier profundidad. Sin minero, la fuerza del pico.', 'hit · B.mining.help'],
  ['<b>Búsqueda necesaria</b>', 'Golpes de la zona × 1,15<sup>profundidad</sup>. A profundidad 0: Cheddar 30, Gouda 150, Brie 400, Emmental 1.000, Parmesan 2.500, Blue 6.000.', 'q.veinHits'],
  ['<b>El minero</b>', 'Un golpe cada 4,5 s ÷ (1 + 10 % por rango de Quick Paws), más deprisa según el ratón. Fuerza: la del pico × lo que rinde el ratón. Solo golpea mientras la roca busca; con la veta a la vista, su contador vuelve a 0.', 'runMiner'],
  ['<b>Veta descubierta</b> (vein-exposed)', 'Al completar la búsqueda la veta se abre con toda su capacidad (Cheddar: 60 × 1,15<sup>prof.</sup>, más Vein Sense) y el combo vuelve a 0. Picar falla. En MAIN, el botón de la roca pasa a ser DRILL (BUILD THE DRILL si no está construida).', 'hit · main.js'],
  ['<b>DRILL</b>', 'Estados: sin construir, bloqueada, en marcha, sin veta y lista. Solo arranca con veta y sin un ciclo en marcha. Al arrancar aparta su Raw de la veta (su rendimiento, sin pasar de lo que queda) y lo entrega al acabar. Un toque con un ciclo en marcha lo acelera 250 ms. Mantener repite cada 160 ms.', 'CM.drilling'],
  ['<b>Agotamiento</b>', 'Si al acabar un ciclo la veta está vacía, se cierra: la búsqueda vuelve a 0 y la roca baja un nivel. La roca nunca se agota.', 'drilling.complete'],
  ['<b>Automático</b>', 'Con un ratón en su puesto, la etapa encadena ciclos sola. Sin ratón, cada ciclo lo arranca un toque. REFINE, CHEESE y SELL siguen la misma regla: gastan al arrancar, entregan al acabar y un toque acelera.', 'runJob'],
  ['<b>Acción imposible</b>', 'No hace nada: sonido de negación, aviso y sacudida.', 'main.js'],
]);
H2c('A · DISCREPANCIAS DE V4 Y CÓMO QUEDAN');
TBc(['', 'EN V4', 'EN EL JUEGO', 'EN V4.1'], [
  ['1', 'Se podía picar con la veta abierta.', 'Picar falla.', 'Con la veta abierta, el botón y la roca hacen DRILL (arrancar o acelerar), como en MAIN. Picar no existe hasta que la veta se cierra.'],
  ['2', 'El minero contratado golpeaba con el dedo del jugador.', 'El golpe a mano es del jugador.', 'El ratón del jugador (el de MAIN, pico dorado) pica desde un andamio junto a la roca. El minero solo golpea en sus golpes reales.'],
  ['3', 'El minero picaba con un ritmo de animación.', 'Golpea cada «intervalo».', 'Levanta el pico cuando su contador va a llegar y lo baja en el golpe real.'],
  ['4', 'El minero seguía picando con la veta abierta.', 'No pica (contador a 0).', 'Deja de picar, se sorprende y mira.'],
  ['5', 'La veta se vaciaba de forma continua.', 'Por ciclos: aparta al arrancar, entrega al acabar.', 'La roca pasa de v5 a v1 ciclo a ciclo, contando lo apartado.'],
  ['6', 'Bajar de nivel iba por tiempo.', 'Solo al acabar el ciclo que vacía la veta.', 'Igual que el juego.'],
  ['7', '12 golpes fijos por veta.', 'Búsqueda por profundidad y ayuda del 4 %.', 'La regla real, con cifras de ejemplo.'],
  ['8', 'La barra bajaba y el volante giraba por tiempo.', 'La perforadora trabaja solo con veta y en sus ciclos.', 'La barra baja solo con la veta abierta; el volante y la broca giran solo durante un ciclo.'],
  ['9', 'El Raw subía sin parar por el elevador.', 'Llega al acabar cada ciclo.', 'Sube el Raw de cada ciclo acabado; sin ciclo, el elevador está quieto.'],
  ['10', 'Refinería y quesería gastaban sin parar.', 'Por ciclos.', 'Fuego, manómetro, vapor y prensa siguen cada ciclo; sin material, esperan.'],
  ['11', 'Gouda (contexto): barra abajo y Raw y Base corriendo con «sin veta, sin Raw».', '—', 'Barra arriba y quieta, sin flujos; solo prensa, porque tiene Base.'],
  ['12', 'El refinador acarreaba Raw a mano.', 'No hay transporte.', 'Quitado.'],
  ['13', 'BUY ALL en la pantalla.', 'Existe (no se toca).', 'Fuera de la pantalla; su lugar es UPGRADES TREE.'],
]);
H2c('A · DEL JUEGO REAL (APARTE, SIN TOCAR NADA)');
ULc([
  '<b>No he encontrado errores</b> en las reglas de MINE y DRILL: los estados, los bloqueos y el agotamiento son coherentes entre sí y con la interfaz.',
  '<b>Tensión de diseño: la ayuda del 4 %.</b> Con un minero en la roca, una veta cuesta 19 toques en combo (25 sin combo) a cualquier profundidad.\n<ul>\n<li>En Cheddar a profundidad 81 la búsqueda es de unos 2,5 M.</li>\n<li>El minero aporta la fuerza del pico por golpe (cientos al final de partida): miles de golpes, decenas de minutos o más por veta.</li>\n<li>Veinte toques hacen ese mismo trabajo.</li>\n</ul>\nEn profundidad, tocar domina al minero; choca con la regla «tocar es un extra».',
  '<b>Sin minero, la búsqueda a mano crece sin ayuda</b>: en Cheddar a profundidad 10 son 121 de búsqueda (unos 90 toques con el pico inicial).',
  '<b>MAIN 2.0 había dejado fuera al ratón del jugador</b>, que en MAIN existe: va a la estación elegida y pica en la roca. Vuelve en V4.1.',
  '<b>El árbol aprobado dice «BUY ALL on the main screen…».</b> Si BUY ALL sale de la pantalla, la frase queda mal. En el prototipo va un texto <b>propuesto</b>, pendiente de aprobación: «This tree only, always the cheapest upgrade first.»',
  '<b>La tira de aspectos del árbol enseña los edificios antiguos</b> (pdrill, prefinery, pcheesery, pshop), no los de MAIN 2.0.',
]);
H2c('A · TOQUES POR FASE (REGLAS REALES)', 'Sin cambiar ninguna cifra. «Con ratón» es con el puesto de esa etapa cubierto.');
TBc(['FASE', 'SIN RATÓN', 'CON RATÓN', 'QUÉ LOS REDUCE'], [
  ['Buscar (MINE)', 'Búsqueda ÷ fuerza del pico. Cheddar a prof. 0 con el pico inicial: 22 toques en combo, 30 sin combo. A prof. 10: unos 90.', '19 en combo, 25 sin combo, a cualquier profundidad (mientras el pico no pase del 4 %). Además, los golpes del minero.', 'Sharper Pick, Blasting Charges, Heavy Swing y el combo; con minero, Quick Paws y el ratón.'],
  ['Perforar (DRILL)', '1 toque por ciclo, más los que aceleran (250 ms cada uno). Mantener encadena ciclos.', '0', 'Bigger Bit y Rich Extraction (menos ciclos por veta); Turbo Motor y Night Shift (ciclos más cortos).'],
  ['REFINE · CHEESE', '1 por ciclo, más acelerar.', '0', 'Lotes y velocidad de cada árbol.'],
  ['SELL', '1 por venta, más acelerar.', '0', 'Bigger Counter y Quick Sales.'],
  ['Mejoras', 'Sin BUY ALL: TREE y BUY EVERYTHING en cada árbol, 2 toques por árbol (10 para los cinco de una roca y la tienda).', 'Los gerentes compran solos lo que cuesta menos del 10 % de las monedas.', '—'],
]);
H2c('A · PROPUESTAS PARA EL PM (NO APLICADAS)');
ULc([
  '<b>Escalar la ayuda del 4 %</b> para que un toque sea un empujón y no el motor (por ejemplo, con un tope en golpes del minero). Depende de <b>Economía V2</b>.',
  '<b>BUY ALL fuera de la pantalla:</b> comprar todo pasa por cada árbol. Opciones: llevar BUY ALL a COLONY o a MENU, o que los gerentes compren más. Depende de <b>Economía V2</b>.',
  '<b>Arranque sin perforador:</b> hoy pide un toque por ciclo. Mantener DRILL ya encadena ciclos a mano; basta con enseñarlo («hold to drill»).',
  '<b>Texto del árbol</b> sin BUY ALL (arriba).',
  '<b>También dependen de Economía V2:</b> cuánto se ve cada estado en el juego (los ritmos reales de búsqueda, ciclos y ventas) y cuántos toques hay al empezar.',
]);

// ================= B · MOVIMIENTO =================
H2c('B · PASADA DE MOVIMIENTO', 'Todo lo que se mueve responde a un estado o a un evento de la simulación. Sin sacudidas de pantalla, sin desenfoques y sin reinicios al elegir.');
TBc(['QUÉ', 'CÓMO SE MUEVE', 'CUÁNDO'], [
  ['Roca', 'Sacudida de 1 px (2 en el crítico) durante 90 ms y destello de 60 ms; trozos con gravedad y rebote, polvo.', 'Golpe a mano. El del minero: sacudida suave, sin destello.'],
  ['Pico del jugador', 'Fotograma de golpe al tocar (sin espera), seguimiento 100 ms y vuelta al reposo. El pico toca la roca en el golpe.', 'Cada golpe; nunca con la veta abierta.'],
  ['Minero', 'Levanta el pico 380 ms antes de su golpe y lo baja en el golpe. Con la veta: anticipación (80 ms), salto, aterrizaje y cara de sorpresa.', 'Su contador real.'],
  ['Barra y broca', 'Baja en 700 ms con curva suave y sube igual; gira y suelta chispas; el Raw sube por la barra con el progreso.', 'Baja con la veta abierta; gira solo en un ciclo.'],
  ['Volante y piloto', 'El volante gira con el ciclo, más rápido 300 ms tras acelerar. Piloto: verde en marcha, ámbar con veta y sin ciclo, rojo intermitente sin veta.', 'Estado de DRILL.'],
  ['Elevador', 'Los cangilones suben solo mientras viaja Raw.', 'Al acabar un ciclo.'],
  ['Horno', 'El fuego crece con el ciclo y con cada atizada; vapor al arrancar; humo mientras trabaja; manómetro = progreso.', 'Ciclo de REFINE.'],
  ['Quesería', 'La prensa baja con la hornada; la paleta remueve solo si la quesera remueve.', 'Ciclo de CHEESE.'],
  ['Montacargas', 'Una sola jaula: carga 0,5 s, sube 3,2 s, descarga 0,7 s y baja 2,6 s, con aceleración y frenada.', 'Cuando hay ruedas en el rellano.'],
  ['Cámara', '320 ms con curva cúbica al elegir; la escala va a pasos nítidos; el panel no cambia de alto.', 'Elegir estación o parada.'],
  ['Bajar un tramo', 'Roca, andamio y minero bajan juntos en 700 ms.', 'Al cambiar de tramo de profundidad.'],
  ['Ratones', 'Pausa de 140 ms entre actividades, media vuelta con 90–120 ms quietos, andar que acelera y frena, parpadeo y respiración desfasados.', 'Siempre.'],
]);

// ================= C · ARTE =================
H2c('C · ARTE: REFINE, CHEESE Y SELL NO SE PARECEN', 'Las tres estaciones tal como salen en el juego, a 3× (la escala de la colonia en un móvil es 2,3×). La identidad está en la silueta y el material, no en el rótulo.');
const ARTC = document.createElement('div'); ARTC.className = 'mc-fl'; COLC.appendChild(ARTC);
function renderStop(i, now) { const st = STOPS[i], c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.translate(0, -st.top); const was = ctx, hs = HITS; ctx = g; HITS = []; try { if (st.kind === 'town') { baked(st, paintTown); drawTown41(st, now); } else drawCheddar(st, now); } finally { ctx = was; HITS = hs; } return c; }
function artCompare() {
  const now = performance.now(), cc = renderStop(1, now), tc = renderStop(0, now), g = geoC(STOPS[1]), gt = geoT(STOPS[0]), k = 3;
  const crops = [
    ['REFINE · industria: ladrillo, hierro, cobre, fuego, vapor y chimenea. Nada de madera ni toldo.', cc, g.focus.refinery, STOPS[1].top],
    ['CHEESE · taller: madera, alero de tablas, rótulo con la cuña, cuba, prensa de husillo, moldes y baldas de curado. Sin toldo.', cc, g.focus.cheesery, STOPS[1].top],
    ['SELL · comercio: toldo a rayas, mostrador con el queso a la vista, pizarra de precios y la moneda. El tendero detrás del mostrador.', tc, [gt.o + 82, gt.GR - 56, 62, 66], 0],
    ['DRILL · se lee el estado: barra (con o sin veta), volante (con o sin ciclo) y piloto de color.', cc, g.focus.drill, STOPS[1].top],
  ];
  ARTC.replaceChildren(...crops.map(([t, src, r, top]) => { const f = document.createElement('figure'), c = document.createElement('canvas'); c.width = r[2] * k; c.height = r[3] * k; c.style.width = Math.round(c.width * 0.8) + 'px'; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(src, r[0], r[1] - top, r[2], r[3], 0, 0, r[2] * k, r[3] * k); const cap = document.createElement('figcaption'); cap.textContent = t; f.append(c, cap); return f; }));
}
TBc(['', 'QUÉ'], [
  ['<span class="ok">Reutilizado</span>', 'Ratones de MICE; ratón del jugador con pico dorado (swing_gold); estados de la roca (big_cheddar c0–c4 y v1–v5); cajas de Raw; iconos; los iconos aprobados de los árboles; el árbol aprobado entero; superficie y Gouda de V3, solo como contexto.'],
  ['<span class="mid">Nuevo en V4.1</span>', 'Puesto de la tienda (toldo, mostrador, pizarra, rótulo con la moneda; monedas al vender); alero de tablas, rótulo con la cuña, mesa, moldes y paleta de la quesería; andamio del jugador; jaula única del montacargas; Raw, Base y rueda como piezas distintas; luces de estado de la perforadora.'],
  ['<span class="no">Pendiente de aprobación</span>', 'Pico del minero y rueda en la pata (piezas aparte, sin tocar el ratón).'],
]);
ULc([
  '<b>Planos:</b> la pared del fondo es el plano más oscuro y frío; las terrazas, el plano medio, más claras y cálidas, con su canto de madera y su entibado; el suelo delantero lleva el camino más claro. La luz viene de los faroles y del horno.',
  '<b>Mi valoración honesta:</b> REFINE, CHEESE y SELL ya se distinguen por silueta y material. El conjunto <b>sigue sin llegar a la calidad de MICE</b>: a las máquinas les falta detalle fino y la pared de la caverna aún es genérica.',
]);

// ================= D · FLUJO =================
H2c('D · FLUJO DE RECURSOS', 'Cada recurso tiene su forma y su color y aparece solo cuando su ciclo acaba. Es la representación de algo que ya ha pasado: nada espera a que llegue.');
const FLC = document.createElement('canvas'); FLC.className = 'mc-sheetart'; COLC.appendChild(FLC);
function flowSheet() {
  const W = 660, H = 130, k = 8, x = FLC.getContext('2d'); FLC.width = W; FLC.height = H; x.imageSmoothingEnabled = false; x.fillStyle = '#2a1d14'; x.fillRect(0, 0, W, H);
  const steps = [['MINE', 'veta abierta'], ['DRILL', 'Raw', rawTok], ['REFINE', 'Base', baseTok], ['CHEESE', 'rueda', wheelTok], ['SELL', 'monedas', coinTok]];
  x.font = '700 13px system-ui, sans-serif'; x.textAlign = 'center';
  steps.forEach(([n, r, tok], i) => { const cx = 66 + i * 132; x.fillStyle = '#f4ead8'; x.fillText(n, cx, 22); if (tok) { const c = document.createElement('canvas'); c.width = 8; c.height = 6; const was = ctx; ctx = c.getContext('2d'); try { tok(4, 3); } finally { ctx = was; } x.drawImage(c, cx - 32, 38, 8 * k, 6 * k); } else x.drawImage(im(ROCKV[4]), cx - 27, 40); x.fillStyle = '#d6d0e6'; x.fillText(r, cx, 118); if (i < 4) { x.fillStyle = '#ffcf2e'; x.fillText('→', cx + 66, 66); } });
}
TBc(['TRAMO', 'QUÉ SE VE', 'CUÁNDO'], [
  ['MINE → DRILL', 'La veta se abre (destellos y acorde) y la barra baja hasta ella.', 'Al completar la búsqueda.'],
  ['DRILL → REFINE', 'Pepita naranja y angulosa: sube por la barra durante el ciclo y por el elevador hasta la tolva del alambique.', 'Al acabar cada ciclo, con lo que entregó.'],
  ['REFINE → CHEESE', 'Bloque crema: sale de los moldes y baja por la canaleta abierta, bajo el pórtico, hasta la cuba.', 'Al acabar cada ciclo de refinado.'],
  ['CHEESE → SELL', 'Rueda amarilla: la quesera la deja en el rellano, la jaula sube y la descarga en el mostrador. Es el momento icónico: el queso terminado llega a la superficie.', 'Al acabar cada hornada.'],
]);
btnsC([['▶ Seguir el queso hasta la tienda', () => { $c('phone').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); followCheese(); }]]);
ULc(['<b>Sin mecánicas de transporte:</b> ni tiempos de entrega ni máquinas que esperen a un ratón. La tienda vende lo que la simulación tiene; la jaula enseña cómo llega.', '<b>Gouda</b> (contexto de V3) ya no enseña flujos que contradicen su estado.']);

// ================= E · UX =================
H2c('E · UX: DE BUY ALL A UPGRADES TREE');
TBc(['DÓNDE', 'QUÉ HAY', 'TOQUES'], [
  ['Estación elegida', 'TREE en el sitio de ⋯ / BUY ALL, con el icono aprobado del árbol de esa estación. Abre ese árbol, el aprobado, sin cambios de diseño.', '1 hasta el árbol; 2 para comprar todo lo de ese árbol.'],
  ['Colonia (ninguna elegida)', 'UPGRADES, en el sitio de BUY ALL, con los iconos de los árboles de esa parada. No adivina: abre una lista para elegir.', '2 hasta el árbol.'],
  ['Superficie', 'SELL (Trading) y LAB. HOUSE y PANTRY no tienen árbol. El de la colonia, en COLONY, abajo.', 'Igual.'],
  ['UP', 'Sigue: compra la mejora más barata de la estación.', '1.'],
  ['Zoom y control', 'Igual que en V4: elegir acerca la cámara; la acción manual es la protagonista (A) o la roca (B).', '—'],
]);

// ================= F · ROCAS =================
H2c('F · PROPUESTA: UNA ROCA POR CAPÍTULO', 'Solo propuesta, a 3×: entera y con la veta abierta. Todas conservan una cresta llana para el minero (línea verde), la cara de la veta donde muerde la broca (punto rojo) y su zona táctil (rectángulo). Misma escala que la de hoy.');
const RKC = document.createElement('canvas'); RKC.className = 'mc-sheetart'; COLC.appendChild(RKC);
function rockSheet() {
  const k = 3, pad = 14, cols = 2, cw = 70 * k, ch = 54 * k, W = cols * 2 * (cw + pad) + pad, rows = Math.ceil(ROCKS6.length / cols), H = rows * (ch + 46) + 10, x = RKC.getContext('2d');
  RKC.width = W; RKC.height = H; x.imageSmoothingEnabled = false; x.fillStyle = '#2a1d14'; x.fillRect(0, 0, W, H); x.font = '700 13px system-ui, sans-serif';
  ROCKS6.forEach((r, i) => {
    const gx = (i % cols) * 2 * (cw + pad) + pad, gy = Math.floor(i / cols) * (ch + 46) + 24;
    x.fillStyle = '#f4ead8'; x.fillText(r.name + (r.real ? ' (la de hoy)' : ''), gx, gy - 8);
    [false, true].forEach((open, j) => {
      const s0 = rockProposal(r, open), c = s0.getContext ? s0 : (() => { const t = document.createElement('canvas'); t.width = r.w; t.height = r.h; t.getContext('2d').drawImage(s0, 0, 0); return t; })(), ox = gx + j * (cw + pad) + Math.round((cw - r.w * k) / 2), oy = gy + ch - r.h * k - 6;
      x.fillStyle = '#3a2a1c'; x.fillRect(gx + j * (cw + pad), gy, cw, ch); x.drawImage(c, ox, oy, r.w * k, r.h * k);
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, top = (col) => { let y = 0; while (y < c.height && d[(y * c.width + col) * 4 + 3] < 128) y++; return y; };
      x.fillStyle = '#62d36e'; for (let col = r.crest[0]; col <= r.crest[1]; col++) x.fillRect(ox + col * k, oy + (top(col) - 1) * k, k, 2);
      if (open) { x.fillStyle = '#ff5a3c'; x.fillRect(ox + (r.w / 2) * k - 4, oy + (r.h - 14) * k - 4, 8, 8); }
      x.strokeStyle = '#ffcf2e'; x.setLineDash([4, 3]); x.strokeRect(ox - 2 * k + 0.5, oy - 4 * k + 0.5, (r.w + 4) * k, (r.h + 4) * k); x.setLineDash([]);
    });
  });
}
TBc(['ROCA', 'SILUETA Y MATERIAL', 'LO QUE LA DISTINGUE'], ROCKS6.map((r) => [r.name, `${r.w} × ${r.h}`, r.note]));
ULc(['<b>Compatibles con lo de hoy:</b> mismo tamaño aproximado (50–60 × 34–46), cresta llana de al menos 18 px para el minero, la broca entra por el centro y la zona táctil cubre la roca con margen. Los estados (grietas c0–c4, veta v5–v1) se dibujarían igual sobre cada material.', '<b>Pendiente:</b> decidir si cada roca es un PNG dibujado a mano (recomendado, a la altura de MICE) o sale del constructor.']);

// ================= G · QA =================
H2c('G · QA', 'Pruebas sintéticas en este navegador (eventos de puntero simulados y, en la batería, reloj virtual): confirman la lógica y la geometría, <b>no sustituyen a Chrome Android ni a Safari iOS</b>, que siguen pendientes.');
const QPc = BOXc();
btnsC([['▶ QA de lógica (75 s simulados)', async () => { QPc.textContent = '…'; const o = await qaLogic(); QPc.textContent = o.join('\n'); }], ['▶ QA de interacción', async () => { QPc.textContent = '…'; const o = await qaUI(); QPc.textContent = o.join('\n'); }], ['▶ Prueba de vida · 30 s', async () => { QPc.textContent = '…'; const o = await lifeTest(); QPc.textContent = o.join('\n'); }]]);
const okL = (out) => (c, t) => out.push((c ? '✔ ' : '✘ ') + t);
async function qaLogic(ms = 75000) {
  const out = [], ok = okL(out); $c('mc-sheet').hidden = true; closeTree(); force('normal'); simReset(); V.tokens.length = 0; goStop(1); await wtc(400); exitFocus(); await wtc(400); monReset();
  const d0 = Z41.depth; await wtc(ms);
  ok(MON.impossible === 0, `ningún golpe con la veta abierta (${MON.hitsW} del minero en ${ms / 1000} s)`);
  ok(Math.abs(MON.strikes - MON.hitsW) <= 1, `cada golpe dibujado del minero es un golpe real (${MON.strikes} dibujados / ${MON.hitsW} reales)`);
  ok(MON.strikeVein === 0, 'el minero no golpea con la veta abierta');
  ok(MON.stemBad === 0, 'la barra baja solo con la veta abierta y sube al cerrarse');
  ok(MON.flyBad === 0, 'el volante gira solo durante un ciclo');
  ok(MON.rawBad === 0 && MON.raw > 0, `todo el Raw que viaja nace de un ciclo acabado (${MON.raw} pepitas, ${MON.drillDone} ciclos)`);
  ok(MON.baseBad === 0 && MON.base > 0, `toda la Base que viaja nace de un refinado acabado (${MON.base} bloques)`);
  ok(MON.deeper >= 1 && MON.deeperBad === 0 && Z41.depth === d0 + MON.deeper, `bajar de nivel solo con el último ciclo de la veta (${MON.deeper} veces)`);
  ok(MON.footBad === 0, `los pies del minero pisan la roca en todos los fotogramas (${MON.frames})`);
  ok(MON.walkBad === 0, 'ningún ratón sale de su suelo');
  ok(MON.liftJump === 0 && LIFT.trips > MON.trips0, `el montacargas no salta (${LIFT.trips - MON.trips0} viajes)`);
  // Cambia la geometría (otra densidad): los ratones siguen en su suelo y el minero sobre la roca.
  const d0p = DPRS; DPRS = d0p === 3 ? 2 : 3; relayoutC(); MON.walkBad = 0; MON.footBad = 0; MON.lastLift = null; await wtc(1500); const wb = MON.walkBad, fb = MON.footBad; DPRS = d0p; relayoutC(); MON.lastLift = null; await wtc(600);
  ok(wb === 0 && fb === 0 && MON.walkBad === 0, 'al cambiar la geometría de la pantalla, cada ratón sigue en su suelo y el minero sobre la roca');
  // Sin minero: no aparece, y el golpe a mano es solo la fuerza del pico.
  force('nominer'); simReset(); await wtc(200); for (let i = 0; i < 5; i++) { act('qa', 'rock'); await wtc(100); }
  ok(!BR.miner && Math.abs(Z41.discover - (4 * EX.pick + EX.pick * RULE.critMult)) < 1e-6, `sin minero: no se dibuja y 5 toques en combo hacen ${Z41.discover} (pico ${EX.pick}, crítico x${RULE.critMult})`);
  force('normal'); simReset(); await wtc(200); for (let i = 0; i < 5; i++) { act('qa', 'rock'); await wtc(100); }
  ok(Math.abs(Z41.discover - (4 * RULE.help + RULE.helpCrit) * EX.need) < 0.5 || Z41.discover > 4 * RULE.help * EX.need, `con minero: cada toque hace al menos el 4 % (5 toques en combo ≥ ${((4 * RULE.help + RULE.helpCrit) * EX.need).toFixed(1)}; hecho ${Z41.discover.toFixed(1)})`);
  // Sin perforador: con veta, la perforadora espera; un toque arranca un ciclo y no encadena.
  force('nodriller'); simReset(); legalReveal(); await wtc(800); ok(!Z41.drillJob && SIM41.drillStatus() === 'ready', 'sin perforador: con la veta abierta, la perforadora espera');
  goStop(1); focusOn('rock'); await wtc(400); ok($c('mc-act-b').textContent === 'DRILL', 'con la veta abierta, el botón de la roca dice DRILL');
  const h0 = MON.hitsM; act('qa', 'rock'); ok(!!Z41.drillJob && MON.hitsM === h0, 'tocar la roca con la veta abierta arranca la perforadora y no pica');
  await wtc(EX.drillMs + 300); ok(!Z41.drillJob, 'sin perforador, al acabar el ciclo no arranca otro');
  // Bloqueos.
  force('normal'); simReset(); await wtc(200); focusOn('drill'); await wtc(400); const r = act('qa', 'drill'); ok(!r.ok && r.reason === 'no-vein' && $c('mc-act').classList.contains('dis'), 'DRILL sin veta: bloqueado, con el motivo (No vein yet) y sonido de negación');
  force('noraw'); await wtc(EX.refMs + 200); focusOn('refinery'); await wtc(400); const r2 = act('qa', 'refinery'); ok(!r2.ok && r2.reason === 'no-raw', 'REFINE sin Raw: bloqueado');
  force('nobase'); Z41.cookJob = null; await wtc(100); focusOn('cheesery'); await wtc(400); const r3 = act('qa', 'cheesery'); ok(!r3.ok && r3.reason === 'no-base', 'CHEESE sin Base: bloqueado');
  force('normal'); paintForce(); exitFocus(); await wtc(300);
  out.unshift(`${PRE.d} · DPR ${DPRS}`); window.QA_LOGIC = out; return out;
}
function ptrC(type, ax, ay, id = 7) { const r = stg.getBoundingClientRect(), k = r.width / stg.clientWidth; const x = r.left + (ax - S.camX) * S.k * k, y = r.top + (ay - S.camY) * S.k * k; stg.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: true })); }
async function tapC(ax, ay, hold = 0) { ptrC('pointerdown', ax, ay); await wtc(hold || 40); ptrC('pointerup', ax, ay); await wtc(60); }
async function dragFrom(ax, ay, dy) { ptrC('pointerdown', ax, ay); for (let i = 1; i <= 6; i++) { ptrC('pointermove', ax, ay + (dy * i) / 6 / S.k); await wtc(16); } ptrC('pointerup', ax, ay + dy / S.k); await wtc(420); }
const rectOf = (id) => $c(id).getBoundingClientRect();
const overlap = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
const cssR = (r) => { const sr = stg.getBoundingClientRect(), k = sr.width / stg.clientWidth; return { left: sr.left + (r[0] - S.camX) * S.k * k, top: sr.top + (r[1] - S.camY) * S.k * k, right: sr.left + (r[0] + r[2] - S.camX) * S.k * k, bottom: sr.top + (r[1] + r[3] - S.camY) * S.k * k }; };
const inStage = (rr) => { const s = stg.getBoundingClientRect(), n = rectOf('mc-nav'); return rr.left >= s.left - 1 && rr.right <= s.right + 1 && rr.top >= n.bottom - 1 && rr.bottom <= s.bottom + 1; };
const pressB = async (el, ms = 25) => { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9 })); await wtc(ms); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 9 })); await wtc(25); };
const treeHead = () => document.querySelector('#tr-ov .shead .ttl b').textContent;
// Textos del panel cortados (con puntos suspensivos) en cualquier estado: ninguno debería.
const cutTexts = () => [...document.querySelectorAll('.mc-ui .mc-it b, .mc-ui .mc-it span, .mc-ui .mc-act b, .mc-ui .mc-act small, .mc-ui .mc-tile b, .mc-ui .mc-tile small, .mc-ui .mc-tree small, .mc-ui .mc-up')].filter((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map((e) => e.id || e.textContent);
async function cutCheck() { const bad = new Set(); let n = 0; for (const alt of ['A', 'B']) { ALT = alt; for (const fs of Object.keys(FORCES)) { force(fs); simReset(); for (const vein of [false, true]) { if (vein) legalReveal(); goStop(1); exitFocus(); await wtc(40); n++; cutTexts().forEach((c) => bad.add(c)); for (const k of ['rock', 'drill', 'refinery', 'cheesery']) { focusOn(k); await wtc(30); updateDock(); n++; cutTexts().forEach((c) => bad.add(`${k}:${c}`)); } } } } ALT = 'A'; force('normal'); goStop(0); await wtc(40); n++; cutTexts().forEach((c) => bad.add(c)); focusOn('shop'); await wtc(30); n++; cutTexts().forEach((c) => bad.add(`shop:${c}`)); exitFocus(); return [n, [...bad]]; }
async function qaUI() {
  const out = [], ok = okL(out), botH = $c('mc-bot').offsetHeight, sc = rectOf('phone').width / PRE.w;
  $c('mc-sheet').hidden = true; closeTree(); force('normal'); simReset(); goStop(1); await wtc(400); exitFocus(); await wtc(400);
  const tiles = [...$c('mc-strip').children];
  ok(!S.focus && tiles.length === 5 && tiles[4].classList.contains('trees'), 'colonia: una casilla por estación y UPGRADES (en el sitio de BUY ALL)');
  ok(!/BUY ALL/.test(document.querySelector('.mc-ui').textContent), 'BUY ALL no aparece en la pantalla');
  // UPGRADES en la colonia: elige entre los árboles de la parada; nunca abre uno por su cuenta.
  tiles[4].click(); await wtc(60); const opts = [...document.querySelectorAll('#mc-sheet .mc-trees button')].map((b) => b.querySelector('b').textContent);
  ok($c('tr-ov').hidden && opts.join(',') === 'MINING,DRILLING,REFINING,CHEESEMAKING', `UPGRADES en Cheddar: lista ${opts.join(', ')} y no abre ninguno solo`);
  document.querySelectorAll('#mc-sheet .mc-trees button')[1].click(); await wtc(60); ok(!$c('tr-ov').hidden && treeHead() === 'DRILL', 'elegir DRILLING abre el árbol de DRILL'); closeTree();
  // TREE en cada estación: su árbol.
  for (const [k, h] of [['rock', 'MINE'], ['drill', 'DRILL'], ['refinery', 'REFINE'], ['cheesery', 'CHEESE']]) { focusOn(k); await wtc(380); $c('mc-tree').click(); await wtc(40); ok(!$c('tr-ov').hidden && treeHead() === h, `${STN[k].n}: TREE abre ${h}`); closeTree(); }
  ok($c('mc-bot').offsetHeight === botH, `el panel no cambia de alto entre modos (${botH} px)`);
  const sizes = ['mc-back', 'mc-act', 'mc-upg', 'mc-tree'].map((id) => { const r = rectOf(id); return [id.slice(3), Math.round(r.width / sc), Math.round(r.height / sc)]; });
  ok(sizes.every(([, w, h]) => w >= 36 && h >= 56), 'panel de estación: ' + sizes.map(([n, w, h]) => `${n} ${w}×${h}`).join(' · '));
  goStop(0); await wtc(400); [...$c('mc-strip').children][4].click(); await wtc(60); const t2 = [...document.querySelectorAll('#mc-sheet .mc-trees button')].map((b) => b.querySelector('b').textContent);
  ok(t2.join(',') === 'TRADING,LAB', `superficie: UPGRADES lista ${t2.join(', ')}`); $c('mc-sheet').hidden = true;
  focusOn('shop'); await wtc(380); $c('mc-tree').click(); await wtc(40); ok(treeHead() === 'SELL', 'SELL: TREE abre el árbol de la tienda'); closeTree(); exitFocus(); await wtc(300);
  [...document.querySelectorAll('.mc-glob button')].find((b) => b.textContent === 'COLONY').click(); await wtc(40); ok(treeHead() === 'COLONY', 'COLONY (abajo) abre el árbol de la colonia'); closeTree();
  // MINE · A: 20 toques rápidos; la cámara quieta; nunca un golpe con la veta abierta.
  goStop(1); await wtc(400); focusOn('rock'); await wtc(420); ALT = 'A'; updateDock(); await wtc(40); simReset(); monReset(); let a0 = S.acts, cam = [S.camX, S.camY, S.k], f0 = LOG.filter((l) => l.startsWith('fail')).length;
  for (let i = 0; i < 20; i++) await pressB(actB);
  ok(S.acts - a0 === 20 && LOG.filter((l) => l.startsWith('fail')).length === f0, `A: 20 toques rápidos = 20 acciones válidas (${MON.hitsM} golpes${Z41.veinRevealed ? ' y, con la veta abierta, DRILL' : ''})`);
  ok(MON.impossible === 0, 'A: ningún golpe con la veta abierta'); ok(Math.abs(S.camY - cam[1]) < 0.5 && S.k === cam[2], 'A: la cámara no se mueve');
  const ab = rectOf('mc-act'); ok(ab.width / sc >= 96 && ab.height / sc >= 56, `A: botón protagonista de ${Math.round(ab.width / sc)}×${Math.round(ab.height / sc)} px`);
  simReset(); await wtc(700); a0 = S.acts; const g = geoC(STOPS[1]), rr = g.st.rock[0]; await tapC(rr[0] + rr[2] / 2, rr[1] + rr[3] / 2); ok(S.acts === a0 + 1, 'A: tocar la roca también pica');
  // B: la roca es el control.
  await wtc(700); ALT = 'B'; updateDock(); simReset(); monReset(); a0 = S.acts; cam = [S.camX, S.camY, S.k];
  for (let i = 0; i < 20; i++) { const jx = (i % 3) - 1, jy = (i % 2) * 2; ptrC('pointerdown', rr[0] + rr[2] / 2 + jx * 3, rr[1] + 10 + jy, 20 + (i % 2)); await wtc(25); ptrC('pointerup', rr[0] + rr[2] / 2 + jx * 3, rr[1] + 10 + jy, 20 + (i % 2)); await wtc(25); }
  ok(S.acts - a0 === 20 && MON.impossible === 0, `B: 20 toques rápidos a la roca (dos dedos, con temblor) = ${S.acts - a0} acciones válidas`); ok(Math.abs(S.camY - cam[1]) < 0.5, 'B: la cámara no se mueve');
  await wtc(700); await dragFrom(rr[0] + rr[2] / 2, rr[1] + 12, -90); ok(S.stop === 1 && Math.abs(S.camY - cam[1]) < 0.5, 'B: un arrastre que empieza en la roca no mueve la cámara');
  ALT = 'A'; updateDock();
  // Con la veta abierta: la acción es DRILL; mantener repite.
  force('nodriller'); simReset(); legalReveal(); await wtc(100); updateDock(); ok($c('mc-act-b').textContent === 'DRILL', 'veta abierta: el botón de MINE pasa a DRILL'); monReset();
  a0 = S.acts; actB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 8 })); await new Promise((r) => setTimeout(r, 2300)); actB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 8 }));
  ok(S.acts - a0 >= 2 && MON.hitsM === 0, `mantener DRILL repite (${S.acts - a0} acciones en 2,3 s de tiempo real) y nunca pica`);
  force('normal'); paintForce();
  // Otras estaciones, ratones y navegación.
  $c('mc-back').click(); await wtc(400); ok(!S.focus, '◂ vuelve a la colonia');
  let m = HITS.find((h) => h.k === 'm' && h.who === 'player'); ok(!!m, 'el ratón del jugador tiene su zona táctil'); if (m) { await tapC(m.x + 11, m.y + 10); ok(S.focus === 'rock', 'tocar al ratón del jugador elige MINE'); exitFocus(); await wtc(400); }
  m = HITS.find((h) => h.k === 'm' && h.who === 'refiner'); if (m) { await tapC(m.x + 11, m.y + 10); ok(S.focus === 'refinery', 'tocar al refinador elige la refinería'); exitFocus(); await wtc(400); }
  m = HITS.find((h) => h.k === 'm' && h.who === 'cook'); if (m) { await tapC(m.x + 11, m.y + 10, 520); ok(!$c('mc-sheet').hidden && /Tilly/.test($c('mc-sheet-t').textContent), 'mantener a la quesera abre su ficha'); $c('mc-sheet').hidden = true; }
  await dragFrom(S.camX + viewW() / 2, S.camY + viewH() / 2, -90); ok(STOPS[S.stop].id === 'gouda', 'deslizar en la colonia: Gouda'); $c('mc-up').click(); await wtc(400); ok(STOPS[S.stop].id === 'cheddar', '▲: Cheddar');
  for (const k of ['rock', 'drill', 'refinery', 'cheesery']) { focusOn(k); await wtc(400); const r = cssR(geoC(STOPS[1]).st[k][0]); ok(!overlap(r, rectOf('mc-nav')) && inStage(r), `${STN[k].n}: la estación se ve entera y el selector no la tapa (escala ${S.k.toFixed(2)})`); }
  exitFocus(); await wtc(400);
  const [nc, bad] = await cutCheck(); ok(!bad.length, `ningún texto del panel cortado (${nc} combinaciones: A/B, cinco estados, con y sin veta, cada estación)${bad.length ? ': ' + bad.join(', ') : ''}`);
  goStop(1); await wtc(300);
  const avg = FRAMES.reduce((a, b) => a + b, 0) / FRAMES.length; out.push(`· dibujo: media ${avg.toFixed(2)} ms, máx. ${Math.max(...FRAMES).toFixed(2)} ms por fotograma (este ordenador)`);
  out.unshift(`${PRE.d} · DPR ${DPRS}`); window.QA_UI = out; return out;
}
let LIFEON = null; on41((e) => LIFEON && LIFEON(e));
// Prueba de vida: 30 s sin tocar, desde un estado fijo (veta casi vacía): acaba la veta, baja, el minero vuelve a buscar.
async function lifeTest(ms = 30000) {
  $c('mc-sheet').hidden = true; closeTree(); force('normal'); simReset({ veinRevealed: true, discover: EX.need, veinRemaining: 8 }); goStop(1); await wtc(300); exitFocus(); await wtc(300); monReset();
  const marks = Object.fromEntries(Object.entries(BR).map(([k, b]) => [k, b.log.length])), seen = new Set(), evs = {}; LIFEON = (e) => (evs[e.type] = (evs[e.type] || 0) + 1);
  for (let t = 0; t < ms; t += 200) { await wtc(200); if (performance.now() < BUB.until) seen.add(BUB.text); }
  const out = [], starts = [];
  for (const [who, b] of Object.entries(BR)) { const L = b.log.slice(marks[who] || 0), cnt = {}; for (const [n, t] of L) { cnt[n] = (cnt[n] || 0) + 1; starts.push([who, n, t]); } out.push(`${b.m.name.padEnd(7)} ${Object.keys(cnt).length} cosas distintas · ${Object.entries(cnt).map(([k, v]) => `${k} ×${v}`).join(', ')}`); }
  let sync = 0; starts.sort((a, b) => a[2] - b[2]); for (let i = 1; i < starts.length; i++) if (starts[i][2] - starts[i - 1][2] < 120 && starts[i][1] === starts[i - 1][1] && starts[i][0] !== starts[i - 1][0]) sync++;
  LIFEON = null;
  out.push(`A la vez (misma acción, mismo instante, ratones distintos): ${sync}`);
  out.push(`Fuera de su suelo: ${MON.walkBad} · pies del minero sin roca: ${MON.footBad} · golpes dibujados ${MON.strikes} / reales ${MON.hitsW}`);
  out.push(`Bocadillos: ${seen.size ? [...seen].join(' · ') : 'ninguno'}`);
  out.push(`Eventos: ${Object.entries(evs).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  window.LIFE = out; return out;
}

H2c('EVALUACIÓN CRÍTICA');
ULc([
  '<b>Lógica:</b> MINE y DRILL ya no contradicen al juego. Lo que se ve sale de la regla real: no hay golpes con la veta abierta, la perforadora trabaja solo con veta y por ciclos, y la roca baja con el último ciclo.',
  '<b>Ratones:</b> pisan siempre algo (la roca, el andamio, las terrazas) y sus golpes son los del juego. La repetición seguirá notándose con horas de juego mientras solo haya las poses aprobadas.',
  '<b>Arte:</b> REFINE, CHEESE y SELL se distinguen por silueta y material. El conjunto aún no llega a MICE.',
  '<b>UX:</b> BUY ALL sale de la pantalla y TREE es contextual. Comprar todo es más lento que antes; es la decisión que queda para Economía V2.',
]);
H2c('RIESGOS QUE QUEDAN');
ULc([
  '<b>Sin probar en móviles reales</b> (Chrome Android, Safari iOS): tacto, latencia, sonido y rendimiento sin medir allí.',
  '<b>Las cifras son de ejemplo:</b> en el juego, los ritmos reales decidirán cuánto se ve cada estado (en profundidad, la búsqueda del minero dura mucho más que en el prototipo).',
  '<b>Piezas pendientes</b> (pico del minero, rueda en la pata) y el texto propuesto del árbol necesitan aprobación.',
  '<b>B (tocar la roca)</b> bloquea el arrastre que empieza en ella; hay que probar en la mano que no frustra.',
]);
addEventListener('load', () => { artCompare(); flowSheet(); rockSheet(); });
relayoutC();

</script>
