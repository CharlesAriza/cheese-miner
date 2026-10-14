// PROTOTIPO V4: ayuda para probar el arrastre de MICE en el escritorio con toques sintéticos.
// No sustituye a un móvil: el navegador no hace scroll de verdad con estos eventos.
// Uso en la consola: var s = document.createElement('script'); s.src = 'proto/_dragtest.js'; document.body.appendChild(s);
window.T = {
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  center(el) {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  },
  fire(type, el, x, y) {
    const t = new Touch({ identifier: 7, target: el, clientX: x, clientY: y });
    const live = type === 'touchend' ? [] : [t];
    const ev = new TouchEvent(type, { bubbles: true, cancelable: true, touches: live, targetTouches: live, changedTouches: [t] });
    el.dispatchEvent(ev);
    return ev.defaultPrevented;
  },
  // Pulsar en `from`, esperar `hold` ms, llevar el dedo a (x, y) y soltar. Como en Chrome, al soltar llega un clic.
  async drag(from, x, y, hold, steps) {
    const [x0, y0] = this.center(from);
    this.fire('touchstart', from, x0, y0);
    await this.sleep(hold);
    let prevented = false;
    const n = steps || 8;
    for (let i = 1; i <= n; i++) {
      prevented = this.fire('touchmove', from, x0 + ((x - x0) * i) / n, y0 + ((y - y0) * i) / n) || prevented;
      await this.sleep(16);
    }
    const ghost = document.querySelector('.mcx-ghost');
    const label = ghost ? ghost.querySelector('small').textContent : '';
    this.fire('touchend', from, x, y);
    from.click();
    await this.sleep(150);
    return { prevented, label };
  },
  async tap(el) {
    const [x, y] = this.center(el);
    this.fire('touchstart', el, x, y);
    await this.sleep(90);
    this.fire('touchend', el, x, y);
    el.click();
    await this.sleep(150);
  },
  post: (k) => document.querySelector('[data-post="' + k + '"]'),
  who: (k) => {
    const e = document.querySelector('[data-post="' + k + '"] b');
    return e ? e.textContent : null;
  },
  fx: () => {
    const e = document.getElementById('mcx-fx');
    return e.hidden ? '(hidden)' : e.innerText.replace(/\n/g, ' | ');
  },
  // Ratón y puesto de cada puesto de la colonia, para comparar antes y después.
  roster: () => [...document.querySelectorAll('.mc-post[data-post]')].map((e) => e.dataset.post + '=' + (e.dataset.mouse || '-')).join(','),
};
