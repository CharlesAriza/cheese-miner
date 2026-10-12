// Auditoría de ratones (herramienta de balance, no forma parte del juego).
// Uso: abrir tests.html?bot, cargar este archivo desde la consola y llamar a
// AUDIT.run([{ label, seeds: [..], mins, smart, trade }], 'etiqueta'). Los resultados quedan en localStorage ('aud|...').
window.AUDIT = (function () {
  const yieldNow = () => new Promise((ok) => { const c = new MessageChannel(); c.port1.onmessage = () => ok(); c.port2.postMessage(0); });
  const M = CM.BALANCE.mice;
  const T = M.traits;
  // Ajustes de prueba sobre los números del juego (por ejemplo, cuánto cuenta la cantidad en la tienda).
  function setup(kind, trade) {
    if (trade !== undefined) M.tradeYield = trade;
    CM.mice.resetCache();
  }
  function stat(st) {
    const K = CM.mice;
    const rows = st.mice.filter((m) => m.post && m.post.indexOf('research') < 0).map((m) => {
      const [sk, z] = m.post.split(':');
      const sp = K.speed(m, sk, st, z), y = K.yieldMult(m, sk, st, z), d = K.doubleChance(m, sk, st, z);
      const leg = K.traitsOf(m).filter((t) => T[t.id].kind === 'legend').length;
      return { x: sp * y * (1 + d), y, lv: K.level(m), rar: m.rarity || 0, leg, post: m.post };
    });
    const xs = rows.map((r) => r.x).sort((a, b) => a - b);
    const at = (p) => xs[Math.min(xs.length - 1, Math.floor(xs.length * p))] || 0;
    const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
    const shop = rows.find((r) => r.post === 'trading:all');
    const hist = [0, 0, 0];
    st.mice.forEach((m) => (hist[Math.min(2, K.traitsOf(m).filter((t) => T[t.id].kind === 'legend').length)] += 1));
    const top3 = xs.slice(-3).reduce((a, b) => a + b, 0) / (xs.reduce((a, b) => a + b, 0) || 1);
    return { hist, top3, n: rows.length, med: at(0.5), p90: at(0.9), max: xs[xs.length - 1] || 0, over10: xs.filter((x) => x > 10).length, legTraits: rows.reduce((a, r) => a + r.leg, 0), lv: mean(rows.map((r) => r.lv)), shop: shop ? shop.x : 0, shopY: shop ? shop.y : 0, common: mean(rows.filter((r) => r.rar === 0).map((r) => r.x)), rare: mean(rows.filter((r) => r.rar === 1).map((r) => r.x)), legend: mean(rows.filter((r) => r.rar === 2).map((r) => r.x)) };
  }
  async function one(cfg) {
    let st = CM.createState(cfg.seed);
    const zones = {};
    const earned = {};
    const snaps = {};
    for (let m = 5; m <= cfg.mins; m += 5) {
      const opts = Object.assign({ state: st }, cfg.smart ? {} : { buyEveryMs: 20000, idleAfterAuto: true });
      st = CM_BOT.playBot(cfg.smart ? 400 : 1500, m * 60000, 'never', [], !!cfg.smart, false, opts).s;
      if (!zones[st.totals.zonesUnlocked]) zones[st.totals.zonesUnlocked] = m;
      if (m % 60 === 0) {
        earned[m] = st.totals.coinsEarned;
        snaps[m] = stat(st);
      }
      await yieldNow();
    }
    return { zones, earned, snaps };
  }
  async function run(jobs, tag) {
    for (const job of jobs) {
      setup(job.kind, job.trade);
      for (const seed of job.seeds) {
        const key = 'aud|' + job.label + '|' + seed;
        if (localStorage.getItem(key)) continue;
        localStorage.setItem('audnow|' + tag, job.label + ' ' + seed);
        const r = await one({ seed, mins: job.mins, smart: job.smart });
        localStorage.setItem(key, JSON.stringify(r));
      }
    }
    localStorage.setItem('audnow|' + tag, 'done');
  }
  return { run, setup, stat };
})();
