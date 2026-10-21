// ---------- BLOQUE 1 · INVENTARIO Y SUPERFICIE · la página ----------
const MK = 7;
const STATE = { house: 3, lab: 4, shop: 5, lift: true, lots: 3 };
// ---- Lista de exportación: lo que se entrega para integrar (PNG 1:1 + manifiesto). Ancla: abajo a la izquierda, en el suelo.
const EXPORT = [
  ...[1, 2, 3].map((s) => ({ file: `house_${s}.png`, cv: () => (s === 1 ? houseStage(1) : houseV3(s)), src: s === 1 ? 'houseStage(1)' : `houseV3(${s})`, marker: 'scene.js · Mouse House', note: s === 1 ? 'Fase I; se coloca 22 px a la derecha del origen de la fase III para que la casa no se mueva al evolucionar.' : s === 2 ? 'Fase II; 24 px a la derecha del origen de la fase III.' : 'Fase III (con la torre del álbum).', state: 'congelado' })),
  ...[1, 2, 3, 4].map((s) => ({ file: `lab_${s}.png`, cv: () => labV2(s), src: `labV2(${s})`, marker: 'scene.js · Cheese Lab', note: ['3 recetas', 'Research Assistant', 'Advanced Research', 'Strain Research'][s - 1], state: 'congelado' })),
  ...[0, 1, 2, 3, 4, 5].flatMap((t) => [{ file: `shop_back_t${t}.png`, cv: () => shopBack(t), src: `shopBack(${t})`, marker: 'scene.js · Cheese Shop', note: `Aspecto ${t} (visualTier de Trading). Detrás del tendero.`, state: 'nuevo' }, { file: `shop_front_t${t}.png`, cv: () => shopFront(t), src: `shopFront(${t})`, marker: 'scene.js · Cheese Shop', note: `Mostrador del aspecto ${t}. Delante del tendero.`, state: 'nuevo' }]),
  { file: 'shop_lot.png', cv: lotSprite, src: 'lotSprite()', marker: 'scene.js · Cheese Shop', note: 'Lote en venta; hasta 4, en los huecos x = 4, 12, 40 y 48 del mostrador (y = 36).', state: 'nuevo' },
  { file: 'pantry.png', cv: pantrySprite2, src: 'pantrySprite2()', marker: 'scene.js · Storage', note: 'Un solo aspecto.', state: 'nuevo' },
  { file: 'headframe.png', cv: headframe2, src: 'headframe2()', marker: 'nuevo (MAIN 2.0: cabeza del montacargas)', note: 'La polea va aparte, centrada en x 15, y 14.', state: 'nuevo' },
  ...[0, 1, 2].map((f) => ({ file: `pulley_f${f}.png`, cv: () => pulleySprite(f), src: `pulleySprite(${f})`, marker: 'nuevo', note: 'Gira solo con el montacargas en marcha (120 ms por fotograma).', state: 'nuevo' })),
  { file: 'bed.png', cv: bed3, src: 'bed3()', marker: 'icons.js · cama de la Mouse House', note: 'Secuencia aprobada: drawBedFrame (ev4).', state: 'congelado' },
  { file: 'pillow.png', cv: pillow3, src: 'pillow3()', marker: 'icons.js · cama', note: '', state: 'congelado' },
  { file: 'tree_big.png', cv: () => tree(1).canvas(), src: 'tree(1)', marker: 'fondo', note: '', state: 'congelado' },
  { file: 'tree_small.png', cv: () => tree(0).canvas(), src: 'tree(0)', marker: 'fondo', note: '', state: 'congelado' },
  ...[0, 1, 2].map((s) => ({ file: `bush_${s}.png`, cv: () => bush(s).canvas(), src: `bush(${s})`, marker: 'fondo', note: '', state: 'congelado' })),
  { file: 'fence.png', cv: () => fence(3).canvas(), src: 'fence(3)', marker: 'fondo', note: '', state: 'congelado' },
  { file: 'bench.png', cv: () => bench().canvas(), src: 'bench()', marker: 'fondo', note: '', state: 'congelado' },
  { file: 'lamp.png', cv: () => lampPost().canvas(), src: 'lampPost()', marker: 'fondo', note: 'Su luz es VFX (vfxGlow).', state: 'congelado' },
  { file: 'sign.png', cv: signPost2, src: 'signPost2()', marker: 'fondo', note: 'Rehecho sin tinta dentro.', state: 'adaptado' },
  { file: 'crate_raw.png', cv: () => crateSprite('#e08a2e'), src: "crateSprite('#e08a2e')", marker: 'bodega', note: '', state: 'nuevo' },
  { file: 'crate_base.png', cv: () => crateSprite('#efe6c4'), src: "crateSprite('#efe6c4')", marker: 'bodega', note: '', state: 'nuevo' },
  { file: 'crate_cheese.png', cv: () => crateSprite(PAL.chz[1]), src: 'crateSprite(chz)', marker: 'bodega', note: '', state: 'nuevo' },
  { file: 'surface_bg.png', cv: () => { const c = document.createElement('canvas'); c.width = SW1; c.height = SH1; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintSurface(g); return c; }, src: 'paintSurface()', marker: 'fondo', note: `Cielo, colinas, terreno, caminos, madriguera, bodega y pozo: ${SW1} × ${SH1}. Suelo en y = ${GH1} (casa), ${GL1} (laboratorio) y ${GR1} (mercado).`, state: 'nuevo' },
];
window.B1_EXPORT = EXPORT;

