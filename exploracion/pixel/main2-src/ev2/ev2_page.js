// ---------- CORRECCIONES DE ARTE · la página ----------
const MK = 7; // píxeles de pantalla por píxel de arte en un móvil de DPR 3 (2,33 px CSS)
const CARDS = [];
function card(parent, title, w, h, draw, { tag = '', cap = '', chip = '', scale = KPX } = {}) {
  const f = document.createElement('figure'); f.className = 'ev-card';
  const c = document.createElement('canvas'); c.width = w * MK; c.height = h * MK; c.style.width = Math.round(w * scale) + 'px'; c.style.maxWidth = '100%'; c.style.height = 'auto';
  f.innerHTML = `<div class="ev-ct"><b>${title}</b>${chip ? `<i class="ev-chip">${chip}</i>` : ''}${tag ? `<em class="ev-tag">${tag}</em>` : ''}</div>`; f.appendChild(c);
  if (cap) { const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.appendChild(fc); }
  parent.appendChild(f); CARDS.push({ c, w, h, draw }); return f;
}
const CARDROW = () => DIV('ev-cards');
setInterval(() => { const t = performance.now(); for (const k of CARDS) { const g = k.c.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#2a1d14'; g.fillRect(0, 0, k.w, k.h); k.draw(g, t); } }, 33);
const cave = (g, w, h, floor) => { g.fillStyle = '#2e2118'; g.fillRect(0, 0, w, h); for (let i = 0; i < (w * h) / 40; i++) { g.fillStyle = hh2(i, 3) < 0.5 ? '#271b13' : '#35271c'; g.fillRect(Math.floor(hh2(i, 1) * w), Math.floor(hh2(i, 2) * floor), 3, 1); } g.fillStyle = '#4e3826'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#6a4c30'; g.fillRect(0, floor, w, 1); };
const room = (g, w, h, floor) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let y = 2; y < floor; y += 5) for (let x = (y % 10 ? 0 : 6); x < w; x += 12) { g.fillStyle = '#33251a'; g.fillRect(x, y, 10, 1); } g.fillStyle = '#5a4028'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#7a5838'; g.fillRect(0, floor, w, 1); for (let x = 0; x < w; x += 7) { g.fillStyle = '#4a3420'; g.fillRect(x, floor + 1, 1, h - floor - 1); } };
const sky = (g, w, h, floor) => { ['#5a6ea6', '#6a80b4', '#7c92c0', '#94a8cc'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, (i * floor) / 4, w, floor / 4 + 1); }); g.fillStyle = '#5a9038'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#7cb44c'; g.fillRect(0, floor, w, 2); };
const shadowAt = (g, x, y, w) => { g.globalAlpha = 0.3; g.fillStyle = '#000'; g.fillRect(x + 2, y, w - 4, 1); g.fillRect(x + 4, y + 1, w - 8, 1); g.globalAlpha = 1; };
const mouseAt = (g, m, x, feet, t, o = {}, flip = false, dy = 0) => { const br = Math.floor((t + m.name.length * 431) / 650) % 2, bl = (t + m.name.length * 997) % 3300 < 110, cv = mF(m, o.legs ? 0 : br, bl, o); if (flip) { g.save(); g.translate(x + 22, feet - 20 + dy); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20 + dy); };
const mkc = (w, h, f) => { const a = document.createElement('canvas'); a.width = w; a.height = h; const x = a.getContext('2d'); x.imageSmoothingEnabled = false; f(x); return a; };

PP('<b>Iteración pequeña</b>, sobre los tres problemas que señalaste y el inventario de fuentes. Las tarjetas animadas van a <b>tamaño real de móvil</b> (2,33 px CSS por píxel de arte); las hojas grandes, a 4× para inspeccionar. Nada toca el juego, la economía ni el guardado.');

// ================= A · REFINE =================
H2('A', 'A · REFINE: RESTAURACIÓN', 'La refinería de V4.1 vuelve tal cual. La limpieza solo toca la tinta donde dos piezas se juntan.');
function refSheet() {
  const k = 4, [c, g] = SHEET(1160, 300); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, 1160, 300); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  const A = mkc(72, 56, (x) => refineA(x, 0, 0, 1000, { k: 0.4, bars: 2 })), B = mkc(72, 56, (x) => drawRefineB(x, 0, 0, 1, 0, true, 1000, { k: 0.4, bars: 2 })), C = mkc(72, 56, (x) => drawRefine(x, 4, 0, 1, 0, true, 1000, 0.4, 2, 0));
  const m = mouseCanvas(CREW.cheddar.refiner, 0, false, {});
  [['A · V4.1 original', A], ['B · V4.1 con limpieza selectiva', B], ['C · rediseño simplificado (descartado)', C]].forEach(([n, cv], i) => { const x0 = 10 + i * 382; g.fillText(n, x0, 20); g.drawImage(cv, x0, 34, 72 * k, 56 * k); g.drawImage(m, x0 + 290, 34 + 56 * k - 82, 88, 80); });
}
refSheet();
PP('<span class="ad-cap">A 4×, con un ratón oficial a la misma escala. C solo está para comparar.</span>');
H3('Qué cambia de A a B');
function diffSheet() {
  const k = 6, s0 = (f) => mkc(72, 56, f), A = s0((x) => refineA(x, 0, 0, 0, { pw: 0.22, k: 0, run: false, bars: 0 })), B = s0((x) => drawRefineB(x, 0, 0, 1, 0, true, 0, { run: false, bars: 0 }));
  const da = A.getContext('2d').getImageData(0, 0, 72, 56).data, db = B.getContext('2d').getImageData(0, 0, 72, 56).data;
  const [c, g] = SHEET(72 * k * 2 + 40, 56 * k + 30); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, c.width, c.height); g.drawImage(A, 0, 24, 72 * k, 56 * k); g.drawImage(B, 72 * k + 40, 24, 72 * k, 56 * k);
  let n = 0; g.fillStyle = '#ff2a6acc'; for (let y = 0; y < 56; y++) for (let x = 0; x < 72; x++) { const i = (y * 72 + x) * 4; if (da[i + 3] !== db[i + 3] || Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) { n++; g.fillRect(72 * k + 40 + x * k, 24 + y * k, k, k); } }
  g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8'; g.fillText('A', 4, 16); g.fillText(`B: en rosa, los ${n} píxeles que cambian`, 72 * k + 44, 16);
}
diffSheet();
UL([
  '<b>Se conserva todo:</b> la arquitectura, el horno de ladrillo con su arco y su clave, el fuego, el alambique de cobre con sus aros y remaches, el manómetro, la mirilla, la tolva, el cuello de cisne, el serpentín, el molde, la chimenea de hierro, el goteo y el vapor. Son las mismas funciones de dibujo de V4.1, en las mismas posiciones.',
  '<b>Lo que encontré al revisarla a 12×:</b> esta máquina no tiene contornos dobles. Tiene lo contrario: <b>tramos sin contorno</b>. Las paredes rectas y la base del horno, los lados y el fondo del molde y el collarín de la chimenea llenaban su lienzo hasta el borde y su tinta se quedaba fuera; la cúpula y el alambique sí la tienen. Por eso el horno parecía deshacerse por los lados y por abajo.',
  '<b>Lo único que cambia en B:</b> se completa ese contorno, con la misma tinta y solo por fuera (los 100 píxeles en rosa). No cambia ni un píxel de dentro, y la línea entre el horno y el alambique es la de V4.1.',
  '<b>Biseles y sombreado:</b> los revisé uno a uno. El canto claro de la cúpula, las juntas del ladrillo, los aros, los remaches y el sombreado del cobre son modelado intencionado, no biseles repetidos, y no encontré errores de sombreado. Se quedan como están.',
]);
{ const R = CARDROW(); for (const [n, f] of [['A · V4.1', (g, t) => refineA(g, 26, 3, t, { k: (t % 3000) / 3000, bars: 2 })], ['B · limpieza selectiva', (g, t) => drawRefineB(g, 26, 3, 1, 0, true, t, { k: (t % 3000) / 3000, bars: 2, steam: true })], ['C · simplificada', (g, t) => drawRefine(g, 30, 3, 1, 0, true, t, (t % 3000) / 3000, 2, 0)]]) card(R, n, 100, 64, (g, t) => { cave(g, 100, 64, 58); f(g, t); mouseAt(g, CREW.cheddar.refiner, 2, 58, t, (t % 3000) < 400 ? { ear: true } : {}, false, (t % 3000) > 60 && (t % 3000) < 200 ? 1 : 0); }, { cap: n.startsWith('A') ? 'Tal como estaba en V4.1.' : n.startsWith('B') ? 'La que propongo aprobar.' : 'Solo para comparar.' }); }

