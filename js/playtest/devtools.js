// Herramientas de playtest. Cualquier uso marca la partida con devUsed = true,
// y ese dato sale en la exportación para no confundirla con una sesión limpia.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  function fill(s, kind, amount) {
    for (const z of q.openZones(s)) s.inv[kind][z.base] += amount;
  }

  CM.dev = {
    speed: 1,
    paused: false,
    addCoins(s, n) {
      s.devUsed = true;
      s.coins += n;
    },
    addRaw(s, n) {
      s.devUsed = true;
      fill(s, 'raw', n);
    },
    addBase(s, n) {
      s.devUsed = true;
      fill(s, 'base', n);
    },
    // Sube todas las habilidades N niveles.
    addLevels(s, n) {
      s.devUsed = true;
      for (const k of CM.skills.list) s.skills[k].xp = q.xpForLevel(Math.min(B.xp.maxLevel, q.level(s, k) + n)) + 1;
    },
    unlockBuildings(s) {
      s.devUsed = true;
      Object.keys(s.built).forEach((id) => (s.built[id] = true));
    },
    unlockZones(s) {
      s.devUsed = true;
      B.zones.forEach((d) => {
        if (!s.zones[d.id].unlocked) {
          s.zones[d.id].unlocked = true;
          s.totals.zonesUnlocked += 1;
        }
      });
    },
    // Pone un ratón en cada puesto libre, sin coste.
    hireAll(s) {
      s.devUsed = true;
      s.built.house = true;
      for (let guard = 0; guard < 40 && CM.mice.freePost(s); guard++) {
        const name = B.mice.names[s.mice.length % B.mice.names.length];
        const m = { id: 'm' + s.nextId++, name, traits: ['fast', 'dreamer'], fav: '', look: (s.nextId * 7919 + s.mice.length * 104729) % 1048576, xp: 0, rank: 0, post: '', rest: false };
        s.mice.push(m);
        CM.mice.autoPlace(s, m);
      }
    },
    // Sube un rango todos los nudos de la rama POWER (para ver los aspectos de los edificios).
    powerUp(s, ranks) {
      s.devUsed = true;
      for (const skill of Object.keys(B.trees)) {
        for (const node of B.trees[skill]) {
          if (node.branch === 'power') s.nodes[skill + '.' + node.id] = Math.min(node.max, (s.nodes[skill + '.' + node.id] || 0) + ranks);
        }
      }
    },
    revealVeins(s) {
      s.devUsed = true;
      for (const d of q.openZones(s)) {
        const z = s.zones[d.id];
        if (z.veinRevealed) continue;
        z.discover = q.veinHits(s, d.id);
        z.veinRevealed = true;
        z.veinRemaining = q.veinCapacity(s, d.id);
        s.totals.veinsFound += 1;
      }
    },
    forceNoRaw(s) {
      s.devUsed = true;
      Object.keys(s.inv.raw).forEach((k) => (s.inv.raw[k] = 0));
    },
    // Partida con la cadena montada y algo de dinero, para probar árboles y recetas.
    scenario(now) {
      const s = CM.createState(now);
      s.devUsed = true;
      this.unlockBuildings(s);
      this.revealVeins(s);
      s.totals.rawProduced = 10;
      s.totals.baseProduced = 10;
      s.inv.base.cheddar = 12;
      s.coins = 500;
      return s;
    },
    // Texto con tasas, capacidades, bloqueos y totales.
    report(s) {
      const r = CM.telemetry.rates(s);
      const f = (n) => (Math.round(n * 10) / 10).toFixed(1);
      const mins = (ms) => f(ms / 60000) + 'm';
      const lines = [
        'played ' + mins(s.clock) + '  offline ' + mins(s.metrics.offlineMs) + '  speed x' + CM.dev.speed + (CM.dev.paused ? ' PAUSED' : ''),
        'levels: ' + CM.skills.list.map((k) => k.slice(0, 5) + ' ' + q.level(s, k)).join('  '),
        'per min (last 60s):',
        '  coins +' + f(r.coins),
        ...q.openZones(s).map((d) => '  ' + d.id + ': raw +' + f(r.lanes[d.id].raw) + '/-' + f(r.lanes[d.id].rawUsed) + '  base +' + f(r.lanes[d.id].base) + '/-' + f(r.lanes[d.id].baseUsed) + '  cheese +' + f(r.lanes[d.id].lots)),
        'stock: raw ' + JSON.stringify(s.inv.raw) + '  base ' + JSON.stringify(s.inv.base) + '  cheese ' + q.lotsTotal(s),
        ...q.openZones(s).map((d) => 'lane ' + d.id + ' d' + s.zones[d.id].depth + ': mine=' + CM.mining.status(s, d.id) + ' drill=' + CM.drilling.status(s, d.id) + ' refine=' + CM.refining.status(s, d.id) + ' cook=' + CM.cheesery.status(s, d.id)),
        'shop=' + CM.shop.status(s),
        'mice: ' + (s.mice.map((m) => m.name + ' L' + CM.mice.level(m) + ' r' + m.rank + ' @' + (m.post || 'house')).join(', ') || '-'),
        'taps: ' + JSON.stringify(s.metrics.taps),
        'goals (min): ' + (Object.entries(s.goalsDone).map(([k, v]) => k + ' ' + f(v / 60000)).join(', ') || '-'),
        'totals: ' + JSON.stringify(s.totals),
      ];
      const bad = CM.validate(s);
      lines.push('invariants: ' + (bad.length ? 'BROKEN -> ' + bad.join('; ') : 'ok'));
      if (s.metrics.errors.length) lines.push('errors: ' + s.metrics.errors.map((e) => e.message).join(' | '));
      return lines.join('\n');
    },
  };
})();
