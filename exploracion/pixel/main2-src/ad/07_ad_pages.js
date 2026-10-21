adReady(() => {
// ---------- ART DIRECTION · la página (A, B, C) ----------
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
worldTick(16);

PP('<b>Cómo leer esta página.</b> Cada sección es una propuesta para revisar antes de volver a montar MAIN 2.0. Los teléfonos son de 375 × 635 (iPhone en Safari con barras) a la escala real de la colonia; puedes arrastrar y tocar donde se indica. Nada de esto toca el juego ni la economía, y el arte de V4.1 sigue sin aprobar.');

// ================= A · AUDITORÍA DE ASSETS =================
H2('A', 'A · AUDITORÍA DE ASSETS', 'Todo lo que se ve hoy en MAIN 2.0 (V4.1), con su generación visual y su nivel frente a MICE Pulido+. ★★★ = a la altura de los ratones; ★★ = cerca, le falta trabajo; ★ = de otra etapa.');
function auditTable() {
  const g1 = geoC(STOPS[1]), top = STOPS[1].top, C = WORLD.ched, th = TH.cheddar;
  const gd = renderStopTo(2, performance.now(), document.createElement('canvas')), gb = geoB(STOPS[2]);
  const town = viaCtx(Math.ceil(SC.worldW), 126, (g) => { g.translate(0, -STOPS[0].top); paintTown(STOPS[0]); });
  const T = (cv, k = 2, max = 120) => big(cv, k, max);
  const rows = [
    ['Ratones oficiales', T(mouseCanvas(CREW.cheddar.cook, 0, false, {})), 'MICE Pulido+ (aprobados)', 3, 'keep', 'No se tocan. 22 × 20; poses aprobadas: andar, pie, oreja, cola, caras, libro, lupa, chispa.'],
    ['Ratón del jugador con pico (swing_gold)', T(frameOf('out/anims/swing_gold.png', 32, 3)), 'MAIN antiguo: trabajador genérico', 2, 'adapt', 'Es la animación de minería aprobada (5 fotogramas). Su cuerpo no es un ratón MICE: propongo su pico sobre un ratón oficial (F).'],
    ['Pico nuevo del minero (V4.1)', T(artPick(2), 3), 'Piloto V4.1 (código)', 1, 'rebuild', 'No coincide con el pico aprobado. Se sustituye por el de swing (F).'],
    ['Rueda en la pata (V4.1)', T(artCarry('w'), 3), 'Piloto V4.1', 1, 'remove', 'Accesorio sin aprobar. La rueda baja por una rampa de la prensa (E).'],
    ['Roca de Cheddar (c0–c4, v1–v5)', T(frameOf(ROCKC[0], 54)), 'Pulido+ (roca redibujada)', 2, 'rebuild', '54 × 42. Cresta del minero, cara de la broca, estados de grietas y veta (H).'],
    ['Roca de Gouda', T(frameOf('out/sprites/big_gouda_c0.png', 54)), 'Pulido+ recoloreada', 1, 'rebuild', 'Misma forma que Cheddar con otro color (H).'],
    ['HOUSE (phouse)', T(frameOf('out/anims/phouse.png', 40)), 'MAIN antiguo (casa azul)', 1, 'rebuild', '40 × 46, 8 fotogramas. Propuesta nueva en B.'],
    ['LAB (plab)', T(frameOf('out/anims/plab.png', 36)), 'MAIN antiguo', 1, 'rebuild', '36 × 46. Propuesta nueva en B.'],
    ['SHOP (V4.1)', T(artShop()), 'Piloto V4.1', 2, 'adapt', '44 × 46. Base de la propuesta nueva (B).'],
    ['PANTRY (V3: pilas y caseta)', T(viaCtx(80, 30, () => { PILES(2, 28); storeroom(42, 28, th); })), 'Bloques V3', 1, 'rebuild', 'Cajas sueltas y una caseta genérica. Propuesta nueva en B.'],
    ['Superficie: colinas, árbol, camino, bodega', T(crop(town, [0, 20, 160, 100]), 1, 160), 'Bloques V3', 1, 'rebuild', 'Edificios en fila. Composición nueva en C.'],
    ['Pared y terrazas de Cheddar', T(crop(C, [g1.o + 10, g1.TL + 16, 34, 30], top)), 'Piloto V4.1', 2, 'adapt', 'Bien de planos; textura de pared genérica.'],
    ['REFINE: horno, alambique, bandeja', T(crop(C, g1.focus.refinery, top), 2, 130), 'Piloto V4.1', 2, 'adapt', 'Buen punto de partida. Fuego y manómetro siguen el ciclo.'],
    ['DRILL: pórtico, máquina, volante, cuadro, barra', T(crop(C, g1.focus.drill, top), 2, 130), 'Piloto V4.1', 2, 'adapt', 'Se lee bien; el pórtico mezcla vista frontal y cenital.'],
    ['CHEESE: marco, alero, baldas, cuba, prensa', T(crop(C, g1.focus.cheesery, top), 2, 120), 'Piloto V4.1', 2, 'adapt', 'Piezas sueltas: falta que se lean como un solo taller.'],
    ['Elevador de cangilones y canaleta de Base', T(crop(C, [g1.o + 36, g1.t + 8, 20, 50], top)), 'Piloto V4.1', 1, 'adapt', 'Raíles de 1 px; el trayecto de la Base apenas se ve.'],
    ['Montacargas (jaula y cables)', T(viaCtx(14, 14, () => { box(2, 2, 10, 11, '#5a5a68'); R(3, 3, 8, 9, '#2a2a36'); })), 'Piloto V4.1', 1, 'rebuild', 'Un rectángulo. Castillete y jaula con puerta (B, E).'],
    ['Andamio del jugador', T(crop(C, [g1.rx - 24, g1.rb - 14, 28, 16], top)), 'Piloto V4.1', 2, 'adapt', 'Necesario para que el jugador pise algo.'],
    ['Farol', T(artLantern(), 3), 'Piloto V4', 2, 'keep', '—'],
    ['Cajas de Raw', T(frameOf(SPR.crate, 10), 3), 'MAIN antiguo', 2, 'keep', '—'],
    ['Recursos que viajan (Raw, Base, rueda, moneda)', T(viaCtx(34, 8, () => { rawTok(4, 4); baseTok(12, 4); wheelTok(21, 4); coinTok(30, 4); }), 3), 'Piloto V4.1', 1, 'adapt', '4–6 px: casi ilegibles a la escala del móvil. Al producir, vuelan los iconos aprobados (E).'],
    ['Iconos de recurso y de oficio', T(viaCtx(70, 16, (g) => ['ic_raw_cheddar', 'ic_base_cheddar', 'ic_lot_cheddar', 'ic_coin', 'ic_pick'].forEach((n, i) => g.drawImage(im('out/sprites/' + n + '.png'), i * 14, 0)))), 'Iconos aprobados', 3, 'keep', 'Los mismos del HUD y del árbol.'],
    ['Gouda: terrazas, horno, alambique, polea, prensa', T(crop(gd, [gb.o, gb.t + 6, 140, 70], STOPS[2].top), 1, 140), 'Bloques V3', 1, 'rebuild', 'Otro juego al lado de Cheddar. Muestra en G.'],
    ['Placa de profundidad', T(viaCtx(20, 12, () => plaque(1, 1, 81, th)), 4), 'Bloques V3', 1, 'rebuild', 'El símbolo parece una cruz. Propuesta en I.'],
    ['Bocadillos', null, 'V4 (texto en caja)', 1, 'rebuild', 'No se leen como habla. Sistema nuevo en D.'],
    ['Partículas (trozos, polvo, chispas, humo)', null, 'Piloto V4', 2, 'keep', 'Con tope de 70.'],
    ['Paneles (árbol, fichas)', null, 'Pulido+ (aprobados)', 3, 'keep', 'No se tocan.'],
    ['Aspectos de los edificios en los árboles', T(frameOf('out/anims/pdrill_3.png', 44), 1, 60), 'Pulido+ (15-10-2026)', 2, 'adapt', 'No coinciden con los edificios de MAIN 2.0; deben salir de los nuevos.'],
  ];
  const DEC = { keep: 'Conservar', adapt: 'Adaptar', rebuild: 'Reconstruir', remove: 'Quitar' };
  TB(['ELEMENTO', 'HOY', 'GENERACIÓN', 'CALIDAD', 'DECISIÓN', 'DEPENDENCIAS Y NOTAS'], rows.map(([n, th2, gen, q, d, dep]) => [`<b>${n}</b>`, th2 || '—', gen, `<span class="ad-q" style="color:${q === 3 ? '#62d36e' : q === 2 ? '#ffcf2e' : '#ff8a96'}">${'★'.repeat(q)}</span>`, `<span class="ad-k ${d === 'remove' ? 'rebuild' : d}">${DEC[d]}</span>`, dep]));
  const n = (d) => rows.filter((r) => r[4] === d).length;
  PP(`<b>Recuento:</b> ${n('keep')} conservar, ${n('adapt')} adaptar, ${n('rebuild')} reconstruir y ${n('remove')} quitar. Lo único a la altura de MICE son los propios ratones, los iconos y los paneles aprobados.`);
}
auditTable();

// ================= B · EDIFICIOS =================
H2('B', 'B · ART SHEET DE EDIFICIOS', 'HOUSE, LAB, SHOP y PANTRY rehechos desde cero, más el castillete de la mina, a la misma escala (3×) y con un ratón oficial al lado. Debajo, lo que hay hoy y las máquinas de Cheddar.');
UL([
  '<b>Siluetas que no se confunden.</b> HOUSE, ancha y baja bajo un tejado de cuña de queso, con puerta redonda. LAB, una torre con cúpula de cobre, telescopio y antena. SHOP, un puesto abierto con toldo. PANTRY, un almacén con buhardilla, polea y portón.',
  '<b>Materiales y función.</b> HOUSE: revoco, entramado y piedra, con luz cálida (hogar). LAB: tablas frías, cobre verdoso, vidrio y el experimento verde (ciencia). SHOP: tela a rayas, madera clara y el queso terminado a la vista (comercio). PANTRY: tablas rojas, pizarra, hierro y cajas por color (almacén). Ninguno usa ladrillo ni fuego: eso es de REFINE.',
  '<b>Construcción común</b> (la de los edificios Pulido+ aprobados): rampas de 5 tonos, luz arriba a la izquierda, lado en sombra con trama, oclusión abajo, sombras arrojadas en trama bajo los aleros, huecos hundidos y el contorno de tinta de los ratones.',
  '<b>Escala:</b> las puertas miden 13–16 px y el ratón 20. Todo apoya en el suelo, con sombra de contacto.',
]);
function buildSheet() {
  const k = 3, m = (who) => mouseCanvas(who, 0, false, {});
  let [c, g] = SHEET(1000, 300); g.fillStyle = '#36452f'; g.fillRect(0, 0, 1000, 300); g.fillStyle = '#26321f'; g.fillRect(0, 236, 1000, 64);
  lineup(g, [['MOUSE', m(CREW.town.keeper), '22 × 20'], ['HOUSE', houseSprite().canvas(), '62 × 54'], ['LAB', labSprite().canvas(), '48 × 70'], ['SHOP', shopSprite().canvas(), '58 × 52'], ['PANTRY', pantrySprite().canvas(), '64 × 56'], ['MINE HEAD', headframeSprite().canvas(), '28 × 72']], k, 10, 236, 4);
  PP('<span class="ad-cap">Propuesta. Mismo suelo, misma escala, misma luz.</span>');
  [c, g] = SHEET(1000, 230); g.fillStyle = '#2e2a36'; g.fillRect(0, 0, 1000, 230); g.fillStyle = '#211d28'; g.fillRect(0, 172, 1000, 58);
  lineup(g, [['MOUSE', m(CREW.town.keeper)], ['HOUSE hoy', frameOf('out/anims/phouse.png', 40)], ['LAB hoy', frameOf('out/anims/plab.png', 36)], ['SHOP V4.1', artShop()], ['PANTRY V3', viaCtx(80, 30, () => { PILES(2, 28); storeroom(42, 28, TH.cheddar); })]], k, 10, 172, 6);
  PP('<span class="ad-cap">Hoy, para comparar: tres generaciones distintas.</span>');
  // Máquinas de Cheddar: tal como están (punto de partida), a la misma escala, con el ratón.
  const g1 = geoC(STOPS[1]), top = STOPS[1].top, C = WORLD.ched;
  [c, g] = SHEET(1000, 330); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, 1000, 330);
  lineup(g, [['MOUSE', m(CREW.cheddar.refiner)], ['REFINE', crop(C, g1.focus.refinery, top)], ['DRILL', crop(C, [g1.o + 44, g1.t + 8, 60, 70], top)], ['CHEESE', crop(C, g1.focus.cheesery, top)], ['MINE', crop(C, [g1.rx - 24, g1.rb - 44, 80, 46], top)]], k, 10, 290, 5, false);
  PP('<span class="ad-cap">Máquinas de Cheddar de V4.1, recortadas de la escena. Son el punto de partida, no la versión final.</span>');
}
buildSheet();
H3('Máquinas de Cheddar: qué unificar (antes de producir nada)');
UL([
  '<b>Una sola perspectiva:</b> frente con una cara superior de 2 px en todo lo horizontal (mesas, bandejas, pórtico, cubas). Hoy el pórtico de DRILL y la bandeja de REFINE se ven desde más arriba que el resto.',
  '<b>Cada estación, un conjunto:</b> REFINE como industria (horno de ladrillo, alambique de cobre, chimenea de hierro; sin madera); CHEESE como un taller cerrado (bastidor de madera, alero, baldas, prensa y moldes dentro de un mismo marco); DRILL como máquina sobre su pórtico; MINE como la corta con su andamio.',
  '<b>Proporciones:</b> las asas, palancas y peldaños se dimensionan para la pata del ratón (2–3 px), igual que la puerta de los edificios.',
  '<b>Contacto:</b> todas las máquinas con sombra de contacto y oclusión de 2 px, como los edificios nuevos.',
  '<b>Rutas visibles:</b> el elevador de Raw y la canaleta de Base, con 2–3 px de grosor y su propio material, para que el recorrido se lea a la escala del móvil.',
]);

// ================= C · SUPERFICIE =================
H2('C', 'C · COMPOSICIÓN DE LA SUPERFICIE', 'Un pueblo más ancho que la pantalla (346 px de arte; el móvil ve unos 160). Desliza en el teléfono o toca SELL, LAB, HOUSE o PANTRY para llevar la cámara a cada edificio.');
const [VC, VG] = SHEET(VW * 2, VH * 2); VC.style.maxWidth = '100%';
WORLD.hooks.push(() => { VG.imageSmoothingEnabled = false; VG.drawImage(WORLD.vill, 0, 0, VW * 2, VH * 2); });
PP('<span class="ad-cap">El pueblo entero a 2×. A la derecha, el castillete queda justo encima del pozo de Cheddar.</span>');
UL([
  '<b>Tres alturas:</b> la casa en la colina, el laboratorio en un altozano y el mercado abajo, junto a la mina. Unos taludes con escalones los unen.',
  '<b>Un camino</b> recorre el pueblo de la puerta de la casa a la boca de la mina; entre edificios queda sitio para que los ratones trabajen y pasen.',
  '<b>Relación HOUSE · LAB · SHOP · PANTRY:</b> lo que vende y guarda está junto al pozo, donde llega el queso; la casa y el laboratorio, apartados y tranquilos.',
  '<b>Ambiente:</b> árboles, arbustos con flores, valla, banco, farol, un poste indicador hacia la mina y humo en la chimenea. Solo se mueve lo que tiene una causa (humo, la bombilla del laboratorio, el burbujeo del matraz).',
  '<b>Hacia el subsuelo:</b> el corte del terreno enseña la madriguera de la casa (donde descansan los ratones sin puesto), la bodega del almacén (cajas por color y ruedas) y el pozo que baja a Cheddar.',
]);
const CROW = DIV('ad-row');
const PC = adPhone(CROW, { s: 0.8, dock: 'town', res: true, cap: '<b>En el móvil.</b> Al llegar a la superficie, la cámara enseña el mercado. Desliza a la derecha para ver el laboratorio y la casa.' });
PC.ph.querySelector('.ad-navl').innerHTML = `<img class="pix" src="out/sprites/ic_coin.png" alt="">SURFACE`;
PC.camY = 0; PC.camX = VW - PC.vw;
const camTo = (P, x, ms = 360) => { const fx = P.camX, t0 = performance.now(), tx = Math.max(0, Math.min(VW - P.vw, x)); P.tw = (now) => { const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; P.camX = fx + (tx - fx) * e; if (k >= 1) P.tw = null; }; };
PC.draw = (g, now) => { g.drawImage(WORLD.vill, 0, 0); g.drawImage(WORLD.ched, 184, VH); g.fillStyle = '#2e2018'; g.fillRect(0, VH, 184, 200); };
PC.tick = (now) => { if (PC.tw) PC.tw(now); };
const FOCUS = { SELL: VPOS.shop[0] + 29, LAB: VPOS.lab[0] + 24, HOUSE: VPOS.house[0] + 40, PANTRY: VPOS.pantry[0] + 32 };
PC.ph.querySelectorAll('.ad-tile[data-n]').forEach((t) => (t.onclick = () => { PC.ph.querySelectorAll('.ad-tile').forEach((x) => x.classList.toggle('on', x === t)); camTo(PC, FOCUS[t.dataset.n] - PC.vw / 2); }));
{ let d = null; PC.stage.style.pointerEvents = 'auto'; PC.stage.addEventListener('pointerdown', (e) => { d = { x: e.clientX, cx: PC.camX }; PC.stage.setPointerCapture(e.pointerId); }); PC.stage.addEventListener('pointermove', (e) => { if (!d) return; PC.tw = null; PC.camX = Math.max(0, Math.min(VW - PC.vw, d.cx - (e.clientX - d.x) / (PC.k * PC.s))); }); PC.stage.addEventListener('pointerup', () => (d = null)); }
const FILM = DIV('ad-grid', CROW);
for (const [n, x, cap] of [['market', VW - 161, 'Al llegar: tienda, almacén y castillete (el corazón del pueblo).'], ['lab', 96, 'Deslizando: el laboratorio en su altozano.'], ['house', 0, 'Al fondo: la casa en la colina y la madriguera.']]) { const f = document.createElement('figure'), c = document.createElement('canvas'); c.width = 161 * 2; c.height = VH * 2; c.className = 'ad-sheet'; c.style.width = '161px'; f.appendChild(c); const fc = document.createElement('figcaption'); fc.textContent = cap; f.appendChild(fc); FILM.appendChild(f); WORLD.hooks.push(() => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(WORLD.vill, x, 0, 161, VH, 0, 0, 322, VH * 2); }); }