// ================= B · HOUSE SLEEP V3 =================
H2('B', 'B · HOUSE: EL RATÓN DURMIENDO (V3)', 'Una pose tumbada de verdad, nueva y para aprobar aparte, y la escena completa: entrar, subir, tumbarse, taparse, dormir, despertar, destaparse, levantarse y salir.');
H3('La pose nueva (para aprobar por separado)');
function lieSheet() {
  const k = 5, [c, g] = SHEET(1100, 370); g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 1100, 370); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  g.fillText('Oficial, de pie (sin tocar)', 10, 18); g.fillText('Tumbado: dormido', 200, 18); g.fillText('Tumbado: despierto', 500, 18); g.fillText('Respira: la espalda sube 1 px', 800, 18);
  [CREW.town.idle, CREW.cheddar.cook, CREW.gouda.cook].forEach((m, i) => { const y = 34 + i * 112, f = y + 20 * k; g.drawImage(mouseCanvas(m, 0, false, {}), 10, y, 22 * k, 20 * k); for (const [x, o] of [[200, {}], [500, { eyes: 'open' }], [800, { lift: 1 }]]) g.drawImage(lyingMouse(m, o), x, f - 14 * k, 29 * k, 14 * k); });
}
lieSheet();
UL([
  '<b>No es el sprite oficial modificado:</b> es una plantilla nueva hecha con el mismo sistema que los ratones (las mismas letras de paleta y las mismas reglas de pelo, sombrero y bufanda). La <b>cabeza es la oficial</b>, píxel a píxel, con la cara oficial de dormir o los ojos abiertos.',
  '<b>Lo nuevo es el cuerpo en horizontal</b>, detrás de la cabeza: espalda, cadera, barriga, las patas delanteras bajo la barbilla, la pata de atrás y la cola. Las proporciones salen del oficial (mismo grosor de cuerpo, misma cabeza).',
  '<b>La manta no lo tapa:</b> cubre las patas de atrás y cae en diagonal sobre la cadera, siguiendo su forma, con el embozo blanco en el borde. Espalda, pecho, patas delanteras y cabeza quedan a la vista.',
  '<b>Cada ratón sigue siendo él:</b> arriba, tres ratones distintos con su pelo, su sombrero y su bufanda. La mochila se cuelga del pie de la cama.',
]);
H3('La escena (tamaño real de móvil y a 3×)');
{ const R = CARDROW(); card(R, 'Bucle completo (12 s)', 112, 40, (g, t) => { room(g, 112, 40, 34); sceneLie(g, 52, 12, CREW.town.idle, t % 12000); }, { cap: 'Entra, sube, se tumba, se tapa, duerme (respira, Z), despierta, se destapa, se levanta y se va.' }); card(R, 'Durmiendo', 64, 40, (g, t) => { room(g, 64, 40, 34); sceneLie(g, 6, 12, CREW.town.idle, t, { sleepOnly: true }); }, { cap: 'Respiración y Z pequeñas.' }); }
{ const R = CARDROW(); card(R, 'El bucle a 3×', 112, 40, (g, t) => { room(g, 112, 40, 34); sceneLie(g, 52, 12, CREW.town.idle, t % 12000); }, { scale: 3 * 2.2, cap: 'La misma animación, más grande para revisar transiciones.' }); }
TB(['MOMENTO', 'QUÉ SE VE'], [
  ['Entrar y subir (0–1,8 s)', 'Llega andando por el pie de la cama y sube de un saltito al colchón.'],
  ['Tumbarse (1,8–2,3 s)', 'Pasa de pie a la pose tumbada, que se asienta en dos pasos (3 px y 1 px), con la cabeza hacia la almohada.'],
  ['Taparse (2,3–3,2 s)', 'La manta sube desde los pies en tres pasos hasta tapar las patas de atrás; cierra los ojos.'],
  ['Dormir (3,2–8 s)', 'La espalda sube 1 px cada 2,4 s. Dos Z de 3 y 4 px suben en diagonal desde la cabeza.'],
  ['Despertar (8–8,7 s)', 'Abre los ojos, mueve la oreja y levanta la cabeza 1 px.'],
  ['Destaparse y salir (8,7–12 s)', 'Aparta la manta hacia los pies en tres pasos, se pone de pie mirando hacia fuera, baja de un saltito y se va andando.'],
]);
H3('THE BED en el juego real');
TB(['', 'LO QUE HACE EL CÓDIGO (js/game/systems/mice.js)'], [
  ['Qué es', 'La única plaza de la casa (THE BED y TRAINING ROOM la comparten, <code>s.care</code>). Trata una manía o reentrena una especialidad. Dura 30 minutos.'],
  ['El ratón', '<b>Sigue en su puesto y sigue trabajando</b>: «lo que cuesta es la inversión y la espera, no parar la producción» (comentario del código). Cualquier ratón puede ocuparla, tenga puesto o no.'],
  ['Coste', 'Sube con cada tratamiento o reentreno de la partida (<code>s.totals.treatments</code> y <code>s.totals.retrains</code>).'],
  ['Fin', 'Al acabar, la plaza queda libre (también si se despide al ratón).'],
]);
UL([
  '<b>Conclusión:</b> THE BED no es un sitio donde el ratón descanse; es un tratamiento que transcurre mientras trabaja. Dibujarlo dormido en la casa lo mostraría dos veces o diría algo que el juego no hace.',
  '<b>Lo que sí existe:</b> ratones sin puesto (los que acabas de contratar, o los que quitas de un puesto). No están en ningún sitio de MAIN.',
  '<b>Opción 1 (sin cambiar nada del juego):</b> en la cama de la casa duerme un ratón sin puesto, si hay alguno; si hay varios, uno (la casa tiene una cama). Es la escena de arriba: Poppy no tiene puesto. Representa un estado que ya existe, pero le da un sitio visual: <b>lo decide el PM</b>.',
  '<b>Opción 2:</b> la cama de la casa no lleva ratón; THE BED se nota en el puesto del ratón tratado con una pieza pequeña (por ejemplo, una venda en la oreja mientras dura) y en la casa con una lámpara encendida junto a la cama. Necesita dibujo nuevo y aprobación.',
  '<b>Opción 3:</b> no representar THE BED en el escenario; queda en el panel HOUSE, como ahora.',
  '<b>Mi recomendación:</b> la 1 para la cama y la 3 para THE BED, porque no inventan nada. Pero es una decisión de juego, no de arte: no la doy por buena sin el PM.',
]);

