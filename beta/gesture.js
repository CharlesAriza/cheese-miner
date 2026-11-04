// CHEESE DRILLER BETA · El único que decide qué ha sido un gesto sobre la escena. Cada gesto acaba en un solo resultado: toque, cámara, soltar lo
// cogido o cancelado. Aquí no hay DOM ni partida: recibe punteros y avisa con las funciones de `o`, así se prueba igual fuera del navegador
// (beta/tests/gesture-unit.js). El destino se pregunta una vez, al apoyar el dedo: los ratones y la cámara se mueven y el dedo no tiene por qué seguirlos.
window.BetaGesture = function (o) {
  const LOG_MAX = 30, now = o.now || (() => performance.now());
  let st = 'idle', cur = null, blocked = false, last = '';
  const fingers = new Set(), log = [];
  const note = (t) => { log.push(t); if (log.length > LOG_MAX) log.shift(); if (o.onNote) o.onNote(t); };
  function finish(result) { st = 'idle'; cur = null; last = result; note('= ' + result); }
  // Se acabó sin que el jugador pidiera nada: lo empezado se deshace y no se ejecuta ninguna acción.
  function drop(why) {
    if (st === 'press') o.pressAbort();
    else if (st === 'camera') o.cameraEnd(0);
    else if (st === 'hold') o.holdCancel();
    if (st !== 'idle') finish('cancel:' + why);
  }
  const api = {
    get state() { return st; },
    get active() { return st !== 'idle'; },
    get last() { return last; },
    get fingers() { return fingers.size; },
    get log() { return log.slice(); },
    down(e) {
      if (e.button) return false;
      // El primer dedo de un toque nuevo, o un puntero que ya estaba apuntado: del anterior se perdió el final.
      if ((e.primary && fingers.size) || fingers.has(e.id)) { note('stale'); drop('stale'); fingers.clear(); blocked = false; }
      fingers.add(e.id);
      if (fingers.size > 1 || blocked) { blocked = true; drop('multi'); return false; } // varios dedos no son ningún gesto: hasta levantarlos todos, nada
      const target = o.resolve(e.x, e.y);
      st = 'press'; cur = { id: e.id, x0: e.x, y0: e.y, ly: e.y, target, grab: false, pts: [[now(), e.y]] };
      note('down ' + (e.kind || '') + ' ' + (o.label ? o.label(target) : ''));
      cur.grab = !!o.press(target, e.x, e.y);
      return true;
    },
    move(e) {
      if (!cur || e.id !== cur.id) return;
      if (st === 'hold') return void o.holdMove(e.x, e.y);
      if (st === 'press') {
        o.pressMove(e.x, e.y);
        if (Math.hypot(e.x - cur.x0, e.y - cur.y0) <= o.slop(cur.target)) return;
        st = 'camera'; o.pressAbort(); o.cameraStart(cur.x0, cur.y0); cur.ly = e.y; note('camera');
      }
      o.cameraMove(e.y - cur.ly, e.x, e.y); cur.ly = e.y;
      cur.pts.push([now(), e.y]); if (cur.pts.length > 6) cur.pts.shift();
    },
    up(e) {
      const had = fingers.delete(e.id);
      if (blocked) { if (!fingers.size) blocked = false; return; }
      if (!had || !cur || e.id !== cur.id) return;
      const c = cur, was = st;
      if (was === 'hold') { const moved = Math.hypot(e.x - c.x0, e.y - c.y0) > o.slop(c.target); finish(moved ? 'drop' : 'putback'); return void o.holdDrop(moved); }
      if (was === 'camera') {
        const a = c.pts[0], b = c.pts[c.pts.length - 1], dt = Math.max(16, b[0] - a[0]), v = now() - b[0] > 90 ? 0 : (b[1] - a[1]) / dt;
        finish('camera'); return void o.cameraEnd(v);
      }
      o.pressAbort(); finish('tap'); o.tap(c.target, c.x0, c.y0);
    },
    // pointercancel, o la captura perdida (si el gesto ya acabó bien, aquí no queda nada que hacer).
    cancel(e, why) {
      const had = fingers.delete(e.id);
      if (blocked) { if (!fingers.size) blocked = false; return; }
      if (had && cur && e.id === cur.id) drop(why || 'cancel');
    },
    // La pulsación larga ha llegado (lo dice quien lleva el tiempo). Solo vale si este gesto sigue en pie y empezó sobre algo que se puede coger.
    grabbed() { if (st !== 'press' || !cur.grab) return false; st = 'hold'; note('hold'); return true; },
    // Algo ajeno al dedo (ocultar la página): todo fuera, sin acción.
    reset(why) { drop(why || 'reset'); fingers.clear(); blocked = false; },
  };
  return api;
};
