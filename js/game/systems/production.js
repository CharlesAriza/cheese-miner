// MINING, DRILLING y REFINING.
// Regla fija: picar solo revela vetas; nunca da Raw Cheese, Cheese Base ni monedas.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  // ---------- MINING ----------
  CM.mining = {
    status(s) {
      const phase = q.depPhase(s, s.activeDeposit);
      if (phase === 'depleted') return 'depleted';
      if (phase === 'vein_revealed') return 'vein-exposed';
      return 'ready';
    },
    // source: 'manual' (con combo y críticos) o 'worker'
    hit(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      const d = q.dep(s);
      const vein = q.veinDef(s, s.activeDeposit);
      let crit = false;
      if (source === 'manual') {
        s.combo = s.clock - s.lastHitAt <= B.mining.comboWindowMs ? s.combo + 1 : 1;
        s.lastHitAt = s.clock;
        crit = s.combo % B.mining.critEvery === 0;
        s.metrics.taps.mine += 1;
      }
      const amount = q.pickPower(s) * (crit ? B.mining.critMultiplier : 1);
      d.discover = Math.min(vein.hits, d.discover + amount);
      s.totals.hits += 1;
      CM.emit(s, 'hit', { source, crit, combo: source === 'manual' ? s.combo : 0 });
      if (d.discover >= vein.hits) {
        d.veinRevealed = true;
        d.veinRemaining = vein.capacity;
        s.combo = 0;
        s.totals.veinsFound += 1;
        CM.emit(s, 'reveal', { deposit: s.activeDeposit, capacity: vein.capacity });
      }
      return CM.ok({ crit });
    },
  };

  // ---------- DRILLING ----------
  CM.drilling = {
    status(s) {
      if (!s.built.drill) return 'not-built';
      if (s.jobs.drill) return 'running';
      const phase = q.depPhase(s, s.activeDeposit);
      if (phase === 'depleted') return 'depleted';
      if (phase !== 'vein_revealed' || q.dep(s).veinRemaining <= 0) return 'no-vein';
      if (q.rawSpace(s) <= 0) return 'storage-full';
      return 'ready';
    },
    // El queso se reserva de la veta al empezar y se entrega una sola vez al completar.
    start(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      const d = q.dep(s);
      const amount = Math.min(q.drillYield(s), d.veinRemaining, q.rawSpace(s));
      const total = q.drillDuration(s);
      d.veinRemaining -= amount;
      s.jobs.drill = { remaining: total, total, amount, deposit: s.activeDeposit, source };
      CM.emit(s, 'drillStart', { source });
      return CM.ok();
    },
    // Tap manual: arranca un ciclo o acelera el que está en marcha (sea manual o de un Driller).
    tap(s) {
      s.metrics.taps.drill += 1;
      const job = s.jobs.drill;
      if (!job) return this.start(s, 'manual');
      job.remaining = Math.max(0, job.remaining - B.drill.boostMs);
      CM.emit(s, 'drillBoost');
      return CM.ok({ boosted: true });
    },
    complete(s) {
      const job = s.jobs.drill;
      const def = q.depDef(job.deposit);
      const d = s.deposits[job.deposit];
      s.jobs.drill = null;
      s.inv.raw[def.base] += job.amount;
      s.totals.rawProduced += job.amount;
      CM.emit(s, 'drillDone', { amount: job.amount, base: def.base });
      if (d.veinRevealed && d.veinRemaining <= 0) {
        d.veinRevealed = false;
        d.veinIndex += 1;
        d.discover = 0;
        CM.emit(s, 'veinDepleted', { deposit: job.deposit });
        if (!q.veinDef(s, job.deposit)) {
          s.totals.depositsDepleted += 1;
          CM.emit(s, 'depositDepleted', { deposit: job.deposit });
        }
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
    status(s) {
      if (!s.built.refinery) return 'not-built';
      if (s.jobs.refinery) return 'running';
      if (!this.pickBase(s)) return 'no-raw';
      if (q.baseSpace(s) <= 0) return 'storage-full';
      return 'ready';
    },
    // El Raw Cheese se consume al empezar; la Cheese Base se entrega una sola vez al completar.
    start(s, source) {
      const st = this.status(s);
      if (st !== 'ready') return CM.fail(st);
      const base = this.pickBase(s);
      const ratio = B.refinery.rawPerBase;
      const amount = Math.min(q.refineBatch(s), Math.floor(s.inv.raw[base] / ratio), q.baseSpace(s));
      const total = q.refineDuration(s);
      s.inv.raw[base] -= amount * ratio;
      s.totals.rawConsumed += amount * ratio;
      s.jobs.refinery = { remaining: total, total, amount, base, source };
      CM.emit(s, 'refineStart', { source });
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
      CM.emit(s, 'refineDone', { amount: job.amount, base: job.base });
    },
  };
})();
