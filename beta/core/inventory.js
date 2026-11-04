// CHEESE DRILLER · BETA · Inventario: lo que tiene la colonia, de dónde viene y para qué sirve.
// RAW, BASE y quesos siguen en los contadores del motor (se mueven en cada ciclo); materiales y demás objetos se guardan aquí
// (s.mat), con lo producido por origen (s.matIn) y lo gastado por motivo (s.matOut): totales, no un historial, para que el
// guardado no crezca. PANTRY y cualquier pantalla leen todo con las mismas consultas. Sin topes (contrato).
// Un origen es una fila de datos en PARAMS.sources, no código:
//   { id, on: 'vein', item: '@stratum' | id, n }                         al abrir una veta
//   { id, on: 'cheese', item: '@style' | id, every, n, match: { ingredient, treatment, maturation, base } }   n cada `every` quesos
// y cualquier otro sistema (experimentos, encargos) puede entregar con add(s, id, n, origen). No hay tablas inventadas: la
// baseline solo trae la hipótesis de S3 (un material del estrato por veta).
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.inventory = (function () {
  const P = () => E2.PARAMS, Mo = () => E2.model;
  const ready = (s) => { if (!s.mat) s.mat = {}; if (!s.matMade) s.matMade = {}; if (!s.matIn) s.matIn = {}; if (!s.matOut) s.matOut = {}; };
  const consumers = [];

  const count = (s, id) => (s.mat && s.mat[id]) || 0;
  function add(s, id, n, origin) {
    if (!(n > 0)) return 0;
    ready(s);
    s.mat[id] = (s.mat[id] || 0) + n;
    s.matMade[id] = (s.matMade[id] || 0) + n;
    const o = (s.matIn[id] = s.matIn[id] || {});
    o[origin] = (o[origin] || 0) + n;
    const h = Mo().hooks.emit;
    if (h) h(s, 'item', { id, n, origin });
    return n;
  }
  function can(s, cost, disc) {
    if (!cost) return true;
    for (const k of Object.keys(cost)) if (count(s, k) < cost[k] * (disc || 1)) return false;
    return true;
  }
  // Todo o nada: si falta algo, no cobra nada.
  function pay(s, cost, reason, disc) {
    if (!cost) return true;
    if (!can(s, cost, disc)) return false;
    ready(s);
    for (const k of Object.keys(cost)) {
      const n = cost[k] * (disc || 1);
      s.mat[k] -= n;
      const o = (s.matOut[k] = s.matOut[k] || {});
      o[reason] = (o[reason] || 0) + n;
    }
    return true;
  }

  // ---- Orígenes declarados en datos ----
  // Sin PARAMS.sources, la regla de S3 (s3.materials), para que el simulador siga igual.
  function rules() {
    if (P().sources) return P().sources;
    const M3 = P().s3 && P().s3.materials;
    return M3 ? [{ id: 'vein', on: 'vein', item: '@stratum', n: M3.perVein }] : [];
  }
  function onVein(s, v) {
    for (const r of rules()) {
      if (r.on !== 'vein') continue;
      const md = s.mods, id = r.item === '@stratum' ? Mo().stratumOf(v.depth).id : r.item;
      add(s, id, (r.n + ((md && md.mine.matAdd) || 0)) * ((md && md.drill.matMult) || 1), r.id);
    }
  }
  function onLots(s, key, n) {
    const L = rules();
    for (let i = 0; i < L.length; i++) {
      const r = L[i];
      if (r.on !== 'cheese') continue;
      const combo = Mo().formula(key).combo;
      if (r.match && !Object.keys(r.match).every((k) => combo[k] === r.match[k])) continue;
      const cnt = (s.srcN = s.srcN || {}), every = r.every || 1;
      cnt[r.id] = (cnt[r.id] || 0) + n;
      const times = Math.floor(cnt[r.id] / every);
      if (times <= 0) continue;
      cnt[r.id] -= times * every;
      add(s, r.item === '@style' ? combo.base : r.item, times * (r.n || 1), r.id);
    }
  }
  Mo().hooks.veinOpen = onVein;
  Mo().hooks.lotsDone = onLots;

  // ---- Qué sabe el jugador de cada objeto ----
  // Un consumidor es una función (c) => [{ item, n, system, what, unlock }]: para qué sirve se calcula de lo que declaran quienes
  // lo gastan, no se escribe dos veces.
  const registerConsumer = (fn) => { consumers.push(fn); };
  function uses(c, id, onlyKnown) {
    const out = [];
    for (const fn of consumers) for (const u of fn(c)) if (u.item === id && (!onlyKnown || !u.unlock || !E2.progression || !E2.progression.has(u.unlock) || E2.progression.isOpen(c, u.unlock))) out.push(u);
    return out;
  }
  const sourcesOf = (id) => rules().filter((r) => r.item === id || (r.item === '@stratum' && P().strata.some((x) => x.id === id)) || (r.item === '@style' && P().strata.some((x) => x.id === id)));
  const def = (id) => (P().items || []).find((x) => x.id === id) || null;
  // La ficha de objeto: qué es, cuánto hay, de dónde viene, cómo se consigue y para qué sirve (sin destripar lo que no conoce).
  function card(c, id) {
    const s = c.s, d = def(id);
    return { id, kind: d ? d.kind : 'material', name: d ? d.name : id, icon: d ? d.icon : '', have: count(s, id), made: (s.matMade && s.matMade[id]) || 0, spent: Object.values((s.matOut && s.matOut[id]) || {}).reduce((a, b) => a + b, 0), from: Object.assign({}, (s.matIn && s.matIn[id]) || {}), spentOn: Object.assign({}, (s.matOut && s.matOut[id]) || {}), sources: sourcesOf(id).map((r) => ({ id: r.id, on: r.on, every: r.every || 1, n: r.n || 1 })), uses: uses(c, id, true) };
  }
  // Todo lo que tiene la colonia, para RESOURCES y la hoja PANTRY.
  function list(c) {
    const s = c.s, known = Object.keys(s.mat || {}).filter((k) => (s.matMade[k] || 0) > 0);
    return { coins: s.coins, raw: s.inv.raw, base: s.inv.base, lots: Object.keys(s.lots).filter((k) => s.lots[k] > 0).map((k) => ({ key: k, n: s.lots[k] })), materials: known.map((k) => ({ id: k, n: s.mat[k], name: def(k) ? def(k).name : k })) };
  }
  // Producido = disponible + gastado, por objeto. Devuelve los que no cuadran.
  function audit(s) {
    const bad = [];
    for (const k of Object.keys(s.matMade || {})) {
      const out = Object.values((s.matOut && s.matOut[k]) || {}).reduce((a, b) => a + b, 0), inn = Object.values((s.matIn && s.matIn[k]) || {}).reduce((a, b) => a + b, 0);
      if (Math.abs(s.matMade[k] - count(s, k) - out) > 1e-9 || Math.abs(inn - s.matMade[k]) > 1e-9) bad.push(k);
    }
    return bad;
  }
  return { add, can, pay, count, rules, registerConsumer, uses, sourcesOf, def, card, list, audit };
})();
