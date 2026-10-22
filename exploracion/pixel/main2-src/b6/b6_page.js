// ---------- BLOQUE 6 · QA Y ENTREGA · la página ----------
const OK = (t) => `<span class="b6-ok">${t}</span>`, FIX = (t) => `<span class="b6-fix">${t}</span>`, NO = (t) => `<span class="b6-no">${t}</span>`;
const SIM = (t, real) => `<span class="b6-sim${real ? ' real' : ''}">${t}</span>`;
const FIG = (src, cap, cls = '', el = COL) => { const f = document.createElement('figure'); f.className = 'b6-fig ' + cls; f.innerHTML = `<img src="${src}" alt=""><figcaption>${cap}</figcaption>`; el.appendChild(f); return f; };
const ZONES = ['superficie', 'cheddar', 'gouda', 'brie', 'compartido'];
const NPNG = ZONES.reduce((n, z) => n + PACK6[z].files.length, 0);

// ================= RESULTADO =================
H2('R', 'RESULTADO');
const vd = DIV('b6-verdict');
vd.innerHTML = `<b>Sin bloqueos de arte.</b> El paquete del MVP (superficie, Cheddar, Gouda y Brie) queda cerrado: <b>${NPNG} PNG</b> a 1:1 con su manifiesto, todos regenerables píxel a píxel desde las fuentes y todos con un destino en el juego. El QA encontró dos fallos reales y los dos están resueltos: la fórmula de escala de V4.1 cortaba el horno en los móviles habituales (se resuelve con una regla de integración, sin tocar el arte) y, a escala 2, la placa roja STOPPED se quedaba sin texto (corregido en la colocación de avisos). Las pruebas en móviles de verdad siguen pendientes: van en el primer QA del juego integrado.`;
TB(['PRUEBA', 'CÓMO', 'RESULTADO', 'TIPO'], [
  ['Regeneración', 'Páginas b1–b5 reconstruidas desde <code>main2-src</code>; cada PNG se vuelve a dibujar con su función y se compara píxel a píxel con el archivo entregado.', OK(`${NPNG} / ${NPNG} idénticos`) + ' · manifiestos sin huecos ni sobrantes · ninguna semitransparencia', SIM('automática')],
  ['VFX sin contorno', 'Cada efecto dibujado a solas en 400 instantes sobre un lienzo vacío, contando píxeles oscuros; más lectura del código de partículas y refuerzos.', OK('0 píxeles de tinta') + ' (los únicos oscuros eran restos de opacidad 1/255, invisibles)', SIM('automática')],
  ['Encuadre en móvil', 'La escena montada con la geometría real de V4.1 a 320, 360 y 375 px, DPR 2 y 3.', FIX('Horno cortado 6–14 px') + ' con la fórmula actual → ' + OK('entero en los seis casos') + ' con ancho seguro 158', SIM('simulada')],
  ['Avisos en móvil', 'La capa de avisos real a la escala de cada móvil: 4 escenarios × 4 casos y 360 combinaciones al azar.', OK('0 solapes') + ' · STOPPED con texto ' + FIX('66 %') + ' → ' + OK('100 %') + ' · avisos visibles ' + FIX('70–74 %') + ' → ' + OK('91–95 %'), SIM('simulada')],
  ['Legibilidad', 'Tamaño de letra de placas y bocadillos; escala de arte por caso.', OK('8 px CSS mínimo') + ' (16–24 px físicos) · arte a 2,0–2,33 px CSS por píxel', SIM('simulada')],
  ['Rendimiento', 'Tiempo de dibujar un fotograma de cada escena (120 fotogramas).', OK('0,18–0,84 ms') + ' en el Mac; con margen aunque un móvil vaya 10 veces más lento', SIM('simulada')],
  ['Móviles reales', 'Chrome en Android y Safari en iOS.', NO('Sin hacer'), SIM('real', true)],
]);