// ---------- ART DIRECTION · la página (D, E) ----------
// Cheddar en un teléfono: el corte de la superficie arriba (con el pozo) y la parada entera debajo, a la escala de la colonia.
const G1 = () => geoC(STOPS[1]);
const T0 = () => STOPS[1].top;
const drawChed = (g, P) => { g.fillStyle = '#2a1d14'; g.fillRect(P.camX - 2, P.camY - 2, P.vw + 4, P.vh + 4); g.drawImage(WORLD.vill, -184, -VH); g.drawImage(WORLD.ched, 0, 0); };
const headOf = (who) => { const b = BR[who]; return b && b.px != null ? [b.px + 11, b.py - T0() - 19] : [0, 0]; };
const cheddarPhone = (parent, cap, s = 0.8) => { const P = adPhone(parent, { s, dock: 'colony', cap }); P.ph.querySelector('.ad-navl').innerHTML = `<img class="pix" src="${ICON.raw}" alt="">CHEDDAR <span class="ad-dep">${depthArrowHTML()}81</span>`; P.camX = 0; P.camY = 160 - P.vh + 6; P.draw = (g) => drawChed(g, P); return P; };

// ================= D · BOCADILLOS =================
H2('D', 'D · SISTEMA DE BOCADILLOS', 'Dos piezas que no se pueden confundir: el <b>diálogo</b> sale de un ratón; el <b>aviso</b> cuelga de una máquina.');
TB(['', 'DIÁLOGO DEL RATÓN', 'AVISO FUNCIONAL'], [
  ['Qué es', 'Lo que el ratón dice por su personalidad, su trabajo o lo que acaba de pasar.', 'Algo que el jugador debe saber de la cadena: falta Raw, falta Base.'],
  ['Forma', 'Globo crema, contorno de tinta de 2 px, esquinas de píxel y una punta escalonada que señala la cabeza de quien habla.', 'Placa oscura con borde ámbar y el icono del recurso que falta; cuelga de la máquina con una cadena. Sin punta.'],
  ['Texto', 'Frase corta, en minúsculas (fuente de píxel de 8 px, 2 líneas como mucho).', 'Dos palabras en MAYÚSCULAS, con icono: NO RAW, NO BASE.'],
  ['Quién', 'El ratón da un salto pequeño y pone su cara (poses aprobadas) al empezar a hablar.', 'Nadie habla: el ratón de esa máquina pone la cara triste, sin bocadillo.'],
  ['Cuánto dura', '1,6 s + 60 ms por letra (2,2–4,5 s). Aparece en 3 pasos (150 ms) y se va en 2 (120 ms).', 'Mientras dure el problema. Si dura, se queda; nunca parpadea.'],
  ['Cuántos', 'Uno a la vez en toda la pantalla; como mucho dos esperando; 0,6 s entre uno y otro.', 'Como mucho dos, de la roca que se mira.'],
  ['Dónde', 'Encima de la cabeza; si choca con el borde se corre (la punta sigue a la cabeza); si no cabe arriba, a un lado. Nunca sobre caras, el selector ni otra máquina.', 'Encima de su máquina; si choca, se corre en horizontal.'],
]);
// Frases por oficio (cortas, con personalidad). Se dicen con medida: un evento real, y no más de una por ratón cada 12 s.
const LINES = { miner: { reveal: 'Found a vein!', deeper: 'Deeper we go!' }, driller: { drillStart: "Drill's warm.", drillDone: 'Raw coming up!' }, refiner: { refineDone: 'Smells just right.' }, cook: { cookDone: 'Fresh wheel!' } };
const DROW = DIV('ad-row');
const PD = cheddarPhone(DROW, '<b>En vivo.</b> Los ratones hablan cuando pasa algo de verdad (veta, hornada, ciclo). Las placas salen cuando a una máquina le falta material.');
const TK = talker(PD); PD.tick = (now) => TK.tick(now);
TK.avoid = () => { const out = []; for (const w of ['miner', 'driller', 'refiner', 'cook']) { const h = headOf(w), [x, y] = PD.toPh(h[0], h[1]); out.push([x - 12, y - 4, 24, 14]); } return out; };
const saidAt = {};
on41((e) => {
  for (const [who, L] of Object.entries(LINES)) { if (!L[e.type] || !BR[who] || !P41[who]) continue; if (performance.now() - (saidAt[who] || -1e9) < 12000) continue; saidAt[who] = performance.now(); TK.say(who, L[e.type], () => headOf(who), () => react(who, e.type === 'reveal' ? 'vein' : e.type === 'deeper' ? 'deeper' : 'greet')); }
});
// Avisos de máquina: aparecen con el estado real y se van cuando se arregla.
const WARN = { refinery: null, cheesery: null };
WORLD.hooks.push(() => {
  const g = G1(), t = T0(), need = { refinery: !Z41.refJob && SIM41.refStatus() === 'no-raw', cheesery: !Z41.cookJob && SIM41.cookStatus() === 'no-base' };
  for (const k of ['refinery', 'cheesery']) { if (need[k] && !WARN[k]) WARN[k] = plate(PD, k === 'refinery' ? [g.o + 12, g.TL - 30 - t] : [g.o + 116, g.TR - 36 - t], k === 'refinery' ? 'raw' : 'base', k === 'refinery' ? 'NO RAW' : 'NO BASE'); if (!need[k] && WARN[k]) { WARN[k].bye(); WARN[k] = null; } }
});
const DG = DIV('ad-grid', DROW);
PP('Situaciones fijas, con el mismo sistema (teléfonos a media escala):');
const DGAL = DIV('ad-row');
function stillPhone(cap, setup) { const P = adPhone(DGAL, { s: 0.5, dock: 'colony', cap }); P.ph.querySelector('.ad-navl').innerHTML = `<img class="pix" src="${ICON.raw}" alt="">CHEDDAR <span class="ad-dep">${depthArrowHTML()}81</span>`; P.camX = 0; P.camY = 160 - P.vh + 6; P.draw = (g) => drawChed(g, P); P.live = false; setTimeout(() => { setup(P); P.render(performance.now()); }, 60); return P; }
stillPhone('<b>1 · Veta.</b> Colby lo dice desde la roca; la punta baja a su cabeza.', (P) => bubble(P, headOf('miner'), 'Found a vein!'));
stillPhone('<b>2 · Aviso.</b> La refinería sin Raw: placa en la máquina. Monty no habla.', (P) => { const g = G1(); plate(P, [g.o + 12, g.TL - 30 - T0()], 'raw', 'NO RAW'); });
stillPhone('<b>3 · Estación elegida.</b> Con la cámara cerca, el globo crece con la escena.', (P) => { const g = G1(), r = g.focus.cheesery; P.k = 3.5; P.fit(); P.camX = r[0] + r[2] / 2 - P.vw / 2; P.camY = r[1] - T0() + r[3] / 2 - P.vh / 2 - 8; bubble(P, headOf('cook'), 'Fresh wheel!'); });
stillPhone('<b>4 · Junto al borde.</b> El globo se corre hacia dentro; la punta sigue señalando a Tilly.', (P) => { P.camX = 8; bubble(P, headOf('cook'), 'One more batch, then tea.'); });
stillPhone('<b>5 · Dos a la vez.</b> Habla uno (Paneer); el otro espera su turno. Nunca dos globos.', (P) => bubble(P, headOf('driller'), "Drill's warm."));
// ================= E · RECURSOS =================
H2('E', 'E · FEEDBACK DE RECURSOS', 'Recuperar lo que funcionaba en MAIN: cuando una máquina produce, el recurso aparece en ella, flota «+N» y vuela a su contador, que salta y sube. El transporte del escenario queda como historia, no como recompensa.');
UL([
  '<b>Un contador por recurso, siempre a la vista:</b> Raw, Base y queso de la roca que se mira, con su icono aprobado, en el HUD junto a las monedas (mismo alto de HUD que hoy: 52 px).',
  '<b>Sale de su máquina:</b> Raw de la boca de la perforadora, Base de la bandeja de la refinería, queso de la prensa, monedas del mostrador (o del borde, si la tienda no se ve).',
  '<b>Con medida (reglas de MAIN):</b> lo que haces con el dedo sale siempre; lo de los ratones, como mucho una vez por etapa cada 1,2 s con el total juntado. Topes: 8 números y 10 iconos a la vez.',
  '<b>La cifra sube al llegar:</b> el contador da un salto de 2 px a pasos y cuenta hasta el valor nuevo en 0,3 s.',
  '<b>Formas distintas:</b> Raw (pepita naranja), Base (bloque crema), queso (rueda) y moneda: los mismos iconos del HUD, a 16 px.',
]);
const EROW = DIV('ad-row');
const PE = cheddarPhone(EROW, '<b>En vivo.</b> La colonia trabaja sola. Toca los botones de abajo para hacer un ciclo a mano: lo del dedo siempre se ve.');
const FX = fxOf(PE);
const OUT = () => { const g = G1(), t = T0(); return { raw: [g.o + 60, g.DK - 14 - t], base: [g.o + 40, g.TL + 2 - t], lot: [g.o + 122, g.TR - 12 - t], coin: [g.o + 138, -10] }; };
on41((e) => { const o = OUT(), man = e.source === 'manual'; if (e.type === 'drillDone') FX.emit('raw', o.raw, e.amount, man); if (e.type === 'refineDone') FX.emit('base', o.base, e.amount, man); if (e.type === 'cookDone') FX.emit('lot', o.lot, e.amount || 1, man); if (e.type === 'sellDone') FX.emit('coin', o.coin, 2.4e12, man); });
const EB = document.createElement('div'); EB.className = 'ad-pk'; EB.style.marginTop = '8px'; PE.fig.appendChild(EB);
for (const [l, f] of [['DRILL a mano', () => { if (!Z41.veinRevealed) legal(); SIM41.drillTap(); }], ['REFINE a mano', () => { if (Z41.raw < 2) Z41.raw += 4; SIM41.refTap(); }], ['CHEESE a mano', () => { if (Z41.base < 1) Z41.base += 2; SIM41.cookTap(); }]]) { const b = document.createElement('button'); b.textContent = l; b.onclick = f; EB.appendChild(b); }
function legal() { while (!Z41.veinRevealed) { Z41.lastHitAt = -1e9; if (!SIM41.hit('manual').ok) break; } }
const EDESC = DIV('ad-grid', EROW);
TB(['RECURSO', 'SALE DE', 'VUELA A', 'CUÁNDO SALE (RATONES)', 'CUÁNDO SALE (DEDO)'], [
  ['<b>Raw</b>', 'la boca de la perforadora', 'contador Raw', 'cada 1,2 s como mucho, con lo juntado', 'cada ciclo'],
  ['<b>Base</b>', 'la bandeja de la refinería', 'contador Base', 'igual', 'cada ciclo'],
  ['<b>Queso</b>', 'la prensa', 'contador queso', 'igual', 'cada hornada'],
  ['<b>Monedas</b>', 'el mostrador (o el borde superior si la tienda no se ve)', 'monedas', 'cada 1,2 s como mucho', 'cada venta'],
]);
// ---- El montacargas ----
H3('El montacargas: una secuencia conectada');
TB(['PASO', 'HOY (V4.1)', 'PROPUESTA'], [
  ['1 · Hornada', 'La quesera lleva la rueda en la pata (accesorio sin aprobar).', 'La rueda sale de la prensa y el contador de queso sube en el acto.'],
  ['2 · Entrega', 'La rueda aparece en el rellano al acabar el paseo.', 'Baja por una rampa corta hasta el rellano (la mueve la máquina, no un ratón).'],
  ['3 · Carga', 'La jaula carga lo que haya a los 0,5 s, aunque no llegue nada más.', 'La jaula espera abierta; cada rueda entra cuando llega. Se ve cuántas lleva.'],
  ['4 · Salida', 'Sale con una regla de tiempo que no se ve.', 'Sale con 3 ruedas, o cuando pasan 1,5 s sin que llegue otra. La puerta se cierra antes de moverse.'],
  ['5 · Viaje', 'Sube y baja a su ritmo, desconectado de la producción.', 'Sube con arranque y frenada (2,6 s) y baja vacía (2,2 s). Las ruedas que llegan mientras viaja esperan a la vista en el rellano.'],
  ['6 · Llegada', 'Las ruedas aparecen en el mostrador.', 'Se abre arriba y las ruedas ruedan una a una al almacén, que es donde las guarda el juego. La tienda vende de ahí: las monedas salen del mostrador y vuelan a su contador.'],
]);
PP('Nada de esto cambia la simulación ni pone tiempos de transporte: el queso cuenta en el momento de producirse; la jaula solo enseña cómo llega.');
const LROW = DIV('ad-row');
const PL = adPhone(LROW, { s: 0.8, dock: 'colony', cap: '<b>En vivo.</b> De la prensa de Cheddar (abajo) al almacén de la superficie (arriba), en un solo encuadre.' });
PL.ph.querySelector('.ad-navl').innerHTML = `<img class="pix" src="${ICON.lot}" alt="">LIFT`;
PL.camX = 0; PL.camY = -VH + 42;
const LGEO = () => { const g = G1(), t = T0(); return { down: g.TR - 9 - t, up: -VH + GR - 11, x: g.o + 133, press: [g.o + 124, g.TR - 5 - t], land: [g.o + 131, g.TR + 1 - t], door: [VPOS.pantry[0] - 184 + 32, -VH + GR - 4], counter: [VPOS.shop[0] - 184 + 12, -VH + GR - 18] }; };
const L2 = lift2({ get down() { return LGEO().down; }, get up() { return LGEO().up; } });
const FXL = fxOf(PL);
on41((e) => { if (e.type === 'cookDone') { if (BR.cook) BR.cook.newWheel = 0; L2.addWheel(performance.now()); FXL.emit('lot', LGEO().press, 1, e.source === 'manual'); } if (e.type === 'sellDone') { FXL.emit('coin', LGEO().counter, 2.4e12, false); react('keeper', 'greet'); } });
LIFT.queue = 0; LIFT.state = 'off';
PL.tick = (now) => L2.tick(now);
PL.draw = (g, now) => {
  g.fillStyle = '#4c5f98'; g.fillRect(PL.camX - 2, PL.camY - 2, PL.vw + 4, PL.vh + 4); g.drawImage(WORLD.vill, -184, -VH); g.drawImage(WORLD.ched, 0, 0);
  const L = LGEO(), x = L.x, y = Math.round(L2.y), R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
  R2(x + 4, -VH + 30, 1, y + VH - 30, '#c8c2d4');
  R2(x - 1, y - 1, 12, 13, INK); R2(x, y, 10, 11, '#5a5a68'); R2(x + 1, y + 1, 8, 9, '#2a2a36'); R2(x, y, 10, 1, '#8a8496');
  for (let i = 0; i < Math.min(3, L2.cargo); i++) wheelTok(x + 3 + (i % 2) * 4, y + 9 - Math.floor(i / 2) * 3);
  const gh = Math.round(9 * (1 - L2.gate)); for (let k = 0; k < gh; k += 2) R2(x + 1, y + 1 + k, 8, 1, '#a0a0b0');
  for (const w of L2.ramp) { const k = Math.min(1, (now - w.t0) / 600), e = k * k; wheelTok(Math.round(L.press[0] + (L.land[0] - L.press[0]) * e), Math.round(L.press[1] + (L.land[1] - L.press[1]) * e)); }
  for (let i = 0; i < L2.landing; i++) wheelTok(L.land[0] - 4 - i * 6, L.land[1]);
  for (const w of L2.out) { const k = Math.min(1, (now - w.t0) / 420), e = k * (2 - k); wheelTok(Math.round(x + 2 + (L.door[0] - x - 2) * e), Math.round(y + 8 + (L.door[1] - y - 8) * e)); }
  R2(L.press[0] - 2, L.press[1] + 2, L.land[0] - L.press[0] + 6, 2, '#7a5a3a'); R2(L.press[0] - 2, L.press[1] + 2, L.land[0] - L.press[0] + 6, 1, '#a07a4a');
};
const LB = BOX0(LROW);
function BOX0(el) { const d = document.createElement('pre'); d.className = 'ad-box'; d.style.minWidth = '260px'; el.appendChild(d); return d; }
setInterval(() => { const st = { open: 'abierta, esperando ruedas', closing: 'cerrando la puerta', up: 'subiendo', unload: 'descargando en el almacén', down: 'bajando vacía' }[L2.st]; LB.textContent = `Jaula: ${st}\nEn la jaula: ${L2.cargo} · esperando en el rellano: ${L2.landing}\nEn la rampa: ${L2.ramp.length}`; }, 300);

