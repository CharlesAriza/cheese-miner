// CHEESE DRILLER · BETA · BEST FIT: colocar a los ratones donde la colonia gana más, con lo que rinden de verdad.
// Mide con el motor: copia la partida, avanza la copia unos minutos y cuenta lo cobrado más lo que queda por vender. No hay estimador
// aparte que pueda quedarse viejo: cualquier cambio de reglas, rasgos o especialidades entra solo.
// Reglas (contrato): rellena vacantes con ratones sin puesto, intercambia a los que ya trabajan, nunca deja a nadie sin puesto ni un
// puesto principal sin cubrir, no mueve al investigador y, si no encuentra nada mejor de verdad, no cambia nada. Juzga a cada ratón por
// separado: buscar combinaciones sigue siendo cosa del jugador. Determinista: misma partida, mismo resultado.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.bestfit = (function () {
  const Mo = () => E2.model, C = () => E2.crew, P = () => E2.PARAMS;
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell'];
  const H_MS = 6 * 60000, MIN_GAIN = 1.005, MAX_MOVES = 5, TOP = 6; // busca al tocar el botón: en un móvil, menos de un segundo

  function copy(v) {
    if (Array.isArray(v)) return v.map(copy);
    if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = copy(v[k]); return o; }
    return v;
  }
  // Lo que da una plantilla: la misma partida, a partir de ahora, sin eventos ni azar (el motor no usa azar en la producción).
  function measure(s, placed) {
    const t = copy(Object.assign({}, s, { placed: [], q: undefined, team: null, rates: null }));
    delete t.q;
    Mo().place(t, placed.map((p) => ({ m: p.m, st: p.st, fn: p.fn, role: p.role })));
    const from = t.m.coins;
    Mo().advance(t, t.t + H_MS);
    let stock = 0;
    for (const k of Object.keys(t.lots)) if (t.lots[k] > 0) stock += t.lots[k] * Mo().price(t, k) * 0.5;
    return t.m.coins - from + stock;
  }
  // Lo que un ratón haría solo en un puesto: sirve para ordenar qué cambios probar primero, nunca para decidir.
  function fit(c, m, st, fn) {
    const ctx = { depth: 0, away: false, mice: c.roster.length, recipes: c.lab.known.length, stationLevel: P().stationLevel };
    const o = C().own(m, st, ctx), W = C().work(m, st);
    return fn === 'rend' ? W * (1 + o.cant + o.dbl) : W * (1 + o.vel);
  }
  const posts = (c) => [].concat(...ST.filter((st) => st === 'mine' || c.s.built[st]).map((st) => P().posts[st][c.s.stage[st] - 1].map(([role, fn]) => ({ st, role, fn }))));

  function plan(c) {
    const s = c.s, ops = [];
    let placed = s.placed.slice();
    // 1. Las vacantes, primero las de principal, con los ratones que esperan (el investigador no espera).
    const waiting = c.roster.filter((m) => !c.lab.workers.includes(m.id) && !placed.some((p) => p.m === m));
    const empty = posts(c).filter((q) => !placed.some((p) => p.st === q.st && p.role === q.role)).sort((a, b) => (a.fn === 'pr' ? 0 : 1) - (b.fn === 'pr' ? 0 : 1) || ST.indexOf(a.st) - ST.indexOf(b.st));
    for (const q of empty) {
      if (!waiting.length) break;
      waiting.sort((a, b) => fit(c, b, q.st, q.fn) - fit(c, a, q.st, q.fn) || (a.id < b.id ? -1 : 1));
      const m = waiting.shift();
      placed = placed.concat([{ m, st: q.st, fn: q.fn, role: q.role }]);
      ops.push({ kind: 'assign', id: m.id, st: q.st, role: q.role });
    }
    const base0 = measure(s, s.placed);
    let cur = ops.length ? measure(s, placed) : base0;
    // 2. Intercambios entre los que ya trabajan: los que más prometen, medidos con el motor; se hace el mejor y se repite.
    for (let g = 0; g < MAX_MOVES; g++) {
      const cand = [];
      for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i], b = placed[j];
        if (a.st === b.st && a.fn === b.fn) continue;
        const now = fit(c, a.m, a.st, a.fn) * fit(c, b.m, b.st, b.fn), then = fit(c, a.m, b.st, b.fn) * fit(c, b.m, a.st, a.fn);
        if (then > now * 1.001) cand.push({ i, j, r: then / now });
      }
      cand.sort((x, y) => y.r - x.r || x.i - y.i || x.j - y.j);
      let best = null;
      for (const k of cand.slice(0, TOP)) {
        const t = placed.slice(), a = t[k.i], b = t[k.j];
        t[k.i] = { m: b.m, st: a.st, fn: a.fn, role: a.role }; t[k.j] = { m: a.m, st: b.st, fn: b.fn, role: b.role };
        const v = measure(s, t);
        if (v > cur * MIN_GAIN && (!best || v > best.v)) best = { v, t, a, b };
      }
      if (!best) break;
      placed = best.t; cur = best.v;
      ops.push({ kind: 'move', id: best.a.m.id, st: best.b.st, role: best.b.role, swaps: best.b.m.id });
    }
    // 3. Si al final no se gana (y no había vacantes que cubrir), no se toca nada.
    const filled = ops.some((o) => o.kind === 'assign');
    if (!filled && !(cur > base0 * MIN_GAIN)) return { ops: [], moved: 0, gain: 1 };
    const moved = {};
    for (const o of ops) { moved[o.id] = 1; if (o.swaps) moved[o.swaps] = 1; }
    return { ops, moved: Object.keys(moved).length, gain: base0 > 0 ? cur / base0 : 1 };
  }
  return { plan, measure };
})();
