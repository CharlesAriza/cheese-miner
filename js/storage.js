// Persistencia: guardado versionado en localStorage, exportación e importación.
(function () {
  const B = CM.BALANCE;
  const KEY = CM.SAVE_KEY || 'cheese-miner-alpha';
  const BACKUP_KEY = KEY + '-broken';

  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  // Copia sobre un estado nuevo solo los campos del tipo esperado.
  function merge(fresh, data) {
    if (!isObj(data)) return;
    for (const k of Object.keys(fresh)) {
      const f = fresh[k];
      const d = data[k];
      if (d === undefined) continue;
      if (typeof f === 'number') {
        if (Number.isFinite(d)) fresh[k] = d;
      } else if (typeof f === 'boolean' || typeof f === 'string') {
        if (typeof d === typeof f) fresh[k] = d;
      } else if (Array.isArray(f)) {
        if (Array.isArray(d)) fresh[k] = d;
      } else if (f === null) {
        if (isObj(d)) fresh[k] = d;
      } else if (isObj(f)) {
        if (Object.keys(f).length === 0) {
          if (isObj(d)) fresh[k] = d; // mapas de claves dinámicas
        } else merge(f, d);
      }
    }
  }

  const nat = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

  function cleanJob(job, fields) {
    if (!isObj(job) || !(job.total > 0) || !Number.isFinite(job.remaining)) return null;
    job.remaining = Math.max(0, Math.min(job.remaining, job.total));
    return fields.every((f) => job[f] !== undefined && job[f] !== null) ? job : null;
  }

  // Repara lo que un guardado viejo o manipulado pueda traer mal.
  function sanitize(s) {
    s.version = CM.SAVE_VERSION;
    s.coins = nat(s.coins);
    for (const kind of ['raw', 'base']) for (const k of Object.keys(s.inv[kind])) s.inv[kind][k] = nat(s.inv[kind][k]);
    for (const k of Object.keys(s.levels)) s.levels[k] = Math.min(nat(s.levels[k]), B.upgrades[k].maxLevel);
    for (const k of Object.keys(s.workers)) s.workers[k] = Math.min(nat(s.workers[k]), B.workers[k].max);
    // Nunca más trabajadores que camas.
    for (const k of Object.keys(s.workers).reverse()) {
      while (s.workers[k] > 0 && CM.q.workersTotal(s) > CM.q.slots(s)) s.workers[k] -= 1;
    }
    for (const def of B.deposits) {
      const d = s.deposits[def.id];
      d.veinIndex = Math.min(nat(d.veinIndex), def.veins.length);
      const vein = def.veins[d.veinIndex];
      if (!vein) {
        d.veinRevealed = false;
        d.veinRemaining = 0;
        d.discover = 0;
      } else {
        d.discover = Math.min(nat(d.discover), vein.hits);
        d.veinRemaining = d.veinRevealed ? Math.min(nat(d.veinRemaining), vein.capacity) : 0;
      }
    }
    if (!s.deposits[s.activeDeposit] || !s.deposits[s.activeDeposit].unlocked) s.activeDeposit = B.deposits[0].id;
    s.deposits[B.deposits[0].id].unlocked = true;

    s.recipes = s.recipes.filter((r) => isObj(r) && typeof r.id === 'string' && CM.cheesery.parseKey(r.key));
    s.recipes.forEach((r) => (r.name = String(r.name || CM.cheesery.defaultName(CM.cheesery.parseKey(r.key))).slice(0, 24)));
    const lots = {};
    for (const r of s.recipes) if (nat(s.lots[r.id]) > 0) lots[r.id] = nat(s.lots[r.id]);
    s.lots = lots;

    if (!CM.cheesery.recipe(s, s.cookRecipe)) s.cookRecipe = '';

    s.jobs.drill = cleanJob(s.jobs.drill, ['amount', 'deposit']);
    if (s.jobs.drill && !s.deposits[s.jobs.drill.deposit]) s.jobs.drill = null;
    s.jobs.refinery = cleanJob(s.jobs.refinery, ['amount', 'base']);
    if (s.jobs.refinery && s.inv.base[s.jobs.refinery.base] === undefined) s.jobs.refinery = null;
    s.jobs.cheesery = cleanJob(s.jobs.cheesery, ['key', 'lotsLeft', 'kind']);
    const cj = s.jobs.cheesery;
    if (cj && (!CM.cheesery.parseKey(cj.key) || !(cj.lotsLeft > 0) || (cj.kind === 'produce' && !CM.cheesery.recipe(s, cj.recipeId)))) {
      s.jobs.cheesery = null;
    }

    s.orders = s.orders
      .slice(0, B.merchant.slots)
      .map((o) => (isObj(o) && o.id && B.merchant.buyers[o.buyer] && o.qty > 0 && isObj(o.req) ? o : isObj(o) && o.cooldown > 0 ? { cooldown: o.cooldown } : null));
    const fresh = CM.telemetry.create();
    for (const k of Object.keys(fresh)) if (typeof s.metrics[k] !== typeof fresh[k]) s.metrics[k] = fresh[k];
    return s;
  }

  // Convierte texto JSON en un estado válido, o null si no sirve.
  function parse(text, now) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return null;
    }
    if (isObj(data) && isObj(data.save)) data = data.save; // archivo exportado
    if (!isObj(data) || data.version !== CM.SAVE_VERSION) return null;
    const s = CM.createState(now);
    try {
      merge(s, data);
      return sanitize(s);
    } catch (e) {
      return null;
    }
  }

  CM.storage = {
    KEY,
    parse,
    // Devuelve { state, isNew, recovered }. Un guardado roto se aparta y se empieza de cero.
    load(now) {
      let text = null;
      try {
        text = localStorage.getItem(KEY);
      } catch (e) {}
      if (!text) return { state: CM.createState(now), isNew: true };
      const state = parse(text, now);
      if (state) return { state, isNew: false };
      try {
        localStorage.setItem(BACKUP_KEY, text);
      } catch (e) {}
      return { state: CM.createState(now), isNew: true, recovered: true };
    },
    save(state, now) {
      state.lastSavedAt = now;
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear() {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {}
    },
    // Partida + métricas + eventos, para enviar tras un playtest.
    exportText(state, now) {
      return JSON.stringify(
        {
          game: 'cheese-miner-alpha',
          exportedAt: new Date(now).toISOString(),
          devToolsUsed: state.devUsed,
          playedMinutes: Math.round(state.clock / 6000) / 10,
          milestonesMinutes: Object.fromEntries(Object.entries(state.goalsDone).map(([k, v]) => [k, Math.round(v / 600) / 100])),
          totals: state.totals,
          invariants: CM.validate(state),
          save: state,
        },
        null,
        1
      );
    },
  };
})();
