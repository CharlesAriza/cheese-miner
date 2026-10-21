// ---------- BLOQUE 5 · BOCADILLOS, PLACAS E INSIGNIAS: la dirección validada y su colocación (21-10-2026) ----------
// Vuelve a lo aprobado en la revisión de arte (main2-ad): el bocadillo .ad-bub (crema, 2 px de tinta, esquinas recortadas,
// letra Press Start 2P y la punta escalonada TAILSVG) y la placa .ad-warn (chapa oscura con borde ámbar, el icono del recurso
// aprobado y la cadena hasta la máquina). La versión roja de la placa usa los colores del aviso rojo del juego. Las insignias
// son los iconos de aviso que el juego ya usa y están aprobados (icons.js: alert, alertr y done), a 1:1 o ×2.
// Reglas de colocación (una capa por escena, recalculada en cada fotograma):
// 1 · Jerarquía: placa roja (máquina parada) > bocadillo > placa ámbar (aviso de máquina). Lo crítico va siempre; después, lo
//     que dura poco (un ratón hablando, unos segundos) antes que lo que dura mucho (un aviso, que mientras tanto puede quedarse
//     en insignia y vuelve a su placa en cuanto hay sitio). Lo de más prioridad se coloca primero; lo demás se adapta.
// 2 · Cada pieza prueba sus posiciones en orden (la placa: encima de la máquina con la cadena más o menos larga y corrida a
//     los lados sin dejar de colgar de su punto; el bocadillo: encima de la cabeza, corrido, o a un lado) y se queda con la
//     primera que no pisa nada ni se sale de la vista. Si la que tenía sigue valiendo, no cambia (no salta de un sitio a otro).
// 3 · Límites: un bocadillo a la vez (los demás esperan su turno) y como mucho 3 placas con texto; las demás, y las que no
//     caben, se quedan en su insignia sobre la máquina. Si tampoco cabe la insignia, no se pinta (el aviso sigue activo).
// 4 · Si un bocadillo no cabe con su ancho, se estrecha (más líneas) antes de rendirse.
// 5 · El bocadillo va anclado al ratón que habla: sigue su cabeza en cada fotograma y su punta lo señala. Si el ratón sale de
//     la vista o no hay sitio durante más de 0,4 s, el bocadillo se cierra; nunca se queda flotando.
const GAME_ICON = {
  alert: [['......K......', '.....KLK.....', '.....KYK.....', '....KYYYK....', '....KYKYK....', '...KYYKYYK...', '...KYYKYYK...', '..KYYYKYYYK..', '..KYYYYYYYK..', '.KYYYYKYYYYK.', '.KDDDDDDDDDK.', 'KKKKKKKKKKKKK'], { Y: '#ffd43a', L: '#fff3a0', D: '#d9a514', K: '#1b1622' }],
  alertr: [['......K......', '.....KLK.....', '.....KYK.....', '....KYYYK....', '....KYKYK....', '...KYYKYYK...', '...KYYKYYK...', '..KYYYKYYYK..', '..KYYYYYYYK..', '.KYYYYKYYYYK.', '.KDDDDDDDDDK.', 'KKKKKKKKKKKKK'], { Y: '#ff5a7a', L: '#ffc2cc', D: '#c43a58', K: '#1b1622' }],
  done: [['.......KK', '......KGK', 'K....KGK.', 'KGK.KGK..', '.KGKGK...', '..KGK....', '...K.....'], { G: '#3fa860', K: '#1b1622' }],
};
const gameIcon = (name) => art('gi' + name, () => { const [rows, pal] = GAME_ICON[name], c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length; const g = c.getContext('2d'); rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); } })); return c; });
const PLATE_MAX = 3, PRIO = { red: 3, say: 2, amber: 1 };
// host: un div posicionado del tamaño de la escena; k: px de pantalla por px de arte; view(): [x, y, w, h] visible en px del
// host; keepOut(): rectángulos prohibidos (la interfaz); icons: ruta del icono de cada recurso.
function labelLayer(host, { k, view, keepOut = () => [] }) {
  const L = { plates: new Map(), q: [], cur: null, gapUntil: 0, stats: { bubble: 0, plates: 0, badges: 0, hidden: 0, overlaps: 0, closed: 0 } };
  const mkPlate = (it) => { const el = document.createElement('div'); el.className = 'ad-warn' + (it.tone === 'red' ? ' lb-red' : ''); el.innerHTML = `<img class="pix" src="${it.icon}" alt=""><b>${it.text}</b><i class="ad-chain"></i>`; host.appendChild(el); const bd = document.createElement('img'); bd.className = 'lb-badge'; bd.src = gameIcon(it.tone === 'red' ? 'alertr' : 'alert').toDataURL(); bd.alt = ''; host.appendChild(bd); it.el = el; it.bd = bd; it.w = el.offsetWidth; it.h = el.offsetHeight; it.ci = -1; it.t = performance.now(); };
  L.warn = (id, o) => { const old = L.plates.get(id); if (old && old.text === o.text && old.tone === o.tone) { old.anchor = o.anchor; return; } if (old) L.unwarn(id); const it = { id, kind: o.tone, ...o }; mkPlate(it); L.plates.set(id, it); };
  L.unwarn = (id) => { const it = L.plates.get(id); if (!it) return; it.el.remove(); it.bd.remove(); L.plates.delete(id); };
  L.say = (who, text, head) => { if (L.cur && L.cur.who === who) return; if (L.q.some((s) => s.who === who)) return; if (L.q.length >= 2) L.q.shift(); L.q.push({ who, text, head }); };
  const startBubble = (s) => { const b = document.createElement('div'); b.className = 'ad-bub'; b.innerHTML = `<span>${s.text}</span>${TAILSVG('down')}`; host.appendChild(b); b.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 150, easing: 'steps(3)' }); L.cur = { ...s, kind: 'say', el: b, w: b.offsetWidth, h: b.offsetHeight, ci: -1, until: performance.now() + readMs(s.text), lostAt: 0, t: performance.now() }; };
  const closeBubble = (now, why) => { const b = L.cur.el; b.classList.remove('side-l', 'side-r'); const a = b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); if (why) L.stats.closed++; L.cur = null; L.gapUntil = now + 600; };
  const hit = (r, list) => list.some((o) => !(r[0] + r[2] <= o[0] || o[0] + o[2] <= r[0] || r[1] + r[3] <= o[1] || o[1] + o[3] <= r[1]));
  const inside = (r, V) => r[0] >= V[0] + 2 && r[1] >= V[1] + 2 && r[0] + r[2] <= V[0] + V[2] - 2 && r[1] + r[3] <= V[1] + V[3] - 2;
  // Posiciones posibles de una placa: colgando de su punto, con la cadena de 8, 20 o 32 px, centrada o corrida a un lado.
  // Si es roja y no cabe encima, cuelga por debajo de su punto (la cadena sube): lo crítico no se queda sin texto.
  const plateCands = (it) => { const [ax, ay] = [it.anchor[0] * k, it.anchor[1] * k], out = []; for (const ch of [8, 20, 32]) for (const dx of [0.5, 0.82, 0.18]) { const left = Math.round(ax - it.w * dx), top = Math.round(ay - ch - it.h); out.push({ r: [left, top, it.w, it.h + ch], left, top, ch, ax }); } if (it.tone === 'red') for (const ch of [8, 20]) for (const dx of [0.5, 0.82, 0.18]) { const left = Math.round(ax - it.w * dx), top = Math.round(ay + ch); out.push({ r: [left, Math.round(ay), it.w, it.h + ch], left, top, ch, ax, below: true }); } return out; };
  // Posiciones posibles de un bocadillo: encima de la cabeza (centrado o corrido, la punta siempre bajo el bocadillo), o a un lado.
  const bubCands = (it, hx, hy) => { const out = [], top = Math.round(hy - it.h - 10); for (const dx of [0.5, 0.75, 0.25, 0.9, 0.1, 0.97, 0.03]) { const left = Math.round(hx - it.w * dx); out.push({ r: [left, top, it.w, it.h + 10], left, top, side: 0, hx, hy }); } const st = Math.round(hy - it.h / 2 - 6); out.push({ r: [Math.round(hx - it.w - 16), st, it.w + 10, it.h], left: Math.round(hx - it.w - 16), top: st, side: -1, hx, hy }); out.push({ r: [Math.round(hx + 6), st, it.w + 10, it.h], left: Math.round(hx + 16), top: st, side: 1, hx, hy }); return out; };
  L.tick = (now) => {
    if (L.cur && now > L.cur.until) closeBubble(now, false);
    if (!L.cur && L.q.length && now > L.gapUntil) startBubble(L.q.shift());
    const V = view(), placed = [...keepOut()], st = { bubble: 0, plates: 0, badges: 0, hidden: 0, overlaps: 0, closed: L.stats.closed };
    const items = [...L.plates.values()]; if (L.cur) items.push(L.cur);
    items.sort((a, b) => PRIO[b.kind] - PRIO[a.kind] || a.t - b.t);
    for (const it of items) {
      if (it.kind === 'say') {
        const h = it.head(); if (!h) { closeBubble(now, true); continue; }
        const [hx, hy] = [h[0] * k, h[1] * k]; if (hx < V[0] || hx > V[0] + V[2] || hy < V[1] || hy > V[1] + V[3]) { closeBubble(now, true); continue; }
        // Si no cabe con su ancho (150 px), prueba a estrecharse (110 y 90 px, el texto en más líneas) antes de rendirse.
        const ok = (c) => inside(c.r, V) && !hit(c.r, placed); let cs = null, ci = -1;
        for (const mw of [150, 110, 90]) { if (it.mw !== mw) { it.el.style.maxWidth = mw + 'px'; it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; if (it.mw != null) it.ci = -1; it.mw = mw; } cs = bubCands(it, hx, hy); ci = it.ci >= 0 && ok(cs[it.ci]) ? it.ci : cs.findIndex(ok); if (ci >= 0) break; }
        if (ci < 0) { it.el.style.visibility = 'hidden'; it.lostAt ||= now; if (now - it.lostAt > 400) closeBubble(now, true); st.hidden++; continue; }
        it.lostAt = 0; it.ci = ci; const c = cs[ci], b = it.el, tail = b.querySelector('.ad-tail'); b.style.visibility = ''; b.style.left = c.left + 'px'; b.style.top = c.top + 'px';
        b.classList.toggle('side-r', c.side < 0); b.classList.toggle('side-l', c.side > 0);
        if (!c.side) { tail.style.top = ''; tail.style.left = Math.max(4, Math.min(it.w - 14, Math.round(hx - c.left - 5))) + 'px'; } else { tail.style.left = ''; tail.style.top = Math.max(4, Math.min(it.h - 14, Math.round(hy - c.top - 8))) + 'px'; }
        placed.push(c.r); st.bubble++; continue;
      }
      // Placa: con texto si quedan huecos (como mucho PLATE_MAX); si no, su insignia; si tampoco cabe, nada.
      const cs = plateCands(it), ok = (c) => inside(c.r, V) && !hit(c.r, placed); let ci = st.plates < PLATE_MAX ? (it.ci >= 0 && ok(cs[it.ci]) ? it.ci : cs.findIndex(ok)) : -1;
      if (ci >= 0) { it.ci = ci; const c = cs[ci]; Object.assign(it.el.style, { visibility: '', left: c.left + 'px', top: c.top + 'px' }); const ch = it.el.querySelector('.ad-chain'); ch.style.left = Math.round(c.ax - c.left - 1) + 'px'; ch.style.height = c.ch + 'px'; if (c.below) { ch.style.bottom = ''; ch.style.top = -c.ch - 2 + 'px'; } else { ch.style.top = ''; ch.style.bottom = -c.ch - 2 + 'px'; } it.bd.style.visibility = 'hidden'; placed.push(c.r); st.plates++; continue; }
      // Insignia: sobre su punto, o corrida a un lado o un poco más arriba si ahí ya hay algo.
      it.ci = -1; it.el.style.visibility = 'hidden'; const s = 2 * Math.max(1, Math.round(k / 2.33)), bw = 13 * s, bh = 12 * s, ax = Math.round(it.anchor[0] * k), ay = Math.round(it.anchor[1] * k);
      const br = [[0, 0], [-bw, 0], [bw, 0], [0, -bh], [-bw, -bh], [bw, -bh]].map(([dx, dy]) => [ax - bw / 2 + dx, ay - bh - 2 + dy, bw, bh]).find((r) => inside(r, V) && !hit(r, placed));
      if (br) { Object.assign(it.bd.style, { visibility: '', left: br[0] + 'px', top: br[1] + 'px', width: bw + 'px', height: bh + 'px' }); placed.push(br); st.badges++; } else { it.bd.style.visibility = 'hidden'; st.hidden++; }
    }
    // Comprobación: ninguna pieza visible pisa a otra.
    const vis = [...host.children].filter((e) => e.style.visibility !== 'hidden' && (e.classList.contains('ad-bub') || e.classList.contains('ad-warn') || e.classList.contains('lb-badge')) && e.style.left).map((e) => [parseFloat(e.style.left), parseFloat(e.style.top), e.offsetWidth, e.offsetHeight]);
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) if (hit(vis[i], [vis[j]])) st.overlaps++;
    L.stats = st; return st;
  };
  return L;
}
// La cabeza de un ratón del capítulo, en px de arte del capítulo (su posición de este fotograma).
const headOfB = (who) => () => { const b = BR[who]; return b && b.px != null ? [b.px + 11, b.py - 18] : null; };