// ================= REGENERACIÓN =================
H2('G', 'REGENERACIÓN', 'Cada página se reconstruye con su <code>build.py</code> (las cinco salieron idénticas a las de git antes de los cambios de este bloque). Cada pieza de la lista de exportación de su página se vuelve a dibujar y se compara píxel a píxel con el PNG entregado en <code>out/main2</code>. También se comprueba que cada manifiesto lista todos sus archivos, con su tamaño real y su destino.');
TB(['CARPETA', 'PNG', 'SALEN DE', 'PÍXELES DISTINTOS'], ZONES.map((z) => [`<code>out/main2/${z}</code>`, PACK6[z].files.length, `<code>main2-${{ superficie: 'b1', cheddar: 'b2', gouda: 'b3', brie: 'b4', compartido: 'b5' }[z]}.html</code>`, OK('0')]));
PP('<b>Cómo repetirlo:</b> abrir la página del bloque desde un servidor local (por ejemplo <code>python3 -m http.server</code> en la raíz del repositorio) y comparar en la consola cada entrada de <code>window.B1_EXPORT</code> … <code>B5_EXPORT</code> con su archivo. No hay ningún paso a mano: las funciones de la lista son las mismas que dibujan la escena.');

// ================= VFX =================
H2('V', 'VFX', 'Regla del proyecto: partículas, humo, chispas, destellos, impactos y efectos de refuerzo van sin contorno negro, con sus propios colores, opacidad y luz. Edificios, ratones, máquinas, piezas de interfaz y objetos (fichas de recurso, gemas, el pico) conservan su contorno de 1 px.');
TB(['EFECTO', 'DÓNDE', 'CÓMO SE PINTA', 'CONTORNO'], [
  ['<code>vfxImpact</code>', 'Cada golpe de pico', 'Destello crema (60 ms) y aro de polvo que se abre y se apaga', OK('No')],
  ['Trozos de roca (<code>chip</code>)', 'Golpes en la roca; el doble con refuerzo MINE', 'Cuadros de 2 px en los colores de la roca (oro con veta)', OK('No')],
  ['Polvo y humo (<code>dust</code>, <code>smoke</code>)', 'Roca, horno, perforadora', 'Discos con opacidad decreciente', OK('No')],
  ['Chispas (<code>spark</code>) y brillos (<code>glint</code>)', 'Broca, veta', '1–3 px amarillo → naranja', OK('No')],
  ['<code>gemGlint</code>', 'Gemas de refuerzo encendidas', 'Cruz blanca cada 2,3 s', OK('No')],
  ['<code>vfxSmoke</code>', 'Chimeneas de la superficie', 'Bolas lila claro con opacidad', OK('No')],
  ['<code>vfxGlow</code>', 'Farolas, farolillos de la tienda, piloto de la perforadora, farol de la quesería', 'Halo de tres anillos con opacidad', OK('No')],
  ['<code>vfxBubbles</code>', 'Matraz del laboratorio', 'Burbujas verdes de 1 px', OK('No')],
  ['<code>vfxZzz</code>', 'Cama', 'Z azul claro con sombra de color (no tinta)', OK('No')],
  ['Vapor', 'Refinería y prensa con refuerzo', 'Nubes claras con opacidad', OK('No')],
  ['Refuerzo DRILL', 'Volante y barra', 'Órbita de chispas blancas y grises, humo, destellos cian en la bobina', OK('No')],
  ['Refuerzo SELL', 'Tienda', 'Monedas que saltan, en oro', OK('No')],
]);
PP('Llevan contorno a propósito, porque son objetos y no efectos: la mirilla de vidrio de la refinería reforzada, la bobina de cobre, el manómetro, las gemas y sus engastes, las fichas de recurso y el pico. La página de referencia de la cama (bloque ev4) conserva su Z antigua; la superficie entregada ya usa <code>vfxZzz</code>.');

