// ECONOMY 2.0 · S3-B · Cheese Lab completo (solo con PARAMS.product = 'lab'; sin eso, nada de este archivo actúa).
// REAL (cheesery.js, balance.js): 216 recetas, tiempo labBaseMs x 1,03^conocidas, coste de BASE, fallo 15 %, hallazgo 5 %, puesto
// de Research, direcciones, encargo a mano con reserva de BASE, cepas, Cheesemaker que elige por potencial, puertas de nivel.
// F0.2 (arquitectura aprobada, cifras HIP): fases del edificio con Research Queue, Blueprint Desk y Strain Library; remates de
// camino con plano del LAB; materiales de estrato.
// HIP de S3 (s3.lab): estudio de estilo, materiales en recetas, variantes de crecimiento y cepas en todos los estilos.
// El bucle lo mueve un ticker de 20 s con reparto exacto del tiempo sobrante: un trabajo corto no pierde lo que sobra del tramo.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.lab = (function () {
  const R = () => E2.REAL, P = () => E2.PARAMS, S3 = () => E2.PARAMS.s3 || {}, LP = () => (E2.PARAMS.s3 && E2.PARAMS.s3.lab) || {};
  const Mo = () => E2.model, C = () => E2.crew, Ru = () => E2.rules, Inv = () => E2.inventory;
  const on = () => P().product === 'lab';
  const DEFAULT = 'cheddar+herbs+washed+fresh';
  const memoF = {};
  const api = {};

  // ---------- Proveedor de producto: la receta que eligen el jugador o el Cheesemaker ----------
  E2.products.register('lab', {
    recipeKey(style) { return style + '+herbs+washed+fresh'; },
    formula(key) {
      let f = memoF[key];
      if (f) return f;
      const [base, ingredient, treatment, maturation] = key.split('+'), B = R(), combo = { base, ingredient, treatment, maturation };
      const bv = Mo().styleValue(base);
      let v = bv * B.ingredients[ingredient].mult * B.treatments[treatment].mult * B.maturations[maturation].mult;
      for (const syn of B.synergies) if (Object.keys(syn.when).every((p) => combo[p] === syn.when[p])) v *= syn.mult;
      f = { value: Math.round(v), timeMs: B.cheesery.baseTimeMs + B.treatments[treatment].timeMs + B.maturations[maturation].timeMs, coin: B.ingredients[ingredient].coinCost, combo };
      memoF[key] = f;
      return f;
    },
    currentKey(s) { return s.recipe || DEFAULT; },
    mods(s, key) {
      const a = s.strains; if (!a) return null;
      const id = a.of[key] || a.style[key.slice(0, key.indexOf('+'))];
      return id ? R().strains[id] : null;
    },
  });
  const formula = (k) => Mo().formula(k);
  const styleIds = () => P().strata.map((x) => x.id);
  const parts = () => ({ ingredient: Object.keys(R().ingredients), treatment: Object.keys(R().treatments), maturation: Object.keys(R().maturations) });
  const combosOf = (style) => { const p = parts(), out = []; for (const i of p.ingredient) for (const t of p.treatment) for (const m of p.maturation) out.push(style + '+' + i + '+' + t + '+' + m); return out; };
  // Tipo de cada componente, para las puertas de nivel y los materiales (0 = básico … 3 = el mejor de su familia).
  const tierOfPart = (table, id) => Object.keys(table).indexOf(id);
  const tierOf = (key) => { const [, i, t, m] = key.split('+'), B = R(); return tierOfPart(B.ingredients, i) + tierOfPart(B.treatments, t) + tierOfPart(B.maturations, m); };

  // ---------- Estado ----------
  function ensure(c) {
    if (!on()) return null;
    if (c.lab) return c.lab;
    c.lab = {
      built: false, nodes: {}, phase: 1, job: null, bpJob: null, queue: [], dir: 'value', known: [DEFAULT], isKnown: { [DEFAULT]: true }, styles: { cheddar: true }, strainsOf: {}, blueprints: {}, workers: [],
      found: [], busyMs: 0, idleMs: { noWorker: 0, noBase: 0, noTarget: 0, noCoin: 0 }, baseSpent: 0, coinSpent: 0, matSpent: {}, setbacks: 0, breakthroughs: 0, done: { recipes: 0, strains: 0, studies: 0, blueprints: 0 }, allAt: null, styleAt: {},
    };
    const s = c.s;
    s.recipe = DEFAULT; s.recipesKnown = 1; s.strains = { of: {}, style: {} }; s.mat = s.mat || {}; s.matMade = s.matMade || {}; s.labWant = 0;
    return c.lab;
  }
  const trait = (m, key) => (m ? C().fx(m, 'research')[key] || 0 : 0);
  const worker = (c) => { const L = c.lab; return L.workers.length ? c.roster.find((m) => m.id === L.workers[0]) : null; };
  const workSpeed = (m, c) => { const o = C().own(m, 'research', { depth: 0, away: c.s.away, mice: c.roster.length, recipes: c.s.recipesKnown, stationLevel: 1 }); return C().work(m, 'research') * (1 + o.vel); };
  const labSpeedMod = (c) => 1 + (c.lab.nodes.burners || 0) * 0.08;
  // REAL: tiempo y coste crecen con todas las recetas conocidas. Variante 'style' (HIP): cada estilo crece aparte, con un escalón por estrato.
  function growthN(c, style) {
    if (LP().growth !== 'style') return c.lab.known.length;
    return c.lab.known.filter((k) => k.startsWith(style + '+')).length;
  }
  const styleStep = (style) => (LP().growth === 'style' ? Math.pow(LP().styleStep || 2, styleIds().indexOf(style)) : 1);
  const labTime = (c, style) => Math.round((R().cheesery.labBaseMs * (LP().timeScale || 1) * Math.pow(R().cheesery.labGrowth, growthN(c, style)) * styleStep(style)) / labSpeedMod(c));
  function labCost(c) {
    const w = worker(c), cut = w ? trait(w, 'labCost') : 0, B = R().cheesery;
    return Math.max(1, Math.round((B.experimentBase + B.labCostGrowth * c.lab.known.length) * Math.max(0.2, 1 + cut - (c.lab.nodes.samples || 0) * 0.05)));
  }
  const odds = (c) => { const w = worker(c), B = R().cheesery; return { fail: Math.max(0, Math.min(0.9, B.labFail + trait(w, 'labFail'))), luck: Math.max(0, Math.min(0.9, B.labBreakthrough + trait(w, 'labLuck'))), bonus: Math.max(0, Math.min(0.9, trait(w, 'labBonus'))) }; };
  // Puertas REAL: nivel de Cheesemaking por componente; el queso, si su estilo está abierto.
  function partsOpen(c, key) {
    const [, i, t, m] = key.split('+'), B = R(), lv = c.stLv.cheese;
    return lv >= B.ingredients[i].level && lv >= B.treatments[t].level && lv >= B.maturations[m].level;
  }
  function styleOpen(c, style) { return !!c.lab.styles[style]; }
  // HIP s3.lab.recipeMat: las recetas de mejores componentes piden materiales de su estrato (n por grado de componente).
  const recipeMat = (key) => { const q = LP().recipeMat; if (!q) return null; const st = key.slice(0, key.indexOf('+')), n = q * tierOf(key); return n > 0 && st !== 'cheddar' ? { [st]: n } : null; };
  // Los materiales los guarda y los cobra el inventario (inventory.js): todo o nada, con su motivo.
  const hasMat = (c, need, disc) => Inv().can(c.s, need, disc);
  const payMat = (c, need, disc, why) => { if (!need) return; Inv().pay(c.s, need, why || 'lab', disc); for (const k of Object.keys(need)) c.lab.matSpent[k] = (c.lab.matSpent[k] || 0) + need[k] * (disc || 1); };

  // ---------- Direcciones (REAL labPick) ----------
  function fits(dir, key) {
    const [kind, id] = String(dir || '').split(':');
    if (kind === 'value' || kind === 'fast') return true;
    const [base, ingredient, treatment, maturation] = key.split('+'), combo = { base, ingredient, treatment, maturation };
    return combo[kind] === id;
  }
  function pick(c, dir) {
    let best = null, bv = -Infinity;
    for (const st of styleIds()) {
      if (!styleOpen(c, st)) continue;
      for (const k of combosOf(st)) {
        if (c.lab.isKnown[k] || !partsOpen(c, k) || !fits(dir, k) || !hasMat(c, recipeMat(k))) continue;
        const f = formula(k), v = dir === 'fast' ? -f.timeMs * 1e6 + f.value * Mo().styleValue(st) : f.value;
        if (v > bv) { bv = v; best = k; }
      }
    }
    return best;
  }
  // REAL: Strain Target. Las cepas se buscan para la receta que se cocina (o la siguiente más valiosa de un estilo con cepas).
  const strainStyles = () => (LP().strainBases === 'all' ? styleIds() : R().cheesery.strainBases);
  function strainTarget(c) {
    if (!c.lab.nodes.strains) return null;
    const all = Object.keys(R().strains), open = (k) => k && strainStyles().includes(k.slice(0, k.indexOf('+'))) && strainsFor(c, k).length < all.length;
    if (open(c.s.recipe) && c.lab.isKnown[c.s.recipe]) return c.s.recipe;
    const rest = c.lab.known.filter(open).sort((a, b) => potential(c, b) - potential(c, a));
    return rest[0] || null;
  }

  // ---------- Empezar un trabajo ----------
  // Una tarea: { kind: 'recipe', key } · { kind: 'strain', key } · { kind: 'study', style } · { kind: 'blueprint', id }
  function afford(c, t) {
    if (t.kind === 'recipe') return c.s.coins >= formula(t.key).coin && hasMat(c, recipeMat(t.key));
    if (t.kind === 'study') return hasMat(c, studyNeed(t.style)) && c.s.coins >= studyCoin(c, t.style);
    if (t.kind === 'blueprint') return hasMat(c, bpNeed(t.id), bpDisc(c)) && c.s.coins >= bpCoin(c, t.id);
    return true;
  }
  const studyNeed = (style) => { const q = LP().study; return q && q.materials ? { [style]: q.materials } : null; };
  const studyCoin = (c, style) => { const q = LP().study; if (!q || !q.coin) return 0; const z = R().zones.find((x) => x.id === style); return q.coin === 'real' && z ? z.unlockCost : q.coin === 'scale' ? Math.round(Mo().styleValue(style) * (q.coinK || 1000)) : 0; };
  const bpDef = (id) => (LP().blueprints || {})[id];
  const bpNeed = (id) => (bpDef(id) ? bpDef(id).materials : null);
  const bpCoin = (c, id) => (bpDef(id) ? bpDef(id).coin || 0 : 0);
  const bpDisc = (c) => (c.s.mods.drill.bpDiscount != null ? c.s.mods.drill.bpDiscount : 1);
  function timeOf(c, t) {
    const B = R().cheesery;
    if (t.kind === 'recipe') return labTime(c, t.key.slice(0, t.key.indexOf('+')));
    if (t.kind === 'strain') return labTime(c, t.key.slice(0, t.key.indexOf('+'))) * B.strainTime;
    if (t.kind === 'study') return labTime(c, t.style) * ((LP().study && LP().study.timeMult) || 3);
    return labTime(c, 'cheddar') * ((bpDef(t.id) && bpDef(t.id).timeMult) || 4);
  }
  function begin(c, t, source, slot) {
    const L = c.lab, s = c.s, baseNeed = labCost(c), usesBase = t.kind === 'recipe' || t.kind === 'strain';
    if (usesBase && s.inv.base < baseNeed) { s.labWant = baseNeed; return false; }
    if (!afford(c, t)) return false;
    if (usesBase) { s.inv.base -= baseNeed; s.m.baseUsed += baseNeed; L.baseSpent += baseNeed; s.labWant = 0; }
    if (t.kind === 'recipe') { const coin = formula(t.key).coin; s.coins -= coin; s.m.coinsCharged += coin; L.coinSpent += coin; payMat(c, recipeMat(t.key), 1, 'recipe'); }
    if (t.kind === 'study') { const coin = studyCoin(c, t.style); s.coins -= coin; s.coinsStart -= coin; c.spent.lab = (c.spent.lab || 0) + coin; payMat(c, studyNeed(t.style), 1, 'study'); }
    if (t.kind === 'blueprint') { const coin = bpCoin(c, t.id); s.coins -= coin; s.coinsStart -= coin; c.spent.lab = (c.spent.lab || 0) + coin; payMat(c, bpNeed(t.id), bpDisc(c), 'blueprint'); }
    const w = worker(c), total = Math.max(1000, Math.round(timeOf(c, t) / (w ? workSpeed(w, c) : 1)));
    const j = Object.assign({ remaining: total, total, source: w ? 'worker' : 'manual', retried: false, rewardS: Math.max(1, Math.round(timeOf(c, t) / 1000)) }, t);
    if (t.kind === 'strain') { const all = Object.keys(R().strains), have = strainsFor(c, t.key), miss = all.filter((id) => !have.includes(id)); j.strain = miss[Math.floor(c.rng() * miss.length)]; }
    if (slot === 'bp') L.bpJob = j; else L.job = j;
    return true;
  }
  // Siguiente trabajo del puesto principal: lo que el jugador haya pedido y, si hay ratón, lo que marque la dirección.
  function next(c) {
    const L = c.lab;
    while (L.queue.length) {
      const t = L.queue[0];
      if (!stillValid(c, t)) { L.queue.shift(); continue; }
      if (!begin(c, t, 'queue')) return 'noBase';
      L.queue.shift();
      return 'ok';
    }
    if (!worker(c)) return 'noWorker';
    if (L.dir === 'strain') { const k = strainTarget(c); if (k) return begin(c, { kind: 'strain', key: k }) ? 'ok' : 'noBase'; }
    if (L.dir && L.dir !== 'strain') { const k = pick(c, L.dir); if (k) { if (!afford(c, { kind: 'recipe', key: k })) return 'noCoin'; return begin(c, { kind: 'recipe', key: k }) ? 'ok' : 'noBase'; } }
    return 'noTarget';
  }
  function stillValid(c, t) {
    const L = c.lab;
    if (t.kind === 'recipe') return !L.isKnown[t.key] && styleOpen(c, t.key.slice(0, t.key.indexOf('+')));
    if (t.kind === 'study') return !L.styles[t.style];
    if (t.kind === 'blueprint') return !L.blueprints[t.id];
    return strainsFor(c, t.key).length < Object.keys(R().strains).length;
  }
  // ---------- Terminar un trabajo ----------
  function reward(c, j, xpMult) {
    const w = j.source === 'worker' ? worker(c) : null;
    if (!w) return 1;
    const M = R().mice, f = C().fx(w, 'research'), n = j.rewardS * M.xpPerAction, before = C().level(w);
    const xm = Math.max(0.1, 1 + (f.mouseXp || 0));
    w.xp += n * xm;
    const aff = M.affinity[(w.aff && w.aff.research) || 0], j0 = w.jobs.research || 0;
    w.jobs.research = j0 + n * aff.learn * Math.max(0.1, 1 + (f.jobXp || 0));
    Ru().grow(c, w, 'research', j0);
    return xm;
  }
  function discover(c, key, made, by) {
    const L = c.lab, s = c.s;
    if (L.isKnown[key]) return;
    L.isKnown[key] = true; L.known.push(key); s.recipesKnown = L.known.length; L.done.recipes += 1;
    s.lots[key] = (s.lots[key] || 0) + 1; s.m.lotsMade += 1; // REAL: la receta nace con su primer queso
    s.made[key] = (s.made[key] || 0) + (made || 1);
    if (made > 1) s.mastery[key] = made * P().masteryScale;
    const f = formula(key);
    L.found.push({ key, t: s.t, real: c.clock ? Ru().realNow(c) : s.t, off: !!(c.calMode === 'off' || s.muted), v: f.value });
    Ru().ev(c, 'recipes' + L.known.length);
    Ru().ev(c, 'recipe_' + key.slice(0, key.indexOf('+')));
    autoRecipe(c);
    Ru().applyMods(c);
  }
  function finish(c, j, slot) {
    const L = c.lab, O = odds(c), rnd = c.rng, B = R().cheesery;
    if (!j.retried && rnd() < O.fail) { j.retried = true; j.remaining = Math.round(j.total / 2); L.setbacks += 1; return false; } // REAL: una vez por trabajo se repite la mitad
    if (slot === 'bp') L.bpJob = null; else L.job = null;
    if (j.kind === 'strain') {
      const list = (L.strainsOf[j.key] = L.strainsOf[j.key] || []), lucky = rnd() < O.luck;
      if (!list.includes(j.strain)) list.push(j.strain);
      const known = strainsFor(c, j.key), more = lucky ? Object.keys(R().strains).filter((id) => !known.includes(id)) : [];
      if (more.length) list.push(more[0]);
      L.done.strains += 1 + (more.length ? 1 : 0);
      reward(c, j);
      Ru().log(c, 'found:strain:' + j.key + ':' + j.strain, 0, 'lab'); Ru().ev(c, 'firstStrain');
      return true;
    }
    if (j.kind === 'study') {
      L.styles[j.style] = true; L.done.studies += 1; L.styleAt[j.style] = c.clock ? Ru().realNow(c) : c.s.t;
      reward(c, j);
      Ru().log(c, 'found:style:' + j.style, 0, 'lab'); Ru().ev(c, 'style_' + j.style);
      return true;
    }
    if (j.kind === 'blueprint') {
      L.blueprints[j.id] = true; L.done.blueprints += 1;
      reward(c, j);
      Ru().log(c, 'found:blueprint:' + j.id, 0, 'lab'); Ru().ev(c, 'bp_' + j.id);
      return true;
    }
    const lucky = rnd() < O.luck;
    const xm = reward(c, j);
    c.stXp.cheese += R().xp.perCheese * Math.pow(formula(j.key).value / 10, R().xp.recipePower) * xm; // REAL: experiencia de Cheesemaking al descubrir
    if (lucky) L.breakthroughs += 1;
    discover(c, j.key, lucky ? B.labBreakthroughMade : 1);
    if (j.source === 'worker' && rnd() < O.bonus) { // REAL (Tinkerer): a veces sale otra del mismo queso
      const st = j.key.slice(0, j.key.indexOf('+')), extra = combosOf(st).filter((k) => !L.isKnown[k] && partsOpen(c, k)).sort((a, b) => formula(b).value - formula(a).value)[0];
      if (extra) discover(c, extra, 1);
    }
    return true;
  }
  // ---------- Reparto del tiempo ----------
  function runSlot(c, dt, slot, nextFn) {
    const L = c.lab;
    let left = dt;
    for (let g = 0; g < 500 && left > 0; g++) {
      let j = slot === 'bp' ? L.bpJob : L.job;
      if (!j) {
        const r = nextFn(c);
        j = slot === 'bp' ? L.bpJob : L.job;
        if (!j) { const k = { noBase: 'noBase', noWorker: 'noWorker', noTarget: 'noTarget', noCoin: 'noCoin', none: null }[r] || 'noTarget'; if (k && slot !== 'bp') L.idleMs[k] += left; return; }
      }
      const use = Math.min(left, j.remaining);
      j.remaining -= use; left -= use; L.busyMs += use;
      if (j.remaining <= 0) finish(c, j, slot);
    }
  }
  function nextBp(c) {
    const L = c.lab, q = L.bpQueue || [];
    while (q.length) { const t = q[0]; if (!stillValid(c, t)) { q.shift(); continue; } if (!begin(c, t, 'queue', 'bp')) return 'none'; q.shift(); return 'ok'; }
    return 'none';
  }
  function tick(c, dt) {
    if (!on()) return;
    const L = ensure(c), s = c.s;
    // V0 (regla REAL): el estilo se abre al llegar a su estrato. Con estudio (HIP) lo abre el jugador con una investigación.
    if (!LP().study) for (const st of P().strata) if (s.depth >= st.from && !L.styles[st.id]) { L.styles[st.id] = true; L.styleAt[st.id] = c.clock ? Ru().realNow(c) : s.t; }
    if (s.built.cheese || L.job) runSlot(c, dt, 'main', next);
    if (L.nodes.desk) runSlot(c, dt, 'bp', nextBp);
    if (L.known.length >= totalRecipes() && L.allAt == null) { L.allAt = c.clock ? Ru().realNow(c) : s.t; Ru().ev(c, 'allRecipes'); }
    autoRecipe(c);
    if (api.afterTick) api.afterTick(c); // el simulador engancha aquí las decisiones de sus bots (econ2/labbot.js)
  }
  const totalRecipes = () => P().strata.length * 36;

  // ---------- Cheesemaker (REAL potential): sin receta fijada, cocina la de más potencial, a igual maestría y sin cepa ----------
  function potential(c, key) {
    const s = c.s, f = formula(key), st = P().strata.find((x) => x.id === f.combo.base), sm = s.mods.sell, cm = s.mods.cheese;
    const rich = 1 + P().richPerLevel * (s.mods.mine.richMult || 1) * Math.min(P().richMaxLevels || Infinity, Math.max(0, Math.min(s.depth, st.to) - st.from));
    const buyer = R().shop.buyers.reduce((b, x) => (sm.buyerLevel >= x.level ? x : b), R().shop.buyers[0]).mult;
    return f.value * rich * buyer * cm.value * sm.price * (s.mods.valueSum || 1) - f.coin;
  }
  function autoRecipe(c) {
    const L = c.lab, s = c.s;
    if (L.pin) { s.recipe = L.pin; return; }
    let best = s.recipe, bv = -Infinity;
    for (const k of L.known) { if (s.coins < formula(k).coin) continue; const v = potential(c, k); if (v > bv + 1e-9) { bv = v; best = k; } } // REAL: solo entre las que puede pagar; la de partida es gratis, así que nunca se atasca
    if (best !== s.recipe) { s.recipe = best; L.switches = (L.switches || 0) + 1; }
  }
  // ---------- Cepas: el jugador elige; al cambiar, los quesos hechos se convierten sin ganar ni perder valor (REAL settle) ----------
  const strainValue = (id) => (id && R().strains[id].value) || 1;
  function setStrain(c, key, id) {
    const s = c.s, style = key.slice(0, key.indexOf('+')), byStyle = !!c.lab.nodes.library;
    const cur = s.strains.of[key] || s.strains.style[style] || '';
    if ((id || '') === cur) return false;
    const list = byStyle ? Object.keys(s.lots).filter((k) => k.startsWith(style + '+')) : [key];
    for (const k of list) {
      const from = s.strains.of[k] || s.strains.style[style] || '', ratio = strainValue(from) / strainValue(id);
      const have = s.lots[k] || 0;
      if (have) { const exact = have * ratio, n = Math.floor(exact + 1e-9), d = n - have; s.lots[k] = n; s.m.lotsMade += d; const left = Math.round((exact - n) * Mo().price(s, k)); if (left > 0) { s.coins += left; s.m.coins += left; } }
      const j = s.job.cheese;
      if (j && j.key === k) { const n2 = Math.max(0, Math.floor(j.per * ratio + 1e-9)); j.per = n2; }
    }
    if (byStyle) { s.strains.style[style] = id || ''; for (const k of Object.keys(s.strains.of)) if (k.startsWith(style + '+')) delete s.strains.of[k]; } else s.strains.of[key] = id || '';
    return true;
  }
  const strainsFor = (c, key) => { const L = c.lab, st = key.slice(0, key.indexOf('+')); if (!L.nodes.library) return L.strainsOf[key] || []; const out = {}; for (const k of Object.keys(L.strainsOf)) if (k.startsWith(st + '+')) for (const id of L.strainsOf[k]) out[id] = true; return Object.keys(out); };

  // ---------- Compras del LAB (opciones con coste) ----------
  const nodeCost = (id, r) => { const n = R().trees.lab.find((x) => x.id === id); return Math.round(n.cost * Math.pow(n.growth, r)); };
  const phaseDef = (n) => (LP().phases || {})[n];
  const Lab = {
    options(c) {
      const L = ensure(c); if (!L) return [];
      const out = [], s = c.s, W = (kind, x) => out.push(Object.assign({ kind, extra: Lab }, x));
      if (!L.built) return out;
      const G = Ru().gate;
      if (!L.nodes.assistant) { if (G(c, 'lab.assistant', () => true)) W('labnode', { id: 'assistant', cost: nodeCost('assistant', 0) }); } else if (!L.workers.length) W('labhire', { cost: Ru().recruitCost(c) });
      if (L.nodes.assistant && !L.nodes.advanced && G(c, 'lab.advanced', () => true)) W('labnode', { id: 'advanced', cost: nodeCost('advanced', 0) });
      if (!L.nodes.strains && G(c, 'lab.strains', () => c.stLv.cheese >= 10)) W('labnode', { id: 'strains', cost: nodeCost('strains', 0) });
      const bu = L.nodes.burners || 0, sa = L.nodes.samples || 0;
      if (bu < 25 && G(c, 'lab.burners', () => L.known.length >= 3)) W('labrank', { id: 'burners', cost: nodeCost('burners', bu) });
      if (sa < 10 && G(c, 'lab.samples', () => L.known.length >= 3)) W('labrank', { id: 'samples', cost: nodeCost('samples', sa) });
      const ph = phaseDef(L.phase + 1);
      if (ph && G(c, 'lab.phase' + (L.phase + 1), () => L.known.length >= (ph.recipes || 0) && s.depth >= (ph.depth || 0))) W('labphase', { next: L.phase + 1, cost: ph.cost * Ru().s3Scale(c) });
      if (!L.nodes.queue && G(c, 'lab.queue', () => L.phase >= 2)) W('labnode', { id: 'queue', cost: (LP().nodeCost || {}).queue || 5000 });
      if (!L.nodes.desk && G(c, 'lab.desk', () => L.phase >= 3 && s.depth >= 45)) W('labnode', { id: 'desk', cost: ((LP().nodeCost || {}).desk || 500000) * Ru().s3Scale(c) });
      if (!L.nodes.library && G(c, 'lab.library', () => L.phase >= 4 && s.depth >= 75)) W('labnode', { id: 'library', cost: ((LP().nodeCost || {}).library || 5000000) * Ru().s3Scale(c) });
      return out;
    },
    buy(c, o) {
      const L = c.lab, s = c.s;
      if (s.coins < o.cost) return false;
      if (o.kind === 'labhire') return hireResearcher(c, o);
      s.coins -= o.cost; s.coinsStart -= o.cost; c.spent.lab = (c.spent.lab || 0) + o.cost;
      if (o.kind === 'labphase') { L.phase = o.next; Ru().log(c, 'lab:phase:' + o.next, o.cost); Ru().ev(c, 'labPhase' + o.next); return true; }
      if (o.kind === 'labrank') { L.nodes[o.id] = (L.nodes[o.id] || 0) + 1; Ru().log(c, 'fund:lab.' + o.id, o.cost); return true; }
      L.nodes[o.id] = 1; Ru().log(c, 'lab:' + o.id, o.cost); Ru().ev(c, 'lab_' + o.id);
      return true;
    },
  };
  function hireResearcher(c, o) {
    const s = c.s, L = c.lab, how = c.profile.pick, cand = Ru().candidates(c), ctx = (m) => C().work(m, 'research');
    const best = cand.slice().sort((a, b) => (how === 'fit' ? ctx(b) - ctx(a) : (b.rarity - a.rarity) || ((b.aff.research || 0) - (a.aff.research || 0))))[0];
    s.coins -= o.cost; s.coinsStart -= o.cost; c.spent.recruit += o.cost; c.recruited += 1;
    c.roster.push(best); L.workers.push(best.id);
    Ru().log(c, 'recruit:lab:pr', o.cost); Ru().ev(c, 'labWorker');
    return true;
  }
  Ru().addExtra(Lab);

  const queueCap = (c) => (c.lab.nodes.queue ? (LP().queue || 3) : 1);
  function enqueue(c, t, what) {
    const L = c.lab;
    if (L.queue.length >= queueCap(c)) return false;
    L.queue.push(t);
    Ru().log(c, what, 0);
    return true;
  }

  // ---------- Inventario y estado (content.js los junta con el resto) ----------
  function inventory() {
    if (!on()) return {};
    const nStyles = P().strata.filter((x) => !x.synthetic).length, nodes = R().trees.lab.length + 3, all = strainStyles().length;
    return { recetas: nStyles * 36, estudiosEstilo: LP().study ? nStyles - 1 : 0, cepasPosibles: all * 36 * Object.keys(R().strains).length, tiposDeCepa: Object.keys(R().strains).length, planos: Object.keys(LP().blueprints || {}).length, nudosLab: nodes, fasesLab: Object.keys(LP().phases || {}).length, direcciones: 2 + 6 + 4 + 3 + 3 };
  }
  function status(c) {
    const L = c.lab, cnt = (m) => Object.keys(m).length, styles = cnt(L.styles);
    return { recetas: L.known.length, estilos: styles, cepas: L.done.strains, planosHechos: L.done.blueprints, labFase: L.phase, labNudos: Object.keys(L.nodes).filter((k) => !['burners', 'samples'].includes(k)).length, burners: L.nodes.burners || 0, samples: L.nodes.samples || 0, labTrabajaMs: L.busyMs, labParadoMs: L.idleMs.noWorker + L.idleMs.noBase + L.idleMs.noTarget + L.idleMs.noCoin, labSinObjetivoMs: L.idleMs.noTarget, materiales: Object.values(c.s.mat || {}).reduce((a, b) => a + b, 0), materialesGastados: Object.values(L.matSpent).reduce((a, b) => a + b, 0) };
  }
  Object.assign(api, { ensure, tick, potential, labTime, labCost, inventory, status, pick, strainTarget, setStrain, totalRecipes, formula, combosOf, tierOf, Lab, worker, queueCap, enqueue, afford, bpDef, strainsFor, styleOpen, partsOpen, fits, studyNeed, bpNeed, bpDisc, stillValid });
  return api;
})();
