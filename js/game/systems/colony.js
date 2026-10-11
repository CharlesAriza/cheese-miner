// CONSTRUCCIÓN, MEJORAS, TRABAJADORES y YACIMIENTOS.
// Mejorar una máquina y contratar a quien la opera son cosas separadas.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  function spend(s, cost, what) {
    s.coins -= cost;
    s.totals.coinsSpent += cost;
    CM.emit(s, 'purchase', { what, cost });
  }

  // ---------- EDIFICIOS ----------
  CM.construction = {
    order: ['drill', 'refinery', 'cheesery', 'market', 'storage', 'house'],
    buildInfo(s, id) {
      const def = B.buildings[id];
      const req = def.requires;
      const condOk = !req || s.totals[req.total] >= req.min;
      return { built: s.built[id], cost: def.cost, condOk, condText: req ? req.text : '', canBuild: !s.built[id] && condOk && s.coins >= def.cost };
    },
    build(s, id) {
      const info = this.buildInfo(s, id);
      if (info.built) return CM.fail('already-built');
      if (!info.condOk) return CM.fail('locked');
      if (s.coins < info.cost) return CM.fail('no-coins');
      s.built[id] = true;
      spend(s, info.cost, 'build:' + id);
      CM.emit(s, 'built', { id });
      return CM.ok();
    },
    upgradeInfo(s, id) {
      const def = B.upgrades[id];
      const level = s.levels[id];
      const available = id === 'pickaxe' || s.built[id];
      const maxed = level >= def.maxLevel;
      const cost = Math.round(def.base * Math.pow(def.growth, level));
      return { level, maxed, cost, available, canUpgrade: available && !maxed && s.coins >= cost };
    },
    upgrade(s, id) {
      const info = this.upgradeInfo(s, id);
      if (!info.available) return CM.fail('not-built');
      if (info.maxed) return CM.fail('max-level');
      if (s.coins < info.cost) return CM.fail('no-coins');
      s.levels[id] += 1;
      spend(s, info.cost, 'upgrade:' + id);
      CM.emit(s, 'upgraded', { id, level: s.levels[id] });
      return CM.ok();
    },
  };

  // ---------- TRABAJADORES ----------
  CM.workers = {
    roles: ['miner', 'driller', 'refiner', 'cheesemaker'],
    hireInfo(s, role) {
      const def = B.workers[role];
      const full = q.workersTotal(s) >= q.slots(s);
      const maxed = s.workers[role] >= def.max;
      return { cost: def.cost, full, maxed, canHire: s.built.house && !full && !maxed && s.coins >= def.cost };
    },
    hire(s, role) {
      const info = this.hireInfo(s, role);
      if (!s.built.house) return CM.fail('no-house');
      if (info.maxed) return CM.fail('role-full');
      if (info.full) return CM.fail('no-beds');
      if (s.coins < info.cost) return CM.fail('no-coins');
      s.workers[role] += 1;
      s.totals.workersHired += 1;
      spend(s, info.cost, 'hire:' + role);
      CM.emit(s, 'hired', { role });
      return CM.ok();
    },
    // Estado legible de cada rol: active, waiting-vein, vein-exposed, no-material, storage-full, no-work, no-recipe, no-coins.
    status(s, role) {
      if (s.workers[role] <= 0) return 'none';
      if (role === 'miner') {
        const st = CM.mining.status(s);
        return st === 'ready' ? 'active' : st === 'vein-exposed' ? 'vein-exposed' : 'no-work';
      }
      if (role === 'cheesemaker') return CM.cheesery.autoStatus(s);
      const st = role === 'driller' ? CM.drilling.status(s) : CM.refining.status(s);
      if (st === 'running' || st === 'ready') return 'active';
      if (st === 'no-vein') return 'waiting-vein';
      if (st === 'no-raw') return 'no-material';
      if (st === 'storage-full') return 'storage-full';
      return 'no-work';
    },
  };

  // ---------- YACIMIENTOS ----------
  CM.deposits = {
    list: () => B.deposits,
    // Salvaguarda anti-bloqueo: si no queda nada que extraer, procesar ni vender,
    // el siguiente yacimiento cuesta lo que el jugador tenga.
    stranded(s) {
      const anyVein = B.deposits.some((d) => s.deposits[d.id].unlocked && q.depPhase(s, d.id) !== 'depleted');
      const anyJob = s.jobs.drill || s.jobs.refinery || s.jobs.cheesery;
      return !anyVein && !anyJob && q.rawTotal(s) < B.refinery.rawPerBase && q.baseTotal(s) < B.cheesery.lotBase && q.lotsTotal(s) === 0;
    },
    unlockCost(s, id) {
      const def = q.depDef(id);
      return this.stranded(s) ? Math.min(def.unlockCost, s.coins) : def.unlockCost;
    },
    unlock(s, id) {
      const def = q.depDef(id);
      if (!def || def.inAlpha === false) return CM.fail('not-in-alpha');
      if (s.deposits[id].unlocked) return CM.fail('already-unlocked');
      const cost = this.unlockCost(s, id);
      if (s.coins < cost) return CM.fail('no-coins');
      s.deposits[id].unlocked = true;
      s.totals.depositsUnlocked += 1;
      spend(s, cost, 'deposit:' + id);
      CM.emit(s, 'depositUnlocked', { id });
      return CM.ok();
    },
    setActive(s, id) {
      if (!s.deposits[id] || !s.deposits[id].unlocked) return CM.fail('locked');
      if (s.activeDeposit === id) return CM.ok();
      s.activeDeposit = id;
      s.combo = 0;
      CM.emit(s, 'depositSwitched', { id });
      return CM.ok();
    },
  };
})();
