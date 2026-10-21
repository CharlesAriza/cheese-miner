// ---------- HOUSE SLEEP · poses estáticas, capas de la cama y HOUSE III · la página ----------
const MK = 7; // píxeles de pantalla por píxel de arte (móvil de DPR 3)
const CARDS = [];
function card(parent, title, w, h, draw, { cap = '', scale = KPX } = {}) {
  const f = document.createElement('figure'); f.className = 'ev-card';
  const c = document.createElement('canvas'); c.width = w * MK; c.height = h * MK; c.style.width = Math.round(w * scale) + 'px'; c.style.maxWidth = '100%'; c.style.height = 'auto';
  f.innerHTML = `<div class="ev-ct"><b>${title}</b></div>`; f.appendChild(c);
  if (cap) { const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.appendChild(fc); }
  parent.appendChild(f); const g = c.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; draw(g); return f;
}
const CARDROW = () => DIV('ev-cards');
const room = (g, w, h, floor) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let y = 2; y < floor; y += 5) for (let x = (y % 10 ? 0 : 6); x < w; x += 12) { g.fillStyle = '#33251a'; g.fillRect(x, y, 10, 1); } g.fillStyle = '#5a4028'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#7a5838'; g.fillRect(0, floor, w, 1); for (let x = 0; x < w; x += 7) { g.fillStyle = '#4a3420'; g.fillRect(x, floor + 1, 1, h - floor - 1); } };
const grass = (g, w, h, floor) => { g.fillStyle = '#5a7a48'; g.fillRect(0, 0, w, h); g.fillStyle = '#3e5a32'; g.fillRect(0, floor, w, h - floor); };
const MICE3 = [CREW.town.idle, CREW.cheddar.cook, CREW.gouda.cook];
// Una pose sola, de pie sobre una línea de suelo (C, con su almohada detrás y su manta: es parte de la pose).
function poseAlone(g, x, floor, m, key) {
  const cv = poseCanvas(m, key);
  if (key !== 'C') { g.drawImage(cv, x, floor - cv.height + 1); return; }
  const sy = floor - cv.height + 1; g.drawImage(pillowUp(), x - 3, floor - 9); g.drawImage(cv, x, sy);
  blanket3(g, x + 24, (xx) => Math.min(floor - 1, xx <= x + 16 ? sy + 12 : xx >= x + 20 ? floor - 4 : floor - 2), () => x + 10, floor, -1);
  g.drawImage(poseCanvas(m, 'Cp'), x, sy);
}

PP('<b>Entrega corta</b>, centrada en lo que pediste: <b>tres poses estáticas</b> para dormir, sin animar; la causa del fallo de capas de la cama y la regla para que no vuelva a pasar; y los ajustes de <b>HOUSE III</b>. REFINE, la evolución de HOUSE y LAB y el BOOST quedan como los aprobaste; los módulos de BOOST de MINE, CHEESE y SELL van en la siguiente entrega. Nada toca el juego.');

