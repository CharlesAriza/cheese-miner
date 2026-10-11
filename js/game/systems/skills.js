// HABILIDADES, ÁRBOLES, EDIFICIOS y ZONAS: todo lo que es progresión.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  function spend(s, cost, what) {
    s.coins -= cost;
    s.totals.coinsSpent += cost;
    CM.emit(s, 'purchase', { what, cost });
  }

  CM.skills = {
    list: Object.keys(B.skills),
    // Suma experiencia y avisa si se sube de nivel.
    addXp(s, skill, amount) {
      if (!(amount > 0)) return;
      const before = q.level(s, skill);
      s.skills[skill].xp += amount;
      const after = q.level(s, skill);
      if (after > before) CM.emit(s, 'levelUp', { skill, level: after });
    },
  };

  CM.tree = {
    node: (skill, id) => (B.trees[skill] || []).find((n) => n.id === id) || null,
    rank: (s, skill, id) => s.nodes[skill + '.' + id] || 0,
    cost(s, skill, id) {
      const node = this.node(skill, id);
      return Math.round(node.cost * Math.pow(node.growth, this.rank(s, skill, id)));
    },
    // Estado de un nudo: { rank, max, cost, locked, maxed, canBuy }.
    info(s, skill, id) {
      const node = this.node(skill, id);
      const rank = this.rank(s, skill, id);
      const cost = this.cost(s, skill, id);
      const locked = B.skills[skill] ? q.level(s, skill) < node.level : false;
      const maxed = rank >= node.max;
      return { rank, max: node.max, cost, locked, maxed, canBuy: !locked && !maxed && s.coins >= cost };
    },
    buy(s, skill, id) {
      const node = this.node(skill, id);
      if (!node) return CM.fail('invalid');
      const info = this.info(s, skill, id);
      if (info.locked) return CM.fail('level-locked');
      if (info.maxed) return CM.fail('max-level');
      if (s.coins < info.cost) return CM.fail('no-coins');
      s.nodes[skill + '.' + id] = info.rank + 1;
      s.totals.nodesBought += 1;
      spend(s, info.cost, 'node:' + skill + '.' + id);
      CM.emit(s, 'nodeBought', { skill, id, rank: info.rank + 1, auto: node.branch === 'auto' });
      return CM.ok();
    },
    // Compra, de más barato a más caro, todo lo que se pueda pagar en un árbol.
    buyAll(s, skill) {
      let bought = 0;
      for (let guard = 0; guard < 500; guard++) {
        let best = null;
        for (const node of B.trees[skill]) {
          const info = this.info(s, skill, node.id);
          if (info.canBuy && (!best || info.cost < best.cost)) best = { id: node.id, cost: info.cost };
        }
        if (!best || !this.buy(s, skill, best.id).ok) break;
        bought += 1;
      }
      return bought ? CM.ok({ bought }) : CM.fail('no-coins');
    },
    // Cuántos nudos de un árbol se pueden comprar ahora mismo.
    affordable: (s, skill) => B.trees[skill].filter((n) => CM.tree.info(s, skill, n.id).canBuy).length,
  };

  // Edificios de la cadena: gratis, se desbloquean por hitos.
  CM.construction = {
    order: ['drill', 'refinery', 'cheesery', 'shop'],
    buildInfo(s, id) {
      const req = B.buildings[id].requires;
      const condOk = s.totals[req.total] >= req.min;
      return { built: s.built[id], condOk, condText: req.text, canBuild: !s.built[id] && condOk };
    },
    build(s, id) {
      const info = this.buildInfo(s, id);
      if (info.built) return CM.fail('already-built');
      if (!info.condOk) return CM.fail('locked');
      s.built[id] = true;
      CM.emit(s, 'built', { id });
      return CM.ok();
    },
    // Son gratis: se levantan solos en cuanto se cumple su condición.
    autoBuild(s) {
      for (const id of this.order) if (!s.built[id] && this.buildInfo(s, id).condOk) this.build(s, id);
    },
  };

  // Zonas: se suman, nunca se abandonan. Todas producen a la vez.
  CM.zones = {
    // La siguiente zona que se puede abrir (o null).
    next: (s) => B.zones.find((z) => !s.zones[z.id].unlocked) || null,
    unlock(s, id) {
      const def = q.zoneDef(id);
      if (!def) return CM.fail('invalid');
      if (s.zones[id].unlocked) return CM.fail('already-unlocked');
      const next = this.next(s);
      if (!next || next.id !== id) return CM.fail('locked');
      if (s.coins < def.unlockCost) return CM.fail('no-coins');
      s.zones[id].unlocked = true;
      s.totals.zonesUnlocked += 1;
      spend(s, def.unlockCost, 'zone:' + id);
      CM.emit(s, 'zoneUnlocked', { id });
      return CM.ok();
    },
  };
})();
