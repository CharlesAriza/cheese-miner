// Herramientas de playtest. Cualquier uso marca la partida con devUsed = true,
// y ese dato sale en la exportación para no confundirla con una sesión limpia.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  function mark(s) {
    s.devUsed = true;
  }

  function fillTo(s, kind, target) {
    const base = q.depDef(s.activeDeposit).base;
    const total = kind === 'raw' ? q.rawTotal(s) : q.baseTotal(s);
    const reserved = kind === 'raw' ? (s.jobs.drill ? s.jobs.drill.amount : 0) : s.jobs.refinery ? s.jobs.refinery.amount : 0;
    const room = q.caps(s)[kind] - total - reserved;
    s.inv[kind][base] += Math.max(0, Math.min(target, room));
  }

  const SCENARIOS = {
    // Cadena básica lista, sin monedas: para probar Cheesery y Market.
    chain(s) {
      revealVein(s);
      ['drill', 'refinery', 'cheesery'].forEach((id) => (s.built[id] = true));
      s.totals.veinsFound = Math.max(1, s.totals.veinsFound);
      s.totals.rawProduced = 10;
      s.totals.baseProduced = 10;
      s.inv.base.cheddar = 10;
    },
    // Colonia montada con dinero: para probar trabajadores, mejoras y pedidos.
    colony(s) {
      SCENARIOS.chain(s);
      ['market', 'storage', 'house'].forEach((id) => (s.built[id] = true));
      s.totals.recipes = Math.max(1, s.totals.recipes);
      s.coins = 600;
      s.inv.base.cheddar = 20;
    },
  };

  function revealVein(s) {
    const d = q.dep(s);
    const vein = q.veinDef(s, s.activeDeposit);
    if (!vein || d.veinRevealed) return;
    d.discover = vein.hits;
    d.veinRevealed = true;
    d.veinRemaining = vein.capacity;
    s.totals.veinsFound += 1;
  }

  CM.dev = {
    speed: 1,
    paused: false,
    SCENARIOS,
    addCoins(s, n) {
      mark(s);
      s.coins += n;
    },
    addRaw(s, n) {
      mark(s);
      fillTo(s, 'raw', n);
    },
    addBase(s, n) {
      mark(s);
      fillTo(s, 'base', n);
    },
    unlockBuildings(s) {
      mark(s);
      Object.keys(s.built).forEach((id) => (s.built[id] = true));
    },
    unlockDeposits(s) {
      mark(s);
      B.deposits.filter((d) => d.inAlpha !== false).forEach((d) => {
        if (!s.deposits[d.id].unlocked) {
          s.deposits[d.id].unlocked = true;
          s.totals.depositsUnlocked += 1;
        }
      });
    },
    hireAll(s) {
      mark(s);
      s.built.house = true;
      s.levels.house = B.upgrades.house.maxLevel;
      for (const role of CM.workers.roles) if (s.workers[role] < 1 && q.workersTotal(s) < q.slots(s)) s.workers[role] = 1;
    },
    levelUp(s, id) {
      mark(s);
      s.levels[id] = Math.min(B.upgrades[id].maxLevel, s.levels[id] + 1);
    },
    revealVein(s) {
      mark(s);
      revealVein(s);
    },
    // Fuerzan situaciones de bloqueo para comprobar los mensajes.
    forceStorageFull(s) {
      mark(s);
      fillTo(s, 'raw', Infinity);
      fillTo(s, 'base', Infinity);
    },
    forceVeinDepleted(s) {
      mark(s);
      const d = q.dep(s);
      if (d.veinRevealed && !s.jobs.drill) {
        d.veinRevealed = false;
        d.veinRemaining = 0;
        d.veinIndex += 1;
        d.discover = 0;
        if (!q.veinDef(s, s.activeDeposit)) s.totals.depositsDepleted += 1;
      }
    },
    forceNoRaw(s) {
      mark(s);
      Object.keys(s.inv.raw).forEach((k) => (s.inv.raw[k] = 0));
    },
    scenario(name, now) {
      const s = CM.createState(now);
      mark(s);
      SCENARIOS[name](s);
      return s;
    },
    // Texto con tasas, capacidades, bloqueos y totales.
    report(s) {
      const caps = q.caps(s);
      const r = CM.telemetry.rates(s);
      const f = (n) => (Math.round(n * 10) / 10).toFixed(1);
      const mins = (ms) => f(ms / 60000) + 'm';
      const lines = [
        'played ' + mins(s.clock) + '  offline ' + mins(s.metrics.offlineMs) + '  speed x' + CM.dev.speed + (CM.dev.paused ? ' PAUSED' : ''),
        'per min (last 60s):',
        '  raw +' + f(r.raw) + ' / -' + f(r.rawUsed) + '   base +' + f(r.base) + ' / -' + f(r.baseUsed),
        '  lots +' + f(r.lots) + '   coins +' + f(r.coins),
        'storage: raw ' + q.rawTotal(s) + '/' + caps.raw + '  base ' + q.baseTotal(s) + '/' + caps.base + '  lots ' + q.lotsTotal(s) + '/' + caps.lots,
        'machines: drill=' + CM.drilling.status(s) + '  refinery=' + CM.refining.status(s) + '  cheesery=' + CM.cheesery.status(s),
        'workers: ' + CM.workers.roles.map((role) => role + '=' + CM.workers.status(s, role)).join('  '),
        'taps: ' + JSON.stringify(s.metrics.taps),
        'time per machine state (min):',
      ];
      for (const key of Object.keys(s.metrics.machineMs)) {
        const m = s.metrics.machineMs[key];
        lines.push('  ' + key + ': ' + (Object.keys(m).map((k) => k + ' ' + mins(m[k])).join(', ') || '-'));
      }
      lines.push('milestones (min): ' + (Object.entries(s.goalsDone).map(([k, v]) => k + ' ' + f(v / 60000)).join(', ') || '-'));
      lines.push('totals: ' + JSON.stringify(s.totals));
      const bad = CM.validate(s);
      lines.push('invariants: ' + (bad.length ? 'BROKEN -> ' + bad.join('; ') : 'ok'));
      if (s.metrics.errors.length) lines.push('errors: ' + s.metrics.errors.map((e) => e.message).join(' | '));
      return lines.join('\n');
    },
  };
})();
