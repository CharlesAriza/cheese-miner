// CHEESE DRILLER · LAB: motor de animación de la escena. No sabe nada de la economía: recibe una «vista» con el estado (setView), detecta qué ha
// cambiado y lo enseña. En la beta lo mueve beta/lab-scene.js con la partida real. Se edita en exploracion/pixel/lab-scene/lab-anim.js (ahí están sus pruebas) y se copia a beta/.
// El dibujo pasa por un backend R (begin, end, layer, spr, rect, clip, unclip, cached), así funciona en canvas y en el generador de láminas.
// Nada depende de los fotogramas de pantalla: el tiempo avanza a 16 pasos por segundo y solo se redibuja cuando hay un paso nuevo.
(function (root) {
  const TICK_MS = 62.5, MAX_FX = 14;
  const BLANK = { phase: 1, queueNode: false, strainsNode: false, deskNode: false, libraryNode: false, worker: false, job: null, bp: null, queue: 0, idle: null, known: 0, books: 0, marks: 0, samples: 0, dishes: 0, jars: [0, 0, 0, 0, 0, 0], rolls: 0, announce: null };
  const WOOD = ['#2e1a0e', '#5c3519', '#8a5428', '#b67a3e', '#dca266'], COPPER = ['#3e140a', '#7a3418', '#b4602e', '#e2924c', '#ffcc8e'], BRASS = ['#fff2b0', '#e8c060', '#b88a30', '#7a5618', '#4a3008'], IRON = ['#1c1a26', '#3a3850', '#5e5c78', '#8e8caa', '#c6c4dc'];
  const DISH = ['#7ae08a', '#b58cff', '#ffd84a', '#8af0d0', '#ff9a7a', '#c8ffb0'], JAR = [['#ffe08a', '#d8a828'], ['#ffc070', '#c8802c'], ['#f4eedc', '#c8bc9c'], ['#fff0a0', '#d0b040'], ['#e8d090', '#a88a48'], ['#bcd0f4', '#5a78b0']];
  const BOOK = ['#c0502e', '#5a9cf0', '#62d36e', '#b58cff', '#ffcf2e', '#e2462f', '#9ab8d8'], BOOKH = [6, 5, 7, 6, 5, 6, 7, 5, 6, 6, 7, 5, 6, 7];

  root.LabAnim = function (data, R, opt = {}) {
    const g = data.geom, F = data.frames, { X0, X1, F0, F1, F2, S, TEL, WING, LAD1, LAD2, FLUE, DECK, G } = g;
    let seed = (opt.seed || 7) >>> 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const reduced = !!opt.reduced;
    const FLOOR = [F0, F1, F2];
    let T = 0, acc = 0, v = Object.assign({}, BLANK), dirty = true;
    // Lo que se ve en pantalla: va detrás de la partida mientras dura una obra.
    const shown = { stage: v.phase, queueNode: false, strainsNode: false, deskNode: false, libraryNode: false };
    const fx = [];
    const st = { viewTop: 14, shake: 0, heat: 0, ignT: -99, bump: -99, gauge: 0, gaugeT: 0, burnT: -99, foamT: -99, pourT: -99, litT: -99, lit: false, eraseT: -99, boardP: 1, planP: 1, planT: -99, rollT: -99, markT: -99, markI: -1, dishT: -99, dishI: -1, jarT: -99, jarI: [0, 0], bookT: -99, bookI: -1, setbackT: -99, ledT: -99, flick: { t: -99, i: 0 }, nextFlick: 300, nextIdle: 0, idleAt: 'bench', wheelT: -99 };
    const M = { on: false, x: X0 + 45, y: F0, floor: 0, flip: false, path: [], goal: null, at: null, lt: 0, react: null, nextBlink: 40, blinkEnd: 0, micro: null, nextMicro: 60, pose: 'stand', dy: 0, ty: 0, pole: null };

    // Dónde se pone el ratón en cada puesto (x del lienzo de 22 px) y hacia dónde mira.
    const SPOT = { bench: [0, X0 + 45, 0], jar: [0, X0 + 80, 0], dish: [0, X0 + 94, 0], gauge: [0, X0 + 42, 1], board: [0, X0 + 46, 0], compact: [0, X0 + 52, 0], desk: [1, X0 + 24, 1], incub: [1, X0 + 82, 0], draft: [2, X0 + 30, 0], tele: [2, TEL.x - 39, 0], archive: [0, WING.x0 + 1, 0] };
    const LADDER = [LAD1 - 8, LAD2 - 8];

    // ================= La vista: detectar cambios =================
    // La primera vista no se anima: es el estado en que se encuentra la escena al entrar.
    // saved: lo que ya se ha enseñado; sin él, se da por visto lo que diga la vista. Lo que falte se construirá delante del jugador.
    function init(nv, saved) {
      v = Object.assign({}, BLANK, nv); Object.assign(shown, saved || { stage: v.phase, queueNode: v.queueNode, strainsNode: v.strainsNode, deskNode: v.deskNode, libraryNode: v.libraryNode });
      settle();
    }
    // Al volver a la escena: lo que haya pasado fuera no se celebra, cada cosa está en su sitio y la obra que hubiera a medias sigue donde iba.
    function resume(nv) { v = Object.assign({}, v, nv); settle(); }
    function settle() {
      st.lit = lit(); st.heat = v.job ? 2 : lit() ? 1 : 0; st.gauge = st.heat ? 1 : 0; st.camX = shown.stage >= 4 ? 39 : 5;
      if (v.bp) st.planP = v.bp.p; if (v.job && v.job.kind === 'study') st.boardP = v.job.p;
      M.on = !!v.worker; M.react = null;
      if (v.worker) { const sp = SPOT[wantSpot()]; M.floor = sp[0]; M.y = FLOOR[sp[0]]; M.x = sp[1]; M.flip = !!sp[2]; M.goal = wantSpot(); M.at = M.goal; M.lt = 0; M.path = []; }
      dirty = true;
    }
    function setView(nv) {
      const p = v; v = Object.assign({}, p, nv);
      const pj = p.job, nj = v.job;
      if (nj && (!pj || pj.kind !== nj.kind)) jobStart(nj.kind);
      if (pj && !nj) jobEnd(pj.kind, v);
      if (pj && nj && pj.kind !== nj.kind) jobEnd(pj.kind, v);
      if (pj && nj && pj.kind === nj.kind && pj.key !== nj.key) { jobEnd(pj.kind, v); jobStart(nj.kind); }
      if (pj && nj && !pj.retried && nj.retried) setback(nj.kind);
      if (v.bp && !p.bp) { st.planT = T; st.planP = 0; }
      if (p.bp && !v.bp && v.rolls > p.rolls) planDone();
      if (v.known > p.known) discovery('recipe');
      if (v.books > p.books) { st.bookT = T; st.bookI = v.books - 1; }
      if (v.marks > p.marks) { st.markT = T; st.markI = v.marks - 1; stars(X0 + 78 + 4 + (v.marks - 1) * 5, F0 - 68 + 15, 2); reaction('cheer'); }
      if (v.dishes > p.dishes) { st.dishT = T; st.dishI = v.dishes - 1; dishDone(); }
      for (let k = 0; k < 6; k++) if (v.jars[k] > p.jars[k]) { st.jarT = T; st.jarI = [k, v.jars[k] - 1]; const q = jarAt(k, v.jars[k] - 1); stars(q[0] + 2, q[1] - 2, 2); }
      if (!p.worker && v.worker) { M.on = true; M.x = X0 + 45; M.y = F0; M.floor = 0; M.path = []; M.goal = null; M.at = null; M.react = { k: 'enter', t: 0, d: 8 }; }
      if (p.worker && !v.worker) { M.on = false; }
      dirty = true;
    }
    const lit = () => v.worker || !!v.job || !!v.bp;
    function jobStart(kind) { if (kind === 'recipe') st.pourT = T; if (kind === 'recipe' || kind === 'strain') st.burnT = T; if (kind === 'study') { st.eraseT = T; st.boardP = 1; } if (kind === 'strain') st.ledT = T; }
    function jobEnd(kind, nv) { if (kind === 'study') st.boardP = 1; st.lastEnd = kind; if (kind === 'recipe' || kind === 'strain') { st.burnOffT = T; puff('smoke', X0 + 72, F0 - 13, 12, 0.05, -0.28, 4); } for (let i = 0; i < 6; i++) { const dir = [0.04, -0.14, 0.2, -0.06, 0.12, -0.2][i]; puff('steam', burstX() + [0, -1, 2, 0, -2, 1][i], F0 - 51, [24, 16, 20, 14, 22, 12][i], dir, [-0.62, -0.42, -0.5, -0.36, -0.56, -0.3][i], i * 2); } st.bump = T + 8; st.gaugeHold = T + 10; }
    const burstX = () => X0 + 9 + 16;
    function setback(kind) {
      st.setbackT = T; const at = stationPoint(kind);
      for (let i = 0; i < 3; i++) puff('dark', at[0] + i * 2 - 2, at[1] - i, 14, (i - 1) * 0.15, -0.35, i * 2);
      reaction('setback');
    }
    function stationPoint(kind) { return kind === 'recipe' ? [X0 + 72, F0 - 31] : kind === 'study' ? [X0 + 96, F0 - 44] : kind === 'strain' ? (shown.stage >= 2 && finished() ? [X0 + 120, F1 - 30] : [X0 + 64, F0 - 58]) : [X0 + 38, F2 - 30]; }
    function discovery(kind) { st.foamT = T; for (let i = 0; i < 3; i++) puff('green', X0 + 72 + i - 1, F0 - 34, 12, (i - 1) * 0.22, -0.34, 3 + i * 2); stars(X0 + 72, F0 - 37, 3); reaction('cheer'); }
    function dishDone() { const q = stationPoint('strain'); stars(q[0], q[1], 3); reaction('cheer'); }
    function planDone() { st.rollT = T; stars(X0 + 38, F2 - 36, 3); reaction('cheer'); }
    function reaction(k) { if (M.on) M.react = { k, t: 0, d: k === 'cheer' ? 16 : 14 }; }

    // ================= Efectos: pocos, con tope, sin contorno y sin brillo difuso =================
    function puff(kind, x, y, life, vx = 0, vy = -0.3, delay = 0) { if (reduced && kind !== 'star') return; if (fx.length >= MAX_FX) return; fx.push({ kind, x, y, life, vx, vy, age: -delay }); }
    function stars(x, y, n) { for (let i = 0; i < n; i++) { const a = i - (n - 1) / 2; fx.push({ kind: 'star', x: x + a * 7, y: y - Math.abs(a) * -2 - 2, life: 12, vx: 0, vy: -0.12, age: -i * 3 }); } }
    function px(kind, x, y, life, vx, vy, col, delay = 0) { if (reduced) return; if (fx.length >= MAX_FX) return; fx.push({ kind, x, y, life, vx, vy, col, age: -delay }); }
    const PUFFSEQ = [0, 1, 2, 3, 3, 5, 6, 7], STAR = [0, 1, 2, 2, 3, 4, 5];
    function drawFx() {
      for (const f of fx) {
        if (f.age < 0) continue;
        const q = f.age / f.life;
        if (f.kind === 'star') { const s = 'star' + STAR[Math.min(STAR.length - 1, Math.floor(q * STAR.length))], fr = F[s]; R.spr(s, Math.round(f.x - fr.w / 2), Math.round(f.y - fr.h / 2)); continue; }
        if (f.kind === 'px') { R.rect(Math.round(f.x), Math.round(f.y), 1, 1, f.col); continue; }
        const s = f.kind + PUFFSEQ[Math.min(7, Math.floor(q * 8))], fr = F[s]; R.spr(s, Math.round(f.x - fr.w / 2), Math.round(f.y - fr.h / 2));
      }
    }

    // ================= Lógica por paso =================
    function tick() {
      T++;
      // Caldera: el calor sale de la partida, nunca de un temporizador propio.
      const target = v.job ? 2 : lit() ? 1 : 0;
      if (target > st.heat) { if (st.heat === 0) st.ignT = T; st.heat = target; st.coolT = 0; } else if (target < st.heat) { st.coolT = (st.coolT || 0) + 1; if (st.coolT >= 22) { st.heat--; st.coolT = 0; } } else st.coolT = 0;
      const gt = T < (st.gaugeHold || 0) ? 4 : v.job ? 1 + Math.min(3, Math.floor(v.job.p * 4)) : st.heat ? 1 : 0;
      if (T - st.gaugeT >= 3 && st.gauge !== gt) { st.gauge += Math.sign(gt - st.gauge); st.gaugeT = T; }
      if (lit() !== st.lit) { st.lit = lit(); st.litT = T; }
      // Chimenea y matraz: una voluta cada tanto, no un chorro.
      const chim = chimneyAt();
      if (st.heat === 2 && T % 44 === 0) puff('smoke', chim[0], chim[1], 30, 0.14, -0.32);
      if (st.heat === 1 && T % 120 === 0) puff('smoke', chim[0], chim[1], 22, 0.12, -0.28);
      if (flaskOn() && T % 30 === 7) puff('steam', X0 + 72, F0 - 31, 14, 0.06, -0.3);
      // Tiza que cae, chispas al encender.
      if (T - st.ignT < 6 && T % 2 === 0) px('px', X0 + 9 + 12 + rnd() * 8, F0 - 9, 4, (rnd() - 0.5) * 0.5, -0.5, rnd() < 0.5 ? '#ffcf2e' : '#ff8a2e');
      // Luces: un parpadeo de vez en cuando, como en las galerías de MAIN.
      if (!reduced && T > st.nextFlick) { st.flick = { t: T, i: Math.floor(rnd() * 4) }; st.nextFlick = T + 320 + Math.floor(rnd() * 400); }
      // Avance real de la pizarra y del plano.
      if (v.job && v.job.kind === 'study') { if (T - st.eraseT < 8) st.boardP = 1 - (T - st.eraseT) / 8; else st.boardP = v.job.p; }
      if (v.bp) st.planP = T - st.planT < 6 ? 0 : v.bp.p; else if (T - st.rollT > 14) st.planP = 1;
      const camT = v.phase >= 4 ? 39 : 5; if (st.camX !== camT) st.camX += Math.sign(camT - st.camX); // la cámara acompaña a la obra del ala, sin saltos
      stepObras();
      stepMouse();
      for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.age++; if (f.age >= 0) { f.x += f.vx; f.y += f.vy; } if (f.age >= f.life) fx.splice(i, 1); }
      if (st.shake > 0) st.shake--;
      dirty = true;
    }
    function chimneyAt() { return shown.stage === 1 ? [FLUE + 1, F1 - 22] : shown.stage === 2 ? [FLUE + 1, F2 - 22] : [X0 + 3, F2 - 32]; }
    const flaskOn = () => v.job && (v.job.kind === 'recipe' || v.job.kind === 'strain');
    const finished = (s = shown) => s.stage >= 3 || s.queueNode;

    function stepObras() {
      if (opt.hold && opt.hold()) return; // tapada por una hoja, la obra espera: se ve entera, una vez
      if (st.build) return stepBuild();
      const o = nextPlan(); if (o) st.build = o;
    }
    // ================= Construcción: las piezas nuevas se colocan una a una; lo demás no se toca =================
    // Las piezas son recortes de las capas aprobadas (bake.js). Puestas todas, dan exactamente el arte final.
    const EASE = { in: (q) => q * q, out: (q) => 1 - (1 - q) * (1 - q), lin: (q) => q };
    function nextPlan() {
      if (shown.stage < v.phase) {
        const to = shown.stage + 1;
        if (to === 2) return plan12();
        if (to === 3) return finished() ? plan23() : plan2f();
        return plan34();
      }
      if (shown.stage === v.phase) {
        if (v.queueNode && !shown.queueNode) return shown.stage === 2 ? plan2f() : planPieces({ queueNode: true }, [['queue3', 0, 5, { ceil: F2 + DECK, dust: 2, settle: 1 }]], 10);
        if (v.strainsNode && !shown.strainsNode) return shown.stage >= 2 && finished() ? planPieces({ strainsNode: true }, [['feed', 0, 7, { grow: 'up', spark: 1 }], ['incubator', 5, 5, { ceil: F2 + DECK, dust: 3, shake: 1, settle: 1 }]], 16) : planPieces({ strainsNode: true }, [['compact', 0, 4, { ceil: F1 + DECK, dust: 1, settle: 1 }]], 9);
        if (v.deskNode && !shown.deskNode) return planPieces({ deskNode: true }, [['draft', 0, 6, { floor: F2, dust: 3, settle: 1 }], ['lampOff', 7, 3, { grow: 'up' }], ['basket' + Math.min(3, v.rolls), 10, 4, { floor: F2, dust: 1 }]], 18);
        if (v.libraryNode && !shown.libraryNode) return planPieces({ libraryNode: true }, [['archive', 0, 6, { floor: F0, dust: 3, shake: 1, settle: 1 }]], 11);
      }
      return null;
    }
    function planPieces(to, items, end) { const list = items.map(([n, t, d, o]) => Object.assign({ n, t, d, layer: 'mid' }, o)); return mkPlan(null, to, list, null, end, []); }
    // Cómo entra cada pieza. Ninguna aparece de golpe en el aire:
    //   sky: cae desde fuera de la pantalla, sea cual sea el alto del móvil, con la misma aceleración siempre. Con margen, porque las barras del navegador mueven el borde.
    //   ceil: baja desde detrás del techo de su planta. floor: sube desde detrás del suelo.
    //   grow: crece desde lo que ya está puesto. inner: se ajusta unos píxeles sobre una pared ya montada. Sin nada: no se mueve.
    const GRAVITY = 1.8, SKY_MARGIN = 48; // píxeles por paso al cuadrado; píxeles por encima del borde
    const fallTicks = (dist) => Math.max(3, Math.ceil(Math.sqrt((2 * dist) / GRAVITY)));
    function resolveEntries(list) {
      for (const s of list) {
        if (s.old) continue;
        const f = F[s.n], land = s.t + s.d;
        if (s.sky) { const dist = f.wy + f.h - st.viewTop + SKY_MARGIN; s.dx = 0; s.dy = -dist; s.d = fallTicks(dist); s.t = land - s.d; s.ease = 'in'; }
        else if (s.ceil !== undefined) { const dist = f.wy + f.h - s.ceil; s.dx = 0; s.dy = -dist; s.d = fallTicks(dist); s.t = land - s.d; s.ease = 'in'; }
        else if (s.floor !== undefined) { s.dx = 0; s.dy = s.floor - f.wy; s.ease = 'out'; }
      }
    }
    function mkPlan(key, to, list, light, end, finale, omit) {
      for (const s of list) if (!F[s.n]) throw new Error('Falta la pieza ' + s.n);
      resolveEntries(list);
      // Si una pieza tiene que empezar a caer antes del arranque, se retrasa toda la obra: nunca se ve a medio caer.
      const early = Math.max(0, -Math.min(0, ...list.filter((s) => !s.old).map((s) => s.t)));
      if (early) { for (const s of list) { s.t += early; if (s.until !== undefined) s.until += early; } if (light !== null) light += early; end += early; }
      if (key) { const z = data.z[key], zz = (s) => { if (s.z !== undefined) return s.z; const n = s.n.slice(key.length + 1); return z[n] === undefined ? 1e6 : z[n]; }, rank = (s) => (s.old && !s.front ? 0 : s.front ? 2 : 1); list = list.map((s, i) => [s, i]).sort((p, q) => rank(p[0]) - rank(q[0]) || zz(p[0]) - zz(q[0]) || p[1] - q[1]).map((e) => e[0]); }
      return { key, to, list, light, end, finale, omit: omit || [], t: 0 };
    }
    // Ayudantes para escribir los guiones: pieza nueva, pieza vieja, mueble.
    function writer(key) {
      const L = [], has = (n) => !!F[key + '/' + n];
      const a = (n, t, d, o = {}) => { if (has(n)) L.push(Object.assign({ n: key + '/' + n, t, d, layer: 'back' }, o)); };
      const old = (n, o) => { if (has(n)) L.unshift(Object.assign({ n: key + '/' + n, t: 0, d: 0, layer: 'back', old: true }, o)); };
      const mid = (n, t, d, o = {}) => L.push(Object.assign({ n, t, d, layer: 'mid' }, o));
      const names = data.assembly[key];
      return { L, a, old, mid, names };
    }
    // Segunda planta. El tejado sube, se levantan los postes y la viga, se abre el suelo, suben las paredes, baja el tejado y entran los muebles.
    function plan12() {
      const w = writer('1-2'), { a, old, mid, names } = w, O = 5, P = O + 6, bay = data.z['1-2'].stud0 - 0.5;
      old('old_Roof', { t: 3, d: 13, dy: -90, ease: 'out', antic: 1, until: 58 + P, front: true });
      old('old_Deck', { until: 21 + O }); old('old_tiles0', { until: 28 + O }); old('old_brace0', { until: 28 + O }); old('old_deck0', { until: 28 + O }); old('old_swapWall', { until: 46 + P });
      a('postL', 17, 0, { sky: 1, dust: 2, settle: 1 });
      a('postR', 19, 0, { sky: 1, dust: 2, settle: 1 });
      a('deck2', 23, 0, { sky: 1, dust: 3, shake: 1, spark: 2 });
      a('braceL', 24, 3, { grow: 'up' }); a('braceR', 25, 3, { grow: 'up' });
      a('deck1', 21 + O, 0, { dust: 3 });
      a('ladder', 28 + O, 0, { sky: 1, dust: 2 });
      // Entramado del almacén: va antes que las paredes, que se apoyan en él.
      for (let k = 0; k < 3; k++) a('stud' + k, 29 + O + k, 0, { ceil: F2 + DECK, dust: 1 });
      a('nog0', 31 + O, 3, { grow: 'x', spark: 1 }); a('nog1', 32 + O, 3, { grow: 'x', spark: 1 });
      // Paredes: paños de azulejo de abajo arriba, con sus juntas. Cada fila sube desde la anterior.
      const panels = names.filter((n) => /^(tile|sb)\d/.test(n)).sort((p, q) => rowOf(q) - rowOf(p) || colOf(p) - colOf(q));
      panels.forEach((n, i) => a(n, 28 + P + Math.floor(i * 0.72), 3, Object.assign({ inner: 1, dy: 6, ease: 'out', dust: i % 5 === 0 ? 1 : 0 }, n[0] === 's' ? { z: bay } : {})));
      a('clapL', 44 + P, 4, { grow: 'up' }); a('clapR', 45 + P, 4, { grow: 'up' }); a('swapWall', 46 + P, 0, {});
      a('flue', 50 + P, 6, { grow: 'up', spark: 1 });
      a('porthole', 54 + P, 3, { inner: 1, dy: -3, ease: 'out', glint: 1 });
      a('roofNew', 58 + P, 4, { inner: 1, dy: -16, ease: 'in', dust: 5, shake: 2, settle: 1 });
      mid('desk', 66 + P, 0, { ceil: F2 + DECK, dust: 2, settle: 1 });
      mid('sawhorse', 68 + P, 0, { ceil: F2 + DECK, dust: 1 }); mid('crate1', 71 + P, 0, { ceil: F2 + DECK, dust: 2, settle: 1 }); mid('crate2', 73 + P, 0, { ceil: F2 + DECK, dust: 1 }); mid('tileStack', 74 + P, 0, { ceil: F2 + DECK, dust: 1 });
      a('lamp1', 78 + P, 0, { ceil: F2 + DECK });
      return mkPlan('1-2', { stage: 2 }, w.L, 80 + P, 92 + P, [[X0 + 38, F2 + DECK + 14, 3]]);
    }
    // Terminar la segunda planta (al comprar la cola): se llevan la obra, se alicata y llegan el tablero y el armario.
    function plan2f() {
      const w = writer('2u-2f'), { a, old, mid, names } = w, s = shown, more = s.strainsNode ? 0 : 11; // sin el armario de cepas, las paredes se toman su tiempo: la obra dura lo mismo
      for (const n of names) if (/^old_/.test(n)) old(n, { until: 26 + more });
      [['crate1', 0], ['crate2', 1], ['tileStack', 2], ['sawhorse', 3]].forEach(([n, i]) => L_old(w, n, i));
      names.filter((n) => /^tile\d/.test(n)).sort((p, q) => rowOf(q) - rowOf(p) || colOf(p) - colOf(q)).forEach((n, i) => a(n, 8 + Math.floor((i * 1.4 * (19 + more)) / 19), 3, { inner: 1, dy: 6, ease: 'out', dust: i % 3 === 0 ? 1 : 0 }));
      a('lamp2', 27 + more, 0, { ceil: F2 + DECK });
      let t = 28 + more; const to = { queueNode: true }, omit = ['crates'];
      if (v.queueNode) { mid('queue3', t + 4, 0, { ceil: F2 + DECK, dust: 2, settle: 1 }); t += 5; }
      if (s.strainsNode) { omit.push('compact'); L_oldMid(w, 'compact', t); mid('feed', t, 7, { grow: 'up', spark: 1 }); mid('incubator', t + 10, 0, { ceil: F2 + DECK, dust: 3, shake: 1, settle: 1 }); t += 11; }
      return mkPlan('2u-2f', to, w.L, t + 1, t + 10, [[X0 + 100, F2 + DECK + 14, 3]], omit);
    }
    function L_old(w, n, i) { const h = F[n]; w.L.unshift({ n, t: i, d: 5, layer: 'mid', old: true, dy: h.h + 1, ease: 'in', sink: F1 }); } // la obra baja por el suelo
    function L_oldMid(w, n, t) { const h = F[n]; w.L.unshift({ n, t, d: 5, layer: 'mid', old: true, dy: -(h.wy + h.h - (F1 + DECK)), ease: 'in', raise: F1 + DECK }); } // la caja sube a la planta nueva
    // Cúpula. El tejado se desmonta en su sitio; cornisa, tambor y aro; se levanta el armazón, se corona, se colocan los paños; ventana; telescopio; luz.
    function plan23() {
      const w = writer('2f-3'), { a, old, mid, names } = w, O = 6;
      // Nada sale volando: la antena y la chimenea se recogen y el pretil se hunde por tramos detrás de la viga, del centro hacia fuera.
      old('old_Antenna', { t: 0, d: 6, dy: 28, ease: 'in', sink: F2, z: -1 });
      old('old_Chim', { t: 2, d: 6, dy: 24, ease: 'in', sink: F2 });
      for (const n of names) if (/^old_Stone/.test(n)) { const i = parseInt(n.slice(9), 10); old(n, { t: 3 + Math.round(Math.abs(i - 3.5)), d: 4, dy: 6, ease: 'in', sink: F2, dustEnd: i % 2 === 0 }); }
      old('old_Deck', { until: 12 + O }); for (const n of ['old_clapL', 'old_clapR', 'old_postL', 'old_postR']) old(n, { until: 12 + O }); // hasta que la cornisa se ha asentado
      for (const n of names) if (/^old_tile/.test(n)) old(n, { until: 17 + O });
      a('cornice', 10 + O, 0, { sky: 1, dust: 5, shake: 1, settle: 1 }); a('hatch2', 10 + O, 0, {});
      a('ladder', 17 + O, 0, { sky: 1, dust: 2 });
      a('railL', 15 + O, 3, { grow: 'up' }); a('railR', 16 + O, 3, { grow: 'up' }); a('chimney', 17 + O, 4, { grow: 'up', spark: 1 });
      a('pillarL', 23 + O, 0, { sky: 1, dust: 2, settle: 1 }); a('pillarR', 25 + O, 0, { sky: 1, dust: 2, settle: 1 });
      for (let i = 0; i < 15; i++) a('friso' + i, 25 + O + Math.floor(Math.abs(i - 7) * 0.8), 3, { inner: 1, dy: 5, ease: 'out' });
      a('ring', 37 + O, 0, { sky: 1, dust: 4, shake: 2, settle: 1 });
      // Armazón: primero los dos arcos, luego las costillas del centro hacia fuera; se sueldan subiendo.
      a('rimL', 38 + O, 10, { grow: 'up', spark: 1, tip: -1 }); a('rimR', 38 + O, 10, { grow: 'up', spark: 1, tip: 1 });
      [[2, 0], [1, 2], [3, 3], [0, 5], [4, 6]].forEach(([r, dt]) => a('rib' + r, 43 + O + dt, 7, { grow: 'up', spark: 1, tip: g.RIBS[r], inner: 1 }));
      a('tier0', 42 + O, 4, { grow: 'x' }); a('tier1', 45 + O, 4, { grow: 'x' });
      a('winFrame', 59 + O, 2, { grow: 'up', spark: 1 });
      a('lantern', 66 + O, 0, { sky: 1, dust: 2, shake: 2, settle: 1 });
      a('finial', 68 + O, 0, { sky: 1, glint: 1 });
      // Cristal: paño a paño, de abajo arriba, encajando en el armazón.
      let i = 0; for (const tier of [0, 1, 2]) for (const gore of tier % 2 ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5]) { a('pane' + tier + gore, 71 + O + Math.floor(i * 1.05), 0, { sky: 1, layer: 'glass', glint: i % 3 === 0 ? 1 : 0 }); i++; }
      a('sash', 88 + O, 4, { grow: 'up', spark: 1 }); a('stay', 92 + O, 3, { grow: 'up' });
      mid('tripod', 96 + O, 4, { grow: 'up', dust: 2 }); mid('tube', 100 + O, 5, { grow: 'up', shake: 1 });
      return mkPlan('2f-3', { stage: 3 }, w.L, 105 + O, 118 + O, [[g.CX, S - 56 - 6, 3], [TEL.x + 24, S - 40, 1]]);
    }
    // Ala: suelo y zócalo, muro, alicatado, faldón por tramos y el paso abierto en el muro de la torre.
    function plan34() {
      const w = writer('3-4'), { a, old, names } = w;
      old('old_plinth', { until: 4 }); old('old_deck0', { until: 8 }); for (const n of ['old_clapR', 'old_postR', 'old_tiles0', 'old_deck1']) old(n, { until: 37 });
      a('plinth', 5, 0, { sky: 1, dust: 2 }); a('deck0', 8, 0, { sky: 1, dust: 2, shake: 1 });
      a('wPost', 11, 0, { sky: 1, dust: 2, settle: 1 });
      names.filter((n) => /^wt\d/.test(n)).sort((p, q) => rowOf(q) - rowOf(p) || colOf(p) - colOf(q)).forEach((n, i) => a(n, 12 + i, 3, { inner: 1, dy: 6, ease: 'out', dust: i % 3 === 0 ? 1 : 0 }));
      a('wWall', 20, 4, { grow: 'up' });
      a('ledger', 25, 0, { sky: 1, spark: 1 }); a('flash', 27, 0, { sky: 1 });
      for (let k = 0; k < 6; k++) a('wr' + k, 30 + k * 1.5 | 0, 0, { sky: 1, dust: 1, settle: k === 5 ? 1 : 0 }); a('wraft', 38, 0, {});
      a('wDoor', 37, 2, { dust: 3, spark: 2 });
      a('lampW', 43, 0, { ceil: F[('3-4/lampW')].wy });
      return mkPlan('3-4', { stage: 4 }, w.L, 45, 56, [[WING.x0 + 30, F0 - 62, 3]]);
    }
    const rowOf = (n) => parseInt(n.replace(/^[a-z]+/, ''), 10), colOf = (n) => parseInt(n.split('_')[1], 10);
    function stepBuild() {
      const b = st.build; b.t++;
      for (const s of b.list) {
        if (s.old) { if (s.dustEnd && b.t === s.t + s.d) { const o = F[s.n]; puff('dust', o.wx + o.w / 2, F2 - 1, 11, 0, -0.12); } continue; }
        const f = F[s.n], land = s.t + s.d;
        if (s.grow === 'up' && s.spark && b.t >= s.t && b.t < land && (b.t - s.t) % 2 === 0) { const y = f.wy + f.h - Math.ceil((f.h * (b.t - s.t + 1)) / s.d); let x = f.wx + f.w / 2; if (s.tip !== undefined) { const rx = s.inner ? g.RX - g.RIM : g.RX, ry = s.inner ? g.RY - g.RIM : g.RY, q = (y + 0.5 - S) / ry; x = g.CX + s.tip * rx * Math.sqrt(Math.max(0, 1 - q * q)); } px('px', x, y, 4, (rnd() - 0.5) * 0.6, -0.4 + rnd() * 0.3, rnd() < 0.5 ? '#ffcf2e' : '#ff8a2e'); }
        if (b.t === land) landing(s, f);
      }
      if (b.light !== null && b.t === b.light) st.litT = T;
      if (b.light !== null && b.t === b.light + 7) for (const [x, y, n] of b.finale) stars(x, y, n);
      if (b.t >= b.end) { Object.assign(shown, b.to); st.build = null; if (b.light !== null) reaction('cheer'); if (opt.onBuilt) opt.onBuilt(b.to); }
    }
    function landing(s, f) {
      if (s.shake) st.shake = Math.max(st.shake, s.shake + 1);
      const by = f.wy + f.h - 1 + (s.layer === 'back' && s.dy > 0 ? 0 : 0);
      for (let i = 0; i < (s.dust || 0); i++) { const q = s.dust === 1 ? 0.5 : i / (s.dust - 1); puff('dust', f.wx + 2 + q * (f.w - 4), by, 10 + (i % 3) * 2, (q - 0.5) * 0.5, -0.12, i % 2); }
      if (s.spark && !s.grow) for (let i = 0; i < s.spark * 2; i++) px('px', f.wx + rnd() * f.w, f.wy + rnd() * Math.min(4, f.h), 4, (rnd() - 0.5) * 0.7, -0.4, rnd() < 0.5 ? '#ffcf2e' : '#ff8a2e');
      if (s.glint) fx.push({ kind: 'star', x: f.wx + f.w / 2, y: f.wy + Math.min(f.h / 2, 6), life: 6, vx: 0, vy: 0, age: 0 });
    }
    function drawSteps(layer) {
      const b = st.build;
      for (const s of b.list) {
        if ((s.layer || 'back') !== layer) continue;
        const f = F[s.n], t = b.t - s.t;
        if (s.old) {
          if (s.until !== undefined && b.t >= s.until) continue;
          if (s.d && s.until === undefined && t >= s.d) continue;
          let ox = 0, oy = 0;
          if (s.d && t >= 0) { const k = EASE[s.ease || 'out'](Math.min(1, t / s.d)); ox = (s.dx || 0) * k; oy = (s.dy || 0) * k; } else if (s.antic && t >= -2 && t < 0) oy = s.antic;
          if (s.sink) R.clip(f.wx - 2, f.wy - 2, f.w + 4, s.sink - (f.wy - 2));
          if (s.raise !== undefined) R.clip(f.wx - 2, s.raise, f.w + 4, g.LH);
          R.spr(s.n, f.wx + Math.round(ox), f.wy + Math.round(oy));
          if (s.sink || s.raise !== undefined) R.unclip();
          continue;
        }
        if (t < 0) continue;
        if (s.grow && t < s.d) {
          const q = (t + 1) / s.d;
          if (s.grow === 'up') { const h = Math.ceil(f.h * q); R.clip(f.wx - 1, f.wy + f.h - h, f.w + 2, h); } else { const hw = Math.ceil((f.w * q) / 2), cx = Math.round(f.wx + f.w / 2); R.clip(cx - hw, f.wy - 1, hw * 2, f.h + 2); }
          R.spr(s.n); R.unclip(); continue;
        }
        let ox = 0, oy = 0;
        if (t < s.d) { const k = 1 - EASE[s.ease || 'out'](t / s.d); ox = (s.dx || 0) * k; oy = (s.dy || 0) * k; }
        else if (s.settle && t === s.d + 1) oy = -1;
        const inMotion = t < s.d;
        if (inMotion && s.ceil !== undefined) R.clip(f.wx - 2, s.ceil, f.w + 4, g.LH);
        if (inMotion && s.floor !== undefined) R.clip(f.wx - 2, f.wy - 4, f.w + 4, s.floor - f.wy + 4);
        const rising = inMotion && s.inner && s.dy > 0; // sube desde la fila de abajo, no por encima de ella
        if (rising) R.clip(f.wx - 2, f.wy - 2, f.w + 4, f.h + 2);
        R.spr(s.n, f.wx + Math.round(ox), f.wy + Math.round(oy));
        if (inMotion && (s.ceil !== undefined || s.floor !== undefined || rising)) R.unclip();
      }
    }

    // ================= Ratón =================
    function idleSpot() {
      if (v.idle === 'noBase') return 'jar';
      if (v.idle === 'noCoin') return 'dish';
      if (v.prefer) return v.prefer;
      if (T > st.nextIdle) {
        const list = ['bench', 'gauge']; if (shown.stage >= 2) list.push('desk', 'desk'); if (shown.stage >= 3) list.push('tele', 'tele'); if (shown.libraryNode) list.push('archive');
        st.idleAt = list[Math.floor(rnd() * list.length)]; st.nextIdle = T + 240 + Math.floor(rnd() * 240);
      }
      return st.idleAt;
    }
    function wantSpot() {
      if (v.job) return v.job.kind === 'recipe' ? 'bench' : v.job.kind === 'study' ? 'board' : shown.stage >= 2 && finished() && shown.strainsNode ? 'incub' : 'compact';
      if (v.bp && shown.deskNode) return 'draft';
      return idleSpot();
    }
    function route(id) {
      const [f, x] = SPOT[id], path = []; let fl = M.floor;
      while (fl !== f) { const up = f > fl, lad = LADDER[up ? fl : fl - 1], nx = fl + (up ? 1 : -1); path.push({ walk: lad }); path.push({ climb: FLOOR[nx], floor: nx }); fl = nx; }
      path.push({ walk: x }); return path;
    }
    function stepMouse() {
      if (!M.on) return;
      if (M.react) { M.react.t++; if (M.react.t >= M.react.d) M.react = null; else { M.lt = 0; return; } }
      const want = wantSpot();
      if (want !== M.goal) { M.goal = want; M.path = route(want); M.at = null; }
      if (M.path.length) {
        const s = M.path[0];
        if ('walk' in s) { const d = s.walk - M.x; if (Math.abs(d) <= 1.5) { M.x = s.walk; M.path.shift(); } else { M.x += Math.sign(d) * 1.5; M.flip = d < 0; } }
        else { const d = s.climb - M.y; if (Math.abs(d) <= 1.5) { M.y = s.climb; M.floor = s.floor; M.path.shift(); } else M.y += Math.sign(d) * 1.5; }
        if (!M.path.length) { M.at = want; M.lt = 0; M.flip = !!SPOT[want][2]; }
        return;
      }
      M.lt++;
      if (T > M.nextBlink) { M.blinkEnd = T + 2; M.nextBlink = T + 30 + Math.floor(rnd() * 50); }
      if (T > M.nextMicro) { M.micro = { k: rnd() < 0.5 ? 'ear' : 'tail', until: T + 3 + Math.floor(rnd() * 4) }; M.nextMicro = T + 32 + Math.floor(rnd() * 80); }
      // Golpes físicos: lo que hace el ratón llega al instrumento en ese mismo paso.
      const a = M.at, c = M.lt;
      if (a === 'bench' && v.job && v.job.kind === 'recipe') { const q = c % 112; if (q >= 60 && q < 80 && q % 5 === 0) { st.bump = T + 2; } }
      if (a === 'gauge' && c % 24 < 12 && c % 6 === 0 && st.heat) st.bump = T + 2;
      if (a === 'board' && v.job && c % 3 === 0 && c % 56 < 44) { const tip = boardTip(); if (tip && c % 9 === 0) px('px', tip[0], tip[1] + 1, 6, (rnd() - 0.5) * 0.2, 0.55, '#e8f0e8'); }
      if (a === 'incub' && v.job && c % 96 < 40 && c % 16 === 0) { const q = activeDish(); if (q) px('px', q[0] + 1 + rnd() * 7, q[1] - 2, 5, 0, -0.3, '#ffffff'); }
      if (a === 'tele' && c % 120 === 36) st.wheelT = T;
    }
    // Lo que hace en cada puesto, por tramos. Las poses son las del ratón oficial; los gestos son los de MAIN (stir, valve, inspect, book, stoke, tap).
    function poseNow() {
      const out = { p: 'stand', dy: Math.floor((T + 3) / 10) % 2, ty: 0 }, c = M.lt, a = M.at, working = !!v.job;
      if (M.react) {
        const r = M.react, t = r.t;
        if (r.k === 'cheer') { out.ty = [0, 2, 3, 2, 0, 2, 3, 2, 0][Math.min(8, Math.floor(t / 1.6))]; out.p = Math.floor(t / 3) % 2 ? 'happyS' : 'happy'; out.dy = 0; return out; }
        if (r.k === 'setback') { out.p = t < 5 ? 'wow' : Math.floor(t / 2) % 2 ? 'tapG' : 'grump'; out.dy = 0; return out; }
        if (r.k === 'enter') { out.ty = [5, 3, 2, 1, 0, 0, 0, 0][Math.min(7, t)]; out.p = 'tail'; out.dy = 0; return out; }
      }
      if (M.path.length) {
        const s = M.path[0], step = Math.floor(T / 2) % 2;
        if ('climb' in s) { out.p = step ? 'aT' : 'bT'; out.dy = 0; return out; }
        out.p = step ? 'a' : 'b'; out.dy = 0; return out;
      }
      if (c < 2) { out.dy = 1; return out; } // se asienta al llegar
      if (a === 'bench') {
        if (working && v.job.kind === 'recipe') {
          const q = c % 112;
          if (q < 36) { out.p = Math.floor(q / 11) % 3 === 2 ? 'book2' : 'book1'; out.dy = 0; } // consulta el libro
          else if (q < 60) { out.dy = Math.floor(q / 4) % 2; } // remueve
          else if (q < 80) { out.p = 'ear'; out.dy = Math.floor(q / 5) % 2; } // abre la llave
          else { out.p = 'glass'; out.dy = 0; } // examina con la lupa
        } else { out.p = Math.floor(c / 22) % 4 === 3 ? 'book2' : 'book1'; out.dy = 0; }
      } else if (a === 'board') {
        const q = c % 56; if (q < 44) { out.dy = Math.floor(q / 3) % 2; } else { out.p = 'ear'; out.dy = 0; }
      } else if (a === 'compact') {
        const q = c % 72; out.p = q < 40 ? (Math.floor(q / 13) % 3 === 2 ? 'book2' : 'book1') : 'ear'; out.dy = 0;
      } else if (a === 'incub') {
        const q = c % 96; if (q < 40) { out.p = 'glass'; out.dy = 0; } else if (q < 56) { out.dy = Math.floor(q / 4) % 2; } else { out.p = Math.floor(q / 13) % 3 === 2 ? 'book2' : 'book1'; out.dy = 0; }
      } else if (a === 'draft') {
        const q = c % 64; if (q < 50) { out.dy = Math.floor(q / 3) % 2; } else { out.p = 'ear'; out.dy = 0; }
      } else if (a === 'tele') {
        const q = c % 120; out.dy = 0; if (q < 36) out.dy = 1; else if (q < 46) { out.p = 'ear'; out.dy = 1; } else if (q < 58) out.dy = 1; else if (q < 66) { out.p = 'wow'; out.lean = -2; } else if (q < 98) { out.p = Math.floor(q / 13) % 3 === 2 ? 'book2' : 'book1'; out.lean = -2; } else if (q < 106) { out.lean = -1; }
      } else if (a === 'archive') {
        const q = c % 110; if (q < 56) { out.p = Math.floor(q / 13) % 3 === 2 ? 'book2' : 'book1'; out.dy = 0; } else if (q < 84) { out.p = 'glass'; out.dy = 0; }
      } else if (a === 'desk') {
        const q = c % 88; out.p = Math.floor(q / 17) % 3 === 2 ? 'book2' : 'book1'; out.dy = 0;
      } else if (a === 'gauge') {
        const q = c % 48; if (q < 24) { out.p = 'ear'; out.dy = Math.floor(q / 6) % 2; }
      } else if (a === 'jar') { out.p = Math.floor(c / 3) % 2 ? 'tapD' : 'down'; out.dy = 0; }
      else if (a === 'dish') { out.p = Math.floor(c / 3) % 2 ? 'tapG' : 'grump'; out.dy = 0; }
      if (out.p === 'stand' && M.micro && T < M.micro.until) out.p = M.micro.k;
      return out;
    }

    // ================= Trazos que dependen del progreso =================
    const BOARD = [[4, 5, 10], [16, 5, 5], [4, 9, 6], [12, 9, 14], [4, 13, 18], [24, 13, 6]], BOARD_N = BOARD.reduce((a, s) => a + s[2], 0);
    const bx = X0 + 78, byy = F0 - 68;
    function boardTip() { let n = Math.floor(st.boardP * BOARD_N); for (const [a, b, l] of BOARD) { if (n <= l) return [bx + a + n, byy + b]; n -= l; } return null; }
    function drawBoard() { let n = Math.floor(st.boardP * BOARD_N); for (const [a, b, l] of BOARD) { if (n <= 0) break; R.rect(bx + a, byy + b, Math.min(n, l), 1, '#cfe6dc'); n -= l; } }
    const PX = X0 + 19, PY = F2 - 35;
    const PLAN = [[8, 13, 22, 'h'], [29, 9, 4, 'v-'], [26, 9, 4, 'h-'], [25, 6, 3, 'v-'], [12, 6, 14, 'h-'], [12, 6, 3, 'v'], [8, 9, 4, 'h-'], [8, 9, 4, 'v']], PLAN_N = PLAN.reduce((a, s) => a + s[2], 0);
    function planTip() { let n = Math.floor(st.planP * PLAN_N); for (const [a, b, l, d] of PLAN) { if (n <= l) { const k = Math.min(n, l - 1); return d === 'h' ? [PX + a + k, PY + b] : d === 'h-' ? [PX + a + l - 1 - k, PY + b] : d === 'v' ? [PX + a, PY + b + k] : [PX + a, PY + b + l - 1 - k]; } n -= l; } return [PX + 8, PY + 12]; }
    function drawPlan() {
      let n = Math.floor(st.planP * PLAN_N); const D = '#dceaf6';
      for (const [a, b, l, d] of PLAN) { if (n <= 0) break; const m = Math.min(n, l); if (d === 'h') R.rect(PX + a, PY + b, m, 1, D); else if (d === 'h-') R.rect(PX + a + l - m, PY + b, m, 1, D); else if (d === 'v') R.rect(PX + a, PY + b, 1, m, D); else R.rect(PX + a, PY + b + l - m, 1, m, D); n -= l; }
      if (st.planP >= 0.999) R.rect(PX + 16, PY + 9, 6, 4, '#7fb0e8');
    }
    function line(x0, y0, x1, y1, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) R.rect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1, col); }
    const jarAt = (k, r) => [WING.x0 + 20 + 2 + k * 6, F0 - 52 + 6 + (r + 1) * 9];
    function drawJar(k, r) { const [jx, sy] = jarAt(k, r), Jc = JAR[k]; R.rect(jx, sy - 8, 5, 7, '#9fb8c4'); R.rect(jx + 1, sy - 6, 3, 4, Jc[0]); R.rect(jx + 1, sy - 3, 3, 1, Jc[1]); R.rect(jx + 1, sy - 9, 3, 1, WOOD[3]); R.rect(jx, sy - 7, 1, 3, '#e8f4f8'); }
    const dishAt = (i) => { const r = Math.floor(i / 2), k = i % 2; return [X0 + 104 + 7 + k * 12, F1 - 46 + 13 + r * 10]; };
    function drawDish(i, col) { const [dx, sy] = dishAt(i); R.rect(dx, sy - 3, 10, 3, '#cfe0ec'); R.rect(dx + 1, sy - 4, 8, 1, '#cfe0ec'); R.rect(dx + 1, sy - 3, 8, 2, col); }
    const activeDish = () => (shown.strainsNode && shown.stage >= 2 && finished() ? dishAt(Math.min(5, v.dishes)) : null);
    function drawBook(i) { const h = BOOKH[i], x = X0 + 37 + 78 + i * 2, y = F0 - 36 + 10 - h; R.rect(x, y, 2, h, BOOK[i % 7]); R.rect(x, y, 1, 1, '#ffffff'); }
    function drawNote(i) { const t = i === 1 ? 1 : 0, x = X0 + 15 + 4 + i * 12, y = F1 - 56; R.rect(x, y + 5 + t, 10, 15, '#f4e4bc'); R.rect(x, y + 19 + t, 10, 1, '#e2c894'); for (const [yy, w] of [[9, 6], [12, 5], [15, 6]]) R.rect(x + 2, y + yy + t, w, 1, '#8e6234'); R.rect(x + 4, y + 3 + t, 2, 3, ['#e2462f', '#5a9cf0', '#62d36e'][i]); }

    // ================= Lo fijo: se hornea una vez y solo cambia si cambia el estado =================
    function staticKey(s, omit) { return [(omit || []).join(','), s.stage, s.queueNode, s.strainsNode, s.deskNode, s.libraryNode, v.books, v.marks, v.samples, v.dishes, v.jars.join(''), v.rolls, v.queue, T - st.bookT < 10, T - st.dishT < 6, T - st.jarT < 6, T - st.markT < 6].join('|'); }
    function drawStatic(s, omit = []) {
      if (v.samples > 0) R.spr('samples' + Math.min(6, v.samples));
      R.spr('board'); for (let i = 0; i < Math.min(6, v.marks); i++) R.rect(bx + 4 + i * 5, byy + 17, 3, 2, i === st.markI && T - st.markT < 6 ? '#ffffff' : '#ffcf2e');
      R.spr('boiler'); R.spr('bench'); for (let i = 0; i < Math.min(14, v.books); i++) if (!(i === st.bookI && T - st.bookT < 10)) drawBook(i);
      if (s.stage >= 2) {
        const fin = finished(s);
        R.spr('desk');
        if (s.queueNode) { R.spr('queue3'); for (let i = 0; i < Math.min(3, v.queue); i++) drawNote(i); }
        if (fin && s.strainsNode) { R.spr('feed'); R.spr('incubator'); for (let i = 0; i < Math.min(6, v.dishes); i++) if (!(i === st.dishI && T - st.dishT < 6)) drawDish(i, DISH[i]); }
        if (!fin && !omit.includes('crates')) R.spr('crates');
      }
      if (s.strainsNode && !(s.stage >= 2 && finished(s)) && !omit.includes('compact')) R.spr('compact');
      if (s.stage >= 3) {
        if (s.deskNode) { R.spr('draft'); R.spr('basket' + Math.min(3, v.rolls)); }
        R.spr('telescope');
        if (s.deskNode) R.spr('lampOff');
      }
      if (s.stage >= 4 && s.libraryNode) { R.spr('archive'); for (let k = 0; k < 6; k++) for (let r = 0; r < Math.min(3, v.jars[k]); r++) if (!(st.jarI[0] === k && st.jarI[1] === r && T - st.jarT < 6)) drawJar(k, r); }
    }
    function backKey(s, on) { const k = s.stage === 2 ? (finished(s) ? '2f' : '2u') : String(s.stage); return 'back' + k + (on ? '_on' : '_off'); }
    function drawWorld(s, withClouds) {
      R.layer('sky');
      if (withClouds) drawClouds();
      if (s.stage >= 3) R.layer('glass');
      const flickOn = T - st.litT < 6 ? Math.floor(T / 2) % 2 === 0 : lit();
      R.layer(backKey(s, flickOn));
      R.cached(staticKey(s), () => drawStatic(s));
    }

    function drawBuildWorld() {
      const b = st.build, s = shown, on = lit();
      R.layer('sky'); drawClouds();
      if (s.stage >= 3) R.layer('glass');
      drawSteps('glass');
      if (b.key) {
        const lt = b.light === null ? -1 : b.t - b.light, final = on && lt >= 0 && (lt >= 6 || lt % 2 === 0);
        if (final) R.layer(backKey(Object.assign({}, s, b.to), true)); else { R.layer('base' + b.key + (on ? '_on' : '_off')); drawSteps('back'); }
      } else R.layer(backKey(s, T - st.litT < 6 ? Math.floor(T / 2) % 2 === 0 : on));
      R.cached(staticKey(s, b.omit), () => drawStatic(s, b.omit));
      drawSteps('mid');
    }
    function drawClouds() { for (const [n, x0, y, sp] of [['c0', 180, 96, 22], ['c1', 340, 64, 30], ['c2', 260, 186, 18], ['c3', 150, 142, 26]]) { const fr = F[n], span = g.LW + 280 + fr.w, x = Math.floor(x0 + T / sp) % span - fr.w - 140; R.spr(n, x, y); } }
    // ================= Una imagen =================
    function render(cam) {
      const sh = st.shake ? Math.min(st.shake % 2 ? 1 : -1, g.LH - cam.y - cam.h) : 0;
      st.viewTop = cam.y;
      R.begin(cam.x, cam.y + sh, cam.w, cam.h);
      if (st.build) drawBuildWorld(); else drawWorld(shown, true);
      // Bombillas: un parpadeo ocasional.
      if (T - st.flick.t < 5 && Math.floor(T / 1) % 2 && lit()) { const l = [[X0 + 60, F1 + DECK + 8], [X0 + 124, F1 + DECK + 8]][st.flick.i % 2]; R.rect(l[0], l[1], 5, 3, '#8a7650'); }
      // Caldera.
      R.spr(st.heat === 2 ? 'portB' + Math.floor(T / 2) % 8 : st.heat === 1 ? 'portS' + Math.floor(T / 3) % 8 : 'port0');
      if (st.heat) {
        const ig = T - st.ignT;
        if (st.heat === 1 || ig < 4) R.spr('flameP' + Math.floor(T / 3) % 2);
        else R.spr((T < st.bump ? 'flameR' : 'flameF') + Math.floor(T / 2) % 4);
        if (st.heat === 2 && !reduced) for (const k of [0, 1]) { const span = F1 + DECK + 4, yy = F0 - 52 - ((T + k * 21) % 42); if (yy > span) R.rect(FLUE + 1, yy, 1, 3, COPPER[4]); }
      }
      R.spr('gauge' + st.gauge);
      // Banco.
      if (flaskOn()) { const b = T - st.burnT; R.spr('burner' + (b < 3 ? 0 : 1 + Math.floor(T / 2) % 3)); R.spr('flask' + Math.floor(T / 2) % 6); } else if (T - (st.burnOffT ?? -99) < 4) R.spr('burner0');
      if (v.job && v.job.kind === 'recipe') { const p = T - st.pourT < 6 ? 0 : v.job.p; for (let i = 0; i < 4; i++) { const lv = Math.max(0, Math.min(1, p * 4 - i)), hide = 5 - Math.round(lv * 5); if (hide > 0) R.rect(X0 + 37 + 45 + i * 4 + 1, F0 - 36 + 21, 2, hide, '#34495a'); } }
      if (T - st.foamT < 10) R.spr('foam' + Math.min(4, Math.floor((T - st.foamT) / 2)));
      if (v.idle === 'noBase') R.rect(X0 + 37 + 65, F0 - 36 + 16, 9, 8, '#34495a'); // el tarro de Base, vacío de verdad
      // Pizarra, cepas, plano, archivo.
      drawBoard();
      if (T - st.markT < 6 && st.markI >= 0) R.rect(bx + 4 + st.markI * 5, byy + 17, 3, 2, T - st.markT < 3 ? '#ffffff' : '#ffe08a');
      drawCulture();
      drawDrafting();
      if (T - st.jarT < 6) { const [k, r] = st.jarI; drawJar(k, r); if (T - st.jarT < 2) { const q = jarAt(k, r); R.rect(q[0], q[1] - 9, 5, 8, '#ffffff'); } }
      if (T - st.bookT < 10 && st.bookI >= 0) { const q = T - st.bookT, h = BOOKH[st.bookI], x = X0 + 37 + 78 + st.bookI * 2, y = F0 - 36 + 10 - h - Math.max(0, 4 - q); R.rect(x, y, 2, h, BOOK[st.bookI % 7]); R.rect(x, y, 1, 1, '#ffffff'); }
      if (T - st.wheelT < 8) R.rect(TEL.x - 1, TEL.y, 3, 3, Math.floor(T / 2) % 2 ? BRASS[3] : BRASS[0]);
      // Anuncio de lo nuevo: silueta azul, y lo construye el jugador.
      if (v.announce) drawGhost(v.announce);
      // Ratón y lo que lleva en la pata.
      if (M.on) drawMouse();
      drawFx();
      R.end();
    }
    function drawCulture() {
      const inc = shown.strainsNode && shown.stage >= 2 && finished(), box = shown.strainsNode && !inc, on = v.job && v.job.kind === 'strain';
      if (inc) {
        const x = X0 + 104, y = F1 - 46;
        const led = T - st.ledT < 12 ? (T - st.ledT) % 4 < 2 : on ? Math.floor(T / 5) % 2 === 0 : false;
        R.rect(x + 5, y + 39, 3, 2, on ? (led ? '#a8ffb8' : '#2f8f44') : lit() ? '#62d36e' : '#2f4a3a'); R.rect(x + 10, y + 39, 3, 2, on ? '#ffcf2e' : '#5a4a20');
        if (on) { R.rect(x + 4, y + 4, 1, 30, Math.floor(T / 8) % 2 ? '#a8f0c0' : '#5fb88a'); const i = Math.min(5, v.dishes), q = v.job.p, [dx, sy] = dishAt(i); R.rect(dx, sy - 3, 10, 3, '#cfe0ec'); R.rect(dx + 1, sy - 4, 8, 1, '#cfe0ec'); R.rect(dx + 1, sy - 3, 8, 2, '#1c3a30'); const n = Math.max(1, Math.round(q * 8)); R.rect(dx + 1 + Math.floor((8 - n) / 2), sy - 3, n, 2, DISH[i]); }
        if (T - st.dishT < 6 && st.dishI >= 0) { drawDish(st.dishI, T - st.dishT < 2 ? '#ffffff' : DISH[st.dishI]); }
      }
      if (box) {
        const x = X0 + 56, y = F0 - 58;
        R.rect(x + 2, y + 11, 2, 1, on ? (Math.floor(T / 5) % 2 ? '#a8ffb8' : '#2f8f44') : lit() ? '#62d36e' : '#2f4a3a'); R.rect(x + 6, y + 11, 2, 1, on ? '#ffcf2e' : '#5a4a20');
        if (on) { const c = Math.floor(T / 6) % 2 ? '#a8f0c0' : '#7ae08a'; R.rect(x + 3, y + 5, 3, 1, c); }
      }
    }
    function drawDrafting() {
      if (!shown.deskNode || shown.stage < 3) return;
      const busy = !!v.bp, atDesk = M.on && M.at === 'draft' && !M.path.length && !M.react;
      if (busy || atDesk) R.spr('lampOn');
      const roll = T - st.rollT;
      if (roll >= 0 && roll < 8) { // el plano acabado se enrolla hacia arriba
        drawPlan(); const hh = Math.round((Math.min(roll, 6) / 6) * 14); R.rect(PX + 2, PY + 16 - hh, 34, hh, '#27508c'); R.rect(PX + 2, PY + 15 - hh, 34, 2, '#f4e4bc'); R.rect(PX + 2, PY + 16 - hh, 34, 1, '#e2c894');
        return;
      }
      if (roll >= 8 && roll < 14) return;
      drawPlan();
      if (busy && !atDesk) { // el trazador trabaja solo: los planos corren aunque el investigador esté en otra cosa
        const t = planTip(); R.rect(PX + 2, PY + 1, 34, 1, BRASS[3]); R.rect(t[0], PY + 2, 1, t[1] - PY - 2, BRASS[3]); R.rect(t[0] - 1, PY, 3, 2, BRASS[1]); R.rect(t[0], t[1], 1, 1, '#ffffff');
      }
    }
    function drawGhost(name) {
      const f = F[name]; if (!f) return; if (Math.floor(T / 8) % 2) return;
      const c = '#5a9cf0', x = f.wx, y = f.wy, w = f.w, h = f.h;
      for (let i = 0; i < w; i += 3) { R.rect(x + i, y, 2, 1, c); R.rect(x + i, y + h - 1, 2, 1, c); }
      for (let i = 0; i < h; i += 3) { R.rect(x, y + i, 1, 2, c); R.rect(x + w - 1, y + i, 1, 2, c); }
    }
    function drawMouse() {
      const o = poseNow(), bl = T < M.blinkEnd && /^(stand|book1|book2|glass|ear|tail)$/.test(o.p) ? 1 : 0, x = Math.round(M.x) + (o.lean || 0), y = Math.round(M.y) - 19 - o.ty;
      M.pose = o.p;
      // Los ratones son pequeños y las herramientas, largas: vara de tiza en la pizarra, lápiz largo en la mesa de dibujo.
      if (M.at === 'board' && !M.path.length && !M.react && v.job && v.job.kind === 'study' && M.lt % 56 < 44) { const t = boardTip() || [bx + 20, byy + 10], hx = x + 15, hy = M.y - 8; line(hx, hy, t[0], t[1], WOOD[3]); R.rect(t[0], t[1], 1, 2, '#ffffff'); }
      if (M.at === 'draft' && !M.path.length && !M.react && v.bp && M.lt % 64 < 50) { const t = planTip(), hx = x + 15, hy = M.y - 8; line(hx, hy, t[0], t[1], '#c9884a'); R.rect(t[0], t[1], 1, 1, '#ffffff'); }
      R.spr('M' + o.p + o.dy + bl, x, y, M.flip);
    }
    return {
      init, resume, setView, render, tick,
      step(dt) { acc += dt; let n = 0; while (acc >= TICK_MS && n < 8) { acc -= TICK_MS; tick(); n++; } if (acc > 1000) acc = 0; return n; },
      get view() { return v; }, get dirty() { return dirty; }, clean() { dirty = false; }, get T() { return T; }, get fxCount() { return fx.filter((f) => f.age >= 0).length; }, get mouse() { return M; }, get shown() { return shown; }, get busyObra() { return !!st.build; }, get buildT() { return st.build ? st.build.t : null; }, get buildEnd() { return st.build ? st.build.end : null; }, get plan() { return st.build; }, get camX() { return st.camX; },
      force(s) { Object.assign(shown, s); }, geom: g, BLANK,
    };
  };
  root.LabAnim.BLANK = BLANK;
})(typeof window !== 'undefined' ? window : globalThis);
