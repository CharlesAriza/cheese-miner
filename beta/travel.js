// CHEESE DRILLER BETA · El viaje entre espacios vecinos: HOUSE ← MAIN → LAB, con la cámara continua (modelo B, elegido por el PM). Un solo mundo: MAIN sube a la
// calle mientras avanzas y el suelo de las dos escenas coincide en todo momento; entre ellas, la tierra común (drawGround). El dedo mueve en horizontal, 1:1.
// La altura va atada a lo recorrido en horizontal, como un trinquete: sube al avanzar, se queda quieta si el dedo para o tiembla y nunca baja mientras lo llevas.
// Sin muelle ni tiempo propio: con el dedo quieto, nada se mueve, ni un fotograma después. Dedo y botón son el mismo movimiento, y un viaje en marcha se puede volver a coger.
//   go(to) · pullStart(to, x) · grab(x) · pullMove(x) · pullEnd() · step(now) · far() · view
window.BetaTravel = function (o) {
  const STRIP = o.strip, now = () => performance.now();
  const RISE = 0.55; // la altura está resuelta a algo más de medio camino: el final del viaje es solo horizontal
  const smooth = (k) => k * k * (3 - 2 * k);
  let t = null; // t: { from, to, dir, x, D, W, gLab, gy, gy0, gyT, adv, anim, pull, side, view }
  const dirOf = (from, to) => Math.sign(STRIP.indexOf(to) - STRIP.indexOf(from));
  const other = () => (t.from === 'main' ? t.to : t.from);
  function apply() {
    const X = Math.round(t.x), left = t.dir > 0, xF = left ? -X : X, xT = left ? t.D - X : X - t.D;
    o.setGround(t.gy);
    const gm = o.ground('main'), dyL = Math.round(gm - t.gLab), xM = t.from === 'main' ? xF : xT, xL = t.from === 'main' ? xT : xF;
    for (const el of o.layers('main')) el.style.transform = 'translate3d(' + xM + 'px,0,0)';
    for (const el of o.layers(other())) el.style.transform = 'translate3d(' + xL + 'px,' + dyL + 'px,0)';
    t.view = { xM, xL, dyL, mainLeft: STRIP.indexOf('main') < STRIP.indexOf(other()), ground: gm };
    // El panel cambia pasado el centro y no vuelve hasta retroceder claramente: quieto en el medio, no parpadea.
    const p = t.x / t.D, side = t.side === t.from ? (p > 0.6 ? t.to : t.from) : p < 0.4 ? t.from : t.to;
    if (side !== t.side) { t.side = side; if (o.onSide) o.onSide(side); }
  }
  function finish(commit) {
    const d = t; t = null;
    for (const id of [d.from, d.to]) for (const el of o.layers(id)) el.style.transform = '';
    o.end(commit, d.from, d.to);
  }
  function begin(to) {
    const from = o.current(), dir = dirOf(from, to); if (t || !dir || to === from || !o.begin(to)) return false;
    const W = o.box.clientWidth, oth = from === 'main' ? to : from, gLab = o.ground(oth), gMain = o.ground('main');
    // De ida, MAIN va hasta el suelo de la otra escena; de vuelta, empieza en él y vuelve a su altura.
    const gy0 = from === 'main' ? gMain : gLab, gyT = from === 'main' ? gLab : gMain;
    t = { from, to, dir, x: 0, D: o.span(from, to), W, gLab, gy: gy0, gy0, gyT, adv: 0, anim: null, pull: null, side: from, view: null };
    apply(); return true;
  }
  // De x0 con velocidad v0 a su destino, sin parón al soltar: una curva cúbica que arranca con esa velocidad y llega parada.
  function run(target, v0) { const dist = Math.abs(target - t.x), T = o.reduced && o.reduced() ? 1 : Math.max(240, Math.min(620, (2.1 * dist) / Math.max(0.6, Math.abs(v0) + 0.55))); t.anim = { x0: t.x, v0, to: target, t0: now(), T, gy: t.gy }; }
  // La altura que toca para lo recorrido; mientras se va hacia delante, nunca retrocede.
  function ratchet() { const a = smooth(Math.min(1, t.x / (t.D * RISE))); if (a > t.adv) t.adv = a; t.gy = t.gy0 + (t.gyT - t.gy0) * t.adv; }
  function track(x) { t.x = Math.max(0, Math.min(t.D, (t.pull.x0 - x) * t.dir)); t.pull.pts.push([now(), x]); while (t.pull.pts.length > 2 && now() - t.pull.pts[0][0] > 90) t.pull.pts.shift(); }
  return {
    get active() { return !!t; }, get p() { return t ? t.x / t.D : 0; }, get view() { return t && t.view; }, get held() { return !!(t && t.pull); }, get debug() { return t && { x: t.x, D: t.D, gy: t.gy, target: t.target, adv: t.adv, gy0: t.gy0, gyT: t.gyT }; },
    far() { if (!t) return null; const p = t.x / t.D, A = o.farOf(t.from), B = o.farOf(t.to); return { shift: A.shift + (B.shift - A.shift) * p, zoom: A.zoom + (B.zoom - A.zoom) * p, ground: t.view ? t.view.ground : t.gy }; },
    go(to) { if (t || !begin(to)) return false; run(t.D, 0); return true; },
    pullStart(to, x) { if (!begin(to)) return false; t.pull = { x0: x, pts: [[now(), x]] }; return true; },
    // Coger un viaje en marcha: sigue desde donde está, sin saltos.
    grab(x) { if (!t) return false; t.anim = null; t.pull = { x0: x + t.x * t.dir, pts: [[now(), x]] }; const span = t.gyT - t.gy0; t.adv = Math.abs(span) < 0.5 ? 1 : Math.max(0, Math.min(1, (t.gy - t.gy0) / span)); return true; },
    pullMove(x) { if (!t || !t.pull) return; track(x); ratchet(); apply(); },
    pullEnd() {
      if (!t || !t.pull) return; const P = t.pull.pts, a = P[0], b = P[P.length - 1], dt = Math.max(16, b[0] - a[0]), v = now() - b[0] > 90 ? 0 : ((a[1] - b[1]) * t.dir) / dt; t.pull = null;
      const go = v > 0.35 || (v > -0.35 && t.x > t.W * 0.25); run(go ? t.D : 0, Math.max(-3, Math.min(3, v)));
    },
    step() {
      if (!t || !t.anim) return;
      const A = t.anim, k = Math.min(1, (now() - A.t0) / A.T), d = A.to - A.x0, vT = A.v0 * A.T, k2 = k * k, k3 = k2 * k; t.x = A.x0 + vT * (k3 - 2 * k2 + k) + d * (3 * k2 - 2 * k3);
      // Hacia delante sigue el trinquete; de vuelta, la altura deshace lo subido en la misma proporción que lo recorrido.
      if (A.to > 0) ratchet(); else t.gy = t.gy0 + (A.gy - t.gy0) * (A.x0 > 0 ? Math.max(0, t.x) / A.x0 : 0);
      apply(); if (k >= 1) finish(A.to > 0);
    },
  };
};
