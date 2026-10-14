// Telemetría LOCAL de playtest. Nada sale del navegador: se guarda con la
// partida y solo se comparte si el tester exporta el JSON a mano.
(function () {
  const LOG_MAX = 400;
  const samples = []; // muestras recientes para tasas por minuto (no se guardan)

  function snapshot(s) {
    const lanes = {};
    for (const id of Object.keys(s.zones)) lanes[id] = Object.assign({}, s.zones[id].stats);
    return { t: s.clock, coins: s.totals.coinsEarned, sold: s.totals.lotsSold, whole: s.totals.wholesaleLots || 0, lanes };
  }

  CM.telemetry = {
    create() {
      return {
        taps: { mine: 0, drill: 0, refine: 0, cheesery: 0, sell: 0 },
        purchases: [], // { t, what, cost }
        offlineMs: 0,
        offlineReturns: 0,
        sessions: 0,
        errors: [],
        log: [], // últimos eventos relevantes
      };
    },
    onEvent(s, ev) {
      const m = s.metrics;
      if (ev.type === 'purchase') {
        m.purchases.push({ t: s.clock, what: ev.what, cost: ev.cost });
        if (m.purchases.length > 300) m.purchases.shift();
      }
      const noisy = ev.type === 'hit' || ev.type.endsWith('Boost') || ev.type.endsWith('Start') || ev.type.endsWith('Done') || ev.type === 'sale';
      if (!noisy) {
        m.log.push(Object.assign({ t: s.clock }, ev));
        if (m.log.length > LOG_MAX) m.log.splice(0, m.log.length - LOG_MAX);
      }
    },
    error(s, message) {
      s.metrics.errors.push({ t: s.clock, message: String(message).slice(0, 200) });
      if (s.metrics.errors.length > 50) s.metrics.errors.shift();
    },
    // Llamar periódicamente; guarda una muestra cada 5 s de simulación.
    sample(s) {
      const last = samples[samples.length - 1];
      if (last && s.clock < last.t) samples.length = 0;
      if (last && s.clock - last.t < 5000) return;
      samples.push(snapshot(s));
      while (samples.length > 40) samples.shift();
    },
    // Ritmos por minuto en los últimos ~60 s: monedas, y lo producido y gastado en cada línea.
    rates(s) {
      const now = snapshot(s);
      const from = samples.find((x) => s.clock - x.t <= 60000) || now;
      const span = Math.max(1, now.t - from.t) / 60000;
      const per = (a, b) => (span > 0.05 ? (a - b) / span : 0);
      const out = { coins: per(now.coins, from.coins), sold: per(now.sold, from.sold || now.sold), whole: per(now.whole, from.whole || 0), lanes: {} };
      for (const id of Object.keys(now.lanes)) {
        const a = now.lanes[id];
        const b = from.lanes[id] || a;
        out.lanes[id] = { raw: per(a.raw, b.raw), rawUsed: per(a.rawUsed, b.rawUsed), base: per(a.base, b.base), baseUsed: per(a.baseUsed, b.baseUsed), lots: per(a.lots, b.lots) };
      }
      return out;
    },
    resetSamples: () => (samples.length = 0),
  };
})();
