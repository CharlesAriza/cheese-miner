// Modelo único de datos, consultas derivadas, eventos y validación de invariantes.
(function () {
  const B = CM.BALANCE;

  CM.SAVE_VERSION = 2;
  CM.events = []; // cola que consume la UI para dar feedback
  CM.muted = false; // true durante la simulación offline: no hay feedback visual

  CM.emit = function (state, type, data) {
    const ev = Object.assign({ type }, data || {});
    if (CM.telemetry) CM.telemetry.onEvent(state, ev);
    if (!CM.muted) CM.events.push(ev);
    return ev;
  };

  // Números compactos: 12.3K, 4.5M.
  CM.fmt = function (n) {
    const v = Math.floor(n);
    if (Math.abs(v) < 10000) return String(v);
    if (Math.abs(v) < 1e6) return (v / 1e3).toFixed(Math.abs(v) < 1e5 ? 1 : 0) + 'K';
    if (Math.abs(v) < 1e9) return (v / 1e6).toFixed(Math.abs(v) < 1e8 ? 1 : 0) + 'M';
    return (v / 1e9).toFixed(1) + 'B';
  };

  CM.ok = (extra) => Object.assign({ ok: true }, extra || {});
  CM.fail = (reason) => ({ ok: false, reason });

  CM.createState = function (now) {
    const deposits = {};
    B.deposits.forEach((d, i) => {
      deposits[d.id] = { unlocked: i === 0, veinIndex: 0, discover: 0, veinRevealed: false, veinRemaining: 0 };
    });
    const perBase = () => {
      const o = {};
      Object.keys(B.bases).forEach((k) => (o[k] = 0));
      return o;
    };
    return {
      version: CM.SAVE_VERSION,
      createdAt: now,
      lastSavedAt: now,
      clock: 0, // ms de simulación jugados
      seed: (now >>> 0) || 1,
      nextId: 1,
      devUsed: false,
      coins: B.start.coins,
      activeDeposit: B.deposits[0].id,
      deposits,
      inv: { raw: perBase(), base: perBase() },
      lots: {}, // recipeId -> lotes en almacén
      built: { drill: false, refinery: false, storage: false, house: false, cheesery: false, market: false },
      levels: { pickaxe: 0, drill: 0, refinery: 0, cheesery: 0, storage: 0, house: 0 }, // machineLevel
      workers: { miner: 0, driller: 0, refiner: 0, cheesemaker: 0 }, // workerCount
      cookRecipe: '', // id de la receta asignada al Cheesemaker
      jobs: { drill: null, refinery: null, cheesery: null },
      minerAcc: 0,
      combo: 0,
      lastHitAt: -1e9,
      recipes: [], // { id, key, name, at, made }
      rep: 0, // puntos de reputación de la tienda
      orders: [],
      totals: {
        hits: 0,
        veinsFound: 0,
        rawProduced: 0,
        rawConsumed: 0,
        baseProduced: 0,
        baseConsumed: 0,
        lotsProduced: 0,
        lotsSold: 0,
        markupSales: 0,
        walkouts: 0,
        coinsEarned: 0,
        coinsSpent: 0,
        goalCoins: 0,
        recipes: 0,
        workersHired: 0,
        depositsUnlocked: 1,
        depositsDepleted: 0,
      },
      goalsDone: {}, // id -> clock en que se cumplió
      metrics: CM.telemetry.create(),
    };
  };

  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
  const q = {
    depDef: (id) => B.deposits.find((d) => d.id === id),
    dep: (s) => s.deposits[s.activeDeposit],
    veinDef: (s, id) => q.depDef(id).veins[s.deposits[id].veinIndex] || null,
    // intact -> searching -> vein_revealed -> (siguiente veta) ... -> depleted
    depPhase(s, id) {
      const d = s.deposits[id];
      if (!q.veinDef(s, id)) return 'depleted';
      if (d.veinRevealed) return 'vein_revealed';
      return d.discover > 0 ? 'searching' : 'intact';
    },
    caps: (s) => B.storage.levels[s.built.storage ? 1 + s.levels.storage : 0],
    rawTotal: (s) => sum(s.inv.raw),
    baseTotal: (s) => sum(s.inv.base),
    lotsTotal: (s) => sum(s.lots),
    // Espacio libre descontando lo que ya está reservado por un ciclo en marcha.
    rawSpace: (s) => q.caps(s).raw - q.rawTotal(s) - (s.jobs.drill ? s.jobs.drill.amount : 0),
    baseSpace: (s) => q.caps(s).base - q.baseTotal(s) - (s.jobs.refinery ? s.jobs.refinery.amount : 0),
    lotsSpace: (s) => q.caps(s).lots - q.lotsTotal(s) - (s.jobs.cheesery ? s.jobs.cheesery.lotsLeft : 0),
    slots: (s) => B.house.slots[s.built.house ? 1 + s.levels.house : 0],
    workersTotal: (s) => sum(s.workers),
    pickPower: (s) => B.mining.pickPowerBase + B.mining.pickPowerPerLevel * s.levels.pickaxe,
    // machineThroughput: depende solo del nivel de la máquina, nunca de los trabajadores.
    drillYield: (s) => B.drill.yieldBase + B.drill.yieldPerLevel * s.levels.drill,
    drillDuration: (s) => Math.round(B.drill.durationMs * Math.pow(B.drill.durationFactorPerLevel, s.levels.drill)),
    refineBatch: (s) => B.refinery.batchBase + B.refinery.batchPerLevel * s.levels.refinery,
    refineDuration: (s) =>
      Math.round(B.refinery.durationMs * Math.pow(B.refinery.durationFactorPerLevel, s.levels.refinery)),
    isAutomated: (s, role) => s.workers[role] > 0,
  };
  CM.q = q;

  // Generador determinista guardado en el estado (pedidos reproducibles).
  CM.rand = function (s) {
    s.seed = (s.seed + 0x6d2b79f5) >>> 0;
    let t = s.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Devuelve la lista de invariantes rotos (vacía si todo está bien).
  CM.validate = function (s) {
    const bad = [];
    const caps = q.caps(s);
    if (!(s.coins >= 0)) bad.push('coins < 0');
    for (const kind of ['raw', 'base']) {
      for (const k of Object.keys(s.inv[kind])) if (!(s.inv[kind][k] >= 0)) bad.push(kind + '.' + k + ' < 0');
    }
    if (q.rawTotal(s) > caps.raw) bad.push('raw over capacity');
    if (q.baseTotal(s) > caps.base) bad.push('base over capacity');
    if (q.lotsTotal(s) > caps.lots) bad.push('lots over capacity');
    for (const id of Object.keys(s.lots)) {
      if (!(s.lots[id] >= 0)) bad.push('lots.' + id + ' < 0');
      if (!s.recipes.some((r) => r.id === id)) bad.push('lots of unknown recipe ' + id);
    }
    for (const def of B.deposits) {
      const d = s.deposits[def.id];
      const vein = q.veinDef(s, def.id);
      if (d.veinRemaining < 0) bad.push(def.id + ' vein < 0');
      if (vein && d.veinRemaining > vein.capacity) bad.push(def.id + ' vein over capacity');
      if (!vein && d.veinRemaining !== 0) bad.push(def.id + ' depleted but has cheese');
    }
    if (q.workersTotal(s) > q.slots(s)) bad.push('more workers than beds');
    for (const role of Object.keys(s.workers)) {
      if (s.workers[role] > B.workers[role].max) bad.push('too many ' + role);
    }
    return bad;
  };
})();