// ================= MÓVIL =================
H2('M', 'MÓVIL', `Todo lo de esta sección es ${SIM('simulado')}: el navegador del escritorio con el ancho y la densidad de cada móvil y la geometría real de V4.1. No sustituye a probar en un teléfono.`);
H3('Encuadre: la regla de escala');
PP('V4.1 elige la escala como <code>d = floor(ancho × DPR / 144)</code>, con 144 px de arte de capítulo. Pero el horno de la refinería empieza 14 px a la izquierda del origen del capítulo: el capítulo necesita <b>158 px de arte</b> de ancho seguro. En la maqueta no se notaba porque está montada con <code>SC.ox = 17</code> fijo. Con la fórmula actual, en los móviles habituales el horno sale cortado.');
const cases6 = [[320, 2], [320, 3], [360, 2], [360, 3], [375, 2], [375, 3]].map(([W, dpr]) => { const f = (cw, pad) => { const d = Math.max(1, Math.floor((W * dpr) / cw)), s = d / dpr, LW = W / s, ox = Math.max(0, Math.floor((LW - cw) / 2)) + pad; return { s, LW, ox }; }; return { W, dpr, a: f(144, 0), b: f(158, 14) }; });
TB(['ANCHO', 'DPR', 'ACTUAL: PX CSS POR PÍXEL', 'ACTUAL: HORNO', 'CON 158: PX CSS POR PÍXEL', 'CON 158: HORNO'], cases6.map((c) => [`${c.W} px`, c.dpr, c.a.s.toFixed(2), c.a.ox - 14 < 0 ? NO(`cortado ${14 - c.a.ox} px`) : OK('entero'), c.b.s.toFixed(2), c.b.ox - 14 < 0 ? NO('cortado') : OK('entero')]));
PP('<b>Regla para la integración:</b> <code>d = floor(ancho × DPR / 158)</code> y <code>ox = floor((LW − 158) / 2) + 14</code>. A 320 px y a 375 px con DPR 3 no cambia nada; a 360 px y a 375 px con DPR 2 la escena pasa de 2,5 a 2,0 px CSS por píxel de arte (un ratón mide 32 px CSS de alto en vez de 40). No es un cambio de arte: los sprites y sus anclas son los mismos.');
const pr = DIV('b6-pair'); FIG(QA6.qa_crop_actual, 'Fórmula actual (144): el horno sale cortado en los seis casos.', '', pr); FIG(QA6.qa_crop_cw158, 'Con ancho seguro de 158: el capítulo entero en los seis casos.', '', pr);
H3('Avisos y bocadillos a escala de móvil');
PP('La capa de avisos real (<code>labelLayer</code>, de <code>b5_ui.js</code>) a la escala de cada móvil, con los escenarios de la demostración del bloque 5. Al probarla apareció un fallo: <b>a escala 2 la placa roja STOPPED se quedaba en placa pequeña</b> (solo el icono) aunque fuera el único aviso. La causa era que cada placa reservaba la caja entera hasta su punto de anclaje, cadena incluida, y esa caja rozaba la cabeza del perforador. Ahora se reservan la chapa y la cadena por separado. Además, cada pieza prefiere no tapar el punto de otro aviso. El contador de solapes cuenta ahora también las cadenas. Las reglas no cambian: ningún solape, nada encima de un ratón y la roja primero.');
TB(['CASO', 'AVISOS DE MÁQUINA (2 ámbar + roja)', 'CONFLICTOS (6 avisos + 2 bocadillos)', 'HABLA', 'SIN SITIO (roja + bocadillo largo)', 'SOLAPES'], [
  ['320 px · ×2', 'roja y NO BASE con texto, NO RAW pequeña', '3 con texto, 1 pequeña, 2 sin sitio, 1 bocadillo', 'bocadillo', 'roja con texto; el bocadillo cede', OK('0')],
  ['360 px · ×2', 'igual', 'igual', 'bocadillo', 'igual', OK('0')],
  ['375 px · ×2', 'igual', 'igual', 'bocadillo', 'igual', OK('0')],
  ['375 px · ×2,33', 'las tres con texto', '3 con texto, 1 pequeña, 2 sin sitio, 1 bocadillo', 'bocadillo', 'roja con texto; el bocadillo cede', OK('0')],
]);
TB(['360 COMBINACIONES AL AZAR', 'ANTES', 'AHORA'], [['Placas rojas con texto', FIX('66 %') + ' (104/157)', OK('100 %') + ' (157/157)'], ['Avisos visibles (con texto o pequeños)', FIX('70–74 %'), OK('91–95 %')], ['Solapes (ahora con cadenas)', '0 (sin contar cadenas)', OK('0')]]);
FIG(QA6.avisos_320, '320 px, escala 2: STOPPED en rojo con texto, NO BASE con texto, NO RAW como placa pequeña sobre la refinería y el bocadillo del minero. Nada pisa a un ratón.', 'b6-phone');
const live = DIV('b6-live'), lb = document.createElement('button'), lo = document.createElement('output'); lb.type = 'button'; lb.textContent = 'REPETIR LA PRUEBA AL AZAR'; live.append(lb, lo);
lb.onclick = () => { lo.textContent = 'Probando…'; setTimeout(() => { lo.innerHTML = stress6().map((r) => `${r.k}: rojas con texto ${r.red}, visibles ${r.vis}, solapes ${r.ov}`).join(' · '); }, 30); };
H3('Lo demás');
UL([
  '<b>Letra:</b> placas y bocadillos en Press Start 2P a 8 px CSS como mínimo (16 px físicos con DPR 2, 24 con DPR 3), sin ninguna pieza fuera de pantalla en los cuatro casos.',
  '<b>Escala:</b> el arte siempre a un número entero de píxeles físicos por píxel de arte (<code>d</code> entero); en CSS, 2,0 o 2,33 px.',
  '<b>Animaciones:</b> mismos fotogramas y tiempos que las aprobadas; dependen del reloj y no del número de fotogramas, así que no se aceleran ni se frenan en un móvil lento.',
  '<b>Superficie:</b> 432 px de arte de ancho, más que la pantalla por diseño; a escala 2 se ven entre 160 y 188 px a la vez y se desplaza en horizontal.',
  `<b>Pendiente ${SIM('real', true)}:</b> Chrome en Android y Safari en iOS (barras del navegador, densidad real, toques). Va en el primer QA del juego integrado.`,
]);

