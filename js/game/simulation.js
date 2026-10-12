// Reloj de simulación, automatización, objetivos y progreso offline.
// La economía avanza por pasos de tiempo fijos; nunca depende de frames ni de efectos visuales.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  // Avanza un ciclo `dt` ms. Si la etapa está automatizada, encadena ciclos mientras pueda.
  function runJob(dt, getJob, auto, start, complete) {
    let left = dt;
    for (let guard = 0; guard < 200; guard++) {
      let job = getJob();
      if (!job) {
        if (!auto || !start().ok) return;
        job = getJob();
      }
      const used = Math.min(left, job.remaining);
      job.remaining -= used;
      left -= used;
      if (job.remaining > 0) return;
      complete();
    }
  }

  // El ratón minero de una roca da golpes a su ritmo mientras no haya veta a la vista.
  function runMiner(s, zoneId, dt) {
    const z = s.zones[zoneId];
    const w = CM.mice.work(s, 'mining', zoneId);
    if (!w || CM.mining.status(s, zoneId) !== 'ready') {
      z.minerAcc = 0;
      return;
    }
    const interval = q.minerInterval(s);
    z.minerAcc += dt * w.speed;
    for (let guard = 0; z.minerAcc >= interval && guard < 500; guard++) {
      z.minerAcc -= interval;
      if (!CM.mining.hit(s, zoneId, 'worker', CM.mice.out(s, w)).ok) {
        z.minerAcc = 0;
        break;
      }
      CM.mice.reward(s, 'mining', zoneId, B.mice.xpPerHit);
    }
  }

  // ---------- OBJETIVOS ----------
  const AUTO = ['mining', 'drilling', 'refining', 'cheesemaking', 'trading'];
  const maxLevel = (s) => Math.max(...CM.skills.list.map((k) => q.level(s, k)));
  const maxDepth = (s) => Math.max(...B.zones.map((z) => s.zones[z.id].depth));
  const RAW_GOAL = B.buildings.refinery.requires.min;
  const BASE_GOAL = B.buildings.cheesery.requires.min;
  const GOALS = [
    { id: 'vein', text: 'Find a cheese vein', done: (s) => s.totals.veinsFound >= 1, prog: (s) => [Math.floor(s.zones.cheddar.discover), q.veinHits(s, 'cheddar')] },
    { id: 'drill', text: 'Build the Cheese Drill', done: (s) => s.built.drill },
    { id: 'raw', text: 'Drill ' + RAW_GOAL + ' Raw Cheese', done: (s) => s.totals.rawProduced >= RAW_GOAL, prog: (s) => [s.totals.rawProduced, RAW_GOAL] },
    { id: 'refinery', text: 'Build the Refinery', done: (s) => s.built.refinery },
    { id: 'base', text: 'Refine ' + BASE_GOAL + ' Cheese Base', done: (s) => s.totals.baseProduced >= BASE_GOAL, prog: (s) => [s.totals.baseProduced, BASE_GOAL] },
    { id: 'cheesery', text: 'Build the Cheesery', done: (s) => s.built.cheesery },
    { id: 'recipe', text: 'Discover a recipe', done: (s) => s.totals.recipes >= 1 },
    { id: 'shop', text: 'Open your Cheese Shop', done: (s) => s.built.shop },
    { id: 'sale', text: 'Sell a cheese', done: (s) => s.totals.lotsSold >= 1 },
    { id: 'node', text: 'Buy an upgrade in any skill tree', done: (s) => s.totals.nodesBought >= 1 },
    { id: 'house', text: 'Build the Mouse House', done: (s) => s.built.house },
    { id: 'mouse', text: 'Recruit your first mouse', done: (s) => s.mice.length >= 1 },
    { id: 'level5', text: 'Reach level 5 in any skill', done: (s) => maxLevel(s) >= 5, prog: (s) => [maxLevel(s), 5] },
    { id: 'allAuto', text: 'Put a mouse on all five stages', done: (s) => AUTO.every((k) => q.isAutomated(s, k)), prog: (s) => [AUTO.filter((k) => q.isAutomated(s, k)).length, 5] },
    { id: 'promote', text: 'Promote a mouse', done: (s) => s.mice.some((m) => m.rank >= 1) },
    { id: 'depth3', text: 'Dig a rock down to depth 3', done: (s) => maxDepth(s) >= 3, prog: (s) => [maxDepth(s), 3] },
    { id: 'zone2', text: 'Open a second rock', done: (s) => s.totals.zonesUnlocked >= 2, prog: (s) => [Math.min(s.coins, B.zones[1].unlockCost), B.zones[1].unlockCost] },
    { id: 'recipes8', text: 'Discover 8 recipes', done: (s) => s.totals.recipes >= 8, prog: (s) => [s.totals.recipes, 8] },
    { id: 'level25', text: 'Reach level 25 in any skill', done: (s) => maxLevel(s) >= 25, prog: (s) => [maxLevel(s), 25] },
    { id: 'zone3', text: 'Open a third rock', done: (s) => s.totals.zonesUnlocked >= 3, prog: (s) => [Math.min(s.coins, B.zones[2].unlockCost), B.zones[2].unlockCost] },
    { id: 'zone4', text: 'Open a fourth rock', done: (s) => s.totals.zonesUnlocked >= 4, prog: (s) => [Math.min(s.coins, B.zones[3].unlockCost), B.zones[3].unlockCost] },
    { id: 'zone5', text: 'Open a fifth rock', done: (s) => s.totals.zonesUnlocked >= 5, prog: (s) => [Math.min(s.coins, B.zones[4].unlockCost), B.zones[4].unlockCost] },
    { id: 'zone6', text: 'Open the last rock', done: (s) => s.totals.zonesUnlocked >= 6, prog: (s) => [Math.min(s.coins, B.zones[5].unlockCost), B.zones[5].unlockCost] },
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
    // Un paso de simulación. Cada línea (zona) hace minería, taladro, refinado y
    // cocinado; todas a la vez. Después, la tienda, que es común.
    step(s, dt) {
      s.clock += dt;
      CM.mice.beginStep(s);
      try {
        this.run(s, dt);
      } finally {
        CM.mice.endStep();
      }
    },
    run(s, dt) {
      // Cada 2 s: los ratones sin puesto ocupan los libres y los gerentes compran.
      if (Math.floor(s.clock / 2000) !== Math.floor((s.clock - dt) / 2000)) {
        CM.mice.fillEmpty(s);
        CM.mice.scan(s);
        for (const m of s.mice) if (CM.mice.pending(m)) CM.mice.choice(s, m);
        CM.mice.managersTick(s);
      }
      for (const def of B.zones) {
        const z = s.zones[def.id];
        if (!z.unlocked) continue;
        runMiner(s, def.id, dt);
        runJob(dt, () => z.drillJob, q.auto(s, 'drilling', def.id), () => CM.drilling.start(s, def.id, 'worker'), () => CM.drilling.complete(s, def.id));
        runJob(dt, () => z.refJob, q.auto(s, 'refining', def.id), () => CM.refining.start(s, def.id, 'worker'), () => CM.refining.complete(s, def.id));
        runJob(dt, () => z.cookJob, q.auto(s, 'cheesemaking', def.id), () => CM.cheesery.start(s, def.id), () => CM.cheesery.complete(s, def.id));
      }
      CM.cheesery.labTick(s, dt);
      CM.mice.careTick(s, dt);
      runJob(dt, () => s.jobs.shop, q.auto(s, 'trading', 'all'), () => CM.shop.start(s, 'worker'), () => CM.shop.complete(s));
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
      if (!goal) return { text: 'All goals complete. Keep growing your empire!', cur: 1, max: 1, done: true, reward: 0 };
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
      const cap = q.offlineCapMs(s);
      const simulated = Math.min(away, cap);
      const before = Object.assign({}, s.totals);
      const coins = s.coins;
      const levels = {};
      CM.skills.list.forEach((k) => (levels[k] = q.level(s, k)));
      const mice = s.mice.map((m) => ({ m, level: CM.mice.level(m), had: m.learned.slice(), specs: Object.assign({}, m.spec), grades: CM.mice.CHAIN.map((k) => CM.mice.gradeOf(m, k)) }));
      const careBefore = s.care ? Object.assign({}, s.care) : null;
      const wasMuted = CM.muted;
      CM.muted = true;
      CM.away = true; // los rasgos Nocturno y Casero solo cuentan aquí
      this.advance(s, simulated, B.offline.stepMs);
      CM.away = false;
      CM.muted = wasMuted;
      s.metrics.offlineMs += simulated;
      s.metrics.offlineReturns += 1;
      const delta = {};
      for (const k of Object.keys(before)) delta[k] = s.totals[k] - before[k];
      const levelUps = CM.skills.list.filter((k) => q.level(s, k) > levels[k]).map((k) => ({ skill: k, from: levels[k], to: q.level(s, k) }));
      CM.emit(s, 'offlineApplied', { simulatedMs: simulated });
      // Qué les ha pasado a los ratones mientras tanto.
      const mouseNews = [];
      for (const b of mice) {
        const lv = CM.mice.level(b.m);
        const spec = CM.mice.CHAIN.filter((k, i) => CM.mice.gradeOf(b.m, k) > b.grades[i]).map((k) => ({ skill: k, trait: b.m.spec[k], grade: CM.mice.gradeOf(b.m, k) }));
        // Rasgos y especialidades que ha desarrollado por su cuenta mientras tanto.
        const grew = b.m.learned.filter((t) => b.had.indexOf(t) < 0).concat(Object.keys(b.m.spec).filter((k) => !b.specs[k]).map((k) => b.m.spec[k]));
        if (lv > b.level || spec.length || grew.length) mouseNews.push({ id: b.m.id, name: b.m.name, from: b.level, to: lv, spec, grew });
      }
      return { awayMs: away, simulatedMs: simulated, capped: away > cap, capMs: cap, delta, coins: s.coins - coins, levelUps, mouseNews, careDone: careBefore && !s.care ? careBefore : null, strainWaiting: s.lab.found ? { recipeId: s.lab.found.recipeId, strain: s.lab.found.strain } : null, automated: AUTO.some((k) => q.isAutomated(s, k)) };
    },
  };
})();
