// ---------- HOUSE · evolución V2 con los ajustes de composición (21-10-2026) ----------
// Mismo edificio que houseV2 (ev2_house.js, dirección aprobada) con cuatro arreglos:
// 1. La buhardilla es un volumen simétrico, con la cumbrera en su centro, y su ventana redonda va centrada debajo de la
//    cumbrera. Antes el triángulo era asimétrico (cumbrera en x 30 sobre una base de 14 a 50) y la ventana caía en x 33.
// 2. La torre del álbum se apoya en el mismo zócalo de piedra que la casa (antes el zócalo empezaba en x 28 y la torre
//    acababa 8 px por encima del suelo), con una hilada de piedra más ancha al pie y un escalón en su puerta.
// 3. La pasarela suelta se cambia por un cuerpo de unión: un muro de piedra del zócalo al alero, entre la torre y la casa.
// 4. Sombras de contacto: el pie de la torre y del cuerpo de unión se oscurece donde toca el zócalo, el alero arroja sombra
//    sobre el muro de unión y la ventana redonda de la planta baja se ve entera bajo el alero (antes el alero la cortaba).
function houseV3(stage) {
  return art('houseV3' + stage, () => {
    const off = stage >= 3 ? 24 : 0, W = stage >= 3 ? 110 : 80, c = PB(W, 76), P = PAL, X = off;
    const dark = (x0, y0, w, h, k) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (c.get(x, y)) c.px(x, y, mixc(c.get(x, y), '#000000', k)); };
    if (stage >= 3) {
      // ---- Cuerpo de unión (detrás de la torre y de la casa): muro de piedra del suelo al alero ----
      stones2(c, 19, 42, 14, 26, P.stw, 4, 23);
      castSh(c, 22, 43, 10, P.stw, 2);
      // ---- Torre del álbum ----
      cylv(c, 3, 34, 22, 34, P.stw, null);
      for (let y = 38; y < 62; y += 4) for (let x = 4; x < 24; x++) if (c.get(x, y)) c.px(x, y, mixc(c.get(x, y), '#000000', 0.18));
      c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [[0, 36], [14, 8], [28, 36]]), (x, y) => { const e = segDist(x + 0.5, y + 0.5, 0, 36, 14, 8); return e < 2.2 ? P.rnd[0] : x < 14 ? P.rnd[1] : P.rnd[2]; }, 0, 6, 29, 37);
      for (let y = 14; y < 36; y += 5) c.fill((x, yy) => yy === y && inPoly(x + 0.5, yy + 0.5, [[0, 36], [14, 8], [28, 36]]), P.rnd[3]);
      c.rect(13, 3, 2, 6, BRS[2]); c.ell(14, 3, 2.2, 2.2, BRS[1]);
      castSh(c, 4, 37, 20, P.stw, 2);
      // Hilada de piedra al pie, 1 px más ancha a cada lado: la torre pesa y se planta en el zócalo.
      c.rect(2, 62, 24, 6, P.stn[2]); c.hline(2, 62, 24, P.stn[1]); c.hline(2, 67, 24, P.stn[3]);
      for (let x = 5; x < 25; x += 5) c.vline(x, 63, 4, P.stn[3]); c.hline(3, 65, 22, P.stn[3]);
      // Vidriera del álbum.
      const vx = 14, vy = 47; c.ell(vx, vy, 7.6, 7.6, P.stw[3]); c.ell(vx, vy, 6.4, 6.4, (x, y) => { const a = Math.atan2(y + 0.5 - vy, x + 0.5 - vx), s = ((a + Math.PI) / (Math.PI * 2)) * 6 | 0; return ['#ffd84a', '#e8523a', '#5a9cf0', '#62d36e', '#b58cff', '#ffa040'][s]; });
      c.ell(vx, vy, 2.4, 2.4, '#fff6b8'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 - Math.PI; c.line(vx + Math.cos(a) * 2.5, vy + Math.sin(a) * 2.5, vx + Math.cos(a) * 6, vy + Math.sin(a) * 6, P.stw[4]); }
      // Puerta de la torre con su escalón (el hueco corta la hilada).
      c.rect(9, 58, 10, 10, P.wod[2]); c.hline(9, 58, 10, P.wod[1]); c.vline(14, 59, 9, P.wod[4]); c.rect(8, 67, 12, 1, P.stn[1]);
    }
    // ---- Chimenea de ladrillo ----
    vol(c, X + 54, 12, 7, 26, P.bri, { side: 2, ao: 0 }); for (let y = 15; y < 36; y += 3) c.hline(X + 55, y, 5, P.bri[3]); c.rect(X + 53, 10, 9, 2, P.stn[1]); c.hline(X + 53, 11, 9, P.stn[3]);
    // ---- Planta baja ----
    stones2(c, X + 6, 52, 58, 16, P.stw, 4, 21);
    vol(c, X + 6, 40, 58, 12, P.pla, { side: 3, ao: 0 });
    for (const x of [X + 6, X + 33, X + 62]) { c.vline(x, 40, 12, P.woo[2]); c.vline(x + 1, 40, 12, P.woo[3]); }
    c.hline(X + 6, 40, 58, P.woo[2]); c.hline(X + 6, 51, 58, P.woo[3]);
    const dc = X + 22, inA = (x, y, r) => (y >= 56 && Math.abs(x - dc) <= r) || ((x - dc) ** 2 + (y - 56) ** 2 <= r * r && y < 56);
    c.fill((x, y) => inA(x, y, 8) && y < 68, (x, y) => (x + y < dc + 52 ? BRS[1] : BRS[2]), dc - 9, 46, dc + 10, 68);
    c.fill((x, y) => inA(x, y, 6.4) && y < 68, (x, y) => (!inA(x - 1, y, 6.4) || !inA(x, y - 1, 6.4) ? P.wod[4] : (x - dc + 6) % 3 === 0 ? P.wod[3] : x < dc - 2 ? P.wod[1] : P.wod[2]), dc - 7, 48, dc + 8, 68);
    c.rect(dc + 3, 58, 2, 2, P.gld[1]); c.rect(dc - 8, 67, 17, 2, P.stn[1]); c.hline(dc - 8, 67, 17, P.stn[0]);
    // Ventana redonda entera entre las vigas (antes el alero tapaba su parte de arriba).
    const wx = X + 47, wy = 47;
    c.ell(wx, wy, 3.9, 3.9, (x, y) => (x + y < wx + wy - 1 ? P.woo[1] : P.woo[3])); c.ell(wx, wy, 2.6, 2.6, (x, y) => (y < wy ? P.win[1] : P.win[2])); c.vline(wx, wy - 2, 5, P.wod[3]); c.hline(wx - 2, wy, 5, P.wod[3]);
    c.rect(X + 36, 55, 8, 9, P.wod[3]); c.rect(X + 37, 56, 6, 7, P.win[2]); c.rect(X + 37, 56, 6, 3, P.win[1]); c.vline(X + 40, 56, 7, P.wod[3]); c.hline(X + 37, 59, 6, P.wod[3]); vol(c, X + 35, 64, 10, 2, P.woo, { side: 0, ao: 0 });
    for (let i = 0; i < 4; i++) c.px(X + 36 + i * 2, 63, [P.red[1], P.gld[1], '#ff9ab5', P.red[1]][i]);
    // ---- Tejado: la cuña grande y la buhardilla simétrica ----
    const wedge = (A, B, C2, holes) => { c.fill((x, y) => inPoly(x + 0.5, y + 0.5, [A, B, C2]), (x, y) => { const e1 = segDist(x + 0.5, y + 0.5, A[0], A[1], B[0], B[1]), e2 = segDist(x + 0.5, y + 0.5, B[0], B[1], C2[0], C2[1]); if (e1 < 2.3) return e1 < 1.1 ? P.rnd[0] : P.rnd[1]; if (e2 < 2.3) return e2 < 1.1 ? P.rnd[2] : P.rnd[3]; return faceTone(P.chz, x, y, A[0], B[1], C2[0] - A[0], A[1] - B[1]); }, Math.min(A[0], B[0]), B[1], C2[0] + 1, A[1] + 1); for (const [hx, hy, rx, ry] of holes) c.ell(hx, hy, rx, ry, (x, y) => (y + 0.5 < hy - ry * 0.2 ? P.chz[4] : y + 0.5 < hy + ry * 0.45 ? P.chz[3] : P.chz[1])); };
    wedge([X + 1, 41], [X + 22, 18], [X + 69, 41], [[X + 13, 35, 2.4, 1.6], [X + 52, 36, 2.6, 1.8], [X + 58, 38, 1.6, 1.1]]);
    c.hline(X + 1, 41, 69, P.rnd[3]); c.hline(X + 2, 42, 67, P.rnd[4]);
    castSh(c, X + 8, 43, 54, P.pla, 3);
    // Buhardilla: base de X+14 a X+46, cumbrera en X+30 (el centro); tapa la punta de la cuña grande.
    const ax = X + 30;
    wedge([ax - 16, 28], [ax, 4], [ax + 16, 28], [[ax - 7, 23, 1.6, 1.1]]);
    c.hline(ax - 16, 28, 33, P.rnd[3]); castSh(c, ax - 14, 29, 29, P.chz, 1);
    const ay = 18; c.ell(ax, ay, 4.4, 4.4, P.woo[2]); c.ell(ax, ay, 3, 3, (x, y) => (y < ay ? P.win[0] : P.win[2])); c.vline(ax, ay - 2, 5, P.wod[3]); c.hline(ax - 2, ay, 5, P.wod[3]);
    // ---- Porche con banco y faroles ----
    vol(c, X + 64, 54, 14, 14, P.woo, { side: 1, ao: 1 }); for (let y = 57; y < 68; y += 3) c.hline(X + 65, y, 12, P.woo[3]);
    c.rect(X + 64, 44, 15, 3, P.woo[2]); c.hline(X + 64, 44, 15, P.woo[1]); c.vline(X + 77, 47, 7, P.woo[3]);
    c.rect(X + 66, 59, 10, 2, P.woo[1]); c.rect(X + 67, 61, 1, 3, P.woo[4]); c.rect(X + 74, 61, 1, 3, P.woo[4]);
    for (const lx of [X + 65, X + 76]) { c.rect(lx, 47, 2, 3, P.irn[3]); c.rect(lx, 48, 2, 2, P.win[1]); }
    if (stage >= 3) { const tx = X + 80; c.rect(tx + 2, 56, 2, 12, P.woo[3]); c.ell(tx + 3, 57, 3.4, 3.8, (x, y) => (y < 57 ? P.str[1] : P.str[2])); c.hline(tx - 1, 58, 9, P.str[3]); c.px(tx + 3, 56, P.red[1]); vol(c, tx - 2, 67, 10, 2, P.stw, { side: 0, ao: 0 }); }
    // ---- Zócalo común: en la fase III corre bajo la torre, el cuerpo de unión y la casa ----
    if (stage >= 3) stones2(c, 1, 68, 107, 8, P.stn, 3, 9); else stones2(c, X + 4, 68, 76, 8, P.stn, 3, 9);
    // Contacto: la última fila de cada muro, más oscura donde se apoya en el zócalo.
    if (stage >= 3) { dark(2, 66, 6, 1, 0.22); dark(20, 66, 6, 1, 0.22); dark(26, 65, 6, 2, 0.18); }
    closeGaps(c); c.outline();
    return c.canvas();
  });
}