// ---------- ART DIRECTION · la página (F, G, H, I y decisiones) ----------
// ================= F · ANIMACIONES Y SONIDOS =================
H2('F', 'F · AUDITORÍA DE ANIMACIONES Y SONIDOS', 'Cada oficio con una acción que se entiende: preparación, acción principal, resultado visible y vuelta al reposo. Solo con poses aprobadas de MICE; lo que se mueve de más es la máquina.');
H3('El pico: la animación de minería aprobada como referencia');
const PICKSH = SHEET(1000, 300);
function pickSheet() {
  const k = 4, [c, g] = PICKSH; g.fillStyle = '#2a1d14'; g.fillRect(0, 0, 1000, 300); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  const rowY = [40, 140, 240], labels = ['Aprobada (swing_player): trabajador genérico', 'Propuesta: ratón oficial + el mismo pico, mismos 5 fotogramas', 'V4.1 (a sustituir): pico nuevo, otro dibujo'];
  labels.forEach((t, r) => g.fillText(t, 10, rowY[r] - 8 + (r ? 0 : 0)));
  const m = mouseCanvas(CREW.cheddar.miner, 0, false, {}), sw = im('out/anims/swing_player.png');
  for (let f = 0; f < 5; f++) {
    const x = 10 + f * 36 * k;
    g.drawImage(sw, f * 32, 0, 32, 20, x, rowY[0], 32 * k, 20 * k);
    const pk = approvedPick(f); g.drawImage(m, x, rowY[1], 22 * k, 20 * k); if (pk) g.drawImage(pk, x + PICKDX * k, rowY[1] + PICKDY * k, 32 * k, 20 * k);
    g.drawImage(m, x, rowY[2], 22 * k, 20 * k); g.drawImage(artPick([1, 1, 0, 2, 1][f]), x + 9 * k, rowY[2] - 1 * k, 12 * k, 12 * k);
  }
}
setTimeout(pickSheet, 300);
PP('<span class="ad-cap">Fila 2: el pico se recorta del dibujo aprobado, no se redibuja. Es un accesorio sobre el ratón oficial y <b>necesita tu validación</b> antes de usarlo en el minero y en el ratón del jugador.</span>');
// Tiras por oficio: un bucle de 2,6 s con sus cuatro fases rotuladas.
const STRIPS = [];
function strip(title, cap, fn) { const f = document.createElement('figure'), c = document.createElement('canvas'); c.width = 84 * 3; c.height = 52 * 3; f.appendChild(c); const fc = document.createElement('figcaption'); fc.innerHTML = `<b>${title}</b> · ${cap}`; f.appendChild(fc); STRIP_EL.appendChild(f); const art = document.createElement('canvas'); art.width = 84; art.height = 52; STRIPS.push({ c, art, fn, title }); }
const STRIP_EL = DIV('ad-strips');
const PHASES = [[0, 600, 'REPOSO'], [600, 900, 'PREPARACIÓN'], [900, 1200, 'ACCIÓN'], [1200, 1800, 'RESULTADO'], [1800, 2200, 'RECUPERACIÓN'], [2200, 2600, 'REPOSO']];
const phaseOf = (t) => PHASES.find(([a, b]) => t >= a && t < b) || PHASES[0];
WORLD.hooks.push((now) => {
  for (const s of STRIPS) {
    const t = now % 2600, loop = Math.floor(now / 2600), g = s.art.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 84, 52);
    g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 84, 52); g.fillStyle = '#4e3826'; g.fillRect(0, 44, 84, 8); g.fillStyle = '#6a4c30'; g.fillRect(0, 44, 84, 1);
    const was = ctx; ctx = g; try { s.fn(g, t, loop, now); } finally { ctx = was; }
    const o = s.c.getContext('2d'); o.imageSmoothingEnabled = false; o.drawImage(s.art, 0, 0, 252, 156); const ph = phaseOf(t)[2]; o.font = '700 11px system-ui, sans-serif'; o.fillStyle = '#0c0910cc'; o.fillRect(4, 4, o.measureText(ph).width + 10, 18); o.fillStyle = ph === 'REPOSO' ? '#b8b0c8' : '#ffcf2e'; o.fillText(ph, 9, 17);
  }
});
const mz = (g, m, x, feet, o = {}, flip = false, dy = 0, blink = false) => { const cv = mF(m, 0, blink, o); if (flip) { g.save(); g.translate(x + 22, feet - 20 + dy); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20 + dy); };
const inP = (t, a, b) => t >= a && t < b;
const chipsAt = (g, x, y, t0, t, cols) => { const k = (t - t0) / 600; if (k < 0 || k > 1) return; for (let i = 0; i < 5; i++) { const vx = (i - 2) * 6, px = Math.round(x + vx * k), py = Math.round(y - 10 * k + 22 * k * k - i % 2); g.fillStyle = cols[i % cols.length]; g.fillRect(px, py, k < 0.6 ? 2 : 1, k < 0.6 ? 2 : 1); } };
strip('MINE', 'pico aprobado (5 fotogramas). Prepara (levanta), golpea (la roca se sacude y destella), saltan trozos y la grieta crece; vuelve al reposo.', (g, t, loop) => {
  const crack = loop % 5, hitAt = 900; g.drawImage(frameOf(ROCKC[Math.min(4, crack + (t >= hitAt ? 1 : 0)) % 5], 54), 34 + (inP(t, hitAt, hitAt + 60) ? 1 : 0), 4);
  const f = inP(t, 600, 900) ? 2 : inP(t, 900, 1000) ? 3 : inP(t, 1000, 1300) ? 4 : Math.floor(t / 300) % 2, m = CREW.cheddar.miner;
  mz(g, m, 13, 44, inP(t, 900, 1100) ? { face: 'grump' } : {}); const pk = approvedPick(f); if (pk) g.drawImage(pk, 13 + PICKDX, 24 + PICKDY);
  chipsAt(g, 42, 30, hitAt, t, ['#9aa0b4', '#c8ccd8', '#6a7088']); if (inP(t, hitAt, hitAt + 60)) { g.fillStyle = '#fff6b0'; g.fillRect(40, 27, 1, 5); g.fillRect(38, 29, 5, 1); }
});
strip('DRILL', 'mira el manómetro (lupa), acciona el cuadro (se agacha; la palanca baja y la luz pasa a verde), el volante gira y sale el Raw; vuelve a mirar.', (g, t) => {
  const run = t >= 900 && t < 2000; g.drawImage(artDrill(), 44, 13); g.drawImage(artWheel(run ? Math.floor(t / 80) % 3 : 0), 52, -1);
  g.drawImage(artPanel(), 30, 30); g.fillStyle = run ? '#62d36e' : '#ffb347'; g.fillRect(32, 34, 2, 2); g.fillStyle = INK; g.fillRect(36, inP(t, 900, 1100) ? 36 : 33, 1, 3);
  mz(g, CREW.cheddar.driller, 9, 44, inP(t, 600, 900) ? { glass: true } : inP(t, 1200, 1600) ? { face: 'happy', tail: true } : {}, false, inP(t, 900, 1000) || inP(t, 1050, 1150) ? 1 : 0);
  if (inP(t, 1200, 1800)) { const k = (t - 1200) / 600; rawTok(66 + Math.round(k * 8), Math.round(40 - Math.sin(k * Math.PI) * 8)); }
});
strip('REFINE', 'mira el fuego, lo aviva dos veces (el fuego crece), el alambique suelta vapor y sale una barra de Base a la bandeja; se relaja.', (g, t) => {
  const pw = inP(t, 900, 1300) ? 1 : inP(t, 1300, 1800) ? 0.7 : 0.3; g.drawImage(artFurnace(), 44, 6); fire(54, 25, 10, 12, t, pw); g.drawImage(artStill(), 18, 10); g.drawImage(artTray(), 22, 38);
  if (t >= 1300) g.drawImage(artBar(), 24 + Math.round(Math.min(1, (t - 1300) / 300) * 4), 37);
  if (inP(t, 1200, 1700)) { const k = (t - 1200) / 500; g.globalAlpha = 0.6 * (1 - k); disc(26, 8 - Math.round(k * 6), 2 + Math.round(k * 2), '#e8e4f0'); g.globalAlpha = 1; }
  mz(g, CREW.cheddar.refiner, 30, 44, inP(t, 600, 900) ? { ear: true } : inP(t, 1800, 2200) ? { tail: true } : {}, false, inP(t, 900, 1000) || inP(t, 1100, 1200) ? 1 : 0);
});
strip('CHEESE', 'se coloca en la prensa, aprieta (la prensa baja a pasos), sale la rueda (cara de sorpresa) y rueda por la rampa; vuelve a su sitio.', (g, t) => {
  g.drawImage(artVat(), 8, 28); g.drawImage(artPress(inP(t, 900, 1200) ? Math.floor((t - 900) / 100) % 2 : 0), 46, 28);
  if (t >= 1200 && t < 2200) { const k = Math.min(1, (t - 1200) / 700); wheelTok(Math.round(56 + k * 22), Math.round(41 - Math.sin(Math.min(1, k * 2) * Math.PI) * 4)); }
  g.fillStyle = '#7a5a3a'; g.fillRect(56, 43, 26, 1);
  mz(g, CREW.cheddar.cook, 26, 44, inP(t, 1200, 1600) ? { face: 'wow' } : inP(t, 1600, 2000) ? { face: 'happy' } : {}, false, inP(t, 900, 1000) || inP(t, 1050, 1150) ? 1 : 0);
});
strip('SELL', 'enseña la rueda, la entrega (se agacha; la rueda sale del mostrador), saltan dos monedas (contento) y repone otra del almacén.', (g, t) => {
  const P = PAL; g.fillStyle = INK; g.fillRect(14, 31, 62, 14); g.fillStyle = P.woo[2]; g.fillRect(15, 32, 60, 12); g.fillStyle = P.woo[0]; g.fillRect(15, 32, 60, 2);
  mz(g, CREW.town.keeper, 40, 36, inP(t, 1200, 1700) ? { face: 'happy', tail: true } : {}, true, inP(t, 900, 1100) ? 1 : 0); g.fillStyle = INK; g.fillRect(14, 31, 62, 1); g.fillStyle = P.woo[1]; g.fillRect(15, 33, 60, 11);
  if (t < 900) wheelTok(30, 30); else if (t < 1200) wheelTok(30 + Math.round((t - 900) / 300 * 50), 30); else if (t > 1900) wheelTok(Math.round(4 + Math.min(1, (t - 1900) / 300) * 26), 30);
  if (inP(t, 1200, 1700)) { const k = (t - 1200) / 500; coinTok(36, Math.round(26 - Math.sin(k * Math.PI) * 10)); coinTok(44, Math.round(26 - Math.sin(Math.max(0, k - 0.15) * Math.PI) * 9)); }
});
strip('LAB', 'lee el cuaderno (pasa página), examina el matraz con la lupa (burbujas), descubre (chispa y sorpresa) y vuelve a leer.', (g, t) => {
  const P = PAL; g.fillStyle = INK; g.fillRect(44, 32, 34, 13); g.fillStyle = P.wod[2]; g.fillRect(45, 33, 32, 11); g.fillStyle = P.wod[1]; g.fillRect(45, 33, 32, 2);
  g.fillStyle = INK; g.fillRect(57, 20, 9, 13); g.fillStyle = PAL.gla[1]; g.fillRect(58, 21, 7, 11); g.fillStyle = t >= 1200 && t < 1800 ? '#8af0a0' : '#4ac070'; g.fillRect(58, 26, 7, 6);
  if (inP(t, 900, 1800)) for (let i = 0; i < 3; i++) { const y = 31 - ((t / 90 + i * 4) % 10); g.fillStyle = '#e8fff0'; g.fillRect(60 + i * 2, Math.round(y), 1, 1); }
  mz(g, CREW.town.sci, 28, 44, inP(t, 0, 600) || t >= 2200 ? { book: 1 } : inP(t, 600, 900) ? { book: 2 } : inP(t, 900, 1200) ? { glass: true } : inP(t, 1200, 1600) ? { face: 'wow', spark: true } : { face: 'happy' });
});
strip('HOUSE', 'sin puesto, descansa: duerme en la cama (Z que suben), respira y parpadea. Si se le da un puesto, se despierta (sorpresa) y sale.', (g, t, loop) => {
  const P = PAL; g.fillStyle = '#2e2218'; g.fillRect(0, 0, 84, 44); g.fillStyle = P.woo[2]; g.fillRect(20, 36, 40, 6); g.fillStyle = P.woo[1]; g.fillRect(20, 36, 40, 1); g.fillStyle = P.woo[3]; g.fillRect(18, 30, 3, 14); g.fillRect(58, 33, 3, 11);
  const wake = loop % 3 === 2 && inP(t, 900, 1800);
  mz(g, CREW.town.idle, 22, 40, wake ? { face: 'wow' } : { face: 'sleep' }, false, wake && inP(t, 900, 1000) ? -2 : 0);
  g.fillStyle = '#6a7ac8'; g.fillRect(24, 32, 36, 6); g.fillStyle = '#9aa8e8'; g.fillRect(24, 32, 36, 1);
  if (!wake) { const z = Math.floor(t / 500) % 3; g.fillStyle = '#bfe8fd'; for (let i = 0; i <= z; i++) { g.fillRect(40 + i * 4, 18 - i * 4, 3, 1); g.fillRect(42 + i * 4, 19 - i * 4, 1, 1); g.fillRect(40 + i * 4, 20 - i * 4, 3, 1); } }
});
TB(['OFICIO', 'HOY (V4.1)', 'REUTILIZADO (APROBADO)', 'NUEVO / PENDIENTE', 'PROBLEMA QUE RESUELVE'], [
  ['<b>MINE</b>', 'Ratón oficial + pico nuevo que sube y baja.', 'Ratón oficial; el dibujo y los 5 fotogramas del pico aprobado; cara de esfuerzo.', 'El pico recortado como accesorio sobre el ratón (validar).', 'El pico no era el aprobado y el golpe no tenía preparación.'],
  ['<b>DRILL</b>', 'Se mueve 1 px junto al cuadro.', 'Lupa, cara contenta, cola.', 'Palanca y luz del cuadro (máquina).', 'No se entendía qué hacía el perforador.'],
  ['<b>REFINE</b>', 'Se agacha junto al horno.', 'Oreja, cola.', 'Fuego que crece con la atizada; vapor; la barra de Base a la bandeja (máquina).', 'Balanceo sin causa.'],
  ['<b>CHEESE</b>', 'Prensa, remueve, lee; acarrea la rueda en la pata.', 'Cara de sorpresa y contenta.', 'Rampa de la prensa al rellano (máquina). Se quita la rueda en la pata.', 'Accesorio sin aprobar; poses recicladas.'],
  ['<b>SELL</b>', 'Quieto tras el mostrador.', 'Cara contenta, cola.', 'La rueda sale del mostrador y otra la repone; monedas.', 'La venta no tenía gesto.'],
  ['<b>LAB</b>', 'Pasea frente al laboratorio.', 'Libro (pasa página), lupa, chispa, sorpresa.', 'Burbujas del matraz.', 'Pasear no es investigar.'],
  ['<b>HOUSE</b>', 'Quieto en la puerta.', 'Cara de dormir, parpadeo.', 'Cama y Z (las de la ficha aprobada).', 'No transmitía descanso.'],
]);
H3('Sonidos');
TB(['SONIDO', 'DÓNDE SUENA', 'ORIGEN', 'ESTADO'], [
  ['hit · crit · reveal', 'Golpe a mano (sube con el combo), crítico, veta descubierta.', 'Juego actual (js/ui/sfx.js)', '<span class="ad-k keep">Existe</span>'],
  ['start · boost', 'Arrancar un ciclo a mano y acelerarlo.', 'Juego actual', '<span class="ad-k keep">Existe</span>'],
  ['raw · base · lot', 'Producir a mano: campanilla que sube por una escala pentatónica en racha.', 'Juego actual', '<span class="ad-k keep">Existe</span>'],
  ['soft (raw, base, lot, coin)', 'Lo que producen los ratones: latido grave cada 2,6 s como mucho; la caja de la tienda, cada 5,2 s.', 'Juego actual', '<span class="ad-k keep">Existe</span>'],
  ['coin · newRock · denied', 'Venta a mano, bajar de nivel, acción imposible.', 'Juego actual', '<span class="ad-k keep">Existe</span>'],
  ['upgrade · build · goal · bell · legend · quirk · jackpot · walkout · click', 'Mejoras, construir, objetivos, rasgos, botones.', 'Juego actual', '<span class="ad-k keep">Existe</span>'],
  ['thunk', 'Golpe de pico en V4/V4.1 (también el del minero, más suave).', 'Nuevo en MAIN 2.0', '<span class="ad-k rebuild">Sin aprobar</span>'],
  ['tink de crítico', 'Crítico en V4/V4.1.', 'Nuevo en MAIN 2.0', '<span class="ad-k rebuild">Sin aprobar</span>'],
  ['chime', 'Veta descubierta en V4/V4.1.', 'Nuevo en MAIN 2.0', '<span class="ad-k rebuild">Sin aprobar</span>'],
  ['denied (propio)', 'Acción imposible en V4.1.', 'Nuevo en MAIN 2.0 (duplica el del juego)', '<span class="ad-k rebuild">Sin aprobar</span>'],
]);
UL(['<b>Esta página no suena.</b>', '<b>V4.1 actualizado:</b> por defecto suena con los sonidos del juego actual en los mismos momentos que MAIN; los cuatro nuevos tienen su propio interruptor, apagado. No añado ninguno más hasta tener una dirección sonora.']);

