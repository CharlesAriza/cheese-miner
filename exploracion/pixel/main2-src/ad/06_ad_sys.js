// ---------- ART DIRECTION · teléfono, bocadillos, avisos, recursos y montacargas (propuestas) ----------
const KPX = 7 / 3; // px CSS por píxel de arte en la colonia (375, DPR 3)
const ICON = { raw: 'out/sprites/ic_raw_cheddar.png', base: 'out/sprites/ic_base_cheddar.png', lot: 'out/sprites/ic_lot_cheddar.png', coin: 'out/sprites/ic_coin.png' };
const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(Math.round(n)));
// ---- Teléfono: HUD, escena y panel, a tamaño real (375 × 635, iPhone en Safari con barras) y escalado para la página ----
const PHONES = [];
function adPhone(parent, { s = 0.8, dock = 'colony', cap = '', res = true, w = 375, h = 635 } = {}) {
  const fig = document.createElement('figure'); fig.className = 'ad-fig';
  const box = document.createElement('div'); box.className = 'ad-phbox'; box.style.width = w * s + 'px'; box.style.height = h * s + 'px';
  const ph = document.createElement('div'); ph.className = 'ad-ph'; ph.style.cssText = `width:${w}px;height:${h}px;transform:scale(${s})`;
  const chip = (k, v) => `<span class="ad-chip" data-k="${k}"><img class="pix" src="${ICON[k]}" alt=""><b>${v}</b></span>`;
  ph.innerHTML = `<div class="ad-hud"><span class="ad-coins" data-k="coin"><img class="pix" src="${ICON.coin}" alt=""><span><b>3.9Qa</b><small>+1.2Qa/s</small></span></span>${res ? chip('raw', '1.2K') + chip('base', '860') + chip('lot', '396K') : '<span class="ad-chip wide"><img class="pix" src="' + ICON.lot + '" alt=""><b>396K</b></span>'}<span class="ad-alert">!</span></div>` +
    `<div class="ad-stage"><canvas></canvas><div class="ad-ov"></div><div class="ad-nav"><i class="up">▲</i><span class="ad-navl"></span><i class="dn">▼</i></div></div>` +
    `<div class="ad-dock"><div class="ad-strip"></div><div class="ad-glob"><i>MICE</i><i>BOOSTS</i><i>LAB</i><i>COLONY</i><i>MENU</i></div></div>`;
  box.appendChild(ph); fig.appendChild(box); if (cap) { const c = document.createElement('figcaption'); c.innerHTML = cap; fig.appendChild(c); } parent.appendChild(fig);
  const P = { fig, ph, s, stage: ph.querySelector('.ad-stage'), cv: ph.querySelector('canvas'), ov: ph.querySelector('.ad-ov'), nav: ph.querySelector('.ad-nav'), camX: 0, camY: 0, k: KPX, vals: { coin: 3.9e15, raw: 1240, base: 860, lot: 396000 }, live: true, draw: null, vis: true };
  P.chip = (k) => ph.querySelector(`[data-k="${k}"]`);
  const tiles = { colony: [['ic_pick', 'MINE', '62%'], ['ic_raw_cheddar', 'DRILL', 'AUTO'], ['ic_base_cheddar', 'REFINE', 'AUTO'], ['ic_lot_cheddar', 'CHEESE', 'AUTO']], town: [['ic_coin', 'SELL', 'AUTO'], ['ic_flask', 'LAB', '3:20'], ['ic_lot_cheddar', 'HOUSE', '1 IDLE'], ['ic_raw_cheddar', 'PANTRY', '8h']] }[dock] || [];
  ph.querySelector('.ad-strip').innerHTML = tiles.map(([ic, n, st]) => `<span class="ad-tile" data-n="${n}"><img class="pix" src="out/sprites/${ic}.png" alt=""><b>${n}</b><small>${st}</small></span>`).join('') + (tiles.length ? '<span class="ad-tile up"><b>UPGRADES</b><small>trees</small></span>' : '');
  P.fit = () => { const r = P.stage.getBoundingClientRect(), dpr = devicePixelRatio || 1, W = P.stage.clientWidth, H = P.stage.clientHeight; P.cv.width = Math.round(W * dpr); P.cv.height = Math.round(H * dpr); P.cv.style.width = W + 'px'; P.cv.style.height = H + 'px'; P.W = W; P.H = H; P.vw = W / P.k; P.vh = H / P.k; };
  P.fit();
  P.toPh = (x, y) => [(x - P.camX) * P.k, (y - P.camY) * P.k];
  P.render = (now) => { if (!P.draw) return; const g = P.cv.getContext('2d'), dpr = devicePixelRatio || 1, k = P.k * dpr; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0e0c12'; g.fillRect(0, 0, P.cv.width, P.cv.height); g.imageSmoothingEnabled = false; g.setTransform(k, 0, 0, k, -Math.round(P.camX * k), -Math.round(P.camY * k)); P.draw(g, now); };
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => (P.vis = e[0].isIntersecting)).observe(box);
  PHONES.push(P); return P;
}
// ---- D · Bocadillos (diálogo del ratón) y avisos (estado de una máquina): dos piezas que no se parecen ----
// Diálogo: globo crema con contorno de tinta, esquinas de píxel y una punta escalonada que señala la cabeza de quien habla.
// Al hablar, el ratón reacciona (salto pequeño y su cara, poses aprobadas). Uno a la vez; tiempo de lectura según el texto.
// Aviso: placa oscura con borde ámbar y el icono del recurso que falta, colgada de la máquina, en mayúsculas. Sin punta.
const TAILSVG = (dir) => { const R = dir === 'down' ? [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]] : [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]]; let s = ''; R.forEach(([y, w], i) => { for (let x = i; x < i + w; x++) s += `<rect x="${x * 2}" y="${y === 0 ? 0 : i * 2}" width="2" height="2" fill="${x === i || x === i + w - 1 ? '#1b1220' : '#fffdf2'}"/>`; }); return `<svg class="ad-tail" width="10" height="10" viewBox="0 0 10 10" shape-rendering="crispEdges">${s}<rect x="0" y="0" width="10" height="2" fill="#fffdf2"/><rect x="0" y="0" width="2" height="2" fill="#1b1220"/><rect x="8" y="0" width="2" height="2" fill="#1b1220"/></svg>`; };
const readMs = (t) => Math.max(2200, Math.min(4500, 1600 + t.length * 60));
function bubble(P, head, text, { tone = 'say', avoid = [] } = {}) {
  const b = document.createElement('div'); b.className = 'ad-bub'; b.innerHTML = `<span>${text}</span>${TAILSVG('down')}`; P.ov.appendChild(b);
  const w = b.offsetWidth, h = b.offsetHeight, [hx, hy] = P.toPh(head[0], head[1]), top0 = 48, m = 6;
  // Arriba de la cabeza, centrado; si choca con el borde, se corre (la punta sigue señalando la cabeza); si no cabe arriba, a un lado.
  let left = Math.round(hx - w / 2), top = Math.round(hy - h - 10), side = 0;
  left = Math.max(m, Math.min(P.W - w - m, left));
  const hits = (l, t) => avoid.some((r) => !(l + w <= r[0] || r[0] + r[2] <= l || t + h <= r[1] || r[1] + r[3] <= t));
  if (top < top0 || hits(left, top)) { for (const dx of [-30, 30, -60, 60]) { const l = Math.max(m, Math.min(P.W - w - m, left + dx)); if (!hits(l, top) && top >= top0) { left = l; break; } } }
  if (top < top0) { side = hx > P.W / 2 ? -1 : 1; top = Math.max(top0, Math.round(hy - h / 2 - 6)); left = side < 0 ? Math.round(hx - w - 16) : Math.round(hx + 16); b.classList.add(side < 0 ? 'side-r' : 'side-l'); }
  b.style.left = left + 'px'; b.style.top = top + 'px';
  const tail = b.querySelector('.ad-tail'); if (!side) tail.style.left = Math.max(6, Math.min(w - 16, Math.round(hx - left - 5))) + 'px'; else tail.style.top = Math.max(4, Math.min(h - 14, Math.round(hy - top - 8))) + 'px';
  b.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 150, easing: 'steps(3)' });
  b._rect = [left, top, w, h];
  b.bye = () => { const a = b.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.85)', opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); };
  return b;
}
function plate(P, anchor, icon, text) {
  const b = document.createElement('div'); b.className = 'ad-warn'; b.innerHTML = `<img class="pix" src="${ICON[icon] || icon}" alt=""><b>${text}</b>`; P.ov.appendChild(b);
  const [x, y] = P.toPh(anchor[0], anchor[1]), w = b.offsetWidth; b.style.left = Math.max(6, Math.min(P.W - w - 6, Math.round(x - w / 2))) + 'px'; b.style.top = Math.max(48, Math.round(y - b.offsetHeight - 8)) + 'px';
  const ch = document.createElement('i'); ch.className = 'ad-chain'; ch.style.left = Math.round(x - parseFloat(b.style.left)) - 1 + 'px'; b.appendChild(ch);
  b.animate([{ transform: 'translateY(-4px)', opacity: 0 }, { transform: 'translateY(1px)', opacity: 1, offset: 0.66 }, { transform: 'none', opacity: 1 }], { duration: 180, easing: 'steps(3)' });
  b.bye = () => { const a = b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(2)', fill: 'forwards' }); a.onfinish = () => b.remove(); };
  return b;
}
// Cola de diálogo: uno a la vez, como mucho dos esperando, 600 ms entre uno y otro; el ratón reacciona al empezar.
function talker(P) {
  const T = { cur: null, q: [], until: 0, gapUntil: 0 };
  T.say = (who, text, headFn, react) => { if (T.q.length >= 2) T.q.shift(); T.q.push({ who, text, headFn, react }); };
  T.tick = (now) => { if (T.cur && now > T.until) { T.cur.el.bye(); T.cur = null; T.gapUntil = now + 600; } if (!T.cur && T.q.length && now > T.gapUntil) { const s = T.q.shift(); if (s.react) s.react(); const el = bubble(P, s.headFn(), s.text, { avoid: T.avoid ? T.avoid() : [] }); T.cur = { ...s, el }; T.until = now + readMs(s.text); } if (T.cur && T.cur.el.isConnected) { /* sigue a la cabeza si la cámara se mueve */ } };
  return T;
}
// ---- E · Recompensa inmediata: el recurso sale de su máquina, flota «+N» y vuela a su contador, que salta y sube ----
// Las reglas de MAIN (main.js): lo del dedo sale siempre; lo de los ratones, de la roca que se mira y como mucho una vez por
// etapa cada 1,2 s con el total juntado. Topes: 8 números y 10 iconos a la vez.
function fxOf(P) {
  const F = { paced: {}, floats: 0, flyers: 0 };
  F.pace = (key, n, manual) => { const p = F.paced[key] || (F.paced[key] = { at: -1e9, sum: 0 }), now = performance.now(); p.sum += n; if (!manual && now - p.at < 1200) return 0; const t = p.sum; p.sum = 0; p.at = now; return t; };
  F.bump = (k) => { const c = P.chip(k); if (!c) return; c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(-1px)' }, { transform: 'none' }], { duration: 240, easing: 'steps(1, end)' }); };
  F.count = (k, add) => { const c = P.chip(k); if (!c) return; const b = c.querySelector('b'), from = P.vals[k], to = from + add, t0 = performance.now(); P.vals[k] = to; const step = () => { const e = Math.min(1, (performance.now() - t0) / 300); b.textContent = k === 'coin' ? fmtCoin(from + (to - from) * e) : fmtK(from + (to - from) * e); if (e < 1) requestAnimationFrame(step); }; step(); };
  F.emit = (k, at, n, manual = false) => {
    const m = F.pace(k, n, manual); if (!m) return;
    const [x, y] = P.toPh(at[0], at[1]);
    if (F.floats < 8) { F.floats++; const f = document.createElement('div'); f.className = 'ad-float'; f.innerHTML = `<img class="pix" src="${ICON[k]}" alt=""><b>+${k === 'coin' ? fmtCoin(m) : fmtK(m)}</b>`; f.style.left = Math.round(x) + 'px'; f.style.top = Math.round(y - 6) + 'px'; P.ov.appendChild(f); const a = f.animate([{ transform: 'translate(-50%, 0)', opacity: 0 }, { transform: 'translate(-50%, -6px)', opacity: 1, offset: 0.2 }, { transform: 'translate(-50%, -12px)', opacity: 1, offset: 0.75 }, { transform: 'translate(-50%, -14px)', opacity: 0 }], { duration: 900, easing: 'steps(9)' }); a.onfinish = () => { f.remove(); F.floats--; }; }
    const chip = P.chip(k); if (!chip) return;
    const ci = chip.querySelector('img').getBoundingClientRect(), pr = P.ph.getBoundingClientRect(), sr = P.stage.getBoundingClientRect(), tx = (ci.left + ci.width / 2 - pr.left) / P.s, ty = (ci.top + ci.height / 2 - pr.top) / P.s, ox = (sr.left - pr.left) / P.s, oy = (sr.top - pr.top) / P.s;
    const nIc = Math.min(2, m, 10 - F.flyers); for (let i = 0; i < nIc; i++) { F.flyers++; const im2 = document.createElement('img'); im2.className = 'pix ad-fly'; im2.src = ICON[k]; const sx = ox + x + (i ? 6 : -4), sy = oy + y - 4; im2.style.left = sx + 'px'; im2.style.top = sy + 'px'; P.ph.appendChild(im2); const dx = tx - sx, dy = ty - sy; const a = im2.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { transform: `translate(-50%,-50%) translate(${i ? 4 : -4}px, -14px) scale(1.25)`, opacity: 1, offset: 0.22 }, { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(.6)`, opacity: 0.4 }], { duration: 640, delay: i * 70, easing: 'cubic-bezier(.5,0,.7,.4)', fill: 'backwards' }); a.onfinish = () => { im2.remove(); F.flyers--; if (i === nIc - 1) { F.bump(k); F.count(k, m); } }; }
    if (!nIc) F.count(k, m);
  };
  return F;
}
const fmtCoin = (n) => { const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']; let i = 0; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10) + u[i]; };

// ---- Montacargas: una secuencia conectada (propuesta) ----
// 1 La prensa acaba una hornada: la rueda sale y el contador CHEESE sube en el acto (la recompensa no espera al viaje).
// 2 La rueda baja por una rampa corta hasta el rellano (la mueve la máquina, no un ratón).
// 3 La jaula espera abierta y la rueda entra. 4 Sale cuando lleva 3 ruedas o cuando pasan 1,5 s sin que llegue otra; la puerta
// se cierra antes de moverse. 5 Sube con arranque y frenada. 6 Arriba se abre, las ruedas ruedan a su hueco del mostrador y
// la jaula baja vacía. La venta saca una rueda del mostrador y las monedas vuelan al contador. Nada de esto cambia la simulación:
// el queso ya está hecho; la jaula cuenta cómo llega.
function lift2(geo) {
  const L = { y: geo.down, st: 'open', t0: 0, cargo: 0, lastIn: -1e9, ramp: [], landing: 0, out: [], shop: 2, gate: 1, log: [] };
  L.addWheel = (now) => L.ramp.push({ t0: now });
  L.tick = (now) => {
    for (let i = L.ramp.length - 1; i >= 0; i--) if (now - L.ramp[i].t0 > 600) { L.ramp.splice(i, 1); if (L.st === 'open' && L.cargo < 3) { L.cargo++; L.lastIn = now; L.log.push(['in', now]); } else L.landing++; }
    if (L.st === 'open' && L.cargo < 3 && L.landing > 0 && now - L.lastIn > 250) { L.landing--; L.cargo++; L.lastIn = now; }
    const go = (st) => { L.st = st; L.t0 = now; L.log.push([st, now]); };
    if (L.st === 'open' && L.cargo > 0 && (L.cargo >= 3 || now - L.lastIn > 1500)) go('closing');
    else if (L.st === 'closing') { L.gate = Math.max(0, 1 - (now - L.t0) / 160); if (now - L.t0 > 160) go('up'); }
    else if (L.st === 'up' || L.st === 'down') { const ms = L.st === 'up' ? 2600 : 2200, k = Math.min(1, (now - L.t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, a = L.st === 'up' ? geo.down : geo.up, b = L.st === 'up' ? geo.up : geo.down; L.y = a + (b - a) * e; if (k >= 1) { if (L.st === 'up') { go('unload'); L.gate = 1; } else { go('open'); L.gate = 1; } } }
    else if (L.st === 'unload') { const n = L.cargo; if (n && now - L.t0 > 220) { L.cargo--; L.out.push({ t0: now, slot: L.shop + L.out.length }); L.t0 = now; } if (!L.cargo && !L.out.length) go('down'); }
    for (let i = L.out.length - 1; i >= 0; i--) if (now - L.out[i].t0 > 420) { L.out.splice(i, 1); L.shop = Math.min(5, L.shop + 1); L.log.push(['shop', now]); }
  };
  return L;
}

// El pico aprobado: se recorta de la animación de minería aprobada (swing_player, 5 fotogramas) por sus colores (mango y
// cabeza de acero), se le pone el contorno de tinta y se apoya en la pata del ratón oficial. Es el mismo dibujo, no uno nuevo.
const PICKC = { '#dcaa6a': 1, '#3e2418': 1, '#4e2c1c': 1, '#b9c1d1': 1, '#f2f5fa': 1, '#6c7488': 1, '#454a5a': 1, '#fffbe0': 1, '#ffe55c': 1 };
const PICKF = [];
function approvedPick(f) {
  if (PICKF[f]) return PICKF[f]; const i = im('out/anims/swing_player.png'); if (!i.complete || !i.width) return null;
  const c = document.createElement('canvas'); c.width = 160; c.height = 20; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, 160, 20).data, b = PB(32, 20);
  for (let y = 0; y < 20; y++) for (let x = 12; x < 32; x++) { const k = (y * 160 + f * 32 + x) * 4; if (d[k + 3] < 128) continue; const h = '#' + [d[k], d[k + 1], d[k + 2]].map((v) => v.toString(16).padStart(2, '0')).join(''); if (PICKC[h]) b.px(x, y, h); }
  b.outline(); return (PICKF[f] = b.canvas());
}
let PICKDX = -3, PICKDY = 2; // la pata del ratón oficial queda 3 px más atrás y 2 más abajo que la del trabajador genérico