// ================= C · EVOLUCIÓN V2 =================
H2('C', 'C · HOUSE Y LAB: EVOLUCIÓN V2', 'Cada fase cambia la silueta por algo que el edificio ha ganado; los disparadores quedan pendientes de validar.');
function evoSheet2() {
  const k = 3, [c, g] = SHEET(1300, 600); g.fillStyle = '#36452f'; g.fillRect(0, 0, 1300, 600); g.fillStyle = '#26321f'; g.fillRect(0, 248, 1300, 46); g.fillRect(0, 554, 1300, 46);
  const m = mouseCanvas(CREW.town.idle, 0, false, {});
  lineup(g, [['RATÓN', m], ['HOUSE I', houseStage(1), 'la casa'], ['HOUSE II', houseV2(2), 'casa de la colonia'], ['HOUSE III', houseV2(3), 'gran madriguera']], k, 6, 248, 4);
  const x = lineup(g, [['RATÓN', m], ['LAB I', labV2(1), '3 recetas'], ['LAB II', labV2(2), 'Research Assistant'], ['LAB III', labV2(3), 'Advanced Research'], ['LAB IV', labV2(4), 'Strain Research']], k, 6, 554, 3);
  g.setLineDash([6, 5]); g.strokeStyle = '#ffcf2e'; g.strokeRect(x - 4, 554 - 40 * k, 22 * k, 40 * k); g.setLineDash([]); g.fillStyle = '#ffcf2e'; g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('Hueco reservado', x, 554 - 40 * k + 18); g.fillText('FORBIDDEN', x, 554 - 40 * k + 34); g.fillText('GENETICS', x, 554 - 40 * k + 50);
}
evoSheet2();
H3('HOUSE: tres transformaciones');
UL([
  '<b>I · La casa</b> (se construye con la primera mejora): la casita de la cuña de queso, la puerta redonda y su cama.',
  '<b>II · Casa de la colonia</b>: la cuña crece en dos pisos con una buhardilla y su ventana encendida; zócalo de piedra labrada, puerta con aro de latón, chimenea de ladrillo y un porche con banco y faroles. Cambia la silueta, no se añade un anexo.',
  '<b>III · Gran madriguera</b>: un torreón con tejado cónico de corteza y una gran vidriera redonda, que es la galería del álbum; una pasarela lo une a la casa, y en el patio está el muñeco de paja de la TRAINING ROOM. Sigue siendo un hogar: madera, piedra, luz cálida, ninguna máquina.',
]);
TB(['FASE', 'DISPARADOR PROPUESTO', 'QUÉ ES EN EL JUEGO', 'ESTADO'], [
  ['I', 'Mouse House construida', 'Desbloqueo real: se construye al comprar la primera mejora (<code>s.built.house</code>).', '<span class="ad-k keep">Existe</span>'],
  ['II', 'Reclutas de toda la partida (<code>s.totals.miceRecruited</code>)', 'Contador permanente: solo sube, aunque despidas. Reclutar es una función de HOUSE.', '<span class="ad-k adapt">Existe el contador · umbral: PM</span>'],
  ['III', 'Piezas del álbum (<code>s.album</code>)', 'Mejora permanente: cada pieza sube un 1 % el precio de venta para siempre. El álbum es una función de HOUSE.', '<span class="ad-k adapt">Existe · umbral: PM</span>'],
  ['Descartado', 'Rangos 3 y 4 de los ratones', 'Los rangos son de cada ratón, no de la casa; si despides o cambias al ratón, la casa «retrocedería».', '<span class="ad-k rebuild">No</span>'],
  ['Detalle', 'Tratamientos y reentrenos (<code>s.totals.treatments + retrains</code>)', 'Contadores permanentes de THE BED y TRAINING ROOM. Podrían mover detalles pequeños (la lámpara de la cama, el desgaste del muñeco).', '<span class="ad-k adapt">Opcional · PM</span>'],
]);
H3('LAB: cada fase, una capacidad nueva');
TB(['FASE', 'DESBLOQUEO REAL', 'QUÉ CAMBIA EN EL EDIFICIO'], [
  ['I', 'Se construye con 3 recetas', 'Laboratorio de una planta: el ojo de buey con el experimento, la chimenea de ventilación y la pizarra.'],
  ['II', 'Research Assistant (abre el puesto de investigación)', 'La planta de arriba es el despacho del investigador: mesa, lámpara y papeles a la vista; fuera, el serpentín de su experimento.'],
  ['III', 'Advanced Research (elegir dirección)', 'Mira hacia fuera: cúpula de cobre con telescopio y antena. Metal, latón, instrumentos.'],
  ['IV', 'Strain Research (STRAINS, Cheesemaking 10)', 'Hace crecer algo: el ala de cultivos. Un biorreactor alto de vidrio con las cepas por capas, unido a la torre por dos tuberías, y un invernadero bajo con las bandejas. Vidrio, tuberías húmedas, luz verde y violeta. Cambia la silueta: el edificio se ensancha y sube por el otro lado.'],
  ['Futuro', 'FORBIDDEN GENETICS (roadmap)', 'Hueco reservado a la izquierda. Sin diseñar.'],
]);

