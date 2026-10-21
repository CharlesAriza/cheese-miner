// ---------- HOUSE · evolución V2 (propuesta) ----------
// I · La casa (se construye con la primera mejora): la casita de la cuña de queso.
// II · Casa de la colonia: la cuña crece en dos pisos (buhardilla con su ventana), zócalo de piedra labrada, puerta con aro
//      de latón, chimenea de ladrillo y un porche con banco y faroles. Disparador propuesto: reclutas de toda la partida.
// III · Gran madriguera: un torreón con tejado cónico de corteza y una gran vidriera redonda (la galería del álbum), una
//      pasarela y el patio con el muñeco de entrenar (TRAINING ROOM). Disparador propuesto: piezas del álbum.
// Los dos disparadores son contadores permanentes del juego que solo suben (no retroceden al despedir ni al cambiar de puesto).
function houseV2(stage) {
  return art('houseV2' + stage, () => {
    const off = stage >= 3 ? 24 : 0, W = stage >= 3 ? 110 : 80, c = PB(W, 76), P = PAL, G = 75, X = off;
    // ---- Torreón del álbum (III) ----
    if (stage >= 3) {
      cylv(c, 3, 34, 22, 34, P.stw, null);
      for (let y = 38; y < 66; y += 4) for (let x = 4; x < 24; x++) if (c.get(x, y)) c.px(x, y, mixc(c.get(x, y), '#000000', 0.18));
      c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [[0, 36], [14, 8], [28, 36]]), (x, y) => { const e = segDist(x + 0.5, y + 0.5, 0, 36, 14, 8); return e < 2.2 ? P.rnd[0] : x < 14 ? P.rnd[1] : P.rnd[2]; }, 0, 6, 29, 37);
      for (let y = 14; y < 36; y += 5) c.fill((x, yy) => yy === y && inPoly(x + 0.5, yy + 0.5, [[0, 36], [14, 8], [28, 36]]), P.rnd[3]);
      c.rect(13, 3, 2, 6, BRS[2]); c.ell(14, 3, 2.2, 2.2, BRS[1]);
      // Vidriera del álbum: plomos oscuros y vidrios de colores, con luz.
      const vx = 14, vy = 47; c.ell(vx, vy, 7.6, 7.6, P.stw[3]); c.ell(vx, vy, 6.4, 6.4, (x, y) => { const a = Math.atan2(y + 0.5 - vy, x + 0.5 - vx), s = ((a + Math.PI) / (Math.PI * 2)) * 6 | 0; return ['#ffd84a', '#e8523a', '#5a9cf0', '#62d36e', '#b58cff', '#ffa040'][s]; });
      c.ell(vx, vy, 2.4, 2.4, '#fff6b8'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 - Math.PI; c.line(vx + Math.cos(a) * 2.5, vy + Math.sin(a) * 2.5, vx + Math.cos(a) * 6, vy + Math.sin(a) * 6, P.stw[4]); }
      c.rect(9, 60, 10, 8, P.wod[2]); c.hline(9, 60, 10, P.wod[1]); c.vline(14, 61, 7, P.wod[4]);
      // Pasarela al primer piso de la casa.
      c.rect(24, 44, X + 8 - 24, 2, P.woo[1]); c.hline(24, 46, X + 8 - 24, P.woo[3]); for (let x = 26; x < X + 8; x += 4) c.vline(x, 40, 4, P.woo[2]); c.hline(24, 40, X + 8 - 24, P.woo[2]);
    }
    // ---- Chimenea de ladrillo ----
    vol(c, X + 54, 12, 7, 26, P.bri, { side: 2, ao: 0 }); for (let y = 15; y < 36; y += 3) c.hline(X + 55, y, 5, P.bri[3]); c.rect(X + 53, 10, 9, 2, P.stn[1]); c.hline(X + 53, 11, 9, P.stn[3]);
    // ---- Planta baja: piedra labrada abajo, revoco con entramado arriba ----
    stones2(c, X + 6, 52, 58, 16, P.stw, 4, 21);
    vol(c, X + 6, 40, 58, 12, P.pla, { side: 3, ao: 0 });
    for (const x of [X + 6, X + 33, X + 62]) { c.vline(x, 40, 12, P.woo[2]); c.vline(x + 1, 40, 12, P.woo[3]); }
    c.hline(X + 6, 40, 58, P.woo[2]); c.hline(X + 6, 51, 58, P.woo[3]);
    // Puerta redonda con aro de latón.
    const dc = X + 22, inA = (x, y, r) => (y >= 56 && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - 56) ** 2 <= r * r && y < 56);
    c.fill((x, y) => inA(x, y, 8) && y < 68, (x, y) => (x + y < dc + 52 ? BRS[1] : BRS[2]), dc - 9, 46, dc + 10, 68);
    c.fill((x, y) => inA(x, y, 6.4) && y < 68, (x, y) => (!inA(x - 1, y, 6.4) || !inA(x, y - 1, 6.4) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 7, 48, dc + 8, 68);
    c.rect(dc + 3, 58, 2, 2, P.gld[1]); c.rect(dc - 8, 67, 17, 2, P.stn[1]); c.hline(dc - 8, 67, 17, P.stn[0]);
    // Ventanas: redonda con luz y una alargada de cuarterones.
    const wx = X + 46, wy = 46;
    c.ell(wx, wy, 5.6, 5.6, (x, y) => (x + y < wx + wy - 2 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 3.7, 3.7, (x, y) => (y < wy - 1 ? P.win[1] : y < wy + 2 ? P.win[2] : P.win[3])); c.vline(wx - 1, wy - 3, 7, P.wod[3]); c.hline(wx - 4, wy, 7, P.wod[3]); c.px(wx - 3, wy - 2, P.win[0]);
    c.rect(X + 36, 55, 8, 9, P.wod[3]); c.rect(X + 37, 56, 6, 7, P.win[2]); c.rect(X + 37, 56, 6, 3, P.win[1]); c.vline(X + 40, 56, 7, P.wod[3]); c.hline(X + 37, 59, 6, P.wod[3]); vol(c, X + 35, 64, 10, 2, P.woo, { side: 0, ao: 0 });
    for (let i = 0; i < 4; i++) c.px(X + 36 + i * 2, 63, [P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]);
    // ---- Tejado: la cuña de abajo y la buhardilla (otra cuña más pequeña encima) ----
    const wedge = (A, B, C2, holes) => { c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [A, B, C2]), (x, y) => { const e1 = segDist(x + 0.5, y + 0.5, A[0], A[1], B[0], B[1]), e2 = segDist(x + 0.5, y + 0.5, B[0], B[1], C2[0], C2[1]); if (e1 < 2.3) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.3) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, A[0], B[1], C2[0] - A[0], A[1] - B[1]); }, Math.min(A[0], B[0]), B[1], C2[0] + 1, A[1] + 1); for (const [hx, hy, rx, ry] of holes) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1])); };
    wedge([X + 1, 41], [X + 22, 18], [X + 69, 41], [[X + 13, 35, 2.4, 1.6], [X + 50, 36, 2.6, 1.8], [X + 40, 30, 1.8, 1.2], [X + 58, 38, 1.6, 1.1]]);
    c.hline(X + 1, 41, 69, P.rnd[3]); c.hline(X + 2, 42, 67, P.rnd[4]);
    castSh(c, X + 8, 43, 54, P.pla, 3);
    // Buhardilla: su cuña, su ventana redonda con luz y su alero.
    wedge([X + 14, 28], [X + 30, 4], [X + 50, 28], [[X + 26, 13, 1.6, 1.1]]);
    c.hline(X + 14, 28, 37, P.rnd[3]);
    const ax = X + 33, ay = 20; c.ell(ax, ay, 4.4, 4.4, P.woo[2]); c.ell(ax, ay, 3, 3, (x, y) => (y < ay ? P.win[0] : P.win[2])); c.vline(ax, ay - 2, 5, P.wod[3]); c.hline(ax - 2, ay, 5, P.wod[3]);
    // ---- Porche con banco y faroles (descanso) ----
    vol(c, X + 64, 54, 14, 14, P.woo, { side: 1, ao: 1 }); for (let y = 57; y < 68; y += 3) c.hline(X + 65, y, 12, P.woo[3]);
    c.rect(X + 64, 44, 15, 3, P.woo[2]); c.hline(X + 64, 44, 15, P.woo[1]); c.vline(X + 77, 47, 7, P.woo[3]);
    c.rect(X + 66, 59, 10, 2, P.woo[1]); c.rect(X + 67, 61, 1, 3, P.woo[4]); c.rect(X + 74, 61, 1, 3, P.woo[4]);
    for (const lx of [X + 65, X + 76]) { c.rect(lx, 47, 2, 3, P.irn[3]); c.rect(lx, 48, 2, 2, P.win[1]); }
    // ---- Patio de entrenamiento (III): el muñeco de paja de la TRAINING ROOM ----
    if (stage >= 3) { const tx = X + 80; c.rect(tx + 2, 56, 2, 12, P.woo[3]); c.ell(tx + 3, 57, 3.4, 3.8, (x, y) => (y < 57 ? P.str[1] : P.str[2])); c.hline(tx - 1, 58, 9, P.str[3]); c.px(tx + 3, 56, P.red[1]); vol(c, tx - 2, 67, 10, 2, P.stw, { side: 0, ao: 0 }); }
    stones2(c, X + 4, 68, stage >= 3 ? 88 : 76, 8, P.stn, 3, 9);
    closeGaps(c); c.outline();
    return c.canvas();
  });
}
