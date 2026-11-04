// PULIDO+ · la compra en el árbol de mejoras con las animaciones aprobadas del mockup Árbol (exploracion/pixel/tree.html:
// buy, buyAll, newLook y la sacudida). Solo es lo que se ve: la compra la hace el juego (CM.tree) y main.js llama aquí tras
// repintar el panel. Los estilos (.up-fly, .up-plus, .shake, .up-newlook, .lk.reveal) están en pulido-tree.css.
(function () {
  if (!window.CM) return;
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // La capa de efectos del panel (la misma de MICE y CHEESE): sobrevive a los repintados del cuerpo del panel.
  const layer = () => { const p = document.querySelector('#sheet .panel'); let l = p.querySelector('.mx-fc-sfx'); if (!l) { l = document.createElement('div'); l.className = 'mx-fc-sfx'; p.appendChild(l); } return l; };
  const ptRect = (r, dx = 0, dy = 0) => { const s = layer().getBoundingClientRect(); return [r.left - s.left + r.width / 2 + dx, r.top - s.top + r.height / 2 + dy]; };
  const ptOf = (el, dx, dy) => ptRect(el.getBoundingClientRect(), dx, dy);
  const nodeEl = (key) => document.querySelector('#sheet-body .up-node[data-node="' + key + '"]');
  function burst(x, y, n, colors, { spread = 34, up = 30, size = 4, dur = 700, fall = 18 } = {}) {
    if (reduced()) return; const L = layer();
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'); p.className = 'mx-fc-px'; p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;background:' + colors[i % colors.length];
      L.appendChild(p);
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = spread * (0.6 + Math.random() * 0.5);
      const dx = Math.round((Math.cos(a) * r) / 2) * 2, dy = Math.round((Math.sin(a) * r - up * Math.random()) / 2) * 2;
      p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: 1, offset: 0.55 }, { transform: 'translate(' + dx + 'px,' + (dy + fall) + 'px)', opacity: 0 }], { duration: dur + Math.random() * 200, easing: 'steps(8)' });
      setTimeout(() => p.remove(), dur + 260);
    }
  }
  function floatText(x, y, html, cls, dur, rise) {
    const t = document.createElement('span'); t.className = cls; t.style.left = x + 'px'; t.style.top = y + 'px'; t.innerHTML = html; layer().appendChild(t);
    if (!reduced()) t.animate([{ transform: 'translateY(4px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.15 }, { transform: 'translateY(0)', opacity: 1, offset: 0.7 }, { transform: 'translateY(-' + rise + 'px)', opacity: 0 }], { duration: dur, easing: 'steps(6)' });
    setTimeout(() => t.remove(), dur);
  }
  // La moneda sale del botón BUY y cae en el icono de la mejora (300 ms).
  function flyCoin(fromRect, to) {
    if (reduced() || !fromRect || !to) return; const [x0, y0] = ptRect(fromRect), [x1, y1] = ptOf(to);
    const c = document.createElement('img'); c.src = 'assets/main2/out/sprites/ic_coin.png'; c.className = 'up-fly pix'; c.style.left = x0 - 7 + 'px'; c.style.top = y0 - 7 + 'px'; layer().appendChild(c);
    c.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + (x1 - x0) / 2 + 'px,' + ((y1 - y0) / 2 - 22) + 'px)', offset: 0.5 }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px) scale(.6)', opacity: 0.2 }], { duration: 300, easing: 'steps(8)' });
    setTimeout(() => c.remove(), 300);
  }
  // Una mejora más: el icono late, el rango sube, «+1» con chispas azules; en el último rango, la chapa MAX y chispas de oro.
  // El panel se repinta cuando cambian las monedas: cada paso busca la pieza que hay en ese momento (por su data-node).
  function gainFx(key, gain, delay) {
    const el = nodeEl(key), icn = el && el.querySelector('.ic'); if (!icn) return;
    if (!reduced()) {
      icn.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 200, delay, easing: 'steps(3)', fill: 'backwards' });
      const rk = el.querySelector('.rk'); if (rk) rk.animate([{ transform: 'translateY(-6px)', color: '#c8ffc0' }, { transform: 'none' }], { duration: 220, delay, easing: 'steps(4)', fill: 'backwards' });
      const nw = el.querySelector('.fx .nw'); if (nw) nw.animate([{ color: '#c8ffc0' }, { color: '' }], { duration: 500, delay, easing: 'steps(5)', fill: 'backwards' });
    }
    setTimeout(() => { const e2 = nodeEl(key), ic2 = e2 && e2.querySelector('.ic'); if (!ic2) return; if (!reduced() && ic2 !== icn) ic2.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 200, easing: 'steps(3)' }); const [x, y] = ptOf(ic2, 0, -14); floatText(x - 8, y, '+' + gain, 'up-plus', 700, 12); burst(x, y + 14, 6, ['#a8ccff', '#5a9cf0', '#ffffff'], { spread: 18, up: 6, size: 3, dur: 380, fall: 2 }); }, reduced() ? 0 : delay);
  }
  function maxFx(key, name) {
    setTimeout(() => {
      const el = nodeEl(key), tag = el && el.querySelector('.up-tag'); if (!tag) return;
      if (!reduced()) tag.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(.9)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 260, easing: 'steps(5)' });
      const [x, y] = ptOf(tag); burst(x, y + 10, 12, ['#ffcf2e', '#fff3a0', '#c98a08'], { spread: 40, up: 4, size: 3, dur: 500, fall: 6 });
      if (CM.ui && CM.ui.toast) CM.ui.toast(name + ' is at its top rank', true);
    }, reduced() ? 0 : 320);
  }
  // Aspecto nuevo del edificio: la casilla del aspecto salta y la recorre un brillo, «NEW LOOK» (o «GOLD PICK») y chispas.
  function newLook(pick, delay) {
    setTimeout(() => {
      const box = document.querySelector('#sheet-body .up-looks'), tile = box && box.querySelector('.lk.now'); if (!box) return;
      if (tile && !reduced()) { tile.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.35 }, { transform: 'scale(.96)', offset: 0.7 }, { transform: 'none' }], { duration: 420, easing: 'steps(6)' }); tile.classList.add('reveal'); setTimeout(() => tile.classList.remove('reveal'), 800); }
      const tag = document.createElement('span'); tag.className = 'up-newlook'; tag.textContent = pick ? 'GOLD PICK' : 'NEW LOOK'; box.style.position = 'relative'; box.appendChild(tag);
      if (!reduced()) tag.animate([{ transform: 'translate(-50%, 6px)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1600, easing: 'steps(8)', fill: 'forwards' });
      setTimeout(() => tag.remove(), 1600);
      if (tile) { const [x, y] = ptOf(tile); burst(x, y, 18, ['#ffcf2e', '#fff3a0', '#ffffff'], { spread: 60, up: 18, size: 3, dur: 700, fall: 10 }); }
    }, reduced() ? 0 : delay);
  }
  const shake = (el) => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  CM.ptreefx = {
    // Antes de comprar: lo que hace falta para animar después (el botón tocado y los rangos y aspecto de ahora).
    snap(s, skill, btn) { return { rect: btn ? btn.getBoundingClientRect() : null, ranks: { ...s.nodes }, look: CM.q.visualTier(s, skill) }; },
    // Después de comprar y repintar. kind: 'node' (una mejora) o 'buyAll' (todo lo que alcanza en este árbol).
    after(s, kind, skill, id, snap, result) {
      const B = CM.BALANCE, nodes = B.trees[skill] || [];
      if (result && result.ok === false) { const ne = nodeEl(skill + '.' + id); shake(kind === 'node' ? ne && ne.querySelector('.up-btn') : document.querySelector('#sheet-body .up-all')); return; }
      const changed = nodes.filter((n) => (s.nodes[skill + '.' + n.id] || 0) > (snap.ranks[skill + '.' + n.id] || 0));
      changed.forEach((n, k) => {
        const key = skill + '.' + n.id, el = nodeEl(key); if (!el) return;
        const gain = (s.nodes[key] || 0) - (snap.ranks[key] || 0);
        if (kind === 'node') flyCoin(snap.rect, el.querySelector('.ic'));
        gainFx(key, gain, kind === 'node' ? 260 : k * 90);
        if (n.max < 500 && (s.nodes[key] || 0) >= n.max && !n.unlock) maxFx(key, n.name);
      });
      const look = CM.q.visualTier(s, skill);
      if (look !== snap.look && (skill !== 'mining' || (snap.look < 3 && look >= 3))) newLook(skill === 'mining', kind === 'node' ? 300 : changed.length * 90 + 120);
    },
  };
})();
