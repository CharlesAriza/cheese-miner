// ---------- BLOQUE 5 · SISTEMAS COMPARTIDOS · la página ----------
const MK = 7;
const EXPORT5 = [
  { file: 'cage_back.png', cv: cageBack, src: 'cageBack()', marker: 'nuevo · montacargas', note: 'Marco, techo con argolla, fondo y suelo de la jaula. Las ruedas van entre las dos capas.', state: 'nuevo' },
  { file: 'cage_front.png', cv: cageFront, src: 'cageFront()', marker: 'nuevo · montacargas', note: 'Barrotes delante de la carga.', state: 'nuevo' },
  { file: 'bubble_9slice.png', cv: bubble9, src: 'bubble9()', marker: 'bocadillo de diálogo', note: '9 cortes: 3 px por lado (border-image-slice: 3).', state: 'nuevo' },
  { file: 'bubble_tail.png', cv: bubbleTail, src: 'bubbleTail()', marker: 'bocadillo de diálogo', note: 'Punta hacia abajo; se gira 90° para los lados.', state: 'nuevo' },
  { file: 'plate_amber_9slice.png', cv: () => plate9(false), src: 'plate9(ámbar)', marker: 'placa de máquina', note: '9 cortes: 3 px por lado. Avisos de máquina.', state: 'nuevo' },
  { file: 'plate_red_9slice.png', cv: () => plate9(true), src: 'plate9(roja)', marker: 'placa de máquina', note: 'Máquina parada.', state: 'nuevo' },
  { file: 'plate_chain.png', cv: chainSprite, src: 'chainSprite()', marker: 'placa de máquina', note: 'Se repite en vertical hasta el punto que señala.', state: 'nuevo' },
  ...['warn', 'stop', 'ok'].map((k) => ({ file: `badge_${k}.png`, cv: () => badge(k), src: `badge('${k}')`, marker: 'icons.js · aviso de roca', note: { warn: 'Necesita algo (ámbar).', stop: 'Parado (rojo).', ok: 'Listo (verde).' }[k], state: 'nuevo' })),
];
window.B5_EXPORT = EXPORT5;
const urlOf = (cv) => cv.toDataURL('image/png');

PP(`<b>Bloque 5 de producción.</b> La columna del MVP montada de verdad: superficie, Cheddar, Gouda y Brie, una debajo de otra, unidas por el montacargas. Y el kit de bocadillos, placas e insignias en pixel art para la interfaz. ${EXPORT5.length} PNG nuevos con su manifiesto.`);

