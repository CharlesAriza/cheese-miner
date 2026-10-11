// Persistencia: guardado versionado en localStorage, exportación e importación.
(function () {
  const B = CM.BALANCE;
  const KEY = CM.SAVE_KEY || 'cheese-miner-v3';
  const BACKUP_KEY = KEY + '-broken';

  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const nat = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  const pos = (v) => (Number.isFinite(v) && v > 0 ? v : 0);

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
    for (const k of Object.keys(s.skills)) s.skills[k].xp = pos(s.skills[k].xp);

    // Nudos: solo los que existen, sin pasar de su rango máximo.
    const nodes = {};
    for (const key of Object.keys(s.nodes)) {
      const [skill, id] = key.split('.');
      const node = CM.tree.node(skill, id);
      if (node && nat(s.nodes[key]) > 0) nodes[key] = Math.min(nat(s.nodes[key]), node.max);
    }
    s.nodes = nodes;

    s.zones[B.zones[0].id].unlocked = true;
    for (const def of B.zones) {
      const z = s.zones[def.id];
      z.depth = z.unlocked ? nat(z.depth) : 0;
      z.discover = z.unlocked ? Math.min(pos(z.discover), CM.q.veinHits(s, def.id)) : 0;
      z.veinRemaining = z.unlocked && z.veinRevealed ? Math.min(nat(z.veinRemaining), CM.q.veinCapacity(s, def.id)) : 0;
      z.veinRevealed = z.unlocked && z.veinRevealed && (z.veinRemaining > 0 || !!z.drillJob);
      z.carry = Math.min(1, pos(z.carry));
      z.minerAcc = pos(z.minerAcc);
      z.drillJob = z.unlocked ? cleanJob(z.drillJob, ['amount']) : null;
      if (z.drillJob && !(z.drillJob.amount > 0)) z.drillJob = null;
    }
    s.refCarry = Math.min(1, pos(s.refCarry));

    s.recipes = s.recipes.filter((r) => isObj(r) && typeof r.id === 'string' && CM.cheesery.parseKey(r.key));
    s.recipes.forEach((r) => {
      r.name = String(r.name || CM.cheesery.defaultName(CM.cheesery.parseKey(r.key))).slice(0, 24);
      r.made = nat(r.made);
    });
    const lots = {};
    for (const r of s.recipes) if (nat(s.lots[r.id]) > 0) lots[r.id] = nat(s.lots[r.id]);
    s.lots = lots;
    if (!CM.cheesery.recipe(s, s.cookRecipe)) s.cookRecipe = '';

    s.jobs.refinery = cleanJob(s.jobs.refinery, ['amount', 'base']);
    if (s.jobs.refinery && s.inv.base[s.jobs.refinery.base] === undefined) s.jobs.refinery = null;
    s.jobs.cheesery = cleanJob(s.jobs.cheesery, ['key', 'lotsLeft', 'kind']);
    const cj = s.jobs.cheesery;
    if (cj && (!CM.cheesery.parseKey(cj.key) || !(cj.lotsLeft > 0) || (cj.kind === 'produce' && !CM.cheesery.recipe(s, cj.recipeId)))) s.jobs.cheesery = null;
    s.jobs.shop = cleanJob(s.jobs.shop, ['coins', 'count', 'xp']);
    if (s.jobs.shop && !(s.jobs.shop.coins >= 0 && s.jobs.shop.count > 0)) s.jobs.shop = null;

    // Si algo quedó por encima de la capacidad, se recorta al máximo.
    const caps = CM.q.caps(s);
    for (const [kind, cap] of [['raw', caps.raw], ['base', caps.base]]) {
      let over = Object.values(s.inv[kind]).reduce((a, b) => a + b, 0) - cap;
      for (const k of Object.keys(s.inv[kind])) {
        const cut = Math.min(Math.max(0, over), s.inv[kind][k]);
        s.inv[kind][k] -= cut;
        over -= cut;
      }
    }
    let overLots = CM.q.lotsTotal(s) - caps.lots;
    for (const id of Object.keys(s.lots)) {
      const cut = Math.min(Math.max(0, overLots), s.lots[id]);
      s.lots[id] -= cut;
      overLots -= cut;
    }

    const fresh = CM.telemetry.create();
    for (const k of Object.keys(fresh)) if (typeof s.metrics[k] !== typeof fresh[k]) s.metrics[k] = fresh[k];
    for (const k of Object.keys(fresh.taps)) s.metrics.taps[k] = nat(s.metrics.taps[k]);
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
          game: 'cheese-miner',
          exportedAt: new Date(now).toISOString(),
          devToolsUsed: state.devUsed,
          playedMinutes: Math.round(state.clock / 6000) / 10,
          levels: Object.fromEntries(CM.skills.list.map((k) => [k, CM.q.level(state, k)])),
          goalsMinutes: Object.fromEntries(Object.entries(state.goalsDone).map(([k, v]) => [k, Math.round(v / 600) / 100])),
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
