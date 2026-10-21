// ---------- BLOQUE 5 · SISTEMAS COMPARTIDOS · la página ----------
const MK = 7;
const EXPORT5 = [
  { file: 'cage_back.png', cv: cageBack, src: 'cageBack()', marker: 'nuevo · montacargas', note: 'Marco, techo con argolla, fondo y suelo de la jaula. Las ruedas van entre las dos capas.', state: 'nuevo' },
  { file: 'cage_front.png', cv: cageFront, src: 'cageFront()', marker: 'nuevo · montacargas', note: 'Barrotes delante de la carga.', state: 'nuevo' },
  ...[['alert', 'Aviso de máquina (ámbar).'], ['alertr', 'Máquina parada (rojo).'], ['done', 'Hecho (verde).']].map(([n, note]) => ({ file: `badge_${n}.png`, cv: () => gameIcon(n), src: `gameIcon('${n}')`, marker: `icons.js · ${n} (ya aprobado en el juego)`, note: note + ' A 1:1; en escena, ×2.', state: 'congelado' })),
];
window.B5_EXPORT = EXPORT5;
const urlOf = (cv) => cv.toDataURL('image/png');

PP(`<b>Bloque 5 de producción.</b> La columna del MVP montada de verdad: superficie, Cheddar, Gouda y Brie, una debajo de otra, unidas por el montacargas. Y los bocadillos, placas e insignias de vuelta a la dirección validada en la revisión de arte, con un sistema de colocación sin solapes y su demostración. ${EXPORT5.length} PNG con su manifiesto.`);

// ================= LA COLUMNA =================
H2('C', 'LA COLUMNA DEL MVP', 'A tamaño real de móvil: desliza hacia abajo, de la superficie a Brie. La jaula baja hasta Brie y sube recogiendo el queso de cada roca.');
const wrap = DIV('b5-col'); const col = document.createElement('div'); col.className = 'b5-stack'; wrap.appendChild(col);
const sc = document.createElement('canvas'); sc.width = STACK.w * MK; sc.height = STACK.h * MK; sc.style.width = Math.round(STACK.w * KPX) + 'px'; sc.style.height = Math.round(STACK.h * KPX) + 'px'; col.appendChild(sc);
const mk = () => document.createElement('canvas'), cv3 = { surf: Object.assign(mk(), { width: SW1, height: SH1 }), ched: mk(), gouda: mk(), brie: mk() }, buf = Object.assign(mk(), { width: STACK.w, height: STACK.h });
for (let i = 0; i < 300; i++) step41(16);
let lastT = 0;
setInterval(() => { const now = performance.now(); step41(50); const g = buf.getContext('2d'); g.imageSmoothingEnabled = false; drawStack(g, now, cv3); const o = sc.getContext('2d'); o.setTransform(MK, 0, 0, MK, 0, 0); o.imageSmoothingEnabled = false; o.drawImage(buf, 0, 0); }, 50);
UL([
  '<b>Cómo encaja:</b> cada capítulo (161 px, el ancho del móvil) se coloca bajo el mercado del pueblo, desde x = 254. Así el centro de la polea del castillete cae justo entre los dos cables del pozo de cada capítulo, y el pozo baja recto de la superficie a Brie.',
  '<b>El montacargas:</b> una sola jaula para todo el pozo. Baja hasta Brie, carga su rueda, sube parando en Gouda y en Cheddar, descarga arriba y las ruedas entran en la despensa. En cada rellano espera la rueda de su queso: blanca en Brie, de cera roja en Gouda, ámbar en Cheddar. La polea del castillete gira solo mientras la jaula se mueve, y el farol de la jaula se enciende en marcha (su luz va sin contorno).',
  '<b>Para integrar:</b> el pozo de V4.1 está pegado al borde derecho del capítulo, así que en esta vista a ancho de móvil el castillete queda cortado 9 px por la derecha; en el pueblo, que se desliza, se ve entero. Si se quiere entero también aquí, hay que separar el pozo del borde en los tres capítulos; lo anoto para QA en vez de moverlo ahora.',
  '<b>Simulación:</b> los tres capítulos usan la de Cheddar (es una demostración visual) y el montacargas sigue un guion fijo; al integrar, los dos los mueve el juego.',
]);
TB(['TRAMO', 'DESDE → HASTA', 'DURACIÓN'], LIFT_T.map(([k, a, b, ms]) => [{ down: 'Baja', up: 'Sube', load: 'Carga', unload: 'Descarga' }[k], a === b ? a : `${a} → ${b}`, (ms / 1000).toFixed(1) + ' s']));