// ================= A · POSES =================
H2('A', 'A · HOUSE SLEEP: TRES POSES ESTÁTICAS', 'Mismo ratón, mismas proporciones: la cabeza oficial píxel a píxel y el cuerpo recogido. Nada girado ni estirado.');
H3('La elegida: tapado y destapado');
{ const R = CARDROW(); for (const [st, n, cap] of [['covered', 'Tapado', 'El ratón acurrucado con la manta hasta la cabeza; sin el embozo blanco.'], ['uncovered', 'Destapado', 'El mismo ratón acurrucado (pose A), con la manta doblada a los pies.']]) card(R, n, 74, 30, (g) => { room(g, 74, 30, 25); g.drawImage(mouseCanvas(CREW.town.idle, 0, false, {}), 1, 5); sleepBed(g, 26, 3, CREW.town.idle, st); }, { cap }); }
function chosenSheet() {
  const k = 6, [c, g] = SHEET(624, 504); const o = document.createElement('canvas'); o.width = 104; o.height = 84; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#3a2a1e'; x.fillRect(0, 0, 104, 84);
  MICE3.forEach((m, i) => { x.fillStyle = '#5a4028'; x.fillRect(0, 24 + i * 28, 104, 3); sleepBed(x, 2, 2 + i * 28, m, 'covered'); sleepBed(x, 54, 2 + i * 28, m, 'uncovered'); });
  g.drawImage(o, 0, 0, 104 * k, 84 * k);
}
chosenSheet();
UL([
  '<b>Decidido (21-10-2026):</b> dormido y tapado es el ratón acurrucado con la manta hasta la cabeza, la que elegiste, ya sin los píxeles blancos del embozo; destapado es el mismo ratón acurrucado (A). B y C quedan descartadas.',
  '<b>Capas:</b> destapado, la manta doblada va detrás del ratón (capa 3); tapado, la manta va delante (capa 5) y llega justo hasta la cara.',
  'Lo que sigue en esta sección es la propuesta que llevó a la decisión, tal como la viste.',
]);
function poseSheet() {
  const k = 6, [c, g] = SHEET(1080, 470); g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 1080, 470); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  const cols = [['Oficial, de pie', 8], ['A · Acurrucado', 172], ['B · De lado, compacto', 482], ['C · Semitumbado, manta parcial', 806]];
  for (const [n, x] of cols) g.fillText(n, x, 18);
  MICE3.forEach((m, i) => {
    const o = document.createElement('canvas'); o.width = 180; o.height = 24; const x = o.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(mouseCanvas(m, 0, false, {}), 0, 2); poseAlone(x, 28, 21, m, 'A'); poseAlone(x, 80, 21, m, 'B'); poseAlone(x, 137, 21, m, 'C');
    g.fillStyle = '#2e2118'; g.fillRect(0, 30 + i * 146 + 21 * k + k, 1080, 2); g.drawImage(o, 0, 30 + i * 146, 180 * k, 24 * k);
  });
}
poseSheet();
PP('<span class="ad-cap">A 6×, con tres ratones distintos (pelo, sombrero y bufanda). La línea oscura es el suelo: las tres poses se apoyan en ella.</span>');
TB(['POSE', 'QUÉ ES', 'TAMAÑO'], [
  ['<b>Oficial de pie</b>', 'El sprite aprobado de MICE, sin tocar.', '16 × 13 px de ratón (20 con la cola), más el sombrero.'],
  ['<b>A · Acurrucado</b>', 'El cuerpo es una bola (el volumen del torso y las patas oficiales, recogido) que sube por detrás de la cabeza. La oreja descansa sobre la bola, la barbilla sobre las patas delanteras y la cola la rodea por abajo. Ojos cerrados con la cara oficial de dormir.', '21 × 9 px. Más bajo que el de pie, apenas más ancho.'],
  ['<b>B · De lado, compacto</b>', 'La misma bola, un poco girada hacia nosotros: enseña la barriga clara, las plantas de las patas de atrás y las de delante juntas bajo la barbilla. La cola sube en gancho por detrás.', '24 × 9 px, cola incluida.'],
  ['<b>C · Semitumbado</b>', 'La mitad de arriba del ratón oficial (cabeza, pecho, brazo y bufanda) con la espalda en una almohada alta y la cabeza 1 px hacia atrás. De cintura para abajo, las piernas bajo la manta; las patas delanteras encima de ella.', 'La parte visible mide lo mismo que el oficial de cintura para arriba.'],
]);
UL([
  '<b>Cómo están hechas:</b> la cabeza (con la oreja, el hocico y la mejilla) es la oficial, copiada fila a fila, con la cara oficial de dormir. El cuerpo lo he dibujado a mano para cada pose con las mismas letras de paleta que el ratón oficial (pelo claro, medio y oscuro, barriga, patas y cola), así que cambia de color con cada ratón. Sombrero y bufanda salen de las mismas reglas que el sprite oficial; la mochila se quita y se cuelga en la cama.',
  '<b>Lo que no he hecho:</b> girar, escalar ni estirar el sprite de pie. La cabeza no se mueve de su sitio respecto a la oreja y el sombrero, y ninguna pose es más larga que el ratón de pie con su cola más 4 px.',
  '<b>El sprite oficial no cambia.</b> Son tres plantillas nuevas, para aprobar o descartar.',
]);
H3('En la cama, a escala real de móvil');
{ const R = CARDROW(); for (const [k, n, cap] of [['A', 'A · Acurrucado', 'Manta sobre la grupa; lomo, oreja y cabeza a la vista.'], ['B', 'B · De lado', 'Manta sobre la cadera; se ve la barriga.'], ['C', 'C · Semitumbado', 'Manta hasta el regazo; las patas, encima.']]) card(R, n, 74, 30, (g) => { room(g, 74, 30, 25); g.drawImage(mouseCanvas(CREW.town.idle, 0, false, {}), 1, 5); bedScene(g, 26, 3, CREW.town.idle, k); zzz3(g, 26 + 30, 3); }, { cap }); }
PP('<span class="ad-cap">Cada tarjeta, con el ratón oficial de pie al lado y a la misma escala (2,33 px por píxel de arte, como en un móvil de densidad 3). Las Z son fijas: no hay nada animado.</span>');
H3('En la cama, ampliado (6×)');
function bedSheet() {
  const k = 6, [c, g] = SHEET(990, 330); g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 990, 330);
  const o = document.createElement('canvas'); o.width = 165; o.height = 55; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#3a2a1e'; x.fillRect(0, 0, 165, 55);
  x.fillStyle = '#5a4028'; x.fillRect(0, 24, 165, 3); x.fillRect(0, 52, 165, 3);
  ['A', 'B', 'C'].forEach((kk, j) => { bedScene(x, 2 + j * 54, 2, CREW.cheddar.cook, kk); bedScene(x, 2 + j * 54, 30, CREW.gouda.cook, kk, { blanket: kk === 'C' }); });
  g.drawImage(o, 0, 0, 165 * k, 55 * k);
}
bedSheet();
PP('<span class="ad-cap">Arriba, con manta; abajo, A y B sin manta (y C, que siempre la lleva). La cama es más corta que la anterior (colchón de 36 px), a la medida del ratón acurrucado.</span>');
UL([
  '<b>La manta se adapta al ratón, no al revés:</b> en cada columna su borde va 1 px por encima del contorno del ratón, así que se ve la forma de la bola debajo. Por detrás baja al colchón en pendiente, como una tela, y por delante cae en diagonal con el embozo blanco. La cabeza, oreja incluida, va siempre delante: la manta nunca la tapa.',
  '<b>Cuánto tapa:</b> solo la grupa en A y la cadera en B. Si la manta llega a la oreja, el cuerpo desaparece y volvemos a «una cabeza y una manta»; lo probé y lo descarto.',
  '<b>Mi recomendación:</b> <b>A</b> para dormir (es la que mejor se lee a tamaño real y la más «MICE»), y <b>C</b> como pose de paso para meterse y salir de la cama: el ratón se sienta (C), se acurruca (A) y al despertar vuelve a C antes de levantarse. Así la animación no necesita ningún fotograma deformado. B queda como alternativa a A.',
]);