// ================= LA COLUMNA =================
H2('C', 'LA COLUMNA DEL MVP', 'A tamaño real de móvil: desliza hacia abajo, de la superficie a Brie. La jaula baja hasta Brie y sube recogiendo el queso de cada roca.');
const wrap = DIV('b5-col'); const col = document.createElement('div'); col.className = 'b5-stack'; wrap.appendChild(col);
const sc = document.createElement('canvas'); sc.width = STACK.w * MK; sc.height = STACK.h * MK; sc.style.width = Math.round(STACK.w * KPX) + 'px'; sc.style.height = Math.round(STACK.h * KPX) + 'px'; col.appendChild(sc);
const mk = () => document.createElement('canvas'), cv3 = { surf: Object.assign(mk(), { width: SW1, height: SH1 }), ched: mk(), gouda: mk(), brie: mk() }, buf = Object.assign(mk(), { width: STACK.w, height: STACK.h });
for (let i = 0; i < 300; i++) step41(16);
// Interfaz encima (HTML, como en el juego): un bocadillo del quesero de Cheddar, una placa en la perforadora de Gouda y las
// insignias de estado de cada capítulo. Se colocan en coordenadas de arte × 7/3.
const css = document.createElement('style');
css.textContent = `.b5-bub{position:absolute;padding:3px 6px;font:700 10px/1.25 system-ui,sans-serif;color:#1b1220;border-style:solid;border-width:6px;border-image:url(${urlOf(bubble9())}) 3 fill / 6px stretch;image-rendering:pixelated;white-space:nowrap}
.b5-bub::after{content:'';position:absolute;left:10px;bottom:-15px;width:14px;height:12px;background:url(${urlOf(bubbleTail())}) 0 0/14px 12px;image-rendering:pixelated}
.b5-plate{position:absolute;padding:2px 6px;font:700 9px/1.2 system-ui,sans-serif;color:#3a1c06;letter-spacing:.04em;border-style:solid;border-width:6px;border-image:url(${urlOf(plate9(false))}) 3 fill / 6px stretch;image-rendering:pixelated;white-space:nowrap}
.b5-plate.red{color:#fff2ee;border-image-source:url(${urlOf(plate9(true))})}
.b5-plate::before{content:'';position:absolute;left:50%;top:-22px;width:6px;height:16px;margin-left:-3px;background:url(${urlOf(chainSprite())}) 0 0/6px 16px repeat-y;image-rendering:pixelated}
.b5-badge{position:absolute;width:21px;height:21px;image-rendering:pixelated}`;
document.head.appendChild(css);
const at = (el, x, y) => { el.style.left = Math.round(x * KPX) + 'px'; el.style.top = Math.round(y * KPX) + 'px'; col.appendChild(el); return el; };
{ const b = document.createElement('div'); b.className = 'b5-bub'; b.textContent = 'Batch ready!'; at(b, 104, STACK.y.cheddar + 28); }
{ const p = document.createElement('div'); p.className = 'b5-plate'; p.textContent = 'NO VEIN'; at(p, 52, STACK.y.gouda + 66); }
{ const p = document.createElement('div'); p.className = 'b5-plate red'; p.textContent = 'STOPPED'; at(p, 4, STACK.y.brie + 4); }
for (const [z, k] of [['cheddar', 'ok'], ['gouda', 'warn'], ['brie', 'stop']]) { const i = document.createElement('img'); i.className = 'b5-badge'; i.src = urlOf(badge(k)); i.alt = ''; at(i, 2, STACK.y[z] + 2); }
let lastT = 0;
setInterval(() => { const now = performance.now(); step41(50); const g = buf.getContext('2d'); g.imageSmoothingEnabled = false; drawStack(g, now, cv3); const o = sc.getContext('2d'); o.setTransform(MK, 0, 0, MK, 0, 0); o.imageSmoothingEnabled = false; o.drawImage(buf, 0, 0); }, 50);
UL([
  '<b>Cómo encaja:</b> cada capítulo (161 px, el ancho del móvil) se coloca bajo el mercado del pueblo, desde x = 254. Así el centro de la polea del castillete cae justo entre los dos cables del pozo de cada capítulo, y el pozo baja recto de la superficie a Brie.',
  '<b>El montacargas:</b> una sola jaula para todo el pozo. Baja hasta Brie, carga su rueda, sube parando en Gouda y en Cheddar, descarga arriba y las ruedas entran en la despensa. En cada rellano espera la rueda de su queso: blanca en Brie, de cera roja en Gouda, ámbar en Cheddar. La polea del castillete gira solo mientras la jaula se mueve, y el farol de la jaula se enciende en marcha (su luz va sin contorno).',
  '<b>Para integrar:</b> el pozo de V4.1 está pegado al borde derecho del capítulo, así que en esta vista a ancho de móvil el castillete queda cortado 9 px por la derecha; en el pueblo, que se desliza, se ve entero. Si se quiere entero también aquí, hay que separar el pozo del borde en los tres capítulos; lo anoto para QA en vez de moverlo ahora.',
  '<b>Simulación:</b> los tres capítulos usan la de Cheddar (es una demostración visual) y el montacargas sigue un guion fijo; al integrar, los dos los mueve el juego.',
]);
TB(['TRAMO', 'DESDE → HASTA', 'DURACIÓN'], LIFT_T.map(([k, a, b, ms]) => [{ down: 'Baja', up: 'Sube', load: 'Carga', unload: 'Descarga' }[k], a === b ? a : `${a} → ${b}`, (ms / 1000).toFixed(1) + ' s']));