// ================= BOCADILLOS, PLACAS E INSIGNIAS =================
H2('K', 'BOCADILLOS, PLACAS E INSIGNIAS', 'De vuelta a la dirección validada en la revisión de arte, con un sistema de colocación sin solapes. Pruébalo con los botones.');
const G1 = geoC(STOPS[1]), T0 = STOPS[1].top, DW = Math.ceil(SC.worldW), DH = STOPS[1].h;
const scene = document.createElement('div'); scene.className = 'lb-scene'; const dc = document.createElement('canvas'); dc.width = DW * MK; dc.height = DH * MK; dc.style.width = Math.round(DW * KPX) + 'px'; dc.style.height = Math.round(DH * KPX) + 'px'; scene.appendChild(dc); const host = document.createElement('div'); host.className = 'lb-host'; scene.appendChild(host);
const bar = DIV('lb-bar'); COL.appendChild(scene); const stat = DIV('lb-stat');
const LB = labelLayer(host, { k: KPX, view: () => [0, 0, DW * KPX, DH * KPX] }); window.LB5 = LB;
const headIn = (who) => () => { const b = BR[who]; return b && b.px != null ? [b.px + 11, b.py - 18 - T0] : null; };
// La placa de la perforadora cuelga de su cuadro de mandos (donde está su piloto), no de lo alto de la máquina.
const ANCH = { refinery: [G1.o + 12, G1.TL - 30 - T0], drill: [G1.o + 100, G1.DK - 13 - T0], cheesery: [G1.o + 116, G1.TR - 36 - T0], rock: [G1.rx + 27, G1.rb - 42 - T0] };
const IC = { raw: 'out/sprites/ic_raw_cheddar.png', base: 'out/sprites/ic_base_cheddar.png', lot: 'out/sprites/ic_lot_cheddar.png', pick: 'out/sprites/ic_pick.png' };
const LAST = {}; let wantMover = 0;
const button = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.onclick = fn; bar.appendChild(b); };
const clearAll = () => { for (const id of [...LB.plates.keys()]) LB.unwarn(id); LB.q.length = 0; };
button('HABLA QUIETO', () => LB.say('driller', "Drill's warm.", headIn('driller')));
button('HABLA ANDANDO', () => { wantMover = performance.now() + 6000; });
button('AVISOS DE MÁQUINA', () => { clearAll(); LB.warn('ref', { tone: 'amber', icon: IC.raw, text: 'NO RAW', anchor: ANCH.refinery }); LB.warn('chz', { tone: 'amber', icon: IC.base, text: 'NO BASE', anchor: ANCH.cheesery }); LB.warn('drl', { tone: 'red', icon: IC.pick, text: 'STOPPED', anchor: ANCH.drill }); });
button('CONFLICTOS', () => { clearAll(); LB.warn('ref', { tone: 'amber', icon: IC.raw, text: 'NO RAW', anchor: ANCH.refinery }); LB.warn('drl', { tone: 'red', icon: IC.pick, text: 'STOPPED', anchor: ANCH.drill }); LB.warn('drl2', { tone: 'amber', icon: IC.raw, text: 'NO VEIN', anchor: [ANCH.drill[0] + 6, ANCH.drill[1] + 4] }); LB.warn('chz', { tone: 'amber', icon: IC.base, text: 'NO BASE', anchor: ANCH.cheesery }); LB.warn('lift', { tone: 'amber', icon: IC.lot, text: 'LIFT FULL', anchor: [ANCH.cheesery[0] + 14, ANCH.cheesery[1] + 10] }); LB.warn('rock', { tone: 'amber', icon: IC.pick, text: 'PICK ME', anchor: ANCH.rock }); LB.say('miner', 'Found a vein!', headIn('miner')); LB.say('refiner', 'Fire needs Raw.', headIn('refiner')); });
button('SIN SITIO', () => { clearAll(); LB.warn('drl', { tone: 'red', icon: IC.pick, text: 'STOPPED', anchor: ANCH.drill }); LB.say('cook', 'One more batch, then tea.', headIn('cook')); });
button('LIMPIAR', clearAll);
COL.appendChild(stat);
setInterval(() => {
  const now = performance.now(), off2 = document.createElement('canvas'); renderStopTo(1, now, off2); const g = dc.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(off2, 0, 0);
  // «Habla andando»: espera a que un ratón se esté moviendo de verdad y es ese el que habla.
  const moving = Object.keys(BR).filter((w) => BR[w].px != null && LAST[w] != null && Math.abs(BR[w].px - LAST[w]) >= 1 && w !== 'miner'); for (const w of Object.keys(BR)) LAST[w] = BR[w].px;
  if (wantMover && now < wantMover && moving.length) { LB.say(moving[0], moving[0] === 'cook' ? 'Wheel coming through!' : 'On my way!', headIn(moving[0])); wantMover = 0; }
  const s = LB.tick(now); stat.textContent = `Bocadillo: ${s.bubble} · placas con texto: ${s.plates} · insignias: ${s.badges} · sin sitio: ${s.hidden} · bocadillos cerrados (sin sitio o sin ratón): ${s.closed} · solapes: ${s.overlaps}`;
}, 50);
COL.insertBefore(bar, scene);
UL([
  '<b>Bocadillo:</b> el validado en la revisión de arte, sin cambios: crema con 2 px de tinta y esquinas recortadas, letra pixel y la punta escalonada. Ahora va anclado al ratón: se recoloca en cada fotograma sobre su cabeza y la punta lo sigue señalando. Si no cabe encima, se corre o se pone a un lado; si el ratón sale de la vista o no hay sitio durante más de 0,4 s, se cierra. Habla uno a la vez; el siguiente espera su turno.',
  '<b>Placa de aviso:</b> la validada: chapa oscura con borde ámbar, el icono del recurso aprobado, el texto del juego y la cadena hasta la máquina. La roja (máquina parada) usa los colores del aviso rojo que ya tiene el juego.',
  '<b>Insignias:</b> los iconos de aviso aprobados que ya usa el juego (el triángulo ámbar, el rojo y la marca verde), no unos nuevos. Son lo que queda de una placa cuando no cabe con texto.',
  '<b>Reglas de colocación:</b> primero lo rojo (máquina parada), luego el bocadillo (dura unos segundos) y al final lo ámbar (un aviso que puede esperar en su insignia); la placa roja, si no cabe encima, cuelga por debajo de su punto; cada pieza prueba sus posiciones en orden (la placa: cadena de 8, 20 o 32 px y corrida a los lados sin dejar de colgar de su punto) y se queda con la primera que no pisa nada; si la que tenía sigue valiendo, no se mueve. Como mucho 3 placas con texto a la vez; las demás pasan a insignia; si ni eso cabe, no se pinta, y el aviso sigue activo. La línea de debajo de la escena cuenta en directo lo que se ve y los solapes, que deben ser 0.',
  '<b>Los botones:</b> HABLA QUIETO (el perforador, en su puesto) · HABLA ANDANDO (espera a que un ratón se esté moviendo y es ese el que habla: el bocadillo lo sigue) · AVISOS DE MÁQUINA (dos ámbar y una roja) · CONFLICTOS (seis avisos y dos ratones a la vez: lo rojo sale con texto, hablan los dos por turnos, tres ámbar con texto y el resto en insignia o fuera) · SIN SITIO (el quesero, junto al borde y con la placa roja donde iría su bocadillo: no se tapa lo crítico, así que su bocadillo se cierra y el contador lo apunta).',
]);

