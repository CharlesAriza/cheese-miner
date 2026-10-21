// ---------- BLOQUE 2 · CHEDDAR · la página ----------
const MK = 7;
const ST1 = STOPS[1];
// Un lienzo con el ctx global del motor (las piezas de V4.1 pintan con R()).
const viaCtx2 = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const was = ctx; ctx = g; try { f(g); } finally { ctx = was; } return c; };
const chapterBG = () => art('chBG', () => viaCtx2(Math.ceil(SC.worldW), ST1.h, (g) => { g.setTransform(1, 0, 0, 1, 0, -ST1.top); paintCheddar(ST1); }));
const drillLayer = (stage) => art('drL' + stage, () => { const s0 = B2.drill.stage, b0 = B2.drill.boost; B2.drill.stage = stage; B2.drill.boost = 0; const c = viaCtx2(62, 70, (g) => drillModules(g, 0, 0, 0, false, 0)); B2.drill.stage = s0; B2.drill.boost = b0; return c; });
const gemPNG = (on) => art('gem' + on, () => { const b = PB(11, 9); gemSocket(b, 0, 0, on); return b.canvas(); });
// ---- Lista de exportación (PNG 1:1, ancla arriba a la izquierda en las coordenadas del capítulo que se indican) ----
const EXPORT2 = [
  { file: 'chapter_bg.png', cv: chapterBG, src: 'paintCheddar()', marker: 'fondo del capítulo', note: `Caverna, terrazas, entibado, escaleras, corta, elevador y pozo del montacargas. ${Math.ceil(SC.worldW)} × ${ST1.h}, con SC.ox = 17.`, state: 'adaptado' },
  ...[1, 2, 3].map((s) => ({ file: `refine_${s}.png`, cv: () => refineB(s, 0, true), src: `refineB(${s})`, marker: 'scene.js · Refinery', note: 'REFINE B aprobada. Origen del lienzo en (o − 20, TL − 42). Fuego, manómetro, barras, goteo y vapor: drawRefineB.', state: 'congelado' })),
  { file: 'cheese_base.png', cv: cheeseBase, src: 'cheeseBase()', marker: 'scene.js · Cheesery', note: 'Taller de V4.1 en un sprite, con el contorno completado. Origen en (o + 96, TR − 39).', state: 'adaptado' },
  ...[2, 3].map((s) => ({ file: `cheese_${s}.png`, cv: () => cheeseStatic(s, 0, true), src: `cheeseStatic(${s})`, marker: 'scene.js · Cheesery', note: `Fase ${s === 2 ? 'II' : 'III'} completa (sustituye a cheese_base).`, state: 'nuevo' })),
  ...[0, 1].map((f) => ({ file: `cheese_paddle_f${f}.png`, cv: () => artPaddle(f), src: `artPaddle(${f})`, marker: 'scene.js · Cheesery', note: 'En (+13, +21) del taller.', state: 'congelado' })),
  ...[0, 1].map((f) => ({ file: `cheese_press_f${f}.png`, cv: () => artPress(f), src: `artPress(${f})`, marker: 'scene.js · Cheesery', note: 'En (+22, +23) del taller.', state: 'congelado' })),
  { file: 'drill_gantry.png', cv: () => artGantry(52), src: 'artGantry(52)', marker: 'scene.js · Cheese Drill', note: 'En (o + 48, DK).', state: 'congelado' },
  { file: 'drill_body.png', cv: artDrill, src: 'artDrill()', marker: 'scene.js · Cheese Drill', note: 'En (o + 58, DK − 29); vibra 1 px en marcha.', state: 'congelado' },
  ...[0, 1, 2].map((f) => ({ file: `drill_wheel_f${f}.png`, cv: () => artWheel(f), src: `artWheel(${f})`, marker: 'scene.js · Cheese Drill', note: 'Volante (y polea del elevador). En (o + 66, DK − 44).', state: 'congelado' })),
  { file: 'drill_panel.png', cv: artPanel, src: 'artPanel()', marker: 'scene.js · Cheese Drill', note: 'En (o + 98, DK − 12).', state: 'congelado' },
  ...[0, 1].map((f) => ({ file: `drill_bit_f${f}.png`, cv: () => artBit(f), src: `artBit(${f})`, marker: 'scene.js · Cheese Drill', note: 'Broca al final de la barra.', state: 'congelado' })),
  ...[2, 3].map((s) => ({ file: `drill_stage${s}.png`, cv: () => drillLayer(s), src: `drillModules (fase ${s})`, marker: 'scene.js · Cheese Drill', note: `Capa de la fase ${s === 2 ? 'II' : 'III'} encima de la perforadora; origen en (o + 48, DK − 44). La luz del piloto es VFX.`, state: 'nuevo' })),
  { file: 'boost_gem_on.png', cv: () => gemPNG(true), src: 'gemSocket(on)', marker: 'icons.js · gema de refuerzo', note: 'La gema del panel BOOSTS en su engaste. Destello: gemGlint.', state: 'congelado' },
  { file: 'boost_gem_off.png', cv: () => gemPNG(false), src: 'gemSocket(off)', marker: 'icons.js · gema de refuerzo', note: 'Puesto sin ratón: no hace nada.', state: 'congelado' },
];
window.B2_EXPORT = EXPORT2;

