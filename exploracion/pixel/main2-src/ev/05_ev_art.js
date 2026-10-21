// ---------- EVOLUCIÓN Y BOOST · edificios con el tratamiento corregido (propuesta, no aprobados) ----------
// Cada edificio se monta por piezas: una base y módulos que se añaden con el progreso real; el BOOST es otra capa con su propio
// módulo, su luz y su ritmo, y se ancla a la etapa que haya. Así un edificio evolucionado no pierde nada al potenciarse.
const EVC = {};
const evArt = (k, f) => (EVC[k] ||= f());
const P2 = PAL;

// ================= HOUSE · 98 × 58 (etapa I usa 64 de ancho) =================
// I · la casa: la cama (THE BED) y reclutar. II · TRAINING ROOM a la vista (el cobertizo con el muñeco de entrenar).
// III · tablón de reclutas junto a la puerta y buhardilla con luz (más ratones en la colonia).
function houseStage(stage, boost = false) {
  return evArt('h' + stage + boost, () => {
    const W = stage >= 3 ? 100 : stage >= 2 ? 88 : 64, c = PB(W, 58), P = P2, G = 57;
    // Chimenea.
    vol(c, 44, 8, 7, 18, P.stn, { side: 2, ao: 0 }); c.rect(43, 6, 9, 2, P.stn[1]); c.hline(43, 7, 9, P.stn[3]); for (let y = 11; y < 24; y += 3) c.hline(45, y, 5, P.stn[3]);
    // Anexo TRAINING ROOM (etapa II): cobertizo de tablas con el frente abierto y el muñeco de paja.
    if (stage >= 2) {
      boards(c, 54, 34, 32, 16, P.woo, 4, 'v', 7);
      c.rect(60, 38, 20, 10, P.wod[4]); c.hline(60, 38, 20, '#120a08'); for (let y = 39; y < 48; y++) if (DI(60, y)) c.px(60, y, P.wod[3]);
      c.rect(69, 40, 2, 8, P.woo[3]); c.ell(70, 42, 3.2, 3.6, (x, y) => (y < 42 ? P.str[1] : P.str[2])); c.hline(67, 42, 7, P.str[3]); c.px(70, 41, P.red[1]);
      c.rect(75, 44, 4, 4, P.irn[2]); c.hline(75, 44, 4, P.irn[1]);
      // Tejado de una sola agua, de tablas.
      c.poly([[52, 34], [86, 37], [86, 39], [52, 36]], P.woo[3]); c.poly([[52, 31], [87, 35], [87, 37], [52, 33]], (x, y) => (y < 33 ? P.woo[1] : P.woo[2])); c.line(52, 31, 87, 35, P.woo[0]);
      stones2(c, 54, 50, 34, 7, P.stn, 3, 5);
    }
    // Muros con entramado.
    vol(c, 8, 28, 46, 21, P.pla, { side: 3, ao: 2 });
    for (const x of [8, 31, 52]) { c.vline(x, 28, 21, P.woo[2]); c.vline(x + 1, 28, 21, P.woo[3]); }
    c.hline(8, 28, 46, P.woo[2]); c.hline(8, 29, 46, P.woo[3]); c.hline(8, 46, 46, P.woo[2]); c.hline(8, 47, 46, P.woo[3]);
    for (let i = 0; i < 34; i++) { const x = 11 + Math.floor(hh2(i, 1) * 40), y = 31 + Math.floor(hh2(i, 2) * 13); if (c.get(x, y) === P.pla[2]) c.px(x, y, P.pla[3]); }
    // Zócalo.
    stones2(c, 6, 49, 50, 8, P.stn, 3, 4);
    // Puerta redonda: arco de piedra, tablas, herrajes, pomo; las líneas de dentro son del tono más oscuro de la madera.
    const dc = 20, inArch = (x, y, r) => (y >= 38 && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - 38) ** 2 <= r * r && y < 38);
    c.fill((x, y) => inArch(x, y, 8.4) && y < 48, (x, y) => (hh2(x, y, 7) < 0.5 ? P.stw[1] : P.stw[2]), dc - 9, 26, dc + 10, 48);
    c.fill((x, y) => inArch(x, y, 6.4) && y < 48, (x, y) => (!inArch(x - 1, y, 6.4) || !inArch(x, y - 1, 6.4) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 7, 28, dc + 8, 48);
    for (const y of [37, 43]) { c.hline(dc - 5, y, 11, P.irn[3]); c.px(dc - 4, y, P.irn[1]).px(dc + 4, y, P.irn[1]); }
    c.rect(dc + 3, 40, 2, 2, P.gld[2]); c.px(dc + 3, 40, P.gld[0]);
    c.rect(dc - 9, 47, 19, 2, P.stn[1]); c.hline(dc - 9, 47, 19, P.stn[0]);
    // Farol y ventana redonda con la luz de dentro; jardinera.
    c.vline(28, 31, 2, P.irn[3]); c.rect(27, 33, 4, 5, P.irn[3]); c.rect(28, 34, 2, 3, P.win[1]); c.px(28, 34, P.win[0]);
    const wx = 42, wy = 36;
    c.ell(wx, wy, 5.6, 5.6, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3]));
    c.vline(wx - 1, wy - 3, 7, P.wod[3]); c.hline(wx - 4, wy, 7, P.wod[3]); c.px(wx - 3, wy - 2, P.win[0]).px(wx - 2, wy - 3, P.win[0]);
    vol(c, 35, 42, 15, 4, P.woo, { side: 1, ao: 1 });
    for (let i = 0; i < 7; i++) { const x = 36 + i * 2, col = [P.red[1], P.gld[1], '#ff9ab5', P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]; c.px(x, 40, P.lea[2]).px(x + 1, 41, P.lea[3]).px(x, 39, col).px(x + 1, 40, P.lea[1]); }
    // Tejado: cuña de queso. Cara con ojos, corteza en los cantos, el corte de abajo y la sombra sobre el muro.
    const face = (x, y) => inPoly(x + 0.5, y + 0.5, [[2, 30], [19, 3.5], [60, 30]]);
    c.fill((x, y) => face(x, y) || (y >= 30 && y < 32 && x >= 2 && x < 60), (x, y) => { if (y >= 30) return y === 30 ? P.chz[3] : P.rnd[4]; const e1 = segDist(x + 0.5, y + 0.5, 2, 30, 19, 3.5), e2 = segDist(x + 0.5, y + 0.5, 19, 3.5, 60, 30); if (e1 < 2.4) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.4) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, 3, 4, 56, 25); }, 0, 0, 62, 32);
    for (const [hx, hy, rx, ry] of [[22, 15, 3.2, 2.2], [34, 21, 2.6, 2], [13, 22, 2.2, 1.6], [46, 25, 2.2, 1.4], [28, 25.5, 1.6, 1.1], [20, 10, 1.4, 1], [40, 17, 1.4, 1]]) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1]));
    castSh(c, 10, 32, 42, P.pla, 3);
    // Etapa III: buhardilla con luz en el tejado y el tablón de reclutas.
    if (stage >= 3) {
      c.rect(28, 17, 11, 9, P.pla[2]); c.vline(28, 17, 9, P.pla[1]); c.vline(38, 17, 9, P.pla[3]); c.rect(30, 19, 7, 6, P.wod[4]); c.rect(31, 20, 5, 5, P.win[1]); c.vline(33, 20, 5, P.wod[3]); c.hline(31, 22, 5, P.wod[3]); c.px(31, 20, P.win[0]);
      c.poly([[25.5, 18], [33.5, 10], [41.5, 18], [41.5, 19], [25.5, 19]], (x, y) => (y >= 18 ? P.rnd[3] : x < 33 ? P.rnd[1] : P.rnd[2])); c.line(26, 18, 33, 11, P.rnd[0]);
      c.rect(89, 38, 2, 19, P.woo[3]); c.rect(97, 38, 2, 19, P.woo[3]); vol(c, 87, 32, 13, 12, P.woo, { side: 1, ao: 1 });
      for (const [x, y, col] of [[89, 34, '#fffbea'], [93, 35, '#f4e4bc'], [90, 39, '#ffe8a0'], [95, 39, '#fffbea']]) { c.rect(x, y, 3, 4, col); c.px(x + 1, y, P.red[1]); }
    }
    // BOOST (concepto, no implementado): hogar encendido. Todas las ventanas con luz, una gema en el dintel y la chimenea
    // con un brillo cálido. Sigue siendo una casa.
    if (boost) { gemSocket(c, 15, 22, true); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy ? '#fffbe0' : '#ffe8a0')); c.vline(wx - 1, wy - 3, 7, P.win[3]); c.hline(wx - 4, wy, 7, P.win[3]); c.rect(28, 34, 2, 3, '#fffbe0'); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}

