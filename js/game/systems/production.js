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
    // mult: rendimiento del ratón que pica (1 si pica el jugador).
    hit(s, zoneId, source, mult) {
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
      const amount = Math.min(need - z.discover, q.pickPower(s) * (crit ? q.critMult(s) : 1) * (mult || 1));
      z.discover += amount;
      s.totals.hits += 1;
      CM.skills.addXp(s, 'mining', B.xp.perHit * q.zoneXp(s, zoneId));
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
      // Si lo arranca un ratón, cuentan su velocidad y su rendimiento.
      const w = source === 'worker' ? CM.mice.work(s, 'drilling', zoneId) : null;
      const wanted = q.drillYield(s, zoneId) * (w ? w.yield : 1) + z.carry;
      const amount = Math.max(1, Math.min(Math.floor(wanted), z.veinRemaining));
      z.carry = Math.max(0, Math.min(1, wanted - Math.floor(wanted)));
      const total = Math.max(200, Math.round(q.drillDuration(s) / (w ? w.speed : 1)));
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
      z.stats.raw += job.amount;
      const xm = job.source === 'worker' ? CM.mice.reward(s, 'drilling', zoneId) : 1;
      CM.skills.addXp(s, 'drilling', B.xp.perDrill * q.zoneXp(s, zoneId) * xm);
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
  // Cada línea refina su propio queso, a la vez que las demás.
  CM.refining = {
    // Plan del siguiente ciclo de una línea: cuántas tandas entran y cuánta base sale.
    plan(s, zoneId, mouseYield) {
      const z = s.zones[zoneId];
      const base = q.zoneDef(zoneId).base;
      const batches = Math.min(q.refineBatch(s), Math.floor(s.inv.raw[base] / B.refinery.rawPerBase));
      if (batches < 1) return null;
      const wanted = batches * q.refineMult(s) * (mouseYield || 1) + z.refCarry;
      return { base, batches, amount: Math.floor(wanted), carry: wanted - Math.floor(wanted) };
    },
    status(s, zoneId) {
      const z = s.zones[zoneId];
      if (!s.built.refinery) return 'not-built';
      if (!z || !z.unlocked) return 'locked';
      if (z.refJob) return 'running';
      return this.plan(s, zoneId) ? 'ready' : 'no-raw';
    },
    // El Raw Cheese se consume al empezar; la Cheese Base se entrega una sola vez al completar.
    start(s, zoneId, source) {
      const st = this.status(s, zoneId);
      if (st !== 'ready') return CM.fail(st);
      const z = s.zones[zoneId];
      const w = source === 'worker' ? CM.mice.work(s, 'refining', zoneId) : null;
      const plan = this.plan(s, zoneId, w ? w.yield : 1);
      const used = plan.batches * B.refinery.rawPerBase;
      const total = Math.max(200, Math.round(q.refineDuration(s) / (w ? w.speed : 1)));
      s.inv.raw[plan.base] -= used;
      s.totals.rawConsumed += used;
      z.stats.rawUsed += used;
      z.refCarry = plan.carry;
      z.refJob = { remaining: total, total, amount: plan.amount, used, source };
      CM.emit(s, 'refineStart', { zone: zoneId, source, used, base: plan.base });
      return CM.ok();
    },
    tap(s, zoneId) {
      s.metrics.taps.refine += 1;
      const z = s.zones[zoneId];
      if (!z || !z.refJob) return this.start(s, zoneId, 'manual');
      z.refJob.remaining = Math.max(0, z.refJob.remaining - B.refinery.boostMs);
      CM.emit(s, 'refineBoost', { zone: zoneId });
      return CM.ok({ boosted: true });
    },
    complete(s, zoneId) {
      const z = s.zones[zoneId];
      const job = z.refJob;
      const base = q.zoneDef(zoneId).base;
      z.refJob = null;
      s.inv.base[base] += job.amount;
      s.totals.baseProduced += job.amount;
      z.stats.base += job.amount;
      const xm = job.source === 'worker' ? CM.mice.reward(s, 'refining', zoneId) : 1;
      CM.skills.addXp(s, 'refining', B.xp.perRefine * q.baseXp(base) * xm);
      CM.emit(s, 'refineDone', { zone: zoneId, amount: job.amount, base, source: job.source });
    },
  };
})();