PP(`<b>Bloque 1 de producción.</b> Arriba, el inventario hasta Brie, corto. Después, la superficie terminada y montada: todos los edificios con sus evoluciones, el pueblo, el subsuelo con la cama aprobada y los VFX nuevos sin contorno. Al final, lo que se entrega para integrar: ${EXPORT.length} PNG a 1:1 con su manifiesto.`);

// ================= INVENTARIO =================
H2('I', 'INVENTARIO HASTA BRIE', 'Qué está, qué falta y qué hace falta para integrarlo. Por bloques.');
TB(['', 'APROBADO Y CONGELADO', 'PENDIENTE DE PRODUCCIÓN', 'PENDIENTE DE ADAPTACIÓN', 'NECESARIO PARA INTEGRAR'], [
  ['<b>1 · Superficie</b>', 'HOUSE I–III · LAB I–IV · la cama y su secuencia · árboles, matas, valla, banco y farola', '<b>Hecho en esta entrega:</b> SHOP en sus 6 aspectos · PANTRY · castillete y polea · bodega · pueblo y subsuelo', '<b>Hecho:</b> poste indicador · Z de dormir sin contorno', '<b>Hecho:</b> PNG 1:1 y manifiesto con anclas y capas'],
  ['<b>2 · Cheddar</b>', 'REFINE B (fases I–III y BOOST) · DRILL V4.1 y su BOOST · estados de la roca (grietas c0–c4, veta v1–v5) · pico aprobado', 'Módulos BOOST de MINE, CHEESE y SELL · fondo del capítulo · andamio del minero', 'CHEESE (taller de V4.1) a las reglas de contorno · cartel de profundidad · chispas y polvo sin contorno', 'Recorrido del montacargas · fotogramas de trabajo por oficio · PNG y manifiesto'],
  ['<b>3 · Gouda</b>', 'Icono de Raw, Base y lote · grietas c0 de la roca', 'Grietas c1–c4 y veta v1–v5 de la roca · fondo del capítulo', 'Las mismas máquinas con los materiales de Gouda (muestra ya aprobada como dirección)', 'PNG y manifiesto'],
  ['<b>4 · Brie</b>', 'Icono de Raw, Base y lote', 'Roca entera (grietas y veta) · fondo del capítulo', 'Las mismas máquinas con los materiales de Brie', 'PNG y manifiesto'],
  ['<b>5 · Compartido</b>', 'Ratones oficiales y sus poses · gema de BOOST en su engaste · iconos de recursos y moneda · dirección de bocadillos', 'Jaula y cable del montacargas entre capítulos', 'Bocadillos y placas al tratamiento final · fichas de recurso en camino · VFX existentes con contorno (chispas, Z, destellos)', 'Escala por densidad de pantalla · presupuesto de rendimiento en móvil'],
  ['<b>6 · QA y entrega</b>', '—', '—', '—', 'Revisión en Chrome de Android y Safari de iOS reales · lista de mejoras secundarias'],
]);

