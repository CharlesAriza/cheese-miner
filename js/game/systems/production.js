// MINING, DRILLING y REFINING.
// Regla fija: picar solo revela vetas; nunca da Raw Cheese, Cheese Base ni monedas.
// Cada zona abierta tiene su roca y su taladro, y todas trabajan a la vez.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  // ---------- MINING ----------
  CM.mining = {
    status(s, zoneId) {
      const z = s.zones[zoneId];
      if (!z || !z.unlocked) return 'locked';
      return z.veinRevealed ? 'vein-exposed' : 'ready';
    },
    // source: 'manual' (con combo y críticos) o 'worker'
    hit(s, zoneId, source) {
      const st = this.status(s, zoneId);
      if (st !== 'ready') return CM.fail(st);
      const z = s.zones[zoneId];
      const need = q.veinHits(s, zoneId);
      let crit = false;
      if (source === 'manual') {
        s.combo = s.clock - s.lastHitAt <= B.mining.comboWindowMs ? s.combo + 1 : 1;
        s.lastHitAt = s.clock;
        crit = s.combo % B.mining.critEvery === 0;
        s.metrics.taps.mine += 1;
      }
      const amount = Math.min(need - z.discover, q.pickPower(s) * (crit ? q.critMult(s) : 1));
      z.discover += amount;
      s.totals.hits += 1;
      CM.skills.addXp(s, 'mining', amount * B.xp.perSearch);
      CM.emit(s, 'hit', { zone: zoneId, source, crit, amount, combo: source === 'manual' ? s.combo : 0 });
      if (z.discover >= need - 1e-6) {
        z.discover = need;
        z.veinRevealed = true;
        z.veinRemaining = q.veinCapacity(s, zoneId);
        s.combo = 0;
        s.totals.veinsFound += 1;
        CM.emit(s, 'reveal', { zone: zoneId, capacity: z.veinRemaining });
      }
      return CM.ok({ crit });
    },
  };

  // ---------- DRILLING ----------
  CM.drilling = {
    status(s, zoneId) {
      const z = s.zones[zoneId];
      if (!s.built.drill) return 'not-built';
      if (!z || !z.unlocked) return 'locked';
      if (z.drillJob) return 'running';
      if (!z.veinRevealed || z.veinRemaining <= 0) return 'no-vein';
      return 'ready';
    },
    // El queso se reserva de la veta al empezar y se entrega una sola vez al completar.
    start(s, zoneId, source) {
      const st = this.status(s, zoneId);
      if (st !== 'ready') return CM.fail(st);
      const z = s.zones[zoneId];
      // El rendimiento puede tener decimales: lo que sobra se guarda para el siguiente ciclo.
      const wanted = q.drillYield(s, zoneId) + z.carry;
      const amount = Math.max(1, Math.min(Math.floor(wanted), z.veinRemaining));
      z.carry = Math.max(0, Math.min(1, wanted - Math.floor(wanted)));
      const total = q.drillDuration(s);
      z.veinRemaining -= amount;
      z.drillJob = { remaining: total, total, amount, source };
      CM.emit(s, 'drillStart', { zone: zoneId, source });
      return CM.ok();
    },
    // Tap manual: arranca un ciclo o acelera el que está en marcha.
    tap(s, zoneId) {
      s.metrics.taps.drill += 1;
      const z = s.zones[zoneId];
      if (!z || !z.drillJob) return this.start(s, zoneId, 'manual');
      z.drillJob.remaining = Math.max(0, z.drillJob.remaining - B.drill.boostMs);
      CM.emit(s, 'drillBoost', { zone: zoneId });
      return CM.ok({ boosted: true });
    },
    complete(s, zoneId) {
      const z = s.zones[zoneId];
      const job = z.drillJob;
      const base = q.zoneDef(zoneId).base;
      z.drillJob = null;
      s.inv.raw[base] += job.amount;
      s.totals.rawProduced += job.amount;
      CM.skills.addXp(s, 'drilling', job.amount * B.xp.perRaw);
      CM.emit(s, 'drillDone', { zone: zoneId, amount: job.amount, base, source: job.source });
      // Veta vacía: la roca no se agota, baja un nivel y hay que volver a buscar.
      if (z.veinRevealed && z.veinRemaining <= 0) {
        z.veinRevealed = false;
        z.veinRemaining = 0;
        z.discover = 0;
        z.depth += 1;
        CM.emit(s, 'deeper', { zone: zoneId, depth: z.depth });
      }
    },
  };

  // ---------- REFINING ----------
  CM.refining = {
    // Refina la base de la que más Raw Cheese haya.
    pickBase(s) {
      let best = null;
      for (const k of Object.keys(s.inv.raw)) {
        if (s.inv.raw[k] >= B.refinery.rawPerBase && (!best || s.inv.raw[k] > s.inv.raw[best])) best = k;
      }
      return best;
    },
    // Plan del siguiente ciclo: cuántas tandas entran y cuánta base sale.
    plan(s) {
      const base = this.pickBase(s);
      if (!base) return null;
      const batches = Math.min(q.refineBatch(s), Math.floor(s.inv.raw[base] / B.refinery.rawPerBase));
      const wanted = batches * q.refineMult(s) + s.refCarry;
      return { base, batches, amount: Math.floor(wanted), carry: wanted - Math.floor(wanted) };
    },
    status(s) {
      if (!s.built.refinery) return 'not-built';
      if (s.jobs.refinery) return 'running';
      return this.plan(s) ? 'ready' : 'no-raw';
    },
    // El Raw Cheese se consume al empezar; la Cheese Base se entrega una sola vez al completar.
    start(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      const plan = this.plan(s);
      const used = plan.batches * B.refinery.rawPerBase;
      const total = q.refineDuration(s);
      s.inv.raw[plan.base] -= used;
      s.totals.rawConsumed += used;
      s.refCarry = plan.carry;
      s.jobs.refinery = { remaining: total, total, amount: plan.amount, base: plan.base, used, source };
      CM.emit(s, 'refineStart', { source, used, base: plan.base });
      return CM.ok();
    },
    tap(s) {
      s.metrics.taps.refine += 1;
      const job = s.jobs.refinery;
      if (!job) return this.start(s, 'manual');
      job.remaining = Math.max(0, job.remaining - B.refinery.boostMs);
      CM.emit(s, 'refineBoost');
      return CM.ok({ boosted: true });
    },
    complete(s) {
      const job = s.jobs.refinery;
      s.jobs.refinery = null;
      s.inv.base[job.base] += job.amount;
      s.totals.baseProduced += job.amount;
      CM.skills.addXp(s, 'refining', job.amount * B.xp.perBase);
      CM.emit(s, 'refineDone', { amount: job.amount, base: job.base, source: job.source });
    },
  };
})();
