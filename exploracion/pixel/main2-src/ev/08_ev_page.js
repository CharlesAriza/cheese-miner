adReady(() => {
const COL = $c('ad-col');
const H2 = (id, t, p) => { const h = document.createElement('h2'); h.id = id; h.textContent = t; COL.appendChild(h); const a = document.createElement('a'); a.href = '#' + id; a.textContent = t.split(' · ')[0]; $c('ad-toc').appendChild(a); if (p) PP(p); return h; };
const PP = (html, el = COL) => { const q = document.createElement('p'); q.innerHTML = html; el.appendChild(q); return q; };
const H3 = (t) => { const h = document.createElement('h3'); h.textContent = t; COL.appendChild(h); return h; };
const UL = (items, el = COL) => { const u = document.createElement('ul'); u.innerHTML = items.map((x) => `<li>${x}</li>`).join(''); el.appendChild(u); return u; };
const DIV = (cls, el = COL) => { const d = document.createElement('div'); d.className = cls; el.appendChild(d); return d; };
const SHEET = (w, h, el = COL) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.className = 'ad-sheet'; el.appendChild(c); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
// Tabla con celdas de texto o de nodo (miniaturas).
function TB(head, rows, el = COL) { const w = DIV('ad-tw', el), t = document.createElement('table'); t.className = 'ad-tb'; t.innerHTML = `<tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>`; for (const r of rows) { const tr = document.createElement('tr'); for (const x of r) { const td = document.createElement('td'); if (x instanceof Node) td.appendChild(x); else td.innerHTML = x ?? ''; tr.appendChild(td); } t.appendChild(tr); } w.appendChild(t); return w; }
// Piezas sobre una misma línea de suelo y a la misma escala, con su nombre.
function lineup(g, items, k, x0, base, gap = 8, shadow = true) { g.font = '700 13px system-ui, sans-serif'; g.textAlign = 'center'; let x = x0; for (const [label, cv, sub] of items) { const w = cv.width * k; if (shadow) { g.globalAlpha = 0.3; g.fillStyle = '#000'; g.fillRect(x + 2 * k, base, w - 4 * k, k); g.globalAlpha = 1; } g.drawImage(cv, x, base - cv.height * k, w, cv.height * k); g.fillStyle = '#f4ead8'; g.fillText(label, x + w / 2, base + 22); if (sub) { g.font = '12px system-ui, sans-serif'; g.fillStyle = '#b8b0c8'; g.fillText(sub, x + w / 2, base + 38); g.font = '700 13px system-ui, sans-serif'; } x += w + gap * k; } return x; }
const crop = (src, r, top = 0) => { const c = document.createElement('canvas'); c.width = r[2]; c.height = r[3]; c.getContext('2d').drawImage(src, r[0], r[1] - top, r[2], r[3], 0, 0, r[2], r[3]); return c; };
const big = (cv, k = 2, max) => { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); c.style.width = Math.min(max || 1e9, cv.width * k) + 'px'; return c; };
// ---------- EVOLUCIÓN Y BOOST · la página ----------
const MK = 7; // píxeles de pantalla por píxel de arte en un móvil de DPR 3 (2,33 px CSS)
// Tarjeta animada a tamaño real de móvil: el lienzo va a 7 px por píxel de arte y se enseña a 2,33 px CSS.
const CARDS = [];
function card(parent, title, w, h, draw, { tag = '', cap = '', chip = '' } = {}) {
  const f = document.createElement('figure'); f.className = 'ev-card';
  const c = document.createElement('canvas'); c.width = w * MK; c.height = h * MK; c.style.width = Math.round(w * KPX) + 'px'; c.style.height = Math.round(h * KPX) + 'px';
  f.innerHTML = `<div class="ev-ct"><b>${title}</b>${chip ? `<i class="ev-chip">${chip}</i>` : ''}${tag ? `<em class="ev-tag">${tag}</em>` : ''}</div>`; f.appendChild(c);
  if (cap) { const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.appendChild(fc); }
  parent.appendChild(f); CARDS.push({ c, w, h, draw }); return f;
}
const CARDROW = () => DIV('ev-cards');
setInterval(() => { const t = performance.now(); for (const k of CARDS) { const g = k.c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.setTransform(MK, 0, 0, MK, 0, 0); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, k.w, k.h); k.draw(g, t); } }, 33);
// Fondo de las tarjetas: pared de la caverna lejana y suelo, sin contorno (el fondo no lleva tinta).
const cave = (g, w, h, floor) => { g.fillStyle = '#2e2118'; g.fillRect(0, 0, w, h); for (let i = 0; i < (w * h) / 40; i++) { g.fillStyle = hh2(i, 3) < 0.5 ? '#271b13' : '#35271c'; g.fillRect(Math.floor(hh2(i, 1) * w), Math.floor(hh2(i, 2) * floor), 3, 1); } g.fillStyle = '#4e3826'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#6a4c30'; g.fillRect(0, floor, w, 1); };
const sky = (g, w, h, floor) => { const B = ['#5a6ea6', '#6a80b4', '#7c92c0', '#94a8cc']; B.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, (i * floor) / 4, w, floor / 4 + 1); }); g.fillStyle = '#5a9038'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#7cb44c'; g.fillRect(0, floor, w, 2); g.fillStyle = '#8a6a44'; g.fillRect(0, floor + 4, w, h - floor - 4); };
const shadowAt = (g, x, y, w) => { g.globalAlpha = 0.3; g.fillStyle = '#000'; g.fillRect(x + 2, y, w - 4, 1); g.fillRect(x + 4, y + 1, w - 8, 1); g.globalAlpha = 1; };
const mouseAt = (g, m, x, feet, t, o = {}, flip = false, dy = 0) => { const br = Math.floor((t + m.name.length * 431) / 650) % 2, bl = (t + m.name.length * 997) % 3300 < 110, cv = mF(m, o.legs ? 0 : br, bl, o); if (flip) { g.save(); g.translate(x + 22, feet - 20 + dy); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20 + dy); };