// ================= SUPERFICIE =================
H2('S', 'LA SUPERFICIE TERMINADA', 'A tamaño real de móvil: desliza hacia los lados (la pantalla ve unos 160 px de arte de los 432). Los selectores cambian la fase de cada edificio.');
const ctl = DIV('b1-ctl');
const sel = (label, key, opts) => { const l = document.createElement('label'); l.innerHTML = `<span>${label}</span>`; const s = document.createElement('select'); for (const [v, n] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = n; if (+v === STATE[key]) o.selected = true; s.appendChild(o); } s.onchange = () => { STATE[key] = +s.value; }; l.appendChild(s); ctl.appendChild(l); };
sel('HOUSE', 'house', [[1, 'I'], [2, 'II'], [3, 'III']]);
sel('LAB', 'lab', [[1, 'I'], [2, 'II'], [3, 'III'], [4, 'IV']]);
sel('SHOP', 'shop', [0, 1, 2, 3, 4, 5].map((t) => [t, `aspecto ${t}`]));
sel('Lotes', 'lots', [0, 1, 2, 3, 4].map((t) => [t, String(t)]));
{ const l = document.createElement('label'); l.innerHTML = '<span>Montacargas</span>'; const b = document.createElement('input'); b.type = 'checkbox'; b.checked = true; b.onchange = () => { STATE.lift = b.checked; }; l.appendChild(b); ctl.appendChild(l); }
const scroller = DIV('b1-scroll'); const sc = document.createElement('canvas'); sc.width = SW1 * MK; sc.height = SH1 * MK; sc.style.width = Math.round(SW1 * KPX) + 'px'; sc.style.height = Math.round(SH1 * KPX) + 'px'; scroller.appendChild(sc);
const bgCache = (() => { const c = document.createElement('canvas'); c.width = SW1; c.height = SH1; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintSurface(g); return c; })();
setInterval(() => { const now = performance.now(), g = sc.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(bgCache, 0, 0); drawSurface(g, now, { house: STATE.house, lab: STATE.lab, shop: STATE.shop, lift: STATE.lift, lots: STATE.lots }); }, 33);
requestAnimationFrame(() => { scroller.scrollLeft = 0; });
UL([
  '<b>De izquierda a derecha:</b> la casa en su colina; el laboratorio en el altozano, con el hueco reservado de FORBIDDEN GENETICS a su izquierda; y el mercado: tienda, despensa y castillete. El pozo del castillete baja por el borde inferior hacia Cheddar: es la unión con el bloque 2.',
  '<b>Subsuelo:</b> la madriguera bajo la casa, una habitación acogedora (revoco cálido, zócalo de madera, cuadro, balda con libros, aplique con luz y alfombra) con la cama y la secuencia aprobada tal cual; el ratón aparece en el hueco de la puerta saliendo de la oscuridad y se va por él del mismo modo (el marco queda siempre detrás); la bodega bajo la despensa, con las cajas por color de recurso; y el pozo.',
  '<b>Ratones:</b> el tendero tras el mostrador, el investigador en la puerta del laboratorio con su libro y el ratón sin puesto en la cama. Solo poses aprobadas.',
  '<b>Cada edificio crece sin moverse:</b> la casa conserva su cuerpo en el mismo sitio de la fase I a la III (la torre se añade a la izquierda), y la tienda añade piezas sobre la misma base.',
]);

