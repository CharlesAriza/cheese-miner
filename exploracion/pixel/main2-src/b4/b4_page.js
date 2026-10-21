// ---------- BLOQUE 3 · GOUDA · la página ----------
const MK = 7, ST1 = STOPS[1], CW = Math.ceil(SC.worldW);
const EXPORT4 = [
  { file: 'chapter_bg.png', cv: () => brieBG(ST1), src: 'brieBG()', marker: 'fondo del capítulo de Brie', note: `El común con la profundidad de Brie, en caliza y roble. ${CW} × ${ST1.h}, con SC.ox = 17.`, state: 'nuevo' },
  { file: 'cheese_base.png', cv: () => cheeseStaticBrie(1, 0, true), src: 'cheeseStaticBrie(1)', marker: 'scene.js · Cheesery', note: 'El taller común con los quesos curados en corteza blanca.', state: 'adaptado' },
  ...[2, 3].map((s) => ({ file: `cheese_${s}.png`, cv: () => cheeseStaticBrie(s, 0, true), src: `cheeseStaticBrie(${s})`, marker: 'scene.js · Cheesery', note: `Fase ${s === 2 ? 'II' : 'III'}.`, state: 'adaptado' })),
];
window.B4_EXPORT = EXPORT4;

PP(`<b>Bloque 4 de producción.</b> Brie sigue el método de Gouda: el capítulo común con las máquinas aprobadas (con sus fases y refuerzos), la misma composición y el mismo pico; cambian la roca, la cueva, la cuadrilla, el cartel y los quesos. Se entregan ${EXPORT4.length} PNG nuevos; el resto se reutiliza de Cheddar. Con esto quedan las tres rocas del MVP.`);

H2('B', 'BRIE EN MARCHA', 'A tamaño real de móvil. Los selectores de fase y refuerzo son los mismos que en Cheddar.');
const ctl = DIV('b1-ctl');
const sel = (label, obj, key, opts) => { const l = document.createElement('label'); l.innerHTML = `<span>${label}</span>`; const s = document.createElement('select'); for (const [v, n] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = n; if (v === obj[key]) o.selected = true; s.appendChild(o); } s.onchange = () => { obj[key] = +s.value; }; l.appendChild(s); ctl.appendChild(l); };
const ST3 = [[1, 'I'], [2, 'II'], [3, 'III']], BO = [[0, 'sin refuerzo'], [1, '+1'], [2, '+2']];
sel('REFINE', B2.ref, 'stage', ST3); sel('', B2.ref, 'boost', BO); sel('DRILL', B2.drill, 'stage', ST3); sel('', B2.drill, 'boost', BO); sel('CHEESE', B2.cheese, 'stage', ST3); sel('', B2.cheese, 'boost', BO); sel('MINE', B2.mine, 'boost', BO);
const scroller = DIV('b1-scroll'); const sc = document.createElement('canvas'); sc.width = CW * MK; sc.height = ST1.h * MK; sc.style.width = Math.round(CW * KPX) + 'px'; sc.style.height = Math.round(ST1.h * KPX) + 'px'; scroller.appendChild(sc);
const off = document.createElement('canvas');
for (let i = 0; i < 300; i++) step41(16);
setInterval(() => { step41(33); const now = performance.now(); renderBrie(now, off); { const og = off.getContext('2d'), was = ctx; og.setTransform(1, 0, 0, 1, 0, -ST1.top); ctx = og; try { drawParticles(now, 33); } finally { ctx = was; } } const g = sc.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(off, 0, 0); }, 33);