// ================= G · GOUDA =================
H2('G', 'G · GOUDA: OTRO CAPÍTULO DEL MISMO MUNDO', 'Muestra pequeña: la refinería de Gouda con el lenguaje de Cheddar (contorno, luz, rampas de 5 tonos, escala), pero con su propio material: piedra gris azulada en bloques, latón en vez de cobre, la cera roja como acento y luz fría.');
const GPAL = { wall: ['#6a7480', '#545e6a', '#424a56', '#323842', '#22262e'], brs: ['#fff0b0', '#e8c060', '#c09030', '#8a6420', '#4e3612'], wax: ['#ff8a7a', '#e04a3a', '#b02a20', '#7a1a18', '#4a0e0e'], teal: ['#d8fff4', '#8ff3d0', '#4ac8a8', '#2a8a74', '#145044'] };
function goudaVignette() {
  const c = PB(132, 84), P = PAL;
  masonry(c, 0, 0, 132, 84, GPAL.wall.map((x) => mixc(x, '#000000', 0.25)), 6, 31);
  for (let i = 0; i < 70; i++) { const x = Math.floor(hh2(i, 41) * 132), y = Math.floor(hh2(i, 42) * 76); c.rect(x, y, 3 + (i % 4), 1, hh2(i, 43) < 0.5 ? mixc(GPAL.wall[3], '#000', 0.3) : mixc(GPAL.wall[1], '#000', 0.2)); }
  for (const [x, y] of [[96, 12], [112, 30], [24, 6]]) for (let k = 0; k < 7; k++) c.px(x + (k % 2), y + k, mixc(GPAL.wall[4], '#000', 0.3));
  // Repisa de piedra con canto de cera roja.
  vbox(c, 0, 50, 70, 8, PAL.stn, { side: 2, ao: 1, top: 2 }); c.hline(1, 56, 68, GPAL.wax[1]); c.hline(1, 57, 68, GPAL.wax[3]);
  c.rect(4, 58, 6, 26, INK); c.rect(5, 58, 4, 26, PAL.stn[2]); c.rect(60, 58, 6, 26, INK); c.rect(61, 58, 4, 26, PAL.stn[2]);
  // Horno de bloques de piedra con boca de latón.
  c.rect(6, 18, 28, 32, INK); masonry(c, 7, 19, 26, 31, PAL.stn, 4, 7); c.fill((x, y) => ((x - 20) ** 2 / 64 + (y - 42) ** 2 / 90 <= 1) && y < 50, (x, y) => (y < 38 ? GPAL.brs[1] : GPAL.brs[2]), 11, 30, 30, 50); c.fill((x, y) => ((x - 20) ** 2 / 30 + (y - 43) ** 2 / 60 <= 1) && y < 50, (x, y) => (y > 46 ? '#ffd060' : y > 43 ? '#ff8a2e' : y > 40 ? '#c83a10' : '#1a0c08'), 13, 34, 28, 50); c.hline(15, 49, 11, '#fff2b0');
  c.rect(16, 6, 8, 12, INK); c.rect(17, 6, 6, 12, PAL.stn[2]); c.vline(17, 6, 12, PAL.stn[1]);
  // Alambique de latón con su serpentín.
  c.ell(48, 36, 10, 11, INK); c.ell(48, 36, 9, 10, (x, y) => faceTone(GPAL.brs, x, y, 39, 26, 18, 20, 0.04)); c.rect(43, 30, 2, 4, GPAL.brs[0]); c.px(44, 29, '#ffffff'); c.hline(39, 40, 18, GPAL.brs[3]); c.rect(45, 20, 6, 8, INK); c.rect(46, 21, 4, 7, GPAL.brs[2]); c.line(51, 22, 62, 28, INK); c.line(51, 23, 62, 29, GPAL.brs[3]);
  for (let y = 30; y < 48; y += 3) { c.hline(60, y, 7, INK); c.hline(61, y + 1, 5, PAL.irn[1]); }
  // Farol de luz fría.
  c.rect(74, 26, 1, 6, INK); c.rect(72, 32, 6, 7, INK); c.rect(73, 33, 4, 5, GPAL.teal[1]); c.px(73, 33, GPAL.teal[0]);
  // La roca de Gouda (losas apiladas con vetas de cera) en el suelo.
  c.rect(0, 76, 132, 8, INK); c.rect(0, 77, 132, 7, PAL.stn[3]); c.hline(0, 77, 132, PAL.stn[2]);
  const slabs = [[86, 46, 34, 8], [82, 54, 42, 8], [79, 62, 48, 8], [77, 70, 53, 7]];
  for (const [x, y, w, h] of slabs) { vbox(c, x, y, w, h, PAL.stn, { side: 3, ao: 1, top: 2 }); c.hline(x + 1, y + h - 1, w - 2, GPAL.wax[2]); }
  c.outline(); const cv = c.canvas(), g = cv.getContext('2d'); const pd = (cx, cy, r, col, al) => { g.globalAlpha = al; g.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); } g.globalAlpha = 1; }; for (const [r, al] of [[16, 0.06], [10, 0.08], [5, 0.12]]) pd(75, 36, r, GPAL.teal[1], al); for (const [r, al] of [[14, 0.07], [8, 0.1]]) pd(20, 46, r, '#ff9a3a', al); return cv;
}
function goudaSheet() {
  const k = 3, g1 = geoC(STOPS[1]), top = STOPS[1].top, [c, g] = SHEET(132 * k * 2 + 30, 84 * k + 40); g.fillStyle = '#120f18'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(WORLD.ched, g1.o - 6, g1.t + 8 - top, 132, 84, 0, 0, 132 * k, 84 * k); g.drawImage(goudaVignette(), 132 * k + 30, 0, 132 * k, 84 * k);
  const fm = mouseCanvas(CREW.gouda.refiner, 0, false, {}); g.drawImage(fm, 132 * k + 30 + 26 * k, 30 * k, 22 * k, 20 * k);
  g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8'; g.fillText('Cheddar (V4.1, recorte de la escena)', 6, 84 * k + 26); g.fillText('Gouda (muestra nueva, mismo lenguaje)', 132 * k + 36, 84 * k + 26);
}
goudaSheet();
UL(['<b>Lo que comparte con Cheddar:</b> contorno de tinta de los ratones, luz arriba a la izquierda, rampas de 5 tonos, sombra en trama y la misma escala (la feta oficial está a su lado).', '<b>Lo que la hace Gouda:</b> mampostería en bloques en vez de roca viva, latón en vez de cobre, la cera roja en los cantos y en las losas de la roca, y farol de luz fría.', '<b>Siguiente paso, si te convence:</b> el mismo ejercicio para DRILL y CHEESE de Gouda, sin tocar todavía las otras rocas.']);

