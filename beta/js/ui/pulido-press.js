// PULIDO+ · la pulsación aprobada (función press de los mockups LAB, STRAINS y ventanas-v2): al tocar una pestaña, una fila,
// una categoría, una ficha de receta o el botón de una ventana, la pieza baja 2 px y vuelve (140 ms, dos pasos). En el
// mockup se hace en el clic; aquí al apoyar el dedo, porque el panel se repinta con el clic y la pieza vieja desaparece.
// Los demás paneles ya llevan la suya en CSS (:active de .act, .fc-go, .ch-btn, .ps-row, .up-btn).
(function () {
  if (!window.CM) return;
  const SEL = ['.mx-lb-tab', '.mx-lb-row', '.mx-lb-who', '.mx-lb-x', '.mx-lb-cat', '.mx-lb-chip', '.mx-lb-go', '.mx-lb-book', '.mx-st-go', '.mx-st-rc', '.mx-st-card', '#modal-body .vw-bts > button', '#modal-body .row > button'].join(',');
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('pointerdown', (e) => {
    if (!document.body.classList.contains('p2') || reduced()) return;
    const el = e.target.closest && e.target.closest(SEL);
    if (!el || !el.closest('#sheet-body, #modal-body')) return;
    if (el._pa) el._pa.cancel();
    el._pa = el.animate([{ transform: 'translateY(2px)' }, { transform: 'none' }], { duration: 140, easing: 'steps(2)' });
  }, true);
})();