PP(`<b>Bloque 2 de producción.</b> El capítulo de Cheddar en marcha, con la simulación espejo de V4.1 y sus ratones, y las máquinas aprobadas en su sitio. Lo nuevo: las fases II y III de DRILL y CHEESE, los refuerzos que faltaban (MINE, CHEESE y SELL), dos arreglos de composición y ${EXPORT2.length} PNG con su manifiesto para integrar.`);

// ================= EL CAPÍTULO =================
H2('C', 'EL CAPÍTULO EN MARCHA', 'A tamaño real de móvil. Los selectores cambian la fase y el refuerzo de cada puesto.');
const ctl = DIV('b1-ctl');
const sel = (label, obj, key, opts) => { const l = document.createElement('label'); l.innerHTML = `<span>${label}</span>`; const s = document.createElement('select'); for (const [v, n] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = n; if (v === obj[key]) o.selected = true; s.appendChild(o); } s.onchange = () => { obj[key] = s.value === 'true' ? true : s.value === 'false' ? false : +s.value; }; l.appendChild(s); ctl.appendChild(l); };
const ST3 = [[1, 'I'], [2, 'II'], [3, 'III']], BO = [[0, 'sin refuerzo'], [1, '+1'], [2, '+2']];
sel('REFINE', B2.ref, 'stage', ST3); sel('', B2.ref, 'boost', BO);
sel('DRILL', B2.drill, 'stage', ST3); sel('', B2.drill, 'boost', BO);
sel('CHEESE', B2.cheese, 'stage', ST3); sel('', B2.cheese, 'boost', BO);
sel('MINE', B2.mine, 'boost', BO);
const scroller = DIV('b1-scroll'); const sc = document.createElement('canvas'), CW = Math.ceil(SC.worldW); sc.width = CW * MK; sc.height = ST1.h * MK; sc.style.width = Math.round(CW * KPX) + 'px'; sc.style.height = Math.round(ST1.h * KPX) + 'px'; scroller.appendChild(sc);
const off = document.createElement('canvas'); // las partículas (trozos, polvo, humo, chispas) se pintan en este mismo lienzo
for (let i = 0; i < 300; i++) step41(16);
setInterval(() => { step41(33); const now = performance.now(); renderStopTo(1, now, off); { const og = off.getContext('2d'), was = ctx; og.setTransform(1, 0, 0, 1, 0, -ST1.top); ctx = og; try { drawParticles(now, 33); } finally { ctx = was; } } const g = sc.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(off, 0, 0); }, 33);
UL([
  '<b>Composición de V4.1, sin tocar:</b> terraza alta con la refinería y su horno; en medio, la perforadora sobre su pórtico y la corta con la roca; a la derecha, la quesería en su cueva y el pozo del montacargas. Los ratones trabajan con sus poses aprobadas. El jugador (un ratón oficial) pica desde el andamio y el minero contratado sobre la roca, los dos con el pico aprobado de la revisión de arte (recortado de swing_player, 5 fotogramas) por delante del ratón; el pico de V4.1 y el trabajador genérico quedan fuera.',
  '<b>Arreglo 1 · el horno entero:</b> en V4.1 la refinería quedaba cortada por el borde izquierdo (el horno empezaba en x = −6). El capítulo se desplaza 9 px: el horno entra entero y el pozo del montacargas sigue dentro de la pantalla.',
  '<b>Arreglo 2 · el refuerzo de REFINE:</b> la columna de extracción de la refinería suelta caía justo encima del elevador de cangilones y se confundía con él. En el capítulo, el propio serpentín hace de columna: una mirilla de vidrio por la que sube la Base, un segundo caño sobre el molde y las gemas. Misma idea aprobada (más Base del mismo Raw, más barras por ciclo), sin chocar con nada.',
]);

