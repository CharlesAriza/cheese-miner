// ---------- RATONES VIVOS V4.1 ----------
// Cada oficio hace lo que su máquina pide en ese momento (los estados reales de la simulación espejo):
//  · Minero: con la roca buscando, pica a su ritmo real (el impacto es el golpe del juego: el pico sube cuando su contador va a
//    llegar y cae justo en el golpe). Con la veta abierta deja de picar (el juego no le deja) y mira cómo trabaja la perforadora.
//  · Perforador: con un ciclo en marcha, maneja el cuadro (tira de la palanca al arrancar y al acelerar) y a veces mira la broca;
//    sin veta, espera y se asoma a ver cómo va el minero.
//  · Refinador: con un ciclo en marcha, aviva el horno, gira la válvula y mira el manómetro; sin Raw, espera mirando la tolva.
//  · Quesera: con una hornada en marcha, aprieta la prensa, remueve la cuba o consulta el recetario; al acabar una hornada lleva la
//    rueda al montacargas; sin Base, espera junto a la cuba.
// Transiciones: anticipación antes de reaccionar, un instante quieto antes de darse la vuelta, andar que acelera y frena, y las
// reacciones pausan el trabajo (no lo reinician). Solo poses aprobadas de MICE; el pico y la rueda en la pata son piezas aparte
// (pendientes de aprobación).
const BR = {};
const seedOf = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
function rnd(b) { b.seed = (Math.imul(b.seed, 1664525) + 1013904223) >>> 0; return b.seed / 4294967296; }
const between = (b, a, c) => a + rnd(b) * (c - a);
function wpick(b, list) { const tot = list.reduce((s, x) => s + x[1], 0); let r = rnd(b) * tot; for (const [k, w] of list) { if ((r -= w) <= 0) return k; } return list[0][0]; }
function brainsReset() { for (const k of Object.keys(BR)) delete BR[k]; }
let MINERX = null;
// El sitio del minero: la parte más llana de la cresta, para que pise de verdad (se mide en el sprite).
function minerSpot(g) { if (MINERX !== null) return g.rx + MINERX; const src = ROCKC[0]; if (!TOPS[src] && !im(src).complete) return g.rx + 8; let best = g.rx + 8, bs = 99; for (let x = g.rx + 2; x <= g.rx + 12; x++) { const v = []; for (let c = x - g.rx + 7; c <= x - g.rx + 14; c++) v.push(rockTop(src, c)); const sl = Math.max(...v) - Math.min(...v) + Math.min(...v) * 0.2; if (sl < bs) { bs = sl; best = x; } } MINERX = best - g.rx; return best; }
function brain(who, g) {
  if (!BR[who]) { const c = CREW.cheddar[who]; BR[who] = { who, m: c, seed: seedOf(c.name), x: who === 'miner' ? minerSpot(g) : g.who[who][0], v: 0, tx: null, flip: who === 'refiner', want: null, turnAt: 0, act: 'idle', on: true, ta: 0, until: 0, react: null, log: [], blinkAt: 0, pulseAt: -1e9, said: {}, newWheel: 0, hitAt: -1e9, gap: 0, o: g.o }; }
  return BR[who];
}
function react(who, kind, delay = 0) { const b = BR[who]; if (!b) return; const now = performance.now() + delay; if (b.react && now - b.react.t0 < 500) return; b.react = { kind, t0: now }; b.log.push(['react:' + kind, now]); if (b.on && b.until !== Infinity) b.until += 1000; }
// Qué toca hacer ahora, según el estado real de su puesto.
function planOf(b, g) {
  const o = g.o, last = b.act;
  const pick = (L) => wpick(b, L.filter(([k]) => k !== last || k === 'work' || k === 'operate' || k === 'press' || k === 'wait'));
  if (b.who === 'miner') { if (!Z41.veinRevealed) return { act: 'work', tx: minerSpot(g), face: false, dur: Infinity }; const a = pick([['watch', 3], ['inspect', 2]]); return { act: a, tx: minerSpot(g), face: false, dur: between(b, 1800, 3000) }; }
  if (b.who === 'driller') {
    if (running() || Z41.veinRevealed) { const a = pick([['operate', 5], ['check', 1.4]]); return a === 'check' ? { act: a, tx: o + 52, face: false, dur: between(b, 1300, 1900) } : { act: a, tx: o + 70, face: false, dur: between(b, 2600, 4200) }; }
    const a = pick([['wait', 4], ['peek', 2]]); return a === 'peek' ? { act: a, tx: o + 50, face: true, dur: between(b, 1300, 1900) } : { act: a, tx: o + 66 + Math.round(rnd(b) * 4), face: false, dur: between(b, 1600, 2600) };
  }
  if (b.who === 'refiner') {
    if (!refining() && SIM41.refStatus() === 'no-raw') return { act: 'wait', tx: o + 8, face: false, dur: between(b, 1800, 2600) };
    const a = pick([['stoke', 4], ['gauge', 2], ['valve', 1.5]]), T = { stoke: [o + 4, true], gauge: [o + 6, false], valve: [o + 2, false] }[a]; return { act: a, tx: T[0], face: T[1], dur: between(b, 1400, 2400) };
  }
  if (b.newWheel > 0) return { act: 'carry', tx: o + 122, face: false, dur: 500 };
  if (!pressing() && SIM41.cookStatus() === 'no-base') return { act: 'wait', tx: o + 100, face: false, dur: between(b, 1800, 2600) };
  const a = pick([['press', 4], ['stir', 2], ['book', 1], ['inspect', 1.2]]); return { act: a, tx: { press: o + 97, stir: o + 100, book: o + 99, inspect: o + 106 }[a], face: false, dur: between(b, 1500, 2600) };
}
// ¿Sigue teniendo sentido lo que hace? Si no, acaba (con su pausa de transición), sin cortar un golpe a medias.
function stillValid(b, now) {
  if (b.who === 'miner') return b.act === 'work' ? !Z41.veinRevealed : Z41.veinRevealed || now - b.ta < 300;
  if (b.who === 'driller') return (b.act === 'wait' || b.act === 'peek') ? !Z41.veinRevealed : true;
  if (b.who === 'refiner') return b.act === 'wait' ? !refining() && SIM41.refStatus() === 'no-raw' : refining() || SIM41.refStatus() !== 'no-raw';
  if (b.who === 'cook') return b.act === 'carry' ? true : b.act === 'wait' ? !pressing() && SIM41.cookStatus() === 'no-base' && !b.newWheel : !b.newWheel && (pressing() || SIM41.cookStatus() !== 'no-base');
  return true;
}
// Los eventos que les llegan: reaccionan o marcan el pulso de la palanca.
on41((e) => {
  const now = e.t;
  if (e.type === 'hit' && e.source === 'worker' && BR.miner) BR.miner.hitAt = now;
  if (e.type === 'reveal') { react('miner', 'vein', 180); if (BR.driller) { react('driller', 'vein'); BR.driller.hurry = true; BR.driller.until = Math.min(BR.driller.until, now + 1000); } }
  if (e.type === 'deeper' && BR.miner) { react('miner', 'deeper'); }
  if ((e.type === 'drillStart' || e.type === 'drillBoost') && BR.driller) BR.driller.pulseAt = now;
  if (e.type === 'drillDone' && BR.driller && BR.driller.act === 'operate') BR.driller.glanceAt = now;
  if (e.type === 'refineStart' && BR.refiner) BR.refiner.pulseAt = now;
});
function poseOf(b, now, dt, g) {
  // Reacción en curso: anticipación, salto, aterrizaje y la cara; el trabajo queda en pausa.
  if (b.react && now >= b.react.t0) { const r = now - b.react.t0, k = b.react.kind; if (r < 1000) { const dy = r < 80 ? 1 : r < 200 ? -2 : r < 300 ? -1 : r < 380 ? 1 : 0, face = k === 'stop' ? 'down' : k === 'vein' ? (r < 550 ? 'wow' : 'happy') : k === 'deeper' ? 'wow' : 'happy'; return { x: b.x, flip: k === 'greet' ? false : b.flip, o: { face, tail: k !== 'stop', spark: k === 'upgrade' && r > 200 && r < 900 }, dy: k === 'deeper' ? (r < 120 ? 1 : 0) : dy, pick: b.who === 'miner' && !Z41.veinRevealed ? 1 : undefined }; } b.react = null; }
  // Andar: acelera, frena al llegar y las patas van con la distancia recorrida.
  if (b.tx != null && Math.abs(b.x - b.tx) > 0.4) {
    const d = b.tx - b.x, s = Math.sign(d), vmax = b.hurry ? 0.034 : 0.018; b.v = Math.min(vmax, b.v + 0.00012 * dt); const v = Math.min(b.v, Math.max(0.006, Math.abs(d) * 0.01));
    if (s < 0 !== b.flip && now - b.turnAt > 90) { b.turnAt = now; b.flip = s < 0; return { x: b.x, flip: b.flip, o: {}, dy: 0 }; }
    b.x += s * Math.min(v * dt, Math.abs(d)); b.walked = (b.walked || 0) + v * dt;
    return { x: b.x, flip: b.flip, o: { legs: Math.floor(b.walked / 3) % 2 ? 'a' : 'b' }, dy: 0, pick: b.who === 'miner' && b.act === 'work' ? 1 : undefined, carry: b.act === 'carry' && b.newWheel ? 'w' : null };
  }
  b.v = 0;
  if (!b.on) { b.on = true; b.hurry = false; b.ta = now; b.until = now + b.dur; }
  // Darse la vuelta: un instante quieto y de frente a lo que va a hacer.
  if (b.face !== null && b.face !== undefined && b.face !== b.flip) { if (!b.turnAt || now - b.turnAt > 120) { b.turnAt = now; return { x: b.x, flip: b.flip, o: {}, dy: 0 }; } b.flip = b.face; }
  const lt = now - b.ta, k = b.act, flip = b.flip;
  if (k === 'work') {
    // El pico sube cuando el contador del minero va a llegar y cae en el golpe real.
    const left = EX.minerMs - Z41.minerAcc, since = now - b.hitAt;
    if (since < 170) return { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 };
    if (left < 380 && !Z41.veinRevealed) return { x: b.x, flip: false, o: {}, dy: left < 120 ? -1 : 0, pick: 0 };
    return { x: b.x, flip: false, o: {}, dy: 0, pick: 1 };
  }
  if (k === 'watch') return { x: b.x, flip: false, o: { face: lt < 1200 ? 'happy' : undefined, tail: lt < 1200 }, dy: 0 };
  if (k === 'inspect' || k === 'check' || k === 'gauge') return { x: b.x, flip, o: { glass: true }, dy: 0 };
  if (k === 'peek') return { x: b.x, flip: true, o: { glass: true }, dy: 0 };
  if (k === 'operate') { const pulse = now - b.pulseAt < 140 ? 1 : 0, glance = b.glanceAt && now - b.glanceAt < 300; return { x: b.x, flip: glance ? true : false, o: {}, dy: pulse }; }
  if (k === 'wait') {
    const say = { driller: ['No vein yet', 4000], refiner: ['Need Raw!', 2000], cook: ['Need Base!', 2000] }[b.who];
    if (say && now - (b.waitFrom || now) > say[1] && !b.said[b.episode]) { b.said[b.episode] = true; sayB(b, say[0], now); }
    return { x: b.x, flip, o: b.who === 'driller' ? { legs: lt % 1400 < 700 ? 'tap' : undefined, face: lt < 900 ? 'grump' : undefined } : { face: 'down', ear: b.who === 'refiner', legs: lt % 1600 < 800 ? 'tap' : undefined }, dy: 0 };
  }
  if (k === 'stoke' || k === 'valve') { const p = now - b.pulseAt < 140 ? 1 : Math.floor(lt / 300) % 2; return { x: b.x, flip, o: k === 'stoke' ? { ear: true } : {}, dy: p }; }
  if (k === 'press') return { x: b.x, flip: false, o: {}, dy: Math.floor(prog(Z41.cookJob) * 12) % 2 };
  if (k === 'stir') return { x: b.x, flip: false, o: {}, dy: Math.floor(lt / 260) % 2 };
  if (k === 'book') return { x: b.x, flip: false, o: { book: Math.floor(lt / 700) % 2 ? 2 : 1 }, dy: 0 };
  if (k === 'carry') { if (b.newWheel) { b.newWheel--; LIFT.queue++; b.log.push(['place', now]); } return { x: b.x, flip: false, o: { tail: true }, dy: lt < 160 ? -1 : 0 }; }
  return { x: b.x, flip, o: {}, dy: 0 };
}
// Un bocadillo a la vez para toda la colonia, y como mucho uno cada 5 s.
const BUB = { who: null, text: '', t0: -1e9, until: 0 };
function sayB(b, text, now) { if (now - BUB.t0 < 5000) return; Object.assign(BUB, { who: b.who, text, t0: now, until: now + 2200 }); }
let LASTT = 0;
function drawWorkers(st, g, now) {
  const dt = Math.min(64, now - (LASTT || now)); LASTT = now;
  for (const who of ['refiner', 'cook', 'driller', 'miner']) {
    if (!P41[who]) continue;
    const b = brain(who, g);
    // Si cambia la geometría (otro ancho de pantalla u otra densidad), el ratón se queda en el mismo sitio de su suelo.
    if (b.o !== g.o) { const d = g.o - b.o; b.x += d; if (b.tx != null) b.tx += d; b.o = g.o; }
    if (now >= b.until || (b.on && !stillValid(b, now))) {
      if (!b.gap) b.gap = now + 140;
      if (now >= b.gap) { b.gap = 0; const p = planOf(b, g), W = g.walk[who]; if (p.act === 'wait' && b.act !== 'wait') { b.episode = (b.episode || 0) + 1; b.waitFrom = now; } Object.assign(b, { act: p.act, tx: Math.max(W[0], Math.min(W[1], p.tx)), face: p.face, dur: p.dur, on: false, until: Infinity }); b.log.push([p.act, now]); }
    }
    const strike = who === 'miner' && now - b.hitAt < 170, p = strike ? { x: b.x, flip: false, o: { face: 'grump' }, dy: 1, pick: 2 } : b.gap ? { x: b.x, flip: b.flip, o: {}, dy: 0, pick: who === 'miner' && !Z41.veinRevealed ? 1 : undefined } : poseOf(b, now, dt, g);
    const x = Math.round(p.x), feet = who === 'miner' ? minerFeet(g, x) : g.who[who][1];
    if (!b.blinkAt || now > b.blinkAt + 120) b.blinkAt = now + 2200 + rnd(b) * 2400;
    const blink = now > b.blinkAt && now < b.blinkAt + 110, breath = Math.floor((now + (b.seed % 1300)) / (620 + (b.seed % 200))) % 2;
    const c = mF(b.m, p.o.legs ? 0 : breath, blink, p.o);
    if (p.flip) { ctx.save(); ctx.translate(x + 22, feet - 20 + p.dy); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore(); } else ctx.drawImage(c, x, feet - 20 + p.dy);
    if (p.pick !== undefined && p.pick >= 0) ctx.drawImage(artPick(p.pick), x + 9, feet - 21 + p.dy);
    if (p.carry) ctx.drawImage(artCarry(p.carry), p.flip ? x - 1 : x + 15, feet - 13 + p.dy);
    b.px = x; b.py = feet; b.pose = p;
    HITS.push({ k: 'm', stop: STOPS.indexOf(st), st: g.who[who][2], who, name: b.m.name, x, y: feet - 20, w: 22, h: 20, crest: who === 'miner' });
  }
}
