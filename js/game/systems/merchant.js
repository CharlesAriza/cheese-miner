// CHEESE SHOP: clientes con preferencias que entran, esperan un rato y regatean.
// Vender bien sube la reputación, que trae mejores clientes y mejores precios.
(function () {
  const B = CM.BALANCE;
  const M = B.merchant;
  const STATS = ['taste', 'funk', 'aroma', 'value'];

  // Nivel de reputación (1..n) a partir de los puntos acumulados.
  function repLevel(s) {
    let level = 1;
    for (let i = 1; i < M.repLevels.length; i++) if (s.rep >= M.repLevels[i]) level = i + 1;
    return level;
  }
  // Progreso hacia el siguiente nivel: { level, cur, need, maxed }.
  function repProgress(s) {
    const level = repLevel(s);
    const next = M.repLevels[level];
    if (next === undefined) return { level, cur: 1, need: 1, maxed: true };
    const from = M.repLevels[level - 1];
    return { level, cur: s.rep - from, need: next - from, maxed: false };
  }

  const unlockedBuyers = (s) => Object.keys(M.buyers).filter((id) => repLevel(s) >= M.buyers[id].unlockRep);

  // Cada cliente pide algo derivado de una receta que SÍ existe con las bases
  // abiertas, así que siempre hay al menos una combinación que lo cumple.
  function generate(s, slot) {
    const pool = unlockedBuyers(s).filter((id) => id !== 'neighbor');
    const buyerId = slot === 0 || !pool.length ? 'neighbor' : pool[Math.floor(CM.rand(s) * pool.length)];
    const buyer = M.buyers[buyerId];
    const req = {};
    if (buyer.maturation) req.maturation = buyer.maturation;
    if (buyer.reqStats.length) {
      const combos = CM.cheesery
        .allCombos(CM.cheesery.unlockedBases(s))
        .filter((c) => !buyer.maturation || c.maturation === buyer.maturation);
      const target = CM.cheesery.computeStats(combos[Math.floor(CM.rand(s) * combos.length)]);
      for (const stat of buyer.reqStats) {
        req[stat] = stat === 'value' ? Math.floor(target.value * 0.9) : Math.max(1, target[stat] - M.reqSlack);
      }
    }
    const qty = buyer.qty[0] + Math.floor(CM.rand(s) * (buyer.qty[1] - buyer.qty[0] + 1));
    return { id: 'o' + s.nextId++, buyer: buyerId, qty, req, patience: buyer.patienceMs, patienceMax: buyer.patienceMs };
  }

  const leave = (s, i) => (s.orders[i] = { cooldown: Math.max(M.cooldownMinMs, M.cooldownMs - M.cooldownPerRepMs * (repLevel(s) - 1)) });

  CM.merchant = {
    STATS,
    repLevel,
    repProgress,
    unlockedBuyers,
    // Llegan clientes a los huecos libres; los que esperan pierden paciencia y se van.
    tick(s, dt) {
      if (!s.built.market) return;
      for (let i = 0; i < M.slots; i++) {
        const slot = s.orders[i];
        if (slot && slot.id) {
          slot.patience -= dt;
          if (slot.patience <= 0) {
            s.totals.walkouts += 1;
            CM.emit(s, 'customerLeft', { buyer: slot.buyer });
            leave(s, i);
          }
          continue;
        }
        if (slot && slot.cooldown > dt) {
          slot.cooldown -= dt;
          continue;
        }
        s.orders[i] = generate(s, i);
        CM.emit(s, 'orderArrived', { buyer: s.orders[i].buyer });
      }
    },
    find: (s, orderId) => s.orders.findIndex((o) => o && o.id === orderId),
    matches(order, recipe) {
      const combo = CM.cheesery.parseKey(recipe.key);
      const stats = CM.cheesery.statsOf(recipe);
      if (order.req.maturation && combo.maturation !== order.req.maturation) return false;
      return STATS.every((k) => order.req[k] === undefined || stats[k] >= order.req[k]);
    },
    // Oferta para un cliente: precio por unidad, total y probabilidad de que acepte.
    // La probabilidad sube si el queso supera lo que pide y con la reputación.
    quote(s, order, recipe, stanceId) {
      const buyer = M.buyers[order.buyer];
      const stance = M.stances[stanceId || 'fair'];
      const stats = CM.cheesery.statsOf(recipe);
      const bonus = !!buyer.bonus && stats[buyer.bonus.stat] >= buyer.bonus.min;
      const level = repLevel(s);
      const repMult = 1 + M.repPricePerLevel * (level - 1);
      const unit = Math.max(1, Math.round(stats.value * buyer.priceMult * (bonus ? buyer.bonus.mult : 1) * repMult * stance.priceMult));
      let chance = stance.chance;
      if (chance < 1) {
        let extra = 0;
        for (const k of ['taste', 'funk', 'aroma']) if (order.req[k] !== undefined) extra += Math.max(0, stats[k] - order.req[k]);
        chance += Math.min(M.fitChanceMax, extra * M.fitChancePerPoint) + (bonus ? M.bonusChance : 0) + M.repChancePerLevel * (level - 1);
        chance = Math.min(M.chanceMax, chance);
      }
      return { unit, total: unit * order.qty, bonus, chance };
    },
    // Hace una oferta. Si acepta, consume los lotes y paga UNA sola vez.
    // Si la rechaza, el cliente se va y no se pierde ni se cobra nada.
    deliver(s, orderId, recipeId, stanceId) {
      const i = this.find(s, orderId);
      if (i < 0) return CM.fail('order-gone');
      const order = s.orders[i];
      const recipe = CM.cheesery.recipe(s, recipeId);
      const stance = M.stances[stanceId || 'fair'];
      if (!recipe) return CM.fail('unknown-recipe');
      if (!stance) return CM.fail('invalid');
      if ((s.lots[recipeId] || 0) < order.qty) return CM.fail('no-lots');
      if (!this.matches(order, recipe)) return CM.fail('no-match');
      const price = this.quote(s, order, recipe, stanceId);
      if (price.chance < 1 && CM.rand(s) >= price.chance) {
        s.totals.walkouts += 1;
        leave(s, i);
        CM.emit(s, 'haggleFail', { buyer: order.buyer });
        return CM.ok({ sold: false });
      }
      const before = repLevel(s);
      s.lots[recipeId] -= order.qty;
      s.coins += price.total;
      s.rep += stance.rep * order.qty;
      s.totals.lotsSold += order.qty;
      s.totals.coinsEarned += price.total;
      if (stance.priceMult > 1) s.totals.markupSales += 1;
      leave(s, i);
      CM.emit(s, 'sale', { buyer: order.buyer, recipeId, qty: order.qty, coins: price.total, bonus: price.bonus, stance: stanceId || 'fair' });
      if (repLevel(s) > before) CM.emit(s, 'repUp', { level: repLevel(s) });
      return CM.ok({ sold: true, coins: price.total });
    },
    decline(s, orderId) {
      const i = this.find(s, orderId);
      if (i < 0) return CM.fail('order-gone');
      leave(s, i);
      CM.emit(s, 'orderDeclined');
      return CM.ok();
    },
  };
})();
