// Pruebas de los sistemas críticos. Abre tests.html para ejecutarlas.
// Los números entre corchetes son los casos de la sección 11 de CLAUDE.md.
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
  // Pica despacio (sin combo) hasta revelar la veta actual.
  function reveal(s) {
    let guard = 0;
    while (CM.mining.status(s) === 'ready' && guard++ < 5000) {
      CM.mining.hit(s, 'manual');
      run(s, 1000);
    }
  }
  // Partida con taladro y refinería construidos sobre una veta revelada.
  function withChain() {
    const s = fresh();
    reveal(s);
    CM.construction.build(s, 'drill');
    for (let i = 0; i < 3; i++) {
      CM.drilling.tap(s);
      run(s, q.drillDuration(s));
    }
    CM.construction.build(s, 'refinery');
    return s;
  }
  // Da trabajadores con sus camas, como si se hubieran contratado.
  function staff(s, roles) {
    s.built.house = true;
    s.levels.house = B.upgrades.house.maxLevel;
    roles.forEach((r) => (s.workers[r] = 1));
  }
  const COMBO = { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' };
  // Partida con una receta descubierta, un lote y el mercado construido.
  function withLot() {
    const s = withChain();
    s.inv.base.cheddar = 10;
    s.totals.baseProduced = 10;
    eq(CM.construction.build(s, 'cheesery').ok, true, 'build cheesery');
    eq(CM.cheesery.experiment(s, COMBO).ok, true, 'experiment');
    run(s, CM.cheesery.lotTime(COMBO));
    eq(CM.construction.build(s, 'market').ok, true, 'build market');
    run(s, STEP);
    return s;
  }

  test('[1] mining reveals veins and never gives cheese or coins', () => {
    const s = fresh();
    const need = q.veinDef(s, 'cheddar').hits;
    for (let i = 0; i < need - 1; i++) {
      CM.mining.hit(s, 'manual');
      run(s, 1000);
    }
    eq(q.depPhase(s, 'cheddar'), 'searching', 'phase');
    eq(q.rawTotal(s) + q.baseTotal(s) + s.coins, 0, 'resources before reveal');
    CM.mining.hit(s, 'manual');
    eq(q.depPhase(s, 'cheddar'), 'vein_revealed', 'phase');
    eq(q.rawTotal(s) + q.baseTotal(s) + s.coins, 0, 'resources after reveal');
    eq(CM.mining.hit(s, 'manual').reason, 'vein-exposed', 'mining an exposed vein');
  });

  test('[2] drill needs a vein; one cycle gives raw once and consumes the vein', () => {
    const s = fresh();
    eq(CM.construction.build(s, 'drill').reason, 'locked', 'drill before vein');
    s.built.drill = true;
    eq(CM.drilling.tap(s).reason, 'no-vein', 'drill without vein');
    reveal(s);
    const cap = q.dep(s).veinRemaining;
    eq(CM.drilling.tap(s).ok, true, 'start');
    eq(q.rawTotal(s), 0, 'raw during cycle');
    run(s, q.drillDuration(s));
    eq(q.rawTotal(s), q.drillYield(s), 'raw after cycle');
    eq(q.dep(s).veinRemaining, cap - q.drillYield(s), 'vein');
    run(s, 60000);
    eq(q.rawTotal(s), q.drillYield(s), 'raw does not grow without a driller');
    valid(s);
  });

  test('[3] refinery needs raw cheese; consumes input and gives output once', () => {
    const s = fresh();
    s.built.refinery = true;
    eq(CM.refining.tap(s).reason, 'no-raw', 'no raw');
    s.inv.raw.cheddar = 5;
    eq(CM.refining.tap(s).ok, true, 'start');
    const batch = Math.min(q.refineBatch(s), 2);
    eq(s.inv.raw.cheddar, 5 - batch * B.refinery.rawPerBase, 'raw consumed at start');
    eq(q.baseTotal(s), 0, 'base during cycle');
    run(s, q.refineDuration(s));
    eq(s.inv.base.cheddar, batch, 'base after cycle');
    run(s, 60000);
    eq(s.inv.base.cheddar, batch, 'base does not grow without a refiner');
    valid(s);
  });

  test('[4] full storage stops production without losing or duplicating anything', () => {
    const s = withChain();
    s.inv.raw.cheddar = q.caps(s).raw;
    const vein = q.dep(s).veinRemaining;
    eq(CM.drilling.tap(s).reason, 'storage-full', 'drill blocked');
    eq(q.dep(s).veinRemaining, vein, 'vein untouched');
    s.inv.base.cheddar = q.caps(s).base;
    const raw = q.rawTotal(s);
    eq(CM.refining.tap(s).reason, 'storage-full', 'refinery blocked');
    eq(q.rawTotal(s), raw, 'raw untouched');
    // Con una unidad de hueco, el ciclo se ajusta al espacio en vez de desbordar.
    s.inv.raw.cheddar -= 1;
    CM.drilling.tap(s);
    eq(s.jobs.drill.amount, 1, 'partial cycle');
    run(s, q.drillDuration(s));
    valid(s);
  });

  test('[5] a depleted vein blocks drilling; a depleted deposit leads to the next one', () => {
    const s = withChain();
    staff(s, ['driller', 'refiner', 'miner']);
    const def = q.depDef('cheddar');
    const total = def.veins.reduce((a, v) => a + v.capacity, 0);
    let guard = 0;
    while (q.depPhase(s, 'cheddar') !== 'depleted' && guard++ < 4000) {
      // Vacía el almacén para medir solo el agotamiento.
      s.inv.raw.cheddar = 0;
      s.inv.base.cheddar = 0;
      run(s, 5000);
    }
    eq(q.depPhase(s, 'cheddar'), 'depleted', 'phase');
    eq(s.totals.rawProduced, total, 'everything extracted exactly once');
    eq(s.totals.veinsFound, def.veins.length, 'veins found');
    eq(CM.drilling.status(s), 'depleted', 'drill status');
    eq(CM.mining.hit(s, 'manual').reason, 'depleted', 'mining');
    eq(CM.workers.status(s, 'driller'), 'no-work', 'driller status');
    s.coins = B.deposits[1].unlockCost;
    eq(CM.deposits.unlock(s, 'gouda').ok, true, 'unlock gouda');
    eq(CM.deposits.setActive(s, 'gouda').ok, true, 'switch');
    eq(CM.mining.status(s), 'ready', 'mining the new deposit');
    eq(CM.deposits.unlock(s, 'blue').reason, 'not-in-alpha', 'blue is data only');
    valid(s);
  });

  test('[6] upgrading the drill does not automate it; hiring a driller does not speed it up', () => {
    const s = withChain();
    s.built.house = true;
    s.coins = 10000;
    const yieldBefore = q.drillYield(s);
    const durBefore = q.drillDuration(s);
    eq(CM.construction.upgrade(s, 'drill').ok, true, 'upgrade');
    truthy(q.drillYield(s) > yieldBefore && q.drillDuration(s) < durBefore, 'upgrade improves throughput');
    eq(q.isAutomated(s, 'driller'), false, 'not automated');
    const raw = q.rawTotal(s);
    s.inv.raw.cheddar = 0;
    run(s, 30000);
    eq(q.rawTotal(s), 0, 'no production without driller (was ' + raw + ')');
    const y = q.drillYield(s);
    const d = q.drillDuration(s);
    eq(CM.workers.hire(s, 'driller').ok, true, 'hire');
    eq(q.drillYield(s), y, 'yield unchanged by hiring');
    eq(q.drillDuration(s), d, 'duration unchanged by hiring');
    run(s, d * 3);
    eq(q.rawTotal(s), y * 3, 'driller ran exactly 3 cycles');
    valid(s);
  });

  test('[7] offline exploration only happens with a Miner, and respects the cap', () => {
    const a = fresh();
    CM.mining.hit(a, 'manual');
    a.lastSavedAt = 0;
    const sumA = CM.sim.applyOffline(a, 10 * 60 * 1000);
    eq(q.dep(a).discover, 1, 'no miner: discovery unchanged');
    eq(sumA.automated, false, 'summary says not automated');

    const b = fresh();
    b.workers.miner = 1;
    b.lastSavedAt = 0;
    CM.sim.applyOffline(b, 10000 + 5 * B.mining.minerIntervalMs);
    truthy(q.dep(b).discover >= 5, 'miner explored offline');
    eq(q.rawTotal(b), 0, 'miner extracted nothing');

    const c = fresh();
    c.workers.miner = 1;
    c.lastSavedAt = 0;
    const sumC = CM.sim.applyOffline(c, B.offline.capMs * 3);
    eq(sumC.simulatedMs, B.offline.capMs, 'capped');
    eq(c.clock, B.offline.capMs, 'clock advanced by the cap only');
  });

  test('[8] rapid taps, reload mid-cycle and double-click sale never duplicate', () => {
    const s = withChain();
    s.inv.raw.cheddar = 0;
    CM.drilling.tap(s);
    for (let i = 0; i < 100; i++) CM.drilling.tap(s);
    run(s, STEP);
    eq(q.rawTotal(s), q.drillYield(s), 'one cycle despite 100 taps');

    s.inv.raw.cheddar = 4;
    CM.refining.tap(s);
    run(s, 1000);
    const text = JSON.stringify(s);
    const a = CM.storage.parse(text, 2000000);
    const b = CM.storage.parse(text, 2000000);
    for (const copy of [a, b]) {
      run(copy, 60000);
      eq(copy.inv.base.cheddar, s.jobs.refinery.amount, 'reloaded cycle pays once');
      eq(copy.inv.raw.cheddar, s.inv.raw.cheddar, 'reloaded cycle consumed once');
    }

    const m = withLot();
    const order = m.orders[0];
    const recipe = m.recipes[0];
    eq(CM.merchant.deliver(m, order.id, recipe.id).ok, true, 'first click');
    const coins = m.coins;
    eq(CM.merchant.deliver(m, order.id, recipe.id).reason, 'order-gone', 'second click');
    eq(m.coins, coins, 'paid once');
  });

  test('[9] a discovered, renamed recipe persists; production consumes inputs and gives a lot', () => {
    const s = withLot();
    const recipe = s.recipes[0];
    eq(s.lots[recipe.id], 1, 'sample lot from the experiment');
    eq(CM.cheesery.experiment(s, COMBO).reason, 'known', 're-experimenting a known recipe');
    eq(CM.cheesery.rename(s, recipe.id, '  Abuela   Special  ').ok, true, 'rename');
    const base = s.inv.base.cheddar;
    eq(CM.cheesery.produce(s, recipe.id, 2).ok, true, 'produce');
    eq(s.inv.base.cheddar, base - 2 * B.cheesery.lotBase, 'base consumed');
    eq(CM.cheesery.produce(s, recipe.id, 1).reason, 'busy', 'one job at a time');
    run(s, CM.cheesery.lotTime(COMBO));
    eq(s.lots[recipe.id], 2, 'first lot delivered');
    const loaded = CM.storage.parse(JSON.stringify(s), 3000000);
    eq(loaded.recipes[0].name, 'Abuela Special', 'name persisted');
    run(loaded, CM.cheesery.lotTime(COMBO));
    eq(loaded.lots[recipe.id], 3, 'queued lot finishes after reload');
    eq(loaded.jobs.cheesery, null, 'job done');
    valid(loaded);
  });

  test('[10] a valid order consumes the lot, pays correctly and cannot be delivered twice', () => {
    const s = withLot();
    const recipe = s.recipes[0];
    const order = s.orders[0];
    eq(order.buyer, 'neighbor', 'first slot is the neighbor');
    const quote = CM.merchant.quote(order, recipe);
    const stats = CM.cheesery.statsOf(recipe);
    eq(quote.unit, Math.round(stats.value * B.merchant.buyers.neighbor.priceMult * (quote.bonus ? 1.25 : 1)), 'price');
    eq(CM.merchant.deliver(s, order.id, 'nope').reason, 'unknown-recipe', 'unknown lot');
    eq(CM.merchant.deliver(s, order.id, recipe.id).ok, true, 'deliver');
    eq(s.coins, quote.total, 'coins');
    eq(s.lots[recipe.id], 0, 'lot consumed');
    run(s, B.merchant.cooldownMs + STEP);
    eq(CM.merchant.deliver(s, s.orders[0].id, recipe.id).reason, 'no-lots', 'no lots left');
    // Un pedido exigente rechaza una receta que no cumple.
    const picky = { id: 'x', buyer: 'collector', qty: 1, req: { funk: 99, maturation: 'aged' } };
    eq(CM.merchant.matches(picky, recipe), false, 'requirements are enforced');
    valid(s);
  });

  test('[10b] every generated order can be met by some recipe in the alpha', () => {
    const s = withLot();
    s.deposits.gouda.unlocked = true;
    s.totals.lotsSold = 99;
    const combos = CM.cheesery.allCombos(CM.cheesery.unlockedBases(s));
    const seen = {};
    for (let i = 0; i < 300; i++) {
      s.orders = [];
      CM.merchant.tick(s, STEP);
      for (const o of s.orders) {
        seen[o.buyer] = true;
        truthy(combos.some((c) => CM.merchant.matches(o, { key: CM.cheesery.keyOf(c) })), 'order ' + JSON.stringify(o.req));
      }
    }
    eq(Object.keys(seen).length, 4, 'all four buyers appear');
  });

  test('[11] workers stop at bottlenecks, empty veins and full storage', () => {
    const s = withChain();
    staff(s, ['driller', 'refiner']);
    s.inv.base.cheddar = q.caps(s).base;
    run(s, 10 * 60 * 1000);
    eq(CM.workers.status(s, 'refiner'), 'storage-full', 'refiner');
    eq(CM.workers.status(s, 'driller'), 'storage-full', 'driller');
    eq(q.rawTotal(s), q.caps(s).raw, 'raw stops exactly at capacity');
    valid(s);
    s.inv.raw.cheddar = 0;
    s.inv.base.cheddar = 0;
    s.workers.driller = 0;
    run(s, 60000);
    eq(CM.workers.status(s, 'refiner'), 'no-material', 'refiner without raw');
    s.workers.driller = 1;
    s.workers.miner = 1;
    q.dep(s).veinRemaining = 0;
    q.dep(s).veinRevealed = false;
    eq(CM.workers.status(s, 'driller'), 'waiting-vein', 'driller without vein');
    eq(CM.workers.status(s, 'miner'), 'active', 'miner searching');
  });

  test('[12] save/load keeps the state; an offline return is counted only once', () => {
    CM.storage.clear();
    const s = withLot();
    staff(s, ['driller']);
    CM.storage.save(s, 5000000);
    const loaded = CM.storage.load(5000000).state;
    for (const path of ['coins', 'clock', 'activeDeposit']) eq(loaded[path], s[path], path);
    eq(JSON.stringify(loaded.built), JSON.stringify(s.built), 'buildings');
    eq(JSON.stringify(loaded.inv), JSON.stringify(s.inv), 'inventory');
    eq(JSON.stringify(loaded.deposits), JSON.stringify(s.deposits), 'deposits');
    eq(loaded.recipes.length, 1, 'recipes');

    const first = CM.sim.applyOffline(loaded, 5000000 + 120000);
    truthy(first && first.delta.rawProduced > 0, 'driller produced offline');
    const raw = loaded.totals.rawProduced;
    eq(CM.sim.applyOffline(loaded, 5000000 + 120000), null, 'second call does nothing');
    eq(loaded.totals.rawProduced, raw, 'not counted twice');
    CM.storage.save(loaded, 5000000 + 120000);
    const again = CM.storage.load(5000000 + 120000 + 1000).state;
    eq(CM.sim.applyOffline(again, 5000000 + 120000 + 1000), null, 'refresh right after returning');
    valid(loaded);

    localStorage.setItem(CM.storage.KEY, 'not json');
    truthy(CM.storage.load(1).recovered, 'corrupt save recovers');
    localStorage.setItem(CM.storage.KEY, '{"version":1,"rawCheese":9}');
    eq(CM.storage.load(1).state.coins, 0, 'old schema starts fresh');
    localStorage.setItem(CM.storage.KEY, JSON.stringify({ version: 2, coins: -50, inv: { raw: { cheddar: 'x' } }, workers: { miner: 99 }, lots: { ghost: 5 } }));
    valid(CM.storage.load(1).state);
    CM.storage.clear();
  });

  // Un bot juega desde cero usando solo las acciones del jugador, sin dev tools.
  function playBot(tapEveryMs, limitMs) {
    const s = fresh();
    const milestones = {};
    let lastTap = -1e9;
    const tryBuy = () => {
      for (const id of CM.construction.order) if (CM.construction.build(s, id).ok) return;
      for (const role of ['driller', 'refiner', 'miner']) if (s.workers[role] < 1 && CM.workers.hire(s, role).ok) return;
      if (!s.deposits.gouda.unlocked) {
        // Ahorra para el segundo yacimiento cuando el primero está por la mitad.
        if (CM.deposits.unlock(s, 'gouda').ok) return;
        if (s.deposits.cheddar.veinIndex >= 2) return;
      }
      for (const id of ['drill', 'refinery', 'storage', 'pickaxe', 'house']) if (CM.construction.upgrade(s, id).ok) return;
    };
    while (s.clock < limitMs) {
      CM.sim.step(s, STEP);
      tryBuy();
      if (q.depPhase(s, s.activeDeposit) === 'depleted') {
        const next = B.deposits.find((d) => s.deposits[d.id].unlocked && q.depPhase(s, d.id) !== 'depleted');
        if (next) CM.deposits.setActive(s, next.id);
      }
      if (s.clock - lastTap >= tapEveryMs) {
        lastTap = s.clock;
        if (CM.mining.status(s) === 'ready') CM.mining.hit(s, 'manual');
        else if (CM.drilling.status(s) === 'ready' || (s.jobs.drill && !s.workers.driller)) CM.drilling.tap(s);
        else if (CM.refining.status(s) === 'ready' || s.jobs.refinery) CM.refining.tap(s);
      }
      if (s.built.cheesery && !s.jobs.cheesery) {
        const unknown = CM.cheesery
          .allCombos(CM.cheesery.unlockedBases(s))
          .find((c) => !CM.cheesery.recipeByKey(s, CM.cheesery.keyOf(c)) && CM.cheesery.experiment(s, c).ok);
        if (!unknown && s.recipes.length) {
          const best = s.recipes.slice().sort((a, b) => CM.cheesery.statsOf(b).value - CM.cheesery.statsOf(a).value);
          for (const r of best) if (CM.cheesery.produce(s, r.id, 2).ok) break;
        }
      }
      for (const order of s.orders) {
        if (!order || !order.id) continue;
        const r = s.recipes.find((x) => (s.lots[x.id] || 0) >= order.qty && CM.merchant.matches(order, x));
        if (r) CM.merchant.deliver(s, order.id, r.id);
      }
      if (s.clock % 5000 === 0) valid(s);
      if (s.goalsDone.depleted !== undefined && s.goalsDone.deposit2 !== undefined && s.goalsDone.allRoles !== undefined) break;
    }
    Object.keys(s.goalsDone).forEach((k) => (milestones[k] = Math.round(s.goalsDone[k] / 6000) / 10));
    return { s, milestones };
  }

  test('[13] new game to first sale, three workers and second deposit, without dev tools', () => {
    const { s, milestones } = playBot(400, 3 * 60 * 60 * 1000);
    notes.push('bot (1 tap / 0.4 s) milestones in minutes: ' + JSON.stringify(milestones));
    for (const id of ['vein', 'drill', 'raw', 'refinery', 'base', 'cheesery', 'recipe', 'market', 'sale', 'house', 'worker', 'allRoles', 'deposit2', 'depleted']) {
      truthy(s.goalsDone[id] !== undefined, 'goal ' + id);
    }
    eq(s.devUsed, false, 'no dev tools');
    eq(s.metrics.errors.length, 0, 'errors');
    valid(s);
  });

  test('[13b] a slow player (1 tap / 1.5 s) also completes the circuit', () => {
    const { s, milestones } = playBot(1500, 4 * 60 * 60 * 1000);
    notes.push('slow bot milestones in minutes: ' + JSON.stringify(milestones));
    truthy(s.goalsDone.sale !== undefined && s.goalsDone.deposit2 !== undefined, 'sale and second deposit');
    valid(s);
  });

  test('cheesemaker cooks the assigned recipe on its own, one lot at a time, within limits', () => {
    const s = withLot();
    const recipe = s.recipes[0];
    staff(s, ['cheesemaker']);
    s.inv.base.cheddar = 5;
    run(s, 60000);
    eq(s.lots[recipe.id], 1, 'no recipe assigned: nothing cooked');
    eq(CM.workers.status(s, 'cheesemaker'), 'no-recipe', 'status');
    eq(CM.cheesery.assign(s, 'nope').reason, 'unknown-recipe', 'bad recipe');
    eq(CM.cheesery.assign(s, recipe.id).ok, true, 'assign');
    run(s, CM.cheesery.lotTime(COMBO) * 2 + 1000);
    eq(s.lots[recipe.id], 3, 'two lots cooked with 4 of the 5 base');
    eq(s.inv.base.cheddar, 1, 'base consumed once per lot');
    eq(CM.workers.status(s, 'cheesemaker'), 'no-material', 'stops without base');
    s.inv.base.cheddar = q.caps(s).base;
    run(s, 10 * 60 * 1000);
    eq(q.lotsTotal(s), q.caps(s).lots, 'stops exactly at lot capacity');
    eq(CM.workers.status(s, 'cheesemaker'), 'storage-full', 'status when full');
    eq(s.totals.lotsSold, 0, 'never sells on its own');
    const loaded = CM.storage.parse(JSON.stringify(s), 1);
    eq(loaded.cookRecipe, recipe.id, 'assignment persists');
    valid(s);
  });

  test('softlock guard: with nothing left to extract or sell, the next deposit is affordable', () => {
    const s = fresh();
    s.deposits.cheddar.veinIndex = 3;
    s.coins = 7;
    eq(CM.deposits.stranded(s), true, 'stranded');
    eq(CM.deposits.unlockCost(s, 'gouda'), 7, 'cost drops to what the player has');
    eq(CM.deposits.unlock(s, 'gouda').ok, true, 'unlock');
    s.deposits.gouda.unlocked = false;
    s.inv.base.cheddar = 5;
    eq(CM.deposits.stranded(s), false, 'not stranded while there is base to turn into cheese');
  });

  test('recipe stats follow the documented formula, including synergies', () => {
    const st = CM.cheesery.computeStats({ base: 'cheddar', ingredient: 'pepper', treatment: 'smoked', maturation: 'aged' });
    // taste 3+2+1+2 (+2 Smoked Cheddar, +1 Smoky pepper) = 11; funk 1+1+1+2 = 5; aroma 1+0+2+1 (+1) = 5
    eq(st.taste, 11, 'taste');
    eq(st.funk, 5, 'funk');
    eq(st.aroma, 5, 'aroma');
    eq(st.value, Math.round((11 * 3 + 5 * 2 + 5 * 2) * 1.5), 'value');
    eq(st.synergies.length, 2, 'synergies');
  });

  test('dev tools mark the save and never break invariants', () => {
    const s = fresh();
    CM.dev.addRaw(s, 9999);
    CM.dev.addBase(s, 9999);
    CM.dev.hireAll(s);
    CM.dev.forceStorageFull(s);
    eq(s.devUsed, true, 'devUsed');
    valid(s);
    valid(CM.dev.scenario('colony', 1));
    truthy(CM.dev.report(s).indexOf('invariants: ok') >= 0, 'report');
  });

  const failed = results.filter((r) => !r.ok).length;
  document.getElementById('out').textContent =
    results.map((r) => (r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.ok ? '' : '\n      ' + r.error)).join('\n') +
    '\n\n' +
    (results.length - failed) +
    '/' +
    results.length +
    ' passed\n\n' +
    notes.join('\n');
  window.TEST_RESULTS = { total: results.length, failed, results, notes };
})();