// ================= B · CAPAS =================
H2('B', 'B · EL FALLO DE CAPAS DE LA CAMA', 'Por qué el ratón salía por detrás de la manta, y la regla para la animación nueva.');
function bugSheet() {
  const k = 5, [c, g] = SHEET(1140, 260); g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, 1140, 260); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8';
  [[10020, 'Al bajar de la cama (10,0 s)'], [10300, 'Al irse (10,3 s)']].forEach(([t, n], i) => {
    const o = document.createElement('canvas'); o.width = 112; o.height = 44; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; room(x, 112, 44, 38); sceneLie(x, 52, 16, CREW.town.idle, t);
    const x0 = 10 + i * 570; g.fillText(n, x0, 18); g.drawImage(o, x0, 28, 112 * k, 44 * k);
    g.strokeStyle = '#ff2a6a'; g.lineWidth = 3; g.setLineDash([8, 6]); g.strokeRect(x0 + 55 * k, 28 + 25 * k, 10 * k, 9 * k); g.setLineDash([]);
  });
}
bugSheet();
PP('<span class="ad-cap">Dos fotogramas de la demo anterior (con la pose ya descartada), a 5×. En el recuadro rosa, la manta doblada pintada por encima del ratón cuando debería quedar detrás.</span>');
TB(['QUÉ PASABA', 'POR QUÉ (ev2_lie.js, sceneLie)'], [
  ['El ratón sale por detrás de la manta al levantarse, al bajar y al irse.', 'En esas fases la manta doblada se pintaba <b>después</b> del ratón, y estaba justo en el pie de la cama, por donde pasa el ratón al bajar.'],
  ['La manta aparece de golpe al tumbarse.', 'Mientras el ratón entra y sube no se pintaba ninguna manta; aparecía doblada al empezar a tumbarse.'],
  ['La mochila aparece y desaparece de golpe en el pie de la cama.', 'Se pintaba solo mientras el ratón estaba tumbado; no había un momento en el que se la quitara o se la pusiera.'],
]);
H3('La regla de capas para la animación nueva');
TB(['CAPA (DE ATRÁS ADELANTE)', 'QUÉ VA'], [
  ['1', 'La cama: cabecero, pie y colchón.'],
  ['2', 'La almohada.'],
  ['3', '<b>La manta en reposo</b>: doblada a los pies o apartada. Siempre detrás del ratón.'],
  ['4', '<b>El ratón</b>, en todas sus fases (entrar, subir, sentarse, dormir, levantarse, bajar, salir).'],
  ['5', '<b>La manta solo mientras lo tapa</b>: cuando sube, mientras duerme y cuando se aparta.'],
  ['6', 'Lo que va encima de la manta (las patas de la pose C) y las Z.'],
]);
UL([
  '<b>La manta cambia de capa (3 ↔ 5) solo en un fotograma en el que no toca al ratón</b>, así que el cambio no se ve. Nunca desaparece ni aparece: está en la cama desde el primer fotograma, doblada a los pies, y sube o baja en pasos visibles.',
  '<b>Se entra y se sale por el pie de la cama, por delante del pie</b>; nunca a través del cabecero. Antes de bajar, el ratón queda de pie y entero sobre el colchón.',
  '<b>La mochila</b> se cuelga en el pie al sentarse y se recoge al levantarse, como un gesto, no de golpe (o se queda puesta, si prefieres no tocarla).',
  '<b>Cómo lo voy a demostrar:</b> la demo recorrerá el bucle fotograma a fotograma y contará en pantalla, para que se vea: fotogramas con la manta encima del ratón fuera de las fases en que lo tapa (debe ser 0); fotogramas con el ratón en el aire fuera del salto (0); fotogramas con el ratón cruzando el cabecero (0); y que todos los fotogramas del ratón son sprites aprobados, sin escalar ni girar.',
]);
TB(['', 'THE BED'], [['Estado', 'Pendiente del Project Manager: el ratón tratado sigue trabajando en su puesto, así que la cama no puede «ser» THE BED sin contradecir el juego. No he cambiado la lógica ni he duplicado ratones.']]);

