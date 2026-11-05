// CHEESE DRILLER BETA · Los bocadillos de los ratones: uno cada vez, leíble y dentro de la pantalla. No sabe de partida ni de cámara: la escena le dice dónde
// está la cabeza de quien habla, qué sitio tiene y qué no debe tapar, así sirve para cualquier escena futura.
//   head(who)   { x, y, visible } en px de pantalla, o null si ya no está
//   bounds()    { left, right, top, bottom } donde cabe un globo
//   obstacles() elementos que no debe tapar   ·   canStart() si puede empezar uno   ·   hush(cur) si el ambiental debe callarse
// Prioridades: 0 ambiente (charlas), 1 evento de la partida, 2 lo que acaba de hacer el jugador. Un globo nunca corta a otro antes de poder leerse.
window.BetaBubbles = function (o) {
  const { host, head, bounds, obstacles = () => [], canStart = () => true, hush = () => false, readMs, tail = '', gapMs = 45000 } = o;
  const STALE = [9000, 12000, 15000], MIN_READ = 1500, OFF_MAX = 2500, EDGE = 6;
  // Con la página oculta las animaciones no acaban: el globo se quita igual, para que ninguno se quede en la página.
  const fadeOut = (el) => { el.dataset.out = '1'; if (el.animate) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); setTimeout(() => el.remove(), 140); };
  const S = {
    cur: null, q: [], gapUntil: 0, okAt: 0, evAt: 0, pairTo: 0, pairPri: -1,
    // Lo ambiental y los eventos tienen cada uno su medida, para no llenar la pantalla; lo ambiental nunca le quita el turno a un evento.
    say(who, text, pri = 1) {
      const t = performance.now(), inPair = t <= S.pairTo && S.pairPri === pri;
      if (pri === 0) { if (t < S.okAt && !inPair) return false; if (!inPair) { S.okAt = t + gapMs; S.pairTo = t + 60; S.pairPri = 0; } }
      else if (pri === 1) { if (t < S.evAt && !inPair) return false; if (!inPair) { S.evAt = t + gapMs; S.okAt = Math.max(S.okAt, t + gapMs); S.pairTo = t + 60; S.pairPri = 1; } }
      else S.okAt = Math.max(S.okAt, t + gapMs / 4);
      if (pri > 0) S.q = S.q.filter((x) => x.pri > 0);
      if (S.q.length >= 3) { const low = S.q.reduce((a, x) => (x.pri < a.pri ? x : a)); if (low.pri > pri) return false; S.q.splice(S.q.indexOf(low), 1); }
      S.q.push({ who, text, pri, at: t });
      return true;
    },
    // Fuera de escena no queda nada: ni el globo ni lo que esperaba turno.
    clear() { if (S.cur) S.cur.el.remove(); S.cur = null; S.q = []; S.gapUntil = 0; },
    tick(now) {
      const end = () => { fadeOut(S.cur.el); S.cur = null; S.gapUntil = now + 380; };
      if (S.cur) {
        const c = S.cur, h = head(c.who), dt = Math.max(0, now - c.last); c.last = now;
        if (!h) end();
        else if (!h.visible) {
          // Fuera de la vista el reloj de lectura se para: si la cámara vuelve enseguida, sigue donde estaba.
          c.off += dt; c.until += dt; c.el.style.visibility = 'hidden'; if (c.off > OFF_MAX) end();
        } else {
          if (c.off) { c.off = 0; c.x = null; c.el.style.visibility = ''; }
          // Si espera algo más importante, este se acorta, pero siempre da tiempo a leerlo.
          if (S.q.some((x) => x.pri > c.pri)) c.until = Math.min(c.until, Math.max(c.born + MIN_READ, now));
          if (now > c.until || (c.pri === 0 && hush(c))) end();
        }
      }
      if (S.q.length) S.q = S.q.filter((x) => now - x.at <= STALE[x.pri]);
      if (!S.cur && S.q.length && now > S.gapUntil && canStart()) {
        const pick = S.q.reduce((a, x) => (x.pri > a.pri ? x : a)), h = head(pick.who);
        if (!h || (!h.visible && pick.pri === 0)) S.q.splice(S.q.indexOf(pick), 1);
        else if (h.visible) {
          S.q.splice(S.q.indexOf(pick), 1);
          const el = document.createElement('div'); el.className = 'ad-bub p1-bub'; el.innerHTML = `<span>${pick.text}</span>${tail}`; host.appendChild(el);
          if (el.animate) el.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 150, easing: 'steps(3)' });
          // Su ancho se fija al nacer: si no, al acercarlo a un borde el navegador partiría las líneas de otra forma y ya no cabría en lo medido.
          const w = el.offsetWidth; el.style.width = w + 'px';
          S.cur = { ...pick, el, w, h: el.offsetHeight, born: now, last: now, off: 0, until: now + readMs(pick.text), x: null, y: null, side: 0 };
        }
      }
      if (S.cur && !S.cur.off) place(S.cur);
    },
  };
  // Encima de la cabeza si cabe; si no, a un costado. Evita lo que no debe tapar y siempre queda entero dentro de `bounds`.
  function place(c) {
    const h = head(c.who); if (!h) return;
    const B = bounds(), hb = host.getBoundingClientRect(), hx = h.x, hy = h.y, box = () => obstacles().map((pl) => { const r = pl.getBoundingClientRect(); return { l: r.left - hb.left, t: r.top - hb.top, r: r.right - hb.left, b: r.bottom - hb.top }; });
    if (c.x === null) c.side = hy - c.h - 10 < B.top ? (hx + 16 + c.w < B.right ? 1 : -1) : 0;
    let tx, ty;
    if (!c.side) {
      tx = Math.max(B.left, Math.min(B.right - c.w, hx - c.w / 2)); ty = hy - c.h - 10;
      for (const p of box()) {
        const l = p.l - 4, t = p.t - 4, rr = p.r + 4, b = p.b + 4;
        if (tx >= rr || tx + c.w <= l || ty >= b || ty + c.h + 10 <= t) continue;
        const toR = rr + 2, toL = l - c.w - 2;
        if (toR + c.w <= B.right && hx >= toR + 4 && hx <= toR + c.w - 14) tx = Math.max(toR, Math.min(tx, hx - 6));
        else if (toL >= B.left && hx >= toL + 4 && hx <= toL + c.w - 14) tx = toL;
        else if (c.x === null && hx + 16 + c.w <= B.right) { c.side = 1; break; }
        else if (c.x === null && hx - 16 - c.w >= B.left) { c.side = -1; break; }
        else ty = Math.min(ty, t - c.h - 10);
      }
    }
    if (c.side) {
      tx = c.side > 0 ? hx + 16 : hx - c.w - 16; ty = hy - c.h / 2;
      for (const p of box()) { const b = p.b + 3; if (tx >= p.r || tx + c.w <= p.l || ty >= b || ty + c.h <= p.t) continue; if (hy - b >= -2) ty = b; }
    }
    // Pase lo que pase, entero y a la vista. Con el fondo pegado abajo, la punta sigue señalando al ratón.
    tx = Math.max(B.left, Math.min(B.right - c.w, tx)); ty = Math.max(B.top, Math.min(B.bottom - c.h - (c.side ? 0 : 10), ty));
    if (c.x === null || Math.abs(tx - c.x) > 60 || Math.abs(ty - c.y) > 60) { c.x = tx; c.y = ty; } else { c.x += (tx - c.x) * 0.35; c.y += (ty - c.y) * 0.35; }
    const el = c.el, t = el.querySelector('.ad-tail'); el.style.left = Math.round(c.x) + 'px'; el.style.top = Math.round(c.y) + 'px';
    el.classList.toggle('side-r', c.side < 0); el.classList.toggle('side-l', c.side > 0);
    if (t) { if (!c.side) { t.style.top = ''; t.style.left = Math.max(4, Math.min(c.w - 14, Math.round(hx - c.x - 5))) + 'px'; } else { t.style.left = ''; t.style.top = Math.max(4, Math.min(c.h - 14, Math.round(hy - c.y - 4))) + 'px'; } }
  }
  return S;
};
