// CHEESERY, RECIPE BOOK y CHEESE SHOP.
// BASE + INGREDIENTE + TRATAMIENTO + MADURACIÓN = QUESO, con un único número: su valor.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const PARTS = ['base', 'ingredient', 'treatment', 'maturation'];
  const TABLES = { base: 'bases', ingredient: 'ingredients', treatment: 'treatments', maturation: 'maturations' };

  const keyOf = (combo) => PARTS.map((p) => combo[p]).join('+');
  function parseKey(key) {
    const bits = String(key).split('+');
    if (bits.length !== 4) return null;
    const combo = {};
    PARTS.forEach((p, i) => (combo[p] = bits[i]));
    return PARTS.every((p) => B[TABLES[p]][combo[p]]) ? combo : null;
  }

  // Valor de fórmula de una combinación, antes de maestría y mejoras.
  function formula(combo) {
    let value = B.bases[combo.base].value * B.ingredients[combo.ingredient].mult * B.treatments[combo.treatment].mult * B.maturations[combo.maturation].mult;
    const synergies = [];
    for (const syn of B.synergies) {
      if (Object.keys(syn.when).every((p) => combo[p] === syn.when[p])) {
        value *= syn.mult;
        synergies.push(syn.label);
      }
    }
    return { value: Math.round(value), synergies };
  }

  // Las recetas más elaboradas dan más experiencia.
  const recipeXp = (recipe) => Math.pow(formula(parseKey(recipe.key)).value / 10, B.xp.recipePower);

  const tierOf = (value) => B.tiers.reduce((best, t) => (value >= t.min ? t : best), B.tiers[0]).name;
  const lotTime = (combo) => B.cheesery.baseTimeMs + B.treatments[combo.treatment].timeMs + B.maturations[combo.maturation].timeMs;

  // Maestría de una receta (1..n) según los quesos fabricados.
  function masteryLevel(recipe) {
    const made = (recipe && recipe.made) || 0;
    let level = 1;
    B.cheesery.masteryAt.forEach((need, i) => {
      if (made >= need) level = i + 1;
    });
    return level;
  }
  // Tiempo real por queso: receta, mejoras de velocidad y maestría.
  function jobTime(s, combo, recipe) {
    const mastery = Math.max(0.3, 1 - B.cheesery.masteryTime * (masteryLevel(recipe) - 1));
    return Math.max(300, Math.round((lotTime(combo) / (1 + q.mods(s)('cheeseSpeed'))) * mastery));
  }
  // Valor de un queso del libro: fórmula x maestría x mejoras x nivel de Cheesemaking.
  function valueOf(s, recipe) {
    const f = formula(parseKey(recipe.key));
    const mastery = 1 + B.cheesery.masteryValue * (masteryLevel(recipe) - 1);
    return Math.max(1, Math.round(f.value * mastery * (1 + q.mods(s)('cheeseValue')) * q.skillMult(s, 'cheesemaking')));
  }

  function defaultName(combo) {
    return [B.maturations[combo.maturation].adj, B.treatments[combo.treatment].adj, B.ingredients[combo.ingredient].adj, B.bases[combo.base].name].filter(Boolean).join(' ');
  }

  // Bases disponibles: las de zonas abiertas.
  const unlockedBases = (s) => q.openZones(s).map((z) => z.base);
  // Un componente está bloqueado si pide más nivel de Cheesemaking (o una zona sin abrir).
  function partLocked(s, part, id) {
    if (part === 'base') return unlockedBases(s).indexOf(id) < 0;
    return q.level(s, 'cheesemaking') < B[TABLES[part]][id].level;
  }
  const comboLocked = (s, combo) => PARTS.some((p) => partLocked(s, p, combo[p]));

  function allCombos(bases) {
    const out = [];
    for (const base of bases)
      for (const ingredient of Object.keys(B.ingredients))
        for (const treatment of Object.keys(B.treatments))
          for (const maturation of Object.keys(B.maturations)) out.push({ base, ingredient, treatment, maturation });
    return out;
  }

  function startJob(s, kind, combo, recipe, lots, baseCost, source) {
    const coinCost = B.ingredients[combo.ingredient].coinCost * lots;
    if (!s.built.cheesery) return CM.fail('not-built');
    if (s.jobs.cheesery) return CM.fail('busy');
    if (s.inv.base[combo.base] < baseCost) return CM.fail('no-base');
    if (s.coins < coinCost) return CM.fail('no-coins');
    // Los inputs se consumen aquí, una sola vez; los quesos se entregan uno a uno al completarse.
    s.inv.base[combo.base] -= baseCost;
    s.totals.baseConsumed += baseCost;
    if (coinCost > 0) {
      s.coins -= coinCost;
      s.totals.coinsSpent += coinCost;
    }
    const total = jobTime(s, combo, recipe);
    s.jobs.cheesery = { kind, key: keyOf(combo), recipeId: recipe ? recipe.id : null, lotsLeft: lots, remaining: total, total, source: source || 'manual' };
    CM.emit(s, 'cheeseStart', { kind, lots, source: source || 'manual', used: baseCost, base: combo.base });
    return CM.ok();
  }

  CM.cheesery = {
    PARTS,
    TABLES,
    keyOf,
    parseKey,
    formula,
    tierOf,
    lotTime,
    jobTime,
    masteryLevel,
    valueOf,
    defaultName,
    unlockedBases,
    partLocked,
    allCombos,
    totalCombos: () => allCombos(Object.keys(B.bases)).length,
    recipe: (s, id) => s.recipes.find((r) => r.id === id) || null,
    recipeByKey: (s, key) => s.recipes.find((r) => r.key === key) || null,

    experiment(s, combo) {
      if (!parseKey(keyOf(combo))) return CM.fail('invalid');
      if (comboLocked(s, combo)) return CM.fail('part-locked');
      if (this.recipeByKey(s, keyOf(combo))) return CM.fail('known');
      return startJob(s, 'experiment', combo, null, 1, B.cheesery.experimentBase);
    },
    produce(s, recipeId, lots) {
      const recipe = this.recipe(s, recipeId);
      if (!recipe) return CM.fail('unknown-recipe');
      const n = Math.max(1, Math.min(B.cheesery.maxQueue, Math.floor(lots) || 1));
      return startJob(s, 'produce', parseKey(recipe.key), recipe, n, B.cheesery.lotBase * n);
    },
    // Cuántos quesos de una receta se pueden encargar ahora mismo.
    maxLots(s, recipe) {
      const combo = parseKey(recipe.key);
      const coin = B.ingredients[combo.ingredient].coinCost;
      return Math.max(0, Math.min(B.cheesery.maxQueue, Math.floor(s.inv.base[combo.base] / B.cheesery.lotBase), coin ? Math.floor(s.coins / coin) : 99));
    },

    // --- Cheesemaker: cocina de uno en uno la receta asignada ---
    assign(s, recipeId) {
      if (recipeId && !this.recipe(s, recipeId)) return CM.fail('unknown-recipe');
      s.cookRecipe = recipeId || '';
      CM.emit(s, 'cookAssigned', { recipeId: s.cookRecipe });
      return CM.ok();
    },
    start(s) {
      const recipe = this.recipe(s, s.cookRecipe);
      if (!recipe) return CM.fail('no-recipe');
      return startJob(s, 'produce', parseKey(recipe.key), recipe, 1, B.cheesery.lotBase, 'worker');
    },
    // Estado: not-built, running, no-recipe, no-base, no-coins, ready, idle.
    status(s) {
      if (!s.built.cheesery) return 'not-built';
      if (s.jobs.cheesery) return 'running';
      if (!q.isAutomated(s, 'cheesemaking')) return 'idle';
      const recipe = this.recipe(s, s.cookRecipe);
      if (!recipe) return 'no-recipe';
      const combo = parseKey(recipe.key);
      if (s.inv.base[combo.base] < B.cheesery.lotBase) return 'no-base';
      if (s.coins < B.ingredients[combo.ingredient].coinCost) return 'no-coins';
      return 'ready';
    },
    tap(s) {
      const job = s.jobs.cheesery;
      if (!job) return CM.fail('idle');
      s.metrics.taps.cheesery += 1;
      job.remaining = Math.max(0, job.remaining - B.cheesery.boostMs);
      CM.emit(s, 'cheeseBoost');
      return CM.ok();
    },
    // Completa UN queso del encargo en curso.
    complete(s) {
      const job = s.jobs.cheesery;
      let recipe = job.recipeId ? this.recipe(s, job.recipeId) : null;
      if (job.kind === 'experiment') {
        recipe = { id: 'r' + s.nextId++, key: job.key, name: defaultName(parseKey(job.key)), at: s.clock, made: 0 };
        s.recipes.push(recipe);
        s.totals.recipes += 1;
        job.recipeId = recipe.id;
        CM.emit(s, 'recipeDiscovered', { recipeId: recipe.id });
      }
      const before = masteryLevel(recipe);
      recipe.made = (recipe.made || 0) + 1;
      s.lots[recipe.id] = (s.lots[recipe.id] || 0) + 1;
      s.totals.lotsProduced += 1;
      job.lotsLeft -= 1;
      CM.skills.addXp(s, 'cheesemaking', B.xp.perCheese * recipeXp(recipe));
      CM.emit(s, 'lotDone', { recipeId: recipe.id, source: job.source });
      if (masteryLevel(recipe) > before) CM.emit(s, 'masteryUp', { recipeId: recipe.id, level: masteryLevel(recipe) });
      if (job.lotsLeft > 0) job.remaining = job.total = jobTime(s, parseKey(job.key), recipe);
      else s.jobs.cheesery = null;
    },
    rename(s, recipeId, name) {
      const recipe = this.recipe(s, recipeId);
      const clean = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 24);
      if (!recipe) return CM.fail('unknown-recipe');
      if (!clean) return CM.fail('empty-name');
      recipe.name = clean;
      return CM.ok();
    },
  };

  // ---------- CHEESE SHOP ----------
  // Vender es un ciclo más: se retiran los quesos al empezar y se cobra una sola vez al terminar.
  CM.shop = {
    price: (s, recipe) => Math.max(1, Math.round(valueOf(s, recipe) * q.priceMult(s))),
    status(s) {
      if (!s.built.shop) return 'not-built';
      if (s.jobs.shop) return 'running';
      return q.lotsTotal(s) > 0 ? 'ready' : 'no-cheese';
    },
    start(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      // Se venden primero los quesos más caros.
      const stock = s.recipes.filter((r) => (s.lots[r.id] || 0) > 0).sort((a, b) => this.price(s, b) - this.price(s, a));
      let left = q.sellCount(s);
      let coins = 0;
      let count = 0;
      let top = stock[0].id;
      for (const r of stock) {
        const n = Math.min(left, s.lots[r.id]);
        if (n <= 0) break;
        const price = this.price(s, r);
        s.lots[r.id] -= n;
        coins += price * n;
        count += n;
        left -= n;
      }
      const total = q.sellDuration(s);
      // Una venta es una acción: la experiencia depende de lo mejor que vendes, no de cuántos.
      const xp = B.xp.perSale * recipeXp(stock[0]);
      s.jobs.shop = { remaining: total, total, coins, count, xp, recipeId: top, source };
      CM.emit(s, 'sellStart', { source, count, recipeId: top });
      return CM.ok();
    },
    tap(s) {
      s.metrics.taps.sell += 1;
      const job = s.jobs.shop;
      if (!job) return this.start(s, 'manual');
      job.remaining = Math.max(0, job.remaining - B.shop.boostMs);
      CM.emit(s, 'sellBoost');
      return CM.ok({ boosted: true });
    },
    complete(s) {
      const job = s.jobs.shop;
      s.jobs.shop = null;
      s.coins += job.coins;
      s.totals.lotsSold += job.count;
      s.totals.coinsEarned += job.coins;
      CM.skills.addXp(s, 'trading', job.xp);
      CM.emit(s, 'sale', { coins: job.coins, count: job.count, recipeId: job.recipeId, source: job.source });
    },
  };
})();