// ================= C · HOUSE III =================
H2('C', 'C · HOUSE III: AJUSTES DE COMPOSICIÓN', 'Ventana superior centrada y torre apoyada en el suelo, con sus uniones y sus sombras de contacto.');
function houseSheet() {
  const k = 4, a = houseV2(3), b = houseV3(3), [c, g] = SHEET((110 * 2 + 14) * k, 96 * k); g.fillStyle = '#5a7a48'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#3e5a32'; g.fillRect(0, 84 * k, c.width, 12 * k);
  g.drawImage(a, 0, 8 * k, 110 * k, 76 * k); g.drawImage(b, 124 * k, 8 * k, 110 * k, 76 * k);
  g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#ffffff'; g.fillText('Antes', 6, 18); g.fillText('Después', 124 * k + 6, 18);
}
houseSheet();
UL([
  '<b>Ventana superior:</b> el volumen de arriba era un triángulo torcido (cumbrera en x 30 sobre una base de x 14 a x 50) y la ventana caía en x 33, ni bajo la cumbrera ni en el centro. Ahora es un volumen simétrico con la cumbrera en su centro, y la ventana va justo debajo. Sigue tapando la punta de la cuña grande, así que el tejado de queso no cambia.',
  '<b>La torre ya no flota:</b> acababa 8 px por encima del suelo, porque el zócalo de piedra empezaba en x 28 y no pasaba por debajo. Ahora el zócalo corre bajo la torre, la casa y la unión entre las dos; la torre lleva una hilada de piedra más ancha al pie y su puerta tiene escalón.',
  '<b>Unión con la casa:</b> la pasarela de tablas suelta se sustituye por un muro de piedra que va del zócalo al alero entre la torre y la casa, con la sombra del alero encima.',
  '<b>Sombras de contacto:</b> el pie de la torre y del muro de unión se oscurece donde toca el zócalo, y el cono de la torre arroja sombra sobre el muro.',
  '<b>Además:</b> la ventana redonda de la planta baja se veía cortada por el alero; ahora es un poco más pequeña y se ve entera entre las vigas. Estos cambios también se aplican a HOUSE II, que comparte fachada, para que las dos fases sigan siendo coherentes.',
]);
{ const R = CARDROW(); card(R, 'HOUSE II', 84, 80, (g) => { grass(g, 84, 80, 76); g.drawImage(houseV3(2), 2, 0); }, { cap: 'Con la buhardilla y la ventana corregidas.' }); card(R, 'HOUSE III', 114, 80, (g) => { grass(g, 114, 80, 76); g.drawImage(houseV3(3), 2, 0); g.drawImage(mouseCanvas(CREW.town.idle, 0, false, {}), 92, 56); }, { cap: 'A escala real, con un ratón oficial.' }); }

