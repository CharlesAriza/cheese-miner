// ECONOMY 2.0 · S3-R · Reglas de progresión (antes, la primera mitad de prog.js; el código es el mismo).
// Qué se puede comprar, cuánto cuesta, qué efecto tiene y cuándo se abre: reclutas, XP de ratones y estaciones,
// especialidades, rasgos y rangos (REAL), fundamentales, fases, caminos con reajuste, hitos, Managers y refuerzos.
// No decide nada: las decisiones de los bots están en policy.js y las métricas en metrics.js.
// Los efectos de los nudos se aplican con el registro de effects.js; las cifras están en E2.PARAMS.s2 (HIP / PROV).
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.rules = (function () {
  const Mo = () => E2.model, C = () => E2.crew, P = () => E2.PARAMS, R = () => E2.REAL, Ef = () => E2.effects, Me = () => E2.metrics;
  const S2 = () => E2.PARAMS.s2, S3 = () => E2.PARAMS.s3 || {};
  // S3 · Módulos que añaden compras (LAB, Night Lamp): { options(c), buy(c, o), gain(c, o, base) }. Sin S3 no hay ninguno activo.
  const extras = [];
  const addExtra = (m) => { extras.push(m); };
  // S3 · Índice de precio por estrato (s3.costIndex = factor): coste x factor^estrato en caminos, fases e hitos (costAll).
  const s3Scale = (c) => (S3().costAll && S3().costIndex ? Math.pow(S3().costIndex, stratumIdx(c.s.depth)) : 1);
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell'];
  const SKILL = { mine: 'mining', drill: 'drilling', refine: 'refining', cheese: 'cheesemaking', sell: 'trading' };

  // ---------- Estado ----------
  // opts: { seed, profile, features: { A, B, C, D }, boostsTotal }
  function create(opts) {
    const s = Mo().create({ stage: { mine: 1, drill: 1, refine: 1, cheese: 1, sell: 1 }, placed: [], built: { drill: false, refine: false, cheese: false, sell: false } });
    const c = {
      s, seed: opts.seed || 1, rs: ((opts.seed || 1) * 7919 + 13) >>> 0, rng: null, profile: opts.profile, features: Object.assign({ A: true, B: true, C: true, D: true }, opts.features || {}),
      roster: [], recruited: 0, nextId: 1, house: false, nodesBought: 0,
      stXp: { mine: 0, drill: 0, refine: 0, cheese: 0, sell: 0 }, stLv: { mine: 1, drill: 1, refine: 1, cheese: 1, sell: 1 },
      fund: {}, phase: { mine: 1, drill: 1, refine: 1, cheese: 1, sell: 1 },
      owned: {}, active: {}, refitUntil: {}, ms: { wheel: false, master: false }, masterId: null,
      boosts: { earned: 0, total: opts.boostsTotal == null ? S2().boosts.total : opts.boostsTotal, place: { mine: 0, drill: 0, refine: 0, cheese: 0, sell: 0 }, moves: 0, awards: [] },
      lastCyc: null, log: [], events: {}, timeline: [], spent: { recruit: 0, promote: 0, fund: 0, phase: 0, path: 0, milestone: 0 }, byManager: 0, byPlayer: 0, managerSpend: 0,
      taps: 0, decisions: 0, lastFit: -1e9,
    };
    for (const st of ST) { c.fund[st] = {}; for (const f of S2().fundamentals[st]) c.fund[st][f.id] = 0; }
    c.rng = rngOf(c);
    c.lastCyc = JSON.parse(JSON.stringify(s.m.cyc));
    if (S2().styleGate === 'real') s.styleOwned = 0; // experimento S2: cada estilo nuevo se paga (precio REAL de abrir su roca)
    if (!c.features.B) c.house = true; // sin árbol (medición del bloque A), la Mouse House está abierta desde el principio
    applyMods(c);
    return c;
  }
  // Copia independiente de una partida (para medir variantes desde el mismo punto). Los puestos se vuelven a enlazar con
  // la plantilla copiada. Con seed, el azar de la copia se reinicia con esa semilla; sin ella, sigue igual que el original.
  // mulberry32 con el estado dentro de la partida (c.rs), para que una copia siga con el mismo azar.
  function rngOf(c) { return () => { c.rs = (c.rs + 0x6d2b79f5) >>> 0; let t = c.rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function clone(c, seed) {
    const keep = { rng: c.rng, profile: c.profile }; c.rng = null; c.profile = null;
    const j = JSON.parse(JSON.stringify(c, (k, v) => (v === Infinity ? 'Inf' : v)), (k, v) => (v === 'Inf' ? Infinity : v));
    c.rng = keep.rng; c.profile = keep.profile;
    if (seed != null) j.rs = seed >>> 0;
    j.rng = rngOf(j); j.profile = keep.profile;
    const byId = {}; j.roster.forEach((m) => (byId[m.id] = m));
    j.s.placed = j.s.placed.map((p) => Object.assign(p, { m: byId[p.m.id] || p.m }));
    Mo().place(j.s, j.s.placed);
    applyMods(j);
    return j;
  }
  // S3: con reloj (c.clock), cada evento y compra guardan además el tiempo real.
  const realNow = (c) => c.clock.segReal + (c.s.t - c.clock.segProd);
  const ev = (c, k) => { if (c.events[k] == null) { c.events[k] = c.s.t; if (c.clock) c.evReal[k] = realNow(c); } };
  const log = (c, what, cost, by) => { const e = { t: c.s.t, what, cost: Math.round(cost || 0), by: by || 'player', had: Math.round(c.s.coins + (cost || 0)) }; if (c.clock) e.real = realNow(c); c.log.push(e); }; // had: monedas antes de pagar
  const stratumIdx = (d) => P().strata.indexOf(Mo().stratumOf(d));
  // BETA: en una partida del juego (c.gated), qué está abierto lo decide progression.js con la tabla de datos; en el simulador
  // y en lo que la tabla no recoge, las puertas de siempre.
  const gate = (c, id, legacy) => (c.gated && E2.progression.has(id) ? E2.progression.isOpen(c, id) : legacy());
  const note = (c, type, data) => { const h = Mo().hooks.emit; if (h) h(c.s, type, data); };

  // ---------- Modificadores (árbol, niveles, refuerzos, caminos) ----------
  function activeNodes(c, st) {
    const out = [];
    for (const fork of S2().paths[st] || []) {
      const a = c.active[st + '.' + fork.id];
      if (!a) continue;
      for (const n of fork.opts[a]) if (c.owned[n.id]) out.push(n); else break; // un camino se activa hasta el último paso comprado, en orden
    }
    return out;
  }
  function applyMods(c) {
    const s = c.s, md = Mo().defaultMods(), F = c.features, E = Ef();
    md.w = {};
    let valueSum = 1;
    const cross = {}; // efectos previos: nudos que aceleran otra estación (eff.cross)
    if (F.C) for (const st of ST) for (const n of activeNodes(c, st)) E.applyPre(n.eff, cross);
    for (const st of ST) {
      let speedSum = 1;
      const acc = { mult: cross[st] || 1 };
      if (F.B) {
        speedSum += S2().levelBonus * (c.stLv[st] - 1);
        for (const f of S2().fundamentals[st]) { const r = c.fund[st][f.id] || 0; if (!r) continue; if (E.fundLayer(f.key) === 'speed') speedSum += f.per * fundEff(f, r); }
      }
      const add = (k, v) => (md[st][k] = (md[st][k] == null ? 1 : md[st][k]) + v);
      // Fundamentales de cantidad (Bigger Bit, Bigger Vat...): suma en su capa. Los de valor (Cheese Cellar, Better Prices)
      // van todos a una sola suma de valor (F0 J: «todo sumado»), no se multiplican entre sí.
      if (F.B) for (const f of S2().fundamentals[st]) { const r0 = c.fund[st][f.id] || 0; const layer = E.fundLayer(f.key); if (!r0 || layer === 'speed') continue; const r = fundEff(f, r0); if (layer === 'value') valueSum += f.per * r; else add(f.key, f.per * r); }
      if (F.C) for (const n of activeNodes(c, st)) E.applyNode(n.eff, { md, st, acc });
      if (c.refitUntil[st] && s.t < c.refitUntil[st]) acc.mult *= S2().refitSpeed;
      const nb = F.D ? c.boosts.place[st] : 0;
      if (st === 'refine') {
        // S2.5 · refineBoost: 'dim' (el 2.º da `second`), 'one' (el 2.º da velocidad), 'rebal' (cada uno x`each`). Por defecto, REAL.
        const RB = S2().refineBoost || {}, b = R().boosts.base;
        if (RB.mode === 'dim') md.refine.base *= nb >= 1 ? b * (nb >= 2 ? RB.second : 1) : 1;
        else if (RB.mode === 'one') { md.refine.base *= nb >= 1 ? b : 1; if (nb >= 2) acc.mult *= R().boosts.speed; }
        else if (RB.mode === 'rebal') md.refine.base *= Math.pow(RB.each, nb);
        else md.refine.base *= Math.pow(b, nb);
      } else acc.mult *= Math.pow(R().boosts.speed, nb);
      md[st].speed = speedSum * acc.mult;
    }
    md.sell.buyerLevel += F.B && !S2().buyersOff ? c.stLv.sell - 1 : 0; // REAL: compradores por nivel de Trading
    md.valueSum = valueSum;
    if (F.C && c.ms.wheel) md.cheese.wheel = true;
    if (F.C && c.ms.master && c.masterId) {
      const m = c.roster.find((x) => x.id === c.masterId), inCheese = s.placed.some((p) => p.st === 'cheese' && p.m.id === c.masterId);
      const jobs = (m && m.jobs.cheesemaking) || 0, M2 = R().milestones.master;
      const grade = jobs >= M2.from ? Math.floor(Math.log2(jobs / M2.from)) + 1 : 0;
      if (inCheese && grade) md.cheese.master = M2.per * grade;
    }
    s.mods = md;
    Mo().refreshRates(s);
    if (s.vein && !s.vein.open) s.mine.next = !s.rates.mine.auto ? null : s.mine.next != null ? s.mine.next : s.t + R().mining.minerIntervalMs / s.rates.mine.ritmo;
  }

  // ---------- XP: estaciones (REAL) y ratones (REAL) ----------
  const stXpFor = (lv) => (R().xp.base * (Math.pow(R().xp.growth, lv - 1) - 1)) / (R().xp.growth - 1);
  function stLevelOf(xp) { let lv = 1; while (lv < R().xp.maxLevel && xp >= stXpFor(lv + 1)) lv++; return lv; }
  function creditXp(c) {
    const s = c.s, now = s.m.cyc, last = c.lastCyc, d = (st, k) => now[st][k] - last[st][k];
    const st0 = Mo().stratumOf(s.depth), tp = S2().xpTierPower == null ? R().xp.tierPower : S2().xpTierPower;
    const tier = Math.pow(Mo().styleValue(st0.id) / 10, tp) * (1 + R().xp.depthBonus * Math.min(S2().xpDepthCap || Infinity, s.depth - st0.from)); // XP de profundidad por estrato (F0.1)
    const key = Mo().currentKey(s), rxp = Math.pow(Mo().formula(key).value / 10, R().xp.recipePower);
    const gain = {
      mine: (d('mine', 'auto') + d('mine', 'manual')) * R().xp.perHit * S2().mineXpFactor * tier,
      drill: (d('drill', 'auto') + d('drill', 'manual')) * R().xp.perDrill * tier,
      refine: (d('refine', 'auto') + d('refine', 'manual')) * R().xp.perRefine * Math.pow(Mo().styleValue(st0.id) / 10, tp),
      cheese: (now.cheese.lots - last.cheese.lots) * R().xp.perCheese * rxp,
      sell: (d('sell', 'auto') + d('sell', 'manual')) * R().xp.perSale * rxp,
    };
    let changed = false;
    if (c.features.B) for (const st of ST) { c.stXp[st] += gain[st] * (S3().xpScale || 1); const lv = stLevelOf(c.stXp[st]); if (lv !== c.stLv[st]) { c.stLv[st] = lv; changed = true; } }
    // Ratones: cada ciclo automático de su estación da experiencia a toda la cuadrilla (REAL: 1 por ciclo; 0,25 por golpe).
    const pmT = Mo().productMods(s, key), M = R().mice, autoN = { mine: d('mine', 'auto') * M.xpPerHit, drill: d('drill', 'auto'), refine: d('refine', 'auto'), cheese: d('cheese', 'auto') * (pmT && pmT.teach ? pmT.teach : 1), sell: d('sell', 'auto') }; // S3: la cepa Teaching enseña más
    let traitsChanged = false;
    if (c.features.A) for (const p of s.placed) {
      const n = autoN[p.st];
      if (!n) continue;
      const m = p.m, skill = SKILL[p.st], f = C().fx(m, skill);
      const before = C().level(m);
      m.xp += n * Math.max(0.1, 1 + (f.mouseXp || 0)) * (S3().miceXpScale || 1); // S3: sensibilidad, apagada por defecto
      const aff = M.affinity[(m.aff && m.aff[skill]) || 0];
      const jobs0 = m.jobs[skill] || 0;
      m.jobs[skill] = jobs0 + n * aff.learn * Math.max(0.1, 1 + (f.jobXp || 0));
      if (C().level(m) !== before) changed = true;
      if (grow(c, m, skill, jobs0)) traitsChanged = true;
    }
    c.lastCyc = JSON.parse(JSON.stringify(now));
    return { changed, traitsChanged };
  }
  // REAL (mice.js grow/autoTrait): especialidad a los 200 trabajos de un oficio; un rasgo cada 10 niveles (6 como mucho).
  function grow(c, m, skill, jobs0) {
    const M = R().mice, T = M.traits, rnd = c.rng, pick = (list) => list[Math.floor(rnd() * list.length)];
    let got = false;
    if (!m.spec[skill] && (m.jobs[skill] || 0) >= M.jobGrades[0]) { m.spec[skill] = pick(Object.keys(T).filter((k) => T[k].job === SKILL_JOB(skill))); got = true; ev(c, 'firstSpecialty'); note(c, 'specialty', { id: m.id, job: skill, trait: m.spec[skill] }); }
    else if (m.spec[skill]) { for (const g of M.jobGrades) if (jobs0 < g && m.jobs[skill] >= g) got = true; }
    while (m.picks < Math.min(M.traitSlots, Math.floor(C().level(m) / M.traitEvery))) {
      m.picks += 1;
      const have = {}; C().traitsOf(m).forEach((t) => (have[t.id] = true));
      const free = (ids) => ids.filter((id) => !have[id]);
      const ids = (kind) => Object.keys(T).filter((k) => T[k].kind === kind);
      let t = null;
      if (rnd() < M.autoLegendChance && free(ids('legend')).length) t = pick(free(ids('legend')));
      else {
        const jobs = Object.keys(m.jobs).filter((k) => m.jobs[k] > 0), total = jobs.reduce((a, k) => a + m.jobs[k], 0);
        if (total > 0 && rnd() < M.historyWeight) { let r = rnd() * total; const job = jobs.find((k) => (r -= m.jobs[k]) < 0) || jobs[0]; const th = free(M.jobPools[job] || []); if (th.length) t = pick(th); }
        if (!t) { const g = free(ids('good')); if (g.length) t = pick(g); }
      }
      if (t) { m.learned.push(t); got = true; if (T[t].kind === 'legend') ev(c, 'firstLegendTrait'); note(c, 'trait', { id: m.id, trait: t, legend: T[t].kind === 'legend' }); }
    }
    return got;
  }
  const SKILL_JOB = (skill) => skill;

  // ---------- Reclutar (REAL: 100 x 1,5 por recluta de toda la partida; tres candidatos) ----------
  const recruitCost = (c) => (S2().recruitFirst && c.recruited < S2().recruitFirst.length ? S2().recruitFirst[c.recruited] : Math.round(R().mice.recruitCost * Math.pow(R().mice.recruitGrowth, c.recruited) * (S2().recruitScale || 1))); // S2.5: recruitFirst = precio de los primeros
  function candidates(c) {
    const M = R().mice, T = M.traits, rnd = c.rng, pick = (l) => l[Math.floor(rnd() * l.length)], ids = (k) => Object.keys(T).filter((x) => T[x].kind === k);
    const JOBS = ['mining', 'drilling', 'refining', 'cheesemaking', 'trading', 'research'], out = [];
    for (let i = 0; i < M.candidates; i++) {
      const roll = rnd(), rarity = roll < M.rarities[2].chance ? 2 : roll < M.rarities[2].chance + M.rarities[1].chance ? 1 : 0;
      const first = rarity === 2 ? pick(ids('legend')) : pick(ids('good')), second = rarity === 2 ? pick(ids('good')) : pick(ids('quirk'));
      const aff = {};
      for (const sk of JOBS) { const r = rnd(); const lv = r < M.affinity[2].chance ? 2 : r < M.affinity[2].chance + M.affinity[1].chance ? 1 : 0; if (lv) aff[sk] = lv; }
      if (!Object.keys(aff).length) aff[pick(JOBS)] = 1;
      out.push({ id: 'r' + String(c.nextId++).padStart(3, '0'), name: 'R' + c.nextId, traits: [first, second], learned: [], picks: 0, aff, spec: {}, jobs: {}, xp: 0, rank: 0, rarity, look: Math.floor(rnd() * 1048576) });
    }
    return out;
  }
  // Valor de un ratón en un puesto, por sí solo (lo que enseña su ficha).
  function fitValue(c, m, st, fn) {
    const ctx = { depth: 0, away: false, mice: c.roster.length + 1, recipes: P().recipesKnown || 0, stationLevel: 1 };
    const o = C().own(m, st, ctx), W = C().work(m, st);
    return fn === 'rend' ? 1 + o.cant + o.dbl : W * (1 + o.vel);
  }
  function emptyPosts(c) {
    const s = c.s, out = [];
    for (const st of ST) for (const [role, fn] of P().posts[st][s.stage[st] - 1]) if (!s.placed.some((p) => p.st === st && p.role === role)) out.push({ st, role, fn });
    return out;
  }
  // how: cómo elige el jugador entre los tres candidatos ('fit' = el que más rinde en ese puesto; 'affinity' = rareza y
  // afinidad con el oficio; si no, el primero). Es una decisión del perfil, que la pasa policy.js.
  function hire(c, post, how) {
    const cost = recruitCost(c);
    if (c.s.coins < cost) return false;
    const cand = candidates(c);
    let best = cand[0];
    if (how === 'fit') best = cand.slice().sort((a, b) => fitValue(c, b, post.st, post.fn) - fitValue(c, a, post.st, post.fn))[0];
    else if (how === 'affinity') best = cand.slice().sort((a, b) => (b.rarity - a.rarity) || (((b.aff[SKILL[post.st]] || 0) - (a.aff[SKILL[post.st]] || 0))))[0];
    c.s.coins -= cost; c.s.coinsStart -= cost; c.spent.recruit += cost; c.recruited += 1;
    c.roster.push(best);
    const placed = c.s.placed.concat([{ m: best, st: post.st, fn: post.fn, role: post.role }]);
    Mo().place(c.s, placed);
    log(c, 'recruit:' + post.st + ':' + post.fn, cost);
    if (c.recruited === 1) ev(c, 'firstMouse');
    if (post.fn === 'pr') ev(c, 'auto_' + post.st);
    if (ST.every((st) => c.s.placed.some((p) => p.st === st && p.fn === 'pr'))) ev(c, 'chainAutomated');
    if (post.fn !== 'pr') ev(c, 'firstSupport');
    if (best.rarity === 2) ev(c, 'firstLegendary');
    return true;
  }
  // REAL: rangos (nivel 10 / 25 / 40; 2.000 / 150.000 / 20 M) x escala HIP de S2 (PARAMS.s2.rankCostScale).
  function promoteOptions(c) {
    const out = [];
    for (const m of c.roster) {
      const next = R().mice.ranks[(m.rank || 0) + 1];
      if (next && C().level(m) >= next.level) out.push({ m, cost: Math.round(next.cost * S2().rankCostScale), rank: (m.rank || 0) + 1 });
    }
    return out;
  }
  function promote(c, o, by) {
    if (c.s.coins < o.cost) return false;
    c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.promote += o.cost; o.m.rank = o.rank;
    log(c, 'promote:' + o.rank, o.cost, by);
    ev(c, 'rank' + o.rank);
    return true;
  }

  // ---------- Árbol: fundamentales, fases, caminos, hitos ----------
  // HIP S2: costScale 'style' = los costes del árbol se escalan con el valor del estilo del estrato actual (valor/10).
  const styleScale = (c) => (S2().costScale === 'style' ? Mo().styleValue(Mo().stratumOf(c.s.depth).id) / 10 : 1);
  // Experimento S2: fundCap 'real' = tope de rangos del nudo del juego actual; fundGrowthReal = su crecimiento real.
  const realNode = (st, f) => (R().trees[SKILL[st]] || []).find((n) => n.id === f.id) || {};
  // S2.5 · Modelos de fundamentales (PARAMS.s2.fund; vacío = S2). kind: velocidad, cantidad o valor.
  //   A: tope de rangos por fase de la estación · B: tope que crece con cada estrato alcanzado
  //   C: sin tope, rendimiento decreciente (r^power) y coste más empinado · D: híbrido (velocidad por fase,
  //   cantidad por estrato, valor repetible decreciente). costBy 'stratum': precio en la economía del estrato actual.
  const FM = () => S2().fund || {};
  const fundKind = (f) => (f.key === 'speed' ? 'speed' : f.key === 'value' || f.key === 'price' ? 'value' : 'qty');
  //   E (propuesta S2.5): velocidad y cantidad se abren con el nivel de la estación (1 rango cada perLevels niveles) y su
  //   precio crece como la curva de XP (growth = 1,15^perLevels); valor repetible decreciente (C).
  const fundRule = (f) => { const m = FM().model; if (!m) return 'S2'; if (m === 'E') return fundKind(f) === 'value' ? 'C' : 'L'; if (m !== 'D') return m; const k = fundKind(f); return k === 'speed' ? 'A' : k === 'qty' ? 'B' : 'C'; };
  const fundEff = (f, r) => (fundRule(f) === 'C' ? Math.pow(r, FM().power || 0.75) : r); // rangos efectivos
  const fundGrowthOf = (st, f) => (fundRule(f) === 'C' ? FM().growthC || 1.25 : FM().growth ? FM().growth : S2().fundGrowthReal && realNode(st, f).growth ? realNode(st, f).growth : S2().fundGrowth);
  const fundMax = (st, f, c) => {
    const rule = fundRule(f);
    if (rule === 'A') return FM().phaseCaps[(c ? c.phase[st] : 1) - 1] + (FM().speedExtra && c ? FM().speedExtra * Math.max(0, stratumIdx(c.s.depth) - 5) : 0); // S3: speedExtra, rangos de velocidad por estrato más allá de Blue
    if (rule === 'B') return Math.min(FM().maxCap || Infinity, (FM().perStratum || 5) * ((c ? stratumIdx(c.s.depth) : 0) + 1) + (FM().baseCap || 0)); // S3: maxCap, techo fijo aunque haya más estratos
    if (rule === 'C') return Infinity;
    if (rule === 'L') return Math.floor((c ? c.stLv[st] : 1) / (FM().perLevels || 3));
    return S2().fundCap === 'real' && realNode(st, f).max ? realNode(st, f).max : Infinity;
  };
  // costBy 'stratum': precio x valor del estilo/10 · costBy 'index' (S3): precio x s3.costIndex^estrato.
  const stratumScale = (c) => (FM().costBy === 'stratum' ? Mo().styleValue(Mo().stratumOf(c.s.depth).id) / 10 : FM().costBy === 'index' ? Math.pow(S3().costIndex, stratumIdx(c.s.depth)) : 1);
  // S3 · costBy 'tier': cada rango con tope pertenece a un tramo fijo (el estrato en que se abre) y cuesta x tierG por tramo, esté donde esté la colonia.
  const rankTier = (f, r) => (fundKind(f) === 'speed' ? Math.floor(r / 4) : r < (FM().baseCap || 0) + (FM().perStratum || 0) ? 0 : 1 + Math.floor((r - (FM().baseCap || 0) - (FM().perStratum || 0)) / (FM().perStratum || 1)));
  const tierScale = (c, f, r) => (FM().costBy !== 'tier' ? 1 : fundKind(f) === 'value' ? Mo().styleValue(Mo().stratumOf(c.s.depth).id) / 10 : Math.pow(FM().tierG, rankTier(f, r)));
  const fundCost = (c, st, f) => Math.round(f.cost * Math.pow(fundGrowthOf(st, f), c.fund[st][f.id] || 0) * styleScale(c) * stratumScale(c) * tierScale(c, f, c.fund[st][f.id] || 0) * (FM().costK || 1)); // costK: nivel de precio (sensibilidad)
  function fundOptions(c) {
    if (!c.features.B) return [];
    const out = [];
    for (const st of ST) if (c.s.built[st] !== false || st === 'mine') for (const f of S2().fundamentals[st]) if (gate(c, 'fund.' + st + '.' + f.id, () => c.stLv[st] >= (f.level || 1)) && (c.fund[st][f.id] || 0) < fundMax(st, f, c)) out.push({ kind: 'fund', st, f, cost: fundCost(c, st, f) });
    return out;
  }
  function buyFund(c, o, by) {
    if (c.s.coins < o.cost) return false;
    c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.fund += o.cost; c.fund[o.st][o.f.id] += 1; c.nodesBought += 1;
    if (by === 'manager') { c.byManager += 1; c.managerSpend += o.cost; } else c.byPlayer += 1;
    log(c, 'fund:' + o.st + '.' + o.f.id, o.cost, by);
    if (!c.house) { c.house = true; ev(c, 'house'); } // REAL: la Mouse House se abre con la primera mejora
    return true;
  }
  function phaseOptions(c) {
    if (!c.features.B) return [];
    const out = [];
    for (const st of ST) {
      const next = c.phase[st] + 1, ph = S2().phases[next];
      if (!ph || c.s.built[st] === false) continue;
      if (gate(c, 'phase' + next + '.' + st, () => c.stLv[st] >= ph.level && c.s.depth >= ph.depth)) out.push({ kind: 'phase', st, next, cost: ph.cost * s3Scale(c) });
    }
    return out;
  }
  function buyPhase(c, o) {
    if (c.s.coins < o.cost) return false;
    c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.phase += o.cost; c.phase[o.st] = o.next; c.s.stage[o.st] = o.next;
    Mo().place(c.s, c.s.placed.filter((p) => P().posts[p.st][c.s.stage[p.st] - 1].some(([r]) => r === p.role))); // los puestos que siguen existiendo
    log(c, 'phase:' + o.st + ':' + o.next, o.cost);
    ev(c, 'phase' + o.next + '_' + o.st); ev(c, 'firstPhase' + o.next);
    return true;
  }
  // Caminos: el siguiente paso de cada camino, con sus puertas.
  function pathOptions(c, prefer) {
    if (!c.features.C) return [];
    const out = [];
    for (const st of ST) for (const fork of S2().paths[st] || []) {
      const fk = st + '.' + fork.id, act = c.active[fk];
      for (const [optId, nodes] of Object.entries(fork.opts)) {
        if (act && act !== optId) continue; // los bots no compran el otro camino salvo para cambiar (ver switchPath)
        if (prefer && prefer[fk] && prefer[fk] !== optId && !act) continue;
        const i = nodes.findIndex((n) => !c.owned[n.id]);
        if (i < 0) continue;
        const n = nodes[i], g = fork.gates[i] || fork.gates[fork.gates.length - 1];
        if (!gate(c, 'path.' + n.id, () => c.stLv[st] >= g.level && c.s.depth >= (g.depth || 0))) continue;
        if (n.blueprint && !(c.lab && c.lab.blueprints[n.blueprint])) continue; // S3: el remate pide su plano del LAB
        out.push({ kind: 'path', st, fk, opt: optId, node: n, step: i, cost: S2().pathCost[n.cap ? 2 : Math.min(1, i)] * (S2().costScaleAll ? styleScale(c) : 1) * s3Scale(c) });
      }
    }
    return out;
  }
  function buyPath(c, o) {
    if (c.s.coins < o.cost) return false;
    c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.path += o.cost; c.owned[o.node.id] = true;
    if (!c.active[o.fk]) c.active[o.fk] = o.opt;
    log(c, 'path:' + o.node.id, o.cost);
    ev(c, 'path_' + o.node.id); ev(c, 'firstPathNode'); if (o.node.cap) ev(c, 'firstCapstone');
    return true;
  }
  // Cambiar de camino: gratis en monedas, reajuste de la estación (S2().refitMs a S2().refitSpeed).
  function switchPath(c, fk, opt) {
    if (c.active[fk] === opt) return false;
    c.active[fk] = opt; const st = fk.split('.')[0];
    c.refitUntil[st] = c.s.t + S2().refitMs;
    log(c, 'switch:' + fk + ':' + opt, 0);
    return true;
  }
  // El primer paso de cada opción de una horquilla (para elegir camino).
  function pathAlternatives(c, fk) {
    const [st, fid] = fk.split('.'), fork = (S2().paths[st] || []).find((f) => f.id === fid), out = [];
    for (const [optId, nodes] of Object.entries(fork.opts)) { const n = nodes[0]; if (!c.owned[n.id]) out.push({ kind: 'path', st, fk, opt: optId, node: n, step: 0, cost: S2().pathCost[0] }); }
    return out;
  }
  // Experimento S2 (styleGate 'real'): el estilo de un estrato se cocina tras pagarlo; precio = abrir su roca en el juego
  // actual (REAL zones[].unlockCost). Sustituto provisional de la investigación del LAB (S3).
  function styleOptions(c) {
    const s = c.s;
    if (s.styleOwned == null) return [];
    const i = stratumIdx(s.depth), n = s.styleOwned + 1;
    if (n > i) return [];
    return [{ kind: 'style', n, cost: R().zones[n].unlockCost }];
  }
  function buyStyle(c, o) {
    if (c.s.coins < o.cost) return false;
    c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.style = (c.spent.style || 0) + o.cost; c.s.styleOwned = o.n;
    log(c, 'style:' + P().strata[o.n].id, o.cost); ev(c, 'style_' + P().strata[o.n].id);
    return true;
  }
  function milestoneOptions(c) {
    if (!c.features.C) return [];
    const out = [];
    for (const [id, m] of Object.entries(S2().milestones)) if (!c.ms[id] && gate(c, 'ms.' + id, () => c.stLv.cheese >= m.level)) out.push({ kind: 'milestone', id, cost: m.cost * s3Scale(c) });
    return out;
  }
  function buyMilestone(c, o) {
    if (c.s.coins < o.cost) return false;
    c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.milestone += o.cost; c.ms[o.id] = true;
    if (o.id === 'master') { const pr = c.s.placed.find((p) => p.st === 'cheese' && p.fn === 'pr'); c.masterId = pr ? pr.m.id : null; }
    log(c, 'milestone:' + o.id, o.cost); ev(c, 'ms_' + o.id);
    return true;
  }
  // Todas las compras posibles ahora, en el orden de siempre (los ascensos, solo con el bloque A).
  function options(c, prefer) {
    const opts = [];
    if (c.features.A) for (const o of promoteOptions(c)) opts.push(Object.assign({ kind: 'promote' }, o));
    opts.push(...fundOptions(c), ...phaseOptions(c), ...pathOptions(c, prefer), ...milestoneOptions(c), ...styleOptions(c));
    for (const m of extras) opts.push(...m.options(c));
    return opts;
  }
  // Compra de cualquier opción con coste (o = una de options()); how = cómo elige recluta el perfil.
  function buy(c, o, how) {
    if (o.extra) return o.extra.buy(c, o);
    return o.kind === 'promote' ? promote(c, o, 'player') : o.kind === 'fund' ? buyFund(c, o, 'player') : o.kind === 'phase' ? buyPhase(c, o) : o.kind === 'path' ? buyPath(c, o) : o.kind === 'milestone' ? buyMilestone(c, o) : o.kind === 'style' ? buyStyle(c, o) : o.kind === 'hire' ? hire(c, o.post, how) : false;
  }

  // ---------- Managers: solo fundamentales de su estación, con el 10 % de las monedas (REAL) ----------
  function managers(c) {
    if (!c.features.B || !S2().managers) return;
    const Mx = Me() || { INS: () => false }; // el juego no carga las métricas de los bots
    for (const p of c.s.placed) {
      if (p.fn !== 'pr' || (p.m.rank || 0) < 3) continue;
      ev(c, 'firstManager');
      // S2.5 · mgr.scope 'capped': solo rangos con tope (rutina); las mejoras repetibles las decide el jugador.
      // mgr.scope 'authorised': solo los fundamentales que el perfil autoriza (profile.authorise[st] = [ids]).
      const MG = S2().mgr || {}, auth = c.profile && c.profile.authorise && c.profile.authorise[p.st];
      const opts = fundOptions(c).filter((o) => o.st === p.st && (MG.scope !== 'capped' || fundMax(o.st, o.f, c) !== Infinity) && (MG.scope !== 'authorised' || !auth || auth.includes(o.f.id))).sort((a, b) => a.cost - b.cost);
      const o = opts[0];
      if (o && o.cost <= c.s.coins * R().mice.managerBudget) { const b = Mx.INS() ? Mx.coinsNow(c) : 0; if (buyFund(c, o, 'manager') && Mx.INS()) Mx.gainOf(c, b); }
    }
  }

  // ---------- Refuerzos: cuándo se ganan (dónde se ponen lo decide el perfil) ----------
  function awardBoosts(c) {
    if (!c.features.D) return;
    if (c.gated) { const n = E2.progression.countOpen(c, 'boost.'); if (n > c.boosts.earned) { for (let i = c.boosts.earned + 1; i <= n; i++) ev(c, 'boost' + i); c.boosts.earned = n; } return; }
    const B2 = S2().boosts, s = c.s;
    const conds = { auto: () => c.events.chainAutomated != null, d20: () => s.depth >= 20, d45: () => s.depth >= 45, d75: () => s.depth >= 75, d110: () => s.depth >= 110, d150: () => s.depth >= 150, g1: () => s.m.coins >= B2.goals[0], g2: () => s.m.coins >= B2.goals[1] };
    for (const k of B2.order) {
      if (c.boosts.earned >= c.boosts.total) break;
      if (c.boosts.awards.includes(k) || !conds[k]()) continue;
      c.boosts.awards.push(k); c.boosts.earned += 1; ev(c, 'boost' + c.boosts.earned);
    }
  }
  const slotCost = (st) => (st === 'refine' && S2().refineBoost && S2().refineBoost.slots) || 1; // S2.5: coste de oportunidad de REFINE
  const placedBoosts = (c) => ST.reduce((a, st) => a + c.boosts.place[st] * slotCost(st), 0);

  // Lo que pasa después de avanzar el motor, igual en el simulador y en el juego: XP, rasgos y refuerzos.
  function settle(c) {
    const x = creditXp(c);
    if (x.traitsChanged) Mo().place(c.s, c.s.placed);
    if (x.changed || x.traitsChanged) applyMods(c);
    awardBoosts(c);
  }
  // ---------- Construir (REAL: requisitos de los edificios de la cadena) ----------
  function build(c) {
    const s = c.s, T = s.m;
    const want = { drill: s.m.veinCaps > 0, refine: T.raw >= R().buildings.refinery.requires.min, cheese: T.base >= R().buildings.cheesery.requires.min, sell: s.built.cheese && T.lotsMade >= 1 };
    let any = false;
    for (const st of ['drill', 'refine', 'cheese', 'sell']) if (!s.built[st] && want[st]) { s.built[st] = true; ev(c, 'built_' + st); any = true; }
    return any;
  }

  // ---- Qué aporta cada puesto, con las cuentas de la partida. Nada de esto la modifica ----
  // Capacidad de una estación: lo que saca por unidad de tiempo si no le falta material. En la tienda, la cantidad son monedas por venta y cuenta a medias.
  const stationOut = (st, r) => (!r.auto ? 0 : r.ritmo * (st === 'sell' ? 1 + (r.rend - 1) * P().sell.yieldWeight : r.rend));
  const pctOf = (a, b) => (b > 0 ? a / b - 1 : null);
  function postOf(c, st, role) { const post = (P().posts[st][c.s.stage[st] - 1] || []).find(([r]) => r === role); return post ? { st, role, fn: post[1] } : null; }
  // La cuadrilla si este ratón pasa a ese puesto, igual que move y assign: si estaba colocado y el puesto está ocupado, se intercambian.
  function crewWith(c, id, st, role) {
    const s = c.s, post = postOf(c, st, role), m = c.roster.find((x) => x.id === id); if (!post || !m) return null;
    const from = s.placed.find((p) => p.m.id === id), other = s.placed.find((p) => p.st === st && p.role === role);
    const next = s.placed.filter((p) => p !== from && p !== other).concat([{ m, st, fn: post.fn, role }]);
    if (from && other && other !== from) next.push({ m: other.m, st: from.st, fn: from.fn, role: from.role });
    return { next, from, other };
  }
  // Un puesto y quien está en él (o el ratón que se quiera mirar en él).
  function postInfo(c, st, role, id) {
    const s = c.s, post = postOf(c, st, role); if (!post) return null;
    const here = s.placed.find((p) => p.st === st && p.role === role), mid = id || (here && here.m.id), m = c.roster.find((x) => x.id === mid);
    const w = (s.mods.w && s.mods.w[st]) || {}, cr = P().crew, base = post.fn === 'rend' ? (w.rend != null ? w.rend : cr.rend) : post.fn === 'ritmo' ? (w.ritmo != null ? w.ritmo : cr.ritmo) : 1;
    const out = { st, role, fn: post.fn, base, rates: { ritmo: s.rates[st].ritmo, rend: s.rates[st].rend, auto: s.rates[st].auto }, hasBoss: s.placed.some((p) => p.st === st && p.fn === 'pr'), mouse: null };
    if (!m) return out;
    const sim = here && here.m.id === m.id ? s.placed : crewWith(c, m.id, st, role).next, team = sim === s.placed ? s.team : C().team(sim, s.away);
    out.mouse = C().contribution(m, st, post.fn, Mo().rateCtx(s, sim.length), team);
    // Sin él: la capacidad de esta estación si se queda vacío su puesto.
    if (here && here.m.id === m.id) { const r1 = stationOut(st, s.rates[st]), r0 = stationOut(st, Mo().ratesWith(s, s.placed.filter((p) => p !== here))[st]); out.without = post.fn === 'pr' ? null : pctOf(r0, r1); out.gain = post.fn === 'pr' ? null : pctOf(r1, r0); }
    return out;
  }
  // Qué se gana o se pierde poniendo a este ratón aquí: la capacidad de esta estación y, si deja otro puesto, la de aquella.
  function postCompare(c, id, st, role) {
    const s = c.s, w = crewWith(c, id, st, role); if (!w) return null;
    const after = Mo().ratesWith(s, w.next), here = { from: stationOut(st, s.rates[st]), to: stationOut(st, after[st]) };
    const res = { pct: pctOf(here.to, here.from), starts: here.from === 0 && here.to > 0, there: null };
    if (w.from && w.from.st !== st) res.there = { st: w.from.st, pct: pctOf(stationOut(w.from.st, after[w.from.st]), stationOut(w.from.st, s.rates[w.from.st])), stops: !after[w.from.st].auto && s.rates[w.from.st].auto };
    return res;
  }

  return {
    postInfo, postCompare, stationOut,
    ST, SKILL, gate, note, settle, addExtra, realNow, s3Scale, create, rngOf, clone, ev, log, stratumIdx, activeNodes, applyMods, stXpFor, stLevelOf, creditXp, grow,
    recruitCost, candidates, fitValue, emptyPosts, hire, promoteOptions, promote,
    fundRule, fundEff, fundMax, fundCost, fundOptions, buyFund, phaseOptions, buyPhase, pathOptions, buyPath, switchPath, pathAlternatives,
    styleOptions, buyStyle, milestoneOptions, buyMilestone, options, buy, managers, awardBoosts, slotCost, placedBoosts, build,
  };
})();
