// Modelo único de datos, consultas derivadas, eventos y validación de invariantes.
(function () {
  const B = CM.BALANCE;

  CM.SAVE_VERSION = 3;
  CM.events = []; // cola que consume la UI para dar feedback
  CM.muted = false; // true durante la simulación offline: no hay feedback visual

  CM.emit = function (state, type, data) {
    const ev = Object.assign({ type }, data || {});
    if (CM.telemetry) CM.telemetry.onEvent(state, ev);
    if (!CM.muted) CM.events.push(ev);
    return ev;
  };

  // Números compactos: 12.3K, 4.5M, 7.8B, 1.2T...
  const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  CM.fmt = function (n) {
    const v = Math.floor(n);
    if (Math.abs(v) < 10000) return String(v);
    const tier = Math.min(UNITS.length - 1, Math.floor(Math.log10(Math.abs(v)) / 3));
    const scaled = v / Math.pow(10, tier * 3);
    return scaled.toFixed(scaled < 100 ? 1 : 0) + UNITS[tier];
  };

  CM.ok = (extra) => Object.assign({ ok: true }, extra || {});
  CM.fail = (reason) => ({ ok: false, reason });

  const perBase = () => {
    const o = {};
    Object.keys(B.bases).forEach((k) => (o[k] = 0));
    return o;
  };

  CM.createState = function (now) {
    const zones = {};
    B.zones.forEach((z, i) => {
      zones[z.id] = { unlocked: i === 0, depth: 0, discover: 0, veinRevealed: false, veinRemaining: 0, drillJob: null, minerAcc: 0, carry: 0 };
    });
    const skills = {};
    Object.keys(B.skills).forEach((k) => (skills[k] = { xp: 0 }));
    return {
      version: CM.SAVE_VERSION,
      createdAt: now,
      lastSavedAt: now,
      clock: 0, // ms de simulación jugados
      nextId: 1,
      devUsed: false,
      coins: 0,
      zones,
      skills,
      nodes: {}, // 'habilidad.nudo' -> rango comprado
      inv: { raw: perBase(), base: perBase() },
      lots: {}, // recipeId -> quesos en almacén
      built: { drill: false, refinery: false, cheesery: false, shop: false },
      jobs: { refinery: null, cheesery: null, shop: null },
      refCarry: 0, // fracción de Cheese Base pendiente del bonus de refinado
      cookRecipe: '', // receta que cocina el Cheesemaker
      recipes: [], // { id, key, name, at, made }
      combo: 0,
      lastHitAt: -1e9,
      totals: {
        hits: 0,
        veinsFound: 0,
        rawProduced: 0,
        rawConsumed: 0,
        baseProduced: 0,
        baseConsumed: 0,
        lotsProduced: 0,
        lotsSold: 0,
        coinsEarned: 0,
        coinsSpent: 0,
        goalCoins: 0,
        recipes: 0,
        nodesBought: 0,
        zonesUnlocked: 1,
      },
      goalsDone: {}, // id -> clock en que se cumplió
      metrics: CM.telemetry.create(),
    };
  };

  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  // ---------- Efectos de los árboles ----------
  // Suma lo que aportan todos los nudos comprados. Se recalcula solo cuando
  // cambian los nudos.
  let modsCache = { src: null, stamp: -1, get: null };
  function mods(s) {
    let stamp = 0;
    for (const k in s.nodes) stamp = stamp * 31 + s.nodes[k] + k.length;
    if (modsCache.src === s.nodes && modsCache.stamp === stamp) return modsCache.get;
    const m = {};
    for (const skill of Object.keys(B.trees)) {
      for (const node of B.trees[skill]) {
        const rank = s.nodes[skill + '.' + node.id] || 0;
        if (!rank) continue;
        for (const k of Object.keys(node.eff)) m[k] = (m[k] || 0) + node.eff[k] * rank;
      }
    }
    const get = (k) => m[k] || 0;
    modsCache = { src: s.nodes, stamp, get };
    return get;
  }

  // ---------- Niveles ----------
  // Experiencia total necesaria para ALCANZAR un nivel.
  const xpForLevel = (level) => (B.xp.base * (Math.pow(B.xp.growth, level - 1) - 1)) / (B.xp.growth - 1);
  function levelOf(s, skill) {
    const xp = s.skills[skill].xp;
    const raw = Math.floor(Math.log((xp * (B.xp.growth - 1)) / B.xp.base + 1) / Math.log(B.xp.growth) + 1e-9) + 1;
    return Math.max(1, Math.min(B.xp.maxLevel, raw));
  }

  const AUTO_KEY = { mining: 'miners', drilling: 'drillAuto', refining: 'refAuto', cheesemaking: 'cheeseAuto', trading: 'sellAuto' };

  const q = {
    mods,
    xpForLevel,
    level: levelOf,
    // Progreso dentro del nivel actual: { level, cur, need, maxed }.
    xpProgress(s, skill) {
      const level = levelOf(s, skill);
      if (level >= B.xp.maxLevel) return { level, cur: 1, need: 1, maxed: true };
      const from = xpForLevel(level);
      return { level, cur: Math.floor(s.skills[skill].xp - from), need: Math.ceil(xpForLevel(level + 1) - from), maxed: false };
    },
    // Multiplicador por nivel de habilidad.
    skillMult: (s, skill) => 1 + B.xp.bonusPerLevel * (levelOf(s, skill) - 1),
    totalLevel: (s) => Object.keys(B.skills).reduce((a, k) => a + levelOf(s, k), 0),

    zoneDef: (id) => B.zones.find((z) => z.id === id),
    openZones: (s) => B.zones.filter((z) => s.zones[z.id].unlocked),
    veinHits: (s, id) => Math.round(q.zoneDef(id).hits * Math.pow(B.depth.hitsGrowth, s.zones[id].depth)),
    veinCapacity: (s, id) => Math.round(q.zoneDef(id).capacity * Math.pow(B.depth.capacityGrowth, s.zones[id].depth) * (1 + mods(s)('veinCap'))),

    rawTotal: (s) => sum(s.inv.raw),
    baseTotal: (s) => sum(s.inv.base),
    lotsTotal: (s) => sum(s.lots),
    // Todo lo guardado, para el aspecto del almacén (crece con lo que tienes).
    stockTotal: (s) => q.rawTotal(s) + q.baseTotal(s) + q.lotsTotal(s),

    pickPower: (s) => (B.mining.pickPower + mods(s)('pickPower')) * q.skillMult(s, 'mining'),
    critMult: (s) => B.mining.critMultiplier + mods(s)('critMult'),
    miners: (s) => mods(s)('miners'),
    minerInterval: (s) => B.mining.minerIntervalMs / (1 + mods(s)('minerSpeed')),
    // Raw Cheese por ciclo en una zona (puede tener decimales; se acumulan).
    drillYield(s, id) {
      const m = mods(s);
      const depthBonus = 1 + s.zones[id].depth * (B.depth.richness + m('richDepth'));
      return (B.drill.yield + m('drillYield')) * depthBonus * (1 + m('drillRich')) * q.skillMult(s, 'drilling');
    },
    drillDuration: (s) => Math.max(300, Math.round(B.drill.durationMs / (1 + mods(s)('drillSpeed')))),
    refineBatch: (s) => B.refinery.batch + mods(s)('refBatch'),
    refineMult: (s) => (1 + mods(s)('refBonus')) * q.skillMult(s, 'refining'),
    refineDuration: (s) => Math.max(300, Math.round(B.refinery.durationMs / (1 + mods(s)('refSpeed')))),
    sellCount: (s) => B.shop.perSale + mods(s)('sellCount'),
    sellDuration: (s) => Math.max(300, Math.round(B.shop.durationMs / (1 + mods(s)('sellSpeed')))),
    buyer(s) {
      const level = levelOf(s, 'trading');
      let best = B.shop.buyers[0];
      for (const b of B.shop.buyers) if (level >= b.level) best = b;
      return best;
    },
    priceMult: (s) => q.buyer(s).mult * (1 + mods(s)('price')) * q.skillMult(s, 'trading'),
    offlineCapMs: (s) => (B.offline.baseHours + mods(s)('offlineHours')) * 3600000,
    // Automatización: depende solo de haber comprado el nudo del ratón.
    isAutomated: (s, skill) => mods(s)(AUTO_KEY[skill]) > 0,
    // Aspecto del edificio (0..n) según los rangos comprados en su rama POWER.
    visualTier(s, skill) {
      let ranks = 0;
      for (const node of B.trees[skill]) if (node.branch === 'power') ranks += s.nodes[skill + '.' + node.id] || 0;
      let tier = 0;
      B.visualTiers.forEach((need, i) => {
        if (ranks >= need) tier = i;
      });
      return tier;
    },
  };
  CM.q = q;

  // Devuelve la lista de invariantes rotos (vacía si todo está bien).
  CM.validate = function (s) {
    const bad = [];
    if (!(s.coins >= 0)) bad.push('coins < 0');
    for (const kind of ['raw', 'base']) {
      for (const k of Object.keys(s.inv[kind])) if (!(s.inv[kind][k] >= 0)) bad.push(kind + '.' + k + ' < 0');
    }
    for (const id of Object.keys(s.lots)) {
      if (!(s.lots[id] >= 0)) bad.push('lots.' + id + ' < 0');
      if (!s.recipes.some((r) => r.id === id)) bad.push('cheese of unknown recipe ' + id);
    }
    for (const def of B.zones) {
      const z = s.zones[def.id];
      if (z.veinRemaining < 0) bad.push(def.id + ' vein < 0');
      if (!z.veinRevealed && z.veinRemaining !== 0) bad.push(def.id + ' hidden vein has cheese');
      if (!z.unlocked && (z.depth > 0 || z.discover > 0)) bad.push(def.id + ' locked but progressed');
    }
    for (const key of Object.keys(s.nodes)) {
      const [skill, id] = key.split('.');
      const node = (B.trees[skill] || []).find((n) => n.id === id);
      if (!node) bad.push('unknown node ' + key);
      else if (s.nodes[key] > node.max) bad.push(key + ' over max rank');
    }
    for (const k of Object.keys(s.skills)) if (!(s.skills[k].xp >= 0)) bad.push(k + ' xp < 0');
    return bad;
  };
})();