// ================= H · ROCAS =================
H2('H', 'H · ROCAS: EXPLORACIÓN DE SILUETAS', 'Tres siluetas por roca, en plano, antes de dibujar materiales y estados. Verde: donde pisa el minero (los 16 px más llanos de arriba). Rojo: donde entra la broca. Naranja: el flanco del andamio del jugador. En rojo, las que no dejan una cresta llana. ★: mi recomendación.');
const RSIL = {
  cheddar: { tint: '#c8a050', opts: [['Canto rodado (hoy)', (x, y) => ((x - 27) / 27) ** 2 + ((y - 40) / 38) ** 2 <= 1], ['Canto con hombro', (x, y) => ((x - 27) / 27) ** 2 + ((y - 40) / 36) ** 2 <= 1 && !(x > 38 && y < 14 + (x - 38))], ['Peña con repisa', (x, y) => inPoly(x + 0.5, y + 0.5, [[2, 41], [4, 18], [12, 8], [34, 6], [44, 12], [52, 24], [54, 41]])]], best: 2 },
  gouda: { tint: '#c86a50', opts: [['Losas apiladas', (x, y) => { const b = Math.floor(y / 10); const i = [10, 6, 2, 0][Math.min(3, b)]; return x >= i && x < 54 - i; }], ['Rueda encerada', (x, y) => ((x - 27) / 27) ** 2 + ((y - 26) / 16) ** 2 <= 1 || (y > 26 && x > 0 && x < 54)], ['Meseta doble', (x, y) => (y > 16 && x > 2 && x < 52) || (y > 4 && x > 12 && x < 40)]], best: 0 },
  brie: { tint: '#e8e0c8', opts: [['Montículo con labio', (x, y) => { const t = Math.abs((x + 0.5 - 27) / 27), u = Math.max(0, t - 0.4) / 0.6; return y >= 40 * (0.16 + 0.8 * u * u) && (y < 34 || (x > 3 && x < 51)); }], ['Gota blanda', (x, y) => ((x - 27) / 26) ** 2 + ((y - 30) / 22) ** 2 <= 1 || (y > 30 && x > 1 && x < 53)], ['Loma baja', (x, y) => y > 14 + ((x - 27) / 27) ** 2 * 20]], best: 0 },
  emmental: { tint: '#e8d080', opts: [['Lomo con ojos', (x, y) => ((x + 0.5 - 27) / 27) ** 4 + ((y + 0.5 - 40) / 38) ** 2 <= 1 && !((x - 8) ** 2 + (y - 22) ** 2 < 14) && !((x - 48) ** 2 + (y - 30) ** 2 < 10)], ['Arco con ventana', (x, y) => ((x - 27) / 27) ** 2 + ((y - 40) / 36) ** 2 <= 1 && !((x - 27) ** 2 / 36 + (y - 34) ** 2 / 36 < 1)], ['Cráter', (x, y) => ((x - 27) / 27) ** 2 + ((y - 40) / 34) ** 2 <= 1 && !(((x - 27) / 10) ** 2 + ((y - 6) / 4) ** 2 < 1)]], best: 0 },
  parmesan: { tint: '#d8b888', opts: [['Bloque facetado', (x, y) => inPoly(x + 0.5, y + 0.5, [[3, 41], [0, 24], [7, 8], [15, 2], [35, 2], [44, 11], [50, 26], [52, 41]])], ['Cristales', (x, y) => inPoly(x + 0.5, y + 0.5, [[2, 41], [4, 20], [10, 10], [14, 4], [20, 12], [22, 4], [34, 4], [36, 12], [42, 2], [48, 16], [52, 41]])], ['Bloque partido', (x, y) => inPoly(x + 0.5, y + 0.5, [[2, 41], [3, 12], [12, 4], [24, 6], [24, 41]]) || inPoly(x + 0.5, y + 0.5, [[27, 41], [27, 8], [40, 4], [50, 14], [52, 41]])]], best: 0 },
  blue: { tint: '#5a7ac8', opts: [['Pizarra en sierra', (x, y) => { const c = x >= 17 && x <= 37; return y >= (c ? 8 : 9 + Math.abs(((x * 7) % 14) - 7) * 0.7 + ((x + 0.5 - 27) / 27) ** 2 * 22); }], ['Estratos', (x, y) => y > 6 + x * 0.25 && y > 40 - (x + 10) * 0.9 && x < 54], ['Geoda', (x, y) => ((x - 27) / 26) ** 2 + ((y - 38) / 34) ** 2 <= 1]], best: 0 },
};
function rockSil() {
  const k = 3, cw = 58, ch = 46, pad = 16, W = 3 * (cw * k + pad) + 150, rows = Object.keys(RSIL).length, [c, g] = SHEET(W, rows * (ch * k + 44) + 10); g.fillStyle = '#1e1824'; g.fillRect(0, 0, c.width, c.height); g.font = '700 13px system-ui, sans-serif';
  Object.entries(RSIL).forEach(([id, r], ri) => {
    const y0 = ri * (ch * k + 44) + 26; g.fillStyle = '#f4ead8'; g.fillText(id.toUpperCase(), 10, y0 + 20);
    r.opts.forEach(([name, fn], oi) => {
      const b = PB(56, 44); b.fill((x, y) => y < 42 && fn(x, y), (x, y) => mixc(r.tint, '#1b1220', 0.35 + (y / 42) * 0.35 - (x / 56) * 0.12)); b.outline();
      // Cresta: los 16 px más llanos de la parte de arriba; broca: el centro, a media altura; andamio: el flanco izquierdo.
      const top = (x) => { for (let y = 0; y < 44; y++) if (b.get(x, y) && b.get(x, y) !== INK) return y; return 44; };
      let best = 0, bs = 1e9; for (let x0 = 4; x0 <= 36; x0++) { const v = []; for (let x = x0; x < x0 + 16; x++) v.push(top(x)); const s = Math.max(...v) - Math.min(...v); if (s < bs) { bs = s; best = x0; } }
      const x0 = 150 + oi * (cw * k + pad), cv = b.canvas();
      g.fillStyle = '#2a2232'; g.fillRect(x0 - 6, y0 - 6, cw * k + 12, ch * k + 12); g.drawImage(cv, x0, y0, 56 * k, 44 * k);
      g.fillStyle = '#62d36e'; for (let x = best; x < best + 16; x++) g.fillRect(x0 + x * k, y0 + (top(x) - 1) * k, k, 2); g.fillStyle = bs <= 2 ? '#62d36e' : '#ffcf2e';
      g.fillStyle = '#ff5a3c'; g.fillRect(x0 + 27 * k - 4, y0 + 26 * k - 4, 8, 8);
      let fy = 30; for (let x = 0; x < 20; x++) if (b.get(x, fy) && b.get(x, fy) !== INK) { g.fillStyle = '#ff9a2e'; g.fillRect(x0 + x * k - 2, y0 + fy * k - 6, 4, 12); break; }
      g.fillStyle = oi === r.best ? '#ffcf2e' : bs > 2 ? '#ff8a96' : '#b8b0c8'; g.fillText((oi === r.best ? '★ ' : '') + name + (bs > 2 ? ' (sin cresta)' : ''), x0, y0 + ch * k + 14);
    });
  });
}
rockSil();
UL(['<b>Qué tiene que tener cada una</b> (y por eso las marco): una cresta donde el minero quepa entero y pise llano (no tiene que ser igual en todas), una cara central para la broca, un flanco libre para el andamio del jugador y una silueta que se reconozca en 54 × 42.', '<b>Siguiente paso:</b> con las siluetas elegidas, un estudio de material de cada una (textura, grietas propias, la veta abierta) y solo después los diez estados de cada roca.']);