PP('<b>Qué hay aquí.</b> Las cinco piezas que pediste antes de volver a integrar MAIN 2.0. Las tarjetas animadas van a <b>tamaño real de móvil</b> (2,33 px CSS por píxel de arte, como la colonia en un iPhone); las hojas grandes, a 3–4× para inspeccionar. Nada toca el juego, la economía ni el guardado.');

// ================= A · CONTORNOS =================
H2('A', 'A · CONTORNOS Y PIXEL ART', 'De dónde salía el doble relieve y cómo queda corregido en HOUSE, LAB y una máquina de Cheddar (REFINE).');
UL([
  '<b>La causa:</b> cada pieza se construía como una caja con su propio canto de tinta y su propio bisel (luz arriba e izquierda, sombra abajo y derecha). Al final se añadía el contorno exterior por fuera de esos cantos. Resultado: <b>2 px de tinta</b> en todo el borde y un marco claro-oscuro alrededor de cada tabla, piedra, ventana y herraje.',
  '<b>La corrección</b> (la regla de los ratones): <b>1 px de tinta solo por fuera</b> de la silueta. Dentro, líneas con el tono más oscuro de cada material, con jerarquía: tinta (silueta) > tono 4 (huecos y separaciones grandes) > tono 3 (juntas). El volumen sale de la luz de la masa entera, no de cada pieza. Una sola sombra de contacto, en el suelo.',
  '<b>Se conserva</b> el contorno grueso de Pulido+: es el de 1 px de arte, que en el móvil mide 2,3 px, igual que el de los ratones.',
]);
const OLDREF = () => evArt('oldref', () => { const c = document.createElement('canvas'); c.width = 64; c.height = 44; const g = c.getContext('2d'); g.drawImage(artFurnace(), 0, 4); g.drawImage(artStill(), 28, 8); g.drawImage(artTray(), 47, 36); return c; });
const NEWREF = () => evArt('newref', () => { const c = document.createElement('canvas'); c.width = 68; c.height = 56; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; drawRefine(g, 0, 0, 1, 0, true, 1000, 0.5, 2, 0); return c; });
function diag(cv) { const r = doubleInk(cv), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'); g.drawImage(cv, 0, 0); g.fillStyle = '#ff2a6a'; for (const [x, y] of r.bad) g.fillRect(x, y, 1, 1); return [c, r]; }
function contourSheet() {
  const pairs = [['HOUSE', houseSprite().canvas(), houseStage(1)], ['LAB', labSprite().canvas(), labStage(3)], ['REFINE', OLDREF(), NEWREF()]];
  const k = 4, rowH = pairs.map(([, b, a]) => Math.max(b.height, a.height) * k + 44), [c, g] = SHEET(1000, rowH.reduce((a, b) => a + b, 0) + 10); g.fillStyle = '#211a26'; g.fillRect(0, 0, c.width, c.height); g.font = '700 13px system-ui, sans-serif';
  pairs.forEach(([n, before, after], i) => {
    const y0 = 10 + rowH.slice(0, i).reduce((a, b) => a + b, 0), [dB, rB] = diag(before), [dA, rA] = diag(after), m = mouseCanvas(CREW.town.keeper, 0, false, {});
    g.fillStyle = '#f4ead8'; g.fillText(`${n} · antes (${rB.bad.length} px de doble contorno, en rosa)`, 10, y0 + 14); g.fillText(`${n} · después (${rA.bad.length} px)`, 520, y0 + 14);
    g.imageSmoothingEnabled = false; g.drawImage(dB, 10, y0 + 24, before.width * k, before.height * k); g.drawImage(after, 520, y0 + 24, after.width * k, after.height * k);
    g.drawImage(m, 520 + after.width * k + 10, y0 + 24 + after.height * k - 80, 88, 80);
  });
}
contourSheet();
PP('<span class="ad-cap">A 4×. En rosa, la tinta que forma un segundo anillo pegado al contorno: es el doble borde. A la derecha, el mismo edificio con el tratamiento corregido y un ratón oficial a la misma escala.</span>');
H3('A tamaño real de móvil (2,33 px CSS por píxel de arte), junto a un ratón oficial');
{ const R = CARDROW(); for (const [n, cvF] of [['HOUSE antes', () => houseSprite().canvas()], ['HOUSE después', () => houseStage(1)], ['LAB antes', () => labSprite().canvas()], ['LAB después', () => labStage(3)], ['REFINE antes', OLDREF], ['REFINE después', NEWREF]]) { const cv = cvF(), w = cv.width + 28, h = Math.max(cv.height, 20) + 8; card(R, n, w, h, (g, t) => { sky(g, w, h, h - 4); shadowAt(g, 2, h - 4, cv.width); g.drawImage(cv, 2, h - 4 - cv.height); mouseAt(g, CREW.town.keeper, cv.width + 4, h - 4, t); }); } }
TB(['', 'ANTES', 'DESPUÉS'], [
  ['Contorno exterior', '2 px de tinta (canto de cada pieza + contorno añadido)', '1 px de tinta, solo por fuera, como los ratones'],
  ['Líneas interiores', 'Tinta en cada pieza: todas pesan igual', 'Tono 4 para huecos y separaciones grandes; tono 3 para juntas'],
  ['Volumen', 'Bisel en cada tabla, piedra y herraje (el «doble relieve»)', 'Luz de la masa entera: arriba e izquierda claro, derecha en trama, oclusión abajo'],
  ['Sombra de contacto', 'Dentro del sprite y en la escena (doble)', 'Solo en la escena: una fila oscura y una en trama'],
  ['Perspectiva', 'Algunas piezas vistas desde arriba (bandejas, pórtico)', 'Frente, con 1–2 px de cara superior en todo lo horizontal'],
]);

// ================= B · EVOLUCIÓN =================
H2('B', 'B · EVOLUCIÓN DE LOS EDIFICIOS', 'Tres transformaciones por edificio, no un dibujo por nivel. Cada fase dice qué la abre en el juego y si ese hito ya existe.');
const ST = { real: '<span class="ad-k keep">Progreso existente</span>', road: '<span class="ad-k adapt">Futuro del roadmap</span>', pm: '<span class="ad-k rebuild">Requiere PM</span>' };
TB(['EDIFICIO', 'QUÉ LO MUEVE HOY', 'I', 'II', 'III', 'ESTADO'], [
  ['<b>DRILL</b>', 'Aspecto del edificio por rangos de la rama POWER de Drilling (visualTier: 0 · 3 · 8 · 16 · 30 · 50).', 'Perforadora de serie (aspectos 0–1)', 'Carcasa reforzada, cuadro con manómetro (2–3)', 'Turbo Motor con radiador y correa, broca grande (4–5)', ST.real],
  ['<b>REFINE</b>', 'Igual, rama POWER de Refining (Bigger Vat, Hot Furnace).', 'Horno pequeño y alambique', 'Horno con herrajes, manómetro', 'Horno alto con fuelle, alambique grande', ST.real],
  ['<b>CHEESE</b>', 'Rama POWER de Cheesemaking; hitos Grand Wheel y Grand Master.', 'Taller con prensa de husillo', 'Segunda prensa, más moldes', 'Baldas de curado llenas; la rueda grande al abrir Grand Wheel; el sello de Grand Master', ST.real],
  ['<b>SHOP</b>', 'Rama POWER de Trading; el nivel de Trading trae mejores compradores.', 'Puesto con toldo', 'Mostrador ampliado y expositor', 'Tienda con fachada y escaparate', ST.real + ' · ampliación futura: «Vender a lo grande» (cadena de tiendas, encargos, envíos) ' + ST.road],
  ['<b>MINE</b>', 'Sharper Pick (pico dorado a los 16 rangos); Blasting Charges (se abre con Sharper Pick al máximo); tramos de profundidad de la roca.', 'Pico de hierro, corta poco honda', 'Pico dorado; bancos de la corta con entibado', 'Cargas de voladura a la vista; corta profunda con vetas', ST.real],
  ['<b>LAB</b>', 'Árbol del laboratorio: Research Assistant, Advanced Research, Strain Research (abren funciones).', 'Laboratorio modesto (se construye con 3 recetas)', 'Research Assistant: segunda planta, mesa del investigador, serpentín', 'Advanced Research: cúpula y telescopio · Strain Research: invernadero de cepas', ST.real + ' · anexo reservado para FORBIDDEN GENETICS (fusión, mutaciones y linajes: entrega C, pendiente) ' + ST.road],
  ['<b>HOUSE</b>', 'Mouse House (se construye con la primera mejora). Rangos de los ratones (cuatro). La plaza de la cama.', 'La casa y su cama', 'TRAINING ROOM a la vista cuando algún ratón llega al rango 3', 'Tablón de reclutas y buhardilla cuando hay un gerente (rango 4)', ST.real + ' (los rangos existen) · usar esos umbrales ' + ST.pm],
  ['<b>PANTRY</b>', 'Rocas abiertas (cada roca añade su queso, su Raw y su Base a la despensa sin tope).', 'Almacén con portón', 'Bodega con una balda por roca abierta y sus cajas de color', 'Montacargas de carga y segunda nave al abrir la roca 4', ST.real + ' · los umbrales ' + ST.pm],
  ['<b>Superficie</b>', 'Rocas abiertas y aspecto de SHOP.', 'Camino de tierra', 'Faroles en el camino cuando SHOP llega a II', 'Camino empedrado hasta el castillete al abrir la roca 3', ST.pm],
]);
PP('<span class="ad-cap">I, II y III agrupan los seis aspectos que el juego ya calcula (0–1, 2–3, 4–5): no hay niveles nuevos. Las piezas pequeñas (un remache, un manómetro) cambian dentro de cada fase; las transformaciones grandes, solo entre fases.</span>');
function evoSheet() {
  const k = 3, [c, g] = SHEET(1140, 600); g.fillStyle = '#36452f'; g.fillRect(0, 0, 1140, 600); g.fillStyle = '#26321f'; g.fillRect(0, 232, 1140, 40); g.fillRect(0, 556, 1140, 44);
  const m = mouseCanvas(CREW.town.idle, 0, false, {});
  lineup(g, [['RATÓN', m], ['HOUSE I', houseStage(1), 'la casa y la cama'], ['HOUSE II', houseStage(2), 'TRAINING ROOM · rango 3'], ['HOUSE III', houseStage(3), 'reclutas · rango 4']], k, 8, 232, 5);
  const x = lineup(g, [['RATÓN', m], ['LAB I', labStage(1), '3 recetas'], ['LAB II', labStage(2), 'Research Assistant'], ['LAB III', labStage(3), 'Advanced Research'], ['LAB IV', labStage(4), 'Strain Research']], k, 8, 556, 4);
  g.setLineDash([6, 5]); g.strokeStyle = '#ffcf2e'; g.strokeRect(x - 6, 556 - 52 * k, 30 * k, 52 * k); g.setLineDash([]); g.fillStyle = '#ffcf2e'; g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('Hueco reservado:', x, 556 - 52 * k + 20); g.fillText('FORBIDDEN GENETICS', x, 556 - 52 * k + 36); g.fillStyle = '#b8b0c8'; g.fillText('(entrega C, sin diseñar)', x, 556 - 52 * k + 52);
}
evoSheet();
UL([
  '<b>Por módulos:</b> cada edificio es una base más piezas que se añaden (el cobertizo, la segunda planta, la cúpula, el invernadero). Cada pieza tiene su sitio fijo, así que una fase nueva no obliga a redibujar las anteriores y el BOOST sabe dónde anclarse.',
  '<b>Las máquinas</b> (REFINE y DRILL en sus fases I y III) están en C, porque ahí se ven combinadas con el BOOST.',
]);

// ================= C · BOOST =================
H2('C', 'C · SISTEMA BOOST', 'Qué existe hoy, qué edificios lo admiten y cómo se ve potenciado cada uno, sin perder su evolución.');
TB(['QUÉ', 'EN EL JUEGO', 'CÓMO SE VE'], [
  ['<b>Refuerzo equipado</b> (BOOST)', 'Existe. Se coloca en un puesto desde BOOSTS: las cuatro etapas de cada roca abierta (MINE, DRILL, REFINE, CHEESE) y la tienda (SELL). Uno o dos por puesto. ×1,5 de velocidad cada uno (×2,25 con dos); en REFINE, ×1,5 de Base del mismo Raw. <b>Sin ratón en el puesto no hace nada.</b>', 'Esta propuesta: el módulo BOOST de cada máquina, con su gema.'],
  ['Aceleración al mantener', 'Existe: mantener el botón de una etapa la acelera a mano.', 'Es otra cosa: la máquina trabaja más rápido mientras mantienes; sin gema ni módulo.'],
  ['Mejoras de los árboles', 'Existen y son permanentes.', 'Evolución del edificio (B), no BOOST.'],
  ['LAB, HOUSE, PANTRY', '<b>No admiten refuerzo.</b>', 'Solo concepto, marcado <b>NO IMPLEMENTADO</b>.'],
]);
UL([
  '<b>Una pieza física propia de cada máquina</b> (el módulo BOOST), atornillada a la máquina y no un filtro: la columna de extracción en REFINE, la bobina turbo y el escape en DRILL.',
  '<b>La gema</b> del panel BOOSTS aprobado, en su engaste de latón, montada en la máquina: una por refuerzo. Igual que en el panel, apagada si el puesto no tiene ratón y con un destello de vez en cuando si trabaja.',
  '<b>Luz cian</b> solo donde algo está encendido (la gema, la columna, la bobina, el núcleo del fuego, las rejillas). El resto del sprite conserva sus colores: no es un recolor.',
  '<b>Ritmo:</b> donde el refuerzo da velocidad, la máquina va 1,5 o 2,25 veces más deprisa (el multiplicador real). En REFINE el ciclo dura lo mismo, pero salen más barras de Base.',
  '<b>Sobre la evolución:</b> el módulo se ancla a un punto fijo de cada fase. Una refinería de fase III con dos refuerzos conserva su horno alto, su fuelle y su alambique grande.',
]);
H3('REFINE · normal y BOOST (tamaño real de móvil)');
const REF_MS = 3000;
const refCard = (R, stage, boost, on, mouse, title, chip, cap) => card(R, title, 92, 64, (g, t) => { cave(g, 92, 64, 58); const kk = (t % REF_MS) / REF_MS, cyc = Math.floor(t / REF_MS), done = t % REF_MS, bars = on ? (boost === 0 ? 2 : boost === 1 ? 3 : 4) : 0; shadowAt(g, 22, 58, 68); drawRefine(g, 22, 3, stage, boost, on, on ? t : 0, on ? kk : 0, cyc % 2 === 0 || !on ? bars : bars, on ? done : 0); if (mouse) mouseAt(g, CREW.cheddar.refiner, 2, 58, t, kk < 0.15 ? { ear: true } : {}, false, kk > 0.02 && kk < 0.08 ? 1 : 0); }, { chip, cap });
{ const R = CARDROW(); refCard(R, 1, 0, true, true, 'REFINE I', '', '2 barras de Base por ciclo.'); refCard(R, 1, 1, true, true, 'REFINE I · BOOST', '+50% BASE', 'Mismo ciclo: 3 barras. Gema encendida, columna de extracción con la Base subiendo, núcleo cian del fuego, juntas al rojo, chispas en la chimenea.'); refCard(R, 1, 1, false, false, 'REFINE I · equipado sin ratón', '+50% BASE', 'Gema apagada y columna vacía: sin ratón el refuerzo no hace nada.'); }
H3('DRILL · normal y BOOST');
const drCard = (R, stage, boost, mouse, title, chip, cap) => card(R, title, 88, 70, (g, t) => { cave(g, 88, 70, 66); const sp = boost === 2 ? 2.25 : boost === 1 ? 1.5 : 1, ms = 2000 / sp, kk = (t % ms) / ms, on = !!mouse; drawDrill(g, 4, 4, stage, boost, on, t, on, sp); if (mouse) { mouseAt(g, CREW.cheddar.driller, 60, 44, t, kk > 0.85 ? { face: 'happy' } : {}, true, kk < 0.08 ? 1 : 0); if (kk > 0.9 || kk < 0.1) rawTok(26, 66); } }, { chip, cap });
{ const R = CARDROW(); drCard(R, 1, 0, true, 'DRILL I', '', 'Un ciclo cada 2 s.'); drCard(R, 1, 1, true, 'DRILL I · BOOST', '+50% SPEED', 'Un ciclo cada 1,3 s. Gema en el motor, bobina turbo encendida, escape con anillos, volante con estela, rejillas encendidas, aguja en la zona cian, chispas cian en la broca.'); drCard(R, 3, 2, true, 'DRILL III · BOOST ×2', 'x2.25 SPEED', 'Fase III (Turbo Motor y broca grande) con dos refuerzos: segunda gema en el cuadro, un ciclo cada 0,9 s.'); }
H3('Un edificio evolucionado, normal y con BOOST');
{ const R = CARDROW(); refCard(R, 3, 0, true, true, 'REFINE III', '', 'Fase III: horno alto con herrajes y fuelle, alambique grande, manómetro.'); refCard(R, 3, 2, true, true, 'REFINE III · BOOST ×2', 'x2.25 BASE', 'Conserva toda la fase III. Añade sus dos gemas, la columna y el horno al blanco. 4 barras por ciclo.'); }
H3('LAB · normal y BOOST (concepto)');
const labCard = (R, boost, title, tag, cap) => card(R, title, 92, 86, (g, t) => { sky(g, 92, 86, 82); const L = labStage(3, boost); shadowAt(g, 4, 82, L.width); g.drawImage(L, 4, 82 - L.height);
  const p = (t / (boost ? 260 : 700)) % 1; for (let i = 0; i < 3; i++) { g.fillStyle = boost ? '#e8fbff' : '#e8fff0'; g.fillRect(4 + 21 - 1 + i, Math.round(82 - 80 + 56 + 2 - ((p + i / 3) % 1) * 5), 1, 1); }
  if (boost) { for (let s = 0; s < 2; s++) { let x = 4 + 25 + (s ? 3 : -3), y = 82 - 80 + 7; g.fillStyle = Math.floor(t / 90) % 2 ? '#9fe6ff' : '#ffffff'; for (let i = 0; i < 6; i++) { x += (hh2(i, Math.floor(t / 120), s) < 0.5 ? -1 : 1) * (s ? 1 : -1); y += 1; g.fillRect(x, y, 1, 1); } } gemGlint(g, 4 + 24, 82 - 80 + 3, t, 1500); }
  mouseAt(g, CREW.town.sci, 62, 82, t, boost && (t % 3000) < 600 ? { face: 'wow', spark: true } : { book: Math.floor(t / 900) % 2 ? 2 : 1 }, true); }, { tag, cap });
{ const R = CARDROW(); labCard(R, false, 'LAB III', '', 'El experimento burbujea a su ritmo.'); labCard(R, true, 'LAB III · BOOST', 'CONCEPTO · NO IMPLEMENTADO', 'El LAB no admite refuerzo en el juego. Si algún día lo admitiera: resonador de gema en la antena, arcos de energía hacia la cúpula, el experimento a pleno y burbujeo rápido.'); }
H3('Cómo se potenciaría cada edificio');
TB(['EDIFICIO', '¿ADMITE BOOST HOY?', 'MÓDULO PROPIO', 'LUZ', 'RITMO Y FEEDBACK'], [
  ['<b>MINE</b>', '<span class="ad-k keep">Sí</span> (velocidad del minero)', 'Gema en el andamio; farol de mina cian en el puntal; el pico con filo cian.', 'Destellos cian en cada impacto; grietas que brillan un instante.', 'El minero golpea ×1,5 / ×2,25 más a menudo (su golpe real); la roca responde con más trozos y polvo.'],
  ['<b>DRILL</b>', '<span class="ad-k keep">Sí</span> (velocidad)', 'Bobina turbo en la barra, escape, gema en el motor (y en el cuadro con dos).', 'Rejillas, bobina, aguja en zona cian.', 'Volante y ciclo ×1,5 / ×2,25; anillos en el escape; chispas cian en la broca.'],
  ['<b>REFINE</b>', '<span class="ad-k keep">Sí</span> (más Base del mismo Raw)', 'Columna de extracción de vidrio; gema en el horno (y en el alambique con dos).', 'Núcleo cian del fuego, juntas al rojo, conductos.', 'Mismo ciclo; más barras por ciclo; chispas en la chimenea.'],
  ['<b>CHEESE</b>', '<span class="ad-k keep">Sí</span> (velocidad)', 'Manómetro de presión en la prensa con su gema; cuba con serpentín de frío.', 'Moldes con brillo cian al llenarse.', 'Prensa y paleta ×1,5 / ×2,25; al acabar la hornada, un anillo cian sale de la prensa.'],
  ['<b>SELL</b>', '<span class="ad-k keep">Sí</span> (velocidad de venta)', 'Guirnalda de luces bajo el toldo con la gema en el rótulo.', 'Luces encendidas, rótulo iluminado.', 'Ventas ×1,5 / ×2,25; monedas con destello; el tendero más activo.'],
  ['<b>LAB</b>', '<span class="ad-k rebuild">No</span>', 'Resonador de gema en la antena.', 'Arcos de energía, ojo de buey intenso.', 'Concepto (arriba). <b>No implementado.</b>'],
  ['<b>HOUSE</b>', '<span class="ad-k rebuild">No</span>', 'Gema en el dintel; todas las ventanas con luz cálida.', 'Hogar encendido, humo con chispas.', 'Concepto. Sigue siendo una casa, no una fábrica. <b>No implementado.</b>'],
  ['<b>PANTRY</b>', '<span class="ad-k rebuild">No</span>', 'Cerco de escarcha en el portón (conservación); polea con engranaje de latón.', 'Escarcha cian en las juntas.', 'Concepto. <b>No implementado.</b>'],
]);
function comboSheet() {
  const k = 3, [c, g] = SHEET(1000, 210); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, 1000, 210); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  const items = [['I', 1, 0], ['III', 3, 0], ['I + BOOST', 1, 1], ['III + BOOST ×2', 3, 2]]; items.forEach(([n, st, b], i) => { const a = document.createElement('canvas'); a.width = 68; a.height = 56; const x = a.getContext('2d'); x.imageSmoothingEnabled = false; drawRefine(x, 0, 0, st, b, true, 1000, 0.5, b === 0 ? 2 : b === 1 ? 3 : 4, 0); g.drawImage(a, 10 + i * 245, 30, 68 * k, 56 * k); g.fillText(`REFINE ${n}`, 10 + i * 245, 20); });
}
comboSheet();
PP('<span class="ad-cap">Las cuatro combinaciones salen de las mismas piezas: base de la fase + módulo BOOST anclado. No hay que dibujarlas una a una.</span>');