// ================= D · BOOST =================
H2('D', 'D · BOOST: SEGUIMIENTO', 'Los módulos, atornillados a las máquinas originales (REFINE B y la perforadora de V4.1) y a una evolucionada. Cada máquina expresa su refuerzo a su manera; el cian queda para la gema.');
TB(['MÁQUINA', 'QUÉ DA EL REFUERZO EN EL JUEGO', 'CÓMO SE EXPRESA'], [
  ['<b>REFINE</b>', '×1,5 de Base del mismo Raw (no acelera)', '<b>Rendimiento:</b> una columna de extracción de vidrio, junto al serpentín, por la que sube Base; un segundo caño gotea en el molde; salen más barras en el mismo ciclo (2 → 3, o 4–5 con dos refuerzos). El fuego va a su ritmo de siempre.'],
  ['<b>DRILL</b>', '×1,5 de velocidad (×2,25 con dos)', '<b>Potencia mecánica:</b> bobina de cobre en la barra, el escape tose el doble, el volante gira a la velocidad real con estela de acero y la broca arranca trozos más grandes.'],
  ['<b>CHEESE</b>', '×1,5 de velocidad', '<b>Fabricación reforzada:</b> la prensa trabaja con un segundo husillo, la paleta remueve más rápido y cada hornada sale con un pequeño golpe de vapor de la prensa (propuesta, sin dibujar).'],
  ['<b>MINE</b>', '×1,5 de velocidad del minero', '<b>Reacción de la excavación:</b> el minero golpea al ritmo real, la roca suelta más trozos y polvo y se le marca la grieta un instante (propuesta, sin dibujar).'],
  ['<b>SELL</b>', '×1,5 de velocidad de venta', '<b>Actividad comercial:</b> guirnalda de faroles bajo el toldo, más ruedas que entran y salen del mostrador y monedas que saltan más a menudo (propuesta, sin dibujar).'],
  ['<b>LAB · HOUSE · PANTRY</b>', 'No admiten refuerzo', 'Solo conceptos futuros. No se activan con nada.'],
]);
UL(['<b>Lo que comparten todas:</b> la gema del panel BOOSTS en su engaste de latón, que se apaga si el puesto no tiene ratón y destella de vez en cuando si trabaja. El resto es propio de cada máquina.', '<b>Evolución + BOOST:</b> el módulo se ancla en el mismo sitio en cada fase. Una refinería de fase III con dos refuerzos conserva sus aros de hierro, su fuelle y su cúpula de presión.']);
const REF = 3000;
const refCard = (R, title, stage, boost, on, chip, cap) => card(R, title, 100, 64, (g, t) => { cave(g, 100, 64, 58); const k = (t % REF) / REF, bars = !on ? 0 : boost === 0 ? 2 : boost === 1 ? 3 : (Math.floor(t / REF) % 2 ? 5 : 4); shadowAt(g, 26, 58, 70); drawRefineB(g, 26, 3, stage, boost, on, t, { k, bars, steam: true, run: on }); if (on) mouseAt(g, CREW.cheddar.refiner, 2, 58, t, k < 0.13 ? { ear: true } : {}, false, k > 0.02 && k < 0.07 ? 1 : 0); }, { chip, cap });
{ const R = CARDROW(); refCard(R, 'REFINE', 1, 0, true, '', '2 barras por ciclo de 3 s.'); refCard(R, 'REFINE · BOOST', 1, 1, true, '+50% BASE', 'Mismo ciclo, 3 barras: la columna de extracción y el segundo caño.'); refCard(R, 'REFINE · equipado sin ratón', 1, 1, false, '+50% BASE', 'Gema apagada, columna vacía: sin ratón no hace nada.'); }
{ const R = CARDROW(); refCard(R, 'REFINE fase III', 3, 0, true, '', 'Aros de hierro, fuelle y cúpula de presión (Hot Furnace y Bigger Vat).'); refCard(R, 'REFINE fase III · BOOST ×2', 3, 2, true, 'x2.25 BASE', 'Conserva toda la fase III; dos gemas; 4–5 barras por ciclo.'); }
const drCard = (R, title, boost, on, chip, cap) => card(R, title, 92, 82, (g, t) => { cave(g, 92, 82, 78); const sp = !on ? 1 : boost === 2 ? 2.25 : boost === 1 ? 1.5 : 1, ms = 2000 / sp, k = (t % ms) / ms; drillV41(g, 4, 2, t, { boost, on, run: on, speed: sp }); if (on) { mouseAt(g, CREW.cheddar.driller, 66, 78, t, k > 0.85 ? { face: 'happy' } : {}, true, k < 0.08 ? 1 : 0); if (k > 0.88) rawTok(30, 76); } }, { chip, cap });
{ const R = CARDROW(); drCard(R, 'DRILL (V4.1)', 0, true, '', 'Un ciclo cada 2 s.'); drCard(R, 'DRILL · BOOST', 1, true, '+50% SPEED', 'Un ciclo cada 1,3 s: bobina, escape doble, estela del volante, trozos grandes.'); drCard(R, 'DRILL · BOOST ×2', 2, true, 'x2.25 SPEED', 'Un ciclo cada 0,9 s; la segunda gema va en el frente del pórtico.'); drCard(R, 'DRILL · equipado sin ratón', 1, false, '+50% SPEED', 'Parada: gema apagada, sin efectos.'); }

