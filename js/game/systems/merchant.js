// CHEESE MERCHANT: compradores con preferencias, pedidos y ventas.
(function () {
  const B = CM.BALANCE;
  const M = B.merchant;
  const STATS = ['taste', 'funk', 'aroma', 'value'];

  const unlockedBuyers = (s) => Object.keys(M.buyers).filter((id) => s.totals.lotsSold >= M.buyers[id].unlockSales);

  // Cada pedido se deriva de una receta que SÍ existe con las bases abiertas,
  // así que siempre hay al menos una combinación que lo cumple.
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
    return { id: 'o' + s.nextId++, buyer: buyerId, qty, req };
  }

  CM.merchant = {
    STATS,
    unlockedBuyers,
    // Mantiene los huecos de pedidos: genera clientes y descuenta esperas.
    tick(s, dt) {
      if (!s.built.market) return;
      for (let i = 0; i < M.slots; i++) {
        const slot = s.orders[i];
        if (slot && slot.id) continue;
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
      const stats = CM.cheesery.computeStats(combo);
      if (order.req.maturation && combo.maturation !== order.req.maturation) return false;
      return STATS.every((k) => order.req[k] === undefined || stats[k] >= order.req[k]);
    },
    // Precio por lote y si se aplica la preferencia del comprador.
    quote(order, recipe) {
      const buyer = M.buyers[order.buyer];
      const stats = CM.cheesery.statsOf(recipe);
      const bonus = !!buyer.bonus && stats[buyer.bonus.stat] >= buyer.bonus.min;
      const unit = Math.max(1, Math.round(stats.value * buyer.priceMult * (bonus ? buyer.bonus.mult : 1)));
      return { unit, total: unit * order.qty, bonus };
    },
    // Consume los lotes y paga UNA sola vez: el pedido desaparece en la misma operación.
    deliver(s, orderId, recipeId) {
      const i = this.find(s, orderId);
      if (i < 0) return CM.fail('order-gone');
      const order = s.orders[i];
      const recipe = CM.cheesery.recipe(s, recipeId);
      if (!recipe) return CM.fail('unknown-recipe');
      if ((s.lots[recipeId] || 0) < order.qty) return CM.fail('no-lots');
      if (!this.matches(order, recipe)) return CM.fail('no-match');
      const price = this.quote(order, recipe);
      s.lots[recipeId] -= order.qty;
      s.coins += price.total;
      s.totals.lotsSold += order.qty;
      s.totals.coinsEarned += price.total;
      s.orders[i] = { cooldown: M.cooldownMs };
      CM.emit(s, 'sale', { buyer: order.buyer, recipeId, qty: order.qty, coins: price.total, bonus: price.bonus });
      return CM.ok({ coins: price.total });
    },
    decline(s, orderId) {
      const i = this.find(s, orderId);
      if (i < 0) return CM.fail('order-gone');
      s.orders[i] = { cooldown: M.cooldownMs };
      CM.emit(s, 'orderDeclined');
      return CM.ok();
    },
  };
})();
