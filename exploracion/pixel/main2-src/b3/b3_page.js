// ---------- BLOQUE 3 · GOUDA · la página ----------
const MK = 7, ST1 = STOPS[1], CW = Math.ceil(SC.worldW);
const EXPORT3 = [
  { file: 'chapter_bg.png', cv: () => goudaBG(ST1), src: 'goudaBG()', marker: 'fondo del capítulo de Gouda', note: `El de Cheddar con la profundidad de Gouda, en piedra gris y latón. ${CW} × ${ST1.h}, con SC.ox = 17.`, state: 'nuevo' },
  { file: 'cheese_base.png', cv: () => cheeseStaticGouda(1, 0, true), src: 'cheeseStaticGouda(1)', marker: 'scene.js · Cheesery', note: 'El taller de Cheddar con los quesos curados en cera roja.', state: 'adaptado' },
  ...[2, 3].map((s) => ({ file: `cheese_${s}.png`, cv: () => cheeseStaticGouda(s, 0, true), src: `cheeseStaticGouda(${s})`, marker: 'scene.js · Cheesery', note: `Fase ${s === 2 ? 'II' : 'III'}.`, state: 'adaptado' })),
];
window.B3_EXPORT = EXPORT3;

PP(`<b>Bloque 3 de producción.</b> Gouda es el capítulo de Cheddar con la identidad de Gouda: mismas máquinas aprobadas (con sus fases y refuerzos), misma composición y el mismo pico; cambian la roca, la cueva, la cuadrilla, el cartel y los quesos. Se entregan ${EXPORT3.length} PNG nuevos; el resto se reutiliza de Cheddar.`);

H2('G', 'GOUDA EN MARCHA', 'A tamaño real de móvil. Los selectores de fase y refuerzo son los mismos que en Cheddar.');
const ctl = DIV('b1-ctl');
const sel = (label, obj, key, opts) => { const l = document.createElement('label'); l.innerHTML = `<span>${label}</span>`; const s = document.createElement('select'); for (const [v, n] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = n; if (v === obj[key]) o.selected = true; s.appendChild(o); } s.onchange = () => { obj[key] = +s.value; }; l.appendChild(s); ctl.appendChild(l); };
const ST3 = [[1, 'I'], [2, 'II'], [3, 'III']], BO = [[0, 'sin refuerzo'], [1, '+1'], [2, '+2']];
sel('REFINE', B2.ref, 'stage', ST3); sel('', B2.ref, 'boost', BO); sel('DRILL', B2.drill, 'stage', ST3); sel('', B2.drill, 'boost', BO); sel('CHEESE', B2.cheese, 'stage', ST3); sel('', B2.cheese, 'boost', BO); sel('MINE', B2.mine, 'boost', BO);
const scroller = DIV('b1-scroll'); const sc = document.createElement('canvas'); sc.width = CW * MK; sc.height = ST1.h * MK; sc.style.width = Math.round(CW * KPX) + 'px'; sc.style.height = Math.round(ST1.h * KPX) + 'px'; scroller.appendChild(sc);
const off = document.createElement('canvas');
for (let i = 0; i < 300; i++) step41(16);
setInterval(() => { step41(33); const now = performance.now(); renderGouda(now, off); { const og = off.getContext('2d'), was = ctx; og.setTransform(1, 0, 0, 1, 0, -ST1.top); ctx = og; try { drawParticles(now, 33); } finally { ctx = was; } } const g = sc.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(off, 0, 0); }, 33);

