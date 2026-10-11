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
    for (let i = 0; i < 3; i++) {
      CM.drilling.tap(s, 'cheddar');
      run(s, q.drillDuration(s));
    }
    CM.construction.build(s, 'refinery');
    return s;
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
    truthy(s.built.shop, 'the shop opens on its own once a recipe exists');
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
    node(s, 'mining.miner', 4);
    node(s, 'drilling.driller', 1);
    run(s, 30 * 60 * 1000);
    truthy(s.inv.raw.cheddar > 100, 'cheddar raw keeps piling up (' + s.inv.raw.cheddar + ')');
    truthy(s.inv.raw.gouda > 0, 'gouda raw is tracked on its own (' + s.inv.raw.gouda + ')');
    eq(s.inv.raw.cheddar + s.inv.raw.gouda + s.totals.rawConsumed, s.totals.rawProduced, 'every raw cheese is accounted for');
    truthy(['running', 'ready', 'no-vein'].indexOf(CM.drilling.status(s, 'cheddar')) >= 0, 'the drill only ever waits for a vein');
    valid(s);
  });

  test('rocks never run out: an empty vein digs deeper, harder and richer', () => {
    const s = withChain();
    node(s, 'drilling.driller', 1);
    node(s, 'refining.refiner', 1);
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
    node(s, 'mining.miner', 3);
    node(s, 'drilling.driller', 1);
    run(s, 10 * 60 * 1000);
    truthy(s.inv.raw.cheddar > 0 && s.inv.raw.gouda > 0, 'both rocks produced raw');
    truthy(s.zones.gouda.depth > 0 || s.zones.gouda.veinRevealed || s.zones.gouda.discover > 0, 'gouda progressed on its own');
    valid(s);
  });

  test('upgrading does not automate; the mouse automates but does not speed up', () => {
    const s = withChain();
    s.coins = 1e6;
    s.skills.drilling.xp = q.xpForLevel(10);
    const y = q.drillYield(s, 'cheddar');
    eq(CM.tree.buy(s, 'drilling', 'bit').ok, true, 'buy Bigger Bit');
    truthy(q.drillYield(s, 'cheddar') > y, 'more yield');
    eq(q.isAutomated(s, 'drilling'), false, 'not automated');
    s.inv.raw.cheddar = 0;
    run(s, 30000);
    eq(q.rawTotal(s), 0, 'no production without the driller');
    const y2 = q.drillYield(s, 'cheddar');
    const d2 = q.drillDuration(s);
    eq(CM.tree.buy(s, 'drilling', 'driller').ok, true, 'hire driller');
    eq(q.drillYield(s, 'cheddar'), y2, 'yield unchanged by hiring');
    eq(q.drillDuration(s), d2, 'duration unchanged by hiring');
    eq(CM.tree.buy(s, 'drilling', 'driller').reason, 'max-level', 'only one driller');
    run(s, d2 * 3);
    truthy(s.totals.rawProduced > 0 && q.rawTotal(s) > 0, 'driller works alone');
    valid(s);
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
    node(b, 'mining.miner', 1);
    b.lastSavedAt = 0;
    const xp = b.skills.mining.xp;
    CM.sim.applyOffline(b, 5 * 60 * 1000);
    truthy(b.totals.veinsFound >= 1, 'miner found a vein offline');
    truthy(b.skills.mining.xp > xp, 'experience is earned offline');
    eq(q.rawTotal(b), 0, 'miner extracted nothing');
    eq(CM.sim.applyOffline(b, 5 * 60 * 1000), null, 'second call does nothing');

    const c = fresh();
    node(c, 'mining.miner', 1);
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
    node(s, 'refining.refiner', 1);
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
    node(s, 'cheesemaking.maker', 1);
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

  test('chain buildings unlock on their own; the cheesemaker picks the most valuable recipe', () => {
    const s = fresh();
    eq(s.built.drill, false, 'nothing built at the start');
    reveal(s);
    truthy(s.built.drill, 'drill appears once a vein is found');
    eq(s.built.refinery, false, 'refinery still needs raw cheese');
    const t = withCheese();
    truthy(t.built.cheesery && t.built.shop, 'cheesery and shop built');
    t.skills.cheesemaking.xp = q.xpForLevel(3);
    t.inv.base.cheddar = 3;
    eq(CM.cheesery.experiment(t, Object.assign({}, COMBO, { treatment: 'smoked' })).ok, true, 'second recipe');
    run(t, 30000);
    const better = t.recipes[1];
    truthy(CM.cheesery.valueOf(t, better) > CM.cheesery.valueOf(t, t.recipes[0]), 'the smoked one is worth more');
    node(t, 'cheesemaking.maker', 1);
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
    node(s, 'cheesemaking.maker', 1);
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
    node(s, 'trading.keeper', 1);
    const coins = s.coins;
    run(s, 60000);
    truthy(s.totals.lotsSold > 0 && s.coins > coins, 'the shopkeeper sells on its own');
    truthy(s.skills.trading.xp > 0 && s.skills.cheesemaking.xp > 0, 'both skills earn experience');
    eq(CM.storage.parse(JSON.stringify(s), 1).zones.cheddar.cookRecipe, recipe.id, 'assignment persists');
    valid(s);
  });

  test('automation waits only for what it is missing, never for space', () => {
    const s = withChain();
    node(s, 'refining.refiner', 1);
    s.inv.raw.cheddar = 9;
    run(s, 10 * 60 * 1000);
    eq(s.inv.raw.cheddar, 1, 'refined every pair of raw');
    eq(CM.refining.status(s, 'cheddar'), 'no-raw', 'then waits for raw');
    eq(s.totals.baseProduced, s.inv.base.cheddar, 'all the base is in stock');
    valid(s);
  });

  test('save/load keeps the state; damaged and old saves start clean', () => {
    CM.storage.clear();
    const s = withCheese();
    node(s, 'mining.pick', 3);
    s.totals.nodesBought = 3;
    CM.storage.save(s, 5000000);
    const loaded = CM.storage.load(5000000).state;
    for (const path of ['coins', 'clock']) eq(loaded[path], s[path], path);
    for (const part of ['built', 'inv', 'zones', 'nodes', 'skills']) eq(JSON.stringify(loaded[part]), JSON.stringify(s[part]), part);
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
    eq(B.goalRewards.vein, 0, 'finding a vein pays nothing');
    reveal(s);
    run(s, 1000);
    truthy(s.built.drill, 'the drill unlocks on its own');
    eq(s.coins, B.goalRewards.drill, 'only the drill unlock pays');
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
        // Primero los ratones, luego lo más barato de cada árbol.
        for (const [skill, id] of [['drilling', 'driller'], ['refining', 'refiner'], ['trading', 'keeper'], ['cheesemaking', 'maker'], ['mining', 'miner']]) CM.tree.buy(s, skill, id);
        // Ahorra como lo haría una persona: para el siguiente ratón que ya puede
        // contratar, y para la siguiente roca cuando su economía ya da para ella.
        const mouse = [['drilling', 'driller'], ['refining', 'refiner'], ['trading', 'keeper'], ['cheesemaking', 'maker'], ['mining', 'miner']].some(([skill, id]) => {
          const info = CM.tree.info(s, skill, id);
          return !info.locked && !info.maxed && s.built[B.skills[skill].station] !== false;
        });
        const saving = mouse || (next && s.totals.coinsEarned > next.unlockCost * 0.5);
        if (!saving) for (const skill of ORDER) CM.tree.buyAll(s, skill);
      }
      if (s.clock - lastTap >= tapEveryMs) {
        lastTap = s.clock;
        const zone = q.openZones(s).find((z) => CM.mining.status(s, z.id) === 'ready');
        const drillable = q.openZones(s).find((z) => CM.drilling.status(s, z.id) === 'ready');
        const refinable = q.openZones(s).find((z) => CM.refining.status(s, z.id) === 'ready');
        if (zone && !q.miners(s)) CM.mining.hit(s, zone.id, 'manual');
        else if (drillable && !q.isAutomated(s, 'drilling')) CM.drilling.tap(s, drillable.id);
        else if (refinable && !q.isAutomated(s, 'refining')) CM.refining.tap(s, refinable.id);
        else if (CM.shop.status(s) === 'ready' && !q.isAutomated(s, 'trading')) CM.shop.tap(s);
        else if (zone) CM.mining.hit(s, zone.id, 'manual');
      }
      // En cada línea: descubre recetas de su queso y, si no quedan asequibles, fabrica la mejor.
      if (s.built.cheesery) {
        for (const def of q.openZones(s)) {
          if (s.zones[def.id].cookJob) continue;
          const unknown = CM.cheesery.allCombos([def.base]).find((c) => !CM.cheesery.recipeByKey(s, CM.cheesery.keyOf(c)) && CM.cheesery.experiment(s, c).ok);
          const mine = s.recipes.filter((r) => CM.cheesery.parseKey(r.key).base === def.base).sort((a, b) => CM.cheesery.valueOf(s, b) - CM.cheesery.valueOf(s, a));
          if (unknown || !mine.length) continue;
          if (q.isAutomated(s, 'cheesemaking')) CM.cheesery.assign(s, (mine.find((r) => CM.cheesery.maxLots(s, r) > 0) || mine[0]).id);
          else for (const r of mine) if (CM.cheesery.produce(s, r.id, Math.max(1, Math.min(3, CM.cheesery.maxLots(s, r)))).ok) break;
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
    for (const id of ['vein', 'drill', 'raw', 'refinery', 'base', 'cheesery', 'recipe', 'shop', 'sale', 'node', 'mouse', 'level5', 'allAuto', 'depth3', 'zone2']) {
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