// ================= FASES =================
H2('F', 'FASES DE LAS MÁQUINAS', 'Siguen los aspectos que ya tiene el juego (visualTier de cada habilidad): niveles 0–1 → I, 2–3 → II, 4–5 → III.');
function machineSheet() {
  const k = 3, [c, g] = SHEET(1180, 3 * 230 + 20); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, c.width, c.height); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  ['I', 'II', 'III'].forEach((n, i) => {
    const x0 = 10 + i * 390;
    g.fillText(`REFINE ${n}`, x0, 18); g.drawImage(refineB(i + 1, 0, true), x0, 26, 72 * k, 56 * k);
    g.fillText(`DRILL ${n}`, x0, 250); g.drawImage(viaCtx2(62, 72, (gg) => { drillV41(gg, 0, 0, 0, { run: false }); B2.drill.stage = i + 1; drillModules(gg, 0, 0, 0, false, 0); B2.drill.stage = 1; }), x0, 258, 62 * k, 72 * k);
    g.fillText(`CHEESE ${n}`, x0, 480); g.drawImage(cheeseStatic(i + 1, 0, true), x0, 488, CHZ_W * k, CHZ_H * k);
  });
}
machineSheet();
TB(['MÁQUINA', 'I (0–1)', 'II (2–3)', 'III (4–5)', 'ESTADO'], [
  ['<b>REFINE</b>', 'V4.1 con su contorno completado', 'Aros de hierro en el horno y caperuza en la chimenea', 'Además, fuelle de cuero y cúpula de presión de latón', '<span class="ad-k keep">Aprobado</span>'],
  ['<b>DRILL</b>', 'V4.1 tal cual (aprobada)', 'Planchas de acero remachadas a los lados y un piloto ámbar que se enciende en marcha', 'Además, aro de latón alrededor del volante y un manómetro de latón en el cuadro', '<span class="ad-k adapt">Nuevo: II y III</span>'],
  ['<b>CHEESE</b>', 'Taller de V4.1 con su contorno completado', 'Quesos curados en la balda y una balda corta con dos ruedas sobre la prensa', 'Además, aros de latón en la cuba, placa dorada en el rótulo y un farol colgado del alero', '<span class="ad-k adapt">Nuevo: II y III</span>'],
]);
UL(['<b>Cada fase añade piezas encima de la anterior</b>, sin mover nada: una máquina evolucionada conserva todo lo de antes, y el refuerzo se ancla igual en cualquier fase.', '<b>CHEESE:</b> en V4.1 sus piezas llenaban su lienzo hasta el borde y perdían el contorno (como la refinería). Se compone en un solo sprite y se completa la tinta que faltaba; nada de dentro cambia.']);