H2('I', 'LAS TRES ROCAS');
function compareSheet() { const k = 2, [c, g] = SHEET((CW * 3 + 24) * k, ST1.h * k + 26); g.fillStyle = '#2a1d14'; g.fillRect(0, 0, c.width, c.height); const now = performance.now(), cvs = [['Cheddar', renderStopTo(1, now, document.createElement('canvas'))], ['Gouda', renderGouda(now, document.createElement('canvas'))], ['Brie', renderBrie(now, document.createElement('canvas'))]]; g.font = '700 13px system-ui, sans-serif'; g.fillStyle = '#f4ead8'; cvs.forEach(([n, cv], i) => { const x = i * (CW + 12) * k; g.drawImage(cv, x, 26, CW * k, ST1.h * k); g.fillText(n, x + 4, 18); }); }
compareSheet();
TB(['', 'CHEDDAR', 'GOUDA', 'BRIE'], [
  ['<b>Roca</b>', 'big_cheddar', 'big_gouda', 'big_brie (los mismos estados, del mismo generador aprobado)'],
  ['<b>Cueva</b>', 'Tierra marrón, entibado de madera', 'Piedra gris, entibado de latón', 'Caliza cálida en tono medio, entibado de roble oscuro (las cuevas de caliza donde madura el Brie); dos tonos más oscura que la roca blanca para que esta destaque'],
  ['<b>Corta</b>', 'Profundidad 82', 'Profundidad 23', 'Profundidad 9: la más nueva y la menos honda'],
  ['<b>Cuadrilla</b>', 'CREW.cheddar', 'CREW.gouda', 'Fondue y Pip (datos del prototipo de MICE); el refinador Brioche (Rare) y el perforador Comte son nuevos, porque en esos datos el puesto de refinador está vacío y su perforador ya trabaja en Gouda'],
  ['<b>Cartel</b>', 'Madera', 'Latón', 'Cobre'],
  ['<b>Quesos curados</b>', 'Ámbar', 'Cera roja', 'Corteza blanca enmohecida'],
  ['<b>Máquinas, fases, refuerzos y pico</b>', 'Aprobados', 'Los mismos', 'Los mismos'],
]);
H3('Los estados de la roca de Brie');
function rockSheet() { const k = 3, [c, g] = SHEET(10 * 58 * k / 2 + 20, 2 * 46 * k + 50); g.fillStyle = '#343b42'; g.fillRect(0, 0, c.width, c.height); g.font = '700 12px system-ui, sans-serif'; g.fillStyle = '#ffffff'; const all = [...BRIE_ROCK.c.map((p, i) => ['c' + i, p]), ...BRIE_ROCK.v.map((p, i) => ['v' + (i + 1), p])]; all.forEach(([n, p], i) => { const x = 10 + (i % 5) * 58 * k / 1.0 * 0.5 * 2, y = 20 + Math.floor(i / 5) * (46 * k + 20), img = im(p); g.drawImage(img, 0, 0, 54, 42, x, y, 54 * k, 42 * k); g.fillText(n, x, y - 4); }); }
rockSheet();
PP('<span class="ad-cap">Arriba, las grietas que deja el pico (c0–c4); abajo, la veta que vacía la perforadora (v1–v5). Ya estaban generadas y aprobadas con las de Cheddar y Gouda.</span>');

H2('E', 'ENTREGA PARA INTEGRAR', 'En exploracion/pixel/out/main2/brie, con su manifest.json.');
TB(['ARCHIVO', 'TAMAÑO', 'SALE DE', 'SUSTITUYE A', 'NOTA'], EXPORT4.map((e) => { const cv = e.cv(); return [`<code>${e.file}</code>`, `${cv.width} × ${cv.height}`, `<code>${e.src}</code>`, e.marker, e.note]; }));
UL([
  '<b>Se reutiliza de Cheddar</b> (out/main2/cheddar): REFINE, DRILL, prensa y paleta de la quesería, gemas de refuerzo. Las máquinas son las mismas en todas las rocas.',
  '<b>La roca</b> ya estaba entregada: <code>out/sprites/big_brie_c0–c4</code> y <code>v1–v6</code>.',
  '<b>Al integrar</b>, cada capítulo elige su juego de piezas por zona: fondo, quesería, roca, cuadrilla y cartel; lo demás es común.',
]);
H2('→', 'SIGUIENTE', 'Bloque 5 · Sistemas compartidos: el montacargas que une superficie, Cheddar, Gouda y Brie (y casar el castillete con los pozos), fichas de recurso, bocadillos, avisos y estados comunes.');
