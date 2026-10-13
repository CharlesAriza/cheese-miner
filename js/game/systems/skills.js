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
    // Las habilidades del jugador (con nivel y árbol). Research es solo oficio de ratón.
    list: Object.keys(B.skills).filter((k) => !B.skills[k].job),
    jobs: Object.keys(B.skills),
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
      // Por qué no se puede comprar todavía: nivel, el edificio del laboratorio, otra mejora.
      let why = B.skills[skill] && q.level(s, skill) < node.level ? 'Needs ' + B.skills[skill].name + ' LV ' + node.level : '';
      if (!why && skill === 'lab' && !s.built.lab) why = 'Build the Cheese Lab';
      if (!why && node.needs && !this.rank(s, skill, node.needs)) why = 'Needs ' + this.node(skill, node.needs).name;
      if (!why && node.needLevel && q.level(s, node.needLevel.skill) < node.needLevel.level) why = 'Needs ' + B.skills[node.needLevel.skill].name + ' LV ' + node.needLevel.level;
      const locked = !!why;
      const maxed = rank >= node.max;
      return { rank, max: node.max, cost, locked, why, maxed, canBuy: !locked && !maxed && s.coins >= cost };
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
      // Con las direcciones recién abiertas, el laboratorio sigue con lo que ya hacía.
      if (skill === 'lab' && id === 'advanced' && !s.lab.dir) s.lab.dir = 'value';
      CM.emit(s, 'nodeBought', { skill, id, rank: info.rank + 1, auto: node.branch === 'auto' });
      return CM.ok();
    },
    // Compra, de más barato a más caro, todo lo que se pueda pagar en un árbol.
    buyAll(s, skill) {
      let bought = 0;
      for (let guard = 0; guard < 500; guard++) {
        let best = null;
        for (const node of B.trees[skill]) {
          if (node.unlock) continue; // lo que abre una función lo compra el jugador, leyendo qué es
          const info = this.info(s, skill, node.id);
          if (info.canBuy && (!best || info.cost < best.cost)) best = { id: node.id, cost: info.cost };
        }
        if (!best || !this.buy(s, skill, best.id).ok) break;
        bought += 1;
      }
      return bought ? CM.ok({ bought }) : CM.fail('no-coins');
    },
    // Árboles que mira BUY ALL: los de edificios ya construidos, la colonia y el laboratorio.
    open: (s, skill) => !B.skills[skill] || s.built[B.skills[skill].station] !== false,
    // BUY ALL: mira todos los árboles a la vez y compra siempre lo más barato que quede, hasta
    // que no alcance para nada. Así una habilidad no se lleva todas las monedas por ir primera
    // en la lista. Con `dry` no toca la partida: solo dice qué compraría y cuánto costaría.
    // Devuelve { bought, cost, bySkill, next }: `next` es lo siguiente que no se puede pagar.
    sweep(s, dry) {
      const w = dry ? Object.create(s) : s;
      if (dry) {
        w.coins = s.coins;
        w.nodes = Object.assign({}, s.nodes);
      }
      const out = { bought: 0, cost: 0, bySkill: {}, next: null };
      for (let guard = 0; guard < 500; guard++) {
        let best = null;
        for (const skill of Object.keys(B.trees)) {
          if (!this.open(s, skill)) continue;
          for (const node of B.trees[skill]) {
            if (node.unlock) continue; // lo que abre una función lo compra el jugador, leyendo qué es
            const info = this.info(w, skill, node.id);
            if (info.locked || info.maxed) continue;
            if (!best || info.cost < best.cost) best = { skill, id: node.id, cost: info.cost };
          }
        }
        if (!best || w.coins < best.cost) {
          out.next = best;
          break;
        }
        if (dry) {
          w.coins -= best.cost;
          w.nodes[best.skill + '.' + best.id] = (w.nodes[best.skill + '.' + best.id] || 0) + 1;
        } else if (!this.buy(s, best.skill, best.id).ok) break;
        out.bought += 1;
        out.cost += best.cost;
        out.bySkill[best.skill] = (out.bySkill[best.skill] || 0) + 1;
      }
      return out;
    },
    // Cuántos nudos de un árbol se pueden comprar ahora mismo.
    // `bulk`: solo lo que compraría BUY ALL (sin las mejoras que abren funciones).
    affordable: (s, skill, bulk) => B.trees[skill].filter((n) => !(bulk && n.unlock) && CM.tree.info(s, skill, n.id).canBuy).length,
  };

  // Edificios de la cadena: gratis, se desbloquean por hitos.
  CM.construction = {
    order: ['drill', 'refinery', 'cheesery', 'shop', 'house', 'lab'],
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
    // El siguiente edificio que ya se puede construir (o null).
    nextReady(s) {
      return this.order.find((id) => this.buildInfo(s, id).canBuild) || null;
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