// ================= D · HOUSE =================
H2('D', 'D · HOUSE: EL RATÓN DURMIENDO', 'La escena corregida: la cama, la almohada, la manta con volumen, el ratón oficial descansando, las Z y el despertar.');
UL([
  '<b>El ratón oficial, sin tocar:</b> se ve su cabeza con la cara oficial de dormir, apoyada en la almohada a la altura del colchón; el cuerpo queda bajo la manta. No sobresale de la cama.',
  '<b>La manta</b> es un bulto largo (el cuerpo estirado hasta los pies), con el embozo blanco doblado bajo la barbilla, su sombra y su caída por el lado. Respira: el bulto sube 1 px cada 2,4 s.',
  '<b>Las Z</b> son de píxel con contorno, en tres tamaños (3, 4 y 5 px), salen de la cabeza en diagonal y se van por pasos, sin transparencias.',
  '<b>Despertar:</b> abre los ojos (cara oficial de sorpresa) y mueve la oreja; aparta la manta hacia los pies en tres pasos; aparece de pie junto a la cama con un saltito y se va andando.',
  '<b>Probé también tumbarlo girando el sprite 90°:</b> se descarta, porque el ratón es casi cuadrado y girado sigue pareciendo un bloque. Una pose «tumbado» de verdad sería un dibujo nuevo, que necesitaría tu aprobación aparte.',
]);
{ const R = CARDROW(); card(R, 'La cama, en bucle (10 s)', 100, 40, (g, t) => { cave(g, 100, 40, 34); drawBed(g, 8, 12, CREW.town.idle, t % 10000); }, { cap: 'Duerme 6,5 s, se despierta, aparta la manta, se levanta y se va.' }); card(R, 'Durmiendo', 64, 40, (g, t) => { cave(g, 64, 40, 34); drawBed(g, 5, 12, CREW.town.idle, t, { sleepOnly: true }); }, { cap: 'La respiración y las Z.' }); card(R, 'Cama ocupada por un ratón con puesto', 64, 40, (g, t) => { cave(g, 64, 40, 34); drawBedOccupied(g, 5, 12, CREW.cheddar.cook, t); }, { cap: 'Propuesta para no dibujarlo dos veces (ver abajo).' }); card(R, 'Descartada: girado 90°', 64, 40, (g) => { cave(g, 64, 40, 34); bedRotated(g, 5, 12, CREW.town.idle); }); }
UL([
  '<b>La lógica de HOUSE se mantiene:</b> una sola plaza (THE BED y TRAINING ROOM la comparten), así que hay una cama.',
  '<b>Ojo, una cosa del juego real:</b> el ratón en THE BED <b>sigue trabajando en su puesto</b> mientras le tratan. Si se le dibuja dormido en la casa, aparecería dos veces. Propuesta: se le ve dormido solo si no tiene puesto; si lo tiene, la cama queda abierta con su retrato en el cabecero. Necesito que lo decidas.',
]);

