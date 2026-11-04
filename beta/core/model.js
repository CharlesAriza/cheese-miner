// ECONOMY 2.0 · S1 · Motor de la cadena (puro: sin dibujo, sin guardado, sin el juego).
// Motor POR EVENTOS: cada estación tiene su trabajo en curso con su hora de fin; el tiempo salta de un
// evento al siguiente y los eventos de la misma hora se procesan siempre en el mismo orden. Por eso el
// resultado no depende del paso con que se avance (online 100 ms u offline 1000 ms): se comprueba en
// las pruebas. Reglas reales replicadas (ver README): ciclo mínimo de 400 ms, cantidad decimal que se
// arrastra, reserva al empezar y entrega una sola vez al acabar, búsqueda y veta en serie, ayuda a
// mano en MINE, estanterías y mayorista en SELL.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.model = (function () {
  const C = () => E2.crew;
  const P = () => E2.PARAMS;
  const R = () => E2.REAL;
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell'];
  // BETA: avisos para quien use el motor (inventario y eventos de la interfaz). Sin nadie enganchado, no hacen nada.
  const hooks = { veinOpen: null, lotsDone: null, emit: null };
  const MIN_CYCLE = 400; // REAL (CM.cycle)
  const cycle = (ms) => (ms >= MIN_CYCLE ? { total: Math.round(ms), mult: 1 } : { total: MIN_CYCLE, mult: MIN_CYCLE / Math.max(1, ms) });
  const skillMult = () => 1 + R().xp.bonusPerLevel * (P().stationLevel - 1);

  // ---- Estratos y vetas (F0.1 §2, curva por tramos) ----
  function stratumOf(d) {
    const S = P().strata;
    for (const s of S) if (d >= s.from && d < s.to) return s;
    return S[S.length - 1];
  }
  // Valor del estilo de un estrato: tabla REAL; los estilos SINTÉTICOS de las pruebas de expansión están en PARAMS.synBases.
  const styleValue = (id) => (R().bases[id] ? R().bases[id].value : P().synBases[id]);
  function veinFor(d, st0) {
    const s = stratumOf(d), mm = st0 && st0.mods ? st0.mods.mine : null;
    const base = s.vein * (1 + s.perLevel * (d - s.from));
    const cap = Math.max(1, Math.round(base * (mm ? mm.veinMult : 1)));
    const hard = d === s.from && s.hard > 1 ? (mm && mm.hardMult != null ? mm.hardMult : s.hard) : 1;
    // La búsqueda se mide sobre la veta base: Wide Seams (+40 % veta, +25 % búsqueda) busca menos por RAW.
    const need = (mm && mm.veinMult !== 1 ? Math.round(base) : cap) * P().searchPerRaw * hard * (mm ? mm.searchMult : 1) * (s.search || 1); // S3: dureza de búsqueda del estrato (s.search)
    return { cap, need };
  }

  // ---- Recetas y precio (HIP: valor por profundidad dentro del estrato) ----
  // Qué se cocina y su fórmula los da el proveedor de producto (products.js; por defecto la receta fija de S1–S2.5).
  const PROD = () => E2.products.get();
  const productMods = (s, key) => (PROD().mods ? PROD().mods(s, key) : null); // { time, base, value } de la cepa activa (S3)
  function recipeKey(style) { return PROD().recipeKey(style); }
  function formula(key) { return PROD().formula(key); }
  function mastery(s, key) {
    const made = s.mastery && s.mastery[key] != null ? s.mastery[key] : s.made[key] || 0;
    let lv = 1;
    R().cheesery.masteryAt.forEach((need, i) => { if (made >= need * P().masteryScale) lv = i + 1; });
    return lv;
  }
  function price(s, key) {
    const f = formula(key), st = P().strata.find((x) => x.id === f.combo.base) || stratumOf(s.depth);
    const rich = 1 + P().richPerLevel * (MD(s).mine.richMult || 1) * Math.min(P().richMaxLevels || Infinity, Math.max(0, Math.min(s.depth, st.to) - st.from)); // S2: richMaxLevels topa el último estrato; S2.5: richMult (Wide Seams)
    const sm = MD(s).sell, cm = MD(s).cheese;
    const buyer = R().shop.buyers.reduce((b, x) => (sm.buyerLevel >= x.level ? x : b), R().shop.buyers[0]).mult; // S1: nivel 1 = Neighbors
    const fine = f.value >= R().tiers[1].min ? sm.fineBonus : 1; // Boutique: desde «Fine»
    const gm = cm.master ? 1 + cm.master : 1; // Grand Master (S2)
    const pm = productMods(s, key); // S3: cepa activa (REAL: valor de la cepa), si el proveedor la da
    return Math.max(1, Math.round(f.value * (1 + R().cheesery.masteryValue * (mastery(s, key) - 1)) * rich * buyer * skillMult() * cm.value * sm.price * fine * gm * (MD(s).valueSum || 1) * (pm && pm.value ? pm.value : 1)));
  }
  const lotsTotal = (s) => Object.keys(s.lots).reduce((a, k) => a + s.lots[k], 0);

  // ---- S2: modificadores por estación (árbol, niveles, refuerzos, caminos). Neutros por defecto. ----
  function defaultMods() {
    return {
      mine: { speed: 1, power: 1, veinMult: 1, searchMult: 1, hardMult: null, tapMult: 1, critEvery: null, blast: null, survey: null },
      drill: { speed: 1, yield: 1 }, refine: { speed: 1, yield: 1, base: 1 },
      cheese: { speed: 1, yield: 1, value: 1, time: 1, masteryRate: 1, newRecipeBoost: 0, wheel: false, master: null },
      sell: { speed: 1, count: 1, price: 1, fineBonus: 1, wholesale: null, buyerLevel: 1 },
      w: null, // pesos de cuadrilla por estación
    };
  }
  const MD = (s) => s.mods || (s.mods = defaultMods());
  // ---- Estado ----
  function create(opts) {
    const s = {
      t: 0, depth: 0, coins: 0,
      inv: { raw: 0, base: 0 }, lots: {}, made: {},
      vein: null, job: { drill: null, refine: null, cheese: null, sell: null },
      carry: { drill: 0, refine: 0, cheese: 0 },
      mine: { next: null, bank: 0, tapCount: 0, veinTaps: 0 }, combo: { n: 0, last: -1e9 },
      stage: Object.assign({ mine: 3, drill: 3, refine: 3, cheese: 3, sell: 3 }, opts.stage || {}),
      placed: [], away: !!opts.away, rates: null, team: null,
      m: newMetrics(), coinsStart: opts.coins || 0,
      mods: opts.mods || defaultMods(), built: Object.assign({ drill: true, refine: true, cheese: true, sell: true }, opts.built || {}),
      mastery: {}, wheelMs: 0,
    };
    s.coins = opts.coins || 0;
    place(s, opts.placed || []);
    newSearch(s);
    return s;
  }
  function newMetrics() {
    return {
      raw: 0, rawUsed: 0, base: 0, baseUsed: 0, lotsMade: 0, sold: 0, soldCoins: 0, whole: 0, wholeCoins: 0, coins: 0, coinsCharged: 0,
      busy: { mine: 0, drill: 0, refine: 0, cheese: 0, sell: 0 }, idleAuto: { drill: 0, refine: 0, cheese: 0, sell: 0 },
      searchMs: 0, openMs: 0, taps: { mine: 0, drill: 0, refine: 0, cheese: 0, sell: 0 }, veins: [], minutes: [],
      veinReserved: 0, veinCaps: 0,
      cyc: { mine: { auto: 0, manual: 0 }, drill: { auto: 0, manual: 0 }, refine: { auto: 0, manual: 0 }, cheese: { auto: 0, manual: 0, lots: 0, autoLots: 0 }, sell: { auto: 0, manual: 0 } },
      wheels: 0,
    };
  }
  // Coloca la cuadrilla: placed = [{ m, st, fn, role }]. Recalcula el equipo y los ritmos.
  function place(s, placed) {
    s.placed = placed.slice();
    s.team = C().team(s.placed, s.away);
    refreshRates(s);
    // Si cambia quién pica durante una búsqueda: sin principal se para; con él, sigue (o empieza).
    if (s.vein && !s.vein.open) s.mine.next = !s.rates.mine.auto ? null : s.mine.next != null ? s.mine.next : s.t + R().mining.minerIntervalMs / s.rates.mine.ritmo;
  }
  function setAway(s, away) { if (s.away !== !!away) { s.away = !!away; s.team = C().team(s.placed, s.away); refreshRates(s); } }
  function refreshRates(s) {
    const DT = P().depthTraits, sx = stratumOf(s.depth);
    const depthT = DT.mode === 'stratum' ? s.depth - sx.from : DT.mode === 'tier' ? P().strata.indexOf(sx) * DT.perTier : s.depth;
    const ctx = { depth: depthT, away: s.away, mice: s.placed.length, recipes: s.recipesKnown != null ? s.recipesKnown : P().recipesKnown || 0, stationLevel: P().stationLevel, w: MD(s).w }; // S3: s.recipesKnown (LAB)
    s.rates = {};
    for (const st of ST) { s.rates[st] = C().station(s.placed, st, ctx, s.team); s.rates[st].ritmo *= (P().invest[st] || 1) * MD(s)[st].speed; }
  }

  // ---- MINE ----
  function newSearch(s) {
    const v = veinFor(s.depth, s);
    s.vein = { open: false, need: v.need, found: 0, cap: v.cap, left: 0, t0: s.t, tOpen: null, depth: s.depth };
    s.mine.next = s.rates.mine.auto ? s.t + R().mining.minerIntervalMs / s.rates.mine.ritmo : null; // REAL: el acumulador vuelve a 0
    s.mine.veinTaps = 0; s.mine.veinBlasts = 0;
    if (s.mine.bank > 0) { const b = s.mine.bank; s.mine.bank = 0; addSearch(s, b); } // Survey Ahead: lo ya buscado
  }
  const surveyOf = (s) => (MD(s).mine.survey != null ? MD(s).mine.survey : P().mine.surveyAhead);
  const surveyInterval = (s) => R().mining.minerIntervalMs / (s.rates.mine.ritmo * surveyOf(s));
  function addSearch(s, power) {
    const v = s.vein;
    v.found += Math.min(v.need - v.found, power);
    if (v.found >= v.need - 1e-9) {
      v.found = v.need; v.open = true; v.left = v.cap; v.tOpen = s.t;
      s.m.veinCaps += v.cap;
      if (hooks.veinOpen) hooks.veinOpen(s, v); // materiales al abrir veta: los reparte inventory.js
      if (hooks.emit) hooks.emit(s, 'reveal', { depth: v.depth, cap: v.cap });
      s.mine.next = surveyOf(s) > 0 && s.rates.mine.auto ? s.t + surveyInterval(s) : null;
    }
  }
  function mineHit(s) { // golpe de la cuadrilla (REAL: potencia de pico x rendimiento del minero)
    let power = R().mining.pickPower * skillMult() * s.rates.mine.rend * MD(s).mine.power;
    s.m.cyc.mine.auto += 1;
    // S2.5 · crewCrit (Prospector): cada N golpes de la cuadrilla, uno es crítico (x critMultiplier).
    if (MD(s).mine.crewCrit) { s.mine.autoHits = (s.mine.autoHits || 0) + 1; if (s.mine.autoHits % MD(s).mine.crewCrit === 0) power *= R().mining.critMultiplier; }
    if (s.vein.open) { // Survey Ahead: se busca la veta siguiente mientras se taladra (S1.5)
      const next = veinFor(s.depth + 1, s).need;
      s.mine.bank = Math.min(next, (s.mine.bank || 0) + power);
      s.m.surveyHits = (s.m.surveyHits || 0) + 1;
      s.mine.next = s.mine.bank >= next ? null : s.t + surveyInterval(s);
      return;
    }
    addSearch(s, power);
    if (hooks.emit) hooks.emit(s, 'hit', { src: 'crew' });
    if (!s.vein.open) s.mine.next = s.t + R().mining.minerIntervalMs / s.rates.mine.ritmo;
  }
  function mineTap(s) { // toque a mano (REAL: combo, crítico y ayuda con minero presente)
    if (s.vein.open) return false;
    s.m.taps.mine += 1;
    const B = R().mining;
    s.combo.n = s.t - s.combo.last <= B.comboWindowMs ? s.combo.n + 1 : 1;
    s.combo.last = s.t;
    const crit = s.combo.n % (MD(s).mine.critEvery || B.critEvery) === 0;
    let power = B.pickPower * skillMult() * (crit ? B.critMultiplier : 1) * MD(s).mine.tapMult;
    s.m.cyc.mine.manual += 1;
    if (s.rates.mine.auto && P().mine.help) power = Math.max(power, s.vein.need * (crit ? B.helpCrit : B.help) * P().mine.helpScale);
    const bl = MD(s).mine.blast || P().mine.blast;
    s.mine.tapCount = (s.mine.tapCount || 0) + 1; s.mine.veinTaps = (s.mine.veinTaps || 0) + 1;
    let blast = false;
    if (bl.mode === 'crit' && crit) blast = true;
    if (bl.mode === 'counter' && s.mine.tapCount % bl.every === 0) blast = true;
    if (bl.mode === 'counterVein' && s.mine.veinTaps % bl.every === 0) blast = true;
    if (blast) { power += s.vein.need * bl.reveal; s.m.blasts = (s.m.blasts || 0) + 1; }
    // S2.5 · Blasting v2: los críticos cargan la voladura (need críticos), con límite por veta y enfriamiento opcionales.
    // Tamaño: 'vein' (un % de la veta), 'pick' (la potencia del pico x mult) o 'crew' (seconds de búsqueda de la cuadrilla).
    if (bl.mode === 'v2' && crit) {
      s.mine.charge = Math.min(bl.need || 1, (s.mine.charge || 0) + 1);
      const ready = s.mine.charge >= (bl.need || 1) && (!bl.cooldownMs || s.t - (s.mine.lastBlast == null ? -Infinity : s.mine.lastBlast) >= bl.cooldownMs) && (s.mine.veinBlasts || 0) < (bl.perVein || Infinity);
      if (ready) {
        const pickP = B.pickPower * skillMult() * MD(s).mine.power;
        const crewP = s.rates.mine.auto ? (pickP * s.rates.mine.rend * s.rates.mine.ritmo * 1000) / B.minerIntervalMs : 0; // búsqueda por segundo de la cuadrilla
        const size = bl.size === 'pick' ? pickP * MD(s).mine.tapMult * bl.mult : bl.size === 'crew' ? Math.max(crewP, pickP) * bl.seconds : s.vein.need * bl.reveal;
        power += size; s.mine.charge = 0; s.mine.lastBlast = s.t; s.mine.veinBlasts = (s.mine.veinBlasts || 0) + 1;
        s.m.blasts = (s.m.blasts || 0) + 1; s.m.blastPower = (s.m.blastPower || 0) + size;
      }
    }
    addSearch(s, power);
    if (hooks.emit) hooks.emit(s, 'hit', { src: 'tap', crit, blast });
    return true;
  }

  // ---- Estaciones de ciclo ----
  function startDrill(s, src) {
    const v = s.vein, r = s.rates.drill;
    if (s.job.drill || !v.open || v.left <= 0 || !s.built.drill) return false;
    if (src === 'auto' && !r.auto) return false;
    const auto = src === 'auto';
    const cyc = cycle(R().drill.durationMs / (auto ? r.ritmo : 1));
    const wanted = R().drill.yield * skillMult() * (auto ? r.rend : 1) * MD(s).drill.yield * cyc.mult + s.carry.drill;
    const amount = Math.max(1, Math.min(Math.floor(wanted), v.left));
    s.carry.drill = Math.max(0, Math.min(1, wanted - Math.floor(wanted)));
    v.left -= amount;
    s.m.veinReserved += amount;
    s.job.drill = { end: s.t + cyc.total, total: cyc.total, amount, src };
    if (hooks.emit) hooks.emit(s, 'drillStart', { amount, src });
    return true;
  }
  function endDrill(s) {
    const j = s.job.drill;
    s.job.drill = null; s.m.cyc.drill[j.src === 'auto' ? 'auto' : 'manual'] += 1;
    s.inv.raw += j.amount; s.m.raw += j.amount;
    if (hooks.emit) hooks.emit(s, 'drillDone', { amount: j.amount, src: j.src });
    const v = s.vein;
    if (v.open && v.left <= 0) { // veta vacía: un nivel más y a buscar (REAL)
      s.m.veins.push({ depth: v.depth, cap: v.cap, need: v.need, searchMs: v.tOpen - v.t0, drillMs: s.t - v.tOpen, t0: v.t0 });
      // S3 (variante «frontera»): sin abrir el estrato siguiente, la colonia sigue en el último nivel: produce igual, no baja.
      const FR = P().s3 && P().s3.frontier, nx = FR ? stratumOf(s.depth + 1) : null;
      if (FR && nx !== stratumOf(s.depth) && !(s.opened && s.opened[nx.id])) { s.m.held = (s.m.held || 0) + 1; s.frontierAt = nx.id; newSearch(s); return; }
      s.frontierAt = null;
      // S3 (variante «fondo de la mina»): al final del último estrato definido la colonia se queda: produce igual, no crece la veta.
      const LS = P().strata[P().strata.length - 1];
      if (P().s3 && P().s3.bedrock && s.depth + 1 >= LS.to) { s.m.held = (s.m.held || 0) + 1; newSearch(s); return; }
      s.depth += 1;
      if (hooks.emit) hooks.emit(s, 'depth', { depth: s.depth });
      refreshRates(s); // los rasgos de profundidad cambian con ella
      newSearch(s);
    }
  }
  function startRefine(s, src) {
    const r = s.rates.refine, B = R().refinery;
    if (s.job.refine || s.inv.raw < B.rawPerBase || !s.built.refine) return false;
    if (src === 'auto' && !r.auto) return false;
    const auto = src === 'auto';
    const cyc = cycle(B.durationMs / (auto ? r.ritmo : 1));
    let size = B.batch * skillMult() * (auto ? r.rend : 1) * MD(s).refine.yield * cyc.mult;
    if (P().refineCarry) size += s.carry.refineBatch || 0; // S1.5: el decimal de la tanda pasa al ciclo siguiente
    const batches = Math.min(Math.max(1, Math.floor(size)), Math.floor(s.inv.raw / B.rawPerBase));
    if (P().refineCarry) s.carry.refineBatch = batches === Math.floor(size) ? Math.max(0, Math.min(1, size - Math.floor(size))) : s.carry.refineBatch || 0;
    const used = batches * B.rawPerBase;
    const wanted = batches * MD(s).refine.base + s.carry.refine; // REAL: x(1 + Double Press) x refuerzo; sin árbol ni refuerzos en S1
    const amount = Math.floor(wanted);
    s.carry.refine = wanted - amount;
    s.inv.raw -= used; s.m.rawUsed += used;
    s.job.refine = { end: s.t + cyc.total, total: cyc.total, amount, used, src };
    if (hooks.emit) hooks.emit(s, 'refineStart', { amount, used, src });
    return true;
  }
  function endRefine(s) { const j = s.job.refine; s.job.refine = null; s.inv.base += j.amount; s.m.base += j.amount; s.m.cyc.refine[j.src === 'auto' ? 'auto' : 'manual'] += 1; if (hooks.emit) hooks.emit(s, 'refineDone', { amount: j.amount, src: j.src }); }
  function currentKey(s) { return PROD().currentKey(s); }
  function startCheese(s, src) {
    const r = s.rates.cheese, B = R().cheesery;
    const want = s.labWant || 0; // S3: el laboratorio reserva su BASE (REAL lab.want)
    if (s.job.cheese || s.inv.base - want < B.lotBase || !s.built.cheese) return false;
    if (src === 'auto' && !r.auto) return false;
    const auto = src === 'auto', key = currentKey(s), f = formula(key);
    const pm = productMods(s, key), lb = B.lotBase * (pm && pm.base ? pm.base : 1); // S3: la cepa puede pedir más BASE y cambiar el tiempo
    if (s.inv.base - want < lb) return false;
    if (f.coin > s.coins) return false; // sin monedas para el ingrediente no se cocina (antes podían quedar en negativo)
    const mt = Math.max(0.3, 1 - B.masteryTime * (mastery(s, key) - 1));
    const cyc = cycle(Math.max(300, Math.round(f.timeMs * mt * MD(s).cheese.time * (pm && pm.time ? pm.time : 1))) / (auto ? r.ritmo : 1));
    const wanted = B.batch * skillMult() * (auto ? r.rend : 1) * MD(s).cheese.yield * cyc.mult + s.carry.cheese;
    const per = Math.max(1, Math.min(Math.floor(wanted), Math.floor((s.inv.base - want) / lb), f.coin > 0 ? Math.floor(s.coins / f.coin) : Infinity));
    if (per < 1) return false;
    s.carry.cheese = Math.max(0, Math.min(1, wanted - Math.floor(wanted)));
    s.inv.base -= per * lb; s.m.baseUsed += per * lb;
    s.coins -= per * f.coin; s.m.coinsCharged += per * f.coin;
    s.job.cheese = { end: s.t + cyc.total, total: cyc.total, per, key, src };
    if (hooks.emit) hooks.emit(s, 'cheeseStart', { per, key, src });
    return true;
  }
  function endCheese(s) {
    const j = s.job.cheese; s.job.cheese = null;
    s.lots[j.key] = (s.lots[j.key] || 0) + j.per;
    const before = mastery(s, j.key), cm = MD(s).cheese;
    // Grand Wheel (REAL, S2): cada 10 min de cocinado, una rueda que vale 2 min de producción.
    let wheel = 0;
    if (cm.wheel) { s.wheelMs += j.total; if (s.wheelMs >= R().milestones.wheel.everyMs) { s.wheelMs -= R().milestones.wheel.everyMs; wheel = Math.max(1, Math.round(j.per * (R().milestones.wheel.worthMs / j.total))); s.m.wheels += 1; } }
    s.lots[j.key] = (s.lots[j.key] || 0) + wheel;
    const madeBefore = s.made[j.key] || 0;
    s.made[j.key] = madeBefore + j.per + wheel;
    s.m.lotsMade += j.per + wheel;
    // Maestría: cuenta aparte, con los multiplicadores de los caminos (Cellar Masters, Tasting Room).
    const prev = s.mastery[j.key] != null ? s.mastery[j.key] : madeBefore;
    const fresh = cm.newRecipeBoost && madeBefore < cm.newRecipeBoost ? 2 : 1;
    s.mastery[j.key] = prev + (j.per + wheel) * cm.masteryRate * fresh;
    s.m.cyc.cheese[j.src === 'auto' ? 'auto' : 'manual'] += 1; s.m.cyc.cheese.lots += j.per; if (j.src === 'auto') s.m.cyc.cheese.autoLots += j.per;
    const after = mastery(s, j.key); // métrica: cuándo llega cada nivel de maestría (no cambia nada)
    if (after > before) { const t = (s.m.masteryT = s.m.masteryT || {}); (t[j.key] = t[j.key] || {})[after] = s.t; }
    if (hooks.lotsDone) hooks.lotsDone(s, j.key, j.per + wheel); // BETA: lo que dé cada queso, si algún origen lo declara
    if (hooks.emit) hooks.emit(s, 'lotDone', { key: j.key, n: j.per, wheel, src: j.src });
  }
  // SELL (REAL: shop.start de cheesery.js, con la capacidad HIP de PARAMS.sell).
  function startSell(s, src) {
    const r = s.rates.sell;
    if (s.job.sell || lotsTotal(s) <= 0 || !s.built.sell) return false;
    if (src === 'auto' && !r.auto) return false;
    const auto = src === 'auto', B = R().shop;
    const SP = P().sell.perCycleByStage ? Object.assign({}, P().sell, { perCycle: P().sell.perCycleByStage[s.stage.sell - 1] }) : P().sell; // S1.5: capacidad por fase
    const cyc = cycle(SP.cycleMs / (auto ? r.ritmo : 1));
    const keys = Object.keys(s.lots).filter((k) => s.lots[k] > 0).map((k) => ({ k, p: price(s, k) })).sort((a, b) => b.p - a.p || (a.k < b.k ? -1 : 1));
    const per = SP.perCycle * MD(s).sell.count * cyc.mult + (s.carry.sell || 0);
    let left = Math.floor(per), coins = 0, n = 0;
    s.carry.sell = per - left; // S2: cantidades decimales por mejoras de SELL
    const by = {}, tally = (key, a, b) => { const st = key.slice(0, key.indexOf('+')), o = by[st] || (by[st] = [0, 0, 0, 0]); o[a] += b[0]; o[a + 1] += b[1]; };
    for (const x of keys) { const k = Math.min(left, s.lots[x.k]); if (k <= 0) break; s.lots[x.k] -= k; coins += x.p * k; n += k; left -= k; tally(x.k, 0, [k, x.p * k]); }
    // Estanterías: caben shelfMinutes de ventas; lo que sobra va al mayorista a mitad de precio, lo más barato primero.
    const shelf = Math.floor(((SP.perCycle * MD(s).sell.count * cyc.mult) / cyc.total) * 60000 * B.shelfMinutes);
    const wr = MD(s).sell.wholesale != null ? MD(s).sell.wholesale : B.wholesale;
    let extra = lotsTotal(s) - shelf, wn = 0, wc = 0;
    for (let i = keys.length - 1; i >= 0 && extra > 0; i--) {
      const x = keys[i], k = Math.min(extra, s.lots[x.k] || 0);
      if (k <= 0) continue;
      s.lots[x.k] -= k; const wv = Math.round((P().sellFineOverflow === false ? x.p / (formula(x.k).value >= R().tiers[1].min ? MD(s).sell.fineBonus : 1) : x.p) * wr) * k; wc += wv; wn += k; extra -= k; tally(x.k, 2, [k, wv]); // S2.5: sin el bonus de Boutique en el mayorista
    }
    if (wn) minuteRow(s, Math.floor(s.t / 60000)).whole += wn;
    const mult = auto ? 1 + (r.rend - 1) * P().sell.yieldWeight : 1; // el tendero multiplica lo cobrado en los dos canales, a medias (REAL)
    const total = Math.round((coins + wc) * mult), f = coins + wc > 0 ? total / (coins + wc) : 0;
    s.job.sell = { end: s.t + cyc.total, total: cyc.total, n, wn, coins: total, direct: coins * f, whole: wc * f, src };
    if (hooks.emit) hooks.emit(s, 'sellStart', { n, wn, src, by, f }); // by: por estilo [vendidos, monedas, al mayorista, monedas], para COINS y SHOP
    return true;
  }
  function endSell(s) {
    const j = s.job.sell; s.job.sell = null; s.m.cyc.sell[j.src === 'auto' ? 'auto' : 'manual'] += 1;
    s.coins += j.coins; s.m.coins += j.coins; minuteRow(s, Math.floor(s.t / 60000)).coins = (minuteRow(s, Math.floor(s.t / 60000)).coins || 0) + j.coins;
    s.m.sold += j.n; s.m.soldCoins += j.direct; s.m.whole += j.wn; s.m.wholeCoins += j.whole;
    if (hooks.emit) hooks.emit(s, 'sale', { n: j.n, wn: j.wn, coins: j.coins, src: j.src });
  }
  const START = { drill: startDrill, refine: startRefine, cheese: startCheese, sell: startSell };
  const END = { drill: endDrill, refine: endRefine, cheese: endCheese, sell: endSell };
  function startIdle(s) {
    let any = true;
    for (let g = 0; any && g < 8; g++) { any = false; for (const st of ['drill', 'refine', 'cheese', 'sell']) if (!s.job[st] && START[st](s, 'auto')) any = true; }
  }
  // Toque a mano en una estación de ciclo: arranca un ciclo a mano si está parada, o acelera el que
  // está en marcha (REAL: boostMs). CHEESE: en el juego real no se arranca a mano sin quesero
  // (PROV S1: se permite, para el perfil manual).
  const BOOST = () => ({ drill: R().drill.boostMs, refine: R().refinery.boostMs, cheese: R().cheesery.boostMs, sell: R().shop.boostMs });
  function tap(s, st) {
    if (st === 'mine') return mineTap(s);
    s.m.taps[st] += 1;
    const j = s.job[st];
    if (j) { j.end = Math.max(s.t, j.end - BOOST()[st]); return true; }
    return START[st](s, 'manual');
  }

  // ---- Métricas por intervalo ----
  function minuteRow(s, mi) { return s.m.minutes[mi] || (s.m.minutes[mi] = { search: 0, drill: 0, refine: 0, cheese: 0, sell: 0, whole: 0, end: null }); }
  function account(s, a, b) {
    if (b <= a) return;
    const d = b - a, m = s.m;
    if (!s.vein.open) m.searchMs += d; else m.openMs += d;
    if (!s.vein.open || s.mine.next != null) m.busy.mine += d;
    for (const st of ['drill', 'refine', 'cheese', 'sell']) {
      if (s.job[st]) m.busy[st] += d;
      else if (s.rates[st].auto) m.idleAuto[st] += d;
    }
    // Minutos: se reparten los tramos que cruzan un minuto.
    let x = a;
    while (x < b) {
      const mi = Math.floor(x / 60000), end = Math.min(b, (mi + 1) * 60000), dd = end - x;
      const row = minuteRow(s, mi);
      if (!s.vein.open) row.search += dd;
      for (const st of ['drill', 'refine', 'cheese', 'sell']) if (s.job[st]) row[st] += dd;
      if (end === (mi + 1) * 60000) row.end = { raw: s.inv.raw, base: s.inv.base, lots: lotsTotal(s) }; // existencias al cerrar el minuto
      x = end;
    }
  }

  // ---- Avance ----
  // bot: { next(s) -> { t, run(s) } | null } para los toques y decisiones programados.
  function nextEvent(s, bot) {
    let best = null;
    const consider = (t, kind, fn) => { if (t != null && (!best || t < best.t)) best = { t, kind, fn }; };
    for (const st of ['drill', 'refine', 'cheese', 'sell']) if (s.job[st]) consider(s.job[st].end, st, () => END[st](s));
    if (s.mine.next != null) consider(s.mine.next, 'hit', () => mineHit(s)); // con la veta abierta solo si hay Survey Ahead
    if (bot) { const b = bot.next(s); if (b) consider(b.t, 'bot', () => b.run(s)); }
    return best;
  }
  function advance(s, T, bot) {
    startIdle(s);
    for (let guard = 0; guard < 5e7; guard++) {
      const e = nextEvent(s, bot);
      if (!e || e.t > T) { account(s, s.t, T); s.t = T; return s; }
      account(s, s.t, e.t);
      s.t = e.t;
      e.fn();
      startIdle(s);
    }
    throw new Error('advance: too many events');
  }
  function run(s, ms, bot, step) {
    const T = s.t + ms, dt = step || P().stepMs;
    while (s.t < T) advance(s, Math.min(T, s.t + dt), bot);
    return s;
  }

  // Resumen comparable (pruebas de determinismo y de equivalencia online/offline).
  function digest(s) {
    return JSON.stringify({ t: s.t, depth: s.depth, coins: s.coins, inv: s.inv, lots: s.lots, made: s.made, carry: s.carry, vein: s.vein, mine: s.mine, m: { raw: s.m.raw, base: s.m.base, lotsMade: s.m.lotsMade, sold: s.m.sold, whole: s.m.whole, coins: s.m.coins, busy: s.m.busy, veins: s.m.veins.length } });
  }

  return { hooks, defaultMods, mastery, styleValue, productMods, create, place, setAway, refreshRates, advance, run, tap, digest, price, formula, stratumOf, veinFor, recipeKey, currentKey, lotsTotal, cycle, skillMult };
})();
