// Toque «como en Android»: pointerdown donde está el dedo, pointerup al soltar y, después de sus
// manejadores, el click sobre lo que haya EN ESE MOMENTO bajo el dedo (así aparece el clic fantasma).
window.tapAt = async (x, y, holdMs) => {
  const opts = (type, el) => ({ bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 7, pointerType: 'touch', isPrimary: true });
  const a = document.elementFromPoint(x, y);
  a.dispatchEvent(new PointerEvent('pointerdown', opts()));
  await new Promise((r) => setTimeout(r, holdMs || 90));
  const b = document.elementFromPoint(x, y);
  b.dispatchEvent(new PointerEvent('pointerup', opts()));
  await new Promise((r) => setTimeout(r, 0));
  const c = document.elementFromPoint(x, y);
  c.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  await new Promise((r) => setTimeout(r, 400));
  const sheet = document.getElementById('sheet');
  return { down: a.id || a.className || a.tagName, up: b.id || b.className || b.tagName, click: c.id || c.className || c.tagName, panel: sheet.hidden ? '' : document.getElementById('sheet-title').textContent, modal: document.getElementById('modal').hidden ? '' : document.getElementById('modal-body').innerText.slice(0, 40) };
};
window.centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
window.closeAll = async () => {
  for (const b of document.querySelectorAll('#modal:not([hidden]) button')) await tapAt(...centerOf(b));
  const c = document.querySelector('#sheet:not([hidden]) [data-act=close]');
  if (c) await tapAt(...centerOf(c));
};
'ok';