// ================= E · FUENTES =================
H2('E', 'E · INTEGRIDAD DE LAS FUENTES', 'Qué hay, dónde y qué falta, antes de redibujar nada.');
TB(['RECURSO', 'DÓNDE', 'ESTADO'], [
  ['Prototipos HTML (V2, gris, V3, V4, V4.1, revisión 1, evolución, esta)', '<code>exploracion/pixel/main2-*.html</code>', '<span class="ad-k keep">Están</span> · cada uno lleva dentro todo su código.'],
  ['Fuentes editables de V4 y V4.1 (módulos sueltos)', 'Estaban en la carpeta temporal de la sesión, que se vació.', '<span class="ad-k keep">Recuperadas</span> · partidas desde sus HTML en <code>exploracion/pixel/main2-src/v4</code> y <code>/v41</code>; al unirlas sale el mismo archivo, byte a byte.'],
  ['Fuentes de las revisiones de arte', 'Igual.', '<span class="ad-k keep">Recuperadas</span> en <code>main2-src/ad</code> y <code>main2-src/ev</code>; esta iteración trabaja ya en <code>main2-src/ev2</code>, dentro del proyecto.'],
  ['Funciones de dibujo de REFINE, DRILL y el resto de V4.1', 'Dentro de <code>main2-src/v41/05_m4_art.js</code> y <code>08_m41_scene.js</code>', '<span class="ad-k keep">Están</span> · REFINE A se dibuja con ellas, no con una captura.'],
  ['Ratones oficiales (plantilla y paleta)', '<code>tree.html</code> y el bloque compartido de cada prototipo', '<span class="ad-k keep">Están</span>'],
  ['Sprites y animaciones aprobados', '<code>exploracion/pixel/out/sprites</code> (212 PNG) y <code>out/anims</code> (198 PNG)', '<span class="ad-k keep">Están</span>'],
  ['Fuentes de esos sprites', '<code>exploracion/pixel/*.px.js</code> (buildings, mice, anims, main, styles…)', '<span class="ad-k keep">Están</span> · ya hay Node en este Mac para volver a generarlos.'],
  ['Paneles aprobados (árbol, ficha, MICE…)', '<code>tree.html</code>, <code>ficha.html</code>, <code>house.html</code>, <code>roster.html</code>…', '<span class="ad-k keep">Están</span>'],
  ['V3 como módulos sueltos', '—', '<span class="ad-k adapt">No partida</span> · su código está entero en <code>main2-v3.html</code>; se puede separar igual si hace falta.'],
  ['Copia en git', '—', '<span class="ad-k rebuild">Riesgo</span> · toda la carpeta <code>exploracion/pixel</code> (46 archivos, 12 MB) está sin versionar en git. No hay pérdida, pero no está protegida. Cuando autorices un commit, conviene versionarla en la rama de prototipos.'],
]);
PP('<b>Bloqueos reales:</b> ninguno. Nada de esta entrega se ha reconstruido a partir de una captura.');

// ================= DECISIONES =================
H2('OK', 'QUÉ NECESITO QUE DECIDAS');
UL([
  '<b>A · REFINE:</b> ¿apruebas B (V4.1 con limpieza selectiva)?',
  '<b>B · Cama:</b> ¿apruebas la pose tumbada nueva y la escena? ¿Y qué representa la cama (opción 1, 2 o 3)? La última parte es del PM.',
  '<b>C · Evolución:</b> ¿te convencen HOUSE I–III y LAB I–IV? Los umbrales de reclutas y álbum son del PM.',
  '<b>D · BOOST:</b> ¿sigue la dirección (rendimiento en REFINE, potencia mecánica en DRILL) para dibujar CHEESE, MINE y SELL?',
  '<b>E · Fuentes:</b> ¿autorizas versionar <code>exploracion/pixel</code> en la rama de prototipos cuando toque hacer commit?',
]);