// ================= INVENTARIO =================
H2('I', 'INVENTARIO', `${NPNG} PNG a 1:1, todos con destino. <span class="b6-st nuevo">NUEVO</span> no existía en el MAIN antiguo; <span class="b6-st adaptado">ADAPTADO</span> sale de una pieza aprobada con un cambio; <span class="b6-st congelado">CONGELADO</span> es una pieza aprobada tal cual.`);
for (const z of ZONES) {
  const m = PACK6[z]; H3(`${z.toUpperCase()} · ${m.files.length} PNG`);
  const g = DIV('b6-inv');
  for (const f of m.files) { const c = document.createElement('div'); c.className = 'b6-card'; const k = Math.max(1, Math.min(4, Math.floor(70 / Math.max(f.h, f.w / 2)))); c.innerHTML = `<div class="b6-thumb"><img src="${f.uri}" alt="" style="width:${f.w * k}px;height:${f.h * k}px"></div><code>${f.file}</code><small>${f.w} × ${f.h} · ${f.replaces || f.for}</small><span class="b6-st ${f.state}">${f.state.toUpperCase()}</span>`; g.appendChild(c); }
}
H3('Lo que se entrega como código');
PP('Siguiendo la regla del proyecto («arte por código, sustituible»), las animaciones de varios estados y los efectos van como funciones, no como hojas de PNG. Se integran tal cual, cada una detrás de su marca <code>SPRITE:</code>.');
TB(['FUENTE', 'QUÉ', 'DESTINO'], [
  ['<code>b1/b1_surface.js</code>', 'Composición de la superficie y la cueva; <code>vfxSmoke</code>, <code>vfxGlow</code>, <code>vfxBubbles</code>, <code>vfxZzz</code>', 'scene.js · fondo, edificios, partículas'],
  ['<code>b2/b2_cheddar.js</code>', '<code>swingFrame</code> y <code>vfxImpact</code> (el golpe); refuerzos por máquina (<code>refineSceneBoost</code>, <code>drillModules</code>, <code>drillBarBoost</code>, <code>mineBoost</code>, <code>cheeseB2</code>, <code>shopBoost</code>); <code>approvedPickGold</code>', 'scene.js · drawPlayer, drawStaff, drawDrill, drawRefinery, drawCheesery, drawShop'],
  ['<code>ev2/ev2_refine.js</code>', 'REFINE B aprobada: fuego, barras, goteo y vapor (<code>drawRefineB</code>)', 'scene.js · drawRefinery'],
  ['<code>b3/b3_gouda.js</code>, <code>b4/b4_brie.js</code>', 'Paletas de roca, cueva y quesos de Gouda y Brie (<code>GOUDA_ROCK</code>, <code>BRIE_STONE</code>, <code>BRIE_RIND</code>…)', 'scene.js · drawRock y fondo por zona'],
  ['<code>ev3/ev3_sleep.js</code>, <code>ev4/ev4_bedanim.js</code>', 'Ratón acurrucado y secuencia completa de la cama con su orden de capas (<code>checkBedLoop</code> = 0)', 'icons.js · cama; drawHouse (pendiente del PM)'],
  ['<code>b5/b5_shared.js</code>', 'Montacargas: guion <code>LIFT_T</code>, <code>liftAt</code>, <code>drawLift5</code>', 'nuevo · columna de MAIN 2.0'],
  ['<code>b5/b5_ui.js</code>, <code>b5/b5.css</code>', 'Colocación de avisos (<code>labelLayer</code>), icono de parada, placas y bocadillos', 'main.js · bocadillos de estación; style.css'],
  ['Del juego, sin cambios', 'Ratones (<code>look</code>, gorros), iconos de recurso por zona (<code>ic_raw/base/lot_&lt;zona&gt;</code>)', 'scene.js, icons.js'],
]);

