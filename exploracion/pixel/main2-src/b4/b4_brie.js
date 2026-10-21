// ---------- BLOQUE 4 · BRIE (producción, 21-10-2026) ----------
// El mismo método que Gouda: el capítulo común (composición, máquinas aprobadas con fases y refuerzos, ratones y pico) con la
// identidad de Brie. Brie es un queso de cueva de caliza, de corteza blanca enmohecida:
// · la roca: los estados aprobados de Brie (big_brie_c0–c4 y v1–v5), del mismo generador;
// · la cueva: caliza cálida en tono medio (la roca blanca destaca), con el entibado de roble oscuro (contrasta con el gris de Gouda y el marrón de Cheddar);
// · el cartel de profundidad: de cobre;
// · los quesos curados de la quesería: la corteza blanca del Brie;
// · la cuadrilla: Fondue (minero) y Pip (quesero) salen de los datos del prototipo de MICE; el refinador y el perforador son
//   nuevos (en esos datos el puesto de refinador de Brie está vacío y su perforador es Roque, que ya trabaja en Gouda).
// Dos tonos por debajo de la caliza clara: la roca de Brie es blanca y con la caliza clara se fundía con la pared.
const BRIE_STONE = [[0.10, '#221e19'], [0.13, '#2e2a23'], [0.17, '#3c372e'], [0.21, '#4c463b'], [0.25, '#5c5548'], [0.29, '#6c6455'], [0.35, '#7c7362'], [0.42, '#8c826f'], [9, '#9c917c']];
const BRIE_OAK = [[0.30, '#2e1c12'], [0.45, '#4e3220'], [9, '#704a30']];
const BRIE_RIND = { '#4a2806': '#6e5c48', '#8a5410': '#ac9672', '#c88a20': '#dcca9e', '#e8b040': '#f6ecd0', '#ffe08a': '#fffdf2' };
const CREW_BRIE = { miner: { name: 'Fondue', lv: 30, rank: 2, rar: 0, skill: 'mining' }, driller: { name: 'Comte', lv: 44, rank: 1, rar: 0, skill: 'drilling' }, refiner: { name: 'Brioche', lv: 38, rank: 1, rar: 1, skill: 'refining' }, cook: { name: 'Pip', lv: 52, rank: 3, rar: 0, skill: 'cheesemaking' } };
const TH_BRIE = Object.assign({}, TH.gouda, { metal: '#b8693a', metalL: '#e8a070', metalD: '#5e2e14' });
const DEP_BRIE = 9;
const BRIE_ROCK = { c: [0, 1, 2, 3, 4].map((i) => `out/sprites/big_brie_c${i}.png`), v: [1, 2, 3, 4, 5].map((i) => `out/sprites/big_brie_v${i}.png`) };
[...BRIE_ROCK.c, ...BRIE_ROCK.v].forEach(im);
// La misma conversión que Gouda, con la caliza y el roble: la tierra pasa a caliza por su luz, la madera a roble oscuro.
function recolorBrie(c) {
  const g = c.getContext('2d'), im2 = g.getImageData(0, 0, c.width, c.height), d = im2.data, memo = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    if (!(k in memo)) { const [h, s, l] = hslOf(d[i], d[i + 1], d[i + 2]); let out = null; if (h >= 15 && h <= 40 && s > 0.2) out = (s >= 0.47 || (l >= 0.45 && s >= 0.45) ? BRIE_OAK : BRIE_STONE).find(([t]) => l <= t)[1]; memo[k] = out ? hexRGB(out) : null; }
    const o = memo[k]; if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
  }
  g.putImageData(im2, 0, 0); return c;
}
const brieBG = (st) => art('brieBG' + SC.ox, () => { const keep = DEP.cheddar; DEP.cheddar = DEP_BRIE; const c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.translate(0, -st.top); const was = ctx; ctx = g; try { paintCheddar(st); } finally { ctx = was; DEP.cheddar = keep; } return recolorBrie(c); });
const cheeseStaticBrie = (s, b, o) => art(`bchz${s}${b}${o}`, () => recolorMap(cheeseStaticCheddar(s, b, o), BRIE_RIND));
function renderBrie(now, cvs) {
  const keep = { c: ROCKC.slice(), v: ROCKV.slice(), dep: DEP.cheddar, th: TH.cheddar, baked, cheese: cheeseStatic, m: {} };
  for (const w of Object.keys(BR)) { keep.m[w] = BR[w].m; if (CREW_BRIE[w]) BR[w].m = CREW_BRIE[w]; }
  BRIE_ROCK.c.forEach((p, i) => (ROCKC[i] = p)); BRIE_ROCK.v.forEach((p, i) => (ROCKV[i] = p));
  DEP.cheddar = DEP_BRIE; TH.cheddar = TH_BRIE; cheeseStatic = cheeseStaticBrie;
  baked = (st) => { ctx.drawImage(brieBG(st), 0, st.top); };
  try { renderStopTo(1, now, cvs); } finally {
    keep.c.forEach((p, i) => (ROCKC[i] = p)); keep.v.forEach((p, i) => (ROCKV[i] = p));
    DEP.cheddar = keep.dep; TH.cheddar = keep.th; baked = keep.baked; cheeseStatic = keep.cheese;
    for (const w of Object.keys(keep.m)) BR[w].m = keep.m[w];
  }
  return cvs;
}