// ================= KIT DE INTERFAZ =================
H2('K', 'BOCADILLOS, PLACAS E INSIGNIAS', 'La dirección aprobada en la revisión de arte, cerrada como piezas de 9 cortes en pixel art.');
function kitSheet() { const k = 6, [c, g] = SHEET(980, 150); g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, c.width, c.height); g.font = '700 12px system-ui, sans-serif'; g.fillStyle = '#f4ead8'; let x = 10; for (const [n, cv] of [['Bocadillo (9 cortes)', bubble9()], ['Punta', bubbleTail()], ['Placa ámbar', plate9(false)], ['Placa roja', plate9(true)], ['Cadena', chainSprite()], ['Aviso', badge('warn')], ['Parado', badge('stop')], ['Listo', badge('ok')]]) { g.fillText(n, x, 18); g.drawImage(cv, x, 30, cv.width * k, cv.height * k); x += Math.max(cv.width * k, 70) + 22; } }
kitSheet();
UL([
  '<b>Bocadillo:</b> crema con 1 px de tinta, esquinas recortadas y una línea de sombra clara abajo; la punta va aparte (abajo, o girada para los lados). Para lo que dicen los ratones.',
  '<b>Placa de máquina:</b> chapa ámbar remachada colgada de una cadena; la roja es para «parada». Para lo que le pasa a una máquina (sin veta, falta Base, parada). Se distingue del bocadillo a primera vista: no habla nadie.',
  '<b>Insignia:</b> el estado pequeño de un capítulo o un puesto: ámbar necesita algo, rojo parado, verde listo.',
  '<b>Cómo se usan:</b> el juego ya pinta su interfaz en HTML; las piezas se estiran con <code>border-image</code> a escala entera (6 px por cada 3 de arte en esta página), como en la columna de arriba. El texto es el del juego, en inglés.',
]);
H3('CSS de ejemplo');
{ const pre = document.createElement('pre'); pre.className = 'b5-code'; pre.textContent = `.bubble { border: 6px solid; border-image: url(bubble_9slice.png) 3 fill / 6px stretch; image-rendering: pixelated; }
.bubble::after { /* bubble_tail.png, 14 × 12 px, bajo el bocadillo */ }
.plate { border: 6px solid; border-image: url(plate_amber_9slice.png) 3 fill / 6px stretch; image-rendering: pixelated; }
.plate.stopped { border-image-source: url(plate_red_9slice.png); }`; COL.appendChild(pre); }

// ================= ENTREGA =================
H2('E', 'ENTREGA PARA INTEGRAR', 'En exploracion/pixel/out/main2/compartido, con su manifest.json (incluye el guion del montacargas y la alineación).');
TB(['ARCHIVO', 'TAMAÑO', 'SALE DE', 'PARA', 'NOTA'], EXPORT5.map((e) => { const cv = e.cv(); return [`<code>${e.file}</code>`, `${cv.width} × ${cv.height}`, `<code>${e.src}</code>`, e.marker, e.note]; }));
UL([
  '<b>Revisado y anotado para QA:</b> las fichas de recurso que viajan (Raw, Base, ruedas) llevan contorno porque son objetos, no efectos; la columna recorta el castillete 9 px; el pico dorado del jugador (Sharper Pick 16) está pendiente; las fases de las máquinas se notan poco.',
]);
H2('→', 'SIGUIENTE', 'Bloque 6 · QA y entrega: coherencia visual, escalas, animaciones, piezas editables y compatibilidad con el móvil, antes de integrar sobre el juego real.');