// ================= PIEZAS =================
H2('P', 'LAS PIEZAS', 'Todas a 3×, con su contorno de 1 px por fuera y el volumen por masas.');
H3('SHOP: los seis aspectos del juego');
function shopSheet() { const k = 3, W = 6 * 78, H = 62, [c, g0] = SHEET(W * k, H * k + 26); const o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#7a9a8e'; g.fillRect(0, 0, W, H); for (let t = 0; t < 6; t++) { const x = 2 + t * 78; g.drawImage(shopBack(t), x, 2); shopFlag(g, x + 4, 3, t, 0); g.drawImage(mF(CREW.town.keeper, 0, false, {}), x + 19, 2 + 28); g.drawImage(shopFront(t), x, 2); shopLots(g, x, 2, Math.min(4, t)); } g0.fillStyle = '#2a1d14'; g0.fillRect(0, 0, c.width, c.height); g0.drawImage(o, 0, 26, W * k, H * k); g0.font = '700 13px system-ui, sans-serif'; g0.fillStyle = '#f4ead8'; ['0 · puesto', '1 · cartel', '2 · toldo doble', '3 · banderín y farol', '4 · segundo puesto', '5 · mostrador dorado'].forEach((n, i) => g0.fillText(n, (2 + i * 78) * k, 18)); }
shopSheet();
UL([
  '<b>Los seis aspectos son los del juego real</b> (<code>visualTier</code> de Trading: 0, 3, 8, 16, 30 y 50 rangos de potencia): cartel, toldo doble, banderín y farol, segundo puesto y mostrador dorado, con los colores de toldo que ya usa <code>drawShop</code>. No se inventa ninguno.',
  '<b>Dos capas:</b> el fondo de la tienda y el mostrador, para que el tendero quede detrás. Los lotes (hasta 4, como en el juego) van en los lados del mostrador para no taparle la cara.',
]);
H3('Resto de la superficie');
function partsSheet() {
  const k = 3, items = [['HOUSE I', houseStage(1)], ['HOUSE II', houseV3(2)], ['HOUSE III', houseV3(3)], ['LAB I', labV2(1)], ['LAB II', labV2(2)], ['LAB III', labV2(3)], ['LAB IV', labV2(4)], ['PANTRY', pantrySprite2()], ['CASTILLETE', headframe2()], ['POLEA ×3', (() => { const c = document.createElement('canvas'); c.width = 45; c.height = 13; const g = c.getContext('2d'); for (let f = 0; f < 3; f++) g.drawImage(pulleySprite(f), f * 16, 0); return c; })()]];
  const rows = [items.slice(0, 3), items.slice(3, 7), items.slice(7)], [c, g] = SHEET(1180, 3 * (82 * k + 30) + 10); g.fillStyle = '#5a7a48'; g.fillRect(0, 0, c.width, c.height); g.font = '700 12px system-ui, sans-serif'; g.fillStyle = '#ffffff';
  rows.forEach((row, r) => { let x = 8; const base = (r + 1) * (82 * k + 30) - 14; for (const [n, cv] of row) { g.drawImage(cv, x, base - cv.height * k, cv.width * k, cv.height * k); g.fillText(n, x, base + 14); x += cv.width * k + 24; } });
}
partsSheet();
UL([
  '<b>PANTRY</b> (la Storage del juego): almacén de tablas rojas, tejado de pizarra, buhardilla con polea y caja colgada, portón y cajas por color de recurso. Rehecho con las reglas de contorno: en la revisión anterior cada pieza llevaba su propio marco de tinta.',
  '<b>Castillete:</b> la cabeza del montacargas, encima del pozo de Cheddar. La polea va aparte, en tres fotogramas, y solo gira con el montacargas en marcha.',
  '<b>Congelados y sin tocar:</b> HOUSE I–III y LAB I–IV, como los aprobaste.',
]);

// ================= VFX =================
H2('V', 'VFX SIN CONTORNO', 'La regla nueva aplicada a todos los efectos de la superficie.');
{ const R = DIV('ev-cards'); const vcard = (title, w, h, draw, cap) => { const f = document.createElement('figure'); f.className = 'ev-card'; const c = document.createElement('canvas'); c.width = w * MK; c.height = h * MK; c.style.width = Math.round(w * 3.5) + 'px'; c.style.maxWidth = '100%'; c.style.height = 'auto'; f.innerHTML = `<div class="ev-ct"><b>${title}</b></div>`; f.appendChild(c); const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.appendChild(fc); R.appendChild(f); setInterval(() => { const g = c.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; draw(g, performance.now()); }, 33); };
  vcard('Humo de chimenea', 40, 40, (g, t) => { g.fillStyle = '#7c92c0'; g.fillRect(0, 0, 40, 40); vfxSmoke(g, 14, 34, t); }, 'Tres bocanadas en dos grises lila, que crecen y se desvanecen.');
  vcard('Luz cálida', 40, 40, (g, t) => { g.fillStyle = '#3a4a6a'; g.fillRect(0, 0, 40, 40); g.drawImage(lampPost().canvas(), 17, 10); vfxGlow(g, 20, 13, 10, t); }, 'Halo en tres discos con transparencia; late muy despacio.');
  vcard('Burbujas', 40, 40, (g, t) => { g.fillStyle = '#c4ecfc'; g.fillRect(0, 0, 40, 40); vfxBubbles(g, 20, 28, t); }, 'Del experimento del laboratorio.');
  vcard('Z de dormir', 40, 40, (g, t) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 40, 40); vfxZzz(g, 12, 26, t); }, 'Sin contorno: letra clara con una sombra de tono medio. Sustituye a las Z con contorno también en la secuencia de la cama.');
}
UL(['<b>Ningún efecto lleva tinta:</b> humo, luces, burbujas, Z y el banderín de la tienda usan sus propios colores, tonos y transparencia. Las sombras de contacto de los edificios son una sombra, no un contorno.', '<b>Los VFX existentes de los bloques siguientes</b> (chispas, polvo y destellos de las máquinas) se revisan en su bloque con esta misma regla.']);

