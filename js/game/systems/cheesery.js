// CHEESERY y RECIPE BOOK: BASE + INGREDIENTE + TRATAMIENTO + MADURACIÓN = QUESO.
// Experimentar descubre una receta (y da 1 lote de muestra); fabricar usa recetas ya conocidas.
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

  // Fórmula de stats, reproducible: suma de componentes + sinergias; Value sale de los pesos.
  function computeStats(combo) {
    const st = { taste: 0, funk: 0, aroma: 0 };
    const synergies = [];
    for (const p of PARTS) {
      const part = B[TABLES[p]][combo[p]].stats;
      for (const k of Object.keys(st)) st[k] += part[k];
    }
    for (const syn of B.synergies) {
      if (Object.keys(syn.when).every((p) => combo[p] === syn.when[p])) {
        for (const k of Object.keys(syn.add)) st[k] += syn.add[k];
        synergies.push(syn.label);
      }
    }
    const w = B.valueWeights;
    const raw = st.taste * w.taste + st.funk * w.funk + st.aroma * w.aroma;
    st.value = Math.round(raw * B.maturations[combo.maturation].valueMult);
    st.synergies = synergies;
    return st;
  }

  const lotTime = (combo) =>
    B.cheesery.baseTimeMs + B.treatments[combo.treatment].timeMs + B.maturations[combo.maturation].timeMs;

  // Maestría de una receta (1..n) según los lotes fabricados.
  function masteryLevel(recipe) {
    const made = (recipe && recipe.made) || 0;
    let level = 1;
    B.cheesery.masteryAt.forEach((need, i) => {
      if (made >= need) level = i + 1;
    });
    return level;
  }
  // Tiempo real por lote: receta, nivel de la Cheesery y maestría.
  function jobTime(s, combo, recipe) {
    const speed = Math.pow(B.cheesery.durationFactorPerLevel, s.levels.cheesery);
    const mastery = 1 - B.cheesery.masteryTime * (masteryLevel(recipe) - 1);
    return Math.max(500, Math.round(lotTime(combo) * speed * mastery));
  }

  function defaultName(combo) {
    return [B.maturations[combo.maturation].adj, B.treatments[combo.treatment].adj, B.ingredients[combo.ingredient].adj, B.bases[combo.base].name]
      .filter(Boolean)
      .join(' ');
  }

  // Bases disponibles: las de yacimientos ya abiertos.
  const unlockedBases = (s) => B.deposits.filter((d) => s.deposits[d.id].unlocked).map((d) => d.base);

  function allCombos(bases) {
    const out = [];
    for (const base of bases)
      for (const ingredient of Object.keys(B.ingredients))
        for (const treatment of Object.keys(B.treatments))
          for (const maturation of Object.keys(B.maturations)) out.push({ base, ingredient, treatment, maturation });
    return out;
  }

  function startJob(s, kind, combo, recipeId, lots, baseCost, source) {
    const coinCost = B.ingredients[combo.ingredient].coinCost * lots;
    if (!s.built.cheesery) return CM.fail('not-built');
    if (s.jobs.cheesery) return CM.fail('busy');
    if (s.inv.base[combo.base] < baseCost) return CM.fail('no-base');
    if (s.coins < coinCost) return CM.fail('no-coins');
    if (q.lotsSpace(s) < lots) return CM.fail('storage-full');
    // Los inputs se consumen aquí, una sola vez; los lotes se entregan uno a uno al completarse.
    s.inv.base[combo.base] -= baseCost;
    s.totals.baseConsumed += baseCost;
    if (coinCost > 0) {
      s.coins -= coinCost;
      s.totals.coinsSpent += coinCost;
    }
    const total = jobTime(s, combo, recipeId ? CM.cheesery.recipe(s, recipeId) : null);
    s.jobs.cheesery = { kind, key: keyOf(combo), recipeId, lotsLeft: lots, remaining: total, total };
    CM.emit(s, 'cheeseStart', { kind, lots, source: source || 'manual', used: baseCost, base: combo.base });
    return CM.ok();
  }

  CM.cheesery = {
    PARTS,
    TABLES,
    keyOf,
    parseKey,
    computeStats,
    lotTime,
    jobTime,
    masteryLevel,
    defaultName,
    unlockedBases,
    allCombos,
    recipe: (s, id) => s.recipes.find((r) => r.id === id) || null,
    recipeByKey: (s, key) => s.recipes.find((r) => r.key === key) || null,
    // Stats de una receta del libro: las de la fórmula más el extra de Value por maestría.
    statsOf(recipe) {
      const st = computeStats(parseKey(recipe.key));
      st.mastery = masteryLevel(recipe);
      st.value = Math.round(st.value * (1 + B.cheesery.masteryValue * (st.mastery - 1)));
      return st;
    },

    experiment(s, combo) {
      if (!parseKey(keyOf(combo))) return CM.fail('invalid');
      if (unlockedBases(s).indexOf(combo.base) < 0) return CM.fail('base-locked');
      if (this.recipeByKey(s, keyOf(combo))) return CM.fail('known');
      return startJob(s, 'experiment', combo, null, 1, B.cheesery.experimentBase);
    },

    produce(s, recipeId, lots) {
      const recipe = this.recipe(s, recipeId);
      if (!recipe) return CM.fail('unknown-recipe');
      const n = Math.max(1, Math.min(B.cheesery.maxQueue, Math.floor(lots) || 1));
      return startJob(s, 'produce', parseKey(recipe.key), recipeId, n, B.cheesery.lotBase * n);
    },

    // --- Cheesemaker: cocina de uno en uno la receta asignada ---
    assign(s, recipeId) {
      if (recipeId && !this.recipe(s, recipeId)) return CM.fail('unknown-recipe');
      s.cookRecipe = recipeId || '';
      CM.emit(s, 'cookAssigned', { recipeId: s.cookRecipe });
      return CM.ok();
    },
    // Llamado por la simulación cuando hay Cheesemaker y la Cheesery está libre.
    start(s) {
      const recipe = this.recipe(s, s.cookRecipe);
      if (!recipe) return CM.fail('no-recipe');
      return startJob(s, 'produce', parseKey(recipe.key), recipe.id, 1, B.cheesery.lotBase, 'worker');
    },
    autoStatus(s) {
      if (!s.built.cheesery) return 'no-work';
      if (s.jobs.cheesery) return 'active';
      const recipe = this.recipe(s, s.cookRecipe);
      if (!recipe) return 'no-recipe';
      const combo = parseKey(recipe.key);
      if (s.inv.base[combo.base] < B.cheesery.lotBase) return 'no-material';
      if (s.coins < B.ingredients[combo.ingredient].coinCost) return 'no-coins';
      if (q.lotsSpace(s) < 1) return 'storage-full';
      return 'active';
    },

    status(s) {
      if (!s.built.cheesery) return 'not-built';
      return s.jobs.cheesery ? 'running' : 'idle';
    },

    tap(s) {
      const job = s.jobs.cheesery;
      if (!job) return CM.fail('idle');
      s.metrics.taps.cheesery += 1;
      job.remaining = Math.max(0, job.remaining - B.cheesery.boostMs);
      CM.emit(s, 'cheeseBoost');
      return CM.ok();
    },

    // Completa UN lote del encargo en curso.
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
      CM.emit(s, 'lotDone', { recipeId: recipe.id });
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
      CM.emit(s, 'recipeRenamed', { recipeId });
      return CM.ok();
    },
  };
})();
