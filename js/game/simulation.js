// Reloj de simulación, hitos y progreso offline.
// La economía avanza por pasos de tiempo fijos; nunca depende de frames ni de efectos visuales.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  const MACHINES = {
    drill: { sys: () => CM.drilling, role: 'driller' },
    refinery: { sys: () => CM.refining, role: 'refiner' },
    cheesery: { sys: () => CM.cheesery, role: 'cheesemaker' },
  };

  // Avanza una máquina `dt` ms. Si hay trabajador, encadena ciclos mientras pueda.
  function runMachine(s, key, dt) {
    const m = MACHINES[key];
    const sys = m.sys();
    let left = dt;
    let guard = 0;
    while (guard++ < 200) {
      let job = s.jobs[key];
      if (!job) {
        if (!m.role || !q.isAutomated(s, m.role) || !sys.start(s, 'worker').ok) break;
        job = s.jobs[key];
      }
      const used = Math.min(left, job.remaining);
      job.remaining -= used;
      left -= used;
      if (job.remaining > 0) break;
      sys.complete(s);
    }
    const st = sys.status(s);
    const bucket = s.metrics.machineMs[key];
    bucket[st] = (bucket[st] || 0) + dt;
  }

  function runMiners(s, dt) {
    if (s.workers.miner <= 0) return;
    if (CM.mining.status(s) !== 'ready') {
      s.minerAcc = 0;
      return;
    }
    s.minerAcc += dt * s.workers.miner;
    let guard = 0;
    while (s.minerAcc >= B.mining.minerIntervalMs && guard++ < 200) {
      s.minerAcc -= B.mining.minerIntervalMs;
      if (!CM.mining.hit(s, 'worker').ok) {
        s.minerAcc = 0;
        break;
      }
    }
  }

  // ---------- HITOS ----------
  const depProgress = (s) => {
    const vein = q.veinDef(s, s.activeDeposit);
    return vein ? [q.dep(s).discover, vein.hits] : [0, 1];
  };
  const CORE_ROLES = ['miner', 'driller', 'refiner'];
  const GOALS = [
    { id: 'vein', text: 'Find a cheese vein', done: (s) => s.totals.veinsFound >= 1, prog: depProgress },
    { id: 'drill', text: 'Build the Cheese Drill', done: (s) => s.built.drill },
    { id: 'raw', text: 'Drill 4 Raw Cheese', done: (s) => s.totals.rawProduced >= 4, prog: (s) => [s.totals.rawProduced, 4] },
    { id: 'refinery', text: 'Build the Refinery', done: (s) => s.built.refinery },
    { id: 'base', text: 'Refine 3 Cheese Base', done: (s) => s.totals.baseProduced >= 3, prog: (s) => [s.totals.baseProduced, 3] },
    { id: 'cheesery', text: 'Build the Cheesery', done: (s) => s.built.cheesery },
    { id: 'recipe', text: 'Discover a recipe', done: (s) => s.totals.recipes >= 1 },
    { id: 'market', text: 'Build your Cheese Shop', done: (s) => s.built.market },
    { id: 'sale', text: 'Sell a cheese to a customer', done: (s) => s.totals.lotsSold >= 1 },
    { id: 'markup', text: 'Haggle: sell a cheese with a markup', done: (s) => s.totals.markupSales >= 1 },
    { id: 'house', text: 'Build the Mouse House', done: (s) => s.built.house },
    { id: 'worker', text: 'Hire your first worker', done: (s) => s.totals.workersHired >= 1 },
    {
      id: 'allRoles',
      text: 'Hire a Miner, Driller and Refiner',
      done: (s) => CORE_ROLES.every((r) => s.workers[r] > 0),
      prog: (s) => [CORE_ROLES.filter((r) => s.workers[r] > 0).length, 3],
    },
    { id: 'rep3', text: 'Reach shop reputation 3', done: (s) => CM.merchant.repLevel(s) >= 3, prog: (s) => [Math.min(s.rep, B.merchant.repLevels[2]), B.merchant.repLevels[2]] },
    { id: 'deposit2', text: 'Open a second zone', done: (s) => s.totals.depositsUnlocked >= 2 },
    { id: 'cook', text: 'Hire a Cheesemaker and give it a recipe', done: (s) => s.workers.cheesemaker > 0 && !!CM.cheesery.recipe(s, s.cookRecipe) },
    { id: 'depleted', text: 'Exhaust a whole zone', done: (s) => s.totals.depositsDepleted >= 1 },
  ];

  function updateGoals(s) {
    for (const g of GOALS) {
      if (s.goalsDone[g.id] === undefined && g.done(s)) {
        s.goalsDone[g.id] = s.clock;
        const reward = B.goalRewards[g.id] || 0;
        s.coins += reward;
        s.totals.coinsEarned += reward;
        s.totals.goalCoins += reward;
        CM.emit(s, 'goal', { id: g.id, text: g.text, reward });
      }
    }
  }

  CM.sim = {
    GOALS,
    // Un paso de simulación. Orden fijo: minería, taladro, refinería, cheesery, mercado.
    step(s, dt) {
      s.clock += dt;
      runMiners(s, dt);
      runMachine(s, 'drill', dt);
      runMachine(s, 'refinery', dt);
      runMachine(s, 'cheesery', dt);
      CM.merchant.tick(s, dt);
      updateGoals(s);
    },
    advance(s, ms, stepMs) {
      let left = ms;
      while (left > 0) {
        const dt = Math.min(stepMs, left);
        this.step(s, dt);
        left -= dt;
      }
    },
    objective(s) {
      const goal = GOALS.find((g) => s.goalsDone[g.id] === undefined);
      if (!goal) return { text: 'Alpha goals complete. Optimise your colony!', cur: 1, max: 1, done: true };
      const p = goal.prog ? goal.prog(s) : [0, 1];
      return { id: goal.id, text: goal.text, cur: Math.min(p[0], p[1]), max: p[1], hasBar: !!goal.prog, reward: B.goalRewards[goal.id] || 0 };
    },

    // Progreso offline: se simula el tiempo real transcurrido desde el último
    // guardado, con tope. Usa exactamente la misma simulación, así que solo
    // produce lo que esté automatizado y tenga recursos y capacidad.
    applyOffline(s, now) {
      const away = now - s.lastSavedAt;
      s.lastSavedAt = now; // se consume aquí: recargar no vuelve a contar el mismo tramo
      if (!(away >= B.offline.minMs)) return null;
      const simulated = Math.min(away, B.offline.capMs);
      const before = Object.assign({}, s.totals);
      const wasMuted = CM.muted;
      CM.muted = true;
      this.advance(s, simulated, B.offline.stepMs);
      CM.muted = wasMuted;
      s.metrics.offlineMs += simulated;
      s.metrics.offlineReturns += 1;
      const delta = {};
      for (const k of Object.keys(before)) delta[k] = s.totals[k] - before[k];
      const summary = {
        awayMs: away,
        simulatedMs: simulated,
        capped: away > B.offline.capMs,
        delta,
        automated: q.workersTotal(s) > 0,
        workers: CM.workers.roles.filter((r) => s.workers[r] > 0).map((r) => ({ role: r, status: CM.workers.status(s, r) })),
      };
      CM.emit(s, 'offlineApplied', { simulatedMs: simulated });
      return summary;
    },
  };
})();
