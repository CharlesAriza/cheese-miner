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
    const zone = q.zoneOfBase(parseKey(recipe.key).base);
    return Math.max(1, Math.round(f.value * mastery * (1 + q.mods(s)('cheeseValue')) * q.depthRich(s, zone)));
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

  // `per`: quesos por hornada (cada ciclo entrega `per` quesos; los inputs ya vienen multiplicados).
  function startJob(s, kind, combo, recipe, lots, baseCost, source, per) {
    const coinCost = B.ingredients[combo.ingredient].coinCost * lots * (per || 1);
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
    const total = CM.cycle(jobTime(s, combo, recipe) / (w ? w.speed : 1)).total;
    z.cookJob = { kind, key: keyOf(combo), recipeId: recipe ? recipe.id : null, lotsLeft: lots, per: per || 1, remaining: total, total, source: source || 'manual' };
    CM.emit(s, 'cheeseStart', { zone: zoneId, kind, lots: lots * (per || 1), source: source || 'manual', used: baseCost, base: combo.base });
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

    // ---------- CHEESE LAB ----------
    // Investigar va aparte de producir. A mano se lanza cada receta; con un ratón en
    // el puesto de Research, él repite el trabajo siguiendo la dirección que marque
    // el jugador. El ratón ejecuta; la estrategia no la decide nadie por ti.
    labWorker: (s) => (s.built.lab ? CM.mice.at(s, 'research', 'all') : null),
    labTime: (s) => Math.round(B.cheesery.labBaseMs * Math.pow(B.cheesery.labGrowth, s.recipes.length)),
    // Cheese Base que cuesta la siguiente investigación (sube con el libro; Thrifty lo abarata).
    labCost(s) {
      const w = this.labWorker(s);
      const cut = w ? CM.mice.trait(w, 'labCost', 'research') : 0;
      return Math.max(1, Math.round((B.cheesery.experimentBase + B.cheesery.labCostGrowth * s.recipes.length) * Math.max(0.2, 1 + cut)));
    },
    // Probabilidades del laboratorio con el ratón que haya (o sin él).
    labOdds(s) {
      const w = this.labWorker(s);
      const t = (key) => (w ? CM.mice.trait(w, key, 'research') : 0);
      return { fail: Math.max(0, Math.min(0.9, B.cheesery.labFail + t('labFail'))), luck: Math.max(0, Math.min(0.9, B.cheesery.labBreakthrough + t('labLuck'))), bonus: Math.max(0, Math.min(0.9, t('labBonus'))) };
    },
    experiment(s, combo, source) {
      if (!parseKey(keyOf(combo))) return CM.fail('invalid');
      if (comboLocked(s, combo)) return CM.fail('part-locked');
      if (this.recipeByKey(s, keyOf(combo))) return CM.fail('known');
      if (!s.built.cheesery) return CM.fail('not-built');
      if (s.lab.job) return CM.fail('lab-busy');
      const coinCost = B.ingredients[combo.ingredient].coinCost;
      const baseCost = this.labCost(s);
      if (s.inv.base[combo.base] < baseCost) {
        // Encargo a mano sin base suficiente: queda apuntado y el laboratorio la reserva.
        if (source === 'worker' || source === 'queue') return CM.fail('no-base');
        s.lab.next = keyOf(combo);
        s.lab.want = combo.base;
        return CM.ok({ queued: true });
      }
      if (s.coins < coinCost) return CM.fail('no-coins');
      s.lab.next = '';
      s.inv.base[combo.base] -= baseCost;
      s.totals.baseConsumed += baseCost;
      s.zones[q.zoneOfBase(combo.base)].stats.baseUsed += baseCost;
      if (coinCost > 0) {
        s.coins -= coinCost;
        s.totals.coinsSpent += coinCost;
      }
      // Si hay investigador, el trabajo lo hace él, lo haya elegido la dirección o el jugador.
      const w = this.labWorker(s) ? CM.mice.work(s, 'research', 'all') : null;
      const total = Math.max(1000, Math.round(this.labTime(s) / (w ? w.speed : 1)));
      s.lab.job = { key: keyOf(combo), remaining: total, total, source: w ? 'worker' : 'manual', retried: false };
      CM.emit(s, 'labStart', { key: s.lab.job.key });
      return CM.ok();
    },
    // ¿Encaja una combinación en la dirección marcada?
    labCancel(s) {
      s.lab.next = '';
      s.lab.want = '';
      return CM.ok();
    },
    labFits(dir, combo) {
      const [kind, id] = String(dir || '').split(':');
      if (kind === 'value' || kind === 'fast') return true;
      return PARTS.indexOf(kind) >= 0 && combo[kind] === id;
    },
    // Siguiente combinación según la dirección: la de más valor dentro de ella
    // (o la más rápida de cocinar, si la dirección es 'fast') que se pueda pagar ahora.
    labPick(s, onlyAffordable) {
      const dir = s.lab.dir;
      if (!dir) return null;
      const cost = this.labCost(s);
      let best = null;
      for (const combo of allCombos(unlockedBases(s))) {
        if (!this.labFits(dir, combo) || comboLocked(s, combo) || this.recipeByKey(s, keyOf(combo))) continue;
        if (onlyAffordable !== false && (s.inv.base[combo.base] < cost || s.coins < B.ingredients[combo.ingredient].coinCost)) continue;
        const score = dir === 'fast' ? -lotTime(combo) * 1e6 + formula(combo).value * B.bases[combo.base].value : formula(combo).value;
        if (!best || score > best.score) best = { combo, score };
      }
      return best ? best.combo : null;
    },
    // Añade una receta al libro con su primer queso.
    labDiscover(s, key, made) {
      const recipe = { id: 'r' + s.nextId++, key, name: defaultName(parseKey(key)), at: s.clock, made: made || 1 };
      s.recipes.push(recipe);
      s.totals.recipes += 1;
      s.lots[recipe.id] = 1;
      s.totals.lotsProduced += 1;
      return recipe;
    },
    labTick(s, dt) {
      const job = s.lab.job;
      if (job) {
        job.remaining -= dt;
        if (job.remaining > 0) return;
        const odds = this.labOdds(s);
        // Resultado no concluyente: una vez por investigación, hay que repetir la mitad del trabajo.
        if (!job.retried && CM.rand(s) < odds.fail) {
          job.retried = true;
          job.remaining = Math.round(job.total / 2);
          CM.emit(s, 'labSetback', { key: job.key });
          return;
        }
        s.lab.job = null;
        const breakthrough = CM.rand(s) < odds.luck;
        const recipe = this.labDiscover(s, job.key, breakthrough ? B.cheesery.labBreakthroughMade : 1);
        const w = job.source === 'worker' ? this.labWorker(s) : null;
        // Una investigación es un trabajo largo: cuenta para el ratón por los segundos que pide
        // (sin descontar su prisa), o no llegaría nunca a especializarse.
        const xm = w ? CM.mice.reward(s, 'research', 'all', Math.max(1, Math.round(this.labTime(s) / 1000)) * B.mice.xpPerAction) : 1;
        CM.skills.addXp(s, 'cheesemaking', B.xp.perCheese * recipeXp(recipe) * xm);
        CM.emit(s, 'recipeDiscovered', { recipeId: recipe.id, breakthrough });
        // Tinkerer: a veces sale además una segunda receta del mismo queso.
        if (w && CM.rand(s) < odds.bonus) {
          const base = parseKey(job.key).base;
          const extra = allCombos([base]).filter((c) => !comboLocked(s, c) && !this.recipeByKey(s, keyOf(c))).sort((a, b) => formula(b).value - formula(a).value)[0];
          if (extra) CM.emit(s, 'recipeDiscovered', { recipeId: this.labDiscover(s, keyOf(extra), 1).id, bonus: true });
        }
      }
      // Con un ratón en el laboratorio y una dirección marcada, la investigación sigue sola.
      // Buscar la siguiente es caro: se mira una vez cada dos segundos, no en cada paso.
      // Un encargo a mano que esperaba base va antes que la dirección.
      if (s.lab.next && !s.lab.job) {
        const combo = parseKey(s.lab.next);
        if (!combo || comboLocked(s, combo) || this.recipeByKey(s, s.lab.next)) s.lab.next = '';
        else if (this.experiment(s, combo, 'queue').ok) s.lab.next = '';
        else {
          s.lab.want = combo.base;
          return;
        }
      }
      const auto = !!this.labWorker(s) && !!s.lab.dir;
      if (auto && !s.lab.job && Math.floor(s.clock / 2000) !== Math.floor((s.clock - dt) / 2000)) {
        const next = this.labPick(s);
        if (next) this.experiment(s, next, 'worker');
        // Si no llega la base (la quesería se la lleva toda), la pide: la línea de ese
        // queso le deja juntar la suya antes de seguir cocinando.
        const wanted = s.lab.job ? null : this.labPick(s, false);
        s.lab.want = wanted ? wanted.base : '';
      }
      if (!auto || s.lab.job) s.lab.want = '';
    },
    produce(s, recipeId, lots) {
      const recipe = this.recipe(s, recipeId);
      if (!recipe) return CM.fail('unknown-recipe');
      const n = Math.max(1, Math.min(B.cheesery.maxQueue, Math.floor(lots) || 1));
      const per = this.batchFor(s, recipe, n, q.skillMult(s, 'cheesemaking'));
      return startJob(s, 'produce', parseKey(recipe.key), recipe, n, B.cheesery.lotBase * n * per, 'manual', per);
    },
    // Quesos por hornada ahora mismo: lo que den los moldes, o menos si no llega la base o las monedas.
    batchFor(s, recipe, cycles, cycleMult) {
      const combo = parseKey(recipe.key);
      const coin = B.ingredients[combo.ingredient].coinCost;
      const c = cycles || 1;
      return Math.max(1, Math.min(Math.floor(q.cheeseBatch(s) * (cycleMult || 1)), Math.floor(s.inv.base[combo.base] / (B.cheesery.lotBase * c)), coin ? Math.floor(s.coins / (coin * c)) : Infinity));
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
      // El laboratorio tiene preferencia sobre la base que le falta para su siguiente receta.
      const zbase = q.zoneDef(zoneId).base;
      if (s.lab.want === zbase && s.inv.base[zbase] < B.cheesery.lotBase + this.labCost(s)) return CM.fail('no-base');
      // Si el ciclo ya no puede ser más corto, la velocidad que sobra agranda la hornada.
      const w = CM.mice.at(s, 'cheesemaking', zoneId);
      const speed = w ? CM.mice.speed(w, 'cheesemaking', s, zoneId) : 1;
      const size = q.skillMult(s, 'cheesemaking') * (w ? CM.mice.yieldMult(w, 'cheesemaking', s, zoneId) : 1);
      const per = this.batchFor(s, recipe, 1, size * CM.cycle(jobTime(s, parseKey(recipe.key), recipe) / speed).mult);
      return startJob(s, 'produce', parseKey(recipe.key), recipe, 1, B.cheesery.lotBase * per, 'worker', per);
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
      const n = job.kind === 'experiment' ? 1 : Math.max(1, job.per || 1);
      recipe.made = (recipe.made || 0) + n;
      s.lots[recipe.id] = (s.lots[recipe.id] || 0) + n;
      s.totals.lotsProduced += n;
      z.stats.lots += n;
      job.lotsLeft -= 1;
      const w = job.source === 'worker' ? CM.mice.work(s, 'cheesemaking', zoneId) : null;
      const xm = w ? CM.mice.reward(s, 'cheesemaking', zoneId) : 1;
      // El nivel de la habilidad y el ratón ya agrandaron la hornada al empezar
      // (gastando su Base). Aquí solo queda la suerte: a veces la hornada sale doble.
      if (w && job.kind !== 'experiment' && CM.mice.out(s, w) > w.yield * 1.5) {
        s.lots[recipe.id] += n;
        s.totals.lotsProduced += n;
        z.stats.lots += n;
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
      return q.lotsTotal(s) > 0 ? 'ready' : 'no-cheese';
    },
    start(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      // Se venden primero los quesos más caros.
      const stock = s.recipes.filter((r) => (s.lots[r.id] || 0) > 0).sort((a, b) => this.price(s, b) - this.price(s, a));
      const w = source === 'worker' ? CM.mice.work(s, 'trading', 'all') : null;
      const cyc = CM.cycle(q.sellDuration(s) / (w ? w.speed : 1));
      let left = Math.floor(q.sellCount(s) * cyc.mult);
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
      const total = cyc.total;
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