// ================= D · FUENTES =================
H2('D', 'D · FUENTES: PROPUESTA DE VERSIONADO', 'No he hecho commit. Esto es lo que propongo cuando lo autorices.');
TB(['', 'PROPUESTA'], [
  ['Qué', 'Toda la carpeta <code>exploracion/pixel</code>: los prototipos HTML, las fuentes editables (<code>main2-src</code>: V4, V4.1, revisión, evolución, esta entrega), los sprites y animaciones aprobados (<code>out/</code>) y sus fuentes (<code>*.px.js</code>). Son 864 archivos y 15 MB, de ellos 6 MB de PNG.'],
  ['Qué no', 'Los <code>.chk.js</code> que genera el montaje (se ignoran con una línea en <code>.gitignore</code>). Y, como siempre, ni <code>CONSULTA_DISENO.md</code> ni <code>DIAGNOSTICO_PROGRESION.md</code> ni <code>capturas/</code>.'],
  ['Dónde', 'Una rama nueva, <code>arte/main2</code>, que salga de la rama de prototipos actual (<code>proto-shop</code>, donde ya están las exploraciones de estilo). Nada pasa a <code>main</code> ni al juego publicado.'],
  ['Cómo', 'Un solo commit con la identidad del repositorio, que describa qué es cada carpeta.'],
  ['A tener en cuenta', 'El repositorio es <b>público</b>: el arte y los prototipos quedarían visibles para cualquiera. Si prefieres que no, la alternativa es una copia comprimida fuera del repositorio.'],
]);

// ================= DECISIONES =================
H2('OK', 'DECIDIDO Y SIGUIENTE');
UL([
  '<b>Cama:</b> tapado (acurrucado con la manta hasta la cabeza, sin embozo blanco) y destapado (acurrucado). B y C, descartadas.',
  '<b>HOUSE III:</b> aprobada con la ventana centrada y la torre apoyada.',
  '<b>Fuentes:</b> autorizado subirlas aunque el repositorio sea público.',
  '<b>Siguiente:</b> la animación completa de la cama con la regla de capas y los contadores de validación en pantalla.',
]);
