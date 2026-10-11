// Persistencia: guardado versionado en localStorage, exportación e importación.
(function () {
  const B = CM.BALANCE;
  const KEY = CM.SAVE_KEY || 'cheese-miner-v3'; // la clave no cambia: las versiones se migran
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

    // Nudos retirados del juego: se devuelve lo que costaron.
    for (const key of Object.keys(B.retiredNodes)) {
      const old = B.retiredNodes[key];
      for (let r = 0; r < Math.min(200, nat(s.nodes[key])); r++) s.coins += Math.round(old.cost * Math.pow(old.growth, r));
    }
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
      z.refCarry = Math.min(1, pos(z.refCarry));
      z.cookCarry = Number.isFinite(z.cookCarry) ? Math.max(-1, Math.min(1, z.cookCarry)) : 0;
      z.refJob = z.unlocked ? cleanJob(z.refJob, ['amount']) : null;
      if (z.refJob && !(z.refJob.amount >= 0)) z.refJob = null;
      for (const k of Object.keys(z.stats)) z.stats[k] = nat(z.stats[k]);
    }

    s.recipes = s.recipes.filter((r) => isObj(r) && typeof r.id === 'string' && CM.cheesery.parseKey(r.key));
    s.recipes.forEach((r) => {
      r.name = String(r.name || CM.cheesery.defaultName(CM.cheesery.parseKey(r.key))).slice(0, 24);
      r.made = nat(r.made);
    });
    const lots = {};
    for (const r of s.recipes) if (nat(s.lots[r.id]) > 0) lots[r.id] = nat(s.lots[r.id]);
    s.lots = lots;
    // Ratones: campos válidos y un solo ratón por puesto existente.
    const skillsList = Object.keys(B.skills);
    const posts = CM.mice.posts(s).map((p) => p.key);
    const taken = {};
    s.mice = s.mice.filter((m) => isObj(m) && typeof m.id === 'string' && typeof m.name === 'string').slice(0, 200);
    for (const m of s.mice) {
      m.name = m.name.slice(0, 16);
      m.traits = (Array.isArray(m.traits) ? m.traits : []).filter((t) => B.mice.traits[t]).slice(0, 2);
      m.fav = skillsList.indexOf(m.fav) >= 0 ? m.fav : '';
      m.xp = pos(m.xp);
      m.rank = Math.min(nat(m.rank), B.mice.ranks.length - 1);
      m.rest = m.rest === true;
      m.post = typeof m.post === 'string' && posts.indexOf(m.post) >= 0 && !taken[m.post] ? m.post : '';
      if (m.post) taken[m.post] = true;
    }
    s.candidates = (Array.isArray(s.candidates) ? s.candidates : [])
      .filter((c) => isObj(c) && typeof c.name === 'string' && Array.isArray(c.traits) && c.traits.every((t) => B.mice.traits[t]))
      .slice(0, B.mice.candidates);
    s.seed = nat(s.seed) || 1;

    // Cada línea solo puede cocinar recetas de su propia base.
    for (const def of B.zones) {
      const z = s.zones[def.id];
      const assigned = CM.cheesery.recipe(s, z.cookRecipe);
      if (!assigned || CM.cheesery.parseKey(assigned.key).base !== def.base) z.cookRecipe = '';
      const cj = z.unlocked ? cleanJob(z.cookJob, ['key', 'lotsLeft', 'kind']) : null;
      const combo = cj ? CM.cheesery.parseKey(cj.key) : null;
      z.cookJob = cj && combo && combo.base === def.base && cj.lotsLeft > 0 && (cj.kind !== 'produce' || CM.cheesery.recipe(s, cj.recipeId)) ? cj : null;
    }
    s.jobs.shop = cleanJob(s.jobs.shop, ['coins', 'count', 'xp']);
    if (s.jobs.shop && !(s.jobs.shop.coins >= 0 && s.jobs.shop.count > 0)) s.jobs.shop = null;

    const fresh = CM.telemetry.create();
    for (const k of Object.keys(fresh)) if (typeof s.metrics[k] !== typeof fresh[k]) s.metrics[k] = fresh[k];
    for (const k of Object.keys(fresh.taps)) s.metrics.taps[k] = nat(s.metrics.taps[k]);
    return s;
  }

  // v3 -> v4: la refinería y la quesería dejan de ser una sola para todos los
  // quesos y pasan a ser una línea por zona. Se recolocan los ciclos en marcha
  // y la receta del Cheesemaker en la línea que les toca.
  function migrate3(data) {
    const zoneOf = (base) => (B.zones.find((z) => z.base === base) || {}).id;
    const zones = isObj(data.zones) ? data.zones : (data.zones = {});
    const lane = (base) => {
      const id = zoneOf(base);
      if (!id) return null;
      if (!isObj(zones[id])) zones[id] = {};
      return zones[id];
    };
    const jobs = isObj(data.jobs) ? data.jobs : {};
    if (isObj(jobs.refinery) && lane(jobs.refinery.base)) lane(jobs.refinery.base).refJob = jobs.refinery;
    if (isObj(jobs.cheesery) && lane(String(jobs.cheesery.key).split('+')[0])) lane(String(jobs.cheesery.key).split('+')[0]).cookJob = jobs.cheesery;
    const cooking = Array.isArray(data.recipes) ? data.recipes.find((r) => isObj(r) && r.id === data.cookRecipe) : null;
    if (cooking && lane(String(cooking.key).split('+')[0])) lane(String(cooking.key).split('+')[0]).cookRecipe = cooking.id;
    data.jobs = { shop: jobs.shop };
    data.version = 4;
  }

  // v4 -> v5: los ratones dejan de ser nudos de los árboles y pasan a ser
  // personajes. Quien tenía una etapa automatizada (que valía para todas las
  // rocas) recibe un ratón en ese puesto por cada roca abierta; los rangos
  // extra del antiguo Miner Mouse se devuelven en monedas.
  const OLD_MICE = { 'mining.miner': ['mining', 100, 2], 'drilling.driller': ['drilling'], 'refining.refiner': ['refining'], 'cheesemaking.maker': ['cheesemaking'], 'trading.keeper': ['trading'] };
  function migrate4(data) {
    const nodes = isObj(data.nodes) ? data.nodes : (data.nodes = {});
    const zones = isObj(data.zones) ? data.zones : {};
    const open = B.zones.filter((z, i) => i === 0 || (isObj(zones[z.id]) && zones[z.id].unlocked)).map((z) => z.id);
    const mice = [];
    let n = 0;
    const add = (skill, zone) => {
      const name = B.mice.names[n % B.mice.names.length];
      mice.push({ id: 'm' + (nat(data.nextId) + 1000 + n), name, traits: ['fast', 'dreamer'], fav: skill, xp: 0, rank: 0, post: skill + ':' + zone, rest: false });
      n += 1;
    };
    for (const key of Object.keys(OLD_MICE)) {
      const rank = nat(nodes[key]);
      delete nodes[key];
      if (!rank) continue;
      const [skill, cost, growth] = OLD_MICE[key];
      if (skill === 'trading') add(skill, 'all');
      else for (const zone of open) add(skill, zone);
      for (let r = 1; cost && r < rank; r++) data.coins = nat(data.coins) + Math.round(cost * Math.pow(growth, r));
    }
    data.mice = mice;
    if (mice.length) data.built = Object.assign({}, data.built, { house: true });
    data.version = 5;
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
    if (isObj(data) && data.version === 3) migrate3(data);
    if (isObj(data) && data.version === 4) migrate4(data);
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
