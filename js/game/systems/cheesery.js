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
    const zoneId = q.zoneOfBase(combo.base);
    const z = s.zones[zoneId];
    if (!s.built.cheesery) return CM.fail('not-built');
    // Cada línea cocina su propio queso: solo estorba un encargo de la misma base.
    if (z.cookJob) return CM.fail('busy');
    if (s.inv.base[combo.base] < baseCost) return CM.fail('no-base');
    if (s.coins < coinCost) return CM.fail('no-coins');
    // Los inputs se consumen aquí, una sola vez; los quesos se entregan uno a uno al completarse.
    s.inv.base[combo.base] -= baseCost;
    s.totals.baseConsumed += baseCost;
    z.stats.baseUsed += baseCost;
    if (coinCost > 0) {
      s.coins -= coinCost;
      s.totals.coinsSpent += coinCost;
    }
    const w = source === 'worker' ? CM.mice.work(s, 'cheesemaking', zoneId) : null;
    const total = Math.max(200, Math.round(jobTime(s, combo, recipe) / (w ? w.speed : 1)));
    z.cookJob = { kind, key: keyOf(combo), recipeId: recipe ? recipe.id : null, lotsLeft: lots, remaining: total, total, source: source || 'manual' };
    CM.emit(s, 'cheeseStart', { zone: zoneId, kind, lots, source: source || 'manual', used: baseCost, base: combo.base });
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
    // Asigna una receta a la línea de su base (una receta por queso).
    assign(s, recipeId) {
      const recipe = this.recipe(s, recipeId);
      if (!recipe) return CM.fail('unknown-recipe');
      const zoneId = q.zoneOfBase(parseKey(recipe.key).base);
      s.zones[zoneId].cookRecipe = recipe.id;
      CM.emit(s, 'cookAssigned', { zone: zoneId, recipeId: recipe.id });
      return CM.ok();
    },
    unassign(s, zoneId) {
      if (!s.zones[zoneId]) return CM.fail('invalid');
      s.zones[zoneId].cookRecipe = '';
      return CM.ok();
    },
    // Receta fijada a mano en la línea de su base.
    isCooking: (s, recipe) => s.zones[q.zoneOfBase(parseKey(recipe.key).base)].cookRecipe === recipe.id,
    // Qué cocina el Cheesemaker en una línea: la receta fijada o, si no hay,
    // la más valiosa que conozca de ese queso y cuyo ingrediente pueda pagar.
    laneRecipe(s, zoneId) {
      const pinned = this.recipe(s, s.zones[zoneId].cookRecipe);
      if (pinned) return pinned;
      const base = q.zoneDef(zoneId).base;
      let best = null;
      let top = -1;
      for (const r of s.recipes) {
        const combo = parseKey(r.key);
        if (combo.base !== base || s.coins < B.ingredients[combo.ingredient].coinCost) continue;
        const value = valueOf(s, r);
        if (value > top) {
          top = value;
          best = r;
        }
      }
      return best;
    },
    knowsRecipeFor: (s, base) => s.recipes.some((r) => r.key.split('+')[0] === base),
    start(s, zoneId) {
      const recipe = this.laneRecipe(s, zoneId);
      if (!recipe) return CM.fail('no-recipe');
      return startJob(s, 'produce', parseKey(recipe.key), recipe, 1, B.cheesery.lotBase, 'worker');
    },
    // Estado: not-built, running, no-recipe, no-base, no-coins, ready, idle.
    status(s, zoneId) {
      const z = s.zones[zoneId];
      if (!s.built.cheesery) return 'not-built';
      if (!z || !z.unlocked) return 'locked';
      if (z.cookJob) return 'running';
      if (!q.auto(s, 'cheesemaking', zoneId)) return 'idle';
      const recipe = this.laneRecipe(s, zoneId);
      if (!recipe) return this.knowsRecipeFor(s, q.zoneDef(zoneId).base) ? 'no-coins' : 'no-recipe';
      const combo = parseKey(recipe.key);
      if (s.inv.base[combo.base] < B.cheesery.lotBase) return 'no-base';
      if (s.coins < B.ingredients[combo.ingredient].coinCost) return 'no-coins';
      return 'ready';
    },
    tap(s, zoneId) {
      const job = s.zones[zoneId] && s.zones[zoneId].cookJob;
      if (!job) return CM.fail('idle');
      s.metrics.taps.cheesery += 1;
      job.remaining = Math.max(0, job.remaining - B.cheesery.boostMs);
      CM.emit(s, 'cheeseBoost', { zone: zoneId });
      return CM.ok();
    },
    // Completa UN queso del encargo en curso de una línea.
    complete(s, zoneId) {
      const z = s.zones[zoneId];
      const job = z.cookJob;
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
      z.stats.lots += 1;
      job.lotsLeft -= 1;
      const w = job.source === 'worker' ? CM.mice.work(s, 'cheesemaking', zoneId) : null;
      const xm = w ? CM.mice.reward(s, 'cheesemaking', zoneId) : 1;
      // El rendimiento del ratón se acumula: de vez en cuando sale un queso de más (o de menos).
      if (w) {
        z.cookCarry += CM.mice.out(s, w) - 1;
        if (z.cookCarry >= 1) {
          z.cookCarry -= 1;
          s.lots[recipe.id] += 1;
          s.totals.lotsProduced += 1;
          z.stats.lots += 1;
        } else if (z.cookCarry <= -1) {
          z.cookCarry += 1;
          s.lots[recipe.id] -= 1;
          s.totals.lotsProduced -= 1;
          z.stats.lots -= 1;
        }
      }
      CM.skills.addXp(s, 'cheesemaking', B.xp.perCheese * recipeXp(recipe) * xm);
      CM.emit(s, 'lotDone', { zone: zoneId, recipeId: recipe.id, source: job.source });
      if (masteryLevel(recipe) > before) CM.emit(s, 'masteryUp', { recipeId: recipe.id, level: masteryLevel(recipe) });
      if (job.lotsLeft > 0) job.remaining = job.total = jobTime(s, parseKey(job.key), recipe);
      else z.cookJob = null;
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
      return q.lotsForSale(s) > 0 ? 'ready' : 'no-cheese';
    },
    start(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      // Se venden primero los quesos más caros.
      const stock = s.recipes.filter((r) => (s.lots[r.id] || 0) > 0 && q.isSold(s, r)).sort((a, b) => this.price(s, b) - this.price(s, a));
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
      const w = source === 'worker' ? CM.mice.work(s, 'trading', 'all') : null;
      const total = Math.max(200, Math.round(q.sellDuration(s) / (w ? w.speed : 1)));
      if (w) coins = Math.max(1, Math.round(coins * CM.mice.out(s, w)));
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
      const xm = job.source === 'worker' ? CM.mice.reward(s, 'trading', 'all') : 1;
      CM.skills.addXp(s, 'trading', job.xp * xm);
      CM.emit(s, 'sale', { coins: job.coins, count: job.count, recipeId: job.recipeId, source: job.source });
    },
  };
})();
