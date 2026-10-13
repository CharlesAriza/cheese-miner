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
      if (!why && node.gate && !CM.milestones.gateOk(s, node)) why = CM.milestones.gateText(s, node);
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

  // ---------- Hitos ----------
  // Mejoras especiales de compra única. Las dos primeras piezas de la estructura: unas se abren
  // con un rango de otra mejora y otras con un objetivo de producción («cocina N quesos»).
  // El objetivo se fija una vez, con dos horas de tu mejor ritmo SOSTENIDO (media de media hora,
  // sin contar las Grand Wheels), y no cambia hasta cumplirse: producir más lo acerca y producir
  // menos no lo abarata. Cuenta todo lo cocinado, también con el juego cerrado.
  const MS = B.milestones;
  // Cifra redonda (dos cifras significativas), para que se lea bien.
  const nice = (n) => {
    const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.max(1, n))) - 1));
    return Math.max(1, Math.ceil(n / p) * p);
  };
  CM.milestones = {
    nodes: () => B.trees.cheesemaking.filter((n) => n.gate),
    has: (s, id) => !!s.nodes['cheesemaking.' + id],
    gateOk(s, node) {
      const g = node.gate;
      if (g.rank) return CM.tree.rank(s, 'cheesemaking', g.rank[0]) >= g.rank[1];
      return s.quota.done >= g.quota;
    },
    gateText(s, node) {
      const g = node.gate;
      if (g.rank) return 'Needs ' + CM.tree.node('cheesemaking', g.rank[0]).name + ' ' + g.rank[1];
      const goal = this.goal(s);
      return goal && s.quota.done + 1 === g.quota ? 'Cook ' + CM.fmt(goal.left) + ' more cheese' : 'Comes after the milestone before it';
    },
    // El objetivo en curso: { cur, need, left, etaMs } o null.
    goal(s) {
      const Q = s.quota;
      if (!Q.need) return null;
      const cur = Math.min(Q.need, s.totals.lotsProduced - Q.from);
      const rate = this.sustained(s);
      return { n: Q.done + 1, cur, need: Q.need, left: Q.need - cur, etaMs: rate > 0 ? ((Q.need - cur) / rate) * 3600000 : 0 };
    },
    // Quesos por hora, de media, en la última media hora (sin Grand Wheels).
    sustained: (s) => (s.quota.full >= 3 ? ((s.quota.b0 + s.quota.b1 + s.quota.b2) / 3) * (3600000 / MS.bucketMs) : 0),
    // Hitos abiertos y aún sin comprar.
    waiting: (s) => CM.milestones.nodes().filter((n) => s.msOpen[n.id] && !s.nodes['cheesemaking.' + n.id]),
    tick(s) {
      const Q = s.quota;
      if (s.clock - Q.at >= MS.bucketMs) {
        const regular = s.totals.lotsProduced - s.totals.wheelLots;
        Q.b2 = Q.b1;
        Q.b1 = Q.b0;
        Q.b0 = regular - Q.mark;
        Q.mark = regular;
        Q.at = s.clock;
        Q.full = Math.min(3, Q.full + 1);
        if (Q.full >= 3) Q.best = Math.max(Q.best, this.sustained(s));
      }
      const all = this.nodes();
      // El contador empieza cuando ya están abiertos los hitos que dependen de un rango.
      if (!Q.need && Q.best > 0 && Q.done < all.filter((n) => n.gate.quota).length && all.every((n) => !n.gate.rank || s.msOpen[n.id])) {
        Q.from = s.totals.lotsProduced;
        Q.need = nice(Q.best * MS.hours);
        CM.emit(s, 'quotaSet', { need: Q.need });
      }
      if (Q.need && s.totals.lotsProduced - Q.from >= Q.need) {
        Q.done += 1;
        Q.need = 0;
        CM.emit(s, 'quotaDone', { n: Q.done });
      }
      for (const node of all) {
        if (s.msOpen[node.id] || !this.gateOk(s, node)) continue;
        s.msOpen[node.id] = 1;
        CM.emit(s, 'milestoneOpen', { id: node.id });
      }
    },
    // --- Cheese Board: lo que se vende de cada tipo, con las ventas viejas pesando cada vez menos ---
    sold(s, recipe, coins) {
      const b = s.board;
      const c = CM.cheesery.parseKey(recipe.key);
      b.v[c.ingredient] += coins;
      b.v[c.treatment] += coins;
      b.v[c.maturation] += coins;
    },
    // Antes de una venta: las ventas anteriores se van olvidando.
    boardFade(s) {
      const b = s.board;
      const f = Math.exp(-(s.clock - b.at) / MS.board.tauMs);
      for (const k of Object.keys(b.v)) b.v[k] *= f;
      b.at = s.clock;
    },
    // Cuántos tipos «efectivos» hay en una familia: uno si todo es lo mismo; tres si tres se
    // reparten las ventas a partes iguales. Un tipo que apenas vende apenas cuenta.
    boardFamilies(s) {
      const fam = { ingredient: Object.keys(B.ingredients), treatment: Object.keys(B.treatments), maturation: Object.keys(B.maturations) };
      const out = {};
      for (const name of Object.keys(fam)) {
        let sum = 0;
        let sq = 0;
        for (const k of fam[name]) {
          sum += s.board.v[k];
          sq += s.board.v[k] * s.board.v[k];
        }
        out[name] = { eff: sq > 0 ? (sum * sum) / sq : 1, shares: fam[name].map((k) => ({ id: k, share: sum > 0 ? s.board.v[k] / sum : 0 })) };
      }
      return out;
    },
    boardUpdate(s) {
      const f = this.boardFamilies(s);
      s.board.mult = 1 + MS.board.per * (f.ingredient.eff - 1 + (f.treatment.eff - 1) + (f.maturation.eff - 1));
    },
    // --- Grand Master ---
    // Grado según las hornadas de su vida: el primero a las 20.000, y otro cada vez que las dobla.
    masterGrade(m) {
      const jobs = (m && m.jobs && m.jobs.cheesemaking) || 0;
      return jobs < MS.master.from ? 0 : Math.floor(Math.log2(jobs / MS.master.from)) + 1;
    },
    masterNext: (grade) => MS.master.from * Math.pow(2, grade),
    master: (s) => (s.master ? CM.mice.byId(s, s.master) : null),
    // Lo que sube el queso de una roca: solo si el Grand Master es quien cocina ahí.
    masterMult(s, zone) {
      if (!s.master || !s.nodes['cheesemaking.master']) return 1;
      const cook = CM.mice.at(s, 'cheesemaking', zone);
      return cook && cook.id === s.master ? 1 + MS.master.per * this.masterGrade(cook) : 1;
    },
    nameMaster(s, id) {
      if (!s.nodes['cheesemaking.master']) return CM.fail('locked');
      const m = CM.mice.byId(s, id);
      if (!m) return CM.fail('invalid');
      if (s.master === id) return CM.fail('invalid');
      s.master = id;
      CM.emit(s, 'masterNamed', { id });
      return CM.ok();
    },
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