// ================= ENTREGA =================
H2('E', 'ENTREGA PARA INTEGRAR', 'En exploracion/pixel/out/main2/compartido, con su manifest.json (incluye el guion del montacargas y la alineación).');
TB(['ARCHIVO', 'TAMAÑO', 'SALE DE', 'PARA', 'NOTA'], EXPORT5.map((e) => { const cv = e.cv(); return [`<code>${e.file}</code>`, `${cv.width} × ${cv.height}`, `<code>${e.src}</code>`, e.marker, e.note]; }));
UL([
  '<b>Bocadillos y placas</b> no son PNG: son el CSS validado (.ad-bub, .ad-warn) y la capa de colocación <code>labelLayer</code> de <code>main2-src/b5/b5_ui.js</code>, que el juego puede usar tal cual sobre su escena.',
  '<b>Revisado y anotado para QA:</b> las fichas de recurso que viajan (Raw, Base, ruedas) llevan contorno porque son objetos, no efectos; la columna recorta el castillete 9 px; el pico dorado del jugador (Sharper Pick 16) está pendiente; las fases de las máquinas se notan poco.',
]);
H2('→', 'SIGUIENTE', 'Bloque 6 · QA y entrega: coherencia visual, escalas, animaciones, piezas editables y compatibilidad con el móvil, antes de integrar sobre el juego real.');