H2('I', 'QUÉ CAMBIA DE CHEDDAR A GOUDA');
function compareSheet() { const k = 3, [c, g] = SHEET((CW * 2 + 12) * k, ST1.h * k + 26); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, c.width, c.height); const a = document.createElement('canvas'), b = document.createElement('canvas'), now = performance.now(); renderStopTo(1, now, a); renderGouda(now, b); g.drawImage(a, 0, 26, CW * k, ST1.h * k); g.drawImage(b, (CW + 12) * k, 26, CW * k, ST1.h * k); g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8'; g.fillText('Cheddar', 4, 18); g.fillText('Gouda', (CW + 12) * k + 4, 18); }
compareSheet();
TB(['', 'CHEDDAR', 'GOUDA', 'DE DÓNDE SALE'], [
  ['<b>Roca</b>', 'big_cheddar (grietas c0–c4, veta v1–v6)', 'big_gouda (los mismos estados)', 'Del mismo generador aprobado (buildings.px.js); ya estaban hechos.'],
  ['<b>Cueva</b>', 'Tierra marrón y entibado de madera', 'Piedra gris y entibado de latón', 'La paleta TH.gouda que ya usa el juego. Se convierte el fondo de Cheddar por luz y saturación: la tierra pasa a la escala de piedra y la madera a latón.'],
  ['<b>Corta</b>', 'Profundidad 81', 'Profundidad 23: la corta es menos honda y la roca queda más arriba', 'La profundidad de cada roca, como en el juego.'],
  ['<b>Cuadrilla</b>', 'CREW.cheddar', 'CREW.gouda (con su Legendary de corona)', 'Los ratones del prototipo para cada roca.'],
  ['<b>Cartel</b>', 'Madera', 'Latón', 'El cartel de profundidad ya tenía su versión de Gouda.'],
  ['<b>Quesos</b>', 'Curados en ámbar', 'Curados en cera roja, la del Gouda', 'Cambio de color en el sprite de la quesería.'],
  ['<b>Máquinas, fases y refuerzos</b>', 'Aprobados', 'Los mismos', 'Se reutilizan: así un jugador reconoce cada etapa en cualquier roca.'],
]);
H3('Los estados de la roca de Gouda');
function rockSheet() { const k = 3, [c, g] = SHEET(10 * 58 * k / 2 + 20, 2 * 46 * k + 50); g.fillStyle = '#343b42'; g.fillRect(0, 0, c.width, c.height); g.font = '700 12px system-ui, sans-serif'; g.fillStyle = '#ffffff'; const all = [...GOUDA_ROCK.c.map((p, i) => ['c' + i, p]), ...GOUDA_ROCK.v.map((p, i) => ['v' + (i + 1), p])]; all.forEach(([n, p], i) => { const x = 10 + (i % 5) * 58 * k / 1.0 * 0.5 * 2, y = 20 + Math.floor(i / 5) * (46 * k + 20), img = im(p); g.drawImage(img, 0, 0, 54, 42, x, y, 54 * k, 42 * k); g.fillText(n, x, y - 4); }); }
rockSheet();
PP('<span class="ad-cap">Arriba, las grietas que deja el pico (c0–c4); abajo, la veta que vacía la perforadora (v1–v5). Ya estaban generadas y aprobadas con las de Cheddar.</span>');

H2('E', 'ENTREGA PARA INTEGRAR', 'En exploracion/pixel/out/main2/gouda, con su manifest.json.');
TB(['ARCHIVO', 'TAMAÑO', 'SALE DE', 'SUSTITUYE A', 'NOTA'], EXPORT3.map((e) => { const cv = e.cv(); return [`<code>${e.file}</code>`, `${cv.width} × ${cv.height}`, `<code>${e.src}</code>`, e.marker, e.note]; }));
UL([
  '<b>Se reutiliza de Cheddar</b> (out/main2/cheddar): REFINE, DRILL, prensa y paleta de la quesería, gemas de refuerzo. Las máquinas son las mismas en todas las rocas.',
  '<b>La roca</b> ya estaba entregada: <code>out/sprites/big_gouda_c0–c4</code> y <code>v1–v6</code>.',
  '<b>Al integrar</b>, cada capítulo elige su juego de piezas por zona: fondo, quesería, roca, cuadrilla y cartel; lo demás es común.',
]);
H2('→', 'SIGUIENTE', 'Bloque 4 · Brie, con el mismo método: el capítulo común y la identidad de Brie (su roca ya existe).');