// ================= REFUERZOS =================
H2('B', 'REFUERZOS (BOOST)', 'Cada puesto lo expresa a su manera; la gema del panel BOOSTS es lo único común. Sin ratón en el puesto, la gema se apaga y no pasa nada.');
TB(['PUESTO', 'QUÉ DA EN EL JUEGO', 'CÓMO SE VE', 'ESTADO'], [
  ['<b>MINE</b>', '×1,5 de velocidad del minero', 'Reacción de la excavación: cada golpe del minero suelta el doble de trozos (el triple con dos refuerzos); la gema va en el andamio.', '<span class="ad-k adapt">Nuevo</span>'],
  ['<b>DRILL</b>', '×1,5 de velocidad', 'Potencia mecánica: bobina de cobre en la barra, estela de acero en el volante, escape doble y trozos grandes en la broca.', '<span class="ad-k keep">Aprobado</span>'],
  ['<b>REFINE</b>', '×1,5 de Base del mismo Raw', 'Rendimiento: mirilla de Base en el serpentín, segundo caño y más barras en el mismo ciclo. Adaptado al capítulo (ver arriba).', '<span class="ad-k keep">Aprobado, adaptado</span>'],
  ['<b>CHEESE</b>', '×1,5 de velocidad', 'Fabricación reforzada: segundo husillo de latón en la prensa, la paleta remueve más deprisa y cada bajada de la prensa suelta un golpe de vapor.', '<span class="ad-k adapt">Nuevo</span>'],
  ['<b>SELL</b>', '×1,5 de velocidad de venta', 'Actividad comercial: guirnalda de farolillos bajo el toldo, la gema en el poste y monedas que saltan del mostrador más a menudo.', '<span class="ad-k adapt">Nuevo</span>'],
]);
{ const R = DIV('ev-cards'); const shopCard = (title, t, boost, on, cap) => { const f = document.createElement('figure'); f.className = 'ev-card'; const c = document.createElement('canvas'); c.width = 80 * MK; c.height = 64 * MK; c.style.width = Math.round(80 * 3) + 'px'; c.style.maxWidth = '100%'; c.style.height = 'auto'; f.innerHTML = `<div class="ev-ct"><b>${title}</b></div>`; f.appendChild(c); const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.appendChild(fc); R.appendChild(f); setInterval(() => { const now = performance.now(), g = c.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#7a9a8e'; g.fillRect(0, 0, 80, 64); g.fillStyle = '#5a9038'; g.fillRect(0, 60, 80, 4); const sx = 3, sy = 3; g.drawImage(shopBack(t), sx, sy); shopFlag(g, sx + 4, sy + 1, t, now); g.drawImage(mF(CREW.town.keeper, Math.floor(now / 650) % 2, false, {}), sx + 19, sy + 28); g.drawImage(shopFront(t), sx, sy); shopLots(g, sx, sy, 3); if (t >= 3) vfxGlow(g, sx + 55, sy + 28, 8, now); shopBoost(g, sx, sy, t, boost, on, now); }, 33); };
  shopCard('SELL', 3, 0, true, 'Aspecto 3, sin refuerzo.'); shopCard('SELL · BOOST', 3, 1, true, 'Farolillos, gema y monedas.'); shopCard('SELL · BOOST ×2', 3, 2, true, 'Dos gemas; monedas el doble de a menudo.'); shopCard('SELL · sin tendero', 3, 1, false, 'Gema apagada, farolillos apagados.'); }

// ================= VFX =================
H2('V', 'VFX SIN CONTORNO', 'Revisados los del capítulo y hechos los nuevos con la misma regla.');
UL([
  '<b>Los de V4.1 ya cumplían:</b> trozos de roca, polvo, humo de la chimenea, chispas de la broca, destellos de la veta, fuego y resplandor del horno. Ninguno lleva tinta.',
  '<b>Nuevos, sin contorno:</b> el piloto ámbar de la perforadora, el farol de la quesería, el golpe de vapor de la prensa, los farolillos y las monedas de la tienda reforzada.',
  '<b>Anotado para revisar más adelante:</b> las fases de las máquinas se notan poco; se retoman después de la integración.',
  '<b>Anotado para QA:</b> las fichas de recurso que viajan (Raw, Base, rueda) llevan contorno porque son iconos de recurso, no efectos; si se quiere, se aclaran en el bloque 5 con el resto de sistemas compartidos.',
]);

// ================= ENTREGA =================
H2('E', 'ENTREGA PARA INTEGRAR', 'En exploracion/pixel/out/main2/cheddar, con su manifest.json.');
TB(['ARCHIVO', 'TAMAÑO', 'SALE DE', 'SUSTITUYE A', 'NOTA'], EXPORT2.map((e) => { const cv = e.cv(); return [`<code>${e.file}</code>`, `${cv.width} × ${cv.height}`, `<code>${e.src}</code>`, e.marker, e.note]; }));
UL([
  '<b>La roca</b> ya estaba entregada y aprobada: <code>out/sprites/big_cheddar_c0–c4</code> (grietas) y <code>v1–v5</code> (veta).',
  '<b>Lo que va como código:</b> lo que se anima o depende del estado (fuego, manómetro, barras de Base, barra de la perforadora con su longitud, refuerzos, VFX y ratones), en <code>main2-src/b2/b2_cheddar.js</code> y <code>ev2/ev2_refine.js</code>.',
  '<b>Pendiente del bloque 5:</b> el recorrido del montacargas de Cheddar a la superficie (el castillete está a la derecha del pueblo y el pozo de Cheddar a la derecha del capítulo; hay que casarlos al integrar).',
]);
H2('→', 'SIGUIENTE', 'Bloque 3 · Gouda: el mismo capítulo con los materiales de Gouda y su roca (faltan los estados c1–c4 y la veta).');
