// CHEESE DRILLER BETA · La respuesta a una acción que el jugador intenta y no puede hacer: un sonido corto, una sacudida pixelada del botón y una
// alerta pequeña que dice el motivo. Es solo presentación: el motivo lo deciden las reglas del núcleo y lo redacta quien llama. Sirve igual en la capa
// de hojas (iframe) y en las escenas (LAB, HOUSE): cada documento crea la suya con BetaDeny({ doc, sound, reduced }).
//   deny.show({ el | x,y, title, text, key, tone })   tone: 'block' (regla del juego, por defecto) · 'error' (fallo técnico: sin sonido de rechazo)
// Una sola alerta por documento: repetir el mismo intento la renueva sin otra alerta ni otro sonido seguido; si el motivo cambia, cambia el texto.
// Nunca tapa iconos ni botones: busca el sitio limpio más cercano a lo tocado (place).
window.BetaDeny = function (o) {
  const doc = o.doc || document, win = doc.defaultView || window, PAD = 8, GAP = 8;
  const reduced = () => (o.reduced ? o.reduced() : win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let box = null, timer = 0, lastKey = '', lastSound = 0, ac = null, covered = 0;
  function style() {
    if (doc.getElementById('dn-style')) return;
    const s = doc.createElement('style'); s.id = 'dn-style';
    s.textContent = '.dn-box{position:fixed;z-index:2147483000;left:0;top:0;max-width:min(272px,calc(100vw - 16px));padding:7px 10px 8px 10px;background:#1d1828;border:2px solid #7a3446;box-shadow:inset 0 2px 0 #2c2338,inset 0 -3px 0 #120e18,0 3px 0 #0009;color:#efe9ff;pointer-events:none;font:600 11.5px/15px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;visibility:hidden;clip-path:polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}' +
      '.dn-box.dn-in{visibility:visible}.dn-box b{display:flex;align-items:center;gap:6px;margin:0 0 4px;font:400 8px/10px var(--pixel,"Press Start 2P",monospace);color:#ff8e8e;letter-spacing:.3px}' +
      '.dn-box b i{flex:none;width:8px;height:8px;background:#e05a5a;box-shadow:inset -2px -2px 0 #8c2b3a;clip-path:polygon(2px 0,6px 0,8px 2px,8px 6px,6px 8px,2px 8px,0 6px,0 2px)}' +
      '.dn-box.dn-err{border-color:#7a6430}.dn-box.dn-err b{color:#ffcf2e}.dn-box.dn-err b i{background:#ffcf2e;box-shadow:inset -2px -2px 0 #a07a14}.dn-box span{display:block;color:#d8d0ea}' +
      '.dn-hit{outline:2px solid #e05a5a !important;outline-offset:-2px}';
    (doc.head || doc.documentElement).appendChild(s);
  }
  // Rechazo: dos notas cortas que bajan, cuadradas y suaves, como el resto del pixel art. Nada si el jugador quitó el sonido.
  function sound(tone) {
    if (tone === 'error' || (o.sound && !o.sound())) return;
    const now = performance.now(); if (now - lastSound < 380) return; lastSound = now;
    try {
      const AC = win.AudioContext || win.webkitAudioContext; if (!AC) return;
      ac = ac || new AC(); if (ac.state === 'suspended') ac.resume();
      const t0 = ac.currentTime + 0.005, out = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; out.gain.value = 0.055; lp.connect(out).connect(ac.destination);
      [[220, 0], [165, 0.075]].forEach(([f, d]) => { const v = ac.createOscillator(), g = ac.createGain(); v.type = 'square'; v.frequency.setValueAtTime(f, t0 + d); g.gain.setValueAtTime(0.0001, t0 + d); g.gain.linearRampToValueAtTime(1, t0 + d + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.07); v.connect(g).connect(lp); v.start(t0 + d); v.stop(t0 + d + 0.08); });
    } catch (e) { /* sin audio, el resto del aviso sigue igual */ }
  }
  // El botón: sacudida corta a pasos de píxel; con movimiento reducido, solo el marco rojo un instante.
  function hit(el) {
    if (!el || !el.animate) return;
    el.classList.add('dn-hit'); setTimeout(() => el.classList.remove('dn-hit'), 260);
    if (!reduced()) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(-1px)' }, { transform: 'translateX(0)' }], { duration: 200, easing: 'steps(4)' });
  }
  // Lo que la alerta nunca debe tapar: iconos e imágenes, botones, casillas pequeñas y los iconos de las estaciones de una escena.
  // Una fila o una tarjeta entera no cuenta (sus iconos y botones ya están en la lista); un lienzo de escena tampoco.
  const ICONS = 'img, canvas, svg, button, [role="button"], [data-act], .mx-act, .mx-ic, .st-ic .st-box, .st-ic .st-cap, .p0-plate, .edge-go, .home-btn';
  const BIG = 150 * 70;
  function obstacles(target) {
    const vw = win.innerWidth, vh = win.innerHeight, out = [];
    for (const el of doc.querySelectorAll(ICONS)) {
      if (el === box || (box && box.contains(el)) || (target && (el === target || el.contains(target) || target.contains(el)))) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height || r.width * r.height > BIG) continue;
      if (r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh) continue;
      const cs = win.getComputedStyle(el); if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
      out.push(r);
    }
    return o.avoid ? out.concat(o.avoid()) : out;
  }
  const over = (x, y, w, h, r) => Math.max(0, Math.min(x + w, r.right) - Math.max(x, r.left)) * Math.max(0, Math.min(y + h, r.bottom) - Math.max(y, r.top));
  // Cerca de lo tocado y sin tapar ningún icono ni lo tocado: primero arriba, abajo y a los lados del botón; si ahí no cabe, la franja libre más cercana
  // de la pantalla. Si no hay ningún sitio limpio, el que menos tape. Siempre dentro de la pantalla; no mueve nada de la interfaz.
  function place(t, target) {
    const vw = win.innerWidth, vh = win.innerHeight, w = box.offsetWidth, h = box.offsetHeight, top = PAD + (o.top ? o.top() : 0), obs = obstacles(target);
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v)), tr = { left: t.x - 2, top: t.y - 2, right: t.x + t.w + 2, bottom: t.y + t.h + 2 };
    const cx = t.x + t.w / 2 - w / 2, xs = [cx, t.x, t.x + t.w - w, PAD, vw - w - PAD], cands = [];
    for (const x of [cx, t.x + t.w - w, t.x]) { cands.push([x, t.y - h - GAP], [x, t.y + t.h + GAP]); }
    cands.push([t.x - w - GAP, t.y + t.h / 2 - h / 2], [t.x + t.w + GAP, t.y + t.h / 2 - h / 2]);
    for (let d = 12; d < vh; d += 12) for (const x of xs) cands.push([x, t.y - h - GAP - d], [x, t.y + t.h + GAP + d]);
    let best = null;
    for (const [x0, y0] of cands) {
      const x = cl(x0, PAD, vw - w - PAD), y = cl(y0, top, vh - h - PAD);
      let cost = over(x, y, w, h, tr) * 20; for (const r of obs) { cost += over(x, y, w, h, r); if (best && cost >= best.cost) break; }
      if (!best || cost < best.cost) best = { x, y, cost };
      if (cost === 0) break;
    }
    box.style.transform = 'translate(' + Math.round(best.x) + 'px,' + Math.round(best.y) + 'px)';
    return best.cost;
  }
  function show(a) {
    style();
    const key = a.key || a.title + '|' + a.text, same = key === lastKey && box && box.classList.contains('dn-in'), tone = a.tone || 'block';
    if (!box) { box = doc.createElement('div'); box.className = 'dn-box'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); doc.body.appendChild(box); }
    box.classList.toggle('dn-err', tone === 'error');
    box.innerHTML = '<b><i></i>' + a.title + '</b>' + (a.text ? '<span>' + a.text + '</span>' : '');
    const r = a.el && a.el.getBoundingClientRect ? a.el.getBoundingClientRect() : null;
    box.classList.add('dn-in'); // visible antes de colocarla: hace falta su tamaño real
    covered = place(r ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: a.x || win.innerWidth / 2, y: a.y || win.innerHeight / 2, w: 0, h: 0 }, a.el);
    hit(a.el);
    if (!same) sound(tone);
    lastKey = key;
    clearTimeout(timer); timer = setTimeout(hide, Math.max(2200, Math.min(5000, 1700 + 45 * (a.title.length + (a.text || '').length))));
  }
  function hide() { clearTimeout(timer); if (box) box.classList.remove('dn-in'); lastKey = ''; }
  return { show, hide, get open() { return !!(box && box.classList.contains('dn-in')); }, get text() { return box ? box.textContent : ''; }, get covered() { return covered; } };
};