// ================= MAPA DE INTEGRACIÓN =================
H2('A', 'MAPA DE INTEGRACIÓN', 'Qué se conecta con cada componente del juego real y qué estado lo decide. Nada de esto cambia la economía, la simulación ni el guardado: el arte solo lee el estado.');
TB(['COMPONENTE (scene.js)', 'ESTADO REAL QUE LO DECIDE', 'SPRITES', 'ANIMACIÓN Y VFX'], [
  ['<code>drawShop</code>', '<code>q.visualTier(state, \'trading\')</code> 0–5; tendero <code>CM.mice.at(state, \'trading\', \'all\')</code>; refuerzos <code>CM.boosts.at(state, \'trading\', \'all\')</code>', '<code>shop_back_t0–5</code> detrás del tendero y <code>shop_front_t0–5</code> delante; <code>shop_lot</code> por lote a la venta', '<code>shopBoost</code>: farolillos, gema y monedas (solo con tendero)'],
  ['<code>drawStorage</code>', 'Qué hay en la despensa', '<code>pantry</code>; <code>crate_raw</code>, <code>crate_base</code>, <code>crate_cheese</code> según haya Raw, Base o queso', '—'],
  ['<code>drawHouse</code>', 'Fase I–III por contadores permanentes (<code>s.totals.miceRecruited</code>, <code>s.album</code>); umbrales del PM; por defecto, fase I', '<code>house_1–3</code> (la I, 22 px a la derecha del origen de la III)', '<code>vfxSmoke</code> en la chimenea; cama: <code>bed</code>, <code>pillow</code> y secuencia (PM)'],
  ['<code>drawLab</code>', 'Fase I–IV por las mejoras del árbol del laboratorio (por confirmar con el PM)', '<code>lab_1–4</code>', '<code>vfxBubbles</code> mientras <code>state.lab.job</code>'],
  ['<code>drawBackground</code> (superficie)', '—', '<code>surface_bg</code> 432 × 164, árboles, arbustos, valla, banco, farola, cartel', '<code>vfxGlow</code> en la farola'],
  ['Montacargas (nuevo)', 'Queso cocinado en cada roca (eventos del juego)', '<code>headframe</code>, <code>pulley_f0–2</code>, <code>cage_back</code> / <code>cage_front</code>', 'Guion <code>LIFT_T</code>; la polea gira mientras la jaula se mueve. Solo visual: no transporta nada de verdad'],
  ['Fondo de cada roca', 'Zona que se mira (Cheddar, Gouda, Brie)', '<code>chapter_bg</code> de su carpeta (161 × 160, o = 17)', '—'],
  ['<code>drawRock</code>', 'Zona y profundidad (la roca ya se genera por píxel en el juego)', 'La del juego, con las paletas de Gouda y Brie', 'Trozos y <code>vfxImpact</code> en cada golpe; refuerzo MINE: más trozos y gema'],
  ['<code>drawPlayer</code>', 'Toque del jugador; pico de oro con <code>q.visualTier(state, \'mining\') ≥ 3</code>', 'Ratón del juego + <code>pick_f0–4</code> o <code>pick_gold_f0–4</code> en (+0, +4)', '<code>swingFrame</code>: 3 golpe (0–70 ms), 4 acompaña (70–190), 1 recupera (190–300), 0 reposo'],
  ['<code>drawStaff</code> (minero)', '<code>CM.mice.at(state, \'mining\', zona)</code>', 'Ratón contratado + <code>pick_f0–4</code>', 'Igual, con preparación (fotograma 2) antes del golpe automático'],
  ['<code>drawDrill</code>', '<code>q.visualTier(state, \'drilling\')</code>: 0–1 → I, 2–3 → II, 4–5 → III; <code>CM.drilling.status</code>', '<code>drill_gantry</code>, <code>drill_body</code>, <code>drill_wheel_f0–2</code>, <code>drill_panel</code>, <code>drill_bit_f0–1</code>; <code>drill_stage2/3</code> encima', 'En marcha: volante y broca giran, vibra 1 px, chispas; refuerzo: bobina y órbita'],
  ['<code>drawRefinery</code>', '<code>q.visualTier(state, \'refining\')</code> → I/II/III; <code>CM.refining.status</code>; refuerzos → <code>CM.boosts.baseMult</code>', '<code>refine_1–3</code>', 'Fuego, barras, goteo y vapor; refuerzo: mirilla y segundo caño (más Base, no más velocidad)'],
  ['<code>drawCheesery</code>', '<code>q.visualTier(state, \'cheesemaking\')</code> → I/II/III; <code>CM.cheesery.status</code>; <code>z.cookJob</code>', '<code>cheese_base</code> / <code>cheese_2</code> / <code>cheese_3</code> (Gouda y Brie, los suyos); <code>cheese_paddle_f0–1</code>; <code>cheese_press_f0–1</code>', 'Pala al remover, prensa al cocinar; farol en III; refuerzo: husillo, gema y vapor'],
  ['Refuerzos (todas las máquinas)', '<code>CM.boosts.at(state, oficio, zona)</code> 0, 1 o 2; encendida solo con ratón en el puesto', '<code>boost_gem_on</code> / <code>boost_gem_off</code>', '<code>gemGlint</code> cada 2,3 s'],
  ['Avisos de estación (<code>main.js</code>)', '<code>stationInfo()</code>: <code>blocked</code> → placa roja; <code>waiting</code> con ratón → placa ámbar; texto de <code>BUBBLE[reason]</code> (NO RAW, NO BASE, NO CHEESE, NO RECIPE) o STOPPED', '<code>badge_stop</code> (roja), icono del recurso de la zona (ámbar); CSS <code>.ad-warn</code>, <code>.lb-red</code>', '<code>labelLayer</code>: roja > bocadillo > ámbar, 3 con texto como mucho, el resto en placa pequeña, sin solapes'],
  ['Bocadillos de ratones', 'Contenido pendiente del PM; por defecto, ninguno', 'CSS <code>.ad-bub</code> + punta', 'Siguen la cabeza; ceden ante la placa roja'],
  ['Aviso de roca (<code>main.js</code>, <code>style.css</code>)', 'La roca necesita algo (ámbar) o está parada (rojo)', '<code>badge_alert</code> / <code>badge_alertr</code> (13 × 12) en lugar de los planos', '—'],
  ['Objetivo cumplido', 'Franja de objetivo sin pendientes', '<code>badge_done</code> (9 × 9: el hueco de <code>style.css</code> pasa de 9 × 7 a 9 × 9)', '—'],
]);
H3('Reglas de la integración');
UL([
  '<b>Escala:</b> <code>d = floor(ancho × DPR / 158)</code> y <code>ox = floor((LW − 158) / 2) + 14</code>, para que el horno nunca se corte (ver MÓVIL).',
  '<b>Anclas:</b> cada PNG a 1:1, en las coordenadas que da su manifiesto (<code>o = SC.ox</code>; la superficie, abajo a la izquierda sobre el suelo).',
  '<b>Reversible:</b> cada sprite entra detrás de su marca <code>SPRITE:</code> y el dibujo antiguo se conserva detrás de una bandera hasta validar en móviles reales.',
  '<b>Claridad:</b> solo se mueve lo que el jugador puede explicar. Sin ratón en un puesto, la gema va apagada y la máquina no anima.',
  '<b>Sin tocar la economía:</b> el arte solo lee el estado. El montacargas es decorado: el queso sigue llegando a la tienda como hoy.',
  '<b>Al publicar:</b> cambiar el <code>?v=</code> de los enlaces de <code>index.html</code>.',
]);

