// Modelo único de datos, consultas derivadas, eventos y validación de invariantes.
(function () {
  const B = CM.BALANCE;

  CM.SAVE_VERSION = 9;
  CM.events = []; // cola que consume la UI para dar feedback
  CM.muted = false; // true durante la simulación offline: no hay feedback visual

  // ---- Memoria de un paso de simulación ----
  // Dentro de un paso, casi todo lo que se consulta (qué rinde un ratón, cuánto vale un
  // queso, los efectos de las mejoras) da siempre lo mismo. `CM.memo` guarda esas respuestas
  // mientras dura el paso y `CM.rev` sube cada vez que ocurre algo que puede cambiarlas
  // (un nivel, un rasgo, una mejora, una receta, bajar de profundidad...): una respuesta
  // solo vale si se guardó con la misma revisión. Fuera de un paso no hay memoria.
  CM.memo = null;
  CM.rev = 0;
  // Eventos que se repiten sin parar y no cambian ninguna de esas respuestas.
  const ROUTINE = { grandWheel: 1, cheeseStart: 1, drillDone: 1, drillStart: 1, hit: 1, lotDone: 1, refineDone: 1, refineStart: 1, sale: 1, sellStart: 1, reveal: 1, purchase: 1, labStart: 1, labSetback: 1, goal: 1, cheeseBoost: 1, drillBoost: 1, refineBoost: 1, sellBoost: 1, careStart: 1, candidates: 1 };

  // Los que además nadie escucha con el juego cerrado (ni la interfaz ni la telemetría).
  const SILENT = { grandWheel: 1, cheeseStart: 1, drillDone: 1, drillStart: 1, hit: 1, lotDone: 1, refineDone: 1, refineStart: 1, sale: 1, sellStart: 1, labStart: 1 };

  CM.emit = function (state, type, data) {
    if (CM.muted && SILENT[type]) return null;
    if (!ROUTINE[type]) CM.rev += 1;
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

  // Generador determinista guardado en la partida.
  CM.rand = function (s) {
    s.seed = (s.seed + 0x6d2b79f5) >>> 0;
    let t = s.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
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
      // Cada zona es una LÍNEA completa: su roca, su taladro, su refinado y su
      // cocinado. Todas las líneas trabajan a la vez; solo la tienda es común.
      zones[z.id] = {
        unlocked: i === 0,
        depth: 0,
        discover: 0,
        veinRevealed: false,
        veinRemaining: 0,
        drillJob: null,
        minerAcc: 0,
        carry: 0, // fracción de Raw pendiente
        refJob: null,
        refCarry: 0, // fracción de Base pendiente del bonus de refinado
        cookJob: null,
        cookCarry: 0, // fracción de queso pendiente por el rendimiento del ratón
        cookRecipe: '', // receta fijada para el ratón quesero de esta línea
        wheelMs: 0, // tiempo de cocinado acumulado hacia la siguiente Grand Wheel
        stats: { raw: 0, rawUsed: 0, base: 0, baseUsed: 0, lots: 0 }, // producido y gastado, para los ritmos
      };
    });
    const skills = {};
    Object.keys(B.skills).forEach((k) => (skills[k] = { xp: 0 }));
    return {
      version: CM.SAVE_VERSION,
      createdAt: now,
      lastSavedAt: now,
      clock: 0, // ms de simulación jugados
      nextId: 1,
      seed: (now >>> 0) || 1, // para sorteos reproducibles (candidatos a ratón)
      devUsed: false,
      coins: 0,
      zones,
      skills,
      nodes: {}, // 'habilidad.nudo' -> rango comprado
      inv: { raw: perBase(), base: perBase() },
      lots: {}, // recipeId -> quesos en almacén
      built: { drill: false, refinery: false, cheesery: false, shop: false, house: false, lab: false },
      mice: [], // ver CM.mice.normalize: nombre, rasgos, afinidades, aspecto, nivel, rango, puesto...
      candidates: [], // candidatos pendientes de elegir tras pagar el reclutamiento
      album: {}, // 'fur:3', 'hat:1', 'trait:fast'... piezas vistas en ratones reclutados; no se pierden
      settings: { managersBuy: true },
      jobs: { shop: null },
      // Investigación de recetas: va aparte de la producción, en paralelo.
      // `dir` es la dirección que marca el jugador: '' (ninguna), 'value', 'fast',
      // 'base:<id>', 'ingredient:<id>', 'treatment:<id>' o 'maturation:<id>'.
      care: null, // la cama de la Mouse House: { id, kind, what, to, remaining, total }
      // Hitos. `quota`: objetivo de producción en curso (need = 0: ninguno) y el ritmo
      // sostenido que lo fija. `board`: ventas recientes por ingrediente, tratamiento y
      // maduración. `master`: el ratón con el título de Grand Master.
      quota: { done: 0, from: 0, need: 0, best: 0, mark: 0, at: 0, b0: 0, b1: 0, b2: 0, full: 0 },
      msOpen: Object.fromEntries(B.trees.cheesemaking.filter((n) => n.gate).map((n) => [n.id, 0])),
      board: { at: 0, mult: 1, v: Object.fromEntries([].concat(Object.keys(B.ingredients), Object.keys(B.treatments), Object.keys(B.maturations)).map((k) => [k, 0])) },
      master: '',
      news: [], // diario de la colonia: últimos rasgos y especialidades que han desarrollado
      inbox: [], // novedades que contar al jugador al volver (rasgos que llegaron solos)
      lab: { job: null, dir: '', want: '', next: '', strains: false, found: null },
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
        wheels: 0, // Grand Wheels terminadas
        wheelLots: 0, // quesos que han dado (ya contados en lotsProduced)
        lotsSold: 0,
        coinsEarned: 0,
        coinsSpent: 0,
        goalCoins: 0,
        recipes: 0,
        nodesBought: 0,
        miceRecruited: 0,
        treatments: 0, // manías tratadas en la cama de la Mouse House
        retrains: 0, // especialidades reentrenadas
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
    const memo = CM.memo;
    if (memo) {
      const hit = memo.get('mods');
      if (hit && hit.rev === CM.rev && hit.src === s.nodes) return hit.get;
      const get = modsNow(s);
      memo.set('mods', { rev: CM.rev, src: s.nodes, get });
      return get;
    }
    return modsNow(s);
  }
  function modsNow(s) {
    let stamp = 0;
    // En enteros de 32 bits: con un número normal, pasadas unas diez mejoras el sello perdía
    // precisión y un rango nuevo de las últimas no se notaba hasta que cambiaba otra.
    for (const k in s.nodes) stamp = (Math.imul(stamp, 31) + s.nodes[k] * 131 + k.length) | 0;
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

  // Un ciclo no puede durar menos que este mínimo. Si las mejoras y el ratón lo
  // harían más corto, la velocidad que sobra se convierte en cantidad: así la
  // velocidad nunca deja de servir.
  const MIN_CYCLE_MS = 400;
  CM.cycle = (ms) => (ms >= MIN_CYCLE_MS ? { total: Math.round(ms), mult: 1 } : { total: MIN_CYCLE_MS, mult: MIN_CYCLE_MS / Math.max(1, ms) });

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
    // Cuánta experiencia da trabajar una zona: mejor base y más profundidad, más.
    zoneXp: (s, id) => Math.pow(B.bases[q.zoneDef(id).base].value / 10, B.xp.tierPower) * (1 + s.zones[id].depth * B.xp.depthBonus),
    baseXp: (base) => Math.pow(B.bases[base].value / 10, B.xp.tierPower),
    totalLevel: (s) => Object.keys(B.skills).reduce((a, k) => a + levelOf(s, k), 0),

    zoneDef: (id) => B.zones.find((z) => z.id === id),
    // La línea (zona) que produce una base.
    zoneOfBase: (base) => (B.zones.find((z) => z.base === base) || {}).id,
    // Quesos en stock de una base.
    lotsOfBase: (s, base) => s.recipes.reduce((a, r) => a + (r.key.split('+')[0] === base ? s.lots[r.id] || 0 : 0), 0),
    openZones: (s) => B.zones.filter((z) => s.zones[z.id].unlocked),
    veinHits: (s, id) => Math.round(q.zoneDef(id).hits * Math.pow(B.depth.hitsGrowth, s.zones[id].depth)),
    // Riqueza de la roca: cuanto más hondo, más vale el queso que sale de ella.
    // (Antes daba más Raw, que nadie podía gastar. Ahora picar y taladrar suben el valor de toda la línea.)
    // Compuesto: cada nivel cuesta un 15 % más de trabajo que el anterior, así que
    // su premio también se multiplica. Sumado, bajar más dejaba pronto de compensar.
    depthRich: (s, id) => Math.pow(1 + B.depth.richness + mods(s)('richDepth'), s.zones[id].depth),
    veinCapacity: (s, id) => Math.round(q.zoneDef(id).capacity * Math.pow(B.depth.capacityGrowth, s.zones[id].depth) * (1 + mods(s)('veinCap'))),

    rawTotal: (s) => sum(s.inv.raw),
    baseTotal: (s) => sum(s.inv.base),
    lotsTotal: (s) => sum(s.lots),
    // Todo lo guardado, para el aspecto del almacén (crece con lo que tienes).
    stockTotal: (s) => q.rawTotal(s) + q.baseTotal(s) + q.lotsTotal(s),

    pickPower: (s) => (B.mining.pickPower + mods(s)('pickPower')) * q.skillMult(s, 'mining'),
    critMult: (s) => B.mining.critMultiplier + mods(s)('critMult'),
    minerInterval: (s) => B.mining.minerIntervalMs / (1 + mods(s)('minerSpeed')),
    // Raw Cheese por ciclo en una zona (puede tener decimales; se acumulan).
    drillYield(s, id) {
      const m = mods(s);
      return (B.drill.yield + m('drillYield')) * (1 + m('drillRich')) * q.skillMult(s, 'drilling');
    },
    drillDuration: (s) => Math.max(300, Math.round(B.drill.durationMs / (1 + mods(s)('drillSpeed')))),
    cheeseBatch: (s) => B.cheesery.batch + mods(s)('cheeseBatch'),
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
    albumBonus: (s) => Object.keys(s.album).length * B.mice.albumPrice,
    priceMult(s) {
      const memo = CM.memo;
      const hit = memo && memo.get('pm');
      if (hit && hit.rev === CM.rev) return hit.v;
      const v = q.buyer(s).mult * (1 + mods(s)('price')) * q.skillMult(s, 'trading') * (1 + q.albumBonus(s));
      if (memo) memo.set('pm', { rev: CM.rev, v });
      return v;
    },
    offlineCapMs: (s) => (B.offline.baseHours + mods(s)('offlineHours')) * 3600000,
    // Automatización: un puesto trabaja solo si tiene un ratón asignado.
    auto: (s, skill, zone) => s.mice.some((m) => m.post === skill + ':' + (skill === 'trading' ? 'all' : zone)),
    // ¿Hay algún ratón en ese oficio, en cualquier línea?
    isAutomated: (s, skill) => s.mice.some((m) => m.post.split(':')[0] === skill),
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
    const seen = {};
    for (const m of s.mice) {
      if (!(m.xp >= 0)) bad.push(m.name + ' xp < 0');
      if (!B.mice.ranks[m.rank]) bad.push(m.name + ' bad rank');
      if (!m.post) continue;
      if (seen[m.post]) bad.push('two mice on ' + m.post);
      seen[m.post] = true;
      if (!CM.mice.posts(s).some((p) => p.key === m.post)) bad.push(m.name + ' on a post that does not exist: ' + m.post);
    }
    return bad;
  };
})();
