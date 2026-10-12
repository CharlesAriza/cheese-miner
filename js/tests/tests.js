// Pruebas de los sistemas críticos. Abre tests.html para ejecutarlas.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const STEP = B.sim.stepMs;
  const results = [];
  const notes = [];

  function test(name, fn) {
    CM.events.length = 0;
    try {
      fn();
      results.push({ name, ok: true });
    } catch (e) {
      results.push({ name, ok: false, error: e.message });
    }
  }
  function eq(actual, expected, label) {
    if (actual !== expected) throw new Error((label || 'value') + ': expected ' + expected + ', got ' + actual);
  }
  function truthy(v, label) {
    if (!v) throw new Error(label + ': expected truthy');
  }
  function valid(s) {
    const bad = CM.validate(s);
    if (bad.length) throw new Error('invariants broken: ' + bad.join('; '));
  }

  const fresh = () => CM.createState(1000000);
  const run = (s, ms) => CM.sim.advance(s, ms, STEP);
  const node = (s, key, rank) => (s.nodes[key] = rank);
  // Pica despacio (sin combo) hasta revelar la veta de una zona.
  function reveal(s, zone) {
    const id = zone || 'cheddar';
    for (let guard = 0; CM.mining.status(s, id) === 'ready' && guard < 100000; guard++) {
      CM.mining.hit(s, id, 'manual');
      run(s, 1000);
    }
  }
  // Partida con taladro y refinería construidos sobre una veta revelada.
  function withChain() {
    const s = fresh();
    reveal(s);
    CM.construction.build(s, 'drill');
    for (let i = 0; i < 6; i++) {
      CM.drilling.tap(s, 'cheddar');
      run(s, q.drillDuration(s));
    }
    truthy(CM.construction.build(s, 'refinery').ok, 'refinery builds after enough raw');
    return s;
  }
  // Pone un ratón sin rasgos en un puesto: rinde exactamente igual que una acción manual.
  function staff(s, skill, zone, extra) {
    const m = CM.mice.normalize(Object.assign({ id: 'm' + s.nextId++, name: 'Test' + s.nextId, traits: [], aff: {}, look: 4242, rarity: 0, xp: 0, rank: 0, post: CM.mice.postKey(skill, zone || 'cheddar'), rest: false }, extra || {}));
    s.mice.push(m);
    return m;
  }
  const COMBO = { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' };
  // Partida con una receta descubierta, un queso y la tienda construida.
  function withCheese() {
    const s = withChain();
    s.inv.base.cheddar = 10;
    s.totals.baseProduced = 10;
    eq(CM.construction.build(s, 'cheesery').ok, true, 'build cheesery');
    eq(CM.cheesery.experiment(s, COMBO).ok, true, 'experiment');
    run(s, CM.cheesery.jobTime(s, COMBO, null));
    eq(CM.construction.build(s, 'shop').ok, true, 'build shop');
    run(s, STEP);
    return s;
  }

  test('mining reveals veins and never gives cheese or coins', () => {
    const s = fresh();
    const need = q.veinHits(s, 'cheddar');
    for (let i = 0; i < need - 1; i++) {
      CM.mining.hit(s, 'cheddar', 'manual');
      run(s, 1000);
    }
    eq(s.zones.cheddar.veinRevealed, false, 'not revealed yet');
    eq(q.rawTotal(s) + q.baseTotal(s) + s.coins, 0, 'resources before reveal');
    CM.mining.hit(s, 'cheddar', 'manual');
    eq(s.zones.cheddar.veinRevealed, true, 'revealed');
    eq(q.rawTotal(s) + q.baseTotal(s) + s.coins, 0, 'resources after reveal');
    eq(CM.mining.hit(s, 'cheddar', 'manual').reason, 'vein-exposed', 'mining an exposed vein');
    truthy(s.skills.mining.xp > 0, 'mining gives experience');
  });

  test('drill needs a vein; one cycle gives raw once and consumes the vein', () => {
    const s = fresh();
    eq(CM.construction.build(s, 'drill').reason, 'locked', 'drill before vein');
    s.built.drill = true;
    eq(CM.drilling.tap(s, 'cheddar').reason, 'no-vein', 'drill without vein');
    reveal(s);
    const cap = s.zones.cheddar.veinRemaining;
    eq(CM.drilling.tap(s, 'cheddar').ok, true, 'start');
    const amount = s.zones.cheddar.drillJob.amount;
    eq(q.rawTotal(s), 0, 'raw during cycle');
    run(s, q.drillDuration(s));
    eq(q.rawTotal(s), amount, 'raw after cycle');
    eq(s.zones.cheddar.veinRemaining, cap - amount, 'vein');
    run(s, 60000);
    eq(q.rawTotal(s), amount, 'raw does not grow without a driller');
    valid(s);
  });

  test('refinery needs raw cheese; consumes input and gives output once', () => {
    const s = fresh();
    s.built.refinery = true;
    eq(CM.refining.tap(s, 'cheddar').reason, 'no-raw', 'no raw');
    s.inv.raw.cheddar = 5;
    eq(CM.refining.tap(s, 'cheddar').ok, true, 'start');
    const job = Object.assign({}, s.zones.cheddar.refJob);
    eq(s.inv.raw.cheddar, 5 - job.used, 'raw consumed at start');
    eq(q.baseTotal(s), 0, 'base during cycle');
    run(s, q.refineDuration(s));
    eq(s.inv.base.cheddar, job.amount, 'base after cycle');
    run(s, 60000);
    eq(s.inv.base.cheddar, job.amount, 'base does not grow without a refiner');
    valid(s);
  });

  test('no storage caps: stock piles up per cheese type and nothing ever stops for space', () => {
    const s = withChain();
    s.coins = B.zones[1].unlockCost;
    CM.zones.unlock(s, 'gouda');
    for (const z of ['cheddar', 'gouda']) {
      staff(s, 'mining', z);
      staff(s, 'drilling', z);
    }
    run(s, 30 * 60 * 1000);
    truthy(s.inv.raw.cheddar > 100, 'cheddar raw keeps piling up (' + s.inv.raw.cheddar + ')');
    truthy(s.inv.raw.gouda > 0, 'gouda raw is tracked on its own (' + s.inv.raw.gouda + ')');
    eq(s.inv.raw.cheddar + s.inv.raw.gouda + s.totals.rawConsumed, s.totals.rawProduced, 'every raw cheese is accounted for');
    truthy(['running', 'ready', 'no-vein'].indexOf(CM.drilling.status(s, 'cheddar')) >= 0, 'the drill only ever waits for a vein');
    valid(s);
  });

  test('rocks never run out: an empty vein digs deeper, harder and richer', () => {
    const s = withChain();
    staff(s, 'drilling');
    staff(s, 'refining');
    const hits0 = q.veinHits(s, 'cheddar');
    const yield0 = q.drillYield(s, 'cheddar');
    const cap0 = q.veinCapacity(s, 'cheddar');
    const before = s.totals.rawProduced + s.zones.cheddar.veinRemaining;
    for (let guard = 0; s.zones.cheddar.depth === 0 && guard < 2000; guard++) {
      s.inv.raw.cheddar = 0;
      s.inv.base.cheddar = 0;
      run(s, 3000);
    }
    eq(s.zones.cheddar.depth, 1, 'depth');
    eq(s.totals.rawProduced, before, 'the whole vein was extracted exactly once');
    eq(CM.mining.status(s, 'cheddar'), 'ready', 'mining is possible again');
    eq(CM.drilling.status(s, 'cheddar'), 'no-vein', 'drill waits for the next vein');
    truthy(q.veinHits(s, 'cheddar') > hits0, 'deeper veins are harder to find');
    truthy(q.veinCapacity(s, 'cheddar') > cap0, 'deeper veins are bigger');
    truthy(q.drillYield(s, 'cheddar') > yield0, 'deeper veins are richer');
    valid(s);
  });

  test('zones add up: every open rock is mined and drilled at the same time', () => {
    const s = withChain();
    s.coins = B.zones[1].unlockCost;
    eq(CM.zones.unlock(s, 'blue').reason, 'locked', 'zones open in order');
    eq(CM.zones.unlock(s, 'gouda').ok, true, 'open gouda');
    eq(s.zones.cheddar.unlocked, true, 'cheddar is still there');
    for (const z of ['cheddar', 'gouda']) {
      staff(s, 'mining', z);
      staff(s, 'drilling', z);
    }
    run(s, 10 * 60 * 1000);
    truthy(s.inv.raw.cheddar > 0 && s.inv.raw.gouda > 0, 'both rocks produced raw');
    truthy(s.zones.gouda.depth > 0 || s.zones.gouda.veinRevealed || s.zones.gouda.discover > 0, 'gouda progressed on its own');
    valid(s);
  });

  test('upgrading does not automate; a mouse on the post does', () => {
    const s = withChain();
    s.coins = 1e6;
    s.skills.drilling.xp = q.xpForLevel(10);
    const y = q.drillYield(s, 'cheddar');
    eq(CM.tree.buy(s, 'drilling', 'bit').ok, true, 'buy Bigger Bit');
    truthy(q.drillYield(s, 'cheddar') > y, 'more yield');
    eq(q.auto(s, 'drilling', 'cheddar'), false, 'not automated');
    s.inv.raw.cheddar = 0;
    run(s, 30000);
    eq(q.rawTotal(s), 0, 'no production without a mouse');
    const d = q.drillDuration(s);
    staff(s, 'drilling');
    eq(q.auto(s, 'drilling', 'cheddar'), true, 'automated');
    eq(q.auto(s, 'drilling', 'gouda'), false, 'only on its own rock');
    eq(q.drillDuration(s), d, 'the machine itself is unchanged');
    run(s, d * 3);
    truthy(s.totals.rawProduced > 0 && q.rawTotal(s) > 0, 'the mouse works alone');
    valid(s);
  });

  test('mice: recruiting, candidates that survive a reload, and auto-placement', () => {
    const s = withCheese();
    eq(CM.mice.offer(s).reason, 'no-house', 'needs the Mouse House');
    s.totals.nodesBought = 1;
    eq(CM.construction.nextReady(s), 'house', 'house offered after the first upgrade');
    CM.construction.build(s, 'house');
    eq(CM.mice.offer(s).reason, 'no-coins', 'needs coins');
    const cost = CM.mice.recruitCost(s);
    s.coins = cost + 5;
    eq(CM.mice.offer(s).ok, true, 'pay');
    eq(s.coins, 5, 'paid once');
    eq(s.candidates.length, B.mice.candidates, 'three candidates');
    eq(CM.mice.offer(s).ok, true, 'offering again does not charge again');
    eq(s.coins, 5, 'still paid once');
    const reloaded = CM.storage.parse(JSON.stringify(s), 1);
    eq(JSON.stringify(reloaded.candidates), JSON.stringify(s.candidates), 'reloading does not reroll the candidates');
    for (const c of s.candidates) {
      truthy(B.mice.traits[c.traits[0]].good && (c.rarity === 2 ? B.mice.traits[c.traits[1]].good && c.traits[1] !== c.traits[0] : !B.mice.traits[c.traits[1]].good), 'one good trait and one quirk (a legendary: two good traits)');
      truthy(Object.keys(c.aff).length >= 1 && Object.keys(c.aff).every((k) => CM.skills.list.indexOf(k) >= 0 && (c.aff[k] === 1 || c.aff[k] === 2)), 'likes at least one job');
    }
    const picked = s.candidates[1].name;
    eq(CM.mice.choose(s, 1).ok, true, 'choose');
    eq(s.mice.length, 1, 'one mouse');
    eq(s.mice[0].name, picked, 'the one chosen');
    eq(s.candidates.length, 0, 'candidates cleared');
    eq(s.mice[0].post, 'trading:all', 'placed on the first post by priority: the shop');
    truthy(CM.mice.recruitCost(s) > cost, 'the next one costs more');
    valid(s);
  });

  test('mice: traits, favourite job, levels and promotion change how they work', () => {
    const s = withChain();
    const plain = staff(s, 'drilling');
    const base = CM.mice.speed(plain, 'drilling');
    eq(base, 1, 'a plain level 1 mouse works at normal speed');
    truthy(CM.mice.speed(Object.assign({}, plain, { traits: ['fast'] }), 'drilling') > base, 'Fast is faster');
    truthy(CM.mice.speed(Object.assign({}, plain, { traits: ['dreamer'] }), 'drilling') < base, 'Dreamer is slower');
    truthy(CM.mice.speed(Object.assign({}, plain, { aff: { drilling: 2 } }), 'drilling') > CM.mice.speed(Object.assign({}, plain, { aff: { drilling: 1 } }), 'drilling') && CM.mice.speed(Object.assign({}, plain, { aff: { drilling: 1 } }), 'drilling') > base, 'loving a job is faster than liking it, and liking it than nothing');
    eq(B.mice.ranks[3].manager, true, 'the last rank is the manager');
    eq(CM.mice.speed(Object.assign({}, plain, { aff: { refining: 2 } }), 'drilling'), base, 'only in that job');
    truthy(CM.mice.yieldMult(Object.assign({}, plain, { traits: ['strong'] })) > 1, 'Strong makes more');
    truthy(CM.mice.yieldMult(Object.assign({}, plain, { traits: ['glutton'] })) < 1, 'Glutton makes less');
    const night = Object.assign({}, plain, { traits: ['nocturnal'] });
    eq(CM.mice.speed(night, 'drilling'), base, 'Nocturnal is normal while you play');
    CM.away = true;
    truthy(CM.mice.speed(night, 'drilling') > base, 'Nocturnal is faster while away');
    truthy(CM.mice.speed(Object.assign({}, plain, { traits: ['homebody'] }), 'drilling') < base, 'Homebody is slower while away');
    CM.away = false;
    // Trabajar da experiencia al ratón y, con nivel, va más rápido.
    s.inv.raw.cheddar = 0;
    run(s, 5 * 60 * 1000);
    truthy(plain.xp > 0 && CM.mice.level(plain) > 1, 'working levels the mouse up (' + CM.mice.level(plain) + ')');
    truthy(CM.mice.speed(plain, 'drilling') > base, 'a higher level is faster');
    // Ascender pide nivel y monedas.
    eq(CM.mice.promote(s, plain.id).reason, CM.mice.level(plain) >= 10 ? 'no-coins' : 'mouse-level', 'promotion gated');
    plain.xp = 1e6;
    s.coins = B.mice.ranks[1].cost - 1;
    eq(CM.mice.promote(s, plain.id).reason, 'no-coins', 'needs coins');
    s.coins = B.mice.ranks[1].cost;
    const before = CM.mice.speed(plain, 'drilling');
    eq(CM.mice.promote(s, plain.id).ok, true, 'promote');
    eq(s.coins, 0, 'paid');
    eq(plain.rank, 1, 'rank');
    truthy(CM.mice.speed(plain, 'drilling') > before, 'a promoted mouse is faster');
    valid(s);
  });

  test('mice: moving, swapping, resting and best fit', () => {
    const s = withCheese();
    s.built.house = true;
    const a = staff(s, 'drilling');
    const b = staff(s, 'refining');
    eq(CM.mice.assign(s, a.id, 'refining:cheddar').ok, true, 'move onto an occupied post');
    eq(a.post, 'refining:cheddar', 'moved');
    eq(b.post, 'drilling:cheddar', 'the other one swapped');
    eq(CM.mice.assign(s, a.id, 'drilling:blue').reason, 'invalid', 'a post on a closed rock does not exist');
    eq(CM.mice.assign(s, a.id, '').ok, true, 'send home');
    eq(a.post, '', 'resting');
    run(s, 5000);
    eq(a.post, '', 'a mouse sent home stays home');
    const c = staff(s, 'mining');
    c.post = '';
    run(s, 5000);
    truthy(c.post !== '', 'a new idle mouse takes a free post on its own');
    // Best fit: cada puesto, por prioridad, se lleva al mejor que quede.
    a.aff = { trading: 2 };
    b.aff = { drilling: 2 };
    c.aff = { refining: 2 };
    CM.mice.bestFit(s);
    eq(a.post, 'trading:all', 'the trader goes to the shop');
    eq(b.post, 'drilling:cheddar', 'the driller to the drill');
    eq(c.post, 'refining:cheddar', 'the refiner to the refinery');
    valid(s);
  });

  test('mice: a manager buys upgrades for its job, only if allowed', () => {
    const s = withChain();
    const m = staff(s, 'drilling', 'cheddar', { rank: 3 });
    s.coins = 100;
    run(s, 4000);
    truthy((s.nodes['drilling.bit'] || 0) > 0, 'the manager bought drilling upgrades');
    eq(s.nodes['refining.vat'], undefined, 'only for its own job');
    const t = withChain();
    staff(t, 'drilling', 'cheddar', { rank: 3 });
    t.settings.managersBuy = false;
    t.coins = 100;
    run(t, 4000);
    eq(Object.keys(t.nodes).length, 0, 'with the option off it buys nothing');
    eq(m.rank, 3, 'still a manager');
  });

  test('skill levels: experience curve, level gates and buy-all', () => {
    const s = fresh();
    eq(q.level(s, 'mining'), 1, 'starts at level 1');
    s.skills.mining.xp = q.xpForLevel(2) - 0.5;
    eq(q.level(s, 'mining'), 1, 'just below level 2');
    s.skills.mining.xp = q.xpForLevel(2);
    eq(q.level(s, 'mining'), 2, 'exactly level 2');
    for (let l = 2; l < 99; l++) truthy(q.xpForLevel(l + 1) - q.xpForLevel(l) > q.xpForLevel(l) - q.xpForLevel(l - 1), 'each level costs more (' + l + ')');
    s.skills.mining.xp = 1e15;
    eq(q.level(s, 'mining'), 99, 'capped at 99');
    const t = fresh();
    t.coins = 1e6;
    eq(CM.tree.buy(t, 'mining', 'swing').reason, 'level-locked', 'node gated by level');
    t.coins = 5;
    eq(CM.tree.buy(t, 'mining', 'pick').reason, 'no-coins', 'node needs coins');
    t.coins = 100;
    const power = q.pickPower(t);
    const r = CM.tree.buyAll(t, 'mining');
    truthy(r.ok && r.bought >= 2, 'buy-all bought several ranks');
    truthy(q.pickPower(t) > power, 'effect applied');
    truthy(t.coins >= 0 && t.coins < CM.tree.cost(t, 'mining', 'pick'), 'stopped when nothing else was affordable');
    truthy(CM.tree.cost(t, 'mining', 'pick') > B.trees.mining[0].cost, 'cost grows with rank');
    valid(t);
  });

  test('offline: only automated stages progress, capped, counted once', () => {
    const a = fresh();
    CM.mining.hit(a, 'cheddar', 'manual');
    a.lastSavedAt = 0;
    const sumA = CM.sim.applyOffline(a, 10 * 60 * 1000);
    truthy(a.zones.cheddar.discover <= q.pickPower(a), 'no miner: discovery unchanged');
    eq(sumA.automated, false, 'summary says not automated');

    const b = fresh();
    staff(b, 'mining');
    b.lastSavedAt = 0;
    const xp = b.skills.mining.xp;
    CM.sim.applyOffline(b, 5 * 60 * 1000);
    truthy(b.totals.veinsFound >= 1, 'miner found a vein offline');
    truthy(b.skills.mining.xp > xp, 'experience is earned offline');
    eq(q.rawTotal(b), 0, 'miner extracted nothing');
    eq(CM.sim.applyOffline(b, 5 * 60 * 1000), null, 'second call does nothing');

    const c = fresh();
    staff(c, 'mining');
    c.lastSavedAt = 0;
    const sumC = CM.sim.applyOffline(c, q.offlineCapMs(c) * 3);
    eq(sumC.simulatedMs, B.offline.baseHours * 3600000, 'capped');
    eq(c.clock, sumC.simulatedMs, 'clock advanced by the cap only');
    node(c, 'colony.lamp', 2);
    eq(q.offlineCapMs(c), (B.offline.baseHours + 4) * 3600000, 'Night Lamp extends the cap');
  });

  test('rapid taps, reload mid-cycle and double sale never duplicate', () => {
    const s = withChain();
    s.inv.raw.cheddar = 0;
    CM.drilling.tap(s, 'cheddar');
    const amount = s.zones.cheddar.drillJob.amount;
    for (let i = 0; i < 100; i++) CM.drilling.tap(s, 'cheddar');
    run(s, STEP);
    eq(q.rawTotal(s), amount, 'one cycle despite 100 taps');

    s.inv.raw.cheddar = 4;
    CM.refining.tap(s, 'cheddar');
    run(s, 1000);
    const text = JSON.stringify(s);
    for (const copy of [CM.storage.parse(text, 2000000), CM.storage.parse(text, 2000000)]) {
      run(copy, 60000);
      eq(copy.inv.base.cheddar, s.zones.cheddar.refJob.amount, 'reloaded cycle pays once');
      eq(copy.inv.raw.cheddar, s.inv.raw.cheddar, 'reloaded cycle consumed once');
    }

    const m = withCheese();
    const recipe = m.recipes[0];
    const coins = m.coins;
    const price = CM.shop.price(m, recipe);
    eq(CM.shop.tap(m).ok, true, 'start selling');
    eq(m.lots[recipe.id], 0, 'cheese leaves the shelf at once');
    for (let i = 0; i < 50; i++) CM.shop.tap(m);
    run(m, STEP);
    eq(m.coins, coins + price + B.goalRewards.sale, 'paid exactly once (plus the first-sale goal reward)');
    eq(m.totals.lotsSold, 1, 'one cheese sold');
    eq(CM.shop.tap(m).reason, 'no-cheese', 'nothing left to sell');
    valid(m);
  });

  test('recipes: discovery, level-locked parts, rename, production and persistence', () => {
    const s = withCheese();
    const recipe = s.recipes[0];
    eq(s.lots[recipe.id], 1, 'the experiment gives one cheese');
    eq(CM.cheesery.experiment(s, COMBO).reason, 'known', 're-experimenting a known recipe');
    eq(CM.cheesery.experiment(s, Object.assign({}, COMBO, { ingredient: 'truffle' })).reason, 'part-locked', 'truffle needs level');
    eq(CM.cheesery.experiment(s, Object.assign({}, COMBO, { base: 'gouda' })).reason, 'part-locked', 'gouda needs its zone');
    eq(CM.cheesery.rename(s, recipe.id, '  Abuela   Special  ').ok, true, 'rename');
    const base = s.inv.base.cheddar;
    eq(CM.cheesery.produce(s, recipe.id, 2).ok, true, 'produce');
    eq(s.inv.base.cheddar, base - 2 * B.cheesery.lotBase, 'base consumed');
    eq(CM.cheesery.produce(s, recipe.id, 1).reason, 'busy', 'one job at a time in a line');
    run(s, CM.cheesery.jobTime(s, COMBO, recipe));
    eq(s.lots[recipe.id], 2, 'first cheese delivered');
    const loaded = CM.storage.parse(JSON.stringify(s), 3000000);
    eq(loaded.recipes[0].name, 'Abuela Special', 'name persisted');
    run(loaded, CM.cheesery.jobTime(loaded, COMBO, loaded.recipes[0]));
    eq(loaded.lots[recipe.id], 3, 'queued cheese finishes after reload');
    eq(loaded.zones.cheddar.cookJob, null, 'job done');
    valid(loaded);
  });

  test('lines run in parallel: a rare cheese is refined and cooked while a common one piles up', () => {
    const s = withCheese();
    s.coins = B.zones[1].unlockCost;
    CM.zones.unlock(s, 'gouda');
    s.inv.raw.cheddar = 5000;
    s.inv.raw.gouda = 8;
    s.inv.base.gouda = 3;
    staff(s, 'refining', 'cheddar');
    staff(s, 'refining', 'gouda');
    run(s, q.refineDuration(s) * 2);
    truthy(s.inv.base.gouda >= 3 + 4, 'gouda was refined although cheddar has far more raw (' + s.inv.base.gouda + ')');
    truthy(s.zones.cheddar.stats.base > 0, 'cheddar was refined at the same time');
    eq(s.inv.raw.gouda, 0, 'all the gouda raw was used');
    // Dos encargos a la vez, uno por línea.
    s.skills.cheesemaking.xp = q.xpForLevel(1);
    eq(CM.cheesery.experiment(s, Object.assign({}, COMBO, { base: 'gouda' })).ok, true, 'experiment on the gouda line');
    eq(CM.cheesery.produce(s, s.recipes[0].id, 1).ok, true, 'cheddar line cooks at the same time');
    truthy(s.zones.gouda.cookJob && s.zones.cheddar.cookJob, 'both lines are busy');
    run(s, 30000);
    eq(s.recipes.length, 2, 'gouda recipe discovered');
    const gouda = s.recipes[1];
    // Una receta por queso para el Cheesemaker.
    staff(s, 'cheesemaking', 'cheddar');
    staff(s, 'cheesemaking', 'gouda');
    CM.cheesery.assign(s, s.recipes[0].id);
    CM.cheesery.assign(s, gouda.id);
    eq(s.zones.cheddar.cookRecipe, s.recipes[0].id, 'cheddar line recipe');
    eq(s.zones.gouda.cookRecipe, gouda.id, 'gouda line recipe');
    const before = [s.lots[s.recipes[0].id], s.lots[gouda.id]];
    run(s, 60000);
    truthy(s.lots[s.recipes[0].id] > before[0] && s.lots[gouda.id] > before[1], 'both cheeses are cooked on their own');
    eq(CM.cheesery.status(s, 'blue'), 'locked', 'a closed rock has no line');
    eq(q.lotsOfBase(s, 'gouda'), s.lots[gouda.id], 'cheese counted per base');
    valid(s);
  });

  test('chain buildings wait for the player, in order; the cheesemaker picks the most valuable recipe', () => {
    const s = fresh();
    eq(CM.construction.nextReady(s), null, 'nothing to build at the start');
    reveal(s);
    run(s, 60000);
    eq(s.built.drill, false, 'nothing is built on its own');
    eq(CM.construction.nextReady(s), 'drill', 'the drill is offered once a vein is found');
    CM.construction.build(s, 'drill');
    eq(CM.construction.nextReady(s), null, 'the refinery waits for raw cheese');
    while (s.totals.rawProduced < B.buildings.refinery.requires.min) {
      if (CM.mining.status(s, 'cheddar') === 'ready') reveal(s);
      CM.drilling.tap(s, 'cheddar');
      run(s, q.drillDuration(s));
    }
    eq(CM.construction.nextReady(s), 'refinery', 'then the refinery is offered');
    const t = withCheese();
    truthy(t.built.cheesery && t.built.shop, 'cheesery and shop built');
    t.skills.cheesemaking.xp = q.xpForLevel(3);
    t.inv.base.cheddar = 3;
    eq(CM.cheesery.experiment(t, Object.assign({}, COMBO, { treatment: 'smoked' })).ok, true, 'second recipe');
    run(t, 30000);
    const better = t.recipes[1];
    truthy(CM.cheesery.valueOf(t, better) > CM.cheesery.valueOf(t, t.recipes[0]), 'the smoked one is worth more');
    staff(t, 'cheesemaking');
    eq(CM.cheesery.laneRecipe(t, 'cheddar').id, better.id, 'unpinned: picks the most valuable');
    CM.cheesery.assign(t, t.recipes[0].id);
    eq(CM.cheesery.laneRecipe(t, 'cheddar').id, t.recipes[0].id, 'pinned: cooks what you chose');
    CM.cheesery.unassign(t, 'cheddar');
    t.inv.base.cheddar = 4;
    const had = t.lots[better.id];
    run(t, 60000);
    eq(t.lots[better.id], had + 2, 'cooked the best recipe on its own');
    eq(CM.cheesery.status(t, 'cheddar'), 'no-base', 'then waits for base');
  });

  test('cheese value: formula, synergies, mastery, cellar and trading level', () => {
    const f = CM.cheesery.formula({ base: 'cheddar', ingredient: 'pepper', treatment: 'smoked', maturation: 'aged' });
    eq(f.value, Math.round(10 * 1.3 * 1.35 * 1.6 * 1.2 * 1.15), 'formula with two synergies');
    eq(f.synergies.length, 2, 'synergies');
    eq(CM.cheesery.tierOf(5), 'Common', 'tier');
    eq(CM.cheesery.tierOf(3000), 'Legendary', 'tier');
    const s = withCheese();
    const recipe = s.recipes[0];
    const v0 = CM.cheesery.valueOf(s, recipe);
    const t0 = CM.cheesery.jobTime(s, COMBO, recipe);
    recipe.made = B.cheesery.masteryAt[2];
    eq(CM.cheesery.masteryLevel(recipe), 3, 'mastery level');
    truthy(CM.cheesery.valueOf(s, recipe) > v0, 'mastery adds value');
    truthy(CM.cheesery.jobTime(s, COMBO, recipe) < t0, 'mastery is faster');
    const v1 = CM.cheesery.valueOf(s, recipe);
    node(s, 'cheesemaking.cellar', 5);
    truthy(CM.cheesery.valueOf(s, recipe) > v1, 'cellar adds value');
    const p0 = CM.shop.price(s, recipe);
    s.skills.trading.xp = q.xpForLevel(10);
    eq(q.buyer(s).name, 'Restaurants', 'better buyers at trading level 10');
    truthy(CM.shop.price(s, recipe) > p0 * 1.4, 'better buyers pay more');
    eq(CM.cheesery.totalCombos(), 3 * 4 * 3 * 3, 'recipe space');
  });

  test('cheesemaker and shopkeeper run the end of the chain on their own, within limits', () => {
    const s = withCheese();
    const recipe = s.recipes[0];
    staff(s, 'cheesemaking');
    s.inv.base.cheddar = 5;
    run(s, 60000);
    eq(s.lots[recipe.id], 3, 'with no recipe pinned it cooks the best one it knows: 2 cheeses from 4 of the 5 base');
    eq(CM.cheesery.assign(s, 'nope').reason, 'unknown-recipe', 'bad recipe');
    eq(CM.cheesery.assign(s, recipe.id).ok, true, 'pin a recipe');
    eq(CM.cheesery.status(s, 'cheddar'), 'no-base', 'stops without base');
    s.inv.base.cheddar = 41;
    run(s, 30 * 60 * 1000);
    eq(s.lots[recipe.id], 3 + 20, 'cooks every pair of base it has, with no cheese cap');
    eq(s.inv.base.cheddar, 1, 'only the odd base is left');
    eq(s.totals.lotsSold, 0, 'the cheesemaker never sells');
    staff(s, 'trading');
    const coins = s.coins;
    run(s, 60000);
    truthy(s.totals.lotsSold > 0 && s.coins > coins, 'the shopkeeper sells on its own');
    truthy(s.skills.trading.xp > 0 && s.skills.cheesemaking.xp > 0, 'both skills earn experience');
    eq(CM.storage.parse(JSON.stringify(s), 1).zones.cheddar.cookRecipe, recipe.id, 'assignment persists');
    valid(s);
  });

  test('automation waits only for what it is missing, never for space', () => {
    const s = withChain();
    staff(s, 'refining');
    s.inv.raw.cheddar = 9;
    run(s, 10 * 60 * 1000);
    eq(s.inv.raw.cheddar, 1, 'refined every pair of raw');
    eq(CM.refining.status(s, 'cheddar'), 'no-raw', 'then waits for raw');
    eq(s.totals.baseProduced, s.inv.base.cheddar, 'all the base is in stock');
    valid(s);
  });

  test('mice: dismissing, best-fit preview and why a mouse cannot be promoted', () => {
    const s = fresh();
    CM.dev.unlockBuildings(s);
    s.devUsed = false;
    const a = staff(s, 'drilling', 'cheddar');
    const b = staff(s, 'refining', 'cheddar', { aff: { drilling: 2 } });
    const c = staff(s, 'mining', 'cheddar', { post: '' });
    // Por qué no asciende
    eq(CM.mice.promoteInfo(s, a).why, 'level', 'low level: says level');
    eq(CM.mice.promoteInfo(s, a).levelsLeft, B.mice.ranks[1].level - 1, 'and how many levels are left');
    a.xp = 1e4;
    s.coins = 0;
    eq(CM.mice.promoteInfo(s, a).why, 'coins', 'enough level, no coins: says coins');
    s.coins = B.mice.ranks[1].cost;
    eq(CM.mice.promoteInfo(s, a).why, 'ok', 'ready');
    eq(CM.mice.promoteInfo(s, Object.assign({}, a, { rank: B.mice.ranks.length - 1 })).why, 'top', 'top rank says so');
    // BEST FIT: avisa de cuántos moverá y, una vez hecho, de que no hay nada que mover
    truthy(CM.mice.bestFitMoves(s) > 0, 'best fit would move someone');
    const before = s.mice.map((m) => m.post).join();
    CM.mice.bestFitMoves(s);
    eq(s.mice.map((m) => m.post).join(), before, 'previewing moves nobody');
    CM.mice.bestFit(s);
    eq(CM.mice.bestFitMoves(s), 0, 'after best fit there is nothing left to move');
    // Despedir
    const coins = s.coins;
    const cost3 = CM.mice.recruitCost(s);
    const gone = s.mice.find((m) => m.post === 'trading:all');
    eq(CM.mice.dismiss(s, 'nope').reason, 'invalid', 'unknown mouse');
    eq(CM.mice.dismiss(s, gone.id).ok, true, 'dismiss');
    eq(s.mice.length, 2, 'one mouse less');
    eq(CM.mice.byId(s, gone.id), null, 'it is gone');
    eq(s.coins, coins, 'nothing is refunded');
    truthy(CM.mice.recruitCost(s) < cost3, 'the next recruit is cheaper again');
    // El que esperaba ocupa el puesto libre; el que descansa, no
    const d = staff(s, 'mining', 'cheddar', { post: '' });
    const working = s.mice.find((m) => m.post && m !== d);
    CM.mice.dismiss(s, working.id);
    eq(d.post, 'trading:all', 'a waiting mouse takes the best free post right away');
    CM.mice.assign(s, d.id, '');
    const e = s.mice.find((m) => m !== d);
    const post = e.post;
    CM.mice.dismiss(s, e.id);
    eq(d.post, '', 'a resting mouse stays resting');
    truthy(post && !CM.mice.at(s, post.split(':')[0], 'cheddar'), 'and the post is empty');
    run(s, 5000);
    valid(s);
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(back.mice.length, 1, 'a dismissed mouse stays gone after a reload');
  });

  test('mice: rarities and the album that raises sale prices for good', () => {
    const s = fresh();
    s.built.house = true;
    s.coins = 1e300;
    const seen = [0, 0, 0];
    for (let i = 0; i < 700; i++) {
      CM.mice.offer(s);
      s.candidates.forEach((c) => (seen[c.rarity] += 1));
      s.candidates = [];
    }
    truthy(seen[0] > seen[1] && seen[1] > seen[2] && seen[2] > 0, 'common > rare > legendary, and all appear: ' + seen.join('/'));
    const plain = { traits: [], aff: {}, xp: 0, rank: 0, look: 5 };
    truthy(CM.mice.speed(Object.assign({ rarity: 2 }, plain), 'drilling') > CM.mice.speed(Object.assign({ rarity: 1 }, plain), 'drilling'), 'legendary is faster than rare');
    truthy(CM.mice.speed(Object.assign({ rarity: 1 }, plain), 'drilling') > CM.mice.speed(plain, 'drilling'), 'rare is faster than common');
    eq(CM.mice.parts(Object.assign({ rarity: 2 }, plain)).hat, 5, 'a legendary wears the crown');
    truthy(CM.mice.parts(Object.assign({ rarity: 1 }, plain)).fur >= 7, 'a rare has a rare fur');
    truthy(CM.mice.parts(plain).fur < 7 && CM.mice.parts(plain).hat < 5, 'a common never has them');
    // Álbum
    const t = fresh();
    t.built.house = true;
    t.coins = 1e9;
    const price = CM.q.priceMult(t);
    eq(CM.mice.albumCount(t), 0, 'empty album');
    CM.mice.offer(t);
    eq(CM.mice.albumCount(t), 0, 'seeing candidates does not count');
    CM.mice.choose(t, 0);
    const n = CM.mice.albumCount(t);
    truthy(n >= 4, 'recruiting records fur, hat and traits: ' + n);
    truthy(CM.events.some((e) => e.type === 'album'), 'and says so');
    truthy(Math.abs(CM.q.priceMult(t) / price - (1 + n * B.mice.albumPrice)) < 1e-9, 'each piece raises sale prices');
    CM.mice.dismiss(t, t.mice[0].id);
    eq(CM.mice.albumCount(t), n, 'dismissing the mouse keeps the album');
    const back = CM.storage.parse(JSON.stringify(t), 1000000);
    eq(CM.mice.albumCount(back), n, 'the album survives a reload');
    // Una partida anterior al álbum lo recibe relleno con sus ratones
    const u = fresh();
    CM.dev.unlockBuildings(u);
    staff(u, 'drilling', 'cheddar', { traits: ['fast', 'glutton'] });
    const old = JSON.parse(JSON.stringify(u));
    delete old.album;
    truthy(CM.mice.albumCount(CM.storage.parse(JSON.stringify(old), 1000000)) >= 4, 'old saves get their mice recorded');
    t.album['fur:99'] = true;
    eq(CM.mice.albumCount(CM.storage.parse(JSON.stringify(t), 1000000)), n, 'unknown pieces are dropped');
  });

  test('traits: catalogue, level choices, mystery slot and rerolls', () => {
    const T = B.mice.traits;
    const kinds = { good: 0, quirk: 0, job: 0, legend: 0 };
    Object.keys(T).forEach((k) => (kinds[T[k].kind] += 1));
    truthy(kinds.good >= 20 && kinds.quirk >= 12 && kinds.legend >= 12, 'a long catalogue: ' + JSON.stringify(kinds));
    for (const skill of CM.skills.list) eq(CM.mice.jobTraits(skill).length, 5, 'five job traits for ' + skill);
    for (const c of B.mice.combos) truthy(c.needs.length >= 2 && c.needs.every((id) => T[id]), 'combo ' + c.id + ' uses real traits');
    const s = withChain();
    const m = staff(s, 'drilling', 'cheddar', { traits: ['fast', 'glutton'] });
    eq(CM.mice.pending(m), null, 'nothing to choose at level 1');
    m.xp = 1e4; // nivel alto: debe varias elecciones
    const owed = Math.min(B.mice.traitSlots, Math.floor(CM.mice.level(m) / B.mice.traitEvery));
    truthy(owed >= 2, 'owes several choices: ' + owed);
    const offer = CM.mice.choice(s, m);
    eq(offer.kind, 'level', 'a level choice');
    eq(offer.options.length, 3, 'three options');
    truthy(new Set(offer.options).size === 3 && offer.options.every((id) => T[id] && !T[id].job && T[id].kind !== 'quirk' && m.traits.indexOf(id) < 0), 'three different good traits it does not have');
    truthy(CM.events.some((e) => e.type === 'traitReady'), 'the game says a choice is ready');
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(JSON.stringify(back.mice[0].offer), JSON.stringify(offer), 'reloading does not change the options');
    // Volver a tirar: cuesta, y cada vez el doble
    s.coins = 0;
    eq(CM.mice.reroll(s, m.id).reason, 'no-coins', 'a reroll needs coins');
    const c1 = CM.mice.rerollCost(m);
    s.coins = 1e9;
    eq(CM.mice.reroll(s, m.id).ok, true, 'reroll');
    eq(s.coins, 1e9 - c1, 'it is paid');
    eq(CM.mice.rerollCost(m), c1 * B.mice.rerollGrowth, 'the next reroll costs double');
    eq(m.offer.options.length, 3, 'three new options');
    // Los legendarios salen poco, y al volver a tirar aún menos, pero salen
    const count = (reroll) => {
      let n = 0;
      const t = staff(s, 'refining', 'cheddar', { post: '', xp: 1e4 });
      CM.mice.choice(s, t);
      for (let i = 0; i < 3000; i++) {
        if (reroll) CM.mice.reroll(s, t.id);
        else {
          t.offer = null;
          CM.mice.choice(s, t);
        }
        if (t.offer.options.some((id) => T[id].kind === 'legend')) n += 1;
        t.rerolls = 0;
        s.coins = 1e9;
      }
      s.mice.pop();
      return n;
    };
    const first = count(false);
    const again = count(true);
    truthy(again > 0 && again < first && first < 3000 * 0.2, 'legendary options are rare, and rarer on a reroll: ' + first + ' vs ' + again);
    truthy(CM.mice.isLegend({ rarity: 0, traits: ['midas'] }) && !CM.mice.isLegend({ rarity: 0, traits: ['fast'] }), 'a mouse with a legendary trait counts as legendary');
    s.coins = 1e9;
    // Elegir
    const want = m.offer.options[1];
    eq(CM.mice.pickTrait(s, m.id, 1).ok, true, 'pick');
    truthy(m.learned.indexOf(want) >= 0 && m.picks === 1, 'the mouse has the trait');
    truthy(m.offer && m.rerolls === 0, 'the next choice is ready, with the reroll price reset');
    truthy(CM.mice.rerollCost(m) > c1, 'later slots cost more to reroll');
    truthy(m.offer.options.indexOf(want) < 0, 'a trait it has is never offered again');
    // Casilla misteriosa: cualquier cosa, también manías y legendarios
    const seen = { good: 0, quirk: 0, legend: 0 };
    for (let i = 0; i < 400; i++) {
      const t = staff(s, 'refining', 'cheddar', { post: '', xp: 1e4 });
      CM.mice.choice(s, t);
      const r = CM.mice.pickTrait(s, t.id, 'mystery');
      seen[T[r.trait].kind] += 1;
      s.mice.pop();
    }
    truthy(seen.good > seen.quirk && seen.quirk > seen.legend && seen.legend > 0, 'mystery gives good > quirk > legendary: ' + JSON.stringify(seen));
    // Nunca más casillas que las que hay
    m.xp = 1e9;
    for (let i = 0; i < 20 && m.offer && m.offer.kind === 'level'; i++) CM.mice.pickTrait(s, m.id, 0);
    eq(m.picks, B.mice.traitSlots, 'six level traits at most');
    eq(new Set(m.traits.concat(m.learned)).size, m.traits.length + m.learned.length, 'no repeated traits');
    valid(s);
  });

  test('traits: affinity, job specialities with grades, combos, auras and luck', () => {
    const s = withChain();
    const T = B.mice.traits;
    const m = staff(s, 'drilling', 'cheddar', { aff: { drilling: 2 } });
    const n = staff(s, 'refining', 'cheddar');
    // La afinidad acelera la especialización
    CM.mice.reward(s, 'drilling', 'cheddar');
    CM.mice.reward(s, 'refining', 'cheddar');
    truthy(m.jobs.drilling > n.jobs.refining, 'a mouse that loves the job specialises faster');
    // Rasgo de oficio: se elige al llegar al primer umbral
    m.jobs.drilling = B.mice.jobGrades[0];
    const offer = CM.mice.choice(s, m);
    eq(offer.kind + ':' + offer.skill, 'job:drilling', 'a job choice for drilling');
    truthy(offer.options.length === 3 && offer.options.every((id) => T[id].job === 'drilling'), 'three drilling traits');
    eq(CM.mice.pickTrait(s, m.id, 'mystery').reason, 'invalid', 'no mystery slot in job choices');
    m.offer.options[0] = 'bitexpert';
    CM.mice.pickTrait(s, m.id, 0);
    eq(m.spec.drilling, 'bitexpert', 'speciality set');
    eq(CM.mice.gradeOf(m, 'drilling'), 1, 'grade I');
    const g1 = CM.mice.speed(m, 'drilling');
    truthy(g1 > CM.mice.speed(Object.assign({}, m, { spec: {} }), 'drilling'), 'the speciality makes it faster at drilling');
    eq(CM.mice.speed(m, 'refining'), CM.mice.speed(Object.assign({}, m, { spec: {} }), 'refining'), 'and counts only in its job');
    CM.events.length = 0;
    m.jobs.drilling = B.mice.jobGrades[1] - 0.5;
    CM.mice.reward(s, 'drilling', 'cheddar');
    eq(CM.mice.gradeOf(m, 'drilling'), 2, 'grade II after more work');
    truthy(CM.events.some((e) => e.type === 'specUp' && e.grade === 2), 'and the game says so');
    truthy(CM.mice.speed(m, 'drilling') > g1, 'a higher grade is stronger');
    CM.mice.assign(s, m.id, 'refining:cheddar');
    eq(m.spec.drilling, 'bitexpert', 'moving post keeps what it learned');
    CM.mice.assign(s, m.id, 'drilling:cheddar');
    // Combinaciones
    const combo = B.mice.combos.find((c) => c.id === 'sleepwalker');
    const sleepy = staff(s, 'mining', 'cheddar', { traits: ['nocturnal', 'dreamer'] });
    eq(CM.mice.combosOf(sleepy).map((c) => c.id).join(), 'sleepwalker', 'two traits form a combo');
    CM.away = true;
    truthy(Math.abs(CM.mice.speed(sleepy, 'cheesemaking') - (1 + T.nocturnal.eff.awaySpeed + combo.eff.awaySpeed + T.dreamer.eff.speed)) < 1e-9, 'the combo adds its own effect');
    CM.away = false;
    CM.events.length = 0;
    eq(s.album['combo:sleepwalker'], undefined, 'not in the album yet');
    CM.mice.note(s, sleepy);
    truthy(s.album['combo:sleepwalker'] && CM.events.some((e) => e.type === 'combo' && e.combos[0] === 'sleepwalker'), 'forming it discovers it');
    // Un legendario anula las manías
    const calm = Object.assign({}, sleepy, { traits: ['serene', 'dreamer'], learned: [] });
    eq(CM.mice.speed(calm, 'drilling'), 1 + T.serene.eff.speed, 'Serene ignores the quirk');
    // Auras: el vecino de la línea, y solo con la partida delante
    const lone = CM.mice.speed(n, 'refining', s, 'cheddar');
    m.learned.push('mentor');
    truthy(Math.abs(CM.mice.speed(n, 'refining', s, 'cheddar') - lone - T.mentor.eff.auraNext) < 1e-9, 'a Mentor before it makes the next mouse faster');
    eq(CM.mice.speed(n, 'refining'), 1, 'BEST FIT does not see auras: the plain speed ignores them');
    // Profundidad y colonia
    const diver = Object.assign({}, n, { traits: ['deepdiver'] });
    s.zones.cheddar.depth = 10;
    truthy(Math.abs(CM.mice.speed(diver, 'mining', s, 'cheddar') - (1 + 10 * T.deepdiver.eff.depthSpeed)) < 1e-9, 'Deep Diver grows with depth');
    s.zones.cheddar.depth = 0;
    // Suerte: a veces sale doble
    const lucky = { m: Object.assign({}, n, { traits: ['midas'] }), skill: 'drilling', yield: 1 };
    let doubles = 0;
    for (let i = 0; i < 2000; i++) if (CM.mice.out(s, lucky) === 2) doubles += 1;
    truthy(doubles > 2000 * 0.43 && doubles < 2000 * 0.57, 'Midas doubles about half of the time: ' + doubles);
    eq(CM.mice.out(s, { m: n, skill: 'refining', yield: 1 }), 1, 'no luck, no double');
    run(s, 20000);
    valid(s);
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(back.mice[0].spec.drilling, 'bitexpert', 'specialities survive a reload');
    eq(back.mice[0].learned.join(), 'mentor', 'and learned traits too');
    // Una partida anterior: el oficio favorito pasa a ser afinidad
    const old = JSON.parse(JSON.stringify(s));
    old.mice.forEach((x) => {
      delete x.aff;
      delete x.learned;
      delete x.spec;
      delete x.jobs;
      delete x.picks;
      delete x.offer;
      x.fav = 'trading';
    });
    const moved = CM.storage.parse(JSON.stringify(old), 1000000);
    eq(moved.mice[0].aff.trading, 2, 'an old favourite job becomes "loves"');
    eq(moved.mice[0].learned.length, 0, 'and the new fields start empty');
  });

  test('every mouse has its own look, and old saves get one', () => {
    const s = fresh();
    s.built.house = true;
    s.coins = 1e9;
    const looks = [];
    for (let i = 0; i < 8; i++) {
      CM.mice.offer(s);
      s.candidates.forEach((c) => looks.push(c.look));
      CM.mice.choose(s, 0);
    }
    truthy(looks.every((n) => Number.isInteger(n) && n >= 0 && n < 1048576), 'looks are valid');
    truthy(new Set(looks).size >= 20, 'candidates look different: ' + new Set(looks).size);
    truthy(s.mice.every((m, i) => m.look === looks[i * 3]), 'a recruited mouse keeps the look it was offered with');
    const old = JSON.parse(JSON.stringify(s));
    old.mice.forEach((m) => delete m.look);
    const back = CM.storage.parse(JSON.stringify(old), 1000000);
    truthy(back && back.mice.every((m) => Number.isInteger(m.look)), 'old saves get a look');
    truthy(new Set(back.mice.map((m) => m.look)).size === back.mice.length, 'and each one is different');
  });

  test('save/load keeps the state; damaged and old saves start clean', () => {
    CM.storage.clear();
    const s = withCheese();
    node(s, 'mining.pick', 3);
    s.totals.nodesBought = 3;
    CM.storage.save(s, 5000000);
    const loaded = CM.storage.load(5000000).state;
    for (const path of ['coins', 'clock']) eq(loaded[path], s[path], path);
    staff(s, 'drilling', 'cheddar', { traits: ['fast', 'glutton'], aff: { drilling: 2 }, xp: 40, rank: 1 });
    CM.storage.save(s, 5000000);
    const again = CM.storage.load(5000000).state;
    for (const part of ['built', 'inv', 'zones', 'nodes', 'skills', 'mice']) eq(JSON.stringify(again[part]), JSON.stringify(s[part]), part);
    eq(loaded.recipes.length, 1, 'recipes');
    eq(q.pickPower(loaded), q.pickPower(s), 'tree effects survive the reload');
    valid(loaded);

    localStorage.setItem(CM.storage.KEY, 'not json');
    truthy(CM.storage.load(1).recovered, 'corrupt save recovers');
    localStorage.setItem(CM.storage.KEY, '{"version":2,"coins":9}');
    eq(CM.storage.load(1).state.coins, 0, 'old schema starts fresh');
    localStorage.setItem(CM.storage.KEY, JSON.stringify({ version: 4, coins: -50, inv: { raw: { cheddar: -7 } }, nodes: { 'mining.pick': 9999, 'fake.node': 3 }, lots: { ghost: 5 }, zones: { gouda: { depth: 7 } }, skills: { mining: { xp: -4 } } }));
    valid(CM.storage.load(1).state);
    // Partidas de la versión anterior (una sola refinería y quesería): se recolocan en su línea.
    const old = JSON.parse(JSON.stringify(withCheese()));
    old.version = 3;
    old.jobs = { refinery: { remaining: 100, total: 6000, amount: 2, base: 'cheddar', used: 4 }, cheesery: null, shop: null };
    old.cookRecipe = old.recipes[0].id;
    const migrated = CM.storage.parse(JSON.stringify(old), 1);
    truthy(migrated, 'version 3 saves still load');
    eq(migrated.zones.cheddar.refJob.amount, 2, 'refinery cycle moved to its line');
    eq(migrated.zones.cheddar.cookRecipe, old.recipes[0].id, 'cheesemaker recipe moved to its line');
    eq(migrated.recipes.length, 1, 'recipes kept');
    valid(migrated);
    // v4: los ratones eran nudos. Pasan a ser ratones de verdad, uno por puesto y roca abierta.
    const v4 = JSON.parse(JSON.stringify(withCheese()));
    v4.version = 4;
    delete v4.mice;
    v4.zones.gouda.unlocked = true;
    v4.nodes = { 'drilling.driller': 1, 'trading.keeper': 1, 'mining.miner': 3, 'mining.pick': 2 };
    const coinsBefore = v4.coins;
    const m4 = CM.storage.parse(JSON.stringify(v4), 1);
    truthy(m4, 'version 4 saves still load');
    eq(m4.mice.filter((m) => m.post.indexOf('drilling:') === 0).length, 2, 'a driller on each open rock');
    eq(m4.mice.filter((m) => m.post.indexOf('mining:') === 0).length, 2, 'a miner on each open rock');
    eq(m4.mice.filter((m) => m.post === 'trading:all').length, 1, 'one shopkeeper');
    eq(m4.nodes['drilling.driller'], undefined, 'old mouse nodes removed');
    eq(m4.nodes['mining.pick'], 2, 'other nodes kept');
    eq(m4.coins, coinsBefore + 200 + 400, 'extra miner ranks refunded');
    truthy(m4.built.house, 'the Mouse House comes with them');
    truthy(q.auto(m4, 'drilling', 'gouda'), 'still automated after migrating');
    valid(m4);
    // Los nudos de almacén ya no existen: una partida que los tenía recupera sus monedas.
    localStorage.setItem(CM.storage.KEY, JSON.stringify({ version: 4, coins: 10, nodes: { 'colony.silo': 2, 'colony.lamp': 1 } }));
    const refunded = CM.storage.load(1).state;
    eq(refunded.coins, 10 + 40 + Math.round(40 * 1.55), 'retired storage upgrades are refunded');
    eq(refunded.nodes['colony.silo'], undefined, 'retired node removed');
    eq(refunded.nodes['colony.lamp'], 1, 'other nodes kept');
    valid(refunded);
    CM.storage.clear();
  });

  test('goal rewards are paid exactly once, and never for mining', () => {
    const s = fresh();
    reveal(s);
    run(s, 1000);
    eq(s.coins, 0, 'finding a vein pays nothing');
    CM.construction.build(s, 'drill');
    run(s, STEP);
    eq(s.coins, B.goalRewards.drill, 'reward for building the drill');
    const loaded = CM.storage.parse(JSON.stringify(s), 1);
    run(loaded, 60000);
    eq(loaded.coins, B.goalRewards.drill, 'not paid again after time or reload');
  });

  test('dev tools mark the save and never break invariants', () => {
    const s = fresh();
    CM.dev.addRaw(s, 9999);
    CM.dev.addBase(s, 9999);
    CM.dev.addLevels(s, 10);
    CM.dev.hireAll(s);
    CM.dev.powerUp(s, 500);
    CM.dev.unlockZones(s);
    eq(s.devUsed, true, 'devUsed');
    eq(q.level(s, 'mining'), 11, 'levels added');
    valid(s);
    valid(CM.dev.scenario(1));
    truthy(CM.dev.report(s).indexOf('invariants: ok') >= 0, 'report');
  });

  // Un bot juega desde cero usando solo las acciones del jugador, sin dev tools.
  function playBot(tapEveryMs, limitMs, stopAt, snapshots) {
    const s = fresh();
    const snaps = [];
    let lastTap = -1e9;
    let lastBuy = -1e9;
    const ORDER = ['drilling', 'refining', 'trading', 'cheesemaking', 'mining', 'colony'];
    while (s.clock < limitMs && s.goalsDone[stopAt] === undefined) {
      CM.sim.step(s, STEP);
      for (const id of CM.construction.order) CM.construction.build(s, id);
      if (s.clock - lastBuy >= 2000) {
        lastBuy = s.clock;
        const next = CM.zones.next(s);
        if (next) CM.zones.unlock(s, next.id);
        // Primero un ratón para cada puesto libre (se queda con el primer candidato
        // y deja que se coloque solo), luego ascensos, luego lo más barato de cada árbol.
        const wantsMouse = s.built.house && !!CM.mice.freePost(s);
        if (wantsMouse && CM.mice.offer(s).ok) CM.mice.choose(s, 0);
        for (const m of s.mice) CM.mice.promote(s, m.id);
        for (const m of s.mice) if (m.offer) CM.mice.pickTrait(s, m.id, 0);
        // Ahorra como lo haría una persona: para el siguiente ratón y para la
        // siguiente roca cuando su economía ya da para ella.
        const mouse = s.built.house && !!CM.mice.freePost(s) && s.totals.coinsEarned > CM.mice.recruitCost(s) * 0.6;
        const saving = mouse || (next && s.totals.coinsEarned > next.unlockCost * 0.5);
        if (!saving) for (const skill of ORDER) CM.tree.buyAll(s, skill);
      }
      if (s.clock - lastTap >= tapEveryMs) {
        lastTap = s.clock;
        const zone = q.openZones(s).find((z) => CM.mining.status(s, z.id) === 'ready');
        const drillable = q.openZones(s).find((z) => CM.drilling.status(s, z.id) === 'ready');
        const refinable = q.openZones(s).find((z) => CM.refining.status(s, z.id) === 'ready');
        if (zone && !q.auto(s, 'mining', zone.id)) CM.mining.hit(s, zone.id, 'manual');
        else if (drillable && !q.auto(s, 'drilling', drillable.id)) CM.drilling.tap(s, drillable.id);
        else if (refinable && !q.auto(s, 'refining', refinable.id)) CM.refining.tap(s, refinable.id);
        else if (CM.shop.status(s) === 'ready' && !q.auto(s, 'trading', 'all')) CM.shop.tap(s);
        else if (zone) CM.mining.hit(s, zone.id, 'manual');
      }
      // En cada línea: descubre recetas de su queso y, si no quedan asequibles, fabrica la mejor.
      if (s.built.cheesery) {
        for (const def of q.openZones(s)) {
          if (s.zones[def.id].cookJob) continue;
          const unknown = CM.cheesery.allCombos([def.base]).find((c) => !CM.cheesery.recipeByKey(s, CM.cheesery.keyOf(c)) && CM.cheesery.experiment(s, c).ok);
          const mine = s.recipes.filter((r) => CM.cheesery.parseKey(r.key).base === def.base).sort((a, b) => CM.cheesery.valueOf(s, b) - CM.cheesery.valueOf(s, a));
          if (unknown || !mine.length) continue;
          if (q.auto(s, 'cheesemaking', def.id)) continue; // su ratón cocina solo la mejor
          for (const r of mine) if (CM.cheesery.produce(s, r.id, Math.max(1, Math.min(3, CM.cheesery.maxLots(s, r)))).ok) break;
        }
      }
      if (s.clock % 5000 === 0) valid(s);
      if (snapshots && snapshots.length && s.clock >= snapshots[0] * 60000) {
        snaps.push(snapshots.shift() + ' min: levels ' + CM.skills.list.map((k) => q.level(s, k)).join('/') + ', rocks ' + s.totals.zonesUnlocked + ', depth ' + B.zones.map((z) => s.zones[z.id].depth).join('/') + ', recipes ' + s.recipes.length + ', coins ' + CM.fmt(s.coins) + ', earned ' + CM.fmt(s.totals.coinsEarned));
      }
    }
    const mins = {};
    Object.keys(s.goalsDone).forEach((k) => (mins[k] = Math.round(s.goalsDone[k] / 6000) / 10));
    return { s, mins, snaps };
  }

  test('a new game reaches full automation, depth 3 and a second rock without dev tools', () => {
    const { s, mins } = playBot(400, 4 * 60 * 60 * 1000, 'zone2');
    notes.push('bot (1 tap / 0.4 s) goals in minutes: ' + JSON.stringify(mins));
    notes.push('bot at the end: levels ' + CM.skills.list.map((k) => q.level(s, k)).join('/') + ', coins ' + CM.fmt(s.coins) + ', recipes ' + s.recipes.length);
    for (const id of ['vein', 'drill', 'raw', 'refinery', 'base', 'cheesery', 'recipe', 'shop', 'sale', 'node', 'house', 'mouse', 'level5', 'allAuto', 'depth3', 'zone2']) {
      truthy(s.goalsDone[id] !== undefined, 'goal ' + id);
    }
    eq(s.devUsed, false, 'no dev tools');
    eq(s.metrics.errors.length, 0, 'errors');
    valid(s);
  });

  // No comprueba nada: mide el ritmo de una partida larga para ajustar el balance.
  test('pace report: four hours of an ideal player', () => {
    const { snaps } = playBot(400, 4 * 60 * 60 * 1000, 'never', [2, 5, 10, 15, 30, 45, 60, 120, 180, 240]);
    snaps.forEach((line) => notes.push('pace ' + line));
  });

  test('a slow player (1 tap / 1.5 s) also gets there', () => {
    const { s, mins } = playBot(1500, 6 * 60 * 60 * 1000, 'zone2');
    notes.push('slow bot goals in minutes: ' + JSON.stringify(mins));
    truthy(s.goalsDone.allAuto !== undefined && s.goalsDone.zone2 !== undefined, 'automation and second rock');
    valid(s);
  });

  const failed = results.filter((r) => !r.ok).length;
  document.getElementById('out').textContent =
    results.map((r) => (r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.ok ? '' : '\n      ' + r.error)).join('\n') + '\n\n' + (results.length - failed) + '/' + results.length + ' passed\n\n' + notes.join('\n');
  window.TEST_RESULTS = { total: results.length, failed, results, notes };
})();
