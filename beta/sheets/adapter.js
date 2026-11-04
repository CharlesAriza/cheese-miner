// CHEESE DRILLER · BETA · Lo que las piezas Pulido+ aprobadas esperan del juego, leído del núcleo real (core/).
// Solo traduce: no guarda nada, no calcula economía y nunca escribe en la partida; toda acción pasa por H.act (Core.act en la madre).
// Una colonia y una cadena: un puesto es «oficio:papel» (mining:picker), no «oficio:roca». CM.ui.state() da una vista de la partida con
// la forma que leen los módulos de dibujo; «line» es la única línea de CHEESE.
(function () {
  // Los temporizadores cortos de las animaciones aprobadas (25 fps) van con el refresco de la pantalla: un setInterval suelto cae a
  // destiempo y en el móvil se nota como tirones. Mismas funciones, mismo ritmo, sin tocar los módulos.
  const realSet = window.setInterval, realClear = window.clearInterval, slots = new Map(); let slotId = 1e6;
  window.setInterval = (fn, ms, ...a) => { if (!(ms <= 50)) return realSet(fn, ms, ...a); const id = slotId++; slots.set(id, { fn, ms, next: performance.now() + ms }); return id; };
  window.clearInterval = (id) => { if (!slots.delete(id)) realClear(id); };
  (function beat() {
    const now = performance.now();
    for (const q of slots.values()) if (now >= q.next - 2) { q.next = Math.max(q.next + q.ms, now + q.ms / 2); try { q.fn(); } catch (e) { console.error(e); } }
    requestAnimationFrame(beat);
  })();
  const H = (window.H = parent.BETA_HOST);
  const B = H.REAL, M = B.mice, T = M.traits, Core = H.Core, Cr = H.Cr, Lb = H.Lb, Mo = H.Mo, Ru = H.Ru;
  const G = () => H.G;
  CM.BALANCE = B;
  CM.fmt = H.fmt;
  CM.q = { visualTier: () => 0 };
  CM.sfx = { isMuted: () => true }; // la beta aún no tiene sonido
  const ST = ['mine', 'drill', 'refine', 'cheese', 'sell'];
  const SKILL = { mine: 'mining', drill: 'drilling', refine: 'refining', cheese: 'cheesemaking', sell: 'trading' };
  const STOF = { mining: 'mine', drilling: 'drill', refining: 'refine', cheesemaking: 'cheese', trading: 'sell' };
  const NAME = { mining: 'Mine', drilling: 'Drill', refining: 'Refine', cheesemaking: 'Cheese', trading: 'Sell', research: 'Lab' };
  CM.ST = ST; CM.SKILL = SKILL; CM.STOF = STOF;

  // ---- El arte de los ratones: la misma plantilla que MAIN 3.0 (la de la página madre) ----
  CM.m2mouse = (...a) => parent.CM.art.mouseCanvas(...a);
  const parts = (m) => { const n = (m.look || 0) >>> 0, r = m.rarity || 0; return { fur: r === 2 ? 9 : r === 1 ? 7 + (n % 2) : n % 7, hat: r === 2 ? 5 : (n >> 3) % 5, hatColor: (n >> 6) % 8, acc: (n >> 9) % 5, pack: (n >> 12) % 5, rarity: r }; };
  const HATC = [['#ffcf2e', '#d99a12'], ['#e2562a', '#9c2f14'], ['#4a8fe8', '#2b5cab'], ['#5fcf6a', '#2f8f44'], ['#9a5fd0', '#5f3590'], ['#ff7aa8', '#c44a78'], ['#f4f4f4', '#b9c0cf'], ['#3a3f52', '#1f2330']];
  const HATS = ['helmet', 'cap', 'beanie', 'tophat', 'bow'], FUR = ['white', 'grey', 'brown', 'cream', 'dark', 'peach', 'blue', 'mint', 'lilac', 'gold'], ACC = ['', 'glasses', 'patch', 'moustache', 'blush'];
  const lighten = (hex, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) + (255 - parseInt(hex.slice(i, i + 2), 16)) * k).toString(16).padStart(2, '0')).join('');
  CM.m2crew = (m, skill) => {
    if (!m) return null;
    const p = parts(m), hc = HATC[p.hatColor] || HATC[0], rk = Math.min(3, m.rank || 0);
    return { name: m.id + ':' + (m.look >>> 0) + ':' + rk + ':' + skill, id: m.id, lv: 1, rank: rk, rar: m.rarity || 0, skill, fur: FUR[p.fur] || 'white', pack: p.pack, hat: p.hat === 5 ? null : [HATS[p.hat] || 'cap', lighten(hc[0], 0.45), hc[0], hc[1]], acc: ACC[p.acc] || '' };
  };
  CM.m2part = (kind, i) => {
    const hc = HATC[0], c = { name: 'part:' + kind + ':' + i, id: '', lv: 1, rank: 0, rar: 0, skill: '', fur: 'white', pack: 0, hat: ['cap', lighten(hc[0], 0.45), hc[0], hc[1]], acc: '' };
    if (kind === 'fur') { c.fur = FUR[i] || 'white'; if (+i === 9) c.rar = 2; }
    if (kind === 'hat') { if (+i === 5) c.rar = 2; else c.hat = [HATS[i] || 'cap', lighten(hc[0], 0.45), hc[0], hc[1]]; }
    if (kind === 'acc') c.acc = ACC[i] || '';
    return c;
  };

  // ---- Ratones ----
  const postOf = (id) => { const w = Core.whereIs(G(), id); return !w ? '' : w.scene === 'main' ? SKILL[w.st] + ':' + w.role : w.scene === 'lab' ? 'research:all' : ''; };
  const wrap = (m) => Object.assign({}, m, { aff: m.aff || {}, spec: m.spec || {}, jobs: m.jobs || {}, traits: m.traits || [], learned: m.learned || [], picks: m.picks || 0, rank: m.rank || 0, post: postOf(m.id) });
  let cache = null, cacheAt = -1;
  const roster = () => { const n = H.rev(); if (!cache || cacheAt !== n) { cache = G().roster.map(wrap); cacheAt = n; } return cache; };
  const ctxOf = (st) => ({ depth: 0, away: false, mice: G().s.placed.length, recipes: G().lab.known.length, stationLevel: H.PARAMS.stationLevel, w: G().s.mods.w });
  const stSkill = (skill) => (skill === 'research' ? 'research' : STOF[skill]);
  // Por sí solo en un puesto: nivel, rango, rareza, afinidad, especialidad y rasgos, sin vecinos.
  function solo(m, skill, s, role) {
    const st = stSkill(skill), fn = skill === 'research' ? 'pr' : (postDef(st, role) || ['', 'pr'])[1], o = Cr.own(m, st, ctxOf(st)), W = Cr.work(m, st);
    return fn === 'rend' ? W * (1 + o.cant + o.dbl) : W * (1 + o.vel);
  }
  const postDef = (st, role) => (H.PARAMS.posts[st] ? (H.PARAMS.posts[st][G().s.stage[st] - 1] || []).find((x) => x[0] === role) : null);
  function here(s, m) {
    if (!m.post) return 1;
    const [skill, role] = m.post.split(':'), v = solo(m, skill, s, role);
    if (skill === 'research') return v;
    const t = G().s.team.eff[m.id];
    return !t ? v : (postDef(STOF[skill], role) || ['', 'pr'])[1] === 'rend' ? v + Cr.work(m, STOF[skill]) * (t.cant + t.dbl) : v + Cr.work(m, STOF[skill]) * t.vel;
  }
  function xpProgress(m) {
    const lv = Cr.level(m), g = M.xpGrowth, at = (l) => (M.xpBase * (Math.pow(g, l - 1) - 1)) / (g - 1);
    if (lv >= M.maxLevel) return { level: lv, cur: 0, need: 1, maxed: true };
    return { level: lv, cur: Math.max(0, m.xp - at(lv)), need: at(lv + 1) - at(lv), maxed: false };
  }
  const rankCost = (r) => Math.round(M.ranks[r].cost * H.PARAMS.s2.rankCostScale);
  function promoteInfo(s, m) {
    const next = M.ranks[m.rank + 1];
    if (!next) return { maxed: true };
    const lv = Cr.level(m), levelOk = lv >= next.level, cost = rankCost(m.rank + 1);
    return { maxed: false, next, cost, levelOk, levelsLeft: Math.max(0, next.level - lv), why: levelOk ? '' : 'level', can: levelOk && G().s.coins >= cost };
  }
  function promoteSteps(s, m) {
    const out = [], lv = Cr.level(m); let total = 0;
    for (let r = m.rank + 1; M.ranks[r] && lv >= M.ranks[r].level; r++) { total += rankCost(r); out.push({ rank: r, name: M.ranks[r].name, total }); }
    return out;
  }
  function promoteCost(s, sel) {
    let cost = 0, mice = 0, steps = 0;
    for (const m of roster()) { const to = sel[m.id]; if (!to) continue; const st = promoteSteps(s, m).find((x) => x.rank === to); if (!st) continue; cost += st.total; mice += 1; steps += to - m.rank; }
    return { cost, mice, steps };
  }
  function promotePicks(s, mode) {
    const out = {}; let left = G().s.coins;
    const list = roster().map((m) => ({ m, st: promoteSteps(s, m) })).filter((x) => x.st.length).sort((a, b) => a.st[0].total - b.st[0].total);
    for (const { m, st } of list) {
      if (mode === 'all') { out[m.id] = st[st.length - 1].rank; continue; }
      let best = null; for (const x of st) if (x.total <= left) best = x;
      if (best) { out[m.id] = best.rank; left -= best.total; }
    }
    return out;
  }
  const ROLE = H.ROLE;
  function posts() {
    const out = [];
    for (const st of ST) { if (st !== 'mine' && !G().s.built[st]) continue; for (const [role, fn] of H.PARAMS.posts[st][G().s.stage[st] - 1]) out.push({ key: SKILL[st] + ':' + role, skill: SKILL[st], zone: role, st, role, fn }); }
    if (G().lab.nodes.assistant) out.push({ key: 'research:all', skill: 'research', zone: 'all', st: 'lab', role: 'researcher', fn: 'pr' });
    return out;
  }
  const at = (s, skill, zone) => {
    if (zone === 'line' || (zone === 'all' && skill !== 'research')) { const p = G().s.placed.find((q) => q.st === STOF[skill] && q.fn === 'pr'); return p ? roster().find((m) => m.id === p.m.id) || null : null; } // BOOSTS mira la estación
    if (skill === 'research') return roster().find((m) => m.id === G().lab.workers[0]) || null;
    const p = G().s.placed.find((q) => q.st === STOF[skill] && q.role === zone);
    return p ? roster().find((m) => m.id === p.m.id) || null : null;
  };
  const JOBS = ['mining', 'drilling', 'refining', 'cheesemaking', 'trading', 'research'];
  const jobTraits = (job) => Object.keys(T).filter((k) => T[k].job === job);
  // El álbum: todo lo coleccionable (mismas categorías que el juego). Lo que se ha encontrado lo guarda el núcleo (c.album).
  const FUR_N = ['White', 'Grey', 'Brown', 'Cream', 'Charcoal', 'Peach', 'Blue', 'Mint', 'Lilac', 'Golden'], HAT_N = ['Helmet', 'Cap', 'Beanie', 'Top hat', 'Bow', 'Bare head'], ACC_N = ['None', 'Glasses', 'Eye patch', 'Moustache', 'Blush'];
  const idsOf = (k) => Object.keys(T).filter((x) => T[x].kind === k);
  const tItems = (kind, r) => idsOf(kind).map((id) => ({ key: 'trait:' + id, name: T[id].name, desc: T[id].desc + (T[id].job ? ' (' + B.skills[T[id].job].name + ')' : ''), rarity: r || 0 }));
  const ALBUM = [
    { kind: 'fur', title: 'FURS', items: FUR_N.map((name, i) => ({ key: 'fur:' + i, name, rarity: i === 9 ? 2 : i >= 7 ? 1 : 0 })) },
    { kind: 'hat', title: 'HATS', items: HAT_N.map((name, i) => ({ key: 'hat:' + i, name, rarity: i === 5 ? 2 : 0 })) },
    { kind: 'acc', title: 'ACCESSORIES', items: ACC_N.map((name, i) => ({ key: 'acc:' + i, name, rarity: 0 })).slice(1) },
    { kind: 'trait', title: 'TRAITS', items: tItems('good') },
    { kind: 'trait', title: 'QUIRKS', items: tItems('quirk') },
    { kind: 'trait', title: 'JOB TRAITS', items: tItems('job') },
    { kind: 'trait', title: 'LEGENDARY TRAITS', items: tItems('legend', 2) },
    { kind: 'combo', title: 'COMBOS', items: M.combos.map((c) => ({ key: 'combo:' + c.id, name: c.name, desc: c.needs.map((id) => T[id].name).join(' + ') + ': ' + c.desc, rarity: 0 })) },
  ];
  const ALBUM_KEYS = {}; ALBUM.forEach((cat) => cat.items.forEach((it) => (ALBUM_KEYS[it.key] = 1)));
  CM.mice = {
    JOBS, CHAIN: JOBS, ALBUM, albumTotal: Object.keys(ALBUM_KEYS).length, albumCount: () => Object.keys(G().album).filter((k) => ALBUM_KEYS[k]).length,
    parts, byId: (s, id) => roster().find((m) => m.id === id) || null, normalize: (c) => wrap(Object.assign({ xp: 0, rank: 0 }, c)), level: Cr.level, xpProgress,
    traitsOf: Cr.traitsOf, combosOf: Cr.combosOf, gradeOf: Cr.gradeOf, postKey: (k, z) => k + ':' + z, at, posts,
    postLabel: (key) => { const [k, z] = key.split(':'); return k === 'research' ? 'the lab' : NAME[k] + ' · ' + (ROLE[z] || z); },
    solo, here, speed: solo, promoteInfo, promoteSteps, promoteCost, promotePicks,
    recruitCost: () => Ru.recruitCost(G()),
    careCost: (s, kind) => { const c = M.care; return Math.round((kind === 'spec' ? c.retrainCost : c.treatCost) * Math.pow(c.growth, G().totals[kind === 'spec' ? 'retrains' : 'treatments'])); },
    retrainOptions: (m, job) => (m.spec[job] ? jobTraits(job).filter((k) => k !== m.spec[job]) : []),
    jobTraits,
  };
  CM.milestones = {
    has: (s, id) => !!G().ms[id],
    master: () => roster().find((m) => m.id === G().masterId) || null,
    // Grado de Grand Master: el primero a 20.000 hornadas, otro cada vez que se doblan (REAL).
    masterGrade: (m) => { const n = (m.jobs && m.jobs.cheesemaking) || 0, f = B.milestones.master.from; let g = 0, need = f; while (n >= need) { g += 1; need *= 2; } return g; },
    masterNext: (g) => B.milestones.master.from * Math.pow(2, g),
    boardFamilies: () => ({}),
  };

  // ---- Recetas ----
  const parseKey = (key) => { if (!key) return null; const [base, ingredient, treatment, maturation] = key.split('+'); return { base, ingredient, treatment, maturation }; };
  const keyOf = (c) => c.base + '+' + c.ingredient + '+' + c.treatment + '+' + c.maturation;
  const defaultName = H.recipeName;
  const strainOf = (key) => { const a = G().s.strains; return (a && (a.of[key] || a.style[key.slice(0, key.indexOf('+'))])) || ''; };
  const recipeOf = (key) => ({ id: key, key, name: defaultName(key), made: (G().s.mastery && G().s.mastery[key]) || G().s.made[key] || 0, strain: strainOf(key), strains: Lb.strainsFor(G(), key) });
  const TABLES = { base: 'bases', ingredient: 'ingredients', treatment: 'treatments', maturation: 'maturations' };
  const labWaiting = () => {
    const L = G().lab; if (L.job) return null;
    const q = L.queue[0]; if (!q || (q.kind !== 'recipe' && q.kind !== 'strain')) return null;
    const need = Lb.labCost(G()), have = G().s.inv.base;
    const coin = q.kind === 'recipe' ? Mo.formula(q.key).coin : 0;
    return { have, need, coin, queued: true, base: q.key.slice(0, q.key.indexOf('+')), name: defaultName(q.key), strain: q.kind === 'strain' };
  };
  CM.cheesery = {
    TABLES, PARTS: ['base', 'ingredient', 'treatment', 'maturation'], parseKey, keyOf, defaultName,
    recipe: (s, id) => (id && G().lab.isKnown[id] ? recipeOf(id) : null), recipeByKey: (s, key) => (key && G().lab.isKnown[key] ? recipeOf(key) : null),
    totalCombos: () => Lb.totalRecipes(), labWorker: () => Lb.worker(G()), labWaiting, labDir: () => G().lab.dir, labHas: (s, id) => !!G().lab.nodes[id],
    strainsOpen: () => !!G().lab.nodes.strains, strainTarget: () => { const t = Lb.strainTarget(G()); return t ? { key: t.key || t } : null; }, labPick: () => { const k = Lb.pick(G(), G().lab.dir || 'value'); return k ? parseKey(k) : null; },
    labCost: () => Lb.labCost(G()), labTime: () => Lb.labTime(G(), H.tier()), potential: (s, r) => Lb.potential(G(), r.key), valueOf: (s, r) => Mo.formula(r.key).value,
    tierOf: (v) => { let t = B.tiers[0].name; for (const x of B.tiers) if (v >= x.min) t = x.name; return t; },
    masteryLevel: (r) => Mo.mastery(G().s, r.key) - 1, formula: (c) => { const f = Mo.formula(keyOf(c)), syn = B.synergies.filter((y) => Object.keys(y.when).every((p) => c[p] === y.when[p])).map((y) => y.name || ''); return { value: f.value, synergies: syn.filter(Boolean) }; },
    baseUse: (r) => { const pm = Mo.productMods(G().s, r.key); return B.cheesery.lotBase * (pm && pm.base ? pm.base : 1); },
    jobTime: (s, c, r) => { const key = keyOf(c), f = Mo.formula(key), pm = Mo.productMods(G().s, key), mt = Math.max(0.3, 1 - B.cheesery.masteryTime * (Mo.mastery(G().s, key) - 1)); return Math.max(300, Math.round(f.timeMs * mt * G().s.mods.cheese.time * (pm && pm.time ? pm.time : 1))); },
    partLocked: (s, part, id) => (part === 'base' ? !Lb.styleOpen(G(), id) : B[TABLES[part]][id].level > G().stLv.cheese),
    unlockedBases: () => Object.keys(G().lab.styles).filter((b) => G().lab.styles[b]),
    shopPrice: (r) => Mo.price(G().s, r.key),
  };

  // ---- Refuerzos: un puesto de BOOSTS es una estación ----
  const stOfKey = (sk) => STOF[sk];
  CM.boosts = {
    at: (s, sk) => G().boosts.place[stOfKey(sk)] || 0, owned: () => G().boosts.earned, free: () => G().boosts.earned - Ru.placedBoosts(G()),
    label: (sk, n) => H.boLabel(stOfKey(sk), n),
    next: () => { const id = E2N.nextBoost(); return id ? { kind: 'rock', id } : null; },
  };
  const E2N = { nextBoost: () => { for (let n = 1; n < 20; n++) { const id = 'boost.' + n; if (!H.Pg.has(id)) return null; if (!H.Pg.isOpen(G(), id)) return id; } return null; } };
  CM.boostNext = () => { const id = E2N.nextBoost(); if (!id) return ''; const q = H.Pg.status(G(), id).requires.filter((r) => !r.ok); return q.map((r) => r.text).join(' · '); };

  // ---- Tienda y ventas: lo cobrado de verdad en los últimos minutos, por queso ----
  CM.shop = { price: (s, r) => Mo.price(G().s, r.key) };
  CM.telemetry = { rates: H.salesRates };

  // ---- Vista de la partida para los módulos de dibujo ----
  const zone = {};
  // Siempre el mismo objeto para la misma hornada: pulido-cheesery.js decide que ha acabado una cuando deja de serlo.
  let jobSrc = null, jobView = null;
  const job = () => {
    const j = G().s.job.cheese;
    if (!j) { jobSrc = jobView = null; return null; }
    if (j !== jobSrc) { jobSrc = j; jobView = { recipeId: j.key }; }
    jobView.remaining = Math.max(0, j.end - G().s.t); jobView.total = j.total; jobView.per = j.per;
    return jobView;
  };
  Object.defineProperty(zone, 'cookJob', { get: job });
  Object.defineProperty(zone, 'wheelMs', { get: () => G().s.wheelMs || 0 });
  const labJob = () => {
    const j = G().lab.job; if (!j) return null;
    const key = j.key || (j.style ? Mo.recipeKey(j.style) : Mo.recipeKey(H.tier()));
    return { key, kind: j.kind, strain: j.kind === 'strain' ? j.strain : '', retried: j.retried, remaining: j.remaining, total: j.total, source: j.source, style: j.style, id: j.id };
  };
  const lab = { };
  Object.defineProperty(lab, 'job', { get: labJob });
  Object.defineProperty(lab, 'dir', { get: () => G().lab.dir });
  Object.defineProperty(lab, 'next', { get: () => { const q = G().lab.queue[G().lab.job ? 0 : 1] || null; return q && q.key ? q.key : null; } });
  Object.defineProperty(lab, 'found', { get: () => CM.uiState.found || null });
  const state = {
    zones: { line: zone }, lab, nodes: {}, inv: {}, settings: {}, built: {},
    get mice() { return roster(); }, get coins() { return G().s.coins; },
    get candidates() { return G().cands; }, get candidatesFor() { const f = G().candsFor; return !f || !f.st ? '' : f.st === 'lab' ? 'research:all' : SKILL[f.st] + ':' + f.role; },
    get care() { return G().care; }, get news() { return H.newsList(); }, get album() { return G().album; },
    get master() { return G().masterId; },
    get recipes() { return G().lab.known.map(recipeOf); }, get lots() { return G().s.lots; },
    get boosts() { return Array.from({ length: Ru.placedBoosts(G()) }); },
    get board() { return null; },
  };
  Object.defineProperty(state.nodes, 'cheesemaking.master', { get: () => (G().ms.master ? 1 : 0), enumerable: true });
  Object.defineProperty(state.settings, 'managersBuy', { get: () => G().settings.managersBuy });
  Object.defineProperty(state.built, 'shop', { get: () => !!G().s.built.sell });
  Object.defineProperty(state.built, 'lab', { get: () => !!G().lab.built });
  Object.defineProperty(state.built, 'house', { get: () => !!G().built.house });
  Object.defineProperty(state.built, 'cheesery', { get: () => !!G().s.built.cheese });
  Object.defineProperty(state.inv, 'raw', { get: () => ({ line: G().s.inv.raw }) });
  Object.defineProperty(state.inv, 'base', { get: () => { const o = {}; o[H.tier()] = G().s.inv.base; return o; } });
  CM.viewState = state;
})();