// ================= CAMBIOS =================
H2('C', 'CAMBIOS DE ESTE BLOQUE');
UL([
  '<b>Colocación de avisos</b> (<code>b5_ui.js</code>): chapa y cadena se reservan por separado; cada pieza prefiere no tapar el punto de otro aviso; el contador de solapes cuenta también las cadenas. Las reglas de prioridad y de no pisar ratones son las mismas.',
  '<b>Pico aprobado exportado:</b> <code>pick_f0–4</code>, sin las chispas pintadas, con su posición y su tiempo en el manifiesto.',
  '<b>Pico de oro</b> (el juego lo usa con Mining en visualTier 3 o más): <code>pick_gold_f0–4</code>, el mismo pico píxel a píxel con los tonos del oro de <code>swing_gold</code>; selector PICO DE ORO en la página de Cheddar.',
  '<b>Iconos de aviso en Pulido+</b> (tras la revisión del propietario): <code>alert</code>, <code>alertr</code> y <code>done</code> eran los planos del juego. Ahora llevan contorno, luz, sombra y el signo con su sombra, de la familia del icono de parada. <code>done</code> pasa a chapa redonda de 9 × 9 y <code>alertr</code> entra en el paquete.',
  '<b>Manifiesto:</b> <code>badge_stop</code> figuraba como «ya aprobado en el juego» y es nuevo; corregido.',
  '<b>Gancho de QA</b> en la demostración del bloque 5 (<code>window.QA5</code>) para repetir estas pruebas desde la consola.',
]);

