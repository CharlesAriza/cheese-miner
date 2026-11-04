// CHEESE DRILLER · BETA · Evaluador único de requisitos y estado de los desbloqueos (tabla en data/roadmap.js).
// Un requisito es { t: tipo, ... } y cada tipo dice cuánto lleva la partida, cuánto pide y cómo se explica. Un tipo nuevo se
// registra aquí, en un sitio. Lo abierto no se cierra nunca: «nada se pierde», aunque el jugador cambie de ratón o de puesto.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.progression = (function () {
  const P = () => E2.PARAMS, Mo = () => E2.model, Ru = () => E2.rules, C = () => E2.crew;
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell'], NAME = { mine: 'MINE', drill: 'DRILL', refine: 'REFINE', cheese: 'CHEESE', sell: 'SELL' };
  const yes = (v) => (v ? 1 : 0), cap = (s) => s[0].toUpperCase() + s.slice(1);
  const principal = (c, st) => c.s.placed.find((p) => p.st === st && p.fn === 'pr');
  const TYPES = {};
  const register = (t, val, text, need) => { TYPES[t] = { val, text, need: need || ((q) => (q.n != null ? q.n : 1)) }; };
  register('level', (c, q) => c.stLv[q.st], (q) => NAME[q.st] + ' level ' + q.n);
  register('levelAny', (c) => Math.max(...ST.map((st) => c.stLv[st])), (q) => 'Level ' + q.n + ' in any skill');
  register('stratum', (c, q) => yes(c.s.depth >= P().strata.find((x) => x.id === q.id).from), (q) => 'Reach ' + cap(q.id));
  register('depth', (c) => c.s.depth, (q) => 'Depth ' + q.n);
  register('phase', (c, q) => c.phase[q.st], (q) => NAME[q.st] + ' stage ' + q.n);
  register('crewFull', (c, q) => yes(c.s.built[q.st] !== false && P().posts[q.st][c.s.stage[q.st] - 1].every(([role]) => c.s.placed.some((p) => p.st === q.st && p.role === role))), (q) => 'Full crew at ' + NAME[q.st]);
  register('chain', (c) => ST.filter((st) => principal(c, st)).length, () => 'A mouse on all five stages', () => 5);
  register('rank', (c, q) => c.roster.filter((m) => (m.rank || 0) >= q.r).length, (q) => q.n + ' ' + (q.n > 1 ? E2.REAL.mice.ranks[q.r].name.replace(/man$/, 'men').replace(/([^n])$/, '$1s') : E2.REAL.mice.ranks[q.r].name));
  register('rankAt', (c, q) => { const p = principal(c, q.st); return p ? p.m.rank || 0 : 0; }, (q) => E2.REAL.mice.ranks[q.n].name + ' running ' + NAME[q.st]);
  register('mice', (c) => c.roster.length, (q) => q.n + ' mice');
  register('staffed', (c) => c.s.placed.length + c.lab.workers.length, (q) => q.n + ' mice at work');
  register('unlock', (c, q) => yes(c.unlocked[q.id] != null), (q) => 'Unlock ' + q.id);
  register('owned', (c, q) => yes(c.owned[q.id]), (q) => 'Own ' + q.id);
  register('nodes', (c) => c.nodesBought, (q) => q.n + ' upgrades bought');
  register('built', (c, q) => yes(q.id === 'house' ? c.built.house : q.id === 'lab' ? c.lab.built : c.s.built[q.id]), (q) => 'Build ' + q.id);
  register('recipes', (c) => c.lab.known.length, (q) => q.n + ' recipes known');
  register('strains', (c) => c.lab.done.strains, (q) => q.n + ' strains found');
  register('worker', (c) => yes(c.lab.workers.length), () => 'A researcher in the lab');
  register('labPhase', (c) => c.lab.phase, (q) => 'Lab stage ' + q.n);
  register('labNode', (c, q) => yes(c.lab.nodes[q.id]), (q) => 'Lab: ' + q.id);
  register('blueprint', (c, q) => yes(c.lab.blueprints[q.id]), (q) => 'Blueprint: ' + q.id);
  register('style', (c, q) => yes(c.lab.styles[q.id]), (q) => 'Study ' + cap(q.id));
  register('material', (c, q) => (c.s.matMade && c.s.matMade[q.id]) || 0, (q) => q.n + ' ' + q.id + ' found so far');
  register('veins', (c) => c.s.m.veinCaps > 0 ? Math.max(1, c.s.m.veinsOpened || 1) : 0, () => 'Reveal a cheese vein');
  register('raw', (c) => c.s.m.raw, (q) => 'Drill ' + q.n + ' Raw Cheese');
  register('base', (c) => c.s.m.base, (q) => 'Refine ' + q.n + ' Cheese Base');
  register('lots', (c) => c.s.m.lotsMade, (q) => 'Make ' + q.n + ' cheese');
  register('sold', (c) => c.s.m.sold + c.s.m.whole, (q) => 'Sell ' + q.n + ' cheese');

  const table = () => E2.ROADMAP.unlocks;
  let byId = null, indexed = -1;
  const index = () => { if (!byId || indexed !== table().length) { byId = {}; indexed = table().length; for (const e of table()) byId[e.id] = e; } return byId; };
  const has = (id) => !!index()[id];
  const isOpen = (c, id) => c.unlocked[id] != null;
  const countOpen = (c, prefix) => table().reduce((a, e) => a + (e.id.startsWith(prefix) && c.unlocked[e.id] != null ? 1 : 0), 0);
  const met = (c, q) => { const T = TYPES[q.t]; return T.val(c, q) >= T.need(q); };
  const ready = (c, e) => e.requires.every((q) => met(c, q));
  // Abre lo que ya cumple sus requisitos (puede encadenar) y lo anuncia. Lo pendiente de otro hito no se abre.
  function refresh(c) {
    let opened = 0;
    for (let again = true; again; ) {
      again = false;
      for (const e of table()) {
        if (e.planned || c.unlocked[e.id] != null || !ready(c, e)) continue;
        c.unlocked[e.id] = c.s.t; opened += 1; again = true;
        Ru().note(c, 'unlock', { id: e.id, kind: e.kind, system: e.system, stage: e.stage });
      }
    }
    return opened;
  }
  // Para explicar lo que falta: cada requisito con su texto y su progreso.
  const explain = (c, q) => { const T = TYPES[q.t], need = T.need(q), cur = T.val(c, q); return { text: T.text(q), cur: Math.min(cur, need), need, ok: cur >= need }; };
  const status = (c, id) => { const e = index()[id]; return { id, stage: e.stage, system: e.system, kind: e.kind, planned: e.planned || null, open: isOpen(c, id), at: c.unlocked[id], requires: e.requires.map((q) => explain(c, q)) }; };
  // Reparto sobre el papel: desbloqueos únicos por etapa, sin contar dos veces los caminos que compiten.
  function tally() {
    const out = {}, seen = {};
    for (const st of E2.ROADMAP.stages) out[st.id] = 0;
    for (const e of table()) {
      if (e.kind !== 'unique' || e.tally === false || e.planned) continue;
      const k = e.slot || e.id;
      if (seen[k]) continue;
      seen[k] = true; out[e.stage] += 1;
    }
    return out;
  }
  // Reparto en una partida: lo abierto hasta ahora, por tipo y por sistema.
  function opened(c) {
    const out = { unique: 0, repeatable: 0, discovery: 0, social: 0, bySystem: {} }, seen = {};
    for (const e of table()) {
      if (c.unlocked[e.id] == null) continue;
      const k = e.slot || e.id;
      if (seen[k]) continue;
      seen[k] = true; out[e.kind] += 1; out.bySystem[e.system] = (out.bySystem[e.system] || 0) + 1;
    }
    return out;
  }
  // La tabla está bien formada: etapas y sistemas conocidos, requisitos de tipos que existen, referencias válidas y sin ciclos.
  function validate() {
    const R = E2.ROADMAP, err = [], seen = {}, stages = R.stages.map((x) => x.id);
    for (const e of R.unlocks) {
      if (seen[e.id]) err.push('duplicado ' + e.id);
      seen[e.id] = true;
      if (!stages.includes(e.stage)) err.push(e.id + ': etapa ' + e.stage);
      if (!R.systems.includes(e.system)) err.push(e.id + ': sistema ' + e.system);
      if (!['unique', 'repeatable', 'discovery', 'social'].includes(e.kind)) err.push(e.id + ': tipo ' + e.kind);
      if (!e.requires.length) err.push(e.id + ': sin requisitos');
      for (const q of e.requires) {
        if (!TYPES[q.t]) err.push(e.id + ': requisito ' + q.t);
        if (q.t === 'unlock' && !index()[q.id]) err.push(e.id + ': referencia ' + q.id);
        if (q.t === 'unlock' && index()[q.id] && index()[q.id].planned && !e.planned) err.push(e.id + ': depende de algo sin construir: ' + q.id);
      }
    }
    for (const g of R.goals) for (const q of g.requires) if (!TYPES[q.t]) err.push('objetivo ' + g.id + ': requisito ' + q.t);
    const state = {};
    const walk = (id) => { if (state[id] === 2) return; if (state[id] === 1) { err.push('ciclo en ' + id); return; } state[id] = 1; for (const q of index()[id].requires) if (q.t === 'unlock' && index()[q.id]) walk(q.id); state[id] = 2; };
    for (const e of R.unlocks) walk(e.id);
    return err;
  }
  return { register, TYPES, has, isOpen, countOpen, met, ready, refresh, explain, status, tally, opened, validate, table };
})();
