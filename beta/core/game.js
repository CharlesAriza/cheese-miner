// CHEESE DRILLER · BETA · La partida: acciones con respuesta, eventos para la interfaz y avance del tiempo.
// La interfaz solo habla con esto. Cada acción dice qué ha pasado: { ok: true, ... } o { ok: false, reason }, y si falla no ha
// cobrado ni cambiado nada. El tiempo lo pone quien llama (nunca se lee el reloj aquí): misma semilla y mismas acciones, misma
// partida. El motor es por eventos y la progresión avanza en una rejilla fija de 20 s, así que trocear el tiempo no cambia nada.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.game = (function () {
  const Mo = () => E2.model, Ru = () => E2.rules, C = () => E2.crew, Lb = () => E2.lab, Inv = () => E2.inventory, Pg = () => E2.progression, R = () => E2.REAL, P = () => E2.PARAMS;
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell'], GRID = 20000, H = 3600000;
  const OK = (x) => Object.assign({ ok: true }, x || {}), NO = (reason) => ({ ok: false, reason });
  // Rutinarios: uno por ciclo. Con el juego cerrado nadie los mira, y son los primeros que se tiran si la cola se llena.
  const ROUTINE = { hit: 1, drillStart: 1, drillDone: 1, refineStart: 1, refineDone: 1, cheeseStart: 1, lotDone: 1, sellStart: 1, sale: 1, item: 1 };
  const NEWS = { trait: 1, specialty: 1, careDone: 1, recruited: 1 };
  const OUT_MAX = 2000, NEWS_MAX = 40, LOG_MAX = 200, VEINS_MAX = 50, MINUTES_MAX = 120;

  // ---------- Configuración ----------
  const plain = (v) => v && typeof v === 'object' && !Array.isArray(v);
  function merge(a, b) { const out = Object.assign({}, a); for (const k of Object.keys(b || {})) out[k] = plain(a[k]) && plain(b[k]) ? merge(a[k], b[k]) : b[k]; return out; }
  // Una sola configuración: la baseline más los datos de la beta. `extra` es solo para pruebas.
  function setup(extra) {
    E2.REAL = E2.REAL || CM.BALANCE;
    E2.PARAMS = JSON.parse(JSON.stringify(merge(merge(E2.BASELINE, E2.BETA_DATA), extra || {})), (k, v) => (v === 'Inf' ? Infinity : v));
  }

  // ---------- Crear ----------
  function create(opts) {
    if (!E2.PARAMS || !E2.PARAMS.items) setup();
    const c = Ru().create({ seed: (opts && opts.seed) || 1, profile: null });
    Object.assign(c, { gated: true, built: { house: false }, settings: { managersBuy: true }, lamp: 0, unlocked: {}, seen: {}, goals: {}, album: {}, news: [], inbox: [], care: null, cands: [], candsFor: '', totals: { retrains: 0, treatments: 0 }, modsT: 0, offJob: null });
    Lb().ensure(c);
    c.s.m.minutes = {}; // en el juego solo se guardan los últimos minutos
    attach(c);
    Ru().applyMods(c);
    settleNow(c);
    return c;
  }
  // Lo que no se guarda: la cola de eventos y el enlace del motor con su partida.
  function attach(c) { c.s.q = []; c.out = []; Object.defineProperty(c.s, 'game', { value: c, enumerable: false, configurable: true }); }
  // Durante el arranque, lo nuevo se comprueba en el momento exacto en que se termina un trabajo (no a trozos de 20 s): hacer 10 RAW
  // anuncia la Refinería al instante. Al ser la hora del evento, no depende de cómo se trocee el tiempo. Después basta con la rejilla.
  const MILESTONE = { reveal: 1, drillDone: 1, refineDone: 1, lotDone: 1, sale: 1 };
  const emit = (s, type, data) => {
    if (!s.q) return;
    if (!(s.muted && ROUTINE[type])) s.q.push(Object.assign({ type, t: s.t }, data));
    if (MILESTONE[type] && s.game && s.game.goals.allAuto == null) checkOpen(s.game);
  };

  // ---------- Avanzar ----------
  function pump(c) {
    const s = c.s, q = s.q;
    if (!q.length) return;
    for (const e of q) {
      if (NEWS[e.type]) { c.news.push(e); if (c.news.length > NEWS_MAX) c.news.shift(); }
      if (s.muted && !ROUTINE[e.type]) c.inbox.push(e); // el resumen de vuelta
      if (e.type === 'trait' || e.type === 'specialty') { const m = c.roster.find((x) => x.id === e.id); if (m) record(c, m); }
      if (!s.muted) c.out.push(e);
    }
    q.length = 0;
    if (c.out.length > OUT_MAX) c.out = c.out.filter((e) => !ROUTINE[e.type]).slice(-OUT_MAX);
  }
  function trim(c) {
    const m = c.s.m;
    if (m.veins.length > VEINS_MAX) m.veins.splice(0, m.veins.length - VEINS_MAX);
    if (c.log.length > LOG_MAX) c.log.splice(0, c.log.length - LOG_MAX);
    const keys = Object.keys(m.minutes);
    if (keys.length > MINUTES_MAX) for (const k of keys.slice(0, keys.length - MINUTES_MAX)) delete m.minutes[k];
  }
  // Abre lo que toque y cumple objetivos. Un toque solo necesita esto, para que lo nuevo se anuncie en cuanto ocurre.
  function checkOpen(c) {
    const s = c.s;
    if (Pg().refresh(c)) Ru().awardBoosts(c);
    for (const g of E2.ROADMAP.goals) if (c.goals[g.id] == null && g.requires.every((q) => Pg().met(c, q))) {
      c.goals[g.id] = s.t;
      const reward = (R().goalRewards && R().goalRewards[g.id]) || 0;
      if (reward) { s.coins += reward; s.coinsStart += reward; }
      Ru().note(c, 'goal', { id: g.id, text: g.text, reward });
    }
  }
  // Además aplica efectos: después de cada compra y de cada paso de la rejilla.
  function settleNow(c) {
    checkOpen(c);
    Ru().applyMods(c);
    c.modsT = c.s.t;
    pump(c);
  }
  function tick(c) {
    Ru().settle(c);
    Lb().tick(c, GRID);
    careTick(c, GRID);
    if (c.settings.managersBuy) Ru().managers(c);
    settleNow(c);
    trim(c);
  }
  function advance(c, ms) {
    const s = c.s, T = s.t + Math.floor(ms);
    while (s.t < T) {
      const nextGrid = (Math.floor(s.t / GRID) + 1) * GRID, t1 = Math.min(T, nextGrid);
      Mo().advance(s, t1);
      if (s.t === nextGrid) tick(c);
    }
    pump(c);
    return c;
  }
  const drain = (c) => { pump(c); const o = c.out; c.out = []; return o; };

  // ---------- Offline: la misma simulación, con el tope REAL y a trozos ----------
  const lampNode = () => R().trees.colony.find((n) => n.id === 'lamp');
  const capMs = (c) => (R().offline.baseHours + lampNode().eff.offlineHours * c.lamp) * H;
  function offlineStart(c, awayMs) {
    if (c.offJob) return c.offJob;
    if (!(awayMs >= R().offline.minMs)) return null;
    const s = c.s, ms = Math.min(Math.floor(awayMs), capMs(c));
    c.offJob = { total: ms, left: ms, lost: Math.max(0, Math.floor(awayMs) - ms), from: { coins: s.m.coins, raw: s.m.raw, base: s.m.base, lots: s.m.lotsMade, depth: s.depth, recipes: c.lab.known.length, items: JSON.parse(JSON.stringify(s.matMade || {})) } };
    enterAway(c);
    return c.offJob;
  }
  function enterAway(c) { const s = c.s; s.muted = true; Mo().setAway(s, true); Ru().applyMods(c); c.modsT = s.t; }
  // Avanza como mucho `budget` ms de partida. Devuelve lo que falta. Guardar a medias conserva el resto.
  function offlineRun(c, budget) {
    const J = c.offJob;
    if (!J) return 0;
    const step = Math.min(J.left, budget == null ? J.left : budget);
    advance(c, step);
    J.left -= step;
    return J.left;
  }
  function offlineEnd(c) {
    const J = c.offJob;
    if (!J) return null;
    if (J.left > 0) offlineRun(c);
    const s = c.s, f = J.from, items = {};
    for (const k of Object.keys(s.matMade || {})) { const d = s.matMade[k] - (f.items[k] || 0); if (d > 0) items[k] = d; }
    s.muted = false; Mo().setAway(s, false); Ru().applyMods(c); c.modsT = s.t;
    c.offJob = null;
    const summary = { ms: J.total, lost: J.lost, coins: s.m.coins - f.coins, raw: s.m.raw - f.raw, base: s.m.base - f.base, lots: s.m.lotsMade - f.lots, depth: s.depth - f.depth, recipes: c.lab.known.length - f.recipes, items, notes: c.inbox };
    c.inbox = [];
    return summary;
  }

  // ---------- Ratones fuera de la cadena: dónde está cada uno y el álbum ----------
  // Dónde está un ratón no se guarda: se deduce de su puesto. Sin puesto, en HOUSE. Así no puede estar en dos sitios.
  function whereIs(c, id) {
    const p = c.s.placed.find((x) => x.m.id === id);
    if (p) return { scene: 'main', st: p.st, role: p.role, fn: p.fn };
    if (c.lab.workers.includes(id)) return { scene: 'lab', post: 'research' };
    return c.roster.some((m) => m.id === id) ? { scene: 'house' } : null;
  }
  const unassigned = (c) => c.roster.filter((m) => whereIs(c, m.id).scene === 'house');
  function record(c, m) {
    const M = R().mice, n = (m.look || 0) >>> 0, r = m.rarity || 0, has = {}, keys = [];
    keys.push('fur:' + (r === 2 ? 9 : r === 1 ? 7 + (n % 2) : n % 7), 'hat:' + (r === 2 ? 5 : (n >> 3) % 5));
    if ((n >> 9) % 5) keys.push('acc:' + ((n >> 9) % 5));
    for (const t of C().traitsOf(m)) { keys.push('trait:' + t.id); has[t.id] = true; }
    for (const k of M.combos || []) if (k.needs.every((id) => has[id])) keys.push('combo:' + k.id);
    for (const k of keys) if (!c.album[k]) { c.album[k] = c.s.t + 1; Ru().note(c, 'album', { key: k }); }
  }
  // ---------- La cama (REAL: mice.js). Una sola plaza; sigue trabajando mientras tanto (D3). El RETRAIN se sortea al empezar. ----------
  const jobTraits = (job) => { const T = R().mice.traits; return Object.keys(T).filter((k) => T[k].job === job); };
  function careTick(c, dt) {
    const K = c.care;
    if (!K) return;
    const m = c.roster.find((x) => x.id === K.id);
    if (!m) { c.care = null; return; }
    K.remaining -= dt;
    if (K.remaining > 0) return;
    c.care = null;
    if (K.kind === 'quirk') { m.traits = m.traits.filter((t) => t !== K.what); m.learned = m.learned.filter((t) => t !== K.what); }
    else if (m.spec[K.what]) m.spec[K.what] = K.to;
    Mo().place(c.s, c.s.placed);
    Ru().note(c, 'careDone', { id: m.id, kind: K.kind, what: K.what, to: K.to, from: K.from });
    record(c, m);
  }

  // ---------- Qué se puede comprar ahora ----------
  // Las reglas de siempre (rules.js, lab.js), ya filtradas por la tabla de progresión.
  function options(c) {
    return Ru().options(c).filter((o) => o.kind !== 'labhire').concat(lampOptions(c));
  }
  function lampOptions(c) {
    const n = lampNode();
    return c.built.house && c.lamp < n.max ? [{ kind: 'lamp', cost: Math.round(n.cost * Math.pow(n.growth, c.lamp)) }] : [];
  }
  const buyOption = (c, match) => {
    const o = options(c).find(match);
    if (!o) return NO('locked');
    if (c.s.coins < o.cost) return NO('no-coins');
    return Ru().buy(c, o) ? OK({ cost: o.cost }) : NO('refused');
  };
  const postsOf = (c, st) => P().posts[st][c.s.stage[st] - 1].map(([role, fn]) => ({ st, role, fn, mouse: (c.s.placed.find((p) => p.st === st && p.role === role) || { m: { id: null } }).m.id }));
  const emptyPosts = (c) => [].concat(...ST.filter((st) => c.s.built[st] !== false || st === 'mine').map((st) => postsOf(c, st).filter((p) => !p.mouse)));
  function removeFromPosts(c, id) {
    const s = c.s, n = s.placed.length;
    Mo().place(s, s.placed.filter((p) => p.m.id !== id));
    c.lab.workers = c.lab.workers.filter((x) => x !== id);
    return n !== s.placed.length;
  }
  const NAMES = () => R().mice.names || [];

  // ---------- Acciones ----------
  const ACTIONS = {
    tap(c, a) {
      const s = c.s, st = a.st;
      if (!ST.includes(st)) return NO('invalid');
      if (st !== 'mine' && !s.built[st]) return NO('not-built');
      const r = Mo().tap(s, st);
      return r ? OK() : NO('idle');
    },
    build(c, a) {
      const id = a.id, g = 'build.' + id;
      if (!Pg().has(g)) return NO('invalid');
      if (!Pg().isOpen(c, g)) return NO('locked');
      if (id === 'house') { if (c.built.house) return NO('built'); c.built.house = true; }
      else if (id === 'lab') { if (c.lab.built) return NO('built'); c.lab.built = true; }
      else { if (c.s.built[id]) return NO('built'); c.s.built[id] = true; }
      Ru().ev(c, 'built_' + id); Ru().note(c, 'built', { id });
      return OK();
    },
    // Reclutar: se paga al pedir los tres; recargar no cambia quién sale. forPost: { st, role } si se recluta desde una vacante.
    recruitOffer(c, a) {
      if (!c.built.house) return NO('no-house');
      if (!c.cands.length) {
        const cost = Ru().recruitCost(c);
        if (c.s.coins < cost) return NO('no-coins');
        c.s.coins -= cost; c.s.coinsStart -= cost; c.spent.recruit += cost; c.recruited += 1;
        const taken = c.roster.map((m) => m.name), free = NAMES().filter((n) => !taken.includes(n));
        c.cands = Ru().candidates(c);
        for (const k of c.cands) { k.name = free.length ? free.splice(Math.floor(c.rng() * free.length), 1)[0] : 'Mouse ' + k.id; }
        Ru().log(c, 'recruit', cost);
      }
      c.candsFor = a && a.forPost ? a.forPost : '';
      return OK({ candidates: c.cands });
    },
    // Contratar y colocar son dos decisiones: sin vacante pedida, el ratón llega sin puesto.
    recruitChoose(c, a) {
      const k = c.cands[a.index];
      if (!k) return NO('invalid');
      c.roster.push(k); c.cands = [];
      const want = c.candsFor; c.candsFor = '';
      if (c.recruited === 1) Ru().ev(c, 'firstMouse');
      if (k.rarity === 2) Ru().ev(c, 'firstLegendary');
      record(c, k);
      Ru().note(c, 'recruited', { id: k.id, name: k.name });
      if (want) ACTIONS.assign(c, { id: k.id, st: want.st, role: want.role });
      return OK({ id: k.id });
    },
    // Colocar en un puesto de estación, o en el del laboratorio con st: 'lab'. Si estaba ocupado, el otro queda sin puesto.
    assign(c, a) {
      const s = c.s, m = c.roster.find((x) => x.id === a.id);
      if (!m) return NO('invalid');
      if (a.st === 'lab') {
        if (!c.lab.nodes.assistant) return NO('locked');
        const old = c.lab.workers[0];
        removeFromPosts(c, m.id);
        c.lab.workers = [m.id];
        if (old && old !== m.id) Ru().note(c, 'unassigned', { id: old });
        Ru().ev(c, 'labWorker');
        return OK();
      }
      const post = ST.includes(a.st) && (s.built[a.st] !== false || a.st === 'mine') ? postsOf(c, a.st).find((p) => p.role === a.role) : null;
      if (!post) return NO('invalid');
      removeFromPosts(c, m.id);
      Mo().place(s, s.placed.filter((p) => !(p.st === a.st && p.role === a.role)).concat([{ m, st: a.st, fn: post.fn, role: a.role }]));
      if (post.fn === 'pr') Ru().ev(c, 'auto_' + a.st);
      if (ST.every((st) => s.placed.some((p) => p.st === st && p.fn === 'pr'))) Ru().ev(c, 'chainAutomated');
      return OK();
    },
    unassign(c, a) { return removeFromPosts(c, a.id) || c.roster.some((m) => m.id === a.id) ? OK() : NO('invalid'); },
    // Despido voluntario, sin reembolso. El precio de reclutar no baja. Limpia todas las referencias al ratón.
    dismiss(c, a) {
      const i = c.roster.findIndex((m) => m.id === a.id);
      if (i < 0) return NO('invalid');
      removeFromPosts(c, a.id);
      c.roster.splice(i, 1);
      if (c.care && c.care.id === a.id) c.care = null;
      if (c.masterId === a.id) c.masterId = null;
      Ru().note(c, 'dismissed', { id: a.id });
      return OK();
    },
    promote(c, a) { return buyOption(c, (o) => o.kind === 'promote' && o.m.id === a.id); },
    fund(c, a) { return buyOption(c, (o) => o.kind === 'fund' && o.st === a.st && o.f.id === a.id); },
    phase(c, a) { return buyOption(c, (o) => o.kind === 'phase' && o.st === a.st); },
    // Comprar el siguiente paso de un camino (fk = 'mine.search', opt = 'prospector'). El primero elige camino.
    path(c, a) { return buyOption(c, (o) => o.kind === 'path' && o.fk === a.fk && o.opt === a.opt); },
    switchPath(c, a) {
      const owned = c.active[a.fk];
      if (!owned) return NO('locked');
      return Ru().switchPath(c, a.fk, a.opt) ? OK() : NO('same');
    },
    milestone(c, a) { return buyOption(c, (o) => o.kind === 'milestone' && o.id === a.id); },
    setMaster(c, a) {
      if (!c.ms.master) return NO('locked');
      if (!c.roster.some((m) => m.id === a.id)) return NO('invalid');
      c.masterId = a.id;
      return OK();
    },
    boostPlace(c, a) {
      const b = c.boosts;
      if (!ST.includes(a.st)) return NO('invalid');
      if (b.place[a.st] >= 2) return NO('full');
      if (Ru().placedBoosts(c) + Ru().slotCost(a.st) > b.earned) return NO('none-free');
      b.place[a.st] += 1; b.moves += 1;
      return OK();
    },
    boostRemove(c, a) {
      if (!ST.includes(a.st) || !c.boosts.place[a.st]) return NO('invalid');
      c.boosts.place[a.st] -= 1; c.boosts.moves += 1;
      return OK();
    },
    lamp(c) {
      const o = lampOptions(c)[0];
      if (!o) return NO('locked');
      if (c.s.coins < o.cost) return NO('no-coins');
      c.s.coins -= o.cost; c.s.coinsStart -= o.cost; c.spent.lamp = (c.spent.lamp || 0) + o.cost; c.lamp += 1;
      Ru().log(c, 'lamp:' + c.lamp, o.cost);
      return OK({ cost: o.cost });
    },
    // ---- LAB ----
    labNode(c, a) { return buyOption(c, (o) => o.kind === 'labnode' && o.id === a.id); },
    labRank(c, a) { return buyOption(c, (o) => o.kind === 'labrank' && o.id === a.id); },
    labPhase(c) { return buyOption(c, (o) => o.kind === 'labphase'); },
    // Encargar a mano una receta concreta (o la mejor de la dirección). Se paga al empezar, como en el juego.
    labResearch(c, a) {
      const L = Lb(), key = a && a.key ? a.key : L.pick(c, 'value');
      if (!key || c.lab.isKnown[key] || !L.styleOpen(c, key.slice(0, key.indexOf('+'))) || !L.partsOpen(c, key)) return NO('invalid');
      if (!c.s.built.cheese) return NO('not-built');
      return L.enqueue(c, { kind: 'recipe', key }, 'research:hand:' + key) ? OK({ key }) : NO('queue-full');
    },
    labDir(c, a) {
      if (!c.lab.nodes.advanced) return NO('locked');
      if (a.dir === 'strain' && !c.lab.nodes.strains) return NO('locked');
      c.lab.dir = a.dir;
      return OK();
    },
    labStudy(c, a) {
      const L = Lb(), st = a.style, t = { kind: 'study', style: st };
      if (!Pg().has('study.' + st) || !Pg().isOpen(c, 'study.' + st)) return NO('locked');
      if (c.lab.styles[st] || (c.lab.job && c.lab.job.style === st) || c.lab.queue.some((q) => q.style === st)) return NO('done');
      if (!L.afford(c, t)) return NO('no-materials');
      if (c.lab.queue.length >= L.queueCap(c)) return NO('queue-full');
      c.lab.queue.unshift(t);
      Ru().log(c, 'research:study:' + st, 0);
      return OK();
    },
    labBlueprint(c, a) {
      const L = Lb(), t = { kind: 'blueprint', id: a.id };
      if (!L.bpDef(a.id) || !Pg().has('plan.' + a.id) || !Pg().isOpen(c, 'plan.' + a.id)) return NO('locked');
      const lab = c.lab;
      if (lab.blueprints[a.id] || (lab.job && lab.job.id === a.id) || (lab.bpJob && lab.bpJob.id === a.id) || lab.queue.some((q) => q.id === a.id) || (lab.bpQueue || []).some((q) => q.id === a.id)) return NO('done');
      if (!L.afford(c, t)) return NO('no-materials');
      (lab.bpQueue = lab.bpQueue || []).push(t);
      Ru().log(c, 'blueprint:' + a.id, 0);
      return OK();
    },
    recipePin(c, a) {
      if (a.key && !c.lab.isKnown[a.key]) return NO('invalid');
      c.lab.pin = a.key || null;
      if (a.key) c.s.recipe = a.key;
      return OK();
    },
    strain(c, a) {
      const L = Lb();
      if (a.id && !L.strainsFor(c, a.key).includes(a.id)) return NO('invalid');
      return L.setStrain(c, a.key, a.id) ? OK() : NO('same');
    },
    // ---- La cama ----
    care(c, a) {
      const m = c.roster.find((x) => x.id === a.id), M = R().mice, T = M.traits;
      if (!m || !c.built.house) return NO('invalid');
      if (c.care) return NO('bed-busy');
      if (a.kind === 'quirk') { if (!T[a.what] || T[a.what].kind !== 'quirk' || !m.traits.concat(m.learned).includes(a.what)) return NO('invalid'); }
      else if (a.kind === 'spec') { if (!m.spec[a.what] || jobTraits(a.what).filter((k) => k !== m.spec[a.what]).length < 1) return NO('invalid'); }
      else return NO('invalid');
      const key = a.kind === 'spec' ? 'retrains' : 'treatments', cost = Math.round((a.kind === 'spec' ? M.care.retrainCost : M.care.treatCost) * Math.pow(M.care.growth, c.totals[key]));
      if (c.s.coins < cost) return NO('no-coins');
      c.s.coins -= cost; c.s.coinsStart -= cost; c.spent.care = (c.spent.care || 0) + cost; c.totals[key] += 1;
      let to = '';
      if (a.kind === 'spec') { const o = jobTraits(a.what).filter((k) => k !== m.spec[a.what]); to = o[Math.min(o.length - 1, Math.floor(c.rng() * o.length))]; }
      c.care = { id: m.id, kind: a.kind, what: a.what, to, from: a.kind === 'spec' ? m.spec[a.what] : '', remaining: M.care.ms, total: M.care.ms };
      return OK({ cost });
    },
    setting(c, a) { if (!(a.key in c.settings)) return NO('invalid'); c.settings[a.key] = !!a.value; return OK(); },
    seen(c, a) { c.seen[a.id] = c.s.t; return OK(); },
  };
  // Toda acción entra por aquí: falle o no, deja la partida coherente.
  function act(c, type, args) {
    const f = ACTIONS[type];
    if (!f) return NO('unknown-action');
    const res = f(c, args || {});
    if (res.ok && type === 'tap') { checkOpen(c); pump(c); }
    else if (res.ok && type !== 'seen') settleNow(c);
    else pump(c);
    return res;
  }

  // ---------- Consultas para la interfaz ----------
  function view(c) {
    const s = c.s;
    return {
      t: s.t, coins: s.coins, raw: s.inv.raw, base: s.inv.base, lots: Mo().lotsTotal(s), depth: s.depth, stratum: Mo().stratumOf(s.depth).id,
      vein: { open: s.vein.open, found: s.vein.found, need: s.vein.need, left: s.vein.left, cap: s.vein.cap },
      stations: ST.map((st) => ({ st, built: st === 'mine' || !!s.built[st], level: c.stLv[st], phase: c.phase[st], auto: !!s.rates[st].auto, boosts: c.boosts.place[st], job: s.job[st] ? { end: s.job[st].end, total: s.job[st].total } : null, posts: postsOf(c, st) })),
      recipe: s.recipe, recipes: c.lab.known.length, boostsFree: c.boosts.earned - Ru().placedBoosts(c), mice: c.roster.length, unassigned: unassigned(c).map((m) => m.id), goal: nextGoal(c), offlineCapMs: capMs(c),
    };
  }
  const nextGoal = (c) => { for (const g of E2.ROADMAP.goals) if (c.goals[g.id] == null) return { id: g.id, text: g.text, requires: g.requires.map((q) => Pg().explain(c, q)) }; return null; };
  // Lo que gasta materiales hoy: para qué sirve cada uno se calcula de aquí.
  E2.inventory.registerConsumer((c) => {
    const L = Lb(), out = [];
    for (const st of P().strata) { const need = L.studyNeed(st.id); if (need && st.id !== 'cheddar') for (const k of Object.keys(need)) out.push({ item: k, n: need[k], system: 'lab', what: 'study:' + st.id, unlock: 'study.' + st.id }); }
    for (const id of Object.keys((P().s3.lab && P().s3.lab.blueprints) || {})) { const need = L.bpNeed(id); for (const k of Object.keys(need || {})) out.push({ item: k, n: need[k], system: 'materials', what: 'blueprint:' + id, unlock: 'plan.' + id }); }
    return out;
  });

  Mo().hooks.emit = emit;
  return { setup, create, attach, advance, drain, act, options, view, whereIs, unassigned, emptyPosts, postsOf, capMs, offlineStart, offlineRun, offlineEnd, enterAway, ACTIONS, GRID };
})();