// ================= PENDIENTES =================
H2('P', 'PENDIENTES');
TB(['TIPO', 'QUÉ', 'MIENTRAS TANTO'], [
  [NO('Bloqueante'), 'Ninguno.', '—'],
  ['Condición de la integración', 'Aplicar la regla de escala de 158 px.', 'Es parte del trabajo de integrar; el arte no cambia.'],
  ['Condición de la integración', 'Probar en móviles reales: Chrome en Android y Safari en iOS.', 'Primer QA del juego integrado.'],
  ['Decisión del PM', 'THE BED: un ratón en la cama sigue trabajando en su puesto, así que no puede dibujarse dormido y trabajando a la vez.', 'La cama sin ratón (como hoy).'],
  ['Decisión del PM', 'Umbrales de fase de la casa y el laboratorio.', 'Casa en fase I; laboratorio según sus mejoras.'],
  ['Decisión del PM', 'Qué dicen los ratones en los bocadillos y cuándo.', 'Sin bocadillos; el sistema está listo.'],
]);
H3('Lista final de QA (no bloquea)');
UL([
  'Las fases de las máquinas se distinguen poco (el propietario pidió revisarlo después de integrar).',
  'En la columna de la maqueta del bloque 5, la cabeza del montacargas sale recortada 9 px; en el juego la columna se monta de nuevo.',
  'La página de referencia de la cama (ev4) conserva la Z antigua con contorno; la superficie entregada usa <code>vfxZzz</code>.',
  'En <code>b5_shared.js</code> quedan funciones de bocadillo y placa 9-slice sin uso (de la propuesta rechazada).',
  'El hueco FORBIDDEN GENETICS del laboratorio está vacío (fuera del MVP).',
  'Las demostraciones corren sobre la simulación espejo de Cheddar, y el montacargas sobre un guion fijo.',
  'Las rocas 4–6 (Emmental, Parmesan, Blue) conservan su arte actual hasta su capítulo.',
]);

