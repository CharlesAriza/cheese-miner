// CHEESE DRILLER BETA · Qué espacio de la colonia se ve: HOUSE ← MAIN → LAB. Solo decide qué escena está a la vista y lleva su ciclo de vida; no sabe nada
// de economía ni de partida. La colonia es una y avanza en beta.js sea cual sea la escena: una escena solo la dibuja. Sin DOM, para probarlo fuera del navegador
// (beta/tests/scenes-unit.js). Una escena es un objeto con lo que necesite:
//   init()     la primera vez que se entra (o tras liberarla): crea sus recursos
//   enter()    pasa a estar a la vista, detrás del velo
//   frame(now) dibuja: solo se llama a la escena visible
//   leave()    deja de estar a la vista: suelta lo que tenga a medias
//   release()  libera sus recursos al salir, salvo que tenga keep: true
//   ready()    si se puede entrar ahora (sin él, siempre)
window.BetaScenes = function (o = {}) {
  const now = o.now || (() => performance.now()), FADE = o.fadeMs == null ? 130 : o.fadeMs, HOME = o.home || 'main', defs = new Map(), live = new Set();
  let cur = null, tr = null, sl = null;
  const stats = { switches: 0, enters: {}, leaves: {}, inits: {}, releases: {}, failed: [], swapMaxMs: 0, swapWorst: '' };
  const bump = (m, id) => { m[id] = (m[id] || 0) + 1; };
  const can = (id) => { const d = defs.get(id); return !!d && (!d.ready || !!d.ready()); };
  const fade = (a) => { if (o.veil) o.veil(a); };
  function enterScene(id) {
    const d = defs.get(id);
    try {
      if (!live.has(id)) { if (d.init) d.init(); live.add(id); bump(stats.inits, id); }
      if (d.enter) d.enter();
    } catch (e) { stats.failed.push(id); if (o.onError) o.onError(e, id); if (id === HOME) throw e; return enterScene(HOME); } // una escena que no arranca nunca deja sin juego: se vuelve a casa
    cur = id; bump(stats.enters, id); return id;
  }
  function leaveScene(id) {
    const d = defs.get(id); if (!d) return;
    try {
      if (d.leave) d.leave();
      bump(stats.leaves, id);
      if (!d.keep && live.has(id)) { if (d.release) d.release(); live.delete(id); bump(stats.releases, id); }
    } catch (e) { if (o.onError) o.onError(e, id); live.delete(id); }
  }
  function swap(id, then) {
    const from = cur, t0 = now(); leaveScene(from); const to = enterScene(id); stats.switches += 1; { const ms = now() - t0; if (ms > stats.swapMaxMs) { stats.swapMaxMs = ms; stats.swapWorst = from + '>' + to; } }
    if (o.onChange) o.onChange(to, from);
    if (then) then();
  }
  return {
    register(id, def) { defs.set(id, def); return this; },
    get(id) { return defs.get(id) || null; },
    can,
    get current() { return cur; },
    get busy() { return !!tr || !!sl; },
    // Viaje entre vecinas: las dos se dibujan mientras dura. Solo al acabar cambia cuál es la actual.
    slideBegin(id) { if (!can(id) || tr || sl || id === cur) return false; const d = defs.get(id); try { if (!live.has(id)) { if (d.init) d.init(); live.add(id); bump(stats.inits, id); } if (d.enter) d.enter(); } catch (e) { stats.failed.push(id); if (o.onError) o.onError(e, id); return false; } bump(stats.enters, id); sl = { to: id }; return true; },
    slideEnd(commit) { if (!sl) return; const { to } = sl; sl = null; if (!commit) return leaveScene(to); const from = cur; leaveScene(from); cur = to; stats.switches += 1; if (o.onChange) o.onChange(to, from); },
    get live() { return [...live]; },
    stats,
    // Sin transición, al arrancar. Lo que no exista o no esté disponible acaba en casa, nunca en una pantalla rota.
    start(id) { const to = id && can(id) ? id : HOME; return enterScene(to); },
    // then: lo que hay que hacer ya en la escena de destino; se hace detrás del velo, sin que se vea el salto.
    go(id, then) {
      if (!can(id)) return false;
      if (tr) { tr.to = id; tr.then = then; if (tr.phase === 'in' && id !== cur) { tr.phase = 'out'; tr.t0 = now(); } return true; } // la última petición manda
      if (id === cur) { if (then) then(); return true; }
      tr = { to: id, then, phase: 'out', t0: now() };
      return true;
    },
    // Una vez por fotograma. Va por reloj: un fotograma largo acorta la transición, no la deja a medias.
    frame(t) {
      if (tr) {
        const k = FADE > 0 ? Math.min(1, (now() - tr.t0) / FADE) : 1;
        if (tr.phase === 'out') {
          fade(k);
          if (k >= 1) { if (tr.to !== cur) swap(tr.to, tr.then); else if (tr.then) tr.then(); tr.then = null; tr.phase = 'in'; tr.t0 = now(); }
        } else { fade(1 - k); if (k >= 1) { fade(0); tr = null; } }
      }
      const d = defs.get(cur); if (d && d.frame) d.frame(t);
      if (sl) { const e = defs.get(sl.to); if (e && e.frame) e.frame(t); }
    },
  };
};
