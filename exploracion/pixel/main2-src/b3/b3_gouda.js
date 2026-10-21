// ---------- BLOQUE 3 · GOUDA (producción, 21-10-2026) ----------
// Gouda reutiliza el capítulo de Cheddar entero (composición, máquinas aprobadas con sus fases y refuerzos, ratones y pico) y
// cambia lo que le da identidad:
// · la roca: los estados aprobados de Gouda (big_gouda_c0–c4 y v1–v5), del mismo generador que los de Cheddar;
// · la cueva: de tierra marrón a piedra gris, con el entibado de latón (la paleta TH.gouda que ya tiene el juego);
// · la cuadrilla: los ratones de Gouda (CREW.gouda);
// · el cartel de profundidad: el de latón, que ya existe para Gouda;
// · los quesos curados de la quesería: cera roja, la del Gouda.
// La simulación es la misma (la de Cheddar): sirve para ver el capítulo en marcha, no para medir nada.
const GOUDA_GREY = [[0.10, '#1e2328'], [0.13, '#2a3036'], [0.17, '#343b42'], [0.21, '#40464e'], [0.25, '#4e565e'], [0.29, '#5a626c'], [0.35, '#666e78'], [0.42, '#6a747e'], [9, '#77818c']];
const GOUDA_BRASS = [[0.30, '#6a5220'], [0.45, '#b08a3a'], [9, '#d0aa5a']];
const GOUDA_WAX = { '#4a2806': '#4a1210', '#8a5410': '#7e2018', '#c88a20': '#b8341f', '#e8b040': '#e8523a', '#ffe08a': '#ffa08c' };
function hslOf(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn); let h = 0; if (mx !== mn) { h = mx === r ? (g - b) / (mx - mn) + (g < b ? 6 : 0) : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h *= 60; } return [h, s, l]; }
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// Cueva de Cheddar → Gouda: los marrones de tierra y roca pasan a la escala de piedra gris por su luz; la madera (marrones
// más saturados) pasa a latón. La tinta, los quesos de las vetas, el hierro y las luces no se tocan.
function recolorGouda(c) {
  const g = c.getContext('2d'), im2 = g.getImageData(0, 0, c.width, c.height), d = im2.data, memo = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    if (!(k in memo)) { const [h, s, l] = hslOf(d[i], d[i + 1], d[i + 2]); let out = null; if (h >= 15 && h <= 40 && s > 0.2) out = (s >= 0.47 || (l >= 0.45 && s >= 0.45) ? GOUDA_BRASS : GOUDA_GREY).find(([t]) => l <= t)[1]; memo[k] = out ? hexRGB(out) : null; }
    const o = memo[k]; if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
  }
  g.putImageData(im2, 0, 0); return c;
}
function recolorMap(src, map) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); const im2 = g.getImageData(0, 0, c.width, c.height), d = im2.data, M = {}; for (const [a, b] of Object.entries(map)) M[hexRGB(a).join()] = hexRGB(b); for (let i = 0; i < d.length; i += 4) { const o = M[d[i] + ',' + d[i + 1] + ',' + d[i + 2]]; if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; } } g.putImageData(im2, 0, 0); return c; }
const GOUDA_ROCK = { c: [0, 1, 2, 3, 4].map((i) => `out/sprites/big_gouda_c${i}.png`), v: [1, 2, 3, 4, 5].map((i) => `out/sprites/big_gouda_v${i}.png`) };
[...GOUDA_ROCK.c, ...GOUDA_ROCK.v].forEach(im);
// El fondo de Gouda: el de Cheddar pintado con la profundidad de Gouda (su corta es menos honda) y pasado a piedra y latón.
const goudaBG = (st) => art('goudaBG' + SC.ox, () => { const c = document.createElement('canvas'); c.width = Math.ceil(SC.worldW); c.height = st.h; const g = c.getContext('2d'); g.translate(0, -st.top); const was = ctx; ctx = g; try { paintCheddar(st); } finally { ctx = was; } return recolorGouda(c); });
const cheeseStaticCheddar = cheeseStatic;
const cheeseStaticGouda = (s, b, o) => art(`gchz${s}${b}${o}`, () => recolorMap(cheeseStaticCheddar(s, b, o), GOUDA_WAX));
// Pinta el capítulo de Gouda: cambia lo que da identidad, pinta con el mismo drawCheddar y lo deja todo como estaba.
function renderGouda(now, cvs) {
  const keep = { c: ROCKC.slice(), v: ROCKV.slice(), dep: DEP.cheddar, th: TH.cheddar, baked, cheese: cheeseStatic, m: {} };
  for (const w of Object.keys(BR)) { keep.m[w] = BR[w].m; if (CREW.gouda[w]) BR[w].m = CREW.gouda[w]; }
  GOUDA_ROCK.c.forEach((p, i) => (ROCKC[i] = p)); GOUDA_ROCK.v.forEach((p, i) => (ROCKV[i] = p));
  DEP.cheddar = DEP.gouda; TH.cheddar = TH.gouda; cheeseStatic = cheeseStaticGouda;
  baked = (st) => { ctx.drawImage(goudaBG(st), 0, st.top); };
  try { renderStopTo(1, now, cvs); } finally {
    keep.c.forEach((p, i) => (ROCKC[i] = p)); keep.v.forEach((p, i) => (ROCKV[i] = p));
    DEP.cheddar = keep.dep; TH.cheddar = keep.th; baked = keep.baked; cheeseStatic = keep.cheese;
    for (const w of Object.keys(keep.m)) BR[w].m = keep.m[w];
  }
  return cvs;
}
