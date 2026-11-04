// ECONOMY 2.0 · S1 · Ratones y cuadrillas.
// Lo que vale cada ratón se calcula EXACTAMENTE como en el juego (réplica de js/game/systems/mice.js:
// nivel, valor de trabajo, efectos de rasgos con grados, manías y combinaciones internas). Lo nuevo de
// Economy 2.0 (funciones de puesto, parejas, línea de principales, auras por estación, tope de equipo)
// sigue F0.1 §4 y F0.2 §3, con los pesos de E2.PARAMS.crew.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.crew = (function () {
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell']; // orden de la cadena = línea de principales
  const SKILL = { mine: 'mining', drill: 'drilling', refine: 'refining', cheese: 'cheesemaking', sell: 'trading', research: 'research' }; // research: investigador del LAB (S3)
  const M = () => E2.REAL.mice;
  const T = () => E2.REAL.mice.traits;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ---- Réplicas del juego (mice.js) ----
  function level(m) {
    const B = M();
    const raw = Math.floor(Math.log((m.xp * (B.xpGrowth - 1)) / B.xpBase + 1) / Math.log(B.xpGrowth) + 1e-9) + 1;
    return Math.max(1, Math.min(B.maxLevel, raw));
  }
  function gradeOf(m, skill) {
    if (!m.spec || !m.spec[skill]) return 0;
    const done = (m.jobs && m.jobs[skill]) || 0;
    let g = 0;
    for (const need of M().jobGrades) if (done >= need) g += 1;
    return g;
  }
  function traitsOf(m) {
    const out = (m.traits || []).concat(m.learned || []).map((id) => ({ id, grade: 1 }));
    for (const skill of Object.keys(m.spec || {})) if (T()[m.spec[skill]]) out.push({ id: m.spec[skill], grade: Math.max(1, gradeOf(m, skill)) });
    return out.filter((t) => T()[t.id]);
  }
  function combosOf(m) {
    const have = {};
    traitsOf(m).forEach((t) => (have[t.id] = true));
    return M().combos.filter((c) => c.needs.every((id) => have[id]));
  }
  function fx(m, skill) {
    const list = traitsOf(m);
    const calm = list.some((t) => T()[t.id].eff.noQuirks);
    const sum = {};
    const add = (eff, k) => { for (const key of Object.keys(eff)) sum[key] = (sum[key] || 0) + eff[key] * k; };
    for (const t of list) {
      const def = T()[t.id];
      if (def.job && def.job !== skill) continue;
      if (def.kind === 'quirk' && calm) continue;
      add(def.eff, def.job ? M().gradeMult[t.grade - 1] : 1);
    }
    for (const c of combosOf(m)) add(c.eff, 1);
    return sum;
  }
  const hasTrait = (m, id) => (id === '*legend' ? m.rarity === 2 || traitsOf(m).some((t) => T()[t.id].kind === 'legend') : traitsOf(m).some((t) => t.id === id));
  function fur(m) {
    const n = (m.look || 0) >>> 0, r = m.rarity || 0;
    return r === 2 ? 9 : r === 1 ? 7 + (n % 2) : n % 7;
  }
  const affinity = (m, skill) => M().affinity[(m.aff && m.aff[skill]) || 0] || M().affinity[0];

  // Valor de trabajo W (REAL: la parte «power» de speed() en mice.js).
  function work(m, st) {
    const B = M(), skill = SKILL[st], f = fx(m, skill), lv = E2.PARAMS.mouseLevelsFrozen ? level(m) : level(m);
    return 1 + B.perLevel * (lv - 1) + B.ranks[m.rank || 0].bonus + B.rarities[m.rarity || 0].bonus + affinity(m, skill).speed + (f.rankSpeed || 0) * (m.rank || 0);
  }
  // Rasgos propios por función (REAL: la parte «mult» de speed() y yieldMult(), sin equipo).
  // ctx: { depth, away, mice (tamaño de colonia), recipes, stationLevel }
  function own(m, st, ctx) {
    const B = M(), f = fx(m, SKILL[st]), P = E2.PARAMS.crew;
    let vel = (f.speed || 0) + (ctx.away ? f.awaySpeed || 0 : f.hereSpeed || 0);
    vel += clamp((f.depthSpeed || 0) * ctx.depth, -0.5, B.caps.depth);
    vel += (f.levelSpeed || 0) * Math.floor(ctx.stationLevel / 10);
    vel += (f.crowdSpeed || 0) * Math.min(ctx.mice, B.caps.crowd);
    let cant = f.yield || 0;
    cant += clamp((f.depthYield || 0) * ctx.depth, -0.5, B.caps.depthYield);
    cant += (f.recipeYield || 0) * Math.min(ctx.recipes, B.caps.recipes);
    // El doble (REAL: probabilidad) entra como cantidad esperada (HIP S1: sin azar en la producción).
    const dbl = clamp(f.double || 0, 0, B.caps.double);
    return { vel: clamp(vel, P.traitMin, P.traitMax), cant: clamp(cant, P.traitMin, P.traitMax), dbl };
  }

  // ---- Equipo (F0.2 §3) ----
  // Una pareja por ratón en toda la colonia. Candidatas: compañeros de una misma estación y
  // principales de estaciones vecinas. Cada pareja activa SOLO su mejor combinación (HIP S1).
  // El reparto se elige probando todos los posibles (rama y poda) y es independiente del orden.
  const linkScore = (l, away) => (l.eff.speed || 0) + (l.eff.yield || 0) + (l.eff.double || 0) + (away ? l.eff.awaySpeed || 0 : 0);
  function bestLink(a, b, away) {
    let best = null;
    for (const l of M().links) {
      if (!((hasTrait(a, l.a) && hasTrait(b, l.b)) || (hasTrait(a, l.b) && hasTrait(b, l.a)))) continue;
      const sc = linkScore(l, away);
      if (sc <= 0) continue;
      if (!best || sc > best.sc || (sc === best.sc && l.id < best.l.id)) best = { l, sc };
    }
    return best;
  }
  function pairs(placed, away) {
    // placed: [{ m, st, fn }]
    const edges = [];
    const key = (a, b) => (a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id);
    const prOf = {};
    for (const p of placed) if (p.fn === 'pr') prOf[p.st] = p;
    const seen = {};
    const tryEdge = (x, y, why) => {
      if (x.m.id === y.m.id) return;
      const k = key(x.m, y.m);
      if (seen[k]) return;
      seen[k] = true;
      const b = bestLink(x.m, y.m, away);
      if (b) edges.push({ a: x.m.id, b: y.m.id, k, link: b.l, w: b.sc, why });
    };
    for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) if (placed[i].st === placed[j].st) tryEdge(placed[i], placed[j], 'crew');
    for (let i = 0; i + 1 < ST.length; i++) if (prOf[ST[i]] && prOf[ST[i + 1]]) tryEdge(prOf[ST[i]], prOf[ST[i + 1]], 'line');
    edges.sort((x, y) => y.w - x.w || (x.k < y.k ? -1 : x.k > y.k ? 1 : 0));
    // Rama y poda: máximo peso total; empate -> la lista de claves ordenada más pequeña.
    let best = { w: -1, sel: [] };
    const used = {};
    const rest = edges.map((_, i) => edges.slice(i).reduce((a, e) => a + e.w, 0));
    (function go(i, w, sel) {
      if (w + (i < edges.length ? rest[i] : 0) < best.w - 1e-12) return;
      if (i === edges.length) {
        const ks = sel.map((e) => e.k).sort().join(',');
        if (w > best.w + 1e-12 || (Math.abs(w - best.w) <= 1e-12 && ks < best.ks)) best = { w, sel: sel.slice(), ks };
        return;
      }
      const e = edges[i];
      if (!used[e.a] && !used[e.b]) {
        used[e.a] = used[e.b] = true;
        sel.push(e);
        go(i + 1, w + e.w, sel);
        sel.pop();
        used[e.a] = used[e.b] = false;
      }
      go(i + 1, w, sel);
    })(0, 0, []);
    return best.sel;
  }
  // Combinaciones de línea (REAL M.sets) sobre los principales de MINE, DRILL, REFINE y CHEESE.
  function lineSets(placed, away) {
    const line = ['mine', 'drill', 'refine', 'cheese'].map((st) => placed.find((p) => p.st === st && p.fn === 'pr'));
    if (!line.every(Boolean)) return [];
    const entry = (p) => { const skill = SKILL[p.st]; return { m: p.m, aff: (p.m.aff && p.m.aff[skill]) || 0, spec: !!(p.m.spec && p.m.spec[skill]), fur: fur(p.m), legend: hasTrait(p.m, '*legend'), night: (fx(p.m, skill).awaySpeed || 0) > 0 }; };
    const e = line.map(entry);
    return M().sets.filter((d) => d.test(e));
  }
  // Auras: las emite cualquier ratón de una estación y las recibe el principal vecino. De cada lado
  // cuenta la positiva más fuerte y la negativa más fuerte (una manía sigue restando). Tope 0,6 (REAL).
  function auras(placed) {
    const out = {};
    for (let i = 0; i < ST.length; i++) {
      const pr = placed.find((p) => p.st === ST[i] && p.fn === 'pr');
      if (!pr) continue;
      let total = 0;
      const side = (st, key) => {
        if (!st) return 0;
        const vals = placed.filter((p) => p.st === st).map((p) => fx(p.m, SKILL[st])[key] || 0);
        const pos = Math.max(0, ...vals), neg = Math.min(0, ...vals);
        return pos + neg;
      };
      total += side(ST[i - 1], 'auraNext');
      total += side(ST[i + 1], 'auraPrev');
      out[pr.m.id] = clamp(total, -M().caps.aura, M().caps.aura);
    }
    return out;
  }
  // Lo que cada ratón recibe del equipo, con el tope de F0.2 (+60 % de velocidad o de cantidad).
  function team(placed, away) {
    const P = E2.PARAMS.crew, eff = {};
    const add = (id, k, v) => { (eff[id] = eff[id] || { vel: 0, cant: 0, dbl: 0 })[k] += v; };
    const ps = pairs(placed, away);
    for (const e of ps) for (const id of [e.a, e.b]) {
      add(id, 'vel', (e.link.eff.speed || 0) + (away ? e.link.eff.awaySpeed || 0 : 0));
      add(id, 'cant', e.link.eff.yield || 0);
      add(id, 'dbl', e.link.eff.double || 0);
    }
    const sets = lineSets(placed, away);
    for (const p of placed) if (p.fn === 'pr' && p.st !== 'sell') for (const d of sets) {
      add(p.m.id, 'vel', (d.eff.speed || 0) + (away ? d.eff.awaySpeed || 0 : 0));
      add(p.m.id, 'cant', d.eff.yield || 0);
    }
    const au = auras(placed);
    for (const id of Object.keys(au)) add(id, 'vel', au[id]);
    for (const id of Object.keys(eff)) {
      eff[id].vel = clamp(eff[id].vel, -P.teamCap, P.teamCap);
      eff[id].cant = clamp(eff[id].cant, -P.teamCap, P.teamCap);
    }
    return { eff, pairs: ps, sets, auras: au };
  }

  // ---- Cuadrilla de una estación (F0.1 §4, fórmula con indicador de principal) ----
  // Devuelve: auto (hay principal), ritmo = λ + w_r·Σc (multiplica la velocidad del ciclo) y
  // rend = 1 + w_y·Σy (multiplica la cantidad por ciclo). Sin principal: auto = false, sin apoyos.
  function station(placed, st, ctx, tm) {
    const P0 = E2.PARAMS.crew, w = (ctx.w && ctx.w[st]) || {}; // S2: pesos por estación (caminos del árbol)
    const P = Object.assign({}, P0, w.ritmo != null ? { ritmo: w.ritmo } : {}, w.rend != null ? { rend: w.rend } : {});
    const mine = placed.filter((p) => p.st === st);
    const pr = mine.find((p) => p.fn === 'pr');
    if (!pr) return { auto: false, ritmo: 0, rend: 1, pr: null };
    const val = (p) => {
      const o = own(p.m, st, ctx), t = (tm.eff[p.m.id] || { vel: 0, cant: 0, dbl: 0 });
      const dbl = Math.min(M().caps.double, o.dbl + t.dbl);
      return { W: work(p.m, st), vel: o.vel + t.vel, cant: o.cant + t.cant + dbl };
    };
    const v = val(pr);
    let ritmo = v.W * (1 + v.vel), sy = 0;
    for (const p of mine) {
      if (p === pr) continue;
      const x = val(p);
      if (p.fn === 'ritmo') ritmo += P.ritmo * x.W * (1 + x.vel);
      else if (p.fn === 'rend') sy += (P.combine === 'hybrid' ? 1 : P.combine === 'hybridW' ? 1 + P.yieldW * (x.W - 1) : x.W) * (1 + x.cant); // híbrido: el nivel acelera, los rasgos rinden; hybridW: el nivel cuenta en parte (S2)
    }
    if (P.combine === 'sum') return { auto: true, ritmo: Math.max(0.2, ritmo + P.rend * sy), rend: 1, pr: pr.m.id };
    return { auto: true, ritmo: Math.max(0.2, ritmo), rend: Math.max(0.2, 1 + P.rend * sy), pr: pr.m.id };
  }

  // Lo que un ratón suma a su estación en un puesto, con las cuentas de station(), y de qué se compone. Solo lee; la suma de todos da lo que devuelve station().
  function contribution(m, st, fn, ctx, tm) {
    const P0 = E2.PARAMS.crew, w = (ctx.w && ctx.w[st]) || {}, P = Object.assign({}, P0, w.ritmo != null ? { ritmo: w.ritmo } : {}, w.rend != null ? { rend: w.rend } : {});
    const B = M(), W = work(m, st), o = own(m, st, ctx), t = (tm && tm.eff[m.id]) || { vel: 0, cant: 0, dbl: 0 }, f = fx(m, SKILL[st]);
    const dbl = Math.min(B.caps.double, o.dbl + t.dbl), vel = o.vel + t.vel, cant = o.cant + t.cant + dbl, isRend = fn === 'rend';
    const levelK = isRend ? (P.combine === 'hybrid' ? 0 : P.combine === 'hybridW' ? P.yieldW : 1) : 1, wY = isRend ? (P.combine === 'hybrid' ? 1 : P.combine === 'hybridW' ? 1 + P.yieldW * (W - 1) : W) : W;
    const weight = isRend ? P.rend : fn === 'ritmo' ? P.ritmo : 1, value = isRend ? P.rend * wY * (1 + cant) : weight * W * (1 + vel);
    return {
      fn, base: weight, value, levelK,
      level: levelK * B.perLevel * (level(m) - 1), rank: levelK * (B.ranks[m.rank || 0].bonus + (f.rankSpeed || 0) * (m.rank || 0)), rarity: levelK * B.rarities[m.rarity || 0].bonus, liking: levelK * affinity(m, SKILL[st]).speed,
      traits: isRend ? o.cant + Math.min(B.caps.double, o.dbl) : o.vel, team: isRend ? cant - o.cant - Math.min(B.caps.double, o.dbl) : t.vel,
    };
  }

  return { ST, SKILL, level, gradeOf, combosOf, fx, work, own, hasTrait, traitsOf, pairs, lineSets, auras, team, station, contribution };
})();
