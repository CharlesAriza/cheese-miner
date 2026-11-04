// ECONOMY 2.0 · S3-R · Registro de efectos.
// Qué significa cada clave de efecto y cómo se aplica a los modificadores del motor (s.mods). Sustituye a las listas
// fijas de applyMods: un nudo nuevo con un tipo de efecto ya registrado es solo datos (params.js); un tipo nuevo se
// registra aquí, en un solo sitio. El orden de registro es el orden de aplicación (el de S2.5), así que los resultados
// no cambian. Las claves que nadie ha registrado se ignoran, como antes; tests.js comprueba que no haya ninguna en uso.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.effects = (function () {
  // ---- Nudos de camino (eff de cada nudo activo) ----
  // apply(x, v): x = { md, st, acc } · md = modificadores en construcción · st = estación del nudo · acc.mult = multiplicador
  // de velocidad de esa estación. when: 'set' (se aplica si v != null) o 'truthy' (si v es verdadero), como en S2.5.
  const node = [];
  const regNode = (key, apply, when) => { node.push({ key, apply, when: when || 'set' }); };
  // Efectos previos: se aplican antes de recorrer las estaciones (un nudo que acelera otra estación).
  const pre = [];
  const regPre = (key, apply) => { pre.push({ key, apply }); };

  regNode('speedMult', (x, v) => { x.acc.mult *= v; }, 'truthy');
  for (const k of ['power', 'veinMult', 'searchMult', 'tapMult', 'yield', 'base', 'value', 'time', 'masteryRate', 'count', 'price', 'fineBonus']) regNode(k, (x, v) => { x.md[x.st][k] *= v; });
  for (const k of ['hardMult', 'critEvery', 'blast', 'survey', 'wholesale', 'newRecipeBoost', 'crewCrit', 'richMult']) regNode(k, (x, v) => { x.md[x.st][k] = v; });
  regNode('wRitmo', (x, v) => { (x.md.w[x.st] = x.md.w[x.st] || {}).ritmo = v; });
  regNode('wRend', (x, v) => { (x.md.w[x.st] = x.md.w[x.st] || {}).rend = v; });
  regNode('buyerShift', (x, v) => { x.md.sell.buyerLevel += v; }, 'truthy');
  regPre('cross', (cross, v) => { cross[v.st] = (cross[v.st] || 1) * v.speedMult; }); // S2.5: Fast Still acelera CHEESE
  // S3: materiales (F0.2): Core Sampler, Rich Seams y Strata Logs.
  regNode('matMult', (x, v) => { x.md.drill.matMult = v; });
  regNode('matAdd', (x, v) => { x.md.mine.matAdd = v; });
  regNode('bpDiscount', (x, v) => { x.md.drill.bpDiscount = v; });

  function applyNode(e, x) { for (const r of node) { const v = e[r.key]; if (r.when === 'truthy' ? v : v != null) r.apply(x, v); } }
  function applyPre(e, cross) { for (const r of pre) if (e[r.key]) r.apply(cross, e[r.key]); }

  // ---- Fundamentales: en qué capa suma cada clave (f.key) ----
  // 'speed': suma de velocidad de la estación · 'value': suma de valor común (F0 J) · 'station': suma en su campo del motor.
  const fund = { speed: 'speed', value: 'value', price: 'value' };
  const regFund = (key, layer) => { fund[key] = layer; };
  const fundLayer = (key) => fund[key] || 'station';

  // Claves que no son efectos (datos del nudo) y comprobación para las pruebas.
  const known = (key) => node.some((r) => r.key === key) || pre.some((r) => r.key === key);
  const nodeKeys = () => node.map((r) => r.key).concat(pre.map((r) => r.key));
  return { regNode, regPre, regFund, applyNode, applyPre, fundLayer, known, nodeKeys };
})();