// ================= E · QA VISUAL =================
H2('E', 'E · QA VISUAL', 'Comprobaciones automáticas sobre los sprites de esta entrega y repaso a ojo. Ningún móvil real todavía.');
function qaVisual() {
  const rows = [], ok = (c) => (c ? '<span class="ad-k keep">✔</span>' : '<span class="ad-k rebuild">✘</span>');
  const sprites = [['HOUSE I', houseStage(1)], ['HOUSE II', houseStage(2)], ['HOUSE III', houseStage(3)], ['LAB I', labStage(1)], ['LAB II', labStage(2)], ['LAB III', labStage(3)], ['LAB IV', labStage(4)], ['REFINE I', refineBase(1, 0, true)], ['REFINE III', refineBase(3, 0, true)], ['REFINE III BOOST ×2', refineBase(3, 2, true)], ['DRILL I', drillBase(1, 0, true)], ['DRILL III', drillBase(3, 0, true)], ['DRILL III BOOST ×2', drillBase(3, 2, true)], ['Cama', bedSprite()]];
  const old = [['HOUSE (1.ª entrega)', houseSprite().canvas()], ['LAB (1.ª entrega)', labSprite().canvas()], ['REFINE (V4.1)', OLDREF()]];
  for (const [n, cv] of old) { const r = doubleInk(cv); rows.push([n, `${r.bad.length} px de doble contorno`, ok(false), 'Antes']); }
  for (const [n, cv] of sprites) { const r = doubleInk(cv), w = cv.width, h = cv.height; rows.push([n, `${r.bad.length} px de doble contorno · ${w} × ${h} px · en el móvil ${Math.round(w * KPX)} × ${Math.round(h * KPX)} px CSS`, ok(r.bad.length === 0 && w * KPX >= 44 && h * KPX >= 44), 'Después']); }
  TB(['SPRITE', 'MEDIDA', 'OK', ''], rows);
}
qaVisual();
TB(['COMPROBACIÓN', 'RESULTADO'], [
  ['Contorno', 'Una sola tinta en todo (#1b1220, la de los ratones) y de 1 px: 0 píxeles de doble contorno en los 14 sprites nuevos (tabla de arriba).'],
  ['Escala', 'Puertas de 13–16 px frente a ratones de 20; peldaños, asas y palancas de 2–3 px. Todo apoya en el suelo.'],
  ['Siluetas', 'HOUSE (ancha, tejado de cuña), LAB (torre y cúpula), REFINE (horno y alambique), DRILL (máquina sobre plataforma): ninguna se confunde con otra en negro.'],
  ['Legibilidad en el móvil', 'En las tarjetas a 2,33 px CSS: gemas (7 × 6 px de arte, 16 × 14 CSS), Z (hasta 5 px de arte, 12 CSS) y luces se distinguen. El destello de la gema dura 0,3 s cada 2,3 s.'],
  ['Zonas táctiles', 'Todos los sprites nuevos miden más de 44 × 44 px CSS en el móvil (columna «medida»).'],
  ['Animaciones', 'DRILL: ciclo de 2 s, 1,33 s y 0,89 s (×1, ×1,5, ×2,25, el multiplicador real). REFINE: 3 s siempre; 2, 3 y 4 barras. Cama: bucle de 10 s, respiración cada 2,4 s.'],
  ['Regla del refuerzo', 'Sin ratón, gema apagada y ningún efecto (tarjeta «equipado sin ratón»). LAB, HOUSE y PANTRY: solo concepto, rotulado.'],
  ['Pendiente', 'Probarlo en Chrome Android y Safari iOS; aplicar el tratamiento al resto (SHOP, PANTRY, CHEESE, MINE, superficie) cuando lo apruebes.'],
]);