// ================= I · PROFUNDIDAD =================
H2('I', 'I · INDICADOR DE PROFUNDIDAD', 'Una flecha hacia abajo que no se puede leer como una cruz, siempre junto a su número; y la roca (el capítulo) separada de la profundidad.');
const ARROW = ['..###..', '..###..', '..###..', '..###..', '#######', '.#####.', '..###..', '...#...'];
function arrowCanvas(col = '#ffcf2e') { const b = PB(9, 10); b.stamp(ARROW, { '#': col }, 1, 1); b.outline(); return b.canvas(); }
function depthArrowHTML() { return `<canvas width="9" height="10" style="width:9px;height:10px;image-rendering:pixelated" data-arrow></canvas>`; }
setInterval(() => document.querySelectorAll('canvas[data-arrow]').forEach((c) => { if (c._d) return; c._d = 1; c.getContext('2d').drawImage(arrowCanvas(), 0, 0); }), 400);
function depthSheet() {
  const k = 4, [c, g] = SHEET(1000, 200); g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 1000, 200); g.imageSmoothingEnabled = false; g.font = '700 13px system-ui, sans-serif';
  g.drawImage(viaCtx(24, 12, () => plaque(1, 1, 81, TH.cheddar)), 20, 40, 24 * k, 12 * k); g.fillStyle = '#f4ead8'; g.fillText('Hoy: el símbolo parece una cruz', 20, 130);
  // Propuesta: placa con flecha de 7 × 8 y el número con los dígitos del juego.
  const pl = viaCtx(26, 14, (gg) => { box(1, 1, 23, 11, TH.cheddar.beam); R(1, 1, 23, 1, TH.cheddar.beamL); ARROW.forEach((r, j) => [...r].forEach((ch, i) => ch === '#' && R(3 + i, 2 + j, 1, 1, '#3a2410'))); digits(81, 13, 4, '#3a2410'); });
  g.drawImage(pl, 330, 36, 26 * k, 14 * k); g.fillStyle = '#f4ead8'; g.fillText('Propuesta: flecha clara y número', 330, 130);
  g.drawImage(arrowCanvas(), 640, 30, 9 * 8, 10 * 8); g.fillText('La flecha (7 × 8), a 8×', 640, 130);
  g.fillStyle = '#b8b0c8'; g.font = '12px system-ui, sans-serif'; g.fillText('Asta de 3 px y punta de 7: a 2,3× en el móvil mide 16 × 19 px.', 640, 150);
}
depthSheet();
const NAVM = DIV('ad-row');
NAVM.innerHTML = `<div class="ad-nav" style="position:static"><i>▲</i><span class="ad-navl"><img class="pix" src="${ICON.raw}" alt="">CHEDDAR</span><span class="ad-navl" style="border-left:0"><span class="ad-dep">${depthArrowHTML()}81</span></span><i>▼</i></div><div class="ad-nav" style="position:static"><i>▲</i><span class="ad-navl"><img class="pix" src="${ICON.raw}" alt="">CHEDDAR · 81</span><i>▼</i></div>`;
PP('<span class="ad-cap">Izquierda, propuesta: la roca (icono y nombre) y la profundidad (flecha y número) en dos piezas. Derecha, hoy: una sola etiqueta.</span>');