// ================= LAB · 66 × 80 =================
// I · laboratorio modesto (se construye con 3 recetas): una planta, el ojo de buey con el experimento, chimenea de ventilación.
// II · Research Assistant: segunda planta con la mesa del investigador y el serpentín de su experimento.
// III · Advanced Research: la cúpula con el telescopio (elegir dirección de investigación) y la antena.
// IV · Strain Research: el invernadero de cepas con sus cultivos.
// Hueco reservado (sin dibujar): el anexo de FORBIDDEN GENETICS (fusión, mutaciones y linajes; entrega C de ratones, pendiente).
function labStage(stage, boost = false) {
  return evArt('l' + stage + boost, () => {
    const c = PB(68, 80), P = P2;
    // Etapa IV: invernadero de cepas a la derecha.
    if (stage >= 4) {
      vol(c, 47, 54, 19, 17, P.gla, { side: 1, ao: 0 }); for (let x = 51; x < 66; x += 5) c.vline(x, 54, 17, P.irn[2]); c.hline(47, 54, 19, P.irn[2]); c.hline(47, 62, 19, P.irn[2]);
      for (const [x, col] of [[49, ['#c8ffb0', '#7ae08a', '#3a9a50']], [57, ['#f0d0ff', '#b58cff', '#6a3ab0']]]) { c.rect(x, 63, 6, 7, col[2]); c.rect(x + 1, 64, 4, 3, col[1]); c.px(x + 1, 64, col[0]); c.rect(x, 62, 6, 1, P.irn[1]); }
      c.poly([[46, 54], [56, 48], [67, 54]], P.irn[2]); c.line(46, 54, 56, 48, P.irn[1]);
      stones2(c, 46, 70, 21, 9, P.stn, 3, 12);
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