// ================= ENTREGA =================
H2('E', 'ENTREGA PARA INTEGRAR', 'Lo que ya está en exploracion/pixel/out/main2/superficie.');
TB(['ARCHIVO', 'TAMAÑO', 'SALE DE', 'SUSTITUYE A', 'NOTA'], EXPORT.map((e) => { const cv = e.cv(); return [`<code>${e.file}</code>`, `${cv.width} × ${cv.height}`, `<code>${e.src}</code>`, e.marker, e.note]; }));
UL([
  '<b>Formato:</b> PNG a 1:1 (un píxel de arte, un píxel del archivo), fondo transparente. El juego los escala por un entero según la densidad de la pantalla.',
  '<b>Ancla:</b> abajo a la izquierda, con la fila de abajo apoyada en el suelo. El manifiesto (<code>manifest.json</code>) da para cada archivo su tamaño, de qué función sale, a qué marca <code>SPRITE:</code> del juego sustituye y su estado (congelado, nuevo o adaptado).',
  '<b>Lo que no es PNG:</b> los ratones (el juego ya los genera por código, con su pelo, sombrero y bufanda; la pose acurrucada se porta como plantilla), la secuencia de la cama (<code>drawBedFrame</code>) y los VFX (código, porque se animan). Van en las fuentes de <code>main2-src</code>.',
  '<b>Cómo se regenera:</b> <code>python3 main2-src/b1/build.py</code> monta esta página; la exportación sale de la lista <code>B1_EXPORT</code> de la propia página.',
]);
H3('Anotado para QA final (secundario, no bloquea)');
UL([
  'El hueco de FORBIDDEN GENETICS está vacío: cuando se diseñe, cabe a la izquierda del laboratorio sin mover nada.',
  'De noche: las ventanas de las casas podrían encenderse con el mismo halo de luz. Solo si el juego llega a tener noche.',
  'La farola está junto al banco del laboratorio; si el mercado necesita más luz, puede ir otra entre la despensa y el castillete.',
]);
H2('→', 'SIGUIENTE', 'Bloque 2 · Cheddar: máquinas, roca, entorno, animaciones de trabajo y los módulos BOOST que faltan (MINE, CHEESE y SELL), con la regla de VFX.');
