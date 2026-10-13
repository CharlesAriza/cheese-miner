// Pruebas de los sistemas críticos. Abre tests.html para ejecutarlas.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const STEP = B.sim.stepMs;
  const results = [];
  const notes = [];

  function test(name, fn) {
    // tests.html?bot carga solo el bot, para calibrar desde la consola.
    if (location.search.indexOf('bot') >= 0) return;
    // tests.html?only=texto ejecuta solo las pruebas cuyo nombre lo contiene.
    const only = /[?&]only=([^&]+)/.exec(location.search);
    if (only && name.indexOf(decodeURIComponent(only[1])) < 0) return;
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
    run(s, CM.cheesery.labTime(s));
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
    run(s, 20 * 60 * 1000); // un minero sin mejoras tarda unos 11 minutos en dar con la primera veta de Gouda
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
      truthy(Object.keys(c.aff).length >= 1 && Object.keys(c.aff).every((k) => CM.mice.JOBS.indexOf(k) >= 0 && (c.aff[k] === 1 || c.aff[k] === 2)), 'likes at least one job');
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

  test('offline: the fast path, the slow path and a sliced catch-up give exactly the same game', () => {
    // Una colonia pequeña pero completa: las cinco etapas con ratón, dos recetas y el laboratorio.
    const base = withCheese();
    base.built.house = true;
    base.built.lab = true;
    base.nodes['lab.assistant'] = 1;
    base.coins = 5000;
    for (const k of CM.skills.list) base.skills[k].xp = q.xpForLevel(12);
    ['mining', 'drilling', 'refining', 'cheesemaking'].forEach((k, i) => staff(base, k, 'cheddar', { traits: [['lucky', 'dreamer'], ['strong', 'glutton'], ['mentor', 'clumsy'], ['collector', 'picky']][i], xp: 150 }));
    staff(base, 'trading', 'all', { traits: ['sociable', 'shy'], xp: 190 });
    staff(base, 'research', 'all', { traits: ['scholar', 'lazy'] });
    CM.tree.buy(base, 'drilling', 'bit');
    CM.tree.buy(base, 'trading', 'prices');
    const text = JSON.stringify(base);
    const AWAY = 40 * 60 * 1000;
    const play = (how) => {
      const s = CM.storage.parse(text, 1000000);
      CM.events.length = 0;
      let sum;
      if (how === 'slices') {
        const job = CM.sim.offlineStart(s, s.lastSavedAt + AWAY);
        let turns = 0;
        while (job.left > 0 && turns++ < 10000) CM.sim.offlineRun(job, 0); // presupuesto cero: se corta a cada rato
        truthy(turns > 5, 'the catch-up really ran in several slices (' + turns + ')');
        sum = CM.sim.offlineEnd(job);
      } else {
        CM.noMemo = how === 'slow';
        sum = CM.sim.applyOffline(s, s.lastSavedAt + AWAY);
        CM.noMemo = false;
      }
      valid(s);
      return { s, sum, json: JSON.stringify(s) };
    };
    const fast = play('fast');
    const slow = play('slow');
    const slices = play('slices');
    truthy(fast.sum.coins > 0 && fast.sum.delta.lotsProduced > 0 && fast.s.recipes.length > base.recipes.length, 'the colony worked, sold and researched while away');
    truthy(fast.sum.mouseNews.some((n) => n.to > n.from), 'and the mice levelled up');
    eq(fast.json === slow.json, true, 'remembering answers inside a step changes nothing: coins, stock, levels, traits and research are identical');
    eq(fast.json === slices.json, true, 'catching up in slices gives the same game as doing it in one go');
    eq(JSON.stringify(fast.sum.delta), JSON.stringify(slices.sum.delta), 'and the same summary');
    eq(CM.memo, null, 'nothing is remembered outside a simulation step');
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
    eq(CM.cheesery.experiment(s, Object.assign({}, COMBO, { base: 'gouda' })).ok, true, 'research a gouda recipe in the lab');
    eq(CM.cheesery.produce(s, s.recipes[0].id, 1).ok, true, 'the cheddar line cooks at the same time');
    truthy(s.lab.job && !s.zones.gouda.cookJob && s.zones.cheddar.cookJob, 'the lab researches next to production, without taking a line');
    eq(CM.cheesery.experiment(s, Object.assign({}, COMBO, { base: 'gouda' })).reason, 'lab-busy', 'one research at a time: asking again for the same one does nothing');
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
    t.inv.base.cheddar = CM.cheesery.labCost(t);
    eq(CM.cheesery.experiment(t, Object.assign({}, COMBO, { treatment: 'smoked' })).queued, undefined, 'second recipe');
    run(t, 30000);
    const better = t.recipes[1];
    truthy(CM.cheesery.valueOf(t, better) > CM.cheesery.valueOf(t, t.recipes[0]), 'the smoked one is worth more');
    staff(t, 'cheesemaking');
    eq(CM.cheesery.laneRecipe(t, 'cheddar').id, better.id, 'unpinned: picks the most valuable');
    // A igual maestría: una receta muy hecha no tapa a otra mejor que acaba de llegar
    t.recipes[0].made = 5000;
    truthy(CM.cheesery.valueOf(t, t.recipes[0]) > CM.cheesery.valueOf(t, better) && CM.cheesery.laneRecipe(t, 'cheddar').id === better.id, 'a well-practised recipe does not hide a better new one');
    // Y cuenta lo que cuesta el ingrediente: no cocina a pérdidas una receta más cara
    const pricey = CM.cheesery.labDiscover(t, CM.cheesery.keyOf(Object.assign({}, COMBO, { ingredient: 'truffle' })), 1);
    t.coins = 1000;
    truthy(CM.shop.price(t, pricey) > CM.shop.price(t, better) && CM.shop.price(t, pricey) - 60 < CM.shop.price(t, better) && CM.cheesery.laneRecipe(t, 'cheddar').id === better.id, 'nor does it cook at a loss a cheese whose ingredient costs more than it adds');
    t.recipes.pop();
    t.totals.recipes -= 1;
    delete t.lots[pricey.id];
    t.totals.lotsProduced -= 1;
    t.recipes[0].made = 0;
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
    eq(CM.cheesery.totalCombos(), Object.keys(B.bases).length * 4 * 3 * 3, 'recipe space');
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
    truthy(s.lots[recipe.id] >= 3 + 20 && s.lots[recipe.id] <= 3 + 22, 'cooks every pair of base it has, with no cheese cap (its skill level adds the odd extra cheese): ' + s.lots[recipe.id]);
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
    eq(CM.mice.recruitCost(s), cost3, 'dismissing does not make the next recruit cheaper');
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

  test('traits: mice develop them on their own, shaped by the work they have done', () => {
    const T = B.mice.traits;
    const M = B.mice;
    const kinds = { good: 0, quirk: 0, job: 0, legend: 0 };
    Object.keys(T).forEach((k) => (kinds[T[k].kind] += 1));
    truthy(kinds.good >= 20 && kinds.quirk >= 12 && kinds.legend >= 12, 'a long catalogue: ' + JSON.stringify(kinds));
    for (const skill of CM.mice.JOBS) eq(CM.mice.jobTraits(skill).length, 5, 'five job traits for ' + skill);
    for (const c of B.mice.combos) truthy(c.needs.length >= 2 && c.needs.every((id) => T[id]), 'combo ' + c.id + ' uses real traits');
    for (const k of Object.keys(M.jobPools)) truthy(M.jobPools[k].every((id) => T[id] && T[id].kind === 'good'), 'the traits a job leaves are real, good traits: ' + k);
    const s = withChain();
    const m = staff(s, 'drilling', 'cheddar', { traits: ['fast', 'glutton'] });
    eq(CM.mice.pending(m), null, 'nothing to develop before level 10');
    // Al llegar al nivel 10 desarrolla un rasgo él solo, sin nada que elegir
    CM.events.length = 0;
    CM.mice.addXp(s, m, 1e4);
    CM.mice.reward(s, 'drilling', 'cheddar');
    truthy(m.learned.length >= 1 && m.picks === m.learned.length && !CM.mice.pending(m), 'the trait arrives on its own: nothing is left pending');
    truthy(CM.events.some((e) => e.type === 'traitLearned' && e.id === m.id && e.auto), 'and the game announces it');
    eq(m.offer, undefined, 'there are no choices any more');
    // Hasta seis, sin repetir y nunca una manía
    m.xp = 1e9;
    CM.mice.choice(s, m);
    eq(m.picks, M.traitSlots, 'six developed traits at most');
    eq(new Set(m.traits.concat(m.learned)).size, m.traits.length + m.learned.length, 'no repeated traits');
    truthy(m.learned.every((id) => T[id].kind !== 'quirk'), 'levelling up never gives a quirk');
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(back.mice[0].learned.join(), m.learned.join(), 'traits survive a reload');
    // Muchos ratones: el historial de trabajo inclina lo que desarrollan; un legendario es raro
    const grown = (jobs) => {
      const out = { legend: 0, none: 0, one: 0, many: 0, themed: 0, total: 0, quirk: 0 };
      for (let i = 0; i < 3000; i++) {
        const t = CM.mice.normalize({ id: 'z' + i, name: 'z', traits: ['steady', 'dreamer'], aff: {}, look: 1, rarity: 0, xp: 1e9, rank: 0, post: '', rest: true, jobs: Object.assign({}, jobs) });
        CM.mice.grow(s, t);
        const legs = t.learned.filter((id) => T[id].kind === 'legend').length;
        out.legend += legs;
        out[legs === 0 ? 'none' : legs === 1 ? 'one' : 'many'] += 1;
        out.themed += t.learned.filter((id) => M.jobPools.mining.indexOf(id) >= 0).length;
        out.quirk += t.learned.filter((id) => T[id].kind === 'quirk').length;
        out.total += t.learned.length;
      }
      return out;
    };
    CM.events.length = 0;
    const miners = grown({ mining: 5000 });
    const traders = grown({ trading: 5000 });
    CM.events.length = 0;
    truthy(miners.themed > traders.themed * 1.3, 'a life of mining leaves more mining traits (' + miners.themed + ' vs ' + traders.themed + ')');
    eq(miners.quirk + traders.quirk, 0, 'never a quirk');
    truthy(miners.none > 3000 * 0.84 && miners.none < 3000 * 0.93, 'most mice reach level 60 with no legendary trait: ' + miners.none + '/3000');
    truthy(miners.one > 3000 * 0.07 && miners.one < 3000 * 0.15, 'about one in ten gets one: ' + miners.one);
    truthy(miners.many + traders.many > 0 && miners.many < 3000 * 0.02, 'two in the same mouse is possible and very rare: ' + (miners.many + traders.many) + '/6000');
    notes.push('legendary traits at level 60 (3000 mice): none ' + miners.none + ', one ' + miners.one + ', two or more ' + miners.many);
    valid(s);
  });

  test('mice screen data: what a mouse does on its own, what it does in its post, and the colony news', () => {
    const s = withChain();
    const K = CM.mice;
    const a = staff(s, 'drilling', 'cheddar', { traits: ['mentor', 'dreamer'] });
    const b = staff(s, 'refining', 'cheddar', { traits: ['lucky', 'forgetful'] });
    const alone = K.solo(b, 'refining', s, 'cheddar');
    truthy(Math.abs(alone - K.speed(b, 'refining') * K.yieldMult(b, 'refining') * (1 + K.doubleChance(b, 'refining'))) < 1e-9, 'the solo estimate counts only the mouse itself');
    truthy(K.here(s, b) > alone, 'in its post it also gets what its neighbour gives (' + K.here(s, b).toFixed(2) + ' vs ' + alone.toFixed(2) + ')');
    eq(K.here(s, Object.assign({}, b, { post: '' })), 0, 'a mouse with no post produces nothing');
    truthy(K.neighboursOf(s, 'refining', 'cheddar').indexOf(a) >= 0 && K.neighboursOf(s, 'drilling', 'cheddar').indexOf(b) >= 0, 'neighbours are the mice next to it in the line');
    // Comparar candidatos no mueve a nadie
    const posts = s.mice.map((m) => m.post).join();
    K.solo(a, 'refining', s, 'cheddar');
    eq(s.mice.map((m) => m.post).join(), posts, 'estimating a candidate does not move anybody');
    // Intercambio en un toque, sin duplicar ni perder a nadie
    eq(K.assign(s, a.id, 'refining:cheddar').ok, true, 'assign onto a taken post');
    eq(a.post + '/' + b.post, 'refining:cheddar/drilling:cheddar', 'the two swap places');
    eq(new Set(s.mice.map((m) => m.post)).size, s.mice.length, 'nobody shares a post');
    // El diario recoge lo que desarrollan
    eq(s.news.length, 0, 'the news log starts empty');
    a.xp = 1e4;
    K.grow(s, a);
    truthy(s.news.length >= 1 && s.news[0].name === a.name && a.learned.indexOf(s.news[0].trait) >= 0, 'a developed trait goes into the colony news');
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(back.news.length, s.news.length, 'and the news survive a reload');
    // Lo que ocurre con el juego cerrado se resume
    s.built.house = true;
    s.coins = 1e6;
    K.careStart(s, b.id, 'quirk', 'forgetful');
    s.lastSavedAt = 0;
    const sum = CM.sim.applyOffline(s, B.mice.care.ms + 60000);
    truthy(sum.careDone && sum.careDone.id === b.id && !s.care, 'the return summary knows a treatment finished');
    valid(s);
  });

  test('mouse house bed: treat a quirk or retrain a speciality while the mouse keeps working', () => {
    const s = withChain();
    const K = CM.mice;
    const M = B.mice;
    const m = staff(s, 'drilling', 'cheddar', { traits: ['fast', 'dreamer'], spec: { drilling: 'bitexpert' }, jobs: { drilling: M.jobGrades[1] } });
    const other = staff(s, 'refining', 'cheddar', { traits: ['strong', 'glutton'] });
    eq(K.careStart(s, m.id, 'quirk', 'dreamer').reason, 'invalid', 'the bed is in the Mouse House');
    s.built.house = true;
    s.coins = 0;
    eq(K.careStart(s, m.id, 'quirk', 'dreamer').reason, 'no-coins', 'a treatment costs coins');
    s.coins = 1e6;
    eq(K.careStart(s, m.id, 'quirk', 'fast').reason, 'invalid', 'only a quirk can be treated');
    const cost = K.careCost(s, 'quirk');
    eq(K.careStart(s, m.id, 'quirk', 'dreamer').ok, true, 'treat Dreamer');
    eq(s.coins, 1e6 - cost, 'paid once');
    eq(K.careStart(s, other.id, 'quirk', 'glutton').reason, 'bed-busy', 'one mouse at a time');
    truthy(K.careCost(s, 'quirk') === cost * M.care.growth, 'the next treatment costs more');
    // Mientras tanto sigue en su puesto y trabajando
    const raw = s.totals.rawProduced;
    s.zones.cheddar.veinRevealed = true;
    s.zones.cheddar.veinRemaining = 1e6;
    run(s, M.care.ms / 2);
    truthy(m.post === 'drilling:cheddar' && s.totals.rawProduced > raw, 'the mouse keeps its post and keeps drilling');
    truthy(m.traits.indexOf('dreamer') >= 0 && s.care && s.care.remaining > 0, 'the quirk is still there half way');
    const slow = K.speed(m, 'drilling');
    const mid = CM.storage.parse(JSON.stringify(s), 1000000);
    truthy(mid.care && mid.care.id === m.id && mid.care.what === 'dreamer', 'the treatment survives a reload');
    // También con el juego cerrado
    s.lastSavedAt = 0;
    CM.sim.applyOffline(s, M.care.ms);
    eq(s.care, null, 'the bed is free again');
    truthy(m.traits.indexOf('dreamer') < 0 && K.speed(m, 'drilling') > slow, 'offline too: the quirk is gone and the mouse is faster');
    eq(other.traits.indexOf('glutton') >= 0, true, 'nobody else is treated on their own');
    // Reentrenar una especialidad: se elige, conserva el grado
    eq(K.careStart(s, m.id, 'spec', 'drilling', 'bitexpert').reason, 'invalid', 'retraining needs a different speciality');
    eq(K.careStart(s, m.id, 'spec', 'refining', 'purifier').reason, 'invalid', 'and a speciality to retrain');
    const grade = K.gradeOf(m, 'drilling');
    eq(K.careStart(s, m.id, 'spec', 'drilling', 'deepbore').ok, true, 'retrain to Deep Bore');
    run(s, M.care.ms + 1000);
    eq(m.spec.drilling + '/' + K.gradeOf(m, 'drilling'), 'deepbore/' + grade, 'the new speciality, at the grade it had');
    // Despedir al que está en la cama la deja libre
    K.careStart(s, other.id, 'quirk', 'glutton');
    K.dismiss(s, other.id);
    eq(s.care, null, 'dismissing the patient frees the bed');
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
    // Especialidad: llega sola al primer umbral, una de las cinco de ese oficio
    m.jobs.drilling = B.mice.jobGrades[0];
    CM.mice.choice(s, m);
    truthy(m.spec.drilling && T[m.spec.drilling].job === 'drilling', 'a drilling speciality arrives on its own');
    m.spec.drilling = 'bitexpert';
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

  test('team combos: neighbours in a line and the four mice of a rock', () => {
    const s = fresh();
    CM.dev.unlockBuildings(s);
    s.devUsed = false;
    const a = staff(s, 'drilling', 'cheddar', { traits: ['fast'] });
    const b = staff(s, 'refining', 'cheddar', { traits: ['fast'] });
    const link = B.mice.links.find((l) => l.id === 'assembly');
    for (const l of B.mice.links) truthy(l.a !== l.b || l.a === '*legend', l.id + ' needs two different traits');
    eq(CM.mice.linksAt(s, 'drilling', 'cheddar', 'refining', 'cheddar').length, 0, 'repeating the same trait forms nothing');
    b.traits = ['steady'];
    CM.mice.assign(s, b.id, 'refining:cheddar');
    eq(CM.mice.linksAt(s, 'drilling', 'cheddar', 'refining', 'cheddar').map((l) => l.id).join(), 'assembly', 'Fast next to Steady form Assembly Line');
    const alone = CM.mice.speed(a, 'drilling');
    truthy(Math.abs(CM.mice.speed(a, 'drilling', s, 'cheddar') - alone - link.eff.speed) < 1e-9, 'and both get its effect');
    truthy(Math.abs(CM.mice.speed(b, 'refining', s, 'cheddar') - CM.mice.speed(b, 'refining') - link.eff.speed) < 1e-9, 'the other one too');
    eq(CM.mice.speed(a, 'drilling'), alone, 'BEST FIT does not see it');
    truthy(s.album['link:assembly'] && CM.events.some((e) => e.type === 'teamCombo' && e.name === link.name), 'forming it discovers it, as soon as the mouse is placed');
    CM.events.length = 0;
    CM.mice.scan(s);
    eq(CM.events.length, 0, 'only once');
    // No son vecinos si hay un puesto en medio
    CM.mice.assign(s, b.id, 'cheesemaking:cheddar');
    eq(CM.mice.linksAt(s, 'drilling', 'cheddar', 'refining', 'cheddar').length, 0, 'not neighbours any more');
    eq(CM.mice.speed(a, 'drilling', s, 'cheddar'), alone, 'the effect is gone');
    // El tendero es vecino del quesero
    const k = staff(s, 'trading', 'all', { traits: ['fast'] });
    b.traits = ['steady'];
    CM.mice.assign(s, b.id, 'cheesemaking:cheddar');
    truthy(CM.mice.speed(k, 'trading', s, 'all') > CM.mice.speed(k, 'trading'), 'the shopkeeper links with the cheesemaker');
    // Dos legendarios seguidos
    a.traits = ['midas'];
    b.traits = ['timeskipper'];
    CM.mice.assign(s, b.id, 'refining:cheddar');
    truthy(CM.mice.linksAt(s, 'drilling', 'cheddar', 'refining', 'cheddar').some((l) => l.id === 'court'), 'two legends side by side form Royal Court');
    // De roca: hacen falta los cuatro puestos
    eq(CM.mice.setsAt(s, 'cheddar').length, 0, 'no rock combo with empty posts');
    const c = staff(s, 'mining', 'cheddar');
    const d = staff(s, 'cheesemaking', 'cheddar');
    truthy(CM.mice.setsAt(s, 'cheddar').some((x) => x.id === 'family'), 'four mice with the same fur: Family Business');
    truthy(CM.mice.setsAt(s, 'cheddar').some((x) => x.id === 'crown'), 'a legend on the rock: Under the Crown');
    const before = CM.mice.speed(c, 'mining', s, 'cheddar');
    truthy(before > CM.mice.speed(c, 'mining'), 'the miner gets the rock combos');
    [a, b, c, d].forEach((m) => (m.aff = { [m.post.split(':')[0]]: 1 }));
    truthy(CM.mice.setsAt(s, 'cheddar').some((x) => x.id === 'dreamteam'), 'everyone likes their job: Dream Team');
    CM.mice.dismiss(s, d.id);
    eq(CM.mice.setsAt(s, 'cheddar').length, 0, 'losing one breaks the rock combos');
    truthy(CM.mice.speed(c, 'mining', s, 'cheddar') < before, 'and the bonus is gone');
    run(s, 5000);
    valid(s);
    truthy(CM.mice.albumTotal >= 130, 'the album counts team combos: ' + CM.mice.albumTotal);
  });

  test('old cloned mice become different from each other, keeping what they earned', () => {
    const s = fresh();
    CM.dev.unlockBuildings(s);
    CM.dev.hireAll(s); // cinco ratones idénticos: Fast y Dreamer
    eq(new Set(s.mice.map((m) => m.traits.join())).size, 1, 'they start as clones');
    s.mice[0].xp = 5000;
    s.mice[0].rank = 1;
    s.mice[0].learned = ['lucky'];
    s.mice[0].picks = 1;
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    truthy(new Set(back.mice.map((m) => m.traits.join())).size >= 4, 'after loading they differ: ' + back.mice.map((m) => m.traits.join('+')).join(' / '));
    truthy(back.mice.every((m) => B.mice.traits[m.traits[0]].kind === 'good' && B.mice.traits[m.traits[1]].kind === 'quirk'), 'each has one good trait and one quirk');
    truthy(back.mice[0].xp === 5000 && back.mice[0].rank === 1 && back.mice[0].learned[0] === 'lucky', 'level, rank and learned traits are kept');
    truthy(back.mice[0].learned.length === Math.floor(CM.mice.level(back.mice[0]) / B.mice.traitEvery), 'and the traits its level was owed arrive on their own');
    truthy(back.mice.every((m) => m.traits.indexOf('lucky') < 0 || m.learned.indexOf('lucky') < 0), 'no trait is repeated on a mouse');
    const again = CM.storage.parse(JSON.stringify(back), 1000000);
    eq(JSON.stringify(again.mice.map((m) => m.traits)), JSON.stringify(back.mice.map((m) => m.traits)), 'loading again changes nothing');
    const one = fresh();
    CM.dev.unlockBuildings(one);
    staff(one, 'drilling', 'cheddar', { traits: ['fast', 'dreamer'] });
    eq(CM.storage.parse(JSON.stringify(one), 1000000).mice[0].traits.join(), 'fast,dreamer', 'a single Fast Dreamer mouse is left alone');
  });

  test('cheese lab: its own building, a Research post, and a direction chosen by the player', () => {
    const s = withCheese();
    const C = CM.cheesery;
    const K = CM.mice;
    eq(s.recipes.length, 1, 'one recipe from the first research, done by hand');
    eq(s.lots[s.recipes[0].id], 1, 'research gives one cheese');
    // Investigar no para la quesería
    staff(s, 'cheesemaking');
    s.inv.base.cheddar = 60;
    s.skills.cheesemaking.xp = q.xpForLevel(9);
    run(s, 2000);
    const made = s.totals.lotsProduced;
    eq(C.experiment(s, Object.assign({}, COMBO, { treatment: 'smoked' })).ok, true, 'research while the line cooks');
    eq(C.experiment(s, Object.assign({}, COMBO, { ingredient: 'pepper' })).queued, true, 'one research at a time: another one by hand waits its turn');
    eq(s.lab.next, C.keyOf(Object.assign({}, COMBO, { ingredient: 'pepper' })), 'it is next');
    C.labCancel(s);
    truthy(C.labTime(s) > B.cheesery.labBaseMs && C.labCost(s) > B.cheesery.experimentBase, 'each new recipe takes longer and costs more base');
    run(s, C.labTime(s) * 2);
    eq(s.recipes.length, 2, 'the recipe is discovered (an inconclusive result only delays it)');
    truthy(s.totals.lotsProduced > made + 1, 'and the line kept producing meanwhile');
    eq(CM.construction.build(s, 'lab').reason, 'locked', 'the lab needs three recipes first');
    // Sin base suficiente el encargo queda apuntado y el laboratorio la reserva
    s.inv.base.cheddar = 0;
    const asked = Object.assign({}, COMBO, { ingredient: 'pepper', treatment: 'smoked' });
    eq(C.experiment(s, asked).queued, true, 'with no base the research is queued');
    eq(s.lab.want, 'cheddar', 'and the lab reserves the base');
    s.inv.base.cheddar = C.labCost(s) + 1;
    run(s, 300);
    truthy(s.lab.job && s.lab.job.key === C.keyOf(asked) && !s.lab.next, 'it starts as soon as the base is there, before the cheesemaker takes it');
    run(s, C.labTime(s) * 2);
    s.inv.base.cheddar = 0;
    C.experiment(s, Object.assign({}, COMBO, { maturation: 'aged' }));
    truthy(s.lab.next, 'another one queued');
    C.labCancel(s);
    eq(s.lab.next + s.lab.want, '', 'a queued research can be cancelled');
    // El edificio: tres recetas a mano, y lo construye el jugador
    eq(s.recipes.length, 3, 'three recipes by hand');
    eq(K.posts(s).some((p) => p.skill === 'research'), false, 'no Research post without the building');
    eq(CM.tree.buy(s, 'lab', 'assistant').reason, 'level-locked', 'lab upgrades need the building');
    eq(CM.construction.build(s, 'lab').ok, true, 'build the Cheese Lab');
    // El laboratorio empieza sencillo y gana funciones con sus mejoras
    eq(K.posts(s).some((p) => p.skill === 'research'), false, 'a new lab has no Research post yet');
    s.inv.base.cheddar = 500;
    s.coins = 50000;
    eq(CM.tree.buy(s, 'lab', 'advanced').reason, 'level-locked', 'Advanced Research needs the assistant first');
    eq(CM.tree.buyAll(s, 'lab').ok && CM.tree.rank(s, 'lab', 'assistant'), 0, 'BUY ALL never buys an upgrade that opens a function');
    s.nodes = {};
    s.coins = 50000;
    eq(CM.tree.buy(s, 'lab', 'assistant').ok, true, 'buy Research Assistant');
    truthy(K.posts(s).some((p) => p.key === 'research:all'), 'it opens the Research post');
    run(s, 6000);
    eq(s.lab.job, null, 'with no mouse the lab waits for you');
    const m = staff(s, 'research', 'all', { aff: { research: 2 } });
    s.lab.dir = 'ingredient:pepper';
    run(s, 4200);
    truthy(s.lab.job && C.keyOf(C.labPick(s, false) || {}) !== undefined && C.labDir(s) === 'value', 'with only the assistant the mouse goes for the most valuable recipe, whatever was set');
    s.lab.dir = '';
    eq(CM.tree.buy(s, 'lab', 'advanced').ok, true, 'buy Advanced Research');
    eq(s.lab.dir, 'value', 'the lab carries on with what it was doing');
    s.lab.dir = '';
    s.lab.job = null;
    run(s, 6000);
    eq(s.lab.job, null, 'with directions open, no direction means the mouse does not choose for you');
    const time = C.labTime(s);
    const baseCost = C.labCost(s);
    CM.tree.buy(s, 'lab', 'burners');
    CM.tree.buy(s, 'lab', 'samples');
    truthy(C.labTime(s) < time && C.labCost(s) <= baseCost, 'Bunsen Burners and Smaller Samples make research faster and cheaper');
    // Con dirección: el ratón ejecuta
    s.skills.cheesemaking.xp = q.xpForLevel(12);
    s.lab.dir = 'ingredient:honey';
    run(s, 4200);
    truthy(s.lab.job && C.parseKey(s.lab.job.key).ingredient === 'honey', 'it researches inside the direction you set');
    truthy(K.speed(m, 'research', s, 'all') > 1, 'a mouse that loves research is faster at it');
    s.lab.dir = 'fast';
    eq(C.lotTime(C.labPick(s, false)), Math.min(...C.allCombos(['cheddar']).filter((c) => !C.partLocked(s, 'ingredient', c.ingredient) && !C.partLocked(s, 'treatment', c.treatment) && !C.partLocked(s, 'maturation', c.maturation) && !C.recipeByKey(s, C.keyOf(c))).map((c) => C.lotTime(c))), 'the quick direction goes for the fastest recipe to cook');
    s.lab.dir = 'value';
    const jobs = m.jobs.research || 0;
    run(s, C.labTime(s) * 3);
    truthy((m.jobs.research || 0) > jobs && m.xp > 0, 'the researcher gains experience and specialises in Research');
    // Rasgos de Research: coste, fiabilidad, hallazgos
    eq(K.jobTraits('research').length, 5, 'five Research job traits');
    const cost = C.labCost(s);
    const odds = C.labOdds(s);
    m.spec.research = 'thrifty';
    m.jobs.research = B.mice.jobGrades[2];
    truthy(C.labCost(s) < cost, 'Thrifty makes research cheaper');
    m.spec.research = 'methodical';
    truthy(C.labOdds(s).fail < odds.fail, 'Methodical means fewer inconclusive results');
    m.spec.research = 'goodnose';
    truthy(C.labOdds(s).luck > odds.luck, 'Good Nose means more breakthroughs');
    m.learned = ['eureka'];
    eq(C.labOdds(s).fail, 0, 'Eureka never gets an inconclusive result');
    // Un hallazgo nace con maestría
    const before = s.recipes.length;
    const r = C.labDiscover(s, C.keyOf(C.labPick(s, false)), B.cheesery.labBreakthroughMade);
    truthy(C.masteryLevel(r) > 1 && s.recipes.length === before + 1, 'a breakthrough recipe starts with mastery');
    // Si le falta base, la reclama antes que la quesería
    s.lab.job = null;
    s.inv.base.cheddar = 0;
    run(s, 4200);
    eq(s.lab.want, 'cheddar', 'with no base left the lab asks for some');
    s.inv.base.cheddar = C.labCost(s) + 1;
    run(s, 4200);
    truthy(s.lab.job, 'and takes it before the cheesemaker does');
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(back.lab.dir, 'value', 'the direction survives a reload');
    truthy(back.lab.job && back.mice.some((x) => x.post === 'research:all'), 'and so do the research and the researcher');
    valid(s);
  });

  test('strains: another way to make the same cheese, found by the researcher and chosen by the player', () => {
    const s = withCheese();
    const C = CM.cheesery;
    const r = s.recipes[0];
    s.built.lab = true;
    s.coins = 100000;
    eq(C.strainsOpen(s), false, 'a lab does not know about strains until it is upgraded');
    eq(CM.tree.buy(s, 'lab', 'strains').reason, 'level-locked', 'Strain Research needs Cheesemaking level 10');
    s.skills.cheesemaking.xp = q.xpForLevel(10);
    eq(C.strainStart(s, r.id).reason, 'locked', 'no strains without the upgrade');
    eq(CM.tree.buy(s, 'lab', 'strains').ok, true, 'buy Strain Research');
    CM.tree.buy(s, 'lab', 'assistant');
    CM.tree.buy(s, 'lab', 'advanced');
    s.lab.dir = '';
    s.coins = 1000;
    s.inv.base.cheddar = 2000;
    s.lab.dir = 'strain';
    run(s, 6000);
    eq(s.lab.job, null, 'with no researcher nothing starts on its own');
    // Primero a mano
    eq(C.strainStart(s, r.id).ok, true, 'look for a strain by hand, on the recipe you choose');
    eq(C.strainStart(s, r.id).queued, true, 'one at a time: asking again queues the next');
    C.labCancel(s);
    run(s, C.labTime(s) * B.cheesery.strainTime * 2);
    truthy(r.strains.length >= 1 && !s.lab.job, 'the strain is found with no mouse');
    s.lab.found = null;
    s.inv.base.cheddar = 0;
    eq(C.strainStart(s, r.id).queued, true, 'with no base the search is queued');
    eq(s.lab.want, 'cheddar', 'and the lab reserves the base');
    C.labCancel(s);
    s.inv.base.cheddar = 2000;
    const res = staff(s, 'research', 'all');
    run(s, 4200);
    truthy(s.lab.job && s.lab.job.strain && s.lab.job.key === r.key, 'the researcher looks for a strain of the recipe the line cooks');
    run(s, C.labTime(s) * B.cheesery.strainTime * 2);
    truthy(r.strains.length >= 2 && !r.strain, 'a strain is found but not used: the player decides');
    truthy(s.lab.found && s.lab.found.recipeId === r.id, 'it waits as a candidate');
    C.strainKeep(s);
    eq(s.lab.found, null, 'keeping the cheese as it is clears the candidate');
    eq(r.strains.length >= 1, true, 'and the strain found is not lost');
    run(s, C.labTime(s) * B.cheesery.strainTime * 8);
    eq(r.strains.length, 3, 'in time the recipe has its three strains');
    truthy((res.jobs.research || 0) > 0, 'the researcher specialises with this work too');
    eq(C.setStrain(s, r.id, 'nope').reason, 'invalid', 'only a strain that was found');
    // Lo que cambia cada una
    s.lab.dir = '';
    s.lab.job = null;
    const plainValue = C.valueOf(s, r);
    const plainTime = C.jobTime(s, C.parseKey(r.key), r);
    C.setStrain(s, r.id, 'quick');
    eq(r.strain, 'quick', 'with the line idle the strain applies at once');
    truthy(C.jobTime(s, C.parseKey(r.key), r) < plainTime && C.valueOf(s, r) < plainValue, 'Quick-set: faster, worth less');
    C.setStrain(s, r.id, 'dense');
    eq(C.baseUse(r), B.cheesery.lotBase * B.strains.dense.base, 'Dense: more base per cheese');
    truthy(C.valueOf(s, r) > plainValue && C.jobTime(s, C.parseKey(r.key), r) === plainTime, 'Dense: worth more, same time');
    s.inv.base.cheddar = B.cheesery.lotBase * B.strains.dense.base - 1;
    eq(C.produce(s, r.id, 1).reason, 'no-base', 'and it does not cook with less');
    s.inv.base.cheddar = B.cheesery.lotBase * B.strains.dense.base;
    eq(C.produce(s, r.id, 1).ok, true, 'cook one dense cheese');
    eq(s.inv.base.cheddar, 0, 'it took all that base');
    // Cambiar a mitad de encargo: entra con el siguiente, y lo hecho no cambia de valor
    C.setStrain(s, r.id, 'teaching');
    eq(r.strain, 'dense', 'mid-batch the strain does not change');
    eq(r.next, 'teaching', 'it waits for the next batch');
    s.jobs.shop = { remaining: 1e9, total: 1e9, coins: 0, count: 0, xp: 0, recipeId: r.id, source: 'manual' }; // la tienda ocupada: nada se vende
    s.lots[r.id] = 3;
    const worth = (s.lots[r.id] + 1) * CM.shop.price(s, r);
    const coins = s.coins;
    run(s, C.jobTime(s, C.parseKey(r.key), r) + STEP);
    eq(r.strain, 'teaching', 'then it changes');
    const after = s.lots[r.id] * CM.shop.price(s, r) + (s.coins - coins);
    truthy(Math.abs(after - worth) <= 1, 'the cheese already made keeps its worth (' + worth + ' vs ' + after + ')');
    // Teaching: el quesero aprende más
    const cook = staff(s, 'cheesemaking');
    s.inv.base.cheddar = 4000;
    run(s, 30000);
    const taught = cook.jobs.cheesemaking;
    C.setStrain(s, r.id, '');
    run(s, 12000);
    eq(r.strain, '', 'back to plain');
    const from = cook.jobs.cheesemaking;
    run(s, 30000);
    truthy(taught > (cook.jobs.cheesemaking - from) * 2, 'Teaching: the cheesemaker learns faster (' + Math.round(taught) + ' vs ' + Math.round(cook.jobs.cheesemaking - from) + ')');
    // El Cheesemaker compara recetas sin contar la cepa
    C.labDiscover(s, C.keyOf(Object.assign({}, COMBO, { treatment: 'smoked' })), 1);
    C.setStrain(s, r.id, 'dense');
    run(s, 12000);
    truthy(C.valueOf(s, r) > C.valueOf(s, s.recipes[1]) && C.laneRecipe(s, 'cheddar').id === s.recipes[1].id, 'a dense cheese does not fool the cheesemaker: it still cooks the best recipe');
    const back = CM.storage.parse(JSON.stringify(s), 1000000);
    eq(back.recipes[0].strain + '/' + back.recipes[0].strains.length, 'dense/3', 'strains survive a reload');
    // Con el juego cerrado: el cambio pendiente entra y el investigador sigue encontrando
    s.zones.cheddar.cookRecipe = r.id;
    run(s, 12000);
    truthy(s.zones.cheddar.cookJob && s.zones.cheddar.cookJob.recipeId === r.id, 'the line is cooking the dense cheese');
    C.setStrain(s, r.id, 'quick');
    eq(r.next, 'quick', 'changed mid-batch, just before closing the game');
    s.lab.dir = 'strain';
    s.lab.found = null;
    s.inv.base.cheddar = 5000;
    s.lastSavedAt = 0;
    const away = CM.sim.applyOffline(s, 20 * 60 * 1000);
    eq(r.strain + '/' + r.next, 'quick/undefined', 'offline the new strain comes in with the next batch');
    truthy(s.recipes[1].strains.length >= 1, 'offline the researcher keeps finding strains');
    truthy(away.strainWaiting && !s.recipes[1].strain, 'the summary says one is waiting, and nothing was equipped for you');
    // El laboratorio solo aparta su parte: la línea sigue cocinando con el resto
    s.lab.job = null;
    s.lab.dir = '';
    s.lab.want = 'cheddar';
    s.zones.cheddar.cookJob = null;
    s.inv.base.cheddar = C.labCost(s) + C.baseUse(r) * 2;
    eq(C.start(s, 'cheddar').ok, true, 'with the lab saving up, the line still cooks');
    truthy(s.inv.base.cheddar >= C.labCost(s), 'and leaves the base the lab needs (' + s.inv.base.cheddar + ' >= ' + C.labCost(s) + ')');
    s.zones.cheddar.cookJob = null;
    s.inv.base.cheddar = C.labCost(s) + C.baseUse(r) - 1;
    eq(C.start(s, 'cheddar').reason, 'no-base', 'it only waits when there is not enough for both');
    s.lab.want = '';
    valid(s);
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

  test('buy all: sweeps every tree cheapest first, says beforehand what it will buy, and never pays twice', () => {
    const make = (coins) => {
      const g = fresh();
      CM.dev.unlockBuildings(g);
      g.devUsed = false;
      g.coins = coins;
      return g;
    };
    const s = make(5000);
    const plan = CM.tree.sweep(s, true);
    eq(s.coins, 5000, 'the preview spends nothing');
    eq(Object.keys(s.nodes).filter((k) => s.nodes[k]).length, Object.keys(make(5000).nodes).filter((k) => make(5000).nodes[k]).length, 'and buys nothing');
    truthy(plan.bought > 3 && Object.keys(plan.bySkill).length > 1, 'it reaches several trees, not only the first one');
    // El mismo recorrido, hecho a mano: siempre lo más barato de todos los árboles.
    const o = make(5000);
    let steps = 0;
    for (let guard = 0; guard < 500; guard++) {
      let best = null;
      for (const skill of Object.keys(B.trees)) {
        for (const n of B.trees[skill]) {
          const info = CM.tree.info(o, skill, n.id);
          if (n.unlock || info.locked || info.maxed) continue;
          if (!best || info.cost < best.cost) best = { skill, id: n.id, cost: info.cost };
        }
      }
      if (!best || best.cost > o.coins) break;
      truthy(CM.tree.buy(o, best.skill, best.id).ok, 'manual purchase ' + guard);
      steps += 1;
    }
    const real = CM.tree.sweep(s);
    eq(real.bought, plan.bought, 'it buys what the preview said');
    eq(real.cost, plan.cost, 'for the price the preview said');
    eq(real.bought, steps, 'the same number of upgrades as buying the cheapest one by hand each time');
    eq(JSON.stringify(s.nodes), JSON.stringify(o.nodes), 'and exactly the same upgrades');
    eq(s.coins, 5000 - plan.cost, 'coins go down by the total, once');
    truthy(real.next && real.next.cost > s.coins, 'it says which upgrade comes next and it cannot be paid yet');
    // Un segundo toque no compra ni cobra nada.
    const coins = s.coins;
    const again = CM.tree.sweep(s);
    eq(again.bought, 0, 'a second tap buys nothing');
    eq(s.coins, coins, 'and charges nothing');
    // Sin monedas: nada, y dice qué es lo siguiente.
    const poor = make(0);
    eq(CM.tree.sweep(poor).bought, 0, 'no coins, no purchase');
    truthy(CM.tree.sweep(poor, true).next, 'but it still names the next upgrade');
    // Las mejoras que abren una función las compra el jugador.
    const lab = make(1e9);
    lab.built.lab = true;
    CM.tree.sweep(lab);
    eq(CM.tree.rank(lab, 'lab', 'assistant'), 0, 'never an upgrade that opens a function');
    // Lo que aún no está construido no se mejora.
    const early = fresh();
    early.coins = 1e4;
    const e = CM.tree.sweep(early);
    truthy(e.bought > 0 && !e.bySkill.drilling && !e.bySkill.trading, 'trees of buildings not built yet are left alone');
    // Un presupuesto enorme: se detiene, no deja monedas negativas y no rompe nada.
    const rich = make(1e40);
    const big = CM.tree.sweep(rich, true);
    const done = CM.tree.sweep(rich);
    eq(done.bought, big.bought, 'a huge budget: preview and purchase agree');
    truthy(rich.coins >= 0 && done.bought <= 500, 'and it stops');
    valid(s);
    valid(rich);
    // Guardar y cargar conserva lo comprado.
    const back = CM.storage.parse(JSON.stringify(s), s.lastSavedAt);
    eq(JSON.stringify(back.nodes), JSON.stringify(s.nodes), 'upgrades survive a reload');
    eq(back.coins, s.coins, 'and so do the coins');
  });

  test('mice: several promotions at once cost and do exactly what one by one would', () => {
    const R = B.mice.ranks;
    const xpAt = (lv) => ((B.mice.xpBase * (Math.pow(B.mice.xpGrowth, lv - 1) - 1)) / (B.mice.xpGrowth - 1)) * 1.001;
    // Una colonia con `n` ratones listos: niveles y rangos variados, algunos con varios rangos acumulados.
    const make = (n, coins) => {
      const g = fresh();
      CM.dev.unlockBuildings(g);
      g.devUsed = false;
      const posts = ['drilling', 'refining', 'mining', 'cheesemaking', 'trading'];
      for (let i = 0; i < n; i++) {
        const m = staff(g, posts[i % 5], 'cheddar', i < 5 ? {} : { post: '' });
        m.xp = xpAt([12, 30, 45][i % 3]);
        m.rank = i % 3 === 1 && i % 2 === 1 ? 1 : 0;
      }
      // Dos que no pueden ascender: uno sin nivel y otro ya en lo más alto.
      staff(g, 'mining', 'cheddar', { post: '' }).xp = xpAt(5);
      staff(g, 'mining', 'cheddar', { post: '', rank: R.length - 1 }).xp = xpAt(50);
      g.coins = coins;
      return g;
    };
    const ranks = (g) => g.mice.map((m) => m.rank).join('');
    for (const n of [1, 5, 15, 26]) {
      const s = make(n, 1e12);
      const all = CM.mice.promotePicks(s, 'all');
      eq(Object.keys(all).length, n, n + ' ready: select all picks exactly those who can go up');
      const before = ranks(s);
      const plan = CM.mice.promoteCost(s, all);
      eq(ranks(s), before, 'selecting buys nothing');
      eq(s.coins, 1e12, 'and charges nothing');
      // Lo mismo, uno a uno, en otra partida igual.
      const o = make(n, 1e12);
      let taps = 0;
      for (const m of o.mice) while (CM.mice.promote(o, m.id).ok) taps += 1;
      const r = CM.mice.promoteMany(s, all);
      truthy(r.ok, 'bulk promotion goes through');
      eq(r.steps, taps, 'as many ranks as tapping PROMOTE ' + taps + ' times');
      eq(r.mice, n, 'for every selected mouse');
      eq(r.cost, plan.cost, 'the charge is the total shown');
      eq(s.coins, o.coins, 'coins end exactly as one by one');
      eq(ranks(s), ranks(o), 'ranks end exactly as one by one');
      eq(s.totals.coinsSpent, o.totals.coinsSpent, 'and so does the money spent');
      for (let i = 0; i < s.mice.length; i++) if (s.mice[i].post) eq(CM.mice.here(s, s.mice[i]), CM.mice.here(o, o.mice[i]), 'same output on the post');
      // Un segundo toque: ya no queda nada que ascender.
      const coins = s.coins;
      eq(CM.mice.promoteMany(s, all).ok, false, 'a second confirmation does nothing');
      eq(s.coins, coins, 'and charges nothing');
      valid(s);
      const back = CM.storage.parse(JSON.stringify(s), s.lastSavedAt);
      eq(back.mice.map((m) => m.rank).join(''), ranks(s), 'ranks survive a reload');
    }
    // Varios rangos acumulados: cada paso cobra el suyo y no se salta el requisito de nivel.
    const s = make(3, 1e12);
    const [a, b, c] = s.mice;
    b.rank = 0;
    eq(CM.mice.promoteSteps(s, a).map((x) => x.rank).join(''), '1', 'LV 12: one rank ready');
    eq(CM.mice.promoteSteps(s, b).map((x) => x.rank).join(''), '12', 'LV 30: two ranks ready');
    eq(CM.mice.promoteSteps(s, c).map((x) => x.rank).join(''), '123', 'LV 45: three ranks ready');
    eq(CM.mice.promoteSteps(s, c)[2].total, R[1].cost + R[2].cost + R[3].cost, 'reaching the third costs the three of them');
    // Selección parcial, y un destino más alto de lo que el nivel permite.
    const pick = {};
    pick[a.id] = 3;
    pick[c.id] = 2;
    const part = CM.mice.promoteMany(s, pick);
    eq(a.rank, 1, 'a mouse never goes past what its level allows');
    eq(c.rank, 2, 'a mouse stops at the rank chosen for it');
    eq(b.rank, 0, 'a mouse that was not selected stays as it was');
    eq(part.cost, R[1].cost + R[1].cost + R[2].cost, 'and only those ranks are charged');
    eq(s.coins, 1e12 - part.cost, 'once');
    // Si el total no alcanza, no se cobra nada: nunca se queda a medias.
    const poor = make(15, R[1].cost * 3);
    const want = CM.mice.promotePicks(poor, 'all');
    const was = ranks(poor);
    eq(CM.mice.promoteMany(poor, want).reason, 'no-coins', 'not enough for the whole selection');
    eq(ranks(poor), was, 'nobody is promoted');
    eq(poor.coins, R[1].cost * 3, 'nothing is charged');
    // AFFORDABLE: los rangos más baratos primero, hasta donde llegan las monedas.
    const some = CM.mice.promotePicks(poor, 'afford');
    eq(Object.keys(some).length, 3, 'affordable picks the three cheapest ranks');
    truthy(CM.mice.promoteCost(poor, some).cost <= poor.coins, 'and they fit in the budget');
    truthy(CM.mice.promoteMany(poor, some).ok, 'so they go through');
    eq(poor.coins, 0, 'spending exactly their price');
    // Una selección vieja (un ratón que ya no está) no rompe nada.
    const stale = make(2, 1e12);
    const old = CM.mice.promotePicks(stale, 'all');
    old.ghost = 3;
    stale.mice.shift();
    const res = CM.mice.promoteMany(stale, old);
    eq(res.mice, 1, 'a stale selection promotes only who is still there');
    valid(stale);
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
    // v6: el laboratorio ya construido conserva lo que usaba, ahora como mejoras compradas.
    const v6 = JSON.parse(JSON.stringify(withCheese()));
    v6.version = 6;
    v6.built.lab = true;
    v6.built.house = true;
    v6.nodes = {};
    v6.lab.dir = 'ingredient:pepper';
    v6.recipes[0].strains = ['dense'];
    v6.recipes[0].strain = 'dense';
    v6.mice = [{ id: 'm900', name: 'Old', traits: ['fast', 'dreamer'], aff: { research: 2 }, xp: 50, rank: 0, post: 'research:all', rest: false }];
    const m6 = CM.storage.parse(JSON.stringify(v6), 1);
    truthy(m6, 'version 6 saves still load');
    truthy(CM.cheesery.labHas(m6, 'assistant') && CM.cheesery.labHas(m6, 'advanced') && CM.cheesery.strainsOpen(m6), 'a lab already built keeps its researcher post, directions and strains');
    eq(m6.mice[0].post + '/' + m6.lab.dir + '/' + m6.recipes[0].strain, 'research:all/ingredient:pepper/dense', 'and the researcher, the direction and the equipped strain stay as they were');
    const v6new = JSON.parse(JSON.stringify(withCheese()));
    v6new.version = 6;
    eq(CM.cheesery.labHas(CM.storage.parse(JSON.stringify(v6new), 1), 'assistant'), false, 'a save with no lab gets nothing for free');
    valid(m6);
    // v7: un ratón con una elección pendiente y otro con dos legendarios elegidos a mano.
    const v7 = JSON.parse(JSON.stringify(withCheese()));
    v7.version = 7;
    v7.built.house = true;
    v7.mice = [
      { id: 'm901', name: 'Waiting', traits: ['fast', 'dreamer'], aff: {}, xp: 5000, rank: 0, post: 'drilling:cheddar', rest: false, learned: [], picks: 0, rerolls: 2, spec: {}, jobs: { drilling: 250 }, offer: { kind: 'level', skill: '', options: ['strong', 'lucky', 'tidy'] } },
      { id: 'm902', name: 'Jewel', traits: ['abyssal', 'strong'], aff: {}, xp: 100, rank: 0, post: 'refining:cheddar', rest: false, learned: ['goldenpaws', 'midas'], picks: 2, spec: { refining: 'purifier' }, jobs: { refining: 300 }, rarity: 2 },
    ];
    const m7 = CM.storage.parse(JSON.stringify(v7), 1);
    truthy(m7, 'version 7 saves still load');
    const waited = m7.mice.find((x) => x.id === 'm901');
    truthy(waited.offer === undefined && waited.learned.length >= 1 && waited.spec.drilling, 'what was waiting for a choice is developed on its own');
    truthy(m7.inbox.length === 1 && m7.inbox[0].name === 'Waiting' && m7.inbox[0].traits.length >= 2, 'and the player is told what each mouse developed');
    const jewel = m7.mice.find((x) => x.id === 'm902');
    eq(jewel.traits.concat(jewel.learned).join() + '/' + jewel.spec.refining, 'abyssal,strong,goldenpaws,midas/purifier', 'traits already earned are kept, several legendary ones included');
    valid(m7);
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
  // Capacidad de cada etapa de una roca, en quesos por minuto, para ver cuál
  // limita a las demás. mine = lo que da la veta si el taladro no esperase;
  // drill, refine y cook = lo que cada máquina podría procesar con entrada de
  // sobra; shop = lo que la tienda puede vender (compartida por todas las rocas).
  function chainReport(s) {
    const K = CM.mice;
    const per = (m, skill, zone) => (m ? { sp: K.speed(m, skill, s, zone), y: K.yieldMult(m, skill, s, zone) * (1 + K.doubleChance(m, skill, s, zone)) } : { sp: 0, y: 1 });
    const out = [];
    const lows = [];
    const f = (n) => (n >= 100 ? CM.fmt(Math.round(n)) : Math.round(n * 10) / 10);
    let cookTotal = 0;
    for (const def of q.openZones(s)) {
      const z = def.id;
      const mi = per(K.at(s, 'mining', z), 'mining', z);
      const dr = per(K.at(s, 'drilling', z), 'drilling', z);
      const re = per(K.at(s, 'refining', z), 'refining', z);
      const co = per(K.at(s, 'cheesemaking', z), 'cheesemaking', z);
      const recipe = CM.cheesery.laneRecipe(s, z);
      const mineRaw = mi.sp ? (q.veinCapacity(s, z) / q.veinHits(s, z)) * q.pickPower(s) * mi.y * (mi.sp / (q.minerInterval(s) / 1000)) : 0;
      const drillRaw = dr.sp ? (q.drillYield(s, z) * dr.y) / (q.drillDuration(s) / 1000 / dr.sp) : 0;
      const cheesePerRaw = (1 + q.mods(s)('refBonus')) / B.refinery.rawPerBase / B.cheesery.lotBase;
      const refine = re.sp ? ((q.refineBatch(s) * q.refineMult(s) * re.y) / (q.refineDuration(s) / 1000 / re.sp) / B.cheesery.lotBase) * 60 : 0;
      const batch = q.cheeseBatch ? q.cheeseBatch(s) : 1;
      const cook = co.sp && recipe ? ((batch * co.y * q.skillMult(s, 'cheesemaking')) / (CM.cheesery.jobTime(s, CM.cheesery.parseKey(recipe.key), recipe) / 1000 / co.sp)) * 60 : 0;
      cookTotal += cook;
      const stages = { mine: mineRaw * cheesePerRaw * 60, drill: drillRaw * cheesePerRaw * 60, refine, cook };
      const low = Object.keys(stages).sort((a, b) => stages[a] - stages[b])[0];
      lows.push(low);
      out.push(B.bases[def.base].name + ' d' + s.zones[z].depth + ': ' + Object.keys(stages).map((k) => (k === low ? '[' + k + ' ' + f(stages[k]) + ']' : k + ' ' + f(stages[k]))).join(' ') + ' | raw ' + CM.fmt(s.inv.raw[def.base]) + ' base ' + CM.fmt(s.inv.base[def.base]));
    }
    const kp = per(K.at(s, 'trading', 'all'), 'trading', 'all');
    const shop = kp.sp ? (q.sellCount(s) / (q.sellDuration(s) / 1000 / kp.sp)) * 60 : 0;
    out.push('shop ' + f(shop) + ' vs cooks ' + f(cookTotal) + ' cheese/min, unsold ' + CM.fmt(q.lotsTotal(s)));
    if (shop < cookTotal) lows.push('shop');
    out.lows = lows;
    return out;
  }

  // `smart`: un jugador que optimiza sus ratones (elige el rasgo que más rinde en
  // su puesto, se queda el mejor candidato y recoloca). Sirve para medir el techo.
  // `focus`: además, solo invierte en las habilidades que en ese momento limitan alguna roca.
  // `opts.skip`: habilidades en las que no compra mejoras (para medir cuánto aporta cada una).
  // `opts.state`: partida de la que continuar (para partidas muy largas, por tramos).
  function playBot(tapEveryMs, limitMs, stopAt, snapshots, smart, focus, opts) {
    const skip = (opts && opts.skip) || [];
    // Jugador casual: `maxRecipes` recetas como mucho por queso, `buyEveryMs` entre compras,
    // `idleAfterAuto` deja de tocar cuando las cinco etapas tienen ratón.
    const casual = opts || {};
    const buyEvery = casual.buyEveryMs || 2000;
    const SKILL_OF = { mine: 'mining', drill: 'drilling', refine: 'refining', cook: 'cheesemaking', shop: 'trading' };
    const counts = { mine: 0, drill: 0, refine: 0, cook: 0, shop: 0 };
    const s = (opts && opts.state) || fresh();
    const snaps = [];
    const chains = [];
    let lastTap = -1e9;
    let lastBuy = -1e9;
    const ORDER = ['drilling', 'refining', 'trading', 'cheesemaking', 'mining', 'colony', 'lab'];
    while (s.clock < limitMs && s.goalsDone[stopAt] === undefined) {
      CM.sim.step(s, STEP);
      for (const id of CM.construction.order) CM.construction.build(s, id);
      if (s.clock - lastBuy >= buyEvery) {
        lastBuy = s.clock;
        const next = CM.zones.next(s);
        if (next) CM.zones.unlock(s, next.id);
        // Primero un ratón para cada puesto libre (se queda con el primer candidato
        // y deja que se coloque solo), luego ascensos, luego lo más barato de cada árbol.
        const wantsMouse = s.built.house && !!CM.mice.freePost(s);
        const power = (m, skill, zone) => CM.mice.speed(m, skill, s, zone) * CM.mice.yieldMult(m, skill, s, zone) * (1 + CM.mice.doubleChance(m, skill, s, zone));
        if (wantsMouse && CM.mice.offer(s).ok) {
          let pickAt = 0;
          if (smart) {
            const dest = CM.mice.freePost(s);
            const val = (c) => power(CM.mice.normalize(Object.assign({ xp: 0, rank: 0 }, c)), dest.skill, dest.zone);
            s.candidates.forEach((c, i) => {
              if (val(c) > val(s.candidates[pickAt])) pickAt = i;
            });
          }
          CM.mice.choose(s, pickAt);
        }
        for (const m of s.mice) CM.mice.promote(s, m.id);
        if (smart && s.clock % 60000 < 2000 && s.mice.length > 1) CM.mice.bestFit(s);
        // Ahorra como lo haría una persona: para el siguiente ratón y para la
        // siguiente roca cuando su economía ya da para ella.
        // El laboratorio: sus mejoras de función, en cuanto se pueden pagar.
        for (const id of ['assistant', 'advanced', 'strains']) CM.tree.buy(s, 'lab', id);
        const mouse = s.built.house && !!CM.mice.freePost(s) && s.totals.coinsEarned > CM.mice.recruitCost(s) * 0.6;
        const saving = mouse || (next && s.totals.coinsEarned > next.unlockCost * 0.5);
        if (!saving) {
          // (se mira cada 10 s de juego: medir la cadena en cada compra alarga mucho la prueba)
          if (s.clock % 10000 < 2000 || !playBot.lows) playBot.lows = chainReport(s).lows;
          const lows = playBot.lows;
          lows.forEach((k) => (counts[k] += 1));
          if (focus && lows.length) {
            for (const k of lows) CM.tree.buyAll(s, SKILL_OF[k]);
            CM.tree.buyAll(s, 'colony');
          } else for (const skill of ORDER) if (skip.indexOf(skill) < 0) CM.tree.buyAll(s, skill);
        }
      }
      if (s.clock - lastTap >= tapEveryMs && !(casual.idleAfterAuto && s.goalsDone.allAuto !== undefined)) {
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
      // Recetas: a mano mientras no haya investigador (cada vez que el laboratorio queda libre);
      // con el Cheese Lab construido marca una dirección y el ratón de Research sigue solo.
      if (s.built.cheesery && s.clock % 1000 === 0) {
        if (s.built.lab && casual.maxRecipes === undefined) s.lab.dir = 'value';
        const byHand = !CM.cheesery.labWorker(s) && !s.lab.job && !s.lab.next;
        for (const def of q.openZones(s)) {
          const mine = s.recipes.filter((r) => CM.cheesery.parseKey(r.key).base === def.base).sort((a, b) => CM.cheesery.valueOf(s, b) - CM.cheesery.valueOf(s, a));
          const wants = casual.maxRecipes === undefined || mine.length < casual.maxRecipes;
          if (byHand && wants && !s.lab.job && !s.lab.next) CM.cheesery.allCombos([def.base]).find((c) => !CM.cheesery.recipeByKey(s, CM.cheesery.keyOf(c)) && CM.cheesery.experiment(s, c).ok);
          if (s.zones[def.id].cookJob || !mine.length) continue;
          if (q.auto(s, 'cheesemaking', def.id)) continue; // su ratón cocina solo la mejor
          for (const r of mine) if (CM.cheesery.produce(s, r.id, Math.max(1, Math.min(3, CM.cheesery.maxLots(s, r)))).ok) break;
        }
      }
      if (s.clock % 5000 === 0) valid(s);
      if (snapshots && snapshots.length && s.clock >= snapshots[0] * 60000) {
        if ([60, 120, 240, 300].indexOf(snapshots[0]) >= 0) chainReport(s).forEach((line) => chains.push(snapshots[0] + ' min · ' + line));
        snaps.push(snapshots.shift() + ' min: levels ' + CM.skills.list.map((k) => q.level(s, k)).join('/') + ', rocks ' + s.totals.zonesUnlocked + ', depth ' + B.zones.map((z) => s.zones[z.id].depth).join('/') + ', recipes ' + s.recipes.length + ', coins ' + CM.fmt(s.coins) + ', earned ' + CM.fmt(s.totals.coinsEarned) + ', cheese made/sold ' + CM.fmt(s.totals.lotsProduced) + '/' + CM.fmt(s.totals.lotsSold));
      }
    }
    const mins = {};
    Object.keys(s.goalsDone).forEach((k) => (mins[k] = Math.round(s.goalsDone[k] / 6000) / 10));
    const all = Object.keys(counts).reduce((a, k) => a + counts[k], 0) || 1;
    const share = Object.keys(counts).map((k) => k + ' ' + Math.round((counts[k] / all) * 100) + '%').join(', ');
    return { s, mins, snaps, chains, share };
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
    const { snaps, mins, chains, share } = playBot(400, 5 * 60 * 60 * 1000, 'never', [2, 5, 10, 15, 30, 45, 60, 120, 180, 240, 300]);
    snaps.forEach((line) => notes.push('pace ' + line));
    chains.forEach((line) => notes.push('chain ' + line));
    notes.push('pace bottleneck share: ' + share);
    notes.push('pace rocks opened at (min): ' + ['zone2', 'zone3', 'zone4', 'zone5', 'zone6'].map((k) => (mins[k] === undefined ? '-' : mins[k])).join(' / '));
  });

  test('pace report: four hours of a player who optimises the mice', () => {
    const { s, snaps, mins, chains } = playBot(400, 4 * 60 * 60 * 1000, 'never', [30, 60, 120, 180, 240], true);
    snaps.forEach((line) => notes.push('smart ' + line));
    chains.forEach((line) => notes.push('smartchain ' + line));
    notes.push('smart rocks opened at (min): ' + ['zone2', 'zone3', 'zone4', 'zone5', 'zone6'].map((k) => (mins[k] === undefined ? '-' : mins[k])).join(' / '));
    const K = CM.mice;
    notes.push('smart mice at 4 h: ' + s.mice.map((m) => K.level(m) + (K.isLegend(m) ? '*' : '') + ' x' + (m.post ? Math.round(K.speed(m, m.post.split(':')[0], s, m.post.split(':')[1]) * K.yieldMult(m, m.post.split(':')[0], s, m.post.split(':')[1]) * 100) / 100 : 0)).join(', '));
  });

  // El perfil de referencia para los precios: alguien que toca poco, compra de vez en
  // cuando, deja de tocar al automatizar y deja al laboratorio investigar solo.
  test('pace report: a casual player', () => {
    const { snaps, mins } = playBot(1500, 4 * 60 * 60 * 1000, 'never', [5, 10, 20, 30, 45, 60, 120, 180, 240], false, false, { buyEveryMs: 20000, idleAfterAuto: true });
    snaps.forEach((line) => notes.push('casual ' + line));
    notes.push('casual goals (min): ' + ['sale', 'mouse', 'allAuto', 'promote', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6'].map((k) => k + ' ' + (mins[k] === undefined ? '-' : mins[k])).join(', '));
  });

  test('a slow player (1 tap / 1.5 s) also gets there', () => {
    const { s, mins } = playBot(1500, 6 * 60 * 60 * 1000, 'zone2');
    notes.push('slow bot goals in minutes: ' + JSON.stringify(mins));
    truthy(s.goalsDone.allAuto !== undefined && s.goalsDone.zone2 !== undefined, 'automation and second rock');
    valid(s);
  });

  // Para calibrar el balance desde la consola sin repetir toda la batería.
  // Prototipo de cepas: la misma fábrica, diez minutos con cada cepa en la receta de la línea
  // de Cheddar, en tres situaciones (tal cual, con base de sobra, y con base de sobra y poca tienda).
  function strainReport(src, minutes) {
    const C = CM.cheesery;
    const out = [];
    for (const scene of ['as is', 'base to spare', 'base to spare, slow shop']) {
      for (const id of [''].concat(Object.keys(B.strains))) {
        const s = JSON.parse(JSON.stringify(src));
        CM.events.length = 0;
        s.lab.dir = '';
        s.lab.job = null;
        s.lab.next = '';
        const r = C.laneRecipe(s, 'cheddar');
        C.assign(s, r.id);
        r.strains = Object.keys(B.strains);
        s.zones.cheddar.cookJob = null;
        C.setStrain(s, r.id, id);
        const cook = CM.mice.at(s, 'cheesemaking', 'cheddar');
        const shopkeeper = CM.mice.at(s, 'trading', 'all');
        if (scene.indexOf('slow shop') >= 0 && shopkeeper) { shopkeeper.post = ''; shopkeeper.rest = true; }
        const t0 = s.clock;
        const from = { coins: s.totals.coinsEarned, made: s.zones.cheddar.stats.lots, used: s.zones.cheddar.stats.baseUsed, xp: cook ? cook.xp : 0, jobs: cook ? cook.jobs.cheesemaking || 0 : 0 };
        while (s.clock - t0 < (minutes || 10) * 60000) {
          if (scene !== 'as is') s.inv.base.cheddar = Math.max(s.inv.base.cheddar, 1e7);
          if (scene.indexOf('slow shop') >= 0 && !s.jobs.shop && s.clock % 6000 === 0) CM.shop.start(s, 'manual');
          CM.sim.step(s, STEP);
          CM.events.length = 0;
        }
        const stock = s.recipes.reduce((sum, x) => sum + (s.lots[x.id] || 0) * CM.shop.price(s, x), 0);
        out.push([scene, id || 'plain', 'coins ' + CM.fmt(s.totals.coinsEarned - from.coins), 'unsold ' + CM.fmt(stock), 'cheddar made ' + CM.fmt(s.zones.cheddar.stats.lots - from.made), 'base used ' + CM.fmt(s.zones.cheddar.stats.baseUsed - from.used), 'base left ' + CM.fmt(s.inv.base.cheddar), cook ? 'cook xp +' + Math.round(cook.xp - from.xp) + ', jobs +' + Math.round((cook.jobs.cheesemaking || 0) - from.jobs) : 'no cook'].join(' | '));
      }
    }
    return out;
  }
  window.CM_BOT = { playBot, chainReport, strainReport };

  const failed = results.filter((r) => !r.ok).length;
  document.getElementById('out').textContent =
    results.map((r) => (r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.ok ? '' : '\n      ' + r.error)).join('\n') + '\n\n' + (results.length - failed) + '/' + results.length + ' passed\n\n' + notes.join('\n');
  window.TEST_RESULTS = { total: results.length, failed, results, notes };
})();
