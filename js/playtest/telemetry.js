// Telemetría LOCAL de playtest. Nada sale del navegador: se guarda con la
// partida y solo se comparte si el tester exporta el JSON a mano.
(function () {
  const LOG_MAX = 400;
  const samples = []; // muestras recientes para tasas por minuto (no se guardan)

  const PRODUCED = { drillDone: 'raw', refineDone: 'base', lotDone: 'lots' };

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
    // Llamar periódicamente; guarda una muestra de totales cada 5 s de simulación.
    sample(s) {
      const last = samples[samples.length - 1];
      if (last && s.clock < last.t) samples.length = 0;
      if (last && s.clock - last.t < 5000) return;
      samples.push({ t: s.clock, raw: s.totals.rawProduced, base: s.totals.baseProduced, lots: s.totals.lotsProduced, coins: s.totals.coinsEarned, rawUsed: s.totals.rawConsumed, baseUsed: s.totals.baseConsumed });
      while (samples.length > 40) samples.shift();
    },
    // Producción y consumo por minuto en los últimos ~60 s de simulación.
    rates(s) {
      const now = { t: s.clock, raw: s.totals.rawProduced, base: s.totals.baseProduced, lots: s.totals.lotsProduced, coins: s.totals.coinsEarned, rawUsed: s.totals.rawConsumed, baseUsed: s.totals.baseConsumed };
      const from = samples.find((x) => s.clock - x.t <= 60000) || now;
      const span = Math.max(1, now.t - from.t) / 60000;
      const out = {};
      for (const k of Object.keys(now)) if (k !== 't') out[k] = span > 0.05 ? (now[k] - from[k]) / span : 0;
      return out;
    },
    resetSamples: () => (samples.length = 0),
    PRODUCED,
  };
})();