// ---- La prueba al azar, en vivo (misma geometría que la demostración del bloque 5) ----
const G6 = geoC(STOPS[1]), T6 = STOPS[1].top, DW6 = Math.ceil(SC.worldW), DH6 = STOPS[1].h;
const head6 = (who) => () => { const b = BR[who]; return b && b.px != null ? [b.px + 11, b.py - 18 - T6] : null; };
const ANCH6 = { refinery: [G6.o + 12, G6.TL - 30 - T6], drill: [G6.o + 100, G6.DK - 13 - T6], cheesery: [G6.o + 116, G6.TR - 36 - T6], rock: [G6.rx + 46, G6.rb - 30 - T6] };
const mice6 = () => { const out = []; for (const w of Object.keys(BR)) { const b = BR[w]; if (b && b.px != null) out.push([w, b.px, b.py - 20 - T6, 22, 20]); } const p = PLAYER(G6); out.push(['player', p.x, p.feet - 19 - T6, 32, 20]); return out; };
function stress6() {
  const warm = document.createElement('canvas'); for (let i = 0; i < 3; i++) renderStopTo(1, performance.now() + i * 16, warm);
  const ic = gameIcon('alert').toDataURL(), A = ANCH6, W8 = [['ref', 'amber', 'NO RAW', A.refinery], ['drl', 'red', 'STOPPED', A.drill], ['chz', 'amber', 'NO BASE', A.cheesery], ['rock', 'amber', 'PICK ME', A.rock], ['chzR', 'red', 'STOPPED', [A.cheesery[0] - 4, A.cheesery[1]]], ['refR', 'red', 'STOPPED', [A.refinery[0] + 2, A.refinery[1]]]];
  const SAY = [['miner', 'Found a vein!'], ['refiner', 'Fire needs Raw.'], ['driller', "Drill's warm."], ['cook', 'One more batch, then tea.']];
  let seed = Math.floor(Math.random() * 1e6) + 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return [[320, 2], [375, 2], [375, 7 / 3]].map(([W, k]) => {
    let ov = 0, redT = 0, red = 0, vis = 0, all = 0;
    for (let n = 0; n < 120; n++) {
      const h = document.createElement('div'); h.className = 'lb-host b6-host'; h.style.width = W + 'px'; h.style.height = Math.round(DH6 * k) + 'px'; h.style.overflow = 'hidden'; document.body.appendChild(h);
      const L = labelLayer(h, { k, view: () => [0, 0, W, DH6 * k], mice: mice6 }); W8.filter(() => rnd() < 0.45).forEach(([id, tone, text, anchor]) => L.warn(id, { tone, icon: ic, text, anchor }));
      if (rnd() < 0.6) { const s = SAY[Math.floor(rnd() * 4)]; L.say(s[0], s[1], head6(s[0])); }
      const b0 = performance.now(); for (let t = 0; t < 1500; t += 50) ov = Math.max(ov, L.tick(b0 + t).overlaps);
      for (const it of L.plates.values()) { all++; const txt = it.el.style.visibility !== 'hidden'; if (txt || it.bd.style.visibility !== 'hidden') vis++; if (it.tone === 'red') { red++; if (txt) redT++; } }
      h.remove();
    }
    return { k: `${W} px ×${k.toFixed(2)}`, red: `${redT}/${red}`, vis: `${Math.round((vis / all) * 100)} %`, ov };
  });
}
