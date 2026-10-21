// ---------- LAB · evolución V2: la fase IV (Strain Research) cambia de verdad ----------
function labV2(stage, boost = false) {
  return evArt('l2' + stage + boost, () => {
    const c = PB(86, 80), P = P2;
    // Etapa IV · Strain Research: el ala de cultivos. Un biorreactor alto de vidrio (columna con las cepas por capas), unido a la
    // torre por dos tuberías, y un invernadero bajo con las bandejas de cultivo. Vidrio, tuberías húmedas y luz verde y violeta:
    // la cúpula mira hacia fuera (direcciones); el ala de cultivos hace crecer algo.
    if (stage >= 4) {
      vol(c, 47, 58, 37, 12, P.gla, { side: 1, ao: 0 }); c.poly([[46, 58], [66, 50], [85, 58]], (x, y) => (y < 54 ? P.gla[0] : P.gla[1])); for (let x = 52; x < 84; x += 6) c.vline(x, 54, 16, P.irn[2]); c.hline(46, 58, 39, P.irn[2]);
      for (const [x, col] of [[49, ['#c8ffb0', '#7ae08a', '#3a9a50']], [56, ['#f0d0ff', '#b58cff', '#6a3ab0']], [63, ['#fff0b0', '#ffd84a', '#c09030']]]) { c.rect(x, 64, 5, 5, col[2]); c.rect(x, 64, 5, 2, col[1]); c.px(x + 1, 64, col[0]); c.hline(x - 1, 69, 7, P.irn[3]); }
      cylv(c, 70, 16, 12, 42, P.gla, null); for (let y = 18; y < 56; y++) { const band = Math.floor((y - 18) / 9); const col = ['#c8ffb0', '#b58cff', '#7ae08a', '#ffd84a', '#8af0d0'][band % 5]; c.rect(72, y, 8, 1, mixc(col, '#000000', y % 9 === 0 ? 0.35 : 0.12)); }
      c.rect(69, 14, 14, 3, P.irn[2]); c.hline(69, 14, 14, P.irn[1]); c.rect(74, 9, 4, 5, P.irn[3]); c.rect(68, 56, 16, 3, P.irn[2]); c.hline(68, 56, 16, P.irn[1]);
      for (const y of [30, 44]) { c.rect(44, y, 26, 2, P.cop[2]); c.hline(44, y, 26, P.cop[1]); c.rect(68, y - 1, 2, 4, BRS[2]); }
      stones2(c, 46, 70, 39, 9, P.stn, 3, 12);
    }
    // Planta baja (todas las etapas).
    boards(c, 7, 48, 36, 21, P.plb, 3, 'h', 3);
    const ox = 21, oy = 57;
    c.ell(ox, oy, 7.4, 7.4, (x, y) => (x + y < ox + oy - 3 ? P.cop[0] : x + y < ox + oy + 4 ? P.cop[1] : P.cop[2])); c.ell(ox, oy, 5.4, 5.4, P.cop[4]); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#1e3a3c' : '#16302e'));
    for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0]]) c.px(ox + dx, oy + dy, P.cop[3]);
    c.rect(ox - 1, oy - 4, 2, 3, P.gla[2]); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#8af0a0' : '#4ac070')); c.px(ox - 2, oy - 3, '#e8fff0');
    vol(c, 31, 55, 10, 14, P.wod, { side: 2, ao: 1 }); c.rect(33, 57, 5, 4, P.gla[2]); c.px(33, 57, P.gla[0]); c.hline(33, 61, 5, P.wod[4]); c.rect(38, 63, 2, 1, P.gld[2]);
    stones2(c, 5, 69, 40, 10, P.stn, 3, 8); c.rect(30, 69, 12, 2, P.stn[1]); c.hline(30, 69, 12, P.stn[0]);
    // Pizarra con fórmulas (todas las etapas).
    c.line(1, 79, 3, 66, P.woo[3]); c.line(7, 79, 5, 66, P.woo[3]); c.rect(0, 66, 9, 9, P.woo[3]); c.rect(1, 67, 7, 7, P.chalk[1]); c.hline(2, 68, 4, '#d8e0d8'); c.hline(2, 70, 2, '#d8e0d8'); c.px(5, 70, '#d8e0d8'); c.hline(3, 72, 4, '#d8e0d8');
    if (stage === 1) {
      // Azotea con pretil y chimenea de ventilación.
      vol(c, 5, 44, 40, 4, P.stn, { side: 2, ao: 1, face: 1 }); cylv(c, 34, 33, 4, 11, P.irn, null); c.rect(33, 32, 6, 2, P.irn[1]);
    } else {
      // Segunda planta: la mesa del investigador tras la ventana y el serpentín por fuera.
      vol(c, 5, 45, 40, 3, P.stn, { side: 2, ao: 1, face: 1 });
      boards(c, 8, 25, 34, 20, P.plb, 3, 'h', 5);
      c.rect(13, 29, 17, 11, '#2a2232'); c.rect(14, 30, 15, 9, '#3e3446'); c.rect(15, 35, 13, 2, P.woo[2]); c.rect(17, 33, 3, 2, '#fffbea'); c.rect(24, 31, 2, 4, P.irn[2]); c.rect(23, 31, 4, 1, P.win[1]); c.px(24, 32, P.win[0]); for (let y = 31; y < 39; y++) if (DI(14, y)) c.px(14, y, '#2a2232');
      c.hline(13, 40, 17, P.woo[1]); c.rect(12, 29, 1, 12, P.woo[3]); c.rect(30, 29, 1, 12, P.woo[3]); c.hline(12, 28, 19, P.woo[3]);
      for (let y = 27; y < 69; y++) { const x = 44 + Math.round(Math.sin(y * 0.55) * 1.5); c.px(x, y, P.gla[1]).px(x + 1, y, y % 4 < 2 ? '#7ae08a' : P.gla[2]); c.px(x - 1, y, P.gla[3]); }
      if (stage < 4) { c.ell(45, 74, 4.4, 4.6, (x, y) => (y < 73 ? P.gla[1] : y < 76 ? '#7ae08a' : '#4ac070')); c.rect(44, 68, 3, 3, P.gla[3]); c.px(43, 72, '#ffffff'); }
      vol(c, 6, 22, 38, 3, P.stn, { side: 2, ao: 1, face: 1 });
      if (stage === 2) { cylv(c, 34, 11, 4, 11, P.irn, null); c.rect(33, 10, 6, 2, P.irn[1]); }
    }
    if (stage >= 3) {
      // Telescopio (detrás), cúpula con nervios y ranura, antena.
      c.fill((x, y) => segDist(x + 0.5, y + 0.5, 30, 18, 42, 8) < 1.6, (x, y) => (y + x < 48 ? P.cop[1] : P.cop[2]), 28, 6, 45, 21); c.rect(41, 5, 4, 5, P.cop[3]); c.rect(42, 6, 2, 3, P.gla[1]);
      c.fill((x, y) => ((x + 0.5 - 25) / 17) ** 2 + ((y + 0.5 - 22) / 15) ** 2 <= 1 && y < 22, (x, y) => faceTone(P.ver, x, y, 8, 7, 34, 15, 0.06), 7, 6, 43, 22);
      for (const x of [13, 19, 31, 37]) c.fill((xx, yy) => xx === x && ((xx + 0.5 - 25) / 17) ** 2 + ((yy + 0.5 - 22) / 15) ** 2 <= 1 && yy < 22 && yy > 9, P.ver[3]);
      c.fill((x, y) => x >= 27 && x <= 30 && y >= 10 && y < 22, (x) => (x === 27 ? P.ver[4] : '#0e1a1e')); c.hline(15, 9, 4, P.ver[0]); c.hline(12, 11, 3, P.ver[0]);
      c.vline(25, 0, 8, P.irn[3]); c.vline(26, 1, 7, P.irn[1]); c.rect(24, 0, 3, 2, P.irn[2]);
    }
    // BOOST (concepto, no implementado): resonador de gema en la antena, arcos de energía hacia la cúpula, el experimento
    // del ojo de buey a pleno y el serpentín más rápido. La animación de los arcos va aparte.
    if (boost && stage >= 3) { gemSocket(c, 21, 0, true); c.ell(ox, oy, 4.6, 4.6, (x, y) => (y < oy - 1 ? '#2a6a6a' : '#1e5a56')); c.fill((x, y) => ((x + 0.5 - ox) / 3) ** 2 + ((y + 0.5 - oy - 1.6) / 2.4) ** 2 <= 1, (x, y) => (y < oy + 1 ? '#c8fff0' : '#5ad1ff')); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}