// ================= DECISIONES =================
H2('OK', 'QUÉ NECESITO QUE DECIDAS', 'Antes de la segunda entrega (MAIN 2.0 integrada), estas decisiones:');
UL([
  '<b>B · Edificios:</b> ¿valen estas cuatro siluetas (cuña de queso, torre con cúpula, puesto con toldo, almacén con polea) como dirección? Si sí, las pulo y hago sus estados.',
  '<b>C · Superficie:</b> ¿un pueblo más ancho que la pantalla, que se abre en el mercado y se desliza hacia el laboratorio y la casa?',
  '<b>D · Bocadillos:</b> ¿globo crema con punta para el diálogo y placa ámbar en la máquina para los avisos? ¿Te valen las frases y su ritmo?',
  '<b>E · Recursos:</b> ¿contadores de Raw, Base y queso en el HUD con los iconos que vuelan, y el montacargas con rampa y jaula que carga y sale?',
  '<b>F · Pico:</b> ¿usar el pico de la animación aprobada sobre los ratones oficiales (minero y jugador)? Es el único accesorio que propongo.',
  '<b>F · Sonido:</b> ¿V4.1 con los sonidos del juego y los nuevos apagados hasta tener una dirección sonora?',
  '<b>G · Gouda:</b> ¿bloques de piedra, latón y cera como lenguaje de Gouda?',
  '<b>H · Rocas:</b> una silueta por roca (marcadas con ★, o la que prefieras).',
  '<b>I · Profundidad:</b> ¿flecha y número en una pieza propia, separada del nombre de la roca?',
]);
window.AD = { L2, TK, FX, FXL, PD, PE, PL, PC };
// ---- Bucle ----
setInterval(() => worldTick(), 16);

});

</script>