// ================= OTROS PUNTOS =================
H2('F', 'F · OTROS PUNTOS DEL FEEDBACK', 'Lo que no entra en esta entrega pero queda anotado para la integración.');
UL([
  '<b>Superficie, terreno vacío:</b> en la integración, la banda de tierra entre el pueblo y Cheddar baja a la mitad y solo enseña lo que trabaja (la bodega, el pozo con la jaula). Al llegar, el suelo del pueblo queda a dos tercios de la pantalla.',
  '<b>Superficie, navegación:</b> no la doy por buena sin probarla en un móvil. Propuesta para validar: las casillas SELL, LAB, HOUSE y PANTRY llevan la cámara al edificio en un toque; deslizar en horizontal solo existe en la superficie y nunca a la vez que el vertical (el primer movimiento decide el eje).',
  '<b>HUD:</b> los contadores de Raw, Base y queso caben junto a las monedas sin quitar la franja de GOAL ni el aviso «!».',
  '<b>Bocadillos y montacargas:</b> dirección aprobada; su validación animada y sincronizada va en la integración, con estos mismos sprites.',
  '<b>Pico, sonido y profundidad:</b> sin cambios: el pico aprobado sobre los ratones oficiales, los sonidos del juego y los cuatro nuevos apagados, y la flecha con su número separado del capítulo.',
]);
H2('OK', 'QUÉ NECESITO QUE DECIDAS');
UL([
  '<b>A · Tratamiento:</b> ¿1 px de tinta por fuera, líneas interiores por tonos y volumen por masa? Si sí, lo aplico a todo el mundo.',
  '<b>B · Evolución:</b> ¿las tres fases por edificio y sus disparadores? En HOUSE (rangos 3 y 4), PANTRY (rocas abiertas) y la superficie, los umbrales son tuyos.',
  '<b>C · BOOST:</b> ¿módulo propio + gema del panel + luz cian solo en lo encendido + el ritmo real? ¿Y los conceptos de LAB, HOUSE y PANTRY se quedan como referencia?',
  '<b>D · Cama:</b> ¿esta escena? ¿Y qué hacemos con el ratón en THE BED que sigue trabajando (dormido solo si no tiene puesto)?',
]);

});

</script>
